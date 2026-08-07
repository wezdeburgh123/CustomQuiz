# Synlighetsplan CustomQuiz — SoMe og alt annet

Skrevet 7. august 2026, basert på alt som ble målt og verifisert i statussjekken
6.–7. august. Ikke en idémyldring — hvert grep peker på et tall.

---

## Diagnosen først, for den endrer hva planen bør være

Du har **to funneler som ikke snakker sammen**, og du har brukt mest energi på
den svakeste.

**Søkefunnelen:** 103 klikk på 28 dager → 409 quizsider → **0 registreringer på
fem uker**. Sidene som får all søketrafikken er blindveier: de har ingen
del-knapp, ingen utfordre-en-venn, ingen grunn til å komme tilbake. Eneste
utgang er «▶ Spill quizen».

**Den sosiale funnelen:** brukerlagde quizer spilles **5,2 ganger hver**, mot 1,4
for de nattgenererte. Det er 3,7× bedre per quiz. Og se hvilke som topper lista:
Dinamo-reklamebyrå, Igorrr, Brønnøysund, Tromsø, Vassendgutane, pop-bandet Zuma.
Lokalt, personlig, nisje. Ting folk deler med noen som *bryr seg om nettopp det*.

**Og det ene som faktisk skapte registreringer:** 11. juni, VM-åpningen — 7
registreringer på én dag. Fordi det fantes en levende begivenhet, en liga å være
med i, og en frist.

Konklusjonen jeg vil trekke: **søk gir deg besøkende, men bare det sosiale gir
deg brukere.** Og søkemaskineriet er allerede automatisert (ukentlig GSC-rutine +
nattskift) — det trenger ikke din oppmerksomhet. Det sosiale finnes nesten ikke
ennå.

Én ting til, som er verdt å si rett ut: **du har ingen SoMe-tilstedeværelse i
dag.** Ingen Instagram, ingen Facebook, ingen TikTok — jeg søkte gjennom hele
repoet. Det er ikke et problem, det er utgangspunktet. Men det betyr at «bedre
SoMe» ikke er å forbedre noe; det er å velge én kanal og gjøre den ordentlig.

---

## Fase 0 — Tett lekkasjen før du heller inn mer vann

Dette er billigst, raskest, og har størst effekt. Alt handler om de 409
quizsidene der søketrafikken lander.

**0.1 Legg utfordre-mekanikken på quizsidene.**
`?utfordring=`-lenken («slå min score») finnes allerede — men bare i
`lag-quiz.html` og `dagens.html`. Den er altså *ikke* der de fremmede kommer inn.
Etter fullført quiz på en arkivquiz bør det stå «Du fikk 8/10 — utfordre en venn»
med ferdig lenke. Dette er den eneste virale primitiven du har, og den står
parkert.

**0.2 Legg del-knapp på quizsidene.**
Tema-hubbene og lag-hubbene har `navigator.share`. De 409 quizsidene har
**ingen**. Det er bakvendt: quizsidene er det folk faktisk vil dele.

**0.3 Gjør «lag din egen» kontekstuell.**
Sidene har en generisk «lag din egen quiz»-lenke. Gjør den spesifikk: på
norrøn-mytologi-siden bør det stå «Lag din egen quiz om norrøn mytologi» med
temaet forhåndsutfylt. Du konverterer en passiv spiller til en *skaper* — og
skapte quizer er de som spilles 3,7× mer.

**0.4 ✅ Gjort 7.8:** «Spill quizen»-lenken pekte på `/lag-quiz.html?lib=…`, som
etter 301-fiksen i går ble et unødvendig redirect-hopp på den primære CTA-en på
alle 409 sider. Rettet i `build-quiz-pages.mjs`.

**0.5 Fyll de 195 manglende coverne.**
45 % av arkivet mangler `hero_img`. Det er ikke kosmetikk — det er
delbarhet. Uten cover faller OG-previewet tilbake til et generisk kategoribilde,
så en delt lenke ser lik ut for 195 forskjellige quizer. Du har allerede
maskineriet (`quiz-cover-background`, OpenAI gpt-image-1).

---

## Fase 1 — Én SoMe-kanal, valgt ut fra hva som funker

Ikke start fire kontoer. Dataene peker ganske tydelig på hvor du hører hjemme.

**Anbefaling: Facebook-grupper, ikke en Facebook-side.**

Begrunnelsen ligger i hvilke quizer som spilles. «Lokalhistorien til hjembyen min
Brønnøysund» og «Tromsø trivia» og «Vassendgutane» treffer folk som allerede
sitter samlet i norske lokal- og interessegrupper på Facebook. Der finnes
publikummet ferdig samlet — du trenger ingen følgerbase, ingen algoritme, ingen
daglig produksjon. En quiz om Brønnøysund postet i «Brønnøysund før og nå» er
relevant på en måte ingen Instagram-post om allmennkunnskap kan bli.

Og du har allerede infrastrukturen: `og-quiz`-edge-funksjonen gir hver delt
`?lib=`-lenke sin egen tittel, beskrivelse og bilde i previewet. Den investeringen
er gjort og underbrukt.

**Praktisk:** lag én lokalquiz per uke for en norsk by eller et nisjetema, post i
2–3 relevante grupper der det er tillatt, mål plays per quiz. Det er en test som
koster en time i uka og som gir svar innen en måned.

**Hvorfor ikke Instagram/TikTok nå:** de krever jevn original produksjon av
visuelt innhold. Du er én person med en jobb. Med 32 brukere er
kanal-oppbygging fra null feil rekkefølge — du bør bevise delingsløkken først.

---

## Fase 2 — Begivenheter, fordi VM beviste at det virker

VM ga deg den eneste registreringstoppen du har hatt. Ingrediensene var: **levende
begivenhet + liga + frist.** Den oppskriften kan gjenbrukes, og den norske
kalenderen har flere anledninger.

Nærmeste store, og etter min mening den beste: **julekalender-quiz.**
24 luker, én quiz per dag, med poengsum som samler seg. Den har alt VM hadde —
frist, daglig grunn til å komme tilbake, naturlig å konkurrere med familien — og
den er sesongmessig gullkantet for deling. Du har ~4 måneder, som er nok til å
bygge det ordentlig i stedet for i panikk. Ligamekanikken finnes fra VM (`leagues`,
`league_members`).

Andre anledninger, i kalenderrekkefølge: skisesongen og Ski-VM (nov–mars),
MGP/Eurovision (feb–mai), 17. mai, Eliteserien-start. Fotball er dessuten
allerede din største kategori (118 quizer) og de 16 klubb-hubbene ligger klare.

---

## Fase 3 — Annen synlighet enn SoMe

**Tema-hubbene er din mest underutnyttede SEO-ressurs.** 16 sider, alle i
sitemap, alle tynne lister i dag. De kan rangere på kategoriord («geografi quiz»,
14 visn., «hovedstad quiz»-klyngen ~75 visn. som venter på posisjonsløft, ikke nytt
innhold). Gi dem ingress med søkeord, «mest spilte i denne kategorien», og dagens
utgave i kategorien. Se `ARKIV-IA-replan.md` + `arkiv-mockup-ny.html` fra 23. juni
— den skisserer dette og ble aldri kodet.

**Hovedsteder og fylker: posisjonssak, ikke innholdssak.** ~97 visninger til
sammen på klynger der du *har* innhold som rangerer på plass 30–70. Match
tittel/H1 mot «hovedsteder quiz med svar» og internlenk fra kontinent-quizene.
Billigere enn å lage noe nytt.

**E-post er ikke en kanal ennå.** Brevo er satt opp med 5 maler, men daglig
utsendelse er avskrudd og du har 32 brukere. Det blir en kanal når Fase 0 og 1
har skaffet folk — ikke før.

**Innholdskøen:** tom igjen etter at nattskiftet tok alle 7 GSC-emnene i går.
Se eget avsnitt under.

---

## Hva jeg vil advare mot

**Ikke bygg mer innholdsvolum som første grep.** Du har 444 quizer, 102 av dem er
aldri spilt, og 195 mangler cover. Å legge quiz nummer 445 i et arkiv med 23 %
ubrukt lager løser ikke at sidene er blindveier. Fase 0 først.

**Og en usikkerhet jeg ikke kan fjerne:** `page_views` har bare 78 rader siden
telleren ble bygget 15. juli. Enten er den menneskelige trafikken nesten null,
eller telleren måler ikke det du tror. Det bør avklares før du bruker den til å
måle om noe av dette virker — ellers styrer du etter et instrument du ikke har
kalibrert.

---

## Rekkefølge, hvis jeg skulle valgt

1. **Fase 0.1 + 0.2** — utfordre + del på quizsidene. Dette er hele poenget.
2. **Fase 0.3** — kontekstuell «lag din egen».
3. **Sjekk `page_views`** — du trenger et måleinstrument som virker.
4. **Fase 1** — én lokalquiz i uka i Facebook-grupper, mål i fire uker.
5. **Fase 0.5** — cover-backfill.
6. **Fase 2** — begynn på julekalenderen i oktober.

Fase 3 kan gå parallelt, fordi den i stor grad er automatisert alt.

---
*Skrevet 7. august 2026. Alle tall er målt 6.–7. august mot Supabase, Google
Search Console, Netlify og live HTML — ikke hentet fra tidligere logger.*
