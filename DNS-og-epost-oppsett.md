# DNS- og e-postoppsett — CustomQuiz

Steg-for-steg for å koble domenene til den live Netlify-siden og sette opp e-post. Følg punktene i rekkefølge mens du står i Uniweb- og Netlify-panelene.

Sist oppdatert: 31. mai 2026

---

## Arkitekturen i korte trekk

| Hva | Hvor | Rolle |
|---|---|---|
| DNS (navnetjener) | **Uniweb** | Alle records bor her — web, e-post, Brevo |
| Web / hosting | **Netlify** | Selve siden. DNS peker hit via A/CNAME |
| E-post mottak | **Uniweb Email Essential** | `slett@`, `hei@` — MX-records hos Uniweb |
| E-post sending | **Brevo** | Magic link, kvittering, marketing — via SPF/DKIM |

**Prinsipp:** Behold DNS hos Uniweb. Ikke flytt til Netlify DNS — da slipper du å splitte e-post og web mellom to leverandører.

**Domener:** `customquiz.no` = primær. `dagligquiz.no` = redirect → customquiz.no.

---

## Steg 1 — Koble customquiz.no til Netlify

**I Netlify:**
1. Åpne siden `customquizno` → **Domain management** → **Add a domain**
2. Skriv inn `customquiz.no`, bekreft at du eier det
3. Netlify viser nå hvilke DNS-records du trenger. **Bruk verdiene Netlify viser** — de under er typiske, men sjekk panelet:
   - Apex (`customquiz.no`): **A-record** → `75.2.60.5`
   - `www`: **CNAME** → `<din-side>.netlify.app`

**Hos Uniweb (DNS-administrasjon):**
4. Legg inn A-recorden for apex (verts­navn `@` eller blankt)
5. Legg inn CNAME for `www`
6. Lagre

**Tilbake i Netlify:**
7. Vent til DNS har propagert (oftest minutter, opptil noen timer). Netlify skrur på gratis SSL (Let's Encrypt) automatisk når domenet verifiseres.
8. Sett `customquiz.no` (eller `www`) som **Primary domain**.

**Redirect for dagligquiz.no:**
9. I Netlify: **Add a domain** → `dagligquiz.no` som domenealias. Hos Uniweb legger du samme A/CNAME for `dagligquiz.no`. Netlify sender da automatisk videre til primærdomenet.
   - Alternativt: bruk Uniweb sin egen videresending (301) fra `dagligquiz.no` → `https://customquiz.no` hvis du heller vil styre det der.

✅ **Test:** Åpne `https://customquiz.no` — siden skal laste med gyldig hengelås. Åpne `https://dagligquiz.no` — skal sende deg til customquiz.no.

---

## Steg 2 — E-post mottak (Email Essential)

1. Aktiver **Email Essential** på `customquiz.no` hos Uniweb
2. Opprett adressene du trenger:
   - `slett@customquiz.no` — GDPR-sletteforespørsler (kan videresende til christian@dinamo.no)
   - `hei@customquiz.no` — generell kontakt
   - (legg gjerne til `support@` som alias mot `hei@`)
3. Uniweb legger MX-records inn automatisk siden DNS ligger hos dem. Bekreft at MX-recorden finnes i DNS-oversikten.

✅ **Test:** Send en e-post fra en annen konto til `hei@customquiz.no` og sjekk at den kommer fram.

---

## Steg 3 — Brevo (sending) + Supabase SMTP

**I Brevo:**
1. Opprett konto (velg EU/gratisplan)
2. **Senders, Domains & Dedicated IPs** → legg til `customquiz.no`
3. Brevo gir deg DNS-records for verifisering — typisk:
   - **DKIM** (TXT, eget Brevo-navn)
   - **SPF** (TXT) — Brevo bruker `include:spf.brevo.com`
   - **DMARC** (TXT på `_dmarc`) — start mykt: `v=DMARC1; p=none; rua=mailto:hei@customquiz.no`

**Hos Uniweb (DNS):**
4. Legg inn DKIM-recorden Brevo viser
5. **SPF — viktig:** Et domene kan kun ha ÉN SPF-record. Hvis Uniweb allerede la inn en SPF for postkassen, må du **slå dem sammen** i én record, f.eks.:
   `v=spf1 include:spf.brevo.com include:<uniweb-sin-spf> ~all`
   (bruk det Uniweb og Brevo faktisk oppgir — ikke to separate SPF-linjer)
6. Legg inn DMARC-recorden
7. Tilbake i Brevo: trykk **Verify** — kan ta litt tid mens DNS propagerer

**I Supabase (custom SMTP for magic link):**
8. **Project Settings → Authentication → SMTP Settings** → skru på Custom SMTP
9. Fyll inn Brevos SMTP-detaljer (host `smtp-relay.brevo.com`, port 587, brukernavn + SMTP-nøkkel fra Brevo)
10. Sett avsender til `hei@customquiz.no` (eller `ikke-svar@customquiz.no`)

✅ **Test:** Be om en magic link fra `min-side.html` / login-modalen og bekreft at e-posten kommer raskt og ikke havner i spam.

---

## Steg 4 — Supabase: paywall + domene-justering

Allerede ferdig (31. mai 2026): `db/schema.sql` kjørt, Auth → Email på, anon-nøkkel i `supabase-config.js`, magic link verifisert live. Det som gjenstår:

- [ ] **Når customquiz.no er live (etter steg 1):** oppdater Supabase **Site URL** og **redirect-URL** fra `customquizno.netlify.app` til `https://customquiz.no` (ellers peker magic link-lenkene fortsatt på netlify.app-adressen)
- [ ] Legg env-vars i Netlify for å skru på paywallen: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REQUIRE_SUBSCRIPTION`
- [ ] (Stripe/Vipps-nøkler kommer i en senere fase — se `BETALING-plan.md`)

> Merk: Generatoren står bevisst åpen inntil Supabase-env settes (besluttet 31. mai — lav risiko, lite kreditt). Paywallen aktiveres automatisk når env-varene er på plass.

---

## DNS-records — samlet oversikt (legges hos Uniweb)

| Type | Navn/vert | Verdi | Formål |
|---|---|---|---|
| A | `@` | `75.2.60.5` (bekreft i Netlify) | Web → Netlify |
| CNAME | `www` | `<side>.netlify.app` | Web → Netlify |
| A/CNAME | `dagligquiz.no` | samme som over | Redirect-domene |
| MX | `@` | Uniweb mailserver (auto) | E-post mottak |
| TXT (SPF) | `@` | `v=spf1 include:spf.brevo.com include:<uniweb> ~all` | Sender-godkjenning |
| TXT (DKIM) | Brevo-navn | Brevo-verdi | Sender-signatur |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hei@customquiz.no` | Sender-policy |

---

## Avhengigheter og rekkefølge

1. **Steg 1 først** — uten domenet pekt til Netlify nytter ikke resten.
2. **Steg 2 og 3 kan gjøres parallelt** — begge er bare DNS-records hos Uniweb.
3. **SPF er det vanligste feilpunktet** — pass på at det kun finnes ÉN SPF-record som dekker både Uniweb og Brevo.
4. **Steg 4 er uavhengig av DNS** — kan i prinsippet gjøres når som helst, men magic link fungerer best etter at Brevo-SMTP (steg 3) er på.

DNS-endringer propagerer normalt på minutter, men kan ta opptil 24–48 t i verste fall. Hvis noe ikke virker umiddelbart: vent og test på nytt før du endrer.
