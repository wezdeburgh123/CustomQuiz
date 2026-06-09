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
const library = require("./_library");
const moderation = require("./_moderation");
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

  // MODERERING lag 1: deterministisk ordliste-port (gratis, før API-kall).
  // Treff → avvis uten å generere eller lagre.
  const screen = moderation.screenThemes(input.themes);
  if (!screen.ok) {
    return {
      statusCode: 422,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Dette temaet kan vi ikke lage quiz om.", code: "blocked_topic", reason: screen.reason }),
    };
  }

  // CHECK-DB-FIRST: finnes temaet allerede i arkivet, server det momentant
  // (gratis — ingen API-bruk). Bom → generér under.
  try {
    const cached = await library.findByThemes(input.themes, input.difficulty);
    if (cached && Array.isArray(cached.questions) && cached.questions.length) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ title: cached.title, lede: cached.lede, questions: cached.questions, cached: true }),
      };
    }
  } catch (_) { /* cache-bom skal aldri blokkere generering */ }

  const gateOn = process.env.KNOWLEDGE_GATE !== "false";
  try {
    const res = await core.generateQuiz(apiKey, { ...input, gateOn, withSearch: false });
    if (!res.ok && res.blocked) {
      return {
        statusCode: 422,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Dette temaet kan vi ikke lage quiz om.", code: "blocked_topic", reason: res.reason }),
      };
    }
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
    // Nytt tema → lagre i arkivet så neste forespørsel treffer cachen.
    library.saveQuiz({
      themes: input.themes, difficulty: input.difficulty, quiz: res.quiz,
      category: "mix", model: res.model, grounded: false, source: "user",
    }).catch(() => {});
    // Cover i bakgrunnen: trigg bakgrunnsfunksjonen (fire-and-forget). Den
    // genererer et unikt arkiv-bilde og setter hero_img. Klienten viser
    // kategori-bildet nå og bytter inn coveret når det er klart. Vi venter kun
    // på 202-en (~200 ms), ikke på selve bildet.
    try {
      const host = event.headers.host || event.headers.Host;
      const ctoken = process.env.COVER_TOKEN;
      if (host && ctoken) {
        const slug = library.makeSlug(input.themes, input.difficulty);
        const u = `https://${host}/.netlify/functions/quiz-cover-background?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(ctoken)}&n=${Date.now()}`;
        await fetch(u).catch(() => {});
      }
    } catch (_) { /* cover skal aldri blokkere quiz-svaret */ }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(res.quiz) };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Klarte ikke generere quiz.", detail: err.message }),
    };
  }
};
