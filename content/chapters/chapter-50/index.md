# Bab 50 — Advanced Vision Model Evaluation

**Seksi Kurikulum:** Seksi 10 — Advanced Computer Vision  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Dalam rekayasa sistem visi komputer dan kecerdasan buatan terapan, evaluasi model seringkali disederhanakan secara keliru menjadi sekadar pelaporan metrik akurasi tunggal (*single accuracy metric*). Pada sistem visual dunia nyata—mulai dari deteksi cacat manufaktur industri, navigasi kendaraan otonom, hingga diagnosis citra medis radiologi—metrik akurasi sederhana terbukti sangat menyesatkan akibat ketidakseimbangan frekuensi kelas (*class imbalance*), ketidakpastian spasial kotak pembatas (*bounding box localization*), serta fenomena model jaringan syaraf tiruan modern yang sangat terlalu percaya diri (*overconfident*).

Evaluasi visi komputer tingkat lanjut (*Advanced Vision Model Evaluation*) menuntut metodologi holistik multidimensi yang membedah keandalan model dari empat pilar esensial:
1. **Ketelitian Deteksi & Lokalisasi (Detection & Localization Fidelity)**: Mengevaluasi trade-off sensitivitas dan spesifisitas pada aneka ambang batas keyakinan melalui kurva *Precision-Recall (PR)*, *Interpolated Average Precision (AP)*, dan *Mean Average Precision (mAP@[0.50:0.95])* standar MS COCO.
2. **Keandalan & Kalibrasi Probabilitas (Uncertainty & Calibration)**: Mengukur keselarasan antara skor probabilitas keluaran model (*confidence score*) dengan frekuensi empiris akurasi aktual melalui *Expected Calibration Error (ECE)*, *Brier Score*, dan diagram reliabilitas (*Reliability Diagrams*).
3. **Kekokohan Terhadap Pergeseran Distribusi (Robustness & OOD Generalization)**: Menguji ketahanan model terhadap gangguan fotometrik, distorsi kompresi JPEG, derau sensor gaussian, dan pergeseran domain *Out-of-Distribution (OOD)* (misalnya benchmark ImageNet-C).
4. **Profil Komputasi & Efisiensi Edge (System Efficiency & Latency Profiling)**: Memprofil distribusi latensi inferensi per frame (P50, P95, P99), *throughput* (frame per detik / FPS), jejak konsumsi memori (*peak VRAM footprint*), dan konsumsi daya termal pada perangkat keras tepi (*edge devices*).

---

## 2. Landasan Matematis & Algoritma

### 2.1 Formulasi Kurva Precision-Recall & Average Precision (AP)

Diberikan prediksi deteksi objek yang telah dicocokkan dengan kotak anotasi acuan (*ground-truth boxes*) berdasarkan ambang batas Intersection over Union ($\text{IoU} \ge \tau_{\text{IoU}}$):
- **True Positive (TP)**: Prediksi kotak deteksi dengan kelas benar dan $\text{IoU} \ge \tau_{\text{IoU}}$.
- **False Positive (FP)**: Kotak deteksi yang salah kelas, mendeteksi objek ganda yang berlebih (*duplicate detection*), atau memiliki $\text{IoU} < \tau_{\text{IoU}}$.
- **False Negative (FN)**: Objek ground-truth yang gagal terdeteksi oleh sistem sama sekali.

Metrik dasar dihitung sebagai:
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

```
+-------------------------------------------------------------------------+
|                  KURVA PRECISION-RECALL & INTERPOLASI                   |
+-------------------------------------------------------------------------+
 Precision P(r)
  1.0 +-----+
      |     \
      |      +------+
      |             \
  P   |              +-------+  <-- Kurva Asli (Zig-Zag)
      |              |.......|  <-- Kurva Terinterpolasi P_interp(r)
  0.0 +--------------+-------+--->
     0.0                    1.0  Recall r
```

Untuk menghilangkan fluktuasi zig-zag yang timbul akibat pergeseran ambang peringkat, standar PASCAL VOC dan MS COCO menerapkan **All-Point Precision Interpolation**:
$$P_{\text{interp}}(r) = \max_{\tilde{r} \ge r} P(\tilde{r})$$

Di mana nilai presisi pada recall $r$ diambil dari nilai presisi maksimum di sebelah kanannya. Average Precision (AP) dihitung sebagai luas area di bawah kurva terinterpolasi:
$$\text{AP} = \sum_{k=1}^n (R_k - R_{k-1}) P_{\text{interp}}(R_k)$$

Pada protokol evaluasi MS COCO, metrik utama adalah **mAP@[0.50:0.95]**, yang merata-ratakan nilai AP pada 10 ambang batas IoU bertahap ($\tau_{\text{IoU}} \in \{0.50, 0.55, 0.60, \dots, 0.95\}$) melintasi seluruh $C$ kategori kelas:
$$\text{mAP}@[0.50:0.95] = \frac{1}{C} \sum_{c=1}^C \left( \frac{1}{10} \sum_{t=0}^{9} \text{AP}_{c, \text{IoU}=0.50 + 0.05t} \right)$$

### 2.2 Kalibrasi Model & Expected Calibration Error (ECE)

Jaringan saraf tiruan berarsitektur dalam modern (seperti ResNet-152 atau Vision Transformer) memiliki kecenderungan mengalami kalibrasi buruk (*poor calibration*): model sering mengeluarkan confidence $p \approx 0.99$ meskipun probabilitas kebenaran empirisnya hanya 70%.

Model dikatakan terkalibrasi sempurna jika:
$$\mathbb{P}(\hat{Y} = Y \mid \hat{P} = p) = p, \quad \forall p \in [0, 1]$$

Untuk mengukurnya secara diskrit, seluruh $N$ prediksi sampel dikelompokkan ke dalam $M$ bin interval keyakinan sama lebar $B_m = (\frac{m-1}{M}, \frac{m}{M}]$ untuk $m \in \{1, \dots, M\}$.
Pada setiap bin $B_m$:
- Akurasi empiris:
  $$\text{acc}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} \mathbf{1}(\hat{y}_i = y_i)$$
- Rata-rata confidence model:
  $$\text{conf}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} \hat{p}_i$$

**Expected Calibration Error (ECE)** merumuskan rata-rata terbobot dari selisih absolut antara akurasi dan keyakinan:
$$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$$

Metrik pelengkap **Brier Score (BS)** mengevaluasi fungsi kuadrat kesalahan probabilitas prediksi:
$$\text{BS} = \frac{1}{N} \sum_{i=1}^N \sum_{k=1}^K (p_{ik} - y_{ik})^2$$
Di mana $y_{ik} \in \{0, 1\}$ adalah representasi one-hot ground-truth.

### 2.3 Post-Processing Kalibrasi: Temperature Scaling

Metode paling efisien untuk memperbaiki kalibrasi tanpa mengubah bobot jaringan dan tanpa menurunkan akurasi klasifikasi adalah **Temperature Scaling** (Guo et al., 2017):
$$\hat{p}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$
Di mana parameter skalar $T > 0$ dioptimalkan menggunakan minimasi Cross-Entropy / Negative Log-Likelihood (NLL) pada set validasi terpisah:
- $T > 1$ melunakkan logit (*softening probabilities*), mengurangi overconfidence.
- $T < 1$ mempertajam probabilitas (*sharpening*).

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita selesaikan secara analitik dan deterministik evaluasi satu set deteksi objek yang berisi 10 bounding box prediksi untuk satu kelas tertentu, dengan total objek nyata ground-truth $N_{\text{gt}} = 5$.

### Data Deteksi (Diurutkan Berdasarkan Skor Confidence Menurun):

| Peringkat | Confidence $\hat{p}$ | Hasil IoU Match | Status | Cum TP | Cum FP | Recall ($R$) | Precision ($P$) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | 0.95 | $\text{IoU} \ge 0.5$ | **TP** | 1 | 0 | $1/5 = 0.2000$ | $1/1 = 1.0000$ |
| 2 | 0.90 | $\text{IoU} \ge 0.5$ | **TP** | 2 | 0 | $2/5 = 0.4000$ | $2/2 = 1.0000$ |
| 3 | 0.82 | $\text{IoU} < 0.5$ | **FP** | 2 | 1 | $2/5 = 0.4000$ | $2/3 = 0.6667$ |
| 4 | 0.75 | $\text{IoU} \ge 0.5$ | **TP** | 3 | 1 | $3/5 = 0.6000$ | $3/4 = 0.7500$ |
| 5 | 0.68 | False detection | **FP** | 3 | 2 | $3/5 = 0.6000$ | $3/5 = 0.6000$ |
| 6 | 0.55 | $\text{IoU} \ge 0.5$ | **TP** | 4 | 2 | $4/5 = 0.8000$ | $4/6 = 0.6667$ |
| 7 | 0.45 | Background false | **FP** | 4 | 3 | $4/5 = 0.8000$ | $4/7 = 0.5714$ |
| 8 | 0.35 | Low IoU | **FP** | 4 | 4 | $4/5 = 0.8000$ | $4/8 = 0.5000$ |
| 9 | 0.25 | $\text{IoU} \ge 0.5$ | **TP** | 5 | 4 | $5/5 = 1.0000$ | $5/9 = 0.5556$ |
| 10 | 0.15 | Noise | **FP** | 5 | 5 | $5/5 = 1.0000$ | $5/10 = 0.5000$ |

### Langkah 1: Interpolasi Presisi Menurun ($P_{\text{interp}}$)
Hitung presisi maksimum untuk setiap tingkat recall dari kanan ke kiri:
- Pada $R = 1.00$: Nilai presisi yang tersedia adalah $\{0.5556, 0.5000\} \implies P_{\text{interp}}(1.00) = 0.5556$
- Pada $R = 0.80$: Presisi tersedia $\{0.6667, 0.5714, 0.5000, 0.5556, 0.5000\} \implies P_{\text{interp}}(0.80) = 0.6667$
- Pada $R = 0.60$: Presisi tersedia $\{0.7500, 0.6000, 0.6667, \dots\} \implies P_{\text{interp}}(0.60) = 0.7500$
- Pada $R = 0.40$: Presisi tersedia $\{1.0000, 0.6667, 0.7500, \dots\} \implies P_{\text{interp}}(0.40) = 1.0000$
- Pada $R = 0.20$: Presisi tersedia $\{1.0000, \dots\} \implies P_{\text{interp}}(0.20) = 1.0000$

### Langkah 2: Hitung Area Under Curve Average Precision (AP)
Integralkan kurva terinterpolasi pada interval perubahan recall $\Delta R = 0.20$:
$$\text{Segmen 1 } (R: 0.0 \to 0.2): \Delta R \times P_{\text{interp}} = 0.20 \times 1.0000 = 0.20000$$
$$\text{Segmen 2 } (R: 0.2 \to 0.4): \Delta R \times P_{\text{interp}} = 0.20 \times 1.0000 = 0.20000$$
$$\text{Segmen 3 } (R: 0.4 \to 0.6): \Delta R \times P_{\text{interp}} = 0.20 \times 0.7500 = 0.15000$$
$$\text{Segmen 4 } (R: 0.6 \to 0.8): \Delta R \times P_{\text{interp}} = 0.20 \times 0.6667 = 0.13334$$
$$\text{Segmen 5 } (R: 0.8 \to 1.0): \Delta R \times P_{\text{interp}} = 0.20 \times 0.5556 = 0.11112$$

$$\text{Total AP} = 0.20000 + 0.20000 + 0.15000 + 0.13334 + 0.11112 = 0.79446$$

### Langkah 3: Hitung Expected Calibration Error (ECE) pada 3 Bin
Bagi 10 sampel ke dalam 3 bin: $B_1 = [0.0, 0.4]$, $B_2 = (0.4, 0.7]$, $B_3 = (0.7, 1.0]$.
1. **Bin 1 ($p \le 0.40$)**:
   - Sampel: Peringkat 8 (0.35 FP), Peringkat 9 (0.25 TP), Peringkat 10 (0.15 FP).
   - Ukuran $|B_1| = 3$.
   - Rata-rata Confidence: $\text{conf}(B_1) = (0.35 + 0.25 + 0.15) / 3 = 0.75 / 3 = 0.2500$
   - Akurasi Empiris: $\text{acc}(B_1) = 1 / 3 \approx 0.3333$
   - Galat Kalibrasi: $|\text{acc} - \text{conf}| = |0.3333 - 0.2500| = 0.0833$

2. **Bin 2 ($0.40 < p \le 0.70$)**:
   - Sampel: Peringkat 5 (0.68 FP), Peringkat 6 (0.55 TP), Peringkat 7 (0.45 FP).
   - Ukuran $|B_2| = 3$.
   - Rata-rata Confidence: $\text{conf}(B_2) = (0.68 + 0.55 + 0.45) / 3 = 1.68 / 3 = 0.5600$
   - Akurasi Empiris: $\text{acc}(B_2) = 1 / 3 \approx 0.3333$
   - Galat Kalibrasi: $|\text{acc} - \text{conf}| = |0.3333 - 0.5600| = 0.2267$

3. **Bin 3 ($0.70 < p \le 1.00$)**:
   - Sampel: Peringkat 1 (0.95 TP), Peringkat 2 (0.90 TP), Peringkat 3 (0.82 FP), Peringkat 4 (0.75 TP).
   - Ukuran $|B_3| = 4$.
   - Rata-rata Confidence: $\text{conf}(B_3) = (0.95 + 0.90 + 0.82 + 0.75) / 4 = 3.42 / 4 = 0.8550$
   - Akurasi Empiris: $\text{acc}(B_3) = 3 / 4 = 0.7500$
   - Galat Kalibrasi: $|\text{acc} - \text{conf}| = |0.7500 - 0.8550| = 0.1050$

**Total ECE**:
$$\text{ECE} = \frac{3}{10}(0.0833) + \frac{3}{10}(0.2267) + \frac{4}{10}(0.1050) = 0.0250 + 0.0680 + 0.0420 = 0.1350$$

Nilai $\text{ECE} = 0.1350$ (13.50%) menunjukkan bahwa prediksi model memiliki deviasi kepercayaan rata-rata sebesar 13.5% dari reliabilitas statistis sebenarnya.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Akurasi Semu Akibat Ketidakseimbangan Ekstrem (*Class Imbalance Illusion*)**:
   - *Penyebab*: Pada dataset di mana objek negatif mendominasi 99.5% frame (misalnya deteksi pejalan kaki malam hari), model yang memprediksi nol secara konstan akan melaporkan akurasi 99.5%.
   - *Solusi Teknik*: Jangan pernah menggunakan metrik Accuracy skalar. Wajib gunakan kurva Precision-Recall, Average Precision (AP), dan Macro-averaged F1-Score.

2. **Model Terlalu Percaya Diri (*Overconfident Failure*)**:
   - *Penyebab*: Jaringan syaraf dalam yang dilatih dengan loss Cross-Entropy tanpa regularisasi mendorong logit tak hingga menuju batas margin, membuat model memprediksi confidence 98% bahkan ketika salah mendeteksi artefak derau.
   - *Solusi Teknik*: Terapkan *Label Smoothing* saat pelatihan, atau lakukan kalibrasi pasca-pelatihan (*post-hoc calibration*) menggunakan *Temperature Scaling*.

3. **Benchmarking Latensi Tidak Representatif (*Latency Tail Bias*)**:
   - *Penyebab*: Pengembang hanya mengukur rata-rata waktu komputasi batch besar di GPU workstation, mengabaikan overhead penyalinan memori (PCIe Host-to-Device transfer) dan variansi latensi ekstrim pada sistem real-time (P99 latency spikes).
   - *Solusi Teknik*: Catat distribusi latensi kuantil (P50, P95, P99), evaluasi cold-start latency, dan ukur end-to-end throughput menggunakan pipeline asynchronous non-blocking.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `VisionEvaluationDashboard.tsx` menyediakan visualisasi dinamis kurva Precision-Recall, diagram kalibrasi reliabilitas (ECE bar plot), dan penyesuaian slider ambang keyakinan dan IoU secara langsung.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi komputasi kumulatif TP/FP, interpolasi presisi all-point, nilai AP exact ($0.79446$), dan kalkulasi ECE ($0.1350$) secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Analisis Kalibrasi)**: Berkas `notebooks/chapter-50-lab.ipynb` mengimplementasikan pembuatan kurva PR multi-kelas, eksperimen kalibrasi temperature scaling, dan evaluasi latensi inferensi.

### 5.2 Panduan Eksekusi Notebook (`chapter-50-lab.ipynb`)
1. Buka Jupyter atau unggah berkas notebook ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 menginisialisasi pustaka dan mendeteksi runtime.
3. Sel 3 mengonstruksi data deteksi uji dan memvalidasi kalkulasi AP terinterpolasi.
4. Sel 4 mengevaluasi reliabilitas probabilitas melalui kalkulasi ECE dan Brier Score.
5. Sel 5 mendemonstrasikan algoritma perbaikan kalibrasi Temperature Scaling dan profiling waktu inferensi.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Pasangan skor keyakinan prediksi $\hat{p}_i \in [0, 1]$ dan label biner kesuksesan deteksi $y_i \in \{0, 1\}$.
- **Transformasi**:
  1. Pengurutan menurun berdasarkan keyakinan (*descending confidence sort*).
  2. Akumulasi TP dan FP untuk menghitung pasangan vektor $(R, P)$.
  3. Interpolasi monoton: $P_{\text{interp}}(r) = \max_{\tilde{r} \ge r} P(\tilde{r})$.
  4. Pengelompokan bin kalibrasi seragam dan selisih absolut $|\text{acc} - \text{conf}|$.
- **Output & Evaluasi**: Nilai skalar AP, skor kalibrasi ECE, dan grafik reliabilitas probabilitas.

---

## 6. Diagram Arsitektur Sistem

![Evaluasi Model Vision: Kurva Presisi-Recall & Metrik mAP](/media/diagrams/chapter-50-precision-recall-and-map.svg)

![Matriks Konfusi Multi-Kelas & Analisis Sensitivitas](/media/diagrams/chapter-50-confusion-matrix-and-roc-metrics.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Evaluasi sistem visi komputer modern memerlukan disiplin analisis kuantitatif yang melampaui metrik akurasi permukaan. Melalui kurva Precision-Recall dan metrik mAP@[0.50:0.95], para insinyur dapat memetakan trade-off ketelitian dan sensitivitas deteksi secara objektif. Melalui analisis kalibrasi ECE dan mitigasi pergeseran domain, sistem visi komputer yang dirancang terbukti memiliki keandalan tinggi dan siap dideploy secara aman pada aplikasi kritis industri dan sistem cerdas otonom.
