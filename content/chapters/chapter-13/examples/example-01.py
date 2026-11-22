"""
Multimedia & Computer Vision Learning Hub
Chapter 13: Edge Detection & Harris Corner Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_geometric_scene(size: int = 160) -> np.ndarray:
    img = np.full((size, size), 30, dtype=np.uint8)
    cv2.rectangle(img, (30, 30), (90, 90), 220, -1)
    pts = np.array([[120, 40], [145, 115], [95, 115]], dtype=np.int32)
    cv2.fillPoly(img, [pts], 200)
    return img


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 13 Verification")
    print("=" * 64)

    gray = create_geometric_scene(160)

    # 1. Sobel Gradients
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.clip(np.hypot(gx, gy), 0, 255).astype(np.uint8)
    assert sobel_mag[60, 30] > 150, "Tepi vertikal persegi harus memiliki gradien Sobel tinggi"
    assert sobel_mag[60, 60] == 0, "Bagian dalam homogen persegi harus bergradien 0"

    # 2. Canny Edge Detector
    edges = cv2.Canny(gray, 50, 150)
    edge_px = int(np.sum(edges == 255))
    print(f"Piksel Tepi Canny Terdeteksi: {edge_px} piksel")
    assert 250 < edge_px < 1000

    # 3. Harris Corner Detector
    harris = cv2.cornerHarris(gray.astype(np.float32), blockSize=3, ksize=3, k=0.04)
    corner_mask = (harris > 0.05 * harris.max()).astype(np.uint8)
    num_labels, _ = cv2.connectedComponents(corner_mask)
    num_corners = num_labels - 1
    print(f"Klaster Sudut Harris Terdeteksi: {num_corners} sudut (4 persegi + 3 segitiga = 7)")
    assert num_corners >= 7

    print("Verifikasi Chapter 13 BERHASIL!")


if __name__ == "__main__":
    main()

