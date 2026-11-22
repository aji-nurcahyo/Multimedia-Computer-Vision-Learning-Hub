# Chapter 14 — Morphological Image Processing

> **Bagian Kurikulum**: Section 03 — Advanced Digital Image Processing  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 06 (Digital Image Fundamentals), Chapter 10 (Spatial Filtering)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Setelah proses binarisasi (*thresholding*) maupun deteksi tepi, masker objek yang dihasilkan hampir selalu memiliki ketidaksempurnaan struktural: terdapat titik bintik noise kecil di latar belakang (*false foreground speckles*), lubang-lubang kecil di dalam tubuh objek (*holes*), atau objek yang terputus akibat pencahayaan yang tidak merata. Berbeda dengan konvolusi aljabar linier yang berfokus pada nilai intensitas, **Morphological Image Processing** memproses **bentuk dan struktur geometri** komponen citra menggunakan landasan matematika **Teori Himpunan (*Set Theory*)** dan aljabar Minkowski.

Bab ini menguraikan representasi himpunan citra biner, perancangan **Structuring Elements** (*Square, Cross, Ellipse*), dua operator inti (**Erosion** dan **Dilation**), dua operasi pembersih majemuk (**Opening** dan **Closing**), ekstraksi bentuk turunan (**Morphological Gradient**, **Top-Hat**, **Black-Hat**), prinsip **Morphological Reconstruction**, serta penerapan nyatanya dalam pra-pemrosesan OCR, inspeksi PCB, dan medis.

---

## 2. Learning Objectives

1. **Merumuskan** operator **Erosion ($A \ominus B$)** dan **Dilation ($A \oplus B$)** menggunakan konsep himpunan biner dan fungsi `min`/`max` grayscale.
2. **Mendesain** **Structuring Element ($B$)** berdasarkan bentuk (`MORPH_RECT`, `MORPH_CROSS`, `MORPH_ELLIPSE`) serta memilih ukuran jendela yang sesuai dengan geometri target.
3. **Menjelaskan** perbedaan peran **Opening ($A \circ B$)** untuk menghapus bintik luar tanpa menyusutkan objek utama, vs **Closing ($A \bullet B$)** untuk menambal lubang dalam dan menyambung celah terputus.
4. **Menghitung dan menafsirkan** operator turunan **Morphological Gradient**, **White Top-Hat**, dan **Black-Hat** untuk koreksi iluminasi tak merata.
5. **Mengimplementasikan** pipeline pembersihan masker morfologi menggunakan `cv2.erode`, `cv2.dilate`, `cv2.morphologyEx`, dan `cv2.getStructuringElement`.

---

## 3. Prerequisites

- Pemahaman masker citra biner 1-bit `{0, 255}` [Chapter 06].
- Konsep jendela geser (*sliding window*) ketetanggaan spasial [Chapter 10].

---

## 4. Fundamental Concepts

### 4.1 Himpunan Biner &amp; Structuring Element (SE)

Dalam morfologi matematis (Jean Serra &amp; Georges Matheron), objek latar depan putih ($1$ atau $255$) direpresentasikan sebagai himpunan koordinat piksel $A \subset \mathbb{Z}^2$, sementara **Structuring Element ($B$)** adalah matriks probe biner kecil (umumnya $3\times 3, 5\times 5,$ atau $7\times 7$) dengan sebuah titik asal (*origin*).

![Geometri Structuring Elements](/media/diagrams/chapter-14-structuring-elements.svg)
*Gambar 14.1 — Variasi bentuk Structuring Elements standar (Rect, Cross) serta ringkasan operasi komposit Gradient, Top-Hat, dan Black-Hat.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.2 Erosion, Dilation, Opening &amp; Closing

![Empat Operasi Morfologi Dasar](/media/diagrams/chapter-14-morphological-ops.svg)
*Gambar 14.2 — Efek geometris operasi Erosion, Dilation, Opening, dan Closing terhadap objek biner dan bintik noise.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

1. **Erosion ($A \ominus B$)**: Sebuah piksel tetap bernilai $1$ **hanya jika** seluruh elemen bernilai $1$ pada SE $B$ yang berpusat di titik tersebut **sepenuhnya termuat di dalam objek $A$**. Efeknya: mengikis batas terluar objek dan melenyapkan titik/jembatan tipis yang lebih kecil dari SE.
2. **Dilation ($A \oplus B$)**: Sebuah piksel bernilai $1$ **jika sedikitnya satu** elemen SE $B$ **beririsan** dengan objek $A$. Efeknya: memperbesar batas objek, menjembatani celah terputus, dan mengisi celah sempit.
3. **Opening ($A \circ B = (A \ominus B) \oplus B$)**: Erosi diikuti Dilasi dengan SE yang sama. Erosi terlebih dahulu menghapus bintik noise luar yang kecil, kemudian Dilasi mengembalikan ukuran objek utama kembali mendekati ukuran semula!
4. **Closing ($A \bullet B = (A \oplus B) \ominus B$)**: Dilasi diikuti Erosi. Dilasi terlebih dahulu menutup lubang kecil dan menyatukan celah retakan, lalu Erosi memulihkan batas luar objek ke ukuran semula!

### 4.3 Operator Turunan &amp; Rekonstruksi Morfologis
- **Morphological Gradient**: $\text{Dilate}(A) - \text{Erode}(A) \implies$ mengekstrak garis tepi/kontur berongga objek.
- **White Top-Hat**: $A - \text{Open}(A) \implies$ mengisolasi elemen terang berukuran lebih kecil dari SE (sangat ampuh menghilangkan latar belakang pencahayaan miring pada halaman dokumen atau citra mikroskop!).
- **Black-Hat**: $\text{Close}(A) - A \implies$ mengisolasi detail gelap kecil (lubang/retakan/teks gelap) pada latar terang.
- **Morphological Reconstruction**: Menggunakan dua citra (*marker* yang di-dilasi berulang kali sambil dibatasi secara geografis oleh *mask*) untuk mengekstrak bentuk objek utuh tanpa distorsi geometri seperti halnya Opening standar.

---

## 5. Mathematical Foundations

Secara teoretis himpunan di $\mathbb{Z}^2$, dengan $(B)_z = \{c \mid c = b + z,\; b \in B\}$ adalah translasi himpunan $B$ oleh vektor $z$, dan $\hat{B} = \{-b \mid b \in B\}$ adalah refleksi terhadap titik asal:

1. **Erosion**:
   $$A \ominus B = \{ z \in \mathbb{Z}^2 \mid (B)_z \subseteq A \}$$
   *(Pada citra grayscale: $(f \ominus b)(x, y) = \min_{(s, t) \in B} \{ f(x + s, y + t) \}$).*
2. **Dilation**:
   $$A \oplus B = \{ z \in \mathbb{Z}^2 \mid (\hat{B})_z \cap A \neq \emptyset \}$$
   *(Pada citra grayscale: $(f \oplus b)(x, y) = \max_{(s, t) \in B} \{ f(x - s, y - t) \}$).*
3. **Opening &amp; Closing**:
   $$A \circ B = (A \ominus B) \oplus B, \qquad A \bullet B = (A \oplus B) \ominus B$$
   Keduanya bersifat *idempoten*: $(A \circ B) \circ B = A \circ B$ (menerapkan Opening dua kali berturut-turut dengan SE sama tidak lagi mengubah citra!).

---

## 6. Worked Numerical Example

**Soal**: Diberikan matriks citra biner $5 \times 5$ (nilai $1$ adalah objek putih) berisi satu persegi $3 \times 3$ di pojok kiri atas dan satu piksel noise terisolasi di pojok kanan bawah:
$$A = \begin{bmatrix} 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 1 \end{bmatrix}$$
Jika diterapkan operasi **Opening ($A \circ B$)** menggunakan Structuring Element persegi penuh $B = 3 \times 3$ bernilai semua $1$ dengan *zero-padding*, tunjukkan langkah **Erosion ($A \ominus B$)** lalu **Dilation**!

**Penyelesaian**:
1. **Tahap 1 — Erosion ($A \ominus B$)**:
   Jendela $3 \times 3$ harus terisi seluruhnya oleh angka $1$. Di seluruh matriks $A$, hanya ketika pusat jendela berada tepat di $(y=1, x=1)$, seluruh $3\times 3$ tetangga bernilai $1$! Sedangkan piksel noise terisolasi di $(4, 4)$ langsung bernilai $0$.
   $$A \ominus B = \begin{bmatrix} 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; \mathbf{1} &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \end{bmatrix}$$
2. **Tahap 2 — Dilation terhadap hasil Erosi**:
   Setiap titik di mana jendela $3 \times 3$ beririsan dengan piksel `1` pada $(1, 1)$ akan menjadi `1`:
   $$(A \ominus B) \oplus B = \begin{bmatrix} 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 1 &amp; 1 &amp; 1 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \\ 0 &amp; 0 &amp; 0 &amp; 0 &amp; 0 \end{bmatrix}$$
   **Kesimpulan Terbukti**: Persegi $3\times 3$ pulih $100\%$ utuh ke bentuk aslinya, sedangkan piksel noise $(4, 4)$ lenyap sempurna!

---

## 7. Algorithm Pseudocode: Binary Morphological Opening

```text
ALGORITHM MorphologicalOpening(BinaryMask, SE)
INPUT:
    BinaryMask : Matriks {0, 255} berukuran H x W
    SE         : Matriks biner {0, 1} Structuring Element k x k
OUTPUT:
    OpenedMask : Matriks {0, 255} bebas noise titik kecil

BEGIN
    // 1. Erosion (Operator Minimum pada elemen SE aktif)
    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            Eroded[y, x] <- Min over (dy, dx) where SE[dy, dx] == 1 of BinaryMask[y+dy, x+dx]
        END FOR
    END FOR

    // 2. Dilation (Operator Maksimum pada elemen SE aktif)
    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            OpenedMask[y, x] <- Max over (dy, dx) where SE[dy, dx] == 1 of Eroded[y+dy, x+dx]
        END FOR
    END FOR
    RETURN OpenedMask
END
```

---

## 8. Python &amp; OpenCV Implementation

### Prasyarat &amp; Catatan
- Instalasi: `pip install numpy opencv-python-headless`
- Gunakan `cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))` untuk membuat kernel bundar tanpa sudut tajam yang lebih alami untuk sel biologis atau koin.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 14: Morphological Image Processing Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def create_noisy_binary_objects(size: int = 128) -> np.ndarray:
    mask = np.zeros((size, size), dtype=np.uint8)
    # Objek utama persegi berlubang kecil di tengah
    mask[25:85, 25:85] = 255
    mask[52:56, 52:56] = 0     # Lubang internal (hole) 4x4
    # Titik noise luar terisolasi (speckles) 2x2
    mask[10:12, 100:102] = 255
    mask[105:107, 20:22] = 255
    return mask

if __name__ == "__main__":
    binary = create_noisy_binary_objects(128)
    se = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))

    # 1. Opening menghapus noise luar tanpa menutup lubang
    opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, se)
    assert opened[10, 100] == 0 and opened[105, 20] == 0, "Noise luar harus terhapus!"
    assert opened[30, 30] == 255, "Objek utama harus terjaga!"

    # 2. Closing setelah Opening menambal lubang internal 4x4
    cleaned = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, se)
    assert cleaned[54, 54] == 255, "Lubang 4x4 di dalam objek harus tertutup oleh Closing!"

    # 3. Morphological Gradient mengekstrak batas kontur
    grad = cv2.morphologyEx(cleaned, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
    assert grad[25, 50] == 255 and grad[55, 55] == 0, "Gradient hanya menyisakan garis tepi!"

    print("Verifikasi Chapter 14 Morfologi BERHASIL!")
```

---

## 9. Interactive Lab — Morphology Lab

Buka tab **Laboratorium &amp; Python** dan gunakan **Morphology Lab**:
- Pilih salah satu dari **7 operasi morfologi** (`Erosion`, `Dilation`, `Opening`, `Closing`, `Gradient`, `Top-Hat`, `Black-Hat`).
- Ubah bentuk **Structuring Element** (`Square`, `Cross (+)`, `Ellipse/Disk`) dan ukurannya ($3\times 3, 5\times 5, 7\times 7$), sembari menginspeksi matriks SE biner yang diperbarui secara langsung di bagian bawah!

---

## 10. Experiments &amp; Analysis

1. **Menghapus Bintik Noise Mikro**: Pada pola default `objects` (yang sengaja menyertakan titik noise putih $2\times 2$ di tengah), pilih operasi **Opening** dengan SE $3\times 3$ atau $5\times 5$. Titik noise terhapus tuntas sementara keempat objek utama tetap utuh!
2. **Perbedaan Geometri Square vs Cross vs Disk**: Terapkan **Dilation $7\times 7$** pada objek lingkaran dengan SE **Square** (sudut-sudut objek berubah mengotak) vs SE **Disk / Ellipse** (bentuk bulat objek tetap terpelihara mulus).

---

## 11. Mini Project — Ekstraksi Teks pada Kertas dengan Bayangan Tidak Merata (White Top-Hat)

Buat skrip Python yang mensimulasikan foto kertas gelap dengan gradien bayangan diagonal kuat dan teks terang (atau sebaliknya kertas dengan teks hitam + Black-Hat):
1. Jika kita memakai thresholding langsung pada gradien miring, separuh kertas hancur menjadi hitam.
2. Terapkan **Black-Hat Transform** (`Close(img, SE_large) - img`) dengan SE berukuran lebih besar daripada ketebalan huruf (misal $15\times 15$) untuk mengekstrak latar bayangan lalu menghilangkan gradien pencahayaan agar teks kembali terbaca tajam merata!

---

## 12. Summary &amp; Presentation Slides

Akses tab **Presentasi Slide** untuk 10 slide ringkas dan catatan pengajar.

1. Morfologi citra memproses geometri bentuk melalui operasi himpunan yang dikendalikan **Structuring Element**.
2. **Erosion** mengikis objek dan menghilangkan titik kecil; **Dilation** memperluas objek dan menutup celah.
3. **Opening** membersihkan noise luar; **Closing** menutup lubang dalam objek.
4. **Top-Hat &amp; Black-Hat** sangat ampuh menormalkan pencahayaan tak merata sebelum segmentasi teks atau objek kecil.

---

## 13. Verified Academic References

1. **Gonzalez, R. C., &amp; Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 9: Morphological Image Processing.
2. **Serra, J.** (1982). *Image Analysis and Mathematical Morphology*. Academic Press.
3. **OpenCV Documentation**. (2024). *Morphological Transformations (`erode`, `dilate`, `morphologyEx`)*. Official OpenCV Reference.

