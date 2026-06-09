import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "examiner-demo");
  });
});

test("examiner reviews candidate outcomes and sends mock report emails", async ({ page }) => {
  await page.goto("/examiner");

  await expect(page.getByRole("heading", { name: "Create tests, send invites, and review outcomes." })).toBeVisible();
  await expect(page.getByText("Candidate results")).toBeVisible();

  await expect(page.locator('.toolbar-band a[href="/examiner/reports/cand-001"]')).toBeVisible();
  await page.goto("/examiner/reports/cand-001");
  await expect(page).toHaveURL("/examiner/reports/cand-001");
  await expect(page.getByRole("heading", { name: "Aarav Mehta" })).toBeVisible();

  await page.getByRole("button", { name: "Email candidate summary" }).click();
  await expect(page.getByText("mock: Email rendered in mock mode")).toBeVisible();

  await page.getByRole("button", { name: "Email examiner report" }).click();
  await expect(page.getByText("mock: Email rendered in mock mode")).toHaveCount(2);
});

test("administrator can inspect authoring controls and question library actions", async ({ page }) => {
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "admin-demo");
  });

  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Manage the question library and platform settings." })).toBeVisible();
  await expect(page.getByRole("button", { name: "New question" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Platform settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview Pair Sum" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive Pair Sum" })).toBeVisible();
});
