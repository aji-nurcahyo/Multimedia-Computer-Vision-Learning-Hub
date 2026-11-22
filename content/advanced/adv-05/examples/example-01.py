#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Advanced Curriculum (L3 Depth)
Module ADV-05: Multi-View Geometry & 3D Computer Vision
Example 01: Two-View Epipolar Geometry, Normalized 8-Point Algorithm, DLT Triangulation & Bundle Adjustment

Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
Roadmap: S1 Teknik Telekomunikasi & ISVWS 2026-2040
"""

import sys
import numpy as np


def project_point(
    P_world: np.ndarray, K: np.ndarray, R: np.ndarray, t: np.ndarray
) -> np.ndarray:
    """Projects inhomogeneous 3D point P_world to 2D image coordinates."""
    P_cam = R @ P_world + t
    z = max(1e-6, P_cam[2])
    xn = P_cam[0] / z
    yn = P_cam[1] / z
    u = K[0, 0] * xn + K[0, 1] * yn + K[0, 2]
    v = K[1, 1] * yn + K[1, 2]
    return np.array([u, v])


def normalize_points_hartley(pts: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Applies Hartley coordinate normalization: isotropic scaling and zero centroid."""
    mean = np.mean(pts, axis=0)
    shifted = pts - mean
    dist_mean = np.mean(np.sqrt(np.sum(shifted**2, axis=1)))
    scale = np.sqrt(2.0) / (dist_mean if dist_mean > 1e-12 else 1.0)

    T = np.array(
        [[scale, 0.0, -scale * mean[0]], [0.0, scale, -scale * mean[1]], [0.0, 0.0, 1.0]]
    )
    pts_hom = np.hstack([pts, np.ones((len(pts), 1))])
    norm_hom = (T @ pts_hom.T).T
    return norm_hom[:, :2], T


def estimate_fundamental_8point(
    pts1: np.ndarray, pts2: np.ndarray
) -> np.ndarray:
    """
    Computes Fundamental Matrix F via Normalized 8-Point Algorithm:
    1. Hartley normalization
    2. SVD nullspace vector
    3. Rank-2 enforcement (det F = 0)
    4. Denormalization F = T2^T * F_rank2 * T1
    """
    N = len(pts1)
    norm1, T1 = normalize_points_hartley(pts1)
    norm2, T2 = normalize_points_hartley(pts2)

    # Build N x 9 constraint matrix A
    A = np.zeros((N, 9), dtype=float)
    for i in range(N):
        u1, v1 = norm1[i]
        u2, v2 = norm2[i]
        A[i] = [u2 * u1, u2 * v1, u2, v2 * u1, v2 * v1, v2, u1, v1, 1.0]

    # SVD of A, nullspace is last right singular vector V[:, -1]
    _, _, Vt = np.linalg.svd(A)
    F_hat = Vt[-1].reshape(3, 3)

    # Enforce rank-2 constraint: SVD on F_hat, zero out smallest singular value
    U_f, S_f, Vt_f = np.linalg.svd(F_hat)
    S_f[-1] = 0.0
    F_rank2 = U_f @ np.diag(S_f) @ Vt_f

    # Denormalize
    F = T2.T @ F_rank2 @ T1
    # Scale so F[2, 2] = 1 or unit Frobenius norm
    if abs(F[2, 2]) > 1e-8:
        F /= F[2, 2]
    else:
        F /= np.linalg.norm(F)
    return F


def triangulate_dlt(
    p1: np.ndarray, p2: np.ndarray, P1: np.ndarray, P2: np.ndarray
) -> np.ndarray:
    """Solves inhomogeneous 3D point via Direct Linear Transformation (DLT)."""
    A = np.array(
        [
            p1[0] * P1[2] - P1[0],
            p1[1] * P1[2] - P1[1],
            p2[0] * P2[2] - P2[0],
            p2[1] * P2[2] - P2[1],
        ]
    )
    _, _, Vt = np.linalg.svd(A)
    X_hom = Vt[-1]
    w = X_hom[3] if abs(X_hom[3]) > 1e-12 else 1e-12
    return X_hom[:3] / w


def decompose_essential_matrix(
    E: np.ndarray, K1: np.ndarray, K2: np.ndarray, p1_test: np.ndarray, p2_test: np.ndarray
) -> tuple[np.ndarray, np.ndarray]:
    """
    Decomposes Essential Matrix E into [R | t] and validates cheirality (Z > 0).
    """
    U, S, Vt = np.linalg.svd(E)
    if np.linalg.det(U) < 0:
        U *= -1.0
    if np.linalg.det(Vt) < 0:
        Vt *= -1.0

    W = np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]], dtype=float)

    R1 = U @ W @ Vt
    R2 = U @ W.T @ Vt
    if np.linalg.det(R1) < 0:
        R1 *= -1.0
    if np.linalg.det(R2) < 0:
        R2 *= -1.0

    t_pos = U[:, 2]
    t_neg = -U[:, 2]

    candidates = [
        (R1, t_pos),
        (R1, t_neg),
        (R2, t_pos),
        (R2, t_neg),
    ]

    P1 = K1 @ np.hstack([np.eye(3), np.zeros((3, 1))])

    best_cand = candidates[0]
    for R_c, t_c in candidates:
        P2_c = K2 @ np.hstack([R_c, t_c.reshape(3, 1)])
        X_3d = triangulate_dlt(p1_test, p2_test, P1, P2_c)

        z1 = X_3d[2]
        z2 = (R_c @ X_3d + t_c)[2]

        if z1 > 0 and z2 > 0:
            return R_c, t_c

    return best_cand


def compute_reprojection_rmse(
    points3D: np.ndarray,
    obs: list[tuple[int, int, np.ndarray]],
    cameras: list[tuple[np.ndarray, np.ndarray, np.ndarray]],
) -> float:
    """Computes global reprojection root-mean-square error in pixels."""
    sq_errs = []
    for cam_idx, pt_idx, uv_meas in obs:
        K, R, t = cameras[cam_idx]
        proj = project_point(points3D[pt_idx], K, R, t)
        sq_errs.append(np.sum((proj - uv_meas) ** 2))
    return float(np.sqrt(np.mean(sq_errs)))


def optimize_bundle_adjustment(
    points3D: np.ndarray,
    obs: list[tuple[int, int, np.ndarray]],
    cameras: list[tuple[np.ndarray, np.ndarray, np.ndarray]],
    iterations: int = 15,
) -> tuple[np.ndarray, float, float]:
    """Minimizes reprojection error by optimizing 3D points via damped Gauss-Newton."""
    refined_pts = np.copy(points3D)
    initial_rmse = compute_reprojection_rmse(refined_pts, obs, cameras)

    obs_by_point = [[] for _ in range(len(refined_pts))]
    for cam_idx, pt_idx, uv in obs:
        obs_by_point[pt_idx].append((cam_idx, uv))

    for it in range(iterations):
        for p_idx in range(len(refined_pts)):
            pt_obs = obs_by_point[p_idx]
            if not pt_obs:
                continue

            pt = refined_pts[p_idx]
            H = np.eye(3, dtype=float) * 0.5  # Levenberg-Marquardt damping lambda * I
            g = np.zeros(3, dtype=float)

            for cam_idx, uv_meas in pt_obs:
                K, R, t = cameras[cam_idx]
                proj = project_point(pt, K, R, t)
                residual = proj - uv_meas

                # Numerical Jacobian d(proj) / d(pt)
                eps = 1e-4
                J = np.zeros((2, 3), dtype=float)
                for coord in range(3):
                    pt_pert = np.copy(pt)
                    pt_pert[coord] += eps
                    proj_pert = project_point(pt_pert, K, R, t)
                    J[:, coord] = (proj_pert - proj) / eps

                H += J.T @ J
                g += J.T @ residual

            delta = -np.linalg.solve(H, g)
            refined_pts[p_idx] += delta

    final_rmse = compute_reprojection_rmse(refined_pts, obs, cameras)
    return refined_pts, initial_rmse, final_rmse


def main():
    print("=" * 76)
    print("MULTIMEDIA & COMPUTER VISION LEARNING HUB - ADVANCED MODULE ADV-05")
    print("Two-View Epipolar Geometry, Triangulation, Pose Recovery & Bundle Adjustment")
    print("=" * 76)

    # 1. Setup Camera Rig Intrinsics & Extrinsics
    np.random.seed(42)
    K = np.array(
        [[800.0, 0.0, 320.0], [0.0, 800.0, 240.0], [0.0, 0.0, 1.0]], dtype=float
    )

    # Camera 1 at world origin [I | 0]
    R1 = np.eye(3, dtype=float)
    t1 = np.zeros(3, dtype=float)
    P1 = K @ np.hstack([R1, t1.reshape(3, 1)])

    # Camera 2 translated along X by 0.6 m and rotated by yaw 5 degrees around Y
    baseline_true = 0.6
    yaw_rad = np.radians(5.0)
    cos_y = np.cos(yaw_rad)
    sin_y = np.sin(yaw_rad)
    R2 = np.array([[cos_y, 0.0, -sin_y], [0.0, 1.0, 0.0], [sin_y, 0.0, cos_y]], dtype=float)
    # Camera 2 center in world coordinates is [baseline, 0, 0]^T
    # In camera frame: t2 = -R2 @ C2
    C2 = np.array([baseline_true, 0.0, 0.0])
    t2 = -R2 @ C2
    P2 = K @ np.hstack([R2, t2.reshape(3, 1)])

    print("\n[1] Synthetic Camera Rig Configured:")
    print(f"    - Focal Length: {K[0, 0]:.1f} px, Principal Point: ({K[0, 2]:.1f}, {K[1, 2]:.1f})")
    print(f"    - Ground Truth Baseline: {baseline_true:.2f} m")
    print(f"    - Ground Truth Yaw: 5.0 deg")

    # 2. Synthesize 12 Non-Coplanar 3D World Points
    num_pts = 12
    pts3d_clean = np.array(
        [
            [-0.4, -0.4, 3.2],
            [0.4, -0.4, 3.2],
            [0.4, 0.4, 3.2],
            [-0.4, 0.4, 3.2],
            [-0.4, -0.4, 4.0],
            [0.4, -0.4, 4.0],
            [0.4, 0.4, 4.0],
            [-0.4, 0.4, 4.0],
            [0.0, 0.0, 3.6],
            [-0.3, 0.2, 4.2],
            [0.2, -0.3, 3.4],
            [0.1, 0.3, 4.5],
        ],
        dtype=float,
    )

    # 3. Project to Image Planes with Sensor Noise
    noise_sigma = 0.5  # 0.5 pixel Gaussian noise
    projs1_clean = np.array([project_point(P, K, R1, t1) for P in pts3d_clean])
    projs2_clean = np.array([project_point(P, K, R2, t2) for P in pts3d_clean])

    projs1 = projs1_clean + np.random.normal(0.0, noise_sigma, projs1_clean.shape)
    projs2 = projs2_clean + np.random.normal(0.0, noise_sigma, projs2_clean.shape)

    print(f"\n[2] Point Correspondences Generated ({num_pts} pairs, sensor noise sigma={noise_sigma} px):")
    print(f"    - View 1 Point 0: ({projs1[0, 0]:.1f}, {projs1[0, 1]:.1f})")
    print(f"    - View 2 Point 0: ({projs2[0, 0]:.1f}, {projs2[0, 1]:.1f})")

    # 4. Fundamental Matrix Estimation via Normalized 8-Point Algorithm
    F = estimate_fundamental_8point(projs1, projs2)
    det_F = np.linalg.det(F)

    # Compute Sampson error for all correspondences
    sampson_errs = []
    for p1, p2 in zip(projs1, projs2):
        x1_h = np.array([p1[0], p1[1], 1.0])
        x2_h = np.array([p2[0], p2[1], 1.0])
        Fx1 = F @ x1_h
        Ftx2 = F.T @ x2_h
        denom = Fx1[0] ** 2 + Fx1[1] ** 2 + Ftx2[0] ** 2 + Ftx2[1] ** 2
        alg_err = x2_h @ Fx1
        sampson_errs.append((alg_err**2) / (denom + 1e-12))
    mean_sampson = np.mean(sampson_errs)

    print("\n[3] Normalized 8-Point Algorithm Results:")
    print(f"    - det(F): {det_F:.2e} (Strictly ~0 rank-2 constraint verified)")
    print(f"    - Mean Sampson Epipolar Distance: {mean_sampson:.4f} px^2")

    # 5. Pose Recovery from Essential Matrix
    E_est = K.T @ F @ K
    R_rec, t_rec = decompose_essential_matrix(E_est, K, K, projs1[0], projs2[0])

    # Up-to-scale translation direction
    t_dir_rec = t_rec / np.linalg.norm(t_rec)
    t_dir_true = t2 / np.linalg.norm(t2)
    dir_cos_sim = np.dot(t_dir_rec, t_dir_true)

    print("\n[4] Essential Matrix Decomposition & Cheirality Pose Recovery:")
    print(f"    - Recovered Relative Rotation Matrix R_rec:\n{np.round(R_rec, 4)}")
    print(f"    - Direction Cosine Similarity with True Translation: {dir_cos_sim:.5f}")

    # 6. Linear DLT Triangulation
    triangulated = np.array([triangulate_dlt(p1, p2, P1, P2) for p1, p2 in zip(projs1, projs2)])
    recon_error_mm = np.mean(np.linalg.norm(triangulated - pts3d_clean, axis=1)) * 1000.0

    print("\n[5] Linear DLT Triangulation Results:")
    print(f"    - Mean 3D Point Reconstruction Error: {recon_error_mm:.2f} mm")

    # 7. Non-Linear Bundle Adjustment Optimization
    observations = []
    for i in range(num_pts):
        observations.append((0, i, projs1[i]))
        observations.append((1, i, projs2[i]))
    cameras = [(K, R1, t1), (K, R2, t2)]

    refined_pts, initial_rmse, final_rmse = optimize_bundle_adjustment(
        triangulated, observations, cameras, iterations=15
    )

    print("\n[6] Bundle Adjustment Optimization (Levenberg-Marquardt):")
    print(f"    - Initial Reprojection RMSE: {initial_rmse:.3f} px")
    print(f"    - Final Reprojection RMSE:   {final_rmse:.3f} px (Reduced by {initial_rmse - final_rmse:+.3f} px)")

    # 8. Theoretical Verification Assertions
    assert abs(det_F) < 1e-4, f"Fundamental matrix must be rank 2 (det(F) ~ 0), got {det_F}"
    assert mean_sampson < 1.0, f"Mean Sampson error should be sub-pixel, got {mean_sampson}"
    assert dir_cos_sim > 0.95, f"Recovered translation direction must match ground truth, got {dir_cos_sim}"
    assert recon_error_mm < 35.0, f"DLT 3D error must be < 35 mm, got {recon_error_mm:.2f} mm"
    assert final_rmse <= initial_rmse, "Bundle Adjustment must monotonically decrease reprojection RMSE"

    print("\n[7] Academic Verification PASSED: All multi-view geometric invariants verified.")
    print("=" * 76)
    return 0


if __name__ == "__main__":
    sys.exit(main())

