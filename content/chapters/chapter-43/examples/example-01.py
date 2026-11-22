"""
Chapter 43: Transfer Learning & Fine-Tuning
Standalone Python Implementation: Discriminative Learning Rates, Cosine Annealing with Warmup,
and Weight Drift Comparison.

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import math
import numpy as np


def cosine_annealing_with_warmup(
    step: int,
    total_steps: int,
    warmup_steps: int,
    lr_min: float = 1e-6,
    lr_max: float = 1e-3
) -> float:
    """Compute learning rate at a given step with linear warmup and cosine annealing."""
    if step <= warmup_steps:
        # Linear warmup
        return lr_min + (step / warmup_steps) * (lr_max - lr_min)
    else:
        # Cosine annealing
        progress = (step - warmup_steps) / max(1, total_steps - warmup_steps)
        return lr_min + 0.5 * (lr_max - lr_min) * (1.0 + math.cos(math.pi * progress))


def discriminative_layer_lr(base_lr: float, decay_factor: float, num_layers: int) -> list[float]:
    """Compute geometric discriminative learning rates for layers from bottom (input) to top (head)."""
    # Head has highest lr (base_lr), earlier layers decay geometrically
    lrs = [base_lr * (decay_factor ** (num_layers - 1 - i)) for i in range(num_layers)]
    return lrs


def update_layer_weights(weights: list[float], grads: list[float], lrs: list[float]) -> list[float]:
    """Apply SGD update: w_new = w - lr * grad."""
    return [w - lr * g for w, lr, g in zip(weights, lrs, grads)]


def main():
    print("=== Chapter 43: Transfer Learning & Fine-Tuning ===")

    # 1. Test Cosine Annealing with Warmup Schedule
    total_steps = 100
    warmup_steps = 10
    lr_min = 1e-6
    lr_max = 1e-3

    # Step 0: min
    lr_0 = cosine_annealing_with_warmup(0, total_steps, warmup_steps, lr_min, lr_max)
    print(f"[Check 1] Step 0 LR: {lr_0:.6f} (Expected: {lr_min:.6f})")
    assert np.isclose(lr_0, lr_min)

    # Step 10: peak (warmup ends)
    lr_peak = cosine_annealing_with_warmup(10, total_steps, warmup_steps, lr_min, lr_max)
    print(f"[Check 2] Step 10 (Peak) LR: {lr_peak:.6f} (Expected: {lr_max:.6f})")
    assert np.isclose(lr_peak, lr_max)

    # Step 100: final min
    lr_final = cosine_annealing_with_warmup(100, total_steps, warmup_steps, lr_min, lr_max)
    print(f"[Check 3] Step 100 (Final) LR: {lr_final:.6f} (Expected: {lr_min:.6f})")
    assert np.isclose(lr_final, lr_min)

    # 2. Test Discriminative Learning Rates & Worked Example from Section 3
    base_lr = 0.001
    decay = 0.1
    num_layers = 3  # [Layer 1 (bottom), Layer 2 (middle), Layer 3 (head)]

    lrs = discriminative_layer_lr(base_lr, decay, num_layers)
    print(f"[Check 4] Discriminative LRs: {lrs}")
    assert np.isclose(lrs[2], 0.001)    # Head
    assert np.isclose(lrs[1], 0.0001)   # Mid
    assert np.isclose(lrs[0], 0.00001)  # Bottom

    # Weights and Gradients from Section 3
    initial_w = [0.5000, -0.3000, 0.1000]
    grads = [1.5, 2.0, 4.0]

    updated_w = update_layer_weights(initial_w, grads, lrs)
    print(f"[Check 5] Updated Weights: {updated_w}")
    assert np.isclose(updated_w[2], 0.0960)
    assert np.isclose(updated_w[1], -0.3002)
    assert np.isclose(updated_w[0], 0.499985)

    # 3. Relative Weight Drift Analysis
    drift_bottom = abs(updated_w[0] - initial_w[0]) / abs(initial_w[0])
    drift_head = abs(updated_w[2] - initial_w[2]) / abs(initial_w[2])
    print(f"[Check 6] Drift Bottom: {drift_bottom*100:.4f}% vs Drift Head: {drift_head*100:.2f}%")
    assert drift_head > 100 * drift_bottom  # Head adapted much faster than frozen features

    print("All Chapter 43 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
