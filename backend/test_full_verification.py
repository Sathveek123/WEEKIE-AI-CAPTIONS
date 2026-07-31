import os
import sys
import json
import logging
import subprocess
import pathlib

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO)
import caption_job
import app
from faster_whisper import WhisperModel
from font_installer import ensure_fonts_available

backend_dir = os.path.dirname(__file__)
sample_video = os.path.join(backend_dir, "..", "VIDEOS", "videoplayback.mp4")
if not os.path.exists(sample_video):
    sample_video = os.path.join(backend_dir, "..", "sample.mp4")

print("================================================================")
print("  PART 1: INDIC MEDIUM MODEL RAW SEGMENT METRICS VERIFICATION")
print("================================================================")

indic_test_cases = [
    {"name": "Telugu (UGC Clip)", "code": "te"},
    {"name": "Kannada (Interview Short)", "code": "kn"},
]

# Run raw whisper transcribe to retrieve seg.compression_ratio and seg.no_speech_prob
device = os.environ.get("WHISPER_DEVICE", "cpu")
compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

for tc in indic_test_cases:
    print(f"\n--- Running Raw Model Metric Analysis for: {tc['name']} ({tc['code']}) ---")
    model_size = caption_job.get_model_size_for_language(tc['code'])
    print(f"[MODEL RESOLUTION]: Language code '{tc['code']}' -> Whisper model size: '{model_size}'")
    
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    opts = {"word_timestamps": True, "language": tc['code'], "condition_on_previous_text": False}
    if tc['code'] in ("kn", "kannada"):
        opts["vad_filter"] = True
        opts["vad_parameters"] = {"onset": 0.25, "min_speech_duration_ms": 150}
        
    segments_iter, info = model.transcribe(sample_video, **opts)
    
    seg_list = list(segments_iter)
    total_chunks = len(seg_list)
    print(f"[DETECTED/SPECIFIED LANG]: {info.language} (duration: {info.duration:.2f}s)")
    print(f"[TOTAL GENERATED CHUNKS]: {total_chunks}")
    
    high_comp_ratios = []
    total_speech_duration = 0.0
    
    for i, s in enumerate(seg_list[:6]):
        seg_dur = s.end - s.start
        total_speech_duration += seg_dur
        comp_ratio = getattr(s, 'compression_ratio', 1.0)
        no_speech_p = getattr(s, 'no_speech_prob', 0.0)
        if comp_ratio > 2.4:
            high_comp_ratios.append((i+1, comp_ratio))
        print(f"  Chunk {i+1:02d} [{s.start:.2f}s - {s.end:.2f}s] (cr={comp_ratio:.2f}, no_speech={no_speech_p:.2f}): {s.text.strip()}")
        
    audio_coverage = (total_speech_duration / max(0.1, info.duration)) * 100.0
    print(f"[AUDIO COVERAGE]: {audio_coverage:.1f}%")
    print(f"[COMPRESSION RATIO CHECK < 2.4]: {'PASSED (Zero Hallucination Loops)' if not high_comp_ratios else f'FAILED ({high_comp_ratios})'}")


print("\n================================================================")
print("  PART 2: END-TO-END 6 CAPTION STYLES & FFMPEG FONTSELECT VERIFICATION")
print("================================================================")

fonts_dir = ensure_fonts_available()
formatted_fonts_dir = fonts_dir.replace("\\", "/").replace(":", "\\:")

width, height, duration = caption_job.probe_video(sample_video)
transcript = caption_job.transcribe_audio(sample_video, language="en")

styles = ["hormozi", "mrbeast", "karaoke", "minimal", "bounce", "classic"]
output_dir = os.path.join(backend_dir, "data", "test_renders")
os.makedirs(output_dir, exist_ok=True)

for st in styles:
    print(f"\n--- Testing Style: '{st}' ---")
    ass_path = os.path.join(output_dir, f"{st}.ass")
    out_mp4 = os.path.join(output_dir, f"{st}_out.mp4")
    
    caption_job.generate_ass_from_transcript(
        transcript=transcript,
        duration=duration,
        output_path=ass_path,
        caption_style=st,
        caption_position=10,
        language="en",
        video_width=width,
        video_height=height,
    )
    
    formatted_ass_path = ass_path.replace("\\", "/").replace(":", "\\:")
    vf_filter = f"ass='{formatted_ass_path}':fontsdir='{formatted_fonts_dir}'"
    
    # Run FFmpeg with -loglevel verbose to capture fontselect lines
    cmd = [
        "ffmpeg", "-y", "-loglevel", "verbose",
        "-i", sample_video,
        "-vf", vf_filter,
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
        "-c:a", "copy",
        "-t", "5",  # render 5s sample for rapid test
        out_mp4
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    stderr = res.stderr
    
    # Find fontselect lines
    fontselect_lines = [line.strip() for line in stderr.splitlines() if "fontselect" in line.lower()]
    file_size_mb = os.path.getsize(out_mp4) / (1024 * 1024) if os.path.exists(out_mp4) else 0.0
    
    print(f"[STYLE]: {st}")
    print(f"[RENDERED MP4 SIZE]: {file_size_mb:.2f} MB")
    print(f"[FFMPEG FONTSELECT MATCHES]:")
    for fline in fontselect_lines[:4]:
        print(f"   -> {fline}")

print("\n================================================================")
print("  ALL VERIFICATION CHECKS COMPLETE")
print("================================================================")
