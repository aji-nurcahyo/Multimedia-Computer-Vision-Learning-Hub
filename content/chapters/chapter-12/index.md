# Chapter 12 — Image Restoration & Noise Reduction

> **Bagian Kurikulum**: Section 03 — Advanced Digital Image Processing  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 10 (Spatial Filtering), Chapter 11 (Frequency Domain)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Berbeda dengan *Image Enhancement* yang bersifat subjektif agar citra lebih enak dilihat mata, **Image Restoration** bertujuan merekonstruksi atau memulihkan citra yang terdegradasi kembali semirip mungkin dengan citra ideal aslinya berdasarkan model matematis degradasi fisik. Selama akuisisi maupun transmisi sinyal, sensor kamera memperkenalkan derau termal (**Gaussian noise**), gangguan sakelar elektronik atau bit rusak (**Salt-and-Pepper impulse noise**), maupun interferensi koheren radar/ultrasound (**Speckle noise**).

Bab ini memformulasikan model degradasi citra, teknik estimasi karakteristik noise, algoritma peredam derau mulai dari Mean &amp; Median filtering hingga filter pelestari tepi mutakhir **Bilateral Filter**, **Non-Local Means (NLM)**, dan **Wiener Filter**, serta evaluasi objektif berbasis metrik kuantitatif **PSNR** dan **SSIM**.

---

## 2. Learning Objectives

1. **Merumuskan** model degradasi citra linier tergeser beserta komponen noise aditif maupun multiplikatif.
2. **Membedakan** karakteristik statistik dan visual dari **Gaussian Noise**, **Salt-and-Pepper Noise**, dan **Speckle Noise**.
3. **Menjelaskan** cara kerja filter pelestari tepi (*edge-preserving denoising*) seperti **Bilateral Filter** dan **Non-Local Means (NLM)**.
4. **Menerapkan** algoritma restorasi **Median**, **Bilateral**, **NLM**, dan **Wiener** pada Python dan OpenCV.
5. **Mengevaluasi** performa pemulihan citra secara kuantitatif menggunakan **MSE**, **PSNR (dB)**, dan **Structural Similarity Index (SSIM)**.

---

## 3. Prerequisites

- Operasi konvolusi spasial dan Median filtering [Chapter 10].
- Transformasi domain frekuensi 2D FFT [Chapter 11].

---

## 4. Fundamental Concepts

### 4.1 Model Degradasi Citra

![Model Degradasi dan Restorasi Citra](/media/diagrams/chapter-12-degradation-noise.svg)
*Gambar 12.1 — Alur model degradasi fisik citra (blur H + derau aditif η) dan pemulihan f̂(x,y) dengan evaluasi PSNR/SSIM.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

Citra teramati $g(x, y)$ dimodelkan sebagai:
$$g(x, y) = (h * f)(x, y) + \eta(x, y)$$
Di mana $f(x, y)$ adalah citra ideal, $h(x, y)$ adalah fungsi sebaran titik (*Point Spread Function / blur*), dan $\eta(x, y)$ adalah komponen derau statistik.

### 4.2 Tiga Jenis Derau Utama
1. **Gaussian Noise ($\mathcal{N}(\mu, \sigma^2)$)**: Berasal dari panas termal sensor dan penguatan ISO tinggi dalam kondisi minim cahaya. Setiap piksel terganggu fluktuasi normal acak.
2. **Salt-and-Pepper (Impulse) Noise**: Piksel rusak mendadak menjadi nilai ekstrem hitam ($0$) atau putih ($255$), biasanya dipicu kesalahan memori atau transmisi paket. Mean/Gaussian blur gagal menghilangkannya, sedangkan **Median Filter** mengatasinya dengan sangat bersih.
3. **Speckle Noise ($g = f \cdot (1 + \eta)$)**: Derau multiplikatif di mana besarnya fluktuasi sebanding dengan intensitas sinyal lokal; sangat lazim dijumpai pada citra radar SAR dan USG medis (*ultrasound*).

### 4.3 Penapis Canggih: Bilateral, Non-Local Means &amp; Wiener

![Bilateral vs Non-Local Means vs Wiener](/media/diagrams/chapter-12-bilateral-wiener.svg)
*Gambar 12.2 — Perbandingan arsitektur filter pelestari tepi: Bilateral Filter, Non-Local Means, dan Wiener Filter (MMSE).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **Bilateral Filter (Tomasi &amp; Manduchi, 1998)**: Mengalikan dua bobot Gaussian sekaligus: jarak spasial $\sigma_s$ DAN selisih intensitas warna $\sigma_r$. Akibatnya, piksel di seberang batas tepi objek tidak ikut dirata-ratakan sehingga **tepi tetap tajam sembari area datar menjadi halus**.
- **Non-Local Means (Buades et al., 2005)**: Alih-alih hanya membandingkan nilai satu piksel, NLM mencari kemiripan pola blok kecil (*patch*) di seluruh area pencarian, memanfaatkan pengulangan tekstur alami pada foto.
- **Wiener Filter**: Solusi analitis *Minimum Mean Square Error* (MMSE) yang meminimalkan rata-rata kuadrat galat restorasi dengan mempertimbangkan rasio spektrum daya derau terhadap sinyal asli ($\text{SNR}$).

---

## 5. Mathematical Foundations

### 5.1 Bilateral Filter
$$I^{\text{filtered}}(p) = \frac{1}{W_p} \sum_{q \in \Omega} I(q) \cdot \exp\left(-\frac{\|p - q\|^2}{2\sigma_s^2}\right) \cdot \exp\left(-\frac{|I(p) - I(q)|^2}{2\sigma_r^2}\right)$$

### 5.2 Wiener Filter (Domain Frekuensi)
$$W(u, v) = \frac{H^*(u, v)}{|H(u, v)|^2 + \frac{S_{\eta\eta}(u, v)}{S_{ff}(u, v)}} \approx \frac{H^*(u, v)}{|H(u, v)|^2 + K}$$

### 5.3 Metrik Kuantitatif Kualitas Citra: MSE, PSNR &amp; SSIM

1. **Mean Squared Error (MSE)**:
   $$\text{MSE} = \frac{1}{MN} \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} \big[f(x, y) - \hat{f}(x, y)\big]^2$$
2. **Peak Signal-to-Noise Ratio (PSNR)** (dalam desibel / dB, makin tinggi makin baik):
   $$\text{PSNR} = 10 \log_{10}\left(\frac{255^2}{\text{MSE}}\right)$$
3. **Structural Similarity Index (SSIM)** (rentang $[-1, 1]$, ideal $= 1.0$) yang menilai korelasi luminansi, kontras, dan struktur lokal:
   $$\text{SSIM}(x, y) = \frac{(2\mu_x \mu_y + C_1)(2\sigma_{xy} + C_2)}{(\mu_x^2 + \mu_y^2 + C_1)(\sigma_x^2 + \sigma_y^2 + C_2)}$$

---

## 6. Worked Numerical Example

**Soal**: Sebuah citra 8-bit terkorupsi noise memiliki nilai $\text{MSE} = 400.0$ terhadap citra bersih referensi. Setelah diterapkan filter Bilateral, MSE berhasil ditekan turun menjadi $\text{MSE}_{\text{restored}} = 40.0$. Hitung nilai PSNR sebelum dan sesudah restorasi serta kenaikan desibel ($\Delta \text{PSNR}$)!

**Penyelesaian**:
1. **PSNR Awal (Berderau, $\text{MSE} = 400$)**:
   $$\text{PSNR}_{\text{noisy}} = 10 \log_{10}\left(\frac{255^2}{400}\right) = 10 \log_{10}\left(\frac{65025}{400}\right) = 10 \log_{10}(162.5625) \approx 10 \times 2.2110 = \mathbf{22.11\text{ dB}}$$
2. **PSNR Setelah Restorasi ($\text{MSE} = 40$)**:
   $$\text{PSNR}_{\text{restored}} = 10 \log_{10}\left(\frac{65025}{40}\right) = 10 \log_{10}(1625.625) \approx 10 \times 3.2110 = \mathbf{32.11\text{ dB}}$$
3. **Peningkatan Kualitas**:
   $$\Delta \text{PSNR} = 32.11 - 22.11 = \mathbf{+10.00\text{ dB}}$$
   *(Menurunkan MSE sebanyak $10\times$ selalu menaikkan PSNR tepat sebesar $+10\text{ dB}$!).*

---

## 7. Algorithm Pseudocode: Bilateral Edge-Preserving Filtering

```text
ALGORITHM BilateralFilter(Image, radius, sigma_s, sigma_r)
INPUT:
    Image   : Citra grayscale H x W
    radius  : Jari-jari ketetanggaan
    sigma_s : Standar deviasi jarak spasial
    sigma_r : Standar deviasi selisih intensitas warna
OUTPUT:
    Filtered : Citra terhalus dengan tepi tetap terjaga

BEGIN
    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            w_sum <- 0; val_sum <- 0; center <- Image[y, x]
            FOR dy <- -radius TO radius DO
                FOR dx <- -radius TO radius DO
                    neighbor <- SampleReflect(Image, x + dx, y + dy)
                    w_spatial <- Exp(-(dx*dx + dy*dy) / (2 * sigma_s^2))
                    w_range   <- Exp(-((neighbor - center)^2) / (2 * sigma_r^2))
                    w <- w_spatial * w_range
                    val_sum <- val_sum + w * neighbor
                    w_sum <- w_sum + w
                END FOR
            END FOR
            Filtered[y, x] <- Round(val_sum / w_sum)
        END FOR
    END FOR
    RETURN Filtered
END
```

---

## 8. Python &amp; OpenCV Implementation

### Prasyarat &amp; Catatan
- Instalasi: `pip install numpy opencv-python-headless`
- Menggunakan `cv2.bilateralFilter`, `cv2.medianBlur`, dan `cv2.fastNlMeansDenoising` dengan seed acak deterministik (`np.random.seed(42)`).

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 12: Image Restoration, Noise & PSNR/SSIM Metrics Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def compute_psnr(clean: np.ndarray, target: np.ndarray) -> float:
    mse = float(np.mean((clean.astype(np.float64) - target.astype(np.float64)) ** 2))
    if mse == 0:
        return 100.0
    return float(10.0 * np.log10((255.0 ** 2) / mse))

if __name__ == "__main__":
    np.random.seed(42)
    # 1. Citra referensi bersih dengan tepi tajam
    clean = np.full((128, 128), 60, dtype=np.uint8)
    clean[32:96, 32:96] = 200

    # 2. Tambahkan Gaussian Noise sigma=22
    noise = np.random.normal(0, 22, clean.shape)
    noisy_gauss = np.clip(clean.astype(np.float64) + noise, 0, 255).astype(np.uint8)

    # 3. Restorasi menggunakan Bilateral & Non-Local Means
    restored_bilat = cv2.bilateralFilter(noisy_gauss, d=7, sigmaColor=50, sigmaSpace=50)
    restored_nlm = cv2.fastNlMeansDenoising(noisy_gauss, None, h=18, templateWindowSize=7, searchWindowSize=21)

    psnr_noisy = compute_psnr(clean, noisy_gauss)
    psnr_bilat = compute_psnr(clean, restored_bilat)
    psnr_nlm = compute_psnr(clean, restored_nlm)

    print(f"Noisy Gaussian PSNR : {psnr_noisy:.2f} dB")
    print(f"Bilateral Filter    : {psnr_bilat:.2f} dB")
    print(f"Non-Local Means PSNR: {psnr_nlm:.2f} dB")

    assert psnr_bilat > psnr_noisy and psnr_nlm > psnr_noisy
    print("Verifikasi Restorasi Citra Chapter 12 BERHASIL!")
```

---

## 9. Interactive Lab — Image Restoration Lab

Pada tab **Laboratorium &amp; Python**, jelajahi **Image Restoration Lab**:
- Pilih tipe noise (**Gaussian**, **Salt &amp; Pepper**, atau **Speckle**) dan atur intensitasnya.
- Bandingkan performa berbagai algoritma pemulihan: **Bilateral Filter**, **Non-Local Means (NLM)**, **Median Filter**, **Adaptive Wiener**, dan **Box Mean Filter**.
- Amati pembacaan metrik kuantitatif **PSNR (dB)** dan **SSIM** secara langsung sebelum vs sesudah restorasi!

---

## 10. Experiments &amp; Analysis

1. **Salt-and-Pepper vs Mean/Bilateral vs Median**: Set tipe noise ke **Salt &amp; Pepper**, lalu coba terapkan *Box Mean* vs *Bilateral* vs *Median*. Mengapa *Bilateral Filter* gagal menghilangkan bintik putih/hitam ekstrem? Karena selisih intensitas piksel noise sangat besar sehingga *range weight*-nya mendekati nol dan piksel noise tetap mempertahankan nilai ekstremnya sendiri! Sedangkan **Median Filter** menyingkirkan impuls dalam sekejap dan menghasilkan lonjakan PSNR/SSIM tertinggi.
2. **Bilateral &amp; NLM pada Gaussian Noise**: Set noise ke **Gaussian**, bandingkan ketajaman tepi persegi hasil *Box Mean* (buram) terhadap *Bilateral Filter* atau *Non-Local Means* (tepi tetap tegas dengan PSNR jauh lebih tinggi).

---

## 11. Mini Project — Sistem Restorasi Adaptif Multi-Noise

Buat fungsi detektor klasifikasi noise otomatis dalam Python yang:
1. Menghitung persentase piksel ekstrem bernilai tepat `0` atau `255` untuk mendeteksi keberadaan **Salt-and-Pepper Noise** (jika &gt; $1\%$, aplikasikan `cv2.medianBlur(img, 3)` terlebih dahulu).
2. Mengestimasi variansi derau Gaussian dari area latar belakang homogen (*Laplacian median absolute deviation*), lalu mengaplikasikan `cv2.fastNlMeansDenoising` dengan parameter `h` yang disesuaikan secara otomatis!
3. Mencetak laporan komparasi MSE, PSNR, dan SSIM.

---

## 12. Summary &amp; Presentation Slides

Gunakan tab **Presentasi Slide** untuk 10 slide materi kuliah dan catatan pengajar.

1. Setiap jenis noise membutuhkan penapis berbeda: **Median** untuk Salt-and-Pepper; **Bilateral / NLM / Wiener** untuk Gaussian; filter homomorfik/Lee untuk Speckle.
2. **Bilateral Filter** dan **Non-Local Means** menjaga ketajaman batas tepi objek ketika meredam derau.
3. **PSNR** mengukur rasio galat piksel logaritmik, sedangkan **SSIM** mengevaluasi kesamaan struktur perseptual manusia.

---

## 13. Verified Academic References

1. **Tomasi, C., &amp; Manduchi, R.** (1998). *Bilateral Filtering for Gray and Color Images*. IEEE International Conference on Computer Vision (ICCV), pp. 839–846.
2. **Buades, A., Coll, B., &amp; Morel, J. M.** (2005). *A Non-Local Algorithm for Image Denoising*. IEEE Conference on Computer Vision and Pattern Recognition (CVPR), Vol. 2, pp. 60–65.
3. **Wang, Z., Bovik, A. C., Sheikh, H. R., &amp; Simoncelli, E. P.** (2004). *Image Quality Assessment: From Error Visibility to Structural Similarity (SSIM)*. IEEE Transactions on Image Processing, 13(4), 600–612.
4. **Gonzalez, R. C., &amp; Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 5: Image Restoration.

