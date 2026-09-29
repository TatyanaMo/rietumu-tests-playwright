import { Page, Locator } from "@playwright/test";
import { LendingPage } from "./LendingPage";

export class PrivatePage {
  private readonly lendingLink: Locator;

  constructor(private page: Page) {
    this.lendingLink = page.locator(
      'a.header-nav__item[href="/en/person/funding"]',
    );
  }

  async clickLending(): Promise<LendingPage> {
    await this.lendingLink.click();
    return new LendingPage(this.page);
  }
}
