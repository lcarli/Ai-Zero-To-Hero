/* ============================================
   AIFORALL V2 — LLM Engine
   Simulated transformer pipeline:
   Input → Tokenize → Embed → N×TransformerBlock → Predict
   ============================================ */

const LLMEngine = (() => {

  /* ---- Simplified bigram/trigram language model ---- */
  const TRANSITIONS = {
    'the':       ['cat', 'dog', 'king', 'queen', 'quick', 'big', 'sun', 'happy', 'old', 'small'],
    'a':         ['cat', 'dog', 'bird', 'man', 'woman', 'robot', 'tree', 'star', 'big', 'fast'],
    'cat':       ['sat', 'is', 'was', 'ran', 'jumped', 'loves', 'sleeps', 'ate'],
    'dog':       ['sat', 'is', 'was', 'ran', 'barked', 'loves', 'sleeps', 'ate'],
    'king':      ['is', 'was', 'ruled', 'loved', 'and', 'of'],
    'queen':     ['is', 'was', 'ruled', 'loved', 'and', 'of'],
    'sat':       ['on', 'down', 'quietly', 'there', 'beside'],
    'on':        ['the', 'a', 'top', 'it'],
    'is':        ['happy', 'sad', 'big', 'small', 'fast', 'good', 'not', 'very', 'the', 'a'],
    'was':       ['happy', 'sad', 'big', 'small', 'fast', 'good', 'not', 'very', 'the', 'a'],
    'happy':     ['and', 'but', 'today', 'because', 'cat', 'dog'],
    'sad':       ['and', 'but', 'today', 'because', 'cat', 'dog'],
    'ran':       ['fast', 'away', 'home', 'to', 'quickly'],
    'jumped':    ['over', 'high', 'up', 'quickly'],
    'over':      ['the', 'a', 'it', 'there'],
    'quick':     ['brown', 'cat', 'dog', 'fox'],
    'brown':     ['fox', 'cat', 'dog', 'bear'],
    'fox':       ['jumped', 'ran', 'is', 'was'],
    'big':       ['cat', 'dog', 'house', 'tree', 'and'],
    'small':     ['cat', 'dog', 'bird', 'house', 'and'],
    'man':       ['is', 'was', 'ran', 'walked', 'loves'],
    'woman':     ['is', 'was', 'ran', 'walked', 'loves'],
    'loves':     ['the', 'a', 'cats', 'dogs', 'food', 'music'],
    'not':       ['happy', 'sad', 'good', 'bad', 'fast', 'big'],
    'very':      ['happy', 'sad', 'good', 'bad', 'fast', 'big', 'small'],
    'and':       ['the', 'a', 'happy', 'sad', 'was', 'is'],
    'i':         ['am', 'love', 'think', 'want', 'see', 'know'],
    'am':        ['happy', 'sad', 'not', 'very', 'a', 'the'],
    'love':      ['the', 'cats', 'dogs', 'you', 'music', 'food'],
    'good':      ['and', 'but', 'cat', 'dog', 'morning'],
    'bad':       ['and', 'but', 'cat', 'dog', 'day'],
    'fast':      ['cat', 'dog', 'and', 'but', 'runner'],
    'old':       ['cat', 'dog', 'man', 'woman', 'king', 'tree'],
    'to':        ['the', 'a', 'run', 'eat', 'go', 'see'],
  };

  /* ---- Temperature sampling ---- */
  function sampleWithTemperature(probs, temperature = 1.0) {
    if (temperature <= 0.01) {
      // Greedy
      let maxIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[maxIdx]) maxIdx = i;
      }
      return maxIdx;
    }

    // Apply temperature
    const scaled = probs.map(p => Math.pow(p, 1 / temperature));
    const sum = scaled.reduce((s, v) => s + v, 0);
    const normed = scaled.map(v => v / sum);

    // Sample
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < normed.length; i++) {
      cumulative += normed[i];
      if (r <= cumulative) return i;
    }
    return normed.length - 1;
  }

  /* ---- Top-K filtering ---- */
  function topKFilter(words, probs, k = 5) {
    const indexed = probs.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => b.p - a.p);
    const topK = indexed.slice(0, k);
    const sum = topK.reduce((s, v) => s + v.p, 0);
    return topK.map(v => ({
      word: words[v.i],
      prob: v.p / sum,
      originalProb: v.p,
    }));
  }

  /* ---- Top-P (nucleus) filtering ---- */
  function topPFilter(words, probs, p = 0.9) {
    const indexed = probs.map((prob, i) => ({ prob, i }));
    indexed.sort((a, b) => b.prob - a.prob);

    let cumulative = 0;
    const nucleus = [];
    for (const item of indexed) {
      nucleus.push(item);
      cumulative += item.prob;
      if (cumulative >= p) break;
    }

    const sum = nucleus.reduce((s, v) => s + v.prob, 0);
    return nucleus.map(v => ({
      word: words[v.i],
      prob: v.prob / sum,
      originalProb: v.prob,
    }));
  }

  /**
   * Get next-word probabilities for a given word.
   * Returns { candidates: [{word, prob}], rawScores }
   */
  function getNextWordProbs(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    const candidates = TRANSITIONS[w] || ['the', 'a', 'is', 'and', 'to'];
    const n = candidates.length;

    // Generate descending probabilities (zipf-like)
    const rawScores = [];
    for (let i = 0; i < n; i++) {
      rawScores.push(1 / (i + 1) + Math.random() * 0.1);
    }
    const sum = rawScores.reduce((s, v) => s + v, 0);
    const probs = rawScores.map(v => v / sum);

    return {
      candidates: candidates.map((c, i) => ({ word: c, prob: probs[i] })),
      rawScores: probs,
    };
  }

  /**
   * Simulate full LLM pipeline step-by-step.
   * Returns pipeline stages for visualization.
   */
  function simulatePipeline(inputText) {
    const tokens = inputText.trim().split(/\s+/);
    const lastToken = tokens[tokens.length - 1];

    // Stage 1: Tokenization
    const tokenized = tokens.map((t, i) => ({
      token: t,
      id: Math.floor(Math.random() * 50000) + 100,
    }));

    // Stage 2: Embeddings (simulated 4D)
    const embeddings = tokens.map(t => {
      const vec = AttentionEngine?.getVec?.(t) || [
        Math.random() * 0.8,
        Math.random() * 0.8,
        Math.random() * 0.8,
        Math.random() * 0.8,
      ];
      return { token: t, vec };
    });

    // Stage 3: Positional encoding
    const withPosition = embeddings.map((e, i) => ({
      ...e,
      posEnc: [
        Math.sin(i / Math.pow(10000, 0 / 4)),
        Math.cos(i / Math.pow(10000, 0 / 4)),
        Math.sin(i / Math.pow(10000, 2 / 4)),
        Math.cos(i / Math.pow(10000, 2 / 4)),
      ],
    }));

    // Stage 4: Transformer blocks (simulated N layers)
    const numLayers = 6;
    const layers = [];
    for (let l = 0; l < numLayers; l++) {
      layers.push({
        layer: l + 1,
        operations: ['Self-Attention', 'Add & Norm', 'Feed-Forward', 'Add & Norm'],
      });
    }

    // Stage 5: Final linear + softmax
    const { candidates } = getNextWordProbs(lastToken);

    return {
      input: inputText,
      stages: [
        {
          name: 'Tokenização',
          icon: '🧩',
          desc: 'Texto é dividido em tokens e convertido em IDs numéricos.',
          data: tokenized,
        },
        {
          name: 'Embedding + Posição',
          icon: '📐',
          desc: 'Cada token recebe um vetor denso + informação de posição.',
          data: withPosition,
        },
        {
          name: `${numLayers}× Transformer Blocks`,
          icon: '🔄',
          desc: `A sequência passa por ${numLayers} camadas, cada uma com Self-Attention + Feed-Forward.`,
          data: layers,
        },
        {
          name: 'Linear + Softmax',
          icon: '📊',
          desc: 'O output do último token é projetado no vocabulário → probabilidades para o próximo token.',
          data: candidates,
        },
      ],
    };
  }

  /**
   * Generate text token by token.
   * Returns array of steps with chosen word and alternatives.
   */
  function generateSequence(prompt, maxTokens = 8, temperature = 0.8, topK = 5) {
    const words = prompt.trim().split(/\s+/);
    const steps = [];

    for (let step = 0; step < maxTokens; step++) {
      const lastWord = words[words.length - 1];
      const { candidates, rawScores } = getNextWordProbs(lastWord);
      const filtered = topKFilter(
        candidates.map(c => c.word),
        candidates.map(c => c.prob),
        topK
      );

      // Sample
      const idx = sampleWithTemperature(
        filtered.map(f => f.prob),
        temperature
      );
      const chosen = filtered[idx];

      steps.push({
        step: step + 1,
        context: [...words],
        candidates: filtered,
        chosen: chosen.word,
        chosenProb: chosen.prob,
      });

      words.push(chosen.word);
    }

    return { prompt, generated: words.join(' '), steps };
  }

  /** Model size comparison data */
  const MODEL_SIZES = [
    { name: 'GPT-2',        params: '1.5B',   layers: 48,  dModel: 1600,  heads: 25,  vocab: '50K',   year: 2019 },
    { name: 'GPT-3',        params: '175B',  layers: 96,  dModel: 12288, heads: 96,  vocab: '50K',   year: 2020 },
    { name: 'GPT-4',        params: '~1.8T',  layers: '~120', dModel: '~?', heads: '~?', vocab: '100K',  year: 2023 },
    { name: 'LLaMA 2',      params: '70B',   layers: 80,  dModel: 8192,  heads: 64,  vocab: '32K',   year: 2023 },
    { name: 'Claude 3',     params: '~?',    layers: '~?', dModel: '~?', heads: '~?', vocab: '~100K', year: 2024 },
    { name: 'Gemini Ultra',  params: '~?',    layers: '~?', dModel: '~?', heads: '~?', vocab: '~256K', year: 2024 },
  ];

  return {
    getNextWordProbs,
    sampleWithTemperature,
    topKFilter,
    topPFilter,
    simulatePipeline,
    generateSequence,
    MODEL_SIZES,
  };
})();
