/* ============================================
   AIFORALL V2 — Vision Demo
   Convolution interactive, filters, CNN pipeline,
   architecture timeline, quiz
   ============================================ */

const VisionDemo = (() => {

  /* =================== Render =================== */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.vision || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">👁️</span>
              <div>
                <h1>Visão Computacional</h1>
                <p>Como computadores enxergam — convoluções, filtros e detecção</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="conv">🔲 Convolução</button>
              <button class="tab" data-tab="filters">🎨 Filtros</button>
              <button class="tab" data-tab="pipeline">🏗️ CNN Pipeline</button>
              <button class="tab" data-tab="archs">📜 Arquiteturas</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-conv" class="tab-content hidden">${renderConvTab()}</div>
            <div id="tab-filters" class="tab-content hidden">${renderFiltersTab()}</div>
            <div id="tab-pipeline" class="tab-content hidden">${renderPipelineTab()}</div>
            <div id="tab-archs" class="tab-content hidden">${renderArchsTab()}</div>
            <div id="tab-quiz" class="tab-content hidden">${renderQuizTab(mState)}</div>
          </div>
        </section>
      </div>
    `;
  }

  /* =================== Tab: Learn =================== */
  function renderLearnTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>👁️ Como Computadores "Veem"?</h3>
          <p>Para um computador, uma imagem é apenas uma <strong>grade de números</strong> (pixels).
          Cada pixel tem um valor de 0 (preto) a 255 (branco) em escala de cinza,
          ou 3 canais (R, G, B) para imagens coloridas.</p>
          <div class="vision-pixel-demo mt-4">
            <div class="vision-pixel-grid" id="learn-pixel-grid"></div>
            <p class="text-xs text-muted mt-2 text-center">← Cada célula é um pixel com valor numérico</p>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🔲 O que é Convolução?</h3>
          <p>Convolução é a operação central da visão computacional. Um <strong>filtro (kernel)</strong> 
          desliza sobre a imagem, multiplicando e somando valores para extrair padrões:</p>
          <div class="grid grid-cols-3 gap-4 mt-6 text-center">
            <div class="card-flat">
              <div style="font-size:2rem;">📷</div>
              <h5>Imagem</h5>
              <p class="text-xs text-muted">Grade de pixels</p>
            </div>
            <div class="card-flat">
              <div style="font-size:2rem;">🔲</div>
              <h5>Kernel 3×3</h5>
              <p class="text-xs text-muted">Filtro com pesos</p>
            </div>
            <div class="card-flat">
              <div style="font-size:2rem;">✨</div>
              <h5>Feature Map</h5>
              <p class="text-xs text-muted">Padrões detectados</p>
            </div>
          </div>
          <p class="mt-4 text-sm">Para cada posição, o kernel multiplica cada pixel sobreposto pelo peso correspondente 
          e soma tudo. O resultado mostra onde o padrão (borda, textura, etc.) aparece.</p>
        </div>

        <div class="card-flat mb-8">
          <h3>🧱 Camadas de uma CNN</h3>
          <div class="flex flex-col gap-3 mt-4">
            ${VisionEngine.CNN_LAYERS.map((l, i) => `
              <div class="flex items-center gap-3">
                <span class="badge badge-primary" style="min-width:28px;text-align:center;">${i + 1}</span>
                <span style="font-size:1.3rem;">${l.icon}</span>
                <div>
                  <strong>${l.name}</strong>
                  <span class="text-xs text-muted ml-2">${l.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card-flat">
          <h3>🎯 Aplicações</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            ${[
              ['🚗', 'Carros autônomos', 'Detecção de pedestres, placas, faixas'],
              ['🏥', 'Medicina', 'Diagnóstico por raio-X e ressonância'],
              ['📱', 'Face ID', 'Reconhecimento facial em smartphones'],
              ['🛒', 'Varejo', 'Checkout automático (Amazon Go)'],
              ['🛡️', 'Segurança', 'Vigilância e detecção de anomalias'],
              ['🎮', 'AR/VR', 'Realidade aumentada e tracking'],
            ].map(([icon, title, desc]) => `
              <div class="flex items-center gap-3">
                <span style="font-size:1.5rem;">${icon}</span>
                <div><strong>${title}</strong><br><span class="text-xs text-muted">${desc}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Tab: Convolution =================== */
  function renderConvTab() {
    return `
      <div class="conv-section">
        <div class="card-flat mb-4">
          <h3>🔲 Convolução Passo a Passo</h3>
          <p class="text-sm text-muted">Veja exatamente como o kernel desliza sobre a imagem e calcula cada pixel de saída.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <div>
              <label class="text-sm font-bold">Imagem:</label>
              <select id="conv-image" class="input" style="width:140px;">
                ${Object.entries(VisionEngine.SAMPLE_IMAGES).map(([k, v]) =>
                  `<option value="${k}">${v.label}</option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label class="text-sm font-bold">Filtro:</label>
              <select id="conv-filter" class="input" style="width:170px;">
                ${Object.entries(VisionEngine.FILTERS).map(([k, v]) =>
                  `<option value="${k}">${v.label}</option>`
                ).join('')}
              </select>
            </div>
            <button class="btn btn-primary" id="conv-run-btn">Calcular</button>
          </div>
        </div>

        <div id="conv-result" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tab: Filters =================== */
  function renderFiltersTab() {
    return `
      <div class="filters-section">
        <div class="card-flat mb-4">
          <h3>🎨 Galeria de Filtros</h3>
          <p class="text-sm text-muted">Aplique diferentes filtros à mesma imagem e compare os resultados.</p>
          <div class="flex gap-4 items-center mt-4">
            <label class="text-sm font-bold">Imagem:</label>
            <select id="filters-image" class="input" style="width:150px;">
              ${Object.entries(VisionEngine.SAMPLE_IMAGES).map(([k, v]) =>
                `<option value="${k}">${v.label}</option>`
              ).join('')}
            </select>
            <button class="btn btn-primary" id="filters-run-btn">Aplicar todos</button>
          </div>
        </div>
        <div id="filters-gallery" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tab: Pipeline =================== */
  function renderPipelineTab() {
    return `
      <div class="pipeline-section">
        <div class="card-flat mb-4">
          <h3>🏗️ CNN Pipeline</h3>
          <p class="text-sm text-muted">Veja uma imagem passar por cada etapa de uma CNN simples.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <div>
              <label class="text-sm font-bold">Imagem:</label>
              <select id="pipe-image" class="input" style="width:140px;">
                ${Object.entries(VisionEngine.SAMPLE_IMAGES).map(([k, v]) =>
                  `<option value="${k}">${v.label}</option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label class="text-sm font-bold">Filtro Conv:</label>
              <select id="pipe-filter" class="input" style="width:170px;">
                ${Object.entries(VisionEngine.FILTERS).map(([k, v]) =>
                  `<option value="${k}">${v.label}</option>`
                ).join('')}
              </select>
            </div>
            <button class="btn btn-primary" id="pipe-run-btn">Rodar Pipeline</button>
          </div>
        </div>
        <div id="pipe-result" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tab: Architectures =================== */
  function renderArchsTab() {
    const archs = VisionEngine.ARCHITECTURES;
    return `
      <div class="archs-section">
        <div class="card-flat mb-6">
          <h3>📜 Evolução das Arquiteturas CNN</h3>
          <p class="text-sm text-muted">De LeNet a Vision Transformers — como a visão computacional evoluiu em 25 anos.</p>
        </div>

        <div class="vision-timeline">
          ${Object.entries(archs).map(([key, a]) => `
            <div class="vision-timeline-item" style="border-left-color: ${a.color};">
              <div class="flex items-center gap-3">
                <span class="badge" style="background:${a.color}22;color:${a.color};font-weight:bold;">${a.params}</span>
                <h4 style="margin:0;color:${a.color};">${a.name}</h4>
              </div>
              <p class="text-sm mt-2">${a.innovation}</p>
              <div class="flex gap-1 mt-3 flex-wrap">
                ${a.layers.map(l => `<span class="vision-layer-chip" style="border-color:${a.color}44;">${l}</span>`).join('')}
              </div>
              <p class="text-xs text-muted mt-2">Profundidade: ${a.depth} camadas</p>
            </div>
          `).join('')}
        </div>

        <div class="card-flat mt-6">
          <h4>📊 Comparação de Parâmetros</h4>
          <div class="flex flex-col gap-3 mt-4">
            ${Object.entries(archs).map(([k, a]) => {
              const maxP = 138; // VGG
              const numP = parseFloat(a.params);
              const unit = a.params.includes('K') ? 0.001 : 1;
              const pct = Math.max((numP * unit / maxP) * 100, 2);
              return `
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold" style="width:120px;color:${a.color};">${a.name.split(' ')[0]}</span>
                  <div class="progress-bar" style="flex:1;height:12px;">
                    <div class="progress-fill" style="width:${pct}%;background:${a.color};"></div>
                  </div>
                  <span class="text-xs font-mono" style="width:50px;">${a.params}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Tab: Quiz =================== */
  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — Visão Computacional</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre visão computacional e CNNs!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>
        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  /* =================== Quiz data =================== */
  const QUIZ_QUESTIONS = [
    {
      question: 'O que é a operação de convolução em visão computacional?',
      options: [
        'Uma forma de comprimir imagens',
        'Deslizar um filtro (kernel) sobre a imagem, multiplicando e somando valores',
        'Converter imagens de RGB para preto e branco',
        'Recortar partes da imagem',
      ],
      correct: 1,
      explanation: 'A convolução desliza um kernel (filtro) sobre a imagem, fazendo multiplicação elemento a elemento e somando os resultados. Isso detecta padrões como bordas, texturas e formas.',
    },
    {
      question: 'Qual a função do Max Pooling?',
      options: [
        'Aumentar o tamanho da imagem',
        'Adicionar mais cores à imagem',
        'Reduzir a dimensão espacial mantendo as features mais importantes',
        'Treinar os pesos do filtro',
      ],
      correct: 2,
      explanation: 'Max Pooling reduz a dimensão (ex: 4×4 → 2×2) pegando o valor máximo de cada janela. Isso reduz computação e torna features mais robustas a pequenas translações.',
    },
    {
      question: 'O que a função ReLU faz após a convolução?',
      options: [
        'Inverte os pixels da imagem',
        'Substitui valores negativos por zero',
        'Normaliza todos os valores para 0-1',
        'Aplica um blur na imagem',
      ],
      correct: 1,
      explanation: 'ReLU (Rectified Linear Unit) substitui valores negativos por 0, mantendo os positivos. Isso adiciona não-linearidade, permitindo que a rede aprenda padrões complexos.',
    },
    {
      question: 'Qual inovação principal do ResNet (2015)?',
      options: [
        'Usar filtros maiores (11×11)',
        'Usar apenas 5 camadas',
        'Skip connections que permitem redes muito profundas',
        'Remover as camadas de pooling',
      ],
      correct: 2,
      explanation: 'ResNet introduziu skip connections (atalhos). A entrada de uma camada é somada à saída algumas camadas depois. Isso resolve o vanishing gradient e permite redes com 50, 100+ camadas.',
    },
    {
      question: 'Como o Vision Transformer (ViT) processa imagens?',
      options: [
        'Usando convoluções 3×3 como CNNs tradicionais',
        'Dividindo a imagem em patches e processando com self-attention',
        'Usando apenas camadas dense (fully connected)',
        'Convertendo a imagem em texto antes de processar',
      ],
      correct: 1,
      explanation: 'O ViT divide a imagem em patches (ex: 16×16), lineariza cada patch, adiciona positional embeddings e processa com o mecanismo de self-attention dos Transformers.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */
  function initInteractions() {
    // Learn tab - pixel grid demo
    renderPixelGridDemo();

    // Convolution tab
    document.getElementById('conv-run-btn')?.addEventListener('click', runConvolution);

    // Filters tab
    document.getElementById('filters-run-btn')?.addEventListener('click', runFiltersGallery);

    // Pipeline tab
    document.getElementById('pipe-run-btn')?.addEventListener('click', runPipeline);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Pixel Grid Demo =================== */
  function renderPixelGridDemo() {
    const grid = document.getElementById('learn-pixel-grid');
    if (!grid) return;
    const img = VisionEngine.SAMPLE_IMAGES.cross;
    grid.innerHTML = renderPixelGrid(img.data, img.size, 36);
  }

  function renderPixelGrid(data, size, cellSize = 32, highlight = null) {
    const cells = data.map((v, i) => {
      const x = i % size;
      const y = Math.floor(i / size);
      const norm = Math.round(Math.min(Math.max(v, 0), 255));
      const light = norm > 128;
      const isHighlighted = highlight && highlight.some(h => h[0] === y && h[1] === x);
      const extraClass = isHighlighted ? ' vision-cell-highlight' : '';
      return `<div class="vision-cell${extraClass}" style="width:${cellSize}px;height:${cellSize}px;background:rgb(${norm},${norm},${norm});color:${light ? '#000' : '#fff'};font-size:${cellSize < 30 ? 8 : 10}px;">${Math.round(v)}</div>`;
    });
    return `<div class="vision-grid" style="grid-template-columns:repeat(${size},${cellSize}px);">${cells.join('')}</div>`;
  }

  /* =================== Convolution =================== */
  function runConvolution() {
    const imgKey = document.getElementById('conv-image')?.value || 'cross';
    const filterKey = document.getElementById('conv-filter')?.value || 'edgeH';
    const img = VisionEngine.SAMPLE_IMAGES[imgKey];
    const filter = VisionEngine.FILTERS[filterKey];
    const result = VisionEngine.convolve2D(img.data, img.size, filter.kernel);
    const normalized = VisionEngine.normalize(result.data);
    const stepData = VisionEngine.convolveStepByStep(img.data, img.size, filter.kernel);

    const container = document.getElementById('conv-result');
    if (!container) return;

    // Show first 3 steps detail
    const stepsHtml = stepData.steps.slice(0, 3).map((s, idx) => {
      const highlight = s.products.map(p => [s.y + p.ky, s.x + p.kx]);
      return `
        <div class="card-flat mb-4">
          <h5>Passo ${idx + 1}: Posição (${s.y}, ${s.x})</h5>
          <div class="flex gap-6 items-start flex-wrap mt-3">
            <div>
              <span class="text-xs font-bold">Região da imagem:</span>
              <div class="mt-1">${renderKernelOverlap(img.data, img.size, s, filter.kernel)}</div>
            </div>
            <div>
              <span class="text-xs font-bold">×</span>
            </div>
            <div>
              <span class="text-xs font-bold">Kernel:</span>
              <div class="mt-1">${renderKernelGrid(filter.kernel)}</div>
            </div>
            <div>
              <span class="text-xs font-bold">=</span>
            </div>
            <div>
              <span class="text-xs font-bold">Cálculo:</span>
              <div class="mt-1 text-xs font-mono">
                ${s.products.map(p => `${p.pixel}×${p.weight.toFixed(2)}`).join(' + ')}
                <br>= <strong style="color:${filter.color};">${s.sum.toFixed(1)}</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="card-flat text-center">
          <h5>📷 Imagem Original (${img.size}×${img.size})</h5>
          <div class="mt-3 flex justify-center">${renderPixelGrid(img.data, img.size, 36)}</div>
        </div>
        <div class="card-flat text-center">
          <h5 style="color:${filter.color};">✨ Resultado — ${filter.label} (${result.size}×${result.size})</h5>
          <div class="mt-3 flex justify-center">${renderPixelGrid(normalized, result.size, 36)}</div>
          <p class="text-xs text-muted mt-2">${filter.desc}</p>
        </div>
      </div>

      <div class="card-flat mb-4">
        <h5>🔲 Kernel ${filter.label} (3×3)</h5>
        <div class="flex items-center gap-4 mt-3">
          <div>${renderKernelGrid(filter.kernel, filter.color)}</div>
          <p class="text-sm">${filter.desc}</p>
        </div>
      </div>

      <h4 class="mb-4">🔍 Detalhes dos 3 primeiros passos:</h4>
      ${stepsHtml}
      <p class="text-xs text-muted">Total: ${stepData.steps.length} posições calculadas</p>
    `;
  }

  function renderKernelGrid(kernel, color = '#6366f1') {
    const cells = kernel.flat().map(v => {
      const bg = v > 0 ? `${color}${Math.round(Math.abs(v) * 30 + 20).toString(16).padStart(2, '0')}` :
                 v < 0 ? `#ef4444${Math.round(Math.abs(v) * 30 + 20).toString(16).padStart(2, '0')}` : 'var(--surface-2)';
      return `<div class="vision-kernel-cell" style="background:${bg};">${v % 1 === 0 ? v : v.toFixed(2)}</div>`;
    });
    return `<div class="vision-grid" style="grid-template-columns:repeat(${kernel.length},40px);">${cells.join('')}</div>`;
  }

  function renderKernelOverlap(imgData, imgSize, step, kernel) {
    const kSize = kernel.length;
    const cells = [];
    for (let ky = 0; ky < kSize; ky++) {
      for (let kx = 0; kx < kSize; kx++) {
        const px = imgData[(step.y + ky) * imgSize + (step.x + kx)];
        const norm = Math.round(Math.min(Math.max(px, 0), 255));
        const light = norm > 128;
        cells.push(`<div class="vision-cell" style="width:40px;height:40px;background:rgb(${norm},${norm},${norm});color:${light ? '#000' : '#fff'};font-size:10px;">${Math.round(px)}</div>`);
      }
    }
    return `<div class="vision-grid" style="grid-template-columns:repeat(${kSize},40px);">${cells.join('')}</div>`;
  }

  /* =================== Filters Gallery =================== */
  function runFiltersGallery() {
    const imgKey = document.getElementById('filters-image')?.value || 'cross';
    const img = VisionEngine.SAMPLE_IMAGES[imgKey];
    const container = document.getElementById('filters-gallery');
    if (!container) return;

    const cards = Object.entries(VisionEngine.FILTERS).map(([key, filter]) => {
      const result = VisionEngine.convolve2D(img.data, img.size, filter.kernel);
      const normalized = VisionEngine.normalize(result.data);
      return `
        <div class="card-flat text-center">
          <h5 style="color:${filter.color};">${filter.label}</h5>
          <div class="mt-2 flex justify-center">${renderPixelGrid(normalized, result.size, 28)}</div>
          <p class="text-xs text-muted mt-2">${filter.desc}</p>
          <div class="mt-2 flex justify-center">${renderKernelGrid(filter.kernel, filter.color)}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="card-flat text-center mb-6">
        <h5>📷 Imagem Original</h5>
        <div class="mt-2 flex justify-center">${renderPixelGrid(img.data, img.size, 28)}</div>
      </div>
      <div class="grid grid-cols-2 gap-4 md-grid-cols-3 lg-grid-cols-4">${cards}</div>
    `;
  }

  /* =================== Pipeline =================== */
  function runPipeline() {
    const imgKey = document.getElementById('pipe-image')?.value || 'cross';
    const filterKey = document.getElementById('pipe-filter')?.value || 'edgeH';
    const img = VisionEngine.SAMPLE_IMAGES[imgKey];
    const stages = VisionEngine.runPipeline(img.data, img.size, filterKey);
    const container = document.getElementById('pipe-result');
    if (!container) return;

    const filter = VisionEngine.FILTERS[filterKey];
    const layerInfo = VisionEngine.CNN_LAYERS;

    let html = `<div class="vision-pipeline">`;

    stages.forEach((stage, i) => {
      const normalized = VisionEngine.normalize(stage.data);
      const cellSize = Math.max(20, Math.min(36, Math.round(180 / stage.size)));
      const info = layerInfo[i] || {};

      html += `
        <div class="vision-pipeline-stage card-flat">
          <div class="flex items-center gap-2 mb-3">
            <span style="font-size:1.3rem;">${info.icon || '🔹'}</span>
            <div>
              <h5 style="margin:0;">${stage.name}</h5>
              <span class="text-xs text-muted">${stage.size}×${stage.size} = ${stage.data.length} valores</span>
            </div>
          </div>
          <div class="flex justify-center">${renderPixelGrid(normalized, stage.size, cellSize)}</div>
          <p class="text-xs text-muted mt-2 text-center">${info.desc || ''}</p>
        </div>
      `;

      if (i < stages.length - 1) {
        html += `<div class="vision-pipeline-arrow">→</div>`;
      }
    });

    html += `</div>`;

    // Also show kernel used
    html += `
      <div class="card-flat mt-6">
        <h5>🔲 Kernel usado: ${filter.label}</h5>
        <div class="flex items-center gap-4 mt-3">
          <div>${renderKernelGrid(filter.kernel, filter.color)}</div>
          <div>
            <p class="text-sm">${filter.desc}</p>
            <p class="text-xs text-muted mt-2">Etapas: Input → Conv → ReLU → MaxPool</p>
          </div>
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
    const result = Progress.completeQuiz('vision', score, total);

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
