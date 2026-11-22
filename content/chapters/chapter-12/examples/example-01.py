"""
Multimedia & Computer Vision Learning Hub
Chapter 12: Image Restoration, Denoising & PSNR/SSIM Metrics Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def compute_psnr(clean: np.ndarray, test: np.ndarray) -> float:
    mse = float(np.mean((clean.astype(np.float64) - test.astype(np.float64)) ** 2))
    if mse == 0:
        return 100.0
    return float(10.0 * np.log10((255.0 ** 2) / mse))


def compute_ssim_global(clean: np.ndarray, test: np.ndarray) -> float:
    x = clean.astype(np.float64)
    y = test.astype(np.float64)
    mu_x, mu_y = np.mean(x), np.mean(y)
    var_x, var_y = np.var(x), np.var(y)
    cov_xy = np.mean((x - mu_x) * (y - mu_y))
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    return float(((2 * mu_x * mu_y + c1) * (2 * cov_xy + c2)) / ((mu_x ** 2 + mu_y ** 2 + c1) * (var_x + var_y + c2)))


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 12 Verification")
    print("=" * 64)

    np.random.seed(42)
    clean = np.full((128, 128), 60, dtype=np.uint8)
    clean[32:96, 32:96] = 200

    # 1. Uji Gaussian Noise + Bilateral & NLM
    noisy_g = np.clip(clean.astype(np.float64) + np.random.normal(0, 22, clean.shape), 0, 255).astype(np.uint8)
    rest_bilat = cv2.bilateralFilter(noisy_g, d=7, sigmaColor=50, sigmaSpace=50)
    rest_nlm = cv2.fastNlMeansDenoising(noisy_g, None, h=18, templateWindowSize=7, searchWindowSize=21)

    p_n, s_n = compute_psnr(clean, noisy_g), compute_ssim_global(clean, noisy_g)
    p_b, s_b = compute_psnr(clean, rest_bilat), compute_ssim_global(clean, rest_bilat)
    p_nlm, s_nlm = compute_psnr(clean, rest_nlm), compute_ssim_global(clean, rest_nlm)

    print(f"[Gaussian] Noisy     -> PSNR: {p_n:.2f} dB, SSIM: {s_n:.4f}")
    print(f"[Gaussian] Bilateral -> PSNR: {p_b:.2f} dB, SSIM: {s_b:.4f}")
    print(f"[Gaussian] NLM       -> PSNR: {p_nlm:.2f} dB, SSIM: {s_nlm:.4f}")
    assert p_b > p_n and s_b > s_n
    assert p_nlm > p_n and s_nlm > s_n

    # 2. Uji Salt & Pepper Noise + Median Filter
    noisy_sp = clean.copy()
    rnd = np.random.rand(*clean.shape)
    noisy_sp[rnd < 0.05] = 0
    noisy_sp[(rnd >= 0.05) & (rnd < 0.10)] = 255
    rest_med = cv2.medianBlur(noisy_sp, 3)

    p_sp = compute_psnr(clean, noisy_sp)
    p_med = compute_psnr(clean, rest_med)
    print(f"[Salt&Pep] Noisy     -> PSNR: {p_sp:.2f} dB | Median 3x3 -> PSNR: {p_med:.2f} dB")
    assert p_med > p_sp + 5.0

    print("Verifikasi Chapter 12 BERHASIL!")


if __name__ == "__main__":
    main()

