/**
 * CustomQuiz — daglig fellesquiz-generator (Netlify Scheduled Function).
 * --------------------------------------------------------------------
 * Kjører hver kveld (se netlify.toml) og lager quizen for dagene som
 * mangler — typisk MORGENDAGEN, så den er klar før midnatt. Selv-helbredende:
 * sikrer at både i dag og i morgen finnes, så første kjøring seder i dag også.
 *
 * Tema følger en fast ukerytme (justerbart under). Websøk-grunnet via _quizcore.
 * Auto-publiseres (ingen manuell godkjenning) — vakt + websøk sikrer kvalitet.
 * Kan også trigges manuelt (GET/POST) for å seede med en gang.
 */
const core = require("./_quizcore");
const daily = require("./_daily");

// Fast ukerytme. Brede tema med vilje — da finner websøket alltid nok.
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

async function ensureDay(apiKey, dateStr) {
  const existing = await daily.getDaily(dateStr);
  if (existing) return { dateStr, status: "fantes" };

  const theme = THEME_BY_WEEKDAY[daily.weekdayOf(dateStr)] || FALLBACK_THEME;
  let res;
  try {
    // UTEN websøk: daglig-temaene er brede (historie, vitenskap, geografi …) der
    // modellens egen kunnskap er solid. Det holder oss innenfor tidsgrensa (også
    // ved manuell trigging), kutter kostnad, og unngår nisje-hallusinering siden
    // temaene aldri er smale. Websøk er forbeholdt brukernes egne nisjetema.
    res = await core.generateQuiz(apiKey, { themes: [theme], difficulty: "medium", count: 10, gateOn: true, withSearch: false });
    // Daglig quiz MÅ finnes — hvis vakten mot formodning sier nei, fall tilbake
    // til et trygt, bredt tema uten vakt.
    if (!res.ok) throw new Error("vakt avviste daglig tema: " + (res.reason || ""));
  } catch (e1) {
    console.warn("[daily] " + dateStr + " (" + theme + ") feilet, prøver fallback:", e1.message);
    res = await core.generateQuiz(apiKey, { themes: [FALLBACK_THEME], difficulty: "medium", count: 10, gateOn: false, withSearch: false });
  }
  if (!res.ok || !res.quiz) throw new Error("klarte ikke generere daglig quiz for " + dateStr);
  await daily.saveDaily(dateStr, theme, res.quiz);
  return { dateStr, theme, status: "generert" };
}

exports.handler = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[daily] mangler ANTHROPIC_API_KEY");
    return { statusCode: 500, body: "mangler nøkkel" };
  }
  const results = [];
  // I dag (seeding ved første kjøring) + i morgen (klar før midnatt).
  for (const offset of [0, 1]) {
    const dateStr = daily.osloDate(offset);
    try {
      results.push(await ensureDay(apiKey, dateStr));
    } catch (e) {
      console.error("[daily] " + dateStr + " feilet helt:", e.message);
      results.push({ dateStr, status: "feil", error: e.message });
    }
  }
  console.log("[daily] resultat:", JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify({ results }) };
};
