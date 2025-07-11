"""
Feed-forward module for educational LLM project.

This module implements the feed-forward network that appears in each
transformer block, providing non-linear transformations.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List
import numpy as np


class FeedForwardNetwork(nn.Module):
    """
    Feed-forward network used in transformer blocks.
    
    This is a simple two-layer fully connected network with a non-linear
    activation function (typically GELU) in between.
    """
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        """
        Initialize feed-forward network.
        
        Args:
            d_model: Dimension of the model
            d_ff: Dimension of the feed-forward layer (typically 4 * d_model)
            dropout: Dropout rate
        """
        super().__init__()
        
        self.d_model = d_model
        self.d_ff = d_ff
        
        # Two linear transformations with GELU activation
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(dropout)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights with Xavier uniform initialization."""
        nn.init.xavier_uniform_(self.linear1.weight)
        nn.init.xavier_uniform_(self.linear2.weight)
        nn.init.zeros_(self.linear1.bias)
        nn.init.zeros_(self.linear2.bias)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Apply feed-forward transformation.
        
        Args:
            x: Input tensor of shape (batch_size, seq_len, d_model)
            
        Returns:
            Output tensor of shape (batch_size, seq_len, d_model)
        """
        # Step 1: First linear transformation (expand dimension)
        x = self.linear1(x)  # (batch_size, seq_len, d_ff)
        
        # Step 2: Apply GELU activation
        x = F.gelu(x)  # (batch_size, seq_len, d_ff)
        
        # Step 3: Apply dropout
        x = self.dropout(x)
        
        # Step 4: Second linear transformation (project back)
        x = self.linear2(x)  # (batch_size, seq_len, d_model)
        
        return x
    
    def visualize_activations(self, x: torch.Tensor, token_texts: List[str]) -> Dict:
        """
        Visualize the feed-forward network activations.
        
        Args:
            x: Input tensor
            token_texts: List of token texts
            
        Returns:
            Dictionary with activation visualization data
        """
        with torch.no_grad():
            batch_size, seq_len, d_model = x.shape
            
            # Step-by-step forward pass for visualization
            
            # Step 1: First linear transformation
            hidden1 = self.linear1(x)
            
            # Step 2: GELU activation
            hidden2 = F.gelu(hidden1)
            
            # Step 3: Second linear transformation
            output = self.linear2(hidden2)
            
            # Convert to numpy for visualization
            input_np = x[0].cpu().numpy()  # First batch item
            hidden1_np = hidden1[0].cpu().numpy()
            hidden2_np = hidden2[0].cpu().numpy()
            output_np = output[0].cpu().numpy()
            
            # Calculate statistics
            input_stats = self._calculate_activation_stats(input_np)
            hidden1_stats = self._calculate_activation_stats(hidden1_np)
            hidden2_stats = self._calculate_activation_stats(hidden2_np)
            output_stats = self._calculate_activation_stats(output_np)
            
            return {
                'tokens': token_texts,
                'input_shape': input_np.shape,
                'hidden1_shape': hidden1_np.shape,
                'hidden2_shape': hidden2_np.shape,
                'output_shape': output_np.shape,
                'input_activations': input_np,
                'hidden1_activations': hidden1_np,
                'hidden2_activations': hidden2_np,
                'output_activations': output_np,
                'input_stats': input_stats,
                'hidden1_stats': hidden1_stats,
                'hidden2_stats': hidden2_stats,
                'output_stats': output_stats,
                'expansion_ratio': self.d_ff / self.d_model
            }
    
    def _calculate_activation_stats(self, activations: np.ndarray) -> Dict:
        """
        Calculate statistics for activation visualization.
        
        Args:
            activations: Activation array
            
        Returns:
            Dictionary with activation statistics
        """
        return {
            'mean': float(np.mean(activations)),
            'std': float(np.std(activations)),
            'min': float(np.min(activations)),
            'max': float(np.max(activations)),
            'positive_ratio': float(np.mean(activations > 0)),
            'zero_ratio': float(np.mean(np.abs(activations) < 1e-6)),
            'magnitude': float(np.linalg.norm(activations))
        }
    
    def get_network_info(self) -> Dict:
        """
        Get information about the feed-forward network.
        
        Returns:
            Dictionary with network information
        """
        return {
            'input_dim': self.d_model,
            'hidden_dim': self.d_ff,
            'output_dim': self.d_model,
            'expansion_ratio': self.d_ff / self.d_model,
            'parameters': {
                'linear1': self.linear1.weight.numel() + self.linear1.bias.numel(),
                'linear2': self.linear2.weight.numel() + self.linear2.bias.numel(),
                'total': sum(p.numel() for p in self.parameters())
            }
        }


class GELUActivation:
    """
    Educational implementation of GELU activation function.
    
    GELU (Gaussian Error Linear Unit) is commonly used in transformers
    instead of ReLU because it provides smoother gradients.
    """
    
    @staticmethod
    def gelu_formula(x: torch.Tensor) -> torch.Tensor:
        """
        GELU activation using the exact formula.
        
        GELU(x) = 0.5 * x * (1 + tanh(√(2/π) * (x + 0.044715 * x³)))
        
        Args:
            x: Input tensor
            
        Returns:
            GELU activated tensor
        """
        return 0.5 * x * (1 + torch.tanh(
            torch.sqrt(torch.tensor(2.0 / torch.pi)) * 
            (x + 0.044715 * torch.pow(x, 3))
        ))
    
    @staticmethod
    def gelu_approximation(x: torch.Tensor) -> torch.Tensor:
        """
        GELU activation using approximation.
        
        GELU(x) ≈ 0.5 * x * (1 + tanh(√(2/π) * (x + 0.044715 * x³)))
        
        Args:
            x: Input tensor
            
        Returns:
            GELU activated tensor
        """
        return 0.5 * x * (1 + torch.erf(x / torch.sqrt(torch.tensor(2.0))))
    
    @staticmethod
    def compare_activations(x: torch.Tensor) -> Dict:
        """
        Compare different activation functions.
        
        Args:
            x: Input tensor
            
        Returns:
            Dictionary with activation comparisons
        """
        with torch.no_grad():
            gelu_output = F.gelu(x)
            relu_output = F.relu(x)
            tanh_output = torch.tanh(x)
            
            return {
                'input': x.cpu().numpy(),
                'gelu': gelu_output.cpu().numpy(),
                'relu': relu_output.cpu().numpy(),
                'tanh': tanh_output.cpu().numpy()
            }


def create_sample_feedforward_layer(d_model: int = 512, d_ff: int = 2048) -> FeedForwardNetwork:
    """
    Create a sample feed-forward layer for demonstration.
    
    Args:
        d_model: Model dimension
        d_ff: Feed-forward dimension
        
    Returns:
        Initialized feed-forward layer
    """
    return FeedForwardNetwork(d_model, d_ff)


def demonstrate_feedforward_network():
    """
    Demonstrate how the feed-forward network works.
    """
    print("🧠 Demonstrating Feed-Forward Network")
    print("=" * 50)
    
    # Create sample feed-forward layer
    ff_layer = create_sample_feedforward_layer(d_model=64, d_ff=256)
    
    # Sample input
    batch_size, seq_len, d_model = 1, 6, 64
    sample_input = torch.randn(batch_size, seq_len, d_model)
    token_texts = ["I", "love", "programming", "because", "it's", "creative"]
    
    print(f"📊 Feed-forward layer info:")
    network_info = ff_layer.get_network_info()
    for key, value in network_info.items():
        print(f"  {key}: {value}")
    
    # Apply feed-forward transformation
    output = ff_layer(sample_input)
    
    print(f"\n📈 Input/Output info:")
    print(f"  Input shape: {sample_input.shape}")
    print(f"  Output shape: {output.shape}")
    print(f"  Input mean: {sample_input.mean():.3f}")
    print(f"  Output mean: {output.mean():.3f}")
    
    # Visualize activations
    viz_data = ff_layer.visualize_activations(sample_input, token_texts)
    
    print(f"\n🎯 Activation statistics:")
    for stage in ['input', 'hidden1', 'hidden2', 'output']:
        stats = viz_data[f'{stage}_stats']
        print(f"  {stage.upper()} - Mean: {stats['mean']:.3f}, "
              f"Std: {stats['std']:.3f}, "
              f"Positive ratio: {stats['positive_ratio']:.3f}")
    
    # Demonstrate GELU properties
    print(f"\n⚡ GELU Activation Properties:")
    test_input = torch.tensor([-3.0, -1.0, 0.0, 1.0, 3.0])
    gelu_comparison = GELUActivation.compare_activations(test_input)
    
    print(f"  Input values: {test_input.numpy()}")
    print(f"  GELU output: {gelu_comparison['gelu']}")
    print(f"  ReLU output: {gelu_comparison['relu']}")
    
    # Show the expansion effect
    print(f"\n📏 Dimension transformation:")
    print(f"  Input dimension: {viz_data['input_shape'][1]}")
    print(f"  Hidden dimension: {viz_data['hidden1_shape'][1]} (×{viz_data['expansion_ratio']:.1f})")
    print(f"  Output dimension: {viz_data['output_shape'][1]}")


def analyze_feedforward_behavior(ff_layer: FeedForwardNetwork, 
                                input_tensor: torch.Tensor, 
                                token_texts: List[str]) -> Dict:
    """
    Analyze the behavior of the feed-forward network.
    
    Args:
        ff_layer: Feed-forward layer
        input_tensor: Input tensor
        token_texts: List of token texts
        
    Returns:
        Analysis results
    """
    with torch.no_grad():
        # Get visualization data
        viz_data = ff_layer.visualize_activations(input_tensor, token_texts)
        
        # Analyze transformation patterns
        input_activations = viz_data['input_activations']
        output_activations = viz_data['output_activations']
        
        # Calculate changes
        magnitude_change = np.linalg.norm(output_activations, axis=1) / np.linalg.norm(input_activations, axis=1)
        
        # Analyze sparsity
        hidden2_activations = viz_data['hidden2_activations']
        sparsity = np.mean(hidden2_activations == 0, axis=1)
        
        return {
            'magnitude_changes': magnitude_change,
            'average_magnitude_change': np.mean(magnitude_change),
            'sparsity_per_token': sparsity,
            'average_sparsity': np.mean(sparsity),
            'information_flow': {
                'input_variance': np.var(input_activations),
                'hidden_variance': np.var(hidden2_activations),
                'output_variance': np.var(output_activations)
            }
        }


if __name__ == "__main__":
    demonstrate_feedforward_network()
