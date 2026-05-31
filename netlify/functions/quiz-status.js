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
const jobs = require("./_jobs");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const jobId = (event.queryStringParameters && event.queryStringParameters.jobId || "").slice(0, 80);
  if (!jobId)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ status: "error", error: "Mangler jobId." }) };

  try {
    const job = await jobs.getJob(jobId);
    if (!job) {
      // Enten helt fersk (ikke skrevet ennå) eller utløpt — be poller prøve igjen.
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: "pending" }) };
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(job) };
  } catch (e) {
    console.error("[status] jobb-lager-feil:", e.name, e.message);
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: "error", error: "Kunne ikke lese jobbstatus." }) };
  }
};
