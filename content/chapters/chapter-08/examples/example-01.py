"""
Multimedia & Computer Vision Learning Hub
Chapter 08: Intensity Transformation & Gamma LUT Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import time
import numpy as np
import cv2


def apply_gamma_lut(img: np.ndarray, gamma: float) -> np.ndarray:
    """Koreksi gamma cepat berbasis Look-Up Table 256 entri."""
    r = np.arange(256, dtype=np.float64) / 255.0
    lut = np.clip(np.round((r ** gamma) * 255.0), 0, 255).astype(np.uint8)
    return cv2.LUT(img, lut)


def contrast_stretch(img: np.ndarray) -> np.ndarray:
    """Normalisasi Min-Max menjadi rentang penuh [0, 255]."""
    img_f = img.astype(np.float64)
    r_min, r_max = np.min(img_f), np.max(img_f)
    if r_max == r_min:
        return np.zeros_like(img, dtype=np.uint8)
    return np.clip(np.round(((img_f - r_min) / (r_max - r_min)) * 255.0), 0, 255).astype(np.uint8)


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 08 Verification")
    print("=" * 64)

    np.random.seed(42)
    low_c = np.linspace(40, 160, 512 * 512).reshape(512, 512).astype(np.uint8)

    # 1. Negative test
    neg = 255 - low_c
    assert neg[0, 0] == 215 and neg[-1, -1] == 95

    # 2. Gamma 0.5 brightening verification
    g_out = apply_gamma_lut(low_c, gamma=0.5)
    print(f"Mean Asli: {low_c.mean():.2f} -> Mean Gamma=0.5: {g_out.mean():.2f}")
    assert g_out.mean() > low_c.mean()

    # 3. Min-Max Contrast Stretch verification
    s_out = contrast_stretch(low_c)
    print(f"Rentang Min-Max Asli: [{low_c.min()}, {low_c.max()}] (Std={low_c.std():.2f})")
    print(f"Rentang Stretch     : [{s_out.min()}, {s_out.max()}] (Std={s_out.std():.2f})")
    assert s_out.min() == 0 and s_out.max() == 255
    assert s_out.std() > low_c.std()

    # 4. Benchmark LUT vs direct power
    t0 = time.perf_counter()
    res_pow = np.clip(np.round(((low_c / 255.0) ** 0.5) * 255.0), 0, 255).astype(np.uint8)
    t_pow = (time.perf_counter() - t0) * 1000
    t0 = time.perf_counter()
    res_lut = apply_gamma_lut(low_c, 0.5)
    t_lut = (time.perf_counter() - t0) * 1000
    assert np.array_equal(res_pow, res_lut)
    print(f"Benchmark 512x512 -> Direct Power: {t_pow:.2f} ms | cv2.LUT: {t_lut:.2f} ms")
    print("Verifikasi Chapter 08 BERHASIL!")


if __name__ == "__main__":
    main()

