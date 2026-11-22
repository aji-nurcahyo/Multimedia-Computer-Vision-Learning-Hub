# Chapter 09 — Histogram Processing & Contrast Enhancement

> **Bagian Kurikulum**: Section 02 — Digital Image Processing Fundamentals  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 08 (Image Enhancement & Intensity Transformation)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Pada bab sebelumnya, kita menyesuaikan kontras dan kecerahan menggunakan parameter manual seperti $\alpha, \beta,$ dan $\gamma$. Namun, dalam sistem visi otomatis yang memproses ribuan gambar dengan pencahayaan bervariasi, penyesuaian manual tidak skalabel. Di sinilah **Histogram Citra** memainkan peran fundamental: histogram adalah representasi statistik distribusi frekuensi seluruh intensitas piksel dalam citra.

Bab ini mengkaji interpretasi histogram citra (gelap, terang, berkontras sempit vs lebar), derivasi matematis **Global Histogram Equalization** menggunakan **Cumulative Distribution Function (CDF)**, **Histogram Specification (Matching)**, **Contrast Stretching** berbasis persentil, hingga metode lokal canggih **CLAHE (*Contrast Limited Adaptive Histogram Equalization*)** yang mampu meningkatkan detail lokal tanpa meledakkan *noise* pada area homogen.

---

## 2. Learning Objectives

1. **Membaca dan menginterpretasikan** kondisi eksposur dan kontras sebuah citra secara langsung dari profil histogramnya.
2. **Membuktikan dan menghitung** pemetaan **Global Histogram Equalization** berbasis CDF diskrit secara manual dan programatik.
3. **Menjelaskan** konsep **Histogram Specification (Matching)** untuk menyamakan karakteristik nada dua citra berbeda.
4. **Menganalisis** perbedaan antara peningkatan kontras global (*Global HE*) vs lokal (*Adaptive HE / CLAHE*), serta peran parameter **Clip Limit** dan **Tile Grid Size**.
5. **Mengimplementasikan** `cv2.equalizeHist` dan `cv2.createCLAHE` pada citra grayscale dan berwarna (melalui ruang warna YCrCb/CIELAB).

---

## 3. Prerequisites

- Transformasi intensitas titik dan Look-Up Table [Chapter 08].
- Pemisahan kanal luminansi pada YCbCr / CIELAB [Chapter 07].

---

## 4. Fundamental Concepts

### 4.1 Definisi & Interpretasi Histogram Citra

Histogram citra 8-bit $h(r_k) = n_k$ mencatat jumlah piksel pada setiap tingkat keabuan $r_k \in \{0, 1, \dots, 255\}$. Jika dinormalisasi dengan jumlah total piksel $MN$:

$$p(r_k) = \frac{n_k}{M \cdot N}, \qquad \sum_{k=0}^{L-1} p(r_k) = 1$$

- **Histogram Mengumpul di Kiri**: Citra terlalu gelap (*under-exposed*).
- **Histogram Mengumpul di Kanan**: Citra terlalu terang (*over-exposed*).
- **Histogram Sempit di Tengah**: Citra berkontras rendah / berkabut (*low contrast*).
- **Histogram Lebar & Merata**: Citra memiliki rentang dinamis penuh dan kontras tinggi yang kaya detail.

![Histogram Equalization via CDF](/media/diagrams/chapter-09-histogram-equalization.svg)
*Gambar 9.1 — Transformasi Histogram Equalization menyebarkan puncak histogram yang sempit agar terdistribusi merata sepanjang [0, 255].*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.2 Global Histogram Equalization vs Specification
- **Histogram Equalization (HE)**: Secara otomatis mencari fungsi pemetaan monoton yang meratakan histogram keluaran mendekati distribusi seragam (*uniform distribution*).
- **Histogram Specification (Matching)**: Mengubah histogram citra masukan agar menyerupai bentuk histogram target tertentu (misalnya untuk menyeragamkan pencahayaan citra satelit multitemporal).

### 4.3 Global vs Local Enhancement: CLAHE

Global HE gagal apabila satu bagian foto sangat gelap dan bagian lain sangat terang (misalnya langit terang + wajah di bayangan), karena menggunakan satu kurva pemetaan global untuk seluruh gambar.

![Mekanisme CLAHE Local Tiles](/media/diagrams/chapter-09-clahe-tiles.svg)
*Gambar 9.2 — Tiga tahapan CLAHE: pembagian tile lokal, pemotongan puncak histogram (Clip Limit) untuk menekan noise, dan interpolasi bilinear antar tile.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

**CLAHE** (*Contrast Limited Adaptive Histogram Equalization*, Zuiderveld 1994) memecahkan keterbatasan ini melalui 3 inovasi:
1. Membagi citra menjadi ubin kecil (*contextual tiles*, mis. $8 \times 8$).
2. Memotong tinggi histogram di atas ambang **Clip Limit** lalu meredistribusikan kelebihannya ke semua bin sebelum menghitung CDF (mencegah penguatan *noise* di area langit datar).
3. Menggabungkan batas antar ubin dengan **interpolasi bilinear** agar transisi mulus tanpa efek kotak papan catur.

---

## 5. Mathematical Foundations

### 5.1 Pemetaan Diskrit Histogram Equalization

Untuk citra $M \times N$ dengan $L = 256$ tingkat intensitas, fungsi transformasi CDF untuk intensitas masukan $r_k$ adalah:

$$s_k = T(r_k) = (L - 1) \sum_{j=0}^{k} p(r_j) = \frac{255}{M \cdot N} \sum_{j=0}^{k} n_j$$

Versi normalisasi agar nilai minimum citra tepat terpetakan ke $0$:

$$s_k = \text{round}\left( \frac{\text{CDF}(r_k) - \text{CDF}_{\min}}{(M \cdot N) - \text{CDF}_{\min}} \times 255 \right)$$

---

## 6. Worked Numerical Example

**Soal**: Diberikan sub-citra 3-bit ($L = 8$, rentang nilai $0..7$) berukuran $4 \times 4$ ($MN = 16$ piksel) dengan tabel frekuensi:
- $r = 1$: $n_1 = 6$ piksel
- $r = 2$: $n_2 = 5$ piksel
- $r = 3$: $n_3 = 3$ piksel
- $r = 4$: $n_4 = 2$ piksel
- Nilai $0, 5, 6, 7$: $n_k = 0$ piksel.

Hitung nilai keluaran Histogram Equalization standar $s_k = \text{round}\big(7 \cdot \sum_{j=0}^k n_j / 16\big)$!

**Penyelesaian**:
- Untuk $r = 1$: $\text{CDF}(1) = 6/16 = 0.375 \implies s_1 = \text{round}(7 \times 0.375) = \text{round}(2.625) = \mathbf{3}$.
- Untuk $r = 2$: $\text{CDF}(2) = (6+5)/16 = 11/16 = 0.6875 \implies s_2 = \text{round}(7 \times 0.6875) = \text{round}(4.8125) = \mathbf{5}$.
- Untuk $r = 3$: $\text{CDF}(3) = 14/16 = 0.875 \implies s_3 = \text{round}(7 \times 0.875) = \text{round}(6.125) = \mathbf{6}$.
- Untuk $r = 4$: $\text{CDF}(4) = 16/16 = 1.0 \implies s_4 = \text{round}(7 \times 1.0) = \mathbf{7}$.

**Hasil**: Rentang sempit $\{1, 2, 3, 4\}$ berhasil diregangkan ke $\{3, 5, 6, 7\}$ (atau $\{0, 4, 6, 7\}$ bila menggunakan rumus normalisasi $\text{CDF}_{\min}$)!

---

## 7. Algorithm Pseudocode: Global Histogram Equalization

```text
ALGORITHM GlobalHistogramEqualization(GrayImage)
INPUT:
    GrayImage : Matriks uint8 H x W
OUTPUT:
    Equalized : Matriks uint8 H x W dengan kontras tersebarkan

BEGIN
    hist[0..255] <- ComputeHistogram(GrayImage)
    total <- H * W
    cdf <- CumulativeSum(hist)

    Find cdf_min <- first non-zero value in cdf
    Initialize LUT[0..255]

    FOR k <- 0 TO 255 DO
        LUT[k] <- Round(((cdf[k] - cdf_min) / Max(1, total - cdf_min)) * 255)
    END FOR

    RETURN ApplyLUT(GrayImage, LUT)
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat & Perhatian Penting Citra Berwarna
- Instalasi: `pip install numpy opencv-python-headless`
- **Jangan pernah** menerapkan `cv2.equalizeHist` ke saluran R, G, dan B secara terpisah karena mengubah rasio warna dan memicu pergeseran rona parah! Sebaliknya, konversikan citra ke **YCrCb** atau **CIELAB**, terapkan HE/CLAHE **hanya pada kanal Luminansi ($Y$ atau $L^*$)**, lalu konversikan kembali ke RGB!

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 09: Histogram Equalization & CLAHE Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def create_uneven_lighting_scene(size: int = 256) -> np.ndarray:
    """Citra sintetis berkontras rendah dengan gradasi pencahayaan tak merata."""
    x = np.linspace(30, 120, size)
    base = np.tile(x, (size, 1))
    # Tambahkan objek persegi terang samar dan objek gelap samar
    base[40:100, 40:100] += 25
    base[140:210, 140:210] -= 20
    return np.clip(base, 0, 255).astype(np.uint8)

if __name__ == "__main__":
    img = create_uneven_lighting_scene(256)

    # 1. Global Histogram Equalization
    eq_global = cv2.equalizeHist(img)

    # 2. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    eq_clahe = clahe.apply(img)

    # Verifikasi peningkatan standar deviasi kontras
    print(f"Original -> Min:{img.min()}, Max:{img.max()}, Std:{img.std():.2f}")
    print(f"Global HE-> Min:{eq_global.min()}, Max:{eq_global.max()}, Std:{eq_global.std():.2f}")
    print(f"CLAHE    -> Min:{eq_clahe.min()}, Max:{eq_clahe.max()}, Std:{eq_clahe.std():.2f}")

    assert eq_global.std() > img.std()
    assert eq_clahe.std() > img.std()
    print("Verifikasi Chapter 09 Histogram & CLAHE BERHASIL!")
```

---

## 9. Interactive Lab — Histogram Explorer

Buka tab **Laboratorium & Python** dan gunakan **Histogram Explorer**:
- Bandingkan grafik histogram 256-bin + kurva **CDF (garis oranye)** antara citra asli vs hasil **CLAHE**, **Global Equalization**, dan **Min-Max Contrast Stretching**.
- Ubah parameter **Clip Limit Factor** ($1.2 \dots 8.0$) dan **Tile Grid Size** ($2\times 2, 4\times 4, 8\times 8$) untuk menyaksikan bagaimana CLAHE memperjelas teks tersembunyi pada area berkontras rendah!

---

## 10. Experiments & Analysis

1. **Bentuk Kurva CDF Ideal**: Perhatikan garis oranye kurva CDF pada panel kanan setelah mengaktifkan **Global Histogram Equalization**. Mengapa kurva CDF berubah menjadi garis diagonal linier mendekati sudut $45^\circ$?
2. **Dampak Clip Limit Terlalu Tinggi**: Naikkan *Clip Limit* CLAHE ke `8.0` pada foto yang sedikit berderau. Perhatikan munculnya bintik kasar di area abu-abu homogen—inilah alasan parameter standar `clipLimit` industri berkisar `2.0 – 3.0`.

---

## 11. Mini Project — Penyelaras Pencahayaan Citra Radiologi / X-Ray

Implementasikan skrip Python yang memproses citra grayscale medis/industri berkanal warna atau YCrCb:
1. Hitung histogram dan *Cumulative Distribution Function* dari nol menggunakan `np.bincount`.
2. Terapkan **CLAHE** pada saluran $L^*$ di ruang CIELAB untuk citra berwarna agar warna tetap alami.
3. Simpan perbandingan berdampingan (Asli vs Global HE vs CLAHE) serta catat kenaikan standar deviasi kontras lokal.

---

## 12. Summary & Presentation Slides

Gunakan tab **Presentasi Slide** untuk 10 slide ringkasan dan diskusi.

1. Histogram $h(r_k)$ adalah peta statistik intensitas yang langsung mendiagnosis apakah citra terlalu gelap, terlalu terang, atau rendah kontras.
2. **Global Histogram Equalization** meratakan histogram dengan fungsi CDF kumulatif.
3. **CLAHE** melampaui kelemahan metode global melalui ekualisasi berbasis ubin lokal dengan *Clip Limit* anti-noise dan interpolasi bilinear.
4. Untuk citra berwarna, selalu proses pada saluran Luminansi (Y / L*) saja.

---

## 13. Verified Academic References

1. **Zuiderveld, K.** (1994). *Contrast Limited Adaptive Histogram Equalization*. Graphics Gems IV, Academic Press, pp. 474–485.
2. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 3 (Section 3.3): Histogram Processing.
3. **OpenCV Documentation**. (2024). *Histograms - 2: Histogram Equalization (equalizeHist & CLAHE)*. Official OpenCV Tutorial.

