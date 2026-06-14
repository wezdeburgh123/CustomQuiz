# Pre-game genererings-prompt (Modus A utvidet)

> Utvidelse av Modus A i `VM-fotball-prompt.md`, tilpasset én pre-game storkamp.
> Brukes av den planlagte kampdag-oppgaven eller manuelt. Fyll inn `{LAG_A}`, `{LAG_B}`, `{KAMP}`, `{DATO}`.

---

## Oppdrag

Lag en **pre-game-quiz på 10 spørsmål** om oppgjøret **{LAG_A} vs {LAG_B}** ({KAMP}, {DATO}), til å spille *før avspark*. Norsk språk, lett-til-medium tone, gøy å ta i vennegjeng.

## Sammensetning (10 spm)

- **6–7 STABILE spørsmål** (lav faktarisiko): VM-historikk for hvert lag, ikoniske spillere, tidligere innbyrdes oppgjør, kjente trenere, forbund/kallenavn, kuriosa. Disse kan lages i forveien.
- **2–3 FERSKE spørsmål** (må websøk-grunnes SAMME MORGEN): stilling i gruppa akkurat nå, resultater så langt i dette VM-et, aktuell form/skader, hva laget trenger for å gå videre. Marker disse tydelig i utkastet som `[FERSK]` så review-gaten vet hvor å se nøye.
- Minst 2–3 resonnementsbaserte spm (ikke ren pugg) der det passer.

## Faktaregler (ikke-forhandlingsbart)

1. **Grunn ALT mot websøk** — særlig de ferske. Ingen påstand fra hukommelse om noe som har skjedd i dette VM-et.
2. **Ferske fakta har holdbarhet:** skriv dem slik at de er sanne *ved avspark {DATO}*, ikke «sist oppdatert». Hvis et faktum kan endres av en kamp samme dag før avspark, velg et tryggere.
3. **Adversarielt faktasjekk-pass** etter generering: gå gjennom hver fasit på nytt, prøv aktivt å motbevise den med et nytt søk. Flagg alt usikkert til C i stedet for å gjette.
4. Alternativer stokkes, fasit jevnt fordelt over de fire posisjonene (frontend stokker uansett).
5. Hver feil-alternativ skal være plausibelt, ikke åpenbart tull.

## Output-format

Skriv utkastet til `VM-pregame-utkast-{LAG_A}-vs-{LAG_B}-{DATO}.md` med:
- De 10 spørsmålene m/ 4 alternativer hver, fasit markert, `[FERSK]`-tagg på ferske spm.
- En kort **kilde-/faktasjekk-logg** nederst: hvilke søk ble gjort, hvilke ferske fakta ble bekreftet, hva som ble forkastet som for ferskt/usikkert.
- Klar til at C limer inn i `scripts/build-vm-seed.py`.

## Etter generering

Cl varsler C. C leser alle 10 spm (spesielt `[FERSK]`), seeder via `build-vm-seed.py` → `db/seed-vm-2026.sql`, og flipper `status=open` god tid før avspark. Claude rører aldri DB direkte.
