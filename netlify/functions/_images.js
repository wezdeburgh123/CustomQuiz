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
 * Bygger brand-stil prompt for ett quiz-cover. Stilen er IDENTISK for alle
 * bilder; kun SUBJECT-linjen lar modellen velge et motiv som passer temaet.
 */
function coverPrompt({ title, categoryLabel, category, lede }) {
  const t = plain(title);
  const sub = plain(lede);
  const { hex } = spotHexFor(category);
  const topic = [t, categoryLabel || category, sub].filter(Boolean).join(" — ");
  return [
    `Editorial cover illustration for a Norwegian quiz titled "${t}" (category: ${categoryLabel || category}).`,
    ``,
    `VISUAL STYLE — fixed, do not deviate:`,
    `- Square 1024x1024. Background: warm cream paper #F5F0E6 with subtle paper grain.`,
    `- Two layers. Underneath: ONE soft hand-printed organic shape (irregular blob, ~40% of the frame) in the spot colour ${hex}, slightly off-register like a risograph print.`,
    `- On top: the subject in deep teal ink #0A6E5A — confident, varied line weight, woodcut-style imperfection, LINE ONLY.`,
    `- Absolutely NO cross-hatching, NO tonal/engraved shading, NO hatched fills, NO gradients, NO drop shadows, and NO text, letters, numbers or logos anywhere.`,
    `- Mood: Scandinavian editorial illustration, modern but quiet. NOT childish, NOT corporate, NOT vintage encyclopedia, NOT 19th-century.`,
    `- The subject occupies ~55% of the frame with generous whitespace and overlaps the spot shape. It must read clearly even at 80x80 pixels.`,
    ``,
    `SUBJECT: choose ONE simple, evocative object or motif that suggests the theme "${topic}" at a glance — symbolic and decorative. Never depict a specific quiz answer, no maps full of labels, no readable text.`,
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

module.exports = {
  BUCKET, SPOT, CATEGORY_TO_SPOT,
  spotHexFor, coverPrompt, generateImageB64, uploadCover, makeCover, safeKey,
};
