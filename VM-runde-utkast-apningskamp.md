# VM-runde-utkast — Åpningskampen (Modus A)

> Generert + faktasjekket 9. juni 2026. **Modus A** (stabile fakta, ingen resultater — riktig modus, siden ingen VM-kamp er spilt ennå). Klar til din review-gate.
> Når du har lest og godkjent: lim dict-blokka inn i `QUIZZES` i `scripts/build-vm-seed.py`, kjør `python3 scripts/build-vm-seed.py`, så kjør `db/seed-vm-2026.sql` i Supabase. Står `locked` til du flipper til `open`.

## Faktasjekk-dom: ✅ KLAR FOR REVIEW
Alle 10 spørsmål er websøk-grunnet 9. juni mot FIFA, Wikipedia og store medier. Ingen volatile fakta (ingen resultater, ingen «hvem går videre»). Stadionnavn dobbeltsjekket: historisk/folkelig **Estadio Azteca**; Banorte-sponsornavnet er **forbudt under VM**, FIFA bruker «Estadio Ciudad de México» / «Mexico City Stadium» — derfor formulert så det står seg.

## Spørsmål (riktig svar står først / indeks 0; `build-vm-seed.py` stokker)

1. **Arena** — Hvilket stadion er vert for åpningskampen i VM 2026?
   ✅ Estadio Azteca i Mexico by · Estadio BBVA i Monterrey · MetLife Stadium i New Jersey · SoFi Stadium i Los Angeles
2. **Historie** — Hvilken rekord setter Estadio Azteca med åpningskampen i 2026?
   ✅ Første stadion som er vert for tre VM-åpningskamper · Største stadion i VM-historien · Første stadion med tak i et VM · Eneste stadion brukt i fem ulike VM
3. **Historie** — Estadio Azteca er det første stadionet med to VM-finaler. Hvilke år?
   ✅ 1970 og 1986 · 1970 og 1994 · 1986 og 2002 · 1962 og 1978
4. **Historie** — Hvem vant VM-finalen på Estadio Azteca i 1970?
   ✅ Brasil · Italia · Vest-Tyskland · Uruguay
5. **Stjerner** — Hvem står bak både «Guds hånd» og «århundrets mål» på Azteca i 1986?
   ✅ Diego Maradona · Pelé · Michel Platini · Gary Lineker
6. **Gruppe A** — Hvilket lag møter vertsnasjonen Mexico i åpningskampen?
   ✅ Sør-Afrika · Sør-Korea · Tsjekkia · USA
7. **Gruppe A** — Hvilke tre lag er i gruppe A sammen med Mexico?
   ✅ Sør-Afrika, Sør-Korea og Tsjekkia · Sør-Afrika, Japan og Polen · Sør-Korea, Tsjekkia og Uruguay · Sør-Afrika, Sør-Korea og Kroatia
8. **Kuriosa** — VM 2026 er det første med tre vertsnasjoner. Hvilke?
   ✅ USA, Mexico og Canada · USA, Mexico og Guatemala · Canada, Mexico og Costa Rica · USA, Canada og Brasil
9. **Rekord** — Hvor mange lag deltar i VM 2026 — tidenes største sluttspill?
   ✅ 48 · 32 · 40 · 64
10. **Format** — Hvordan er gruppespillet i VM 2026 satt opp?
    ✅ 12 grupper med 4 lag · 8 grupper med 6 lag · 16 grupper med 3 lag · 4 grupper med 12 lag

## Klar til innliming i `scripts/build-vm-seed.py` (legg til i `QUIZZES`)

```python
  {
   "slug":"apningskamp","num":"06","phase":"Åpning","status":"locked","sort":6,
   "hero_img":"vm-gruppespill-1",
   "title":"Åpningskampen — VM er i gang",
   "sub":"Storyline, arena og gruppe A før Mexico–Sør-Afrika.",
   "difficulty":"lett",
   "questions":[
     Q("Arena","Hvilket stadion er vert for åpningskampen i VM 2026?",
       ["Estadio Azteca i Mexico by","Estadio BBVA i Monterrey","MetLife Stadium i New Jersey","SoFi Stadium i Los Angeles"],0,
       "Åpningskampen Mexico–Sør-Afrika spilles på Estadio Azteca 11. juni — under VM offisielt «Estadio Ciudad de México» etter FIFAs sponsorregler."),
     Q("Historie","Hvilken historisk rekord setter Estadio Azteca med åpningskampen i 2026?",
       ["Første stadion som er vert for tre VM-åpningskamper","Største stadion i VM-historien","Første stadion med tak i et VM","Eneste stadion brukt i fem ulike VM"],0,
       "Azteca var åpningsarena også i 1970 og 1986 — 2026 blir den tredje."),
     Q("Historie","Estadio Azteca er det første stadionet som har vært vert for to VM-finaler. Hvilke år?",
       ["1970 og 1986","1970 og 1994","1986 og 2002","1962 og 1978"],0,
       "Mexico arrangerte VM i både 1970 og 1986, begge med finale på Azteca."),
     Q("Historie","Hvem vant VM-finalen på Estadio Azteca i 1970?",
       ["Brasil","Italia","Vest-Tyskland","Uruguay"],0,
       "Brasil slo Italia 4–1 og sikret sin tredje VM-tittel, med Pelé på laget."),
     Q("Stjerner","Hvilken spiller står bak både «Guds hånd» og «århundrets mål» på Estadio Azteca i 1986?",
       ["Diego Maradona","Pelé","Michel Platini","Gary Lineker"],0,
       "Begge mål kom mot England i kvartfinalen; Argentina vant VM-et det året."),
     Q("Gruppe A","Hvilket lag møter vertsnasjonen Mexico i åpningskampen?",
       ["Sør-Afrika","Sør-Korea","Tsjekkia","USA"],0,
       "Mexico–Sør-Afrika åpner mesterskapet 11. juni."),
     Q("Gruppe A","Hvilke tre lag er i gruppe A sammen med Mexico?",
       ["Sør-Afrika, Sør-Korea og Tsjekkia","Sør-Afrika, Japan og Polen","Sør-Korea, Tsjekkia og Uruguay","Sør-Afrika, Sør-Korea og Kroatia"],0,
       "Gruppe A spilles fra 11. til 24. juni."),
     Q("Kuriosa","VM 2026 er det første mesterskapet med tre vertsnasjoner. Hvilke?",
       ["USA, Mexico og Canada","USA, Mexico og Guatemala","Canada, Mexico og Costa Rica","USA, Canada og Brasil"],0,
       "Kampene fordeles på de tre landene fra 11. juni til 19. juli."),
     Q("Rekord","Hvor mange lag deltar i VM 2026 — tidenes største sluttspill?",
       ["48","32","40","64"],0,
       "Utvidet fra 32 lag; totalt 104 kamper, mot 64 tidligere."),
     Q("Format","Hvordan er gruppespillet i VM 2026 satt opp?",
       ["12 grupper med 4 lag","8 grupper med 6 lag","16 grupper med 3 lag","4 grupper med 12 lag"],0,
       "De to beste i hver gruppe, pluss de åtte beste treerne, går videre til en ny 32-delsfinale."),
   ]
  },
```

> `hero_img:"vm-gruppespill-1"` er valgfritt — bytt til et annet eksisterende VM-motiv om du heller vil (f.eks. `vm-vertsbyer`).

## Kilder (faktasjekk 9. juni 2026)
- 2026 FIFA World Cup — Wikipedia: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup
- 2026 FIFA World Cup Group A — Wikipedia: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A
- Estadio Azteca — Wikipedia: https://en.wikipedia.org/wiki/Estadio_Azteca
- FIFA — Estadio Azteca / Mexico City to host opening match: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/estadio-azteca-mexico-city-host-opening-match-world-cup-2026
- ESPN — Azteca renamed Banorte (sponsornavn forbudt under VM): https://www.espn.com/soccer/story/_/id/44253209/estadio-azteca-banorte-new-name-world-cup-2026-remodel
