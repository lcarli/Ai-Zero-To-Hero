// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');

        // Animate hamburger bars
        navToggle.classList.toggle('active');

        // Toggle bars animation
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = navToggle.classList.contains('active') ?
                'rotate(45deg)' : 'none';
        });
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');

            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
            });
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
        } else {
            navbar.style.backgroundColor = '#2c3e50';
        }
    });

    // Initialize LLM Demo functionality
    initializeLLMDemo();
});

// Add animation to feature cards on scroll
function animateOnScroll() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const cardVisible = 150;

        if (cardTop < window.innerHeight - cardVisible) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
}

// Initialize card animation
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
});

// LLM Demo functionality
function initializeLLMDemo() {
    const processBtn = document.getElementById('process-btn');
    const userInput = document.getElementById('user-input');
    const processingResults = document.getElementById('processing-results');

    if (processBtn && userInput) {
        processBtn.addEventListener('click', function () {
            const text = userInput.value.trim();
            if (text) {
                processText(text);
                processingResults.style.display = 'block';
                processingResults.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Please enter some text to analyze.');
            }
        });

        // Allow Enter key to trigger processing
        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processBtn.click();
            }
        });
    }
}

// Toggle collapsible sections
function toggleCollapse(sectionId) {
    const content = document.getElementById(sectionId);
    const indicator = document.getElementById(sectionId + '-indicator');

    if (content && indicator) {
        content.classList.toggle('collapsed');
        indicator.classList.toggle('collapsed');

        if (content.classList.contains('collapsed')) {
            indicator.textContent = '▶';
        } else {
            indicator.textContent = '▼';
        }
    }
}

// Process text and show complete LLM pipeline results
async function processText(text) {
    // Initialize LLM pipeline state
    const llmState = {
        originalText: text,
        tokens: [],
        embeddings: [],
        attentionMaps: [],
        ffnOutputs: [],
        layerOutputs: [],
        finalPredictions: []
    };

    // Step 1: Tokenization
    llmState.tokens = tokenizeForLLM(text);
    displayTokensLLM(llmState.tokens, text);

    // Step 2: Generate embeddings
    llmState.embeddings = generateEmbeddings(llmState.tokens);
    displayEmbeddings(llmState.embeddings, llmState.tokens);

    // Step 3: Multi-head attention
    llmState.attentionMaps = computeAttention(llmState.embeddings);
    displayAttentionMatrix(llmState.attentionMaps, llmState.tokens);

    // Step 4: Feed forward network
    llmState.ffnOutputs = processFeedForward(llmState.embeddings);
    displayFeedForward(llmState.ffnOutputs);

    // Step 5: Layer stacking simulation
    llmState.layerOutputs = simulateLayerStack(llmState.embeddings);
    displayLayerStack(llmState.layerOutputs, llmState.tokens);

    // Step 6: Next word prediction
    llmState.finalPredictions = predictNextWord(llmState.layerOutputs[llmState.layerOutputs.length - 1]);
    displayPredictions(llmState.finalPredictions, text);

    // Store state for interactive controls
    window.currentLLMState = llmState;

    // Setup interactive controls
    setupInteractiveControls();
}

// Enhanced tokenization specifically for LLM demonstration
function tokenizeForLLM(text) {
    console.log('tokenizeForLLM input text:', text);

    // Enhanced BPE simulation for educational purposes
    const words = text.trim().split(/\s+/);
    const tokens = [];

    // Add beginning of sequence token
    tokens.push({ text: '<BOS>', type: 'special', id: 1, encoding: 'special' });

    words.forEach((word, index) => {
        // Handle punctuation at the end of words
        const punctuationMatch = word.match(/^(.+?)([.!?,:;])$/);

        if (punctuationMatch) {
            const [, wordPart, punct] = punctuationMatch;
            // Process the word part for BPE
            const wordTokens = processWordForBPE(wordPart, index);
            tokens.push(...wordTokens);

            tokens.push({
                text: punct,
                type: 'punctuation',
                id: 1000 + index,
                encoding: 'direct'
            });
        } else {
            // Process whole word for BPE
            const wordTokens = processWordForBPE(word, index);
            tokens.push(...wordTokens);
        }
    });

    // Add padding token for prediction
    tokens.push({ text: '<PAD>', type: 'special', id: 50001, encoding: 'special' });

    console.log('tokenizeForLLM output tokens:', tokens);
    return tokens;
}

// Simulate BPE subword tokenization for educational purposes
function processWordForBPE(word, baseIndex) {
    const lowerWord = word.toLowerCase();

    // Rules for demonstrating BPE - some words get broken down
    const bpeRules = {
        'programming': ['program', 'ming'],
        'because': ['be', 'cause'],
        'artificial': ['arti', 'ficial'],
        'intelligence': ['intel', 'li', 'gence'],
        'language': ['lang', 'uage'],
        'weather': ['wea', 'ther'],
        'today': ['to', 'day'],
        'beautiful': ['beauti', 'ful'],
        'understand': ['under', 'stand'],
        'computer': ['compu', 'ter'],
        'machine': ['mach', 'ine'],
        'learning': ['learn', 'ing'],
        'technology': ['tech', 'no', 'logy'],
        'development': ['develop', 'ment'],
        'application': ['appli', 'ca', 'tion'],
        'information': ['infor', 'ma', 'tion']
    };

    if (bpeRules[lowerWord]) {
        // Break word into subwords
        return bpeRules[lowerWord].map((subword, i) => ({
            text: i === 0 ? subword : subword,
            type: 'subword',
            id: 100 + baseIndex * 10 + i,
            encoding: 'BPE'
        }));
    } else if (word.length > 8) {
        // Break long words into smaller pieces
        const mid = Math.ceil(word.length / 2);
        return [
            {
                text: word.substring(0, mid),
                type: 'subword',
                id: 100 + baseIndex * 10,
                encoding: 'BPE'
            },
            {
                text: word.substring(mid),
                type: 'subword',
                id: 100 + baseIndex * 10 + 1,
                encoding: 'BPE'
            }
        ];
    } else {
        // Keep as single token
        return [{
            text: word,
            type: 'word',
            id: 100 + baseIndex,
            encoding: word.length <= 3 ? 'common' : 'BPE'
        }];
    }
}

// Generate embeddings for tokens (simplified simulation)
function generateEmbeddings(tokens) {
    const embeddingDim = 768; // Standard dimension
    const embeddings = [];

    tokens.forEach((token, pos) => {
        // Simulate token embedding (normally from learned embedding matrix)
        const tokenEmbedding = generateTokenEmbedding(token.id, embeddingDim);

        // Add positional encoding
        const positionalEncoding = generatePositionalEncoding(pos, embeddingDim);

        // Combine token + positional embeddings
        const combinedEmbedding = tokenEmbedding.map((val, i) =>
            val + positionalEncoding[i]
        );

        embeddings.push({
            token: token.text,
            tokenId: token.id,
            position: pos,
            embedding: combinedEmbedding,
            magnitude: Math.sqrt(combinedEmbedding.reduce((sum, val) => sum + val * val, 0))
        });
    });

    return embeddings;
}

// Generate token embedding (simulated)
function generateTokenEmbedding(tokenId, dim) {
    const embedding = [];
    // Use token ID as seed for reproducible "embeddings"
    for (let i = 0; i < dim; i++) {
        // Simplified embedding generation
        const seed = (tokenId * 1000 + i) * 0.01;
        embedding.push(Math.sin(seed) * Math.cos(seed * 2) * 0.1);
    }
    return embedding;
}

// Generate positional encoding using sinusoidal patterns
function generatePositionalEncoding(pos, dim) {
    const encoding = [];
    for (let i = 0; i < dim; i++) {
        if (i % 2 === 0) {
            encoding.push(Math.sin(pos / Math.pow(10000, i / dim)));
        } else {
            encoding.push(Math.cos(pos / Math.pow(10000, (i - 1) / dim)));
        }
    }
    return encoding;
}

// Compute multi-head attention (simplified)
function computeAttention(embeddings) {
    const numHeads = 4; // Simplified to 4 heads for visualization
    const headDim = embeddings[0].embedding.length / numHeads;
    const attentionMaps = [];

    for (let head = 0; head < numHeads; head++) {
        const headAttention = [];

        // For each query token
        for (let i = 0; i < embeddings.length; i++) {
            const queryAttention = [];

            // Compute attention with each key token
            for (let j = 0; j < embeddings.length; j++) {
                // Simplified attention score calculation
                let score = 0;
                const startIdx = head * headDim;
                const endIdx = startIdx + headDim;

                // Dot product of query and key (subset for this head)
                for (let k = startIdx; k < endIdx && k < embeddings[i].embedding.length; k++) {
                    score += embeddings[i].embedding[k] * embeddings[j].embedding[k];
                }

                // Apply causal mask (can't attend to future tokens)
                if (j > i) score = -Infinity;

                queryAttention.push(score);
            }

            // Apply softmax to get attention weights
            const softmaxWeights = softmax(queryAttention);
            headAttention.push(softmaxWeights);
        }

        attentionMaps.push({
            head: head,
            attention: headAttention,
            description: getAttentionHeadDescription(head)
        });
    }

    return attentionMaps;
}

// Softmax function
function softmax(arr) {
    const maxVal = Math.max(...arr.filter(x => x !== -Infinity));
    const exp = arr.map(x => x === -Infinity ? 0 : Math.exp(x - maxVal));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / sum);
}

// Get description for attention heads
function getAttentionHeadDescription(head) {
    const descriptions = [
        "Syntactic Relations (subject-verb, noun-adjective)",
        "Semantic Associations (related concepts)",
        "Positional Patterns (nearby words)",
        "Long-range Dependencies (distant context)"
    ];
    return descriptions[head] || "General Attention";
}

// Process through feed forward network
function processFeedForward(embeddings) {
    const ffnOutputs = [];

    embeddings.forEach((embData, idx) => {
        const input = embData.embedding;

        // Simulate FFN: Linear -> GELU -> Linear
        // Step 1: Expand to intermediate dimension (4x larger)
        const intermediate = [];
        const intermediateDim = input.length * 4;

        for (let i = 0; i < intermediateDim; i++) {
            let sum = 0;
            for (let j = 0; j < input.length; j++) {
                // Simplified weight matrix multiplication
                const weight = Math.sin(i * 0.01 + j * 0.02);
                sum += input[j] * weight;
            }

            // Apply GELU activation
            intermediate.push(gelu(sum));
        }

        // Step 2: Project back to original dimension
        const output = [];
        for (let i = 0; i < input.length; i++) {
            let sum = 0;
            for (let j = 0; j < intermediate.length; j++) {
                const weight = Math.cos(i * 0.01 + j * 0.02);
                sum += intermediate[j] * weight;
            }

            // Add residual connection
            output.push(sum + input[i]);
        }

        ffnOutputs.push({
            token: embData.token,
            input: input,
            intermediate: intermediate,
            output: output,
            activationStats: {
                maxActivation: Math.max(...intermediate),
                meanActivation: intermediate.reduce((a, b) => a + b, 0) / intermediate.length,
                sparsity: intermediate.filter(x => Math.abs(x) < 0.01).length / intermediate.length
            }
        });
    });

    return ffnOutputs;
}

// GELU activation function
function gelu(x) {
    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
}

// Simulate processing through multiple transformer layers
function simulateLayerStack(embeddings) {
    const numLayers = 12;
    const layerOutputs = [];
    let currentRepresentations = embeddings.map(e => [...e.embedding]);

    for (let layer = 0; layer < numLayers; layer++) {
        const layerOutput = [];

        // Each layer modifies the representations
        for (let i = 0; i < currentRepresentations.length; i++) {
            const input = currentRepresentations[i];
            const output = [];

            // Simulate layer processing with different characteristics per layer
            for (let j = 0; j < input.length; j++) {
                let value = input[j];

                // Early layers: more local, syntactic processing
                if (layer < 4) {
                    value += Math.sin(layer * 0.5 + j * 0.1) * 0.1;
                }
                // Middle layers: semantic processing  
                else if (layer < 8) {
                    value += Math.cos(layer * 0.3 + j * 0.05) * 0.15;
                }
                // Later layers: high-level reasoning
                else {
                    value += Math.sin(layer * 0.1 + j * 0.02) * 0.2;
                }

                output.push(value);
            }

            currentRepresentations[i] = output;
            layerOutput.push({
                token: embeddings[i].token,
                representation: [...output],
                layer: layer
            });
        }

        layerOutputs.push({
            layer: layer,
            description: getLayerDescription(layer),
            tokens: layerOutput
        });
    }

    return layerOutputs;
}

// Get description for each layer
function getLayerDescription(layer) {
    if (layer < 4) return `Layer ${layer + 1}: Surface patterns and basic syntax`;
    if (layer < 8) return `Layer ${layer + 1}: Semantic understanding and word relationships`;
    return `Layer ${layer + 1}: Complex reasoning and context integration`;
}

// Predict next word from final representations
function predictNextWord(finalLayerOutput) {
    const vocabSize = 50000; // Typical vocabulary size
    const lastTokenRepresentation = finalLayerOutput.tokens[finalLayerOutput.tokens.length - 1].representation;

    // Simulate language model head (linear projection to vocabulary)
    const logits = [];
    for (let vocabId = 0; vocabId < Math.min(vocabSize, 1000); vocabId++) { // Limit for performance
        let score = 0;
        for (let i = 0; i < lastTokenRepresentation.length; i++) {
            // Simplified weight matrix
            const weight = Math.sin(vocabId * 0.001 + i * 0.01);
            score += lastTokenRepresentation[i] * weight;
        }
        logits.push(score);
    }

    // Apply softmax to get probabilities
    const probabilities = softmax(logits);

    // Create predictions with actual words
    const predictions = [];
    const commonWords = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'for',
        'not', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
        'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will',
        'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
        'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can',
        'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
        'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
        'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
        'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
        'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are'
    ];

    // Sort by probability and take top predictions
    const indexedProbs = probabilities.map((prob, idx) => ({ prob, idx }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 20);

    indexedProbs.forEach((item, rank) => {
        const word = commonWords[item.idx % commonWords.length] || `token_${item.idx}`;
        predictions.push({
            word: word,
            probability: item.prob,
            logit: logits[item.idx],
            rank: rank + 1,
            tokenId: item.idx
        });
    });

    return predictions;
}

// Global config variable
let config = null;

// Load configuration
async function loadConfig() {
    if (config) return config;

    try {
        const response = await fetch('../config.json');
        if (!response.ok) throw new Error('Config not found');
        config = await response.json();
        return config;
    } catch (error) {
        console.warn('Failed to load config, using defaults:', error);
        config = {
            languageDetection: {
                apis: [],
                fallback: { enabled: true, algorithm: 'local' }
            }
        };
        return config;
    }
}

// Enhanced language detection with API integration
async function detectLanguageWithAPI(text) {
    const config = await loadConfig();

    // Try API detection first
    for (const api of config.languageDetection.apis) {
        if (!api.enabled) continue;

        try {
            const result = await callLanguageAPI(api, text);
            if (result) {
                return {
                    ...result,
                    source: 'api',
                    apiName: api.name
                };
            }
        } catch (error) {
            console.warn(`API ${api.name} failed:`, error);
        }
    }

    // Fallback to local detection
    if (config.languageDetection.fallback.enabled) {
        const result = detectLanguage(text);
        return {
            ...result,
            source: 'local',
            apiName: 'Local Algorithm'
        };
    }

    return null;
}

// Call language detection API
async function callLanguageAPI(api, text) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), api.timeout || 5000);

    try {
        const body = JSON.stringify(
            replaceTemplate(api.bodyTemplate, { text })
        );

        const response = await fetch(api.url, {
            method: api.method,
            headers: api.headers,
            body: body,
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // Extract language and confidence based on API response format
        const language = getNestedValue(data, api.responseFormat.language);
        const confidence = getNestedValue(data, api.responseFormat.confidence);

        if (language) {
            return {
                code: language,
                name: getLanguageName(language),
                flag: getLanguageFlag(language),
                confidence: Math.round(confidence * 100) || 50
            };
        }
    } catch (error) {
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }

    return null;
}

// Helper functions
function replaceTemplate(template, variables) {
    const result = {};
    for (const key in template) {
        let value = template[key];
        if (typeof value === 'string') {
            value = value.replace(/\{(\w+)\}/g, (match, varName) => {
                return variables[varName] || match;
            });
        }
        result[key] = value;
    }
    return result;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

function getLanguageName(code) {
    const names = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
    };
    return names[code] || code.toUpperCase();
}

function getLanguageFlag(code) {
    const flags = {
        'en': '🇺🇸',
        'es': '🇪🇸',
        'fr': '🇫🇷',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'ru': '🇷🇺',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'zh': '🇨🇳',
        'ar': '🇸🇦',
        'hi': '🇮🇳'
    };
    return flags[code] || '🌐';
}

// Advanced N-gram based language detection - Real algorithm used in practice
function detectLanguage(text) {
    const languageProfiles = {
        'en': {
            name: 'English',
            flag: '🇺🇸',
            // N-gram frequencies for English (most common trigrams)
            trigrams: {
                'the': 2841, 'and': 1616, 'ing': 1152, 'her': 969, 'hat': 769, 'his': 680, 'tha': 629,
                'ere': 627, 'for': 548, 'ent': 526, 'ion': 515, 'ter': 500, 'was': 455, 'you': 437,
                'ith': 427, 'ver': 399, 'all': 384, 'wit': 379, 'thi': 374, 'tio': 360, 'oul': 358,
                'est': 356, 'are': 355, 'but': 343, 'not': 340, 'had': 338, 'ave': 331, 'ned': 329,
                'hed': 315, 'ted': 314, 'ers': 313, 'nce': 311, 'ves': 308, 'ent': 308, 'ght': 306
            },
            // Character frequency (%) in English
            charFreq: {
                'e': 12.7, 't': 9.1, 'a': 8.1, 'o': 7.5, 'i': 7.0, 'n': 6.7, 's': 6.3, 'h': 6.1,
                'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8, 'u': 2.8, 'm': 2.4, 'w': 2.4, 'f': 2.2,
                'g': 2.0, 'y': 2.0, 'p': 1.9, 'b': 1.3, 'v': 1.0, 'k': 0.8, 'j': 0.15, 'x': 0.15,
                'q': 0.10, 'z': 0.07
            }
        },
        'es': {
            name: 'Spanish',
            flag: '🇪🇸',
            trigrams: {
                'que': 1849, 'del': 1164, 'est': 1028, 'par': 889, 'ent': 847, 'con': 791, 'los': 744,
                'des': 736, 'der': 668, 'las': 656, 'res': 615, 'ado': 610, 'ión': 575, 'ste': 567,
                'nte': 560, 'ada': 554, 'tra': 540, 'ara': 530, 'mos': 525, 'ero': 520, 'pue': 515,
                'com': 510, 'aci': 505, 'ion': 500, 'nal': 495, 'per': 490, 'ble': 485, 'men': 480,
                'nte': 475, 'ber': 470, 'ado': 465, 'ica': 460, 'ame': 455, 'ema': 450, 'tan': 445
            },
            charFreq: {
                'a': 12.5, 'e': 12.2, 'o': 8.7, 's': 7.2, 'n': 6.7, 'r': 6.9, 'i': 6.2, 'l': 5.0,
                'd': 5.9, 't': 4.6, 'c': 4.7, 'u': 3.9, 'm': 3.2, 'p': 2.5, 'b': 1.4, 'g': 1.0,
                'v': 0.9, 'y': 0.9, 'f': 0.7, 'q': 0.9, 'h': 0.7, 'z': 0.5, 'j': 0.4, 'ñ': 0.3,
                'x': 0.2, 'k': 0.01, 'w': 0.01
            }
        },
        'fr': {
            name: 'French',
            flag: '🇫🇷',
            trigrams: {
                'les': 1832, 'des': 1143, 'ent': 1109, 'que': 1081, 'une': 927, 'ons': 835, 'qui': 783,
                'son': 779, 'our': 773, 'sur': 770, 'ont': 760, 'com': 755, 'par': 750, 'ses': 745,
                'est': 740, 'res': 735, 'ais': 730, 'ion': 725, 'men': 720, 'eur': 715, 'ans': 710,
                'ous': 705, 'ave': 700, 'tte': 695, 'lle': 690, 'ers': 685, 'tre': 680, 'ter': 675,
                'oir': 670, 'eme': 665, 'ere': 660, 'ien': 655, 'rie': 650, 'ure': 645, 'ant': 640
            },
            charFreq: {
                'e': 14.7, 's': 7.9, 'a': 7.6, 'i': 7.5, 't': 7.2, 'n': 7.1, 'r': 6.6, 'u': 6.3,
                'l': 5.5, 'o': 5.3, 'd': 3.7, 'c': 3.3, 'p': 3.0, 'm': 3.0, 'é': 1.9, 'f': 1.1,
                'b': 0.9, 'v': 1.6, 'h': 0.7, 'g': 0.9, 'y': 0.3, 'x': 0.4, 'j': 0.3, 'à': 0.5,
                'è': 0.3, 'ù': 0.3, 'ç': 0.1, 'ê': 0.2, 'ô': 0.1, 'â': 0.1, 'î': 0.1, 'ï': 0.1
            }
        },
        'de': {
            name: 'German',
            flag: '🇩🇪',
            trigrams: {
                'der': 1802, 'und': 1354, 'die': 1293, 'den': 1038, 'ich': 944, 'das': 907, 'ein': 875,
                'cht': 864, 'sch': 845, 'end': 825, 'ent': 810, 'nde': 805, 'ine': 800, 'ber': 795,
                'ers': 790, 'ung': 785, 'gen': 780, 'tig': 775, 'ern': 770, 'ver': 765, 'eit': 760,
                'ten': 755, 'lic': 750, 'ehe': 745, 'nen': 740, 'hen': 735, 'ies': 730, 'ste': 725,
                'men': 720, 'ren': 715, 'auf': 710, 'ter': 705, 'erd': 700, 'ges': 695, 'wen': 690
            },
            charFreq: {
                'e': 17.4, 'n': 9.8, 'i': 7.6, 's': 7.3, 'r': 7.0, 'a': 6.5, 't': 6.2, 'd': 5.1,
                'h': 4.8, 'u': 4.4, 'l': 3.4, 'c': 3.1, 'g': 3.0, 'm': 2.5, 'o': 2.5, 'b': 1.9,
                'w': 1.9, 'f': 1.7, 'k': 1.2, 'z': 1.1, 'p': 0.8, 'v': 0.7, 'ü': 0.7, 'ä': 0.5,
                'ö': 0.3, 'ß': 0.3, 'j': 0.3, 'y': 0.04, 'x': 0.03, 'q': 0.02
            }
        },
        'it': {
            name: 'Italian',
            flag: '🇮🇹',
            trigrams: {
                'che': 1456, 'ent': 1178, 'con': 1095, 'del': 1046, 'per': 925, 'est': 889, 'ell': 833,
                'tte': 805, 'ant': 798, 'lle': 792, 'ion': 785, 'eri': 780, 'are': 775, 'esi': 770,
                'sta': 765, 'ato': 760, 'ere': 755, 'ste': 750, 'una': 745, 'nte': 740, 'ola': 735,
                'pre': 730, 'ssi': 725, 'ine': 720, 'eri': 715, 'ore': 710, 'ort': 705, 'ess': 700,
                'men': 695, 'ome': 690, 'ove': 685, 'ame': 680, 'eme': 675, 'ala': 670, 'ica': 665
            },
            charFreq: {
                'a': 11.7, 'e': 11.8, 'i': 11.3, 'o': 9.8, 'n': 6.9, 'r': 6.4, 't': 5.6, 'l': 6.5,
                's': 5.0, 'c': 4.5, 'd': 3.7, 'u': 3.0, 'm': 2.5, 'p': 3.1, 'v': 2.1, 'g': 1.6,
                'f': 1.2, 'b': 0.9, 'z': 0.5, 'h': 1.5, 'q': 0.5, 'é': 0.2, 'è': 0.2, 'à': 0.1,
                'ì': 0.1, 'ò': 0.1, 'ù': 0.1, 'j': 0.1, 'k': 0.1, 'w': 0.1, 'x': 0.1, 'y': 0.1
            }
        },
        'pt': {
            name: 'Portuguese',
            flag: '🇵🇹',
            trigrams: {
                'que': 1524, 'ent': 1186, 'ade': 1048, 'com': 932, 'est': 889, 'dos': 845, 'par': 812,
                'nte': 798, 'ção': 785, 'ess': 772, 'res': 765, 'mos': 758, 'ado': 751, 'ica': 744,
                'ame': 737, 'eme': 730, 'nal': 723, 'ber': 716, 'ria': 709, 'oes': 702, 'ore': 695,
                'ste': 688, 'ura': 681, 'ial': 674, 'tra': 667, 'ava': 660, 'ado': 653, 'ase': 646,
                'ais': 639, 'eus': 632, 'rou': 625, 'ção': 618, 'ual': 611, 'osa': 604, 'eza': 597
            },
            charFreq: {
                'a': 14.6, 'e': 12.6, 'o': 10.7, 's': 7.8, 'r': 6.5, 'i': 6.2, 'n': 5.1, 'd': 5.0,
                'm': 4.7, 'u': 4.6, 't': 4.3, 'c': 3.9, 'l': 2.8, 'p': 2.5, 'v': 1.7, 'g': 1.3,
                'h': 1.3, 'q': 1.2, 'b': 1.0, 'f': 1.0, 'z': 0.5, 'j': 0.4, 'x': 0.3, 'ç': 0.5,
                'ã': 0.7, 'á': 0.5, 'é': 0.5, 'í': 0.1, 'ó': 0.3, 'ú': 0.1, 'â': 0.2, 'ê': 0.2,
                'ô': 0.2, 'à': 0.1, 'õ': 0.1, 'ü': 0.01, 'k': 0.01, 'w': 0.01, 'y': 0.01
            }
        }
    };

    // Normalize text for analysis
    const normalizedText = text.toLowerCase().replace(/[^a-záàâãéèêëïîôöùûüÿçñáéíóúüÑÁÉÍÓÚÜÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇäöüßÄÖÜ]/g, '');

    if (normalizedText.length < 3) {
        return {
            code: 'en',
            name: 'English',
            flag: '🇺🇸',
            confidence: 20
        };
    }

    const scores = {};

    // Calculate scores for each language
    for (const [langCode, profile] of Object.entries(languageProfiles)) {
        let trigramScore = 0;
        let charScore = 0;

        // 1. N-gram analysis (trigrams)
        for (let i = 0; i <= normalizedText.length - 3; i++) {
            const trigram = normalizedText.substring(i, i + 3);
            if (profile.trigrams[trigram]) {
                trigramScore += Math.log(profile.trigrams[trigram]);
            }
        }

        // 2. Character frequency analysis
        const charCounts = {};
        for (const char of normalizedText) {
            charCounts[char] = (charCounts[char] || 0) + 1;
        }

        // Calculate chi-square statistic for character frequency
        for (const [char, count] of Object.entries(charCounts)) {
            const expected = (profile.charFreq[char] || 0.01) * normalizedText.length / 100;
            const observed = count;
            if (expected > 0) {
                charScore -= Math.pow(observed - expected, 2) / expected;
            }
        }

        // Combined score (weighted)
        scores[langCode] = (trigramScore * 0.7) + (charScore * 0.3);
    }

    // Find the language with highest score
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const bestMatch = sortedScores[0];
    const secondBest = sortedScores[1];

    // Calculate confidence based on score difference
    const scoreDifference = bestMatch[1] - secondBest[1];
    const confidence = Math.min(95, Math.max(20, 50 + scoreDifference * 2));

    const detectedLang = bestMatch[0];
    const profile = languageProfiles[detectedLang];

    return {
        code: detectedLang,
        name: profile.name,
        flag: profile.flag,
        confidence: Math.round(confidence),
        scores: scores, // For debugging
        algorithm: 'N-gram + Character Frequency Analysis'
    };
}

// Display language detection result with detailed examples using N-gram algorithm
function displayLanguageResult(result, inputText) {
    const resultContainer = document.getElementById('language-result');
    const algorithmContainer = document.querySelector('#language-detection .algorithm-explanation');

    // Update the algorithm explanation with user input examples
    algorithmContainer.innerHTML = `
        <h4>Advanced N-gram Algorithm:</h4>
        <p>Professional language detection using statistical analysis:</p>
        <ul>
            <li><strong>N-gram Frequency Analysis:</strong> Extract trigrams and compare against language databases
                <div class="example-box">
                    <strong>Trigrams from your text:</strong> "${inputText}"<br>
                    <em>Top trigrams found:</em> ${extractTrigrams(inputText)}
                </div>
            </li>
            <li><strong>Character Frequency Distribution:</strong> Statistical analysis using chi-square tests
                <div class="example-box">
                    <strong>Character frequency:</strong> ${analyzeCharacterFrequency(inputText)}
                </div>
            </li>
            <li><strong>Special Characters Detection:</strong> Language-specific diacritics and symbols
                <div class="example-box">
                    <strong>Special characters found:</strong> ${findSpecialCharacters(inputText)}
                </div>
            </li>
            <li><strong>Statistical Scoring:</strong> Logarithmic scoring with confidence calculation
                <div class="example-box">
                    <strong>Language scores:</strong> ${calculateLanguageScores(inputText)}<br>
                    <em>Algorithm:</em> ${result.algorithm || 'N-gram + Character Frequency Analysis'}
                </div>
            </li>
        </ul>
    `;

    // Display the detection result with enhanced information
    resultContainer.innerHTML = `
        <div class="language-info">
            <div class="language-flag">${result.flag}</div>
            <div class="language-details">
                <div class="language-name">${result.name}</div>
                <div class="confidence-score">Confidence: ${result.confidence}%</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                </div>
                <div class="detection-source">
                    <small>Source: ${result.source === 'api' ? `${result.apiName} API` : 'Advanced N-gram Algorithm'}</small>
                </div>
                <div class="algorithm-info">
                    <small>Method: Statistical analysis with ${getTrigramCount(inputText)} trigrams processed</small>
                </div>
            </div>
        </div>
    `;
}

// Helper function to extract and display trigrams
function extractTrigrams(text) {
    const normalized = text.toLowerCase().replace(/[^a-záàâãéèêëïîôöùûüÿçñ]/g, '');
    const trigrams = [];

    for (let i = 0; i <= normalized.length - 3; i++) {
        trigrams.push(normalized.substring(i, i + 3));
    }

    // Get unique trigrams and their frequencies
    const trigramCounts = {};
    trigrams.forEach(tri => {
        trigramCounts[tri] = (trigramCounts[tri] || 0) + 1;
    });

    // Return top 5 most frequent trigrams
    return Object.entries(trigramCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tri, count]) => `"${tri}" (${count})`)
        .join(', ') || 'None found';
}

// Helper function to count trigrams
function getTrigramCount(text) {
    const normalized = text.toLowerCase().replace(/[^a-záàâãéèêëïîôöùûüÿçñ]/g, '');
    return Math.max(0, normalized.length - 2);
}

// Helper functions for detailed analysis using the new N-gram algorithm
function analyzeCharacterFrequency(text) {
    const normalized = text.toLowerCase().replace(/[^a-záàâãéèêëïîôöùûüÿçñ]/g, '');
    const freq = {};

    for (const char of normalized) {
        freq[char] = (freq[char] || 0) + 1;
    }

    const total = normalized.length;
    const sortedChars = Object.entries(freq)
        .map(([char, count]) => ({ char, count, percentage: (count / total * 100).toFixed(1) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    return sortedChars.map(item => `'${item.char}' (${item.count}, ${item.percentage}%)`).join(', ');
}

function findSpecialCharacters(text) {
    const specialChars = text.match(/[àâäéèêëïîôöùûüÿçñáéíóúüÑÁÉÍÓÚÜÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇäöüßÄÖÜ]/g);
    if (!specialChars || specialChars.length === 0) {
        return 'None detected';
    }

    const uniqueChars = [...new Set(specialChars)];
    const charInfo = uniqueChars.map(char => {
        const count = (text.match(new RegExp(char, 'g')) || []).length;
        return `${char} (${count})`;
    });

    return charInfo.join(', ');
}

function findCommonWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = {
        'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are'],
        'es': ['que', 'del', 'est', 'par', 'ent', 'con', 'los', 'des', 'der', 'las', 'res', 'el', 'la', 'de', 'y'],
        'fr': ['les', 'des', 'ent', 'que', 'une', 'ons', 'qui', 'son', 'our', 'sur', 'ont', 'le', 'de', 'et', 'à'],
        'de': ['der', 'und', 'die', 'den', 'ich', 'das', 'ein', 'cht', 'sch', 'end', 'ent', 'nde', 'ine', 'ber'],
        'it': ['che', 'ent', 'con', 'del', 'per', 'est', 'ell', 'tte', 'ant', 'lle', 'ion', 'il', 'di', 'e', 'la'],
        'pt': ['que', 'ent', 'ade', 'com', 'est', 'dos', 'par', 'nte', 'ção', 'ess', 'o', 'de', 'a', 'do', 'da']
    };

    const matches = {};
    for (const [lang, langWords] of Object.entries(commonWords)) {
        const found = words.filter(word => langWords.includes(word));
        if (found.length > 0) {
            matches[lang] = [...new Set(found)]; // Remove duplicates
        }
    }

    if (Object.keys(matches).length === 0) {
        return 'No common words detected';
    }

    return Object.entries(matches)
        .map(([lang, words]) => `${lang.toUpperCase()}: ${words.join(', ')} (${words.length})`)
        .join(' | ');
}

function calculateLanguageScores(text) {
    const result = detectLanguage(text);

    if (result.scores) {
        return Object.entries(result.scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4) // Show top 4 scores
            .map(([lang, score]) => `${lang.toUpperCase()}: ${score.toFixed(2)}`)
            .join(', ');
    }

    return 'Scores not available';
}

// Advanced tokenization using BPE-inspired algorithm + regex patterns
// This mimics real tokenization used in modern LLMs
function tokenizeText(text) {
    // Step 1: Pre-tokenization with regex patterns (similar to GPT tokenizers)
    const preTokens = preTokenize(text);

    // Step 2: Apply BPE-style subword tokenization
    const tokens = [];

    for (const preToken of preTokens) {
        if (preToken.type === 'word') {
            // Apply BPE to word tokens
            const subwordTokens = bpeTokenize(preToken.value);
            tokens.push(...subwordTokens.map(token => ({
                text: token,
                type: 'subword',
                id: generateTokenId(token),
                encoding: 'BPE'
            })));
        } else {
            // Keep punctuation, numbers, etc. as-is
            tokens.push({
                text: preToken.value,
                type: preToken.type,
                id: generateTokenId(preToken.value),
                encoding: 'direct'
            });
        }
    }

    return tokens;
}

// Pre-tokenization step - split text into meaningful units
function preTokenize(text) {
    const tokens = [];

    // Regex patterns for different token types (inspired by GPT tokenizers)
    const patterns = [
        { regex: /\s+/g, type: 'whitespace' },
        { regex: /[^\w\s](?![^\w\s])/g, type: 'punctuation' },
        { regex: /\d+/g, type: 'number' },
        { regex: /[a-zA-ZàâäéèêëïîôöùûüÿçñáéíóúüÑÁÉÍÓÚÜÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇäöüßÄÖÜ]+/g, type: 'word' },
        { regex: /[^\w\s]/g, type: 'special' }
    ];

    let lastIndex = 0;

    // Process text character by character to maintain order
    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Check which pattern matches
        for (const pattern of patterns) {
            const match = text.substring(lastIndex).match(pattern.regex);
            if (match && match.index === 0) {
                const token = match[0];
                tokens.push({
                    value: token,
                    type: pattern.type,
                    start: lastIndex,
                    end: lastIndex + token.length
                });
                lastIndex += token.length;
                i = lastIndex - 1; // Adjust loop counter
                break;
            }
        }
    }

    return tokens.filter(token => token.value.trim().length > 0);
}

// Simplified BPE (Byte Pair Encoding) algorithm
function bpeTokenize(word) {
    if (word.length <= 2) return [word];

    // Start with character-level tokens
    let tokens = word.split('');

    // Common BPE merges based on frequency (simplified version)
    const bpeMerges = [
        // English common merges
        ['e', 'r'], ['e', 'd'], ['i', 'n'], ['o', 'n'], ['r', 'e'], ['a', 't'], ['e', 'n'],
        ['t', 'i'], ['e', 's'], ['o', 'r'], ['t', 'e'], ['o', 'f'], ['b', 'e'], ['t', 'o'],
        ['i', 't'], ['i', 's'], ['h', 'e'], ['n', 'g'], ['h', 'a'], ['a', 'n'], ['o', 'u'],
        ['a', 'r'], ['a', 's'], ['r', 'i'], ['h', 'i'], ['n', 'e'], ['s', 'e'], ['l', 'e'],
        ['d', 'e'], ['t', 'h'], ['a', 'l'], ['n', 't'], ['t', 'r'], ['l', 'l'], ['s', 't'],
        ['r', 'o'], ['c', 'o'], ['l', 'i'], ['a', 'c'], ['u', 'r'], ['c', 'h'], ['p', 'r'],
        ['c', 'e'], ['s', 'h'], ['n', 'c'], ['c', 'k'], ['c', 't'], ['p', 'h'], ['m', 'e'],
        ['r', 'v'], ['e', 'l'], ['u', 'e'], ['p', 'e'], ['t', 'u'], ['c', 'o'], ['t', 'y'],
        ['g', 'h'], ['c', 'i'], ['b', 'a'], ['p', 'u'], ['l', 'a'], ['r', 'u'], ['r', 'n'],
        ['m', 'm'], ['t', 't'], ['s', 's'], ['n', 'n'], ['l', 'l'], ['r', 'r'], ['p', 'p'],

        // Multi-character common patterns
        ['th', 'e'], ['in', 'g'], ['er', 's'], ['re', 's'], ['ed', 's'], ['ly', 's'],
        ['al', 's'], ['en', 't'], ['io', 'n'], ['ti', 'on'], ['er', 'e'], ['he', 'r'],
        ['an', 'd'], ['th', 'at'], ['en', 'd'], ['ou', 'r'], ['ar', 'e'], ['te', 'r'],
        ['es', 't'], ['or', 'y'], ['ic', 'e'], ['ow', 'n'], ['un', 'd'], ['ay', 's'],
        ['igh', 't'], ['ous', 'e'], ['ful', 'l'], ['ness', 'es'], ['tion', 'al'],
        ['ment', 'al'], ['able', 'ly'], ['ible', 'ly']
    ];

    // Apply BPE merges iteratively
    let changed = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        for (const [first, second] of bpeMerges) {
            for (let i = 0; i < tokens.length - 1; i++) {
                if (tokens[i] === first && tokens[i + 1] === second) {
                    tokens[i] = first + second;
                    tokens.splice(i + 1, 1);
                    changed = true;
                    break;
                }
            }
        }
    }

    // Handle remaining single characters and create subword tokens
    const finalTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.length === 1 && i < tokens.length - 1) {
            // Try to merge single characters with common patterns
            if (token.match(/[aeiou]/i) && tokens[i + 1].match(/[bcdfghjklmnpqrstvwxyz]/i)) {
                finalTokens.push(token + tokens[i + 1]);
                i++; // Skip next token
            } else {
                finalTokens.push(token);
            }
        } else {
            finalTokens.push(token);
        }
    }

    return finalTokens;
}

// Generate token IDs (similar to how real tokenizers work)
function generateTokenId(token) {
    // Simple hash function to generate consistent IDs
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 50000; // Keep IDs in reasonable range
}

// Advanced token analysis for educational purposes
function analyzeTokens(tokens) {
    const analysis = {
        totalTokens: tokens.length,
        uniqueTokens: new Set(tokens.map(t => t.text)).size,
        typeDistribution: {},
        encodingDistribution: {},
        averageTokenLength: 0,
        vocabularyRichness: 0,
        subwordRatio: 0
    };

    // Count by type
    tokens.forEach(token => {
        analysis.typeDistribution[token.type] = (analysis.typeDistribution[token.type] || 0) + 1;
        analysis.encodingDistribution[token.encoding] = (analysis.encodingDistribution[token.encoding] || 0) + 1;
    });

    // Calculate averages
    analysis.averageTokenLength = tokens.reduce((sum, token) => sum + token.text.length, 0) / tokens.length;
    analysis.vocabularyRichness = analysis.uniqueTokens / analysis.totalTokens;
    analysis.subwordRatio = (analysis.encodingDistribution['BPE'] || 0) / analysis.totalTokens;

    return analysis;
}

// Display tokens with advanced visualization
function displayTokens(tokens) {
    const tokensContainer = document.getElementById('tokens-container');
    const tokenCount = document.getElementById('token-count');

    // Analyze tokens for educational insights
    const analysis = analyzeTokens(tokens);

    // Color schemes for different token types
    const typeColors = {
        'subword': ['#3498db', '#2980b9', '#1abc9c', '#16a085'],
        'word': ['#2ecc71', '#27ae60'],
        'punctuation': ['#e74c3c', '#c0392b'],
        'number': ['#f39c12', '#e67e22'],
        'special': ['#9b59b6', '#8e44ad'],
        'whitespace': ['#bdc3c7', '#95a5a6']
    };

    tokensContainer.innerHTML = '';

    // Create tokens display
    tokens.forEach((token, index) => {
        if (token.type === 'whitespace') return; // Skip whitespace for display

        const tokenElement = document.createElement('span');
        tokenElement.className = `token token-${token.type}`;
        tokenElement.textContent = token.text;

        // Get color based on token type
        const colors = typeColors[token.type] || ['#34495e'];
        const color = colors[index % colors.length];
        tokenElement.style.backgroundColor = color;
        tokenElement.style.color = 'white';

        // Enhanced tooltip with token information
        tokenElement.title = `Token ID: ${token.id}
Type: ${token.type}
Encoding: ${token.encoding}
Length: ${token.text.length} chars
Position: ${index + 1}`;

        // Add click handler for detailed info
        tokenElement.addEventListener('click', () => showTokenDetails(token, index));

        tokensContainer.appendChild(tokenElement);
    });

    // Display comprehensive statistics
    tokenCount.innerHTML = `
        <div class="token-statistics">
            <h4>📊 Tokenization Analysis</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Tokens:</span>
                    <span class="stat-value">${analysis.totalTokens}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Unique Tokens:</span>
                    <span class="stat-value">${analysis.uniqueTokens}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Token Length:</span>
                    <span class="stat-value">${analysis.averageTokenLength.toFixed(1)} chars</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Vocabulary Richness:</span>
                    <span class="stat-value">${(analysis.vocabularyRichness * 100).toFixed(1)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Subword Ratio:</span>
                    <span class="stat-value">${(analysis.subwordRatio * 100).toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="type-distribution">
                <h5>Token Type Distribution:</h5>
                ${Object.entries(analysis.typeDistribution)
            .map(([type, count]) =>
                `<span class="type-badge" style="background-color: ${typeColors[type]?.[0] || '#34495e'}">
                            ${type}: ${count}
                        </span>`
            ).join('')}
            </div>
            
            <div class="encoding-distribution">
                <h5>Encoding Method Distribution:</h5>
                ${Object.entries(analysis.encodingDistribution)
            .map(([encoding, count]) =>
                `<span class="encoding-badge">
                            ${encoding}: ${count} tokens (${((count / analysis.totalTokens) * 100).toFixed(1)}%)
                        </span>`
            ).join('')}
            </div>
        </div>
    `;
}

// Show detailed token information
function showTokenDetails(token, position) {
    const modal = document.createElement('div');
    modal.className = 'token-modal';
    modal.innerHTML = `
        <div class="token-modal-content">
            <h3>Token Details</h3>
            <div class="token-detail-grid">
                <div class="detail-row">
                    <span class="detail-label">Text:</span>
                    <span class="detail-value">"${token.text}"</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Token ID:</span>
                    <span class="detail-value">${token.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${token.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Encoding:</span>
                    <span class="detail-value">${token.encoding}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Position:</span>
                    <span class="detail-value">${position + 1}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Length:</span>
                    <span class="detail-value">${token.text.length} characters</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Unicode:</span>
                    <span class="detail-value">${Array.from(token.text).map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ')}</span>
                </div>
            </div>
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Display functions for each LLM processing step

// Display tokens for LLM pipeline
function displayTokensLLM(tokens, originalText) {
    const tokensContainer = document.getElementById('tokens-container');
    const tokenCount = document.getElementById('token-count');

    if (!tokensContainer) {
        console.error('tokens-container element not found!');
        return;
    }

    console.log('displayTokensLLM called with tokens:', tokens);
    console.log('originalText:', originalText);

    tokensContainer.innerHTML = '';

    // Use provided originalText or reconstruct from tokens
    const textToDisplay = originalText || tokens
        .filter(t => t.type !== 'special')
        .map(t => t.text)
        .join(' ')
        .replace(/ ([.,!?;:])/g, '$1');

    console.log('textToDisplay:', textToDisplay);
    console.log('tokens array:', tokens);
    console.log('tokens length:', tokens.length);

    // Create detailed token breakdown
    const tokenBreakdown = document.createElement('div');
    tokenBreakdown.className = 'token-breakdown';

    tokenBreakdown.innerHTML = `
        <div class="original-text-display">
            <h5>📝 Original Text:</h5>
            <p class="original-text">"${textToDisplay}"</p>
        </div>
        <div class="tokenization-explanation">
            <h5>🔤 BPE Tokenization Breakdown:</h5>
            <p>See how your text is split into tokens (subwords) that the LLM understands:</p>
        </div>
    `;

    // Create simple token visualization like the reference image
    const tokenSequence = document.createElement('div');
    tokenSequence.className = 'token-sequence-simple';
    tokenSequence.innerHTML = `
        <div class="tokenization-explanation">
            <h4>🔤 BPE Tokenization Breakdown:</h4>
            <p>Each token represents a meaningful unit that the model processes:</p>
        </div>
    `;

    // Create token container
    const tokenContainer = document.createElement('div');
    tokenContainer.className = 'tokens-grid';

    tokens.forEach((token, index) => {
        console.log(`Processing token ${index}:`, token);
        const tokenBox = document.createElement('div');
        tokenBox.className = 'token-box';

        // Enhanced color coding based on token type
        let tokenClass = 'token-normal';
        if (token.type === 'special') {
            tokenClass = 'token-special';
        } else if (token.type === 'punctuation') {
            tokenClass = 'token-punctuation';
        } else if (token.type === 'subword') {
            tokenClass = 'token-subword';
        } else if (token.type === 'word') {
            tokenClass = 'token-word';
        }

        tokenBox.classList.add(tokenClass);

        tokenBox.innerHTML = `<span class="token-text">${token.text}</span>`;

        // Enhanced hover info
        tokenBox.title = `Token: "${token.text}" | Type: ${token.type} | ID: ${token.id} | Encoding: ${token.encoding}`;

        tokenContainer.appendChild(tokenBox);
        console.log(`Token element ${index} added to tokenContainer`);
    });

    tokenSequence.appendChild(tokenContainer);

    console.log('tokenSequence children count:', tokenSequence.children.length);

    tokensContainer.appendChild(tokenBreakdown);
    tokensContainer.appendChild(tokenSequence);

    console.log('tokensContainer children count after append:', tokensContainer.children.length);

    // Show tokenization statistics
    const stats = analyzeTokenization(tokens, textToDisplay);
    tokenCount.innerHTML = `
        <div class="token-pipeline-stats">
            <h5>� Tokenization Analysis:</h5>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Original Characters:</span>
                    <span class="stat-value">${textToDisplay.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Tokens:</span>
                    <span class="stat-value">${tokens.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Compression Ratio:</span>
                    <span class="stat-value">${stats.compressionRatio}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Subword Tokens:</span>
                    <span class="stat-value">${stats.subwordCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Special Tokens:</span>
                    <span class="stat-value">${stats.specialCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Ready for Embedding:</span>
                    <span class="stat-value">✅</span>
                </div>
            </div>
            <div class="tokenization-insight">
                <p><strong>💡 Insight:</strong> ${getTokenizationInsight(stats, textToDisplay)}</p>
            </div>
        </div>
    `;
}

// Analyze tokenization results
function analyzeTokenization(tokens, originalText) {
    const subwordCount = tokens.filter(t => t.type === 'subword').length;
    const specialCount = tokens.filter(t => t.type === 'special').length;
    const compressionRatio = (originalText.length / tokens.length).toFixed(2);

    return {
        subwordCount,
        specialCount,
        compressionRatio,
        efficiency: compressionRatio > 4 ? 'High' : compressionRatio > 2 ? 'Medium' : 'Low'
    };
}

// Get tokenization insight
function getTokenizationInsight(stats, originalText) {
    if (stats.compressionRatio > 4) {
        return `Excellent compression! Each token represents ${stats.compressionRatio} characters on average. BPE effectively captured common patterns.`;
    } else if (stats.compressionRatio > 2) {
        return `Good tokenization efficiency. The BPE algorithm found ${stats.subwordCount} meaningful subword units.`;
    } else {
        return `Character-level tokenization detected. This might indicate rare words or special characters requiring individual token treatment.`;
    }
}

// Show detailed token analysis
function showTokenAnalysis(token, position, originalText) {
    const modal = document.createElement('div');
    modal.className = 'token-analysis-modal';

    // Determine what this token represents in context
    let contextAnalysis = "";
    if (token.type === 'special') {
        contextAnalysis = token.text === '<BOS>' ?
            "Marks the beginning of the sequence. This helps the model understand where the input starts." :
            "Padding token used for sequence alignment and future prediction.";
    } else if (token.type === 'subword') {
        contextAnalysis = `This subword token represents part of a larger word. BPE broke down the original word into this meaningful unit that appears frequently in the training data.`;
    } else if (token.type === 'word') {
        contextAnalysis = `Complete word token. This word is common enough to have its own dedicated token ID in the vocabulary.`;
    } else if (token.type === 'punctuation') {
        contextAnalysis = `Punctuation token that provides structural information about sentence boundaries and grammatical structure.`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <h3>🔍 Token Analysis: "${token.text}"</h3>
            <div class="analysis-grid">
                <div class="analysis-section">
                    <h4>Basic Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Text:</span>
                        <span class="detail-value">"${token.text}"</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Position:</span>
                        <span class="detail-value">${position} of ${originalText.split(' ').length} tokens</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Token ID:</span>
                        <span class="detail-value">${token.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${token.type}</span>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Encoding Details</h4>
                    <div class="detail-row">
                        <span class="detail-label">Encoding Method:</span>
                        <span class="detail-value">${token.encoding}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Character Length:</span>
                        <span class="detail-value">${token.text.length} chars</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Unicode Points:</span>
                        <span class="detail-value">${Array.from(token.text).map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ')}</span>
                    </div>
                </div>
            </div>
            
            <div class="context-analysis">
                <h4>Context Analysis</h4>
                <p>${contextAnalysis}</p>
            </div>
            
            <div class="next-step-info">
                <h4>Next Processing Step</h4>
                <p>This token will be converted to a ${token.type === 'special' ? '768' : '768'}-dimensional embedding vector, combining semantic meaning with positional information.</p>
            </div>
            
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">Close Analysis</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Display simple embeddings visualization
function displayEmbeddings(embeddings, tokens) {
    const embeddingsContainer = document.getElementById('embeddings-container');
    const embeddingsInfo = document.getElementById('embeddings-info');

    if (!embeddingsContainer) return;

    embeddingsContainer.innerHTML = '';

    // Create simple explanation
    const explanation = document.createElement('div');
    explanation.className = 'embedding-simple-explanation';
    explanation.innerHTML = `
        <div class="embedding-concept">
            <h5>💡 How it works:</h5>
            <p>Each token is converted into a vector of 768 numbers that captures its semantic meaning.</p>
            <p>Here we show a simplified version with only 8 dimensions for visualization:</p>
        </div>
    `;
    embeddingsContainer.appendChild(explanation);

    // Show a simple example with one token
    if (tokens.length > 1) {
        // Pick the first real token (skip <BOS>)
        const exampleTokenIndex = tokens.findIndex(t => t.type !== 'special');
        if (exampleTokenIndex !== -1) {
            const token = tokens[exampleTokenIndex];

            // Generate simple 8-dimensional vector for demonstration
            const simpleVector = [];
            for (let i = 0; i < 8; i++) {
                simpleVector.push((Math.random() - 0.5) * 2); // Random values between -1 and 1
            }

            const tokenExample = document.createElement('div');
            tokenExample.className = 'embedding-example';
            tokenExample.innerHTML = `
                <div class="token-to-vector">
                    <div class="input-token">
                        <h6>Token:</h6>
                        <div class="example-token">"${token.text}"</div>
                    </div>
                    <div class="arrow">→</div>
                    <div class="output-vector">
                        <h6>Embedding Vector (simplified):</h6>
                        <div class="vector-display">
                            [${simpleVector.map(v => v.toFixed(2)).join(', ')}]
                        </div>
                        <div class="vector-note">
                            <small>* In reality, this would be a 768-dimensional vector</small>
                        </div>
                    </div>
                </div>
            `;
            embeddingsContainer.appendChild(tokenExample);
        }
    }

    // Update info
    if (embeddingsInfo) {
        embeddingsInfo.innerHTML = `
            <div class="embedding-summary">
                <p><strong>Summary:</strong> ${tokens.length} tokens converted to high-dimensional vectors that capture semantic meaning and position in the sequence.</p>
            </div>
        `;
    }
}

// Display attention matrix
function displayAttentionMatrix(attentionMaps, tokens) {
        const attentionContainer = document.getElementById('attention-matrix');
        const headSelect = document.getElementById('attention-head-select');

        if (!attentionContainer) return;

        // Setup head selector
        if (headSelect) {
            headSelect.innerHTML = '';
            attentionMaps.forEach((mapData, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = `Head ${idx + 1}: ${mapData.description}`;
                headSelect.appendChild(option);
            });

            headSelect.addEventListener('change', () => {
                displayAttentionHead(attentionMaps[headSelect.value], tokens);
            });
        }

        // Display first head by default
        displayAttentionHead(attentionMaps[0], tokens);
    }

function displayAttentionHead(attentionData, tokens) {
        const attentionContainer = document.getElementById('attention-matrix');

        attentionContainer.innerHTML = `
        <div class="attention-description">
            <h5>👁️ ${attentionData.description}</h5>
        </div>
    `;

        const matrix = document.createElement('div');
        matrix.className = 'attention-heatmap';

        // Create attention matrix visualization
        for (let i = 0; i < attentionData.attention.length; i++) {
            const row = document.createElement('div');
            row.className = 'attention-row';

            for (let j = 0; j < attentionData.attention[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'attention-cell';

                const weight = attentionData.attention[i][j];
                cell.style.backgroundColor = `rgba(52, 152, 219, ${weight})`;
                cell.title = `${tokens[i]?.text || 'Token'} → ${tokens[j]?.text || 'Token'}: ${(weight * 100).toFixed(1)}%`;

                // Add click interaction
                cell.addEventListener('click', () => {
                    showAttentionDetail(tokens[i], tokens[j], weight);
                });

                row.appendChild(cell);
            }

            matrix.appendChild(row);
        }

        attentionContainer.appendChild(matrix);

        // Add token labels
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'attention-labels';
        labelsContainer.innerHTML = `
        <div class="attention-tokens">
            <strong>Tokens:</strong> ${tokens.map(t => t.text).join(' → ')}
        </div>
    `;
        attentionContainer.appendChild(labelsContainer);
}

function showAttentionDetail(fromToken, toToken, weight) {
    alert(`Attention Detail:\n\nFrom: "${fromToken?.text}"\nTo: "${toToken?.text}"\nWeight: ${(weight * 100).toFixed(2)}%\n\nThis shows how much the model focuses on "${toToken?.text}" when processing "${fromToken?.text}"`);
}

// Display feed forward network processing
function displayFeedForward(ffnOutputs) {
        const ffnContainer = document.getElementById('feedforward-visualization');
        const ffnStats = document.getElementById('feedforward-stats');

        if (!ffnContainer) return;

        ffnContainer.innerHTML = '';

        const ffnViz = document.createElement('div');
        ffnViz.className = 'ffn-visualization';

        ffnOutputs.forEach((tokenData, idx) => {
            const tokenFFN = document.createElement('div');
            tokenFFN.className = 'token-ffn';

            tokenFFN.innerHTML = `
            <div class="ffn-token-label">${tokenData.token}</div>
            <div class="ffn-stats">
                <div class="ffn-stat">Max: ${tokenData.activationStats.maxActivation.toFixed(3)}</div>
                <div class="ffn-stat">Mean: ${tokenData.activationStats.meanActivation.toFixed(3)}</div>
                <div class="ffn-stat">Sparsity: ${(tokenData.activationStats.sparsity * 100).toFixed(1)}%</div>
            </div>
        `;

            ffnViz.appendChild(tokenFFN);
        });

        ffnContainer.appendChild(ffnViz);

        if (ffnStats) {
            const avgSparsity = ffnOutputs.reduce((sum, t) => sum + t.activationStats.sparsity, 0) / ffnOutputs.length;

            ffnStats.innerHTML = `
            <div class="ffn-global-stats">
                <h5>🧠 Feed Forward Network Analysis:</h5>
                <p><strong>Network Type:</strong> Linear → GELU → Linear with residual connections</p>
                <p><strong>Expansion Ratio:</strong> 4x (768 → 3072 → 768)</p>
                <p><strong>Average Sparsity:</strong> ${(avgSparsity * 100).toFixed(1)}% (neurons with low activation)</p>
                <p><strong>Non-linearity:</strong> GELU activation creates complex feature interactions ✅</p>
            </div>
        `;
        }
    }

// Display layer stack processing
function displayLayerStack(layerOutputs, tokens) {
        const layersContainer = document.getElementById('layers-visualization');
        const layerSelect = document.getElementById('layer-select');

        if (!layersContainer) return;

        // Setup layer selector
        if (layerSelect) {
            layerSelect.innerHTML = '';
            [0, 3, 6, 9, 11].forEach(layerIdx => {
                const option = document.createElement('option');
                option.value = layerIdx;
                option.textContent = layerOutputs[layerIdx].description;
                layerSelect.appendChild(option);
            });

            layerSelect.addEventListener('change', () => {
                displaySpecificLayer(layerOutputs[layerSelect.value], tokens);
            });
        }

        // Display overview and first layer
        displayLayerOverview(layerOutputs);
        displaySpecificLayer(layerOutputs[0], tokens);
    }

function displayLayerOverview(layerOutputs) {
        const layersContainer = document.getElementById('layers-visualization');

        const overview = document.createElement('div');
        overview.className = 'layers-overview';
        overview.innerHTML = `
        <h5>🏗️ 12-Layer Transformer Architecture</h5>
        <div class="layer-flow">
            <div class="layer-group">
                <div class="layer-group-title">Early Layers (1-4)</div>
                <div class="layer-group-desc">Surface patterns, syntax, basic structure</div>
            </div>
            <div class="layer-arrow">→</div>
            <div class="layer-group">
                <div class="layer-group-title">Middle Layers (5-8)</div>
                <div class="layer-group-desc">Semantics, word relationships, context</div>
            </div>
            <div class="layer-arrow">→</div>
            <div class="layer-group">
                <div class="layer-group-title">Late Layers (9-12)</div>
                <div class="layer-group-desc">Complex reasoning, high-level understanding</div>
            </div>
        </div>
    `;

        layersContainer.appendChild(overview);
    }

function displaySpecificLayer(layerData, tokens) {
        const layersContainer = document.getElementById('layers-visualization');

        // Remove existing layer detail
        const existingDetail = layersContainer.querySelector('.layer-detail');
        if (existingDetail) existingDetail.remove();

        const layerDetail = document.createElement('div');
        layerDetail.className = 'layer-detail';

        layerDetail.innerHTML = `
        <h5>🔍 ${layerData.description}</h5>
        <div class="layer-tokens">
            ${layerData.tokens.map((tokenData, idx) => `
                <div class="layer-token" title="Representation magnitude: ${Math.sqrt(tokenData.representation.reduce((sum, val) => sum + val * val, 0)).toFixed(3)}">
                    <div class="layer-token-text">${tokenData.token}</div>
                    <div class="layer-token-bar">
                        <div class="layer-token-fill" style="width: ${Math.min(100, Math.abs(tokenData.representation[0]) * 1000)}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="layer-explanation">
            <p><strong>Processing Focus:</strong> ${getLayerFocus(layerData.layer)}</p>
        </div>
    `;

        layersContainer.appendChild(layerDetail);
    }

function getLayerFocus(layer) {
        if (layer < 4) return "Identifying word boundaries, basic grammatical patterns, and surface-level relationships.";
        if (layer < 8) return "Understanding word meanings, semantic relationships, and contextual dependencies.";
        return "Complex reasoning, inference, and high-level conceptual understanding.";
    }

// Display final predictions
function displayPredictions(predictions, originalText) {
        const predictionsContainer = document.getElementById('predictions-ranking');
        const temperatureSlider = document.getElementById('temperature-slider');
        const temperatureValue = document.getElementById('temperature-value');
        const generateButton = document.getElementById('generate-next');
        const generatedSequence = document.getElementById('generated-sequence');

        if (!predictionsContainer) return;

        // Clear container and add detailed header
        predictionsContainer.innerHTML = '';

        const predictionHeader = document.createElement('div');
        predictionHeader.className = 'prediction-header';
        predictionHeader.innerHTML = `
        <h5>🔮 Next Word Predictions</h5>
        <p>Based on the processed sequence: "<strong>${originalText}</strong>"</p>
        <div class="prediction-summary">
            <span class="summary-item">Total Candidates: ${predictions.length}</span>
            <span class="summary-item">Top Prediction: "${predictions[0]?.word}" (${(predictions[0]?.probability * 100).toFixed(1)}%)</span>
            <span class="summary-item">Entropy: ${calculateEntropy(predictions).toFixed(3)}</span>
        </div>
    `;
        predictionsContainer.appendChild(predictionHeader);

        // Display detailed prediction analysis
        const analysisSection = document.createElement('div');
        analysisSection.className = 'prediction-analysis';

        const confidenceLevel = predictions[0]?.probability > 0.5 ? 'High' :
            predictions[0]?.probability > 0.2 ? 'Medium' : 'Low';

        const diversityScore = calculateDiversity(predictions);

        analysisSection.innerHTML = `
        <div class="analysis-insights">
            <h6>📊 Prediction Analysis:</h6>
            <div class="insight-grid">
                <div class="insight-item">
                    <span class="insight-label">Confidence Level:</span>
                    <span class="insight-value ${confidenceLevel.toLowerCase()}">${confidenceLevel}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Diversity Score:</span>
                    <span class="insight-value">${diversityScore}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Total Vocabulary:</span>
                    <span class="insight-value">${predictions.length} tokens</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Distribution:</span>
                    <span class="insight-value">${getDistributionType(predictions)}</span>
                </div>
            </div>
            <div class="prediction-insight">
                <p><strong>💡 Model Insight:</strong> ${generatePredictionInsight(predictions, originalText)}</p>
            </div>
        </div>
    `;
        predictionsContainer.appendChild(analysisSection);

        // Display top predictions with detailed breakdown
        const rankingList = document.createElement('div');
        rankingList.className = 'predictions-list';

        const topPredictions = predictions.slice(0, 10);
        topPredictions.forEach((pred, idx) => {
            const predItem = document.createElement('div');
            predItem.className = 'prediction-item';

            const probability = (pred.probability * 100).toFixed(2);
            const logProb = Math.log(pred.probability).toFixed(3);
            const barWidth = (pred.probability / predictions[0].probability) * 100;

            // Determine prediction category
            const category = categorizePrediction(pred.word);

            predItem.innerHTML = `
            <div class="prediction-header-item">
                <div class="prediction-rank">#${pred.rank}</div>
                <div class="prediction-word" onclick="selectPrediction('${pred.word}')" title="Click to select this word">
                    "${pred.word}"
                </div>
                <div class="prediction-category">${category}</div>
            </div>
            <div class="prediction-details">
                <div class="detail-row">
                    <span class="detail-label">Probability:</span>
                    <span class="detail-value">${probability}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Log Probability:</span>
                    <span class="detail-value">${logProb}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Relative Confidence:</span>
                    <span class="detail-value">${(barWidth).toFixed(1)}%</span>
                </div>
            </div>
            <div class="prediction-bar">
                <div class="prediction-fill" style="width: ${barWidth}%; background: ${getCategoryColor(category)}"></div>
            </div>
            <div class="prediction-explanation">
                <small>${explainPrediction(pred.word, pred.probability, idx)}</small>
            </div>
        `;

            predItem.addEventListener('click', () => {
                showDetailedPredictionAnalysis(pred, originalText, predictions);
            });

            rankingList.appendChild(predItem);
        });

        predictionsContainer.appendChild(rankingList);

        // Add interactive controls section
        const controlsSection = document.createElement('div');
        controlsSection.className = 'prediction-controls';
        controlsSection.innerHTML = `
        <div class="control-group">
            <h6>🎛️ Generation Controls:</h6>
            <div class="temperature-control">
                <label for="temperature-range">Temperature (${temperatureSlider?.value || '0.7'}):</label>
                <input type="range" id="temperature-range" min="0.1" max="2.0" step="0.1" value="${temperatureSlider?.value || '0.7'}">
                <div class="temperature-explanation">
                    <small>Lower = more predictable, Higher = more creative</small>
                </div>
            </div>
            <button class="generate-button" onclick="generateNextWord()">
                🚀 Generate Next Word
            </button>
        </div>
        <div class="sequence-display">
            <h6>📝 Generated Sequence:</h6>
            <div class="generated-text" id="generated-display">${originalText}</div>
        </div>
    `;

        predictionsContainer.appendChild(controlsSection);
    }

// Helper functions for detailed prediction analysis
function calculateEntropy(predictions) {
        return -predictions.reduce((entropy, pred) => {
            const p = pred.probability;
            return entropy + (p > 0 ? p * Math.log2(p) : 0);
        }, 0);
    }

function calculateDiversity(predictions) {
        const top5 = predictions.slice(0, 5);
        const totalProb = top5.reduce((sum, p) => sum + p.probability, 0);
        return totalProb < 0.8 ? 'High' : totalProb < 0.95 ? 'Medium' : 'Low';
    }

function getDistributionType(predictions) {
        const topProb = predictions[0]?.probability || 0;
        if (topProb > 0.7) return 'Peaked';
        if (topProb > 0.4) return 'Moderate';
        return 'Uniform';
    }

function categorizePrediction(word) {
        if (!word) return 'Unknown';

        // Simple categorization based on word patterns
        if (word.match(/^[.!?;:,]$/)) return 'Punctuation';
        if (word.match(/^[0-9]+$/)) return 'Number';
        if (word.match(/^[A-Z]/)) return 'Proper Noun';
        if (word.match(/^(the|a|an|and|or|but|in|on|at|to|for|of|with|by)$/i)) return 'Function Word';
        if (word.length > 6) return 'Complex Word';
        return 'Content Word';
    }

function getCategoryColor(category) {
        const colors = {
            'Punctuation': '#e74c3c',
            'Number': '#9b59b6',
            'Proper Noun': '#f39c12',
            'Function Word': '#2ecc71',
            'Complex Word': '#3498db',
            'Content Word': '#1abc9c',
            'Unknown': '#95a5a6'
        };
        return colors[category] || '#95a5a6';
    }

function explainPrediction(word, probability, rank) {
        if (rank === 0) {
            return `Most likely next word based on context analysis and learned patterns.`;
        } else if (rank < 3) {
            return `Strong alternative with ${(probability * 100).toFixed(1)}% confidence from attention patterns.`;
        } else if (rank < 5) {
            return `Plausible continuation considering semantic relationships in training data.`;
        } else {
            return `Lower probability option, may represent creative or less common usage.`;
        }
    }

function generatePredictionInsight(predictions, originalText) {
        const topWord = predictions[0]?.word;
        const topProb = predictions[0]?.probability;

        if (topProb > 0.6) {
            return `The model is highly confident that "${topWord}" should follow "${originalText}". This suggests a strong linguistic pattern learned during training.`;
        } else if (topProb > 0.3) {
            return `The model shows moderate confidence in "${topWord}" but considers several alternatives. This indicates a context where multiple continuations are plausible.`;
        } else {
            return `The prediction shows high uncertainty with "${topWord}" as the leading candidate. This suggests the context could continue in many different directions.`;
        }
    }

function showDetailedPredictionAnalysis(prediction, originalText, allPredictions) {
        const modal = document.createElement('div');
        modal.className = 'prediction-analysis-modal';

        const percentile = ((allPredictions.length - prediction.rank + 1) / allPredictions.length * 100).toFixed(1);

        modal.innerHTML = `
        <div class="modal-content">
            <h3>🔍 Detailed Prediction Analysis</h3>
            <div class="prediction-overview">
                <h4>Word: "${prediction.word}"</h4>
                <div class="overview-stats">
                    <div class="stat-item">
                        <span class="stat-label">Rank:</span>
                        <span class="stat-value">#${prediction.rank} of ${allPredictions.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Probability:</span>
                        <span class="stat-value">${(prediction.probability * 100).toFixed(3)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Percentile:</span>
                        <span class="stat-value">Top ${percentile}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Category:</span>
                        <span class="stat-value">${categorizePrediction(prediction.word)}</span>
                    </div>
                </div>
            </div>
            
            <div class="context-analysis">
                <h4>Context Analysis</h4>
                <p><strong>Original Text:</strong> "${originalText}"</p>
                <p><strong>Predicted Continuation:</strong> "${originalText} ${prediction.word}"</p>
                <p><strong>Linguistic Pattern:</strong> ${analyzeLinguisticPattern(originalText, prediction.word)}</p>
            </div>
            
            <div class="probability-breakdown">
                <h4>Probability Breakdown</h4>
                <div class="breakdown-details">
                    <p><strong>Raw Score:</strong> ${prediction.probability.toFixed(6)}</p>
                    <p><strong>Log Probability:</strong> ${Math.log(prediction.probability).toFixed(3)}</p>
                    <p><strong>Odds:</strong> 1 in ${Math.round(1 / prediction.probability)}</p>
                    <p><strong>Relative to Top:</strong> ${(prediction.probability / allPredictions[0].probability * 100).toFixed(1)}% as likely</p>
                </div>
            </div>
            
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">Close Analysis</button>
        </div>
    `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

function analyzeLinguisticPattern(originalText, predictedWord) {
        const lastWord = originalText.trim().split(' ').pop();

        // Simple pattern analysis
        if (predictedWord.match(/^[.!?]$/)) {
            return "Sentence completion pattern - the model learned this is a natural ending point.";
        } else if (lastWord.match(/^(the|a|an)$/i)) {
            return "Article-noun pattern - determiners typically precede nouns in English.";
        } else if (lastWord.match(/^(very|quite|really)$/i)) {
            return "Intensifier-adjective pattern - adverbs of degree often precede adjectives.";
        } else if (predictedWord.match(/^(and|or|but)$/i)) {
            return "Coordination pattern - conjunctions often link similar grammatical structures.";
        } else {
            return "Sequential dependency pattern - this word commonly follows in similar contexts from training data.";
        }
    }

function updatePredictionsWithTemperature(predictions, temperature) {
        // Recalculate probabilities with temperature scaling
        const scaledLogits = predictions.map(p => p.logit / temperature);
        const scaledProbs = softmax(scaledLogits);

        const rankingList = document.querySelector('.predictions-list');
        if (!rankingList) return;

        // Update display with new probabilities
        scaledProbs.forEach((prob, idx) => {
            if (idx < rankingList.children.length) {
                const predItem = rankingList.children[idx];
                const probElement = predItem.querySelector('.prediction-prob');
                const fillElement = predItem.querySelector('.prediction-fill');

                const probability = (prob * 100).toFixed(2);
                const barWidth = (prob / scaledProbs[0]) * 100;

                probElement.textContent = `${probability}%`;
                fillElement.style.width = `${barWidth}%`;
            }
        });
    }

function selectPrediction(word) {
        alert(`Selected word: "${word}"\n\nThis word would be added to the sequence and the process would continue with the new context.`);
    }

function continueGeneration(sequence) {
        // This would typically restart the entire pipeline with the new sequence
        alert(`Continuing generation with: "${sequence}"\n\nIn a real LLM, this would:\n1. Tokenize the new sequence\n2. Process through all layers again\n3. Generate the next prediction\n4. Repeat until desired length`);
    }

// Setup interactive controls for the LLM demo
function setupInteractiveControls() {
    // This function sets up event listeners for interactive elements
    // Most of the setup is already done in the individual display functions

    // Add any global controls here
    console.log('🚀 LLM Interactive Demo Ready!');
    console.log('💡 Users can now explore each step of the prediction process');
}