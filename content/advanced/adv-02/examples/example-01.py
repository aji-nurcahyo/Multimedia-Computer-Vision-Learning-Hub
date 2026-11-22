#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Advanced Curriculum (L3 Depth)
Module ADV-02: Advanced Digital Image Processing & Mathematical Inverse Problems
Example 01: Variational Image Restoration via Rudin-Osher-Fatemi (ROF) Model and ADMM Solver

Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
Roadmap: S1 Teknik Telekomunikasi & ISVWS 2026-2040
"""

import sys
import numpy as np


def compute_psnr(ref: np.ndarray, target: np.ndarray, max_val: float = 1.0) -> float:
    """Calculates Peak Signal-to-Noise Ratio (PSNR) in dB for normalized images."""
    mse = np.mean((ref.astype(np.float64) - target.astype(np.float64)) ** 2)
    if mse < 1e-12:
        return 100.0
    return float(20.0 * np.log10(max_val / np.sqrt(mse)))


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    """Calculates Structural Similarity Index (SSIM) for normalized [0, 1] images."""
    x = img1.astype(np.float64)
    y = img2.astype(np.float64)
    mu_x = np.mean(x)
    mu_y = np.mean(y)
    sigma_x_sq = np.var(x)
    sigma_y_sq = np.var(y)
    sigma_xy = np.mean((x - mu_x) * (y - mu_y))

    c1 = (0.01 * 1.0) ** 2
    c2 = (0.03 * 1.0) ** 2

    numerator = (2.0 * mu_x * mu_y + c1) * (2.0 * sigma_xy + c2)
    denominator = (mu_x**2 + mu_y**2 + c1) * (sigma_x_sq + sigma_y_sq + c2)
    return float(numerator / (denominator + 1e-12))


def compute_total_variation(img: np.ndarray, isotropic: bool = True) -> float:
    """Computes discrete Total Variation semi-norm."""
    dx = np.roll(img, -1, axis=1) - img
    dy = np.roll(img, -1, axis=0) - img
    if isotropic:
        return float(np.sum(np.sqrt(dx**2 + dy**2)))
    return float(np.sum(np.abs(dx) + np.abs(dy)))


def soft_threshold(v: np.ndarray, tau: float) -> np.ndarray:
    """Proximal shrinkage operator for L1-norm: S_tau(v) = sign(v) * max(|v| - tau, 0)."""
    return np.sign(v) * np.maximum(np.abs(v) - tau, 0.0)


def solve_admm_rof(
    y: np.ndarray,
    psf: np.ndarray,
    lam: float = 0.015,
    rho: float = 0.15,
    max_iter: int = 35,
) -> dict:
    """
    Solves Rudin-Osher-Fatemi (ROF) Total Variation regularized restoration via ADMM:
    min_x (1/2) * ||A x - y||_2^2 + lam * ||nabla x||_1

    Variable splitting: z = nabla x
    Augmented Lagrangian:
    L_rho(x, z, u) = (1/2)||Ax - y||_2^2 + lam ||z||_1 + (rho/2) ||nabla x - z + u||_2^2
    """
    H, W = y.shape

    # Zero-phase Optical Transfer Function for PSF
    k_h, k_w = psf.shape
    psf_padded = np.zeros((H, W), dtype=float)
    psf_padded[:k_h, :k_w] = psf
    psf_zero_phase = np.roll(
        np.roll(psf_padded, -(k_h // 2), axis=0), -(k_w // 2), axis=1
    )
    otf_A = np.fft.fft2(psf_zero_phase)

    # Periodic discrete forward difference operators Dx and Dy
    dx = np.zeros((H, W), dtype=float)
    dx[0, 0] = -1.0
    dx[0, W - 1] = 1.0
    dy = np.zeros((H, W), dtype=float)
    dy[0, 0] = -1.0
    dy[H - 1, 0] = 1.0

    otf_Dx = np.fft.fft2(dx)
    otf_Dy = np.fft.fft2(dy)

    # Precomputed Fourier denominator for x-update
    denom = np.abs(otf_A) ** 2 + rho * (np.abs(otf_Dx) ** 2 + np.abs(otf_Dy) ** 2)

    # Initialize state
    x = np.copy(y)
    zx = np.zeros((H, W), dtype=float)
    zy = np.zeros((H, W), dtype=float)
    ux = np.zeros((H, W), dtype=float)
    uy = np.zeros((H, W), dtype=float)

    primal_residuals = []
    dual_residuals = []

    for it in range(max_iter):
        prev_zx = np.copy(zx)
        prev_zy = np.copy(zy)

        # 1. x-update: Linear subproblem solved via 2D FFT
        num = np.conj(otf_A) * np.fft.fft2(y) + rho * (
            np.conj(otf_Dx) * np.fft.fft2(zx - ux) + np.conj(otf_Dy) * np.fft.fft2(zy - uy)
        )
        x = np.real(np.fft.ifft2(num / (denom + 1e-12)))
        x = np.clip(x, 0.0, 1.0)

        # Gradient calculation
        gx = np.roll(x, -1, axis=1) - x
        gy = np.roll(x, -1, axis=0) - x

        # 2. z-update: Proximal soft-thresholding shrinkage
        tau = lam / rho
        zx = soft_threshold(gx + ux, tau)
        zy = soft_threshold(gy + uy, tau)

        # 3. u-update: Dual multiplier ascent
        ux += gx - zx
        uy += gy - zy

        # Residual norms
        r_norm = float(np.sqrt(np.sum((gx - zx) ** 2 + (gy - zy) ** 2)))
        s_norm = float(rho * np.sqrt(np.sum((zx - prev_zx) ** 2 + (zy - prev_zy) ** 2)))
        primal_residuals.append(r_norm)
        dual_residuals.append(s_norm)

    return {
        "restored": x,
        "primal_residuals": primal_residuals,
        "dual_residuals": dual_residuals,
    }


def main():
    print("=" * 76)
    print("MULTIMEDIA & COMPUTER VISION LEARNING HUB - ADVANCED MODULE ADV-02")
    print("Rudin-Osher-Fatemi (ROF) Variational Restoration via ADMM Variable Splitting")
    print("=" * 76)

    # 1. Synthesize ground truth clean image (64x64 bimodal step discontinuity [0, 1])
    np.random.seed(42)
    H, W = 64, 64
    clean = np.zeros((H, W), dtype=float)
    clean[:, W // 2 :] = 0.85
    clean[20:44, 20:44] = 0.45

    tv_clean = compute_total_variation(clean, isotropic=True)
    print(f"\n[1] Synthetic Ground Truth Generated: {H}x{W} px (Range: [0.0, 1.0])")
    print(f"    - Baseline Total Variation (Clean): {tv_clean:.3f}")

    # 2. Forward Degradation: y = A x + n (Normalized Gaussian Blur + Noise)
    k_size = 3
    kernel = np.array(
        [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]],
        dtype=float,
    )
    psf = kernel / np.sum(kernel)

    psf_padded = np.zeros((H, W), dtype=float)
    psf_padded[:k_size, :k_size] = psf
    psf_zero_phase = np.roll(
        np.roll(psf_padded, -(k_size // 2), axis=0), -(k_size // 2), axis=1
    )
    otf_A = np.fft.fft2(psf_zero_phase)

    blurred = np.real(np.fft.ifft2(np.fft.fft2(clean) * otf_A))

    noise_sigma = 0.05
    noise = np.random.normal(0.0, noise_sigma, size=clean.shape)
    degraded = np.clip(blurred + noise, 0.0, 1.0)

    psnr_deg = compute_psnr(clean, degraded)
    ssim_deg = compute_ssim(clean, degraded)
    tv_deg = compute_total_variation(degraded, isotropic=True)

    print("\n[2] Forward Degradation Applied (Blur + Additive Gaussian Noise):")
    print(f"    - PSF Kernel Size: {k_size}x{k_size} Gaussian")
    print(f"    - Noise Standard Deviation: sigma={noise_sigma}")
    print(f"    - Degraded PSNR: {psnr_deg:.2f} dB")
    print(f"    - Degraded SSIM: {ssim_deg:.4f}")
    print(f"    - Degraded Total Variation: {tv_deg:.3f} (Exploded due to noise)")

    # 3. Solve Inverse Problem via ADMM Rudin-Osher-Fatemi Model
    lam = 0.015
    rho = 0.15
    max_iter = 35
    print(f"\n[3] Executing ADMM TV ROF Solver (lambda={lam}, rho={rho}, iterations={max_iter}):")

    admm_res = solve_admm_rof(degraded, psf, lam=lam, rho=rho, max_iter=max_iter)
    restored = admm_res["restored"]
    primal_res = admm_res["primal_residuals"]
    dual_res = admm_res["dual_residuals"]

    psnr_rest = compute_psnr(clean, restored)
    ssim_rest = compute_ssim(clean, restored)
    tv_rest = compute_total_variation(restored, isotropic=True)
    psnr_gain = psnr_rest - psnr_deg

    print("\n[4] Restoration Results:")
    print(f"    - Restored PSNR: {psnr_rest:.2f} dB (Gain: +{psnr_gain:.2f} dB)")
    print(f"    - Restored SSIM: {ssim_rest:.4f} (Recovery: {ssim_rest - ssim_deg:+.4f})")
    print(f"    - Restored Total Variation: {tv_rest:.3f} (Regularized towards clean: {tv_clean:.3f})")
    print(f"    - Initial Primal Residual ||r^0||_F: {primal_res[0]:.4f}")
    print(f"    - Final Primal Residual ||r^{max_iter}||_F: {primal_res[-1]:.4f}")
    print(f"    - Final Dual Residual ||s^{max_iter}||_F: {dual_res[-1]:.4f}")

    # 5. Theoretical Assertions
    assert psnr_gain > 5.0, f"Expected PSNR gain > 5.0 dB, got {psnr_gain:.2f} dB"
    assert ssim_rest > ssim_deg, "Restored SSIM must be strictly higher than degraded SSIM"
    assert tv_rest < tv_deg, "Total Variation regularizer must strictly decrease noise energy"
    assert primal_res[-1] < primal_res[0], "Primal residual ||nabla x - z|| must converge downwards"

    print("\n[5] Academic Verification PASSED: All mathematical variational invariants verified.")
    print("=" * 76)
    return 0


if __name__ == "__main__":
    sys.exit(main())
