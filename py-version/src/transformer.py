"""
Transformer module for educational LLM project.

This module combines attention, feed-forward, and normalization layers
to create complete transformer blocks and the full transformer model.
"""

import torch
import torch.nn as nn
from typing import Dict, List, Optional, Tuple
import numpy as np

from .attention import MultiHeadAttention
from .feedforward import FeedForwardNetwork
from .embeddings import CombinedEmbedding


class TransformerBlock(nn.Module):
    """
    A complete transformer block with attention, feed-forward, and normalization.
    
    This combines multi-head attention and feed-forward network with
    residual connections and layer normalization.
    """
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        """
        Initialize transformer block.
        
        Args:
            d_model: Dimension of the model
            num_heads: Number of attention heads
            d_ff: Dimension of feed-forward layer
            dropout: Dropout rate
        """
        super().__init__()
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_ff = d_ff
        
        # Multi-head attention
        self.attention = MultiHeadAttention(d_model, num_heads, dropout)
        
        # Feed-forward network
        self.feed_forward = FeedForwardNetwork(d_model, d_ff, dropout)
        
        # Layer normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Apply transformer block.
        
        Args:
            x: Input tensor of shape (batch_size, seq_len, d_model)
            mask: Optional attention mask
            
        Returns:
            Tuple of (output, attention_weights)
        """
        # Step 1: Multi-head attention with residual connection
        attn_output, attention_weights = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))
        
        # Step 2: Feed-forward with residual connection
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x, attention_weights
    
    def visualize_block_processing(self, x: torch.Tensor, 
                                 token_texts: List[str],
                                 mask: Optional[torch.Tensor] = None) -> Dict:
        """
        Visualize the processing through the transformer block.
        
        Args:
            x: Input tensor
            token_texts: List of token texts
            mask: Optional attention mask
            
        Returns:
            Dictionary with visualization data
        """
        with torch.no_grad():
            # Initial input
            initial_input = x.clone()
            
            # Step 1: Attention
            attn_output, attention_weights = self.attention(x, x, x, mask)
            after_attention = x + self.dropout(attn_output)
            after_norm1 = self.norm1(after_attention)
            
            # Step 2: Feed-forward
            ff_output = self.feed_forward(after_norm1)
            after_ff = after_norm1 + self.dropout(ff_output)
            final_output = self.norm2(after_ff)
            
            # Convert to numpy for visualization
            return {
                'tokens': token_texts,
                'initial_input': initial_input[0].cpu().numpy(),
                'after_attention': after_attention[0].cpu().numpy(),
                'after_norm1': after_norm1[0].cpu().numpy(),
                'after_feedforward': after_ff[0].cpu().numpy(),
                'final_output': final_output[0].cpu().numpy(),
                'attention_weights': attention_weights[0].cpu().numpy(),
                'residual_magnitudes': {
                    'attention_residual': torch.norm(attn_output[0], dim=-1).cpu().numpy(),
                    'feedforward_residual': torch.norm(ff_output[0], dim=-1).cpu().numpy()
                }
            }


class GPTTransformer(nn.Module):
    """
    Complete GPT-style transformer model for educational purposes.
    
    This implements a simplified version of GPT with multiple transformer blocks.
    """
    
    def __init__(self, 
                 vocab_size: int,
                 d_model: int = 512,
                 num_heads: int = 8,
                 num_layers: int = 6,
                 d_ff: int = 2048,
                 max_seq_len: int = 512,
                 dropout: float = 0.1):
        """
        Initialize GPT transformer.
        
        Args:
            vocab_size: Size of vocabulary
            d_model: Dimension of the model
            num_heads: Number of attention heads
            num_layers: Number of transformer layers
            d_ff: Dimension of feed-forward layer
            max_seq_len: Maximum sequence length
            dropout: Dropout rate
        """
        super().__init__()
        
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.d_ff = d_ff
        self.max_seq_len = max_seq_len
        
        # Embedding layer
        self.embedding = CombinedEmbedding(vocab_size, d_model, max_seq_len, dropout)
        
        # Transformer blocks
        self.transformer_blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        # Final layer normalization
        self.final_norm = nn.LayerNorm(d_model)
        
        # Language model head
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights using GPT-style initialization."""
        # Initialize language model head
        nn.init.normal_(self.lm_head.weight, mean=0.0, std=0.02)
        
        # Initialize transformer blocks
        for block in self.transformer_blocks:
            # Scale down initialization for deeper layers
            for module in block.modules():
                if isinstance(module, nn.Linear):
                    nn.init.normal_(module.weight, mean=0.0, std=0.02)
                    if module.bias is not None:
                        nn.init.zeros_(module.bias)
    
    def forward(self, 
                token_ids: torch.Tensor,
                return_attention: bool = False) -> Dict:
        """
        Forward pass through the transformer.
        
        Args:
            token_ids: Token IDs of shape (batch_size, seq_len)
            return_attention: Whether to return attention weights
            
        Returns:
            Dictionary with outputs and optional attention weights
        """
        # Step 1: Embedding
        x = self.embedding(token_ids)
        
        # Step 2: Apply transformer blocks
        attention_weights = []
        layer_outputs = []
        
        for i, block in enumerate(self.transformer_blocks):
            x, attn_weights = block(x)
            
            if return_attention:
                attention_weights.append(attn_weights)
            
            layer_outputs.append(x.clone())
        
        # Step 3: Final normalization
        x = self.final_norm(x)
        
        # Step 4: Language model head
        logits = self.lm_head(x)
        
        result = {
            'logits': logits,
            'last_hidden_state': x,
            'layer_outputs': layer_outputs
        }
        
        if return_attention:
            result['attention_weights'] = attention_weights
        
        return result
    
    def generate_next_token_probabilities(self, token_ids: torch.Tensor) -> torch.Tensor:
        """
        Generate probabilities for the next token.
        
        Args:
            token_ids: Input token IDs
            
        Returns:
            Probabilities for next token
        """
        with torch.no_grad():
            outputs = self.forward(token_ids)
            logits = outputs['logits']
            
            # Get logits for the last token
            last_token_logits = logits[:, -1, :]
            
            # Apply softmax to get probabilities
            probabilities = torch.softmax(last_token_logits, dim=-1)
            
            return probabilities
    
    def visualize_layer_processing(self, 
                                 token_ids: torch.Tensor,
                                 token_texts: List[str]) -> Dict:
        """
        Visualize how information flows through the transformer layers.
        
        Args:
            token_ids: Token IDs
            token_texts: List of token texts
            
        Returns:
            Dictionary with layer-by-layer visualization data
        """
        with torch.no_grad():
            # Get embeddings
            x = self.embedding(token_ids)
            
            # Process through each layer
            layer_data = []
            
            for i, block in enumerate(self.transformer_blocks):
                # Get detailed block processing
                block_viz = block.visualize_block_processing(x, token_texts)
                
                # Apply the block
                x, attn_weights = block(x)
                
                # Calculate layer statistics
                layer_stats = {
                    'layer_id': i,
                    'input_mean': torch.mean(block_viz['initial_input']).item(),
                    'output_mean': torch.mean(x[0]).item(),
                    'attention_entropy': self._calculate_attention_entropy(attn_weights[0]),
                    'residual_strength': {
                        'attention': torch.mean(torch.norm(block_viz['residual_magnitudes']['attention_residual'])).item(),
                        'feedforward': torch.mean(torch.norm(block_viz['residual_magnitudes']['feedforward_residual'])).item()
                    }
                }
                
                layer_data.append({
                    'layer_stats': layer_stats,
                    'block_visualization': block_viz,
                    'layer_output': x[0].cpu().numpy()
                })
            
            return {
                'tokens': token_texts,
                'num_layers': self.num_layers,
                'layer_data': layer_data,
                'final_output': x[0].cpu().numpy()
            }
    
    def _calculate_attention_entropy(self, attention_weights: torch.Tensor) -> float:
        """
        Calculate the entropy of attention weights.
        
        Args:
            attention_weights: Attention weights tensor
            
        Returns:
            Average entropy across heads and positions
        """
        # Calculate entropy for each head and position
        entropies = []
        
        for head in range(attention_weights.shape[0]):
            for pos in range(attention_weights.shape[1]):
                weights = attention_weights[head, pos]
                # Add small epsilon to avoid log(0)
                weights = weights + 1e-10
                entropy = -torch.sum(weights * torch.log(weights))
                entropies.append(entropy.item())
        
        return np.mean(entropies)
    
    def get_model_info(self) -> Dict:
        """
        Get information about the model architecture.
        
        Returns:
            Dictionary with model information
        """
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        
        return {
            'vocabulary_size': self.vocab_size,
            'model_dimension': self.d_model,
            'num_attention_heads': self.num_heads,
            'num_layers': self.num_layers,
            'feedforward_dimension': self.d_ff,
            'max_sequence_length': self.max_seq_len,
            'total_parameters': total_params,
            'trainable_parameters': trainable_params,
            'parameter_breakdown': {
                'embeddings': sum(p.numel() for p in self.embedding.parameters()),
                'transformer_blocks': sum(p.numel() for p in self.transformer_blocks.parameters()),
                'language_model_head': sum(p.numel() for p in self.lm_head.parameters())
            }
        }


def create_sample_transformer(
    vocab_size: int = 1000, 
    d_model: int = 256,
    num_heads: int = 8,
    d_ff: int = 1024
) -> GPTTransformer:
    """
    Create a sample transformer for educational purposes.
    
    Args:
        vocab_size: Size of vocabulary
        d_model: Model dimension
        num_heads: Number of attention heads
        d_ff: Feed forward dimension
        
    Returns:
        Initialized transformer model
    """
    return GPTTransformer(
        vocab_size=vocab_size,
        d_model=d_model,
        num_heads=num_heads,
        num_layers=6,
        d_ff=d_ff,
        max_seq_len=128,
        dropout=0.1
    )


def demonstrate_transformer_model():
    """
    Demonstrate how the complete transformer model works.
    """
    print("🏗️ Demonstrating Complete Transformer Model")
    print("=" * 50)
    
    # Create sample transformer
    model = create_sample_transformer()
    
    # Model info
    model_info = model.get_model_info()
    print(f"📊 Model architecture:")
    for key, value in model_info.items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for sub_key, sub_value in value.items():
                print(f"    {sub_key}: {sub_value:,}")
        else:
            print(f"  {key}: {value:,}")
    
    # Sample input
    token_ids = torch.tensor([[1, 15, 23, 8, 45, 2]])
    token_texts = ["<BOS>", "I", "love", "programming", "because", "<EOS>"]
    
    print(f"\n🔤 Processing sequence: {' '.join(token_texts)}")
    
    # Forward pass
    outputs = model(token_ids, return_attention=True)
    
    print(f"\n📈 Model outputs:")
    print(f"  Logits shape: {outputs['logits'].shape}")
    print(f"  Last hidden state shape: {outputs['last_hidden_state'].shape}")
    print(f"  Number of layer outputs: {len(outputs['layer_outputs'])}")
    print(f"  Number of attention weight tensors: {len(outputs['attention_weights'])}")
    
    # Generate next token probabilities
    probs = model.generate_next_token_probabilities(token_ids)
    top_probs, top_indices = torch.topk(probs[0], 5)
    
    print(f"\n🎯 Top 5 next token predictions:")
    for i, (prob, idx) in enumerate(zip(top_probs, top_indices)):
        print(f"  {i+1}. Token {idx.item()}: {prob.item():.4f}")
    
    # Visualize layer processing
    layer_viz = model.visualize_layer_processing(token_ids, token_texts)
    
    print(f"\n🏗️ Layer-by-layer processing:")
    for layer_info in layer_viz['layer_data']:
        stats = layer_info['layer_stats']
        print(f"  Layer {stats['layer_id']}: "
              f"Input mean: {stats['input_mean']:.3f}, "
              f"Output mean: {stats['output_mean']:.3f}, "
              f"Attention entropy: {stats['attention_entropy']:.3f}")


if __name__ == "__main__":
    demonstrate_transformer_model()
