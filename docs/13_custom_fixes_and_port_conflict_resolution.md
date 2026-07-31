# 13 — Custom Fixes & Port Conflict Resolution

This document details the diagnostic audits, custom algorithmic fixes, and port mapping adjustments implemented to optimize transcription accuracy, prevent CPU timeouts, and run conflict-free on multiple local environments.

---

## 1. Accuracy & Audio Calibration Fixes

### Voice Activity Detection (VAD) for Kannada Dropout
- **Problem**: Kannada audio samples registered high ambient noise and soft speech, resulting in `no_speech_prob` values between `0.74` and `0.75` across the entire clip. Whisper's default filters silently dropped these segments, producing only 2 raw segments for a 45-second clip.
- **Solution**: Enabled Voice Activity Detection (`vad=True` / `vad_filter=True`) in the Whisper model call with tuned parameters:
  - `threshold=0.25`
  - `min_speech_duration_ms=150`
- **Result**: Kannada segment dropouts were eliminated, increasing transcription output coverage from 2 to 9 chunks.

### Repetition Loop Prevention for Urdu
- **Problem**: Background music/poetry after 27 seconds caused the model's self-conditioning loop to freeze, spiking `no_speech_prob` to `0.98` and triggering repetition loops (`compression_ratio = 2.04`).
- **Solution**: 
  - Set `condition_on_previous_text=False` in `transcribe_audio` options to prevent the model from getting stuck in its own historical output buffer.
  - Adjusted temperature search boundaries: `[0.0, 0.2, 0.4, 0.6, 0.8, 1.0]`.
- **Result**: Repeating text loops were completely resolved, resulting in a clean, coherent Urdu Nastaliq output across 26 chunks.

### Max Chunk Duration Guard
- **Problem**: When non-Latin scripts (like Kannada UGC) contain continuous spoken words without standard punctuation or pause gaps > 0.8s, the caption chunker merged them into extremely long subtitle blocks (e.g., a single 20-second segment).
- **Solution**: Added a `MAX_CHUNK_DURATION = 8.0` seconds guard in the phrase-mode chunker (`caption_chunker.py`):
  ```python
  MAX_CHUNK_DURATION = 8.0
  for i, w in enumerate(words):
      if current_chunk:
          chunk_so_far_duration = w['end'] - current_chunk[0]['start']
          if chunk_so_far_duration > MAX_CHUNK_DURATION:
              # Flush the current chunk before adding the word
              ...
  ```
- **Result**: Subtitles are split cleanly into chunks of 1–4 seconds, maintaining proper reading pace.

---

## 2. API & Network Enhancements

### NameError & Path Resolution Fix in `app.py`
- **Problem**: When querying job statuses, the server would raise a `NameError: name 'processed_audio_path' is not defined` inside `api_transcribe`, causing the endpoint to respond with an empty 500 status code.
- **Solution**: Updated the `video_duration` lookup call to refer to `audio_path` which is correctly defined in scope before background threads are spawned.

### Google Translate Rate-Limiting Protection (429)
- **Problem**: Large translation batches triggered rate-limit blocks (HTTP 429) on free Google Translate endpoints.
- **Solution**:
  - **HTML Tag Batching**: Wrapped text segments in `<p>...</p>` tags to translate them in a single batch query without breaking subtitle array matching.
  - **Backoff Handler**: Implemented a 3-step exponential retry delay (2s, 4s, 8s).
  - **Sequential Fallback**: If the tag count in the translated output mismatches, the system gracefully falls back to sequential single-chunk translations while updating the job status progress.

---

## 3. Local Port Conflict Resolution

To allow running the Weekie AI Captions Generator alongside other local projects that occupy default ports (like `3000` and `5000`), the services have been remapped:

### Port Configuration Mapping

| Service | Port | Configuration Files |
|---------|------|---------------------|
| **Next.js Frontend** | `3005` | `frontend/package.json`, `frontend/.env` |
| **Flask Backend API** | `8085` | `backend/.env`, `backend/app.py` |

### Key Changes Applied:

1. **Frontend script update** (`frontend/package.json`):
   ```json
   "scripts": {
     "dev": "next dev -p 3005"
   }
   ```
2. **Backend Dotenv integration** (`backend/app.py`):
   Added `load_dotenv()` import and call at the top of the application startup file:
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```
3. **Environment variables**:
   Updated `.env` files to bind the API calls and CORS policies correctly:
   - `BACKEND_URL=http://localhost:8085`
   - `NEXT_PUBLIC_BACKEND_URL=http://localhost:8085`
   - `FRONTEND_URL=http://localhost:3005`
   - `PORT=8085`
