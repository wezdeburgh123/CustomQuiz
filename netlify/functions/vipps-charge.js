/**
 * Vipps Recurring — månedlig trekk (Fase C)
 * ------------------------------------------
 * PLANLAGT funksjon (Netlify Scheduled Function, daglig). Stripe fornyer
 * abonnementer selv; Vipps gjør det IKKE — vi må aktivt opprette en `charge`
 * for hver periode. Denne jobben oppretter neste trekk i forkant av forfall.
 *
 * Vipps MobilePay Recurring API v3:
 *   POST /recurring/v3/agreements/{agreementId}/charges
 *   body: { amount (øre), transactionType, description (≤45 tegn), due (YYYY-MM-DD), retryDays }
 *   - charge må opprettes MINST 1 dag før `due`
 *   - chargeType defaulter til RECURRING → Vipps håndterer retries + varsling i appen
 *   - charge kan kun opprettes når avtalen er ACTIVE
 *
 * Modell (subscribers):
 *   vipps_next_charge_on  — forfallsdato for NESTE charge (null = fersk avtale, ikke trukket ennå)
 *   vipps_last_charge_id  — sist opprettede charge
 *   current_period_end    — "betalt til og med" (settes = neste forfall, for visning på Min side)
 *
 * Idempotens: Idempotency-Key = agreementId + due. Hvis DB-oppdateringen feiler
 * etter en vellykket charge, vil neste kjøring forsøke samme due på nytt, men
 * Vipps returnerer da den OPPRINNELIGE chargen (ingen dobbelt-trekk).
 *
 * Feilede trekk (kort-avslag o.l.) håndteres av Vipps selv via retryDays +
 * varsling i appen. Hard reconciliation (avtale stoppet av bruker i appen)
 * fanges her: hvis charge-opprettelse feiler, slår vi opp avtalestatus og
 * setter status='canceled' hvis avtalen ikke lenger er ACTIVE. Løpende
 * betalingsstatus per charge bør på sikt komme via Vipps webhooks (Fase C.2).
 *
 * Env: VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN,
 *      VIPPS_ENV (test|prod), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Schedule: se netlify.toml ([functions."vipps-charge"] schedule = "0 6 * * *").
 */
const { supa, upsertSubscriber, logEvent } = require("./_supabase");
const { sendTemplate, receiptTemplateId, formatDateNb } = require("./_brevo");

const AMOUNT_ORE = 4900;          // 49 kr
const RETRY_DAYS = 5;             // Vipps prøver på nytt i 5 dager ved feilet trekk
const INITIAL_LEAD_DAYS = 3;      // første trekk forfaller 3 dager etter aktivering
const CREATE_WINDOW_DAYS = 5;     // opprett neste charge når forfall er innen 5 dager
const MONTHS_NB = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

function baseUrl() {
  return (process.env.VIPPS_ENV === "prod")
    ? "https://api.vippsmobilepay.com"
    : "https://apitest.vippsmobilepay.com";
}

async function getToken() {
  const res = await fetch(`${baseUrl()}/accesstoken/get`, {
    method: "POST",
    headers: {
      client_id: process.env.VIPPS_CLIENT_ID,
      client_secret: process.env.VIPPS_CLIENT_SECRET,
      "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
    },
  });
  if (!res.ok) throw new Error("accesstoken " + res.status);
  return (await res.json()).access_token;
}

function vippsHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "Ocp-Apim-Subscription-Key": process.env.VIPPS_SUBSCRIPTION_KEY,
    "Merchant-Serial-Number": process.env.VIPPS_MSN,
    "Vipps-System-Name": "customquiz",
    ...extra,
  };
}

// ── dato-hjelpere (alt i UTC, dato uten klokkeslett) ──
function isoDate(d) { return d.toISOString().slice(0, 10); }
function parseDate(s) { const [y, m, day] = String(s).split("-").map(Number); return new Date(Date.UTC(y, m - 1, day)); }
function addDays(d, n) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
function addOneMonth(d) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  const t = new Date(Date.UTC(y, m + 1, day));
  if (t.getUTCMonth() !== (m + 1) % 12) t.setUTCDate(0); // overflyt (f.eks. 31. → 30/28) → siste dag i riktig måned
  return t;
}
function chargeDescription(dueDate) {
  // tittel = agreement.productName ("CustomQuiz Premium"); her settes per-charge beskrivelsen (≤45 tegn)
  return `${MONTHS_NB[dueDate.getUTCMonth()]} ${dueDate.getUTCFullYear()}`; // f.eks. "juni 2026"
}

async function agreementStatus(token, agreementId) {
  try {
    const res = await fetch(`${baseUrl()}/recurring/v3/agreements/${agreementId}`, { headers: vippsHeaders(token) });
    if (!res.ok) return null;
    return (await res.json()).status || null;
  } catch (_) { return null; }
}

exports.handler = async () => {
  const required = ["VIPPS_CLIENT_ID", "VIPPS_CLIENT_SECRET", "VIPPS_SUBSCRIPTION_KEY", "VIPPS_MSN", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn("vipps-charge: hopper over, mangler env: " + missing.join(", "));
    return { statusCode: 200, body: "skipped: missing env" };
  }

  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const windowEnd = addDays(today, CREATE_WINDOW_DAYS);

  let db, subs;
  try {
    db = supa();
    const { data, error } = await db
      .from("subscribers")
      .select("email, vipps_agreement_id, vipps_next_charge_on, status")
      .eq("source", "vipps")
      .eq("status", "active")
      .not("vipps_agreement_id", "is", null);
    if (error) throw new Error(error.message);
    subs = data || [];
  } catch (e) {
    console.error("vipps-charge: DB-feil: " + e.message);
    return { statusCode: 200, body: "db error" };
  }

  if (!subs.length) {
    console.log("vipps-charge: ingen aktive Vipps-avtaler.");
    return { statusCode: 200, body: JSON.stringify({ created: 0, skipped: 0, failed: 0 }) };
  }

  let token;
  try { token = await getToken(); }
  catch (e) { console.error("vipps-charge: token-feil: " + e.message); return { statusCode: 200, body: "token error" }; }

  let created = 0, skipped = 0, failed = 0;

  for (const s of subs) {
    try {
      const nextDue = s.vipps_next_charge_on ? parseDate(s.vipps_next_charge_on) : addDays(today, INITIAL_LEAD_DAYS);
      if (nextDue > windowEnd) { skipped++; continue; } // ennå ikke tid å opprette neste trekk

      const dueStr = isoDate(nextDue);
      const res = await fetch(`${baseUrl()}/recurring/v3/agreements/${s.vipps_agreement_id}/charges`, {
        method: "POST",
        headers: vippsHeaders(token, {
          "Idempotency-Key": `cq-charge-${s.vipps_agreement_id}-${dueStr}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          amount: AMOUNT_ORE,
          transactionType: "DIRECT_CAPTURE",
          description: chargeDescription(nextDue),
          due: dueStr,
          retryDays: RETRY_DAYS,
        }),
      });

      const txt = await res.text();

      if (!res.ok) {
        failed++;
        await logEvent("vipps", "charge.create.failed", s.email, s.vipps_agreement_id, { http: res.status, body: txt.slice(0, 300), due: dueStr });
        // Reconciliér: hvis avtalen ikke lenger er ACTIVE (bruker stoppet i appen) → marker.
        const st = await agreementStatus(token, s.vipps_agreement_id);
        if (st && st !== "ACTIVE") {
          await upsertSubscriber({ email: s.email, status: (st === "STOPPED" || st === "EXPIRED") ? "canceled" : "past_due" });
          await logEvent("vipps", "agreement.reconciled." + st, s.email, s.vipps_agreement_id, null);
        }
        continue;
      }

      const data = txt ? JSON.parse(txt) : {};
      const chargeId = data.chargeId || (res.headers.get("location") || "").split("/").filter(Boolean).pop() || null;
      const periodEnd = addOneMonth(nextDue);

      await upsertSubscriber({
        email: s.email,
        vipps_next_charge_on: isoDate(periodEnd),   // neste trekk forfaller én måned etter dette
        vipps_last_charge_id: chargeId,
        current_period_end: periodEnd.toISOString(),
      });
      await logEvent("vipps", "charge.created", s.email, chargeId, { due: dueStr, amount: AMOUNT_ORE });

      // Fase D — kvittering (feiler stille hvis Brevo ikke konfigurert).
      const site = (process.env.SITE_URL || "https://customquiz.no").replace(/\/$/, "");
      await sendTemplate(receiptTemplateId(), s.email, {
        belop: String(Math.round(AMOUNT_ORE / 100)),
        dato: formatDateNb(nextDue),
        betalingsmetode: "Vipps",
        neste_trekk: formatDateNb(periodEnd),
        min_side_url: site + "/min-side.html",
      });
      created++;
    } catch (e) {
      failed++;
      try { await logEvent("vipps", "charge.error", s.email, s.vipps_agreement_id, { error: String(e).slice(0, 300) }); } catch (_) { /* logging skal aldri velte jobben */ }
    }
  }

  console.log(`vipps-charge: created=${created} skipped=${skipped} failed=${failed} total=${subs.length}`);
  return { statusCode: 200, body: JSON.stringify({ created, skipped, failed, total: subs.length }) };
};
