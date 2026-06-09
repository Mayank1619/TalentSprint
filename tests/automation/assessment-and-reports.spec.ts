import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("talent-sprint-user", "candidate-demo");
  });
});

test("candidate starts a timed assessment, switches questions, submits, and opens report summary", async ({
  page,
}) => {
  await page.goto("/assessment");

  await expect(page.getByRole("heading", { name: "Consultant Core Coding Screen" })).toBeVisible();
  await page.getByRole("button", { name: "Start assessment" }).click();
  await expect(page.getByText("remaining")).toBeVisible();

  await page.getByRole("button", { name: "Q2" }).click();
  await expect(page.getByRole("heading", { name: "Try: Valid Parentheses" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Valid Parentheses" })).toBeVisible();

  await page.getByRole("button", { name: "Java" }).click();
  await expect(page.getByLabel("Valid Parentheses Java editor")).toBeVisible();

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Correctness")).toBeVisible();

  await page.getByRole("link", { name: "Open candidate report summary" }).click();
  await expect(page).toHaveURL("/candidate/report");
  await expect(page.getByRole("heading", { name: "Your score summary" })).toBeVisible();
  await expect(page.getByText("Hidden details protected")).toBeVisible();
  await expect(page.getByText("def pair_sum")).toHaveCount(0);
});

test("email API rejects malformed email requests", async ({ request }) => {
  const response = await request.post("/api/email", {
    data: { kind: "candidate-report" },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    ok: false,
    message: "Email kind and recipient are required.",
  });
});
