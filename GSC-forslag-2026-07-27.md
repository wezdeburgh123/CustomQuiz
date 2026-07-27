# GSC-forslag customquiz.no — 27. juli 2026 (siste 28 dager, 27/6–24/7)

Kilde: Google Search Console, sc-domain:customquiz.no. 226 queries, 358 sider med visninger. Data hentet på nytt via nettleser (bekreftet, ikke gjenbruk).

> **Viktigste endring denne runden:** 4 av 6 forslag fra forrige rutine (25/7) er nå **produsert og publisert** — de ligger i `quiz/`-mappa. Backloggen har altså beveget seg. Det som gjenstår som ekte dekningsgap er nå tynt; hovedgrepet fremover er **optimalisering av eksisterende (og nypubliserte) sider**, ikke mengder nye quizer.

## (a) Ukens nøkkeltall

| Måltall | Nå (27/6–24/7) | 27/7-fil (samme vindu) | 25/7 (25/6–22/7) | Endring vs 25/7 |
|---|---|---|---|---|
| Klikk | 97 | 97 | 99 | −2 |
| Visninger | 3 280 | 3 280 | 3 520 | −240 |
| CTR | 3,0 % | 3,0 % | 2,8 % | +0,2 pp |
| Snittposisjon | 13,8 | 13,8 | 13,7 | ≈ flat |
| Antall queries | 226 | 226 | 228 | −2 |

Stabilt, svakt fallende visningsvolum. Vinduet er så godt som identisk med forrige kjøring, så tallbildet er uendret. Trafikken bæres fortsatt av VM-fotball: **«hvor langt kom norge i vm 1994»** alene = 795 visn. / 3 klikk (pos 10,9) — fremdeles den enkeltstående største muligheten på hele nettstedet.

**Topp klikk-sider (28 d):** /vm (3 klikk / 138 visn.), fotball-vm-gjennom-tidene__vanskelig (7 / 120), __lett (4 / 75), fotball-vm-2026-alt-du-ma-vite__lett (2 / 46), pokemon-spillet__lett (3 / 31).

**Bevegelse denne uka:**
- *norrøn mytologi quiz* holder 3 klikk (pos 9,2) — topp-tre klikker.
- *pokémon quiz norsk* 3 klikk (pos 5,1) — sterk.
- *quiz leonardo da vinci* konverterer (1 klikk / pos 1,0) — kunst-klyngen lever.
- *dagens quiz* + *dagens quiz gratis* ≈ 34 visn., 0 klikk, pos ~14–16 → merkevare-/feature-søk mot /dagens, optimaliseringssak.

## (b) Status på forrige ukes forslag — 4 av 6 er nå LIVE

| Forslag (25/7) | Slug i `quiz/` | Status |
|---|---|---|
| Verdenshistorie – de store epokene | `verdenshistorie-de-store-epokene__lett/medium/vanskelig` | ✅ Publisert |
| Norske byer | `norske-byer__lett/medium` | ✅ Publisert |
| Berømte malerier og kunstnere | `beromte-malerier-og-kunstnere__lett/medium` | ✅ Publisert |
| Afrikas hovedsteder | `afrikas-hovedsteder__lett/medium/vanskelig` | ✅ Publisert |
| Kroppen for nysgjerrige (lett) | — | ⏳ Ikke laget |
| Verdens elver – og Norges egne | — | ⏳ Ikke laget |

De fire nye rangerer ennå ikke i topp (nypubliserte, GSC viser dem ikke i topp-sider enda) — normalt, de trenger indekserings-/modningstid. Verdt å følge posisjonen deres neste runde.

## (c) Ekte dekningsgap som fortsatt står åpne

- **Kroppen – lett/barnevennlig variant** — *quiz om kroppen* (9, pos 43) + *anatomi quiz med svar* (8, pos 24) + *anatomi quiz* (7, pos 20) + *kroppen quiz* (5, pos 29) ≈ **29 visn.** Vi har `menneskekroppens-anatomi` + `menneskekroppens-organer`, men de er for tunge for den lette/morsomme intensjonen. **Klart sterkeste gjenstående gap.**
- **Verdens/Norges elver (norsk vinkel)** — *verdens lengste elv* (29, pos 22) er dekket globalt av `verdens-lengste-elver`, men den norske vinkelen (*hva heter norges lengste elv*, *norsk geografi quiz*) mangler egen inngang. Mer et supplement enn et stort gap.

**Long-tail (ikke egen quiz nå):**
- *i hvilket land vant brasil sin første vm tittel* (18, pos 11) — evergreen VM-fakta, dekket.
- *roser betydning* (10, pos 27) og *test rotter* (5) / *rotte som kjæledyr* — trolig støy fra enkeltspørsmål, ikke quiztema.
- *mat og drikke quiz* (6+6=12, pos 47–57) — dekket av `mat-og-drikke-fra-hele-verden` + `norske-mattradisjoner`; posisjonssak.
- *quiz allmennkunnskap* / *almennkunnskap quiz* (~17, pos 68–78) — dekket av `blandet-`/`norsk-allmennkunnskap`; posisjonssak.
- *eliteserien quiz* (4, pos 8,8) og *molde kallenavn* (12, pos 8–11) — dekket og rangerer godt.

## (d) Quizforslag — kun forslag, ikke generert

Tynn liste denne uka fordi backloggen i stor grad er levert. Rangert etter visningsvolum × reelt dekningsgap. Christian tar stilling.

1. **Kroppen for nysgjerrige (lett kroppsquiz)** · slug `kroppen-for-nysgjerrige` · kropp · lett
   *quiz om kroppen* (9) + *anatomi quiz med svar* (8) + *anatomi quiz* (7) + *kroppen quiz* (5) ≈ 29 visn. Lettere/morsommere vinkel enn dagens anatomi-serie, mot barn/familie-intensjon. **Høyest prioritet.**

2. **Verdens elver – og Norges egne** · slug `norges-og-verdens-elver` · geografi · lett/medium
   *verdens lengste elv* (29) + norsk elve-vinkel som mangler. Supplerer `verdens-lengste-elver`; kan internlenke.

3. **Norsk geografi – blandet** · slug `norsk-geografi` · geografi · lett/medium
   *geografi quiz verden* (12) + *norsk geografi quiz* — samlende geografi-inngang som kan hubbe byer/fylker/fjell/elver og fange de generiske geografi-søkene (i dag spredt på pos 25–63).

4. **VM-fotball – de store øyeblikkene (samlequiz)** · slug `vm-fotball-store-oyeblikk` · fotball · medium
   *vm quiz* (25) + *vm quiz 2026* (17) + *quiz vm 2026* (8) + *quiz om vm* (7) ≈ 57 visn. Sterkt cluster; vi har mange VM-quizer men en bred «VM-quiz»-inngang kan fange det generiske *vm quiz* og internlenke resten. (Vurder om `/vm`-siden alt dekker dette — da er det optimalisering, ikke ny quiz.)

*(Under 4 solide forslag i uka fordi de øvrige klyngene enten er levert eller er posisjonssaker. Ikke tvunget fram flere for å nå «5–10».)*

## (e) Sideoptimalisering (ikke nye quizer) — størst løftepotensial

Sidene som allerede rangerer men ikke får klikk — dette er der de raske gevinstene ligger nå:

- **hvor langt kom norge i vm 1994** (795 visn., 3 klikk, pos 10,9): tittel/meta + tydelig «svar»-utdrag øverst for featured snippet. Fortsatt den enkeltstående største muligheten på hele nettstedet. Beslektede: *…vm 94* (37), *…fotball vm 1994* (35), *…vm i 1994* (14) — alle pos ~10, samme grep.
- **Hovedsteder-klyngen** (*hovedsteder i verden quiz* 20/pos 45, *hovedstad quiz* 20/67, *quiz hovedsteder* 17/56, *hovedsteder quiz med svar* 14/71): match tittel/H1 mot «hovedsteder quiz med svar», styrk intern lenking. `verdens-hovedsteder__lett` ligger pos 32,7 med 63 visn. / 0 klikk.
- **Fylker** (*norge fylker quiz* 14/pos 25, *norges fylker quiz* 7/29): `norges-fylker-og-byer__lett` = 45 visn. / 0 klikk / pos 36. Samme grep.
- **/dagens** (*dagens quiz* 29 + *dagens quiz gratis* 5, pos ~14–16): merkevaresøk, bør ligge topp 3 — sjekk tittel/indeksering.
- **Følg de 4 nypubliserte** (verdenshistorie, norske byer, berømte malerier, afrikas hovedsteder): sjekk at de er indeksert og internlenket, så de begynner å hente sine respektive klynger (*quiz verdenshistorie* 11, *byer i norge rebus* 16, *kunst quiz*, afrika-hovedsteder).

---
*Kjørt automatisk (ukentlig SEO-rutine, 27.7.26). Data hentet på nytt fra GSC samme dag; erstatter tidligere 27/7-fil med oppdatert status (4 forslag nå live). Produktnavn: Allmennkunnskap (dobbel l, dobbel n). Ingen quizer er generert eller publisert — dette er forslag.*
