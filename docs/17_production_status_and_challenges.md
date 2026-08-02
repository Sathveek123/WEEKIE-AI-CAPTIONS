# Weekie AI Captions - Production Status & Production Challenges

## 1. Summary of Completed Features

| Feature / Fix | Implementation Detail | Location |
| :--- | :--- | :--- |
| **Real Google OAuth 2.0** | Integrated Google Identity Services (GIS) SDK, JWT decoding, user session persistence, and custom Account Chooser modal. | [`frontend/src/components/google-auth-button.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/components/google-auth-button.tsx) |
| **Studio Route Guarding** | Gated `/studio` workspace, rendering an "Account Required" dialog for unauthenticated users, and profile dropdown in the header. | [`frontend/src/app/studio/page.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/app/studio/page.tsx) |
| **Indic & Telugu Subtitles** | Word-level multi-line wrapping (`wrap_indic_text` max 16 chars per line), Nirmala UI/Noto Sans font styling, and 4px stroke/2px shadow rendering. | [`backend/caption_job.py`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/backend/caption_job.py) |
| **Style Presets & Custom Overrides** | Dynamic color mappings for presets (MrBeast, Hormozi, etc.) and `_hex_to_ass_color` conversions for user custom overrides. | [`backend/caption_job.py`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/backend/caption_job.py) |
| **Vercel 4.5MB Payload Fix (413)** | Replaced Next.js server action uploads with direct browser-to-backend `fetch()` uploads, supporting large videos (up to 500MB). Removed Server Action fallback from upload catch block to completely bypass the 4.5MB Vercel Server Actions limit. | [`frontend/src/app/studio/page.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/app/studio/page.tsx) |
| **Vercel Route & RSC 404 Fix** | Removed redundant catch-all rewrites in `vercel.json` and added standard service mapping to avoid breaking `?_rsc=` Next.js prefetches. | [`vercel.json`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/vercel.json) |
| **Prisma Vercel Linux Fix** | Added `rhel-openssl` binaryTargets to `schema.prisma` and configured `prisma generate` to run inline during Vercel build phase. | [`frontend/prisma/schema.prisma`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/prisma/schema.prisma) |
| **Render Cold Start Handler** | Added `waitForBackend` health check loop (60s limit, 3s poll) in studio form to wake up backend instances before initiating uploads. | [`frontend/src/app/studio/page.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/app/studio/page.tsx) |
| **Robust Polling & Retries** | Updated polling loop to handle status completed/failed properly, retry up to 5 times on network errors, and abort with timeout after 10m. | [`frontend/src/components/processing-view.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/components/processing-view.tsx) |
| **Dynamic CORS Filtering** | Implemented regex origins pattern matching `localhost` and any Vercel domains (including previews) in Python Flask app. | [`backend/app.py`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/backend/app.py) |
| **File Expiration Code 410** | Updated `/api/download/<job_id>` and the client-side viewer to catch HTTP 410 Gone status and present a custom warning about ephemeral files. | [`frontend/src/components/caption-result-viewer.tsx`](file:///d:/Client%20Projects/video%20ai%20caption%20generator%20beta/ai-video-captions-main/frontend/src/components/caption-result-viewer.tsx) |

---

## 2. Technical Challenges & Limitations (What We Face in Production)

When running the video processing engine in a live cloud environment, we face several platform-specific challenges:

### ⏱️ Challenge 1: Render Free Tier Cold Starts
* **The Problem:** Render spins down free-tier instances after 15 minutes of inactivity. When a user clicks "Generate Captions" after a period of silence, the request hangs or times out while the backend takes 30-50 seconds to boot up.
* **Our Solution:** We added a `waitForBackend` helper that pings `/api/health` before uploading and shows `"Waking up AI engine... (this may take 30 seconds on first use)"` inside logs.

### 🧠 Challenge 2: CPU Transcription Latency (Whisper AI)
* **The Problem:** In production free-tier hosting (Render/Railway), the Whisper model runs on CPU rather than GPU. Transcribing audio on CPU takes roughly 0.5x to 1.0x of the video's actual duration.
* **Our Solution:** We configured the `faster-whisper` engine to run with `compute_type="float32"` on CPU and respect the `WHISPER_MODEL_SIZE` environment variable (set to `base` on Render free tier to prevent out-of-memory errors).

### 💾 Challenge 3: Serverless Database Persistence
* **The Problem:** Vercel functions are stateless and read-only. A local SQLite database file (`captions.db`) will reset every time a serverless function restarts or redeploys, resulting in lost job history.
* **Our Solution:** We prepared the database schema to support external SQL servers. For production, setting the `DATABASE_URL` in Vercel to a cloud Postgres instance (such as free tiers on Neon.tech or Supabase) ensures absolute data persistence.
