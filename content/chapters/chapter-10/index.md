# Chapter 10 — Spatial Filtering & Convolution

> **Bagian Kurikulum**: Section 02 — Digital Image Processing Fundamentals  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 06 (Digital Image Fundamentals), Chapter 08 (Image Enhancement & Intensity Transformation)  
> **Learning Tracks**: Digital Image Processing, Computer Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Operasi ketetanggaan spasial (*spatial neighborhood operations*) merupakan pilar utama dalam pemrosesan citra digital tingkat rendah (*low-level image processing*). Berbeda dengan transformasi intensitas titik demi titik (*point processing*) yang hanya memetakan nilai satu piksel secara independen, **spatial filtering** menghitung nilai piksel baru berdasarkan kombinasi terbobot dari piksel target beserta sekumpulan piksel tetangga di sekitarnya.

Dalam bab ini, kita akan membedah secara mendalam landasan matematis konvolusi diskrit 2 dimensi (*2D discrete convolution*), membandingkannya secara cermat dengan korelasi spasial (*spatial correlation*), menganalisis sifat separabilitas filter Gaussian, memahami strategi penanganan batas citra (*boundary padding*), serta mengimplementasikan algoritma filtering menggunakan NumPy murni dan pustaka industri OpenCV.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Memahami** prinsip matematis operasi ketetanggaan spasial, konvolusi 2D, dan korelasi 2D.
2. **Membedakan** karakteristik filter linier (*linear spatial filters*) seperti Gaussian blur dan box filter, dengan filter non-linier (*non-linear filters*) seperti median filter.
3. **Membuktikan** sifat separabilitas (*separability property*) kernel Gaussian dan menganalisis reduksi kompleksitas komputasionalnya dari $\mathcal{O}(K^2)$ menjadi $\mathcal{O}(2K)$.
4. **Mengimplementasikan** fungsi konvolusi spasial 2D mandiri dari nol menggunakan NumPy tanpa pustaka pihak ketiga.
5. **Menerapkan** fungsi teroptimasi OpenCV (`cv2.filter2D`, `cv2.GaussianBlur`, `cv2.Laplacian`) untuk mereduksi derau (*noise reduction*) dan penajaman citra (*sharpening* / unsharp masking).
6. **Mengevaluasi** dampak pemilihan metode boundary padding (*zero padding*, *replicate*, *reflect*) terhadap kualitas tepi citra hasil filtering.

---

## 3. Prerequisites

Untuk menguasai materi bab ini dengan optimal, Anda diharapkan telah memahami:
- Representasi matriks citra digital 2D dan pengindeksan koordinat $(x, y)$ [Chapter 06].
- Transformasi intensitas dan histogram citra [Chapter 08 & 09].
- Dasar operasi matriks dan manipulasi larik (*array manipulation*) pada NumPy [Chapter 05].

---

## 4. Fundamental Concepts

### 4.1 Definisi Filter Spasial

Filter spasial terdiri dari:
1. **Sub-citra ketetanggaan (*neighborhood*)**: Sekelompok piksel yang berpusat pada koordinat target $(x,y)$. Umumnya berbentuk bujur sangkar berdimensi ganjil $m \times n$ (misalnya $3 \times 3$, $5 \times 5$, atau $7 \times 7$) agar memiliki titik pusat (*center pixel*) yang unik.
2. **Mask / Kernel / Filter**: Matriks berukuran sama yang berisi bobot-bobot koefisien penapis $w(s,t)$.

![Mekanisme Spatial Filtering & Konvolusi Diskrit 2D](/media/diagrams/chapter-10-overview.svg)
*Gambar 10.1 — Mekanisme sliding window konvolusi spasial antara citra masukan $f(x,y)$ dan matriks kernel $w(s,t)$.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.2 Linear vs Non-Linear Filters

- **Linear Filter**: Nilai piksel keluaran $g(x,y)$ dihitung sebagai kombinasi linier (penjumlahan hasil kali bobot) dari piksel-piksel tetangga. Contoh: **Box Mean filter** (rata-rata seragam berbobot $\frac{1}{K^2}$), **Gaussian blur**, **Laplacian sharpening**, dan **Sobel filter**.
- **Non-Linear Filter**: Operasi yang tidak dapat direpresentasikan sebagai kombinasi linier. Contoh utama adalah **Median Filter**, yang mengurutkan seluruh nilai intensitas dalam jendela $K \times K$ secara menaik lalu memilih elemen nilai tengah (*order-statistic* ke-$\lfloor K^2 / 2 \rfloor$). Median filter sangat unggul menumpas derau impuls (*salt-and-pepper noise*) tanpa mengaburkan ketajaman tepi objek.

### 4.3 Efek Ukuran Kernel & Penajaman Citra (*Sharpening*)

- **Pengaruh Ukuran Kernel ($K$)**: Memperbesar ukuran kernel ($3 \times 3 \to 5 \times 5 \to 9 \times 9$) memperluas bidang perataan (*receptive field*), menghasilkan efek pengaburan lebih kuat sekaligus meningkatkan kompleksitas waktu $\mathcal{O}(K^2)$.
- **Spatial Sharpening (Laplacian & Unsharp Masking)**: Untuk menonjolkan tepi dan detail halus, digunakan kernel Laplacian simetris atau *unsharp masking* $g(x,y) = f(x,y) + k \cdot (f(x,y) - f_{\text{smooth}}(x,y))$.

---

## 5. Mathematical Foundations

### 5.1 Korelasi Spasial 2D (*Spatial Correlation*)

Secara matematis, operasi korelasi antara citra $f(x,y)$ berukuran $M \times N$ dengan kernel filter $w(s,t)$ berukuran $m \times n$ (dengan $a = (m-1)/2$ dan $b = (n-1)/2$) didefinisikan sebagai:

$$(f \circ w)(x, y) = \sum_{s=-a}^{a} \sum_{t=-b}^{b} w(s, t) \, f(x + s, \, y + t)$$

Pada korelasi spasial, kernel digeser secara langsung di atas citra tanpa mengalami rotasi.

### 5.2 Konvolusi Spasial 2D (*Spatial Convolution*)

Konvolusi spasial merupakan landasan operasi Linear Time-Invariant (LTI) system. Formulasi konvolusi diskrit 2D didefinisikan sebagai:

$$(f * w)(x, y) = \sum_{s=-a}^{a} \sum_{t=-b}^{b} w(s, t) \, f(x - s, \, y - t)$$

Perhatikan tanda negatif pada koordinat $f(x-s, y-t)$. Secara geometris, ini setara dengan **memutar (*flipping*) kernel sebesar $180^\circ$** (dicerminkan secara horizontal kemudian vertikal) sebelum melakukan operasi perkalian titik (*dot product*) dan penjumlahan.

> **Catatan Akademik Penting**:  
> Jika kernel filter bersifat simetris terhadap titik pusatnya (seperti kernel Gaussian, Mean, atau Laplacian standar), maka:
> $$w(-s, -t) = w(s, t)$$
> Sehingga hasil operasi **konvolusi** dan **korelasi** adalah **identik**. Pustaka seperti OpenCV `cv2.filter2D` mengimplementasikan korelasi secara komputasional demi efisiensi.

### 5.3 Normalisasi Kernel

Untuk filter pelembut (*smoothing filter*), jumlah total seluruh elemen bobot kernel harus sama dengan 1:

$$\sum_{s=-a}^{a} \sum_{t=-b}^{b} w(s, t) = 1$$

Hal ini menjamin bahwa intensitas rata-rata citra tidak berubah (tidak menjadi lebih terang atau lebih gelap secara artifisial). Jika jumlah bobot bernilai 0 (seperti pada kernel pendeteksi tepi Sobel atau Laplacian), filter akan merespons perubahan gradien dan menghasilkan nilai nol pada area homogen.

### 5.4 Formulasi Kernel Gaussian 2D

Distribusi normal multivariat isotropik 2D tanpa korelasi antardimensi dinyatakan oleh:

$$G(x, y) = \frac{1}{2\pi \sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)$$

Di mana:
- $\sigma$ (sigma) adalah standar deviasi distribusi Gaussian yang mengontrol tingkat pengaburan (*blur radius*).
- $x$ dan $y$ adalah jarak koordinat relatif terhadap titik pusat kernel.

![Distribusi Gaussian 2D dan Separabilitas](/media/diagrams/chapter-10-gaussian-kernel.svg)
*Gambar 10.2 — Kurva lonceng Gaussian 2D kontinu dan dekomposisi kernel separabel 1D horizontal & vertikal.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 5.5 Sifat Separabilitas (*Separability Property*)

Fungsi eksponensial Gaussian memiliki sifat faktorisasi analitis:

$$G(x, y) = \left[ \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{x^2}{2\sigma^2}\right) \right] \cdot \left[ \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{y^2}{2\sigma^2}\right) \right] = G_{1D}(x) \cdot G_{1D}(y)$$

**Analisis Kompleksitas Komputasi**:
- Konvolusi 2D langsung berukuran $K \times K$ pada citra $M \times N$ membutuhkan:
  $$\mathcal{O}(K^2 \cdot M \cdot N) \text{ operasi perkalian dan penjumlahan}$$
- Dengan memanfaatkan separabilitas, kita menerapkan filter 1D horizontal berukuran $1 \times K$ lalu dilanjutkan filter 1D vertikal $K \times 1$:
  $$\mathcal{O}(2K \cdot M \cdot N) \text{ operasi}$$
- Rasio efisiensi kecepatan (*speedup ratio*) adalah:
  $$\text{Speedup} = \frac{K^2}{2K} = \frac{K}{2}$$
  Untuk kernel $15 \times 15$, pendekatan separabel berjalan **$7.5 \times$ lebih cepat**!

---

## 6. Boundary Handling & Padding Strategies

Saat jendela kernel berada pada tepi citra, sebagian elemen kernel akan jatuh di luar batas matriks koordinat $(0 \le x < W, 0 \le y < H)$. Tiga strategi utama penanganan batas adalah:

![Strategi Penanganan Batas Citra](/media/diagrams/chapter-10-padding-strategies.svg)
*Gambar 10.3 — Visualisasi metode Zero Padding, Replicate Padding, dan Reflect Padding.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

1. **Zero Padding (`cv2.BORDER_CONSTANT`)**: Mengisi area luar citra dengan nilai konstanta 0 (hitam). Menghasilkan artifak garis gelap di sekeliling batas citra pada operasi smoothing.
2. **Replicate (`cv2.BORDER_REPLICATE`)**: Menduplikasi nilai intensitas dari piksel baris atau kolom terluar.
3. **Reflect (`cv2.BORDER_REFLECT`)**: Mencerminkan piksel di sekitar perbatasan. Sangat disarankan untuk spatial filtering karena meminimalkan diskontinuitas nilai intensitas.

---

## 7. Worked Mathematical Example

Mari kita hitung satu langkah komputasi secara manual untuk memahami mekanisme konvolusi.

Diberikan sub-matriks citra $3 \times 3$:
$$F = \begin{bmatrix} 120 & 140 & 150 \\ 110 & 130 & 160 \\ 100 & 120 & 140 \end{bmatrix}$$

Dan kernel Gaussian aproksimasi integer:
$$W = \frac{1}{16} \begin{bmatrix} 1 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 1 \end{bmatrix}$$

Nilai piksel tengah hasil filtering $g(x,y)$ dihitung sebagai perkalian *element-wise* antara $F$ dan $W$:

$$\begin{aligned}
g(x,y) &= \frac{1}{16} [ (120 \times 1) + (140 \times 2) + (150 \times 1) \\
&\quad + (110 \times 2) + (130 \times 4) + (160 \times 2) \\
&\quad + (100 \times 1) + (120 \times 2) + (140 \times 1) ] \\
&= \frac{1}{16} [ 120 + 280 + 150 + 220 + 520 + 320 + 100 + 240 + 140 ] \\
&= \frac{1}{16} [ 2090 ] = 130.625 \approx 131
\end{aligned}$$

Nilai piksel tengah yang awalnya $130$ mengalami penyesuaian menjadi $131$, merefleksikan nilai rata-rata terbobot dari tetangganya.

---

## 8. Python Implementation

Berikut adalah contoh kode implementasi konvolusi 2D mandiri menggunakan NumPy serta komparasi dengan fungsi OpenCV.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 10: Spatial Filtering & Convolution Implementation
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def manual_convolution_2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """
    Melakukan 2D spatial convolution dari nol menggunakan NumPy.
    Menerapkan rotasi kernel 180 derajat dan reflect padding.
    """
    # 1. Pastikan citra berdimensi 2D (grayscale)
    if image.ndim != 2:
        raise ValueError("Fungsi ini membutuhkan citra grayscale 2D.")
        
    img_h, img_w = image.shape
    k_h, k_w = kernel.shape
    
    # 2. Putar kernel 180 derajat untuk konvolusi analitik sejati
    kernel_flipped = np.flipud(np.fliplr(kernel))
    
    # 3. Hitung dimensi padding
    pad_h = k_h // 2
    pad_w = k_w // 2
    
    # 4. Terapkan symmetric reflect padding
    padded_img = np.pad(image, ((pad_h, pad_h), (pad_w, pad_w)), mode='reflect').astype(np.float64)
    output = np.zeros_like(image, dtype=np.float64)
    
    # 5. Sliding window loop
    for i in range(img_h):
        for j in range(img_w):
            region = padded_img[i : i + k_h, j : j + k_w]
            output[i, j] = np.sum(region * kernel_flipped)
            
    # 6. Clip nilai ke rentang valid [0, 255] dan konversi kembali ke uint8
    return np.clip(output, 0, 255).astype(np.uint8)

def generate_gaussian_kernel(ksize: int, sigma: float) -> np.ndarray:
    """Membuat 2D Gaussian kernel ternormalisasi."""
    ax = np.linspace(-(ksize // 2), ksize // 2, ksize)
    xx, yy = np.meshgrid(ax, ax)
    kernel = np.exp(-(xx**2 + yy**2) / (2.0 * sigma**2))
    return kernel / np.sum(kernel)

if __name__ == "__main__":
    # Buat citra uji sintetis dengan noise
    np.random.seed(42)
    synthetic_image = (np.ones((100, 100)) * 128).astype(np.uint8)
    noise = np.random.normal(0, 20, (100, 100))
    noisy_image = np.clip(synthetic_image + noise, 0, 255).astype(np.uint8)

    # Buat Gaussian kernel 5x5 dengan sigma = 1.0
    kernel_5x5 = generate_gaussian_kernel(5, 1.0)

    # Jalankan implementasi manual
    filtered_manual = manual_convolution_2d(noisy_image, kernel_5x5)

    # Jalankan implementasi OpenCV
    filtered_opencv = cv2.filter2D(noisy_image, -1, kernel_5x5, borderType=cv2.BORDER_REFLECT)

    # Validasi kesamaan numerik (Mean Absolute Difference)
    diff = np.mean(np.abs(filtered_manual.astype(float) - filtered_opencv.astype(float)))
    print(f"Mean Absolute Difference antara NumPy vs OpenCV: {diff:.4f}")
    assert diff < 1.0, "Hasil konvolusi NumPy konsisten dengan OpenCV."
    print("Implementasi konvolusi 2D tervalidasi dengan sukses!")
```

---

## 9. Interactive Gaussian & Spatial Filtering Lab

Pada platform ini, Anda dapat bereksperimen langsung melalui **Interactive Spatial Filtering &amp; Convolution Lab** (Tab **Laboratorium &amp; Python**) dengan mengunggah citra maupun memakai pola sintetis:
- Pilih mode penapis: **Gaussian Blur**, **Box Mean Filter**, **Median Filter (Non-Linear)**, **Laplacian Sharpening**, atau **Sobel**.
- Ubah parameter ukuran jendela ($3\times 3, 5\times 5, 7\times 7$), standar deviasi $\sigma$, serta strategi penanganan batas (**Reflect**, **Replicate**, atau **Zero Padding**) untuk mengamati perbedaan di tepi citra dan mengunduh hasil PNG-nya.

Aturan praktis pemilihan ukuran kernel (*rule of thumb*):
$$k \ge 2 \lceil 3\sigma \rceil + 1$$
Karena $99.7\%$ energi distribusi normal berada di dalam rentang $\pm 3\sigma$, memilih ukuran kernel minimal $6\sigma$ mencegah terpotongnya ekor distribusi Gaussian (*truncation artifact*).

---

## 10. Experiments, Analysis &amp; Troubleshooting

### Eksperimen Terstruktur
1. **Perbandingan Border Padding**: Uji *Zero Padding* vs *Reflect Padding* pada Gaussian $7\times 7$. Amati bingkai hitam tipis pada tepi terluar jika menggunakan *Zero Padding*.
2. **Evaluasi Median vs Gaussian pada Salt-and-Pepper Noise**: Bandingkan kemampuan penghapusan piksel ekstrem $0/255$ antara Gaussian blur (cenderung meninggalkan bercak abu-abu) dengan Median $3\times 3$.
3. **Common Python Errors &amp; Troubleshooting**:
   - *Kesalahan `uint8` overflow saat Laplacian sharpening*: selalu ubah ke `np.float32` atau gunakan `cv2.CV_64F` sebelum mengaplikasikan `np.clip(..., 0, 255).astype(np.uint8)`.
   - *Ukuran kernel genap pada `cv2.GaussianBlur`*: OpenCV mewajibkan dimensi kernel positif ganjil (`(3, 3)`, `(5, 5)`).

---

## 11. Mini Project — Pipeline Penajaman &amp; Pembersihan Dokumen Terpindai

Bangun skrip Python mandiri yang menerima citra halaman dokumen berderau (*synthetic salt-and-pepper + blur*):
1. Terapkan Median Filter $3\times 3$ untuk membersihkan bintik debu impuls tanpa melunturkan tepi huruf.
2. Terapkan teknik **Unsharp Masking** berbobot $k = 1.4$ menggunakan Gaussian kernel separabel $\sigma = 1.0$.
3. Bandingkan ketajaman tepi teks (*edge contrast*) sebelum dan sesudah proses, serta simpan citra hasil dalam format lossless PNG.

---

## 12. Summary &amp; Presentation Slides

Gunakan tab **Presentasi Slide** untuk menelaah 10 slide materi kuliah Chapter 10 yang dilengkapi catatan presenter.

1. **Spatial filtering** memproses nilai piksel baru berdasarkan operasi kombinasi piksel-piksel pada area ketetanggaan spasial berukuran $m \times n$.
2. **Korelasi** menggeser kernel secara langsung, sedangkan **konvolusi** memutar kernel $180^\circ$ sebelum operasi dot product. Untuk kernel simetris, korelasi dan konvolusi ekuivalen.
3. Normalisasi bobot kernel menjamin kestabilan intensitas rata-rata citra tanpa menimbulkan artifak pencahayaan.
4. **Gaussian filter** adalah filter linier isotropik yang bersifat **separabel**, memungkinkan dekomposisi komputasi menjadi dua penapis 1D dengan akselerasi $\mathcal{O}(2K)$ dibanding $\mathcal{O}(K^2)$.
5. **Median filter** merupakan operasi non-linier berbasis peringkat yang sangat efektif mengatasi *impulse noise* dengan tetap mempertahankan tepi tajam.
6. Pemilihan metode padding seperti **reflect padding** penting untuk mempertahankan kualitas tepi citra tanpa memperkenalkan distorsi artifak hitam seperti pada zero padding.

---

## 13. References &amp; Academic Citations

1. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson. Chapter 3: Spatial Filtering.
2. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Chapter 3: Image Processing.
3. **OpenCV Documentation**. (2024). *Image Filtering: Making your own linear filters with filter2D*. Official OpenCV Reference.
4. **Jain, A. K.** (1989). *Fundamentals of Digital Image Processing*. Prentice Hall.
