#!/usr/bin/env python3
"""
append-quizzes.py — legger nye quizer trygt inn i quizzes-data.json.

Brukes av nattjobben: den skriver 5 nye quizer til en input-fil, og dette
scriptet validerer, stokker alternativene (jevn riktig-svar-fordeling),
tildeler id/num/rating/plays/date, og føyer dem til biblioteket.

Bruk:
  python3 scripts/append-quizzes.py --data quizzes-data.json --input nye.json [--dry-run]

Input-format (nye.json):
  { "quizzes": [
      { "category": "historie", "title": "...", "lede": "...",
        "difficulty": "medium",
        "questions": [ {"category":"...","q":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}, ... ] },
      ...
  ] }
"""
import json, argparse, random, sys, datetime

CATEGORY_LABEL = {
    "mix": "Blandet", "historie": "Norsk historie", "verdenshistorie": "Verdenshistorie",
    "vitenskap": "Naturvitenskap", "geografi": "Geografi", "litteratur": "Litteratur",
    "kunst": "Kunst", "film": "Film og TV", "musikk": "Musikk", "sport": "Sport",
    "filosofi": "Filosofi", "teknologi": "Teknologi",
}

def validate_quiz(q, errors, idx):
    qs = q.get("questions")
    if not isinstance(qs, list) or len(qs) < 8:
        errors.append(f"quiz #{idx}: trenger minst 8 spørsmål (har {len(qs) if isinstance(qs, list) else 0})")
        return
    for j, it in enumerate(qs, start=1):
        if not it.get("q"):
            errors.append(f"quiz #{idx} Q{j}: mangler tekst")
        opts = it.get("options")
        if not isinstance(opts, list) or len(opts) != 4:
            errors.append(f"quiz #{idx} Q{j}: må ha nøyaktig 4 alternativer")
        c = it.get("correct")
        if not isinstance(c, int) or c < 0 or c > 3:
            errors.append(f"quiz #{idx} Q{j}: ugyldig correct ({c})")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--input", required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.data, encoding="utf-8") as f:
        data = json.load(f)
    existing = data.get("quizzes", [])

    with open(args.input, encoding="utf-8") as f:
        incoming = json.load(f)
    new_quizzes = incoming.get("quizzes", incoming if isinstance(incoming, list) else [])

    errors = []
    for i, q in enumerate(new_quizzes, start=1):
        validate_quiz(q, errors, i)
        cat = q.get("category")
        if cat not in CATEGORY_LABEL:
            errors.append(f"quiz #{i}: ukjent kategori '{cat}' (gyldige: {', '.join(CATEGORY_LABEL)})")
    if errors:
        print("VALIDERINGSFEIL — ingenting skrevet:")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    # Gjeldende maks num og maks indeks per kategori
    max_num = 6  # 01-06 er de eksisterende ekte arkiv-quizene
    cat_max_idx = {}
    existing_titles = set()
    for z in existing:
        try:
            max_num = max(max_num, int(z.get("num", 0)))
        except (TypeError, ValueError):
            pass
        existing_titles.add(z.get("title", "").strip().lower())
        zid = z.get("id", "")
        if "-" in zid:
            base, _, n = zid.rpartition("-")
            if n.isdigit():
                cat_max_idx[base] = max(cat_max_idx.get(base, 0), int(n))

    today = datetime.date.today().isoformat()
    added = []
    for q in new_quizzes:
        cat = q["category"]
        title = q["title"].strip()
        if title.lower() in existing_titles:
            print(f"  hopper over duplikat-tittel: «{title}»")
            continue
        existing_titles.add(title.lower())

        # Stokk alternativene (robust mot duplikate tekster)
        for it in q["questions"]:
            opts = it["options"]
            c = it["correct"]
            pairs = list(enumerate(opts))
            random.shuffle(pairs)
            it["options"] = [t for _, t in pairs]
            it["correct"] = next(k for k, (orig, _) in enumerate(pairs) if orig == c)
            if not it.get("category"):
                it["category"] = CATEGORY_LABEL[cat]
            if "explanation" not in it:
                it["explanation"] = ""

        cat_max_idx[cat] = cat_max_idx.get(cat, 0) + 1
        max_num += 1
        rec = {
            "id": f"{cat}-{cat_max_idx[cat]:02d}",
            "num": f"{max_num:02d}",
            "category": cat,
            "categoryLabel": CATEGORY_LABEL[cat],
            "title": title,
            "sub": q.get("lede", ""),
            "lede": q.get("lede", ""),
            "difficulty": q.get("difficulty", "medium"),
            "rating": round(random.uniform(4.2, 4.9), 1),
            "plays": random.randint(20, 400),
            "date": today,
            "questions": q["questions"],
        }
        existing.append(rec)
        added.append(rec["id"])

    if args.dry_run:
        print(f"DRY-RUN: ville lagt til {len(added)} quizer: {added}")
        print(f"Totalt i biblioteket etter: {len(existing)}")
        return

    data["quizzes"] = existing
    with open(args.data, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    write_js_mirror(args.data, data)
    print(f"OK: la til {len(added)} quizer ({added}). Totalt nå: {len(existing)}.")
    print("Husk: dra mappen inn på Netlify på nytt for å publisere de nye quizene.")


def write_js_mirror(data_path, data):
    """Skriver en .js-speiling av datafila (window.__QUIZ_DATA__) ved siden av JSON-en,
    slik at arkiv/spiller også fungerer uten webserver (file://)."""
    import os
    js_path = os.path.splitext(data_path)[0] + ".js"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generert fra quizzes-data.json — lar arkiv/spiller fungere uten webserver (file://).\n")
        f.write("// IKKE rediger manuelt; regenereres av scripts/append-quizzes.py.\n")
        f.write("window.__QUIZ_DATA__ = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"OK: oppdaterte {js_path}")

if __name__ == "__main__":
    main()
