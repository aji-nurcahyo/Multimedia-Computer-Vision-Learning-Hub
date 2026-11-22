#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 49: Self-Supervised & Foundation Vision Models
Standalone Academic Verification Script: InfoNCE Loss, Cosine Similarity & Zero-Shot Classification

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def l2_normalize(x: np.ndarray, axis: int = -1, eps: float = 1e-12) -> np.ndarray:
    """Normalizes array along specified axis to have unit L2 norm."""
    norm = np.linalg.norm(x, axis=axis, keepdims=True)
    return x / np.maximum(norm, eps)

def cosine_similarity(u: np.ndarray, v: np.ndarray) -> np.ndarray:
    """Computes cosine similarity between normalized vectors u and v."""
    u_norm = l2_normalize(u)
    v_norm = l2_normalize(v)
    return np.dot(u_norm, v_norm.T)

def compute_infonce_loss(q: np.ndarray, k_pos: np.ndarray, k_negs: np.ndarray, tau: float = 0.1) -> tuple:
    """
    Computes InfoNCE contrastive loss with numerical stability:
    L = -log( exp(sim(q, k+) / tau) / ( exp(sim(q, k+) / tau) + sum_j exp(sim(q, k_j^-) / tau) ) )
    Returns (loss, prob_positive, similarities_dict).
    """
    # 1. Ensure all embeddings are unit normalized
    q_u = l2_normalize(q)
    k_pos_u = l2_normalize(k_pos)
    k_negs_u = l2_normalize(k_negs)
    
    # 2. Compute cosine similarities (dot products)
    s_pos = float(np.dot(q_u, k_pos_u))
    s_negs = np.dot(k_negs_u, q_u)  # shape: (K,)
    
    # 3. Concatenate logits: positive at index 0, negatives at indices 1..K
    logits = np.concatenate(([s_pos], s_negs)) / tau
    
    # 4. Numerically stable softmax: subtract max logit
    max_logit = np.max(logits)
    exp_logits = np.exp(logits - max_logit)
    sum_exp = np.sum(exp_logits)
    
    probs = exp_logits / sum_exp
    p_pos = probs[0]
    
    # InfoNCE loss is negative log of positive probability
    loss = -float(np.log(np.maximum(p_pos, 1e-15)))
    
    sim_dict = {
        "s_pos": s_pos,
        "s_negs": s_negs.tolist(),
        "logits": logits.tolist(),
        "p_pos": p_pos
    }
    return loss, p_pos, sim_dict

def simulate_zero_shot_classification(img_emb: np.ndarray, text_embs: np.ndarray, class_names: list, tau: float = 0.07) -> tuple:
    """Simulates CLIP-style zero-shot classification via cosine similarity softmax."""
    img_u = l2_normalize(img_emb)
    text_u = l2_normalize(text_embs)
    
    # Cosine similarities
    sims = np.dot(text_u, img_u)
    logits = sims / tau
    
    # Softmax
    exp_logits = np.exp(logits - np.max(logits))
    probs = exp_logits / np.sum(exp_logits)
    
    pred_idx = int(np.argmax(probs))
    pred_class = class_names[pred_idx]
    return pred_class, probs

def main():
    print("=" * 70)
    print("Chapter 49 Verification: Contrastive InfoNCE Loss & Foundation Models")
    print("=" * 70)
    
    # 1. Setup Exact Worked Example from Section 3
    q = np.array([0.8, 0.6], dtype=np.float64)
    k_pos = np.array([0.7071068, 0.7071068], dtype=np.float64)
    k_negs = np.array([
        [-0.6,  0.8],
        [-0.8, -0.6]
    ], dtype=np.float64)
    tau = 0.1
    
    print("\n[Step 1] Input Embeddings (Normalized):")
    print(f"Query vector q: {q} (norm: {np.linalg.norm(q):.4f})")
    print(f"Key positive k+: {k_pos} (norm: {np.linalg.norm(k_pos):.4f})")
    print(f"Key negatives:\n  k_neg[0]: {k_negs[0]}\n  k_neg[1]: {k_negs[1]}")
    print(f"Temperature tau: {tau}")
    
    # 2. Compute InfoNCE Loss
    loss, p_pos, sim_dict = compute_infonce_loss(q, k_pos, k_negs, tau=tau)
    
    print("\n[Step 2] Cosine Similarities & Logits:")
    print(f"  sim(q, k+):   {sim_dict['s_pos']:.7f}  (Expected ~0.9899495)")
    print(f"  sim(q, k-_1): {sim_dict['s_negs'][0]:.7f}  (Expected 0.0000000)")
    print(f"  sim(q, k-_2): {sim_dict['s_negs'][1]:.7f}  (Expected -1.0000000)")
    print(f"  Positive Posterior Prob P(+): {p_pos:.7f}  (Expected ~0.9999498)")
    print(f"  InfoNCE Loss: {loss:.8f}  (Expected ~0.0000502)")
    
    # Assertions against Section 3 numerical derivations
    np.testing.assert_allclose(sim_dict['s_pos'], 0.9899495, atol=1e-5)
    np.testing.assert_allclose(sim_dict['s_negs'][0], 0.0, atol=1e-5)
    np.testing.assert_allclose(sim_dict['s_negs'][1], -1.0, atol=1e-5)
    np.testing.assert_allclose(p_pos, 0.9999498, atol=1e-6)
    np.testing.assert_allclose(loss, 5.02e-5, atol=1e-6)
    print("  -> Numerical values match Section 3 derivation with high precision!")
    
    # 3. Test Unaligned Case (sim(q, k+) = 0.20)
    print("\n[Step 3] Verification of Unaligned Positive Pair:")
    # We construct a k_pos_unaligned such that dot product is 0.20
    # In 2D: [cos(theta), sin(theta)] with q=[0.8, 0.6] (angle phi ~ 36.87 deg)
    angle_q = np.arctan2(q[1], q[0])
    delta_angle = np.arccos(0.20)
    k_pos_unaligned = np.array([np.cos(angle_q + delta_angle), np.sin(angle_q + delta_angle)])
    
    loss_unaligned, p_unaligned, _ = compute_infonce_loss(q, k_pos_unaligned, k_negs, tau=tau)
    print(f"  Unaligned sim(q, k+): {np.dot(q, k_pos_unaligned):.4f}")
    print(f"  Unaligned P(+): {p_unaligned:.6f}  (Expected ~0.880792)")
    print(f"  Unaligned InfoNCE Loss: {loss_unaligned:.6f}  (Expected ~0.12693)")
    np.testing.assert_allclose(p_unaligned, 0.880792, atol=1e-4)
    np.testing.assert_allclose(loss_unaligned, 0.12693, atol=1e-4)
    assert loss_unaligned > loss, "Unaligned pair must produce significantly higher loss!"
    print("  -> Unaligned loss verification passed.")
    
    # 4. Temperature Sensitivity Analysis
    print("\n[Step 4] Temperature Sensitivity Sweep:")
    temperatures = [0.05, 0.1, 0.2, 0.5, 1.0]
    for t_val in temperatures:
        l_t, p_t, _ = compute_infonce_loss(q, k_pos_unaligned, k_negs, tau=t_val)
        print(f"  tau={t_val:4.2f} -> P(+)={p_t:.5f}, Loss={l_t:.5f}")
    
    # 5. Simulated CLIP Zero-Shot Classification
    print("\n[Step 5] Simulated CLIP Zero-Shot Prediction:")
    classes = ["anjing", "kucing", "mobil"]
    # Synthetic semantic text prototypes in 4D space
    text_prototypes = np.array([
        [ 0.9,  0.3, -0.2,  0.1],  # anjing
        [ 0.3,  0.9, -0.1,  0.2],  # kucing
        [-0.4, -0.3,  0.8,  0.3]   # mobil
    ])
    # An image query with dog features
    img_query = np.array([0.85, 0.25, -0.15, 0.05])
    
    pred_cls, pred_probs = simulate_zero_shot_classification(img_query, text_prototypes, classes, tau=0.07)
    print(f"Query target class probabilities:")
    for c_name, pr in zip(classes, pred_probs):
        print(f"  Class '{c_name}': {pr * 100:.2f}%")
    print(f"Top-1 Predicted Class: '{pred_cls}'")
    assert pred_cls == "anjing", f"Zero-shot prediction failed: expected 'anjing', got '{pred_cls}'"
    assert pred_probs[0] > 0.95, f"Confidence for 'anjing' should exceed 95%, got {pred_probs[0]:.4f}"
    print("  -> Zero-shot transfer simulation succeeded with >95% confidence.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 49 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
