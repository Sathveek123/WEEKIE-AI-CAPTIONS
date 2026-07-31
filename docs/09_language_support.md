# 09 — Language Support

## Overview

Weekie AI Captions Generator supports **99+ languages** through OpenAI's Whisper AI model. Language detection is fully automatic — users never need to manually select their language.

The system additionally detects the **script family** (Latin, CJK, RTL, Devanagari, etc.) of the detected language to apply script-appropriate:
- Font family selection (primary vs fallback)
- Font scale adjustments
- Max characters per subtitle line
- RTL text direction handling

---

## How Language Detection Works

When Whisper processes the audio, it analyzes the first ~30 seconds and outputs a language code:

```python
segments_iter, info = model.transcribe(video_path, word_timestamps=True)
# info.language → e.g. "en", "hi", "zh", "ar"
```

This code is stored in the job record and used by `subtitles.py`:

```python
language = transcript.get("language", "en")
is_latin = is_latin_language(language)   # font selection
is_rtl = is_rtl_language(language)       # animation direction
max_chars, font_scale = get_subtitle_layout(language, style.font_size)
```

---

## Script Family Detection

### `is_latin_language(code)` — `subtitle_utils.py`

Returns `True` for languages that use the Latin alphabet. Latin languages use the **primary font** (Montserrat, Bebas Neue, Bangers, Anton). Non-Latin languages fall back to **IBM Plex Sans** which has better Unicode coverage.

**Latin-script languages include:** English, French, German, Spanish, Portuguese, Italian, Dutch, Polish, Czech, Romanian, Turkish, Indonesian, Malay, Vietnamese, Swahili, and all other European/African/Latin-alphabet languages.

### `is_rtl_language(code)` — `subtitle_utils.py`

Returns `True` for Right-to-Left languages. RTL languages affect:
- Karaoke animation direction (RTL uses `highlight` instead of `\kf` wipe)
- Word ordering in subtitle line building
- pysubs2 text rendering direction

**RTL languages:** Arabic (`ar`), Hebrew (`he`), Yiddish (`yi`), Farsi/Persian (`fa`), Urdu (`ur`)

---

## All 99 Supported Languages

### European Languages

| Code | Language | Script | Notes |
|------|----------|--------|-------|
| `en` | English | Latin | Best accuracy |
| `fr` | French | Latin | Excellent |
| `de` | German | Latin | Excellent |
| `es` | Spanish | Latin | Excellent |
| `pt` | Portuguese | Latin | Excellent |
| `it` | Italian | Latin | Excellent |
| `nl` | Dutch | Latin | Excellent |
| `pl` | Polish | Latin | Very good |
| `ru` | Russian | Cyrillic | Good |
| `uk` | Ukrainian | Cyrillic | Good |
| `bg` | Bulgarian | Cyrillic | Good |
| `cs` | Czech | Latin | Good |
| `sk` | Slovak | Latin | Good |
| `ro` | Romanian | Latin | Good |
| `hu` | Hungarian | Latin | Good |
| `sv` | Swedish | Latin | Good |
| `no` | Norwegian | Latin | Good |
| `da` | Danish | Latin | Good |
| `fi` | Finnish | Latin | Good |
| `el` | Greek | Greek | Good |
| `hr` | Croatian | Latin | Good |
| `sr` | Serbian | Cyrillic/Latin | Good |
| `bs` | Bosnian | Latin | Good |
| `mk` | Macedonian | Cyrillic | Good |
| `sl` | Slovenian | Latin | Good |
| `lv` | Latvian | Latin | Good |
| `lt` | Lithuanian | Latin | Good |
| `et` | Estonian | Latin | Good |
| `is` | Icelandic | Latin | Moderate |
| `gl` | Galician | Latin | Moderate |
| `ca` | Catalan | Latin | Moderate |
| `cy` | Welsh | Latin | Moderate |
| `be` | Belarusian | Cyrillic | Moderate |

### Asian Languages

| Code | Language | Script | Notes |
|------|----------|--------|-------|
| `zh` | Chinese | CJK | Simplified & Traditional |
| `ja` | Japanese | CJK + Kana | Excellent |
| `ko` | Korean | Hangul | Excellent |
| `hi` | Hindi | Devanagari | Very good |
| `th` | Thai | Thai | Good |
| `vi` | Vietnamese | Latin+tones | Good |
| `id` | Indonesian | Latin | Good |
| `ms` | Malay | Latin | Good |
| `tl` | Tagalog | Latin | Good |
| `kk` | Kazakh | Cyrillic | Moderate |
| `mr` | Marathi | Devanagari | Moderate |
| `ne` | Nepali | Devanagari | Moderate |
| `kn` | Kannada | Kannada script | Moderate |

### Middle Eastern Languages (RTL)

| Code | Language | Script | Direction |
|------|----------|--------|-----------|
| `ar` | Arabic | Arabic | RTL ← |
| `he` | Hebrew | Hebrew | RTL ← |
| `fa` | Persian/Farsi | Arabic | RTL ← |
| `ur` | Urdu | Arabic-Urdu | RTL ← |
| `yi` | Yiddish | Hebrew | RTL ← |

### African Languages

| Code | Language | Script |
|------|----------|--------|
| `sw` | Swahili | Latin |
| `af` | Afrikaans | Latin |
| `mi` | Maori | Latin |

### Other Languages

| Code | Language |
|------|----------|
| `az` | Azerbaijani |
| `hy` | Armenian |
| `ka` | Georgian |
| `km` | Khmer |
| `lo` | Lao |
| `my` | Burmese/Myanmar |
| `si` | Sinhala |
| `gu` | Gujarati |
| `pa` | Punjabi |
| `bn` | Bengali |
| `ta` | Tamil |
| `te` | Telugu |
| `ml` | Malayalam |
| `jw` | Javanese |
| `su` | Sundanese |

---

## Font Fallback for Non-Latin Scripts

When a non-Latin language is detected (e.g., Hindi, Arabic, Chinese), the caption style switches to the fallback font:

```python
if is_latin_language(language):
    new_style.fontname = style_config.font_name          # "Montserrat"
else:
    new_style.fontname = style_config.font_name_fallback  # "IBM Plex Sans"
```

**IBM Plex Sans** (the universal fallback) has excellent Unicode coverage including:
- Devanagari (Hindi, Marathi, Nepali)
- Cyrillic (Russian, Ukrainian, Bulgarian)
- Greek
- Hebrew
- Korean (Hangul)

For CJK and Arabic, FFmpeg's `libass` + system fonts provide additional fallback rendering.

---

## Translation Capabilities

Weekie AI Captions Generator provides full translation capabilities exposed directly in the UI dropdown:

### 1. English Translation via Whisper Core (`task="translate"`)

When **"English — Direct Whisper AI Translation (task='translate')"** is selected in the UI:
```python
# In caption_job.py transcribe_audio():
if translate and target_language == "en":
    transcribe_opts["task"] = "translate"
```
Whisper natively translates speech from any of the 99+ supported languages into English text while extracting word-level timestamps.

### 2. Indian Language Translation Path (`deep_translator`)

When an Indian language target is selected (e.g. **Telugu**, **Hindi**, **Tamil**, **Kannada**, **Malayalam**, **Bengali**, **Gujarati**, **Punjabi**, **Marathi**):
- Audio is transcribed in its spoken source language with precise word timestamps.
- Text segments are translated into the target Indian language using HTML-tagged batching with rate-limiting backoff (`deep_translator.GoogleTranslator`).
- Word timestamps are dynamically redistributed across translated words to maintain synchronized caption highlight timing.

