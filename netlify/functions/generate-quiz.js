/**
 * CustomQuiz — serverless quiz-generator
 * ---------------------------------------
 * Kjører på Netlify Functions. Holder Anthropic-nøkkelen på serveren
 * (env-variabel ANTHROPIC_API_KEY), bygger prompten selv og returnerer
 * et ferdig validert quiz-objekt. Nøkkelen eksponeres ALDRI i frontend.
 *
 * Forventer POST med JSON-body: { themes: string[], difficulty: "lett"|"medium"|"vanskelig", count: number }
 * Svarer med: { title, lede, questions: [{ category, q, options[4], correct, explanation }] }
 *
 * Env:
 *   ANTHROPIC_API_KEY  (påkrevd)  — din API-nøkkel
 *   QUIZ_MODEL         (valgfri)  — overstyr modellnavn, f.eks. "claude-sonnet-4-6"
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// Primær + reserve. QUIZ_MODEL (hvis satt) prøves alltid først.
// Flere navn for robusthet: hvis ett ikke finnes på kontoen, prøves neste.
const DEFAULT_MODELS = ["claude-sonnet-4-5", "claude-sonnet-4-6", "claude-3-5-sonnet-latest"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const DIFFICULTY_DESC = {
  lett: "Kjente fakta og grunnleggende kunnskap. Sikter mot 70-85% treffrate.",
  medium: "Krever ettertanke. Plausible distraktorer. Sikter mot 50-70% treffrate.",
  vanskelig: "Utfordrende og spesifikt. Sikter mot 30-50% treffrate selv hos interesserte.",
};

function buildPrompt(themes, difficulty, count) {
  const multiThemeInstruction =
    themes.length > 1
      ? `\nQuizen skal blande disse ${themes.length} temaene. Fordel spørsmålene så jevnt som mulig mellom dem. Sett "category" på hvert spørsmål til hvilket tema det tilhører. Rekkefølgen kan være variert — ikke alle av samme tema på rad.`
      : "";

  const themeBlock =
    themes.length === 1
      ? `temaet "${themes[0]}"`
      : `disse temaene blandet: ${themes.map((t) => `"${t}"`).join(", ")}`;

  return `Du er en quiz-generator. Du svarer KUN med rent JSON-objekt — ingen markdown-koder, ingen forklaring før eller etter, ingen hilsen.

Oppgave: Lag en quiz på norsk om ${themeBlock}.${multiThemeInstruction}

Nivå: ${difficulty}. ${DIFFICULTY_DESC[difficulty] || DIFFICULTY_DESC.medium}
Antall spørsmål: ${count}

Returner nøyaktig dette JSON-objektet (uten omkringliggende tekst):
{"title":"kort tittel","lede":"én setning beskrivelse","questions":[{"category":"underkategori","q":"spørsmål?","options":["A","B","C","D"],"correct":0,"explanation":"kontekst"}]}

Krav:
- KRITISK: alle spørsmål, svar og forklaringer må være FAKTISK KORREKTE. Finn aldri opp fakta, navn, årstall eller hendelser. Er du usikker på et faktum, velg en annen vinkling du er trygg på i stedet.
- "correct" er heltallsindeks 0-3 som peker til riktig alternativ
- Riktig svar varierer mellom posisjon 0, 1, 2, 3 (ikke alltid samme)
- Distraktorer skal være plausible
- Naturlig norsk språk (bokmål)
- Bruk tankestrek (—) der det passer
- Eksakt ${count} spørsmål
- IKKE skriv noe annet enn JSON-objektet`;
}

// Robust JSON-uttrekk: tåler ev. markdown-fence eller tekst rundt objektet.
function extractJSON(rawText) {
  let text = String(rawText || "").trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) throw new Error("Fant ingen JSON-struktur i svaret");
  let depth = 0,
    lastBrace = -1,
    inString = false,
    escape = false;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { lastBrace = i; break; } }
  }
  if (lastBrace === -1) throw new Error("Ufullstendig JSON-struktur");
  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
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

async function callAnthropic(apiKey, model, prompt, opts = {}) {
  const payload = {
    model,
    max_tokens: opts.maxTokens || 4000,
    messages: [{ role: "user", content: prompt }],
  };
  // Lav temperatur gir mer faktanær, mindre "kreativ" output. Viktig for quiz.
  if (typeof opts.temperature === "number") payload.temperature = opts.temperature;

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
  if (Array.isArray(data.content)) return data.content.map((b) => b.text || "").join("");
  if (typeof data.completion === "string") return data.completion;
  if (typeof data.text === "string") return data.text;
  throw new Error("Ukjent svarstruktur fra Anthropic");
}

/**
 * KUNNSKAPSVAKT (Fase A).
 * Spør modellen — FØR vi genererer — om den faktisk har pålitelig kunnskap
 * om tema(ene). Smale/ukjente tema (f.eks. ukjente lokale artister) får
 * modellen til å dikte opp plausibel, men feil fakta. Da vil vi heller
 * avvise enn å servere tøv.
 *
 * Returnerer { confident: boolean, reason: string }.
 * Kaster ved API-/parse-feil — kalleren velger da å "feile åpent" (slippe
 * gjennom), så en vakt-hikke ikke blokkerer legitime quizer.
 */
async function assessKnowledge(apiKey, model, themes) {
  const themeList = themes.map((t) => `"${t}"`).join(", ");
  const prompt = `Du er en streng faktasjekk-vakt for en quiz-app. Vurder om du har PÅLITELIG, FAKTISK kunnskap til å lage en quiz med KORREKTE svar om følgende tema: ${themeList}.

Vær konservativ. Sett "confident": false hvis temaet er så smalt, ukjent eller nytt at du måtte gjette eller finne på fakta — for eksempel ukjente lokale artister, svært spesifikke personer eller produkter, eller hendelser etter kunnskapsgrensa di. Sett "confident": true bare for tema der du har solid, etterprøvbar kunnskap (kjente personer, steder, historie, vitenskap, kultur, kjente verk).

Hvis flere tema er oppgitt og du mangler sikker kunnskap om MINST ETT, sett false og nevn hvilket.

Svar KUN med dette JSON-objektet — ingen markdown, ingen tekst rundt:
{"confident": true, "reason": "kort norsk begrunnelse på én setning"}`;

  const raw = await callAnthropic(apiKey, model, prompt, { maxTokens: 300, temperature: 0 });
  const parsed = extractJSON(raw);
  if (typeof parsed.confident !== "boolean") {
    throw new Error('Vakt-svar mangler boolsk "confident"');
  }
  return { confident: parsed.confident, reason: String(parsed.reason || "") };
}

/**
 * Fase B — server-side håndheving av abonnement.
 * Returnerer null hvis OK å fortsette, ellers et HTTP-svar som avviser.
 *
 * Slås av med REQUIRE_SUBSCRIPTION=false (nyttig før betaling er live).
 * Krever SUPABASE_URL + SUPABASE_ANON_KEY (verifiserer JWT) +
 * SUPABASE_SERVICE_ROLE_KEY (slår opp abonnementsstatus). Mangler noen av
 * disse, er porten AV (åpen) — så siden funker før Supabase er satt opp.
 *
 * Feiler LUKKET: hvis vi ikke klarer å verifisere, avvises kallet (beskytter
 * mot at gratisbrukere brenner API-penger).
 */
async function requireSubscription(event) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const gateOn = process.env.REQUIRE_SUBSCRIPTION !== "false"
    && SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY;
  if (!gateOn) return null;

  const deny = (code, msg) => ({ statusCode: code, headers: CORS_HEADERS, body: JSON.stringify({ error: msg }) });

  const authz = event.headers.authorization || event.headers.Authorization || "";
  const token = authz.replace(/^Bearer\s+/i, "").trim();
  if (!token) return deny(401, "Logg inn for å generere egne quizer.");

  try {
    const { createClient } = require("@supabase/supabase-js");
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: u, error } = await anon.auth.getUser(token);
    if (error || !u || !u.user || !u.user.email) return deny(401, "Økten er ugyldig. Logg inn på nytt.");
    const email = u.user.email.toLowerCase();

    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: sub, error: e2 } = await svc
      .from("subscribers").select("status").eq("email", email).maybeSingle();
    if (e2) throw new Error(e2.message);
    if (!sub || sub.status !== "active") return deny(402, "Aktivt abonnement kreves for å generere egne quizer.");
    return null; // OK
  } catch (err) {
    // Feil lukket — heller avvise enn å la generering skje uverifisert.
    return deny(503, "Kunne ikke verifisere abonnement akkurat nå. Prøv igjen om litt.");
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Bruk POST." }) };
  }

  // Fase B: krev aktivt abonnement (hopper over hvis ikke konfigurert).
  const denied = await requireSubscription(event);
  if (denied) return denied;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Serveren mangler ANTHROPIC_API_KEY. Legg den til i Netlify → Site settings → Environment variables." }),
    };
  }

  // Parse + saniter input (begrenser bruk til quiz-generering, ikke fri prompt).
  let themes, difficulty, count;
  try {
    const body = JSON.parse(event.body || "{}");
    themes = Array.isArray(body.themes)
      ? body.themes.map((t) => String(t).slice(0, 120).trim()).filter(Boolean).slice(0, 5)
      : [];
    difficulty = ["lett", "medium", "vanskelig"].includes(body.difficulty) ? body.difficulty : "medium";
    count = Math.min(Math.max(parseInt(body.count, 10) || 10, 3), 15);
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ugyldig JSON-body." }) };
  }
  if (themes.length === 0) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Mangler 'themes'." }) };
  }

  const prompt = buildPrompt(themes, difficulty, count);
  const models = [process.env.QUIZ_MODEL, ...DEFAULT_MODELS].filter(Boolean);

  // Fase A — kunnskapsvakt. Avvis tema modellen ikke kan nok om, FØR vi genererer.
  // Slås av med KNOWLEDGE_GATE=false. Feiler ÅPENT (slipper gjennom) ved vakt-feil,
  // så en hikke ikke blokkerer ekte tema.
  if (process.env.KNOWLEDGE_GATE !== "false") {
    try {
      const gate = await assessKnowledge(apiKey, models[0], themes);
      console.log("[gate]", JSON.stringify({ themes, ...gate }));
      if (!gate.confident) {
        return {
          statusCode: 422,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: "Vi har ikke nok sikker kunnskap om dette temaet til å lage en kvalitetsquiz. Prøv et bredere eller mer kjent tema.",
            code: "insufficient_knowledge",
            reason: gate.reason,
          }),
        };
      }
    } catch (gateErr) {
      console.warn("[gate] hoppet over (feil):", gateErr.message);
    }
  }

  let lastErr = null;
  for (const model of models) {
    try {
      // Inntil 2 forsøk per modell.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const raw = await callAnthropic(apiKey, model, prompt, { temperature: 0.4 });
          const quiz = validateQuiz(extractJSON(raw), count);
          // Logg hvilken modell som faktisk svarte — gjør stille fallback synlig.
          console.log("[generate] OK via modell:", model);
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(quiz) };
        } catch (inner) {
          lastErr = inner;
          // Ved auth/kvote-feil: ikke fortsett å hamre — bryt ut til neste modell/feilmelding.
          if (inner.status === 401 || inner.status === 403 || inner.status === 429) throw inner;
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  return {
    statusCode: 502,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: "Klarte ikke generere quiz.", detail: lastErr ? lastErr.message : "ukjent feil" }),
  };
};
