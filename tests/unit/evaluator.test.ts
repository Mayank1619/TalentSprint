import { describe, expect, it } from "vitest";
import { evaluateCode } from "@/lib/evaluator";
import { assessmentQuestions } from "@/lib/mock-data";

describe("evaluateCode", () => {
  it("scores visible sample correctness", () => {
    const question = assessmentQuestions[0];
    const result = evaluateCode(
      question,
      "Python",
      "def pair_sum(input):\n  target = 9\n  for item in input:\n    return []",
    );

    expect(result.total).toBe(question.sampleTests.length);
    expect(result.correctnessScore).toBeGreaterThan(0);
    expect(result.timeBonus).toBe(0);
  });

  it("adds a capped speed bonus for assessment submissions", () => {
    const question = assessmentQuestions[0];
    const result = evaluateCode(
      question,
      "Python",
      "def pair_sum(input):\n  target = 9\n  for item in input:\n    return []",
      {
        assessmentMode: true,
        durationSeconds: 45 * 60,
        secondsRemaining: 45 * 60,
      },
    );

    expect(result.timeBonus).toBeLessThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.timeTakenLabel).toBe("0m 00s");
  });
});
