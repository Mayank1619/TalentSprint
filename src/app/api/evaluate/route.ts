import { NextResponse } from "next/server";
import { evaluateSubmission } from "@/lib/challenge-evaluator";
import { evaluateWithSandbox } from "@/lib/execution-evaluator";
import { questions, type Language } from "@/lib/mock-data";

type EvaluateRequest = {
  questionId?: string;
  language?: Language;
  code?: string;
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as EvaluateRequest;
  const question = questions.find((item) => item.id === payload.questionId);

  if (!question || !payload.language || typeof payload.code !== "string") {
    return NextResponse.json(
      { ok: false, message: "Question, language, and code are required." },
      { status: 400 },
    );
  }

  const options = {
    assessmentMode: payload.assessmentMode,
    durationSeconds: payload.durationSeconds,
    secondsRemaining: payload.secondsRemaining,
  };
  const result =
    (await evaluateWithSandbox(question, payload.language, payload.code, options)) ??
    evaluateSubmission(question, payload.language, payload.code, options);

  return NextResponse.json({ ok: true, result });
}
