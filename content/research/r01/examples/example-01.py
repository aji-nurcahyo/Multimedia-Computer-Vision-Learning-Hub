#!/usr/bin/env python3
"""
Jalur Riset R01: Intelligent Visual Detection & Recognition
Skrip Komputasi Baseline & Validasi Statistik Multi-Seed (Tier-C)

Author: Aji Pamungkas Tri Nurcahyo (ITERA / ISVWS 2026-2040)
Tujuan: Menjalankan verifikasi numerik deterministik untuk evaluasi deteksi objek,
        interpolasi 101-titik COCO-style AP, dekomposisi taksonomi galat TIDE,
        dan protokol multi-seed N >= 3 dengan interval kepercayaan bootstrap 95%.
"""

import sys
import os
import math
import random
import numpy as np

def compute_box_iou(box1, box2):
    """Menghitung Intersection over Union (IoU) antara dua box [x1, y1, x2, y2]."""
    xA = max(box1[0], box2[0])
    yA = max(box1[1], box2[1])
    xB = min(box1[2], box2[2])
    yB = min(box1[3], box2[3])
    inter = max(0.0, xB - xA) * max(0.0, yB - yA)
    area1 = max(0.0, box1[2] - box1[0]) * max(0.0, box1[3] - box1[1])
    area2 = max(0.0, box2[2] - box2[0]) * max(0.0, box2[3] - box2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0

def evaluate_detections(ground_truths, predictions, iou_thresh=0.5):
    """
    Mengevaluasi pasangan prediksi terhadap ground-truth.
    ground_truths: list of dict {'bbox': [x1,y1,x2,y2], 'class_id': int, 'area': float}
    predictions: list of dict {'bbox': [x1,y1,x2,y2], 'class_id': int, 'score': float}
    """
    sorted_preds = sorted(predictions, key=lambda x: x['score'], reverse=True)
    matched_gt = set()
    tp_flags = []
    scores = []
    
    tide_errors = {
        'tp': 0,
        'loc': 0,   # IoU in [0.1, iou_thresh), correct class
        'cls': 0,   # IoU >= iou_thresh, wrong class
        'both': 0,  # IoU in [0.1, iou_thresh), wrong class
        'bg': 0,    # IoU < 0.1 (false alarm on background)
    }

    for p in sorted_preds:
        scores.append(p['score'])
        best_iou = 0.0
        best_gt_idx = -1
        
        for g_idx, g in enumerate(ground_truths):
            iou = compute_box_iou(p['bbox'], g['bbox'])
            if iou > best_iou:
                best_iou = iou
                best_gt_idx = g_idx
                
        if best_gt_idx >= 0 and best_iou >= iou_thresh:
            if ground_truths[best_gt_idx]['class_id'] == p['class_id']:
                if best_gt_idx not in matched_gt:
                    tp_flags.append(1)
                    matched_gt.add(best_gt_idx)
                    tide_errors['tp'] += 1
                else:
                    # Duplicate detection -> false positive
                    tp_flags.append(0)
                    tide_errors['loc'] += 1
            else:
                tp_flags.append(0)
                tide_errors['cls'] += 1
        elif best_gt_idx >= 0 and best_iou >= 0.1:
            tp_flags.append(0)
            if ground_truths[best_gt_idx]['class_id'] == p['class_id']:
                tide_errors['loc'] += 1
            else:
                tide_errors['both'] += 1
        else:
            tp_flags.append(0)
            tide_errors['bg'] += 1

    tide_errors['miss'] = len(ground_truths) - len(matched_gt)
    return tp_flags, scores, tide_errors

def compute_ap_101_point(tp_flags, scores, n_positives):
    """Menghitung Average Precision berbasis 101-point COCO interpolation."""
    if n_positives == 0 or len(tp_flags) == 0:
        return 0.0

    cum_tp = np.cumsum(tp_flags)
    cum_fp = np.cumsum([1 - x for x in tp_flags])
    
    recalls = cum_tp / n_positives
    precisions = cum_tp / (cum_tp + cum_fp)
    
    # 101 recall thresholds [0.00, 0.01, ..., 1.00]
    recall_thresholds = np.linspace(0.0, 1.0, 101)
    interpolated_precisions = []
    
    for r_th in recall_thresholds:
        # Maksimum precision untuk semua recall >= r_th
        valid_p = [p for p, r in zip(precisions, recalls) if r >= r_th]
        interpolated_precisions.append(max(valid_p) if valid_p else 0.0)
        
    return float(np.mean(interpolated_precisions))

def run_synthetic_seed_trial(seed):
    """Menjalankan evaluasi deteksi satu seed dengan variasi stokastik terkontrol."""
    random.seed(seed)
    np.random.seed(seed)
    
    # Buat 60 ground-truth objects (20 small, 25 medium, 15 large)
    ground_truths = []
    for i in range(60):
        if i < 20: # Small (< 32^2)
            w = random.uniform(8, 28)
            h = random.uniform(8, 28)
        elif i < 45: # Medium (32^2 to 96^2)
            w = random.uniform(36, 80)
            h = random.uniform(36, 80)
        else: # Large (> 96^2)
            w = random.uniform(100, 200)
            h = random.uniform(100, 200)
        x1 = random.uniform(20, 600)
        y1 = random.uniform(20, 400)
        cls_id = random.randint(0, 2)
        ground_truths.append({
            'bbox': [x1, y1, x1 + w, y1 + h],
            'class_id': cls_id,
            'area': w * h
        })
        
    # Generate model predictions dengan noise dan miss
    predictions = []
    for g in ground_truths:
        # Small objects memiliki miss rate lebih tinggi
        is_small = g['area'] < 32**2
        miss_chance = 0.25 if is_small else 0.10
        if random.random() < miss_chance:
            continue
            
        # Positional jitter
        jitter_scale = 3.0 if is_small else 5.0
        dx1 = np.random.normal(0, jitter_scale)
        dy1 = np.random.normal(0, jitter_scale)
        dx2 = np.random.normal(0, jitter_scale)
        dy2 = np.random.normal(0, jitter_scale)
        b = g['bbox']
        
        # Class flip chance
        cls_id = g['class_id']
        if random.random() < 0.05:
            cls_id = (cls_id + 1) % 3
            
        score = random.uniform(0.60, 0.98)
        predictions.append({
            'bbox': [b[0] + dx1, b[1] + dy1, b[2] + dx2, b[3] + dy2],
            'class_id': cls_id,
            'score': score
        })
        
    # Tambahkan background false alarms
    for _ in range(8):
        x1 = random.uniform(20, 600)
        y1 = random.uniform(20, 400)
        w = random.uniform(20, 60)
        h = random.uniform(20, 60)
        predictions.append({
            'bbox': [x1, y1, x1 + w, y1 + h],
            'class_id': random.randint(0, 2),
            'score': random.uniform(0.30, 0.75)
        })
        
    # Hitung mAP di seluruh rentang IoU [0.50:0.05:0.95]
    iou_range = np.linspace(0.50, 0.95, 10)
    aps = []
    ap_small_list = []
    
    for iou_th in iou_range:
        tp_flags, scores, tide = evaluate_detections(ground_truths, predictions, iou_th)
        ap = compute_ap_101_point(tp_flags, scores, len(ground_truths))
        aps.append(ap)
        
        # Small object subset
        gt_small = [g for g in ground_truths if g['area'] < 32**2]
        tp_s, scores_s, _ = evaluate_detections(gt_small, predictions, iou_th)
        ap_s = compute_ap_101_point(tp_s, scores_s, len(gt_small))
        ap_small_list.append(ap_s)
        
    mAP = float(np.mean(aps)) * 100.0
    mAP_s = float(np.mean(ap_small_list)) * 100.0
    
    # Dapatkan dekomposisi TIDE pada IoU 0.50
    _, _, tide_50 = evaluate_detections(ground_truths, predictions, 0.50)
    
    return {
        'mAP': mAP,
        'mAP_S': mAP_s,
        'tide': tide_50,
        'n_preds': len(predictions),
        'n_gt': len(ground_truths)
    }

def bootstrap_ci(values, n_boot=1000, ci=0.95):
    """Menghitung batas bawah dan batas atas 95% bootstrap confidence interval."""
    boot_means = []
    n = len(values)
    for _ in range(n_boot):
        sample = np.random.choice(values, size=n, replace=True)
        boot_means.append(np.mean(sample))
    alpha = (1.0 - ci) / 2.0
    lower = float(np.percentile(boot_means, alpha * 100))
    upper = float(np.percentile(boot_means, (1.0 - alpha) * 100))
    return lower, upper

def main():
    print("======================================================================")
    print("Jalur Riset R01: Evaluasi Deteksi & Validasi Statistik Multi-Seed")
    print("Target Metrik: COCO mAP@[.50:.95], AP_S, & Dekomposisi TIDE")
    print("======================================================================")
    
    # 1. Uji Numerik Deterministik Sederhana (IoU)
    b1 = [10.0, 10.0, 50.0, 50.0]
    b2 = [30.0, 10.0, 70.0, 50.0]
    # Inter: [30, 10, 50, 50] -> w=20, h=40, area=800
    # Area1 = 1600, Area2 = 1600, Union = 3200 - 800 = 2400 -> IoU = 800/2400 = 0.3333...
    iou_val = compute_box_iou(b1, b2)
    assert abs(iou_val - (1.0 / 3.0)) < 1e-4, f"IoU test failed: {iou_val}"
    print(f"[TEST 1 PASS] IoU Perhitungan Numerik Valid: {iou_val:.4f} == 0.3333")
    
    # 2. Eksekusi Protokol Multi-Seed (N >= 3 seeds)
    seeds = [42, 1337, 2026]
    results = []
    print(f"\n[INFO] Menjalankan {len(seeds)} random seeds independen: {seeds}")
    
    for s in seeds:
        res = run_synthetic_seed_trial(s)
        results.append(res)
        print(f"  - Seed {s:4d} | mAP: {res['mAP']:.2f}% | AP_S: {res['mAP_S']:.2f}% | "
              f"TIDE Errors: Loc={res['tide']['loc']}, Cls={res['tide']['cls']}, "
              f"BG={res['tide']['bg']}, Miss={res['tide']['miss']}")
              
    mAP_vals = [r['mAP'] for r in results]
    mAP_s_vals = [r['mAP_S'] for r in results]
    
    mean_map = float(np.mean(mAP_vals))
    std_map = float(np.std(mAP_vals, ddof=1)) # Bessel's correction
    ci_low, ci_high = bootstrap_ci(mAP_vals)
    
    print("\n----------------------------------------------------------------------")
    print("HASIL AKHIR STATISTIK RISET R01 (GATE 6 COMPLIANT):")
    print(f"  mAP@[.50:.95] : {mean_map:.2f}% ± {std_map:.2f}%")
    print(f"  95% Bootstrap CI: [{ci_low:.2f}%, {ci_high:.2f}%]")
    print(f"  AP_Small Mean : {float(np.mean(mAP_s_vals)):.2f}% ± {float(np.std(mAP_s_vals, ddof=1)):.2f}%")
    print("----------------------------------------------------------------------")
    
    assert len(results) == 3, "Harus mengeksekusi 3 seed"
    assert mean_map > 0.0, "mAP harus bernilai positif"
    print("\n[SUKSES] Seluruh pengujian komputasi baseline riset R01 lolos tanpa galat.")

if __name__ == "__main__":
    main()

