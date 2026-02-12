/* ============================================
   AIFORALL V2 — Main App
   SPA Router + Page rendering + Toast system
   ============================================ */

/* ---- Toast System ---- */
const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();

/* ---- Module Definitions ---- */
const MODULES = [
  {
    id: 'tokenization',
    emoji: '🧩',
    title: 'Tokenização',
    desc: 'Como texto vira números — BPE, subwords e vocabulários',
    route: '/tokenization',
    color: '#6366f1',
  },
  {
    id: 'embeddings',
    emoji: '📐',
    title: 'Embeddings',
    desc: 'Representação vetorial de palavras em espaço multidimensional',
    route: '/embeddings',
    color: '#8b5cf6',
  },
  {
    id: 'attention',
    emoji: '🎯',
    title: 'Attention',
    desc: 'O mecanismo que permite ao modelo focar no que importa',
    route: '/attention',
    color: '#06b6d4',
  },
  {
    id: 'llm',
    emoji: '🤖',
    title: 'LLM Pipeline',
    desc: 'O caminho completo — do texto até a predição da próxima palavra',
    route: '/llm',
    color: '#10b981',
  },
  {
    id: 'lstm',
    emoji: '🔄',
    title: 'LSTM',
    desc: 'Long Short-Term Memory — redes que lembram o passado',
    route: '/lstm',
    color: '#f59e0b',
  },
  {
    id: 'vision',
    emoji: '👁️',
    title: 'Visão Computacional',
    desc: 'Como computadores enxergam — convoluções, filtros e detecção',
    route: '/vision',
    color: '#ef4444',
  },
  {
    id: 'prompt-engineering',
    emoji: '✍️',
    title: 'Prompt Engineering',
    desc: 'A arte de conversar com modelos de IA para obter os melhores resultados',
    route: '/prompt-engineering',
    color: '#ec4899',
  },
  {
    id: 'rag',
    emoji: '📚',
    title: 'RAG',
    desc: 'Retrieval-Augmented Generation — busca + geração combinadas',
    route: '/rag',
    color: '#14b8a6',
  },
  {
    id: 'agents',
    emoji: '🤝',
    title: 'AI Agents',
    desc: 'Agentes autônomos que percebem, pensam e agem',
    route: '/agents',
    color: '#f97316',
  },
  {
    id: 'image-gen',
    emoji: '🎨',
    title: 'Geração de Imagens',
    desc: 'Como IA cria imagens do zero — difusão, DALL·E e geração real',
    route: '/image-gen',
    color: '#e11d48',
  },
];

/* ---- Router ---- */
const Router = (() => {
  let currentRoute = '/';

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    currentRoute = hash;
    render(hash);
    updateNavActive(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(route) {
    window.location.hash = '#' + route;
  }

  function render(route) {
    const app = document.getElementById('app');

    switch (route) {
      case '/':
        app.innerHTML = Pages.home();
        Pages.initHome();
        break;
      case '/tokenization':
        app.innerHTML = TokenizationDemo.render();
        Progress.visitModule('tokenization');
        TokenizationDemo.initInteractions();
        break;
      case '/embeddings':
        app.innerHTML = EmbeddingsDemo.render();
        Progress.visitModule('embeddings');
        EmbeddingsDemo.initInteractions();
        break;
      case '/attention':
        app.innerHTML = AttentionDemo.render();
        Progress.visitModule('attention');
        AttentionDemo.initInteractions();
        break;
      case '/llm':
        app.innerHTML = LLMDemo.render();
        Progress.visitModule('llm');
        LLMDemo.initInteractions();
        break;
      case '/lstm':
        app.innerHTML = LSTMDemo.render();
        Progress.visitModule('lstm');
        LSTMDemo.initInteractions();
        requestAnimationFrame(() => {
          const container = document.getElementById('cell-diagram');
          if (container) {
            const firstPreset = document.querySelector('.lstm-preset');
            if (firstPreset) firstPreset.click();
          }
        });
        break;
      case '/vision':
        app.innerHTML = VisionDemo.render();
        Progress.visitModule('vision');
        VisionDemo.initInteractions();
        break;
      case '/prompt-engineering':
        app.innerHTML = PromptDemo.render();
        Progress.visitModule('prompt-engineering');
        PromptDemo.initInteractions();
        break;
      case '/rag':
        app.innerHTML = RAGDemo.render();
        Progress.visitModule('rag');
        RAGDemo.initInteractions();
        break;
      case '/agents':
        app.innerHTML = AgentsDemo.render();
        Progress.visitModule('agents');
        AgentsDemo.initInteractions();
        break;
      case '/image-gen':
        app.innerHTML = ImageGenDemo.render();
        Progress.visitModule('image-gen');
        ImageGenDemo.initInteractions();
        break;
      case '/profile':
        app.innerHTML = Pages.profile();
        break;
      case '/settings':
        app.innerHTML = ConfigPage.render();
        ConfigPage.initInteractions();
        break;
      default:
        app.innerHTML = Pages.notFound();
    }

    Animations.initScrollReveal();
    Achievements.checkAll();
  }

  function updateNavActive(route) {
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-route') === route);
    });
  }

  return { init, navigate, currentRoute: () => currentRoute };
})();

/* ---- Pages ---- */
const Pages = (() => {
  /** Home / Landing page */
  function home() {
    const state = Progress.getState();
    const level = Progress.getLevel();
    const next = Progress.getNextLevel();
    const completion = Progress.getCompletion();

    return `
      <div class="page home-page">
        <!-- Hero com partículas -->
        <section class="hero">
          <canvas id="particle-canvas" class="hero-particles"></canvas>
          <div class="hero-content container">
            <div class="hero-badge reveal">
              <span class="badge badge-primary">✨ Interativo & Gamificado</span>
            </div>
            <h1 class="hero-title reveal">
              Aprenda <span class="gradient-text">Inteligência Artificial</span><br>
              do Zero ao Hero
            </h1>
            <p class="hero-subtitle reveal">
              Demos ao vivo, visualizações interativas e desafios práticos.<br>
              Sem pré-requisitos. Tudo no navegador.
            </p>
            <div class="hero-actions reveal">
              <a href="#/tokenization" class="btn btn-primary btn-lg">Começar Jornada →</a>
              <a href="#/profile" class="btn btn-secondary btn-lg">Meu Progresso</a>
            </div>
          </div>
        </section>

        <!-- Stats rápidas -->
        <section class="section stats-bar">
          <div class="container">
            <div class="stats-grid reveal">
              <div class="stat-item">
                <div class="stat-value text-primary">⚡ ${state.xp}</div>
                <div class="stat-label">XP Total</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-accent">${level.name}</div>
                <div class="stat-label">Nível Atual</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${completion.completed}/${completion.total}</div>
                <div class="stat-label">Módulos</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${state.achievements.length}/${Achievements.DEFINITIONS.length}</div>
                <div class="stat-label">Conquistas</div>
              </div>
            </div>
            ${next ? `
            <div class="level-progress reveal">
              <div class="level-info">
                <span>${level.name}</span>
                <span>${next.name} — faltam ${next.xpNeeded} XP</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.round(next.progress * 100)}%"></div>
              </div>
            </div>
            ` : `
            <div class="level-progress reveal">
              <div class="level-info"><span>🏆 ${level.name} — Nível Máximo!</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width: 100%"></div></div>
            </div>
            `}
          </div>
        </section>

        <!-- Trilha de Módulos -->
        <section class="section">
          <div class="container">
            <h2 class="text-center reveal">Trilha de Aprendizado</h2>
            <p class="text-center text-muted reveal" style="max-width:50ch;margin:0 auto var(--space-10);">
              Cada módulo é uma experiência interativa. Explore, experimente e conquiste estrelas.
            </p>
            <div class="modules-grid">
              ${MODULES.map((mod, i) => {
                const mState = state.modules[mod.id] || {};
                const stars = mState.stars || 0;
                return `
                <a href="#${mod.route}" class="module-card reveal ${mState.completed ? 'completed' : ''}" style="--accent: ${mod.color}">
                  <div class="module-number">Módulo ${String(i + 1).padStart(2, '0')}</div>
                  <div class="module-emoji">${mod.emoji}</div>
                  <div class="module-title">${mod.title}</div>
                  <div class="module-desc">${mod.desc}</div>
                  <div class="module-meta">
                    <div class="module-stars">
                      ${[1, 2, 3].map((s) => `<span class="star ${s <= stars ? 'earned' : ''}">★</span>`).join('')}
                    </div>
                    <span>${mState.completed ? '✅ Completo' : mState.visited ? '👁️ Visitado' : '🔓 Disponível'}</span>
                  </div>
                </a>`;
              }).join('')}
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <div class="container text-center">
            <p class="text-muted text-sm">
              AIFORALL V2 — Feito para aprender IA por dentro. 
              <a href="#/profile">Seu perfil</a>
            </p>
          </div>
        </footer>
      </div>
    `;
  }

  /** Initialize home page interactions */
  function initHome() {
    Particles.init('particle-canvas');
  }

  /** Module page placeholder */
  function modulePage(moduleId) {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod) return notFound();

    const state = Progress.getState();
    const mState = state.modules[moduleId] || {};

    return `
      <div class="page module-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar à trilha</a>

            <div class="module-header reveal">
              <span class="module-emoji" style="font-size: 3rem;">${mod.emoji}</span>
              <div>
                <h1>${mod.title}</h1>
                <p>${mod.desc}</p>
              </div>
            </div>

            <div class="tab-bar reveal">
              <button class="tab active" data-tab="learn">📖 Aprender</button>
              <button class="tab" data-tab="demo">🧪 Demo Interativa</button>
              <button class="tab" data-tab="quiz">📝 Quiz</button>
            </div>

            <!-- Learn Tab -->
            <div id="tab-learn" class="tab-content active reveal">
              <div class="card-flat">
                <h3>🚧 Em construção</h3>
                <p>O conteúdo educacional deste módulo está sendo preparado.</p>
                <p>Em breve: explicações visuais, analogias e exemplos interativos sobre <strong>${mod.title}</strong>.</p>
              </div>
            </div>

            <!-- Demo Tab -->
            <div id="tab-demo" class="tab-content hidden">
              <div class="card-flat">
                <h3>🧪 Demo Interativa</h3>
                <p>A demo interativa de <strong>${mod.title}</strong> será implementada aqui.</p>
                <div id="demo-container" class="demo-area"></div>
              </div>
            </div>

            <!-- Quiz Tab -->
            <div id="tab-quiz" class="tab-content hidden">
              <div class="card-flat">
                <h3>📝 Quiz — ${mod.title}</h3>
                <p>Teste seus conhecimentos e ganhe estrelas!</p>
                <p class="text-muted">O quiz será implementado em breve.</p>
                <div class="module-stars mt-4" style="font-size: 1.5rem;">
                  ${[1, 2, 3].map((s) => `<span class="star ${s <= (mState.stars || 0) ? 'earned' : ''}">★</span>`).join('')}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    `;
  }

  /** Profile page */
  function profile() {
    const state = Progress.getState();
    const level = Progress.getLevel();
    const next = Progress.getNextLevel();
    const completion = Progress.getCompletion();
    const allAch = Achievements.getAll();

    return `
      <div class="page profile-page">
        <section class="section">
          <div class="container">
            <a href="#/" class="btn btn-ghost mb-8">← Voltar</a>

            <h1 class="reveal">Meu Perfil</h1>

            <!-- Level Card -->
            <div class="card-flat reveal" style="margin-bottom: var(--space-8);">
              <div class="flex items-center gap-6">
                <div style="font-size: 3rem;">⚡</div>
                <div style="flex:1">
                  <h3 style="margin:0">${level.name}</h3>
                  <p class="text-muted text-sm" style="margin-bottom: var(--space-2)">${state.xp} XP total</p>
                  ${next ? `
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.round(next.progress * 100)}%"></div>
                  </div>
                  <p class="text-muted text-sm mt-4">${next.xpNeeded} XP para ${next.name}</p>
                  ` : '<p class="text-accent text-sm">Nível máximo alcançado! 🏆</p>'}
                </div>
              </div>
            </div>

            <!-- Completion -->
            <div class="card-flat reveal" style="margin-bottom: var(--space-8);">
              <h3>Progresso Geral — ${completion.percentage}%</h3>
              <div class="progress-bar mt-4">
                <div class="progress-fill" style="width: ${completion.percentage}%"></div>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-8">
                ${MODULES.map((mod) => {
                  const ms = state.modules[mod.id] || {};
                  return `
                  <div class="flex items-center gap-3">
                    <span>${mod.emoji}</span>
                    <span class="text-sm">${mod.title}</span>
                    <span class="text-sm text-muted" style="margin-left:auto">
                      ${ms.completed ? '✅' : ms.visited ? '👁️' : '—'}
                    </span>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <!-- Achievements -->
            <h2 class="reveal">🏅 Conquistas (${allAch.filter(a => a.earned).length}/${allAch.length})</h2>
            <div class="grid grid-cols-2 gap-4 mt-4">
              ${allAch.map((ach) => `
                <div class="card-flat reveal ${ach.earned ? '' : 'locked'}" style="opacity: ${ach.earned ? 1 : 0.4}">
                  <div class="flex items-center gap-3">
                    <span style="font-size:1.5rem">${ach.emoji}</span>
                    <div>
                      <div class="font-bold text-sm">${ach.name}</div>
                      <div class="text-muted text-sm">${ach.desc}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Reset -->
            <div class="text-center mt-8 reveal">
              <button class="btn btn-ghost text-sm" id="reset-progress" style="color: var(--error);">
                🗑️ Resetar todo progresso
              </button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /** 404 page */
  function notFound() {
    return `
      <div class="page" style="display:flex;align-items:center;justify-content:center;min-height:80vh;">
        <div class="text-center">
          <h1 style="font-size: 4rem;">🤔</h1>
          <h2>Página não encontrada</h2>
          <p class="text-muted">Essa rota não existe.</p>
          <a href="#/" class="btn btn-primary mt-8">Voltar ao início</a>
        </div>
      </div>
    `;
  }

  return { home, initHome, modulePage, profile, notFound };
})();

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Load progress
  Progress.load();

  // Init router
  Router.init();

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') !== 'light';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('aiforall_theme', isDark ? 'light' : 'dark');
  });

  // Restore theme
  const savedTheme = localStorage.getItem('aiforall_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeBtn) themeBtn.textContent = savedTheme === 'light' ? '☀️' : '🌙';
  }

  // Mobile hamburger
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Tab switching (delegated)
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    const tabBar = tab.closest('.tab-bar');
    if (!tabBar) return;

    // Update active tab
    tabBar.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    // Show corresponding content
    const tabName = tab.getAttribute('data-tab');
    const page = tab.closest('.page');
    if (page) {
      page.querySelectorAll('.tab-content').forEach((tc) => {
        tc.classList.toggle('hidden', tc.id !== `tab-${tabName}`);
        tc.classList.toggle('active', tc.id === `tab-${tabName}`);
      });
    }

    // Scroll content area to right below tab-bar so user sees the new tab content
    const tabBarRect = tabBar.getBoundingClientRect();
    const navHeight = 64; // fixed navbar height
    const scrollTarget = window.scrollY + tabBarRect.top - navHeight;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });

    // Resize canvas when switching to space tab (embeddings)
    if (tabName === 'space' && typeof EmbeddingsDemo !== 'undefined' && EmbeddingsDemo.resizeCanvas) {
      requestAnimationFrame(() => EmbeddingsDemo.resizeCanvas());
    }
  });

  // Reset progress button (delegated)
  document.addEventListener('click', (e) => {
    if (e.target.id === 'reset-progress') {
      if (confirm('Tem certeza? Todo seu progresso será perdido.')) {
        Progress.reset();
        Toast.show('Progresso resetado.', 'info');
        Router.navigate('/');
      }
    }
  });
});
