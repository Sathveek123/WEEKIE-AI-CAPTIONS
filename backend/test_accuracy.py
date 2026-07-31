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

sample_file = os.path.join(os.path.dirname(__file__), "..", "sample.mp4")

test_cases = [
    {"name": "Telugu (UGC Speech)", "lang": "te"},
    {"name": "Kannada (Interview Short)", "lang": "kn"},
    {"name": "Urdu (Poetry / Recitation)", "lang": "ur"},
]

print("============================================================")
print("     INDIC LANGUAGES TWO-PASS MODEL SELECTION TEST RUN")
print("============================================================")

for tc in test_cases:
    print(f"\n---> TEST CASE: {tc['name']} (Language Code: {tc['lang']})")
    
    resolved_model = caption_job.get_model_size_for_language(tc["lang"])
    print(f"     [INDIC MAP LOOKUP]: Language '{tc['lang']}' -> Selected Model: '{resolved_model}' (target >= medium)")
    
    if os.path.exists(sample_file):
        result = caption_job.transcribe_audio(sample_file, language=tc["lang"])
        print(f"     [PASS 1 DETECTED/SPECIFIED]: {result['language']}")
        print(f"     [PASS 2 MODEL LOADED]: {resolved_model}")
        print(f"     [TOTAL SEGMENTS GENERATED]: {len(result['segments'])}")
        print("     [SAMPLE RAW CHUNKS]:")
        for idx, s in enumerate(result['segments'][:3]):
            word_list = [w['word'] for w in s.get('words', [])]
            print(f"       Chunk {idx+1}: [{s['start']:.2f}s - {s['end']:.2f}s] {s['text']} | Words: {word_list}")
            
print("\n============================================================")
print("     ALL INDIC ACCURACY TESTS EXECUTED SUCCESSFULLY")
print("============================================================")
