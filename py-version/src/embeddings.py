"""
Embeddings module for educational LLM project.

This module implements token embeddings and positional encoding,
showing how tokens are converted to dense vector representations.
"""

import torch
import torch.nn as nn
import numpy as np
import math
from typing import Tuple, Dict, List


class TokenEmbedding(nn.Module):
    """
    Token embedding layer that converts token IDs to dense vectors.
    
    This is a lookup table where each token ID maps to a learnable vector.
    """
    
    def __init__(self, vocab_size: int, d_model: int):
        """
        Initialize token embedding layer.
        
        Args:
            vocab_size: Size of the vocabulary
            d_model: Dimension of the embedding vectors
        """
        super().__init__()
        self.d_model = d_model
        self.vocab_size = vocab_size
        
        # The embedding lookup table
        # Each row represents the embedding for a token
        self.embedding = nn.Embedding(vocab_size, d_model)
        
        # Initialize embeddings with small random values
        self._init_embeddings()
    
    def _init_embeddings(self):
        """Initialize embeddings with Xavier uniform initialization."""
        nn.init.xavier_uniform_(self.embedding.weight)
    
    def forward(self, token_ids: torch.Tensor) -> torch.Tensor:
        """
        Convert token IDs to embedding vectors.
        
        Args:
            token_ids: Token IDs tensor of shape (batch_size, seq_len)
            
        Returns:
            Embedding vectors of shape (batch_size, seq_len, d_model)
        """
        # Look up embeddings and scale by sqrt(d_model)
        # Scaling helps with training stability
        embeddings = self.embedding(token_ids) * math.sqrt(self.d_model)
        
        return embeddings
    
    def get_embedding_info(self) -> Dict:
        """
        Get information about the embedding layer.
        
        Returns:
            Dictionary with embedding statistics
        """
        return {
            'vocab_size': self.vocab_size,
            'embedding_dim': self.d_model,
            'total_parameters': self.vocab_size * self.d_model,
            'weight_shape': tuple(self.embedding.weight.shape)
        }


class PositionalEncoding(nn.Module):
    """
    Positional encoding using sinusoidal functions.
    
    Since transformers don't have inherent position awareness,
    we add positional information to the embeddings.
    """
    
    def __init__(self, d_model: int, max_seq_len: int = 512):
        """
        Initialize positional encoding.
        
        Args:
            d_model: Dimension of the embeddings
            max_seq_len: Maximum sequence length to support
        """
        super().__init__()
        self.d_model = d_model
        self.max_seq_len = max_seq_len
        
        # Create positional encoding matrix
        pe = torch.zeros(max_seq_len, d_model)
        position = torch.arange(0, max_seq_len, dtype=torch.float).unsqueeze(1)
        
        # Create the sinusoidal patterns
        # Even dimensions use sin, odd dimensions use cos
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                           (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        # Register as buffer (not a parameter, but part of the module)
        self.register_buffer('pe', pe.unsqueeze(0))
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Add positional encoding to input embeddings.
        
        Args:
            x: Input embeddings of shape (batch_size, seq_len, d_model)
            
        Returns:
            Embeddings with positional encoding added
        """
        seq_len = x.size(1)
        
        # Add positional encoding (up to the sequence length)
        x = x + self.pe[:, :seq_len, :]
        
        return x
    
    def get_positional_patterns(self, seq_len: int) -> torch.Tensor:
        """
        Get the positional encoding patterns for visualization.
        
        Args:
            seq_len: Sequence length to visualize
            
        Returns:
            Positional encoding matrix of shape (seq_len, d_model)
        """
        return self.pe[0, :seq_len, :].clone()


class CombinedEmbedding(nn.Module):
    """
    Combined token and positional embedding layer.
    
    This class combines token embeddings with positional encoding
    to create the final input representations for the transformer.
    """
    
    def __init__(self, vocab_size: int, d_model: int, max_seq_len: int = 512, dropout: float = 0.1):
        """
        Initialize combined embedding layer.
        
        Args:
            vocab_size: Size of the vocabulary
            d_model: Dimension of the embedding vectors
            max_seq_len: Maximum sequence length
            dropout: Dropout rate for regularization
        """
        super().__init__()
        
        self.token_embedding = TokenEmbedding(vocab_size, d_model)
        self.positional_encoding = PositionalEncoding(d_model, max_seq_len)
        self.dropout = nn.Dropout(dropout)
        
        self.d_model = d_model
        self.vocab_size = vocab_size
    
    def forward(self, token_ids: torch.Tensor) -> torch.Tensor:
        """
        Convert token IDs to final input embeddings.
        
        Args:
            token_ids: Token IDs tensor of shape (batch_size, seq_len)
            
        Returns:
            Final embeddings of shape (batch_size, seq_len, d_model)
        """
        # Step 1: Get token embeddings
        token_embeds = self.token_embedding(token_ids)
        
        # Step 2: Add positional encoding
        embeddings = self.positional_encoding(token_embeds)
        
        # Step 3: Apply dropout for regularization
        embeddings = self.dropout(embeddings)
        
        return embeddings
    
    def visualize_embeddings(self, token_ids: torch.Tensor, token_texts: List[str]) -> Dict:
        """
        Visualize the embedding process step by step.
        
        Args:
            token_ids: Token IDs tensor
            token_texts: List of token texts for visualization
            
        Returns:
            Dictionary with visualization data
        """
        with torch.no_grad():
            # Get token embeddings (before positional encoding)
            token_embeds = self.token_embedding(token_ids)
            
            # Get positional encodings
            pos_encodings = self.positional_encoding.get_positional_patterns(token_ids.size(1))
            
            # Get final embeddings
            final_embeds = self.forward(token_ids)
            
            # Prepare visualization data
            viz_data = {
                'tokens': token_texts,
                'token_embeddings': token_embeds[0].cpu().numpy(),  # First batch item
                'positional_encodings': pos_encodings.cpu().numpy(),
                'final_embeddings': final_embeds[0].cpu().numpy(),
                'embedding_dim': self.d_model,
                'sequence_length': len(token_texts)
            }
            
            return viz_data
    
    def get_embedding_similarities(self, token_ids: torch.Tensor) -> torch.Tensor:
        """
        Compute cosine similarities between token embeddings.
        
        Args:
            token_ids: Token IDs tensor
            
        Returns:
            Similarity matrix of shape (seq_len, seq_len)
        """
        with torch.no_grad():
            # Get token embeddings
            embeddings = self.token_embedding(token_ids)
            
            # Compute cosine similarities
            embeddings = embeddings[0]  # First batch item
            similarities = torch.nn.functional.cosine_similarity(
                embeddings.unsqueeze(1), embeddings.unsqueeze(0), dim=2
            )
            
            return similarities


def create_sample_embedding_layer(vocab_size: int = 1000, d_model: int = 512) -> CombinedEmbedding:
    """
    Create a sample embedding layer for demonstration.
    
    Args:
        vocab_size: Vocabulary size
        d_model: Embedding dimension
        
    Returns:
        Initialized embedding layer
    """
    return CombinedEmbedding(vocab_size, d_model)


def demonstrate_positional_encoding(d_model: int = 64, max_len: int = 50):
    """
    Demonstrate how positional encoding works.
    
    Args:
        d_model: Embedding dimension
        max_len: Maximum sequence length to show
    """
    print("🔢 Demonstrating Positional Encoding")
    print("=" * 50)
    
    # Create positional encoding
    pe = PositionalEncoding(d_model, max_len)
    
    # Get positional patterns
    patterns = pe.get_positional_patterns(max_len)
    
    print(f"📏 Positional encoding shape: {patterns.shape}")
    print(f"📊 First few positions and dimensions:")
    
    # Show first few positions and dimensions
    for pos in range(min(5, max_len)):
        values = patterns[pos, :8].numpy()  # First 8 dimensions
        print(f"  Position {pos}: [{', '.join(f'{v:.3f}' for v in values)}...]")


if __name__ == "__main__":
    # Demonstrate positional encoding
    demonstrate_positional_encoding()
    
    # Create sample embedding layer
    embedding_layer = create_sample_embedding_layer()
    
    # Sample token IDs
    token_ids = torch.tensor([[1, 15, 23, 8, 45, 2]])  # Batch of 1, seq_len of 6
    token_texts = ["I", "love", "programming", "because", "it's", "creative"]
    
    print(f"\n🔤 Demonstrating Token Embeddings")
    print("=" * 50)
    
    # Get visualization data
    viz_data = embedding_layer.visualize_embeddings(token_ids, token_texts)
    
    print(f"📊 Embedding information:")
    print(f"  Sequence length: {viz_data['sequence_length']}")
    print(f"  Embedding dimension: {viz_data['embedding_dim']}")
    print(f"  Token embeddings shape: {viz_data['token_embeddings'].shape}")
    print(f"  Positional encodings shape: {viz_data['positional_encodings'].shape}")
    print(f"  Final embeddings shape: {viz_data['final_embeddings'].shape}")
    
    # Show embedding magnitudes
    print(f"\n📏 Embedding magnitudes:")
    for i, token in enumerate(viz_data['tokens']):
        magnitude = np.linalg.norm(viz_data['final_embeddings'][i])
        print(f"  {token:12} -> {magnitude:.3f}")
    
    # Show similarities
    similarities = embedding_layer.get_embedding_similarities(token_ids)
    print(f"\n🔗 Token embedding similarities:")
    print(f"  Similarity matrix shape: {similarities.shape}")
    
    # Show most similar pairs
    for i in range(len(token_texts)):
        for j in range(i + 1, len(token_texts)):
            sim = similarities[i, j].item()
            print(f"  {token_texts[i]} <-> {token_texts[j]}: {sim:.3f}")
