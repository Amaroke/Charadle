import { expect, test } from "@playwright/test";

test("a player signs in with MAL, plays on their own MAL list and signs out", async ({ page }) => {
  await page.goto("/en/play");
  const banner = page.getByRole("banner");
  await banner.getByRole("button", { name: "Sign in with MAL" }).click();

  await expect(page).toHaveURL(/\/en\/play$/);
  await expect(banner.getByText("luffyfan")).toBeVisible();

  await page.getByText("MAL list", { exact: true }).first().click();
  await expect(page.getByRole("textbox", { name: "MyAnimeList username" })).toHaveValue("luffyfan");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByRole("img", { name: "Character to guess" })).toBeVisible();

  await banner.getByRole("button", { name: "Sign out" }).click();
  await expect(banner.getByRole("button", { name: "Sign in with MAL" })).toBeVisible();
  await expect(banner.getByText("luffyfan")).toBeHidden();
});
