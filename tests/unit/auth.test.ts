import { describe, expect, it } from "vitest";
import { canAccess, roleLabel } from "@/lib/auth";

describe("authorization helpers", () => {
  it("allows only matching roles", () => {
    expect(canAccess("candidate", ["candidate"])).toBe(true);
    expect(canAccess("candidate", ["examiner", "administrator"])).toBe(false);
    expect(canAccess(null, ["candidate"])).toBe(false);
  });

  it("returns display labels for roles", () => {
    expect(roleLabel("administrator")).toBe("Administrator");
  });
});
