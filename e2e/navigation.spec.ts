import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"]) {
  test(`the header leads back to the ${locale} home page from every page`, async ({ page }) => {
    for (const path of ["play", "daily"]) {
      await page.goto(`/${locale}/${path}`);
      await page.getByRole("banner").getByRole("link", { name: "Charadle" }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    }
  });
}
