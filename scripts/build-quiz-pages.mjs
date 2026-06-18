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
const SITEMAP = path.join(ROOT, "sitemap.xml");

const SITE = "https://customquiz.no";
const TODAY = new Date().toISOString().slice(0, 10);

// Samme kategori→bilde-kart som resten av kodebasen (sync-library / _library).
const CATEGORY_TO_IMG = {
  mix: "kategori-mix", historie: "kategori-norsk-historie", verdenshistorie: "kategori-verdenshistorie",
  vitenskap: "kategori-naturvitenskap", geografi: "kategori-geografi", litteratur: "kategori-litteratur",
  kunst: "kategori-kunst", film: "kategori-film", musikk: "kategori-musikk", sport: "kategori-sport",
  fotball: "kategori-sport", filosofi: "kategori-filosofi", teknologi: "kategori-teknologi",
};

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
  filosofi: "Filosofi", teknologi: "Teknologi",
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
  const playUrl = `/quiz-app-v2.html?lib=${encodeURIComponent(slug)}`;
  const catLabel = q.category_label || CAT_LABEL[q.category] || "Allmennkunnskap";
  const diffLabel = DIFF_LABEL[q.difficulty] || "Middels";
  const n = q.questions.length;
  const canonical = `${SITE}/quiz/${slug}/`;
  const ogImg = ogImageFor(q);

  const title = `${q.title} — quiz med ${n} spørsmål | CustomQuiz`;
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
      const correct = opts[it.correct];
      const part = {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: it.q,
      };
      if (correct != null) {
        part.acceptedAnswer = { "@type": "Answer", text: String(correct) };
        if (opts.length > 1) {
          part.suggestedAnswer = opts
            .filter((o) => o !== correct)
            .map((o) => ({ "@type": "Answer", text: String(o) }));
        }
      }
      return part;
    }),
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

  const fasitHtml = q.questions.map((it, i) => {
    const opts = Array.isArray(it.options) ? it.options : [];
    const correct = opts[it.correct] != null ? opts[it.correct] : "";
    const expl = it.explanation ? ` — ${esc(it.explanation)}` : "";
    return `<li><strong>${i + 1}.</strong> ${esc(correct)}${expl}</li>`;
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
  details{background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:8px 20px;margin-top:8px;}
  details summary{cursor:pointer;font-weight:600;padding:10px 0;}
  details ol, details ul{padding-left:20px;}
  details li{margin:6px 0;}
  footer{margin-top:48px;padding-top:24px;border-top:1px solid var(--line);font-size:14px;color:var(--muted);}
  footer a{text-decoration:none;}
</style>
</head>
<body>
<main class="wrap">
  <nav class="crumbs"><a href="/">CustomQuiz</a> › <a href="/arkiv.html">Arkiv</a> › ${esc(catLabel)}: ${esc(q.title)}</nav>

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

  <details>
    <summary>Vis fasit med forklaringer</summary>
    <ol>
${fasitHtml}
    </ol>
  </details>

  <footer>
    <p>Vil du ha flere? Spill <a href="/dagens.html">dagens quiz</a>, utforsk <a href="/arkiv.html">hele arkivet</a>, eller <a href="/quiz-app-v2.html">lag din egen quiz</a> på CustomQuiz — gratis quizer på norsk.</p>
  </footer>
</main>
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
function writeSitemap(slugs) {
  const core = [
    { loc: `${SITE}/`, freq: "daily", pri: "1.0" },
    { loc: `${SITE}/dagens.html`, freq: "daily", pri: "0.9" },
    { loc: `${SITE}/vm.html`, freq: "daily", pri: "0.9" },
    { loc: `${SITE}/arkiv.html`, freq: "daily", pri: "0.8" },
    { loc: `${SITE}/quiz-app-v2.html`, freq: "weekly", pri: "0.6" },
  ];
  const urls = core.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  );
  for (const slug of slugs) {
    urls.push(
      `  <url>\n    <loc>${SITE}/quiz/${encodeURI(slug)}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    );
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(SITEMAP, xml, "utf8");
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

  writeSitemap(slugs);
  console.log(`build-quiz-pages: skrev ${written} quiz-sider (kilde: ${kilde}) + sitemap.xml med ${slugs.length + 5} URL-er.`);
}

main().catch((e) => {
  console.warn("build-quiz-pages: uventet feil — ikke-blokkerende:", e.message);
  process.exit(0);
});
