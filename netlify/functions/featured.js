/**
 * CustomQuiz — forsidas dynamiske utvalg (offentlig).
 * ---------------------------------------------------
 * GET /api/featured
 * Returnerer tre grupper lette metadata-rader (uten questions):
 *   pinned    — beste (mest spilte) i mix/sport/fotball. Alltid med, i den rekka.
 *   rotating  — én quiz fra hver av et utvalg ANDRE kategorier, valgt med
 *               DAGSFRØ (samme utvalg hele dagen → cachebart; varierer dag til dag).
 *   community — de nyeste «laget av fellesskapet» (source='user').
 *
 * Sortering/pinning bruker KUN plays — aldri rating (rating er en død default
 * uten ekte vurderingssystem). Se BASEN-vekst-og-moderering-spec.md.
 */
const { CORS_HEADERS } = require("./_quizcore");
const library = require("./_library");

const PINNED_CATS = ["mix", "sport", "fotball"];
const ROTATING_POOL = ["historie", "verdenshistorie", "vitenskap", "geografi", "litteratur", "kunst", "film", "musikk", "filosofi", "teknologi"];
const ROTATING_COUNT = 2;
const COMMUNITY_COUNT = 3;

const SELECT = "slug, title, lede, difficulty, category, category_label, team, hero_img, num_questions, plays, source, created_at";

// Deterministisk PRNG (mulberry32) seedet på dato → stabil rotasjon per dag.
function seededRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function daySeed() {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const lean = (r) => ({
  slug: r.slug, title: r.title, lede: r.lede, difficulty: r.difficulty,
  category: r.category, category_label: r.category_label, team: r.team,
  hero_img: r.hero_img, num_questions: r.num_questions, plays: r.plays, source: r.source,
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };

  const empty = { pinned: [], rotating: [], community: [] };
  const client = library.db();
  if (!client)
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(empty) };

  try {
    // Pool: mest spilte publiserte quizer (for pinnet + roterende).
    const { data: pool, error: e1 } = await client
      .from(library.TABLE)
      .select(SELECT)
      .eq("published", true)
      .eq("review_status", "auto_ok")
      .order("plays", { ascending: false })
      .limit(400);
    if (e1) throw new Error(e1.message);
    const rows = pool || [];

    const used = new Set();
    // rows er allerede sortert på plays desc, så [0]=mest spilt, [1]=nest mest spilt.
    const inCat = (cat) => rows.filter((r) => r.category === cat && !used.has(r.slug));

    // Dagsfrø: stabil per dag (cachebart), varierer dag til dag.
    const rng = seededRng(daySeed());

    // Pinnet: per kategori, velg dagsfrø-tilfeldig mellom mest spilt og nest mest
    // spilt — bryter plays-tregheten uten å miste «dette er de beste»-følelsen.
    const pinned = [];
    for (const cat of PINNED_CATS) {
      const top = inCat(cat).slice(0, 2);
      if (!top.length) continue;
      const r = (top.length > 1 && rng() < 0.5) ? top[1] : top[0];
      pinned.push(lean(r)); used.add(r.slug);
    }

    // Roterende: dagsfrø velger hvilke andre kategorier, beste-spilte i hver.
    const rotating = [];
    for (const cat of shuffle(ROTATING_POOL, rng)) {
      if (rotating.length >= ROTATING_COUNT) break;
      const r = inCat(cat)[0];
      if (r) { rotating.push(lean(r)); used.add(r.slug); }
    }

    // Fellesskap: nyeste source='user' (egen spørring — ferske har ofte 0 plays).
    const { data: comm, error: e2 } = await client
      .from(library.TABLE)
      .select(SELECT)
      .eq("published", true)
      .eq("review_status", "auto_ok")
      .eq("source", "user")
      .order("created_at", { ascending: false })
      .limit(COMMUNITY_COUNT);
    if (e2) throw new Error(e2.message);
    const community = (comm || []).map(lean);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ pinned, rotating, community }),
    };
  } catch (e) {
    // Forsida har statisk fallback — aldri la dette knekke siden.
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ...empty, error: e.message }) };
  }
};
