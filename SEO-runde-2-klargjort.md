# SEO-runde 2 — klargjort for beslutning (følges opp)

Tre gjenstående punkter fra SSR-rapporten. #1 er ferdig kodet og venter bare på
deploy. #2 og #3 trenger ett valg hver fra deg før jeg kjører dem ferdig.

---

## 1. noindex på spiller-instansene ✅ FERDIG KODET

**Hva:** `/lag-quiz?lib=…`, `?quiz=…` og `?event=…` er spiller-URLer som
dupliserer den kanoniske `/quiz/{slug}/`-siden. De bør ikke indekseres (ellers
konkurrerer de med sidene som faktisk skal rangere). Generator-landingen
`/lag-quiz` (uten parametere) forblir indekserbar.

**Løsning:** Et lite script i `<head>` på `lag-quiz.html` legger til
`<meta name="robots" content="noindex,follow">` kun når `?lib/?quiz/?event`
finnes. `follow` gjør at lenkekraft fortsatt flyter videre.

**Status:** Endret i `lag-quiz.html`, verifisert logikk. Ikke 301 — det ville
brutt selve avspillingen, siden `/lag-quiz` ER spilleren.

**Deploy:** se kommandoen nederst.

---

## 2. Analyse — ETT VALG TRENGS ⚠️ viktig personvern-nyanse

**Problem:** FAQ-en på forsiden lover uttrykkelig *«ingen tredjeparts-tracking,
ingen reklame. Dataen din ligger i EU (Frankfurt).»* Å lime inn Google Analytics
(eller andre USA-baserte sporingsscript) ville **bryte det løftet** og
undergrave tilliten produktet bygger på. Så vi må velge en løsning som faktisk
holder løftet.

**Alternativer (rangert etter hvor godt de matcher løftet):**

| Valg | Tredjeparts-script i siden? | Cookies/PII? | Kost | Oppsett |
|---|---|---|---|---|
| **A. Netlify Analytics** (anbefalt) | Nei — server-logg | Nei | $9/mnd | Ett klikk i Netlify, ingen kode |
| **B. Cloudflare Web Analytics** | Ja (Cloudflare) | Nei, cookieless | Gratis | Lite script-snutt |
| **C. Plausible EU / self-host Umami** | Ja (men EU + cookieless) | Nei | Gratis–billig | Mer oppsett |

**Anbefaling:** **A (Netlify Analytics)** — det er loggbasert, har *ingen*
script i siden, *ingen* cookies og *ingen* tredjepart brukeren ser. Da holder
FAQ-løftet 100 %, og du får besøkstall per side (inkl. per `/quiz/`-side) uten å
røre koden. Eneste ulempe er $9/mnd.

Hvis du vil unngå kostnaden: **B** er gratis og nesten like ren (Cloudflare er
en tredjepart, men cookieless/ingen PII — da bør FAQ-teksten finjusteres til
«ingen reklame-tracking»).

**Jeg trenger fra deg:** «kjør A» (jeg viser deg det ene klikket i Netlify) eller
«kjør B» (jeg legger inn snippeten + justerer FAQ-teksten litt).

---

## 3. Per-quiz OG-bilde — ETT VALG TRENGS

**Nå:** quizer med AI-cover (`hero_img`) har allerede unikt OG-bilde; resten
faller til kategori-bildet.

**Alternativer:**

- **A (lett, anbefalt):** Backfill AI-cover for arkiv-quizene som mangler det,
  via den eksisterende cover-pipelinen (`quiz-cover-background.js` +
  OpenAI `gpt-image-1`). Da får hver quiz et unikt `og:image` uten å bygge noe
  nytt. Krever `COVER_TOKEN` + OpenAI-nøkkel i miljøet, så kjører jeg batchen.
- **B (tung):** Egen `/IMG/og/{slug}.jpg` med tittel/kategori/spilltall brent
  inn (compositing ved publisering). Peneste delekort, men klart størst jobb.

**Anbefaling:** **A** — gjenbruker det som finnes, lav risiko, stor effekt på
delekort i sosiale medier. **B** kan komme senere hvis vi vil ha tekst-i-bilde.

**Jeg trenger fra deg:** «kjør OG-backfill» + bekreft at OpenAI-nøkkel/COVER_TOKEN
er satt, så tar jeg resten.

---

## Deploy — kjør når du vil (dekker punkt 1)

```
cd ~/Documents/Claude/Projects/"Quiz generator"
git add lag-quiz.html
git commit -m "SEO: noindex på spiller-instanser (?lib/?quiz/?event)"
git push
```

Netlify bygger automatisk. Etterpå kan vi kjøre GSC-oppskriften
(`SEO-GSC-oppskrift.md`).

## Oppsummert — hva jeg venter på fra deg i morgen

1. Analyse: **A eller B**?
2. OG-bilde: **kjør backfill (A)?** + er OpenAI-nøkkel/COVER_TOKEN satt?
3. Vil du at jeg kjører GSC-stegene i nettleseren din, eller gjør du det selv?
