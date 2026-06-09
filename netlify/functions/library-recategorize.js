/**
 * CustomQuiz — engangs/idempotent backfill av arkivkategori for bruker-quizer.
 * --------------------------------------------------------------------------
 * Bruker-genererte quizer ble tidligere lagret med hardkodet category="mix".
 * Dette endepunktet re-utleder kategori fra temaene (library.categorizeThemes)
 * og oppdaterer KUN `category`-kolonnen — hero_img (ev. AI-cover) røres ikke.
 *
 * POST /api/library-recategorize  { token, dry? }   → anbefalt (token i body, ikke URL)
 * GET  /api/library-recategorize?token=…&dry=1      → forhåndsvis (ingen skriving)
 *
 * Token-beskyttet (samme ADMIN_TOKEN som library-flag). Foretrekk POST så tokenet
 * ikke havner i URL/logger. Krever SUPABASE_SERVICE_ROLE_KEY for skriving.
 * Idempotent — trygt å kjøre flere ganger.
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const qp = event.queryStringParameters || {};
  let body = {};
  if (event.httpMethod === "POST") {
    try { body = JSON.parse(event.body || "{}"); } catch (_) { body = {}; }
  }
  const adminToken = process.env.ADMIN_TOKEN;
  const token = body.token != null ? String(body.token) : String(qp.token || "");
  const dry = body.dry === true || qp.dry === "1" || qp.dry === "true";

  if (!adminToken)
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Admin ikke konfigurert (ADMIN_TOKEN mangler)." }) };
  if (token !== adminToken)
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig admin-token." }) };
  if (!dry && !library.canWrite())
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Skriving ikke konfigurert (SUPABASE_SERVICE_ROLE_KEY mangler)." }) };

  const client = library.db();
  if (!client)
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "DB ikke konfigurert." }) };

  try {
    // Alle bruker-genererte rader (kun disse ble hardkodet til "mix").
    const { data, error } = await client
      .from(library.TABLE)
      .select("slug, themes, category")
      .eq("source", "user")
      .limit(5000);
    if (error) throw new Error(error.message);

    const rows = data || [];
    const changes = [];
    for (const r of rows) {
      const next = library.categorizeThemes(r.themes);
      if (next !== r.category) changes.push({ slug: r.slug, from: r.category, to: next });
    }

    if (dry)
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, dryRun: true, scanned: rows.length, wouldChange: changes.length, changes }) };

    // Oppdater KUN category — bevarer hero_img/AI-cover og alt annet.
    let updated = 0;
    const failed = [];
    for (const c of changes) {
      const { error: e } = await client.from(library.TABLE).update({ category: c.to }).eq("slug", c.slug);
      if (e) failed.push({ slug: c.slug, error: e.message });
      else updated++;
    }
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, scanned: rows.length, updated, failed, changes }),
    };
  } catch (e) {
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Backfill feilet.", detail: e.message }) };
  }
};
