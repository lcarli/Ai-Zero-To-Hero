# AI Zero to Hero — AIFORALL

> A comprehensive educational platform that makes Artificial Intelligence accessible to everyone — from complete beginners to those looking to deepen their understanding.

---

## Overview

**AIFORALL** is an open-source learning platform covering the key concepts and technologies behind modern AI. It provides clear explanations, interactive demos, and hands-on examples across multiple AI topics.

The project is organized into three versions:

| Version | Description |
|---------|-------------|
| **V1** (root) | Static educational website with topic pages (Machine Learning, Computer Vision, TTS-STT, LLM, Compare Agents) |
| **[V2](./V2/)** | Interactive, gamified single-page application with live demos and visualizations |
| **[py-version](./py-version/)** | Python/PyTorch backend with a Streamlit interface for hands-on LLM pipeline exploration |

---

## Topics Covered

- **Machine Learning** — Supervised, unsupervised, and reinforcement learning; popular algorithms and real-world applications
- **Computer Vision** — How computers interpret visual data; convolutional networks and feature maps
- **TTS / STT** — Text-to-Speech and Speech-to-Text technologies
- **Large Language Models (LLMs)** — Transformers, tokenization, embeddings, attention, and text generation
- **Compare AI Agents** — Side-by-side comparison of different AI agents and their capabilities
- **Prompt Engineering** — Techniques for writing effective prompts (Zero-shot, Few-shot, Chain-of-Thought, ReAct)
- **RAG** — Retrieval-Augmented Generation pipeline
- **AI Agents** — Reactive, goal-based, and learning agents

---

## Project Structure

```
Ai-Zero-To-Hero/
├── index.html              # V1 landing page
├── pages/                  # V1 topic pages
│   ├── compare-agents.html
│   ├── computer-vision.html
│   ├── llm.html
│   ├── machine-learning.html
│   └── tts-stt.html
├── styles.css              # V1 styles
├── script.js               # V1 scripts
├── config.json             # Language detection API config
├── V2/                     # Interactive V2 (gamified SPA)
│   ├── index.html
│   ├── css/
│   └── js/
└── py-version/             # Python/PyTorch educational project
    ├── app.py
    ├── src/
    └── requirements.txt
```

---

## Getting Started

### V1 — Static Website

Simply open `index.html` in your browser, or serve it locally:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000`.

### V2 — Interactive Edition

```bash
cd V2
npx serve .
# or
python3 -m http.server 8000
```

No build step, no dependencies, no `node_modules` — everything runs in the browser.

### Python Version

```bash
cd py-version
pip install -r requirements.txt
streamlit run app.py
```

---

## Contributing

Contributions are welcome! Feel free to:
- Add more visualizations or interactive demos
- Improve existing explanations
- Fix bugs or typos
- Translate content

---

## License

MIT License — Free to use for educational purposes.

---

*"The best way to learn AI is to see it working from the inside."*