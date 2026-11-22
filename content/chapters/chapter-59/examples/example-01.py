#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 59: Performance Optimization & Deployment
Standalone Academic Verification Script: Amdahl's Law, Latency Budget Decomposition & Bundle Profiling

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def calculate_amdahl_speedup(parallel_fraction: float, stage_speedup: float) -> float:
    """
    Computes overall system speedup according to Amdahl's Law:
    S_overall = 1 / ((1 - p) + p / s)
    """
    p = max(0.0, min(1.0, float(parallel_fraction)))
    s = max(1e-6, float(stage_speedup))
    return float(1.0 / ((1.0 - p) + (p / s)))

def analyze_latency_budget(stage_delays_ms: dict, target_fps: float = 60.0) -> dict:
    """
    Analyzes latency budget decomposition against target frame rate:
    T_budget = 1000 / target_fps
    T_total = sum(T_stages)
    Headroom = T_budget - T_total
    """
    target_budget_ms = 1000.0 / target_fps if target_fps > 0 else 16.67
    total_latency_ms = sum(stage_delays_ms.values())
    
    # Identify bottleneck stage
    bottleneck_stage = max(stage_delays_ms, key=stage_delays_ms.get) if stage_delays_ms else ""
    bottleneck_time = stage_delays_ms.get(bottleneck_stage, 0.0)
    bottleneck_fraction = bottleneck_time / total_latency_ms if total_latency_ms > 0 else 0.0
    
    headroom_ms = target_budget_ms - total_latency_ms
    meets_budget = total_latency_ms <= target_budget_ms
    achievable_fps = 1000.0 / total_latency_ms if total_latency_ms > 0 else 0.0
    
    return {
        "target_fps": target_fps,
        "target_budget_ms": target_budget_ms,
        "total_latency_ms": total_latency_ms,
        "headroom_ms": headroom_ms,
        "meets_budget": meets_budget,
        "achievable_fps": achievable_fps,
        "bottleneck_stage": bottleneck_stage,
        "bottleneck_time_ms": bottleneck_time,
        "bottleneck_fraction": bottleneck_fraction
    }

def estimate_bundle_network_footprint(module_sizes_kb: dict, gzip_ratio: float = 0.35) -> dict:
    """
    Estimates static bundle footprint and network load time over standard networks.
    """
    raw_total_kb = sum(module_sizes_kb.values())
    gzipped_kb = raw_total_kb * gzip_ratio
    
    # 3G network: ~750 kbps = 93.75 KB/s
    # 4G network: ~25 Mbps = 3,125 KB/s
    load_time_3g_ms = (gzipped_kb / 93.75) * 1000.0
    load_time_4g_ms = (gzipped_kb / 3125.0) * 1000.0
    
    return {
        "raw_total_kb": raw_total_kb,
        "gzipped_total_kb": gzipped_kb,
        "load_time_3g_ms": load_time_3g_ms,
        "load_time_4g_ms": load_time_4g_ms
    }

def main():
    print("=" * 70)
    print("Chapter 59 Verification: Performance Optimization & Deployment")
    print("=" * 70)
    
    # Step 1: Validate Latency Budget Decomposition from Section 3
    print("\n[Step 1] Skenario A: Dekomposisi Anggaran Latensi 60 FPS:")
    stages = {
        "capture": 2.5,
        "preprocess": 1.5,
        "inference": 8.0,
        "postprocess": 1.0
    }
    budget = analyze_latency_budget(stages, target_fps=60.0)
    
    print(f"  - Tahapan Pipeline: {stages}")
    print(f"  - Total Latensi Pipa: {budget['total_latency_ms']:.2f} ms")
    print(f"  - Target Anggaran (60 FPS): {budget['target_budget_ms']:.2f} ms")
    print(f"  - Sisa Waktu Cadangan (Headroom): {budget['headroom_ms']:+.2f} ms")
    print(f"  - Memenuhi Anggaran: {budget['meets_budget']}")
    print(f"  - Throughput Maksimum Tercapai: {budget['achievable_fps']:.2f} FPS")
    print(f"  - Titik Hambat (Bottleneck): '{budget['bottleneck_stage']}' ({budget['bottleneck_fraction']*100:.2f}%)")
    
    assert budget['total_latency_ms'] == 13.0, "Total latency must equal 13.0 ms"
    assert abs(budget['target_budget_ms'] - 16.666667) < 1e-4, "Target budget mismatch"
    assert abs(budget['headroom_ms'] - 3.666667) < 1e-4, "Headroom mismatch"
    assert budget['meets_budget'] is True, "Must meet 60 FPS budget"
    assert budget['bottleneck_stage'] == "inference", "Inference must be identified as bottleneck"
    assert abs(budget['bottleneck_fraction'] - (8.0 / 13.0)) < 1e-4, "Bottleneck fraction mismatch"
    print("  ✓ Dekomposisi anggaran latensi berhasil divalidasi!")

    # Step 2: Validate Amdahl's Law Speedup from Section 3 Skenario B
    print("\n[Step 2] Skenario B: Penerapan Hukum Amdahl (Akselerasi Inferensi 4x):")
    p = budget['bottleneck_fraction'] # 8.0 / 13.0 ~ 0.6153846
    s = 4.0 # 4x speedup on inference
    speedup = calculate_amdahl_speedup(p, s)
    
    # Direct computation
    new_stages = dict(stages)
    new_stages['inference'] = stages['inference'] / s # 2.0 ms
    new_total = sum(new_stages.values()) # 7.0 ms
    direct_speedup = budget['total_latency_ms'] / new_total
    new_fps = 1000.0 / new_total
    
    print(f"  - Proporsi Waktu Tahapan (p): {p*100:.2f}%")
    print(f"  - Faktor Percepatan Tahapan (s): {s:.1f}x")
    print(f"  - Percepatan Keseluruhan (Amdahl): {speedup:.4f}x")
    print(f"  - Percepatan Langsung (13.0 / 7.0): {direct_speedup:.4f}x")
    print(f"  - Throughput Baru: {new_fps:.2f} FPS (Durasi Baru: {new_total:.2f} ms)")
    
    assert abs(speedup - (13.0 / 7.0)) < 1e-4, f"Amdahl speedup mismatch: {speedup} vs {13.0/7.0}"
    assert abs(new_total - 7.0) < 1e-4, "New total latency must equal 7.0 ms"
    assert abs(new_fps - 142.857) < 1e-2, "New throughput mismatch"
    print("  ✓ Formulasi Hukum Amdahl berhasil divalidasi!")

    # Step 3: Static Bundle Footprint & Network Simulation
    print("\n[Step 3] Estimasi Jejak Bundel Statis Web & Waktu Pemuatan:")
    bundle_sizes = {
        "vendor": 150.0,
        "core_app": 50.0,
        "styles": 20.0
    }
    net = estimate_bundle_network_footprint(bundle_sizes, gzip_ratio=0.30)
    print(f"  - Modul Mentah: {bundle_sizes} (Total: {net['raw_total_kb']:.1f} KB)")
    print(f"  - Ukuran Terkompresi Gzip (30%): {net['gzipped_total_kb']:.1f} KB")
    print(f"  - Estimasi Load Time (Jaringan 3G ~750kbps): {net['load_time_3g_ms']:.1f} ms")
    print(f"  - Estimasi Load Time (Jaringan 4G ~25Mbps): {net['load_time_4g_ms']:.1f} ms")
    
    assert net['raw_total_kb'] == 220.0, "Raw total KB mismatch"
    assert net['gzipped_total_kb'] == 66.0, "Gzipped KB mismatch"
    assert net['load_time_3g_ms'] < 1000.0, "Load time under 3G must be under 1 second for 66KB"
    assert net['load_time_4g_ms'] < 50.0, "Load time under 4G must be under 50ms"
    print("  ✓ Evaluasi distribusi web statis berhasil divalidasi!")

    print("\n" + "=" * 70)
    print("STATUS VERIFIKASI BAB 59: 100% SUKSES (ALL ASSERTIONS PASSED)")
    print("=" * 70)
    return 0

if __name__ == '__main__':
    sys.exit(main())

