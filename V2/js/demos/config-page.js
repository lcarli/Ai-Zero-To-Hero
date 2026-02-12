/* ============================================
   AIFORALL V2 — Configuration Page
   API keys, provider selection, model testing
   ============================================ */

const ConfigPage = (() => {

  function render() {
    const config = FoundryService.getConfig();
    const providers = FoundryService.PROVIDERS;

    return `
      <div class="page config-page">
        <section class="section">
          <div class="container" style="max-width: 900px;">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar</a>

            <div class="config-header mb-8">
              <span style="font-size: 2.5rem;">⚙️</span>
              <div>
                <h1 style="margin:0;">Configurações</h1>
                <p class="text-muted">Configure API keys para usar modelos reais nos demos</p>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="card-flat mb-6" id="config-status">
              ${renderStatusBadge(config)}
            </div>

            <!-- Provider Selection -->
            <div class="card-flat mb-6">
              <h3>☁️ Provedor</h3>
              <p class="text-sm text-muted mb-4">Escolha qual serviço de IA você quer usar.</p>
              <div class="config-providers">
                ${Object.entries(providers).map(([key, p]) => `
                  <button class="config-provider-card ${config.provider === key ? 'active' : ''}"
                          data-provider="${key}"
                          style="--provider-color: ${p.color};">
                    <span style="font-size:1.5rem;">${p.icon}</span>
                    <strong>${p.name}</strong>
                    <span class="text-xs text-muted">${p.desc}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- API Configuration -->
            <div class="card-flat mb-6">
              <h3>🔑 Credenciais</h3>
              <p class="text-sm text-muted mb-4">Suas chaves são salvas apenas no localStorage do seu navegador. Nunca são enviadas a terceiros.</p>

              <div class="config-form">
                <div class="config-field">
                  <label class="config-label">Endpoint</label>
                  <input type="url" class="config-input" id="config-endpoint"
                         value="${escapeAttr(config.endpoint)}"
                         placeholder="${providers[config.provider]?.placeholder || 'https://...'}">
                  <span class="config-hint text-xs text-muted">URL base do serviço</span>
                </div>

                <div class="config-field">
                  <label class="config-label">API Key</label>
                  <div class="config-key-wrapper">
                    <input type="password" class="config-input" id="config-apikey"
                           value="${escapeAttr(config.apiKey)}"
                           placeholder="sk-... ou sua chave de API">
                    <button class="btn btn-ghost btn-sm config-toggle-key" id="toggle-key-btn" title="Mostrar/esconder">👁️</button>
                  </div>
                  <span class="config-hint text-xs text-muted">Sua chave secreta de API</span>
                </div>

                <div class="config-field">
                  <label class="config-label">Modelo</label>
                  <select class="config-input config-select" id="config-model">
                    ${(providers[config.provider]?.models || []).map(m =>
                      `<option value="${m}" ${config.model === m ? 'selected' : ''}>${m}</option>`
                    ).join('')}
                  </select>
                  <span class="config-hint text-xs text-muted">Modelo a ser usado nas chamadas</span>
                </div>

                <div class="config-field-row">
                  <div class="config-field" style="flex:1;">
                    <label class="config-label">Temperatura</label>
                    <div class="flex items-center gap-3">
                      <input type="range" class="config-range" id="config-temperature"
                             min="0" max="2" step="0.1" value="${config.temperature}">
                      <span class="config-range-value" id="temp-display">${config.temperature}</span>
                    </div>
                    <span class="config-hint text-xs text-muted">0 = determinístico, 2 = criativo</span>
                  </div>
                  <div class="config-field" style="flex:1;">
                    <label class="config-label">Max Tokens</label>
                    <input type="number" class="config-input" id="config-maxtokens"
                           value="${config.maxTokens}" min="50" max="4096" step="50">
                    <span class="config-hint text-xs text-muted">Limite de tokens na resposta</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mb-6 flex-wrap">
              <button class="btn btn-primary btn-lg" id="save-config-btn">💾 Salvar Configuração</button>
              <button class="btn btn-secondary btn-lg" id="test-config-btn">🧪 Testar Conexão</button>
              <button class="btn btn-ghost btn-lg" id="clear-config-btn">🗑️ Limpar Tudo</button>
            </div>

            <!-- Test Result -->
            <div id="test-result" class="hidden mb-6"></div>

            <!-- Playground -->
            <div class="card-flat mb-6">
              <h3>🎮 Playground</h3>
              <p class="text-sm text-muted mb-4">Teste o modelo com um prompt livre.</p>

              <div class="config-field">
                <textarea class="config-input config-textarea" id="playground-input"
                          placeholder="Faça uma pergunta ao modelo... Ex: Explique attention em 3 frases."
                          rows="3"></textarea>
              </div>

              <div class="flex gap-3 mt-3">
                <button class="btn btn-primary" id="playground-send" ${!FoundryService.isConfigured() ? 'disabled' : ''}>
                  ▶ Enviar
                </button>
                <button class="btn btn-ghost" id="playground-clear">🗑️ Limpar</button>
              </div>

              <div id="playground-output" class="hidden mt-4"></div>
            </div>

            <!-- Security Info -->
            <div class="card-flat" style="border-color: #f59e0b44;">
              <div class="flex items-center gap-3 mb-3">
                <span style="font-size: 1.5rem;">🔒</span>
                <h3 style="margin:0;">Segurança</h3>
              </div>
              <ul class="text-sm text-muted" style="list-style: disc; padding-left: 1.5rem; line-height: 1.8;">
                <li>Suas chaves ficam <strong>apenas no localStorage</strong> do seu navegador</li>
                <li>As chamadas são feitas <strong>diretamente do browser</strong> para a API</li>
                <li>Nenhum dado é enviado para servidores nossos</li>
                <li>Para CORS funcionar, seu endpoint precisa aceitar requests do browser</li>
                <li>Use chaves com permissões mínimas e rotacione regularmente</li>
                <li>Nunca compartilhe o localStorage de navegadores públicos</li>
              </ul>
            </div>

          </div>
        </section>
      </div>
    `;
  }

  function renderStatusBadge(config) {
    if (config.apiKey && config.endpoint && config.model) {
      return `
        <div class="config-status-badge config-status-ok">
          <span style="font-size:1.3rem;">🟢</span>
          <div>
            <strong>Configurado</strong>
            <span class="text-xs text-muted">${FoundryService.PROVIDERS[config.provider]?.name || config.provider} · ${config.model}</span>
          </div>
        </div>`;
    }
    return `
      <div class="config-status-badge config-status-empty">
        <span style="font-size:1.3rem;">🔴</span>
        <div>
          <strong>Não Configurado</strong>
          <span class="text-xs text-muted">Preencha os campos abaixo para usar modelos reais</span>
        </div>
      </div>`;
  }

  function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /* =================== Interactions =================== */
  function initInteractions() {
    // Provider selection
    document.querySelectorAll('.config-provider-card').forEach(card => {
      card.addEventListener('click', () => {
        const provider = card.dataset.provider;
        const config = FoundryService.getConfig();
        config.provider = provider;
        config.model = FoundryService.PROVIDERS[provider]?.models[0] || '';
        FoundryService.saveConfig(config);
        // Re-render
        const app = document.getElementById('app');
        app.innerHTML = render();
        initInteractions();
        Toast.show(`Provedor: ${FoundryService.PROVIDERS[provider].name}`, 'info');
      });
    });

    // Toggle key visibility
    document.getElementById('toggle-key-btn')?.addEventListener('click', () => {
      const input = document.getElementById('config-apikey');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });

    // Temperature slider
    document.getElementById('config-temperature')?.addEventListener('input', (e) => {
      const display = document.getElementById('temp-display');
      if (display) display.textContent = e.target.value;
    });

    // Save
    document.getElementById('save-config-btn')?.addEventListener('click', saveConfiguration);

    // Test
    document.getElementById('test-config-btn')?.addEventListener('click', testConnection);

    // Clear
    document.getElementById('clear-config-btn')?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todas as configurações de API?')) {
        FoundryService.clearConfig();
        const app = document.getElementById('app');
        app.innerHTML = render();
        initInteractions();
        Toast.show('Configurações limpas.', 'info');
      }
    });

    // Playground
    document.getElementById('playground-send')?.addEventListener('click', sendPlayground);
    document.getElementById('playground-clear')?.addEventListener('click', () => {
      const output = document.getElementById('playground-output');
      if (output) { output.classList.add('hidden'); output.innerHTML = ''; }
      const input = document.getElementById('playground-input');
      if (input) input.value = '';
    });

    // Enter to send in playground
    document.getElementById('playground-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendPlayground();
      }
    });
  }

  /* ---- Save ---- */
  function saveConfiguration() {
    const config = FoundryService.getConfig();
    config.endpoint = document.getElementById('config-endpoint')?.value?.trim() || '';
    config.apiKey = document.getElementById('config-apikey')?.value?.trim() || '';
    config.model = document.getElementById('config-model')?.value || '';
    config.temperature = parseFloat(document.getElementById('config-temperature')?.value) || 0.7;
    config.maxTokens = parseInt(document.getElementById('config-maxtokens')?.value) || 800;

    FoundryService.saveConfig(config);

    // Update status badge
    const statusEl = document.getElementById('config-status');
    if (statusEl) statusEl.innerHTML = renderStatusBadge(config);

    // Enable playground
    const playBtn = document.getElementById('playground-send');
    if (playBtn) playBtn.disabled = !FoundryService.isConfigured();

    Toast.show('✅ Configuração salva!', 'success');
  }

  /* ---- Test ---- */
  async function testConnection() {
    // Save first
    saveConfiguration();

    const resultEl = document.getElementById('test-result');
    if (!resultEl) return;

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
      <div class="card-flat config-test-loading">
        <div class="spinner"></div>
        <span>Testando conexão...</span>
      </div>`;

    const result = await FoundryService.testConnection();

    if (result.success) {
      resultEl.innerHTML = `
        <div class="card-flat config-test-success">
          <div class="flex items-center gap-3 mb-3">
            <span style="font-size:1.5rem;">✅</span>
            <strong style="color:#10b981;">Conexão bem-sucedida!</strong>
          </div>
          <p class="text-sm">${escapeHtml(result.message)}</p>
          <div class="flex gap-4 mt-3 text-xs text-muted">
            <span>⏱️ ${result.elapsed}ms</span>
            <span>🤖 ${result.model}</span>
            ${result.usage?.total_tokens ? `<span>📊 ${result.usage.total_tokens} tokens</span>` : ''}
          </div>
        </div>`;
      Toast.show('Conexão OK! ✅', 'success');
    } else {
      resultEl.innerHTML = `
        <div class="card-flat config-test-error">
          <div class="flex items-center gap-3 mb-3">
            <span style="font-size:1.5rem;">❌</span>
            <strong style="color:#ef4444;">Erro na conexão</strong>
          </div>
          <p class="text-sm" style="color:#ef4444;">${escapeHtml(result.message)}</p>
          <div class="text-xs text-muted mt-3">
            <p>Verifique:</p>
            <ul style="list-style:disc; padding-left:1.5rem; margin-top:0.5rem;">
              <li>O endpoint está correto e acessível</li>
              <li>A API key é válida e tem permissões</li>
              <li>O modelo está deployado/disponível</li>
              <li>CORS permite requests do browser</li>
            </ul>
          </div>
        </div>`;
      Toast.show('Erro na conexão ❌', 'error');
    }
  }

  /* ---- Playground ---- */
  async function sendPlayground() {
    const input = document.getElementById('playground-input');
    const output = document.getElementById('playground-output');
    if (!input || !output) return;

    const prompt = input.value.trim();
    if (!prompt) { Toast.show('Digite um prompt.', 'info'); return; }

    if (!FoundryService.isConfigured()) {
      Toast.show('Configure a API primeiro.', 'error');
      return;
    }

    output.classList.remove('hidden');
    output.innerHTML = `
      <div class="card-flat config-test-loading">
        <div class="spinner"></div>
        <span>Gerando resposta...</span>
      </div>`;

    try {
      const result = await FoundryService.ask(prompt);
      output.innerHTML = `
        <div class="card-flat">
          <div class="flex items-center justify-between mb-3">
            <strong>🤖 Resposta</strong>
            <div class="flex gap-3 text-xs text-muted">
              <span>⏱️ ${result.elapsed}ms</span>
              <span>🤖 ${result.model}</span>
              ${result.usage?.total_tokens ? `<span>📊 ${result.usage.total_tokens} tokens</span>` : ''}
            </div>
          </div>
          <div class="playground-response">${formatResponse(result.content)}</div>
        </div>`;
    } catch (err) {
      output.innerHTML = `
        <div class="card-flat config-test-error">
          <strong style="color:#ef4444;">❌ Erro:</strong>
          <p class="text-sm mt-2">${escapeHtml(err.message)}</p>
        </div>`;
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatResponse(text) {
    // Basic markdown-like formatting
    return escapeHtml(text)
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="prompt-pre"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--surface);padding:0.1em 0.3em;border-radius:3px;">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  return { render, initInteractions };
})();
