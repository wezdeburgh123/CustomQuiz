/**
 * Daglig quiz-e-post (mal #4) til påmeldte brukere.
 * --------------------------------------------------
 * Planlagt funksjon (cron). Sender en kort «dagens quiz er klar»-nudge til alle
 * som har samtykket (profiles.marketing_opt_in=true). Bruker Brevo-mal
 * BREVO_DAILY_TEMPLATE_ID (default 4) med param quiz_url.
 *
 * SIKKERHET: hele jobben er AVSKRUDD med mindre DAILY_EMAIL_ENABLED=true.
 * Daglig utsending til ekte mottakere skal slås på bevisst.
 *
 * Samtykke: mottakerlista er vår egen opt-in (profiles). Utmelding via
 * «forlat liga»-avkrysningen setter marketing_opt_in=false → de faller ut her.
 * NB: mal #4 MÅ ha en {{ unsubscribe }}-lenke i Brevo. Avmelding gjort direkte
 * i Brevo reflekteres ikke automatisk tilbake til profiles (kjent begrensning —
 * vurder Brevo-webhook eller ukentlig kampanje på sikt).
 *
 * Manuell test: GET /api/daily-email  (krever fortsatt DAILY_EMAIL_ENABLED=true)
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_DAILY_TEMPLATE_ID, SITE_URL
 */
const { createClient } = require("@supabase/supabase-js");
const { sendTemplate } = require("./_brevo");

exports.handler = async () => {
  const done = (msg) => ({ statusCode: 200, body: msg });

  if (process.env.DAILY_EMAIL_ENABLED !== "true") {
    return done("daily-email er avskrudd (sett DAILY_EMAIL_ENABLED=true for å aktivere).");
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tid = Number(process.env.BREVO_DAILY_TEMPLATE_ID || 4);
  if (!url || !key || !tid || !process.env.BREVO_API_KEY) return done("Mangler konfig (Supabase/Brevo).");

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Påmeldte med e-post (e-posten lagres på profiles ved opt-in).
  let emails = [];
  try {
    const { data, error } = await db.from("profiles").select("email").eq("marketing_opt_in", true).not("email", "is", null);
    if (error) throw error;
    emails = (data || []).map((r) => r.email).filter(Boolean);
  } catch (e) {
    return done("Kunne ikke hente påmeldte: " + (e.message || e));
  }
  if (!emails.length) return done("Ingen påmeldte med e-post — ingenting å sende.");

  // Send mal #4 til hver mottaker
  const site = (process.env.SITE_URL || "https://customquiz.no").replace(/\/$/, "");
  let sent = 0;
  for (const email of emails) {
    const ok = await sendTemplate(tid, email, { quiz_url: site + "/dagens.html" });
    if (ok) sent++;
  }
  return done(`daily-email: ${sent}/${emails.length} sendt.`);
};
