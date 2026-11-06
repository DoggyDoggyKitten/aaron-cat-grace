# Aaron Cat and Grace — Project TODO

## Project Vision
A public website called **Aaron Cat and Grace** where:
- Users can browse and listen to all published episodes
- Users can submit 3 jokes to automatically generate a new episode
- Three AI hosts (Aaron, Cat, Grace) with distinct personalities discuss Chinese puns (谐音梗)

---

## Hosts
| Host | Age | Gender | Personality | Role in episode |
|------|-----|--------|-------------|-----------------|
| Aaron | 20-30 | Male | Energetic, passionate, uses Gen-Z slang | Tells jokes enthusiastically |
| Grace | 30-40 | Female | Dry humour, cold, sarcastic | Deadpan roasts |
| Cat | 40-50 | Cat | Wise, philosophical, master of puns | Tells puns + life lessons |

---

## Current Tech Stack
- **LLM**: DeepSeek V3 (`deepseek-chat`)
- **TTS**: ElevenLabs (`eleven_v3`)
- **Audio mixing**: PyDub + FFmpeg
- **Language**: Python

---

## Completed ✅

### Module 2: Script Generation
- [x] DeepSeek V3 API integration
- [x] System prompt with 3 host personalities
- [x] Structured JSON output (speaker / text / emotion / segment)
- [x] Intro segment: each host introduces themselves at the start of every episode
- [x] Natural conversation rules (interruptions, short reactions, no strict turn-taking)
- [x] Emotion expression rules (no "哈哈哈", use words instead)
- [x] Ban ellipsis (`...` / `……`) from scripts
- [x] Podcast name changed to《Aaron Cat and Grace》
- [x] `test_script.py` for testing script generation without audio

### Module 3: Audio Generation
- [x] ElevenLabs TTS integration (3 voices)
- [x] Volume normalization across all voices (-16 dBFS)
- [x] Silence trimming from TTS output (removes leading/trailing silence)
- [x] Background music mixing support
- [x] Timestamp-based output filenames (no overwriting)
- [x] Ellipsis characters stripped before sending to TTS

### Joke Library
- [x] YAML-based joke library (`data/jokes/joke_library.yaml`)
- [x] 3 user-submitted jokes added:
  - 孙悟空 + 榴莲 (周华健《花心》谐音)
  - 蚂蚁四种笑声 (Beyond《光辉岁月》谐音)
  - 中蒜谈恋爱 (梁静茹《勇气》谐音)

---

## In Progress / Next Steps

### Module 1: Joke Input Interface
- [ ] Build a simple **web form** for submitting jokes (setup / punchline / homophone note / host)
- [ ] Decide on tech: Streamlit (simplest) or full website

### Module 4: Publishing & Review
- [ ] Generate video for YouTube:
  - [ ] Static cover image + audio → MP4 via FFmpeg
  - [ ] **Kinetic typography effect**: coloured lyrics appear line by line as audio plays
    - Aaron → orange
    - Grace → blue
    - Cat → green
  - [ ] Requires timestamp tracking per audio line in `audio_generator.py`
- [ ] Review flow: generate episode → notify user → user listens → user approves → publish
- [ ] YouTube Data API integration for auto-upload
  - Note: new Google Cloud accounts need quota approval for public uploads

### Automation
- [ ] Scheduled episode generation (e.g. daily/weekly via cron or GitHub Actions)
- [ ] Auto joke selection from library (pick unused jokes, one per host)

---

## Future: Full Public Website
**Concept**: anyone can visit the site, listen to episodes, and submit 3 jokes to generate a new episode.

### Key decisions to make:
- [ ] Who can submit jokes? (open to public / moderated / private)
- [ ] Generation UX: wait in real-time (~2-3 min) or async queue with notification?
- [ ] Tech stack for website (frontend + backend)
- [ ] Hosting platform

---

## Known Issues / Improvements
- [ ] ElevenLabs Chinese TTS naturalness could be improved — consider switching to Azure TTS or 火山引擎 for better Chinese quality
- [ ] DeepSeek occasionally wraps JSON in markdown code blocks (handled by retry logic)
- [ ] Joke library jokes 001-005 are placeholder quality — replace with better jokes
