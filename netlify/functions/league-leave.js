/**
 * Forlat en VM-liga — eller slett den (kun eier).
 * POST  (Authorization: Bearer <supabase access token>)
 * Body: { league_id: string, mode?: "leave" | "delete" }
 * Svar: { ok: true, optedOut: boolean }
 *
 * Sletting skjer med service_role. E-post-avmelding er FRIVILLIG og separat:
 * kun hvis body.optOut === true settes marketing_opt_in=false og kontakten
 * fjernes fra Brevo-lista. Å forlate en liga melder deg IKKE automatisk av
 * e-post for andre quizer — det må brukeren huke av for selv.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, BREVO_*
 */
const { supa } = require("./_supabase");
const { reply, userFromToken } = require("./_events");
const { removeFromList, vmListIds } = require("./_brevo");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Bruk POST." });

  const user = await userFromToken(event);
  if (!user) return reply(401, { error: "Logg inn." });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (_) { return reply(400, { error: "Ugyldig body." }); }

  const leagueId = String(body.league_id || "").trim();
  const mode = body.mode === "delete" ? "delete" : "leave";
  if (!leagueId) return reply(400, { error: "Mangler league_id." });

  const db = supa();

  if (mode === "delete") {
    const { data: lg } = await db.from("leagues").select("owner_id").eq("id", leagueId).maybeSingle();
    if (!lg) return reply(404, { error: "Fant ikke ligaen." });
    if (lg.owner_id !== user.id) return reply(403, { error: "Bare eieren kan slette ligaen." });
    const { error } = await db.from("leagues").delete().eq("id", leagueId); // cascade → medlemskap
    if (error) return reply(503, { error: "Kunne ikke slette ligaen akkurat nå." });
  } else {
    const { error } = await db.from("league_members").delete().eq("league_id", leagueId).eq("user_id", user.id);
    if (error) return reply(503, { error: "Kunne ikke forlate ligaen akkurat nå." });
  }

  // E-post-avmelding KUN hvis brukeren eksplisitt huket av for det.
  let optedOut = false;
  if (body.optOut === true) {
    optedOut = true;
    try {
      await db.from("profiles").update({ marketing_opt_in: false, opt_in_source: "meldt-av" }).eq("id", user.id);
      if (user.email) await removeFromList(user.email, vmListIds());
    } catch (_) { /* stille — opt-out skal ikke velte utmeldingen */ }
  }

  return reply(200, { ok: true, optedOut: optedOut });
};
