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

/**
 * Sender en rå transaksjons-e-post (subject + HTML) uten Brevo-mal. Brukt til
 * interne varsler (moderasjon). Krever en avsender — bruk BREVO_SENDER_EMAIL
 * (samme verifiserte avsender som malene). Feiler stille (kaster aldri).
 */
async function sendEmail(toEmail, subject, htmlContent) {
  const key = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!key || !toEmail || !senderEmail) return false; // ikke konfigurert → hopp stille
  const payload = {
    sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "CustomQuiz" },
    to: [{ email: toEmail }],
    subject: String(subject || "CustomQuiz"),
    htmlContent: String(htmlContent || ""),
  };
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

/**
 * Oppretter/oppdaterer en kontakt i Brevo (Contacts API) og legger den ev. i
 * en liste. Brukes for myk opt-in (VM-ligaer → e-post senere/reaktivering).
 * Brevo håndterer avmelding/unsubscribe for lista. Kaster aldri.
 */
async function upsertContact(email, attributes, listIds) {
  const key = process.env.BREVO_API_KEY;
  if (!key || !email) return false;
  const url = "https://api.brevo.com/v3/contacts";
  const headers = { "api-key": key, "Content-Type": "application/json", accept: "application/json" };
  async function send(body) {
    const res = await fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body) });
    return res.ok || res.status === 204; // 201 opprettet, 204 oppdatert
  }
  try {
    const full = { email: email, attributes: attributes || {}, updateEnabled: true };
    if (listIds && listIds.length) full.listIds = listIds;
    if (await send(full)) return true;
    // Fallback: hvis egendefinerte attributter ikke finnes i Brevo ennå (400),
    // legg kontakten i lista uten attributter — kontakten skal aldri gå tapt.
    const minimal = { email: email, updateEnabled: true };
    if (listIds && listIds.length) minimal.listIds = listIds;
    return await send(minimal);
  } catch (_) {
    return false;
  }
}

// Brevo-liste-ID for VM-kontakter (sett BREVO_VM_LIST_ID i Netlify-env).
function vmListIds() {
  const id = Number(process.env.BREVO_VM_LIST_ID || 0);
  return id ? [id] : [];
}

// Fjerner en kontakt fra én eller flere lister (ved utmelding av siste liga).
async function removeFromList(email, listIds) {
  const key = process.env.BREVO_API_KEY;
  if (!key || !email || !listIds || !listIds.length) return false;
  let ok = true;
  for (var i = 0; i < listIds.length; i++) {
    try {
      const res = await fetch("https://api.brevo.com/v3/contacts/lists/" + listIds[i] + "/contacts/remove", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ emails: [email] }),
      });
      if (!res.ok && res.status !== 204) ok = false;
    } catch (_) { ok = false; }
  }
  return ok;
}

module.exports = { sendTemplate, sendEmail, welcomeTemplateId, receiptTemplateId, formatDateNb, upsertContact, vmListIds, removeFromList };
