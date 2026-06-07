/**
 * CustomQuiz — moderering, lag 1: deterministisk ordliste-port.
 * -------------------------------------------------------------
 * screenThemes(themes) kjøres FØR generering (gratis, ingen API-kall). Treff →
 * vi kaller ikke modellen og lagrer ingenting. Bom → videre til generering, der
 * AI-sjekken (blocked-objekt i _quizcore.js) tar nyansene.
 *
 * VIKTIG DESIGNVALG: denne lista skal være SMAL og treffe EKSPLISITT ulovlig/
 * egregiøst innhold — ikke tema-ord. «Krig», «drap», «våpen», «narkotika» er
 * legitime quiz-tema (historie, museum, samfunn) og blokkeres IKKE her. Vi
 * blokkerer intensjon/oppskrifter og åpenbart krenkende innhold. Færre falske
 * positive er viktigere enn å fange alt — AI-sjekken er andre forsvarslinje.
 *
 * Returnerer { ok: true } eller { ok: false, category, reason }.
 */

// ── Normalisering: gjør omgåelse via mellomrom/diakritikk/leet vanskeligere ──
const TRANSLIT = { æ: "ae", ø: "o", å: "a", ä: "a", ö: "o", ü: "u", é: "e", è: "e" };
const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

// Tekst med ord-mellomrom OG sifre bevart (for frase-treff + aldersdeteksjon).
// Vi leet-mapper IKKE her — sifre må overleve så «12 år» kan fanges som
// mindreårig-signal. Leet-varianten lages separat under (normalizeTight).
function normalizeSpaced(s) {
  s = String(s || "").toLowerCase();
  s = s.replace(/[æøåäöüéè]/g, (c) => TRANSLIT[c] || c);
  s = s.replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
  return s;
}
// Tekst uten skilletegn/sifre, med leet→bokstav (fanger «s-e-x», «s3x», «b o m b e»).
function normalizeTight(spaced) {
  return spaced.replace(/[0-9@$]/g, (c) => LEET[c] || "").replace(/\s+/g, "");
}

// Aldersmarkør under 18 (sterkt mindreårig-signal): «12 ar», «15-aring», «14yo».
// Kjøres på normalizeSpaced (sifre bevart). Aldre 0–17 + år/aring/yo/years.
const AGE_MINOR_RE = /\b(?:[0-9]|1[0-7])\s*-?\s*(?:ar|aar|aring|arig|yo|years?|yr)\b/;

// ── Lister ──────────────────────────────────────────────────────────────────
// Enkeltord/slurs som er klart krenkende uansett kontekst (treff på tett tekst).
// Bevisst kort; utvid varsomt basert på faktiske forsøk i loggen.
const HATE_TERMS = [
  // norske
  "neger", "negar", "jodesvin", "homofaen",
  // engelske
  "nigger", "faggot", "kike", "chink", "spic", "retard",
];

// Seksuelt eksplisitte termer (kombineres med mindreårig-sjekk under).
const SEXUAL_TERMS = [
  "sex", "porno", "porn", "naken", "nudes", "blowjob", "anal", "knulle", "pikk", "fitte",
];
// Mindreårig-markører — seksuelt + dette (eller AGE_MINOR_RE) = hard blokk (CSAM).
// Norske stammer matches som prefiks (fanger bøyning: mindrearig→mindrearige).
// Engelske som hele ord (så «minor» ikke treffer «minoritet» — «seksuelle
// minoriteter» er et legitimt voksen-tema som SKAL slippe gjennom).
const MINOR_STEM_RE = /\b(?:barn|mindrearig|mindreaarig|baby|smaabarn|smabarn|underaarig|underarig|guttunge|jentunge)/;
const MINOR_WORD_RE = /\b(?:child|children|kid|kids|minor|minors|underage|teen|teens)\b/;

// Fraser som signaliserer oppskrift/instruksjon for skade (treff på spaced tekst).
// Frasebasert for å unngå å blokkere selve tema-ordet.
const WEAPON_PHRASES = [
  "lage bombe", "bygge bombe", "bombeoppskrift", "hjemmelaget sprengstoff",
  "lage sprengstoff", "how to make a bomb", "build a bomb", "make explosives",
  "lage gift", "lage nervegift", "lage en pistol", "3d printed gun", "ghost gun",
];
const DRUG_PHRASES = [
  "lage metamfetamin", "lage meth", "koke amfetamin", "syntetisere", "syntese av",
  "how to make meth", "how to synthesize", "cook meth", "lage mdma", "lage lsd",
];
const SELFHARM_PHRASES = [
  "ta livet mitt", "ta sitt eget liv", "selvmordsmetode", "metode for selvmord",
  "hvordan begaa selvmord", "hvordan ta livet", "how to kill myself", "suicide method",
  "ways to die", "hvordan skade meg selv", "how to self harm",
];

function anyTermInTight(tight, terms) {
  return terms.find((t) => tight.includes(t.replace(/\s+/g, "")));
}
function anyPhraseInSpaced(spaced, phrases) {
  return phrases.find((p) => spaced.includes(p));
}

/**
 * Vurder en liste temaer (eller en enkelt streng). Første treff vinner.
 */
function screenThemes(themes) {
  const list = Array.isArray(themes) ? themes : [themes];
  const spaced = normalizeSpaced(list.join(" ; "));
  const tight = normalizeTight(spaced);
  if (!spaced) return { ok: true };

  // 1) Hat/slurs.
  const slur = anyTermInTight(tight, HATE_TERMS);
  if (slur) return { ok: false, category: "hate", reason: "Inneholder et hatefullt/krenkende ord." };

  // 2) Seksualisering av mindreårige (CSAM) — seksuelt term + mindreårig-markør
  //    (ord-markør ELLER aldersmarkør under 18).
  const sexual = anyTermInTight(tight, SEXUAL_TERMS) || anyPhraseInSpaced(spaced, ["seksuell", "sexuell"]);
  const minor = MINOR_STEM_RE.test(spaced) || MINOR_WORD_RE.test(spaced) || AGE_MINOR_RE.test(spaced);
  if (sexual && minor)
    return { ok: false, category: "csam", reason: "Seksualisering av mindreårige er aldri tillatt." };

  // 3) Eksplisitt seksuelt innhold (uten mindreårig — fortsatt upassende for produktet).
  const explicit = anyTermInTight(tight, ["porno", "porn", "blowjob", "anal", "nudes"]);
  if (explicit) return { ok: false, category: "sexual", reason: "Eksplisitt seksuelt innhold passer ikke her." };

  // 4) Våpen/eksplosiv-oppskrift.
  const weapon = anyPhraseInSpaced(spaced, WEAPON_PHRASES);
  if (weapon) return { ok: false, category: "weapons", reason: "Oppskrifter på våpen/eksplosiver er ikke tillatt." };

  // 5) Narkotika-syntese.
  const drug = anyPhraseInSpaced(spaced, DRUG_PHRASES);
  if (drug) return { ok: false, category: "drugs", reason: "Instruksjoner for narkotikaframstilling er ikke tillatt." };

  // 6) Selvskade/selvmord-instruksjon.
  const selfharm = anyPhraseInSpaced(spaced, SELFHARM_PHRASES);
  if (selfharm) return { ok: false, category: "self_harm", reason: "Dette temaet kan vi ikke lage quiz om." };

  return { ok: true };
}

module.exports = { screenThemes, normalizeSpaced, normalizeTight };
