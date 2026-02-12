/* ============================================
   AIFORALL V2 — Attention Demo
   Interactive self-attention heatmap,
   step-by-step, multi-head comparison, quiz
   ============================================ */

const AttentionDemo = (() => {

  let currentResult = null;
  let highlightRow = -1;
  let highlightCol = -1;

  const EXAMPLE_SENTENCES = [
    'The cat sat on the mat',
    'I love you very much',
    'The quick brown fox jumped',
    'She is not happy',
    'The king and the queen',
  ];

  /** Render full module */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.attention || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header reveal">
              <span style="font-size: 3rem;">🎯</span>
              <div>
                <h1>Attention</h1>
                <p>O mecanismo que permitiu aos Transformers revolucionar a IA</p>
              </div>
            </div>

            <div class="tab-bar reveal">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="demo">🔥 Heatmap</button>
              <button class="tab" data-tab="steps">📊 Passo a Passo</button>
              <button class="tab" data-tab="multihead">🧠 Multi-Head</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active reveal">${renderLearnTab()}</div>
            <div id="tab-demo" class="tab-content hidden">${renderDemoTab()}</div>
            <div id="tab-steps" class="tab-content hidden">${renderStepsTab()}</div>
            <div id="tab-multihead" class="tab-content hidden">${renderMultiHeadTab()}</div>
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
          <h3>🎯 O que é Self-Attention?</h3>
          <p>Self-Attention é o mecanismo central dos <strong>Transformers</strong>. 
          Ele permite que cada palavra em uma frase "olhe" para todas as outras palavras 
          e decida <em>quais são mais relevantes</em> para entender seu significado no contexto.</p>
          <p class="mt-4">Exemplo: em "O <strong>gato</strong> sentou no tapete porque <strong>ele</strong> estava cansado", 
          o mecanismo de atenção conecta "ele" a "gato" com peso alto.</p>
        </div>

        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="card-flat text-center">
            <div style="font-size:2.5rem;">🔑</div>
            <h4>Query (Q)</h4>
            <p class="text-sm text-muted">"O que eu estou procurando?"</p>
            <p class="text-xs">Cada token gera um vetor Query representando <em>o que ele quer saber</em>.</p>
          </div>
          <div class="card-flat text-center">
            <div style="font-size:2.5rem;">🗝️</div>
            <h4>Key (K)</h4>
            <p class="text-sm text-muted">"O que eu tenho a oferecer?"</p>
            <p class="text-xs">Cada token gera um vetor Key representando <em>sua identidade</em>.</p>
          </div>
          <div class="card-flat text-center">
            <div style="font-size:2.5rem;">💎</div>
            <h4>Value (V)</h4>
            <p class="text-sm text-muted">"Qual informação eu carrego?"</p>
            <p class="text-xs">Cada token gera um vetor Value com seu <em>conteúdo real</em>.</p>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>⚡ A Fórmula</h3>
          <div class="text-center my-4" style="font-size:1.3rem;font-family:var(--font-mono);color:var(--primary);">
            Attention(Q, K, V) = softmax(Q · Kᵀ / √dₖ) · V
          </div>
          <ol class="mt-4">
            <li><strong>Q · Kᵀ</strong> — cada Query faz dot-product com cada Key → score de afinidade</li>
            <li><strong>/ √dₖ</strong> — escala para evitar valores muito grandes</li>
            <li><strong>softmax</strong> — converte scores em probabilidades (0 a 1, soma = 1)</li>
            <li><strong>× V</strong> — média ponderada dos Values → output contextualizado</li>
          </ol>
        </div>

        <div class="card-flat">
          <h3>🧠 Multi-Head Attention</h3>
          <p>Em vez de um único mecanismo de atenção, Transformers usam <strong>múltiplas "cabeças"</strong> 
          em paralelo. Cada cabeça aprende a focar em aspectos diferentes:</p>
          <ul class="mt-4">
            <li>Uma cabeça pode focar em <strong>relações sintáticas</strong> (sujeito-verbo)</li>
            <li>Outra em <strong>relações semânticas</strong> (sinônimos, referências)</li>
            <li>Outra em <strong>posição relativa</strong> (palavras próximas)</li>
          </ul>
          <p class="text-sm text-muted mt-4">GPT-3 usa 96 cabeças de atenção em cada layer!</p>
        </div>
      </div>
    `;
  }

  function renderDemoTab() {
    return `
      <div class="demo-section">
        <div class="card-flat mb-4">
          <h3>🔥 Mapa de Atenção Interativo</h3>
          <p class="text-sm text-muted">Digite uma frase e veja como cada token "presta atenção" nos outros.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="attn-input" class="input" value="The cat sat on the mat" 
              placeholder="Digite uma frase..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary" id="attn-run-btn">Calcular Atenção</button>
          </div>
          <div class="flex gap-2 mt-3 flex-wrap">
            ${EXAMPLE_SENTENCES.map(s => 
              `<button class="btn btn-ghost btn-sm attn-example" data-sentence="${s}">${s}</button>`
            ).join('')}
          </div>
        </div>

        <div id="attn-heatmap-container" class="mt-4"></div>
      </div>
    `;
  }

  function renderStepsTab() {
    return `
      <div class="steps-section">
        <div class="card-flat mb-4">
          <h3>📊 Passo a Passo do Self-Attention</h3>
          <p class="text-sm text-muted">Veja cada etapa do cálculo de atenção em detalhe.</p>
          <div class="flex gap-4 items-center mt-4">
            <input id="steps-input" class="input" value="The cat sat on the mat" 
              placeholder="Digite uma frase..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary" id="steps-run-btn">Calcular</button>
          </div>
        </div>
        <div id="steps-container" class="mt-4"></div>
      </div>
    `;
  }

  function renderMultiHeadTab() {
    return `
      <div class="multihead-section">
        <div class="card-flat mb-4">
          <h3>🧠 Multi-Head Attention</h3>
          <p class="text-sm text-muted">Compare como diferentes "cabeças" focam em aspectos diferentes da mesma frase.</p>
          <div class="flex gap-4 items-center mt-4">
            <input id="mh-input" class="input" value="The cat sat on the mat" 
              placeholder="Digite uma frase..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary" id="mh-run-btn">Comparar Cabeças</button>
          </div>
        </div>
        <div id="mh-container" class="mt-4"></div>
      </div>
    `;
  }

  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — Attention</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre o mecanismo de atenção!</p>
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
      question: 'Qual é a fórmula do Self-Attention?',
      options: [
        'softmax(Q · V / √dₖ) · K',
        'softmax(Q · Kᵀ / √dₖ) · V',
        'sigmoid(Q + K) × V',
        'relu(Q · Kᵀ) · V',
      ],
      correct: 1,
      explanation: 'A fórmula correta é Attention(Q,K,V) = softmax(Q·Kᵀ/√dₖ)·V. O dot-product é entre Q e K, depois multiplica por V.',
    },
    {
      question: 'Para que serve a divisão por √dₖ no attention?',
      options: [
        'Para normalizar o output entre 0 e 1',
        'Para evitar que dot-products fiquem muito grandes, estabilizando o softmax',
        'Para reduzir o número de parâmetros',
        'Para fazer o modelo treinar mais rápido',
      ],
      correct: 1,
      explanation: 'Sem a escala, dot-products de vetores de alta dimensão ficam muito grandes, fazendo o softmax saturar (gradientes ~0). A divisão por √dₖ mantém a variância controlada.',
    },
    {
      question: 'O que representa o vetor Query (Q)?',
      options: [
        'A informação que o token carrega para ser compartilhada',
        'A identidade do token para ser comparado',
        'O que o token está buscando/perguntando ao contexto',
        'A posição do token na frase',
      ],
      correct: 2,
      explanation: 'O Query representa "o que este token está procurando". Ele é comparado com as Keys dos outros tokens para encontrar as partes mais relevantes.',
    },
    {
      question: 'Por que usar Multi-Head Attention em vez de uma única cabeça?',
      options: [
        'Cada cabeça pode aprender diferentes padrões de relacionamento entre tokens',
        'Reduz o custo computacional pela metade',
        'Permite processar sequências mais longas',
        'Remove a necessidade de softmax',
      ],
      correct: 0,
      explanation: 'Múltiplas cabeças permitem capturar diferentes tipos de relações: sintáticas, semânticas, posicionais, etc. É como olhar a mesma frase de vários ângulos.',
    },
    {
      question: 'O que o softmax faz no attention?',
      options: [
        'Seleciona apenas o token com maior score',
        'Converte scores em probabilidades que somam 1',
        'Remove tokens irrelevantes da frase',
        'Normaliza os vetores para terem norma 1',
      ],
      correct: 1,
      explanation: 'O softmax converte os scores brutos em uma distribuição de probabilidade (valores entre 0 e 1, soma = 1), que serve como os pesos de atenção.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */

  function initInteractions() {
    // Demo: heatmap
    document.getElementById('attn-run-btn')?.addEventListener('click', runHeatmap);
    document.querySelectorAll('.attn-example').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('attn-input').value = btn.dataset.sentence;
        runHeatmap();
      });
    });

    // Steps
    document.getElementById('steps-run-btn')?.addEventListener('click', runSteps);

    // Multi-head
    document.getElementById('mh-run-btn')?.addEventListener('click', runMultiHead);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);

    // Auto-run heatmap
    runHeatmap();
  }

  /* =================== Heatmap =================== */

  function runHeatmap() {
    const input = document.getElementById('attn-input');
    const text = input?.value?.trim();
    if (!text) return;

    currentResult = AttentionEngine.computeSelfAttention(text);
    highlightRow = -1;
    highlightCol = -1;
    renderHeatmap();
  }

  function renderHeatmap() {
    const container = document.getElementById('attn-heatmap-container');
    if (!container || !currentResult) return;

    const { tokens, weights } = currentResult;
    const n = tokens.length;
    const cellSize = Math.min(64, Math.floor(600 / n));

    let html = `
      <div class="card-flat">
        <div class="flex items-center justify-between mb-4">
          <h4 style="margin:0">Mapa de Atenção</h4>
          <span class="text-xs text-muted">Passe o mouse para explorar. Cores fortes = mais atenção.</span>
        </div>
        <div class="attn-heatmap-scroll" style="overflow-x:auto;">
          <table class="attn-heatmap" id="attn-heatmap-table">
            <thead>
              <tr>
                <th class="attn-corner"></th>
                ${tokens.map((t, j) => `<th class="attn-header-col" data-col="${j}">${t}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < n; i++) {
      html += `<tr>`;
      html += `<th class="attn-header-row" data-row="${i}">${tokens[i]}</th>`;
      for (let j = 0; j < n; j++) {
        const w = weights[i][j];
        const pct = (w * 100).toFixed(1);
        const bg = AttentionEngine.getAttentionColor(w);
        const textColor = w > 0.4 ? '#fff' : 'var(--text-muted)';
        const isHighlight = (highlightRow === i || highlightCol === j);
        html += `<td class="attn-cell ${isHighlight ? 'attn-highlight' : ''}" 
          data-row="${i}" data-col="${j}"
          style="background: ${bg}; color: ${textColor}; 
          width: ${cellSize}px; height: ${cellSize}px; 
          font-size: ${cellSize > 50 ? '12px' : '10px'};"
          title="${tokens[i]} → ${tokens[j]}: ${pct}%">
          ${pct}%
        </td>`;
      }
      html += `</tr>`;
    }

    html += `</tbody></table></div>`;

    // Sentence view with attention arcs
    html += `
        <div class="mt-6">
          <h4>Foco de Atenção</h4>
          <p class="text-sm text-muted mb-4">Clique em um token abaixo para ver de onde ele recebe atenção.</p>
          <div class="attn-sentence flex flex-wrap gap-2" id="attn-sentence">
            ${tokens.map((t, i) => `
              <button class="attn-token-btn ${i === highlightRow ? 'active' : ''}" data-idx="${i}">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
    `;

    // Attention bars when a token is selected
    if (highlightRow >= 0) {
      const row = weights[highlightRow];
      html += `
        <div class="mt-4">
          <h4>"${tokens[highlightRow]}" presta atenção em:</h4>
          <div class="flex flex-col gap-2 mt-2">
            ${row.map((w, j) => {
              const pct = (w * 100).toFixed(1);
              return `
                <div class="flex items-center gap-3">
                  <span class="font-bold" style="width:80px;">${tokens[j]}</span>
                  <div class="progress-bar" style="flex:1;height:10px;">
                    <div class="progress-fill" style="width:${pct}%;background:${AttentionEngine.getAttentionColor(w)};"></div>
                  </div>
                  <span class="text-sm font-mono" style="width:55px;">${pct}%</span>
                </div>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Add hover/click listeners
    const table = document.getElementById('attn-heatmap-table');
    if (table) {
      table.querySelectorAll('.attn-cell').forEach(cell => {
        cell.addEventListener('mouseenter', () => {
          const r = parseInt(cell.dataset.row);
          const c = parseInt(cell.dataset.col);
          // Highlight row and col headers
          table.querySelectorAll('.attn-header-row').forEach(h => h.classList.toggle('attn-active', parseInt(h.dataset.row) === r));
          table.querySelectorAll('.attn-header-col').forEach(h => h.classList.toggle('attn-active', parseInt(h.dataset.col) === c));
        });
        cell.addEventListener('mouseleave', () => {
          table.querySelectorAll('.attn-active').forEach(h => h.classList.remove('attn-active'));
        });
      });
    }

    // Token buttons
    document.querySelectorAll('.attn-token-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        highlightRow = parseInt(btn.dataset.idx);
        renderHeatmap();
      });
    });
  }

  /* =================== Steps =================== */

  function runSteps() {
    const input = document.getElementById('steps-input');
    const text = input?.value?.trim();
    if (!text) return;

    const result = AttentionEngine.computeSelfAttention(text);
    const container = document.getElementById('steps-container');
    if (!container) return;

    let html = '';

    result.steps.forEach((step, idx) => {
      html += `<div class="card-flat mb-4">`;
      html += `<h4 class="text-primary">${step.title}</h4>`;
      html += `<p class="text-sm text-muted mb-4">${step.desc}</p>`;

      if (idx === 0) {
        // Embeddings table
        html += `<div style="overflow-x:auto;"><table class="attn-step-table">
          <thead><tr><th>Token</th><th>Embedding (4D)</th></tr></thead><tbody>`;
        step.data.forEach(d => {
          html += `<tr><td class="font-bold">${d.token}</td>
            <td class="font-mono text-sm">[${d.vec.map(v => v.toFixed(2)).join(', ')}]</td></tr>`;
        });
        html += `</tbody></table></div>`;

      } else if (idx === 1) {
        // Q, K, V table
        html += `<div style="overflow-x:auto;"><table class="attn-step-table">
          <thead><tr><th>Token</th><th style="color:var(--primary)">Q</th>
          <th style="color:var(--secondary)">K</th><th style="color:var(--accent)">V</th></tr></thead><tbody>`;
        step.data.forEach(d => {
          html += `<tr><td class="font-bold">${d.token}</td>
            <td class="font-mono text-xs">[${d.q.join(', ')}]</td>
            <td class="font-mono text-xs">[${d.k.join(', ')}]</td>
            <td class="font-mono text-xs">[${d.v.join(', ')}]</td></tr>`;
        });
        html += `</tbody></table></div>`;

      } else if (idx === 2 || idx === 3) {
        // Score / weight matrix
        const tokens = result.tokens;
        html += `<div style="overflow-x:auto;"><table class="attn-step-table attn-matrix">
          <thead><tr><th></th>${tokens.map(t => `<th>${t}</th>`).join('')}</tr></thead><tbody>`;
        step.data.forEach((row, i) => {
          html += `<tr><th>${tokens[i]}</th>`;
          row.forEach(val => {
            const bg = idx === 3 ? AttentionEngine.getAttentionColor(val) : 'transparent';
            const textC = idx === 3 && val > 0.4 ? '#fff' : 'inherit';
            html += `<td style="background:${bg};color:${textC};" class="font-mono text-xs">${val.toFixed(3)}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table></div>`;

      } else if (idx === 4) {
        // Output vectors
        html += `<div style="overflow-x:auto;"><table class="attn-step-table">
          <thead><tr><th>Token</th><th>Output contextualizado</th></tr></thead><tbody>`;
        step.data.forEach(d => {
          html += `<tr><td class="font-bold">${d.token}</td>
            <td class="font-mono text-sm">[${d.vec.join(', ')}]</td></tr>`;
        });
        html += `</tbody></table></div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  /* =================== Multi-Head =================== */

  function runMultiHead() {
    const input = document.getElementById('mh-input');
    const text = input?.value?.trim();
    if (!text) return;

    const result = AttentionEngine.computeMultiHead(text, 3);
    const container = document.getElementById('mh-container');
    if (!container) return;

    const { tokens, heads } = result;
    const n = tokens.length;
    const cellSize = Math.min(56, Math.floor(550 / n));

    let html = `<div class="grid grid-cols-${Math.min(heads.length, 3)} gap-4">`;

    heads.forEach((head, hIdx) => {
      html += `<div class="card-flat">
        <h4 class="text-center mb-4" style="color: ${['var(--primary)', 'var(--secondary)', 'var(--accent)'][hIdx]}">
          ${head.label}
        </h4>
        <div style="overflow-x:auto;">
          <table class="attn-heatmap attn-mini">
            <thead><tr><th></th>${tokens.map(t => `<th>${t}</th>`).join('')}</tr></thead>
            <tbody>`;
      for (let i = 0; i < n; i++) {
        html += `<tr><th>${tokens[i]}</th>`;
        for (let j = 0; j < n; j++) {
          const w = head.weights[i][j];
          const bg = AttentionEngine.getAttentionColor(w);
          const textC = w > 0.4 ? '#fff' : 'var(--text-muted)';
          html += `<td style="background:${bg};color:${textC};width:${cellSize}px;height:${cellSize}px;font-size:10px;">${(w * 100).toFixed(0)}%</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table></div></div>`;
    });

    html += `</div>`;

    html += `
      <div class="card-flat mt-4">
        <h4>🔍 O que observar</h4>
        <ul class="mt-2">
          <li>Cada cabeça gera um padrão de atenção <strong>diferente</strong></li>
          <li>Uma cabeça pode focar mais em palavras próximas, outra em relações semânticas</li>
          <li>O modelo combina todas as cabeças para ter uma visão completa</li>
        </ul>
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
    const result = Progress.completeQuiz('attention', score, total);

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

    // Check achievements
    if (elapsed < 60 && score >= 4) Achievements.unlock('speedrunner');
    Achievements.unlock('full_attention');
    Achievements.checkAll();
  }

  return { render, initInteractions };
})();
