/**
 * Vipps Recurring — landing etter godkjenning (merchantRedirectUrl)
 * -----------------------------------------------------------------
 * Vipps sender brukeren hit med ?agreementId=... etter at avtalen er
 * godkjent/avvist i appen. Vi henter avtalestatus fra Vipps, oppdaterer
 * Supabase, og redirecter brukeren tilbake til siden.
 *
 * GET /api/vipps-callback?agreementId=agr_xxx
 *
 * NB: Selve den månedlige TREKKINGEN (charges) gjøres ikke her — den
 * settes opp som en planlagt jobb (se BETALING-plan.md, fase 4):
 * en daglig funksjon som sender charge minst 1 dag før forfall på alle
 * aktive avtaler. Denne callbacken aktiverer bare selve abonnementet.
 */
const { upsertSubscriber, logEvent, supa } = require("./_supabase");
const { sendTemplate, welcomeTemplateId } = require("./_brevo");

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
  if (!res.ok) throw new Error("accesstoken " + res.status);
  return (await res.json()).access_token;
}

exports.handler = async (event) => {
  const site = (process.env.SITE_URL || `https://${event.headers.host}`).replace(/\/$/, "");
  const agreementId = (event.queryStringParameters || {}).agreementId;
  const redirect = (to) => ({ statusCode: 302, headers: { Location: `${site}${to}` }, body: "" });

  if (!agreementId) return redirect("/arkiv.html?betaling=ukjent");

  try {
    const token = await getToken();
    const res = await fetch(`${baseUrl()}/recurring/v3/agreements/${agreementId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": process.env.VIPPS_MSN,
      },
    });
    if (!res.ok) throw new Error("agreement GET " + res.status);
    const agr = await res.json();

    // Finn e-posten vi lagret ved opprettelse (+ forrige status, så velkomst kun sendes én gang).
    let email = null, prevStatus = null;
    try {
      const { data } = await supa().from("subscribers").select("email, status").eq("vipps_agreement_id", agreementId).maybeSingle();
      email = data?.email || null;
      prevStatus = data?.status || null;
    } catch (_) { /* DB kan mangle i tidlig fase */ }

    const active = agr.status === "ACTIVE";
    if (email) {
      await upsertSubscriber({ email, status: active ? "active" : "canceled", source: "vipps", vipps_agreement_id: agreementId });
      await logEvent("vipps", "agreement.status." + agr.status, email, agreementId, agr);

      // Fase D — velkomst ved første aktivering (kvittering sendes når første trekk opprettes i vipps-charge.js).
      if (active && prevStatus !== "active") {
        const base = (process.env.SITE_URL || `https://${event.headers.host}`).replace(/\/$/, "");
        await sendTemplate(welcomeTemplateId(), email, { quiz_url: base + "/" });
      }
    }

    return redirect(active ? "/?betaling=ok&kilde=vipps" : "/arkiv.html?betaling=avbrutt");
  } catch (err) {
    return redirect("/arkiv.html?betaling=feil");
  }
};
