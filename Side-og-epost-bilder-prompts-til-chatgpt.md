# Side- & e-postbilder — ferdige ChatGPT-prompts (de fire raske gevinstene)

Dekker: **e-post-header**, **app-ikon/favicon**, **Dagens-delekort** og **merkevare-OG** (min-side/auth). Samme husstil som resten av biblioteket.

**Felles stil (bakt inn i hver prompt):** varm krem `#F5F0E6`, motiv i varm nær-svart blekk `#1F1A14`, signaturfarge dyp teal `#0A6E5A`, kun linjer (ingen skravur/tonefyll/skygger/gradienter), håndtegnet woodcut-ujevnhet, papirkorn, rolig skandinavisk redaksjonell stil. Ingen tekst/bokstaver i bildet, ingen ekte logoer utenom vårt eget merke, ingen gjenkjennelige personer.

**Merket vårt:** wordmark = «CustomQuiz» i Fraunces kursiv; signaturmerket = **én teal prikk `#0A6E5A`** (prikken over i-en). Prikken er den gjennomgående identitetsbæreren under.

**Viktig om tekst:** bildemodeller skriver tekst upålitelig, så disse genereres **uten tekst** — de er rene merkevare-/grafikk-kort. Vil du ha tittel/dato eller wordmark *brent inn* i delekortene, kan jeg komposittere `logo.jpg` + tekst på i etterkant (si ifra).

---

## A · E-post-header / banner

Slank merkevare-stripe på toppen av Brevo-malene. Design 2× for retina; vises ca. 600×200 i e-posten. Hold den minimal — merket vårt *er* minimalt.

### `IMG/epost-header.jpg` — hovedheader (1200×400)
> A slim email header banner, 1200×400, on warm cream paper (#F5F0E6). Centered in the upper-middle: a single confident deep-teal dot (#0A6E5A) — the brand's signature mark, like the dot of an "i" — small and precise, with calm empty space beneath it reserved for a wordmark to be placed in HTML later. A single fine 0.5px deep-teal hairline rule runs across the full width near the bottom edge. Very minimal, generous whitespace, subtle paper grain. Quiet Scandinavian editorial. No text, no letters, no other graphics, no shadows, no gradients.

### `IMG/epost-header-rik.jpg` — variant med motiv-frise (1200×400, valgfri)
> A slim email header banner, 1200×400, on warm cream paper (#F5F0E6). Across the top edge, a whisper-faint frieze of three tiny evenly-spaced quiz line-icons — a question mark, a small five-point spark, a little stack of cards — drawn in warm near-black ink (#1F1A14), line only, at low opacity. Centered below them: a single confident deep-teal dot (#0A6E5A), the brand signature mark. A fine 0.5px deep-teal hairline rule across the full width near the bottom. Generous whitespace, subtle paper grain, quiet Scandinavian editorial. No text, no letters, no shadows, no gradients.

> **I HTML:** legg `logo.jpg` (wordmark) sentrert rett under headeren, eller bruk headeren som ren topp-stripe over en tekst-wordmark. Gjenbrukes på tvers av alle 14 e-post-flows.

---

## B · App-ikon / favicon

Faviconen i dag er en JPEG (`signature.jpg`). Her er et skikkelig kvadratisk ikon-master + en maskable-variant for PWA.

### `IMG/app-icon.jpg` — ikon-master, lyst (1024×1024)
> A square app icon, 1024×1024, on warm cream (#F5F0E6). A single bold deep-teal dot (#0A6E5A) centered in the frame — the brand signature mark — sized confidently so it stays legible when scaled down to 32px (the dot occupies roughly 36–40% of the width), with even padding all around. Clean, flat, crisp edges, only the faintest paper grain. No text, no letters, no other elements, no shadows, no gradients, no border.

### `IMG/app-icon-maskable.jpg` — maskable / PWA full-bleed (1024×1024)
> A square maskable app icon, 1024×1024. A solid deep-teal (#0A6E5A) field filling the frame edge to edge. A single warm-cream dot (#F5F0E6) centered well inside the safe zone (the dot occupies roughly 40% of the width, with generous margin so it survives a circular or rounded-square mask). Clean, flat, crisp, faint paper grain only. No text, no letters, no other elements, no shadows, no gradients.

> **Etterarbeid:** eksporter `app-icon.jpg` ned til 512, 192, 180 (apple-touch), 32 og 16 px PNG, og lag en liten `site.webmanifest` som peker på 192/512 (+ maskable). Si ifra, så genererer jeg størrelsene og manifestet for deg programmatisk.

---

## C · Delekort for Dagens (OG / sosial-preview)

`dagens.html` faller i dag tilbake på generisk `og.jpg`. Dette er et eget kort for Dagens quiz — teal er signaturfargen (saffron er reservert for VM).

### `IMG/dagens-share.jpg` — delekort / OG (liggende 1200×630)
> A social share card background, 1200×630, on warm cream paper (#F5F0E6). Subject (lower-right): a single tear-off calendar page / folded daily sheet, simple and clean, drawn in warm near-black ink (#1F1A14) — confident varied line weight, woodcut imperfection, line only, no cross-hatching, no fill. Behind it a soft irregular hand-printed deep-teal shape (#0A6E5A), slightly off-register like a risograph print, ~35% of the frame, the sheet overlapping its edge. The left half is deliberately left as clean open negative space to receive an overlaid serif headline and date later. A small deep-teal dot (#0A6E5A), the brand signature mark, sits in the top-left corner. A fine 0.5px teal hairline near the top. Subtle paper grain, restrained, quiet Scandinavian editorial. No text or numbers rendered, no logos, no people, no shadows, no gradients.

---

## D · Merkevare-OG (min-side, auth, auth-confirm)

Disse sidene har ingen `og:image` i det hele tatt. Ett delt merkevare-kort dekker alle tre som fallback.

### `IMG/og-brand.jpg` — delt merkevare-OG (liggende 1200×630)
> A branded Open Graph card, 1200×630, on warm cream paper (#F5F0E6). Centered: a quiet editorial still-life of a few quiz objects — a small stack of cards, a question mark, a five-point spark, and a slim pencil — arranged in a balanced cluster, drawn in warm near-black ink (#1F1A14): confident varied line weight, woodcut imperfection, line only, no cross-hatching, no fill. One soft irregular hand-printed deep-teal shape (#0A6E5A) sits behind the cluster, slightly off-register like a risograph print, ~40% of the frame, objects overlapping its edge. A single deep-teal dot (#0A6E5A), the brand signature mark, placed deliberately near the cluster. Generous whitespace, subtle paper grain, quiet Scandinavian editorial. No text, no letters, no people, no shadows, no gradients.

### `IMG/og-min-side.jpg` — min-side-variant (liggende 1200×630, valgfri)
> A branded Open Graph card, 1200×630, on warm cream paper (#F5F0E6). Subject (centered-right): a single hanging medal — a circular disc on a short ribbon, with a small five-point star on the disc — drawn in warm near-black ink (#1F1A14): confident varied line weight, woodcut imperfection, line only, no cross-hatching, no fill. Behind it a soft irregular hand-printed deep-teal shape (#0A6E5A), slightly off-register like a risograph print, ~40% of the frame, the medal overlapping its edge. Left side kept as open negative space. A small deep-teal dot (#0A6E5A), the brand signature mark, in the top-left corner. Generous whitespace, subtle paper grain, quiet Scandinavian editorial. No text, no logos, no people, no shadows, no gradients.

> **I koden:** legg til på hver side: `<meta property="og:image" content="IMG/og-brand.jpg">` (+ `twitter:image`). Bruk `og-min-side.jpg` på min-side hvis du vil ha den personlige varianten der.

---

## Batch-modus — slippe å lime inn én og én

Som i crest-fila: lim inn stil-primeren én gang, så korte motivlinjer. Disse har ulike formater, så generer dem i to grupper.

**Steg 1 — primer (én gang):**
```
Vi skal lage en liten serie merkevare-bilder for «CustomQuiz» i ÉN konsistent stil. Lås stilen og bruk den på alt under.

STIL (gjelder alle):
- Varm krem bakgrunn #F5F0E6 med svakt papirkorn.
- Motiv i varm nær-svart blekk #1F1A14: håndtegnet, varierende linjevekt, woodcut-ujevnhet, KUN LINJER — ingen skravur, tonefyll, skygger eller gradienter.
- Signaturfarge: dyp teal #0A6E5A. Merkets signaturmerke er ÉN teal prikk (#0A6E5A) — som prikken over en i.
- Der det er en fargeflate bak et motiv: myk, uregelmessig, lett ute av register som et risograph-trykk.
- Rolig skandinavisk redaksjonell stil. Ikke barnslig, ikke corporate, ikke vintage.
- INGEN tekst eller bokstaver i bildet. Ingen ekte logoer. Ingen personer.

Bekreft, så sender jeg motivene med format og mål.
```

**Steg 2a — kvadrat/banner-gruppe:**
```
1. epost-header (1200×400) — slim banner, én teal prikk #0A6E5A sentrert øverst, tom plass under til wordmark, én tynn teal hairline nederst.
2. app-icon (1024×1024) — én fet teal prikk #0A6E5A sentrert, lesbar ned til 32px, jevn padding, flat og skarp.
3. app-icon-maskable (1024×1024) — heldekkende teal #0A6E5A flate, én krem prikk #F5F0E6 sentrert i safe zone.
```

**Steg 2b — OG/delekort-gruppe (1200×630 liggende):**
```
4. dagens-share — en avrivnings-kalenderside i blekk nede til høyre, teal risograph-flate bak, venstre halvdel tom til tittel/dato, teal prikk i øvre venstre hjørne, teal hairline øverst.
5. og-brand — en rolig oppstilling av quiz-objekter (kortstabel, spørsmålstegn, spark, blyant) i blekk, sentrert, teal risograph-flate bak, teal prikk plassert i klyngen.
6. og-min-side — en hengende medalje med stjerne i blekk, sentrert-høyre, teal risograph-flate bak, venstre side tom, teal prikk i øvre venstre hjørne.
```

---

## Prioritert rekkefølge

1. **epost-header** — løfter alle 14 e-post-flows på én fil.
2. **app-icon + maskable** — fikser favicon (i dag en JPEG) og gjør appen installbar.
3. **dagens-share** — Dagens er det folk deler; eget kort gir riktig preview.
4. **og-brand** — dekker min-side/auth/auth-confirm på én fil (min-side-variant valgfri).
