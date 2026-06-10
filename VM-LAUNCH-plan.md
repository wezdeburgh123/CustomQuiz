# VM 2026 — overordnet launchplan

> Skrevet 8. juni 2026. Forankret i [[customquiz-vm-modul]], [[customquiz-status]], [[customquiz-epost-flows]].
> **Avspark: torsdag 11. juni 2026** (Mexico–Sør-Afrika, Estadio Azteca, 21:00 Oslo). Finale 19. juli.
> **Valgt scope:** alt deployet + **første live-runde klar til avspark**. **Live-kadens:** hybrid (per-fase grunnmur + høydepunkt-quizer på store kampdager).

---

## 1. Situasjon på 3 setninger (oppdatert 8. juni — koden ER deployet)

Git er rent mot `origin/main` → **all VM-kode er allerede pushet og deployet** (vm.html, league-funksjoner, _brevo, daily-email, brevo-webhook; redirects + scheduled job bekreftet i netlify.toml). Det som faktisk gjenstår er IKKE kode, men: (a) **bekrefte/kjøre Supabase-migreringer** (særlig `migration-marketing-optin.sql` — migreringer kjøres manuelt og kan mangle i prod), (b) **Brevo-oppsett** (liste «VM 2026» + last opp velkomstmal + env), (c) **verifisere de to utestede gates ende-til-ende** (opt-in→Brevo, attempt→ledertavle), og (d) **innhold**: kickoff dekkes av pre-VM-pakken (Modus A); første ekte *resultatrunde* (Modus B) kan først lages når gruppespillets omgang 1 er ferdigspilt (~14. juni). Se `VM-fotball-prompt.md`.

---

## 2. Kritisk sti — tre dager

Hver linje: **hvem** · hva · **hvordan verifisere**. «C» = Christian (push, secrets, Stripe/nettleser, kontoer). «Cl» = Claude (kode, prompt, faktasjekk, verifisering via /api-probe).

### T-3 · Mandag 8. juni — DEPLOY + START LIVE-RUNDE

| # | Hvem | Oppgave | Verifisering (gate) |
|---|------|---------|---------------------|
| 1 | C | ~~Push kode~~ ✅ ALLEREDE DEPLOYET. I stedet: kjør `db/sjekk-migrasjoner.sql` i Supabase → se hvilke migreringer som er ❌ | Liste med ✅/❌ per migrering |
| 2 | C | Kjør evt. manglende migrering — trolig `db/migration-marketing-optin.sql` (+ bekreft `migration-vm-events.sql` er ✅) | Kolonner `marketing_opt_in/opt_in_at/opt_in_source` finnes |
| 3 | C | Opprett Brevo-liste **«VM 2026»** → sett env `BREVO_VM_LIST_ID` + `BREVO_VM_WELCOME_TEMPLATE_ID`; tom commit for redeploy | `recordOptIn` synker uten feil (se #6) |
| 4 | C | Last `e-post-maler/vm-velkomst.html` opp i Brevo som **Active**-mal; noter mal-ID inn i #3 | Brevo Preview rendrer; mal-ID satt i env |
| 5 | Cl | **Start fotball-live-runde-prompten** (eget produkt, se §3) — bygges i dag, faktasjekkes i morgen | Prompt + `build`-utvidelse syntaks-sjekket |
| 6 | C+Cl | Ende-til-ende-test opt-in: opprett liga innlogget → sjekk `profiles.marketing_opt_in=true` + kontakt i Brevo «VM 2026» + velkomstmail levert | Brevo-logg «Delivered», 0 bounce |

### T-2 · Tirsdag 9. juni — VERIFISER KJERNELØKKA + GENERER RUNDE 1

| # | Hvem | Oppgave | Verifisering (gate) |
|---|------|---------|---------------------|
| 7 | C+Cl | **Spill en pre-VM-quiz innlogget ende-til-ende** → bekreft `event_attempt` lagres, kort blir «TATT», `event_user_scores` + `league_standings` oppdateres | Probe mot view returnerer din rad m/ poeng |
| 8 | Cl | Generér **gruppespill omgang 1** + **åpningskamp-høydepunkt** med websøk-grunning + faktavakt; alternativer stokket; emit til `event-quizzes/vm-2026.json` + `db/seed-vm-…sql` via `scripts/build-vm-seed.py` | `{insufficient_knowledge}`-vakt rein; node/py-sjekk OK |
| 9 | Cl | **Faktasjekk-pass** på hver påstand i runde 1 (egen verifiseringsrunde, web-grunnet) | Hvert svar har kilde/bekreftelse; 0 uverifiserte |
| 10 | C | Review-gate: les gjennom runde 1 (review_status=auto_ok først etter din OK) | Du har lest og godkjent alle spørsmål |

### T-1 · Onsdag 10. juni — LÅSING, KOPI, TØRRKJØRING

| # | Hvem | Oppgave | Verifisering (gate) |
|---|------|---------|---------------------|
| 11 | C | Kjør seed for runde 1 i Supabase; sett runde 1 = `locked` med opplåsing ved avspark (eller manuell flip) | Pool viser runde 1 som LÅST i vm.html |
| 12 | Cl | Sjekk hele vm.html-flyten: pool, faner Min liga/Alle, inviter-lenke `?liga=KODE` auto-join, loader, del-lenke | Ingen JS-feil i konsoll; faner bytter |
| 13 | C | Tøm testrader (`smoke@`, `teststripe@`, evt. egne) så ledertavlen starter rein | Ledertavle tom/ekte ved avspark |
| 14 | C+Cl | **Tørrkjøring som ny bruker:** ny e-post → OTP-kode inn → spill quiz → opprett liga → få velkomstmail. Hele onboardingen i ett napp | Alle ledd grønne; ingen død-ende |
| 15 | C | Aktiver e-postutsending kun hvis ønsket: `DAILY_EMAIL_ENABLED=true`. NB: `daily-email` er planlagt **ukentlig** (mandager 06:00 UTC), ikke daglig | Bevisst valg gjort |

### T-0 · Torsdag 11. juni — AVSPARK

| # | Hvem | Oppgave |
|---|------|---------|
| 16 | C | Flip runde 1 + åpningskamp-quiz til `open` (manuelt eller planlagt) ved/etter åpningskampen |
| 17 | C+Cl | **Go/no-go-sjekkliste** (§7) før du deler lenken |
| 18 | C | Del vm.html i dine kanaler + inviter første liga |

---

## 3. Live-runde-pipeline (hybrid)

**Modell:** stabil trivia + fullførte resultater — **ikke** aggressiv sanntid. Innhold låses opp per fase; noen få høydepunkt-quizer på store kampdager.

**Faste runder (grunnmur — én pakke per fase):**
- Gruppespill omgang 1 → 2 → 3
- 16-delsfinale (R32) · 8-delsfinale (R16) · kvartfinale · semifinale · finale

**Høydepunkt-quizer (hybrid-toppingen — kun store dager):**
- Åpningskampen (klar til 11. juni)
- Evt. Norge-relevante kamper hvis aktuelt
- Finalen

**Generering — fast 4-stegs løype per runde (gjenbruk fra dag 1):**
1. **Generér** med fotball-prompt + `web_search` (MAX_SEARCHES ~3), alternativer stokket, faktavakt (`{insufficient_knowledge}` for tynt grunnlag).
2. **Faktasjekk-pass** — egen verifiseringsrunde som grunner hver påstand mot søk (ikke-forhandlingsbart, jf. [[feedback-quiz-kvalitet]]).
3. **Review-gate** — Christian leser og godkjenner; `review_status` flippes til `auto_ok`.
4. **Seed + lås** — `build-vm-seed.py` emitter json+sql; kjør i Supabase; ny runde står `locked` til fasen åpner.

**Eierskap/kadens under turneringen:** Claude genererer + faktasjekker, Christian review-godkjenner og seeder. Rytme: generér neste fase **2 dager før** den åpner, så review aldri blir en flaskehals. Bygg **én** runde grundig først (runde 1) — den blir malen for resten.

> **Største risiko:** fotball-prompten finnes ikke ennå. Den må bygges T-3 og fakta-grunnes T-2, ellers glipper «første live-runde til avspark».

---

## 4. Onboarding- og e-post-flyt

**Inngang → spill → bli værende.** Tre lag:

**A · Første møte (anonymt OK):**
- Forside-VM-banner + menylenke → `vm.html`. Pre-VM-pakke spillbar.
- «Slik funker det»-seksjon forklarer pool (én gang per quiz) + kumulativ poengsum.

**B · Konto + samtykke (soft opt-in):**
- Innlogging = **8-sifret OTP-kode** (aldri auto-verifiserende lenke — Microsoft Defender brenner tokenet).
- Opprett/bli med i liga → `recordOptIn` lagrer **soft opt-in** i `profiles` + synker til Brevo «VM 2026», med **tydelig UI-varsel** (ikke stille påmelding — markedsføringsloven §15 + «ingen reklame»-løftet). Avmelding via eget avkrysningsfelt ved `league-leave`.
- **Velkomstmail** (`vm-velkomst.html`) sendes **kun ved første opt-in**, gated på env-mal-ID.

**C · Retention under turneringen:**
- Liga-invitasjon: del `?liga=KODE` → godkjent auto-join.
- «Slå min score»-delelenke (`?lib&utfordring`).
- (Valgfritt) daglig VM-mail via `daily-email.js` — **av** til du bevisst skrur `DAILY_EMAIL_ENABLED=true`.
- Service-varsler (ny runde åpnet / liga-aktivitet) er **transaksjonelle** — utenfor markedsopt-in.

**Etter finalen:**
- **Reaktiveringskampanje** (`vm-reaktivering.html`) som Brevo-kampanje til «VM 2026»-lista → konverter VM-publikum til daglig quiz. (Mal må lastes til Brevo; ikke gjort ennå.)

**E-post-status nå:** velkomst + reaktivering ligger i repo men er **ikke** i Brevo. Begge må lastes opp før de fyrer (velkomst: T-3 #4; reaktivering: før finalen).

---

## 5. Kampdag-drift under turneringen

Lett, repeterbar rytme — målet er at ingenting krever improvisasjon:

- **2 dager før hver fase åpner:** Claude genererer + faktasjekker neste runde → Christian review-godkjenner → seed, stå `locked`.
- **Når fasen åpner:** flip `locked → open` (manuelt eller planlagt). Del i kanaler.
- **Store kampdager (hybrid):** vurder én høydepunkt-quiz (åpning/finale er gitt).
- **Ukentlig:** rask titt på ledertavle + liga-vekst + Brevo-leveringsrate; rydd åpenbare testrader.
- **Aldri:** push live-endringer rett før en kamp uten røyktest av vm.html-flyten.

---

## 6. Risiko og rollback

| Risiko | Tiltak / rollback |
|--------|-------------------|
| Fotball-prompt rekkes ikke til 11. juni | Fall tilbake til **pre-VM-pakke + ligaer** ved avspark (alt verifisert), slipp runde 1 dagen etter. Modulen fungerer uansett. |
| Faktafeil i live-runde | Review-gate er obligatorisk — ingen runde åpnes uten Christians OK. Kill-switch via `library-flag` / sett `review_status=removed`. |
| Brevo bounce / opt-in synker ikke | `recordOptIn` har fallback uten attributter; verifiser i #6 før avspark. Velkomstmail er gated — feiler stille, blokkerer ikke spill. |
| Attempt lagres ikke (ikke testet ende-til-ende ennå) | **Gate #7** må passere før avspark. Hvis rødt: ledertavle vises tom, men spill fungerer; fiks før du deler bredt. |
| Git-lås / push feiler | `find .git -name '*.lock' -delete` så push på nytt. Claude kan ikke pushe — Christian kjører fra egen terminal. |
| Env plukkes ikke opp | Netlify krever **ny deploy** etter env-endring → tom commit + push. |

---

## 7. Go/no-go-sjekkliste (avspark 11. juni)

Alt må være grønt før lenken deles bredt:

- [ ] Frontend + funksjoner deployet, `/vm.html` laster uten JS-feil
- [ ] `migration-marketing-optin.sql` kjørt
- [ ] Brevo-liste «VM 2026» + `BREVO_VM_LIST_ID` + velkomst-mal-ID satt
- [ ] **Attempt→ledertavle verifisert ende-til-ende** (gate #7)
- [ ] Opt-in→Brevo→velkomstmail verifisert (gate #6)
- [ ] Tørrkjøring som ny bruker fullført (gate #14)
- [ ] Runde 1 + åpningskamp-quiz **faktasjekket og review-godkjent**
- [ ] Testrader tømt; ledertavle starter rein
- [ ] Bevisst valg tatt på daglig VM-mail (av/på)
- [ ] Bestemt hvem som flipper runde 1 til `open` og når

---

## 8. Hva er IKKE i scope nå (bevisst)

- **Paywall** — VM er gratis i starten (`REQUIRE_SUBSCRIPTION=false`).
- **Vipps/Stripe go-live** — blokkert av juridisk enhet/org.nr, urelatert til VM-launch.
- **Brevo-webhook for unsubscribe-sync** — kjent begrensning, tas på sikt.
- **Resten av fasene** — bygges fortløpende 2 dager før hver åpner (§5).
