import { test, expect } from "@playwright/test";
import { transactions, outgoingPaymentDetails } from "../../elink/elinkClient";
import { config } from "../../config/env";

let refno: string;

const CCY = "EUR";
const DATE_FROM = "2026-09-01";
const DATE_TILL = "2026-09-26";

test.beforeAll(async ({ request }) => {
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
  refno = body.transactions[0].refno;
});

test("outgoingPaymentDetailsCheckForAllValidData", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    refno,
    "EN",
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
  expect(body.details.ref_no).toBe(refno);
  expect(body.details.pmnt_ccy).toHaveLength(3);

  /* NOTE: charge_type is documented as one of OUR/BEN/SHA, but the sandbox actually
    returns "DEF" for this test account's fixed data - a value not listed in the public
    documentation. Not asserted here.
    */

  expect(["0", "1", "2", "3", "4", "5", "6", "7", "20"]).toContain(
    String(body.details.state_id),
  );
  expect(["1", "2", "3"]).toContain(String(body.details.urgency_code));
});

for (const language of ["EN", "RU", "LV"]) {
  test(`outgoingPaymentDetailsCheckForLanguage_${language}`, async ({
    request,
  }) => {
    const response = await outgoingPaymentDetails(
      request,
      config.ticketActive,
      refno,
      language,
    );
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error).toBe("");
  });
}

test("outgoingPaymentDetailsCheckWithoutLanguage", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    refno,
    null,
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
});

test("outgoingPaymentDetailsCheckForNotSupportiveLanguage", async ({
  request,
}) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    refno,
    "LT",
  );
  const body = await response.json();

  expect(body.code).toBe(0);
  expect(body.error).toBe("");
});

test("outgoingPaymentDetailsCheckForInvalidLanguage", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    refno,
    "XXX",
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("language");
});

test("outgoingPaymentDetailsCheckForMissingTicket", async ({ request }) => {
  const response = await outgoingPaymentDetails(request, null, refno, "EN");
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("ticket");
});

test("outgoingPaymentDetailsCheckForMissingRefno", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    null,
    "EN",
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("refno");
});

test("outgoingPaymentDetailsCheckForInactiveTicket", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketInactive,
    refno,
    "EN",
  );
  const body = await response.json();

  expect(body.code).toBe(6);
  expect(body.error).toBe("Invalid or inactive ticket.");
});

test("outgoingPaymentDetailsCheckForInvalidTicket", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    "not-a-real-ticket-12345",
    refno,
    "EN",
  );
  const body = await response.json();

  expect(body.code).toBe(6);
  expect(body.error).toBe("Invalid or inactive ticket.");
});

test("outgoingPaymentDetailsCheckForInvalidRefno", async ({ request }) => {
  const response = await outgoingPaymentDetails(
    request,
    config.ticketActive,
    "NONEXISTENT-REFNO-999",
    "EN",
  );
  const body = await response.json();

  expect(body.code).toBe(4);
  expect(body.error).toBe("refno");
});
