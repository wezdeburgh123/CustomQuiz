# CustomQuiz — ny copy for forsiden og arkivet

Forslag, 2. juli 2026. Bygget på tre valg du tok: forsiden skal **lede på «lag din egen»**, alt er **gratis å spille nå** (med lett grense på egen generering), og hovedtittelen er **åpen for nye retninger**.

Stemmen er beholdt slik den er i dag: Fraunces-serif med ett uthevet ord, selvsikker, litt litterær, varm, konkret, ærlig om AI-en. Ingenting av dette er wiret inn ennå — dette er tekst til gjennomlesning. Si fra hvilken hovedtittel du lander på, så legger jeg alt inn i `index.html` og `arkiv.html` for deg.

---

## 1. Helhets-diagnose (kort)

**Det som funker og bør stå igjen**
- Stemmen. «Du vet mindre enn du tror. Heldigvis.» og «Tigerbyens baksider» viser at produktet har en redaksjonell tone de fleste quiz-sider mangler. Den er verdt å beskytte.
- Konkretheten. «Japansk matkultur», «Romerrikets fall», «kompisen som påstår han kan alt om Premier League» — dette selger bedre enn adjektiver.
- Ærligheten i «Slik lager vi spørsmålene». Det bygger tillit og skiller deg fra AI-slop.

**Det som skurrer i helheten**
1. **Selvmotsigelsen gratis vs. betalt.** Forsiden lover «alt er gratis akkurat nå … hele arkivet … åpne for alle». Arkivet kjører fortsatt full premium-innramming: «Lås opp *hele* arkivet», «Denne ligger *bak* abonnement», låste kort, betalingsmodal. En bruker som går fra forside til arkiv møter to ulike løfter. Dette er den viktigste tingen å rydde i.
2. **Generatoren er begravd.** Det som gjør produktet «Custom» — at du kan skrive hva som helst og få en quiz — ligger som en liten blokk midt på siden. Hero-en handler om dagens quiz som selvhjelp. Vi snur dette: generatoren blir helten.
3. **VM-teksten er datert.** «Avspark 11. juni» står fortsatt i preteritum-fella — i dag er vi i sluttspillet. (Se åpne flagg nederst.)
4. **«Starten på løsningen»** rammer inn kunnskap som et problem å kurere. Litt selvhjelps-aktig. Vi bytter til nysgjerrighet og lyst, ikke mangel.

---

## 2. FORSIDEN

### 2.1 Meta / SEO (title + description)

**NÅ**
- Title: `CustomQuiz — daglige quizer på norsk`
- Desc: `Skreddersydde quizer på norsk, generert akkurat nå. Ny quiz hver morgen.`

**NY** (løfter «lag din egen» også i søk)
- Title: `CustomQuiz — lag en quiz om hva som helst, på norsk`
- Desc: `Skriv et tema — få ti norske spørsmål med forklaring på sekundet. Faktasjekket, gratis, og en ny felles quiz hver morgen.`

### 2.2 Hovedtittel — 6 nye retninger

Alle leder på generatoren og friheten. Jeg anbefaler #1: den er aktiv, viser mekanikken (ti spørsmål), og inviterer brukeren til å gjøre noe med én gang.

1. **«Gi oss et tema. Vi gir deg ti spørsmål.»** *(anbefalt)*
   Konkret, aktiv, viser hva som skjer. Fungerer som en invitasjon rett over søkefeltet/temavelgeren.
2. **«Skriv hva som helst. Få en quiz om det.»**
   Punchy og direkte. Litt mer generisk enn #1.
3. **«Det finnes ikke et tema vi ikke lager quiz om.»**
   Frekk, leken utfordring. Passer merkevaren — men litt lengre.
4. **«Din quiz. Ditt tema. På sekundet.»**
   Rytmisk og premium. Mindre nysgjerrighet, mer produktløfte.
5. **«Nevn noe. Hva som helst. Så finnes quizen.»**
   Samtalepreget og innbydende.
6. **«Fra Romerrikets fall til japansk matkultur — på sekundet.»**
   Viser spennvidden gjennom eksempler i stedet for å påstå den.

**Behold gjerne den gamle som en «nese»/eyebrow.** «Du vet mindre enn du tror. Heldigvis.» er for god til å pensjonere helt — den kan leve som en liten kicker over eller under hovedtittelen, eller flyttes ned til dagens-quiz-blokken der «selvhjelps»-vinkelen faktisk passer.

### 2.3 Ingress (under hovedtittelen)

**NÅ**
> En quiz om dagen er starten på løsningen. Velg blant tolv kuraterte tema — eller skriv ditt eget, fra norsk historie til japansk matkultur. Ta den alene, eller sammen med venner rundt bordet.

**NY** (paret med hovedtittel #1)
> Skriv et tema — norsk historie, japansk matkultur, Romerrikets fall — og få ti spørsmål med forklaring på sekundet. På norsk, faktasjekket, klart til å deles rundt bordet. Eller ta dagens felles quiz. Alt er gratis akkurat nå.

- Primærknapp: **Lag din egen quiz →** (til `lag-quiz.html`)
- Sekundærlenke: **eller ta dagens →** (til dagens)

*Tips: vurder å døpe nav-punktet «Generator» om til «Lag din egen» — det er mer et løfte enn et verktøynavn.*

### 2.4 «Nettopp laget»-beltet (flytt opp, rett under hero)

Dette er ticker-en dere allerede har («Sist genererte tema»: Romerrikets fall, Japansk matkultur …). Når generatoren er helten, er dette den beste sosiale beviset dere har. Flytt det høyt.

**NÅ:** «Slik gjør andre» / «Sist genererte tema»

**NY**
- Tittel: **Nettopp laget av andre**
- Undertekst: **Ekte temaer folk har skrevet inn i dag. Trykk på ett — eller skriv ditt eget.**

### 2.5 «Slik funker det» (snu til generator-først flyt)

**NÅ:** Velg et tema / Få quizen din / Hold streaken / Best sammen

**NY** — tre steg som speiler generatoren, pluss «best sammen»:

1. **Skriv temaet** — Hva som helst. Ferdig forslag, eller helt fritt. Du styrer nivå og antall spørsmål.
2. **Få quizen** — Ti norske spørsmål med kort forklaring, generert på sekundet.
3. **Del og kjemp** — Send til gjengen og se hvem som egentlig kan mest.

**Best sammen** (behold som avsluttende linje/kort)
> Kjør en runde med gjengen rundt bordet — eller utfordre kompisen som påstår han kan alt om Premier League.

### 2.6 Dagens quiz-belte (nå sekundært, men tydelig)

Her hører selvhjelps-/vane-vinkelen hjemme.

- Tittel: **Og en ny *felles* quiz hver morgen**
- Undertekst: **Kl 07:00: ti spørsmål hele Norge spiller samme dag. Mandag historie, tirsdag vitenskap, onsdag geografi — og slik videre. Søndag er blandet og litt vanskeligere. Bygg streaken.**
- Knapp: **Ta dagens quiz →**

### 2.7 Generator-blokken (kan trimmes siden hero nå gjør jobben)

**NÅ**
> Tema-velger, nivåkontroll, antall spørsmål. Skriv «japansk matkultur» eller «Romerrikets fall» — og den genereres på flekken.

**NY** (kortere, siden budskapet er flyttet opp — dette blir en påminnelse med selve verktøyet)
> Temavelger, nivå og antall spørsmål — eller bare skriv det inn. Logg inn med e-post (gratis) for å lage dine egne. Et par om dagen på huset.

*(Se åpne flagg: den nøyaktige grensen — 2 eller 3 per dag — ligger i dvale i koden nå. Teksten «et par om dagen» stemmer enten den står av eller på.)*

### 2.8 «Slik lager vi spørsmålene» (behold — lett puss)

Denne er sterk. Kun én mikrojustering for flyt:

**NÅ:** «… og krever fire svaralternativer hvor distraktorene skal være like plausible som det riktige.»
**NY:** «… og krever fire svaralternativer der de gale skal være like fristende som det riktige.» *(«distraktorer» er fagord — «de gale» er varmere for et allment publikum. Behold gjerne «distraktorer» i FAQ-en lenger ned, der tonen er mer teknisk.)*

### 2.9 FAQ — «Koster det noe?» (rett så den stemmer med grensen)

**NÅ**
> Nei — alt er gratis akkurat nå. Dagens quiz, hele arkivet og VM-quizene er åpne for alle. Vil du lage dine egne tema-quizer, logger du inn med e-post (også gratis) og kan lage et par om dagen.

**NY** (samme løfte, men grensen er tydelig fra start så ingen føler seg lurt)
> Å spille koster ingenting akkurat nå — dagens quiz, hele arkivet og VM-quizene er åpne for alle. Vil du lage dine egne, logger du inn med e-post (også gratis) og lager et par nye om dagen. Mer enn nok til å utfordre gjengen.

Resten av FAQ-en (hvor spørsmålene kommer fra, personvern/EU, tidspunkt, egne tema) er god og bør stå.

---

## 3. ARKIVET

Hovedgrepet: **fjern paywall-fortellingen** så arkivet forteller samme historie som forsiden — «alt er åpent nå». Premium-modalen og låst-logikken kan ligge i koden i dvale (som generator-grensen), men *teksten og de synlige låste kortene* må vekk nå.

### 3.1 Meta / SEO

**NÅ**
- Title: `Arkivet — CustomQuiz`
- Desc: `Alle quizer på CustomQuiz. Filtrer etter tema, sorter etter popularitet eller dato, finn neste favoritt.`

**NY** (ok som er — liten friskning)
- Title: `Arkivet — alle quizene på CustomQuiz`
- Desc: `Alt vi og fellesskapet har publisert. Søk, filtrer på tema, sorter på populært eller nytt. Alt åpent akkurat nå.`

### 3.2 H1 + ingress

**H1 (behold — den er god):** Alle utgaver, *ett sted.*

**Ingress — NÅ**
> Bla i alt CustomQuiz har publisert. Filtrer etter tema, sorter etter popularitet eller dato. Med gratis konto spiller du gratis-utvalget — se etter «Gratis»-merket. Abonnenter får tilgang til hele arkivet.

**Ingress — NY** (samme løfte som forsiden)
> Alt vi har publisert — og alt fellesskapet har laget. Søk på tittel, tema eller stikkord, filtrer på kategori, sorter på populært eller nyest. Alt er åpent akkurat nå: bare velg en og spill.

- Søkefelt-placeholder (behold): `Søk i alle utgaver — tittel, tema, stikkord…`

### 3.3 Premium-beltet → gjør det om til en «lag din egen»-invitasjon

**NÅ** (fjernes)
> **Abonnement** · Lås opp *hele* arkivet. … [Se abonnementsalternativer]

**NY** (samme plass, men konverterer til generator + daglig i stedet for betaling)
- Eyebrow: **Fikk du ikke nok?**
- Tittel: **Finner du ikke temaet? *Lag det.***
- Tekst: **Skriv inn hva du vil ha quiz om, så genereres den på sekundet — og havner her, synlig for alle. Eller få en ny felles quiz rett i innboksen hver morgen.**
- Knapp 1: **Lag din egen →** (til `lag-quiz.html`)
- Knapp 2: **Få dagens på e-post →**

### 3.4 Låste kort / «bak abonnement» (fjern innrammingen)

**NÅ:** kort med `locked: true`, dimmet bilde, og modalen «Denne ligger *bak* abonnement.»

**NY:** ingen låser mens alt er gratis. To alternativer, avhengig av hva som er sant om dataene:
- Har quizene bak låsen en ekte spillbar URL → lås dem opp, vis som vanlige kort.
- Er de fortsatt plassholdere uten URL (`url: null`) → **skjul dem** til de har innhold, i stedet for å vise en lås. En synlig lås som ikke fører til betaling *eller* innhold er verre enn ingen kort. (Se åpne flagg.)

### 3.5 Barne-/fellesskaps-seksjonene (behold — små pusser)

**«Laget av fellesskapet» — NÅ**
> Quizer folk lager lagres og blir synlige for alle her — automatisk sjekket før publisering. Vil du fjerne en du har laget, eller ser du noe som ikke hører hjemme? Trykk «Rapportér», så skjules den til vi har vurdert den.

Denne er bra og ærlig. Behold. (Kun hvis dere vil: «automatisk sjekket» → «automatisk sjekket for feil og upassende innhold» gir litt mer trygghet.)

**Barne-seksjonen — behold:**
> Egen verden for de yngste — enkle, morsomme og faktasjekkede utgaver.

### 3.6 Tomme- og laster-tilstander (små, men synlige)

Rett disse så de matcher «alt åpent»-tonen og aldri nevner abonnement:
- Ingen søketreff: **Fant ingenting på «{søk}». Prøv et bredere ord — eller lag quizen selv.** (+ lenke til generator)
- Laster: **Henter arkivet …**
- Feil: **Klarte ikke å laste arkivet akkurat nå. Last siden på nytt, så prøver vi igjen.**

---

## 4. Hva jeg IKKE rørte, og hvorfor

- **Kategorilisten, «Slik lager vi spørsmålene», personvern-FAQ, barne-seksjonen** — sterke som de er. Endring her ville vært å pusse for pussingens skyld.
- **Grunnstemmen og Fraunces-uthevingen** — bevisst beholdt. Målet var å skru posisjoneringen (generator > dagens) og fjerne selvmotsigelsen, ikke å bygge en ny merkevare.
- **Selve paywall-koden** — jeg foreslår kun å fjerne den *synlige* teksten/låsene. Logikken kan ligge i dvale som generator-grensen, klar til å skrus på når Vipps/org.nr er på plass.

## 5. Åpne beslutninger til deg

1. **Hovedtittel:** hvilken av de seks (jeg anbefaler #1)? Eller behold «Du vet mindre …» som kicker over den?
2. **VM-beltet er datert** («Avspark 11. juni» — vi er i sluttspillet nå 2. juli). Vil du at jeg (a) oppdaterer til nøytral sluttspill-tekst, (b) toner det ned, eller (c) lar det ligge? Jeg kan grunne det mot faktisk kampstatus før jeg skriver.
3. **Låste plassholder-quizer i arkivet** (Romerrikets fall, Den franske revolusjon m.fl. med `url: null`): finnes de som ekte spillbare quizer nå? Hvis ja → lås opp. Hvis nei → skjul til de har innhold.
4. **Generator-grensen:** skal «et par om dagen» stå selv om grensen er i dvale nå? Jeg holdt teksten myk med vilje så den stemmer uansett.

Si fra, så wire jeg valgt hovedtittel + all copy over i `index.html` og `arkiv.html`.
