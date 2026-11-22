"""
Multimedia & Computer Vision Learning Hub
Chapter 06: Digital Image Fundamentals Verification Script
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_synthetic_test_image(width: int = 320, height: int = 240) -> np.ndarray:
    """Membentuk citra uji RGB sintetis yang deterministik."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    grad = np.linspace(0, 255, width, dtype=np.uint8)
    img[:, :, 2] = np.tile(grad, (height, 1))
    img[30:110, 40:130] = [220, 40, 40]
    cv2.circle(img, center=(220, 120), radius=45, color=(40, 210, 90), thickness=-1)
    return img


def quantize_bit_depth(image: np.ndarray, bits: int) -> np.ndarray:
    """Mengkuantisasi citra 8-bit menjadi b-bit."""
    if bits < 1 or bits > 8:
        raise ValueError("Kedalaman bit harus berada antara 1 dan 8.")
    if bits == 8:
        return image.copy()
    levels = (1 << bits) - 1
    norm = image.astype(np.float64) / 255.0
    q = np.round(norm * levels) / levels
    return np.round(q * 255.0).astype(np.uint8)


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 06 Verification")
    print("=" * 64)

    rgb_img = create_synthetic_test_image(320, 240)
    h, w, c = rgb_img.shape
    print(f"Dimensi Tensor RGB  : {rgb_img.shape} (Height={h}, Width={w}, Channels={c})")
    print(f"Ukuran Memori Mentah: {rgb_img.nbytes} Bytes ({rgb_img.nbytes / 1024:.2f} KB)")
    assert rgb_img.nbytes == 320 * 240 * 3

    # Verifikasi koordinat img[y, x] pada blok merah
    px = rgb_img[50, 60]
    print(f"Nilai Piksel img[50, 60]: RGB={px.tolist()}")
    assert tuple(px) == (220, 40, 40)

    # Verifikasi luminansi BT.601 vs OpenCV
    gray_manual = np.round(
        0.299 * rgb_img[:, :, 0] + 0.587 * rgb_img[:, :, 1] + 0.114 * rgb_img[:, :, 2]
    ).astype(np.uint8)
    gray_cv = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
    mae = float(np.mean(np.abs(gray_manual.astype(float) - gray_cv.astype(float))))
    print(f"MAE Grayscale BT.601 Manual vs OpenCV: {mae:.4f}")
    assert mae < 1.0

    # Verifikasi kuantisasi 2-bit menghasilkan maksimal 4 level unik
    q2 = quantize_bit_depth(gray_cv, bits=2)
    unique_q2 = np.unique(q2)
    print(f"Level Unik Kuantisasi 2-bit: {unique_q2.tolist()}")
    assert len(unique_q2) <= 4
    assert set(unique_q2).issubset({0, 85, 170, 255})

    print("Verifikasi Chapter 06 BERHASIL!")


if __name__ == "__main__":
    main()

