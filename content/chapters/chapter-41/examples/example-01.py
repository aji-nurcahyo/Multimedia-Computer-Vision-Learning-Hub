"""
Chapter 41: Deep Learning Foundations for Vision
Standalone Python Implementation: Pure NumPy 2D Convolution, Receptive Field, and Parameter Arithmetic.

Institution: Institut Teknologi Sumatera (ITERA)
Author: Aji Pamungkas Tri Nurcahyo
"""

import numpy as np


def compute_conv2d_output_dim(h_in: int, w_in: int, k_h: int, k_w: int, p_h: int, p_w: int, s_h: int, s_w: int) -> tuple[int, int]:
    """Calculate spatial output dimensions for a 2D convolution layer."""
    h_out = (h_in - k_h + 2 * p_h) // s_h + 1
    w_out = (w_in - k_w + 2 * p_w) // s_w + 1
    return h_out, w_out


def count_conv2d_parameters(c_in: int, c_out: int, k_h: int, k_w: int, use_bias: bool = True) -> int:
    """Calculate the total number of trainable parameters in a Conv2D layer."""
    weights = c_out * c_in * k_h * k_w
    bias = c_out if use_bias else 0
    return weights + bias


def conv2d_forward_pure_numpy(
    x: np.ndarray,
    weights: np.ndarray,
    bias: np.ndarray,
    stride: int = 1,
    padding: int = 0
) -> np.ndarray:
    """
    Perform 2D cross-correlation forward pass.
    x shape: (C_in, H_in, W_in)
    weights shape: (C_out, C_in, K_h, K_w)
    bias shape: (C_out,)
    returns: (C_out, H_out, W_out)
    """
    c_in, h_in, w_in = x.shape
    c_out, k_c_in, k_h, k_w = weights.shape
    assert c_in == k_c_in, f"Input channels {c_in} must match kernel channels {k_c_in}"

    h_out, w_out = compute_conv2d_output_dim(h_in, w_in, k_h, k_w, padding, padding, stride, stride)

    # Apply padding
    if padding > 0:
        x_padded = np.pad(x, ((0, 0), (padding, padding), (padding, padding)), mode='constant')
    else:
        x_padded = x

    out = np.zeros((c_out, h_out, w_out), dtype=np.float64)

    for oc in range(c_out):
        for i in range(h_out):
            h_start = i * stride
            h_end = h_start + k_h
            for j in range(w_out):
                w_start = j * stride
                w_end = w_start + k_w
                # Receptive field patch across all input channels
                patch = x_padded[:, h_start:h_end, w_start:w_end]
                # Sum over all channels and spatial kernel
                out[oc, i, j] = np.sum(patch * weights[oc]) + bias[oc]

    return out


def relu(x: np.ndarray) -> np.ndarray:
    """ReLU activation function."""
    return np.maximum(0, x)


def softmax(x: np.ndarray) -> np.ndarray:
    """Stable softmax implementation."""
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / np.sum(e_x, axis=-1, keepdims=True)


def main():
    print("=== Chapter 41: Deep Learning Foundations for Vision ===")

    # 1. Test Parameter Counting
    # ResNet-style conv: 64 in, 128 out, 3x3 kernel with bias
    params = count_conv2d_parameters(c_in=64, c_out=128, k_h=3, k_w=3, use_bias=True)
    expected_params = (128 * 64 * 3 * 3) + 128  # 73,728 + 128 = 73,856
    print(f"[Check 1] Conv2D Parameters: {params} (Expected: {expected_params})")
    assert params == expected_params, f"Parameter count mismatch: {params} != {expected_params}"

    # 2. Test Output Dimension Calculation
    h_out, w_out = compute_conv2d_output_dim(h_in=224, w_in=224, k_h=7, k_w=7, p_h=3, p_w=3, s_h=2, s_w=2)
    print(f"[Check 2] 224x224 Conv (k=7, p=3, s=2) -> Output: ({h_out}, {w_out})")
    assert (h_out, w_out) == (112, 112), f"Dimension mismatch: ({h_out}, {w_out}) != (112, 112)"

    # 3. Test Manual Calculation from Lecture / Section 3
    # 1 channel input, 4x4 image
    x = np.array([
        [10.0, 20.0, 20.0, 10.0],
        [30.0, 50.0, 40.0, 20.0],
        [10.0, 60.0, 50.0, 30.0],
        [20.0, 10.0, 30.0, 20.0]
    ], dtype=np.float64).reshape(1, 4, 4)

    # Sobel Horizontal Kernel (1 out_channel, 1 in_channel, 3x3)
    weights = np.array([
        [
            [-1.0, -2.0, -1.0],
            [ 0.0,  0.0,  0.0],
            [ 1.0,  2.0,  1.0]
        ]
    ], dtype=np.float64).reshape(1, 1, 3, 3)

    bias = np.array([5.0], dtype=np.float64)

    # Forward conv
    y = conv2d_forward_pure_numpy(x, weights, bias, stride=1, padding=0)
    print(f"[Check 3] Convolved Output Shape: {y.shape}")
    assert y.shape == (1, 2, 2)

    # Check numerical elements from Section 3
    print(f"Y[0, 0, 0] = {y[0, 0, 0]:.1f} (Expected: 115.0)")
    print(f"Y[0, 0, 1] = {y[0, 0, 1]:.1f} (Expected: 125.0)")
    assert np.isclose(y[0, 0, 0], 115.0), f"Y[0, 0, 0] mismatch: {y[0, 0, 0]}"
    assert np.isclose(y[0, 0, 1], 125.0), f"Y[0, 0, 1] mismatch: {y[0, 0, 1]}"

    # Test ReLU activation
    activated = relu(y)
    assert np.all(activated >= 0.0)
    assert np.isclose(activated[0, 0, 0], 115.0)

    # 4. Softmax and Cross-Entropy Verification
    logits = np.array([2.5, 0.5, -1.0], dtype=np.float64)
    probs = softmax(logits)
    print(f"[Check 4] Logits: {logits} -> Softmax Probs: {np.round(probs, 4)}")
    assert np.isclose(np.sum(probs), 1.0)
    assert probs[0] > probs[1] > probs[2]

    # Target class 0 (one-hot [1, 0, 0])
    ce_loss = -np.log(probs[0])
    print(f"[Check 5] Cross-Entropy Loss (Target 0): {ce_loss:.4f}")
    assert ce_loss > 0.0

    print("All Chapter 41 mathematical and numerical verifications PASSED successfully.")


if __name__ == "__main__":
    main()
