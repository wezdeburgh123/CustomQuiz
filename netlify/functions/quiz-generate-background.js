/**
 * CustomQuiz — bakgrunns-generering MED websøk (hovedveien).
 * ----------------------------------------------------------
 * Netlify Background Function (filnavn slutter på «-background»): returnerer
 * 202 til nettleseren MED EN GANG, og fortsetter arbeidet i opptil 15 min.
 * Perfekt for websøk-generering som kan ta 15-40 s og ellers ville sprengt
 * den synkrone 10s-grensa.
 *
 * Flyt:
 *   1. Nettleseren lager en jobId (UUID) og POSTer { jobId, themes, difficulty, count }.
 *   2. Vi skriver fortløpende status til Netlify Blobs (store «quiz-jobs»).
 *   3. quiz-status.js leser samme blob når nettleseren poller.
 *
 * Statusobjekt i Blobs:
 *   { status: "running" | "done" | "insufficient" | "error", quiz?, reason?, error?, code?, ts }
 */
const core = require("./_quizcore");
const jobs = require("./_jobs");
const library = require("./_library");

async function writeJob(jobId, obj) {
  try {
    await jobs.setJob(jobId, obj);
  } catch (e) {
    // Logg, men ikke kast — uten lager kan vi uansett ikke rapportere.
    console.error("[bg] kunne ikke skrive jobb:", e.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Bruk POST." };
  }

  let jobId = null;
  try {
    const body = JSON.parse(event.body || "{}");
    jobId = typeof body.jobId === "string" ? body.jobId.slice(0, 80) : null;
    if (!jobId) return { statusCode: 400, body: "Mangler jobId." };

    await writeJob(jobId, { status: "running" });

    // Abonnement (hopper over hvis ikke konfigurert).
    const authH = event.headers.authorization || event.headers.Authorization || "";
    const sub = await core.checkSubscription(authH);
    if (!sub.ok) {
      await writeJob(jobId, { status: "error", code: sub.code, error: sub.message });
      return { statusCode: 202, body: "" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await writeJob(jobId, { status: "error", error: "Serveren mangler ANTHROPIC_API_KEY." });
      return { statusCode: 202, body: "" };
    }

    let input;
    try {
      input = core.sanitizeInput(body);
    } catch (e) {
      await writeJob(jobId, { status: "error", error: e.code === "NO_THEMES" ? "Mangler tema." : "Ugyldig forespørsel." });
      return { statusCode: 202, body: "" };
    }

    // CHECK-DB-FIRST: finnes temaet i arkivet, server det momentant (gratis).
    try {
      const cached = await library.findByThemes(input.themes, input.difficulty);
      if (cached && Array.isArray(cached.questions) && cached.questions.length) {
        await writeJob(jobId, { status: "done", quiz: { title: cached.title, lede: cached.lede, questions: cached.questions }, cached: true });
        return { statusCode: 202, body: "" };
      }
    } catch (_) { /* cache-bom skal aldri blokkere generering */ }

    const gateOn = process.env.KNOWLEDGE_GATE !== "false";
    // Websøk PÅ som standard (Christians valg: «alltid søk»). WEB_SEARCH=false slår av.
    const withSearch = process.env.WEB_SEARCH !== "false";

    try {
      let res;
      try {
        res = await core.generateQuiz(apiKey, { ...input, gateOn, withSearch });
      } catch (searchErr) {
        // Websøk kan feile hvis verktøyet ikke er aktivert på kontoen, eller ved
        // en søke-hikke. Da heller en quiz uten søk enn ingenting — vakten fanger
        // fortsatt smale tema. Logges så vi ser om søk konsekvent feiler.
        if (withSearch) {
          console.warn("[bg] websøk feilet, prøver uten søk:", searchErr.message);
          res = await core.generateQuiz(apiKey, { ...input, gateOn, withSearch: false });
        } else {
          throw searchErr;
        }
      }
      if (!res.ok && res.insufficient) {
        await writeJob(jobId, { status: "insufficient", reason: res.reason });
      } else {
        await writeJob(jobId, { status: "done", quiz: res.quiz });
        // Nytt tema → lagre i arkivet (grunnet via websøk når withSearch var på).
        library.saveQuiz({
          themes: input.themes, difficulty: input.difficulty, quiz: res.quiz,
          category: "mix", model: res.model, grounded: withSearch, source: "user",
        }).catch(() => {});
      }
    } catch (genErr) {
      console.error("[bg] generering feilet:", genErr.message);
      await writeJob(jobId, { status: "error", error: "Klarte ikke generere quiz.", detail: genErr.message });
    }
  } catch (outer) {
    console.error("[bg] uventet feil:", outer.message);
    if (jobId) await writeJob(jobId, { status: "error", error: "Uventet feil under generering." });
  }

  // Background functions ignorerer responsen; 202 er konvensjonen.
  return { statusCode: 202, body: "" };
};
