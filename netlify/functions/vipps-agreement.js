/**
 * Vipps Recurring — opprett abonnementsavtale
 * --------------------------------------------
 * Bruker Vipps MobilePay Recurring API v3. Henter access token, oppretter
 * en avtale (agreement) og returnerer { url } = vippsConfirmationUrl der
 * brukeren godkjenner i Vipps-appen.
 *
 * POST { email, plan }  ->  { url }
 *
 * Env (fra portal.vippsmobilepay.com → din salgsenhet for Recurring):
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_SUBSCRIPTION_KEY     (Ocp-Apim-Subscription-Key, primær)
 *   VIPPS_MSN                  (Merchant Serial Number for Recurring-enheten)
 *   VIPPS_ENV                  "test" | "prod"  (default test)
 *   SITE_URL                   (https://customquiz.no)
 *
 * Beløp: 49 kr = 4900 øre.
 */
const crypto = require("crypto");
const { upsertSubscriber, logEvent } = require("./_supabase");

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const AMOUNT_ORE = 4900;

function baseUrl() {
  return (process.env.VIPPS_ENV === "prod")
    ? "https://api.vippsmobilepay.com"
    : "https://apitest.vippsmobilepay.com";
}

async function getToken() {
  const res = await fetch(`${baseUrl()}/accesstoken/get`, {
    method: "POST",
    headers: {
      client_id: process.env.VIPPS_CLIENT_ID,
      client_secret: process.env.VIPPS_CLIENT_SECRET,
      "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
    },
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`accesstoken ${res.status}: ${txt.slice(0, 200)}`);
  return JSON.parse(txt).access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };
  }

  const required = ["VIPPS_CLIENT_ID", "VIPPS_CLIENT_SECRET", "VIPPS_SUBSCRIPTION_KEY", "VIPPS_MSN"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: "Vipps ikke konfigurert. Mangler: " + missing.join(", ") }) };
  }

  let email;
  try {
    email = String(JSON.parse(event.body || "{}").email || "").trim().toLowerCase();
  } catch (_) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "Ugyldig e-post." }) };
  }

  const base = (process.env.SITE_URL || `https://${event.headers.host}`).replace(/\/$/, "");

  try {
    const token = await getToken();
    const res = await fetch(`${baseUrl()}/recurring/v3/agreements`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": process.env.VIPPS_MSN,
        "Idempotency-Key": crypto.randomUUID(),
        "Vipps-System-Name": "customquiz",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pricing: { type: "LEGACY", amount: AMOUNT_ORE, currency: "NOK" },
        interval: { unit: "MONTH", count: 1 },
        merchantRedirectUrl: `${base}/api/vipps-callback`,
        merchantAgreementUrl: `${base}/min-side.html`,
        productName: "CustomQuiz Premium",
        productDescription: "Ubegrenset egne quizer, hele arkivet, ukeskonkurranse.",
      }),
    });

    const txt = await res.text();
    if (!res.ok) throw new Error(`agreements ${res.status}: ${txt.slice(0, 300)}`);
    const data = JSON.parse(txt);

    // Lagre kobling email ↔ agreementId så callbacken kan slå opp e-posten.
    try {
      await upsertSubscriber({ email, status: "pending", source: "vipps", plan: "premium_monthly", vipps_agreement_id: data.agreementId });
      await logEvent("vipps", "agreement.created", email, data.agreementId, null);
    } catch (_) { /* DB ikke satt opp ennå skal ikke blokkere */ }

    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ url: data.vippsConfirmationUrl }) };
  } catch (err) {
    return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: "Vipps-feil: " + err.message }) };
  }
};
