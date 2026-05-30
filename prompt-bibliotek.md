# CustomQuiz — Prompt-bibliotek for bilder og video

Sist oppdatert: 27. mai 2026. Bygger på `design-spec.md` (krem #F5F0E6 + dyp teal #0A6E5A) og `MVP-plan.md`.

## Universelle regler

Lim alltid disse inn et sted i prompten — det er disse som holder bildene konsistente på tvers av verktøy:

- Palette: warm cream `#F5F0E6` background, deeper cream `#ECE3CE` for soft zones, near-black warm ink `#1F1A14`, deep teal accent `#0A6E5A` only.
- No drop shadows, no gradients, no glossy or "premium tech" sheen.
- Editorial photography or hand-drawn ink illustration. Slight paper grain. Mood: scandinavian-modern, literary, slow.
- Hold deg unna: "vibrant", "dynamic", "modern SaaS", "3D render", "glow", "futuristic".

---

## 1. Logo og signaturmotiv

**1.1 Logo-skisse (still image, til logo-arbeid)**
> Wordmark "CustomQuiz" set in Fraunces serif, weight 500, semi-italic. The Q is slightly stylized with a longer, more confident swash on its tail. The dot on the i is replaced with a small filled circle in deep teal (#0A6E5A). All other letters in warm near-black (#1F1A14). On a warm cream background (#F5F0E6). Centered, generous margins. No background graphics. Clean wordmark.

**1.2 Signaturmotiv (favicon / app-ikon / standalone)**
> A single small filled circle in deep teal (#0A6E5A) on warm cream (#F5F0E6), centered, with subtle paper grain. The circle has the soft imperfection of being hand-printed. Square format. Minimalist, almost a quiet brand stamp.

**1.3 Logo-variant (ink seal-stil)**
> The letter Q in Fraunces italic, weight 500, with an extended swash tail. Deep teal (#0A6E5A) ink on warm cream paper (#F5F0E6). Slightly imperfect edges as if hand-printed with a letterpress. Square, centered, paper grain visible. Could function as an app icon or watermark.

---

## 2. Forside og brand hero

**2.1 Brand hero — still life**
> Editorial still life photograph, top-down view on a warm cream surface (#F5F0E6). A folded Norwegian newspaper, a porcelain espresso cup with a deep teal saucer (#0A6E5A), a brass pen, a small notebook open to a blank page. Soft north-window daylight, gentle shadows, fine paper texture. Muted palette: cream, deep teal accent only, warm near-black ink. No text, no logos. Quiet, slow, scandinavian-modern, slightly literary mood. 4:3, photographic, subtle grain.

**2.2 OG-bilde / share-kort-bakgrunn**
> Minimal abstract composition, warm cream background (#F5F0E6) with a single hand-painted deep teal arc (#0A6E5A) sweeping across the lower third. Fine 0.5px hairline rule near the top. Subtle paper grain. Empty negative space designed to receive overlaid serif headline text. 1200x630, editorial, restrained, no people, no objects.

**2.3 Masthead-banner (avisforside-stil)**
> Top-down photograph of a folded newspaper masthead on warm cream paper (#F5F0E6). Single horizontal hairline border above and below an empty headline strip. Deep teal stamp mark in the corner (#0A6E5A). Soft morning light, paper grain. Designed as a banner that will receive Fraunces serif headline text overlaid. 1600x400.

---

## 3. Kategori-illustrasjoner

For hvert tema, bytt ut `[TEMA]` med subjektet. Behold resten ordrett.

> Single-object editorial illustration on warm cream (#F5F0E6). Subject: [TEMA]. Hand-drawn ink line illustration, deep teal (#0A6E5A) only, no fill, confident varied line weight, slight imperfection like a woodcut. Centered, generous whitespace, square format. Style: classic newspaper editorial illustration, not childish, not corporate.

**Tema-spesifikke subject-formuleringer:**

- Norsk historie → "a quill pen and an old folded map of Scandinavia"
- Naturvitenskap → "a brass microscope viewed from a slight three-quarter angle"
- Geografi → "a paper map of Oslo, folded once, with a small compass"
- Litteratur → "an open vintage hardcover book with a ribbon bookmark"
- Kunst → "a wooden artist's palette with a single brush resting across it"
- Film og TV → "an old film clapperboard, slightly open"
- Musikk → "a single violin lying on its side"
- Sport → "a leather football with classic stitching, slightly worn"
- Filosofi → "a single chess king piece, fallen sideways"
- Teknologi → "a 1960s rotary telephone, three-quarter view"
- Mix → "three folded paper triangles overlapping, suggesting variety"
- Custom → "a blank index card with a single pencil placed diagonally"

---

## 3b. Kategori-illustrasjoner — retning C (spot color + moderniserte motiver)

Oppdatert 28. mai 2026. Erstatter §3 hvis du regenererer hele settet.

**Hvorfor:** Settet i §3 ble for ensartet og for "antikk encyklopedi". Retning C beholder linjekvaliteten, men introduserer (a) én spot-farge per kategori og (b) modernisert motivvokabular der det gamle artefaktet trakk identiteten mot 1890.

### Universell prompt-mal for retning C

Bytt ut `[TEMA]`, `[SPOT-COLOR HEX]`, og `[SPOT-COLOR NAVN]` per kategori.

> Single-object editorial illustration on warm cream paper (#F5F0E6). Subject: [TEMA]. Two-layer composition: a soft hand-printed shape in [SPOT-COLOR NAVN] ([SPOT-COLOR HEX]) sits behind the subject as a quiet color field — slightly off-register, like a risograph print, occupying roughly 40% of the frame, with the subject overlapping its edge. The subject itself is rendered in deep teal (#0A6E5A) ink: confident varied line weight, woodcut imperfection, NO cross-hatching tonal fills (use line only — not engraved shading). Centered, generous whitespace, square format. Style: scandinavian editorial illustration, modern but quiet, not childish, not corporate, not vintage encyclopedia. Subtle paper grain.

**Nøkkelendringer fra §3:**
- "two-layer composition" + "soft hand-printed shape in [SPOT]" → introduserer spot color
- "NO cross-hatching tonal fills (use line only)" → demper encyklopedi-følelsen
- "modern but quiet, not vintage encyclopedia" → eksplisitt avgrensning

### Spot-paletten

| Navn | Hex | Brukes på |
|---|---|---|
| Teal (signatur) | `#0A6E5A` | Mix, Custom |
| Moss | `#5C7A3C` | Geografi |
| Kobolt | `#2C4A8F` | Teknologi, Naturvitenskap |
| Terracotta | `#B05238` | Norsk historie, Verdenshistorie, Film og TV |
| Plomme | `#6B3050` | Filosofi, Litteratur |
| Saffron | `#C68A2E` | Sport, Kunst, Musikk |

### Per-kategori subject-formulering (moderniserte motiver)

Halvparten av motivene er byttet ut. Endringer markert med ⟵ NY.

- **Mix** (Teal) → "three overlapping geometric shapes — a circle, a triangle, a square — slightly tilted, suggesting variety"
- **Custom** (Teal) → ⟵ NY "a single elegant ink line that starts confident at the bottom and trails into smaller dots that fade upward, suggesting an idea being formed" *(erstatter blanke indekskort + blyant — se §9c Alt 1)*
- **Geografi** (Moss) → ⟵ NY "a hand-drawn globe seen from a three-quarter angle, with only continent outlines, no latitude grid" *(erstatter foldet papirkart + kompass)*
- **Naturvitenskap** (Kobolt) → ⟵ NY "a simplified DNA double helix, two strands twisting upward, viewed from the side" *(erstatter messing-mikroskop)*
- **Teknologi** (Kobolt) → ⟵ NY "a minimalist smartphone silhouette, screen-side facing forward, with a single dot of light on the screen" *(erstatter 1960s rotary telephone — dette var den verste)*
- **Norsk historie** (Terracotta) → ⟵ NY "the silhouette of a traditional Norwegian stavkirke from the side, with only essential rooflines" *(erstatter fjærpenn + Skandinavia-kart)*
- **Verdenshistorie** (Terracotta) → "a single classical column standing alone, with a hairline crack running up its length"
- **Litteratur** (Plomme) → ⟵ NY "a small stack of three modern paperback books, slightly askew, no titles visible" *(erstatter vintage hardcover + båndbokmerke)*
- **Kunst** (Saffron) → ⟵ NY "a single abstract sculptural form on a small plinth — suggestive of a Henry Moore silhouette, no detail" *(erstatter trepalette + pensel)*
- **Musikk** (Saffron) → ⟵ NY "a modern handheld microphone, cable trailing off the bottom of the frame, simple silhouette" *(erstatter liggende fiolin)*
- **Film og TV** (Terracotta) → ⟵ NY "a simple play-triangle inside a soft-cornered rectangle, suggesting a screen, with one beam of light projecting forward" *(erstatter klappebrett)*
- **Filosofi** (Plomme) → ⟵ NY "a single spiral, hand-drawn, tightening toward its center" *(erstatter falt sjakk-konge)*
- **Sport** (Saffron) → ⟵ NY "a modern running shoe seen from the side, simplified silhouette, with one motion line behind it" *(erstatter slitt lærfotball)*

### Tips for regenerering

- Generer i samme verktøy (samme Midjourney/Imagine-modell) i ETT batch for visuell konsistens.
- Hvis verktøyet ikke greier "no cross-hatching" — legg til: `flat shapes, line drawing only, no engraving, no etching, no woodcut shading`.
- Spot-flatens form skal IKKE være en perfekt sirkel — bruk `irregular hand-printed shape` eller `soft organic blob` for å beholde håndlagdfølelsen.
- For mobil-lesbarhet: be om `subject occupies 55% of frame, generous whitespace around, readable at 80x80 pixels`.

### Visuell mockup

Se `mockup-kategori-spotcolor.html` for en grov demo av prinsippet anvendt på dagens bilder (via CSS-blend). Bra for å sjekke hvordan paletten fordeler seg i et grid før du regenererer.

---

## 4. Streak, belønning og prestasjon

**4.1 Streak-laurbær**
> Editorial illustration of a small laurel wreath made of two simple curved branches, deep teal ink (#0A6E5A) on warm cream (#F5F0E6). Hand-drawn, fine line, restrained. Empty space in the middle for a number to be placed. Square format, slight paper grain. Reminiscent of an old certificate or stamp.

**4.2 Streak-flamme (alternativ, mindre formell)**
> A simple hand-drawn single-line flame, deep teal ink (#0A6E5A) on warm cream paper (#F5F0E6). Confident continuous line, no fill, slightly stylized like a vintage matchbook print. Square, centered, paper grain.

**4.3 Milepæl-stempel (7, 30, 100 dager)**
> A circular ink stamp design, deep teal (#0A6E5A) outline on warm cream (#F5F0E6). Inside the ring, generous empty space for a number. Outer ring carries a small JetBrains Mono-style monospace text "DAYS · IN · A · ROW". Slightly imperfect edges as if hand-stamped. Square, centered.

---

## 5. User flow-illustrasjoner

**5.1 Magic link — sjekk e-posten**
> A simple hand-drawn ink illustration on warm cream paper (#F5F0E6): a closed envelope with a small deep teal wax seal (#0A6E5A) in the center. Confident single-line drawing, deep teal ink only, no fill. Square format, generous whitespace, slight paper grain. Editorial restraint.

**5.2 Tomtilstand — "kom tilbake i morgen"**
> Minimal still life: a closed leather notebook and a brass pen lying on cream paper. Daylight from the side. Deep teal bookmark ribbon peeking out. Top-down, photographic, calm, no people, no text. Square, 4:5. The feeling of "kom tilbake i morgen".

**5.3 Loading / "AI tenker"**
> A simple hand-drawn ink illustration: three small dots arranged horizontally on warm cream paper (#F5F0E6), deep teal ink (#0A6E5A). Each dot has the imperfection of a hand-stamped print. Generous whitespace, square format. Quiet, contemplative.

**5.4 Feilmelding — "noe gikk skjevt"**
> Editorial ink illustration on warm cream (#F5F0E6): a single coffee cup tipped slightly sideways, a few drops escaping. Deep teal ink only (#0A6E5A), hand-drawn line, no fill. Honest, slightly playful, never alarming. Square, paper grain.

**5.5 Paywall / abonnement-hero**
> A single porcelain coffee cup seen from above on a cream linen tablecloth, deep teal interior visible. Soft directional morning light, long quiet shadow. Photographic, editorial, almost monochrome — cream tones with one teal accent. No text, no people. Square or 4:5. Mood: a small daily ritual worth paying for.

**5.6 Rapporter feil — knappen / dialogen**
> Editorial ink illustration: a small magnifying glass lying flat on cream paper (#F5F0E6), deep teal ink (#0A6E5A), hand-drawn confident line, no fill. Subtle, never accusatory. Square, paper grain.

**5.7 Admin-godkjenning — redaktørens skrivebord**
> Top-down photograph of an editor's desk: a stack of paper galleys with handwritten notes in deep teal ink, a coffee cup, a brass pen, a stamp pad. Warm cream paper tone everywhere (#F5F0E6). Soft morning window light. No faces, no screens. Editorial, restrained, scandinavian. 16:9.

---

## 6. Wordle-stil delemønster og social

**6.1 Share-kort generator**
> Composition for a square social share card, 1080x1080, warm cream background (#F5F0E6). Top third: small monospace eyebrow text area "CUSTOMQUIZ № [NUMMER]". Center: large empty space where the Wordle-style result grid will be overlaid (🟩 deep teal #0A6E5A on cream, ⬛ near-black #1F1A14 on cream — both rendered as soft squares). Bottom: empty space for URL and date. Subtle paper grain. No decorative elements.

**6.2 Wordle-grid stand-alone**
> A grid of ten small squares in two rows of five, on warm cream paper (#F5F0E6). Some squares filled with deep teal (#0A6E5A), some with warm near-black (#1F1A14). Squares have slightly rounded corners and the soft imperfection of being hand-printed. Centered, generous whitespace, paper grain. Square format.

---

## 7. Redaksjonell kalender og ukerytme

**7.1 Ukerytme-grid (7 dager × 7 tema)**
> A minimal calendar grid: seven rows representing days Mandag through Søndag. Each row has a small editorial ink illustration in deep teal (#0A6E5A) on warm cream (#F5F0E6) representing that day's theme — quill (historie), microscope (vitenskap), map (geografi), book (litteratur), brush (kunst), film clapperboard (film), violin (musikk). Hand-drawn line work, no fill. JetBrains Mono labels in warm near-black (#1F1A14). Editorial, like a print weekly schedule.

**7.2 Ukeskonkurranse-leaderboard**
> Editorial composition on warm cream paper (#F5F0E6): a vertical list layout suggesting a weekly leaderboard, with thin hairline rules between rows. Top three positions marked with small deep teal (#0A6E5A) hand-drawn laurel leaves. JetBrains Mono monospace numbers. No real names, just suggestion of structure. Restrained, like a small-town newspaper standings page.

---

## 8. Video-prompts (Grok Imagine / Sora / Runway)

**8.1 Logo-intro (3–5 sek loop)**
> A deep teal ink drop (#0A6E5A) falls onto warm cream paper (#F5F0E6) in slow motion and bleeds outward into a perfect circle. Macro photography, soft natural light, paper fibers visible. No text, no music cue. End frame: clean teal circle on cream — the CustomQuiz signaturmotiv. 5 seconds, looping, 1:1.

**8.2 Bakgrunns-ambient (subtil hero-loop)**
> Slow drifting close-up of cream linen paper with a single deep teal hairline being drawn by an unseen pen, moving very slowly across the frame. Macro, shallow depth of field, dust motes in light. Ambient, no narrative, hypnotic. 10 seconds, seamless loop, 16:9.

**8.3 Daglig quiz-avsløring (overgangsanimasjon)**
> A folded newspaper on a cream surface slowly unfolds, revealing a blank page with a single empty headline area in serif. Top-down, cinematic, soft morning light, paper texture audible. 4 seconds, no text overlays. 9:16 for stories, 1:1 for feed.

**8.4 Streak-feiring (mikro-moment etter fullført quiz)**
> Two slender teal laurel branches draw themselves onto cream paper in slow ink strokes from opposite sides, meeting in the middle. Hand-drawn feel, paper grain, no sound cue needed. 2 seconds, 1:1, ending on still frame for screenshot/share.

**8.5 Magic link-bekreftelse**
> A closed envelope on cream paper slowly receives a deep teal wax seal — the seal lowers gently, leaves a perfect circular imprint, lifts away. Top-down, macro, soft daylight, paper grain. 3 seconds, 1:1.

**8.6 Social teaser — "ny quiz hver morgen"**
> Slow morning sequence: steam rising from a teal-rimmed cup on cream paper, a hand turning a page, a pen tapping once. Editorial, scandinavian morning light, no faces, only hands. Cream and teal palette only. 8 seconds, 9:16, mood: rolig start på dagen.

**8.7 Wordle-share-reveal (etter fullført quiz)**
> Ten small squares draw themselves one at a time onto cream paper, each either filling with deep teal or warm near-black. The reveal is slow, satisfying, like a typewriter committing letters. Macro, paper grain, no sound cue. 4 seconds, 1:1.

---

## 9. Tips for bruk

- Hvis et bilde ser for "AI-glanset" ut, legg til på slutten: `subtle paper grain, slight imperfection, editorial photography, not glossy, not retouched`.
- For konsistent ink-stil på illustrasjoner: hold deg til `single confident line, varied weight, no fill, hand-drawn imperfection`.
- For fotografier: hold lyset alltid til `soft directional morning daylight` eller `soft north-window light` — det er det som gir den editoriale roen.
- Tematisk konsistens > teknisk perfeksjon. Hvis et generert bilde har riktig stemning men feil detalj, fiks detaljen i Photoshop heller enn å re-prompte til du mister stemningen.

---

## 9b. Spesifikke bilder for quizer i arkivet (bedre enn fallback)

De seks eksisterende quizene viser nå kategori-fallback (mix, geografi, naturvitenskap, musikk). Det funker, men hver utgave kunne fått sin egen signatur. Bruk disse hvis du vil løfte dem.

**Quiz-spesifikke (bytter ut kategori-fallback for de seks eksisterende):**

**№ 03 og № 04 — Oslo-spesifikt** (i stedet for geografi)
> Editorial ink illustration on warm cream paper (#F5F0E6): a stylized line drawing of Oslo's silhouette — the Operahuset's slanted roof, the spire of Rådhuset, the Holmenkollen ski jump suggested in the distance. Deep teal ink only (#0A6E5A), hand-drawn confident line, no fill, woodcut imperfection. Centered, square format, paper grain. Avoid recognizable people. Reads as "Oslo" at a glance.

**№ 04 — Oslo puber-spesifikt** (mer kveldsstemning enn generelt Oslo)
> Editorial ink illustration on warm cream paper (#F5F0E6): a single pub-style hanging sign over a cobblestone street, a streetlamp casting a long shadow. Deep teal ink only (#0A6E5A), hand-drawn, no fill. Square format, paper grain. Suggests "Tigerbyens baksider" — kvelds-Oslo med historie.

**№ 05 — Klinikk/helbredelse** (mer presist enn naturvitenskap)
> Editorial ink illustration on warm cream paper (#F5F0E6): a pair of hands, palms up, with a small leaf resting in one — a quiet symbol of touch, care and healing. Deep teal ink only (#0A6E5A), hand-drawn confident line, no fill. Square format, paper grain. Sympathetic, never clinical-cold.

**№ 06 — YUNGBLUD-spesifikt** (mer punk-stemning enn generelt musikk)
> Editorial ink illustration on warm cream paper (#F5F0E6): a single hand holding a microphone tightly, sleeve rolled up. Deep teal ink only (#0A6E5A), hand-drawn line with confident, slightly raw energy, no fill. Square format, paper grain. Reads as "lyd, stemme, energi" — uten å være karikatur.

## 9c. Custom-illustrasjon — alternativ versjon

Du har `kategori-custom.jpg` nå (blanke indekskort + blyant). Det er nøytralt og passer, men kommuniserer ikke alltid "*ditt eget tema, generert spesielt for deg*". Et alternativ som gjør jobben tydeligere:

**Alt 1 — uferdig idé**
> Editorial ink illustration on warm cream paper (#F5F0E6): a single elegant ink line that starts confident at the bottom and trails into smaller dots that fade out toward the top — suggesting a thought in progress, an idea being formed. Deep teal ink only (#0A6E5A), hand-drawn, paper grain. Square format, generous whitespace.

**Alt 2 — generering-stemning**
> Editorial ink illustration on warm cream paper (#F5F0E6): a porcelain inkwell with a quill rising from it, a few teal drops scattered on the paper around it. Deep teal ink (#0A6E5A), no fill, hand-drawn line, paper grain. Square format. Reads as "a tailored quiz being written right now".

**Alt 3 — spørsmålstegn-stempel**
> Editorial illustration on warm cream paper (#F5F0E6): a large question mark formed by a single confident teal ink stroke (#0A6E5A), with the dot below being a small filled circle (matching the brand signaturmotiv). Hand-drawn, slightly imperfect, no fill. Square, centered, paper grain.

## 10. Bilder vi mangler å generere (sjekkliste)

- [ ] Logo (1.1) — for nettstedhead og signaturer
- [ ] Signaturmotiv (1.2) — favicon, app-ikon, signaturstempel
- [ ] Brand hero (2.1) — forsiden av customquiz.no
- [ ] OG-bilde (2.2) — share-kort med headline-overlay
- [ ] Kategori-sett (3) — minimum 12 illustrasjoner for tema-velgeren
- [ ] Streak-laurbær (4.1) — profilside
- [ ] Magic link-envelope (5.1) — auth-flow
- [ ] Tomtilstand (5.2) — "kom tilbake i morgen"
- [ ] Paywall-hero (5.5) — v2-lansering
- [ ] Logo-intro video (8.1) — for nettstedhead og social
- [ ] Streak-video (8.4) — etter fullført quiz
