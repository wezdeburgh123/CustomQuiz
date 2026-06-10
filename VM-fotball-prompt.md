# VM 2026 — fotball-prompt for live-runder

> Gjenbrukbart genererings-spec for VM-modulens live-runder. Produserer innhold i NØYAKTIG samme format som pre-VM-pakken (`scripts/build-vm-seed.py` → `Q(cat, q, options[4], correct, explanation)`), klart til å limes inn i build-skriptet, seedes og review-godkjennes.
> Faktakvalitet er **ikke-forhandlingsbart** (jf. [[feedback-quiz-kvalitet]]): hvert faktum websøk-grunnes, og hver runde gjennom et eget adversarielt faktasjekk-pass før review-gate.

---

## 0. Den ene tingen du aldri bryter

**En quiz nevner aldri noe som ennå kan endre seg.** Resultater, målscorere, kort og utslag er stabile fakta KUN etter at kampen er fullstendig ferdigspilt og bekreftet i flere kilder. Tabellsituasjon midt i en omgang, «hvem går videre», skadestatus og tropp-spekulasjon er volatilt → hører ikke hjemme i en quiz. Pre-VM-pakken unngikk bevisst «volatile tropp-detaljer» — live-rundene følger samme disiplin.

---

## 1. To moduser

Hver runde er enten **Forhånd** eller **Resultat**. Velg modus FØR du genererer.

### Modus A — Forhånd (stabile fakta, ingen resultater)
Brukes til høydepunkt-quizer FØR en kamp/fase, og til kickoff-runden på avspark.
Innhold: historikk, innbyrdes oppgjør, gruppesammensetning, arena/vertsby, stjerner og storyline-fakta som er sanne uavhengig av hva som skjer på banen.
**Forbudt:** alt som forutsetter et resultat som ikke har skjedd («hvem vinner», «hvem går videre», antatt sluttstilling).

### Modus B — Resultat (fullførte kamper)
Brukes etter at en omgang/fase er ferdigspilt.
Innhold: kun ferdigspilte, flerkildebekreftede kamper — sluttresultat, målscorere, røde kort, straffekonkurranser, rekorder satt i kampen.
**Forbudt:** kamper som ikke er ferdige, «neste»-spekulasjon, alt uavklart.

> **Tidsregel:** Du kan ikke skrive en Modus B-quiz om en kamp før den er spilt. Sjekk dato før du velger modus. På avspark (11. juni) finnes ingen ferdigspilte VM-kamper ennå → kickoff-runden MÅ være Modus A.

---

## 2. Hybrid-kadens — hvilke runder finnes

| Tidspunkt | Runde | Modus | Merknad |
|-----------|-------|-------|---------|
| Avspark 11. juni | **Kickoff: «VM er i gang»** | A | Åpningskamp-storyline, grupper, arena. Klar til avspark. |
| ~14.–15. juni | Gruppespill omgang 1 — oppsummert | B | Etter alle 1.-omgangskamper er spilt |
| ~19.–20. juni | Gruppespill omgang 2 — oppsummert | B | |
| ~25.–27. juni | Gruppespill omgang 3 + «gruppene avgjort» | B | |
| Før 16-del | (høydepunkt ved behov) | A | Forhåndsvisning av sluttspillet |
| Etter hver sluttspillfase | 16-del → 8-del → kvart → semi | B | Én oppsummering per fase |
| Finaledag 19. juli | **Finale-høydepunkt** | A før / B etter | Forhånd før avspark, resultat etter |

Grunnmur = per-fase resultatrunder (B). Hybrid-toppingen = forhåndshøydepunkter (A) på store dager (åpning, sluttspillstart, finale, evt. Norge-kamper).

---

## 3. Den faste 4-stegs løypa per runde

1. **Velg modus + avgrens** (hvilke konkrete kamper/tema, hvilken dato-cutoff).
2. **Generér** med generering-prompten (§5), websøk-grunnet.
3. **Faktasjekk-pass** med faktasjekk-prompten (§6) — adversariell, hvert faktum verifiseres på nytt.
4. **Review-gate + seed**: Christian leser alle 10 spørsmål → lim inn i `build-vm-seed.py` → kjør skriptet → kjør `db/seed-vm-2026.sql` i Supabase. Ny runde står `status:"locked"` til fasen åpner.

---

## 4. Format- og kvalitetskonvensjoner (felles)

- **10 spørsmål** per runde (samme som pre-VM). Aldri færre med oppdiktede fakta — heller verifiser bredere.
- Hvert spørsmål: `Q("Kategori", "spørsmål?", ["riktig","feil","feil","feil"], 0, "forklaring")`. **Riktig svar skrives FØRST** (indeks 0) i kilden — `build-vm-seed.py` stokker alternativene deterministisk, så fasit ikke ligger fast.
- **Kategori-tagger** (bruk disse): `Resultat`, `Målscorer`, `Drama`, `Rekord`, `Gruppe X`, `Arena`, `Historie`, `Stjerner`, `Norge`, `Kuriosa`.
- **Vanskelighet** per runde: `lett` / `medium` / `vanskelig`. Resultatrunder ligger gjerne `medium`; rekord/kuriosa-tunge `vanskelig`.
- Naturlig norsk bokmål. Tankestrek (—) der det passer. Forklaring = én opplysende setning, gjerne med en ekstra faktabit.
- **Distraktorer plausible**: feil-alternativene skal være ekte lag/spillere/tall i samme klasse — aldri åpenbart tøys.
- **Tidsfeste det volatile-nære**: hvis et faktum er sant «per kampslutt», skriv spørsmålet så det blir stående uansett (f.eks. «Hvem scoret X' første mål i VM 2026?» heller enn «Hvem topper toppscorerlista?»).

---

## 5. Generering-prompten (copy-paste)

Fyll inn `{{...}}`. Kjør med websøk på. Modell: fullt datert navn (`claude-sonnet-4-5-20250929`), jf. [[tech-anthropic-modellnavn]].

```
Du lager én quiz på norsk (bokmål) til CustomQuiz' VM 2026-modul.

MODUS: {{A: Forhånd — stabile fakta, INGEN resultater | B: Resultat — kun ferdigspilte kamper}}
RUNDE: {{f.eks. "Gruppespill omgang 1 — oppsummert"}}
AVGRENSNING: {{hvilke konkrete kamper/tema. For Modus B: list opp de fullførte kampene rundens skal dekke}}
DATO-CUTOFF: {{dato — kun fakta som er sanne og avklart per denne datoen}}

ABSOLUTTE REGLER:
1. Faktisk korrekthet er ikke-forhandlingsbart. Bruk websøk-verktøyet og BEKREFT hvert
   resultat, hver målscorer, hvert tall mot minst to pålitelige kilder (FIFA offisiell,
   store medier, Wikipedia) FØR du skriver det. Finn aldri opp noe.
2. Nevn ALDRI noe som ennå kan endre seg: pågående kamper, «hvem går videre», antatt
   sluttstilling, skade-/tropp-spekulasjon. I Modus B: kun kamper som er HELT ferdigspilt
   per dato-cutoff. I Modus A: ingen resultater i det hele tatt.
3. Klarer du ikke bekrefte et faktum trygt — velg en annen, verifiserbar vinkling.
   Heller en solid quiz med litt andre spørsmål enn ett usikkert.

INNHOLD: Lag nøyaktig 10 spørsmål. Riktig svar skal stå FØRST i options-lista (indeks 0).
4 alternativer hver. Plausible, ekte distraktorer (riktige lag/spillere/tall i samme klasse).
Bland kategoriene: Resultat, Målscorer, Drama, Rekord, Gruppe X, Arena, Historie, Stjerner,
Norge, Kuriosa. Norsk, tankestrek der det passer, forklaring = én opplysende setning.

UTFORMAT: Skriv hvert spørsmål som en Python-linje i nøyaktig dette formatet, ingenting annet:
   Q("Kategori","spørsmål?",["riktig","feil1","feil2","feil3"],0,"forklaring."),
Etter de 10 linjene: skriv en kort liste «KILDER:» med URL-ene du bekreftet fakta mot.
```

---

## 6. Faktasjekk-pass (copy-paste) — kjøres ALLTID på output fra §5

Et eget, adversarielt pass. Mat inn de 10 `Q(...)`-linjene. Mål: fange feil før Christian ser dem.

```
Du er faktasjekker for en VM 2026-quiz. Under følger 10 quizspørsmål. For HVERT spørsmål,
bruk websøk og verifiser uavhengig:
  - Er det påståtte riktige svaret (første element i options) faktisk korrekt?
  - Er kampen/hendelsen faktisk ferdigspilt og avklart per {{DATO-CUTOFF}}? (avvis pågående/uavklart)
  - Er noen av distraktorene ved et uhell også korrekte, eller åpenbart urealistiske?
  - Stemmer tall, navn, årstall, stavemåte? (norsk bokmål)
  - Er forklaringen korrekt?

Vær streng — anta at noe er feil til søk bekrefter det. For hvert spørsmål, svar:
  OK  — eller — FEIL: <hva> → <korrigert Q(...)-linje>
Til slutt: en kort dom «KLAR FOR REVIEW» bare hvis alle 10 er OK etter ev. retting,
ellers «MÅ RETTES» med liste over hva.
```

Kun runder som ender på **KLAR FOR REVIEW** går videre til Christians review-gate.

---

## 7. Seeding — slik kobles output til build-skriptet

`scripts/build-vm-seed.py` er kilde-of-truth (emitter både `event-quizzes/vm-2026.json` og `db/seed-vm-2026.sql`, stokker alternativene, validerer 10 spm). Det støtter allerede `phase` og `status` per quiz — en live-runde legges til som ny dict i `QUIZZES`-lista:

```python
{
 "slug":"gruppespill-1","num":"06","phase":"Gruppespill","status":"locked","sort":6,
 "title":"Gruppespill — omgang 1","sub":"Det som skjedde i åpningsrunden.",
 "difficulty":"medium",
 "questions":[
   Q("Resultat", "...?", ["riktig","feil","feil","feil"], 0, "..."),
   # ... 10 totalt (limt inn fra faktasjekket output)
 ]
},
```

- `status`: `"locked"` til fasen åpner → flippes til `"open"` (endre i skriptet + re-seed, eller `update`-SQL i Supabase).
- `slug` unik per runde; `num`/`sort` fortsetter etter pre-VM (01–05 brukt → start på 06).
- `phase`: `"Gruppespill"`, `"Sluttspill"`, `"Finale"` osv. — vises som fase-merke i vm.html.
- Etter innliming: kjør `python3 scripts/build-vm-seed.py` (validerer + stokker + emitter), så kjør den oppdaterte `db/seed-vm-2026.sql` i Supabase. `on conflict` gjør re-kjøring trygt.

> Review-gate i praksis: en runde seedes gjerne `locked` med en gang den er faktasjekket; Christian leser den i ro før fasen åpner og flipper til `open`.

---

## 8. Kvalitets-sjekkliste per runde (før seed)

- [ ] Riktig modus valgt; ingen volatile fakta (Modus B: alle kamper ferdigspilt per cutoff)
- [ ] 10 spørsmål, 4 alternativer hver, riktig svar først i kilden
- [ ] Hvert faktum websøk-bekreftet (generering) **og** uavhengig verifisert (faktasjekk-pass)
- [ ] Faktasjekk-passet endte på «KLAR FOR REVIEW»
- [ ] Kategorier blandet, distraktorer plausible, norsk bokmål
- [ ] Christian har lest alle 10 (review-gate)
- [ ] `build-vm-seed.py` kjørt uten assert-feil; seed kjørt i Supabase; runde `locked`
