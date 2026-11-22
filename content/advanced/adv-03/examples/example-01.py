"""
ADV-03: Robust Visual Tracking & Multi-Object Tracking Systems
2D Kinematic Filtering, Hungarian Optimal LSAP vs. Greedy Data Association, and Occlusion Handling

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
Level: L3 Advanced Curriculum
"""

import numpy as np

try:
    from scipy.optimize import linear_sum_assignment
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

class KalmanFilter2D:
    """
    Constant Velocity 2D Discrete Kalman Filter.
    State vector: x = [px, py, vx, vy]^T
    Measurement: z = [zx, zy]^T
    """
    def __init__(self, init_x: float, init_y: float):
        self.x = np.array([init_x, init_y, 0.0, 0.0], dtype=np.float64)
        
        # State covariance P
        self.P = np.diag([20.0, 20.0, 100.0, 100.0])
        
        # Measurement matrix H (observe position only)
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=np.float64)
        
    def predict(self, dt: float = 1.0, q_std: float = 1.2) -> np.ndarray:
        # State transition matrix F
        F = np.array([
            [1.0, 0.0,  dt, 0.0],
            [0.0, 1.0, 0.0,  dt],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=np.float64)
        
        # Continuous-time white noise acceleration discrete Q
        q_pos = (dt**3) / 3.0 * (q_std**2)
        q_vel = dt * (q_std**2)
        q_pos_vel = (dt**2) / 2.0 * (q_std**2)
        
        Q = np.array([
            [q_pos,     0.0, q_pos_vel,       0.0],
            [  0.0,   q_pos,       0.0, q_pos_vel],
            [q_pos_vel, 0.0,     q_vel,       0.0],
            [  0.0, q_pos_vel,     0.0,     q_vel]
        ], dtype=np.float64)
        
        self.x = F @ self.x
        self.P = F @ self.P @ F.T + Q
        return self.x[:2]

    def update(self, z: np.ndarray, r_std: float = 5.0):
        # Measurement covariance R
        R = np.eye(2, dtype=np.float64) * (r_std**2)
        
        # Innovation y = z - H x
        y = z - self.H @ self.x
        
        # Innovation covariance S = H P H^T + R
        S = self.H @ self.P @ self.H.T + R
        
        # Mahalanobis distance d_M = sqrt(y^T S^-1 y)
        inv_S = np.linalg.inv(S)
        mahalanobis_sq = y.T @ inv_S @ y
        mahalanobis = np.sqrt(max(0.0, mahalanobis_sq))
        
        # Kalman Gain K = P * H^T * S^-1
        K = self.P @ self.H.T @ inv_S
        
        # State update
        self.x = self.x + K @ y
        # Covariance update P = (I - K H) P
        I = np.eye(4)
        self.P = (I - K @ self.H) @ self.P
        
        return self.x[:2], mahalanobis


def associate_greedy(cost_matrix: np.ndarray, threshold: float = np.inf):
    """
    Greedy Nearest-Neighbor Bipartite Association (Heuristic).
    Time Complexity: O(N * M * min(N, M))
    Note: Heuristic selection that does not guarantee globally minimal assignment cost.
    """
    cost_matrix = np.asarray(cost_matrix, dtype=np.float64)
    if cost_matrix.size == 0:
        return [], 0.0, [], []
    num_tracks, num_dets = cost_matrix.shape
    if num_dets == 0:
        return [], 0.0, list(range(num_tracks)), []

    matches = []
    unmatched_tracks = set(range(num_tracks))
    unmatched_dets = set(range(num_dets))
    total_cost = 0.0

    while len(unmatched_tracks) > 0 and len(unmatched_dets) > 0:
        min_val = np.inf
        best_t, best_d = -1, -1

        for t in unmatched_tracks:
            for d in unmatched_dets:
                val = cost_matrix[t, d]
                if np.isfinite(val) and val < min_val:
                    min_val = val
                    best_t, best_d = t, d

        if min_val > threshold or best_t == -1:
            break

        matches.append((best_t, best_d, min_val))
        unmatched_tracks.remove(best_t)
        unmatched_dets.remove(best_d)
        total_cost += min_val

    unmatched_t = [t for t in range(num_tracks) if t in unmatched_tracks]
    unmatched_d = [d for d in range(num_dets) if d in unmatched_dets]
    return matches, total_cost, unmatched_t, unmatched_d


def associate_hungarian(cost_matrix: np.ndarray, threshold: float = np.inf):
    """
    Hungarian / Kuhn-Munkres Algorithm (Globally Optimal LSAP Solver).
    Time Complexity: O(max(N, M)^3)
    Guarantees globally minimal sum of assigned costs.
    """
    cost_matrix = np.asarray(cost_matrix, dtype=np.float64)
    if cost_matrix.size == 0:
        return [], 0.0, [], []
    num_tracks, num_dets = cost_matrix.shape
    if num_dets == 0:
        return [], 0.0, list(range(num_tracks)), []

    # If SciPy is available, we can cross-validate, but pure NumPy implementation runs unconditionally
    min_val = np.nanmin(cost_matrix)
    shift = -min_val if min_val < 0 else 0.0

    K = max(num_tracks, num_dets)
    square = np.zeros((K, K), dtype=np.float64)
    for i in range(num_tracks):
        for j in range(num_dets):
            v = cost_matrix[i, j]
            square[i, j] = (v if np.isfinite(v) else 1e9) + shift

    # Dual potentials algorithm (1-indexed internally)
    u = np.zeros(K + 1, dtype=np.float64)
    v = np.zeros(K + 1, dtype=np.float64)
    p = np.zeros(K + 1, dtype=np.int32)
    way = np.zeros(K + 1, dtype=np.int32)

    for i in range(1, K + 1):
        p[0] = i
        j0 = 0
        minv = np.full(K + 1, np.inf, dtype=np.float64)
        used = np.zeros(K + 1, dtype=bool)

        while True:
            used[j0] = True
            i0 = p[j0]
            delta = np.inf
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

    assignment = np.full(K, -1, dtype=np.int32)
    for j in range(1, K + 1):
        if p[j] > 0:
            assignment[p[j] - 1] = j - 1

    matches = []
    assigned_t = set()
    assigned_d = set()
    total_cost = 0.0

    for t in range(num_tracks):
        d = assignment[t]
        if 0 <= d < num_dets:
            orig_cost = cost_matrix[t, d]
            if np.isfinite(orig_cost) and orig_cost <= threshold:
                matches.append((t, d, orig_cost))
                assigned_t.add(t)
                assigned_d.add(d)
                total_cost += orig_cost

    unmatched_t = [t for t in range(num_tracks) if t not in assigned_t]
    unmatched_d = [d for d in range(num_dets) if d not in assigned_d]
    return matches, total_cost, unmatched_t, unmatched_d


def run_experiment():
    print("=" * 75)
    print("ADV-03: ROBUST MULTI-OBJECT TRACKING & KALMAN ESTIMATION")
    print("Verification of Hungarian LSAP vs. Greedy Association and Occlusion Handling")
    print("=" * 75)

    # -------------------------------------------------------------
    # [1] COUNTEREXAMPLE NUMERICAL BENCHMARK: GREEDY VS HUNGARIAN
    # -------------------------------------------------------------
    print("\n[1] Canonical Counterexample Matrix Test:")
    C_counter = np.array([
        [1.0,   2.0],
        [2.0, 100.0]
    ])
    print("    Cost Matrix C = [[1.0, 2.0], [2.0, 100.0]]")

    m_greedy, cost_greedy, _, _ = associate_greedy(C_counter)
    m_hungarian, cost_hungarian, _, _ = associate_hungarian(C_counter)

    print(f"    -> Greedy Assignment:    Matches={[(m[0], m[1]) for m in m_greedy]}, Total Cost = {cost_greedy:.1f}")
    print(f"    -> Hungarian Assignment: Matches={[(m[0], m[1]) for m in m_hungarian]}, Total Cost = {cost_hungarian:.1f}")

    assert cost_greedy == 101.0, f"Expected greedy cost 101.0, got {cost_greedy}"
    assert cost_hungarian == 4.0, f"Expected Hungarian cost 4.0, got {cost_hungarian}"
    print("    [PASSED] Counterexample correctly demonstrates Hungarian global optimality (4.0 vs 101.0).")

    if HAS_SCIPY:
        row_ind, col_ind = linear_sum_assignment(C_counter)
        scipy_cost = C_counter[row_ind, col_ind].sum()
        print(f"    -> SciPy linear_sum_assignment verification: Total Cost = {scipy_cost:.1f}")
        assert scipy_cost == cost_hungarian, "SciPy cost does not match pure NumPy Hungarian!"
        print("    [PASSED] Cross-verified with SciPy linear_sum_assignment.")

    # -------------------------------------------------------------
    # [2] RECTANGULAR & GATING TEST
    # -------------------------------------------------------------
    print("\n[2] Rectangular Matrix (2x3) & Gating Test:")
    C_rect = np.array([
        [10.0,   5.0, 20.0],
        [ 2.0, 100.0, 30.0]
    ])
    m_rect, cost_rect, ut_rect, ud_rect = associate_hungarian(C_rect, threshold=15.0)
    print(f"    Cost Matrix (2 tracks, 3 dets), Threshold = 15.0")
    print(f"    -> Hungarian Matches: {[(m[0], m[1], m[2]) for m in m_rect]}")
    print(f"    -> Total Cost: {cost_rect:.1f}")
    print(f"    -> Unmatched Tracks: {ut_rect}, Unmatched Detections: {ud_rect}")
    assert cost_rect == 7.0, f"Expected cost 7.0 (5.0 + 2.0), got {cost_rect}"
    assert ud_rect == [2], f"Detection 2 should be unmatched, got {ud_rect}"
    print("    [PASSED] Rectangular Kuhn-Munkres and distance gating verified.")

    # -------------------------------------------------------------
    # [3] SYNTHETIC MULTI-OBJECT TRACKING SIMULATION WITH OCCLUSION
    # -------------------------------------------------------------
    np.random.seed(42)
    num_frames = 40
    
    # Define 2 synthetic targets crossing paths
    # Target 1: moving left-to-right (100 -> 300)
    # Target 2: moving right-to-left (300 -> 100)
    t1_true = np.array([[100.0 + 5.0 * t, 150.0 + 2.0 * t] for t in range(num_frames)])
    t2_true = np.array([[300.0 - 5.0 * t, 150.0 + 2.0 * t] for t in range(num_frames)])
    
    print(f"\n[3] Synthetic MOT Simulation Setup: {num_frames} frames, 2 crossing targets.")
    print("    Crossing point around frame 20 (both targets near x=200).")
    print("    Occlusion window active for Target 1 at frames 18-21.")

    # Tracking simulation with Hungarian assignment
    tracks = []
    next_id = 1
    total_errors = []
    id_switches = 0
    assigned_ids = {} # track_id -> target_id
    occlusion_window = range(18, 22)

    for frame in range(num_frames):
        # 1. Generate sensor observations (detections)
        dets = []
        det_targets = []
        
        # Target 1 detection (suppressed during occlusion)
        if frame not in occlusion_window:
            noise = np.random.randn(2) * 2.0
            dets.append(t1_true[frame] + noise)
            det_targets.append(1)
            
        # Target 2 detection (always visible)
        noise = np.random.randn(2) * 2.0
        dets.append(t2_true[frame] + noise)
        det_targets.append(2)
        
        dets = np.array(dets) if len(dets) > 0 else np.empty((0, 2))
        
        # 2. Kalman state prediction
        for trk in tracks:
            trk['filter'].predict(dt=1.0, q_std=1.0)
            trk['time_since_update'] += 1
            
        # 3. Data Association via Hungarian Matching
        pred_positions = np.array([trk['filter'].x[:2] for trk in tracks]) if len(tracks) > 0 else np.empty((0, 2))
        
        if len(pred_positions) > 0 and len(dets) > 0:
            diff = pred_positions[:, np.newaxis, :] - dets[np.newaxis, :, :]
            dist_matrix = np.linalg.norm(diff, axis=2)
            matches, frame_cost, unmatched_trks, unmatched_dets = associate_hungarian(dist_matrix, threshold=35.0)
        else:
            matches = []
            unmatched_trks = list(range(len(tracks)))
            unmatched_dets = list(range(len(dets)))
            
        # 4. Update matched tracks
        for trk_idx, det_idx, dist in matches:
            trk = tracks[trk_idx]
            meas = dets[det_idx]
            true_target = det_targets[det_idx]
            
            trk['filter'].update(meas, r_std=2.0)
            trk['time_since_update'] = 0
            
            # Check ID Switch
            prev_target = assigned_ids.get(trk['id'])
            if prev_target is not None and prev_target != true_target:
                id_switches += 1
            assigned_ids[trk['id']] = true_target
            
            # Record localization error
            gt_pos = t1_true[frame] if true_target == 1 else t2_true[frame]
            err = np.linalg.norm(trk['filter'].x[:2] - gt_pos)
            total_errors.append(err)
            
        # 5. Delete dead tracks (time_since_update > 5)
        tracks = [trk for trk in tracks if trk['time_since_update'] <= 5]
        
        # 6. Initialize new tracks for unmatched detections
        for det_idx in unmatched_dets:
            meas = dets[det_idx]
            true_target = det_targets[det_idx]
            new_filter = KalmanFilter2D(meas[0], meas[1])
            new_trk = {
                'id': next_id,
                'filter': new_filter,
                'time_since_update': 0
            }
            assigned_ids[next_id] = true_target
            next_id += 1
            tracks.append(new_trk)

    mean_rmse = np.sqrt(np.mean(np.array(total_errors)**2))
    print(f"\n[4] Tracking Quantitative Results:")
    print(f"    -> Root Mean Square Error (RMSE): {mean_rmse:.3f} px (Target < 3.0 px)")
    print(f"    -> Identity Switches (IDSW):      {id_switches}")
    print(f"    -> Total Created Track IDs:       {next_id - 1}")
    print(f"    -> Educational Insight: {id_switches} ID switches observed during crossing under occlusion.")
    print("       Confirms that minimizing the LSAP distance objective alone does not guarantee")
    print("       perfect end-to-end MOT accuracy; appearance Re-ID features are required.")

    assert mean_rmse < 3.0, f"Tracking error {mean_rmse} exceeds threshold!"
    assert id_switches <= 2, f"Excessive ID switches occurred: {id_switches}"

    print("\n" + "=" * 75)
    print("ADV-03 VERIFICATION COMPLETE: ALL INTEGRITY CHECKS PASSED.")
    print("=" * 75)

if __name__ == "__main__":
    run_experiment()
