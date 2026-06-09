"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck, UserPlus, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { roleHomePath, roleLabel } from "@/lib/auth";

const reviewerAccounts = [
  { email: "candidate@talentsprint.dev", role: "candidate" },
  { email: "examiner@talentsprint.dev", role: "examiner" },
  { email: "admin@talentsprint.dev", role: "administrator" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, registerCandidate } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = signIn(loginEmail, loginPassword);
    setMessage(result.message);
    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
    }
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = registerCandidate({
      name,
      email: registerEmail,
      password: registerPassword,
      confirmPassword,
    });
    setMessage(result.message);
    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
    }
  }

  return (
    <main className="page-shell auth-page">
      <section className="page-heading compact">
        <p className="eyebrow text-only">Secure access</p>
        <h1>Log in or create a candidate account.</h1>
        <p>
          Register as a candidate to practice and submit solutions. Existing examiner and admin
          accounts land directly in their role-specific workspaces after login.
        </p>
      </section>

      {user && (
        <section className="signed-in-banner">
          Signed in as <strong>{user.name}</strong> with {roleLabel(user.role)} access.{" "}
          <Link className="inline-link" href={roleHomePath(user.role)}>
            Go to my workspace
          </Link>
        </section>
      )}

      <section className="auth-layout">
        <div className="auth-panel">
          <div className="auth-tabs" aria-label="Authentication mode">
            <button
              className={mode === "login" ? "selected" : ""}
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
              type="button"
            >
              <LockKeyhole size={16} /> Log in
            </button>
            <button
              className={mode === "register" ? "selected" : ""}
              onClick={() => {
                setMode("register");
                setMessage(null);
              }}
              type="button"
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="candidate@talentsprint.dev"
                  required
                  type="email"
                  value={loginEmail}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Password123!"
                  required
                  type="password"
                  value={loginPassword}
                />
              </label>
              <button className="button primary" type="submit">
                <UserRoundCheck size={18} /> Log in
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Full name
                <input
                  autoComplete="name"
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Mayank Candidate"
                  required
                  type="text"
                  value={name}
                />
              </label>
              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="candidate@example.com"
                  required
                  type="email"
                  value={registerEmail}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="new-password"
                  name="password"
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={registerPassword}
                />
              </label>
              <label>
                Confirm password
                <input
                  autoComplete="new-password"
                  name="confirm-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>
              <button className="button primary" type="submit">
                <UserPlus size={18} /> Create candidate account
              </button>
            </form>
          )}

          {message && <div className="auth-message">{message}</div>}
        </div>

        <aside className="system-card auth-helper">
          <ShieldCheck />
          <h2>Reviewer accounts</h2>
          <p>Use these seeded accounts to test each role. Password for all reviewer accounts:</p>
          <code>Password123!</code>
          <div className="readiness-list">
            {reviewerAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setMode("login");
                  setLoginEmail(account.email);
                  setLoginPassword("Password123!");
                  setMessage(`${roleLabel(account.role)} credentials filled.`);
                }}
                type="button"
              >
                {roleLabel(account.role)}
                <small>{account.email}</small>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          This deployment uses browser-persisted prototype accounts until the free hosted database
          and server-side auth provider are connected. Role guards and redirects are active in the
          app flow.
        </p>
      </section>
    </main>
  );
}
