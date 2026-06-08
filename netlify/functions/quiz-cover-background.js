/**
 * CustomQuiz — quiz-cover-generator (Netlify Background Function).
 * ---------------------------------------------------------------
 * Genererer unike cover-illustrasjoner for arkiv-quizene (quiz_library) i
 * brand-stil via OpenAI, laster dem opp til Supabase Storage og setter
 * hero_img = den offentlige URL-en på raden. Bare MOTIVET varierer per quiz —
 * stilen er låst i _images.js, så hele arkivet henger visuelt sammen.
 *
 * Hvorfor BACKGROUND: bildegenerering tar ~10–20 s pr. bilde, godt over
 * grensa for vanlige (synkrone) funksjoner. Bakgrunnsfunksjoner får inntil
 * 15 min, så vi kan ta en batch om gangen.
 *
 * KOSTER PENGER → token-beskyttet. Sett COVER_TOKEN i Netlify env og send den
 * med som ?token=… (eller header x-cover-token). Uten COVER_TOKEN: 503.
 *
 * Bruk (GET eller POST):
 *   /.netlify/functions/quiz-cover-background?token=XXX&slug=<slug>      → ett bilde
 *   /.netlify/functions/quiz-cover-background?token=XXX&all=1&limit=10   → backfill-batch
 *   …&force=1   → regenerér selv om raden allerede har et ekte cover
 *
 * Resultatet verifiseres via den deterministiske offentlige URL-en:
 *   <SUPABASE_URL>/storage/v1/object/public/quiz-covers/<slug>.png
 */
const { supa } = require("./_supabase");
const { makeCover, safeKey, coverExists, publicUrlFor } = require("./_images");

const TABLE = "quiz_library";

function qp(event, name) {
  const v = (event.queryStringParameters || {})[name];
  return v == null ? "" : String(v);
}

// Et "ekte" cover er en http(s)-URL. Alt annet (null eller "kategori-…") =
// fortsatt delt kategoribilde → trenger eget cover.
function hasRealCover(hero) {
  return /^https?:\/\//i.test(String(hero || ""));
}

// Hent kandidat-rader for backfill (mangler ekte cover, ikke fotball/crest).
async function pickCandidates(db, limit, force) {
  const { data, error } = await db
    .from(TABLE)
    .select("slug, title, lede, category, category_label, hero_img")
    .eq("published", true)
    .neq("category", "fotball")        // fotball-quizer bruker klubb-crest
    .order("plays", { ascending: false })
    .limit(800);
  if (error) throw new Error("les quiz_library: " + error.message);
  const rows = (data || []).filter((r) => force || !hasRealCover(r.hero_img));
  return rows.slice(0, limit);
}

async function processRow(db, row, force) {
  // Gratis re-link: finnes bildet allerede i Storage (f.eks. fordi library-sync
  // nullet hero_img tilbake til kategori-bildet), peker vi bare raden dit igjen
  // uten å betale for et nytt OpenAI-kall.
  if (!force && (await coverExists(row.slug))) {
    const url = publicUrlFor(row.slug);
    const { error } = await db.from(TABLE).update({ hero_img: url }).eq("slug", row.slug);
    if (error) throw new Error("re-link hero_img: " + error.message);
    return { slug: row.slug, key: safeKey(row.slug) + ".png", url, relinked: true };
  }
  const { url, prompt } = await makeCover({
    slug: row.slug,
    title: row.title,
    category: row.category,
    categoryLabel: row.category_label,
    lede: row.lede,
  });
  const { error } = await db.from(TABLE).update({ hero_img: url }).eq("slug", row.slug);
  if (error) throw new Error("oppdater hero_img: " + error.message);
  return { slug: row.slug, key: safeKey(row.slug) + ".png", url, prompt_chars: prompt.length };
}

exports.handler = async (event) => {
  // Token-port (default-deny — endepunktet bruker betalte API-kall).
  const expected = process.env.COVER_TOKEN;
  if (!expected) {
    return { statusCode: 503, body: JSON.stringify({ error: "COVER_TOKEN er ikke satt i env." }) };
  }
  const given = qp(event, "token") || event.headers["x-cover-token"] || "";
  if (given !== expected) {
    return { statusCode: 401, body: JSON.stringify({ error: "Ugyldig eller manglende token." }) };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Mangler OPENAI_API_KEY." }) };
  }

  const db = supa();
  const force = qp(event, "force") === "1";
  const slug = qp(event, "slug").trim();
  const results = [];
  const errors = [];

  try {
    let rows;
    if (slug) {
      const { data, error } = await db
        .from(TABLE)
        .select("slug, title, lede, category, category_label, hero_img")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error("les rad: " + error.message);
      if (!data) return { statusCode: 404, body: JSON.stringify({ error: "Fant ingen quiz med slug " + slug }) };
      rows = [data];
    } else if (qp(event, "all") === "1") {
      const limit = Math.max(1, Math.min(40, parseInt(qp(event, "limit") || "10", 10)));
      rows = await pickCandidates(db, limit, force);
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "Oppgi ?slug=… eller ?all=1&limit=N" }) };
    }

    for (const row of rows) {
      try {
        const res = await processRow(db, row, force);
        results.push(res);
        console.log("[cover] OK", res.slug, "→", res.url);
      } catch (e) {
        errors.push({ slug: row.slug, error: e.message });
        console.error("[cover] FEIL", row.slug, e.message);
      }
    }
  } catch (e) {
    console.error("[cover] avbrutt:", e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message, done: results, errors }) };
  }

  const summary = { generated: results.length, failed: errors.length, results, errors };
  console.log("[cover] ferdig:", JSON.stringify({ generated: results.length, failed: errors.length }));
  return { statusCode: 200, body: JSON.stringify(summary) };
};
