"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ServerCog, UserPlus, UserRoundCheck } from "lucide-react";
import { AuthNotice } from "@/components/auth-notice";
import type { AuthResult } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { roleHomePath, roleLabel } from "@/lib/auth";
import { getRememberedEmail, getRememberMePreference } from "@/lib/auth-preferences";

export default function LoginPage() {
  const router = useRouter();
  const { authMode, user, signIn, signOut, registerCandidate } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [notice, setNotice] = useState<AuthResult | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setRememberMe(getRememberMePreference());
      setLoginEmail((current) => current || getRememberedEmail());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await signIn(loginEmail, loginPassword, { rememberMe });
    setNotice(result);
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
    setNotice(result);
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
          Candidates can register to practice and submit solutions. Examiner accounts are created by
          an administrator and receive an email link to set their password.
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
                setNotice(null);
              }}
              type="button"
            >
              <LockKeyhole size={16} /> Log in
            </button>
            <button
              className={mode === "register" ? "selected" : ""}
              onClick={() => {
                setMode("register");
                setNotice(null);
              }}
              type="button"
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          <AuthNotice notice={notice} />

          {mode === "login" ? (
            <form className="auth-form" method="post" onSubmit={handleLogin}>
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
              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <span className="password-field">
                  <input
                    autoComplete="current-password"
                    id="login-password"
                    name="password"
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="Password123!"
                    required
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                  />
                  <button
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    className="password-toggle"
                    onClick={() => setShowLoginPassword((current) => !current)}
                    type="button"
                  >
                    {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </div>
              <Link className="inline-link auth-secondary-link" href="/forgot-password">
                Forgot password?
              </Link>
              <label className="checkbox-row">
                <input
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  type="checkbox"
                />
                <span>Remember me on this device</span>
              </label>
              <button className="button primary" type="submit">
                <UserRoundCheck size={18} /> Log in
              </button>
            </form>
          ) : (
            <form className="auth-form" method="post" onSubmit={handleRegister}>
              <label>
                Full name
                <input
                  autoComplete="name"
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Candidate Name"
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
              <div className="auth-field">
                <label htmlFor="register-password">Password</label>
                <span className="password-field">
                  <input
                    autoComplete="new-password"
                    id="register-password"
                    name="password"
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                  />
                  <button
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    className="password-toggle"
                    onClick={() => setShowRegisterPassword((current) => !current)}
                    type="button"
                  >
                    {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </div>
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <span className="password-field">
                  <input
                    autoComplete="new-password"
                    id="confirm-password"
                    name="confirm-password"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                  />
                  <button
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </div>
              <button className="button primary" type="submit">
                <UserPlus size={18} /> Create candidate account
              </button>
            </form>
          )}
        </div>

        <aside className="system-card auth-helper">
          <ServerCog />
          <h2>Authentication provider</h2>
          {authMode === "postgres" ? (
            <p>
              Self-hosted Postgres auth is active. Candidate registration creates a real auth user,
              sessions are managed by Better Auth, and examiner access is admin-invited.
            </p>
          ) : (
            <>
              <p>
                Postgres auth is not enabled in this deployment, so the app is using local
                development auth for testing.
              </p>
              <p>Set NEXT_PUBLIC_AUTH_MODE=postgres and DATABASE_URL to enable production auth.</p>
            </>
          )}
        </aside>
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          Candidate registration assigns candidate access automatically. Examiner access is granted
          only from the administrator workspace, while administrator access is limited to configured
          master admins or users with administrator metadata.
        </p>
      </section>
    </main>
  );
}
