import { Page, Locator } from "@playwright/test";
import { acceptCookiesIfPresent } from "./CookieBanner";
import { config } from "../config/env";
import { PrivatePage } from "./PrivatePage";

export class HomePage {
  private readonly privateLink: Locator;

  constructor(private page: Page) {
    this.privateLink = page.locator('a[href="/en/person"]');
  }

  async open(): Promise<void> {
    await this.page.goto(config.websiteUrl);
  }

  async acceptCookie(): Promise<void> {
    await acceptCookiesIfPresent(this.page);
  }

  async clickPrivate(): Promise<PrivatePage> {
    await this.privateLink.click();
    return new PrivatePage(this.page);
  }
}
