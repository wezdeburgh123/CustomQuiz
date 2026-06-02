# Prosjekt-instruksjoner — CustomQuiz

Les denne **først** i hver nye økt. Den forteller hvordan du jobber med prosjektet, hva som er låst, og hvor ting ligger.

Sist oppdatert: **2. juni 2026** (full omskriving etter kodegjennomgang — den forrige versjonen var fra prototypefasen og var utdatert).

> **Levende status** (hva som er gjort/mangler/prioritert til enhver tid) ligger i Claudes memory: `customquiz-status.md`. Dette dokumentet er det stabile «hvordan jobbe»-laget; statusfila er det bevegelige laget. Spør Christian «hvor er vi» → les statusfila.

---

## 1. Hva prosjektet er

**CustomQuiz** er Christians personlige sideprosjekt (Dinamo Design, Oslo): en quiz-app på norsk bokmål, eget merke — **ikke** et Dinamo-oppdrag. Live på **customquiz.no**. To spor:

1. **Daglig fellesquiz** — én quiz, samme for alle, Wordle-stil retention-hook (gratis). Streak + ukentlig ledertavle for innloggede.
2. **Custom tema-quizer** — innloggede brukere genererer egne quizer med Claude (websøk-grunnet for faktakvalitet).

Lokalt heter mappen `/Quiz generator/`. Tidligere het konseptet **Allmennkunnskap** (dobbel l, dobbel n — viktig, aldri «Almenkunnskap»). De originale `quiz-*.html`-prototypene (uten `-v2`) er fra den fasen og beholdes kun som referanse. Aktivt produkt er **CustomQuiz** (`index.html`, `arkiv.html`, `quiz-app-v2.html`, `dagens.html`, `min-side.html`).

---

## 2. Språk og tone

- Alt brukervendt innhold på **norsk bokmål** (`<html lang="nb">`).
- Allment voksent publikum, medium vanskelighet som standard.
- Editorial/litterær tone — ikke SaaS, ikke gaming.
- Markedsføring: rolig, voksent, lest med tillit.

---

## 3. Visuell identitet (LÅST)

Bruk **alltid** dette systemet for nytt UI. Full spec i `design-spec.md` og memory `customquiz-design-system`.

```
--bg:          #F5F0E6   varm krem (hovedbakgrunn — aldri ren hvit)
--bg-soft:     #FBF7EE   kort, paneler, svaralternativer
--bg-deep:     #ECE3CE   subtile soner
--ink:         #1F1A14   primær tekst (varmt nær-svart)
--ink-soft:    #4B4338   sekundær brødtekst
--ink-mute:    #7A6F5A   meta og captions
--rule:        #E2D8C2   0.5px borders standard
--accent:      #0A6E5A   dyp teal — eyebrow, progresjon, primærknapp
--accent-soft: #C9E2D8   riktig-svar-bakgrunn
--accent-deep: #074538   hover/pressed
```

Typografi (tre familier, disiplinert):
- **Fraunces** — kun spørsmål, titler, dommer. `<em>` italic for emfase.
- **Manrope** — alt UI og brødtekst.
- **JetBrains Mono** — eyebrows og labels, UPPERCASE + letter-spacing 0.15–0.20em.

**Strukturelt:** maks container ~760px (avisbredde), 8-grid avstander, ingen drop shadow, ingen gradient, ingen «glossy SaaS». Mobile-first fra 360px.

---

## 4. Tech-stack (det som faktisk kjører nå)

| Lag | Valg |
|---|---|
| Frontend | Statisk HTML på **Netlify** (`index.html`, `arkiv.html`, `quiz-app-v2.html`, `dagens.html`, `min-side.html`, `auth.js`) — ingen build. (Next.js-migrasjon ble forlatt; vi ble på statisk HTML.) |
| Backend | **Netlify Functions** (Node 18+, esbuild). Avhengigheter: `stripe`, `@supabase/supabase-js`. |
| AI | Claude API server-side. Modell **`claude-sonnet-4-5-20250929`** (FULLT datert navn — alias gir 404). Websøk-verktøy for custom-quizer. Nøkkel kun i Netlify env, aldri i frontend. |
| DB + Auth | **Supabase** (prosjekt `agygcltvhkvokgpmwmxf`, EU). Innlogging = **8-sifret OTP-kode** på e-post (ikke magic link). |
| E-post | **Brevo** transaksjonell, avsender `hei@customquiz.no` (DKIM/DMARC verifisert). SMTP brukt i Supabase Auth. |
| Betaling | **Stripe** (kort + Apple Pay) verifisert i testmodus. **Vipps Recurring** kodet, venter på org.nr. Begge skriver til `subscribers`. |
| Deploy | **Continuous deployment fra GitHub** (`wezdeburgh123/CustomQuiz`, branch `main`). Christian deployer via terminal. |
| Domene | `customquiz.no` (primær) + `dagligquiz.no` (redirect), hos Uniweb. |

---

## 5. Deploy-arbeidsflyt

Siden auto-deployer fra GitHub. Env-endringer i Netlify krever en **ny deploy** for at funksjonene plukker dem opp. Christian kjører fra terminalen:

```bash
cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
git commit --allow-empty -m "chore: redeploy"   # tom commit hvis bare env endret
git push
```

- Push krever PAT i macOS-nøkkelringen.
- Ved git-lås (`index.lock`): `find .git -name '*.lock' -delete`, så `git push` på nytt.
- Sjekk «Published» i Netlify → Deploys før test.

---

## 6. Hvor du finner ting

| Fil | Innhold |
|---|---|
| `index.html` | Forside |
| `arkiv.html` | Quiz-arkiv (6 gratis + 84 premium) + betalingsmodal + premium-låsing |
| `quiz-app-v2.html` | Generator-skall (~1600 linjer): async websøk-jobb + sync fallback, innlogging-gate, gratis-tier |
| `dagens.html` | Daglig fellesquiz: spilling, streak, ukentlig ledertavle |
| `min-side.html` | Konto-side: abonnementsstatus + «Si opp» |
| `auth.js` | OTP-innloggingsmodal + `window.CQAuth` (delt på alle sider) |
| `netlify/functions/` | All backend (se `customquiz-status.md` for full funksjonsoversikt) |
| `db/*.sql` | Supabase-skjemaer (kjørt): schema, daily-quiz, quiz-jobs, vipps-charges |
| `quizzes-data.json` | Bibliotek (84 quizer); `scripts/append-quizzes.py` utvider |
| `e-post-maler/` | 5 ferdige Brevo-maler |
| `BETALING-plan.md` | Full betalingsarkitektur (Stripe + Vipps + e-post) |
| `MVP-plan.md`, `CRM-plan.md`, `design-spec.md`, `prompt-bibliotek.md` | Strategi/design/innhold |
| `DNS-og-epost-oppsett.md`, `brevo-dns-records.md` | DNS/e-post-oppsett |

---

## 7. Arbeidsprinsipper

**Gjør:**
- Skriv konsist på norsk bokmål; foreslå konkrete leveranser.
- Bruk AskUserQuestion når et arkitektur-/produktvalg står åpent.
- Hold designspråket konsistent — sjekk `design-spec.md` før nytt UI.
- Oppdater `customquiz-status.md` (memory) når en milepæl flyttes — rediger seksjonene, ikke lag ny append-logg.
- Verifiser live-tilstand via JS-probe mot egne `/api`-endepunkter fra customquiz.no.

**Ikke gjør:**
- Aldri skriv «Almenkunnskap» — det er «Allmennkunnskap» (dobbel l, dobbel n).
- Aldri legg API-nøkler/hemmeligheter i frontend eller GitHub. **Christian limer alltid hemmeligheter selv** (Claude limer ikke nøkler, oppretter ikke kontoer, skriver ikke passord).
- Aldri SaaS-stil shadows/gradients/glow.
- Ikke bland CustomQuiz-stilen (krem/teal) med gammel Allmennkunnskap-stil (mørk).
- Ikke mas om småvalg — gjør jobben, flagg det som faktisk krever et valg.

**Tekniske fallgruver (ikke gjenta):**
- Fulle daterte modellnavn (alias 404 → demo-fallback).
- Innlogging = OTP-kode, ALDRI auto-verifiserende magic link (Microsoft Defender skanner lenker og brenner opp tokenet).
- Brevo: maler MÅ være «Active»; `BREVO_SENDER_EMAIL` settes for å unngå @brevosend.com-rewrite.
- Supabase nytt UI: bruk `sb_secret_…` som service-role.
- Stripe-dashbord, checkout.stripe.com og billing.stripe.com er BLOKKERT for nettleser-automatisering — Christian gjør de stegene selv.

---

## 8. Tilgangsnivåer (paywall)

Generatoren har tre nivåer, styrt av env (`_quizcore.checkSubscription`):
1. **ÅPEN** — ingen Supabase-env → alle slipper gjennom.
2. **INNLOGGINGS-SPERRE** — `REQUIRE_LOGIN=true` → krever innlogging, ikke abonnement. **Dette er aktiv tilstand nå.**
3. **ABONNEMENT** — `REQUIRE_SUBSCRIPTION≠false` + alle Supabase-env → krever aktivt abonnement.

Paywallen er altså **ikke håndhevet ennå** med vilje. Skru på ved å sette `REQUIRE_SUBSCRIPTION=true` — men Christian må være abonnent selv først så han ikke låser seg ute.

---

## 9. Personvern og brand

- Personlig prosjekt, ikke Dinamo — ikke flagg som Dinamo.
- GDPR: Dinamos standardmal, diskret i footer + minimal cookie-banner.
- Logo/signaturmotiv ennå ikke designet — prompts i `prompt-bibliotek.md`.

---

## 10. Neste steg (oppsummert — full liste i `customquiz-status.md`)

1. Avklar juridisk enhet (privat vs eget AS) — blokkerer Vipps + Stripe go-live.
2. Skru på paywall når klar.
3. Verifiser gjenstående Stripe-punkter (canceled-overgang, periode-felt, UI-opplåsing).
4. Stripe go-live, deretter Vipps.
5. Resterende e-postflyter, visuelle assets, normalisert spørsmålsbank — etter behov.
