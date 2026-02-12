/* ============================================
   AIFORALL V2 — Progress & Gamification
   XP, levels, module progress (localStorage)
   ============================================ */

const Progress = (() => {
  const STORAGE_KEY = 'aiforall_progress';

  const LEVELS = [
    { name: 'Iniciante',    minXP: 0 },
    { name: 'Curioso',      minXP: 100 },
    { name: 'Aprendiz',     minXP: 300 },
    { name: 'Praticante',   minXP: 600 },
    { name: 'Avançado',     minXP: 1000 },
    { name: 'Mestre',       minXP: 1500 },
    { name: 'Sensei da IA', minXP: 2200 },
  ];

  const DEFAULT_STATE = {
    xp: 0,
    modules: {
      tokenization:       { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      embeddings:         { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      attention:          { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      llm:                { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      lstm:               { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      vision:             { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      'prompt-engineering':{ unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      rag:                { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
      agents:             { unlocked: true,  completed: false, stars: 0, quizScore: 0, visited: false },
    },
    achievements: [],     // IDs of earned achievements
    quizHistory: [],      // { module, score, date }
    startedAt: null,
  };

  let state = null;

  /** Load state from localStorage */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        // Merge any new modules from DEFAULT that don't exist yet
        for (const key of Object.keys(DEFAULT_STATE.modules)) {
          if (!state.modules[key]) {
            state.modules[key] = { ...DEFAULT_STATE.modules[key] };
          }
        }
      } else {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        state.startedAt = new Date().toISOString();
      }
    } catch {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      state.startedAt = new Date().toISOString();
    }
    save();
    updateUI();
    return state;
  }

  /** Save state to localStorage */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /** Get current state (read-only copy) */
  function getState() {
    return state;
  }

  /** Add XP and return { newXP, levelUp, level } */
  function addXP(amount) {
    const oldLevel = getLevel();
    state.xp += amount;
    save();
    updateUI();

    const newLevel = getLevel();
    const levelUp = newLevel.name !== oldLevel.name;

    if (levelUp) {
      Toast.show(`🎉 Level up! Você é agora: ${newLevel.name}`, 'success');
    }

    return { newXP: state.xp, levelUp, level: newLevel };
  }

  /** Get current level object */
  function getLevel() {
    let current = LEVELS[0];
    for (const level of LEVELS) {
      if (state.xp >= level.minXP) current = level;
    }
    return current;
  }

  /** Get next level and XP needed */
  function getNextLevel() {
    const idx = LEVELS.indexOf(getLevel());
    if (idx >= LEVELS.length - 1) return null;
    const next = LEVELS[idx + 1];
    return {
      ...next,
      xpNeeded: next.minXP - state.xp,
      progress: (state.xp - LEVELS[idx].minXP) / (next.minXP - LEVELS[idx].minXP),
    };
  }

  /** Mark module as visited */
  function visitModule(moduleId) {
    if (!state.modules[moduleId]) return;
    if (!state.modules[moduleId].visited) {
      state.modules[moduleId].visited = true;
      addXP(10); // First visit bonus
      save();
    }
  }

  /** Complete a module quiz */
  function completeQuiz(moduleId, score, total) {
    if (!state.modules[moduleId]) return;

    const pct = score / total;
    const stars = pct >= 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;

    // Only update if better score
    if (stars > state.modules[moduleId].stars) {
      state.modules[moduleId].stars = stars;
    }

    state.modules[moduleId].quizScore = Math.max(state.modules[moduleId].quizScore, score);
    state.modules[moduleId].completed = true;

    state.quizHistory.push({
      module: moduleId,
      score,
      total,
      date: new Date().toISOString(),
    });

    // XP based on score
    addXP(score * 10 + stars * 15);
    save();

    return { stars, score, total };
  }

  /** Get overall completion percentage */
  function getCompletion() {
    const modules = Object.values(state.modules);
    const completed = modules.filter((m) => m.completed).length;
    return {
      completed,
      total: modules.length,
      percentage: Math.round((completed / modules.length) * 100),
    };
  }

  /** Update nav XP display */
  function updateUI() {
    const xpEl = document.getElementById('xp-display');
    if (xpEl && state) {
      const current = parseInt(xpEl.textContent) || 0;
      if (current !== state.xp && typeof Animations !== 'undefined') {
        Animations.animateNumber(xpEl, state.xp, 600);
      } else {
        xpEl.textContent = state.xp;
      }
    }
  }

  /** Reset all progress */
  function reset() {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.startedAt = new Date().toISOString();
    save();
    updateUI();
  }

  return {
    load, save, getState, addXP, getLevel, getNextLevel,
    visitModule, completeQuiz, getCompletion, updateUI, reset, LEVELS,
  };
})();
