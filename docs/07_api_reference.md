# 07 — Complete REST API Reference

## Base URL

```
http://localhost:8085
```

> ⚠️ The frontend `.env` must have `BACKEND_URL=http://localhost:8085`.  
> Do NOT use the old `http://172.30.84.39:5000` (stale WSL/network IP).

---

## Authentication

Currently **no authentication is required** on API endpoints. The backend relies on CORS to restrict access to the frontend origin (`http://localhost:3005`).

---

## Endpoints

### 1. Health Check

```http
GET /api/health
```

Verify the Flask server is alive and running.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### 2. Submit Caption Job

```http
POST /api/process
Content-Type: multipart/form-data
```

Upload a video file and start the captioning pipeline as a background job.

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | Video file (`.mp4`, `.mov`, `.webm`) |
| `captionStyle` | string | ✅ | Style ID: `hormozi`, `mrbeast`, `karaoke`, `minimal`, `bounce`, `classic` |
| `captionPosition` | integer | ✅ | Position from bottom as % (5–50) |
| `durationSeconds` | float | Optional | Pre-known video duration for UI display |

**Constraints:**
- Max file size: `500 MB` (configurable via `MAX_FILE_SIZE_MB`)
- Max video duration: `30 minutes` (configurable via `MAX_DURATION_MINUTES`)
- Supported formats: MP4, MOV, WebM

**Response 200:**
```json
{
  "jobId": "cf8e90d0-918f-459b-af91-af832d3d8fb9"
}
```

**Error Responses:**

| Status | Meaning |
|--------|---------|
| `400` | Missing fields, invalid style, invalid position |
| `413` | File exceeds size limit |
| `429` | Server at capacity (MAX_CONCURRENT_JOBS exceeded) |
| `500` | Internal server error |

---

### 3. Poll Job Status

```http
GET /api/status/{jobId}
```

Poll for live progress updates. Call every 3 seconds from the frontend.

**Path Parameter:**
- `jobId` — UUID returned from `/api/process`

**Response 200:**
```json
{
  "jobId": "cf8e90d0-918f-459b-af91-af832d3d8fb9",
  "status": "processing",
  "progress": 40,
  "currentPhase": "transcribing",
  "language": "en",
  "durationSeconds": 59.3,
  "errorMessage": null,
  "processingTimeMs": null
}
```

**Status Values:**

| Status | Meaning |
|--------|---------|
| `queued` | Job waiting in queue |
| `processing` | Pipeline actively running |
| `completed` | Caption burning done — video ready to download |
| `failed` | Pipeline error — check `errorMessage` |

**Phase Values:**

| Phase | Progress Range | Description |
|-------|---------------|-------------|
| `transcribing` | 5–40% | ffprobe + Whisper AI transcription |
| `burning` | 50% | ASS subtitle file generated |
| `finalizing` | 90% | FFmpeg subtitle burn complete |
| `null` | — | Job queued/initializing |

**Response 404:** Job ID not found.

---

### 4. Download Captioned Video

```http
GET /api/download/{jobId}
```

Stream the completed captioned `.mp4` file. Only available after `status === "completed"`.

**Response 200:**
- Content-Type: `video/mp4`
- `Content-Disposition: attachment; filename="captioned.mp4"`
- Binary MP4 stream (libx264 + original audio)

**Error Responses:**

| Status | Meaning |
|--------|---------|
| `404` | Job not found or not completed |
| `404` | Output file missing (was deleted) |

---

### 5. Delete Job

```http
DELETE /api/jobs/{jobId}
```

Delete a job and all associated files (temp input + output MP4).

**Response 200:**
```json
{
  "deleted": true
}
```

**Response 404:** Job not found.

---

## CORS Configuration

The backend uses `flask-cors` to allow cross-origin requests:

```python
CORS(app, origins=[frontend_url])  # default: http://localhost:3005
```

Override `FRONTEND_URL` env var to allow a different origin.

---

## Error Response Format

All error responses use a consistent JSON body:

```json
{
  "error": "Human-readable error message here"
}
```

---

## Example: Full Job Lifecycle (cURL)

```bash
# 1. Submit job
curl -X POST http://localhost:8085/api/process \
  -F "file=@my_video.mp4" \
  -F "captionStyle=mrbeast" \
  -F "captionPosition=15"

# Response: {"jobId":"abc123"}

# 2. Poll status
curl http://localhost:8085/api/status/abc123

# Response: {"status":"processing","progress":40,"currentPhase":"transcribing"}

# 3. Wait until status = "completed", then download
curl -o captioned_video.mp4 http://localhost:8085/api/download/abc123

# 4. Delete job (optional cleanup)
curl -X DELETE http://localhost:8085/api/jobs/abc123
```
