# LLM Educational Project with PyTorch

An interactive educational project demonstrating the complete pipeline of Large Language Models (LLMs) using PyTorch. This project breaks down each step of LLM processing into separate modules for better understanding.

## Features

- **Modular Architecture**: Each LLM component in separate files
- **Interactive Streamlit Interface**: Web-based demonstrations
- **Real PyTorch Implementation**: Actual transformer components
- **Educational Explanations**: Step-by-step process breakdown
- **Visualizations**: Interactive plots and attention maps

## Project Structure

```
├── src/
│   ├── tokenization.py     # BPE tokenization implementation
│   ├── embeddings.py       # Token and positional embeddings
│   ├── attention.py        # Multi-head self-attention
│   ├── feedforward.py      # Feed-forward network
│   ├── transformer.py      # Complete transformer block
│   ├── model.py           # Full LLM model
│   └── utils.py           # Helper functions
├── app.py                 # Streamlit web interface
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Streamlit app:
```bash
streamlit run app.py
```

## Usage

The application provides an interactive interface where you can:

1. **Input text** and see how it's processed
2. **Step through each stage** of the LLM pipeline
3. **Visualize attention patterns** and embeddings
4. **Experiment with different parameters**
5. **Learn about transformer architecture**

## Educational Components

### 1. Tokenization
- BPE (Byte Pair Encoding) implementation
- Vocabulary building and token mapping
- Subword tokenization demonstration

### 2. Embeddings
- Token embedding lookup
- Positional encoding (sinusoidal)
- Combined representation visualization

### 3. Multi-Head Attention
- Query, Key, Value projections
- Attention weight computation
- Multiple attention heads
- Attention pattern visualization

### 4. Feed-Forward Network
- Linear transformations
- GELU activation function
- Residual connections
- Layer normalization

### 5. Transformer Blocks
- Complete transformer layer
- Layer stacking
- Information flow through layers

### 6. Language Model Head
- Final projection to vocabulary
- Softmax normalization
- Next token prediction

## Learning Objectives

After using this project, you will understand:

- How text is converted to tokens
- How tokens become vector representations
- How attention mechanisms work
- How transformers process sequences
- How LLMs generate text

## Contributing

This is an educational project. Feel free to:
- Add more visualizations
- Implement different tokenization methods
- Add more detailed explanations
- Create additional examples

## License

MIT License - Feel free to use for educational purposes.
