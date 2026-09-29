import { Page } from "@playwright/test";

export async function acceptCookiesIfPresent(page: Page): Promise<void> {
  const acceptButton = page.locator("#btn_all");
  try {
    await acceptButton.waitFor({ state: "visible", timeout: 5000 });
    await acceptButton.click();
  } catch {
    // Banner didn't appear within 5 seconds - nothing to do.
  }
}
