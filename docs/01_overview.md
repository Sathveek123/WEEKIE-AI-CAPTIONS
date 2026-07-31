# 01 — Project Overview & Architecture

## What Is Weekie AI Captions Generator?

**Weekie AI Captions Generator** is a self-hosted, privacy-first tool for burning animated, word-level subtitle captions into short-form video files (TikTok, Instagram Reels, YouTube Shorts). It combines:

- **Faster-Whisper AI** for ultra-fast speech-to-text transcription
- **ASS subtitle format** for per-word animated highlight overlays
- **FFmpeg** for professional-grade subtitle burn-in with lossless audio passthrough
- **Next.js 16** for a modern, white & orange SaaS-style frontend
- **Python Flask** as the REST API backend processing engine

---

## Core Goals

| Goal | Implementation |
|------|---------------|
| Viral subtitle styles | 6 curated presets: Hormozi, MrBeast, Karaoke, Minimal, Bounce, Classic |
| Zero watermarks | Self-hosted, no third-party logo injection |
| 100% data privacy | All processing is done on your own server/machine |
| 99+ language support | Whisper auto-detects language + script-aware font fallback |
| Word-level animation | Per-word ASS events with 4 animation types |
| Professional HD output | libx264 CRF 18, veryfast preset, audio stream-copied |

---

## System Architecture Map

```
┌────────────────────────────────────────────────┐
│               USER BROWSER                     │
│  http://localhost:3005  (Next.js 16 Frontend)  │
│                                                │
│  Pages: /  /studio  /login  /register          │
│         /history  /captions/[id]               │
└───────────────────┬────────────────────────────┘
                    │ Server Actions (Next.js)
                    │ HTTP POST/GET to :8085
                    ▼
┌────────────────────────────────────────────────┐
│           PYTHON FLASK BACKEND                 │
│  http://localhost:8085  (app.py)               │
│                                                │
│  POST /api/process   → Queue job + thread      │
│  GET  /api/status/:id → Poll job progress      │
│  GET  /api/download/:id → Stream output MP4   │
│  GET  /api/health    → Server health check     │
│  DELETE /api/jobs/:id → Delete job data        │
└───────────┬────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────┐
│          PROCESSING PIPELINE                   │
│                                                │
│  1. ffprobe → video dimensions + duration      │
│  2. faster-whisper → word-level transcript     │
│  3. subtitles.py → ASS subtitle file           │
│  4. ffmpeg → burn ASS into video (libx264)     │
│  5. cleanup temp files, mark completed         │
└───────────┬────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────┐
│          STORAGE LAYER                         │
│                                                │
│  backend/data/jobs.json   (job metadata)       │
│  backend/data/temp/:id/   (video + .ass files) │
│  backend/data/output/:id/ (captioned.mp4)      │
│                                                │
│  frontend/prisma/data/captions.db (SQLite)     │
│  (Prisma ORM — job records visible in /history)│
└────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| API Server | Python Flask | 3.x |
| CORS | flask-cors | latest |
| Speech AI | faster-whisper | latest |
| Subtitle Format | pysubs2 | latest |
| Video Processing | FFmpeg (system) | 8.0.1 |
| Job Storage | JSON file + in-memory dict | custom |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.1 |
| React | React | 19 |
| Language | TypeScript | 5.x |
| Bundler | Turbopack | built-in |
| Fonts | Google Fonts (Outfit, Inter) | CDN |
| ORM | Prisma | latest |
| Database | SQLite | file-based |
| CSS | Vanilla CSS + Tailwind v4 | latest |

---

## Directory Structure

```
ai-video-captions-main/
├── backend/                    # Python Flask API
│   ├── app.py                  # Flask app factory + routes
│   ├── caption_job.py          # Full pipeline (probe→transcribe→burn)
│   ├── caption_styles.py       # Style config dataclasses + color utils
│   ├── subtitles.py            # ASS generation + word-level events
│   ├── subtitle_utils.py       # Language/script detection helpers
│   ├── job_storage.py          # In-memory + JSON persistence layer
│   ├── caption-styles.config.json  # Shared style config (backend copy)
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Next.js 16 App
│   ├── src/app/                # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── studio/page.tsx     # Caption Studio workspace (/studio)
│   │   ├── login/page.tsx      # Sign In page (/login)
│   │   ├── register/page.tsx   # Register page (/register)
│   │   ├── history/page.tsx    # Project history (/history)
│   │   └── captions/[id]/      # Caption result viewer
│   ├── src/components/         # React components
│   ├── src/actions/            # Next.js server actions
│   ├── src/lib/                # Shared utilities
│   ├── src/types/              # TypeScript types
│   ├── prisma/schema.prisma    # SQLite schema
│   └── .env                    # Environment config
│
└── docs/                       # This documentation
```
