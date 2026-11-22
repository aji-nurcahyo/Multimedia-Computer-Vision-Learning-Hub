"""
ADV-06: Robust Perception in Adverse Conditions
Reference Implementation: Koschmieder Atmospheric Scattering, Dark Channel Prior, and ECE Calibration

Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
License: Apache-2.0
"""

import sys
import numpy as np

def simulate_koschmieder_haze(clean_img: np.ndarray, beta: float = 0.8, airlight: float = 230.0):
    """
    Simulates atmospheric haze according to Koschmieder's scattering equation:
    I(x) = J(x) * t(x) + A * (1 - t(x))
    where t(x) = exp(-beta * d(x)).
    """
    h, w, c = clean_img.shape
    # Synthetic vertical perspective depth gradient (ground closer, horizon far)
    y_coords = np.linspace(0.1, 1.0, h)[:, np.newaxis]
    depth_map = np.tile(y_coords, (1, w))
    
    transmission = np.exp(-beta * 2.5 * depth_map)
    transmission_3d = transmission[:, :, np.newaxis]
    
    hazy_img = clean_img * transmission_3d + airlight * (1.0 - transmission_3d)
    return np.clip(hazy_img, 0.0, 255.0), transmission

def compute_dark_channel_prior(img: np.ndarray, patch_size: int = 7):
    """
    Computes Dark Channel Prior: J_dark(x) = min_{c} ( min_{y in Omega(x)} I_c(y) )
    """
    # 1. Minimum across color channels
    min_channel = np.min(img, axis=2)
    
    # 2. Minimum filter over local patch
    h, w = min_channel.shape
    pad = patch_size // 2
    padded = np.pad(min_channel, pad, mode='edge')
    
    dark_channel = np.zeros((h, w), dtype=np.float64)
    for y in range(h):
        for x in range(w):
            dark_channel[y, x] = np.min(padded[y:y + patch_size, x:x + patch_size])
            
    return dark_channel

def restore_dehaze(hazy_img: np.ndarray, transmission_est: np.ndarray, airlight: float = 230.0, t0: float = 0.15):
    """
    Inverts the atmospheric model to recover scene radiance J(x).
    """
    t_clamped = np.maximum(transmission_est[:, :, np.newaxis], t0)
    recovered = (hazy_img - airlight) / t_clamped + airlight
    return np.clip(recovered, 0.0, 255.0)

def compute_psnr(clean: np.ndarray, test_img: np.ndarray):
    mse = np.mean((clean - test_img) ** 2)
    if mse < 1e-12:
        return 99.0
    return 10.0 * np.log10((255.0 ** 2) / mse)

def compute_ece(confidences: np.ndarray, accuracies: np.ndarray, num_bins: int = 10):
    """
    Computes Expected Calibration Error (ECE) across M confidence bins.
    """
    bin_limits = np.linspace(0.0, 1.0, num_bins + 1)
    ece = 0.0
    n = len(confidences)
    
    for i in range(num_bins):
        low, high = bin_limits[i], bin_limits[i + 1]
        mask = (confidences >= low) & (confidences <= high if i == num_bins - 1 else confidences < high)
        bin_count = np.sum(mask)
        if bin_count > 0:
            bin_acc = np.mean(accuracies[mask])
            bin_conf = np.mean(confidences[mask])
            ece += (bin_count / n) * np.abs(bin_acc - bin_conf)
            
    return ece

def run_experiment():
    print("=" * 70)
    print("ADV-06: ROBUST PERCEPTION IN ADVERSE CONDITIONS")
    print("Verification of Koschmieder Scattering, Dark Channel Prior, and ECE")
    print("=" * 70)

    np.random.seed(42)
    h, w = 64, 64
    
    # 1. Create synthetic clean reference image (colorful landscape patches)
    clean_img = np.zeros((h, w, 3), dtype=np.float64)
    clean_img[:h//2, :, 0] = 50   # Sky blue
    clean_img[:h//2, :, 1] = 130
    clean_img[:h//2, :, 2] = 220
    clean_img[h//2:, :, 0] = 40   # Ground green
    clean_img[h//2:, :, 1] = 160
    clean_img[h//2:, :, 2] = 60
    
    print(f"\n[1] Synthetic Clean Scene ({h}x{w}x3) Created.")
    
    # 2. Simulate Koschmieder Atmospheric Scattering Haze
    hazy_img, true_trans = simulate_koschmieder_haze(clean_img, beta=0.85, airlight=230.0)
    
    psnr_hazy = compute_psnr(clean_img, hazy_img)
    print(f"\n[2] Hazy Degradation Simulation:")
    print(f"    PSNR of Hazy Image against Ground Truth: {psnr_hazy:.2f} dB")
    assert psnr_hazy < 20.0, "Hazy image PSNR should reflect significant degradation!"
    print("    -> Koschmieder Degradation Assertion: PASS")

    # 3. Dark Channel Prior Transmission Estimation & Restoration
    dark_channel = compute_dark_channel_prior(hazy_img, patch_size=5)
    # Estimate transmission: t_est = 1 - 0.95 * (dark / airlight)
    t_est = 1.0 - 0.95 * (dark_channel / 230.0)
    restored_img = restore_dehaze(hazy_img, t_est, airlight=230.0, t0=0.15)
    
    psnr_restored = compute_psnr(clean_img, restored_img)
    print(f"\n[3] Dark Channel Prior Restoration:")
    print(f"    Dark Channel Mean Intensity:             {np.mean(dark_channel):.2f}")
    print(f"    Restored Image PSNR:                     {psnr_restored:.2f} dB")
    print(f"    PSNR Improvement Delta:                  +{psnr_restored - psnr_hazy:.2f} dB")
    
    assert psnr_restored > psnr_hazy, "Restoration should improve PSNR relative to raw hazy input!"
    print("    -> Dark Channel Prior Restoration Improvement: PASS")

    # 4. Neural Confidence Calibration Evaluation (ECE)
    print("\n[4] Uncertainty Estimation: Expected Calibration Error (ECE):")
    n_samples = 200
    
    # Scenario A: Clean In-Distribution model (well calibrated)
    clean_conf = np.random.uniform(0.6, 0.98, n_samples)
    clean_acc = (np.random.rand(n_samples) < clean_conf).astype(np.float64)
    ece_clean = compute_ece(clean_conf, clean_acc, num_bins=10)
    
    # Scenario B: Overconfident Out-of-Distribution model under adverse weather
    # Model retains high confidence (~0.90) but real accuracy drops (~0.55)
    adverse_conf = np.random.uniform(0.75, 0.95, n_samples)
    adverse_acc = (np.random.rand(n_samples) < 0.55).astype(np.float64)
    ece_adverse = compute_ece(adverse_conf, adverse_acc, num_bins=10)
    
    print(f"    In-Distribution (Clean) ECE:             {ece_clean * 100:.2f}% (Terkalibrasi)")
    print(f"    Adverse Environment (OOD) ECE:           {ece_adverse * 100:.2f}% (Overconfident Miscalibration)")
    
    assert ece_adverse > ece_clean, "Adverse conditions must exhibit higher calibration error!"
    print("    -> Expected Calibration Error Verification: PASS")

    print("\n" + "=" * 70)
    print("ALL ADV-06 ROBUST PERCEPTION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_experiment()

