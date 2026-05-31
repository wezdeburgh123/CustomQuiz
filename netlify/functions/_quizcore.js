/**
 * CustomQuiz — delt kjerne for quiz-generering
 * --------------------------------------------
 * Felles logikk brukt av:
 *   - generate-quiz.js            (synkront endepunkt, UTEN websøk — rask fallback)
 *   - quiz-generate-background.js (Netlify Background Function, MED websøk)
 *   - quiz-status.js              (poll-endepunkt; bruker bare CORS_HEADERS)
 *
 * Holder ÉN kilde til sannhet for prompt, validering og Anthropic-kall.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// Primær + reserve. QUIZ_MODEL (hvis satt) prøves alltid først.
// VIKTIG: bruk FULLE daterte modellnavn — alias-navn (f.eks. "claude-sonnet-4-5"
// eller "...-latest") gir 404 på denne kontoen. claude-sonnet-4-5-20250929 er
// bekreftet å virke (inkl. websøk) i Anthropic-loggen 31. mai 2026.
const DEFAULT_MODELS = ["claude-sonnet-4-5-20250929", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const DIFFICULTY_DESC = {
  lett: "Kjente fakta og grunnleggende kunnskap. Sikter mot 70-85% treffrate.",
  medium: "Krever ettertanke. Plausible distraktorer. Sikter mot 50-70% treffrate.",
  vanskelig: "Utfordrende og spesifikt. Sikter mot 30-50% treffrate selv hos interesserte.",
};

function buildPrompt(themes, difficulty, count, opts = {}) {
  const gateOn = opts.gateOn !== false;
  const withSearch = opts.withSearch === true;
  // Gulv for "lag heller færre enn å avvise". For smale tema er en kortere,
  // faktabasert quiz bedre enn et flatt nei — avvis kun hvis ikke engang dette går.
  const minQ = Math.min(count, 5);

  // Med websøk: be modellen verifisere FØR den dikter. Vakten gjelder fortsatt,
  // men først ETTER søk — finner den ingen pålitelige kilder, avviser den.
  const searchBlock = withSearch
    ? `Du har et websøk-verktøy. Gjør NOEN FÅ målrettede søk (helst 1-3 totalt) for å bekrefte de viktigste fakta — ikke søk på hvert enkelt spørsmål. For tema du allerede kjenner godt, trenger du kanskje ikke søke i det hele tatt. Foretrekk pålitelige kilder (Wikipedia, Store norske leksikon, offisielle nettsider, anerkjente medier). Bygg spørsmål KUN på fakta du har bekreftet via søk eller sikker kunnskap.

`
    : "";

  const gateBlock = gateOn
    ? `Om antall: lag så mange FAKTABASERTE spørsmål du trygt kan, opptil ${count}. Klarer du ikke ${count} fra ${withSearch ? "pålitelige kilder eller " : ""}sikker kunnskap, lag heller FÆRRE — men aldri færre enn ${minQ}, og aldri dikt opp fakta for å fylle opp antallet. En kortere, korrekt quiz er bedre enn en lang med oppspinn.
Bare hvis du ikke engang klarer ${minQ} solide, faktabaserte spørsmål (temaet er for smalt/ukjent — f.eks. en person/artist som knapt finnes i kilder, eller noe etter kunnskapsgrensa di): returner KUN dette objektet, ingenting annet:
{"insufficient_knowledge": true, "reason": "kort norsk begrunnelse på én setning"}

`
    : "";

  const multiThemeInstruction =
    themes.length > 1
      ? `\nQuizen skal blande disse ${themes.length} temaene. Fordel spørsmålene så jevnt som mulig mellom dem. Sett "category" på hvert spørsmål til hvilket tema det tilhører. Rekkefølgen kan være variert — ikke alle av samme tema på rad.`
      : "";

  const themeBlock =
    themes.length === 1
      ? `temaet "${themes[0]}"`
      : `disse temaene blandet: ${themes.map((t) => `"${t}"`).join(", ")}`;

  return `Du er en quiz-generator. Det aller siste du skriver skal være ET rent JSON-objekt — ingen markdown-koder rundt det, ingen hilsen.

${searchBlock}${gateBlock}Oppgave: Lag en quiz på norsk om ${themeBlock}.${multiThemeInstruction}

Nivå: ${difficulty}. ${DIFFICULTY_DESC[difficulty] || DIFFICULTY_DESC.medium}
Antall spørsmål: sikt mot ${count} (men minst ${minQ} — heller færre enn oppdiktede)

Avslutt svaret med nøyaktig dette JSON-objektet:
{"title":"kort tittel","lede":"én setning beskrivelse","questions":[{"category":"underkategori","q":"spørsmål?","options":["A","B","C","D"],"correct":0,"explanation":"kontekst"}]}

Krav:
- KRITISK: alle spørsmål, svar og forklaringer må være FAKTISK KORREKTE. Finn aldri opp fakta, navn, årstall eller hendelser. Er du usikker på et faktum, ${withSearch ? "søk det opp eller " : ""}velg en annen vinkling du er trygg på.
- "correct" er heltallsindeks 0-3 som peker til riktig alternativ
- Riktig svar varierer mellom posisjon 0, 1, 2, 3 (ikke alltid samme)
- Distraktorer skal være plausible
- Naturlig norsk språk (bokmål)
- Bruk tankestrek (—) der det passer
- Opptil ${count} spørsmål, men aldri færre enn ${minQ}; heller færre korrekte enn oppdiktede
- JSON-objektet skal være det siste i svaret, uten tekst etter`;
}

// Robust JSON-uttrekk: tåler markdown-fence eller tekst rundt objektet.
// Finner det SISTE balanserte {…}-objektet (med websøk kan modellen skrive
// tankegang/sitater før selve quizen — det endelige objektet er det siste).
function extractJSON(rawText) {
  let text = String(rawText || "").trim();
  text = text.replace(/```(?:json)?/gi, "").trim();

  // Skann etter alle topp-nivå {…}-objekter, behold det siste gyldige.
  let best = null;
  for (let start = text.indexOf("{"); start !== -1; start = text.indexOf("{", start + 1)) {
    let depth = 0, inString = false, escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const candidate = text.slice(start, i + 1);
          try {
            const obj = JSON.parse(candidate);
            // Vi vil ha quiz-objektet eller avslags-objektet, ikke vilkårlige {}.
            if (obj && (Array.isArray(obj.questions) || obj.insufficient_knowledge === true)) {
              best = obj;
            } else if (!best) {
              best = obj; // husk noe gyldig som siste utvei
            }
          } catch (_) { /* ikke gyldig JSON, gå videre */ }
          start = i; // hopp forbi dette objektet i ytre loop
          break;
        }
      }
    }
  }
  if (best === null) throw new Error("Fant ingen JSON-struktur i svaret");
  return best;
}

function validateQuiz(quiz, count) {
  if (!quiz || typeof quiz !== "object") throw new Error("Svaret er ikke et objekt");
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0)
    throw new Error('JSON mangler "questions"-array');
  quiz.questions.forEach((q, idx) => {
    if (!q.q) throw new Error(`Spørsmål ${idx + 1}: mangler tekst`);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      throw new Error(`Spørsmål ${idx + 1}: må ha nøyaktig 4 alternativer`);
    if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3)
      throw new Error(`Spørsmål ${idx + 1}: ugyldig "correct"-indeks`);
    if (!q.category) q.category = "Blandet";
    if (!q.explanation) q.explanation = "";
  });
  if (!quiz.title) quiz.title = "Quiz";
  if (!quiz.lede) quiz.lede = "";
  return quiz;
}

// Slår sammen alle tekst-blokker fra svaret. Med web_search inneholder
// content også server_tool_use/web_search_tool_result-blokker (uten .text) —
// de hoppes over.
function textFromContent(data) {
  if (Array.isArray(data.content)) {
    return data.content.map((b) => (typeof b.text === "string" ? b.text : "")).join("\n");
  }
  if (typeof data.completion === "string") return data.completion;
  if (typeof data.text === "string") return data.text;
  throw new Error("Ukjent svarstruktur fra Anthropic");
}

async function callAnthropic(apiKey, model, prompt, opts = {}) {
  const payload = {
    model,
    max_tokens: opts.maxTokens || 4000,
    messages: [{ role: "user", content: prompt }],
  };
  if (typeof opts.temperature === "number") payload.temperature = opts.temperature;
  // Websøk-verktøy (server-side; Anthropic kjører søkene og returnerer ferdig svar).
  if (opts.webSearch) {
    payload.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: opts.maxSearches || 5 }];
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}: ${bodyText.slice(0, 300)}`);
    err.status = response.status;
    throw err;
  }
  const data = JSON.parse(bodyText);
  if (data.error) throw new Error("API-feil: " + (data.error.message || JSON.stringify(data.error)));
  return textFromContent(data);
}

// Saniterer rå body → { themes, difficulty, count }. Kaster ved manglende tema.
function sanitizeInput(body) {
  const themes = Array.isArray(body.themes)
    ? body.themes.map((t) => String(t).slice(0, 120).trim()).filter(Boolean).slice(0, 5)
    : [];
  const difficulty = ["lett", "medium", "vanskelig"].includes(body.difficulty) ? body.difficulty : "medium";
  const count = Math.min(Math.max(parseInt(body.count, 10) || 10, 3), 15);
  if (themes.length === 0) {
    const e = new Error("Mangler 'themes'.");
    e.code = "NO_THEMES";
    throw e;
  }
  return { themes, difficulty, count };
}

/**
 * Kjerne-generering. Returnerer ett av:
 *   { ok: true, quiz, model }
 *   { ok: false, insufficient: true, reason }
 * Kaster Error (med ev. .status) ved hard feil etter alle forsøk.
 */
async function generateQuiz(apiKey, { themes, difficulty, count, gateOn = true, withSearch = false }) {
  const prompt = buildPrompt(themes, difficulty, count, { gateOn, withSearch });
  const models = [process.env.QUIZ_MODEL, ...DEFAULT_MODELS].filter(Boolean);
  // Søk er den store kostnadsdriveren (hvert søk mater store resultater inn i
  // konteksten). Begrens til få søk. Justerbart via env MAX_SEARCHES uten ny deploy.
  const maxSearches = Math.max(1, Math.min(parseInt(process.env.MAX_SEARCHES, 10) || 3, 6));
  const callOpts = withSearch
    ? { temperature: 0.3, webSearch: true, maxTokens: 4500, maxSearches }
    : { temperature: 0.4, maxTokens: 4000 };

  let lastErr = null;
  for (const model of models) {
    // Med websøk: bare ett forsøk per modell (kallet er dyrt/tregt). Uten: to.
    const attempts = withSearch ? 1 : 2;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const raw = await callAnthropic(apiKey, model, prompt, callOpts);
        const parsed = extractJSON(raw);
        if (parsed && parsed.insufficient_knowledge === true) {
          console.log("[gate] avvist:", JSON.stringify({ themes, reason: parsed.reason || "" }));
          return { ok: false, insufficient: true, reason: String(parsed.reason || "") };
        }
        const quiz = validateQuiz(parsed, count);
        console.log("[generate] OK via modell:", model, withSearch ? "(websøk)" : "");
        return { ok: true, quiz, model };
      } catch (inner) {
        lastErr = inner;
        // Auth/kvote-feil: ikke hamre videre på samme modell.
        if (inner.status === 401 || inner.status === 403 || inner.status === 429) break;
      }
    }
  }
  throw (lastErr || new Error("Klarte ikke generere quiz."));
}

/**
 * Server-side tilgangskontroll. Returnerer { ok:true } eller
 * { ok:false, code, status, message }. Tre nivåer, styrt av env:
 *
 *   1. ÅPEN (standard): ingen Supabase-env / ingen flagg → alle slipper gjennom.
 *   2. INNLOGGINGS-SPERRE: REQUIRE_LOGIN=true + SUPABASE_URL + SUPABASE_ANON_KEY
 *      → krever gyldig innlogging (Supabase-JWT), men IKKE abonnement.
 *      Stopper anonymt misbruk uten at betaling er på plass.
 *   3. ABONNEMENT: REQUIRE_SUBSCRIPTION≠false + alle tre Supabase-env (inkl.
 *      SERVICE_ROLE) → krever aktivt abonnement.
 *
 * Feiler LUKKET ved verifiseringsfeil (heller avvise enn å la uautorisert skje).
 */
async function checkSubscription(authHeader) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const requireSub = process.env.REQUIRE_SUBSCRIPTION !== "false"
    && SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY;
  const requireLogin = process.env.REQUIRE_LOGIN === "true" && SUPABASE_URL && SUPABASE_ANON_KEY;
  if (!requireSub && !requireLogin) return { ok: true };

  const token = String(authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, code: "SUBSCRIPTION", message: "Logg inn for å generere quizer." };

  try {
    const { createClient } = require("@supabase/supabase-js");
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: u, error } = await anon.auth.getUser(token);
    if (error || !u || !u.user || !u.user.email)
      return { ok: false, status: 401, code: "SUBSCRIPTION", message: "Økten er ugyldig. Logg inn på nytt." };

    // Innloggings-sperre: gyldig innlogging er nok (ingen abonnementssjekk).
    if (!requireSub) return { ok: true };

    // Abonnement-modus: krev aktiv abonnent (krever SERVICE_ROLE).
    const email = u.user.email.toLowerCase();
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: sub, error: e2 } = await svc
      .from("subscribers").select("status").eq("email", email).maybeSingle();
    if (e2) throw new Error(e2.message);
    if (!sub || sub.status !== "active")
      return { ok: false, status: 402, code: "SUBSCRIPTION", message: "Aktivt abonnement kreves for å generere egne quizer." };
    return { ok: true };
  } catch (err) {
    return { ok: false, status: 503, code: "VERIFY_FAILED", message: "Kunne ikke verifisere tilgang akkurat nå. Prøv igjen om litt." };
  }
}

module.exports = {
  ANTHROPIC_URL, ANTHROPIC_VERSION, DEFAULT_MODELS, CORS_HEADERS, DIFFICULTY_DESC,
  buildPrompt, extractJSON, validateQuiz, textFromContent, callAnthropic,
  sanitizeInput, generateQuiz, checkSubscription,
};
