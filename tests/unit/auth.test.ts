import { describe, expect, it } from "vitest";
import { canAccess, normalizeEmail, roleLabel, validateExaminerInvite, validateRegistration } from "@/lib/auth";

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

  it("normalizes email identities before auth lookups", () => {
    expect(normalizeEmail(" Candidate@Example.COM ")).toBe("candidate@example.com");
  });

  it("validates candidate registration details", () => {
    expect(
      validateRegistration({
        name: "Grace Hopper",
        email: "grace@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    ).toBeNull();
    expect(
      validateRegistration({
        name: "Grace Hopper",
        email: "grace@example.com",
        password: "password",
        confirmPassword: "password",
      }),
    ).toBe("Password must include an uppercase letter and a number.");
  });
});
