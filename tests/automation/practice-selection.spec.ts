import { expect, test } from "@playwright/test";

test("candidate can choose a practice question and load it into the workspace", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "candidate-demo");
  });

  await page.goto("/practice");
  await expect(page.getByRole("heading", { name: "Choose a question, then solve it." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Try: Pair Sum" })).toBeVisible();

  const targetCard = page
    .locator("button")
    .filter({ has: page.getByRole("heading", { name: "First Non-Repeating Character" }) });

  await targetCard.click();

  await expect(page.getByRole("heading", { name: "Try: First Non-Repeating Character" })).toBeVisible();
  await expect(targetCard).toHaveAttribute("aria-pressed", "true");
});
