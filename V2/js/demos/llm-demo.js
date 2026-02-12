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
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">🤖</span>
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
    return `
      <div class="pipeline-section">
        <div class="card-flat mb-4">
          <h3>🔄 Visualize o Pipeline</h3>
          <p class="text-sm text-muted">Digite um texto e veja cada estágio do processamento.</p>
          <div class="flex gap-4 items-center mt-4">
            <input id="pipeline-input" class="input" value="The cat sat on" 
              placeholder="Digite um texto..." style="flex:1;min-width:200px;">
            <button class="btn btn-primary" id="pipeline-run-btn">Processar</button>
          </div>
        </div>
        <div id="pipeline-container" class="mt-4"></div>
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

  function initInteractions() {
    // Pipeline
    document.getElementById('pipeline-run-btn')?.addEventListener('click', runPipeline);

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

  /* =================== Pipeline =================== */

  function runPipeline() {
    const input = document.getElementById('pipeline-input');
    const text = input?.value?.trim();
    if (!text) return;

    const result = LLMEngine.simulatePipeline(text);
    const container = document.getElementById('pipeline-container');
    if (!container) return;

    let html = '';

    result.stages.forEach((stage, idx) => {
      html += `<div class="card-flat mb-4 pipeline-stage" style="animation: fadeSlideIn 0.4s ease ${idx * 0.15}s both;">`;
      html += `<div class="flex items-center gap-3 mb-4">
        <span style="font-size:1.8rem;">${stage.icon}</span>
        <div>
          <h4 style="margin:0;">${stage.name}</h4>
          <p class="text-sm text-muted" style="margin:0;">${stage.desc}</p>
        </div>
      </div>`;

      if (idx === 0) {
        // Tokenization
        html += `<div class="flex flex-wrap gap-2">
          ${stage.data.map(d => `
            <div class="token-chip" style="--chip-color: var(--primary);">
              <span>${d.token}</span>
              <span class="text-xs" style="opacity:0.7;">ID: ${d.id}</span>
            </div>
          `).join('')}
        </div>`;

      } else if (idx === 1) {
        // Embeddings + Position
        html += `<div style="overflow-x:auto;"><table class="attn-step-table">
          <thead><tr><th>Token</th><th>Embedding (4D)</th><th>Pos. Encoding</th></tr></thead><tbody>`;
        stage.data.forEach(d => {
          html += `<tr>
            <td class="font-bold">${d.token}</td>
            <td class="font-mono text-xs">[${d.vec.map(v => v.toFixed(3)).join(', ')}]</td>
            <td class="font-mono text-xs">[${d.posEnc.map(v => v.toFixed(3)).join(', ')}]</td>
          </tr>`;
        });
        html += `</tbody></table></div>`;

      } else if (idx === 2) {
        // Transformer blocks
        html += `<div class="llm-layers-grid">
          ${stage.data.map(layer => `
            <div class="llm-layer-card">
              <span class="text-xs font-bold text-primary">Layer ${layer.layer}</span>
              <div class="llm-layer-ops">
                ${layer.operations.map(op => `<span class="llm-op-badge">${op}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>`;

      } else if (idx === 3) {
        // Predictions
        html += `<div class="flex flex-col gap-2">
          ${stage.data.slice(0, 8).map((c, i) => {
            const pct = (c.prob * 100).toFixed(1);
            const isTop = i === 0;
            return `
            <div class="flex items-center gap-3">
              <span class="font-bold ${isTop ? 'text-accent' : ''}" style="width:80px;">
                ${isTop ? '⭐ ' : ''}${c.word}
              </span>
              <div class="progress-bar" style="flex:1;height:${isTop ? 14 : 10}px;">
                <div class="progress-fill" style="width:${pct}%;background:${isTop ? 'var(--accent)' : 'var(--primary)'};"></div>
              </div>
              <span class="text-sm font-mono" style="width:55px;">${pct}%</span>
            </div>`;
          }).join('')}
        </div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
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

  /* =================== AI Real Generation =================== */
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
    if (aiBtn) { aiBtn.disabled = true; aiBtn.textContent = '⏳ Gerando...'; }

    outputEl.innerHTML = `
      <div class="card-flat config-test-loading">
        <div class="spinner"></div>
        <span>Enviando prompt para o modelo real...</span>
      </div>`;
    if (stepsEl) stepsEl.innerHTML = '';

    try {
      const systemPrompt = `Você é um assistente que continua textos. O usuário vai fornecer o início de um texto e você deve continuar de forma natural e coerente. Continue o texto diretamente, sem explicações. Máximo 150 palavras.`;
      const result = await FoundryService.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Continue este texto: "${text}"` },
      ], { maxTokens: 200 });

      outputEl.innerHTML = `
        <div class="card-flat" style="border-color:#0078d444;">
          <div class="flex items-center justify-between mb-3">
            <span class="ai-badge">⚡ IA Real — ${result.model}</span>
            <span class="text-xs text-muted">⏱️ ${result.elapsed}ms${result.usage?.total_tokens ? ' · ' + result.usage.total_tokens + ' tokens' : ''}</span>
          </div>
          <div class="gen-text">
            <span class="gen-prompt">${escapeHtml(text)}</span>
            <span class="gen-word" style="color:var(--accent);"> ${escapeHtml(result.content)}</span>
          </div>
        </div>`;
    } catch (err) {
      outputEl.innerHTML = `
        <div class="card-flat config-test-error">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (aiBtn) { aiBtn.disabled = false; aiBtn.textContent = '⚡ Gerar com IA Real'; }
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
