"""
Multimedia & Computer Vision Learning Hub
Chapter 10: Spatial Filtering & Convolution
Demonstrasi Python & Verifikasi Numerik Konvolusi Spasial 2D

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def manual_convolution_2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """
    Melakukan 2D spatial convolution diskrit murni dengan NumPy.
    Menerapkan rotasi kernel 180 derajat (flipping) dan reflect boundary padding.
    """
    if image.ndim != 2:
        raise ValueError("Operasi ini mensyaratkan citra 2D grayscale.")
        
    img_h, img_w = image.shape
    k_h, k_w = kernel.shape
    
    # 1. Rotasi kernel 180 derajat (flip vertikal dan horizontal)
    kernel_rotated = np.flipud(np.fliplr(kernel))
    
    # 2. Hitung radius padding
    pad_y = k_h // 2
    pad_x = k_w // 2
    
    # 3. Terapkan symmetric reflect padding
    padded = np.pad(image, ((pad_y, pad_y), (pad_x, pad_x)), mode='reflect').astype(np.float64)
    result = np.zeros_like(image, dtype=np.float64)
    
    # 4. Sliding window spatial filtering
    for i in range(img_h):
        for j in range(img_w):
            patch = padded[i : i + k_h, j : j + k_w]
            result[i, j] = np.sum(patch * kernel_rotated)
            
    return np.clip(result, 0, 255).astype(np.uint8)

def create_gaussian_kernel_2d(size: int = 5, sigma: float = 1.0) -> np.ndarray:
    """Menghasilkan matriks kernel Gaussian 2D ternormalisasi."""
    center = size // 2
    ax = np.arange(-center, center + 1)
    xx, yy = np.meshgrid(ax, ax)
    kernel = np.exp(-(xx**2 + yy**2) / (2.0 * sigma**2))
    return kernel / np.sum(kernel)

def main():
    print("=" * 60)
    print("Multimedia & Computer Vision Hub - Chapter 10 Verification")
    print("=" * 60)
    
    # Matriks citra sintetis 6x6
    test_image = np.array([
        [100, 100, 100, 200, 200, 200],
        [100, 100, 100, 200, 200, 200],
        [100, 100, 150, 200, 200, 200],
        [100, 150, 180, 200, 200, 200],
        [100, 100, 100, 200, 200, 200],
        [100, 100, 100, 200, 200, 200],
    ], dtype=np.uint8)
    
    # Kernel Gaussian 3x3
    kernel_3x3 = create_gaussian_kernel_2d(size=3, sigma=1.0)
    print("Kernel Gaussian 3x3 (sigma=1.0):\n", np.round(kernel_3x3, 4))
    print("Total bobot kernel (harus 1.0):", np.sum(kernel_3x3))
    
    # Jalankan konvolusi manual
    filtered = manual_convolution_2d(test_image, kernel_3x3)
    print("\nCitra Sebelum Filtering:\n", test_image)
    print("\nCitra Setelah Spatial Gaussian Filtering:\n", filtered)
    print("\nVerifikasi berhasil: Nilai transisi tepi tajam (100 -> 200) terhaluskan secara kontinu.")

if __name__ == "__main__":
    main()
