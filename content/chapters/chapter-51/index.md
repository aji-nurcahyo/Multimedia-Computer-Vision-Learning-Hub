# Bab 51 — Introduction to Multimodal AI

**Seksi Kurikulum:** Seksi 11 — Multimodal AI  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Dalam dunia nyata, persepsi manusia dan kecerdasan alami tidak pernah beroperasi secara terisolasi pada satu indra saja. Saat kita mengamati lalu lintas jalan raya, mata kita menangkap gerakan spasial kendaraan, telinga kita mendengar bunyi klakson dan deru mesin, serta estimasi kedalaman visual membantu kita mengantisipasi tabrakan. **Multimodal AI** adalah cabang kecerdasan buatan dan visi komputer yang memproses, menyelaraskan, dan mengintegrasikan informasi dari berbagai modalitas sensorik yang berbeda—termasuk citra/video (visual), audio/akustik, teks alami, serta sinyal sensorik seperti kedalaman (RGB-D), radar gelombang milimeter (mmWave), dan unit pengukuran inersia (IMU).

Dalam kurikulum **Intelligent Computer Vision** dan peta jalan riset **ISVWS 2026–2040**, visi komputer (*Computer Vision*) diposisikan sebagai **modalitas jangkar utama (*primary visual anchor*)**. Modalitas pendukung—seperti sinyal suara, spektrum frekuensi radio radar, atau kedalaman spasial—berfungsi memperkuat, memverifikasi, dan melengkapi representasi visual, terutama pada skenario penutupan objek (*visual occlusion*), pencahayaan ekstrem (kabut tebal, malam hari), atau derau latar belakang.

Tantangan mendasar dalam Multimodal AI meliputi:
1. **Asimetri Representasi (*Representation Heterogeneity*)**: Citra 2D memiliki struktur spasial teratur $\mathbb{R}^{H \times W \times C}$, sedangkan audio adalah deret waktu 1D kontinu $\mathbb{R}^{T}$ (atau spektrogram waktu-frekuensi $\mathbb{R}^{F \times T}$), dan teks adalah token simbolik diskrit berdimensi variabel.
2. **Kesesuaian & Sinkronisasi Temporal (*Cross-Modal Temporal Alignment*)**: Tingkat sampling sensorik sangat berbeda (misal kamera 30 frame/detik vs audio 16.000 atau 44.100 sample/detik), sehingga penataan jendela waktu (*time-window alignment*) menjadi krusial.
3. **Ketidakpastian & Penurunan Kualitas Sensor (*Sensor Uncertainty & Missing Modalities*)**: Pada kondisi operasional nyata, salah satu sensor dapat mengalami kegagalan, derau tinggi, atau terputus secara tiba-tiba (*sensor dropout*). Arsitektur fusi yang baik wajib memiliki mekanisme adaptif terhadap reliabilitas masing-masing modalitas.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Taksonomi Paradigma Fusi Multimodal

Secara sistematis, strategi penggabungan modalitas visual dan sensor pendukung dibagi ke dalam tiga paradigma utama:

```
+-------------------------------------------------------------------------+
|                  TIGA PARADIGMA FUSI MULTIMODAL                         |
+-------------------------------------------------------------------------+

 (A) EARLY FUSION (Fusi Fitur Awal)
   Citra Visual  --> [ Visual Feature Extractor ] ---+
                                                      |--> [ Concatenation & L2-Norm ] --> [ Classifier ]
   Audio / Sensor -> [ Sensor Feature Extractor ] ---+

 (B) INTERMEDIATE FUSION (Fusi Antara / Cross-Attention)
   Fitur Visual  ---+----[ Cross-Modal Attention: Q_v, K_s, V_s ]----+--> [ Joint Latent ] --> [ Head ]
                    |                                                |
   Fitur Sensor  ---+----[ Cross-Modal Attention: Q_s, K_v, V_v ]----+

 (C) LATE FUSION (Fusi Keputusan Akhir)
   Citra Visual  --> [ CNN / ViT Backbone ]    --> Probabilitas P_v --+
                                                                      |--> [ Reliability Weighted Sum ]
   Audio / Sensor -> [ Audio / Sensor Backbone ] --> Probabilitas P_s --+
```

#### 1. Early Fusion (Feature-Level Fusion)
Fitur mentah atau representasi tingkat rendah diekstraksi dari masing-masing modalitas, dinormalisasi, lalu digabungkan secara langsung (misalnya konkatenasi vektor) sebelum masuk ke lapisan pemroses bersama:
$$\mathbf{z}_{\text{early}} = \left[ \mathbf{v}^T, \mathbf{a}^T, \mathbf{s}^T \right]^T \in \mathbb{R}^{D_v + D_a + D_s}$$
Agar modalitas dengan dimensi atau magnitudo besar tidak mendominasi, vektor hasil konkatenasi dinormalisasi secara $\ell_2$:
$$\mathbf{z} = \frac{\mathbf{z}_{\text{early}}}{\|\mathbf{z}_{\text{early}}\|_2 + \epsilon}$$
*Kelebihan*: Mampu menangkap korelasi antar-fitur paling awal.  
*Kekurangan*: Sangat rentan jika salah satu sensor mengalami kegagalan (*missing modality*) dan menuntut sinkronisasi waktu yang sangat presisi.

#### 2. Intermediate Fusion (Cross-Attention & Bottleneck Tokens)
Masing-masing modalitas diproses oleh encoder spesifik (misal ViT untuk citra dan AST untuk audio) hingga kedalaman tertentu, kemudian bertukar informasi melalui mekanisme *Cross-Attention* (Vaswani et al., 2017; Nagrani et al., 2021):
$$\mathbf{A}_{v \to s} = \text{Softmax}\left( \frac{\mathbf{Q}_v \mathbf{K}_s^T}{\sqrt{d_k}} \right) \mathbf{V}_s$$
Di mana kueri visual $\mathbf{Q}_v$ menarik informasi kontekstual yang relevan dari kunci $\mathbf{K}_s$ dan nilai $\mathbf{V}_s$ sensor sekunder.

#### 3. Late Fusion (Decision-Level Fusion)
Setiap modalitas memiliki jaringan klasifikasi mandiri yang menghasilkan vektor distribusi probabilitas kelas: $\mathbf{p}_v, \mathbf{p}_a, \mathbf{p}_s \in \Delta^{C-1}$. Keputusan akhir diperoleh melalui kombinasi terbobot:
$$\mathbf{p}_{\text{fused}} = \sum_{m=1}^M \alpha_m \mathbf{p}_m, \quad \text{dengan } \sum_{m=1}^M \alpha_m = 1, \quad \alpha_m \ge 0$$

### 2.2 Penentuan Bobot Reliabilitas Adaptif (*Uncertainty-Aware Fusion*)

Pada sistem kritis, bobot $\alpha_m$ tidak boleh bersifat konstan statis. Jika citra kamera buram akibat guncangan atau gelap gulita di malam hari, bobot visual harus diturunkan, dan sistem harus lebih mengandalkan audio atau radar.

Bobot modalitas $\alpha_m$ dapat dimodelkan berdasarkan varians ketidakpastian estimasi $\sigma_m^2$:
$$\alpha_m = \frac{1 / \sigma_m^2}{\sum_{k=1}^M (1 / \sigma_k^2)}$$

Atau menggunakan entropi informasi prediksi Shannon $\mathcal{H}(\mathbf{p}_m) = -\sum_{c=1}^C p_{mc} \log p_{mc}$:
$$\gamma_m = 1 - \frac{\mathcal{H}(\mathbf{p}_m)}{\log(C)}, \quad \alpha_m = \frac{\gamma_m}{\sum_{k=1}^M \gamma_k}$$
Di mana $\gamma_m \in [0, 1]$ mencerminkan tingkat keyakinan (*confidence level*) model $m$. Prediksi yang seragam (ragu-ragu) menghasilkan entropi maksimal sehingga bobotnya mengecil mendekati nol.

### 2.3 Analisis Komparatif: Kapan Fusi Meningkatkan atau Merusak Performa?

Fusi multimodal **tidak selalu** meningkatkan performa. Insinyur wajib memahami dua fenomena matematis:
1. **Peningkatan Performa (*Complementary Synergy*)**: Terjadi ketika modalitas memberikan informasi ortogonal yang saling melengkapi (misalnya visual memberikan lokasi spasial objek, sedangkan audio memberikan identitas suara mesin yang terhalang tirai).
2. **Degradasi Performa (*Negative Transfer / Catastrophic Noise Injection*)**: Terjadi jika salah satu modalitas memiliki tingkat derau (*Signal-to-Noise Ratio*) sangat rendah dan sistem menggunakan bobot rata-rata naif tanpa kalibrasi reliabilitas. Sinyal derau acak akan mencemari sinyal visual yang sudah akurat.

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita selesaikan secara manual dan analitis sebuah skenario deteksi peristiwa keselamatan jalan raya dengan 3 kelas target:
- **Kelas 0**: *Kendaraan Bermotor*
- **Kelas 1**: *Pejalan Kaki*
- **Kelas 2**: *Derau Lingkungan / Latar Belakang*

### Data Pengamatan Tiga Modalitas:
1. **Modalitas 1 (Kamera Visual - Utama)**:
   - Probabilitas: $\mathbf{p}_v = [0.70, 0.20, 0.10]^T$
   - Bobot keandalan sensor (kamera bersih, siang hari): $\gamma_v = 0.80$
2. **Modalitas 2 (Mikrofon Akustik - Sekunder)**:
   - Probabilitas: $\mathbf{p}_a = [0.40, 0.50, 0.10]^T$
   - Bobot keandalan sensor (kondisi angin kencang berisik): $\gamma_a = 0.40$
3. **Modalitas 3 (Radar mmWave - Sekunder)**:
   - Probabilitas: $\mathbf{p}_r = [0.85, 0.10, 0.05]^T$
   - Bobot keandalan sensor (deteksi pantulan radar stabil): $\gamma_r = 0.80$

---

### Langkah 1: Normalisasi Bobot Reliabilitas Modalitas
Hitung jumlah total bobot keandalan:
$$\sum_{m} \gamma_m = \gamma_v + \gamma_a + \gamma_r = 0.80 + 0.40 + 0.80 = 2.00$$

Hitung bobot normalisasi terkalibrasi $\alpha_m = \gamma_m / \sum \gamma$:
$$\alpha_v = \frac{0.80}{2.00} = 0.40$$
$$\alpha_a = \frac{0.40}{2.00} = 0.20$$
$$\alpha_r = \frac{0.80}{2.00} = 0.40$$

Perhatikan bahwa $\sum \alpha = 0.40 + 0.20 + 0.40 = 1.00$.

---

### Langkah 2: Hitung Fusi Terbobot Keandalan (Reliability-Weighted Late Fusion)
Kombinasikan distribusi probabilitas tiap kelas secara linier:
$$\mathbf{p}_{\text{fused}} = \alpha_v \mathbf{p}_v + \alpha_a \mathbf{p}_a + \alpha_r \mathbf{p}_r$$

- **Untuk Kelas 0 (Kendaraan)**:
  $$p_{\text{fused}}(0) = (0.40 \times 0.70) + (0.20 \times 0.40) + (0.40 \times 0.85) = 0.2800 + 0.0800 + 0.3400 = 0.7000$$

- **Untuk Kelas 1 (Pejalan Kaki)**:
  $$p_{\text{fused}}(1) = (0.40 \times 0.20) + (0.20 \times 0.50) + (0.40 \times 0.10) = 0.0800 + 0.1000 + 0.0400 = 0.2200$$

- **Untuk Kelas 2 (Derau)**:
  $$p_{\text{fused}}(2) = (0.40 \times 0.10) + (0.20 \times 0.10) + (0.40 \times 0.05) = 0.0400 + 0.0200 + 0.0200 = 0.0800$$

Jumlah probabilitas fusi:
$$\sum_{c=0}^2 p_{\text{fused}}(c) = 0.7000 + 0.2200 + 0.0800 = 1.0000 \quad (100\%)$$

**Keputusan Akhir**: Kelas 0 (*Kendaraan Bermotor*) terpilih dengan keyakinan sebesar $70.0\%$.

---

### Langkah 3: Komparasi Edukatif Terhadap Fusi Naif Rata-Rata (*Naive Late Fusion*)
Bandingkan jika sistem menggunakan bobot seragam tanpa memedulikan derau sensor ($\alpha_v = \alpha_a = \alpha_r = 1/3 \approx 0.3333$):
$$p_{\text{naive}}(0) = \frac{0.70 + 0.40 + 0.85}{3} = \frac{1.95}{3} = 0.6500$$
$$p_{\text{naive}}(1) = \frac{0.20 + 0.50 + 0.10}{3} = \frac{0.80}{3} \approx 0.2667$$
$$p_{\text{naive}}(2) = \frac{0.10 + 0.10 + 0.05}{3} = \frac{0.25}{3} \approx 0.0833$$

*Wawasan Kritis*: Fusi naif menurunkan keyakinan kelas benar dari $70.0\%$ menjadi $65.0\%$ akibat pengaruh negatif derau audio yang tidak terkalibrasi. Sebaliknya, fusi sadar-keandalan (*reliability-aware fusion*) melindungi integritas prediksi visual dan radar.

---

### Langkah 4: Simulasi Sensor Dropout (Lensa Kamera Tertutup / Hilang)
Bagaimana jika kamera visual tiba-tiba tertutup kotoran pekat ($\gamma_v = 0.0$)?
Total bobot baru: $\sum \gamma = 0.0 + 0.40 + 0.80 = 1.20$.
$$\alpha_a = \frac{0.40}{1.20} = \frac{1}{3} \approx 0.3333, \quad \alpha_r = \frac{0.80}{1.20} = \frac{2}{3} \approx 0.6667$$
$$p_{\text{fallback}}(0) = \left(\frac{1}{3} \times 0.40\right) + \left(\frac{2}{3} \times 0.85\right) = 0.1333 + 0.5667 = 0.7000$$
Sistem tetap mampu menghasilkan keputusan stabil berkat redundansi sensorik terkalibrasi.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Injeksi Derau Bencana (*Catastrophic Noise Injection / Negative Transfer*)**:
   - *Penyebab*: Memaksa penggabungan fitur mentah (Early Fusion) dari sensor yang sedang mengalami degradasi ekstrem tanpa modul pengurang bobot (*attenuation gating*).
   - *Solusi Teknik*: Gunakan arsitektur *gated cross-modal attention* atau *entropy-weighted late fusion* di mana sensor dengan ketidakpastian tinggi dinonaktifkan secara dinamis.

2. **Pergeseran Waktu Temporal (*Temporal Desynchronization / Timestamp Jitter*)**:
   - *Penyebab*: Kamera mengirim frame pada interval 33.3 ms, sedangkan data audio tiba dalam paket buffer periodik 20 ms dengan latensi transmisi jaringan tak merata (*jitter*).
   - *Solusi Teknik*: Gunakan sinkronisasi waktu perangkat keras (*hardware PTP timestamping*), interpolasi spline kubik sinyal temporal, atau penyelarasan berbasis korelasi silang (*cross-correlation peak matching*).

3. **Dominasi Modalitas Tunggal (*Modality Collapse / Modality Imbalance*)**:
   - *Penyebab*: Saat melatih model multimodal end-to-end, gradien dari modalitas yang lebih mudah dipelajari (misal teks atau citra tajam) mendominasi pembelajaran, sehingga encoder modalitas kedua gagal berkembang (*lazy modality*).
   - *Solusi Teknik*: Terapkan regularisasi *Gradient Blending* (Wang et al., 2020) atau lakukan tahapan *modality dropout* acak selama pelatihan agar model terbiasa mandiri.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `MultimodalPipelineExplorer.tsx` memfasilitasi penyesuaian bobot modalitas secara dinamis, pengujian skenario sensor dropout, dan visualisasi distribusi probabilitas fusi secara instan di peramban.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi komputasi konkatenasi awal, normalisasi $\ell_2$, fusi terbobot sadar-keandalan, dan penanganan kegagalan sensor secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Analisis Komparatif)**: Berkas `notebooks/chapter-51-lab.ipynb` memuat eksperimen komparasi komprehensif antara Early, Intermediate, dan Late Fusion, serta panduan integrasi model multimodal terdistribusi.

### 5.2 Panduan Eksekusi Notebook (`chapter-51-lab.ipynb`)
1. Buka antarmuka Jupyter Notebook lokal atau unggah ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 mendeteksi dependensi lingkungan komputasi.
3. Sel 3 mengonstruksi vektor fitur sintesis visual, akustik, dan radar serta memvalidasi contoh numerik Seksi 3 secara deterministik.
4. Sel 4 mengevaluasi ketahanan sistem terhadap skenario gangguan noise dan sensor dropout bertahap.
5. Sel 5 menyediakan spesifikasi pipeline fusi multimodal PyTorch untuk eksperimen komputasi lanjutan di cloud GPU.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Vektor fitur visual $\mathbf{v} \in \mathbb{R}^{D_v}$, audio $\mathbf{a} \in \mathbb{R}^{D_a}$, dan sinyal sensor $\mathbf{s} \in \mathbb{R}^{D_s}$ beserta bobot kepercayaan empiris $\gamma_m$.
- **Transformasi**:
  1. Penyelarasan skala melalui normalisasi $\ell_2$.
  2. Pembobotan reliabilitas ternormalisasi $\alpha_m = \gamma_m / \sum \gamma_k$.
  3. Proyeksi fusi linier dan evaluasi distribusi probabilitas posterior.
- **Output & Evaluasi**: Vektor probabilitas gabungan $\mathbf{p}_{\text{fused}}$, kelas prediksi dominan, serta metrik perbandingan performa fusi versus modalitas tunggal.

---

## 6. Diagram Arsitektur Sistem

![Tiga Paradigma Fusi Multimodal: Early, Intermediate, dan Late Fusion](/media/diagrams/chapter-51-multimodal-fusion-paradigms.svg)

![Arsitektur Perataan Representasi Ruang Vektor Multimodal](/media/diagrams/chapter-51-modality-representation-alignment.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Pendekatan multimodal mentransformasikan paradigma visi komputer klasik menjadi persepsi cerdas holistik. Dengan menempatkan visi komputer sebagai modalitas inti dan memanfaatkan sinyal akustik serta sensorik sebagai validator pelengkap, sistem memperoleh kekokohan tinggi dalam menghadapi aneka kegagalan lingkungan. Penguasaan atas dinamika fusi fitur, kompensasi ketidakpastian sensor, dan mitigasi *negative transfer* merupakan pondasi mutlak bagi perekayasa kecerdasan visual multimodal masa depan.
