import { expect, test } from "@playwright/test";

test("assessment-only questions cannot be opened through the practice route", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "candidate-demo");
  });

  await page.goto("/practice/employee-score");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("basic reflected-script payloads stay escaped in client-rendered views", async ({ page }) => {
  await page.goto("/login?next=%3Cscript%3Ealert(1)%3C%2Fscript%3E");

  await expect(page.getByRole("heading", { name: "Log in or create a candidate account." })).toBeVisible();
  await expect(page.locator("script", { hasText: "alert(1)" })).toHaveCount(0);
});
