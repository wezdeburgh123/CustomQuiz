# VM-runde-utkast — Pre-game: Norge–Frankrike (gruppefinale, gruppe I)

> Generert + faktasjekket **24. juni 2026** (av VM-innholdsvakta). **Pre-game** — kun verifiserbar historikk og status, INGEN påstander om den uspilte kampen. Klar til din review-gate.
> Slug: `pregame-norge-frankrike` · num `13` · sort `13` · status `locked` · hero_img `vm-gruppespill-1`.

## Kampen
**Norge–Frankrike, fredag 26. juni, kl. 21 norsk tid, Gillette Stadium (Foxborough).** Gruppefinale i gruppe I. Begge lag står med 6 poeng og er allerede klare for sluttspillet — kampen avgjør kun gruppeseieren. Bør publiseres **før avspark fredag**.

## Faktasjekk-dom: ✅ KLAR FOR REVIEW
Alle 10 spørsmål er websøk-grunnet 24. juni og kryss-sjekket mot uavhengige kilder (FIFA, ESPN, Wikipedia, 11v11, Sky Sports, FOX):

- **Gruppe I-status:** Norge og Frankrike begge 6 poeng, begge videre; fredag avgjør gruppeseier (ESPN + Sky + Wikipedia)
- **Norges resultater:** 4–1 Irak, 3–2 Senegal — Haaland fire mål (allerede live-verifisert)
- **Frankrike:** 2 VM-titler (1998 hjemme 3–0 Brasil, 2018 4–2 Kroatia); to tapte finaler på straffer (Italia 2006, Argentina 2022) (FIFA + Wikipedia)
- **Deschamps:** vant VM som kaptein 1998 + trener 2018; 3. mann med begge (etter Zagallo/Beckenbauer); slutter etter VM 2026 (FIFA + Wikipedia)
- **Mbappé:** Frankrikes mestscorende landslagsspiller gjennom tidene (ESPN-statistikk)
- **Head-to-head:** første møte 1923, Norge vant 2–0 i Paris; sist møttes i 2014 (11v11 + flere H2H-kilder)

Ingen overlapp i tema/vinkel med tidligere quizer (pregame-irak-norge handlet om Irak; denne om Frankrike + gruppefinale-situasjonen).

## Spørsmål (riktig svar står først her; `build-vm-seed.py` stokker alternativene)

1. **Gruppe I** — Hva står egentlig på spill når Norge møter Frankrike 26. juni?
   ✅ Gruppeseieren — begge lag er allerede klare for sluttspillet · Taperen ryker ut · Norges VM-plass · Frankrikes VM-plass
2. **Norge** — Norge er ubeseiret før gruppefinalen. Hvilke to seire tok de?
   ✅ 4–1 over Irak og 3–2 over Senegal · 2–0/1–0 · 3–1 over begge · 4–1 Senegal og 3–2 Irak
3. **Haaland** — Hvor mange mål har Haaland scoret i VM 2026 før gruppefinalen?
   ✅ Fire · To · Seks · Tre
4. **Frankrike** — Hvor mange ganger har Frankrike vunnet VM?
   ✅ To (1998 og 2018) · Én · Tre · Fire
5. **Frankrike** — Hvilken sjelden dobbel-bragd har Didier Deschamps i VM?
   ✅ Vunnet VM både som kaptein (1998) og trener (2018) · Trent fire landslag til gull · Aldri tapt VM-kamp som trener · Vært dommer i en finale
6. **Mbappé** — Hvilken fransk rekord satte Mbappé tidlig i VM 2026?
   ✅ Frankrikes mestscorende landslagsspiller gjennom tidene · Yngste VM-målscorer · Første franskmann med VM-hat-trick · Mestkappede spiller
7. **Stjernemøte** — Hvilke to spisser rammer dette oppgjøret seg ofte rundt?
   ✅ Erling Haaland og Kylian Mbappé · Ødegaard og Griezmann · Sørloth og Giroud · Haaland og Messi
8. **Historie** — Norge og Frankrike møttes første gang i 1923. Hvem vant?
   ✅ Norge, 2–0 i Paris · Frankrike 3–0 · Uavgjort · Avlyst
9. **Frankrike** — Frankrike har tapt to VM-finaler på straffer. Mot hvilke land?
   ✅ Italia (2006) og Argentina (2022) · Brasil/Kroatia · Spania/Tyskland · Argentina(2006)/Italia(2022)
10. **VM 2026** — Hvorfor er det historisk at Norge spiller denne gruppefinalen?
    ✅ Norges første VM siden 1998 · Norges aller første VM · Første gang Norge vinner en gruppe · Norge er regjerende mester

## Slik seeder + publiserer du (3 steg)

**Steg 1 — kjørt allerede:** Entry lagt inn i `scripts/build-vm-seed.py` og scriptet kjørt (13 quizer, 130 spm, balansert fasit 26/36/37/31). `event-quizzes/vm-2026.json` og `db/seed-vm-2026.sql` regenerert.

**Steg 2 — lim inn i Supabase (SQL Editor):** bruk den trygge enkelt-fila (rører kun den nye raden):
`/Users/christian/Documents/Claude/Projects/Quiz generator/db/seed-pregame-norge-frankrike-only.sql`

**Steg 3 — publiser (flip locked → open), helst før avspark fredag 26.6:**
```sql
update public.event_quizzes
set status = 'open'
where event_id = 'vm-2026' and slug = 'pregame-norge-frankrike';
```

## ⚠️ Re-lås-fellen (trygt)
Alle 12 eksisterende quizer står `open` både live og i kildefila; kun den nye står `locked`. En full kjøring av `seed-vm-2026.sql` ville derfor ikke re-låse noe. Enkelt-fila over rører uansett bare den nye raden.

## Kilder (faktasjekk 24. juni 2026)
- Gruppe I-stilling etter MD2 — Sky Sports: https://www.skysports.com/football/news/12098/13543102/world-cup-2026-group-i-guide-fixtures-schedule-standings-and-odds-for-france-senegal-iraq-and-norway
- Norge–Frankrike fixture (26. juni, Foxborough) — ESPN: https://www.espn.com/soccer/story/_/id/48939282/2026-fifa-world-cup-fixtures-results-match-schedule-group-stage-knockout-rounds-bracket
- Deschamps kaptein 1998 / trener 2018 — FIFA: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/didier-deschamps-coaching-journey
- Frankrikes VM-finaler (1998, 2006, 2018, 2022) — Wikipedia: https://en.wikipedia.org/wiki/France_national_football_team
- Mbappé fransk rekordscorer / VM-statistikk — ESPN: https://www.espn.com/soccer/story/_/id/49145571/fifa-world-cup-2026-stats-lionel-messi-all-goalscorer-18-kylian-mbappe-miroslav-klose-16-record-100-haaland
- Norge–Frankrike H2H (første møte 1923, sist 2014) — 11v11: https://www.11v11.com/teams/france/tab/opposingTeams/opposition/Norway/
- Haaland/Mbappé-vinkel — ESPN: https://www.espn.com/soccer/story/_/id/49150438/haaland-collision-course-mbappe-world-cup-better-it
