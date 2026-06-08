/**
 * Daglig quiz-e-post til påmeldte brukere — SEGMENTERT.
 * --------------------------------------------------
 * Planlagt funksjon (cron). Sender én daglig nudge til alle som har samtykket
 * (profiles.marketing_opt_in=true). Smart segmentering på opt_in_source:
 *   - VM-opt-ins (opt_in_source 'vm-liga*'): VM-daglig-mal (BREVO_VM_DAILY_TEMPLATE_ID)
 *     mot vm.html — HVIS den env-en er satt. Ellers faller de ned til mal #4.
 *   - Alle andre: dagens-quiz-mal #4 (BREVO_DAILY_TEMPLATE_ID, default 4) mot dagens.html.
 * Én mail per mottaker (ingen dobling). Etter VM: unset BREVO_VM_DAILY_TEMPLATE_ID
 * → alle får dagens-quiz-mailen igjen.
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
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_DAILY_TEMPLATE_ID,
 *      BREVO_VM_DAILY_TEMPLATE_ID (valgfri — VM-segment under turneringen), SITE_URL
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

  // Påmeldte med e-post + opt-in-kilde (begge lagres på profiles ved opt-in).
  let recipients = [];
  try {
    const { data, error } = await db.from("profiles").select("email, opt_in_source").eq("marketing_opt_in", true).not("email", "is", null);
    if (error) throw error;
    recipients = (data || []).filter((r) => r.email);
  } catch (e) {
    return done("Kunne ikke hente påmeldte: " + (e.message || e));
  }
  if (!recipients.length) return done("Ingen påmeldte med e-post — ingenting å sende.");

  // Smart segmentering: VM-opt-ins (opt_in_source 'vm-liga*') får VM-daglig-mal mot
  // vm.html hvis BREVO_VM_DAILY_TEMPLATE_ID er satt; alle andre får mal #4 mot dagens.html.
  // Én mail per mottaker. Unset VM-mal-ID etter VM → alle går tilbake til dagens-quiz.
  const site = (process.env.SITE_URL || "https://customquiz.no").replace(/\/$/, "");
  const vmTid = Number(process.env.BREVO_VM_DAILY_TEMPLATE_ID || 0);
  let sent = 0, vm = 0;
  for (const r of recipients) {
    const isVm = String(r.opt_in_source || "").startsWith("vm-liga");
    let ok;
    if (isVm && vmTid) {
      ok = await sendTemplate(vmTid, r.email, { vm_url: site + "/vm.html" });
      if (ok) vm++;
    } else {
      ok = await sendTemplate(tid, r.email, { quiz_url: site + "/dagens.html" });
    }
    if (ok) sent++;
  }
  return done(`daily-email: ${sent}/${recipients.length} sendt (${vm} VM, ${sent - vm} dagens).`);
};
