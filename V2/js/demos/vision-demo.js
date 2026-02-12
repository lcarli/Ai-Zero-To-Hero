/* ============================================
   AIFORALL V2 — Vision Demo
   Convolution interactive, filters, CNN pipeline,
   architecture timeline, quiz
   ============================================ */

const VisionDemo = (() => {

  let uploadedImageFile = null;

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
              <button class="tab" data-tab="realimg">📷 Imagem Real</button>
              <button class="tab" data-tab="conv">🔲 Convolução</button>
              <button class="tab" data-tab="filters">🎨 Filtros</button>
              <button class="tab" data-tab="pipeline">🏗️ CNN Pipeline</button>
              <button class="tab" data-tab="archs">📜 Arquiteturas</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-realimg" class="tab-content hidden">${renderRealImageTab()}</div>
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

  /* =================== Tab: Real Image =================== */
  function renderRealImageTab() {
    return `
      <div class="real-image-section">
        <div class="card-flat mb-4">
          <h3>📷 Processamento de Imagem Real</h3>
          <p class="text-sm text-muted">Carregue uma imagem real e veja todo o processamento que o computador faz: pixels, grayscale, matriz numérica, convoluções — tudo de verdade!</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <div>
              <label class="text-sm font-bold">Imagem:</label>
              <select id="realimg-source" class="input" style="width:160px;">
                <option value="star">⭐ Estrela</option>
                <option value="smiley">🙂 Smiley</option>
                <option value="arrow">➡️ Seta</option>
                <option value="letterA">🔤 Letra A</option>
                <option value="heart">❤️ Coração</option>
                <option value="upload">📁 Upload...</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-bold">Tamanho:</label>
              <select id="realimg-size" class="input" style="width:100px;">
                <option value="8">8×8</option>
                <option value="16" selected>16×16</option>
                <option value="32">32×32</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-bold">Filtro:</label>
              <select id="realimg-filter" class="input" style="width:160px;">
                ${Object.entries(VisionEngine.FILTERS).map(([k, v]) =>
                  `<option value="${k}">${v.label}</option>`
                ).join('')}
              </select>
            </div>
            <button class="btn btn-accent" id="realimg-run-btn">🔬 Processar</button>
          </div>
          <input type="file" id="realimg-upload" accept="image/*" class="hidden">
        </div>
        <div id="realimg-result" class="mt-4"></div>
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

    // Real image tab
    document.getElementById('realimg-run-btn')?.addEventListener('click', processRealImage);
    document.getElementById('realimg-source')?.addEventListener('change', (e) => {
      if (e.target.value === 'upload') {
        document.getElementById('realimg-upload')?.click();
      }
    });
    document.getElementById('realimg-upload')?.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        uploadedImageFile = e.target.files[0];
        const sel = document.getElementById('realimg-source');
        // Add custom option showing filename
        let opt = sel.querySelector('option[value="custom"]');
        if (!opt) { opt = document.createElement('option'); opt.value = 'custom'; sel.appendChild(opt); }
        opt.textContent = `📄 ${e.target.files[0].name.slice(0, 18)}`;
        sel.value = 'custom';
        Toast.show('Imagem carregada! Clique em 🔬 Processar.', 'success');
      }
    });

    // Convolution tab
    document.getElementById('conv-run-btn')?.addEventListener('click', runConvolution);

    // Filters tab
    document.getElementById('filters-run-btn')?.addEventListener('click', runFiltersGallery);

    // Pipeline tab
    document.getElementById('pipe-run-btn')?.addEventListener('click', runPipeline);

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* ---- Draw predefined images on canvas ---- */
  function drawPredefinedImage(ctx, name, size) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    if (name === 'star') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      const cx = size / 2, cy = size / 2, r = size * 0.4, ri = size * 0.18;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const angleInner = ((i * 72) + 36 - 90) * Math.PI / 180;
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        ctx.lineTo(cx + ri * Math.cos(angleInner), cy + ri * Math.sin(angleInner));
      }
      ctx.closePath();
      ctx.fill();
    } else if (name === 'smiley') {
      const cx = size / 2, cy = size / 2, r = size * 0.38;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, size / 16);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.2, r * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.2, r * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.05, r * 0.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    } else if (name === 'arrow') {
      ctx.fillStyle = '#fff';
      const m = size * 0.15, w = size * 0.22;
      ctx.fillRect(m, size / 2 - w / 2, size * 0.5, w);
      ctx.beginPath();
      ctx.moveTo(size * 0.55, m);
      ctx.lineTo(size - m, size / 2);
      ctx.lineTo(size * 0.55, size - m);
      ctx.closePath();
      ctx.fill();
    } else if (name === 'letterA') {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(size * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', size / 2, size / 2 + size * 0.05);
    } else if (name === 'heart') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      const cx = size / 2, top = size * 0.3, s = size * 0.25;
      ctx.moveTo(cx, size * 0.8);
      ctx.bezierCurveTo(cx - size * 0.5, size * 0.45, cx - size * 0.45, top - s * 0.3, cx, top + s * 0.5);
      ctx.bezierCurveTo(cx + size * 0.45, top - s * 0.3, cx + size * 0.5, size * 0.45, cx, size * 0.8);
      ctx.fill();
    }
  }

  /** Load image as pixel data at target size */
  async function loadImagePixels(source, targetSize) {
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    if (source === 'custom' && uploadedImageFile) {
      // Load uploaded file
      const img = new Image();
      const url = URL.createObjectURL(uploadedImageFile);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      // Draw scaled to fit
      const scale = Math.min(targetSize / img.width, targetSize / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, (targetSize - w) / 2, (targetSize - h) / 2, w, h);
      URL.revokeObjectURL(url);
    } else {
      drawPredefinedImage(ctx, source, targetSize);
    }

    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
    return { imageData, canvas, ctx };
  }

  /* =================== Process Real Image =================== */
  async function processRealImage() {
    const source = document.getElementById('realimg-source')?.value || 'star';
    const targetSize = parseInt(document.getElementById('realimg-size')?.value) || 16;
    const filterKey = document.getElementById('realimg-filter')?.value || 'edgeH';
    const container = document.getElementById('realimg-result');
    const btn = document.getElementById('realimg-run-btn');
    if (!container) return;

    if (source === 'upload') {
      document.getElementById('realimg-upload')?.click();
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Processando...'; }

    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    container.innerHTML = '';

    try {
      const { imageData, canvas } = await loadImagePixels(source, targetSize);
      const pixels = imageData.data; // RGBA flat array

      // ======== STAGE 1: Original Image ========
      const stage1 = document.createElement('div');
      stage1.className = 'card-flat mb-4 real-pipeline-stage';
      stage1.style.animation = 'fadeSlideIn 0.5s ease both';
      stage1.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">🖼️</span>
          <div>
            <h4 style="margin:0;">1. Imagem Original</h4>
            <p class="text-sm text-muted" style="margin:0;">A imagem digital como o computador recebe — ${targetSize}×${targetSize} pixels</p>
          </div>
          <span class="ai-badge" style="margin-left:auto;">Real</span>
        </div>
        <div class="flex gap-6 items-start flex-wrap">
          <div class="text-center">
            <canvas id="realimg-canvas-orig" width="${targetSize}" height="${targetSize}" class="realimg-canvas"></canvas>
            <p class="text-xs text-muted mt-1">${targetSize}×${targetSize} = ${targetSize * targetSize} pixels</p>
          </div>
          <div class="text-center">
            <canvas id="realimg-canvas-zoom" width="${Math.min(targetSize * 12, 256)}" height="${Math.min(targetSize * 12, 256)}" class="realimg-canvas" style="border:1px solid var(--border);"></canvas>
            <p class="text-xs text-muted mt-1">Zoom — cada quadrado = 1 pixel</p>
          </div>
        </div>`;
      container.appendChild(stage1);

      // Draw original
      const origCanvas = document.getElementById('realimg-canvas-orig');
      origCanvas.getContext('2d').putImageData(imageData, 0, 0);
      // Draw zoomed
      const zoomCanvas = document.getElementById('realimg-canvas-zoom');
      const zctx = zoomCanvas.getContext('2d');
      zctx.imageSmoothingEnabled = false;
      zctx.drawImage(canvas, 0, 0, zoomCanvas.width, zoomCanvas.height);
      // Draw grid on zoom
      zctx.strokeStyle = 'rgba(100,100,100,0.3)';
      zctx.lineWidth = 0.5;
      const cellW = zoomCanvas.width / targetSize;
      for (let i = 0; i <= targetSize; i++) {
        zctx.beginPath(); zctx.moveTo(i * cellW, 0); zctx.lineTo(i * cellW, zoomCanvas.height); zctx.stroke();
        zctx.beginPath(); zctx.moveTo(0, i * cellW); zctx.lineTo(zoomCanvas.width, i * cellW); zctx.stroke();
      }

      await delay(400);

      // ======== STAGE 2: RGB Channels ========
      const stage2 = document.createElement('div');
      stage2.className = 'card-flat mb-4 real-pipeline-stage';
      stage2.style.animation = 'fadeSlideIn 0.5s ease 0.1s both';
      stage2.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">🎨</span>
          <div>
            <h4 style="margin:0;">2. Canais RGB</h4>
            <p class="text-sm text-muted" style="margin:0;">Cada pixel tem 3 valores: Vermelho (R), Verde (G) e Azul (B), de 0 a 255</p>
          </div>
        </div>
        <div class="flex gap-4 items-start flex-wrap">
          <div class="text-center">
            <canvas id="realimg-ch-r" width="${targetSize}" height="${targetSize}" class="realimg-canvas-sm"></canvas>
            <p class="text-xs mt-1" style="color:#ef4444;font-weight:bold;">Red</p>
          </div>
          <div class="text-center">
            <canvas id="realimg-ch-g" width="${targetSize}" height="${targetSize}" class="realimg-canvas-sm"></canvas>
            <p class="text-xs mt-1" style="color:#22c55e;font-weight:bold;">Green</p>
          </div>
          <div class="text-center">
            <canvas id="realimg-ch-b" width="${targetSize}" height="${targetSize}" class="realimg-canvas-sm"></canvas>
            <p class="text-xs mt-1" style="color:#3b82f6;font-weight:bold;">Blue</p>
          </div>
        </div>
        <p class="text-xs text-muted mt-3">Exemplo pixel (0,0): R=${pixels[0]}, G=${pixels[1]}, B=${pixels[2]}, A=${pixels[3]}</p>`;
      container.appendChild(stage2);

      // Draw channels
      ['r', 'g', 'b'].forEach((ch, ci) => {
        const chCanvas = document.getElementById(`realimg-ch-${ch}`);
        const chCtx = chCanvas.getContext('2d');
        const chData = chCtx.createImageData(targetSize, targetSize);
        for (let i = 0; i < targetSize * targetSize; i++) {
          const v = pixels[i * 4 + ci];
          chData.data[i * 4 + 0] = ci === 0 ? v : 0;
          chData.data[i * 4 + 1] = ci === 1 ? v : 0;
          chData.data[i * 4 + 2] = ci === 2 ? v : 0;
          chData.data[i * 4 + 3] = 255;
        }
        chCtx.putImageData(chData, 0, 0);
      });

      await delay(400);

      // ======== STAGE 3: Grayscale Conversion ========
      const grayscale = new Array(targetSize * targetSize);
      for (let i = 0; i < grayscale.length; i++) {
        const r = pixels[i * 4], g = pixels[i * 4 + 1], b = pixels[i * 4 + 2];
        grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }

      const stage3 = document.createElement('div');
      stage3.className = 'card-flat mb-4 real-pipeline-stage';
      stage3.style.animation = 'fadeSlideIn 0.5s ease 0.1s both';
      stage3.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">⬛</span>
          <div>
            <h4 style="margin:0;">3. Conversão Grayscale</h4>
            <p class="text-sm text-muted" style="margin:0;">Fórmula: Gray = 0.299×R + 0.587×G + 0.114×B (ponderada pela percepção humana)</p>
          </div>
        </div>
        <div class="flex gap-6 items-start flex-wrap">
          <div class="text-center">
            <canvas id="realimg-gray" width="${targetSize}" height="${targetSize}" class="realimg-canvas-sm"></canvas>
            <p class="text-xs text-muted mt-1">Grayscale</p>
          </div>
          <div class="text-center">
            <canvas id="realimg-gray-zoom" width="${Math.min(targetSize * 10, 220)}" height="${Math.min(targetSize * 10, 220)}" class="realimg-canvas"></canvas>
            <p class="text-xs text-muted mt-1">Zoom com valores</p>
          </div>
        </div>`;
      container.appendChild(stage3);

      // Draw grayscale
      const grayCanvas = document.getElementById('realimg-gray');
      const gctx = grayCanvas.getContext('2d');
      const grayData = gctx.createImageData(targetSize, targetSize);
      for (let i = 0; i < grayscale.length; i++) {
        const v = grayscale[i];
        grayData.data[i * 4] = v;
        grayData.data[i * 4 + 1] = v;
        grayData.data[i * 4 + 2] = v;
        grayData.data[i * 4 + 3] = 255;
      }
      gctx.putImageData(grayData, 0, 0);

      // Draw grayscale zoomed with values
      const gzCanvas = document.getElementById('realimg-gray-zoom');
      const gzCtx = gzCanvas.getContext('2d');
      gzCtx.imageSmoothingEnabled = false;
      const gzCell = gzCanvas.width / targetSize;
      for (let y = 0; y < targetSize; y++) {
        for (let x = 0; x < targetSize; x++) {
          const v = grayscale[y * targetSize + x];
          gzCtx.fillStyle = `rgb(${v},${v},${v})`;
          gzCtx.fillRect(x * gzCell, y * gzCell, gzCell, gzCell);
          if (gzCell >= 12) {
            gzCtx.fillStyle = v > 128 ? '#000' : '#fff';
            gzCtx.font = `${Math.min(gzCell * 0.55, 11)}px monospace`;
            gzCtx.textAlign = 'center'; gzCtx.textBaseline = 'middle';
            gzCtx.fillText(v.toString(), x * gzCell + gzCell / 2, y * gzCell + gzCell / 2);
          }
        }
      }
      // Grid
      gzCtx.strokeStyle = 'rgba(100,100,100,0.25)'; gzCtx.lineWidth = 0.5;
      for (let i = 0; i <= targetSize; i++) {
        gzCtx.beginPath(); gzCtx.moveTo(i * gzCell, 0); gzCtx.lineTo(i * gzCell, gzCanvas.height); gzCtx.stroke();
        gzCtx.beginPath(); gzCtx.moveTo(0, i * gzCell); gzCtx.lineTo(gzCanvas.width, i * gzCell); gzCtx.stroke();
      }

      await delay(400);

      // ======== STAGE 4: Pixel Matrix ========
      const maxShow = Math.min(targetSize, 12);
      const stage4 = document.createElement('div');
      stage4.className = 'card-flat mb-4 real-pipeline-stage';
      stage4.style.animation = 'fadeSlideIn 0.5s ease 0.1s both';
      stage4.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">🔢</span>
          <div>
            <h4 style="margin:0;">4. Matriz Numérica</h4>
            <p class="text-sm text-muted" style="margin:0;">Isso é o que o computador realmente "vê" — uma matriz de números de 0 a 255</p>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="realimg-matrix">
            <tbody>
              ${Array.from({length: maxShow}, (_, y) =>
                `<tr>${Array.from({length: maxShow}, (_, x) => {
                  const v = grayscale[y * targetSize + x];
                  const bg = `rgb(${v},${v},${v})`;
                  const fg = v > 128 ? '#000' : '#fff';
                  return `<td style="background:${bg};color:${fg};">${v}</td>`;
                }).join('')}${targetSize > maxShow ? '<td class="text-muted" style="border:none;">…</td>' : ''}</tr>`
              ).join('')}
              ${targetSize > maxShow ? `<tr>${Array.from({length: maxShow + 1}, () => '<td style="border:none;" class="text-muted">⋮</td>').join('')}</tr>` : ''}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted mt-2">Matriz ${targetSize}×${targetSize} = ${targetSize * targetSize} valores${targetSize > maxShow ? ` (mostrando ${maxShow}×${maxShow})` : ''}</p>`;
      container.appendChild(stage4);

      await delay(400);

      // ======== STAGE 5: Convolution ========
      const filter = VisionEngine.FILTERS[filterKey];
      const convResult = VisionEngine.convolve2D(grayscale, targetSize, filter.kernel);
      const convNorm = VisionEngine.normalize(convResult.data);

      const stage5 = document.createElement('div');
      stage5.className = 'card-flat mb-4 real-pipeline-stage';
      stage5.style.animation = 'fadeSlideIn 0.5s ease 0.1s both';

      // Draw convolution result on canvas
      stage5.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">🔲</span>
          <div>
            <h4 style="margin:0;">5. Convolução — ${filter.label}</h4>
            <p class="text-sm text-muted" style="margin:0;">${filter.desc}. Kernel 3×3 desliza sobre a matriz.</p>
          </div>
        </div>
        <div class="flex gap-6 items-start flex-wrap">
          <div>
            <span class="text-xs font-bold">Kernel:</span>
            <div class="mt-1">${renderKernelGrid(filter.kernel, filter.color)}</div>
          </div>
          <div class="text-center">
            <span class="text-xs font-bold">Antes (Grayscale)</span>
            <canvas id="realimg-pre-conv" width="${Math.min(targetSize * 8, 180)}" height="${Math.min(targetSize * 8, 180)}" class="realimg-canvas mt-1"></canvas>
          </div>
          <div style="display:flex;align-items:center;font-size:1.5rem;color:var(--primary);font-weight:bold;">→</div>
          <div class="text-center">
            <span class="text-xs font-bold" style="color:${filter.color};">Depois (${filter.label})</span>
            <canvas id="realimg-post-conv" width="${Math.min(convResult.size * 8, 180)}" height="${Math.min(convResult.size * 8, 180)}" class="realimg-canvas mt-1"></canvas>
          </div>
        </div>
        <p class="text-xs text-muted mt-3">Output: ${convResult.size}×${convResult.size} = ${convResult.data.length} valores (${targetSize}−3+1 = ${convResult.size} por dimensão)</p>`;
      container.appendChild(stage5);

      // Draw pre/post convolution canvases
      const preC = document.getElementById('realimg-pre-conv');
      const preCCtx = preC.getContext('2d');
      preCCtx.imageSmoothingEnabled = false;
      preCCtx.drawImage(grayCanvas, 0, 0, preC.width, preC.height);

      const postC = document.getElementById('realimg-post-conv');
      const postCtx = postC.getContext('2d');
      const postImgData = postCtx.createImageData(convResult.size, convResult.size);
      for (let i = 0; i < convNorm.length; i++) {
        const v = convNorm[i];
        postImgData.data[i * 4] = v;
        postImgData.data[i * 4 + 1] = v;
        postImgData.data[i * 4 + 2] = v;
        postImgData.data[i * 4 + 3] = 255;
      }
      const tmpC = document.createElement('canvas');
      tmpC.width = convResult.size; tmpC.height = convResult.size;
      tmpC.getContext('2d').putImageData(postImgData, 0, 0);
      postCtx.imageSmoothingEnabled = false;
      postCtx.drawImage(tmpC, 0, 0, postC.width, postC.height);

      await delay(400);

      // ======== STAGE 6: ReLU + MaxPool ========
      const reluData = VisionEngine.relu(convResult.data);
      const poolResult = VisionEngine.maxPool2D(reluData, convResult.size, 2);
      const reluNorm = VisionEngine.normalize(reluData);
      const poolNorm = VisionEngine.normalize(poolResult.data);

      const stage6 = document.createElement('div');
      stage6.className = 'card-flat mb-4 real-pipeline-stage';
      stage6.style.animation = 'fadeSlideIn 0.5s ease 0.1s both';
      stage6.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <span style="font-size:1.8rem;">⚡</span>
          <div>
            <h4 style="margin:0;">6. ReLU + MaxPool</h4>
            <p class="text-sm text-muted" style="margin:0;">ReLU zera negativos, MaxPool reduz dimensão mantendo features mais fortes.</p>
          </div>
        </div>
        <div class="flex gap-4 items-start flex-wrap">
          <div class="text-center">
            <span class="text-xs font-bold">Após ReLU (${convResult.size}×${convResult.size})</span>
            <canvas id="realimg-relu" width="${Math.min(convResult.size * 8, 160)}" height="${Math.min(convResult.size * 8, 160)}" class="realimg-canvas mt-1"></canvas>
            <p class="text-xs text-muted mt-1">max(0, x)</p>
          </div>
          <div style="display:flex;align-items:center;font-size:1.5rem;color:var(--primary);font-weight:bold;">→</div>
          <div class="text-center">
            <span class="text-xs font-bold">Após MaxPool 2×2 (${poolResult.size}×${poolResult.size})</span>
            <canvas id="realimg-pool" width="${Math.min(poolResult.size * 14, 160)}" height="${Math.min(poolResult.size * 14, 160)}" class="realimg-canvas mt-1"></canvas>
            <p class="text-xs text-muted mt-1">${convResult.size}×${convResult.size} → ${poolResult.size}×${poolResult.size}</p>
          </div>
        </div>
        <div class="card-flat mt-4" style="background:var(--surface);">
          <div class="text-xs font-bold mb-2">📊 Resumo do Pipeline:</div>
          <div class="flex gap-4 flex-wrap text-xs">
            <span>🖼️ Input: ${targetSize}×${targetSize}</span>
            <span>→ 🔲 Conv: ${convResult.size}×${convResult.size}</span>
            <span>→ ⚡ ReLU: ${convResult.size}×${convResult.size}</span>
            <span>→ 📉 Pool: ${poolResult.size}×${poolResult.size}</span>
            <span>• Redução: ${targetSize * targetSize} → ${poolResult.data.length} valores (${((1 - poolResult.data.length / (targetSize * targetSize)) * 100).toFixed(0)}% menos)</span>
          </div>
        </div>`;
      container.appendChild(stage6);

      // Draw ReLU canvas
      drawGrayToCanvas('realimg-relu', reluNorm, convResult.size);
      // Draw Pool canvas
      drawGrayToCanvas('realimg-pool', poolNorm, poolResult.size);

    } catch (err) {
      container.innerHTML = `
        <div class="card-flat config-test-error">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${err.message}</p>
        </div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🔬 Processar'; }
    }
  }

  /** Draw normalized grayscale data to a canvas by ID (scaled up) */
  function drawGrayToCanvas(canvasId, normData, dataSize) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const tmpC = document.createElement('canvas');
    tmpC.width = dataSize; tmpC.height = dataSize;
    const tmpCtx = tmpC.getContext('2d');
    const imgData = tmpCtx.createImageData(dataSize, dataSize);
    for (let i = 0; i < normData.length; i++) {
      const v = normData[i];
      imgData.data[i * 4] = v;
      imgData.data[i * 4 + 1] = v;
      imgData.data[i * 4 + 2] = v;
      imgData.data[i * 4 + 3] = 255;
    }
    tmpCtx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmpC, 0, 0, c.width, c.height);
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
