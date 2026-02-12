/* ============================================
   AIFORALL V2 — LLM Demo
   Pipeline visualization, text generation,
   temperature/topK playground, model comparison
   ============================================ */

const LLMDemo = (() => {

  let generationInterval = null;

  /** Render full module */
  function render() {
    const state = Progress.getState();
    const mState = state.modules.llm || {};

    return `
      <div class="page module-page">
        <section class="section" style="padding-top: var(--space-8);">
          <div class="container">
            <a href="#/" class="btn btn-ghost btn-sm mb-4" style="font-size: 0.8rem;">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 2.2rem;">🤖</span>
              <div>
                <h1>Large Language Models</h1>
                <p>O pipeline completo: de texto a previsão do próximo token</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="pipeline">🔄 Pipeline</button>
              <button class="tab" data-tab="generate">✨ Gerar Texto</button>
              <button class="tab" data-tab="playground">🎛️ Playground</button>
              <button class="tab" data-tab="models">📊 Modelos</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-pipeline" class="tab-content hidden">${renderPipelineTab()}</div>
            <div id="tab-generate" class="tab-content hidden">${renderGenerateTab()}</div>
            <div id="tab-playground" class="tab-content hidden">${renderPlaygroundTab()}</div>
            <div id="tab-models" class="tab-content hidden">${renderModelsTab()}</div>
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
          <h3>🤖 O que é um LLM?</h3>
          <p>Um <strong>Large Language Model</strong> é um modelo de IA treinado em enormes quantidades de texto 
          para prever o <em>próximo token</em>. Apesar da aparente simplicidade, essa tarefa faz o modelo aprender 
          gramática, fatos, raciocínio e até código.</p>
        </div>

        <div class="card-flat mb-8">
          <h3>🔄 O Pipeline</h3>
          <div class="llm-pipeline-flow">
            ${['Texto', 'Tokenização', 'Embedding\n+ Posição', 'N× Transformer\nBlocks', 'Linear\n+ Softmax', 'Próximo\nToken'].map((s, i, arr) => `
              <div class="pipeline-node">
                <span>${['📝', '🧩', '📐', '🔄', '📊', '🎯'][i]}</span>
                <span class="text-xs">${s.replace('\n', '<br>')}</span>
              </div>
              ${i < arr.length - 1 ? '<span class="pipeline-arrow">→</span>' : ''}
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-8">
          <div class="card-flat">
            <h4>🧩 1. Tokenização</h4>
            <p class="text-sm">O texto é dividido em subpalavras (tokens) usando BPE. 
            Cada token recebe um ID numérico do vocabulário (~50K-100K tokens).</p>
          </div>
          <div class="card-flat">
            <h4>📐 2. Embedding + Posição</h4>
            <p class="text-sm">Cada token ID é convertido em um vetor denso (ex: 12.288 dimensões no GPT-3). 
            Positional Encoding é adicionado para saber a ordem.</p>
          </div>
          <div class="card-flat">
            <h4>🔄 3. Transformer Blocks</h4>
            <p class="text-sm">A sequência passa por N camadas (96 no GPT-3), cada uma com: 
            Self-Attention → Add & Norm → Feed-Forward → Add & Norm.</p>
          </div>
          <div class="card-flat">
            <h4>📊 4. Linear + Softmax</h4>
            <p class="text-sm">O output do último token é projetado para o vocabulário inteiro. 
            Softmax transforma em probabilidades → amostragem do próximo token.</p>
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🌡️ Temperature & Sampling</h3>
          <p><strong>Temperature</strong> controla a "criatividade":</p>
          <ul class="mt-2">
            <li><strong>Temp = 0</strong> → sempre escolhe o mais provável (determinístico, repetitivo)</li>
            <li><strong>Temp = 0.7</strong> → bom equilíbrio (criativo mas coerente)</li>
            <li><strong>Temp = 1.5+</strong> → muito aleatório (pode ficar incoerente)</li>
          </ul>
          <p class="mt-4"><strong>Top-K</strong>: considera apenas os K tokens mais prováveis.</p>
          <p><strong>Top-P (Nucleus)</strong>: considera tokens até acumular P% de probabilidade.</p>
        </div>

        <div class="card-flat">
          <h3>🔁 Autoregressive Generation</h3>
          <p>O modelo gera <strong>um token por vez</strong>, sempre alimentando sua própria saída de volta como entrada. 
          Cada geração requer passar pelo pipeline inteiro novamente.</p>
          <p class="text-sm text-muted mt-2">É por isso que LLMs são "lentos" para gerar — cada token precisa de uma passada completa pela rede.</p>
        </div>
      </div>
    `;
  }

  function renderPipelineTab() {
    const aiReady = typeof FoundryService !== 'undefined' && FoundryService.isConfigured();
    const steps = LLMEngine.LLM_PIPELINE_STEPS;
    return `
      <div class="pipeline-section">
        <div class="card-flat mb-4">
          <h3>🔄 Pipeline Passo a Passo</h3>
          <p class="text-sm text-muted">Digite um texto e percorra cada etapa do processamento de um LLM.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="pipeline-input" class="input" value="The cat sat on"
              placeholder="Digite um texto..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary" id="pipeline-run-btn">🚀 Iniciar Pipeline</button>
            <button class="btn btn-ghost" id="pipeline-reset-btn" style="display:none;">🔄 Reset</button>
          </div>
          <div class="llm-step-controls mt-4" id="llm-step-controls" style="display:none;">
            <button class="btn btn-primary" id="llm-next-step-btn">Próximo Passo →</button>
            <span class="llm-step-counter text-sm text-muted" id="llm-step-counter">Passo 0 / ${steps.length}</span>
          </div>
        </div>

        <!-- Data flow visualizer -->
        <div id="llm-pipeline-flow-state" class="llm-pipeline-flow-state" style="display:none;">
          <div class="llm-flow-nodes">
            ${steps.map((s, i) => `
              <div class="llm-flow-node" id="llm-flow-node-${i}" data-step="${i}">
                <span class="llm-flow-icon">${s.icon}</span>
                <span class="llm-flow-label">${s.title.split(' ')[0]}</span>
              </div>
              ${i < steps.length - 1 ? '<span class="llm-flow-arrow">→</span>' : ''}
            `).join('')}
          </div>
          <div class="llm-flow-progress-wrap">
            <div class="llm-flow-progress" id="llm-flow-progress" style="width:0%"></div>
          </div>
        </div>

        <!-- Step info panel -->
        <div id="llm-step-panel" class="card-flat mt-4" style="display:none;">
          <h4 id="llm-step-title"></h4>
          <p id="llm-step-desc"></p>
          <p id="llm-step-detail" class="text-sm text-muted mt-2"></p>
          <div id="llm-step-viz" class="llm-step-viz"></div>
        </div>

        <!-- Step reference cards -->
        <div class="flex items-center justify-between mb-4 mt-8">
          <h3 style="margin:0;">📋 Etapas do Pipeline LLM</h3>
          <button class="btn btn-ghost btn-sm" id="llm-toggle-steps" style="font-size:0.8rem;">
            ▼ Expandir/Recolher
          </button>
        </div>
        <div class="llm-steps-grid" id="llm-steps-grid">
          ${steps.map((s, i) => `
            <div class="card-flat llm-step-ref-card" id="llm-ref-card-${i}">
              <div class="llm-step-num">${i + 1}</div>
              <div>
                <h4>${s.icon} ${s.title}</h4>
                <p class="text-sm">${s.desc}</p>
                <p class="text-sm text-muted mt-1">${s.detail}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Keep Real Pipeline button at bottom -->
        <div class="card-flat mt-8" id="llm-real-pipeline-section">
          <h3>⚡ Pipeline com IA Real</h3>
          <p class="text-sm text-muted mb-4">Veja o pipeline executado com um modelo real via API.</p>
          <div class="flex gap-4 items-center flex-wrap">
            <input id="pipeline-real-input" class="input" value="The cat sat on"
              placeholder="Digite um texto..." style="flex:1;min-width:200px;">
            <button class="btn ${aiReady ? 'btn-accent' : 'btn-ghost'}" id="pipeline-real-btn" ${!aiReady ? 'disabled title="Configure a API em ⚙️ Configurações"' : ''}>⚡ Pipeline Real</button>
          </div>
          ${!aiReady ? '<p class="text-xs text-muted mt-2">💡 <a href="#/settings" style="color:var(--primary);">Configure uma API</a> para o pipeline com IA real.</p>' : ''}
          <div id="pipeline-container" class="mt-4"></div>
        </div>
      </div>
    `;
  }

  function renderGenerateTab() {
    const aiReady = typeof FoundryService !== 'undefined' && FoundryService.isConfigured();
    return `
      <div class="generate-section">
        <div class="card-flat mb-4">
          <h3>✨ Geração de Texto</h3>
          <p class="text-sm text-muted">Veja geração token a token (simulada) ou use um modelo real.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="gen-input" class="input" value="The cat" 
              placeholder="Prompt..." style="flex:1;min-width:200px;">
            <div class="flex gap-2 items-center">
              <label class="text-sm">Tokens:</label>
              <input id="gen-count" type="number" class="input" value="6" min="1" max="20" style="width:60px;">
            </div>
            <button class="btn btn-primary" id="gen-run-btn">▶️ Gerar (Simulado)</button>
            <button class="btn ${aiReady ? 'btn-accent' : 'btn-ghost'}" id="gen-ai-btn" ${!aiReady ? 'disabled title="Configure a API em ⚙️ Configurações"' : ''}>⚡ Gerar com IA Real</button>
            <button class="btn btn-ghost" id="gen-stop-btn" disabled>⏹️ Parar</button>
          </div>
          ${!aiReady ? '<p class="text-xs text-muted mt-2">💡 <a href="#/settings" style="color:var(--primary);">Configure uma API</a> para habilitar geração com IA real.</p>' : ''}
        </div>
        <div id="gen-output" class="mt-4"></div>
        <div id="gen-steps" class="mt-4"></div>
      </div>
    `;
  }

  function renderPlaygroundTab() {
    return `
      <div class="playground-section">
        <div class="card-flat mb-4">
          <h3>🎛️ Playground de Sampling</h3>
          <p class="text-sm text-muted">Ajuste Temperature e Top-K para ver como afetam a distribuição de probabilidade.</p>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="card-flat">
            <h4>Controles</h4>
            <div class="mt-4">
              <label class="text-sm font-bold">Palavra contexto:</label>
              <input id="pg-word" class="input mt-2" value="the" placeholder="Ex: the, cat, is...">
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold">🌡️ Temperature: <span id="pg-temp-val">1.0</span></label>
              </div>
              <input id="pg-temp" type="range" min="0" max="2" step="0.1" value="1.0" class="slider mt-2">
              <div class="flex justify-between text-xs text-muted">
                <span>0 (Greedy)</span><span>1.0 (Normal)</span><span>2.0 (Random)</span>
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold">🎯 Top-K: <span id="pg-topk-val">5</span></label>
              </div>
              <input id="pg-topk" type="range" min="1" max="10" step="1" value="5" class="slider mt-2">
              <div class="flex justify-between text-xs text-muted">
                <span>1 (só o melhor)</span><span>10 (mais opções)</span>
              </div>
            </div>
            <button class="btn btn-primary mt-4" id="pg-run-btn" style="width:100%;">Atualizar distribuição</button>
          </div>
          <div class="card-flat">
            <h4>Distribuição de Probabilidade</h4>
            <div id="pg-chart" class="mt-4"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderModelsTab() {
    return `
      <div class="models-section">
        <div class="card-flat mb-4">
          <h3>📊 Comparação de Modelos</h3>
          <p class="text-sm text-muted">Veja como os LLMs evoluíram ao longo dos anos.</p>
        </div>

        <div style="overflow-x:auto;">
          <table class="attn-step-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Parâmetros</th>
                <th>Layers</th>
                <th>d_model</th>
                <th>Heads</th>
                <th>Vocab</th>
                <th>Ano</th>
              </tr>
            </thead>
            <tbody>
              ${LLMEngine.MODEL_SIZES.map(m => `
                <tr>
                  <td class="font-bold">${m.name}</td>
                  <td><span class="badge badge-primary">${m.params}</span></td>
                  <td>${m.layers}</td>
                  <td>${m.dModel}</td>
                  <td>${m.heads}</td>
                  <td>${m.vocab}</td>
                  <td>${m.year}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card-flat mt-6">
          <h4>📈 Escala de Parâmetros (visual)</h4>
          <div class="mt-4">
            ${[
              { name: 'GPT-2', val: 1.5, color: '#6366f1' },
              { name: 'LLaMA 2 (70B)', val: 70, color: '#06b6d4' },
              { name: 'GPT-3 (175B)', val: 175, color: '#f59e0b' },
              { name: 'GPT-4 (~1.8T)', val: 1800, color: '#ef4444' },
            ].map(m => {
              const pct = Math.min((Math.log10(m.val) / Math.log10(1800)) * 100, 100);
              return `
              <div class="flex items-center gap-3 mb-3">
                <span class="text-sm font-bold" style="width:120px;">${m.name}</span>
                <div class="progress-bar" style="flex:1;height:14px;">
                  <div class="progress-fill" style="width:${pct}%;background:${m.color};"></div>
                </div>
                <span class="text-xs font-mono" style="width:60px;">${m.val >= 1000 ? (m.val / 1000).toFixed(1) + 'T' : m.val + 'B'}</span>
              </div>`;
            }).join('')}
          </div>
          <p class="text-xs text-muted mt-2">Escala logarítmica. GPT-4 é ~1200× maior que GPT-2.</p>
        </div>
      </div>
    `;
  }

  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — LLM</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre Large Language Models!</p>
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
      question: 'Qual é a tarefa fundamental de treinamento de um LLM?',
      options: [
        'Classificar textos em categorias',
        'Prever o próximo token dada uma sequência',
        'Traduzir entre idiomas',
        'Encontrar erros gramaticais no texto',
      ],
      correct: 1,
      explanation: 'LLMs são treinados para prever o próximo token (next-token prediction). Apesar de simples, essa tarefa faz o modelo aprender linguagem, fatos, raciocínio e muito mais.',
    },
    {
      question: 'O que acontece quando a Temperature é 0?',
      options: [
        'O modelo gera texto aleatório',
        'O modelo sempre escolhe o token mais provável (greedy)',
        'O modelo para de funcionar',
        'O modelo gera respostas mais criativas',
      ],
      correct: 1,
      explanation: 'Com Temperature = 0, o modelo sempre escolhe o token com maior probabilidade. Isso dá respostas determinísticas mas pode ser repetitivo.',
    },
    {
      question: 'Quantos parâmetros tem o GPT-3?',
      options: [
        '1.5 bilhão',
        '13 bilhões',
        '175 bilhões',
        '1 trilhão',
      ],
      correct: 2,
      explanation: 'O GPT-3 tem 175 bilhões de parâmetros, distribuídos em 96 camadas de transformer com 96 cabeças de atenção cada.',
    },
    {
      question: 'O que é "autoregressive generation"?',
      options: [
        'Gerar todo o texto de uma vez',
        'Gerar um token por vez, usando a saída anterior como entrada',
        'Treinar o modelo automaticamente',
        'Fazer o modelo corrigir seus próprios erros',
      ],
      correct: 1,
      explanation: 'Geração autorregressiva significa gerar um token por vez, sempre adicionando o token gerado de volta à entrada para prever o próximo. Por isso LLMs parecem "digitar" a resposta.',
    },
    {
      question: 'O que o Top-K sampling faz?',
      options: [
        'Seleciona os K textos mais longos',
        'Limita a amostragem aos K tokens mais prováveis',
        'Divide o texto em K partes',
        'Treina K modelos diferentes',
      ],
      correct: 1,
      explanation: 'Top-K filtra o vocabulário para considerar apenas os K tokens com maior probabilidade, redistribuindo a massa probabilística entre eles. Evita tokens raros/incoerentes.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */

  /* =================== State for step-by-step pipeline =================== */
  let pipelineState = { active: false, currentStep: -1, data: null };

  function initInteractions() {
    // Pipeline step-by-step
    document.getElementById('pipeline-run-btn')?.addEventListener('click', startPipeline);
    document.getElementById('pipeline-reset-btn')?.addEventListener('click', resetPipeline);
    document.getElementById('llm-next-step-btn')?.addEventListener('click', advancePipelineStep);

    // Toggle steps grid expand/collapse
    document.getElementById('llm-toggle-steps')?.addEventListener('click', () => {
      const grid = document.getElementById('llm-steps-grid');
      if (!grid) return;
      grid.classList.toggle('expanded');
      const btn = document.getElementById('llm-toggle-steps');
      if (grid.classList.contains('expanded')) {
        btn.textContent = '▲ Recolher';
      } else {
        btn.textContent = '▼ Expandir';
      }
    });

    // Real pipeline
    document.getElementById('pipeline-real-btn')?.addEventListener('click', runRealPipeline);

    // Generate
    document.getElementById('gen-run-btn')?.addEventListener('click', runGeneration);
    document.getElementById('gen-ai-btn')?.addEventListener('click', runAIGeneration);
    document.getElementById('gen-stop-btn')?.addEventListener('click', stopGeneration);

    // Playground
    document.getElementById('pg-run-btn')?.addEventListener('click', updatePlayground);
    document.getElementById('pg-temp')?.addEventListener('input', (e) => {
      document.getElementById('pg-temp-val').textContent = e.target.value;
    });
    document.getElementById('pg-topk')?.addEventListener('input', (e) => {
      document.getElementById('pg-topk-val').textContent = e.target.value;
    });

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Step-by-Step Pipeline =================== */

  function startPipeline() {
    const input = document.getElementById('pipeline-input');
    const text = input?.value?.trim();
    if (!text) return;

    // Generate all step data
    pipelineState = {
      active: true,
      currentStep: -1,
      data: LLMEngine.generatePipelineStepData(text),
    };

    // Show controls
    document.getElementById('llm-step-controls').style.display = 'flex';
    document.getElementById('llm-pipeline-flow-state').style.display = 'block';
    document.getElementById('llm-step-panel').style.display = 'block';
    document.getElementById('pipeline-run-btn').style.display = 'none';
    document.getElementById('pipeline-reset-btn').style.display = '';

    // Reset flow nodes
    document.querySelectorAll('.llm-flow-node').forEach(n => {
      n.classList.remove('active', 'done');
    });
    document.getElementById('llm-flow-progress').style.width = '0%';

    // Reset reference cards
    document.querySelectorAll('.llm-step-ref-card').forEach(c => {
      c.classList.remove('active', 'done');
    });

    // Show first step
    advancePipelineStep();
  }

  function resetPipeline() {
    pipelineState = { active: false, currentStep: -1, data: null };
    document.getElementById('llm-step-controls').style.display = 'none';
    document.getElementById('llm-pipeline-flow-state').style.display = 'none';
    document.getElementById('llm-step-panel').style.display = 'none';
    document.getElementById('pipeline-run-btn').style.display = '';
    document.getElementById('pipeline-reset-btn').style.display = 'none';
    document.querySelectorAll('.llm-flow-node').forEach(n => n.classList.remove('active', 'done'));
    document.querySelectorAll('.llm-step-ref-card').forEach(c => c.classList.remove('active', 'done'));
  }

  function advancePipelineStep() {
    if (!pipelineState.active) return;
    const steps = LLMEngine.LLM_PIPELINE_STEPS;
    const prev = pipelineState.currentStep;

    if (prev >= steps.length - 1) return; // already at end

    // Mark previous as done
    if (prev >= 0) {
      const prevNode = document.getElementById(`llm-flow-node-${prev}`);
      if (prevNode) { prevNode.classList.remove('active'); prevNode.classList.add('done'); }
      const prevCard = document.getElementById(`llm-ref-card-${prev}`);
      if (prevCard) { prevCard.classList.remove('active'); prevCard.classList.add('done'); }
    }

    pipelineState.currentStep = prev + 1;
    const idx = pipelineState.currentStep;
    const step = steps[idx];

    // Update flow node
    const node = document.getElementById(`llm-flow-node-${idx}`);
    if (node) node.classList.add('active');
    const refCard = document.getElementById(`llm-ref-card-${idx}`);
    if (refCard) { refCard.classList.add('active'); refCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

    // Progress bar
    const pct = ((idx + 1) / steps.length) * 100;
    document.getElementById('llm-flow-progress').style.width = pct + '%';

    // Counter
    document.getElementById('llm-step-counter').textContent = `Passo ${idx + 1} / ${steps.length}`;

    // Step info
    document.getElementById('llm-step-title').textContent = `${step.icon} ${step.title}`;
    document.getElementById('llm-step-desc').textContent = step.desc;
    document.getElementById('llm-step-detail').textContent = step.detail;

    // Rich visualization
    const vizContainer = document.getElementById('llm-step-viz');
    renderLLMStepVisualization(vizContainer, step, idx, pipelineState.data);

    // Update button
    const btn = document.getElementById('llm-next-step-btn');
    if (idx >= steps.length - 1) {
      btn.textContent = '✅ Pipeline Completo!';
      btn.disabled = true;
    } else {
      btn.textContent = `${steps[idx + 1].icon} Próximo: ${steps[idx + 1].title} →`;
      btn.disabled = false;
    }

    // Scroll to panel
    document.getElementById('llm-step-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* =================== Step Visualization Renderers =================== */

  function renderLLMStepVisualization(container, step, idx, data) {
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'step-viz';
    container.appendChild(div);

    switch (step.id) {
      case 'input':     renderInputViz(div, data); break;
      case 'tokenize':  renderTokenizeViz(div, data); break;
      case 'embedding': renderEmbeddingViz(div, data); break;
      case 'positional': renderPositionalViz(div, data); break;
      case 'attention': renderAttentionViz(div, data); break;
      case 'addnorm1':  renderAddNormViz(div, data); break;
      case 'ffn':       renderFFNViz(div, data); break;
      case 'layers':    renderLayersViz(div, data); break;
      case 'linear':    renderLinearViz(div, data); break;
      case 'softmax':   renderSoftmaxViz(div, data); break;
    }
  }

  /* ---- Step 0: Input Text ---- */
  function renderInputViz(el, data) {
    const text = data.input;
    const chars = text.split('');
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Texto de entrada</h5>
        <div class="llm-input-display">
          ${chars.map((c, i) => `<span class="llm-char" style="animation-delay:${i * 40}ms">${c === ' ' ? '⎵' : escapeHtml(c)}</span>`).join('')}
        </div>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Caracteres</span><span class="sviz-stat-value">${text.length}</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Palavras</span><span class="sviz-stat-value">${text.trim().split(/\s+/).length}</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Bytes (UTF-8)</span><span class="sviz-stat-value">${new TextEncoder().encode(text).length}</span></div>
      </div>
      <div class="sviz-formula mt-4">string = "${escapeHtml(text)}" → [${chars.map(c => c.charCodeAt(0)).join(', ')}]  (Unicode codepoints)</div>
    `;
  }

  /* ---- Step 1: Tokenization ---- */
  function renderTokenizeViz(el, data) {
    const tokens = data.bpeTokens;
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Tokens BPE</h5>
        <div class="flex flex-wrap gap-2">
          ${tokens.map((t, i) => `
            <div class="token-chip" style="--chip-color:${t.isContinuation ? 'var(--accent)' : 'var(--primary)'};animation:tokenPop 0.3s ease ${i * 60}ms both;">
              <span>${t.isContinuation ? '##' : ''}${escapeHtml(t.surface)}</span>
              <span class="text-xs" style="opacity:0.7">ID:${t.id}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Total tokens</span><span class="sviz-stat-value">${tokens.length}</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Vocab size</span><span class="sviz-stat-value">50.257</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Algoritmo</span><span class="sviz-stat-value">BPE</span></div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Como funciona o BPE</h5>
        <div class="llm-bpe-steps">
          <div class="llm-bpe-step"><span class="llm-bpe-num">1</span> Dividir texto em caracteres</div>
          <div class="llm-bpe-arrow">↓</div>
          <div class="llm-bpe-step"><span class="llm-bpe-num">2</span> Encontrar par mais frequente</div>
          <div class="llm-bpe-arrow">↓</div>
          <div class="llm-bpe-step"><span class="llm-bpe-num">3</span> Unir par → novo token</div>
          <div class="llm-bpe-arrow">↓</div>
          <div class="llm-bpe-step"><span class="llm-bpe-num">4</span> Repetir até vocab_size</div>
        </div>
      </div>
      <div class="sviz-formula mt-4">[${tokens.map(t => t.id).join(', ')}] → tensor int64 shape (1, ${tokens.length})</div>
    `;
  }

  /* ---- Step 2: Embedding Lookup ---- */
  function renderEmbeddingViz(el, data) {
    // Draw embedding heatmap on canvas
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Tabela de Embedding</h5>
        <div class="llm-emb-diagram">
          <div class="llm-emb-table-viz">
            <div class="llm-emb-header">Embedding Matrix</div>
            <div class="llm-emb-dims">50.257 × 12.288</div>
            <canvas id="llm-emb-heatmap" width="180" height="120"></canvas>
          </div>
          <div class="llm-emb-arrow">→</div>
          <div class="llm-emb-result">
            <div class="llm-emb-header">Vetores de Saída</div>
            ${data.embeddings.slice(0, 5).map(e => `
              <div class="llm-emb-row">
                <span class="llm-emb-token">${escapeHtml(e.token)}</span>
                <span class="font-mono text-xs">[${e.vec.slice(0, 4).map(v => v.toFixed(2)).join(', ')}, …]</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Dimensões</span><span class="sviz-stat-value">12.288</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Parâmetros</span><span class="sviz-stat-value">~618M</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Output shape</span><span class="sviz-stat-value">(1, ${data.bpeTokens.length}, 12288)</span></div>
      </div>
      <div class="sviz-formula mt-4">E[token_id] → ℝ^12288   (lookup na tabela, sem multiplicação)</div>
    `;
    // Draw heatmap
    setTimeout(() => drawEmbHeatmap('llm-emb-heatmap', data.embeddings), 50);
  }

  function drawEmbHeatmap(canvasId, embeddings) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rows = embeddings.length;
    const cols = 12;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = (embeddings[r].vec[c] + 1) / 2; // normalize to 0-1
        const hue = 240 - v * 240; // blue→red
        ctx.fillStyle = `hsl(${hue}, 70%, ${40 + v * 30}%)`;
        ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
      }
    }
  }

  /* ---- Step 3: Positional Encoding ---- */
  function renderPositionalViz(el, data) {
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Curvas Sinusoidais</h5>
        <canvas id="llm-pos-canvas" width="360" height="140"></canvas>
        <div class="llm-pos-legend mt-2">
          <span><span style="color:#6366f1;">●</span> sin (dims pares)</span>
          <span><span style="color:#f59e0b;">●</span> cos (dims ímpares)</span>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Embedding + Posição = Input Final</h5>
        <div class="llm-pos-addition">
          <div class="llm-pos-box">
            <span class="text-xs font-bold">Embedding</span>
            <span class="font-mono text-xs">[${data.embeddings[0]?.vec.slice(0, 3).map(v => v.toFixed(2)).join(', ')}, …]</span>
          </div>
          <span class="llm-pos-op">+</span>
          <div class="llm-pos-box">
            <span class="text-xs font-bold">Pos. Enc.</span>
            <span class="font-mono text-xs">[${data.posEncodings[0]?.slice(0, 3).map(v => v.toFixed(2)).join(', ')}, …]</span>
          </div>
          <span class="llm-pos-op">=</span>
          <div class="llm-pos-box llm-pos-result">
            <span class="text-xs font-bold">Input</span>
            <span class="font-mono text-xs">[${data.embeddings[0]?.vec.slice(0, 3).map((v, i) => (v + data.posEncodings[0][i]).toFixed(2)).join(', ')}, …]</span>
          </div>
        </div>
      </div>
      <div class="sviz-formula mt-4">x_pos = Embedding(token) + PE(position)   ∈ ℝ^(seq_len × d_model)</div>
    `;
    setTimeout(() => drawPosEncodingCanvas('llm-pos-canvas', data.posEncodings), 50);
  }

  function drawPosEncodingCanvas(canvasId, posEncodings) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-2').trim() || '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const numPos = posEncodings.length;
    const dims = Math.min(posEncodings[0]?.length || 4, 6);
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y <= 4; y++) {
      ctx.beginPath();
      ctx.moveTo(0, h * y / 4);
      ctx.lineTo(w, h * y / 4);
      ctx.stroke();
    }

    // Plot each dimension
    for (let d = 0; d < dims; d++) {
      ctx.strokeStyle = colors[d % colors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let pos = 0; pos < 50; pos++) {
        const x = (pos / 50) * w;
        const div = Math.pow(10000, (2 * Math.floor(d / 2)) / 12);
        const val = d % 2 === 0 ? Math.sin(pos / div) : Math.cos(pos / div);
        const y = h / 2 - val * (h / 2 - 10);
        if (pos === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Mark token positions
    for (let i = 0; i < numPos && i < 10; i++) {
      const x = (i / 50) * w;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---- Step 4: Self-Attention ---- */
  function renderAttentionViz(el, data) {
    const tokens = data.attnTokens;
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Projeções Q, K, V</h5>
        <div class="sviz-crossattn">
          <div class="sviz-ca-side">
            <div class="sviz-ca-label">Query (Q)</div>
            <div class="sviz-ca-tensor">x · W_Q</div>
          </div>
          <div class="sviz-ca-side">
            <div class="sviz-ca-label">Key (K)</div>
            <div class="sviz-ca-tensor">x · W_K</div>
          </div>
          <div class="sviz-ca-side">
            <div class="sviz-ca-label">Value (V)</div>
            <div class="sviz-ca-tensor">x · W_V</div>
          </div>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Mapa de Atenção (causal mask)</h5>
        <div class="llm-attn-map-wrap">
          <div class="llm-attn-labels-col">
            ${tokens.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
          <canvas id="llm-attn-canvas" width="${tokens.length * 36}" height="${tokens.length * 36}"></canvas>
          <div class="llm-attn-labels-row">
            ${tokens.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="llm-attn-legend mt-2">
          <span>0.0</span>
          <div class="llm-attn-gradient"></div>
          <span>1.0</span>
          <span class="text-xs text-muted" style="margin-left:0.5rem;">▲ Triangular inferior = causal mask</span>
        </div>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Cabeças</span><span class="sviz-stat-value">96</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">d_head</span><span class="sviz-stat-value">128</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Complexidade</span><span class="sviz-stat-value">O(n²·d)</span></div>
      </div>
      <div class="sviz-formula mt-4">Attention(Q,K,V) = softmax(Q·K^T / √128) × V</div>
    `;
    setTimeout(() => drawAttnHeatmap('llm-attn-canvas', data.attnScores, tokens), 50);
  }

  function drawAttnHeatmap(canvasId, scores, tokens) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const n = scores.length;
    const cell = canvas.width / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = scores[i][j];
        if (v === 0) {
          ctx.fillStyle = 'rgba(50,50,50,0.3)';
        } else {
          const alpha = Math.min(v * 2.5, 1);
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
        }
        ctx.fillRect(j * cell, i * cell, cell - 1, cell - 1);
        // Show value
        if (v > 0.01) {
          ctx.fillStyle = v > 0.3 ? '#fff' : 'rgba(255,255,255,0.6)';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(v.toFixed(2), j * cell + cell / 2, i * cell + cell / 2);
        }
      }
    }
  }

  /* ---- Step 5: Add & Norm ---- */
  function renderAddNormViz(el, data) {
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Conexão Residual + LayerNorm</h5>
        <div class="llm-residual-diagram">
          <div class="llm-res-box">x<br><span class="text-xs">input</span></div>
          <div class="llm-res-path">
            <div class="llm-res-main-path">
              <div class="llm-res-arrow">→</div>
              <div class="llm-res-block">Self-Attention</div>
              <div class="llm-res-arrow">→</div>
            </div>
            <div class="llm-res-skip">
              <span class="text-xs">skip connection</span>
              <div class="llm-res-skip-line"></div>
            </div>
          </div>
          <div class="llm-res-op">+</div>
          <div class="llm-res-arrow">→</div>
          <div class="llm-res-block llm-res-ln">LayerNorm</div>
          <div class="llm-res-arrow">→</div>
          <div class="llm-res-box llm-res-output">out</div>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Por que Residual?</h5>
        <div class="llm-why-grid">
          <div class="llm-why-card">
            <span>🚀</span>
            <span class="text-sm">Gradientes fluem direto por 96 camadas</span>
          </div>
          <div class="llm-why-card">
            <span>🛡️</span>
            <span class="text-sm">Previne vanishing / exploding gradients</span>
          </div>
          <div class="llm-why-card">
            <span>📚</span>
            <span class="text-sm">Cada camada aprende o "delta" — o que adicionar</span>
          </div>
        </div>
      </div>
      <div class="sviz-formula mt-4">output = LayerNorm(x + SubLayer(x))     onde μ = E[x], σ² = Var[x]</div>
    `;
  }

  /* ---- Step 6: Feed-Forward Network ---- */
  function renderFFNViz(el, data) {
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Rede Feed-Forward (MLP)</h5>
        <div class="llm-ffn-diagram">
          <div class="llm-ffn-layer">
            <div class="llm-ffn-label">Input</div>
            <div class="llm-ffn-bar" style="width:60px;background:var(--primary);">12.288</div>
          </div>
          <div class="llm-ffn-arrow">→ W₁ →</div>
          <div class="llm-ffn-layer">
            <div class="llm-ffn-label">Expansão 4×</div>
            <div class="llm-ffn-bar" style="width:200px;background:var(--accent);">49.152</div>
          </div>
          <div class="llm-ffn-arrow">→ GELU →</div>
          <div class="llm-ffn-layer">
            <div class="llm-ffn-label">Projeção</div>
            <div class="llm-ffn-bar" style="width:60px;background:var(--primary);">12.288</div>
          </div>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Ativação GELU</h5>
        <canvas id="llm-gelu-canvas" width="280" height="120"></canvas>
        <p class="text-xs text-muted mt-2">GELU(x) = x · Φ(x) — versão suave de ReLU, usada em GPT e BERT.</p>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Parâmetros/camada</span><span class="sviz-stat-value">~1.2B</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">d_ff</span><span class="sviz-stat-value">49.152</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">FLOPs</span><span class="sviz-stat-value">~2 × 12K × 49K</span></div>
      </div>
      <div class="sviz-formula mt-4">FFN(x) = GELU(x · W₁ + b₁) · W₂ + b₂</div>
    `;
    setTimeout(() => drawGeluCanvas('llm-gelu-canvas'), 50);
  }

  function drawGeluCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-2').trim() || '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

    // GELU curve
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = (px / w) * 8 - 4; // range -4 to 4
      // GELU approximation
      const gelu = 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
      const y = h / 2 - gelu * (h / 8);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // ReLU for comparison (dashed)
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = (px / w) * 8 - 4;
      const relu = Math.max(0, x);
      const y = h / 2 - relu * (h / 8);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#6366f1';
    ctx.font = '10px sans-serif';
    ctx.fillText('GELU', w - 40, h / 2 - 30);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.fillText('ReLU', w - 40, h / 2 - 45);
  }

  /* ---- Step 7: N× Layers ---- */
  function renderLayersViz(el, data) {
    const acts = data.layerActivations;
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Progresso Através das Camadas</h5>
        <canvas id="llm-layers-canvas" width="360" height="160"></canvas>
        <div class="llm-pos-legend mt-2">
          <span><span style="color:#6366f1;">●</span> Sintaxe</span>
          <span><span style="color:#f59e0b;">●</span> Semântica</span>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>O que cada nível capta</h5>
        <div class="llm-layer-progression">
          ${[
            { range: '1–12', label: 'Sintaxe', desc: 'POS tags, estrutura gramatical', color: '#6366f1', pct: 85 },
            { range: '13–48', label: 'Semântica', desc: 'Significado, relações, entidades', color: '#10b981', pct: 70 },
            { range: '49–80', label: 'Raciocínio', desc: 'Inferência, lógica, analogias', color: '#f59e0b', pct: 55 },
            { range: '81–96', label: 'Predição', desc: 'Próximo token, geração de texto', color: '#ef4444', pct: 90 },
          ].map(l => `
            <div class="llm-layer-range">
              <span class="llm-layer-range-label">L${l.range}</span>
              <div class="llm-layer-range-info">
                <span class="text-sm font-bold" style="color:${l.color}">${l.label}</span>
                <span class="text-xs text-muted">${l.desc}</span>
              </div>
              <div class="sviz-freq-bar-wrap" style="width:100px;">
                <div class="sviz-freq-bar" data-target-width="${l.pct}" style="width:0%;background:${l.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="sviz-stats-row mt-4">
        <div class="sviz-stat"><span class="sviz-stat-label">Camadas</span><span class="sviz-stat-value">96</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Parâmetros total</span><span class="sviz-stat-value">175B</span></div>
        <div class="sviz-stat"><span class="sviz-stat-label">Params/camada</span><span class="sviz-stat-value">~1.8B</span></div>
      </div>
    `;
    setTimeout(() => {
      drawLayersCanvas('llm-layers-canvas', acts);
      animateStepBars(el);
    }, 50);
  }

  function drawLayersCanvas(canvasId, acts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-2').trim() || '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * h / 4); ctx.lineTo(w, i * h / 4); ctx.stroke();
    }

    const pad = 20;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;

    // Syntax curve (decreasing)
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    acts.forEach((a, i) => {
      const x = pad + (a.layer / 96) * plotW;
      const y = pad + plotH - (a.syntaxPct / 100) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Semantic curve (increasing)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    acts.forEach((a, i) => {
      const x = pad + (a.layer / 96) * plotW;
      const y = pad + plotH - (a.semanticPct / 100) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    acts.forEach(a => {
      const x = pad + (a.layer / 96) * plotW;
      ctx.fillStyle = '#6366f1';
      ctx.beginPath(); ctx.arc(x, pad + plotH - (a.syntaxPct / 100) * plotH, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x, pad + plotH - (a.semanticPct / 100) * plotH, 3, 0, Math.PI * 2); ctx.fill();
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    [1, 24, 48, 72, 96].forEach(l => {
      const x = pad + (l / 96) * plotW;
      ctx.fillText(`L${l}`, x, h - 2);
    });
  }

  /* ---- Step 8: Linear Projection ---- */
  function renderLinearViz(el, data) {
    const logits = data.logits;
    const maxLogit = Math.max(...logits.map(l => Math.abs(l.logit)));
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Projeção no Vocabulário</h5>
        <div class="llm-proj-diagram">
          <div class="llm-proj-box">
            <span class="text-xs">Vetor do último token</span>
            <span class="font-mono text-xs">ℝ^12.288</span>
          </div>
          <span class="llm-proj-arrow">× W_vocab →</span>
          <div class="llm-proj-box llm-proj-logits">
            <span class="text-xs">Logits</span>
            <span class="font-mono text-xs">ℝ^50.257</span>
          </div>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Top Logits (scores brutos)</h5>
        <div class="sviz-freq-bars">
          ${logits.map((l, i) => {
            const pct = (Math.abs(l.logit) / maxLogit * 100).toFixed(0);
            return `
            <div class="sviz-freq-bar-row">
              <span class="sviz-freq-label" style="min-width:80px;">${i === 0 ? '⭐ ' : ''}${l.token}</span>
              <div class="sviz-freq-bar-wrap">
                <div class="sviz-freq-bar" data-target-width="${pct}" style="width:0%;background:${i === 0 ? 'var(--accent)' : 'var(--primary)'};"></div>
              </div>
              <span class="sviz-freq-pct">${l.logit.toFixed(2)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="sviz-formula mt-4">logits = h_N · W_vocab + b_vocab     ∈ ℝ^50.257</div>
    `;
    setTimeout(() => animateStepBars(el), 50);
  }

  /* ---- Step 9: Softmax + Sampling ---- */
  function renderSoftmaxViz(el, data) {
    const cands = data.candidates.slice(0, 8);
    const maxProb = Math.max(...cands.map(c => c.prob));
    el.innerHTML = `
      <div class="llm-viz-section">
        <h5>Distribuição de Probabilidade</h5>
        <div class="llm-softmax-bars">
          ${cands.map((c, i) => {
            const pct = (c.prob * 100).toFixed(1);
            const barW = (c.prob / maxProb * 100).toFixed(0);
            return `
            <div class="llm-softmax-row">
              <span class="llm-softmax-token ${i === 0 ? 'top' : ''}">${i === 0 ? '🎯 ' : ''}${c.word}</span>
              <div class="sviz-freq-bar-wrap">
                <div class="sviz-freq-bar" data-target-width="${barW}" style="width:0%;background:${i === 0 ? 'var(--accent)' : 'var(--primary)'};"></div>
              </div>
              <span class="sviz-freq-pct">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Estratégias de Sampling</h5>
        <div class="llm-sampling-grid">
          <div class="llm-sampling-card">
            <span>🌡️</span>
            <div>
              <span class="text-sm font-bold">Temperature</span>
              <span class="text-xs text-muted">Achata ou aguça a distribuição</span>
            </div>
          </div>
          <div class="llm-sampling-card">
            <span>🔝</span>
            <div>
              <span class="text-sm font-bold">Top-K</span>
              <span class="text-xs text-muted">Mantém apenas K melhores</span>
            </div>
          </div>
          <div class="llm-sampling-card">
            <span>📊</span>
            <div>
              <span class="text-sm font-bold">Top-P (Nucleus)</span>
              <span class="text-xs text-muted">Acumula até P% de prob.</span>
            </div>
          </div>
        </div>
      </div>
      <div class="llm-viz-section mt-4">
        <h5>Resultado</h5>
        <div class="llm-result-box">
          <span class="text-sm text-muted">Próximo token selecionado:</span>
          <span class="llm-result-token">${cands[0]?.word || '?'}</span>
          <span class="text-sm text-muted">com probabilidade ${(cands[0]?.prob * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="sviz-formula mt-4">P(token_i) = e^(z_i / T) / Σ e^(z_j / T)     →     sample ~ P(token)</div>
    `;
    setTimeout(() => animateStepBars(el), 50);
  }

  /* ---- Shared: animate bars with data-target-width ---- */
  function animateStepBars(container) {
    const bars = container.querySelectorAll('[data-target-width]');
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = bar.dataset.targetWidth + '%';
      }, i * 60 + 100);
    });
  }

  /* =================== Real Pipeline (via API) =================== */

  async function runRealPipeline() {
    const input = document.getElementById('pipeline-real-input');
    const text = input?.value?.trim();
    if (!text) return;

    if (!FoundryService.isConfigured()) {
      Toast.show('Configure a API em ⚙️ Configurações primeiro.', 'error');
      return;
    }

    const container = document.getElementById('pipeline-container');
    const btn = document.getElementById('pipeline-real-btn');
    if (!container) return;

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Processando...'; }

    // Simulated tokens for display (BPE approximation)
    const simTokens = text.match(/\S+|\s+/g) || [text];

    container.innerHTML = '';

    // Utility: create & animate a stage
    function addStage(icon, name, desc, delay) {
      const div = document.createElement('div');
      div.className = 'card-flat mb-4 pipeline-stage real-pipeline-stage';
      div.style.animation = `fadeSlideIn 0.5s ease ${delay}s both`;
      div.innerHTML = `<div class="flex items-center gap-3 mb-4">
        <span style="font-size:1.8rem;">${icon}</span>
        <div>
          <h4 style="margin:0;">${name}</h4>
          <p class="text-sm text-muted" style="margin:0;">${desc}</p>
        </div>
        <span class="ai-badge" style="margin-left:auto;">⚡ Real</span>
      </div>
      <div class="stage-content"></div>`;
      container.appendChild(div);
      return div.querySelector('.stage-content');
    }

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    try {
      // === Stage 1: Tokenization ===
      const s1 = addStage('🧩', 'Tokenização (BPE)', 'O texto é dividido em subpalavras chamadas tokens.', 0);
      await delay(300);
      s1.innerHTML = `
        <div class="flex flex-wrap gap-2 mb-3">
          ${simTokens.map((t, i) => `
            <div class="token-chip real-token" style="--chip-color:var(--primary);animation:tokenPop 0.3s ease ${i * 0.08}s both;">
              <span>${escapeHtml(t.trim() || '⎵')}</span>
              <span class="text-xs" style="opacity:0.7;">≈ID ${(i * 347 + 1024) % 50257}</span>
            </div>`).join('')}
        </div>
        <p class="text-xs text-muted">≈ ${simTokens.length} tokens aproximados. O modelo usa BPE — o contagem real será exibida na resposta.</p>`;
      await delay(600);

      // === Stage 2: Embeddings + Positional ===
      const s2 = addStage('📐', 'Embedding + Positional Encoding', 'Cada token ID vira um vetor de alta dimensão. Positional encoding injeta a posição na sequência.', 0.2);
      await delay(300);
      const dims = 12288; // GPT-3/4 class
      s2.innerHTML = `
        <div style="overflow-x:auto;">
          <table class="attn-step-table">
            <thead><tr><th>Token</th><th>Vetor de Embedding (${dims}D, amostra)</th><th>Pos.</th></tr></thead>
            <tbody>
            ${simTokens.slice(0, 10).map((t, i) => {
              const sample = Array.from({length:6}, () => (Math.random() * 2 - 1).toFixed(3));
              return `<tr style="animation:fadeSlideIn 0.3s ease ${i * 0.06}s both;">
                <td class="font-bold">${escapeHtml(t.trim() || '⎵')}</td>
                <td class="font-mono text-xs">[${sample.join(', ')}, …]</td>
                <td class="font-mono text-xs">${i}</td>
              </tr>`;
            }).join('')}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted mt-2">Vetores reais de ${dims} dimensões — aqui exibimos uma amostra de 6 dimensões para didática.</p>`;
      await delay(600);

      // === Stage 3: Transformer Blocks ===
      const s3 = addStage('🔄', 'Transformer Blocks', 'A sequência passa por N camadas de self-attention + feed-forward. Cada camada refina a representação.', 0.2);
      await delay(300);
      const numLayers = 96;
      const layersToShow = [1, 2, 3, 24, 48, 72, 95, numLayers];
      s3.innerHTML = `
        <div class="real-transformer-stack">
          ${layersToShow.map((layer, i) => `
            <div class="real-transformer-layer" style="animation:layerProcess 0.6s ease ${i * 0.15}s both;">
              <div class="layer-header">
                <span class="text-xs font-bold text-primary">Layer ${layer}/${numLayers}</span>
                <div class="layer-progress-bar">
                  <div class="layer-progress-fill" style="width:${(layer / numLayers * 100).toFixed(0)}%;animation:layerFill 0.8s ease ${i * 0.15 + 0.3}s both;"></div>
                </div>
              </div>
              <div class="llm-layer-ops">
                <span class="llm-op-badge">Multi-Head Attention</span>
                <span class="llm-op-badge">Add & Norm</span>
                <span class="llm-op-badge">Feed-Forward (MLP)</span>
                <span class="llm-op-badge">Add & Norm</span>
              </div>
            </div>
            ${i < layersToShow.length - 1 && layersToShow[i + 1] - layer > 1 ? '<div class="layer-skip">⋮</div>' : ''}
          `).join('')}
        </div>
        <p class="text-xs text-muted mt-2">Modelo real com ~${numLayers} camadas. As operações acontecem dentro do modelo — aqui visualizamos o conceito.</p>`;
      await delay(800);

      // === Stage 4: Real Generation with Logprobs ===
      const s4 = addStage('📊', 'Linear + Softmax → Próximo Token (Real)', 'O modelo projeta para o vocabulário e retorna probabilidades reais. Geração em streaming.', 0.2);
      await delay(300);

      // Container for streaming tokens + logprobs
      s4.innerHTML = `
        <div class="real-gen-output mb-4">
          <div class="card-flat" style="border-color:var(--primary-alpha);background:var(--bg-secondary);">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-xs text-muted">Texto gerado (streaming):</span>
              <div class="stream-indicator"><span class="stream-dot"></span> ao vivo</div>
            </div>
            <div class="gen-text" id="real-pipeline-text">
              <span class="gen-prompt">${escapeHtml(text)}</span><span class="gen-cursor">▊</span>
            </div>
          </div>
        </div>
        <div class="text-xs font-bold text-primary mb-2">Probabilidades por token (logprobs reais):</div>
        <div id="real-pipeline-logprobs" class="real-logprobs-container"></div>
        <div id="real-pipeline-stats" class="mt-3"></div>`;

      const textEl = document.getElementById('real-pipeline-text');
      const logprobsEl = document.getElementById('real-pipeline-logprobs');
      const statsEl = document.getElementById('real-pipeline-stats');
      let tokenCount = 0;

      const result = await FoundryService.streamChatCompletion(
        [
          { role: 'system', content: 'Você continua textos de forma natural. Continue diretamente sem explicações. Máximo 80 palavras.' },
          { role: 'user', content: `Continue este texto: "${text}"` },
        ],
        { maxTokens: 120, logprobs: true, topLogprobs: 5, temperature: 0.7 },
        (tokenData) => {
          tokenCount++;
          // Add token to streaming text
          if (textEl) {
            const cursor = textEl.querySelector('.gen-cursor');
            const span = document.createElement('span');
            span.className = 'gen-word stream-token';
            span.textContent = tokenData.content;
            span.style.animation = 'tokenFadeIn 0.25s ease both';
            textEl.insertBefore(span, cursor);
          }

          // Add logprob card
          if (logprobsEl && tokenData.logprobs) {
            const lp = tokenData.logprobs;
            const pct = (lp.prob * 100);
            const topAlts = lp.topLogprobs.slice(0, 5);
            const maxProb = Math.max(...topAlts.map(t => t.prob));

            const card = document.createElement('div');
            card.className = 'real-logprob-card';
            card.style.animation = `fadeSlideIn 0.3s ease both`;
            card.innerHTML = `
              <div class="logprob-header">
                <span class="logprob-token-chosen">${escapeHtml(lp.token)}</span>
                <span class="logprob-prob ${pct > 80 ? 'high' : pct > 30 ? 'mid' : 'low'}">${pct.toFixed(1)}%</span>
              </div>
              <div class="logprob-alternatives">
                ${topAlts.map(t => {
                  const altPct = (t.prob * 100);
                  const barW = (t.prob / maxProb * 100).toFixed(0);
                  const isChosen = t.token === lp.token;
                  return `<div class="logprob-alt ${isChosen ? 'chosen' : ''}">
                    <span class="logprob-alt-token">${escapeHtml(t.token)}</span>
                    <div class="progress-bar" style="flex:1;height:8px;">
                      <div class="progress-fill" style="width:${barW}%;background:${isChosen ? 'var(--accent)' : 'var(--primary)'};"></div>
                    </div>
                    <span class="logprob-alt-pct">${altPct.toFixed(1)}%</span>
                  </div>`;
                }).join('')}
              </div>`;
            logprobsEl.appendChild(card);
            // Scroll to latest
            logprobsEl.scrollTop = logprobsEl.scrollHeight;
          }
        }
      );

      // Remove cursor, add final stats
      textEl?.querySelector('.gen-cursor')?.remove();
      const indicator = container.querySelector('.stream-indicator');
      if (indicator) indicator.innerHTML = '✅ concluído';

      if (statsEl) {
        statsEl.innerHTML = `
          <div class="card-flat" style="border-color:var(--accent-alpha);">
            <div class="flex flex-wrap gap-6">
              <div><span class="text-xs text-muted">Modelo:</span><br><strong>${result.model}</strong></div>
              <div><span class="text-xs text-muted">Tokens prompt:</span><br><strong>${result.usage?.prompt_tokens || '?'}</strong></div>
              <div><span class="text-xs text-muted">Tokens gerados:</span><br><strong>${result.usage?.completion_tokens || tokenCount}</strong></div>
              <div><span class="text-xs text-muted">Total:</span><br><strong>${result.usage?.total_tokens || '?'}</strong></div>
              <div><span class="text-xs text-muted">Tempo:</span><br><strong>${result.elapsed}ms</strong></div>
              <div><span class="text-xs text-muted">Tokens/s:</span><br><strong>${((result.usage?.completion_tokens || tokenCount) / (result.elapsed / 1000)).toFixed(1)}</strong></div>
            </div>
          </div>`;
      }

    } catch (err) {
      container.innerHTML += `
        <div class="card-flat config-test-error mt-4">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '⚡ Pipeline Real'; }
    }
  }

  /* =================== Generation =================== */

  function runGeneration() {
    const input = document.getElementById('gen-input');
    const countInput = document.getElementById('gen-count');
    const text = input?.value?.trim();
    if (!text) return;

    const maxTokens = parseInt(countInput?.value) || 6;
    const result = LLMEngine.generateSequence(text, maxTokens, 0.8, 5);

    // Show output being "typed"
    const outputEl = document.getElementById('gen-output');
    const stepsEl = document.getElementById('gen-steps');
    const stopBtn = document.getElementById('gen-stop-btn');
    const runBtn = document.getElementById('gen-run-btn');
    if (!outputEl || !stepsEl) return;

    runBtn.disabled = true;
    stopBtn.disabled = false;
    stepsEl.innerHTML = '';

    const promptWords = text.split(/\s+/);
    outputEl.innerHTML = `
      <div class="card-flat">
        <div class="gen-text" id="gen-text">
          <span class="gen-prompt">${promptWords.join(' ')}</span>
          <span class="gen-cursor">▊</span>
        </div>
      </div>
    `;

    let step = 0;
    generationInterval = setInterval(() => {
      if (step >= result.steps.length) {
        stopGeneration();
        return;
      }

      const s = result.steps[step];
      const textEl = document.getElementById('gen-text');
      if (textEl) {
        // Remove cursor, add word, re-add cursor
        const cursor = textEl.querySelector('.gen-cursor');
        const wordSpan = document.createElement('span');
        wordSpan.className = 'gen-word';
        wordSpan.textContent = ' ' + s.chosen;
        wordSpan.style.animation = 'fadeIn 0.3s ease';
        textEl.insertBefore(wordSpan, cursor);
      }

      // Add step card
      const stepCard = document.createElement('div');
      stepCard.className = 'card-flat mb-3';
      stepCard.style.animation = 'fadeSlideIn 0.3s ease both';
      stepCard.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="badge badge-primary">Passo ${s.step}</span>
          <span class="text-xs text-muted">Contexto: "...${s.context.slice(-3).join(' ')}"</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${s.candidates.map(c => `
            <span class="token-chip ${c.word === s.chosen ? 'chosen' : ''}" 
              style="--chip-color: ${c.word === s.chosen ? 'var(--accent)' : 'var(--primary)'};">
              ${c.word} <span class="text-xs" style="opacity:0.7;">${(c.prob * 100).toFixed(0)}%</span>
            </span>
          `).join('')}
        </div>
      `;
      stepsEl.appendChild(stepCard);

      step++;
    }, 600);
  }

  function stopGeneration() {
    if (generationInterval) {
      clearInterval(generationInterval);
      generationInterval = null;
    }
    const cursor = document.querySelector('.gen-cursor');
    if (cursor) cursor.remove();
    const runBtn = document.getElementById('gen-run-btn');
    const stopBtn = document.getElementById('gen-stop-btn');
    if (runBtn) runBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }

  /* =================== AI Real Generation (Streaming + Logprobs) =================== */
  async function runAIGeneration() {
    const input = document.getElementById('gen-input');
    const text = input?.value?.trim();
    if (!text) return;

    if (!FoundryService.isConfigured()) {
      Toast.show('Configure a API em ⚙️ Configurações primeiro.', 'error');
      return;
    }

    const outputEl = document.getElementById('gen-output');
    const stepsEl = document.getElementById('gen-steps');
    if (!outputEl) return;

    const aiBtn = document.getElementById('gen-ai-btn');
    const stopBtn = document.getElementById('gen-stop-btn');
    const runBtn = document.getElementById('gen-run-btn');
    if (aiBtn) { aiBtn.disabled = true; aiBtn.textContent = '⏳ Gerando...'; }
    if (runBtn) runBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;

    outputEl.innerHTML = `
      <div class="card-flat" style="border-color:var(--primary-alpha);">
        <div class="flex items-center gap-3 mb-3">
          <span class="ai-badge">⚡ IA Real — Streaming</span>
          <div class="stream-indicator"><span class="stream-dot"></span> ao vivo</div>
        </div>
        <div class="gen-text" id="gen-text">
          <span class="gen-prompt">${escapeHtml(text)}</span>
          <span class="gen-cursor">▊</span>
        </div>
      </div>`;
    if (stepsEl) stepsEl.innerHTML = '<div class="text-xs font-bold text-primary mb-2">Tokens gerados com probabilidades reais:</div>';

    let tokenCount = 0;

    try {
      const result = await FoundryService.streamChatCompletion(
        [
          { role: 'system', content: 'Você continua textos de forma natural. Continue diretamente sem explicações. Máximo 150 palavras.' },
          { role: 'user', content: `Continue este texto: "${text}"` },
        ],
        { maxTokens: 200, logprobs: true, topLogprobs: 5 },
        (tokenData) => {
          tokenCount++;
          const textEl = document.getElementById('gen-text');
          if (textEl) {
            const cursor = textEl.querySelector('.gen-cursor');
            const span = document.createElement('span');
            span.className = 'gen-word stream-token';
            span.textContent = tokenData.content;
            span.style.animation = 'tokenFadeIn 0.25s ease both';
            textEl.insertBefore(span, cursor);
          }

          // Show logprobs step card
          if (stepsEl && tokenData.logprobs) {
            const lp = tokenData.logprobs;
            const pct = (lp.prob * 100);
            const topAlts = lp.topLogprobs.slice(0, 5);
            const maxProb = Math.max(...topAlts.map(t => t.prob));

            const stepCard = document.createElement('div');
            stepCard.className = 'card-flat mb-2';
            stepCard.style.animation = 'fadeSlideIn 0.3s ease both';
            stepCard.innerHTML = `
              <div class="flex items-center justify-between mb-1">
                <span class="badge badge-primary">Token ${tokenCount}</span>
                <span class="logprob-prob ${pct > 80 ? 'high' : pct > 30 ? 'mid' : 'low'}" style="font-size:0.75rem;">${pct.toFixed(1)}%</span>
              </div>
              <div class="flex flex-wrap gap-2">
                ${topAlts.map(t => {
                  const altPct = (t.prob * 100);
                  const isChosen = t.token === lp.token;
                  return `<span class="token-chip ${isChosen ? 'chosen' : ''}" 
                    style="--chip-color:${isChosen ? 'var(--accent)' : 'var(--primary)'};">
                    ${escapeHtml(t.token)} <span class="text-xs" style="opacity:0.7;">${altPct.toFixed(0)}%</span>
                  </span>`;
                }).join('')}
              </div>`;
            stepsEl.appendChild(stepCard);
          }
        }
      );

      // Finalize
      const textEl = document.getElementById('gen-text');
      textEl?.querySelector('.gen-cursor')?.remove();
      const indicator = outputEl.querySelector('.stream-indicator');
      if (indicator) indicator.innerHTML = '✅ concluído';

      // Add stats line
      const statsDiv = document.createElement('div');
      statsDiv.className = 'flex items-center gap-4 mt-2 text-xs text-muted';
      statsDiv.innerHTML = `
        <span>⏱️ ${result.elapsed}ms</span>
        <span>📊 ${result.usage?.total_tokens || tokenCount} tokens</span>
        <span>🚀 ${((result.usage?.completion_tokens || tokenCount) / (result.elapsed / 1000)).toFixed(1)} tok/s</span>
        <span>🤖 ${result.model}</span>`;
      outputEl.querySelector('.card-flat')?.appendChild(statsDiv);

    } catch (err) {
      outputEl.innerHTML = `
        <div class="card-flat config-test-error">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (aiBtn) { aiBtn.disabled = false; aiBtn.textContent = '⚡ Gerar com IA Real'; }
      if (runBtn) runBtn.disabled = false;
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* =================== Playground =================== */

  function updatePlayground() {
    const word = document.getElementById('pg-word')?.value?.trim() || 'the';
    const temp = parseFloat(document.getElementById('pg-temp')?.value) || 1.0;
    const topK = parseInt(document.getElementById('pg-topk')?.value) || 5;

    const { candidates } = LLMEngine.getNextWordProbs(word);
    const words = candidates.map(c => c.word);
    const probs = candidates.map(c => c.prob);

    const filtered = LLMEngine.topKFilter(words, probs, topK);

    // Apply temperature
    const tempProbs = filtered.map(f => Math.pow(f.prob, 1 / temp));
    const tempSum = tempProbs.reduce((s, v) => s + v, 0);
    const finalProbs = tempProbs.map(v => v / tempSum);

    const chart = document.getElementById('pg-chart');
    if (!chart) return;

    const maxProb = Math.max(...finalProbs);

    chart.innerHTML = `
      <div class="flex flex-col gap-3">
        ${filtered.map((f, i) => {
          const pct = (finalProbs[i] * 100).toFixed(1);
          const origPct = (f.prob * 100).toFixed(1);
          const barW = (finalProbs[i] / maxProb) * 100;
          return `
          <div class="flex items-center gap-3">
            <span class="font-bold text-sm" style="width:70px;">${f.word}</span>
            <div class="progress-bar" style="flex:1;height:12px;">
              <div class="progress-fill" style="width:${barW}%;background:var(--primary);transition:width 0.4s ease;"></div>
            </div>
            <span class="text-xs font-mono" style="width:50px;">${pct}%</span>
          </div>`;
        }).join('')}
      </div>
      <div class="mt-4 text-xs text-muted">
        <p>🌡️ Temp ${temp}: ${temp < 0.5 ? 'distribuição concentrada (greedy)' : temp < 1.2 ? 'distribuição balanceada' : 'distribuição achatada (aleatória)'}.</p>
        <p>🎯 Top-${topK}: ${topK <= 2 ? 'pouquíssimas opções' : topK <= 5 ? 'opções moderadas' : 'muitas opções'}.</p>
      </div>
    `;
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
    const result = Progress.completeQuiz('llm', score, total);

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
