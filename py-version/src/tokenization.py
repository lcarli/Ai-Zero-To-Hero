"""
Tokenization module for educational LLM project.

This module implements BPE (Byte Pair Encoding) tokenization from scratch
for educational purposes, showing how text is converted to tokens.
"""

import re
from typing import List, Dict, Tuple, Optional
import json
from collections import defaultdict, Counter


class BPETokenizer:
    """
    Educational implementation of BPE (Byte Pair Encoding) tokenizer.
    
    This class demonstrates how modern tokenizers work by implementing
    the BPE algorithm step by step.
    """
    
    def __init__(self, vocab_size: int = 1000):
        """
        Initialize the BPE tokenizer.
        
        Args:
            vocab_size: Maximum vocabulary size to build
        """
        self.vocab_size = vocab_size
        self.vocab = {}  # token_id -> token_string
        self.token_to_id = {}  # token_string -> token_id
        self.merges = []  # List of merge operations
        
        # Special tokens
        self.special_tokens = {
            '<BOS>': 0,  # Beginning of sequence
            '<EOS>': 1,  # End of sequence
            '<PAD>': 2,  # Padding token
            '<UNK>': 3   # Unknown token
        }
        
        # Initialize vocabulary with special tokens
        self._init_special_tokens()
    
    def _init_special_tokens(self):
        """Initialize vocabulary with special tokens."""
        for token, token_id in self.special_tokens.items():
            self.vocab[token_id] = token
            self.token_to_id[token] = token_id
    
    def _get_word_frequencies(self, text: str) -> Dict[str, int]:
        """
        Count word frequencies in text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary mapping words to their frequencies
        """
        # Simple word tokenization (split on whitespace and punctuation)
        words = re.findall(r'\b\w+\b', text.lower())
        return Counter(words)
    
    def _get_pair_frequencies(self, word_freqs: Dict[str, int]) -> Dict[Tuple[str, str], int]:
        """
        Count frequencies of character pairs in words.
        
        Args:
            word_freqs: Dictionary of word frequencies
            
        Returns:
            Dictionary mapping character pairs to frequencies
        """
        pairs = defaultdict(int)
        
        for word, freq in word_freqs.items():
            # Split word into characters
            chars = list(word)
            
            # Count adjacent pairs
            for i in range(len(chars) - 1):
                pair = (chars[i], chars[i + 1])
                pairs[pair] += freq
        
        return pairs
    
    def _merge_vocab(self, pair: Tuple[str, str], word_freqs: Dict[str, int]) -> Dict[str, int]:
        """
        Merge the most frequent pair in the vocabulary.
        
        Args:
            pair: The pair to merge
            word_freqs: Current word frequencies
            
        Returns:
            Updated word frequencies with merged pair
        """
        new_word_freqs = {}
        
        # Pattern to match the pair
        pattern = re.escape(pair[0]) + re.escape(pair[1])
        replacement = pair[0] + pair[1]
        
        for word, freq in word_freqs.items():
            # Replace the pair in the word
            new_word = re.sub(pattern, replacement, word)
            new_word_freqs[new_word] = freq
        
        return new_word_freqs
    
    def train(self, text: str) -> None:
        """
        Train the BPE tokenizer on the given text.
        
        Args:
            text: Training text
        """
        print("🚀 Training BPE tokenizer...")
        
        # Step 1: Get word frequencies
        word_freqs = self._get_word_frequencies(text)
        print(f"📊 Found {len(word_freqs)} unique words")
        
        # Step 2: Initialize vocabulary with individual characters
        vocab_size = len(self.special_tokens)
        
        # Add all characters to vocabulary
        all_chars = set()
        for word in word_freqs:
            all_chars.update(word)
        
        for char in sorted(all_chars):
            if char not in self.token_to_id:
                self.vocab[vocab_size] = char
                self.token_to_id[char] = vocab_size
                vocab_size += 1
        
        # Step 3: Perform BPE merges
        iteration = 0
        while vocab_size < self.vocab_size:
            # Get pair frequencies
            pair_freqs = self._get_pair_frequencies(word_freqs)
            
            if not pair_freqs:
                break
            
            # Find most frequent pair
            best_pair = max(pair_freqs, key=pair_freqs.get)
            
            # Merge the pair
            word_freqs = self._merge_vocab(best_pair, word_freqs)
            
            # Add merged token to vocabulary
            merged_token = best_pair[0] + best_pair[1]
            self.vocab[vocab_size] = merged_token
            self.token_to_id[merged_token] = vocab_size
            self.merges.append(best_pair)
            
            vocab_size += 1
            iteration += 1
            
            if iteration % 50 == 0:
                print(f"✅ Completed {iteration} merges, vocab size: {vocab_size}")
        
        print(f"🎉 Training complete! Final vocabulary size: {len(self.vocab)}")
    
    def encode(self, text: str) -> List[int]:
        """
        Encode text into token IDs.
        
        Args:
            text: Input text to encode
            
        Returns:
            List of token IDs
        """
        # Simple preprocessing
        text = text.lower().strip()
        
        # Add special tokens
        tokens = [self.special_tokens['<BOS>']]
        
        # Split into words
        words = re.findall(r'\b\w+\b', text)
        
        for word in words:
            # Apply BPE to each word
            word_tokens = self._encode_word(word)
            tokens.extend(word_tokens)
        
        tokens.append(self.special_tokens['<EOS>'])
        
        return tokens
    
    def _encode_word(self, word: str) -> List[int]:
        """
        Encode a single word using BPE.
        
        Args:
            word: Word to encode
            
        Returns:
            List of token IDs for the word
        """
        # Start with individual characters
        tokens = list(word)
        
        # Apply merges in order
        for merge in self.merges:
            new_tokens = []
            i = 0
            
            while i < len(tokens):
                if i < len(tokens) - 1 and tokens[i] == merge[0] and tokens[i + 1] == merge[1]:
                    # Merge found
                    new_tokens.append(merge[0] + merge[1])
                    i += 2
                else:
                    new_tokens.append(tokens[i])
                    i += 1
            
            tokens = new_tokens
        
        # Convert tokens to IDs
        token_ids = []
        for token in tokens:
            if token in self.token_to_id:
                token_ids.append(self.token_to_id[token])
            else:
                token_ids.append(self.special_tokens['<UNK>'])
        
        return token_ids
    
    def decode(self, token_ids: List[int]) -> str:
        """
        Decode token IDs back to text.
        
        Args:
            token_ids: List of token IDs
            
        Returns:
            Decoded text
        """
        tokens = []
        
        for token_id in token_ids:
            if token_id in self.vocab:
                token = self.vocab[token_id]
                
                # Skip special tokens in output
                if token not in ['<BOS>', '<EOS>', '<PAD>']:
                    tokens.append(token)
        
        # Join tokens with spaces (simple reconstruction)
        return ' '.join(tokens)
    
    def get_vocab_info(self) -> Dict:
        """
        Get information about the vocabulary.
        
        Returns:
            Dictionary with vocabulary statistics
        """
        return {
            'vocab_size': len(self.vocab),
            'num_merges': len(self.merges),
            'special_tokens': self.special_tokens,
            'sample_tokens': {k: v for k, v in list(self.vocab.items())[:20]}
        }
    
    def visualize_tokenization(self, text: str) -> List[Dict]:
        """
        Visualize how text is tokenized step by step.
        
        Args:
            text: Input text
            
        Returns:
            List of token information dictionaries
        """
        token_ids = self.encode(text)
        
        tokens_info = []
        for i, token_id in enumerate(token_ids):
            token_text = self.vocab.get(token_id, '<UNK>')
            
            # Determine token type
            if token_text in self.special_tokens:
                token_type = 'special'
            elif len(token_text) == 1:
                token_type = 'character'
            else:
                token_type = 'subword'
            
            tokens_info.append({
                'position': i,
                'token_id': token_id,
                'token_text': token_text,
                'token_type': token_type
            })
        
        return tokens_info


def create_sample_tokenizer(vocab_size: int = 1000) -> BPETokenizer:
    """
    Create a sample tokenizer trained on educational text.
    
    Args:
        vocab_size: Maximum vocabulary size for the tokenizer
    
    Returns:
        Trained BPE tokenizer
    """
    # Sample training text about AI and machine learning
    training_text = """
    artificial intelligence is transforming the world through machine learning algorithms
    neural networks learn patterns from data to make predictions and decisions
    transformers are powerful architectures for natural language processing tasks
    attention mechanisms help models focus on relevant parts of input sequences
    large language models can generate human-like text and answer questions
    deep learning requires computational resources and large datasets for training
    backpropagation optimizes neural network weights through gradient descent
    embeddings convert words into dense vector representations for processing
    """
    
    tokenizer = BPETokenizer(vocab_size=vocab_size)
    tokenizer.train(training_text)
    
    return tokenizer


def create_dynamic_tokenizer(user_text: str, vocab_size: int = 1000) -> BPETokenizer:
    """
    Create a tokenizer that adapts to the user's input text.
    
    Args:
        user_text: The user's input text to include in training
        vocab_size: Maximum vocabulary size for the tokenizer
    
    Returns:
        Trained BPE tokenizer adapted to the user's text
    """
    # Base training text for common words and patterns
    base_text = """
    the and is are was were will be been being have has had do does did
    can could would should might must may shall will would
    I you he she it we they me him her us them my your his her its our their
    this that these those a an some any all each every
    in on at by for with from to of about through during before after
    what when where why how who which whose whom
    """
    
    # Combine base text with user input (give more weight to user text)
    combined_text = f"{base_text} {user_text} {user_text} {user_text}"
    
    print(f"🚀 Training dynamic tokenizer for: '{user_text[:50]}{'...' if len(user_text) > 50 else ''}'")
    
    tokenizer = BPETokenizer(vocab_size=vocab_size)
    tokenizer.train(combined_text)
    
    return tokenizer


if __name__ == "__main__":
    # Example usage
    tokenizer = create_sample_tokenizer()
    
    # Test tokenization
    test_text = "I love programming because it's creative and logical"
    tokens = tokenizer.visualize_tokenization(test_text)
    
    print(f"\n🔤 Tokenizing: '{test_text}'")
    print("=" * 50)
    
    for token_info in tokens:
        print(f"Token {token_info['position']:2d}: "
              f"ID={token_info['token_id']:3d} | "
              f"Text='{token_info['token_text']:10}' | "
              f"Type={token_info['token_type']}")
    
    print(f"\n📊 Vocabulary info:")
    vocab_info = tokenizer.get_vocab_info()
    for key, value in vocab_info.items():
        print(f"  {key}: {value}")
