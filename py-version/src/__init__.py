"""
Educational LLM project with PyTorch.

This package contains modular implementations of transformer components
for educational purposes.
"""

__version__ = "1.0.0"
__author__ = "AI Zero To Hero"
__description__ = "Educational Large Language Model implementation with PyTorch"

# Import main components for easy access
from .tokenization import BPETokenizer, create_sample_tokenizer
from .embeddings import TokenEmbedding, PositionalEncoding, CombinedEmbedding
from .attention import MultiHeadAttention, AttentionVisualizer
from .feedforward import FeedForwardNetwork, GELUActivation
from .transformer import TransformerBlock, GPTTransformer
from .utils import (
    create_attention_heatmap,
    plot_embedding_similarities,
    visualize_positional_encoding,
    calculate_representation_statistics,
    create_model_architecture_diagram
)

__all__ = [
    # Tokenization
    'BPETokenizer',
    'create_sample_tokenizer',
    
    # Embeddings
    'TokenEmbedding',
    'PositionalEncoding', 
    'CombinedEmbedding',
    
    # Attention
    'MultiHeadAttention',
    'AttentionVisualizer',
    
    # Feed-forward
    'FeedForwardNetwork',
    'GELUActivation',
    
    # Transformer
    'TransformerBlock',
    'GPTTransformer',
    
    # Utilities
    'create_attention_heatmap',
    'plot_embedding_similarities',
    'visualize_positional_encoding',
    'calculate_representation_statistics',
    'create_model_architecture_diagram'
]
