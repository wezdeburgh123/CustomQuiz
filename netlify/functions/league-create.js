/**
 * Opprett en VM-liga (vennegruppe).
 * POST  (Authorization: Bearer <supabase access token>)
 * Body: { event_id?: string = "vm-2026", name: string }
 * Svar: { league_id, code, name, event_id }
 *
 * Skriving med service_role (omgår RLS). Oppretter ligaen og legger eieren
 * inn som første medlem. Koden genereres unik (retry ved kollisjon).
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
const { supa } = require("./_supabase");
const { reply, userFromToken, makeCode, recordOptIn } = require("./_events");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "Bruk POST." });

  const user = await userFromToken(event);
  if (!user) return reply(401, { error: "Logg inn for å opprette en liga." });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (_) { return reply(400, { error: "Ugyldig body." }); }

  const eventId = String(body.event_id || "vm-2026").trim();
  const name = String(body.name || "").trim().slice(0, 60);
  if (!name) return reply(400, { error: "Gi ligaen et navn." });

  const db = supa();

  // Sjekk at eventet finnes (unngår foreign key-feil med kryptisk melding).
  const { data: ev } = await db.from("events").select("id").eq("id", eventId).maybeSingle();
  if (!ev) return reply(404, { error: "Ukjent event." });

  // Opprett liga med unik kode (inntil 6 forsøk ved kollisjon).
  let league = null, lastErr = null;
  for (let i = 0; i < 6 && !league; i++) {
    const code = makeCode(eventId);
    const { data, error } = await db
      .from("leagues")
      .insert({ event_id: eventId, code, name, owner_id: user.id })
      .select("id, code, name, event_id")
      .single();
    if (!error) { league = data; break; }
    lastErr = error;
    if (!/duplicate|unique/i.test(error.message || "")) break; // ekte feil → stopp
  }
  if (!league) return reply(503, { error: "Kunne ikke opprette ligaen akkurat nå. Prøv igjen." });

  // Legg eieren inn som medlem (ignorér hvis allerede der).
  await db.from("league_members")
    .upsert({ league_id: league.id, user_id: user.id }, { onConflict: "league_id,user_id" });

  // Myk opt-in: informert i UI → samtykke + Brevo-kontakt for senere e-post.
  await recordOptIn(user, "vm-liga-opprettet", { code: league.code });

  return reply(200, { league_id: league.id, code: league.code, name: league.name, event_id: league.event_id });
};
