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
const { upsertSubscriber, logEvent, emailForStripeRef, updateByStripeSub } = require("./_supabase");
const { sendTemplate, welcomeTemplateId, receiptTemplateId, formatDateNb } = require("./_brevo");

/**
 * Periodeslutt for et Stripe Subscription-objekt → ISO-streng eller null.
 * NB: Fra Stripe Basil (2025-03-31, og dermed dahlia 2026-05-27) ligger
 * current_period_end på subscription ITEMS, ikke på selve subscription-objektet.
 * Vi leser items først og faller tilbake på det gamle toppnivå-feltet for
 * bakoverkompat med eldre objekter.
 */
function periodEndIso(sub) {
  if (!sub) return null;
  const unix = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end ?? null;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

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

      // Hent selve abonnementet for ekte periodeslutt + oppsigelsesflagg
      // (Checkout-sessionen inneholder ikke disse feltene selv).
      let sub = null;
      if (obj.subscription) {
        try { sub = await stripe.subscriptions.retrieve(obj.subscription); } catch (_) { /* ikke kritisk */ }
      }
      const periodEnd = periodEndIso(sub);

      await upsertSubscriber({
        email,
        status: "active",
        source: "stripe",
        stripe_customer_id: obj.customer,
        stripe_subscription_id: obj.subscription,
        current_period_end: periodEnd,
        cancel_at_period_end: !!(sub && sub.cancel_at_period_end),
      });
      await logEvent("stripe", evt.type, email, obj.subscription, obj);

      // Fase D — velkomst + kvittering (feiler stille hvis Brevo ikke konfigurert).
      if (email) {
        const site = (process.env.SITE_URL || "https://customquiz.no").replace(/\/$/, "");
        const belop = obj.amount_total ? Math.round(obj.amount_total / 100) : 49;
        const now = new Date();
        // Bruk ekte periodeslutt fra Stripe; fall tilbake på «nå + 1 mnd».
        const neste = periodEnd ? new Date(periodEnd)
          : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()));
        await sendTemplate(welcomeTemplateId(), email, { quiz_url: site + "/" });
        await sendTemplate(receiptTemplateId(), email, {
          belop: String(belop),
          dato: formatDateNb(now),
          betalingsmetode: "Apple Pay / kort",
          neste_trekk: formatDateNb(neste),
          min_side_url: site + "/min-side.html",
        });
      }
    } else if (evt.type === "customer.subscription.updated" || evt.type === "customer.subscription.deleted") {
      const map = { active: "active", trialing: "active", past_due: "past_due", canceled: "canceled", unpaid: "past_due" };
      const fields = {
        status: evt.type.endsWith("deleted") ? "canceled" : (map[obj.status] || "none"),
        source: "stripe",
        current_period_end: periodEndIso(obj),
        cancel_at_period_end: !!obj.cancel_at_period_end,
      };

      // Finn brukeren: metadata.email først, ellers fall tilbake på
      // subscription-/customer-id så kanselleringen alltid treffer riktig rad.
      let email = (obj.metadata?.email || "").toLowerCase();
      if (!email) {
        email = (await emailForStripeRef({ subscription_id: obj.id, customer_id: obj.customer })).toLowerCase();
      }

      if (email) {
        await upsertSubscriber({ email, stripe_subscription_id: obj.id, ...fields });
      } else {
        // Ingen e-post å utlede — oppdater eksisterende rad direkte via sub-id
        // (oppretter ingen tom-e-post-rad).
        await updateByStripeSub(obj.id, fields);
      }
      await logEvent("stripe", evt.type, email, obj.id, obj);
    }
  } catch (err) {
    // Returner 200 likevel ved DB-feil så Stripe ikke spammer retries i det uendelige;
    // hendelsen ligger uansett i Stripe-loggen og kan resendes.
    return { statusCode: 200, body: "mottatt (db-feil: " + err.message + ")" };
  }

  return { statusCode: 200, body: "ok" };
};
