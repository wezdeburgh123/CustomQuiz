# Google Search Console — reindeksering etter SEO-runden

Mål: få Google til å oppdage den nye lenkegrafen + de crawlbare `/quiz/`- og
`/tema/`-sidene raskere. Alt under gjøres i nettleseren på
[search.google.com/search-console](https://search.google.com/search-console)
med Google-kontoen som eier customquiz.no.

> Jeg (Claude) kan også kjøre hele denne prosessen for deg via nettleseren din
> hvis du er logget inn på Search Console i Chrome — bare si «gjør det i
> nettleseren», så tar jeg klikkingen. Ellers følg stegene under.

## 1. Send inn sitemap på nytt (30 sek)

1. Åpne Search Console → velg eiendommen **customquiz.no**.
2. Venstremenyen → **Sitemaps**.
3. Under «Legg til ny sitemap», skriv: `sitemap.xml` → **Send inn**.
4. Den skal få status **Vellykket**. (Den lister nå alle `/quiz/`- og
   `/tema/`-URLene — regenereres automatisk ved hver deploy.)

## 2. Be om indeksering av nøkkelsider (2 min)

For hver URL under: lim den inn i søkefeltet **øverst** i Search Console
(«Inspiser en URL»), vent på analysen, og trykk **Be om indeksering**.

Ta disse først (de viktigste inngangene):

- `https://customquiz.no/`
- `https://customquiz.no/arkiv`
- `https://customquiz.no/tema/geografi/`
- `https://customquiz.no/tema/historie/`
- `https://customquiz.no/tema/fotball/`
- `https://customquiz.no/quiz/afrikas-land__lett/`
- `https://customquiz.no/quiz/romerriket__lett/`

(Du trenger ikke gjøre alle 340 — Google finner resten via lenkegrafen +
sitemap. Disse gir bare et dytt på de viktigste malene.)

## 3. Sjekk at rike resultater validerer (valgfritt, 1 min)

- Åpne [Rich Results Test](https://search.google.com/test/rich-results).
- Test `https://customquiz.no/` → skal finne **FAQPage**.
- Test `https://customquiz.no/quiz/afrikas-land__lett/` → skal finne
  **BreadcrumbList** (og Quiz).

## 4. Følg opp om 1–2 uker

- Search Console → **Sider** (Indeksering): se at antall indekserte sider
  stiger fra ~1 mot flere hundre.
- Search Console → **Ytelse**: visninger/klikk på `/quiz/`- og `/tema/`-URLer.

Det er den eneste harde målingen på om trafikken faktisk tar seg opp — se
`SEO-runde-2-klargjort.md` for hvorfor vi også bør ha egen analyse.
