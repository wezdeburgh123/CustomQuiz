# Repo-struktur og oppstart

Følger MVP-planen. Tenkt som referanse når du (eller jeg, i en senere økt) faktisk skal lage prosjektet.

## Foreslått mappestruktur

```
quiz-app/
├─ app/                          # Next.js app router
│  ├─ page.tsx                   # Forside med dagens quiz
│  ├─ generer/page.tsx           # Tema-generator (innlogget)
│  ├─ profil/page.tsx            # Min statistikk + streak
│  ├─ api/
│  │  ├─ generate-quiz/route.ts  # POST: { theme, difficulty, count } -> Quiz
│  │  └─ feedback/route.ts       # POST: feilrapport
│  └─ layout.tsx                 # Globalt layout (fonter, mørk modus)
├─ components/
│  ├─ QuizPlayer.tsx             # Selve quiz-flyten (fra dagens prototype)
│  ├─ QuestionCard.tsx
│  ├─ ResultRecap.tsx
│  └─ ThemePicker.tsx
├─ lib/
│  ├─ supabase.ts                # Klient-side Supabase-klient
│  ├─ supabase-server.ts         # Server-side klient med service_role
│  ├─ claude.ts                  # Wrapper rundt Anthropic SDK
│  └─ validation.ts              # Validerer at AI-output er gyldig quiz-JSON
├─ supabase/
│  ├─ migrations/                # SQL-migrasjoner
│  └─ functions/
│     └─ daily-quiz/             # Edge Function som kjører kl 03:00
├─ public/
│  └─ icons/                     # PWA-ikoner
├─ .env.local                    # ANTHROPIC_API_KEY, SUPABASE_*
├─ next.config.js
├─ package.json
└─ vercel.json
```

## Oppstartskommandoer (uke 1)

Disse trenger ikke kjøres nå — bare oversikt over hva som skjer når vi går i gang.

```bash
# 1. Init Next.js-prosjekt
npx create-next-app@latest quiz-app --typescript --tailwind --app

# 2. Installer avhengigheter
cd quiz-app
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr

# 3. Sett opp Supabase lokalt (valgfritt for utvikling)
npm install -g supabase
supabase init
supabase start

# 4. Koble til Vercel
npm install -g vercel
vercel link
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## Kontoer du trenger å opprette

1. **Vercel** — vercel.com, gratis hobby-plan. Logg inn med GitHub.
2. **Supabase** — supabase.com, gratis tier. Lag prosjekt i Frankfurt-regionen (EU, nær Oslo).
3. **Anthropic API** — console.anthropic.com. Du har sannsynligvis denne allerede. Lag en egen API-nøkkel kun for dette prosjektet, så du kan revoke den uavhengig.
4. **GitHub** — for koden. Privat repo i starten.
5. **Domene** — Domeneshop eller Cloudflare Registrar når navn er bestemt.

## Hva vi tar fra eksisterende filer

Av filene som allerede ligger i mappen, gjenbruker vi:

| Fil | Hvordan |
|---|---|
| `quiz-app.html` | Strukturen i `QuizPlayer.tsx`. Hele fallback-biblioteket fjernes — vi har ekte API nå. |
| `quiz.html`, `quiz-2.html`, `oslo-quiz.html`, `oslo-quiz-puber.html` | Stylingen og det editorial uttrykket kopieres til Tailwind-config og globale CSS-variabler. |
| Promptene i artefaktene | Flyttes til `lib/claude.ts` som en konstant, slik at endringer i promptdesign kan versjoneres. |

## Sikkerhets-sjekkliste før første deploy

- API-nøkkelen ligger kun i Vercel env, aldri i frontend-kode eller GitHub
- Supabase Row Level Security er på for alle tabeller
- Generate-quiz-endpointet krever gyldig Supabase JWT (ikke åpent for verden)
- Rate limit: maks 10 quiz-genereringer per bruker per time (forhindrer at noen tømmer API-budsjettet ditt)
- Personvernerklæring på plass før første eksterne bruker
