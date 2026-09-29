import { test, expect } from '@playwright/test';
import { postDocument, getDocumentForSign } from '../../elink/elinkProClient';
import { loadDocument } from '../../elink/loadDocument';
import { config } from '../../config/env';

const initialDoc = loadDocument('docs/postDocumentRequest.xml');

let refNo: string;

test.beforeAll(async () => {
    const postDocResponse = await postDocument(config.ticketActive, 'EN', initialDoc);
    const body = await postDocResponse.json();
    refNo = body.refNo;
});

test('getDocumentForSignCheckForValidData', async () => {
    const response = await getDocumentForSign(config.ticketActive, 'EN', refNo);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.signatureRequired).toContain('CER');
    expect(body.doc).toContain('<RBdocument');
    expect(body.doc).toContain(refNo);
    expect(body.status).toBe('20');
    expect(body.state).toBe('Waiting for signature');
});

for (const language of ['EN', 'RU', 'LV']) {
    test(`getDocumentForSignCheckForLanguage_${language}`, async () => {
        const response = await getDocumentForSign(config.ticketActive, language, refNo);
        const body = await response.json();

        expect(body.code).toBe(0);
        expect(body.signatureRequired).toContain('CER');
        expect(body.doc).toContain('<RBdocument');
        expect(body.doc).toContain(refNo);
        expect(body.status).toBe('20');
        expect(body.state).toBe('Waiting for signature');
    });
}

test('getDocumentForSignCheckForOmittedLanguage', async () => {
    const response = await getDocumentForSign(config.ticketActive, null, refNo);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.signatureRequired).toContain('CER');
    expect(body.doc).toContain('<RBdocument');
    expect(body.doc).toContain(refNo);
    expect(body.status).toBe('20');
    expect(body.state).toBe('Waiting for signature');
});

test('getDocumentForSignCheckForInvalidLanguage', async () => {
    const response = await getDocumentForSign(config.ticketActive, 'XXX', refNo);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('language');
});

test('getDocumentForSignCheckForInvalidRefNo', async () => {
    const response = await getDocumentForSign(config.ticketActive, 'EN', 'HVII270');
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('refNo');
});

test('getDocumentForSignCheckForMissingTicket', async () => {
    const response = await getDocumentForSign(null, 'EN', refNo);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('ticket');
});

test('getDocumentForSignCheckForInvalidTicket', async () => {
    const response = await getDocumentForSign('not-a-real-ticket-12345', 'EN', refNo);
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});

test('getDocumentForSignCheckForInactiveTicket', async () => {
    const response = await getDocumentForSign(config.ticketInactive, 'EN', refNo);
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});

test('getDocumentForSignCheckForMissingRefNo', async () => {
    const response = await getDocumentForSign(config.ticketActive, 'EN', null);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('refNo');
});


