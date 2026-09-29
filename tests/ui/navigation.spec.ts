import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";

test.describe("Navigation", () => {
  test("navigate from homepage to loan calculator page", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();
    await homePage.acceptCookie();

    const privatePage = await homePage.clickPrivate();
    const lendingPage = await privatePage.clickLending();
    await lendingPage.clickMortgageInLatvia();

    await expect(page).toHaveURL(/\/en\/person\/funding\/funding-latvia$/);
  });
});
