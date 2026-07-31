# 05 — Python Flask Backend Pipeline

## Overview

The Python Flask backend (`backend/app.py`) is the processing engine of Weekie AI. It:
- Accepts video file uploads via REST API
- Spawns a background thread per job for non-blocking processing
- Reports live job progress via polling endpoint
- Serves completed captioned MP4 files for download

---

## Starting the Backend

```powershell
# Windows (run from project root)
cd backend
$env:PORT="8085"; .venv\Scripts\python app.py
```

Server starts on `http://localhost:8085` (configurable via `PORT` env var).

---

## Job Lifecycle State Machine

Every caption job goes through these states:

```
[UPLOAD RECEIVED]
        │
        ▼
  ┌──────────┐
  │  queued  │  Job created, video saved to temp dir
  └────┬─────┘
       │ Background thread starts
       ▼
  ┌──────────────┐
  │  processing  │
  │              │
  │  phase:      │
  │  transcribing│  ffprobe + faster-whisper running
  │  → burning   │  ASS file generated
  │  → finalizing│  ffmpeg subtitle burn
  └─────┬────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────────┐ ┌────────┐
│completed│ │ failed │
└─────────┘ └────────┘
```

### Progress Milestones

| Progress | Phase | What's Happening |
|----------|-------|-----------------|
| 5% | `transcribing` | Video probed (ffprobe), dimensions + duration extracted |
| 40% | `transcribing` | Whisper transcription complete |
| 50% | `burning` | ASS subtitle file generated |
| 90% | `finalizing` | FFmpeg subtitle burn-in complete |
| 100% | — | Job completed, temp files cleaned up |

---

## Backend Files

### `app.py` — Flask App Factory + Routes

The application is created via `create_app()` factory pattern:

```python
def create_app(testing: bool = False) -> Flask:
    app = Flask(__name__)
    CORS(app, origins=[frontend_url])  # Allow Next.js frontend
    # ... register routes
    return app
```

**Configuration from environment variables:**

| Env Var | Default | Purpose |
|---------|---------|---------|
| `MAX_FILE_SIZE_MB` | `500` | Max upload file size |
| `MAX_CONCURRENT_JOBS` | `2` | Max parallel processing jobs |
| `MAX_DURATION_MINUTES` | `30` | Max video duration |
| `FRONTEND_URL` | `http://localhost:3005` | CORS allowed origin |
| `PORT` | `8085` | Server port |
| `FLASK_DEBUG` | `false` | Debug mode |
| `WHISPER_MODEL_SIZE` | `base` | Whisper model |
| `WHISPER_DEVICE` | `cpu` | `cpu` or `cuda` |
| `WHISPER_COMPUTE_TYPE` | `int8` | `int8`, `float16`, etc. |

---

### `job_storage.py` — Job State Storage

Manages all job records in memory + JSON persistence:

```python
class JobStorage:
    def create_job(self, job_id, ...) -> dict
    def update_status(self, job_id, status, phase, progress, ...) -> dict
    def get_job(self, job_id) -> dict | None
    def list_jobs(self) -> list[dict]
    def delete_job(self, job_id) -> bool
```

Jobs are stored in:
- **Memory**: `dict` keyed by `job_id` (fast access)
- **Persistence**: `backend/data/jobs.json` (survives restarts)

---

### `caption_job.py` — Processing Pipeline

The main pipeline function runs in a background thread:

```python
def process_caption_job(storage, job_id, video_path, caption_style, caption_position, data_dir):
    # 1. probe_video(video_path) → width, height, duration
    # 2. transcribe_audio(video_path) → {"language": ..., "segments": [...]}
    # 3. generate_ass_from_transcript(...) → writes .ass file
    # 4. burn_subtitles(video_path, ass_path, output_path) → captioned.mp4
    # 5. cleanup temp files, mark completed
```

**Error handling**: Any exception in the pipeline is caught, logged, and stored in `error_message` field. The job transitions to `failed` state.

---

### `caption_styles.py` — Style Config

Loads `caption-styles.config.json` and creates Python dataclasses:

```python
@dataclass
class CaptionStyleConfig:
    id: str
    name: str
    font_name: str
    font_name_fallback: str
    font_size: int
    primary_color: str      # ASS &HAABBGGRR& format
    highlight_color: str
    outline_color: str
    shadow_color: str
    outline_size: float
    shadow_depth: float
    bold: bool
    italic: bool
    letter_spacing: float
    word_spacing: int
    animation_type: str     # "highlight", "karaoke", "scale", "bounce"
```

---

### `subtitles.py` — ASS File Generator

Core function: `generate_ass(transcript, clip_start, clip_end, output_path, **kwargs)`

Steps:
1. Loads style config + output format from shared JSON
2. Extracts and flattens word-level timestamps from transcript
3. Groups words into subtitle blocks (max 2 lines × max_chars each)
4. For each word, generates one ASS dialogue event with full-line text + active-word highlight
5. Saves `.ass` file via `pysubs2.SSAFile.save()`

---

### `subtitle_utils.py` — Language Helpers

| Function | Purpose |
|----------|---------|
| `is_latin_language(code)` | Returns True for Latin-script languages |
| `is_rtl_language(code)` | Returns True for Arabic/Hebrew/RTL languages |
| `get_subtitle_layout(lang, font_size)` | Returns (max_chars, font_scale) |
| `escape_ass_text(text)` | Escapes `{`, `}`, `\` for ASS format |
| `strip_emojis(text)` | Removes emoji characters that ASS can't render |

---

## File Storage Structure

```
backend/data/
├── jobs.json                    # Persisted job metadata
├── temp/
│   └── {job_id}/
│       ├── input.mp4            # Uploaded video (deleted after processing)
│       └── subtitles.ass        # Generated ASS file (deleted after burn)
└── output/
    └── {job_id}/
        └── captioned.mp4        # Final output video (served for download)
```

Temp files are cleaned up immediately after successful subtitle burn. Output files persist until the job is deleted via `DELETE /api/jobs/:id`.

---

## Concurrency Model

The backend uses Python `threading.Thread` for job processing:

```python
thread = threading.Thread(target=run, daemon=True)
thread.start()
```

- `daemon=True` means threads auto-terminate when Flask server stops
- `MAX_CONCURRENT_JOBS` limits parallel Whisper model loads to prevent memory exhaustion
- Jobs exceeding the limit return HTTP 429 "Server at capacity"

> **Note**: The GIL (Global Interpreter Lock) does not bottleneck here because Whisper's C++ CTranslate2 core releases the GIL during inference, and FFmpeg runs as a subprocess.
