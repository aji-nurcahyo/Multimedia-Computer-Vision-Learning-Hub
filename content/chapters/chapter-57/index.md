# Bab 57 — Edge AI & Embedded Computer Vision

**Seksi Kurikulum:** Seksi 12 — Multimedia Systems & Capstone  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Perkembangan mutakhir dalam visi komputer dan kecerdasan buatan telah melahirkan model jaringan syaraf tiruan (*Deep Neural Networks*) dengan miliaran parameter dan akurasi yang luar biasa. Namun, ketika model tersebut harus diterapkan pada sistem embedded dunia nyata—seperti drone inspeksi pertanian, kamera keamanan cerdas bertenaga baterai, kendaraan otonom, atau mikrokontroler di perkebunan Sumatera—ketergantungan pada server komputasi awan (*Cloud AI*) menghadapi tiga rintangan mendasar:
1. **Latensi Jaringan yang Tidak Menentu**: Ketergantungan pada koneksi internet seluler (4G/5G) menimbulkan latensi tambahan berkisar antara 50 hingga 300 milidetik, yang membahayakan sistem dengan kendali kritis waktu.
2. **Kekhawatiran Privasi Data Visual**: Mentransmisikan aliran video mentah beresolusi tinggi ke server pihak ketiga membuka kerentanan privasi dan regulasi perlindungan data pengguna.
3. **Kendala Konsumsi Daya & Bandwidth**: Mengunggah video 1080p secara terus-menerus menguras baterai perangkat tepi dan membutuhkan biaya langganan bandwidth jaringan yang sangat besar.

**Edge AI & Embedded Computer Vision** adalah paradigma pemrosesan cerdas di mana inferensi model dieksekusi secara lokal langsung pada perangkat keras tepi (*edge devices*).

```
+-----------------------------------------------------------------------------------------+
|                  PIPELINE KUANTISASI & AKSELERASI MODEL UNTUK EDGE AI                   |
+-----------------------------------------------------------------------------------------+
 [ Model FP32 (4 Byte) ] ---> [ Dataset Kalibrasi ] ---> [ Skala S & Zero Z ] ---> [ Model INT8 (1 Byte) ]
      ~100 MB Memori              (100-500 Sampel)        Pemetaan Affine Dinamis         ~25 MB (Kompresi 4x)
```

Topik-topik inti yang dibahas pada bab ini meliputi:
1. **Spektrum Perangkat Keras Tepi**: Perbandingan arsitektur TinyML/MCU (ESP32-S3), Single-Board Computer / Edge GPU (NVIDIA Jetson Nano/Orin), Dedicated Edge NPU (Google Coral / Hailo), dan Cloud GPU.
2. **Teknik Kompresi Model Visi**: Pemangkasan bobot (*weight pruning*), distilasi pengetahuan (*knowledge distillation*), dan kuantisasi uniform (*uniform affine quantization*).
3. **Matematika Kuantisasi Pasca-Pelatihan (Post-Training Quantization / PTQ)**: Penurunan matematis parameter skala $S$, zero-point $Z$, fungsi *clamping*, dan kuantisasi asimetris vs simetris.
4. **Analisis Error Rekonstruksi & SQNR**: Evaluasi Mean Squared Error (MSE) dan Signal-to-Quantization-Noise Ratio (SQNR) pada tensor bobot dan aktivasi.
5. **Format Deployment & Mesin Inferensi Ringan**: ONNX Runtime, TensorRT, TensorFlow Lite, dan integrasi akselerasi instruksi vektor SIMD (NEON / AVX).

---

## 2. Landasan Matematis & Algoritma

### 2.1 Formulasi Pemetaan Kuantisasi Affine Seragam (Asymmetric Quantization)

Kuantisasi seragam memetakan bilangan riil presisi ganda (*floating-point 32-bit*, $r \in [r_{\min}, r_{\max}]$) ke bilangan bulat tanpa tanda (*unsigned integer 8-bit*, $q \in [q_{\min}, q_{\max}]$ di mana $q_{\min} = 0$ dan $q_{\max} = 255$).

Hubungan pemetaan didefinisikan secara linier:
$$r \approx S \times (q - Z)$$

Di mana:
- $S \in \mathbb{R}^+$ adalah **Skala Kuantisasi (*Scale*)**, yang merepresentasikan resolusi numerik satu unit bilangan bulat.
- $Z \in \mathbb{Z}$ adalah **Titik Nol (*Zero-Point*)**, yang merepresentasikan nilai bilangan bulat yang memetakan nilai riil $0.0$. Keberadaan $Z$ sangat krusial untuk menjamin bahwa nilai nol (seperti pada fungsi aktivasi ReLU atau zero-padding) dapat direpresentasikan secara eksak tanpa galat pembulatan.

### 2.2 Penurunan Parameter Skala $S$ dan Zero-Point $Z$

Untuk mencakup seluruh rentang dinamis data riil $[r_{\min}, r_{\max}]$, skala kuantisasi $S$ dihitung dengan membagi rentang riil terhadap rentang bilangan bulat:
$$S = \frac{r_{\max} - r_{\min}}{q_{\max} - q_{\min}} = \frac{r_{\max} - r_{\min}}{255}$$

Titik nol $Z$ diturunkan dengan menetapkan $r = 0.0$:
$$0.0 = S \times (Z_{\text{real}} - Z) \implies Z = \text{round}\left(-\frac{r_{\min}}{S}\right) + q_{\min}$$

Nilai $Z$ kemudian dibatasi (*clamped*) agar berada di dalam rentang $[q_{\min}, q_{\max}]$:
$$Z = \max\left(q_{\min}, \min\left(q_{\max}, \text{round}\left(-\frac{r_{\min}}{S}\right)\right)\right)$$

### 2.3 Operasi Kuantisasi & Dekuantisasi

Untuk menguantisasi nilai riil $r$ ke nilai integer $q$:
$$q = \text{clamp}\left(\text{round}\left(\frac{r}{S} + Z\right), q_{\min}, q_{\max}\right)$$
Di mana operator $\text{clamp}(x, a, b) = \min(\max(x, a), b)$.

Untuk merekonstruksi perkiraan nilai riil $\hat{r}$ dari nilai terkuantisasi $q$ (dekuantisasi):
$$\hat{r} = S \times (q - Z)$$

### 2.4 Evaluasi Galat Rekonstruksi & Rasio Kompresi

1. **Mean Squared Error (MSE)**:
   $$\text{MSE} = \frac{1}{N} \sum_{i=1}^N (r_i - \hat{r}_i)^2$$
2. **Signal-to-Quantization-Noise Ratio (SQNR)**:
   $$\text{SQNR (dB)} = 10 \log_{10} \left( \frac{\sum_{i=1}^N r_i^2}{\sum_{i=1}^N (r_i - \hat{r}_i)^2} \right)$$
3. **Rasio Kompresi Memori (*Compression Ratio*)**:
   $$\text{Rasio} = \frac{\text{Ukuran FP32}}{\text{Ukuran INT8}} = \frac{32 \text{ bit}}{8 \text{ bit}} = 4.0\times \implies \text{Penghematan Memori } 75\%$$

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis dan deterministik proses kuantisasi satu vektor bobot/aktivasi lapisan konvolusi:

Rentang nilai riil tensor yang diperoleh dari kalibrasi:
- $r_{\min} = -2.0$
- $r_{\max} = 6.0$
- Target kuantisasi: Bilangan bulat 8-bit tak bertanda ($q_{\min} = 0, q_{\max} = 255$).

### Langkah 1: Menghitung Skala Kuantisasi $S$
$$S = \frac{r_{\max} - r_{\min}}{q_{\max} - q_{\min}} = \frac{6.0 - (-2.0)}{255 - 0} = \frac{8.0}{255} \approx 0.03137255$$

### Langkah 2: Menghitung Titik Nol $Z$
$$Z = \text{round}\left(-\frac{-2.0}{8.0 / 255}\right) = \text{round}\left(2.0 \times \frac{255}{8.0}\right) = \text{round}(63.75) = 64$$

Karena $64 \in [0, 255]$, $Z = 64$.

### Langkah 3: Menguantisasi Sampel Nilai Riil
Mari kita kuantisasi vektor sampel $\mathbf{r} = [-2.0, 0.0, 2.0, 6.0]^T$:

1. Untuk $r_0 = -2.0$:
   $$q_0 = \text{round}\left(\frac{-2.0}{8.0/255} + 64\right) = \text{round}(-63.75 + 64) = \text{round}(0.25) = 0$$
   Nilai $q_0 = 0$ (tepat pada batas minimum $q_{\min}$).
2. Untuk $r_1 = 0.0$:
   $$q_1 = \text{round}\left(\frac{0.0}{S} + 64\right) = \text{round}(64.0) = 64$$
   Nilai $0.0$ dipetakan secara eksak ke nilai integer $64$.
3. Untuk $r_2 = 2.0$:
   $$q_2 = \text{round}\left(\frac{2.0}{8.0/255} + 64\right) = \text{round}(63.75 + 64) = \text{round}(127.75) = 128$$
4. Untuk $r_3 = 6.0$:
   $$q_3 = \text{round}\left(\frac{6.0}{8.0/255} + 64\right) = \text{round}(191.25 + 64) = \text{round}(255.25) \to \text{clamp ke } 255$$

Vektor terkuantisasi: $\mathbf{q} = [0, 64, 128, 255]^T$.

### Langkah 4: Rekonstruksi (Dekuantisasi) & Evaluasi Galat
Mari kita hitung nilai dekuantisasi $\hat{r} = S \times (q - Z)$:
1. $\hat{r}_0 = \frac{8.0}{255} \times (0 - 64) = \frac{-512}{255} \approx -2.007843$ (Galat: $|-2.0 - (-2.007843)| = 0.007843$).
2. $\hat{r}_1 = \frac{8.0}{255} \times (64 - 64) = 0.000000$ (Galat: $0.000000$ eksak).
3. $\hat{r}_2 = \frac{8.0}{255} \times (128 - 64) = \frac{512}{255} \approx 2.007843$ (Galat: $0.007843$).
4. $\hat{r}_3 = \frac{8.0}{255} \times (255 - 64) = \frac{1528}{255} \approx 5.992157$ (Galat: $0.007843$).

Galat absolut maksimum $\approx 0.007843 \le \frac{S}{2} \approx 0.015686$, membuktikan bahwa proses kuantisasi 8-bit mempertahankan fidelitas numerik tinggi dengan tingkat galat jauh di bawah 1%.

---

## 4. Panduan Tiga Tingkat (Three-Tier Walkthrough)

### Tingkat 1: Konsep & Intuisi Sistem
Kuantisasi seperti membulatkan uang receh ke pecahan uang kertas terdekat. Kita kehilangan sedikit kepresisian sen, tetapi dompet menjadi jauh lebih ringan dan transaksi jual-beli dapat dilakukan empat kali lebih cepat karena kasir hanya menghitung angka bulat.

### Tingkat 2: Bedah Implementasi Kode Python
Skrip referensi `examples/example-01.py` mengimplementasikan fungsi kuantisasi affine murni NumPy tanpa membutuhkan runtime PyTorch. Skrip memverifikasi perhitungan $S$, $Z$, membandingkan nilai terkuantisasi terhadap nilai eksak, serta membuktikan penghematan memori dari representasi 32-bit ke 8-bit.

### Tingkat 3: Wawasan Praktis & Jebakan Produksi
> [!IMPORTANT]
> **Pilihan Kalibrasi Dataset**: Jangan menguantisasi model hanya berdasarkan nilai bobot statis (*weight-only*). Aktivasi per-layer membutuhkan dataset kalibrasi yang representatif (sekitar 100–500 gambar dari domain aplikasi sebenarnya) agar rentang dinamis $[r_{\min}, r_{\max}]$ tidak bias.

> [!TIP]
> **Kuantisasi Simetris vs Asimetris**: Untuk tensor bobot (*weights*), kuantisasi simetris ($Z = 0$, $r_{\max} = -r_{\min}$) sering dipilih karena menyederhanakan komputasi perkalian matriks GEMM pada perangkat keras Edge NPU.

---

## 5. Ringkasan & Kaitan Riset ISVWS 2026–2040

Dalam peta jalan penelitian **ISVWS 2026–2040**, model visi terkuantisasi INT8 dan INT4 menjadi prasyarat mutlak untuk menyematkan kemampuan pengenalan objek dan pemahaman adegan multimodal ke dalam node sensor nirkabel berdaya sangat rendah (*ultra-low power IoT nodes*) dan micro-aerial vehicles (MAV). Penguasaan matematika kuantisasi memastikan alumni ITERA siap merancang arsitektur Edge AI yang efisien, handal, dan mandiri secara energi.

