#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 55: Multimodal Application Development
Standalone Academic Verification Script: End-to-End Multimodal Monitoring Pipeline & Latency Profiling

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def fuse_multisensor_predictions(prob_matrix: np.ndarray, reliability_vec: np.ndarray) -> tuple:
    """
    Computes reliability-weighted multi-sensor late fusion:
    alpha_m = gamma_m / sum_k gamma_k
    P_fused = sum_m alpha_m * P_m
    """
    gamma_arr = np.array(reliability_vec, dtype=np.float64)
    P_arr = np.array(prob_matrix, dtype=np.float64)  # shape: (M, C)
    
    total_gamma = np.sum(gamma_arr)
    if total_gamma <= 1e-12:
        weights = np.ones_like(gamma_arr) / len(gamma_arr)
    else:
        weights = gamma_arr / total_gamma
        
    p_fused = np.sum(weights[:, np.newaxis] * P_arr, axis=0)
    pred_class = int(np.argmax(p_fused))
    return p_fused, weights, pred_class

def profile_pipeline_latency(t_cap: float, t_enc_list: list, t_sync: float, t_fuse: float, t_post: float) -> tuple:
    """
    Profiles end-to-end pipeline frame latency and throughput FPS:
    T_total = T_capture + max(T_encoders) + T_sync + T_fuse + T_post
    FPS = 1000 / T_total
    """
    t_enc_parallel = max(t_enc_list)
    t_total = t_cap + t_enc_parallel + t_sync + t_fuse + t_post
    fps = 1000.0 / t_total if t_total > 0 else 0.0
    return t_total, fps, t_enc_parallel

def main():
    print("=" * 70)
    print("Chapter 55 Verification: Multimodal Application Pipeline & Latency")
    print("=" * 70)
    
    # 1. Section 3 Skenario A: Full Multi-Sensor Influx
    print("\n[Step 1] Skenario A: Operasi Normal 3 Sensor (Visual, Audio, Termal):")
    # 3 Kelas: [0: Normal, 1: Penyusupan, 2: Bahaya/Kebakaran]
    P_v = [0.15, 0.75, 0.10]
    P_a = [0.20, 0.70, 0.10]
    P_t = [0.10, 0.80, 0.10]
    
    gamma_v = 0.85
    gamma_a = 0.60
    gamma_t = 0.75
    
    p_fused_a, alpha_a, pred_a = fuse_multisensor_predictions(
        [P_v, P_a, P_t],
        [gamma_v, gamma_a, gamma_t]
    )
    
    print(f"  Reliability Weights: alpha_v={alpha_a[0]:.6f}, alpha_a={alpha_a[1]:.6f}, alpha_t={alpha_a[2]:.6f}")
    print(f"  Fused Probabilities: Normal={p_fused_a[0]:.4f}, Penyusupan={p_fused_a[1]:.4f}, Bahaya={p_fused_a[2]:.4f}")
    print(f"  Predicted Class: {pred_a} ('Penyusupan')")
    
    # Assertions for Scenario A
    np.testing.assert_allclose(alpha_a, [0.85/2.20, 0.60/2.20, 0.75/2.20], atol=1e-5)
    np.testing.assert_allclose(p_fused_a[1], 0.753409, atol=1e-5)
    np.testing.assert_allclose(p_fused_a[0], 0.146591, atol=1e-5)
    np.testing.assert_allclose(p_fused_a[2], 0.100000, atol=1e-5)
    assert pred_a == 1, "Predicted class must be 1 ('Penyusupan')!"
    print("  -> Scenario A normal operation matches Section 3 derivations exactly.")
    
    # 2. Section 3 Skenario B: Sensor Dropout Resilience (Kamera Buta Asap: gamma_v = 0.0)
    print("\n[Step 2] Skenario B: Sensor Dropout Fallback (gamma_v = 0.0):")
    p_fused_b, alpha_b, pred_b = fuse_multisensor_predictions(
        [P_v, P_a, P_t],
        [0.0, gamma_a, gamma_t]
    )
    
    print(f"  Fallback Weights: alpha_v={alpha_b[0]:.4f}, alpha_a={alpha_b[1]:.6f}, alpha_t={alpha_b[2]:.6f}")
    print(f"  Fallback Probabilities: Normal={p_fused_b[0]:.4f}, Penyusupan={p_fused_b[1]:.4f}, Bahaya={p_fused_b[2]:.4f}")
    print(f"  Fallback Prediction: {pred_b} ('Penyusupan')")
    
    # Assertions for Scenario B
    np.testing.assert_allclose(alpha_b, [0.0, 0.60/1.35, 0.75/1.35], atol=1e-5)
    np.testing.assert_allclose(p_fused_b[1], 0.755556, atol=1e-5)
    assert pred_b == 1, "Fallback predicted class must remain 1 ('Penyusupan')!"
    print("  -> Scenario B sensor dropout fallback operates deterministically with >75% confidence.")
    
    # 3. Section 3 Skenario C: End-to-End Latency & Throughput Profiling
    print("\n[Step 3] Skenario C: Profiling Latensi End-to-End & FPS:")
    t_cap = 2.50
    t_enc_list = [14.00, 4.00, 2.00]  # Visual=14ms, Audio=4ms, Thermal=2ms
    t_sync = 0.50
    t_fuse = 0.80
    t_post = 1.20
    
    t_total, fps, t_enc_max = profile_pipeline_latency(t_cap, t_enc_list, t_sync, t_fuse, t_post)
    print(f"  Capture: {t_cap:.2f} ms | Parallel Encoders (Max): {t_enc_max:.2f} ms")
    print(f"  Sync: {t_sync:.2f} ms | Fusion: {t_fuse:.2f} ms | Post-process: {t_post:.2f} ms")
    print(f"  Total Cycle Latency: {t_total:.2f} ms (Expected: 19.00 ms)")
    print(f"  Throughput: {fps:.2f} FPS (Expected: ~52.63 FPS)")
    
    np.testing.assert_allclose(t_total, 19.00, atol=1e-5)
    np.testing.assert_allclose(fps, 52.631579, atol=1e-4)
    assert fps > 30.0, "Throughput must exceed real-time threshold 30 FPS!"
    print("  -> Latency and FPS profiling match Section 3 derivations with high fidelity.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 55 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
