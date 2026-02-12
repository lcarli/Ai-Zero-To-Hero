/* ============================================
   AIFORALL V2 — Tokenizer Engine
   Simulated BPE tokenization for education
   ============================================ */

const TokenizerEngine = (() => {
  /* ---- Predefined vocabulary (GPT-style subwords) ---- */
  const VOCAB = {
    // Special tokens
    '<|start|>': 0, '<|end|>': 1, '<|pad|>': 2,
    // Single characters (fallback)
    ' ': 3, '!': 4, '"': 5, '#': 6, '$': 7, '%': 8, '&': 9, "'": 10,
    '(': 11, ')': 12, '*': 13, '+': 14, ',': 15, '-': 16, '.': 17, '/': 18,
    '0': 19, '1': 20, '2': 21, '3': 22, '4': 23, '5': 24, '6': 25, '7': 26,
    '8': 27, '9': 28, ':': 29, ';': 30, '<': 31, '=': 32, '>': 33, '?': 34,
    '@': 35, 'A': 36, 'B': 37, 'C': 38, 'D': 39, 'E': 40, 'F': 41, 'G': 42,
    'H': 43, 'I': 44, 'J': 45, 'K': 46, 'L': 47, 'M': 48, 'N': 49, 'O': 50,
    'P': 51, 'Q': 52, 'R': 53, 'S': 54, 'T': 55, 'U': 56, 'V': 57, 'W': 58,
    'X': 59, 'Y': 60, 'Z': 61,
    'a': 62, 'b': 63, 'c': 64, 'd': 65, 'e': 66, 'f': 67, 'g': 68, 'h': 69,
    'i': 70, 'j': 71, 'k': 72, 'l': 73, 'm': 74, 'n': 75, 'o': 76, 'p': 77,
    'q': 78, 'r': 79, 's': 80, 't': 81, 'u': 82, 'v': 83, 'w': 84, 'x': 85,
    'y': 86, 'z': 87,
    // Common BPE merges (subwords)
    'th': 100, 'he': 101, 'in': 102, 'er': 103, 'an': 104, 'on': 105,
    'en': 106, 'at': 107, 'or': 108, 'es': 109, 'is': 110, 'it': 111,
    'al': 112, 'ar': 113, 'le': 114, 'ou': 115, 're': 116, 'nd': 117,
    'ed': 118, 'ng': 119, 'se': 120, 'te': 121, 'to': 122, 'of': 123,
    'st': 124, 'de': 125, 'nt': 126, 'io': 127, 'ti': 128, 'co': 129,
    'ce': 130, 'me': 131, 'li': 132, 'ne': 133, 'us': 134, 'ma': 135,
    'el': 136, 'la': 137, 'ra': 138, 've': 139, 'si': 140, 'no': 141,
    'ta': 142, 'ri': 143, 'ch': 144, 'om': 145, 'ic': 146, 'll': 147,
    'un': 148, 'ge': 149, 'pr': 150, 'lo': 151, 'ro': 152, 'na': 153,
    'pe': 154, 'be': 155, 'po': 156, 'fo': 157, 'do': 158, 'mo': 159,
    'wi': 160, 'ha': 161, 'wa': 162, 'wo': 163, 'pa': 164, 'ca': 165,
    'su': 166, 'so': 167, 'mi': 168, 'di': 169, 'ac': 170, 'ab': 171,
    'ad': 172, 'ag': 173, 'ai': 174, 'am': 175, 'ap': 176, 'as': 177,
    'da': 178, 'fi': 179, 'id': 180, 'ig': 181, 'im': 182, 'ir': 183,
    'ke': 184, 'ki': 185, 'og': 186, 'op': 187, 'ow': 188, 'ul': 189,
    'up': 190, 'ut': 191, 'ct': 192,
    // Longer subwords
    'the': 200, 'ing': 201, 'and': 202, 'tion': 203, 'ment': 204,
    'ent': 205, 'ion': 206, 'ate': 207, 'ous': 208, 'ive': 209,
    'all': 210, 'for': 211, 'are': 212, 'not': 213, 'but': 214,
    'you': 215, 'was': 216, 'his': 217, 'her': 218, 'had': 219,
    'one': 220, 'our': 221, 'out': 222, 'has': 223, 'its': 224,
    'can': 225, 'will': 226, 'with': 227, 'this': 228, 'that': 229,
    'from': 230, 'they': 231, 'have': 232, 'been': 233, 'more': 234,
    'when': 235, 'what': 236, 'some': 237, 'time': 238, 'very': 239,
    'them': 240, 'than': 241, 'each': 242, 'make': 243, 'like': 244,
    'just': 245, 'over': 246, 'such': 247, 'take': 248, 'year': 249,
    'also': 250, 'into': 251, 'your': 252, 'good': 253, 'could': 254,
    'work': 255, 'know': 256, 'well': 257, 'back': 258, 'then': 259,
    'only': 260, 'come': 261, 'made': 262, 'after': 263, 'did': 264,
    'two': 265, 'how': 266, 'way': 267, 'about': 268, 'many': 269,
    'most': 270, 'other': 271, 'word': 272, 'which': 273,
    // Common words
    'pre': 280, 'pro': 281, 'inter': 282, 'under': 283, 'trans': 284,
    'com': 285, 'con': 286, 'dis': 287, 'mis': 288, 'non': 289,
    'over': 290, 'art': 291, 'ific': 292, 'ial': 293, 'ell': 294,
    'ence': 295, 'ness': 296, 'able': 297, 'ible': 298, 'ful': 299,
    'less': 300, 'ical': 301, 'ology': 302, 'ize': 303,
    'learn': 310, 'model': 311, 'data': 312, 'neur': 313,
    'net': 314, 'lang': 315, 'uage': 316, 'mach': 317, 'ine': 318,
    'deep': 319, 'train': 320, 'token': 321, 'embed': 322,
    'atten': 323, 'transform': 324, 'gen': 325, 'class': 326,
    'text': 327, 'process': 328, 'nat': 329, 'ural': 330,
    'artific': 331, 'intellig': 332,
  };

  // Reversed vocabulary for decoding
  const REVERSE_VOCAB = {};
  for (const [token, id] of Object.entries(VOCAB)) {
    REVERSE_VOCAB[id] = token;
  }

  // Sorted subwords by length (longest first for greedy matching)
  const SORTED_SUBWORDS = Object.keys(VOCAB)
    .filter((k) => k.length > 1 && !k.startsWith('<|'))
    .sort((a, b) => b.length - a.length);

  /**
   * Tokenize text using greedy longest-match (simulated BPE)
   * Returns array of { text, id, type }
   */
  function tokenize(text) {
    if (!text) return [];

    const tokens = [];
    let i = 0;

    while (i < text.length) {
      let matched = false;

      // Try longest subwords first
      for (const subword of SORTED_SUBWORDS) {
        if (text.substring(i, i + subword.length).toLowerCase() === subword.toLowerCase()) {
          // Preserve original casing in display
          const original = text.substring(i, i + subword.length);
          tokens.push({
            text: original,
            id: VOCAB[subword],
            type: subword.length >= 4 ? 'word' : 'subword',
          });
          i += subword.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Fall back to single character
        const char = text[i];
        const id = VOCAB[char] ?? -1;
        tokens.push({
          text: char,
          id,
          type: 'char',
        });
        i++;
      }
    }

    return tokens;
  }

  /**
   * Character-level tokenization (for comparison)
   */
  function tokenizeCharLevel(text) {
    return [...text].map((char) => ({
      text: char,
      id: VOCAB[char] ?? -1,
      type: 'char',
    }));
  }

  /**
   * Word-level tokenization (for comparison)
   */
  function tokenizeWordLevel(text) {
    // Split by spaces and punctuation
    const parts = text.match(/[\w]+|[^\w\s]|\s+/g) || [];
    return parts.map((part, idx) => ({
      text: part,
      id: VOCAB[part.toLowerCase()] ?? (1000 + idx), // pseudo-ID
      type: /^\s+$/.test(part) ? 'space' : /^\w+$/.test(part) ? 'word' : 'punct',
    }));
  }

  /**
   * Simulate BPE training steps for animation
   * Returns array of merge steps
   */
  function simulateBPESteps(text) {
    // Start from characters
    let units = [...text.toLowerCase()].map((ch) => ({
      text: ch,
      id: VOCAB[ch] ?? -1,
    }));

    const steps = [
      {
        description: 'Texto original dividido em caracteres individuais',
        tokens: units.map((u) => ({ ...u })),
        mergeApplied: null,
      },
    ];

    // Simulate merges
    const MERGE_ORDER = [
      'th', 'he', 'in', 'er', 'an', 'on', 'en', 'at', 'or', 'es',
      'the', 'ing', 'and', 'tion', 'ment',
      'token', 'learn', 'model', 'transform', 'artific', 'intellig',
    ];

    for (const merge of MERGE_ORDER) {
      let newUnits = [];
      let merged = false;
      let i = 0;

      while (i < units.length) {
        // Check if current position starts a merge
        const combined = units
          .slice(i, i + merge.length)
          .map((u) => u.text)
          .join('');

        if (combined === merge && i + merge.length <= units.length) {
          // Check each unit is single-char-length matching
          let canMerge = true;
          let mergeLen = 0;
          let j = i;
          let builtStr = '';

          while (j < units.length && builtStr.length < merge.length) {
            builtStr += units[j].text;
            j++;
          }

          if (builtStr === merge) {
            newUnits.push({
              text: merge,
              id: VOCAB[merge] ?? -1,
            });
            i = j;
            merged = true;
            continue;
          }
        }

        newUnits.push({ ...units[i] });
        i++;
      }

      if (merged) {
        units = newUnits;
        steps.push({
          description: `Merge: "${merge}" → token ID ${VOCAB[merge] ?? '?'}`,
          tokens: units.map((u) => ({ ...u })),
          mergeApplied: merge,
        });
      }

      // Stop after a reasonable number of steps
      if (steps.length >= 8) break;
    }

    return steps;
  }

  /** Get vocabulary size */
  function getVocabSize() {
    return Object.keys(VOCAB).length;
  }

  /** Get color for a token based on its type */
  function getTokenColor(token) {
    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
      '#a855f7', '#3b82f6', '#22d3ee', '#34d399', '#fbbf24',
    ];

    if (token.type === 'char') return '#64748b';
    if (token.type === 'space') return '#334155';

    // Consistent color per token ID
    return colors[Math.abs(token.id) % colors.length];
  }

  return {
    tokenize,
    tokenizeCharLevel,
    tokenizeWordLevel,
    simulateBPESteps,
    getVocabSize,
    getTokenColor,
    VOCAB,
    REVERSE_VOCAB,
  };
})();
