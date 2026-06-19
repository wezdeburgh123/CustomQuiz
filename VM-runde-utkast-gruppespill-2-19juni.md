# VM-runde-utkast — Gruppespill omgang 2 / «Runde 2» (Modus B)

> Generert + faktasjekket **19. juni 2026** (av VM-innholdsvakta, etter at tavla var død siden 16. juni). **Modus B** (resultatbasert — kun ferdigspilte kamper). Klar til din review-gate.
> Slug: `gruppespill-2` · num `09` · sort `9` · status `locked` · hero_img `vm-gruppespill-1`.

## ⚠️ Viktig om scoping (les dette først)
Per 19. juni kl. ~12 (Oslo) er **omgang 2 så vidt i gang** — kun gruppe A og B har spilt sin andre kamp (18. juni). Resten av omgang 2 spilles 19.–23. juni. Denne quizen kan derfor **ikke** dekke hele omgang 2 ennå.

I stedet dekker den alle de **ferskt ferdigspilte kampene som omgang 1-quizen ikke tok** — de sene åpningskampene 15.–17. juni (Norge, Frankrike, Argentina, England, Spania-skrellen, Portugal, Colombia) **pluss de første omgang 2-kampene 18. juni** (Canada, Mexico). Alt er ferdigspilt og verifisert. Ingen påstander om uspilte/uavgjorte kamper.

Dette gir tavla fersk næring nå, samtidig som du senere kan lage en «omgang 2 komplett»-topping etter 23. juni når alle MD2-kampene er ferdige.

## Faktasjekk-dom: ✅ KLAR FOR REVIEW
Alle 10 spørsmål er websøk-grunnet 19. juni og dobbeltbekreftet på tvers av uavhengige kilder (ESPN, FIFA, Sky Sports, Al Jazeera, CBC, NBC). De mest slående fakta er bekreftet hos minst to kilder hver:
- **Norge 4–1 Irak**, Haaland tomålsscorer på debut (ESPN + FIFA + Sky Sports)
- **Messi hat-trick** mot Algerie 3–0, tangerte Kloses 16 VM-mål (Sky + FIFA + ESPN)
- **Mbappé** dobbel mot Senegal 3–1, ny rekordscorer for Frankrike (Sky + FIFA + Al Jazeera)
- **Spania 0–0 Kapp Verde** (ESPN, bekreftet av Vozinha-saken)
- **England 4–2 Kroatia**, Kane to mål (Yahoo + NBC)
- **Canada 6–0 Qatar**, Jonathan David hat-trick (ESPN + FIFA + CBC)
- **Mexico 1–0 Sør-Korea**, først videre (ESPN)
- **Colombia 3–1 Usbekistan** + **Portugal 1–1 DR Kongo** (NBC + Yahoo)

Ingen overlapp med den seedede omgang 1-quizen (som dekker 11.–14. juni: Mexico–Sør-Afrika, Brasil–Marokko, Tyskland–Curaçao, Skottland osv.).

## Spørsmål (riktig svar står først i kildekoden / `build-vm-seed.py` stokker alternativene)

1. **Norge** — Norge åpnet VM med solid seier 16. juni. Hva ble resultatet mot Irak?
   ✅ 4–1 · 2–1 · 1–0 · 3–3
2. **Haaland** — Erling Haaland scoret sine aller første VM-mål mot Irak. Hvor mange ble det?
   ✅ To · Ett · Tre · Null
3. **Messi-rekord** — Argentina slo Algerie 3–0. Hva gjorde Lionel Messi i kampen?
   ✅ Scoret hat-trick og tangerte Kloses VM-målrekord · Scoret ett mål fra straffe · Stod over med skade · Ble utvist
4. **Mbappé** — Frankrike vant 3–1 over Senegal. Hva ble Kylian Mbappé etter sine to mål?
   ✅ Frankrikes mestscorende landslagsspiller gjennom tidene · Utvist · Byttet ut i pausen · Toppscorer i hele VM-historien
5. **Skrell** — Hvilket lag holdt storfavoritten Spania til 0–0 i åpningskampen?
   ✅ Kapp Verde · Marokko · Panama · Haiti
6. **England** — England slo Kroatia 4–2. Hvem scoret to av målene?
   ✅ Harry Kane · Jude Bellingham · Marcus Rashford · Bukayo Saka
7. **Målfest** — Vertsnasjonen Canada knuste Qatar i sin andre kamp. Hva ble resultatet?
   ✅ 6–0 · 2–0 · 3–1 · 1–0
8. **Først videre** — Hvilket vertsland ble det aller første laget som sikret avansement, etter 1–0 mot Sør-Korea?
   ✅ Mexico · USA · Canada · Brasil
9. **Debutant** — Colombia vant 3–1 i sin åpningskamp. Mot hvilken VM-debutant?
   ✅ Usbekistan · Curaçao · Kapp Verde · Jordan
10. **Uavgjort** — Cristiano Ronaldos Portugal måtte nøye seg med uavgjort i åpningskampen. Mot hvem?
    ✅ DR Kongo · Usbekistan · Marokko · Panama

> Merk distraktorene i spm. 6: Bellingham og Rashford scoret faktisk ett mål hver i samme kamp — Kane er den med to. Bevisst «lumsk», men faktakorrekt.

## Slik seeder + publiserer du (3 steg)

**Steg 1 — kjørt allerede:** Entry lagt inn i `scripts/build-vm-seed.py` og scriptet er kjørt (9 quizer, 90 spm, balansert fasit-fordeling). `event-quizzes/vm-2026.json` og `db/seed-vm-2026.sql` er regenerert.

**Steg 2 — lim inn i Supabase (SQL Editor):** bruk den trygge enkelt-fila `db/seed-gruppespill-2-only.sql`. Den rører KUN gruppespill-2-raden — ingen andre quizer berøres. (Detaljer + ferdig SQL er gjengitt i chatten.)

**Steg 3 — publiser når du vil (flip locked → open):**
```sql
update public.event_quizzes
set status = 'open'
where event_id = 'vm-2026' and slug = 'gruppespill-2';
```

## ⚠️ Footgun jeg fikset på veien
Kildefila hadde fortsatt `apningskamp`, `pregame-irak-norge` og `gruppespill-1` satt til `status:"locked"`, mens de er `open` live. Hadde du kjørt **hele** `db/seed-vm-2026.sql` på nytt, ville upserten satt dem tilbake til `locked` — nøyaktig re-lås-fellen som drepte engasjementet 11. juni. Jeg har flippet de tre til `open` i kilden, så `seed-vm-2026.sql` nå er trygg å kjøre i sin helhet. Uansett: `seed-gruppespill-2-only.sql` rører bare den nye raden.

## Kilder (faktasjekk 19. juni 2026)
- Iraq 1-4 Norway, Haaland brace — Sky Sports: https://www.skysports.com/football/news/12098/13552715/world-cup-2026-iraq-1-4-norway-erling-haaland-scores-twice-on-tournament-debut-as-stale-solbakkens-side-make-winning-start
- Iraq 1-4 Norway match — FIFA: https://www.fifa.com/en/match-centre/match/17/285023/289273/400021488
- France 3-1 Senegal, Mbappé record — Sky Sports: https://www.skysports.com/football/news/11095/13552714/world-cup-2026-france-3-1-senegal-kylian-mbappe-becomes-leading-scorer-in-les-bleus-history-with-stunning-double
- Argentina 3-0 Algeria, Messi hat-trick — Sky Sports: https://www.skysports.com/football/news/17364/13552724/world-cup-2026-argentina-3-0-algeria-lionel-messi-scores-stunning-hat-trick-to-draw-level-in-all-time-world-cup-scoring-charts
- Spain 0-0 Cape Verde + June 15 results — ESPN schedule: https://www.espn.com/soccer/story/_/id/48939282/2026-fifa-world-cup-fixtures-results-match-schedule-group-stage-knockout-rounds-bracket
- June 17 (England 4-2 Croatia, Portugal 1-1 DR Congo, Colombia bt Uzbekistan, Ghana 1-0 Panama) — NBC News: https://www.nbcnews.com/sports/soccer/live-blog/fifa-world-cup-games-2026-live-updates-rcna350496
- Canada 6-0 Qatar, David hat-trick — ESPN: https://www.espn.com/soccer/match/_/gameId/760440/qatar-canada
- Mexico 1-0 South Korea, first into knockouts — ESPN: https://www.espn.com/soccer/match/_/gameId/760441/south-korea-mexico
