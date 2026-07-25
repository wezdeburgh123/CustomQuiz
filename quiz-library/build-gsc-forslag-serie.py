#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger GSC-forslag-serien (10 quizer) til KLAR-FOR-ARKIV.ndjson.
Additivt sett fra GSC-forslag 25.07.2026 — kun temaer UTEN eksisterende dekning:
  - Afrikas hovedsteder (lett/medium/vanskelig)
  - Verdenshistorie – de store epokene (lett/medium/vanskelig)   [bred hub, fanger «verdenshistorie quiz»]
  - Berømte malerier og kunstnere (lett/medium)                  [hub for generisk «kunst quiz»]
  - Norske byer (lett/medium)                                    [egen side, i dag kun «fylker og byer»]

Alle fakta manuelt kvalitetssikret; tvilstilfeller (afrikanske hovedsteder som
har flyttet) er websøk-grunnet 25.07.2026: Burundi=Gitega (2019), Tanzania=Dodoma,
Elfenbenskysten=Yamoussoukro, Benin=Porto-Novo, Eswatini=Mbabane, Sør-Afrika=3 hovedsteder.

Kjør:  python3 quiz-library/build-gsc-forslag-serie.py
Skriver: quiz-library/gsc-forslag-serie-KLAR-FOR-ARKIV.ndjson  (+ validerer hver record)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "gsc-forslag-serie-KLAR-FOR-ARKIV.ndjson")
SOURCE = "manual-gsc-forslag-wave"

# ---- Hjelper: q(kat, spørsmål, [4 svar], fasit-tekst, forklaring) -----------
# Fasit oppgis som TEKST (ikke indeks) for å eliminere indeks-feil; konverteres til
# indeks under bygging, og bygging FEILER hvis fasit-teksten ikke finnes i options.
def q(cat, question, options, answer, explanation):
    return {"category": cat, "q": question, "options": options,
            "answer": answer, "explanation": explanation}

def quiz(slug, theme, category, category_label, difficulty, title, lede, questions):
    return {"slug": slug, "theme": theme, "category": category,
            "category_label": category_label, "difficulty": difficulty,
            "title": title, "lede": lede, "questions": questions}

QUIZZES = []

# ============================================================================
# 1) AFRIKAS HOVEDSTEDER
# ============================================================================
QUIZZES.append(quiz(
    "afrikas-hovedsteder__lett", "Afrikas hovedsteder", "geografi", "Geografi", "lett",
    "Afrikas hovedsteder",
    "De mest kjente hovedstedene i Afrika — fra Kairo til Nairobi. Kjenner du dem?",
    [
        q("Nord-Afrika", "Hva er hovedstaden i Egypt?",
          ["Kairo", "Alexandria", "Luxor", "Giza"], "Kairo",
          "Kairo er Egypts hovedstad og en av Afrikas største byer. Alexandria er nest størst, men er ikke hovedstad."),
        q("Øst-Afrika", "Hva er hovedstaden i Kenya?",
          ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], "Nairobi",
          "Nairobi er både hovedstad og desidert største by i Kenya."),
        q("Nord-Afrika", "Hva er hovedstaden i Marokko?",
          ["Casablanca", "Rabat", "Marrakech", "Fès"], "Rabat",
          "Rabat er hovedstaden, selv om Casablanca er landets største by og økonomiske sentrum — en vanlig felle."),
        q("Sørlige Afrika", "Sør-Afrika har tre hovedsteder. Hvilken av disse byene er én av dem?",
          ["Johannesburg", "Cape Town", "Durban", "Soweto"], "Cape Town",
          "Cape Town er den lovgivende hovedstaden. Johannesburg er størst, men er ikke en av de tre hovedstedene."),
        q("Vest-Afrika", "Hva er hovedstaden i Nigeria?",
          ["Lagos", "Abuja", "Kano", "Ibadan"], "Abuja",
          "Abuja ble hovedstad i 1991 og erstattet Lagos, som fortsatt er landets største by."),
        q("Øst-Afrika", "Hva er hovedstaden i Etiopia?",
          ["Addis Abeba", "Nairobi", "Khartoum", "Mogadishu"], "Addis Abeba",
          "Addis Abeba er Etiopias hovedstad og huser også Den afrikanske unions hovedkvarter."),
        q("Vest-Afrika", "Hva er hovedstaden i Ghana?",
          ["Accra", "Kumasi", "Lagos", "Abidjan"], "Accra",
          "Accra ligger ved Guineabukta og er Ghanas hovedstad og største by."),
        q("Øst-Afrika", "Hva er den offisielle hovedstaden i Tanzania?",
          ["Dar es Salaam", "Dodoma", "Arusha", "Zanzibar"], "Dodoma",
          "Dodoma er den offisielle hovedstaden. Dar es Salaam er størst og viktigst kommersielt, men er ikke hovedstad."),
        q("Vest-Afrika", "Hva er hovedstaden i Senegal?",
          ["Bamako", "Dakar", "Abidjan", "Conakry"], "Dakar",
          "Dakar ligger helt vest på Kapp Verde-halvøya og er Senegals hovedstad."),
        q("Nord-Afrika", "Hva er hovedstaden i Algerie?",
          ["Alger", "Oran", "Tunis", "Casablanca"], "Alger",
          "Alger (Algiers) er hovedstaden i Afrikas største land i areal."),
    ]))

QUIZZES.append(quiz(
    "afrikas-hovedsteder__medium", "Afrikas hovedsteder", "geografi", "Geografi", "medium",
    "Afrikas hovedsteder",
    "Litt tøffere: land der største by ikke er hovedstad, og hovedsteder du må kjenne godt.",
    [
        q("Felle", "Elfenbenskysten (Côte d'Ivoire) har en offisiell hovedstad som ikke er landets største by. Hvilken?",
          ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"], "Yamoussoukro",
          "Yamoussoukro har vært den offisielle hovedstaden siden 1983. Abidjan er størst og landets økonomiske sentrum."),
        q("Sørlige Afrika", "Hvilken by er Sør-Afrikas administrative hovedstad (regjeringssete)?",
          ["Cape Town", "Pretoria", "Bloemfontein", "Johannesburg"], "Pretoria",
          "Pretoria er den utøvende/administrative hovedstaden. Cape Town er lovgivende og Bloemfontein dømmende."),
        q("Sentral-Afrika", "Hva er hovedstaden i Den demokratiske republikken Kongo?",
          ["Brazzaville", "Kinshasa", "Lubumbashi", "Kigali"], "Kinshasa",
          "Kinshasa ligger rett overfor Brazzaville (hovedstad i nabolandet Kongo-Brazzaville) på hver sin side av Kongoelva."),
        q("Sentral-Afrika", "Hva er hovedstaden i Kamerun?",
          ["Douala", "Yaoundé", "Bafoussam", "Garoua"], "Yaoundé",
          "Yaoundé er hovedstaden, mens havnebyen Douala er landets største by."),
        q("Sørlige Afrika", "Hva er hovedstaden i Namibia?",
          ["Windhoek", "Gaborone", "Harare", "Lusaka"], "Windhoek",
          "Windhoek ligger sentralt i det tørre høylandet og er Namibias hovedstad."),
        q("Sørlige Afrika", "Hva er hovedstaden i Zimbabwe?",
          ["Bulawayo", "Harare", "Lusaka", "Maputo"], "Harare",
          "Harare (tidligere Salisbury) er Zimbabwes hovedstad og største by."),
        q("Sørlige Afrika", "Hva er hovedstaden i Botswana?",
          ["Gaborone", "Windhoek", "Maseru", "Lusaka"], "Gaborone",
          "Gaborone ligger sørøst i landet nær grensen til Sør-Afrika."),
        q("Øst-Afrika", "Hva er hovedstaden i Uganda?",
          ["Kampala", "Nairobi", "Kigali", "Dodoma"], "Kampala",
          "Kampala ligger ved Victoriasjøen og er Ugandas hovedstad."),
        q("Sørlige Afrika", "Hva er hovedstaden i Mosambik?",
          ["Beira", "Maputo", "Nampula", "Harare"], "Maputo",
          "Maputo ligger helt sør i landet ved Det indiske hav."),
        q("Øst-Afrika", "Hva er hovedstaden i Rwanda?",
          ["Kigali", "Bujumbura", "Kampala", "Goma"], "Kigali",
          "Kigali ligger sentralt i Rwanda og er landets hovedstad og største by."),
    ]))

QUIZZES.append(quiz(
    "afrikas-hovedsteder__vanskelig", "Afrikas hovedsteder", "geografi", "Geografi", "vanskelig",
    "Afrikas hovedsteder",
    "For de virkelig stødige: nylige hovedstadsflyttinger, doble hovedsteder og de minst kjente.",
    [
        q("Flyttet nylig", "Burundi flyttet sin politiske hovedstad i 2019. Hva heter den nye hovedstaden?",
          ["Bujumbura", "Gitega", "Ngozi", "Rumonge"], "Gitega",
          "Gitega ble utpekt som politisk hovedstad i 2019. Bujumbura er fortsatt største by og økonomisk sentrum."),
        q("Doble hovedsteder", "Hva er den offisielle hovedstaden i Benin (regjeringen sitter i Cotonou)?",
          ["Cotonou", "Porto-Novo", "Parakou", "Abomey"], "Porto-Novo",
          "Porto-Novo er den offisielle hovedstaden, mens regjeringen og de fleste institusjonene ligger i Cotonou."),
        q("Doble hovedsteder", "Hva er den administrative hovedstaden i Eswatini (tidligere Swaziland)?",
          ["Lobamba", "Mbabane", "Manzini", "Nhlangano"], "Mbabane",
          "Mbabane er administrativ hovedstad, mens Lobamba er kongelig og lovgivende sete."),
        q("Sørlige Afrika", "Hvilken av Sør-Afrikas tre hovedsteder er sete for den dømmende makt (høyesterett)?",
          ["Pretoria", "Cape Town", "Bloemfontein", "Durban"], "Bloemfontein",
          "Bloemfontein er dømmende hovedstad. Pretoria er administrativ og Cape Town lovgivende."),
        q("Sørlige Afrika", "Hva er hovedstaden i Malawi?",
          ["Blantyre", "Lilongwe", "Mzuzu", "Zomba"], "Lilongwe",
          "Lilongwe ble hovedstad i 1975 og erstattet Zomba; Blantyre er landets kommersielle sentrum."),
        q("Vest-Afrika", "Hva er hovedstaden i Burkina Faso?",
          ["Ouagadougou", "Bobo-Dioulasso", "Bamako", "Niamey"], "Ouagadougou",
          "Ouagadougou er hovedstad og største by i Burkina Faso."),
        q("Sentral-Afrika", "Hva er hovedstaden i Tsjad?",
          ["N'Djamena", "Niamey", "Bamako", "Khartoum"], "N'Djamena",
          "N'Djamena ligger ved elva Chari nær grensen til Kamerun."),
        q("Øst-Afrika", "Hva er hovedstaden i Eritrea?",
          ["Asmara", "Addis Abeba", "Djibouti", "Massawa"], "Asmara",
          "Asmara ligger høyt i det eritreiske høylandet og er kjent for sin modernistiske arkitektur."),
        q("Øst-Afrika", "Hva er hovedstaden i Madagaskar?",
          ["Antananarivo", "Toamasina", "Port Louis", "Maputo"], "Antananarivo",
          "Antananarivo ligger sentralt på høylandet på øya Madagaskar."),
        q("Sørlige Afrika", "Hva er hovedstaden i Lesotho?",
          ["Maseru", "Gaborone", "Mbabane", "Windhoek"], "Maseru",
          "Maseru ligger ved grensen til Sør-Afrika og er hovedstad i det innelukkede fjellriket Lesotho."),
    ]))

# ============================================================================
# 2) VERDENSHISTORIE – DE STORE EPOKENE (bred oversikt / hub)
# ============================================================================
QUIZZES.append(quiz(
    "verdenshistorie-de-store-epokene__lett", "Verdenshistorie – de store epokene",
    "verdenshistorie", "Verdenshistorie", "lett",
    "Verdenshistorie – de store epokene",
    "En reise gjennom verdenshistorien i grove trekk — fra oldtidens elvekulturer til Berlinmurens fall.",
    [
        q("Oldtiden", "Hvilken elv var livsnerven i det gamle Egypts sivilisasjon?",
          ["Nilen", "Eufrat", "Tigris", "Kongo"], "Nilen",
          "De årlige oversvømmelsene av Nilen ga fruktbar jord og gjorde egyptisk jordbruk mulig."),
        q("Antikken", "Hvilket rike hadde sitt sentrum i byen Roma og bygde Colosseum?",
          ["Romerriket", "Hellas", "Persia", "Egypt"], "Romerriket",
          "Romerriket dominerte Middelhavsområdet i århundrer og etterlot seg blant annet Colosseum."),
        q("Middelalderen", "Middelalderen i Europa regnes ofte fra fallet av hvilket rike?",
          ["Vestromerriket", "Det osmanske riket", "Mongolriket", "Perserriket"], "Vestromerriket",
          "Vestromerrikets fall i 476 e.Kr. markerer vanligvis overgangen til middelalderen."),
        q("Oppdagelsestiden", "Hvem seilte i 1492 over Atlanterhavet og nådde Amerika på oppdrag for Spania?",
          ["Christofer Columbus", "Vasco da Gama", "Ferdinand Magellan", "Marco Polo"], "Christofer Columbus",
          "Columbus' reise i 1492 innledet den europeiske koloniseringen av Amerika."),
        q("Renessansen", "I hvilket land startet renessansen — «gjenfødelsen» av kunst og lærdom?",
          ["Italia", "Frankrike", "England", "Tyskland"], "Italia",
          "Renessansen begynte i italienske bystater som Firenze på 1300–1400-tallet."),
        q("Nyere tid", "Den industrielle revolusjon startet på 1700-tallet først og fremst i hvilket land?",
          ["Storbritannia", "USA", "Tyskland", "Frankrike"], "Storbritannia",
          "Dampmaskin, tekstilindustri og kull gjorde Storbritannia til den industrielle revolusjonens vugge."),
        q("Revolusjoner", "Den franske revolusjon brøt ut i 1789 med stormingen av hvilket bygg?",
          ["Bastillen", "Louvre", "Versailles", "Notre-Dame"], "Bastillen",
          "Stormingen av festningen Bastillen 14. juli 1789 ble selve symbolet på revolusjonen."),
        q("1900-tallet", "Første verdenskrig varte fra 1914 til hvilket år?",
          ["1918", "1916", "1920", "1922"], "1918",
          "Krigen endte med våpenhvile 11. november 1918."),
        q("1900-tallet", "Hvilken mur falt i 1989 og ble symbol på slutten av den kalde krigen?",
          ["Berlinmuren", "Den kinesiske mur", "Hadrians mur", "Vestmuren"], "Berlinmuren",
          "Berlinmurens fall i november 1989 varslet slutten på delingen av Europa."),
        q("Antikken", "Den kinesiske mur ble hovedsakelig bygd for å beskytte mot hvem?",
          ["Nomadefolk fra nord", "Romerne", "Mongolske sjørøvere", "Japanske samuraier"],
          "Nomadefolk fra nord",
          "Muren skulle holde rytternomader fra steppene i nord ute av det kinesiske kjerneland."),
    ]))

QUIZZES.append(quiz(
    "verdenshistorie-de-store-epokene__medium", "Verdenshistorie – de store epokene",
    "verdenshistorie", "Verdenshistorie", "medium",
    "Verdenshistorie – de store epokene",
    "Årstall, vendepunkter og skikkelser som formet verden. Litt tyngre enn oversikten.",
    [
        q("Oldtiden", "Hvilken skrifttype ble utviklet i Mesopotamia og regnes blant verdens eldste?",
          ["Kileskrift", "Hieroglyfer", "Det latinske alfabet", "Runer"], "Kileskrift",
          "Sumererne i Mesopotamia utviklet kileskrift, presset inn i leirtavler med en griffel."),
        q("Antikken", "Hvem erobret et rike fra Hellas til India på 300-tallet f.Kr.?",
          ["Aleksander den store", "Julius Cæsar", "Hannibal", "Dareios III"], "Aleksander den store",
          "Aleksander av Makedonia skapte et av oldtidens største riker før han døde bare 32 år gammel."),
        q("Middelalderen", "I hvilket år falt Konstantinopel til osmanene og markerte slutten på Bysants?",
          ["1453", "1204", "1492", "1348"], "1453",
          "Sultan Mehmet II erobret Konstantinopel i 1453, en begivenhet som ofte regnes som slutten på middelalderen."),
        q("Middelalderen", "Svartedauden herjet Europa hardest på hvilket århundre?",
          ["1300-tallet", "1200-tallet", "1400-tallet", "1100-tallet"], "1300-tallet",
          "Pandemien nådde Europa rundt 1347 og drepte en stor del av befolkningen på få år."),
        q("Middelalderen", "Hvem ledet den mongolske ekspansjonen på begynnelsen av 1200-tallet?",
          ["Djengis Khan", "Attila", "Tamerlan", "Kublai Khan"], "Djengis Khan",
          "Djengis Khan samlet mongolstammene og la grunnlaget for historiens største sammenhengende landrike."),
        q("Nyere tid", "Hvem utløste reformasjonen i 1517, ifølge tradisjonen ved å slå opp 95 teser?",
          ["Martin Luther", "Jean Calvin", "Erasmus", "Henrik VIII"], "Martin Luther",
          "Luthers teser mot avlatshandelen i Wittenberg satte i gang reformasjonen."),
        q("Nyere tid", "Hvilken fred i 1648 avsluttet trettiårskrigen og formet det moderne statssystemet?",
          ["Den westfalske fred", "Freden i Versailles", "Wienerfreden", "Freden i Utrecht"],
          "Den westfalske fred",
          "Den westfalske fred etablerte prinsippet om statlig suverenitet som fortsatt preger folkeretten."),
        q("Revolusjoner", "Den amerikanske uavhengighetserklæringen ble vedtatt i hvilket år?",
          ["1776", "1789", "1804", "1812"], "1776",
          "De tretten koloniene erklærte uavhengighet fra Storbritannia 4. juli 1776."),
        q("Napoleon", "Hvor led Napoleon sitt endelige nederlag i 1815?",
          ["Waterloo", "Austerlitz", "Leipzig", "Borodino"], "Waterloo",
          "Slaget ved Waterloo i dagens Belgia avsluttet Napoleons herredømme for godt."),
        q("1900-tallet", "I hvilket år kom bolsjevikene til makten i den russiske revolusjonen?",
          ["1917", "1905", "1922", "1914"], "1917",
          "Oktoberrevolusjonen i 1917 førte Lenin og bolsjevikene til makten."),
    ]))

QUIZZES.append(quiz(
    "verdenshistorie-de-store-epokene__vanskelig", "Verdenshistorie – de store epokene",
    "verdenshistorie", "Verdenshistorie", "vanskelig",
    "Verdenshistorie – de store epokene",
    "De skarpe detaljene: slag, edikter og dynastier for deg som kan historien godt.",
    [
        q("Antikken", "Hvilket sjøslag i 31 f.Kr. sikret Octavian (senere Augustus) makten i Roma?",
          ["Slaget ved Actium", "Slaget ved Cannae", "Slaget ved Zama", "Slaget ved Philippi"],
          "Slaget ved Actium",
          "Ved Actium slo Octavian flåten til Marcus Antonius og Kleopatra, og ble Romas enehersker."),
        q("Antikken", "Hvilket edikt ga i år 313 de kristne religionsfrihet i Romerriket?",
          ["Milano-ediktet", "Nantesediktet", "Thessaloniki-ediktet", "Caracalla-ediktet"],
          "Milano-ediktet",
          "Keiser Konstantin og Licinius sto bak Milano-ediktet, som gjorde slutt på forfølgelsen av kristne."),
        q("Antikken", "I hvilket år regnes vanligvis Vestromerriket som falt da siste keiser ble avsatt?",
          ["476", "410", "395", "527"], "476",
          "Germaneren Odovakar avsatte keiser Romulus Augustulus i 476 e.Kr."),
        q("Bysants", "Hvilken bysantinsk keiser fikk samlet romersk lov i «Corpus Juris Civilis» på 500-tallet?",
          ["Justinian I", "Konstantin XI", "Heraklios", "Basileios II"], "Justinian I",
          "Justinians lovsamling ble grunnlaget for mye av europeisk rettstradisjon."),
        q("Asia", "Hvilket kinesisk dynasti (618–907) regnes som en gullalder for poesi og kultur?",
          ["Tang", "Ming", "Han", "Qing"], "Tang",
          "Tang-dynastiet var en høyt utviklet periode med blomstrende handel og diktekunst."),
        q("Middelalderen", "I hvilket år ble Magna Carta undertegnet i England?",
          ["1215", "1066", "1348", "1415"], "1215",
          "Kong Johan uten land ble tvunget til å godta Magna Carta, som begrenset kongemakten."),
        q("Oppdagelsestiden", "Hvilket land innledet oppdagelsestiden på 1400-tallet, inspirert av Henrik Sjøfareren?",
          ["Portugal", "Spania", "Nederland", "England"], "Portugal",
          "Portugal ledet an med systematiske sjøferder langs Afrikas kyst under prins Henrik Sjøfareren."),
        q("Nyere tid", "Hvilken kongress i 1814–1815 tegnet om Europas kart etter Napoleonskrigene?",
          ["Wienerkongressen", "Berlinkongressen", "Parisfreden", "Kongressen i Utrecht"],
          "Wienerkongressen",
          "Wienerkongressen forsøkte å gjenopprette maktbalansen i Europa etter Napoleon."),
        q("Egypt", "Pyramidene i Giza (blant annet Kheops' pyramide) ble reist under hvilken periode?",
          ["Det gamle riket", "Det nye riket", "Ptolemeer-tiden", "Mellomriket"], "Det gamle riket",
          "De store Giza-pyramidene ble bygd i Det gamle rikets 4. dynasti, rundt 2500 f.Kr."),
        q("1900-tallet", "Hvilken hendelse i Sarajevo i 1914 utløste første verdenskrig?",
          ["Attentatet på erkehertug Franz Ferdinand", "Bombingen av Beograd",
           "Lusitanias forlis", "Marokko-krisen"], "Attentatet på erkehertug Franz Ferdinand",
          "Drapet på den østerriksk-ungarske tronarvingen 28. juni 1914 satte i gang krigsutbruddet."),
    ]))

# ============================================================================
# 3) BERØMTE MALERIER OG KUNSTNERE (hub for generisk «kunst quiz»)
# ============================================================================
QUIZZES.append(quiz(
    "beromte-malerier-og-kunstnere__lett", "Berømte malerier og kunstnere",
    "kunst", "Kunst", "lett",
    "Berømte malerier og kunstnere",
    "Verdens mest kjente malerier og menneskene bak dem — fra Mona Lisa til Skrik.",
    [
        q("Renessansen", "Hvem malte «Mona Lisa»?",
          ["Leonardo da Vinci", "Michelangelo", "Rafael", "Botticelli"], "Leonardo da Vinci",
          "Leonardo da Vinci malte «Mona Lisa» tidlig på 1500-tallet; hun henger i dag i Louvre."),
        q("Norsk kunst", "«Skrik» er malt av hvilken norsk kunstner?",
          ["Edvard Munch", "Christian Krohg", "Harald Sohlberg", "Theodor Kittelsen"], "Edvard Munch",
          "Edvard Munchs «Skrik» er et av verdens mest kjente kunstverk."),
        q("Post-impresjonisme", "Hvem malte «Stjernenatt» og er kjent for å ha skåret av seg øret?",
          ["Vincent van Gogh", "Paul Gauguin", "Paul Cézanne", "Claude Monet"], "Vincent van Gogh",
          "Nederlenderen Vincent van Gogh malte «Stjernenatt» i 1889."),
        q("Renessansen", "Hvem malte taket i Det sixtinske kapell i Vatikanet?",
          ["Michelangelo", "Leonardo da Vinci", "Rafael", "Caravaggio"], "Michelangelo",
          "Michelangelo brukte flere år på det enorme takfreskoet, fullført i 1512."),
        q("Barokken", "«Nattevakten» er malt av hvilken nederlandsk mester?",
          ["Rembrandt", "Vermeer", "Rubens", "Frans Hals"], "Rembrandt",
          "Rembrandt van Rijn malte «Nattevakten» i 1642; den henger i Rijksmuseum i Amsterdam."),
        q("Moderne kunst", "Hvilken spansk kunstner var med å grunnlegge kubismen og malte «Guernica»?",
          ["Pablo Picasso", "Salvador Dalí", "Joan Miró", "Francisco Goya"], "Pablo Picasso",
          "Pablo Picasso regnes som en av 1900-tallets mest innflytelsesrike kunstnere."),
        q("Surrealisme", "Smeltende klokker er kjennetegn på hvilken surrealist («Erindringens bestandighet»)?",
          ["Salvador Dalí", "René Magritte", "Max Ernst", "Marc Chagall"], "Salvador Dalí",
          "Spanske Salvador Dalí malte de smeltende klokkene i 1931."),
        q("Barokken", "«Piken med perleøredobb» er malt av hvem?",
          ["Johannes Vermeer", "Rembrandt", "Jan van Eyck", "Peter Paul Rubens"], "Johannes Vermeer",
          "Vermeers portrett fra rundt 1665 kalles ofte «Nordens Mona Lisa»."),
        q("Impresjonisme", "Claude Monet var en ledende skikkelse i hvilken kunstretning?",
          ["Impresjonismen", "Kubismen", "Surrealismen", "Ekspresjonismen"], "Impresjonismen",
          "Monets maleri «Impresjon, soloppgang» ga selve navnet til impresjonismen."),
        q("Popkunst", "Hvilken amerikansk popkunstner er kjent for Campbell's suppebokser og Marilyn-portretter?",
          ["Andy Warhol", "Roy Lichtenstein", "Jackson Pollock", "Keith Haring"], "Andy Warhol",
          "Andy Warhol gjorde hverdagsprodukter og kjendiser til popkunstikoner på 1960-tallet."),
    ]))

QUIZZES.append(quiz(
    "beromte-malerier-og-kunstnere__medium", "Berømte malerier og kunstnere",
    "kunst", "Kunst", "medium",
    "Berømte malerier og kunstnere",
    "Museer, stilretninger og teknikker — for deg som kan litt mer enn bare navnene.",
    [
        q("Museer", "På hvilket museum henger «Mona Lisa»?",
          ["Louvre", "Uffizi", "Prado", "Rijksmuseum"], "Louvre",
          "«Mona Lisa» er en av Louvres største attraksjoner i Paris."),
        q("Stilretninger", "Hvilken stil tilhører Vincent van Goghs «Solsikker» og selvportretter?",
          ["Post-impresjonisme", "Barokk", "Kubisme", "Romantikk"], "Post-impresjonisme",
          "Van Gogh regnes som en sentral post-impresjonist, med kraftig farge og synlige penselstrøk."),
        q("Moderne kunst", "Hvilket anti-krigsmaleri malte Picasso etter bombingen av en baskisk by i 1937?",
          ["Guernica", "Les Demoiselles d'Avignon", "Den gamle gitarspilleren", "Drømmen"], "Guernica",
          "«Guernica» skildrer lidelsene under den spanske borgerkrigen."),
        q("Høyrenessansen", "Hvem malte fresken «Skolen i Athen» i Vatikanet?",
          ["Rafael", "Michelangelo", "Leonardo da Vinci", "Tizian"], "Rafael",
          "Rafael malte «Skolen i Athen» rundt 1510 som en hyllest til antikkens filosofer."),
        q("Skulptur", "Hvilken fransk billedhugger laget «Tenkeren»?",
          ["Auguste Rodin", "Antonio Canova", "Edgar Degas", "Constantin Brâncuși"], "Auguste Rodin",
          "Rodins «Tenkeren» er en av verdens mest kjente skulpturer."),
        q("Abstrakt kunst", "Hvilken russiskfødte maler regnes som en pioner for den abstrakte kunsten?",
          ["Wassily Kandinsky", "Kazimir Malevitsj", "Marc Chagall", "Piet Mondrian"], "Wassily Kandinsky",
          "Kandinsky malte noen av de første rent abstrakte verkene tidlig på 1900-tallet."),
        q("Teknikk", "Hvilken teknikk brukte Michelangelo i Det sixtinske kapell — maling på våt kalkpuss?",
          ["Fresko", "Oljemaleri", "Akvarell", "Tempera"], "Fresko",
          "I fresko males pigment inn i fuktig puss, slik at fargen bindes når pussen tørker."),
        q("Kunstnere", "Fra hvilket land kom kunstneren Frida Kahlo?",
          ["Mexico", "Spania", "Argentina", "Colombia"], "Mexico",
          "Frida Kahlo er kjent for sine intense selvportretter og mexicanske motiver."),
        q("Norsk kunst", "Hvor mange malte versjoner av «Skrik» laget Edvard Munch?",
          ["To", "Én", "Fire", "Ti"], "Fire",
          "Munch laget fire malte/pastellversjoner av «Skrik» samt flere trykk."),
        q("Impresjonisme", "Hvilken impresjonist er særlig kjent for ballettdansere som motiv?",
          ["Edgar Degas", "Auguste Renoir", "Camille Pissarro", "Édouard Manet"], "Edgar Degas",
          "Edgar Degas malte og tegnet dansere igjen og igjen gjennom karrieren."),
    ]))

# ============================================================================
# 4) NORSKE BYER (egen side; i dag kun «Norges fylker og byer»)
# ============================================================================
QUIZZES.append(quiz(
    "norske-byer__lett", "Norske byer", "geografi", "Geografi", "lett",
    "Norske byer",
    "Fra Oslo til Tromsø — kjenner du de norske byene og hva de er kjent for?",
    [
        q("Hovedstad", "Hva er Norges hovedstad?",
          ["Oslo", "Bergen", "Trondheim", "Stavanger"], "Oslo",
          "Oslo er Norges hovedstad og desidert største by."),
        q("Størrelse", "Hvilken by er Norges nest største?",
          ["Bergen", "Trondheim", "Stavanger", "Drammen"], "Bergen",
          "Bergen på Vestlandet er Norges nest største by etter Oslo."),
        q("Kallenavn", "Hvilken by kalles ofte «oljehovedstaden»?",
          ["Stavanger", "Bergen", "Kristiansand", "Bodø"], "Stavanger",
          "Stavanger-regionen er sentrum for norsk olje- og gassindustri."),
        q("Landemerker", "I hvilken by ligger Nidarosdomen?",
          ["Trondheim", "Bergen", "Oslo", "Tromsø"], "Trondheim",
          "Nidarosdomen i Trondheim er Norges nasjonalhelligdom og bygd over Olav den helliges grav."),
        q("Kallenavn", "Hvilken nordnorsk by kalles «Nordens Paris»?",
          ["Tromsø", "Bodø", "Narvik", "Alta"], "Tromsø",
          "Tromsø fikk kallenavnet på grunn av sitt overraskende rike byliv langt mot nord."),
        q("Verdensarv", "Bryggen, som står på UNESCOs verdensarvliste, ligger i hvilken by?",
          ["Bergen", "Ålesund", "Trondheim", "Stavanger"], "Bergen",
          "De gamle hansahusene på Bryggen i Bergen er verdensarv."),
        q("Idrett", "Hvilken norsk by arrangerte vinter-OL i 1994?",
          ["Lillehammer", "Oslo", "Hamar", "Trondheim"], "Lillehammer",
          "Lillehammer var vertsby for de olympiske vinterleker i 1994."),
        q("Geografi", "Hvilken by, europeisk kulturhovedstad i 2024, ligger like nord for polarsirkelen?",
          ["Bodø", "Tromsø", "Narvik", "Mo i Rana"], "Bodø",
          "Bodø var europeisk kulturhovedstad i 2024 og ligger rett nord for polarsirkelen."),
        q("Attraksjoner", "Hvilken sørlandsby er kjent for Dyreparken?",
          ["Kristiansand", "Arendal", "Mandal", "Grimstad"], "Kristiansand",
          "Kristiansand dyrepark er en av Norges mest besøkte familieattraksjoner."),
        q("Festningsby", "Hvilken by ved munningen av Glomma er kjent for Gamlebyen, en gammel festningsby?",
          ["Fredrikstad", "Sarpsborg", "Halden", "Moss"], "Fredrikstad",
          "Gamlebyen i Fredrikstad regnes som Nordens best bevarte festningsby."),
    ]))

QUIZZES.append(quiz(
    "norske-byer__medium", "Norske byer", "geografi", "Geografi", "medium",
    "Norske byer",
    "Eldste byer, arkitektur og historie — litt mer krevende byspørsmål.",
    [
        q("Historie", "Hvilken by regnes ofte som Norges eldste, med opprinnelse før år 871?",
          ["Tønsberg", "Trondheim", "Bergen", "Oslo"], "Tønsberg",
          "Tønsberg omtales i sagaene og regnes tradisjonelt som Norges eldste by."),
        q("Arkitektur", "Ålesund er kjent for sin arkitektur i hvilken stil, gjenreist etter bybrannen i 1904?",
          ["Jugendstil", "Barokk", "Funksjonalisme", "Gotikk"], "Jugendstil",
          "Etter storbrannen i 1904 ble Ålesund gjenoppbygd i jugendstil (Art Nouveau)."),
        q("Historie", "Hvilken by var Norges første hovedstad i middelalderen, den gang kalt Nidaros?",
          ["Trondheim", "Bergen", "Oslo", "Tønsberg"], "Trondheim",
          "Trondheim (Nidaros) var rikssenter og kongssete i tidlig middelalder."),
        q("Landemerker", "Stavanger domkirke er kjent som?",
          ["Norges eldste domkirke i sammenhengende bruk", "Norges største kirke",
           "Norges nordligste katedral", "Norges eneste trekatedral"],
          "Norges eldste domkirke i sammenhengende bruk",
          "Stavanger domkirke fra rundt 1125 er den eneste norske middelalderkatedralen som har vært i bruk uavbrutt."),
        q("Geografi", "Hvilken by ligger ved Norges største innsjø, Mjøsa, og huser skøytehallen «Vikingskipet»?",
          ["Hamar", "Gjøvik", "Lillehammer", "Elverum"], "Hamar",
          "Hamar ligger ved Mjøsa; olympiahallen «Vikingskipet» ble bygd til OL i 1994."),
        q("Kallenavn", "Hvilken by på Nordvestlandet kalles «Rosenes by»?",
          ["Molde", "Ålesund", "Kristiansund", "Bergen"], "Molde",
          "Molde har fått kallenavnet «Rosenes by» for sitt milde klima og frodige hager."),
        q("Krigshistorie", "Byen Narvik var strategisk viktig i andre verdenskrig på grunn av utskiping av hva?",
          ["Jernmalm", "Kull", "Olje", "Tømmer"], "Jernmalm",
          "Narvik er isfri havn for svensk jernmalm fra Kiruna, og ble derfor kampsone i 1940."),
        q("Geografi", "Hvilken by regnes som Norges sørligste?",
          ["Mandal", "Kristiansand", "Stavanger", "Arendal"], "Mandal",
          "Mandal i Agder regnes tradisjonelt som Norges sørligste by."),
        q("Kallenavn", "Hvilken vestlandsby omtales som «byen mellom de syv fjell»?",
          ["Bergen", "Stavanger", "Ålesund", "Haugesund"], "Bergen",
          "Bergen er omkranset av fjell og kalles «byen mellom de syv fjell»."),
        q("Størrelse", "Hvilken by er Norges tredje største?",
          ["Trondheim", "Stavanger", "Drammen", "Bergen"], "Trondheim",
          "Etter Oslo og Bergen er Trondheim Norges tredje største by."),
    ]))

# ============================================================================
# Bygg + valider
# ============================================================================
def build():
    out_records = []
    problems = []
    for qz in QUIZZES:
        qs = qz["questions"]
        if len(qs) != 10:
            problems.append(f"{qz['slug']}: har {len(qs)} spørsmål (skal være 10)")
        rec_questions = []
        for i, item in enumerate(qs):
            opts = item["options"]
            if len(opts) != 4:
                problems.append(f"{qz['slug']} q{i+1}: {len(opts)} svaralternativer (skal være 4)")
            if len(set(opts)) != len(opts):
                problems.append(f"{qz['slug']} q{i+1}: duplikate svaralternativer")
            ans = item["answer"]
            if ans not in opts:
                problems.append(f"{qz['slug']} q{i+1}: fasit «{ans}» finnes ikke i alternativene")
                correct = 0
            else:
                correct = opts.index(ans)
            rec_questions.append({
                "category": item["category"], "q": item["q"], "options": opts,
                "correct": correct, "explanation": item["explanation"],
            })
        out_records.append({
            "slug": qz["slug"], "themes": [qz["theme"]], "category": qz["category"],
            "category_label": qz["category_label"], "difficulty": qz["difficulty"],
            "title": qz["title"], "lede": qz["lede"], "free": True, "grounded": True,
            "source": SOURCE, "questions": rec_questions,
        })
    # slug-unikhet
    slugs = [r["slug"] for r in out_records]
    for s in set(slugs):
        if slugs.count(s) > 1:
            problems.append(f"Duplikat slug i serien: {s}")
    if problems:
        print("VALIDERINGSFEIL:")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    with open(OUT, "w", encoding="utf-8") as f:
        for r in out_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"OK: skrev {len(out_records)} quizer ({len(out_records)*10} spørsmål) til")
    print("   ", OUT)
    from collections import Counter
    by_cat = Counter(r["category"] for r in out_records)
    print("    Kategorier:", dict(by_cat))

if __name__ == "__main__":
    build()
