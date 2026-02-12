/* ============================================
   AIFORALL V2 — Azure AI Foundry Service
   API key management + real model integration
   ============================================ */

const FoundryService = (() => {
  const STORAGE_KEY = 'aiforall_foundry_config';

  // Supported providers / endpoints
  const PROVIDERS = {
    'azure-foundry': {
      name: 'Azure AI Foundry',
      icon: '☁️',
      color: '#0078d4',
      placeholder: 'https://<resource>.services.ai.azure.com',
      desc: 'Azure AI Foundry (antigo Azure OpenAI). Suporta GPT-4o, GPT-4o-mini, Phi, Mistral, etc.',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-5.2', 'o3-mini', 'o4-mini', 'phi-4', 'mistral-large'],
      headers: (config) => ({
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      }),
      buildUrl: (config, path) => {
        const base = config.endpoint.replace(/\/+$/, '');
        return `${base}/openai/deployments/${config.model}/chat/completions?api-version=2025-01-01-preview`;
      },
    },
    'openai': {
      name: 'OpenAI',
      icon: '🟢',
      color: '#10a37f',
      placeholder: 'https://api.openai.com',
      desc: 'API direta da OpenAI. GPT-4o, o3, o4-mini, etc.',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3-mini', 'o4-mini'],
      headers: (config) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      }),
      buildUrl: (config) => {
        const base = config.endpoint?.replace(/\/+$/, '') || 'https://api.openai.com';
        return `${base}/v1/chat/completions`;
      },
    },
    'github-models': {
      name: 'GitHub Models',
      icon: '🐙',
      color: '#8b5cf6',
      placeholder: 'https://models.github.ai',
      desc: 'GitHub Models — acesso gratuito a modelos via token GitHub.',
      models: ['openai/gpt-4o', 'openai/gpt-4o-mini', 'meta/llama-4-scout', 'mistral/mistral-large', 'deepseek/DeepSeek-R1'],
      headers: (config) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      }),
      buildUrl: (config) => {
        const base = config.endpoint?.replace(/\/+$/, '') || 'https://models.github.ai';
        return `${base}/inference/chat/completions`;
      },
    },
  };

  // Default config
  const DEFAULT_CONFIG = {
    provider: 'azure-foundry',
    endpoint: '',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 800,
  };

  /* ---- Storage ---- */
  function getConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
    } catch { return { ...DEFAULT_CONFIG }; }
  }

  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isConfigured() {
    const c = getConfig();
    return !!(c.apiKey && c.endpoint && c.model);
  }

  /* ---- API Calls ---- */
  async function chatCompletion(messages, options = {}) {
    const config = getConfig();
    if (!isConfigured()) {
      throw new Error('API não configurada. Vá em ⚙️ Configurações para adicionar sua chave.');
    }

    const provider = PROVIDERS[config.provider];
    if (!provider) throw new Error(`Provider "${config.provider}" não suportado.`);

    const url = provider.buildUrl(config);
    const headers = provider.headers(config);

    const body = {
      messages,
      temperature: options.temperature ?? config.temperature,
      max_completion_tokens: options.maxTokens ?? config.maxTokens,
    };

    // For OpenAI / GitHub Models, we include model in body
    if (config.provider !== 'azure-foundry') {
      body.model = config.model;
    }

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        content: choice?.message?.content || '',
        role: choice?.message?.role || 'assistant',
        model: data.model || config.model,
        usage: data.usage || {},
        elapsed,
        provider: config.provider,
      };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Erro de rede. Verifique o endpoint e sua conexão.');
      }
      throw err;
    }
  }

  /* ---- Streaming + Logprobs ---- */
  async function streamChatCompletion(messages, options = {}, onToken) {
    const config = getConfig();
    if (!isConfigured()) {
      throw new Error('API não configurada. Vá em ⚙️ Configurações para adicionar sua chave.');
    }

    const provider = PROVIDERS[config.provider];
    if (!provider) throw new Error(`Provider "${config.provider}" não suportado.`);

    const url = provider.buildUrl(config);
    const headers = provider.headers(config);

    const body = {
      messages,
      temperature: options.temperature ?? config.temperature,
      max_completion_tokens: options.maxTokens ?? config.maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    };

    if (options.logprobs) {
      body.logprobs = true;
      body.top_logprobs = options.topLogprobs ?? 5;
    }

    if (config.provider !== 'azure-foundry') {
      body.model = config.model;
    }

    const startTime = performance.now();
    let fullContent = '';
    let usage = {};
    let model = config.model;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
      throw new Error(`API Error (${response.status}): ${errorMsg}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') continue;

        try {
          const chunk = JSON.parse(dataStr);
          if (chunk.model) model = chunk.model;
          if (chunk.usage) usage = chunk.usage;

          const choice = chunk.choices?.[0];
          if (!choice) continue;

          const content = choice.delta?.content;
          if (content) {
            fullContent += content;
            const tokenData = {
              content,
              fullContent,
              logprobs: null,
            };

            // Extract logprobs if available
            const lp = choice.logprobs?.content;
            if (lp && lp.length > 0) {
              tokenData.logprobs = {
                token: lp[0].token,
                logprob: lp[0].logprob,
                prob: Math.exp(lp[0].logprob),
                topLogprobs: (lp[0].top_logprobs || []).map(t => ({
                  token: t.token,
                  logprob: t.logprob,
                  prob: Math.exp(t.logprob),
                })),
              };
            }

            if (onToken) onToken(tokenData);
          }
        } catch (e) { /* skip malformed chunks */ }
      }
    }

    const elapsed = Math.round(performance.now() - startTime);

    return {
      content: fullContent,
      role: 'assistant',
      model,
      usage,
      elapsed,
      provider: config.provider,
    };
  }

  /* ---- Image Generation ---- */
  async function generateImage(prompt, options = {}) {
    const config = getConfig();
    if (!isConfigured()) {
      throw new Error('API não configurada. Vá em ⚙️ Configurações para adicionar sua chave.');
    }

    // Image deployment name — from config.local.js or fallback
    const imageModel = options.imageModel || 'gpt-image-1.5';
    const size = options.size || '1024x1024';
    const quality = options.quality || 'auto';
    const n = options.n || 1;

    let url, headers;

    if (config.provider === 'azure-foundry') {
      const base = config.endpoint.replace(/\/+$/, '');
      url = `${base}/openai/deployments/${imageModel}/images/generations?api-version=2025-04-01-preview`;
      headers = {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      };
    } else if (config.provider === 'openai') {
      const base = config.endpoint?.replace(/\/+$/, '') || 'https://api.openai.com';
      url = `${base}/v1/images/generations`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      };
    } else {
      throw new Error('Geração de imagem não suportada neste provider.');
    }

    const body = { prompt, n, size, quality };

    // For OpenAI direct, include model in body
    if (config.provider !== 'azure-foundry') {
      body.model = imageModel;
    }

    // Request b64_json to avoid CORS issues with temporary URLs
    body.output_format = 'png';

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const images = (data.data || []).map(img => ({
        b64: img.b64_json || null,
        url: img.url || null,
        revisedPrompt: img.revised_prompt || prompt,
      }));

      return {
        images,
        elapsed,
        provider: config.provider,
        model: imageModel,
      };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Erro de rede. Verifique o endpoint e sua conexão.');
      }
      throw err;
    }
  }

  /* ---- Convenience Methods ---- */
  async function ask(prompt, systemPrompt = 'Você é um assistente especialista em IA e machine learning. Responda de forma clara e concisa em português.') {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];
    return chatCompletion(messages);
  }

  async function testConnection() {
    try {
      const result = await ask('Responda apenas: "Conexão OK! 🟢"', 'Responda exatamente o que foi pedido, sem nada mais.');
      return { success: true, message: result.content, elapsed: result.elapsed, model: result.model, usage: result.usage };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /* ---- Structured generation for modules ---- */
  async function generateForModule(module, prompt) {
    const systemPrompts = {
      tokenization: 'Você é um especialista em NLP. Explique tokenização, BPE, subwords de forma didática.',
      embeddings: 'Você é um especialista em representações vetoriais. Explique embeddings, word2vec, similaridade.',
      attention: 'Você é um especialista em mecanismos de atenção. Explique self-attention, multi-head attention.',
      llm: 'Você é um especialista em Large Language Models. Explique arquiteturas, treinamento, inferência.',
      lstm: 'Você é um especialista em redes recorrentes. Explique LSTM, gates, memória de longo prazo.',
      vision: 'Você é um especialista em visão computacional. Explique CNNs, convoluções, arquiteturas.',
      'prompt-engineering': 'Você é um especialista em prompt engineering. Explique técnicas, padrões, otimizações.',
      rag: 'Você é um especialista em RAG. Explique retrieval, augmentation, geração com contexto.',
      agents: 'Você é um especialista em AI Agents. Explique loops, ferramentas, padrões como ReAct.',
      'image-gen': 'Você é um especialista em geração de imagens por IA. Explique difusão, DALL-E, VAE, CLIP, arquiteturas.',
    };

    const sys = systemPrompts[module] || 'Você é um assistente especialista em IA. Responda em português.';
    return ask(prompt, sys);
  }

  return {
    PROVIDERS,
    DEFAULT_CONFIG,
    getConfig,
    saveConfig,
    clearConfig,
    isConfigured,
    chatCompletion,
    streamChatCompletion,
    generateImage,
    ask,
    testConnection,
    generateForModule,
  };
})();
