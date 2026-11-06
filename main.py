"""
Main pipeline: joke_library + episode_config → script → MP3
Usage: python main.py
       python main.py --config config/episode_config.yaml
"""

import argparse
import json
import yaml
from datetime import datetime

from modules.script_generator import generate_script, save_script
from modules.audio_generator import generate_audio


def load_yaml(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_jokes_for_episode(joke_library: dict, selected_ids: list[str]) -> list[dict]:
    joke_map = {j["id"]: j for j in joke_library["jokes"]}
    missing = [jid for jid in selected_ids if jid not in joke_map]
    if missing:
        raise ValueError(f"Joke IDs not found in library: {missing}")
    return [joke_map[jid] for jid in selected_ids]


def run_pipeline(config_path: str = "config/episode_config.yaml"):
    episode_cfg = load_yaml(config_path)
    joke_library = load_yaml("data/jokes/joke_library.yaml")

    jokes = load_jokes_for_episode(joke_library, episode_cfg["selected_jokes"])
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    episode_id = f"{episode_cfg['episode_id']}_{timestamp}"
    episode_cfg["output_filename"] = f"{episode_id}.mp3"

    print(f"\n{'='*50}")
    print(f"  Episode: {episode_cfg['title']}")
    print(f"  ID: {episode_id}")
    print(f"{'='*50}\n")

    # Module 2: Generate script
    print("[Module 2] Generating script with DeepSeek...")
    script = generate_script(jokes)
    script_path = save_script(script, episode_id)
    print(f"[Module 2] Done. Script saved to: {script_path}")
    print(f"[Module 2] Total lines: {len(script)}\n")

    # Module 3: Generate audio
    print("[Module 3] Synthesizing audio with ElevenLabs...")
    output_path = generate_audio(script, episode_cfg)
    print(f"\n[Module 3] Done. Episode saved to: {output_path}")
    print(f"\nAll done! Open {output_path} to listen.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aaron, Cat & Grace Podcast Generator")
    parser.add_argument(
        "--config",
        default="config/episode_config.yaml",
        help="Path to episode config YAML",
    )
    args = parser.parse_args()
    run_pipeline(args.config)
