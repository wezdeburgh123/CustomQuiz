/**
 * CustomQuiz — server dagens temautgaver til alle (offentlig, ingen innlogging).
 * GET /api/daily-quiz[?category=sport]
 *   → { quiz_date, isToday, default_category, selected_category,
 *       editions:[{category,category_label,title,lede,hero_img}], theme, quiz }
 *
 * `editions` er lett metadata for tema-velgeren (chips). `quiz` er den fulle
 * quizen for valgt kategori (eller dagens forhåndsvalg). Bytt utgave ved å
 * hente på nytt med ?category=. Faller tilbake til nyeste dato om i dag mangler.
 */
const { CORS_HEADERS } = require("./_quizcore");
const daily = require("./_daily");
const lib = require("./_library");

// Rene visningsnavn for chips (uavhengig av hva som er lagret i `theme`).
const CATEGORY_LABEL = {
  mix: "Blandet", historie: "Norsk historie", verdenshistorie: "Verdenshistorie",
  vitenskap: "Naturvitenskap", geografi: "Geografi", litteratur: "Litteratur",
  kunst: "Kunst", film: "Film og TV", musikk: "Musikk", sport: "Sport",
  filosofi: "Filosofi", teknologi: "Teknologi",
};
// Ukedag → kategori som forhåndsvelges (matcher temarytmen i nattjobben).
const DEFAULT_CAT_BY_WEEKDAY = {
  0: "mix", 1: "verdenshistorie", 2: "vitenskap", 3: "geografi",
  4: "litteratur", 5: "film", 6: "sport",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  try {
    let date = daily.osloDate(0);
    let isToday = true;
    let eds = await daily.getEditions(date);
    if (!eds.length) {
      const latest = await daily.getLatestDate();
      if (latest) { date = latest; isToday = false; eds = await daily.getEditions(date); }
    }
    if (!eds.length) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Ingen daglig quiz tilgjengelig ennå." }) };
    }

    // Stabil rekkefølge for chips: følg VALID_CATEGORIES.
    const order = lib.VALID_CATEGORIES;
    eds.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));

    const editions = eds.map((e) => ({
      category: e.category,
      category_label: CATEGORY_LABEL[e.category] || e.category,
      title: (e.quiz && e.quiz.title) || CATEGORY_LABEL[e.category] || "Quiz",
      lede: (e.quiz && e.quiz.lede) || "",
      hero_img: lib.heroForCategory(e.category),
    }));

    const have = new Set(eds.map((e) => e.category));
    const weekdayDefault = DEFAULT_CAT_BY_WEEKDAY[daily.weekdayOf(date)] || "mix";
    let defaultCat = have.has(weekdayDefault) ? weekdayDefault
                   : (have.has("mix") ? "mix" : eds[0].category);

    // Valgt kategori: ?category= hvis gyldig, ellers dagens forhåndsvalg.
    const wanted = (event.queryStringParameters && event.queryStringParameters.category) || "";
    const selected = have.has(wanted) ? wanted : defaultCat;
    const chosen = eds.find((e) => e.category === selected) || eds[0];

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        quiz_date: date,
        isToday,
        default_category: defaultCat,
        selected_category: chosen.category,
        editions,
        theme: chosen.theme,
        quiz: chosen.quiz,
      }),
    };
  } catch (e) {
    console.error("[daily-quiz] feil:", e.message);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Kunne ikke hente dagens quiz." }) };
  }
};
