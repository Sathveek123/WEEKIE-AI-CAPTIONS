# Weekie AI Captions Generator — Documentation Index

Welcome to the complete documentation for **Weekie AI Captions Generator**. This documentation is organized across multiple files — one topic per file so each subject is covered in full depth.

---

## 📚 Documentation Files

| File | Topic |
| :--- | :--- |
| [01_overview.md](./01_overview.md) | Project Overview, Goals & Architecture Map |
| [02_whisper_engine.md](./02_whisper_engine.md) | Faster-Whisper AI Speech Engine — Models, Languages, Internals |
| [03_caption_styles.md](./03_caption_styles.md) | All 6 Caption Styles — Config, Colors, Animation Types |
| [04_ass_subtitle_engine.md](./04_ass_subtitle_engine.md) | ASS Subtitle Generation — Format, Word Timestamps, Multi-line |
| [05_backend_pipeline.md](./05_backend_pipeline.md) | Python Flask Backend — Job Lifecycle, API Endpoints, Storage |
| [07_api_reference.md](./07_api_reference.md) | Complete REST API Reference (updated to port 8095) |
| [08_ffmpeg_rendering.md](./08_ffmpeg_rendering.md) | FFmpeg Video Processing — Probe, Burn-in, Quality Settings |
| [09_language_support.md](./09_language_support.md) | 99+ Supported Languages, Script Detection, Font Fallbacks |
| [12_development_guide.md](./12_development_guide.md) | Running Locally, Port Config, Dev Workflow, Debugging |
| [13_custom_fixes_and_port_conflict_resolution.md](./13_custom_fixes_and_port_conflict_resolution.md) | Accuracy Tuning, VAD/Urdu repetitions, Alternative Port Configs |
| [14_google_oauth_and_authentication.md](./14_google_oauth_and_authentication.md) | Real Google OAuth 2.0, GIS SDK, JWT Decoding & Route Protection |
| [15_indic_and_telugu_caption_engine.md](./15_indic_and_telugu_caption_engine.md) | Indic & Telugu Word Wrapping, Noto Sans Fonts & YouTube Shorts Style |
| [16_mobile_responsiveness_and_ui.md](./16_mobile_responsiveness_and_ui.md) | Mobile-First Responsive Breakpoints, Drawer Nav & Studio Layout |

---

## Quick Start Reference

```
Backend  (Python Flask):  http://localhost:8095
Frontend (Next.js):       http://localhost:3010
Database (SQLite):        frontend/prisma/data/captions.db
```

Start backend:
```powershell
cd backend
.venv\Scripts\python app.py
```

Start frontend:
```powershell
cd frontend
npm run dev
```
