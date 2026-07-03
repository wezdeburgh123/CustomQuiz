# VM-runde-utkast — Pre-game: Elfenbenskysten–Norge (16-delsfinale)

> Generert + faktasjekket **30. juni 2026**. **Pre-game** — kun verifiserbar historikk og status, INGEN påstander om den uspilte kampen. Klar til din review-gate.
> Slug: `pregame-elfenbenskysten-norge` · num `15` · sort `15` · status `open` · hero_img `vm-gruppespill-1`.

## Kampen
**Elfenbenskysten–Norge, tirsdag 30. juni, kl. 19 norsk tid, AT&T Stadium (Dallas).** 16-delsfinale (utslagsrunde). Norge gikk videre som nummer to i gruppe I; Elfenbenskysten som nummer to i gruppe E. Bør publiseres **før avspark tirsdag**.

## Faktasjekk-dom: ✅ KLAR FOR REVIEW
Alle 10 spørsmål er websøk-grunnet 30. juni og kryss-sjekket (Wikipedia, ESPN, Sky Sports, NBC, FOX, VG/NRK):

- **Norges vei:** nr. 2 i gruppe I — 4–1 Irak, 3–2 Senegal, 1–4 Frankrike; Haaland fire mål i gruppespillet
- **Elfenbenskystens vei:** nr. 2 i gruppe E (6 p, bak Tyskland) — 1–0 Ecuador (Amad Diallo 90. min), 1–2 Tyskland, 2–0 Curaçao
- **Historisk:** Elfenbenskystens aller første VM-utslagskamp (4 deltakelser: 2006/2010/2014/2026, aldri forbi gruppespill før)
- **Stabile lagfakta:** kallenavn «Elefantene»; regjerende afrikamester (AFCON 2024 hjemme, 2–1 mot Nigeria i Abidjan); Drogba mestscorer gjennom tidene (65 mål)
- **Norge historisk:** første VM-sluttspillkamp siden 1998 (28 år)

Ingen overlapp i vinkel med tidligere pre-game-quizer (Irak / Senegal / Frankrike-gruppefinale handlet om de motstanderne + gruppespill; denne om Elfenbenskysten + utslagsspill-situasjonen).

## Spørsmål (riktig svar står først her; `build-vm-seed.py` har allerede stokket alternativene)

1. **Sluttspill** — Hva står på spill når Norge møter Elfenbenskysten i 16-delsfinalen 30. juni?
   ✅ Utslagsspill — taperen er ute, vinneren til kvartfinalen · Avgjør kun gruppeseieren · Begge er videre uansett · Taperen får omspill
2. **Elfenbenskysten** — Hva er kallenavnet til landslaget?
   ✅ Elefantene · Løvene · Ørnene · Pantrene
3. **Elfenbenskysten** — Regjerende afrikamester: hvor og mot hvem vant de AFCON sist?
   ✅ Hjemme i 2024, finale mot Nigeria · Egypt mot Senegal · Hjemme 2024 mot Marokko · Qatar mot Kamerun
4. **Elfenbenskysten** — Mestscorende landslagsspiller gjennom tidene?
   ✅ Didier Drogba · Yaya Touré · Wilfried Zaha · Salomon Kalou
5. **Elfenbenskysten** — Hvilken Manchester United-spiller scoret det sene vinnermålet mot Ecuador?
   ✅ Amad Diallo · Wilfried Zaha · Sébastien Haller · Simon Adingra
6. **Norge** — Hvorfor er det historisk at Norge spiller denne 16-delsfinalen?
   ✅ Første VM-sluttspillkamp siden 1998 · Norges aller første VM · Første gang utenfor Europa · Regjerende verdensmester
7. **Haaland** — Hvor mange mål scoret Haaland i gruppespillet i VM 2026?
   ✅ Fire · To · Seks · Ett
8. **Norge** — Hvordan tok Norge seg videre fra gruppe I?
   ✅ Nr. 2 bak Frankrike — seire over Irak og Senegal, tap mot Frankrike · Gruppevinner foran Frankrike · Beste treer · Omspill mot Senegal
9. **Elfenbenskysten** — Hvordan kom de seg til 16-delsfinalen?
   ✅ Nr. 2 i gruppe E, bak Tyskland · Gruppevinner foran Tyskland · Beste treer · Vant alle tre kampene
10. **Elfenbenskysten** — Hva er spesielt med at de i det hele tatt er i 16-delsfinalen?
    ✅ Deres aller første VM-utslagskamp — aldri forbi gruppespill før · Regjerende verdensmester · Deres første VM · Vunnet gruppa i alle sine VM

## Slik publiserer du (1 steg)

Du trenger bare å lime inn **én SQL-fil** i Supabase → SQL Editor. Den seeder kun den nye raden med `status=open`, så kortet er live i vm.html med en gang (ingen egen flip-til-open). Andre quizer røres ikke.

Fil: `/Users/christian/Documents/Claude/Projects/Quiz generator/db/seed-pregame-elfenbenskysten-norge-only.sql`

Fremgangsmåte: åpne Supabase → SQL Editor → ny query → lim inn hele innholdet i fila → Run.

(Vil du heller holde den skjult til rett før avspark, endre `'open'` til `'locked'` i fila før du kjører, og flipp senere med:
`update public.event_quizzes set status='open' where event_id='vm-2026' and slug='pregame-elfenbenskysten-norge';`)

## Kilder (faktasjekk 30. juni 2026)
- Norge–Frankrike 1–4 / Norge nr. 2 i gruppe I / Elfenbenskysten venter i Dallas — VG: https://www.vg.no/sport/i/GxwOyB/
- 16-delsfinale Elfenbenskysten–Norge (Dallas, AT&T Stadium) — VG: https://www.vg.no/sport/i/j0mkmq/
- Gruppe E sluttstilling (Tyskland 1., Elfenbenskysten 2., resultater) — Wikipedia: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_E
- Elfenbenskysten 1–0 Ecuador (Amad Diallo), 2–1 tap Tyskland (Kessié/Undav), 2–0 Curaçao — Bolavip/Sky/NBC
- Elfenbenskysten første gang i utslagsspill / 4 VM-deltakelser — Wikipedia: https://en.wikipedia.org/wiki/Ivory_Coast_national_football_team
- AFCON 2024 (hjemme, 2–1 mot Nigeria i Abidjan) + Drogba 65 mål — ESPN/VOA/Wikipedia
- Haaland fire gruppespillmål / Norge første VM siden 1998 — (live-verifisert tidligere runder)
