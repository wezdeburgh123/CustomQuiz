/**
 * CustomQuiz — synk arkiv-fil → Supabase quiz_library.
 * ----------------------------------------------------
 * Det nattlige genererings-skiftet (Claude-konto) skriver ferdige quizer til
 * repo-fila quiz-library/library.ndjson (én JSON-quiz per linje). Denne
 * funksjonen leser den fila og UPSERTER til quiz_library (idempotent på slug).
 *
 * To måter å kjøre på:
 *   A) FIL-MODUS (anbefalt):  GET /api/library-sync
 *      Leser quiz-library/library.ndjson (må være med i deploy via
 *      included_files i netlify.toml). Kjøres manuelt etter push, eller
 *      automatisk via schedule i netlify.toml.
 *   B) BODY-MODUS:  POST /api/library-sync  { "quizzes": [ {...}, ... ] }
 *      Krever LIBRARY_SYNC_TOKEN (header x-sync-token eller ?token=).
 *
 * Skriving krever SUPABASE_SERVICE_ROLE_KEY (allerede i Netlify-env).
 * Hver quiz-rad: { themes[], category, category_label?, difficulty, title,
 * lede, questions[], model?, grounded?, source? }. slug + hero_img utledes
 * automatisk hvis de mangler.
 */
const fs = require("fs");
const path = require("path");
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

const FILE_REL = "quiz-library/library.ndjson";

function readLibraryFile() {
  const candidates = [
    process.env.LAMBDA_TASK_ROOT && path.join(process.env.LAMBDA_TASK_ROOT, FILE_REL),
    path.join(process.cwd(), FILE_REL),
    path.join(__dirname, "..", "..", FILE_REL),
    path.join("/var/task", FILE_REL),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
    } catch (_) { /* prøv neste */ }
  }
  return null;
}

function parseNdjson(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try { out.push(JSON.parse(t)); } catch (_) { /* hopp over korrupt linje */ }
  }
  return out;
}

function toRow(item) {
  const themes = Array.isArray(item.themes) ? item.themes : (item.theme ? [item.theme] : []);
  if (!themes.length || !Array.isArray(item.questions) || item.questions.length === 0) return null;
  const difficulty = ["lett", "medium", "vanskelig"].includes(item.difficulty) ? item.difficulty : "medium";
  const category = library.VALID_CATEGORIES.includes(item.category) ? item.category : "mix";
  const team = (category === "fotball" && item.team) ? String(item.team).trim() : null;
  return {
    slug: item.slug || library.makeSlug(themes, difficulty),
    themes,
    category,
    category_label: item.category_label || null,
    team,
    difficulty,
    title: item.title || "Quiz",
    lede: item.lede || "",
    questions: item.questions,
    hero_img: item.hero_img || library.heroForCategory(category),
    source: item.source || "nightly",
    model: item.model || null,
    grounded: !!item.grounded,
    published: item.published === false ? false : true,
  };
}

async function upsertAll(rows) {
  const client = library.db();
  if (!client) throw new Error("Mangler Supabase-konfig (service-nøkkel).");
  if (!library.canWrite()) throw new Error("Mangler SUPABASE_SERVICE_ROLE_KEY — kan ikke skrive.");
  let inserted = 0;
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const { error } = await client.from(library.TABLE).upsert(batch, { onConflict: "slug" });
    if (error) throw new Error("upsert: " + error.message);
    inserted += batch.length;
  }
  return inserted;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const token = process.env.LIBRARY_SYNC_TOKEN || "";
  const given = (event.headers["x-sync-token"] || (event.queryStringParameters && event.queryStringParameters.token) || "").trim();

  try {
    let items = [];
    if (event.httpMethod === "POST") {
      // BODY-MODUS krever alltid token.
      if (!token || given !== token)
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig eller manglende token." }) };
      const body = JSON.parse(event.body || "{}");
      items = Array.isArray(body.quizzes) ? body.quizzes : (body.ndjson ? parseNdjson(body.ndjson) : []);
    } else {
      // FIL-MODUS. Hvis token er satt i env, krev det også her.
      if (token && given !== token)
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig token." }) };
      const text = readLibraryFile();
      if (text == null)
        return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Fant ikke " + FILE_REL + " i deploy. Er included_files satt i netlify.toml?" }) };
      items = parseNdjson(text);
    }

    const rows = items.map(toRow).filter(Boolean);
    if (rows.length === 0)
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, synced: 0, note: "Ingen gyldige quizer å synke." }) };

    const n = await upsertAll(rows);
    console.log("[library-sync] upsertet", n, "quizer");
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, synced: n, parsed: items.length }) };
  } catch (e) {
    console.error("[library-sync] feil:", e.message);
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Synk feilet.", detail: e.message }) };
  }
};
