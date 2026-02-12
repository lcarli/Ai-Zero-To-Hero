/* ============================================
   AIFORALL V2 — Embeddings Engine
   Word vectors, similarity, projections
   ============================================ */

const EmbeddingsEngine = (() => {
  /* ---- Pre-computed 2D positions for common words (simulated embeddings projected to 2D) ---- */
  const WORD_EMBEDDINGS = {
    // Animals
    cat:       { vec: [0.82, 0.15, -0.3, 0.6, 0.1], pos: { x: 0.75, y: 0.25 }, group: 'animals' },
    dog:       { vec: [0.78, 0.20, -0.25, 0.55, 0.15], pos: { x: 0.72, y: 0.28 }, group: 'animals' },
    bird:      { vec: [0.70, 0.10, -0.35, 0.65, 0.05], pos: { x: 0.78, y: 0.20 }, group: 'animals' },
    fish:      { vec: [0.65, 0.05, -0.4, 0.7, 0.0], pos: { x: 0.80, y: 0.15 }, group: 'animals' },
    horse:     { vec: [0.75, 0.25, -0.2, 0.5, 0.2], pos: { x: 0.70, y: 0.32 }, group: 'animals' },
    lion:      { vec: [0.85, 0.30, -0.15, 0.45, 0.25], pos: { x: 0.68, y: 0.35 }, group: 'animals' },
    tiger:     { vec: [0.83, 0.28, -0.18, 0.48, 0.22], pos: { x: 0.69, y: 0.33 }, group: 'animals' },
    elephant:  { vec: [0.80, 0.35, -0.1, 0.40, 0.30], pos: { x: 0.65, y: 0.38 }, group: 'animals' },

    // Royalty / People
    king:      { vec: [0.1, 0.9, 0.8, -0.2, 0.5], pos: { x: 0.20, y: 0.80 }, group: 'royalty' },
    queen:     { vec: [0.1, 0.85, 0.75, -0.15, 0.6], pos: { x: 0.25, y: 0.78 }, group: 'royalty' },
    prince:    { vec: [0.15, 0.80, 0.7, -0.1, 0.45], pos: { x: 0.22, y: 0.74 }, group: 'royalty' },
    princess:  { vec: [0.15, 0.75, 0.65, -0.05, 0.55], pos: { x: 0.27, y: 0.72 }, group: 'royalty' },
    man:       { vec: [0.2, 0.6, 0.5, 0.1, 0.3], pos: { x: 0.30, y: 0.65 }, group: 'people' },
    woman:     { vec: [0.2, 0.55, 0.45, 0.15, 0.4], pos: { x: 0.35, y: 0.63 }, group: 'people' },
    boy:       { vec: [0.25, 0.50, 0.4, 0.2, 0.25], pos: { x: 0.32, y: 0.58 }, group: 'people' },
    girl:      { vec: [0.25, 0.45, 0.35, 0.25, 0.35], pos: { x: 0.37, y: 0.56 }, group: 'people' },

    // Tech
    computer:  { vec: [-0.5, -0.3, 0.8, 0.6, -0.1], pos: { x: 0.20, y: 0.20 }, group: 'tech' },
    software:  { vec: [-0.45, -0.25, 0.75, 0.65, -0.05], pos: { x: 0.23, y: 0.23 }, group: 'tech' },
    program:   { vec: [-0.48, -0.28, 0.78, 0.62, -0.08], pos: { x: 0.22, y: 0.22 }, group: 'tech' },
    code:      { vec: [-0.55, -0.35, 0.85, 0.55, -0.15], pos: { x: 0.18, y: 0.18 }, group: 'tech' },
    algorithm: { vec: [-0.52, -0.32, 0.82, 0.58, -0.12], pos: { x: 0.19, y: 0.19 }, group: 'tech' },
    data:      { vec: [-0.40, -0.20, 0.70, 0.70, 0.0], pos: { x: 0.25, y: 0.25 }, group: 'tech' },
    robot:     { vec: [-0.35, -0.15, 0.65, 0.50, 0.1], pos: { x: 0.28, y: 0.30 }, group: 'tech' },
    machine:   { vec: [-0.42, -0.22, 0.72, 0.60, -0.02], pos: { x: 0.24, y: 0.24 }, group: 'tech' },

    // Food
    apple:     { vec: [0.5, -0.6, -0.5, 0.3, 0.7], pos: { x: 0.75, y: 0.70 }, group: 'food' },
    banana:    { vec: [0.48, -0.55, -0.52, 0.35, 0.72], pos: { x: 0.73, y: 0.72 }, group: 'food' },
    pizza:     { vec: [0.45, -0.65, -0.48, 0.28, 0.68], pos: { x: 0.77, y: 0.68 }, group: 'food' },
    bread:     { vec: [0.42, -0.60, -0.55, 0.32, 0.65], pos: { x: 0.74, y: 0.74 }, group: 'food' },
    rice:      { vec: [0.40, -0.58, -0.50, 0.30, 0.60], pos: { x: 0.72, y: 0.76 }, group: 'food' },
    water:     { vec: [0.35, -0.50, -0.45, 0.25, 0.55], pos: { x: 0.70, y: 0.78 }, group: 'food' },
    coffee:    { vec: [0.38, -0.52, -0.42, 0.22, 0.58], pos: { x: 0.71, y: 0.75 }, group: 'food' },

    // Nature
    sun:       { vec: [0.3, 0.4, -0.6, -0.5, 0.8], pos: { x: 0.45, y: 0.40 }, group: 'nature' },
    moon:      { vec: [0.25, 0.35, -0.65, -0.55, 0.75], pos: { x: 0.48, y: 0.38 }, group: 'nature' },
    star:      { vec: [0.28, 0.38, -0.62, -0.52, 0.78], pos: { x: 0.47, y: 0.39 }, group: 'nature' },
    ocean:     { vec: [0.20, 0.30, -0.70, -0.45, 0.70], pos: { x: 0.50, y: 0.42 }, group: 'nature' },
    mountain:  { vec: [0.22, 0.32, -0.68, -0.48, 0.72], pos: { x: 0.49, y: 0.41 }, group: 'nature' },
    river:     { vec: [0.18, 0.28, -0.72, -0.42, 0.68], pos: { x: 0.52, y: 0.43 }, group: 'nature' },
    tree:      { vec: [0.15, 0.25, -0.75, -0.40, 0.65], pos: { x: 0.53, y: 0.44 }, group: 'nature' },
    flower:    { vec: [0.12, 0.22, -0.78, -0.38, 0.62], pos: { x: 0.55, y: 0.45 }, group: 'nature' },

    // Emotions
    happy:     { vec: [-0.3, 0.7, -0.2, 0.8, -0.5], pos: { x: 0.35, y: 0.85 }, group: 'emotions' },
    sad:       { vec: [-0.35, 0.65, -0.25, 0.75, -0.55], pos: { x: 0.38, y: 0.82 }, group: 'emotions' },
    love:      { vec: [-0.25, 0.75, -0.15, 0.85, -0.45], pos: { x: 0.33, y: 0.88 }, group: 'emotions' },
    angry:     { vec: [-0.40, 0.60, -0.30, 0.70, -0.60], pos: { x: 0.40, y: 0.80 }, group: 'emotions' },
    fear:      { vec: [-0.45, 0.55, -0.35, 0.65, -0.65], pos: { x: 0.42, y: 0.78 }, group: 'emotions' },

    // Actions
    run:       { vec: [0.6, 0.3, 0.2, -0.7, -0.4], pos: { x: 0.55, y: 0.55 }, group: 'actions' },
    walk:      { vec: [0.55, 0.25, 0.15, -0.65, -0.35], pos: { x: 0.53, y: 0.57 }, group: 'actions' },
    eat:       { vec: [0.50, 0.20, 0.10, -0.60, -0.30], pos: { x: 0.58, y: 0.60 }, group: 'actions' },
    sleep:     { vec: [0.45, 0.15, 0.05, -0.55, -0.25], pos: { x: 0.56, y: 0.62 }, group: 'actions' },
    think:     { vec: [0.40, 0.10, 0.0, -0.50, -0.20], pos: { x: 0.54, y: 0.64 }, group: 'actions' },
    speak:     { vec: [0.58, 0.28, 0.18, -0.68, -0.38], pos: { x: 0.57, y: 0.53 }, group: 'actions' },
  };

  const GROUP_COLORS = {
    animals:  '#f59e0b',
    royalty:  '#a855f7',
    people:   '#ec4899',
    tech:     '#6366f1',
    food:     '#10b981',
    nature:   '#06b6d4',
    emotions: '#ef4444',
    actions:  '#f97316',
  };

  const GROUP_LABELS = {
    animals:  '🐾 Animais',
    royalty:  '👑 Realeza',
    people:   '👤 Pessoas',
    tech:     '💻 Tecnologia',
    food:     '🍎 Comida',
    nature:   '🌿 Natureza',
    emotions: '❤️ Emoções',
    actions:  '🏃 Ações',
  };

  /** Cosine similarity between two vectors */
  function cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }

  /** Euclidean distance between two vectors */
  function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  /** Find K most similar words to a given word */
  function findSimilar(word, k = 5) {
    const entry = WORD_EMBEDDINGS[word.toLowerCase()];
    if (!entry) return [];

    const results = [];
    for (const [w, data] of Object.entries(WORD_EMBEDDINGS)) {
      if (w === word.toLowerCase()) continue;
      const sim = cosineSimilarity(entry.vec, data.vec);
      results.push({ word: w, similarity: sim, group: data.group });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, k);
  }

  /** 
   * Word analogy: A is to B as C is to ?
   * vec(B) - vec(A) + vec(C) → closest word 
   */
  function analogy(wordA, wordB, wordC) {
    const a = WORD_EMBEDDINGS[wordA.toLowerCase()];
    const b = WORD_EMBEDDINGS[wordB.toLowerCase()];
    const c = WORD_EMBEDDINGS[wordC.toLowerCase()];
    if (!a || !b || !c) return null;

    // target = B - A + C
    const target = b.vec.map((val, i) => val - a.vec[i] + c.vec[i]);

    let best = null;
    let bestSim = -Infinity;

    for (const [w, data] of Object.entries(WORD_EMBEDDINGS)) {
      if ([wordA, wordB, wordC].includes(w.toLowerCase())) continue;
      const sim = cosineSimilarity(target, data.vec);
      if (sim > bestSim) {
        bestSim = sim;
        best = { word: w, similarity: sim, group: data.group };
      }
    }

    return best;
  }

  /** Generate positional encoding values for visualization */
  function positionalEncoding(position, dModel = 16) {
    const pe = [];
    for (let i = 0; i < dModel; i++) {
      if (i % 2 === 0) {
        pe.push(Math.sin(position / Math.pow(10000, i / dModel)));
      } else {
        pe.push(Math.cos(position / Math.pow(10000, (i - 1) / dModel)));
      }
    }
    return pe;
  }

  /** Get all words */
  function getAllWords() {
    return Object.keys(WORD_EMBEDDINGS);
  }

  /** Get word data */
  function getWordData(word) {
    return WORD_EMBEDDINGS[word.toLowerCase()] || null;
  }

  /** Get all groups */
  function getGroups() {
    return GROUP_LABELS;
  }

  return {
    cosineSimilarity,
    euclideanDistance,
    findSimilar,
    analogy,
    positionalEncoding,
    getAllWords,
    getWordData,
    getGroups,
    GROUP_COLORS,
    GROUP_LABELS,
    WORD_EMBEDDINGS,
  };
})();
