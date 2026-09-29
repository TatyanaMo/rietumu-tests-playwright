import { Page, Locator } from "@playwright/test";

export class FundingLatviaPage {
  private readonly amountInput: Locator;
  private readonly yearsInput: Locator;
  private readonly monthsInput: Locator;
  private readonly rateInput: Locator;
  private readonly variableScheduleRadio: Locator;
  private readonly equalScheduleRadio: Locator;
  private readonly monthlyRepaymentResult: Locator;

  constructor(private page: Page) {
    this.amountInput = page.locator("#summa");
    this.yearsInput = page.locator("#period1");
    this.monthsInput = page.locator("#period");
    this.rateInput = page.locator("#rate");
    this.variableScheduleRadio = page.locator('input[name="type"][value="1"]');
    this.equalScheduleRadio = page.locator('input[name="type"][value="2"]');
    this.monthlyRepaymentResult = page.locator("#ikmenesi");
  }

  async setAmount(amount: string): Promise<void> {
    await this.amountInput.clear();
    await this.amountInput.pressSequentially(amount);
  }

  async setYears(years: string): Promise<void> {
    await this.yearsInput.clear();
    await this.yearsInput.pressSequentially(years);
  }

  async setMonths(months: string): Promise<void> {
    await this.monthsInput.clear();
    await this.monthsInput.pressSequentially(months);
  }

  async setRate(rate: string): Promise<void> {
    await this.rateInput.clear();
    await this.rateInput.pressSequentially(rate);
  }

  async selectVariableSchedule(): Promise<void> {
    await this.variableScheduleRadio.check();
  }

  async selectEqualSchedule(): Promise<void> {
    await this.equalScheduleRadio.check();
  }

  async getMonthlyRepaymentText(): Promise<string> {
    return (await this.monthlyRepaymentResult.innerText()).trim();
  }

  async getAmountFieldValue(): Promise<string> {
    return await this.amountInput.inputValue();
  }

  async getYearsFieldValue(): Promise<string> {
    return await this.yearsInput.inputValue();
  }

  async getMonthsFieldValue(): Promise<string> {
    return await this.monthsInput.inputValue();
  }

  async isVariableScheduleSelected(): Promise<boolean> {
    return await this.variableScheduleRadio.isChecked();
  }

  async clearAmount(): Promise<void> {
    await this.amountInput.press("Control+A");
    await this.amountInput.press("Delete");
  }
}
