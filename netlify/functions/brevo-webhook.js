/**
 * Brevo-webhook → synk avmeldinger tilbake til profiles.
 * ------------------------------------------------------
 * Når noen melder seg av (eller markerer som spam / blokkeres) via Brevo,
 * sender Brevo en webhook hit. Vi setter da marketing_opt_in=false på profilen
 * med samme e-post, så lista vår og Brevo holdes i sync (lukker hullet der en
 * Brevo-side avmelding ellers ikke ville stoppet våre egne utsendinger).
 *
 * Sikkerhet: sett BREVO_WEBHOOK_SECRET og legg ?token=<secret> i webhook-URL-en
 * i Brevo. Uten secret satt prosesseres alt (sett den for produksjon).
 *
 * Brevo-oppsett: Brevo → (Transactional/Contacts) → Webhooks → ny webhook mot
 * https://customquiz.no/api/brevo-webhook?token=<secret> for «unsubscribe».
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_WEBHOOK_SECRET (valgfri)
 */
const { supa } = require("./_supabase");

const reply = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(obj || { ok: true }) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Bruk POST." });

  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (secret) {
    const qs = event.queryStringParameters || {};
    if ((qs.token || "") !== secret) return reply(401, { error: "Ugyldig token." });
  }

  let body = {};
  // Svar alltid 200 ved parse-feil så Brevo ikke retry-spammer.
  try { body = JSON.parse(event.body || "{}"); } catch (_) { return reply(200, { ok: true }); }

  const ev = String(body.event || body.type || "").toLowerCase();
  const email = String(body.email || "").toLowerCase().trim();
  const isOptOut = /unsub|spam|blocked|blocklist/.test(ev);

  if (email && isOptOut) {
    try {
      await supa().from("profiles").update({ marketing_opt_in: false, opt_in_source: "brevo-" + ev }).eq("email", email);
    } catch (_) { /* stille — webhook skal alltid svare 200 */ }
  }

  return reply(200, { ok: true });
};
