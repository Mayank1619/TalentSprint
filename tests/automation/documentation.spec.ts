import { expect, test } from "@playwright/test";

test("public documentation explains the platform and question authoring", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "A technical screening platform for consultant readiness." })).toBeVisible();
  await expect(page.getByText("Total questions")).toBeVisible();
  await expect(page.getByRole("link", { name: "Read documentation" })).toHaveAttribute("href", "/docs");

  await page.goto("/docs");
  await expect(page.getByRole("heading", { name: "Operate Talent Sprint with clear role boundaries." })).toBeVisible();
  await expect(page.getByText("Assessment workflow")).toBeVisible();
  await expect(page.getByRole("link", { name: /Question authoring/ })).toHaveAttribute(
    "href",
    "/docs/question-authoring",
  );

  await page.goto("/docs/question-authoring");
  await expect(page.getByRole("heading", { name: "Add questions with testable scoring rules." })).toBeVisible();
  await expect(page.getByText("Question metadata")).toBeVisible();
  await expect(page.getByText("Definition example")).toBeVisible();
  await expect(page.getByText("Review checklist")).toBeVisible();
});
