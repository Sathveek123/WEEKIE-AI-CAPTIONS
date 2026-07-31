"""Font installation & management utility for Weekie AI Captions.

Ensures required TTF fonts (Montserrat, Bebas Neue, Bangers, Anton,
Noto Sans, Noto Sans Indic scripts) are available in `backend/fonts/` for FFmpeg's
libass filter.
"""

import logging
import urllib.request
from pathlib import Path

logger = logging.getLogger(__name__)

# Directory containing custom fonts for libass
FONTS_DIR = Path(__file__).parent / "fonts"

# Map of font file name to raw TTF download URL from Google Fonts official repository
FONT_DOWNLOAD_URLS = {
    "Montserrat-Bold.ttf": "https://github.com/julietaula/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf",
    "BebasNeue-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf",
    "Bangers-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf",
    "Anton-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf",
    "NotoSans-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/NotoSans%5Bwdth,wght%5D.ttf",
    "NotoSansDevanagari-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth,wght%5D.ttf",
    "NotoSansKannada-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskannada/NotoSansKannada%5Bwdth,wght%5D.ttf",
    "NotoSansTelugu-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstelugu/NotoSansTelugu%5Bwdth,wght%5D.ttf",
    "NotoSansTamil-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstamil/NotoSansTamil%5Bwdth,wght%5D.ttf",
    "NotoSansMalayalam-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansmalayalam/NotoSansMalayalam%5Bwdth,wght%5D.ttf",
    "NotoSansBengali-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansbengali/NotoSansBengali%5Bwdth,wght%5D.ttf",
    "NotoSansGujarati-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansgujarati/NotoSansGujarati%5Bwdth,wght%5D.ttf",
    "NotoSansGurmukhi-Bold.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansgurmukhi/NotoSansGurmukhi%5Bwdth,wght%5D.ttf",
}


def ensure_fonts_available() -> str:
    """Check if backend/fonts directory has necessary font files.
    Downloads any missing fonts asynchronously/on-demand.

    Returns:
        Absolute path to backend/fonts directory.
    """
    FONTS_DIR.mkdir(parents=True, exist_ok=True)

    for filename, url in FONT_DOWNLOAD_URLS.items():
        font_file = FONTS_DIR / filename
        if not font_file.exists() or font_file.stat().st_size < 1000:
            try:
                logger.info("Downloading font %s to %s", filename, font_file)
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = response.read()
                    if response.status == 200 and len(data) > 1000:
                        with open(font_file, "wb") as out_file:
                            out_file.write(data)
                        logger.info("Successfully downloaded %s (%d bytes)", filename, len(data))
                    else:
                        logger.warning("Downloaded data for %s invalid (%d bytes)", filename, len(data))
            except Exception as exc:
                logger.warning("Failed to download font %s: %s. FFmpeg will fallback to local fonts.", filename, exc)

    return str(FONTS_DIR.resolve())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fonts_path = ensure_fonts_available()
    print(f"Fonts directory ready at: {fonts_path}")
