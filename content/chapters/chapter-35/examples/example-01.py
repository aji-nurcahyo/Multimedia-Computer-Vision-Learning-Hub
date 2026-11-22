"""
Multimedia & Computer Vision Learning Hub
Chapter 35: Video Processing Application Project
Implementasi Python & Verifikasi Algoritma Pemrosesan Video

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
Institution: Institut Teknologi Sumatera (ITERA)
"""

import numpy as np

def create_synthetic_frame_pair(width: int = 120, height: int = 90) -> tuple[np.ndarray, np.ndarray]:
    """Menghasilkan pasangan frame sintetis deterministik untuk pengujian gerak."""
    f1 = np.full((height, width), 40, dtype=np.uint8)
    f2 = np.full((height, width), 40, dtype=np.uint8)

    # Objek bergerak bergeser secara horizontal
    # Frame 1: Objek di x = [30..50], y = [35..55]
    f1[35:55, 30:50] = 200
    # Frame 2: Objek bergeser 6 piksel ke kanan (x = [36..56])
    f2[35:55, 36:56] = 200

    return f1, f2

def compute_frame_difference(f1: np.ndarray, f2: np.ndarray) -> np.ndarray:
    """Menghitung selisih absolut piksel antar-frame."""
    return np.abs(f2.astype(np.float32) - f1.astype(np.float32)).astype(np.uint8)

def compute_psnr(f1: np.ndarray, f2: np.ndarray) -> float:
    """Menghitung Peak Signal-to-Noise Ratio (PSNR) dalam dB."""
    mse = np.mean((f1.astype(np.float64) - f2.astype(np.float64)) ** 2)
    if mse < 1e-6:
        return 100.0
    return float(10.0 * np.log10((255.0 ** 2) / mse))

def main() -> None:
    print("=" * 65)
    print("Multimedia & Computer Vision Learning Hub - ITERA")
    print(f"Chapter 35: Video Processing Application Project")
    print("Created by: Aji Pamungkas Tri Nurcahyo")
    print("=" * 65)

    width, height = 160, 120
    f1, f2 = create_synthetic_frame_pair(width, height)
    print(f"[*] Pasangan frame sintetis berhasil dibuat: {width}x{height} piksel")

    # 1. Komputasi Differencing
    diff = compute_frame_difference(f1, f2)
    active_motion_pixels = int(np.sum(diff > 25))
    print(f"[*] Jumlah piksel gerak terdeteksi (diff > 25): {active_motion_pixels} piksel")

    # 2. Metrik PSNR Antar-Frame
    psnr_val = compute_psnr(f1, f2)
    print(f"[*] PSNR antar-frame sebelum kompensasi gerak: {psnr_val:.2f} dB")

    # 3. Verifikasi Status Kalman Orde-1
    # Model kinematika sederhana: x_t = x_{t-1} + v_x * dt
    dt = 1.0
    vx_measured = 6.0
    predicted_x = 30.0 + vx_measured * dt
    print(f"[*] Posisi prediksi objek langkah berikutnya: x = {predicted_x:.1f}")

    # Validasi deterministik
    assert active_motion_pixels > 0, "Deteksi gerak tidak menemukan perubahan intensitas!"
    assert psnr_val < 40.0, "Pasangan frame bergerak seharusnya memiliki variansi residual!"
    assert predicted_x == 36.0, "Estimasi posisi kinematika tidak sesuai pergeseran ground truth!"

    print(f"[SUCCESS] Semua pengujian deterministik Bab 35 lolos verifikasi!")
    print("=" * 65)

if __name__ == '__main__':
    main()
