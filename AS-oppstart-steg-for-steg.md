# Ta betalinger: AS for CustomQuiz — steg for steg

_Laget 9. juni 2026. Forutsetter at du ikke kan noe utover å følge instruksjonene og lime/signere der det står. Sensitive ting (BankID, org.nr, nøkler) gjør du selv — Claude limer aldri hemmeligheter._

---

## STEG 0 — Bestem: nytt AS eller eksisterende?

Sjekk disse tre om det AS-et du allerede har:

1. **Eier du det alene?** (Du står som eneste aksjonær.)
2. **Er det i god stand?** (Ikke under avvikling/konkurs, leverer årsregnskap, ikke «slettet».)
   - Sjekk gratis på **brreg.no** → søk selskapsnavn → se «Status».
3. **Vil du ha quiz-økonomien adskilt** fra det selskapet gjør ellers?

**Tre ja på 1 og 2, og nei på 3 → bruk det eksisterende AS-et.** Hopp til **SPOR A**.

**Hvis noe skurrer (delt eierskap, selskapet driver noe annet du vil skille ut, eller du vil ha en ren start) → stift et nytt.** Følg **SPOR B**.

> Tidsforskjell: Spor A = i dag. Spor B = typisk 1–3 uker + 30 000 kr aksjekapital (forblir dine, i selskapet) + ~6 500 kr registreringsgebyr.

---

## SPOR A — Bruke eksisterende AS (raskest)

Ingen stiftelse. Du trenger bare tre opplysninger om AS-et for å gå live med betaling:

- **Org.nr** (9 siffer)
- **AS-ets bankkonto** (for utbetaling fra Stripe/Vipps)
- **Om AS-et er MVA-registrert** (sjekk på brreg.no → selskapet → står «Registrert i Merverdiavgiftsregisteret»?)
  - **Ja:** pris = 49 kr/mnd **inkl. 25 % MVA** (som planlagt).
  - **Nei (under 50 000 kr omsetning):** selg **uten MVA** inntil videre. Koden håndterer dette: dropper du `STRIPE_TAX_RATE_ID`, selges det uten MVA helt til du er klar.

➡️ **Gå rett til `GO-LIVE-hvem-gjor-hva.md`** i denne mappa. Den er allerede skrevet for «selg gjennom AS-et» og lister nøyaktig hva du limer inn i Stripe og Netlify.

---

## SPOR B — Stifte nytt AS (via banken din)

Du sa du allerede har et bankforhold. Nesten alle norske banker (DNB, SpareBank 1, Nordea, Sbanken m.fl.) har en digital «Stifte AS / opprette selskapskonto»-flyt som ordner Brønnøysund-registreringen for deg. Det er den raskeste veien med færrest manuelle steg.

### B1. Velg navn og sjekk at det er ledig
- Gå til **brreg.no** → «Søk i registrene» → skriv inn ønsket navn.
- Navnet må ikke være identisk med et eksisterende foretak. Et særpreget navn (ikke bare «Quiz AS») er tryggest.
- _Tips:_ Selskapsnavnet trenger ikke være «CustomQuiz». Du kan hete f.eks. «[Ditt navn] Media AS» og drive customquiz.no under det. Domene og produktnavn er uavhengig av selskapsnavnet.

### B2. Start stiftelsen i nettbanken
- Logg inn i **bedriftsdelen** av banken din (eller bankens «Start bedrift»-side) og velg **«Stifte aksjeselskap»**.
- Du signerer med **BankID**. Banken oppretter en **sperret aksjekapitalkonto** og fyller ut stiftelsesdokument + vedtekter for deg.
- Du oppgir typisk:
  - Selskapsnavn (fra B1)
  - Forretningsadresse (kan være din private adresse)
  - **Daglig leder / styre** (deg)
  - **Aksjonær(er)** og fordeling (deg = 100 %)
  - **Bransje/NACE-kode** — bruk f.eks. *62.010 Programmeringstjenester* eller *63.120 Drift av web-portaler*. (Banken foreslår; velg det som ligner.)
  - **Aksjekapital: minimum 30 000 kr.**

### B3. Betal inn aksjekapitalen
- Når banken har åpnet kapitalkontoen, **overfør minst 30 000 kr** dit fra din private konto.
- Dette er **dine egne penger som forblir i selskapet** — ikke et gebyr. Du kan bruke dem til drift (f.eks. domene, Netlify, Anthropic-kreditt) etter registrering.
- Banken/revisor bekrefter innskuddet til Brønnøysund automatisk i denne flyten.

### B4. Banken sender til Brønnøysund — du venter på org.nr
- Banken sender **Samordnet registermelding** til Brønnøysundregistrene.
- **Registreringsgebyr ~6 500 kr** (elektronisk, Foretaksregisteret) — betales som del av flyten.
- **Behandlingstid:** vanligvis noen få virkedager, men varierer. Du kan følge status i nettbanken / på **brreg.no**.
- Når det er ferdig får du **organisasjonsnummeret (9 siffer)** og selskapet er offisielt.

### B5. Bedriftskonto
- I samme flyt setter banken deg opp med en **bedrifts-/driftskonto**. Det er denne kontoen Stripe og Vipps betaler ut til.

### B6. MVA — viktig for et nytt AS
- Et nytt AS er **ikke MVA-pliktig** før omsetningen passerer **50 000 kr i løpet av 12 måneder**.
- Inntil da: **selg uten MVA.** I praksis: ikke sett `STRIPE_TAX_RATE_ID` i Netlify ennå (se go-live-doc). Pris vises da som rene 49 kr.
- Når du passerer 50 000 kr: registrer i Merverdiavgiftsregisteret (gjøres i Altinn, tar minutter), og **da** legger vi inn 25 %-Tax Rate-ID-en så 49 kr blir inkl. MVA. Koden er allerede klar for byttet.

---

## ETTER AS-ET ER PÅ PLASS (begge spor) — koble til betaling

Alt på betalingssiden er ferdig kodet. Du trenger bare:

1. **Org.nr + AS-ets bankkonto** → opprett **ny Stripe-konto på AS-et** (ikke gjenbruk «WezDeBurgh Inc»).
2. Følg **`GO-LIVE-hvem-gjor-hva.md`** punkt for punkt: lag produkt/pris, webhook, Apple Pay-domene, lim fire verdier inn i Netlify, redeploy.
3. **Vipps** bestilles rett etter Stripe (krever org.nr).

Når du har org.nr, si fra — så går vi gjennom Stripe-oppsettet sammen, og jeg verifiserer hele kjeden via probe mot customquiz.no etterpå.

---

## Kort sjekkliste

- [ ] STEG 0: Bestemt nytt vs eksisterende AS
- [ ] (Spor B) Navn sjekket ledig på brreg.no
- [ ] (Spor B) Stiftelse startet i banken, BankID-signert
- [ ] (Spor B) 30 000 kr overført til kapitalkonto
- [ ] (Spor B) Org.nr mottatt fra Brønnøysund
- [ ] Bedriftskonto klar
- [ ] Avklart MVA-status (registrert ja/nei)
- [ ] Ny Stripe-konto opprettet på AS-et
- [ ] Go-live-doc fulgt → Netlify-env limt → redeploy
- [ ] Vipps bestilt
