import { expect, test } from "@playwright/test";

async function signInAs(page: import("@playwright/test").Page, userId: string) {
  await page.goto("/");
  await page.evaluate((nextUserId) => {
    window.localStorage.setItem("talent-sprint-user", nextUserId);
  }, userId);
}

test("unauthenticated users are sent to the demo role selector before private pages", async ({ page }) => {
  await page.goto("/practice");

  await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
  await page.getByRole("link", { name: "Choose demo role" }).click();
  await expect(page).toHaveURL("/login");

  await page.getByRole("button", { name: "Continue as Candidate" }).click();
  await expect(page.getByText("Signed in as Candidate Demo")).toBeVisible();
});

test("candidate cannot access examiner or administrator surfaces", async ({ page }) => {
  await signInAs(page, "candidate-demo");

  await page.goto("/examiner");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  await expect(page.getByText("requires Examiner or Administrator access")).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  await expect(page.getByText("requires Administrator access")).toBeVisible();
});

test("examiner cannot access candidate-only practice and candidate report pages", async ({ page }) => {
  await signInAs(page, "examiner-demo");

  await page.goto("/practice");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();

  await page.goto("/candidate/report");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("administrator can access admin and leaderboard pages", async ({ page }) => {
  await signInAs(page, "admin-demo");

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Manage the question library and platform settings." })).toBeVisible();

  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "Track practice momentum." })).toBeVisible();
});
