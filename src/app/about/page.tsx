import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Clock3,
  Code2,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { assessmentQuestions, practiceQuestions, questionBankTargets, questions } from "@/lib/mock-data";

const lifecycle = [
  "Candidates register or receive an assessment invite.",
  "Examiners choose questions, email settings, and test rules.",
  "Candidates solve timed coding questions in Java, Python, or C#.",
  "Submissions are scored using visible checks, hidden checks, code quality, complexity, and time taken.",
  "Reports are shown in the app and can be emailed to candidates and examiners.",
];

const roles = [
  {
    title: "Candidate",
    icon: Code2,
    detail:
      "Practices questions, takes assigned assessments, reviews score summaries, and appears on practice leaderboards.",
  },
  {
    title: "Examiner",
    icon: FileCheck2,
    detail:
      "Creates tests from the library, controls report emails, reviews attempts, and inspects detailed outcomes.",
  },
  {
    title: "Administrator",
    icon: UsersRound,
    detail:
      "Manages examiners, maintains the question bank, reviews platform settings, and controls privileged access.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">About Talent Sprint</p>
        <h1>A technical screening platform for consultant readiness.</h1>
        <p>
          Talent Sprint is designed for organizations that need a practical, role-based way to
          assess Java, Python, C#, algorithms, and data structure skills before placing consultants
          on client work.
        </p>
      </section>

      <section className="stat-grid">
        <article>
          <BookOpenCheck />
          <span>{questions.length}</span>
          <p>Total questions</p>
        </article>
        <article>
          <Code2 />
          <span>{practiceQuestions.length}</span>
          <p>Practice-enabled</p>
        </article>
        <article>
          <BadgeCheck />
          <span>{assessmentQuestions.length}</span>
          <p>Assessment-enabled</p>
        </article>
        <article>
          <ShieldCheck />
          <span>{questionBankTargets.length}</span>
          <p>Core sections</p>
        </article>
      </section>

      <section className="section unframed-section">
        <div className="section-heading left">
          <p className="eyebrow text-only">How it works</p>
          <h2>From invite to report in a controlled workflow.</h2>
        </div>
        <div className="timeline wide">
          {lifecycle.map((item, index) => (
            <div className="timeline-item" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-grid docs-card-grid">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <article key={role.title}>
              <Icon />
              <h2>{role.title}</h2>
              <p>{role.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="report-summary">
        <article>
          <h2>Scoring model</h2>
          <p>
            Candidate code is evaluated against configured checks. The prototype score blends
            correctness, code quality, estimated time complexity, and speed bonus so empty or
            superficial submissions do not receive passing marks.
          </p>
        </article>
        <article>
          <h2>Assessment controls</h2>
          <p>
            Timers, role-based access, hidden test outcomes, report visibility, and email delivery
            settings are separated between candidate, examiner, and administrator surfaces.
          </p>
        </article>
        <article>
          <h2>Current prototype scope</h2>
          <p>
            Authentication, reporting, email hooks, CI checks, and local browser execution are in
            place. Production-grade remote code execution should use a sandboxed execution provider.
          </p>
        </article>
      </section>

      <section className="security-note">
        <LockKeyhole />
        <p>
          Fullscreen assessment mode is being tried on an internal feature branch as a friction
          signal. It should complement secure identity, audit logs, randomized questions, and
          sandboxed execution rather than replace them.
        </p>
      </section>

      <section className="toolbar-band">
        <span>
          <Clock3 size={16} /> Timed tests
        </span>
        <span>
          <BarChart3 size={16} /> Detailed reporting
        </span>
        <span>
          <Mail size={16} /> Email delivery
        </span>
        <Link className="button primary" href="/docs">
          Read documentation
        </Link>
      </section>
    </main>
  );
}
