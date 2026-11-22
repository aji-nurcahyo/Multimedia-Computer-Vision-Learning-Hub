# Chapter 15 — Image Segmentation & Object Analysis

> **Bagian Kurikulum**: Section 03 — Advanced Digital Image Processing  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 09 (Histogram Processing), Chapter 14 (Morphological Image Processing)  
> **Learning Tracks**: Digital Image Processing, Computer Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Jika bab-bab sebelumnya berfokus pada peningkatan mutu citra (*enhancement*), pemulihan (*restoration*), atau ekstraksi garis tepi, maka **Image Segmentation** menandai transisi krusial dari pemrosesan citra tingkat piksel menuju pemahaman tingkat objek (*object-level analysis*). Segmentasi mempartisi citra $f(x, y)$ menjadi beberapa wilayah bermakna (*regions*) sehingga sistem dapat menghitung jumlah sel darah, mengukur luas cacat pengelasan, menghitung ukuran partikel, atau mengisolasi rambu lalu lintas sebelum diklasifikasi oleh model AI.

Bab ini membahas teori fundamental partisi segmentasi, teknik **Global Thresholding**, **Adaptive Thresholding** untuk pencahayaan tak seragam, derivasi matematis **Otsu Optimal Thresholding** ($\arg\max \sigma_B^2$), segmentasi berbasis region dan **Watershed Segmentation** untuk memisahkan objek yang bersentuhan, pelabelan **Connected Components**, ekstraksi **Contours**, perhitungan metrik morfometri objek (*Area, Centroid, Bounding Box, Perimeter, Circularity*), serta metrik evaluasi segmentasi (**IoU / Jaccard Index** dan **Dice Score**).

---

## 2. Learning Objectives

1. **Merumuskan** kondisi formal partisi segmentasi citra dan membedakan segmentasi berbasis ambang (*thresholding*) vs berbasis wilayah (*region/watershed*).
2. **Membuktikan** rumus pencarian ambang optimal **Metode Otsu (1979)** dengan memaksimalkan variansi antar-kelas (*between-class variance*).
3. **Menjelaskan** kapan **Adaptive Thresholding** lebih unggul dibanding Global/Otsu Thresholding dan bagaimana algoritma **Watershed** memisahkan objek yang saling bersentuhan.
4. **Mengimplementasikan** pelabelan komponen terhubung (`cv2.connectedComponentsWithStats`) serta ekstraksi kontur (`cv2.findContours`) untuk menghitung luas, keliling, *centroid*, dan kebulatan (*circularity*).
5. **Mengevaluasi** akurasi masker hasil segmentasi terhadap *ground truth* menggunakan metrik **IoU (*Intersection over Union*)** dan **Dice Similarity Coefficient**.

---

## 3. Prerequisites

- Histogram citra dan distribusi probabilitas piksel [Chapter 09].
- Pembersihan masker biner dan *distance transform* morfologi [Chapter 14].

---

## 4. Fundamental Concepts

### 4.1 Global, Adaptive, dan Otsu Thresholding

![Metode Otsu Thresholding](/media/diagrams/chapter-15-otsu-thresholding.svg)
*Gambar 15.1 — Metode Otsu mencari ambang T* yang memaksimalkan separabilitas variansi antar-kelas antara distribusi Background dan Foreground.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **Global Thresholding**: Membandingkan seluruh piksel terhadap satu ambang tetap $T$: $g(x,y) = 255$ jika $f(x,y) > T$, else $0$. Cepat, namun gagal apabila terdapat gradien bayangan kuat.
- **Adaptive Thresholding**: Menghitung ambang lokal $T(x, y) = \mu_{\text{block}}(x, y) - C$ pada setiap jendela kecil di sekitar $(x, y)$ (dengan akselerasi **Integral Image**). Sangat efektif untuk foto dokumen kertas bernoda bayangan.
- **Otsu Thresholding (Nobuyuki Otsu, 1979)**: Secara otomatis memindai seluruh kandidat $t \in [0..255]$ dan memilih $T^*$ yang menghasilkan pemisahan statistik antar-kelas paling tinggi pada histogram bimodal.

### 4.2 Region-Based & Watershed Segmentation

![Connected Components, Watershed dan Metrik Evaluasi](/media/diagrams/chapter-15-connected-components.svg)
*Gambar 15.2 — Tiga komponen kunci analisis objek: Connected Components Labeling, pemisahan Watershed berbasis topografi, serta metrik evaluasi IoU & Dice.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **Region Growing**: Memulai dari titik benih (*seed pixels*) lalu memperluas wilayah ke piksel tetangga yang memenuhi kriteria homogenitas intensitas atau warna.
- **Watershed Segmentation**: Memperlakukan peta jarak (*Euclidean Distance Transform*) atau magnitudo gradien citra sebagai lanskap topografi 3D. Titik lembah dalam dijadikan sumber air (*markers*) yang perlahan digenangi air hingga garis batas pertemuan air antar-lembah membentuk tanggul pemisah (*watershed lines*) yang sangat akurat membelah koin atau sel yang saling menempel!

### 4.3 Connected Components, Contours & Object Measurements
Setelah masker biner terpisah rapi, **Connected Component Labeling (CCL)** memberikan ID unik ($1, 2, \dots, K$) kepada setiap kelompok piksel putih yang bertetangga (4-konektivitas atau 8-konektivitas), lalu mengukur properti fisik:
- **Area ($A$)**: Jumlah piksel pembentuk objek.
- **Centroid ($c_x, c_y$)**: Pusat massa geometris objek ($\bar{x}, \bar{y}$).
- **Bounding Box**: Persegi panjang terkecil pembatas $(x, y, w, h)$.
- **Perimeter ($P$) & Circularity**: Ukuran panjang tepi keliling kontur dan tingkat kemiripannya dengan lingkaran sempurna.

---

## 5. Mathematical Foundations

### 5.1 Formulasi Variansi Antar-Kelas Otsu
Diberikan probabilitas normalisasi histogram $p_i = n_i / (MN)$ untuk setiap intensitas $i \in [0, L-1]$. Untuk kandidat ambang $t$, bagi piksel menjadi kelas latar $C_0 = [0..t]$ dan objek $C_1 = [t+1..L-1]$:

$$\omega_0(t) = \sum_{i=0}^{t} p_i, \qquad \omega_1(t) = 1 - \omega_0(t)$$

$$\mu_0(t) = \frac{1}{\omega_0(t)} \sum_{i=0}^{t} i \cdot p_i, \qquad \mu_1(t) = \frac{1}{\omega_1(t)} \sum_{i=t+1}^{L-1} i \cdot p_i$$

Variansi antar-kelas (*Between-Class Variance*) $\sigma_B^2(t)$ didefinisikan sebagai:

$$\sigma_B^2(t) = \omega_0(t) \, \omega_1(t) \, \big[\mu_0(t) - \mu_1(t)\big]^2$$

Ambang batas optimal Otsu adalah:
$$T^* = \arg\max_{0 \le t < L} \sigma_B^2(t)$$

### 5.2 Morfometri Kebulatan (*Circularity*) & Metrik Evaluasi (IoU & Dice)
- **Circularity** (bernilai $1.0$ untuk lingkaran sempurna dan $\approx 0.785$ untuk bujur sangkar):
  $$C = \frac{4\pi \cdot \text{Area}}{\text{Perimeter}^2}$$
- **Intersection over Union (IoU / Jaccard Index)** membandingkan masker prediksi $P$ vs kebenaran dasar (*ground truth*) $G$:
  $$\text{IoU}(P, G) = \frac{|P \cap G|}{|P \cup G|} = \frac{\text{TP}}{\text{TP} + \text{FP} + \text{FN}}$$
- **Dice Similarity Coefficient (F1-Score piksel)**:
  $$\text{Dice}(P, G) = \frac{2 |P \cap G|}{|P| + |G|} = \frac{2\,\text{TP}}{2\,\text{TP} + \text{FP} + \text{FN}}$$

---

## 6. Worked Numerical Example

**Soal 1 (Otsu Variance)**: Sebuah histogram citra sangat sederhana hanya memiliki dua kelompok piksel: $60\%$ piksel latar berintensitas $40$ ($\omega_0 = 0.6, \mu_0 = 40$), dan $40\%$ piksel objek berintensitas $200$ ($\omega_1 = 0.4, \mu_1 = 200$). Hitung nilai variansi antar-kelas $\sigma_B^2$ untuk ambang pemisah di antara kedua kelompok!
$$\sigma_B^2 = 0.6 \times 0.4 \times (40 - 200)^2 = 0.24 \times (-160)^2 = 0.24 \times 25600 = \mathbf{6144.0}$$

**Soal 2 (Evaluasi IoU & Dice)**: Sebuah masker prediksi memiliki $\text{TP} = 80$ piksel benar, $\text{FP} = 20$ piksel salah prediksi positif, dan $\text{FN} = 20$ piksel objek yang terlewat. Hitung **IoU** dan **Dice Score**!
- $\text{IoU} = \frac{80}{80 + 20 + 20} = \frac{80}{120} = \mathbf{0.667}$ ($66.7\%$).
- $\text{Dice} = \frac{2(80)}{2(80) + 20 + 20} = \frac{160}{200} = \mathbf{0.800}$ ($80.0\%$).

---

## 7. Algorithm Pseudocode: Connected Components & Stats Extraction

```text
ALGORITHM ConnectedComponentsAndStats(BinaryMask, min_area)
INPUT:
    BinaryMask : Matriks {0, 255} H x W
    min_area   : Batas minimum luas piksel objek valid
OUTPUT:
    ObjectList : Daftar statistik {id, area, centroid, bbox}

BEGIN
    Initialize Labels[H, W] <- 0; next_id <- 1; ObjectList <- []
    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            IF BinaryMask[y, x] == 255 AND Labels[y, x] == 0 THEN
                queue <- [(y, x)]; Labels[y, x] <- next_id
                Accumulate area, sum_x, sum_y, min_x, max_x, min_y, max_y via BFS 4/8-neighbors
                IF area >= min_area THEN
                    Append {id, area, cx = sum_x/area, cy = sum_y/area, bbox} to ObjectList
                    next_id <- next_id + 1
                END IF
            END IF
        END FOR
    END FOR
    RETURN ObjectList
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat & Catatan
- Instalasi: `pip install numpy opencv-python-headless`
- Menggunakan `cv2.threshold(..., cv2.THRESH_OTSU)`, `cv2.connectedComponentsWithStats`, dan `cv2.findContours` pada citra sintetis multi-objek yang deterministik.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 15: Otsu Segmentation, Connected Components & Object Analysis
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def create_objects_scene(size: int = 200) -> tuple[np.ndarray, np.ndarray]:
    gray = np.full((size, size), 35, dtype=np.uint8)
    gt_mask = np.zeros((size, size), dtype=np.uint8)

    # Objek 1: Lingkaran besar
    cv2.circle(gray, (60, 65), 28, 210, -1)
    cv2.circle(gt_mask, (60, 65), 28, 255, -1)

    # Objek 2: Persegi panjang
    cv2.rectangle(gray, (120, 40), (175, 95), 215, -1)
    cv2.rectangle(gt_mask, (120, 40), (175, 95), 255, -1)

    # Objek 3: Elips
    cv2.ellipse(gray, (100, 150), (42, 18), 0, 0, 360, 205, -1)
    cv2.ellipse(gt_mask, (100, 150), (42, 18), 0, 0, 360, 255, -1)

    return gray, gt_mask

if __name__ == "__main__":
    gray, gt_mask = create_objects_scene(200)

    # 1. Otsu Automatic Thresholding
    t_otsu, pred_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    print(f"Ambang Otsu Terhitung: T* = {t_otsu:.1f}")

    # 2. Evaluasi IoU terhadap Ground Truth
    intersection = np.logical_and(pred_mask > 0, gt_mask > 0).sum()
    union = np.logical_or(pred_mask > 0, gt_mask > 0).sum()
    iou = float(intersection / union)
    print(f"Akurasi Segmentasi IoU: {iou:.4f}")
    assert iou > 0.99

    # 3. Connected Components With Stats
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(pred_mask)
    num_objects = num_labels - 1
    print(f"Jumlah Objek Terdeteksi: {num_objects}")
    assert num_objects == 3

    for obj_id in range(1, num_labels):
        area = int(stats[obj_id, cv2.CC_STAT_AREA])
        cx, cy = centroids[obj_id]
        print(f"  Objek #{obj_id}: Area={area} px, Centroid=({cx:.1f}, {cy:.1f})")

    print("Verifikasi Chapter 15 Segmentasi & Analisis Objek BERHASIL!")
```

---

## 9. Interactive Lab — Segmentation Lab

Pada tab **Laboratorium & Python**, jelajahi **Segmentation Lab**:
- Alihkan antara **Otsu Optimal Thresholding** (lihat nilai $T^*$ terhitung secara otomatis!), **Global Manual Thresholding**, dan **Adaptive Mean (Integral Image)**.
- Sesuaikan **Filter Area Minimum** untuk membuang noise speckles mikro, dan pantau perubahan langsung jumlah komponen pada **Connected Components Visualization** serta **Tabel Morfometri Objek** (ID, Area, Centroid $(x,y)$, Bounding Box, dan Circularity $4\pi A/P^2$)!

---

## 10. Experiments & Analysis

1. **Menyaring Noise dengan Area Minimum**: Pada citra default `objects` (mengandung dua titik noise $2\times 2$ piksel), atur `Filter Area Minimum = 5 px`, maka kedua noise ikut terhitung sebagai objek kecil. Naikkan menjadi `30 px` untuk menyaringnya sehingga tepat tersisa **4 objek utama**!
2. **Morfometri Circularity**: Bandingkan nilai *Circularity* pada tabel antara kedua objek lingkaran (Circularity $\approx 0.88 - 0.92$) vs persegi panjang vs elips lonjong (Circularity lebih rendah karena keliling lebih panjang dibanding luas).

---

## 11. Mini Project — Penghitung Sel & Pemisah Koin Bersentuhan (*Watershed*)

Bangun skrip Python lengkap untuk kasus objek yang saling berimpitan/menempel:
1. Buat citra sintetis dua lingkaran putih yang tumpang tindih sedikit di bagian pinggirnya (jika memakai CCL langsung, keduanya terhitung sebagai **1 objek**!).
2. Terapkan **Euclidean Distance Transform (`cv2.distanceTransform`)** pada masker biner.
3. Ambil puncak jarak lokal sebagai *sure foreground markers* dan jalankan **`cv2.watershed`** untuk membelah kedua lingkaran menjadi **2 label objek terpisah** secara tepat!

---

## 12. Summary & Presentation Slides

Akses tab **Presentasi Slide** untuk 10 slide materi kuliah penutup Section 03 ini.

1. **Otsu Thresholding** memilih ambang optimal otomatis berdasarkan maksimasi variansi antar-kelas $\sigma_B^2$.
2. **Adaptive Thresholding** mengatasi pencahayaan latar tidak seragam; **Watershed** memisahkan objek berimpitan.
3. **Connected Components & Contours** mengekstrak statistik geometris (Area, Centroid, Bounding Box, Circularity).
4. Kualitas masker segmentasi diukur secara kuantitatif terhadap *ground truth* menggunakan **IoU** dan **Dice Score**.

---

## 13. Verified Academic References

1. **Otsu, N.** (1979). *A Threshold Selection Method from Gray-Level Histograms*. IEEE Transactions on Systems, Man, and Cybernetics, 9(1), 62–66.
2. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 10 (Sections 10.3–10.5): Thresholding, Region-Based & Watershed Segmentation.
3. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Chapter 7.5: Segmentation.
4. **OpenCV Documentation**. (2024). *Image Segmentation with Distance Transform and Watershed Algorithm*. Official Reference.

