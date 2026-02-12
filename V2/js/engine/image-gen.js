/* ============================================
   AIFORALL V2 — Image Generation Engine
   Educational content: diffusion, DALL-E, VAE, CLIP
   ============================================ */

const ImageGenEngine = (() => {

  /* ---- Timeline of Image Generation Models ---- */
  const TIMELINE = [
    { year: 2014, name: 'GAN', desc: 'Generative Adversarial Networks — duas redes (gerador vs discriminador) competem entre si.', icon: '⚔️' },
    { year: 2015, name: 'DCGAN', desc: 'GANs com convoluções profundas. Primeiras imagens realistas de rostos.', icon: '🧠' },
    { year: 2018, name: 'StyleGAN', desc: 'NVIDIA — controle fino de estilos, geração de rostos ultra-realistas.', icon: '🎨' },
    { year: 2020, name: 'DDPM', desc: 'Denoising Diffusion Probabilistic Models — fundação dos modelos de difusão.', icon: '🌫️' },
    { year: 2021, name: 'DALL·E', desc: 'OpenAI combina GPT + dVAE para gerar imagens a partir de texto.', icon: '🖼️' },
    { year: 2021, name: 'CLIP', desc: 'Contrastive Language-Image Pre-training — conecta texto e imagem.', icon: '🔗' },
    { year: 2022, name: 'DALL·E 2', desc: 'Usa CLIP + difusão. Qualidade impressionante, inpainting, variações.', icon: '✨' },
    { year: 2022, name: 'Stable Diffusion', desc: 'Stability AI — difusão latente, open source, revolução democratizada.', icon: '🔓' },
    { year: 2022, name: 'Midjourney', desc: 'Focado em arte e estética. Estilo único e altamente criativo.', icon: '🎭' },
    { year: 2023, name: 'DALL·E 3', desc: 'Integração com ChatGPT, entendimento superior de prompts complexos.', icon: '🚀' },
    { year: 2024, name: 'Flux / SD3', desc: 'Modelos DiT (Diffusion Transformers), nova arquitetura baseada em transformers.', icon: '⚡' },
    { year: 2025, name: 'GPT-Image', desc: 'Geração nativa no GPT-4o/5 — texto e imagem unificados num só modelo.', icon: '🌟' },
  ];

  /* ---- Diffusion Process Steps ---- */
  const DIFFUSION_STEPS = [
    {
      id: 'noise',
      title: 'T=1000 — Ruído Gaussiano Puro',
      desc: 'Pixels completamente aleatórios. Nenhuma informação visual.',
      icon: '🎲',
      detail: 'Cada pixel R, G, B amostrado de N(0,1). Esse é o ponto de partida da difusão reversa.',
      timestep: 1000,
    },
    {
      id: 'text-encode',
      title: 'CLIP Encoding do Prompt',
      desc: 'O texto "uma estrela dourada" é convertido em um vetor de 768 dimensões pelo CLIP.',
      icon: '📝',
      detail: 'CLIP entende que "estrela dourada" = forma com 5 pontas + cor amarela/dourada + brilho. O embedding guia a U-Net.',
      timestep: 950,
    },
    {
      id: 'denoise-1',
      title: 'T=800 — Sombras Emergem',
      desc: 'Primeiros padrões aparecem. Uma mancha mais escura se forma ao redor, uma mais clara no centro.',
      icon: '🌫️',
      detail: 'A U-Net prediz ε (ruído) e subtrai. As frequências mais baixas (formas grandes) surgem primeiro.',
      timestep: 800,
    },
    {
      id: 'denoise-2',
      title: 'T=600 — Forma Global',
      desc: 'Uma silhueta pentagonal começa a se definir. O fundo se separa do objeto.',
      icon: '🔷',
      detail: 'Cross-attention: o embedding "estrela" influencia as camadas da U-Net. A separação fundo/figura emerge.',
      timestep: 600,
    },
    {
      id: 'denoise-3',
      title: 'T=400 — Pontas da Estrela',
      desc: 'As 5 pontas ficam visíveis. A cor dourada começa a dominar. Fundo azul escuro se firma.',
      icon: '⭐',
      detail: 'Frequências médias aparecem. A geometria da estrela é guiada pelo CFG (guidance scale ~7.5).',
      timestep: 400,
    },
    {
      id: 'denoise-4',
      title: 'T=250 — Contornos Nítidos',
      desc: 'Bordas ficam mais definidas. Gradientes de cor se refinam dentro da estrela.',
      icon: '🖌️',
      detail: 'O scheduler (ex: DDPM/DDIM) reduz o step size. Cada iteração faz ajustes menores e mais precisos.',
      timestep: 250,
    },
    {
      id: 'denoise-5',
      title: 'T=100 — Detalhes Finos',
      desc: 'Brilho central, gradientes suaves, sombras nas bordas da estrela.',
      icon: '✨',
      detail: 'As frequências mais altas (detalhes finos) são as últimas a convergir. Texturas e reflexos aparecem.',
      timestep: 100,
    },
    {
      id: 'denoise-6',
      title: 'T=25 — Quase Pronto',
      desc: 'Imagem praticamente final. Apenas micro-ruído residual permanece.',
      icon: '🔬',
      detail: 'Os últimos passos removem artefatos sutis. Variância residual σ_t → 0.',
      timestep: 25,
    },
    {
      id: 'denoise-final',
      title: 'T=0 — Espaço Latente Final',
      desc: 'Denoising completo. O tensor latente (4×64×64) está limpo e pronto.',
      icon: '🎯',
      detail: 'x_0 = tensor final no espaço latente. Toda informação da estrela está codificada nesses números.',
      timestep: 0,
    },
    {
      id: 'decode',
      title: 'VAE Decode → Pixels RGB',
      desc: 'O VAE Decoder transforma o espaço latente (4×64×64) em pixels RGB (3×512×512).',
      icon: '🖼️',
      detail: 'Decoder convolucional transposto amplia 8×. O resultado é a imagem final com cores e resolução reais.',
      timestep: -1,
    },
  ];

  /* ---- Star Drawing Targets ---- */
  const SHAPES = {
    star: {
      name: '⭐ Estrela Dourada',
      prompt: 'Uma estrela dourada brilhante',
      draw: (ctx, w, h) => {
        // Dark blue gradient background
        const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.7);
        bgGrad.addColorStop(0, '#1a1a3e');
        bgGrad.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Star
        const cx = w / 2, cy = h / 2;
        const outerR = w * 0.38, innerR = w * 0.15;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const starGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, outerR);
        starGrad.addColorStop(0, '#fff7ae');
        starGrad.addColorStop(0.3, '#ffd700');
        starGrad.addColorStop(0.7, '#e6a800');
        starGrad.addColorStop(1, '#b8860b');
        ctx.fillStyle = starGrad;
        ctx.fill();

        // Glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small sparkles
        ctx.fillStyle = '#ffffff';
        const sparkles = [[0.25,0.2],[0.75,0.25],[0.2,0.7],[0.8,0.75],[0.5,0.12],[0.5,0.88]];
        sparkles.forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(w*sx, h*sy, 2, 0, Math.PI*2);
          ctx.fill();
        });
      },
    },
    heart: {
      name: '❤️ Coração Vermelho',
      prompt: 'Um coração vermelho brilhante',
      draw: (ctx, w, h) => {
        const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.7);
        bgGrad.addColorStop(0, '#2a0a1a');
        bgGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        const cx = w/2, cy = h/2;
        const s = w * 0.013;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s*15);
        ctx.bezierCurveTo(cx - s*25, cy - s*5, cx - s*25, cy - s*20, cx, cy - s*10);
        ctx.bezierCurveTo(cx + s*25, cy - s*20, cx + s*25, cy - s*5, cx, cy + s*15);
        ctx.closePath();
        const hGrad = ctx.createRadialGradient(cx, cy - s*5, 0, cx, cy, s*25);
        hGrad.addColorStop(0, '#ff6b6b');
        hGrad.addColorStop(0.5, '#e53e3e');
        hGrad.addColorStop(1, '#9b2c2c');
        ctx.fillStyle = hGrad;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0;
      },
    },
    moon: {
      name: '🌙 Lua Crescente',
      prompt: 'Uma lua crescente prateada no céu noturno',
      draw: (ctx, w, h) => {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#0a0a2e');
        bgGrad.addColorStop(1, '#1a1a4e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        // Small stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
          const x = Math.sin(i*137.5)*w*0.5 + w*0.5;
          const y = Math.cos(i*98.3)*h*0.5 + h*0.5;
          ctx.beginPath();
          ctx.arc(x, y, Math.random()*1.5 + 0.5, 0, Math.PI*2);
          ctx.fill();
        }
        // Moon
        const cx = w*0.5, cy = h*0.45, r = w*0.28;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        const mGrad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 0, cx, cy, r);
        mGrad.addColorStop(0, '#f5f5f0');
        mGrad.addColorStop(0.7, '#d4d0c8');
        mGrad.addColorStop(1, '#b0a890');
        ctx.fillStyle = mGrad;
        ctx.shadowColor = '#d4d0c8';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Crescent cutout
        ctx.beginPath();
        ctx.arc(cx + r*0.5, cy - r*0.15, r*0.8, 0, Math.PI*2);
        ctx.fillStyle = '#0a0a2e';
        ctx.fill();
      },
    },
  };

  /**
   * Render the target shape onto an offscreen canvas and return pixel data.
   * Returns { r, g, b } Float32Arrays (0-1 range), one value per pixel.
   */
  function renderTargetImage(shapeKey, w, h) {
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    (SHAPES[shapeKey] || SHAPES.star).draw(ctx, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const len = w * h;
    const r = new Float32Array(len);
    const g = new Float32Array(len);
    const b = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      r[i] = imgData.data[i*4]   / 255;
      g[i] = imgData.data[i*4+1] / 255;
      b[i] = imgData.data[i*4+2] / 255;
    }
    return { r, g, b };
  }

  /* ---- CLIP Visualization Data ---- */
  const CLIP_DATA = {
    star: {
      prompt: 'Uma estrela dourada brilhante',
      tokens: ['<|startoftext|>', 'uma', 'est', '##rela', 'dou', '##rada', 'brilh', '##ante', '<|endoftext|>'],
      tokenIds: [49406, 3301, 942, 6823, 1821, 5765, 4792, 3897, 49407],
      concepts: [
        { name: 'Forma estelar (5 pontas)', activation: 0.94, color: '#ffd700' },
        { name: 'Cor dourada / amarelo', activation: 0.91, color: '#e6a800' },
        { name: 'Brilho / luminosidade', activation: 0.87, color: '#fff7ae' },
        { name: 'Objeto isolado / centralizado', activation: 0.72, color: '#88ccff' },
        { name: 'Fundo escuro (contraste)', activation: 0.65, color: '#4466aa' },
        { name: 'Simetria radial', activation: 0.58, color: '#aa88ff' },
      ],
    },
    heart: {
      prompt: 'Um coração vermelho brilhante',
      tokens: ['<|startoftext|>', 'um', 'cor', '##ação', 'verm', '##elho', 'brilh', '##ante', '<|endoftext|>'],
      tokenIds: [49406, 1802, 1153, 7246, 2917, 4438, 4792, 3897, 49407],
      concepts: [
        { name: 'Forma de coração', activation: 0.96, color: '#ff6b6b' },
        { name: 'Cor vermelha intensa', activation: 0.93, color: '#e53e3e' },
        { name: 'Brilho / luminosidade', activation: 0.85, color: '#ffaaaa' },
        { name: 'Emoção / amor', activation: 0.78, color: '#ff88cc' },
        { name: 'Objeto isolado / centralizado', activation: 0.70, color: '#88ccff' },
        { name: 'Simetria bilateral', activation: 0.62, color: '#aa88ff' },
      ],
    },
    moon: {
      prompt: 'Uma lua crescente prateada no céu noturno',
      tokens: ['<|startoftext|>', 'uma', 'lua', 'cresc', '##ente', 'pra', '##teada', 'no', 'c', '##éu', 'not', '##urno', '<|endoftext|>'],
      tokenIds: [49406, 3301, 8834, 5571, 2946, 1820, 9127, 912, 272, 6290, 3542, 7783, 49407],
      concepts: [
        { name: 'Lua / corpo celeste', activation: 0.95, color: '#d4d0c8' },
        { name: 'Fase crescente', activation: 0.88, color: '#b0a890' },
        { name: 'Cor prateada / cinza claro', activation: 0.84, color: '#c0c0c0' },
        { name: 'Céu noturno / escuro', activation: 0.91, color: '#1a1a4e' },
        { name: 'Estrelas pequenas', activation: 0.62, color: '#ffffff' },
        { name: 'Atmosfera calma', activation: 0.55, color: '#6666aa' },
      ],
    },
  };

  /**
   * Generate a deterministic pseudo-random embedding array of 768 values
   * based on a seed string. Values are in range [-1, 1] — looks like a real CLIP vector.
   */
  function generateFakeEmbedding(seed, len = 768) {
    const arr = new Float32Array(len);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    for (let i = 0; i < len; i++) {
      hash = ((hash << 13) ^ hash) - 1;
      hash = (hash * 1597334677) | 0;
      arr[i] = ((hash & 0xffff) / 32768) - 1; // -1..+1
    }
    return arr;
  }

  /* ---- Key Concepts ---- */
  const CONCEPTS = [
    {
      name: 'Difusão (Diffusion)',
      desc: 'Processo de adicionar ruído gradualmente a uma imagem (forward) e aprender a reverter (reverse).',
      formula: 'x_t = √(ᾱ_t) · x_0 + √(1 - ᾱ_t) · ε',
      analogy: 'Como restaurar uma foto antiga — você aprende a "limpar" borrões e danos passo a passo.',
    },
    {
      name: 'CLIP (Contrastive Learning)',
      desc: 'Modelo que conecta texto e imagem no mesmo espaço vetorial usando aprendizado contrastivo.',
      formula: 'sim(text, image) = cos(E_text, E_image)',
      analogy: 'Um tradutor que converte tanto texto quanto imagem para a mesma "língua" (vetores).',
    },
    {
      name: 'VAE (Variational Autoencoder)',
      desc: 'Comprime a imagem para um espaço latente menor, onde a difusão opera de forma eficiente.',
      formula: 'z = Encoder(x), x̂ = Decoder(z)',
      analogy: 'Trabalhar com um rascunho de baixa resolução e depois ampliar para o tamanho final.',
    },
    {
      name: 'U-Net',
      desc: 'Arquitetura encoder-decoder com skip connections que prediz o ruído a ser removido.',
      formula: 'ε_θ(x_t, t, c) — prediz ruído dado x_t, timestep t, e condição c',
      analogy: 'Como um artista que olha a tela borrada e imagina o que precisa "limpar" em cada camada.',
    },
    {
      name: 'CFG (Classifier-Free Guidance)',
      desc: 'Técnica que amplifica a influência do texto na geração, controlando fidelidade vs diversidade.',
      formula: 'ε̃ = ε_uncond + w · (ε_cond - ε_uncond)',
      analogy: 'O "volume" do prompt — quanto maior o CFG, mais a imagem obedece ao texto.',
    },
  ];

  /* ---- Quiz Questions ---- */
  const QUIZ = [
    {
      q: 'Qual é o processo fundamental da geração por difusão?',
      opts: [
        'Treinar um GAN com gerador e discriminador',
        'Adicionar ruído gradualmente e aprender a reverter',
        'Combinar patches de imagens existentes',
        'Buscar imagens similares num banco de dados',
      ],
      correct: 1,
      explanation: 'Modelos de difusão aprendem a reverter um processo de adição gradual de ruído, gerando imagens do ruído puro.',
    },
    {
      q: 'Qual é o papel do CLIP na geração de imagens?',
      opts: [
        'Remove ruído das imagens',
        'Gera os pixels finais',
        'Conecta texto e imagem no mesmo espaço vetorial',
        'Treina o discriminador do GAN',
      ],
      correct: 2,
      explanation: 'CLIP converte texto e imagem para o mesmo espaço vetorial, permitindo que o modelo entenda o prompt.',
    },
    {
      q: 'Por que a difusão latente (Stable Diffusion) é mais eficiente?',
      opts: [
        'Usa GPUs mais poderosas',
        'Opera num espaço comprimido (latente) em vez de pixels diretamente',
        'Usa menos passos de denoising',
        'Não precisa de codificação de texto',
      ],
      correct: 1,
      explanation: 'O VAE comprime a imagem para um espaço latente muito menor (ex: 64×64×4 vs 512×512×3), tornando a difusão mais rápida.',
    },
    {
      q: 'O que acontece quando se aumenta o CFG (Classifier-Free Guidance)?',
      opts: [
        'A imagem fica mais aleatória e diversa',
        'A imagem obedece mais ao texto, mas pode perder naturalidade',
        'A resolução da imagem aumenta',
        'O tempo de geração diminui',
      ],
      correct: 1,
      explanation: 'CFG alto força o modelo a seguir mais fielmente o prompt, mas valores muito altos podem causar artefatos.',
    },
    {
      q: 'Qual componente decodifica o espaço latente para pixels finais?',
      opts: [
        'CLIP Encoder',
        'U-Net',
        'VAE Decoder',
        'Text Transformer',
      ],
      correct: 2,
      explanation: 'O VAE Decoder converte o tensor latente comprimido de volta para uma imagem RGB na resolução final.',
    },
  ];

  return {
    TIMELINE,
    DIFFUSION_STEPS,
    SHAPES,
    CLIP_DATA,
    CONCEPTS,
    QUIZ,
    renderTargetImage,
    generateFakeEmbedding,
  };
})();
