"""
Chapter 45: Semantic & Instance Segmentation
Standalone Python Implementation: U-Net Skip Concatenation Shape Verification,
Soft Dice Loss, and Multi-Class Pixel mIoU.

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import numpy as np


def compute_soft_dice_loss(pred_probs: np.ndarray, ground_truth: np.ndarray, eps: float = 1.0) -> float:
    """
    Compute Soft Dice Loss for binary segmentation.
    pred_probs: array of continuous probabilities [0, 1]
    ground_truth: binary array {0, 1}
    """
    p = pred_probs.flatten()
    g = ground_truth.flatten()
    intersection = np.sum(p * g)
    cardinality = np.sum(p**2) + np.sum(g**2)
    dice_coeff = (2.0 * intersection + eps) / (cardinality + eps)
    return float(1.0 - dice_coeff)


def compute_pixel_miou(pred_mask: np.ndarray, gt_mask: np.ndarray, num_classes: int) -> dict:
    """
    Calculate Mean Intersection over Union (mIoU) across all classes.
    pred_mask, gt_mask: integer arrays with class indices in [0, num_classes-1].
    """
    ious = []
    for c in range(num_classes):
        tp = np.sum((pred_mask == c) & (gt_mask == c))
        fp = np.sum((pred_mask == c) & (gt_mask != c))
        fn = np.sum((pred_mask != c) & (gt_mask == c))
        union = tp + fp + fn
        if union == 0:
            ious.append(1.0)  # Class not present in either
        else:
            ious.append(tp / union)

    miou = np.mean(ious)
    return {
        "class_ious": ious,
        "miou": float(miou)
    }


def unet_skip_connection_concat(encoder_features: np.ndarray, decoder_features: np.ndarray) -> np.ndarray:
    """
    Concatenate encoder features to upsampled decoder features along channel axis.
    Features formatted in NCHW: (Batch, Channel, Height, Width).
    """
    b1, c1, h1, w1 = encoder_features.shape
    b2, c2, h2, w2 = decoder_features.shape
    assert (b1, h1, w1) == (b2, h2, w2), f"Spatial dimensions must match: {(b1, h1, w1)} vs {(b2, h2, w2)}"
    return np.concatenate([decoder_features, encoder_features], axis=1)


def main():
    print("=== Chapter 45: Semantic & Instance Segmentation ===")

    # 1. U-Net Skip Connection Concatenation Verification
    # Batch=1, Encoder: 64 channels, 64x64; Decoder: 64 channels, 64x64
    enc_feat = np.ones((1, 64, 64, 64), dtype=np.float32)
    dec_feat = np.ones((1, 64, 64, 64), dtype=np.float32) * 2.0
    fused = unet_skip_connection_concat(enc_feat, dec_feat)
    print(f"[Check 1] U-Net Skip Fusion Output Shape: {fused.shape} (Expected: (1, 128, 64, 64))")
    assert fused.shape == (1, 128, 64, 64), "U-Net skip channel concatenation failed"

    # 2. Soft Dice Loss Verification from Section 3
    gt = np.array([[1, 1], [0, 0]], dtype=np.float64)
    probs = np.array([[0.90, 0.80], [0.20, 0.10]], dtype=np.float64)

    dice_loss = compute_soft_dice_loss(probs, gt, eps=1.0)
    print(f"[Check 2] Soft Dice Loss: {dice_loss:.4f} (Expected: ~0.0222)")
    assert np.isclose(dice_loss, 0.02222, atol=1e-4), f"Dice loss mismatch: {dice_loss}"

    # 3. Pixel-wise mIoU Verification
    pred_bin = (probs >= 0.50).astype(int)
    gt_int = gt.astype(int)

    metrics = compute_pixel_miou(pred_bin, gt_int, num_classes=2)
    print(f"[Check 3] Foreground IoU: {metrics['class_ious'][1]:.4f}")
    print(f"[Check 4] Background IoU: {metrics['class_ious'][0]:.4f}")
    print(f"[Check 5] Mean IoU (mIoU): {metrics['miou']:.4f} (Expected: 1.0000)")
    assert np.isclose(metrics['miou'], 1.0000), "mIoU should be 1.0 for perfect threshold match"

    # 4. Partial IoU test
    noisy_pred = np.array([[1, 0], [0, 0]], dtype=int)
    noisy_metrics = compute_pixel_miou(noisy_pred, gt_int, num_classes=2)
    print(f"[Check 6] Noisy Pred mIoU: {noisy_metrics['miou']:.4f}")
    assert noisy_metrics['miou'] < 1.0

    print("All Chapter 45 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
