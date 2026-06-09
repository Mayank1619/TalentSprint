import type { Language, Question } from "@/lib/mock-data";

export type EvaluationResult = {
  passed: number;
  total: number;
  score: number;
  correctnessScore: number;
  timeBonus: number;
  timeTakenLabel?: string;
  status: "passed" | "partial" | "failed";
  feedback: string[];
};

type EvaluationOptions = {
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
};

export function evaluateCode(
  question: Question,
  language: Language,
  code: string,
  options: EvaluationOptions = {},
): EvaluationResult {
  const normalized = code.toLowerCase();
  const signals = [...getSignals(question.id, language), ...question.tags, ...question.title.split(" ")];
  const matched = signals.filter((signal) => normalized.includes(signal.toLowerCase())).length;
  const total = question.sampleTests.length;
  const passed = Math.min(total, matched);
  const correctnessScore = Math.round((passed / total) * 100);
  const timeBonus = options.assessmentMode
    ? calculateTimeBonus(options.durationSeconds ?? 0, options.secondsRemaining ?? 0, correctnessScore)
    : 0;
  const score = Math.min(100, correctnessScore + timeBonus);

  return {
    passed,
    total,
    correctnessScore,
    timeBonus,
    score,
    timeTakenLabel: options.assessmentMode
      ? formatTimeTaken(options.durationSeconds ?? 0, options.secondsRemaining ?? 0)
      : undefined,
    status: passed === total ? "passed" : passed > 0 ? "partial" : "failed",
    feedback: question.sampleTests.map((test, index) => {
      const ok = index < passed;
      return `${ok ? "Passed" : "Failed"}: ${test}`;
    }),
  };
}

function getSignals(questionId: string, language: Language) {
  const common: Record<string, string[]> = {
    "pair-sum": ["target", "return", "for"],
    "valid-parentheses": ["stack", "return", "for"],
    "employee-score": ["group", "average", "return"],
  };

  const languageSignals: Record<Language, string[]> = {
    Java: ["map", "stack", "list"],
    Python: ["dict", "stack", "for"],
    "C#": ["dictionary", "stack", "linq"],
  };

  return [...(common[questionId] ?? ["return"]), ...languageSignals[language]];
}

function calculateTimeBonus(durationSeconds: number, secondsRemaining: number, correctnessScore: number) {
  if (durationSeconds <= 0 || correctnessScore <= 0) return 0;
  const remainingRatio = Math.max(0, Math.min(1, secondsRemaining / durationSeconds));
  const confidenceMultiplier = correctnessScore / 100;
  return Math.round(remainingRatio * 10 * confidenceMultiplier);
}

function formatTimeTaken(durationSeconds: number, secondsRemaining: number) {
  const usedSeconds = Math.max(0, durationSeconds - Math.max(0, secondsRemaining));
  const minutes = Math.floor(usedSeconds / 60);
  const seconds = usedSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
