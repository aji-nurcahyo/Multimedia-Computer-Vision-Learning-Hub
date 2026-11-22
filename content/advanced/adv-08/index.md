# MODUL ADV-08: SISTEM VISI EFISIEN & ARSITEKTUR EDGE AI
## Model Compression, Integer Quantization, and Roofline Performance Profiling

**Kode Modul:** `ADV-08`  
**Level Akademik:** L3 — Advanced Curriculum (Persiapan Riset L4)  
**Pilar Riset:** Pillar 4 — Efficient Vision Systems (Roadmap ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 16 Jam (Teori, Aritmatika Titik Tetap, Kompresi Model, dan Analisis Roofline)  
**Prasyarat Kurikulum Inti:** Bab 41 (Dasar Deep Learning), Bab 43 (Transfer Learning), Bab 45 (Segmentasi), Bab 56 (Pemrosesan Real-Time), Bab 57 (Edge AI & Embedded CV), Bab 58 (Web Multimedia), Bab 59 (Optimasi Performa), Modul ADV-04 (Mekanisme Atensi)

---

## 1. Konteks Akademik & Tantangan Edge Computing

Dalam era kecerdasan visual modern, tantangan utama tidak lagi sebatas mencapai akurasi tertinggi pada server GPU cloud berkekuatan ribuan watt, melainkan **bagaimana model visi berkapasitas tinggi dapat dijalankan secara andal pada perangkat tepi (Edge AI)** dengan konsumsi daya rendah, latensi ketat, dan anggaran memori terbatas.

Skenario nyata di Sumatera—seperti kamera pintar pemantau kebakaran hutan di pedalaman, drone pengawas maritim Selat Sunda, atau sensor lalu lintas cerdas bertenaga panel surya di ITERA—menghadapi batasan fisik:
1. **Daya Listrik Sangat Terbatas (Power & Thermal Budget):** Perangkat edge (seperti NVIDIA Jetson Nano atau Raspberry Pi NPU) dibatasi anggaran daya $5 - 15\text{ W}$, di mana pemrosesan FP32 boros energi baterai.
2. **Keterbatasan Bandwidth Memori (Memory Wall):** Kecepatan komputasi prosesor modern tumbuh jauh lebih cepat daripada bandwidth memori DRAM. Sebagian besar lapisan konvolusi dan atensi menjadi *memory-bandwidth bound*.
3. **Fluktuasi Latensi (Tail Latency P99):** Sistem kendali otonom kritis membutuhkan garansi batas waktu eksekusi; latensi *worst-case* (P99) yang terlambat dapat memicu kegagalan sistemik.

Modul ini membekali mahasiswa dan peneliti rekayasa sistem dengan penguasaan:
- Formulasi matematika kuantisasi integer seragam (*Uniform Affine Quantization* INT8/INT4), faktor skala ($S$), dan titik nol ($Z$).
- Mekanisme pelatihan sadar kuantisasi (*Quantization-Aware Training* / QAT) menggunakan *Straight-Through Estimator* (STE).
- Teknik pemangkasan terstruktur (*Structured Channel Pruning*) berbasis magnitudo norma $L_1$.
- Evaluasi batas komputasi dan memori menggunakan *Roofline Performance Model* untuk membedakan lapisan *memory-bound* vs *compute-bound*.

---

## 2. Penurunan Matematis & Landasan Teoretis

### 2.1 Teori Kuantisasi Integer Seragam (Uniform Affine Quantization)

Kuantisasi memetakan nilai kontinu presisi tinggi $x \in [\alpha, \beta] \subset \mathbb{R}$ ke representasi bilangan bulat bernilai diskret $q \in [q_{\min}, q_{\max}] \subset \mathbb{Z}$ (misalnya $[0, 255]$ untuk UINT8 atau $[-128, 127]$ untuk INT8).

#### Pemetaan Forward (Quantization)
$$q = \text{clamp}\left( \left\lfloor \frac{x}{S} \right\rceil + Z, \; q_{\min}, \; q_{\max} \right)$$

di mana:
- $\lfloor \cdot \rceil$ menyatakan operasi pembulatan ke bilangan bulat terdekat (*round-to-nearest*).
- $S \in \mathbb{R}^+$ adalah faktor skala bilangan riil (*scale factor*):
  $$S = \frac{\beta - \alpha}{q_{\max} - q_{\min}}$$
- $Z \in \mathbb{Z}$ adalah titik nol bilangan bulat (*zero-point*) yang memetakan nilai riil $0.0$ secara eksak ke domain diskret (sangat penting untuk operasi padding zero pada konvolusi):
  $$Z = \text{clamp}\left( \left\lfloor \frac{q_{\min} \beta - q_{\max} \alpha}{\beta - \alpha} \right\rceil, \; q_{\min}, \; q_{\max} \right)$$

#### Pemetaan Inverse (Dequantization)
Rekonstruksi nilai kontinu mendekati nilai asli:
$$\hat{x} = S \cdot (q - Z)$$

#### Batas Galat Kuantisasi
Untuk sembarang nilai $x$ yang berada di dalam rentang non-jenuh $[\alpha, \beta]$:
$$|x - \hat{x}| \le \frac{S}{2}$$
Rasio Signal-to-Quantization-Noise Ratio (SQNR) teoritis untuk kuantisasi $b$-bit sinyal terdistribusi seragam adalah:
$$\text{SQNR} \approx 6.02 \cdot b + 1.76 \quad [\text{dB}]$$
Untuk $b = 8$ bit, SQNR teoritis mencapai $\approx 49.92\text{ dB}$, menjaga integritas fitur visual tanpa penurunan akurasi yang signifikan.

---

### 2.2 Straight-Through Estimator (STE) dalam QAT

Operasi pembulatan $\lfloor \cdot \rceil$ memiliki turunan nol hampir di mana-mana ($\frac{d\lfloor x \rceil}{dx} = 0$) dan tidak terdefinisi pada titik setengah integer, sehingga mematikan propagasi balik gradien (*gradient vanishing*).

Untuk memungkinkan pelatihan backpropagation pada Quantization-Aware Training (QAT), Bengio et al. (2013) merumuskan *Straight-Through Estimator* (STE):
$$\text{Forward:} \quad q = \text{quantize}(x)$$
$$\text{Backward:} \quad \frac{\partial \mathcal{L}}{\partial x} \approx \frac{\partial \mathcal{L}}{\partial q} \cdot \mathbf{1}_{\{ \alpha \le x \le \beta \}}$$

Gradien diteruskan secara langsung tanpa terputus jika nilai aktivasi berada dalam rentang dinamis terpotong, dan dibatalkan (diberi bobot nol) jika berada di daerah saturasi.

---

### 2.3 Pemangkasan Kanal Terstruktur (Structured Channel Pruning)

Pemangkasan tak terstruktur (*unstructured weight pruning*) menghasilkan matriks jarang (*sparse matrices*) acak yang tidak efisien dieksekusi pada akselerator perangkat keras dense konvensional. Sebaliknya, **Structured Channel Pruning** menghapus seluruh filter konvolusi 2D secara utuh:

Diberikan tensor bobot lapisan konvolusi $W \in \mathbb{R}^{C_{\text{out}} \times C_{\text{in}} \times K \times K}$:
1. Evaluasi skor kepentingan norma $L_1$ untuk setiap saluran keluaran $c \in \{1, \dots, C_{\text{out}}\}$:
   $$s_c = \|W_c\|_1 = \sum_{i=1}^{C_{\text{in}}} \sum_{u=1}^K \sum_{v=1}^K |W_{c, i, u, v}|$$
2. Tentukan ambang batas pemangkasan $\tau$ berdasarkan target rasio kompresi $P \in (0, 1)$.
3. Hapus saluran dengan $s_c < \tau$, menghasilkan tensor berdimensi lebih kecil yang langsung mengurangi kebutuhan memori dan FLOPs tanpa memerlukan pustaka sparse khusus.

---

### 2.4 Roofline Performance Model

Model Roofline (Williams et al. CACM 2009) menghubungkan karakteristik algoritma perangkat lunak dengan batas arsitektur perangkat keras:

#### 1. Intensitas Aritmatika (Arithmetic Intensity)
$$I = \frac{\text{Total Komputasi [FLOPs]}}{\text{Total Akses Memori DRAM [Bytes]}} \quad [\text{FLOPs/Byte}]$$

#### 2. Batas Kinerja Maksimum (Attainable Performance)
$$P_{\text{attainable}} = \min\left( P_{\text{peak}}, \; I \cdot B_{\text{peak}} \right) \quad [\text{FLOPs/detik}]$$
di mana:
- $P_{\text{peak}}$ adalah kapasitas komputasi puncak perangkat keras (GFLOPs/s).
- $B_{\text{peak}}$ adalah bandwidth memori puncak bus data (GB/s).

#### 3. Titik Lutut (Knee Point / Ridge Point)
$$I^* = \frac{P_{\text{peak}}}{B_{\text{peak}}} \quad [\text{FLOPs/Byte}]$$
- **Regim Memory-Bound ($I < I^*$):** Kinerja dibatasi oleh laju transfer data dari DRAM. Optimasi harus memfokuskan pada kuantisasi INT8/INT4 dan *operator fusion* untuk mengurangi lalu lintas memori.
- **Regim Compute-Bound ($I \ge I^*$):** Kinerja mencapai batas kapasitas ALU prosesor. Optimasi harus memfokuskan pada pemangkasan filter atau penyederhanaan arsitektur jaringan.

---

## 3. Contoh Numerik Terhitung (Worked Example)

Diberikan sebuah tensor bobot lapisan konvolusi dengan rentang nilai kontinu $x \in [-1.20, 2.60]$. Kita ingin menguantisasi tensor ini ke format **UINT8 seragam** ($q_{\min} = 0, q_{\max} = 255$).

1. **Perhitungan Faktor Skala $S$:**
   $$S = \frac{\beta - \alpha}{q_{\max} - q_{\min}} = \frac{2.60 - (-1.20)}{255 - 0} = \frac{3.80}{255} \approx 0.01490196$$

2. **Perhitungan Titik Nol Bilangan Bulat $Z$:**
   $$Z_{\text{raw}} = \frac{q_{\min} \beta - q_{\max} \alpha}{\beta - \alpha} = \frac{0 \cdot 2.60 - 255 \cdot (-1.20)}{3.80} = \frac{306.0}{3.80} \approx 80.526$$
   $$Z = \lfloor 80.526 \rceil = \mathbf{81}$$

3. **Uji Kuantisasi Nilai Representatif $x_1 = 0.00$:**
   $$q(0.00) = \left\lfloor \frac{0.00}{0.014902} \right\rceil + 81 = 0 + 81 = \mathbf{81}$$
   *Verifikasi Dekuantisasi:* $\hat{x}_1 = 0.014902 \cdot (81 - 81) = \mathbf{0.00}$ (Eksak sempurna, zero terjaga).

4. **Uji Kuantisasi Nilai Acak $x_2 = 1.45$:**
   $$q(1.45) = \left\lfloor \frac{1.45}{0.014902} \right\rceil + 81 = \lfloor 97.302 \rceil + 81 = 97 + 81 = \mathbf{178}$$
   *Dikuantisasi ke Integer:* $q = 178$.
   *Dekuantisasi Balik:* $\hat{x}_2 = 0.014902 \cdot (178 - 81) = 0.014902 \cdot 97 = \mathbf{1.44549}$.
   *Galat Kuantisasi:* $|x_2 - \hat{x}_2| = |1.45 - 1.44549| = 0.00451 \le \frac{S}{2} \approx 0.00745$.

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

1. **Judul Eksperimen:** Evaluasi Presisi Kuantisasi Affine INT8/INT4, Pemangkasan Kanal Terstruktur, dan Pemetaan Bottleneck Roofline pada Perangkat Edge.
2. **Tujuan:** Mengukur trade-off antara kompresi memori model, penurunan Signal-to-Quantization-Noise Ratio (SQNR), dan percepatan komputasi efektif di bawah batasan bandwidth memori.
3. **Hipotesis Teoretis:** Pada lapisan konvolusi resolusi spasial tinggi ($H, W \ge 64$), intensitas aritmatika bernilai rendah sehingga model beroperasi pada regim *memory-bound*; penerapan kuantisasi INT8 mereduksi konsumsi bandwidth sebesar $4\times$, melipatgandakan throughput tanpa degradasi akurasi signifikan.
4. **Spesifikasi Input:** Bobot konvolusi $64 \times 128 \times 3 \times 3$ sintetik berdistribusi normal $\mathcal{N}(0, \sigma^2)$ dan peta fitur spasial $32 \times 32$.
5. **Variabel Eksperimen:** Format presisi numerik (FP32, FP16, INT8, INT4), rasio pemangkasan kanal $P \in [0.0, 0.7]$, dan profil perangkat keras (TinyML vs Jetson Orin Nano).
6. **Protokol Eksekusi:**
   - Bangkitkan bobot konvolusi kontinu FP32.
   - Hitung parameter kuantisasi $S$ dan $Z$.
   - Simulasikan inferensi integer dan hitung dekuantisasi $\hat{W}$.
   - Terapkan pemangkasan kanal terstruktur berbasis norma $L_1$.
   - Hitung intensitas aritmatika $I$ dan petakan pada diagram Roofline.
   - Evaluasi distribusi latensi P50, P95, dan P99.
7. **Metrik Evaluasi:** Ukuran model (KB), Mean Absolute Error (MAE), SQNR (dB), Sparsitas (%), Throughput (GFLOPs), dan Latensi P95 (ms).
8. **Hasil Teramati:** INT8 menghasilkan kompresi memori $4\times$ dengan SQNR $> 40\text{ dB}$; intensitas aritmatika $I = 8.5\text{ FLOPs/Byte}$ bergeser dari memory-bound menuju knee-point optimal Jetson Nano.
9. **Analisis Kegagalan:** Kuantisasi ekstrem INT4 tanpa Quantization-Aware Training (QAT) menyebabkan penurunan SQNR di bawah $20\text{ dB}$, merusak aktivasi fitur spasial halus.
10. **Penjelasan Teoretis:** Rentang diskret INT4 yang hanya memiliki 16 bin memicu distorsi kuantisasi besar pada ekor distribusi bobot (*outlier clipping*).
11. **Rekomendasi Praktis:** Gunakan kuantisasi per-channel untuk bobot dan per-tensor untuk aktivasi; selalu lakukan kalibrasi rentang dinamis menggunakan dataset representatif minimal 100 sampel.
12. **Keterkaitan Kurikulum & Riset:** Merupakan landasan utama bagi **Research Track R05** (*Efficient Computer Vision & Edge AI Systems*) dan **Research Track R01** (*Edge Detection*).

---

## 5. Hubungan Jalur Riset (Research Connections)

- **Track R05 (Efficient Computer Vision & Edge AI Systems):** Eksplorasi Pareto frontier antara akurasi mAP vs FPS vs konsumsi daya (Watt) pada mikrokontroler dan SBC di ITERA.
- **Track R01 (Intelligent Visual Detection):** Deployment model detektor YOLO-Nano dan RT-DETR terkuantisasi INT8 pada platform drone pengawasan maritim.
- **Track R02 (Robust Multi-Object Tracking):** Optimasi pipeline ekstraksi embedding Re-ID agar beroperasi pada latensi $< 20\text{ ms}$ secara real-time.

