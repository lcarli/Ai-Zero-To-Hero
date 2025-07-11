"""
Streamlit web application for educational LLM demonstration.

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

# Import our custom modules
from src.tokenization import BPETokenizer, create_sample_tokenizer
from src.embeddings import create_sample_embedding_layer
from src.attention import create_sample_attention_layer, AttentionVisualizer
from src.feedforward import create_sample_feedforward_layer
from src.transformer import create_sample_transformer
from src.utils import (
    calculate_representation_statistics,
    create_model_architecture_diagram,
    create_educational_summary
)


def main():
    """Main Streamlit application."""
    st.set_page_config(
        page_title="LLM Educational Demo",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    st.title("🤖 Large Language Model Educational Demo")
    st.markdown("### Interactive exploration of transformer-based language models")
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # Model parameters
        st.subheader("Model Parameters")
        vocab_size = st.slider("Vocabulary Size", 500, 2000, 1000, 100)
        d_model = st.slider("Model Dimension", 128, 1024, 256, 64)
        num_heads = st.selectbox("Attention Heads", [4, 8, 12, 16], index=1)
        num_layers = st.slider("Number of Layers", 3, 12, 6, 1)
        
        # Demo options
        st.subheader("Demo Options")
        show_all_steps = st.checkbox("Show All Steps", value=True)
        interactive_mode = st.checkbox("Interactive Mode", value=True)
        detailed_explanations = st.checkbox("Detailed Explanations", value=True)
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("📝 Input Text")
        
        # Predefined examples
        examples = {
            "Simple": "I love programming because",
            "Technical": "Artificial intelligence will revolutionize",
            "Creative": "The weather today is perfect for",
            "Custom": ""
        }
        
        selected_example = st.selectbox("Choose an example or enter custom text:", 
                                      list(examples.keys()))
        
        if selected_example == "Custom":
            input_text = st.text_input("Enter your text:", 
                                     placeholder="Type your incomplete sentence here...")
        else:
            input_text = st.text_input("Enter your text:", 
                                     value=examples[selected_example])
        
        if st.button("🚀 Process with LLM", type="primary"):
            if input_text.strip():
                process_text_with_llm(input_text, vocab_size, d_model, num_heads, 
                                    num_layers, show_all_steps, detailed_explanations)
            else:
                st.warning("Please enter some text to process!")
    
    with col2:
        st.header("ℹ️ About This Demo")
        st.markdown("""
        This interactive demo shows how Large Language Models (LLMs) process text:
        
        **🔸 What you'll learn:**
        - How text becomes tokens
        - How tokens become vectors
        - How attention works
        - How transformers process sequences
        - How models predict next words
        
        **🔸 How to use:**
        1. Choose or enter text
        2. Adjust model parameters
        3. Click "Process with LLM"
        4. Explore each step
        
        **🔸 Educational focus:**
        This is a simplified but accurate representation of how real LLMs like GPT work.
        """)


def process_text_with_llm(text: str, vocab_size: int, d_model: int, num_heads: int,
                         num_layers: int, show_all_steps: bool, detailed_explanations: bool):
    """Process text through the complete LLM pipeline."""
    
    with st.spinner("🔄 Processing text through LLM pipeline..."):
        try:
            # Step 1: Tokenization
            tokenizer = create_sample_tokenizer()
            tokens_info = tokenizer.visualize_tokenization(text)
            
            if show_all_steps:
                display_tokenization_step(tokens_info, detailed_explanations)
            
            # Step 2: Embeddings
            token_ids = torch.tensor([[token['token_id'] for token in tokens_info]])
            token_texts = [token['token_text'] for token in tokens_info]
            
            embedding_layer = create_sample_embedding_layer(vocab_size, d_model)
            embedding_viz = embedding_layer.visualize_embeddings(token_ids, token_texts)
            
            if show_all_steps:
                display_embeddings_step(embedding_viz, detailed_explanations)
            
            # Step 3: Attention
            attention_layer = create_sample_attention_layer(d_model, num_heads)
            embeddings = embedding_layer(token_ids)
            attention_viz = attention_layer.visualize_attention(embeddings, embeddings, 
                                                              embeddings, token_texts)
            
            if show_all_steps:
                display_attention_step(attention_viz, detailed_explanations)
            
            # Step 4: Feed-Forward
            ff_layer = create_sample_feedforward_layer(d_model, d_model * 4)
            ff_viz = ff_layer.visualize_activations(embeddings, token_texts)
            
            if show_all_steps:
                display_feedforward_step(ff_viz, detailed_explanations)
            
            # Step 5: Complete Transformer
            model = create_sample_transformer(vocab_size)
            model_outputs = model(token_ids, return_attention=True)
            
            display_transformer_step(model_outputs, token_texts, detailed_explanations)
            
            # Step 6: Final Predictions
            display_predictions_step(model, token_ids, token_texts, text, detailed_explanations)
            
            # Educational Summary
            if detailed_explanations:
                display_educational_summary(model_outputs, token_texts, model)
                
        except Exception as e:
            st.error(f"Error processing text: {str(e)}")
            st.info("Try adjusting the model parameters or using simpler text.")


def display_tokenization_step(tokens_info: List[Dict], detailed: bool):
    """Display tokenization step results."""
    st.header("🔤 Step 1: Tokenization")
    
    if detailed:
        st.markdown("""
        **How it works:** The input text is broken down into tokens using BPE (Byte Pair Encoding).
        Each token gets a unique numerical ID that the model can process.
        """)
    
    # Create tokenization visualization
    df = pd.DataFrame(tokens_info)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Token Sequence")
        for i, token_info in enumerate(tokens_info):
            token_type = token_info['token_type']
            if token_type == 'special':
                st.markdown(f"**{i}:** `{token_info['token_text']}` (ID: {token_info['token_id']}) - *{token_type}*")
            else:
                st.markdown(f"**{i}:** `{token_info['token_text']}` (ID: {token_info['token_id']}) - {token_type}")
    
    with col2:
        st.subheader("Token Statistics")
        token_types = df['token_type'].value_counts()
        fig = px.pie(values=token_types.values, names=token_types.index, 
                    title="Token Type Distribution")
        st.plotly_chart(fig, use_container_width=True)


def display_embeddings_step(embedding_viz: Dict, detailed: bool):
    """Display embeddings step results."""
    st.header("🧮 Step 2: Token Embeddings & Positional Encoding")
    
    if detailed:
        st.markdown("""
        **How it works:** Each token ID is converted to a dense vector representation.
        Positional encoding is added to give the model information about token positions.
        """)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Embedding Visualization")
        
        # Show embedding dimensions for first few tokens
        for i, token in enumerate(embedding_viz['tokens'][:5]):
            embedding = embedding_viz['final_embeddings'][i]
            magnitude = np.linalg.norm(embedding)
            st.markdown(f"**{token}:** magnitude = {magnitude:.3f}")
        
        # Plot embedding magnitudes
        magnitudes = [np.linalg.norm(embedding_viz['final_embeddings'][i]) 
                     for i in range(len(embedding_viz['tokens']))]
        
        fig = go.Figure(data=go.Bar(x=embedding_viz['tokens'], y=magnitudes))
        fig.update_layout(title="Token Embedding Magnitudes",
                         xaxis_title="Tokens", yaxis_title="Magnitude")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Positional Encoding Patterns")
        
        # Show positional encoding heatmap
        pos_enc = embedding_viz['positional_encodings'][:, :32]  # First 32 dimensions
        
        fig = go.Figure(data=go.Heatmap(z=pos_enc.T, 
                                       x=list(range(len(embedding_viz['tokens']))),
                                       y=list(range(32)),
                                       colorscale='RdBu'))
        fig.update_layout(title="Positional Encoding (First 32 Dims)",
                         xaxis_title="Position", yaxis_title="Dimension")
        st.plotly_chart(fig, use_container_width=True)


def display_attention_step(attention_viz: Dict, detailed: bool):
    """Display attention step results."""
    st.header("👁️ Step 3: Multi-Head Self-Attention")
    
    if detailed:
        st.markdown("""
        **How it works:** The model computes attention weights to determine how much
        each token should "attend to" every other token in the sequence.
        """)
    
    # Head selection
    selected_head = st.selectbox("Select attention head to visualize:", 
                               range(attention_viz['num_heads']),
                               format_func=lambda x: f"Head {x + 1}")
    
    head_data = attention_viz['head_data'][selected_head]
    attention_matrix = head_data['attention_matrix']
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader(f"Attention Heatmap - Head {selected_head + 1}")
        
        fig = go.Figure(data=go.Heatmap(z=attention_matrix,
                                       x=attention_viz['tokens'],
                                       y=attention_viz['tokens'],
                                       colorscale='Blues'))
        fig.update_layout(title=f"Head {selected_head + 1}: {head_data['description']}",
                         xaxis_title="Key (Attended To)",
                         yaxis_title="Query (Attending From)")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Attention Pattern Analysis")
        
        # Analyze attention patterns
        patterns = AttentionVisualizer.analyze_attention_patterns(
            attention_matrix, attention_viz['tokens'])
        
        st.markdown(f"**Self-attention rate:** {patterns['self_attention_rate']:.3f}")
        st.markdown(f"**Forward attention rate:** {patterns['forward_attention_rate']:.3f}")
        st.markdown(f"**Backward attention rate:** {patterns['backward_attention_rate']:.3f}")
        st.markdown(f"**Most attended token:** {patterns['most_attended_token']}")
        st.markdown(f"**Distribution type:** {patterns['attention_distribution']}")
        
        # Show attention weights for each position
        avg_attention = np.mean(attention_matrix, axis=0)
        fig = go.Figure(data=go.Bar(x=attention_viz['tokens'], y=avg_attention))
        fig.update_layout(title="Average Attention Received",
                         xaxis_title="Tokens", yaxis_title="Average Attention")
        st.plotly_chart(fig, use_container_width=True)


def display_feedforward_step(ff_viz: Dict, detailed: bool):
    """Display feed-forward step results."""
    st.header("🧠 Step 4: Feed-Forward Network")
    
    if detailed:
        st.markdown("""
        **How it works:** Each token representation is processed through a two-layer
        neural network with GELU activation, expanding and then compressing the representation.
        """)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Network Architecture")
        st.markdown(f"**Input dimension:** {ff_viz['input_shape'][1]}")
        st.markdown(f"**Hidden dimension:** {ff_viz['hidden1_shape'][1]} (×{ff_viz['expansion_ratio']:.1f})")
        st.markdown(f"**Output dimension:** {ff_viz['output_shape'][1]}")
        
        # Show activation statistics
        stages = ['input', 'hidden1', 'hidden2', 'output']
        stage_names = ['Input', 'After Linear 1', 'After GELU', 'Output']
        
        stats_data = []
        for stage, name in zip(stages, stage_names):
            stats = ff_viz[f'{stage}_stats']
            stats_data.append({
                'Stage': name,
                'Mean': stats['mean'],
                'Std': stats['std'],
                'Positive Ratio': stats['positive_ratio']
            })
        
        df_stats = pd.DataFrame(stats_data)
        st.dataframe(df_stats, use_container_width=True)
    
    with col2:
        st.subheader("Activation Patterns")
        
        # Plot magnitude changes through the network
        magnitudes = []
        for stage in stages:
            activations = ff_viz[f'{stage}_activations']
            magnitude = [np.linalg.norm(activations[i]) for i in range(len(ff_viz['tokens']))]
            magnitudes.append(magnitude)
        
        fig = go.Figure()
        for i, (stage, name) in enumerate(zip(stages, stage_names)):
            fig.add_trace(go.Scatter(x=ff_viz['tokens'], y=magnitudes[i],
                                   mode='lines+markers', name=name))
        
        fig.update_layout(title="Representation Magnitude Through Network",
                         xaxis_title="Tokens", yaxis_title="Magnitude")
        st.plotly_chart(fig, use_container_width=True)


def display_transformer_step(model_outputs: Dict, token_texts: List[str], detailed: bool):
    """Display complete transformer processing."""
    st.header("🏗️ Step 5: Complete Transformer Processing")
    
    if detailed:
        st.markdown("""
        **How it works:** Multiple transformer blocks (attention + feed-forward) are stacked
        to create increasingly sophisticated representations of the input sequence.
        """)
    
    # Show layer-by-layer processing
    layer_outputs = model_outputs['layer_outputs']
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Layer-by-Layer Magnitudes")
        
        # Calculate magnitudes for each layer and token
        layer_magnitudes = []
        for layer_idx, layer_output in enumerate(layer_outputs):
            layer_output_np = layer_output[0].detach().cpu().numpy()  # First batch item
            magnitudes = [np.linalg.norm(layer_output_np[i]) for i in range(len(token_texts))]
            layer_magnitudes.append(magnitudes)
        
        # Create line plot
        fig = go.Figure()
        for token_idx, token in enumerate(token_texts):
            token_mags = [layer_magnitudes[layer][token_idx] for layer in range(len(layer_outputs))]
            fig.add_trace(go.Scatter(x=list(range(len(layer_outputs))), y=token_mags,
                                   mode='lines+markers', name=token))
        
        fig.update_layout(title="Token Representation Magnitudes Across Layers",
                         xaxis_title="Layer", yaxis_title="Magnitude")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Final Layer Output")
        
        final_output = model_outputs['last_hidden_state'][0].detach().cpu().numpy()
        
        # Show final representation statistics
        for i, token in enumerate(token_texts):
            stats = calculate_representation_statistics(final_output[i])
            st.markdown(f"**{token}:** magnitude = {stats['magnitude']:.3f}")


def display_predictions_step(model, token_ids: torch.Tensor, token_texts: List[str], 
                           original_text: str, detailed: bool):
    """Display final predictions step."""
    st.header("🎯 Step 6: Next Word Prediction")
    
    if detailed:
        st.markdown("""
        **How it works:** The final hidden state is projected to vocabulary size
        and softmax is applied to get probabilities for each possible next token.
        """)
    
    # Generate predictions
    probs = model.generate_next_token_probabilities(token_ids)
    top_probs, top_indices = torch.topk(probs[0], 10)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Top 10 Predictions")
        
        predictions_data = []
        for i, (prob, idx) in enumerate(zip(top_probs, top_indices)):
            predictions_data.append({
                'Rank': i + 1,
                'Token ID': idx.item(),
                'Probability': f"{prob.item():.4f}",
                'Percentage': f"{prob.item() * 100:.2f}%"
            })
        
        df_predictions = pd.DataFrame(predictions_data)
        st.dataframe(df_predictions, use_container_width=True)
    
    with col2:
        st.subheader("Prediction Distribution")
        
        # Show probability distribution
        fig = go.Figure(data=go.Bar(
            x=[f"Token {idx.item()}" for idx in top_indices],
            y=top_probs.tolist()
        ))
        fig.update_layout(title="Top 10 Token Probabilities",
                         xaxis_title="Tokens", yaxis_title="Probability")
        st.plotly_chart(fig, use_container_width=True)


def display_educational_summary(model_outputs: Dict, token_texts: List[str], model):
    """Display educational summary."""
    st.header("🎓 Educational Summary")
    
    # Get model info
    model_info = model.get_model_info()
    
    # Create summary
    summary_data = {
        'embedding_dim': model_info['model_dimension'],
        'num_heads': model_info['num_attention_heads'],
        'num_layers': model_info['num_layers']
    }
    
    summary = create_educational_summary(summary_data, token_texts)
    st.markdown(summary)
    
    # Model architecture diagram
    with st.expander("📊 Model Architecture Diagram"):
        diagram = create_model_architecture_diagram(model_info)
        st.text(diagram)


if __name__ == "__main__":
    main()
