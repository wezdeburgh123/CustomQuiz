# Pre-game storkamp-quiz — spec

> Skrevet 14. juni 2026. Forankret i `VM-fotball-prompt.md` (Modus A), `VM-10juni-og-kampdag-drift.md`, [[customquiz-vm-modul]], [[customquiz-arkiv-pipeline]], [[feedback-quiz-kvalitet]].
> «C» = Christian (push, Supabase, nettleser). «Cl» = Claude (generering, faktasjekk, /api-probe).

## 1. Konsept

For hver **utvalgte storkamp** lages en kort, gøy **pre-game-quiz om de to lagene som møtes** — å ta alene eller sammen i vennegjengen *før avspark*. Den blander stabile lagfakta (historikk, spillere, tidligere VM) med **1–2 ferske, websøk-grunnede fakta om hvordan lagene ligger an i VM akkurat nå** (tabell, form, hvem som er videre / hva som står på spill).

Quizene gjenbruker den eksisterende event-infrastrukturen i `vm.html`: samme `event_quizzes`-pool, ledertavle, vennegruppe-ligaer og én-attempt-modell. Ingen ny infrastruktur — en pre-game-quiz er bare en ny rad i poolen med `status open|locked`.

**Avgrenset til (Christians valg 14. juni):**
- Omfang: **utvalgte storkamper**, ikke alle 104 kampene. Lett review-løp, høy kvalitet per quiz.
- Fersk data: **ja, men få og godt grunnet** — 1–2 standings-/form-fakta per quiz, grunnet samme morgen.

## 2. Hvilke kamper teller som «storkamp»

Prioritert liste (Cl foreslår, C bekrefter per kamp):

1. **Alle Norge-kampene** — flaggskipet. Gruppe I:
   - **Irak–Norge — tirsdag 16. juni** (første kamp, første VM siden 1998)
   - **Norge–Senegal — mandag 22. juni**
   - **Norge–Frankrike — fredag 26. juni**
   - + alle Norge-kamper i et evt. sluttspill.
2. **Hele sluttspillet fra 16-delsfinalen** (R32 → finale 19. juli) — få kamper, høyt drama.
3. **Et lite utvalg gruppe-storkamper** uten Norge der det er nok norsk interesse (f.eks. åpningskamp, regjerende mester, klassikere). C plukker ad hoc.

Volumvurdering: dette gir ca. 3 Norge-kamper + ~8–15 sluttspillkamper + noen få utvalgte = et håndterbart review-antall, ikke 104.

## 3. Quiz-sammensetning (10 spørsmål)

Mål: ~70 % trygt/stabilt, ~30 % ferskt og grunnet. Per quiz:

- **6–7 stabile spørsmål** om de to lagene: VM-historikk, ikoniske spillere, tidligere oppgjør, kuriosa, hjemland/forbund. Lav faktarisiko — kan i prinsippet forberedes dager i forveien.
- **2–3 ferske spørsmål**, websøk-grunnet **samme morgen** som kampen: stilling i gruppa, resultater så langt i VM, form/skader, hva laget trenger for å gå videre. Dette er den engasjerende men ferskvare-følsomme biten.
- Resonnementsbaserte spørsmål der det er naturlig (jf. [[feedback-quiz-kvalitet]]), ikke ren pugg.
- Alternativer stokkes (frontend stokker uansett), fasit jevnt fordelt.

**Hvorfor «samme morgen»:** tabell og form endrer seg hver kampdag og kan være utdatert på timer. Et ferskt standings-faktum laget på forhånd risikerer å være feil ved avspark. Derfor genereres ferske spørsmål kampdagen, ikke i batch på forhånd.

## 4. Kampdag-flyt (per storkamp)

Bygger på den eksisterende 4-stegs løypa i `VM-10juni-og-kampdag-drift.md` §3, men med pre-game-timing:

1. **Cl genererer utkast** kampdag-morgen (eller kvelden før for stabile spm): Modus A-prompten i §6, websøk-grunnet, faktavakt-pass kjørt. Utkast skrives som `VM-pregame-utkast-<lag-vs-lag>-<dato>.md` i prosjektmappa.
2. **Cl kjører adversarielt faktasjekk-pass** (egen runde mot websøk) — spesielt på de ferske spørsmålene.
3. **C review-godkjenner** (leser alle 10 spm). Kort løp siden det er én quiz.
4. **C seeder + flipper:** lim inn i `scripts/build-vm-seed.py` → `python3 scripts/build-vm-seed.py` → kjør `db/seed-vm-2026.sql` i Supabase. Sett `status=open` slik at kortet er aktivt i vm.html *før avspark*, og evt. `status=done`/arkivér etter kampslutt.

**Kritisk lærdom (13. juni):** flip/seed må aldri henge — nytt innhold ER motoren. En pre-game-quiz som ikke er `open` før avspark er verdiløs. Derfor: planlagt påminnelse kampdag-morgen (se §5).

## 5. Så automatisk som mulig — hva som faktisk kan automatiseres

To steg kan **ikke** bli helt automatiske i dagens oppsett, og det er bevisst:

- **Push/DB-skriving:** Cowork-sandkassen har ikke utgående nett (jf. [[customquiz-arkiv-pipeline]]). Cl kan skrive utkast-fil, men ikke pushe eller skrive til Supabase. C må seede/pushe.
- **Review-gate:** faktisk korrekthet er ikke-forhandlingsbart ([[feedback-quiz-kvalitet]]). Den ferske standings-biten er nettopp der hallusinering gjør mest skade, så C leser alltid gjennom.

**Det som automatiseres (planlagt Cowork-oppgave):**
- En **planlagt påminnelse/generering kampdag-morgen** for hver bekreftet storkamp: Cl genererer utkastet + faktasjekker + varsler C. C trenger bare å lese, seede og flippe.
- Realistisk «automatisk» = *auto-utkast + varsel → du godkjenner og seeder i én batch → flip til open før avspark.*

**Oppsett:** opprett en scheduled task per Norge-kampdag (16., 22., 26. juni) som trigger genereringen om morgenen. Resten av storkampene legges til ad hoc når sluttspilltreet er kjent.

## 6. Genererings-prompt (Modus A utvidet) — se eget avsnitt under

Selve prompten ligger i `PRE-GAME-genereringsprompt.md` (utvidelse av Modus A i `VM-fotball-prompt.md`).

## 7. Første konkrete leveranse

**Irak–Norge, tirsdag 16. juni.** Foreslått løp:
- 15. juni kveld / 16. juni morgen: Cl genererer utkastet (6–7 stabile Norge/Irak-spm + 2–3 ferske: Norges åpning, gruppe I-stilling, Iraks form).
- C review-godkjenner + seeder `locked`, flipper `open` god tid før avspark kl. 18 (norsk tid sjekkes).

## 8. Åpne spørsmål / beslutninger som gjenstår

- Skal pre-game-quizene telle inn i den samme kumulative VM-ledertavla, eller ha egen «kamp-liga»-stripe? (Default: samme tavle — enklest, mest engasjement.)
- Hvor lenge skal en pre-game-quiz stå `open`? Til avspark, til kampslutt, eller bli liggende i arkivet etterpå?
- Egen delelenke «slå min score før avspark» per kamp? (Gjenbruk av eksisterende `?utfordring`-mekanikk.)
