# Kan dagens-innholdet brukes til mer enn dagens?

**Nei — fordi det ikke finnes noe eget dagens-innhold. `/dagens` er allerede
ren gjenbruk av arkivet.**

Denne fila inneholdt først en plan for å «hente ut» 927 dagens-quizer og løfte
dem inn i arkivet. Den planen var bygget på en feil premiss og er nå erstattet.
Rettet 6. august 2026 etter at Christian utfordret premisset.

---

## Hva som faktisk skjer

`netlify/functions/daily-quiz-generate.js` genererer ingenting i normal drift.
Den **materialiserer** én utgave per kategori ved å plukke en eksisterende quiz
fra `quiz_library`:

```js
// _daily.js
async function pickFromLibrary(category, dateStr) {
  … .from("quiz_library")
     .eq("category", category).eq("published", true).eq("review_status", "auto_ok")
  const idx = ((dayNumber(dateStr) + off) % rows.length + rows.length) % rows.length;
  return { title: r.title, lede: r.lede, questions: r.questions, … };
}
```

Utvalget er deterministisk og roterer med datoen. Kommentaren i toppen av
generatoren sier det rett ut:

> «Utvalget er deterministisk (samme for alle, roterer dag for dag) og GRATIS —
> det gjenbruker quizene nattskiftet allerede har lagt i arkivet, så vi genererer
> ingenting nytt via API-et i normal drift.»

API-generering skjer **kun** i `ensureFallback()`, og bare hvis en dato ender med
null utgaver (tomt arkiv). Den kjører dessuten med `withSearch: false`.

## Tallene som beviser det

```sql
select count(*) dagens_rader,
       count(distinct d.quiz->>'title') unike_titler,
       count(*) filter (where l.title is not null) finnes_i_arkivet,
       count(*) filter (where l.title is null)     kun_i_dagens
from daily_quiz d
left join quiz_library l on l.title = d.quiz->>'title';
```

| dagens_rader | unike_titler | finnes_i_arkivet | kun_i_dagens |
|---|---|---|---|
| 927 | **276** | 1385¹ | **7** |

¹ Over 927 fordi joinen fan-outer når samme tittel finnes i flere
vanskelighetsgrader i arkivet.

**276 unike titler fordelt på 927 rader** — det er rotasjon, ikke produksjon. Og
**269 av de 276 finnes allerede i `quiz_library`**, altså allerede som
indekserbare `/quiz/<slug>/`-sider. De 7 avvikene er nesten sikkert
fallback-genererte fra de første dagene i slutten av mai, da arkivet var tomt.

---

## Hva dette betyr for spørsmålene dine

**«Er ikke disse også faktasjekket?»** Ja — fordi de *er* arkivquizene.
Nattskiftet grunnet dem med websøk og satte `grounded: true`, og `pickFromLibrary`
filtrerer på `published = true` og `review_status = 'auto_ok'`. Det var her jeg
tok feil: jeg leste at `grounded` manglet på `daily_quiz`-radene og konkluderte at
grunningen var ukjent. Men feltet mangler bare fordi kopien tar med seg
`title`/`lede`/`questions` og ikke metadataene — ikke fordi innholdet er
ugrunnet.

**«Hvorfor ikke bare kjøre gjennom dem og få dem på nett?»** Fordi de allerede er
på nett. Det finnes ingen kø å tømme.

---

## Feil i den forrige versjonen av denne fila

Retter for ordens skyld, siden noe av det også havnet i statusrapporten:

| Påstand | Faktisk |
|---|---|
| «927 AI-genererte quizer, 16 per natt» | 0 API-kall i normal drift. Rotasjon fra arkivet. |
| «Mye modellkjøring for 4 klikk på /dagens» | Ingen kostnad å kutte. Premisset var feil. |
| «Dobler spillbart innhold» | 269 av 276 unike titler er allerede live. |
| «Verdens lengste elver ble generert i natt og kastet» | Det var arkivquizen `verdens-lengste-elver` vist som dagens geografi-utgave. Ingenting ble generert eller kastet. |
| «Fase 3: kutt fra 16 til 6–8 kategorier» | Frigjør ingen kapasitet. Kun et produktvalg om bredde. |

---

## Det som fortsatt står

Gjenbruksideen faller, men to observasjoner fra samme undersøkelse holder:

**`/dagens` er et utstillingsvindu, ikke et lager.** Den viser 16 arkivquizer per
dag, valgt deterministisk. Verdien ligger i å gjøre vinduet mer effektivt — føre
folk videre inn i arkivet — ikke i å mine det. En «se flere i denne kategorien»-
lenke fra hver dagsutgave til `/tema/<kategori>/` er det opplagte grepet.

**Arkivet er hele beholdningen, og den vokser bare via nattskiftet.** Da er køen
i `topics.json` den eneste reelle innholdsmotoren. Den sto tom fra 27. juli til
6. august. Det er der oppmerksomheten hører.

**Rotasjonen har en svakhet verdt å merke:** `pickFromLibrary` sorterer på
`created_at` og tar `(dayNumber + offset) % antall`. Når arkivet vokser, endres
`antall`, og rotasjonen hopper. Ikke et problem i seg selv, men det betyr at det
ikke finnes noen garanti for at alle arkivquizer får en tur som dagsutgave — og
102 quizer har fortsatt 0 plays.

---

## Store kategorier på forsiden

Dette står uendret fra forrige versjon og ble delvis fikset 6.8:

- Alle 13 kategori-chips lenket uten avsluttende skråstrek → 301 på hver. Rettet.
- `/tema/dyr/`, `/tema/spill/`, `/tema/monstere/` var live siden 19.–23. juni men
  ikke lenket fra forsiden. Lagt inn, med manglende CSS-selector for spotfargen
  oker.

Neste steg: tema-hubbene er de egentlige landingssidene (16 stk, alle i sitemap)
og er i dag tynne lister. De tåler ingress med søkeord, «mest spilte i denne
kategorien», og dagens utgave i kategorien. Se `ARKIV-IA-replan.md` +
`arkiv-mockup-ny.html` (23. juni) før du designer på nytt — den skisserer alt
dette og ble aldri kodet.

---

## Og advarselen fra sist står fortsatt

De mest spilte quizene er egengenererte og personlige — Dinamo, Igorrr,
Brønnøysund, Tromsø, Zuma:

| Kilde | Antall | Plays | Plays per quiz |
|---|---|---|---|
| `user` | 35 | 181 | **5,2** |
| `nightly` | 211 | 287 | 1,4 |
| `manual-*` | 173 | 301 | 1,7 |

Brukerlagde quizer spilles 3,7× mer per stykk. Ingen nye brukere siden 3. juli
(32 totalt). Mer AI-innhold er kanskje ikke flaskehalsen.

---
*Rettet 6. august 2026. Konklusjonen er snudd fra forrige versjon: det finnes
ingen uforløst dagens-ressurs å hente ut.*
