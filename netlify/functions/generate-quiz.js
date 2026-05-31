/**
 * CustomQuiz — synkront quiz-endepunkt (UTEN websøk).
 * ---------------------------------------------------
 * Rask vei: genererer fra modellens egen kunnskap, returnerer ferdig quiz i
 * samme svar. Brukes som FALLBACK av frontend hvis async-jobben (med websøk)
 * ikke er tilgjengelig. Den websøk-baserte hovedveien ligger i
 * quiz-generate-background.js + quiz-status.js.
 *
 * Felles logikk i _quizcore.js. Nøkkelen (ANTHROPIC_API_KEY) er kun server-side.
 */
const core = require("./_quizcore");
const { CORS_HEADERS } = core;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };

  // Abonnement (hopper over hvis ikke konfigurert).
  const authH = event.headers.authorization || event.headers.Authorization || "";
  const sub = await core.checkSubscription(authH);
  if (!sub.ok)
    return { statusCode: sub.status, headers: CORS_HEADERS, body: JSON.stringify({ error: sub.message, code: sub.code }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Serveren mangler ANTHROPIC_API_KEY." }) };

  let input;
  try {
    input = core.sanitizeInput(JSON.parse(event.body || "{}"));
  } catch (e) {
    const msg = e.code === "NO_THEMES" ? "Mangler 'themes'." : "Ugyldig JSON-body.";
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: msg }) };
  }

  const gateOn = process.env.KNOWLEDGE_GATE !== "false";
  try {
    const res = await core.generateQuiz(apiKey, { ...input, gateOn, withSearch: false });
    if (!res.ok && res.insufficient) {
      return {
        statusCode: 422,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: "Vi har ikke nok sikker kunnskap om dette temaet til å lage en kvalitetsquiz.",
          code: "insufficient_knowledge",
          reason: res.reason,
        }),
      };
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(res.quiz) };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Klarte ikke generere quiz.", detail: err.message }),
    };
  }
};
