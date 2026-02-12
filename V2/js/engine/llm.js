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

  /* ============ LLM Pipeline Steps (step-by-step interactive) ============ */

  const LLM_PIPELINE_STEPS = [
    {
      id: 'input',
      title: 'Texto de Entrada',
      desc: 'O texto bruto entra no modelo como uma string de caracteres.',
      icon: '📝',
      detail: 'Antes de qualquer processamento, o modelo recebe uma sequência de caracteres Unicode. Esta string será decomposta em unidades menores (tokens) na próxima etapa.',
    },
    {
      id: 'tokenize',
      title: 'Tokenização (BPE)',
      desc: 'O texto é dividido em sub-palavras via Byte-Pair Encoding.',
      icon: '🧩',
      detail: 'BPE (Byte-Pair Encoding) é um algoritmo que divide o texto em pedaços frequentes. "unhappiness" → ["un", "happi", "ness"]. O vocabulário típico tem 50K-100K tokens.',
    },
    {
      id: 'embedding',
      title: 'Embedding Lookup',
      desc: 'Cada token ID é mapeado para um vetor denso de alta dimensão.',
      icon: '📐',
      detail: 'Uma tabela de embedding (vocab_size × d_model) converte cada ID numérico em um vetor de 12.288 dimensões (GPT-3). Tokens semanticamente similares ficam próximos neste espaço vetorial.',
    },
    {
      id: 'positional',
      title: 'Positional Encoding',
      desc: 'Informação de posição é adicionada a cada embedding.',
      icon: '📍',
      detail: 'Como o Transformer processa todos os tokens em paralelo (sem recorrência), usamos Positional Encoding para injetar a ordem. PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(pos/10000^(2i/d)).',
    },
    {
      id: 'attention',
      title: 'Multi-Head Self-Attention',
      desc: 'Cada token "olha" para todos os outros para capturar contexto.',
      icon: '👁️',
      detail: 'Q, K, V são projeções lineares do input. Attention(Q,K,V) = softmax(QK^T / √d_k) × V. Com 96 cabeças em paralelo (GPT-3), cada uma captura relações diferentes.',
    },
    {
      id: 'addnorm1',
      title: 'Residual + LayerNorm',
      desc: 'Conexão residual preserva informação, LayerNorm estabiliza.',
      icon: '➕',
      detail: 'output = LayerNorm(x + Attention(x)). A conexão residual permite que gradientes fluam direto pelas camadas. LayerNorm normaliza para média 0 e variância 1 por token.',
    },
    {
      id: 'ffn',
      title: 'Feed-Forward Network',
      desc: 'Duas camadas lineares com ativação GELU processam cada posição.',
      icon: '🧠',
      detail: 'FFN(x) = GELU(x·W₁ + b₁)·W₂ + b₂. A dimensão interna expande 4× (12.288 → 49.152 → 12.288 no GPT-3). É aqui que o modelo armazena grande parte do "conhecimento".',
    },
    {
      id: 'layers',
      title: 'N× Camadas Empilhadas',
      desc: 'O bloco Attention + FFN se repete N vezes (96× no GPT-3).',
      icon: '🔄',
      detail: 'Cada camada refina progressivamente a representação. Camadas iniciais capturam sintaxe, camadas intermediárias semântica, camadas finais raciocínio e predição. A representação é refinada a cada passagem.',
    },
    {
      id: 'linear',
      title: 'Projeção para Vocabulário',
      desc: 'O vetor do último token é projetado para o vocabulário inteiro.',
      icon: '📊',
      detail: 'Uma camada linear (d_model × vocab_size) transforma o vetor de 12.288 dimensões em 50.257 logits — um score bruto para cada token possível do vocabulário.',
    },
    {
      id: 'softmax',
      title: 'Softmax + Sampling',
      desc: 'Logits viram probabilidades e um token é amostrado.',
      icon: '🎯',
      detail: 'Softmax(z_i) = e^(z_i) / Σ e^(z_j) converte logits em probabilidades. Depois, Temperature, Top-K e Top-P filtram a distribuição antes da amostragem aleatória final.',
    },
  ];

  /**
   * Generate per-step data for a given input text.
   * Returns an array of data objects, one per step, for rich visualization.
   */
  function generatePipelineStepData(inputText) {
    const tokens = inputText.trim().split(/\s+/);
    const lastToken = tokens[tokens.length - 1];
    const { candidates } = getNextWordProbs(lastToken);

    // Simulate BPE sub-tokenization
    const bpeTokens = [];
    tokens.forEach(word => {
      if (word.length <= 3) {
        bpeTokens.push({ surface: word, id: (hashStr(word) % 50000) + 100 });
      } else {
        // Split longer words into "sub-tokens"
        const mid = Math.ceil(word.length * 0.6);
        bpeTokens.push({ surface: word.slice(0, mid), id: (hashStr(word.slice(0, mid)) % 50000) + 100 });
        bpeTokens.push({ surface: word.slice(mid), id: (hashStr(word.slice(mid)) % 50000) + 100, isContinuation: true });
      }
    });

    // Generate fake 12-dim embeddings for display
    const embeddings = bpeTokens.map((t, i) => ({
      token: t.surface,
      vec: Array.from({ length: 12 }, (_, d) => {
        const seed = hashStr(t.surface + d);
        return ((seed % 2000) - 1000) / 1000;
      }),
    }));

    // Positional encodings
    const posEncodings = bpeTokens.map((_, pos) =>
      Array.from({ length: 12 }, (_, i) => {
        const div = Math.pow(10000, (2 * Math.floor(i / 2)) / 12);
        return i % 2 === 0 ? Math.sin(pos / div) : Math.cos(pos / div);
      })
    );

    // Attention scores (simulated)
    const n = Math.min(bpeTokens.length, 8);
    const attnScores = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        // Causal mask: can only attend to j <= i
        if (j > i) { row.push(0); continue; }
        const base = j === i ? 0.35 : (j === i - 1 ? 0.2 : 0.08);
        row.push(base + Math.random() * 0.08);
      }
      // Normalize row
      const sum = row.reduce((s, v) => s + v, 0);
      for (let j = 0; j < n; j++) row[j] = sum > 0 ? row[j] / sum : 0;
      attnScores.push(row);
    }

    // Layer activations (simulated variance progression through layers)
    const numLayers = 96;
    const layerActivations = [1, 4, 12, 24, 48, 72, 88, 96].map(l => ({
      layer: l,
      variance: 0.9 * Math.exp(-0.01 * l) + 0.1 + Math.random() * 0.05,
      syntaxPct: Math.max(0, 90 - l * 1.2 + Math.random() * 5),
      semanticPct: Math.min(95, 20 + l * 0.8 + Math.random() * 5),
    }));

    // Logits → top candidates
    const logits = candidates.slice(0, 8).map(c => ({
      token: c.word,
      logit: Math.log(c.prob + 0.001) * 3 + Math.random() * 0.5,
      prob: c.prob,
    }));

    return {
      input: inputText,
      bpeTokens,
      embeddings,
      posEncodings,
      attnScores,
      attnTokens: bpeTokens.slice(0, n).map(t => t.surface),
      layerActivations,
      logits,
      candidates,
      totalLayers: numLayers,
    };
  }

  /** Simple deterministic hash for strings */
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  return {
    getNextWordProbs,
    sampleWithTemperature,
    topKFilter,
    topPFilter,
    simulatePipeline,
    generateSequence,
    MODEL_SIZES,
    LLM_PIPELINE_STEPS,
    generatePipelineStepData,
  };
})();
