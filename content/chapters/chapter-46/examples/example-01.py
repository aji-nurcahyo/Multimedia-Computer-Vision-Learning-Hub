"""
Chapter 46: Vision Transformers & Attention
Standalone Python Implementation: Patch Partitioning, QKV Projection,
Scaled Dot-Product Attention, and Complexity Verification.

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import math
import numpy as np


def extract_patches_and_count(h: int, w: int, p: int) -> int:
    """Calculate the number of non-overlapping patches N = (H * W) / P^2."""
    assert h % p == 0 and w % p == 0, "Image dimensions must be divisible by patch size"
    return (h * w) // (p * p)


def scaled_dot_product_attention(
    q: np.ndarray,
    k: np.ndarray,
    v: np.ndarray
) -> tuple[np.ndarray, np.ndarray]:
    """
    Compute Scaled Dot-Product Attention:
    Attention(Q, K, V) = Softmax(Q * K^T / sqrt(d_k)) * V
    """
    d_k = q.shape[-1]
    scores = np.matmul(q, k.T) / math.sqrt(d_k)
    # Numerically stable softmax along the last dimension
    e_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    attention_weights = e_scores / np.sum(e_scores, axis=-1, keepdims=True)
    output = np.matmul(attention_weights, v)
    return output, attention_weights


def main():
    print("=== Chapter 46: Vision Transformers & Attention ===")

    # 1. Patch Count Calculation Verification
    # Standard ViT-Base: Image 224x224, Patch 16x16 -> N = 196
    num_patches = extract_patches_and_count(224, 224, 16)
    print(f"[Check 1] 224x224 with 16x16 patch -> Number of Patches N: {num_patches} (Expected: 196)")
    assert num_patches == 196, f"Expected 196 patches, got {num_patches}"

    # 2. Worked Numerical Example Verification from Section 3 of Lecture
    # 3 tokens, d_k = 4
    q = np.array([
        [1.0, 0.0, 1.0, 0.0],
        [0.0, 2.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 0.0]
    ], dtype=np.float64)

    k = np.array([
        [1.0, 0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0, 2.0],
        [0.0, 0.0, 1.0, 1.0]
    ], dtype=np.float64)

    v = np.array([
        [10.0, 0.0],
        [0.0, 20.0],
        [5.0, 5.0]
    ], dtype=np.float64)

    out, attn = scaled_dot_product_attention(q, k, v)
    print("\n[Check 2] Calculated Attention Weights (Row 0):")
    print(np.round(attn[0], 4))
    print("[Check 3] Calculated Aggregated Output for Token 0:")
    print(np.round(out[0], 4))

    # Assert exact analytical values from Section 3
    # S[0] = [0.5065, 0.1863, 0.3072]
    assert np.isclose(attn[0, 0], 0.5065, atol=1e-3)
    assert np.isclose(attn[0, 1], 0.1863, atol=1e-3)
    assert np.isclose(attn[0, 2], 0.3072, atol=1e-3)
    assert np.isclose(np.sum(attn[0]), 1.0)

    # Output[0] = [6.601, 5.262]
    assert np.isclose(out[0, 0], 6.601, atol=1e-2)
    assert np.isclose(out[0, 1], 5.262, atol=1e-2)

    # 3. Complexity Verification: O(N^2 * D)
    d = 768
    cost_224 = (196**2) * d
    cost_448 = ((224 * 2 // 16)**2)**2 * d  # 784 patches -> 784^2 * 768 = 16x growth
    print(f"\n[Check 4] Flops scaling from 224 to 448 resolution: {cost_448 / cost_224:.1f}x (Quadratic)")
    assert np.isclose(cost_448 / cost_224, 16.0)

    print("\nAll Chapter 46 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
