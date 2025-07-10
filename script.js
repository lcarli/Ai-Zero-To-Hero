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
function processText(text) {
    // Language detection
    const detectedLanguage = detectLanguage(text);
    displayLanguageResult(detectedLanguage);
    
    // Tokenization
    const tokens = tokenizeText(text);
    displayTokens(tokens);
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

// Display language detection result
function displayLanguageResult(result) {
    const resultContainer = document.getElementById('language-result');
    
    resultContainer.innerHTML = `
        <div class="language-info">
            <div class="language-flag">${result.flag}</div>
            <div class="language-details">
                <div class="language-name">${result.name}</div>
                <div class="confidence-score">Confidence: ${result.confidence}%</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                </div>
            </div>
        </div>
    `;
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