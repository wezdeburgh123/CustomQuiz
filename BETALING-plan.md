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
- **Supabase-skjema**: `db/schema.sql` (subscribers + payment_events + RLS).
- **Serverless-funksjoner** (`netlify/functions/`): `create-checkout`, `stripe-webhook`, `vipps-agreement`, `vipps-callback`, `subscription-status`, delt `_supabase.js`.
- **Ruter** lagt i `netlify.toml`, og `package.json` med `stripe` + `@supabase/supabase-js`.

Alt leser hemmeligheter fra env-variabler. Ingenting fungerer før kontoene under er satt opp og nøklene lagt inn.

---

## Hva DU gjør (kontoer/dashboards — kan ikke gjøres fra kode)

### 1. Eget AS / selger
- Avklar at Stripe-kontoen og Vipps-salgsenheten står på eget AS/privat (ikke Dinamo). Vipps Recurring krever org.nr.

### 2. Supabase
- Opprett prosjekt i **Frankfurt (EU)**.
- Kjør `db/schema.sql` i SQL Editor.
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
SUPABASE_URL                 https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY    (service_role — kun server)
STRIPE_SECRET_KEY            sk_test_… → sk_live_…
STRIPE_PRICE_ID              price_…
STRIPE_WEBHOOK_SECRET        whsec_…
VIPPS_CLIENT_ID              …
VIPPS_CLIENT_SECRET          …
VIPPS_SUBSCRIPTION_KEY       … (Ocp-Apim-Subscription-Key)
VIPPS_MSN                    … (Merchant Serial Number)
VIPPS_ENV                    test   (→ prod ved lansering)
```

---

## Hva JEG bygger videre (kode — neste faser)

**Fase A — innlogging.** Magic link-innlogging (Supabase) i frontend, «Min side» (`min-side.html`) med abonnementsstatus, og at e-postfeltet i modalen forhåndsutfylles for innloggede.

**Fase B — innholdslåsing.** Arkivet viser bare 6 quizer for gjester; generatoren krever aktivt abonnement. Viktigst: `generate-quiz.js` må sjekke `subscription-status` server-side før den kaller Claude (ellers kan betalingsmuren omgås og det koster deg API-penger).

**Fase C — Vipps månedlig trekk.** En planlagt funksjon (daglig) som sender `charge` minst 1 dag før forfall på alle aktive Vipps-avtaler, og oppdaterer status ved feilet trekk. (Stripe håndterer fornyelse selv — Vipps må trekkes aktivt av oss.)

**Fase D — kvittering + e-post.** Velkomst/kvittering via Brevo (se `CRM-plan.md`), og «si opp»-lenke (Stripe Customer Portal + Vipps avslutt-avtale).

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
