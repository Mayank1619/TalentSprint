import { expect, test } from "@playwright/test";

async function signInAs(page: import("@playwright/test").Page, userId: string) {
  await page.goto("/");
  await page.evaluate((nextUserId) => {
    window.localStorage.setItem("talent-sprint-user", nextUserId);
  }, userId);
}

test("unauthenticated users are sent to login before private pages", async ({ page }) => {
  await page.goto("/practice");

  await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in or register" })).toHaveAttribute("href", "/login");
  await page.goto("/login");
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("heading", { name: "Log in or create a candidate account." })).toBeVisible();
});

test("candidate can register and lands on practice", async ({ page }) => {
  const email = `candidate-${Date.now()}@example.com`;

  await page.goto("/login");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByLabel("Full name").fill("New Candidate");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByLabel("Confirm password", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: "Create candidate account" }).click();

  await expect(page).toHaveURL("/practice");
  await expect(page.getByText("New Candidate")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose your next practice sprint." })).toBeVisible();
});

test("password reset pages are available from login", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL("/forgot-password");
  await expect(page.getByRole("heading", { name: "Send a reset link." })).toBeVisible();
  await page.getByLabel("Email").fill("candidate@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Password reset email would be sent in production auth mode.")).toBeVisible();

  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Choose a new password." })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Password123!");
  await expect(page.getByLabel("New password", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show new password" }).click();
  await expect(page.getByLabel("New password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText("Password would be updated in production auth mode.")).toBeVisible();
});

test("guest can practice with name and email for leaderboard", async ({ page }) => {
  await page.goto("/practice");

  await page.getByLabel("Name for leaderboard").fill("Guest Runner");
  await page.getByLabel("Email").fill("guest.runner@example.com");
  await page.getByRole("button", { name: "Practice as guest" }).click();

  await expect(page.getByRole("heading", { name: "Choose your next practice sprint." })).toBeVisible();
  await expect(page.getByText("Guest Runner")).toBeVisible();

  await page.goto("/practice/pair-sum");
  await page.getByRole("button", { name: "Java" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL("/practice/pair-sum/report", { timeout: 15_000 });
  await expect(page.getByText("Generated from your latest submission")).toBeVisible();

  await page.locator(".report-actions").getByRole("link", { name: "Leaderboard" }).click();
  await expect(page).toHaveURL("/leaderboard");
  await expect(page.getByRole("heading", { level: 2, name: "Guest Runner" })).toBeVisible();
});

test("candidate login lands on practice", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("candidate@talentsprint.dev");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/practice");
  await expect(page.getByText("Candidate Demo")).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Admin" })).toHaveCount(0);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Examiner" })).toHaveCount(0);
});

test("examiner and administrator login land on their workspaces", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("examiner@talentsprint.dev");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/examiner", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Create tests, send invites, and review outcomes." })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Admin" })).toHaveCount(0);

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@talentsprint.dev");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/admin", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Manage the question library and platform settings." })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Admin" })).toBeVisible();
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
