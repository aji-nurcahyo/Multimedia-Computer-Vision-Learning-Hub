# Chapter 42 — Image Classification with CNN

## 1. Konsep & Motivasi Akademik
Klasifikasi citra (*image classification*) merupakan tugas mendasar dalam Computer Vision di mana model menerima sebuah citra input $\mathbf{X} \in \mathbb{R}^{H \times W \times C}$ dan memprediksi satu label kategori diskrit $y \in \{1, 2, \dots, K\}$ dari ruang kelas yang telah ditentukan sebelumnya. Berbeda dengan klasifikasi data tabular, citra memiliki tantangan variabilitas visual yang ekstrem, meliputi variasi sudut pandang (*viewpoint variation*), perubahan skala objek, deformasi bentuk non-rigid, oklusi parsial, variasi iluminasi cahaya, dan kerumitan latar belakang (*background clutter*).

Evolusi arsitektur Convolutional Neural Network (CNN) modern memecahkan tantangan ini melalui desain topologi jaringan yang semakin dalam dan efisien:
- **VGG-16 / VGG-19** (Simonyan & Zisserman, 2014): Memperkenalkan prinsip modularitas dengan menumpuk filter kecil seragam $3 \times 3$, membuktikan bahwa kedalaman jaringan berkontribusi signifikan terhadap kapasitas diskriminatif.
- **ResNet-50 / ResNet-101** (He et al., 2016): Memecahkan *degradation problem* pada jaringan sangat dalam melalui mekanisme koneksi jalan pintas (*residual shortcut connections*), memungkinkan pelatihan jaringan dengan lebih dari 100 layer secara stabil.
- **EfficientNet** (Tan & Le, 2019): Menerapkan penskalaan gabungan (*compound scaling*) yang menyeimbangkan kedalaman (*depth*), lebar kanal (*width*), dan resolusi citra input (*resolution*).

```
+-------------------------------------------------------------------------+
| Pipeline End-to-End Klasifikasi Citra CNN                               |
|                                                                         |
| [Input Citra] -> [Data Augmentasi] -> [Feature Backbone] -> [GAP / FC]  |
|  224x224 RGB     Mixup / RandAug      ResNet / ConvNeXt      1000 Dim   |
|                                                                         |
|                                    -> [Softmax & Loss]                  |
|                                        Cross-Entropy / Top-1 Metric     |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Mekanisme Pembelajaran Residual (ResNet)
Pada jaringan feed-forward standar, sekumpulan layer non-linier bertingkat dilatih untuk mengaproksimasi pemetaan fungsi target dasar $\mathcal{H}(\mathbf{x})$. He et al. (2016) mengemukakan hipotesis bahwa membiarkan layer mengaproksimasi fungsi residual $\mathcal{F}(\mathbf{x}) = \mathcal{H}(\mathbf{x}) - \mathbf{x}$ jauh lebih mudah dioptimalkan. Pemetaan asli kemudian dirumuskan kembali sebagai:

$$\mathcal{H}(\mathbf{x}) = \mathcal{F}(\mathbf{x}, \{\mathbf{W}_i\}) + \mathbf{x}$$

di mana $\mathbf{x}$ dan $\mathcal{H}(\mathbf{x})$ masing-masing adalah vektor input dan output dari residual block, dan $\mathcal{F}$ adalah fungsi residual yang dipelajari (misalnya dua lapis konvolusi $3 \times 3$).

Keuntungan matematis utama dari perumusan ini terlihat jelas pada propagasi balik gradien. Dengan aturan rantai:

$$\frac{\partial \mathcal{E}}{\partial \mathbf{x}} = \frac{\partial \mathcal{E}}{\partial \mathcal{H}} \cdot \frac{\partial \mathcal{H}}{\partial \mathbf{x}} = \frac{\partial \mathcal{E}}{\partial \mathcal{H}} \cdot \left( \frac{\partial \mathcal{F}}{\partial \mathbf{x}} + \mathbf{I} \right)$$

Kehadiran matriks identitas $\mathbf{I}$ memastikan bahwa sinyal gradien $\frac{\partial \mathcal{E}}{\partial \mathcal{H}}$ dapat mengalir secara langsung (*highway shortcut*) kembali ke lapisan terdahulu tanpa teredam oleh perkalian bobot $\frac{\partial \mathcal{F}}{\partial \mathbf{x}}$, secara efektif meniadakan *vanishing gradient problem*.

### 2.2 Normalisasi Peluang Softmax & Kalibrasi Suhu
Untuk vektor logit mentah $\mathbf{z} = [z_1, z_2, \dots, z_K]^T \in \mathbb{R}^K$ dari classifier head, distribusi probabilitas prediksi posterior dihitung dengan operator Softmax terkalibrasi suhu $T$:

$$P(y = k \mid \mathbf{x}) = \hat{y}_k = \frac{\exp(z_k / T)}{\sum_{j=1}^{K} \exp(z_j / T)}$$

di mana suhu $T > 0$ mengontrol kehalusan (*smoothness*) probabilitas:
- $T \to 0$: Probabilitas mendekati distribusi deterministik *argmax* (one-hot).
- $T = 1.0$: Softmax standar.
- $T > 1.0$: Menghasilkan distribusi probabilitas yang lebih tersebar, sangat berguna untuk kalibrasi kepercayaan model (*model calibration*) dan *knowledge distillation*.

### 2.3 Fungsi Rugi & Regularisasi Lanjutan
Fungsi rugi standar Categorical Cross-Entropy pada pasangan data $(\mathbf{x}, y)$:

$$\mathcal{L}_{\text{CE}} = - \ln \left( \hat{y}_y \right) = - z_y + \ln \left( \sum_{j=1}^K \exp(z_j) \right)$$

Untuk mencegah model menjadi terlalu percaya diri (*overconfident*) pada kelas mayoritas, diterapkan teknik modern:
1. **Label Smoothing**: Mengganti target one-hot biner dengan probabilitas tertimbang:
   $$y_k^{\text{smooth}} = (1 - \epsilon) \cdot \mathbf{1}_{[k = y]} + \frac{\epsilon}{K}$$
2. **Mixup Regularization** (Zhang et al., 2017): Membentuk sampel pelatihan sintetik secara linier:
   $$\tilde{\mathbf{x}} = \lambda \mathbf{x}_i + (1 - \lambda) \mathbf{x}_j, \quad \tilde{\mathbf{y}} = \lambda \mathbf{y}_i + (1 - \lambda) \mathbf{y}_j, \quad \lambda \sim \text{Beta}(\alpha, \alpha)$$

### 2.4 Matriks Evaluasi Klasifikasi Multi-Kelas
Kinerja model dievaluasi secara komprehensif menggunakan matriks kontingensi (*confusion matrix*) berukuran $K \times K$:
- **Akurasi Top-1**: Proporsi sampel di mana kelas prediksi dengan probabilitas tertinggi cocok dengan ground truth:
  $$\text{Top-1 Acc} = \frac{1}{N} \sum_{i=1}^N \mathbf{1}_{[\arg\max_k \hat{y}_{i, k} = y_i]}$$
- **Akurasi Top-5**: Sampel dianggap benar jika ground truth berada dalam 5 kelas teratas probabilitas prediksi.
- **Precision, Recall, & F1-Score per Kelas**:
  $$\text{Precision}_c = \frac{TP_c}{TP_c + FP_c}, \quad \text{Recall}_c = \frac{TP_c}{TP_c + FN_c}, \quad F_{1, c} = \frac{2 \cdot \text{Precision}_c \cdot \text{Recall}_c}{\text{Precision}_c + \text{Recall}_c}$$
- **Macro F1-Score**: Rata-rata aritmatika unweighted dari F1-score seluruh kelas:
  $$\text{Macro } F_1 = \frac{1}{K} \sum_{c=1}^K F_{1, c}$$

---

## 3. Contoh Perhitungan Manual Terpandu

Misalkan model CNN 3-kelas (Kucing [0], Anjing [1], Burung [2]) menghasilkan logit mentah untuk satu sampel citra ground truth berlabel **Kucing ($y = 0$)**:

$$\mathbf{z} = [2.20, 1.10, -0.50]^T$$

### Langkah 1: Hitung Softmax Standar ($T = 1.0$)
1. Hitung eksponensial:
   $$e^{2.20} \approx 9.0250, \quad e^{1.10} \approx 3.0042, \quad e^{-0.50} \approx 0.6065$$
2. Hitung jumlah pembagi:
   $$\sum_{j=0}^2 e^{z_j} = 9.0250 + 3.0042 + 0.6065 = 12.6357$$
3. Probabilitas kelas:
   $$\hat{y}_0 = \frac{9.0250}{12.6357} \approx 0.7142 \quad (71.42\%)$$
   $$\hat{y}_1 = \frac{3.0042}{12.6357} \approx 0.2378 \quad (23.78\%)$$
   $$\hat{y}_2 = \frac{0.6065}{12.6357} \approx 0.0480 \quad (4.80\%)$$

### Langkah 2: Hitung Categorical Cross-Entropy Loss
Target ground-truth adalah kelas 0 ($y_0 = 1$):
$$\mathcal{L}_{\text{CE}} = -\ln(\hat{y}_0) = -\ln(0.7142) \approx 0.3366$$

### Langkah 3: Evaluasi Metrik Matriks Kontingensi
Misalkan pada kumpulan uji 100 sampel mini-dataset diperoleh matriks kontingensi berikut (Baris = Ground Truth, Kolom = Prediksi):

$$
\mathbf{C} = \begin{bmatrix}
35 & 5 & 2 \\
4 & 28 & 3 \\
1 & 2 & 20
\end{bmatrix}
$$

Untuk Kelas 0 (Kucing):
- $TP_0 = 35$
- $FP_0 = 4 + 1 = 5$ (kolom 0 di luar baris 0)
- $FN_0 = 5 + 2 = 7$ (baris 0 di luar kolom 0)

Hitung skor evaluasi:
$$\text{Precision}_0 = \frac{35}{35 + 5} = \frac{35}{40} = 0.8750 \quad (87.50\%)$$
$$\text{Recall}_0 = \frac{35}{35 + 7} = \frac{35}{42} \approx 0.8333 \quad (83.33\%)$$
$$F_{1, 0} = \frac{2 \cdot 0.8750 \cdot 0.8333}{0.8750 + 0.8333} = \frac{1.4583}{1.7083} \approx 0.8536$$

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Class Imbalance (Ketimpangan Distribusi Sampel)**:
   - *Gejala*: Model memiliki akurasi agregat tinggi (>90%), namun Recall pada kelas minoritas mendekati 0%.
   - *Solusi Teknik*: Gunakan Class-Weighted Cross-Entropy dengan bobot $w_c \propto \frac{1}{N_c}$, terapkan Focal Loss $\mathcal{L}_{\text{FL}} = -\alpha_t (1 - p_t)^\gamma \ln(p_t)$, atau lakukan oversampling adaptif.

2. **Overfitting & Shortcut Learning**:
   - *Gejala*: Akurasi training mencapai 99%, namun akurasi validasi terhenti di 70%. Model mengenali objek berdasarkan korelasi palsu latar belakang (*spurious correlations*), misalnya mengenali perahu hanya dari warna biru air laut.
   - *Solusi Teknik*: Tingkatkan augmentasi data spasial (Random Crop, Horizontal Flip, Color Jitter), terapkan CutMix/Mixup, tambahkan Dropout (0.2–0.5) sebelum linear head, dan tingkatkan koefisien weight decay.

3. **Overconfidence & Miscalibration**:
   - *Gejala*: Model memprediksi kelas salah dengan probabilitas keyakinan 99.8%.
   - *Solusi Teknik*: Terapkan Label Smoothing ($\epsilon = 0.1$) saat training dan lakukan post-hoc Temperature Scaling pada set validasi.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `ImageClassificationLab.tsx` memungkinkan mahasiswa memilih sampel citra (alam, teks, potret, tekstur) dan mengamati inferensi probabilitas Softmax secara real-time langsung di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` menguji operasi blok residual, kalibrasi temperatur Softmax, dan matriks kontingensi $3 \times 3$ secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & PyTorch ResNet-18)**: Berkas `notebooks/chapter-42-lab.ipynb` menyediakan pipeline lengkap klasifikasi benchmark CIFAR-10 menggunakan arsitektur ResNet-18 (11.17M parameter).

### 5.2 Panduan Eksekusi Notebook (`chapter-42-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Aktifkan GPU gratis di Google Colab melalui menu `Runtime -> Change runtime type -> T4 GPU`.
3. Jalankan sel berurutan. Sel 6 mendefinisikan pipeline augmentasi data CIFAR-10 resmi dan menginstansiasi model `torchvision.models.resnet18`.
4. Jika dijalankan di lingkungan lokal CPU tanpa PyTorch, notebook akan mengeksekusi simulasi analitis matriks kontingensi dan menampilkan spesifikasi protokol riset lengkap.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Dataset CIFAR-10 (60.000 citra warna beresolusi $32 \times 32$ piksel terbagi menjadi 10 kelas seimbang: pesawat, mobil, burung, kucing, rusa, anjing, katak, kuda, kapal, truk).
- **Proses Transformasi**:
  1. Data Augmentation: Random crop (padding 4) dan Random horizontal flip untuk mencegah penghafalan posisi spasial.
  2. Normalisasi Z-score: Pengurangan rata-rata $\mu=[0.4914, 0.4822, 0.4465]$ dan pembagian standar deviasi $\sigma=[0.2470, 0.2435, 0.2616]$.
  3. Feature Extraction: ResNet-18 mengekstrak 512 fitur global melalui koneksi residual skip highway.
  4. Classification Head: Fully connected layer memetakan 512 fitur ke 10 logit kelas.
- **Output & Evaluasi**:
  - Matriks Kontingensi $10 \times 10$ yang memetakan prediksi terhadap ground truth.
  - Metrik kuantitatif: Top-1 Accuracy (~95% pada pelatihan 200 epoch), Precision, Recall, dan Macro F1-Score.

### 5.4 Masalah Umum & Troubleshooting Mahasiswa
- **Data Leakage pada Normalisasi**: Menghitung mean/std dari gabungan seluruh dataset (termasuk test set) adalah pelanggaran metodologi serius. Selalu hitung statistik normalisasi secara eksklusif dari training set.
- **Overfitting Dini**: Ditandai dengan penurunan training loss mendekati nol sementara validation loss meningkat drastis. Solusi: Tambahkan weight decay ($5 \times 10^{-4}$) dan tingkatkan intensitas augmentasi RandAugment.

---

## 6. Diagram Arsitektur Sistem

![Arsitektur Pipeline Klasifikasi Citra Berbasis CNN](/media/diagrams/chapter-42-image-classification-pipeline.svg)

![Fungsi Kerugian Cross-Entropy & Distribusi Softmax](/media/diagrams/chapter-42-softmax-cross-entropy-loss.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Klasifikasi citra adalah fondasi dari seluruh aplikasi visi komputer tingkat lanjut. Keberhasilan model CNN modern ditopang oleh arsitektur residual (ResNet) yang menjamin stabilitas propagasi gradien pada jaringan dalam, penggunaan Global Average Pooling untuk parameter efficiency, serta strategi regularisasi canggih (Mixup, Label Smoothing). Pemahaman menyeluruh terhadap metrik per-kelas (Precision, Recall, F1) dan teknik penanganan ketidakseimbangan data sangat krusial untuk menghasilkan sistem visi yang andal dalam skenario dunia nyata.
