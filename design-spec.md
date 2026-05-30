# CustomQuiz — Visuell identitet

Låst 27. mai 2026.

## Designprinsipp

Editorial krem-palett. Lest som et samtidsmagasin på papir: rolig, voksent, lest med tillit. Én dyp teal som signaturfarge gir kontrast og varemerke uten å rope. Bredt appellerende uten å være generisk SaaS.

## Fargesystem

```css
:root {
  /* Bakgrunner */
  --bg:           #F5F0E6;  /* Hovedbakgrunn — varm krem */
  --bg-soft:      #FBF7EE;  /* Lysere krem til kort, paneler, svaralternativer */
  --bg-deep:      #ECE3CE;  /* Litt mørkere variant til subtile soner */

  /* Tekst */
  --ink:          #1F1A14;  /* Primær — nær-svart med varme */
  --ink-soft:     #4B4338;  /* Sekundær brødtekst */
  --ink-mute:     #7A6F5A;  /* Meta, captions, tertiær */

  /* Linjer og rammer */
  --rule:         #E2D8C2;  /* 0.5px borders standard */
  --rule-strong:  #C9BD9F;  /* Hover, fokus, dividers */

  /* Signaturfarge — dyp teal */
  --accent:       #0A6E5A;  /* Eyebrow, progresjon, primærknapp, lenker */
  --accent-soft:  #C9E2D8;  /* Bakgrunn til riktig-svar-pille */
  --accent-deep:  #074538;  /* Pressed state, hover */

  /* Sekundære stater (bare hvor strengt nødvendig) */
  --success:      #2D7A4C;  /* Riktig svar i fasit-recap */
  --success-soft: #DDE9D7;
  --danger:       #A82E1F;  /* Feil svar i fasit-recap */
  --danger-soft:  #F3D9D2;

  /* Radius */
  --r-pill:       999px;    /* Svaralternativ-pillene */
  --r-card:       16px;     /* Hovedkort */
  --r-md:         8px;      /* Knapper, badges */
}
```

## Typografi

Tre familier. Bruk dem disiplinert.

```css
:root {
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-sans:    'Manrope', 'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
}
```

**Bruksregler:**

- **Fraunces** — kun på spørsmålstekst, titler, dommer. Bruk italic `<em>` for emfase på 1-2 ord i et spørsmål: gjør det lekent uten å være cute. Variabel akse `opsz` settes til 36+ på store overskrifter, 14 på mindre titler.
- **Manrope** — alt UI: knapper, svaralternativer, statistikk-tall, navigasjon, brødtekst utenfor quiz. 17px / 1.55 som standard.
- **JetBrains Mono** — eyebrows ("Spørsmål 3 av 10 — Historie"), kategori-labels, metadata, datoer. Uppercase + letter-spacing 0.15-0.20em.

**Skalering:**

| Element | Font | Størrelse | Vekt |
|---|---|---|---|
| H1 (forside, dom) | Fraunces | clamp(40px, 6vw, 64px) / 0.98 / -0.02em | 500 |
| Spørsmål | Fraunces | clamp(22px, 3vw, 32px) / 1.3 | 500 |
| Eyebrow / meta | JetBrains Mono | 11-13px / 1.4 / 0.18em / uppercase | 400 |
| Brødtekst | Manrope | 17px / 1.55 | 400 |
| Svaralternativ | Manrope | 15-16px / 1.45 | 400 |
| Knapp | Manrope | 14-15px / 1 / 0.04em | 500 |
| Statistikk-tall | JetBrains Mono | 24-32px / 1 / -0.02em | 500 |

## Layout og strukturelle grep

- `.container { max-width: 760px; padding: 0 24px; }` — avis-bredde, samme som tidligere prototype
- `body` får subtil tekstur via radial-gradient dots (4×4px, --rule-strong med 30% opacity)
- `.masthead` med 1px topp- og bunn-border i --rule-strong gir avisforside-følelsen
- Svaralternativer som pille (`border-radius: 999px`), hvit bakgrunn (--bg-soft), 0.5px ramme i --rule
- Hover på alternativ: ramme blir --accent, ingen fyll
- Valgt alternativ: bakgrunn --accent, tekst --bg-soft
- Riktig svar i fasit: bakgrunn --success-soft, tekst --success, venstre-border 3px --success
- Feil svar i fasit: bakgrunn --danger-soft, tekst --danger, venstre-border 3px --danger
- Progresjonslinje: 3px høy, --rule bakgrunn, --accent fyll, animér med ease 200ms ved fremdrift

## Komponentbibliotek (første versjon)

Det vi trenger ferdig før uke 4:

1. **MastheadHeader** — CustomQuiz-logo, kategori-eyebrow, dato
2. **QuestionCard** — spørsmål + 4 pille-svar + progresjon
3. **ResultCard** — skår, dom (Fraunces stor), share-pille
4. **RecapItem** — fasit-gjennomgang med ditt-svar og forklaring
5. **ThemeChip** — for tema-generator (krem-pille med teal hover)
6. **StatCard** — streak, totalt, snitt (mono tall + manrope label)
7. **CookieFooter** — minimal, lukker seg ved aksept, gjemmer seg helt for innloggede

## Logo-skisse

Verbal beskrivelse — venter på faktisk logo-arbeid:

> "CustomQuiz" satt med Fraunces, 500-vekt, semi-italic. Q-en er litt stilisert med litt lenger swash på halen. Mulig: bytt ut prikken over i-en med en liten teal sirkel som signaturmotiv som kan brukes alene (favicon, app-ikon, share-card).

Logo-arbeid er ut av MVP-scope men bør låses før uke 4 / soft launch. Lag tre forslag separat når vi kommer dit.

## Sjekkliste når noe nytt bygges

- [ ] Bakgrunn er --bg eller --bg-soft, aldri pure hvit
- [ ] Tekst er --ink (ikke pure svart) — varmt og lesbart
- [ ] Bare én --accent brukt per skjerm der mulig (rolig signal)
- [ ] Borders er 0.5px solid --rule (med mindre vi vil ha emfase)
- [ ] Avstander følger 8-grid (8, 16, 24, 32, 48, 64, 96)
- [ ] Ingen drop shadow, ingen gradient — flatt og editorial
- [ ] Mobile-first: alt fungerer på 360px bredde først, så skaler opp
