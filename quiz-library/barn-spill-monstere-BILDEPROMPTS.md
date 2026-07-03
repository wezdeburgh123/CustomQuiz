# Barneserier Spill + Monstere — spot-farger og bildeprompts

Til ChatGPT (bildegenerering). Følger nøyaktig samme etse-stil som dyr-serien:
ALL strektegning er MONOKROM dyp grønnblå (#0A6E5A) på krem (#F5F0E6).
Spot-fargen (under) legges på AUTOMATISK senere — ikke be ChatGPT om den i bildet.

⚠️ Hold motivene GENERISKE (ikke Mario, ikke Pikachu, ikke ekte Godzilla osv.).
ChatGPT nekter ofte å tegne varemerkede figurer, og vi vil unngå IP-trøbbel.
Motivene under er laget for å signalisere temaet uten å kopiere en beskyttet figur.

---

## Spot-farger (barne-paletten)

Tre farger danner barneverdenen — varme, men tydelig adskilt:

| Kategori  | Navn          | HEX       | Merknad                              |
|-----------|---------------|-----------|--------------------------------------|
| Dyr       | oker          | `#9A5B26` | finnes allerede                      |
| Spill     | spillblå/petrol | `#1F7A8A` | ny — «skjerm/digital», skiller seg fra teal og kobolt |
| Monstere  | monsterlilla  | `#6F3F96` | ny — leken og monstrete, skiller seg fra plommen |

Legg disse inn der de andre spot-fargene bor (`:root` i arkiv.html m.fl.):
```
--spot-spill:     #1F7A8A;
--spot-monstere:  #6F3F96;
```

---

## Kategori-cover (2 stk)

**Filnavn:** `kategori-spill.jpg`

```
Et barnevennlig kvadratisk bilde i vintage kobberstikk-/etsestil: MONOKROM dyp grønnblå (#0A6E5A) strektegning med fine kryss-skraveringer på varm kremfarget bakgrunn (#F5F0E6). Kun denne ene fargen + cremen — ingen andre farger (kategorifargen legges på automatisk senere). Motiv: en sjarmerende komposisjon av GENERISKE spill-symboler — en gammeldags spillkontroll (gamepad) med D-pad og knapper, en liten stabel firkantede «pixel»-kuber, og en arkademaskin-silhuett. Lekent og innbydende, ikke et ekte/varemerket spill. Ren komposisjon, god luft, ingen tekst, ingen logoer.
```

**Filnavn:** `kategori-monstere.jpg`

```
Et barnevennlig kvadratisk bilde i vintage kobberstikk-/etsestil: MONOKROM dyp grønnblå (#0A6E5A) strektegning med fine kryss-skraveringer på varm kremfarget bakgrunn (#F5F0E6). Kun denne ene fargen + cremen — ingen andre farger (kategorifargen legges på automatisk senere). Motiv: en liten gjeng GENERISKE, vennlige monstre samlet sammen — ett lodent enøyd monster, en liten snill drage, og en rund tannet skapning med store øyne. Skummel-søte, ikke skremmende. Gammeldags eventyrbok-illustrasjon møter lekent barnebokuttrykk. Ren komposisjon, god luft, ingen tekst.
```

---

## Quiz-cover — Spill (6 stk)

Filnavn = quizens slug + `.jpg` (samme system som dyr-serien, der coveret heter som slug-en).

**`minecraft__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: en pen liten stabel av firkantede «pixel»-kuber med en enkel hakke som hviler mot dem, og ett lite gress-toppet blokk-tre ved siden. Byggeklosse-stemning, lekent og innbydende. Generisk — ikke et ekte spill. Ren komposisjon, god luft, ingen tekst.
```

**`super-mario__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én sjarmerende, rund sopp med prikker på hatten, med en liten skinnende stjerne svevende ved siden — klassisk «plattformspill»-stemning. Generisk, ikke en varemerket figur. Vennlig uttrykk. Ren komposisjon, god luft, ingen tekst.
```

**`pokemon-spillet__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én generisk rund «fangstkule» (delt i en øvre og nedre halvdel med en knapp i midten) som hviler i høyt gress, med en liten gnist/funke ved siden som antyder noe elektrisk. Generisk — ikke en varemerket ball eller figur. Lekent. Ren komposisjon, god luft, ingen tekst.
```

**`roblox__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én vennlig liten figur bygget av firkantede byggeklosser (klossete armer og bein, enkel firkantet hode), som om den er satt sammen av klosser. Generisk avatar — ikke et varemerket spill. Sjarmerende. Ren komposisjon, god luft, ingen tekst.
```

**`fortnite__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én liten figur som svever ned mot en øy under en buet fallskjerm, med små skyer rundt. Eventyrlig «hopp ut og land»-stemning. Generisk — ikke et varemerket spill. Lekent og luftig. Ren komposisjon, god luft, ingen tekst.
```

**`spillklassikere__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én staselig gammeldags arkademaskin sett forfra, med en liten joystick og knapper, og to enkle «pixel-spøkelser» som svever ved siden. Retro og nostalgisk, men lekent. Generisk. Ren komposisjon, god luft, ingen tekst.
```

---

## Quiz-cover — Monstere (6 stk)

**`godzilla__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én GENERISK vennlig kjempeøgle (ikke Godzilla) med ryggpigger, som rager godt over noen bittesmå hus nederst i bildet — så man skjønner hvor enorm den er. Sjarmerende uttrykk, ikke skremmende. Ren komposisjon, god luft, ingen tekst.
```

**`lommemonstre__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én liten, rund, generisk lommemonster-skapning med store vennlige øyne og små ører, og en liten gnist ved kinnet som antyder noe elektrisk. Generisk — ikke en varemerket figur. Søt og leken. Ren komposisjon, god luft, ingen tekst.
```

**`drager-i-popkultur__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én sjarmerende liten drage med runde vinger som puster en bitteliten, lekende flamme, vennlig uttrykk — skummel-søt, ikke truende. Generisk drage. Ren komposisjon, god luft, ingen tekst.
```

**`snille-monstre__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: ett lodent, smilende monster med ett stort vennlig øye og to små horn, vinkende. Tydelig snilt og koselig — det «skumle» monsteret som egentlig er en godfjott. Generisk. Ren komposisjon, god luft, ingen tekst.
```

**`king-kong-og-filmmonstre__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: én GENERISK stor, snill ape (ikke King Kong) som klamrer seg fast halvveis oppe på et høyt, slankt tårn, med en liten halvmåne i hjørnet. Gammel-film-stemning, sjarmerende, ikke skremmende. Ren komposisjon, god luft, ingen tekst.
```

**`monsterfakta__lett.jpg`**
```
Barnevennlig kvadratisk etse-/kobberstikkillustrasjon. MONOKROM dyp grønnblå (#0A6E5A) strek med fine kryss-skraveringer på krem (#F5F0E6). Kun denne fargen + cremen. Motiv: ett vennlig, lodent troll med stor nese som titter frem bak en liten steinbro — nordisk eventyrstemning. Nysgjerrig og snilt uttrykk, ikke skremmende. Generisk. Ren komposisjon, god luft, ingen tekst.
```

---

## Når bildene er laget
Legg alle 14 filene i `IMG/` med navnene over. Front-end-wiring som trengs for at
de nye kategoriene skal vises: se `quiz-library/BARN-NYE-SERIER-LES-MEG.md`.
