"""
Chapter 39 - Stereo Vision & Depth Estimation
Academic Reference Implementation & Deterministic Verification
Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
"""

import numpy as np
import cv2

def compute_depth_from_disparity(disparity_px: float, focal_length_px: float, baseline_m: float) -> float:
    """Menghitung kedalaman metrik Z dari nilai disparitas horizontal."""
    if disparity_px <= 0:
        return float('inf')
    return float((focal_length_px * baseline_m) / disparity_px)

def calculate_depth_uncertainty(depth_m: float, focal_length_px: float, baseline_m: float, delta_d_px: float = 1.0) -> float:
    """Menghitung ketidakpastian kedalaman metrik delta_Z berdasarkan galat disparitas."""
    return float(((depth_m ** 2) / (focal_length_px * baseline_m)) * delta_d_px)

def reproject_disparity_to_3d_point(u: float, v: float, disparity_px: float, K: np.ndarray, baseline_m: float) -> np.ndarray:
    """Rekonstruksi koordinat fisik 3D (X, Y, Z) dari piksel citra kiri dan disparitas."""
    fx = K[0, 0]
    cx = K[0, 2]
    cy = K[1, 2]
    
    Z = compute_depth_from_disparity(disparity_px, fx, baseline_m)
    X = ((u - cx) * Z) / fx
    Y = ((v - cy) * Z) / fx
    return np.array([X, Y, Z], dtype=np.float64)

def test_chapter_39_stereo():
    print("=== Menjalankan Verifikasi Bab 39: Stereo Vision ===")
    
    # 1. Verifikasi Triangulasi Numerik (Kasus dari index.md)
    f = 800.0   # piksel
    B = 0.20    # meter (20 cm)
    d = 32.0    # piksel
    
    Z = compute_depth_from_disparity(d, f, B)
    expected_Z = 5.0  # meter
    assert np.isclose(Z, expected_Z, atol=1e-5), f"Estimasi kedalaman salah: {Z} vs {expected_Z}"
    
    # 2. Verifikasi Rekonstruksi Titik 3D Penuh
    K = np.array([
        [800.0, 0.0, 320.0],
        [0.0, 800.0, 240.0],
        [0.0, 0.0, 1.0]
    ], dtype=np.float64)
    
    P_3d = reproject_disparity_to_3d_point(380.0, 240.0, d, K, B)
    expected_P = np.array([0.375, 0.0, 5.0], dtype=np.float64)
    assert np.allclose(P_3d, expected_P, atol=1e-5), f"Rekonstruksi 3D salah: {P_3d} vs {expected_P}"
    
    # 3. Verifikasi Analisis Sensitivitas Kuadratik
    delta_Z_5m = calculate_depth_uncertainty(5.0, f, B, delta_d_px=1.0)
    expected_err_5m = 25.0 / 160.0  # ~0.15625 meter
    assert np.isclose(delta_Z_5m, expected_err_5m, atol=1e-5), f"Galat sensitivitas 5m salah: {delta_Z_5m}"
    
    delta_Z_20m = calculate_depth_uncertainty(20.0, f, B, delta_d_px=1.0)
    expected_err_20m = 400.0 / 160.0  # 2.50 meter
    assert np.isclose(delta_Z_20m, expected_err_20m, atol=1e-5), f"Galat sensitivitas 20m salah: {delta_Z_20m}"
    # Buktikan pertumbuhan kuadratik: 20m adalah 4x jarak 5m -> galat harus 16x lipat!
    ratio = delta_Z_20m / delta_Z_5m
    assert np.isclose(ratio, 16.0, atol=1e-5), f"Pertumbuhan kuadratik gagal: rasio = {ratio}"
    
    # 4. Verifikasi Kendala Epipolar Fundamental xR^T * F * xL = 0
    # Misalkan pasangan kamera stereo paralel murni (translasi murni Tx = -B)
    t = np.array([-B, 0.0, 0.0])
    R = np.eye(3)
    tx = np.array([
        [0, -t[2], t[1]],
        [t[2], 0, -t[0]],
        [-t[1], t[0], 0]
    ])
    E = tx @ R
    K_inv = np.linalg.inv(K)
    F = K_inv.T @ E @ K_inv
    
    # Titik piksel kiri dan kanan terektifikasi
    xL = np.array([380.0, 240.0, 1.0])
    xR = np.array([348.0, 240.0, 1.0])  # y sama karena terektifikasi
    epipolar_val = float(xR.T @ F @ xL)
    assert np.isclose(epipolar_val, 0.0, atol=1e-7), f"Kendala epipolar tidak terpenuhi: {epipolar_val}"
    
    print(f"PASS Ch 39: Disparity={d}px -> Depth={Z}m, 3D Point={P_3d}, Sensitivity Ratio 20m/5m={ratio:.1f}x, Epipolar Val={epipolar_val:.2e}")

if __name__ == '__main__':
    test_chapter_39_stereo()
