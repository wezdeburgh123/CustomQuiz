#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Slår vær/klima- og geologi-quizene (2 stk) inn i arkivet TRYGT og
idempotent. Kjør fra prosjektmappa:  python3 quiz-library/merge-vaer-geologi.py

Gjør to ting i samme operasjon (viktig — ellers kan nattskiftet lage en
konkurrerende, generisk versjon av samme slug): legger quizen i library.ndjson
OG registrerer emnet i topics.json. Kan kjøres flere ganger uten dubletter.

Tar en tidsstemplet backup av library.ndjson før skriving.
"""
import json, os, sys, shutil, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SRC      = os.path.join(HERE, "innhold-vaer-geologi-KLAR-FOR-ARKIV.ndjson")
LIBRARY  = os.path.join(HERE, "library.ndjson")
TOPICS   = os.path.join(HERE, "topics.json")
PRIORITY = 15   # allerede ferdig generert — rein bokføring, som de andre seriene

def load_ndjson(path):
    rows = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for ln in f:
                ln = ln.strip()
                if ln:
                    rows.append(json.loads(ln))
    return rows

def main():
    if not os.path.exists(SRC):
        sys.exit("Fant ikke %s — avbryter." % SRC)
    new_rows = load_ndjson(SRC)

    # Kvalitetsport: nekt å merge noe som ikke holder schemaet.
    for r in new_rows:
        qs = r.get("questions") or []
        if len(qs) != 10:
            sys.exit("%s har %d spørsmål (skal være 10) — avbryter." % (r.get("slug"), len(qs)))
        for i, q in enumerate(qs, 1):
            if len(q.get("options") or []) != 4:
                sys.exit("%s Q%d: må ha nøyaktig 4 alternativer — avbryter." % (r["slug"], i))
            if not isinstance(q.get("correct"), int) or not 0 <= q["correct"] <= 3:
                sys.exit("%s Q%d: ugyldig 'correct' — avbryter." % (r["slug"], i))

    # Backup før vi rører arkivet
    if os.path.exists(LIBRARY):
        stamp = datetime.date.today().strftime("%Y%m%d")
        bak = LIBRARY + ".bak-pre-vaergeo-" + stamp
        if not os.path.exists(bak):
            shutil.copy2(LIBRARY, bak)
            print("Backup: %s" % os.path.basename(bak))

    lib_rows = load_ndjson(LIBRARY)
    lib_slugs = {r["slug"] for r in lib_rows}

    # 1) Legg quizen i library.ndjson (hopp over de som alt finnes)
    added_lib = 0
    with open(LIBRARY, "a", encoding="utf-8") as f:
        for r in new_rows:
            if r["slug"] in lib_slugs:
                continue
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
            lib_slugs.add(r["slug"]); added_lib += 1

    # 2) Registrer emnet i topics.json (hopp over de som alt finnes)
    topics_doc = json.load(open(TOPICS, encoding="utf-8"))
    existing = {t["slug"] for t in topics_doc["topics"]}
    added_top = 0
    for r in new_rows:
        if r["slug"] in existing:
            continue
        topics_doc["topics"].append({
            "slug": r["slug"], "themes": r["themes"],
            "category": r["category"], "category_label": r["category_label"],
            "difficulty": r["difficulty"], "count": 10, "priority": PRIORITY,
        })
        existing.add(r["slug"]); added_top += 1
    topics_doc["total"] = len(topics_doc["topics"])
    # indent=1 matcher repoets eksisterende formattering (nattskiftet skriver med
    # 1-mellomrom) — gir minimal, konfliktfri git-diff.
    with open(TOPICS, "w", encoding="utf-8") as tf:
        json.dump(topics_doc, tf, ensure_ascii=False, indent=1)

    # 3) Verifiser: ingen dubletter i library
    all_slugs = [r["slug"] for r in load_ndjson(LIBRARY)]
    dupes = sorted({s for s in all_slugs if all_slugs.count(s) > 1})
    print("La til %d quiz i library.ndjson (totalt %d linjer)."
          % (added_lib, len(all_slugs)))
    print("La til %d emne i topics.json (totalt %d emner)."
          % (added_top, len(topics_doc["topics"])))
    print("Dubletter i library:", dupes or "ingen")
    print("FERDIG. Du kan nå committe og pushe." if not dupes
          else "ADVARSEL: dubletter funnet — sjekk før push.")

if __name__ == "__main__":
    main()
