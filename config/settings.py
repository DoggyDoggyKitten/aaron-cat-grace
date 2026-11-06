import os
from dotenv import load_dotenv

load_dotenv()

# --- API Keys ---
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# --- DeepSeek ---
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"
DEEPSEEK_TEMPERATURE = 0.85
DEEPSEEK_MAX_TOKENS = 2048

# --- ElevenLabs ---
ELEVENLABS_MODEL = "eleven_v3"
ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128"

# --- Audio Assembly ---
SILENCE_BETWEEN_LINES_MS = 300
SILENCE_BETWEEN_JOKES_MS = 700
BACKGROUND_MUSIC_VOLUME_DBFS = -18
BACKGROUND_FADE_OUT_MS = 3000

# --- Output ---
OUTPUT_SCRIPT_DIR = "output/scripts"
OUTPUT_EPISODE_DIR = "output/episodes"
