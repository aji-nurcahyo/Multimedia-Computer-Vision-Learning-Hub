# Chapter 08 — Image Enhancement & Intensity Transformation

> **Bagian Kurikulum**: Section 02 — Digital Image Processing Fundamentals  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 06 (Digital Image Fundamentals), Chapter 07 (Color Models)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Sering kali citra digital yang tertangkap oleh sensor kamera mengalami kekurangan pencahayaan (*under-exposed*), kelebihan cahaya (*over-exposed*), atau memiliki rentang kontras yang sempit akibat kondisi kabut atau rentang dinamis layar yang terbatas. **Intensity Transformation** (*Point Processing*) adalah kelas operasi paling mendasar dalam peningkatan mutu citra (*Image Enhancement*), di mana nilai intensitas baru $s$ pada koordinat $(x, y)$ hanya bergantung pada nilai intensitas asli $r$ pada koordinat tersebut melalui fungsi pemetaan $s = T(r)$.

Bab ini membahas pemetaan linier **Brightness** dan **Contrast**, **Image Negative**, **Log Transformation** untuk kompresi rentang dinamis tinggi, **Power-Law / Gamma Correction** ($\gamma$) untuk kalibrasi layar dan koreksi bayangan, **Piecewise Linear Contrast Stretching**, **Min-Max Normalization**, serta akselerasi komputasi $\mathcal{O}(1)$ per piksel menggunakan **Look-Up Table (LUT)**.

---

## 2. Learning Objectives

1. **Merumuskan** transformasi intensitas titik demi titik $s = T(r)$ tanpa ketergantungan piksel tetangga.
2. **Menganalisis** peran parameter $\alpha$ (*contrast*) dan $\beta$ (*brightness*) dalam pemetaan linier serta pencegahan *clipping* dan *uint8 overflow*.
3. **Menjelaskan** sifat matematis dan aplikasi praktis dari **Image Negative**, **Log Transform**, dan **Gamma Correction ($\gamma < 1$ vs $\gamma > 1$)**.
4. **Mengimplementasikan** fungsi *Piecewise Contrast Stretching*, *Image Normalization*, serta Look-Up Table `cv2.LUT` di Python secara efisien.
5. **Mengevaluasi** perbaikan kontras secara kuantitatif (rentang dinamis, rata-rata intensitas, dan standar deviasi) dan perseptual.

---

## 3. Prerequisites

- Pemahaman representasi matriks 8-bit `uint8` dan konversi aman `float32` / `np.clip` [Chapter 05 &amp; 06].

---

## 4. Fundamental Concepts

![Kurva Transformasi Intensitas Titik](/media/diagrams/chapter-08-intensity-curves.svg)
*Gambar 8.1 — Kurva fungsi pemetaan intensitas s = T(r) untuk Identity, Image Negative, Log / Gamma < 1, dan Gamma > 1.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.1 Brightness &amp; Contrast (*Affine Intensity Mapping*)
- **Brightness ($\beta$)**: Pergeseran aditif seragam ke seluruh piksel ($\beta > 0$ mencerahkan, $\beta < 0$ menggelapkan).
- **Contrast ($\alpha$)**: Pengali gradien kemiringan pemetaan ($\alpha > 1$ memperlebar selisih gelap-terang, $0 < \alpha < 1$ mempersempit kontras).

### 4.2 Image Negative, Log Transform &amp; Gamma Correction
- **Image Negative**: Membalik polaritas kecerahan ($0 \leftrightarrow 255$). Sangat berguna untuk memeriksa detail putih halus pada latar gelap seperti citra radiologi X-ray atau mammogram medis.
- **Log Transformation**: Memperluas nilai piksel gelap berintensitas rendah sembari memampatkan nilai puncak ekstrem terang (contoh paling penting: menampilkan **Spektrum Magnitudo Fourier 2D** di Chapter 11!).
- **Power-Law (Gamma) Correction**: Mengkompensasi respons non-linier layar monitor (yang memiliki $\gamma_{\text{display}} \approx 2.2$) dan meningkatkan kecerahan area bayangan ($\gamma < 1$) tanpa membakar area terang (*highlight clipping*).

### 4.3 Piecewise Linear Contrast Stretching &amp; Normalization

![Piecewise Contrast Stretching](/media/diagrams/chapter-08-contrast-stretching.svg)
*Gambar 8.2 — Mekanisme peregangan kontras linier bertahap di sekitar titik belok (r₁, s₁) dan (r₂, s₂).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

Berbeda dengan pengali konstan, *Contrast Stretching* memetakan rentang intensitas sempit yang mengandung mayoritas informasi objek $[r_{\min}, r_{\max}]$ agar mengisi penuh rentang tampilan $[0, 255]$.

---

## 5. Mathematical Foundations

Misalkan $r \in [0, L-1]$ (untuk 8-bit, $L - 1 = 255$):

1. **Brightness &amp; Contrast Linier**:
   $$s = \text{clip}\big(\alpha \cdot (r - 128) + 128 + \beta,\; 0,\; 255\big)$$
   *(atau dalam bentuk OpenCV `cv2.convertScaleAbs`: $s = \text{clip}(\alpha r + \beta, 0, 255)$).*

2. **Image Negative**:
   $$s = (L - 1) - r = 255 - r$$

3. **Logarithmic Transformation**:
   $$s = c \cdot \log(1 + r), \qquad \text{dengan } c = \frac{255}{\log(1 + r_{\max})}$$

4. **Power-Law (Gamma) Transformation**:
   $$s = 255 \cdot \left(\frac{r}{255}\right)^\gamma$$
   - Jika $\gamma < 1$: kurva cekung ke atas (mencerahkan area gelap).
   - Jika $\gamma > 1$: kurva cembung ke bawah (menggelapkan citra yang pudar/keputihan).

5. **Min–Max Normalization**:
   $$s = \frac{r - r_{\min}}{r_{\max} - r_{\min}} \cdot 255$$

---

## 6. Worked Numerical Example

**Soal**: Sebuah piksel dalam citra radiologi berintensitas $r = 64$ (cukup gelap). Hitung nilai keluarannya jika diterapkan:
1. **Image Negative** ($8$-bit)
2. **Gamma Correction** dengan $\gamma = 0.5$
3. **Min-Max Contrast Stretching** jika seluruh citra memiliki $r_{\min} = 40$ dan $r_{\max} = 160$.

**Penyelesaian**:
1. **Image Negative**:
   $$s = 255 - 64 = \mathbf{191}$$
2. **Gamma Correction ($\gamma = 0.5$)**:
   $$r_{\text{norm}} = \frac{64}{255} \approx 0.2510$$
   $$s = 255 \times (0.2510)^{0.5} = 255 \times 0.5010 \approx \mathbf{128}$$
   *(Piksel gelap 64 dinaikkan dua kali lipat menjadi 128!)*
3. **Contrast Stretching ($r_{\min}=40, r_{\max}=160$)**:
   $$s = \frac{64 - 40}{160 - 40} \times 255 = \frac{24}{120} \times 255 = 0.2 \times 255 = \mathbf{51}$$

---

## 7. Algorithm Pseudocode: Look-Up Table (LUT) Fast Enhancement

```text
ALGORITHM GammaCorrectWithLUT(Image, gamma)
INPUT:
    Image : Matriks uint8 H x W (atau H x W x 3)
    gamma : Bilangan real positif > 0
OUTPUT:
    Result : Citra terkoreksi gamma

BEGIN
    Initialize LUT[0..255] as uint8
    FOR r <- 0 TO 255 DO
        LUT[r] <- Clamp(Round(255.0 * (r / 255.0) ^ gamma), 0, 255)
    END FOR

    FOR each pixel coordinate (y, x) DO
        Result[y, x] <- LUT[Image[y, x]]
    END FOR
    RETURN Result
END
```

---

## 8. Python &amp; OpenCV Implementation

### Prasyarat &amp; Catatan Performa
- Instalasi: `pip install numpy opencv-python-headless`
- Menggunakan **Look-Up Table (LUT)** jauh lebih cepat daripada memanggil fungsi eksponen `np.power()` jutaan kali pada citra 4K karena operasi pangkat hanya dihitung tepat **256 kali**.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 08: Intensity Transformation & LUT Optimization
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def apply_gamma_lut(img: np.ndarray, gamma: float) -> np.ndarray:
    """Koreksi gamma cepat menggunakan OpenCV Look-Up Table (256-entry)."""
    if gamma <= 0:
        raise ValueError("Gamma harus lebih besar dari 0.")
    r = np.arange(256, dtype=np.float64) / 255.0
    lut = np.clip(np.round((r ** gamma) * 255.0), 0, 255).astype(np.uint8)
    return cv2.LUT(img, lut)

def contrast_stretch(img: np.ndarray) -> np.ndarray:
    """Normalisasi Min-Max menjadi rentang penuh [0, 255]."""
    img_f = img.astype(np.float64)
    r_min, r_max = np.min(img_f), np.max(img_f)
    if r_max == r_min:
        return np.zeros_like(img, dtype=np.uint8)
    stretched = ((img_f - r_min) / (r_max - r_min)) * 255.0
    return np.clip(np.round(stretched), 0, 255).astype(np.uint8)

if __name__ == "__main__":
    # Citra uji sintetis berkontras rendah [50..130]
    np.random.seed(42)
    low_c = np.linspace(50, 130, 100 * 100).reshape(100, 100).astype(np.uint8)

    neg = 255 - low_c
    gamma_bright = apply_gamma_lut(low_c, gamma=0.5)
    stretched = contrast_stretch(low_c)

    print(f"Rentang Awal   : [{low_c.min()}, {low_c.max()}], Std={low_c.std():.2f}")
    print(f"Rentang Gamma  : [{gamma_bright.min()}, {gamma_bright.max()}], Mean={gamma_bright.mean():.2f}")
    print(f"Rentang Stretch: [{stretched.min()}, {stretched.max()}], Std={stretched.std():.2f}")

    assert neg[0, 0] == 255 - low_c[0, 0]
    assert stretched.min() == 0 and stretched.max() == 255
    assert gamma_bright.mean() > low_c.mean()
    print("Verifikasi Chapter 08 BERHASIL!")
```

---

## 9. Interactive Lab — Image Enhancement Lab

Gunakan **Image Enhancement Lab** di tab **Laboratorium &amp; Python**:
- Amati perubahan citra berlatar kontras rendah secara langsung saat menggeser **Brightness ($\beta$)**, **Contrast ($\alpha$)**, dan **Gamma ($\gamma$)**.
- Bandingkan fungsi **Piecewise Contrast Stretching**, **Log Transform**, dan **Image Negative**, sembari mengamati bentuk kurva $s = T(r)$ yang bergerak secara waktu nyata di panel kanan!

---

## 10. Experiments &amp; Analysis

1. **Eksperimen Gamma $\gamma = 0.4$ vs $\gamma = 2.2$**: Amati pergeseran kelengkungan kurva $T(r)$ dan perubahan histogram visual bayangan gelap.
2. **Evaluasi Clipping Saturasi**: Naikkan *Contrast* ke $2.5\times$ bersama *Brightness* $+60$. Perhatikan bahwa piksel yang menyentuh batas $255$ mengalami *clipping* sehingga kehilangan tekstur permanen (kurva mendatar di bagian atas).

---

## 11. Mini Project — Auto-Exposure &amp; Log-Dynamic Range Viewer

Buat skrip Python untuk aplikasi fotografi ilmiah:
1. Bangkitkan matriks citra High Dynamic Range sintetik (`float64`) dengan puncak terang bernilai $100.000$ dan latar belakang lemah bernilai $1.0\text{–}10.0$.
2. Bandingkan hasil normalisasi linier biasa (di mana area gelap terlihat hitam total) vs **Log Transformation** $s = c \log(1 + r)$ yang mampu menampakkan seluruh skala intensitas secara seimbang.

---

## 12. Summary &amp; Presentation Slides

Buka tab **Presentasi Slide** untuk 10 slide materi lengkap dengan persamaan matematis dan catatan dosen.

1. *Point processing* memetakan setiap piksel secara independen lewat fungsi $s = T(r)$.
2. **Image Negative** berguna menonjolkan detail terang pada latar gelap; **Log Transform** memampatkan rentang dinamis ekstrem.
3. **Gamma Correction** ($\gamma < 1$ mencerahkan, $\gamma > 1$ menggelapkan) bekerja halus tanpa memotong titik ekstrem $0$ dan $255$.
4. **Look-Up Table (LUT)** mengakselerasi transformasi piksel 8-bit menjadi $\mathcal{O}(1)$ akses memori.

---

## 13. Verified Academic References

1. **Gonzalez, R. C., &amp; Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 3 (Sections 3.1–3.2): Intensity Transformations.
2. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Section 3.1: Point Operators.
3. **OpenCV Documentation**. (2024). *Changing the contrast and brightness of an image! &amp; cv2.LUT*. Official Reference.

