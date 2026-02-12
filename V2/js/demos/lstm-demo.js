/* ============================================
   AIFORALL V2 — LSTM Demo
   Gate visualization, sequence processing,
   interactive cell, RNN comparison, quiz
   ============================================ */

const LSTMDemo = (() => {

  /** Render full module */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.lstm || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">🔄</span>
              <div>
                <h1>LSTM</h1>
                <p>Long Short-Term Memory — redes com memória de longo prazo</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="cell">🔬 Célula LSTM</button>
              <button class="tab" data-tab="sequence">📈 Sequência</button>
              <button class="tab" data-tab="compare">⚔️ RNN vs LSTM</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-cell" class="tab-content hidden">${renderCellTab()}</div>
            <div id="tab-sequence" class="tab-content hidden">${renderSequenceTab()}</div>
            <div id="tab-compare" class="tab-content hidden">${renderCompareTab()}</div>
            <div id="tab-quiz" class="tab-content hidden">${renderQuizTab(mState)}</div>
          </div>
        </section>
      </div>
    `;
  }

  /* =================== Tab Renders =================== */

  function renderLearnTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🔄 O que é LSTM?</h3>
          <p><strong>Long Short-Term Memory</strong> é um tipo especial de rede neural recorrente (RNN) 
          projetada para lembrar informações por longos períodos. Resolve o famoso problema do 
          <em>vanishing gradient</em> das RNNs simples.</p>
          <p class="mt-4">Imagine ler um livro: uma RNN simples esquece o capítulo 1 quando chega no capítulo 10. 
          A LSTM tem um "caderno de anotações" (cell state) que mantém informações importantes por tempo indeterminado.</p>
        </div>

        <div class="card-flat mb-8">
          <h3>🚪 Os 3 Gates</h3>
          <p>A LSTM usa <strong>3 portões (gates)</strong> para controlar o fluxo de informação:</p>
          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="card-flat text-center" style="border-color: ${LSTMEngine.GATE_COLORS.forget}44;">
              <div style="font-size:2rem;">🚫</div>
              <h4 style="color:${LSTMEngine.GATE_COLORS.forget};">Forget Gate</h4>
              <p class="text-xs">Decide o que <strong>esquecer</strong> do cell state anterior.</p>
              <code class="text-xs">f = σ(W_f·[h,x] + b_f)</code>
            </div>
            <div class="card-flat text-center" style="border-color: ${LSTMEngine.GATE_COLORS.input}44;">
              <div style="font-size:2rem;">📥</div>
              <h4 style="color:${LSTMEngine.GATE_COLORS.input};">Input Gate</h4>
              <p class="text-xs">Decide quais <strong>novas informações</strong> armazenar.</p>
              <code class="text-xs">i = σ(W_i·[h,x] + b_i)</code>
            </div>
            <div class="card-flat text-center" style="border-color: ${LSTMEngine.GATE_COLORS.output}44;">
              <div style="font-size:2rem;">📤</div>
              <h4 style="color:${LSTMEngine.GATE_COLORS.output};">Output Gate</h4>
              <p class="text-xs">Decide o que <strong>enviar como saída</strong>.</p>
              <code class="text-xs">o = σ(W_o·[h,x] + b_o)</code>
            </div>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🧠 Cell State — A Esteira Transportadora</h3>
          <p>O <strong>cell state</strong> é como uma esteira transportadora que percorre toda a sequência. 
          Gates adicionam ou removem informação dela. É por isso que a LSTM "não esquece".</p>
          <div class="lstm-flow mt-4">
            <div class="lstm-flow-item" style="border-color: ${LSTMEngine.GATE_COLORS.cell}44;">
              <code class="text-xs">C_t = f_t × C_{t-1} + i_t × C̃_t</code>
              <p class="text-xs text-muted mt-2">Novo cell = (forget × antigo) + (input × candidato)</p>
            </div>
            <span class="pipeline-arrow">→</span>
            <div class="lstm-flow-item" style="border-color: ${LSTMEngine.GATE_COLORS.hidden}44;">
              <code class="text-xs">h_t = o_t × tanh(C_t)</code>
              <p class="text-xs text-muted mt-2">Saída = output_gate × tanh(cell_state)</p>
            </div>
          </div>
        </div>

        <div class="card-flat">
          <h3>📱 Onde LSTMs são usadas?</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="flex items-center gap-3">
              <span style="font-size:1.5rem;">📝</span>
              <div><strong>Tradução</strong><br><span class="text-xs text-muted">Seq2Seq para tradução automática</span></div>
            </div>
            <div class="flex items-center gap-3">
              <span style="font-size:1.5rem;">🎵</span>
              <div><strong>Música</strong><br><span class="text-xs text-muted">Geração de melodias nota a nota</span></div>
            </div>
            <div class="flex items-center gap-3">
              <span style="font-size:1.5rem;">📊</span>
              <div><strong>Séries Temporais</strong><br><span class="text-xs text-muted">Previsão de ações, clima, vendas</span></div>
            </div>
            <div class="flex items-center gap-3">
              <span style="font-size:1.5rem;">🗣️</span>
              <div><strong>Speech</strong><br><span class="text-xs text-muted">Reconhecimento de fala (pré-Transformer)</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCellTab() {
    return `
      <div class="cell-section">
        <div class="card-flat mb-4">
          <h3>🔬 Célula LSTM Interativa</h3>
          <p class="text-sm text-muted">Ajuste a entrada e veja como cada gate reage em tempo real.</p>
          
          <div class="grid grid-cols-2 gap-6 mt-4">
            <div>
              <label class="text-sm font-bold">Input (x): <span id="cell-input-val">0.50</span></label>
              <input id="cell-input" type="range" min="0" max="1" step="0.01" value="0.5" class="slider mt-1">
            </div>
            <div>
              <label class="text-sm font-bold">Prev Hidden (h): <span id="cell-hidden-val">0.00</span></label>
              <input id="cell-hidden" type="range" min="-1" max="1" step="0.01" value="0" class="slider mt-1">
            </div>
            <div>
              <label class="text-sm font-bold">Prev Cell (C): <span id="cell-state-val">0.00</span></label>
              <input id="cell-state" type="range" min="-2" max="2" step="0.01" value="0" class="slider mt-1">
            </div>
            <div>
              <label class="text-sm font-bold">Preset:</label>
              <div class="flex gap-2 mt-1 flex-wrap">
                ${Object.entries(LSTMEngine.PRESETS).map(([key, p]) => 
                  `<button class="btn btn-sm btn-ghost lstm-preset" data-preset="${key}" title="${p.desc}">${p.label}</button>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>

        <div id="cell-diagram" class="mt-4"></div>
      </div>
    `;
  }

  function renderSequenceTab() {
    return `
      <div class="sequence-section">
        <div class="card-flat mb-4">
          <h3>📈 Processe uma Sequência</h3>
          <p class="text-sm text-muted">Veja como cell state e hidden state evoluem ao longo do tempo.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="seq-input" class="input" value="The cat sat on the mat" 
              placeholder="Digite uma frase..." style="flex:1;min-width:200px;">
            <select id="seq-preset" class="input" style="max-width:160px;">
              ${Object.entries(LSTMEngine.PRESETS).map(([key, p]) => 
                `<option value="${key}">${p.label}</option>`
              ).join('')}
            </select>
            <button class="btn btn-primary" id="seq-run-btn">Processar</button>
          </div>
        </div>
        <div id="seq-container" class="mt-4"></div>
      </div>
    `;
  }

  function renderCompareTab() {
    const { rnn, lstm } = LSTMEngine.COMPARISON;
    return `
      <div class="compare-section">
        <div class="card-flat mb-4">
          <h3>⚔️ RNN Simples vs LSTM</h3>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="card-flat" style="border-color: #ef444444;">
            <h4 style="color:#ef4444;">📉 ${rnn.name}</h4>
            <code class="text-xs text-muted">${rnn.formula}</code>
            <h5 class="mt-4 text-sm">✅ Prós:</h5>
            <ul class="text-sm">${rnn.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            <h5 class="mt-4 text-sm">❌ Contras:</h5>
            <ul class="text-sm">${rnn.cons.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div class="card-flat" style="border-color: #10b98144;">
            <h4 style="color:#10b981;">📈 ${lstm.name}</h4>
            <code class="text-xs text-muted">${lstm.formula}</code>
            <h5 class="mt-4 text-sm">✅ Prós:</h5>
            <ul class="text-sm">${lstm.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            <h5 class="mt-4 text-sm">❌ Contras:</h5>
            <ul class="text-sm">${lstm.cons.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="card-flat mt-6">
          <h4>🔑 A Diferença Chave: Vanishing Gradient</h4>
          <div class="grid grid-cols-2 gap-6 mt-4">
            <div>
              <h5 class="text-sm" style="color:#ef4444;">RNN: Gradiente desaparece</h5>
              <div class="flex gap-1 mt-2">
                ${[1, 0.7, 0.4, 0.2, 0.08, 0.02, 0.005, 0.001].map((v, i) => `
                  <div class="lstm-gradient-bar" style="height:${Math.max(v * 80, 2)}px; background:#ef4444; opacity:${v + 0.1};">
                    <span class="text-xs">${i + 1}</span>
                  </div>
                `).join('')}
              </div>
              <p class="text-xs text-muted mt-2">Gradiente → 0 após poucos time steps</p>
            </div>
            <div>
              <h5 class="text-sm" style="color:#10b981;">LSTM: Gradiente preservado</h5>
              <div class="flex gap-1 mt-2">
                ${[1, 0.95, 0.88, 0.82, 0.78, 0.74, 0.70, 0.67].map((v, i) => `
                  <div class="lstm-gradient-bar" style="height:${v * 80}px; background:#10b981; opacity:${v + 0.1};">
                    <span class="text-xs">${i + 1}</span>
                  </div>
                `).join('')}
              </div>
              <p class="text-xs text-muted mt-2">Cell state preserva gradiente por muitos steps</p>
            </div>
          </div>
        </div>

        <div class="card-flat mt-6">
          <h4>🤖 E os Transformers?</h4>
          <p class="mt-2">Transformers (2017) substituíram LSTMs para a maioria das tarefas de NLP porque:</p>
          <ul class="mt-2">
            <li><strong>Paralelização</strong> — processam todos os tokens ao mesmo tempo (LSTMs são sequenciais)</li>
            <li><strong>Attention</strong> — conectam qualquer token a qualquer outro diretamente</li>
            <li><strong>Escala</strong> — treinam em dados muito maiores com eficiência</li>
          </ul>
          <p class="text-sm text-muted mt-4">Mas LSTMs ainda são usadas em dispositivos edge, séries temporais e áudio onde eficiência importa.</p>
        </div>
      </div>
    `;
  }

  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — LSTM</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre LSTM e redes recorrentes!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>
        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  /* =================== Quiz =================== */
  const QUIZ_QUESTIONS = [
    {
      question: 'Qual problema principal a LSTM resolve em relação à RNN simples?',
      options: [
        'Processamento de imagens',
        'Vanishing gradient (gradientes que desaparecem)',
        'Falta de memória RAM',
        'Velocidade de treinamento',
      ],
      correct: 1,
      explanation: 'A LSTM foi criada para resolver o vanishing gradient problem. O cell state funciona como uma "highway" que permite gradientes fluírem por muitos time steps sem desaparecer.',
    },
    {
      question: 'Quantos gates tem uma célula LSTM?',
      options: ['1 (output)', '2 (input e output)', '3 (forget, input, output)', '4 (forget, input, output, reset)'],
      correct: 2,
      explanation: 'A LSTM tem 3 gates: Forget (o que esquecer), Input (o que armazenar de novo) e Output (o que enviar). Existe também o "candidate" que faz parte do mecanismo de input.',
    },
    {
      question: 'O que o Forget Gate faz?',
      options: [
        'Adiciona novas informações ao cell state',
        'Decide quais informações do cell state anterior descartar',
        'Gera a saída da célula',
        'Reseta todos os pesos da rede',
      ],
      correct: 1,
      explanation: 'O Forget Gate aplica um valor entre 0 e 1 (via sigmoid) ao cell state anterior. 0 = esquecer completamente, 1 = lembrar tudo.',
    },
    {
      question: 'O que é o Cell State na LSTM?',
      options: [
        'A saída visível da célula',
        'Os pesos treinados da rede',
        'Uma memória de longo prazo que percorre toda a sequência',
        'O gradiente calculado no backpropagation',
      ],
      correct: 2,
      explanation: 'O cell state é a memória de longo prazo da LSTM. Ele funciona como uma "esteira transportadora" que percorre toda a sequência, com gates controlando o que adicionar ou remover.',
    },
    {
      question: 'Por que Transformers substituíram LSTMs na maioria das tarefas de NLP?',
      options: [
        'São mais baratos para treinar',
        'Não precisam de GPU',
        'Processam tokens em paralelo e escalam melhor com dados',
        'São mais simples de implementar',
      ],
      correct: 2,
      explanation: 'Transformers processam todos os tokens em paralelo (via self-attention), enquanto LSTMs processam sequencialmente. Isso permite treinar em dados muito maiores com eficiência.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */

  function initInteractions() {
    // Cell tab: sliders
    const sliders = ['cell-input', 'cell-hidden', 'cell-state'];
    sliders.forEach(id => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        document.getElementById(id + '-val').textContent = parseFloat(e.target.value).toFixed(2);
        updateCellDiagram();
      });
    });

    // Presets
    document.querySelectorAll('.lstm-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lstm-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateCellDiagram();
      });
    });

    // Sequence
    document.getElementById('seq-run-btn')?.addEventListener('click', runSequence);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);

    // Default preset
    const firstPreset = document.querySelector('.lstm-preset');
    if (firstPreset) firstPreset.classList.add('active');
  }

  function getActivePreset() {
    const active = document.querySelector('.lstm-preset.active');
    const key = active?.dataset.preset || 'balanced';
    return LSTMEngine.PRESETS[key].weights;
  }

  /* =================== Cell Diagram =================== */

  function updateCellDiagram() {
    const input = parseFloat(document.getElementById('cell-input')?.value) || 0;
    const prevH = parseFloat(document.getElementById('cell-hidden')?.value) || 0;
    const prevC = parseFloat(document.getElementById('cell-state')?.value) || 0;
    const weights = getActivePreset();

    const result = LSTMEngine.step(input, prevH, prevC, weights);
    const container = document.getElementById('cell-diagram');
    if (!container) return;

    container.innerHTML = `
      <div class="card-flat">
        <!-- Gates -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          ${renderGateCard('forget', 'Forget Gate', result.forgetGate, 'σ', result.forgetRaw)}
          ${renderGateCard('input', 'Input Gate', result.inputGate, 'σ', result.inputRaw)}
          ${renderGateCard('candidate', 'Candidate', result.candidate, 'tanh', result.candidateRaw)}
          ${renderGateCard('output', 'Output Gate', result.outputGate, 'σ', result.outputRaw)}
        </div>

        <!-- Cell state computation -->
        <div class="card-flat mb-4" style="border-color: ${LSTMEngine.GATE_COLORS.cell}44;">
          <div class="flex items-center gap-3 mb-3">
            <span style="font-size:1.5rem;">🧠</span>
            <h4 style="margin:0; color:${LSTMEngine.GATE_COLORS.cell};">Cell State</h4>
          </div>
          <div class="lstm-equation">
            <span class="lstm-eq-part" style="color:${LSTMEngine.GATE_COLORS.forget};">${result.forgetGate}</span>
            <span>×</span>
            <span class="lstm-eq-part">${prevC.toFixed(2)}</span>
            <span>+</span>
            <span class="lstm-eq-part" style="color:${LSTMEngine.GATE_COLORS.input};">${result.inputGate}</span>
            <span>×</span>
            <span class="lstm-eq-part" style="color:${LSTMEngine.GATE_COLORS.candidate};">${result.candidate}</span>
            <span>=</span>
            <span class="lstm-eq-result" style="background:${LSTMEngine.GATE_COLORS.cell}22;color:${LSTMEngine.GATE_COLORS.cell};">${result.cellState}</span>
          </div>
          <div class="progress-bar mt-3" style="height:12px;">
            <div class="progress-fill" style="width:${Math.min(Math.abs(result.cellState) / 2 * 100, 100)}%;background:${LSTMEngine.GATE_COLORS.cell};"></div>
          </div>
        </div>

        <!-- Hidden state -->
        <div class="card-flat" style="border-color: ${LSTMEngine.GATE_COLORS.hidden}44;">
          <div class="flex items-center gap-3 mb-3">
            <span style="font-size:1.5rem;">💬</span>
            <h4 style="margin:0; color:${LSTMEngine.GATE_COLORS.hidden};">Hidden State (Output)</h4>
          </div>
          <div class="lstm-equation">
            <span class="lstm-eq-part" style="color:${LSTMEngine.GATE_COLORS.output};">${result.outputGate}</span>
            <span>×</span>
            <span>tanh(</span>
            <span class="lstm-eq-part" style="color:${LSTMEngine.GATE_COLORS.cell};">${result.cellState}</span>
            <span>)</span>
            <span>=</span>
            <span class="lstm-eq-result" style="background:${LSTMEngine.GATE_COLORS.hidden}22;color:${LSTMEngine.GATE_COLORS.hidden};">${result.hidden}</span>
          </div>
          <div class="progress-bar mt-3" style="height:12px;">
            <div class="progress-fill" style="width:${Math.min(Math.abs(result.hidden) * 100, 100)}%;background:${LSTMEngine.GATE_COLORS.hidden};"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGateCard(type, label, value, activation, rawValue) {
    const color = LSTMEngine.GATE_COLORS[type];
    const pct = activation === 'tanh'
      ? Math.abs(value) * 100
      : value * 100;
    return `
      <div class="card-flat text-center lstm-gate-card" style="border-color:${color}44;">
        <span class="text-xs font-bold" style="color:${color};">${label}</span>
        <div class="lstm-gate-value mt-2" style="color:${color}; font-size:1.4rem; font-weight:bold;">
          ${value.toFixed(3)}
        </div>
        <div class="progress-bar mt-2" style="height:8px;">
          <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <span class="text-xs text-muted mt-1">${activation}(${rawValue.toFixed(2)})</span>
      </div>
    `;
  }

  /* =================== Sequence =================== */

  function runSequence() {
    const text = document.getElementById('seq-input')?.value?.trim();
    if (!text) return;

    const presetKey = document.getElementById('seq-preset')?.value || 'balanced';
    const weights = LSTMEngine.PRESETS[presetKey].weights;
    const inputs = LSTMEngine.textToSequence(text);
    const words = text.split(/\s+/);
    const steps = LSTMEngine.runSequence(inputs, weights);

    const container = document.getElementById('seq-container');
    if (!container) return;

    // Time series chart (text-based bars)
    const maxCell = Math.max(...steps.map(s => Math.abs(s.cellState)), 0.1);
    const maxHidden = Math.max(...steps.map(s => Math.abs(s.hidden)), 0.1);

    let html = `
      <div class="card-flat mb-4">
        <h4>📊 Cell State ao longo do tempo</h4>
        <div class="flex flex-col gap-2 mt-4">
          ${steps.map((s, i) => {
            const pct = (Math.abs(s.cellState) / maxCell) * 100;
            const isPos = s.cellState >= 0;
            return `
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold" style="width:60px;">${words[i] || '?'}</span>
              <span class="text-xs font-mono" style="width:35px;color:${LSTMEngine.GATE_COLORS.cell};">${s.cellState.toFixed(2)}</span>
              <div class="progress-bar" style="flex:1;height:10px;">
                <div class="progress-fill" style="width:${pct}%;background:${LSTMEngine.GATE_COLORS.cell};opacity:${isPos ? 1 : 0.5};"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card-flat mb-4">
        <h4>💬 Hidden State ao longo do tempo</h4>
        <div class="flex flex-col gap-2 mt-4">
          ${steps.map((s, i) => {
            const pct = (Math.abs(s.hidden) / maxHidden) * 100;
            return `
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold" style="width:60px;">${words[i] || '?'}</span>
              <span class="text-xs font-mono" style="width:35px;color:${LSTMEngine.GATE_COLORS.hidden};">${s.hidden.toFixed(2)}</span>
              <div class="progress-bar" style="flex:1;height:10px;">
                <div class="progress-fill" style="width:${pct}%;background:${LSTMEngine.GATE_COLORS.hidden};"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card-flat">
        <h4>🚪 Gates ao longo do tempo</h4>
        <div style="overflow-x:auto;">
          <table class="attn-step-table">
            <thead>
              <tr>
                <th>t</th>
                <th>Token</th>
                <th>Input</th>
                <th style="color:${LSTMEngine.GATE_COLORS.forget};">Forget</th>
                <th style="color:${LSTMEngine.GATE_COLORS.input};">Input G.</th>
                <th style="color:${LSTMEngine.GATE_COLORS.candidate};">Cand.</th>
                <th style="color:${LSTMEngine.GATE_COLORS.output};">Output</th>
                <th style="color:${LSTMEngine.GATE_COLORS.cell};">Cell</th>
                <th style="color:${LSTMEngine.GATE_COLORS.hidden};">Hidden</th>
              </tr>
            </thead>
            <tbody>
              ${steps.map((s, i) => `
                <tr>
                  <td class="font-mono">${i}</td>
                  <td class="font-bold">${words[i] || '?'}</td>
                  <td class="font-mono text-xs">${s.input.toFixed(2)}</td>
                  <td class="font-mono text-xs" style="background:${LSTMEngine.GATE_COLORS.forget}${Math.round(s.forgetGate * 40).toString(16).padStart(2, '0')};">${s.forgetGate.toFixed(3)}</td>
                  <td class="font-mono text-xs" style="background:${LSTMEngine.GATE_COLORS.input}${Math.round(s.inputGate * 40).toString(16).padStart(2, '0')};">${s.inputGate.toFixed(3)}</td>
                  <td class="font-mono text-xs">${s.candidate.toFixed(3)}</td>
                  <td class="font-mono text-xs" style="background:${LSTMEngine.GATE_COLORS.output}${Math.round(s.outputGate * 40).toString(16).padStart(2, '0')};">${s.outputGate.toFixed(3)}</td>
                  <td class="font-mono text-xs font-bold" style="color:${LSTMEngine.GATE_COLORS.cell};">${s.cellState.toFixed(3)}</td>
                  <td class="font-mono text-xs font-bold" style="color:${LSTMEngine.GATE_COLORS.hidden};">${s.hidden.toFixed(3)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /* =================== Quiz Logic =================== */

  function startQuiz() {
    quizState = { current: 0, answers: [], startTime: Date.now() };
    document.getElementById('start-quiz-btn')?.closest('.card-flat')?.classList.add('hidden');
    document.getElementById('quiz-container')?.classList.remove('hidden');
    document.getElementById('quiz-results')?.classList.add('hidden');
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    const q = QUIZ_QUESTIONS[quizState.current];
    const num = quizState.current + 1;
    const total = QUIZ_QUESTIONS.length;

    container.innerHTML = `
      <div class="card-flat quiz-card">
        <div class="flex items-center justify-between mb-4">
          <span class="badge badge-primary">Pergunta ${num}/${total}</span>
          <div class="progress-bar" style="width: 200px;">
            <div class="progress-fill" style="width: ${(num / total) * 100}%"></div>
          </div>
        </div>
        <h3 class="mb-8">${q.question}</h3>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleQuizAnswer(parseInt(btn.dataset.index)));
    });
  }

  function handleQuizAnswer(idx) {
    const q = QUIZ_QUESTIONS[quizState.current];
    const isCorrect = idx === q.correct;
    quizState.answers.push({ selected: idx, correct: q.correct, isCorrect });

    const container = document.getElementById('quiz-container');
    const options = container.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.style.pointerEvents = 'none';
      if (i === q.correct) opt.classList.add('quiz-correct');
      else if (i === idx && !isCorrect) opt.classList.add('quiz-wrong');
    });

    const card = container.querySelector('.quiz-card');
    const expl = document.createElement('div');
    expl.className = `quiz-explanation ${isCorrect ? 'correct' : 'wrong'} mt-4`;
    expl.innerHTML = `
      <p><strong>${isCorrect ? '✅ Correto!' : '❌ Incorreto!'}</strong></p>
      <p class="text-sm">${q.explanation}</p>
      <button class="btn btn-primary mt-4 quiz-next-btn">
        ${quizState.current < QUIZ_QUESTIONS.length - 1 ? 'Próxima →' : 'Ver Resultado'}
      </button>
    `;
    card.appendChild(expl);

    expl.querySelector('.quiz-next-btn').addEventListener('click', () => {
      quizState.current++;
      if (quizState.current < QUIZ_QUESTIONS.length) renderQuizQuestion();
      else finishQuiz();
    });
  }

  function finishQuiz() {
    const score = quizState.answers.filter(a => a.isCorrect).length;
    const total = QUIZ_QUESTIONS.length;
    const elapsed = Math.round((Date.now() - quizState.startTime) / 1000);
    const result = Progress.completeQuiz('lstm', score, total);

    document.getElementById('quiz-container')?.classList.add('hidden');
    const results = document.getElementById('quiz-results');
    if (!results) return;
    results.classList.remove('hidden');

    const pct = Math.round((score / total) * 100);
    const msg = pct >= 100 ? '🏆 Perfeito!' : pct >= 70 ? '🎉 Muito bom!' : pct >= 40 ? '👍 Bom começo!' : '📚 Continue estudando!';

    results.innerHTML = `
      <div class="card-flat text-center">
        <h2>${msg}</h2>
        <div class="module-stars mt-4 mb-4" style="font-size: 2.5rem;">
          ${[1, 2, 3].map(s => `<span class="star ${s <= result.stars ? 'earned' : ''}">★</span>`).join('')}
        </div>
        <p class="text-lg">${score}/${total} corretas (${pct}%)</p>
        <p class="text-muted">Tempo: ${elapsed}s</p>
        <p class="text-muted text-sm mt-4">+${score * 10 + result.stars * 15} XP ganhos!</p>
        <div class="flex justify-center gap-4 mt-8">
          <button class="btn btn-secondary" onclick="location.reload()">🔄 Tentar novamente</button>
          <a href="#/" class="btn btn-primary">← Voltar à trilha</a>
        </div>
      </div>
    `;

    if (elapsed < 60 && score >= 4) Achievements.unlock('speedrunner');
    Achievements.checkAll();
  }

  return { render, initInteractions };
})();
