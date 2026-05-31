/**
 * CustomQuiz — server dagens fellesquiz til alle (offentlig, ingen innlogging).
 * GET /api/daily-quiz → { quiz_date, theme, quiz, isToday }
 * Faller tilbake til nyeste tilgjengelige quiz hvis dagens ikke er generert ennå.
 */
const { CORS_HEADERS } = require("./_quizcore");
const daily = require("./_daily");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const today = daily.osloDate(0);
  try {
    let row = await daily.getDaily(today);
    let isToday = true;
    if (!row) {
      // Ikke generert ennå (mellom midnatt og kveldens jobb) — vis nyeste.
      row = await daily.getLatest();
      isToday = false;
    }
    if (!row) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ingen daglig quiz tilgjengelig ennå." }) };
    }
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ quiz_date: row.quiz_date, theme: row.theme, quiz: row.quiz, isToday }),
    };
  } catch (e) {
    console.error("[daily-quiz] feil:", e.message);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke hente dagens quiz." }) };
  }
};
