# Chapter 05 — NumPy, Visualization & Multimedia I/O

> **Bagian Kurikulum**: Section 01 — Multimedia & Signal Foundations  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Chapter 01 (Intro to MM & CV), Chapter 04 (Python Development Environment)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Dalam ekosistem Python untuk visi komputer dan pengolahan multimedia, **NumPy (*Numerical Python*)** bukan sekadar salah satu pustaka pihak ketiga—NumPy adalah **landasan struktur data universal (*universal substrate*)**. Baik OpenCV, Pillow, PyTorch, TorchVision, Librosa, maupun SciPy, semuanya berkomunikasi dan bertukar data melalui objek matriks `numpy.ndarray`.

Sebuah citra berwarna bukanlah file JPEG yang terkompresi di memori RAM, melainkan **tensor 3 dimensi beranggotakan bilangan bulat tak bertanda (*3D uint8 array*)**. Sebuah berkas audio bukanlah file MP3, melainkan **vektor 1 dimensi sinyal amplitudo mengambang (*1D float32 array*)**. Dan video adalah **larik 4 dimensi spatiotemporal**.

Bab ini membedah penguasaan mendalam representasi array N-dimensi NumPy, menavigasi dimensi sumbu (*axes and strides*), teknik pengirisan cepat (*fast slicing & Region of Interest / ROI extraction*), bahaya laten *integer overflow* pada tipe `uint8`, prinsip komputasi tervektorisasi (*vectorization* vs *Python loops*), visualisasi terkalibrasi dengan Matplotlib, serta operasi membaca dan menulis berkas media (*Multimedia I/O*). Kita juga akan mengupas secara tuntas perangkap klasik perbedaan urutan saluran warna **BGR (OpenCV) vs RGB (Matplotlib/Pillow)**.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Memahami** anatomi objek `ndarray` (shape, ndim, dtype, strides, memory layout) dalam merepresentasikan audio 1D, citra 2D/3D, dan video 4D.
2. **Menguasai** teknik pengindeksan tingkat lanjut (*advanced indexing*) dan pemotongan wilayah minat (*Region of Interest / ROI slicing*).
3. **Menganalisis** perbedaan kritis antara tampilan memori (*memory views*) dengan salinan memori (*memory copies*) untuk mencegah bug modifikasi tak sengaja.
4. **Menerapkan** operasi tervektorisasi (*vectorized operations*) dan fungsi universal (*ufuncs*) yang menghasilkan akselerasi kecepatan hingga puluhan kali lipat dibanding perulangan `for` konvensional.
5. **Menghindari** kesalahan umum konversi tipe data antara `uint8` $[0, 255]$ dengan `float32` $[0.0, 1.0]$.
6. **Membangun** pipeline input/output (I/O) media yang benar untuk membaca, memanipulasi saluran warna BGR/RGB, memvisualisasikan histogram, dan menyimpan hasil olahan ke media penyimpanan.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan Anda telah menyelesaikan:
- Konfigurasi lingkungan virtual Python dan instalasi pustaka NumPy, Matplotlib, OpenCV [Chapter 04].
- Pemahaman konsep sampling spasial piksel dan saluran warna [Chapter 01 & 02].

---

## 4. Anatomi Tensor N-Dimensi dalam Multimedia

NumPy merepresentasikan data fisik ke dalam struktur koordinat berbasis sumbu (*axes*):

![Dimensi Tensor NumPy dalam Multimedia](/media/diagrams/chapter-05-numpy-tensors.svg)
*Gambar 5.1 — Struktur bentuk array (ndarray.shape) untuk representasi Audio 1D, Citra Grayscale 2D, Citra RGB 3D, dan Video Temporal 4D.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.1 Pemetaan Dimensi Multimedia

1. **Audio Mono 1D**:
   - `Shape: (N,)` $\rightarrow$ Larik 1 dimensi dengan $N$ sampel berurutan terhadap waktu.
   - `Tipe Data`: `np.float32` dengan rentang amplitudo ternormalisasi $[-1.0, +1.0]$ atau `np.int16` $[-32768, 32767]$.
2. **Citra Grayscale 2D**:
   - `Shape: (H, W)` $\rightarrow$ Baris $H$ (*Height* / Y) dan Kolom $W$ (*Width* / X).
   - `Tipe Data`: `np.uint8` dengan rentang intensitas diskrit $[0, 255]$.
   - Akses piksel pada koordinat $(x, y)$: `pixel = img[y, x]` (Perhatikan: koordinat **Y mendahului X**!).
3. **Citra Berwarna RGB 3D**:
   - `Shape: (H, W, 3)` $\rightarrow$ Tensor 3 dimensi di mana sumbu ke-3 merepresentasikan saluran warna (*color channels*).
4. **Sekuens Video Temporal 4D**:
   - `Shape: (T, H, W, 3)` $\rightarrow$ Tensor 4 dimensi dengan $T$ buah frame waktu berurutan.

---

## 5. Tipe Data & Jebakan Integer Overflow

Dalam Python murni, integer memiliki presisi tak terbatas (*arbitrary precision*). Namun dalam NumPy, array menggunakan tipe data biner teralokasi tetap (*fixed-width C types*):

| Tipe Data | Rentang Nilai | Penggunaan Khas Multimedia |
| :--- | :--- | :--- |
| `np.uint8` | $0$ s.d. $255$ (1 Byte tak bertanda) | Standar piksel citra visual (8-bit) |
| `np.int16` | $-32.768$ s.d. $+32.767$ (2 Byte bertanda) | Sampel audio CD (16-bit PCM) |
| `np.float32` | Bilangan pecahan presisi tunggal (4 Byte) | Komputasi filter, normalisasi citra $[0.0, 1.0]$, audio |
| `np.float64` | Bilangan pecahan presisi ganda (8 Byte) | Analisis numerik ilmiah, Fourier Transform |

### Bahaya Fatal: `uint8` Overflow / Underflow
Perhatikan operasi berikut pada array `uint8`:
```python
import numpy as np

a = np.array([250], dtype=np.uint8)
b = np.array([10], dtype=np.uint8)
hasil = a + b
print(hasil) # OUTPUT: [4] !!! BUKAN 260!
```
Karena nilai maksimum `uint8` adalah 255, nilai $250 + 10 = 260$ mengalami *modulo wrap-around* ($260 \pmod{256} = 4$). Pada citra, piksel yang sangat terang tiba-tiba berubah menjadi hitam gelap!

Demikian pula pada pengurangan:
```python
gelap = np.array([5], dtype=np.uint8)
kurang = gelap - 10
print(kurang) # OUTPUT: [251] !!! BUKAN -5!
```

> **Aturan Emas Pemrosesan Citra**:  
> Selalu konversi array citra ke tipe `np.float32` atau `np.float64` sebelum melakukan operasi aritmatika (penjumlahan, filtering, konvolusi), lalu gunakan `np.clip(output, 0, 255).astype(np.uint8)` sebelum menyimpan atau menampilkannya!

---

## 6. Slicing, ROI, dan Masalah Views vs Copies

### 6.1 Region of Interest (ROI)
ROI adalah pemotongan sub-matriks persegi panjang dari sebuah citra. Dalam NumPy, ROI diekstraksi menggunakan pengirisan (*slicing*):

```python
# Ekstraksi wilayah dari baris y1 ke y2 dan kolom x1 ke x2
roi = image[y1:y2, x1:x2]
```

### 6.2 Jebakan Memori: View vs Copy
NumPy dirancang untuk menghemat memori. Operasi slicing **TIDAK menduplikasi data di memori RAM**, melainkan hanya membuat jendela pandang (*View*) yang merujuk pada buffer memori yang sama.

```python
# HATI-HATI: Modifikasi pada ROI akan mengubah citra asli!
roi = image[100:200, 100:200]
roi[:, :] = 0 # Citra asli pada area tersebut ikut berubah menjadi HITAM!

# Solusi Benar: Buat salinan eksplisit jika ingin memodifikasi independen
roi_aman = image[100:200, 100:200].copy()
```

---

## 7. Dekomposisi Saluran Warna: BGR vs RGB

Perangkap paling terkenal bagi pemula di bidang Computer Vision adalah perbedaan konvensi susunan saluran warna:

![Dekomposisi Saluran Warna RGB dan BGR](/media/diagrams/chapter-05-color-channels.svg)
*Gambar 5.2 — Dekomposisi saluran warna RGB dan perbedaan urutan indeks warna antara pustaka OpenCV (BGR) dan Matplotlib (RGB).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **Pillow & Matplotlib**: Mengikuti standar persepsi **RGB** (Channel 0 = Red, Channel 1 = Green, Channel 2 = Blue).
- **OpenCV (`cv2`)**: Mengikuti warisan kamera masa lalu dengan urutan **BGR** (Channel 0 = Blue, Channel 1 = Green, Channel 2 = Red).

Jika citra dimuat dengan `cv2.imread()` lalu langsung ditampilkan menggunakan `plt.imshow()`, warna merah dan biru akan tertukar (wajah manusia tampak berwarna biru keabu-abuan seperti tokoh alien).

**Solusi Standar**:
```python
import cv2

img_bgr = cv2.imread("foto.jpg")
img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
```

---

## 8. Vektorisasi vs Perulangan Python (Benchmarking)

Python murni mengeksekusi operasi secara dinamis baris demi baris melalui interpreter. Untuk citra Full HD berukuran $1920 \times 1080 = 2.073.600$ piksel, perulangan `for` bersarang akan memakan waktu hingga ribuan milidetik.

Sebaliknya, **Vektorisasi (*Vectorization*)** mendelegasikan iterasi langsung ke instruksi Single Instruction Multiple Data (SIMD) pada prosesor melalui kode C teroptimasi di bawah kap mesin NumPy:

### Uji Performa Penyesuaian Kecerahan:
- **Perulangan `for` Python**: $\approx 1.250 \text{ ms}$ (1.25 detik per frame) $\rightarrow$ Tidak mungkin real-time!
- **Operasi Vektor NumPy (`img + 50`)**: $\approx 1.8 \text{ ms}$ $\rightarrow$ **$700\times$ lebih cepat**!

---

## 9. Python Implementation: Manipulasi Array & Multimedia I/O

Jalankan skrip berikut untuk menguji pembuatan citra sintetis, slicing saluran warna, uji vektorisasi, dan verifikasi numerik:

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 05: NumPy, Visualization & Multimedia I/O
Demonstrasi Manipulasi Array Tensor, Dekomposisi Warna, dan Vektorisasi

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import time
import numpy as np

def create_synthetic_color_bars(width: int = 240, height: int = 160) -> np.ndarray:
    """Membuat citra pola warna sintetis SMPTE standar 3D uint8."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    bar_w = width // 6
    
    # Warna: Putih, Kuning, Cyan, Hijau, Magenta, Merah
    colors = [
        [255, 255, 255], # Putih
        [255, 255, 0],   # Kuning
        [0, 255, 255],   # Cyan
        [0, 255, 0],     # Hijau
        [255, 0, 255],   # Magenta
        [255, 0, 0]      # Merah
    ]
    
    for i, col in enumerate(colors):
        img[:, i * bar_w : (i + 1) * bar_w] = col
        
    return img

def benchmark_vectorization(size: int = 1000):
    """Membandingkan kecepatan operasi vektor NumPy vs for-loop Python."""
    arr = np.random.randint(0, 200, (size, size), dtype=np.uint8)
    
    # 1. Operasi Tervektorisasi (SIMD)
    t0 = time.perf_counter()
    res_vec = np.clip(arr.astype(np.float32) + 50.0, 0, 255).astype(np.uint8)
    t_vec = time.perf_counter() - t0
    
    # 2. Operasi Loop Python Konvensional
    t0 = time.perf_counter()
    res_loop = np.zeros_like(arr)
    # Jalankan sebagian kecil saja (100 baris) untuk menghemat waktu uji
    for y in range(100):
        for x in range(size):
            val = int(arr[y, x]) + 50
            res_loop[y, x] = min(255, val)
    t_loop_partial = time.perf_counter() - t0
    t_loop_estimated = t_loop_partial * 10.0 # Estimasi untuk 1000 baris
    
    return t_vec, t_loop_estimated

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 05 Verification")
    print("=" * 65)

    # 1. Uji Pola Citra Sintetis
    test_img = create_synthetic_color_bars(240, 160)
    print(f"Bentuk Array Citra  : {test_img.shape} -> Dimensi={test_img.ndim}")
    print(f"Tipe Data Memori    : {test_img.dtype} ({test_img.nbytes} Bytes)")
    assert test_img.shape == (160, 240, 3), "Dimensi citra harus (160, 240, 3)"

    # 2. Uji Dekomposisi Saluran Warna
    red_channel = test_img[:, :, 0]
    green_channel = test_img[:, :, 1]
    blue_channel = test_img[:, :, 2]
    
    print(f"Dimensi Saluran Merah: {red_channel.shape} (2D Grayscale matrix)")
    assert red_channel.ndim == 2, "Saluran warna tunggal harus berdimensi 2D"

    # 3. Uji Slicing ROI (Region of Interest)
    roi_view = test_img[40:120, 60:180]
    assert roi_view.shape == (80, 120, 3), "Dimensi ROI harus (80, 120, 3)"
    print(f"Ekstraksi ROI       : {roi_view.shape} berhasil!")

    # 4. Uji Akselerasi Vektorisasi
    t_vec, t_loop = benchmark_vectorization(size=500)
    speedup = t_loop / t_vec
    print(f"\nWaktu Vektorisasi   : {t_vec*1000:.2f} ms")
    print(f"Estimasi For-Loop   : {t_loop*1000:.2f} ms")
    print(f"Percepatan Vektor   : {speedup:.1f}x LEBIH CEPAT!")
    assert speedup > 5.0, "Vektorisasi NumPy harus signifikan lebih cepat dari loop!"

    print("\nVerifikasi Berhasil: Seluruh operasi tensor dan vektorisasi tervalidasi!")

if __name__ == "__main__":
    main()
```

---

## 10. Summary

1. Objek `numpy.ndarray` adalah struktur data standar untuk semua representasi multimedia di Python: **1D untuk Audio**, **2D untuk Grayscale**, **3D untuk Citra Warna**, dan **4D untuk Video**.
2. Dimensi citra diindeks dengan urutan `[Tinggi (Y), Lebar (X), Saluran (C)]`. Koordinat vertikal $Y$ selalu mendahului horizontal $X$.
3. Berhati-hatilah terhadap **integer overflow pada `uint8`**: selalu lakukan konversi ke `float32` sebelum kalkulasi dan gunakan `np.clip` sebelum konversi kembali.
4. Pengirisan (*slicing*) menghasilkan **View**, bukan duplikasi independen (*Copy*). Gunakan `.copy()` jika ingin memodifikasi sub-matriks tanpa merusak citra asli.
5. Perhatikan konvensi saluran warna: **OpenCV menggunakan urutan BGR**, sementara **Matplotlib dan Pillow menggunakan RGB**.
6. Hindari perulangan `for` pada piksel citra: gunakan **Vektorisasi NumPy** yang memanfaatkan instruksi prosesor SIMD berkecepatan ratusan kali lipat.

---

## 11. References & Academic Citations

1. **Oliphant, T. E.** (2015). *Guide to NumPy* (2nd ed.). CreateSpace. Chapter 2: The ndarray object & Chapter 3: Universal Functions.
2. **Howse, J., & Minichino, J.** (2020). *Learning OpenCV 4 Computer Vision with Python 3* (3rd ed.). Packt Publishing. Chapter 2: Handling Files, Cameras, and GUIs.
3. **Bressert, E.** (2012). *Scipy and Numpy: An Overview for Developers*. O'Reilly Media. Chapter 1: NumPy Basics.
4. **Harris, C. R., et al.** (2020). *Array programming with NumPy*. Nature, 585(7825), 357-362.
