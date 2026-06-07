/**
 * CustomQuiz — daglig fellesquiz-generator (Netlify Scheduled Function).
 * --------------------------------------------------------------------
 * Fase 1 (temautgaver): For hver dato materialiserer vi ÉN utgave per
 * kategori som har innhold i arkivet (quiz_library). Utvalget er
 * deterministisk (samme for alle, roterer dag for dag) og GRATIS — det
 * gjenbruker quizene nattskiftet allerede har lagt i arkivet, så vi
 * genererer ingenting nytt via API-et i normal drift.
 *
 * Selv-helbredende: sikrer at både i dag og i morgen har utgaver.
 * Sikkerhetsnett: hvis arkivet er tomt (ingen utgaver kan dannes), faller
 * vi tilbake til å generere ÉN fersk «blandet»-quiz (som før), så «dagens»
 * aldri står tom. Kan trigges manuelt (GET/POST) for å seede med en gang.
 */
const core = require("./_quizcore");
const daily = require("./_daily");
const lib = require("./_library");

// Ukedagstema styrer hvilken kategori som forhåndsvelges (se daily-quiz.js).
// Fallback-generering bruker disse brede temaene der modellen er solid.
const THEME_BY_WEEKDAY = {
  0: "blandet allmennkunnskap",          // søndag
  1: "norsk og internasjonal historie",  // mandag
  2: "vitenskap og natur",               // tirsdag
  3: "geografi og verden",               // onsdag
  4: "kultur og litteratur",             // torsdag
  5: "film og musikk",                   // fredag
  6: "sport",                            // lørdag
};
const FALLBACK_THEME = "blandet allmennkunnskap";

// Materialiser alle utgaver for én dato fra arkivet. Returnerer hvor mange
// nye utgaver som ble lagt til + status.
async function materializeDay(dateStr) {
  const existing = await daily.getEditions(dateStr);
  const have = new Set(existing.map((e) => e.category));

  const counts = await daily.libraryCategories(); // { sport: 12, film: 3, ... }
  // Stabil, lesbar rekkefølge: følg VALID_CATEGORIES, behold kun de med innhold.
  const offered = lib.VALID_CATEGORIES.filter((c) => (counts[c] || 0) > 0);

  let added = 0;
  for (const cat of offered) {
    if (have.has(cat)) continue;
    const pick = await daily.pickFromLibrary(cat, dateStr);
    if (!pick) continue;
    const label = pick.category_label || cat;
    await daily.saveEdition(dateStr, cat, label, {
      title: pick.title, lede: pick.lede, questions: pick.questions,
    });
    added++;
  }
  return { dateStr, offered: offered.length, added, total: have.size + added };
}

// Sikkerhetsnett: kun når en dato ender med NULL utgaver (tomt arkiv).
async function ensureFallback(apiKey, dateStr) {
  const eds = await daily.getEditions(dateStr);
  if (eds.length) return { dateStr, status: "har-utgaver", count: eds.length };
  if (!apiKey) return { dateStr, status: "tomt-uten-nøkkel" };

  const theme = THEME_BY_WEEKDAY[daily.weekdayOf(dateStr)] || FALLBACK_THEME;
  let res;
  try {
    res = await core.generateQuiz(apiKey, { themes: [theme], difficulty: "medium", count: 10, gateOn: true, withSearch: false });
    if (!res.ok) throw new Error("vakt avviste: " + (res.reason || ""));
  } catch (e1) {
    console.warn("[daily] fallback " + dateStr + " (" + theme + ") feilet, prøver bredt tema:", e1.message);
    res = await core.generateQuiz(apiKey, { themes: [FALLBACK_THEME], difficulty: "medium", count: 10, gateOn: false, withSearch: false });
  }
  if (!res.ok || !res.quiz) throw new Error("klarte ikke generere fallback for " + dateStr);
  await daily.saveEdition(dateStr, "mix", theme, res.quiz);
  return { dateStr, status: "fallback-generert", theme };
}

exports.handler = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY; // brukes kun av sikkerhetsnettet
  const results = [];
  // I dag (seeding ved første kjøring) + i morgen (klar før midnatt).
  for (const offset of [0, 1]) {
    const dateStr = daily.osloDate(offset);
    try {
      const mat = await materializeDay(dateStr);
      const fb = await ensureFallback(apiKey, dateStr);
      results.push({ ...mat, fallback: fb.status });
    } catch (e) {
      console.error("[daily] " + dateStr + " feilet:", e.message);
      results.push({ dateStr, status: "feil", error: e.message });
    }
  }
  console.log("[daily] resultat:", JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify({ results }) };
};
