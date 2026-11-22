#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 54: Multimodal Embeddings & Retrieval
Standalone Academic Verification Script: Distance Identities, Recall@K & Mean Reciprocal Rank (MRR)

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def l2_normalize(matrix: np.ndarray, axis: int = -1, eps: float = 1e-12) -> np.ndarray:
    """Normalizes vector or matrix along specified axis to unit L2 norm."""
    norm = np.linalg.norm(matrix, axis=axis, keepdims=True)
    return matrix / np.maximum(norm, eps)

def compute_retrieval_metrics(ranks: list, k_values: list = [1, 5, 10]) -> dict:
    """
    Computes Recall@K for various K and Mean Reciprocal Rank (MRR) across test queries.
    """
    ranks_arr = np.array(ranks, dtype=np.int32)
    N_q = len(ranks_arr)
    
    results = {}
    for k in k_values:
        recall_k = float(np.mean(ranks_arr <= k))
        results[f"Recall@{k}"] = recall_k
        
    mrr = float(np.mean(1.0 / ranks_arr))
    results["MRR"] = mrr
    return results

def main():
    print("=" * 70)
    print("Chapter 54 Verification: Cross-Modal Retrieval Metrics & Metric Space Geometry")
    print("=" * 70)
    
    # 1. Section 3 Part A: Geometric Distance Identity Verification
    print("\n[Step 1] Geometric Identity Verification: d_E^2 == 2 * (1 - cos theta):")
    u = np.array([1.0, 0.0], dtype=np.float64)
    v = np.array([0.6, 0.8], dtype=np.float64)
    
    # Assert unit norm
    np.testing.assert_allclose(np.linalg.norm(u), 1.0, atol=1e-5)
    np.testing.assert_allclose(np.linalg.norm(v), 1.0, atol=1e-5)
    
    # Cosine similarity
    cos_theta = float(np.dot(u, v))
    # Euclidean distance
    d_euclidean = float(np.linalg.norm(u - v))
    d_euclidean_sq = d_euclidean ** 2
    # Theoretical identity
    d_theory_sq = 2.0 * (1.0 - cos_theta)
    
    print(f"  Vector u: {u} (norm={np.linalg.norm(u):.4f})")
    print(f"  Vector v: {v} (norm={np.linalg.norm(v):.4f})")
    print(f"  Cosine Similarity (cos theta): {cos_theta:.4f}")
    print(f"  Squared Euclidean Distance (d_E^2): {d_euclidean_sq:.4f}")
    print(f"  Theoretical Identity 2*(1 - cos theta): {d_theory_sq:.4f}")
    
    np.testing.assert_allclose(cos_theta, 0.6000, atol=1e-5)
    np.testing.assert_allclose(d_euclidean_sq, 0.8000, atol=1e-5)
    np.testing.assert_allclose(d_theory_sq, 0.8000, atol=1e-5)
    np.testing.assert_allclose(d_euclidean_sq, d_theory_sq, atol=1e-5)
    print("  -> Identity d_E^2 == 2*(1 - cos theta) verified with exact precision [0.8000].")
    
    # 2. Section 3 Part B: Retrieval Evaluation Metrics (Recall@K & MRR)
    print("\n[Step 2] Retrieval Evaluation Metrics (Section 3 Part B Example):")
    # 4 queries with ground-truth target ranks: [1, 3, 2, 6]
    test_ranks = [1, 3, 2, 6]
    print(f"  Ground-truth target ranks for N_q=4 queries: {test_ranks}")
    
    metrics = compute_retrieval_metrics(test_ranks, k_values=[1, 5])
    print(f"  Recall@1: {metrics['Recall@1']:.4f} (Expected: 0.2500 - 25.0%)")
    print(f"  Recall@5: {metrics['Recall@5']:.4f} (Expected: 0.7500 - 75.0%)")
    print(f"  MRR:      {metrics['MRR']:.4f} (Expected: 0.5000)")
    
    np.testing.assert_allclose(metrics["Recall@1"], 0.2500, atol=1e-5)
    np.testing.assert_allclose(metrics["Recall@5"], 0.7500, atol=1e-5)
    np.testing.assert_allclose(metrics["MRR"], 0.5000, atol=1e-5)
    print("  -> Recall@1, Recall@5, and MRR match Section 3 analytical derivation perfectly.")
    
    # 3. Bidirectional Matrix Retrieval Pipeline Test
    print("\n[Step 3] Bidirectional Matrix Retrieval Test:")
    # 3 queries (Text), 5 database items (Images)
    np.random.seed(42)
    Q_text = l2_normalize(np.random.randn(3, 8))
    D_image = l2_normalize(np.random.randn(5, 8))
    
    # Cosine similarity matrix: (3, 5)
    sim_matrix = np.dot(Q_text, D_image.T)
    # Ranked image indices for each text query
    top_indices = np.argsort(-sim_matrix, axis=1)
    
    print(f"  Query-Database Similarity Matrix Shape: {sim_matrix.shape}")
    print(f"  Top-1 Retrieved Image per Query: {top_indices[:, 0].tolist()}")
    assert sim_matrix.shape == (3, 5), "Similarity matrix shape mismatch!"
    assert len(top_indices) == 3, "Top indices count mismatch!"
    print("  -> Bidirectional matrix retrieval pipeline passed.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 54 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
