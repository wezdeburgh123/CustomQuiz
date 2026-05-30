/**
 * Delt Supabase-klient for serverless-funksjonene.
 * Bruker SERVICE_ROLE-nøkkelen — kun server-side, ALDRI i frontend.
 *
 * Env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require("@supabase/supabase-js");

let _client = null;
function supa() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Mangler SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// Setter abonnementsstatus for en e-post (oppretter rad ved behov).
async function upsertSubscriber(fields) {
  const db = supa();
  const { error } = await db
    .from("subscribers")
    .upsert({ ...fields, updated_at: new Date().toISOString() }, { onConflict: "email" });
  if (error) throw new Error("Supabase upsert: " + error.message);
}

async function logEvent(source, event_type, email, ref_id, payload) {
  try {
    await supa().from("payment_events").insert({ source, event_type, email, ref_id, payload });
  } catch (_) { /* logging skal aldri velte hovedflyten */ }
}

module.exports = { supa, upsertSubscriber, logEvent };
