import { expect, test } from "@playwright/test";
import { encode } from "next-auth/jwt";

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

test("a session from before the MAL id was kept asks to sign in again", async ({ baseURL, context, page }) => {
  const cookie = "authjs.session-token";
  const value = await encode({ token: { name: "luffyfan" }, secret: "e2e-auth-secret", salt: cookie });
  await context.addCookies([{ name: cookie, value, url: baseURL }]);

  await page.goto("/en/daily");
  const banner = page.getByRole("banner");
  await expect(banner.getByRole("button", { name: "Sign in with MAL" })).toBeVisible();
  await expect(banner.getByText("luffyfan")).toBeHidden();
});
