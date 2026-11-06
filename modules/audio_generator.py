"""
Module 3: Audio Generation
Synthesizes each script line via ElevenLabs TTS, assembles with silence gaps,
optionally overlays background music, and exports the final MP3.
"""

import io
import os
import time

from elevenlabs.client import ElevenLabs
from pydub import AudioSegment

from config.settings import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_MODEL,
    ELEVENLABS_OUTPUT_FORMAT,
    SILENCE_BETWEEN_LINES_MS,
    SILENCE_BETWEEN_JOKES_MS,
    BACKGROUND_MUSIC_VOLUME_DBFS,
    BACKGROUND_FADE_OUT_MS,
    OUTPUT_EPISODE_DIR,
)
from config.characters import CHARACTERS


def _clean_text(text: str) -> str:
    """Remove ellipsis characters that TTS would read out awkwardly."""
    import re
    text = re.sub(r'[…\.]{2,}', '', text)  # remove ... and ……
    return text.strip()


def synthesize_line(client: ElevenLabs, speaker: str, text: str) -> AudioSegment:
    text = _clean_text(text)
    char = CHARACTERS[speaker]
    audio_bytes = client.text_to_speech.convert(
        text=text,
        voice_id=char["voice_id"],
        model_id=ELEVENLABS_MODEL,
        output_format=ELEVENLABS_OUTPUT_FORMAT,
        voice_settings={
            "stability": char["stability"],
            "similarity_boost": char["similarity_boost"],
        },
    )
    raw = b"".join(audio_bytes)
    audio = AudioSegment.from_file(io.BytesIO(raw), format="mp3")
    # Strip leading/trailing silence added by TTS
    audio = _strip_silence(audio)
    # Normalize all voices to the same loudness (-16 dBFS)
    return audio.apply_gain(-16 - audio.dBFS)


def _strip_silence(audio: AudioSegment, silence_thresh_db: int = -40, padding_ms: int = 80) -> AudioSegment:
    """Remove leading and trailing silence from a TTS audio segment,
    then re-add a small padding so the audio doesn't feel too clipped."""
    from pydub.silence import detect_leading_silence
    start = detect_leading_silence(audio, silence_threshold=silence_thresh_db)
    end = detect_leading_silence(audio.reverse(), silence_threshold=silence_thresh_db)
    duration = len(audio)
    trimmed = audio[max(0, start - padding_ms): duration - max(0, end - padding_ms)]
    return trimmed


def _mix_background_music(dialogue: AudioSegment, music_path: str) -> AudioSegment:
    music = AudioSegment.from_file(music_path)
    # Loop music to cover full dialogue length
    loops = (len(dialogue) // len(music)) + 2
    music_looped = (music * loops)[: len(dialogue)]
    # Normalize music to target dBFS
    gain = BACKGROUND_MUSIC_VOLUME_DBFS - music_looped.dBFS
    music_quiet = music_looped.apply_gain(gain).fade_out(BACKGROUND_FADE_OUT_MS)
    return music_quiet.overlay(dialogue)


def assemble_episode(
    script: list[dict],
    background_music_path: str | None = None,
) -> AudioSegment:
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    silence_line = AudioSegment.silent(duration=SILENCE_BETWEEN_LINES_MS)
    silence_joke = AudioSegment.silent(duration=SILENCE_BETWEEN_JOKES_MS)

    episode_audio = None
    current_segment = None

    for i, line in enumerate(script):
        speaker = line["speaker"]
        text = line["text"]
        segment = line["segment"]

        print(f"  [{i + 1}/{len(script)}] {speaker}: {text[:30]}...")

        try:
            audio_line = synthesize_line(client, speaker, text)
        except Exception as e:
            print(f"  [WARNING] TTS failed for line {i + 1}: {e}. Using silence placeholder.")
            audio_line = AudioSegment.silent(duration=1000)

        if episode_audio is None:
            episode_audio = audio_line
        else:
            gap = silence_joke if segment != current_segment else silence_line
            episode_audio = episode_audio + gap + audio_line

        current_segment = segment
        time.sleep(0.5)  # Avoid ElevenLabs rate limits

    if episode_audio is None:
        raise RuntimeError("No audio was generated.")

    if background_music_path and os.path.exists(background_music_path):
        print("  Mixing background music...")
        episode_audio = _mix_background_music(episode_audio, background_music_path)

    return episode_audio


def export_episode(episode_audio: AudioSegment, filename: str) -> str:
    os.makedirs(OUTPUT_EPISODE_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_EPISODE_DIR, filename)
    episode_audio.export(path, format="mp3", bitrate="128k")
    return path


def generate_audio(script: list[dict], episode_config: dict) -> str:
    music_path = None
    if episode_config.get("include_background_music"):
        music_path = episode_config.get("background_music")

    episode_audio = assemble_episode(script, music_path)
    return export_episode(episode_audio, episode_config["output_filename"])
