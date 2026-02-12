/* ============================================
   AIFORALL V2 — Attention Engine
   Self-attention, Q/K/V, multi-head simulation
   ============================================ */

const AttentionEngine = (() => {

  /* ---- Simulated word vectors (simplified 4D) ---- */
  const WORD_VECS = {
    the:       [0.1, 0.2, 0.05, 0.1],
    a:         [0.12, 0.18, 0.06, 0.11],
    cat:       [0.8, 0.1, 0.6, 0.3],
    dog:       [0.75, 0.15, 0.55, 0.35],
    bird:      [0.7, 0.05, 0.65, 0.25],
    sat:       [0.3, 0.7, 0.2, 0.5],
    on:        [0.15, 0.25, 0.1, 0.15],
    mat:       [0.5, 0.3, 0.4, 0.6],
    is:        [0.2, 0.3, 0.1, 0.2],
    was:       [0.22, 0.32, 0.12, 0.22],
    happy:     [0.4, 0.8, 0.3, 0.7],
    sad:       [0.35, 0.75, 0.25, 0.65],
    big:       [0.6, 0.4, 0.5, 0.45],
    small:     [0.55, 0.35, 0.45, 0.4],
    ran:       [0.35, 0.65, 0.25, 0.55],
    jumped:    [0.38, 0.68, 0.28, 0.58],
    over:      [0.18, 0.28, 0.12, 0.18],
    under:     [0.17, 0.27, 0.11, 0.17],
    lazy:      [0.45, 0.72, 0.35, 0.62],
    quick:     [0.48, 0.65, 0.38, 0.58],
    brown:     [0.42, 0.38, 0.52, 0.48],
    fox:       [0.72, 0.12, 0.58, 0.32],
    it:        [0.13, 0.22, 0.07, 0.12],
    he:        [0.14, 0.24, 0.08, 0.14],
    she:       [0.14, 0.23, 0.08, 0.15],
    they:      [0.15, 0.25, 0.09, 0.16],
    with:      [0.16, 0.26, 0.11, 0.17],
    from:      [0.17, 0.27, 0.12, 0.18],
    love:      [0.42, 0.82, 0.32, 0.72],
    hate:      [0.38, 0.78, 0.28, 0.68],
    king:      [0.6, 0.5, 0.7, 0.8],
    queen:     [0.58, 0.48, 0.68, 0.82],
    i:         [0.11, 0.21, 0.06, 0.11],
    you:       [0.12, 0.22, 0.07, 0.12],
    we:        [0.13, 0.23, 0.08, 0.13],
    are:       [0.2, 0.3, 0.1, 0.2],
    not:       [0.18, 0.28, 0.09, 0.19],
    my:        [0.11, 0.21, 0.06, 0.12],
    your:      [0.12, 0.22, 0.07, 0.13],
    very:      [0.25, 0.35, 0.15, 0.25],
    much:      [0.24, 0.34, 0.14, 0.24],
    can:       [0.2, 0.3, 0.1, 0.2],
    will:      [0.21, 0.31, 0.11, 0.21],
    good:      [0.45, 0.78, 0.35, 0.68],
    bad:       [0.40, 0.73, 0.30, 0.63],
    fast:      [0.50, 0.60, 0.40, 0.55],
    slow:      [0.48, 0.58, 0.38, 0.52],
  };

  /* ---- Simulated projection matrices (4×4) ---- */
  const W_Q = [
    [0.5, 0.1, -0.2, 0.3],
    [0.2, 0.6, 0.1, -0.1],
    [-0.1, 0.3, 0.7, 0.2],
    [0.3, -0.1, 0.2, 0.5],
  ];
  const W_K = [
    [0.4, 0.2, -0.1, 0.2],
    [0.1, 0.5, 0.2, 0.0],
    [0.0, 0.2, 0.6, 0.3],
    [0.2, 0.0, 0.1, 0.4],
  ];
  const W_V = [
    [0.3, 0.0, 0.1, 0.4],
    [0.1, 0.4, 0.0, 0.2],
    [0.2, 0.1, 0.5, 0.1],
    [0.0, 0.3, 0.2, 0.6],
  ];

  /** Matrix-vector multiply */
  function matVecMul(mat, vec) {
    return mat.map(row => row.reduce((sum, val, i) => sum + val * vec[i], 0));
  }

  /** Dot product */
  function dot(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  /** Softmax */
  function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(v => Math.exp(v - max));
    const sum = exps.reduce((s, v) => s + v, 0);
    return exps.map(v => v / sum);
  }

  /** Get word vector (fallback to random for unknown words) */
  function getVec(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (WORD_VECS[w]) return WORD_VECS[w];
    // Deterministic pseudo-random based on char codes
    let seed = 0;
    for (let i = 0; i < w.length; i++) seed += w.charCodeAt(i) * (i + 1);
    return [
      ((seed * 13) % 100) / 100,
      ((seed * 31) % 100) / 100,
      ((seed * 47) % 100) / 100,
      ((seed * 61) % 100) / 100,
    ];
  }

  /**
   * Compute full self-attention for a sentence.
   * Returns { tokens, Q, K, V, scores, weights, output, steps }
   */
  function computeSelfAttention(sentence) {
    const tokens = sentence.trim().split(/\s+/);
    const n = tokens.length;
    const dK = 4;

    // Step 1: Get embeddings
    const embeddings = tokens.map(t => getVec(t));

    // Step 2: Project to Q, K, V
    const Q = embeddings.map(e => matVecMul(W_Q, e));
    const K = embeddings.map(e => matVecMul(W_K, e));
    const V = embeddings.map(e => matVecMul(W_V, e));

    // Step 3: Compute raw attention scores (Q·Kᵀ / √dK)
    const scale = Math.sqrt(dK);
    const scores = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        row.push(dot(Q[i], K[j]) / scale);
      }
      scores.push(row);
    }

    // Step 4: Softmax per row
    const weights = scores.map(row => softmax(row));

    // Step 5: Weighted sum of V
    const output = [];
    for (let i = 0; i < n; i++) {
      const out = [0, 0, 0, 0];
      for (let j = 0; j < n; j++) {
        for (let d = 0; d < dK; d++) {
          out[d] += weights[i][j] * V[j][d];
        }
      }
      output.push(out);
    }

    // Build step-by-step explanation
    const steps = [
      {
        title: '1. Embeddings',
        desc: 'Cada token recebe seu vetor de embedding (4D simplificado).',
        data: tokens.map((t, i) => ({ token: t, vec: embeddings[i] })),
      },
      {
        title: '2. Projeções Q, K, V',
        desc: 'Multiplicamos cada embedding por 3 matrizes de pesos para gerar Query, Key e Value.',
        data: tokens.map((t, i) => ({
          token: t,
          q: Q[i].map(v => +v.toFixed(3)),
          k: K[i].map(v => +v.toFixed(3)),
          v: V[i].map(v => +v.toFixed(3)),
        })),
      },
      {
        title: '3. Scores (Q·Kᵀ / √dₖ)',
        desc: 'Cada Query faz dot-product com cada Key, dividido por √4 = 2.',
        data: scores.map(row => row.map(v => +v.toFixed(3))),
      },
      {
        title: '4. Softmax → Pesos de Atenção',
        desc: 'Softmax transforma scores em probabilidades (cada linha soma 1).',
        data: weights.map(row => row.map(v => +v.toFixed(3))),
      },
      {
        title: '5. Output (pesos × V)',
        desc: 'Cada token recebe uma média ponderada dos Values de todos os tokens.',
        data: tokens.map((t, i) => ({ token: t, vec: output[i].map(v => +v.toFixed(3)) })),
      },
    ];

    return { tokens, Q, K, V, scores, weights, output, steps };
  }

  /**
   * Simulate multi-head attention (2 heads) with different random projections
   */
  function computeMultiHead(sentence, numHeads = 2) {
    const tokens = sentence.trim().split(/\s+/);
    const embeddings = tokens.map(t => getVec(t));
    const n = tokens.length;
    const dK = 4;
    const scale = Math.sqrt(dK);

    // Generate slightly different weight matrices per head
    const heads = [];
    for (let h = 0; h < numHeads; h++) {
      const offset = (h + 1) * 0.1;
      const Wq = W_Q.map(row => row.map(v => v + offset * (h % 2 === 0 ? 1 : -1)));
      const Wk = W_K.map(row => row.map(v => v - offset * (h % 2 === 0 ? 0.5 : -0.5)));

      const Qh = embeddings.map(e => matVecMul(Wq, e));
      const Kh = embeddings.map(e => matVecMul(Wk, e));

      const scoresH = [];
      for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
          row.push(dot(Qh[i], Kh[j]) / scale);
        }
        scoresH.push(row);
      }
      const weightsH = scoresH.map(row => softmax(row));

      heads.push({
        label: `Head ${h + 1}`,
        weights: weightsH,
      });
    }

    return { tokens, heads };
  }

  /** Get attention color (blue scale based on weight) */
  function getAttentionColor(weight, alpha = 1) {
    // Interpolate from transparent to vivid blue/purple
    const r = Math.round(99 + (1 - weight) * 50);
    const g = Math.round(102 + (1 - weight) * 50);
    const b = Math.round(241);
    return `rgba(${r}, ${g}, ${b}, ${weight * 0.85 * alpha + 0.05})`;
  }

  return {
    computeSelfAttention,
    computeMultiHead,
    getAttentionColor,
    softmax,
    getVec,
  };
})();
