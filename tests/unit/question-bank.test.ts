import { describe, expect, it } from "vitest";
import { assessmentQuestions, practiceLeaderboard, practiceQuestions, questions } from "@/lib/mock-data";

describe("question bank visibility", () => {
  it("keeps assessment-only questions out of practice", () => {
    expect(practiceQuestions.length).toBeGreaterThan(10);
    expect(practiceQuestions.every((question) => question.visibility !== "assessment")).toBe(true);
  });

  it("keeps practice-only questions out of assessments", () => {
    expect(assessmentQuestions.length).toBeGreaterThan(10);
    expect(assessmentQuestions.every((question) => question.visibility !== "practice")).toBe(true);
  });

  it("contains a large mixed bank and leaderboard", () => {
    expect(questions.length).toBeGreaterThanOrEqual(30);
    expect(practiceLeaderboard[0].rank).toBe(1);
  });
});
