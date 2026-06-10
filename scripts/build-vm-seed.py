#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger VM 2026-innholdet fra ÉN kilde (denne fila) og skriver:
  - event-quizzes/vm-2026.json   (lesbar kilde + frontend-fallback)
  - db/seed-vm-2026.sql          (kjøres i Supabase → SQL Editor)

Spørsmålsformat matcher resten av appen: {category, q, options[4], correct, explanation}
Alle fakta er websøk-grunnet 6. juni 2026 (se VM-prompts/-status). Faktisk korrekthet
er ikke-forhandlingsbart — ingen volatile tropp-detaljer, kun verifiserbare fakta.
"""
import json, os, random

EVENT = {
    "id": "vm-2026",
    "title": "Fotball-VM 2026",
    "spot_hex": "#C68A2E",
    "starts_at": "2026-06-11T18:00:00+02:00",
}

def Q(cat, q, options, correct, explanation):
    assert len(options) == 4, q
    assert 0 <= correct < 4, q
    return {"category": cat, "q": q, "options": options, "correct": correct, "explanation": explanation}

QUIZZES = [
 {
  "slug":"historie","num":"01","phase":"Pre-VM","status":"open","sort":1,
  "title":"VM-historie","sub":"Fra 1930 til i dag — turneringer, troféer og talen.",
  "difficulty":"medium",
  "questions":[
   Q("Historie","Hvor ble det aller første fotball-VM arrangert, i 1930?",
     ["Uruguay","Brasil","Italia","Frankrike"],0,
     "Uruguay både arrangerte og vant det første VM i 1930."),
   Q("Rekorder","Hvilket land har vunnet flest VM-titler?",
     ["Brasil","Tyskland","Italia","Argentina"],0,
     "Brasil har fem titler (1958, 1962, 1970, 1994 og 2002)."),
   Q("Historie","Hvilke to land har vunnet VM fire ganger hver?",
     ["Tyskland og Italia","Argentina og Frankrike","Uruguay og Spania","Nederland og England"],0,
     "Tyskland og Italia har fire VM-gull hver, kun slått av Brasils fem."),
   Q("Nyere tid","Hvilket land vant det forrige VM, i 2022 i Qatar?",
     ["Argentina","Frankrike","Brasil","Kroatia"],0,
     "Argentina slo Frankrike på straffer; Lionel Messi løftet trofeet."),
   Q("Rekorder","Hvem er VM-sluttspillenes mestscorende gjennom tidene, med 16 mål?",
     ["Miroslav Klose","Ronaldo Nazário","Pelé","Gerd Müller"],0,
     "Tyske Klose scoret 16 VM-mål mellom 2002 og 2014."),
   Q("Historie","I hvilket land ble VM arrangert i 2022?",
     ["Qatar","Russland","Brasil","Sør-Afrika"],0,
     "Qatar var første VM-vert i Midtøsten, og turneringen ble spilt om vinteren."),
   Q("Nyere tid","Hvilket land vant VM i 2018 i Russland?",
     ["Frankrike","Kroatia","Belgia","Tyskland"],0,
     "Frankrike slo Kroatia 4–2 i finalen i Moskva."),
   Q("Historie","Diego Maradonas berømte «Guds hånd»-mål i VM 1986 kom mot hvilket land?",
     ["England","Vest-Tyskland","Belgia","Italia"],0,
     "Det kom i kvartfinalen mot England, der Maradona også scoret «århundrets mål»."),
   Q("Historie","Hvilket land arrangerte og vant VM i 1966?",
     ["England","Vest-Tyskland","Brasil","Italia"],0,
     "England vant 4–2 over Vest-Tyskland på Wembley — landets eneste VM-gull."),
   Q("Legender","Pelé er den eneste spilleren med tre VM-gull. I hvilke år?",
     ["1958, 1962 og 1970","1954, 1958 og 1962","1962, 1966 og 1970","1958, 1966 og 1970"],0,
     "Pelé vant med Brasil i 1958, 1962 og 1970."),
  ]
 },
 {
  "slug":"legender","num":"02","phase":"Pre-VM","status":"open","sort":2,
  "title":"Legender & rekorder","sub":"Målkonger, kapteiner og bragder som står seg.",
  "difficulty":"vanskelig",
  "questions":[
   Q("Rekorder","Hvem holder rekorden for flest mål i ett enkelt VM-sluttspill, med 13 mål i 1958?",
     ["Just Fontaine","Pelé","Gerd Müller","Sándor Kocsis"],0,
     "Franske Just Fontaine scoret 13 mål i VM 1958 — fortsatt uslått."),
   Q("Nyere tid","Hvilken spiller løftet VM-trofeet som kaptein for Argentina i 2022?",
     ["Lionel Messi","Ángel Di María","Emiliano Martínez","Nicolás Otamendi"],0,
     "Messi kronet karrieren med VM-gull i sitt femte sluttspill."),
   Q("Nyere tid","Hvem scoret hat-trick i VM-finalen 2022, men endte på taperlaget?",
     ["Kylian Mbappé","Olivier Giroud","Antoine Griezmann","Randal Kolo Muani"],0,
     "Mbappé scoret tre i finalen, men Argentina vant på straffer."),
   Q("Legender","Hvilken tysker vant VM både som spiller (1974) og som trener (1990)?",
     ["Franz Beckenbauer","Jürgen Klinsmann","Lothar Matthäus","Joachim Löw"],0,
     "Beckenbauer er én av få som har vunnet VM som både spiller og sjefstrener."),
   Q("Historie","Hvilken spiller ble utvist for et hodestøt mot Marco Materazzi i VM-finalen 2006?",
     ["Zinedine Zidane","Thierry Henry","Patrick Vieira","Cristiano Ronaldo"],0,
     "Zidanes skalling ble hans siste handling som spiller; Italia vant på straffer."),
   Q("Rekorder","Hvem hadde VM-målrekorden (15 mål) før Klose passerte ham i 2014?",
     ["Ronaldo Nazário","Gerd Müller","Pelé","Romário"],0,
     "Brasilianske Ronaldo hadde 15 mål; Klose passerte ham mot Brasil i 2014."),
   Q("Legender","Hvem ble tidenes yngste målscorer i en VM-finale, 17 år gammel i 1958?",
     ["Pelé","Kylian Mbappé","Michael Owen","Wayne Rooney"],0,
     "Pelé scoret to mål i finalen mot Sverige som 17-åring."),
   Q("Nyere tid","Didier Deschamps vant VM som kaptein i 1998 — og i 2018 som hva?",
     ["Trener","Assistenttrener","Dommer","Forbundspresident"],0,
     "Deschamps ledet Frankrike til gull som sjefstrener i 2018."),
   Q("Kultur","Hvilket landslag har kallenavnet «Seleção»?",
     ["Brasil","Portugal","Argentina","Italia"],0,
     "«Seleção» («utvalget») er Brasils kallenavn."),
   Q("Rekorder","Hvilket land tapte tre VM-finaler på rad (1974, 1978) og er kjent som evige toere — kjent for «total fotball»?",
     ["Nederland","Ungarn","Tsjekkoslovakia","Sverige"],0,
     "Nederland tapte finalene i 1974 og 1978, og senere 2010 — tre tapte finaler uten gull."),
  ]
 },
 {
  "slug":"nasjoner","num":"03","phase":"Pre-VM","status":"open","sort":3,
  "title":"Nasjonene & troppene","sub":"De 48 lagene, stjernene og de store linjene.",
  "difficulty":"medium",
  "questions":[
   Q("VM 2026","Hvor mange lag deltar i VM 2026 — en utvidelse fra 32?",
     ["48","40","36","64"],0,
     "Første VM med 48 lag, fordelt på 12 grupper à fire lag."),
   Q("VM 2026","Hvilket landslag stiller med Lionel Messi som regjerende verdensmester?",
     ["Argentina","Brasil","Portugal","Frankrike"],0,
     "Argentina er tittelforsvarer etter gullet i 2022."),
   Q("Norge","Erling Haaland og Martin Ødegaard spiller for hvilket lag som er tilbake i VM for første gang siden 1998?",
     ["Norge","Sverige","Danmark","Island"],0,
     "Norge kvalifiserte seg — landets første VM siden Frankrike 1998."),
   Q("VM 2026","Hvilket land er den eneste representanten fra Oseania (OFC) i VM 2026?",
     ["New Zealand","Australia","Fiji","Tahiti"],0,
     "Australia spiller nå i Asia (AFC); New Zealand er OFCs ene plass."),
   Q("Stjerner","Hvilken stjerne leder Portugal i det som ventes å bli hans siste VM?",
     ["Cristiano Ronaldo","Bruno Fernandes","Bernardo Silva","João Félix"],0,
     "Cristiano Ronaldo er fortsatt Portugals frontfigur."),
   Q("Stjerner","Kylian Mbappé er den store stjernen for hvilket landslag?",
     ["Frankrike","Belgia","Sveits","Kroatia"],0,
     "Mbappé leder det franske angrepet."),
   Q("VM 2026","Hvilket av disse landene kvalifiserte seg til sitt aller første VM i 2026?",
     ["Kapp Verde","Senegal","Nigeria","Kamerun"],0,
     "Kapp Verde debuterer i VM — sammen med Curaçao, Jordan og Usbekistan."),
   Q("VM 2026","Curaçao skrev historie i 2026. Hvordan?",
     ["Den minste nasjonen som noensinne har kvalifisert seg","Første karibiske lag i VM","Første lag uten egen proffliga","Yngste landslag i historien"],0,
     "Med rundt 150 000 innbyggere er Curaçao den minste nasjonen som har nådd et VM."),
   Q("VM 2026","Hvor mange europeiske (UEFA) lag er med i VM 2026?",
     ["16","13","12","20"],0,
     "UEFA fikk 16 plasser i den utvidede 48-lagsturneringen."),
   Q("Stjerner","Hvilket lag kalles «The Three Lions» og ledes av Harry Kane og Jude Bellingham?",
     ["England","Skottland","Wales","Irland"],0,
     "England, med Kane og Bellingham i spissen."),
  ]
 },
 {
  "slug":"vertsbyer","num":"04","phase":"Pre-VM","status":"open","sort":4,
  "title":"Vertsbyer & stadioner","sub":"USA, Canada og Mexico — arenaene og byene.",
  "difficulty":"medium",
  "questions":[
   Q("VM 2026","VM 2026 arrangeres i tre land. Hvilke?",
     ["USA, Canada og Mexico","USA, Mexico og Brasil","Canada, Mexico og Costa Rica","USA, Canada og Jamaica"],0,
     "16 vertsbyer: 11 i USA, 3 i Mexico og 2 i Canada."),
   Q("VM 2026","Hvor mange vertsbyer brukes i VM 2026?",
     ["16","12","11","24"],0,
     "Seksten byer fordelt på de tre vertslandene."),
   Q("Stadioner","På hvilket legendariske stadion i Mexico City spilles åpningskampen 11. juni?",
     ["Estadio Azteca","Estadio BBVA","Camp Nou","Maracanã"],0,
     "Estadio Azteca åpner turneringen — for tredje gang er stadion VM-vert."),
   Q("Stadioner","Hvor spilles VM-finalen 19. juli 2026?",
     ["MetLife Stadium","SoFi Stadium","Rose Bowl","AT&T Stadium"],0,
     "MetLife Stadium i East Rutherford, New Jersey (New York/New Jersey-området)."),
   Q("Stadioner","Estadio Azteca blir første stadion som er VM-vert i tre ulike herre-VM. Hvilke to var de forrige?",
     ["1970 og 1986","1950 og 1978","1990 og 1994","1962 og 1982"],0,
     "Azteca var også vert i 1970 og 1986 — nå tre VM totalt."),
   Q("VM 2026","Hvilke to canadiske byer er vertsbyer i 2026?",
     ["Toronto og Vancouver","Montreal og Toronto","Vancouver og Calgary","Ottawa og Toronto"],0,
     "Canada stiller med Toronto og Vancouver."),
   Q("VM 2026","Hvilket land arrangerer flest kamper (78), inkludert fra kvartfinalene og utover?",
     ["USA","Mexico","Canada","Likt fordelt"],0,
     "USA tar 78 kamper; Canada og Mexico 13 hver."),
   Q("VM 2026","Hvor mange kamper spilles totalt i VM 2026, opp fra 64?",
     ["104","80","96","128"],0,
     "Den utvidede turneringen har 104 kamper."),
   Q("VM 2026","Hvilke tre meksikanske byer er vertsbyer?",
     ["Mexico City, Guadalajara og Monterrey","Mexico City, Puebla og Tijuana","Guadalajara, Cancún og León","Mexico City, Monterrey og Toluca"],0,
     "Mexico stiller med Mexico City, Guadalajara og Monterrey."),
   Q("VM 2026","Over hvilken periode går VM 2026?",
     ["11. juni til 19. juli","1. juni til 1. juli","20. juni til 20. juli","11. juli til 19. august"],0,
     "Turneringen varer fra 11. juni til finalen 19. juli 2026."),
  ]
 },
 {
  "slug":"kvalik","num":"05","phase":"Pre-VM","status":"open","sort":5,
  "title":"Kvalifiseringen","sub":"Hvem kom seg dit — og hvem røk ut på veien.",
  "difficulty":"medium",
  "questions":[
   Q("VM 2026","De tre vertsnasjonene var automatisk kvalifisert. Hvilke?",
     ["USA, Canada og Mexico","USA, Mexico og Argentina","Canada, USA og Brasil","Mexico, Canada og Costa Rica"],0,
     "Som verter slapp USA, Canada og Mexico kvalifisering."),
   Q("VM 2026","Når ble kvalifiseringen til VM 2026 avsluttet?",
     ["31. mars 2026","30. november 2025","1. juni 2026","15. februar 2026"],0,
     "De siste plassene ble avgjort 31. mars 2026."),
   Q("Norge","Hvilket nordisk land kvalifiserte seg til VM for første gang siden 1998?",
     ["Norge","Sverige","Finland","Danmark"],0,
     "Norge er tilbake i VM etter 28 års fravær."),
   Q("VM 2026","Hvilke fire land kvalifiserte seg til sitt aller første VM i 2026?",
     ["Kapp Verde, Curaçao, Jordan og Usbekistan","Island, Kosovo, Jordan og Qatar","Curaçao, Haiti, Panama og Jordan","Kapp Verde, Gabon, Jordan og Usbekistan"],0,
     "Alle fire debuterer i VM-sluttspill i 2026."),
   Q("CONMEBOL","Hvilket tradisjonsrikt søramerikansk land klarte IKKE å kvalifisere seg til VM 2026?",
     ["Chile","Uruguay","Paraguay","Ecuador"],0,
     "Chile røk ut av den søramerikanske kvaliken; Uruguay, Paraguay, Ecuador og Colombia kom seg dit."),
   Q("VM 2026","Hvilken konføderasjon fikk flest plasser i VM 2026?",
     ["Europa (UEFA)","Afrika (CAF)","Asia (AFC)","Sør-Amerika (CONMEBOL)"],0,
     "UEFA fikk 16 plasser — flest av alle konføderasjonene."),
   Q("AFC","Hvilket asiatisk land kvalifiserte seg til sitt første VM noensinne i 2026?",
     ["Usbekistan","Vietnam","Kina","Thailand"],0,
     "Usbekistan debuterer — det samme gjør Jordan fra Asia."),
   Q("AFC","Jordan kvalifiserte seg for sitt første VM. Fra hvilken konføderasjon?",
     ["Asia (AFC)","Afrika (CAF)","CONCACAF","UEFA"],0,
     "Jordan spiller i den asiatiske konføderasjonen (AFC)."),
   Q("OFC","New Zealand sikret VM-plass som mester i hvilken konføderasjon?",
     ["Oseania (OFC)","Asia (AFC)","CONMEBOL","CAF"],0,
     "New Zealand vant Oseania-kvaliken og er regionens ene representant."),
   Q("VM 2026","Hvor mange lag måtte kvalifisere seg, i tillegg til de tre vertsnasjonene?",
     ["45","29","32","47"],0,
     "45 lag kvalifiserte seg; med tre verter blir det 48 totalt."),
  ]
 },
 {
  "slug":"apningskamp","num":"06","phase":"Åpning","status":"locked","sort":6,
  "hero_img":"vm-gruppespill-1",
  "title":"Åpningskampen — VM er i gang",
  "sub":"Storyline, arena og gruppe A før Mexico–Sør-Afrika.",
  "difficulty":"lett",
  "questions":[
    Q("Arena","Hvilket stadion er vert for åpningskampen i VM 2026?",
      ["Estadio Azteca i Mexico by","Estadio BBVA i Monterrey","MetLife Stadium i New Jersey","SoFi Stadium i Los Angeles"],0,
      "Åpningskampen Mexico–Sør-Afrika spilles på Estadio Azteca 11. juni — under VM offisielt «Estadio Ciudad de México» etter FIFAs sponsorregler."),
    Q("Historie","Hvilken historisk rekord setter Estadio Azteca med åpningskampen i 2026?",
      ["Første stadion som er vert for tre VM-åpningskamper","Største stadion i VM-historien","Første stadion med tak i et VM","Eneste stadion brukt i fem ulike VM"],0,
      "Azteca var åpningsarena også i 1970 og 1986 — 2026 blir den tredje."),
    Q("Historie","Estadio Azteca er det første stadionet som har vært vert for to VM-finaler. Hvilke år?",
      ["1970 og 1986","1970 og 1994","1986 og 2002","1962 og 1978"],0,
      "Mexico arrangerte VM i både 1970 og 1986, begge med finale på Azteca."),
    Q("Historie","Hvem vant VM-finalen på Estadio Azteca i 1970?",
      ["Brasil","Italia","Vest-Tyskland","Uruguay"],0,
      "Brasil slo Italia 4–1 og sikret sin tredje VM-tittel, med Pelé på laget."),
    Q("Stjerner","Hvilken spiller står bak både «Guds hånd» og «århundrets mål» på Estadio Azteca i 1986?",
      ["Diego Maradona","Pelé","Michel Platini","Gary Lineker"],0,
      "Begge mål kom mot England i kvartfinalen; Argentina vant VM-et det året."),
    Q("Gruppe A","Hvilket lag møter vertsnasjonen Mexico i åpningskampen?",
      ["Sør-Afrika","Sør-Korea","Tsjekkia","USA"],0,
      "Mexico–Sør-Afrika åpner mesterskapet 11. juni."),
    Q("Gruppe A","Hvilke tre lag er i gruppe A sammen med Mexico?",
      ["Sør-Afrika, Sør-Korea og Tsjekkia","Sør-Afrika, Japan og Polen","Sør-Korea, Tsjekkia og Uruguay","Sør-Afrika, Sør-Korea og Kroatia"],0,
      "Gruppe A spilles fra 11. til 24. juni."),
    Q("Kuriosa","VM 2026 er det første mesterskapet med tre vertsnasjoner. Hvilke?",
      ["USA, Mexico og Canada","USA, Mexico og Guatemala","Canada, Mexico og Costa Rica","USA, Canada og Brasil"],0,
      "Kampene fordeles på de tre landene fra 11. juni til 19. juli."),
    Q("Rekord","Hvor mange lag deltar i VM 2026 — tidenes største sluttspill?",
      ["48","32","40","64"],0,
      "Utvidet fra 32 lag; totalt 104 kamper, mot 64 tidligere."),
    Q("Format","Hvordan er gruppespillet i VM 2026 satt opp?",
      ["12 grupper med 4 lag","8 grupper med 6 lag","16 grupper med 3 lag","4 grupper med 12 lag"],0,
      "De to beste i hver gruppe, pluss de åtte beste treerne, går videre til en ny 32-delsfinale."),
  ]
 },
]

def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(os.path.join(root, "event-quizzes"), exist_ok=True)
    os.makedirs(os.path.join(root, "db"), exist_ok=True)

    # Validering
    for qz in QUIZZES:
        assert len(qz["questions"]) == 10, qz["slug"]

    # Deterministisk stokking av alternativene (fast seed) — så fasit ikke
    # alltid ligger på samme plass. Riktig svar er skrevet først i kilden.
    rng = random.Random(20260611)
    for qz in QUIZZES:
        for q in qz["questions"]:
            correct_text = q["options"][q["correct"]]
            opts = q["options"][:]
            rng.shuffle(opts)
            q["options"] = opts
            q["correct"] = opts.index(correct_text)
    # Distribusjons-sjekk: fasit skal være spredd over a–d
    dist = {0:0,1:0,2:0,3:0}
    for qz in QUIZZES:
        for q in qz["questions"]:
            dist[q["correct"]] += 1

    # 1) JSON
    payload = {"event": EVENT, "quizzes": QUIZZES}
    jpath = os.path.join(root, "event-quizzes", "vm-2026.json")
    with open(jpath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    # 2) Seed-SQL
    lines = []
    lines.append("-- AUTOGENERERT av scripts/build-vm-seed.py — IKKE rediger for hånd.")
    lines.append("-- Kjør i Supabase → SQL Editor ETTER db/migration-vm-events.sql.")
    lines.append("")
    lines.append("insert into public.events (id, title, spot_hex, starts_at, status)")
    lines.append(f"values ({sql_str(EVENT['id'])}, {sql_str(EVENT['title'])}, {sql_str(EVENT['spot_hex'])}, {sql_str(EVENT['starts_at'])}, 'live')")
    lines.append("on conflict (id) do update set title=excluded.title, spot_hex=excluded.spot_hex, starts_at=excluded.starts_at;")
    lines.append("")
    for qz in QUIZZES:
        qjson = json.dumps(qz["questions"], ensure_ascii=False)
        lines.append("insert into public.event_quizzes (event_id, slug, num, phase, title, sub, hero_img, difficulty, questions, status, sort, published)")
        lines.append("values (")
        lines.append(f"  {sql_str(EVENT['id'])}, {sql_str(qz['slug'])}, {sql_str(qz['num'])}, {sql_str(qz['phase'])},")
        lines.append(f"  {sql_str(qz['title'])}, {sql_str(qz['sub'])}, {sql_str(qz.get('hero_img', 'vm-'+qz['slug']))}, {sql_str(qz['difficulty'])},")
        lines.append(f"  {sql_str(qjson)}::jsonb, {sql_str(qz['status'])}, {qz['sort']}, true")
        lines.append(")")
        lines.append("on conflict (event_id, slug) do update set")
        lines.append("  num=excluded.num, phase=excluded.phase, title=excluded.title, sub=excluded.sub,")
        lines.append("  hero_img=excluded.hero_img, difficulty=excluded.difficulty, questions=excluded.questions,")
        lines.append("  status=excluded.status, sort=excluded.sort, published=excluded.published;")
        lines.append("")
    spath = os.path.join(root, "db", "seed-vm-2026.sql")
    with open(spath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    nq = sum(len(q["questions"]) for q in QUIZZES)
    print(f"OK: {len(QUIZZES)} quizer, {nq} spørsmål → {jpath} + {spath}")
    print(f"Fasit-distribusjon a/b/c/d: {dist[0]}/{dist[1]}/{dist[2]}/{dist[3]}")

if __name__ == "__main__":
    main()
