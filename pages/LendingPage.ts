import { Page, Locator } from "@playwright/test";
import { FundingLatviaPage } from "./FundingLatviaPage";

export class LendingPage {
  private readonly mortgageInLatviaLink: Locator;

  constructor(private page: Page) {
    this.mortgageInLatviaLink = page.locator(
      'a.card-item[href="/en/person/funding/funding-latvia"]',
    );
  }

  async clickMortgageInLatvia(): Promise<FundingLatviaPage> {
    await this.mortgageInLatviaLink.click();
    return new FundingLatviaPage(this.page);
  }
}
