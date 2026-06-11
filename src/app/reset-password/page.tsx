"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await updatePassword(password, confirmPassword);
    setMessage(result.message);
  }

  return (
    <main className="page-shell auth-page">
      <section className="page-heading compact">
        <p className="eyebrow text-only">Password reset</p>
        <h1>Choose a new password.</h1>
        <p>Use the reset link from your email, then set a new password for your Talent Sprint account.</p>
      </section>

      <section className="auth-layout compact-auth-layout">
        <div className="auth-panel">
          <form className="auth-form" method="post" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="new-password">New password</label>
              <span className="password-field">
                <input
                  autoComplete="new-password"
                  id="new-password"
                  name="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <span className="password-field">
                <input
                  autoComplete="new-password"
                  id="confirm-new-password"
                  name="confirm-new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  aria-label={showConfirmPassword ? "Hide confirm new password" : "Show confirm new password"}
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </div>

            <button className="button primary" type="submit">
              <Save size={18} /> Update password
            </button>
            {message && <div className="auth-message">{message}</div>}
          </form>
        </div>

        <aside className="system-card auth-helper">
          <KeyRound />
          <h2>Secure reset</h2>
          <p>Reset links are managed by Supabase Auth and expire automatically.</p>
          <Link className="inline-link" href="/login">
            Back to login
          </Link>
        </aside>
      </section>
    </main>
  );
}
