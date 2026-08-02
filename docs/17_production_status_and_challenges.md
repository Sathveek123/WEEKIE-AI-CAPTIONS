# Weekie AI Captions - Production Status & Production Challenges

## 1. Summary of Completed Features

| Feature / Fix | Implementation Detail | Location |
| :--- | :--- | :--- |
| **Real Google OAuth 2.0** | Integrated Google Identity Services (GIS) SDK, JWT decoding, user session persistence, and custom Account Chooser modal. | [`frontend/src/components/google-auth-button.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/components/google-auth-button.tsx) |
| **Studio Route Guarding** | Gated `/studio` workspace, rendering an "Account Required" dialog for unauthenticated users, and profile dropdown in the header. | [`frontend/src/app/studio/page.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/app/studio/page.tsx) |
| **Indic & Telugu Subtitles** | Word-level multi-line wrapping (`wrap_indic_text` max 16 chars per line), Nirmala UI/Noto Sans font styling, and 4px stroke/2px shadow rendering. | [`backend/caption_job.py`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/backend/caption_job.py) |
| **Style Presets & Custom Overrides** | Dynamic color mappings for presets (MrBeast, Hormozi, etc.) and `_hex_to_ass_color` conversions for user custom overrides. | [`backend/caption_job.py`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/backend/caption_job.py) |
| **Vercel 4.5MB Payload Fix (413)** | Replaced Next.js server action uploads with direct browser-to-backend `fetch()` uploads, supporting large videos (up to 500MB). | [`frontend/src/app/studio/page.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/app/studio/page.tsx) |
| **Vercel Route & RSC 404 Fix** | Removed redundant catch-all rewrites in `vercel.json` and added standard service mapping to avoid breaking `?_rsc=` Next.js prefetches. | [`vercel.json`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/vercel.json) |
| **Prisma Vercel Linux Fix** | Added `rhel-openssl` binaryTargets to `schema.prisma` and configured `prisma generate` to run inline during Vercel build phase. | [`frontend/prisma/schema.prisma`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/prisma/schema.prisma) |

---

## 2. Technical Challenges & Limitations (What We Face in Production)

When running the video processing engine in a live cloud environment, we face several platform-specific challenges:

### ⏱️ Challenge 1: Render Free Tier Cold Starts
* **The Problem:** Render spins down free-tier instances after 15 minutes of inactivity. When a user clicks "Generate Captions" after a period of silence, the request hangs or times out while the backend takes 30-50 seconds to boot up.
* **Our Solution:** We modified the frontend to immediately show the `ProcessingView` with an active loading phase indicator: `"Connecting to AI Engine (Waking up cloud server)..."`. This keeps the user informed and prevents them from refreshing or navigating away during a cold start.

### 🧠 Challenge 2: CPU Transcription Latency (Whisper AI)
* **The Problem:** In production free-tier hosting (Render/Railway), the Whisper model runs on CPU rather than GPU. Transcribing audio on CPU takes roughly 0.5x to 1.0x of the video's actual duration (e.g., a 1-minute video takes 30-60 seconds just to transcribe).
* **Our Solution:** We configured the `faster-whisper` engine to run with `compute_type="float32"` on CPU and chunk long audio files into 5-minute intervals to process speech efficiently. For optimal production scaling, hosting the backend on a GPU-enabled instance (like [Modal.com](https://modal.com) or a dedicated GPU VPS) is recommended.

### 🎬 Challenge 3: CPU-Bound FFmpeg Subtitle Burn-In
* **The Problem:** Overlaying complex ASS animations (Karaoke wipes, scale bounces) requires rendering each video frame individually. On standard cloud CPU instances, FFmpeg frame processing is heavy and adds another 10-30 seconds of processing time.
* **Our Solution:** We optimized the FFmpeg filter chain and compressed the temporary ASS files to keep frame processing as light as possible.

### 💾 Challenge 4: Serverless Database Persistence
* **The Problem:** Vercel functions are stateless and read-only. A local SQLite database file (`captions.db`) will reset every time a serverless function restarts or redeploys, resulting in lost job history.
* **Our Solution:** We prepared the database schema to support external SQL servers. For production, setting the `DATABASE_URL` in Vercel to a cloud Postgres instance (such as free tiers on Neon.tech or Supabase) ensures absolute data persistence.
