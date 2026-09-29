import { test, expect } from '@playwright/test';
import { postDocument, getDocumentForSign, postSignedDocument } from '../../elink/elinkProClient';
import { signDocument } from '../../elink/xmlDocSigner';
import { loadDocument } from '../../elink/loadDocument';
import { config } from '../../config/env';

const initialDoc = loadDocument('docs/postDocumentRequest.xml');

let refNo: string;
let signedDoc: string;

test.beforeAll(async () => {
    const postDocResponse = await postDocument(config.ticketActive, 'EN', initialDoc);
    const postDocBody = await postDocResponse.json();
    refNo = postDocBody.refNo;

    const getDocForSignResponse = await getDocumentForSign(config.ticketActive, 'EN', refNo);
    const getDocForSignBody = await getDocForSignResponse.json();
    const unsignedDoc = getDocForSignBody.doc;

    signedDoc = signDocument(unsignedDoc);
});

test('postSignedDocumentCheckValidSignature', async () => {
    const response = await postSignedDocument(config.ticketActive, 'EN', refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error_code).toBe('IERR_OK');
    expect(body.error_message).toBe('Document executed successfully');
    expect(body.refNo.trim()).toBe(refNo);
});


for (const language of ['EN', 'RU', 'LV']) {
    test(`postSignedDocumentCheckForLanguage_${language}`, async () => {
        const response = await postSignedDocument(config.ticketActive, language, refNo, signedDoc);
        const body = await response.json();

        expect(body.code).toBe(0);
        expect(body.error_code).toBe('IERR_OK');
        expect(body.error_message).toBe('Document executed successfully');
        expect(body.refNo.trim()).toBe(refNo);
    });
}

/* Sandbox behavior: language is not validated against the documented set (EN/RU/LV).
An unsupported value like LT is accepted (code 0) and returns English text (not rejected or translated).
*/
test('postSignedDocumentCheckForNotSupportiveLanguage', async () => {
    const response = await postSignedDocument(config.ticketActive, 'LT', refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error_code).toBe('IERR_OK');
    expect(body.error_message).toBe('Document executed successfully');
    expect(body.refNo.trim()).toBe(refNo);
});

test('postSignedDocumentCheckForOmittedLanguage', async () => {
    const response = await postSignedDocument(config.ticketActive, null, refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(0);
    expect(body.error_code).toBe('IERR_OK');
    expect(body.error_message).toBe('Document executed successfully');
    expect(body.refNo.trim()).toBe(refNo);
});

test('postSignedDocumentCheckForMissingTicket', async () => {
    const response = await postSignedDocument(null, 'EN', refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('ticket');
});

test('postSignedDocumentCheckForInvalidTicket', async () => {
    const response = await postSignedDocument('not-a-real-ticket-12345', 'EN', refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(6);
    expect(body.error).toBe('Invalid or inactive ticket.');
});

test('postSignedDocumentCheckForMissingRefNo', async () => {
    const response = await postSignedDocument(config.ticketActive, 'EN', null, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('refNo');
});

test('postSignedDocumentCheckForMissingDoc', async () => {
    const response = await postSignedDocument(config.ticketActive, 'EN', refNo, null);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('doc');
});

test('postSignedDocumentCheckForInvalidLanguage', async () => {
    const response = await postSignedDocument(config.ticketActive, 'XXX', refNo, signedDoc);
    const body = await response.json();

    expect(body.code).toBe(4);
    expect(body.error).toBe('language');
});

