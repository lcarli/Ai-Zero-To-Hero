/* ============================================
   AIFORALL V2 — Tokenization Demo
   Interactive tokenization visualization
   ============================================ */

const TokenizationDemo = (() => {
  const EXAMPLE_TEXTS = [
    'The weather today is',
    'Artificial intelligence will transform',
    'I love machine learning because',
    'The cat sat on the mat',
    'Natural language processing is amazing',
    'Deep learning models can understand text',
  ];

  let currentMode = 'bpe'; // 'bpe' | 'char' | 'word'
  let bpeStepIndex = 0;
  let bpeSteps = [];
  let animating = false;

  /** Render the full tokenization module page */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.tokenization || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header reveal">
              <span style="font-size: 3rem;">🧩</span>
              <div>
                <h1>Tokenização</h1>
                <p>Como texto vira números — BPE, subwords e vocabulários</p>
              </div>
            </div>

            <div class="tab-bar reveal">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="demo">🧪 Demo Interativa</button>
              <button class="tab" data-tab="bpe-steps">🔬 BPE Passo a Passo</button>
              <button class="tab" data-tab="compare">⚖️ Comparar Métodos</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <!-- Learn Tab -->
            <div id="tab-learn" class="tab-content active reveal">
              ${renderLearnTab()}
            </div>

            <!-- Demo Tab -->
            <div id="tab-demo" class="tab-content hidden">
              ${renderDemoTab()}
            </div>

            <!-- BPE Steps Tab -->
            <div id="tab-bpe-steps" class="tab-content hidden">
              ${renderBPEStepsTab()}
            </div>

            <!-- Compare Tab -->
            <div id="tab-compare" class="tab-content hidden">
              ${renderCompareTab()}
            </div>

            <!-- Quiz Tab -->
            <div id="tab-quiz" class="tab-content hidden">
              ${renderQuizTab(mState)}
            </div>

          </div>
        </section>
      </div>
    `;
  }

  /* ---- Learn Tab ---- */
  function renderLearnTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🤔 O que é Tokenização?</h3>
          <p>Computadores não entendem texto diretamente — eles trabalham com números. 
          <strong>Tokenização</strong> é o processo de converter texto em uma sequência de números (tokens) 
          que o modelo de IA pode processar.</p>
          <p>Pense nisso como traduzir de "linguagem humana" para "linguagem de máquina".</p>
        </div>

        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="card-flat">
            <h4>📝 Character-Level</h4>
            <p class="text-sm">Cada caractere vira um token. Simples, mas gera sequências muito longas.</p>
            <code class="text-sm">"Olá" → ['O', 'l', 'á']</code>
          </div>
          <div class="card-flat">
            <h4>📄 Word-Level</h4>
            <p class="text-sm">Cada palavra vira um token. Vocabulário enorme e não lida com palavras desconhecidas.</p>
            <code class="text-sm">"Olá mundo" → ['Olá', 'mundo']</code>
          </div>
          <div class="card-flat" style="border-color: var(--primary);">
            <h4>🧩 Subword (BPE) ⭐</h4>
            <p class="text-sm">O melhor dos dois mundos! Divide em pedaços frequentes. Usado pelo GPT, BERT, etc.</p>
            <code class="text-sm">"unhappiness" → ['un', 'happiness']</code>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🔧 Como funciona o BPE?</h3>
          <p><strong>Byte Pair Encoding (BPE)</strong> é o algoritmo mais usado. Funciona assim:</p>
          <ol style="line-height: 2;">
            <li>Comece com todos os caracteres individuais como vocabulário</li>
            <li>Conte os pares de tokens mais frequentes no texto de treino</li>
            <li>Junte o par mais frequente em um novo token</li>
            <li>Repita até atingir o tamanho desejado de vocabulário</li>
          </ol>
          <p class="text-muted text-sm mt-4">💡 Veja isso acontecendo na aba <strong>"BPE Passo a Passo"</strong>!</p>
        </div>

        <div class="card-flat">
          <h3>📊 Por que isso importa?</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 class="text-sm text-primary">Eficiência</h4>
              <p class="text-sm">Menos tokens = processamento mais rápido e barato. Um bom tokenizador reduz custos.</p>
            </div>
            <div>
              <h4 class="text-sm text-primary">Qualidade</h4>
              <p class="text-sm">Tokens que capturam significado (como "un" + "happy") ajudam o modelo a entender melhor.</p>
            </div>
            <div>
              <h4 class="text-sm text-primary">Contexto</h4>
              <p class="text-sm">Modelos têm limite de tokens (ex: 4096). Tokenização eficiente = mais contexto útil.</p>
            </div>
            <div>
              <h4 class="text-sm text-primary">Idiomas</h4>
              <p class="text-sm">BPE funciona para qualquer idioma, até emojis! Cada língua tem eficiência diferente.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- Demo Tab ---- */
  function renderDemoTab() {
    return `
      <div class="demo-section">
        <div class="card-flat mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">Digite texto e veja os tokens em tempo real</h3>
            <div class="flex gap-2">
              ${EXAMPLE_TEXTS.slice(0, 3).map((t) =>
                `<button class="btn btn-sm btn-ghost example-btn" data-text="${t}">"${t.slice(0, 20)}..."</button>`
              ).join('')}
            </div>
          </div>
          <textarea 
            id="token-input" 
            class="textarea" 
            placeholder="Digite ou cole qualquer texto aqui..."
            rows="3"
          >The cat sat on the mat</textarea>
        </div>

        <!-- Results -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Tokens visuais -->
          <div class="card-flat">
            <div class="flex items-center justify-between mb-4">
              <h4 style="margin:0">Tokens</h4>
              <span class="badge badge-primary" id="token-count">0 tokens</span>
            </div>
            <div id="tokens-visual" class="tokens-container"></div>
          </div>

          <!-- IDs numéricos -->
          <div class="card-flat">
            <div class="flex items-center justify-between mb-4">
              <h4 style="margin:0">IDs Numéricos</h4>
              <span class="badge" id="vocab-size">Vocab: ${TokenizerEngine.getVocabSize()}</span>
            </div>
            <div id="tokens-ids" class="tokens-ids font-mono"></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-4 mt-6">
          <div class="card-flat text-center">
            <div class="stat-value text-primary" id="stat-chars">0</div>
            <div class="stat-label">Caracteres</div>
          </div>
          <div class="card-flat text-center">
            <div class="stat-value text-accent" id="stat-tokens">0</div>
            <div class="stat-label">Tokens</div>
          </div>
          <div class="card-flat text-center">
            <div class="stat-value" id="stat-ratio">0x</div>
            <div class="stat-label">Compressão</div>
          </div>
          <div class="card-flat text-center">
            <div class="stat-value" id="stat-unique">0</div>
            <div class="stat-label">Tokens Únicos</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- BPE Steps Tab ---- */
  function renderBPEStepsTab() {
    return `
      <div class="bpe-section">
        <div class="card-flat mb-4">
          <h3>🔬 Visualize o BPE construindo tokens</h3>
          <p>Veja como o algoritmo BPE junta caracteres em subwords, passo a passo.</p>
          <div class="flex gap-4 items-center mt-4">
            <input 
              id="bpe-input" 
              class="input" 
              value="the cat sat on the mat"
              placeholder="Texto para simular BPE..."
              style="max-width: 400px;"
            >
            <button class="btn btn-primary" id="bpe-start-btn">▶ Iniciar</button>
            <button class="btn btn-secondary" id="bpe-step-btn" disabled>Próximo Passo →</button>
            <button class="btn btn-ghost" id="bpe-auto-btn">⚡ Auto-play</button>
          </div>
        </div>

        <!-- Steps visualization -->
        <div id="bpe-steps-container" class="bpe-steps-container">
          <div class="card-flat text-center text-muted">
            <p>Clique em "Iniciar" para ver o BPE em ação</p>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- Compare Tab ---- */
  function renderCompareTab() {
    return `
      <div class="compare-section">
        <div class="card-flat mb-4">
          <h3>⚖️ Compare métodos de tokenização</h3>
          <p>Veja como cada método divide o mesmo texto de formas diferentes.</p>
          <textarea 
            id="compare-input" 
            class="textarea" 
            rows="2"
            placeholder="Digite texto para comparar..."
          >Artificial intelligence is transforming the world</textarea>
          <button class="btn btn-primary mt-4" id="compare-btn">Comparar</button>
        </div>

        <div class="grid grid-cols-3 gap-6" id="compare-results">
          <div class="card-flat">
            <h4>📝 Character-Level</h4>
            <div id="compare-char" class="tokens-container"></div>
            <div class="mt-4 text-sm text-muted"><span id="compare-char-count">-</span> tokens</div>
          </div>
          <div class="card-flat">
            <h4>📄 Word-Level</h4>
            <div id="compare-word" class="tokens-container"></div>
            <div class="mt-4 text-sm text-muted"><span id="compare-word-count">-</span> tokens</div>
          </div>
          <div class="card-flat" style="border-color: var(--primary);">
            <h4>🧩 BPE (Subword)</h4>
            <div id="compare-bpe" class="tokens-container"></div>
            <div class="mt-4 text-sm text-muted"><span id="compare-bpe-count">-</span> tokens</div>
          </div>
        </div>

        <!-- Visual bar chart -->
        <div class="card-flat mt-6">
          <h4>Token Count Comparison</h4>
          <div id="compare-chart" class="compare-chart"></div>
        </div>
      </div>
    `;
  }

  /* ---- Quiz Tab ---- */
  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — Tokenização</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map((s) => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre tokenização. Responda 5 perguntas e ganhe até 3 estrelas!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>

        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  /* ---- Quiz Data ---- */
  const QUIZ_QUESTIONS = [
    {
      question: 'O que é tokenização no contexto de LLMs?',
      options: [
        'Criptografar texto para segurança',
        'Converter texto em sequência de números que o modelo entende',
        'Traduzir texto entre idiomas',
        'Comprimir texto para economizar espaço',
      ],
      correct: 1,
      explanation: 'Tokenização converte texto em tokens (números) que o modelo de IA pode processar.',
    },
    {
      question: 'Qual destes é o algoritmo de tokenização usado pelo GPT?',
      options: [
        'Word-Level',
        'Character-Level',
        'Byte Pair Encoding (BPE)',
        'Regex Splitting',
      ],
      correct: 2,
      explanation: 'O GPT usa BPE (Byte Pair Encoding), que cria subwords balanceando vocabulário e eficiência.',
    },
    {
      question: 'A palavra "unhappiness" provavelmente seria tokenizada em BPE como:',
      options: [
        '["unhappiness"] — uma única palavra',
        '["u","n","h","a","p","p","i","n","e","s","s"] — cada letra',
        '["un", "happi", "ness"] — subwords frequentes',
        '["un", "hap", "pin", "ess"] — divisão aleatória',
      ],
      correct: 2,
      explanation: 'BPE divide em subwords frequentes que capturam significado: "un" (prefixo), "happi" (raiz), "ness" (sufixo).',
    },
    {
      question: 'Por que BPE é melhor que tokenização word-level?',
      options: [
        'É mais rápido de processar',
        'Lida com palavras desconhecidas dividindo-as em subwords',
        'Usa menos memória RAM',
        'Produz tokens mais bonitos',
      ],
      correct: 1,
      explanation: 'BPE pode decompor palavras nunca vistas em subwords conhecidas, evitando o problema de "token desconhecido".',
    },
    {
      question: 'Se um texto tem 100 caracteres e o BPE produz 25 tokens, qual é a taxa de compressão?',
      options: [
        '2.5x',
        '4x',
        '25x',
        '0.25x',
      ],
      correct: 1,
      explanation: 'Taxa de compressão = caracteres / tokens = 100 / 25 = 4x. Cada token representa em média 4 caracteres.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* ================= Interactions ================= */

  function initInteractions() {
    // Demo: live tokenization
    const tokenInput = document.getElementById('token-input');
    if (tokenInput) {
      tokenInput.addEventListener('input', () => updateTokenDisplay(tokenInput.value));
      updateTokenDisplay(tokenInput.value);
    }

    // Example buttons
    document.querySelectorAll('.example-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('token-input');
        if (input) {
          input.value = btn.dataset.text;
          updateTokenDisplay(btn.dataset.text);
        }
      });
    });

    // BPE steps
    document.getElementById('bpe-start-btn')?.addEventListener('click', startBPESteps);
    document.getElementById('bpe-step-btn')?.addEventListener('click', nextBPEStep);
    document.getElementById('bpe-auto-btn')?.addEventListener('click', autoBPESteps);

    // Compare
    document.getElementById('compare-btn')?.addEventListener('click', runComparison);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* ---- Live Token Display ---- */
  function updateTokenDisplay(text) {
    const tokens = TokenizerEngine.tokenize(text);
    const visual = document.getElementById('tokens-visual');
    const ids = document.getElementById('tokens-ids');

    if (visual) {
      visual.innerHTML = tokens
        .map((t) => {
          const color = TokenizerEngine.getTokenColor(t);
          const displayText = t.text === ' ' ? '␣' : t.text;
          return `<span class="token-chip" style="--chip-color: ${color}" 
                    title="ID: ${t.id} | Type: ${t.type}">
                    ${escapeHTML(displayText)}
                  </span>`;
        })
        .join('');
    }

    if (ids) {
      ids.innerHTML = `[${tokens.map((t) => `<span class="token-id">${t.id}</span>`).join(', ')}]`;
    }

    // Stats
    const chars = text.length;
    const tokenCount = tokens.length;
    const unique = new Set(tokens.map((t) => t.id)).size;
    const ratio = chars > 0 ? (chars / tokenCount).toFixed(1) : '0';

    setText('token-count', `${tokenCount} tokens`);
    setText('stat-chars', chars);
    setText('stat-tokens', tokenCount);
    setText('stat-ratio', `${ratio}x`);
    setText('stat-unique', unique);
  }

  /* ---- BPE Steps ---- */
  function startBPESteps() {
    const input = document.getElementById('bpe-input');
    const text = input?.value || 'the cat sat on the mat';
    bpeSteps = TokenizerEngine.simulateBPESteps(text);
    bpeStepIndex = 0;
    renderBPEStep();

    const stepBtn = document.getElementById('bpe-step-btn');
    if (stepBtn) stepBtn.disabled = false;
  }

  function nextBPEStep() {
    if (bpeStepIndex < bpeSteps.length - 1) {
      bpeStepIndex++;
      renderBPEStep();
    }

    if (bpeStepIndex >= bpeSteps.length - 1) {
      const stepBtn = document.getElementById('bpe-step-btn');
      if (stepBtn) stepBtn.disabled = true;
    }
  }

  async function autoBPESteps() {
    if (animating) return;
    animating = true;

    if (bpeStepIndex === 0 && bpeSteps.length === 0) {
      startBPESteps();
      await sleep(600);
    }

    while (bpeStepIndex < bpeSteps.length - 1) {
      bpeStepIndex++;
      renderBPEStep();
      await sleep(800);
    }

    animating = false;
  }

  function renderBPEStep() {
    const container = document.getElementById('bpe-steps-container');
    if (!container || bpeSteps.length === 0) return;

    const step = bpeSteps[bpeStepIndex];
    const isFirst = bpeStepIndex === 0;
    const isLast = bpeStepIndex === bpeSteps.length - 1;

    container.innerHTML = `
      <div class="card-flat bpe-step-card">
        <div class="flex items-center justify-between mb-4">
          <span class="badge badge-primary">Passo ${bpeStepIndex + 1} / ${bpeSteps.length}</span>
          ${step.mergeApplied 
            ? `<span class="badge badge-accent">Merge: "${step.mergeApplied}"</span>` 
            : '<span class="badge">Início</span>'}
        </div>
        <p class="text-sm mb-4">${step.description}</p>
        <div class="tokens-container">
          ${step.tokens.map((t) => {
            const color = TokenizerEngine.getTokenColor(t);
            const isNew = step.mergeApplied && t.text === step.mergeApplied;
            return `<span class="token-chip ${isNew ? 'token-new' : ''}" 
                      style="--chip-color: ${color}"
                      title="ID: ${t.id}">
                      ${escapeHTML(t.text === ' ' ? '␣' : t.text)}
                    </span>`;
          }).join('')}
        </div>
        <div class="mt-4 text-sm text-muted">
          ${step.tokens.length} tokens | IDs: [${step.tokens.map((t) => t.id).join(', ')}]
        </div>
      </div>

      <!-- Progress dots -->
      <div class="flex justify-center gap-2 mt-4">
        ${bpeSteps.map((_, i) => 
          `<div class="bpe-dot ${i <= bpeStepIndex ? 'active' : ''} ${i === bpeStepIndex ? 'current' : ''}"></div>`
        ).join('')}
      </div>
    `;
  }

  /* ---- Comparison ---- */
  function runComparison() {
    const input = document.getElementById('compare-input');
    const text = input?.value || '';
    if (!text) return;

    const charTokens = TokenizerEngine.tokenizeCharLevel(text);
    const wordTokens = TokenizerEngine.tokenizeWordLevel(text);
    const bpeTokens = TokenizerEngine.tokenize(text);

    renderTokensInContainer('compare-char', charTokens);
    renderTokensInContainer('compare-word', wordTokens);
    renderTokensInContainer('compare-bpe', bpeTokens);

    setText('compare-char-count', charTokens.length);
    setText('compare-word-count', wordTokens.length);
    setText('compare-bpe-count', bpeTokens.length);

    // Bar chart
    renderCompareChart(charTokens.length, wordTokens.length, bpeTokens.length);
  }

  function renderTokensInContainer(containerId, tokens) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = tokens
      .map((t) => {
        const color = TokenizerEngine.getTokenColor(t);
        const displayText = t.text === ' ' ? '␣' : t.text;
        return `<span class="token-chip" style="--chip-color: ${color}">${escapeHTML(displayText)}</span>`;
      })
      .join('');
  }

  function renderCompareChart(charCount, wordCount, bpeCount) {
    const chart = document.getElementById('compare-chart');
    if (!chart) return;

    const max = Math.max(charCount, wordCount, bpeCount);

    chart.innerHTML = `
      <div class="chart-bar-row">
        <span class="chart-label">Character</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${(charCount / max) * 100}%; background: #64748b;">
            <span>${charCount}</span>
          </div>
        </div>
      </div>
      <div class="chart-bar-row">
        <span class="chart-label">Word</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${(wordCount / max) * 100}%; background: var(--accent);">
            <span>${wordCount}</span>
          </div>
        </div>
      </div>
      <div class="chart-bar-row">
        <span class="chart-label">BPE ⭐</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${(bpeCount / max) * 100}%; background: var(--primary);">
            <span>${bpeCount}</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- Quiz ---- */
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

    // Add click listeners
    container.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQuizAnswer(parseInt(btn.dataset.index)));
    });
  }

  function handleQuizAnswer(selectedIndex) {
    const q = QUIZ_QUESTIONS[quizState.current];
    const isCorrect = selectedIndex === q.correct;
    quizState.answers.push({ selected: selectedIndex, correct: q.correct, isCorrect });

    // Show feedback
    const container = document.getElementById('quiz-container');
    const options = container.querySelectorAll('.quiz-option');

    options.forEach((opt, i) => {
      opt.disabled = true;
      opt.style.pointerEvents = 'none';

      if (i === q.correct) {
        opt.classList.add('quiz-correct');
      } else if (i === selectedIndex && !isCorrect) {
        opt.classList.add('quiz-wrong');
      }
    });

    // Show explanation
    const card = container.querySelector('.quiz-card');
    const explanation = document.createElement('div');
    explanation.className = `quiz-explanation ${isCorrect ? 'correct' : 'wrong'} mt-4`;
    explanation.innerHTML = `
      <p><strong>${isCorrect ? '✅ Correto!' : '❌ Incorreto!'}</strong></p>
      <p class="text-sm">${q.explanation}</p>
      <button class="btn btn-primary mt-4 quiz-next-btn">
        ${quizState.current < QUIZ_QUESTIONS.length - 1 ? 'Próxima →' : 'Ver Resultado'}
      </button>
    `;
    card.appendChild(explanation);

    explanation.querySelector('.quiz-next-btn').addEventListener('click', () => {
      quizState.current++;
      if (quizState.current < QUIZ_QUESTIONS.length) {
        renderQuizQuestion();
      } else {
        finishQuiz();
      }
    });
  }

  function finishQuiz() {
    const score = quizState.answers.filter((a) => a.isCorrect).length;
    const total = QUIZ_QUESTIONS.length;
    const elapsed = Math.round((Date.now() - quizState.startTime) / 1000);
    const result = Progress.completeQuiz('tokenization', score, total);

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
          ${[1, 2, 3].map((s) => `<span class="star ${s <= result.stars ? 'earned' : ''}">★</span>`).join('')}
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

    // Check speed achievement
    if (elapsed < 60 && score >= 4) {
      Achievements.unlock('speedrunner');
    }

    Achievements.checkAll();
  }

  /* ---- Helpers ---- */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return { render, initInteractions };
})();
