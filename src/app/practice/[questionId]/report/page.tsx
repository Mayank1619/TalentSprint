import { notFound } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { PracticeReportExperience } from "@/components/practice-report-experience";
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

  return (
    <AuthGate allowedRoles={["candidate"]} description="Practice reports require candidate access.">
      <PracticeReportExperience question={question} />
    </AuthGate>
  );
}
