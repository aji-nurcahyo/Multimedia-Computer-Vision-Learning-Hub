"""
Multimedia & Computer Vision Learning Hub
Chapter 14: Morphological Image Processing Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_noisy_binary_objects(size: int = 128) -> np.ndarray:
    mask = np.zeros((size, size), dtype=np.uint8)
    mask[25:85, 25:85] = 255
    mask[52:56, 52:56] = 0     # Lubang internal 4x4
    mask[10:12, 100:102] = 255 # Noise luar 2x2
    mask[105:107, 20:22] = 255
    return mask


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 14 Verification")
    print("=" * 64)

    binary = create_noisy_binary_objects(128)
    se = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))

    opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, se)
    assert opened[10, 100] == 0 and opened[105, 20] == 0, "Opening harus menghapus noise luar!"
    assert opened[30, 30] == 255, "Opening harus mempertahankan objek utama!"

    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, se)
    assert closed[54, 54] == 255, "Closing harus menutup lubang 4x4!"

    grad = cv2.morphologyEx(closed, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
    assert grad[25, 50] == 255 and grad[55, 55] == 0, "Gradient hanya mengekstrak tepi!"

    # Uji Idempotensi Opening: Open(Open(X)) == Open(X)
    opened_twice = cv2.morphologyEx(opened, cv2.MORPH_OPEN, se)
    assert np.array_equal(opened, opened_twice), "Opening bersifat idempoten!"

    print("Verifikasi Chapter 14 Morfologi BERHASIL!")


if __name__ == "__main__":
    main()

