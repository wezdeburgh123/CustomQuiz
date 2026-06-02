/**
 * Abonnementsstatus — brukes til innholdslåsing
 * ----------------------------------------------
 * Frontend (etter innlogging) kaller denne for å vite om brukeren har
 * aktivt abonnement, og gater arkivet/generatoren deretter.
 *
 * GET  /api/subscription-status?email=...      (enkel variant)
 * POST { email }                               (samme)
 *
 * Svar: { active: boolean, status, source, plan }
 *
 * MERK: Dette er en LES-sjekk. Den ekte håndhevingen som koster penger
 * (AI-generering) gjøres i generate-quiz.js, som bør gjøre samme sjekk
 * server-side før den kaller Anthropic (se BETALING-plan.md, fase 5).
 */
const { supa } = require("./_supabase");
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

exports.handler = async (event) => {
  let email = "";
  if (event.httpMethod === "POST") {
    try { email = String(JSON.parse(event.body || "{}").email || "").toLowerCase(); } catch (_) {}
  } else {
    email = String((event.queryStringParameters || {}).email || "").toLowerCase();
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "Ugyldig e-post." }) };
  }

  try {
    const { data, error } = await supa()
      .from("subscribers")
      .select("status, source, plan, current_period_end, cancel_at_period_end")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const active = !!data && (data.status === "active");
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({
      active, status: data?.status || "none", source: data?.source || null, plan: data?.plan || null,
      current_period_end: data?.current_period_end || null,
      cancel_at_period_end: !!data?.cancel_at_period_end,
    }) };
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
