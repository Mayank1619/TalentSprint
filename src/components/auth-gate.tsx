"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LockKeyhole, PlayCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { canAccess, roleLabel, type Role } from "@/lib/auth";

export function AuthGate({
  allowedRoles,
  children,
  description,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
  description: string;
}) {
  const { user, startGuestPractice } = useAuth();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const canUseGuestPractice =
    allowedRoles.length === 1 && allowedRoles.includes("candidate") && description.toLowerCase().includes("practice");

  async function handleGuestPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await startGuestPractice({ name: guestName, email: guestEmail });
    setMessage(result.message);
  }

  if (!user) {
    return (
      <main className="page-shell">
        <section className={`access-card ${canUseGuestPractice ? "guest-access-card" : ""}`}>
          <LockKeyhole />
          <h1>Sign in required</h1>
          <p>{description}</p>

          {canUseGuestPractice && (
            <form className="auth-form guest-practice-form" method="post" onSubmit={handleGuestPractice}>
              <label>
                Name for leaderboard
                <input
                  autoComplete="name"
                  name="guest-name"
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Candidate Name"
                  required
                  type="text"
                  value={guestName}
                />
              </label>
              <label>
                Email
                <input
                  autoComplete="email"
                  name="guest-email"
                  onChange={(event) => setGuestEmail(event.target.value)}
                  placeholder="candidate@example.com"
                  required
                  type="email"
                  value={guestEmail}
                />
              </label>
              <button className="button primary" type="submit">
                <PlayCircle size={18} /> Practice as guest
              </button>
              {message && <div className="auth-message">{message}</div>}
            </form>
          )}

          <Link className="button primary" href="/login">
            <UserPlus size={18} /> Log in or register
          </Link>
        </section>
      </main>
    );
  }

  if (!canAccess(user.role, allowedRoles)) {
    return (
      <main className="page-shell">
        <section className="access-card">
          <LockKeyhole />
          <h1>Access denied</h1>
          <p>
            You are signed in as {roleLabel(user.role)}. This area requires{" "}
            {allowedRoles.map(roleLabel).join(" or ")} access.
          </p>
          <Link className="button secondary" href="/login">
            Log in with another account
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
