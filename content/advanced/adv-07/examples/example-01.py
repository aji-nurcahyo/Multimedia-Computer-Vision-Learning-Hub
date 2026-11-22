"""
ADV-07: Vision Foundation Models & Parameter-Efficient Adaptation
Verification of Cosine Similarity, InfoNCE Contrastive Loss, and LoRA Weight Decomposition

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
Level: L3 Advanced Curriculum
"""

import numpy as np

def l2_normalize(x: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    """L2 normalization of embedding vectors"""
    norm = np.linalg.norm(x, axis=-1, keepdims=True)
    return x / np.maximum(norm, eps)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two 1D vectors"""
    a_norm = l2_normalize(a)
    b_norm = l2_normalize(b)
    return float(np.dot(a_norm, b_norm))

def compute_infonce_loss(query: np.ndarray, pos_key: np.ndarray, neg_keys: np.ndarray, tau: float = 0.07) -> tuple[float, float, float]:
    """
    InfoNCE Contrastive Loss:
    Loss = -log( exp(q . k+ / tau) / ( exp(q . k+ / tau) + sum_i exp(q . k_i / tau) ) )
    """
    q_norm = l2_normalize(query)
    pos_norm = l2_normalize(pos_key)
    neg_norm = l2_normalize(neg_keys)
    
    pos_sim = np.dot(q_norm, pos_norm)
    pos_logit = pos_sim / tau
    
    neg_sims = np.dot(neg_norm, q_norm)
    neg_logits = neg_sims / tau
    
    all_logits = np.concatenate([[pos_logit], neg_logits])
    max_logit = np.max(all_logits)
    
    sum_exp = np.sum(np.exp(all_logits - max_logit))
    log_sum_exp = max_logit + np.log(sum_exp)
    
    loss = float(log_sum_exp - pos_logit)
    pos_prob = float(np.exp(pos_logit - max_logit) / sum_exp)
    return loss, float(pos_sim), pos_prob

def apply_lora_decomposition(W0: np.ndarray, B: np.ndarray, A: np.ndarray, alpha: float = 16.0, r: int = 4) -> np.ndarray:
    """
    LoRA Weight Update: W = W0 + (alpha / r) * (B @ A)
    """
    scaling = alpha / float(r) if r > 0 else 1.0
    delta_W = scaling * (B @ A)
    return W0 + delta_W

def compute_lora_param_savings(d_in: int, d_out: int, r: int) -> tuple[int, int, float]:
    full_params = d_in * d_out
    lora_params = (d_in + d_out) * r
    reduction_pct = ((full_params - lora_params) / full_params) * 100.0
    return full_params, lora_params, reduction_pct

def main():
    print("=" * 70)
    print("ADV-07: VISION FOUNDATION MODELS & PARAMETER-EFFICIENT ADAPTATION")
    print("Verification of InfoNCE Loss, Cosine Alignment, and LoRA Weight Decomposition")
    print("=" * 70)
    
    # 1. Cosine Metric & L2 Normalization
    v1 = np.array([1.0, 0.0, 0.0])
    v2 = np.array([1.0, 0.0, 0.0])
    v3 = np.array([0.0, 1.0, 0.0])
    v4 = np.array([-1.0, 0.0, 0.0])
    
    sim_ident = cosine_similarity(v1, v2)
    sim_ortho = cosine_similarity(v1, v3)
    sim_oppos = cosine_similarity(v1, v4)
    print("\n[1] Cosine Similarity Bounds:")
    print(f"    Identical Vectors Sim: {sim_ident:.4f} (Must be 1.0000)")
    print(f"    Orthogonal Vectors Sim: {sim_ortho:.4f} (Must be 0.0000)")
    print(f"    Opposite Vectors Sim:   {sim_oppos:.4f} (Must be -1.0000)")
    assert abs(sim_ident - 1.0) < 1e-5 and abs(sim_ortho - 0.0) < 1e-5 and abs(sim_oppos - (-1.0)) < 1e-5
    print("    -> Cosine Similarity Properties: PASS")
    
    # 2. InfoNCE Loss Calculation
    query = np.array([0.82, 0.45, -0.12, 0.05], dtype=np.float64)
    pos_key = np.array([0.80, 0.48, -0.09, 0.02], dtype=np.float64)
    neg_keys = np.array([
        [-0.15, 0.78, 0.45, -0.21],
        [-0.35, -0.12, 0.82, 0.41],
        [0.10, -0.22, 0.35, -0.75]
    ], dtype=np.float64)
    
    loss, pos_sim, pos_prob = compute_infonce_loss(query, pos_key, neg_keys, tau=0.1)
    print("\n[2] InfoNCE Contrastive Objective (tau = 0.1):")
    print(f"    Positive Cosine Similarity: {pos_sim:.4f}")
    print(f"    Positive Retrieval Prob:    {pos_prob * 100:.2f}% (Aligned query)")
    print(f"    InfoNCE Loss:               {loss:.4f} (Lower bound on mutual information)")
    assert loss > 0.0 and pos_prob > 0.80, "InfoNCE loss calculation invalid"
    print("    -> InfoNCE Mutual Information Lower Bound: PASS")
    
    # 3. LoRA Weight Decomposition (Hu et al. ICLR 2022)
    W0 = np.array([
        [1.0, 0.0, 2.0, 0.0],
        [0.0, 1.0, 0.0, 2.0],
        [2.0, 0.0, 1.0, 0.0],
        [0.0, 2.0, 0.0, 1.0]
    ], dtype=np.float64)
    
    B = np.array([[0.5], [1.0], [-0.5], [0.0]], dtype=np.float64) # [4, 1]
    A = np.array([[2.0, 1.0, 0.0, -1.0]], dtype=np.float64)       # [1, 4]
    
    W_adapted = apply_lora_decomposition(W0, B, A, alpha=2.0, r=1)
    expected_W = np.array([
        [3.0, 1.0, 2.0, -1.0],
        [4.0, 3.0, 0.0, 0.0],
        [0.0, -1.0, 1.0, 1.0],
        [0.0, 2.0, 0.0, 1.0]
    ], dtype=np.float64)
    
    print("\n[3] LoRA Weight Matrix Adaptation (alpha=2, r=1):")
    print(f"    Base Weight Matrix W0 (Frozen):\n{W0}")
    print(f"    Delta W = (alpha/r) * B @ A:\n{W_adapted - W0}")
    print(f"    Adapted Weight W = W0 + Delta W:\n{W_adapted}")
    assert np.allclose(W_adapted, expected_W), "LoRA matrix multiplication mismatch"
    print("    -> LoRA Weight Matrix Decomposition: PASS")
    
    # 4. Parameter Count Savings Analysis (e.g. ViT-Base 768x768 and ViT-Large 1024x1024)
    full_768, lora_768, red_768 = compute_lora_param_savings(768, 768, r=4)
    full_1024, lora_1024, red_1024 = compute_lora_param_savings(1024, 1024, r=8)
    print("\n[4] Parameter-Efficient Fine-Tuning (PEFT) Savings Analysis:")
    print(f"    ViT-Base Projection (768x768, r=4):")
    print(f"      Full Params: {full_768:,} | LoRA Params: {lora_768:,} | Savings: {red_768:.2f}%")
    print(f"    ViT-Large Projection (1024x1024, r=8):")
    print(f"      Full Params: {full_1024:,} | LoRA Params: {lora_1024:,} | Savings: {red_1024:.2f}%")
    assert red_768 > 98.0 and red_1024 > 98.0, "LoRA parameter savings under-reported"
    print("    -> Parameter Reduction Ratio Assertion: PASS")
    
    print("\n" + "=" * 70)
    print("ALL ADV-07 VISION FOUNDATION MODEL TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    main()

