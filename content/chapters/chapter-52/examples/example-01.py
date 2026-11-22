#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 52: Vision-Language Models
Standalone Academic Verification Script: Dual-Encoder CLIP Loss & Zero-Shot Classification

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def l2_normalize(matrix: np.ndarray, axis: int = -1, eps: float = 1e-12) -> np.ndarray:
    """Normalizes array along given axis to unit L2 norm."""
    norm = np.linalg.norm(matrix, axis=axis, keepdims=True)
    return matrix / np.maximum(norm, eps)

def compute_clip_symmetric_loss(image_embs: np.ndarray, text_embs: np.ndarray, tau: float = 0.20) -> tuple:
    """
    Computes symmetric contrastive vision-language CLIP loss:
    L_clip = 0.5 * (L_v2t + L_t2v)
    """
    # 1. Ensure L2 normalization
    U = l2_normalize(image_embs)  # shape: (N, D)
    V = l2_normalize(text_embs)   # shape: (N, D)
    N = len(U)
    
    # 2. Cosine similarity matrix & temperature-scaled logits
    S = np.dot(U, V.T)  # shape: (N, N)
    L = S / tau
    
    # 3. Vision-to-Text Cross-Entropy Loss (Row Softmax)
    # Numerical stability: subtract row max
    L_row_max = np.max(L, axis=1, keepdims=True)
    exp_row = np.exp(L - L_row_max)
    probs_v2t = exp_row / np.sum(exp_row, axis=1, keepdims=True)
    
    # Positive pairs are on the diagonal: index (i, i)
    diag_probs_v2t = np.diag(probs_v2t)
    loss_v2t = -float(np.mean(np.log(np.maximum(diag_probs_v2t, 1e-15))))
    
    # 4. Text-to-Vision Cross-Entropy Loss (Column Softmax)
    L_col_max = np.max(L, axis=0, keepdims=True)
    exp_col = np.exp(L - L_col_max)
    probs_t2v = exp_col / np.sum(exp_col, axis=0, keepdims=True)
    
    diag_probs_t2v = np.diag(probs_t2v)
    loss_t2v = -float(np.mean(np.log(np.maximum(diag_probs_t2v, 1e-15))))
    
    # 5. Total Symmetric Loss
    loss_clip = 0.5 * (loss_v2t + loss_t2v)
    
    info_dict = {
        "S": S,
        "L": L,
        "probs_v2t": probs_v2t,
        "probs_t2v": probs_t2v,
        "loss_v2t": loss_v2t,
        "loss_t2v": loss_t2v
    }
    return loss_clip, info_dict

def zero_shot_classification(image_vec: np.ndarray, class_text_matrix: np.ndarray, class_names: list, tau: float = 0.20) -> tuple:
    """Predicts zero-shot class probabilities using cosine similarity softmax."""
    u = l2_normalize(image_vec.reshape(1, -1))[0]
    V = l2_normalize(class_text_matrix)
    
    similarities = np.dot(V, u)
    logits = similarities / tau
    exp_logits = np.exp(logits - np.max(logits))
    probs = exp_logits / np.sum(exp_logits)
    
    pred_idx = int(np.argmax(probs))
    return class_names[pred_idx], probs

def main():
    print("=" * 70)
    print("Chapter 52 Verification: Dual-Encoder CLIP Loss & Zero-Shot Classification")
    print("=" * 70)
    
    # 1. Setup Exact Worked Example from Section 3
    # N=2 pairs, D=2 dimension, tau = 0.20
    u1 = [1.0, 0.0]
    u2 = [0.0, 1.0]
    v1 = [0.8, 0.6]
    v2 = [-0.6, 0.8]
    
    image_embs = np.array([u1, u2], dtype=np.float64)
    text_embs = np.array([v1, v2], dtype=np.float64)
    tau = 0.20
    
    print("\n[Step 1] Input Embeddings (N=2, D=2):")
    print(f"Image 1: {image_embs[0]} | Image 2: {image_embs[1]}")
    print(f"Text 1:  {text_embs[0]} | Text 2:  {text_embs[1]}")
    print(f"Temperature tau: {tau}")
    
    # 2. Compute Symmetric CLIP Loss
    loss_clip, info = compute_clip_symmetric_loss(image_embs, text_embs, tau=tau)
    
    print("\n[Step 2] Cosine Similarity Matrix S:")
    print(info["S"])
    np.testing.assert_allclose(info["S"], [[0.80, -0.60], [0.60, 0.80]], atol=1e-5)
    print("  -> Cosine similarity matrix matches Section 3 exactly.")
    
    print("\n[Step 3] Temperature-Scaled Logits L:")
    print(info["L"])
    np.testing.assert_allclose(info["L"], [[4.00, -3.00], [3.00, 4.00]], atol=1e-5)
    print("  -> Scaled logits match Section 3 derivation.")
    
    print(f"\n[Step 4] Vision-to-Text Probabilities & Loss:")
    print(f"  P(T1 | I1) = {info['probs_v2t'][0, 0]:.7f} (Expected: ~0.9990888)")
    print(f"  P(T2 | I2) = {info['probs_v2t'][1, 1]:.7f} (Expected: ~0.7310586)")
    print(f"  Loss v2t   = {info['loss_v2t']:.7f} (Expected: ~0.1570866)")
    np.testing.assert_allclose(info["probs_v2t"][0, 0], 0.9990888, atol=1e-5)
    np.testing.assert_allclose(info["probs_v2t"][1, 1], 0.7310586, atol=1e-5)
    np.testing.assert_allclose(info["loss_v2t"], 0.1570866, atol=1e-5)
    
    print(f"\n[Step 5] Text-to-Vision Probabilities & Loss:")
    print(f"  P(I1 | T1) = {info['probs_t2v'][0, 0]:.7f} (Expected: ~0.7310586)")
    print(f"  P(I2 | T2) = {info['probs_t2v'][1, 1]:.7f} (Expected: ~0.9990888)")
    print(f"  Loss t2v   = {info['loss_t2v']:.7f} (Expected: ~0.1570866)")
    np.testing.assert_allclose(info["loss_t2v"], 0.1570866, atol=1e-5)
    
    print(f"\n[Step 6] Total Symmetric CLIP Loss:")
    print(f"  L_CLIP     = {loss_clip:.7f} (Expected: ~0.1570866)")
    np.testing.assert_allclose(loss_clip, 0.1570866, atol=1e-5)
    print("  -> Symmetrical CLIP loss matches Section 3 analytical solution [0.1570866] perfectly.")
    
    # 3. Zero-Shot Image Classification Simulation
    print("\n[Step 7] Zero-Shot Classification Test:")
    classes = ["kucing", "anjing"]
    pred_class, class_probs = zero_shot_classification(image_embs[0], text_embs, classes, tau=tau)
    print(f"  Image 1 Query Probabilities: 'kucing'={class_probs[0]*100:.2f}%, 'anjing'={class_probs[1]*100:.2f}%")
    print(f"  Predicted Class: '{pred_class}'")
    assert pred_class == "kucing", "Image 1 must be classified as 'kucing'!"
    assert class_probs[0] > 0.999, "Confidence for class 'kucing' must exceed 99.9%!"
    print("  -> Zero-shot classification test succeeded deterministically.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 52 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
