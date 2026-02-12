# AIFORALL V2 — AI Zero to Hero (Interactive Edition)

> Plataforma educacional interativa e gamificada para aprender Inteligência Artificial do zero, com demos ao vivo, visualizações em tempo real e desafios práticos.

---

## Visão Geral

A V2 é uma reimaginação completa do AIFORALL. Em vez de páginas estáticas com texto, cada conceito de IA será ensinado através de **experiências interativas** onde o usuário aprende fazendo. O design será moderno, minimalista e dark-mode por padrão, com animações suaves e feedback visual constante.

**Stack:** HTML5 + CSS3 (com variáveis CSS / design tokens) + JavaScript vanilla (sem frameworks, mantendo leveza e didática)

---

## Arquitetura do Projeto

```
V2/
├── index.html                  # Landing page + hub de navegação
├── css/
│   ├── tokens.css              # Design tokens (cores, fontes, espaçamentos)
│   ├── base.css                # Reset, tipografia, layout global
│   └── components.css          # Cards, botões, modais, tooltips
├── js/
│   ├── app.js                  # Router SPA + navegação
│   ├── engine/
│   │   ├── tokenizer.js        # Motor de tokenização BPE simulado
│   │   ├── embeddings.js       # Visualização de embeddings
│   │   ├── attention.js        # Simulação de attention
│   │   ├── transformer.js      # Pipeline completo do transformer
│   │   ├── lstm.js             # Simulação de LSTM
│   │   ├── cnn.js              # Simulação de convoluções
│   │   ├── rag.js              # Pipeline RAG simulado
│   │   └── prompt-engine.js    # Motor de prompt engineering
│   ├── demos/
│   │   ├── llm-demo.js         # Demo interativa LLM
│   │   ├── lstm-demo.js        # Demo interativa LSTM
│   │   ├── vision-demo.js      # Demo visão computacional
│   │   ├── prompt-demo.js      # Demo prompt engineering
│   │   ├── rag-demo.js         # Demo RAG
│   │   ├── embeddings-demo.js  # Demo embeddings
│   │   ├── attention-demo.js   # Demo attention
│   │   └── agents-demo.js      # Demo AI Agents
│   ├── gamification/
│   │   ├── progress.js         # Sistema de progresso e XP
│   │   ├── achievements.js     # Conquistas e badges
│   │   ├── quizzes.js          # Motor de quizzes
│   │   └── challenges.js       # Desafios práticos
│   └── ui/
│       ├── canvas.js           # Renderização canvas para visualizações
│       ├── animations.js       # Animações e transições
│       └── particles.js        # Efeitos visuais de partículas
├── assets/
│   ├── icons/                  # Ícones SVG inline
│   └── sounds/                 # Sons de feedback (achievement, click)
└── data/
    ├── quizzes.json            # Banco de perguntas dos quizzes
    ├── achievements.json       # Definição de conquistas
    └── glossary.json           # Glossário de termos de IA
```

---

## Módulos de Aprendizado

### 1. 🧩 Tokenização & Vocabulário
**Demo:** O usuário digita texto e vê em tempo real os tokens aparecendo com cores diferentes, como blocos de LEGO se montando.
- Animação de split do texto em tokens (BPE)
- Slider para mudar o tamanho do vocabulário e ver o impacto
- Comparação lado a lado: word-level vs subword vs character-level
- **Desafio:** "Adivinhe quantos tokens essa frase terá"

### 2. 📐 Embeddings (Representação Vetorial)
**Demo:** Espaço 2D/3D interativo onde palavras são pontos — o usuário arrasta palavras e vê similaridades.
- Visualização de vetores com canvas/WebGL
- Busca por similaridade: digite uma palavra e veja as mais próximas
- Analogias visuais (rei - homem + mulher = rainha)
- Slider de dimensões: veja como 2D vs 100D muda a representação
- **Desafio:** "Agrupe as palavras por significado arrastando-as"

### 3. 🎯 Attention (Mecanismo de Atenção)
**Demo:** Heatmap interativo mostrando quais palavras "prestam atenção" em quais.
- O usuário digita uma frase e vê o mapa de atenção se formar
- Multi-head: alternar entre diferentes "cabeças" de atenção
- Animação passo a passo: Query → Key → Value → Score → Softmax → Output
- Modo "câmera lenta" com narração de cada etapa
- **Desafio:** "Preveja qual palavra receberá mais atenção"

### 4. 🤖 LLM — Large Language Models (Pipeline Completo)
**Demo:** Pipeline visual end-to-end — texto entra, a predição sai, com cada estágio animado.
- Fluxo: Input → Tokenização → Embedding → N× Transformer Blocks → Output
- Cada bloco é clicável para expandir e ver os detalhes internos
- Controle de temperatura: slider que mostra como muda a distribuição de probabilidade
- Top-k / Top-p visual: veja os candidatos sendo filtrados
- Modo "raio-X": veja os números (tensores) fluindo pelo modelo
- **Desafio:** "Ajuste a temperatura para gerar o texto mais criativo / mais preciso"

### 5. 🔄 LSTM — Long Short-Term Memory
**Demo:** Animação de uma célula LSTM com os gates abrindo e fechando conforme o texto passa.
- Visualização dos 3 gates: Forget, Input, Output
- Sequência de texto passando pela célula com memória acumulando
- Comparação RNN simples vs LSTM (por que LSTM lembra melhor?)
- Gráfico de gradiente: veja o vanishing gradient na RNN vs estabilidade na LSTM
- **Desafio:** "Qual informação a LSTM vai lembrar ou esquecer nessa frase?"

### 6. 👁️ Visão Computacional
**Demo:** Upload ou use a webcam — veja filtros e detecções em tempo real.
- Convoluções ao vivo: aplique filtros (edge detection, blur, sharpen) na imagem
- Visualização de feature maps camada por camada
- Detecção de objetos simples com bounding boxes
- Classificação de dígitos (MNIST-style) desenhando no canvas
- Comparação: CNN vs Vision Transformer
- **Desafio:** "Desenhe um número e veja se o modelo acerta"

### 7. ✍️ Prompt Engineering
**Demo:** Laboratório de prompts com comparação lado a lado de resultados.
- Templates de técnicas: Zero-shot, Few-shot, Chain-of-Thought, ReAct
- Editor split-screen: prompt à esquerda, resultado simulado à direita
- Galeria de exemplos bons vs ruins com explicação
- Construtor visual de prompts: arraste blocos (contexto, instrução, exemplos, formato)
- Score de qualidade do prompt com dicas de melhoria
- **Desafio:** "Melhore esse prompt para obter um resultado mais preciso"

### 8. 📚 RAG — Retrieval-Augmented Generation
**Demo:** Pipeline visual completo de RAG funcionando passo a passo.
- Fase 1 — Indexação: veja documentos sendo chunked e embedados
- Fase 2 — Retrieval: digite uma pergunta e veja a busca vetorial encontrando chunks relevantes
- Fase 3 — Generation: veja o contexto sendo injetado no prompt e a resposta surgindo
- Visualização de similaridade entre query e cada chunk
- Slider de chunk size: veja como o tamanho do pedaço afeta os resultados
- **Desafio:** "Escolha os chunks certos para responder essa pergunta"

### 9. 🤝 AI Agents
**Demo:** Simulação visual de um agente tomando decisões em loop.
- Ciclo: Perceber → Pensar → Agir → Observar (com animação)
- Agente simples navegando um grid (tipo jogo)
- Comparação: Agente Reativo vs Baseado em Metas vs com Aprendizado
- Visualização de tool-calling: o agente decide qual ferramenta usar
- **Desafio:** "Programe as regras do agente para ele chegar ao objetivo"

---

## Sistema de Gamificação

### Progresso
- **Trilha de aprendizado** com mapa visual (estilo jogo de trilha)
- Cada módulo é um "nível" com 3 estrelas possíveis
- Barra de XP global com níveis: Iniciante → Curioso → Aprendiz → Praticante → Mestre → Sensei da IA

### Conquistas (Achievements)
| Badge | Nome | Condição |
|-------|------|----------|
| 🏁 | Primeiro Passo | Completar o primeiro módulo |
| 🧩 | Tokenizador | Acertar 100% no quiz de tokenização |
| 🎯 | Atenção Total | Completar o módulo de Attention |
| 🧠 | Mente Aberta | Explorar todos os 9 módulos |
| ⚡ | Speedrunner | Completar um módulo em menos de 5 min |
| 🔬 | Cientista | Completar todos os desafios |
| 🏆 | Zero to Hero | 100% de conclusão |

### Quizzes
- Quiz rápido ao final de cada módulo (5 perguntas)
- Perguntas variadas: múltipla escolha, arrastar e soltar, preencher lacunas
- Feedback imediato com explicação de cada resposta
- Revisão de erros com material complementar

---

## Design & UX

### Princípios
- **Dark mode** por padrão (com toggle para light)
- **Minimalista:** muito espaço em branco, foco no conteúdo interativo
- **Progressivo:** complexidade aumenta conforme o usuário avança
- **Responsivo:** funciona em desktop, tablet e mobile
- **Acessível:** contraste adequado, navegação por teclado, aria-labels

### Paleta de Cores (Dark Mode)
```
Background:     #0a0a0f (quase preto azulado)
Surface:        #13131a (cards, painéis)
Border:         #1e1e2e (bordas sutis)
Primary:        #6366f1 (indigo vibrante)
Secondary:      #06b6d4 (ciano)
Accent:         #f59e0b (âmbar — destaques e achievements)
Success:        #10b981 (verde)
Error:          #ef4444 (vermelho)
Text Primary:   #e2e8f0 (cinza claro)
Text Secondary: #94a3b8 (cinza médio)
```

### Tipografia
- **Títulos:** Inter (ou system-ui) — bold, limpa
- **Corpo:** Inter — regular, boa leitura em tela
- **Código/Tokens:** JetBrains Mono — monospace para dados técnicos

### Animações
- Transições suaves de 200-300ms (ease-out)
- Elementos aparecem com fade-in + slide-up sutis
- Canvas animations para visualizações pesadas (60fps)
- Partículas e efeitos de "glow" nos momentos de conquista
- Nenhuma animação bloqueia a interação

---

## Navegação (SPA-like)

A aplicação funcionará como uma **Single Page Application** leve usando hash routing:

```
#/                    → Landing page com mapa da trilha
#/tokenization        → Módulo de Tokenização
#/embeddings          → Módulo de Embeddings
#/attention           → Módulo de Attention
#/llm                 → Módulo de LLM
#/lstm                → Módulo de LSTM
#/vision              → Módulo de Visão Computacional
#/prompt-engineering  → Módulo de Prompt Engineering
#/rag                 → Módulo de RAG
#/agents              → Módulo de AI Agents
#/profile             → Perfil do usuário (conquistas, progresso)
```

---

## Roadmap de Desenvolvimento

### Fase 1 — Fundação
- [ ] Setup do projeto (HTML base, CSS tokens, router JS)
- [ ] Landing page com mapa de trilha interativo
- [ ] Sistema de gamificação (progresso, XP, localStorage)
- [ ] Componentes base (cards, botões, modais, tooltips)

### Fase 2 — Módulos Core
- [ ] Tokenização (demo + quiz)
- [ ] Embeddings (demo + quiz)
- [ ] Attention (demo + quiz)
- [ ] LLM Pipeline (demo + quiz)

### Fase 3 — Módulos Avançados
- [ ] LSTM (demo + quiz)
- [ ] Visão Computacional (demo + quiz)
- [ ] Prompt Engineering (demo + quiz)
- [ ] RAG (demo + quiz)
- [ ] AI Agents (demo + quiz)

### Fase 4 — Polish
- [ ] Achievements e badges
- [ ] Sons de feedback
- [ ] Perfil do usuário
- [ ] Light mode
- [ ] Otimização mobile
- [ ] Testes e QA

---

## Como Rodar

```bash
# Na pasta V2, basta abrir um servidor local:
npx serve .
# ou
python3 -m http.server 8000
```

Sem build, sem dependências, sem node_modules. Tudo roda no navegador.

---

*"A melhor forma de aprender IA é vendo ela funcionar por dentro."*
