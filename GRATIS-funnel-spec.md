# CustomQuiz — Gratis-funnel & post-Dagens-ruting (spec)

**Dato:** 7. juni 2026
**Mål:** La nye brukere smake nok gratis (på e-post-abo) til å bli hektet, og fange momentet rett etter Dagens for å rute videre — før betalingsmuren slår inn.

Denne specen forutsetter at paywallen faktisk skrus på (`REQUIRE_SUBSCRIPTION` er `false` i dag). Det er her gating-logikken bygges, ikke bare kosmetikk.

---

## 1. Tilgangsnivåer

| Nivå | Hvem | Får tilgang til |
|------|------|-----------------|
| **Anonym** | ingen innlogging | Dagens (alltid gratis) |
| **E-post-abo** | logget inn (OTP), ikke betalende | Dagens + hele gratis-biblioteket (§2) + **3 egne «Lag din egen»-quizzer** (teaser-kvote, så mur) + **VM (gratis hele veien)** |
| **Premium** | aktivt abonnement | Alt: hele arkivet, ubegrenset «Lag din egen», VM |

**VM er gratis for alle nivåer** — bevisst hook, aldri bak mur.

Tre-nivå-gaten finnes allerede i `_quizcore.checkSubscription` (ÅPEN / LOGIN / ABONNEMENT). Det nye er at **arkivet ikke lenger låser alt** for innloggede — det åpner gratis-settet for e-post-nivået.

---

## 2. Gratis-biblioteket (fast, kuratert)

Fast sett, ikke valgfrie spill. Permanent åpne quizzer markert i data.

- **12 quizzer fra «alle»** — én per kategori (biblioteket har akkurat 12 kategorier utenom fotball), kuratert som inngangsvennlige titler med høy rating/volum:

  | # | Kategori | Quiz | ID |
  |---|----------|------|-----|
  | 1 | Blandet | Allmenndannelse — bred runde | `mix-01` |
  | 2 | Film og TV | Filmklassikere alle kjenner | `film-01` |
  | 3 | Filosofi | Antikkens tenkere | `filosofi-01` |
  | 4 | Geografi | Hovedsteder rundt om i verden | `geografi-01` |
  | 5 | Kunst | De store mestrene | `kunst-01` |
  | 6 | Litteratur | Verdenslitteraturens klassikere | `litteratur-01` |
  | 7 | Musikk | Pop og rock gjennom tidene | `musikk-01` |
  | 8 | Naturvitenskap | Dyreriket | `vitenskap-04` |
  | 9 | Norsk historie | Vikingtiden | `historie-02` |
  | 10 | Sport | Olympiske leker | `sport-02` |
  | 11 | Teknologi | Oppfinnelser som endret verden | `teknologi-03` |
  | 12 | Verdenshistorie | Antikkens verden | `verdenshistorie-01` |

- **Fotball:** **minst 3 åpne quizzer per lag**, i tillegg til de 12. Gating skjer per `team`-tagg, ikke på fotball-kategorien som helhet. NB: per-lag-quizzer finnes ikke i biblioteket ennå (kun `sport-01` «Fotballens verden») — regelen aktiveres når lag-quizzene bygges.

### Datamodell
Marker i quiz-biblioteket (`quizzes-data.json`) med et eksplisitt flagg per quiz:

```json
{ "id": "...", "category": "historie", "free": true }
{ "id": "...", "category": "fotball", "team": "rosenborg", "free": true }
```

- `free: true` = permanent åpen for e-post-nivå.
- Arkiv-pipelinen (nattlig generering → library-sync → DB) må bære `free`-flagget gjennom til DB, slik at `/api`-laget kan håndheve det.
- Antallsregel valideres i sync/seed: nøyaktig 12 generelle + ≥3 per fot-lag flagget. Et lite script kan logge avvik så biblioteket ikke driver fra spec.

---

## 3. Skjerm A — Post-Dagens «Hva nå?»

Vises **rett etter fullført Dagens** (og som landing hvis man allerede har tatt dagens). Høyeste motivasjonsvindu → tre veier:

1. **Lag din egen** — visuelt tyngst. Sterkeste betal-argument; for e-post-nivå er dette teaseren som driver mot Premium.
2. **Arkivet** — «Bla i quizzer» (med gratis-toggle som default-på for ikke-betalende, se §4).
3. **VM** — egen inngang.

For ikke-betalende: vei 1 og deler av vei 2 treffer paywall (§5). For Premium: alle tre åpne.

Plassering: ny seksjon nederst i `dagens.html` resultatvisning + en variant som vises når `daily-quiz` rapporterer «allerede tatt».

---

## 4. Skjerm B — Arkivet med gratis-toggle

Ingen egen «Gratis»-kategori. I stedet:

- **Badge** «Gratis» på hver `free: true`-quiz i kortet.
- **Toggle** øverst: «Vis kun gratis». Default **på** for ikke-betalende (de ser umiddelbart hva de kan ta nå), default **av** for Premium.
- Låste quizzer beholder lås-ikon + lås-modal (finnes allerede i `arkiv.html` via `CQAuth.isPremium()`). Forskjellen: `free`-quizzer er nå *ulåst* for innloggede, ikke bare for Premium.

Logikk i `arkiv.html`: tilstand = `anonym | epost | premium`. Render lås/åpen per quiz ut fra `free`-flagg + tilstand.

---

## 5. Paywall-trigger (hvor muren faller)

- **Arkiv:** klikk på ikke-`free` quiz som ikke-Premium → lås-modal → checkout.
- **Lag din egen:** e-post-nivå får **3 gratis egne quizzer**, deretter checkout. (Soft-gate finnes alt i `quiz-app-v2.html` med `FREE_GENERATION_LIMIT` i localStorage — sett til 3; hard-gate `ensureAccess()` (~linje 1740) byttes inn ved nr. 4.)
- **VM:** **ingen mur** — gratis hele veien for alle nivåer.

Skru på ved å sette `REQUIRE_SUBSCRIPTION=true`. **Christian må være abonnent først** så han ikke låser seg ute.

---

## 6. Kode-endringer (oversikt)

- `quizzes-data.json` — legg `free`-flagg på 12 + fotball 3/lag.
- Arkiv-pipeline / library-sync — bær `free` gjennom til Supabase.
- `/api` (subscription/arkiv-lag) — håndhev `free` for e-post-nivå.
- `arkiv.html` — tre-tilstands-rendering, badge, gratis-toggle.
- `dagens.html` — «Hva nå?»-seksjon (fullført + allerede-tatt-variant).
- `quiz-app-v2.html` — bytt soft-gate mot `ensureAccess()` når paywall skrus på.
- VM — gate-beslutning.

---

## 7. Avgjorte beslutninger (7. juni 2026)

1. **«Lag din egen»:** 3 gratis egne quizzer for e-post-nivå, så mur.
2. **VM:** gratis hele veien for alle — bevisst hook.
3. **De 12 gratis:** én per kategori, se tabell i §2.

---

## 8. Foreslått rekkefølge

1. `free`-flagg i data + pipeline-gjennomføring (datafundament).
2. Arkiv-rendering: badge + toggle + tre-tilstands-låsing.
3. Post-Dagens «Hva nå?».
4. Skru på `REQUIRE_SUBSCRIPTION=true` (etter at Christian er abonnent) + bytt inn `ensureAccess()`.
