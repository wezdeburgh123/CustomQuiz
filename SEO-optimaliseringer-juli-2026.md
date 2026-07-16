# SEO-optimaliseringer — GSC-drevet runde, juli 2026

Oppsummering av alt vi gjorde i den GSC-drevne SEO-runden (9.–12. juli 2026).
Utgangspunkt: Search Console viste ~94 klikk / 3 000+ visninger på 3 mnd, snittposisjon ~13,
og at fotball/VM + geografi dominerte etterspørselen — men med lav CTR (mange visninger, få klikk).

---

## 1. Nytt innhold (11 nye quizer, alle `free:true`, faktasjekket mot web)

Kilde-fil: `quiz-library/seo-gsc-serie-KLAR-FOR-ARKIV.ndjson` → merget via
`quiz-library/merge-seo-gsc-serie.py` → `library.ndjson` → sync til Supabase → SSR-sider.

| Quiz (slug) | Kategori | Målsøk |
|---|---|---|
| `norge-i-vm-1994__lett` | fotball | «hvor langt kom norge i vm 1994» (757 vis!) |
| `norge-i-vm-1998__lett` | fotball | «hvor langt kom norge i vm 1998» |
| `fotball-vm-2026-alt-du-ma-vite__lett` | fotball | «vm quiz 2026» |
| `verdens-geografiske-rekorder__lett` | geografi | «verdens lengste elv», «geografi quiz» |
| `beromte-vikinger__lett` | historie | viking-nostalgi |
| `norron-mytologi__lett` | historie | «norrøn mytologi quiz» (rangerer alt pos 9) |
| `vikingenes-tokt-og-slag__lett` | historie | vikingtokt/-slag |
| `tour-de-france-rekorder-og-legender__lett` | sport | Tour de France (pos 5,5 for nabo-side) |
| `norske-syklinghelter__lett` | sport | norske syklister |
| `beromte-komponister__lett` | musikk | klassiske komponister |
| `romerske-keisere__lett` | verdenshistorie | romersk historie |

Prinsipp: for de temaene som ALLEREDE rangerte bra (klassisk musikk, Romerriket, Pokémon)
lagde vi IKKE duplikater — vi bygde ikke-overlappende utvidelser (topical dybde), for ikke å kannibalisere.

---

## 2. Tekniske søke-optimaliseringer (i `scripts/build-quiz-pages.mjs`)

### a) Kortere `<title>`-mal — commit `6a9bf34`
Google kutter titler ved ~60 tegn. Halen «— quiz med N spørsmål | CustomQuiz» dyttet
temaordene ut. Ny trinnvis mal beholder mest mulig info uten kutting; 346/353 titler ≤ 60 tegn.

### b) Søkeintensjons-meta på høy-visnings-sider — commit `6a9bf34`
Meta-beskrivelsene (lede i `library.ndjson`) skrevet om så de svarer på søket og fyller ~155 tegn.
**Resultat:** `norge-i-fotball-vm-gjennom-historien` (1 100+ visninger) gikk fra
**CTR 0,5 % → 3,6 %** på 7 dager. Dette var rundens tydeligste gevinst.

### c) Per-klubb lag-hubber `/lag/<slug>/` — commit `8c42508`
16 nye SSR-hubber (Liverpool, Rosenborg, Brann, …) med unik tittel «<Klubb>-quiz — N quizer»,
søke-meta, canonical, JSON-LD ItemList, klubb-crest og kort til alle klubbens quizer.
Lagt i sitemap. Klubbquiz-breadcrumbs fikk ekstra nivå (Hjem › Arkiv › Fotball › <Klubb> › quiz)
→ interne lenker inn til hubbene. `themePageHtml` ble parameterisert (samme mal for tema + lag).

### d) Dele-knapp — commit `8c42508`
«Del denne siden» på både lag- og tema-sider (native del-dialog på mobil, kopier-lenke på desktop).

### e) Practice Problems (schema.org Quiz) — commit `717b470` → REVERTERT `479e12d`
La `acceptedAnswer` i JSON-LD for å kvalifisere til Googles «Practice problems»-rike-resultat.
Oppdaget så at Google FASER UT den strukturdata-typen → reverterte (ingen grunn til å eksponere
fasit for en døende funksjon). Fasiten er igjen skjult (kun klientlastet bak «Vis fasit»).
«1 invalid item»-varselet i GSC rydder seg selv når typen fases ut.

---

## 3. GSC-tiltak gjort
- Reindeksering bedt om for de 6 første SEO-sidene (URL-inspeksjon → «Request indexing»).
- Sitemap re-lest (regenereres uansett ved hver deploy; nye sider + lag-hubber er med).
- **Ukentlig automatisk GSC-rapport** satt opp: kjører mandager ~09:00 (`customquiz-gsc-ukesjekk`).

## 4. Målte resultater (per 12.7.26)
- CTR-fiks virker: 0,5 % → 3,6 % på den største visnings-siden.
- Nye sider indekseres raskt: `norron-mytologi` alt på pos 9.
- Snittposisjon ser midlertidig høyere ut (nye sider entrer lavt og drar snittet ned mens de modnes) — normalt.
- NB: VM 2026-trafikk var kunstig høy under mesterskapet (til 19.7) og faller etterpå;
  evergreen-innholdet (VM 1994/1998-nostalgi, geografi, viking, sykkel, komponister, keisere) er det som bærer videre.

## 5. Åpne muligheter / neste steg
- Reindeksering av de 5 nyeste sidene (VM 1998 + 4 evergreen) — nudge, ellers fanges de av sitemap.
- Cover-grafikk til de nye sidene (hus-stil-prompt finnes; se `chatgpt-master-prompt-kategoribilder.md`).
- Lenke fra `/fotball` (fotball.html) til lag-hubbene — så brukere finner dem, ikke bare via breadcrumb.
- Flere sykkel-quizer (sterkeste ikke-VM-vinner, årlig tilbakevendende).
- Dele-knapp også på selve quiz-sidene.

## 6. Lærdommer / gotchas
- **git-lås:** gjenglemte `.git/index.lock` / `HEAD.lock` blokkerte commits gjentatte ganger. Fiks: `rm -f .git/index.lock .git/HEAD.lock`.
- **CDN-cache-felle:** å hente en side som ennå ikke er bygd rett etter deploy kan cache en TOM respons på Netlify-kanten, som serveres stale selv etter at bygget er ferdig. Bruk `?v=…` cache-buster for ferskt hent. Ikke feilslutt at en side «mangler i bygget».
- **`sync-library` rører ikke `review_status` eller `hero_img`** (bevisst) — trygt å endre lede/tittel uten å nulle AI-cover eller moderering.
- **Practice Problems fases ut** av Google — ikke jag den typen rikt resultat.
