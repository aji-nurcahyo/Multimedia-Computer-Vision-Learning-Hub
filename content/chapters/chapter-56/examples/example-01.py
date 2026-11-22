#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 56: Real-Time Multimedia Processing
Standalone Academic Verification Script: Real-Time Pipeline Latency, Queue Buffering & Jitter Profiling

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def calculate_pipeline_latency(t_cap: float, t_proc: float, t_queue: float, t_render: float) -> float:
    """
    Computes end-to-end pipeline latency:
    T_total = T_capture + T_queue + T_processing + T_render
    """
    return float(t_cap + t_proc + t_queue + t_render)

def calculate_queue_delay(queue_occupancy: float, processing_rate_fps: float) -> float:
    """
    Computes average queuing delay given queue occupancy Q and service rate mu:
    T_queue = (Q / mu) * 1000  (ms)
    """
    if processing_rate_fps <= 0:
        return float('inf')
    return float((queue_occupancy / processing_rate_fps) * 1000.0)

def calculate_drop_rate(arrival_rate_fps: float, service_rate_fps: float) -> float:
    """
    Calculates theoretical frame drop rate when arrival rate exceeds service rate:
    Drop Rate = max(0, (lambda - mu) / lambda)
    """
    if arrival_rate_fps <= 0:
        return 0.0
    if arrival_rate_fps <= service_rate_fps:
        return 0.0
    return float((arrival_rate_fps - service_rate_fps) / arrival_rate_fps)

def compute_jitter_statistics(arrival_intervals_ms: np.ndarray) -> tuple:
    """
    Calculates mean inter-frame interval, jitter standard deviation, and maximum jitter deviation.
    """
    intervals = np.asarray(arrival_intervals_ms, dtype=np.float64)
    n = len(intervals)
    if n < 2:
        return float(np.mean(intervals)), 0.0, 0.0
    mean_val = float(np.mean(intervals))
    jitter_std = float(np.std(intervals, ddof=1))
    max_dev = float(np.max(np.abs(intervals - mean_val)))
    return mean_val, jitter_std, max_dev

def simulate_frame_buffer_pipeline(arrival_fps: float, proc_time_ms: float, total_frames: int = 120, max_queue: int = 2) -> dict:
    """
    Simulates a discrete-event producer-consumer queue with drop-oldest policy.
    """
    arrival_interval_ms = 1000.0 / arrival_fps
    queue = [] # holds arrival timestamps
    server_busy_until = 0.0
    processed_count = 0
    dropped_count = 0
    latencies = []
    
    # Process arrivals
    for i in range(total_frames):
        t_arr = i * arrival_interval_ms
        
        # While queue has items and server became free before this arrival, serve queued items
        while queue and server_busy_until <= t_arr:
            item_t = queue.pop(0)
            start_serve = max(server_busy_until, item_t)
            finish_serve = start_serve + proc_time_ms
            server_busy_until = finish_serve
            latencies.append(finish_serve - item_t)
            processed_count += 1
            
        # If server is free right now and queue is empty, process immediately
        if server_busy_until <= t_arr and not queue:
            server_busy_until = t_arr + proc_time_ms
            latencies.append(proc_time_ms)
            processed_count += 1
        else:
            # Server is busy, place into queue or drop if full
            if len(queue) >= max_queue:
                dropped_count += 1
                queue.pop(0) # drop oldest
            queue.append(t_arr)
            
    # Drain remaining queue at end of simulation
    while queue:
        item_t = queue.pop(0)
        start_serve = max(server_busy_until, item_t)
        finish_serve = start_serve + proc_time_ms
        server_busy_until = finish_serve
        latencies.append(finish_serve - item_t)
        processed_count += 1
        
    return {
        "arrival_fps": arrival_fps,
        "service_fps": 1000.0 / proc_time_ms,
        "total_frames": total_frames,
        "processed_count": processed_count,
        "dropped_count": dropped_count,
        "empirical_drop_rate": dropped_count / total_frames if total_frames > 0 else 0.0,
        "mean_latency_ms": float(np.mean(latencies)) if latencies else 0.0
    }

def main():
    print("=" * 70)
    print("Chapter 56 Verification: Real-Time Multimedia Processing Pipeline")
    print("=" * 70)
    
    # Step 1: Scenario A (Balanced System at 30 FPS)
    print("\n[Step 1] Skenario A: Sistem Seimbang (λ = 30 FPS, μ = 55.56 FPS):")
    t_cap_a = 3.5
    t_proc_a = 18.0
    mu_a = 1000.0 / t_proc_a
    q_occ_a = 0.5
    t_queue_a = calculate_queue_delay(q_occ_a, mu_a)
    t_render_a = 2.0
    t_total_a = calculate_pipeline_latency(t_cap_a, t_proc_a, t_queue_a, t_render_a)
    drop_rate_a = calculate_drop_rate(30.0, mu_a)
    
    print(f"  - T_capture: {t_cap_a:.2f} ms")
    print(f"  - T_proc: {t_proc_a:.2f} ms (Service Rate μ = {mu_a:.2f} FPS)")
    print(f"  - T_queue (Q={q_occ_a}): {t_queue_a:.2f} ms")
    print(f"  - T_render: {t_render_a:.2f} ms")
    print(f"  - Total Pipeline Latency: {t_total_a:.2f} ms")
    print(f"  - Drop Rate: {drop_rate_a * 100:.2f}%")
    
    assert abs(t_queue_a - 9.0) < 1e-4, f"Queue delay mismatch: expected 9.0, got {t_queue_a}"
    assert abs(t_total_a - 32.5) < 1e-4, f"Total latency mismatch: expected 32.5, got {t_total_a}"
    assert t_total_a < 33.33, "Failed 30 FPS deadline!"
    assert drop_rate_a == 0.0, "Balanced system should have 0% drops!"
    print("  ✓ Skenario A berhasil divalidasi!")

    # Step 2: Scenario B (Overload System with Dropping)
    print("\n[Step 2] Skenario B: Sistem Overload (λ = 30 FPS, μ = 20.0 FPS):")
    t_cap_b = 3.5
    t_proc_b = 50.0
    mu_b = 1000.0 / t_proc_b # 20.0 FPS
    max_q_b = 2
    t_queue_b = calculate_queue_delay(max_q_b, mu_b)
    t_render_b = 2.0
    t_total_b = calculate_pipeline_latency(t_cap_b, t_proc_b, t_queue_b, t_render_b)
    drop_rate_b = calculate_drop_rate(30.0, mu_b)
    
    print(f"  - T_proc: {t_proc_b:.2f} ms (Service Rate μ = {mu_b:.2f} FPS)")
    print(f"  - T_queue (Max Q={max_q_b}): {t_queue_b:.2f} ms")
    print(f"  - Total Latency: {t_total_b:.2f} ms")
    print(f"  - Theoretical Drop Rate: {drop_rate_b * 100:.2f}%")
    
    assert abs(t_queue_b - 100.0) < 1e-4, f"Expected 100.0ms queue delay, got {t_queue_b}"
    assert abs(t_total_b - 155.5) < 1e-4, f"Expected 155.5ms total latency, got {t_total_b}"
    assert abs(drop_rate_b - (1.0 / 3.0)) < 1e-4, f"Expected 33.33% drop rate, got {drop_rate_b}"
    print("  ✓ Skenario B berhasil divalidasi!")

    # Step 3: Jitter Analysis
    print("\n[Step 3] Analisis Jitter Inter-Frame Arrival:")
    intervals = np.array([33.3, 34.0, 32.5, 33.8, 33.0], dtype=np.float64)
    mean_int, jitter_std, max_dev = compute_jitter_statistics(intervals)
    print(f"  - Interval Sampel (ms): {intervals.tolist()}")
    print(f"  - Rata-rata Interval: {mean_int:.2f} ms")
    print(f"  - Jitter (Std Dev): {jitter_std:.3f} ms")
    print(f"  - Deviasi Maksimum: {max_dev:.2f} ms")
    assert mean_int > 33.0 and mean_int < 34.0, "Mean interval outside reasonable bounds"
    assert jitter_std >= 0.0, "Jitter standard deviation must be non-negative"
    print("  ✓ Verifikasi statistik jitter berhasil!")

    # Step 4: Empirical Simulation Run
    print("\n[Step 4] Simulasi Empiris Buffer Antrean 120 Frame:")
    sim = simulate_frame_buffer_pipeline(arrival_fps=30.0, proc_time_ms=50.0, total_frames=120, max_queue=2)
    print(f"  - Total Frame Dikirim: {sim['total_frames']}")
    print(f"  - Frame Diproses: {sim['processed_count']}")
    print(f"  - Frame Dibuang: {sim['dropped_count']}")
    print(f"  - Empirical Drop Rate: {sim['empirical_drop_rate'] * 100:.2f}%")
    assert sim['dropped_count'] > 0, "Overloaded simulation must drop frames"
    assert abs(sim['empirical_drop_rate'] - 0.33) < 0.05, "Empirical drop rate must approach theoretical ~33%"
    print("  ✓ Simulasi buffer drop-oldest berhasil!")

    print("\n" + "=" * 70)
    print("STATUS VERIFIKASI BAB 56: 100% SUKSES (ALL ASSERTIONS PASSED)")
    print("=" * 70)
    return 0

if __name__ == '__main__':
    sys.exit(main())
