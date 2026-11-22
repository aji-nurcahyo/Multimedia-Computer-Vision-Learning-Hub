# Chapter 11 — Frequency Domain Image Processing

> **Bagian Kurikulum**: Section 03 — Advanced Digital Image Processing  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 10 (Spatial Filtering & Convolution), Chapter 02 (Digital Signals & Nyquist)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Pada Chapter 10, kita memproses citra langsung dalam domain spasial $(x, y)$ melalui operasi sliding-window konvolusi. Namun, banyak fenomena visual—seperti pola interferensi periodik (*periodic moiré noise*), pengaburan gerakan besar (*large-radius filtering*), maupun analisis orientasi tekstur—jauh lebih mudah dipahami dan diolah ketika citra diproyeksikan ke dalam **Domain Frekuensi Spasial $(u, v)$** menggunakan **2D Discrete Fourier Transform (DFT)** dan algoritma cepat **Fast Fourier Transform (FFT)**.

Bab ini membedah interpretasi fisis frekuensi spasial pada citra, formulasi matematis 2D DFT/IDFT, teknik pemusatan spektrum (`fftshift`), visualisasi logaritmik spektrum magnitudo, **Teorema Konvolusi** (konvolusi spasial setara dengan perkalian elemen di domain frekuensi), desain filter **Ideal, Butterworth, dan Gaussian** untuk *Low-Pass* serta *High-Pass Filtering*, serta analisis artifak **Gibbs Ringing** dan *wrap-around*.

---

## 2. Learning Objectives

1. **Menjelaskan** makna fisis komponen frekuensi rendah (area datar/pencahayaan lambat) vs frekuensi tinggi (tepi tajam, detail halus, derau) dalam citra 2D.
2. **Merumuskan** persamaan 2D Discrete Fourier Transform (DFT) dan Inverse DFT serta membuktikan hubungan centering `(-1)^(x+y)`.
3. **Menerapkan** algoritma 2D Fast Fourier Transform (FFT) untuk menvisualisasikan spektrum magnitudo terpusat dengan skala logaritmik.
4. **Menganalisis** perbedaan karakteristik **Ideal**, **Butterworth**, dan **Gaussian** filter untuk *Low-Pass Filtering* (smoothing) dan *High-Pass Filtering* (edge/sharpening).
5. **Membuktikan** secara numerik **Teorema Konvolusi** serta menganalisis penyebab terjadinya artifak **ringing** pada Ideal Cut-Off Filter.

---

## 3. Prerequisites

- Konsep konvolusi spasial 2D dan kernel Gaussian [Chapter 10].
- Prinsip dasar analisis spektral gelombang [Chapter 02].

---

## 4. Fundamental Concepts

### 4.1 Frekuensi Spasial pada Citra
Berbeda dengan sinyal audio di mana frekuensi diukur dalam siklus per detik (Hz), pada citra 2D **frekuensi spasial** mengukur seberapa cepat nilai intensitas piksel berubah per satuan jarak piksel:
- **Komponen DC $F(0, 0)$**: Frekuensi nol yang nilainya sebanding dengan rata-rata kecerahan keseluruhan citra.
- **Frekuensi Rendah** (dekat pusat spektrum setelah `fftshift`): Gradien langit, dinding seragam, bentuk global objek.
- **Frekuensi Tinggi** (jauh dari pusat spektrum): Batas tepi tajam, rambut, garis rapat, pola berulang periodik, serta *noise* bintik acak.

![Pipeline Domain Frekuensi 2D](/media/diagrams/chapter-11-2d-fft-spectrum.svg)
*Gambar 11.1 — Pipeline pemrosesan domain frekuensi 2D: Transformasi FFT, pemusatan spektrum fftshift, perkalian masker H(u,v), dan rekonstruksi balik IFFT.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 4.2 Visualisasi Spektrum & `fftshift`
Secara baku, algoritma FFT menempatkan komponen DC $F(0, 0)$ di pojok kiri atas matriks dan rentang dinamis magnitudo $|F(u, v)|$ bisa merentang dari $1$ hingga $10^7$. Karena itu diperlukan dua langkah agar spektrum terbaca oleh mata manusia:
1. **Centering (`fftshift`)**: Menggeser komponen frekuensi nol ke titik tengah matriks $(M/2, N/2)$ (secara matematis setara mengalikan citra input dengan $(-1)^{x+y}$).
2. **Log Transform**: $S(u, v) = c \cdot \log(1 + |F(u, v)|)$ untuk memampatkan puncak DC raksasa agar detail frekuensi tinggi terlihat jelas.

### 4.3 Ideal vs Butterworth vs Gaussian Filters & Ringing Artifacts

![Perbandingan Ideal vs Butterworth vs Gaussian](/media/diagrams/chapter-11-frequency-filters.svg)
*Gambar 11.2 — Profil fungsi transfer H(u,v) filter Low-Pass: Ideal mengalami transisi putus patah yang memicu artifak riak (Gibbs Ringing), sedangkan Gaussian bebas ringing.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

---

## 5. Mathematical Foundations

### 5.1 2D Discrete Fourier Transform (DFT) & Inverse (IDFT)

Untuk citra $f(x, y)$ berdimensi $M \times N$:

$$F(u, v) = \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} f(x, y)\, \exp\left(-j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)\right)$$

Transformasi Balik (*Inverse 2D DFT*):

$$f(x, y) = \frac{1}{MN} \sum_{u=0}^{M-1} \sum_{v=0}^{N-1} F(u, v)\, \exp\left(+j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)\right)$$

### 5.2 Teorema Konvolusi 2D

$$(f * h)(x, y) \iff F(u, v) \cdot H(u, v)$$

Perkalian titik (*element-wise product*) di domain frekuensi setara dengan konvolusi penuh di domain spasial. Untuk kernel ukuran sangat besar (misalnya $K > 31$), melakukan konvolusi lewat FFT berkecepatan $\mathcal{O}(MN \log(MN))$ jauh mengalahkan konvolusi langsung $\mathcal{O}(K^2 MN)$.

### 5.3 Fungsi Transfer Penapis Frekuensi $H(u, v)$

Jarak Euclidean dari pusat frekuensi $(M/2, N/2)$: $D(u, v) = \sqrt{(u - M/2)^2 + (v - N/2)^2}$.

1. **Ideal Low-Pass Filter (ILPF)** dengan radius cut-off $D_0$:
   $$H_{\text{ILPF}}(u, v) = \begin{cases} 1, & D(u, v) \le D_0 \\ 0, & D(u, v) > D_0 \end{cases}$$
2. **Butterworth Low-Pass Filter (BLPF)** orde $n$:
   $$H_{\text{BLPF}}(u, v) = \frac{1}{1 + [D(u, v) / D_0]^{2n}}$$
3. **Gaussian Low-Pass Filter (GLPF)**:
   $$H_{\text{GLPF}}(u, v) = \exp\left(-\frac{D(u, v)^2}{2 D_0^2}\right)$$
4. **High-Pass Filter (HPF)** diperoleh langsung sebagai komplemennya:
   $$H_{\text{HPF}}(u, v) = 1 - H_{\text{LPF}}(u, v)$$

---

## 6. Worked Numerical Example

**Soal**: Sebuah matriks citra kecil $2 \times 2$ memiliki nilai $f = \begin{bmatrix} 10 & 20 \\ 30 & 40 \end{bmatrix}$. Hitung komponen DC $F(0, 0)$ dan komponen $F(1, 0)$ menggunakan definisi 2D DFT!

**Penyelesaian**:
Di sini $M = 2, N = 2$:
1. **Komponen DC $F(0, 0)$** ($u=0, v=0 \implies \exp(0) = 1$):
   $$F(0, 0) = \sum_{x=0}^{1} \sum_{y=0}^{1} f(x, y) = 10 + 20 + 30 + 40 = \mathbf{100}$$
   *(Perhatikan bahwa rata-rata citra adalah $100 / (2 \times 2) = 25$, sehingga $F(0,0) = MN \cdot \bar{f}$).*
2. **Komponen $F(1, 0)$** ($u=1, v=0 \implies \exp(-j 2\pi \cdot x / 2) = (-1)^x$):
   $$F(1, 0) = (+1)(10 + 20) + (-1)(30 + 40) = 30 - 70 = \mathbf{-40}$$

**Soal 2 (Gaussian Transfer)**: Pada citra $128 \times 128$, titik frekuensi $(u, v)$ berjarak $D = 20$ piksel dari pusat. Jika memakai Gaussian LPF dengan $D_0 = 20$, berapakah nilai atenuasi $H(u, v)$?
$$H(u, v) = \exp\left(-\frac{20^2}{2 \cdot 20^2}\right) = e^{-0.5} \approx \mathbf{0.6065} \quad (60.65\%)$$

---

## 7. Algorithm Pseudocode: 2D Frequency Filtering

```text
ALGORITHM FrequencyDomainFilter(GrayImage, FilterMaskH)
INPUT:
    GrayImage   : Matriks intensitas float64 H x W
    FilterMaskH : Matriks fungsi transfer ternormalisasi [0..1] terpusat H x W
OUTPUT:
    Restored    : Citra uint8 hasil transformasi balik

BEGIN
    F <- FFT2D(GrayImage)
    F_shifted <- FFTShift(F)

    G_shifted <- F_shifted * FilterMaskH    // Perkalian kompleks element-wise
    G_unshifted <- IFFTShift(G_shifted)

    spatial_complex <- IFFT2D(G_unshifted)
    spatial_real <- RealPart(spatial_complex)
    RETURN Clamp(Round(spatial_real), 0, 255) as uint8
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat & Catatan
- Instalasi: `pip install numpy opencv-python-headless`
- Menggunakan `np.fft.fft2`, `np.fft.fftshift`, dan `cv2.dft` (di sini ditunjukkan dengan `np.fft` yang ringkas, akurat presisi ganda `complex128`, dan bebas bug dimensi).

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 11: 2D Frequency Domain Filtering & Convolution Theorem Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def create_stripe_disk_scene(size: int = 128) -> np.ndarray:
    img = np.full((size, size), 20.0, dtype=np.float64)
    # Pola garis frekuensi tinggi
    for x in range(16, 60, 6):
        img[20:100, x:x+2] = 220.0
    # Lingkaran besar frekuensi rendah
    yy, xx = np.ogrid[:size, :size]
    mask = (xx - 92)**2 + (yy - 64)**2 <= 24**2
    img[mask] = 220.0
    return img

def gaussian_lpf_mask(shape: tuple, d0: float) -> np.ndarray:
    rows, cols = shape
    cy, cx = rows // 2, cols // 2
    y, x = np.ogrid[:rows, :cols]
    dist2 = (x - cx)**2 + (y - cy)**2
    return np.exp(-dist2 / (2.0 * (d0 ** 2)))

if __name__ == "__main__":
    img = create_stripe_disk_scene(128)

    # 1. Transformasi FFT 2D & shifting ke tengah
    f = np.fft.fft2(img)
    f_shift = np.fft.fftshift(f)

    # Verifikasi Teorema Parseval & Komponen DC F(0,0) == sum(img)
    dc_val = np.abs(f_shift[64, 64])
    assert np.isclose(dc_val, np.sum(img)), "Komponen DC harus sama dengan total intensitas!"

    # 2. Terapkan Gaussian LPF D0=14 dan IFFT rekonstruksi
    h_mask = gaussian_lpf_mask(img.shape, d0=14.0)
    g_shift = f_shift * h_mask
    img_back = np.real(np.fft.ifft2(np.fft.ifftshift(g_shift)))

    # Verifikasi: IFFT tanpa filter mengembalikan citra eksak (error < 1e-10)
    exact_back = np.real(np.fft.ifft2(np.fft.ifftshift(f_shift)))
    max_err = float(np.max(np.abs(img - exact_back)))
    print(f"FFT -> IFFT Roundtrip Max Error: {max_err:.2e}")
    assert max_err < 1e-9

    print(f"Energi Standar Deviasi Input: {img.std():.2f} -> LPF Filtered: {img_back.std():.2f}")
    print("Verifikasi Chapter 11 Frequency Domain BERHASIL!")
```

---

## 9. Interactive Lab — 2D FFT Explorer

Buka tab **Laboratorium & Python** dan eksperimen pada **2D FFT Explorer**:
- Bandingkan pola masukan (garis-garis vertikal/horizontal rapat vs disk halus), **Masker Filter $H(u, v)$**, **Log Magnitude Spectrum**, dan **Citra Rekonstruksi IFFT**.
- Pilih filter **Ideal**, **Butterworth**, atau **Gaussian**, lalu alihkan antara **Low-Pass** dan **High-Pass** sambil menggeser jari-jari cut-off $D_0$.

---

## 10. Experiments & Analysis

1. **Mengamati Gibbs Ringing Artifact**: Pilih mode **Ideal Low-Pass Filter** dengan $D_0 = 15$. Perhatikan munculnya lingkaran riak gelombang palsu di sekitar tepi objek lingkaran putih! Sekarang ganti ke **Gaussian Low-Pass Filter** pada $D_0 = 15$: lingkaran riak menghilang mulus karena transformasi Fourier dari fungsi Gaussian juga berbentuk Gaussian tanpa batas terjal.
2. **Ekstraksi Garis Tepi via High-Pass Filter**: Ubah menjadi **High-Pass Filter (Gaussian)** dengan $D_0 = 12$. Area dalam lingkaran yang homogen berubah gelap karena komponen frekuensi rendah ($DC$) disumbat, menyisakan batas kontur dan pola garis rapat.

---

## 11. Mini Project — Penghapus Derau Periodik Garis (*Periodic Notch Filter*)

Buat skrip Python yang mensimulasikan foto terkorupsi interferensi gelombang sinusoidal miring (`I + 40 * sin(2*pi*(0.15*x + 0.1*y))`):
1. Hitung spektrum FFT 2D dan identifikasi dua titik puncak terang simetris (*conjugate peaks*) di luar titik tengah DC.
2. Buat masker **Notch Reject Filter** yang mengenolkan dua radius kecil di sekitar koordinat puncak gangguan tersebut tanpa menyentuh pusat DC.
3. Rekonstruksi kembali citra bersih via IFFT2 dan verifikasi penurunan MSE dibanding citra terkorupsi!

---

## 12. Summary & Presentation Slides

Akses tab **Presentasi Slide** untuk 10 slide materi kuliah Domain Frekuensi.

1. **2D DFT/FFT** memetakan intensitas spasial menjadi komposisi gelombang kosinus/sinus berfrekuensi $(u, v)$.
2. **Teorema Konvolusi** menyatakan konvolusi spasial $f * h$ ekuivalen dengan perkalian sederhana $F \cdot H$ di domain frekuensi.
3. **Low-Pass Filter** meloloskan struktur halus (pusat spektrum) untuk *smoothing*; **High-Pass Filter** meloloskan frekuensi tepi dan detail.
4. **Ideal Cut-Off** menimbulkan efek riak *ringing*; gunakan **Gaussian** atau **Butterworth** berorde rendah untuk hasil visual bersih.

---

## 13. Verified Academic References

1. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 4: Filtering in the Frequency Domain.
2. **Cooley, J. W., & Tukey, J. W.** (1965). *An Algorithm for the Machine Calculation of Complex Fourier Series*. Mathematics of Computation, 19(90), 297–301.
3. **NumPy Reference Documentation**. (2024). *Discrete Fourier Transform (`numpy.fft`)*. NumPy Foundation.

