/**
 * CustomQuiz — hent én arkivert quiz på slug (offentlig).
 * GET /api/library-get?slug=romerriket__medium
 * Brukes av generator-skallet (?lib=<slug>) for å spille en arkivert quiz.
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const slug = ((event.queryStringParameters && event.queryStringParameters.slug) || "").slice(0, 200).trim();
  if (!slug)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Mangler slug." }) };

  const client = library.db();
  if (!client)
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Arkivet er ikke konfigurert." }) };

  try {
    const { data, error } = await client
      .from(library.TABLE)
      .select("slug, title, lede, questions, difficulty, category, category_label, team, hero_img")
      .eq("slug", slug)
      .eq("published", true)
      .eq("review_status", "auto_ok")  // ikke servér flagged/removed
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data)
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ikke funnet." }) };
    return { statusCode: 200, headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=300" }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke hente quiz.", detail: e.message }) };
  }
};
