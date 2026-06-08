# Crest — justerte prompts for lesbarhet (regenerering)

Basert på 48/32 px-testen. De flate crestene (Arsenal, Chelsea, Brann, Man United, Man City) er gode som de er. Disse syv er for detaljerte/graverte og blir grøtete smått — regenerer dem med flatere, kraftigere linje.

**Hva som er endret vs. originalprompten:** lagt til en eksplisitt «flat linje»-regel, færre indre linjer, motivet fyller mer av skjoldet, og krav om lesbarhet på 32 px. Spot-farge og motiv er ellers uendret, så de matcher de eksisterende.

**Felles forsterkning (bakt inn under):** *Flat line art only — absolutely NO engraving, cross-hatching, stippling, feather texture, woodgrain or tonal shading. Bold, confident, even outlines. Use the minimum number of internal lines needed to read the silhouette. The motif fills roughly 70% of the badge and must stay clearly legible at 32×32 px. Strong figure-ground contrast.*

Generer i samme ChatGPT-samtale som de andre, så kornet og krem-tonen matcher.

---

### `IMG/crest-liverpool.jpg` — Liverpool (rød)
> Editorial club crest on warm cream paper (#F5F0E6). A classic heraldic shield outline in warm near-black ink (#1F1A14). Inside: a single liver bird (Liverpool's mythical cormorant-like civic bird) in profile holding a small leafy sprig — drawn as a BOLD SIMPLE SILHOUETTE, flat line art only, NO engraving, cross-hatching, stippling or feather texture, minimal internal lines, the bird filling ~70% of the shield. Behind the badge, a soft irregular hand-printed red shape (#C8102E), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-newcastle.jpg` — Newcastle (sort/hvitt)
> Editorial club crest on warm cream paper (#F5F0E6). A tall heraldic shield outline in warm near-black ink (#1F1A14). Inside: a single magpie in profile — drawn as a BOLD SIMPLE TWO-TONE SHAPE (solid black head/back, clean white belly), flat line art only, NO engraving, cross-hatching, stippling or feather texture, minimal internal lines, filling ~70% of the shield. Behind the badge, a band of just 4–5 BOLD vertical black-and-white stripes (#1F1A14 on cream), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-everton.jpg` — Everton (kongeblå)
> Editorial club crest on warm cream paper (#F5F0E6). A tall heraldic shield outline in warm near-black ink (#1F1A14). Inside: a slender tower with a small spire and one arched doorway (a generic local lock-up tower) — drawn as a CLEAN BOLD OUTLINE, flat line art only, NO brickwork stippling, NO engraving or tonal shading, minimal internal lines, the tower filling ~70% of the shield, with two simple laurel sprigs at its base. Behind the badge, a soft irregular hand-printed royal-blue shape (#1B449C), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-leeds.jpg` — Leeds United (blå spot)
> Editorial club crest on warm cream paper (#F5F0E6). A round medallion / roundel outline in warm near-black ink (#1F1A14). Inside: a perched owl seen front-on with a small five-petal rose beside it — drawn as a BOLD SIMPLE SILHOUETTE, flat line art only, NO engraving, cross-hatching, stippling or feather texture, minimal internal lines, the owl filling ~70% of the roundel. Behind the badge, a soft irregular hand-printed deep-blue shape (#1D428A), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-bodo-glimt.jpg` — Bodø/Glimt (gul)
> Editorial club crest on warm cream paper (#F5F0E6). A round medallion / roundel outline in warm near-black ink (#1F1A14). Inside: a sea eagle with spread wings in front of a low half-disc midnight sun on a single horizon line — the eagle drawn as a BOLD SIMPLE SILHOUETTE, flat line art only, NO engraving, cross-hatching, stippling or feather texture, minimal internal lines, filling ~70% of the roundel. Behind the badge, a soft irregular hand-printed golden-yellow shape (#F6C915), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-lillestrom.jpg` — Lillestrøm (gul)
> Editorial club crest on warm cream paper (#F5F0E6). A round medallion / roundel outline in warm near-black ink (#1F1A14). Inside: a small canary perched on a short stack of 2–3 sawn planks — drawn as a BOLD SIMPLE SILHOUETTE, flat line art only, NO engraving, cross-hatching, stippling or woodgrain texture, minimal internal lines, filling ~70% of the roundel. Behind the badge, a soft irregular hand-printed golden-yellow shape (#F4C217), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.

### `IMG/crest-tottenham.jpg` — Tottenham (marineblå)
> Editorial club crest on warm cream paper (#F5F0E6). A round medallion / roundel outline in warm near-black ink (#1F1A14). Inside: a generic strutting rooster (a farmyard cockerel, NOT any club emblem) — drawn as a BOLD SIMPLE SILHOUETTE, flat line art only, NO engraving, cross-hatching, stippling or feather texture, minimal internal lines, filling ~70% of the roundel. Behind the badge, a soft irregular hand-printed deep-navy shape (#131F48), slightly off-register like a risograph print, ~45% of frame, badge overlapping its edge. Square 1:1, paper grain, quiet Scandinavian editorial, no shadows, no gradients. Must read clearly at 32×32 px. No real club logo, no text, no people.
>
> **Rettighets-variant (tryggest):** drop the football the rooster stands on, and pose the rooster plainly standing on the ground — this moves it further from the real Tottenham emblem.

---

### Valgfritt — Man City (lyseblå)
Skipet leser greit på 48 px, men rigg-linjene kan tynnes. Hvis du regenererer: *simplify the ship's rigging to a few bold lines, fewer ropes and sails detail, so it reads at 32px.* Spot: sky blue (#6CABDD).

## Etter regenerering
Filnavnene er identiske, så de overskriver de gamle og vises automatisk i arkivet — ingen kodeendring nødvendig. Kjør gjerne lesbarhetstesten på nytt før push.
