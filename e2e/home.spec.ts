import { expect, test } from "@playwright/test";

test("home page shows the logo and the falling petals", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Charadle");
  await expect(page.getByRole("heading", { level: 1, name: "Charadle" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Charadle logo" })).toBeVisible();
  await expect(page.getByTestId("sakura-petals").locator("span:visible").first()).toBeAttached();
});

test("home page fits the viewport width", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
