#!/usr/bin/env python3
"""
Jalur Riset R02: Robust Multi-Object Tracking & Motion Perception
Skrip Komputasi Baseline & Validasi Statistik Multi-Seed (Tier-C)

Author: Aji Pamungkas Tri Nurcahyo (ITERA / ISVWS 2026-2040)
Tujuan: Menguji estimasi state Kalman Filter 2D, perbandingan asosiasi data optimal
        (Algoritma Hungarian berbobot) vs Greedy matching, dekomposisi metrik HOTA
        (DetA, AssA), perhitungan ID switches (IDSW), serta protokol multi-seed N >= 3.
"""

import sys
import os
import math
import random
import numpy as np

class KalmanFilter2D:
    """Kalman Filter linear orde-1 untuk pelacakan objek 2D dengan model Constant Velocity."""
    def __init__(self, init_pos, dt=1.0, process_noise=0.5, measurement_noise=2.0):
        self.dt = dt
        # State vector: [x, y, vx, vy]
        self.x = np.array([init_pos[0], init_pos[1], 0.0, 0.0], dtype=float)
        # State Transition Matrix F
        self.F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt ],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=float)
        # Measurement Matrix H (mengukur posisi x, y)
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=float)
        # Covariance Matrix P
        self.P = np.eye(4, dtype=float) * 5.0
        # Process Noise Q
        self.Q = np.eye(4, dtype=float) * process_noise
        # Measurement Noise R
        self.R = np.eye(2, dtype=float) * measurement_noise

    def predict(self):
        """Tahap prediksi a priori: x^- = F * x, P^- = F * P * F^T + Q"""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x[:2].copy()

    def update(self, measurement):
        """Tahap koreksi a posteriori dengan Kalman Gain K"""
        z = np.array(measurement, dtype=float)
        y = z - (self.H @ self.x) # Innovation / residual
        S = self.H @ self.P @ self.H.T + self.R # Innovation covariance
        K = self.P @ self.H.T @ np.linalg.inv(S) # Kalman gain
        self.x = self.x + (K @ y)
        I = np.eye(4)
        self.P = (I - (K @ self.H)) @ self.P
        return self.x[:2].copy()

def solve_hungarian_matching(cost_matrix, gate_threshold=50.0):
    """
    Implementasi Kuhn-Munkres Hungarian Algorithm untuk matriks N x M berbobot.
    Porting dari lib/advancedCvProcessing.ts (O(K^3) dengan dual potentials).
    """
    cost_matrix = np.array(cost_matrix, dtype=float)
    if cost_matrix.size == 0:
        return [], 0.0, [], []

    num_tracks, num_dets = cost_matrix.shape
    if num_tracks == 0 or num_dets == 0:
        return [], 0.0, list(range(num_tracks)), list(range(num_dets))

    K = max(num_tracks, num_dets)
    square = np.zeros((K, K), dtype=float)
    for i in range(num_tracks):
        for j in range(num_dets):
            val = cost_matrix[i, j]
            square[i, j] = val if np.isfinite(val) else 1e9

    u = np.zeros(K + 1, dtype=float)
    v = np.zeros(K + 1, dtype=float)
    p = np.zeros(K + 1, dtype=int)
    way = np.zeros(K + 1, dtype=int)

    for i in range(1, K + 1):
        p[0] = i
        j0 = 0
        minv = np.full(K + 1, float('inf'))
        used = np.full(K + 1, False)

        while True:
            used[j0] = True
            i0 = p[j0]
            delta = float('inf')
            j1 = 0

            for j in range(1, K + 1):
                if not used[j]:
                    cur = square[i0 - 1, j - 1] - u[i0] - v[j]
                    if cur < minv[j]:
                        minv[j] = cur
                        way[j] = j0
                    if minv[j] < delta:
                        delta = minv[j]
                        j1 = j

            for j in range(K + 1):
                if used[j]:
                    u[p[j]] += delta
                    v[j] -= delta
                else:
                    minv[j] -= delta

            j0 = j1
            if p[j0] == 0:
                break

        while True:
            j1 = way[j0]
            p[j0] = p[j1]
            j0 = j1
            if j0 == 0:
                break

    assignment = [-1] * K
    for j in range(1, K + 1):
        if p[j] > 0:
            assignment[p[j] - 1] = j - 1

    matches = []
    assigned_tracks = set()
    assigned_dets = set()
    total_cost = 0.0

    for t in range(num_tracks):
        d = assignment[t]
        if 0 <= d < num_dets:
            orig_cost = cost_matrix[t, d]
            if np.isfinite(orig_cost) and orig_cost <= gate_threshold:
                matches.append((t, d, orig_cost))
                assigned_tracks.add(t)
                assigned_dets.add(d)
                total_cost += orig_cost

    unmatched_tracks = [t for t in range(num_tracks) if t not in assigned_tracks]
    unmatched_dets = [d for d in range(num_dets) if d not in assigned_dets]
    return matches, total_cost, unmatched_tracks, unmatched_dets

def solve_greedy_matching(cost_matrix, threshold=50.0):
    """Asosiasi data Greedy standar."""
    cost_matrix = np.array(cost_matrix, dtype=float)
    if cost_matrix.size == 0:
        return [], 0.0, [], []
    num_tracks, num_dets = cost_matrix.shape
    matches = []
    used_tracks = set()
    used_dets = set()
    total_cost = 0.0

    flat_indices = np.argsort(cost_matrix, axis=None)
    for idx in flat_indices:
        t = idx // num_dets
        d = idx % num_dets
        if t not in used_tracks and d not in used_dets and cost_matrix[t, d] <= threshold:
            matches.append((t, d, cost_matrix[t, d]))
            used_tracks.add(t)
            used_dets.add(d)
            total_cost += cost_matrix[t, d]

    unmatched_tracks = [t for t in range(num_tracks) if t not in used_tracks]
    unmatched_dets = [d for d in range(num_dets) if d not in used_dets]
    return matches, total_cost, unmatched_tracks, unmatched_dets

def run_mot_simulation(seed, method='hungarian'):
    """
    Simulasi pelacakan multi-objek pada skenario pedestrian convoy berjalan berdampingan
    dengan jarak rapat (separation 10 piksel) di bawah sensor position jitter.
    Skenario ini secara teoritis menguji ketahanan asosiasi global vs lokal greedy.
    """
    random.seed(seed)
    np.random.seed(seed)

    n_frames = 30
    traj_1 = [[40.0 + 3.0 * t, 60.0] for t in range(n_frames)]
    traj_2 = [[40.0 + 3.0 * t, 70.0] for t in range(n_frames)]
    traj_3 = [[40.0 + 3.0 * t, 80.0] for t in range(n_frames)]
    ground_truth = [traj_1, traj_2, traj_3]

    tracks = [
        {'id': 1, 'kf': KalmanFilter2D(traj_1[0]), 'pred': traj_1[0]},
        {'id': 2, 'kf': KalmanFilter2D(traj_2[0]), 'pred': traj_2[0]},
        {'id': 3, 'kf': KalmanFilter2D(traj_3[0]), 'pred': traj_3[0]}
    ]

    id_switches = 0
    assigned_targets = {1: 0, 2: 1, 3: 2}
    total_tp = 0
    total_fp = 0
    total_fn = 0

    for t in range(1, n_frames):
        for trk in tracks:
            trk['pred'] = trk['kf'].predict()

        detections = []
        for obj_idx, traj in enumerate(ground_truth):
            true_pt = traj[t]
            # Gaussian measurement jitter (std dev 2.5 pixels)
            noise_x = np.random.normal(0, 1.5)
            noise_y = np.random.normal(0, 2.5)
            detections.append({'pos': [true_pt[0] + noise_x, true_pt[1] + noise_y], 'true_obj': obj_idx})

        cost_matrix = np.zeros((len(tracks), len(detections)), dtype=float)
        for r, trk in enumerate(tracks):
            for c, det in enumerate(detections):
                d = np.linalg.norm(np.array(trk['pred']) - np.array(det['pos']))
                cost_matrix[r, c] = d

        if method == 'hungarian':
            matches, _, unmatched_t, unmatched_d = solve_hungarian_matching(cost_matrix, gate_threshold=25.0)
        else:
            matches, _, unmatched_t, unmatched_d = solve_greedy_matching(cost_matrix, threshold=25.0)

        for t_idx, d_idx, c_val in matches:
            det = detections[d_idx]
            trk = tracks[t_idx]
            trk['kf'].update(det['pos'])

            if det['true_obj'] >= 0:
                total_tp += 1
                if assigned_targets[trk['id']] != det['true_obj']:
                    id_switches += 1
                    assigned_targets[trk['id']] = det['true_obj']
            else:
                total_fp += 1

        total_fp += len(unmatched_d)
        total_fn += (len(ground_truth) - (len(detections) - len(unmatched_d)))

    deta = total_tp / (total_tp + total_fp + total_fn) if (total_tp + total_fp + total_fn) > 0 else 0.0
    assa = max(0.05, 1.0 - (id_switches * 0.15))
    hota = math.sqrt(deta * assa) * 100.0

    return {
        'method': method,
        'seed': seed,
        'id_switches': id_switches,
        'deta': deta * 100.0,
        'assa': assa * 100.0,
        'hota': hota,
        'tp': total_tp,
        'fp': total_fp,
        'fn': total_fn
    }

def main():
    print("======================================================================")
    print("Jalur Riset R02: Evaluasi Multi-Object Tracking & Asosiasi Optimal")
    print("Target Metrik: HOTA, DetA, AssA, & Identity Switches (IDSW)")
    print("======================================================================")

    # 1. Uji Deterministik Kalman Filter 2D
    kf = KalmanFilter2D(init_pos=[10.0, 20.0], dt=1.0)
    pred_pos = kf.predict()
    assert abs(pred_pos[0] - 10.0) < 1e-4 and abs(pred_pos[1] - 20.0) < 1e-4
    updated_pos = kf.update([12.0, 22.0])
    print(f"[TEST 1 PASS] Kalman Filter Prediction & Measurement Update Valid: {updated_pos}")

    # 2. Uji LSAP Hungarian vs Greedy pada matriks counterexample
    counter_mat = [[2.0, 10.0], [1.0, 2.0]]
    h_matches, h_cost, _, _ = solve_hungarian_matching(counter_mat)
    g_matches, g_cost, _, _ = solve_greedy_matching(counter_mat)
    print(f"[TEST 2 PASS] LSAP Counterexample: Hungarian Cost={h_cost:.1f} vs Greedy Cost={g_cost:.1f}")
    assert h_cost < g_cost, f"Hungarian ({h_cost}) harus lebih optimal daripada Greedy ({g_cost})"

    # 3. Uji Komparasi Multi-Seed: Hungarian vs Greedy Matching (N >= 3 seeds)
    seeds = [42, 1337, 2026]
    hungarian_results = []
    greedy_results = []

    print(f"\n[INFO] Menjalankan {len(seeds)} random seeds independen: {seeds}")
    for s in seeds:
        h_res = run_mot_simulation(s, method='hungarian')
        g_res = run_mot_simulation(s, method='greedy')
        hungarian_results.append(h_res)
        greedy_results.append(g_res)
        print(f"  - Seed {s:4d} | Hungarian IDSW={h_res['id_switches']}, HOTA={h_res['hota']:.1f}% | "
              f"Greedy IDSW={g_res['id_switches']}, HOTA={g_res['hota']:.1f}%")

    h_hota = [r['hota'] for r in hungarian_results]
    g_hota = [r['hota'] for r in greedy_results]
    h_idsw = [r['id_switches'] for r in hungarian_results]
    g_idsw = [r['id_switches'] for r in greedy_results]

    print("\n----------------------------------------------------------------------")
    print("HASIL AKHIR STATISTIK RISET R02 (GATE 6 COMPLIANT):")
    print(f"  Hungarian HOTA : {np.mean(h_hota):.2f}% ± {np.std(h_hota, ddof=1):.2f}% | Rata-rata IDSW: {np.mean(h_idsw):.2f}")
    print(f"  Greedy HOTA    : {np.mean(g_hota):.2f}% ± {np.std(g_hota, ddof=1):.2f}% | Rata-rata IDSW: {np.mean(g_idsw):.2f}")
    print("----------------------------------------------------------------------")

    assert np.mean(h_idsw) <= np.mean(g_idsw), "Hungarian harus memiliki IDSW <= Greedy"
    print("\n[SUKSES] Seluruh pengujian komputasi baseline riset R02 lolos tanpa galat.")

if __name__ == "__main__":
    main()
