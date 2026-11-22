"""
ADV-04: Advanced Deep Visual Recognition & Attention Mechanisms
Verification of Scaled Dot-Product Attention, Deformable Sampling, IoU/GIoU, and DETR Hungarian Matching

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
Level: L3 Advanced Curriculum
"""

import numpy as np

def scaled_dot_product_attention(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Scaled Dot-Product Attention: Attention(Q, K, V) = Softmax(Q K^T / sqrt(d_k)) V
    Q: [Tq, dk], K: [Tk, dk], V: [Tk, dv]
    """
    dk = Q.shape[-1]
    scale = 1.0 / np.sqrt(max(1, dk))
    scores = (Q @ K.T) * scale
    
    # Numerically stable softmax
    scores_max = np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(scores - scores_max)
    weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    
    output = weights @ V
    return weights, output

def bilinear_interpolate_2d(grid: np.ndarray, x: float, y: float) -> float:
    """
    Bilinear interpolation on 2D grid at sub-pixel coordinate (x, y)
    """
    H, W = grid.shape
    x_clamped = np.clip(x, 0.0, W - 1.0)
    y_clamped = np.clip(y, 0.0, H - 1.0)
    
    x0 = int(np.floor(x_clamped))
    x1 = min(W - 1, x0 + 1)
    y0 = int(np.floor(y_clamped))
    y1 = min(H - 1, y0 + 1)
    
    wx = x_clamped - x0
    wy = y_clamped - y0
    
    top = (1.0 - wx) * grid[y0, x0] + wx * grid[y0, x1]
    bottom = (1.0 - wx) * grid[y1, x0] + wx * grid[y1, x1]
    return float((1.0 - wy) * top + wy * bottom)

def box_iou_and_giou(boxA: np.ndarray, boxB: np.ndarray) -> tuple[float, float]:
    """
    Compute standard IoU and Generalized IoU (GIoU)
    Boxes format: [x1, y1, x2, y2]
    """
    ax1, ay1, ax2, ay2 = boxA
    bx1, by1, bx2, by2 = boxB
    
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    
    iw = max(0.0, ix2 - ix1)
    ih = max(0.0, iy2 - iy1)
    intersection = iw * ih
    
    areaA = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    areaB = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    union = areaA + areaB - intersection
    iou = intersection / union if union > 0 else 0.0
    
    # Smallest enclosing convex box C
    cx1 = min(ax1, bx1)
    cy1 = min(ay1, by1)
    cx2 = max(ax2, bx2)
    cy2 = max(ay2, by2)
    areaC = max(1e-8, (cx2 - cx1) * (cy2 - cy1))
    
    giou = iou - (areaC - union) / areaC
    return float(iou), float(giou)

def focal_loss(p: float, y: int, alpha: float = 0.25, gamma: float = 2.0) -> float:
    """
    Focal Loss: FL(pt) = -alpha_t * (1 - pt)^gamma * log(pt)
    """
    pt = p if y == 1 else (1.0 - p)
    pt = max(1e-7, min(1.0 - 1e-7, pt))
    alpha_t = alpha if y == 1 else (1.0 - alpha)
    return float(-alpha_t * ((1.0 - pt) ** gamma) * np.log(pt))

def solve_hungarian_bipartite(cost_matrix: np.ndarray) -> tuple[list, float]:
    """
    Kuhn-Munkres optimal linear sum assignment problem solver
    """
    try:
        from scipy.optimize import linear_sum_assignment
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        matches = list(zip(row_ind, col_ind))
        total_cost = float(cost_matrix[row_ind, col_ind].sum())
        return matches, total_cost
    except ImportError:
        # Pure NumPy fallback via permutation search for small matrices
        N, M = cost_matrix.shape
        if N <= M:
            import itertools
            best_cost = float('inf')
            best_perm = None
            for p in itertools.permutations(range(M), N):
                c = sum(cost_matrix[i, p[i]] for i in range(N))
                if c < best_cost:
                    best_cost = c
                    best_perm = p
            matches = [(i, best_perm[i]) for i in range(N)]
            return matches, best_cost
        return [], 0.0

def main():
    print("=" * 70)
    print("ADV-04: ADVANCED DEEP RECOGNITION & ATTENTION MECHANISMS")
    print("Verification of Attention Math, Deformable Sampling, GIoU, and DETR Loss")
    print("=" * 70)
    
    # 1. Test Scaled Dot-Product Attention
    Q = np.array([[1.0, 0.0, 0.5], [0.0, 1.0, 0.2]], dtype=np.float64) # [2, 3]
    K = np.array([[1.0, 0.0, 0.5], [0.0, 1.0, 0.2], [0.5, 0.5, 0.0]], dtype=np.float64) # [3, 3]
    V = np.array([[10.0, 0.0], [0.0, 20.0], [5.0, 5.0]], dtype=np.float64) # [3, 2]
    
    weights, output = scaled_dot_product_attention(Q, K, V)
    print("\n[1] Scaled Dot-Product Attention:")
    print(f"    Attention Weights Shape: {weights.shape}")
    print(f"    Row 0 Weights Sum:       {np.sum(weights[0]):.6f} (Must be exactly 1.0)")
    print(f"    Row 1 Weights Sum:       {np.sum(weights[1]):.6f} (Must be exactly 1.0)")
    print(f"    Query 0 Attends to Key 0: {weights[0, 0]:.4f} (Dominant attention)")
    assert np.allclose(np.sum(weights, axis=-1), 1.0), "Attention weights must sum to 1.0"
    print("    -> Softmax Normalization Invariant: PASS")
    
    # 2. Test Bilinear Sub-Pixel Interpolation
    grid = np.array([[0.0, 10.0], [20.0, 30.0]], dtype=np.float64)
    center_val = bilinear_interpolate_2d(grid, 0.5, 0.5)
    print("\n[2] Deformable Bilinear Sampling:")
    print(f"    Center (0.5, 0.5) Interpolated Value: {center_val:.2f} (Expected: 15.00)")
    assert abs(center_val - 15.0) < 1e-4, "Bilinear interpolation failed"
    print("    -> Sub-Pixel Sampling Accuracy: PASS")
    
    # 3. Test IoU, GIoU, and Focal Loss
    box1 = np.array([0.0, 0.0, 10.0, 10.0])
    box2 = np.array([5.0, 0.0, 15.0, 10.0]) # 50% overlap in x
    iou, giou = box_iou_and_giou(box1, box2)
    print("\n[3] Bounding Box Metrics (IoU & GIoU):")
    print(f"    Box 1: {box1.tolist()} | Box 2: {box2.tolist()}")
    print(f"    Standard IoU: {iou:.4f} (Expected: 0.3333)")
    print(f"    Generalized GIoU: {giou:.4f} (Expected: 0.3333)")
    assert abs(iou - 1.0 / 3.0) < 1e-4, "IoU calculation error"
    assert abs(giou - 1.0 / 3.0) < 1e-4, "GIoU calculation error"
    
    # Disjoint boxes test
    box3 = np.array([30.0, 30.0, 40.0, 40.0])
    iou_disjoint, giou_disjoint = box_iou_and_giou(box1, box3)
    print(f"    Disjoint Boxes -> IoU: {iou_disjoint:.4f}, GIoU: {giou_disjoint:.4f} (Negative Gradient Signal)")
    assert iou_disjoint == 0.0 and giou_disjoint < 0.0, "Disjoint boxes must have IoU=0 and GIoU < 0"
    print("    -> Bounding Box Metrics Assertion: PASS")
    
    fl_easy = focal_loss(0.99, 1, alpha=0.25, gamma=2.0)
    fl_hard = focal_loss(0.10, 1, alpha=0.25, gamma=2.0)
    print(f"\n[4] Focal Loss Modulation (gamma = 2.0):")
    print(f"    Easy Positive (p = 0.99) Loss: {fl_easy:.8f}")
    print(f"    Hard Positive (p = 0.10) Loss: {fl_hard:.4f} ({fl_hard / max(1e-8, fl_easy):.1f}x higher gradient)")
    assert fl_easy < 1e-4 and fl_hard > 0.4, "Focal loss behavior invalid"
    print("    -> Focal Loss Gradient Modulation: PASS")
    
    # 5. DETR Bipartite Matching Cost
    print("\n[5] DETR Bipartite Assignment Optimization:")
    cost_matrix = np.array([
        [0.85, 3.40],  # Query 0: matches Target 0 well
        [4.10, 0.95]   # Query 1: matches Target 1 well
    ], dtype=np.float64)
    matches, total_cost = solve_hungarian_bipartite(cost_matrix)
    print(f"    Cost Matrix C:\n{cost_matrix}")
    print(f"    Optimal Hungarian Matches: {matches}")
    print(f"    Total Matching Cost:       {total_cost:.4f}")
    assert matches == [(0, 0), (1, 1)] and abs(total_cost - 1.80) < 1e-4
    print("    -> DETR Hungarian Matching Optimization: PASS")
    
    print("\n" + "=" * 70)
    print("ALL ADV-04 DEEP RECOGNITION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    main()

