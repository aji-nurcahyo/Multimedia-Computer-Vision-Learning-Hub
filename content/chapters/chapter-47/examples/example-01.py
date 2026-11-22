"""
Chapter 47: Human Pose Estimation & Landmark Detection
Standalone Python Implementation: 2D Gaussian Heatmap Generation,
Argmax Coordinate Decoding, and Object Keypoint Similarity (OKS).

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import math
import numpy as np


def generate_gaussian_heatmap(h: int, w: int, center_x: float, center_y: float, sigma: float = 2.0) -> np.ndarray:
    """Generate a 2D Gaussian heatmap centered at (center_x, center_y)."""
    y_coords, x_coords = np.ogrid[:h, :w]
    d2 = (x_coords - center_x)**2 + (y_coords - center_y)**2
    heatmap = np.exp(-d2 / (2.0 * sigma**2))
    return heatmap


def decode_keypoint_from_heatmap(heatmap: np.ndarray) -> tuple[int, int, float]:
    """Extract integer argmax peak coordinates and confidence score from a heatmap."""
    idx = np.argmax(heatmap)
    y, x = np.unravel_index(idx, heatmap.shape)
    confidence = float(heatmap[y, x])
    return int(x), int(y), confidence


def compute_oks(
    pred_keypoints: np.ndarray,
    gt_keypoints: np.ndarray,
    scale: float,
    kappas: np.ndarray
) -> float:
    """
    Calculate Object Keypoint Similarity (OKS).
    pred_keypoints: shape (K, 2)
    gt_keypoints: shape (K, 2)
    scale: object scale (sqrt(box_area))
    kappas: per-keypoint constant array of shape (K,)
    """
    dists = np.linalg.norm(pred_keypoints - gt_keypoints, axis=-1)
    variance = 2.0 * (scale**2) * (kappas**2)
    similarities = np.exp(-(dists**2) / variance)
    return float(np.mean(similarities))


def main():
    print("=== Chapter 47: Human Pose Estimation & Landmark Detection ===")

    # 1. Test 2D Gaussian Heatmap Generation & Decoding
    h, w = 64, 48
    target_x, target_y = 24.0, 32.0
    hm = generate_gaussian_heatmap(h, w, target_x, target_y, sigma=2.0)
    print(f"[Check 1] Generated Heatmap Shape: {hm.shape}, Max Peak: {np.max(hm):.4f}")
    assert np.isclose(np.max(hm), 1.0)

    dec_x, dec_y, conf = decode_keypoint_from_heatmap(hm)
    print(f"[Check 2] Decoded Peak: ({dec_x}, {dec_y}) with Conf: {conf:.4f} (Expected: ({int(target_x)}, {int(target_y)}))")
    assert (dec_x, dec_y) == (int(target_x), int(target_y))
    assert np.isclose(conf, 1.0)

    # 2. Test Worked OKS Example from Section 3 of Lecture
    # 2 keypoints: Nose (kappa=0.026), Wrist (kappa=0.062)
    # Box: w=100, h=400 -> scale = 200.0
    scale = 200.0
    gt_kpts = np.array([
        [50.0, 40.0],   # Nose
        [80.0, 200.0]   # Wrist
    ], dtype=np.float64)

    pred_kpts = np.array([
        [52.0, 40.0],   # Nose dist = 2.0
        [84.0, 203.0]   # Wrist dist = 5.0
    ], dtype=np.float64)

    kappas = np.array([0.026, 0.062], dtype=np.float64)

    oks_val = compute_oks(pred_kpts, gt_kpts, scale, kappas)
    print(f"\n[Check 3] Calculated OKS Score: {oks_val:.4f} (Expected: ~0.9253)")
    assert np.isclose(oks_val, 0.9253, atol=1e-3)

    # 3. Test Invariance to Scale: if errors and scale double, OKS must remain identical
    scale_2x = scale * 2.0
    gt_kpts_2x = gt_kpts * 2.0
    pred_kpts_2x = pred_kpts * 2.0
    oks_val_2x = compute_oks(pred_kpts_2x, gt_kpts_2x, scale_2x, kappas)
    print(f"[Check 4] Scale Invariance Check OKS(2x): {oks_val_2x:.4f}")
    assert np.isclose(oks_val, oks_val_2x, atol=1e-5)

    print("\nAll Chapter 47 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
