/**
 * Bli med i en VM-liga via invite-kode.
 * POST  (Authorization: Bearer <supabase access token>)
 * Body: { code: string }
 * Svar: { league_id, name, event_id, already?: boolean }
 *
 * Slår opp koden med service_role (frontend kan ikke liste alle ligaer) og
 * legger brukeren inn som medlem. Idempotent — å bli med to ganger er ufarlig.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
const { supa } = require("./_supabase");
const { reply, userFromToken, recordOptIn } = require("./_events");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Bruk POST." });

  const user = await userFromToken(event);
  if (!user) return reply(401, { error: "Logg inn for å bli med i en liga." });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (_) { return reply(400, { error: "Ugyldig body." }); }

  const code = String(body.code || "").trim().toUpperCase();
  if (!code) return reply(400, { error: "Skriv inn en ligakode." });

  const db = supa();

  const { data: league, error: lookErr } = await db
    .from("leagues")
    .select("id, name, event_id")
    .eq("code", code)
    .maybeSingle();
  if (lookErr) return reply(503, { error: "Kunne ikke slå opp koden akkurat nå." });
  if (!league) return reply(404, { error: "Fant ingen liga med den koden." });

  // Allerede medlem?
  const { data: existing } = await db
    .from("league_members")
    .select("id")
    .eq("league_id", league.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    await recordOptIn(user, "vm-liga-join", { code: code, name: league.name });
    return reply(200, { league_id: league.id, name: league.name, event_id: league.event_id, already: true });
  }

  const { error: insErr } = await db
    .from("league_members")
    .insert({ league_id: league.id, user_id: user.id });
  if (insErr && !/duplicate|unique/i.test(insErr.message || "")) {
    return reply(503, { error: "Kunne ikke melde deg inn akkurat nå. Prøv igjen." });
  }

  // Myk opt-in: informert i UI → samtykke + Brevo-kontakt for senere e-post.
  await recordOptIn(user, "vm-liga-join", { code: code });

  return reply(200, { league_id: league.id, name: league.name, event_id: league.event_id });
};
