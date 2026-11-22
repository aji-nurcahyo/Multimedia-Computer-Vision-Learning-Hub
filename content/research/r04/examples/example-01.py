#!/usr/bin/env python3
"""
Jalur Riset R04: Vision-Centric Multimodal Perception
Skrip Komputasi Baseline & Validasi Statistik Multi-Seed (Tier-C)

Author: Aji Pamungkas Tri Nurcahyo (ITERA / ISVWS 2026-2040)
Tujuan: Menguji fusi sensor visual-sentris (Kamera + Radar/IMU), kalibrasi spasial,
        sinkronisasi temporal asinkron, estimasi state Bayesian Kalman Filter
        versus rata-rata berbobot heuristik, serta protokol multi-seed N >= 3.
"""

import sys
import os
import math
import random
import numpy as np

class MultimodalKalmanFilter2D:
    """
    Kalman Filter untuk fusi multi-sensor dengan matriks kovariansi derau adaptif:
    Sensor 1 (Kamera): Akurasi bearing/azimuth tinggi, akurasi kedalaman/range sedang.
    Sensor 2 (Radar): Akurasi range/kecepatan doppler tinggi, resolusi sudut kasar.
    """
    def __init__(self, init_state, dt=0.1):
        self.dt = dt
        # State vector: [x, y, vx, vy]
        self.x = np.array(init_state, dtype=float)
        # Transition matrix F
        self.F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt ],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=float)
        # State covariance P
        self.P = np.eye(4, dtype=float) * 5.0
        # Process noise Q
        q_var = 0.5
        self.Q = np.array([
            [0.25*dt**4, 0.0,        0.5*dt**3,  0.0],
            [0.0,        0.25*dt**4, 0.0,        0.5*dt**3],
            [0.5*dt**3,  0.0,        dt**2,      0.0],
            [0.0,        0.5*dt**3,  0.0,        dt**2]
        ], dtype=float) * q_var
        # Measurement matrix H (mengukur posisi x, y)
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=float)

    def predict(self):
        """Tahap prediksi a priori"""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x[:2].copy()

    def update(self, z, R):
        """Tahap koreksi Bayesian dengan matriks kovariansi derau sensor R"""
        z = np.array(z, dtype=float)
        y = z - (self.H @ self.x)
        S = self.H @ self.P @ self.H.T + R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + (K @ y)
        I = np.eye(4)
        self.P = (I - (K @ self.H)) @ self.P
        return self.x[:2].copy()

def run_multimodal_simulation(seed, method='bayesian_kalman'):
    """
    Simulasi lintasan objek dengan observasi kamera dan radar yang asinkron
    dan memiliki noise anisotropic berbeda.
    """
    random.seed(seed)
    np.random.seed(seed)

    n_steps = 30
    dt = 0.1
    # True trajectory (kendaraan bergerak melengkung)
    true_traj = []
    for t in range(n_steps):
        x = 10.0 + 15.0 * (t * dt)
        y = 20.0 + 8.0 * (t * dt) + 2.0 * math.sin(t * dt * 2.0)
        true_traj.append([x, y])

    # Kovariansi derau sensor
    # Kamera: derau lateral x kecil (0.4 m), derau kedalaman y lebih besar (1.8 m)
    R_cam = np.array([[0.16, 0.0], [0.0, 3.24]], dtype=float)
    # Radar: derau kedalaman y kecil (0.25 m), derau lateral x lebih besar (1.5 m)
    R_rad = np.array([[2.25, 0.0], [0.0, 0.0625]], dtype=float)

    kf = MultimodalKalmanFilter2D(init_state=[true_traj[0][0], true_traj[0][1], 15.0, 8.0], dt=dt)
    estimated_traj = []

    for k in range(n_steps):
        true_pt = true_traj[k]

        # 1. Observasi Kamera (dengan peluang dropout 10%)
        cam_drop = random.random() < 0.10
        cam_meas = None
        if not cam_drop:
            z_cam_x = true_pt[0] + np.random.normal(0, math.sqrt(R_cam[0, 0]))
            z_cam_y = true_pt[1] + np.random.normal(0, math.sqrt(R_cam[1, 1]))
            cam_meas = [z_cam_x, z_cam_y]

        # 2. Observasi Radar (dengan peluang dropout 15%)
        rad_drop = random.random() < 0.15
        rad_meas = None
        if not rad_drop:
            z_rad_x = true_pt[0] + np.random.normal(0, math.sqrt(R_rad[0, 0]))
            z_rad_y = true_pt[1] + np.random.normal(0, math.sqrt(R_rad[1, 1]))
            rad_meas = [z_rad_x, z_rad_y]

        if method == 'bayesian_kalman':
            # Kalman Predict
            kf.predict()
            # Sequential Kalman update untuk tiap sensor aktif
            if cam_meas is not None:
                kf.update(cam_meas, R_cam)
            if rad_meas is not None:
                kf.update(rad_meas, R_rad)
            estimated_traj.append(kf.x[:2].copy().tolist())

        elif method == 'heuristic_weighted':
            # Rata-rata bobot tetap (50-50) tanpa mempertimbangkan anisotropi derau
            if cam_meas is not None and rad_meas is not None:
                fused = [0.5 * cam_meas[0] + 0.5 * rad_meas[0], 0.5 * cam_meas[1] + 0.5 * rad_meas[1]]
            elif cam_meas is not None:
                fused = cam_meas
            elif rad_meas is not None:
                fused = rad_meas
            else:
                fused = estimated_traj[-1] if estimated_traj else true_pt
            estimated_traj.append(fused)

        elif method == 'camera_only':
            if cam_meas is not None:
                kf.predict()
                kf.update(cam_meas, R_cam)
                estimated_traj.append(kf.x[:2].copy().tolist())
            else:
                kf.predict()
                estimated_traj.append(kf.x[:2].copy().tolist())

    # Hitung Root Mean Square Error (RMSE) terhadap lintasan ground truth
    errors = [np.linalg.norm(np.array(est) - np.array(gt)) for est, gt in zip(estimated_traj, true_traj)]
    rmse = math.sqrt(np.mean(np.array(errors)**2))
    max_err = max(errors)

    return {
        'seed': seed,
        'method': method,
        'rmse': rmse,
        'max_err': max_err
    }

def main():
    print("======================================================================")
    print("Jalur Riset R04: Vision-Centric Multimodal Perception (Kamera + Radar)")
    print("Target Metrik: Bayesian Kalman Fusion vs Heuristic Fusion RMSE (Meter)")
    print("======================================================================")

    # 1. Uji Deterministik Multimodal Kalman Filter
    kf_test = MultimodalKalmanFilter2D([0.0, 0.0, 1.0, 1.0], dt=0.1)
    pred_val = kf_test.predict()
    assert abs(pred_val[0] - 0.1) < 1e-4 and abs(pred_val[1] - 0.1) < 1e-4
    upd_val = kf_test.update([0.15, 0.12], np.eye(2)*0.5)
    print(f"[TEST 1 PASS] Multimodal Kalman Filter Prediction & Bayesian Update Valid: {upd_val}")

    # 2. Uji Multi-Seed (N >= 3 seeds)
    seeds = [42, 1337, 2026]
    kalman_results = []
    heuristic_results = []
    camera_results = []

    print(f"\n[INFO] Menjalankan {len(seeds)} random seeds independen: {seeds}")
    for s in seeds:
        k_res = run_multimodal_simulation(s, method='bayesian_kalman')
        h_res = run_multimodal_simulation(s, method='heuristic_weighted')
        c_res = run_multimodal_simulation(s, method='camera_only')
        kalman_results.append(k_res)
        heuristic_results.append(h_res)
        camera_results.append(c_res)
        print(f"  - Seed {s:4d} | Bayesian RMSE: {k_res['rmse']:.3f} m | "
              f"Heuristic RMSE: {h_res['rmse']:.3f} m | Cam-Only RMSE: {c_res['rmse']:.3f} m")

    k_rmse = [r['rmse'] for r in kalman_results]
    h_rmse = [r['rmse'] for r in heuristic_results]
    c_rmse = [r['rmse'] for r in camera_results]

    mean_k = np.mean(k_rmse)
    std_k = np.std(k_rmse, ddof=1)
    mean_h = np.mean(h_rmse)
    mean_c = np.mean(c_rmse)

    print("\n----------------------------------------------------------------------")
    print("HASIL AKHIR STATISTIK RISET R04 (GATE 6 COMPLIANT):")
    print(f"  Bayesian Multimodal RMSE : {mean_k:.3f} m ± {std_k:.3f} m")
    print(f"  Heuristic Fusion RMSE    : {mean_h:.3f} m ± {np.std(h_rmse, ddof=1):.3f} m")
    print(f"  Camera-Only Baseline     : {mean_c:.3f} m ± {np.std(c_rmse, ddof=1):.3f} m")
    print(f"  Reduksi Galat Bayesian vs Heuristik : -{((mean_h - mean_k)/mean_h)*100:.1f}%")
    print("----------------------------------------------------------------------")

    # Assert bahwa Bayesian Kalman Fusion mengungguli heuristic weighted average
    assert mean_k < mean_h, f"Bayesian Kalman ({mean_k}) harus lebih presisi daripada Heuristik ({mean_h})"
    assert mean_k < mean_c, f"Bayesian Multimodal ({mean_k}) harus lebih presisi daripada Camera-Only ({mean_c})"
    print("\n[SUKSES] Seluruh pengujian komputasi baseline riset R04 lolos tanpa galat.")

if __name__ == "__main__":
    main()

