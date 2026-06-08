/**
 * CustomQuiz — rapport + admin kill-switch + moderasjons-kø for arkiv-quizzer.
 * --------------------------------------------------------------------------
 * Sikkerhetsnettet bak auto-publisering (BASEN-vekst-og-moderering-spec.md).
 *
 * POST /api/library-flag
 *   { slug }                          → brukerrapport: setter review_status='flagged'
 *                                       (skjules fra arkiv/cache til vurdert) + varsler
 *                                       moderator på e-post (Brevo, fire-and-forget).
 *   { action:"list", token }          → admin: hent moderasjons-køen (flagged+removed).
 *   { slug, action, token }           → admin kill-switch (krever ADMIN_TOKEN):
 *        action="remove"   → 'removed'  (tatt ned permanent)
 *        action="restore"  → 'auto_ok'  (gjenåpnet etter vurdering)
 *
 * Krever SUPABASE_SERVICE_ROLE_KEY for skriving (via _library.db()).
 * Varsling krever BREVO_API_KEY + BREVO_SENDER_EMAIL; mottaker = MODERATION_ALERT_EMAIL
 * (default christian@dinamo.no). Alt feiler stille om uconfigurert.
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");
const brevo = require("./_brevo");

const ALERT_TO = process.env.MODERATION_ALERT_EMAIL || "christian@dinamo.no";
const SITE_URL = (process.env.URL || "https://customquiz.no").replace(/\/$/, "");

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Bygg og send moderator-varselet. Henter litt kontekst om quizen for en nyttig
// e-post. Kaster aldri — varsling skal aldri velte selve rapporten.
async function notifyModerator(slug) {
  try {
    let q = null;
    const client = library.db();
    if (client) {
      const { data } = await client
        .from(library.TABLE)
        .select("title, lede, category, category_label, team, source")
        .eq("slug", slug)
        .maybeSingle();
      q = data || null;
    }
    const title = (q && q.title) || slug;
    const cat = (q && (q.category_label || q.category)) || "—";
    const lede = (q && q.lede) || "";
    const adminUrl = SITE_URL + "/admin.html";
    const html = `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#FBF7EE;color:#1F1A14;border:1px solid #C9BD9F;border-radius:16px;overflow:hidden">
        <div style="background:#0A6E5A;color:#FBF7EE;padding:16px 22px;font-size:13px;letter-spacing:.14em;text-transform:uppercase">CustomQuiz · moderasjon</div>
        <div style="padding:22px">
          <p style="margin:0 0 6px;font-size:14px;color:#7A6F5A">En quiz er rapportert og er nå skjult til du vurderer den.</p>
          <h2 style="margin:10px 0 4px;font-family:Georgia,serif;font-size:22px;color:#1F1A14">${esc(title)}</h2>
          <p style="margin:0 0 2px;font-size:13px;color:#7A6F5A">${esc(cat)}${q && q.team ? " · " + esc(q.team) : ""}</p>
          ${lede ? `<p style="margin:8px 0 0;font-size:14px;color:#4B4338;line-height:1.5">${esc(lede)}</p>` : ""}
          <p style="margin:16px 0 0;font-size:12px;color:#7A6F5A">slug: <code>${esc(slug)}</code></p>
          <a href="${esc(adminUrl)}" style="display:inline-block;margin-top:20px;background:#0A6E5A;color:#FBF7EE;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:13px;letter-spacing:.06em;text-transform:uppercase">Åpne moderasjon →</a>
        </div>
      </div>`;
    await brevo.sendEmail(ALERT_TO, `🚩 Quiz rapportert: ${title}`, html);
  } catch (_) { /* varsling skal aldri velte rapporten */ }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) }; }

  const action = String(body.action || "").trim();
  const adminToken = process.env.ADMIN_TOKEN;
  const tokenOk = () => !!adminToken && String(body.token || "") === adminToken;

  // ── Admin: hent moderasjons-køen ──
  if (action === "list") {
    if (!adminToken)
      return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Admin ikke konfigurert (ADMIN_TOKEN mangler)." }) };
    if (!tokenOk())
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig admin-token." }) };
    const res = await library.listByReviewStatus(["flagged", "removed"]);
    if (!res.ok)
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke hente kø.", detail: res.error }) };
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, items: res.rows }) };
  }

  const slug = String(body.slug || "").slice(0, 200).trim();
  if (!slug)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Mangler slug." }) };

  // ── Admin kill-switch ──
  if (action) {
    if (!adminToken)
      return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Admin ikke konfigurert (ADMIN_TOKEN mangler)." }) };
    if (!tokenOk())
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig admin-token." }) };
    const target = action === "remove" ? "removed" : action === "restore" ? "auto_ok" : null;
    if (!target)
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ukjent action (bruk list|remove|restore)." }) };
    const res = await library.setReviewStatus(slug, target);
    if (!res.ok)
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke oppdatere.", detail: res.error }) };
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, slug, review_status: target }) };
  }

  // ── Offentlig brukerrapport ──
  // Skjuler quizen til den er vurdert. (Lav-volum-MVP: ingen rate-limit ennå —
  // admin kan gjenåpne med action=restore om noen mis-rapporterer.)
  const res = await library.setReviewStatus(slug, "flagged");
  if (!res.ok)
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke registrere rapport.", detail: res.error }) };
  await notifyModerator(slug); // fire-and-forget i praksis (kaster aldri)
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, message: "Takk — quizen er sendt til vurdering." }) };
};
