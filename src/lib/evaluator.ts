import type { Language, Question } from "@/lib/mock-data";

export type EvaluationResult = {
  passed: number;
  total: number;
  score: number;
  status: "passed" | "partial" | "failed";
  feedback: string[];
};

export function evaluateCode(question: Question, language: Language, code: string): EvaluationResult {
  const normalized = code.toLowerCase();
  const signals = getSignals(question.id, language);
  const matched = signals.filter((signal) => normalized.includes(signal.toLowerCase())).length;
  const total = question.sampleTests.length;
  const passed = Math.min(total, matched);
  const score = Math.round((passed / total) * 100);

  return {
    passed,
    total,
    score,
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
