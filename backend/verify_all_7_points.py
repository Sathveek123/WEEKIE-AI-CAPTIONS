import os
import sys
import json
import logging
import subprocess

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO)
import caption_job

backend_dir = os.path.dirname(__file__)
video_path = os.path.abspath(os.path.join(backend_dir, "..", "VIDEOS", "VID-20260625-WA0091.mp4"))

if not os.path.exists(video_path):
    print(f"ERROR: Target video not found at: {video_path}")
    sys.exit(1)

print("=================================================================")
print("     RAW 7-POINT VERIFICATION SUITE FOR TELUGU CAPTIONING")
print("=================================================================")

# Point (a): Exact FFmpeg audio extraction command
print("\n--- POINT (a): Exact FFmpeg Audio Extraction Command ---")
cmd_af = [
    "ffmpeg", "-y",
    "-i", video_path,
    "-vn",
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    "-af", "highpass=f=200,lowpass=f=3000,volume=1.5",
    video_path + ".test_audio.wav"
]
print("Executed Command:")
print(" ".join(cmd_af))
res_af = subprocess.run(cmd_af, capture_output=True, text=True)
print(f"Extraction Status: {'SUCCESS' if res_af.returncode == 0 else 'FAILED'}")

# Run transcription on Telugu video
w, h, duration = caption_job.probe_video(video_path)
t_res = caption_job.transcribe_audio(
    video_path=video_path,
    language="te",
    translate=False,
    caption_mode="phrase"
)

# Point (b): Pass 1 detected language output
print("\n--- POINT (b): Pass 1 Language Output ---")
print(f"Detected / Specified Language: '{t_res['language']}'")

# Point (c): Pass 2 model size loaded
print("\n--- POINT (c): Pass 2 Model Loaded ---")
model_size = caption_job.get_model_size_for_language(t_res['language'])
print(f"Pass 2 Model Size for language '{t_res['language']}': '{model_size}'")

# Point (d): Raw Whisper segments - first 5 chunks with word timestamps
print("\n--- POINT (d): First 5 Chunks with Word Timestamps ---")
for i, seg in enumerate(t_res['segments'][:5]):
    word_str = " | ".join([f"[{w['start']:.2f}s -> {w['end']:.2f}s]: \"{w['word']}\"" for w in seg.get('words', [])])
    print(f"Chunk {i+1} [{seg['start']:.2f}s -> {seg['end']:.2f}s]: \"{seg['text']}\"")
    print(f"   Words: {word_str}")

# Generate ASS Subtitle File
out_dir = os.path.join(backend_dir, "data", "test_7points")
os.makedirs(out_dir, exist_ok=True)
ass_path = os.path.join(out_dir, "telugu_7points.ass")
out_mp4 = os.path.join(out_dir, "telugu_7points_output.mp4")

caption_job.generate_ass_from_transcript(
    transcript=t_res,
    duration=duration,
    output_path=ass_path,
    caption_style="hormozi",
    caption_position=15,
    language=t_res['language'],
    video_width=w,
    video_height=h,
)

# Point (e): First 10 lines of generated .ass file showing Dialogue events
print("\n--- POINT (e): First 10 Lines of Generated .ass File ---")
with open(ass_path, "r", encoding="utf-8") as f:
    ass_lines = f.readlines()
dialogue_lines = [l.strip() for l in ass_lines if l.startswith("Dialogue:")]
for line in dialogue_lines[:10]:
    print(line)

# Point (f): FFmpeg burn-in stderr showing font selection
print("\n--- POINT (f): FFmpeg Burn-In Fontselect Log ---")
from font_installer import ensure_fonts_available
fonts_dir = ensure_fonts_available()

ass_abs = os.path.abspath(ass_path)
ass_dir = os.path.dirname(ass_abs)
ass_filename = os.path.basename(ass_abs)
rel_fonts_dir = os.path.relpath(fonts_dir, ass_dir).replace("\\", "/")
vf_filter = f"ass='{ass_filename}':fontsdir='{rel_fonts_dir}'"

cmd_burn = [
    "ffmpeg", "-y", "-loglevel", "verbose",
    "-i", video_path, "-vf", vf_filter,
    "-c:v", "libx264", "-preset", "ultrafast", "-t", "10",
    out_mp4
]
res_burn = subprocess.run(cmd_burn, cwd=ass_dir, capture_output=True, text=True)
font_logs = [l.strip() for l in res_burn.stderr.splitlines() if "fontselect" in l.lower()]
print("FFmpeg fontselect matches:")
for fl in font_logs:
    print(fl)

# Point (g): Final MP4 file size in MB
print("\n--- POINT (g): Final MP4 File Size ---")
file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024) if os.path.exists(out_mp4) else 0.0
print(f"Output MP4 File Path: {out_mp4}")
print(f"Final MP4 Size: {file_size_mb:.2f} MB")

print("\n=================================================================")
print("     ALL 7 VERIFICATION POINTS COMPLETED")
print("=================================================================")
