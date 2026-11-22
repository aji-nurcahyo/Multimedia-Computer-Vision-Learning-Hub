#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 48: 3D Vision & Scene Reconstruction
Standalone Academic Verification Script: Direct Linear Transformation (DLT) Triangulation & Reprojection

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def construct_camera_matrix(f_x: float, f_y: float, c_x: float, c_y: float, R: np.ndarray, t: np.ndarray) -> np.ndarray:
    """Constructs the 3x4 projective camera matrix P = K [R | t]."""
    K = np.array([
        [f_x,  0.0, c_x],
        [ 0.0, f_y, c_y],
        [ 0.0,  0.0, 1.0]
    ], dtype=np.float64)
    Rt = np.hstack((R, t.reshape(3, 1)))
    return K @ Rt

def linear_dlt_triangulation(P1: np.ndarray, P2: np.ndarray, x1: np.ndarray, x2: np.ndarray) -> np.ndarray:
    """
    Solves 3D point coordinates X from two calibrated camera observations using DLT (SVD).
    Returns Euclidean 3D coordinates (X, Y, Z).
    """
    u1, v1 = x1[0], x1[1]
    u2, v2 = x2[0], x2[1]
    
    A = np.zeros((4, 4), dtype=np.float64)
    A[0] = u1 * P1[2] - P1[0]
    A[1] = v1 * P1[2] - P1[1]
    A[2] = u2 * P2[2] - P2[0]
    A[3] = v2 * P2[2] - P2[1]
    
    # Solve A * X = 0 via SVD
    _, _, Vt = np.linalg.svd(A)
    X_hom = Vt[-1]  # Last row of Vt corresponds to smallest singular value
    
    if np.abs(X_hom[3]) < 1e-12:
        raise ValueError("Point at infinity or degenerate camera configuration.")
        
    X_euclidean = X_hom[:3] / X_hom[3]
    return X_euclidean

def project_point(P: np.ndarray, X_3d: np.ndarray) -> np.ndarray:
    """Projects Euclidean 3D point onto image plane: x_proj = P * [X, Y, Z, 1]^T."""
    X_hom = np.append(X_3d, 1.0)
    x_proj_hom = P @ X_hom
    return x_proj_hom[:2] / x_proj_hom[2]

def compute_reprojection_rmse(P_list: list, x_list: list, X_3d: np.ndarray) -> float:
    """Calculates Root Mean Square Error (RMSE) of pixel reprojection across cameras."""
    errors = []
    for P, x_meas in zip(P_list, x_list):
        x_proj = project_point(P, X_3d)
        errors.append(np.linalg.norm(x_proj - x_meas))
    return float(np.sqrt(np.mean(np.square(errors))))

def main():
    print("=" * 70)
    print("Chapter 48 Verification: Multi-View Triangulation & Reprojection Error")
    print("=" * 70)
    
    # 1. Setup Cameras as defined in Section 3
    # Camera 1 at origin, Camera 2 shifted by b = 2.0 meters along X
    f = 1000.0
    c_x, c_y = 0.0, 0.0
    R1 = np.eye(3, dtype=np.float64)
    t1 = np.zeros(3, dtype=np.float64)
    P1 = construct_camera_matrix(f, f, c_x, c_y, R1, t1)
    
    R2 = np.eye(3, dtype=np.float64)
    t2 = np.array([-2.0, 0.0, 0.0], dtype=np.float64)  # Translated 2m right
    P2 = construct_camera_matrix(f, f, c_x, c_y, R2, t2)
    
    print("\n[Step 1] Camera Projection Matrices:")
    print("P1 (Camera 1 at origin):\n", P1)
    print("P2 (Camera 2 with b=2.0m baseline):\n", P2)
    
    # 2. Observations
    x1 = np.array([200.0, 100.0], dtype=np.float64)
    x2 = np.array([-200.0, 100.0], dtype=np.float64)
    print(f"\n[Step 2] Observed 2D Pixel Coordinates:")
    print(f"Cam 1 (u1, v1): ({x1[0]}, {x1[1]})")
    print(f"Cam 2 (u2, v2): ({x2[0]}, {x2[1]})")
    
    # 3. DLT Triangulation
    X_reconstructed = linear_dlt_triangulation(P1, P2, x1, x2)
    print(f"\n[Step 3] Triangulated 3D Position [X, Y, Z]:")
    print(f"X: {X_reconstructed[0]:.4f} m, Y: {X_reconstructed[1]:.4f} m, Z: {X_reconstructed[2]:.4f} m")
    
    # Expected analytical solution: [1.0, 0.5, 5.0]
    expected_X = np.array([1.0, 0.5, 5.0], dtype=np.float64)
    np.testing.assert_allclose(
        X_reconstructed, expected_X, atol=1e-5,
        err_msg="Triangulated 3D point does not match analytical ground truth!"
    )
    print("  -> Triangulation SVD coordinates match analytical derivation [1.0, 0.5, 5.0]^T exactly.")
    
    # 4. Reprojection Error Verification
    proj_1 = project_point(P1, X_reconstructed)
    proj_2 = project_point(P2, X_reconstructed)
    rmse = compute_reprojection_rmse([P1, P2], [x1, x2], X_reconstructed)
    
    print(f"\n[Step 4] Reprojection onto Image Planes:")
    print(f"Cam 1 Projected: ({proj_1[0]:.4f}, {proj_1[1]:.4f}) | Error: {np.linalg.norm(proj_1 - x1):.6f} px")
    print(f"Cam 2 Projected: ({proj_2[0]:.4f}, {proj_2[1]:.4f}) | Error: {np.linalg.norm(proj_2 - x2):.6f} px")
    print(f"Overall Reprojection RMSE: {rmse:.8f} px")
    assert rmse < 1e-6, f"Reprojection error {rmse} exceeds tolerance!"
    print("  -> Reprojection error is virtually zero (< 1e-6 px).")
    
    # 5. Sensitivity to Sensor Noise Simulation
    print(f"\n[Step 5] Noise Sensitivity Perturbation Test (+1.0 px shift on Cam 2 u):")
    x2_perturbed = x2 + np.array([1.0, 0.0])
    X_pert = linear_dlt_triangulation(P1, P2, x1, x2_perturbed)
    rmse_pert = compute_reprojection_rmse([P1, P2], [x1, x2_perturbed], X_pert)
    disparity_pert = x1[0] - x2_perturbed[0]  # 200 - (-199) = 399
    expected_Z_pert = (f * 2.0) / disparity_pert  # 2000 / 399 ~ 5.01253 m
    print(f"Perturbed Disparity: {disparity_pert:.1f} px (shift: -1 px disparity)")
    print(f"Perturbed 3D Position: X={X_pert[0]:.4f}m, Y={X_pert[1]:.4f}m, Z={X_pert[2]:.4f}m")
    print(f"Expected Z from disparity formula: {expected_Z_pert:.4f}m")
    np.testing.assert_allclose(X_pert[2], expected_Z_pert, atol=1e-4)
    print(f"Reprojection RMSE under noise: {rmse_pert:.4f} px")
    print("  -> Depth sensitivity follows delta_Z = - (Z^2 / (f*b)) * delta_d formula accurately.")
    
    print("\n" + "=" * 70)
    print("ALL CHAPTER 48 VERIFICATION CHECKS PASSED DETERMINISTICALLY (Exit 0)")
    print("=" * 70)
    sys.exit(0)

if __name__ == "__main__":
    main()
