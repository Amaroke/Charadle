import { expect, test } from "@playwright/test";

test("the Leaderboard shows today's Daily score, the average score and the Streak", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("banner").getByRole("link", { name: "Leaderboard" }).click();

  await expect(page).toHaveURL(/\/en\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "Daily Leaderboard" })).toBeVisible();
  for (const board of ["Today's Daily", "Average score", "Current Streak"]) {
    await expect(page.getByRole("region", { name: board })).toBeVisible();
  }
  await expect(page.getByText("From 7 Dailies played")).toBeVisible();
});
