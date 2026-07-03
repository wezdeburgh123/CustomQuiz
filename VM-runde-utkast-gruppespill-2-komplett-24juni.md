# VM-runde-utkast — Gruppespill omgang 2 «komplett» (Modus B)

> Generert + faktasjekket **24. juni 2026** (av VM-innholdsvakta). **Modus B** (resultatbasert — kun ferdigspilte kamper). Klar til din review-gate.
> Slug: `gruppespill-2-komplett` · num `12` · sort `12` · status `locked` · hero_img `vm-gruppespill-1`.

## ⚠️ Viktig om scoping (les dette først)
Hele omgang 2 (matchday 2) er nå ferdigspilt — kampene gikk 18.–23. juni for alle 12 grupper. De eksisterende quizene dekker allerede de tidlige omgang 2-kampene:

- `gruppespill-2` (sort 9, **live/open**): de sene åpningskampene 15.–18. juni + de første MD2-kampene 18. juni (Norge–Irak, Argentina–Algerie, Frankrike–Senegal, Spania 0–0 Kapp Verde, England–Kroatia, Canada–Qatar, Mexico–Sør-Korea, Colombia–Usbekistan, Portugal–DR Kongo).
- `gruppespill-2b` (sort 10, **live/open**): MD2-kampene 18.–20. juni (USA–Australia, Marokko–Skottland, Brasil–Haiti, Sveits–Bosnia, Tyrkia–Paraguay, Sør-Afrika–Tsjekkia).

Denne nye quizen plukker derfor **kun opp de resterende, ferske MD2-kampene 21.–23. juni** — ingen overlapp med de to over. Den ligger logisk **etter** `pregame-norge-senegal` (sort 11), fordi den blant annet avslører resultatet av nettopp Norge–Senegal.

> **Slug-merknad:** Oppgaven foreslo `gruppespill-2b`, men den slugen er allerede tatt (live, sort 10). Jeg brukte derfor `gruppespill-2-komplett` med num/sort `12` for å unngå kollisjon og legge quizen kronologisk sist. Dette er det eneste avviket fra oppgaveteksten.

## Faktasjekk-dom: ✅ KLAR FOR REVIEW
Alle 10 spørsmål er websøk-grunnet 24. juni og dobbeltbekreftet på tvers av uavhengige kilder (ESPN, FIFA, FOX Sports, Sky Sports, Al Jazeera, NBC, CBS). De mest slående fakta er bekreftet hos minst to–tre kilder hver:

- **Norge 3–2 Senegal** (22. juni), Haaland tomålsscorer (48'/58'), Norge videre fra gruppe I (ESPN + FOX + FIFA)
- **Argentina 2–0 Østerrike** (22. juni), **Messi ny VM-toppscorer gjennom tidene** med 18 mål, forbi Kloses 16 (ESPN + CBS + Al Jazeera)
- **Frankrike 3–0 Irak** (22. juni), Mbappé-dobbel + **VM-ets første værforsinkelse** (~2 t, lyn, Philadelphia) (ESPN + Sky + FOX + Al Jazeera)
- **Egypt 3–1 New Zealand**, **Egypts første VM-seier noensinne**, Salah scoret (ESPN + FIFA + Al Jazeera + Sky)
- **Spania 4–0 Saudi-Arabia** (21. juni), Yamal + Oyarzabal-dobbel (ESPN + FOX + FIFA + Al Jazeera)
- **Japan 4–0 Tunisia** (21. juni), Tunisia ute, Ueda-dobbel (ESPN + FOX + FIFA)
- **Portugal 5–0 Usbekistan** (23. juni), **Ronaldo først til å score i seks ulike VM** (ESPN + FOX + FIFA + Al Jazeera)
- **England 0–0 Ghana** (23. juni) (FIFA + ESPN + FOX + England FA)
- **Kroatia 1–0 Panama** (23. juni), Budimir 54', Panama ute (ESPN + NBC + FOX + VAVEL)

Ingen påstander om uspilte eller uavgjorte kamper. New Zealand–Egypt er bevisst formulert uten hard dato (ESPN/FIFA: 21. juni; Al Jazeera: 22. juni) — selve fakta (3–1, Egypts første seier, Salah) er entydige.

## Spørsmål (riktig svar står først her; `build-vm-seed.py` stokker alternativene)

1. **Norge** — Norge slo Senegal 22. juni og sikret avansement fra gruppe I. Hva ble resultatet?
   ✅ 3–2 · 2–1 · 4–1 · 1–1
2. **Haaland** — Erling Haaland scoret to mål mot Senegal (48. og 58. minutt). Hvor mange VM-mål hadde han dermed totalt i mesterskapet?
   ✅ Fire · To · Tre · Fem
3. **Messi-rekord** — Argentina slo Østerrike 2–0 den 22. juni. Hvilken milepæl nådde Lionel Messi med sine to mål?
   ✅ Han ble VM-sluttspillenes mestscorende gjennom tidene · Han tangerte Kloses rekord for aller første gang · Han scoret sitt aller første VM-mål · Han ble matchens yngste målscorer
4. **Frankrike** — Frankrike slo Irak 3–0 den 22. juni i en kamp som ble avbrutt av noe uvanlig. Hva?
   ✅ Et to timer langt væropphold på grunn av lyn og uvær · Strømbrudd på hele stadion · En bane-invasjon · Streik blant kampfunksjonærene
5. **Egypt** — Egypt tok sin aller første VM-seier noensinne i sin andre gruppekamp, 3–1 over New Zealand. Hvilken stjernespiss scoret?
   ✅ Mohamed Salah · Trezeguet · Omar Marmoush · Mostafa Mohamed
6. **Spania** — Spania svarte på den skuffende åpningen (0–0 mot Kapp Verde) med en real opptur 21. juni. Hva ble resultatet mot Saudi-Arabia?
   ✅ 4–0 til Spania · 1–0 til Spania · 2–2 · 0–1 til Saudi-Arabia
7. **Japan** — Japan vant 4–0 den 21. juni og sendte motstanderen ut av VM. Hvilket land røk dermed ut?
   ✅ Tunisia · Marokko · Egypt · Algerie
8. **Portugal** — Portugal vant 5–0 over Usbekistan 23. juni. Hvilken historisk rekord satte Cristiano Ronaldo med sin dobbel?
   ✅ Første spiller som scorer i seks ulike VM-sluttspill · Eldste målscorer i VM-historien · Første som scorer hat-trick i tre strake VM · Flest VM-kamper som kaptein
9. **England** — England fortsatte ubeseiret, men skuffet med målløst uavgjort 23. juni. Mot hvilket lag?
   ✅ Ghana · Senegal · Panama · Kroatia
10. **Kroatia** — Kroatia vant 1–0 over Panama 23. juni. Hva betydde resultatet for Panama?
    ✅ Panama var slått ut — fortsatt uten et eneste VM-poeng i to mesterskap · Panama gikk videre til sluttspillet · Panama sikret gruppeseier · Panama tvang fram et omspill

> Merk koblingen i spm. 3: Messi **tangerte** Kloses rekord (16 mål) med hat-trick mot Algerie i åpningskampen — det er allerede dekket i `gruppespill-2`. Her **passerer** han den (18 mål, alenehersker). Bevisst progresjon, ikke motsigelse.

## Slik seeder + publiserer du (3 steg)

**Steg 1 — kjørt allerede:** Entry lagt inn i `scripts/build-vm-seed.py` og scriptet er kjørt (12 quizer, 120 spm, balansert fasit-fordeling 24/34/34/28). `event-quizzes/vm-2026.json` og `db/seed-vm-2026.sql` er regenerert.

**Steg 2 — lim inn i Supabase (SQL Editor):** bruk den trygge enkelt-fila. Den rører KUN den nye raden — ingen andre quizer berøres:
`/Users/christian/Documents/Claude/Projects/Quiz generator/db/seed-gruppespill-2b-only.sql`

**Steg 3 — publiser når du vil (flip locked → open):**
```sql
update public.event_quizzes
set status = 'open'
where event_id = 'vm-2026' and slug = 'gruppespill-2-komplett';
```

## ⚠️ Re-lås-fellen (sjekket — alt er trygt)
Jeg verifiserte mot live-tavla (Supabase REST) at alle 11 eksisterende quizer står som `open`. I kildefila `scripts/build-vm-seed.py` står de samme 11 også som `open`, og kun den nye raden som `locked`. Det betyr at selv en full kjøring av `db/seed-vm-2026.sql` IKKE ville re-låse noe (re-lås-fellen fra 11. juni er unngått). Uansett: bruk enkelt-fila over, så rører du bare den nye raden.

## Kilder (faktasjekk 24. juni 2026)
- Norway 3–2 Senegal — ESPN: https://www.espn.com/soccer/match/_/gameId/760454/senegal-norway
- Norway 3–2 Senegal, match report — FIFA: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/norway-senegal-match-report-highlights
- Norway 3–2 Senegal — FOX Sports: https://www.foxsports.com/soccer/fifa-world-cup-men-norway-vs-senegal-jun-22-2026-game-boxscore-647658
- Argentina 2–0 Austria, Messi all-time record — ESPN: https://www.espn.com/soccer/story/_/id/49144198/argentina-austria-live-world-cup-2026-latest-updates-commentary-score-result-lionel-messi
- Argentina 2–0 Austria — CBS Sports: https://www.cbssports.com/soccer/news/argentina-austria-live-updates-world-cup-2026-score-result/live/
- Argentina 2–0 Austria — Al Jazeera: https://www.aljazeera.com/sports/2026/6/22/lionel-messi-scores-brace-as-argentina-beat-austria-2-0-at-world-cup-2026
- France 3–0 Iraq, Mbappé double + weather delay — Sky Sports: https://www.skysports.com/football/news/11095/13554964/world-cup-2026-france-3-0-iraq-kylian-mbappe-double-sends-france-into-last-32-after-weather-hit-win
- France 3–0 Iraq — ESPN: https://www.espn.com/soccer/match/_/gameId/760457/iraq-france
- Egypt 3–1 New Zealand, first WC win, Salah — Al Jazeera: https://www.aljazeera.com/sports/2026/6/22/salah-scores-as-egypt-beat-new-zealand-3-1-for-first-world-cup-win
- New Zealand 1–3 Egypt — ESPN: https://www.espn.com/soccer/match/_/gameId/760452/egypt-new-zealand
- Spain 4–0 Saudi Arabia — ESPN: https://www.espn.com/soccer/match/_/gameId/760453/saudi-arabia-spain
- Spain 4–0 Saudi Arabia, match report — FIFA: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-saudi-arabia-highlights-match-report
- Tunisia 0–4 Japan — ESPN: https://www.espn.com/soccer/match/_/gameId/760449/japan-tunisia
- Tunisia 0–4 Japan, match report — FIFA: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/tunisia-japan-match-report-highlights
- Portugal 5–0 Uzbekistan, Ronaldo six WCs — ESPN: https://www.espn.com/soccer/story/_/id/49153993/portugal-uzbekistan-live-world-cup-2026-latest-updates-commentary-score-result-cristiano-ronaldo
- Portugal 5–0 Uzbekistan — Al Jazeera: https://www.aljazeera.com/sports/liveblog/2026/6/23/portugal-vs-uzbekistan-live-world-cup-2026
- England 0–0 Ghana — ESPN: https://www.espn.com/soccer/match/_/gameId/760458/ghana-england
- England 0–0 Ghana — England Football (FA): https://www.englandfootball.com/england/mens-senior-team/fixtures-results/2025-26/World-Cup/england-v-ghana-fifa-world-cup-tuesday-23-june-2026-match-centre
- Panama 0–1 Croatia — ESPN: https://www.espn.com/soccer/report/_/gameId/760460
- Panama 0–1 Croatia, Budimir winner — NBC News: https://www.nbcnews.com/sports/soccer/live-blog/fifa-world-cup-games-2026-june-23-live-updates-rcna351348
