/**
 * CustomQuiz — personvernvennlig trafikkteller.
 * ---------------------------------------------
 * POST /.netlify/functions/track   { path, newVisit }
 *
 * Upserter (day, path) → views+1, visitors+newVisit via RPC-en
 * increment_page_view (se db/migration-page-views.sql). Aggregerte tellere,
 * ingenting annet: vi logger ALDRI IP, user-agent eller annen persondata.
 *
 * Beacon-endepunkt (navigator.sendBeacon fra nav.js) — derfor:
 *   • Fail silent: svarer alltid 2xx til klienten, aldri 500. En telle-feil
 *     skal aldri kunne påvirke eller synes i spillopplevelsen.
 *   • Rate-vennlig: ugyldig input droppes stille uten DB-kall; ett enkelt
 *     RPC-kall per gyldig treff.
 */
const { CORS_HEADERS } = require("./_quizcore");

// Kun interne, «vanlige» stier: starter med én /, trygt tegnsett, ingen //.
const PATH_RE = /^\/[A-Za-z0-9\-._~%\/]*$/;
const MAX_PATH = 200;

// Dagens dato i Europe/Oslo som YYYY-MM-DD (en-CA gir ISO-format).
function osloDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}

// Normaliser og valider stien. Returnerer "" hvis den skal droppes.
function cleanPath(raw) {
  let p = String(raw || "").split(/[?#]/)[0].trim(); // strip query/fragment
  if (!p || p.length > MAX_PATH) return "";
  if (!PATH_RE.test(p) || p.includes("//") || p.includes("..")) return "";
  if (p.length > 1 && p.endsWith("/index.html")) p = p.slice(0, -"index.html".length);
  if (p === "/index.html") p = "/";
  return p;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  // Fra hit og ut: aldri feilsvar. Alt ugyldig → stille 204.
  const SILENT_OK = { statusCode: 204, headers: CORS_HEADERS, body: "" };

  let path = "";
  let newVisit = false;
  try {
    // sendBeacon sender text/plain — parse body-teksten direkte.
    const body = JSON.parse(event.body || "{}");
    path = cleanPath(body.path);
    newVisit = body.newVisit === true;
  } catch (_) {
    return SILENT_OK;
  }
  if (!path) return SILENT_OK;

  try {
    const { supa } = require("./_supabase");
    const { error } = await supa().rpc("increment_page_view", {
      p_day: osloDay(),
      p_path: path,
      p_new_visit: newVisit,
    });
    if (error) console.warn("[track] rpc feilet:", error.message);
  } catch (e) {
    // Manglende env / nettverksfeil — telling skal aldri velte noe.
    console.warn("[track] exception:", e.message);
  }
  return SILENT_OK;
};
