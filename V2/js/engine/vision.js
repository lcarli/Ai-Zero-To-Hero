/* ============================================
   AIFORALL V2 — Vision Engine
   Convolution, pooling, filters, edge detection,
   feature extraction simulation
   ============================================ */

const VisionEngine = (() => {

  /* ---- Predefined Kernels / Filters ---- */
  const FILTERS = {
    identity: {
      label: 'Identidade',
      desc: 'Não altera a imagem',
      kernel: [[0,0,0],[0,1,0],[0,0,0]],
      color: '#6366f1',
    },
    edgeH: {
      label: 'Bordas Horizontais',
      desc: 'Detecta transições horizontais',
      kernel: [[-1,-1,-1],[0,0,0],[1,1,1]],
      color: '#ef4444',
    },
    edgeV: {
      label: 'Bordas Verticais',
      desc: 'Detecta transições verticais',
      kernel: [[-1,0,1],[-1,0,1],[-1,0,1]],
      color: '#f59e0b',
    },
    sharpen: {
      label: 'Nitidez',
      desc: 'Realça detalhes e contornos',
      kernel: [[0,-1,0],[-1,5,-1],[0,-1,0]],
      color: '#10b981',
    },
    blur: {
      label: 'Blur (Suavizar)',
      desc: 'Média dos vizinhos — suaviza a imagem',
      kernel: [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],
      color: '#8b5cf6',
    },
    emboss: {
      label: 'Emboss (Relevo)',
      desc: 'Efeito de relevo / 3D',
      kernel: [[-2,-1,0],[-1,1,1],[0,1,2]],
      color: '#06b6d4',
    },
    sobelX: {
      label: 'Sobel X',
      desc: 'Detecção de bordas — gradiente horizontal',
      kernel: [[-1,0,1],[-2,0,2],[-1,0,1]],
      color: '#ec4899',
    },
    sobelY: {
      label: 'Sobel Y',
      desc: 'Detecção de bordas — gradiente vertical',
      kernel: [[-1,-2,-1],[0,0,0],[1,2,1]],
      color: '#14b8a6',
    },
  };

  /* ---- Sample Images (grayscale pixel grids) ---- */
  const SAMPLE_IMAGES = {
    cross: {
      label: '➕ Cruz',
      size: 7,
      data: [
        0,0,0,255,0,0,0,
        0,0,0,255,0,0,0,
        0,0,0,255,0,0,0,
        255,255,255,255,255,255,255,
        0,0,0,255,0,0,0,
        0,0,0,255,0,0,0,
        0,0,0,255,0,0,0,
      ],
    },
    square: {
      label: '⬜ Quadrado',
      size: 7,
      data: [
        0,0,0,0,0,0,0,
        0,255,255,255,255,255,0,
        0,255,0,0,0,255,0,
        0,255,0,0,0,255,0,
        0,255,0,0,0,255,0,
        0,255,255,255,255,255,0,
        0,0,0,0,0,0,0,
      ],
    },
    diagonal: {
      label: '⟋ Diagonal',
      size: 7,
      data: [
        255,0,0,0,0,0,0,
        0,255,0,0,0,0,0,
        0,0,255,0,0,0,0,
        0,0,0,255,0,0,0,
        0,0,0,0,255,0,0,
        0,0,0,0,0,255,0,
        0,0,0,0,0,0,255,
      ],
    },
    gradient: {
      label: '🌅 Gradiente',
      size: 7,
      data: Array.from({ length: 49 }, (_, i) => Math.round((i % 7) / 6 * 255)),
    },
    checker: {
      label: '♟ Xadrez',
      size: 8,
      data: Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8;
        return (r + c) % 2 === 0 ? 255 : 0;
      }),
    },
  };

  /* ---- Convolution ---- */
  function convolve2D(image, size, kernel) {
    const kSize = kernel.length;
    const pad = Math.floor(kSize / 2);
    const outSize = size - kSize + 1;
    const output = new Array(outSize * outSize);

    for (let y = 0; y < outSize; y++) {
      for (let x = 0; x < outSize; x++) {
        let sum = 0;
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const pixel = image[(y + ky) * size + (x + kx)];
            sum += pixel * kernel[ky][kx];
          }
        }
        output[y * outSize + x] = sum;
      }
    }
    return { data: output, size: outSize };
  }

  /** Convolution step by step — returns intermediate info for each output pixel */
  function convolveStepByStep(image, size, kernel) {
    const kSize = kernel.length;
    const outSize = size - kSize + 1;
    const steps = [];

    for (let y = 0; y < outSize; y++) {
      for (let x = 0; x < outSize; x++) {
        const products = [];
        let sum = 0;
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const pixel = image[(y + ky) * size + (x + kx)];
            const weight = kernel[ky][kx];
            const product = pixel * weight;
            products.push({ pixel, weight, product, ky, kx });
            sum += product;
          }
        }
        steps.push({ x, y, products, sum });
      }
    }
    return { steps, outSize };
  }

  /* ---- Activation: ReLU ---- */
  function relu(data) {
    return data.map(v => Math.max(0, v));
  }

  /* ---- Pooling ---- */
  function maxPool2D(data, size, poolSize = 2) {
    const outSize = Math.floor(size / poolSize);
    const output = new Array(outSize * outSize);
    for (let y = 0; y < outSize; y++) {
      for (let x = 0; x < outSize; x++) {
        let maxVal = -Infinity;
        for (let py = 0; py < poolSize; py++) {
          for (let px = 0; px < poolSize; px++) {
            const idx = (y * poolSize + py) * size + (x * poolSize + px);
            if (data[idx] > maxVal) maxVal = data[idx];
          }
        }
        output[y * outSize + x] = maxVal;
      }
    }
    return { data: output, size: outSize };
  }

  function avgPool2D(data, size, poolSize = 2) {
    const outSize = Math.floor(size / poolSize);
    const output = new Array(outSize * outSize);
    for (let py = 0; py < outSize; py++) {
      for (let px = 0; px < outSize; px++) {
        let sum = 0;
        for (let dy = 0; dy < poolSize; dy++) {
          for (let dx = 0; dx < poolSize; dx++) {
            sum += data[(py * poolSize + dy) * size + (px * poolSize + dx)];
          }
        }
        output[py * outSize + px] = sum / (poolSize * poolSize);
      }
    }
    return { data: output, size: outSize };
  }

  /* ---- Normalize pixel values for display ---- */
  function normalize(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data.map(v => Math.round(((v - min) / range) * 255));
  }

  /* ---- CNN Pipeline simulation ---- */
  const CNN_LAYERS = [
    { name: 'Input', type: 'input', desc: 'Imagem original (pixels)', icon: '🖼️' },
    { name: 'Conv2D', type: 'conv', desc: 'Convolução com filtros 3×3', icon: '🔲' },
    { name: 'ReLU', type: 'activation', desc: 'Ativação: remove valores negativos', icon: '⚡' },
    { name: 'MaxPool 2×2', type: 'pool', desc: 'Reduz dimensão, mantém features', icon: '📉' },
    { name: 'Conv2D', type: 'conv', desc: 'Segunda convolução — features complexas', icon: '🔲' },
    { name: 'ReLU', type: 'activation', desc: 'Ativação novamente', icon: '⚡' },
    { name: 'Flatten', type: 'flatten', desc: 'Transforma 2D → vetor 1D', icon: '📏' },
    { name: 'Dense', type: 'dense', desc: 'Camada densa (fully connected)', icon: '🧠' },
    { name: 'Softmax', type: 'output', desc: 'Probabilidades de cada classe', icon: '🎯' },
  ];

  /** Simulate a simple CNN pipeline on a sample image */
  function runPipeline(image, size, filterKey) {
    const kernel = FILTERS[filterKey]?.kernel || FILTERS.edgeH.kernel;
    const stages = [];

    // Stage 0: Input
    stages.push({ name: 'Input', data: [...image], size, type: 'input' });

    // Stage 1: Conv
    const conv1 = convolve2D(image, size, kernel);
    stages.push({ name: 'Conv2D', data: [...conv1.data], size: conv1.size, type: 'conv' });

    // Stage 2: ReLU
    const relu1 = relu(conv1.data);
    stages.push({ name: 'ReLU', data: [...relu1], size: conv1.size, type: 'activation' });

    // Stage 3: MaxPool
    const pool1 = maxPool2D(relu1, conv1.size, 2);
    stages.push({ name: 'MaxPool', data: [...pool1.data], size: pool1.size, type: 'pool' });

    return stages;
  }

  /* ---- Architecture comparison data ---- */
  const ARCHITECTURES = {
    lenet: {
      name: 'LeNet-5 (1998)',
      params: '60K',
      depth: 5,
      innovation: 'Primeira CNN bem-sucedida — reconhecimento de dígitos',
      layers: ['Conv 5×5', 'Pool', 'Conv 5×5', 'Pool', 'FC', 'FC', 'Output'],
      color: '#6366f1',
    },
    alexnet: {
      name: 'AlexNet (2012)',
      params: '60M',
      depth: 8,
      innovation: 'GPU training, ReLU, Dropout — venceu ImageNet',
      layers: ['Conv 11×11', 'Pool', 'Conv 5×5', 'Pool', 'Conv 3×3', 'Conv 3×3', 'Conv 3×3', 'Pool', 'FC', 'FC', 'Softmax'],
      color: '#ef4444',
    },
    vgg: {
      name: 'VGG-16 (2014)',
      params: '138M',
      depth: 16,
      innovation: 'Filtros pequenos (3×3) empilhados = campo receptivo grande',
      layers: ['Conv×2', 'Pool', 'Conv×2', 'Pool', 'Conv×3', 'Pool', 'Conv×3', 'Pool', 'Conv×3', 'Pool', 'FC×3'],
      color: '#f59e0b',
    },
    resnet: {
      name: 'ResNet-50 (2015)',
      params: '25M',
      depth: 50,
      innovation: 'Skip connections — redes muito profundas sem vanishing gradient',
      layers: ['Conv 7×7', 'Pool', 'Res×3', 'Res×4', 'Res×6', 'Res×3', 'AvgPool', 'FC'],
      color: '#10b981',
    },
    vit: {
      name: 'ViT (2020)',
      params: '86M',
      depth: 12,
      innovation: 'Transformer para imagens — patches + attention substituem convoluções',
      layers: ['Patch Embed', 'Pos Embed', 'Transformer×12', 'MLP Head'],
      color: '#8b5cf6',
    },
  };

  return {
    FILTERS,
    SAMPLE_IMAGES,
    CNN_LAYERS,
    ARCHITECTURES,
    convolve2D,
    convolveStepByStep,
    relu,
    maxPool2D,
    avgPool2D,
    normalize,
    runPipeline,
  };
})();
