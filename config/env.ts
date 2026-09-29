import * as dotenv from "dotenv";

dotenv.config();

function get(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const config = {
  domain: get("DOMAIN"),
  domainPro: get("DOMAIN_PRO"),
  elinkLogin: get("ELINK_LOGIN"),
  elinkPassword: get("ELINK_PASSWORD"),
  ticketActive: get("TICKET_ACTIVE"),
  ticketInactive: get("TICKET_INACTIVE"),
  rietumuId: get("RIETUMU_ID"),
  certPath: get("CERT_PATH"),
  certPassword: get("CERT_PASSWORD"),
  websiteUrl: get("WEBSITE_URL"),
};
