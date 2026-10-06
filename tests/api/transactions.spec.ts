import { test, expect } from "@playwright/test";
import { transactions } from "../../elink/elinkClient";
import { config } from "../../config/env";

const CCY = "EUR";
const DATE_FROM = "2026-09-01";
const DATE_TILL = "2026-09-26";
test("transactionsCheckAllFieldsForValidRequest", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.transactions.length).toBeGreaterThan(0);

  const transaction = body.transactions[0];

  expect.soft(transaction.uniqueID).toBeTruthy();
  expect.soft(transaction.trnID).toBeTruthy();
  expect
    .soft(new Date(transaction.date).toString())
    .not.toBe("Invalid Date");
  expect.soft(transaction.refno).toBeTruthy();
  expect.soft(transaction.narrative).not.toBeNull();
  expect.soft(String(transaction.amount)).toMatch(/^-?\d+(\.\d+)?$/);
  expect.soft(transaction.currency).toMatch(/^[A-Z]{3}$/);
  expect.soft(String(transaction.saldo)).toMatch(/^-?\d+(\.\d+)?$/);
  expect.soft(transaction.trndesc).toBeTruthy();
  expect.soft(transaction.tcf).toMatch(/^[YN]$/);
});

test("transactionsCheckForAllValidData", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.transactions.length).toBeGreaterThan(0);
  expect(body.transactions[0].currency).toHaveLength(3);
  expect(body.error).toBe("");
});

test("transactionsCheckForOmittedCurrency", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    null,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
});

for (const language of ["EN", "RU", "LV"]) {
  test(`transactionCheckForLanguage_${language}`, async ({ request }) => {
    const response = await transactions(
      request,
      config.ticketActive,
      CCY,
      DATE_FROM,
      DATE_TILL,
      language,
      null,
    );
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error).toBe("");
  });
}

test("transactionsCheckForMissingTicket", async ({ request }) => {
  const response = await transactions(
    request,
    null,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("ticket");
});

test("transactionsCheckForMissingDateFrom", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    "",
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("dateFrom");
});

test("transactionsCheckForMissingDateTill", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_FROM,
    "",
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("dateTill");
});

test("transactionsCheckForInactiveTicket", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketInactive,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(6);
  expect(body.error).toBe("Invalid or inactive ticket.");
});

test("transactionsCheckForInvalidTicket", async ({ request }) => {
  const response = await transactions(
    request,
    "not-a-real-ticket-12345",
    CCY,
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(6);
  expect(body.error).toBe("Invalid or inactive ticket.");
});

test("transactionsCheckForInvalidDateFormat", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    "01-01-2024",
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("dateFrom");
});

test("transactionsCheckForInvalidCcyFormat", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    "EURO",
    DATE_FROM,
    DATE_TILL,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("ccy");
});

test("transactionsCheckForInvalidLanguage", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "XXX",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("language");
});

/* Sandbox behavior: dateFrom/dateTill ordering is not validated.
An inverted range (dateFrom after dateTill) still returns code 0 and the fixed dataset (not an error).
*/
test("transactionsCheckForDateRangeValidationNotApplied", async ({
  request,
}) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_TILL,
    DATE_FROM,
    "EN",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
});

/* Sandbox behavior: language is not validated against the documented set (EN/RU/LV).
An unsupported value like LT is accepted (code 0) and returns English text (not rejected or translated).
*/
test("transactionsCheckForNotSupportiveLanguage", async ({ request }) => {
  const response = await transactions(
    request,
    config.ticketActive,
    CCY,
    DATE_FROM,
    DATE_TILL,
    "LT",
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
});
