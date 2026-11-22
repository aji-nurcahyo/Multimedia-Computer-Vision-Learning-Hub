"""
Multimedia & Computer Vision Learning Hub
Chapter 15: Image Segmentation, Otsu, Connected Components & IoU Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_objects_scene(size: int = 200) -> tuple[np.ndarray, np.ndarray]:
    gray = np.full((size, size), 35, dtype=np.uint8)
    gt_mask = np.zeros((size, size), dtype=np.uint8)

    # Objek 1: Lingkaran
    cv2.circle(gray, (60, 65), 28, 210, -1)
    cv2.circle(gt_mask, (60, 65), 28, 255, -1)

    # Objek 2: Persegi
    cv2.rectangle(gray, (120, 40), (175, 95), 215, -1)
    cv2.rectangle(gt_mask, (120, 40), (175, 95), 255, -1)

    # Objek 3: Elips memanjang
    cv2.ellipse(gray, (100, 150), (42, 18), 0, 0, 360, 205, -1)
    cv2.ellipse(gt_mask, (100, 150), (42, 18), 0, 0, 360, 255, -1)
    return gray, gt_mask


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 15 Verification")
    print("=" * 64)

    gray, gt_mask = create_objects_scene(200)

    # 1. Otsu Thresholding
    t_otsu, pred_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    print(f"Ambang Otsu Terhitung: T* = {t_otsu:.1f}")
    assert 35 <= t_otsu < 205

    # 2. Evaluasi IoU dan Dice vs Ground Truth
    tp = int(np.logical_and(pred_mask > 0, gt_mask > 0).sum())
    fp = int(np.logical_and(pred_mask > 0, gt_mask == 0).sum())
    fn = int(np.logical_and(pred_mask == 0, gt_mask > 0).sum())
    iou = tp / (tp + fp + fn)
    dice = (2 * tp) / (2 * tp + fp + fn)
    print(f"Evaluasi Masker -> IoU: {iou:.4f}, Dice Score: {dice:.4f}")
    assert iou > 0.99 and dice > 0.99

    # 3. Connected Components & Morphometry
    num_labels, _, stats, centroids = cv2.connectedComponentsWithStats(pred_mask)
    num_objects = num_labels - 1
    print(f"Jumlah Objek Terdeteksi: {num_objects} (Expected: 3)")
    assert num_objects == 3

    contours, _ = cv2.findContours(pred_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    assert len(contours) == 3

    for i in range(1, num_labels):
        area = int(stats[i, cv2.CC_STAT_AREA])
        cx, cy = centroids[i]
        print(f"  Objek #{i}: Area={area} px, Centroid=({cx:.1f}, {cy:.1f})")
        assert area > 1500

    print("Verifikasi Chapter 15 BERHASIL!")


if __name__ == "__main__":
    main()

