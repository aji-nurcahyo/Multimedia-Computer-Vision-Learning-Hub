# Chapter 43 — Transfer Learning & Fine-Tuning

## 1. Konsep & Motivasi Akademik
Melatih jaringan syaraf konvolusional (*Deep CNN*) dari nol (*from scratch*) dengan inisialisasi bobot acak membutuhkan jutaan citra teranotasi dan daya komputasi GPU berkekuatan tinggi yang sangat mahal. Di sisi lain, sebagian besar masalah Computer Vision di dunia nyata—seperti diagnosis medis radiologi, inspeksi visual cacat manufaktur, atau pemantauan keanekaragaman hayati—hanya memiliki beberapa ratus hingga ribuan sampel citra berlabel (*small-sample regime*). Melatih arsitektur besar seperti ResNet-50 dari nol pada dataset kecil hampir pasti memicu overfitting parah, di mana model hanya menghafal noise sampel tanpa mampu melakukan generalisasi.

**Transfer Learning** memecahkan dilema ini dengan mentransfer pengetahuan representasi visual yang telah dipelajari model dari domain sumber berskala masif (seperti ImageNet-1k dengan 1.28 juta citra atau LAION-5B) ke domain target spesifik. Berdasarkan temuan empiris penting oleh Yosinski et al. (2014) (*"How transferable are features in deep neural networks?"*):
1. **Fitur Lapisan Awal (General Features)**: Lapisan konvolusi pertama mengekstrak fitur visual universal—seperti detektor tepi Gabor, gradien kontras, dan blob warna—yang berlaku umum pada hampir semua jenis citra alami.
2. **Fitur Lapisan Akhir (Task-Specific Features)**: Lapisan-lapisan yang lebih dalam secara progresif mengombinasikan fitur dasar menjadi semantik khusus domain sumber (misalnya moncong anjing atau roda mobil).

Dengan mempertahankan bobot lapisan awal dan mengadaptasi lapisan akhir, kita dapat mencapai akurasi mutakhir dengan waktu konvergensi yang berlipat ganda lebih cepat serta data latih yang jauh lebih sedikit.

```
+-------------------------------------------------------------------------+
| Spektrum Strategi Adaptasi Transfer Learning                            |
|                                                                         |
| [1. Fixed Feature Extractor]                                            |
| Citra Input -> [Pretrained Backbone (FROZEN)] -> [New Head (TRAINABLE)] |
|                 Bobot W_pretrained dikunci          Gradien mengalir    |
|                                                                         |
| [2. Full / Layer-wise Fine-Tuning]                                      |
| Citra Input -> [Pretrained Backbone (LR = 1e-5)] -> [New Head (LR=1e-3)]|
|                 Discriminative Learning Rates       Pembaruan cepat     |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Domain & Task Formulation
Secara formal, suatu Domain $\mathcal{D}$ didefinisikan oleh ruang fitur $\mathcal{X}$ dan distribusi probabilitas marjinal $P(\mathbf{X})$, yaitu $\mathcal{D} = \{\mathcal{X}, P(\mathbf{X})\}$. Suatu Tugas $\mathcal{T}$ terdiri dari ruang label $\mathcal{Y}$ dan fungsi pemetaan prediktif $f(\cdot)$, yaitu $\mathcal{T} = \{\mathcal{Y}, f(\cdot)\}$, di mana $f(\mathbf{x}) = P(y \mid \mathbf{x})$.

Dalam konteks computer vision:
- **Domain Sumber**: $\mathcal{D}_S = \{\mathcal{X}_S, P(\mathbf{X}_S)\}$ dengan Tugas Sumber $\mathcal{T}_S = \{\mathcal{Y}_S, f_S(\cdot)\}$ (misal klasifikasi 1000 kelas ImageNet).
- **Domain Target**: $\mathcal{D}_T = \{\mathcal{X}_T, P(\mathbf{X}_T)\}$ dengan Tugas Target $\mathcal{T}_T = \{\mathcal{Y}_T, f_T(\cdot)\}$ (misal klasifikasi 10 kelas CIFAR-10 atau 2 kelas tumor medis).
- **Tujuan Transfer Learning**: Mempelajari fungsi prediktif target $f_T(\mathbf{x})$ memanfaatkan pengetahuan laten dari $\mathcal{D}_S$ dan $\mathcal{T}_S$, di mana $\mathcal{D}_S \neq \mathcal{D}_T$ atau $\mathcal{T}_S \neq \mathcal{T}_T$.

### 2.2 Taksonomi Strategi: Feature Extraction vs Fine-Tuning
Diberikan model yang dipartisi menjadi feature extractor backbone berbobot $\boldsymbol{\theta}_{\text{feat}}$ dan classification head berbobot $\mathbf{W}_{\text{head}}$:

1. **Fixed Feature Extractor (Linear Probing)**:
   Bobot backbone dibekukan (*frozen*), gradiennya disetel menjadi nol ($\nabla_{\boldsymbol{\theta}_{\text{feat}}} \mathcal{L} = \mathbf{0}$):
   $$\boldsymbol{\theta}_{\text{feat}}^{(t+1)} = \boldsymbol{\theta}_{\text{feat}}^{(t)}$$
   $$\mathbf{W}_{\text{head}}^{(t+1)} = \mathbf{W}_{\text{head}}^{(t)} - \eta \nabla_{\mathbf{W}_{\text{head}}} \mathcal{L}$$
   Metode ini sangat cepat, membutuhkan memori GPU minimal, dan mencegah perusakan representasi awal (*catastrophic forgetting*), ideal saat dataset target berukuran sangat kecil.

2. **Discriminative Fine-Tuning (Layer-wise Learning Rates)**:
   Seluruh jaringan diperbarui, namun dengan learning rate bertingkat yang menurun secara geometris dari classification head menuju lapisan awal backbone:
   $$\eta_l = \eta_{\text{base}} \cdot \gamma^{(L - l)}$$
   di mana $L$ adalah indeks layer terluar, $l$ indeks layer saat ini, dan $\gamma \in (0, 1)$ adalah faktor peluruhan (biasanya $0.7 \le \gamma \le 0.9$).

### 2.3 Penjadwalan Learning Rate: Cosine Annealing with Warmup
Untuk mencegah bobot klasifikasi kepala acak yang belum terkonvergensi merusak bobot pretrained backbone pada awal epoch (*gradient shock*), diterapkan fase **Linear Warmup** diikuti **Cosine Annealing**:

$$\eta_t = \begin{cases}
\eta_{\min} + \frac{t}{T_{\text{warm}}} (\eta_{\max} - \eta_{\min}) & \text{jika } t \le T_{\text{warm}} \\
\eta_{\min} + \frac{1}{2}(\eta_{\max} - \eta_{\min}) \left(1 + \cos\left(\frac{t - T_{\text{warm}}}{T_{\max} - T_{\warm}} \pi\right)\right) & \text{jika } t > T_{\text{warm}}
\end{cases}$$

### 2.4 Dilema Batch Normalization saat Fine-Tuning
Lapisan Batch Normalization (BN) mempertahankan running mean ($\boldsymbol{\mu}_{\text{run}}$) dan running variance ($\boldsymbol{\sigma}^2_{\text{run}}$). Saat fine-tuning dengan ukuran batch target yang sangat kecil (misal $B = 8$ atau $16$):
- Jika BN dibiarkan dalam mode *train*, statistik batch mini yang berisik akan merusak estimasi fitur representasional pretrained yang stabil.
- *Best Practice*: Kunci (*freeze*) lapisan Batch Normalization ke mode evaluasi (`model.eval()` untuk BN) sehingga BN hanya menggunakan statistik populasi pretrained aslinya:
  $$\hat{\mathbf{x}} = \frac{\mathbf{x} - \boldsymbol{\mu}_{\text{pretrained}}}{\sqrt{\boldsymbol{\sigma}^2_{\text{pretrained}} + \epsilon}} \odot \boldsymbol{\gamma} + \boldsymbol{\beta}$$

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita simulasikan secara analitik skenario penyesuaian bobot transfer learning dengan **Discriminative Learning Rates** dan penjadwalan laju pembelajaran.

### Skenario:
- Jaringan memiliki 3 blok lapisan berurutan: Layer 1 (Backbone Bawah), Layer 2 (Backbone Atas), Layer 3 (Classification Head).
- Laju pembelajaran dasar head: $\eta_3 = 1.0 \times 10^{-3} = 0.001$.
- Rasio peluruhan layer $\gamma = 0.1$.
- Sinyal gradien yang dihitung melalui backprop:
  - $\nabla_{\mathbf{W}_3} \mathcal{L} = 4.0$
  - $\nabla_{\mathbf{W}_2} \mathcal{L} = 2.0$
  - $\nabla_{\mathbf{W}_1} \mathcal{L} = 1.5$
- Bobot awal: $\mathbf{W}_1^{(0)} = 0.5000, \mathbf{W}_2^{(0)} = -0.3000, \mathbf{W}_3^{(0)} = 0.1000$.

### Langkah 1: Hitung Laju Pembelajaran Tiap Lapisan
$$\eta_3 = 0.001$$
$$\eta_2 = \eta_3 \cdot \gamma = 0.001 \cdot 0.1 = 0.0001$$
$$\eta_1 = \eta_2 \cdot \gamma = 0.0001 \cdot 0.1 = 0.00001$$

### Langkah 2: Hitung Pembaruan Bobot (Update Step)
1. **Layer 3 (Head)**:
   $$\Delta \mathbf{W}_3 = -\eta_3 \cdot \nabla_{\mathbf{W}_3} \mathcal{L} = -0.001 \cdot 4.0 = -0.0040$$
   $$\mathbf{W}_3^{(1)} = 0.1000 - 0.0040 = 0.0960$$

2. **Layer 2 (Backbone Atas)**:
   $$\Delta \mathbf{W}_2 = -\eta_2 \cdot \nabla_{\mathbf{W}_2} \mathcal{L} = -0.0001 \cdot 2.0 = -0.0002$$
   $$\mathbf{W}_2^{(1)} = -0.3000 - 0.0002 = -0.3002$$

3. **Layer 1 (Backbone Bawah)**:
   $$\Delta \mathbf{W}_1 = -\eta_1 \cdot \nabla_{\mathbf{W}_1} \mathcal{L} = -0.00001 \cdot 1.5 = -0.000015$$
   $$\mathbf{W}_1^{(1)} = 0.5000 - 0.000015 = 0.499985$$

### Analisis Kuantitatif:
Perubahan relatif pada bobot layer 3 adalah $\frac{0.004}{0.1} = 4\%$, sedangkan pergeseran pada representasi fitur dasar layer 1 hanya $\frac{0.000015}{0.5} = 0.003\%$. Hal ini membuktikan secara matematis bahwa fitur visual universal pada layer awal terlindungi dari kerusakan (*feature preservation*), sementara head beradaptasi secara agresif terhadap label kelas target.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Negative Transfer**:
   - *Penyebab*: Distribusi domain target sangat berbeda dengan domain sumber (misal mentransfer model ImageNet RGB ke citra tomografi medis 3D atau sinyal sonar), sehingga fitur visual yang ditransfer justru memperburuk performa dibandingkan model acak.
   - *Solusi Teknik*: Evaluasi jarak representasi (*Fréchet Inception Distance* atau representational similarity), gunakan model domain-spesifik (seperti Med3D atau BioMedCLIP), atau latih arsitektur dari awal jika dataset target cukup masif.

2. **Catastrophic Forgetting & Gradient Shock**:
   - *Penyebab*: Membuka seluruh layer untuk fine-tuning sejak epoch pertama dengan learning rate tinggi. Gradien besar dari classification head yang diinisialisasi secara acak seketika merusak seluruh representasi bermakna pada backbone pretrained.
   - *Solusi Teknik*: Gunakan strategi dua tahap (*two-stage training*): Tahap 1, bekukan backbone dan latih hanya classification head selama 5–10 epoch. Tahap 2, buka seluruh layer atau blok atas backbone dengan learning rate 10x–100x lebih rendah dan terapkan warmup.

3. **Overfitting pada Dataset Target Kecil**:
   - *Penyebab*: Parameter kapasitas model pretrained (misal 25 juta parameter ResNet-50) jauh melebihi ukuran sampel target ($N < 500$).
   - *Solusi Teknik*: Pertahankan backbone dalam kondisi beku (*frozen feature extractor*) dan hanya latih Linear Classifier / SVM, gunakan Dropout (0.5), dan terapkan data augmentasi intensif.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `TransferLearningExplorer.tsx` menyediakan visualisasi komparatif antara melatih model dari awal (*from scratch*) versus transfer learning bertahap (Feature Extraction vs Partial Fine-Tuning) langsung di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi rumus matematika Cosine Annealing, perhitungan discriminative learning rates, dan rasio pergeseran bobot (*weight drift*) menggunakan komputasi murni.
- **Mode C (Notebook Komputasi & PyTorch MobileNetV3)**: Berkas `notebooks/chapter-43-lab.ipynb` mengimplementasikan adaptasi model pretrained `torchvision.models.mobilenet_v3_small` pada dataset downstream.

### 5.2 Panduan Eksekusi Notebook (`chapter-43-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Jalankan sel berurutan. Sel 4 mengevaluasi peluruhan laju pembelajaran geometris $\eta_l = \eta_{\text{base}} \cdot \gamma^{(L-l)}$.
3. Sel 6 mengimpor `torchvision.models.mobilenet_v3_small(weights=DEFAULT)` (lisensi open BSD-3), membekukan parameter backbone dengan `param.requires_grad = False`, dan merekonstruksi Linear Classifier head untuk kelas target.
4. Jika dijalankan offline tanpa PyTorch, notebook mengeksekusi simulasi regresi logistik feature extraction deterministik dan membuktikan konvergensi loss.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Pasangan representasi fitur laten dari citra domain target (misal dataset Oxford-IIIT Pet atau citra medis mini-batch).
- **Proses Transformasi**:
  1. Pembekuan Bobot Backbone: Dari total 2.542.856 parameter MobileNetV3-Small, sebanyak 2.540.832 parameter dibekukan.
  2. Penggantian Head Klasifikasi: Lapisan linear terakhir diganti menjadi `nn.Linear(1024, num_classes)`.
  3. Rasio Bobot Dilatih: Hanya ~2.024 parameter (<0.1%) yang aktif menerima pembaruan gradien pada tahap awal.
- **Output & Evaluasi**:
  - Konvergensi cepat pada kurva validation loss dalam 5–10 epoch.
  - Penghematan waktu komputasi >85% dibandingkan pelatihan dari awal (*from scratch*).

### 5.4 Masalah Umum & Troubleshooting Mahasiswa
- **Lupa Mengunci Mode Batch Normalization**: Jika `model.train()` dipanggil tanpa menyetel layer BN ke `eval()`, statistik running mean/var ImageNet yang stabil akan tertimpa oleh statistik mini-batch target yang kecil dan berisik.
- **Learning Rate Head Terlalu Rendah**: Jika head baru yang masih berbobot acak dilatih dengan learning rate $10^{-5}$, model akan membutuhkan ratusan epoch untuk mulai mengenali pola. Gunakan $\eta \approx 10^{-3}$ untuk head baru dan $\eta \le 10^{-5}$ untuk backbone.

---

## 6. Diagram Arsitektur Sistem

![Strategi Transfer Learning: Feature Extraction vs Fine-Tuning](/media/diagrams/chapter-43-transfer-learning-strategies.svg)

![Penjadwalan Learning Rate & Kurva Konvergensi Transfer Learning](/media/diagrams/chapter-43-learning-rate-fine-tuning.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Transfer Learning adalah metodologi paling praktis dan efisien dalam Computer Vision modern. Dengan memanfaatkan fitur visual hierarkis yang telah teruji pada dataset skala masif, waktu pelatihan dapat dipersingkat drastis dengan kebutuhan sampel yang jauh lebih realistis. Keberhasilan transfer learning bergantung pada ketelitian perancangan strategi adaptasi: pembekuan backbone pada tahap awal, penerapan *discriminative learning rates*, pemeliharaan mode evaluasi pada Batch Normalization, dan mitigasi *negative transfer*.
