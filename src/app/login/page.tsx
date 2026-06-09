"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ServerCog, UserPlus, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { roleHomePath, roleLabel } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { authMode, user, signIn, signOut, registerCandidate } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await signIn(loginEmail, loginPassword);
    setMessage(result.message);
    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await registerCandidate({
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
          <button className="inline-action" onClick={async () => signOut()} type="button">
            Sign out
          </button>
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
                  placeholder="you@example.com"
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
          <ServerCog />
          <h2>Authentication provider</h2>
          {authMode === "supabase" ? (
            <p>
              Supabase Auth is active. Candidate registration creates a real auth user, and login
              sessions are managed by Supabase.
            </p>
          ) : (
            <>
              <p>
                Supabase environment variables are not configured in this deployment, so the app is
                using local development auth for testing.
              </p>
              <p>Configure Supabase to turn this into production authentication.</p>
            </>
          )}
        </aside>
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          Candidate registration assigns candidate access automatically. Examiner and administrator
          roles should be granted in the auth provider by setting user metadata role values.
        </p>
      </section>
    </main>
  );
}
