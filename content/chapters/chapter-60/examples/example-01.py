#!/usr/bin/env python3
"""
Multimedia & Computer Vision Learning Hub - Chapter 60: Integrated Multimedia & Computer Vision Capstone
Standalone Academic Verification Script: Intelligent Visual Monitoring System with Multimodal Sensing & Evaluation Rubric

Author: Aji Pamungkas Tri Nurcahyo
Institution: Institut Teknologi Sumatera (ITERA)
"""

import sys
import numpy as np

def fuse_multimodal_event_scores(v_score: float, a_score: float, c_score: float, weights: tuple = (0.60, 0.25, 0.15)) -> dict:
    """
    Computes Bayesian weighted consensus score:
    F = w_v * S_v + w_a * S_a + w_c * S_c
    """
    wv, wa, wc = weights
    tot_w = wv + wa + wc if (wv + wa + wc) > 0 else 1.0
    wv_norm = wv / tot_w
    wa_norm = wa / tot_w
    wc_norm = wc / tot_w
    
    contrib_v = v_score * wv_norm
    contrib_a = a_score * wa_norm
    contrib_c = c_score * wc_norm
    
    fused_score = contrib_v + contrib_a + contrib_c
    is_triggered = fused_score >= 0.50
    
    contribs = [
        ("visual", contrib_v),
        ("audio", contrib_a),
        ("context", contrib_c)
    ]
    contribs.sort(key=lambda x: x[1], reverse=True)
    
    return {
        "fused_score": float(fused_score),
        "is_triggered": bool(is_triggered),
        "dominant_modality": contribs[0][0],
        "contributions": {
            "visual": float(contrib_v),
            "audio": float(contrib_a),
            "context": float(contrib_c)
        }
    }

def evaluate_capstone_rubric(scores: dict) -> dict:
    """
    Computes Capstone Project Grade out of 100 points:
    Architecture (max 25) + Implementation (max 35) + Evaluation (max 25) + Documentation (max 15)
    """
    arch = min(25.0, max(0.0, float(scores.get("architecture", 0.0))))
    impl = min(35.0, max(0.0, float(scores.get("implementation", 0.0))))
    eval_p = min(25.0, max(0.0, float(scores.get("evaluation", 0.0))))
    doc = min(15.0, max(0.0, float(scores.get("documentation", 0.0))))
    
    total = arch + impl + eval_p + doc
    
    if total >= 80.0:
        grade = "A"
    elif total >= 75.0:
        grade = "AB"
    elif total >= 65.0:
        grade = "B"
    elif total >= 60.0:
        grade = "BC"
    elif total >= 50.0:
        grade = "C"
    elif total >= 40.0:
        grade = "D"
    else:
        grade = "E"
        
    return {
        "architecture_score": arch,
        "implementation_score": impl,
        "evaluation_score": eval_p,
        "documentation_score": doc,
        "total_score": float(total),
        "letter_grade": grade,
        "is_passing": total >= 50.0
    }

def simulate_temporal_capstone_pipeline(n_frames: int = 40, incident_window: tuple = (15, 25), hysteresis_k: int = 3) -> dict:
    """
    Simulates real-time multi-frame stream with temporal hysteresis.
    """
    history = []
    verified_alerts = 0
    suppressed_count = 0
    hysteresis_queue = []
    
    for t in range(n_frames):
        in_incident = incident_window[0] <= t <= incident_window[1]
        
        # Synthetic sensory signals with realistic noise
        if in_incident:
            sv = 0.85
            sa = 0.60
            sc = 0.90
        else:
            sv = 0.15
            sa = 0.10
            sc = 0.30
            
        res = fuse_multimodal_event_scores(sv, sa, sc)
        hysteresis_queue.append(res['is_triggered'])
        if len(hysteresis_queue) > hysteresis_k:
            hysteresis_queue.pop(0)
            
        is_verified = (len(hysteresis_queue) == hysteresis_k and all(hysteresis_queue))
        if is_verified:
            verified_alerts += 1
        elif res['is_triggered'] and not is_verified:
            suppressed_count += 1
            
        history.append({
            "frame": t,
            "fused_score": res['fused_score'],
            "is_verified": is_verified
        })
        
    return {
        "total_frames": n_frames,
        "verified_alerts": verified_alerts,
        "suppressed_flickers": suppressed_count,
        "history": history
    }

def main():
    print("=" * 70)
    print("Chapter 60 Verification: Integrated Capstone Project Reference")
    print("=" * 70)
    
    # Step 1: Validate Section 4 Scenario (Night incident at restricted zone)
    print("\n[Step 1] Skenario Verifikasi Insiden Malam Hari (Seksi 4):")
    sv, sa, sc = 0.85, 0.60, 0.90
    res = fuse_multimodal_event_scores(sv, sa, sc)
    
    print(f"  - Skor Masukan: Visual={sv:.2f}, Audio={sa:.2f}, Konteks={sc:.2f}")
    print(f"  - Skor Fusi Bayesian: {res['fused_score']:.4f} (Expected: 0.7950)")
    print(f"  - Status Alarm: {res['is_triggered']} (Ambang >= 0.50)")
    print(f"  - Modalitas Dominan: '{res['dominant_modality']}'")
    print(f"  - Kontribusi Parsial: {res['contributions']}")
    
    assert abs(res['fused_score'] - 0.7950) < 1e-4, f"Fused score mismatch: {res['fused_score']}"
    assert res['is_triggered'] is True, "Incident must be verified"
    assert res['dominant_modality'] == "visual", "Visual must be the dominant modality"
    assert abs(res['contributions']['visual'] - 0.510) < 1e-4
    assert abs(res['contributions']['audio'] - 0.150) < 1e-4
    assert abs(res['contributions']['context'] - 0.135) < 1e-4
    print("  ✓ Skenario verifikasi insiden berhasil divalidasi!")

    # Step 2: Validate Sensor Dropout / Fog Scenario
    print("\n[Step 2] Skenario Sensor Dropout (Kamera Tertutup Kabut):")
    sv_fog = 0.10
    res_fog = fuse_multimodal_event_scores(sv_fog, sa, sc)
    
    print(f"  - Skor Masukan: Visual (Fog)={sv_fog:.2f}, Audio={sa:.2f}, Konteks={sc:.2f}")
    print(f"  - Skor Fusi: {res_fog['fused_score']:.4f} (Expected: 0.3450)")
    print(f"  - Status Alarm: {res_fog['is_triggered']} (False Alarm Redam: {not res_fog['is_triggered']})")
    
    assert abs(res_fog['fused_score'] - 0.3450) < 1e-4, "Fog score mismatch"
    assert res_fog['is_triggered'] is False, "Fog scenario must suppress false alarm!"
    print("  ✓ Skenario peredaman alarm palsu berhasil divalidasi!")

    # Step 3: Stream Pipeline Simulation with Temporal Hysteresis
    print("\n[Step 3] Simulasi Aliran Multi-Frame Stream & Histeresis (3 Frame):")
    sim = simulate_temporal_capstone_pipeline(n_frames=40, incident_window=(15, 25), hysteresis_k=3)
    print(f"  - Total Frame Disimulasikan: {sim['total_frames']}")
    print(f"  - Total Alert Terverifikasi Stabil: {sim['verified_alerts']}")
    print(f"  - Kedipan Singkat yang Diredam: {sim['suppressed_flickers']}")
    
    assert sim['verified_alerts'] > 5, "Incident window must trigger verified alerts"
    assert sim['suppressed_flickers'] == 2, "Hysteresis of 3 frames must suppress initial 2 frames before lock"
    print("  ✓ Simulasi aliran real-time histeresis berhasil divalidasi!")

    # Step 4: Academic Grading Rubric Evaluation
    print("\n[Step 4] Evaluasi Rubrik Penilaian Akademik Capstone ITERA:")
    rubric_input = {
        "architecture": 24.0,     # max 25
        "implementation": 33.0,   # max 35
        "evaluation": 23.0,       # max 25
        "documentation": 14.0     # max 15
    }
    rubric = evaluate_capstone_rubric(rubric_input)
    print(f"  - Nilai Arsitektur: {rubric['architecture_score']} / 25")
    print(f"  - Nilai Implementasi: {rubric['implementation_score']} / 35")
    print(f"  - Nilai Evaluasi: {rubric['evaluation_score']} / 25")
    print(f"  - Nilai Dokumentasi: {rubric['documentation_score']} / 15")
    print(f"  - Nilai Akhir Total: {rubric['total_score']:.1f} / 100")
    print(f"  - Nilai Huruf: {rubric['letter_grade']}")
    print(f"  - Status Kelulusan: {'LULUS ISTIMEWA' if rubric['letter_grade'] == 'A' else 'LULUS'}")
    
    assert rubric['total_score'] == 94.0, "Total rubric score must be 94.0"
    assert rubric['letter_grade'] == "A", "Score 94.0 must earn letter grade A"
    assert rubric['is_passing'] is True, "Must be marked as passing"
    print("  ✓ Rubrik penilaian akademik capstone berhasil divalidasi!")

    print("\n" + "=" * 70)
    print("STATUS VERIFIKASI BAB 60: 100% SUKSES (ALL ASSERTIONS PASSED)")
    print("=" * 70)
    return 0

if __name__ == '__main__':
    sys.exit(main())

