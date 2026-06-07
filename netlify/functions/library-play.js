/**
 * CustomQuiz — tell et spill på en arkiv-quiz.
 * --------------------------------------------
 * POST /api/library-play  { slug }
 * Bumper plays atomisk via RPC-en increment_quiz_plays (se
 * db/migration-quiz-library-plays-rpc.sql). Fire-and-forget fra spilleren:
 * svarer raskt og lar aldri en telle-feil påvirke spillopplevelsen.
 *
 * Datagrunnlag for forsidas «populær»-utvalg (fase 3).
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  let slug = "";
  try { slug = String(JSON.parse(event.body || "{}").slug || "").slice(0, 200).trim(); }
  catch (_) { return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) }; }
  if (!slug)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Mangler slug." }) };

  const client = library.db();
  // Uten DB/skrive-konfig: stille no-op (telling skal aldri blokkere).
  if (!client || !library.canWrite())
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: false, skipped: true }) };

  try {
    const { error } = await client.rpc("increment_quiz_plays", { p_slug: slug });
    if (error) {
      console.warn("[play] rpc feilet:", error.message);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: false }) };
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.warn("[play] exception:", e.message);
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: false }) };
  }
};
