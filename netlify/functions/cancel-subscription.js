/**
 * Si opp abonnement (Fase D)
 * ---------------------------
 * Autentisert med Supabase-JWT (Bearer, samme mønster som generate-quiz.js).
 * Finner brukerens abonnement og avslutter det på riktig spor:
 *   - Stripe: åpner Stripe Customer Portal (kunden kan si opp / endre kort der).
 *             Returnerer { url } som frontend redirecter til.
 *   - Vipps:  stopper avtalen (PATCH agreement → STOPPED) og setter status
 *             'canceled'. Returnerer { ok: true, message }.
 *
 * POST  (Authorization: Bearer <supabase access token>)
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_ANON_KEY (verifiser JWT), SUPABASE_SERVICE_ROLE_KEY (oppslag/oppdatering)
 *   STRIPE_SECRET_KEY, SITE_URL
 *   VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN, VIPPS_ENV
 */
const crypto = require("crypto");
const { supa, upsertSubscriber, logEvent } = require("./_supabase");

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const reply = (code, obj) => ({ statusCode: code, headers: JSON_HEADERS, body: JSON.stringify(obj) });

function vippsBaseUrl() {
  return (process.env.VIPPS_ENV === "prod")
    ? "https://api.vippsmobilepay.com"
    : "https://apitest.vippsmobilepay.com";
}
async function vippsToken() {
  const res = await fetch(`${vippsBaseUrl()}/accesstoken/get`, {
    method: "POST",
    headers: {
      client_id: process.env.VIPPS_CLIENT_ID,
      client_secret: process.env.VIPPS_CLIENT_SECRET,
      "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
    },
  });
  if (!res.ok) throw new Error("accesstoken " + res.status);
  return (await res.json()).access_token;
}

// Verifiser Supabase-JWT → returner e-post, eller null.
async function emailFromToken(event) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const authz = event.headers.authorization || event.headers.Authorization || "";
  const token = authz.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { createClient } = require("@supabase/supabase-js");
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await anon.auth.getUser(token);
    if (error || !data || !data.user || !data.user.email) return null;
    return data.user.email.toLowerCase();
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Bruk POST." });

  const email = await emailFromToken(event);
  if (!email) return reply(401, { error: "Logg inn for å si opp abonnementet." });

  // Hent abonnementet (service role omgår RLS).
  let sub;
  try {
    const { data, error } = await supa()
      .from("subscribers")
      .select("status, source, stripe_customer_id, vipps_agreement_id")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new Error(error.message);
    sub = data;
  } catch (err) {
    return reply(503, { error: "Kunne ikke hente abonnementet akkurat nå. Prøv igjen om litt." });
  }

  if (!sub || (sub.status !== "active" && sub.status !== "past_due")) {
    return reply(409, { error: "Fant ikke et aktivt abonnement å si opp." });
  }

  const site = (process.env.SITE_URL || `https://${event.headers.host}`).replace(/\/$/, "");

  // ── Stripe: Customer Portal ──
  if (sub.source === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY || !sub.stripe_customer_id) {
      return reply(500, { error: "Stripe-oppsigelse er ikke tilgjengelig (mangler nøkkel/kunde)." });
    }
    try {
      const Stripe = require("stripe");
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${site}/min-side.html`,
      });
      await logEvent("stripe", "portal.opened", email, sub.stripe_customer_id, null);
      return reply(200, { kind: "redirect", url: portal.url });
    } catch (err) {
      return reply(502, { error: "Stripe-feil: " + err.message });
    }
  }

  // ── Vipps: stopp avtalen ──
  if (sub.source === "vipps") {
    if (!sub.vipps_agreement_id || !process.env.VIPPS_CLIENT_ID) {
      return reply(500, { error: "Vipps-oppsigelse er ikke tilgjengelig (mangler nøkkel/avtale)." });
    }
    try {
      const token = await vippsToken();
      const res = await fetch(`${vippsBaseUrl()}/recurring/v3/agreements/${sub.vipps_agreement_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
          "Merchant-Serial-Number": process.env.VIPPS_MSN,
          "Idempotency-Key": crypto.randomUUID(),
          "Vipps-System-Name": "customquiz",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "STOPPED" }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`agreement PATCH ${res.status}: ${txt.slice(0, 200)}`);
      }
      await upsertSubscriber({ email, status: "canceled" });
      await logEvent("vipps", "agreement.stopped", email, sub.vipps_agreement_id, null);
      return reply(200, { kind: "done", message: "Abonnementet er sagt opp. Du har tilgang ut perioden." });
    } catch (err) {
      return reply(502, { error: "Vipps-feil: " + err.message });
    }
  }

  return reply(409, { error: "Ukjent betalingskilde — kontakt hei@customquiz.no." });
};
