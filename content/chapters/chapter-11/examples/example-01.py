"""
Multimedia & Computer Vision Learning Hub
Chapter 11: Frequency Domain Image Processing (2D FFT) Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np


def create_stripe_disk_scene(size: int = 128) -> np.ndarray:
    img = np.full((size, size), 20.0, dtype=np.float64)
    for x in range(16, 60, 6):
        img[20:100, x : x + 2] = 220.0
    yy, xx = np.ogrid[:size, :size]
    mask = (xx - 92) ** 2 + (yy - 64) ** 2 <= 24 ** 2
    img[mask] = 220.0
    return img


def gaussian_lpf_mask(shape: tuple, d0: float) -> np.ndarray:
    rows, cols = shape
    cy, cx = rows // 2, cols // 2
    y, x = np.ogrid[:rows, :cols]
    dist2 = (x - cx) ** 2 + (y - cy) ** 2
    return np.exp(-dist2 / (2.0 * (d0 ** 2)))


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 11 Verification")
    print("=" * 64)

    img = create_stripe_disk_scene(128)
    f = np.fft.fft2(img)
    f_shift = np.fft.fftshift(f)

    # 1. Verifikasi nilai komponen DC == total jumlah intensitas citra
    dc_mag = float(np.abs(f_shift[64, 64]))
    img_sum = float(np.sum(img))
    print(f"DC Magnitude |F(0,0)| = {dc_mag:.2f} | Sum(img) = {img_sum:.2f}")
    assert np.isclose(dc_mag, img_sum, rtol=1e-6)

    # 2. Verifikasi IFFT roundtrip lossless
    reconstructed_exact = np.real(np.fft.ifft2(np.fft.ifftshift(f_shift)))
    roundtrip_err = float(np.max(np.abs(img - reconstructed_exact)))
    print(f"FFT -> IFFT Roundtrip Max Error: {roundtrip_err:.2e}")
    assert roundtrip_err < 1e-9

    # 3. Verifikasi Gaussian LPF menurunkan energi frekuensi tinggi (std turun)
    h_mask = gaussian_lpf_mask(img.shape, d0=14.0)
    filtered = np.real(np.fft.ifft2(np.fft.ifftshift(f_shift * h_mask)))
    print(f"Std Asli: {img.std():.2f} -> Std Setelah Gaussian LPF (D0=14): {filtered.std():.2f}")
    assert filtered.std() < img.std()

    print("Verifikasi Chapter 11 BERHASIL!")


if __name__ == "__main__":
    main()

