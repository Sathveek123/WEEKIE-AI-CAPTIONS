import os
import json
import logging

KNOWN_TECH_TERMS = {
    # Telugu phonetic mappings
    "ఏఐ": "AI",
    "ఏపీఐ": "API",
    "డౌన్లోడ్": "download",
    "డౌన్‌లోడ్": "download",
    "గూగుల్": "Google",
    "గూగూల్": "Google",
    "యూఐ": "UI",
    "సెటప్": "setup",
    
    # Hindi phonetic mappings
    "एआई": "AI",
    "एपीआई": "API",
    "डाउनलोड": "download",
    "गूगल": "Google",
    "यूआई": "UI",
    "सेटअप": "setup"
}

def get_corrector_dict():
    """
    Loads terms from KNOWN_TECH_TERMS and overlays user overrides from user_terms.json.
    """
    terms = KNOWN_TECH_TERMS.copy()
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    user_terms_path = os.path.join(root_dir, "user_terms.json").replace("\\", "/")
    
    if os.path.exists(user_terms_path):
        try:
            with open(user_terms_path, "r", encoding="utf-8") as f:
                user_terms = json.load(f)
                if isinstance(user_terms, dict):
                    terms.update(user_terms)
                    logging.info(f"TermCorrector: Loaded {len(user_terms)} terms from user_terms.json")
        except Exception as e:
            logging.error(f"TermCorrector: Failed to load user_terms.json: {e}")
            
    return terms

def correct_text(text):
    """
    Performs case-sensitive word-level find and replace for technical terms.
    """
    if not text:
        return text
        
    terms = get_corrector_dict()
    for mangled, corrected in terms.items():
        text = text.replace(mangled, corrected)
        
    return text
