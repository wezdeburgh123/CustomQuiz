/**
 * CustomQuiz — poll-endepunkt for async quiz-jobber.
 * --------------------------------------------------
 * Nettleseren poller GET /api/quiz-status?jobId=… mens bakgrunnsfunksjonen
 * jobber. Leser jobbstatus fra Netlify Blobs (store «quiz-jobs»).
 *
 * Svar:
 *   200 { status: "running" }                      — jobber fortsatt
 *   200 { status: "done", quiz }                    — ferdig
 *   200 { status: "insufficient", reason }          — vakten avviste temaet
 *   200 { status: "error", error, code? }           — feilet
 *   200 { status: "pending" }                       — ikke skrevet ennå (helt fersk)
 */
const { CORS_HEADERS } = require("./_quizcore");
const { getStore } = require("@netlify/blobs");

const STORE = "quiz-jobs";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const jobId = (event.queryStringParameters && event.queryStringParameters.jobId || "").slice(0, 80);
  if (!jobId)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ status: "error", error: "Mangler jobId." }) };

  try {
    const store = getStore(STORE);
    const job = await store.get(jobId, { type: "json" });
    if (!job) {
      // Enten helt fersk (ikke skrevet ennå) eller utløpt — be poller prøve igjen.
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: "pending" }) };
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(job) };
  } catch (e) {
    console.error("[status] Blobs-feil:", e.name, e.message);
    // MIDLERTIDIG: eksponer den ekte feilen for diagnose (fjernes etterpå).
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: "error", error: "Kunne ikke lese jobbstatus.", _debug: (e.name || "") + ": " + (e.message || "") }) };
  }
};
