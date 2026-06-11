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
  await expect(page.getByText("Time complexity").first()).toBeVisible();
  await expect(page.getByText("Code quality").first()).toBeVisible();

  await page.getByRole("button", { name: "Email candidate summary" }).click();
  await expect(page.getByText("mock: Email rendered in mock mode")).toBeVisible();

  await page.getByRole("button", { name: "Email examiner report" }).click();
  await expect(page.getByText("mock: Email rendered in mock mode")).toHaveCount(2);
});

test("examiner configures automatic completion report emails for a test", async ({ page }) => {
  const emailRequests: unknown[] = [];

  await page.route("**/api/email", async (route) => {
    emailRequests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/json",
      json: { ok: true, provider: "mock", id: "email-test", message: "Email rendered in mock mode." },
    });
  });

  await page.goto("/examiner");

  await page.getByLabel("Candidate invite emails").fill("candidate@talentsprint.dev");
  await page.getByLabel("Examiner report email").fill("examiner@talentsprint.dev");
  await page
    .getByRole("checkbox", { name: "Email candidate score summary after completion" })
    .check();
  await page
    .getByRole("checkbox", { name: "Email detailed examiner report after completion" })
    .check();
  await page.getByRole("button", { name: "Create test" }).click();

  await expect(page.getByText("Assessment saved with")).toBeVisible();

  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "candidate-demo");
  });
  await page.goto("/assessment");

  await expect(page.getByText("Candidate email on")).toBeVisible();
  await expect(page.getByText("examiner email on")).toBeVisible();

  await page.getByRole("button", { name: "Start assessment" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Candidate report email: mock Email rendered in mock mode.")).toBeVisible();
  await expect(page.getByText("Examiner report email: mock Email rendered in mock mode.")).toBeVisible();
  expect(emailRequests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "candidate-report", to: "candidate@talentsprint.dev" }),
      expect.objectContaining({ kind: "examiner-report", to: "examiner@talentsprint.dev" }),
    ]),
  );
});

test("administrator can inspect authoring controls and question library actions", async ({ page }) => {
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "admin-demo");
  });

  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Manage the question library and platform settings." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Examiner access" })).toBeVisible();
  await expect(page.getByText("examiner@talentsprint.dev")).toBeVisible();
  await page.getByLabel("Examiner name").fill("Invited Examiner");
  await page.getByLabel("Examiner email").fill("invited.examiner@example.com");
  await page.getByRole("button", { name: "Invite examiner" }).click();
  await expect(page.getByText("Examiner access created.")).toBeVisible();
  await expect(page.getByText("invited.examiner@example.com")).toBeVisible();
  await page.getByRole("button", { name: "Disable Invited Examiner" }).click();
  await expect(page.getByText("Examiner access disabled.")).toBeVisible();
  await page.getByRole("button", { name: "Enable Invited Examiner" }).click();
  await expect(page.getByText("Examiner access enabled.")).toBeVisible();
  await page.getByRole("button", { name: "Remove Invited Examiner" }).click();
  await expect(page.getByText("Examiner access removed.")).toBeVisible();
  await expect(page.getByText("invited.examiner@example.com")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "New question" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Platform settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview Pair Sum" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive Pair Sum" })).toBeVisible();
});
