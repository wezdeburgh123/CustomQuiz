#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CustomQuiz — bygg emne-taksonomi (køen det nattlige genererings-skiftet trekker fra).
=====================================================================================
Krysser kuraterte norske underemner (per kategori) med tre vanskelighetsnivåer
til ~1000 rader. Skriver:

  quiz-library/topics.json        — selve køen (les av nattjobben + review)
  quiz-library/topics-oversikt.md — menneskelesbar oversikt for gjennomgang

Hver rad: { slug, themes, category, category_label, difficulty, count, priority }

VIKTIG: `slug` lages med NØYAKTIG samme algoritme som netlify/functions/_library.js
(funksjonen makeSlug). Endrer du den ene, må du endre den andre — ellers bommer
cache-oppslaget på siden.

Kjør:  python3 scripts/build-taxonomy.py
"""
import json, re, os

# ── Kategorier: nøkkel → visningsnavn (må matche arkiv.html CATEGORY_TO_IMG) ──
CATEGORIES = {
    "historie":       "Norsk historie",
    "verdenshistorie":"Verdenshistorie",
    "vitenskap":      "Vitenskap og natur",
    "geografi":       "Geografi",
    "litteratur":     "Litteratur",
    "kunst":          "Kunst",
    "film":           "Film",
    "musikk":         "Musikk",
    "sport":          "Sport",
    "filosofi":       "Filosofi",
    "teknologi":      "Teknologi",
    "mix":            "Blandet allmennkunnskap",
}

DIFFICULTIES = ["lett", "medium", "vanskelig"]

# Hvor mange underemner per kategori som tas med i køen.
# 3 × 12 kategorier × 3 nivå = 108 emner (≈100). Sett None for ALLE (~1008).
SUBTOPICS_PER_CATEGORY = 3

# ── Underemner per kategori (norsk bokmål). ~28 hver → x3 nivå ≈ 1000 ──
SUBTOPICS = {
    "historie": [
        "Vikingtiden", "Slaget på Stiklestad", "Harald Hårfagre og rikssamlingen",
        "Svartedauden i Norge", "Kalmarunionen", "Reformasjonen i Norge",
        "Eidsvoll 1814 og Grunnloven", "Unionen med Sverige", "Unionsoppløsningen 1905",
        "Fridtjof Nansen", "Roald Amundsen og polferdene", "Norsk utvandring til Amerika",
        "Industrialiseringen og vassdragene", "Det norske kongehuset", "Norge under andre verdenskrig",
        "Motstandsbevegelsen og Max Manus", "Quisling og okkupasjonen", "Gjenreisningen av Finnmark",
        "Oljefunnet på Ekofisk", "Etterkrigstidens velferdsstat", "Samenes historie og fornorsking",
        "Stavkirkene", "Håkon Håkonsson og borgerkrigstiden", "Bergen og hanseatene",
        "Christian Michelsen", "EU-avstemningene 1972 og 1994", "Norsk grunnlovshistorie",
        "Kvinners stemmerett i Norge",
    ],
    "verdenshistorie": [
        "Det gamle Egypt", "Romerriket", "Antikkens Hellas", "Mesopotamia",
        "Det bysantinske riket", "Vikingenes ferder i Europa", "Korstogene",
        "Mongolriket og Djengis Khan", "Renessansen", "Oppdagelsesreisene",
        "Den franske revolusjon", "Napoleonskrigene", "Den amerikanske uavhengigheten",
        "Den industrielle revolusjon", "Slavehandelen over Atlanteren", "Første verdenskrig",
        "Den russiske revolusjon", "Mellomkrigstiden", "Andre verdenskrig",
        "Holocaust", "Den kalde krigen", "Berlinmurens fall", "Avkoloniseringen av Afrika",
        "Det britiske imperiet", "Det osmanske riket", "Kinas dynastier",
        "Den industrielle revolusjon i USA", "Romerrikets fall",
    ],
    "vitenskap": [
        "Solsystemet", "Det periodiske system", "Evolusjon og Darwin", "Menneskekroppens anatomi",
        "DNA og genetikk", "Big Bang og universets opprinnelse", "Vann og kretsløpet",
        "Vulkaner og jordskjelv", "Klima og drivhuseffekten", "Elektrisitet og magnetisme",
        "Newtons lover", "Einstein og relativitetsteorien", "Kvantefysikk for nybegynnere",
        "Cellebiologi", "Virus og bakterier", "Immunforsvaret", "Fotosyntese",
        "Dinosaurene", "Havets dyreliv", "Fugler i Norge", "Grunnstoffene",
        "Lys og farger", "Lyd og bølger", "Matematikkens historie", "Tallsystemer og pi",
        "Vær og meteorologi", "Nordlyset", "Astronauter og romfart",
    ],
    "geografi": [
        "Norges fylker og byer", "Europas hovedsteder", "Verdens hovedsteder",
        "Verdens lengste elver", "Verdens høyeste fjell", "Afrikas land",
        "Asias geografi", "Sør-Amerikas geografi", "Nord-Amerikas geografi",
        "Verdenshavene", "Øystater i verden", "Norges nasjonalparker",
        "Verdens største ørkener", "Vulkanske områder", "Verdens befolkning og storbyer",
        "Flagg og nasjonalsymboler", "Grenser og enklaver", "Polarområdene",
        "Skandinavias geografi", "Middelhavslandene", "De britiske øyer",
        "Verdens innsjøer", "Fjorder og kystlinjer", "Klimasoner",
        "Hovedsteder i Oseania", "Verdens tidssoner", "Norske øyer og kystfyr",
        "Verdens største byer",
    ],
    "litteratur": [
        "Henrik Ibsen", "Bjørnstjerne Bjørnson", "Knut Hamsun", "Sigrid Undset",
        "Norske folkeeventyr og Asbjørnsen og Moe", "Jo Nesbø og krimbølgen",
        "Norsk samtidslitteratur", "William Shakespeare", "Greske myter og helter",
        "Norrøn mytologi", "Russiske romanforfattere", "Den franske klassikeren",
        "Britisk 1800-tallslitteratur", "Amerikanske forfattere", "Nobelprisen i litteratur",
        "Barnebøker og klassikere", "Astrid Lindgren", "Eventyr fra hele verden",
        "Lyrikk og dikt", "Fantasy-litteratur og Tolkien", "Science fiction-klassikere",
        "Detektivromanen", "Bibelen som litteratur", "Verdenskjente sitater",
        "Dramaer og teaterstykker", "Roald Dahl", "Antikkens litteratur",
        "Moderne nobelprisvinnere",
    ],
    "kunst": [
        "Renessansekunst", "Leonardo da Vinci", "Michelangelo", "Edvard Munch",
        "Impresjonismen", "Vincent van Gogh", "Pablo Picasso og kubismen",
        "Barokkmaleriet", "Surrealismen", "Pop art og Andy Warhol",
        "Norsk malerkunst på 1800-tallet", "Skulptur gjennom tidene", "Gustav Vigeland",
        "Arkitekturhistorie", "Verdens berømte museer", "Fotografiets historie",
        "Modernismen i kunsten", "Abstrakt kunst", "Antikkens kunst",
        "Frescomaleri og veggkunst", "Gatekunst og Banksy", "Kjente malerier og motiver",
        "Keramikk og kunsthåndverk", "Designhistorie", "Art nouveau og jugendstil",
        "Romansk og gotisk kunst", "Kinesisk og japansk kunst", "Norsk samtidskunst",
    ],
    "film": [
        "Oscar-vinnere gjennom tidene", "Hollywoods gullalder", "Norske filmklassikere",
        "Stumfilmens epoke", "Alfred Hitchcock", "Steven Spielberg", "Star Wars-universet",
        "Marvel-filmene", "Disney-klassikere", "Pixar og animasjonsfilm",
        "James Bond gjennom årene", "Skrekkfilmens historie", "Westernfilmen",
        "Quentin Tarantino", "Christopher Nolan", "Kvinnelige regissører",
        "Filmmusikk og komponister", "Cannes og filmfestivalene", "Italiensk og fransk film",
        "Sci-fi-filmer", "Krigsfilmer", "Berømte filmsitater", "Skuespillere og roller",
        "Trilogier og filmserier", "Dokumentarfilm", "Komedier gjennom tidene",
        "Filmmonstre og spesialeffekter", "Nordisk film og noir",
    ],
    "musikk": [
        "Klassisk musikk og komponister", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven",
        "Edvard Grieg", "The Beatles", "Rockens historie", "Norsk pop og rock",
        "ABBA og svensk pop", "Hiphopens historie", "Jazzens opprinnelse",
        "Eurovision Song Contest", "Michael Jackson", "Queen og Freddie Mercury",
        "Bob Dylan og singer-songwriters", "Elektronisk musikk", "Operaer og arier",
        "Norsk black metal", "Country og folkemusikk", "Instrumenter i orkesteret",
        "K-pop og global musikk", "Musikkteori for nybegynnere", "David Bowie",
        "Disco og 70-tallet", "Grunge og 90-tallet", "Berømte gitarsoloer",
        "Pop-divaer gjennom tidene", "Reggae og Bob Marley", "Norske artister i utlandet",
    ],
    "sport": [
        "Fotball-VM gjennom tidene", "Sommer-OL", "Vinter-OL", "Norsk langrenn",
        "Skiskyting", "Friidrettens stjerner", "Tour de France og sykkelsport",
        "Tennis og Grand Slam", "Formel 1", "Sjakk og verdensmestere",
        "Premier League", "Champions League", "Håndball i Norge", "Norsk fotballhistorie",
        "Boksing og kampsport", "Svømming og rekorder", "Basketball og NBA",
        "Amerikansk idrett", "Hopp og kombinert", "Skøyter og hurtigløp",
        "Golf og majorturneringer", "Maratonløp", "OL-historie og kuriosa",
        "Kvinnefotball", "Ishockey", "Roald Bråthen og norske idrettshelter",
        "Ekstremsport", "Idrettsrekorder",
    ],
    "filosofi": [
        "Sokrates", "Platon og idélæren", "Aristoteles", "Stoikerne",
        "Descartes og rasjonalismen", "Immanuel Kant", "Friedrich Nietzsche",
        "Eksistensialismen", "Etikk og moralfilosofi", "Opplysningstiden",
        "Politisk filosofi", "Demokratiets idéhistorie", "Jean-Jacques Rousseau",
        "Utilitarismen", "Logikk og argumentasjon", "Bevissthetsfilosofi",
        "Religionsfilosofi", "Østlig filosofi og buddhisme", "Konfucius",
        "Vitenskapsfilosofi", "Frihet og fri vilje", "Rettferdighetsteorier",
        "Antikkens filosofer", "Middelalderens tenkere", "Moderne etiske dilemmaer",
        "Språkfilosofi", "Estetikk og skjønnhet", "Kjente tankeeksperimenter",
    ],
    "teknologi": [
        "Internettets historie", "Datamaskinens utvikling", "Kunstig intelligens",
        "Smarttelefonens historie", "Romfartsteknologi", "Elektriske biler",
        "Fornybar energi", "Oppfinnelser som forandret verden", "Steve Jobs og Apple",
        "Programmeringsspråk", "Sosiale medier", "Kryptografi og sikkerhet",
        "Roboter og automasjon", "Halvledere og databrikker", "Gaming og spillkonsoller",
        "Romteleskoper", "Bioteknologi", "Droner", "3D-printing",
        "Industri 4.0", "Telekommunikasjon", "Big data og skyen",
        "Norsk teknologihistorie", "Nikola Tesla og Edison", "Flyets historie",
        "Bilen gjennom tidene", "Oppfinnere og patenter", "Klokken og tidsmåling",
    ],
    "mix": [
        "Blandet allmennkunnskap", "Norsk allmennkunnskap", "Verden rundt",
        "Tall og fakta", "Mat og drikke fra hele verden", "Norske mattradisjoner",
        "Høytider og tradisjoner", "Kjente oppfinnelser", "Dyreriket på tvers",
        "Kropp og helse", "Språk og ord", "Logoer og merkevarer",
        "Kjente sitater", "Vitenskap i hverdagen", "Verdensrekorder",
        "Berømte personer i historien", "Kjente bygninger og landemerker", "Penger og økonomi",
        "Astronomi og stjernebilder", "Eventyr og myter", "Kjendiser og kultur",
        "Norske kjendiser", "Naturfenomener", "Geografi-quiz på tvers",
        "Historiske årstall", "Kunst og kultur blandet", "Sport og lek",
        "Allmenndannelse — bred runde",
    ],
}

# Emner som ALLTID tas med (uavhengig av SUBTOPICS_PER_CATEGORY-taket).
# Norske supportere er ekstremt opptatt av engelsk fotball — Supporterunionen
# (SBF) 2022/23: Liverpool ~48 800, Man. United ~45 900, Leeds ~8 400,
# Arsenal ~7 500, så Tottenham/Chelsea/City/Everton/Newcastle. Disse klubbene
# har stor quiz-interesse, så de prioriteres inn i sport-kategorien.
ALWAYS_INCLUDE = {
    "sport": [
        "Liverpool FC — historie og legender",
        "Manchester United — historie og legender",
        "Arsenal FC",
        "Chelsea FC",
        "Tottenham Hotspur",
        "Manchester City",
        "Leeds United",
        "Everton FC",
        "Newcastle United",
        "Premier League — historie og rekorder",
        "Norske spillere i engelsk fotball",
        "Norske supporterklubber for engelsk fotball",
    ],
}

# ── slug: MÅ være identisk med makeSlug() i _library.js ──
_TRANSLIT = {"æ": "ae", "ø": "o", "å": "a"}

def _norm_token(s: str) -> str:
    s = s.strip().lower()
    for k, v in _TRANSLIT.items():
        s = s.replace(k, v)
    s = re.sub(r"[^a-z0-9]+", "-", s)   # alt annet → bindestrek
    s = re.sub(r"-+", "-", s).strip("-")
    return s

def make_slug(themes, difficulty: str) -> str:
    toks = sorted(_norm_token(t) for t in themes if t and t.strip())
    return "+".join(toks) + "__" + _norm_token(difficulty)

def build():
    rows = []
    seen = set()
    # priority: 'lett' først (billigst/tryggest å verifisere tidlig), så medium, så vanskelig.
    diff_priority = {"lett": 10, "medium": 20, "vanskelig": 30}
    for cat, label in CATEGORIES.items():
        subs = SUBTOPICS[cat]
        if SUBTOPICS_PER_CATEGORY is not None:
            subs = subs[:SUBTOPICS_PER_CATEGORY]
        # Alltid-med-emner (f.eks. de store engelske fotballklubbene) legges til
        # uavhengig av taket; dedupe bevarer rekkefølge.
        extra = ALWAYS_INCLUDE.get(cat, [])
        subs = list(dict.fromkeys(list(subs) + extra))
        for sub in subs:
            for diff in DIFFICULTIES:
                slug = make_slug([sub], diff)
                if slug in seen:
                    continue
                seen.add(slug)
                rows.append({
                    "slug": slug,
                    "themes": [sub],
                    "category": cat,
                    "category_label": label,
                    "difficulty": diff,
                    "count": 10,
                    "priority": diff_priority[diff],
                })
    return rows

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.normpath(os.path.join(here, "..", "quiz-library"))
    os.makedirs(out_dir, exist_ok=True)

    rows = build()
    # Stabil rekkefølge: priority (nivå) → kategori → emne. Gir naturlig ramp:
    # lette først, jevnt fordelt på kategorier.
    rows.sort(key=lambda r: (r["priority"], r["category"], r["slug"]))

    with open(os.path.join(out_dir, "topics.json"), "w", encoding="utf-8") as f:
        json.dump({"generated": True, "total": len(rows), "topics": rows},
                  f, ensure_ascii=False, indent=1)

    # Oversikt for gjennomgang.
    by_cat = {}
    for r in rows:
        by_cat.setdefault(r["category"], 0)
        by_cat[r["category"]] += 1
    lines = ["# Emne-taksonomi — oversikt", "",
             f"**Totalt {len(rows)} emner** ({len(CATEGORIES)} kategorier × underemner × {len(DIFFICULTIES)} nivå).",
             "", "| Kategori | Antall emner |", "|---|---|"]
    for cat, label in CATEGORIES.items():
        lines.append(f"| {label} (`{cat}`) | {by_cat.get(cat,0)} |")
    lines += ["", "## Underemner per kategori (i køen)", ""]
    for cat, label in CATEGORIES.items():
        subs = SUBTOPICS[cat] if SUBTOPICS_PER_CATEGORY is None else SUBTOPICS[cat][:SUBTOPICS_PER_CATEGORY]
        lines.append(f"### {label}")
        lines.append(", ".join(subs))
        lines.append("")
    with open(os.path.join(out_dir, "topics-oversikt.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Skrev {len(rows)} emner → quiz-library/topics.json")
    print("Per kategori:", json.dumps(by_cat, ensure_ascii=False))

if __name__ == "__main__":
    main()
