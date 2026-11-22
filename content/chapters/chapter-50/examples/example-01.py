#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 50: Advanced Vision Model Evaluation
Standalone Academic Verification Script: Precision-Recall Curve, Interpolated AP & Expected Calibration Error (ECE)

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def compute_interpolated_ap(confidences: np.ndarray, is_tp: np.ndarray, num_gt: int) -> tuple:
    """
    Computes Precision-Recall curve and All-Point Interpolated Average Precision (AP).
    """
    # 1. Sort by confidence descending
    sort_indices = np.argsort(-confidences)
    tp_sorted = is_tp[sort_indices]
    
    # 2. Cumulative TP and FP
    cum_tp = np.cumsum(tp_sorted)
    cum_fp = np.cumsum(1 - tp_sorted)
    
    # 3. Precision and Recall vectors
    recalls = cum_tp / num_gt
    precisions = cum_tp / (cum_tp + cum_fp)
    
    # Prepend (0, 1) and append (1, 0) boundaries
    mrec = np.concatenate(([0.0], recalls))
    mpre = np.concatenate(([1.0], precisions))
    
    # 4. All-Point Precision Interpolation: P_interp(r) = max_{r' >= r} P(r')
    for i in range(len(mpre) - 2, -1, -1):
        mpre[i] = max(mpre[i], mpre[i + 1])
        
    # 5. Numerical integration: sum (R_k - R_{k-1}) * P_interp(R_k)
    # Identify indices where recall changes
    i_change = np.where(mrec[1:] != mrec[:-1])[0] + 1
    ap = float(np.sum((mrec[i_change] - mrec[i_change - 1]) * mpre[i_change]))
    
    return ap, recalls, precisions, mrec, mpre

def compute_ece(confidences: np.ndarray, is_correct: np.ndarray, bin_edges: np.ndarray) -> tuple:
    """
    Computes Expected Calibration Error (ECE) across defined confidence bin intervals.
    """
    num_samples = len(confidences)
    ece = 0.0
    bin_stats = []
    
    for i in range(len(bin_edges) - 1):
        low, high = bin_edges[i], bin_edges[i + 1]
        if i == 0:
            mask = (confidences >= low) & (confidences <= high)
        else:
            mask = (confidences > low) & (confidences <= high)
            
        bin_count = np.sum(mask)
        if bin_count > 0:
            acc = float(np.mean(is_correct[mask]))
            conf = float(np.mean(confidences[mask]))
            err = abs(acc - conf)
            ece += (bin_count / num_samples) * err
            bin_stats.append({
                "range": (low, high),
                "count": int(bin_count),
                "acc": acc,
                "conf": conf,
                "err": err
            })
        else:
            bin_stats.append({
                "range": (low, high),
                "count": 0,
                "acc": 0.0,
                "conf": 0.0,
                "err": 0.0
            })
            
    return float(ece), bin_stats

def compute_brier_score(confidences: np.ndarray, is_correct: np.ndarray) -> float:
    """Computes Brier Score for binary confidence predictions: (1/N) * sum (p_i - y_i)^2."""
    return float(np.mean(np.square(confidences - is_correct)))

def main():
    print("=" * 70)
    print("Chapter 50 Verification: Precision-Recall AP & Expected Calibration Error")
    print("=" * 70)
    
    # 1. Setup Exact Worked Example from Section 3
    # 10 detections, 5 ground-truth objects
    confidences = np.array([0.95, 0.90, 0.82, 0.75, 0.68, 0.55, 0.45, 0.35, 0.25, 0.15], dtype=np.float64)
    is_tp = np.array([1, 1, 0, 1, 0, 1, 0, 0, 1, 0], dtype=np.int32)
    num_gt = 5
    
    print("\n[Step 1] Detection Evaluation Data:")
    print(f"Total Detections: {len(confidences)} | Total Ground Truth Objek: {num_gt}")
    for idx, (c, t) in enumerate(zip(confidences, is_tp)):
        print(f"  Det #{idx+1:02d}: Conf={c:.2f} | Status={'TP' if t==1 else 'FP'}")
        
    # 2. Compute Interpolated AP
    ap, recalls, precisions, _, _ = compute_interpolated_ap(confidences, is_tp, num_gt)
    print(f"\n[Step 2] Precision-Recall & Interpolated AP:")
    for i in range(len(confidences)):
        print(f"  Rank #{i+1:02d}: Rec={recalls[i]:.4f}, Prec={precisions[i]:.4f}")
    print(f"Calculated Interpolated AP: {ap:.5f} (Expected: ~0.79446)")
    
    np.testing.assert_allclose(ap, 0.79446, atol=1e-4, err_msg="AP calculation does not match analytical ground truth!")
    print("  -> Interpolated Average Precision (AP) matches Section 3 derivation perfectly.")
    
    # 3. Compute Expected Calibration Error (ECE) on 3 Bins
    bin_edges = np.array([0.0, 0.40, 0.70, 1.00], dtype=np.float64)
    ece, bin_stats = compute_ece(confidences, is_tp, bin_edges)
    
    print(f"\n[Step 3] Calibration Bin Analysis (3 Bins):")
    for idx, b in enumerate(bin_stats):
        print(f"  Bin #{idx+1} ({b['range'][0]:.2f} - {b['range'][1]:.2f}]: Count={b['count']}, Acc={b['acc']:.4f}, Conf={b['conf']:.4f}, AbsErr={b['err']:.4f}")
    print(f"Overall Expected Calibration Error (ECE): {ece:.4f} (Expected: 0.1350)")
    
    np.testing.assert_allclose(ece, 0.1350, atol=1e-4, err_msg="ECE calculation does not match analytical ground truth!")
    print("  -> Expected Calibration Error (ECE) matches Section 3 derivation [0.1350] exactly.")
    
    # 4. Compute Brier Score
    brier = compute_brier_score(confidences, is_tp)
    print(f"\n[Step 4] Brier Score: {brier:.4f}")
    assert 0.0 <= brier <= 1.0, "Brier score must be within [0, 1]!"
    
    # 5. Calibration Post-Processing Effect (Simulated Temperature Scaling)
    print(f"\n[Step 5] Temperature Scaling Post-Processing:")
    # Logit conversion approximation: z = log(p / (1 - p))
    eps = 1e-7
    p_safe = np.clip(confidences, eps, 1.0 - eps)
    logits = np.log(p_safe / (1.0 - p_safe))
    
    # Scale logits by T = 1.3 to soften overconfidence
    T_opt = 1.3
    p_calibrated = 1.0 / (1.0 + np.exp(-logits / T_opt))
    ece_calibrated, _ = compute_ece(p_calibrated, is_tp, bin_edges)
    brier_calibrated = compute_brier_score(p_calibrated, is_tp)
    ap_calibrated, _, _, _, _ = compute_interpolated_ap(p_calibrated, is_tp, num_gt)
    
    print(f"  Pre-calibration ECE:   {ece:.4f} | Brier: {brier:.4f}")
    print(f"  Post-calibration ECE:  {ece_calibrated:.4f} | Brier: {brier_calibrated:.4f} (Calibrated at T={T_opt})")
    print(f"  Post-calibration AP:   {ap_calibrated:.5f} (Rank order preserved identically)")
    assert ap_calibrated == ap, "Temperature scaling must strictly preserve ranking and AP!"
    assert ece_calibrated < ece, "Optimized temperature scaling must reduce calibration error!"
    assert brier_calibrated < brier, "Optimized temperature scaling must reduce Brier score!"
    print("  -> Temperature scaling reduced ECE and Brier score while preserving 100% of detection ranking fidelity.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 50 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
