# quiz-library — arkiv-pipeline (1000 quizer, nattlig, cache-først)

Bygger et permanent quiz-arkiv på **denne Claude-kontoen** (ikke Anthropic-API-et),
litt mer for hver natt, og lar siden slå opp i arkivet FØR den genererer noe nytt.
Køen er nå **~108 emner** (juster `SUBTOPICS_PER_CATEGORY` i build-taxonomy.py for
flere — sett `None` for ~1008).

## Hvordan det henger sammen

```
Nattskift (Claude-konto, planlagt oppgave)
  → leser quiz-library/topics.json (køen, 1008 emner)
  → genererer grunnede quizer (websøk i økta)
  → appender til quiz-library/library.ndjson        ← fil i repoet
        │
   git push (din vanlige deploy)
        │
  → Netlify library-sync leser library.ndjson
  → UPSERT til Supabase quiz_library                ← varig DB-arkiv
        │
  Live-siden:
  → generate-quiz / quiz-generate-background sjekker quiz_library FØRST (på slug)
       • treff → serverer momentant, GRATIS (ingen API-bruk)
       • bom  → genererer via API, lagrer resultatet i arkivet
  → arkiv.html lister hele quiz_library (spilles via ?lib=<slug>)
```

Sandkassen som kjører nattskiftet har **ikke nettverk**, derfor går veien til DB
via repo-fil + din `git push` (ev. `node scripts/sync-library.mjs` lokalt).

## Filer

- `topics.json` — køen (1008 emner: 12 kategorier × underemner × 3 nivå). Generert
  av `scripts/build-taxonomy.py`. **Gjennomgå/rediger før første natt.**
- `topics-oversikt.md` — lesbar oversikt over alle emner.
- `library.ndjson` — selve arkivet, én quiz per linje. Skrives av nattskiftet.
- `STATUS.json` — teller + ramp-tilstand (skrives av nattskiftet).
- `NATTSKIFT-PROMPT.md` — instruksen den planlagte oppgaven kjører.

## Engangs-oppsett (i denne rekkefølgen)

1. **Kjør DB-migrasjonen** i Supabase → SQL Editor:
   `db/migration-quiz-library.sql` (lager tabellen `quiz_library` + RLS).
2. **Gjennomgå** `quiz-library/topics.json` (juster emner/kategorier ved behov).
   Vil du regenerere: `python3 scripts/build-taxonomy.py`.
3. **Commit + push** alt dette (inkl. `netlify.toml`, funksjonene, tom
   `library.ndjson`). Det aktiverer rutene `/api/library-*` og daglig
   `library-sync` (04:30 UTC).
4. **Start nattskiftet** (planlagt oppgave) — se under.

## Daglig drift

- Nattskiftet kjører automatisk og fyller `library.ndjson`.
- **Du** pusher med jevne mellomrom (din vanlige deploy). Da laster `library-sync`
  opp til Supabase automatisk (eller kjør `node scripts/sync-library.mjs` lokalt
  med `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` i miljøet).
- Sjekk fremdrift: `STATUS.json`, eller `GET /api/library-list?limit=2000`.

## Ramp («øker jevnt, innenfor kontoens grenser»)

Nattens batch = `min(40, 8 + nights_run*4)` → natt 1 = 8, deretter +4/natt opp til
40. Hele køen (~108) er dekket på ~5–6 netter. Juster i `NATTSKIFT-PROMPT.md`
hvis kontoen tåler mer/mindre.

## Kvalitet (ikke-forhandlingsbart)

Nattskiftet grunner hver quiz med websøk og hopper heller over et emne enn å
dikte. Samme vakt som live-generatoren. Faktisk korrekthet > volum.

## Ingen nye hemmeligheter

`library-sync` gjenbruker `SUPABASE_SERVICE_ROLE_KEY` som allerede ligger i
Netlify-env. Sett valgfritt `LIBRARY_SYNC_TOKEN` hvis du vil låse endepunktet.
