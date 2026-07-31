def chunk_captions(words, mode="phrase"):
    """
    Groups individual word timestamps into caption blocks.
    
    words: list of dicts: [{'word': '...', 'start': 0.0, 'end': 1.0}, ...]
    mode: 'word' | 'phrase' | 'sentence'
    """
    if not words:
        return []
        
    # Clean input list: ensure word is non-None string
    clean_words = []
    for w in words:
        if isinstance(w, dict) and w.get("word") is not None:
            clean_words.append({
                'word': str(w['word']).strip(),
                'start': float(w.get('start', 0.0)),
                'end': float(w.get('end', 0.0))
            })
            
    if not clean_words:
        return []

    words = clean_words
    chunks = []
    
    if mode == "word":
        # Each word is its own caption block
        for w in words:
            chunks.append({
                'start': w['start'],
                'end': w['end'],
                'text': w['word']
            })
            
    elif mode == "sentence":
        # Group words until we see ending punctuation or a substantial gap (> 1.2s)
        current_chunk = []
        for i, w in enumerate(words):
            current_chunk.append(w)
            word_text = w['word']
            
            is_last = (i == len(words) - 1)
            # Match standard Western punctuation and Hindi full stop '।'
            has_punc = any(word_text.endswith(p) for p in ['.', '?', '!', '।'])
            
            has_gap = False
            if not is_last:
                gap = words[i+1]['start'] - w['end']
                if gap > 1.2:
                    has_gap = True
                    
            if is_last or has_punc or has_gap:
                text = " ".join([item['word'] for item in current_chunk])
                chunks.append({
                    'start': current_chunk[0]['start'],
                    'end': current_chunk[-1]['end'],
                    'text': text
                })
                current_chunk = []
                
    else:  # 'phrase' mode (default, 3-5 words or small gaps)
        current_chunk = []
        max_words_per_phrase = 5
        MAX_CHUNK_DURATION = 8.0  # Force-split any chunk longer than 8s (e.g. Kannada UGC)
        for i, w in enumerate(words):
            # Force flush if adding this word would exceed max duration
            if current_chunk:
                chunk_so_far_duration = w['end'] - current_chunk[0]['start']
                if chunk_so_far_duration > MAX_CHUNK_DURATION:
                    text = " ".join([item['word'] for item in current_chunk])
                    chunks.append({
                        'start': current_chunk[0]['start'],
                        'end': current_chunk[-1]['end'],
                        'text': text
                    })
                    current_chunk = []

            current_chunk.append(w)
            word_text = w['word']
            
            is_last = (i == len(words) - 1)
            has_punc = any(word_text.endswith(p) for p in [',', '.', '?', '!', '।', '،', '۔'])
            
            has_gap = False
            if not is_last:
                gap = words[i+1]['start'] - w['end']
                if gap > 0.8:
                    has_gap = True
                    
            if is_last or len(current_chunk) >= max_words_per_phrase or has_punc or has_gap:
                text = " ".join([item['word'] for item in current_chunk])
                chunks.append({
                    'start': current_chunk[0]['start'],
                    'end': current_chunk[-1]['end'],
                    'text': text
                })
                current_chunk = []
                
    # Tag chunks containing a mix of Latin characters and Indic scripts (U+0900 to U+0D7F)
    import re
    latin_pat = re.compile(r'[a-zA-Z]')
    indic_pat = re.compile(r'[\u0900-\u0d7f]')
    for chunk in chunks:
        txt = chunk.get('text', '')
        if latin_pat.search(txt) and indic_pat.search(txt):
            chunk['mixed_script'] = True
                
    return chunks
