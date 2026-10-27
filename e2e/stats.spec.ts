import { expect, test } from "@playwright/test";

const names: Record<string, string> = {
  40: "Luffy",
  17: "Naruto Uzumaki",
  11: "Edward Elric",
  80: "Light Yagami",
  40882: "Eren Yeager",
  246: "Goku Son",
  146156: "Tanjiro Kamado",
};

test("the Guest stats are merged into the Player stats on sign-in", async ({ page }) => {
  await page.goto("/en/daily");
  const picture = await page.getByRole("img", { name: "Character to guess" }).getAttribute("src");
  await page.getByRole("textbox", { name: "Character name" }).fill(names[picture!.match(/characters\/(\d+)\.png/)![1]]);
  await page.getByRole("button", { name: "Guess" }).click();
  await expect(page.getByText("Daily score: 7/7")).toBeVisible();

  const banner = page.getByRole("banner");
  await banner.getByRole("link", { name: "Stats" }).click();
  await expect(page.getByText("These stats live only in this browser.", { exact: false })).toBeVisible();
  await expect(page.getByRole("main").getByText("Played").locator("..")).toContainText("1");

  await banner.getByRole("button", { name: "Sign in with MAL" }).click();
  await expect(banner.getByText("luffyfan")).toBeVisible();
  await expect(page.getByText("These stats live only in this browser.", { exact: false })).toBeHidden();
  await expect(page.getByRole("main").getByText("Average score").locator("..")).toContainText("7");
  await expect(page.getByRole("listitem", { name: "7: 1" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("charadle:guest-stats"))).toBeNull();

  await page.goto("/en/daily");
  await expect(page.getByRole("link", { name: "See my stats" })).toBeVisible();

  await page.goto("/en/stats");
  await banner.getByRole("button", { name: "Sign out" }).click();
  await expect(banner.getByRole("button", { name: "Sign in with MAL" })).toBeVisible();
  await expect(page.getByText("No Daily played yet.")).toBeVisible();
});
