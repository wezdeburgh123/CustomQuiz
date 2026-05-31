/**
 * CustomQuiz — datolag for daglig fellesquiz (Supabase-tabell daily_quiz).
 * Bruker den delte anon-klienten fra _jobs.js (offentlig nøkkel, ingen secret).
 * Tabellen har RLS: alle kan lese, kun innsetting (ingen overskriving).
 */
const { anonClient } = require("./_jobs");

// Dato i Europe/Oslo som "YYYY-MM-DD".
function osloDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  // en-CA gir ISO-format YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

// Ukedag (0=søn..6=lør) for en "YYYY-MM-DD"-streng, uavhengig av server-tz.
function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

async function getDaily(dateStr) {
  const { data, error } = await anonClient()
    .from("daily_quiz").select("quiz_date,theme,quiz").eq("quiz_date", dateStr).maybeSingle();
  if (error) throw new Error("daily_quiz select: " + error.message);
  return data; // { quiz_date, theme, quiz } | null
}

// Nyeste tilgjengelige quiz (fallback hvis dagens ikke finnes ennå).
async function getLatest() {
  const { data, error } = await anonClient()
    .from("daily_quiz").select("quiz_date,theme,quiz").order("quiz_date", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("daily_quiz latest: " + error.message);
  return data;
}

async function saveDaily(dateStr, theme, quiz) {
  const { error } = await anonClient()
    .from("daily_quiz").insert({ quiz_date: dateStr, theme, quiz });
  if (error) throw new Error("daily_quiz insert: " + error.message);
}

module.exports = { osloDate, weekdayOf, getDaily, getLatest, saveDaily };
