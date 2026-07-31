# 03 — Caption Styles — All 6 Animated Presets

## Overview

Weekie AI ships with **6 hand-crafted caption presets** designed to match the most viral subtitle styles used on TikTok, YouTube Shorts, and Instagram Reels as of 2025–2026. Each style is defined once in a **shared JSON config** (`caption-styles.config.json`) and consumed identically by both the **frontend preview** (TypeScript) and **backend renderer** (Python/ASS).

This shared-config approach eliminates configuration drift — what you preview on screen is **exactly** what gets burned into the video.

---

## Style Configuration Architecture

```
backend/caption-styles.config.json   ← single source of truth
         │
         ├─► backend/caption_styles.py   (Python dataclasses)
         │         ↓
         │   CaptionStyleConfig (used in subtitles.py ASS generation)
         │
         └─► frontend/src/lib/caption-styles.ts  (TypeScript types)
                   ↓
             CaptionStylePicker UI + PhonePreview rendering
```

---

## Style 1: Hormozi

> Inspired by Alex Hormozi's bold educational content style

| Property | Value |
|----------|-------|
| **Font** | Montserrat (Fallback: IBM Plex Sans) |
| **Font Size** | 105px |
| **Primary Color** | White `#FFFFFF` |
| **Highlight Color** | Cyan `#00FFFF` |
| **Outline** | Black `#000000`, 5.0px thick |
| **Shadow** | Black, 4.5px depth, 50% opacity |
| **Bold** | Yes |
| **Animation** | `highlight` — per-word color change |
| **Best For** | Business, motivation, education |

**Visual Effect**: White text on dark video, the currently-spoken word flashes cyan. Bold Montserrat gives authority and clarity.

---

## Style 2: MrBeast

> Inspired by MrBeast's gaming/entertainment thumbnail typography

| Property | Value |
|----------|-------|
| **Font** | Bebas Neue (Fallback: IBM Plex Sans) |
| **Font Size** | 120px (largest of all styles) |
| **Primary Color** | Yellow `#FFFF00` |
| **Highlight Color** | Orange `#FF6600` |
| **Outline** | Black `#000000`, 8.0px (thickest of all styles) |
| **Shadow** | Black, 6.0px depth, fully opaque |
| **Bold** | Yes |
| **Animation** | `highlight` — per-word color change |
| **Best For** | Gaming, entertainment, challenges |

**Visual Effect**: Massive yellow text with thick black outline. Current word turns orange. Maximum screen presence.

---

## Style 3: Karaoke

> Wipe-style animation like classic karaoke subtitle systems

| Property | Value |
|----------|-------|
| **Font** | Montserrat (Fallback: IBM Plex Sans) |
| **Font Size** | 105px |
| **Primary Color** | White `#FFFFFF` |
| **Highlight Color** | Blue `#0080FF` |
| **Outline** | Black `#000000`, 4.0px |
| **Shadow** | Black, 3.0px depth, 50% opacity |
| **Bold** | Yes |
| **Animation** | `karaoke` — `\kf` timing wipe fill from left to right |
| **Best For** | Music content, sing-alongs, lyrics videos |

**Visual Effect**: Uses ASS `\kf` (karaoke fill) tag to create a left-to-right color sweep across each word as it is spoken. Extremely satisfying for musical content.

> **Note**: For RTL languages (Arabic, Hebrew), karaoke wipe is replaced with simple `highlight` since `\kf` is a left-to-right operation.

---

## Style 4: Minimal

> Clean, professional look inspired by premium brand content

| Property | Value |
|----------|-------|
| **Font** | Bebas Neue (Fallback: IBM Plex Sans) |
| **Font Size** | 120px |
| **Primary Color** | White `#FFFFFF` |
| **Highlight Color** | Near-white `#F5F5F5` |
| **Outline** | Black `#000000`, 4.0px |
| **Shadow** | Black, 3.0px, 50% opacity |
| **Bold** | Yes |
| **Italic** | Yes |
| **Letter Spacing** | 3.0px (`\fsp` tag) |
| **Word Spacing** | 110% (10% wider than normal) |
| **Animation** | `scale` — 110% scale pop on active word |
| **Best For** | Professional, corporate, tech content |

**Visual Effect**: Subtle scale animation (`\fscx110\fscy110`) on the active word. Near-invisible highlight keeps text clean. Extra letter spacing gives premium feel.

---

## Style 5: Bounce

> Playful, energetic animation for fun viral content

| Property | Value |
|----------|-------|
| **Font** | Bangers (Fallback: IBM Plex Sans) |
| **Font Size** | 110px |
| **Primary Color** | Neon Green `#00FF88` |
| **Highlight Color** | Magenta `#FF00FF` |
| **Outline** | Black `#000000`, 5.0px |
| **Shadow** | Black, 5.0px depth, fully opaque |
| **Bold** | Yes |
| **Animation** | `bounce` — spring scale animation |
| **Best For** | Comedy, memes, fun/energetic content |

**Visual Effect**: Active word scales up to 120% then bounces back to 100% using ASS `\t()` transform animation:
```
\t(0,50,\fscx120\fscy120)\t(50,100,\fscx100\fscy100)
```
Combined with neon green + magenta, creates a playful pop effect.

---

## Style 6: Classic

> Traditional yellow subtitle look, proven viral formula

| Property | Value |
|----------|-------|
| **Font** | Anton (Fallback: IBM Plex Sans) |
| **Font Size** | 105px |
| **Primary Color** | White `#FFFFFF` |
| **Highlight Color** | Yellow `#FFFF00` |
| **Outline** | Black `#000000`, 6.0px |
| **Shadow** | Black, 3.0px depth, 70% opacity |
| **Bold** | Yes |
| **Animation** | `highlight` — per-word yellow flash |
| **Best For** | Viral clips, reaction content, general purpose |

**Visual Effect**: White text with Anton font, active word turns yellow. Classic subtitle feel that audiences recognize instantly.

---

## Animation Type Reference

| Type | ASS Tags Used | Effect |
|------|--------------|--------|
| `highlight` | `\c{color}...{\r}` | Instant color swap on active word |
| `karaoke` | `\kf{duration}\c{color}...{\r}` | Left-to-right wipe fill |
| `scale` | `\fscx110\fscy110\c{color}...{\r}` | 10% scale-up on active word |
| `bounce` | `\t(0,50,\fscx120\fscy120)\t(50,100,\fscx100\fscy100)\c{color}` | Spring bounce to 120% then back |

---

## Adding a Custom Style

To add a new style:

1. Add entry to `backend/caption-styles.config.json`
2. Copy the same entry to `frontend/src/shared/caption-styles.config.json` (keep in sync!)
3. Add the style ID to `CAPTION_STYLES` array in `frontend/src/lib/caption-styles.ts`
4. Add matching UI metadata (name, description, bestFor) in the frontend config

> **Warning**: The JSON config is duplicated in both `backend/` and `frontend/src/shared/` for deployment flexibility. Always keep both in sync.
