import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardCheck, Clock3, Mail, ShieldCheck } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { EmailActionButton } from "@/components/email-action-button";
import { getDetailedReport } from "@/lib/mock-data";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const report = getDetailedReport(candidateId);

  return (
    <AuthGate
      allowedRoles={["examiner", "administrator"]}
      description="Detailed reports require examiner or administrator access."
    >
      <main className="page-shell">
        <section className="report-header">
          <Link className="button ghost" href="/examiner">
            <ArrowLeft size={18} /> Back
          </Link>
          <div>
            <p className="eyebrow text-only">Detailed report</p>
            <h1>{report.candidateName}</h1>
            <p>
              {report.assessmentTitle} · {report.submittedAt}
            </p>
          </div>
          <div className="report-actions">
            <EmailActionButton
              candidateId={report.candidateId}
              kind="candidate-report"
              label="Email candidate summary"
              to={report.candidateEmail}
            />
            <EmailActionButton
              candidateId={report.candidateId}
              kind="examiner-report"
              label="Email examiner report"
              to={report.examinerEmail}
            />
            <EmailActionButton kind="question-set" label="Email question set" to={report.examinerEmail} />
          </div>
        </section>

        <section className="stat-grid">
          <article>
            <BarChart3 />
            <span>{report.score}%</span>
            <p>Total score</p>
          </article>
          <article>
            <Clock3 />
            <span>{report.durationUsed}</span>
            <p>Duration used</p>
          </article>
          <article>
            <ClipboardCheck />
            <span>{report.questions.length}</span>
            <p>Questions submitted</p>
          </article>
          <article>
            <ShieldCheck />
            <span>{report.status}</span>
            <p>Report status</p>
          </article>
        </section>

        <section className="report-summary">
          <article>
            <h2>Summary</h2>
            <p>{report.summary}</p>
          </article>
          <article>
            <h2>Strengths</h2>
            {report.strengths.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article>
            <h2>Concerns</h2>
            {report.concerns.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
        </section>

        <section className="report-questions">
          {report.questions.map((question) => (
            <article className="report-question" key={question.questionId}>
              <div className="table-heading">
                <div>
                  <h2>{question.title}</h2>
                  <span>
                    {question.language} · {question.score}/{question.maxScore} points
                  </span>
                </div>
                <span className="status-pill success">
                  {question.visiblePassed}/{question.visibleTotal} visible · {question.hiddenPassed}/
                  {question.hiddenTotal} hidden
                </span>
              </div>
              <div className="report-question-grid">
                <pre>{question.submittedCode}</pre>
                <div className="outcome-list">
                  <div className="outcome-row">
                    <span>
                      <strong>Code quality</strong>
                      <small>Maintainability, naming, decomposition, and guard clauses</small>
                    </span>
                    <span className="status-pill success">{question.codeQualityScore}%</span>
                  </div>
                  <div className="outcome-row">
                    <span>
                      <strong>Time complexity</strong>
                      <small>{question.complexityNotes.join(" ")}</small>
                    </span>
                    <span className="status-pill">{question.complexityLabel}</span>
                  </div>
                  <div className="outcome-row">
                    <span>
                      <strong>Complexity score</strong>
                      <small>Estimated fit against expected Big-O for the prompt</small>
                    </span>
                    <span className="status-pill success">{question.complexityScore}%</span>
                  </div>
                  {question.outcomes.map((outcome) => (
                    <div className="outcome-row" key={outcome.name}>
                      <span>
                        <strong>{outcome.name}</strong>
                        <small>
                          {outcome.visibility} · {outcome.durationMs}ms
                        </small>
                      </span>
                      <span className={`status-pill ${outcome.status === "Passed" ? "success" : "error"}`}>
                        {outcome.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="security-note">
          <Mail />
          <p>
            Candidate emails receive a summary only. Examiner emails include submitted code and test
            outcomes. Hidden test definitions are never emailed.
          </p>
        </section>
      </main>
    </AuthGate>
  );
}
