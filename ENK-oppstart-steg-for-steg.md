# Ta betalinger for CustomQuiz: ENK først — steg for steg

_Valgt 9. juni 2026. ENK i ditt eget navn nå (raskt og ditt), oppgrader til AS senere når folk faktisk betaler. Forutsetter at du bare følger instruksjonene og signerer/limer det sensitive selv._

**Mål:** org.nr + bedriftskonto → ta imot Stripe + Vipps før VM. MVA-fritt i starten.

---

## STEG 1 — Velg foretaksnavn

- Et ENK **må ha ditt etternavn i navnet** (lovkrav). Eksempler: «Christian [Etternavn]», «[Etternavn] Media», «[Etternavn] Digital».
- Navnet trenger **ikke** være «CustomQuiz» — produktet/domenet (customquiz.no) lever uavhengig av foretaksnavnet.
- Sjekk at navnet er ledig på **brreg.no** → «Søk i registrene».

## STEG 2 — Registrer ENK-et (gratis, i Altinn)

1. Gå til **altinn.no** → søk «**Samordnet registermelding**» (eller «Registrer nytt foretak»).
2. Logg inn med **BankID**.
3. Velg organisasjonsform **Enkeltpersonforetak (ENK)**.
4. Fyll ut:
   - **Foretaksnavn** (fra steg 1)
   - **Forretningsadresse** — din private adresse er greit
   - **Bransje/NACE-kode** — bruk **62.010 Programmeringstjenester** eller **63.120 Drift av webportaler** (skriv «webportal» eller «programmering» i søket, velg det som passer)
   - **Beskrivelse av virksomheten** — f.eks. «Utvikling og drift av digital quiz-tjeneste på abonnement»
5. **Velg register** (gebyrer fra 01.01.2026, elektronisk — registrering er IKKE lenger gratis):
   - **Enhets- og Foretaksregisteret = 3 883 kr** ← anbefalt. Gir org.nr + **firmaattest** (som bank/Stripe/Vipps ofte ber om).
   - Kun Enhetsregisteret = 2 181 kr. Gir org.nr, men ingen firmaattest. Å legge til Foretaksregisteret senere koster 3 185 kr — så det er billigere å ta begge nå.
   - **Betaler:** velg **«Foretaket»** (bokføres som foretakets utgift).
6. Send inn. **Org.nr kommer vanligvis på noen få virkedager** (oppgis i Altinn / på brreg.no).

## STEG 3 — Bedriftskonto

- Opprett en **egen bedriftskonto** på org.nr i banken du allerede bruker (du sa du har et bankforhold). Det er denne kontoen Stripe og Vipps betaler ut til.
- Hold quiz-penger adskilt fra privatkontoen — gjør regnskapet enkelt senere.

## STEG 4 — MVA: ikke nå

- Et nytt ENK er **ikke MVA-pliktig før omsetningen passerer 50 000 kr på 12 måneder**. Til da: **selg uten MVA** og behold hele 49 kr.
- I praksis: **ikke** sett `STRIPE_TAX_RATE_ID` i Netlify ennå (se go-live-doc). Pris vises som rene 49 kr.
- Når du nærmer deg 50 000 kr: registrer i **Merverdiavgiftsregisteret** (samme Samordnet registermelding i Altinn, tar minutter). Da legger vi inn 25 %-Tax-Rate-ID-en, og 49 kr blir inkl. MVA. Koden er klar for byttet.

## STEG 5 — Stripe på ENK-et

- Opprett **ny Stripe-konto** registrert på ENK-et: foretaksnavn, **org.nr**, adresse, **bedriftskonto** for utbetaling. (Ikke gjenbruk «WezDeBurgh Inc».)
- Følg så **`GO-LIVE-hvem-gjor-hva.md`** punkt for punkt (DEL 1): produkt + pris 49 kr/mnd, webhook mot `customquiz.no/api/stripe-webhook`, Apple Pay-domene, lim fire env-verdier i Netlify, redeploy.
- **Hopp over MVA-stegene** i den doc-en for nå (ingen `STRIPE_TAX_RATE_ID` før du er MVA-registrert).

## STEG 6 — Vipps rett etter

- ENK med org.nr + bedriftskonto kan bruke Vipps. Bestill i **portal.vippsmobilepay.com** på org.nr-et ditt.
- Følg **DEL 2** i go-live-doc-en (test først på `apitest`, så produksjon).

## STEG 7 — Bokføring (lett, senere)

- Et ENK med lav omsetning har enkle krav. Et rimelig/gratis verktøy som **Fiken** eller **Conta** kobler mot bankkontoen og holder orden til selvangivelsen. Sett det opp når de første betalingene kommer — ikke en blokker for å gå live.

---

## Sjekkliste

- [ ] Foretaksnavn med etternavn valgt + ledig på brreg.no
- [ ] ENK registrert i Altinn (Enhets- og Foretaksregisteret = 3 883 kr, «Foretaket» betaler), BankID-signert
- [ ] Org.nr mottatt
- [ ] Bedriftskonto opprettet på org.nr
- [ ] (MVA: ingenting nå — selg uten til 50 000 kr)
- [ ] Ny Stripe-konto opprettet på ENK-et
- [ ] Go-live-doc DEL 1 fulgt (uten MVA-env) → Netlify-env limt → redeploy
- [ ] Vipps bestilt på org.nr

---

## Når du er klar

Si fra så snart du har **org.nr**, så tar vi Stripe-oppsettet sammen steg for steg, og jeg verifiserer hele betalingskjeden via probe mot customquiz.no etterpå. Oppgradering til AS er en ren videreføring senere — vi flytter da Stripe/Vipps til AS-et (få abonnenter = lett migrering på dette stadiet).
