/**
 * CustomQuiz — quiz_library-hjelper (permanent arkiv / cache).
 * -----------------------------------------------------------
 * Brukes av:
 *   - generate-quiz.js / quiz-generate-background.js  → CHECK-DB-FIRST + lagre
 *   - library-list.js                                  → serve arkivet
 *   - library-sync.js                                  → upsert fra repo-fil
 *
 * Nøkkel = `slug`: kanonisk, deterministisk. makeSlug() MÅ holde seg identisk
 * med make_slug() i scripts/build-taxonomy.py og i det nattlige skriptet, ellers
 * bommer cache-oppslaget.
 *
 * Env: SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY for skriving | SUPABASE_ANON_KEY
 * for ren lesing). Mangler service-nøkkel, hopper vi stille over skriving — da
 * fungerer cachen som read-only mot det library-sync allerede har lagt inn.
 */
const { createClient } = require("@supabase/supabase-js");

const TABLE = "quiz_library";

// Kategori → kategoribilde (uten sti/extension). Matcher arkiv.html CATEGORY_TO_IMG.
const CATEGORY_TO_IMG = {
  mix: "kategori-mix",
  historie: "kategori-norsk-historie",
  verdenshistorie: "kategori-verdenshistorie",
  vitenskap: "kategori-naturvitenskap",
  geografi: "kategori-geografi",
  litteratur: "kategori-litteratur",
  kunst: "kategori-kunst",
  film: "kategori-film",
  musikk: "kategori-musikk",
  sport: "kategori-sport",
  fotball: "kategori-sport",
  filosofi: "kategori-filosofi",
  teknologi: "kategori-teknologi",
};
const VALID_CATEGORIES = Object.keys(CATEGORY_TO_IMG);

function heroForCategory(category) {
  return CATEGORY_TO_IMG[category] || CATEGORY_TO_IMG.mix;
}

// ── slug: identisk med Python make_slug() ──
const TRANSLIT = { "æ": "ae", "ø": "o", "å": "a" };
function normToken(s) {
  s = String(s || "").trim().toLowerCase();
  s = s.replace(/[æøå]/g, (c) => TRANSLIT[c] || c);
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s;
}
function makeSlug(themes, difficulty) {
  const list = Array.isArray(themes) ? themes : [themes];
  const toks = list.map(normToken).filter(Boolean).sort();
  return toks.join("+") + "__" + normToken(difficulty || "medium");
}

// ── Supabase-klient: foretrekk service-rolle (skriving), fall tilbake på anon (lesing) ──
let _client = null;
let _canWrite = false;
function db() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url) return null;
  const key = svc || anon;
  if (!key) return null;
  _canWrite = !!svc;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
function canWrite() { db(); return _canWrite; }

/**
 * Slå opp en quiz i arkivet på (themes, difficulty). Returnerer quiz-objektet
 * { title, lede, questions } eller null. Brukes for CHECK-DB-FIRST.
 */
async function findByThemes(themes, difficulty) {
  const client = db();
  if (!client) return null;
  const slug = makeSlug(themes, difficulty);
  try {
    const { data, error } = await client
      .from(TABLE)
      .select("title, lede, questions, hero_img, category")
      .eq("slug", slug)
      .eq("published", true)
      .eq("review_status", "auto_ok")  // ikke servér flagged/removed som cache
      .maybeSingle();
    if (error || !data) return null;
    return { title: data.title, lede: data.lede, questions: data.questions, hero_img: data.hero_img, category: data.category, cached: true };
  } catch (_) {
    return null; // cache-bom skal aldri velte generering
  }
}

/**
 * Lagre en nygenerert quiz i arkivet (source='user' når en bruker traff et nytt
 * tema). Idempotent på slug. Stille no-op uten service-nøkkel.
 */
async function saveQuiz({ themes, difficulty, quiz, category, team, model, grounded, source = "user" }) {
  if (!canWrite()) return false;
  const client = db();
  if (!client) return false;
  const cat = VALID_CATEGORIES.includes(category) ? category : "mix";
  const row = {
    slug: makeSlug(themes, difficulty),
    themes,
    category: cat,
    team: (cat === "fotball" && team) ? String(team).trim() : null,
    difficulty: difficulty || "medium",
    title: quiz.title || "Quiz",
    lede: quiz.lede || "",
    questions: quiz.questions,
    hero_img: heroForCategory(cat),
    source,
    model: model || null,
    grounded: !!grounded,
    review_status: "auto_ok",  // passerte begge moderingsporter → auto-publisert
  };
  try {
    const { error } = await client.from(TABLE).upsert(row, { onConflict: "slug", ignoreDuplicates: true });
    if (error) { console.warn("[library] upsert feilet:", error.message); return false; }
    return true;
  } catch (e) {
    console.warn("[library] upsert exception:", e.message);
    return false;
  }
}

/**
 * Sett review_status på én quiz (slug). Brukes av library-flag.js for
 * brukerrapport ('flagged') og admin kill-switch ('removed' | 'auto_ok').
 * Krever service-nøkkel. Returnerer { ok, error? }.
 */
async function setReviewStatus(slug, status) {
  const valid = ["auto_ok", "flagged", "removed"];
  if (!valid.includes(status)) return { ok: false, error: "ugyldig status" };
  if (!canWrite()) return { ok: false, error: "skriving ikke konfigurert" };
  const client = db();
  if (!client) return { ok: false, error: "db ikke konfigurert" };
  try {
    const { error } = await client.from(TABLE).update({ review_status: status }).eq("slug", slug);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = {
  TABLE, CATEGORY_TO_IMG, VALID_CATEGORIES,
  heroForCategory, normToken, makeSlug,
  db, canWrite, findByThemes, saveQuiz, setReviewStatus,
};
