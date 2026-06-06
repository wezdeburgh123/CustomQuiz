/**
 * Delte hjelpere for event-modulene (VM 2026 m.fl.).
 * Verifiserer Supabase-JWT (samme mønster som cancel-subscription.js) og
 * genererer ligakoder. Skriving skjer med service_role via _supabase.
 */
const { createClient } = require("@supabase/supabase-js");

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const reply = (code, obj) => ({ statusCode: code, headers: JSON_HEADERS, body: JSON.stringify(obj) });

// Verifiser Bearer-token → { id, email } eller null.
async function userFromToken(event) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const authz = event.headers.authorization || event.headers.Authorization || "";
  const token = authz.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await anon.auth.getUser(token);
    if (error || !data || !data.user) return null;
    return { id: data.user.id, email: (data.user.email || "").toLowerCase() };
  } catch (_) {
    return null;
  }
}

// Kode uten forvekslingstegn (ingen 0/O/1/I). Prefiks fra event-id, f.eks. vm-2026 → "VM".
function makeCode(eventId) {
  const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const prefix = String(eventId || "").split("-")[0].toUpperCase().slice(0, 3) || "LG";
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return `${prefix}-${s}`;
}

module.exports = { reply, userFromToken, makeCode };
