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
    expect(questions.length).toBeGreaterThanOrEqual(65);
    expect(practiceLeaderboard[0].rank).toBe(1);
  });

  it("covers language-depth consultant skills across Java, Python, and C#", () => {
    expectQuestionsFor("Java", [
      "OOP",
      "Abstraction",
      "Streams",
      "Lambdas",
      "Generics",
      "Collections",
      "Multithreading",
      "Concurrency",
    ]);
    expectQuestionsFor("Python", [
      "OOP",
      "Abstraction",
      "Lambdas",
      "Generics",
      "Collections",
      "Asyncio",
      "Threads",
    ]);
    expectQuestionsFor("C#", [
      "OOP",
      "Abstraction",
      "LINQ",
      "Lambdas",
      "Generics",
      "Collections",
      "Threading",
      "Concurrency",
    ]);
  });
});

function expectQuestionsFor(language: "Java" | "Python" | "C#", requiredTags: string[]) {
  const languageQuestions = questions.filter((question) => question.tags.includes(language));
  expect(languageQuestions.length).toBeGreaterThanOrEqual(10);

  for (const tag of requiredTags) {
    expect(languageQuestions.some((question) => question.tags.includes(tag))).toBe(true);
  }
}
