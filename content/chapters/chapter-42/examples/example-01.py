"""
Chapter 42: Image Classification with CNN
Standalone Python Implementation: Residual Block Arithmetic, Softmax Calibration,
Multi-Class Confusion Matrix, and Precision/Recall/F1 Metrics.

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import numpy as np


def residual_forward(x: np.ndarray, f_x: np.ndarray) -> np.ndarray:
    """Compute basic residual addition: H(x) = F(x) + x."""
    assert x.shape == f_x.shape, f"Shape mismatch: {x.shape} vs {f_x.shape}"
    return f_x + x


def softmax_with_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Compute temperature-scaled Softmax probabilities."""
    assert temperature > 0, "Temperature must be positive"
    scaled_logits = logits / temperature
    e_x = np.exp(scaled_logits - np.max(scaled_logits, axis=-1, keepdims=True))
    return e_x / np.sum(e_x, axis=-1, keepdims=True)


def compute_cross_entropy_loss(probs: np.ndarray, target_idx: int) -> float:
    """Calculate categorical cross-entropy loss for a single sample."""
    eps = 1e-12
    p = np.clip(probs[target_idx], eps, 1.0)
    return float(-np.log(p))


def compute_classification_metrics(confusion_matrix: np.ndarray) -> dict:
    """
    Compute Accuracy, per-class Precision, Recall, F1, and Macro F1 from a confusion matrix.
    confusion_matrix shape: (K, K) where rows are ground truth, columns are predicted.
    """
    k = confusion_matrix.shape[0]
    total_samples = np.sum(confusion_matrix)
    accuracy = np.trace(confusion_matrix) / total_samples

    precision = np.zeros(k, dtype=np.float64)
    recall = np.zeros(k, dtype=np.float64)
    f1 = np.zeros(k, dtype=np.float64)

    for c in range(k):
        tp = confusion_matrix[c, c]
        fp = np.sum(confusion_matrix[:, c]) - tp
        fn = np.sum(confusion_matrix[c, :]) - tp

        precision[c] = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall[c] = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1[c] = (2 * precision[c] * recall[c]) / (precision[c] + recall[c]) if (precision[c] + recall[c]) > 0 else 0.0

    macro_f1 = np.mean(f1)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "macro_f1": macro_f1
    }


def main():
    print("=== Chapter 42: Image Classification with CNN ===")

    # 1. Residual Connection Verification
    x = np.array([[1.5, -0.5], [2.0, 3.1]], dtype=np.float64)
    f_x = np.array([[0.2, 0.8], [-1.0, 0.4]], dtype=np.float64)
    h_x = residual_forward(x, f_x)
    print(f"[Check 1] Residual H(x) = F(x) + x successfully computed:")
    print(h_x)
    assert np.allclose(h_x, np.array([[1.7, 0.3], [1.0, 3.5]])), "Residual addition error"

    # 2. Softmax Temperature Scaling Verification
    logits = np.array([2.20, 1.10, -0.50], dtype=np.float64)
    p_t1 = softmax_with_temperature(logits, temperature=1.0)
    print(f"[Check 2] Softmax (T=1.0): {np.round(p_t1, 4)}")
    assert np.isclose(np.sum(p_t1), 1.0)
    # Check manual values from Section 3
    assert np.isclose(p_t1[0], 0.71424, atol=1e-3)
    assert np.isclose(p_t1[1], 0.23776, atol=1e-3)
    assert np.isclose(p_t1[2], 0.04800, atol=1e-3)

    # Cross-Entropy Loss for class 0
    loss = compute_cross_entropy_loss(p_t1, target_idx=0)
    print(f"[Check 3] Categorical Cross-Entropy Loss: {loss:.4f} (Expected: ~0.3366)")
    assert np.isclose(loss, 0.33656, atol=1e-3)

    # Check Temperature smoothing effect
    p_t2 = softmax_with_temperature(logits, temperature=2.0)
    print(f"[Check 4] Softmax (T=2.0, Smoothed): {np.round(p_t2, 4)}")
    assert p_t2[0] < p_t1[0]  # Higher temperature softens distribution
    assert p_t2[2] > p_t1[2]

    # 3. Confusion Matrix and Metrics Verification
    # 3x3 matrix from Section 3
    # Rows: True [0, 1, 2], Columns: Pred [0, 1, 2]
    cm = np.array([
        [35,  5,  2],
        [ 4, 28,  3],
        [ 1,  2, 20]
    ], dtype=np.int64)

    metrics = compute_classification_metrics(cm)
    print(f"[Check 5] Total Accuracy: {metrics['accuracy']:.4f}")
    print(f"Class 0 Precision: {metrics['precision'][0]:.4f} (Expected: 0.8750)")
    print(f"Class 0 Recall:    {metrics['recall'][0]:.4f} (Expected: 0.8333)")
    print(f"Class 0 F1-Score:  {metrics['f1'][0]:.4f} (Expected: ~0.8537)")
    print(f"Macro F1-Score:    {metrics['macro_f1']:.4f}")

    assert np.isclose(metrics['accuracy'], 83.0 / 100.0)
    assert np.isclose(metrics['precision'][0], 0.8750)
    assert np.isclose(metrics['recall'][0], 35.0 / 42.0)
    assert np.isclose(metrics['f1'][0], 0.8536585, atol=1e-4)

    print("All Chapter 42 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
