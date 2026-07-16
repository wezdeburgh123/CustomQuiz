# CustomQuiz — SEO & trafikk: status + neste steg (16.–17. juli 2026)

Samlet logg fra GSC-økta, så vi kan forbedre videre senere. Se også detaljfilene:
`SEO-canonical-fix-2026-07-16.md`, `SEO-ukesrapport-2026-07-16.md`,
`SEO-optimaliseringer-juli-2026.md`.

---

## Hva vi gjorde denne økta (LIVE)

**Diagnose i GSC (Page indexing, data t.o.m. 14.7):** 760 indeksert / 320 ikke.
To stigende drag: «Duplicate without user-selected canonical» (142) og «Not found 404» (83).

**Fikset og deployet (commit 5febcd8 + 9e086e3, verifisert live):**
1. Statisk `rel=canonical` på `index.html`, `vm.html`, `arkiv.html`, `dagens.html`
   (vm-en sin `og:url` rettet `/vm.html` → `/vm`).
2. Sitemap-kilden (`scripts/build-quiz-pages.mjs`) bruker rene URL-er — matcher canonical.
3. `netlify.toml`: `/tema` + `/tema/` → 301 `/arkiv` (fjernet 404 på tema-roten).
4. Verifisert etter deploy: canonical korrekt på alle 4, `/tema`→`/arkiv` (200),
   sitemap har 0 `.html`-hovedsider.

**Verifisert rent (ingen tiltak nødvendig):**
- Manual actions: No issues. Security issues: No issues.
- Core Web Vitals: «not enough data» (for lite trafikk ennå — ikke en feil).
- `quiz-app-v2`-redirect (fra 9.7) funker live → de 83 404-ene rydder seg ved rekrawl.
- Pretty URLs er PÅ: `/vm /dagens /lag-quiz /arkiv /fotball` serverer alle 200 på ren sti.

**Også deployet samme økt (urelatert, verifisert trygt):** personvernvennlig
trafikkteller (nav.js-beacon → `track.js` → `page_views`), dagens del/utfordring,
`og-dagens.js` edge-preview, lokal cover-logikk. Supabase-migrasjonen
`db/migration-page-views.sql` KJØRT 17.7 — telleren er fullt live.

---

## Trafikk-snapshot (28 dager, 17.6–14.7)

- **111 klikk / 3 660 visninger / CTR 3,0 % / snittposisjon 13,1.**
- Trend opp fra lansering, men lavt volum og side-2-posisjoner.
- **VM/fotball dominerer** topp-sidene. Evergreen (geografi, viking, anatomi,
  allmennkunnskap) har mange visninger med 0 klikk = uforløst potensial.

---

## Neste steg / backlog (prioritert)

1. **[Høyest gevinst] CTR på `norge-i-fotball-vm-gjennom-historien__medium`.**
   1 400+ visninger, posisjon ~10, men CTR ~0,9 %. Skriv tittel + meta som svarer
   direkte på «Hvor langt kom Norge i VM 1994?» (søket den faktisk rangerer på).
   Vurder intern lenking/konsolidering mot den nye `norge-i-vm-1994__lett`-sida så
   ett URL eier søket.

2. **Løft evergreen-geografi.** «hovedsteder i verden quiz» (pos 36–40),
   «verdens lengste elv» (pos 26) — mange visninger, ingen klikk. Styrk innhold +
   intern lenking for å dytte disse fra side 3–4 opp mot side 1.

3. **Overvåk GSC ~1–2 uker:** faller Duplicate (142) og 404 (83)?
   - Hvis `?lib`-duplikatene IKKE faller: JS-canonical honoreres tregt av Google →
     bygg server-side canonical for `/lag-quiz?lib=` via edge-funksjon (samme mønster
     som `og-quiz.js` / `og-dagens.js`).

4. **Be om reindeksering** i GSC for `/`, `/vm`, `/arkiv`, `/dagens` (URL-inspeksjon
   → Request indexing) for å fremskynde konsolideringen.

5. **Fra `SEO-optimaliseringer-juli-2026.md` (fortsatt åpent):** cover-grafikk til de
   nyeste sidene; lenke fra `/fotball` til lag-hubbene; flere sykkel-quizer (sterkeste
   ikke-VM-vinner); dele-knapp på selve quiz-sidene.

6. **Bruk den nye trafikktelleren:** `select * from public.page_views order by day desc;`
   — nå har vi egne sidevisnings-tall (uavhengig av GSC-søk) å styre etter.

---

## Gotchas / husk
- `dagens.html` og `build-quiz-pages.mjs` hadde ucommittede endringer fra en annen
  økt (del/utfordring + cover) — de er nå committet sammen. Sjekk alltid full diff
  før commit her.
- CDN-cache: hent med `?v=…` / `cache:no-store` rett etter deploy for ferskt svar.
- `.git/index.lock` kan henge igjen og blokkere commit → `rm -f .git/index.lock`.
