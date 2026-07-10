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

  // og:url = den delte siden (fungerer for både arkiv- og custom-quizer).
  const pageUrl = `${url.origin}${url.pathname}?lib=${encodeURIComponent(slug)}`;
  const fullTitle = `${title} — quiz | CustomQuiz`;

  let html = await response.text();
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
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${esc(pageUrl)}$2`)
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
