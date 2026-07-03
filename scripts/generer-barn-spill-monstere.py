#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genererer to nye barneserier (Spill = videospill, Monstere = popkultur-monstre)
som KLAR-FOR-ARKIV.ndjson + en lesbar DRAFT.md, i samme format som dyr-serien.

Innebygd kvalitetssikring:
  - riktig svar plasseres på en DETERMINISTISK varierende posisjon (seedet på
    slug+spm-nr), slik at fasit ikke alltid er alternativ A.
  - validerer: 6 quizer per serie, 10 spm hver, 4 alternativer hver, fasit i [0,3],
    unike slugs.

Kjør fra prosjektmappa:  python3 scripts/generer-barn-spill-monstere.py
"""
import json, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT  = os.path.join(ROOT, "quiz-library")

# Hver quiz: (slug-stamme, kort-kategorinavn, tittel, lede, [10 x (q, riktig, [3 gale], forklaring)])
SPILL = [
("minecraft", "Minecraft", "Minecraft — grav, bygg og overlev!",
 "Bygg nesten hva som helst av blokker — men pass deg for creeperen! Test deg på Minecraft.", [
  ("Hva gjør du mest av i Minecraft?", "Bygger og graver med blokker", ["Kjører rallybil", "Spiller fotball", "Lager mat på ekte"],
   "I Minecraft bryter du blokker og bygger nesten hva som helst av dem."),
  ("Hvilken grønn skapning sniker seg innpå deg og eksploderer?", "Creeperen", ["Kua", "Sauen", "Delfinen"],
   "Creeperen er nesten lydløs og eksploderer hvis den kommer for nær — pass deg!"),
  ("Hvilket selskap lager Minecraft?", "Mojang", ["Sega", "Rovio", "Epic Games"],
   "Minecraft lages av Mojang og kom i full versjon i 2011."),
  ("Hva kalles det å sette sammen materialer for å lage verktøy og ting?", "Å crafte", ["Å sove", "Å danse", "Å rope"],
   "Du «crafter» — setter sammen materialer i et rutenett — for å lage verktøy, våpen og blokker."),
  ("Hva skjer hvis du ikke lager lys eller ly når natten kommer?", "Monstre som zombier dukker opp", ["Det regner sjokolade", "Spillet slutter", "Du vinner straks"],
   "Om natten kommer fiender som zombier og skjeletter — derfor bygger spillere seg et trygt hus."),
  ("Hvilken form har nesten alle tingene i Minecraft?", "Firkantet, som kuber", ["Runde som baller", "Stjerneformet", "Trekantet"],
   "Nesten alt i Minecraft er bygget av firkantede blokker — det er hele stilen."),
  ("Hva kan du IKKE gjøre i «kreativ modus»?", "Dø av sult eller fiender", ["Fly", "Bygge fritt", "Ha uendelig med blokker"],
   "I kreativ modus kan du fly og bygge fritt uten å dø — perfekt for store byggverk."),
  ("Hvilket fredelig dyr i Minecraft kan du melke?", "Kua", ["Creeperen", "Edderkoppen", "Zombien"],
   "Kua gir både melk og mat, og er et fredelig dyr i spillet."),
  ("Hva heter verdenen der du møter den store Enderdragen?", "The End", ["Stranden", "Solen", "Kjøkkenet"],
   "«The End» er en egen verden der du møter Enderdragen — den store sjefen i spillet."),
  ("Hvorfor liker mange å spille Minecraft sammen med venner?", "De kan bygge og utforske sammen", ["Man er nødt til det", "Det gir ekte penger", "Det er forbudt alene"],
   "Minecraft har en flerspillermodus der venner bygger, graver og overlever sammen."),
 ]),
("super-mario", "Super Mario", "Super Mario — rørleggeren som hopper høyest",
 "Hopp på sopp, redd prinsessen og pass deg for Bowser! Test deg på Mario.", [
  ("Hva jobber Mario egentlig som?", "Rørlegger", ["Lege", "Lærer", "Pilot"],
   "Mario er rørlegger — derfor er han ofte nede i rør i spillene."),
  ("Hva heter Marios bror i grønn kjeledress?", "Luigi", ["Bowser", "Yoshi", "Toad"],
   "Luigi er Marios litt høyere og grønnkledde bror."),
  ("Hvem er den piggete skilpaddekongen som er Marios erkefiende?", "Bowser", ["Sonic", "Kirby", "Donkey Kong"],
   "Bowser er den piggete skilpaddekongen som stadig kidnapper prinsessen."),
  ("Hvilken prinsesse prøver Mario som regel å redde?", "Prinsesse Peach", ["Prinsesse Elsa", "Prinsesse Zelda", "Prinsesse Leia"],
   "Mario redder oftest prinsesse Peach fra Bowser."),
  ("Hva skjer når Mario spiser en super-sopp?", "Han vokser seg større", ["Han blir usynlig", "Han sovner", "Han krymper"],
   "Super-soppen gjør lille Mario til store Mario, så han tåler ett treff til."),
  ("Hva heter den grønne dinosauren Mario kan ri på?", "Yoshi", ["Toad", "Goomba", "Koopa"],
   "Yoshi er den snille dinosauren som kan sluke fiender med tungen."),
  ("Hvilket selskap lager Super Mario-spillene?", "Nintendo", ["Sony", "Microsoft", "Apple"],
   "Nintendo lager Mario, og den store «Super Mario Bros.» kom i 1985."),
  ("Hva gjør Mario for å beseire de fleste fiendene?", "Hopper på dem", ["Synger for dem", "Gir dem mat", "Kaster snøball"],
   "Marios viktigste triks er å hoppe rett på fiender som goomba-soppene."),
  ("Hva samler Mario som gir poeng og ekstra liv?", "Gullmynter", ["Steiner", "Blader", "Knapper"],
   "Gullmyntene gir poeng, og 100 mynter gir ofte et ekstra liv."),
  ("Hvorfor er Mario en av verdens mest kjente spillfigurer?", "Han har vært med i spill i mange tiår", ["Han er helt ny", "Han finnes bare i Norge", "Han er en ekte person"],
   "Mario har vært en stjerne siden 1980-tallet og er kjent over hele verden."),
 ]),
("pokemon-spillet", "Pokémon-spillet", "Pokémon — fang dem alle!",
 "Bli trener, kast en Poké Ball og bygg ditt eget lag. Test deg på Pokémon!", [
  ("Hva betyr egentlig navnet «Pokémon»?", "Pocket Monsters — lommemonstre", ["Power Money", "Polar Moon", "Pretty Monkeys"],
   "Pokémon er kort for «Pocket Monsters» — altså lommemonstre."),
  ("Hva kaster du for å fange en Pokémon?", "En Poké Ball", ["En fotball", "En stein", "Et fiskenett"],
   "Du svekker en vill Pokémon og kaster en Poké Ball for å fange den."),
  ("Hva heter den gule, mest kjente Pokémonen?", "Pikachu", ["Bowser", "Sonic", "Kirby"],
   "Pikachu er en elektrisk mus og selve maskoten for Pokémon."),
  ("Hvilken type er Pikachu?", "Elektrisk", ["Vann", "Is", "Stein"],
   "Pikachu er en elektrisk-type og lagrer strøm i de røde kinnene sine."),
  ("Hva er målet for en Pokémon-trener?", "Å fange og trene mange Pokémon", ["Å bake kaker", "Å bygge hus", "Å kjøre rally"],
   "Som trener fanger du Pokémon, trener dem og blir sterkere."),
  ("Hva skjer når mange Pokémon blir sterke nok?", "De «utvikler seg» til en ny form", ["De forsvinner", "De blir til mynter", "De sovner for alltid"],
   "Mange Pokémon utvikler seg (evolverer) til en større og sterkere form."),
  ("Hvilket selskap ga ut det første Pokémon-spillet?", "Nintendo", ["Sega", "Sony", "Mojang"],
   "Det første Pokémon-spillet kom i 1996, laget av Game Freak og gitt ut av Nintendo."),
  ("Hva slags skapning ligner den ild-sprutende Charizard på?", "En drage", ["En katt", "En fisk", "En sau"],
   "Charizard er en populær drage-lignende Pokémon som puster ild."),
  ("Hva gjør Pokémon mot hverandre i en kamp?", "Bruker spesielle angrep og krefter", ["Spiller kort", "Løper om kapp", "Synger duett"],
   "I kamp bruker hver Pokémon angrep og krefter — og noen typer er sterke mot andre."),
  ("Hva betyr «Gotta catch 'em all»?", "At man prøver å samle alle Pokémon", ["At man må sove", "At det er en matrett", "At det betyr farvel"],
   "«Gotta catch 'em all» betyr «fang dem alle» — du prøver å samle så mange arter som mulig."),
 ]),
("roblox", "Roblox", "Roblox — lag og spill dine egne verdener",
 "Millioner av spill laget av spillerne selv. Hvor godt kjenner du Roblox?", [
  ("Hva er spesielt med Roblox?", "Spillerne lager selv spillene", ["Det finnes bare ett spill", "Du må være voksen", "Det virker bare på TV"],
   "Roblox er en plattform der brukere lager sine egne spill som andre kan spille."),
  ("Hva heter pengene man bruker inni Roblox?", "Robux", ["Euro", "Gullmynter", "Poeng"],
   "Robux er valutaen i Roblox, og brukes til klær og ting til figuren din."),
  ("Hva kaller man figuren din i Roblox?", "En avatar", ["En robot", "En sjef", "En lærer"],
   "Avataren er deg i spillet — du kan pynte den med klær og utstyr."),
  ("Hvordan ser Roblox-figurene typisk ut?", "Litt klossete, som byggeklosser", ["Helt ekte", "Som dyr", "Som biler"],
   "Roblox-figurene har en gjenkjennelig klossete stil som minner om byggeklosser."),
  ("Omtrent hvor mange ulike spill finnes i Roblox?", "Millioner, laget av brukere", ["Bare tre", "Akkurat ti", "Ingen"],
   "Det finnes millioner av spill i Roblox fordi hvem som helst kan lage sine egne."),
  ("Hva kan du gjøre om du lærer «Roblox Studio»?", "Lage ditt eget spill", ["Bare se på", "Slå av strømmen", "Spise pizza"],
   "Roblox Studio er verktøyet der du selv kan bygge og lage spill."),
  ("Koster det penger å begynne å spille Roblox?", "Nei, det er gratis å starte", ["Ja, alltid", "Bare i Norge", "Bare om sommeren"],
   "Roblox er gratis å starte, men noen ting kan kjøpes med Robux."),
  ("Hva er en god regel når du spiller med fremmede på nett?", "Ikke del personlig info", ["Gi bort passordet", "Møt dem alene", "Si hvor du bor"],
   "På nett bør du aldri dele personlig informasjon eller passord med fremmede."),
  ("Kan du spille Roblox sammen med venner?", "Ja, mange spill er for flere", ["Nei, aldri", "Bare på papir", "Bare på TV"],
   "Mange Roblox-spill lar deg spille sammen med venner samtidig."),
  ("Hva er Roblox mest av alt?", "En plattform full av spill laget av folk", ["En film", "En sjokolade", "Et brettspill"],
   "Roblox er en plattform — et sted — fullt av spill laget av spillerne selv."),
 ]),
("fortnite", "Fortnite", "Fortnite — den siste som står igjen",
 "100 spillere, én vinner og masse dansing. Test deg på Fortnite!", [
  ("Hvor mange spillere er typisk med i en Battle Royale-runde?", "Rundt 100", ["Rundt 5", "Akkurat 2", "Over en million samtidig"],
   "I Battle Royale starter rundt 100 spillere, og målet er å bli den siste som står igjen."),
  ("Hva kalles det å vinne en runde i Fortnite?", "Victory Royale", ["Mål", "Sjakkmatt", "Gullmedalje"],
   "Når du er den siste igjen, får du en «Victory Royale»."),
  ("Hva er Fortnite kjent for at spillerne bygger?", "Vegger og ramper", ["Sandslott", "Snømenn", "Kaker"],
   "Spillere kan raskt bygge vegger og ramper av materialer for å beskytte seg."),
  ("Hvilket selskap lager Fortnite?", "Epic Games", ["Nintendo", "Sega", "Mojang"],
   "Fortnite lages av Epic Games, og Battle Royale-modusen kom i 2017."),
  ("Hva kalles de morsomme dansene figurene gjør?", "Emotes", ["Lekser", "Mål", "Regler"],
   "«Emotes» er dansene og bevegelsene figurene kan gjøre i spillet."),
  ("Hvordan kommer spillerne ned til kartet i starten?", "De hopper ut av en flygende buss", ["De kjører bil", "De svømmer", "De graver"],
   "Alle hopper ut av «Battle Bus» (kampbussen) og glir ned til øya."),
  ("Hva skjer med det trygge området utover i runden?", "Det krymper («stormen» lukker seg)", ["Det vokser", "Det blir borte med en gang", "Ingenting"],
   "En storm presser spillerne sammen ved å gjøre det trygge området mindre og mindre."),
  ("Hva kalles de ulike utseendene og kostymene til figurene?", "Skins", ["Lekser", "Liv", "Poeng"],
   "«Skins» er de ulike utseendene og kostymene spillerne kan bruke."),
  ("Koster det penger å begynne å spille Fortnite?", "Nei, det er gratis å laste ned", ["Ja, alltid", "Bare på PC", "Bare i helgene"],
   "Fortnite er gratis å starte, men man kan kjøpe skins og ekstra ting."),
  ("Hva er hovedmålet i Battle Royale?", "Å være den siste som står igjen", ["Å score flest mål", "Å bygge høyest", "Å samle flest dyr"],
   "Målet er å overleve lengst — den siste spilleren eller laget vinner."),
 ]),
("spillklassikere", "Spillklassikere", "Spillklassikere — fra Pac-Man til Sonic",
 "De gamle spillheltene som startet alt sammen. Hvor mye kan du?", [
  ("Hva gjør den gule Pac-Man hele tiden?", "Spiser prikker og flykter fra spøkelser", ["Hopper over rør", "Bygger hus", "Kjører bil"],
   "Pac-Man spiser små prikker i en labyrint og prøver å unngå fargede spøkelser."),
  ("Hva heter det blå, superraske pinnsvinet fra Sega?", "Sonic", ["Mario", "Pikachu", "Kirby"],
   "Sonic the Hedgehog er et blått pinnsvin kjent for å løpe utrolig fort."),
  ("Hva faller ned hele tiden i spillet Tetris?", "Klosser i forskjellige former", ["Regn", "Baller", "Stjerner"],
   "I Tetris stabler du fallende klosser så de danner hele linjer som forsvinner."),
  ("Hva samler Sonic mens han løper?", "Gullringer", ["Sopp", "Mynter", "Blader"],
   "Sonic samler gullringer, som også beskytter ham hvis han blir truffet."),
  ("Hva slags figur er den lyserøde helten Kirby?", "En rund skapning som suger inn fiender", ["En bil", "En drage", "En fisk"],
   "Kirby er en rund, rosa skapning som suger inn fiender og kopierer kreftene deres."),
  ("I «Among Us» prøver mannskapet å finne ut hvem som er …?", "Bedrageren (the impostor)", ["Læreren", "Kokken", "Kapteinen"],
   "I Among Us gjør mannskapet oppgaver mens de prøver å avsløre bedrageren blant dem."),
  ("Hva kaster fuglene i «Angry Birds» seg mot?", "Grisene og byggverkene deres", ["Skyer", "Fisk", "Biler"],
   "I Angry Birds skyter du fugler med en sprettert mot grisenes vaklevorne byggverk."),
  ("Hva heter helten i «The Legend of Zelda»?", "Link", ["Mario", "Sonic", "Kirby"],
   "Helten heter Link, og han kjemper ofte mot skurken Ganon for å redde prinsesse Zelda."),
  ("Hvorfor kalles spill som Pac-Man og Tetris «klassikere»?", "De er gamle og har vært populære lenge", ["De er helt nye", "De finnes ikke lenger", "De er bare i Norge"],
   "Disse spillene er flere tiår gamle og elskes fortsatt — derfor er de klassikere."),
  ("Hva har nesten alle disse klassikerne til felles?", "Lette å lære, men gøy å mestre", ["De varer ti sekunder", "De krever internett bestandig", "De er bare for voksne"],
   "De beste klassikerne er lette å forstå, men vanskelige å bli skikkelig god i."),
 ]),
]

MONSTERE = [
("godzilla", "Godzilla", "Godzilla — kongen av kjempemonstrene",
 "Et digert monster fra havet med superånde. Test deg på Godzilla og vennene!", [
  ("Fra hvilket land kommer Godzilla opprinnelig?", "Japan", ["Norge", "USA", "Brasil"],
   "Godzilla ble skapt i Japan, og den aller første filmen kom i 1954."),
  ("Hva slags dyr ligner Godzilla mest på?", "En diger øgle eller dinosaur", ["En fugl", "En fisk", "En hest"],
   "Godzilla ser ut som en gigantisk, øgleaktig dinosaur som går på to bein."),
  ("Hva er Godzillas mest kjente superkraft?", "En kraftig stråle-ånde fra munnen", ["Å fly til månen", "Å bli usynlig", "Å synge"],
   "Godzilla puster ut en kraftig «atom-ånde» — en glødende stråle fra munnen."),
  ("Hva kalles slike kjempemonstre på japansk?", "Kaiju", ["Sushi", "Ninja", "Manga"],
   "«Kaiju» er det japanske ordet for kjempemonster — Godzilla er det mest kjente."),
  ("Hvor kommer Godzilla som regel opp fra?", "Havet", ["Verdensrommet", "En vulkan på månen", "En innsjø i Norge"],
   "Godzilla stiger ofte opp av havet og går i land i store byer."),
  ("Hva heter det gigantiske, snille møll-monsteret som er venn med Godzilla?", "Mothra", ["Pikachu", "King Kong", "Bowser"],
   "Mothra er en diger, vennlig møll og en av Godzillas mest kjente venner."),
  ("Hva skjer ofte når Godzilla går gjennom en by?", "Bygninger blir knust", ["Det begynner å snø", "Alle får is", "Ingenting"],
   "Godzilla er så enorm at byer blir knust når monsteret går gjennom dem."),
  ("Hvilket annet kjempemonster slåss Godzilla mot i flere filmer?", "King Kong (den store apen)", ["Sonic", "Mario", "En gullfisk"],
   "Godzilla og den enorme apen King Kong har møttes i flere filmer."),
  ("Omtrent hvor stor er Godzilla i filmene?", "Høyere enn store bygninger", ["Som en hund", "Som en bil", "Bittliten"],
   "Godzilla er skildret som høyere enn skyskrapere — derfor virker mennesker så små."),
  ("Hvorfor er Godzilla fortsatt kjent over hele verden?", "Monsteret har vært i filmer i over 70 år", ["Det er helt nytt", "Det finnes bare i ett spill", "Ingen har hørt om det"],
   "Godzilla har vært filmstjerne siden 1954 og er et av verdens mest berømte monstre."),
 ]),
("lommemonstre", "Lommemonstre", "Lommemonstre — Pokémon og vennene deres",
 "Elektriske mus, ild-drager og monstre som vokser seg større. Test deg!", [
  ("Hva betyr «Pokémon»?", "Pocket Monsters — lommemonstre", ["Store roboter", "Snille hunder", "Flyvende biler"],
   "Pokémon er kort for «Pocket Monsters» — monstre du kan ha med deg."),
  ("Hvilken Pokémon er en gul, elektrisk mus?", "Pikachu", ["Charizard", "Squirtle", "Bulbasaur"],
   "Pikachu er en elektrisk mus og den mest kjente av alle Pokémon."),
  ("Charizard er en Pokémon som ligner på …?", "En ild-pustende drage", ["En fisk", "En sau", "En bil"],
   "Charizard er en drage-lignende Pokémon med vinger som puster ild."),
  ("Hva skjer når mange Pokémon blir sterke nok?", "De utvikler seg til en ny form", ["De blir borte", "De krymper for alltid", "De blir til stein"],
   "Pokémon kan «evolvere» — utvikle seg til en større og kraftigere form."),
  ("Hva betyr «Digimon», som ofte sammenlignes med Pokémon?", "Digital Monsters — digitale monstre", ["Det er nøyaktig det samme", "Ekte dyr", "En type bil"],
   "Pokémon betyr lommemonstre, mens Digimon betyr «Digital Monsters» — digitale monstre."),
  ("Hva kalles personen som fanger og trener Pokémon?", "En trener", ["En lege", "En kokk", "En lærer"],
   "En Pokémon-trener fanger, trener og kjemper med Pokémonene sine."),
  ("Hvilket land kommer Pokémon fra?", "Japan", ["Norge", "Italia", "Egypt"],
   "Pokémon ble laget i Japan og kom som spill første gang i 1996."),
  ("Hva er en «legendarisk» Pokémon?", "En veldig sjelden og mektig Pokémon", ["En helt vanlig en", "En som ikke finnes", "En matrett"],
   "Legendariske Pokémon er sjeldne, kraftige og ofte viktige i historien."),
  ("Hvor er en Pokémon når treneren ikke bruker den?", "I en Poké Ball", ["I en sko", "I en bil", "På månen"],
   "Treneren oppbevarer Pokémon i små Poké Balls til de skal brukes."),
  ("Hvorfor finnes det så mange forskjellige Pokémon?", "Det er over tusen arter med ulike krefter", ["Det finnes bare én", "De er alle like", "Ingen vet hva de er"],
   "Det finnes over tusen ulike Pokémon-arter, hver med egne typer og krefter."),
 ]),
("drager-i-popkultur", "Drager", "Drager — fra Tannløs til Charizard",
 "Noen spruter ild, noen er snille kjæledyr. Hvor mye kan du om drager i film og spill?", [
  ("Hva er drager mest kjent for å kunne gjøre i eventyr?", "Spy ild", ["Bake brød", "Kjøre bil", "Synge opera"],
   "I de fleste historier kan drager spy ild fra munnen."),
  ("Hva heter den søte, svarte dragen i «Dragetreneren»?", "Tannløs", ["Bowser", "Sonic", "Pikachu"],
   "På norsk heter dragen Tannløs (Toothless på engelsk) — en snill drage."),
  ("Charizard fra Pokémon er en …?", "Drage-lignende skapning som puster ild", ["Fisk", "Bil", "Fugl uten vinger"],
   "Charizard er en populær Pokémon som ligner en ild-pustende drage."),
  ("Hvor mange bein og vinger har en typisk eventyrdrage?", "Fire bein og to vinger", ["Ingen", "Åtte bein", "To hjul"],
   "Klassiske drager tegnes ofte med fire bein, to store vinger og en lang hale."),
  ("I mange asiatiske eventyr er drager ofte …?", "Lange, slangeaktige og lykkebringere", ["Små som mus", "Laget av is", "Usynlige"],
   "Kinesiske drager er lange og slangeaktige, og blir sett på som heldige og kloke."),
  ("Hvor bor eventyrdrager ofte?", "I huler eller fjell, gjerne med en skatt", ["I et kjøleskap", "På en buss", "I et akvarium"],
   "Drager i eventyr bor ofte i huler og vokter en stor skatt av gull."),
  ("Hva heter den store dragen som vokter gullskatten i «Hobbiten»?", "Smaug", ["Tannløs", "Mushu", "Falkor"],
   "Smaug er den store, gjerrige dragen som vokter skatten i «Hobbiten»."),
  ("I Minecraft møter du en stor drage i «The End». Hva heter den?", "Enderdragen", ["Tannløs", "Charizard", "Smaug"],
   "Enderdragen er den store sjefen du møter i Minecraft-verdenen «The End»."),
  ("Finnes ild-sprutende drager som ekte dyr i naturen i dag?", "Nei, de er fantasidyr fra historier", ["Ja, i Afrika", "Ja, i havet", "Ja, på Nordpolen"],
   "Drager er fantasiskapninger. Det finnes en ekte øgle som heter komodovaran (komododrage), men den spyr ikke ild!"),
  ("Hvorfor er drager så populære i spill og filmer?", "De er spennende, mektige og litt skumle", ["De er kjedelige", "De finnes overalt", "Ingen liker dem"],
   "Drager er digre, mektige og fascinerende — derfor dukker de opp i utallige spill og filmer."),
 ]),
("snille-monstre", "Snille monstre", "Snille monstre — de som ikke er skumle",
 "Ikke alle monstre er skumle — noen er kjempesnille! Test deg på de hyggelige monstrene.", [
  ("I «Monsterbedriften» er det store, lodne, blå monsteret …?", "Snilt og glad i barn", ["Veldig farlig", "En fisk", "En bil"],
   "Sulley ser skummel ut, men er egentlig et snilt monster som blir glad i jenta Boo."),
  ("Hva heter det grønne, sure men snille sump-monsteret fra DreamWorks?", "Shrek", ["Godzilla", "Sonic", "Hulk"],
   "Shrek er et grønt troll-monster (en «ogre») som egentlig har et godt hjerte."),
  ("Det blå monsteret i «Sesame Street» elsker å spise …?", "Kjeks", ["Stein", "Bøker", "Sokker"],
   "Cookie Monster er kjempeglad i kjeks og roper «Me want cookie!»."),
  ("I barneboka «Gruffalo» viser monsteret seg å være …?", "Mindre skummelt enn man tror", ["Kjempefarlig", "Usynlig", "Laget av is"],
   "I «Gruffalo» lurer en liten mus alle ved å snakke om det skumle monsteret — som egentlig ikke er så farlig."),
  ("Hva har mange snille monstre i filmer til felles?", "De ser skumle ut, men er hyggelige inni", ["De er alltid bittesmå", "De kan fly", "De er usynlige"],
   "En vanlig idé i barnefilmer er at noe som ser skummelt ut, kan være snilt og godt."),
  ("I «Hotel Transylvania» driver Dracula et hotell for …?", "Monstre", ["Biler", "Fisker", "Roboter"],
   "I «Hotel Transylvania» er Dracula en snill pappa som driver et feriehotell for monstre."),
  ("Hvorfor lager man snille monstre i barnefilmer?", "For å vise at man ikke skal dømme på utseendet", ["For å skremme", "Fordi det er billig", "Uten grunn"],
   "Snille monstre lærer oss at man ikke skal dømme andre etter hvordan de ser ut."),
  ("Sulleys lille, enøyde og grønne bestevenn heter …?", "Mike", ["Bowser", "Pikachu", "Shrek"],
   "Mike Wazowski er den lille, runde og grønne kompisen med ett stort øye."),
  ("Hva er Totoro, den lodne skapningen fra en japansk tegnefilm?", "Et stort, snilt skogsvesen", ["En bil", "En fisk", "En robot"],
   "Totoro er et vennlig skogsvesen fra filmen «Min nabo Totoro»."),
  ("Er snille monstre laget for å være skumle?", "Nei, de skal være morsomme og koselige", ["Ja, veldig", "Bare for voksne", "De finnes ikke"],
   "Snille monstre er laget for å være morsomme og varme — ikke skumle."),
 ]),
("king-kong-og-filmmonstre", "Filmmonstre", "King Kong og de klassiske filmmonstrene",
 "Kjempeaper, sjøuhyrer og legender. Hvor mye kan du om de gamle filmmonstrene?", [
  ("Hva slags dyr er King Kong?", "En gigantisk ape", ["En fisk", "En slange", "En fugl"],
   "King Kong er en enorm ape, mye større enn en vanlig gorilla."),
  ("I den berømte gamle filmen klatrer King Kong opp på …?", "En høy skyskraper i New York", ["Et fjell i Norge", "En båt", "Et tre"],
   "I filmen fra 1933 klatrer Kong opp på Empire State Building i New York."),
  ("Hvor bor King Kong i historiene?", "På en hemmelig øy", ["På månen", "I en vanlig by", "I et akvarium"],
   "Kong kommer fra en mystisk øy (Skull Island / Kraniøya) full av kjempedyr."),
  ("Hva heter det legendariske kjempe-sjømonsteret fra gamle sjømannshistorier?", "Kraken", ["Nemo", "Dory", "Pikachu"],
   "Kraken er et legendarisk kjempe-sjømonster, ofte tegnet som en enorm blekksprut."),
  ("Yeti og Bigfoot er kjente legender om …?", "Store, hårete skapninger ingen har bevist finnes", ["Små fisker", "Roboter", "Biler"],
   "Yeti (i Himalaya) og Bigfoot (i Amerika) er legender om store, hårete vesener — men ingen har bevist at de finnes."),
  ("Hvorfor var de aller første monsterfilmene i svart-hvitt?", "De ble laget før fargefilm var vanlig", ["De var i 3D", "De var på telefon", "De var tegnet for hånd"],
   "De eldste monsterfilmene, som King Kong fra 1933, ble laget i svart-hvitt."),
  ("Hvordan fikk filmskaperne King Kong til å «bevege seg» i 1933?", "Med små modeller flyttet litt om gangen", ["Med en ekte ape", "Med datamaskin", "Med tegninger"],
   "De brukte «stop-motion»: en liten modell ble flyttet litt, fotografert, flyttet igjen — så det så ut som den levde."),
  ("Hva har King Kong og Godzilla gjort i flere filmer?", "Slåss mot hverandre", ["Spilt fotball", "Bakt kake", "Sunget sammen"],
   "De to mest kjente kjempemonstrene har møtt hverandre i flere store filmer."),
  ("Hvorfor virker filmmonstre ekstra skumle i en by?", "De er enorme sammenlignet med hus og folk", ["De er små", "De er fargerike", "De synger"],
   "Når et monster er høyere enn husene, skjønner vi hvor gigantisk det er."),
  ("Er monstre som King Kong og Kraken ekte?", "Nei, de er fra filmer og legender", ["Ja, de lever i havet", "Ja, i Afrika", "Ja, på Nordpolen"],
   "De er fantasimonstre fra filmer og gamle historier — ikke ekte dyr."),
 ]),
("monsterfakta", "Monsterfakta", "Monsterfakta — hvor kommer monstrene fra?",
 "Hvilket land elsker kjempemonstre, og hva betyr ordene? Test monster-kunnskapen din!", [
  ("Hva betyr det japanske ordet «kaiju»?", "Kjempemonster", ["Liten fisk", "Snill hund", "Rask bil"],
   "«Kaiju» betyr kjempemonster på japansk — som Godzilla og Mothra."),
  ("Hvilket land har laget mange av verdens mest kjente kjempemonstre?", "Japan", ["Norge", "Canada", "Spania"],
   "Japan har en lang tradisjon for kaiju-filmer, og Godzilla er det mest kjente."),
  ("«Pokémon» betyr lommemonstre. Hva betyr «Digimon»?", "Digitale monstre", ["Diger mat", "Doble mynter", "Danske menn"],
   "Digimon er kort for «Digital Monsters» — monstre som lever i en digital verden."),
  ("Hva kalles mange av kjempeskapningene i nordiske eventyr?", "Troll", ["Roboter", "Biler", "Alver"],
   "Troll er kjempeskapninger fra norske og nordiske eventyr, ofte store og litt dumme."),
  ("Hva er ofte typisk for et troll i norske eventyr?", "Det tåler dårlig sollys", ["Det er bittelite", "Det kan fly", "Det elsker å lese"],
   "I mange eventyr blir troll til stein hvis sola skinner på dem."),
  ("Hva har de fleste monstre i filmer til felles?", "De er større, sterkere eller rarere enn vanlige dyr", ["De er små og vanlige", "De er alltid usynlige", "De er roboter"],
   "Et monster er som regel noe som er mye større, sterkere eller merkeligere enn det vi er vant til."),
  ("Hvorfor lager folk historier om monstre?", "For å bli spent og bruke fantasien", ["For å kjede seg", "Fordi de må", "Uten grunn"],
   "Monsterhistorier er spennende og lar oss bruke fantasien — derfor har folk fortalt dem i tusenvis av år."),
  ("Et «mytisk» monster er et monster som …?", "Kommer fra gamle fortellinger og myter", ["Bor i nabolaget", "Er en ekte fisk", "Er en bil"],
   "Mytiske monstre kommer fra myter og eventyr — gamle historier fortalt gjennom mange generasjoner."),
  ("Er monstrene i Pokémon og Godzilla ekte dyr?", "Nei, de er funnet opp for spill og film", ["Ja, de lever i skogen", "Ja, i havet", "Ja, på skolen"],
   "De er oppdiktet for spill og film — morsomme å se på, men ikke ekte."),
  ("Hva er det fine med monstre i spill og film?", "Vi kan oppleve noe spennende på en trygg måte", ["De er farlige på ekte", "De er kjedelige", "De finnes overalt"],
   "Monstre i film og spill lar oss kjenne på spenning og litt grøss — helt trygt, hjemme i sofaen."),
 ]),
]

def build_quiz(stem, catname, title, lede, qs, category, category_label, source):
    out_questions = []
    for i, (q, correct_text, wrong, expl) in enumerate(qs):
        opts = [correct_text] + list(wrong)
        # Deterministisk stokking: seedet på slug + spm-nr → fasit varierer, men reproduserbart
        rng = random.Random("%s__%d" % (stem, i))
        rng.shuffle(opts)
        correct_idx = opts.index(correct_text)
        out_questions.append({
            "category": catname, "q": q, "options": opts,
            "correct": correct_idx, "explanation": expl,
        })
    return {
        "slug": "%s__lett" % stem,
        "themes": [title.split(" — ")[0]],
        "category": category, "category_label": category_label,
        "difficulty": "lett", "title": title, "lede": lede,
        "questions": out_questions, "grounded": True, "source": source,
    }

def write_series(rows, category, category_label, source, ndjson_name):
    quizzes = [build_quiz(s, c, t, l, qs, category, category_label, source) for (s, c, t, l, qs) in rows]
    path = os.path.join(OUT, ndjson_name)
    with open(path, "w", encoding="utf-8") as f:
        for qz in quizzes:
            f.write(json.dumps(qz, ensure_ascii=False) + "\n")
    return quizzes, path

def validate(quizzes, label):
    errs = []
    slugs = set()
    for qz in quizzes:
        if qz["slug"] in slugs: errs.append("duplikat slug: %s" % qz["slug"])
        slugs.add(qz["slug"])
        if len(qz["questions"]) != 10: errs.append("%s har %d spm (skal være 10)" % (qz["slug"], len(qz["questions"])))
        for j, qn in enumerate(qz["questions"]):
            if len(qn["options"]) != 4: errs.append("%s spm %d har %d alt." % (qz["slug"], j, len(qn["options"])))
            if not (0 <= qn["correct"] <= 3): errs.append("%s spm %d: fasit utenfor [0,3]" % (qz["slug"], j))
            if len(set(qn["options"])) != 4: errs.append("%s spm %d: like alternativer" % (qz["slug"], j))
    # fasit-fordeling (skal IKKE alltid være 0)
    from collections import Counter
    dist = Counter(qn["correct"] for qz in quizzes for qn in qz["questions"])
    print("[%s] %d quizer, %d spm. Fasit-fordeling A/B/C/D = %s"
          % (label, len(quizzes), sum(len(q["questions"]) for q in quizzes),
             {k: dist.get(k,0) for k in range(4)}))
    if errs:
        print("  FEIL:", *errs, sep="\n   - ")
    else:
        print("  OK — ingen strukturfeil.")
    return not errs

def write_draft_md(spill, monstere, path):
    def block(title, quizzes):
        lines = ["# %s\n" % title]
        for qz in quizzes:
            lines.append("## %s" % qz["title"])
            lines.append("*%s*  \nslug: `%s` · kategori: %s · nivå: %s\n" % (qz["lede"], qz["slug"], qz["category_label"], qz["difficulty"]))
            for n, qn in enumerate(qz["questions"], 1):
                lines.append("**%d. %s**" % (n, qn["q"]))
                for oi, opt in enumerate(qn["options"]):
                    mark = " ✅" if oi == qn["correct"] else ""
                    lines.append("- %s) %s%s" % ("ABCD"[oi], opt, mark))
                lines.append("  *Forklaring:* %s\n" % qn["explanation"])
            lines.append("---\n")
        return "\n".join(lines)
    with open(path, "w", encoding="utf-8") as f:
        f.write(block("Barneserie — Spill (videospill)", spill))
        f.write("\n\n")
        f.write(block("Barneserie — Monstere", monstere))

def main():
    spill, p1 = write_series(SPILL, "spill", "Spill", "kids-games-series", "barn-spill-serie-KLAR-FOR-ARKIV.ndjson")
    monst, p2 = write_series(MONSTERE, "monstere", "Monstere", "kids-monster-series", "barn-monstere-serie-KLAR-FOR-ARKIV.ndjson")
    draft = os.path.join(OUT, "barn-spill-monstere-DRAFT.md")
    write_draft_md(spill, monst, draft)
    ok1 = validate(spill, "Spill")
    ok2 = validate(monst, "Monstere")
    print("\nSkrev:")
    print(" ", p1)
    print(" ", p2)
    print(" ", draft)
    print("\nALT OK — klar for merge." if (ok1 and ok2) else "\nSjekk feil over før merge.")

if __name__ == "__main__":
    main()
