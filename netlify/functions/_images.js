/**
 * CustomQuiz — delt bilde-modul (quiz-covers).
 * --------------------------------------------
 * Genererer ÉN cover-illustrasjon i CustomQuiz' faste brand-stil (cream paper,
 * deep-teal #0A6E5A line-only woodcut + kategori-spot-flate) via OpenAI sitt
 * images-API, og laster den opp til Supabase Storage-bøtta 'quiz-covers'.
 * Returnerer en offentlig URL som kan settes som hero_img på quiz-raden.
 *
 * Bare MOTIVET varierer fra quiz til quiz — stilen er låst, så hele arkivet
 * henger visuelt sammen. Motivet er ANTYDENDE/dekorativt og avslører aldri
 * et svar (ingen tekst, ingen fasit i bildet).
 *
 * Env:
 *   OPENAI_API_KEY            (påkrevd)
 *   OPENAI_IMAGE_MODEL        (valgfri, default "gpt-image-1")
 *   OPENAI_IMAGE_QUALITY      (valgfri: low|medium|high, default "medium")
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY   (for opplasting til Storage)
 */
const { supa } = require("./_supabase");

const BUCKET = "quiz-covers";

// Spot-paletten — speiler master-prompten (chatgpt-master-prompt-kategoribilder.md).
const SPOT = {
  teal:       "#0A6E5A",
  moss:       "#5C7A3C",
  cobalt:     "#2C4A8F",
  terracotta: "#B05238",
  plum:       "#6B3050",
  saffron:    "#C68A2E",
  oker:       "#9A5B26",
};

// Kategori → spot-fargenavn. MÅ matche CATEGORY_TO_SPOT i arkiv.html.
const CATEGORY_TO_SPOT = {
  mix: "teal",
  custom: "teal",
  geografi: "moss",
  vitenskap: "cobalt",
  naturvitenskap: "cobalt",
  teknologi: "cobalt",
  historie: "terracotta",
  "norsk-historie": "terracotta",
  verdenshistorie: "terracotta",
  film: "terracotta",
  filosofi: "plum",
  litteratur: "plum",
  sport: "saffron",
  kunst: "saffron",
  musikk: "saffron",
  fotball: "saffron",
  dyr: "oker",
};

function spotHexFor(category) {
  const name = CATEGORY_TO_SPOT[category] || "teal";
  return { name, hex: SPOT[name] };
}

// Rydder tittel/lede: fjern HTML-tags og entiteter, normaliser whitespace.
function plain(t) {
  return String(t || "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Trygg filsti for Storage (slug kan inneholde '+' fra fler-tema-quizer).
function safeKey(slug) {
  return String(slug || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Bygger brand-stil prompt for ett quiz-cover. Stilen MATCHER de eksisterende
 * kategori-illustrasjonene på siden (f.eks. IMG/kategori-sport.jpg): et
 * vintage kobberstikk/etsning i ÉN monokrom dyp tealgrønn på cream-papir, med
 * fin kryss-hatching som skyggelegging og en lett hatchet slagskygge. Kun
 * MOTIVET varierer med temaet; selve stilen er låst, så hele arkivet henger
 * visuelt sammen med resten av siden (ikke VM-modulen).
 */
function coverPrompt({ title, categoryLabel, category, lede }) {
  const t = plain(title);
  const sub = plain(lede);
  const topic = [t, categoryLabel || category, sub].filter(Boolean).join(" — ");
  return [
    `A single vintage engraving illustration for a Norwegian quiz titled "${t}" (category: ${categoryLabel || category}).`,
    ``,
    `VISUAL STYLE — fixed, match exactly, do not deviate:`,
    `- Square 1024x1024. Warm cream paper background (#F5EEDD) with subtle paper grain and lots of empty space around the subject.`,
    `- ONE single subject, centered, occupying ~55-60% of the frame.`,
    `- Rendered as a classic vintage engraving / etching / copperplate illustration, like a 19th-century encyclopedia plate or banknote engraving.`,
    `- Drawn entirely in ONE monochrome deep teal-green ink (#0A6E5A) on the cream paper — no other colours.`,
    `- Use fine cross-hatching and line-hatching to build tonal shading and volume; confident, detailed linework. Add a subtle hatched cast shadow directly beneath the subject.`,
    `- NO flat colour fills, NO spot-colour shapes or blobs, NO gradients, NO soft/blurred drop shadows, NO photographic rendering, and NO text, letters, numbers or logos anywhere.`,
    `- Mood: refined, timeless, classic vintage engraving. It must read clearly even at 80x80 pixels.`,
    ``,
    `SUBJECT: choose ONE simple, iconic object that represents the theme "${topic}" at a glance — symbolic and recognisable, like a single well-chosen prop. Never depict a specific quiz answer, no maps full of labels, no readable text.`,
  ].join("\n");
}

// Kaller OpenAI images-API. gpt-image-modellene returnerer alltid b64_json.
async function generateImageB64(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Mangler OPENAI_API_KEY");
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const quality = process.env.OPENAI_IMAGE_QUALITY || "medium";

  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1, quality }),
  });

  let data;
  try { data = await r.json(); } catch { data = {}; }
  if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data).slice(0, 300);
    throw new Error(`OpenAI ${r.status}: ${msg}`);
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI: mangler b64_json i svar");
  return b64;
}

// Idempotent: opprett offentlig bøtte hvis den ikke finnes.
async function ensureBucket(db) {
  try {
    const { data: list } = await db.storage.listBuckets();
    if (list && list.some((b) => b.name === BUCKET || b.id === BUCKET)) return;
  } catch (_) { /* prøv å opprette uansett */ }
  const { error } = await db.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "8MB",
    allowedMimeTypes: ["image/png"],
  });
  // "already exists" er ikke en feil for oss.
  if (error && !/exist/i.test(error.message)) throw new Error("createBucket: " + error.message);
}

// Last opp PNG og returner offentlig URL.
async function uploadCover(slug, b64) {
  const db = supa();
  await ensureBucket(db);
  const key = `${safeKey(slug)}.png`;
  const buf = Buffer.from(b64, "base64");
  const { error } = await db.storage.from(BUCKET).upload(key, buf, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error("Storage upload: " + error.message);
  const { data } = db.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// Full pipeline: prompt → generer → last opp → public URL.
async function makeCover({ slug, title, category, categoryLabel, lede }) {
  const prompt = coverPrompt({ title, category, categoryLabel, lede });
  const b64 = await generateImageB64(prompt);
  const url = await uploadCover(slug, b64);
  return { url, prompt };
}

// Offentlig URL for et cover (uten å sjekke at fila finnes).
function publicUrlFor(slug) {
  const db = supa();
  const { data } = db.storage.from(BUCKET).getPublicUrl(`${safeKey(slug)}.png`);
  return data.publicUrl;
}

// Finnes cover-fila allerede i Storage? Brukes til gratis re-linking (slipper
// å betale for å regenerere bilder vi allerede har laget).
async function coverExists(slug) {
  const db = supa();
  const key = safeKey(slug);
  try {
    const { data, error } = await db.storage.from(BUCKET).list("", { limit: 200, search: key });
    if (error) return false;
    return (data || []).some((o) => o.name === `${key}.png`);
  } catch (_) {
    return false;
  }
}

module.exports = {
  BUCKET, SPOT, CATEGORY_TO_SPOT,
  spotHexFor, coverPrompt, generateImageB64, uploadCover, makeCover, safeKey,
  publicUrlFor, coverExists,
};
