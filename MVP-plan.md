# Quiz-app — MVP-plan

Sist oppdatert: 27. mai 2026

## Beslutninger som ligger fast

| Område | Valg |
|---|---|
| Produktmodell | Hybrid — én daglig fellesquiz + abonnenter genererer egne tema-quizer |
| Lansering | Gratis MVP først, betaling i v2 (Vipps Recurring + Stripe for Apple Pay) |
| Stack | Statisk frontend på Vercel + Supabase (auth/DB) + serverless funksjon som proxyer Claude API |
| Designspråk | Editorial mørk modus, Fraunces (display) + Manrope (tekst), varme jordnære aksenter |
| Språk | Norsk bokmål, voksent allment publikum, medium vanskelighet som standard |

## Hvorfor denne arkitekturen er smart

Den er gratis å drifte før du har brukere. Vercel hobby-plan er $0, Supabase free tier dekker 50 000 månedlige aktive brukere og 500 MB database, og Claude API har pay-as-you-go uten månedlig minimum. Du kan ha appen live samme uke uten å betale en krone før noen faktisk bruker den.

Den er trygg fordi API-nøkkelen din aldri eksponeres i frontend. Alle Claude-kall går via en serverless funksjon på Vercel som leser nøkkelen fra environment variables. Det fjerner hele klassen av "noen tømte API-budsjettet mitt"-problemer som gjelder direkte kall fra nettleseren.

Den skalerer uten omskriving. Når dere er klare for betaling, legger dere bare på Vipps Recurring / Stripe webhooks som oppdaterer et `subscription_status`-felt i Supabase. Frontend leser feltet og åpner/stenger funksjoner. Ingen ny stack.

## MVP-scope — det vi bygger først

**Inn i MVP:**

- Forside med dagens quiz (genereres én gang per døgn, lagres i Supabase, samme for alle)
- Quiz-flyt: ett spørsmål av gangen, progresjonslinje, resultat med full gjennomgang (videreutvikling av eksisterende prototype)
- Tema-generator låst bak gratis registrering: bruker velger tema, nivå, antall — får quiz
- "Rapporter feil"-knapp på hvert spørsmål som skriver til en `feedback`-tabell
- Enkel statistikk per bruker (streak, totalt antall riktige)
- Innlogging via magic link (Supabase Auth — gratis, ingen passordstyr)

**Ut av MVP (kommer i v2):**

- Vipps Recurring og Stripe Apple Pay
- Personlig leaderboard og venner
- Push-varsel når dagens quiz er ute
- iOS- og Android-app (PWA i mellomtiden)
- Admin-grensesnitt for å godkjenne dagens quiz manuelt

## Arkitekturskisse

```
┌─────────────────────────────────────────────────────────┐
│  Nettleser (PWA, fungerer offline etter første besøk)   │
│  • HTML/CSS/JS — bygger på dagens prototype             │
│  • Bruker Supabase JS-klient direkte for auth & data    │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
             │ auth + data                 │ AI-genererte quiz
             ▼                             ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│  Supabase              │   │  Vercel serverless funksjon  │
│  • Postgres-DB         │   │  /api/generate-quiz          │
│  • Auth (magic link)   │   │  • Validerer JWT fra Supabase│
│  • RLS-policies        │   │  • Kaller Claude API         │
│  • Cron (daglig quiz)  │   │  • Validerer JSON-strukturen │
└────────────────────────┘   │  • Returnerer ferdig quiz    │
                             └──────────────┬───────────────┘
                                            │
                                            ▼
                                  ┌──────────────────────┐
                                  │  Claude API          │
                                  │  claude-sonnet-4-5   │
                                  └──────────────────────┘
```

### Database-skjema (Supabase)

```sql
-- Daglige quizer (én rad per dag, samme for alle)
create table daily_quiz (
  id            uuid primary key default gen_random_uuid(),
  published_at  date unique not null,
  theme         text not null,
  difficulty    text not null,
  questions     jsonb not null,
  created_at    timestamptz default now()
);

-- Brukerens svar på en quiz (daglig eller egen)
create table quiz_attempt (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  quiz_id       uuid,                 -- peker til daily_quiz når relevant
  quiz_type     text,                 -- 'daily' | 'custom'
  theme         text,
  answers       jsonb,                -- [{q:1, picked:'B', correct:true}, ...]
  score         int,
  total         int,
  completed_at  timestamptz default now()
);

-- Feilrapportering på spørsmål
create table question_feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete set null,
  quiz_id       uuid,
  question_idx  int,
  reason        text,
  note          text,
  created_at    timestamptz default now()
);
```

### Daglig job (Supabase Edge Function + cron)

Kjører hver natt kl 03:00:

1. Velger et tema fra en kuratert liste (kan rotere automatisk eller plukkes manuelt i admin)
2. Kaller Claude API med samme prompt som tema-generatoren bruker
3. Validerer at JSON-en har 10 spørsmål med 4 alternativer, ett riktig svar, og forklaring
4. Hvis valideringen feiler — prøver igjen med litt høyere `temperature`, opp til 3 ganger
5. Skriver til `daily_quiz` med dagens dato

## Uke-for-uke plan

### Uke 1 — Fundament

- Sett opp GitHub-repo, Vercel-prosjekt og Supabase-prosjekt
- Migrer eksisterende `quiz-app.html` til et Next.js- eller Vite-prosjekt (Next.js anbefales fordi Vercel-funksjonene blir trivielle å skrive)
- Lag `/api/generate-quiz`-funksjonen med samme prompt som dagens prototype
- Bytt fallback-biblioteket i frontend med ekte kall til den nye funksjonen — du har live-generering som faktisk fungerer

### Uke 2 — Auth og lagring

- Sett opp Supabase Auth med magic link
- Lag `quiz_attempt`-tabell og lagre brukerens resultat etter hver quiz
- Lag en enkel "Min profil"-side med streak og statistikk
- Sett opp Row Level Security (RLS) så brukere bare ser egne data

### Uke 3 — Daglig quiz

- Lag `daily_quiz`-tabellen
- Skriv Supabase Edge Function som genererer og lagrer dagens quiz
- Sett opp cron-trigger (Supabase har innebygd cron via `pg_cron`)
- Lag forsiden som henter dagens quiz og viser "Du har gjort dagens quiz — kom tilbake i morgen" etter fullføring

### Uke 4 — Polish og soft launch

- "Rapporter feil"-knapp på hvert spørsmål
- Del-resultat-funksjon ("Dagens quiz: 7/10 🟩🟩🟩🟥🟩🟩🟥🟥🟩🟩")
- PWA-konfigurasjon så folk kan legge til på hjemskjerm
- Domene + SSL via Vercel
- Soft launch til en vennegjeng på 20-50 personer — mål retention etter 7 dager

### Uke 5+ — V2 begynner

Hvis retention ser fornuftig ut (la oss si > 30 % kommer tilbake dag 3), kjør i gang Vipps Recurring og Stripe. Da begynner det å gi mening å sette en pris.

## Kostnadsestimat første 6 måneder

| Tjeneste | Pris | Når slår det inn |
|---|---|---|
| Vercel | $0 | Hobby-plan dekker det. Pro ($20/mnd) først ved seriøs trafikk eller team-funksjoner |
| Supabase | $0 | Free tier dekker 50 000 MAU og 500 MB DB. Pro ($25/mnd) først ved produksjon med backups |
| Claude API | ~$0,01–0,05 per generert quiz | Sonnet 4.5 koster ca $3/M input + $15/M output. Én quiz = ~1500 tokens. Med 100 daglige quizer + 200 custom: ~$15-30/mnd |
| Domene (.no eller .com) | ~150 kr/år | engangskostnad |
| **Sum før betalende brukere** | **~$30/mnd + 150 kr/år** | |

## Avklart 27. mai 2026

1. **Domenenavn:** `customquiz.no` (primær) og `customquiz.online` (sekundær). Begge må sikres samtidig.
2. **Tema-rullering:** Fast ukerytme — mandag historie, tirsdag vitenskap osv. (eksakt fordeling fastsettes når vi setter opp redaksjonell kalender). I tillegg: ukeskonkurranse for registrerte brukere — best sammenlagt skår på alle syv dagene vinner uken.
3. **Kvalitetskontroll:** Manuell godkjenning av dagens quiz før publisering kl 09. Krever en enkel admin-side: AI genererer kveld før, du logger inn neste morgen og approver / regenererer / redigerer enkeltspørsmål.
4. **Branding:** Eget merke — CustomQuiz står alene. Ny visuell identitet skal være lysere enn dagens prototype, bredt appellerende, enkel og seriøs men med avansert craft. Se egen palett-spec.
5. **GDPR:** Bruker Dinamos standardmal for personvern og cookies, men pakker det vekk så det ikke dominerer designet (footer-lenke + minimal cookie-banner som lukkes raskt).

## Nye konsekvenser for planen

- **Uke 1 må også registrere domener.** Domeneshop.no — sjekk om navnene er ledige i dag. Beregnet ~250 kr/år til sammen.
- **Uke 3 utvides:** Daglig quiz får en redaksjonell kalender-tabell i Supabase som styrer hvilket tema som genereres hvilken ukedag. Admin-godkjenning krever ekstra side `/admin/godkjenn` med Magic Link-login + sjekk mot whitelist av e-postadresser.
- **Uke 4 utvides:** Ukeskonkurranse krever en `weekly_leaderboard`-view i Supabase som aggregerer `quiz_attempt` per uke per bruker. Resultatet vises på forsiden — sterkt sosialt retention-grep.
- **Ny komponent: visuell identitet.** Lysere palett må designes før første brukbare frontend. Tre retninger foreslås separat for valg.

## Neste konkrete steg

Når du er klar: si "kjør i gang uke 1", så genererer jeg en startpakke med Next.js-prosjekt, riktig Vercel-konfigurasjon, `/api/generate-quiz`-funksjon og en oppdatert versjon av frontend-prototypen som faktisk kaller den ekte funksjonen. Du får filene rett i denne mappen.
