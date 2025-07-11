"""
Test script for the educational LLM project.

This script tests each component individually to ensure everything works
without requiring the full dependencies.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_tokenization():
    """Test the tokenization module."""
    print("🔤 Testing Tokenization...")
    
    try:
        from tokenization import BPETokenizer, create_sample_tokenizer
        
        # Create a simple tokenizer
        tokenizer = BPETokenizer(vocab_size=100)
        
        # Simple training text
        training_text = "hello world this is a test hello world test"
        tokenizer.train(training_text)
        
        # Test encoding
        test_text = "hello test"
        tokens = tokenizer.encode(test_text)
        decoded = tokenizer.decode(tokens)
        
        print(f"   Original: '{test_text}'")
        print(f"   Tokens: {tokens}")
        print(f"   Decoded: '{decoded}'")
        print("   ✅ Tokenization working!")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Tokenization failed: {e}")
        return False


def test_basic_functionality():
    """Test basic functionality without PyTorch dependencies."""
    print("🧪 Testing Basic Functionality...")
    
    # Test numpy operations
    try:
        import numpy as np
        
        # Simple matrix operations
        matrix = np.random.rand(5, 5)
        normalized = matrix / np.sum(matrix, axis=1, keepdims=True)
        
        print(f"   Matrix shape: {matrix.shape}")
        print(f"   Normalized sums: {np.sum(normalized, axis=1)}")
        print("   ✅ NumPy operations working!")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Basic functionality failed: {e}")
        return False


def test_utils():
    """Test utility functions."""
    print("🛠️ Testing Utilities...")
    
    try:
        from utils import (
            calculate_representation_statistics,
            create_model_architecture_diagram
        )
        
        # Test statistics calculation
        import numpy as np
        sample_data = np.random.randn(10, 64)
        stats = calculate_representation_statistics(sample_data)
        
        print(f"   Sample stats: mean={stats['mean']:.3f}, std={stats['std']:.3f}")
        
        # Test architecture diagram
        sample_model_info = {
            'vocabulary_size': 1000,
            'model_dimension': 256,
            'num_attention_heads': 8,
            'num_layers': 6,
            'feedforward_dimension': 1024,
            'total_parameters': 10000000,
            'trainable_parameters': 10000000,
            'max_sequence_length': 512
        }
        
        diagram = create_model_architecture_diagram(sample_model_info)
        print("   ✅ Utilities working!")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Utilities failed: {e}")
        return False


def test_pytorch_components():
    """Test PyTorch components if available."""
    print("🔥 Testing PyTorch Components...")
    
    try:
        import torch
        print(f"   PyTorch version: {torch.__version__}")
        
        # Test basic tensor operations
        x = torch.randn(2, 3, 4)
        y = torch.nn.Linear(4, 8)(x)
        
        print(f"   Input shape: {x.shape}")
        print(f"   Output shape: {y.shape}")
        print("   ✅ PyTorch available and working!")
        
        return True
        
    except ImportError:
        print("   ⚠️ PyTorch not installed - some features will be limited")
        return False
    except Exception as e:
        print(f"   ❌ PyTorch components failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🚀 Educational LLM Project - Test Suite")
    print("=" * 50)
    
    tests = [
        test_basic_functionality,
        test_tokenization,
        test_utils,
        test_pytorch_components
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"   💥 Test crashed: {e}")
            results.append(False)
        
        print()  # Add spacing
    
    # Summary
    print("📊 Test Summary")
    print("-" * 20)
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! The project is ready to use.")
    elif passed >= total // 2:
        print("⚠️ Most tests passed. Install missing dependencies for full functionality.")
    else:
        print("❌ Many tests failed. Check your environment and dependencies.")
    
    print("\n💡 Next steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the Streamlit app: streamlit run app.py")
    print("3. Explore the educational demos!")


if __name__ == "__main__":
    main()
