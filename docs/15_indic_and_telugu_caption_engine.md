# Indic & Telugu Caption Rendering Engine

## Overview

Weekie AI Captions provides native, first-class support for **Indic Languages**, including **Telugu**, **Hindi**, **Bengali**, **Tamil**, **Kannada**, **Gujarati**, **Malayalam**, and **Punjabi**, specifically formatted for viral vertical video formats (YouTube Shorts, Instagram Reels, TikTok).

---

## 1. Automatic Multi-Line Word Wrapping (`wrap_indic_text`)

Complex Indic scripts (like Telugu, Devanagari, and Tamil) contain compound glyphs and conjuncts that overflow traditional single-line subtitle banners. 

We implemented a dedicated text wrapping engine (`backend/subtitle_utils.py`) that chunks long phrases into **2-3 vertically stacked, centered lines** ideal for vertical 9:16 aspect ratio videos:

```python
def wrap_indic_text(text: str, max_chars_per_line: int = 16) -> str:
    """
    Wraps long Indic text (Telugu, Hindi, etc.) into multiple lines 
    separated by ASS line breaks (\\N) for vertical 9:16 mobile screens.
    """
    words = text.strip().split()
    if not words:
        return text

    lines = []
    current_line = []
    current_length = 0

    for word in words:
        if current_length + len(word) + (1 if current_line else 0) <= max_chars_per_line:
            current_line.append(word)
            current_length += len(word) + (1 if len(current_line) > 1 else 0)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
            current_length = len(word)

    if current_line:
        lines.append(" ".join(current_line))

    return r"\N".join(lines)
```

---

## 2. Style Presets & YouTube Shorts Typography

| Preset Name | Primary Text Color | Outline Color | Animation | Typography / Style |
| :--- | :--- | :--- | :--- | :--- |
| **MrBeast** | Bright Yellow (`#FFD874`) | Solid Black (`#000000`) | Karaoke Word Highlight | Bold Impact Font, 4px Outline |
| **Hormozi** | Vibrant Cyan (`#00FFFF`) | Dark Shadow | Scale & Bounce | Bold All-Caps Modern |
| **Karaoke** | Neon Yellow (`#FFFF00`) | Dark Outline | Active Word Glow | Word-by-Word Singalong |
| **Minimal** | Clean White (`#FFFFFF`) | Soft Shadow | Fade In | Elegant Modern Clean |
| **Bounce** | Magenta Pink (`#FF00FF`) | Black Outline | Bounce Entrance | High-Energy Creative |
| **Classic** | Crisp White (`#FFFFFF`) | Black Outline | Standard | Traditional Subtitle |

---

## 3. Font System & FFmpeg ASS Subtitle Burn-in

To render Indic characters accurately without missing glyph boxes (□), the rendering engine mounts Google Noto Sans Indic TrueType fonts:

```
backend/fonts/
├── NotoSansTelugu-Bold.ttf
├── NotoSansDevanagari-Bold.ttf
├── NotoSansBengali-Bold.ttf
├── NotoSansTamil-Bold.ttf
├── NotoSansKannada-Bold.ttf
├── NotoSansMalayalam-Bold.ttf
└── NotoSansGujarati-Bold.ttf
```

### FFmpeg Filter Graph Command:
```bash
ffmpeg -i input.mp4 -vf "subtitles=subtitles.ass:fontsdir=backend/fonts" -c:a copy output.mp4
```
