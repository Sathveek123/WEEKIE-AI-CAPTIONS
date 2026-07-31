"""
Subtitle utility helpers for ASS subtitle generation.

Provides text escaping, emoji stripping, and language/script detection for
caption style rendering. All per-script configuration lives in SCRIPT_REGISTRY
— adding a new script means adding one entry.
"""

import re
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Script registry — single source of truth for all per-script settings
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ScriptConfig:
    """Per-script configuration used by both subtitles (libass) and hooks (PIL)."""
    languages: frozenset
    char_width_ratio: float   # Average character width as fraction of font point size
    font_scale: float         # Size reduction vs Latin display fonts (1.0 = no reduction)
    is_rtl: bool = False
    system_font_path: str | None = None  # For hooks (PIL file-path based rendering)


SCRIPT_REGISTRY: dict[str, ScriptConfig] = {
    "latin": ScriptConfig(
        languages=frozenset({
            "en", "es", "fr", "de", "pt", "it", "nl", "pl", "ro", "sv",
            "no", "da", "fi", "cs", "sk", "hu", "hr", "sl", "et", "lv",
            "lt", "id", "ms", "vi", "tl", "sw", "tr", "az", "uz",
        }),
        char_width_ratio=0.55,  # Anton/Bebas/Montserrat uppercase (narrow display)
        font_scale=1.0,
    ),
    "cyrillic": ScriptConfig(
        languages=frozenset({"ru", "uk", "bg", "sr", "mk", "be", "kk", "ky", "mn", "tg"}),
        char_width_ratio=0.85,  # IBM Plex Sans Bold UPPERCASE
        font_scale=0.50,
    ),
    "cjk": ScriptConfig(
        languages=frozenset({"zh", "ja", "ko"}),
        char_width_ratio=1.05,  # Full-width ideographs
        font_scale=0.65,
        system_font_path="/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ),
    "arabic": ScriptConfig(
        languages=frozenset({"ar", "ur", "fa"}),
        char_width_ratio=0.58,  # Heavy ligatures compress effective width
        font_scale=0.50,
        is_rtl=True,
        system_font_path="/usr/share/fonts/truetype/ibm-plex/IBMPlexSansArabic-Regular.ttf",
    ),
    "devanagari": ScriptConfig(
        languages=frozenset({"hi", "mr", "ne", "sa", "bh", "bho", "mai"}),
        char_width_ratio=0.70,  # Wide conjuncts
        font_scale=0.50,
        system_font_path="/usr/share/fonts/truetype/ibm-plex/IBMPlexSansDevanagari-Regular.ttf",
    ),
    "telugu": ScriptConfig(
        languages=frozenset({"te"}),
        char_width_ratio=0.75,
        font_scale=0.70,
    ),
    "tamil": ScriptConfig(
        languages=frozenset({"ta"}),
        char_width_ratio=0.72,
        font_scale=0.50,
    ),
    "kannada": ScriptConfig(
        languages=frozenset({"kn"}),
        char_width_ratio=0.75,
        font_scale=0.50,
    ),
    "malayalam": ScriptConfig(
        languages=frozenset({"ml"}),
        char_width_ratio=0.78,
        font_scale=0.50,
    ),
    "bengali": ScriptConfig(
        languages=frozenset({"bn", "as"}),
        char_width_ratio=0.72,
        font_scale=0.50,
    ),
    "gujarati": ScriptConfig(
        languages=frozenset({"gu"}),
        char_width_ratio=0.72,
        font_scale=0.50,
    ),
    "gurmukhi": ScriptConfig(
        languages=frozenset({"pa"}),
        char_width_ratio=0.70,
        font_scale=0.50,
    ),
    "thai": ScriptConfig(
        languages=frozenset({"th"}),
        char_width_ratio=0.62,  # Moderate width with tone marks
        font_scale=0.50,
        system_font_path="/usr/share/fonts/truetype/ibm-plex/IBMPlexSansThai-Regular.ttf",
    ),
    "hebrew": ScriptConfig(
        languages=frozenset({"he", "yi"}),
        char_width_ratio=0.58,  # Relatively narrow
        font_scale=0.50,
        is_rtl=True,
        system_font_path="/usr/share/fonts/truetype/ibm-plex/IBMPlexSansHebrew-Regular.ttf",
    ),
}

# Default for languages not matched to any script in the registry
_DEFAULT_CONFIG = ScriptConfig(
    languages=frozenset(),
    char_width_ratio=0.70,
    font_scale=0.50,
)

# Target subtitle text width in pixels.
_TARGET_LINE_WIDTH_PX = 850


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_script_config(language: str) -> tuple[str, ScriptConfig]:
    """Look up script name and config for a language code."""
    if not language:
        return "unknown", _DEFAULT_CONFIG
    for script_name, config in SCRIPT_REGISTRY.items():
        if language in config.languages:
            return script_name, config
    return "unknown", _DEFAULT_CONFIG


def is_latin_language(language: str) -> bool:
    """Check if the language uses Latin script (suitable for style fonts)."""
    script, _ = get_script_config(language)
    return script == "latin"


def is_rtl_language(language: str) -> bool:
    """Check if the language is right-to-left."""
    _, config = get_script_config(language)
    return config.is_rtl


def get_subtitle_layout(language: str, font_size: int = 105):
    """Compute (max_chars_per_line, font_scale) for the given language and font size."""
    _, config = get_script_config(language)
    effective_size = font_size * config.font_scale
    avg_char_px = effective_size * config.char_width_ratio
    max_chars = max(5, int(_TARGET_LINE_WIDTH_PX / avg_char_px))
    return max_chars, config.font_scale


def strip_emojis(text: str) -> str:
    """Remove emoji and Unicode symbols that libass cannot render."""
    if text is None:
        return ""
    text_str = str(text)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002500-\U00002BEF"  # misc symbols
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001f926-\U0001f937"
        "\U00010000-\U0010ffff"
        "]+", flags=re.UNICODE
    )
    return emoji_pattern.sub('', text_str).strip()


def escape_ass_text(text: str) -> str:
    """Escape text for safe use in ASS subtitle files."""
    if text is None:
        return ""
    text_str = str(text)
    text_str = text_str.replace("\\", "\\\\")  # Escape backslashes first
    text_str = text_str.replace("{", "\\{")
    text_str = text_str.replace("}", "\\}")
    text_str = text_str.replace("\n", " ")   # Newlines as spaces
    return text_str


def get_fallback_font(language: str) -> str:
    """Return the best font family name for non-Latin languages."""
    script, _ = get_script_config(language)

    if script == "telugu":
        return "Noto Sans Telugu"
    elif script == "kannada":
        return "Noto Sans Kannada"
    elif script == "devanagari":
        return "Noto Sans Devanagari"
    elif script == "tamil":
        return "Noto Sans Tamil"
    elif script == "malayalam":
        return "Noto Sans Malayalam"
    elif script == "bengali":
        return "Noto Sans Bengali"
    elif script == "gujarati":
        return "Noto Sans Gujarati"
    elif script == "gurmukhi":
        return "Noto Sans Gurmukhi"
    elif script == "cjk":
        if language == "ja":
            return "Meiryo"
        elif language == "ko":
            return "Malgun Gothic"
        else:  # zh
            return "Microsoft YaHei"
    elif script == "thai":
        return "Leelawadee UI"
    elif script in {"arabic", "hebrew", "cyrillic"}:
        return "Noto Sans"
    return "Noto Sans"
