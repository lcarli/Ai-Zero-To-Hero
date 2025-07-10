// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
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
        link.addEventListener('click', function() {
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
    window.addEventListener('scroll', function() {
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
document.addEventListener('DOMContentLoaded', function() {
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
        processBtn.addEventListener('click', function() {
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
        userInput.addEventListener('keypress', function(e) {
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

// Process text and show results
async function processText(text) {
    // Language detection with API and fallback
    const detectedLanguage = await detectLanguageWithAPI(text);
    displayLanguageResult(detectedLanguage, text);
    
    // Tokenization
    const tokens = tokenizeText(text);
    displayTokens(tokens);
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

// Simple language detection based on character patterns and common words
function detectLanguage(text) {
    const languages = {
        'en': {
            name: 'English',
            flag: '🇺🇸',
            patterns: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are'],
            chars: /[a-zA-Z]/
        },
        'es': {
            name: 'Spanish',
            flag: '🇪🇸',
            patterns: ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no', 'te', 'lo', 'le', 'da', 'su'],
            chars: /[a-zA-ZñáéíóúüÑÁÉÍÓÚÜ]/
        },
        'fr': {
            name: 'French',
            flag: '🇫🇷',
            patterns: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'bonjour', 'monde', 'comment', 'vous', 'aujourd'],
            chars: /[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/
        },
        'de': {
            name: 'German',
            flag: '🇩🇪',
            patterns: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im'],
            chars: /[a-zA-ZäöüßÄÖÜ]/
        },
        'it': {
            name: 'Italian',
            flag: '🇮🇹',
            patterns: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'è', 'del', 'con', 'da', 'su', 'una', 'le'],
            chars: /[a-zA-ZàéèìíîòóùúÀÉÈÌÍÎÒÓÙÚ]/
        },
        'pt': {
            name: 'Portuguese',
            flag: '🇵🇹',
            patterns: ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no'],
            chars: /[a-zA-ZáàâãçéêíóôõúüÁÀÂÃÇÉÊÍÓÔÕÚÜ]/
        }
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {};
    
    // Initialize scores
    for (const lang in languages) {
        scores[lang] = 0;
    }
    
    // Score based on common words
    words.forEach(word => {
        for (const lang in languages) {
            if (languages[lang].patterns.includes(word)) {
                scores[lang] += 3;
            }
        }
    });
    
    // Score based on character patterns
    for (const lang in languages) {
        const charMatches = text.match(languages[lang].chars);
        if (charMatches) {
            scores[lang] += charMatches.length * 0.1;
        }
    }
    
    // Find the highest scoring language
    let detectedLang = 'en';
    let maxScore = scores['en'];
    
    for (const lang in scores) {
        if (scores[lang] > maxScore) {
            maxScore = scores[lang];
            detectedLang = lang;
        }
    }
    
    const confidence = Math.min(95, Math.max(15, (maxScore / words.length) * 20));
    
    return {
        code: detectedLang,
        name: languages[detectedLang].name,
        flag: languages[detectedLang].flag,
        confidence: Math.round(confidence)
    };
}

// Display language detection result with detailed examples
function displayLanguageResult(result, inputText) {
    const resultContainer = document.getElementById('language-result');
    const algorithmContainer = document.querySelector('#language-detection .algorithm-explanation');
    
    // Update the algorithm explanation with user input examples
    algorithmContainer.innerHTML = `
        <h4>Algorithm Used:</h4>
        <p>Character frequency analysis combined with common word patterns:</p>
        <ul>
            <li><strong>Analyze character frequency patterns</strong>
                <div class="example-box">
                    <strong>Example with your text:</strong> "${inputText}"<br>
                    <em>Character analysis:</em> ${analyzeCharacterFrequency(inputText)}
                </div>
            </li>
            <li><strong>Check for language-specific characters (é, ñ, ü, etc.)</strong>
                <div class="example-box">
                    <strong>Special characters found:</strong> ${findSpecialCharacters(inputText)}
                </div>
            </li>
            <li><strong>Match against common words in different languages</strong>
                <div class="example-box">
                    <strong>Common words detected:</strong> ${findCommonWords(inputText)}
                </div>
            </li>
            <li><strong>Calculate probability scores for each language</strong>
                <div class="example-box">
                    <strong>Language scores:</strong> ${calculateLanguageScores(inputText)}
                </div>
            </li>
        </ul>
    `;
    
    // Display the detection result
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
                    <small>Source: ${result.source === 'api' ? `${result.apiName} API` : 'Local Algorithm'}</small>
                </div>
            </div>
        </div>
    `;
}

// Helper functions for detailed analysis
function analyzeCharacterFrequency(text) {
    const freq = {};
    const cleaned = text.toLowerCase().replace(/[^a-zA-ZàâäéèêëïîôöùûüÿçñáéíóúüÑÁÉÍÓÚÜ]/g, '');
    
    for (const char of cleaned) {
        freq[char] = (freq[char] || 0) + 1;
    }
    
    const sortedChars = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return sortedChars.map(([char, count]) => `'${char}' (${count})`).join(', ');
}

function findSpecialCharacters(text) {
    const specialChars = text.match(/[àâäéèêëïîôöùûüÿçñáéíóúüÑÁÉÍÓÚÜ]/g);
    if (!specialChars || specialChars.length === 0) {
        return 'None detected';
    }
    
    const uniqueChars = [...new Set(specialChars)];
    return uniqueChars.join(', ');
}

function findCommonWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = {
        'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are'],
        'es': ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no', 'te', 'lo', 'le', 'da', 'su'],
        'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'bonjour', 'monde', 'comment', 'vous', 'allez'],
        'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im'],
        'it': ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'è', 'del', 'con', 'da', 'su', 'una', 'le'],
        'pt': ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no']
    };
    
    const matches = {};
    for (const [lang, langWords] of Object.entries(commonWords)) {
        const found = words.filter(word => langWords.includes(word));
        if (found.length > 0) {
            matches[lang] = found;
        }
    }
    
    if (Object.keys(matches).length === 0) {
        return 'No common words detected';
    }
    
    return Object.entries(matches)
        .map(([lang, words]) => `${lang.toUpperCase()}: ${words.join(', ')}`)
        .join(' | ');
}

function calculateLanguageScores(text) {
    const words = text.toLowerCase().split(/\s+/);
    const scores = {};
    
    const languages = {
        'en': { patterns: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'], chars: /[a-zA-Z]/ },
        'es': { patterns: ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no'], chars: /[a-zA-ZñáéíóúüÑÁÉÍÓÚÜ]/ },
        'fr': { patterns: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que', 'comment', 'allez', 'vous'], chars: /[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/ },
        'de': { patterns: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'], chars: /[a-zA-ZäöüßÄÖÜ]/ },
        'it': { patterns: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'è', 'del'], chars: /[a-zA-ZàéèìíîòóùúÀÉÈÌÍÎÒÓÙÚ]/ },
        'pt': { patterns: ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é'], chars: /[a-zA-ZáàâãçéêíóôõúüÁÀÂÃÇÉÊÍÓÔÕÚÜ]/ }
    };
    
    for (const [lang, data] of Object.entries(languages)) {
        let score = 0;
        
        // Score based on common words
        words.forEach(word => {
            if (data.patterns.includes(word)) {
                score += 3;
            }
        });
        
        // Score based on character patterns
        const charMatches = text.match(data.chars);
        if (charMatches) {
            score += charMatches.length * 0.1;
        }
        
        scores[lang] = Math.round(score);
    }
    
    return Object.entries(scores)
        .filter(([lang, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, score]) => `${lang.toUpperCase()}: ${score}`)
        .join(', ');
}

// Tokenize text into words and punctuation
function tokenizeText(text) {
    // Split by whitespace and punctuation, but keep punctuation
    const tokens = text.match(/\w+|[^\w\s]/g) || [];
    return tokens.filter(token => token.trim().length > 0);
}

// Display tokens with colors
function displayTokens(tokens) {
    const tokensContainer = document.getElementById('tokens-container');
    const tokenCount = document.getElementById('token-count');
    
    // Color palette for tokens
    const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#16a085', '#27ae60',
        '#2980b9', '#8e44ad', '#f1c40f', '#e84393', '#a0522d'
    ];
    
    tokensContainer.innerHTML = '';
    
    tokens.forEach((token, index) => {
        const tokenElement = document.createElement('span');
        tokenElement.className = 'token';
        tokenElement.textContent = token;
        tokenElement.style.backgroundColor = colors[index % colors.length];
        tokenElement.style.color = 'white';
        tokenElement.title = `Token ${index + 1}: "${token}"`;
        
        tokensContainer.appendChild(tokenElement);
    });
    
    tokenCount.textContent = `Total tokens generated: ${tokens.length}`;
}