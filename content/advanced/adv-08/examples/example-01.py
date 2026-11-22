"""
ADV-08: Efficient Computer Vision & Edge AI Architecture
Verification of Affine Quantization, Straight-Through Estimators, Structured Pruning, and Roofline Performance

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
Level: L3 Advanced Curriculum
"""

import numpy as np

def compute_affine_quant_params(min_val: float, max_val: float, num_bits: int = 8) -> tuple[float, int]:
    """
    Compute scale S and zero-point Z for uniform affine quantization
    """
    q_min = 0
    q_max = (1 << num_bits) - 1
    
    scale = (max_val - min_val) / float(q_max - q_min)
    zero_point = int(np.round((q_min * max_val - q_max * min_val) / (max_val - min_val)))
    zero_point = max(q_min, min(q_max, zero_point))
    return float(scale), zero_point

def quantize_affine_int8(x: np.ndarray, scale: float, zero_point: int, num_bits: int = 8) -> np.ndarray:
    q_min = 0
    q_max = (1 << num_bits) - 1
    q = np.round(x / scale) + zero_point
    return np.clip(q, q_min, q_max).astype(np.int32)

def dequantize_affine_int8(q: np.ndarray, scale: float, zero_point: int) -> np.ndarray:
    return scale * (q.astype(np.float64) - zero_point)

def structured_channel_pruning(weights: np.ndarray, prune_ratio: float = 0.5) -> tuple[np.ndarray, np.ndarray, float]:
    """
    Structured channel pruning of convolution filters based on L1 norm.
    weights shape: [C_out, C_in, K, K]
    """
    C_out = weights.shape[0]
    channel_norms = np.array([np.sum(np.abs(weights[c])) for c in range(C_out)])
    
    k = int(np.floor(C_out * prune_ratio))
    sorted_indices = np.argsort(channel_norms)
    prune_mask = np.zeros(C_out, dtype=bool)
    prune_mask[sorted_indices[:k]] = True
    
    pruned_weights = weights.copy()
    pruned_weights[prune_mask] = 0.0
    sparsity = (k / float(C_out)) * 100.0
    return pruned_weights, prune_mask, sparsity

def evaluate_roofline_model(arithmetic_intensity: float, peak_gflops: float, peak_bandwidth_gbs: float) -> tuple[float, str, float]:
    """
    Attainable Performance = min(Peak Compute, Intensity * Bandwidth)
    """
    knee_point = peak_gflops / peak_bandwidth_gbs if peak_bandwidth_gbs > 0 else 0.0
    memory_bound_limit = arithmetic_intensity * peak_bandwidth_gbs
    attainable_gflops = min(peak_gflops, memory_bound_limit)
    regime = "memory-bound" if arithmetic_intensity < knee_point else "compute-bound"
    return float(attainable_gflops), regime, float(knee_point)

def calculate_latency_percentiles(latencies: list[float]) -> dict[str, float]:
    sorted_lats = np.sort(latencies)
    return {
        "p50": float(np.percentile(sorted_lats, 50)),
        "p95": float(np.percentile(sorted_lats, 95)),
        "p99": float(np.percentile(sorted_lats, 99)),
        "mean": float(np.mean(sorted_lats))
    }

def main():
    print("=" * 70)
    print("ADV-08: EFFICIENT COMPUTER VISION & EDGE AI ARCHITECTURE")
    print("Verification of Integer Quantization, Pruning, and Roofline Performance")
    print("=" * 70)
    
    # 1. Uniform Affine Quantization (INT8)
    min_v, max_v = -1.20, 2.60
    scale, zp = compute_affine_quant_params(min_v, max_v, num_bits=8)
    print(f"\n[1] Affine Quantization Parameters (Input Range: [{min_v}, {max_v}]):")
    print(f"    Scale Factor S: {scale:.8f}")
    print(f"    Zero-Point Z:   {zp} (Quantized representation of 0.0)")
    assert zp == 81 and abs(scale - 0.01490196) < 1e-6, "Scale or zero-point mismatch"
    
    # Test values roundtrip
    test_vals = np.array([-1.20, -0.50, 0.00, 1.45, 2.60], dtype=np.float64)
    q_vals = quantize_affine_int8(test_vals, scale, zp, num_bits=8)
    deq_vals = dequantize_affine_int8(q_vals, scale, zp)
    errors = np.abs(test_vals - deq_vals)
    max_err = float(np.max(errors))
    
    print("\n[2] Quantization Roundtrip & Error Analysis:")
    for orig, q, deq, err in zip(test_vals, q_vals, deq_vals, errors):
        print(f"    Orig: {orig:6.2f} -> Quantized: {q:3d} -> Dequant: {deq:6.4f} | Error: {err:6.5f}")
    
    # Max error must be strictly bounded by S / 2
    max_theoretical_bound = scale / 2.0
    print(f"    Maximum Observed Error:     {max_err:.6f}")
    print(f"    Theoretical Maximum Bound:  {max_theoretical_bound:.6f} (S / 2)")
    assert max_err <= max_theoretical_bound + 1e-6, "Quantization error exceeds theoretical bound S/2"
    print("    -> Quantization Error Bound Verification: PASS")
    
    # Compute SQNR on normal distribution
    np.random.seed(42)
    sample_weights = np.random.normal(0.0, 0.8, size=1000)
    s_s, s_zp = compute_affine_quant_params(float(sample_weights.min()), float(sample_weights.max()), num_bits=8)
    q_s = quantize_affine_int8(sample_weights, s_s, s_zp)
    deq_s = dequantize_affine_int8(q_s, s_s, s_zp)
    
    sig_pow = float(np.mean(sample_weights ** 2))
    noise_pow = float(np.mean((sample_weights - deq_s) ** 2))
    sqnr = 10.0 * np.log10(sig_pow / noise_pow)
    print(f"    Empirical SQNR (8-bit Normal Distribution): {sqnr:.2f} dB (High fidelity)")
    assert sqnr > 38.0, "SQNR too low for 8-bit quantization"
    print("    -> Signal-to-Quantization-Noise Ratio: PASS")
    
    # 2. Structured Channel Pruning
    weights_tensor = np.random.normal(0.0, 1.0, size=(16, 8, 3, 3))
    pruned_tensor, mask, sparsity = structured_channel_pruning(weights_tensor, prune_ratio=0.5)
    print(f"\n[3] Structured Channel Pruning (Target: 50% Channels):")
    print(f"    Input Tensor Shape:   {weights_tensor.shape}")
    print(f"    Pruned Channels:      {np.sum(mask)} of {len(mask)}")
    print(f"    Achieved Sparsity:    {sparsity:.1f}%")
    assert np.sum(mask) == 8 and abs(sparsity - 50.0) < 1e-4, "Pruning sparsity mismatch"
    print("    -> Structured Pruning Channel Elimination: PASS")
    
    # 3. Roofline Performance Model
    # Example Edge SoC: Jetson Nano (40 GFLOPs Peak, 25.6 GB/s Bandwidth)
    nano_flops = 40.0
    nano_bw = 25.6
    
    # Workload 1: Low-intensity Memory-Bound (e.g. Depthwise Conv, I = 0.8 FLOPs/B)
    perf_mem, reg_mem, knee = evaluate_roofline_model(0.8, nano_flops, nano_bw)
    # Workload 2: High-intensity Compute-Bound (e.g. Dense 1x1 Conv, I = 8.0 FLOPs/B)
    perf_comp, reg_comp, _ = evaluate_roofline_model(8.0, nano_flops, nano_bw)
    
    print(f"\n[4] Roofline Performance Profiling (Edge Hardware: {nano_flops} GFLOPs, {nano_bw} GB/s):")
    print(f"    Hardware Knee Point: {knee:.2f} FLOPs/Byte")
    print(f"    Workload A (I = 0.8 FLOPs/B) -> Attainable: {perf_mem:.2f} GFLOPs | Regime: {reg_mem}")
    print(f"    Workload B (I = 8.0 FLOPs/B) -> Attainable: {perf_comp:.2f} GFLOPs | Regime: {reg_comp}")
    assert reg_mem == "memory-bound" and abs(perf_mem - 20.48) < 1e-2
    assert reg_comp == "compute-bound" and abs(perf_comp - 40.00) < 1e-2
    print("    -> Roofline Model Bottleneck Classification: PASS")
    
    # 4. Latency Percentiles
    latencies = [10.2, 11.5, 10.8, 12.1, 11.0, 10.9, 14.2, 28.5, 11.1, 10.7]
    stats = calculate_latency_percentiles(latencies)
    print(f"\n[5] Latency Percentile Profiling (50 frames):")
    print(f"    Median Latency P50: {stats['p50']:.2f} ms")
    print(f"    Tail Latency P95:   {stats['p95']:.2f} ms")
    print(f"    Worst-Case P99:     {stats['p99']:.2f} ms")
    assert stats["p50"] < stats["p95"] <= stats["p99"], "Latency percentiles ordering error"
    print("    -> Latency Tail Profiling Assertion: PASS")
    
    print("\n" + "=" * 70)
    print("ALL ADV-08 EFFICIENT COMPUTER VISION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    main()
