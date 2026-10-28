import { expect, test } from "@playwright/test";

test("each locale route shows the interface in its language", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("Guess the anime character from their picture.")).toBeVisible();

  await page.goto("/fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByText("Devine le personnage d'anime à partir de son image.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Logo de Charadle" })).toBeVisible();
});

test.describe("French browser", () => {
  test.use({ locale: "fr-FR" });

  test("lands in French", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr$/);
  });
});

test.describe("unsupported browser language", () => {
  test.use({ locale: "de-DE" });

  test("lands in English", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("the language switcher keeps the current page and remembers the choice", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
});

test("an unknown locale is not found", async ({ page }) => {
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
});
