# Chapter 46 — Vision Transformers & Attention

## 1. Konsep & Motivasi Akademik
Selama hampir satu dekade, Convolutional Neural Network (CNN) mendominasi seluruh paradigma Computer Vision berkat bias induktif (*inductive bias*) bawaannya: **invarian translasi** (*translation invariance*) dan **konektivitas lokal spasial** (*local receptive fields*). Namun, CNN memiliki keterbatasan intrinsik dalam memodelkan interaksi visual jarak jauh (*long-range global dependencies*), di mana pemahaman konteks menyeluruh hanya dapat dibangun secara bertahap melalui penumpukan lapisan konvolusi dan downsampling spasial berulang.

Pada tahun 2020, Dosovitskiy et al. memperkenalkan **Vision Transformer (ViT)** (*"An Image is Worth 16x16 Words"*), yang mendobrak hegemoni konvolusi dengan mengadaptasi arsitektur Transformer murni (Vaswani et al., 2017) langsung pada data citra digital. Berbeda dengan CNN yang memproses piksel melalui jendela geser lokal, ViT memperlakukan citra sebagai urutan token visual diskrit (*sequence of visual tokens*). Melalui mekanisme **Self-Attention**, setiap bagian citra dapat berinteraksi secara langsung dan simultan dengan seluruh area citra lainnya sejak lapisan pertama (*global receptive field at layer 1*).

```
+-------------------------------------------------------------------------+
| Pipeline End-to-End Vision Transformer (ViT)                           |
|                                                                         |
| [Citra Input HxWxC] -> [Ekstraksi Patch PxP] -> [Linear Projection]     |
|   Misal 224x224x3        196 Patch 16x16         Token Dimensi D=768    |
|                                                                         |
| -> [Concatenate [CLS] + Positional Embedding]                           |
| -> [Transformer Encoder Blocks (Multi-Head Self-Attention + MLP)]       |
| -> [MLP Classification Head pada Token [CLS]] -> Prediksi Probabilitas  |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Ekstraksi Patch Citra & Proyeksi Linier
Citra 2D $\mathbf{X} \in \mathbb{R}^{H \times W \times C}$ dipartisi menjadi $N$ buah patch non-overlapping berukuran $P \times P$, di mana jumlah token patch adalah:

$$N = \frac{H \cdot W}{P^2}$$

Setiap patch diratakan (*flattened*) menjadi vektor 1D berdimensi $P^2 \cdot C$, kemudian diproyeksikan secara linier ke ruang embedding berdimensi $D$ menggunakan matriks terpelajari $\mathbf{E} \in \mathbb{R}^{(P^2 \cdot C) \times D}$:

$$\mathbf{z}_0 = \left[ \mathbf{x}_{\text{class}} \, ; \, \mathbf{x}_p^1 \mathbf{E} \, ; \, \mathbf{x}_p^2 \mathbf{E} \, ; \, \dots \, ; \, \mathbf{x}_p^N \mathbf{E} \right] + \mathbf{E}_{\text{pos}}$$

di mana:
- $\mathbf{x}_{\text{class}} \in \mathbb{R}^{1 \times D}$ adalah token kelas terpelajari (*learnable class token*) [CLS] yang bertindak sebagai agregator representasi global citra untuk tugas klasifikasi downstream.
- $\mathbf{E}_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}$ adalah embedding posisi 1D terpelajari untuk mempertahankan informasi spasial urutan patch.
- $\mathbf{z}_0 \in \mathbb{R}^{(N+1) \times D}$ adalah tensor input awal menuju Transformer Encoder.

### 2.2 Proyeksi Matriks Query, Key, dan Value (Q, K, V)
Diberikan representasi urutan token pada lapisan ke-$l$, yaitu $\mathbf{Z} \in \mathbb{R}^{(N+1) \times D}$, representasi tersebut diproyeksikan ke tiga ruang vektor terpisah menggunakan matriks bobot yang dapat dipelajari:

$$\mathbf{Q} = \mathbf{Z} \mathbf{W}_Q, \quad \mathbf{K} = \mathbf{Z} \mathbf{W}_K, \quad \mathbf{V} = \mathbf{Z} \mathbf{W}_V$$

di mana $\mathbf{W}_Q, \mathbf{W}_K, \mathbf{W}_V \in \mathbb{R}^{D \times d_k}$, dan $d_k$ adalah dimensi proyeksi per head (biasanya $d_k = D / h$ dengan $h$ adalah jumlah attention heads).

### 2.3 Scaled Dot-Product Attention
Kekuatan hubungan atau afinitas antar setiap pasang token dihitung melalui produk titik (*dot product*) ternormalisasi:

$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Softmax}\left( \frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} \right) \mathbf{V}$$

di mana:
- Matriks afinitas $\mathbf{A} = \frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} \in \mathbb{R}^{(N+1) \times (N+1)}$ mengukur korelasi unnormalized antar token.
- Pembagi skala $\sqrt{d_k}$ mencegah produk titik bernilai ekstrem saat dimensi $d_k$ besar, yang dapat menyebabkan gradien fungsi Softmax mengalami saturasi mendekati nol (*vanishing gradient*).
- $\mathbf{S} = \text{Softmax}(\mathbf{A})$ merepresentasikan matriks bobot perhatian (*attention map*), di mana setiap baris berjumlah tepat $1.0$.

### 2.4 Multi-Head Self-Attention (MSA) & Kompleksitas Komputasi
Multi-Head Attention memungkinkan model untuk memperhatikan informasi secara bersamaan dari berbagai subruang representasi pada posisi yang berbeda:

$$\text{MSA}(\mathbf{Z}) = \left[ \text{head}_1 \, ; \, \text{head}_2 \, ; \, \dots \, ; \, \text{head}_h \right] \mathbf{W}_O$$
$$\text{head}_i = \text{Attention}\left( \mathbf{Z} \mathbf{W}_Q^i, \mathbf{Z} \mathbf{W}_K^i, \mathbf{Z} \mathbf{W}_V^i \right)$$

Kompleksitas komputasi self-attention berskala kuadrat terhadap jumlah token:

$$\mathcal{O}_{\text{attention}} = \mathcal{O}(N^2 \cdot D)$$

Untuk citra $224 \times 224$ dengan patch $16 \times 16$, $N=196$, komputasi sangat terjangkau. Namun untuk citra resolusi tinggi (misal $1024 \times 1024$, $N=4096$), komputasi kuadrat menjadi bottleneck utama yang mendorong lahirnya arsitektur hierarkis seperti Swin Transformer.

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita hitung secara analitik operasi **Scaled Dot-Product Attention** untuk urutan sederhana berisi 3 token ($N=3$) dengan dimensi representasi $d_k = 4$:

Diberikan matriks Query ($\mathbf{Q}$) dan Key ($\mathbf{K}$):

$$
\mathbf{Q} = \begin{bmatrix}
1.0 & 0.0 & 1.0 & 0.0 \\
0.0 & 2.0 & 0.0 & 1.0 \\
1.0 & 1.0 & 0.0 & 0.0
\end{bmatrix}, \quad
\mathbf{K} = \begin{bmatrix}
1.0 & 0.0 & 1.0 & 0.0 \\
0.0 & 1.0 & 0.0 & 2.0 \\
0.0 & 0.0 & 1.0 & 1.0
\end{bmatrix}
$$

Matriks Value ($\mathbf{V}$):

$$
\mathbf{V} = \begin{bmatrix}
10.0 & 0.0 \\
0.0 & 20.0 \\
5.0 & 5.0
\end{bmatrix}
$$

### Langkah 1: Hitung Perkalian Matriks $\mathbf{Q} \mathbf{K}^T$
$$
\mathbf{K}^T = \begin{bmatrix}
1.0 & 0.0 & 0.0 \\
0.0 & 1.0 & 0.0 \\
1.0 & 0.0 & 1.0 \\
0.0 & 2.0 & 1.0
\end{bmatrix}
$$

Hitung baris demi baris:
- **Baris 0 $\mathbf{Q}$** $\cdot \mathbf{K}^T$:
  - $A_{0, 0} = (1)(1) + (0)(0) + (1)(1) + (0)(0) = 2.0$
  - $A_{0, 1} = (1)(0) + (0)(1) + (1)(0) + (0)(2) = 0.0$
  - $A_{0, 2} = (1)(0) + (0)(0) + (1)(1) + (0)(1) = 1.0$
- **Baris 1 $\mathbf{Q}$** $\cdot \mathbf{K}^T$:
  - $A_{1, 0} = (0)(1) + (2)(0) + (0)(1) + (1)(0) = 0.0$
  - $A_{1, 1} = (0)(0) + (2)(1) + (0)(0) + (1)(2) = 4.0$
  - $A_{1, 2} = (0)(0) + (2)(0) + (0)(1) + (1)(1) = 1.0$
- **Baris 2 $\mathbf{Q}$** $\cdot \mathbf{K}^T$:
  - $A_{2, 0} = (1)(1) + (1)(0) + (0)(1) + (0)(0) = 1.0$
  - $A_{2, 1} = (1)(0) + (1)(1) + (0)(0) + (0)(2) = 1.0$
  - $A_{2, 2} = (1)(0) + (1)(0) + (0)(1) + (0)(1) = 0.0$

$$
\mathbf{Q} \mathbf{K}^T = \begin{bmatrix}
2.0 & 0.0 & 1.0 \\
0.0 & 4.0 & 1.0 \\
1.0 & 1.0 & 0.0
\end{bmatrix}
$$

### Langkah 2: Penskalaan dengan $\sqrt{d_k} = \sqrt{4} = 2.0$
$$
\frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} = \begin{bmatrix}
1.0 & 0.0 & 0.5 \\
0.0 & 2.0 & 0.5 \\
0.5 & 0.5 & 0.0
\end{bmatrix}
$$

### Langkah 3: Normalisasi Softmax pada Baris 0
- Nilai logit baris 0: $[1.0, 0.0, 0.5]$
- Eksponensial: $e^{1.0} \approx 2.7183, e^{0.0} = 1.0000, e^{0.5} \approx 1.6487$
- Jumlah: $\sum = 2.7183 + 1.0000 + 1.6487 = 5.3670$
- Probabilitas bobot perhatian ($S_0$):
  $$S_{0, 0} = \frac{2.7183}{5.3670} \approx 0.5065$$
  $$S_{0, 1} = \frac{1.0000}{5.3670} \approx 0.1863$$
  $$S_{0, 2} = \frac{1.6487}{5.3670} \approx 0.3072$$
  *(Verifikasi: $0.5065 + 0.1863 + 0.3072 = 1.0000$)*

### Langkah 4: Agregasi Vektor Value $\mathbf{O}_0 = \sum_{j} S_{0, j} \mathbf{V}_j$
$$\mathbf{O}_0 = 0.5065 \begin{bmatrix} 10.0 \\ 0.0 \end{bmatrix} + 0.1863 \begin{bmatrix} 0.0 \\ 20.0 \end{bmatrix} + 0.3072 \begin{bmatrix} 5.0 \\ 5.0 \end{bmatrix}$$
$$\mathbf{O}_0 = \begin{bmatrix} 5.065 + 0.000 + 1.536 \\ 0.000 + 3.726 + 1.536 \end{bmatrix} = \begin{bmatrix} 6.601 \\ 5.262 \end{bmatrix}$$

Hasil vektor representasi teragregasi untuk token ke-0 adalah $[6.601, 5.262]^T$.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Kekurangan Bias Induktif pada Dataset Kecil (Data Hunger)**:
   - *Penyebab*: Tanpa asumsi translasi dan lokalitas CNN, ViT murni yang dilatih dari awal pada dataset kecil (<100k citra) cenderung mengalami overfitting parah dan performanya jauh di bawah ResNet.
   - *Solusi Teknik*: Lakukan pretraining pada dataset berskala masif (ImageNet-21k atau JFT-300M) lalu lakukan transfer learning, atau tambahkan augmentasi intensif (RandAugment, Mixup, CutMix) serta regularisasi stochastic depth (drop path).

2. **Skalabilitas Kuadrat terhadap Resolusi Citra**:
   - *Penyebab*: Kompleksitas $\mathcal{O}(N^2)$ menyebabkan konsumsi memori GPU melonjak drastis saat memproses citra resolusi tinggi untuk deteksi objek atau segmentasi.
   - *Solusi Teknik*: Gunakan Swin Transformer (Shifted Windows Attention) yang membatasi komputasi perhatian dalam jendela lokal dengan kompleksitas linier $\mathcal{O}(N)$.

3. **Hilangnya Informasi Posisi Relatif**:
   - *Penyebab*: Embedding posisi absolut 1D standar gagal menangkap pergeseran skala dan orientasi 2D yang fleksibel saat resolusi inferensi berubah.
   - *Solusi Teknik*: Terapkan Relative Position Bias atau Rotary Position Embedding (RoPE) 2D.

4. **Relevansi Sistem Telekomunikasi & Transmisi Edge (Token Pruning & JSCC)**:
   - *Tantangan Transmisi*: Dalam arsitektur *split computing* (pemisahan komputasi antara perangkat IoT/sensor cerdas di edge dan server pusat via jaringan telekomunikasi seluler 4G/5G), pengiriman seluruh representasi token patch $N=196$ dengan dimensi $D=768$ membebani bandwidth kanal uplink dan meningkatkan latensi transmisi.
   - *Solusi Telekomunikasi*: Terapkan mekanisme *Token Pruning* berbasis skor perhatian (*attention score thresholding*). Patch yang merepresentasikan latar belakang seragam (*background redundancy*) dipangkas sebelum transmisi nirkabel, mereduksi payload bit data hingga $>60\%$ tanpa menurunkan akurasi klasifikasi downstream secara signifikan ($<0.5\%$). Selain itu, ViT encoder kini menjadi pilar dalam sistem *Semantic Communications* dan *Joint Source-Channel Coding* (JSCC), di mana token semantik visual ditransmisikan langsung melintasi kanal nirkabel berderau (*noisy fading channel*) dengan ketahanan derau yang jauh lebih tinggi daripada kompresi citra konvensional.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `VisionTransformerExplorer.tsx` menyediakan visualisasi ekstraksi patch citra, perubahan resolusi patch ($16 \times 16$ vs $32 \times 32$), peta bobot perhatian (*attention map*), dan kurva kompleksitas komputasi secara real-time langsung di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi pembagian patch $N=H \cdot W / P^2$, proyeksi matriks QKV, dan penghitungan Scaled Dot-Product Attention secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & PyTorch ViT)**: Berkas `notebooks/chapter-46-lab.ipynb` mengimplementasikan modul `VisionTransformerBlock` riil dalam PyTorch dan memandu pemuatan model pretrained `torchvision.models.vit_b_16`.

### 5.2 Panduan Eksekusi Notebook (`chapter-46-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Jalankan sel berurutan. Sel 3 mengeksekusi patchification dan self-attention NumPy.
3. Sel 6 memuat `torchvision.models.vit_b_16(weights=DEFAULT)` (lisensi BSD-3) dan memvisualisasikan peta atensi token [CLS] terhadap seluruh patch citra.
4. Jika dijalankan offline tanpa PyTorch, notebook mengeksekusi verifikasi analitis bobot atensi matematis secara bersih.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Citra digital RGB resolusi $224 \times 224 \times 3$.
- **Proses Transformasi**:
  1. Patchification: Memotong citra menjadi $14 \times 14 = 196$ patch berukuran $16 \times 16 \times 3$.
  2. Linear Embedding: Memproyeksikan patch 768D dan menyisipkan token [CLS] (total 197 token).
  3. Transformer Blocks: 12 layer Multi-Head Attention ($h=12$ heads, $d_k=64$).
  4. Output Head: Layer MLP membaca representasi akhir token [CLS] untuk memprediksi label kategori.
- **Output & Evaluasi**: Matriks Attention Map berdimensi $(197, 197)$ dan prediksi kelas ImageNet teratas.

---

## 6. Diagram Arsitektur Sistem

![Arsitektur Vision Transformer (ViT) & Patch Embedding](/media/diagrams/chapter-46-vit-patch-embedding-architecture.svg)

![Mekanisme Scaled Dot-Product Multi-Head Attention](/media/diagrams/chapter-46-multihead-self-attention-mechanism.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Vision Transformer menandai era baru dalam Computer Vision dengan membuktikan bahwa arsitektur perhatian umum tanpa bias induktif lokal mampu mengungguli CNN konvensional pada skala data besar. Kunci keunggulan ViT terletak pada fleksibilitas representasi global, pemodelan hubungan semantik antar bagian citra yang dinamis, serta kompatibilitas arsitektur terpadu (*unified architecture*) antara pemrosesan bahasa alami (NLP) dan penglihatan komputer.
