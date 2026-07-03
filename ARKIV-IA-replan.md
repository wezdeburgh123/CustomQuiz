# Arkivet — ny informasjonsarkitektur (re-plan)

Dato: 22. juni 2026
Status: PLAN — ikke implementert. Mockup vist i chat. Ingen kode rørt.

## Problemet
`arkiv.html` viser i dag **335 quizer** i ett flatt rutenett. Eneste navigasjon er:
sortering (Mest spilt / Nyeste), tema-filter-chips, og et lag-underfilter for fotball.
Det finnes **ikke noe fritekst-søk** (eneste `<input` på siden er betalings-e-post).
Med 335 quizer blir det vanskelig å finne frem.

## Datagrunnlag (faktisk, fra quiz-library/library.ndjson)
- **335 quizer totalt**
- **12 «voksen»-temaer med nøyaktig 18 quizer hver**: film, filosofi, geografi, historie,
  kunst, litteratur, mix (Blandet), musikk, sport, vitenskap, teknologi, verdenshistorie
- **dyr: 6** (barneserie, 8–12 år, oker spot-farge)
- **fotball: 113** — en tredjedel av hele arkivet. Egen sub-taksonomi:
  - Klubber (Liverpool, Man Utd, Arsenal mest — ~60+ quizer)
  - Serier & cuper (Premier League, Champions League, Eliteserien, FA-cup …)
  - Landslag / Norge
  - VM 2026 + VM gjennom tidene
  - Kvinnefotball
- Hver quiz har feltene: `slug, themes[], category, category_label, difficulty, title, lede, questions, grounded, source`
  → `themes[]` og `difficulty` er allerede tilgjengelig for både søk og filtrering.

## Ny IA — tre soner

### 1. Søk på topp (størst gevinst, lavest innsats)
Live fritekst-søk som filtrerer på `title + lede + themes + category` mens man skriver.
All data er allerede lastet → instant, ingen backend-kall.
- Plasseres som første element under arkiv-tittelen.
- Når søk er aktivt: vis flat treffliste på tvers av alle soner + «relevans» som sorteringsvalg.
- Tomt søk = vis hub (under).

### 2. Fotball = egen verden
Fotball skilles ut som en featured inngang (ikke bare én chip blant mange), fordi den
er 1/3 av arkivet og drukner resten i dagens flate liste.
- Eget banner/landing øverst (eller egen side fotball.html).
- Inngang velger først underseksjon: Klubber · Serier & cuper · Landslag · VM.
- Lag-underfilteret som finnes i dag flyttes hit.

### 3. Tema-hub (de 12) + barn
I stedet for 335 ruter på rad: et rutenett med 12 temakort.
- Hvert kort: ikon + spot-farge + temanavn + antall («18 quizer»).
- Klikk på kort → temaets 18 quizer (drill-in), ikke alt på én gang.
- Barneserien (Dyr, 6) får egen vennlig inngang med oker spot-farge, adskilt fra voksen-temaene.

### Inne i et tema (drill-in)
- Behold sortering: Mest spilt / Nyeste (+ Relevans når man har søkt).
- Legg til vanskelighetsfilter: Lett / Middels / Vanskelig (`difficulty` finnes i data).
- Gratis-merket og paywall-logikk uendret.

## Smågevinster (P2)
- Antall på hver tema-chip/-kort («Historie 18»).
- «Flere som denne»-rad basert på `themes[]` (felt finnes allerede) etter at man har spilt.
- Tastatursnarvei (⌘K / Ctrl-K) som fokuserer søkefeltet.

## Designsystem (fra arkiv.html :root — må matches)
- Bunn `#F5F0E6`, soft `#FBF7EE`, deep `#ECE3CE`
- Blekk `#1F1A14` / soft `#4B4338` / mute `#7A6F5A`
- Linjer `#E2D8C2` / strong `#C9BD9F`
- Aksent (teal) `#0A6E5A`, deep `#074538`, soft `#C9E2D8`
- Spot-farger: teal #0A6E5A, moss #5C7A3C, cobalt #2C4A8F, terracotta #B05238,
  plum #6B3050, saffron #C68A2E, oker #9A5B26 (Dyr)
- Font: Fraunces (display), Manrope (sans), JetBrains Mono
- Radius: kort 16px, pill 999px

## Anbefalt rekkefølge for bygging
1. Søkefelt (rask, frittstående, stor effekt) — kan leveres alene.
2. Antall på temakort + skille fotball ut i egen sone på arkiv.html.
3. Drill-in per tema + vanskelighetsfilter.
4. P2-smågevinster.

## Åpne valg å ta før koding
- Fotball: egen seksjon på arkiv.html, eller egen side fotball.html?
- Drill-in: ny side per tema (SEO-vennlig, flere landingssider) eller in-place filtrering?
- Søk: kun arkiv, eller global (også fra forsiden index.html)?
