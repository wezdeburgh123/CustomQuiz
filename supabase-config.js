/**
 * CustomQuiz — Supabase frontend-config
 * --------------------------------------
 * Disse to verdiene er TRYGGE å ha i frontend (anon-nøkkelen er laget for
 * det — data beskyttes av RLS-reglene i db/schema.sql). service_role-nøkkelen
 * skal ALDRI ligge her — den hører kun hjemme i Netlify env.
 *
 * Hent verdiene i Supabase → Project Settings → API:
 *   - Project URL          → url
 *   - Project API keys: anon public → anonKey
 */
window.CQ_SUPABASE = {
  url: "https://agygcltvhkvokgpmwmxf.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneWdjbHR2aGt2b2tncG13bXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjM0MzMsImV4cCI6MjA5NTY5OTQzM30.JcSqoSMeGrxLchR1MihVxMIMvSQ8PNrOPzbJKAexgZE" // anon public (frontend-trygg, beskyttet av RLS)
};
