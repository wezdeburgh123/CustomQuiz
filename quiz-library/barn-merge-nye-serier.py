#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Slår de to NYE barneseriene (Spill + Monstere) inn i arkivet TRYGT og idempotent.
Samme mønster som merge-barn-serie.py: legger quizene i library.ndjson OG
registrerer emnene i topics.json i én operasjon. Kan kjøres flere ganger uten
å lage dubletter.

Kjør fra prosjektmappa:  python3 quiz-library/barn-merge-nye-serier.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRCS = [
    os.path.join(HERE, "barn-spill-serie-KLAR-FOR-ARKIV.ndjson"),
    os.path.join(HERE, "barn-monstere-serie-KLAR-FOR-ARKIV.ndjson"),
]
LIBRARY  = os.path.join(HERE, "library.ndjson")
TOPICS   = os.path.join(HERE, "topics.json")
PRIORITY = 15

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
    new_rows = []
    for src in SRCS:
        if not os.path.exists(src):
            sys.exit("Fant ikke %s — avbryter." % src)
        new_rows += load_ndjson(src)

    lib_rows = load_ndjson(LIBRARY)
    lib_slugs = {r["slug"] for r in lib_rows}

    added_lib = 0
    with open(LIBRARY, "a", encoding="utf-8") as f:
        for r in new_rows:
            if r["slug"] in lib_slugs:
                continue
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
            lib_slugs.add(r["slug"]); added_lib += 1

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
    json.dump(topics_doc, open(TOPICS, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    all_slugs = [r["slug"] for r in load_ndjson(LIBRARY)]
    dupes = sorted({s for s in all_slugs if all_slugs.count(s) > 1})
    print("La til %d quizer i library.ndjson (totalt %d linjer)." % (added_lib, len(all_slugs)))
    print("La til %d emner i topics.json (totalt %d emner)." % (added_top, len(topics_doc["topics"])))
    print("Dubletter i library:", dupes or "ingen")
    print("FERDIG. Du kan nå committe og pushe." if not dupes
          else "ADVARSEL: dubletter funnet — sjekk før push.")

if __name__ == "__main__":
    main()
