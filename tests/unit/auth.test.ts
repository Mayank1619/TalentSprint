import { describe, expect, it } from "vitest";
import { canAccess, roleLabel, validateExaminerInvite } from "@/lib/auth";
import { normalizeSupabaseProjectUrl } from "@/lib/supabase-client";

describe("authorization helpers", () => {
  it("allows only matching roles", () => {
    expect(canAccess("candidate", ["candidate"])).toBe(true);
    expect(canAccess("candidate", ["examiner", "administrator"])).toBe(false);
    expect(canAccess(null, ["candidate"])).toBe(false);
  });

  it("returns display labels for roles", () => {
    expect(roleLabel("administrator")).toBe("Administrator");
  });

  it("validates examiner invitation details", () => {
    expect(validateExaminerInvite({ name: "Ada Lovelace", email: "ada@example.com" })).toBeNull();
    expect(validateExaminerInvite({ name: "A", email: "ada@example.com" })).toBe(
      "Enter the examiner's full name.",
    );
    expect(validateExaminerInvite({ name: "Ada Lovelace", email: "not-email" })).toBe(
      "Enter a valid examiner email address.",
    );
  });

  it("normalizes Supabase API URLs to the project origin required by auth", () => {
    expect(normalizeSupabaseProjectUrl("https://project.supabase.co/rest/v1/")).toBe(
      "https://project.supabase.co",
    );
    expect(normalizeSupabaseProjectUrl("https://project.supabase.co/auth/v1")).toBe(
      "https://project.supabase.co",
    );
    expect(normalizeSupabaseProjectUrl(" https://project.supabase.co ")).toBe(
      "https://project.supabase.co",
    );
  });
});
