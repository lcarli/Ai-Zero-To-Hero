"""
Attention module for educational LLM project.

This module implements multi-head self-attention, the core mechanism
that allows transformers to relate different positions in a sequence.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Tuple, Optional, Dict, List
import numpy as np


class MultiHeadAttention(nn.Module):
    """
    Multi-head self-attention mechanism.
    
    This is the core component that allows the model to attend to
    different parts of the input sequence simultaneously.
    """
    
    def __init__(self, d_model: int, num_heads: int, dropout: float = 0.1):
        """
        Initialize multi-head attention.
        
        Args:
            d_model: Dimension of the model
            num_heads: Number of attention heads
            dropout: Dropout rate
        """
        super().__init__()
        
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads  # Dimension per head
        
        # Linear projections for Q, K, V
        self.w_q = nn.Linear(d_model, d_model)
        self.w_k = nn.Linear(d_model, d_model)
        self.w_v = nn.Linear(d_model, d_model)
        
        # Output projection
        self.w_o = nn.Linear(d_model, d_model)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights with Xavier uniform initialization."""
        for module in [self.w_q, self.w_k, self.w_v, self.w_o]:
            nn.init.xavier_uniform_(module.weight)
    
    def forward(self, 
                query: torch.Tensor, 
                key: torch.Tensor, 
                value: torch.Tensor,
                mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Apply multi-head attention.
        
        Args:
            query: Query tensor of shape (batch_size, seq_len, d_model)
            key: Key tensor of shape (batch_size, seq_len, d_model)
            value: Value tensor of shape (batch_size, seq_len, d_model)
            mask: Optional attention mask
            
        Returns:
            Tuple of (attention_output, attention_weights)
        """
        batch_size = query.size(0)
        seq_len = query.size(1)
        
        # Step 1: Linear projections
        Q = self.w_q(query)  # (batch_size, seq_len, d_model)
        K = self.w_k(key)    # (batch_size, seq_len, d_model)
        V = self.w_v(value)  # (batch_size, seq_len, d_model)
        
        # Step 2: Reshape for multi-head attention
        Q = Q.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        # Shape: (batch_size, num_heads, seq_len, d_k)
        
        # Step 3: Apply scaled dot-product attention
        attention_output, attention_weights = self.scaled_dot_product_attention(
            Q, K, V, mask
        )
        
        # Step 4: Concatenate heads
        attention_output = attention_output.transpose(1, 2).contiguous().view(
            batch_size, seq_len, self.d_model
        )
        
        # Step 5: Final linear projection
        output = self.w_o(attention_output)
        
        return output, attention_weights
    
    def scaled_dot_product_attention(self, 
                                   Q: torch.Tensor, 
                                   K: torch.Tensor, 
                                   V: torch.Tensor,
                                   mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Compute scaled dot-product attention.
        
        Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
        
        Args:
            Q: Query tensor (batch_size, num_heads, seq_len, d_k)
            K: Key tensor (batch_size, num_heads, seq_len, d_k)
            V: Value tensor (batch_size, num_heads, seq_len, d_k)
            mask: Optional attention mask
            
        Returns:
            Tuple of (attention_output, attention_weights)
        """
        # Step 1: Compute attention scores
        # QK^T / sqrt(d_k)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        # Step 2: Apply mask if provided
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # Step 3: Apply softmax
        attention_weights = F.softmax(scores, dim=-1)
        
        # Step 4: Apply dropout
        attention_weights = self.dropout(attention_weights)
        
        # Step 5: Apply attention to values
        attention_output = torch.matmul(attention_weights, V)
        
        return attention_output, attention_weights
    
    def visualize_attention(self, 
                          query: torch.Tensor, 
                          key: torch.Tensor, 
                          value: torch.Tensor,
                          token_texts: List[str]) -> Dict:
        """
        Visualize attention patterns for educational purposes.
        
        Args:
            query: Query tensor
            key: Key tensor
            value: Value tensor
            token_texts: List of token texts
            
        Returns:
            Dictionary with visualization data
        """
        with torch.no_grad():
            # Get attention weights
            _, attention_weights = self.forward(query, key, value)
            
            # Convert to numpy for visualization
            attention_weights = attention_weights[0].cpu().numpy()  # First batch item
            
            # Create visualization data for each head
            head_data = []
            for head in range(self.num_heads):
                head_weights = attention_weights[head]
                
                # Find most attended tokens for each position
                max_attention_indices = np.argmax(head_weights, axis=1)
                
                head_info = {
                    'head_id': head,
                    'attention_matrix': head_weights,
                    'max_attention_indices': max_attention_indices,
                    'description': self._get_head_description(head, head_weights, token_texts)
                }
                head_data.append(head_info)
            
            return {
                'tokens': token_texts,
                'num_heads': self.num_heads,
                'head_data': head_data,
                'attention_shape': attention_weights.shape
            }
    
    def _get_head_description(self, head_id: int, attention_matrix: np.ndarray, tokens: List[str]) -> str:
        """
        Generate a description of what an attention head focuses on.
        
        Args:
            head_id: ID of the attention head
            attention_matrix: Attention weights matrix
            tokens: List of token texts
            
        Returns:
            Description string
        """
        # Analyze attention patterns
        avg_attention = np.mean(attention_matrix, axis=0)
        max_avg_idx = np.argmax(avg_attention)
        
        # Simple pattern analysis
        if np.mean(np.diag(attention_matrix)) > 0.3:
            pattern = "Self-attention (focuses on same position)"
        elif np.mean(attention_matrix[:, 0]) > 0.3:
            pattern = "Beginning attention (focuses on start tokens)"
        elif np.mean(attention_matrix[:, -1]) > 0.3:
            pattern = "End attention (focuses on end tokens)"
        else:
            pattern = f"Distributed attention (focuses on '{tokens[max_avg_idx] if max_avg_idx < len(tokens) else 'unknown'}')"
        
        return pattern


class AttentionVisualizer:
    """
    Helper class for visualizing attention patterns.
    """
    
    @staticmethod
    def create_attention_heatmap_data(attention_weights: np.ndarray, 
                                    tokens: List[str], 
                                    head_id: int) -> Dict:
        """
        Create data for attention heatmap visualization.
        
        Args:
            attention_weights: Attention weights matrix
            tokens: List of token texts
            head_id: ID of the attention head
            
        Returns:
            Dictionary with heatmap data
        """
        return {
            'attention_matrix': attention_weights.tolist(),
            'tokens': tokens,
            'head_id': head_id,
            'max_attention': float(np.max(attention_weights)),
            'min_attention': float(np.min(attention_weights)),
            'shape': attention_weights.shape
        }
    
    @staticmethod
    def analyze_attention_patterns(attention_weights: np.ndarray, 
                                 tokens: List[str]) -> Dict:
        """
        Analyze attention patterns to understand what the model focuses on.
        
        Args:
            attention_weights: Attention weights matrix
            tokens: List of token texts
            
        Returns:
            Analysis results
        """
        seq_len = len(tokens)
        
        # Calculate statistics
        self_attention = np.mean(np.diag(attention_weights))
        forward_attention = np.mean(np.triu(attention_weights, k=1))
        backward_attention = np.mean(np.tril(attention_weights, k=-1))
        
        # Find most attended positions
        avg_attention = np.mean(attention_weights, axis=0)
        most_attended_idx = np.argmax(avg_attention)
        
        # Find tokens that attend most to others
        outgoing_attention = np.mean(attention_weights, axis=1)
        most_attending_idx = np.argmax(outgoing_attention)
        
        return {
            'self_attention_rate': float(self_attention),
            'forward_attention_rate': float(forward_attention),
            'backward_attention_rate': float(backward_attention),
            'most_attended_token': tokens[most_attended_idx] if most_attended_idx < len(tokens) else 'unknown',
            'most_attending_token': tokens[most_attending_idx] if most_attending_idx < len(tokens) else 'unknown',
            'attention_distribution': 'uniform' if np.std(avg_attention) < 0.1 else 'focused'
        }


def create_sample_attention_layer(d_model: int = 512, num_heads: int = 8) -> MultiHeadAttention:
    """
    Create a sample attention layer for demonstration.
    
    Args:
        d_model: Model dimension
        num_heads: Number of attention heads
        
    Returns:
        Initialized attention layer
    """
    return MultiHeadAttention(d_model, num_heads)


def demonstrate_attention_mechanism():
    """
    Demonstrate how the attention mechanism works.
    """
    print("👁️ Demonstrating Multi-Head Attention")
    print("=" * 50)
    
    # Create sample attention layer
    attention = create_sample_attention_layer(d_model=64, num_heads=8)
    
    # Sample input
    batch_size, seq_len, d_model = 1, 6, 64
    sample_input = torch.randn(batch_size, seq_len, d_model)
    token_texts = ["I", "love", "programming", "because", "it's", "creative"]
    
    print(f"📊 Attention layer info:")
    print(f"  Model dimension: {attention.d_model}")
    print(f"  Number of heads: {attention.num_heads}")
    print(f"  Dimension per head: {attention.d_k}")
    print(f"  Input shape: {sample_input.shape}")
    
    # Apply attention
    output, attention_weights = attention(sample_input, sample_input, sample_input)
    
    print(f"\n📈 Output info:")
    print(f"  Output shape: {output.shape}")
    print(f"  Attention weights shape: {attention_weights.shape}")
    
    # Visualize attention
    viz_data = attention.visualize_attention(sample_input, sample_input, sample_input, token_texts)
    
    print(f"\n🎯 Attention patterns:")
    for head_info in viz_data['head_data'][:3]:  # Show first 3 heads
        print(f"  Head {head_info['head_id']}: {head_info['description']}")
    
    # Analyze patterns
    sample_head_weights = viz_data['head_data'][0]['attention_matrix']
    patterns = AttentionVisualizer.analyze_attention_patterns(sample_head_weights, token_texts)
    
    print(f"\n🔍 Pattern analysis (Head 0):")
    print(f"  Self-attention rate: {patterns['self_attention_rate']:.3f}")
    print(f"  Forward attention rate: {patterns['forward_attention_rate']:.3f}")
    print(f"  Backward attention rate: {patterns['backward_attention_rate']:.3f}")
    print(f"  Most attended token: {patterns['most_attended_token']}")
    print(f"  Attention distribution: {patterns['attention_distribution']}")


if __name__ == "__main__":
    demonstrate_attention_mechanism()
