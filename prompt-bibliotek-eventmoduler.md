# CustomQuiz — Prompt-bibliotek for event-moduler (VM, OL, friidretts-VM, UFC …)

Opprettet 5. juni 2026. Utvidelse av `prompt-bibliotek.md`. Bygger på de samme **universelle reglene (§0)** og **retning C (spot-color + moderniserte motiver)** som resten av biblioteket — ikke et nytt visuelt univers, men event-temaer lagt oppå den eksisterende krem + ink-identiteten.

Dette dokumentet gjør to ting:
1. Definerer et **generisk event-system** slik at vi kan spinne opp et helt illustrasjonssett for et hvilket som helst mesterskap (VM, OL, friidretts-VM, UFC, Tour de France …) ved å bytte ut noen få slott.
2. Gir det **ferdig utfylte VM 2026-settet** klart til å lime inn i ChatGPT / Midjourney / Imagine.

---

## §0 — Universelle regler (gjentatt, må alltid med)

Lim alltid inn et sted i prompten:

- Palette: warm cream `#F5F0E6` background, deeper cream `#ECE3CE` for soft zones, near-black warm ink `#1F1A14`, **plus the one event spot color** (se registeret under).
- No drop shadows, no gradients, no glossy or "premium tech" sheen, no neon.
- Hand-drawn ink line illustration (line only, **no cross-hatching tonal fills**), confident varied line weight, woodcut imperfection. Slight paper grain.
- Mood: scandinavian-modern, editorial, quiet. Not childish, not corporate, **not vintage encyclopedia**.
- Hold deg unna: "vibrant", "dynamic", "modern SaaS", "3D render", "glow", "futuristic", "esports".

**Viktig avgrensning for sport:** ingen ekte logoer, ingen gjenkjennelige spillere/utøvere, ingen varemerkebeskyttede troféer (f.eks. ikke tegn det faktiske VM-troféet — bruk et generisk pokal-motiv). Dette holder oss trygge på rettigheter og konsistente i stilen.

---

## §1 — Den generiske modellen

Hvert event får et illustrasjonssett i **to nivåer**:

### Nivå A — Event-assets (5 stk, lages én gang per event)
Disse bærer modulens identitet og gjenbrukes på tvers av alle quizene i eventet.

| # | Asset | Funksjon |
|---|---|---|
| A1 | **Event-hero / cover** | Toppbilde på modulforsiden, share-bakgrunn |
| A2 | **Event-signaturmotiv (stempel)** | Favicon/badge for modulen, brukes i liga-kort og medaljer |
| A3 | **Liga-hero** (inviter venner) | Illustrasjon på «opprett/bli med i liga»-skjermen |
| A4 | **Ledertavle-motiv** | Topp av global + liga-ledertavle |
| A5 | **Share-kort** (resultat) | Wordle-stil delekort etter fullført quiz |

### Nivå B — Runde/tema-assets (1 per quiz-tema)
Én illustrasjon per quiz i poolen. To kategorier:
- **Stabile temaer** (historie, helter, arenaer, nasjoner) — lages på forhånd.
- **Live-runder** (gruppespill, sluttspill) — lages fortløpende, men motivene er kjent på forhånd så promptene kan stå klare.

### Slott som byttes per event
Hele systemet kjøres på fire variabler:

- `[EVENT]` — navnet (f.eks. «Fotball-VM 2026»)
- `[SPOT-NAVN]` / `[SPOT-HEX]` — event-fargen (se §2)
- `[EVENT-MOTIV]` — det gjennomgående objektet (fotball, fakkel, piggsko, hanske …)
- `[TEMA-MOTIV]` — motivet for den enkelte runde/tema-illustrasjonen

---

## §2 — Event-register: spot-color + motiv

Regel: **én muted spot-color per event**, hentet fra paletten der det går. For kampsport/høyintensitet kan vi legge til én ny dempet tone — aldri neon, alltid håndtrykt.

| Event | Spot-navn | Hex | Gjennomgående motiv `[EVENT-MOTIV]` | Stempel-motiv (A2) |
|---|---|---|---|---|
| **Fotball-VM 2026** | Saffron | `#C68A2E` | a modern football, simplified panel pattern, clean silhouette | football inside a circular stamp ring |
| **OL** (sommer) | Terracotta | `#B05238` | a single Olympic-style torch with a simple flame, no rings | torch inside a circular stamp ring |
| **Friidretts-VM** | Moss | `#5C7A3C` | a single sprint spike shoe seen from the side, one motion line | spike shoe inside a stamp ring |
| **UFC / kampsport** | Okseblod (NY) | `#8C2F2A` | a single MMA glove, simplified silhouette | glove inside an octagon stamp ring |
| **Sykkel (TdF e.l.)** | Kobolt | `#2C4A8F` | a simplified road-bike silhouette from the side | bike wheel inside a stamp ring |

Nye event: velg én dempet spot, definer ett `[EVENT-MOTIV]`, så faller resten av settet ut av malene i §3.

---

## §3 — Gjenbrukbare prompt-maler (Nivå A)

Bytt ut `[…]`-slottene. Engelsk prompt-tekst, som i resten av biblioteket.

### A1 — Event-hero / cover
> Single-object editorial illustration on warm cream paper (#F5F0E6). Subject: `[EVENT-MOTIV]`, large and centered. Two-layer composition: a soft, irregular hand-printed shape in `[SPOT-NAVN]` (`[SPOT-HEX]`) sits behind the subject as a quiet color field, slightly off-register like a risograph print, occupying roughly 45% of the frame, with the subject overlapping its edge. The subject is rendered in warm near-black ink (#1F1A14): confident varied line weight, woodcut imperfection, line only, NO cross-hatching. Generous whitespace, square or 4:3. Scandinavian editorial, modern but quiet, not vintage encyclopedia. Subtle paper grain. No text, no logos, no recognizable people.

### A2 — Event-signaturmotiv (stempel/badge)
> A circular ink stamp design on warm cream (#F5F0E6): `[STEMPEL-MOTIV]`, the central object drawn in `[SPOT-NAVN]` (`[SPOT-HEX]`) with confident hand-drawn line, no fill. Outer ring carries small JetBrains Mono-style monospace text "`[EVENT]` · CUSTOMQUIZ". Slightly imperfect edges as if hand-stamped. Square, centered, paper grain. Reads clearly at 80×80 pixels.

### A3 — Liga-hero (inviter venner)
> Editorial ink illustration on warm cream paper (#F5F0E6): a row of small triangular supporter pennants strung on a single line, gently curved, suggesting a friendly group/league. One pennant filled softly with `[SPOT-NAVN]` (`[SPOT-HEX]`), the rest in warm near-black ink (#1F1A14) outline only. Hand-drawn, no cross-hatching, generous whitespace, square format, paper grain. Mood: «samle gjengen», warm but restrained. No faces, no logos.

### A4 — Ledertavle-motiv
> Editorial composition on warm cream paper (#F5F0E6): three stacked rectangular blocks of different heights suggesting a podium, the tallest in the center. The top edge of the center block carries two small hand-drawn laurel leaves in `[SPOT-NAVN]` (`[SPOT-HEX]`). Thin hairline rules suggesting standings rows beneath. Warm near-black ink (#1F1A14), line only, no fill. JetBrains Mono numerals suggested, no real names. Square, paper grain, like a small-town newspaper standings page.

### A5 — Share-kort (resultat, Wordle-stil)
> Composition for a square social share card, 1080×1080, warm cream background (#F5F0E6). Top: small monospace eyebrow area "`[EVENT]` · QUIZ № [NUMMER]". Center: large empty space for a result grid (filled squares in `[SPOT-NAVN]` `[SPOT-HEX]`, missed squares in warm near-black #1F1A14, both as soft hand-printed rounded squares). A small `[EVENT-MOTIV]` line-icon in one corner. Bottom: empty space for URL and date. Subtle paper grain, no other decoration.

---

## §4 — Gjenbrukbar prompt-mal (Nivå B, runde/tema)

> Single-object editorial illustration on warm cream paper (#F5F0E6). Subject: `[TEMA-MOTIV]`. Two-layer composition: a soft irregular hand-printed shape in `[SPOT-NAVN]` (`[SPOT-HEX]`) behind the subject as a quiet color field, slightly off-register, ~40% of the frame, subject overlapping its edge. Subject in warm near-black ink (#1F1A14): confident varied line weight, woodcut imperfection, line only, NO cross-hatching. Centered, generous whitespace, square. Scandinavian editorial, modern but quiet, not vintage encyclopedia, paper grain. Subject occupies ~55% of frame, readable at 80×80 px. No text, no logos, no recognizable people.

---

## §5 — VM 2026: komplett sett (ferdig utfylt)

Spot: **Saffron `#C68A2E`**. `[EVENT-MOTIV]`: *a modern football, simplified panel pattern, clean silhouette*.

### Nivå A — modul-assets

**VM-A1 · Hero** — bruk A1-malen med fotball-motivet over.

**VM-A2 · Stempel**
> A circular ink stamp design on warm cream (#F5F0E6): a modern football with a simplified panel pattern centered inside the ring, drawn in saffron (#C68A2E), confident hand-drawn line, no fill. Outer ring carries small JetBrains Mono-style monospace text "FOTBALL-VM 2026 · CUSTOMQUIZ". Slightly imperfect edges as if hand-stamped. Square, centered, paper grain, readable at 80×80 px.

**VM-A3 · Liga-hero** — A3-malen, saffron pennant.

**VM-A4 · Ledertavle** — A4-malen, saffron laurbær.

**VM-A5 · Share-kort** — A5-malen, `[EVENT]`="FOTBALL-VM", liten fotball-line-icon i hjørnet.

### Nivå B — pre-VM-temaer (stabile, lages NÅ før avspark)

**VM-B1 · VM-historie**
> `[TEMA-MOTIV]` = a simple generic trophy cup raised slightly, no brand detail, clean lines. *(IKKE det ekte VM-troféet.)*

**VM-B2 · Nasjonene / troppene**
> `[TEMA-MOTIV]` = a single supporter scarf hanging, with simple horizontal stripes, no identifiable nation or text.

**VM-B3 · Vertsbyer & stadioner** (USA/Canada/Mexico)
> `[TEMA-MOTIV]` = a simplified stadium bowl seen from a high three-quarter angle, oval, with a single floodlight mast.

**VM-B4 · Legender & rekorder**
> `[TEMA-MOTIV]` = a pair of classic football boots tied together by the laces, hanging.

**VM-B5 · Kvalifiseringen**
> `[TEMA-MOTIV]` = a simple globe outline (continent contours only) with one dotted route line curving across it and a small football at the end.

### Nivå B — live-runder (lages fortløpende, prompts klare)

**VM-B6 · Gruppespill**
> `[TEMA-MOTIV]` = four short stacked horizontal bars of different lengths suggesting a group table, a small football resting at the top.

**VM-B7 · 16-delsfinaler**
> `[TEMA-MOTIV]` = a small tournament bracket fragment, a few connected right-angled lines branching, clean and minimal.

**VM-B8 · Kvartfinaler**
> `[TEMA-MOTIV]` = a narrowing bracket, four lines merging into two, minimal connected line-work.

**VM-B9 · Semifinaler**
> `[TEMA-MOTIV]` = two lines converging toward a single point, suggesting the road to the final, with a small football at the convergence.

**VM-B10 · Finalen**
> `[TEMA-MOTIV]` = a single football beneath a soft cone of spotlight, framed by two small laurel branches. *(Her kan saffron-flaten gjerne være litt større, ~50%, for å markere at dette er finalen.)*

---

## §6 — Filnavn-konvensjon

Hold det forutsigbart slik at frontend kan referere uten oppslag:

```
img/event/<event-slug>/hero.jpg
img/event/<event-slug>/stamp.jpg
img/event/<event-slug>/league.jpg
img/event/<event-slug>/leaderboard.jpg
img/event/<event-slug>/share.jpg
img/event/<event-slug>/tema-<slug>.jpg
```

Eksempler: `img/event/vm-2026/hero.jpg`, `img/event/vm-2026/tema-gruppespill.jpg`, `img/event/ol-2028/stamp.jpg`.

Spot-color lagres som metadata på event-raden i DB (`event.spot_hex`), så CSS kan bruke samme retning-C-overlay (`data-spot`) som kategori-systemet til bildene er regenerert med flaten innebygd.

---

## §7 — Sjekkliste VM 2026

Nivå A (lages én gang):
- [ ] VM-A1 Hero
- [ ] VM-A2 Stempel
- [ ] VM-A3 Liga-hero
- [ ] VM-A4 Ledertavle
- [ ] VM-A5 Share-kort

Nivå B — pre-VM (lages NÅ):
- [ ] VM-B1 Historie
- [ ] VM-B2 Nasjoner
- [ ] VM-B3 Vertsbyer
- [ ] VM-B4 Legender
- [ ] VM-B5 Kvalifisering

Nivå B — live (fortløpende):
- [ ] VM-B6 Gruppespill
- [ ] VM-B7 16-del
- [ ] VM-B8 Kvart
- [ ] VM-B9 Semi
- [ ] VM-B10 Finale

---

## §8 — Slik spinner du opp et nytt event (oppskrift)

1. Velg `[EVENT]`, `[SPOT-NAVN]/[SPOT-HEX]` og `[EVENT-MOTIV]` fra §2 (eller legg til en rad).
2. Kjør de 5 A-malene i §3 → modul-assets.
3. List opp quiz-temaene → ett `[TEMA-MOTIV]` per tema → kjør §4-malen.
4. Generer alt i ETT batch i samme verktøy/modell for visuell konsistens.
5. Legg filene i `img/event/<slug>/` etter §6.

**Eksempel — OL (Terracotta `#B05238`, motiv = fakkel):**
- A2 stempel: fakkel i ring, monospace «OL 2028 · CUSTOMQUIZ».
- Temaer: `idrettsgrener` → *a simple set of three overlapping sport silhouettes (a runner, a swimmer's wave, a discus arc), minimal*; `OL-historie` → *an ancient column with a small flame on top*; `medaljer` → *three simple discs on ribbons, only the center one filled*; osv.

---

## §9 — Tips (samme som §9 i hovedbiblioteket)

- Hvis bildet blir for «AI-glanset»: legg til `subtle paper grain, slight imperfection, editorial, not glossy, not retouched`.
- Hvis verktøyet ikke greier «no cross-hatching»: `flat shapes, line drawing only, no engraving, no etching, no woodcut shading`.
- Spot-flaten skal IKKE være perfekt sirkel: `irregular hand-printed shape` / `soft organic blob`.
- Tematisk konsistens > teknisk perfeksjon — fiks detaljer i Photoshop heller enn å re-prompte til stemningen ryker.
