"""
Complete Streamlit web application for educational LLM demonstration.

This app provides an interactive interface to explore how Large Language Models
process text step by step, from tokenization to final predictions.
"""

import streamlit as st
import torch
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Any
import json

# Import our custom modules
from src.tokenization import BPETokenizer, create_sample_tokenizer, create_dynamic_tokenizer
from src.embeddings import create_sample_embedding_layer
from src.attention import create_sample_attention_layer, AttentionVisualizer
from src.feedforward import create_sample_feedforward_layer
from src.transformer import create_sample_transformer, TransformerBlock
from src.utils import (
    calculate_representation_statistics,
    create_model_architecture_diagram,
    create_educational_summary
)


def apply_custom_styling():
    """Apply custom CSS styling to the Streamlit app."""
    st.markdown("""
    <style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        text-align: center;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .step-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 25px;
        border-radius: 15px;
        margin: 25px 0;
        border-left: 6px solid #667eea;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .token-box {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        margin: 3px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .embedding-box {
        display: inline-block;
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        padding: 8px 12px;
        margin: 3px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .attention-box {
        display: inline-block;
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        padding: 8px 12px;
        margin: 3px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .prediction-box {
        display: inline-block;
        background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
        padding: 10px 15px;
        margin: 5px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: bold;
        min-width: 100px;
        text-align: center;
    }
    
    .metric-card {
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 15px 0;
        border: 1px solid #e0e0e0;
    }
    
    .step-header {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
    }
    
    .explanation-text {
        background: rgba(255, 255, 255, 0.8);
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        border-left: 4px solid #4CAF50;
    }
    
    .code-block {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #e9ecef;
        font-family: 'Courier New', monospace;
        margin: 10px 0;
    }
    </style>
    """, unsafe_allow_html=True)


def create_header():
    """Create the main header section."""
    st.markdown("""
    <div class="main-header">
        <h1>🤖 Large Language Model Educational Demo</h1>
        <h3>AI Zero To Hero - Interactive Learning Experience</h3>
        <p>Explore how LLMs process text step by step with real PyTorch implementations!</p>
    </div>
    """, unsafe_allow_html=True)


def create_sidebar():
    """Create the sidebar with configuration options."""
    with st.sidebar:
        st.title("⚙️ Configuration")
        
        # Model parameters section
        st.header("🔧 Model Parameters")
        vocab_size = st.slider("Vocabulary Size", 500, 2000, 1000, 100)
        
        # Ensure d_model is always divisible by num_heads
        d_model_options = [64, 128, 192, 256, 320, 384, 448, 512]
        d_model = st.selectbox("Embedding Dimension", d_model_options, index=3)  # Default 256
        
        # Filter num_heads options to ensure divisibility
        valid_heads = [h for h in [4, 8, 12, 16] if d_model % h == 0]
        if not valid_heads:  # Fallback if no valid options
            valid_heads = [4]
        
        num_heads = st.selectbox("Attention Heads", valid_heads, index=0)
        
        # Info about the constraint
        st.info(f"💡 **Note:** Embedding dimension ({d_model}) must be divisible by number of heads ({num_heads}). "
               f"Each head gets {d_model // num_heads} dimensions.")
        
        num_layers = st.slider("Transformer Layers", 1, 6, 3)
        
        # Processing options
        st.header("🎛️ Processing Options")
        show_intermediate = st.checkbox("Show Intermediate Steps", True)
        show_attention_viz = st.checkbox("Show Attention Visualization", True)
        show_embeddings_viz = st.checkbox("Show Embeddings Visualization", True)
        temperature = st.slider("Temperature (for predictions)", 0.1, 2.0, 1.0, 0.1)
        
        # Example prompts
        st.header("📝 Example Prompts")
        example_prompts = [
            "The weather today is",
            "I love programming because",
            "Artificial intelligence will",
            "In the future, technology",
            "Learning machine learning",
            "The cat sat on the",
            "My favorite book is",
            "Python programming is"
        ]
        
        selected_example = st.selectbox("Select an example:", [""] + example_prompts)
        
        # Educational resources
        st.header("📚 Learn More")
        st.markdown("""
        **Key Concepts:**
        - Tokenization
        - Embeddings
        - Attention Mechanisms
        - Feed Forward Networks
        - Transformer Architecture
        """)
        
        if st.button("🔄 Reset Demo"):
            st.rerun()
        
        return {
            'vocab_size': vocab_size,
            'd_model': d_model,
            'num_heads': num_heads,
            'num_layers': num_layers,
            'show_intermediate': show_intermediate,
            'show_attention_viz': show_attention_viz,
            'show_embeddings_viz': show_embeddings_viz,
            'temperature': temperature,
            'selected_example': selected_example
        }


def create_input_section(config):
    """Create the input section for text processing."""
    st.header("📝 Input Text")
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        text_input = st.text_area(
            "Enter text to process:",
            value=config['selected_example'] if config['selected_example'] else "The weather today is",
            height=120,
            placeholder="Type your text here... (e.g., 'The weather today is')"
        )
        
        process_button = st.button("🚀 Process with LLM", type="primary", use_container_width=True)
    
    with col2:
        st.subheader("📊 Input Stats")
        if text_input:
            st.metric("Characters", len(text_input))
            st.metric("Words", len(text_input.split()))
            st.metric("Lines", len(text_input.split('\n')))
        
        st.subheader("🔧 Model Info")
        st.metric("Model Dim", f"{config['d_model']}D")
        st.metric("Vocab Size", f"{config['vocab_size']:,}")
        st.metric("Attention Heads", config['num_heads'])
    
    return text_input, process_button


def process_step_1_tokenization(text_input, config):
    """Process step 1: Tokenization."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">1️⃣ Tokenization</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> The input text is broken down into smaller units called tokens. 
        This process converts human-readable text into a format that the model can understand and process.
    </div>
    """, unsafe_allow_html=True)
    
    # Create tokenizer and process text
    tokenizer = create_dynamic_tokenizer(text_input, vocab_size=config['vocab_size'])
    tokens = tokenizer.encode(text_input)
    tokens_info = tokenizer.visualize_tokenization(text_input)
    
    # Display original text
    st.write("**Original Text:**")
    st.code(text_input)
    
    # Explanation of what happens next
    st.info("""
    💡 **What's happening:** The tokenizer was trained specifically on your text plus common words. 
    Each piece of your text gets assigned a unique number (token ID). 
    These numbers are what the AI actually "sees" and processes!
    """)
    
    # Display token mapping
    st.write("**🔗 Text → Token Mapping:**")
    
    # Color coding for different token types
    colors = {
        'special': '#ff6b6b',
        'character': '#4ecdc4', 
        'subword': '#45b7d1',
        'word': '#96ceb4'
    }
    
    st.write("How your text is broken down:")
    
    # Filter out special tokens for display
    visible_tokens = [info for info in tokens_info if info['token_type'] != 'special']
    
    if visible_tokens:
        # Create a container for better control
        with st.container():
            # Display tokens in rows of 6 for better readability
            tokens_per_row = 6
            
            for row_start in range(0, len(visible_tokens), tokens_per_row):
                row_tokens = visible_tokens[row_start:row_start + tokens_per_row]
                cols = st.columns(len(row_tokens))
                
                for i, info in enumerate(row_tokens):
                    with cols[i]:
                        token_text = info['token_text']
                        token_id = info['token_id']
                        token_type = info['token_type']
                        color = colors.get(token_type, '#95a5a6')
                        
                        # Compact token display
                        st.markdown(f"""
                        <div style="
                            border: 2px solid {color}; 
                            border-radius: 8px; 
                            padding: 8px; 
                            margin: 4px 0; 
                            text-align: center;
                            min-height: 80px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                        ">
                            <div style="
                                background-color: {color}; 
                                color: white; 
                                padding: 4px; 
                                border-radius: 4px; 
                                font-weight: bold; 
                                font-size: 16px;
                                margin: -4px -4px 4px -4px;
                            ">
                                {token_id}
                            </div>
                            <div style="
                                font-size: 14px; 
                                word-break: break-word;
                                flex-grow: 1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                "{token_text}"
                            </div>
                            <div style="
                                font-size: 10px; 
                                color: #666; 
                                background-color: #f8f9fa;
                                padding: 2px;
                                border-radius: 2px;
                                margin: 4px -4px -4px -4px;
                            ">
                                {token_type}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
    
    # Improved legend
    st.markdown("**Token Type Legend:**")
    
    legend_items = [
        ('character', '🔤 Character/Letter'),
        ('subword', '🔸 Subword/Part'),
        ('word', '📝 Complete Word')
    ]
    
    # Create a horizontal legend with better spacing
    legend_container = st.container()
    with legend_container:
        st.markdown("""
        <div style="
            display: flex; 
            justify-content: space-around; 
            align-items: center;
            background-color: #f0f2f6;
            padding: 12px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #e1e5e9;
        ">
        """, unsafe_allow_html=True)
        
        for token_type, label in legend_items:
            color = colors[token_type]
            st.markdown(f"""
            <div style="
                display: flex; 
                align-items: center; 
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                background-color: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                margin: 0 5px;
                min-width: 150px;
                justify-content: center;
            ">
                <div style="
                    width: 20px; 
                    height: 20px; 
                    background-color: {color}; 
                    border-radius: 4px;
                    border: 1px solid rgba(0,0,0,0.1);
                "></div>
                <span style="
                    font-size: 14px; 
                    font-weight: 500;
                    color: #262730;
                ">{label}</span>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    # Show token sequence
    st.write("**📝 Complete Token Sequence (including special tokens):**")
    sequence_tokens = [str(token_id) for token_id in tokens]
    st.code(f"[{', '.join(sequence_tokens)}]")
    
    # Token statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Tokens", len(tokens))
    with col2:
        st.metric("Unique Tokens", len(set(tokens)))
    with col3:
        # Calculate average token length using token texts, not IDs
        token_texts = [info['token_text'] for info in tokens_info if info['token_type'] != 'special']
        avg_token_length = np.mean([len(token_text) for token_text in token_texts]) if token_texts else 0
        st.metric("Avg Token Length", f"{avg_token_length:.1f}")
    
    if config['show_intermediate']:
        with st.expander("🔍 Tokenization Details"):
            st.write("**Token-by-Token Breakdown:**")
            token_data = []
            for info in tokens_info:
                token_data.append({
                    'Position': info['position'],
                    'Token ID': info['token_id'],
                    'Token Text': info['token_text'],
                    'Length': len(info['token_text']),
                    'Type': info['token_type'].title()
                })
            
            df = pd.DataFrame(token_data)
            st.dataframe(df, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return tokens, tokenizer


def process_step_2_embeddings(tokens, tokenizer, config):
    """Process step 2: Token Embeddings."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">2️⃣ Token Embeddings</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> Each token is converted into a high-dimensional vector (embedding) 
        that captures its semantic meaning. Similar words have similar embeddings.
    </div>
    """, unsafe_allow_html=True)
    
    # Create embedding layer
    embedding_layer = create_sample_embedding_layer(
        vocab_size=config['vocab_size'],
        d_model=config['d_model']
    )
    
    # Convert tokens to IDs and create embeddings
    token_ids = [tokenizer.token_to_id.get(token, 0) for token in tokens]
    with torch.no_grad():
        token_tensor = torch.tensor(token_ids).unsqueeze(0)
        embeddings = embedding_layer(token_tensor)
    
    # Display embedding information
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Embedding Statistics:**")
        st.metric("Embedding Shape", f"{embeddings.shape}")
        st.metric("Dimensions per Token", config['d_model'])
        st.metric("Total Parameters", f"{config['vocab_size'] * config['d_model']:,}")
        
        # Show sample embedding values
        if len(tokens) > 0:
            sample_embedding = embeddings[0, 0, :8].numpy()
            st.write(f"**Sample embedding for '{tokens[0]}':**")
            embedding_html = ""
            for val in sample_embedding:
                color = "background: #4CAF50" if val > 0 else "background: #F44336"
                embedding_html += f'<span class="embedding-box" style="{color}; color: white;">{val:.2f}</span>'
            st.markdown(embedding_html, unsafe_allow_html=True)
    
    with col2:
        if config['show_embeddings_viz'] and len(tokens) > 1:
            # Create embedding visualization
            embedding_matrix = embeddings[0, :len(tokens), :min(20, config['d_model'])].numpy()
            
            fig = px.imshow(
                embedding_matrix,
                labels=dict(x="Embedding Dimension", y="Token Position", color="Value"),
                title="Token Embeddings Heatmap",
                color_continuous_scale="RdBu_r",
                aspect="auto"
            )
            
            # Add token labels
            fig.update_layout(
                yaxis=dict(
                    tickmode='array',
                    tickvals=list(range(len(tokens))),
                    ticktext=[f"{i}: {token}" for i, token in enumerate(tokens)]
                ),
                height=max(300, len(tokens) * 30)
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    if config['show_intermediate']:
        with st.expander("🔍 Embedding Analysis"):
            # Statistics for each token
            stats_data = []
            for i, token in enumerate(tokens):
                emb = embeddings[0, i, :].numpy()
                stats_data.append({
                    'Token': token,
                    'Mean': emb.mean(),
                    'Std': emb.std(),
                    'Min': emb.min(),
                    'Max': emb.max(),
                    'Norm': np.linalg.norm(emb)
                })
            
            df_stats = pd.DataFrame(stats_data)
            st.dataframe(df_stats, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return embeddings


def process_step_3_attention(embeddings, tokens, config):
    """Process step 3: Multi-Head Self-Attention."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">3️⃣ Multi-Head Self-Attention</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> The model learns to focus on different parts of the input 
        when processing each token. This allows it to understand relationships and context between words.
    </div>
    """, unsafe_allow_html=True)
    
    # Create attention layer
    attention_layer = create_sample_attention_layer(
        d_model=config['d_model'],
        num_heads=config['num_heads']
    )
    
    # Apply attention
    with torch.no_grad():
        attended_output, attention_weights = attention_layer(embeddings, embeddings, embeddings)
    
    # Display attention information
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Attention Statistics:**")
        st.metric("Output Shape", f"{attended_output.shape}")
        st.metric("Number of Heads", config['num_heads'])
        st.metric("Attention Weights Shape", f"{attention_weights.shape}")
        
        # Attention statistics
        avg_attention = attention_weights.mean().item()
        max_attention = attention_weights.max().item()
        min_attention = attention_weights.min().item()
        
        st.metric("Average Attention", f"{avg_attention:.3f}")
        st.metric("Max Attention", f"{max_attention:.3f}")
        st.metric("Min Attention", f"{min_attention:.3f}")
    
    with col2:
        if config['show_attention_viz'] and len(tokens) > 1:
            # Create attention visualization
            attention_matrix = attention_weights[0, 0, :len(tokens), :len(tokens)].numpy()
            
            fig = go.Figure(data=go.Heatmap(
                z=attention_matrix,
                x=tokens,
                y=tokens,
                colorscale='Blues',
                text=np.round(attention_matrix, 3),
                texttemplate="%{text}",
                textfont={"size": 10},
                hoverongaps=False
            ))
            
            fig.update_layout(
                title="Attention Weights (Head 1)",
                xaxis_title="Keys (What we attend to)",
                yaxis_title="Queries (What is attending)",
                height=400,
                width=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    if config['show_intermediate']:
        with st.expander("🔍 Attention Analysis"):
            # Show attention for each head
            st.write("**Attention Patterns by Head:**")
            
            head_tabs = st.tabs([f"Head {i+1}" for i in range(min(4, config['num_heads']))])
            
            for i, tab in enumerate(head_tabs):
                with tab:
                    if i < config['num_heads']:
                        head_attention = attention_weights[0, i, :len(tokens), :len(tokens)].numpy()
                        
                        # Create attention heatmap for this head
                        fig = px.imshow(
                            head_attention,
                            labels=dict(x="Keys", y="Queries", color="Attention"),
                            title=f"Head {i+1} Attention Pattern",
                            color_continuous_scale="Blues"
                        )
                        
                        fig.update_layout(
                            xaxis=dict(tickmode='array', tickvals=list(range(len(tokens))), ticktext=tokens),
                            yaxis=dict(tickmode='array', tickvals=list(range(len(tokens))), ticktext=tokens),
                            height=300
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                        
                        # Show most attended pairs
                        st.write(f"**Top attention pairs for Head {i+1}:**")
                        attention_pairs = []
                        for q_idx in range(len(tokens)):
                            for k_idx in range(len(tokens)):
                                if q_idx != k_idx:  # Skip self-attention
                                    attention_pairs.append({
                                        'Query': tokens[q_idx],
                                        'Key': tokens[k_idx],
                                        'Attention': head_attention[q_idx, k_idx]
                                    })
                        
                        df_pairs = pd.DataFrame(attention_pairs)
                        df_pairs = df_pairs.nlargest(5, 'Attention')
                        st.dataframe(df_pairs, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return attended_output, attention_weights


def process_step_4_feedforward(attended_output, tokens, config):
    """Process step 4: Feed Forward Network."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">4️⃣ Feed Forward Network</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> A feed-forward neural network processes each position 
        independently, applying non-linear transformations to create richer representations.
    </div>
    """, unsafe_allow_html=True)
    
    # Create feed forward layer
    ff_layer = create_sample_feedforward_layer(
        d_model=config['d_model'],
        d_ff=config['d_model'] * 4  # Common practice: 4x the model dimension
    )
    
    # Apply feed forward
    with torch.no_grad():
        ff_output = ff_layer(attended_output)
    
    # Display feed forward information
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Feed Forward Statistics:**")
        st.metric("Input Shape", f"{attended_output.shape}")
        st.metric("Output Shape", f"{ff_output.shape}")
        st.metric("Hidden Size", f"{config['d_model'] * 4}")
        
        # Activation statistics
        mean_activation = ff_output.mean().item()
        std_activation = ff_output.std().item()
        max_activation = ff_output.max().item()
        min_activation = ff_output.min().item()
        
        st.metric("Mean Activation", f"{mean_activation:.3f}")
        st.metric("Std Activation", f"{std_activation:.3f}")
        st.metric("Max Activation", f"{max_activation:.3f}")
        st.metric("Min Activation", f"{min_activation:.3f}")
    
    with col2:
        # Show activation distribution
        activations = ff_output[0].flatten().numpy()
        fig = px.histogram(
            activations,
            nbins=50,
            title="Feed Forward Activation Distribution",
            labels={'value': 'Activation Value', 'count': 'Frequency'}
        )
        fig.add_vline(x=activations.mean(), line_dash="dash", line_color="red", 
                     annotation_text="Mean")
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
    
    if config['show_intermediate']:
        with st.expander("🔍 Feed Forward Analysis"):
            # Show activations for each token
            st.write("**Per-Token Activation Statistics:**")
            
            token_stats = []
            for i, token in enumerate(tokens):
                if i < ff_output.shape[1]:
                    token_activations = ff_output[0, i, :].numpy()
                    token_stats.append({
                        'Token': token,
                        'Mean': token_activations.mean(),
                        'Std': token_activations.std(),
                        'Max': token_activations.max(),
                        'Min': token_activations.min(),
                        'Positive %': (token_activations > 0).mean() * 100
                    })
            
            df_token_stats = pd.DataFrame(token_stats)
            st.dataframe(df_token_stats, use_container_width=True)
            
            # Activation heatmap
            st.write("**Activation Heatmap:**")
            activation_matrix = ff_output[0, :len(tokens), :min(20, config['d_model'])].numpy()
            
            fig = px.imshow(
                activation_matrix,
                labels=dict(x="Feature Dimension", y="Token Position", color="Activation"),
                title="Feed Forward Activations",
                color_continuous_scale="RdBu_r"
            )
            
            fig.update_layout(
                yaxis=dict(
                    tickmode='array',
                    tickvals=list(range(len(tokens))),
                    ticktext=[f"{i}: {token}" for i, token in enumerate(tokens)]
                ),
                height=max(300, len(tokens) * 30)
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return ff_output


def process_step_5_transformer(embeddings, tokens, config):
    """Process step 5: Complete Transformer Block."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">5️⃣ Complete Transformer Block</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> A complete transformer block combines attention and feed-forward 
        networks with residual connections and layer normalization for stable training.
    </div>
    """, unsafe_allow_html=True)
    
    # Create transformer block
    transformer_block = TransformerBlock(
        d_model=config['d_model'],
        num_heads=config['num_heads'],
        d_ff=config['d_model'] * 4
    )
    
    # Apply transformer block
    with torch.no_grad():
        transformer_output, attention_weights = transformer_block(embeddings)
    
    # Display transformer information
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Transformer Block Statistics:**")
        st.metric("Input Shape", f"{embeddings.shape}")
        st.metric("Output Shape", f"{transformer_output.shape}")
        
        # Compare input vs output
        input_norm = torch.norm(embeddings).item()
        output_norm = torch.norm(transformer_output).item()
        
        st.metric("Input Norm", f"{input_norm:.3f}")
        st.metric("Output Norm", f"{output_norm:.3f}")
        st.metric("Norm Ratio", f"{output_norm/input_norm:.3f}")
        
        # Output statistics
        mean_output = transformer_output.mean().item()
        std_output = transformer_output.std().item()
        
        st.metric("Mean Output", f"{mean_output:.3f}")
        st.metric("Std Output", f"{std_output:.3f}")
    
    with col2:
        # Show layer-wise processing simulation
        st.write("**Multi-Layer Processing:**")
        
        layers_data = []
        current_input = embeddings
        
        for i in range(config['num_layers']):
            with torch.no_grad():
                current_output, _ = transformer_block(current_input)
                
                layers_data.append({
                    'Layer': f'Layer {i+1}',
                    'Input Norm': torch.norm(current_input).item(),
                    'Output Norm': torch.norm(current_output).item(),
                    'Mean': current_output.mean().item(),
                    'Std': current_output.std().item()
                })
                
                current_input = current_output
        
        df_layers = pd.DataFrame(layers_data)
        
        # Plot layer-wise norms
        fig = px.line(
            df_layers, 
            x='Layer', 
            y=['Input Norm', 'Output Norm'], 
            title="Layer-wise Representation Norms",
            markers=True
        )
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
    
    if config['show_intermediate']:
        with st.expander("🔍 Transformer Analysis"):
            # Show detailed layer statistics
            st.write("**Layer-by-Layer Statistics:**")
            st.dataframe(df_layers, use_container_width=True)
            
            # Compare representations
            st.write("**Representation Comparison:**")
            
            # Calculate cosine similarity between input and output
            input_flat = embeddings.flatten()
            output_flat = transformer_output.flatten()
            
            cos_sim = torch.cosine_similarity(input_flat.unsqueeze(0), output_flat.unsqueeze(0))
            
            st.metric("Cosine Similarity (Input vs Output)", f"{cos_sim.item():.3f}")
            
            # Show change in representation for each token
            st.write("**Per-Token Representation Changes:**")
            
            token_changes = []
            for i, token in enumerate(tokens):
                if i < transformer_output.shape[1]:
                    input_vec = embeddings[0, i, :]
                    output_vec = transformer_output[0, i, :]
                    
                    change_norm = torch.norm(output_vec - input_vec).item()
                    cos_sim_token = torch.cosine_similarity(input_vec.unsqueeze(0), output_vec.unsqueeze(0)).item()
                    
                    token_changes.append({
                        'Token': token,
                        'Change Norm': change_norm,
                        'Cosine Similarity': cos_sim_token,
                        'Input Norm': torch.norm(input_vec).item(),
                        'Output Norm': torch.norm(output_vec).item()
                    })
            
            df_changes = pd.DataFrame(token_changes)
            st.dataframe(df_changes, use_container_width=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return transformer_output


def process_step_6_prediction(transformer_output, tokens, config):
    """Process step 6: Next Word Prediction."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">6️⃣ Next Word Prediction</div>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="explanation-text">
        <strong>How it works:</strong> The final hidden state is projected to the vocabulary size 
        and converted to probabilities using softmax. This gives us the likelihood of each possible next word.
    </div>
    """, unsafe_allow_html=True)
    
    # Create output projection layer
    with torch.no_grad():
        output_projection = torch.nn.Linear(config['d_model'], config['vocab_size'])
        
        # Get the last token's representation
        last_token_repr = transformer_output[0, -1, :]
        
        # Project to vocabulary
        logits = output_projection(last_token_repr)
        
        # Apply temperature scaling
        logits = logits / config['temperature']
        
        # Convert to probabilities
        probabilities = torch.softmax(logits, dim=-1)
        
        # Get top predictions
        top_probs, top_indices = torch.topk(probabilities, k=20)
    
    # Create sample vocabulary for demonstration
    sample_vocabulary = [
        'very', 'really', 'quite', 'extremely', 'rather', 'pretty', 'fairly', 'truly',
        'cold', 'hot', 'warm', 'cool', 'nice', 'beautiful', 'sunny', 'rainy',
        'good', 'bad', 'great', 'wonderful', 'terrible', 'amazing', 'awful', 'perfect',
        'going', 'coming', 'looking', 'getting', 'becoming', 'feeling', 'seeming', 'turning',
        'to', 'be', 'and', 'or', 'but', 'so', 'if', 'when', 'where', 'how', 'why', 'what',
        'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her'
    ]
    
    # Create predictions data
    predictions_data = []
    for i in range(min(10, len(top_probs))):
        word = sample_vocabulary[i % len(sample_vocabulary)]
        probability = top_probs[i].item()
        
        # Determine confidence level
        if probability > 0.15:
            confidence = 'High'
            conf_color = '#4CAF50'
        elif probability > 0.08:
            confidence = 'Medium'
            conf_color = '#FF9800'
        else:
            confidence = 'Low'
            conf_color = '#F44336'
        
        predictions_data.append({
            'Rank': i + 1,
            'Word': word,
            'Probability': probability,
            'Percentage': f"{probability * 100:.1f}%",
            'Confidence': confidence,
            'Color': conf_color
        })
    
    # Display predictions
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Top 10 Predictions:**")
        
        # Create prediction boxes
        pred_html = ""
        for pred in predictions_data:
            pred_html += f"""
            <div class="prediction-box" style="background: {pred['Color']}; color: white;">
                <strong>#{pred['Rank']}: {pred['Word']}</strong><br>
                {pred['Percentage']} ({pred['Confidence']})
            </div>
            """
        
        st.markdown(pred_html, unsafe_allow_html=True)
        
        # Show prediction statistics
        st.write("**Prediction Statistics:**")
        st.metric("Top Prediction", f"{predictions_data[0]['Word']} ({predictions_data[0]['Percentage']})")
        st.metric("Total Probability (Top 10)", f"{sum(p['Probability'] for p in predictions_data) * 100:.1f}%")
        
        # Calculate entropy
        entropy = -(probabilities * torch.log(probabilities + 1e-10)).sum().item()
        st.metric("Prediction Entropy", f"{entropy:.2f}")
    
    with col2:
        # Create prediction probability chart
        df_predictions = pd.DataFrame(predictions_data)
        
        fig = px.bar(
            df_predictions.head(8),
            x='Word',
            y='Probability',
            title="Top 8 Predictions",
            color='Confidence',
            color_discrete_map={'High': '#4CAF50', 'Medium': '#FF9800', 'Low': '#F44336'}
        )
        
        fig.update_layout(
            height=400,
            xaxis_title="Predicted Words",
            yaxis_title="Probability",
            xaxis_tickangle=-45
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    if config['show_intermediate']:
        with st.expander("🔍 Prediction Analysis"):
            # Show detailed prediction table
            st.write("**Detailed Predictions:**")
            st.dataframe(df_predictions, use_container_width=True)
            
            # Show logits vs probabilities
            st.write("**Logits vs Probabilities (Top 10):**")
            
            logits_data = []
            for i, pred in enumerate(predictions_data):
                logits_data.append({
                    'Word': pred['Word'],
                    'Logit': logits[top_indices[i]].item(),
                    'Probability': pred['Probability'],
                    'Log Probability': np.log(pred['Probability'])
                })
            
            df_logits = pd.DataFrame(logits_data)
            st.dataframe(df_logits, use_container_width=True)
            
            # Probability distribution visualization
            st.write("**Probability Distribution:**")
            
            fig = px.histogram(
                probabilities.numpy(),
                nbins=50,
                title="Full Vocabulary Probability Distribution",
                labels={'value': 'Probability', 'count': 'Number of Words'}
            )
            fig.add_vline(x=probabilities.mean().item(), line_dash="dash", line_color="red", 
                         annotation_text="Mean")
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
            
            # Temperature effect explanation
            st.write("**Temperature Effect:**")
            st.markdown(f"""
            - **Current Temperature:** {config['temperature']}
            - **Lower temperature (< 1.0):** More focused, deterministic predictions
            - **Higher temperature (> 1.0):** More diverse, creative predictions
            - **Temperature = 1.0:** Standard softmax distribution
            """)
    
    st.markdown('</div>', unsafe_allow_html=True)
    return predictions_data


def create_processing_summary(tokens, config, predictions_data):
    """Create a summary of the entire processing pipeline."""
    st.header("📈 Processing Summary")
    
    # Create summary metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Input Tokens", len(tokens))
    
    with col2:
        st.metric("Model Dimension", f"{config['d_model']}D")
    
    with col3:
        st.metric("Attention Heads", config['num_heads'])
    
    with col4:
        # Calculate approximate parameter count
        vocab_params = config['vocab_size'] * config['d_model']
        attention_params = config['d_model'] * config['d_model'] * 4 * config['num_heads']  # Q, K, V, O
        ff_params = config['d_model'] * config['d_model'] * 4 * 2  # Two linear layers
        total_params = vocab_params + attention_params + ff_params
        
        st.metric("Total Parameters", f"{total_params:,}")
    
    # Create pipeline flow diagram
    st.subheader("🔄 Processing Pipeline")
    
    pipeline_steps = [
        "📝 Input Text",
        "🔤 Tokenization",
        "🧮 Embeddings",
        "👁️ Attention",
        "🧠 Feed Forward",
        "🏗️ Transformer",
        "🎯 Prediction"
    ]
    
    pipeline_html = ""
    for i, step in enumerate(pipeline_steps):
        if i < len(pipeline_steps) - 1:
            pipeline_html += f"""
            <div style="display: inline-block; margin: 10px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; border-radius: 10px; font-weight: bold;">
                {step}
            </div>
            <div style="display: inline-block; margin: 0 10px; font-size: 24px; color: #667eea;">→</div>
            """
        else:
            pipeline_html += f"""
            <div style="display: inline-block; margin: 10px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; border-radius: 10px; font-weight: bold;">
                {step}
            </div>
            """
    
    st.markdown(pipeline_html, unsafe_allow_html=True)
    
    # Show best prediction
    if predictions_data:
        st.subheader("🏆 Best Prediction")
        best_pred = predictions_data[0]
        
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                    color: white; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
            <h3>Next Word: "{best_pred['Word']}"</h3>
            <p style="font-size: 18px;">Confidence: {best_pred['Percentage']} ({best_pred['Confidence']})</p>
        </div>
        """, unsafe_allow_html=True)


def create_educational_section():
    """Create an educational section with key concepts."""
    st.header("🎓 Educational Insights")
    
    # Create tabs for different educational content
    tab1, tab2, tab3, tab4 = st.tabs(["🧠 Key Concepts", "🔧 Architecture", "📊 Mathematics", "🚀 Applications"])
    
    with tab1:
        st.subheader("Understanding Transformer Components")
        
        st.markdown("""
        **🔤 Tokenization**
        - Breaks text into manageable units (tokens)
        - Each token represents a word, subword, or character
        - Enables the model to process variable-length text
        
        **🧮 Embeddings**
        - Convert discrete tokens into continuous vectors
        - Capture semantic meaning and relationships
        - Learned during training to represent language patterns
        
        **👁️ Attention**
        - Allows the model to focus on relevant parts of the input
        - Computes relationships between all pairs of tokens
        - Multi-head attention provides different perspectives
        
        **🧠 Feed Forward**
        - Processes each position independently
        - Applies non-linear transformations
        - Increases model capacity and expressiveness
        
        **🏗️ Transformer Blocks**
        - Combine attention and feed-forward layers
        - Use residual connections and layer normalization
        - Stack multiple blocks for deeper understanding
        """)
    
    with tab2:
        st.subheader("Transformer Architecture")
        
        st.markdown("""
        **Layer Structure:**
        ```
        Input Text
            ↓
        Tokenization
            ↓
        Token Embeddings + Positional Encoding
            ↓
        ┌─────────────────────────────────────┐
        │  Transformer Block 1                │
        │  ┌─────────────────────────────────┐│
        │  │ Multi-Head Self-Attention       ││
        │  │ + Residual Connection           ││
        │  │ + Layer Normalization          ││
        │  └─────────────────────────────────┘│
        │  ┌─────────────────────────────────┐│
        │  │ Feed Forward Network           ││
        │  │ + Residual Connection           ││
        │  │ + Layer Normalization          ││
        │  └─────────────────────────────────┘│
        └─────────────────────────────────────┘
            ↓
        [Repeat for multiple layers]
            ↓
        Linear Projection to Vocabulary
            ↓
        Softmax → Probabilities
            ↓
        Next Word Prediction
        ```
        """)
    
    with tab3:
        st.subheader("Mathematical Foundations")
        
        st.markdown("""
        **Attention Mechanism:**
        
        `Attention(Q, K, V) = softmax(QK^T / √d_k)V`
        
        Where:
        - Q (Query): What we're looking for
        - K (Key): What we're comparing against  
        - V (Value): What we actually use
        - d_k: Dimension of key vectors (for scaling)
        
        **Multi-Head Attention:**
        
        `MultiHead(Q, K, V) = Concat(head_1, ..., head_h)W^O`
        
        Where each head computes attention independently.
        
        **Feed Forward Network:**
        
        `FFN(x) = max(0, xW_1 + b_1)W_2 + b_2`
        
        Or with GELU activation:
        
        `FFN(x) = GELU(xW_1 + b_1)W_2 + b_2`
        
        **Layer Normalization:**
        
        `LayerNorm(x) = γ * (x - μ) / σ + β`
        
        Where μ and σ are mean and standard deviation across features.
        """)
    
    with tab4:
        st.subheader("Real-World Applications")
        
        st.markdown("""
        **Natural Language Processing:**
        - Text generation and completion
        - Language translation
        - Question answering
        - Summarization
        - Sentiment analysis
        
        **Code Generation:**
        - Code completion and suggestion
        - Bug fixing and code review
        - Documentation generation
        - Code explanation and tutoring
        
        **Creative Applications:**
        - Story and poetry generation
        - Content creation and marketing
        - Dialogue systems and chatbots
        - Educational tutoring
        
        **Research and Analysis:**
        - Literature review and research
        - Data analysis and insights
        - Report generation
        - Scientific writing assistance
        
        **Popular Models:**
        - GPT (Generative Pre-trained Transformer)
        - BERT (Bidirectional Encoder Representations)
        - T5 (Text-to-Text Transfer Transformer)
        - PaLM (Pathways Language Model)
        - LLaMA (Large Language Model Meta AI)
        """)


def main():
    """Main Streamlit application."""
    st.set_page_config(
        page_title="LLM Educational Demo - AI Zero To Hero",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Apply custom styling
    apply_custom_styling()
    
    # Create header
    create_header()
    
    # Create sidebar and get configuration
    config = create_sidebar()
    
    # Create input section
    text_input, process_button = create_input_section(config)
    
    # Main processing
    if process_button and text_input.strip():
        try:
            # Create progress tracking
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            # Step 1: Tokenization
            status_text.text("🔤 Step 1: Tokenizing input...")
            progress_bar.progress(10)
            tokens, tokenizer = process_step_1_tokenization(text_input, config)
            
            # Step 2: Embeddings
            status_text.text("🧮 Step 2: Creating embeddings...")
            progress_bar.progress(25)
            embeddings = process_step_2_embeddings(tokens, tokenizer, config)
            
            # Step 3: Attention
            status_text.text("👁️ Step 3: Computing attention...")
            progress_bar.progress(40)
            attended_output, attention_weights = process_step_3_attention(embeddings, tokens, config)
            
            # Step 4: Feed Forward
            status_text.text("🧠 Step 4: Feed forward processing...")
            progress_bar.progress(60)
            ff_output = process_step_4_feedforward(attended_output, tokens, config)
            
            # Step 5: Transformer
            status_text.text("🏗️ Step 5: Running transformer...")
            progress_bar.progress(80)
            transformer_output = process_step_5_transformer(embeddings, tokens, config)
            
            # Step 6: Prediction
            status_text.text("🎯 Step 6: Generating predictions...")
            progress_bar.progress(95)
            predictions_data = process_step_6_prediction(transformer_output, tokens, config)
            
            # Complete processing
            status_text.text("✅ Processing complete!")
            progress_bar.progress(100)
            
            # Create summary
            create_processing_summary(tokens, config, predictions_data)
            
        except Exception as e:
            st.error(f"An error occurred during processing: {str(e)}")
            st.exception(e)
    
    elif process_button and not text_input.strip():
        st.warning("Please enter some text to process!")
    
    # Always show educational section
    create_educational_section()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 20px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                color: white; border-radius: 10px; margin-top: 30px;">
        <h3>🤖 AI Zero To Hero</h3>
        <p>Educational LLM Demo built with PyTorch and Streamlit</p>
        <p>Learn • Explore • Understand</p>
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
