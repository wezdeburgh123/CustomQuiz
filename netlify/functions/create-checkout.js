/**
 * Stripe Checkout — abonnement (kort + Apple Pay)
 * ------------------------------------------------
 * Oppretter en Checkout-session i subscription-modus og returnerer { url }.
 * Frontend sender brukeren dit. Apple Pay vises automatisk i Checkout når
 * domenet er verifisert hos Stripe (Settings → Payments → Apple Pay) og
 * brukeren er på Safari/iOS med Apple Pay tilgjengelig.
 *
 * POST { email, plan }  ->  { url }
 *
 * Env:
 *   STRIPE_SECRET_KEY        (sk_live_… / sk_test_…)
 *   STRIPE_PRICE_ID          (price_… for 49 kr/mnd, recurring)
 *   SITE_URL                 (https://customquiz.no)
 */
const Stripe = require("stripe");
const { upsertSubscriber, logEvent } = require("./_supabase");

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };
  }

  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SITE_URL } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: "Stripe er ikke konfigurert (STRIPE_SECRET_KEY / STRIPE_PRICE_ID mangler)." }) };
  }

  let email;
  try {
    const body = JSON.parse(event.body || "{}");
    email = String(body.email || "").trim().toLowerCase();
  } catch (_) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "Ugyldig e-post." }) };
  }

  const stripe = Stripe(STRIPE_SECRET_KEY);
  const base = (SITE_URL || `https://${event.headers.host}`).replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      // Apple Pay + kort dekkes av "card". Stripe viser Apple Pay-knappen
      // automatisk når den er tilgjengelig hos brukeren.
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      locale: "nb",
      success_url: `${base}/?betaling=ok&kilde=stripe`,
      cancel_url: `${base}/arkiv.html?betaling=avbrutt`,
      metadata: { email, plan: "premium_monthly", source: "stripe" },
      subscription_data: { metadata: { email } },
    });

    // Marker som pending til webhooken bekrefter aktivt abonnement.
    try {
      await upsertSubscriber({ email, status: "pending", source: "stripe", plan: "premium_monthly" });
      await logEvent("stripe", "checkout.created", email, session.id, null);
    } catch (_) { /* DB ikke satt opp ennå skal ikke blokkere betaling */ }

    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: "Stripe-feil: " + err.message }) };
  }
};
