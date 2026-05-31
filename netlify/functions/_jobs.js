/**
 * CustomQuiz — jobb-lager for async quiz-generering.
 * --------------------------------------------------
 * Lagrer status for async-jobber i Supabase-tabellen `quiz_jobs`
 * (se db/migration-quiz-jobs.sql). Bakgrunnsfunksjonen skriver, poll-
 * endepunktet leser.
 *
 * Bruker den OFFENTLIGE anon-nøkkelen (samme som frontend) — krever derfor
 * INGEN hemmelig env. Tabellen har permissive RLS for anon; jobb-id er en
 * tilfeldig UUID og inneholder ingen sensitiv data.
 *
 * Valgfri overstyring via env: SUPABASE_URL, SUPABASE_ANON_KEY.
 */
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://agygcltvhkvokgpmwmxf.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneWdjbHR2aGt2b2tncG13bXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjM0MzMsImV4cCI6MjA5NTY5OTQzM30.JcSqoSMeGrxLchR1MihVxMIMvSQ8PNrOPzbJKAexgZE";

const TABLE = "quiz_jobs";

let _client = null;
function db() {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  return _client;
}

// Skriver/oppdaterer en jobb. `obj` = { status, quiz?, reason?, error?, code? }.
async function setJob(id, obj) {
  const { error } = await db()
    .from(TABLE)
    .upsert(
      { id, data: { ...obj, ts: Date.now() }, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (error) throw new Error("quiz_jobs upsert: " + error.message);
}

// Leser en jobb. Returnerer status-objektet, eller null hvis ikke funnet.
async function getJob(id) {
  const { data, error } = await db().from(TABLE).select("data").eq("id", id).maybeSingle();
  if (error) throw new Error("quiz_jobs select: " + error.message);
  return data ? data.data : null;
}

module.exports = { setJob, getJob, anonClient: db };
