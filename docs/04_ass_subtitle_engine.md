# 04 — ASS Subtitle Engine

## What Is ASS Format?

**ASS (Advanced SubStation Alpha)** is a sophisticated subtitle format that goes far beyond simple `.srt` files. It supports:

- Per-event rich text styling (font, size, color, bold, italic)
- Per-character inline override tags (`\c`, `\fscx`, `\kf`, `\t`, `\fsp`, etc.)
- Multi-style subtitle documents (separate `[V4+ Styles]` definitions)
- Precise millisecond timing
- Complex karaoke/animation transforms via `\t()` function
- Word spacing control via `\fscx` (horizontal scale) tricks

FFmpeg's `libass` renderer understands ASS natively and burns it frame-by-frame into video.

---

## ASS File Structure

A generated `.ass` file from Weekie AI looks like:

```ass
[Script Info]
ScriptType: v4.00+
WrapStyle: 3
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, ...
Style: Default,Montserrat,105,&H00FFFFFF,...

[Events]
Format: Layer, Start, End, Style, Name, MarginV, ...
Dialogue: 0,0:00:00.00,0:00:00.60,Default,,0,...,{\c&H00FFFF00&}HELLO{\r} WORLD
Dialogue: 0,0:00:00.70,0:00:01.20,Default,,0,...,HELLO {\c&H00FFFF00&}WORLD{\r}
```

### Key ASS Override Tags Used

| Tag | Purpose | Example |
|-----|---------|---------|
| `\c&HBBGGRR&` | Set text color (ASS BGR format!) | `\c&H00FFFF&` = Cyan |
| `\r` | Reset to default style | End of highlight block |
| `\kf{cs}` | Karaoke fill duration (centiseconds) | `\kf50` = 0.5s wipe |
| `\fscx{n}` | Horizontal scale percent | `\fscx110` = 110% wide |
| `\fscy{n}` | Vertical scale percent | `\fscy110` = 110% tall |
| `\t(t1,t2,tags)` | Timed transform animation | `\t(0,50,\fscx120)` |
| `\fsp{n}` | Letter spacing in pixels | `\fsp3` = 3px spacing |
| `\N` | Hard line break | Multi-line subtitle |

> ⚠️ **Important**: ASS colors are in **BGR** format (`\c&H00BBAABB&`), not RGB. The `rgb_to_ass()` function in `caption_styles.py` handles this conversion correctly.

---

## How Word-Level Animation Works

### The Core Technique

For each word in a subtitle group, Weekie AI generates a **separate ASS dialogue event** that covers only the duration that word is being spoken. Every event contains the **full line of text**, but only the currently-spoken word has a color highlight tag applied.

**Example**: Three words "HELLO WORLD THERE" where "WORLD" is currently spoken:

```
Dialogue: ..., HELLO {\c&H00FFFF00&}WORLD{\r} THERE
```

This creates the illusion of a word-by-word animated highlight — each word gets its own event with its highlight color, while the others appear in the default style.

### Multi-Line Grouping Logic (`subtitles.py`)

Words are grouped into subtitle blocks based on character count limits:

```python
max_chars_per_line, font_scale = get_subtitle_layout(language, style_config.font_size)
max_lines = 2
```

Language-aware limits from `subtitle_utils.py`:
- **Latin scripts**: ~18 chars per line (wide characters)  
- **CJK (Chinese/Japanese/Korean)**: ~10 chars per line (each character is wide)
- **Arabic/Hebrew**: ~20 chars per line (RTL-specific handling)

When a subtitle block fills 2 lines, it's flushed and a new block starts.

### Line Break Events

When a word goes to a new display line within the same subtitle block, `\N` (hard line break) is inserted into the ASS text:

```python
if prev_line_idx is not None and line_idx != prev_line_idx:
    text_parts.append("\\N")
```

---

## Color Format Conversion

ASS uses **BGR with alpha**, format: `&HAABBGGRR&`

| Component | Bits | Range | Meaning |
|-----------|------|-------|---------|
| AA | 7:0 | 0–255 | Alpha (0=opaque, 255=transparent) |
| BB | 15:8 | 0–255 | Blue channel |
| GG | 23:16 | 0–255 | Green channel |
| RR | 31:24 | 0–255 | Red channel |

The conversion pipeline in `caption_styles.py`:
```python
# Hex "#00FFFF" (Cyan) → RGB → ASS BGR
hex_to_rgb("#00FFFF")    # → (0, 255, 255)
rgb_to_ass(0, 255, 255)  # → "&H00FFFF00&"
```

---

## ASS Rendering via FFmpeg libass

FFmpeg uses the `ass` video filter to render `.ass` files frame-by-frame:

```
ffmpeg -i input.mp4 -vf "ass='path/to/subtitles.ass'" -c:v libx264 output.mp4
```

FFmpeg's `libass` renderer:
- Renders text at native video resolution (1080×1920 for vertical)
- Applies all ASS style overrides including `\t()` animation transforms
- Scales fonts, outlines, and shadows correctly based on `PlayResX`/`PlayResY`
- Handles Unicode characters, RTL text, and CJK characters

The output video preserves the original audio unchanged (`-c:a copy`).

---

## Vertical Position System

Caption vertical position is controlled by `MarginV` in the ASS style:

```python
new_style.marginv = int(play_res_y * caption_position / 100)
```

For a 1920px tall vertical video:
- `caption_position = 10` → `marginv = 192px` (10% from bottom)  
- `caption_position = 30` → `marginv = 576px` (30% from bottom)
- `caption_position = 50` → `marginv = 960px` (center screen)

The user drags this in the live phone preview in Caption Studio (`/studio`).

---

## Script-Aware Font Scaling

`subtitle_utils.get_subtitle_layout()` returns `(max_chars, font_scale)` based on language:

| Language Group | Font Scale | Max Chars/Line | Reason |
|---------------|-----------|----------------|--------|
| Latin (en, fr, de, es...) | 1.0× | 18 | Standard Roman alphabet |
| CJK (zh, ja, ko) | 0.85× | 10 | Ideograms are wider |
| Arabic/Hebrew (RTL) | 0.9× | 20 | RTL rendering considerations |
| Devanagari (hi, mr...) | 0.9× | 16 | Complex conjuncts |
| Thai | 0.9× | 18 | Tone marks use vertical space |

The `font_scale` is multiplied into:
- `fontsize`
- `outline` thickness  
- `shadow` depth
- `marginl`/`marginr` margins

This ensures subtitles remain readable at the right size for every script.
