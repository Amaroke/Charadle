import { expect, test, type Page } from "@playwright/test";

const names: Record<string, string> = {
  40: "Luffy",
  17: "Naruto Uzumaki",
  11: "Edward Elric",
  80: "Light Yagami",
  40882: "Eren Yeager",
  246: "Goku Son",
  146156: "Tanjiro Kamado",
};

async function guess(page: Page, name: string) {
  await page.getByRole("textbox", { name: "Character name" }).fill(name);
  await page.getByRole("button", { name: "Guess" }).click();
}

async function missTier(page: Page, tier: number, next: number) {
  await expect(page.getByText(`Top ${tier}`, { exact: true })).toBeVisible();
  await guess(page, "Nobody");
  await expect(page.getByText("Not quite! One Guess left on this Tier.")).toBeVisible();
  await guess(page, "Nobody");
  await expect(page.getByText("Missed! On to the next Tier.")).toBeVisible();
  await expect(page.getByText(`Top ${next}`, { exact: true })).toBeVisible();
}

async function answerOf(page: Page): Promise<string> {
  const picture = await page.getByRole("img", { name: "Character to guess" }).getAttribute("src");
  return names[picture!.match(/characters\/(\d+)\.png/)![1]];
}

test("a Daily found at the Top 100 scores 5 and cannot be played again", async ({ page }) => {
  const responses: string[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/daily")) responses.push(await response.text().catch(() => ""));
  });
  await page.goto("/en");
  await page.getByRole("link", { name: "Daily" }).click();
  await expect(page.getByText("Top 500", { exact: true })).toBeVisible();
  await expect(page.getByText("Guesses left: 2")).toBeVisible();

  await guess(page, "Nobody");
  await expect(page.getByText("Guesses left: 1")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Guesses left: 1")).toBeVisible();
  await guess(page, "Nobody");
  await expect(page.getByText("Missed! On to the next Tier.")).toBeVisible();
  await missTier(page, 200, 100);

  const answer = await answerOf(page);
  expect(responses.join("\n")).not.toContain(answer);
  await guess(page, answer);
  await expect(page.getByText("Found!")).toBeVisible();
  await expect(page.getByText("Daily score: 5/7")).toBeVisible();
  await expect(page.getByRole("list", { name: "Characters of the ended Tiers" }).getByRole("listitem")).toHaveCount(3);

  await page.reload();
  await expect(page.getByText("Daily score: 5/7")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Character name" })).toBeHidden();
});

test("the Daily is the same for every Guest", async ({ browser }) => {
  const pictures = await Promise.all(
    [0, 1].map(async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("/en/daily");
      const src = await page.getByRole("img", { name: "Character to guess" }).getAttribute("src");
      await context.close();
      return src;
    }),
  );
  expect(pictures[0]).toBe(pictures[1]);
});

test("the cron draws the Daily only with its secret", async ({ request }) => {
  expect((await request.get("/api/cron/daily")).status()).toBe(401);
  const first = await request.get("/api/cron/daily", { headers: { authorization: "Bearer e2e-cron-secret" } });
  const second = await request.get("/api/cron/daily", { headers: { authorization: "Bearer e2e-cron-secret" } });
  expect(first.ok()).toBe(true);
  expect(await second.json()).toEqual(await first.json());
});

test("the end of the Daily links back to the home page", async ({ page }) => {
  await page.goto("/en/daily");
  await guess(page, await answerOf(page));
  await expect(page.getByText("Daily score: 7/7")).toBeVisible();
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/en$/);
});
