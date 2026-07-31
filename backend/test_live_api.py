"""Live API browser-equivalent test: English -> Hindi and Auto-detect."""
import requests
import json
import time
import os

BASE = "http://127.0.0.1:8085"
VIDEO = r"D:\Client Projects\video ai caption generator beta\ai-video-captions-main\VIDEOS\VID-20260625-WA0091.mp4"


def poll_job(job_id, label, max_wait=480):
    print("  Polling job [%s] ID: %s" % (label, job_id))
    for i in range(0, max_wait, 15):
        time.sleep(15)
        s = requests.get("%s/api/status/%s" % (BASE, job_id), timeout=15).json()
        status = s.get("status", "unknown")
        phase = s.get("currentPhase", "")
        progress = s.get("progress", 0)
        lang = s.get("language", "")
        print("    [%ds] Status: %s | Phase: %s | Progress: %s%% | Lang: %s" % (
            i + 15, status, phase, progress, lang))
        if status in ("completed", "failed", "error"):
            return s
    return {"status": "timeout"}


print("=" * 60)
print("  LIVE API BROWSER-EQUIVALENT TEST")
print("=" * 60)

# TEST 1: English -> Hindi Translation
print("\n--- TEST 1: English -> Hindi Translation (hormozi style) ---")
with open(VIDEO, "rb") as f:
    r = requests.post(
        "%s/api/process" % BASE,
        files={"file": ("VID-20260625-WA0091.mp4", f, "video/mp4")},
        data={
            "captionStyle": "hormozi",
            "captionPosition": "15",
            "languageSource": "auto",
            "translate": "true",
            "targetLanguage": "hi",
            "captionMode": "phrase",
        },
        timeout=30,
    )
print("  Submit Status: %d" % r.status_code)
print("  Response: %s" % r.text[:300])

if r.status_code == 200:
    job1 = r.json()
    job_id_1 = job1.get("jobId")
    print("  Job ID: %s" % job_id_1)
    result1 = poll_job(job_id_1, "Hindi Translation")
    print("\n  [RESULT 1] Final Status: %s" % result1.get("status"))
    print("  Language returned: %s" % result1.get("language"))
    err = result1.get("errorMessage")
    if err:
        print("  ERROR: %s" % err)
else:
    print("  FAILED to submit job 1")

# TEST 2: Auto-detect, No translation, MrBeast style
print("\n--- TEST 2: Auto-detect English, No Translation (mrbeast style) ---")
with open(VIDEO, "rb") as f:
    r2 = requests.post(
        "%s/api/process" % BASE,
        files={"file": ("VID-20260625-WA0091.mp4", f, "video/mp4")},
        data={
            "captionStyle": "mrbeast",
            "captionPosition": "10",
            "languageSource": "auto",
            "translate": "false",
            "captionMode": "phrase",
        },
        timeout=30,
    )
print("  Submit Status: %d" % r2.status_code)
print("  Response: %s" % r2.text[:300])

if r2.status_code == 200:
    job2 = r2.json()
    job_id_2 = job2.get("jobId")
    print("  Job ID: %s" % job_id_2)
    result2 = poll_job(job_id_2, "Auto-detect MrBeast")
    print("\n  [RESULT 2] Final Status: %s" % result2.get("status"))
    print("  Language returned: %s" % result2.get("language"))
    err2 = result2.get("errorMessage")
    if err2:
        print("  ERROR: %s" % err2)
else:
    print("  FAILED to submit job 2")

print("\n" + "=" * 60)
print("  ALL LIVE API TESTS DONE")
print("=" * 60)
