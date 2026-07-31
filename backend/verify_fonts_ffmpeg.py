import os
import sys
import subprocess
import caption_job

backend_dir = os.path.dirname(__file__)
sample_video = os.path.join(backend_dir, "..", "VIDEOS", "videoplayback (1).mp4")

width, height, duration = caption_job.probe_video(sample_video)
transcript = caption_job.transcribe_audio(sample_video, language="en")
output_dir = os.path.join(backend_dir, "data", "renders_test")

styles = ["hormozi", "mrbeast", "karaoke", "minimal", "bounce", "classic"]

print("============================================================")
print("     FFMPEG FONTSELECT VERBOSE VERIFICATION FOR ALL 6 STYLES")
print("============================================================")

for st in styles:
    ass_file = os.path.join(output_dir, f"{st}.ass")
    out_mp4 = os.path.join(output_dir, f"{st}_font_test.mp4")
    
    caption_job.generate_ass_from_transcript(
        transcript=transcript,
        duration=duration,
        output_path=ass_file,
        caption_style=st,
        caption_position=10,
        language="en",
        video_width=width,
        video_height=height,
    )
    
    from font_installer import ensure_fonts_available
    fonts_dir = ensure_fonts_available()
    ass_abs = os.path.abspath(ass_file)
    ass_dir = os.path.dirname(ass_abs)
    ass_filename = os.path.basename(ass_abs)
    rel_fonts_dir = os.path.relpath(fonts_dir, ass_dir).replace("\\", "/")
    
    vf_filter = f"ass='{ass_filename}':fontsdir='{rel_fonts_dir}'"
    
    cmd = [
        "ffmpeg", "-y", "-loglevel", "verbose",
        "-i", os.path.abspath(sample_video),
        "-vf", vf_filter,
        "-c:v", "libx264", "-preset", "ultrafast", "-t", "3",
        os.path.abspath(out_mp4)
    ]
    
    res = subprocess.run(cmd, cwd=ass_dir, capture_output=True, text=True)
    fontselect_lines = [line.strip() for line in res.stderr.splitlines() if "fontselect" in line.lower()]
    
    print(f"\nStyle: [{st.upper()}]")
    print(f"  FFmpeg fontselect matches:")
    for fline in fontselect_lines[:3]:
        print(f"    -> {fline}")

print("\n============================================================")
print("     ALL FONTSELECT VERIFICATIONS COMPLETED")
print("============================================================")
