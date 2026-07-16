# SEO-fiks — canonical + 404-rydding (16. juli 2026)

GSC-drevet runde. Utgangspunkt fra Page indexing (data t.o.m. 14.7):
760 indeksert / 320 ikke-indeksert. To reelle drag, begia stigende:

- **Duplicate without user-selected canonical — 142 sider (stigende).**
  Årsak: `.html`-varianter (`index.html`, `vm.html`, `arkiv.html`, `dagens.html`)
  vs. ren URL, PLUSS `/lag-quiz?lib=<slug>` dele-visninger som dupliserer den
  kanoniske `/quiz/<slug>/`-siden.
- **Not found (404) — 83 sider (stigende).**
  Årsak: gamle `quiz-app-v2?lib=` / `?quiz=`-lenker + `/tema/`-roten.

## Verifisert rent (ingen tiltak nødvendig)
- **Manual actions:** No issues detected.
- **Security issues:** No issues detected.
- **Core Web Vitals:** «Not enough usage data» (for lite CrUX-trafikk ennå — ikke en feil).
- **quiz-app-v2-redirect:** LIVE og fungerer. `/quiz-app-v2?lib=vikingtiden__medium`
  → 301 → `/quiz/vikingtiden__medium/`. De 83 404-ene er fra crawl FØR 9.7-fiksen og
  rydder seg selv ved neste rekrawl.
- **Pretty URLs er PÅ:** `/vm`, `/dagens`, `/lag-quiz`, `/arkiv`, `/fotball` serverer
  alle 200 på ren sti (testet live 16.7).

## Endringer gjort (lokalt — IKKE pushet)
1. **`index.html`** — la til `<link rel="canonical" href="https://customquiz.no/">`.
2. **`vm.html`** — la til canonical `/vm`; rettet `og:url` fra `/vm.html` → `/vm`.
3. **`arkiv.html`** — la til canonical `/arkiv` (konsoliderer også filtrerte `/arkiv/*`-visninger).
4. **`dagens.html`** — la til canonical `/dagens`.
5. **`scripts/build-quiz-pages.mjs`** — sitemap-kilden bruker nå rene URL-er
   (`/dagens`, `/vm`, `/arkiv`, `/lag-quiz`) i stedet for `.html`, så sitemap og
   canonical peker likt.
6. **`netlify.toml`** — `/tema` og `/tema/` (kun roten) → 301 til `/arkiv`.
   De ekte `/tema/<kategori>/`-sidene er urørt (ingen wildcard).

`lag-quiz.html` er bevisst IKKE rørt: den har allerede JS-injisert canonical til
`/quiz/<slug>/` for `?lib`. En ekstra statisk canonical ville kollidert (to
canonicals = Google ignorerer begge).

## Gjenstår (krever deg)
1. **Gå gjennom diffen og commit + push.** NB: `dagens.html` og `build-quiz-pages.mjs`
   hadde ucommittede endringer fra før — mine ligger oppå. Sjekk hele diffen.
2. Etter deploy: be om reindeksering i GSC for `/` , `/vm`, `/arkiv`, `/dagens`
   (URL-inspeksjon → Request indexing), ellers fanges de av sitemap.
3. Om ~1–2 uker: sjekk at «Duplicate»- og «404»-tallene i Page indexing faller.
   Hvis `?lib`-duplikatene IKKE faller, vurder server-side canonical via edge-funksjon
   (samme mønster som `og-quiz.js`) — JS-canonical honoreres tregt/ustabilt av Google.

## Trafikk-kontekst (28 dager, 17.6–14.7)
111 klikk / 3 660 visn / CTR 3,0 % / pos 13,1. Trend opp fra lansering, men lavt
volum og side-2-posisjoner. VM/fotball dominerer; evergreen (geografi, viking,
anatomi, allmennkunnskap) har mange visninger med 0 klikk = løftemulighet.
