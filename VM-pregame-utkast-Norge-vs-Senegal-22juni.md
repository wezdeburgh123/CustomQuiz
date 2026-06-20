# Pre-game-utkast — Norge vs Senegal (22. juni 2026)

> Generert 20. juni 2026 via `PRE-GAME-genereringsprompt.md`. Til review-godkjenning av Christian før seed.
> Kamp: **Norge–Senegal, mandag 22. juni, MetLife Stadium, East Rutherford (New Jersey)** (avspark 20:00 ET ≈ 02:00 norsk tid natt til 23.). Andre runde i gruppe I.
> Status før kamp: Norge slo Irak 4–1 (3 poeng), Senegal tapte 1–3 for Frankrike (0 poeng). Frankrike topper sammen med Norge.
> Fordeling: **7 stabile + 3 ferske**. Fasit markert **(✓)** og skrevet først — `build-vm-seed.py` stokker alternativene.

---

**1. [STABIL] Senegals landslag har et velkjent kallenavn. Hvilket?**
- Terangas løver **(✓)**
- Atlasløvene
- Ørnene
- Elefantene

**2. [STABIL] Senegal sjokkerte fotball-verdenen i sin VM-debut i 2002 ved å slå de regjerende verdensmesterne 1–0 i åpningskampen. Hvilket land?**
- Frankrike **(✓)**
- Brasil
- Italia
- Tyskland

**3. [STABIL] Hvem scoret Senegals historiske mål i 1–0-seieren over Frankrike i 2002?**
- Papa Bouba Diop **(✓)**
- El-Hadji Diouf
- Henri Camara
- Khalilou Fadiga

**4. [STABIL] Hvor langt nådde Senegal i sitt aller første VM i 2002?**
- Kvartfinalen **(✓)**
- Åttedelsfinalen
- Semifinalen
- Ut i gruppespillet

**5. [STABIL] Senegals store stjerne og talisman, som har sagt at VM 2026 blir hans siste, er en veteranspiss. Hvem?**
- Sadio Mané **(✓)**
- Kalidou Koulibaly
- Ismaïla Sarr
- Nicolas Jackson

**6. [STABIL] Senegal vant sin første store kontinentale tittel i 2021. Hvilken?**
- Afrikamesterskapet (AFCON) **(✓)**
- FIFA Confederations Cup
- OL-gull i fotball
- FIFA Arab Cup

**7. [STABIL] Senegals bragd i 2002 har en norsk parallell: i VM 1998 slo Norge de daværende regjerende verdensmesterne 2–1 i gruppespillet. Hvilket land?**
- Brasil **(✓)**
- Italia
- Argentina
- Frankrike

**8. [FERSK] Norge åpnet VM 2026 med seier 16. juni. Hva ble resultatet mot Irak?**
- 4–1 **(✓)**
- 2–1
- 1–0
- 3–3

**9. [FERSK] Erling Haaland markerte sin VM-debut mot Irak med en sterk førsteomgang. Hvor mange mål scoret han i kampen?**
- To **(✓)**
- Ett
- Tre
- Null

**10. [FERSK] Senegal gikk på et tap i sin åpningskamp mot Frankrike. Hva ble sluttresultatet?**
- 1–3 **(✓)**
- 0–2
- 2–2
- 1–1

---

## Kilde- og faktasjekk-logg

Alle fakta websøk-grunnet 20. juni 2026, krysset mot ≥2 kilder der mulig. Adversarielt pass gjennomført på alle ti fasitsvar.

- **Kallenavn «Terangas løver» (Lions of Teranga)** — Wikipedia, Al Jazeera. (✓) Atlasløvene = Marokko, Elefantene = Elfenbenskysten, Ørnene = Nigeria (Super Eagles) → plausible feil.
- **[2002] Senegal slo regjerende verdensmester Frankrike 1–0 i åpningskampen på VM-debut** — ESPN, Daily Sabah, Heavy.com, FIFA. (✓)
- **Papa Bouba Diop scoret målet (30. min) mot Frankrike i 2002** — Heavy.com, Asianet/Newsable. (✓) Diouf, Camara, Fadiga var lagkamerater i 2002 → plausible feil.
- **Senegal nådde kvartfinalen i 2002, slått ut av Tyrkia på golden goal** — ESPN, Heavy.com. (✓)
- **Sadio Mané (34), talisman, sier 2026 blir hans siste VM** — Al Jazeera, World Soccer Talk. (✓) NB: kapteinsbåndet er omdiskutert i kildene (Koulibaly oppgis som offisiell kaptein, Mané som talisman) → spørsmålet er bevisst formulert om «stjerne og talisman», ikke «kaptein», for å unngå usikkerhet.
- **Senegal vant AFCON (Afrikamesterskapet) 2021 — sin første tittel** — Wikipedia, BBC, Sportskeeda. (✓)
- **[1998] Norge slo regjerende verdensmester Brasil 2–1 i gruppespillet (Flo + Rekdal-straffe)** — FIFA, ESPN, Wikipedia (gjenbrukt og bekreftet fra Irak–Norge-utkastet). (✓) Brasil var regjerende mester (vant 1994) → parallellen til Senegal/Frankrike er korrekt.
- **[FERSK] Norge slo Irak 4–1 den 16. juni; Haaland scoret 2 (28. og 42. min), Aymen Hussein for Irak, Østigård 3., Thorstvedt/selvmål 4.** — ESPN, NBC Boston, Al Jazeera, FIFA. (✓)
- **[FERSK] Haaland scoret to mål på sin VM-debut** — ESPN, Al Jazeera, NBC Boston. (✓)
- **[FERSK] Senegal tapte 1–3 for Frankrike 16. juni; Mbappé 2, Barcola 1, Ibrahim Mbaye for Senegal** — Al Jazeera, FIFA, ESPN. (✓)

**Forkastet som for ferskt/usikkert:** eksakt gruppestilling/«hva Senegal trenger for å gå videre» etter 2. runde (avhenger av Frankrike–Irak som kan spilles tett opptil); volatile lagoppstillinger/skader; kapteinsspørsmål for Senegal (kildekonflikt). Holdt utenfor bevisst.

---

## Klar til seed — lim inn i `scripts/build-vm-seed.py`

Legg inn dette som ny dict sist i `QUIZZES`-lista (etter `gruppespill-2b`):

```python
 {
  "slug":"pregame-norge-senegal","num":"11","phase":"Pre-game","status":"open","sort":11,
  "hero_img":"vm-gruppespill-1",
  "title":"Før kampen: Norge–Senegal",
  "sub":"Norges VM-comeback møter Terangas løver — ta den før avspark.",
  "difficulty":"medium",
  "questions":[
   Q("Senegal","Senegals landslag har et velkjent kallenavn. Hvilket?",
     ["Terangas løver","Atlasløvene","Ørnene","Elefantene"],0,
     "Senegal kalles «Terangas løver» (Lions of Teranga) — teranga er et wolof-ord for gjestfrihet."),
   Q("Senegal","Senegal sjokkerte fotball-verdenen i sin VM-debut i 2002 ved å slå de regjerende verdensmesterne 1–0 i åpningskampen. Hvilket land?",
     ["Frankrike","Brasil","Italia","Tyskland"],0,
     "Senegal slo regjerende verdensmester Frankrike 1–0 i åpningskampen i 2002 — en av VM-historiens største skreller."),
   Q("Senegal","Hvem scoret Senegals historiske mål i 1–0-seieren over Frankrike i 2002?",
     ["Papa Bouba Diop","El-Hadji Diouf","Henri Camara","Khalilou Fadiga"],0,
     "Papa Bouba Diop scoret i det 30. minutt og ble nasjonalhelt; han gikk bort i 2020."),
   Q("Senegal","Hvor langt nådde Senegal i sitt aller første VM i 2002?",
     ["Kvartfinalen","Åttedelsfinalen","Semifinalen","Ut i gruppespillet"],0,
     "Senegal nådde kvartfinalen på sin VM-debut, der Tyrkia slo dem ut på golden goal."),
   Q("Senegal","Senegals store stjerne og talisman, som har sagt at VM 2026 blir hans siste, er en veteranspiss. Hvem?",
     ["Sadio Mané","Kalidou Koulibaly","Ismaïla Sarr","Nicolas Jackson"],0,
     "Sadio Mané (34) har varslet at han gir seg på landslaget etter VM 2026."),
   Q("Senegal","Senegal vant sin første store kontinentale tittel i 2021. Hvilken?",
     ["Afrikamesterskapet (AFCON)","FIFA Confederations Cup","OL-gull i fotball","FIFA Arab Cup"],0,
     "Senegal vant Afrikamesterskapet (AFCON) 2021 — landets første store tittel, etter finaleseier på straffer over Egypt."),
   Q("Norge","Senegals bragd i 2002 har en norsk parallell: i VM 1998 slo Norge de daværende regjerende verdensmesterne 2–1 i gruppespillet. Hvilket land?",
     ["Brasil","Italia","Argentina","Frankrike"],0,
     "Norge slo regjerende verdensmester Brasil 2–1 i Marseille i 1998 (Flo og Rekdal-straffe) — akkurat som Senegal felte mester Frankrike i 2002."),
   Q("Norge","Norge åpnet VM 2026 med seier 16. juni. Hva ble resultatet mot Irak?",
     ["4–1","2–1","1–0","3–3"],0,
     "Norge vant 4–1 i sin første VM-kamp på 28 år og toppet gruppe I på målforskjell foran Frankrike."),
   Q("Norge","Erling Haaland markerte sin VM-debut mot Irak med en sterk førsteomgang. Hvor mange mål scoret han i kampen?",
     ["To","Ett","Tre","Null"],0,
     "Haaland scoret to mål (28. og 42. minutt) på sin VM-debut da Norge slo Irak 4–1."),
   Q("Senegal","Senegal gikk på et tap i sin åpningskamp mot Frankrike. Hva ble sluttresultatet?",
     ["1–3","0–2","2–2","1–1"],0,
     "Frankrike vant 3–1; Mbappé scoret to og passerte alle andre på Frankrikes evige scoringsliste, mens Ibrahim Mbaye reduserte for Senegal."),
  ]
 },
```

**Etter innliming:** `python3 scripts/build-vm-seed.py` → kjør `db/seed-vm-2026.sql` i Supabase (SQL Editor) → verifiser at raden ligger `status=open`. `status` er satt til `open` direkte her siden avspark er 22. juni og tavla trenger ferskt innhold nå — flip skjer altså ved selve seedingen. Vurder `sort` (satt til 11 = sist; juster hvis du vil ha den høyere i lista).
