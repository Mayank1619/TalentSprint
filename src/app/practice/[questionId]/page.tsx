import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, Clock3, ListChecks } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { CodeWorkspace } from "@/components/code-workspace";
import { getPracticeQuestion, practiceQuestions } from "@/lib/mock-data";

export function generateStaticParams() {
  return practiceQuestions.map((question) => ({ questionId: question.id }));
}

export default async function PracticeSolvePage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getPracticeQuestion(questionId);

  if (!question) notFound();

  return (
    <AuthGate allowedRoles={["candidate"]} description="Practice workspaces require candidate access.">
      <main className="page-shell">
        <section className="report-header">
          <Link className="button ghost" href="/practice">
            <ArrowLeft size={18} /> Questions
          </Link>
          <div>
            <p className="eyebrow text-only">Practice workspace</p>
            <h1>{question.title}</h1>
            <p>
              Step 2: solve the selected question on its own screen. Run visible samples before
              final submit, then open the practice report.
            </p>
          </div>
          <div className="report-actions">
            <Link className="button secondary" href="/leaderboard">
              <BarChart3 size={18} /> Leaderboard
            </Link>
          </div>
        </section>

        <section className="practice-context">
          <span>
            <ListChecks size={16} /> {question.category}
          </span>
          <span>
            <Clock3 size={16} /> Expected {question.estimatedMinutes} minutes
          </span>
          <span>
            <BarChart3 size={16} /> {question.points} points
          </span>
        </section>

        <CodeWorkspace
          key={question.id}
          question={question}
          redirectOnSubmit
          submissionHref={`/practice/${question.id}/report`}
          submissionLinkLabel="Open practice report"
        />
      </main>
    </AuthGate>
  );
}
