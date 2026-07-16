# Pre-game-oppdatering — Norge–England (kvartfinale 11. juli 2026)

> Automatisk kampdag-sjekk av den LIVE pre-game-quizen i Supabase
> (`event_quizzes`, `event_id='vm-2026'`, `slug='pregame-norge-england'`, status `open`).
> **KAMPDAG-KJØRING lørdag 11. juli 2026** (erstatter gårsdagens sjekk fra 10. juli ~21:00).
> Avspark **i kveld 23:00 norsk tid** (5pm ET / 21:00 GMT), Hard Rock Stadium, Miami Gardens.
> Alt websøk-grunnet mot minst to uavhengige kilder. Adversarielt faktasjekk-pass utført på nytt i dag.

---

## (a) DOM: ✅ LIVE QUIZEN ER FORTSATT 100 % KORREKT — INGEN ENDRING TRENGS

Alle de ferske faktaene i `pregame-norge-england` ble re-verifisert på kampdagen og stemmer ved avspark:

| Ferskt faktum i quizen | Status | Kilder |
|---|---|---|
| Kamp 11. juli, Hard Rock Stadium, Miami, 23:00 norsk tid | ✅ Bekreftet (5pm ET / 21:00 GMT = 23:00 CEST) | FIFA, ESPN, Al Jazeera |
| Norge slo Brasil **2–1** i åttedelsfinalen (5. juli) | ✅ Bekreftet | ESPN, Sportsmole, FIFA |
| Haaland scoret **begge** målene mot Brasil | ✅ Bekreftet | ESPN, Sportsmole, Al Jazeera |
| Haaland har **sju** mål i mesterskapet | ✅ Bekreftet («seven of Norway's twelve goals»; har ikke spilt siden Brasil-kampen) | Al Jazeera, Goal, Olympics.com |
| England slo Mexico **3–2** i åttedelsfinalen (10 mann etter Quansah-rødt) | ✅ Bekreftet | ESPN, Al Jazeera, SI |
| Kapteiner: **Ødegaard** (Norge), **Kane** (England) | ✅ Bekreftet (begge i ventet startellever) | ESPN, Al Jazeera, SI |
| Vinneren går til **semifinalen** | ✅ Bekreftet (møter Frankrike, som slo Marokko 2–0) | FIFA, NPR, Olympics.com |

**Adversarielt pass (kampdag):** Hvert punkt forsøkt motbevist med nytt søk. Ingen falt.
Quizen påstår ingenting om startellever, skader eller toppscorerLISTEN — bare Haalands eget måltall (7), som er låst til han spiller i kveld.

### ⚠️ Én korreksjon — av GÅRSDAGENS oppdateringsfil, ikke av quizen

Gårsdagens fil påsto at Haaland (7) «deler toppscorerledelsen med Messi og Mbappé (7 hver)». **Det stemmer ikke lenger (og var trolig allerede utdatert i går kveld):**

- **Mbappé står på 8** etter scoring i Frankrike–Marokko **2–0** (kvartfinale spilt 9. juli). (FIFA, ESPN, NPR)
- **Messi står på 8** — Golden Boot-trackerne (Goal, Olympics.com, FOX) har Messi og Mbappé på delt topp med 8, **Haaland ett mål bak med 7**. Kane har 6.

Den LIVE quizen berøres ikke (den nevner aldri toppscorerlisten), men det valgfrie ekstraspørsmålet i gårsdagens fil om «deler ledelsen» er **strøket og erstattet** under.

### Sen nyhet fanget opp (påvirker IKKE quizen)

- **Sykdomsbølge i Norge-leiren** har vært en snakkis (Strand Larsen og Holmgren Pedersen har mistet kamper tidligere i turneringen), men landslagslege Ola Sand sa til Nettavisen at **alle spillerne er friske nå**. Haaland og Ødegaard er begge i ventet startellever. (Goal, FOX Sports, beIN)
- **Norge byttet hotell i Miami** dagene før kampen pga. støy. Ren kuriosa. (Fox News, Yahoo)
- **England:** Quansah suspendert (rødt mot Mexico), Reece James fortsatt tvilsom (hamstring), **Marc Guehi har en lett hamstring-strekk** og vurderes tett opp mot kampen, Henderson ute av VM (brudd i håndledd). Kane, Bellingham og Saka alle friske og i ventet ellever. (ESPN, Al Jazeera, SI)
- Startoppstillingene er **ennå ikke offisielt bekreftet** (kommer ~1 time før avspark). Quizen påstår ingenting om oppstillinger, så dette kan ikke velte noe.

**Konklusjon: Ikke rør den live quizen. Den kan stå som den er gjennom avspark.**

---

## (b) Valgfrie «rett før avspark»-spørsmål

Tre ekstra spørsmål i samme format (spørsmål + 4 alternativer, riktig svar først/index 0, kort forklaring, norsk, lett-til-medium). Alle verifisert på kampdagen mot minst to kilder, og alle er trygge ved avspark. Bruk 0–3 av dem — helt valgfritt.

```python
   Q("Motstander","Hvilken engelsk forsvarsspiller MÅ stå over kvartfinalen etter rødt kort mot Mexico?",  # [FERSK]
     ["Jarell Quansah","John Stones","Marc Guehi","Kyle Walker"],0,
     "Quansah fikk rødt kort i 3–2-seieren over Mexico og soner karantene — Tuchel må bygge om forsvaret mot Norge."),
   Q("Toppscorer","Haaland har sju mål i VM. Hvem topper toppscorerlisten med åtte før kvartfinalen mot England?",  # [FERSK — ERSTATTER gårsdagens «deler ledelsen»-spørsmål]
     ["Lionel Messi og Kylian Mbappé","Harry Kane og Neymar","Vinícius Júnior og Dembélé","Bukayo Saka og Jude Bellingham"],0,
     "Messi og Mbappé har åtte hver — Mbappé nådde åtte i kvartfinalen mot Marokko. Haaland kan tangere dem i kveld."),
   Q("Kuriosa","Hvorfor måtte det norske laget bytte hotell i Miami like før kvartfinalen?",  # [FERSK]
     ["For mye støy ved hotellet","Orkanvarsel","Overbooking under finalehelgen","Matforgiftning på hotellet"],0,
     "Norge flyttet fra hotellet sitt i Miami på grunn av støy — laget ville ha ro i oppkjøringen til tidenes største norske landskamp."),
```

> Merk: den live quizen lagrer spørsmålene som JSON i `event_quizzes`. Å legge til spørsmål krever en `update` av `questions`-feltet — si fra hvis du vil ha ferdig SQL for det, så lager jeg den. Ellers kan blokkene limes inn i kildefila før en re-seed.

---

## (c) SQL-oppdatering av live quiz

**Ingen korrigerende SQL nødvendig.** Alle fakta i den publiserte quizen stemmer ved avspark — det finnes ingenting som MÅ rettes.

Mal hvis du senere vil endre noe kosmetisk (kjøres i Supabase SQL Editor):

```sql
-- KUN hvis du VIL endre noe kosmetisk. Ikke nødvendig for korrekthet.
update public.event_quizzes
set sub = 'Norges første VM-kvartfinale noensinne. Haaland mot Kane i Miami — ta den før avspark.'
where event_id = 'vm-2026' and slug = 'pregame-norge-england';
```

---

## Kilder (verifisert 11. juli 2026, kampdag)

Kamp/venue/tid + oppstillinger/skader (Quansah, James, Guehi, Henderson; Norge friskmeldt):
- https://www.fifa.com/en/match-centre/match/17/285023/289289/400021539
- https://www.espn.com/soccer/story/_/id/49314271/norway-vs-england-fifa-world-cup-2026-tv-channel-how-watch-kickoff-live-stream-injury-predicted-lineups
- https://www.aljazeera.com/news/2026/7/10/norway-vs-england-world-cup-quarterfinal-haaland-kane-prediction-news
- https://www.si.com/soccer/england-predicted-lineup-vs-norway-world-cup-quarterfinal-7-11-26
- https://www.sportsmole.co.uk/football/england/world-cup-2026/preview/norway-vs-england-prediction-team-news-lineups_600924.html

Sykdomsbølge Norge (friskmeldt av landslagslegen) + hotellbytte:
- https://www.goal.com/en/lists/norway-squad-sickness-bug-england-world-cup-quarter-final/blt3b8f6977d9d1794d
- https://www.foxsports.com/stories/soccer/norway-team-doctor-sickness-england-world-cup-quarterfinal-match
- https://www.beinsports.com/en-us/soccer/fifa-world-cup-2026/articles/norway-clears-up-illness-concerns-ahead-of-england-world-cup-showdown-2026-07-08
- https://www.foxnews.com/sports/norway-world-cup-team-switches-hotels-florida-noise-complaints-must-move
- https://sports.yahoo.com/soccer/article/world-cup-2026-norway-changes-hotel-due-to-excessive-noise-just-days-ahead-of-england-game-123548049.html

Toppscorerliste (Messi 8, Mbappé 8, Haaland 7, Kane 6) + Frankrike–Marokko 2–0:
- https://www.goal.com/en/lists/world-cup-2026-golden-boot-standings-fifa-award/blt29fdba0896b8fd09
- https://www.olympics.com/en/news/fifa-world-cup-2026-race-golden-boot-football-top-scorer-full-list
- https://www.foxsports.com/stories/soccer/2026-fifa-world-cup-golden-boot-tracker
- https://www.espn.com/soccer/match/_/gameId/760510/morocco-france
- https://www.npr.org/2026/07/09/nx-s1-5887619/2026-world-cup-fifa-france-morocco-quarterfinal

Norge–Brasil 2–1 / Haaland 7 / England–Mexico 3–2 (re-verifisert i dag):
- https://www.espn.com/soccer/report/_/gameId/760504
- https://www.aljazeera.com/sports/2026/7/8/fifa-world-cup-2026-quarterfinal-fixtures-match-previews-schedule
- https://www.espn.com/soccer/story/_/id/49294844/fifa-world-cup-quarterfinal-preview-predictions-odds-argentina-belgium-england-france-morocco-norway-spain-switzerland
