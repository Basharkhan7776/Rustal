import os
import re
import json
import subprocess

RUSTLINGS_DIR = "/home/bashar-khan/rust/rustlings"
CARGO_TOML = os.path.join(RUSTLINGS_DIR, "Cargo.toml")
EXERCISES_DIR = os.path.join(RUSTLINGS_DIR, "exercises")
SOLUTIONS_DIR = "/tmp/rustlings-6.5.0/solutions"
OUTPUT_JSON = "/home/bashar-khan/projects/rustal/src/data/exercises.json"

def format_title(name: str) -> str:
    m = re.match(r'^([a-zA-Z_]+?)(\d+)$', name)
    if m:
        word, num = m.groups()
        words = word.replace('_', ' ').strip().title()
        return f"{words} {num}"
    return name.replace('_', ' ').strip().title()

def format_category_title(cat: str) -> str:
    name = re.sub(r'^\d+_', '', cat)
    return name.replace('_', ' ').strip().title()

def main():
    print("Reading Cargo.toml...")
    with open(CARGO_TOML, 'r', encoding='utf-8') as f:
        cargo_content = f.read()

    matches = re.findall(r'name\s*=\s*"([^"]+)",\s*path\s*=\s*"exercises/([^"]+)"', cargo_content)
    print(f"Found {len(matches)} exercises in Cargo.toml.")

    category_readmes = {}
    categories = sorted([d for d in os.listdir(EXERCISES_DIR) if os.path.isdir(os.path.join(EXERCISES_DIR, d))])
    category_order_map = {cat: idx + 1 for idx, cat in enumerate(categories)}

    for cat in categories:
        readme_path = os.path.join(EXERCISES_DIR, cat, "README.md")
        if os.path.exists(readme_path):
            with open(readme_path, 'r', encoding='utf-8') as rf:
                category_readmes[cat] = rf.read().strip()
        else:
            category_readmes[cat] = ""

    exercises = []
    print("Processing exercises and extracting hints and solutions...")

    for idx, (name, rel_path) in enumerate(matches, 1):
        exercise_file = os.path.join(EXERCISES_DIR, rel_path)
        cat = rel_path.split('/')[0]

        with open(exercise_file, 'r', encoding='utf-8') as ef:
            starter_code = ef.read()

        hint = ""
        try:
            res = subprocess.run(
                ["rustlings", "hint", name],
                cwd=RUSTLINGS_DIR,
                capture_output=True,
                text=True,
                timeout=5
            )
            raw_hint = res.stdout.strip()
            if "Press ENTER to continue" in raw_hint:
                raw_hint = raw_hint.split("Press ENTER to continue")[-1].strip()
            hint = raw_hint
        except Exception as e:
            print(f"Error getting hint for {name}: {e}")

        solution_code = ""
        sol_file = os.path.join(SOLUTIONS_DIR, rel_path)
        if os.path.exists(sol_file):
            with open(sol_file, 'r', encoding='utf-8') as sf:
                solution_code = sf.read()

        mode = "test" if "#[test]" in starter_code else "run"

        instructions_lines = []
        for line in starter_code.splitlines():
            if line.strip().startswith("//"):
                instructions_lines.append(line.strip().lstrip("/").strip())
            elif line.strip() == "":
                continue
            else:
                break
        instructions = "\n".join(instructions_lines)

        exercise_obj = {
            "id": name,
            "title": format_title(name),
            "order": idx,
            "category": cat,
            "categoryTitle": format_category_title(cat),
            "categoryOrder": category_order_map.get(cat, 99),
            "categoryReadme": category_readmes.get(cat, ""),
            "path": f"exercises/{rel_path}",
            "filename": os.path.basename(rel_path),
            "mode": mode,
            "instructions": instructions,
            "hint": hint,
            "starterCode": starter_code,
            "solutionCode": solution_code or starter_code
        }
        exercises.append(exercise_obj)
        if idx % 15 == 0 or idx == len(matches):
            print(f"Processed {idx}/{len(matches)} exercises...")

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as out:
        json.dump(exercises, out, indent=2, ensure_ascii=False)

    print(f"Successfully generated {OUTPUT_JSON} with {len(exercises)} exercises!")

if __name__ == "__main__":
    main()
