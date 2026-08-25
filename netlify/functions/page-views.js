/**
 * CustomQuiz — admin-lesning av page_views (aggregert trafikk).
 * ------------------------------------------------------------
 * POST /api/page-views   { token, days }
 *   → { ok, days, from, to, totals, daily[], sources[], pages[], truncated }
 *
 * Motstykket til netlify/functions/track.js, som SKRIVER tellerne. Tabellen
 * page_views har én rad per (dag, sti) og ingen persondata (se
 * db/migration-page-views.sql). Fram til 25.8.26 fantes det ingen måte å SE
 * tallene på uten å spørre Supabase direkte — dette endepunktet lukker det.
 *
 * Krever ADMIN_TOKEN (samme mønster og samme feilkoder som library-flag.js) og
 * SUPABASE_SERVICE_ROLE_KEY: page_views har RLS med eksplisitt deny for anon og
 * authenticated, så bare service-rollen kommer inn.
 *
 * Aggregering skjer HER, i JS, ikke i databasen. Det er et bevisst valg: en
 * SQL-aggregatfunksjon ville krevd en ny migrasjon som må kjøres manuelt i
 * Supabase (se minnenotatet «migrasjon prod-gap»), og det er en kjent kilde til
 * at prod og repo glir fra hverandre. Volumet er lite nok: ~500 stier × 90 dager
 * er verste fall, og vi paginerer i bolker på 1000 med et tak på 20 bolker.
 */
const { CORS_HEADERS } = require("./_quizcore");

const PAGE_SIZE = 1000;
const MAX_PAGES = 20; // tak: 20 000 rader. Nås dette, settes truncated=true.
const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;
const TOP_PAGES = 25;

// Virtuelle stier vi selv sender gjennom beaconen (f.eks. /_kilde/google).
// De er IKKE sidevisninger og må aldri blandes inn i side-tallene.
const VIRTUAL_PREFIX = "/_";
const SOURCE_PREFIX = "/_kilde/";

// Dagens dato i Europe/Oslo som YYYY-MM-DD — samme funksjon som track.js, så
// vinduet her og skrivingen der alltid er enige om hva «i dag» er.
function osloDay(offsetDays) {
  const now = new Date();
  if (offsetDays) now.setUTCDate(now.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(now);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON." }) }; }

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken)
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Admin ikke konfigurert (ADMIN_TOKEN mangler)." }) };
  if (String(body.token || "") !== adminToken)
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig admin-token." }) };

  let days = parseInt(body.days, 10);
  if (!Number.isFinite(days) || days < 1) days = DEFAULT_DAYS;
  if (days > MAX_DAYS) days = MAX_DAYS;

  const to = osloDay(0);
  const from = osloDay(-(days - 1));

  // ── Hent radene for vinduet, paginert ────────────────────────────────────
  let rows = [];
  let truncated = false;
  try {
    const { supa } = require("./_supabase");
    const db = supa();
    for (let page = 0; page < MAX_PAGES; page++) {
      const lo = page * PAGE_SIZE;
      const { data, error } = await db
        .from("page_views")
        .select("day, path, views, visitors")
        .gte("day", from)
        .lte("day", to)
        .order("day", { ascending: true })
        .order("path", { ascending: true })
        .range(lo, lo + PAGE_SIZE - 1);
      if (error)
        return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke lese page_views.", detail: error.message }) };
      const batch = data || [];
      rows = rows.concat(batch);
      if (batch.length < PAGE_SIZE) break;
      if (page === MAX_PAGES - 1) truncated = true;
    }
  } catch (e) {
    return { statusCode: 503, headers: CORS_HEADERS, body: JSON.stringify({ error: "Supabase ikke konfigurert.", detail: String((e && e.message) || e) }) };
  }

  // ── Aggreger ─────────────────────────────────────────────────────────────
  const dayMap = new Map();   // dag   → { views, visitors }  (ekte sider)
  const pageMap = new Map();  // sti   → { views, visitors }  (ekte sider)
  const srcMap = new Map();   // bøtte → besøk

  for (const r of rows) {
    const path = String(r.path || "");
    const views = Number(r.views) || 0;
    const visitors = Number(r.visitors) || 0;

    if (path.indexOf(SOURCE_PREFIX) === 0) {
      const bucket = path.slice(SOURCE_PREFIX.length) || "ukjent";
      srcMap.set(bucket, (srcMap.get(bucket) || 0) + views);
      continue;
    }
    if (path.indexOf(VIRTUAL_PREFIX) === 0) continue; // andre virtuelle stier: hopp over

    const d = dayMap.get(r.day) || { views: 0, visitors: 0 };
    d.views += views; d.visitors += visitors;
    dayMap.set(r.day, d);

    const p = pageMap.get(path) || { views: 0, visitors: 0 };
    p.views += views; p.visitors += visitors;
    pageMap.set(path, p);
  }

  // Fyll ut hull, så en dag uten trafikk blir en 0 og ikke et hopp i grafen.
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = osloDay(-i);
    const d = dayMap.get(day) || { views: 0, visitors: 0 };
    daily.push({ day: day, views: d.views, visitors: d.visitors });
  }

  const pages = Array.from(pageMap, ([path, v]) => ({ path: path, views: v.views, visitors: v.visitors }))
    .sort((a, b) => b.views - a.views)
    .slice(0, TOP_PAGES);

  const sources = Array.from(srcMap, ([source, visits]) => ({ source: source, visits: visits }))
    .sort((a, b) => b.visits - a.visits);

  const totals = daily.reduce(
    (acc, d) => ({ views: acc.views + d.views, visitors: acc.visitors + d.visitors }),
    { views: 0, visitors: 0 }
  );
  totals.pages_tracked = pageMap.size;
  totals.source_visits = sources.reduce((n, s) => n + s.visits, 0);

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, days: days, from: from, to: to, totals: totals, daily: daily, sources: sources, pages: pages, truncated: truncated }),
  };
};
