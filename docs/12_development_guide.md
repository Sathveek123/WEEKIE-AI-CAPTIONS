# 12 — Development Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| FFmpeg | 8.x | Video processing (with libass) |
| Git | any | Version control |

---

## Starting Everything Locally

### 1. Start the Python Flask Backend (Port 8085)

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.venv\Scripts\activate

# Start Flask on port 8085
$env:PORT="8085"
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:8085
 * Running on http://10.x.x.x:8085
Press CTRL+C to quit
```

### 2. Start the Next.js Frontend (Port 3005)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Expected output:
```
▲ Next.js 16.2.1 (Turbopack)
- Local: http://localhost:3005
✓ Ready in 1.2s
```

---

## Environment Configuration

### `frontend/.env`

```env
BACKEND_URL=http://localhost:8085
NEXT_PUBLIC_BACKEND_URL=http://localhost:8085
DATABASE_URL=file:./data/captions.db
```

> ⚠️ **Important**: `BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL` must point to `localhost:8085`.  
> The old value `172.30.84.39:5000` was a stale WSL network IP that caused "fetch failed" errors.

### Backend Environment Variables

Set via PowerShell `$env:VAR="value"` or in a `.env` file:

```powershell
$env:PORT="8085"                      # Server port (REQUIRED for this project)
$env:WHISPER_MODEL_SIZE="base"        # "tiny", "base", "small", "medium", "large-v2"
$env:WHISPER_DEVICE="cpu"             # "cpu" or "cuda" (GPU)
$env:WHISPER_COMPUTE_TYPE="int8"      # "int8" (CPU) or "float16" (GPU)
$env:MAX_FILE_SIZE_MB="500"           # Max upload size in MB
$env:MAX_CONCURRENT_JOBS="2"         # Parallel processing threads
$env:MAX_DURATION_MINUTES="30"       # Max video duration
$env:FRONTEND_URL="http://localhost:3005"  # CORS origin
```

---

## Port Conflict Resolution

### Problem: Port 5000 Already in Use

Two projects are running on this machine, and port 5000 is occupied. **Always use port 8085** for Weekie AI backend.

### Checking What's on a Port

```powershell
netstat -ano | findstr ":5000"
netstat -ano | findstr ":8085"
netstat -ano | findstr ":3005"
```

### Killing a Process by PID

```powershell
taskkill /PID 12345 /F
```

---

## Database Setup & Reset

The frontend uses **Prisma** with **SQLite** for job metadata:

```powershell
cd frontend

# Generate Prisma client
npx prisma generate

# Push schema to SQLite (creates data/captions.db)
npx prisma db push

# View database in browser UI
npx prisma studio

# Reset database (delete all jobs)
Remove-Item -Path ".\data\captions.db" -Force
npx prisma db push
```

---

## Backend Virtual Environment

The Python virtual environment is in `backend/.venv`:

```powershell
# Activate
backend\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Deactivate
deactivate
```

### `requirements.txt`

```
flask
flask-cors
faster-whisper
pysubs2
```

---

## Development Tips

### Frontend Hot Reload

Next.js with Turbopack hot-reloads instantly on file save. No manual restart needed.

### Backend Restart Required

Flask backend does NOT hot-reload by default (debug mode is off). If you change `app.py`, `caption_job.py`, or `subtitles.py`, you must stop and restart Flask:
- `Ctrl+C` to stop
- `$env:PORT="8085"; python app.py` to restart

### Checking Backend Logs

Flask prints all request logs to the terminal. Look for:
```
127.0.0.1 - - [21/Jul/2026] "POST /api/process HTTP/1.1" 200 -
127.0.0.1 - - [21/Jul/2026] "GET /api/status/abc123 HTTP/1.1" 200 -
```

### Whisper Model Download

The first time Whisper is used, it auto-downloads the model file:
- `base` model: ~150MB
- `large-v2` model: ~3GB

Models are cached in `~/.cache/huggingface/hub/` on Windows.

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Studio Error: fetch failed` | Flask not running on port 8085 | Start Flask with `$env:PORT="8085"; python app.py` |
| `Studio Error: fetch failed` | `.env` has wrong IP | Set `BACKEND_URL=http://localhost:8085` |
| `Port 3005 in use` | Another Next.js instance running | `taskkill /PID <old_pid> /F` then `npm run dev` |
| `ffmpeg not found` | FFmpeg not on PATH | Download from gyan.dev and add to Windows PATH |
| `libass font not found` | Caption font not installed | Install Montserrat, Bebas Neue, Bangers, Anton from Google Fonts |
| `Whisper model download stuck` | Network timeout | Check internet connection, retry |
| `Database error` | Prisma schema not pushed | Run `npx prisma db push` in `frontend/` |
| `CORS error in browser` | `FRONTEND_URL` mismatch | Set `$env:FRONTEND_URL="http://localhost:3005"` |

---

## Running Tests

```powershell
cd backend
.venv\Scripts\python -m pytest tests/ -v
```

Tests are in `backend/tests/`. They mock FFmpeg and Whisper to run fast without actual video processing.
