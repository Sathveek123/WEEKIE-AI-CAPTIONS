<p align="center">
  <h1 align="center">✨ Weekie AI Captions Generator</h1>
  <p align="center">
    <strong>Professional AI Video Caption & Subtitle Generator</strong><br/>
    Add trending, viral animated subtitles to any video — 6 styles, word-level animations, 100+ languages including full Telugu & Indic support.<br/>
    Real-Time Google OAuth 2.0 • 100% Mobile Responsive • Vercel Ready
  </p>
</p>

<p align="center">
  <a href="https://github.com/Sathveek123/WEEKIE-AI-CAPTIONS"><img src="https://img.shields.io/badge/GitHub-Repository-orange.svg" alt="GitHub Repo"></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Ready-black.svg" alt="Vercel Ready"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="docker-compose.yml"><img src="https://img.shields.io/badge/Docker-Ready-blue.svg" alt="Docker"></a>
</p>

---

## 🌟 Key Features

- **6 Trending Caption Styles** — `Hormozi`, `MrBeast`, `Karaoke`, `Minimal`, `Bounce`, `Classic` — inspired by top-performing TikTok, YouTube Shorts, and Instagram Reels.
- **Indic & Telugu Subtitle Engine** — Native multi-line word-wrapping (`wrap_indic_text`) for Telugu, Hindi, Bengali, Tamil, Kannada, and 99+ languages with Noto Sans Indic font embedding.
- **Real-Time Google OAuth 2.0** — Official Google Identity Services (GIS) SDK integration with JWT decoding, user session state, and `/studio` route protection.
- **Full Authentication Suite** — Dedicated `/login`, `/register`, and `/forgot-password` pages with account management.
- **100% Mobile Responsive** — Responsive drawer navigation, touch-friendly preset pickers, and auto-scaling iPhone 16 mockup preview for mobile (375px), tablet (768px), and desktop.
- **Live Phone Preview** — Drag-and-drop subtitle positioning on an interactive phone preview before rendering.
- **HD Video Export** — FFmpeg ASS subtitle burn-in preserving original audio quality.

---

## 🚀 Vercel & Cloud Deployment Guide

### 1. Deploying Frontend to Vercel

The Next.js frontend is 100% optimized for **Vercel**:

1. Import repository `https://github.com/Sathveek123/WEEKIE-AI-CAPTIONS` on [Vercel](https://vercel.com/new).
2. Set **Root Directory**: `frontend`.
3. Set **Framework Preset**: `Next.js`.
4. Configure Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google Cloud OAuth Web Client ID.
   - `NEXT_PUBLIC_BACKEND_URL`: URL of your deployed Python Flask AI Engine.
5. Click **Deploy**.

---

### 2. Deploying Python AI Engine Backend

The Python Flask backend (`backend/`) handles AI speech-to-text (Whisper) and FFmpeg video burn-in. Host it on a containerized or serverless Python provider:

- **Option A: Render / Railway / Fly.io (Docker Container)**:
  - Deploy using the root `docker-compose.yml` or `backend/Dockerfile`.
  - Expose port `8095` or set `PORT`.
- **Option B: Modal.com / AWS Lambda / GCP Cloud Run**:
  - Deploy GPU-accelerated Whisper transcription and FFmpeg rendering worker.

---

## 📚 Complete Documentation Index

| File | Description |
| :--- | :--- |
| [01_overview.md](./docs/01_overview.md) | Project Overview & Architecture Map |
| [02_whisper_engine.md](./docs/02_whisper_engine.md) | Faster-Whisper Speech Engine |
| [03_caption_styles.md](./docs/03_caption_styles.md) | 6 Caption Styles & Custom Overrides |
| [04_ass_subtitle_engine.md](./docs/04_ass_subtitle_engine.md) | ASS Subtitle Generation |
| [05_backend_pipeline.md](./docs/05_backend_pipeline.md) | Flask Backend API Pipeline |
| [07_api_reference.md](./docs/07_api_reference.md) | Complete REST API Reference |
| [08_ffmpeg_rendering.md](./docs/08_ffmpeg_rendering.md) | FFmpeg Subtitle Burn-In Engine |
| [09_language_support.md](./docs/09_language_support.md) | 99+ Supported Languages & Fonts |
| [14_google_oauth_and_authentication.md](./docs/14_google_oauth_and_authentication.md) | Real Google OAuth 2.0 & Route Guarding |
| [15_indic_and_telugu_caption_engine.md](./docs/15_indic_and_telugu_caption_engine.md) | Indic & Telugu Word Wrapping & YouTube Shorts Typography |
| [16_mobile_responsiveness_and_ui.md](./docs/16_mobile_responsiveness_and_ui.md) | Mobile Responsive Layout & UI System |
| [17_production_status_and_challenges.md](./docs/17_production_status_and_challenges.md) | Production Deployments, Feature Overview & Deployment Limitations |

---

## 💻 Local Development

```powershell
# 1. Start Python Backend
cd backend
.venv\Scripts\python app.py

# 2. Start Next.js Frontend
cd frontend
npm run dev
```

- **Frontend**: `http://localhost:3010`
- **Backend**: `http://localhost:8095`
- **GitHub**: [https://github.com/Sathveek123/WEEKIE-AI-CAPTIONS](https://github.com/Sathveek123/WEEKIE-AI-CAPTIONS)
