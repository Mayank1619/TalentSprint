import { describe, expect, it } from "vitest";
import { isEmail, parseEmailList } from "@/lib/assessment-config-store";

describe("assessment email settings helpers", () => {
  it("parses comma, semicolon, and newline separated candidate emails", () => {
    expect(parseEmailList("Ada@example.com, grace@example.com\nlinus@example.com; ")).toEqual([
      "ada@example.com",
      "grace@example.com",
      "linus@example.com",
    ]);
  });

  it("validates report recipient email addresses", () => {
    expect(isEmail("candidate@example.com")).toBe(true);
    expect(isEmail("candidate.example.com")).toBe(false);
  });
});
