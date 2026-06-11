"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MailPlus, ShieldCheck, ShieldOff, Trash2, UserCog } from "lucide-react";
import { AuthNotice } from "@/components/auth-notice";
import type { AuthResult } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import type { ManagedExaminer } from "@/lib/auth";

export function AdminExaminerAccessPanel() {
  const { authMode, listManagedExaminers, inviteExaminer, setExaminerAccess, removeExaminer } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<AuthResult | null>(null);
  const [examiners, setExaminers] = useState<ManagedExaminer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refreshExaminers = useCallback(async () => {
    setIsLoading(true);
    try {
      setExaminers(await listManagedExaminers());
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setIsLoading(false);
    }
  }, [listManagedExaminers]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    listManagedExaminers()
      .then(setExaminers)
      .catch((error) => setNotice({ ok: false, message: formatError(error) }))
      .finally(() => setIsLoading(false));
  }, [listManagedExaminers]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId("invite");
    try {
      const result = await inviteExaminer({ name, email });
      setNotice(result);
      if (result.ok) {
        setName("");
        setEmail("");
        await refreshExaminers();
      }
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleAccessChange(examiner: ManagedExaminer, enabled: boolean) {
    setBusyId(examiner.id);
    try {
      const result = await setExaminerAccess(examiner.id, enabled);
      setNotice(result);
      if (result.ok) await refreshExaminers();
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(examiner: ManagedExaminer) {
    setBusyId(examiner.id);
    try {
      const result = await removeExaminer(examiner.id);
      setNotice(result);
      if (result.ok) await refreshExaminers();
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = useMemo(
    () => examiners.filter((examiner) => examiner.status === "active").length,
    [examiners],
  );

  return (
    <section className="admin-access-grid">
      <div className="auth-panel examiner-access-panel">
        <div className="table-heading">
          <div>
            <h2>Examiner access</h2>
            <span>Invite, disable, or remove examiner accounts from one admin workspace</span>
          </div>
          <span className="status-pill">{activeCount} active</span>
        </div>

        <AuthNotice notice={notice} />

        <form className="auth-form examiner-invite-form" method="post" onSubmit={handleInvite}>
          <label>
            Examiner name
            <input
              autoComplete="name"
              name="examiner-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Examiner Name"
              required
              type="text"
              value={name}
            />
          </label>
          <label>
            Examiner email
            <input
              autoComplete="email"
              name="examiner-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="examiner@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <button className="button primary" disabled={busyId === "invite"} type="submit">
            <MailPlus size={18} /> Invite examiner
          </button>
        </form>

        <div className="examiner-list" aria-live="polite">
          {isLoading ? (
            <p className="empty-state-row">Loading examiner access.</p>
          ) : examiners.length === 0 ? (
            <p className="empty-state-row">No examiner accounts have been invited yet.</p>
          ) : (
            examiners.map((examiner) => (
              <article className="examiner-row" key={examiner.id}>
                <div>
                  <h3>{examiner.name}</h3>
                  <p>{examiner.email}</p>
                  <div className="tag-row">
                    <span>{examiner.status === "active" ? "Active" : "Disabled"}</span>
                    {examiner.lastSignInAt ? <span>Last sign-in {formatDate(examiner.lastSignInAt)}</span> : null}
                    {examiner.invitedAt ? <span>Invited {formatDate(examiner.invitedAt)}</span> : null}
                  </div>
                </div>
                <div className="library-actions">
                  {examiner.status === "active" ? (
                    <button
                      aria-label={`Disable ${examiner.name}`}
                      className="icon-button"
                      disabled={busyId === examiner.id}
                      onClick={() => handleAccessChange(examiner, false)}
                      title="Disable access"
                      type="button"
                    >
                      <ShieldOff size={18} />
                    </button>
                  ) : (
                    <button
                      aria-label={`Enable ${examiner.name}`}
                      className="icon-button"
                      disabled={busyId === examiner.id}
                      onClick={() => handleAccessChange(examiner, true)}
                      title="Enable access"
                      type="button"
                    >
                      <ShieldCheck size={18} />
                    </button>
                  )}
                  <button
                    aria-label={`Remove ${examiner.name}`}
                    className="icon-button danger"
                    disabled={busyId === examiner.id}
                    onClick={() => handleRemove(examiner)}
                    title="Remove access"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <aside className="system-card examiner-policy-card">
        <UserCog />
        <h2>Access policy</h2>
        <p>
          Candidate accounts can self-register. Examiner accounts are admin-invited only and receive a
          secure email link to set their password.
        </p>
        <div className="readiness-list">
          <span>Mode: {authMode === "supabase" ? "Supabase admin API" : "Local demo auth"}</span>
          <span>Master admin: metadata role or configured admin email</span>
          <span>Disabled examiners cannot sign in</span>
        </div>
      </aside>
    </section>
  );
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Unable to complete examiner access request.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}
