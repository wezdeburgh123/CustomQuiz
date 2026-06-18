# SEO- og trafikkplan for CustomQuiz

_Skrevet 18. juni 2026. Utgangspunkt: konkurranseanalyse av quizbladet.no + gjennomgang av customquiz.no sitt nåværende SEO-oppsett._

---

## Kortversjonen (les denne hvis du har 2 minutter)

Konkurrenten vinner ikke på design eller kvalitet — de vinner på **antall crawlbare sider**. quizbladet.no har ~70 egne URL-er (`/quiz/javascript-quiz`, `/quiz/geografi-quiz`, `/quiz/allmennkunnskap` …). Hver er en søkemotor-dør inn til siden.

CustomQuiz har **225 quizer av bedre kvalitet, men ingen av dem er egne sider.** De ligger alle bak `quiz-app-v2.html?lib=<slug>` — én JS-side med 225 usynlige varianter. Google indekserer URL-er, ikke databaserader. Derfor finnes du nesten ikke i søk i dag (sitemap = 5 sider).

**Den ene tingen som betyr mest:** gi hver arkiv-quiz en ekte URL (`customquiz.no/quiz/<slug>`) med ferdig-rendret innhold og egen tittel. Det gjør 225 innholdsbiter om til 225 sider over natta. Alt annet under er sekundært.

Og: **VM-vinduet er nå.** Fotball- og VM-søk topper akkurat denne måneden. Det er gratis, ferskt trafikkpotensial som forsvinner når mesterskapet er over — prioriter det parallelt.

---

## Slik er det i dag (diagnose)

**CustomQuiz (customquiz.no)**
- Statisk HTML på Netlify — i utgangspunktet bra for SEO (crawlbart).
- MEN: sitemap har kun 5 URL-er (forside, dagens, vm, arkiv, generator).
- Arkivets 225 quizer spilles via `quiz-app-v2.html?lib=<slug>` og `?quiz=<id>` — query-parametere på ÉN side. Google behandler dette som én tynn side, ikke 225.
- Innholdet (selve spørsmålene) lastes fra Supabase via JS → en crawler som ikke kjører JS ser en tom side.
- SEO-grunnmur (robots.txt + Search Console + DNS-verifisering) er på plass siden 10.–11. juni. Det er starten, ikke målet.

**quizbladet.no (konkurrenten)**
- ~70 crawlbare URL-er: `/quiz/<nøkkelord-slug>`, ofte FLERE per tema (`allmennkunnskap`, `allmennkunnskap-2`, `geografi-quiz`, `geografi-quiz-2`).
- Nøkkelord-tunge titler: «Gratis quizer | Quizbladet.no — quiz spørsmål og svar».
- Egne landingssider for søkbare termer: `kahoot spørsmål med svar`, `quiz for barn`, kategori-quizer.
- Domenet er fra des. 2021 → ~4,5 års forsprang på autoritet og indeksering.
- Tjener på Google AdSense → hele siden er bygget for trafikkvolum, ikke produktopplevelse.

**Konkurransefeltet ellers:** quizer.no, quizeksperten.no, lykkelighjem.com — alle rene innholds-/SEO-sider som rangerer på «quiz spørsmål og svar». Det er et innholdsspill, og det kan vinnes med bedre + flere sider.

---

## Prioritert tiltaksliste

### 🔴 P0 — Gjør arkivet indekserbart (størst effekt, gjør dette først)

**Mål:** hver quiz får en ekte URL: `customquiz.no/quiz/<slug>` med ferdig-rendret HTML (spørsmål, tittel, meta) — ikke bare et JS-skall.

Tre mulige måter (jeg anbefaler nr. 1):

1. **Statisk pre-render ved nattlig sync (anbefalt).** Arkivet genereres allerede nattlig (`library-sync`). Utvid det skrittet til også å skrive en statisk `/quiz/<slug>/index.html` per quiz inn i repoet, med:
   - ekte `<title>` og `<meta description>`,
   - hele spørsmålsteksten synlig i HTML (for crawler),
   - en knapp/JS som starter den interaktive spillopplevelsen for mennesker.
   Fordel: ingen ekstra runtime-kostnad, rask å crawle, robust.

2. **SSR via Netlify-funksjon.** `/quiz/:slug` rewrites til en funksjon som henter quizen fra Supabase og returnerer ferdig HTML. Fordel: alltid fersk. Ulempe: en funksjon-kjøring per sidevisning.

3. **Prerender-tjeneste** (f.eks. Netlify sin prerendering for crawlere). Raskest å skru på, men minst kontroll.

→ **Dette kan jeg bygge for deg** (alternativ 1 eller 2). Du trenger bare å pushe + deploye etterpå.

### 🔴 P0 — Auto-generert sitemap fra arkivet

Sitemap skal liste alle 225 quiz-URL-ene + kategori-sider + de 5 hovedsidene — ikke 5 håndskrevne linjer. Genereres i samme nattlige skritt som over. Send inn på nytt i Google Search Console når den er live.

### 🟠 P1 — Unike titler + meta + structured data per quiz

Hver quiz-side bør ha:
- **Tittel** etter mønster: `Geografi-quiz: 20 spørsmål om verdens hovedsteder | CustomQuiz`
- **Meta description** som lokker til klikk.
- **Schema.org `Quiz`/`FAQPage` JSON-LD** → kan gi «rikt resultat» i Google og mer plass i trefflista.

### 🟠 P1 — Kategori-landingssider

Lag indekserbare `/quiz/kategori/geografi`, `/quiz/kategori/musikk` osv. som lister alle quizer i kategorien. De fanger de brede søkene («geografi quiz», «musikkquiz») som konkurrenten lever av.

### 🟠 P1 — Eier ordet «Allmennkunnskap»

quizbladet har allerede `/quiz/allmennkunnskap`. Det er DITT hjemmebane-ord (merket ditt er bygget på allmennkunnskap-kvalitet). Lag den klart beste allmennkunnskap-siden på norsk — lang, fersk, oppdatert daglig via dagens-quizen. Dette er en kamp du bør vinne på kvalitet.

### 🟢 P2 — Mål «penge-søkene» med egne sider

Basert på hva folk faktisk søker i norsk quiz-verden:
- `quiz spørsmål og svar` (stor, generisk)
- `gratis quiz`
- `[tema] quiz` — film, musikk, sport, fotball, historie, geografi, gaming …
- `kahoot spørsmål med svar` (lærere/arrangører søker dette mye)
- `quiz for barn`
- `pub quiz spørsmål`

Hver fortjener en dedikert, innholdsrik landingsside. Konkurrenten har bevist at de rangerer.

### 🟢 P2 — Bing Webmaster Tools + teknisk hygiene

Meld inn sitemap i Bing også (rask gevinst). Sjekk at quiz-innhold er synlig uten JS for crawlere (henger sammen med P0).

---

## VM-vinduet — gjør dette NÅ (tidssensitivt)

VM pågår. Fotball- og VM-relaterte søk topper denne måneden og forsvinner etterpå. Du har allerede VM-modulen og pre-game-quiz-maskineriet.

1. **Egne, indekserbare sider per kamp/lag:** `/quiz/vm-2026-norge`, `/quiz/fotball-quiz`, `/quiz/<lag>-quiz`. Pre-game-quizene du allerede lager bør bli faste URL-er, ikke bare flis i VM-modulen.
2. **Del i fotball-miljøer FØR kampene:** norske fotball-Facebook-grupper, relevante subreddits, Jodel. Del selve quizen (verdi først), lenke sekundært.
3. **«Slå min score»-delelenken** du allerede har bygget er den virale motoren — sørg for at den deles automatisk fra hver VM-quiz.

---

## Organisk + ærlig posting (du er allerede i gang — slik gjør du det riktig)

Prinsipp: **vær en deltaker som deler noe bra, ikke en annonse.** Norske miljøer lukter selvpromo på lang avstand og straffer det hardt.

- **Del selve quizen, ikke «sjekk ut siden min».** En faktisk god dagsquiz eller VM-quiz er verdien; lenka følger med.
- **Riktige steder:** Facebook quiz-/pub quiz-grupper, lærer-grupper (Kahoot-alternativ-vinkel), fotball-grupper (VM nå), Jodel, nisje-subreddits (r/oslo o.l. — vær varsom i r/norge med selvpromo-regler).
- **Kahoot-vinkelen er undervurdert:** mange lærere/arrangører søker «kahoot spørsmål med svar». En side som gir ferdige norske quiz-spørsmål de kan bruke = god deling i lærer- og arrangør-grupper.
- **Bygg e-post-lista (Brevo):** retention slår akkvisisjon. Daglig quiz + streak gir grunn til å komme tilbake.
- **Få deg listet** der quizer.no / quizeksperten.no nevnes (lenker = autoritet).
- **Konsistens > kampanje:** del en god quiz jevnlig over uker, ikke ett stort støt.

---

## Foreslått rekkefølge

1. **Denne uka (VM-vindu):** egne URL-er for VM/fotball-quizer + del dem i fotball-miljøer før kampene.
2. **P0:** pre-render hele arkivet til `/quiz/<slug>`-sider + auto-sitemap → send inn i Search Console.
3. **P1:** titler/meta/schema + kategori-sider + en knallsterk Allmennkunnskap-side.
4. **P2:** landingssider for penge-søkene + Bing.
5. **Løpende:** organisk deling (quiz-først) + e-postliste.

---

## Hva jeg kan bygge for deg vs. hva du gjør selv

**Jeg kan bygge (du pusher + deployer etterpå):**
- Pre-render-skrittet som lager `/quiz/<slug>`-sider av arkivet.
- Auto-generert sitemap fra Supabase-arkivet.
- Tittel/meta/JSON-LD-maler per quiz.
- Kategori-landingssider.

**Du gjør selv (jeg kan ikke / bør ikke):**
- Pushe + deploye (git fra din Terminal — jeg gir deg ferdige kommandoer å lime inn).
- Sende inn sitemap på nytt i Google Search Console (jeg kan evt. gjøre dette i nettleseren din hvis du vil).
- Melde inn i Bing Webmaster Tools.
- Selve den organiske postingen (din stemme, dine miljøer).
