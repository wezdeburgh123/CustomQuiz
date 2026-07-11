#!/usr/bin/env node
/**
 * CustomQuiz — build-tid statiske quiz-sider + sitemap (SEO).
 * -----------------------------------------------------------
 * Lager én crawlbar side per arkiv-quiz på /quiz/<slug>/index.html med ekte
 * tittel, meta, Open Graph, JSON-LD (schema.org Quiz) og synlige spørsmål — så
 * Google kan indeksere hele arkivet. Regenererer også sitemap.xml med alle
 * sidene. Kjøres ETTER scripts/sync-library.mjs i Netlify-build-kommandoen.
 *
 * Datakilde (i prioritert rekkefølge):
 *   1. Supabase quiz_library (published=true, review_status=auto_ok) — brukes på
 *      Netlify der SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY finnes. Dekker både
 *      kuraterte OG bruker-genererte quizer.
 *   2. quiz-library/library.ndjson (fallback uten DB — f.eks. lokal test).
 *
 * Sikkerhet: skriptet er IKKE-BLOKKERENDE. Ved enhver feil logges en advarsel og
 * exit(0), så en SEO-glipp aldri velter selve site-deployen. Build-kommandoen
 * har dessuten `|| echo` som ekstra sikkerhetsnett.
 *
 * Genererte filer (quiz/) er rene build-artefakter og skal IKKE committes
 * (se .gitignore). Netlify lager dem på nytt ved hver deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const NDJSON = path.join(ROOT, "quiz-library", "library.ndjson");
const OUT_DIR = path.join(ROOT, "quiz");
const OUT_TEMA = path.join(ROOT, "tema");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const ARKIV = path.join(ROOT, "arkiv.html");

const SITE = "https://customquiz.no";
const TODAY = new Date().toISOString().slice(0, 10);

// Samme kategori→bilde-kart som resten av kodebasen (sync-library / _library).
const CATEGORY_TO_IMG = {
  mix: "kategori-mix", historie: "kategori-norsk-historie", verdenshistorie: "kategori-verdenshistorie",
  vitenskap: "kategori-naturvitenskap", geografi: "kategori-geografi", litteratur: "kategori-litteratur",
  kunst: "kategori-kunst", film: "kategori-film", musikk: "kategori-musikk", sport: "kategori-sport",
  fotball: "kategori-sport", filosofi: "kategori-filosofi", teknologi: "kategori-teknologi",
  dyr: "kategori-mix", spill: "kategori-mix", monstere: "kategori-mix",
};

// Visningsnavn på tema-landingssidene (speiler arkivets FILTER_LABELS).
const THEME_PAGE_LABEL = {
  mix: "Allmennkunnskap", historie: "Norsk historie", verdenshistorie: "Verdenshistorie",
  vitenskap: "Naturvitenskap", geografi: "Geografi", litteratur: "Litteratur", kunst: "Kunst",
  film: "Film og TV", musikk: "Musikk", sport: "Sport", fotball: "Fotball",
  filosofi: "Filosofi", teknologi: "Teknologi", dyr: "Dyr", spill: "Spill", monstere: "Monstere",
};

// Kategori → spot-farge (speiler arkiv.html CATEGORY_TO_SPOT).
const CATEGORY_TO_SPOT = {
  mix: "teal", geografi: "moss", vitenskap: "cobalt", teknologi: "cobalt",
  historie: "terracotta", verdenshistorie: "terracotta", film: "terracotta",
  litteratur: "plum", filosofi: "plum", musikk: "saffron", kunst: "saffron",
  sport: "saffron", fotball: "moss", dyr: "oker", spill: "spill", monstere: "monstere",
};
// Klubblag → crest, og hvilke crests som faktisk finnes (speiler arkiv.html).
const TEAM_TO_CREST = {
  "Arsenal": "crest-arsenal", "Chelsea": "crest-chelsea", "Everton": "crest-everton",
  "Leeds United": "crest-leeds", "Liverpool": "crest-liverpool", "Manchester City": "crest-man-city",
  "Manchester United": "crest-man-united", "Newcastle United": "crest-newcastle", "Tottenham": "crest-tottenham",
  "Bodø/Glimt": "crest-bodo-glimt", "Brann": "crest-brann", "Lillestrøm": "crest-lillestrom",
  "Molde": "crest-molde", "Rosenborg": "crest-rosenborg", "Viking": "crest-viking", "Vålerenga": "crest-valerenga",
};
const AVAILABLE_CRESTS = new Set([
  "crest-arsenal", "crest-chelsea", "crest-everton", "crest-leeds", "crest-liverpool",
  "crest-man-city", "crest-man-united", "crest-newcastle", "crest-tottenham",
  "crest-bodo-glimt", "crest-brann", "crest-lillestrom", "crest-molde", "crest-rosenborg", "crest-viking", "crest-valerenga",
]);
function crestForBuild(team) {
  const slug = TEAM_TO_CREST[String(team || "").trim()];
  return (slug && AVAILABLE_CRESTS.has(slug)) ? slug : null;
}

// Slug-utleder (speiler sync-library.mjs) for ndjson-records uten ferdig slug.
const TRANSLIT = { "æ": "ae", "ø": "o", "å": "a" };
const normToken = (s) =>
  String(s || "").trim().toLowerCase()
    .replace(/[æøå]/g, (c) => TRANSLIT[c] || c)
    .replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const makeSlug = (themes, difficulty) =>
  (Array.isArray(themes) ? themes : [themes]).map(normToken).filter(Boolean).sort().join("+") +
  "__" + normToken(difficulty || "medium");

// ---------- HTML-hjelpere ----------
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
// For tekst inne i et JSON-LD <script>: unngå at innholdet bryter ut av taggen.
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

const CAT_LABEL = {
  mix: "Allmennkunnskap", historie: "Historie", verdenshistorie: "Verdenshistorie",
  vitenskap: "Vitenskap", geografi: "Geografi", litteratur: "Litteratur", kunst: "Kunst",
  film: "Film", musikk: "Musikk", sport: "Sport", fotball: "Fotball",
  filosofi: "Filosofi", teknologi: "Teknologi", dyr: "Dyr", spill: "Spill", monstere: "Monstere",
};
const DIFF_LABEL = { lett: "Lett", medium: "Middels", vanskelig: "Vanskelig" };

function ogImageFor(q) {
  const hero = q.hero_img;
  if (hero && /^https?:\/\//i.test(hero)) return hero;            // AI-cover (full URL)
  const key = CATEGORY_TO_IMG[q.category] || CATEGORY_TO_IMG.mix; // kategori-bilde
  return `${SITE}/IMG/${key}.jpg`;
}

function pageHtml(q) {
  const slug = q.slug;
  const playUrl = `/lag-quiz.html?lib=${encodeURIComponent(slug)}`;
  const catLabel = q.category_label || CAT_LABEL[q.category] || "Allmennkunnskap";
  const diffLabel = DIFF_LABEL[q.difficulty] || "Middels";
  const n = q.questions.length;
  const canonical = `${SITE}/quiz/${slug}/`;
  const ogImg = ogImageFor(q);

  // CTR/SEO: Google kutter <title> ved ~60 tegn. Behold mest mulig informasjon
  // uten å fortynne det keyword-rike temanavnet (som alltid står først). Faller
  // gradvis tilbake til kortere varianter når temanavnet er langt.
  const tTitle1 = `${q.title} — quiz med ${n} spørsmål | CustomQuiz`;
  const tTitle2 = `${q.title} — quiz med ${n} spørsmål`;
  const tTitle3 = `${q.title} — quiz`;
  const title = tTitle1.length <= 60 ? tTitle1 : (tTitle2.length <= 60 ? tTitle2 : tTitle3);
  const lede = q.lede && q.lede.trim()
    ? q.lede.trim()
    : `Test kunnskapen din i denne ${catLabel.toLowerCase()}-quizen med ${n} spørsmål på norsk.`;
  const metaDesc = lede.length > 155 ? lede.slice(0, 152).trim() + "…" : lede;

  // JSON-LD: schema.org Quiz med spørsmål + fasit.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: q.title,
    description: lede,
    url: canonical,
    inLanguage: "nb-NO",
    educationalLevel: diffLabel,
    about: { "@type": "Thing", name: catLabel },
    hasPart: q.questions.slice(0, 50).map((it) => {
      const opts = Array.isArray(it.options) ? it.options : [];
      const part = {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: it.q,
      };
      // Fasit holdes BEVISST ute av server-HTML/JSON-LD (produktbeskyttelse mot
      // skraping/spoiling). Den lastes klientside ved klikk via /api/library-get.
      // Alternativene listes som suggestedAnswer uten å røpe hvilket som er riktig.
      // (Vurderte acceptedAnswer for Googles «Practice problems»-rike-resultat,
      // men Google faser ut den strukturdata-typen — så ingen grunn til å
      // eksponere fasiten. Reversert 10.7.26.)
      if (opts.length) {
        part.suggestedAnswer = opts.map((o) => ({ "@type": "Answer", text: String(o) }));
      }
      return part;
    }),
  };

  // BreadcrumbList (schema.org) — speiler den synlige stien og gir Google
  // rike breadcrumbs. Nivåer: Hjem › Arkiv › <Tema> › <Denne quizen>.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "CustomQuiz", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Arkiv", item: `${SITE}/arkiv` },
      { "@type": "ListItem", position: 3, name: catLabel, item: `${SITE}/tema/${encodeURI(q.category || "mix")}/` },
      { "@type": "ListItem", position: 4, name: q.title, item: canonical },
    ],
  };

  // Synlige spørsmål (crawlbar tekst) + fasit i en sammenleggbar <details>.
  const questionsHtml = q.questions.map((it, i) => {
    const opts = Array.isArray(it.options) ? it.options : [];
    const optsHtml = opts.map((o) => `<li>${esc(o)}</li>`).join("");
    return `<li class="q">
        <p class="q-text">${esc(it.q)}</p>
        <ul class="q-opts">${optsHtml}</ul>
      </li>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#F5F0E6">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/jpeg" href="/IMG/signature.jpg">

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(q.title)} — quiz med ${n} spørsmål">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="nb_NO">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(q.title)} — quiz med ${n} spørsmål">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${esc(ogImg)}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">

<script type="application/ld+json">${jsonLdSafe(ld)}</script>
<script type="application/ld+json">${jsonLdSafe(breadcrumbLd)}</script>

<style>
  :root{--bg:#F5F0E6;--bg-soft:#FBF7EE;--ink:#1F1A14;--muted:#6B6256;--teal:#0A6E5A;--line:#E3D9C4;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,sans-serif;line-height:1.6;}
  .wrap{max-width:760px;margin:0 auto;padding:32px 20px 64px;}
  a{color:var(--teal);}
  .crumbs{font-size:14px;color:var(--muted);margin-bottom:24px;}
  .crumbs a{text-decoration:none;}
  h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(28px,5vw,40px);line-height:1.15;margin:0 0 12px;}
  .lede{font-size:18px;color:var(--muted);margin:0 0 20px;}
  .meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;}
  .tag{background:var(--bg-soft);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:13px;color:var(--muted);}
  .cta{display:inline-block;background:var(--teal);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:12px;font-size:17px;margin-bottom:40px;}
  .cta:hover{filter:brightness(1.08);}
  h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px;margin:40px 0 16px;}
  ol.qs{list-style:none;counter-reset:q;padding:0;margin:0;}
  ol.qs > li.q{counter-increment:q;background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-bottom:14px;}
  .q-text{font-weight:600;margin:0 0 10px;}
  .q-text::before{content:counter(q) ". ";color:var(--teal);}
  ul.q-opts{margin:0;padding-left:20px;color:var(--muted);}
  ul.q-opts li{margin:2px 0;}
  .fasit-wrap{margin-top:8px;}
  .fasit-btn{background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:14px 20px;font:inherit;font-weight:600;color:var(--ink);cursor:pointer;width:100%;text-align:left;}
  .fasit-btn:hover{border-color:var(--teal);}
  .fasit-btn[disabled]{opacity:.7;cursor:default;}
  .fasit-list{background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:16px 20px 16px 40px;margin-top:8px;}
  .fasit-list li{margin:6px 0;}
  footer{margin-top:48px;padding-top:24px;border-top:1px solid var(--line);font-size:14px;color:var(--muted);}
  footer a{text-decoration:none;}
</style>
</head>
<body>
<main class="wrap">
  <nav class="crumbs"><a href="/">CustomQuiz</a> › <a href="/arkiv">Arkiv</a> › <a href="/tema/${esc(encodeURI(q.category || "mix"))}/">${esc(catLabel)}</a> › ${esc(q.title)}</nav>

  <h1>${esc(q.title)}</h1>
  <p class="lede">${esc(lede)}</p>
  <div class="meta">
    <span class="tag">${esc(catLabel)}</span>
    <span class="tag">${esc(diffLabel)}</span>
    <span class="tag">${n} spørsmål</span>
  </div>

  <a class="cta" href="${esc(playUrl)}">▶ Spill quizen</a>

  <h2>Spørsmålene i denne quizen</h2>
  <ol class="qs">
${questionsHtml}
  </ol>

  <div class="fasit-wrap">
    <button id="show-fasit" class="fasit-btn" type="button">Vis fasit med forklaringer</button>
    <ol id="fasit-list" class="fasit-list" hidden></ol>
  </div>
  <script>
  (function(){
    var SLUG=${JSON.stringify(slug)};
    var btn=document.getElementById('show-fasit'),list=document.getElementById('fasit-list'),loaded=false;
    if(!btn)return;
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
    btn.addEventListener('click',async function(){
      if(loaded){var h=list.hidden;list.hidden=!h;btn.textContent=h?'Skjul fasit':'Vis fasit med forklaringer';return;}
      btn.disabled=true;btn.textContent='Henter fasit …';
      try{
        var r=await fetch('/api/library-get?slug='+encodeURIComponent(SLUG));
        if(!r.ok)throw new Error('http');
        var d=await r.json();
        list.innerHTML=(d.questions||[]).map(function(it,i){
          var opts=Array.isArray(it.options)?it.options:[];
          var correct=opts[it.correct]!=null?opts[it.correct]:'';
          var expl=it.explanation?' — '+esc(it.explanation):'';
          return '<li><strong>'+(i+1)+'.</strong> '+esc(correct)+expl+'</li>';
        }).join('');
        list.hidden=false;loaded=true;btn.disabled=false;btn.textContent='Skjul fasit';
      }catch(e){btn.disabled=false;btn.textContent='Kunne ikke hente fasit — prøv igjen';}
    });
  })();
  </script>

  <footer>
    <p>Vil du ha flere? Spill <a href="/dagens.html">dagens quiz</a>, utforsk <a href="/arkiv">hele arkivet</a>, eller <a href="/lag-quiz.html">lag din egen quiz</a> på CustomQuiz — gratis quizer på norsk.</p>
  </footer>
</main>
</body>
</html>
`;
}

// ---------- Tema-landingsside (SEO) ----------
// Én crawlbar side per arkivkategori på /tema/<kategori>/index.html — bygd som
// arkivets bildekort-grid (delt masthead via nav.js, samme .quiz-card-uttrykk,
// 3–4 i bredden) med unik tittel/meta/OG + JSON-LD ItemList. <base href="/">
// gjør at nav.js' relative lenker + IMG/ + script-stier løses fra roten.
function themeCard(q) {
  const crest = crestForBuild(q.team);
  const hero = (q.hero_img && /^https?:\/\//i.test(q.hero_img)) ? q.hero_img : null;
  // Dyr-/barneserien har lokale cover-filer navngitt etter slug (IMG/<slug>.jpg),
  // ikke http-hero_img. Onerror faller tilbake til kategoribildet om filen mangler.
  const slugCover = (["dyr", "spill", "monstere"].includes(q.category) && q.slug) ? `/IMG/${q.slug}.jpg` : null;
  const imgSrc = crest ? `/IMG/${crest}.jpg` : (hero || slugCover || `/IMG/${CATEGORY_TO_IMG[q.category] || "kategori-mix"}.jpg`);
  const fallback = `/IMG/${CATEGORY_TO_IMG[q.category] || "kategori-mix"}.jpg`;
  const spot = CATEGORY_TO_SPOT[q.category] || "teal";
  const spotAttr = crest ? "" : ` data-spot="${spot}"`;
  const num = q.team ? esc(q.team) : esc(THEME_PAGE_LABEL[q.category] || CAT_LABEL[q.category] || "");
  const diff = DIFF_LABEL[q.difficulty] || "Middels";
  const plays = (q.plays && q.plays > 0)
    ? `<span class="quiz-plays">${q.plays.toLocaleString("nb-NO").replace(",", " ")} spilt</span>` : "";
  const sub = q.lede && q.lede.trim() ? `<div class="quiz-sub">${esc(q.lede.trim())}</div>` : "";
  // SEO: kort peker på den crawlbare /quiz/<slug>/-siden (ikke spilleren), så
  // lenkegrafen fra tema-hubben når de indekserbare sidene. Spill-handlingen
  // ligger på quiz-siden ("▶ Spill quizen").
  return `<a class="quiz-card" href="/quiz/${encodeURI(q.slug)}/">
        <div class="quiz-image${crest ? " is-crest" : ""}"${spotAttr}>
          <img src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
        </div>
        <div class="quiz-body">
          <div class="quiz-num">${num}</div>
          <div class="quiz-title">${esc(q.title)}</div>
          ${sub}
          <div class="quiz-rating"><span>${diff}</span>${plays}</div>
        </div>
      </a>`;
}

function themePageHtml(cat, quizzes) {
  const label = THEME_PAGE_LABEL[cat] || CAT_LABEL[cat] || cat;
  const n = quizzes.length;
  const canonical = `${SITE}/tema/${cat}/`;
  const imgKey = CATEGORY_TO_IMG[cat] || CATEGORY_TO_IMG.mix;
  const ogImg = `${SITE}/IMG/${imgKey}.jpg`;
  const title = `${label} — ${n} quizer | CustomQuiz`;
  const metaDesc = `Utforsk ${n} ${label.toLowerCase()}-quizer på CustomQuiz. Test kunnskapen din med faktasjekkede spørsmål på norsk — gratis å spille.`;

  const sorted = quizzes.slice().sort((a, b) => (b.plays || 0) - (a.plays || 0));

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${label} — quizer`,
    url: canonical,
    numberOfItems: n,
    itemListElement: sorted.slice(0, 100).map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/quiz/${encodeURI(q.slug)}/`,
      name: q.title,
    })),
  };

  const cards = sorted.map(themeCard).join("\n");

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="UTF-8">
<base href="/">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#F5F0E6">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/jpeg" href="/IMG/signature.jpg">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(label)} — ${n} quizer">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="nb_NO">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(ogImg)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/layout.css">
<script src="/intro-state.js"></script>
<script src="/reveal.js"></script>
<script type="application/ld+json">${jsonLdSafe(ld)}</script>
<style>
  :root{
    --bg:#F5F0E6;--bg-soft:#FBF7EE;--bg-deep:#ECE3CE;--ink:#1F1A14;--ink-soft:#4B4338;--ink-mute:#7A6F5A;
    --rule:#E2D8C2;--rule-strong:#C9BD9F;--accent:#0A6E5A;--accent-soft:#C9E2D8;--accent-deep:#074538;
    --spot-teal:#0A6E5A;--spot-moss:#5C7A3C;--spot-cobalt:#2C4A8F;--spot-terracotta:#B05238;
    --spot-plum:#6B3050;--spot-saffron:#C68A2E;--spot-oker:#9A5B26;--spot-spill:#1F7A8A;--spot-monstere:#6F3F96;
    --r-pill:999px;--r-card:16px;
    --font-display:'Fraunces',Georgia,serif;--font-sans:'Manrope','Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:var(--bg);color:var(--ink);font-family:var(--font-sans);font-size:17px;line-height:1.55;min-height:100vh;-webkit-font-smoothing:antialiased;}
  body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle at 1px 1px,rgba(201,189,159,0.30) 1px,transparent 0);background-size:4px 4px;pointer-events:none;z-index:1;}
  /* Bredde/sentrering/sidepadding styres av layout.css (samme 1080-ramme som arkivet). */
  .container{position:relative;z-index:2;}
  [data-spot]{position:relative;}
  [data-spot]::before{content:"";position:absolute;inset:0;background:var(--spot,transparent);opacity:0.55;z-index:1;pointer-events:none;}
  [data-spot] > img{position:relative;z-index:2;mix-blend-mode:multiply;}
  [data-spot="teal"]{--spot:var(--spot-teal);}[data-spot="moss"]{--spot:var(--spot-moss);}
  [data-spot="cobalt"]{--spot:var(--spot-cobalt);}[data-spot="terracotta"]{--spot:var(--spot-terracotta);}
  [data-spot="plum"]{--spot:var(--spot-plum);}[data-spot="saffron"]{--spot:var(--spot-saffron);}[data-spot="oker"]{--spot:var(--spot-oker);}
  [data-spot="spill"]{--spot:var(--spot-spill);}[data-spot="monstere"]{--spot:var(--spot-monstere);}
  .crumbs{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:22px;}
  .crumbs a{color:var(--ink-mute);text-decoration:none;}
  .crumbs a:hover{color:var(--accent);}
  .page-header{margin:8px 0 36px;}
  .eyebrow{font-family:var(--font-mono);font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;}
  h1{font-family:var(--font-display);font-weight:500;font-size:clamp(38px,5.2vw,60px);line-height:1.0;letter-spacing:-0.025em;margin-bottom:18px;font-variation-settings:"opsz" 120;}
  h1 em{font-style:italic;color:var(--accent);}
  .page-lede{font-family:var(--font-display);font-size:20px;line-height:1.45;color:var(--ink-soft);max-width:560px;}
  .quiz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:56px;}
  .quiz-card{display:flex;flex-direction:column;background:var(--bg-soft);border:0.5px solid var(--rule);border-radius:var(--r-card);text-decoration:none;transition:border-color 200ms ease;position:relative;overflow:hidden;}
  .quiz-card:hover{border-color:var(--accent);}
  .quiz-card:hover .quiz-image img{transform:scale(1.025);}
  .quiz-image{aspect-ratio:5/3;background:var(--bg);overflow:hidden;border-bottom:0.5px solid var(--rule);position:relative;}
  .quiz-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 220ms ease;}
  .quiz-image.is-crest{background:#F5EEDC;}
  .quiz-image.is-crest img{object-fit:contain;mix-blend-mode:normal;padding:14px;}
  .quiz-body{padding:18px 20px 22px;display:flex;flex-direction:column;gap:8px;flex:1;}
  .quiz-num{font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-mute);}
  .quiz-title{font-family:var(--font-display);font-size:22px;font-weight:500;line-height:1.18;color:var(--ink);font-variation-settings:"opsz" 36;}
  .quiz-sub{font-family:var(--font-sans);font-size:13px;color:var(--ink-soft);line-height:1.45;margin-bottom:4px;}
  .quiz-rating{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid var(--rule);font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;color:var(--ink-mute);}
  .quiz-plays{font-variant-numeric:tabular-nums;}
  footer{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute);text-align:center;padding:8px 0 64px;}
  footer a{color:var(--ink-mute);text-decoration:none;}
  footer a:hover{color:var(--accent);}
</style>
</head>
<body>
<div class="container">
  <div id="cq-masthead"></div>
  <nav class="crumbs"><a href="/">CustomQuiz</a> › <a href="/arkiv">Arkivet</a> › ${esc(label)}</nav>
  <header class="page-header">
    <div class="eyebrow">Tema</div>
    <h1>${esc(label)}</h1>
    <p class="page-lede">${n} <em>quizer</em> i ${esc(label.toLowerCase())} — faktasjekket og gratis å spille.</p>
  </header>
  <section class="quiz-grid">
${cards}
  </section>
  <footer>
    <div><a href="/arkiv">← Tilbake til arkivet</a></div>
  </footer>
</div>
<script src="/supabase-config.js"></script>
<script src="/nav.js"></script>
<script src="/auth.js"></script>
</body>
</html>
`;
}

// ---------- Datakilder ----------
async function fromSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const out = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("quiz_library")
      .select("slug, title, lede, questions, difficulty, category, category_label, team, hero_img")
      .eq("published", true)
      .eq("review_status", "auto_ok")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || !data.length) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

function fromNdjson() {
  if (!fs.existsSync(NDJSON)) return [];
  const lines = fs.readFileSync(NDJSON, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const l of lines) {
    let d;
    try { d = JSON.parse(l); } catch { continue; }
    const themes = Array.isArray(d.themes) ? d.themes : (d.theme ? [d.theme] : []);
    if (!Array.isArray(d.questions) || !d.questions.length) continue;
    if (d.published === false) continue;
    const difficulty = ["lett", "medium", "vanskelig"].includes(d.difficulty) ? d.difficulty : "medium";
    out.push({
      slug: d.slug || makeSlug(themes, difficulty),
      title: d.title || (themes[0] || "Quiz"),
      lede: d.lede || "",
      questions: d.questions,
      difficulty,
      category: d.category || "mix",
      category_label: d.category_label || null,
      team: d.team || null,
      hero_img: d.hero_img || null,
    });
  }
  return out;
}

function isRenderable(q) {
  return q && typeof q.slug === "string" && q.slug
    && Array.isArray(q.questions) && q.questions.length
    && q.questions.every((it) => it && typeof it.q === "string" && Array.isArray(it.options) && it.options.length);
}

// ---------- Sitemap ----------
function writeSitemap(slugs, temaCats = []) {
  const core = [
    { loc: `${SITE}/`, freq: "daily", pri: "1.0" },
    { loc: `${SITE}/dagens.html`, freq: "daily", pri: "0.9" },
    { loc: `${SITE}/vm.html`, freq: "daily", pri: "0.9" },
    { loc: `${SITE}/arkiv.html`, freq: "daily", pri: "0.8" },
    { loc: `${SITE}/fotball`, freq: "weekly", pri: "0.7" },
    { loc: `${SITE}/lag-quiz.html`, freq: "weekly", pri: "0.6" },
  ];
  const urls = core.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  );
  // Tema-landingssider (/tema/<kategori>/).
  for (const cat of temaCats) {
    urls.push(
      `  <url>\n    <loc>${SITE}/tema/${encodeURI(cat)}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }
  for (const slug of slugs) {
    urls.push(
      `  <url>\n    <loc>${SITE}/quiz/${encodeURI(slug)}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    );
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(SITEMAP, xml, "utf8");
}

// ---------- Arkiv-SSR ----------
// arkiv.html er ellers 100% klient-rendret (grid fylles av JS). For at crawlere
// (og no-JS) skal se faktiske quiz-lenker injiseres en crawlbar liste inn i
// #quiz-grid mellom to markører. JS-en overskriver #quiz-grid ved lasting, så
// vanlige brukere får de interaktive kortene som før — dette er ren SEO-baseline.
// Idempotent: erstatter alltid mellom markørene.
function injectArkiv(quizzes) {
  if (!fs.existsSync(ARKIV)) return false;
  const START = "<!--SSR-ARKIV-START-->";
  const END = "<!--SSR-ARKIV-END-->";
  let html = fs.readFileSync(ARKIV, "utf8");
  if (!html.includes(START) || !html.includes(END)) return false;
  const sorted = quizzes.slice().sort((a, b) => (b.plays || 0) - (a.plays || 0));
  const links = sorted.map((q) => {
    const cat = CAT_LABEL[q.category] || "Allmennkunnskap";
    return `<a class="quiz-card" href="/quiz/${encodeURI(q.slug)}/"><div class="quiz-body">` +
      `<div class="quiz-num">${esc(cat)}</div>` +
      `<div class="quiz-title">${esc(q.title)}</div></div></a>`;
  }).join("\n");
  const re = new RegExp(START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  html = html.replace(re, `${START}\n${links}\n${END}`);
  fs.writeFileSync(ARKIV, html, "utf8");
  return true;
}

// ---------- Hovedløp ----------
async function main() {
  let rows = null;
  let kilde = "Supabase";
  try {
    rows = await fromSupabase();
  } catch (e) {
    console.warn("build-quiz-pages: Supabase-henting feilet (" + e.message + ") — faller tilbake til ndjson.");
    rows = null;
  }
  if (rows == null) { rows = fromNdjson(); kilde = "ndjson"; }

  const renderable = rows.filter(isRenderable);
  if (!renderable.length) {
    console.warn("build-quiz-pages: ingen quizer å generere (kilde: " + kilde + ") — hopper over.");
    return;
  }

  // Rens ut gammel quiz/ så slettede quizer ikke blir liggende igjen. Best-effort:
  // på Netlify er checkout fersk (ingenting å slette); enkelte filsystemer nekter
  // unlink — da overskriver vi bare filene under i stedet for å avbryte.
  try {
    if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn("build-quiz-pages: kunne ikke rense gammel quiz/ (" + e.message + ") — overskriver i stedet.");
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const slugs = [];
  let written = 0;
  for (const q of renderable) {
    try {
      const dir = path.join(OUT_DIR, q.slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), pageHtml(q), "utf8");
      slugs.push(q.slug);
      written++;
    } catch (e) {
      console.warn("build-quiz-pages: hoppet over '" + q.slug + "' (" + e.message + ")");
    }
  }

  // Tema-landingssider per kategori (SEO) — egen crawlbar side per tema.
  try {
    if (fs.existsSync(OUT_TEMA)) fs.rmSync(OUT_TEMA, { recursive: true, force: true });
  } catch (e) {
    console.warn("build-quiz-pages: kunne ikke rense gammel tema/ (" + e.message + ") — overskriver i stedet.");
  }
  fs.mkdirSync(OUT_TEMA, { recursive: true });

  const byCat = new Map();
  for (const q of renderable) {
    const cat = q.category || "mix";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(q);
  }
  const temaCats = [];
  for (const [cat, list] of byCat) {
    try {
      const dir = path.join(OUT_TEMA, cat);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), themePageHtml(cat, list), "utf8");
      temaCats.push(cat);
    } catch (e) {
      console.warn("build-quiz-pages: hoppet over tema '" + cat + "' (" + e.message + ")");
    }
  }

  // Injiser crawlbar quiz-liste i arkiv.html (SEO-baseline for /arkiv).
  let arkivOk = false;
  try {
    arkivOk = injectArkiv(renderable);
  } catch (e) {
    console.warn("build-quiz-pages: arkiv-injeksjon feilet (" + e.message + ") — ikke-blokkerende.");
  }

  writeSitemap(slugs, temaCats);
  console.log(`build-quiz-pages: skrev ${written} quiz-sider + ${temaCats.length} tema-sider${arkivOk ? " + arkiv-SSR" : ""} (kilde: ${kilde}) + sitemap.xml.`);
}

main().catch((e) => {
  console.warn("build-quiz-pages: uventet feil — ikke-blokkerende:", e.message);
  process.exit(0);
});
