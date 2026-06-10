/**
 * CustomQuiz — datolag for daglig fellesquiz (Supabase-tabell daily_quiz).
 * ------------------------------------------------------------------------
 * Fase 1: «dagens» er nå FLERE temautgaver per dato (én rad per (dato,
 * kategori)), men fortsatt samme-for-alle. Utgavene materialiseres fra
 * arkivet (quiz_library) — gratis, gjenbruker nattpipelinen — av
 * daily-quiz-generate.js. Brukeren spiller én utgave per dag; ett tellende
 * forsøk per dag (unique på quiz_attempt) holder ukesledertavla intakt.
 *
 * Lesing bruker den delte anon-klienten fra _jobs.js (offentlig nøkkel).
 * SKRIVING (saveEdition) bruker service-klienten fra _supabase.js — anon
 * INSERT-policyen på daily_quiz er fjernet (10. juni 2026) så ingen utenfra
 * kan forhåndsplante utgaver med den offentlige nøkkelen.
 * quiz_library har RLS: alle kan lese publiserte rader (auto_ok).
 */
const { anonClient } = require("./_jobs");
const { supa } = require("./_supabase");
const lib = require("./_library");

// Dato i Europe/Oslo som "YYYY-MM-DD".
function osloDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

// Ukedag (0=søn..6=lør) for en "YYYY-MM-DD"-streng, uavhengig av server-tz.
function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Dagnummer (heltall) for deterministisk, ikke-tilfeldig rotasjon over arkivet.
function dayNumber(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

// ── Utgaver (én rad per (dato, kategori)) ─────────────────────────────
async function getEditions(dateStr) {
  const { data, error } = await anonClient()
    .from("daily_quiz")
    .select("quiz_date,category,theme,quiz")
    .eq("quiz_date", dateStr);
  if (error) throw new Error("daily_quiz editions: " + error.message);
  return data || []; // [{quiz_date, category, theme, quiz}]
}

async function getEdition(dateStr, category) {
  const { data, error } = await anonClient()
    .from("daily_quiz")
    .select("quiz_date,category,theme,quiz")
    .eq("quiz_date", dateStr).eq("category", category).maybeSingle();
  if (error) throw new Error("daily_quiz edition: " + error.message);
  return data; // {quiz_date, category, theme, quiz} | null
}

// Insert-only (ON CONFLICT DO NOTHING) → en publisert utgave kan ikke overskrives.
// Service-klient: kun serveren kan skrive utgaver (anon-policyen er droppet).
async function saveEdition(dateStr, category, theme, quiz) {
  const { error } = await supa()
    .from("daily_quiz")
    .upsert({ quiz_date: dateStr, category, theme, quiz },
            { onConflict: "quiz_date,category", ignoreDuplicates: true });
  if (error) throw new Error("daily_quiz insert: " + error.message);
}

// Nyeste dato som har minst én utgave (fallback hvis i dag ikke finnes ennå).
async function getLatestDate() {
  const { data, error } = await anonClient()
    .from("daily_quiz").select("quiz_date").order("quiz_date", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("daily_quiz latest: " + error.message);
  return data ? data.quiz_date : null;
}

// ── Arkiv-oppslag (quiz_library) ──────────────────────────────────────
// Kategorier som faktisk har publisert innhold + antall (for «hva kan tilbys»).
async function libraryCategories() {
  const { data, error } = await anonClient()
    .from("quiz_library").select("category")
    .eq("published", true).eq("review_status", "auto_ok");
  if (error) throw new Error("quiz_library categories: " + error.message);
  const counts = {};
  (data || []).forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
  return counts; // { sport: 12, film: 3, ... }
}

// Deterministisk utgave for (kategori, dato): roterer gjennom arkivet uten
// snarlige gjentakelser. Samme dato → samme valg for alle (frosset ved
// materialisering). Returnerer { title, lede, questions, hero_img } | null.
async function pickFromLibrary(category, dateStr) {
  const { data, error } = await anonClient()
    .from("quiz_library")
    .select("slug,title,lede,questions,hero_img,category,category_label")
    .eq("category", category).eq("published", true).eq("review_status", "auto_ok")
    .order("created_at", { ascending: true }).order("slug", { ascending: true });
  if (error) throw new Error("quiz_library pick: " + error.message);
  const rows = data || [];
  if (!rows.length) return null;
  // Per-kategori-forskyvning så ulike kategorier ikke låser til samme indeks.
  let off = 0; for (let i = 0; i < category.length; i++) off += category.charCodeAt(i);
  const idx = ((dayNumber(dateStr) + off) % rows.length + rows.length) % rows.length;
  const r = rows[idx];
  return {
    title: r.title, lede: r.lede, questions: r.questions,
    hero_img: r.hero_img || lib.heroForCategory(category),
    category_label: r.category_label || null,
  };
}

// ── Bakoverkompat (gammel «én quiz per dag»-API) ──────────────────────
// Beholdt så ingen ekstern kode knekker; mapper til mix-utgaven.
async function getDaily(dateStr) {
  const ed = await getEdition(dateStr, "mix");
  return ed ? { quiz_date: ed.quiz_date, theme: ed.theme, quiz: ed.quiz } : null;
}
async function getLatest() {
  const date = await getLatestDate();
  if (!date) return null;
  const eds = await getEditions(date);
  if (!eds.length) return null;
  const mix = eds.find((e) => e.category === "mix") || eds[0];
  return { quiz_date: mix.quiz_date, theme: mix.theme, quiz: mix.quiz };
}
async function saveDaily(dateStr, theme, quiz) { return saveEdition(dateStr, "mix", theme, quiz); }

module.exports = {
  osloDate, weekdayOf, dayNumber,
  getEditions, getEdition, saveEdition, getLatestDate,
  libraryCategories, pickFromLibrary,
  getDaily, getLatest, saveDaily,
};
