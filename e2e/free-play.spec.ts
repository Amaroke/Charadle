import { expect, test, type Page } from "@playwright/test";

async function startFreePlay(page: Page) {
  const responses: string[] = [];
  page.on("response", async (response) => {
    if (response.request().method() === "POST") responses.push(await response.text().catch(() => ""));
  });
  await page.goto("/en");
  await page.getByRole("link", { name: "Free play" }).click();
  await expect(page.getByRole("img", { name: "Character to guess" })).toBeVisible();
  return responses;
}

test("a won game reveals the character and the next one comes without reloading", async ({ page }) => {
  const responses = await startFreePlay(page);
  await page.evaluate(() => Object.assign(window, { sameDocument: true }));

  const guess = page.getByRole("textbox", { name: "Character name" });
  await guess.fill("Nami");
  await page.getByRole("button", { name: "Guess" }).click();
  await expect(page.getByText("Not quite! Try again.")).toBeVisible();
  expect(responses.join("\n")).not.toMatch(/luffy|one piece/i);

  await guess.fill("lufy");
  await page.getByRole("button", { name: "Guess" }).click();
  await expect(page.getByText("Well done!")).toBeVisible();
  await expect(page.getByText("Luffy Monkey D.")).toBeVisible();
  await expect(page.getByText("One Piece")).toBeVisible();

  await page.getByRole("button", { name: "Next character" }).click();
  await expect(page.getByRole("textbox", { name: "Character name" })).toBeEmpty();
  await expect(page.getByRole("img", { name: "Character to guess" })).toBeVisible();
  expect(await page.evaluate(() => "sameDocument" in window)).toBe(true);
});

test("giving up reveals the character and the anime", async ({ page }) => {
  await startFreePlay(page);
  await page.getByRole("button", { name: "Give up" }).click();
  await expect(page.getByText("Too bad!")).toBeVisible();
  await expect(page.getByText("Luffy Monkey D.")).toBeVisible();
  await expect(page.getByText("One Piece")).toBeVisible();
});

test("free play speaks French on the French route", async ({ page }) => {
  await page.goto("/fr/play");
  await expect(page.getByRole("img", { name: "Personnage à deviner" })).toBeVisible();
  await page.getByRole("button", { name: "Abandonner" }).click();
  await expect(page.getByText("Dommage !")).toBeVisible();
});
