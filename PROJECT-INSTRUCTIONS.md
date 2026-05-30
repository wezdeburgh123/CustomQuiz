# Prosjekt-instruksjoner — CustomQuiz / Allmennkunnskap

Les denne **først** i hver nye økt. Den forteller hvordan du skal jobbe med prosjektet, hva som er låst, og hvor ting ligger.

Sist oppdatert: 30. mai 2026.

---

## 1. Hva prosjektet er

**CustomQuiz** er et personlig sideprosjekt av Christian (Dinamo Design, Oslo): en quiz-app på norsk bokmål med to spor:

1. **Daglig fellesquiz** — én quiz, samme for alle, Wordle-stil retention-hook (gratis)
2. **Custom tema-quizer** — innloggede brukere genererer egne (gratis i MVP, paywall i v2)

Lokalt heter mappen `/Quiz generator/`. Tidligere konsept het **Allmennkunnskap** (dobbel l, dobbel n — viktig, aldri "Almenkunnskap"). De originale `quiz-*.html`-prototypene er fra den fasen. Det aktive produktnavnet er nå **CustomQuiz**, og alle `*-v2.html`-filer + `index.html`, `arkiv.html`, `quiz-app-v2.html` bruker CustomQuiz-identiteten.

---

## 2. Språk og tone

- Alt brukervendt innhold på **norsk bokmål** (`<html lang="nb">`)
- Allment voksent publikum, medium vanskelighet som standard
- Editorial/litterær tone — ikke SaaS, ikke gaming-tone
- Når noe markedsføres: rolig, voksent, lest med tillit

---

## 3. Visuell identitet (låst)

Bruk **alltid** dette systemet for nytt UI. Full spec ligger i `design-spec.md`.

```
--bg:        #F5F0E6   varm krem (hovedbakgrunn — aldri ren hvit)
--bg-soft:   #FBF7EE   kort, paneler, svaralternativer
--bg-deep:   #ECE3CE   subtile soner
--ink:       #1F1A14   primær tekst (varmt nær-svart)
--ink-soft:  #4B4338   sekundær brødtekst
--ink-mute:  #7A6F5A   meta og captions
--rule:      #E2D8C2   0.5px borders standard
--accent:    #0A6E5A   dyp teal — eyebrow, progresjon, primærknapp
--accent-soft: #C9E2D8 riktig-svar-bakgrunn
--accent-deep: #074538 hover/pressed
```

Typografi (tre familier, brukt disiplinert):
- **Fraunces** — kun spørsmål, titler, dommer. `<em>` italic for emfase.
- **Manrope** — alt UI og brødtekst
- **JetBrains Mono** — eyebrows og labels, UPPERCASE + letter-spacing 0.15–0.20em

**Strukturelle grep:** maks container 760px (avisbredde), 8-grid avstander, ingen drop shadow, ingen gradient, ingen "glossy SaaS". Mobile-first fra 360px.

---

## 4. Tech-stack

**Live MVP (det som faktisk kjører nå):**

| Lag | Valg |
|---|---|
| Frontend | Statisk HTML på **Netlify** (`index.html`, `arkiv.html`, `quiz-app-v2.html`) — ingen build |
| AI | Claude API via Netlify Function `/api/generate-quiz` (`netlify/functions/generate-quiz.js`) — nøkkel (`ANTHROPIC_API_KEY`) **aldri** i frontend, kun i Netlify env |
| Bibliotek | `quizzes-data.json` — ferdiglagde quizer, utvides av nattjobben (`scripts/append-quizzes.py`) |
| Daglig generering | Scheduled task `customquiz-nattlig-generering` kl 03:00 (Claude-side, ikke `pg_cron` ennå) |
| Deploy | **Manuelt** — dra mappen inn på app.netlify.com. Ukentlig Slack-påminnelse søndag 20:00. |
| Domene | `customquiz.no` (primær) + `customquiz.online` (sekundær) — ikke registrert ennå |

**Planlagt for v2 (ikke bygget):** Next.js på Vercel, Supabase (Auth + DB, Frankfurt), `pg_cron` for daglig quiz, Brevo for email. Next.js-mappestruktur ligger i `repo-struktur.md` — følg den når migrasjonen faktisk starter.

---

## 5. Hvor du finner ting

| Fil | Innhold |
|---|---|
| `index.html` | CustomQuiz forside (statisk prototype) |
| `arkiv.html` | Quiz-arkiv med filter/sortering |
| `quiz-app-v2.html` | Mest utviklede app-skall — utgangspunkt for Next.js-migrasjon |
| `quizzes.js` | Fallback-bibliotek — fjernes når ekte API er live |
| `*-v2.html` | Quiz-prototyper i CustomQuiz-stil (nº 01–08) |
| `quiz*.html`, `oslo-quiz*.html`, `klinikk-quiz.html`, etc. (uten `-v2`) | Originale Allmennkunnskap-prototyper, beholdt som referanse |
| `IMG/` | Bilder og kategori-illustrasjoner |
| `MVP-plan.md` | Uke-for-uke plan, kostnadsestimat, arkitekturskisse, DB-skjema |
| `CRM-plan.md` | Email-loop, Brevo-oppsett, segmentering, automasjon |
| `design-spec.md` | Full visuell identitet og komponentbibliotek |
| `prompt-bibliotek.md` | Prompts for logo, kategori-illustrasjoner, OG-bilder, video |
| `repo-struktur.md` | Next.js-mappestruktur og oppstartskommandoer |

Levende status (hva som er gjort/mangler/prioritert) ligger i Claudes memory: `customquiz-status.md`.

---

## 6. Arbeidsprinsipper

**Gjør:**
- Skriv konsist på norsk bokmål
- Foreslå konkrete leveranser, ikke lange forklaringer
- Bruk AskUserQuestion når et arkitekturvalg står åpent
- Marker `customquiz-status.md` når en P0–P4-oppgave flyttes
- Hold designspråket konsistent — sjekk mot `design-spec.md` før du bygger nytt UI
- Ikke bland CustomQuiz-stilen (krem/teal) med den gamle Allmennkunnskap-stilen (mørk)

**Ikke gjør:**
- Aldri skriv "Almenkunnskap" — det er "Allmennkunnskap" (dobbel l, dobbel n)
- Aldri putt API-nøkler i frontend-kode eller GitHub
- Aldri legg til SaaS-stil shadows, gradients eller glow
- Ikke bygg betalingsløp i MVP — gratis først, paywall i v2
- Ikke be Christian bekrefte små rutinevalg — bare gjør jobben og flagg det som faktisk krever et valg

---

## 7. Neste steg

Live-MVP er allerede oppe på Netlify (statisk HTML + AI-funksjon). Neste store milepæl er backend: Supabase (auth, lagring, daglig quiz, godkjenning) — se `customquiz-status.md` P1–P3. NB: ta proaktivt opp den normaliserte spørsmålsbanken (P1-punkt 8) når Supabase settes opp.

Hvis Christian sier **"kjør i gang uke 1"** / vil migrere til Next.js: følg `MVP-plan.md` §Uke 1 og `repo-struktur.md` — scaffold Next.js, migrer `quiz-app-v2.html` til React-komponenter, bygg `/api/generate-quiz` i app-router. Dette er et bevisst framtidig steg, ikke noe som haster.

Hvis han spør om status: les `customquiz-status.md` i Claudes memory.

Hvis han ber om en ny prototype-quiz: bruk CustomQuiz-stilen fra `design-spec.md`, ikke det gamle mørke uttrykket.

---

## 8. Personvern og brand

- Prosjektet er Christians personlige, ikke et Dinamo-oppdrag — ikke flagg som Dinamo
- GDPR: bruk Dinamos standardmal, men pakk den diskret i footer + minimal cookie-banner
- Logo og signaturmotiv er ennå ikke ferdig designet — prompts ligger i `prompt-bibliotek.md` §1
