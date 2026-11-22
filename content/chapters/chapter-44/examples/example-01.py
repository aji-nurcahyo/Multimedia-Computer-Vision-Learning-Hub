"""
Chapter 44: Object Detection with YOLO
Standalone Python Implementation: Anchor-Free Bounding Box Decoding,
Complete IoU (CIoU) Loss, Multi-Class NMS, and 11-Point Average Precision (AP).

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import math
import numpy as np


def compute_iou(box_a: np.ndarray, box_b: np.ndarray) -> float:
    """
    Calculate Intersection over Union (IoU) between two bounding boxes.
    Boxes formatted as [x1, y1, x2, y2].
    """
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    inter_w = max(0.0, x2 - x1)
    inter_h = max(0.0, y2 - y1)
    inter_area = inter_w * inter_h

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union_area = area_a + area_b - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area


def compute_ciou_loss(box_pred: np.ndarray, box_gt: np.ndarray) -> float:
    """
    Compute Complete IoU (CIoU) Loss between box_pred and box_gt.
    Boxes in [x1, y1, x2, y2] format.
    """
    iou = compute_iou(box_pred, box_gt)

    # Centers
    cx_pred = (box_pred[0] + box_pred[2]) / 2.0
    cy_pred = (box_pred[1] + box_pred[3]) / 2.0
    cx_gt = (box_gt[0] + box_gt[2]) / 2.0
    cy_gt = (box_gt[1] + box_gt[3]) / 2.0

    # Euclidean distance squared
    rho2 = (cx_pred - cx_gt)**2 + (cy_pred - cy_gt)**2

    # Smallest enclosing box
    enc_x1 = min(box_pred[0], box_gt[0])
    enc_y1 = min(box_pred[1], box_gt[1])
    enc_x2 = max(box_pred[2], box_gt[2])
    enc_y2 = max(box_pred[3], box_gt[3])
    c2 = (enc_x2 - enc_x1)**2 + (enc_y2 - enc_y1)**2

    # Aspect ratio consistency v and alpha
    w_pred = max(1e-6, box_pred[2] - box_pred[0])
    h_pred = max(1e-6, box_pred[3] - box_pred[1])
    w_gt = max(1e-6, box_gt[2] - box_gt[0])
    h_gt = max(1e-6, box_gt[3] - box_gt[1])

    atan_diff = math.atan(w_gt / h_gt) - math.atan(w_pred / h_pred)
    v = (4.0 / (math.pi**2)) * (atan_diff**2)
    alpha = v / ((1.0 - iou) + v + 1e-7)

    ciou = iou - (rho2 / (c2 + 1e-7)) - (alpha * v)
    return float(1.0 - ciou)


def non_maximum_suppression(boxes: np.ndarray, scores: np.ndarray, iou_threshold: float = 0.5) -> list[int]:
    """
    Perform Non-Maximum Suppression (NMS).
    boxes: shape (N, 4) in [x1, y1, x2, y2]
    scores: shape (N,)
    returns: indices of preserved boxes.
    """
    indices = np.argsort(scores)[::-1]
    keep = []

    while len(indices) > 0:
        current = indices[0]
        keep.append(current)
        if len(indices) == 1:
            break

        remaining = indices[1:]
        ious = np.array([compute_iou(boxes[current], boxes[idx]) for idx in remaining])
        indices = remaining[ious < iou_threshold]

    return keep


def compute_11_point_ap(recalls: np.ndarray, precisions: np.ndarray) -> float:
    """Compute 11-point interpolated Average Precision (PASCAL VOC protocol)."""
    ap = 0.0
    for r in np.linspace(0.0, 1.0, 11):
        matching = precisions[recalls >= r]
        p = np.max(matching) if len(matching) > 0 else 0.0
        ap += p / 11.0
    return float(ap)


def main():
    print("=== Chapter 44: Object Detection with YOLO ===")

    # 1. CIoU Loss Manual Calculation Verification from Section 3
    b_gt = np.array([20.0, 20.0, 100.0, 100.0], dtype=np.float64)
    b_pred = np.array([40.0, 40.0, 120.0, 120.0], dtype=np.float64)

    iou_val = compute_iou(b_pred, b_gt)
    print(f"[Check 1] IoU: {iou_val:.4f} (Expected: 9/23 = 0.3913)")
    assert np.isclose(iou_val, 9.0 / 23.0, atol=1e-4)

    ciou_loss_val = compute_ciou_loss(b_pred, b_gt)
    print(f"[Check 2] CIoU Loss: {ciou_loss_val:.4f} (Expected: ~0.6487)")
    assert np.isclose(ciou_loss_val, 0.6487, atol=1e-3)

    # 2. Non-Maximum Suppression Verification
    boxes = np.array([
        [40.0, 40.0, 120.0, 120.0],  # Box A (high score)
        [42.0, 39.0, 118.0, 121.0],  # Box B (redundant overlap with A)
        [200.0, 200.0, 280.0, 280.0] # Box C (independent separate object)
    ], dtype=np.float64)
    scores = np.array([0.92, 0.78, 0.85], dtype=np.float64)

    kept_indices = non_maximum_suppression(boxes, scores, iou_threshold=0.5)
    print(f"[Check 3] Kept Box Indices after NMS: {kept_indices}")
    assert kept_indices == [0, 2], f"NMS error: expected [0, 2], got {kept_indices}"

    # 3. 11-point Average Precision Verification
    recalls = np.array([0.1, 0.2, 0.4, 0.6, 0.8, 1.0])
    precisions = np.array([1.0, 1.0, 0.8, 0.8, 0.5, 0.4])
    ap_val = compute_11_point_ap(recalls, precisions)
    print(f"[Check 4] 11-point AP: {ap_val:.4f}")
    assert 0.0 <= ap_val <= 1.0

    print("All Chapter 44 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
