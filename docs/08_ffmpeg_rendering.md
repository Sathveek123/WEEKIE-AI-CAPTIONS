# 08 — FFmpeg Video Processing

## What FFmpeg Does in Weekie AI

FFmpeg is used at **two points** in the pipeline:

1. **`ffprobe`** — Before transcription: extract video dimensions (width × height) and duration in seconds
2. **`ffmpeg` with `ass` filter** — After ASS generation: render/burn subtitles into video frames

---

## Step 1: Video Probing with ffprobe

```python
def probe_video(video_path: str) -> tuple[int, int, float]:
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
```

**Why probe first?**
- `video_width` and `video_height` are needed to set `PlayResX`/`PlayResY` in the ASS file
- This ensures fonts, outlines and margins scale correctly for the actual video resolution
- Duration is needed to clip subtitle events to the video end time

**Output**: `(width: int, height: int, duration: float)`

---

## Step 2: ASS Subtitle Burn-in

```python
def burn_subtitles(video_path: str, ass_path: str, output_path: str) -> bool:
    formatted_ass_path = ass_path.replace("\\", "/").replace(":", "\\:")
    cmd = [
        "ffmpeg",
        "-y",                               # Overwrite output if exists
        "-i", video_path,                   # Input video
        "-vf", f"ass='{formatted_ass_path}'", # ASS subtitle filter
        "-c:v", "libx264",                  # H.264 video codec
        "-preset", "veryfast",              # Speed/quality trade-off
        "-crf", "18",                       # Quality level (lower = better)
        "-c:a", "copy",                     # Copy audio unchanged
        output_path,                        # Output path
    ]
```

### Windows Path Handling

On Windows, the ASS filter path requires special escaping:
```python
formatted_ass_path = ass_path.replace("\\", "/").replace(":", "\\:")
# "C:\Users\...\subtitles.ass" → "C\\:/Users/.../subtitles.ass"
```

This is a known quirk of FFmpeg's `vf ass=` filter on Windows — backslashes in paths cause parsing errors, and colons in drive letters need escaping.

---

## Codec & Quality Settings

### Video: libx264

| Setting | Value | Meaning |
|---------|-------|---------|
| `-c:v libx264` | H.264 | Industry-standard MP4 codec |
| `-preset veryfast` | veryfast | Fastest encode that still produces good quality |
| `-crf 18` | 18 | Quality factor (0=lossless, 51=worst; 18=visually near-lossless) |

**Why CRF 18?**  
CRF (Constant Rate Factor) 18 produces near-lossless visual quality while keeping file sizes manageable. For short-form video (15–60s clips), output files are typically 5–30MB.

**Preset Comparison:**

| Preset | Speed | File Size | Quality |
|--------|-------|-----------|---------|
| ultrafast | Fastest | Largest | Lowest |
| veryfast | Fast | Medium | Good ✅ |
| medium | Medium | Smaller | Better |
| slow | Slow | Smallest | Best |

### Audio: Copy (Stream Copy)

```
-c:a copy
```

The audio stream is **not re-encoded** — it is copied bit-for-bit from the input file. This means:
- Zero audio quality loss
- Zero additional processing time for audio
- Original bitrate, codec (AAC, MP3, etc.), and channels preserved

---

## Output Specifications

| Property | Value |
|----------|-------|
| Video Codec | H.264 (libx264) |
| Audio Codec | Copied from source |
| Container | MP4 |
| Quality | CRF 18 (near-lossless) |
| Resolution | Same as source (not upscaled) |
| ASS Rendering | libass (built into FFmpeg essentials build) |

---

## FFmpeg Version Installed

```
ffmpeg version 8.0.1-essentials_build-www.gyan.dev
Built with gcc 15.2.0 (MSYS2)
```

Key enabled features:
- `--enable-libass` — Renders ASS subtitle format (required!)
- `--enable-libfreetype` — Font rendering
- `--enable-libfribidi` — BiDi (RTL text) support
- `--enable-libharfbuzz` — Advanced text shaping (Arabic, Devanagari)
- `--enable-libx264` — H.264 encoding
- NVIDIA GPU acceleration (`nvenc`, `cuda`) — optional

---

## Error Handling

```python
except subprocess.CalledProcessError as exc:
    raise RuntimeError(f"ffmpeg failed: {exc.stderr[-500:]}")
```

Only the last 500 characters of stderr are captured to avoid log flooding on very long error messages.

Common FFmpeg errors and causes:

| Error | Cause |
|-------|-------|
| `No such file or directory` | Video path incorrect, or file deleted |
| `Invalid data found when processing input` | Corrupted video file |
| `ass: ... No such file` | ASS path escaping issue (Windows) |
| `libass: Couldn't find font` | ASS-specified font not installed on system |
| `Permission denied` | Output directory not writable |

---

## Font Availability on Windows

When FFmpeg renders ASS fonts like "Montserrat", "Bebas Neue", "Bangers", "Anton":
- FFmpeg uses the **system font registry** via `libass` + `fontconfig`
- If the font is missing, `libass` falls back to the closest available system font
- The `font_name_fallback` in each style config (`IBM Plex Sans`) is a secondary hint for the subtitle style block, not a guaranteed render fallback

**To ensure proper font rendering**: Install all 4 Google Fonts used by caption styles:
- [Montserrat](https://fonts.google.com/specimen/Montserrat)
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue)
- [Bangers](https://fonts.google.com/specimen/Bangers)
- [Anton](https://fonts.google.com/specimen/Anton)

Download, right-click `.ttf` files, and select **"Install for all users"** on Windows.
