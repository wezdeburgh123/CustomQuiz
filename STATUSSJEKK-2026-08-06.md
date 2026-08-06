# CustomQuiz — full statussjekk 6. august 2026

Kilder: repo (git), live site (customquiz.no), Google Search Console, Supabase (anon/REST), Netlify (deploys + functions + observability). Alt under er verifisert mot faktisk live tilstand, ikke lest fra tidligere logger.

---

## Kortversjon

**Driften er frisk. Innholdsmotoren har stoppet, og én konkret SEO-bug holder 138 sider ute av Google.**

Ingenting er nede, ingenting koster penger det ikke skal, ingen e-post går ut ved uhell. Men: køen for nytt innhold har vært tom siden 27. juli, VM-trafikken er borte, og en canonical-feil som ble antatt fikset 16. juli er fortsatt ikke løst — årsaken er nå funnet og verifisert.

---

## 1. Teknisk helse — GRØNT

| Sjekk | Resultat |
|---|---|
| Kjernesider (`/`, `/dagens`, `/arkiv`, `/vm`, `/fotball`, `/lag-quiz`) | Alle **200**, 250–420 ms |
| SSR-sider (`/quiz/<slug>/`, `/tema/<kat>/`, `/lag/<lag>/`) | Alle **200** |
| API-er (`/api/daily-quiz`, `/api/library-list`, `/api/featured`) | Alle **200** (1,2–1,3 s på DB-kallene, 38 ms på featured) |
| `robots.txt` | 200 |
| Netlify siste deploy | 3. aug (`main@4183c8b`) — matcher siste commit |
| Netlify feilrate | **0,00 %** siste time, 18 requests, 98,7 KB |
| Netlify functions | 36 kjører i produksjon, ingen feilende |
| Git | Ingen upushede commits, ingen ucommittede endringer |

**Live sitemap er frisk:** 474 URLer, rene URLer (ingen `.html`), 436 quizsider + 16 lag-hubber + 16 tema-sider, `lastmod 2026-08-03`. Regenereres korrekt ved hver Netlify-build.

> Merk: `sitemap.xml` i repoet er frosset på 1. juli med `.html`-URLer og mangler 55 quizsider + alle lag-hubber. Det er **kosmetisk** — build-steget overskriver den. Men den lyver hvis du leser repo-fila for å sjekke status.

### Planlagte jobber som står armert men er trygge
- **`daily-email`** — cron `0 6 * * *` er aktiv, neste kjøring 7. aug 08:00. Men koden har hard vakt på linje 32: `if (process.env.DAILY_EMAIL_ENABLED !== "true") return`. Ingen e-post sendes. *Restrisiko: hvis env-variabelen noen gang settes til `true` igjen, starter daglig utsendelse umiddelbart uten videre varsel.*
- **`vipps-charge`** — cron `0 6 * * *` aktiv. Har env-vakt (`missing.length → skipped`). No-op så lenge Vipps-nøkler mangler. Trygt.
- **`daily-quiz-generate`** — `0 20 * * *`, kjørte i natt 20:00 UTC. Frisk.
- **`library-sync`** — `30 4 * * *`. Frisk.

---

## 2. Trafikk — VM-bølgen er over

**Siste 28 dager (9/7–5/8):** 103 klikk · 2 480 visninger · CTR 4,1 % · snittposisjon 14,7
**Forrige periode:** 97 klikk · 3 280 visninger · CTR 3,0 % · pos 13,8
**Siste 3 mnd:** 192 klikk · 5 490 visninger · CTR 3,5 % · pos 13,2

Klikkene holder seg (+6), men **visningene falt 800**. Nesten hele fallet er ett cluster: *hvor langt kom norge i vm 1994* gikk fra 795 → 142 visninger. CTR-en stiger fordi den gjenværende trafikken er mer treffsikker.

**Topp sider (28 d):**

| Side | Klikk | Visn. |
|---|---|---|
| `/vm` | 14 | 439 |
| `norge-i-fotball-vm-gjennom-historien__medium` | 13 | 1 477 |
| `fotball-vm-gjennom-tidene__vanskelig` | 13 | 179 |
| `fotball-vm-gjennom-tidene__lett` | 7 | 184 |
| `/` (forsiden) | 7 | 65 |
| `klassisk-musikk-og-komponister__lett` | 7 | 35 |
| `/dagens` | 4 | 132 |
| `/vm.html` | 4 | 74 |
| `norron-mytologi__lett` | 4 | 35 |
| `manchester-united-historie-og-legender__medium` | 4 | 27 |

Evergreen (klassisk musikk, norrøn mytologi, Ibsen, Beatles, pokémon) henter høy CTR på små volum — strategien virker, men basen er for liten til å erstatte VM-volumet.

**`/vm.html` får fortsatt 4 klikk parallelt med `/vm`** — samme duplikatproblem som under.

---

## 3. Indeksering — HOVEDFUNNET 🔴

GSC Page indexing: **781 indeksert, 392 ikke indeksert.** (Google-data sist oppdatert 24. juli.)

| Årsak | Sider | Validering |
|---|---|---|
| **Duplicate without user-selected canonical** | **138** | **FEILET** (startet 9/7, feilet 25/7) |
| Not found (404) | 79 | Ikke startet |
| Excluded by 'noindex' tag | 57 | Ikke startet |
| Page with redirect | 55 | Ikke startet |
| Alternate page with proper canonical tag | 38 | Ikke startet |
| Blocked due to other 4xx | 9 | Ikke startet |
| Crawled – currently not indexed | 13 | — |
| Discovered – currently not indexed | 3 | — |

### Årsaken er funnet og verifisert

Duplikatene er nesten utelukkende gamle spiller-URLer:

```
/lag-quiz?lib=pokemon-spillet__lett
/lag-quiz.html?lib=leonardo-da-vinci__medium
/lag-quiz?lib=europas-hovedsteder__medium
/vm.html
/lag-quiz.html
... (138 totalt)
```

Jeg hentet rå-HTML fra live for `/lag-quiz?lib=pokemon-spillet__lett`:

| Signal | Verdi i rå-HTML |
|---|---|
| `<link rel="canonical">` | **finnes ikke** |
| `og:url` | `https://customquiz.no/lag-quiz?lib=pokemon-spillet__lett` ← **peker på duplikatet selv** |
| `robots` | ingen |
| canonical i DOM *etter* JS | `/quiz/pokemon-spillet__lett/` ✅ |

**To feil samtidig:**

1. Canonical-taggen settes **kun av JavaScript** (`lag-quiz.html` linje 12–14, `document.createElement('link')`). Googlebot rendrer JS, men behandler JS-injisert canonical som et svakt/upålitelig signal — og her har det beviselig ikke virket på fire uker.
2. Edge-funksjonen `netlify/edge-functions/og-quiz.js` skriver aktivt `og:url` til **duplikat-URLen**. Google får altså en side som server-side utpeker seg selv som sin egen URL, mens den kanoniske pekeren bare finnes i JS. Det motvirker fiksen.

De kanoniske målsidene er derimot helt i orden — `/quiz/pokemon-spillet__lett/` svarer 200 med statisk `<link rel="canonical" href="https://customquiz.no/quiz/pokemon-spillet__lett/">`.

### Fiksen er liten
`og-quiz.js` kjører allerede på `/lag-quiz` og `/lag-quiz.html` (`export const config = { path: [...] }`), og slår allerede opp quizen via `/api/library-get`. Den trenger to endringer i samme rewrite-kjede som alt finnes:

1. Injiser `<link rel="canonical" href="https://customquiz.no/quiz/<slug>/">` i `<head>` server-side.
2. Endre `og:url` fra `?lib=`-URLen til `https://customquiz.no/quiz/<slug>/`.

Deretter: be om **ny validering** i GSC (den forrige feilet før fiksen var på plass, og er ikke startet på nytt siden).

**Effekt hvis det virker:** 138 sider som i dag ikke serveres på Google i det hele tatt, konsolideres inn i sider som allerede rangerer.

---

## 4. Supabase — innhold og faktisk bruk

| Måltall | Verdi |
|---|---|
| `quiz_library` | **437** quizer, alle `published`, alle `review_status = auto_ok` |
| — mangler `hero_img` | **195 (45 %)** 🟡 |
| — `free = true` | 74 (17 %) |
| — ikke `grounded` | 2 |
| `daily_quiz` | 927 rader / 68 unike datoer (31. mai – 6. aug) = 16 kategorier per dag — men se rettelsen under: dette er **kopier fra arkivet**, ikke ny generering |
| Totale `plays` | **814** fordelt på 335 quizer |
| Quizer aldri spilt | **102** |
| `page_views`, `profiles`, `leagues` | Lest av RLS (deny for anon) — som designet |

**Topp spilte quizer:**

| Quiz | Plays |
|---|---|
| `dinamo-reklamebyra+geografi__medium` | 13 |
| `verdens-farligste-fisker__lett` | 13 |
| `legender-i-bokseringen-opp-gjennom-tidene__medium` | 12 |
| `quiz-om-artisten-igorrr__medium` | 11 |
| `lokalhistorien-til-hjembyen-min-bronnoysund__medium` | 11 |
| `fotball-vm-gjennom-tidene__lett` | 10 |
| `manchester-united-historie-og-legender__medium` | 10 |

**Det interessante her:** de mest spilte quizene er i hovedsak *egengenererte / personlige* quizer (Dinamo, Igorrr, Brønnøysund, Tromsø, Zuma) — ikke SEO-quizene. SEO-innholdet henter visninger og klikk, men konverterer i liten grad til faktisk spilling. Det er to nesten uavhengige trafikkmønstre.

**RETTET 6.8. samme kveld — «kostnad vs. nytte på dagensquizen»:** Jeg skrev først
at 16 AI-genererte quizer per natt var mye modellkjøring for 4 klikk. **Det var
feil.** `daily-quiz-generate.js` genererer ingenting i normal drift — den plukker
eksisterende quizer fra `quiz_library` (`pickFromLibrary`), deterministisk rotert
på dato. Null API-kall, ingen kostnad. API-generering skjer kun i
`ensureFallback()` hvis en dato ender med null utgaver.

Bevis: 927 rader har bare **276 unike titler**, og **269 av dem finnes allerede i
`quiz_library`** (7 avvik, trolig fallback-genererte fra slutten av mai da
arkivet var tomt). Se `DAGENS-GJENBRUK-plan.md` for query og full retting.

Konsekvens: det finnes ingen kostnad å kutte her, og ingen skjult
innholdsressurs å hente ut av `/dagens`. Punkt 8 i prioriteringslista under
utgår.

**Repo-drift:** `quiz-library/library.ndjson` har 402 linjer, DB har 437. 35 quizer finnes bare i databasen. `STATUS.json` sier «alle 402 emner i topics.json er generert» — den tellingen er utdatert som bilde av hva som er live.

---

## 5. Innholdsmotoren har stoppet 🟡

- `customquiz-nattskift` — **disabled**, sist kjørt 27. juli
- `customquiz-nattlig-generering` — **disabled**, sist kjørt 1. juni
- `topics.json` — **tom kø**, alle 402 emner oppbrukt
- `customquiz-gsc-ukesjekk` + `gsc-ukesrutine-customquiz` — **aktive**, kjørte 3. aug, neste 10. aug

Rutinen som *foreslår* innhold går altså hver mandag, men rutinen som *lager* det er skrudd av og har ingenting å lage. Resultatet er synlig i loggene: **«Kroppen for nysgjerrige» er foreslått tre uker på rad (25/7, 27/7, 3/8) og fortsatt ikke laget** — samtidig som anatomi-clusteret vokser (29 → 42 visninger).

Alle KLAR-FOR-ARKIV-seriene er derimot merget inn (verifisert slug for slug: barn-dyr 6/6, barn-monstere 6/6, barn-spill 6/6, gsc-forslag 10/10, seo-gsc 11/11). Minnet mitt sa disse ventet på merge — det var utdatert.

---

## 6. Hva burde vært gjort — prioritert

### P1 — gjør nå
1. **Canonical-fiksen i `og-quiz.js`** (2 endringer, 1 fil). Låser opp 138 sider. Klart høyest avkastning per innsats i hele lista.
2. **Be om ny validering** av «Duplicate without user-selected canonical» i GSC etter deploy.
3. **Lag «Kroppen for nysgjerrige»** (lett, kategori kropp). Foreslått 3× på rad, 42 visninger, største reelle dekningsgap.

### P2 — denne/neste uke
4. **Fyll `topics.json` med nye emner og skru på `customquiz-nattskift` igjen.** Uten dette produseres ingenting, uansett hvor gode GSC-forslagene er.
5. **Backfill `hero_img` for 195 quizer.** Nesten halve arkivet vises uten cover.
6. **`/dagens`-optimalisering** — *dagens quiz* har 35 visninger og 0 klikk på pos ~14. Eget merkevaresøk bør ligge topp 3.
7. **Hovedsteder- og fylker-clusteret** (75 + 22 visninger) — posisjonssak, ikke innholdssak. Match tittel/H1 mot «hovedsteder quiz med svar», internlenk fra kontinent-quizene.

### P3 — vurder
8. ~~**Kutt antall dagens-kategorier** fra 16 til 3–5.~~ **UTGÅR** — bygget på feil premiss. Dagensutgavene koster ingenting (rotasjon fra arkivet, ikke generering). Å kutte antall kategorier frigjør ingen kapasitet; det er bare et produktvalg om bredde. Se rettelsen over.
9. **Synk `library.ndjson` fra DB** (402 → 437) så repoet igjen speiler live.
10. **Undersøk de 79 404-ene** i GSC — sannsynligvis gamle VM-/event-URLer, men ubekreftet.
11. **301 i stedet for 200 på `.html`-variantene** (`/vm.html`, `/arkiv.html`, `/dagens.html`, `/lag-quiz.html`). De har riktig canonical i dag, så det er ikke akutt, men 301 er et sterkere signal og `/vm.html` henter fortsatt klikk parallelt med `/vm`.
12. **Vurder å fjerne cron-en på `daily-email`** helt, ikke bare env-vakten. Den er trygg nå, men står armert.

---

## Åpne spørsmål jeg ikke kunne svare på
- **Faktisk besøkstall** (ikke bare søketrafikk) — `page_views` er RLS-beskyttet for anon-nøkkelen. Trengs service_role eller Supabase-dashboardet for å lese trafikktelleren som ble bygget 15. juli.
- **Om `daily-email` og `vipps-charge` faktisk logger «skipped»** — Netlify beholder function-logger i bare 24 t, og loggpanelet var tomt. Konklusjonen om at de er trygge bygger på kodevaktene, som jeg leste og verifiserte, ikke på observerte kjøringer.
- **Supabase Advisors/lint-status** — ikke sjekket denne runden (krever dashboard-innlogging). Sist gjennomgang 19. juni.

---
*Kjørt 6. august 2026. Produktnavn: Allmennkunnskap (dobbel l, dobbel n). Ingen endringer er gjort i kode, database eller live site under denne sjekken — dette er ren diagnose.*
