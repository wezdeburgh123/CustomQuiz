# Sjekkliste: ENK + betaling for CustomQuiz

Steg-for-steg fra null til betaling live. Beregn ca. 1–2 uker totalt (mest venting på org.nr).
Merk: dette er en praktisk guide, ikke regnskaps-/juridisk rådgivning.

---

## Steg 1 – Registrer enkeltpersonforetaket

1. Gå til **altinn.no** og logg inn med BankID.
2. Åpne skjemaet **Samordnet registermelding**.
3. Velg foretaksform **Enkeltpersonforetak**.
4. Fyll inn:
   - **Foretaksnavn** – må inneholde etternavnet ditt (f.eks. «Christian [Etternavn]» eller «[Etternavn] Digital»). Tilleggsord som «CustomQuiz» er lov.
   - **Bransjekode (NACE)** – for en digital quiz-tjeneste passer én av:
     - `62.010 Programmeringstjenester`
     - `63.120 Drift av web-portaler`
   - **Adresse** og kontaktinfo.
5. Velg register:
   - **Enhetsregisteret** = gratis (holder for å komme i gang).
   - Legg til **Foretaksregisteret** (~2 200 kr) hvis du vil ha bedre kredibilitet / selger varer. For ren digital tjeneste er det valgfritt nå.
6. Signer og send inn.
7. **Vent på organisasjonsnummer** – typisk 1–3 dager (kan ta opptil 5–10).

---

## Steg 2 – Sett opp det praktiske rundt foretaket

- [ ] Opprett egen **bankkonto** for foretaket (anbefalt, ikke påkrevd for ENK – holder økonomien ryddig).
- [ ] Bestem deg for **regnskap**: Fiken eller lignende dekker ENK billig.
- [ ] **MVA**: Du registrerer deg i Merverdiavgiftsregisteret først når omsetningen passerer **50 000 kr** på 12 måneder. Ikke noe du trenger fra dag én.

---

## Steg 3 – Vipps MobilePay

1. Gå til **portal.vippsmobilepay.com** og opprett salgssted med org.nr.
2. Velg produkt: **eCom / ePayment API** (for betaling i web-app).
3. Hent ut nøklene jeg trenger:
   - `client_id`
   - `client_secret`
   - `Ocp-Apim-Subscription-Key` (subscription key)
   - **MSN** (merchant serial number)
4. Bruk **test-/sandbox-miljø** først.

---

## Steg 4 – Stripe

1. Opprett konto på **stripe.com** med org.nr (er live på minutter).
2. Lag **produkt + pris** som matcher modellen (hybrid, gratis først – definer hva som koster).
3. Hent ut:
   - `Publishable key`
   - `Secret key`
   - (senere) `Webhook signing secret`
4. Start i **testmodus**.

---

## Steg 5 – Koble på i appen (jeg gjør dette)

1. Legg nøkler som **miljøvariabler i Netlify** (aldri i koden/GitHub).
2. Bygg betalings-endepunkter som **Netlify Functions**.
3. Koble kjøp mot **Supabase** (tilgang/paywall).
4. Test hele flyten i sandbox → bytt til produksjonsnøkler → live.

---

## Hva jeg trenger fra deg når du er klar

- Org.nr (bekreftelse på at ENK er registrert)
- Vipps: `client_id`, `client_secret`, subscription key, MSN
- Stripe: publishable + secret key
- Pris og hva som faktisk skal koste penger
