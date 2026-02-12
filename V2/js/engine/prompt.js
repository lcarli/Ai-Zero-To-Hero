/* ============================================
   AIFORALL V2 — Prompt Engineering Engine
   Techniques, templates, analysis, comparison
   ============================================ */

const PromptEngine = (() => {

  /* ---- Prompt Techniques ---- */
  const TECHNIQUES = {
    zeroShot: {
      id: 'zeroShot',
      label: 'Zero-Shot',
      icon: '🎯',
      color: '#6366f1',
      desc: 'Pedir diretamente sem exemplos',
      when: 'Tarefas simples que o modelo já sabe fazer',
      template: '{instrução}',
      example: {
        prompt: 'Classifique o sentimento desta review: "O filme foi incrível, amei cada cena!"',
        response: 'Sentimento: Positivo',
      },
    },
    fewShot: {
      id: 'fewShot',
      label: 'Few-Shot',
      icon: '📝',
      color: '#10b981',
      desc: 'Dar exemplos antes da pergunta',
      when: 'O modelo precisa entender o formato ou padrão esperado',
      template: 'Exemplos:\n{exemplo1}\n{exemplo2}\n\nAgora: {pergunta}',
      example: {
        prompt: 'Classifique o sentimento:\n\n"Adorei o produto!" → Positivo\n"Péssimo atendimento" → Negativo\n"O filme foi ok" → Neutro\n\n"A comida estava maravilhosa!" →',
        response: 'Positivo',
      },
    },
    chainOfThought: {
      id: 'chainOfThought',
      label: 'Chain-of-Thought',
      icon: '🔗',
      color: '#f59e0b',
      desc: 'Pedir para raciocinar passo a passo',
      when: 'Problemas que exigem lógica, matemática ou raciocínio complexo',
      template: '{problema}\n\nPense passo a passo.',
      example: {
        prompt: 'Roger tem 5 bolas de tênis. Ele compra mais 2 tubos com 3 bolas cada. Quantas bolas ele tem agora?\n\nPense passo a passo.',
        response: 'Roger começa com 5 bolas.\nCada tubo tem 3 bolas.\n2 tubos × 3 bolas = 6 novas bolas.\n5 + 6 = 11 bolas no total.',
      },
    },
    roleplay: {
      id: 'roleplay',
      label: 'Role Prompting',
      icon: '🎭',
      color: '#8b5cf6',
      desc: 'Dar um papel/personagem ao modelo',
      when: 'Respostas que precisam de tom ou expertise específica',
      template: 'Você é {papel}.\n\n{instrução}',
      example: {
        prompt: 'Você é um professor de física para crianças de 10 anos.\n\nExplique o que é gravidade.',
        response: 'Sabe quando você joga uma bola pra cima e ela volta? Isso é a gravidade! A Terra é tão grande que ela "puxa" tudo pra perto dela, como um super ímã invisível...',
      },
    },
    structured: {
      id: 'structured',
      label: 'Output Estruturado',
      icon: '📋',
      color: '#06b6d4',
      desc: 'Especificar formato de saída',
      when: 'Quando precisa de JSON, tabela, lista ou formato específico',
      template: '{instrução}\n\nResponda em formato {formato}.',
      example: {
        prompt: 'Liste 3 linguagens de programação com prós e contras.\n\nResponda em formato JSON com campos: nome, pros (array), contras (array).',
        response: '[\n  {"nome": "Python", "pros": ["Fácil de aprender", "ML/AI"], "contras": ["Lento"]},\n  {"nome": "Rust", "pros": ["Rápido", "Seguro"], "contras": ["Curva de aprendizado"]},\n  {"nome": "JavaScript", "pros": ["Ubíquo", "Versátil"], "contras": ["Tipagem fraca"]}\n]',
      },
    },
    system: {
      id: 'system',
      label: 'System Prompt',
      icon: '⚙️',
      color: '#ef4444',
      desc: 'Definir contexto e regras globais',
      when: 'Chatbots, assistentes com comportamento consistente',
      template: 'SYSTEM: {regras e contexto}\n\nUSER: {pergunta}',
      example: {
        prompt: 'SYSTEM: Você é um assistente de culinária brasileira. Responda sempre com receitas que usam ingredientes típicos do Brasil. Seja animado e use emojis.\n\nUSER: O que posso fazer com mandioca?',
        response: '🇧🇷 Mandioca é demais! Aqui vão opções:\n\n🍟 Mandioca frita — corte em palitos, cozinhe e frite\n🫕 Escondidinho — purê de mandioca com carne seca\n🥮 Bolo de aipim — receita da vovó, derrete na boca!',
      },
    },
  };

  /* ---- Common Prompt Mistakes ---- */
  const MISTAKES = [
    {
      id: 'vague',
      label: '🌫️ Vago demais',
      bad: 'Me fale sobre IA.',
      good: 'Explique 3 diferenças entre Machine Learning supervisionado e não-supervisionado, com exemplos práticos.',
      tip: 'Seja específico: o quê, quantos, para quem, em que formato.',
    },
    {
      id: 'noContext',
      label: '🚫 Sem contexto',
      bad: 'Reescreva isso melhor.',
      good: 'Reescreva o parágrafo abaixo para um público empresarial, com tom profissional e no máximo 50 palavras:\n\n"A gente fez um app que é tipo muito legal e resolve o problema de fazer compras..."',
      tip: 'Sempre forneça o texto/dado de referência e defina o público-alvo.',
    },
    {
      id: 'noFormat',
      label: '📄 Sem formato',
      bad: 'Compare Python e JavaScript.',
      good: 'Compare Python e JavaScript em uma tabela Markdown com colunas: Critério, Python, JavaScript. Inclua: tipagem, velocidade, ecossistema, curva de aprendizado.',
      tip: 'Especifique o formato: tabela, JSON, lista numerada, código, etc.',
    },
    {
      id: 'tooMuch',
      label: '🤯 Muitas tarefas',
      bad: 'Escreva um artigo sobre IA, crie 5 tweets, faça um pitch deck e sugira um nome.',
      good: 'Escreva um artigo de 500 palavras sobre o impacto da IA na educação. Tom: informal e otimista. Público: professores do ensino médio.',
      tip: 'Uma tarefa por prompt. Divida tarefas complexas em etapas.',
    },
    {
      id: 'noConstraint',
      label: '♾️ Sem limites',
      bad: 'Escreva sobre história do Brasil.',
      good: 'Resuma os 3 eventos mais importantes da história do Brasil entre 1800 e 1900. Máximo 100 palavras por evento.',
      tip: 'Defina limites: tamanho, período, quantidade, escopo.',
    },
  ];

  /* ---- Prompt Analyzer ---- */
  function analyzePrompt(text) {
    const analysis = {
      length: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      issues: [],
      score: 100,
      suggestions: [],
      detected: [],
    };

    // Check for specificity
    if (analysis.wordCount < 8) {
      analysis.issues.push({ type: 'warning', msg: 'Prompt muito curto — pode ser vago demais' });
      analysis.suggestions.push('Adicione mais detalhes sobre o que exatamente você quer');
      analysis.score -= 20;
    }

    // Check for context
    const hasContext = /contexto|dado|texto|parágrafo|seguinte|abaixo|aqui/i.test(text);
    if (!hasContext && analysis.wordCount > 5) {
      analysis.suggestions.push('Considere adicionar contexto ou dados de referência');
      analysis.score -= 5;
    }

    // Check for format specification
    const hasFormat = /json|tabela|lista|formato|markdown|xml|csv|bullet|numerada|código/i.test(text);
    if (hasFormat) {
      analysis.detected.push('📋 Formato de saída especificado');
    } else {
      analysis.suggestions.push('Especifique o formato de saída desejado (tabela, lista, JSON...)');
      analysis.score -= 10;
    }

    // Check for role
    const hasRole = /você é|atue como|aja como|finja ser|como um|papel de|role|persona/i.test(text);
    if (hasRole) analysis.detected.push('🎭 Role prompting detectado');

    // Check for examples
    const hasExamples = /exemplo|por exemplo|e\.g\.|como:|→|=>/i.test(text);
    if (hasExamples) analysis.detected.push('📝 Few-shot (exemplos) detectado');

    // Check for step-by-step
    const hasCoT = /passo a passo|step by step|raciocine|explique seu|mostre o raciocínio|think/i.test(text);
    if (hasCoT) analysis.detected.push('🔗 Chain-of-Thought detectado');

    // Check for constraints
    const hasConstraints = /máximo|mínimo|no máximo|pelo menos|até \d|entre \d|\d palavras|\d itens|\d linhas/i.test(text);
    if (hasConstraints) {
      analysis.detected.push('📏 Restrições/limites definidos');
    } else {
      analysis.suggestions.push('Adicione limites: tamanho, quantidade, escopo');
      analysis.score -= 10;
    }

    // Check for audience
    const hasAudience = /público|audiência|leitor|para (um|uma|crianças|adultos|iniciantes|especialistas|programadores)/i.test(text);
    if (hasAudience) analysis.detected.push('👥 Público-alvo definido');

    // Check for negative constraints
    const hasNegative = /não (faça|inclua|use|mencione|escreva)|evite|sem |nunca /i.test(text);
    if (hasNegative) analysis.detected.push('🚫 Restrições negativas (o que NÃO fazer)');

    // Check punctuation/structure
    const hasStructure = text.includes('\n') || text.includes('1.') || text.includes('- ');
    if (hasStructure) analysis.detected.push('📐 Prompt bem estruturado');

    // Bonus for good practices
    analysis.score += analysis.detected.length * 5;
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    // Grade
    if (analysis.score >= 85) analysis.grade = { label: 'Excelente', color: '#10b981', emoji: '🌟' };
    else if (analysis.score >= 70) analysis.grade = { label: 'Bom', color: '#06b6d4', emoji: '👍' };
    else if (analysis.score >= 50) analysis.grade = { label: 'Razoável', color: '#f59e0b', emoji: '⚠️' };
    else analysis.grade = { label: 'Precisa melhorar', color: '#ef4444', emoji: '📝' };

    return analysis;
  }

  /* ---- Prompt Templates ---- */
  const TEMPLATES = {
    email: {
      label: '📧 E-mail Profissional',
      template: 'Escreva um e-mail profissional para {destinatário} sobre {assunto}.\n\nTom: {tom}\nTamanho: {tamanho}\nInclua: {itens}',
      fields: ['destinatário', 'assunto', 'tom', 'tamanho', 'itens'],
    },
    code: {
      label: '💻 Gerar Código',
      template: 'Escreva um {tipo} em {linguagem} que {funcionalidade}.\n\nRequisitos:\n- {req1}\n- {req2}\n\nInclua comentários explicativos.\nNível: {nível}',
      fields: ['tipo', 'linguagem', 'funcionalidade', 'req1', 'req2', 'nível'],
    },
    analysis: {
      label: '📊 Análise de Dados',
      template: 'Analise os seguintes dados e forneça:\n1. Resumo executivo (3 frases)\n2. Principais insights (top 3)\n3. Recomendações\n\nDados:\n{dados}\n\nFormato: {formato}',
      fields: ['dados', 'formato'],
    },
    creative: {
      label: '🎨 Escrita Criativa',
      template: 'Escreva {tipo_texto} sobre {tema}.\n\nEstilo: {estilo}\nTom: {tom}\nTamanho: máximo {palavras} palavras\nPúblico: {público}',
      fields: ['tipo_texto', 'tema', 'estilo', 'tom', 'palavras', 'público'],
    },
    summary: {
      label: '📝 Resumo',
      template: 'Resuma o texto abaixo em {formato}.\n\nTamanho: máximo {tamanho}\nFoco: {foco}\nPúblico: {público}\n\nTexto:\n{texto}',
      fields: ['formato', 'tamanho', 'foco', 'público', 'texto'],
    },
  };

  return {
    TECHNIQUES,
    MISTAKES,
    TEMPLATES,
    analyzePrompt,
  };
})();
