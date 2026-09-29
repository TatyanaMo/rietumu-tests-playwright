import { test, expect } from '@playwright/test';
import { postDocument } from '../../elink/elinkProClient';
import { loadDocument } from '../../elink/loadDocument';
import { config } from '../../config/env';

const initialDoc = loadDocument('docs/postDocumentRequest.xml');

test('postDocumentCheckAllFieldsForValidDocument', async () => {
    // Example of assertions for all documented response fields with data, empty was excluded
    const response = await postDocument(config.ticketActive, 'EN', initialDoc);
    const body = await response.json();

    expect.soft(body.code).toBe(0);
    expect.soft(body.error).toBe('');
    expect.soft(body.signatureRequired.length).toBeGreaterThan(0);
    expect.soft(body.refNo).toBeTruthy();
    expect.soft(body.error_code).toBe('IERR_OK');
    expect.soft(body.error_message).toBeTruthy();
    expect.soft(body.execute_message).not.toBeNull();
    expect.soft(body.error_field).not.toBeNull();
    expect.soft(body.error_level).toBe(0);
});

test('postDocumentCheckForValidDocument', async () => {
    const response = await postDocument(config.ticketActive, 'EN', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.refNo).toBeTruthy();
    expect(body.signatureRequired).toContain('CER');
    expect(body.error).toBe('');
    expect(body.error_code).toBe('IERR_OK');
});

for (const language of ['EN', 'RU', 'LV']) {
    test(`postDocumentCheckForLanguage_${language}`, async () => {
        const response = await postDocument(config.ticketActive, language, initialDoc);
        const body = await response.json();

        expect(body.code).toBe(0);
        expect(body.error).toBe('');
        expect(body.error_code).toBe('IERR_OK');
    });
}

test('postDocumentCheckForOmittedLanguage', async () => {
    const response = await postDocument(config.ticketActive, null, initialDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error).toBe('');
    expect(body.error_code).toBe('IERR_OK');
});

/* Sandbox behavior: language is not validated against the documented set (EN/RU/LV).
An unsupported value like LT is accepted (code 0) and returns English text (not rejected or translated).
*/
test('postDocumentCheckForNotSupportiveLanguage', async () => {
    const response = await postDocument(config.ticketActive, 'LT', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error).toBe('');
    expect(body.error_code).toBe('IERR_OK');
});

test('postDocumentCheckForInvalidLanguage', async () => {
    const response = await postDocument(config.ticketActive, 'XXX', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('language');
});

test('postDocumentCheckForMissingTicket', async () => {
    const response = await postDocument(null, 'EN', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('ticket');
});

test('postDocumentCheckForInactiveTicket', async () => {
    const response = await postDocument(config.ticketInactive, 'EN', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});

test('postDocumentCheckForInvalidTicket', async () => {
    const response = await postDocument('not-valid-ticket-1234', 'EN', initialDoc);
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});

test('postDocumentCheckForMissingDoc', async () => {
    const response = await postDocument(config.ticketActive, 'EN', null);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('doc');
});

/* Sandbox behavior: for an invalid doc value, returns error code '6' with comment
'Invalid or inactive ticket.', not 'doc'.
*/
test('postDocumentCheckForInvalidDoc', async () => {
    const response = await postDocument(config.ticketActive, 'EN', 'not-doc-12345333');
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});