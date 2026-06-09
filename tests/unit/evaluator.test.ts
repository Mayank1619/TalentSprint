import { describe, expect, it } from "vitest";
import { evaluateCode } from "@/lib/evaluator";
import { questions } from "@/lib/mock-data";

describe("evaluateCode", () => {
  const pairSum = questions.find((question) => question.id === "pair-sum")!;

  it("fails empty starter-code submissions", () => {
    const result = evaluateCode(pairSum, "Python", pairSum.starterCode.Python);

    expect(result.score).toBe(0);
    expect(result.status).toBe("failed");
    expect(result.visiblePassed).toBe(0);
  });

  it("scores implemented submissions from configured checks", () => {
    const result = evaluateCode(
      pairSum,
      "Python",
      "def pair_sum(nums, target):\n  seen = {}\n  for item in nums:\n    if target - item in seen:\n      return [seen[target-item], item]\n    seen[item] = item\n  return None",
    );

    expect(result.total).toBe(4);
    expect(result.correctnessScore).toBeGreaterThan(0);
    expect(result.timeBonus).toBe(0);
  });

  it("adds a capped speed bonus for assessment submissions", () => {
    const result = evaluateCode(
      pairSum,
      "Python",
      "def pair_sum(nums, target):\n  seen = {}\n  for item in nums:\n    return target",
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
