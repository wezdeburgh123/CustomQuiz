# Barneserier Spill + Monstere — status og hva som gjenstår

Dato: 23. juni 2026

## Hva som er laget (ferdig)
- `barn-spill-serie-KLAR-FOR-ARKIV.ndjson` — 6 videospill-quizer (lett, 10 spm hver)
- `barn-monstere-serie-KLAR-FOR-ARKIV.ndjson` — 6 monster-quizer (lett, 10 spm hver)
- `barn-spill-monstere-DRAFT.md` — lesbar versjon av alle 120 spørsmål (til korrektur)
- `barn-spill-monstere-BILDEPROMPTS.md` — spot-farger + 14 ChatGPT-bildeprompts
- `barn-merge-nye-serier.py` — trygt, idempotent merge-script
- Generator: `scripts/generer-barn-spill-monstere.py` (kjør på nytt om du redigerer innhold)

Fakta er grunnet mot websøk (Minecraft/Mojang 2011, Fortnite/Epic 2017, Roblox 2006,
Pokémon 1996, Godzilla/Toho 1954, King Kong 1933, Digimon = «Digital Monsters», kaiju).
Innhold er IP-trygt: bildemotivene er bevisst GENERISKE (ingen Mario/Pikachu/Godzilla-likeness).

## Rekkefølge for å sette det live

### 1. Korrektur (anbefalt)
Les `barn-spill-monstere-DRAFT.md`. Endre du noe? Rediger i
`scripts/generer-barn-spill-monstere.py` og kjør den på nytt — den re-validerer.

### 2. Lag de 14 bildene
Bruk promptene i `barn-spill-monstere-BILDEPROMPTS.md` i ChatGPT.
Legg filene i `IMG/` med de oppgitte navnene (kategori-cover + ett per quiz-slug).

### 3. Wiring i front-end (nye kategorier «spill» og «monstere»)
Disse må inn FØR merge gir synlig effekt. Spot-fargen må (jf. tidligere erfaring)
legges inn i ALLE filene som har spot-fargelista, ikke bare arkiv.html.

a) Legg til spot-farger i `:root` (arkiv.html + evt. andre filer med samme blokk):
```
--spot-spill:     #1F7A8A;
--spot-monstere:  #6F3F96;
```

b) I `arkiv.html`, utvid `CATEGORY_TO_IMG`:
```
spill: 'kategori-spill', monstere: 'kategori-monstere',
```

c) I `arkiv.html`, utvid per-slug-cover-regelen (samme som «dyr» bruker).
Finn linja som i dag har:
`q.category === 'dyr' ? q.slug : null`
og endre til:
`['dyr','spill','monstere'].includes(q.category) ? q.slug : null`

d) Hvis det finnes en kategori→spot-farge-mapping (for bilde-tonen), legg til
`spill` og `monstere` der også.

e) Barneserien bør samles i én «For barn»-inngang (Dyr / Spill / Monstere) —
se mockup `arkiv-mockup-ny.html` for hvordan kortene ser ut.

### 4. Merge data inn i arkivet
Kjør denne ene linja i Terminal (stå i prosjektmappa):
```
python3 quiz-library/barn-merge-nye-serier.py
```
Den legger de 12 quizene i `library.ndjson` og emnene i `topics.json`.
Trygt å kjøre flere ganger — den hopper over det som alt finnes.

### 5. Synk til database + publiser
Kjør library-sync som vanlig (samme som for dyr-serien), commit og push.

## Hvis noe ser feil ut
- «Quiz finnes ikke» / tomt cover → bilde mangler i `IMG/` eller wiring (3b/3c) er ikke gjort.
- Kategorien vises ikke → spot-farge/chip-wiring mangler (3a/3d/3e).
- Dubletter → merge-scriptet sier ifra; det skal stå «Dubletter i library: ingen».
