#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 57: Edge AI & Embedded Computer Vision
Standalone Academic Verification Script: Affine Post-Training Quantization (PTQ) & Model Compression

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def calculate_affine_quantization_params(r_min: float, r_max: float, num_bits: int = 8) -> tuple:
    """
    Computes uniform affine quantization parameters:
    S = (r_max - r_min) / (q_max - q_min)
    Z = round(-r_min / S) + q_min (clamped to [q_min, q_max])
    """
    q_min = 0
    q_max = (1 << num_bits) - 1
    
    if r_min == r_max:
        return 1.0, 0, q_min, q_max
        
    safe_min = min(r_min, 0.0)
    safe_max = max(r_max, 0.0)
    
    scale = (safe_max - safe_min) / float(q_max - q_min)
    raw_z = int(round(-safe_min / scale)) + q_min
    zero_point = max(q_min, min(q_max, raw_z))
    
    return float(scale), int(zero_point), int(q_min), int(q_max)

def quantize_float_to_uint8(values: np.ndarray, scale: float, zero_point: int, q_min: int = 0, q_max: int = 255) -> np.ndarray:
    """
    Quantizes floating-point values into 8-bit integers:
    q = clamp(round(r / S + Z), q_min, q_max)
    """
    vals = np.asarray(values, dtype=np.float64)
    scaled = np.round(vals / scale) + zero_point
    clamped = np.clip(scaled, q_min, q_max)
    return clamped.astype(np.uint8)

def dequantize_uint8_to_float(quantized: np.ndarray, scale: float, zero_point: int) -> np.ndarray:
    """
    Dequantizes integers back into reconstructed floating point:
    r_hat = S * (q - Z)
    """
    q = np.asarray(quantized, dtype=np.float64)
    return scale * (q - float(zero_point))

def calculate_quantization_metrics(original: np.ndarray, reconstructed: np.ndarray) -> dict:
    """
    Computes Mean Squared Error (MSE), Max Absolute Error, and Signal-to-Quantization-Noise Ratio (SQNR dB).
    """
    orig = np.asarray(original, dtype=np.float64)
    rec = np.asarray(reconstructed, dtype=np.float64)
    
    err = orig - rec
    mse = float(np.mean(err ** 2))
    max_abs = float(np.max(np.abs(err)))
    
    sig_power = float(np.mean(orig ** 2))
    noise_power = mse
    sqnr_db = float(10.0 * np.log10(sig_power / noise_power)) if noise_power > 1e-12 and sig_power > 1e-12 else 100.0
    
    return {
        "mse": mse,
        "max_abs_error": max_abs,
        "sqnr_db": sqnr_db
    }

def estimate_model_compression(param_count: int, orig_bits: int = 32, quant_bits: int = 8) -> dict:
    """
    Estimates model memory footprint reduction and compression ratio.
    """
    orig_bytes = (param_count * orig_bits) // 8
    quant_bytes = (param_count * quant_bits) // 8
    ratio = float(orig_bytes) / float(quant_bytes) if quant_bytes > 0 else 1.0
    savings = ((orig_bytes - quant_bytes) / float(orig_bytes)) * 100.0 if orig_bytes > 0 else 0.0
    
    return {
        "param_count": param_count,
        "original_size_bytes": orig_bytes,
        "quantized_size_bytes": quant_bytes,
        "compression_ratio": ratio,
        "memory_savings_percent": savings
    }

def main():
    print("=" * 70)
    print("Chapter 57 Verification: Edge AI Quantization & Model Compression")
    print("=" * 70)
    
    # Step 1: Verify Affine Quantization Parameters from Section 3
    print("\n[Step 1] Verifikasi Parameter Skala S dan Zero-Point Z:")
    r_min = -2.0
    r_max = 6.0
    scale, zero_point, q_min, q_max = calculate_affine_quantization_params(r_min, r_max, num_bits=8)
    expected_scale = 8.0 / 255.0 # ~0.03137255
    expected_zero = 64
    
    print(f"  - Rentang Riil [r_min, r_max]: [{r_min:.2f}, {r_max:.2f}]")
    print(f"  - Target Int8: [{q_min}, {q_max}]")
    print(f"  - Skala Kuantisasi S: {scale:.8f} (Expected: {expected_scale:.8f})")
    print(f"  - Titik Nol (Zero-Point) Z: {zero_point} (Expected: {expected_zero})")
    
    assert abs(scale - expected_scale) < 1e-6, f"Scale mismatch: expected {expected_scale}, got {scale}"
    assert zero_point == expected_zero, f"Zero-point mismatch: expected {expected_zero}, got {zero_point}"
    print("  ✓ Parameter kuantisasi berhasil divalidasi!")

    # Step 2: Sample Tensor Quantization
    print("\n[Step 2] Kuantisasi Vektor Sampel [-2.0, 0.0, 2.0, 6.0]:")
    test_tensor = np.array([-2.0, 0.0, 2.0, 6.0], dtype=np.float64)
    q_tensor = quantize_float_to_uint8(test_tensor, scale, zero_point)
    expected_q = np.array([0, 64, 128, 255], dtype=np.uint8)
    
    print(f"  - Nilai Riil Asli: {test_tensor.tolist()}")
    print(f"  - Nilai Terkuantisasi: {q_tensor.tolist()}")
    print(f"  - Target Eksak: {expected_q.tolist()}")
    
    np.testing.assert_array_equal(q_tensor, expected_q)
    print("  ✓ Pemetaan kuantisasi integer 8-bit terbukti eksak!")

    # Step 3: Dequantization and Error Analysis
    print("\n[Step 3] Rekonstruksi (Dekuantisasi) & Evaluasi Galat:")
    rec_tensor = dequantize_uint8_to_float(q_tensor, scale, zero_point)
    metrics = calculate_quantization_metrics(test_tensor, rec_tensor)
    
    print(f"  - Nilai Rekonstruksi: {rec_tensor.tolist()}")
    print(f"  - Galat MSE: {metrics['mse']:.8f}")
    print(f"  - Galat Absolut Maksimum: {metrics['max_abs_error']:.6f}")
    print(f"  - SQNR (dB): {metrics['sqnr_db']:.2f} dB")
    
    max_allowable_error = scale / 2.0 # ~0.015686
    assert metrics['max_abs_error'] <= max_allowable_error + 1e-5, f"Error exceeds half-LSB limit: {metrics['max_abs_error']}"
    assert metrics['sqnr_db'] > 35.0, f"SQNR too low: {metrics['sqnr_db']} dB"
    print("  ✓ Rekonstruksi dan metrik SQNR berhasil diverifikasi!")

    # Step 4: Model Compression Footprint
    print("\n[Step 4] Estimasi Penghematan Memori Model Vision (1,000,000 Parameter):")
    comp = estimate_model_compression(1_000_000, orig_bits=32, quant_bits=8)
    orig_mb = comp['original_size_bytes'] / (1024 * 1024)
    quant_mb = comp['quantized_size_bytes'] / (1024 * 1024)
    
    print(f"  - Ukuran Asli FP32: {orig_mb:.2f} MB ({comp['original_size_bytes']} Bytes)")
    print(f"  - Ukuran Terkuantisasi INT8: {quant_mb:.2f} MB ({comp['quantized_size_bytes']} Bytes)")
    print(f"  - Faktor Kompresi: {comp['compression_ratio']:.2f}x")
    print(f"  - Penghematan Memori: {comp['memory_savings_percent']:.2f}%")
    
    assert comp['compression_ratio'] == 4.0, "Expected exactly 4.0x compression ratio"
    assert comp['memory_savings_percent'] == 75.0, "Expected 75% memory reduction"
    print("  ✓ Evaluasi jejak memori Edge AI berhasil divalidasi!")

    print("\n" + "=" * 70)
    print("STATUS VERIFIKASI BAB 57: 100% SUKSES (ALL ASSERTIONS PASSED)")
    print("=" * 70)
    return 0

if __name__ == '__main__':
    sys.exit(main())

