import Link from "next/link";
import { BarChart3, Mail, PlusCircle, ShieldCheck, UsersRound } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { ExaminerAssessmentBuilder } from "@/components/examiner-assessment-builder";
import { candidateResults, questions } from "@/lib/mock-data";

export default function ExaminerPage() {
  const completed = candidateResults.filter((candidate) => candidate.status === "Completed").length;
  const average =
    candidateResults
      .filter((candidate) => candidate.score !== null)
      .reduce((sum, candidate) => sum + (candidate.score ?? 0), 0) /
    candidateResults.filter((candidate) => candidate.score !== null).length;

  return (
    <AuthGate
      allowedRoles={["examiner", "administrator"]}
      description="Examiner reporting requires examiner or administrator access."
    >
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow text-only">Examiner console</p>
          <h1>Create tests, send invites, and review outcomes.</h1>
          <p>
            Configure test content, decide who receives completion reports, and review scored
            submissions from one role-gated workspace.
          </p>
        </section>

        <section className="stat-grid">
          <article>
            <UsersRound />
            <span>{candidateResults.length}</span>
            <p>Invited candidates</p>
          </article>
          <article>
            <ShieldCheck />
            <span>{completed}</span>
            <p>Completed attempts</p>
          </article>
          <article>
            <BarChart3 />
            <span>{Math.round(average)}%</span>
            <p>Average scored attempts</p>
          </article>
          <article>
            <PlusCircle />
            <span>{questions.length}</span>
            <p>Question library items</p>
          </article>
        </section>

        <section className="toolbar-band">
          <a className="button primary" href="#assessment-builder-heading">
            <PlusCircle size={18} /> Build assessment
          </a>
          <Link className="button secondary" href="/examiner/reports/cand-001">
            <Mail size={18} /> Open detailed report
          </Link>
        </section>

        <ExaminerAssessmentBuilder />

        <section className="table-card">
          <div className="table-heading">
            <h2>Candidate results</h2>
            <span>Role-gated detailed attempt review</span>
          </div>
          <div className="result-table">
            <div className="table-row header">
              <span>Candidate</span>
              <span>Status</span>
              <span>Language</span>
              <span>Score</span>
              <span>Submitted</span>
            </div>
            {candidateResults.map((candidate) => (
              <div className="table-row" key={candidate.id}>
                <span>
                  <strong>{candidate.name}</strong>
                  <small>{candidate.email}</small>
                </span>
                <span className={`status-pill ${candidate.status.toLowerCase().replace(" ", "-")}`}>
                  {candidate.status}
                </span>
                <span>{candidate.language ?? "-"}</span>
                <span>{candidate.score === null ? "-" : `${candidate.score}%`}</span>
                <span>
                  {candidate.submittedAt ?? "-"}
                  {candidate.status === "Completed" && (
                    <Link className="inline-link" href={`/examiner/reports/${candidate.id}`}>
                      Report
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
