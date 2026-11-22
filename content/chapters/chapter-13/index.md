# Chapter 13 — Edge Detection & Classical Feature Extraction

> **Bagian Kurikulum**: Section 03 — Advanced Digital Image Processing  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 10 (Spatial Filtering & Convolution)  
> **Learning Tracks**: Digital Image Processing, Computer Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Tepi objek (*edges*) dan titik sudut (*corners*) merupakan fitur struktural paling informatif dalam sebuah citra digital: tepi menandai batas pemisah antara objek dengan latar belakang atau perubahan kedalaman dan permukaan, sedangkan sudut menjadi titik jangkar (*keypoints*) yang unik untuk pencocokan citra panorama dan estimasi gerak.

Bab ini menguraikan landasan kalkulus diferensial diskrit citra (**Image Gradients**), operator turunan pertama **Prewitt** dan **Sobel**, operator turunan kedua **Laplacian**, arsitektur detektor tepi standar emas **Canny Edge Detector** (4 tahap: Gaussian smoothing, Sobel gradient, *Non-Maximum Suppression*, *Hysteresis Thresholding*), **Harris Corner Detector**, serta pengantar deskriptor fitur klasik.

---

## 2. Learning Objectives

1. **Merumuskan** aproksimasi turunan spasial orde pertama ($I_x, I_y$) dan orde kedua ($\nabla^2 I$) pada citra diskrit 2D.
2. **Membedakan** karakteristik kernel **Prewitt**, **Sobel** (terbobot terhadap derau), dan **Laplacian** (isotropik namun sensitif noise).
3. **Menguraikan** seluruh 4 tahapan algoritma **Canny Edge Detector** termasuk logika *Non-Maximum Suppression* dan *Double Threshold Hysteresis*.
4. **Menganalisis** matriks struktur tensor gradien ($M$) dan nilai eigen ($\lambda_1, \lambda_2$) pada **Harris Corner Detector** untuk membedakan area datar, tepi, dan sudut.
5. **Mengimplementasikan** `cv2.Sobel`, `cv2.Laplacian`, `cv2.Canny`, dan `cv2.cornerHarris` secara benar serta mengevaluasi hasil deteksi fiturnya.

---

## 3. Prerequisites

- Konvolusi spasial 2D dan operator penapisan Gaussian [Chapter 10].
- Operasi tipe data bertanda (`float32` / `CV_64F`) agar gradien negatif tidak terpotong menjadi 0 [Chapter 05].

---

## 4. Fundamental Concepts

### 4.1 Gradien Citra: Sobel, Prewitt & Laplacian
- **Turunan Orde Pertama ($\nabla f = [G_x, G_y]^T$)**: Tepi sejajar dengan puncak maksimum lokal nilai besaran gradien $|\nabla f| = \sqrt{G_x^2 + G_y^2}$.
  - **Prewitt**: Memberi bobot seragam $[1, 1, 1]$ tegak lurus arah turunan.
  - **Sobel**: Memberi bobot Gaussian $[1, 2, 1]$ di baris/kolom tengah sehingga lebih kebal terhadap *noise* dibanding Prewitt.
- **Turunan Orde Kedua (Laplacian)**: Menemukan titik perubahan kemiringan tercuram melalui *zero-crossings*. Sangat peka terhadap derau sehingga biasanya didahului smoothing Gaussian (*Laplacian of Gaussian / LoG*).

### 4.2 Canny Edge Detection Pipeline

![Pipeline Canny Edge Detector](/media/diagrams/chapter-13-canny-pipeline.svg)
*Gambar 13.1 — Empat tahap algoritma Canny: Gaussian smoothing, magnitudo/arah gradien Sobel, Non-Maximum Suppression (penipisan tepi 1 piksel), dan Hysteresis Thresholding.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

John Canny (1986) merancang detektor tepi optimal berdasarkan tiga kriteria: *good detection* (tidak melewatkan tepi asli), *good localization* (tepi sedekat mungkin dengan lokasi sebenarnya), dan *single response* (hanya satu garis tipis 1 piksel per tepi).

### 4.3 Harris Corner Detector & Classical Feature Descriptors

![Klasifikasi Eigenvalue Harris Corner](/media/diagrams/chapter-13-harris-corners.svg)
*Gambar 13.2 — Klasifikasi region citra berdasarkan nilai eigen λ₁, λ₂ dari structure tensor M: Flat, Edge (R < 0), dan Corner (R ≫ 0).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

Sebuah garis tepi tetap ambigu bila digeser sepanjang arah garis tepi itu sendiri (*aperture problem*). **Sudut (*corner*)** didefinisikan sebagai titik di mana perubahan intensitas bernilai besar ke **segala arah ortogonal**. Konsep inilah yang menjadi cikal bakal deskriptor fitur lokal seperti HOG, SIFT, dan ORB yang akan dipelajari mendalam pada Section 08 (Chapter 37).

---

## 5. Mathematical Foundations

### 5.1 Kernel Gradien Sobel & Laplacian

$$G_x = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix} * f, \qquad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1 \end{bmatrix} * f$$

$$\text{Magnitude } M(x, y) = \sqrt{G_x^2 + G_y^2}, \qquad \text{Orientasi } \theta(x, y) = \operatorname{atan2}(G_y, G_x)$$

$$\text{Laplacian } \nabla^2 f \approx \begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix} * f$$

### 5.2 Structure Tensor & Respons Sudut Harris (1988)

Untuk jendela ketetanggaan berbobot $w(x, y)$:

$$M = \sum_{(x, y) \in W} w(x, y) \begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix}$$

Skor respons sudut Harris $R$ (dengan konstanta empiris $k \in [0.04, 0.06]$) dihitung tanpa dekomposisi nilai eigen eksplisit:

$$R = \det(M) - k \cdot [\operatorname{trace}(M)]^2 = \lambda_1 \lambda_2 - k(\lambda_1 + \lambda_2)^2$$
- $|R|$ kecil $\implies$ daerah datar (*flat*).
- $R < 0$ $\implies$ garis tepi (*edge*).
- $R \gg 0$ $\implies$ titik sudut (*corner*).

---

## 6. Worked Numerical Example

**Soal**: Diberikan hasil gradien lokal di sekitar sebuah piksel dalam jendela $W$ yang menghasilkan matriks tensor struktur ternormalisasi:
$$M = \begin{bmatrix} 100 & 0 \\ 0 & 80 \end{bmatrix}$$
Hitung nilai respons Harris $R$ menggunakan parameter standar $k = 0.04$, lalu tentukan klasifikasi region tersebut!

**Penyelesaian**:
1. Hitung determinan dan *trace* matriks $M$:
   $$\det(M) = (100 \times 80) - 0^2 = 8000$$
   $$\operatorname{trace}(M) = 100 + 80 = 180$$
2. Hitung skor respons Harris $R$:
   $$R = \det(M) - k \cdot (\operatorname{trace}(M))^2 = 8000 - 0.04 \times (180)^2$$
   $$R = 8000 - 0.04 \times 32400 = 8000 - 1296 = \mathbf{+6704}$$
3. Karena $R = +6704 \gg 0$ (kedua nilai eigen $\lambda_1=100, \lambda_2=80$ sama-sama besar), titik tersebut diklasifikasikan sebagai **Sudut (*Corner*) yang sangat kuat**!

*(Bandingkan jika $M = \begin{bmatrix} 100 & 0 \\ 0 & 1 \end{bmatrix}$, maka $R = 100 - 0.04(101)^2 = 100 - 408.04 = \mathbf{-308.04} < 0 \implies$ **Tepi (*Edge*)**!).*

---

## 7. Algorithm Pseudocode: Canny Non-Maximum Suppression & Hysteresis

```text
ALGORITHM CannyStep3And4(Mag, AngleDeg, T_low, T_high)
INPUT:
    Mag, AngleDeg : Matriks magnitudo dan arah gradien (0..180 deg)
    T_low, T_high : Ambang bawah dan atas hysteresis
OUTPUT:
    Edges : Masker tepi tipis 1 piksel (0 / 255)

BEGIN
    // Step 3: Non-Maximum Suppression (penipisan punggungan gradien)
    FOR each interior pixel (y, x) DO
        Quantize AngleDeg[y, x] into nearest {0, 45, 90, 135} direction
        (p, r) <- Two opposite neighbor magnitudes along that gradient angle
        IF Mag[y, x] >= p AND Mag[y, x] >= r THEN
            NMS[y, x] <- Mag[y, x]
        ELSE
            NMS[y, x] <- 0
        END IF
    END FOR

    // Step 4: Hysteresis Linking
    Mark pixels with NMS >= T_high as STRONG (255) and push to Queue
    Mark pixels with T_low <= NMS < T_high as WEAK
    WHILE Queue not empty DO
        cur <- Pop(Queue)
        FOR each 8-neighbor nb of cur DO
            IF nb is WEAK THEN
                Mark nb as STRONG (255) and push nb to Queue
            END IF
        END FOR
    END WHILE
    Set all remaining non-STRONG pixels to 0
    RETURN Edges
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat & Jebakan Tipe Data
- Instalasi: `pip install numpy opencv-python-headless`
- **Jebakan Klasik Sobel/Laplacian**: Memakai `ddepth=cv2.CV_8U` akan membuang seluruh turunan negatif (transisi terang-ke-gelap) menjadi $0$! Selalu hitung dengan `cv2.CV_64F` lalu ambil `np.abs` atau `cv2.magnitude`.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 13: Sobel, Canny Edge Detection & Harris Corner Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def create_geometric_features_scene(size: int = 160) -> np.ndarray:
    img = np.full((size, size), 30, dtype=np.uint8)
    # Persegi empat (4 sudut jelas + 4 sisi tepi)
    cv2.rectangle(img, (30, 30), (90, 90), 220, -1)
    # Segitiga (3 sudut)
    pts = np.array([[120, 40], [145, 115], [95, 115]], dtype=np.int32)
    cv2.fillPoly(img, [pts], 200)
    return img

if __name__ == "__main__":
    gray = create_geometric_features_scene(160)

    # 1. Gradien Sobel presisi float64
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.clip(np.hypot(gx, gy), 0, 255).astype(np.uint8)

    # 2. Canny Edge Detector
    edges = cv2.Canny(gray, threshold1=50, threshold2=150)

    # 3. Harris Corner Detector
    harris_resp = cv2.cornerHarris(gray.astype(np.float32), blockSize=3, ksize=3, k=0.04)
    corner_mask = harris_resp > (0.05 * harris_resp.max())
    # Hitung klaster sudut menggunakan connected components
    num_labels, _ = cv2.connectedComponents(corner_mask.astype(np.uint8))
    num_corners = num_labels - 1

    print(f"Piksel Tepi Canny Aktif : {int(np.sum(edges == 255))} piksel")
    print(f"Klaster Sudut Harris    : {num_corners} sudut terdeteksi (4 persegi + 3 segitiga = 7)")

    assert sobel_mag[60, 30] > 100, "Tepi vertikal kiri persegi harus terdeteksi Sobel!"
    assert num_corners >= 7, "Minimal 7 sudut geometris harus terdeteksi!"
    print("Verifikasi Chapter 13 Edge & Harris BERHASIL!")
```

---

## 9. Interactive Lab — Edge & Feature Explorer

Buka tab **Laboratorium & Python** dan gunakan **Edge & Feature Explorer**:
- Bandingkan secara instan respons **Canny Edge Detector**, **Sobel**, **Prewitt**, **Laplacian**, dan **Harris Corner Detector**.
- Geser *slider* **Gaussian $\sigma$**, **Low Threshold**, dan **High Threshold** Canny untuk mengamati bagaimana ambang ganda menyaring tepi lemah yang terputus namun tetap mempertahankan kontur utama yang menyambung.
- Aktifkan mode **Harris Corner** dan lihat titik penanda kuning-merah menempel akurat di setiap sudut objek!

---

## 10. Experiments & Analysis

1. **Rasio Threshold Canny (1:2 hingga 1:3)**: Sesuai rekomendasi John Canny (1986), atur `Low Threshold = 40` dan `High Threshold = 100`. Amati apa yang terjadi jika `High Threshold` diturunkan terlalu rendah (`30`): banyak tekstur latar lemah berubah menjadi tepi berisik.
2. **Evaluasi Sobel vs Laplacian pada Noise**: Laplacian menggunakan turunan kedua sehingga lebih tipis di tepi namun sangat sensitif terhadap bintik kecil dibandingkan Canny yang didahului oleh Gaussian smoothing.

---

## 11. Mini Project — Auto-Canny & Visual Feature Overlay

Implementasikan metode **Median-Adaptive Auto-Canny** dalam Python tanpa memilih ambang manual:
1. Hitung nilai median intensitas citra $v = \text{np.median}(\text{gray})$.
2. Tetapkan otomatis $\sigma_{\text{canny}} = 0.33$, $T_{\text{low}} = \max(0, (1 - 0.33) \cdot v)$, $T_{\text{high}} = \min(255, (1 + 0.33) \cdot v)$.
3. Gabungkan tepi hijau (`[0, 255, 0]`) dan titik sudut Harris merah (`[255, 0, 0]`) di atas citra asli dan bandingkan kestabilannya pada gambar gelap vs terang!

---

## 12. Summary & Presentation Slides

Akses tab **Presentasi Slide** untuk 10 slide materi kuliah dan catatan dosen.

1. Gradien citra orde-1 (**Sobel/Prewitt**) mendeteksi tepi sebagai puncak lokal; orde-2 (**Laplacian**) mendeteksi sebagai *zero-crossing*.
2. **Canny Edge Detector** menghasilkan tepi tipis 1 piksel yang kontinu melalui *Non-Maximum Suppression* dan *Hysteresis*.
3. **Harris Corner Detector** memakai determinan dan *trace* matriks struktur gradien untuk mengisolasi titik sudut unik $R \gg 0$.

---

## 13. Verified Academic References

1. **Canny, J.** (1986). *A Computational Approach to Edge Detection*. IEEE Transactions on Pattern Analysis and Machine Intelligence, PAMI-8(6), 679–698.
2. **Harris, C., & Stephens, M.** (1988). *A Combined Corner and Edge Detector*. Proceedings of the 4th Alvey Vision Conference, pp. 147–151.
3. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 10 (Section 10.2): Edge Detection.
4. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Section 7.1–7.2: Points, Corners & Edges.

