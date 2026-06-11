import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Code2,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { questionBankTargets } from "@/lib/mock-data";

const docs = [
  {
    title: "Candidate guide",
    icon: Code2,
    detail:
      "Register, sign in, practice as a guest or candidate, run samples, submit solutions, and read the report.",
  },
  {
    title: "Examiner guide",
    icon: FileCheck2,
    detail:
      "Create an assessment, select questions, choose report email rules, invite candidates, and review outcomes.",
  },
  {
    title: "Admin guide",
    icon: UsersRound,
    detail:
      "Create examiners, disable access, review users, manage the library, and keep privileged actions separated.",
  },
  {
    title: "Security guide",
    icon: ShieldCheck,
    detail:
      "Understand authentication, role authorization, fullscreen trial behavior, CI gates, and future sandbox needs.",
  },
];

const workflow = [
  "Admin creates examiner access from the admin board.",
  "Examiner builds a test from assessment-enabled questions.",
  "Candidate receives an invite and starts the timed assessment.",
  "Candidate submits code before the timer or auto-submit deadline.",
  "Reports are generated and optionally emailed to the candidate and examiner.",
];

export default function DocsPage() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Documentation</p>
        <h1>Operate Talent Sprint with clear role boundaries.</h1>
        <p>
          These guides explain how the prototype works today and how examiners and administrators
          should maintain tests, questions, users, reports, and email settings.
        </p>
      </section>

      <section className="feature-grid docs-card-grid">
        {docs.map((doc) => {
          const Icon = doc.icon;
          return (
            <article key={doc.title}>
              <Icon />
              <h2>{doc.title}</h2>
              <p>{doc.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="docs-layout">
        <aside className="docs-index">
          <BookOpenCheck />
          <h2>Guides</h2>
          <Link href="/docs/question-authoring">
            Question authoring <ArrowRight size={15} />
          </Link>
          <Link href="/about">
            About the platform <ArrowRight size={15} />
          </Link>
        </aside>

        <div className="docs-sections">
          <section className="docs-section">
            <h2>Assessment workflow</h2>
            <div className="timeline wide">
              {workflow.map((item, index) => (
                <div className="timeline-item" key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="docs-section">
            <h2>Question bank coverage</h2>
            <div className="docs-table">
              {questionBankTargets.map((target) => (
                <div key={target.category}>
                  <strong>{target.category}</strong>
                  <span>{target.targetCount}+ starter questions</span>
                </div>
              ))}
            </div>
          </section>

          <section className="docs-section">
            <h2>Email behavior</h2>
            <p>
              Candidate report emails and examiner report emails are controlled by the examiner
              when creating a test. Password reset and verification emails are handled by Supabase
              Auth, while report emails use the configured app email provider.
            </p>
          </section>

          <section className="docs-section">
            <h2>Access rules</h2>
            <p>
              Candidates cannot open examiner or administrator pages. Examiners are invited by an
              administrator and cannot self-register. Administrators control examiner lifecycle and
              question-library maintenance.
            </p>
          </section>
        </div>
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          Documentation describes the current prototype and the intended operating model. Any
          production rollout should pair these workflows with hosted database policies, audit logs,
          sandboxed execution, and monitored CI security gates.
        </p>
      </section>

      <section className="toolbar-band">
        <span>
          <Mail size={16} /> Report email settings live in the examiner builder
        </span>
        <Link className="button primary" href="/docs/question-authoring">
          Open question guide
        </Link>
      </section>
    </main>
  );
}
