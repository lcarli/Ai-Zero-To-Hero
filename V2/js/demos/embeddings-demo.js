/* ============================================
   AIFORALL V2 — Embeddings Demo
   Interactive 2D embedding space, similarity
   search, analogies, positional encoding
   ============================================ */

const EmbeddingsDemo = (() => {
  let canvas, ctx;
  let hoveredWord = null;
  let selectedWord = null;
  let showGroups = true;
  let canvasScale = 1;

  const PREDEFINED_ANALOGIES = [
    { a: 'king', b: 'queen', c: 'man', label: 'king → queen :: man → ?' },
    { a: 'man', b: 'woman', c: 'boy', label: 'man → woman :: boy → ?' },
    { a: 'king', b: 'prince', c: 'queen', label: 'king → prince :: queen → ?' },
    { a: 'cat', b: 'dog', c: 'fish', label: 'cat → dog :: fish → ?' },
    { a: 'happy', b: 'sad', c: 'love', label: 'happy → sad :: love → ?' },
  ];

  /** Render full module */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.embeddings || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header reveal">
              <span style="font-size: 3rem;">📐</span>
              <div>
                <h1>Embeddings</h1>
                <p>Representação vetorial de palavras em espaço multidimensional</p>
              </div>
            </div>

            <div class="tab-bar reveal">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="space">🌌 Espaço 2D</button>
              <button class="tab" data-tab="similarity">🔍 Similaridade</button>
              <button class="tab" data-tab="analogy">🧮 Analogias</button>
              <button class="tab" data-tab="positional">📍 Pos. Encoding</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active reveal">${renderLearnTab()}</div>
            <div id="tab-space" class="tab-content hidden">${renderSpaceTab()}</div>
            <div id="tab-similarity" class="tab-content hidden">${renderSimilarityTab()}</div>
            <div id="tab-analogy" class="tab-content hidden">${renderAnalogyTab()}</div>
            <div id="tab-positional" class="tab-content hidden">${renderPositionalTab()}</div>
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
          <h3>🤔 O que são Embeddings?</h3>
          <p>Embeddings transformam palavras (ou tokens) em <strong>vetores numéricos</strong> — listas 
          de números que capturam o <em>significado</em> da palavra. Palavras com significados similares 
          ficam próximas nesse espaço.</p>
          <p>Imagine um mapa onde cada palavra é um ponto. "Rei" e "Rainha" ficam perto, 
          assim como "Gato" e "Cachorro".</p>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-8">
          <div class="card-flat">
            <h4>📊 De Texto para Vetores</h4>
            <p class="text-sm">"gato" → <code>[0.82, 0.15, -0.3, 0.6, 0.1]</code></p>
            <p class="text-sm">"cachorro" → <code>[0.78, 0.20, -0.25, 0.55, 0.15]</code></p>
            <p class="text-sm text-muted">Vetores próximos = palavras com significado similar!</p>
          </div>
          <div class="card-flat">
            <h4>🧮 Matemática do Significado</h4>
            <p class="text-sm">A mágica dos embeddings:</p>
            <p class="text-sm"><code>rei - homem + mulher ≈ rainha</code></p>
            <p class="text-sm text-muted">Operações matemáticas capturam relações semânticas!</p>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>📐 Dimensões</h3>
          <p>Um embedding real tem <strong>centenas ou milhares</strong> de dimensões 
          (GPT-3 usa 12.288!). Cada dimensão captura um aspecto do significado.</p>
          <p>Para visualizar, projetamos esses vetores em 2D — como achatar um globo em um mapa.</p>
        </div>

        <div class="card-flat">
          <h3>📍 Positional Encoding</h3>
          <p>Além do significado da palavra, o modelo precisa saber a <strong>posição</strong> dela 
          na frase. "O gato mordeu o cão" ≠ "O cão mordeu o gato".</p>
          <p>O <em>Positional Encoding</em> adiciona informação de posição ao vetor usando funções seno e cosseno, 
          criando um "relógio" único para cada posição.</p>
        </div>
      </div>
    `;
  }

  function renderSpaceTab() {
    return `
      <div class="space-section">
        <div class="card-flat mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 style="margin:0">Espaço de Embeddings 2D</h3>
              <p class="text-sm text-muted" style="margin:0">Passe o mouse sobre os pontos. Clique para selecionar e ver similaridades.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-ghost ${showGroups ? 'active' : ''}" id="toggle-groups">
                Agrupar por cor
              </button>
            </div>
          </div>
        </div>

        <div class="emb-canvas-wrap">
          <canvas id="emb-canvas" class="emb-canvas" width="800" height="500"></canvas>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap gap-4 mt-4" id="emb-legend">
          ${Object.entries(EmbeddingsEngine.GROUP_LABELS).map(([key, label]) => `
            <span class="badge" style="background: ${EmbeddingsEngine.GROUP_COLORS[key]}22; 
              color: ${EmbeddingsEngine.GROUP_COLORS[key]}; border-color: ${EmbeddingsEngine.GROUP_COLORS[key]}44;">
              ${label}
            </span>
          `).join('')}
        </div>

        <!-- Info panel -->
        <div id="emb-info" class="card-flat mt-4 hidden">
          <div id="emb-info-content"></div>
        </div>
      </div>
    `;
  }

  function renderSimilarityTab() {
    const words = EmbeddingsEngine.getAllWords();
    return `
      <div class="similarity-section">
        <div class="card-flat mb-4">
          <h3>🔍 Busca por Similaridade</h3>
          <p>Selecione uma palavra e veja quais outras são mais similares no espaço de embeddings.</p>
          <div class="flex gap-4 items-center mt-4">
            <select id="sim-word-select" class="input" style="max-width: 200px;">
              <option value="">Escolha uma palavra...</option>
              ${words.map((w) => `<option value="${w}">${w}</option>`).join('')}
            </select>
            <span class="text-muted text-sm">ou</span>
            <input id="sim-word-input" class="input" placeholder="Digite uma palavra..." style="max-width: 200px;">
            <button class="btn btn-primary" id="sim-search-btn">Buscar</button>
          </div>
        </div>

        <div id="sim-results" class="mt-4"></div>
      </div>
    `;
  }

  function renderAnalogyTab() {
    return `
      <div class="analogy-section">
        <div class="card-flat mb-4">
          <h3>🧮 Analogias Vetoriais</h3>
          <p><strong>A</strong> está para <strong>B</strong> assim como <strong>C</strong> está para <strong>?</strong></p>
          <p class="text-sm text-muted">Fórmula: vec(B) - vec(A) + vec(C) ≈ vec(?)</p>
        </div>

        <!-- Predefined -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          ${PREDEFINED_ANALOGIES.map((a, i) => `
            <button class="card analogy-preset" data-a="${a.a}" data-b="${a.b}" data-c="${a.c}">
              <span class="text-sm font-bold">${a.label}</span>
              <span class="text-xs text-muted">Clique para resolver</span>
            </button>
          `).join('')}
        </div>

        <!-- Custom -->
        <div class="card-flat mb-4">
          <h4>Crie sua analogia</h4>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="analogy-a" class="input" placeholder="A (ex: king)" style="max-width: 140px;">
            <span class="text-muted">→</span>
            <input id="analogy-b" class="input" placeholder="B (ex: queen)" style="max-width: 140px;">
            <span class="text-muted">::</span>
            <input id="analogy-c" class="input" placeholder="C (ex: man)" style="max-width: 140px;">
            <span class="text-muted">→</span>
            <span class="badge badge-accent" id="analogy-result" style="font-size:1rem;padding:8px 16px;">?</span>
            <button class="btn btn-primary" id="analogy-solve-btn">Resolver</button>
          </div>
        </div>

        <div id="analogy-details" class="mt-4"></div>
      </div>
    `;
  }

  function renderPositionalTab() {
    return `
      <div class="positional-section">
        <div class="card-flat mb-4">
          <h3>📍 Positional Encoding</h3>
          <p>Veja como cada posição na frase recebe um padrão único de seno/cosseno.</p>
          <div class="flex gap-4 items-center mt-4">
            <input id="pe-input" class="input" value="The cat sat on the mat" 
              placeholder="Digite uma frase..." style="max-width: 400px;">
            <button class="btn btn-primary" id="pe-btn">Visualizar</button>
          </div>
        </div>
        <div id="pe-visualization" class="mt-4"></div>
      </div>
    `;
  }

  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — Embeddings</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map((s) => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre embeddings e representações vetoriais!</p>
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
      question: 'O que são word embeddings?',
      options: [
        'Imagens de palavras usadas em OCR',
        'Vetores numéricos que representam o significado de palavras',
        'Tabelas de frequência de palavras em um texto',
        'Criptografia de palavras para segurança',
      ],
      correct: 1,
      explanation: 'Embeddings são vetores numéricos densos que capturam relações semânticas entre palavras.',
    },
    {
      question: 'Se "rei" e "rainha" estão próximos no espaço de embeddings, o que isso significa?',
      options: [
        'São escritas de forma parecida',
        'Têm significados semanticamente relacionados',
        'Aparecem na mesma frase sempre',
        'Têm o mesmo número de letras',
      ],
      correct: 1,
      explanation: 'Proximidade no espaço de embeddings indica similaridade semântica (de significado).',
    },
    {
      question: 'A famosa analogia de embeddings "rei - homem + mulher ≈ ?" resulta em:',
      options: [
        'Príncipe',
        'Rainha',
        'Rei',
        'Princesa',
      ],
      correct: 1,
      explanation: 'A matemática vetorial captura a relação de gênero: tirando "homem" e adicionando "mulher" a "rei" resulta em "rainha".',
    },
    {
      question: 'Para que serve o Positional Encoding em transformers?',
      options: [
        'Para fazer o modelo rodar mais rápido',
        'Para indicar a posição de cada token na sequência',
        'Para reduzir o tamanho do vocabulário',
        'Para detectar erros de digitação',
      ],
      correct: 1,
      explanation: 'Positional Encoding adiciona informação de posição, pois o transformer processa todos os tokens em paralelo e, sem ele, não saberia a ordem das palavras.',
    },
    {
      question: 'Quantas dimensões tem um embedding no GPT-3?',
      options: [
        '2',
        '256',
        '12.288',
        '1 milhão',
      ],
      correct: 2,
      explanation: 'O GPT-3 usa embeddings de 12.288 dimensões. Modelos menores usam 768 (BERT) ou 256-1024.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */

  function initInteractions() {
    // 2D Space canvas
    initCanvas();

    // Toggle groups
    document.getElementById('toggle-groups')?.addEventListener('click', (e) => {
      showGroups = !showGroups;
      e.target.classList.toggle('active', showGroups);
      drawCanvas();
    });

    // Similarity
    document.getElementById('sim-search-btn')?.addEventListener('click', runSimilarity);
    document.getElementById('sim-word-select')?.addEventListener('change', (e) => {
      document.getElementById('sim-word-input').value = e.target.value;
    });

    // Analogies presets
    document.querySelectorAll('.analogy-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { a, b, c } = btn.dataset;
        document.getElementById('analogy-a').value = a;
        document.getElementById('analogy-b').value = b;
        document.getElementById('analogy-c').value = c;
        solveAnalogy(a, b, c);
      });
    });
    document.getElementById('analogy-solve-btn')?.addEventListener('click', () => {
      solveAnalogy(
        document.getElementById('analogy-a').value,
        document.getElementById('analogy-b').value,
        document.getElementById('analogy-c').value
      );
    });

    // Positional encoding
    document.getElementById('pe-btn')?.addEventListener('click', renderPE);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Canvas =================== */

  function initCanvas() {
    canvas = document.getElementById('emb-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();

    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', () => {
      if (!canvas) return;
      resizeCanvas();
    });
  }

  function resizeCanvas() {
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const w = wrap.offsetWidth;
    if (w < 10) return; // tab is hidden, skip
    canvas.width = w;
    canvas.height = 500;
    canvasScale = canvas.width / 800;
    drawCanvas();
  }

  function drawCanvas() {
    if (!ctx || !canvas || canvasScale <= 0) return;
    const w = canvas.width;
    const h = canvas.height;
    if (w < 10 || h < 10) return;
    const pad = 50;
    const step = 40 * canvasScale;
    if (step < 1) return; // safety: avoid infinite loops

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(30, 30, 46, 0.5)';
    ctx.lineWidth = 0.5;
    for (let x = pad; x < w - pad; x += step) {
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, h - pad); ctx.stroke();
    }
    for (let y = pad; y < h - pad; y += step) {
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    }

    // Draw connections for selected word
    if (selectedWord) {
      const selData = EmbeddingsEngine.getWordData(selectedWord);
      if (selData) {
        const similar = EmbeddingsEngine.findSimilar(selectedWord, 5);
        similar.forEach((s) => {
          const targetData = EmbeddingsEngine.getWordData(s.word);
          if (!targetData) return;
          const x1 = pad + selData.pos.x * (w - 2 * pad);
          const y1 = pad + selData.pos.y * (h - 2 * pad);
          const x2 = pad + targetData.pos.x * (w - 2 * pad);
          const y2 = pad + targetData.pos.y * (h - 2 * pad);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(99, 102, 241, ${s.similarity * 0.5})`;
          ctx.lineWidth = s.similarity * 3;
          ctx.stroke();
        });
      }
    }

    // Draw words
    const words = EmbeddingsEngine.getAllWords();
    words.forEach((word) => {
      const data = EmbeddingsEngine.getWordData(word);
      if (!data) return;

      const x = pad + data.pos.x * (w - 2 * pad);
      const y = pad + data.pos.y * (h - 2 * pad);
      const color = showGroups ? EmbeddingsEngine.GROUP_COLORS[data.group] : '#6366f1';
      const isHovered = hoveredWord === word;
      const isSelected = selectedWord === word;
      const r = isHovered || isSelected ? 7 : 4;

      // Glow
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = `${color}33`;
        ctx.fill();
      }

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      if (isHovered || isSelected) {
        ctx.font = `bold ${13 * canvasScale}px Inter, sans-serif`;
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(word, x, y - r - 8);
      } else {
        ctx.font = `${10 * canvasScale}px Inter, sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(word, x, y - r - 5);
      }
    });
  }

  function getWordAtPos(mx, my) {
    const w = canvas.width;
    const h = canvas.height;
    const pad = 50;
    const words = EmbeddingsEngine.getAllWords();

    for (const word of words) {
      const data = EmbeddingsEngine.getWordData(word);
      if (!data) continue;
      const x = pad + data.pos.x * (w - 2 * pad);
      const y = pad + data.pos.y * (h - 2 * pad);
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < 15) return word;
    }
    return null;
  }

  function onCanvasMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const word = getWordAtPos(mx, my);

    if (word !== hoveredWord) {
      hoveredWord = word;
      canvas.style.cursor = word ? 'pointer' : 'default';
      drawCanvas();
    }
  }

  function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const word = getWordAtPos(mx, my);

    selectedWord = word === selectedWord ? null : word;
    drawCanvas();

    // Show info panel
    const info = document.getElementById('emb-info');
    const content = document.getElementById('emb-info-content');
    if (!info || !content) return;

    if (!selectedWord) {
      info.classList.add('hidden');
      return;
    }

    info.classList.remove('hidden');
    const data = EmbeddingsEngine.getWordData(selectedWord);
    const similar = EmbeddingsEngine.findSimilar(selectedWord, 5);

    content.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <h3 style="margin:0">"${selectedWord}"</h3>
        <span class="badge" style="background: ${EmbeddingsEngine.GROUP_COLORS[data.group]}22; 
          color: ${EmbeddingsEngine.GROUP_COLORS[data.group]};">
          ${EmbeddingsEngine.GROUP_LABELS[data.group]}
        </span>
      </div>
      <p class="text-sm font-mono text-muted mb-4">vec = [${data.vec.map(v => v.toFixed(2)).join(', ')}]</p>
      <h4>Palavras mais similares:</h4>
      <div class="flex flex-col gap-2 mt-2">
        ${similar.map((s) => `
          <div class="flex items-center gap-3">
            <span class="font-bold" style="width:80px">${s.word}</span>
            <div class="progress-bar" style="flex:1;height:8px;">
              <div class="progress-fill" style="width: ${Math.round(s.similarity * 100)}%; 
                background: ${EmbeddingsEngine.GROUP_COLORS[s.group]};"></div>
            </div>
            <span class="text-sm font-mono" style="width:50px">${(s.similarity * 100).toFixed(0)}%</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* =================== Similarity Search =================== */

  function runSimilarity() {
    const word = document.getElementById('sim-word-input')?.value?.trim() ||
                 document.getElementById('sim-word-select')?.value;
    if (!word) return;

    const results = EmbeddingsEngine.findSimilar(word, 8);
    const container = document.getElementById('sim-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `<div class="card-flat"><p class="text-muted">Palavra "${word}" não encontrada no vocabulário.</p>
        <p class="text-sm text-muted">Palavras disponíveis: ${EmbeddingsEngine.getAllWords().slice(0, 20).join(', ')}...</p></div>`;
      return;
    }

    const data = EmbeddingsEngine.getWordData(word);

    container.innerHTML = `
      <div class="card-flat mb-4">
        <div class="flex items-center gap-4 mb-4">
          <h3 style="margin:0">Resultados para "${word}"</h3>
          <span class="badge" style="background: ${EmbeddingsEngine.GROUP_COLORS[data.group]}22; 
            color: ${EmbeddingsEngine.GROUP_COLORS[data.group]};">
            ${EmbeddingsEngine.GROUP_LABELS[data.group]}
          </span>
        </div>
        <p class="text-sm font-mono text-muted">vec = [${data.vec.map(v => v.toFixed(2)).join(', ')}]</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        ${results.map((r, i) => {
          const rData = EmbeddingsEngine.getWordData(r.word);
          const pct = Math.round(r.similarity * 100);
          const barColor = EmbeddingsEngine.GROUP_COLORS[r.group];
          return `
          <div class="card-flat">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">#${i + 1} ${r.word}</span>
              <span class="badge" style="background:${barColor}22;color:${barColor};">${pct}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <p class="text-xs font-mono text-muted mt-2">[${rData.vec.map(v => v.toFixed(2)).join(', ')}]</p>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  /* =================== Analogies =================== */

  function solveAnalogy(a, b, c) {
    if (!a || !b || !c) return;

    const result = EmbeddingsEngine.analogy(a, b, c);
    const resultEl = document.getElementById('analogy-result');
    const details = document.getElementById('analogy-details');

    if (!result) {
      if (resultEl) resultEl.textContent = '❓ não encontrado';
      return;
    }

    if (resultEl) resultEl.textContent = result.word;

    if (details) {
      const aData = EmbeddingsEngine.getWordData(a);
      const bData = EmbeddingsEngine.getWordData(b);
      const cData = EmbeddingsEngine.getWordData(c);
      const rData = EmbeddingsEngine.getWordData(result.word);

      details.innerHTML = `
        <div class="card-flat">
          <h4>Como funciona:</h4>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p class="text-sm"><strong>vec("${b}") - vec("${a}") + vec("${c}")</strong></p>
              <p class="font-mono text-xs text-muted">
                [${bData.vec.map(v => v.toFixed(2)).join(', ')}]<br>
                - [${aData.vec.map(v => v.toFixed(2)).join(', ')}]<br>
                + [${cData.vec.map(v => v.toFixed(2)).join(', ')}]
              </p>
              <p class="font-mono text-xs text-primary mt-2">
                = [${bData.vec.map((v, i) => (v - aData.vec[i] + cData.vec[i]).toFixed(2)).join(', ')}]
              </p>
            </div>
            <div>
              <p class="text-sm">Palavra mais próxima do vetor resultante:</p>
              <p class="text-lg font-bold text-accent">"${result.word}"</p>
              <p class="text-sm text-muted">Similaridade: ${(result.similarity * 100).toFixed(1)}%</p>
              <p class="font-mono text-xs text-muted mt-2">
                vec = [${rData.vec.map(v => v.toFixed(2)).join(', ')}]
              </p>
            </div>
          </div>
        </div>
      `;
    }
  }

  /* =================== Positional Encoding =================== */

  function renderPE() {
    const input = document.getElementById('pe-input');
    const text = input?.value || 'The cat sat on the mat';
    const words = text.split(/\s+/);
    const container = document.getElementById('pe-visualization');
    if (!container) return;

    const dModel = 16;
    const encodings = words.map((_, i) => EmbeddingsEngine.positionalEncoding(i, dModel));

    // Heatmap
    const cellW = Math.min(40, (700 / dModel));
    const cellH = 32;

    let html = `
      <div class="card-flat">
        <h4 class="mb-4">Heatmap — Positional Encoding</h4>
        <p class="text-sm text-muted mb-4">Cada linha é uma posição (palavra). Cada coluna é uma dimensão do encoding. Cores: 
          <span style="color:#6366f1">■ positivo</span> / <span style="color:#ef4444">■ negativo</span></p>
        <div class="pe-heatmap" style="overflow-x:auto;">
          <table style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:4px 8px;font-size:11px;color:var(--text-muted);text-align:left;">Pos</th>
                <th style="padding:4px 8px;font-size:11px;color:var(--text-muted);text-align:left;">Palavra</th>
                ${Array.from({ length: dModel }, (_, d) =>
                  `<th style="padding:4px;font-size:10px;color:var(--text-muted);text-align:center;width:${cellW}px;">d${d}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    encodings.forEach((enc, pos) => {
      html += `<tr>
        <td style="padding:4px 8px;font-size:12px;font-weight:bold;color:var(--primary);">${pos}</td>
        <td style="padding:4px 8px;font-size:12px;color:var(--text);">${words[pos]}</td>
        ${enc.map((val) => {
          const norm = (val + 1) / 2; // 0..1
          const r = Math.round(val < 0 ? 239 * Math.abs(val) : 99 * val);
          const g = Math.round(val < 0 ? 68 * Math.abs(val) : 102 * val);
          const b = Math.round(val < 0 ? 68 * Math.abs(val) : 241 * val);
          const alpha = Math.abs(val) * 0.7 + 0.1;
          const bg = val >= 0
            ? `rgba(99, 102, 241, ${alpha})`
            : `rgba(239, 68, 68, ${alpha})`;
          return `<td style="padding:2px;text-align:center;background:${bg};
            font-size:10px;font-family:var(--font-mono);color:rgba(226,232,240,0.8);
            width:${cellW}px;height:${cellH}px;">${val.toFixed(2)}</td>`;
        }).join('')}
      </tr>`;
    });

    html += `</tbody></table></div>
      <p class="text-xs text-muted mt-4">
        PE(pos, 2i) = sin(pos / 10000^(2i/d)) &nbsp;|&nbsp; PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
      </p>
    </div>`;

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

    container.querySelectorAll('.quiz-option').forEach((btn) => {
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
    const score = quizState.answers.filter((a) => a.isCorrect).length;
    const total = QUIZ_QUESTIONS.length;
    const elapsed = Math.round((Date.now() - quizState.startTime) / 1000);
    const result = Progress.completeQuiz('embeddings', score, total);

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

    if (elapsed < 60 && score >= 4) Achievements.unlock('speedrunner');
    Achievements.checkAll();
  }

  return { render, initInteractions, resizeCanvas };
})();
