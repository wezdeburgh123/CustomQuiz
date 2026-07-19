# Nattskift — generér quizer til arkivet (prompt for den planlagte oppgaven)

Dette er prompten den nattlige planlagte oppgaven kjører. Den genererer quizer
fra **denne Claude-kontoen** (ikke Anthropic-API-et), grunner dem med websøk, og
skriver dem til `quiz-library/library.ndjson` i prosjektmappa. Ingen nettverk mot
Supabase trengs — `library-sync` laster opp ved neste deploy.

Rediger fritt (f.eks. juster `MÅL_PER_NATT`-rampen). Den planlagte oppgaven bruker
denne teksten som instruks.

---

Du kjører det nattlige genererings-skiftet for CustomQuiz. Arbeidsmappe:
`/Users/christian/Documents/Claude/Projects/Quiz generator`. Jobb i bokmål.

**Mål:** Bygg ut arkivet til hele køen i `topics.json` (nå ~108 emner), litt mer
for hver natt, innenfor kontoens grenser. Faktisk korrekthet er ikke-forhandlingsbart.

Gjør nøyaktig dette:

0. **Rydd stale git-låser FØRST.** Kjør i arbeidsmappa:
   `rm -f .git/index.lock .git/HEAD.lock .git/*.lock .git/*.lock.stale*`
   En gjenglemt lås fra et krasjet skift blokkerer både skriving og commit
   (dette har stoppet skiftet før — bl.a. 15. og 19. juli). Rydd alltid før du
   rører filer. Låsefilene er trygge å slette når ingen annen git-prosess kjører.

1. **Les køen og status.**
   - Les `quiz-library/topics.json` (feltet `topics` = alle emner med `slug`).
   - Les `quiz-library/library.ndjson` hvis den finnes; samle alle `slug` som
     allerede er ferdige.
   - Les `quiz-library/STATUS.json` hvis den finnes: `{ nights_run, total_generated }`.
     Mangler den, start på `{ nights_run: 0, total_generated: 0 }`.

2. **Bestem nattens batch (rask opptrapping).**
   - `batch = min(60, 20 + nights_run * 10)` (natt 1 = 20, natt 2 = 30, … tak på 60).
     Skrudd opp fordi køen vokste (klubb-dypdykk). Skriv heller færre enn dårlige
     hvis kontoens grenser eller kvalitet tilsier det — kvalitet slår volum.
   - Velg de første `batch` emnene fra `topics.json` som IKKE finnes i ndjson.
     Køen er sortert på `priority` først: klubb-dypdykkene (Liverpool, Man. United,
     Arsenal — priority 1) ligger fremst og skal genereres FØRST, deretter resten
     (lette først, jevnt fordelt på kategori).
   - Er det færre igjen enn `batch`, ta resten. Er køen tom, skriv en kort melding
     og avslutt.

3. **Generér hver quiz — med kvalitet som ufravikelig krav.**
   For hvert valgte emne:
   - Gjør 1–3 målrettede websøk for å bekrefte de viktigste fakta (Wikipedia,
     Store norske leksikon, offisielle kilder, anerkjente medier). Kjenner du
     emnet trygt, kan du søke mindre.
   - Lag 10 spørsmål på norsk bokmål. Krav (samme som live-generatoren):
     - Alt MÅ være faktisk korrekt. Dikt ALDRI opp navn, årstall eller hendelser.
       Er du usikker, velg en annen vinkling du er trygg på.
     - Nøyaktig 4 alternativer per spørsmål; `correct` = indeks 0–3.
     - Riktig svar skal variere mellom posisjon 0, 1, 2 og 3.
     - Plausible distraktorer. Naturlig bokmål. Bruk tankestrek (—) der det passer.
     - Resonnementsbaserte spørsmål der det er mulig, ikke bare ren gjenkjenning.
     - Hvert spørsmål: kort `explanation` med kontekst.
   - Klarer du ikke minst 8 solide, faktabaserte spørsmål om emnet (for smalt/
     usikkert), HOPP OVER emnet — ikke fyll med oppspinn. Noter det som hoppet over.

4. **Skriv til arkivet.** For hver ferdige quiz, legg til ÉN linje i
   `quiz-library/library.ndjson` (append, ikke overskriv) med nøyaktig dette
   JSON-objektet på én linje:
   ```json
   {"slug":"<emnets slug fra topics.json>","themes":<emnets themes-array>,"category":"<emnets category>","category_label":"<emnets category_label>","team":"<emnets team hvis satt, ellers utelat feltet>","difficulty":"<emnets difficulty>","title":"<kort tittel>","lede":"<én setning>","questions":[{"category":"<underkategori>","q":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}],"grounded":true,"source":"nightly"}
   ```
   Bruk emnets egen `slug`, `themes`, `category`, `category_label`, `difficulty`
   — og `team` hvis emnet har det — uendret fra `topics.json`. Da matcher
   cache-oppslaget på siden. Fotball-emner har `category:"fotball"`; klubb-emner
   har i tillegg et `team`-felt (klubblag) som driver lag-filteret i arkivet.
   Generelle fotball-emner (VM, Premier League, Eliteserien o.l.) har ikke `team`
   — utelat feltet da (ikke skriv `"team":""`).

5. **Oppdater status.** Skriv `quiz-library/STATUS.json`:
   `{ "nights_run": <+1>, "total_generated": <+antall skrevet>, "last_run": "<ISO-dato>", "last_batch": <antall>, "skipped": [<sluger du hoppet over>] }`.

6. **Oppsummer kort** (3–5 linjer): antall generert i natt, totalt i arkivet,
   hvor mange igjen i køen, og ev. hoppede emner. Ikke push til git — Christian
   pusher selv (det er da `library-sync` laster opp til Supabase).

Hvis noe er uklart eller en fil mangler, gjør det trygge: skriv færre quizer
heller enn dårlige, og forklar kort hva som stoppet deg.
