// CustomQuiz — dynamisk OG/preview for delte dagens-resultater.
// ---------------------------------------------------------------
// Problem: dagens.html er én statisk fil med generiske Open Graph-tagger.
// Når noen deler resultatet sitt (/dagens?s=7&n=10&d=2026-07-15), kjører ikke
// iMessage/Facebook/Slack JavaScript — de leser bare rå-HTML — så previewen
// ville vist standardteksten i stedet for scoren.
//
// Fiks (samme mønster som og-quiz.js): denne edge-funksjonen kjører
// server-side FØR svaret når scraperen, og bytter ut tittel/beskrivelse i
// HTML-en basert på query-parameterne.
//
// Personvern: URL-en bærer KUN score (s), antall spørsmål (n) og quizdato (d).
// Ingen navn, e-post, bruker-id eller annen identifiserende info — og alt
// valideres strengt som tall/ISO-dato før det brukes. Ugyldige/manglende
// parametre → uendret generisk preview (siden ryker aldri).

const MND = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async (request, context) => {
  const url = new URL(request.url);
  const s = parseInt(url.searchParams.get("s"), 10);
  const n = parseInt(url.searchParams.get("n"), 10);
  const d = url.searchParams.get("d") || "";

  // Hent det opprinnelige (statiske) svaret først.
  const response = await context.next();

  // Bare rør ved svaret når det finnes gyldige score-params OG det er HTML.
  // Streng validering: heltall, 1 ≤ n ≤ 50, 0 ≤ s ≤ n.
  if (!Number.isInteger(s) || !Number.isInteger(n)) return response;
  if (n < 1 || n > 50 || s < 0 || s > n) return response;
  const ctype = response.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return response;

  // Dato (valgfri): kun ISO ÅÅÅÅ-MM-DD slippes gjennom, formateres på norsk.
  let dateLabel = "";
  let dOk = false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (m) {
    const day = +m[3], mon = +m[2];
    if (mon >= 1 && mon <= 12 && day >= 1 && day <= 31) {
      dateLabel = day + ". " + MND[mon - 1] + " " + m[1];
      dOk = true;
    }
  }

  const title = `Jeg fikk ${s}/${n} på dagens quiz — klarer du bedre?`;
  const desc = dateLabel
    ? `Dagens quiz ${dateLabel} på CustomQuiz — én ny fellesquiz hver dag. Spill og se om du slår ${s}/${n}.`
    : `Dagens quiz på CustomQuiz — én ny fellesquiz hver dag. Spill og se om du slår ${s}/${n}.`;

  // og:url = den delte lenken (kun de validerte parameterne, aldri rå input).
  const pageUrl =
    `${url.origin}/dagens?s=${s}&n=${n}` + (dOk ? `&d=${d}` : "");

  let html = await response.text();
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)} — CustomQuiz</title>`)
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
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${esc(pageUrl)}$2`)
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(">)/,
      `$1${esc(title)}$2`
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(">)/,
      `$1${esc(desc)}$2`
    );
  // og:image beholdes som standard (IMG/dagens-share.jpg) — bildet er felles,
  // det er tittel/beskrivelse som bærer scoren.

  const headers = new Headers(response.headers);
  headers.delete("content-length"); // lengden endret seg
  return new Response(html, { status: response.status, headers });
};

// Kjør på dagens-siden (både pen og full URL). Registreres via denne inline
// config-en — netlify.toml trenger IKKE endres (samme som og-quiz.js).
export const config = { path: ["/dagens", "/dagens.html"] };
