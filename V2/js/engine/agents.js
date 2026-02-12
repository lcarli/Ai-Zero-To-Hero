/* ============================================
   AIFORALL V2 — AI Agents Engine
   Agent loop, tools, planning, simulation
   ============================================ */

const AgentsEngine = (() => {

  /* ---- Agent Loop Steps ---- */
  const AGENT_LOOP = [
    { name: 'Perceber', icon: '👀', desc: 'Recebe input do ambiente ou usuário', color: '#6366f1' },
    { name: 'Pensar', icon: '🧠', desc: 'LLM raciocina e planeja a próxima ação', color: '#8b5cf6' },
    { name: 'Agir', icon: '⚡', desc: 'Executa uma ferramenta ou ação', color: '#f59e0b' },
    { name: 'Observar', icon: '🔍', desc: 'Analisa o resultado da ação', color: '#06b6d4' },
    { name: 'Repetir', icon: '🔄', desc: 'Decide se precisa de mais ações ou finaliza', color: '#10b981' },
  ];

  /* ---- Available Tools (simulated) ---- */
  const TOOLS = {
    search: {
      name: 'Web Search',
      icon: '🔍',
      desc: 'Buscar informações na internet',
      color: '#6366f1',
      simulate: (input) => ({
        result: `Resultados para "${input}": encontradas 3 fontes relevantes sobre o tema.`,
        time: 450,
      }),
    },
    calculator: {
      name: 'Calculator',
      icon: '🧮',
      desc: 'Calcular expressões matemáticas',
      color: '#10b981',
      simulate: (input) => {
        try {
          const sanitized = input.replace(/[^0-9+\-*/().%\s]/g, '');
          const result = Function('"use strict"; return (' + sanitized + ')')();
          return { result: `${input} = ${result}`, time: 50 };
        } catch {
          return { result: `Erro ao calcular: ${input}`, time: 50 };
        }
      },
    },
    weather: {
      name: 'Weather API',
      icon: '🌤️',
      desc: 'Consultar previsão do tempo',
      color: '#06b6d4',
      simulate: (input) => ({
        result: `${input}: 24°C, parcialmente nublado, umidade 65%, vento 12km/h.`,
        time: 320,
      }),
    },
    database: {
      name: 'Database',
      icon: '🗄️',
      desc: 'Consultar banco de dados',
      color: '#f59e0b',
      simulate: (input) => ({
        result: `Query "${input}": retornou 47 registros. Top resultado: {id: 1, status: "ativo"}.`,
        time: 280,
      }),
    },
    email: {
      name: 'Email',
      icon: '📧',
      desc: 'Enviar e-mails',
      color: '#ec4899',
      simulate: (input) => ({
        result: `E-mail enviado para ${input || 'destinatário'} com sucesso.`,
        time: 600,
      }),
    },
    code: {
      name: 'Code Executor',
      icon: '💻',
      desc: 'Executar código Python/JS',
      color: '#8b5cf6',
      simulate: (input) => ({
        result: `Código executado com sucesso. Output: ${input || '"Hello, World!"'}`,
        time: 200,
      }),
    },
  };

  /* ---- Predefined Scenarios ---- */
  const SCENARIOS = {
    travel: {
      label: '✈️ Planejar Viagem',
      goal: 'Planeje uma viagem de 3 dias para São Paulo',
      steps: [
        { thought: 'Preciso buscar informações sobre São Paulo.', tool: 'search', input: 'atrações turísticas São Paulo 2025', observation: 'Encontrei: MASP, Parque Ibirapuera, Avenida Paulista, Mercadão, Vila Madalena.' },
        { thought: 'Preciso verificar o clima para escolher roupas.', tool: 'weather', input: 'São Paulo', observation: 'São Paulo: 24°C, parcialmente nublado, umidade 65%.' },
        { thought: 'Vou calcular o orçamento estimado.', tool: 'calculator', input: '350 + 120*3 + 80*3 + 200', observation: '350 + 360 + 240 + 200 = 1150' },
        { thought: 'Tenho informações suficientes para montar o roteiro. Vou finalizar com a resposta.', tool: null, input: null, observation: null },
      ],
      finalAnswer: 'Roteiro 3 dias em SP:\n\nDia 1: MASP + Av. Paulista + Liberdade\nDia 2: Parque Ibirapuera + Vila Madalena\nDia 3: Mercadão + Pinacoteca\n\n🌤️ Clima: 24°C, levar roupas leves\n💰 Orçamento estimado: R$ 1.150 (hotel + alimentação + transporte + passeios)',
    },
    analysis: {
      label: '📊 Analisar Dados',
      goal: 'Analise as vendas do último trimestre e envie um relatório',
      steps: [
        { thought: 'Preciso consultar os dados de vendas no banco.', tool: 'database', input: 'SELECT total, mes FROM vendas WHERE trimestre = Q4', observation: 'Query retornou: Out=R$45K, Nov=R$52K, Dez=R$68K.' },
        { thought: 'Vou calcular o total do trimestre e o crescimento.', tool: 'calculator', input: '45000 + 52000 + 68000', observation: '45000 + 52000 + 68000 = 165000' },
        { thought: 'Calcular crescimento de Out para Dez.', tool: 'calculator', input: '((68000-45000)/45000)*100', observation: '((68000-45000)/45000)*100 = 51.11%' },
        { thought: 'Agora vou enviar o relatório por e-mail.', tool: 'email', input: 'gerente@empresa.com — Relatório Q4', observation: 'E-mail enviado com sucesso.' },
        { thought: 'Tarefa concluída. Vou resumir o que fiz.', tool: null, input: null, observation: null },
      ],
      finalAnswer: 'Relatório Q4 enviado!\n\n📊 Total: R$ 165.000\n📈 Crescimento Out→Dez: +51,1%\n📧 Enviado para: gerente@empresa.com\n\nMelhor mês: Dezembro (R$ 68K)',
    },
    code: {
      label: '💻 Resolver Problema',
      goal: 'Crie uma função que verifica se um número é primo e teste com 97',
      steps: [
        { thought: 'Preciso escrever uma função que verifica primos.', tool: 'code', input: 'def is_prime(n): return n>1 and all(n%i for i in range(2,int(n**0.5)+1))', observation: 'Função criada com sucesso.' },
        { thought: 'Agora vou testar com o número 97.', tool: 'code', input: 'is_prime(97) → True', observation: 'Código executado: 97 é primo = True' },
        { thought: 'Vou buscar mais informações sobre o número para enriquecer a resposta.', tool: 'search', input: 'número primo 97 propriedades', observation: '97 é o 25º número primo. É um primo irregular.' },
        { thought: 'Tenho todas as informações necessárias.', tool: null, input: null, observation: null },
      ],
      finalAnswer: '✅ 97 é primo!\n\n```python\ndef is_prime(n):\n    return n > 1 and all(n % i for i in range(2, int(n**0.5)+1))\n```\n\n📌 97 é o 25º número primo.',
    },
  };

  /* ---- Agent Frameworks ---- */
  const FRAMEWORKS = {
    langchain: { name: 'LangChain Agents', desc: 'Framework Python/JS mais popular — ReAct, tool calling, memory', color: '#10b981', lang: 'Python/JS' },
    autogen: { name: 'AutoGen', desc: 'Multi-agent conversations (Microsoft) — agentes colaboram entre si', color: '#6366f1', lang: 'Python' },
    crewai: { name: 'CrewAI', desc: 'Framework para times de agentes com papéis e tarefas definidas', color: '#f59e0b', lang: 'Python' },
    semantic: { name: 'Semantic Kernel', desc: 'SDK da Microsoft para integrar LLMs com código empresarial', color: '#8b5cf6', lang: 'C#/Python' },
    openai: { name: 'OpenAI Assistants', desc: 'API nativa com function calling, code interpreter e retrieval', color: '#ef4444', lang: 'API REST' },
    magentic: { name: 'Magentic-One', desc: 'Sistema multi-agente generalista (Microsoft Research)', color: '#06b6d4', lang: 'Python' },
  };

  /* ---- Agent Types ---- */
  const AGENT_TYPES = [
    { name: 'ReAct Agent', desc: 'Reason + Act — alterna entre pensar e agir', icon: '💭', pattern: 'Thought → Action → Observation → ...' },
    { name: 'Planning Agent', desc: 'Cria um plano completo antes de agir', icon: '📋', pattern: 'Plan → Execute → Verify' },
    { name: 'Multi-Agent', desc: 'Vários agentes colaboram em tarefas', icon: '👥', pattern: 'Agent1 ↔ Agent2 ↔ Agent3' },
    { name: 'Tool-Use Agent', desc: 'Foca em escolher e usar ferramentas', icon: '🔧', pattern: 'Select Tool → Call → Parse → Respond' },
  ];

  return {
    AGENT_LOOP,
    TOOLS,
    SCENARIOS,
    FRAMEWORKS,
    AGENT_TYPES,
  };
})();
