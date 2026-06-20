# VM-runde-utkast — 20. juni 2026

**Runde:** Gruppespill omgang 2 — oppsummert (del 2)
**Modus:** B (kun ferdigspilte, flerkildebekreftede kamper)
**Dato-cutoff:** 20. juni 2026, kl. ~07:30 (Oslo) — kun kamper helt ferdigspilt per dette tidspunktet
**Slug/num/sort:** `gruppespill-2b` / `10` / `10` (fortsetter etter `gruppespill-2` = 09)
**Status ved seed:** `locked` (Christian flipper til `open` selv)

> Automatisk generert + faktasjekket av VM-innholdsvakta. Klar til din review-gate.

---

## ⚠️ Scoping (les dette først)

`gruppespill-2` (num 09, seedet 19. juni) dekket de sene åpningskampene 15.–17. juni + de
*første* omgang 2-kampene 18. juni (Canada 6–0 Qatar, Mexico 1–0 Sør-Korea). Denne runden tar
de **nye, ferskt ferdigspilte omgang 2-kampene** som er sluttspilt siden — uten overlapp:

| Kamp | Resultat | Spilt | Brukt i |
|------|----------|-------|---------|
| Tsjekkia–Sør-Afrika | 1–1 | 18. juni | Q10 |
| Sveits–Bosnia-Hercegovina | 4–1 | 18. juni | Q7 |
| USA–Australia | 2–0 | 19. juni | Q1, Q2 |
| Skottland–Marokko | 0–1 | 19. juni | Q3, Q4 |
| Brasil–Haiti | 3–0 | natt til 20. juni | Q5, Q6 |
| Tyrkia–Paraguay | 0–1 | natt til 20. juni | Q8, Q9 |

Alle seks er andrerundekamper (omgang 2) for de aktuelle lagene og var **helt ferdigspilt** før
cutoff. **Kveldens kamper 20. juni (Nederland–Sverige kl. 19, Tyskland–Elfenbenskysten kl. 21)
er bevisst utelatt** — de er ikke spilt ennå. Ingen påstander om uspilte/uavklarte kamper, og
ingen «hvem går videre»-formuleringer.

---

## Faktasjekk-dom: ✅ KLAR FOR REVIEW

Alle 10 spørsmål er websøk-grunnet 20. juni **og** kjørt gjennom et eget adversarielt pass der
hvert resultat, hver målscorer og hvert tall er verifisert uavhengig mot minst to pålitelige
kilder (FIFA offisiell, Sky Sports, ESPN, Al Jazeera, NBC, Yahoo, Opta Analyst, Outlook). De mest
slående fakta:

- **USA 2–0 Australia** — selvmål av Cameron Burgess (11.) + Alex Freeman-heading (43.); Pulisic ute med leggskade (NBC + FIFA + Outlook)
- **Skottland 0–1 Marokko** — Ismael Saibari-vinner etter ~70 sekunder, framspilt av Brahim Díaz (101greatgoals + Opta + ESPN + FIFA)
- **Brasil 3–0 Haiti** — Matheus Cunha to mål (23./36.), Vinícius Júnior ett (45+3) (Sky + FIFA + Al Jazeera)
- **Sveits 4–1 Bosnia** — innbytter Johan Manzambi to mål, Vargas + Xhaka (straffe) (Sky + FIFA + ESPN)
- **Tyrkia 0–1 Paraguay** — Matías Galarza-scoring etter drøyt ett minutt; Almirón utvist (Sky + Yahoo + FIFA)
- **Tsjekkia 1–1 Sør-Afrika** — Sadílek tidlig (6.), Mokoena utlignet på straffe (83.) (Sky + FIFA + ESPN)

Bevisst unngått: superlativer som «raskeste mål i hele VM» (kan slås i senere kamper) og all
avansement-/utslagslogikk («klar for sluttspill», «slått ut»). Spørsmålene står stabilt uansett
hva som skjer i resten av turneringen.

---

## De 10 spørsmålene (lesbar form — riktig svar står først)

**1. Resultat —** Hva ble resultatet da USA møtte Australia i Seattle 19. juni?
✅ **2–0 til USA** · 1–0 til USA · 3–1 til USA · 2–2

**2. Kuriosa —** Hvordan kom USAs første mål mot Australia i stand?
✅ **Selvmål av Cameron Burgess** · Straffemål av Folarin Balogun · Frispark direkte i mål · Langskudd av Weston McKennie

**3. Drama —** Marokko slo Skottland 1–0. Når falt det avgjørende målet?
✅ **Etter drøyt ett minutt** · På overtid · Fra straffe i andre omgang · I det 89. minutt

**4. Målscorer —** Hvem scoret Marokkos vinnermål mot Skottland — sitt andre i VM 2026?
✅ **Ismael Saibari** · Brahim Díaz · Hakim Ziyech · Youssef En-Nesyri

**5. Resultat —** Hvordan endte Brasils andre kamp, mot Haiti?
✅ **3–0 til Brasil** · 1–0 til Brasil · 2–2 · 4–1 til Brasil

**6. Stjerner —** Hvem scoret to mål for Brasil mot Haiti?
✅ **Matheus Cunha** · Vinícius Júnior · Rodrygo · Raphinha

**7. Stjerner —** Sveits vant 4–1 over Bosnia-Hercegovina. Hvem ble tomålshelt — fra innbytterbenken?
✅ **Johan Manzambi** · Granit Xhaka · Ruben Vargas · Breel Embolo

**8. Resultat —** Hva ble resultatet i gruppe D-kampen mellom Tyrkia og Paraguay?
✅ **1–0 til Paraguay** · 0–0 · 2–1 til Tyrkia · 1–1

**9. Målscorer —** Hvem scoret Paraguays vinnermål mot Tyrkia, etter drøyt ett minutt?
✅ **Matías Galarza** · Miguel Almirón · Julio Enciso · Antonio Sanabria

**10. Gruppe A —** Sør-Afrika sikret sitt første poeng med 1–1 mot Tsjekkia. Hvordan kom utligningen?
✅ **Straffemål av Teboho Mokoena** · Frisparkmål · Selvmål · Heading på hjørnespark

---

## Dict-blokk — klar til innliming i `QUIZZES` i `scripts/build-vm-seed.py`

Lim inn som ny dict etter `gruppespill-2`-blokka (siste element i lista, rett før den avsluttende `]`).
Riktig svar står først (indeks 0) — `build-vm-seed.py` stokker alternativene deterministisk.

```python
 {
  "slug":"gruppespill-2b","num":"10","phase":"Gruppespill omgang 2","status":"locked","sort":10,
  "hero_img":"vm-gruppespill-1",
  "title":"Runde 2 — flere svar faller",
  "sub":"USA, Marokko, Brasil og Paraguay tar grep — omgang 2-kampene 18.–20. juni.",
  "difficulty":"middels",
  "questions":[
   Q("Resultat","Hva ble resultatet da USA møtte Australia i Seattle 19. juni?",
     ["2–0 til USA","1–0 til USA","3–1 til USA","2–2"],0,
     "USA vant 2–0 på Lumen Field; et selvmål og en heading avgjorde, og Christian Pulisic sto over med leggskade."),
   Q("Kuriosa","Hvordan kom USAs første mål mot Australia i stand?",
     ["Selvmål av Cameron Burgess","Straffemål av Folarin Balogun","Frispark direkte i mål","Langskudd av Weston McKennie"],0,
     "Et innlegg fra Balogun ble styrt i eget nett av Cameron Burgess i det 11. minutt; Alex Freeman stanget inn 2–0 før pause."),
   Q("Drama","Marokko slo Skottland 1–0. Når falt det avgjørende målet?",
     ["Etter drøyt ett minutt","På overtid","Fra straffe i andre omgang","I det 89. minutt"],0,
     "Ismael Saibari curlet inn vinnermålet etter rundt 70 sekunder, framspilt av Brahim Díaz; Scott McTominay ropte forgjeves på straffe sent i kampen."),
   Q("Målscorer","Hvem scoret Marokkos vinnermål mot Skottland — sitt andre i VM 2026?",
     ["Ismael Saibari","Brahim Díaz","Hakim Ziyech","Youssef En-Nesyri"],0,
     "Saibari, som også scoret mot Brasil i åpningskampen, avgjorde tidlig mot Skottland."),
   Q("Resultat","Hvordan endte Brasils andre kamp, mot Haiti?",
     ["3–0 til Brasil","1–0 til Brasil","2–2","4–1 til Brasil"],0,
     "Matheus Cunha scoret to og Vinícius Júnior ett — Brasils første seier i VM 2026 etter 1–1 mot Marokko."),
   Q("Stjerner","Hvem scoret to mål for Brasil mot Haiti?",
     ["Matheus Cunha","Vinícius Júnior","Rodrygo","Raphinha"],0,
     "Cunha scoret i det 23. og 36. minutt; Vinícius Júnior la på til 3–0 på overtid i første omgang."),
   Q("Stjerner","Sveits vant 4–1 over Bosnia-Hercegovina. Hvem ble tomålshelt — fra innbytterbenken?",
     ["Johan Manzambi","Granit Xhaka","Ruben Vargas","Breel Embolo"],0,
     "Innbytter Manzambi scoret to sene mål; Ruben Vargas og Granit Xhaka (straffe) sto for de andre i 4–1-seieren."),
   Q("Resultat","Hva ble resultatet i gruppe D-kampen mellom Tyrkia og Paraguay?",
     ["1–0 til Paraguay","0–0","2–1 til Tyrkia","1–1"],0,
     "Matías Galarza avgjorde tidlig med et langskudd; Tyrkia tapte dermed sin andre kamp på rad."),
   Q("Målscorer","Hvem scoret Paraguays vinnermål mot Tyrkia, etter drøyt ett minutt?",
     ["Matías Galarza","Miguel Almirón","Julio Enciso","Antonio Sanabria"],0,
     "Galarza dunket inn fra utenfor sekstenmeteren etter rundt ett minutt; Paraguays Miguel Almirón ble senere utvist."),
   Q("Gruppe A","Sør-Afrika sikret sitt første poeng med 1–1 mot Tsjekkia. Hvordan kom utligningen?",
     ["Straffemål av Teboho Mokoena","Frisparkmål","Selvmål","Heading på hjørnespark"],0,
     "Michal Sadílek scoret tidlig for Tsjekkia, men Teboho Mokoena utlignet på straffe sju minutter før slutt."),
  ]
 },
```

Etter innliming: `python3 scripts/build-vm-seed.py` (validerer + stokker + emitter), så kjør den
oppdaterte `db/seed-vm-2026.sql` i Supabase (eller en trygg `gruppespill-2b-only`-SQL). Runden står
`locked` til du flipper til `open`:

```sql
update public.event_quizzes
set status = 'open'
where event_id = 'vm-2026' and slug = 'gruppespill-2b';
```

> ⚠️ Re-lås-fellen: hvis du kjører **hele** `db/seed-vm-2026.sql` på nytt, sjekk først at de
> allerede åpne rundene (`apningskamp`, `pregame-irak-norge`, `gruppespill-1`, `gruppespill-2`)
> fortsatt står `status:"open"` i kildefila — ellers setter upserten dem tilbake til `locked`.

---

## KILDER (bekreftet mot, faktasjekk 20. juni 2026)

USA 2–0 Australia (Seattle, 19. juni — Burgess selvmål, Freeman-heading, Pulisic ute):
- https://www.nbcsports.com/soccer/live/usa-vs-australia-live-updates-score-goals-highlights-stats-2026-fifa-world-cup-june-19
- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/usa-australia-match-report-highlights
- https://www.outlookindia.com/sports/football/usa-vs-australia-live-score-fifa-world-cup-2026-group-d-usa-vs-aus-updates-seattle-stadium-highlights
- https://sports.yahoo.com/articles/usa-vs-australia-score-live-180001630.html

Skottland 0–1 Marokko (Foxborough, 19. juni — Saibari ~70 sek, Díaz-assist, McTominay-straffeprotest):
- https://www.101greatgoals.com/football/world-cup-news/scotland-morocco-report-result-goals-saibari/
- https://theanalyst.com/articles/scotland-vs-morocco-stats-fifa-world-cup-2026-live
- https://www.espn.com/soccer/report/_/gameId/760445
- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/scotland-morocco-match-report-highlights

Brasil 3–0 Haiti (Philadelphia, natt til 20. juni — Cunha 23./36., Vinícius 45+3):
- https://www.skysports.com/football/news/12309/13553624/world-cup-2026-brazil-3-0-haiti-matheus-cunha-nets-twice-as-vinicius-junior-strikes-again-to-earn-much-needed-victory
- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/brazil-haiti-match-report-highlights
- https://www.aljazeera.com/sports/liveblog/2026/6/19/brazil-vs-haiti-live-world-cup-2026

Sveits 4–1 Bosnia-Hercegovina (Los Angeles, 18. juni — Manzambi 74./90., Vargas 84., Xhaka straffe 90+7, Mahmić 90+3):
- https://www.skysports.com/football/switzerland-vs-bosnia-and-herzegovina/549791
- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/switzerland-bosnia-herzegovina-match-report-highlights
- https://www.espn.com/soccer/match/_/gameId/760439/bosnia-herzegovina-switzerland

Tyrkia 0–1 Paraguay (Santa Clara, natt til 20. juni — Galarza tidlig scoring, Almirón utvist):
- https://www.skysports.com/football/turkey-vs-paraguay/report/549796
- https://sports.yahoo.com/soccer/live/world-cup-2026-scores-results-schedule-live-updates-195336732.html
- https://www.fifa.com/en/match-centre/match/17/285023/289273/400021460

Tsjekkia 1–1 Sør-Afrika (Atlanta, 18. juni — Sadílek 6., Mokoena straffe 83.):
- https://www.skysports.com/football/news/11095/13553316/world-cup-2026-czech-republic-1-1-south-africa-teboho-mokoena-penalty-gifts-bafana-bafana-first-point-against-wasteful-czechs
- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/czechia-south-africa-highlights-match-report
- https://www.espn.com/soccer/report/_/gameId/760438

Plan/fikstur-bekreftelse (kveldens 20. juni-kamper ennå uspilt; overlapp-sjekk mot tidligere runder):
- https://www.scotsman.com/sport/football/world-cup/world-cup-2026-results-standings-fixtures-updates-8741991
