#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 51: Introduction to Multimodal AI
Standalone Academic Verification Script: Multimodal Fusion Paradigms & Reliability Weighting

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def l2_norm(vec: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    """Normalizes vector to unit L2 norm."""
    norm = np.linalg.norm(vec)
    return vec / max(norm, eps)

def early_fusion_concat(features_list: list) -> np.ndarray:
    """Concatenates multiple modality feature vectors and normalizes with L2 norm."""
    normed = [l2_norm(np.asarray(f, dtype=np.float64)) for f in features_list]
    concatenated = np.concatenate(normed)
    return l2_norm(concatenated)

def late_fusion_reliability_weighted(probabilities: list, reliabilities: list) -> tuple:
    """
    Computes late fusion with adaptive sensor reliability weighting:
    alpha_m = gamma_m / sum_k gamma_k
    P_fused = sum_m alpha_m * P_m
    """
    probs_arr = np.array(probabilities, dtype=np.float64)  # shape: (M, C)
    rel_arr = np.array(reliabilities, dtype=np.float64)     # shape: (M,)
    
    total_rel = np.sum(rel_arr)
    if total_rel <= 1e-12:
        # Fallback to uniform if all reliabilities are zero
        weights = np.ones_like(rel_arr) / len(rel_arr)
    else:
        weights = rel_arr / total_rel
        
    p_fused = np.sum(weights[:, np.newaxis] * probs_arr, axis=0)
    return p_fused, weights

def cross_modal_attention(Q_v: np.ndarray, K_s: np.ndarray, V_s: np.ndarray) -> np.ndarray:
    """Computes scaled dot-product cross-modal attention: Softmax(Q_v @ K_s^T / sqrt(d_k)) @ V_s."""
    d_k = Q_v.shape[-1]
    scores = np.dot(Q_v, K_s.T) / np.sqrt(d_k)
    exp_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    attn_weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    return np.dot(attn_weights, V_s), attn_weights

def main():
    print("=" * 70)
    print("Chapter 51 Verification: Multimodal Fusion & Uncertainty-Aware Weighting")
    print("=" * 70)
    
    # 1. Early Fusion Verification
    print("\n[Step 1] Early Fusion Feature Concatenation:")
    feat_v = np.array([0.8, 0.4, -0.2, 0.6], dtype=np.float64)
    feat_a = np.array([0.7, 0.6, 0.3, -0.2], dtype=np.float64)
    feat_r = np.array([0.5, -0.1, 0.8, 0.3], dtype=np.float64)
    
    early_fused = early_fusion_concat([feat_v, feat_a, feat_r])
    print(f"  Input Dim: Visual={len(feat_v)}, Audio={len(feat_a)}, Radar={len(feat_r)}")
    print(f"  Early Fused Vector Dim: {len(early_fused)} | Norm: {np.linalg.norm(early_fused):.6f}")
    assert len(early_fused) == 12, "Early fusion dimension must be 12!"
    np.testing.assert_allclose(np.linalg.norm(early_fused), 1.0, atol=1e-5)
    print("  -> Early fusion concatenation and L2 normalization passed.")
    
    # 2. Late Fusion with Reliability Weighting (Section 3 Worked Example)
    print("\n[Step 2] Reliability-Weighted Late Fusion (Section 3 Example):")
    # 3 Classes: [0: Kendaraan, 1: Pejalan Kaki, 2: Derau/Background]
    p_v = [0.70, 0.20, 0.10]
    p_a = [0.40, 0.50, 0.10]
    p_r = [0.85, 0.10, 0.05]
    
    # Sensor reliabilities
    gamma_v = 0.80  # Clean daytime camera
    gamma_a = 0.40  # Noisy gusty wind microphone
    gamma_r = 0.80  # High SNR mmWave radar
    
    p_fused, weights = late_fusion_reliability_weighted(
        [p_v, p_a, p_r],
        [gamma_v, gamma_a, gamma_r]
    )
    
    print(f"  Calculated Weights: alpha_v={weights[0]:.4f}, alpha_a={weights[1]:.4f}, alpha_r={weights[2]:.4f}")
    print(f"  Fused Probabilities: Class 0={p_fused[0]:.4f}, Class 1={p_fused[1]:.4f}, Class 2={p_fused[2]:.4f}")
    
    # Assert exact numbers from Section 3
    np.testing.assert_allclose(weights, [0.40, 0.20, 0.40], atol=1e-5)
    np.testing.assert_allclose(p_fused, [0.7000, 0.2200, 0.0800], atol=1e-5)
    assert np.argmax(p_fused) == 0, "Top class prediction must be Class 0 (Kendaraan)!"
    print("  -> Reliability-weighted late fusion matches Section 3 analytical derivation exactly [0.70, 0.22, 0.08].")
    
    # 3. Comparison with Naive Late Fusion (Unweighted Average)
    print("\n[Step 3] Comparison with Naive Average Late Fusion:")
    p_naive, naive_weights = late_fusion_reliability_weighted([p_v, p_a, p_r], [1.0, 1.0, 1.0])
    print(f"  Naive Fused Probabilities: Class 0={p_naive[0]:.4f}, Class 1={p_naive[1]:.4f}, Class 2={p_naive[2]:.4f}")
    np.testing.assert_allclose(p_naive[0], 0.6500, atol=1e-4)
    assert p_fused[0] > p_naive[0], "Reliability weighting must protect class 0 confidence from noisy audio degradation!"
    print(f"  -> Reliability weighting improved Class 0 confidence by +{(p_fused[0] - p_naive[0])*100:.1f}% over naive average.")
    
    # 4. Sensor Dropout Simulation (Camera Occlusion: gamma_v = 0.0)
    print("\n[Step 4] Sensor Dropout Simulation (Visual Occluded: gamma_v = 0.0):")
    p_fallback, fallback_weights = late_fusion_reliability_weighted(
        [p_v, p_a, p_r],
        [0.0, gamma_a, gamma_r]
    )
    print(f"  Fallback Weights: alpha_v={fallback_weights[0]:.4f}, alpha_a={fallback_weights[1]:.4f}, alpha_r={fallback_weights[2]:.4f}")
    print(f"  Fallback Probabilities: Class 0={p_fallback[0]:.4f}, Class 1={p_fallback[1]:.4f}, Class 2={p_fallback[2]:.4f}")
    np.testing.assert_allclose(fallback_weights, [0.0, 1.0/3.0, 2.0/3.0], atol=1e-4)
    np.testing.assert_allclose(p_fallback[0], 0.7000, atol=1e-4)
    print("  -> Fallback mechanism operates deterministically under sensor dropout without system crash.")
    
    # 5. Cross-Modal Intermediate Attention Verification
    print("\n[Step 5] Intermediate Cross-Modal Attention:")
    Q_v = np.array([[1.0, 0.0, 0.5, -0.5]], dtype=np.float64)  # 1 visual query token
    K_s = np.array([
        [1.0, 0.2, 0.4, -0.1],  # sensor token 1 (relevant)
        [-0.8, -0.5, 0.0, 0.9]  # sensor token 2 (irrelevant)
    ], dtype=np.float64)
    V_s = K_s.copy()
    
    out_attn, weights_attn = cross_modal_attention(Q_v, K_s, V_s)
    print(f"  Attention Weights on Sensor Tokens: Token 1={weights_attn[0, 0]:.4f}, Token 2={weights_attn[0, 1]:.4f}")
    assert weights_attn[0, 0] > weights_attn[0, 1], "Visual query must attend more strongly to correlated sensor token!"
    print("  -> Cross-modal attention verified successfully.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 51 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
