/**
 * CustomQuiz — list arkiverte quizer (offentlig).
 * GET /api/library-list?category=geografi&limit=500
 * Returnerer lette metadata-rader (uten questions) for arkiv-visning.
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const qp = event.queryStringParameters || {};
  const category = (qp.category || "").slice(0, 40).trim();
  const limit = Math.min(Math.max(parseInt(qp.limit, 10) || 1000, 1), 2000);

  const client = library.db();
  if (!client)
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ quizzes: [] }) };

  try {
    let q = client
      .from(library.TABLE)
      .select("slug, title, lede, difficulty, category, category_label, hero_img, num_questions, plays, rating, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (category && library.VALID_CATEGORIES.includes(category)) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ quizzes: data || [], count: (data || []).length }),
    };
  } catch (e) {
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke liste arkivet.", detail: e.message }) };
  }
};
