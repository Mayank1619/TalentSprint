"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { EmailActionButton } from "@/components/email-action-button";
import { useAuth } from "@/components/auth-provider";
import { formatDuration, getLatestAssessmentAttempts } from "@/lib/attempt-store";

export function CandidateReportExperience() {
  const { user } = useAuth();
  const attempts = useMemo(() => (user ? getLatestAssessmentAttempts(user.id) : []), [user]);

  if (!user || attempts.length === 0) {
    return (
      <main className="page-shell">
        <section className="access-card">
          <Clock3 />
          <h1>No assessment submission yet</h1>
          <p>Submit an assessment question to generate your score summary.</p>
          <Link className="button primary" href="/assessment">
            <ArrowLeft size={18} /> Open assessment
          </Link>
        </section>
      </main>
    );
  }

  const latestSubmittedAt = attempts
    .map((attempt) => attempt.submittedAt)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const totalScore = Math.round(
    attempts.reduce((sum, attempt) => sum + attempt.result.score, 0) / attempts.length,
  );
  const averageQuality = Math.round(
    attempts.reduce((sum, attempt) => sum + attempt.result.codeQualityScore, 0) / attempts.length,
  );
  const averageComplexity = Math.round(
    attempts.reduce((sum, attempt) => sum + attempt.result.complexityScore, 0) / attempts.length,
  );
  const totalTimeSeconds = attempts.reduce((sum, attempt) => sum + attempt.timeTakenSeconds, 0);
  const passedQuestions = attempts.filter((attempt) => attempt.result.status === "passed").length;

  return (
    <main className="page-shell">
      <section className="report-header">
        <div>
          <p className="eyebrow text-only">Candidate report</p>
          <h1>Your score summary</h1>
          <p>Consultant Core Coding Screen · {new Date(latestSubmittedAt).toLocaleString()}</p>
        </div>
        <div className="report-actions">
          <EmailActionButton
            candidateId={user.id}
            kind="candidate-report"
            label="Email my summary"
            to={user.email}
          />
        </div>
      </section>

      <section className="stat-grid">
        <article>
          <BarChart3 />
          <span>{totalScore}%</span>
          <p>Total score</p>
        </article>
        <article>
          <CalendarCheck />
          <span>
            {passedQuestions}/{attempts.length}
          </span>
          <p>Questions passed</p>
        </article>
        <article>
          <Clock3 />
          <span>{formatDuration(totalTimeSeconds)}</span>
          <p>Total attempt time</p>
        </article>
        <article>
          <Gauge />
          <span>{averageQuality}%</span>
          <p>Code quality</p>
        </article>
        <article>
          <ShieldCheck />
          <span>{averageComplexity}%</span>
          <p>Complexity score</p>
        </article>
      </section>

      <section className="report-summary candidate-safe">
        <article>
          <h2>Summary</h2>
          <p>
            This report is generated from your submitted assessment code and shows summary-level
            scoring only.
          </p>
          <p>
            You submitted {attempts.length} question{attempts.length === 1 ? "" : "s"} in{" "}
            {formatDuration(totalTimeSeconds)}.
          </p>
        </article>
        <article>
          <h2>What went well</h2>
          <p>
            {passedQuestions > 0
              ? `${passedQuestions} submitted question(s) passed all checks.`
              : "Keep iterating on visible sample behavior before the next attempt."}
          </p>
          <p>Average code quality score: {averageQuality}%.</p>
        </article>
        <article>
          <h2>Next practice areas</h2>
          <p>Review failed visible checks and complexity notes from each submitted question.</p>
          <p>Practice translating edge cases into small unit tests before final submission.</p>
        </article>
      </section>

      <section className="report-questions candidate-safe">
        {attempts.map((attempt) => (
          <article className="report-question compact" key={attempt.id}>
            <div className="table-heading">
              <div>
                <h2>{attempt.questionTitle}</h2>
                <span>
                  {attempt.language} · submitted {new Date(attempt.submittedAt).toLocaleTimeString()}
                </span>
              </div>
              <span
                className={`status-pill ${
                  attempt.result.status === "passed"
                    ? "success"
                    : attempt.result.status === "partial"
                      ? "warning"
                      : "error"
                }`}
              >
                {attempt.result.score}%
              </span>
            </div>
            <div className="outcome-list report-metric-list">
              <div className="outcome-row">
                <span>
                  <strong>Time spent</strong>
                  <small>Measured from opening this question to final submit</small>
                </span>
                <span className="status-pill">
                  <Clock3 size={14} /> {formatDuration(attempt.timeTakenSeconds)}
                </span>
              </div>
              <div className="outcome-row">
                <span>
                  <strong>Visible checks</strong>
                  <small>Candidate-facing samples only</small>
                </span>
                <span className="status-pill success">
                  <CheckCircle2 size={14} /> {attempt.result.visiblePassed}/{attempt.result.visibleTotal}
                </span>
              </div>
              <div className="outcome-row">
                <span>
                  <strong>Estimated complexity</strong>
                  <small>{attempt.result.complexityNotes[0] ?? "Complexity analysis unavailable."}</small>
                </span>
                <span className="status-pill">{attempt.result.complexityLabel}</span>
              </div>
              <div className="outcome-row">
                <span>
                  <strong>Code quality</strong>
                  <small>Maintainability, structure, and guard clauses</small>
                </span>
                <span className="status-pill success">{attempt.result.codeQualityScore}%</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="security-note">
        <ShieldCheck />
        <p>
          Candidate reports intentionally show summary-level feedback only. Hidden tests and
          examiner-only diagnostics are protected.
        </p>
      </section>
    </main>
  );
}
