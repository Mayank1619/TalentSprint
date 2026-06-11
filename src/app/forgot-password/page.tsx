"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await requestPasswordReset(email);
    setMessage(result.message);
  }

  return (
    <main className="page-shell auth-page">
      <section className="page-heading compact">
        <p className="eyebrow text-only">Password reset</p>
        <h1>Send a reset link.</h1>
        <p>Enter your candidate, examiner, or administrator email and Talent Sprint will send a secure reset link.</p>
      </section>

      <section className="auth-layout compact-auth-layout">
        <div className="auth-panel">
          <form className="auth-form" method="post" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <button className="button primary" type="submit">
              <Send size={18} /> Send reset link
            </button>
            {message && <div className="auth-message">{message}</div>}
          </form>
        </div>

        <aside className="system-card auth-helper">
          <Mail />
          <h2>Check your inbox</h2>
          <p>The reset link opens the password update page. It only works after Supabase email delivery is configured.</p>
          <Link className="inline-link" href="/login">
            Back to login
          </Link>
        </aside>
      </section>
    </main>
  );
}
