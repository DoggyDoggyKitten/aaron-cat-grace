# Three hosts: Aaron, Grace, Cat
# Fill in voice_id from your ElevenLabs dashboard before running.
#
# Voice selection tips:
#   Aaron → search "young male energetic" in ElevenLabs voice library
#   Grace → search "mature female calm"
#   Cat   → search "older calm narrator"

CHARACTERS = {
    "Aaron": {
        "voice_id": "DVE92KG0Yd4X7RoMqy8J",
        "stability": 0.7,
        "similarity_boost": 0.75,
    },
    "Grace": {
        "voice_id": "9DMBSOAnMDPiFAsz1ZGK",
        "stability": 0.8,
        "similarity_boost": 0.80,
    },
    "Cat": {
        "voice_id": "auoHciLZJwKTwYUoRTYz",
        "stability": 0.6,
        "similarity_boost": 0.75,
    },
}

# Order in which hosts tell their jokes each episode
SPEAKER_ORDER = ["Aaron", "Grace", "Cat"]
