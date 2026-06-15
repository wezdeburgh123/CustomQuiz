/**
 * CustomQuiz — daglig genererings-kvote (server-håndhevet).
 * ---------------------------------------------------------
 * Den eneste handlingen som koster penger er AI-generering av NYE quizer.
 * Cachede treff er gratis og skal IKKE telle. Derfor kalles denne FØRST etter
 * cache-bom (og moderering), rett før modellkallet, i begge genererings-
 * endepunktene.
 *
 * To vern:
 *   1. Per bruker:  DAILY_GEN_LIMIT genereringer per dag (default 2).
 *   2. Globalt:     GLOBAL_GEN_CAP genereringer per dag (default 400) —
 *                   en hard kostnadsbarriere / kill-switch som beskytter
 *                   kontoen selv om noen lager mange brukere.
 *
 * Teller mot tabellen public.gen_usage via SERVICE_ROLE (se db/migration-gen-usage.sql).
 * «Attempt-based»: vi logger raden FØR modellkallet, så feilede/tunge forsøk
 * også teller — det er token-bruk vi vil beskytte oss mot.
 *
 * Feiler ÅPENT: hvis DB/env mangler eller spørringen feiler, blokkerer vi IKKE
 * (innloggings-sperra i checkSubscription er allerede passert). Vi heller mot å
 * la en ekte bruker slippe gjennom enn å stenge alle ute ved en DB-blipp; det
 * globale taket er sikkerhetsnettet for kostnad.
 */

function osloDay(d = new Date()) {
  // 'en-CA' gir YYYY-MM-DD; timeZone gir Oslo-døgn (intuitivt «per dag»).
  try { return d.toLocaleDateString("en-CA", { timeZone: "Europe/Oslo" }); }
  catch (_) { return d.toISOString().slice(0, 10); }
}

function intEnv(name, def) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
}

/**
 * Sjekker og registrerer én generering for brukeren.
 * @param {{id:string,email?:string}} user  fra checkSubscription
 * @returns {Promise<{ok:true, remaining:number} | {ok:false,status:number,code:string,message:string}>}
 */
async function checkAndRecordGeneration(user) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  // Uten DB-konfig kan vi ikke håndheve — da er kvoten av (åpen modus).
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { ok: true, remaining: Infinity };
  if (!user || !user.id) return { ok: true, remaining: Infinity };

  const limit = intEnv("DAILY_GEN_LIMIT", 2);
  const cap = intEnv("GLOBAL_GEN_CAP", 400);
  const day = osloDay();

  try {
    const { createClient } = require("@supabase/supabase-js");
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // 1) Per-bruker: antall i dag.
    const { count: mine, error: e1 } = await db
      .from("gen_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("day", day);
    if (e1) throw new Error(e1.message);
    if ((mine || 0) >= limit) {
      return {
        ok: false, status: 429, code: "daily_limit",
        message: `Du har laget ${limit} quizer i dag. Prøv igjen i morgen, eller spill fritt i arkivet imens.`,
      };
    }

    // 2) Globalt tak (kill-switch).
    const { count: total, error: e2 } = await db
      .from("gen_usage")
      .select("id", { count: "exact", head: true })
      .eq("day", day);
    if (e2) throw new Error(e2.message);
    if ((total || 0) >= cap) {
      return {
        ok: false, status: 503, code: "global_cap",
        message: "Quiz-generering er midlertidig pauset for i dag. Spill gjerne i arkivet — prøv å lage egne igjen i morgen.",
      };
    }

    // 3) Registrér forsøket (attempt-based).
    await db.from("gen_usage").insert({ user_id: user.id, email: user.email || null, day });
    return { ok: true, remaining: Math.max(0, limit - (mine || 0) - 1) };
  } catch (err) {
    // Feil åpent — ikke steng ekte brukere ute ved DB-blipp.
    console.error("[usage] kvote-sjekk feilet, slipper gjennom:", err.message);
    return { ok: true, remaining: Infinity };
  }
}

module.exports = { checkAndRecordGeneration, osloDay };
