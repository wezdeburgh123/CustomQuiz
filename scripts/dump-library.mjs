#!/usr/bin/env node
/**
 * CustomQuiz — dump quiz_library FRA Supabase TIL quiz-library/library.ndjson.
 * ---------------------------------------------------------------------------
 * Dette er det motsatte av sync-library.mjs:
 *
 *   sync-library.mjs   fil  ->  DB   (push: legg nye quizer inn i basen)
 *   dump-library.mjs   DB   ->  fil  (pull: hent basen ned i repoet)
 *
 * HVORFOR: databasen er source of truth. Nye quizer havner i quiz_library både
 * via nattskiftet, via library-sync og via brukere som lager egne quizer — men
 * library.ndjson i repoet oppdateres bare når noen husker det. 6. august 2026
 * hadde fila 402 linjer mens basen hadde 437 rader, altså 35 quizer som bare
 * fantes i DB. Fila lyver da om hva som er live, og det er lett å feildiagnosere
 * ut fra den (det skjedde under statussjekken 6.8).
 *
 * Fila brukes fortsatt til to ting, så den bør holdes fersk:
 *   1) fallback for build-quiz-pages.mjs når Netlify-builden ikke har DB-nøkler
 *   2) input til sync-library.mjs
 *
 * FORMAT: skriver nøyaktig de feltene sync-library.mjs leser, i samme rekkefølge
 * som eksisterende linjer, sortert på slug (stabil diff mellom kjøringer).
 * hero_img, plays, rating og created_at skrives BEVISST IKKE — de eies av DB/
 * quiz-cover-background, og skal ikke kunne overskrives av en fil-synk.
 *
 * TRYGGHET: skriver først til library.ndjson.ny, viser en diff-oppsummering, og
 * bytter bare ut den ekte fila hvis du kjører med --skriv. Uten --skriv rører
 * den ingenting (tørrkjøring).
 *
 * Krever (aldri committet — hent i Supabase → Project Settings → API):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (sb_secret_…)   evt. anon-nøkkel holder til lesing
 *
 * Kjør — tørrkjøring først:
 *   cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/dump-library.mjs
 *
 * Så, hvis diffen ser riktig ut:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/dump-library.mjs --skriv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, "..", "quiz-library", "library.ndjson");
const DRAFT = FILE + ".ny";
const SKRIV = process.argv.includes("--skriv");

// Samme feltrekkefølge som de eksisterende linjene i library.ndjson.
function toLine(r) {
  const o = {
    slug: r.slug,
    themes: Array.isArray(r.themes) ? r.themes : [],
    category: r.category || "mix",
    category_label: r.category_label || null,
    difficulty: r.difficulty || "medium",
    title: r.title || "Quiz",
    lede: r.lede || "",
    questions: r.questions || [],
    grounded: !!r.grounded,
    source: r.source || "nightly",
  };
  // team og free skrives bare når de er satt, slik eksisterende linjer gjør —
  // ellers vokser diffen med 437 meningsløse "team": null-felt.
  if (r.category === "fotball" && r.team) o.team = r.team;
  if (r.free === true) o.free = true;
  return JSON.stringify(o);
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Mangler SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY i miljøet.");
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Paginer — PostgREST returnerer maks 1000 rader per kall.
  let rows = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await db
      .from("quiz_library")
      .select("slug,themes,category,category_label,difficulty,title,lede,questions,grounded,source,team,free,published")
      .order("slug", { ascending: true })
      .range(from, from + 499);
    if (error) { console.error("lesefeil:", error.message); process.exit(1); }
    if (!data || !data.length) break;
    rows = rows.concat(data);
    if (data.length < 500) break;
  }

  // Bare publiserte, og bare de som faktisk kan rendres (samme krav som
  // sync-library/build-quiz-pages) — ellers skriver vi søppel til fila.
  const brukbare = rows.filter(
    (r) => r.published !== false && r.slug && Array.isArray(r.questions) && r.questions.length
  );
  const hoppet = rows.length - brukbare.length;

  const nyeLinjer = brukbare.map(toLine);
  fs.writeFileSync(DRAFT, nyeLinjer.join("\n") + "\n", "utf8");

  // Diff-oppsummering mot dagens fil.
  let gamleSlugs = new Set();
  if (fs.existsSync(FILE)) {
    for (const l of fs.readFileSync(FILE, "utf8").split("\n")) {
      const t = l.trim();
      if (!t) continue;
      try { gamleSlugs.add(JSON.parse(t).slug); } catch { /* hopp over */ }
    }
  }
  const nyeSlugs = new Set(brukbare.map((r) => r.slug));
  const lagtTil = [...nyeSlugs].filter((s) => !gamleSlugs.has(s));
  const forsvunnet = [...gamleSlugs].filter((s) => !nyeSlugs.has(s));

  console.log(`DB:            ${rows.length} rader (${hoppet} hoppet over: upublisert/uten spørsmål)`);
  console.log(`Fil i dag:     ${gamleSlugs.size} slugs`);
  console.log(`Utkast:        ${nyeLinjer.length} slugs  →  ${DRAFT}`);
  console.log(`Nye i DB:      ${lagtTil.length}${lagtTil.length ? " → " + lagtTil.slice(0, 12).join(", ") + (lagtTil.length > 12 ? " …" : "") : ""}`);
  console.log(`Borte fra DB:  ${forsvunnet.length}${forsvunnet.length ? " → " + forsvunnet.slice(0, 12).join(", ") + (forsvunnet.length > 12 ? " …" : "") : ""}`);

  if (forsvunnet.length) {
    console.log("\nADVARSEL: slugs som finnes i fila men ikke i DB forsvinner hvis du skriver.");
    console.log("Sjekk at det er meningen (f.eks. bevisst slettede quizer) før --skriv.");
  }

  if (!SKRIV) {
    console.log("\nTørrkjøring — ingenting er endret. Kjør på nytt med --skriv for å bytte ut fila.");
    return;
  }

  const backup = FILE + ".bak-" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
  if (fs.existsSync(FILE)) fs.copyFileSync(FILE, backup);
  fs.renameSync(DRAFT, FILE);
  console.log(`\nSkrevet. Backup av forrige versjon: ${backup}`);
}
main();
