/* ============================================
   AIFORALL V2 — Image Generation Demo
   Learn, Pipeline, Generate (real), Gallery, Quiz
   ============================================ */

const ImageGenDemo = (() => {

  let _gallery = [];
  let _isGenerating = false;
  let _diffusionAnimInterval = null;

  function render() {
    const state = Progress.getState();
    const mState = state.modules['image-gen'] || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">🎨</span>
              <div>
                <h1>Geração de Imagens</h1>
                <p>Como IA cria imagens do zero — da difusão à geração real</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="pipeline">🔬 Pipeline</button>
              <button class="tab" data-tab="generate">🎨 Gerar (IA Real)</button>
              <button class="tab" data-tab="gallery">🖼️ Galeria</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-pipeline" class="tab-content hidden">${renderPipelineTab()}</div>
            <div id="tab-generate" class="tab-content hidden">${renderGenerateTab()}</div>
            <div id="tab-gallery" class="tab-content hidden">${renderGalleryTab()}</div>
            <div id="tab-quiz" class="tab-content hidden">${renderQuizTab(mState)}</div>
          </div>
        </section>
      </div>
    `;
  }

  /* =================== LEARN TAB =================== */
  function renderLearnTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🎨 Como IA gera imagens?</h3>
          <p>Modelos de geração de imagens aprenderam a criar imagens do zero a partir de descrições em texto.
          A técnica dominante hoje é a <strong>difusão</strong> — um processo que começa com ruído puro
          e gradualmente o transforma numa imagem coerente, guiada pelo seu prompt.</p>
          <p class="mt-2 text-sm text-muted">Analogia: Imagine um escultor que começa com um bloco de mármore (ruído)
          e remove material (denoising) até revelar a estátua (imagem final) — seguindo uma descrição verbal (prompt).</p>
        </div>

        <!-- Key Concepts -->
        <h3 class="mb-4">🧠 Conceitos-Chave</h3>
        <div class="imggen-concepts-grid">
          ${ImageGenEngine.CONCEPTS.map(c => `
            <div class="card-flat imggen-concept-card">
              <h4>${c.name}</h4>
              <p class="text-sm">${c.desc}</p>
              <code class="imggen-formula">${c.formula}</code>
              <p class="text-sm text-muted mt-2">💡 ${c.analogy}</p>
            </div>
          `).join('')}
        </div>

        <!-- Architecture Diagram -->
        <div class="card-flat mb-8 mt-8">
          <h3>🏗️ Arquitetura Típica (Stable Diffusion)</h3>
          <div class="imggen-arch-diagram">
            <div class="imggen-arch-block imggen-arch-text">
              <div class="imggen-arch-icon">📝</div>
              <div class="imggen-arch-label">Prompt</div>
              <div class="imggen-arch-sub">Texto</div>
            </div>
            <div class="imggen-arch-arrow">→</div>
            <div class="imggen-arch-block imggen-arch-clip">
              <div class="imggen-arch-icon">🔗</div>
              <div class="imggen-arch-label">CLIP</div>
              <div class="imggen-arch-sub">Text Encoder</div>
            </div>
            <div class="imggen-arch-arrow">→</div>
            <div class="imggen-arch-block imggen-arch-unet">
              <div class="imggen-arch-icon">🧠</div>
              <div class="imggen-arch-label">U-Net</div>
              <div class="imggen-arch-sub">Denoiser (×50)</div>
            </div>
            <div class="imggen-arch-arrow">→</div>
            <div class="imggen-arch-block imggen-arch-vae">
              <div class="imggen-arch-icon">🔍</div>
              <div class="imggen-arch-label">VAE</div>
              <div class="imggen-arch-sub">Decoder</div>
            </div>
            <div class="imggen-arch-arrow">→</div>
            <div class="imggen-arch-block imggen-arch-output">
              <div class="imggen-arch-icon">🖼️</div>
              <div class="imggen-arch-label">Imagem</div>
              <div class="imggen-arch-sub">1024×1024</div>
            </div>
          </div>
          <div class="imggen-arch-noise-input">
            <span class="imggen-arch-noise-label">🎲 Ruído Gaussiano</span>
            <span class="imggen-arch-noise-arrow">↗</span>
          </div>
        </div>

        <!-- Timeline -->
        <h3 class="mb-4">📅 Evolução dos Modelos</h3>
        <div class="imggen-timeline">
          ${ImageGenEngine.TIMELINE.map((t, i) => `
            <div class="imggen-timeline-item ${i % 2 === 0 ? 'left' : 'right'}">
              <div class="imggen-timeline-dot">${t.icon}</div>
              <div class="imggen-timeline-content">
                <span class="imggen-timeline-year">${t.year}</span>
                <strong>${t.name}</strong>
                <p class="text-sm text-muted">${t.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* =================== PIPELINE TAB =================== */
  function renderPipelineTab() {
    const shapes = ImageGenEngine.SHAPES;
    const shapeKeys = Object.keys(shapes);
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🔬 Difusão Reversa — Passo a Passo Real</h3>
          <p class="text-sm text-muted mb-4">Veja o modelo transformar <strong>ruído puro</strong> em uma imagem concreta.
          Cada frame simula um passo de denoising da U-Net, removendo ruído gradualmente.</p>

          <div class="imggen-shape-selector">
            <label><strong>Escolha o que gerar:</strong></label>
            <div class="imggen-shape-btns">
              ${shapeKeys.map((k, i) => `
                <button class="btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} btn-sm imggen-shape-btn" data-shape="${k}">${shapes[k].name}</button>
              `).join('')}
            </div>
          </div>

          <div class="imggen-diffusion-controls mt-4">
            <button class="btn btn-primary" id="imggen-next-step">▶️ Iniciar Difusão</button>
            <button class="btn btn-ghost" id="imggen-reset-diffusion">🔄 Reset</button>
            <span class="imggen-step-counter text-sm text-muted" id="imggen-step-counter">Passo 0 / ${ImageGenEngine.DIFFUSION_STEPS.length}</span>
          </div>
        </div>

        <!-- Main canvas + timestep -->
        <div class="imggen-pipeline-main">
          <div class="imggen-diffusion-visual">
            <div class="imggen-canvas-header">
              <span class="imggen-timestep-badge" id="imggen-timestep-badge">T = 1000</span>
              <span class="text-sm text-muted">Prompt: "<span id="imggen-current-prompt">Uma estrela dourada brilhante</span>"</span>
            </div>
            <canvas id="imggen-diffusion-canvas" width="320" height="320"></canvas>
            <div class="imggen-progress-bar-wrap">
              <div class="imggen-progress-bar" id="imggen-progress-bar" style="width: 0%"></div>
            </div>
          </div>

          <div id="imggen-diffusion-info" class="card-flat">
            <h4 id="imggen-step-title">🎲 T=1000 — Ruído Gaussiano Puro</h4>
            <p id="imggen-step-desc">Escolha uma forma e clique "Iniciar Difusão".</p>
            <p id="imggen-step-detail" class="text-sm text-muted mt-2"></p>
            <!-- Rich step visualization expands here -->
            <div id="imggen-step-viz" class="imggen-step-viz"></div>
            <div class="imggen-noise-meter mt-4">
              <label class="text-sm">Nível de ruído:</label>
              <div class="imggen-noise-bar-wrap">
                <div class="imggen-noise-bar" id="imggen-noise-bar" style="width: 100%"></div>
              </div>
              <span class="text-sm" id="imggen-noise-pct">100%</span>
            </div>
          </div>
        </div>

        <!-- Snapshot strip -->
        <div class="card-flat mt-8">
          <h3 class="mb-4">📸 Snapshots do Processo</h3>
          <p class="text-sm text-muted mb-4">Capturas automáticas em momentos-chave da difusão:</p>
          <div class="imggen-snapshot-strip" id="imggen-snapshot-strip">
            <div class="imggen-snapshot-empty text-muted text-sm">Inicie a difusão para ver os snapshots aqui.</div>
          </div>
        </div>

        <!-- Steps reference -->
        <h3 class="mb-4 mt-8">📋 Etapas do Processo</h3>
        <div class="imggen-steps-grid">
          ${ImageGenEngine.DIFFUSION_STEPS.map((s, i) => `
            <div class="card-flat imggen-step-card" data-step="${i}">
              <div class="imggen-step-num">${i + 1}</div>
              <div>
                <h4>${s.icon} ${s.title}</h4>
                <p class="text-sm">${s.desc}</p>
                <p class="text-sm text-muted mt-1">${s.detail}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* =================== GENERATE TAB =================== */
  function renderGenerateTab() {
    const configured = typeof FoundryService !== 'undefined' && FoundryService.isConfigured();

    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🎨 Gerar Imagem com IA Real</h3>
          <p class="text-sm text-muted mb-4">Use o modelo <strong>GPT-Image</strong> da Azure para gerar imagens
          a partir do seu prompt. O modelo processa seu texto e cria uma imagem original.</p>

          ${!configured ? `
            <div class="alert alert-warning mb-4">
              ⚠️ API não configurada. <a href="#/settings">Configure suas credenciais</a> para usar geração real.
            </div>
          ` : ''}

          <div class="imggen-prompt-area">
            <label for="imggen-prompt"><strong>Seu prompt:</strong></label>
            <textarea id="imggen-prompt" class="imggen-textarea" rows="3"
              placeholder="Descreva a imagem que deseja gerar... Ex: Um gato astronauta flutuando no espaço, estilo anime"></textarea>

            <div class="imggen-options-row">
              <div class="imggen-option">
                <label>Tamanho:</label>
                <select id="imggen-size">
                  <option value="1024x1024" selected>1024×1024</option>
                  <option value="1792x1024">1792×1024 (paisagem)</option>
                  <option value="1024x1792">1024×1792 (retrato)</option>
                </select>
              </div>
              <div class="imggen-option">
                <label>Qualidade:</label>
                <select id="imggen-quality">
                  <option value="auto" selected>Auto</option>
                  <option value="high">Alta (HD)</option>
                  <option value="low">Baixa (rápido)</option>
                </select>
              </div>
            </div>

            <div class="imggen-presets">
              <span class="text-sm text-muted">Exemplos: </span>
              <button class="btn btn-ghost btn-sm imggen-preset" data-prompt="Um gato astronauta flutuando no espaço com a Terra ao fundo, estilo arte digital">🐱 Gato Espacial</button>
              <button class="btn btn-ghost btn-sm imggen-preset" data-prompt="Uma cidade cyberpunk futurista à noite com luzes neon e carros voadores">🌆 Cyberpunk</button>
              <button class="btn btn-ghost btn-sm imggen-preset" data-prompt="Uma floresta encantada com cogumelos luminosos e fadas, estilo aquarela">🍄 Floresta Mágica</button>
              <button class="btn btn-ghost btn-sm imggen-preset" data-prompt="Um robô simpático ensinando matemática para crianças numa sala colorida">🤖 Robô Professor</button>
              <button class="btn btn-ghost btn-sm imggen-preset" data-prompt="Um dragão de origami voando sobre montanhas de papel dobrado">🐉 Dragão Origami</button>
            </div>

            <button id="imggen-generate-btn" class="btn btn-primary btn-lg mt-4" ${!configured ? 'disabled' : ''}>
              🎨 Gerar Imagem
            </button>
          </div>
        </div>

        <!-- Generation Result -->
        <div id="imggen-result" class="imggen-result hidden">
          <div id="imggen-loading" class="imggen-loading hidden">
            <div class="imggen-loading-animation">
              <div class="imggen-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p class="mt-4">Gerando imagem... Isso pode levar 10-30 segundos</p>
              <p class="text-sm text-muted">O modelo está processando difusão reversa em ~50 passos</p>
            </div>
          </div>

          <div id="imggen-output" class="imggen-output hidden">
            <div class="imggen-output-image-wrap">
              <img id="imggen-output-img" class="imggen-output-img" alt="Generated image" />
            </div>
            <div class="imggen-output-meta card-flat mt-4">
              <p><strong>Prompt utilizado:</strong> <span id="imggen-used-prompt"></span></p>
              <p><strong>Modelo:</strong> <span id="imggen-used-model"></span></p>
              <p><strong>Tempo:</strong> <span id="imggen-elapsed"></span>ms</p>
              <div class="mt-4">
                <button class="btn btn-ghost btn-sm" id="imggen-save-gallery">💾 Salvar na Galeria</button>
                <button class="btn btn-ghost btn-sm" id="imggen-download">⬇️ Download</button>
              </div>
            </div>
          </div>

          <div id="imggen-error" class="imggen-error hidden">
            <p class="text-danger" id="imggen-error-msg"></p>
          </div>
        </div>
      </div>
    `;
  }

  /* =================== GALLERY TAB =================== */
  function renderGalleryTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🖼️ Galeria de Imagens Geradas</h3>
          <p class="text-sm text-muted">Imagens geradas durante esta sessão. Gere uma imagem na aba "Gerar" e salve aqui!</p>
        </div>
        <div id="imggen-gallery-grid" class="imggen-gallery-grid">
          ${_gallery.length === 0 ? `
            <div class="imggen-gallery-empty">
              <p class="text-muted">Nenhuma imagem na galeria ainda.</p>
              <p class="text-sm text-muted">Gere uma imagem na aba "🎨 Gerar" e clique "💾 Salvar na Galeria".</p>
            </div>
          ` : _gallery.map((img, i) => `
            <div class="imggen-gallery-item">
              <img src="${img.src}" alt="${img.prompt}" class="imggen-gallery-img" />
              <div class="imggen-gallery-meta">
                <p class="text-sm">${img.prompt.substring(0, 80)}${img.prompt.length > 80 ? '...' : ''}</p>
                <p class="text-xs text-muted">${img.model} · ${img.elapsed}ms</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* =================== QUIZ TAB =================== */
  function renderQuizTab(mState) {
    const quiz = ImageGenEngine.QUIZ;
    const answered = mState.quizAnswers || {};
    const total = quiz.length;
    const correct = Object.values(answered).filter(a => a.correct).length;

    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>📝 Quiz — Geração de Imagens</h3>
          <p>Teste seus conhecimentos sobre como IA gera imagens!</p>
          <div class="quiz-score">
            <span class="quiz-score-num">${correct}</span> / <span>${total}</span> corretas
          </div>
        </div>

        ${quiz.map((q, i) => {
          const ans = answered[i];
          return `
            <div class="card-flat mb-4 quiz-card ${ans ? (ans.correct ? 'quiz-correct' : 'quiz-wrong') : ''}">
              <p class="quiz-question"><strong>${i + 1}.</strong> ${q.q}</p>
              <div class="quiz-opts">
                ${q.opts.map((opt, oi) => `
                  <button class="quiz-opt ${ans ? (oi === q.correct ? 'correct' : (oi === ans.chosen ? 'wrong' : '')) : ''}"
                    data-qi="${i}" data-oi="${oi}" ${ans ? 'disabled' : ''}>
                    ${opt}
                  </button>
                `).join('')}
              </div>
              ${ans ? `<p class="quiz-explanation mt-2 text-sm">${ans.correct ? '✅' : '❌'} ${q.explanation}</p>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* =================== INTERACTIONS =================== */
  function initInteractions() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        const panel = document.getElementById(`tab-${target}`);
        if (panel) panel.classList.remove('hidden');

        // Refresh gallery when switching to it
        if (target === 'gallery') refreshGallery();
      });
    });

    // Diffusion step-by-step
    const nextBtn = document.getElementById('imggen-next-step');
    const resetBtn = document.getElementById('imggen-reset-diffusion');
    if (nextBtn) nextBtn.addEventListener('click', advanceDiffusionStep);
    if (resetBtn) resetBtn.addEventListener('click', resetDiffusion);

    // Shape selector
    document.querySelectorAll('.imggen-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.imggen-shape-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-ghost');
        });
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-primary');
        _selectedShape = btn.dataset.shape;
        resetDiffusion();
      });
    });

    // Initialize canvas with noise
    drawNoiseOnCanvas();

    // Preset prompts
    document.querySelectorAll('.imggen-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const textarea = document.getElementById('imggen-prompt');
        if (textarea) textarea.value = btn.dataset.prompt;
      });
    });

    // Generate button
    const genBtn = document.getElementById('imggen-generate-btn');
    if (genBtn) genBtn.addEventListener('click', handleGenerate);

    // Quiz
    document.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.addEventListener('click', () => handleQuizAnswer(opt));
    });

    // Download
    const dlBtn = document.getElementById('imggen-download');
    if (dlBtn) dlBtn.addEventListener('click', handleDownload);

    // Save to gallery
    const saveBtn = document.getElementById('imggen-save-gallery');
    if (saveBtn) saveBtn.addEventListener('click', handleSaveToGallery);
  }

  /* ---- Diffusion Canvas — Manual Step-By-Step ---- */
  let _selectedShape = 'star';
  let _currentStepIdx = -1;  // -1 = not started, 0..N-1 = current step
  let _noiseR = null, _noiseG = null, _noiseB = null;
  let _targetR = null, _targetG = null, _targetB = null;
  let _animating = false; // true while a transition animation is running

  // Per-step denoising progress (0..1). Index i maps to how much signal is
  // visible at the END of step i. Step 0 = noise (0%), last step = fully clean (100%)
  function getStepProgress(stepIdx) {
    const steps = ImageGenEngine.DIFFUSION_STEPS;
    // step 0 (noise) → 0, step N-1 (decode) → 1
    if (stepIdx <= 0) return 0;
    return stepIdx / (steps.length - 1);
  }

  function drawNoiseOnCanvas() {
    const canvas = document.getElementById('imggen-diffusion-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const len = w * h;

    // Generate persistent noise
    _noiseR = new Float32Array(len);
    _noiseG = new Float32Array(len);
    _noiseB = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      _noiseR[i] = Math.random();
      _noiseG[i] = Math.random();
      _noiseB[i] = Math.random();
      imageData.data[i*4]   = Math.floor(_noiseR[i] * 255);
      imageData.data[i*4+1] = Math.floor(_noiseG[i] * 255);
      imageData.data[i*4+2] = Math.floor(_noiseB[i] * 255);
      imageData.data[i*4+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Clear snapshots
    const strip = document.getElementById('imggen-snapshot-strip');
    if (strip) strip.innerHTML = '<div class="imggen-snapshot-empty text-muted text-sm">Clique em \"Próximo Passo\" para ver os snapshots aqui.</div>';
  }

  function captureSnapshot(canvas, timestep, stepInfo) {
    const strip = document.getElementById('imggen-snapshot-strip');
    if (!strip) return;
    const empty = strip.querySelector('.imggen-snapshot-empty');
    if (empty) empty.remove();

    const snap = document.createElement('div');
    snap.className = 'imggen-snapshot-item';
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 96;
    miniCanvas.height = 96;
    const mCtx = miniCanvas.getContext('2d');
    mCtx.drawImage(canvas, 0, 0, 96, 96);
    snap.innerHTML = `
      <div class="imggen-snapshot-label">${stepInfo.icon} T=${timestep >= 0 ? timestep : 'decode'}</div>
    `;
    snap.prepend(miniCanvas);
    strip.appendChild(snap);
  }

  /**
   * Render the canvas at a given blending progress t (0 = pure noise, 1 = clean target).
   */
  function renderCanvasAtProgress(t) {
    const canvas = document.getElementById('imggen-diffusion-canvas');
    if (!canvas || !_noiseR || !_targetR) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const len = w * h;

    // Cosine-schedule noise level
    const noiseLevel = Math.cos(t * Math.PI * 0.5); // 1 → 0
    const signal = 1 - noiseLevel;
    const ease = signal * signal * (3 - 2 * signal); // smoothstep

    const imageData = ctx.createImageData(w, h);

    for (let i = 0; i < len; i++) {
      const blurFactor = Math.max(0, 1 - t * 1.5);
      let nr = _noiseR[i], ng = _noiseG[i], nb = _noiseB[i];

      if (blurFactor > 0.1) {
        const x = i % w, y = Math.floor(i / w);
        const blurR = Math.floor(blurFactor * 4) + 1;
        let sr = 0, sg = 0, sb = 0, cnt = 0;
        for (let dy = -blurR; dy <= blurR; dy += blurR) {
          for (let dx = -blurR; dx <= blurR; dx += blurR) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const ni = ny * w + nx;
              sr += _noiseR[ni]; sg += _noiseG[ni]; sb += _noiseB[ni];
              cnt++;
            }
          }
        }
        nr = sr / cnt; ng = sg / cnt; nb = sb / cnt;
      }

      const r = nr * (1 - ease) + _targetR[i] * ease;
      const g = ng * (1 - ease) + _targetG[i] * ease;
      const b = nb * (1 - ease) + _targetB[i] * ease;

      imageData.data[i*4]   = Math.floor(Math.max(0, Math.min(1, r)) * 255);
      imageData.data[i*4+1] = Math.floor(Math.max(0, Math.min(1, g)) * 255);
      imageData.data[i*4+2] = Math.floor(Math.max(0, Math.min(1, b)) * 255);
      imageData.data[i*4+3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    // Update UI meters
    const displayT = Math.max(0, Math.round(1000 * (1 - t)));
    const badge = document.getElementById('imggen-timestep-badge');
    if (badge) badge.textContent = t >= 1 ? 'Final' : `T = ${displayT}`;
    const pbar = document.getElementById('imggen-progress-bar');
    if (pbar) pbar.style.width = `${t * 100}%`;
    const nbar = document.getElementById('imggen-noise-bar');
    const npct = document.getElementById('imggen-noise-pct');
    if (nbar) nbar.style.width = `${noiseLevel * 100}%`;
    if (npct) npct.textContent = `${Math.round(noiseLevel * 100)}%`;
  }

  /**
   * Smoothly animate the canvas from progressA to progressB over ~600ms,
   * then call onDone().
   */
  function animateTransition(progressA, progressB, onDone) {
    _animating = true;
    const duration = 700; // ms
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const f = Math.min(elapsed / duration, 1);
      // ease-in-out
      const eased = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      const progress = progressA + (progressB - progressA) * eased;
      renderCanvasAtProgress(progress);

      if (f < 1) {
        requestAnimationFrame(frame);
      } else {
        _animating = false;
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  /**
   * Called on each click of "Próximo Passo".
   */
  function advanceDiffusionStep() {
    if (_animating) return; // wait for current transition to finish

    const steps = ImageGenEngine.DIFFUSION_STEPS;
    const canvas = document.getElementById('imggen-diffusion-canvas');
    if (!canvas) return;
    const w = canvas.width, h = canvas.height;

    // First click: initialize target + snapshots
    if (_currentStepIdx < 0) {
      const target = ImageGenEngine.renderTargetImage(_selectedShape, w, h);
      _targetR = target.r;
      _targetG = target.g;
      _targetB = target.b;
      if (!_noiseR) drawNoiseOnCanvas();

      const strip = document.getElementById('imggen-snapshot-strip');
      if (strip) strip.innerHTML = '';

      const promptEl = document.getElementById('imggen-current-prompt');
      if (promptEl) promptEl.textContent = (ImageGenEngine.SHAPES[_selectedShape] || ImageGenEngine.SHAPES.star).prompt;

      // Show step 0 (noise) instantly — already drawn
      _currentStepIdx = 0;
      updateDiffusionInfo(0);
      captureSnapshot(canvas, steps[0].timestep, steps[0]);
      updateStepButton();
      return;
    }

    // Already at last step
    if (_currentStepIdx >= steps.length - 1) return;

    const prevProgress = getStepProgress(_currentStepIdx);
    _currentStepIdx++;
    const nextProgress = getStepProgress(_currentStepIdx);

    updateDiffusionInfo(_currentStepIdx);

    // Animate the transition
    animateTransition(prevProgress, nextProgress, () => {
      captureSnapshot(canvas, steps[_currentStepIdx].timestep, steps[_currentStepIdx]);
      updateStepButton();
    });

    updateStepButton();
  }

  function updateStepButton() {
    const btn = document.getElementById('imggen-next-step');
    const counter = document.getElementById('imggen-step-counter');
    const steps = ImageGenEngine.DIFFUSION_STEPS;

    if (counter) {
      const display = Math.max(0, _currentStepIdx);
      counter.textContent = `Passo ${display} / ${steps.length - 1}`;
    }

    if (btn) {
      if (_currentStepIdx < 0) {
        btn.textContent = '▶️ Iniciar Difusão';
        btn.disabled = false;
      } else if (_currentStepIdx >= steps.length - 1) {
        btn.textContent = '✅ Concluído!';
        btn.disabled = true;
      } else {
        btn.textContent = `⏭️ Próximo: ${steps[_currentStepIdx + 1].icon} ${steps[_currentStepIdx + 1].title}`;
        btn.disabled = false;
      }
    }
  }

  function updateDiffusionInfo(stepIdx) {
    const steps = ImageGenEngine.DIFFUSION_STEPS;
    const step = steps[stepIdx];
    if (!step) return;

    const title = document.getElementById('imggen-step-title');
    const desc = document.getElementById('imggen-step-desc');
    const detail = document.getElementById('imggen-step-detail');
    const vizContainer = document.getElementById('imggen-step-viz');

    if (title) title.textContent = `${step.icon} ${step.title}`;
    if (desc) desc.textContent = step.desc;
    if (detail) detail.textContent = step.detail;

    // Render rich visualization for the current step
    if (vizContainer) {
      renderStepVisualization(vizContainer, step, stepIdx);
    }

    // Highlight current step card
    document.querySelectorAll('.imggen-step-card').forEach((card, i) => {
      card.classList.toggle('imggen-step-active', i === stepIdx);
    });
  }

  /**
   * Dispatch to the appropriate rich visualization for each pipeline step.
   */
  function renderStepVisualization(container, step, stepIdx) {
    const renderers = {
      'noise':         renderNoiseViz,
      'text-encode':   renderClipVisualization,
      'denoise-1':     renderDenoise1Viz,
      'denoise-2':     renderDenoise2Viz,
      'denoise-3':     renderDenoise3Viz,
      'denoise-4':     renderDenoise4Viz,
      'denoise-5':     renderDenoise5Viz,
      'denoise-6':     renderDenoise6Viz,
      'denoise-final': renderDenoiseFinalViz,
      'decode':        renderDecodeViz,
    };
    const renderer = renderers[step.id];
    if (renderer) {
      renderer(container);
    } else {
      container.innerHTML = '';
    }
  }

  /**
   * Render a rich CLIP encoding visualization:
   * - Tokenization of the prompt
   * - 768-dim embedding heatmap
   * - Concept activation bars
   */
  function renderClipVisualization(container) {
    const data = ImageGenEngine.CLIP_DATA[_selectedShape] || ImageGenEngine.CLIP_DATA.star;
    const embedding = ImageGenEngine.generateFakeEmbedding(data.prompt);

    container.innerHTML = `
      <!-- 1) Tokenization -->
      <div class="clip-section">
        <h5 class="clip-section-title">1. Tokenização do Prompt</h5>
        <p class="text-sm text-muted mb-2">O texto é dividido em tokens (subpalavras) usando BPE (Byte Pair Encoding):</p>
        <div class="clip-prompt-original">
          <span class="text-sm text-muted">Prompt:</span>
          <span class="clip-prompt-text">"${data.prompt}"</span>
        </div>
        <div class="clip-arrow">↓ Tokenizer BPE</div>
        <div class="clip-tokens-row">
          ${data.tokens.map((tok, i) => `
            <div class="clip-token ${tok.startsWith('<|') ? 'clip-token-special' : ''} ${tok.startsWith('##') ? 'clip-token-subword' : ''}" style="animation-delay: ${i * 0.08}s">
              <span class="clip-token-text">${tok}</span>
              <span class="clip-token-id">${data.tokenIds[i]}</span>
            </div>
          `).join('')}
        </div>
        <p class="text-sm text-muted mt-2"><strong>${data.tokens.length}</strong> tokens → cada um vira um vetor de 768 dimensões → média/pooling → <strong>1 vetor final</strong> de 768-d.</p>
      </div>

      <!-- 2) Embedding Heatmap -->
      <div class="clip-section">
        <h5 class="clip-section-title">2. Vetor de Embedding (768 dimensões)</h5>
        <p class="text-sm text-muted mb-2">Cada dimensão captura um aspecto semântico. Valores de <span class="clip-neg">-1</span> a <span class="clip-pos">+1</span>:</p>
        <canvas id="clip-embedding-heatmap" class="clip-heatmap" width="768" height="48"></canvas>
        <div class="clip-heatmap-legend">
          <span class="clip-neg">-1.0</span>
          <div class="clip-heatmap-gradient"></div>
          <span class="clip-pos">+1.0</span>
        </div>
        <div class="clip-embedding-stats">
          <span class="text-sm">Dimensões: <strong>768</strong></span>
          <span class="text-sm">Norma L2: <strong>${Math.sqrt(embedding.reduce((s, v) => s + v*v, 0)).toFixed(2)}</strong></span>
          <span class="text-sm">Média: <strong>${(embedding.reduce((s, v) => s + v, 0) / 768).toFixed(4)}</strong></span>
        </div>
        <details class="clip-raw-values">
          <summary class="text-sm">Ver primeiros 32 valores numéricos →</summary>
          <div class="clip-values-grid">
            ${Array.from(embedding.slice(0, 32)).map((v, i) =>
              `<span class="clip-val" style="color: ${v >= 0 ? '#4ade80' : '#f87171'}" title="dim[${i}]">${v.toFixed(3)}</span>`
            ).join('')}
            <span class="text-sm text-muted">... +736 dims</span>
          </div>
        </details>
      </div>

      <!-- 3) Concept Activations -->
      <div class="clip-section">
        <h5 class="clip-section-title">3. O que o CLIP "Entende"</h5>
        <p class="text-sm text-muted mb-2">O embedding codifica conceitos visuais. Direções no espaço vetorial que correspondem a:</p>
        <div class="clip-concepts">
          ${data.concepts.map((c, i) => `
            <div class="clip-concept-row">
              <span class="clip-concept-name">${c.name}</span>
              <div class="clip-concept-bar-wrap">
                <div class="clip-concept-bar" style="width: 0%; background: ${c.color}; animation-delay: ${0.3 + i * 0.1}s" data-target-width="${c.activation * 100}%"></div>
              </div>
              <span class="clip-concept-pct">${(c.activation * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
        <p class="text-sm text-muted mt-2">Esses "conceitos" são direções aprendidas no espaço vetorial. A cross-attention da U-Net usa esse vetor para guiar cada passo de denoising.</p>
      </div>
    `;

    // Draw the embedding heatmap
    requestAnimationFrame(() => {
      drawEmbeddingHeatmap(embedding);
      animateConceptBars();
    });
  }

  /* ======================== STEP 0: NOISE ======================== */
  function renderNoiseViz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">📊 Distribuição dos Pixels</h5>
        <p class="text-sm text-muted mb-2">Cada pixel R, G, B é amostrado independentemente de uma distribuição uniforme U(0, 1):</p>
        <canvas id="sviz-noise-histogram" width="300" height="120"></canvas>
        <div class="sviz-stats-row mt-2">
          <div class="sviz-stat">
            <span class="sviz-stat-label">Pixels</span>
            <span class="sviz-stat-value">320 × 320 = 102.400</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Canais</span>
            <span class="sviz-stat-value">R, G, B (3)</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Valores totais</span>
            <span class="sviz-stat-value">307.200</span>
          </div>
        </div>
        <div class="sviz-formula mt-2">
          <code>x_T ~ 𝒩(0, I) → cada valor ∈ [0, 1] aleatoriamente</code>
        </div>
        <p class="text-sm text-muted mt-2">A distribuição é <strong>perfeitamente uniforme</strong> — sem padrões, sem estrutura. Entropia máxima. É daqui que o modelo começa a "esculpir" a imagem.</p>
      </div>
    `;
    requestAnimationFrame(() => drawNoiseHistogram());
  }

  function drawNoiseHistogram() {
    const canvas = document.getElementById('sviz-noise-histogram');
    if (!canvas || !_noiseR) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Build histogram from actual noise data
    const bins = 30;
    const countsR = new Array(bins).fill(0);
    const countsG = new Array(bins).fill(0);
    const countsB = new Array(bins).fill(0);
    const len = _noiseR.length;
    for (let i = 0; i < len; i++) {
      countsR[Math.min(Math.floor(_noiseR[i] * bins), bins - 1)]++;
      countsG[Math.min(Math.floor(_noiseG[i] * bins), bins - 1)]++;
      countsB[Math.min(Math.floor(_noiseB[i] * bins), bins - 1)]++;
    }
    const maxCount = Math.max(...countsR, ...countsG, ...countsB);
    const barW = (w - 20) / bins;

    // Draw bars for each channel
    [{ counts: countsR, color: 'rgba(239,68,68,0.5)' },
     { counts: countsG, color: 'rgba(34,197,94,0.5)' },
     { counts: countsB, color: 'rgba(59,130,246,0.5)' }].forEach(({ counts, color }) => {
      ctx.fillStyle = color;
      counts.forEach((c, i) => {
        const barH = (c / maxCount) * (h - 20);
        ctx.fillRect(10 + i * barW, h - 10 - barH, barW - 1, barH);
      });
    });

    // Axis labels
    ctx.fillStyle = '#888';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('0', 10, h - 1);
    ctx.fillText('1', w - 14, h - 1);
    ctx.fillText('freq', 0, 10);
  }

  /* ======================== STEP 2: DENOISE-1 (T=800) ======================== */
  function renderDenoise1Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">🧠 A U-Net em Ação</h5>
        <p class="text-sm text-muted mb-2">A U-Net prediz o ruído ε a cada passo e o subtrai. Estrutura encoder-decoder com skip connections:</p>
        <div class="sviz-unet-diagram">
          <div class="sviz-unet-col sviz-unet-encoder">
            <div class="sviz-unet-block" style="width:100%">64×64×320</div>
            <div class="sviz-unet-arrow">↓ conv + attn</div>
            <div class="sviz-unet-block" style="width:85%">32×32×640</div>
            <div class="sviz-unet-arrow">↓ conv + attn</div>
            <div class="sviz-unet-block" style="width:70%">16×16×1280</div>
            <div class="sviz-unet-arrow">↓ conv</div>
            <div class="sviz-unet-block sviz-unet-bottleneck" style="width:55%">8×8×1280</div>
          </div>
          <div class="sviz-unet-skip-labels">
            <span>⟵ skip</span>
            <span>⟵ skip</span>
            <span>⟵ skip</span>
          </div>
          <div class="sviz-unet-col sviz-unet-decoder">
            <div class="sviz-unet-block" style="width:100%">64×64×320</div>
            <div class="sviz-unet-arrow">↑ conv + attn</div>
            <div class="sviz-unet-block" style="width:85%">32×32×640</div>
            <div class="sviz-unet-arrow">↑ conv + attn</div>
            <div class="sviz-unet-block" style="width:70%">16×16×1280</div>
            <div class="sviz-unet-arrow">↑ conv</div>
            <div class="sviz-unet-block sviz-unet-bottleneck" style="width:55%">8×8×1280</div>
          </div>
        </div>
        <div class="sviz-freq-section mt-4">
          <h5 class="clip-section-title">🎵 Frequências Espaciais</h5>
          <p class="text-sm text-muted mb-2">Neste passo, apenas as <strong>frequências baixas</strong> emergem (formas grandes, manchas):</p>
          <div class="sviz-freq-bars">
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Baixas (manchas)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="70%" style="width:0%; background: linear-gradient(90deg, #4ade80, #22c55e)"></div></div>
              <span class="sviz-freq-pct">70%</span>
            </div>
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Médias (contornos)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="15%" style="width:0%; background: linear-gradient(90deg, #facc15, #eab308)"></div></div>
              <span class="sviz-freq-pct">15%</span>
            </div>
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Altas (detalhes)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="5%" style="width:0%; background: linear-gradient(90deg, #f87171, #ef4444)"></div></div>
              <span class="sviz-freq-pct">5%</span>
            </div>
          </div>
        </div>
        <div class="sviz-formula mt-2">
          <code>x_{t-1} = (1/√α_t)(x_t - (β_t/√(1-ᾱ_t)) · ε_θ(x_t, t, c)) + σ_t·z</code>
        </div>
      </div>
    `;
    requestAnimationFrame(() => animateStepBars());
  }

  /* ======================== STEP 3: DENOISE-2 (T=600) ======================== */
  function renderDenoise2Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">🔗 Cross-Attention: Texto ↔ Imagem</h5>
        <p class="text-sm text-muted mb-2">A cada camada da U-Net, o embedding de texto influencia a geração via <strong>cross-attention</strong>:</p>
        <div class="sviz-crossattn">
          <div class="sviz-ca-side">
            <div class="sviz-ca-label">Imagem (Query)</div>
            <div class="sviz-ca-tensor">latente 32×32</div>
          </div>
          <div class="sviz-ca-middle">
            <div class="sviz-ca-arrow-label">Q × K<sup>T</sup></div>
            <div class="sviz-ca-attn-map">
              <canvas id="sviz-attn-canvas" width="96" height="96"></canvas>
              <span class="text-xs text-muted mt-1">Mapa de atenção</span>
            </div>
            <div class="sviz-ca-arrow-label">× V</div>
          </div>
          <div class="sviz-ca-side">
            <div class="sviz-ca-label">Texto (Key, Value)</div>
            <div class="sviz-ca-tensor">CLIP 768-d</div>
          </div>
        </div>
        <div class="sviz-separation mt-4">
          <h5 class="clip-section-title">🎭 Separação Fundo / Figura</h5>
          <p class="text-sm text-muted mb-2">O modelo começa a distinguir <strong>onde está o objeto</strong> vs. o fundo:</p>
          <div class="sviz-fg-bg-row">
            <div class="sviz-fg-bg-item">
              <div class="sviz-fg-bg-square" style="background: linear-gradient(135deg, #333 0%, #555 50%, #333 100%)"></div>
              <span class="text-sm">Fundo (baixa atenção)</span>
            </div>
            <div class="sviz-fg-bg-arrow">→</div>
            <div class="sviz-fg-bg-item">
              <div class="sviz-fg-bg-square" style="background: linear-gradient(135deg, #ffd700 0%, #e6a800 50%, #b8860b 100%)"></div>
              <span class="text-sm">Figura (alta atenção)</span>
            </div>
          </div>
        </div>
        <div class="sviz-formula mt-2">
          <code>Attention(Q, K, V) = softmax(Q·K<sup>T</sup> / √d_k) · V</code>
        </div>
      </div>
    `;
    requestAnimationFrame(() => drawAttentionMap());
  }

  function drawAttentionMap() {
    const canvas = document.getElementById('sviz-attn-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    // Draw a fake attention map — bright in center (where shape is), dark edges
    const cx = w / 2, cy = h / 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / cx, dy = (y - cy) / cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const v = Math.max(0, 1 - d * 1.2);
        const heat = v * v; // sharper
        // Yellow-red heatmap
        const r = Math.floor(255 * Math.min(1, heat * 2));
        const g = Math.floor(255 * Math.max(0, heat * 2 - 0.5));
        const b = Math.floor(40 * (1 - heat));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  /* ======================== STEP 4: DENOISE-3 (T=400) ======================== */
  function renderDenoise3Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">⚖️ CFG — Classifier-Free Guidance</h5>
        <p class="text-sm text-muted mb-2">O modelo gera <strong>duas predições</strong> a cada passo e as combina:</p>
        <div class="sviz-cfg-diagram">
          <div class="sviz-cfg-branch">
            <div class="sviz-cfg-box sviz-cfg-uncond">ε<sub>uncond</sub></div>
            <span class="text-xs text-muted">Sem texto (prompt vazio)</span>
          </div>
          <div class="sviz-cfg-operator">
            <span class="sviz-cfg-formula">ε̃ = ε<sub>∅</sub> + <strong>w</strong> × (ε<sub>texto</sub> - ε<sub>∅</sub>)</span>
          </div>
          <div class="sviz-cfg-branch">
            <div class="sviz-cfg-box sviz-cfg-cond">ε<sub>cond</sub></div>
            <span class="text-xs text-muted">Com texto CLIP</span>
          </div>
        </div>
        <div class="sviz-cfg-slider mt-4">
          <label class="text-sm"><strong>Guidance Scale (w):</strong></label>
          <div class="sviz-cfg-scale-row">
            <span class="text-xs">1.0<br>Criativo</span>
            <div class="sviz-cfg-scale-track">
              <div class="sviz-cfg-scale-fill" style="width: 53%"></div>
              <div class="sviz-cfg-scale-thumb" style="left: 53%">7.5</div>
            </div>
            <span class="text-xs">20.0<br>Rígido</span>
          </div>
          <p class="text-sm text-muted mt-2">
            <strong>w = 7.5</strong> é o valor típico. Valores baixos → mais criatividade/diversidade. Valores altos → segue o texto fielmente mas pode gerar artefatos.
          </p>
        </div>
        <div class="sviz-freq-section mt-4">
          <h5 class="clip-section-title">🎵 Frequências Resolvidas</h5>
          <div class="sviz-freq-bars">
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Baixas (manchas)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="95%" style="width:0%; background: linear-gradient(90deg, #4ade80, #22c55e)"></div></div>
              <span class="sviz-freq-pct">95%</span>
            </div>
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Médias (contornos)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="60%" style="width:0%; background: linear-gradient(90deg, #facc15, #eab308)"></div></div>
              <span class="sviz-freq-pct">60%</span>
            </div>
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label">Altas (detalhes)</span>
              <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="20%" style="width:0%; background: linear-gradient(90deg, #f87171, #ef4444)"></div></div>
              <span class="sviz-freq-pct">20%</span>
            </div>
          </div>
        </div>
      </div>
    `;
    requestAnimationFrame(() => animateStepBars());
  }

  /* ======================== STEP 5: DENOISE-4 (T=250) ======================== */
  function renderDenoise4Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">📐 Scheduler: Controle de Step Size</h5>
        <p class="text-sm text-muted mb-2">O scheduler (ex: DDPM, DDIM, Euler) controla <strong>quanto ruído remover</strong> em cada passo:</p>
        <canvas id="sviz-scheduler-chart" width="300" height="140"></canvas>
        <div class="sviz-scheduler-legend">
          <span class="text-xs"><span style="color:#4ade80">●</span> σ_t (ruído restante)</span>
          <span class="text-xs"><span style="color:#f87171">●</span> Δ por passo (step size)</span>
          <span class="text-xs"><span style="color:#facc15">▼</span> Posição atual (T=250)</span>
        </div>
        <div class="sviz-stats-row mt-4">
          <div class="sviz-stat">
            <span class="sviz-stat-label">Scheduler</span>
            <span class="sviz-stat-value">DDIM</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Step Size</span>
            <span class="sviz-stat-value">Δt = 25</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Passos restantes</span>
            <span class="sviz-stat-value">~10 de 50</span>
          </div>
        </div>
        <p class="text-sm text-muted mt-2">
          Neste ponto, os passos são <strong>menores e mais precisos</strong>. Cada iteração faz ajustes finos nas bordas e gradientes, sem mudar a estrutura global.
        </p>
      </div>
    `;
    requestAnimationFrame(() => drawSchedulerChart());
  }

  function drawSchedulerChart() {
    const canvas = document.getElementById('sviz-scheduler-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = 25;
    ctx.clearRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, 5);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - 5, h - pad);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#888';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('T=1000', pad, h - 8);
    ctx.fillText('T=0', w - 28, h - 8);
    ctx.fillText('σ', 5, 15);

    const steps = 50;
    const plotW = w - pad - 10;
    const plotH = h - pad - 10;

    // σ_t curve (cosine schedule)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const sigma = Math.cos(t * Math.PI * 0.5);
      const x = pad + t * plotW;
      const y = 5 + (1 - sigma) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Step size (derivative) bars
    ctx.fillStyle = 'rgba(248,113,113,0.4)';
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps, t2 = (i + 1) / steps;
      const s1 = Math.cos(t1 * Math.PI * 0.5);
      const s2 = Math.cos(t2 * Math.PI * 0.5);
      const delta = Math.abs(s2 - s1);
      const x = pad + t1 * plotW;
      const barH = delta * plotH * 3;
      ctx.fillRect(x, h - pad - barH, plotW / steps - 1, barH);
    }

    // Current position marker (T=250 → t≈0.75)
    const currT = 0.75;
    const currX = pad + currT * plotW;
    const currSigma = Math.cos(currT * Math.PI * 0.5);
    const currY = 5 + (1 - currSigma) * plotH;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(currX, currY - 8);
    ctx.lineTo(currX - 5, currY - 15);
    ctx.lineTo(currX + 5, currY - 15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(currX, currY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
  }

  /* ======================== STEP 6: DENOISE-5 (T=100) ======================== */
  function renderDenoise5Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">🎵 Espectro de Frequências Completo</h5>
        <p class="text-sm text-muted mb-2">Agora as <strong>frequências altas</strong> (detalhes finos) estão quase todas resolvidas:</p>
        <div class="sviz-freq-bars">
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Baixas (forma global)</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="100%" style="width:0%; background: linear-gradient(90deg, #4ade80, #22c55e)"></div></div>
            <span class="sviz-freq-pct">100%</span>
          </div>
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Médias (contornos)</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="95%" style="width:0%; background: linear-gradient(90deg, #facc15, #eab308)"></div></div>
            <span class="sviz-freq-pct">95%</span>
          </div>
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Altas (texturas, brilho)</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="80%" style="width:0%; background: linear-gradient(90deg, #f87171, #ef4444)"></div></div>
            <span class="sviz-freq-pct">80%</span>
          </div>
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Ultra-altas (reflexos)</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="50%" style="width:0%; background: linear-gradient(90deg, #c084fc, #a855f7)"></div></div>
            <span class="sviz-freq-pct">50%</span>
          </div>
        </div>
        <div class="sviz-detail-examples mt-4">
          <h5 class="clip-section-title mt-2">✨ O que muda neste passo</h5>
          <div class="sviz-detail-grid">
            <div class="sviz-detail-item">
              <span class="sviz-detail-icon">💡</span>
              <span class="text-sm">Brilho central da estrela</span>
            </div>
            <div class="sviz-detail-item">
              <span class="sviz-detail-icon">🌈</span>
              <span class="text-sm">Gradientes suaves de cor</span>
            </div>
            <div class="sviz-detail-item">
              <span class="sviz-detail-icon">🔲</span>
              <span class="text-sm">Sombras nas bordas</span>
            </div>
            <div class="sviz-detail-item">
              <span class="sviz-detail-icon">✨</span>
              <span class="text-sm">Micro-brilhos e sparkles</span>
            </div>
          </div>
        </div>
      </div>
    `;
    requestAnimationFrame(() => animateStepBars());
  }

  /* ======================== STEP 7: DENOISE-6 (T=25) ======================== */
  function renderDenoise6Viz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">📉 Convergência — Variância Residual</h5>
        <p class="text-sm text-muted mb-2">O ruído restante é quase imperceptível. A variância σ_t converge para zero:</p>
        <canvas id="sviz-convergence-chart" width="300" height="120"></canvas>
        <div class="sviz-stats-row mt-4">
          <div class="sviz-stat">
            <span class="sviz-stat-label">σ_t atual</span>
            <span class="sviz-stat-value">0.025</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">σ_t inicial</span>
            <span class="sviz-stat-value">1.000</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Redução</span>
            <span class="sviz-stat-value">97.5%</span>
          </div>
        </div>
        <div class="sviz-freq-bars mt-4">
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Todas frequências</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="98%" style="width:0%; background: linear-gradient(90deg, #4ade80, #22c55e)"></div></div>
            <span class="sviz-freq-pct">98%</span>
          </div>
          <div class="sviz-freq-bar-row">
            <span class="sviz-freq-label">Ruído residual</span>
            <div class="sviz-freq-bar-wrap"><div class="sviz-freq-bar" data-target-width="2%" style="width:0%; background: linear-gradient(90deg, #f87171, #ef4444)"></div></div>
            <span class="sviz-freq-pct">2%</span>
          </div>
        </div>
        <p class="text-sm text-muted mt-2">Os últimos passos removem artefatos invisíveis ao olho humano, mas que melhoram a qualidade numérica do tensor latente.</p>
      </div>
    `;
    requestAnimationFrame(() => {
      drawConvergenceChart();
      animateStepBars();
    });
  }

  function drawConvergenceChart() {
    const canvas = document.getElementById('sviz-convergence-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = 25;
    ctx.clearRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, 5);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - 5, h - pad);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('T=1000', pad, h - 8);
    ctx.fillText('T=0', w - 28, h - 8);
    ctx.fillText('σ_t', 2, 15);

    const plotW = w - pad - 10;
    const plotH = h - pad - 10;
    const pts = 100;

    // Exponential decay curve
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const t = i / pts;
      const sigma = Math.exp(-t * 4); // exponential decay
      const x = pad + t * plotW;
      const y = 5 + (1 - sigma) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current position (T=25 → t≈0.975)
    const currT = 0.975;
    const currX = pad + currT * plotW;
    const currSigma = Math.exp(-currT * 4);
    const currY = 5 + (1 - currSigma) * plotH;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(currX, currY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('← T=25', currX + 8, currY + 3);
  }

  /* ======================== STEP 8: DENOISE-FINAL (T=0) ======================== */
  function renderDenoiseFinalViz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">🧊 Espaço Latente Final (x₀)</h5>
        <p class="text-sm text-muted mb-2">O tensor latente está completamente limpo. Toda a informação da imagem está codificada em <strong>4 canais × 64 × 64</strong>:</p>
        <div class="sviz-latent-grid">
          ${['Canal 0 (estrutura)', 'Canal 1 (cores)', 'Canal 2 (bordas)', 'Canal 3 (texturas)'].map((label, i) => `
            <div class="sviz-latent-channel">
              <canvas class="sviz-latent-canvas" id="sviz-latent-ch${i}" width="64" height="64"></canvas>
              <span class="text-xs text-muted">${label}</span>
            </div>
          `).join('')}
        </div>
        <div class="sviz-stats-row mt-4">
          <div class="sviz-stat">
            <span class="sviz-stat-label">Dimensão</span>
            <span class="sviz-stat-value">4 × 64 × 64</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Valores</span>
            <span class="sviz-stat-value">16.384</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Compressão</span>
            <span class="sviz-stat-value">48× menor que RGB</span>
          </div>
        </div>
        <div class="sviz-formula mt-2">
          <code>x₀ ∈ ℝ<sup>4×64×64</sup> → pronto para o VAE Decoder</code>
        </div>
        <p class="text-sm text-muted mt-2">Cada canal latente codifica um aspecto diferente. Juntos, contêm toda a informação necessária para reconstruir a imagem completa em alta resolução.</p>
      </div>
    `;
    requestAnimationFrame(() => drawLatentChannels());
  }

  function drawLatentChannels() {
    const colors = [
      [40, 200, 80],   // green (structure)
      [200, 160, 40],  // yellow (colors)
      [80, 140, 220],  // blue (edges)
      [180, 80, 200],  // purple (textures)
    ];
    for (let ch = 0; ch < 4; ch++) {
      const canvas = document.getElementById(`sviz-latent-ch${ch}`);
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      const w = 64, h = 64;
      const imgData = ctx.createImageData(w, h);

      // Use target image data to create a fake latent channel
      const seed = ch * 12345 + 67890;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // Create a pattern that looks like a latent representation
          let hash = seed + x * 137 + y * 311;
          hash = ((hash << 13) ^ hash) * 1597334677;
          const noise = ((hash & 0xffff) / 65535);

          // Mix with a shape-like pattern
          const cx = w / 2, cy = h / 2;
          const dx = (x - cx) / cx, dy = (y - cy) / cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          const shape = Math.max(0, 1 - d * 1.3);
          const val = (noise * 0.3 + shape * 0.7);

          imgData.data[idx]     = Math.floor(colors[ch][0] * val);
          imgData.data[idx + 1] = Math.floor(colors[ch][1] * val);
          imgData.data[idx + 2] = Math.floor(colors[ch][2] * val);
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }

  /* ======================== STEP 9: VAE DECODE ======================== */
  function renderDecodeViz(container) {
    container.innerHTML = `
      <div class="step-viz">
        <h5 class="clip-section-title">🔄 VAE Decoder — Latente → Pixels</h5>
        <p class="text-sm text-muted mb-2">O decoder convolucional transposto <strong>amplia 8×</strong> o tensor latente:</p>
        <div class="sviz-decode-pipeline">
          <div class="sviz-decode-stage">
            <div class="sviz-decode-box" style="width:40px; height:40px">4×64²</div>
            <span class="text-xs">Latente</span>
          </div>
          <div class="sviz-decode-arrow">→ ConvT 4→512</div>
          <div class="sviz-decode-stage">
            <div class="sviz-decode-box" style="width:52px; height:52px">512×128²</div>
            <span class="text-xs">2× upscale</span>
          </div>
          <div class="sviz-decode-arrow">→ ConvT + ReLU</div>
          <div class="sviz-decode-stage">
            <div class="sviz-decode-box" style="width:64px; height:64px">256×256²</div>
            <span class="text-xs">4× upscale</span>
          </div>
          <div class="sviz-decode-arrow">→ Conv 256→3</div>
          <div class="sviz-decode-stage">
            <div class="sviz-decode-box sviz-decode-final" style="width:80px; height:80px">3×512²</div>
            <span class="text-xs">Imagem RGB!</span>
          </div>
        </div>
        <div class="sviz-stats-row mt-4">
          <div class="sviz-stat">
            <span class="sviz-stat-label">Entrada</span>
            <span class="sviz-stat-value">4 × 64 × 64</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Saída</span>
            <span class="sviz-stat-value">3 × 512 × 512</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Ampliação</span>
            <span class="sviz-stat-value">8× por dimensão</span>
          </div>
          <div class="sviz-stat">
            <span class="sviz-stat-label">Valores de saída</span>
            <span class="sviz-stat-value">786.432 pixels</span>
          </div>
        </div>
        <div class="sviz-formula mt-2">
          <code>x̂ = Decoder(z) → x̂ ∈ ℝ<sup>3×512×512</sup>, valores ∈ [0, 1]</code>
        </div>
        <p class="text-sm text-muted mt-2">O VAE decoder é treinado junto com o encoder para reconstruir imagens com perda mínima. Ele "preenche" os detalhes de alta resolução a partir da informação comprimida do espaço latente.</p>
      </div>
    `;
  }

  /**
   * Animate all bars with data-target-width attribute (used in multiple steps).
   */
  function animateStepBars() {
    document.querySelectorAll('.sviz-freq-bar, .clip-concept-bar').forEach(bar => {
      const target = bar.dataset.targetWidth;
      if (!target) return;
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = target;
        }, parseFloat(bar.style.animationDelay || 0) * 1000 + 100);
      });
    });
  }

  /**
   * Draw a colorful heatmap of the 768-d embedding on a canvas.
   */
  function drawEmbeddingHeatmap(embedding) {
    const canvas = document.getElementById('clip-embedding-heatmap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 768; i++) {
      const v = embedding[i]; // -1..+1
      // Map to color: negative = blue/purple, zero = dark, positive = green/yellow
      let r, g, b;
      if (v < 0) {
        const t = Math.abs(v);
        r = Math.floor(100 * t + 20);
        g = Math.floor(30 * (1 - t));
        b = Math.floor(200 * t + 40);
      } else {
        const t = v;
        r = Math.floor(60 * t + 20);
        g = Math.floor(200 * t + 40);
        b = Math.floor(40 * (1 - t) + 20);
      }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i, 0, 1, h);
    }
  }

  /**
   * Animate concept activation bars filling in.
   */
  function animateConceptBars() {
    document.querySelectorAll('.clip-concept-bar').forEach(bar => {
      const target = bar.dataset.targetWidth;
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = target;
        }, parseFloat(bar.style.animationDelay) * 1000 || 0);
      });
    });
  }

  function resetDiffusion() {
    if (_diffusionAnimInterval) {
      clearInterval(_diffusionAnimInterval);
      _diffusionAnimInterval = null;
    }
    _currentStepIdx = -1;
    _animating = false;
    drawNoiseOnCanvas();
    updateStepButton();

    const badge = document.getElementById('imggen-timestep-badge');
    if (badge) badge.textContent = 'T = 1000';
    const pbar = document.getElementById('imggen-progress-bar');
    if (pbar) pbar.style.width = '0%';
    const nbar = document.getElementById('imggen-noise-bar');
    if (nbar) nbar.style.width = '100%';
    const npct = document.getElementById('imggen-noise-pct');
    if (npct) npct.textContent = '100%';

    const title = document.getElementById('imggen-step-title');
    if (title) title.textContent = '🎲 T=1000 — Ruído Gaussiano Puro';
    const desc = document.getElementById('imggen-step-desc');
    if (desc) desc.textContent = 'Escolha uma forma e clique "Iniciar Difusão".';
    const detail = document.getElementById('imggen-step-detail');
    if (detail) detail.textContent = '';

    document.querySelectorAll('.imggen-step-card').forEach(card => {
      card.classList.remove('imggen-step-active');
    });
  }

  /* ---- Real Image Generation ---- */
  async function handleGenerate() {
    if (_isGenerating) return;

    const prompt = document.getElementById('imggen-prompt')?.value?.trim();
    if (!prompt) {
      Toast.show('Digite um prompt para gerar a imagem.', 'warning');
      return;
    }

    const size = document.getElementById('imggen-size')?.value || '1024x1024';
    const quality = document.getElementById('imggen-quality')?.value || 'auto';

    _isGenerating = true;
    const genBtn = document.getElementById('imggen-generate-btn');
    if (genBtn) {
      genBtn.disabled = true;
      genBtn.textContent = '⏳ Gerando...';
    }

    // Show loading
    const result = document.getElementById('imggen-result');
    const loading = document.getElementById('imggen-loading');
    const output = document.getElementById('imggen-output');
    const error = document.getElementById('imggen-error');

    if (result) result.classList.remove('hidden');
    if (loading) loading.classList.remove('hidden');
    if (output) output.classList.add('hidden');
    if (error) error.classList.add('hidden');

    try {
      const response = await FoundryService.generateImage(prompt, { size, quality });

      if (loading) loading.classList.add('hidden');

      if (response.images && response.images.length > 0) {
        const img = response.images[0];
        const imgEl = document.getElementById('imggen-output-img');
        
        if (img.b64) {
          imgEl.src = `data:image/png;base64,${img.b64}`;
        } else if (img.url) {
          imgEl.src = img.url;
        }

        const usedPrompt = document.getElementById('imggen-used-prompt');
        const usedModel = document.getElementById('imggen-used-model');
        const elapsed = document.getElementById('imggen-elapsed');

        if (usedPrompt) usedPrompt.textContent = img.revisedPrompt || prompt;
        if (usedModel) usedModel.textContent = response.model;
        if (elapsed) elapsed.textContent = response.elapsed;

        if (output) output.classList.remove('hidden');

        // Store for potential gallery save
        imgEl._genData = {
          src: imgEl.src,
          prompt: img.revisedPrompt || prompt,
          model: response.model,
          elapsed: response.elapsed,
        };

        Toast.show('Imagem gerada com sucesso! 🎨', 'success');
        Progress.addXP(30);
      } else {
        throw new Error('Nenhuma imagem retornada pela API.');
      }
    } catch (err) {
      if (loading) loading.classList.add('hidden');
      if (error) {
        error.classList.remove('hidden');
        const errMsg = document.getElementById('imggen-error-msg');
        if (errMsg) errMsg.textContent = `Erro: ${err.message}`;
      }
      Toast.show(`Erro na geração: ${err.message}`, 'error');
    } finally {
      _isGenerating = false;
      if (genBtn) {
        genBtn.disabled = false;
        genBtn.textContent = '🎨 Gerar Imagem';
      }
    }
  }

  function handleDownload() {
    const imgEl = document.getElementById('imggen-output-img');
    if (!imgEl || !imgEl.src) return;

    const a = document.createElement('a');
    a.href = imgEl.src;
    a.download = `aiforall-generated-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    Toast.show('Download iniciado! ⬇️', 'success');
  }

  function handleSaveToGallery() {
    const imgEl = document.getElementById('imggen-output-img');
    if (!imgEl || !imgEl._genData) return;

    _gallery.push(imgEl._genData);
    Toast.show('Imagem salva na galeria! 🖼️', 'success');
    Progress.addXP(10);
  }

  function refreshGallery() {
    const grid = document.getElementById('imggen-gallery-grid');
    if (!grid) return;

    if (_gallery.length === 0) {
      grid.innerHTML = `
        <div class="imggen-gallery-empty">
          <p class="text-muted">Nenhuma imagem na galeria ainda.</p>
          <p class="text-sm text-muted">Gere uma imagem na aba "🎨 Gerar" e clique "💾 Salvar na Galeria".</p>
        </div>
      `;
    } else {
      grid.innerHTML = _gallery.map((img, i) => `
        <div class="imggen-gallery-item">
          <img src="${img.src}" alt="${img.prompt}" class="imggen-gallery-img" />
          <div class="imggen-gallery-meta">
            <p class="text-sm">${img.prompt.substring(0, 80)}${img.prompt.length > 80 ? '...' : ''}</p>
            <p class="text-xs text-muted">${img.model} · ${img.elapsed}ms</p>
          </div>
        </div>
      `).join('');
    }
  }

  /* ---- Quiz Handler ---- */
  function handleQuizAnswer(opt) {
    const qi = parseInt(opt.dataset.qi);
    const oi = parseInt(opt.dataset.oi);
    const quiz = ImageGenEngine.QUIZ;
    const q = quiz[qi];
    if (!q) return;

    const correct = oi === q.correct;

    // Save answer
    const state = Progress.getState();
    if (!state.modules['image-gen']) state.modules['image-gen'] = {};
    if (!state.modules['image-gen'].quizAnswers) state.modules['image-gen'].quizAnswers = {};
    state.modules['image-gen'].quizAnswers[qi] = { chosen: oi, correct };
    Progress.saveState(state);

    // Update UI
    const card = opt.closest('.quiz-card');
    card.classList.add(correct ? 'quiz-correct' : 'quiz-wrong');

    card.querySelectorAll('.quiz-opt').forEach((o, idx) => {
      o.disabled = true;
      if (idx === q.correct) o.classList.add('correct');
      if (idx === oi && !correct) o.classList.add('wrong');
    });

    // Add explanation
    const explanation = document.createElement('p');
    explanation.className = 'quiz-explanation mt-2 text-sm';
    explanation.textContent = `${correct ? '✅' : '❌'} ${q.explanation}`;
    card.appendChild(explanation);

    if (correct) {
      Progress.addXP(15);
      Toast.show('Correto! +15 XP 🎉', 'success');
    } else {
      Toast.show('Incorreto. Veja a explicação abaixo.', 'error');
    }

    // Update score
    const answered = state.modules['image-gen'].quizAnswers;
    const totalCorrect = Object.values(answered).filter(a => a.correct).length;
    const scoreNum = document.querySelector('.quiz-score-num');
    if (scoreNum) scoreNum.textContent = totalCorrect;
  }

  return {
    render,
    initInteractions,
  };
})();
