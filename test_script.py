"""
Quick test: generate and print a script without synthesizing audio.
Usage: python test_script.py
"""

import json
import yaml
from modules.script_generator import generate_script


def load_yaml(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def main():
    episode_cfg = load_yaml("config/episode_config.yaml")
    joke_library = load_yaml("data/jokes/joke_library.yaml")

    joke_map = {j["id"]: j for j in joke_library["jokes"]}
    jokes = [joke_map[jid] for jid in episode_cfg["selected_jokes"]]

    print("Generating script...\n")
    script = generate_script(jokes)

    print(f"Total lines: {len(script)}\n")
    print("=" * 50)

    current_segment = None
    for line in script:
        if line["segment"] != current_segment:
            current_segment = line["segment"]
            print(f"\n--- {current_segment} ---\n")
        print(f"[{line['speaker']}] ({line['emotion']})")
        print(f"  {line['text']}")

    print("\n" + "=" * 50)
    print("\nRaw JSON:\n")
    print(json.dumps(script, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
