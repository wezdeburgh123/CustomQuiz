# Layout/bredde — status & overlevering

_Sist oppdatert: 8. juni 2026. Skrevet for å overlevere til parallell chat._

## Hva som ER gjort (commitet + pushet til main, live via Netlify)

Commit `2dc72fd` — **"Enhetlig sidebredde: delt layout.css (lese 760 / galleri 1080)"**

- Ny fil `layout.css` = single source of truth for bredde/sentrering/sidepadding.
  - To kanoniske bredder: `--w-read: 760px` (lesing), `--w-wide: 1080px` (galleri).
  - `.container` / `.wrap` bruker `max-width: var(--container-max, var(--w-wide))`.
  - En side velger lese-bredde ved `--container-max: var(--w-read)` i sin egen `:root`.
  - Sidepadding fluid: `--grid-pad-x: clamp(20px, 5vw, 56px)`.
- Fjernet ad-hoc per-side bredder. Før → etter:
  - arkiv.html: 1080 → 1080 (galleri, uendret verdi, nå via layout.css)
  - index.html: 1080 (galleri, ingen override)
  - vm.html: **920 → 760** (lese)
  - dagens.html: **640 → 760** (lese)
  - quiz-app-v2.html: 760 → 760 (lese)
  - min-side.html: 760 → 760 (lese)
- Filer i commit: `layout.css` (ny) + `arkiv.html vm.html dagens.html quiz-app-v2.html min-side.html`.
- IKKE rørt: usporede filer `VM-LAUNCH-plan.md`, `VM-fotball-prompt.md`, `db/sjekk-migrasjoner.sql`.

> Merk: Christian måtte kjøre git lokalt i terminal — sandkassen kunne ikke fullføre commit/push (stale `.git/index.lock`, "Operation not permitted" på .git-mappa). Push gikk gjennom lokalt: `c6778df..2dc72fd main -> main`.

## Problemet som GJENSTÅR (ny melding fra Christian)

Han ser fortsatt «veldig varierende bredder som spretter frem og tilbake», og vil ha
**mer stabil bredde ift. nettleserstørrelse — sømløst og responsivt.**

Diagnose (fra kode):

1. **Scrollbar-hopp (bug).** Ingen side har `scrollbar-gutter`. Kort side (ingen scrollbar)
   → lang side (scrollbar) gir ~15px sidelengs hopp på midtstilt innhold. Klassisk «spretting».
   Fix: `html { scrollbar-gutter: stable; }` i `layout.css` — én linje, gjelder alle sider.
2. **To faste bredder (760 vs 1080).** Navigering galleri↔lese spretter hele kolonnen ~320px.
   Bevisst designvalg, men trolig det Christian opplever som ustabilt.

## VALGT (endelig): UNIFORM 1080-bredde overalt — 8. juni 2026

Christian landet på den enkleste modellen: **alt har samme bredde som arkivet (1080)**.
Ingen lese/galleri-forskjell, ingen `.reading`/`.measure`. Ramme + masthead står dermed
identisk på alle sider → null «spretting».

Implementert i arbeidstreet (på branch `layout-fluid-frame`, ny commit oppå 3ec05d6):

- `layout.css`:
  - `html { scrollbar-gutter: stable; }` → dreper ~15px-hoppet (universell gevinst).
  - INGEN `.reading`-regel (det var et mellomsteg som ble forkastet).
- Lese-sider (`dagens/min-side/quiz-app-v2/vm`): FJERNET `--container-max: var(--w-read)`
  fra `:root` → faller til `--w-wide` = 1080, lik arkivet. (Ingen `reading`-klasse.)
- `nav.js`: URØRT.
- Galleri-sider (`index/arkiv`): ingen endring (var 1080 fra før).

NETTO endring fra `2dc72fd` (origin/main): `scrollbar-gutter` + lese-sidene 760 → 1080.
Filer: `layout.css dagens.html min-side.html quiz-app-v2.html vm.html`.

**Bevisst konsekvens:** «maks 760 / avis-følelse» som var låst i designsystemet er nå
reversert — lesetekst/spørsmål på dagens/vm/min-side får bredere linjer (1080). Christian
godtok dette eksplisitt for enkelhets skyld.

**MÅ VERIFISERES live etter merge:** lik bred ramme/masthead overalt, ingen scrollbar-hopp,
og at lengre brødtekst (dagens-intro, vm-lede) ikke blir ubehagelig vid på desktop.

Forkastede alternativer: «bred ramme + tekst på 760» (.reading), B (to mykere bredder),
C (kun scrollbar-fiks), 100vw-masthead-breakout i nav.js.

## Relevante filer
- `layout.css` — delt bredde-grid (her hører scrollbar-gutter + ev. fluid-modell hjemme)
- `nav.js` — delt masthead, ligger inni `.container`/`.wrap`, følger container-bredden (OK)
- Lese-sider: `vm.html`, `dagens.html`, `quiz-app-v2.html`, `min-side.html`
- Galleri-sider: `index.html`, `arkiv.html`
