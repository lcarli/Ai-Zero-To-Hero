"""
Utility functions for the educational LLM project.

This module contains helper functions for visualization, data processing,
and educational demonstrations.
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional, Any
import json


def create_attention_heatmap(attention_weights: np.ndarray, 
                           tokens: List[str],
                           title: str = "Attention Heatmap",
                           figsize: Tuple[int, int] = (10, 8)) -> plt.Figure:
    """
    Create a heatmap visualization of attention weights.
    
    Args:
        attention_weights: Attention weights matrix
        tokens: List of token texts
        title: Title for the heatmap
        figsize: Figure size
        
    Returns:
        Matplotlib figure
    """
    fig, ax = plt.subplots(figsize=figsize)
    
    # Create heatmap
    sns.heatmap(attention_weights, 
                xticklabels=tokens,
                yticklabels=tokens,
                annot=True,
                fmt='.3f',
                cmap='Blues',
                ax=ax)
    
    ax.set_title(title)
    ax.set_xlabel('Key (Attended To)')
    ax.set_ylabel('Query (Attending From)')
    
    plt.tight_layout()
    return fig


def plot_embedding_similarities(similarity_matrix: np.ndarray,
                               tokens: List[str],
                               title: str = "Token Embedding Similarities") -> plt.Figure:
    """
    Plot embedding similarities between tokens.
    
    Args:
        similarity_matrix: Cosine similarity matrix
        tokens: List of token texts
        title: Plot title
        
    Returns:
        Matplotlib figure
    """
    fig, ax = plt.subplots(figsize=(10, 8))
    
    sns.heatmap(similarity_matrix,
                xticklabels=tokens,
                yticklabels=tokens,
                annot=True,
                fmt='.3f',
                cmap='RdYlBu_r',
                center=0,
                ax=ax)
    
    ax.set_title(title)
    ax.set_xlabel('Token')
    ax.set_ylabel('Token')
    
    plt.tight_layout()
    return fig


def visualize_positional_encoding(positional_encodings: np.ndarray,
                                 max_positions: int = 50,
                                 max_dimensions: int = 64) -> plt.Figure:
    """
    Visualize positional encoding patterns.
    
    Args:
        positional_encodings: Positional encoding matrix
        max_positions: Maximum positions to show
        max_dimensions: Maximum dimensions to show
        
    Returns:
        Matplotlib figure
    """
    # Limit the data for visualization
    pe_subset = positional_encodings[:max_positions, :max_dimensions]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Heatmap of positional encodings
    im1 = ax1.imshow(pe_subset.T, cmap='RdBu_r', aspect='auto')
    ax1.set_title('Positional Encoding Patterns')
    ax1.set_xlabel('Position')
    ax1.set_ylabel('Dimension')
    plt.colorbar(im1, ax=ax1)
    
    # Line plot for specific dimensions
    dimensions_to_plot = [0, 1, 16, 17, 32, 33]
    for dim in dimensions_to_plot:
        if dim < pe_subset.shape[1]:
            ax2.plot(pe_subset[:, dim], label=f'Dim {dim}')
    
    ax2.set_title('Positional Encoding Values')
    ax2.set_xlabel('Position')
    ax2.set_ylabel('Encoding Value')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig


def plot_layer_representations(layer_outputs: List[np.ndarray],
                              tokens: List[str],
                              metric: str = 'magnitude') -> plt.Figure:
    """
    Plot how token representations change through layers.
    
    Args:
        layer_outputs: List of layer output arrays
        tokens: List of token texts
        metric: Metric to plot ('magnitude', 'mean', 'std')
        
    Returns:
        Matplotlib figure
    """
    fig, ax = plt.subplots(figsize=(12, 8))
    
    num_layers = len(layer_outputs)
    num_tokens = len(tokens)
    
    # Calculate metric for each layer and token
    data = np.zeros((num_layers, num_tokens))
    
    for layer_idx, layer_output in enumerate(layer_outputs):
        for token_idx in range(num_tokens):
            if metric == 'magnitude':
                data[layer_idx, token_idx] = np.linalg.norm(layer_output[token_idx])
            elif metric == 'mean':
                data[layer_idx, token_idx] = np.mean(layer_output[token_idx])
            elif metric == 'std':
                data[layer_idx, token_idx] = np.std(layer_output[token_idx])
    
    # Create line plot
    for token_idx, token in enumerate(tokens):
        ax.plot(range(num_layers), data[:, token_idx], 
                marker='o', label=token, linewidth=2)
    
    ax.set_title(f'Token Representation {metric.title()} Across Layers')
    ax.set_xlabel('Layer')
    ax.set_ylabel(f'Representation {metric.title()}')
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig


def plot_attention_entropy(attention_weights_list: List[np.ndarray],
                         layer_names: Optional[List[str]] = None) -> plt.Figure:
    """
    Plot attention entropy across layers and heads.
    
    Args:
        attention_weights_list: List of attention weight arrays for each layer
        layer_names: Optional layer names
        
    Returns:
        Matplotlib figure
    """
    fig, ax = plt.subplots(figsize=(12, 6))
    
    if layer_names is None:
        layer_names = [f'Layer {i}' for i in range(len(attention_weights_list))]
    
    entropies = []
    
    for layer_idx, attention_weights in enumerate(attention_weights_list):
        layer_entropies = []
        
        # Calculate entropy for each head
        for head in range(attention_weights.shape[0]):
            head_entropies = []
            
            for pos in range(attention_weights.shape[1]):
                weights = attention_weights[head, pos]
                # Add small epsilon to avoid log(0)
                weights = weights + 1e-10
                entropy = -np.sum(weights * np.log(weights))
                head_entropies.append(entropy)
            
            layer_entropies.append(np.mean(head_entropies))
        
        entropies.append(layer_entropies)
    
    # Plot entropy for each head across layers
    entropies = np.array(entropies)
    
    for head in range(entropies.shape[1]):
        ax.plot(range(len(layer_names)), entropies[:, head], 
                marker='o', label=f'Head {head}', alpha=0.7)
    
    # Plot average entropy
    avg_entropy = np.mean(entropies, axis=1)
    ax.plot(range(len(layer_names)), avg_entropy, 
            'k-', marker='s', linewidth=3, label='Average', alpha=0.8)
    
    ax.set_title('Attention Entropy Across Layers')
    ax.set_xlabel('Layer')
    ax.set_ylabel('Attention Entropy')
    ax.set_xticks(range(len(layer_names)))
    ax.set_xticklabels(layer_names, rotation=45)
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig


def create_token_journey_visualization(layer_outputs: List[np.ndarray],
                                     tokens: List[str],
                                     token_index: int) -> plt.Figure:
    """
    Visualize how a specific token's representation changes through layers.
    
    Args:
        layer_outputs: List of layer output arrays
        tokens: List of token texts
        token_index: Index of the token to visualize
        
    Returns:
        Matplotlib figure
    """
    if token_index >= len(tokens):
        raise ValueError(f"Token index {token_index} out of range")
    
    token = tokens[token_index]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Plot representation magnitude change
    magnitudes = []
    for layer_output in layer_outputs:
        magnitude = np.linalg.norm(layer_output[token_index])
        magnitudes.append(magnitude)
    
    ax1.plot(range(len(layer_outputs)), magnitudes, 'bo-', linewidth=2, markersize=8)
    ax1.set_title(f'Representation Magnitude for Token "{token}"')
    ax1.set_xlabel('Layer')
    ax1.set_ylabel('Magnitude')
    ax1.grid(True, alpha=0.3)
    
    # Plot first few dimensions across layers
    dimensions_to_plot = min(8, layer_outputs[0].shape[1])
    
    for dim in range(dimensions_to_plot):
        values = [layer_output[token_index, dim] for layer_output in layer_outputs]
        ax2.plot(range(len(layer_outputs)), values, 
                marker='o', label=f'Dim {dim}', alpha=0.7)
    
    ax2.set_title(f'Individual Dimensions for Token "{token}"')
    ax2.set_xlabel('Layer')
    ax2.set_ylabel('Value')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig


def calculate_representation_statistics(representations: np.ndarray) -> Dict[str, float]:
    """
    Calculate statistics for token representations.
    
    Args:
        representations: Array of token representations
        
    Returns:
        Dictionary with statistics
    """
    return {
        'mean': float(np.mean(representations)),
        'std': float(np.std(representations)),
        'min': float(np.min(representations)),
        'max': float(np.max(representations)),
        'magnitude': float(np.linalg.norm(representations)),
        'sparsity': float(np.mean(np.abs(representations) < 1e-6)),
        'positive_ratio': float(np.mean(representations > 0))
    }


def export_visualization_data(data: Dict[str, Any], filename: str) -> None:
    """
    Export visualization data to JSON file.
    
    Args:
        data: Data to export
        filename: Output filename
    """
    # Convert numpy arrays to lists for JSON serialization
    def convert_numpy(obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(item) for item in obj]
        else:
            return obj
    
    converted_data = convert_numpy(data)
    
    with open(filename, 'w') as f:
        json.dump(converted_data, f, indent=2)


def load_visualization_data(filename: str) -> Dict[str, Any]:
    """
    Load visualization data from JSON file.
    
    Args:
        filename: Input filename
        
    Returns:
        Loaded data dictionary
    """
    with open(filename, 'r') as f:
        data = json.load(f)
    
    return data


def create_model_architecture_diagram(model_info: Dict[str, Any]) -> str:
    """
    Create a text-based diagram of the model architecture.
    
    Args:
        model_info: Model information dictionary
        
    Returns:
        ASCII art diagram
    """
    diagram = f"""
    📊 GPT Transformer Architecture
    ═══════════════════════════════════════════════════════════════
    
    Input: Token IDs (batch_size, seq_len)
    │
    ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ Token + Positional Embeddings                               │
    │ Vocab: {model_info['vocabulary_size']:,} → d_model: {model_info['model_dimension']:,}                    │
    └─────────────────────────────────────────────────────────────┘
    │
    ▼
    """
    
    # Add transformer blocks
    for i in range(model_info['num_layers']):
        diagram += f"""
    ┌─────────────────────────────────────────────────────────────┐
    │ Transformer Block {i+1:2d}                                     │
    │ ┌─────────────────────────────────────────────────────────┐ │
    │ │ Multi-Head Attention ({model_info['num_attention_heads']:2d} heads)              │ │
    │ │ + Residual Connection + Layer Norm                      │ │
    │ └─────────────────────────────────────────────────────────┘ │
    │ ┌─────────────────────────────────────────────────────────┐ │
    │ │ Feed-Forward Network (d_ff: {model_info['feedforward_dimension']:,})           │ │
    │ │ + Residual Connection + Layer Norm                      │ │
    │ └─────────────────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────────────────┘
    │
    ▼"""
    
    diagram += f"""
    
    ┌─────────────────────────────────────────────────────────────┐
    │ Final Layer Normalization                                   │
    └─────────────────────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ Language Model Head                                         │
    │ Linear: {model_info['model_dimension']:,} → {model_info['vocabulary_size']:,}                              │
    └─────────────────────────────────────────────────────────────┘
    │
    ▼
    Output: Logits (batch_size, seq_len, vocab_size)
    
    📈 Model Statistics:
    ═══════════════════════════════════════════════════════════════
    Total Parameters: {model_info['total_parameters']:,}
    Trainable Parameters: {model_info['trainable_parameters']:,}
    Max Sequence Length: {model_info['max_sequence_length']:,}
    """
    
    return diagram


def print_processing_step(step_name: str, description: str, data: Optional[Dict] = None):
    """
    Print a formatted processing step for educational purposes.
    
    Args:
        step_name: Name of the processing step
        description: Description of what happens
        data: Optional data to display
    """
    print(f"\n🔸 {step_name}")
    print("─" * (len(step_name) + 3))
    print(f"📝 {description}")
    
    if data:
        for key, value in data.items():
            if isinstance(value, (int, float)):
                print(f"   {key}: {value:.4f}" if isinstance(value, float) else f"   {key}: {value}")
            elif isinstance(value, (list, tuple)) and len(value) <= 5:
                print(f"   {key}: {value}")
            else:
                print(f"   {key}: {type(value).__name__} of size {getattr(value, 'shape', len(value))}")


def create_educational_summary(model_outputs: Dict[str, Any], 
                             tokens: List[str]) -> str:
    """
    Create an educational summary of the model processing.
    
    Args:
        model_outputs: Model outputs dictionary
        tokens: List of token texts
        
    Returns:
        Educational summary string
    """
    summary = f"""
    🎓 Educational Summary: LLM Processing Pipeline
    ═══════════════════════════════════════════════════════════════
    
    Input Sequence: "{' '.join(tokens)}"
    Number of Tokens: {len(tokens)}
    
    🔄 Processing Steps Completed:
    
    1. 🔤 Tokenization
       • Text broken into {len(tokens)} tokens
       • Each token mapped to a unique ID
    
    2. 🧮 Embeddings
       • Each token converted to {model_outputs.get('embedding_dim', 'N/A')}-dimensional vector
       • Positional information added to capture sequence order
    
    3. 👁️ Multi-Head Attention
       • {model_outputs.get('num_heads', 'N/A')} attention heads analyze relationships
       • Each token can attend to any other token in the sequence
    
    4. 🧠 Feed-Forward Processing
       • Non-linear transformations applied to each position
       • Hidden dimension expanded and compressed
    
    5. 🏗️ Layer Stacking
       • {model_outputs.get('num_layers', 'N/A')} transformer layers process the sequence
       • Each layer builds more complex representations
    
    6. 🎯 Final Prediction
       • Model outputs probability distribution over vocabulary
       • Next token can be predicted from these probabilities
    
    📊 Key Insights:
    • Information flows through residual connections
    • Attention allows global context awareness
    • Layer normalization stabilizes training
    • Feed-forward networks add non-linearity
    """
    
    return summary


if __name__ == "__main__":
    # Demonstrate utility functions
    print("🛠️ LLM Educational Utilities")
    print("=" * 40)
    
    # Sample data for demonstration
    sample_tokens = ["I", "love", "programming", "because", "it's", "creative"]
    sample_attention = np.random.rand(6, 6)
    sample_attention = sample_attention / np.sum(sample_attention, axis=1, keepdims=True)
    
    print("📊 Creating sample visualizations...")
    
    # Calculate some statistics
    stats = calculate_representation_statistics(sample_attention)
    print(f"\nSample attention statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value:.4f}")
    
    # Create model architecture diagram
    sample_model_info = {
        'vocabulary_size': 50000,
        'model_dimension': 768,
        'num_attention_heads': 12,
        'num_layers': 12,
        'feedforward_dimension': 3072,
        'total_parameters': 117000000,
        'trainable_parameters': 117000000,
        'max_sequence_length': 1024
    }
    
    print(create_model_architecture_diagram(sample_model_info))
