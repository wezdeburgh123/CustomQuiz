/**
 * CustomQuiz — quiz-cover DIAGNOSE (synkron, midlertidig).
 * -------------------------------------------------------
 * Samme pipeline som quiz-cover-background, men SYNKRON: returnerer
 * OpenAI/Supabase-feilen direkte i HTTP-svaret, så vi slipper å grave i
 * Netlify-loggene. Feil kommer på <2 s; et vellykket bilde kan ta 10–20 s
 * (kan da treffe timeout — bruk bakgrunnsfunksjonen for ekte kjøringer).
 *
 * Token-beskyttet som bakgrunnsfunksjonen (COVER_TOKEN).
 *   /.netlify/functions/quiz-cover-test?token=XXX&slug=<slug>
 *   …&dry=1   → bare bygg prompten, ikke kall OpenAI (gratis sjekk)
 */
const { supa } = require("./_supabase");
const { makeCover, coverPrompt, generateImageB64, uploadCover } = require("./_images");

const TABLE = "quiz_library";
const J = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj, null, 2) });

exports.handler = async (event) => {
  const expected = process.env.COVER_TOKEN;
  if (!expected) return J(503, { error: "COVER_TOKEN ikke satt i env." });
  const q = event.queryStringParameters || {};
  if ((q.token || "") !== expected) return J(401, { error: "Ugyldig token." });
  if (!process.env.OPENAI_API_KEY) return J(500, { error: "Mangler OPENAI_API_KEY." });

  const slug = (q.slug || "").trim();
  if (!slug) return J(400, { error: "Oppgi ?slug=…" });

  const db = supa();
  const { data: row, error } = await db
    .from(TABLE)
    .select("slug, title, lede, category, category_label, hero_img")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return J(500, { step: "les rad", error: error.message });
  if (!row) return J(404, { error: "Fant ingen quiz med slug " + slug });

  const prompt = coverPrompt({ title: row.title, category: row.category, categoryLabel: row.category_label, lede: row.lede });
  if (q.dry === "1") return J(200, { ok: true, dry: true, slug: row.slug, model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", quality: process.env.OPENAI_IMAGE_QUALITY || "medium", prompt });

  try {
    const b64 = await generateImageB64(prompt);
    const url = await uploadCover(row.slug, b64);
    await db.from(TABLE).update({ hero_img: url }).eq("slug", row.slug);
    return J(200, { ok: true, slug: row.slug, url, bytes: Math.round(b64.length * 0.75) });
  } catch (e) {
    return J(502, { ok: false, slug: row.slug, step: "generer/last opp", error: e.message });
  }
};
