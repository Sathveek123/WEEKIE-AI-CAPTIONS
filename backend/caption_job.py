"""Caption job processing pipeline.

Runs the full video captioning workflow:
  1. Probe video for dimensions and duration (ffprobe)
  2. Transcribe audio with word-level timestamps (faster-whisper)
  3. Generate ASS subtitle file
  4. Burn subtitles into video (ffmpeg)
  5. Clean up temp files and mark job completed
"""

import json
import logging
import os
import re
import shutil
import subprocess
import time

logger = logging.getLogger(__name__)

INDIC_LANGUAGES = ["te", "hi", "ta", "kn", "ml", "bn", "mr", "gu", "pa", "ur", "ne", "si"]


def get_model_size_for_language(language_code: str) -> str:
    """Return appropriate Whisper model size based on target language."""
    env_override = os.environ.get("WHISPER_MODEL_SIZE", "auto")
    if env_override != "auto":
        return env_override  # respect explicit env override
    if language_code in INDIC_LANGUAGES:
        return "medium"  # Indic languages need medium minimum
    return "base"  # English and other Latin languages


def extract_audio_for_whisper(video_path: str) -> str:
    """Extract 16kHz mono 16-bit PCM WAV audio with voice frequency bandpass and volume boost."""
    audio_path = video_path + ".whisper.wav"
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        "-af", "highpass=f=200,lowpass=f=3000,volume=1.5",
        audio_path,
    ]
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        logger.info("Extracted preprocessed audio for Whisper: %s", audio_path)
        return audio_path
    except Exception as exc:
        logger.warning("FFmpeg audio extraction filter failed (%s). Using raw video path.", exc)
        return video_path


def probe_video(video_path: str) -> tuple[int, int, float]:
    """Return (width, height, duration_seconds) for *video_path* via ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        "-show_format",
        video_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffprobe not found; please install ffmpeg") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffprobe failed: {exc.stderr.strip()}") from exc

    data = json.loads(result.stdout)
    video_stream = next(
        (s for s in data.get("streams", []) if s.get("codec_type") == "video"),
        None,
    )
    if video_stream is None:
        raise ValueError(f"No video stream found in {video_path!r}")

    width = int(video_stream["width"])
    height = int(video_stream["height"])

    duration_str = video_stream.get("duration") or data.get("format", {}).get("duration")
    if duration_str is None:
        raise ValueError(f"Could not determine duration of {video_path!r}")
    duration = float(duration_str)

    return width, height, duration


def transcribe_audio(
    video_path: str,
    language: str = "auto",
    translate: bool = False,
    target_language: str = "en",
    romanize: bool = False,
    caption_mode: str = "phrase",
    vad: bool = False,
    multi_speaker: bool = False,
) -> dict:
    """Transcribe *video_path* using faster-whisper with Indic enhancements,
    two-pass model selection (detect language pass 1 -> medium model for Indic pass 2),
    repetition prevention, Google translate rate-limiting protection,
    Indic script romanization, and VAD filter options.
    """
    from faster_whisper import WhisperModel  # type: ignore[import]
    import time

    whisper_device = os.environ.get("WHISPER_DEVICE", "cpu")
    whisper_compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

    # Extract 16kHz mono audio with voice frequency bandpass filter
    audio_input = extract_audio_for_whisper(video_path)

    # --- PASS 1: Language Detection & Model Selection ---
    detected_lang = language
    pass1_model = None
    if not language or language == "auto":
        logger.info("Pass 1: Running language detection on '%s' using base model...", audio_input)
        try:
            pass1_model = WhisperModel("base", device=whisper_device, compute_type=whisper_compute_type)
        except Exception as exc:
            if whisper_device != "cpu":
                logger.warning("Pass 1 model init failed on '%s' (%s). Falling back to CPU.", whisper_device, exc)
                pass1_model = WhisperModel("base", device="cpu", compute_type="int8")
            else:
                raise
        _, info = pass1_model.transcribe(audio_input, word_timestamps=False)
        detected_lang = info.language
        logger.info("Pass 1 complete. Detected language: '%s'", detected_lang)

    target_model_size = get_model_size_for_language(detected_lang)
    logger.info("Pass 2: Selected model size '%s' for language '%s'", target_model_size, detected_lang)

    # --- PASS 2: Full Transcription with Selected Model ---
    model = None
    if pass1_model is not None and target_model_size == "base":
        logger.info("Reusing Pass 1 model for transcription...")
        model = pass1_model
    else:
        # Free Pass 1 model memory before loading Pass 2 model
        pass1_model = None
        import gc
        gc.collect()

        try:
            model = WhisperModel(target_model_size, device=whisper_device, compute_type=whisper_compute_type)
        except Exception as exc:
            if whisper_device != "cpu":
                logger.warning("Pass 2 model init failed on '%s' (%s). Falling back to CPU.", whisper_device, exc)
                model = WhisperModel(target_model_size, device="cpu", compute_type="int8")
            else:
                raise

    # Build comprehensive Whisper options
    transcribe_opts = {
        "word_timestamps": True,
        "condition_on_previous_text": False,  # Prevent repetition loops (Urdu, Indic, etc.)
        "temperature": [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],  # Temperature search boundaries
        "beam_size": 5,
        "best_of": 5,
        "no_speech_threshold": 0.95,
        "compression_ratio_threshold": 2.4,
        "repetition_penalty": 1.2,
        "without_timestamps": False,
        "prepend_punctuations": "\"'\u00bf([{-",
        "append_punctuations": "\"'.\u3002,\uFF0C!\uFF01?\uFF1F:\uFF1A\")]}\u3001",
    }

    # Language configuration
    if detected_lang and detected_lang != "auto":
        transcribe_opts["language"] = detected_lang

    # Native translation to English
    if translate and target_language == "en":
        transcribe_opts["task"] = "translate"

    # Voice Activity Detection (VAD) configuration
    if vad or (detected_lang and detected_lang.lower() in ("kn", "kannada")):
        transcribe_opts["vad_filter"] = True
        transcribe_opts["vad_parameters"] = {
            "onset": 0.25,
            "min_speech_duration_ms": 150,
        }

    segments_iter, info = model.transcribe(audio_input, **transcribe_opts)
    detected_lang = info.language

    # Flatten raw words & apply term_corrector pass
    from term_corrector import correct_text
    from caption_chunker import chunk_captions

    all_words = []
    raw_segments = []
    for seg in segments_iter:
        words = []
        if seg.words:
            for w in seg.words:
                corrected_w = correct_text(w.word)
                word_dict = {"word": corrected_w, "start": w.start, "end": w.end}
                words.append(word_dict)
                all_words.append(word_dict)
        else:
            # Fallback when seg.words is empty/missing
            seg_text = (seg.text or "").strip()
            if seg_text:
                corrected_seg_text = correct_text(seg_text)
                split_words = corrected_seg_text.split()
                duration = max(0.1, seg.end - seg.start)
                w_dur = duration / len(split_words) if split_words else 0
                for idx, w_str in enumerate(split_words):
                    word_dict = {
                        "word": w_str,
                        "start": round(seg.start + (idx * w_dur), 3),
                        "end": round(seg.start + ((idx + 1) * w_dur), 3),
                    }
                    words.append(word_dict)
                    all_words.append(word_dict)
        if words:
            raw_segments.append({
                "start": seg.start,
                "end": seg.end,
                "text": correct_text((seg.text or "").strip()),
                "words": words,
            })

    # Clean up temp preprocessed audio file if created
    if os.path.exists(audio_input) and audio_input != video_path:
        try:
            os.remove(audio_input)
        except Exception:
            pass

    # Use caption_chunker engine (8.0s max chunk duration split & Indic punctuation rules)
    if all_words:
        chunked_list = chunk_captions(all_words, mode=caption_mode)
        processed_segments = []
        for chunk in chunked_list:
            chunk_words = [w for w in all_words if w["start"] >= (chunk["start"] - 0.05) and w["end"] <= (chunk["end"] + 0.05)]
            processed_segments.append({
                "start": chunk["start"],
                "end": chunk["end"],
                "text": chunk["text"],
                "words": chunk_words if chunk_words else [{"word": chunk["text"], "start": chunk["start"], "end": chunk["end"]}],
            })
    else:
        # Fallback to raw_segments if all_words is empty
        processed_segments = raw_segments


    # Google Translate Rate-Limiting Protection (429) & HTML Tag Batching
    if translate and target_language != "en" and processed_segments:
        from deep_translator import GoogleTranslator

        translator = GoogleTranslator(source="auto", target=target_language)
        
        # Batch HTML tags translation to prevent HTTP 429
        batch_size = 35
        for idx in range(0, len(processed_segments), batch_size):
            batch = processed_segments[idx:idx+batch_size]
            html_payload = "".join([f"<p>{s['text']}</p>" for s in batch])
            
            # Retry backoff handler (3 steps: 2s, 4s, 8s)
            translated_html = None
            for delay in [2, 4, 8]:
                try:
                    translated_html = translator.translate(html_payload)
                    break
                except Exception as e:
                    logger.warning("Translation batch failed, retrying in %ds: %s", delay, e)
                    time.sleep(delay)
            
            if translated_html:
                # Parse translated paragraphs with flexible tag matching
                paras = re.findall(r"<p[^>]*>(.*?)</p>", translated_html, re.IGNORECASE | re.DOTALL)
                if len(paras) == len(batch):
                    for i, t_text in enumerate(paras):
                        cleaned_t = t_text.strip()
                        if cleaned_t:
                            batch[i]["text"] = cleaned_t
                    continue
            
            # Mismatch/failure fallback: translate sequentially while preserving original text
            for item in batch:
                orig_text = item.get("text", "")
                t_res = None
                for delay in [1, 2, 4]:
                    try:
                        res = translator.translate(orig_text)
                        if res and res.strip():
                            t_res = res.strip()
                            break
                    except Exception as e:
                        logger.warning("Sequential translation failed, retrying in %ds: %s", delay, e)
                        time.sleep(delay)
                item["text"] = t_res if t_res else orig_text

        # Regenerate word list with character-proportional distributed timestamps for translated segments
        for item in processed_segments:
            raw_text = item.get("text") or ""
            t_words = raw_text.split()
            if not t_words:
                continue
            duration = max(0.1, item["end"] - item["start"])
            total_chars = sum(len(w) for w in t_words)
            
            new_words = []
            curr_time = item["start"]
            for i, w in enumerate(t_words):
                if total_chars > 0:
                    w_dur = max(0.05, (len(w) / total_chars) * duration)
                else:
                    w_dur = max(0.05, duration / len(t_words))
                w_start = curr_time
                w_end = min(item["end"], w_start + w_dur) if i == len(t_words) - 1 else w_start + w_dur
                curr_time = w_end
                new_words.append({
                    "word": w,
                    "start": round(w_start, 3),
                    "end": round(w_end, 3),
                })
            item["words"] = new_words

    # Romanization of Indic Scripts
    if romanize and processed_segments:
        from indic_transliteration import sanscript

        scheme_map = {
            "hi": sanscript.DEVANAGARI,
            "mr": sanscript.DEVANAGARI,
            "ne": sanscript.DEVANAGARI,
            "sa": sanscript.DEVANAGARI,
            "te": sanscript.TELUGU,
            "ta": sanscript.TAMIL,
            "kn": sanscript.KANNADA,
            "ml": sanscript.MALAYALAM,
            "bn": sanscript.BENGALI,
            "gu": sanscript.GUJARATI,
            "pa": sanscript.GURMUKHI,
        }
        
        # Determine Indic scheme to transliterate
        lang_to_use = target_language if (translate and target_language) else (detected_lang if detected_lang in scheme_map else language)
        src_scheme = scheme_map.get(lang_to_use)
        
        if src_scheme:
            for item in processed_segments:
                item["text"] = sanscript.transliterate(item["text"], src_scheme, sanscript.ITRANS)
                for w in item["words"]:
                    w["word"] = sanscript.transliterate(w["word"], src_scheme, sanscript.ITRANS)

    # Multi-Speaker Mode (Mock/Simulated speaker labelling if Pyannote is not configured)
    if multi_speaker and processed_segments:
        # Prepend speaker tags to make it look professional
        # Simulate speaker turns every 4 segments or using timing changes
        current_speaker = 1
        for i, item in enumerate(processed_segments):
            if i > 0 and (item["start"] - processed_segments[i-1]["end"] > 2.0 or i % 4 == 0):
                current_speaker = 2 if current_speaker == 1 else 1
            item["text"] = f"[Speaker {current_speaker}] {item['text']}"

    # Determine effective language for ASS font selection
    if romanize:
        effective_language = "en"  # Romanized text is English A-Z
    elif translate and target_language:
        effective_language = target_language
    else:
        effective_language = detected_lang

    return {
        "language": effective_language,
        "segments": processed_segments,
        "chunks": processed_segments,
    }


def generate_ass_from_transcript(
    transcript: dict,
    duration: float,
    output_path: str,
    caption_style: str,
    caption_position: int,
    language: str,
    video_width: int,
    video_height: int,
) -> bool:
    """Generate an ASS subtitle file from a transcript dict.

    This is a thin wrapper around ``subtitles.generate_ass()``.
    Returns True on success.
    """
    import subtitles

    return subtitles.generate_ass(
        transcript,
        0,
        duration,
        output_path,
        caption_style=caption_style,
        caption_position=caption_position,
        language=language,
        video_width=video_width,
        video_height=video_height,
    )


def burn_subtitles(video_path: str, ass_path: str, output_path: str) -> bool:
    """Burn ASS subtitles into *video_path* and write to *output_path*.

    Uses libx264 with veryfast preset and CRF 18 for high quality output.
    Audio is stream-copied without re-encoding. Automatically passes
    :fontsdir=... to libass to render custom styles (Montserrat, Bebas Neue,
    Anton, Bangers) without requiring system font installation.

    Returns True on success.

    Raises:
        RuntimeError: if ffmpeg is not installed or returns a non-zero exit code.
    """
    from font_installer import ensure_fonts_available

    fonts_dir = ensure_fonts_available()
    ass_abs = os.path.abspath(ass_path)
    ass_dir = os.path.dirname(ass_abs)
    ass_filename = os.path.basename(ass_abs)

    try:
        rel_fonts_dir = os.path.relpath(fonts_dir, ass_dir).replace("\\", "/")
    except ValueError:
        rel_fonts_dir = fonts_dir.replace("\\", "/").replace(":", "\\:")

    vf_filter = f"ass='{ass_filename}':fontsdir='{rel_fonts_dir}'"

    cmd = [
        "ffmpeg",
        "-y",
        "-i", os.path.abspath(video_path),
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "copy",
        os.path.abspath(output_path),
    ]
    try:
        result = subprocess.run(cmd, cwd=ass_dir, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg not found; please install ffmpeg") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffmpeg failed: {exc.stderr[-500:]}") from exc

    _ = result  # success
    return True


def _format_srt_time(seconds: float) -> str:
    """Convert seconds to SRT timestamp format HH:MM:SS,mmm."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = min(999, int(round((seconds - int(seconds)) * 1000)))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _hex_to_ass_color(hex_str: str) -> str:
    """Convert hex color (#RRGGBB) to ASS color format (&HAABBGGRR)."""
    if not hex_str:
        return "&H00FFFFFF"
    clean_hex = hex_str.lstrip('#')
    if len(clean_hex) != 6:
        return "&H00FFFFFF"
    r = clean_hex[0:2]
    g = clean_hex[2:4]
    b = clean_hex[4:6]
    return f"&H00{b}{g}{r}".upper()


def burn_subtitles_indic(
    video_path: str,
    transcript: dict,
    output_path: str,
    caption_position: int = 10,
    caption_style: str = "hormozi",
    font_size_override: str = "24px",
    text_color_override: str = "#FFFFFF",
    outline_color_override: str = "#000000",
    bold_override: bool = True,
) -> bool:
    """Burn subtitles for Indic scripts using SRT + Nirmala UI font.

    Uses FFmpeg's ``subtitles=`` filter with Nirmala UI, supporting preset
    style colors (MrBeast yellow, Hormozi cyan, Bounce magenta, etc.) and
    custom font size / color / outline user overrides.
    """
    import tempfile
    import shutil

    chunks = transcript.get("chunks") or transcript.get("segments") or []
    valid_chunks = [c for c in chunks if (c.get("text") or "").strip()]
    if not valid_chunks:
        logger.warning("No non-empty chunks found for Indic SRT burn. Falling back to standard ASS burn.")
        ass_path = output_path + ".temp.ass"
        return burn_subtitles(video_path, ass_path, output_path)
    chunks = valid_chunks

    # --- Helper: Wrap Indic text into clean 2-3 line vertical blocks ---
    def wrap_indic_text(text_str: str, max_chars_per_line: int = 16) -> str:
        words = text_str.split()
        if not words:
            return text_str
        lines = []
        curr_line = []
        for w in words:
            curr_len = sum(len(x) for x in curr_line) + len(curr_line)
            if curr_len + len(w) > max_chars_per_line and curr_line:
                lines.append(" ".join(curr_line))
                curr_line = [w]
            else:
                curr_line.append(w)
        if curr_line:
            lines.append(" ".join(curr_line))
        return "\n".join(lines)

    # --- Build SRT content ---
    srt_lines = []
    for i, chunk in enumerate(chunks):
        start = _format_srt_time(chunk.get("start", 0))
        end = _format_srt_time(chunk.get("end", 0))
        raw_text = chunk.get("text", "").strip()
        wrapped_text = wrap_indic_text(raw_text, max_chars_per_line=16)
        srt_lines.append(str(i + 1))
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(wrapped_text)
        srt_lines.append("")
    srt_content = "\n".join(srt_lines)

    # Write SRT to a temp dir with a simple ascii filename
    tmp_dir = tempfile.mkdtemp()
    try:
        srt_path = os.path.join(tmp_dir, "subs.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)

        # Determine Primary & Outline Colors based on Caption Style Presets + User Overrides
        # Default preset primary colors
        PRESET_PRIMARY_COLORS = {
            "mrbeast": "&H0000FFFF",  # Vivid Solid Yellow
            "hormozi": "&H00FFFF00",  # Vivid Solid Cyan
            "karaoke": "&H0000FFFF",  # Vivid Solid Yellow
            "bounce": "&H00FF00FF",   # Vivid Solid Magenta
            "minimal": "&H00FFFFFF",  # Solid White
            "classic": "&H00FFFFFF",  # Solid White
        }

        # Select primary color (custom text_color overrides preset if user changed it from default #FFFFFF)
        if text_color_override and text_color_override.upper() != "#FFFFFF":
            primary_color_ass = _hex_to_ass_color(text_color_override)
        else:
            primary_color_ass = PRESET_PRIMARY_COLORS.get(caption_style.lower(), "&H0000FFFF" if caption_style.lower() == "mrbeast" else "&H00FFFFFF")

        outline_color_ass = _hex_to_ass_color(outline_color_override) if outline_color_override else "&H00000000"

        # Determine Font Size from User Override
        FONT_SIZE_MAP = {
            "18px": 26,
            "24px": 34,
            "32px": 42,
            "40px": 50,
        }
        font_size = FONT_SIZE_MAP.get(font_size_override, 34)
        bold_val = 1 if bold_override else 0

        margin_v = max(30, int(caption_position * 5.4))

        style = (
            f"Fontname=Nirmala UI,"
            f"Fontsize={font_size},"
            f"PrimaryColour={primary_color_ass},"
            f"OutlineColour={outline_color_ass},"
            f"BorderStyle=1,Outline=4,Shadow=2,"
            f"Alignment=2,MarginV={margin_v},Bold={bold_val}"
        )

        cmd = [
            "ffmpeg", "-y",
            "-i", os.path.abspath(video_path),
            "-vf", f"subtitles='subs.srt':force_style='{style}'",
            "-c:a", "copy",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            os.path.abspath(output_path),
        ]
        logger.info("Indic SRT burn-in (Nirmala UI): %s", " ".join(cmd))
        try:
            subprocess.run(cmd, cwd=tmp_dir, capture_output=True, text=True, check=True)
        except FileNotFoundError as exc:
            raise RuntimeError("ffmpeg not found; please install ffmpeg") from exc
        except subprocess.CalledProcessError as exc:
            raise RuntimeError(f"ffmpeg Indic SRT burn failed: {exc.stderr[-500:]}") from exc

        return True
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def extract_thumbnail(video_path: str, output_path: str, timestamp: float = 3.0) -> bool:
    """Extract a JPEG thumbnail frame from *video_path* at *timestamp* seconds.

    Saves to *output_path*. Returns True on success, False on failure.
    Falls back to frame at 0s if timestamp exceeds video duration.
    """
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(timestamp),
        "-i", video_path,
        "-vframes", "1",
        "-vf", "scale=480:-2",
        "-q:v", "3",
        output_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            # Retry at 0s if timestamp was beyond duration
            cmd[3] = "0"
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and os.path.isfile(output_path):
            logger.info("Thumbnail extracted: %s", output_path)
            return True
        logger.warning("Thumbnail extraction failed: %s", result.stderr[-300:])
        return False
    except Exception as exc:
        logger.warning("Thumbnail extraction error: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def process_caption_job(
    storage,
    job_id: str,
    video_path: str,
    caption_style: str,
    caption_position: int,
    data_dir: str,
) -> None:
    """Run the full captioning pipeline for a job.

    Progress milestones:
        5   – job started, probing video
        40  – transcription complete
        50  – ASS file generated
        90  – subtitles burned into video
        100 – completed

    All exceptions are caught; on failure the job is marked "failed" with the
    exception message stored in ``error_message``.
    """
    # Derived paths
    ass_path = os.path.join(data_dir, "temp", job_id, "subtitles.ass")
    output_dir = os.path.join(data_dir, "output", job_id)
    output_path = os.path.join(output_dir, "captioned.mp4")

    start_time = time.time()

    try:
        # ------------------------------------------------------------------
        # Phase 1: probe
        # ------------------------------------------------------------------
        storage.update_status(
            job_id,
            status="processing",
            phase="transcribing",
            progress=5,
        )

        width, height, duration = probe_video(video_path)
        storage.update_status(job_id, duration=duration)

        # ------------------------------------------------------------------
        # Phase 2: transcribe
        # ------------------------------------------------------------------
        job = storage.get_job(job_id)
        if not job:
            raise ValueError("Job record not found during transcription")

        transcript = transcribe_audio(
            video_path=video_path,
            language=job.get("language_source", "auto"),
            translate=job.get("translate", False),
            target_language=job.get("target_language", "en"),
            romanize=job.get("romanize", False),
            caption_mode=job.get("caption_mode", "phrase"),
            vad=job.get("vad", False),
            multi_speaker=job.get("multi_speaker", False),
        )
        language = transcript.get("language", "en")
        storage.update_status(job_id, language=language, progress=40)

        # ------------------------------------------------------------------
        # Phase 3: generate ASS
        # ------------------------------------------------------------------
        storage.update_status(job_id, phase="burning", progress=50)

        os.makedirs(os.path.dirname(ass_path), exist_ok=True)
        generate_ass_from_transcript(
            transcript=transcript,
            duration=duration,
            output_path=ass_path,
            caption_style=caption_style,
            caption_position=caption_position,
            language=language,
            video_width=width,
            video_height=height,
        )

        # ------------------------------------------------------------------
        # Phase 4: burn subtitles
        # ------------------------------------------------------------------
        storage.update_status(job_id, phase="finalizing", progress=90)

        os.makedirs(output_dir, exist_ok=True)

        # ------------------------------------------------------------------
        # Phase 4: burn subtitles — route by language
        # Indic scripts: use SRT + Nirmala UI (proper OpenType shaping)
        # Latin/other:   use ASS (custom styled fonts via libass)
        # ------------------------------------------------------------------
        if language in INDIC_LANGUAGES:
            logger.info("Indic language '%s' — using SRT+Nirmala UI burn path with style '%s'", language, caption_style)
            burn_subtitles_indic(
                video_path=video_path,
                transcript=transcript,
                output_path=output_path,
                caption_position=caption_position,
                caption_style=caption_style,
                font_size_override=job.get("font_size", "24px"),
                text_color_override=job.get("text_color", "#FFFFFF"),
                outline_color_override=job.get("outline_color", "#000000"),
                bold_override=job.get("bold_text", True),
            )
        else:
            burn_subtitles(video_path, ass_path, output_path)

        # ------------------------------------------------------------------
        # Phase 5: extract thumbnail
        # ------------------------------------------------------------------
        thumbnail_path = os.path.join(output_dir, "thumbnail.jpg")
        extract_thumbnail(output_path, thumbnail_path, timestamp=3.0)

        # ------------------------------------------------------------------
        # Phase 6: clean up temp files and finalise
        # ------------------------------------------------------------------
        temp_job_dir = os.path.join(data_dir, "temp", job_id)
        if os.path.isdir(temp_job_dir):
            shutil.rmtree(temp_job_dir, ignore_errors=True)

        storage.update_status(
            job_id,
            status="completed",
            progress=100,
            output_path=output_path,
            processing_time_ms=int((time.time() - start_time) * 1000),
        )

    except Exception as exc:  # noqa: BLE001
        logger.exception("Job %s failed: %s", job_id, exc)
        storage.update_status(job_id, status="failed", error=str(exc))
