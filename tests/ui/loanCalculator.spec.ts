import { test, expect } from "@playwright/test";
import { FundingLatviaPage } from "../../pages/FundingLatviaPage";
import { navigateToLoanCalculator } from "../../helpers/navigation";

test.describe("Loan Calculator", () => {
  let fundingLatviaPage: FundingLatviaPage;

  const AMOUNT = "100000";
  const RATE = "5";
  const YEARS = "10";
  const MONTHS = "0";
  const CHANGED_RATE = "7";
  const DECIMAL_RATE = "5.5";
  const MONTHS_ONLY_TERM_YEARS = "0";
  const MONTHS_ONLY_TERM_MONTHS = "6";
  const AMOUNT_ABOVE_MINIMUM = "301";
  const MINIMUM_AMOUNT_BOUNDARY = "300";
  const ZERO_RATE = "0";
  const ZERO_TERM_YEARS = "0";
  const ZERO_TERM_MONTHS = "0";
  const NON_NUMERIC_INPUT = "abc123abc";
  const EXPECTED_ACCEPTED_AMOUNT = "123";
  const AMOUNT_MORE_THAN_MAX_LENGTH = "1234567890123456";
  const EXPECTED_AMOUNT_MAX_LENGTH = 15;
  const YEARS_MORE_THAN_MAX_LENGTH = "123";
  const MONTHS_MORE_THAN_MAX_LENGTH = "111";
  const EXPECTED_YEARS_MAX_LENGTH = 2;
  const EXPECTED_MONTH_MAX_LENGTH = 2;
  const DEFAULT_AMOUNT = "100 000";
  const DEFAULT_YEARS = "10";
  const DEFAULT_MONTHS = "0";
  const VARIABLE_SCHEDULE_EXPECTED_FROM = "1 250.00";
  const VARIABLE_SCHEDULE_EXPECTED_TO = "836.81";
  const EQUAL_SCHEDULE_EXPECTED_RESULT = "1 060.66";

  test.beforeEach(async ({ page }) => {
    fundingLatviaPage = await navigateToLoanCalculator(page);
  });

  test("default values are shown on fresh page load", async () => {
    expect(await fundingLatviaPage.getAmountFieldValue()).toBe(DEFAULT_AMOUNT);
    expect(await fundingLatviaPage.getYearsFieldValue()).toBe(DEFAULT_YEARS);
    expect(await fundingLatviaPage.getMonthsFieldValue()).toBe(DEFAULT_MONTHS);
    expect(await fundingLatviaPage.isVariableScheduleSelected()).toBe(true);
    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe("");
  });

  test("variable schedule calculates a range", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectVariableSchedule();

    const result = await fundingLatviaPage.getMonthlyRepaymentText();

    expect(result).toContain(VARIABLE_SCHEDULE_EXPECTED_FROM);
    expect(result).toContain(VARIABLE_SCHEDULE_EXPECTED_TO);
  });

  test("equal schedule calculates a fixed result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe(
      EQUAL_SCHEDULE_EXPECTED_RESULT,
    );
  });

  test("result recalculates when rate changes", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();
    const firstResult = await fundingLatviaPage.getMonthlyRepaymentText();

    await fundingLatviaPage.setRate(CHANGED_RATE);
    const updatedResult = await fundingLatviaPage.getMonthlyRepaymentText();

    expect(updatedResult).not.toBe(firstResult);
  });

  test("decimal rate is accepted and produces a result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(DECIMAL_RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).not.toBe("");
  });

  test("months-only term produces a result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(MONTHS_ONLY_TERM_YEARS);
    await fundingLatviaPage.setMonths(MONTHS_ONLY_TERM_MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).not.toBe("");
  });

  test("amount just above the minimum produces a result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT_ABOVE_MINIMUM);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).not.toBe("");
  });

  test("amount at the minimum boundary produces a blank result", async () => {
    await fundingLatviaPage.setAmount(MINIMUM_AMOUNT_BOUNDARY);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe("");
  });

  test("zero rate produces a blank result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(ZERO_RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe("");
  });

  test("zero term produces a blank result", async () => {
    await fundingLatviaPage.setAmount(AMOUNT);
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(ZERO_TERM_YEARS);
    await fundingLatviaPage.setMonths(ZERO_TERM_MONTHS);
    await fundingLatviaPage.selectEqualSchedule();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe("");
  });

  test("empty amount field produces a blank result", async () => {
    await fundingLatviaPage.setRate(RATE);
    await fundingLatviaPage.setYears(YEARS);
    await fundingLatviaPage.setMonths(MONTHS);
    await fundingLatviaPage.clearAmount();

    expect(await fundingLatviaPage.getMonthlyRepaymentText()).toBe("");
  });

  test("non-numeric keystrokes are rejected in the amount field", async () => {
    await fundingLatviaPage.setAmount(NON_NUMERIC_INPUT);

    expect(await fundingLatviaPage.getAmountFieldValue()).toBe(
      EXPECTED_ACCEPTED_AMOUNT,
    );
  });

  test("amount field does not accept more than 15 characters", async () => {
    await fundingLatviaPage.setAmount(AMOUNT_MORE_THAN_MAX_LENGTH);

    const value = await fundingLatviaPage.getAmountFieldValue();
    expect(value.length).toBe(EXPECTED_AMOUNT_MAX_LENGTH);
  });

  test("years field does not accept more than 2 characters", async () => {
    await fundingLatviaPage.setYears(YEARS_MORE_THAN_MAX_LENGTH);

    const value = await fundingLatviaPage.getYearsFieldValue();
    expect(value.length).toBe(EXPECTED_YEARS_MAX_LENGTH);
  });

  test("month field does not accept more than 2 characters", async () => {
    await fundingLatviaPage.setYears(MONTHS_MORE_THAN_MAX_LENGTH);

    const value = await fundingLatviaPage.getYearsFieldValue();
    expect(value.length).toBe(EXPECTED_MONTH_MAX_LENGTH);
  });
});
