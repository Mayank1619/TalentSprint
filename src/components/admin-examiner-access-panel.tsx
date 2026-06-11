"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MailPlus, Pencil, ShieldCheck, ShieldOff, Trash2, UserCog, X } from "lucide-react";
import { AuthNotice } from "@/components/auth-notice";
import type { AuthResult } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { roleLabel, type ManagedUser } from "@/lib/auth";

export function AdminExaminerAccessPanel() {
  const { authMode, listManagedUsers, inviteExaminer, updateExaminer, setExaminerAccess, removeExaminer } =
    useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<AuthResult | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const hasLoadedRef = useRef(false);

  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      setUsers(await listManagedUsers());
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setIsLoading(false);
    }
  }, [listManagedUsers]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    listManagedUsers()
      .then(setUsers)
      .catch((error) => setNotice({ ok: false, message: formatError(error) }))
      .finally(() => setIsLoading(false));
  }, [listManagedUsers]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId("invite");
    try {
      const result = await inviteExaminer({ name, email });
      setNotice(result);
      if (result.ok) {
        setName("");
        setEmail("");
        await refreshUsers();
      }
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  function startEditing(user: ManagedUser) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setNotice(null);
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;

    setBusyId(editingUser.id);
    try {
      const result = await updateExaminer(editingUser.id, { name: editName, email: editEmail });
      setNotice(result);
      if (result.ok) {
        setEditingUser(null);
        await refreshUsers();
      }
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleAccessChange(examiner: ManagedUser, enabled: boolean) {
    setBusyId(examiner.id);
    try {
      const result = await setExaminerAccess(examiner.id, enabled);
      setNotice(result);
      if (result.ok) await refreshUsers();
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(examiner: ManagedUser) {
    setBusyId(examiner.id);
    try {
      const result = await removeExaminer(examiner.id);
      setNotice(result);
      if (result.ok) await refreshUsers();
    } catch (error) {
      setNotice({ ok: false, message: formatError(error) });
    } finally {
      setBusyId(null);
    }
  }

  const examinerCount = useMemo(() => users.filter((user) => user.role === "examiner").length, [users]);
  const activeExaminerCount = useMemo(
    () => users.filter((user) => user.role === "examiner" && user.status === "active").length,
    [users],
  );

  return (
    <section className="admin-access-grid">
      <div className="auth-panel examiner-access-panel">
        <div className="table-heading">
          <div>
            <h2>User management</h2>
            <span>Review all users, create examiners, and manage examiner access</span>
          </div>
          <span className="status-pill">{activeExaminerCount}/{examinerCount} examiners active</span>
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

        {editingUser && (
          <form className="auth-form examiner-edit-form" method="post" onSubmit={handleEdit}>
            <div className="table-heading compact-heading">
              <div>
                <h3>Edit examiner</h3>
                <span>{editingUser.email}</span>
              </div>
              <button
                aria-label="Cancel examiner edit"
                className="icon-button"
                onClick={() => setEditingUser(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <label>
              Examiner name
              <input
                autoComplete="name"
                name="edit-examiner-name"
                onChange={(event) => setEditName(event.target.value)}
                required
                type="text"
                value={editName}
              />
            </label>
            <label>
              Examiner email
              <input
                autoComplete="email"
                name="edit-examiner-email"
                onChange={(event) => setEditEmail(event.target.value)}
                required
                type="email"
                value={editEmail}
              />
            </label>
            <button className="button primary" disabled={busyId === editingUser.id} type="submit">
              <Pencil size={18} /> Save examiner
            </button>
          </form>
        )}

        <div className="examiner-list" aria-live="polite">
          {isLoading ? (
            <p className="empty-state-row">Loading users.</p>
          ) : users.length === 0 ? (
            <p className="empty-state-row">No users have been created yet.</p>
          ) : (
            users.map((user) => (
              <article className="examiner-row" key={user.id}>
                <div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <div className="tag-row">
                    <span>{roleLabel(user.role)}</span>
                    <span>{user.status === "active" ? "Active" : "Disabled"}</span>
                    {user.lastSignInAt ? <span>Last sign-in {formatDate(user.lastSignInAt)}</span> : null}
                    {user.invitedAt ? <span>Invited {formatDate(user.invitedAt)}</span> : null}
                  </div>
                </div>
                <div className="library-actions">
                  {user.role === "examiner" && (
                    <>
                      <button
                        aria-label={`Edit ${user.name}`}
                        className="icon-button"
                        disabled={busyId === user.id}
                        onClick={() => startEditing(user)}
                        title="Edit examiner"
                        type="button"
                      >
                        <Pencil size={18} />
                      </button>
                      {user.status === "active" ? (
                        <button
                          aria-label={`Disable ${user.name}`}
                          className="icon-button"
                          disabled={busyId === user.id}
                          onClick={() => handleAccessChange(user, false)}
                          title="Disable access"
                          type="button"
                        >
                          <ShieldOff size={18} />
                        </button>
                      ) : (
                        <button
                          aria-label={`Enable ${user.name}`}
                          className="icon-button"
                          disabled={busyId === user.id}
                          onClick={() => handleAccessChange(user, true)}
                          title="Enable access"
                          type="button"
                        >
                          <ShieldCheck size={18} />
                        </button>
                      )}
                      <button
                        aria-label={`Remove ${user.name}`}
                        className="icon-button danger"
                        disabled={busyId === user.id}
                        onClick={() => handleRemove(user)}
                        title="Remove access"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
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
