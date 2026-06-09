import { BarChart3, CalendarCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { EmailActionButton } from "@/components/email-action-button";
import { detailedReports } from "@/lib/mock-data";

export default function CandidateReportPage() {
  const report = detailedReports[0];

  return (
    <AuthGate allowedRoles={["candidate"]} description="Candidate reports require candidate access.">
      <main className="page-shell">
        <section className="report-header">
          <div>
            <p className="eyebrow text-only">Candidate report</p>
            <h1>Your score summary</h1>
            <p>
              {report.assessmentTitle} · {report.submittedAt}
            </p>
          </div>
          <div className="report-actions">
            <EmailActionButton
              candidateId={report.candidateId}
              kind="candidate-report"
              label="Email my summary"
              to={report.candidateEmail}
            />
          </div>
        </section>

        <section className="stat-grid">
          <article>
            <BarChart3 />
            <span>{report.score}%</span>
            <p>Total score</p>
          </article>
          <article>
            <CalendarCheck />
            <span>{report.status}</span>
            <p>Status</p>
          </article>
          <article>
            <FileCheck2 />
            <span>{report.questions.length}</span>
            <p>Questions submitted</p>
          </article>
          <article>
            <ShieldCheck />
            <span>Summary</span>
            <p>Hidden details protected</p>
          </article>
        </section>

        <section className="report-summary candidate-safe">
          <article>
            <h2>Summary</h2>
            <p>{report.summary}</p>
          </article>
          <article>
            <h2>What went well</h2>
            {report.strengths.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article>
            <h2>Next practice areas</h2>
            <p>Review stack-based parsing and input-validation patterns before the next assessment.</p>
            <p>Practice translating edge cases into unit tests before final submission.</p>
          </article>
        </section>

        <section className="security-note">
          <ShieldCheck />
          <p>
            Candidate reports intentionally show summary-level feedback only. Hidden tests and
            examiner-only diagnostics are protected.
          </p>
        </section>
      </main>
    </AuthGate>
  );
}
