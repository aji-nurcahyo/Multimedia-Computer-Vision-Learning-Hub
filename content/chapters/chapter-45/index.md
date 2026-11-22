# Chapter 45 — Semantic & Instance Segmentation

## 1. Konsep & Motivasi Akademik
Segmentasi citra merepresentasikan tingkat pemahaman visual yang paling rinci (*fine-grained visual understanding*) dalam Computer Vision. Berbeda dengan klasifikasi yang memberikan label global pada satu citra utuh, atau deteksi objek yang membatasi target dengan bounding box persegi kasar, segmentasi melakukan prediksi kategori pada setiap piksel individual (*pixel-wise classification*).

Dalam literatur akademik modern, segmentasi terbagi menjadi tiga tingkatan tugas:
1. **Semantic Segmentation**: Mengelompokkan seluruh piksel citra ke dalam label semantik tertentu (misalnya jalan, mobil, pejalan kaki, langit). Seluruh objek dalam kelas yang sama diberi label identik tanpa membedakan individu objek (dua mobil yang berhimpitan dipetakan sebagai satu wilayah piksel "mobil" yang kontinu).
2. **Instance Segmentation**: Mengidentifikasi setiap entitas objek individual secara terpisah dan memprediksi masker biner piksel untuk masing-masing instansi (misalnya memisahkan "Mobil-1" dari "Mobil-2"). Hanya objek yang terhitung (*countable objects / things*) yang disegmentasi.
3. **Panoptic Segmentation** (Kirillov et al., 2019): Penyatuan menyeluruh dari segmentasi semantik dan instansi, di mana setiap piksel citra dipetakan ke pasangan label: identitas kelas dan identitas instansi (menggabungkan *stuff* yang tak terhitung seperti langit dan jalan dengan *things* seperti manusia dan kendaraan).

```
+-------------------------------------------------------------------------+
| Taksonomi Segmentasi Citra                                              |
|                                                                         |
| [1. Semantic]  : Setiap piksel -> Satu Kelas Semantik (Jalan, Mobil)    |
| [2. Instance]  : Setiap objek hal -> Masker Biner Individual (Mobil A, B)|
| [3. Panoptic]  : Penyatuan Lengkap Stuff (Latar) + Things (Objek)       |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Arsitektur Encoder-Decoder & U-Net (Ronneberger et al., 2015)
Tantangan matematis utama dalam segmentasi adalah paradoks resolusi spasial:
- Operasi konvolusi dan pooling pada encoder memperluas medan reseptif (*receptive field*) untuk menangkap semantik global tingkat tinggi, namun sekaligus mereduksi resolusi spasial dan mengaburkan batas kontur objek tajam.
- Decoder bertugas memproyeksikan kembali peta fitur beresolusi rendah ke resolusi spasial asli citra input ($H \times W$).

Arsitektur **U-Net** memecahkan paradoks ini melalui **Skip Connections** (koneksi lewati):
Peta fitur beresolusi tinggi dari jalur kontraksi (encoder) digabungkan secara langsung melalui konkatenasi kanal (*channel-wise concatenation*) ke peta fitur jalur ekspansi (decoder) pada tingkat hierarki yang bersesuaian:

$$\mathbf{X}_{\text{dec}}^{(l)} = \text{Conv}\left( \left[ \text{Up}\left(\mathbf{X}_{\text{dec}}^{(l+1)}\right) \, , \, \mathbf{X}_{\text{enc}}^{(l)} \right] \right)$$

di mana $\text{Up}(\cdot)$ adalah upsampling (transposed convolution atau bilinear interpolation) dan $[\cdot, \cdot]$ adalah konkatenasi sepanjang sumbu kanal. Mekanisme ini menyalurkan detail spasial piksel tepi beresolusi tinggi langsung ke lapisan output tanpa kehilangan informasi geometris.

### 2.2 Atrous / Dilated Convolution & DeepLab (Chen et al., 2017)
Alih-alih melakukan pooling yang merusak resolusi spasial, konvolusi berlubang (*atrous/dilated convolution*) memperluas medan reseptif tanpa menambah jumlah parameter komputasi. Untuk kernel 1D berukuran $K$ dan laju dilatasi $r \in \mathbb{N}^+$, respons keluaran dirumuskan:

$$y[i] = \sum_{k=0}^{K-1} x[i + r \cdot k] \cdot w[k]$$

Pada tingkat 2D, kernel $3 \times 3$ dengan laju dilatasi $r=2$ memiliki rentang spasial setara filter $5 \times 5$, namun hanya menggunakan 9 bobot aktif. Modul **Atrous Spatial Pyramid Pooling (ASPP)** menerapkan beberapa konvolusi dilatasi paralel dengan laju berbeda ($r \in \{6, 12, 18\}$) untuk menangkap konteks multi-skala secara efisien.

### 2.3 Fungsi Rugi: Pixel-wise Cross-Entropy & Soft Dice Loss
Tugas segmentasi sering kali dihadapkan pada ketimpangan kelas spasial yang ekstrem (misalnya lesi tumor hanya menempati 0.5% dari total piksel citra medis). Cross-Entropy murni akan didominasi oleh piksel latar belakang (*background*).

1. **Pixel-wise Categorical Cross-Entropy**:
   $$\mathcal{L}_{\text{CE}} = -\frac{1}{N} \sum_{i=1}^N \sum_{c=1}^C y_{i, c} \ln(p_{i, c})$$

2. **Soft Dice Loss** (berbasis Sørensen–Dice coefficient):
   $$\mathcal{L}_{\text{Dice}} = 1 - \frac{2 \sum_{i=1}^N p_i g_i + \epsilon}{\sum_{i=1}^N p_i^2 + \sum_{i=1}^N g_i^2 + \epsilon}$$
   di mana $p_i \in [0, 1]$ adalah probabilitas prediksi model pada piksel ke-$i$, $g_i \in \{0, 1\}$ adalah ground truth biner, dan $\epsilon$ adalah konstanta stabilitas numerik.

3. **Combined Loss**:
   $$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{CE}} + \lambda \mathcal{L}_{\text{Dice}}$$

### 2.4 Metrik Evaluasi: Mean Intersection over Union (mIoU)
Metrik standar emas pada evaluasi segmentasi adalah **mIoU**:

$$\text{mIoU} = \frac{1}{C} \sum_{c=1}^C \frac{TP_c}{TP_c + FP_c + FN_c}$$

di mana $TP_c, FP_c, FN_c$ dihitung berdasarkan agregasi piksel individual di seluruh set evaluasi.

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita hitung secara analitik metrik **Soft Dice Loss** dan **mIoU** pada citra biner sederhana berukuran $2 \times 2$ piksel (total 4 piksel):

### Data Ground Truth & Prediksi Probabilitas:
$$\mathbf{G} = \begin{bmatrix} 1 & 1 \\ 0 & 0 \end{bmatrix}, \quad \mathbf{P} = \begin{bmatrix} 0.90 & 0.80 \\ 0.20 & 0.10 \end{bmatrix}$$

### Langkah 1: Hitung Soft Dice Loss ($\epsilon = 1.0$)
1. Vektorkan matriks menjadi 1D:
   - $\mathbf{g} = [1, 1, 0, 0]$
   - $\mathbf{p} = [0.90, 0.80, 0.20, 0.10]$

2. Hitung perkalian titik $\sum p_i g_i$:
   $$\sum p_i g_i = (0.90 \cdot 1) + (0.80 \cdot 1) + (0.20 \cdot 0) + (0.10 \cdot 0) = 0.90 + 0.80 = 1.70$$

3. Hitung jumlah kuadrat $\sum p_i^2$ dan $\sum g_i^2$:
   $$\sum p_i^2 = 0.90^2 + 0.80^2 + 0.20^2 + 0.10^2 = 0.81 + 0.64 + 0.04 + 0.01 = 1.50$$
   $$\sum g_i^2 = 1^2 + 1^2 + 0^2 + 0^2 = 2.0$$

4. Hitung koefisien Soft Dice dan kerugian:
   $$\text{Dice} = \frac{2(1.70) + 1.0}{1.50 + 2.0 + 1.0} = \frac{3.40 + 1.0}{4.50} = \frac{4.40}{4.50} \approx 0.9778$$
   $$\mathcal{L}_{\text{Dice}} = 1 - 0.9778 = 0.0222$$

### Langkah 2: Hitung mIoU dengan Ambang Batas Biner ($\tau = 0.50$)
1. Binerisasi prediksi:
   $$\hat{\mathbf{Y}} = \begin{bmatrix} 1 & 1 \\ 0 & 0 \end{bmatrix}$$
2. Perbandingan dengan ground truth $\mathbf{G}$:
   - Seluruh 4 piksel cocok secara sempurna:
     - $TP = 2$ (piksel bernilai 1)
     - $TN = 2$ (piksel bernilai 0)
     - $FP = 0, FN = 0$
3. $\text{IoU}_{\text{foreground}} = \frac{2}{2 + 0 + 0} = 1.0000$
4. $\text{IoU}_{\text{background}} = \frac{2}{2 + 0 + 0} = 1.0000$
5. $\text{mIoU} = \frac{1.0 + 1.0}{2} = 1.0000 \quad (100\%)$

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Batas Kontur Objek Kabur (Fuzzy Boundaries)**:
   - *Penyebab*: Operasi upsampling bilinear standar cenderung menghasilkan transisi gradien probabilitas yang halus di sepanjang tepi kontur, mengaburkan batas pemisah antara dua objek yang berdekatan.
   - *Solusi Teknik*: Gunakan Boundary Loss (Kervadec et al., 2019) yang menghitung jarak Hausdorff, atau terapkan modul Conditional Random Fields (CRF) sebagai post-processing untuk menyelaraskan kontur prediksi dengan gradien intensitas citra asli.

2. **Ketimpangan Kelas Spasial Ekstrem (Class Imbalance)**:
   - *Penyebab*: Piksel latar belakang menutupi >98% area gambar, menyebabkan model memprediksi latar belakang di seluruh piksel dengan akurasi semu 98%.
   - *Solusi Teknik*: Gabungkan Focal Loss dengan Soft Dice Loss, atau terapkan Tversky Loss dengan bobot penalti false negative yang lebih tinggi ($\beta > \alpha$).

3. **Disparitas Skala Objek**:
   - *Penyebab*: Citra memuat objek dari kelas yang sama dalam rentang skala yang berbeda drastis (misal bus besar di latar depan dan mobil kecil di kejauhan).
   - *Solusi Teknik*: Gunakan modul ASPP (Atrous Spatial Pyramid Pooling) atau Feature Pyramid Decoder untuk mengagregasi representasi multi-skala secara adaptif.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `DeepSegmentationLab.tsx` menyediakan demonstrasi visual interaktif segmentasi jalan perkotaan (Cityscapes/PASCAL) dengan pengaturan transparansi masker dan visualisasi metrik IoU / Dice secara real-time di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memverifikasi konkatenasi tensor skip-connection U-Net $(1, 128, 64, 64)$, formulasi Soft Dice Loss ($0.0222$), dan metrik piksel mIoU ($1.0000$) tanpa dependensi pihak ketiga.
- **Mode C (Notebook Komputasi & DeepLabV3)**: Berkas `notebooks/chapter-45-lab.ipynb` mengintegrasikan model segmentasi mendalam `torchvision.models.segmentation.deeplabv3_mobilenet_v3_large` untuk memprediksi masker semantik 21 kelas PASCAL VOC.

### 5.2 Panduan Eksekusi Notebook (`chapter-45-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel secara berurutan. Sel 3 memvalidasi penggabungan kanal encoder dan decoder pada arsitektur U-Net.
3. Sel 6 mengimpor model DeepLabV3 pretrained resmi dari Torchvision, menyiapkan tensor citra NCHW $(1, 3, 256, 256)$, dan menghasilkan peta masker kelas berukuran $256 \times 256$ piksel.
4. Jika dijalankan di lingkungan CPU tanpa PyTorch, notebook mengeksekusi perhitungan analitis Soft Dice Loss dan mIoU secara deterministik dengan pesan panduan praktikum.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Citra digital RGB (format NCHW) dinormalisasi menggunakan rata-rata $\mu=[0.485, 0.456, 0.406]$ dan deviasi baku $\sigma=[0.229, 0.224, 0.225]$.
- **Proses Transformasi**:
  1. Feature Backbone (MobileNetV3 / ResNet-50) mengekstrak representasi semantik global.
  2. Atrous Spatial Pyramid Pooling (ASPP) menerapkan laju dilatasi bertingkat untuk menangkap konteks multi-skala.
  3. Classifier Head menghasilkan tensor logit berdimensi $(1, C, H, W)$ di mana $C=21$ kelas PASCAL VOC.
  4. Prediksi Piksel: Fungsi argmax sepanjang sumbu kanal menghasilkan matriks indeks kelas integer $(H, W)$.
- **Output & Evaluasi**:
  - Masker semantik per piksel, overlay visual semitransparan pada citra asli, dan skor evaluasi Mean IoU (mIoU) serta Dice Coefficient.

### 5.4 Masalah Umum & Troubleshooting Mahasiswa
- **Pita Kontur Salah Label pada Garis Tepi**: Pada dataset PASCAL VOC, batas luar objek diberi label batas khusus bernilai 255 (*void/ambiguous*). Pastikan mengatur `ignore_index = 255` pada Cross-Entropy Loss agar batas kontur tidak merusak nilai gradien.
- **Kekurangan Memori GPU (CUDA Out of Memory)**: Segmentasi resolusi tinggi membutuhkan memori besar karena peta aktivasi berdimensi $H \times W \times C$. Gunakan mixed precision FP16 (`torch.cuda.amp.autocast`) atau kecilkan batch size menjadi $2 - 4$.

---

## 6. Diagram Arsitektur Sistem

![Taksonomi Segmentasi: Semantik, Instansi, dan Panoptik](/media/diagrams/chapter-45-semantic-vs-instance-segmentation.svg)

![Arsitektur Jaringan U-Net & Skip Connections](/media/diagrams/chapter-45-unet-encoder-decoder-architecture.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Segmentasi citra menyediakan pemahaman spasial tingkat piksel yang menjadi prasyarat krusial pada sistem kemudi otonom (*self-driving cars*), navigasi robotika bedah medis, dan pemetaan geografis satelit. Arsitektur U-Net dengan koneksi lewati (*skip connections*) membuktikan bahwa resolusi geometri tinggi dapat dipulihkan secara elegan dari representasi laten yang dalam. Kombinasi fungsi kerugian berbasis overlap (Soft Dice Loss) dan Cross-Entropy merupakan standar mutlak dalam mengatasi ketimpangan kelas piksel dan menghasilkan segmentasi kontur yang tajam.
