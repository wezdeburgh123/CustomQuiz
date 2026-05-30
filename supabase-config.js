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
  anonKey: "PASTE_ANON_PUBLIC_KEY_HER" // lang "eyJ…"-streng — Settings → API → anon public
};
