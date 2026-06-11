"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Clock3, Gauge, Medal, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { formatDuration, getLatestAttempt } from "@/lib/attempt-store";
import type { Question } from "@/lib/mock-data";

export function PracticeReportExperience({ question }: { question: Question }) {
  const { user } = useAuth();
  const attempt = useMemo(
    () => (user ? getLatestAttempt(user.id, question.id) : undefined),
    [question.id, user],
  );

  if (!attempt) {
    return (
      <main className="page-shell">
        <section className="access-card">
          <Clock3 />
          <h1>No submission yet</h1>
          <p>
            Reports are generated from your actual submitted code. Open the workspace, run your
            solution, and submit to create a report.
          </p>
          <Link className="button primary" href={`/practice/${question.id}`}>
            <ArrowLeft size={18} /> Open workspace
          </Link>
        </section>
      </main>
    );
  }

  const result = attempt.result;
  const rankDelta = result.score >= 90 ? "+7" : result.score >= 70 ? "+4" : result.score > 0 ? "+1" : "0";

  return (
    <main className="page-shell">
      <section className="report-header">
        <Link className="button ghost" href={`/practice/${question.id}`}>
          <ArrowLeft size={18} /> Workspace
        </Link>
        <div>
          <p className="eyebrow text-only">Practice report</p>
          <h1>{question.title}</h1>
          <p>
            Generated from your latest submission on {new Date(attempt.submittedAt).toLocaleString()}.
          </p>
        </div>
        <div className="report-actions">
          <Link className="button primary" href="/leaderboard">
            <Medal size={18} /> Leaderboard
          </Link>
          <Link className="button secondary" href="/practice">
            <RotateCcw size={18} /> Back to questions
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        <article>
          <BarChart3 />
          <span>{result.score}%</span>
          <p>Practice score</p>
        </article>
        <article>
          <CheckCircle2 />
          <span>
            {result.visiblePassed}/{result.visibleTotal}
          </span>
          <p>Visible samples</p>
        </article>
        <article>
          <Clock3 />
          <span>{formatDuration(attempt.timeTakenSeconds)}</span>
          <p>Actual solve time</p>
        </article>
        <article>
          <Medal />
          <span>{rankDelta}</span>
          <p>Leaderboard movement</p>
        </article>
        <article>
          <Gauge />
          <span>{result.complexityLabel}</span>
          <p>Estimated complexity</p>
        </article>
      </section>

      <section className="report-summary">
        <article>
          <h2>Summary</h2>
          <p>
            {result.status === "passed"
              ? "Your latest submission passed every configured visible and hidden check."
              : result.status === "partial"
                ? "Your latest submission passed some checks, but still has failed cases to review."
                : "Your latest submission did not pass the configured checks yet."}
          </p>
        </article>
        <article>
          <h2>Submission</h2>
          <p>
            {attempt.language} · {result.provider} · {result.passed}/{result.total} checks passed.
          </p>
          <p>Correctness score: {result.correctnessScore}%.</p>
          <p>Code quality score: {result.codeQualityScore}%.</p>
          <p>Complexity score: {result.complexityScore}%.</p>
        </article>
        <article>
          <h2>Complexity notes</h2>
          {result.complexityNotes.slice(0, 3).map((note) => (
            <p key={note}>{note}</p>
          ))}
        </article>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <h2>Evaluation outcomes</h2>
          <span>Visible checks are candidate-facing; hidden checks affect score.</span>
        </div>
        <div className="result-table">
          {result.outcomes.map((outcome) => (
            <div className="table-row practice-report-row" key={outcome.id}>
              <span>{outcome.visibility === "visible" ? "Visible" : "Hidden"}</span>
              <span>
                <strong>{outcome.name}</strong>
                <small>{outcome.feedback}</small>
              </span>
              <span className={`status-pill ${outcome.status === "passed" ? "success" : "error"}`}>
                {outcome.status === "passed" ? "Passed" : "Failed"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
