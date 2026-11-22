"""
ADV-01: Mathematical Foundations for Advanced Computer Vision
Reference Implementation: Matrix Calculus, SVD Low-Rank Approximation, and Lie Groups

Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
License: Apache-2.0
"""

import sys
import numpy as np

def compute_svd_low_rank(A: np.ndarray, rank_k: int):
    """
    Computes SVD and rank-k approximation under Eckart-Young-Mirsky theorem.
    """
    U, S, Vt = np.linalg.svd(A, full_matrices=False)
    assert rank_k <= len(S), f"Rank {rank_k} exceeds matrix rank {len(S)}"
    
    # Truncated reconstruction
    A_k = np.dot(U[:, :rank_k], np.dot(np.diag(S[:rank_k]), Vt[:rank_k, :]))
    
    # Theoretical Frobenius error: sqrt(sum(S[k:]^2))
    theoretical_err = np.sqrt(np.sum(S[rank_k:] ** 2))
    empirical_err = np.linalg.norm(A - A_k, 'fro')
    
    return {
        'U': U,
        'S': S,
        'Vt': Vt,
        'A_k': A_k,
        'theoretical_err': theoretical_err,
        'empirical_err': empirical_err,
        'condition_number': S[0] / S[-1] if S[-1] > 1e-12 else np.inf
    }

def rodrigues_exp_so3(omega: np.ndarray) -> np.ndarray:
    """
    Exponential map from Lie algebra so(3) vector to Lie group SO(3) matrix.
    Formula: R = I + (sin theta / theta) * [omega]_x + ((1 - cos theta) / theta^2) * [omega]_x^2
    """
    theta = np.linalg.norm(omega)
    if theta < 1e-12:
        return np.eye(3)
    
    kx, ky, kz = omega / theta
    # Skew-symmetric cross-product matrix [omega]_x
    K = np.array([
        [0.0, -kz, ky],
        [kz, 0.0, -kx],
        [-ky, kx, 0.0]
    ])
    
    R = np.eye(3) + np.sin(theta) * K + (1.0 - np.cos(theta)) * np.dot(K, K)
    return R

def run_experiment():
    print("=" * 70)
    print("ADV-01: MATHEMATICAL FOUNDATIONS FOR COMPUTER VISION")
    print("Verification of SVD, Eckart-Young-Mirsky Theorem, and Lie Groups SO(3)")
    print("=" * 70)

    # 1. Test Matrix Generation (Rank-4 synthetic feature matrix)
    np.random.seed(42)
    m, n = 6, 4
    A = np.random.randn(m, n) * 2.0
    
    print(f"\n[1] Input Matrix A ({m}x{n}):")
    print(np.round(A, 3))
    
    # 2. SVD and Rank-2 Approximation
    rank_k = 2
    res = compute_svd_low_rank(A, rank_k)
    print(f"\n[2] Singular Values: {np.round(res['S'], 4)}")
    print(f"    Condition Number kappa(A): {res['condition_number']:.2f}")
    print(f"    Theoretical Frobenius Error (sigma_3^2 + sigma_4^2)^0.5: {res['theoretical_err']:.6f}")
    print(f"    Empirical Reconstruction Error ||A - A_2||_F:            {res['empirical_err']:.6f}")
    
    # Verification assertion
    assert np.isclose(res['theoretical_err'], res['empirical_err'], atol=1e-5), "Eckart-Young error mismatch!"
    print("    -> Eckart-Young-Mirsky Theorem Verified: PASS")

    # 3. Numerical Conditioning & Least Squares Perturbation
    print("\n[3] Numerical Stability in Least Squares (Normal Equations):")
    # True solution
    x_true = np.array([1.5, -2.0, 3.0, 0.5])
    b = A @ x_true
    
    # Add minor noise (0.1%)
    noise = np.random.randn(*b.shape) * 0.001
    b_noisy = b + noise
    
    # Normal equations: (A^T A) x = A^T b
    AtA = A.T @ A
    Atb = A.T @ b_noisy
    x_est = np.linalg.solve(AtA, Atb)
    
    sol_err = np.linalg.norm(x_true - x_est) / np.linalg.norm(x_true)
    print(f"    Relative Solution Error under 0.1% measurement noise: {sol_err * 100:.4f}%")
    assert sol_err < 0.05, "Least squares solution error exceeds expected tolerance"
    print("    -> Least Squares Numerical Stability: PASS")

    # 4. Lie Algebra so(3) to Lie Group SO(3)
    print("\n[4] Lie Group SO(3) Rodrigues Exponential Map:")
    # 90 degrees around Z axis: [0, 0, pi/2]
    omega = np.array([0.0, 0.0, np.pi / 2.0])
    R = rodrigues_exp_so3(omega)
    
    print("    Rotation Matrix R = exp([omega]_x):")
    print(np.round(R, 4))
    
    # Check orthogonality R * R^T = I
    ortho_check = np.linalg.norm(R @ R.T - np.eye(3))
    det_check = np.linalg.det(R)
    print(f"    Orthogonality residual ||R R^T - I||: {ortho_check:.2e}")
    print(f"    Determinant det(R): {det_check:.6f}")
    
    assert ortho_check < 1e-6, "Matrix is not orthogonal!"
    assert np.isclose(det_check, 1.0, atol=1e-5), "Determinant must be exactly +1 for special orthogonal group SO(3)!"
    print("    -> Rodrigues SO(3) Manifold Geometry: PASS")

    # 5. Optional PyTorch Engine Verification
    try:
        import torch
        print("\n[5] Optional Engine: PyTorch Autograd Matrix Derivative Verification:")
        W = torch.tensor(A, requires_grad=True, dtype=torch.float64)
        loss = 0.5 * torch.trace(torch.matmul(W.T, W))
        loss.backward()
        
        # d/dW (0.5 * Tr(W^T W)) = W
        grad_err = torch.norm(W.grad - W).item()
        print(f"    PyTorch Trace Calculus Autograd Residual: {grad_err:.2e}")
        assert grad_err < 1e-6, "PyTorch gradient mismatch with analytical derivative!"
        print("    -> PyTorch Tensor Autograd Trace Calculus: PASS")
    except ImportError:
        print("\n[5] PyTorch not installed on host environment. CPU/NumPy fallback executed successfully.")

    print("\n" + "=" * 70)
    print("ALL ADV-01 MATHEMATICAL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_experiment()

