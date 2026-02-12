/* ============================================
   AIFORALL V2 — RAG Demo
   Pipeline, retrieval, comparison, quiz
   ============================================ */

const RAGDemo = (() => {

  function render() {
    const state = Progress.getState();
    const mState = state.modules.rag || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header">
              <span style="font-size: 3rem;">📚</span>
              <div>
                <h1>RAG</h1>
                <p>Retrieval-Augmented Generation — busca + geração combinadas</p>
              </div>
            </div>

            <div class="tab-bar">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="pipeline">🔄 Pipeline</button>
              <button class="tab" data-tab="search">🔍 Buscar</button>
              <button class="tab" data-tab="compare">⚔️ Com vs Sem RAG</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <div id="tab-learn" class="tab-content active">${renderLearnTab()}</div>
            <div id="tab-pipeline" class="tab-content hidden">${renderPipelineTab()}</div>
            <div id="tab-search" class="tab-content hidden">${renderSearchTab()}</div>
            <div id="tab-compare" class="tab-content hidden">${renderCompareTab()}</div>
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
          <h3>📚 O que é RAG?</h3>
          <p><strong>Retrieval-Augmented Generation</strong> é uma técnica que combina busca de informação
          com geração de texto por LLMs. Em vez de depender apenas do conhecimento interno do modelo,
          RAG busca documentos relevantes e os usa como contexto.</p>
          <p class="mt-2 text-sm text-muted">Analogia: É como ter um assistente que, antes de responder,
          pesquisa em livros e documentos os fatos corretos — em vez de responder "de cabeça".</p>
        </div>

        <div class="card-flat mb-8">
          <h3>🔄 O Fluxo RAG</h3>
          <div class="rag-flow mt-4">
            ${RAGEngine.PIPELINE_STEPS.map((s, i) => `
              <div class="rag-flow-step" style="border-color:${s.color}44;">
                <span style="font-size:1.5rem;">${s.icon}</span>
                <strong class="text-sm" style="color:${s.color};">${s.name}</strong>
                <span class="text-xs text-muted">${s.desc}</span>
              </div>
              ${i < RAGEngine.PIPELINE_STEPS.length - 1 ? '<span class="rag-flow-arrow">→</span>' : ''}
            `).join('')}
          </div>
        </div>

        <div class="card-flat mb-8">
          <h3>🗄️ Componentes Essenciais</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            ${[
              ['📐', 'Embedding Model', 'Transforma texto em vetores numéricos (ex: Ada, sentence-transformers)', '#8b5cf6'],
              ['🗃️', 'Vector Database', 'Armazena e busca vetores (Pinecone, Chroma, FAISS, Weaviate)', '#06b6d4'],
              ['🔍', 'Retriever', 'Busca os Top-K documentos mais similares à query', '#14b8a6'],
              ['🤖', 'LLM Generator', 'Gera resposta usando query + documentos como contexto', '#10b981'],
            ].map(([icon, title, desc, color]) => `
              <div class="card-flat" style="border-left: 3px solid ${color};">
                <div class="flex items-center gap-2">
                  <span style="font-size:1.3rem;">${icon}</span>
                  <strong style="color:${color};">${title}</strong>
                </div>
                <p class="text-xs text-muted mt-2">${desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card-flat">
          <h3>🎯 Quando usar RAG?</h3>
          <div class="grid grid-cols-2 gap-4 mt-4">
            ${[
              ['✅', 'Chatbots com conhecimento próprio', 'Atendimento ao cliente, FAQ interna'],
              ['✅', 'Documentação técnica', 'Buscar em docs e gerar respostas'],
              ['✅', 'Dados que mudam frequentemente', 'Preços, estoque, notícias recentes'],
              ['✅', 'Reduzir alucinação', 'Fundamentar respostas em fatos reais'],
              ['❌', 'Conversa casual', 'Não precisa de busca em docs'],
              ['❌', 'Tarefas criativas', 'Geração de ficção, poesia, brainstorm'],
            ].map(([icon, title, desc]) => `
              <div class="flex items-center gap-3">
                <span style="font-size:1.2rem;">${icon}</span>
                <div><strong class="text-sm">${title}</strong><br><span class="text-xs text-muted">${desc}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Pipeline =================== */
  function renderPipelineTab() {
    return `
      <div class="pipeline-section">
        <div class="card-flat mb-4">
          <h3>🔄 Simule o Pipeline RAG</h3>
          <p class="text-sm text-muted">Faça uma pergunta e veja cada etapa do RAG em ação, com documentos reais sendo buscados.</p>
          <div class="flex gap-4 items-center mt-4 flex-wrap">
            <input id="rag-query" class="input" value="O que são Transformers?" placeholder="Faça uma pergunta..." style="flex:1;min-width:250px;">
            <div>
              <label class="text-xs">Top-K:</label>
              <select id="rag-topk" class="input" style="width:70px;">
                <option value="2">2</option>
                <option value="3" selected>3</option>
                <option value="5">5</option>
              </select>
            </div>
            <button class="btn btn-primary" id="rag-run-btn">Executar RAG</button>
          </div>
          <div class="flex gap-2 mt-3 flex-wrap">
            <span class="text-xs text-muted">Sugestões:</span>
            ${['O que são Transformers?', 'Explique embeddings', 'Python vs JavaScript', 'O que é deep learning?', 'Como funciona RAG?'].map(q =>
              `<button class="btn btn-sm btn-ghost rag-suggest" data-query="${q}">${q}</button>`
            ).join('')}
          </div>
        </div>
        <div id="rag-pipeline-result" class="mt-4"></div>
      </div>
    `;
  }

  /* =================== Search =================== */
  function renderSearchTab() {
    return `
      <div class="search-section">
        <div class="card-flat mb-4">
          <h3>🔍 Explore a Base de Conhecimento</h3>
          <p class="text-sm text-muted">Veja os ${RAGEngine.DOCUMENTS.length} documentos armazenados e como a busca por similaridade funciona.</p>
        </div>

        <div class="card-flat mb-4">
          <h4>🗃️ Todos os Documentos (${RAGEngine.DOCUMENTS.length})</h4>
          <div class="flex flex-col gap-3 mt-4">
            ${RAGEngine.DOCUMENTS.map(d => `
              <div class="card-flat rag-doc-card">
                <div class="flex items-center justify-between">
                  <strong class="text-sm">${d.title}</strong>
                  <span class="badge badge-primary text-xs">#${d.id}</span>
                </div>
                <p class="text-xs text-muted mt-1">${d.content.slice(0, 120)}...</p>
                <div class="flex gap-1 mt-2">
                  ${d.tags.map(t => `<span class="token-chip text-xs">${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =================== Compare =================== */
  function renderCompareTab() {
    const { withRAG, withoutRAG } = RAGEngine.COMPARISON;
    return `
      <div class="compare-section">
        <div class="card-flat mb-6">
          <h3>⚔️ Com RAG vs Sem RAG</h3>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="card-flat" style="border-color:${withRAG.color}44;">
            <h4 style="color:${withRAG.color};">${withRAG.icon} ${withRAG.label}</h4>
            <h5 class="mt-4 text-sm">✅ Prós:</h5>
            <ul class="text-sm">${withRAG.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            <h5 class="mt-4 text-sm">❌ Contras:</h5>
            <ul class="text-sm">${withRAG.cons.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div class="card-flat" style="border-color:${withoutRAG.color}44;">
            <h4 style="color:${withoutRAG.color};">${withoutRAG.icon} ${withoutRAG.label}</h4>
            <h5 class="mt-4 text-sm">✅ Prós:</h5>
            <ul class="text-sm">${withoutRAG.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            <h5 class="mt-4 text-sm">❌ Contras:</h5>
            <ul class="text-sm">${withoutRAG.cons.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="card-flat mt-6">
          <h4>💡 Exemplo Prático</h4>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="prompt-block" style="border-color:#f59e0b44;background:#f59e0b08;">
              <span class="text-xs font-bold" style="color:#f59e0b;">🧠 Sem RAG:</span>
              <p class="text-sm mt-2"><em>"Qual o preço do produto X?"</em></p>
              <p class="text-sm mt-1">→ "Não tenho acesso a informações de preço atualizadas..." ou inventa um preço.</p>
            </div>
            <div class="prompt-block" style="border-color:#10b98144;background:#10b98108;">
              <span class="text-xs font-bold" style="color:#10b981;">📚 Com RAG:</span>
              <p class="text-sm mt-2"><em>"Qual o preço do produto X?"</em></p>
              <p class="text-sm mt-1">→ Busca na base → Encontra doc com preço → "O produto X custa R$ 99,90 (fonte: catálogo 2025)"</p>
            </div>
          </div>
        </div>

        <div class="card-flat mt-6">
          <h4>🏗️ Stack RAG Comum</h4>
          <div class="flex gap-2 flex-wrap mt-3">
            ${['LangChain', 'LlamaIndex', 'OpenAI Embeddings', 'Pinecone', 'Chroma', 'FAISS', 'Weaviate', 'Qdrant', 'pgvector'].map(t =>
              `<span class="token-chip">${t}</span>`
            ).join('')}
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
            <h3 style="margin:0">📝 Quiz — RAG</h3>
            <div class="module-stars" style="font-size: 1.5rem;">
              ${[1, 2, 3].map(s => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <p>Teste seus conhecimentos sobre RAG!</p>
          <button class="btn btn-primary btn-lg mt-4" id="start-quiz-btn">Começar Quiz</button>
        </div>
        <div id="quiz-container" class="hidden mt-6"></div>
        <div id="quiz-results" class="hidden mt-6"></div>
      </div>
    `;
  }

  const QUIZ_QUESTIONS = [
    { question: 'O que significa RAG?', options: ['Random Access Generation', 'Retrieval-Augmented Generation', 'Recursive AI Generator', 'Real-time Answer Grounding'], correct: 1, explanation: 'RAG = Retrieval-Augmented Generation. Combina busca (retrieval) de documentos com geração de texto por LLMs.' },
    { question: 'Qual é a principal vantagem do RAG sobre um LLM puro?', options: ['É mais rápido', 'Gera textos mais criativos', 'Fundamenta respostas em documentos reais, reduzindo alucinação', 'Não precisa de GPU'], correct: 2, explanation: 'RAG busca documentos relevantes e os usa como contexto, fazendo o LLM gerar respostas baseadas em fatos reais.' },
    { question: 'O que é um Vector Database no contexto de RAG?', options: ['Um banco SQL para guardar textos', 'Um banco que armazena e busca embeddings (vetores) eficientemente', 'Um tipo de planilha', 'Um cache de respostas do LLM'], correct: 1, explanation: 'Vector databases (Pinecone, Chroma, FAISS...) armazenam embeddings e fazem busca por similaridade vetorial.' },
    { question: 'Qual etapa vem primeiro no pipeline RAG?', options: ['Gerar resposta com LLM', 'Buscar documentos similares', 'Transformar a query em embedding', 'Construir o prompt aumentado'], correct: 2, explanation: 'Primeiro a query é transformada em embedding (vetor). Depois esse vetor é usado para buscar documentos similares.' },
    { question: 'Quando NÃO usar RAG?', options: ['Chatbot de atendimento ao cliente', 'Buscar em documentação interna', 'Geração criativa de ficção', 'FAQ com dados atualizados'], correct: 2, explanation: 'RAG não agrega valor para tarefas puramente criativas (ficção, poesia) onde não há "fatos a buscar".' },
  ];

  let quizState = { current: 0, answers: [], startTime: 0 };

  /* =================== Interactions =================== */
  function initInteractions() {
    document.getElementById('rag-run-btn')?.addEventListener('click', runRAGPipeline);
    document.querySelectorAll('.rag-suggest').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('rag-query');
        if (input) { input.value = btn.dataset.query; runRAGPipeline(); }
      });
    });
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
  }

  /* =================== Pipeline Execution =================== */
  async function runRAGPipeline() {
    const query = document.getElementById('rag-query')?.value?.trim();
    if (!query) return;
    const topK = parseInt(document.getElementById('rag-topk')?.value) || 3;
    const result = RAGEngine.runPipeline(query, topK);
    const container = document.getElementById('rag-pipeline-result');
    if (!container) return;

    // Determine if we use real AI
    const useAI = FoundryService.isConfigured();
    let aiAnswer = null;
    let aiMeta = null;

    if (useAI && result.augmentedPrompt) {
      // Show loading state
      container.innerHTML = `
        <div class="card-flat config-test-loading">
          <div class="spinner"></div>
          <span>Buscando documentos e gerando resposta com IA real...</span>
        </div>`;
      try {
        const aiResult = await FoundryService.generateForModule('rag', result.augmentedPrompt);
        aiAnswer = aiResult.content;
        aiMeta = { model: aiResult.model, elapsed: aiResult.elapsed, usage: aiResult.usage };
      } catch (err) {
        aiAnswer = null;
        Toast.show('Erro na IA: ' + err.message + ' — usando resposta simulada.', 'error');
      }
    }

    const finalAnswer = aiAnswer || result.answer;
    const isReal = !!aiAnswer;

    container.innerHTML = `
      <!-- Steps -->
      <div class="card-flat mb-4">
        <h4>🔄 Etapas do Pipeline</h4>
        <div class="flex flex-col gap-3 mt-4">
          ${result.steps.map((s, i) => `
            <div class="flex items-center gap-3">
              <span style="font-size:1.3rem;">${s.icon}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <strong class="text-sm">${s.name}</strong>
                  <span class="text-xs text-muted">${s.time}ms</span>
                </div>
                <span class="text-xs text-muted">${s.desc}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-muted mt-3">⏱️ Total: ${result.elapsed}ms</p>
      </div>

      <!-- Query Tokens -->
      <div class="card-flat mb-4">
        <h4>🔤 Tokens da Query</h4>
        <div class="flex gap-2 flex-wrap mt-3">
          ${result.queryTokens.map(t => `<span class="token-chip">${t}</span>`).join('')}
        </div>
      </div>

      <!-- Retrieved Documents -->
      <div class="card-flat mb-4">
        <h4>📄 Documentos Recuperados (Top-${topK})</h4>
        <div class="flex flex-col gap-3 mt-4">
          ${result.retrieved.map((d, i) => `
            <div class="card-flat rag-doc-card" style="border-left: 3px solid ${d.score > 0.5 ? '#10b981' : d.score > 0.2 ? '#f59e0b' : '#ef4444'};">
              <div class="flex items-center justify-between">
                <strong class="text-sm">#${i + 1} ${d.title}</strong>
                <span class="badge text-xs" style="background:${d.score > 0.5 ? '#10b98122' : d.score > 0.2 ? '#f59e0b22' : '#ef444422'};color:${d.score > 0.5 ? '#10b981' : d.score > 0.2 ? '#f59e0b' : '#ef4444'};">
                  Score: ${(d.score * 100).toFixed(0)}%
                </span>
              </div>
              <p class="text-xs mt-2">${d.content}</p>
              <div class="flex gap-1 mt-2">
                ${d.tags.map(t => `<span class="token-chip text-xs">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Augmented Prompt -->
      <div class="card-flat mb-4">
        <h4>✍️ Prompt Aumentado</h4>
        <div class="prompt-block prompt-block-user mt-3">
          <pre class="prompt-pre">${escapeHtml(result.augmentedPrompt)}</pre>
        </div>
      </div>

      <!-- Answer -->
      <div class="card-flat" style="border-color:${isReal ? '#0078d444' : '#10b98144'};">
        <div class="flex items-center justify-between">
          <h4 style="color:${isReal ? '#0078d4' : '#10b981'};">${isReal ? '🤖 Resposta IA Real' : '🤖 Resposta Simulada'}</h4>
          ${isReal ? `<span class="ai-badge">⚡ ${aiMeta.model} · ${aiMeta.elapsed}ms${aiMeta.usage?.total_tokens ? ' · ' + aiMeta.usage.total_tokens + ' tokens' : ''}</span>` : '<span class="ai-badge ai-badge-sim">📦 Simulado</span>'}
        </div>
        <div class="prompt-block prompt-block-ai mt-3">
          <pre class="prompt-pre">${escapeHtml(finalAnswer)}</pre>
        </div>
        ${!isReal && !FoundryService.isConfigured() ? '<p class="text-xs text-muted mt-2">💡 <a href="#/settings" style="color:var(--primary);">Configure uma API</a> para ver respostas de um modelo real!</p>' : ''}
      </div>
    `;
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
    c.querySelectorAll('.quiz-option').forEach(b=>b.addEventListener('click',()=>handleAnswer(parseInt(b.dataset.index))));
  }

  function handleAnswer(idx) {
    const q = QUIZ_QUESTIONS[quizState.current], ok = idx===q.correct;
    quizState.answers.push({selected:idx,correct:q.correct,isCorrect:ok});
    const c = document.getElementById('quiz-container');
    c.querySelectorAll('.quiz-option').forEach((o,i)=>{o.style.pointerEvents='none';if(i===q.correct)o.classList.add('quiz-correct');else if(i===idx&&!ok)o.classList.add('quiz-wrong');});
    const card = c.querySelector('.quiz-card'), expl = document.createElement('div');
    expl.className=`quiz-explanation ${ok?'correct':'wrong'} mt-4`;
    expl.innerHTML=`<p><strong>${ok?'✅ Correto!':'❌ Incorreto!'}</strong></p><p class="text-sm">${q.explanation}</p><button class="btn btn-primary mt-4 quiz-next-btn">${quizState.current<QUIZ_QUESTIONS.length-1?'Próxima →':'Ver Resultado'}</button>`;
    card.appendChild(expl);
    expl.querySelector('.quiz-next-btn').addEventListener('click',()=>{quizState.current++;quizState.current<QUIZ_QUESTIONS.length?renderQuizQuestion():finishQuiz();});
  }

  function finishQuiz() {
    const score=quizState.answers.filter(a=>a.isCorrect).length, total=QUIZ_QUESTIONS.length, elapsed=Math.round((Date.now()-quizState.startTime)/1000);
    const result=Progress.completeQuiz('rag',score,total);
    document.getElementById('quiz-container')?.classList.add('hidden');
    const r=document.getElementById('quiz-results');if(!r)return;r.classList.remove('hidden');
    const pct=Math.round((score/total)*100), msg=pct>=100?'🏆 Perfeito!':pct>=70?'🎉 Muito bom!':pct>=40?'👍 Bom começo!':'📚 Continue estudando!';
    r.innerHTML=`<div class="card-flat text-center"><h2>${msg}</h2><div class="module-stars mt-4 mb-4" style="font-size:2.5rem;">${[1,2,3].map(s=>`<span class="star ${s<=result.stars?'earned':''}">★</span>`).join('')}</div><p class="text-lg">${score}/${total} corretas (${pct}%)</p><p class="text-muted">Tempo: ${elapsed}s</p><p class="text-muted text-sm mt-4">+${score*10+result.stars*15} XP ganhos!</p><div class="flex justify-center gap-4 mt-8"><button class="btn btn-secondary" onclick="location.reload()">🔄 Tentar novamente</button><a href="#/" class="btn btn-primary">← Voltar à trilha</a></div></div>`;
    if(elapsed<60&&score>=4)Achievements.unlock('speedrunner');Achievements.checkAll();
  }

  return { render, initInteractions };
})();
