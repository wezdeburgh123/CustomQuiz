# Go-live: Stripe + Vipps på AS-et — hvem gjør hva

_Oppdatert 8. juni 2026. Rekkefølge: **Stripe først → Vipps rett etter**. Pris: **49 kr/mnd inkl. 25 % MVA** (netto ≈ 39,20 kr, MVA ≈ 9,80 kr)._

## Beslutninger som er låst

- Selger = **AS-et** (ikke «WezDeBurgh Inc» og ikke Dinamo). Pengene skal rett inn i AS-et.
- Med MVA fra start (49 kr inkl. 25 %). Planlagt flytting til eierselskap senere — se note nederst.
- Stripe gjøres live først (ferdig testet), Vipps bestilles og testes rett etter.

## Viktig før du lager prisen

Stripe-kontoen «WezDeBurgh Inc» er en **annen enhet** enn AS-et. Vi lager derfor en **ny Stripe-konto registrert på AS-et** — ikke gjenbruk av den gamle. Test-priser/-nøkler fra den gamle kontoen følger ikke med; alt settes opp på nytt i live-modus på AS-kontoen.

---

## DEL 1 — STRIPE

### Du (Christian) gjør — Stripe-dashbordet er sperret for meg, så dette må du gjøre selv

1. **Opprett ny Stripe-konto på AS-et.** Oppgi AS-ets juridiske navn, **org.nr**, forretningsadresse og **AS-ets bankkonto** (for utbetaling). Fullfør «Activate account».
2. **Slå på MVA.** To alternativer:
   - **Enkelt (anbefalt):** lag én _Tax Rate_ i Stripe: 25 %, **«Inclusive»**, visningsnavn «MVA», land Norge. Noter ID-en (`txr_…`).
   - Alternativt Stripe Tax (automatisk, men har per-transaksjon-kostnad) — unødvendig for én norsk sats.
3. **Lag produkt + pris i live-modus:** «CustomQuiz Premium», **49 kr/mnd NOK (recurring)**, og sett **Tax behavior = Inclusive** på prisen. Noter pris-ID-en (`price_…`).
4. **Lag webhook** (live-modus) mot `https://customquiz.no/api/stripe-webhook`, med hendelsene:
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Noter signeringshemmeligheten (`whsec_…`).
5. **Apple Pay:** Stripe → Settings → Payments → Apple Pay → legg til domenet `customquiz.no`. Jeg gir deg verifiseringsfila som skal lastes opp.
6. **Lim inn i Netlify** (Site settings → Environment variables) — verdiene fra punktene over. Eksakt liste under. _Nøkler limer du selv; jeg limer aldri hemmeligheter._
7. **Redeploy** så funksjonene plukker opp nye env (kommando under).
8. **Bli abonnent selv først** (én ekte betaling på deg) før vi skrur på paywall, så du ikke låser deg ute.

### Jeg (Claude) gjør

- MVA er allerede lagt inn i koden, env-styrt: `create-checkout.js` legger `default_tax_rates` på abonnementet når `STRIPE_TAX_RATE_ID` finnes, og kvitteringen får `netto`/`mva`-felt (`stripe-webhook.js`). Uten env selges det uten MVA — så ingenting knekker før du er klar.
- Gir deg den eksakte «lim-her»-lista + redeploy-kommandoen (under).
- Oppdaterer Brevo-kvitteringsmalen (#3) til å vise MVA-linje når du sier fra (jeg kan ikke logge inn i Brevo for deg, men jeg gir deg ferdig tekst å lime inn).
- Skrur på paywallen (`REQUIRE_SUBSCRIPTION=true`) trygt — etter at du er abonnent.
- Verifiserer hele kjeden via probe mot `customquiz.no/api/...` etter at du har deployet.

### Lim dette inn i Netlify (Stripe)

| Variabel | Verdi |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (fra AS-kontoen, live-modus) |
| `STRIPE_PRICE_ID` | `price_…` (ny 49 kr/mnd-pris, inclusive) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (fra live-webhooken) |
| `STRIPE_TAX_RATE_ID` | `txr_…` (25 % MVA, inclusive) |

### Redeploy-kommando (lim i Terminal, alt på én gang)

```
cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
git commit --allow-empty -m "chore: go-live stripe" && git push
```

Hvis push klager på lås: `find .git -name '*.lock' -delete` og kjør på nytt.

---

## DEL 2 — VIPPS (rett etter Stripe er live)

### Du gjør

1. **Bestill «Vipps MobilePay Recurring»** i Vipps-portalen (portal.vippsmobilepay.com) med AS-ets **org.nr**. Da opprettes en **test-salgsenhet** og du får et **merchant serial number (MSN)**.
2. Hent **`client_id`, `client_secret`** og **subscription-key** (Ocp-Apim-Subscription-Key) fra portalen.
3. **Lim inn i Netlify** (test-verdier først):
   | Variabel | Verdi |
   |---|---|
   | `VIPPS_CLIENT_ID` | fra portalen |
   | `VIPPS_CLIENT_SECRET` | fra portalen |
   | `VIPPS_SUBSCRIPTION_KEY` | fra portalen |
   | `VIPPS_MSN` | merchant serial number |
   | `VIPPS_ENV` | `test` (byttes til `production` ved go-live) |
4. Når test er OK: be om **produksjonssalgsenhet** i portalen og bytt nøklene + `VIPPS_ENV=production`.

### Jeg gjør

- Verifiserer den ferdigkodede flyten (`vipps-agreement`, `vipps-callback`, `vipps-charge`) mot **dagens** Vipps Recurring-API — koden bruker en gammel `pricing.type: "LEGACY"` som må sjekkes/oppdateres før test.
- Sørger for at MVA (25 % inkl.) er riktig i Vipps-avtalebeløpet, likt Stripe.
- Tester mot `apitest.vippsmobilepay.com`, så go-live.

---

## Note: flytting til eierselskap senere

En Stripe- og Vipps-konto henger på **én juridisk enhet**. Hvis flyttingen bare er en **holdingstruktur** (eierselskapet eier aksjene i AS-et, mens AS-et fortsatt er driftsselskapet som selger til kundene), berøres **ikke** Stripe/Vipps — de blir stående på AS-et, ingen ny jobb.

Bare hvis **selgerenheten** (den som fakturerer kundene) endres, må Stripe og Vipps settes opp på nytt på den nye enheten. **Sett derfor opp nå på den enheten som skal være driftsselskap på sikt** — er det AS-et, er du ferdig én gang for alle.

---

## Status akkurat nå

- ✅ Kode for MVA lagt inn (env-styrt, deployes når du er klar).
- ⏳ Venter på deg: ny Stripe-konto på AS-et → de fire env-verdiene → redeploy.
- ⏳ Deretter: Vipps-bestilling → test → live.
