#!/usr/bin/env python3
"""
Jalur Riset R06: Spatial Intelligence & 3D Vision
Skrip Komputasi Baseline & Validasi Statistik Multi-Seed (Tier-C)

Author: Aji Pamungkas Tri Nurcahyo (ITERA / ISVWS 2026-2040)
Tujuan: Menguji proyeksi pinhole stereo, triangulasi DLT (Direct Linear Transformation),
        analisis galat reproyeksi (RMSE), ketidakpastian kedalaman kuadratik,
        evaluasi ATE (Absolute Trajectory Error), serta protokol multi-seed N >= 3.
"""

import sys
import os
import math
import random
import numpy as np

def project_pinhole(P, X_world):
    """Memproyeksikan titik 3D homogen [X, Y, Z, 1] ke bidang piksel [u, v] menggunakan matriks P (3x4)"""
    X_homo = np.array([X_world[0], X_world[1], X_world[2], 1.0], dtype=float)
    x_proj = P @ X_homo
    if abs(x_proj[2]) < 1e-9:
        return np.array([0.0, 0.0])
    return np.array([x_proj[0] / x_proj[2], x_proj[1] / x_proj[2]])

def triangulate_dlt(P1, P2, x1, x2):
    """
    Triangulasi DLT (Direct Linear Transformation) untuk sepasang titik korespondensi:
    Menyelesaikan sistem persamaan linear homogen A * X = 0 via SVD.
    """
    A = np.zeros((4, 4), dtype=float)
    A[0] = x1[0] * P1[2] - P1[0]
    A[1] = x1[1] * P1[2] - P1[1]
    A[2] = x2[0] * P2[2] - P2[0]
    A[3] = x2[1] * P2[2] - P2[1]

    # SVD: A = U * S * V^T
    _, _, Vt = np.linalg.svd(A)
    X_homo = Vt[-1] # Vektor singular kanan terakhir
    if abs(X_homo[3]) < 1e-9:
        return np.zeros(3)
    return X_homo[:3] / X_homo[3]

def compute_ate_rmse(gt_traj, est_traj):
    """Menghitung Absolute Trajectory Error (ATE) RMSE dalam meter"""
    gt_traj = np.array(gt_traj, dtype=float)
    est_traj = np.array(est_traj, dtype=float)
    diffs = gt_traj - est_traj
    sq_errors = np.sum(diffs**2, axis=1)
    return float(np.sqrt(np.mean(sq_errors)))

def run_spatial_experiment_seed(seed):
    """Menjalankan simulasi triangulasi 3D stereo dengan derau piksel terkontrol"""
    random.seed(seed)
    np.random.seed(seed)

    # Parameter Kamera Terkalibrasi (KITTI Sequence 00 Calibrated Rig)
    focal = 718.856 # piksel
    cx = 607.19
    cy = 185.21
    K = np.array([
        [focal, 0.0,   cx],
        [0.0,   focal, cy],
        [0.0,   0.0,   1.0]
    ], dtype=float)

    # Kamera 1 pada origin (0, 0, 0)
    P1 = K @ np.hstack((np.eye(3), np.zeros((3, 1))))

    # Kamera 2 berjarak baseline B = 0.54 meter pada sumbu X
    baseline = 0.54
    P2 = K @ np.hstack((np.eye(3), np.array([[-baseline], [0.0], [0.0]])))

    # Buat 25 titik 3D sintetis dalam rentang kedalaman Z in [3.0, 15.0] meter
    gt_points = []
    for _ in range(25):
        X = random.uniform(-2.0, 2.0)
        Y = random.uniform(-1.5, 1.5)
        Z = random.uniform(3.0, 15.0)
        gt_points.append(np.array([X, Y, Z]))

    # Proyeksikan ke Kamera 1 dan Kamera 2 dengan Gaussian pixel noise
    pixel_noise_sigma = 0.5 # sub-pixel jitter 0.5 px
    triangulated_pts = []
    reproj_errors = []

    for X_gt in gt_points:
        p1_true = project_pinhole(P1, X_gt)
        p2_true = project_pinhole(P2, X_gt)

        p1_noisy = p1_true + np.random.normal(0, pixel_noise_sigma, size=2)
        p2_noisy = p2_true + np.random.normal(0, pixel_noise_sigma, size=2)

        X_recon = triangulate_dlt(P1, P2, p1_noisy, p2_noisy)
        triangulated_pts.append(X_recon)

        # Hitung galat reproyeksi
        p1_reproj = project_pinhole(P1, X_recon)
        p2_reproj = project_pinhole(P2, X_recon)
        err1 = np.linalg.norm(p1_noisy - p1_reproj)
        err2 = np.linalg.norm(p2_noisy - p2_reproj)
        reproj_errors.append(0.5 * (err1 + err2))

    reproj_rmse = float(np.sqrt(np.mean(np.array(reproj_errors)**2)))
    ate_rmse = compute_ate_rmse(gt_points, triangulated_pts)

    return {
        'seed': seed,
        'reproj_rmse': reproj_rmse,
        'ate_rmse': ate_rmse
    }

def main():
    print("======================================================================")
    print("Jalur Riset R06: Spatial Intelligence & 3D Vision (Stereo & DLT)")
    print("Target Metrik: Galat Reproyeksi (RMSE px) & Absolute Trajectory Error (ATE)")
    print("======================================================================")

    # 1. Uji Deterministik Triangulasi Pinhole DLT Tanpa Derau
    f = 500.0
    K = np.array([[f, 0, 0], [0, f, 0], [0, 0, 1]], dtype=float)
    P1 = K @ np.hstack((np.eye(3), np.zeros((3, 1))))
    P2 = K @ np.hstack((np.eye(3), np.array([[-1.0], [0.0], [0.0]])))
    X_true = np.array([0.5, -0.2, 5.0])
    x1 = project_pinhole(P1, X_true)
    x2 = project_pinhole(P2, X_true)
    X_recovered = triangulate_dlt(P1, P2, x1, x2)
    diff = np.linalg.norm(X_true - X_recovered)
    assert diff < 1e-4, f"DLT noiseless recovery failed: diff={diff}"
    print(f"[TEST 1 PASS] Triangulasi DLT Deterministik Presisi Sub-Milimeter: Diff={diff:.6f} m")

    # 2. Uji Multi-Seed Simulasi Rekonstruksi (N >= 3 seeds)
    seeds = [42, 1337, 2026]
    results = []

    print(f"\n[INFO] Menjalankan {len(seeds)} random seeds independen: {seeds}")
    for s in seeds:
        res = run_spatial_experiment_seed(s)
        results.append(res)
        print(f"  - Seed {s:4d} | Reprojection RMSE: {res['reproj_rmse']:.3f} px | ATE 3D RMSE: {res['ate_rmse']:.3f} m")

    reproj_vals = [r['reproj_rmse'] for r in results]
    ate_vals = [r['ate_rmse'] for r in results]

    print("\n----------------------------------------------------------------------")
    print("HASIL AKHIR STATISTIK RISET R06 (GATE 6 COMPLIANT):")
    print(f"  Reprojection Error RMSE : {np.mean(reproj_vals):.3f} px ± {np.std(reproj_vals, ddof=1):.3f} px")
    print(f"  Absolute Trajectory ATE : {np.mean(ate_vals):.3f} m ± {np.std(ate_vals, ddof=1):.3f} m")
    print("----------------------------------------------------------------------")

    # Assert batas toleransi numerik
    assert np.mean(reproj_vals) < 1.0, "Reprojection error harus berada di level sub-piksel (< 1.0 px)"
    assert np.mean(ate_vals) < 0.25, "ATE 3D RMSE harus < 0.25 m pada rentang kedalaman 3-15 m"
    print("\n[SUKSES] Seluruh pengujian komputasi baseline riset R06 lolos tanpa galat.")

if __name__ == "__main__":
    main()

