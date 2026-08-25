// CustomQuiz — dynamisk OG/preview for delte quiz-lenker.
// -------------------------------------------------------
// Problem: /lag-quiz.html er én statisk fil med GENERISKE Open Graph-tagger.
// Når du deler /lag-quiz.html?lib=<slug>, kjører ikke iMessage/Facebook/Slack
// JavaScript — de leser bare rå-HTML. Derfor ble ALLE delte quizer vist med
// samme standard-preview ("CustomQuiz — daglige quizer" + IMG/og.jpg).
//
// Fiks: Denne edge-funksjonen kjører på server-siden FØR svaret når leseren/
// scraperen. Den slår opp quizen (samme kilde som spilleren bruker,
// /api/library-get) og bytter ut tittel, beskrivelse og bilde i HTML-en.
// Gjelder BÅDE arkiv-quizer og egne (custom) quizer, siden begge ligger i
// quiz_library. Finner den ikke quizen, faller den stille tilbake til den
// generiske previewen (ingen risiko for at siden ryker).

const CATEGORY_TO_IMG = {
  mix: "kategori-mix",
  historie: "kategori-norsk-historie",
  verdenshistorie: "kategori-verdenshistorie",
  vitenskap: "kategori-naturvitenskap",
  geografi: "kategori-geografi",
  litteratur: "kategori-litteratur",
  kunst: "kategori-kunst",
  film: "kategori-film",
  musikk: "kategori-musikk",
  sport: "kategori-sport",
  fotball: "kategori-sport",
  filosofi: "kategori-filosofi",
  teknologi: "kategori-teknologi",
  dyr: "kategori-mix",
  spill: "kategori-mix",
  monstere: "kategori-mix",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async (request, context) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("lib");

  // Hent det opprinnelige (statiske) svaret først.
  const response = await context.next();

  // SEO (25.8.26): ?quiz=, ?event= og ?tema= er forhåndsutfylt generator, ikke
  // egne sider. JS-injisert <meta name="robots"> holder IKKE. Verifisert live
  // 25.8: /lag-quiz?quiz=geografi-06 FÅR "noindex,follow" etter rendring, men
  // Google la den likevel i «Duplicate without user-selected canonical» — den
  // bøtta vokste 195 → 356 mellom 17. og 25.8, og noindex-bøtta stod nesten
  // stille (58 → 64). Samme lærdom som canonical-buggen 6.8: alt SEO-signal på
  // /lag-quiz må settes server-side. En HTTP-header krever ingen rendring og
  // kan ikke overses — det er mekanismen som er bevist virksom her, jf. ?lib=-
  // canonicalen lenger ned (70 sider ligger trygt som "Alternate page with
  // proper canonical tag"). rel="nofollow" på CTA-en i build-quiz-pages.mjs
  // stopper OPPDAGELSEN av nye URLer; denne headeren rydder opp i de som alt
  // er oppdaget. Ikke fjern uten å håndtere duplikatene på annen måte.
  if (!slug && (url.searchParams.has("quiz") ||
                url.searchParams.has("event") ||
                url.searchParams.has("tema"))) {
    const noindexHeaders = new Headers(response.headers);
    noindexHeaders.set("x-robots-tag", "noindex, follow");
    return new Response(response.body, {
      status: response.status,
      headers: noindexHeaders,
    });
  }

  // Bare rør ved svaret når det finnes en ?lib=<slug> OG det er en HTML-side.
  if (!slug) return response;
  const ctype = response.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return response;

  // Slå opp quizen via sitens egen API (samme tilgang/filtre som spilleren:
  // published + review_status=auto_ok). Feiler oppslaget → generisk preview.
  let quiz = null;
  try {
    const r = await fetch(
      `${url.origin}/api/library-get?slug=${encodeURIComponent(slug)}`,
      { headers: { accept: "application/json" } }
    );
    if (r.ok) quiz = await r.json();
  } catch (_) {
    /* stille fallback */
  }
  if (!quiz || !quiz.title) return response;

  const title = quiz.title;
  const desc =
    (quiz.lede && String(quiz.lede).trim()) || "Ta quizen på CustomQuiz.";

  // Bilde: bruk quizens eget cover hvis det finnes, ellers kategoribildet,
  // ellers standard og.jpg. Må være absolutt URL for scraperne.
  let img;
  if (quiz.hero_img && /^https?:\/\//.test(quiz.hero_img)) {
    img = quiz.hero_img;
  } else if (quiz.hero_img) {
    img = `${url.origin}${quiz.hero_img.startsWith("/") ? "" : "/"}${quiz.hero_img}`;
  } else {
    img = `${url.origin}/IMG/${CATEGORY_TO_IMG[quiz.category] || "og"}.jpg`;
  }

  // SEO: /lag-quiz?lib=<slug> er en DUPLIKAT av den kanoniske, indekserbare
  // /quiz/<slug>/-siden. Fram til 6.8.26 ble canonical bare satt av JavaScript
  // i lag-quiz.html — Google behandlet det som et svakt signal, og 138 sider
  // endte som «Duplicate without user-selected canonical» (validering feilet
  // 25.7). I tillegg pekte og:url på duplikatet SELV, som motvirket fiksen.
  // Nå settes begge server-side her, før svaret når crawleren.
  //
  // Trygt fordi library-get bare returnerer published + review_status=auto_ok,
  // og build-quiz-pages.mjs genererer en /quiz/<slug>/-side for nøyaktig samme
  // utvalg. Finner vi ikke quizen, returnerer vi tidlig (over) og rører ingenting.
  const canonicalUrl = `${url.origin}/quiz/${encodeURIComponent(slug)}/`;
  const fullTitle = `${title} — quiz | CustomQuiz`;

  let html = await response.text();

  // Injiser canonical tidlig i <head>. lag-quiz.html har ingen statisk
  // canonical-tagg, så vi kan ikke bruke .replace() på en eksisterende tagg.
  const canonicalTag = `<link rel="canonical" href="${esc(canonicalUrl)}">`;
  if (/<link[^>]*rel=["']canonical["']/i.test(html)) {
    // Skulle det en dag komme en statisk canonical i fila: bytt den ut i stedet
    // for å legge til en nummer to (to canonicals = Google ignorerer begge).
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else if (/<meta charset="UTF-8">/i.test(html)) {
    html = html.replace(/(<meta charset="UTF-8">)/i, `$1\n${canonicalTag}`);
  } else {
    html = html.replace(/(<head[^>]*>)/i, `$1\n${canonicalTag}`);
  }

  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(">)/,
      `$1${esc(desc)}$2`
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(">)/,
      `$1${esc(title)}$2`
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*(">)/,
      `$1${esc(desc)}$2`
    )
    .replace(
      /(<meta property="og:image" content=")[^"]*(">)/,
      `$1${esc(img)}$2`
    )
    // og:url = den KANONISKE URL-en, ikke ?lib=-duplikatet. Delefunksjonen
    // virker like godt (quiz-siden har egne OG-tagger), og vi slutter å fortelle
    // Google at duplikatet er sin egen kanoniske adresse.
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${esc(canonicalUrl)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(">)/, `$1article$2`)
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(">)/,
      `$1${esc(title)}$2`
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(">)/,
      `$1${esc(desc)}$2`
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]*(">)/,
      `$1${esc(img)}$2`
    );

  const headers = new Headers(response.headers);
  headers.delete("content-length"); // lengden endret seg
  return new Response(html, { status: response.status, headers });
};

// Kjør bare på generator-siden (der delte ?lib-lenker lander).
export const config = { path: ["/lag-quiz.html", "/lag-quiz"] };
