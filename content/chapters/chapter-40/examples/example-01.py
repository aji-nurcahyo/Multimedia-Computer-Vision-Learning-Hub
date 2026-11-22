"""
Chapter 40 - Classical Object Recognition & Scene Analysis
Academic Reference Implementation & Deterministic Verification
Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
"""

import numpy as np
import cv2

def compute_iou(box_a, box_b) -> float:
    """Menghitung Intersection over Union (IoU) antara dua bounding box [x1, y1, x2, y2]."""
    x_a1, y_a1, x_a2, y_a2 = box_a
    x_b1, y_b1, x_b2, y_b2 = box_b
    
    inter_x1 = max(x_a1, x_b1)
    inter_y1 = max(y_a1, y_b1)
    inter_x2 = min(x_a2, x_b2)
    inter_y2 = min(y_a2, y_b2)
    
    inter_w = max(0.0, inter_x2 - inter_x1)
    inter_h = max(0.0, inter_y2 - inter_y1)
    area_inter = inter_w * inter_h
    
    area_a = max(0.0, x_a2 - x_a1) * max(0.0, y_a2 - y_a1)
    area_b = max(0.0, x_b2 - x_b1) * max(0.0, y_b2 - y_b1)
    
    area_union = area_a + area_b - area_inter
    if area_union <= 0:
        return 0.0
    return float(area_inter / area_union)

def non_maximum_suppression(boxes, scores, iou_threshold=0.5):
    """Menyaring bounding box redundan menggunakan NMS."""
    if len(boxes) == 0:
        return []
    
    boxes = np.array(boxes, dtype=np.float32)
    scores = np.array(scores, dtype=np.float32)
    
    idxs = np.argsort(scores)[::-1]
    picked = []
    
    while len(idxs) > 0:
        current = idxs[0]
        picked.append(current)
        
        if len(idxs) == 1:
            break
            
        remaining_idxs = idxs[1:]
        ious = np.array([compute_iou(boxes[current], boxes[i]) for i in remaining_idxs])
        idxs = remaining_idxs[ious <= iou_threshold]
        
    return picked

def test_chapter_40_recognition():
    print("=== Menjalankan Verifikasi Bab 40: Object Recognition ===")
    
    # 1. Verifikasi Perhitungan Numerik IoU (Kasus dari index.md)
    # Box A: [50, 50, 150, 200] (area 100x150 = 15000)
    # Box B: [70, 60, 160, 210] (area 90x150 = 13500)
    # Irisan: [70, 60, 150, 200] -> area 80x140 = 11200
    # Union: 15000 + 13500 - 11200 = 17300 -> IoU = 11200 / 17300 = 0.6473988
    box_a = [50.0, 50.0, 150.0, 200.0]
    box_b = [70.0, 60.0, 160.0, 210.0]
    
    iou_val = compute_iou(box_a, box_b)
    expected_iou = 11200.0 / 17300.0
    assert np.isclose(iou_val, expected_iou, atol=1e-5), f"IoU mismatch: {iou_val} vs {expected_iou}"
    
    # 2. Verifikasi Non-Maximum Suppression (NMS)
    test_boxes = [
        [50, 50, 150, 200],  # Box 0: Skor tertinggi
        [52, 48, 153, 198],  # Box 1: Tumpang tindih sangat tinggi dengan Box 0
        [200, 50, 300, 200]  # Box 2: Objek terpisah lain
    ]
    test_scores = [0.95, 0.88, 0.91]
    
    survived_indices = non_maximum_suppression(test_boxes, test_scores, iou_threshold=0.5)
    # Box 1 harus ditekan karena IoU > 0.5 dengan Box 0. Yang tersisa harus Box 0 dan Box 2.
    assert 0 in survived_indices, "Box 0 skor tertinggi harus bertahan"
    assert 2 in survived_indices, "Box 2 objek independen harus bertahan"
    assert 1 not in survived_indices, "Box 1 harus ditekan oleh NMS"
    assert len(survived_indices) == 2, f"Jumlah kotak lolos NMS harus 2, didapat: {len(survived_indices)}"
    
    # 3. Verifikasi Pencocokan Templat NCC (cv2.TM_CCOEFF_NORMED)
    # Buat citra dan templat sintetis
    img = np.zeros((100, 100), dtype=np.uint8)
    template = np.zeros((20, 20), dtype=np.uint8)
    template[5:15, 5:15] = 255
    # Letakkan templat pada koordinat (40, 30) pada citra
    img[30:50, 40:60] = template
    
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    
    assert np.isclose(max_val, 1.0, atol=1e-4), f"Korelasi puncak NCC harus 1.0, didapat: {max_val}"
    assert max_loc == (40, 30), f"Lokasi templat salah: {max_loc} vs expected (40, 30)"
    
    print(f"PASS Ch 40: IoU={iou_val:.4f}, NMS Survived={survived_indices}, NCC Max={max_val:.4f} at {max_loc}")

if __name__ == '__main__':
    test_chapter_40_recognition()
