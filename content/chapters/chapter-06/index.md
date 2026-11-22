# Chapter 06 — Digital Image Fundamentals

> **Bagian Kurikulum**: Section 02 — Digital Image Processing Fundamentals  
> **Estimasi Durasi**: 90 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Chapter 02 (Digital Signals, Sampling & Quantization), Chapter 05 (NumPy, Visualization & Multimedia I/O)  
> **Learning Tracks**: Digital Image Processing, Computer Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Setiap sistem visi komputer modern—mulai dari pemindai medis MRI, inspeksi cacat manufaktur di lini pabrik, hingga jaringan saraf konvolusional (*Convolutional Neural Networks*)—memandang dunia bukan sebagai pemandangan kontinu yang mulus, melainkan sebagai **fungsi intensitas diskrit dua dimensi $f(x, y)$**. Memahami bagaimana cahaya kontinu yang jatuh ke sensor kamera CMOS/CCD disampel secara spasial menjadi grid piksel dan dikuantisasi ke dalam tingkatan bit diskrit (*bit depth*) merupakan fondasi tak tergantikan sebelum menerapkan algoritma pemrosesan citra apa pun.

Bab ini menguraikan representasi matematis citra digital, hubungan dimensi fisik dan resolusi spasial (*spatial resolution*), konvensi sistem koordinat citra $(x, y)$ vs pengindeksan matriks $[y, x]$, efek kedalaman bit (*bit depth*), perbedaan struktur citra grayscale, RGB, dan RGBA, manajemen tipe data memori (`uint8` vs `float32`), penyimpanan berkas citra (*lossless* vs *lossy*), serta metrik dasar kualitas citra.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa diharapkan mampu:

1. **Menjelaskan** pemodelan matematis citra digital 2D sebagai matriks diskrit $f(x, y)$ berukuran $M \times N$.
2. **Membedakan** sistem koordinat Kartesius $(x, y)$ pada geometri citra dengan urutan pengindeksan matriks baris-kolom `img[row, col]` di NumPy dan OpenCV.
3. **Menganalisis** pengaruh perubahan resolusi spasial (*spatial downsampling*) dan kedalaman bit (*intensity quantization*) terhadap kualitas perseptual (*pixelation* dan *false contouring*).
4. **Menghitung** kapasitas memori mentah (*uncompressed RAM footprint*) untuk citra biner, grayscale, RGB 24-bit, dan RGBA 32-bit.
5. **Mengimplementasikan** inspeksi piksel, ekstraksi saluran warna, kuantisasi kedalaman bit, dan manipulasi tipe data citra secara akurat menggunakan Python, NumPy, dan OpenCV.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan Anda telah menguasai:
- Teorema sampling spasial dan konsep kuantisasi sinyal [Chapter 02].
- Struktur array multidimensi `ndarray`, tipe data `uint8`, dan aturan `np.clip` [Chapter 05].

---

## 4. Fundamental Concepts

### 4.1 Representasi Citra Digital sebagai Matriks

Secara matematis, sebuah citra monokrom (*grayscale*) direpresentasikan sebagai fungsi dua dimensi $f(x, y)$ yang nilainya pada koordinat spasial diskrit $(x, y)$ menyatakan intensitas atau tingkat kecerahan (*gray level*) di titik tersebut:

$$f(x, y) = \begin{bmatrix} f(0,0) & f(0,1) & \cdots & f(0, N-1) \\ f(1,0) & f(1,1) & \cdots & f(1, N-1) \\ \vdots & \vdots & \ddots & \vdots \\ f(M-1, 0) & f(M-1, 1) & \cdots & f(M-1, N-1) \end{bmatrix}$$

Elemen terkecil pada matriks tersebut dinamakan **pixel** (*picture element*). Nilai $M$ menyatakan tinggi (*height* / jumlah baris), sedangkan $N$ menyatakan lebar (*width* / jumlah kolom).

![Sistem Koordinat Citra Digital & Tensor](/media/diagrams/chapter-06-image-coordinates.svg)
*Gambar 6.1 — Konvensi sistem koordinat citra dengan titik asal (0, 0) di sudut kiri atas serta tumpukan saluran warna (R, G, B) menjadi tensor 3D.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.2 Sistem Koordinat & Konvensi Indeks

Terdapat dua konvensi yang sering memicu bug pada pemula:
1. **Konvensi Geometri Citra $(x, y)$**: Digunakan oleh fungsi gambar OpenCV (`cv2.circle`, `cv2.rectangle`). Koordinat $x$ adalah sumbu horizontal (kolom, dari kiri ke kanan), dan $y$ adalah sumbu vertikal (baris, dari atas ke bawah).
2. **Konvensi Matriks NumPy `[row, col]`**: Di memori, baris diakses terlebih dahulu: `pixel = img[y, x]` atau `img[row, col]`. Untuk citra berwarna 3 saluran, bentuk tensor adalah `(Height, Width, Channels)`.

### 4.3 Resolusi Spasial vs Kedalaman Bit (*Bit Depth*)

![Dampak Kuantisasi Kedalaman Bit](/media/diagrams/chapter-06-bit-depth-sampling.svg)
*Gambar 6.2 — Komparasi visual efek degradasi kuantisasi intensitas (8-bit halus vs 2-bit false contouring vs 1-bit biner).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **Resolusi Spasial**: Kerapatan sampel piksel per unit jarak fisik (misalnya **PPI** — *pixels per inch*, atau total piksel $W \times H$). Menurunkan jumlah piksel secara drastis menyebabkan efek kotak-kotak (*pixelation / checkerboard effect*).
- **Kedalaman Bit ($b$)**: Jumlah bit yang dialokasikan untuk merepresentasikan intensitas setiap piksel/saluran. Jumlah tingkat keabuan diskrit yang tersedia adalah $L = 2^b$:
  - **1-bit ($L = 2$)**: Citra biner $\{0, 1\}$ untuk dokumen atau masker segmentasi.
  - **8-bit ($L = 256$)**: Standar industri (`uint8`), nilai $[0, 255]$.
  - **16-bit ($L = 65536$)**: Citra medis DICOM (CT/X-Ray) dan citra satelit (*remote sensing* RAW) yang membutuhkan presisi dinamis tinggi.

### 4.4 Penyimpanan Memori, Tipe Data & Kualitas Dasar

- **Citra Grayscale**: 1 saluran, bentuk `(H, W)`.
- **Citra RGB / BGR**: 3 saluran warna primer aditif, bentuk `(H, W, 3)` (24-bit per piksel). Ingat bahwa `cv2.imread()` memuat urutan saluran **BGR**, sedangkan konvensi web/Canvas/Matplotlib memakai **RGB**.
- **Citra RGBA / BGRA**: 4 saluran dengan kanal ke-4 sebagai transparansi (*Alpha channel*), bentuk `(H, W, 4)` (32-bit per piksel).
- **Penyimpanan Berkas**: Berkas PNG menggunakan kompresi *lossless* (DEFLATE) yang mempertahankan nilai piksel $100\%$ identik; berkas JPEG memakai transformasi DCT *lossy* yang membuang komponen frekuensi tinggi halus untuk menghemat ruang penyimpanan.

---

## 5. Mathematical Foundations

### 5.1 Kebutuhan Memori Tak Terkompresi (*Uncompressed Storage Size*)

Jumlah byte yang dialokasikan di RAM untuk sebuah citra berdimensi $M \times N$ dengan $C$ saluran warna dan kedalaman $b$ bit per saluran adalah:

$$\text{Memory (Bytes)} = M \times N \times C \times \left\lceil \frac{b}{8} \right\rceil$$

Atau dalam satuan bit total:

$$B_{\text{total}} = M \times N \times C \times b \text{ bit}$$

### 5.2 Formulasi Kuantisasi Seragam Kedalaman Bit

Untuk mereduksi citra 8-bit $f(x, y) \in [0, 255]$ menjadi citra $b$-bit dengan $L = 2^b$ tingkat diskrit ($L_{\max} = 2^b - 1$):

$$f_q(x, y) = \text{round}\left( \frac{\text{round}\left( \frac{f(x, y)}{255} \cdot (2^b - 1) \right)}{2^b - 1} \cdot 255 \right)$$

### 5.3 Konversi Luminansi Standar (ITU-R BT.601)

Konversi citra warna RGB ke intensitas keabuan (*grayscale luminance*) mempertimbangkan sensitivitas mata manusia terhadap cahaya hijau:

$$Y = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

---

## 6. Worked Numerical Example

**Soal**: Sebuah sensor kamera industri menghasilkan citra Full HD berukuran $1920 \times 1080$ piksel, format warna **RGB 8-bit per saluran**.
1. Hitung ukuran memori mentah di RAM (dalam Megabyte berbasis biner $1\text{ MB} = 1024^2$ Byte).
2. Jika sebuah piksel pada koordinat $(x=500, y=240)$ bernilai $(R=200, G=150, B=50)$, tentukan indeks pengaksesannya di NumPy dan hitung nilai luminansi grayscale $Y$ serta hasil kuantisasinya pada kedalaman **2-bit**!

**Penyelesaian**:
1. **Ukuran Memori RAM**:
   $$M = 1080, \quad N = 1920, \quad C = 3, \quad b = 8 \implies 1\text{ Byte/saluran}$$
   $$\text{Bytes} = 1920 \times 1080 \times 3 = 6.220.800\text{ Bytes}$$
   $$\text{MB} = \frac{6.220.800}{1024 \times 1024} \approx 5.93\text{ MB}$$
2. **Pengaksesan Indeks NumPy**:
   Baris adalah $y = 240$, kolom adalah $x = 500$, sehingga diakses dengan `img[240, 500]`.
3. **Nilai Luminansi Grayscale**:
   $$Y = 0.299(200) + 0.587(150) + 0.114(50) = 59.8 + 88.05 + 5.7 = 153.55 \approx 154$$
4. **Kuantisasi ke 2-bit ($L = 2^2 = 4$ level, $L_{\max} = 3$)**:
   Untuk nilai $Y = 154$:
   $$q = \text{round}\left( \frac{154}{255} \times 3 \right) = \text{round}(1.811) = 2$$
   $$\text{Nilai Rekonstruksi} = \text{round}\left( \frac{2}{3} \times 255 \right) = 170$$
   (Himpunan nilai valid 2-bit adalah $\{0, 85, 170, 255\}$).

---

## 7. Algorithm Pseudocode: Bit-Depth Quantization & Inspection

```text
ALGORITHM QuantizeImageBitDepth(ImageRGB, target_bits)
INPUT:
    ImageRGB    : Tensor citra uint8 berdimensi H x W x 3
    target_bits : Bilangan bulat dalam rentang [1, 8]
OUTPUT:
    Quantized   : Tensor citra uint8 dengan 2^target_bits tingkat intensitas

BEGIN
    IF target_bits == 8 THEN
        RETURN Copy(ImageRGB)
    END IF

    levels <- (2 ^ target_bits) - 1
    Initialize Quantized[H, W, 3] as uint8

    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            FOR c <- 0 TO 2 DO
                norm <- ImageRGB[y, x, c] / 255.0
                bucket <- Round(norm * levels)
                Quantized[y, x, c] <- Round((bucket / levels) * 255.0)
            END FOR
        END FOR
    END FOR

    RETURN Quantized
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat Lingkungan & Dataset
- Instalasi paket inti: `pip install numpy opencv-python-headless pillow`
- Dataset uji: Program di bawah membangkitkan citra uji sintetis deterministik $240 \times 320 \times 3$ (*color blocks + gradient*) sehingga tidak bergantung file eksternal dan dapat dijalankan langsung di CPU.

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 06: Digital Image Fundamentals Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def create_synthetic_test_image(width: int = 320, height: int = 240) -> np.ndarray:
    """Membentuk citra uji RGB sintetis yang deterministik."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Gradien horizontal pada latar belakang
    grad = np.linspace(0, 255, width, dtype=np.uint8)
    img[:, :, 2] = np.tile(grad, (height, 1))  # Kanal Biru
    # Persegi merah di kuadran kiri atas
    img[30:110, 40:130] = [220, 40, 40]
    # Lingkaran hijau di sisi kanan
    cv2.circle(img, center=(220, 120), radius=45, color=(40, 210, 90), thickness=-1)
    return img

def quantize_bit_depth(image: np.ndarray, bits: int) -> np.ndarray:
    """Mengkuantisasi citra 8-bit menjadi kedalaman b-bit."""
    if bits < 1 or bits > 8:
        raise ValueError("Kedalaman bit harus berada antara 1 dan 8.")
    if bits == 8:
        return image.copy()
    levels = (1 << bits) - 1
    norm = image.astype(np.float64) / 255.0
    q = np.round(norm * levels) / levels
    return np.round(q * 255.0).astype(np.uint8)

if __name__ == "__main__":
    rgb_img = create_synthetic_test_image(320, 240)
    h, w, c = rgb_img.shape
    print(f"Dimensi Citra: Width={w}, Height={h}, Channels={c}, Dtype={rgb_img.dtype}")
    print(f"Kapasitas Memori Mentah: {rgb_img.nbytes} Bytes ({rgb_img.nbytes / 1024:.2f} KB)")

    # Konversi Grayscale BT.601 dan bandingkan dengan OpenCV
    gray_manual = np.round(
        0.299 * rgb_img[:, :, 0] + 0.587 * rgb_img[:, :, 1] + 0.114 * rgb_img[:, :, 2]
    ).astype(np.uint8)
    gray_cv = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
    assert np.mean(np.abs(gray_manual.astype(float) - gray_cv.astype(float))) <= 1.0

    # Verifikasi Kuantisasi 1-bit hanya memiliki nilai {0, 255}
    q1 = quantize_bit_depth(gray_cv, bits=1)
    assert set(np.unique(q1)).issubset({0, 255})
    print("Verifikasi Kuantisasi 1-bit & BT.601 Grayscale BERHASIL!")
```

### Troubleshooting Umum
1. **Salah Urutan Dimensi (`width, height` vs `height, width`)**: `img.shape` mengembalikan `(height, width, channels)`, sedangkan `cv2.resize(img, (width, height))` meminta `(width, height)`!
2. **Kesalahan Saluran Warna BGR vs RGB**: Jika citra terlihat kebiruan saat ditampilkan di Matplotlib setelah dibaca OpenCV, pastikan memanggil `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)`.

---

## 9. Interactive Lab — Pixel &amp; Image Explorer

Buka tab **Laboratorium &amp; Python** untuk mencoba **Pixel &amp; Image Explorer**:
- Arahkan kursor ke atas citra untuk membaca koordinat $(x, y)$, indeks array `[y, x]`, serta nilai $(R, G, B)$ dan Grayscale secara *real-time*.
- Isolasi kanal Merah, Hijau, Biru, atau Grayscale.
- Geser *slider* **Kedalaman Bit ($1\dots 8$ bit)** untuk menyaksikan munculnya *false contouring*, serta *slider* **Downsampling Spasial** untuk mengamati efek *pixelation*, lalu unduh hasilnya dalam format PNG.

---

## 10. Experiments &amp; Analysis

1. **Eksperimen Ambang False Contouring**: Turunkan slider kedalaman bit dari 8-bit bertahap ke 5-bit, 4-bit, 3-bit, hingga 2-bit pada foto bergradien halus (misalnya foto langit atau wajah). Catat pada kedalaman bit berapa pita garis patah mulai tampak jelas oleh mata manusia.
2. **Analisis Resolusi vs Informasi**: Ubah faktor *downsampling* spasial ke $8\times$ dan $16\times$, lalu amati detail teks/garis berfrekuensi tinggi yang hilang akibat pelanggaran kriteria sampling Nyquist spasial.

---

## 11. Mini Project — Pixel Diagnostic &amp; Storage Profiler

Rancang utilitas baris perintah Python yang membaca sembarang berkas gambar dari direktori lokal (PNG dan JPEG) dan mencetak laporan diagnostik lengkap:
1. Dimensi spasial $(W \times H)$, jumlah saluran, dan tipe data memori.
2. Ukuran memori mentah di RAM dibandingkan dengan ukuran berkas terkompresi di disk (*Compression Ratio*).
3. Ekstrak statistik minimum, maksimum, dan rata-rata setiap saluran warna serta hasilkan pratinjau citra terkuantisasi 3-bit tersimpan sebagai berkas PNG.

---

## 12. Summary &amp; Presentation Slides

Akses tab **Presentasi Slide** untuk menyimak 10 slide materi perkuliahan yang mencakup ilustrasi koordinat, kuantisasi bit depth, dan contoh soal numerik.

1. Citra digital adalah fungsi intensitas diskrit 2D yang disusun sebagai matriks `img[y, x]` (atau tensor 3D `(H, W, C)`).
2. Resolusi spasial mengontrol detail geometri ($W \times H$), sedangkan kedalaman bit ($L = 2^b$) menentukan kehalusan gradasi warna/kecerahan.
3. Reduksi kedalaman bit di bawah 4-bit pada region gradasi menyebabkan artifak pita *false contouring*.
4. Konversi warna ke grayscale mengikuti bobot perseptual BT.601 ($0.299R + 0.587G + 0.114B$).

---

## 13. Verified Academic References

1. **Gonzalez, R. C., &amp; Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 2: Digital Image Fundamentals.
2. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Chapter 2: Image Formation.
3. **OpenCV Documentation**. (2024). *Basic Operations on Images — Accessing and Modifying Pixel Values*. OpenCV Official Reference.

