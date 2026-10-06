import {
  APIRequestContext,
  request as playwrightRequest,
} from "@playwright/test";
import { config } from "../config/env";

const baseUrl = `https://${config.domainPro}/TCatBox/elinkpro/Process`;

let elinkProContext: APIRequestContext;

async function getProContext(): Promise<APIRequestContext> {
  if (!elinkProContext) {
    elinkProContext = await playwrightRequest.newContext({
      clientCertificates: [
        {
          origin: `https://${config.domainPro}`,
          pfxPath: config.certPath,
          passphrase: config.certPassword,
        },
      ],
    });
  }
  return elinkProContext;
}

export async function postDocument(
  ticket: string | null,
  language: string | null,
  doc: string | null,
) {
  const context = await getProContext();

  const form: Record<string, string> = {
    function: "PostDocument",
  };
  if (ticket !== null) form.ticket = ticket;
  if (language !== null) form.language = language;
  if (doc !== null) form.doc = doc;

  return context.post(baseUrl, { form });
}

export async function getDocumentForSign(
  ticket: string | null,
  language: string | null,
  refNo: string | null,
) {
  const context = await getProContext();

  const form: Record<string, string> = {
    function: "GetDocumentForSign",
  };
  if (ticket !== null) form.ticket = ticket;
  if (language !== null) form.language = language;
  if (refNo !== null) form.refNo = refNo;

  return context.post(baseUrl, { form });
}

export async function postSignedDocument(
  ticket: string | null,
  language: string | null,
  refNo: string | null,
  doc: string | null,
) {
  const context = await getProContext();

  const form: Record<string, string> = {
    function: "PostSignedDocument",
  };

  if (ticket !== null) form.ticket = ticket;
  if (language !== null) form.language = language;
  if (refNo !== null) form.refNo = refNo;
  if (doc !== null) form.doc = doc;

  return context.post(baseUrl, { form });
}
