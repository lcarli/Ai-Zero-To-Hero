/* ============================================
   AIFORALL V2 — AI Agents Demo
   Agent loop, scenarios, tools, frameworks, quiz
   ============================================ */

const AgentsDemo = (() => {

  function render() {
    const state = Progress.getState();
    const mState = state.modules.agents || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">🤝</span>
              <div>
                <h1>AI Agents</h1>
                <p>Agentes autônomos que percebem, pensam e agem</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="simulation">🎮 Simulação</button>
              <button class="tab" data-tab="tools">🔧 Ferramentas</button>
              <button class="tab" data-tab="frameworks">🏗️ Frameworks</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-simulation" class="tab-content hidden">${renderSimulationTab()}</div>
            <div id="tab-tools" class="tab-content hidden">${renderToolsTab()}</div>
            <div id="tab-frameworks" class="tab-content hidden">${renderFrameworksTab()}</div>
            <div id="tab-quiz" class="tab-content hidden">${renderQuizTab(mState)}</div>
          </div>
        </section>
      </div>
    `;
  }

  /* =================== Learn =================== */
  function renderLearnTab() {
    return `
      <div class="learn-section">
        <div class="card-flat mb-8">
          <h3>🤝 O que são AI Agents?</h3>
          <p><strong>AI Agents</strong> são sistemas que usam LLMs como "cérebro" para perceber o ambiente,
          tomar decisões e executar ações de forma autônoma. Diferente de um chatbot simples,
          agents podem usar ferramentas, planejar e executar tarefas complexas em múltiplos passos.</p>
          <p class="mt-2 text-sm text-muted">Analogia: Um chatbot responde perguntas. Um agent resolve problemas inteiros
          — pesquisa, calcula, envia e-mails, escreve código — tudo sozinho.</p>
        </div>

        <div class="card-flat mb-8">
          <h3>🔄 O Loop do Agente</h3>
          <p class="text-sm text-muted mb-4">Todo agente segue um ciclo: Perceber → Pensar → Agir → Observar → Repetir</p>
          <div class="agent-loop">
            ${AgentsEngine.AGENT_LOOP.map((s, i) => `
              <div class="agent-loop-step" style="border-color:${s.color}44;">
                <span style="font-size:1.5rem;">${s.icon}</span>
                <strong class="text-sm" style="color:${s.color};">${s.name}</strong>
                <span class="text-xs text-muted">${s.desc}</span>
              </div>
              ${i < AgentsEngine.AGENT_LOOP.length - 1 ? '<span class="agent-loop-arrow">→</span>' : ''}
            `).join('')}
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🧩 Tipos de Agentes</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            ${AgentsEngine.AGENT_TYPES.map(t => `
              <div class="card-flat">
                <div class="flex items-center gap-2 mb-2">
                  <span style="font-size:1.3rem;">${t.icon}</span>
                  <strong>${t.name}</strong>
                </div>
                <p class="text-xs text-muted">${t.desc}</p>
                <code class="text-xs mt-2" style="display:block;color:var(--primary);">${t.pattern}</code>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>💭 ReAct: O Padrão Mais Comum</h3>
          <p class="text-sm">ReAct = <strong>Reason</strong> + <strong>Act</strong>. O agente alterna entre raciocinar 
          (explicar o que pensa) e agir (chamar uma ferramenta).</p>
          <div class="agent-react-example mt-4">
            <div class="agent-step-thought">
              <span class="text-xs font-bold" style="color:#8b5cf6;">💭 Thought:</span>
              <p class="text-sm">Preciso descobrir o clima em São Paulo para planejar a viagem.</p>
            </div>
            <div class="agent-step-action">
              <span class="text-xs font-bold" style="color:#f59e0b;">⚡ Action:</span>
              <p class="text-sm">weather("São Paulo")</p>
            </div>
            <div class="agent-step-observation">
              <span class="text-xs font-bold" style="color:#06b6d4;">🔍 Observation:</span>
              <p class="text-sm">São Paulo: 24°C, parcialmente nublado</p>
            </div>
            <div class="agent-step-thought">
              <span class="text-xs font-bold" style="color:#8b5cf6;">💭 Thought:</span>
              <p class="text-sm">Tempo agradável. Agora posso recomendar roupas leves e atividades ao ar livre.</p>
            </div>
          </div>
        </div>

        <div class="card-flat">
          <h3>🎯 Aplicações Reais</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            ${[
              ['🛒', 'E-commerce', 'Assistente de compras que busca, compara e compra'],
              ['💼', 'Empresarial', 'Agendamento, relatórios, automação de tarefas'],
              ['💻', 'DevOps', 'Monitorar, diagnosticar e corrigir sistemas'],
              ['📊', 'Análise', 'Coletar dados, analisar e gerar insights'],
              ['🎓', 'Educação', 'Tutor que adapta conteúdo ao aluno'],
              ['🏥', 'Saúde', 'Triagem, agendamento e análise de exames'],
            ].map(([icon, title, desc]) => `
              <div class="flex items-center gap-3">
                <span style="font-size:1.5rem;">${icon}</span>
                <div><strong class="text-sm">${title}</strong><br><span class="text-xs text-muted">${desc}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Simulation =================== */
  function renderSimulationTab() {
    const aiReady = typeof FoundryService !== 'undefined' && FoundryService.isConfigured();
    return `
      <div class="simulation-section">
        <div class="card-flat mb-4">
          <h3>🎮 Simule um Agente</h3>
          <p class="text-sm text-muted">Escolha um cenário prédefinido ou use IA real para um agente autônomo.</p>
          <div class="flex gap-3 mt-4 flex-wrap">
            ${Object.entries(AgentsEngine.SCENARIOS).map(([key, s]) =>
              `<button class="btn btn-ghost agent-scenario-btn" data-scenario="${key}">${s.label}</button>`
            ).join('')}
          </div>
        </div>

        <!-- AI Agent Free-form -->
        <div class="card-flat mb-4" style="border-color:${aiReady ? '#0078d444' : 'var(--border)'};">
          <div class="flex items-center gap-2 mb-3">
            <span style="font-size:1.3rem;">⚡</span>
            <h4 style="margin:0;">Agente com IA Real</h4>
            ${aiReady ? '<span class="ai-badge">🟢 API Configurada</span>' : '<span class="ai-badge ai-badge-sim">🔴 Não configurado</span>'}
          </div>
          <p class="text-sm text-muted mb-3">Descreva um objetivo e veja o agente raciocinar com um modelo real, usando ferramentas passo a passo.</p>
          <div class="flex gap-3">
            <input id="agent-goal-input" class="input" placeholder="Ex: Planeje uma viagem de 3 dias para Tokyo com orçamento de $2000" style="flex:1;" ${!aiReady ? 'disabled' : ''}>
            <button class="btn ${aiReady ? 'btn-primary' : 'btn-ghost'}" id="agent-ai-run" ${!aiReady ? 'disabled' : ''}>⚡ Executar Agente</button>
          </div>
          ${!aiReady ? '<p class="text-xs text-muted mt-2">💡 <a href="#/settings" style="color:var(--primary);">Configure uma API</a> para usar o agente com IA real.</p>' : ''}
        </div>

        <div id="agent-simulation" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Tools =================== */
  function renderToolsTab() {
    return `
      <div class="tools-section">
        <div class="card-flat mb-4">
          <h3>🔧 Ferramentas do Agente</h3>
          <p class="text-sm text-muted">Agentes usam ferramentas para interagir com o mundo real. Teste cada ferramenta abaixo.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          ${Object.entries(AgentsEngine.TOOLS).map(([key, tool]) => `
            <div class="card-flat agent-tool-card" style="border-left: 3px solid ${tool.color};">
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size:1.3rem;">${tool.icon}</span>
                <strong style="color:${tool.color};">${tool.name}</strong>
              </div>
              <p class="text-xs text-muted mb-3">${tool.desc}</p>
              <div class="flex gap-2">
                <input class="input tool-input text-xs" data-tool="${key}" placeholder="Input..." style="flex:1;">
                <button class="btn btn-sm btn-primary tool-run-btn" data-tool="${key}">▶</button>
              </div>
              <div class="tool-output mt-2 hidden" id="tool-output-${key}"></div>
            </div>
          `).join('')}
        </div>

        <div class="card-flat mt-6">
          <h3>🔗 Function Calling</h3>
          <p class="text-sm mt-2">Modelos modernos (GPT-4, Claude, Gemini) suportam <strong>function calling</strong>:
          o LLM decide qual ferramenta usar e com quais parâmetros, e o sistema executa.</p>
          <div class="prompt-block prompt-block-user mt-4">
            <pre class="prompt-pre">{
  "tool": "weather",
  "parameters": {
    "city": "São Paulo",
    "units": "celsius"
  }
}

// O LLM gera este JSON → Sistema executa → Resultado volta pro LLM</pre>
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Frameworks =================== */
  function renderFrameworksTab() {
    return `
      <div class="frameworks-section">
        <div class="card-flat mb-6">
          <h3>🏗️ Frameworks para Agents</h3>
          <p class="text-sm text-muted">Principais ferramentas para construir agentes de IA em 2025.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          ${Object.entries(AgentsEngine.FRAMEWORKS).map(([key, fw]) => `
            <div class="card-flat" style="border-left: 3px solid ${fw.color};">
              <div class="flex items-center justify-between mb-2">
                <strong style="color:${fw.color};">${fw.name}</strong>
                <span class="badge text-xs" style="background:${fw.color}22;color:${fw.color};">${fw.lang}</span>
              </div>
              <p class="text-xs text-muted">${fw.desc}</p>
            </div>
          `).join('')}
        </div>

        <div class="card-flat mt-6">
          <h3>🔮 O Futuro dos Agents</h3>
          <div class="flex flex-col gap-3 mt-4">
            ${[
              ['🌐', 'Computer Use', 'Agentes que navegam na web e usam softwares como humanos'],
              ['👥', 'Multi-Agent Systems', 'Times de agentes especializados colaborando'],
              ['🧠', 'Long-term Memory', 'Agentes que lembram de interações passadas'],
              ['🏢', 'Enterprise Agents', 'Integração profunda com sistemas corporativos'],
              ['🔒', 'Safety & Alignment', 'Controles para garantir agentes seguros e alinhados'],
            ].map(([icon, title, desc]) => `
              <div class="flex items-center gap-3">
                <span style="font-size:1.3rem;">${icon}</span>
                <div><strong class="text-sm">${title}</strong><br><span class="text-xs text-muted">${desc}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Quiz =================== */
  function renderQuizTab(mState) {
    return `
      <div class="quiz-section">
        <div class="card-flat">
          <div class="flex items-center justify-between mb-4">
            <h3 style="margin:0">📝 Quiz — AI Agents</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre AI Agents!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>
        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  const QUIZ_QUESTIONS = [
    { question: 'Qual a principal diferença entre um chatbot e um AI Agent?', options: ['Agents são mais rápidos', 'Agents podem usar ferramentas e executar ações no mundo real', 'Agents só funcionam por voz', 'Agents não usam LLMs'], correct: 1, explanation: 'Agents vão além de responder: eles percebem, planejam, usam ferramentas (APIs, banco, código) e executam ações para resolver tarefas inteiras.' },
    { question: 'O que é o padrão ReAct?', options: ['Real Action — agir sem pensar', 'Reason + Act — alternar entre raciocinar e agir', 'React.js para IA', 'Uma forma de treinar modelos'], correct: 1, explanation: 'ReAct = Reason + Act. O agente primeiro raciocina (Thought), depois age (Action), observa o resultado (Observation) e repete até resolver.' },
    { question: 'O que é "Function Calling" no contexto de agents?', options: ['Chamar uma função JavaScript qualquer', 'O LLM decide qual ferramenta usar e gera os parâmetros em JSON', 'Criar funções com IA', 'Um tipo de treinamento de modelo'], correct: 1, explanation: 'Function Calling permite que o LLM "escolha" qual ferramenta chamar e gere os parâmetros necessários. O sistema então executa e retorna o resultado.' },
    { question: 'Qual NÃO é uma ferramenta típica de um AI Agent?', options: ['Web Search', 'Calculator', 'Database Query', 'Treinar outro modelo de IA'], correct: 3, explanation: 'Agents usam ferramentas como busca, cálculo, e-mail, código e APIs. Treinar modelos é um processo complexo que não é uma "tool" de agent.' },
    { question: 'Qual framework é mais usado para construir agents em Python?', options: ['React.js', 'LangChain', 'TensorFlow', 'Docker'], correct: 1, explanation: 'LangChain é o framework mais popular para construir agents em Python. Oferece abstrações para LLMs, tools, memory e diferentes tipos de agent loops.' },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */
  function initInteractions() {
    // Scenarios
    document.querySelectorAll('.agent-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => runScenario(btn.dataset.scenario));
    });

    // AI Agent
    document.getElementById('agent-ai-run')?.addEventListener('click', runAIAgent);
    document.getElementById('agent-goal-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); runAIAgent(); }
    });

    // Tool testing
    document.querySelectorAll('.tool-run-btn').forEach(btn => {
      btn.addEventListener('click', () => testTool(btn.dataset.tool));
    });

    // Quiz
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Scenario Simulation =================== */
  function runScenario(key) {
    const scenario = AgentsEngine.SCENARIOS[key];
    if (!scenario) return;

    document.querySelectorAll('.agent-scenario-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.agent-scenario-btn[data-scenario="${key}"]`)?.classList.add('active');

    const container = document.getElementById('agent-simulation');
    if (!container) return;

    // Build step-by-step visualization
    let html = `
      <div class="card-flat mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span style="font-size:1.5rem;">🎯</span>
          <div>
            <strong>Objetivo:</strong>
            <p class="text-sm text-muted">${scenario.goal}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
    `;

    scenario.steps.forEach((step, i) => {
      const tool = step.tool ? AgentsEngine.TOOLS[step.tool] : null;
      html += `
        <div class="card-flat agent-sim-step" style="animation: fadeSlideIn 0.3s ${i * 0.15}s both;">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge badge-primary text-xs">Passo ${i + 1}</span>
          </div>
          
          <div class="agent-step-thought">
            <span class="text-xs font-bold" style="color:#8b5cf6;">💭 Thought:</span>
            <p class="text-sm">${step.thought}</p>
          </div>
      `;

      if (tool) {
        html += `
          <div class="agent-step-action mt-2">
            <span class="text-xs font-bold" style="color:${tool.color};">⚡ Action: ${tool.icon} ${tool.name}</span>
            <code class="text-xs ml-2">${step.input}</code>
          </div>
          <div class="agent-step-observation mt-2">
            <span class="text-xs font-bold" style="color:#06b6d4;">🔍 Observation:</span>
            <p class="text-sm">${step.observation}</p>
          </div>
        `;
      }

      html += `</div>`;
    });

    // Final answer
    html += `
      </div>
      <div class="card-flat mt-4" style="border-color:#10b98144;">
        <div class="flex items-center gap-2 mb-3">
          <span style="font-size:1.3rem;">✅</span>
          <strong style="color:#10b981;">Resposta Final</strong>
        </div>
        <div class="prompt-block prompt-block-ai">
          <pre class="prompt-pre">${escapeHtml(scenario.finalAnswer)}</pre>
        </div>
        <p class="text-xs text-muted mt-3">O agente usou ${scenario.steps.filter(s => s.tool).length} ferramentas em ${scenario.steps.length} passos.</p>
      </div>
    `;

    container.innerHTML = html;
  }

  /* =================== Tool Testing =================== */
  function testTool(key) {
    const tool = AgentsEngine.TOOLS[key];
    if (!tool) return;
    const input = document.querySelector(`.tool-input[data-tool="${key}"]`)?.value || 'teste';

    // If AI is configured and tool is 'search', use real AI
    if (key === 'search' && FoundryService.isConfigured()) {
      const output = document.getElementById(`tool-output-${key}`);
      if (output) {
        output.classList.remove('hidden');
        output.innerHTML = `<div class="config-test-loading"><div class="spinner"></div><span>Buscando com IA real...</span></div>`;
      }
      FoundryService.ask(`Pesquise e dê informações concisas sobre: ${input}`, 'Você é um mecanismo de busca. Forneça informações factuais e concisas (máximo 3 frases).').then(result => {
        if (output) {
          output.innerHTML = `
            <div class="prompt-block prompt-block-ai text-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">⏱️ ${result.elapsed}ms</span>
                <span class="ai-badge text-xs">⚡ ${result.model}</span>
              </div>
              <p class="mt-1">${result.content}</p>
            </div>`;
        }
      }).catch(() => {
        // Fallback to simulated
        const result = tool.simulate(input);
        if (output) {
          output.innerHTML = `<div class="prompt-block prompt-block-ai text-xs"><span class="text-xs text-muted">⏱️ ${result.time}ms</span><p class="mt-1">${result.result}</p></div>`;
        }
      });
      return;
    }

    const result = tool.simulate(input);
    const output = document.getElementById(`tool-output-${key}`);
    if (output) {
      output.classList.remove('hidden');
      output.innerHTML = `
        <div class="prompt-block prompt-block-ai text-xs">
          <span class="text-xs text-muted">⏱️ ${result.time}ms</span>
          <p class="mt-1">${result.result}</p>
        </div>
      `;
    }
  }

  /* =================== AI Agent — ReAct Loop =================== */
  async function runAIAgent() {
    const goalInput = document.getElementById('agent-goal-input');
    const goal = goalInput?.value?.trim();
    if (!goal) { Toast.show('Descreva um objetivo para o agente.', 'info'); return; }

    if (!FoundryService.isConfigured()) {
      Toast.show('Configure a API em ⚙️ Configurações primeiro.', 'error');
      return;
    }

    const container = document.getElementById('agent-simulation');
    if (!container) return;

    const runBtn = document.getElementById('agent-ai-run');
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Executando...'; }

    // Clear previous
    container.innerHTML = `
      <div class="card-flat mb-4" style="border-color:#0078d444;">
        <div class="flex items-center gap-3">
          <span style="font-size:1.5rem;">🎯</span>
          <div>
            <strong>Objetivo:</strong>
            <p class="text-sm text-muted">${escapeHtml(goal)}</p>
          </div>
        </div>
      </div>
      <div id="agent-steps-live" class="flex flex-col gap-3"></div>
      <div id="agent-final" class="mt-4"></div>
    `;

    const toolList = Object.entries(AgentsEngine.TOOLS).map(([k, t]) => `- ${k}(input): ${t.desc}`).join('\n');

    const systemPrompt = `Você é um agente IA que resolve tarefas usando o padrão ReAct (Reason + Act).

Ferramentas disponíveis:
${toolList}

Para cada passo, responda EXATAMENTE neste formato JSON:
{"thought": "seu raciocínio aqui", "action": "nome_da_ferramenta", "input": "parâmetro da ferramenta"}

Quando tiver a resposta final, responda:
{"thought": "raciocínio final", "action": "FINISH", "answer": "sua resposta completa"}

Regras:
- Use NO MÁXIMO 5 passos
- Sempre raciocine antes de agir
- Use ferramentas quando necessário
- Responda em português`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Objetivo: ${goal}` },
    ];

    const stepsContainer = document.getElementById('agent-steps-live');
    const maxSteps = 5;
    let stepCount = 0;

    try {
      while (stepCount < maxSteps) {
        stepCount++;

        // Call the model
        const result = await FoundryService.chatCompletion(messages, { temperature: 0.3, maxTokens: 500 });
        const raw = result.content.trim();

        // Try to parse JSON from the response
        let parsed;
        try {
          // Extract JSON from possible markdown code blocks
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
        } catch {
          // If not JSON, treat as final answer
          parsed = { thought: 'Resposta direta', action: 'FINISH', answer: raw };
        }

        // Render step
        const stepEl = document.createElement('div');
        stepEl.className = 'card-flat agent-sim-step';
        stepEl.style.animation = `fadeSlideIn 0.3s both`;

        let stepHtml = `
          <div class="flex items-center gap-2 mb-2">
            <span class="badge badge-primary text-xs">Passo ${stepCount}</span>
            <span class="ai-badge text-xs">⚡ ${result.model} · ${result.elapsed}ms</span>
          </div>
          <div class="agent-step-thought">
            <span class="text-xs font-bold" style="color:#8b5cf6;">💭 Thought:</span>
            <p class="text-sm">${escapeHtml(parsed.thought || '')}</p>
          </div>`;

        if (parsed.action === 'FINISH') {
          // Agent finished
          stepEl.innerHTML = stepHtml;
          stepsContainer.appendChild(stepEl);

          // Show final answer
          const finalEl = document.getElementById('agent-final');
          if (finalEl) {
            finalEl.innerHTML = `
              <div class="card-flat" style="border-color:#10b98144;">
                <div class="flex items-center gap-2 mb-3">
                  <span style="font-size:1.3rem;">✅</span>
                  <strong style="color:#10b981;">Resposta Final</strong>
                  <span class="ai-badge">⚡ IA Real — ${stepCount} passos</span>
                </div>
                <div class="prompt-block prompt-block-ai">
                  <pre class="prompt-pre">${escapeHtml(parsed.answer || '')}</pre>
                </div>
              </div>`;
          }
          break;
        }

        // Execute tool
        const toolKey = parsed.action;
        const tool = AgentsEngine.TOOLS[toolKey];
        let observation;

        if (tool) {
          const toolResult = tool.simulate(parsed.input || '');
          observation = toolResult.result;
          stepHtml += `
            <div class="agent-step-action mt-2">
              <span class="text-xs font-bold" style="color:${tool.color};">⚡ Action: ${tool.icon} ${tool.name}</span>
              <code class="text-xs ml-2">${escapeHtml(parsed.input || '')}</code>
            </div>
            <div class="agent-step-observation mt-2">
              <span class="text-xs font-bold" style="color:#06b6d4;">🔍 Observation:</span>
              <p class="text-sm">${observation}</p>
            </div>`;
        } else {
          observation = `Ferramenta "${toolKey}" não disponível. Use: ${Object.keys(AgentsEngine.TOOLS).join(', ')}`;
          stepHtml += `
            <div class="agent-step-action mt-2">
              <span class="text-xs font-bold" style="color:#ef4444;">⚠️ Action: ${escapeHtml(toolKey || '?')}</span>
            </div>
            <div class="agent-step-observation mt-2">
              <span class="text-xs font-bold" style="color:#ef4444;">🔍 Observation:</span>
              <p class="text-sm">${observation}</p>
            </div>`;
        }

        stepEl.innerHTML = stepHtml;
        stepsContainer.appendChild(stepEl);

        // Add to conversation for next iteration
        messages.push({ role: 'assistant', content: raw });
        messages.push({ role: 'user', content: `Observation: ${observation}\n\nContinue com o próximo passo ou finalize com FINISH.` });
      }

      // If max steps reached without FINISH
      if (stepCount >= maxSteps) {
        const finalEl = document.getElementById('agent-final');
        if (finalEl && !finalEl.innerHTML) {
          finalEl.innerHTML = `
            <div class="card-flat" style="border-color:#f59e0b44;">
              <div class="flex items-center gap-2 mb-3">
                <span style="font-size:1.3rem;">⚠️</span>
                <strong style="color:#f59e0b;">Limite de passos atingido (${maxSteps})</strong>
              </div>
              <p class="text-sm text-muted">O agente não finalizou dentro do limite de passos.</p>
            </div>`;
        }
      }
    } catch (err) {
      container.innerHTML += `
        <div class="card-flat config-test-error mt-4">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (runBtn) { runBtn.disabled = false; runBtn.textContent = '⚡ Executar Agente'; }
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* =================== Quiz =================== */
  function startQuiz() {
    quizState = { current: 0, answers: [], startTime: Date.now() };
    document.getElementById('start-quiz-btn')?.closest('.card-flat')?.classList.add('hidden');
    document.getElementById('quiz-container')?.classList.remove('hidden');
    document.getElementById('quiz-results')?.classList.add('hidden');
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const c = document.getElementById('quiz-container');
    if (!c) return;
    const q = QUIZ_QUESTIONS[quizState.current];
    const n = quizState.current + 1, t = QUIZ_QUESTIONS.length;
    c.innerHTML = `<div class="card-flat quiz-card"><div class="flex items-center justify-between mb-4"><span class="badge badge-primary">Pergunta ${n}/${t}</span><div class="progress-bar" style="width:200px;"><div class="progress-fill" style="width:${(n/t)*100}%"></div></div></div><h3 class="mb-8">${q.question}</h3><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option" data-index="${i}"><span class="quiz-option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></button>`).join('')}</div></div>`;
    c.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', () => handleAnswer(parseInt(b.dataset.index))));
  }

  function handleAnswer(idx) {
    const q = QUIZ_QUESTIONS[quizState.current], ok = idx === q.correct;
    quizState.answers.push({ selected: idx, correct: q.correct, isCorrect: ok });
    const c = document.getElementById('quiz-container');
    c.querySelectorAll('.quiz-option').forEach((o, i) => { o.style.pointerEvents = 'none'; if (i === q.correct) o.classList.add('quiz-correct'); else if (i === idx && !ok) o.classList.add('quiz-wrong'); });
    const card = c.querySelector('.quiz-card'), expl = document.createElement('div');
    expl.className = `quiz-explanation ${ok ? 'correct' : 'wrong'} mt-4`;
    expl.innerHTML = `<p><strong>${ok ? '✅ Correto!' : '❌ Incorreto!'}</strong></p><p class="text-sm">${q.explanation}</p><button class="btn btn-primary mt-4 quiz-next-btn">${quizState.current < QUIZ_QUESTIONS.length - 1 ? 'Próxima →' : 'Ver Resultado'}</button>`;
    card.appendChild(expl);
    expl.querySelector('.quiz-next-btn').addEventListener('click', () => { quizState.current++; quizState.current < QUIZ_QUESTIONS.length ? renderQuizQuestion() : finishQuiz(); });
  }

  function finishQuiz() {
    const score = quizState.answers.filter(a => a.isCorrect).length, total = QUIZ_QUESTIONS.length, elapsed = Math.round((Date.now() - quizState.startTime) / 1000);
    const result = Progress.completeQuiz('agents', score, total);
    document.getElementById('quiz-container')?.classList.add('hidden');
    const r = document.getElementById('quiz-results'); if (!r) return; r.classList.remove('hidden');
    const pct = Math.round((score / total) * 100), msg = pct >= 100 ? '🏆 Perfeito!' : pct >= 70 ? '🎉 Muito bom!' : pct >= 40 ? '👍 Bom começo!' : '📚 Continue estudando!';
    r.innerHTML = `<div class="card-flat text-center"><h2>${msg}</h2><div class="module-stars mt-4 mb-4" style="font-size:2.5rem;">${[1, 2, 3].map(s => `<span class="star ${s <= result.stars ? 'earned' : ''}">★</span>`).join('')}</div><p class="text-lg">${score}/${total} corretas (${pct}%)</p><p class="text-muted">Tempo: ${elapsed}s</p><p class="text-muted text-sm mt-4">+${score * 10 + result.stars * 15} XP ganhos!</p><div class="flex justify-center gap-4 mt-8"><button class="btn btn-secondary" onclick="location.reload()">🔄 Tentar novamente</button><a href="#/" class="btn btn-primary">← Voltar à trilha</a></div></div>`;
    if (elapsed < 60 && score >= 4) Achievements.unlock('speedrunner'); Achievements.checkAll();
  }

  return { render, initInteractions };
})();
