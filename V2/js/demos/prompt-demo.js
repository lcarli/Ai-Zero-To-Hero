/* ============================================
   AIFORALL V2 — Prompt Engineering Demo
   Techniques, analyzer, mistakes, templates, quiz
   ============================================ */

const PromptDemo = (() => {

  /* =================== Render =================== */
  function render() {
    const state = Progress.getState();
    const mState = state.modules['prompt-engineering'] || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">✍️</span>
              <div>
                <h1>Prompt Engineering</h1>
                <p>A arte de conversar com modelos de IA para obter os melhores resultados</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Técnicas</button>
              <button class="tab" data-tab="analyzer">🔍 Analisador</button>
              <button class="tab" data-tab="mistakes">❌ Erros Comuns</button>
              <button class="tab" data-tab="templates">📋 Templates</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-analyzer" class="tab-content hidden">${renderAnalyzerTab()}</div>
            <div id="tab-mistakes" class="tab-content hidden">${renderMistakesTab()}</div>
            <div id="tab-templates" class="tab-content hidden">${renderTemplatesTab()}</div>
            <div id="tab-quiz" class="tab-content hidden">${renderQuizTab(mState)}</div>
          </div>
        </section>
      </div>
    `;
  }

  /* =================== Tab: Learn (Techniques) =================== */
  function renderLearnTab() {
    const techs = PromptEngine.TECHNIQUES;
    return `
      <div class="learn-section">
        <div class="card-flat mb-6">
          <h3>✍️ O que é Prompt Engineering?</h3>
          <p><strong>Prompt Engineering</strong> é a habilidade de formular instruções claras e eficazes 
          para modelos de IA. A qualidade da resposta depende diretamente da qualidade do prompt.</p>
          <p class="mt-2 text-sm text-muted">Não é "mágica" — é comunicação estruturada. Como dar instruções 
          para um estagiário muito inteligente mas que não conhece seu contexto.</p>
        </div>

        <h3 class="mb-4">🎯 6 Técnicas Essenciais</h3>
        <div class="flex flex-col gap-4">
          ${Object.values(techs).map(t => `
            <div class="card-flat prompt-technique-card" style="border-left: 4px solid ${t.color};">
              <div class="flex items-center gap-3 mb-3">
                <span style="font-size:1.5rem;">${t.icon}</span>
                <div>
                  <h4 style="margin:0;color:${t.color};">${t.label}</h4>
                  <span class="text-sm text-muted">${t.desc}</span>
                </div>
              </div>
              <p class="text-xs text-muted mb-3">📌 Quando usar: ${t.when}</p>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="prompt-block prompt-block-user">
                  <span class="text-xs font-bold" style="color:${t.color};">👤 Prompt:</span>
                  <pre class="prompt-pre mt-1">${escapeHtml(t.example.prompt)}</pre>
                </div>
                <div class="prompt-block prompt-block-ai">
                  <span class="text-xs font-bold" style="color:#10b981;">🤖 Resposta:</span>
                  <pre class="prompt-pre mt-1">${escapeHtml(t.example.response)}</pre>
                </div>
              </div>

              <div class="mt-3">
                <span class="text-xs text-muted">Template:</span>
                <code class="text-xs ml-2" style="color:${t.color};">${escapeHtml(t.template)}</code>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card-flat mt-6">
          <h3>🧩 Combinando Técnicas</h3>
          <p class="text-sm">As melhores prompts combinam várias técnicas:</p>
          <div class="prompt-block prompt-block-user mt-4">
            <pre class="prompt-pre"><span style="color:#8b5cf6;">Você é um engenheiro de dados sênior.</span>  ← Role Prompting

<span style="color:#10b981;">Exemplo:
"SELECT * FROM users" → Problema: sem WHERE, lê tabela inteira
"SELECT name FROM users WHERE active = 1" → Correto: filtra e seleciona</span>  ← Few-Shot

<span style="color:#06b6d4;">Analise a query abaixo e sugira otimizações.
Responda em JSON com: problema, solução, query_otimizada.</span>  ← Output Estruturado

<span style="color:#f59e0b;">Explique o raciocínio passo a passo.</span>  ← Chain-of-Thought

SELECT * FROM orders JOIN products ON orders.product_id = products.id</pre>
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Tab: Analyzer =================== */
  function renderAnalyzerTab() {
    const aiReady = typeof FoundryService !== 'undefined' && FoundryService.isConfigured();
    return `
      <div class="analyzer-section">
        <div class="card-flat mb-4">
          <h3>🔍 Analisador de Prompts</h3>
          <p class="text-sm text-muted">Cole seu prompt e veja uma análise com score, técnicas detectadas e sugestões de melhoria.</p>
          <textarea id="prompt-input" class="input mt-4" rows="6" style="width:100%;resize:vertical;font-family:var(--font-mono);font-size:0.9rem;"
            placeholder="Cole ou escreva seu prompt aqui...&#10;&#10;Exemplo: Você é um professor de Python para iniciantes. Explique o que são listas em Python com 3 exemplos práticos. Responda em formato de tutorial com código."></textarea>
          <div class="flex gap-4 mt-4 flex-wrap">
            <button class="btn btn-primary" id="analyze-btn">Analisar Prompt</button>
            <button class="btn ${aiReady ? 'btn-accent' : 'btn-ghost'}" id="analyze-ai-btn" ${!aiReady ? 'disabled title="Configure a API em ⚙️ Configurações"' : ''}>⚡ Análise + Teste com IA Real</button>
            <button class="btn btn-ghost text-xs" id="analyze-example-btn">Carregar exemplo</button>
          </div>
          ${!aiReady ? '<p class="text-xs text-muted mt-2">💡 <a href="#/settings" style="color:var(--primary);">Configure uma API</a> para análise com IA real e testar prompts.</p>' : ''}
        </div>
        <div id="analysis-result" class="mt-4"></div>
        <div id="ai-analysis-result" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tab: Mistakes =================== */
  function renderMistakesTab() {
    return `
      <div class="mistakes-section">
        <div class="card-flat mb-6">
          <h3>❌ 5 Erros Mais Comuns em Prompts</h3>
          <p class="text-sm text-muted">Veja o que NÃO fazer — e como corrigir cada erro.</p>
        </div>

        <div class="flex flex-col gap-6">
          ${PromptEngine.MISTAKES.map((m, i) => `
            <div class="card-flat">
              <div class="flex items-center gap-3 mb-4">
                <span class="badge badge-primary">${i + 1}</span>
                <h4 style="margin:0;">${m.label}</h4>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="prompt-block" style="border-color:#ef444444;background:#ef444408;">
                  <span class="text-xs font-bold" style="color:#ef4444;">❌ Ruim:</span>
                  <pre class="prompt-pre mt-1">${escapeHtml(m.bad)}</pre>
                </div>
                <div class="prompt-block" style="border-color:#10b98144;background:#10b98108;">
                  <span class="text-xs font-bold" style="color:#10b981;">✅ Bom:</span>
                  <pre class="prompt-pre mt-1">${escapeHtml(m.good)}</pre>
                </div>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <span style="font-size:1.2rem;">💡</span>
                <span class="text-sm">${m.tip}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card-flat mt-6">
          <h3>📐 Checklist do Prompt Perfeito</h3>
          <div class="grid grid-cols-2 gap-3 mt-4">
            ${[
              ['🎯', 'Objetivo claro e específico'],
              ['📋', 'Formato de saída definido'],
              ['👥', 'Público-alvo mencionado'],
              ['📏', 'Limites de tamanho/escopo'],
              ['🎭', 'Contexto ou papel definido'],
              ['📝', 'Exemplos quando necessário'],
              ['🚫', 'O que NÃO fazer (restrições)'],
              ['🔗', 'Pedir raciocínio quando complexo'],
            ].map(([icon, text]) => `
              <div class="flex items-center gap-2">
                <span>${icon}</span>
                <span class="text-sm">${text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Tab: Templates =================== */
  function renderTemplatesTab() {
    const templates = PromptEngine.TEMPLATES;
    return `
      <div class="templates-section">
        <div class="card-flat mb-4">
          <h3>📋 Templates Prontos</h3>
          <p class="text-sm text-muted">Escolha um template, preencha os campos e copie o prompt final.</p>
          <div class="flex gap-2 mt-4 flex-wrap">
            ${Object.entries(templates).map(([key, t]) =>
              `<button class="btn btn-ghost prompt-template-btn" data-template="${key}">${t.label}</button>`
            ).join('')}
          </div>
        </div>
        <div id="template-editor" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tab: Quiz =================== */
  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — Prompt Engineering</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre Prompt Engineering!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>
        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  /* =================== Quiz Data =================== */
  const QUIZ_QUESTIONS = [
    {
      question: 'O que é "Few-Shot Prompting"?',
      options: [
        'Fazer várias perguntas de uma vez',
        'Dar exemplos antes da pergunta para o modelo seguir o padrão',
        'Usar emojis no prompt para ser mais claro',
        'Pedir para o modelo responder em poucas palavras',
      ],
      correct: 1,
      explanation: 'Few-Shot Prompting é fornecer exemplos do input/output esperado antes da pergunta real. O modelo aprende o padrão pelos exemplos e aplica na nova entrada.',
    },
    {
      question: 'Quando usar Chain-of-Thought?',
      options: [
        'Para gerar textos criativos',
        'Para traduzir idiomas',
        'Para problemas que exigem raciocínio lógico ou matemático',
        'Para classificar sentimentos',
      ],
      correct: 2,
      explanation: 'Chain-of-Thought (pensar passo a passo) é mais útil em problemas complexos de lógica, matemática ou raciocínio multi-etapas. Força o modelo a "mostrar o trabalho".',
    },
    {
      question: 'Qual técnica está sendo usada: "Você é um nutricionista esportivo. Crie um plano alimentar..."?',
      options: [
        'Zero-Shot',
        'Few-Shot',
        'Role Prompting',
        'Chain-of-Thought',
      ],
      correct: 2,
      explanation: 'Role Prompting define um papel/persona. "Você é um nutricionista" dá ao modelo expertise e tom específicos para a resposta.',
    },
    {
      question: 'Qual o principal problema do prompt "Me fale sobre tecnologia"?',
      options: [
        'É muito longo',
        'Usa linguagem informal',
        'É vago demais — não especifica o quê, para quem, em que formato',
        'Deveria ser em inglês',
      ],
      correct: 2,
      explanation: 'Prompts vagos geram respostas genéricas. Um bom prompt especifica: qual aspecto da tecnologia, para qual público, em que formato e com que profundidade.',
    },
    {
      question: 'Qual combinação de técnicas é mais poderosa para uma tarefa complexa?',
      options: [
        'Zero-Shot sozinho',
        'Role + Few-Shot + Output Estruturado + Chain-of-Thought',
        'Só usar letras maiúsculas',
        'Repetir o prompt 3 vezes',
      ],
      correct: 1,
      explanation: 'Combinar técnicas é o segredo: Role (expertise) + Few-Shot (padrão) + Output Estruturado (formato) + CoT (raciocínio). Cada uma resolve um aspecto do problema.',
    },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Utils =================== */
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* =================== Interactions =================== */
  function initInteractions() {
    // Analyzer
    document.getElementById('analyze-btn')?.addEventListener('click', runAnalysis);
    document.getElementById('analyze-ai-btn')?.addEventListener('click', runAIAnalysis);
    document.getElementById('analyze-example-btn')?.addEventListener('click', loadExample);

    // Templates
    document.querySelectorAll('.prompt-template-btn').forEach(btn => {
      btn.addEventListener('click', () => loadTemplate(btn.dataset.template));
    });

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Analyzer Logic =================== */
  function loadExample() {
    const ta = document.getElementById('prompt-input');
    if (ta) {
      ta.value = 'Você é um professor de Python para iniciantes.\n\nExplique o que são listas em Python com 3 exemplos práticos.\n\nResponda em formato de tutorial com código comentado.\nMáximo 300 palavras.\nPúblico: estudantes de ensino médio.';
    }
  }

  function runAnalysis() {
    const text = document.getElementById('prompt-input')?.value?.trim();
    if (!text) return;

    const a = PromptEngine.analyzePrompt(text);
    const container = document.getElementById('analysis-result');
    if (!container) return;

    container.innerHTML = `
      <div class="card-flat mb-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span style="font-size:2rem;">${a.grade.emoji}</span>
            <div>
              <h3 style="margin:0;color:${a.grade.color};">${a.grade.label}</h3>
              <span class="text-sm text-muted">${a.wordCount} palavras, ${a.length} caracteres</span>
            </div>
          </div>
          <div class="prompt-score" style="--score-color:${a.grade.color};">
            <span class="prompt-score-number">${a.score}</span>
            <span class="text-xs">/100</span>
          </div>
        </div>
        <div class="progress-bar" style="height:10px;">
          <div class="progress-fill" style="width:${a.score}%;background:${a.grade.color};"></div>
        </div>
      </div>

      ${a.detected.length > 0 ? `
        <div class="card-flat mb-4">
          <h4>✅ Técnicas Detectadas</h4>
          <div class="flex flex-col gap-2 mt-3">
            ${a.detected.map(d => `
              <div class="flex items-center gap-2">
                <span style="color:#10b981;">●</span>
                <span class="text-sm">${d}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${a.suggestions.length > 0 ? `
        <div class="card-flat mb-4">
          <h4>💡 Sugestões de Melhoria</h4>
          <div class="flex flex-col gap-2 mt-3">
            ${a.suggestions.map(s => `
              <div class="flex items-center gap-2">
                <span style="color:#f59e0b;">→</span>
                <span class="text-sm">${s}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${a.issues.length > 0 ? `
        <div class="card-flat">
          <h4>⚠️ Problemas</h4>
          <div class="flex flex-col gap-2 mt-3">
            ${a.issues.map(i => `
              <div class="flex items-center gap-2">
                <span style="color:#ef4444;">⚠</span>
                <span class="text-sm">${i.msg}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  /* =================== Templates Logic =================== */

  /* ---- AI Analysis ---- */
  async function runAIAnalysis() {
    const text = document.getElementById('prompt-input')?.value?.trim();
    if (!text) { Toast.show('Escreva um prompt para analisar.', 'info'); return; }

    if (!FoundryService.isConfigured()) {
      Toast.show('Configure a API em ⚙️ Configurações primeiro.', 'error');
      return;
    }

    // Run heuristic analysis first
    runAnalysis();

    const aiContainer = document.getElementById('ai-analysis-result');
    if (!aiContainer) return;

    const btn = document.getElementById('analyze-ai-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Analisando...'; }

    aiContainer.innerHTML = `
      <div class="card-flat config-test-loading">
        <div class="spinner"></div>
        <span>Analisando prompt com IA real e gerando resposta...</span>
      </div>`;

    try {
      // 1. AI Analysis of the prompt quality
      const analysisPrompt = `Analise este prompt de IA e dê feedback detalhado:

"""${text}"""

Forneça:
1. Pontos fortes do prompt (se houver)
2. Problemas encontrados (se houver)
3. Sugestão de prompt melhorado
4. Score de 0-100

Seja conciso e prático.`;

      const analysisResult = await FoundryService.generateForModule('prompt-engineering', analysisPrompt);

      // 2. Actually test the prompt
      const testResult = await FoundryService.ask(text);

      aiContainer.innerHTML = `
        <div class="card-flat mb-4" style="border-color:#0078d444;">
          <div class="flex items-center justify-between mb-3">
            <h4 style="color:#0078d4;">🤖 Análise por IA Real</h4>
            <span class="ai-badge">⚡ ${analysisResult.model} · ${analysisResult.elapsed}ms</span>
          </div>
          <div class="playground-response">${formatResponseText(analysisResult.content)}</div>
        </div>

        <div class="card-flat" style="border-color:#10b98144;">
          <div class="flex items-center justify-between mb-3">
            <h4 style="color:#10b981;">📝 Resultado de Testar o Prompt</h4>
            <span class="ai-badge">⚡ ${testResult.model} · ${testResult.elapsed}ms${testResult.usage?.total_tokens ? ' · ' + testResult.usage.total_tokens + ' tokens' : ''}</span>
          </div>
          <div class="playground-response">${formatResponseText(testResult.content)}</div>
        </div>
      `;
    } catch (err) {
      aiContainer.innerHTML = `
        <div class="card-flat config-test-error">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '⚡ Análise + Teste com IA Real'; }
    }
  }

  function formatResponseText(text) {
    return escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--surface);padding:0.1em 0.3em;border-radius:3px;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function loadTemplate(key) {
    const template = PromptEngine.TEMPLATES[key];
    if (!template) return;

    document.querySelectorAll('.prompt-template-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.prompt-template-btn[data-template="${key}"]`)?.classList.add('active');

    const container = document.getElementById('template-editor');
    if (!container) return;

    container.innerHTML = `
      <div class="card-flat mb-4">
        <h4>${template.label}</h4>
        <div class="flex flex-col gap-3 mt-4">
          ${template.fields.map(f => `
            <div>
              <label class="text-sm font-bold">{${f}}:</label>
              <input class="input mt-1 template-field" data-field="${f}" 
                placeholder="Preencha: ${f}" style="width:100%;">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-primary mt-4" id="template-generate-btn">Gerar Prompt</button>
      </div>
      <div id="template-output" class="mt-4"></div>
    `;

    document.getElementById('template-generate-btn')?.addEventListener('click', () => {
      let result = template.template;
      container.querySelectorAll('.template-field').forEach(input => {
        const field = input.dataset.field;
        const val = input.value.trim() || `[${field}]`;
        result = result.replace(new RegExp(`\\{${field}\\}`, 'g'), val);
      });

      const output = document.getElementById('template-output');
      if (output) {
        output.innerHTML = `
          <div class="card-flat">
            <div class="flex items-center justify-between mb-3">
              <h4 style="margin:0;">📋 Prompt Gerado</h4>
              <button class="btn btn-sm btn-ghost" id="copy-prompt-btn">📋 Copiar</button>
            </div>
            <div class="prompt-block prompt-block-user">
              <pre class="prompt-pre" id="generated-prompt">${escapeHtml(result)}</pre>
            </div>
          </div>
        `;
        document.getElementById('copy-prompt-btn')?.addEventListener('click', () => {
          navigator.clipboard?.writeText(result).then(() => {
            Toast.show('Prompt copiado!', 'success');
          }).catch(() => {
            Toast.show('Não foi possível copiar', 'error');
          });
        });
      }
    });
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
    const result = Progress.completeQuiz('prompt-engineering', score, total);

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
