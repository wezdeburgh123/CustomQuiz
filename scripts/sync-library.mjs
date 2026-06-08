#!/usr/bin/env node
/**
 * CustomQuiz — lokal arkiv-synk (alternativ til Netlify library-sync).
 * -------------------------------------------------------------------
 * Leser quiz-library/library.ndjson og upserter til Supabase quiz_library.
 * Kjøres fra din Mac (har nettverk + service-nøkkel). Idempotent på slug.
 *
 * Krever miljøvariabler (f.eks. i et lokalt, git-ignorert .env eller eksportert
 * i terminalen — ALDRI committet):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (sb_secret_…)
 *
 * Kjør:
 *   cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/sync-library.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, "..", "quiz-library", "library.ndjson");

const TRANSLIT = { "æ": "ae", "ø": "o", "å": "a" };
const normToken = (s) =>
  String(s || "").trim().toLowerCase()
    .replace(/[æøå]/g, (c) => TRANSLIT[c] || c)
    .replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const makeSlug = (themes, difficulty) =>
  (Array.isArray(themes) ? themes : [themes]).map(normToken).filter(Boolean).sort().join("+") +
  "__" + normToken(difficulty || "medium");

const CATEGORY_TO_IMG = {
  mix: "kategori-mix", historie: "kategori-norsk-historie", verdenshistorie: "kategori-verdenshistorie",
  vitenskap: "kategori-naturvitenskap", geografi: "kategori-geografi", litteratur: "kategori-litteratur",
  kunst: "kategori-kunst", film: "kategori-film", musikk: "kategori-musikk", sport: "kategori-sport",
  fotball: "kategori-sport", filosofi: "kategori-filosofi", teknologi: "kategori-teknologi",
};
const VALID = Object.keys(CATEGORY_TO_IMG);

function toRow(item) {
  const themes = Array.isArray(item.themes) ? item.themes : (item.theme ? [item.theme] : []);
  if (!themes.length || !Array.isArray(item.questions) || item.questions.length === 0) return null;
  const difficulty = ["lett", "medium", "vanskelig"].includes(item.difficulty) ? item.difficulty : "medium";
  const category = VALID.includes(item.category) ? item.category : "mix";
  const team = (category === "fotball" && item.team) ? String(item.team).trim() : null;
  const free = item.free === true;
  return {
    slug: item.slug || makeSlug(themes, difficulty),
    themes, category, category_label: item.category_label || null, team, free, difficulty,
    title: item.title || "Quiz", lede: item.lede || "", questions: item.questions,
    // NB: hero_img settes BEVISST IKKE her. Upsert ville ellers overskrive de
    // AI-genererte cover-URL-ene (quiz-covers) ved hver deploy/synk. Frontend
    // faller tilbake til kategori-bildet når hero_img er tomt. Cover-URL-er
    // settes/bevares av quiz-cover-background.
    source: item.source || "nightly", model: item.model || null, grounded: !!item.grounded,
    published: item.published === false ? false : true,
  };
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Mangler SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY i miljøet.");
    process.exit(1);
  }
  if (!fs.existsSync(FILE)) {
    console.error("Fant ikke", FILE);
    process.exit(1);
  }
  const lines = fs.readFileSync(FILE, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = lines.map((l) => { try { return toRow(JSON.parse(l)); } catch { return null; } }).filter(Boolean);
  if (!rows.length) { console.log("Ingen gyldige quizer i fila."); return; }

  const db = createClient(url, key, { auth: { persistSession: false } });
  let n = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await db.from("quiz_library").upsert(batch, { onConflict: "slug" });
    if (error) { console.error("upsert-feil:", error.message); process.exit(1); }
    n += batch.length;
  }
  console.log(`Synket ${n} quizer (av ${lines.length} linjer) → quiz_library.`);
}
main();
