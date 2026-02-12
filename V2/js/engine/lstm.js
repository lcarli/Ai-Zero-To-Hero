/* ============================================
   AIFORALL V2 — LSTM Engine
   Simulated LSTM cell: forget, input, output
   gates, cell state, hidden state
   ============================================ */

const LSTMEngine = (() => {

  /** Sigmoid activation */
  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /** Tanh activation */
  function tanh(x) {
    return Math.tanh(x);
  }

  /**
   * Simulate one LSTM cell step.
   * Uses simplified scalar weights for visualization.
   *
   * @param {number} input - Current input value (0–1)
   * @param {number} prevHidden - Previous hidden state
   * @param {number} prevCell - Previous cell state
   * @param {object} weights - Gate weights { wf, wi, wc, wo, bf, bi, bc, bo }
   * @returns {object} All intermediate values for visualization
   */
  function step(input, prevHidden, prevCell, weights) {
    const { wf, wi, wc, wo, uf, ui, uc, uo, bf, bi, bc, bo } = weights;

    // Combined input = [input, prevHidden]
    // Forget gate: what to discard from cell state
    const forgetRaw = wf * input + uf * prevHidden + bf;
    const forgetGate = sigmoid(forgetRaw);

    // Input gate: what new info to store
    const inputRaw = wi * input + ui * prevHidden + bi;
    const inputGate = sigmoid(inputRaw);

    // Candidate values: new potential values
    const candidateRaw = wc * input + uc * prevHidden + bc;
    const candidate = tanh(candidateRaw);

    // Update cell state
    const cellState = forgetGate * prevCell + inputGate * candidate;

    // Output gate: what to output
    const outputRaw = wo * input + uo * prevHidden + bo;
    const outputGate = sigmoid(outputRaw);

    // Hidden state (output)
    const hidden = outputGate * tanh(cellState);

    return {
      input,
      prevHidden,
      prevCell,
      forgetGate: +forgetGate.toFixed(4),
      inputGate: +inputGate.toFixed(4),
      candidate: +candidate.toFixed(4),
      outputGate: +outputGate.toFixed(4),
      cellState: +cellState.toFixed(4),
      hidden: +hidden.toFixed(4),
      // Raw values for showing sigmoid/tanh input
      forgetRaw: +forgetRaw.toFixed(4),
      inputRaw: +inputRaw.toFixed(4),
      candidateRaw: +candidateRaw.toFixed(4),
      outputRaw: +outputRaw.toFixed(4),
    };
  }

  /** Default weight presets */
  const PRESETS = {
    balanced: {
      label: 'Balanceado',
      desc: 'Todos os gates ativos de forma equilibrada',
      weights: { wf: 1.0, wi: 1.0, wc: 1.0, wo: 1.0, uf: 0.5, ui: 0.5, uc: 0.5, uo: 0.5, bf: 0.0, bi: 0.0, bc: 0.0, bo: 0.0 },
    },
    remember: {
      label: 'Lembrar Tudo',
      desc: 'Forget gate alto → mantém memória de longo prazo',
      weights: { wf: 2.0, wi: 0.5, wc: 1.0, wo: 1.0, uf: 1.5, ui: 0.3, uc: 0.5, uo: 0.5, bf: 2.0, bi: -1.0, bc: 0.0, bo: 0.0 },
    },
    forget: {
      label: 'Esquecer Rápido',
      desc: 'Forget gate baixo → descarta memória passada',
      weights: { wf: -1.0, wi: 2.0, wc: 1.0, wo: 1.0, uf: -0.5, ui: 1.0, uc: 0.5, uo: 0.5, bf: -2.0, bi: 1.0, bc: 0.0, bo: 0.0 },
    },
    selective: {
      label: 'Seletivo',
      desc: 'Input gate filtra seletivamente',
      weights: { wf: 1.5, wi: 2.0, wc: 1.5, wo: 1.0, uf: 0.8, ui: 1.2, uc: 0.8, uo: 0.5, bf: 0.5, bi: -0.5, bc: 0.0, bo: 0.0 },
    },
  };

  /**
   * Run LSTM over a sequence of inputs.
   * Returns array of step results.
   */
  function runSequence(inputs, weights, initHidden = 0, initCell = 0) {
    const steps = [];
    let h = initHidden;
    let c = initCell;

    for (let t = 0; t < inputs.length; t++) {
      const result = step(inputs[t], h, c, weights);
      result.t = t;
      steps.push(result);
      h = result.hidden;
      c = result.cellState;
    }

    return steps;
  }

  /**
   * Convert a sentence to a simple numeric sequence for demo.
   * Maps each character to a 0–1 value.
   */
  function textToSequence(text) {
    const words = text.trim().split(/\s+/);
    return words.map(w => {
      // Simple hash to 0-1
      let sum = 0;
      for (let i = 0; i < w.length; i++) {
        sum += w.charCodeAt(i);
      }
      return +((sum % 100) / 100).toFixed(2);
    });
  }

  /** RNN vs LSTM comparison data */
  const COMPARISON = {
    rnn: {
      name: 'RNN Simples',
      pros: ['Simples de implementar', 'Rápido para sequências curtas', 'Poucos parâmetros'],
      cons: ['Vanishing gradients', 'Não lembra contexto distante', 'Dificuldade com longas dependências'],
      formula: 'h_t = tanh(W_h · h_{t-1} + W_x · x_t + b)',
    },
    lstm: {
      name: 'LSTM',
      pros: ['Resolve vanishing gradients', 'Memória de longo prazo', '3 gates controlam fluxo de informação'],
      cons: ['Mais parâmetros (4× RNN)', 'Mais lento para treinar', 'Ainda sequencial (não paraleliza)'],
      formula: 'f_t, i_t, o_t = σ(...), c_t = f·c + i·c̃, h_t = o·tanh(c)',
    },
  };

  /** Gate colors for visualization */
  const GATE_COLORS = {
    forget: '#ef4444',
    input: '#10b981',
    candidate: '#06b6d4',
    output: '#f59e0b',
    cell: '#a855f7',
    hidden: '#6366f1',
  };

  const GATE_LABELS = {
    forget: '🚫 Forget Gate',
    input: '📥 Input Gate',
    candidate: '💡 Candidate',
    output: '📤 Output Gate',
    cell: '🧠 Cell State',
    hidden: '💬 Hidden State',
  };

  return {
    step,
    runSequence,
    textToSequence,
    sigmoid,
    tanh,
    PRESETS,
    COMPARISON,
    GATE_COLORS,
    GATE_LABELS,
  };
})();
