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
const moderation = require("./_moderation");

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

    await writeJob(jobId, { status: "running", phase: "archive" });

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

    // Kanonisk slug for denne quizen — sendes til klienten så den kan bygge
    // en delelenke (?lib=<slug>) til nøyaktig samme quiz.
    const shareSlug = library.makeSlug(input.themes, input.difficulty);

    // MODERERING lag 1: deterministisk ordliste-port (gratis, før API-kall).
    const screen = moderation.screenThemes(input.themes);
    if (!screen.ok) {
      await writeJob(jobId, { status: "blocked", reason: screen.reason });
      return { statusCode: 202, body: "" };
    }

    // CHECK-DB-FIRST: finnes temaet i arkivet, server det momentant (gratis).
    try {
      const cached = await library.findByThemes(input.themes, input.difficulty);
      if (cached && Array.isArray(cached.questions) && cached.questions.length) {
        await writeJob(jobId, { status: "done", quiz: { title: cached.title, lede: cached.lede, questions: cached.questions }, cached: true, slug: shareSlug });
        return { statusCode: 202, body: "" };
      }
    } catch (_) { /* cache-bom skal aldri blokkere generering */ }

    // Cache-bom: temaet finnes ikke i arkivet → ekte generering starter.
    // Signaliser fase til poll-klienten så loaderen kan skyve steget videre.
    await writeJob(jobId, { status: "running", phase: "generating" });

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
      if (!res.ok && res.blocked) {
        await writeJob(jobId, { status: "blocked", reason: res.reason });
      } else if (!res.ok && res.insufficient) {
        await writeJob(jobId, { status: "insufficient", reason: res.reason });
      } else {
        await writeJob(jobId, { status: "done", quiz: res.quiz, slug: shareSlug });
        // Nytt tema → lagre i arkivet (grunnet via websøk når withSearch var på).
        // MÅ await-es: i serverless fryses funksjonen når handleren returnerer,
        // så en fire-and-forget-skriving rekker ikke fullføre → delelenka 404-er.
        // Klienten har alt fått quizen (done skrevet over), så dette koster ikke UX.
        try {
          await library.saveQuiz({
            themes: input.themes, difficulty: input.difficulty, quiz: res.quiz,
            category: library.categorizeThemes(input.themes), model: res.model, grounded: withSearch, source: "user",
          });
          // Cover i BAKGRUNNEN: generér et unikt arkiv-bilde i brand-stil og pek
          // raden dit. Klienten har alt fått quizen (status «done» over) og viser
          // kategori-bildet umiddelbart; den poller storage-URL-en og bytter inn
          // coveret når det er klart. Feiler dette, beholdes kategori-bildet.
          try {
            const images = require("./_images");
            const { supa } = require("./_supabase");
            const made = await images.makeCover({
              slug: shareSlug, title: res.quiz.title, category: "mix", lede: res.quiz.lede,
            });
            await supa().from(library.TABLE).update({ hero_img: made.url }).eq("slug", shareSlug);
            console.log("[bg] cover OK", shareSlug, "→", made.url);
          } catch (coverErr) {
            console.warn("[bg] cover-generering feilet:", coverErr.message);
          }
        } catch (saveErr) {
          console.warn("[bg] arkiv-lagring feilet:", saveErr.message);
        }
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
