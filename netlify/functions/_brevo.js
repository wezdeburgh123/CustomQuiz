/**
 * Delt Brevo-klient for transaksjonell e-post (Fase D)
 * -----------------------------------------------------
 * Sender en lagret Brevo-mal (templateId) med params via Brevo SMTP API.
 * Feiler STILLE hvis BREVO_API_KEY mangler eller noe går galt — e-post skal
 * ALDRI velte betalings- eller trekk-flyten.
 *
 * Malene ligger allerede i Brevo (lastet inn 31. mai 2026):
 *   #1 Bekreftelse (double opt-in)   — håndteres av Brevo-skjema, ikke her
 *   #2 Velkomst                      — params: { quiz_url }
 *   #3 Kvittering (abonnement)       — params: { belop, dato, betalingsmetode, neste_trekk, min_side_url }
 *   #4 Daglig quiz                   — egen sende-jobb
 *
 * Env:
 *   BREVO_API_KEY                (xkeysib-…)
 *   BREVO_WELCOME_TEMPLATE_ID    (default 2)
 *   BREVO_RECEIPT_TEMPLATE_ID    (default 3)
 *   BREVO_SENDER_EMAIL           (valgfri — override; ellers brukes malens egen avsender)
 *   BREVO_SENDER_NAME            (valgfri — override)
 */
const MONTHS_NB = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

function formatDateNb(d) {
  const x = (d instanceof Date) ? d : new Date(d);
  if (isNaN(x.getTime())) return "";
  return `${x.getUTCDate()}. ${MONTHS_NB[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

function welcomeTemplateId() { return Number(process.env.BREVO_WELCOME_TEMPLATE_ID || 2); }
function receiptTemplateId() { return Number(process.env.BREVO_RECEIPT_TEMPLATE_ID || 3); }

/**
 * Sender en mal til én mottaker. Returnerer true ved suksess, false ellers
 * (kaster aldri).
 */
async function sendTemplate(templateId, toEmail, params) {
  const key = process.env.BREVO_API_KEY;
  if (!key || !templateId || !toEmail) return false; // ikke konfigurert → hopp stille
  const payload = {
    templateId: Number(templateId),
    to: [{ email: toEmail }],
    params: params || {},
  };
  // Bruk malens egen avsender med mindre vi eksplisitt overstyrer (env).
  if (process.env.BREVO_SENDER_EMAIL) {
    payload.sender = { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME || "CustomQuiz" };
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

module.exports = { sendTemplate, welcomeTemplateId, receiptTemplateId, formatDateNb };
