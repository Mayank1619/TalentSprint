"use client";

import { LockKeyhole, Shield, UserRoundCog, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { demoUsers, roleLabel } from "@/lib/auth";

const roleIcons = {
  candidate: UserRoundCheck,
  examiner: UserRoundCog,
  administrator: Shield,
};

const roleDescriptions = {
  candidate:
    "Practice questions, open invitations, complete timed assessments, and review score summaries.",
  examiner: "Create tests, send candidate invitations, review attempts, and inspect detailed results.",
  administrator: "Manage examiner access, platform settings, and question-library governance.",
};

export default function LoginPage() {
  const { user, signIn } = useAuth();

  return (
    <main className="page-shell auth-page">
      <section className="page-heading compact">
        <p className="eyebrow text-only">Access</p>
        <h1>Sign in to Talent Sprint.</h1>
        <p>
          This prototype uses demo roles with client-side authorization. Supabase Auth will replace
          these entry points when credentials are configured.
        </p>
      </section>

      {user && (
        <section className="signed-in-banner">
          Signed in as <strong>{user.name}</strong> with {roleLabel(user.role)} access.
        </section>
      )}

      <section className="auth-grid">
        {demoUsers.map((demoUser) => {
          const Icon = roleIcons[demoUser.role];
          return (
            <article key={demoUser.id}>
              <Icon size={28} />
              <h2>{roleLabel(demoUser.role)}</h2>
              <p>{roleDescriptions[demoUser.role]}</p>
              <button className="button secondary" onClick={() => signIn(demoUser.id)} type="button">
                Continue as {roleLabel(demoUser.role)}
              </button>
            </article>
          );
        })}
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          Production auth will enforce verified email, role assignments, rate limiting, row-level
          data access, and audit events.
        </p>
      </section>
    </main>
  );
}
