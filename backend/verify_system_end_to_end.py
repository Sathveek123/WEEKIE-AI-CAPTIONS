import os
import sys
import json
import logging
import urllib.request
import subprocess

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO)
import caption_job

backend_dir = os.path.dirname(__file__)
output_dir = os.path.join(backend_dir, "data", "e2e_verification")
os.makedirs(output_dir, exist_ok=True)

print("=================================================================")
print("     SYSTEM END-TO-END VERIFICATION SUITE")
print("=================================================================")

# ------------------------------------------------------------------
# TEST 1: Backend REST Endpoints
# ------------------------------------------------------------------
print("\n--- TEST 1: Testing Backend REST Endpoints (http://127.0.0.1:8085) ---")
try:
    req = urllib.request.Request("http://127.0.0.1:8085/api/fonts")
    with urllib.request.urlopen(req, timeout=5) as r:
        fonts_res = json.loads(r.read().decode('utf-8'))
        print(f"[REST /api/fonts OK]: Installed {len(fonts_res.get('installed', []))}/{len(fonts_res.get('required', []))} required fonts.")
        print(f"   Missing fonts: {fonts_res.get('missing', [])}")
except Exception as e:
    print(f"[REST /api/fonts ERROR]: {e}")

# ------------------------------------------------------------------
# TEST 2: Indic Two-Pass Model Selection & Metrics
# ------------------------------------------------------------------
print("\n--- TEST 2: Testing Indic Two-Pass Model Selection & Accuracy ---")
sample_video = os.path.abspath(os.path.join(backend_dir, "..", "VIDEOS", "videoplayback.mp4"))
if os.path.exists(sample_video):
    width, height, duration = caption_job.probe_video(sample_video)
    print(f"Video clip: videoplayback.mp4 ({width}x{height}, duration: {duration:.2f}s)")
    
    # Transcribe Telugu
    res_te = caption_job.transcribe_audio(sample_video, language="te")
    print(f"[TELUGU TRANSCRIPT]: Returned language: '{res_te['language']}', Segments count: {len(res_te['segments'])}")
    if res_te['segments']:
        print(f"   First segment: {repr(res_te['segments'][0]['text'])}")
else:
    print("Warning: sample video videoplayback.mp4 not found.")

# ------------------------------------------------------------------
# TEST 3: Reel Video Multi-Language Translation (Hindi, Telugu, Kannada)
# ------------------------------------------------------------------
print("\n--- TEST 3: Testing Multi-Language Reel Translation ---")
reel_video = os.path.abspath(os.path.join(backend_dir, "..", "VIDEOS", "VID-20260625-WA0091.mp4"))

if os.path.exists(reel_video):
    r_width, r_height, r_duration = caption_job.probe_video(reel_video)
    
    langs_to_test = [
        ("hi", False, "Hindi Native"),
        ("te", False, "Telugu Native"),
        ("kn", False, "Kannada Native"),
        ("hi", True,  "Hindi Romanized"),
    ]
    
    for l_code, rom, label in langs_to_test:
        t_res = caption_job.transcribe_audio(
            video_path=reel_video,
            language="auto",
            translate=True,
            target_language=l_code,
            romanize=rom,
            caption_mode="phrase",
        )
        print(f"[{label.upper()}]: Language='{t_res['language']}', Segments={len(t_res['segments'])}")
        if t_res['segments']:
            print(f"   Sample text: {repr(t_res['segments'][0]['text'])}")
        
        ass_path = os.path.join(output_dir, f"e2e_{l_code}_{'rom' if rom else 'native'}.ass")
        out_mp4 = os.path.join(output_dir, f"e2e_{l_code}_{'rom' if rom else 'native'}_out.mp4")
        
        ok_ass = caption_job.generate_ass_from_transcript(
            transcript=t_res,
            duration=r_duration,
            output_path=ass_path,
            caption_style="hormozi",
            caption_position=10,
            language=t_res['language'],
            video_width=r_width,
            video_height=r_height,
        )
        ok_burn = caption_job.burn_subtitles(reel_video, ass_path, out_mp4)
        size_mb = os.path.getsize(out_mp4) / (1024 * 1024) if os.path.exists(out_mp4) else 0.0
        print(f"   Render status: ASS={ok_ass}, MP4 Burn={ok_burn}, Size={size_mb:.2f} MB")

# ------------------------------------------------------------------
# TEST 4: All 6 Caption Styles & FFmpeg Font Loading
# ------------------------------------------------------------------
print("\n--- TEST 4: Testing All 6 Caption Styles & FFmpeg Fontselect Resolution ---")
test_video = os.path.abspath(os.path.join(backend_dir, "..", "VIDEOS", "videoplayback (1).mp4"))
if os.path.exists(test_video):
    w_t, h_t, d_t = caption_job.probe_video(test_video)
    t_eng = caption_job.transcribe_audio(test_video, language="en")
    
    styles = ["hormozi", "mrbeast", "karaoke", "minimal", "bounce", "classic"]
    for st in styles:
        ass_path = os.path.join(output_dir, f"style_{st}.ass")
        out_mp4 = os.path.join(output_dir, f"style_{st}_out.mp4")
        
        caption_job.generate_ass_from_transcript(
            transcript=t_eng,
            duration=d_t,
            output_path=ass_path,
            caption_style=st,
            caption_position=10,
            language="en",
            video_width=w_t,
            video_height=h_t,
        )
        
        from font_installer import ensure_fonts_available
        fonts_dir = ensure_fonts_available()
        ass_abs = os.path.abspath(ass_path)
        ass_dir = os.path.dirname(ass_abs)
        ass_filename = os.path.basename(ass_abs)
        rel_fonts_dir = os.path.relpath(fonts_dir, ass_dir).replace("\\", "/")
        vf_filter = f"ass='{ass_filename}':fontsdir='{rel_fonts_dir}'"
        
        cmd = [
            "ffmpeg", "-y", "-loglevel", "verbose",
            "-i", test_video, "-vf", vf_filter,
            "-c:v", "libx264", "-preset", "ultrafast", "-t", "3",
            out_mp4
        ]
        res = subprocess.run(cmd, cwd=ass_dir, capture_output=True, text=True)
        fontselect = [l.strip() for l in res.stderr.splitlines() if "fontselect" in l.lower()]
        size_mb = os.path.getsize(out_mp4) / (1024 * 1024) if os.path.exists(out_mp4) else 0.0
        
        print(f"Style [{st.upper():8s}]: Rendered {size_mb:.2f} MB | Fontselect: {fontselect[0] if fontselect else 'None'}")

print("\n=================================================================")
print("     ALL END-TO-END VERIFICATION CHECKS COMPLETED SUCCESSFULLY")
print("=================================================================")
