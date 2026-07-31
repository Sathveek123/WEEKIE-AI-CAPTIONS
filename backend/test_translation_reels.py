import os
import sys
import logging

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
    print(f"ERROR: Video path not found: {video_path}")
    sys.exit(1)

print(f"Testing video reel: {os.path.basename(video_path)}")
width, height, duration = caption_job.probe_video(video_path)
print(f"Probed video: {width}x{height}, duration: {duration:.2f}s")

test_configs = [
    {"target_lang": "hi", "romanize": False, "desc": "English -> Hindi (Native Script)"},
    {"target_lang": "te", "romanize": False, "desc": "English -> Telugu (Native Script)"},
    {"target_lang": "kn", "romanize": False, "desc": "English -> Kannada (Native Script)"},
    {"target_lang": "hi", "romanize": True,  "desc": "English -> Hindi (Romanized Script)"},
]

output_dir = os.path.join(backend_dir, "data", "test_translations")
os.makedirs(output_dir, exist_ok=True)

for config in test_configs:
    lang = config["target_lang"]
    rom = config["romanize"]
    desc = config["desc"]
    
    print(f"\n============================================================")
    print(f"  RUNNING TEST: {desc}")
    print(f"============================================================")
    
    res = caption_job.transcribe_audio(
        video_path=video_path,
        language="auto",
        translate=True,
        target_language=lang,
        romanize=rom,
        caption_mode="phrase",
    )
    
    print(f"[RETURNED TRANSCRIPT LANG]: '{res['language']}'")
    print(f"[TOTAL SEGMENTS]: {len(res['segments'])}")
    
    print(f"[SAMPLE TRANSLATED SEGMENTS]:")
    for seg in res['segments'][:4]:
        print(f"  [{seg['start']:.2f}s - {seg['end']:.2f}s]: {seg['text']}")
    
    ass_path = os.path.join(output_dir, f"test_{lang}_{'rom' if rom else 'native'}.ass")
    out_mp4 = os.path.join(output_dir, f"test_{lang}_{'rom' if rom else 'native'}_captioned.mp4")
    
    ok_ass = caption_job.generate_ass_from_transcript(
        transcript=res,
        duration=duration,
        output_path=ass_path,
        caption_style="hormozi",
        caption_position=10,
        language=res['language'],
        video_width=width,
        video_height=height,
    )
    
    ok_burn = caption_job.burn_subtitles(video_path, ass_path, out_mp4)
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024) if os.path.exists(out_mp4) else 0.0
    
    print(f"[ASS GENERATED]: {ok_ass} | [MP4 BURNED]: {ok_burn} | [SIZE]: {file_size_mb:.2f} MB")

print("\n============================================================")
print("     ALL TRANSLATION REEL TESTS COMPLETED SUCCESSFULLY")
print("============================================================")
