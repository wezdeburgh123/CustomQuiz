# CustomQuiz — betalingsplan (Stripe + Vipps + innlogging)

Besluttet 30. mai 2026: full bygging. Selger = **privat / eget AS** (ikke Dinamo). Pris = **49 kr/mnd**.

## Kort fortalt: to betalingsspor, én sannhet

Vipps og Apple Pay er ikke samme rør. Apple Pay går rett gjennom Stripe. Vipps-abonnement må gå gjennom Vipps sin egen Recurring API — Stripe sin Vipps-støtte er kun engangsbetaling (privat preview) og duger ikke til abonnement.

```
Bruker → betalingsmodal (arkiv.html)
            ├── "Apple Pay / kort" → Stripe Checkout (subscription)  → stripe-webhook → Supabase
            └── "Betal med Vipps"  → Vipps Recurring v3 (agreement)  → vipps-callback → Supabase
                                                                              ↓
                                                         subscribers.status = 'active'
                                                                              ↓
                                              innholdslåsing (arkiv + generator sjekker status)
```

Begge spor skriver til **samme** `subscribers`-tabell i Supabase. Resten av appen bryr seg bare om `status = 'active'` — ikke hvilket spor pengene kom fra.

## Hvorfor innlogging må komme først

Et abonnement må vite *hvem* som betalte for å kunne låse opp innhold. Identiteten er **e-post** (Supabase magic link). Betalingsmodalen ber derfor om e-post før den sender brukeren til Stripe/Vipps, og den e-posten er nøkkelen som binder sammen betaling og tilgang.

---

## Hva som allerede er bygget (i dag)

- **Betalingsmodal** i `arkiv.html`: «Se abonnementsalternativer» og «Bli abonnent» åpner nå en on-brand modal (49 kr/mnd, e-postfelt, Vipps- og Apple Pay/kort-knapp) i stedet for å navigere til quiz-app-v2. Knappene kaller `/api/create-checkout` og `/api/vipps-agreement` og viser en vennlig melding til backend er koblet på.
- **Supabase-skjema**: `db/schema.sql` (subscribers + payment_events + RLS). Tillegg for Vipps-trekk: `db/migration-vipps-charges.sql` (felt `vipps_next_charge_on` + `vipps_last_charge_id`).
- **Serverless-funksjoner** (`netlify/functions/`): `create-checkout`, `stripe-webhook`, `vipps-agreement`, `vipps-callback`, `subscription-status`, `vipps-charge` (planlagt/daglig trekk), `cancel-subscription` (si opp), delt `_supabase.js` + `_brevo.js` (transaksjonell e-post).
- **Ruter** lagt i `netlify.toml`, og `package.json` med `stripe` + `@supabase/supabase-js`.

Alt leser hemmeligheter fra env-variabler. Ingenting fungerer før kontoene under er satt opp og nøklene lagt inn.

---

## Hva DU gjør (kontoer/dashboards — kan ikke gjøres fra kode)

### 1. Eget AS / selger
- Avklar at Stripe-kontoen og Vipps-salgsenheten står på eget AS/privat (ikke Dinamo). Vipps Recurring krever org.nr.

### 2. Supabase
- Opprett prosjekt i **Frankfurt (EU)**.
- Kjør `db/schema.sql` i SQL Editor. (Har du allerede kjørt det? Kjør i tillegg `db/migration-vipps-charges.sql` for Vipps-trekk-feltene.)
- Slå på **Auth → Email (magic link)**.
- Noter `Project URL`, `anon`-nøkkel (frontend) og `service_role`-nøkkel (kun server).

### 3. Stripe (kort + Apple Pay)
- Opprett produkt **CustomQuiz Premium**, pris **49 kr / måned (recurring, NOK)** → noter `price_…`.
- **Apple Pay**: Settings → Payments → Apple Pay → registrer domenet `customquiz.no` (Stripe legger ut verifiseringsfila automatisk via Checkout).
- Webhook → `https://customquiz.no/api/stripe-webhook`, lytt på `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → noter `whsec_…`.
- Start i **testmodus** (`sk_test_…`) før live.

### 4. Vipps (portal.vippsmobilepay.com)
- Bestill **Recurring Payments** (samme skjema som ePayment) → du får en egen salgsenhet (MSN) for recurring.
- Hent `client_id`, `client_secret`, `Ocp-Apim-Subscription-Key`, `MSN`.
- Test i **testmiljø** (`VIPPS_ENV=test`) først.

### 5. Netlify → Site settings → Environment variables
```
ANTHROPIC_API_KEY            (finnes allerede)
SITE_URL                     https://customquiz.no
SUPABASE_URL                 https://agygcltvhkvokgpmwmxf.supabase.co
SUPABASE_ANON_KEY            (anon public — brukes server-side for å verifisere innlogging)
SUPABASE_SERVICE_ROLE_KEY    (service_role — kun server)
REQUIRE_SUBSCRIPTION         true   (sett "false" for å skru av paywall under testing)
STRIPE_SECRET_KEY            sk_test_… → sk_live_…
STRIPE_PRICE_ID              price_…
STRIPE_WEBHOOK_SECRET        whsec_…
VIPPS_CLIENT_ID              …
VIPPS_CLIENT_SECRET          …
VIPPS_SUBSCRIPTION_KEY       … (Ocp-Apim-Subscription-Key)
VIPPS_MSN                    … (Merchant Serial Number)
VIPPS_ENV                    test   (→ prod ved lansering)
BREVO_API_KEY                xkeysib-…   (Brevo → SMTP & API → API Keys) — for kvittering/velkomst
BREVO_WELCOME_TEMPLATE_ID    2      (valgfri — mal-ID for velkomst i Brevo)
BREVO_RECEIPT_TEMPLATE_ID    3      (valgfri — mal-ID for kvittering)
BREVO_SENDER_EMAIL           hei@customquiz.no   (valgfri override; ellers brukes malens egen avsender)
```

**Brevo:** Lag en API-nøkkel i Brevo (SMTP & API → API Keys) og legg som `BREVO_API_KEY`. Malene #2 (Velkomst) og #3 (Kvittering) er allerede lastet inn (se `e-post-maler/`). Uten `BREVO_API_KEY` hopper koden stille over e-post — alt annet fungerer.

---

## Faser

**Fase A — innlogging. ✅ BYGGET.** Magic link-innlogging (Supabase) via delt `auth.js` (injiserer «Logg inn»/«Min side» + login-modal selv), «Min side» (`min-side.html`) med abonnementsstatus, og e-postfeltet i betalingsmodalen forhåndsutfylles for innloggede. Inkludert i index/arkiv/quiz-app-v2/min-side.

**Fase B — innholdslåsing. ✅ BYGGET.** Arkivet: 6 kuraterte gratis, hele biblioteket (84) er premium og låses opp for aktive abonnenter (via `cq-auth`-event + `/api/subscription-status`). Generatoren krever innlogging + aktivt abonnement; sender Supabase-JWT som Bearer. `generate-quiz.js` håndhever server-side (verifiserer JWT + `subscribers.status=active`) FØR Claude kalles — feiler lukket. Styres av `REQUIRE_SUBSCRIPTION` (sett "false" under testing før betaling er live). Merk: direkte `?quiz=<id>`-spilling av bibliotek-quizer er ikke hard-gatet (statisk innhold i bundelen) — soft-gating der er et senere valg.

## Hva JEG bygger videre (kode — neste faser)

**Fase C — Vipps månedlig trekk. ✅ BYGGET (31. mai 2026).** Planlagt funksjon `netlify/functions/vipps-charge.js` (Netlify Scheduled Function, daglig kl. 06:00 UTC via `netlify.toml`). Den finner aktive Vipps-abonnenter og oppretter neste `charge` (49 kr, DIRECT_CAPTURE, `retryDays: 5`) i forkant av forfall — første trekk 3 dager etter aktivering, deretter månedlig. Sporer forfall i nye felt `vipps_next_charge_on` + `vipps_last_charge_id` (kjør `db/migration-vipps-charges.sql` i Supabase). Idempotent (Idempotency-Key = avtale + forfallsdato → ingen dobbelt-trekk selv om DB-oppdatering feiler). Feilede trekk (kort-avslag) håndteres av Vipps selv via `retryDays` + varsling i appen siden charge er `chargeType: RECURRING`; hvis charge-opprettelse feiler fordi brukeren har stoppet avtalen i appen, slår jobben opp avtalestatus og setter `canceled`/`past_due`. Løpende per-charge betalingsstatus bør på sikt komme via Vipps webhooks (Fase C.2, ikke bygget). Krever ingen nye env-variabler utover de eksisterende Vipps-nøklene.

**Fase D — kvittering + e-post + si opp. ✅ BYGGET (31. mai 2026).**
- **E-post via Brevo**: delt `netlify/functions/_brevo.js` (transaksjonell `POST /v3/smtp/email`, malens egen avsender med mindre `BREVO_SENDER_EMAIL` settes; feiler stille hvis `BREVO_API_KEY` mangler). Velkomst (mal #2) sendes ved første aktivering — fra `stripe-webhook.js` (checkout.session.completed) og `vipps-callback.js` (avtale ACTIVE, kun ved overgang). Kvittering (mal #3) sendes ved betaling — fra `stripe-webhook.js` (kort/Apple Pay) og `vipps-charge.js` (når månedstrekk opprettes). Mal-ID-er overstyrbare via env (default 2/3).
- **Si opp**: `netlify/functions/cancel-subscription.js` (POST, autentisert med Supabase-JWT). Stripe → åpner **Customer Portal** og returnerer `{ kind:"redirect", url }`. Vipps → `PATCH agreement {status:"STOPPED"}` + setter `canceled`, returnerer `{ kind:"done", message }`. Rute `/api/cancel-subscription` i `netlify.toml`. Knapp «Si opp abonnement» lagt på `min-side.html` (kaller endepunktet med Bearer-token; Stripe redirecter, Vipps bekrefter inline).
- GJENSTÅR (valgfritt, senere): Min side bruker enkel `confirm()/alert()` — kan pusses til on-brand dialog. Vipps per-charge betalingsstatus via webhooks (Fase C.2).

---

## Test-rekkefølge før live

1. Supabase-skjema kjørt, Auth på.
2. Stripe i testmodus: kjøp med testkort `4242 4242 4242 4242` → webhook setter `status=active` → `subscription-status` svarer `active`.
3. Vipps i testmiljø: opprett avtale → godkjenn i test-app → `vipps-callback` setter `status=active`.
4. Innholdslåsing: gjest blokkeres, aktiv abonnent slipper inn.
5. Bytt alle nøkler til live, sett `VIPPS_ENV=prod`, ny deploy.

## Kostnad

- Stripe: ingen månedsavgift; ~1,5 % + 1,80 kr per europeisk korttransaksjon (sjekk dine satser). Apple Pay koster ikke ekstra.
- Vipps: transaksjons-/abonnementsgebyr per Vipps-avtalen din.
- Supabase: gratis tier holder lenge.
- Netlify: gratis tier holder for funksjonene.

## Åpne punkter

- Eget AS opprettet, eller kjører vi privat i starten? (påvirker både Stripe og Vipps)
- Årspris i tillegg til 49 kr/mnd? (f.eks. 490 kr/år)
- Gratis prøveperiode (7 dager) ja/nei?
- `min-side.html` — design ikke laget ennå.
