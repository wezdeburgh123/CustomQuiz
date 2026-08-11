# Arkiv: den gamle «customquiz-gsc-ukesjekk»-oppgaven

Slettet 10. august 2026 da de to overlappende GSC-oppgavene ble slått sammen til
én: `gsc-ukesrutine-customquiz` (mandag 07:34). Alt av verdi herfra er foldet inn
i den nye — 7-dagers topplinje, evergreen-vs-fotball-skillet, VM-kontekst og
indekseringssjekken.

Grunnen til sammenslåingen: de to kjørte 70 minutter fra hverandre samme morgen
(05:53 og 07:02), hentet stort sett samme data, og fokusside-lista under var
frosset i juli-tilstand. Den gamle skrev bare til chat, ikke til fil.

Beholdt her for sporbarhet. SKILL.md-fila ligger fortsatt på disk i
`/Users/christian/Documents/Claude/Scheduled/customquiz-gsc-ukesjekk/` — bare
avregistrert fra planleggeren.

---

## Original prompt (ordrett)

```
Lag en kort ukentlig SEO-statusrapport for CustomQuiz (customquiz.no) basert på ferske tall fra Google Search Console. Skriv på norsk, konsist og direkte.

FORUTSETNING: Dette krever Chrome koblet til (Claude in Chrome), og at brukeren er innlogget på Search Console med kontoen som eier customquiz.no. Hvis nettleseren ikke er tilgjengelig eller ikke innlogget, skriv en kort beskjed om det og stopp — ikke prøv å hente data på andre måter.

SLIK HENTER DU DATA (via nettleseren):
1. Åpne en fersk fane (tabs_create_mcp) og naviger til Performance-rapporten. GSC sin SPA henger ofte i «laster» hvis du gjenbruker en fane som nettopp kjørte en URL-inspeksjon — bruk derfor alltid en NY fane, og hvis skjermbilde/get_page_text feiler med «document_idle», naviger til en frisk URL i en ny fane og prøv igjen.
2. Hent totaler for SISTE 7 DAGER: https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:customquiz.no&metrics=CLICKS,IMPRESSIONS,CTR,POSITION&num_of_days=7 — les Total clicks, Total impressions, Average CTR, Average position.
3. Hent totaler for SISTE 28 DAGER (bytt num_of_days=28) for kontekst.
4. Hent PAGES-breakdown (legg til &breakdown=page) og QUERIES-breakdown (&breakdown=query), begge for 28 dager. Bruk get_page_text for å lese tabellene.

FOKUS-SIDER å rapportere spesifikt på (klikk, visninger, CTR, posisjon — og endring fra forrige uke hvis mulig):
- /quiz/norge-i-vm-1994__lett/  (ny, mål: fange «hvor langt kom norge i vm 1994»)
- /quiz/norge-i-fotball-vm-gjennom-historien__medium/  (den store visnings-siden, CTR var 0,5 %)
- /quiz/verdens-geografiske-rekorder__lett/  (ny)
- /quiz/beromte-vikinger__lett/, /quiz/norron-mytologi__lett/, /quiz/vikingenes-tokt-og-slag__lett/  (ny viking-serie)
- /quiz/fotball-vm-2026-alt-du-ma-vite__lett/  (ny)
- /quiz/fotball-vm-gjennom-tidene__lett/  (oppdatert meta)

FOKUS-SØK å sjekke posisjon/CTR på: «hvor langt kom norge i vm 1994», «verdens lengste elv», «hovedstad quiz», «vm quiz 2026», «geografi quiz verden».

RAPPORTEN skal inneholde:
1. Topplinje: klikk / visninger / CTR / snittposisjon siste 7 dager, med retning vs. forrige periode (opp/ned).
2. Er de nye sidene begynt å få visninger/klikk ennå? (De ble publisert ~9-10. juli 2026.)
3. Beveger CTR seg på norge-i-vm-1994 og norge-i-fotball-vm-gjennom-historien? (Hovedmålet med SEO-runden.)
4. Én konkret anbefaling for uken — hva bør lages mer av, eller hvilken side trenger en titel/meta-justering (basert på høye visninger + lav CTR, eller høy posisjon som kan dyttes opp).

VIKTIG KONTEKST: VM 2026 gikk til 19. juli 2026 — fotball/VM-søk var kunstig høyt under mesterskapet og faller etterpå. Ikke tolk et fall i VM-relaterte søk som at noe er galt; vurder de evigvarende temaene (VM 1994-nostalgi, geografi, hovedsteder, vikinger) separat.

Hold rapporten kort — topplinje + 3-5 kulepunkter + én anbefaling. Ikke bruk skjermbilder i svaret; oppsummer tallene i tekst.
```

## Siste kjøring (10.8.2026) — funnene som utløste sammenslåingen

Den siste kjøringen fant to ting den nye rutinen nå fanger systematisk:

1. `verdens-geografiske-rekorder__lett` hadde 0 visninger på 90 dager til tross for
   at siden er live, har riktig canonical, ingen noindex og ligger i live sitemap.
2. VM 1994-grepet virker ikke som tenkt: `norge-i-fotball-vm-gjennom-historien__medium`
   eier søket med 160 visninger, 0 klikk, pos 11,6 — mens den dedikerte
   `norge-i-vm-1994__lett` bare har 7 visninger (pos 23,9). Tittel, meta,
   svar-blokk og FAQPage-schema er alle live på den store siden.
