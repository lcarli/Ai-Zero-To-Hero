/* ============================================
   AIFORALL V2 — RAG Engine
   Retrieval-Augmented Generation simulation
   ============================================ */

const RAGEngine = (() => {

  /* ---- Knowledge Base (mini document store) ---- */
  const DOCUMENTS = [
    { id: 1, title: 'Python Basics', content: 'Python é uma linguagem de programação interpretada, de alto nível e tipagem dinâmica. Criada por Guido van Rossum em 1991. É amplamente usada em data science, machine learning e desenvolvimento web.', tags: ['python', 'programação', 'linguagem'] },
    { id: 2, title: 'JavaScript', content: 'JavaScript é a linguagem da web. Roda no navegador e no servidor (Node.js). É essencial para front-end, back-end e aplicações full-stack. Criada por Brendan Eich em 1995.', tags: ['javascript', 'web', 'programação'] },
    { id: 3, title: 'Machine Learning', content: 'Machine Learning é um subcampo de IA onde sistemas aprendem padrões a partir de dados. Os 3 tipos principais são: supervisionado (com labels), não-supervisionado (sem labels) e por reforço (reward).', tags: ['ml', 'ia', 'dados'] },
    { id: 4, title: 'Deep Learning', content: 'Deep Learning usa redes neurais profundas com muitas camadas. Revolucionou visão computacional, NLP e geração de conteúdo. Exemplos: CNNs para imagens, Transformers para texto.', tags: ['deep learning', 'redes neurais', 'ia'] },
    { id: 5, title: 'Transformers', content: 'Transformers são uma arquitetura de rede neural baseada em self-attention. Introduzidos no paper "Attention is All You Need" (2017). Base do GPT, BERT, T5 e todos os LLMs modernos.', tags: ['transformers', 'attention', 'nlp'] },
    { id: 6, title: 'LLMs', content: 'Large Language Models são modelos de linguagem treinados em bilhões de tokens. GPT-4, Claude, Llama e Gemini são exemplos. Usam a arquitetura Transformer e geram texto autoregressivamente.', tags: ['llm', 'gpt', 'ia'] },
    { id: 7, title: 'Embeddings', content: 'Embeddings são representações vetoriais de palavras ou documentos. Palavras similares ficam próximas no espaço vetorial. Modelos como Word2Vec, GloVe e sentence-transformers geram embeddings.', tags: ['embeddings', 'vetores', 'nlp'] },
    { id: 8, title: 'Vector Databases', content: 'Vector databases armazenam e buscam embeddings eficientemente. Exemplos: Pinecone, Weaviate, Chroma, FAISS, Qdrant. Usam algoritmos como HNSW e IVF para busca aproximada de vizinhos mais próximos (ANN).', tags: ['vector db', 'banco de dados', 'embeddings'] },
    { id: 9, title: 'Prompt Engineering', content: 'Prompt Engineering é a arte de formular instruções eficazes para LLMs. Técnicas incluem: zero-shot, few-shot, chain-of-thought, role prompting e output estruturado.', tags: ['prompt', 'engenharia', 'llm'] },
    { id: 10, title: 'Fine-tuning', content: 'Fine-tuning é o processo de continuar treinando um modelo pré-treinado em dados específicos do seu domínio. Mais barato que treinar do zero. LoRA e QLoRA são técnicas eficientes de fine-tuning.', tags: ['fine-tuning', 'treinamento', 'ia'] },
    { id: 11, title: 'RAG', content: 'RAG (Retrieval-Augmented Generation) combina busca em documentos com geração de texto por LLMs. Primeiro busca documentos relevantes, depois os usa como contexto para gerar respostas precisas e atualizadas.', tags: ['rag', 'retrieval', 'geração'] },
    { id: 12, title: 'Agents', content: 'AI Agents são sistemas que percebem o ambiente, tomam decisões e executam ações. Usam LLMs como "cérebro" e ferramentas externas (APIs, bancos, buscadores) para resolver tarefas complexas autonomamente.', tags: ['agents', 'agentes', 'ia'] },
  ];

  /* ---- Simple TF-IDF-like similarity ---- */
  function tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\wàáâãéêíóôõúç\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  function computeSimilarity(queryTokens, docTokens) {
    const docSet = new Set(docTokens);
    let matches = 0;
    for (const qt of queryTokens) {
      for (const dt of docSet) {
        if (dt.includes(qt) || qt.includes(dt)) { matches++; break; }
      }
    }
    return queryTokens.length > 0 ? matches / queryTokens.length : 0;
  }

  /** Retrieve top-K relevant documents for a query */
  function retrieve(query, topK = 3) {
    const qTokens = tokenize(query);
    const scored = DOCUMENTS.map(doc => {
      const contentTokens = tokenize(doc.content);
      const titleTokens = tokenize(doc.title);
      const tagTokens = doc.tags.flatMap(t => tokenize(t));
      const allTokens = [...contentTokens, ...titleTokens, ...tagTokens];
      const score = computeSimilarity(qTokens, allTokens);
      return { ...doc, score: Math.round(score * 100) / 100 };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /** Simulate the full RAG pipeline */
  function runPipeline(query, topK = 3) {
    const startTime = performance.now();

    // Step 1: Embed query (simulated)
    const queryTokens = tokenize(query);

    // Step 2: Retrieve
    const retrieved = retrieve(query, topK);

    // Step 3: Build context
    const context = retrieved
      .filter(d => d.score > 0)
      .map(d => `[${d.title}]: ${d.content}`)
      .join('\n\n');

    // Step 4: Build augmented prompt
    const augmentedPrompt = context
      ? `Use o seguinte contexto para responder à pergunta.\n\nContexto:\n${context}\n\nPergunta: ${query}\n\nResposta:`
      : `Pergunta: ${query}\n\nResposta (sem contexto disponível):`;

    // Step 5: Simulate LLM generation
    const hasContext = retrieved.some(d => d.score > 0.2);
    const answer = hasContext
      ? `Com base nos documentos encontrados, ${generateSimpleAnswer(query, retrieved)}`
      : `Sem documentos relevantes encontrados na base de conhecimento para essa pergunta.`;

    const elapsed = Math.round(performance.now() - startTime);

    return {
      query,
      queryTokens,
      retrieved,
      context,
      augmentedPrompt,
      answer,
      elapsed,
      steps: [
        { name: 'Tokenizar Query', desc: `Extraiu ${queryTokens.length} tokens`, icon: '🔤', time: Math.round(elapsed * 0.1) },
        { name: 'Buscar Documentos', desc: `${retrieved.filter(d => d.score > 0).length} documentos relevantes`, icon: '🔍', time: Math.round(elapsed * 0.3) },
        { name: 'Construir Contexto', desc: `${context.length} caracteres de contexto`, icon: '📄', time: Math.round(elapsed * 0.1) },
        { name: 'Prompt Aumentado', desc: 'Query + contexto combinados', icon: '✍️', time: Math.round(elapsed * 0.1) },
        { name: 'Gerar Resposta', desc: 'LLM processa com contexto', icon: '🤖', time: Math.round(elapsed * 0.4) },
      ],
    };
  }

  function generateSimpleAnswer(query, docs) {
    const topDoc = docs[0];
    if (!topDoc || topDoc.score <= 0) return 'não foi possível gerar uma resposta relevante.';
    const sentences = topDoc.content.split('. ');
    return sentences.slice(0, 2).join('. ') + '.';
  }

  /* ---- RAG vs No-RAG comparison ---- */
  const COMPARISON = {
    withRAG: {
      label: 'Com RAG',
      icon: '📚',
      color: '#10b981',
      pros: ['Respostas baseadas em fatos (seus dados)', 'Sempre atualizado (busca em tempo real)', 'Menos alucinação', 'Citações e fontes disponíveis'],
      cons: ['Mais lento (busca + geração)', 'Precisa de vector database', 'Qualidade depende dos documentos'],
    },
    withoutRAG: {
      label: 'Sem RAG (LLM puro)',
      icon: '🧠',
      color: '#f59e0b',
      pros: ['Mais rápido (só geração)', 'Implementação simples', 'Bom para conhecimento geral'],
      cons: ['Alucina (inventa fatos)', 'Conhecimento desatualizado (cutoff date)', 'Não sabe sobre seus dados', 'Sem fontes verificáveis'],
    },
  };

  /* ---- Pipeline steps for visualization ---- */
  const PIPELINE_STEPS = [
    { name: 'User Query', icon: '💬', desc: 'Pergunta do usuário', color: '#6366f1' },
    { name: 'Embedding', icon: '📐', desc: 'Transforma query em vetor', color: '#8b5cf6' },
    { name: 'Vector Search', icon: '🔍', desc: 'Busca documentos similares', color: '#06b6d4' },
    { name: 'Top-K Docs', icon: '📄', desc: 'Seleciona K mais relevantes', color: '#14b8a6' },
    { name: 'Augmented Prompt', icon: '✍️', desc: 'Query + contexto dos docs', color: '#f59e0b' },
    { name: 'LLM Generation', icon: '🤖', desc: 'Gera resposta com contexto', color: '#10b981' },
    { name: 'Answer', icon: '✅', desc: 'Resposta fundamentada', color: '#22c55e' },
  ];

  return {
    DOCUMENTS,
    COMPARISON,
    PIPELINE_STEPS,
    retrieve,
    runPipeline,
    tokenize,
  };
})();
