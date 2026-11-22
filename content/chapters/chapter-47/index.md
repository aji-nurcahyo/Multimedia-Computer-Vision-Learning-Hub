# Chapter 47 — Human Pose Estimation & Landmark Detection

## 1. Konsep & Motivasi Akademik
Estimasi pose manusia (*human pose estimation*) dan deteksi titik tengara (*landmark detection*) adalah tugas dalam Computer Vision yang bertujuan melokalisasi sendi-sendi anatomi tubuh manusia (seperti hidung, mata, bahu, siku, pergelangan tangan, pinggul, lutut, dan pergelangan kaki) atau kontur fitur wajah dan tangan dari citra atau video digital. Informasi pose ini membentuk representasi struktural geometris yang sangat kompak untuk aplikasi analisis gerak atletik, interaksi manusia-komputer (*human-computer interaction*), animasi grafis, ergonomi kerja, hingga pengawasan keselamatan publik.

Dalam estimasi pose multi-orang (*multi-person pose estimation*), terdapat dua paradigma metodologi utama:
1. **Top-Down Approaches** (misalnya HRNet, SimpleBaseline):
   - Alur kerja dua tahap: Detektor objek (seperti YOLO atau Faster R-CNN) mendeteksi setiap kotak manusia terlebih dahulu, kemudian modul pose memprediksi keypoint individual di dalam setiap kotak yang terisolasi.
   - Kelebihan: Akurasi sangat tinggi karena citra manusia dinormalisasi ke skala seragam.
   - Kekurangan: Kompleksitas komputasi berbanding lurus dengan jumlah orang dalam citra ($\mathcal{O}(M)$ di mana $M$ adalah jumlah individu), sehingga lambat pada skenario kerumunan padat (*crowded scenes*).
2. **Bottom-Up Approaches** (misalnya OpenPose, HigherHRNet):
   - Alur kerja satu tahap: Jaringan mendeteksi seluruh keypoint dari semua orang sekaligus pada kanvas citra secara simultan, kemudian mengelompokkan (*associating / parsing*) keypoint menjadi kerangka tubuh individu menggunakan Part Affinity Fields (PAF) atau embedding asosiasi.
   - Kelebihan: Waktu inferensi konstan $\mathcal{O}(1)$ terlepas dari berapa pun jumlah orang dalam frame, ideal untuk video real-time.
   - Kekurangan: Rentan terhadap ambiguitas pengelompokan sendi saat orang saling berpelukan atau tumpang tindih (*heavy occlusion*).

```
+-------------------------------------------------------------------------+
| Paradigma Estimasi Pose Multi-Orang                                     |
|                                                                         |
| Top-Down:  [Citra] -> [Deteksi Manusia (Boxes)] -> [Crop & Pose per Box]|
|            Akurasi Tinggi, Komputasi skala O(M)                         |
|                                                                         |
| Bottom-Up: [Citra] -> [Deteksi Semua Keypoints] -> [Part Affinity Fields|
|            Waktu Inferensi Konstan O(1), Ideal Real-Time                |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Representasi Keypoint & Regresi Heatmap Gaussian
Secara historis, model awal mencoba meregresikan koordinat kontinu $(x_k, y_k)$ secara langsung menggunakan regresi L1/L2. Namun, regresi koordinat langsung bersifat sangat non-linier dan sensitif terhadap inisialisasi bobot. Paradigma modern menggunakan **Heatmap berbasis Gaussian 2D** untuk setiap keypoint ke-$k \in \{1, 2, \dots, K\}$.

Diberikan koordinat ground-truth keypoint $\mathbf{x}_k = (x_k, y_k)$, nilai intensitas target pada koordinat spasial $(i, j)$ dari heatmap $\mathbf{H}_k \in \mathbb{R}^{H \times W}$ dibangkitkan melalui fungsi Gaussian 2D tidak terpisahkan:

$$\mathbf{H}_k(i, j) = \exp\left( -\frac{(i - x_k)^2 + (j - y_k)^2}{2\sigma^2} \right)$$

di mana $\sigma$ adalah deviasi standar spasial yang menentukan radius toleransi sendi (biasanya $\sigma = 2$ atau $3$ piksel).

Fungsi kerugian pelatihan berupa Mean Squared Error (MSE) berbobot terhadap seluruh $K$ keypoint:

$$\mathcal{L}_{\text{pose}} = \frac{1}{K} \sum_{k=1}^K \sum_{i=1}^H \sum_{j=1}^W \left\| \hat{\mathbf{H}}_k(i, j) - \mathbf{H}_k(i, j) \right\|^2$$

### 2.2 Dekode Koordinat Sub-Piksel dari Heatmap
Pada saat inferensi, koordinat diskrit keypoint diperoleh melalui operasi puncak maksimum (*argmax*):

$$(u_k, v_k) = \arg\max_{i, j} \hat{\mathbf{H}}_k(i, j)$$

Untuk mencapai akurasi sub-piksel presisi tinggi dan mengimbangi reduksi resolusi akibat downsampling stride, diterapkan pergeseran gradien kuadratik lokal (*sub-pixel offset refinement*):

$$x_k^* = u_k + 0.25 \cdot \text{sign}\left(\hat{\mathbf{H}}_k(u_k+1, v_k) - \hat{\mathbf{H}}_k(u_k-1, v_k)\right)$$
$$y_k^* = v_k + 0.25 \cdot \text{sign}\left(\hat{\mathbf{H}}_k(u_k, v_k+1) - \hat{\mathbf{H}}_k(u_k, v_k-1)\right)$$

### 2.3 Metrik Evaluasi: PCK & Object Keypoint Similarity (OKS)
Standar baku evaluasi pose manusia meliputi:
1. **Percentage of Correct Keypoints (PCK)**:
   Proporsi keypoint terprediksi yang berada dalam ambang jarak normalisasi $\alpha \cdot D$ dari ground truth:
   $$\text{PCK} = \frac{1}{K} \sum_{k=1}^K \mathbf{1}_{\left[ \|\hat{\mathbf{x}}_k - \mathbf{x}_k\|_2 \le \alpha \cdot D \right]}$$
   di mana $D$ adalah diameter kepala (PCKh) atau ukuran torso bounding box.

2. **Object Keypoint Similarity (OKS)** (Standar Benchmark MS COCO):
   Menilai derajat tumpang tindih keypoint mirip IoU pada deteksi objek, dengan memperhitungkan variabilitas anotasi per jenis sendi:

   $$\text{OKS} = \frac{\sum_k \exp\left( -\frac{d_k^2}{2 s^2 \kappa_k^2} \right) \delta(v_k > 0)}{\sum_k \delta(v_k > 0)}$$

   di mana:
   - $d_k = \|\hat{\mathbf{x}}_k - \mathbf{x}_k\|_2$ adalah jarak Euclidean antara prediksi dan ground-truth.
   - $s$ adalah skala objek (akar luas bounding box manusia: $\sqrt{w \cdot h}$).
   - $\kappa_k$ adalah konstanta variabilitas anatomi sendi (misal $\kappa_{\text{mata}} = 0.025$ menuntut presisi sangat tinggi, sedangkan $\kappa_{\text{pinggul}} = 0.107$ memiliki toleransi lebih longgar).
   - $v_k$ adalah flag visibilitas ground truth ($v_k=0$: tidak beranotasi, $v_k=1$: terhalang/oklusi, $v_k=2$: terlihat jelas).

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita hitung secara analitik metrik **Object Keypoint Similarity (OKS)** untuk satu orang dengan 2 keypoint teranotasi (Hidung dan Pergelangan Tangan):

### Data Pengujian:
- Dimensi bounding box orang: $w = 100, h = 400$
  - Skala objek: $s = \sqrt{100 \times 400} = \sqrt{40000} = 200.0$ piksel
- **Keypoint 1: Hidung ($k=0$)**
  - Ground truth: $\mathbf{x}_0 = (50.0, 40.0)$, terlihat ($v_0 = 2$)
  - Prediksi: $\hat{\mathbf{x}}_0 = (52.0, 40.0)$
  - Konstanta anatomis hidung: $\kappa_0 = 0.026$
- **Keypoint 2: Pergelangan Tangan ($k=1$)**
  - Ground truth: $\mathbf{x}_1 = (80.0, 200.0)$, terlihat ($v_1 = 2$)
  - Prediksi: $\hat{\mathbf{x}}_1 = (84.0, 203.0)$
  - Konstanta anatomis pergelangan: $\kappa_1 = 0.062$

### Langkah 1: Hitung Jarak Euclidean $d_k$
- Hidung:
  $$d_0 = \sqrt{(52 - 50)^2 + (40 - 40)^2} = \sqrt{4 + 0} = 2.0 \text{ piksel}$$
- Pergelangan Tangan:
  $$d_1 = \sqrt{(84 - 80)^2 + (203 - 200)^2} = \sqrt{16 + 9} = \sqrt{25} = 5.0 \text{ piksel}$$

### Langkah 2: Hitung Normalisasi Variabilitas $2 s^2 \kappa_k^2$
- Hidung:
  $$s \cdot \kappa_0 = 200.0 \times 0.026 = 5.20$$
  $$2 (s \kappa_0)^2 = 2 \times 5.20^2 = 2 \times 27.04 = 54.08$$
- Pergelangan Tangan:
  $$s \cdot \kappa_1 = 200.0 \times 0.062 = 12.40$$
  $$2 (s \kappa_1)^2 = 2 \times 12.40^2 = 2 \times 153.76 = 307.52$$

### Langkah 3: Hitung Komponen Eksponensial OKS
- Komponen Hidung:
  $$\text{Sim}_0 = \exp\left( -\frac{d_0^2}{54.08} \right) = \exp\left( -\frac{4.0}{54.08} \right) = \exp(-0.07396) \approx 0.9287$$
- Komponen Pergelangan:
  $$\text{Sim}_1 = \exp\left( -\frac{d_1^2}{307.52} \right) = \exp\left( -\frac{25.0}{307.52} \right) = \exp(-0.08129) \approx 0.9219$$

### Langkah 4: Rata-rata OKS Total
$$\text{OKS} = \frac{0.9287 + 0.9219}{2} = \frac{1.8506}{2} = 0.9253 \quad (92.53\%)$$

Skor kesamaan keypoint objek adalah $0.9253$, membuktikan lokalisasi sendi yang sangat akurat.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Ambiguitas Oklusi Tubuh Sendiri (*Self-Occlusion*)**:
   - *Penyebab*: Sendi tertutup oleh anggota tubuh lain (misal tangan berada di belakang punggung saat menoleh), memicu prediksi heatmap palsu pada sendi yang simetris (kebingungan kiri vs kanan).
   - *Solusi Teknik*: Gunakan pemodelan graf keterhubungan spasial (*spatio-temporal graph CNN*) atau Transformer yang mempelajari batasan kinematika anatomi manusia.

2. **Skalabilitas Kerumunan Padat (*Crowd Occlusion*)**:
   - *Penyebab*: Kotak pembatas top-down memuat bagian tubuh dari 2 atau 3 individu sekaligus, menyebabkan detektor mendeteksi tangan orang lain.
   - *Solusi Teknik*: Beralih ke pendekatan bottom-up dengan Part Affinity Fields (PAF) atau gunakan Joint Representation Single-Stage Pose Networks.

3. **Jittering Temporal pada Video Streaming**:
   - *Penyebab*: Fluktuasi sub-piksel acak pada heatmap per frame menyebabkan getaran visual pada kerangka tulang.
   - *Solusi Teknik*: Terapkan filter temporal seperti One-Euro Filter atau Kalman Filter pada lintasan koordinat keypoint.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `HumanPoseExplorer.tsx` memvisualisasikan topologi 17 keypoint COCO (hidung, mata, telinga, bahu, siku, pergelangan, pinggul, lutut, pergelangan kaki), koneksi garis kerangka (*skeleton limbs*), serta visualisasi intensitas heatmap Gaussian interaktif di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi pembuatan heatmap Gaussian 2D, dekode koordinat argmax, dan kalkulasi analitis metrik OKS menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & PyTorch Pose Estimation)**: Berkas `notebooks/chapter-47-lab.ipynb` mengimplementasikan pembuatan heatmap multi-channel dan menyediakan panduan integrasi model pretrained (Keypoint R-CNN / YOLO-Pose).

### 5.2 Panduan Eksekusi Notebook (`chapter-47-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Jalankan sel secara berurutan. Sel 3 mengonstruksi generator heatmap Gaussian sintetis dan memverifikasi dekode koordinat sub-piksel.
3. Sel 5 mengeksekusi perhitungan metrik OKS dan memplot respon sensitivitas terhadap skala bounding box.
4. Jika PyTorch aktif di Colab, sel 6 menginstansiasi modul `KeypointRCNNPredictor` untuk inferensi 17 titik sendi tubuh manusia.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Citra digital RGB memuat sosok manusia berukuran $256 \times 192$ piksel.
- **Proses Transformasi**:
  1. Backbone (HRNet / ResNet) mengekstrak representasi fitur multi-resolusi.
  2. Deconvolutional Head menghasilkan tensor heatmap berukuran $(1, 17, 64, 48)$ di mana setiap kanal memuat satu jenis sendi.
  3. Argmax Spasial mengekstrak koordinat puncak intensitas $(u_k, v_k)$.
  4. Skala Balik: Memproyeksikan koordinat heatmap kembali ke resolusi citra input asli.
- **Output & Evaluasi**: Matriks koordinat 17 keypoint $(x_k, y_k, \text{conf}_k)$ dan visualisasi graf kerangka tubuh manusia.

---

## 6. Diagram Arsitektur Sistem

![Topologi 17 Landmark Human Pose Estimation (Format COCO)](/media/diagrams/chapter-47-human-pose-keypoints-topology.svg)

![Metode Regresi Heatmap vs Regresi Titik Langsung](/media/diagrams/chapter-47-heatmap-regression-architecture.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Estimasi pose manusia merepresentasikan jembatan krusial antara penglihatan komputer tingkat piksel dan pemahaman perilaku manusia tingkat tinggi. Transisi dari regresi koordinat langsung menuju regresi heatmap Gaussian 2D terbukti memberikan kestabilan konvergensi gradien yang luar biasa. Evaluasi berbasis Object Keypoint Similarity (OKS) menjamin penilaian performa yang realistis dengan memperhitungkan skala tubuh dan variabilitas anatomis setiap sendi manusia.
