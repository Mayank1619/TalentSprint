import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "candidate-demo");
  });
});

test("candidate selects a practice question, submits, reviews report, opens leaderboard, and returns", async ({
  page,
}) => {
  await page.goto("/practice");

  await expect(page.getByRole("heading", { name: "Choose your next practice sprint." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Try: Pair Sum" })).toHaveCount(0);

  await page.goto("/practice/first-non-repeating-character");
  await expect(page).toHaveURL("/practice/first-non-repeating-character");
  await expect(page.getByRole("heading", { level: 1, name: "First Non-Repeating Character" })).toBeVisible();

  await page
    .getByLabel("First Non-Repeating Character Python editor")
    .fill("def first_non_repeating_character(input):\n    counts = {}\n    for char in input:\n        return char");

  await page.getByRole("button", { name: "Run samples" }).click();
  await expect(page.getByText("samples passed")).toBeVisible();

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL("/practice/first-non-repeating-character/report", { timeout: 15_000 });
  await expect(page.getByText("Practice report")).toBeVisible();
  await expect(page.getByText("Practice score")).toBeVisible();
  await expect(page.getByText("Generated from your latest submission")).toBeVisible();

  await page.locator(".report-actions").getByRole("link", { name: "Leaderboard" }).click();
  await expect(page).toHaveURL("/leaderboard");
  await expect(page.getByRole("heading", { name: "Track practice momentum." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Candidate Demo" })).toBeVisible();

  await page.getByRole("link", { name: "Practice" }).click();
  await expect(page).toHaveURL("/practice");
  await expect(page.getByRole("heading", { name: "Select a question" })).toBeVisible();
});

test("candidate can filter the practice bank and open a language-specific question", async ({ page }) => {
  await page.goto("/practice");

  await page.getByRole("button", { name: "Python" }).click();
  await expect(page.locator('a[href="/practice/python-dictionary-normalizer"]')).toBeVisible();
  await expect(page.locator('a[href="/practice/pair-sum"]')).toHaveCount(0);

  await page.goto("/practice/python-dictionary-normalizer");
  await expect(page).toHaveURL("/practice/python-dictionary-normalizer");
  await expect(page.getByLabel("Python Dictionary Normalizer Python editor")).toBeVisible();
});

test("practice timer counts down and auto-submits when time expires", async ({ page }) => {
  await page.clock.install();

  await page.goto("/practice/pair-sum");
  await expect(page.getByText("18:00 remaining")).toBeVisible();

  await page.clock.fastForward(18 * 60 * 1000);

  await expect(page).toHaveURL("/practice/pair-sum/report");
  await expect(page.getByText("Practice report")).toBeVisible();
  await expect(page.getByText("Practice score")).toBeVisible();
});

test("empty starter code fails instead of passing", async ({ page }) => {
  await page.goto("/practice/pair-sum");

  await page.getByRole("button", { name: "Run samples" }).click();

  await expect(page.getByText("0/4 samples passed")).toBeVisible();
  await expect(page.getByText("Failed: Visible: [2,7,11,15], target 9")).toBeVisible();
});
