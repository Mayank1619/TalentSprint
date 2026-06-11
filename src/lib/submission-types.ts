import type { Language } from "@/lib/mock-data";

export type TestVisibility = "visible" | "hidden";
export type TestOutcome = {
  id: string;
  name: string;
  visibility: TestVisibility;
  status: "passed" | "failed";
  feedback: string;
  durationMs: number;
};

export type EvaluationResult = {
  provider: "local-static" | "external-runner";
  passed: number;
  total: number;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  score: number;
  correctnessScore: number;
  codeQualityScore: number;
  complexityScore: number;
  complexityLabel: string;
  complexityNotes: string[];
  timeBonus: number;
  timeTakenLabel?: string;
  status: "passed" | "partial" | "failed";
  feedback: string[];
  outcomes: TestOutcome[];
};

export type CandidateAttempt = {
  id: string;
  candidateId: string;
  candidateName: string;
  questionId: string;
  questionTitle: string;
  language: Language;
  code: string;
  mode: "practice" | "assessment";
  startedAt: string;
  submittedAt: string;
  timeLimitSeconds?: number;
  timeTakenSeconds: number;
  result: EvaluationResult;
};
