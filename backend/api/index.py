"""
Vercel Python Serverless Entry Point for Weekie AI Captions Backend.

IMPORTANT DEPLOYMENT NOTE:
==========================
Vercel serverless functions have the following constraints:
  - Max execution time: 10s (Hobby) / 60s (Pro) / 900s (Enterprise)
  - Max function size: 50MB (cannot include faster-whisper or FFmpeg binaries)
  - No persistent filesystem (video files cannot be stored between requests)
  - No background threads (processing jobs run synchronously only)

Because of these constraints, the following endpoints are available on Vercel:
  ✅ GET  /api/health        — Health check
  ✅ GET  /api/status/<id>   — Job status lookup (from DB)
  ✅ DELETE /api/jobs/<id>   — Delete a job
  ⚠️ POST /api/process       — Video upload & AI processing
     → Requires an external backend with FFmpeg + Whisper (see below)

RECOMMENDED ARCHITECTURE FOR VERCEL:
  Frontend  → Vercel (Next.js)
  Backend   → Render / Railway / Fly.io / Modal (Docker with FFmpeg + Whisper)
  Database  → Neon / Supabase / PlanetScale (Postgres)

Set NEXT_PUBLIC_BACKEND_URL in Vercel Environment Variables to point to
your external backend URL (e.g. https://weekie-backend.onrender.com).
"""

import sys
import os

# Add backend root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

# Vercel looks for a variable named `app` or `application`
app = create_app()
application = app
