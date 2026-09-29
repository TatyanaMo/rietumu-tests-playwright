import { Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { FundingLatviaPage } from "../pages/FundingLatviaPage";

export async function navigateToLoanCalculator(
  page: Page,
): Promise<FundingLatviaPage> {
  const homePage = new HomePage(page);
  await homePage.open();
  await homePage.acceptCookie();
  const privatePage = await homePage.clickPrivate();
  const lendingPage = await privatePage.clickLending();
  return await lendingPage.clickMortgageInLatvia();
}