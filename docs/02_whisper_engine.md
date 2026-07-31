# 02 — Faster-Whisper AI Speech Engine

## What Is Faster-Whisper?

**Faster-Whisper** is a high-performance reimplementation of OpenAI's Whisper speech-to-text model using the **CTranslate2** inference engine. It delivers identical transcription accuracy as original Whisper but at **4× the speed** with significantly lower memory usage.

Weekie AI uses Faster-Whisper to:
1. Automatically detect spoken language in the uploaded video
2. Transcribe every spoken word into text
3. Generate **word-level timestamps** (exact start/end time for every word)
4. Return structured segment data used to create per-word animated subtitle events

---

## How It Works Inside Weekie AI

### Entry Point — `caption_job.py`

```python
def transcribe_audio(video_path: str) -> dict:
    from faster_whisper import WhisperModel

    whisper_device = os.environ.get("WHISPER_DEVICE", "cpu")
    whisper_compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

    model = WhisperModel(model_size, device=whisper_device, compute_type=whisper_compute_type)
    segments_iter, info = model.transcribe(video_path, word_timestamps=True)
```

The key parameter is `word_timestamps=True` — this forces Whisper to align each word to a precise millisecond timestamp, enabling frame-accurate subtitle animation.

### Output Structure

```python
{
    "language": "en",           # Detected language code
    "segments": [
        {
            "start": 0.0,       # Segment start (seconds)
            "end": 3.2,         # Segment end (seconds)
            "text": "Hello world",
            "words": [
                {"word": " Hello", "start": 0.0,  "end": 0.6},
                {"word": " world", "start": 0.7,  "end": 1.2},
            ]
        },
        ...
    ]
}
```

---

## Whisper Model Sizes

The model size is controlled via environment variable `WHISPER_MODEL_SIZE` (default: `base`):

| Model | Params | VRAM | Speed | Accuracy | Best For |
|-------|--------|------|-------|----------|---------|
| `tiny` | 39M | ~1GB | Fastest | Lower | Quick demos |
| `base` | 74M | ~1GB | Fast | Good | **Default — balanced** |
| `small` | 244M | ~2GB | Medium | Better | Good multilingual |
| `medium` | 769M | ~5GB | Slower | High | Accented speech |
| `large` | 1550M | ~10GB | Slow | Best | Max accuracy |
| `large-v2` | 1550M | ~10GB | Slow | Best+ | Recommended for production |
| `large-v3` | 1550M | ~10GB | Slow | Best++ | Latest flagship model |

### Override Model Size

```powershell
# Windows PowerShell
$env:WHISPER_MODEL_SIZE="small"; .venv\Scripts\python app.py
```

```bash
# Linux / macOS
WHISPER_MODEL_SIZE=large-v2 python app.py
```

---

## Hardware Acceleration

### CPU Mode (Default)

```python
model = WhisperModel("base", device="cpu", compute_type="int8")
```

- `int8` quantization reduces memory usage by 4× with minimal accuracy loss
- Works on any machine without GPU
- Typically 10–60 seconds per minute of audio

### CUDA GPU Mode

```python
model = WhisperModel("large-v2", device="cuda", compute_type="float16")
```

- Requires NVIDIA GPU with CUDA drivers
- `float16` on GPU for maximum speed
- Override via env var: `WHISPER_DEVICE=cuda WHISPER_COMPUTE_TYPE=float16`

### Automatic CPU Fallback

```python
try:
    model = WhisperModel(size, device=whisper_device, compute_type=whisper_compute_type)
except Exception as exc:
    if whisper_device != "cpu":
        logger.warning("Falling back to CPU: %s", exc)
        model = WhisperModel(size, device="cpu", compute_type="int8")
```

If the configured device fails (e.g., no GPU), the system automatically falls back to CPU.

---

## Language Detection

Whisper automatically detects the spoken language from the first ~30 seconds of audio. No manual language selection is needed.

The detected language code (e.g. `"en"`, `"hi"`, `"zh"`) is:
1. Stored in the job record (`language` field)
2. Passed to `subtitles.py` for script-aware font selection (Latin vs CJK vs RTL)
3. Shown in the job result card in `/history`

---

## 99 Supported Languages (Whisper Detected)

Whisper was trained on 680,000+ hours of multilingual audio and supports 99 languages:

| Code | Language | Code | Language | Code | Language |
|------|----------|------|----------|------|----------|
| `af` | Afrikaans | `ar` | Arabic | `hy` | Armenian |
| `az` | Azerbaijani | `be` | Belarusian | `bs` | Bosnian |
| `bg` | Bulgarian | `ca` | Catalan | `zh` | Chinese |
| `hr` | Croatian | `cs` | Czech | `da` | Danish |
| `nl` | Dutch | `en` | English | `et` | Estonian |
| `fi` | Finnish | `fr` | French | `gl` | Galician |
| `de` | German | `el` | Greek | `he` | Hebrew |
| `hi` | Hindi | `hu` | Hungarian | `is` | Icelandic |
| `id` | Indonesian | `it` | Italian | `ja` | Japanese |
| `kn` | Kannada | `kk` | Kazakh | `ko` | Korean |
| `lv` | Latvian | `lt` | Lithuanian | `mk` | Macedonian |
| `ms` | Malay | `mr` | Marathi | `mi` | Maori |
| `ne` | Nepali | `no` | Norwegian | `fa` | Persian |
| `pl` | Polish | `pt` | Portuguese | `ro` | Romanian |
| `ru` | Russian | `sr` | Serbian | `sk` | Slovak |
| `sl` | Slovenian | `es` | Spanish | `sw` | Swahili |
| `sv` | Swedish | `tl` | Tagalog | `ta` | Tamil |
| `th` | Thai | `tr` | Turkish | `uk` | Ukrainian |
| `ur` | Urdu | `vi` | Vietnamese | `cy` | Welsh |
| `yi` | Yiddish | ... | *45 more* | | |

> **Note**: Whisper's language detection accuracy is highest for English and major European languages, and very good for Hindi, Arabic, Japanese, Chinese, and Korean. For smaller languages, `large-v3` is recommended.

---

## Performance Benchmarks (Approximate)

All benchmarks on a 60-second MP4 clip using `base` model:

| Device | Compute Type | Time |
|--------|-------------|------|
| CPU (Intel i7) | int8 | ~25–45 seconds |
| CPU (AMD Ryzen 9) | int8 | ~20–35 seconds |
| GPU (RTX 3060) | float16 | ~4–8 seconds |
| GPU (RTX 4090) | float16 | ~1–3 seconds |

---

## Word Timestamp Accuracy

Faster-Whisper uses **Dynamic Time Warping (DTW)** alignment to compute word-level timestamps. Accuracy is typically:

- **±50ms** for clear speech in English
- **±100ms** for accented or fast speech
- **±150ms** for noisy audio

This sub-second precision is what enables the per-word karaoke-style animation in ASS subtitle events.
