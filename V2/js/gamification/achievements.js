/* ============================================
   AIFORALL V2 — Achievements
   Badge system and unlock logic
   ============================================ */

const Achievements = (() => {
  const DEFINITIONS = [
    {
      id: 'first_step',
      emoji: '🏁',
      name: 'Primeiro Passo',
      desc: 'Complete seu primeiro módulo',
      check: (s) => Object.values(s.modules).some((m) => m.completed),
    },
    {
      id: 'tokenizer',
      emoji: '🧩',
      name: 'Tokenizador',
      desc: '3 estrelas no quiz de Tokenização',
      check: (s) => s.modules.tokenization?.stars >= 3,
    },
    {
      id: 'full_attention',
      emoji: '🎯',
      name: 'Atenção Total',
      desc: 'Complete o módulo de Attention',
      check: (s) => s.modules.attention?.completed,
    },
    {
      id: 'open_mind',
      emoji: '🧠',
      name: 'Mente Aberta',
      desc: 'Visite todos os 9 módulos',
      check: (s) => Object.values(s.modules).every((m) => m.visited),
    },
    {
      id: 'speedrunner',
      emoji: '⚡',
      name: 'Speedrunner',
      desc: 'Complete um quiz em menos de 60 segundos',
      check: () => false, // checked manually during quiz
    },
    {
      id: 'scientist',
      emoji: '🔬',
      name: 'Cientista',
      desc: 'Complete todos os quizzes com 3 estrelas',
      check: (s) => Object.values(s.modules).every((m) => m.stars >= 3),
    },
    {
      id: 'zero_to_hero',
      emoji: '🏆',
      name: 'Zero to Hero',
      desc: '100% de conclusão',
      check: (s) => {
        const c = Progress.getCompletion();
        return c.percentage >= 100;
      },
    },
    {
      id: 'xp_100',
      emoji: '💯',
      name: 'Centena',
      desc: 'Alcance 100 XP',
      check: (s) => s.xp >= 100,
    },
    {
      id: 'xp_500',
      emoji: '🔥',
      name: 'Em Chamas',
      desc: 'Alcance 500 XP',
      check: (s) => s.xp >= 500,
    },
    {
      id: 'xp_1000',
      emoji: '🌟',
      name: 'Lendário',
      desc: 'Alcance 1000 XP',
      check: (s) => s.xp >= 1000,
    },
  ];

  /** Check all achievements and unlock new ones */
  function checkAll() {
    const state = Progress.getState();
    if (!state) return [];

    const newlyEarned = [];

    DEFINITIONS.forEach((ach) => {
      if (state.achievements.includes(ach.id)) return; // already earned
      if (ach.check(state)) {
        state.achievements.push(ach.id);
        newlyEarned.push(ach);
        Toast.show(`🏅 Conquista desbloqueada: ${ach.emoji} ${ach.name}`, 'success');
      }
    });

    if (newlyEarned.length > 0) {
      Progress.save();
    }

    return newlyEarned;
  }

  /** Manually unlock an achievement by ID */
  function unlock(achId) {
    const state = Progress.getState();
    if (state.achievements.includes(achId)) return false;

    const ach = DEFINITIONS.find((a) => a.id === achId);
    if (!ach) return false;

    state.achievements.push(achId);
    Progress.save();
    Toast.show(`🏅 Conquista desbloqueada: ${ach.emoji} ${ach.name}`, 'success');
    return true;
  }

  /** Get all definitions with earned status */
  function getAll() {
    const state = Progress.getState();
    return DEFINITIONS.map((ach) => ({
      ...ach,
      earned: state ? state.achievements.includes(ach.id) : false,
    }));
  }

  return { checkAll, unlock, getAll, DEFINITIONS };
})();
