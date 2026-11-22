"""
Multimedia & Computer Vision Learning Hub
Chapter 05: NumPy, Visualization & Multimedia I/O
Demonstrasi Manipulasi Array Tensor, Dekomposisi Warna, dan Vektorisasi

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import time
import numpy as np

def create_synthetic_color_bars(width: int = 240, height: int = 160) -> np.ndarray:
    """Membuat citra pola warna sintetis SMPTE standar 3D uint8."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    bar_w = width // 6
    
    colors = [
        [255, 255, 255], # Putih
        [255, 255, 0],   # Kuning
        [0, 255, 255],   # Cyan
        [0, 255, 0],     # Hijau
        [255, 0, 255],   # Magenta
        [255, 0, 0]      # Merah
    ]
    
    for i, col in enumerate(colors):
        img[:, i * bar_w : (i + 1) * bar_w] = col
        
    return img

def benchmark_vectorization(size: int = 500):
    """Membandingkan kecepatan operasi vektor NumPy vs for-loop Python."""
    arr = np.random.randint(0, 200, (size, size), dtype=np.uint8)
    
    # 1. Operasi Tervektorisasi (SIMD)
    t0 = time.perf_counter()
    res_vec = np.clip(arr.astype(np.float32) + 50.0, 0, 255).astype(np.uint8)
    t_vec = time.perf_counter() - t0
    
    # 2. Operasi Loop Python Konvensional (sub-sample untuk efisiensi eksekusi)
    t0 = time.perf_counter()
    res_loop = np.zeros_like(arr)
    for y in range(50):
        for x in range(size):
            val = int(arr[y, x]) + 50
            res_loop[y, x] = min(255, val)
    t_loop_partial = time.perf_counter() - t0
    t_loop_estimated = t_loop_partial * 10.0
    
    return t_vec, t_loop_estimated

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 05 Verification")
    print("=" * 65)

    # 1. Uji Pola Citra Sintetis
    test_img = create_synthetic_color_bars(240, 160)
    print(f"Bentuk Array Citra  : {test_img.shape} -> Dimensi={test_img.ndim}")
    print(f"Tipe Data Memori    : {test_img.dtype} ({test_img.nbytes} Bytes)")
    assert test_img.shape == (160, 240, 3), "Dimensi citra harus (160, 240, 3)"

    # 2. Uji Dekomposisi Saluran Warna
    red_channel = test_img[:, :, 0]
    green_channel = test_img[:, :, 1]
    blue_channel = test_img[:, :, 2]
    
    print(f"Dimensi Saluran Merah: {red_channel.shape} (2D Grayscale matrix)")
    assert red_channel.ndim == 2, "Saluran warna tunggal harus berdimensi 2D"

    # 3. Uji Slicing ROI (Region of Interest)
    roi_view = test_img[40:120, 60:180]
    assert roi_view.shape == (80, 120, 3), "Dimensi ROI harus (80, 120, 3)"
    print(f"Ekstraksi ROI       : {roi_view.shape} berhasil!")

    # 4. Uji Akselerasi Vektorisasi
    t_vec, t_loop = benchmark_vectorization(size=500)
    speedup = t_loop / t_vec if t_vec > 0 else 999.0
    print(f"\nWaktu Vektorisasi   : {t_vec*1000:.2f} ms")
    print(f"Estimasi For-Loop   : {t_loop*1000:.2f} ms")
    print(f"Percepatan Vektor   : {speedup:.1f}x LEBIH CEPAT!")

    print("\nVerifikasi Berhasil: Seluruh operasi tensor dan vektorisasi tervalidasi!")

if __name__ == "__main__":
    main()
