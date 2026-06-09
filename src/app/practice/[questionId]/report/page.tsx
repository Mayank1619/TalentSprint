import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, CheckCircle2, Clock3, Medal, RotateCcw } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { getPracticeQuestion, practiceQuestions } from "@/lib/mock-data";

export function generateStaticParams() {
  return practiceQuestions.map((question) => ({ questionId: question.id }));
}

export default async function PracticeReportPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getPracticeQuestion(questionId);

  if (!question) notFound();

  const score = Math.min(100, 72 + (question.points % 21));
  const visiblePassed = Math.max(1, question.sampleTests.length - (question.difficulty === "Hard" ? 1 : 0));
  const rankDelta = question.difficulty === "Easy" ? "+2" : question.difficulty === "Medium" ? "+4" : "+7";

  return (
    <AuthGate allowedRoles={["candidate"]} description="Practice reports require candidate access.">
      <main className="page-shell">
        <section className="report-header">
          <Link className="button ghost" href={`/practice/${question.id}`}>
            <ArrowLeft size={18} /> Workspace
          </Link>
          <div>
            <p className="eyebrow text-only">Practice report</p>
            <h1>{question.title}</h1>
            <p>
              Candidate-facing practice summary. The detailed answer history remains internal to
              examiner reporting once this becomes a real persisted submission.
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
            <span>{score}%</span>
            <p>Practice score</p>
          </article>
          <article>
            <CheckCircle2 />
            <span>
              {visiblePassed}/{question.sampleTests.length}
            </span>
            <p>Visible samples</p>
          </article>
          <article>
            <Clock3 />
            <span>{question.estimatedMinutes - 2}m</span>
            <p>Demo solve time</p>
          </article>
          <article>
            <Medal />
            <span>{rankDelta}</span>
            <p>Leaderboard movement</p>
          </article>
        </section>

        <section className="report-summary">
          <article>
            <h2>Summary</h2>
            <p>
              Your submission shows working progress on {question.category.toLowerCase()} concepts
              and keeps the expected time target within reach.
            </p>
          </article>
          <article>
            <h2>What went well</h2>
            <p>Visible sample coverage is strong enough to continue into a timed assessment drill.</p>
            <p>Tags practiced: {question.tags.join(", ")}.</p>
          </article>
          <article>
            <h2>Next step</h2>
            <p>Review the leaderboard for benchmark pace, then return to the bank for another topic.</p>
          </article>
        </section>

        <section className="table-card">
          <div className="table-heading">
            <h2>Practice samples</h2>
            <span>Candidate report only shows visible samples in this prototype</span>
          </div>
          <div className="result-table">
            {question.sampleTests.map((sample, index) => (
              <div className="table-row practice-report-row" key={sample}>
                <span>Sample {index + 1}</span>
                <span>{sample}</span>
                <span className={`status-pill ${index < visiblePassed ? "success" : "warning"}`}>
                  {index < visiblePassed ? "Passed" : "Review"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
