/**
 * CustomQuiz — rapport + admin kill-switch for arkiv-quizzer.
 * ----------------------------------------------------------
 * Sikkerhetsnettet bak auto-publisering (BASEN-vekst-og-moderering-spec.md).
 *
 * POST /api/library-flag
 *   { slug }                          → brukerrapport: setter review_status='flagged'
 *                                       (skjules fra arkiv/cache til vurdert).
 *   { slug, action, token }           → admin kill-switch (krever ADMIN_TOKEN):
 *        action="remove"   → 'removed'  (tatt ned permanent)
 *        action="restore"  → 'auto_ok'  (gjenåpnet etter vurdering)
 *
 * Krever SUPABASE_SERVICE_ROLE_KEY for skriving (via _library.db()).
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) }; }

  const slug = String(body.slug || "").slice(0, 200).trim();
  if (!slug)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Mangler slug." }) };

  const action = String(body.action || "").trim();

  // ── Admin kill-switch ──
  if (action) {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken)
      return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Admin ikke konfigurert (ADMIN_TOKEN mangler)." }) };
    if (String(body.token || "") !== adminToken)
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig admin-token." }) };
    const target = action === "remove" ? "removed" : action === "restore" ? "auto_ok" : null;
    if (!target)
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ukjent action (bruk remove|restore)." }) };
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
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, message: "Takk — quizen er sendt til vurdering." }) };
};
