import Link from "next/link";
import { LockKeyhole, Shield, UserRoundCog, UserRoundCheck } from "lucide-react";

const roles = [
  {
    title: "Candidate",
    icon: UserRoundCheck,
    body: "Practice questions, open invitations, complete timed assessments, and review score summaries.",
  },
  {
    title: "Examiner",
    icon: UserRoundCog,
    body: "Create tests, send candidate invitations, review attempts, and inspect detailed results.",
  },
  {
    title: "Administrator",
    icon: Shield,
    body: "Manage examiner access, platform settings, and question-library governance.",
  },
];

export default function LoginPage() {
  return (
    <main className="page-shell auth-page">
      <section className="page-heading compact">
        <p className="eyebrow text-only">Access</p>
        <h1>Sign in to Talent Sprint.</h1>
        <p>
          This prototype shows the role split. Supabase Auth will replace the mock entry points when
          credentials are configured.
        </p>
      </section>

      <section className="auth-grid">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <article key={role.title}>
              <Icon size={28} />
              <h2>{role.title}</h2>
              <p>{role.body}</p>
              <Link className="button secondary" href={role.title === "Candidate" ? "/practice" : "/examiner"}>
                Continue as {role.title}
              </Link>
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
