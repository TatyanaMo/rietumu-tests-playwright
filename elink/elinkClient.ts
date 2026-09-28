import { lstatSync } from 'node:fs';
import { config } from './../env';
import { APIRequestContext } from '@playwright/test';

const baseUrl = `https://${config.domain}/TCatBox/elink/process.json`;

function basicAuthHeader(): string {
    const credentials = `${config.elinkLogin}:${config.elinkPassword}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export async function transactions (
    request: APIRequestContext,
    ticket: string | null,
    ccy: string | null,
    dateFrom: string | null,
    dateTill: string | null,
    language: string | null,
    trnID: string | null,
)  {
    const form: Record<string, string> = {
        function: 'Transactions',
        rid: config.rietumuId,
};

if (ticket !== null) form.ticket = ticket;
    if (ccy !== null) form.ccy = ccy;
    if (dateFrom !== null) form.dateFrom = dateFrom;
    if (dateTill !== null) form.dateTill = dateTill;
    if (language !== null) form.language = language;
    if (trnID !== null) form.trnID = trnID;

return request.post(baseUrl, {
        headers: { Authorization: basicAuthHeader() },
        form,
    });

}

export async function outgoingPaymentDetails(
    request: APIRequestContext,
    ticket: string | null,
    refno: string | null,
    language: string | null,
) {
    const form: Record<string, string> = {
        function: 'OutgoingPaymentDetails',
        rid: config.rietumuId,
    };

    if (ticket !== null) form.ticket = ticket;
    if (refno !== null) form.refno = refno;
    if (language !== null) form.language = language;

    return request.post(baseUrl, {
        headers: { Authorization: basicAuthHeader() },
        form,
    });
}
