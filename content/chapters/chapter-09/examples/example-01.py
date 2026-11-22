"""
Multimedia & Computer Vision Learning Hub
Chapter 09: Histogram Equalization & CLAHE Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_uneven_lighting_scene(size: int = 256) -> np.ndarray:
    x = np.linspace(35, 115, size)
    base = np.tile(x, (size, 1))
    base[40:100, 40:100] += 25
    base[140:210, 140:210] -= 20
    return np.clip(base, 0, 255).astype(np.uint8)


def manual_hist_eq(gray: np.ndarray) -> np.ndarray:
    hist = np.bincount(gray.ravel(), minlength=256)
    cdf = hist.cumsum()
    nz = cdf[cdf > 0]
    cdf_min = nz[0] if len(nz) > 0 else 0
    denom = max(1, gray.size - cdf_min)
    lut = np.round(((cdf - cdf_min) / denom) * 255.0).clip(0, 255).astype(np.uint8)
    return lut[gray]


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 09 Verification")
    print("=" * 64)

    img = create_uneven_lighting_scene(256)
    eq_manual = manual_hist_eq(img)
    eq_cv = cv2.equalizeHist(img)

    mae = float(np.mean(np.abs(eq_manual.astype(float) - eq_cv.astype(float))))
    print(f"MAE Manual Global HE vs OpenCV equalizeHist: {mae:.4f}")
    assert mae <= 1.0

    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    eq_clahe = clahe.apply(img)

    print(f"Std Original : {img.std():.2f} (Rentang [{img.min()}..{img.max()}])")
    print(f"Std Global HE: {eq_cv.std():.2f} (Rentang [{eq_cv.min()}..{eq_cv.max()}])")
    print(f"Std CLAHE    : {eq_clahe.std():.2f} (Rentang [{eq_clahe.min()}..{eq_clahe.max()}])")
    assert eq_cv.std() > img.std()
    assert eq_clahe.std() > img.std()

    print("Verifikasi Chapter 09 BERHASIL!")


if __name__ == "__main__":
    main()

