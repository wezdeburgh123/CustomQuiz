# CustomQuiz — opp på Netlify

Kort vei fra mappe til live nettside med ekte AI-generering. Alt er klart; du må gjøre to ting: **deploye** og **legge inn API-nøkkelen**.

---

## Hva som er nytt i denne mappen

- `netlify/functions/generate-quiz.js` — serverless-funksjon som holder Anthropic-nøkkelen trygt på serveren og lager quizene. Nøkkelen kommer **aldri** ut i nettleseren.
- `netlify.toml` — Netlify-oppsett (statisk side + funksjon, pen URL `/api/generate-quiz`).
- `quizzes-data.json` — **57 ferdiglagde quizer** (570 spørsmål) på tvers av alle kategorier. Vises i arkivet og kan spilles med én gang.
- `quiz-app-v2.html` er koblet til funksjonen, og kan spille en arkiv-quiz via `quiz-app-v2.html?quiz=<id>`.
- `arkiv.html` laster biblioteket automatisk.

---

## Steg 1 — Deploy (velg ÉN vei)

### Vei A — Dra og slipp (raskest, ingen verktøy)
1. Gå til **app.netlify.com** og logg inn.
2. Klikk **Add new site → Deploy manually**.
3. Dra hele mappen **«Quiz generator»** inn i feltet.
4. Vent til den er publisert. Du får en adresse som `https://navn-xyz.netlify.app`.

> Netlify oppdager `netlify.toml` og bygger funksjonen automatisk. Ingen byggekommando trengs.

### Vei B — Netlify CLI (én kommando)
```bash
npm install -g netlify-cli
cd "Quiz generator"
netlify deploy --prod
```
Følg innloggingen i nettleseren første gang.

### Vei C — GitHub (best på sikt: auto-deploy ved endringer)
Legg mappen i et privat GitHub-repo → i Netlify: **Add new site → Import from Git** → velg repoet. Publish-mappe `.`, ingen byggekommando.

---

## Steg 2 — Legg inn API-nøkkelen (kritisk)

Uten denne faller appen tilbake til demo-modus.

1. I Netlify: **Site configuration → Environment variables → Add a variable**.
2. Legg til:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** nøkkelen din fra console.anthropic.com
3. (Valgfritt) Legg til `QUIZ_MODEL` hvis du vil styre modellen, f.eks. `claude-sonnet-4-6`.
4. **Trigger deploys → Deploy site** på nytt, så funksjonen plukker opp nøkkelen.

> Lag gjerne en egen nøkkel kun til dette prosjektet, så kan du trekke den tilbake uavhengig.

---

## Steg 3 — Test

1. Åpne nettsiden.
2. Gå til **Generator** → velg et tema → **Generer quiz**.
   - Funker det? Da er live AI på. ✅
   - Får du «demo-modus»-banner? Da mangler eller feiler nøkkelen — sjekk steg 2 og at du redeployet.
3. Gå til **Arkivet** — der ligger de 57 ferdige quizene. Klikk en for å spille.

### Teste lokalt før deploy (valgfritt)
```bash
npm install -g netlify-cli
cd "Quiz generator"
netlify dev    # kjører siden + funksjonen lokalt med env-nøkkelen
```

---

## Verdt å vite

- **Kostnad:** Hver live-generering er et lite API-kall (funksjonen er kappet til 4000 tokens). De 57 arkiv-quizene koster ingenting å spille — de er ferdiglaget.
- **Kvalitet:** De ferdige quizene er AI-skrevet og maskinvaliderte (4 alternativer, riktig svar er stokket jevnt). Skum gjennom dem før en offentlig lansering — i tråd med din egen plan om manuell godkjenning.
- **Sikkerhet:** Funksjonen tar bare imot `tema/nivå/antall` og lager kun quizer — den er ikke en åpen Claude-kanal. Nøkkelen ligger kun i Netlify, aldri i koden.
- **Neste steg (v2, ikke nødvendig nå):** innlogging + lagring (Supabase), daglig fellesquiz kl. 03:00, og betaling. Se `MVP-plan.md`.
