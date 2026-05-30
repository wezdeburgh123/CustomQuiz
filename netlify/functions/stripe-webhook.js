/**
 * Stripe Webhook — synker abonnementsstatus til Supabase
 * -------------------------------------------------------
 * Lytt på disse hendelsene i Stripe → Developers → Webhooks:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *
 * Endepunkt: https://customquiz.no/api/stripe-webhook
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   (whsec_…)
 */
const Stripe = require("stripe");
const { upsertSubscriber, logEvent } = require("./_supabase");

exports.handler = async (event) => {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return { statusCode: 500, body: "Stripe webhook ikke konfigurert." };
  }
  const stripe = Stripe(STRIPE_SECRET_KEY);

  // Stripe krever RÅ body for signaturverifisering.
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  const sig = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

  let evt;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return { statusCode: 400, body: "Signatur feilet: " + err.message };
  }

  try {
    const obj = evt.data.object;
    if (evt.type === "checkout.session.completed") {
      const email = (obj.customer_email || obj.metadata?.email || "").toLowerCase();
      await upsertSubscriber({
        email,
        status: "active",
        source: "stripe",
        stripe_customer_id: obj.customer,
        stripe_subscription_id: obj.subscription,
      });
      await logEvent("stripe", evt.type, email, obj.subscription, obj);
    } else if (evt.type === "customer.subscription.updated" || evt.type === "customer.subscription.deleted") {
      const email = (obj.metadata?.email || "").toLowerCase();
      const map = { active: "active", trialing: "active", past_due: "past_due", canceled: "canceled", unpaid: "past_due" };
      await upsertSubscriber({
        email,
        status: evt.type.endsWith("deleted") ? "canceled" : (map[obj.status] || "none"),
        source: "stripe",
        stripe_subscription_id: obj.id,
        current_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null,
      });
      await logEvent("stripe", evt.type, email, obj.id, obj);
    }
  } catch (err) {
    // Returner 200 likevel ved DB-feil så Stripe ikke spammer retries i det uendelige;
    // hendelsen ligger uansett i Stripe-loggen og kan resendes.
    return { statusCode: 200, body: "mottatt (db-feil: " + err.message + ")" };
  }

  return { statusCode: 200, body: "ok" };
};
