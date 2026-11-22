# Bab 49 — Self-Supervised & Foundation Vision Models

**Seksi Kurikulum:** Seksi 10 — Advanced Computer Vision  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Paradigma pembelajaran terawasi (*Supervised Learning*) telah membawa keberhasilan monumental dalam klasifikasi, deteksi, dan segmentasi citra. Kendati demikian, supervised learning memiliki kelemahan struktural mendasar: ketergantungannya yang ekstrem pada jutaan anotasi manual berlabel manusia (*human-labeled data*). Anotasi manual untuk tugas visi resolusi tinggi, segmentasi poligon piksel (*dense pixel masks*), dan kotak pembatas 3D memerlukan biaya finansial luar biasa, waktu eksekusi yang masif, serta rentan terhadap bias persepsi manusia.

**Self-Supervised Learning (SSL)** hadir sebagai perubahan paradigma revolusioner: melatih model visi komputer menggunakan data citra mentah tanpa label (*unlabeled raw visual data*) melalui perancangan tugas dalih (*pretext tasks*). Model dipaksa merekayasa representasi internal visual yang kaya makna semantik, invarian terhadap gangguan geometri dan fotometrik, serta mempertahankan informasi struktur global maupun lokal.

Representasi yang dipelajari melalui SSL menghasilkan **Foundation Vision Models**—model raksasa berdaya generalisasi tinggi yang dapat ditransfer ke ratusan tugas hilir (*downstream tasks*) seperti klasifikasi zero-shot, deteksi objek pada data langka (*few-shot object detection*), pencarian citra berbasis kemiripan semantik, dan segmentasi tanpa perlu pelatihan ulang dari nol (*transfer learning*).

Secara garis besar, lanskap Self-Supervised Learning modern terbagi ke dalam tiga metodologi utama:
1. **Contrastive Learning (e.g., SimCLR, MoCo)**: Memaksimalkan kesamaan representasi antara pandangan berbeda dari gambar yang sama (*positive pairs*) sembari menjauhkan representasi dari gambar-gambar yang berbeda (*negative pairs*).
2. **Masked Image Modeling (e.g., MAE - Masked Autoencoders)**: Mengadopsi prinsip BERT dalam pemrosesan bahasa alami dengan menyembunyikan sebagian besar citra (misalnya 75% patch piksel) dan melatih autoencoder untuk merekonstruksi kembali konten visual yang hilang.
3. **Self-Distillation / Non-Contrastive Learning (e.g., DINO, DINOv2, BYOL)**: Melatih jaringan siswa (*student network*) untuk mencocokkan distribusi probabilitas representasi jaringan guru (*teacher network*) yang diperbarui secara *Exponential Moving Average* (EMA) tanpa memerlukan pasangan sampel negatif.
4. **Multimodal Contrastive Foundation Models (e.g., CLIP)**: Memproyeksikan citra visual dan deskripsi teks alami ke dalam satu ruang embedding bersama (*joint multimodal embedding space*) berdimensi sama, memungkinkan inferensi *zero-shot* tanpa pelatihan spesifik kategori.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Contrastive Learning & Fungsi Rugi InfoNCE

Landasan utama pembelajaran kontrastif diturunkan dari teori informasi melalui minimasi batas bawah Mutual Information $I(X; Y)$. Diberikan vektor representasi kueri $\mathbf{q} \in \mathbb{R}^D$ yang dihasilkan dari transformasi data $t_1(\mathbf{x})$, representasi kunci positif $\mathbf{k}_+ \in \mathbb{R}^D$ dari transformasi alternatif $t_2(\mathbf{x})$, dan himpunan $K$ representasi kunci negatif $\mathcal{K}^- = \{\mathbf{k}_1^-, \mathbf{k}_2^-, \dots, \mathbf{k}_K^-\}$ yang berasal dari sampel citra lain dalam dataset.

Sebelum komputasi jarak, seluruh vektor representasi dinormalisasi secara $\ell_2$-norm:
$$\mathbf{q} \leftarrow \frac{\mathbf{q}}{\|\mathbf{q}\|_2}, \quad \mathbf{k} \leftarrow \frac{\mathbf{k}}{\|\mathbf{k}\|_2}$$

Kesesuaian semantik diukur menggunakan fungsi kesamaan kosinus (*cosine similarity*), yang ekuivalen dengan *dot product* pada vektor bernorma satu:
$$\text{sim}(\mathbf{u}, \mathbf{v}) = \mathbf{u} \cdot \mathbf{v} = \sum_{d=1}^D u_d v_d$$

Fungsi kerugian **InfoNCE** (Information Noise-Contrastive Estimation) dirumuskan sebagai:
$$\mathcal{L}_{\text{InfoNCE}}(\mathbf{q}, \mathbf{k}_+, \mathcal{K}^-) = -\log \frac{\exp\left( \frac{\mathbf{q} \cdot \mathbf{k}_+}{\tau} \right)}{\exp\left( \frac{\mathbf{q} \cdot \mathbf{k}_+}{\tau} \right) + \sum_{j=1}^K \exp\left( \frac{\mathbf{q} \cdot \mathbf{k}_j^-}{\tau} \right)}$$

Di mana:
- $\tau > 0$ adalah parameter temperatur skalar (*temperature hyperparameter*) yang mengontrol ketajaman distribusi probabilitas softmax.
- Derivasi teoretis membuktikan bahwa minimasi $\mathcal{L}_{\text{InfoNCE}}$ memaksimalkan batas bawah mutual information:
  $$I(\mathbf{q}; \mathbf{k}_+) \ge \log(K+1) - \mathcal{L}_{\text{InfoNCE}}$$

```
+-------------------------------------------------------------------------+
|                  ARSITEKTUR PEMBELAJARAN KONTRASTIF                     |
+-------------------------------------------------------------------------+
    Citra Mentah x
         |
    +----+----+
    |         |
 Transform t1  Transform t2
    |         |
 Citra Pandang x_i  Citra Pandang x_j
    |         |
 Encoder f(.)  Encoder f(.)
    |         |
 Representasi h_i  Representasi h_j
    |         |
 Proyektor g(.)  Proyektor g(.)
    |         |
 Embedding z_i   Embedding z_j  (Pasangan Positif: Tarik Dekat)
         \     /
       InfoNCE Loss  <--- Sampel Negatif z_k dari Batch (Dorong Jauh)
```

### 2.2 Peran Parameter Temperatur $\tau$

Nilai temperatur $\tau$ mengendalikan gradien penalti terhadap pasangan negatif sulit (*hard negatives*):
$$\frac{\partial \mathcal{L}_{\text{InfoNCE}}}{\partial (\mathbf{q} \cdot \mathbf{k}_j^-)} = \frac{1}{\tau} P(j)$$
Di mana $P(j)$ adalah probabilitas softmax sampel negatif ke-$j$.
- Jika $\tau$ sangat kecil ($\tau \to 0$), gradien menjadi sangat sensitif terhadap pasangan negatif paling mirip, mendorong batas pemisah (*margin*) yang sangat tegas namun rentan terhadap *gradient explosion* jika terdapat *false negatives*.
- Jika $\tau$ terlalu besar ($\tau \to \infty$), pembagian logit mendekati nol, probabilitas menjadi seragam (*uniform*), dan model kehilangan kemampuan membedakan detail semantik halus.
- Rentang empiris optimal pada literatur (SimCLR, MoCo) adalah $\tau \in [0.07, 0.2]$.

### 2.3 Masked Autoencoders (MAE)

Arsitektur Masked Autoencoders (He et al., 2022) menerapkan pendekatan generatif asimetris berbasis Vision Transformer:
1. **Masking Rasio Tinggi**: Citra input $\mathbf{I} \in \mathbb{R}^{H \times W \times C}$ dibagi menjadi $N$ patch berukuran $P \times P$. Sebagian besar patch (umumnya 75% atau $\rho = 0.75$) dibuang secara acak seragam.
2. **Encoder Asimetris**: Hanya 25% patch yang terlihat (*visible patches*) yang diproses oleh ViT Encoder besar. Ini memangkas kompleksitas komputasi menjadi hanya seperenambelas ($\approx 0.25^2 = 0.0625$).
3. **Decoder Ringan & Rekonstruksi**: Token representasi yang dipelajari digabungkan kembali dengan token *[mask]* yang dapat dipelajari (*learnable mask tokens*) untuk mengisi posisi spasial yang hilang, kemudian diproses oleh ViT Decoder kecil untuk merekonstruksi nilai piksel asli:
   $$\mathcal{L}_{\text{MAE}} = \frac{1}{|\mathcal{M}|} \sum_{i \in \mathcal{M}} \|\mathbf{x}_i - \hat{\mathbf{x}}_i\|_2^2$$
   Di mana $\mathcal{M}$ adalah himpunan indeks patch yang dimasker.

### 2.4 DINO & DINOv2: Distilasi Mandiri Tanpa Label

DINO (Caron et al., 2021) dan DINOv2 (Oquab et al., 2023) menghilangkan kebutuhan pasangan negatif menggunakan mekanisme *Self-Distillation*:
- **Jaringan Siswa ($g_{\theta_s}$)** dan **Jaringan Guru ($g_{\theta_t}$)** menerima sudut pandang transformasi berbeda dari gambar yang sama.
- Bobot guru diperbarui secara bertahap menggunakan *Exponential Moving Average* (EMA):
  $$\theta_t \leftarrow \alpha \theta_t + (1 - \alpha) \theta_s, \quad \alpha \in [0.996, 1.0]$$
- **Pencegahan Kolaps Representasi**: Dilakukan melalui teknik *Centering* dan *Sharpening*:
  $$P_t(i) = \frac{\exp\left( (g_{\theta_t}(x)_i - c_i) / \tau_t \right)}{\sum_k \exp\left( (g_{\theta_t}(x)_k - c_k) / \tau_t \right)}$$
  Centering ($c \leftarrow m c + (1-m) \frac{1}{B} \sum g_{\theta_t}(x)$) mencegah satu dimensi mendominasi, sedangkan sharpening ($\tau_t < \tau_s$) mencegah distribusi menjadi seragam (*uniform collapse*).

### 2.5 Contrastive Language-Image Pre-training (CLIP)

Model fondasi CLIP (Radford et al., 2021) melatih encoder citra $f_{\text{img}}$ dan encoder teks $f_{\text{txt}}$ secara bersamaan pada 400 juta pasangan citra-teks (WebImageText):
- Diberikan batch berukuran $N$, citra diubah menjadi embedding visual $\mathbf{I}_i = f_{\text{img}}(\mathbf{x}_i^{\text{img}})$ dan teks menjadi embedding bahasa $\mathbf{T}_j = f_{\text{txt}}(\mathbf{x}_j^{\text{txt}})$.
- Matriks kesamaan kosinus berukuran $N \times N$ dihitung: $S_{ij} = (\mathbf{I}_i \cdot \mathbf{T}_j) / \tau$.
- Fungsi rugi simetris menggabungkan cross-entropy arah citra-ke-teks dan teks-ke-citra:
  $$\mathcal{L}_{\text{CLIP}} = \frac{1}{2} \left( \mathcal{L}_{\text{img}\to\text{txt}} + \mathcal{L}_{\text{txt}\to\text{img}} \right)$$
- Kemampuan **Zero-Shot Transfer**: Untuk mengklasifikasikan citra ke dalam $C$ kelas, kelas diformat menjadi kalimat prompt, misalnya `"a photo of a {class_name}"`. Embedding citra dibandingkan dengan seluruh embedding prompt teks, dan kelas dengan kesamaan kosinus tertinggi dipilih.

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis dan bertahap fungsi rugi InfoNCE pada ruang representasi dua dimensi ($D=2$) dengan suhu $\tau = 0.1$:

### Data Masukan:
- Vektor Kueri: $\mathbf{q} = [0.8, 0.6]^T$ (Panjang norm: $\sqrt{0.8^2 + 0.6^2} = \sqrt{0.64 + 0.36} = 1.0$)
- Kunci Positif: $\mathbf{k}_+ = [0.7071068, 0.7071068]^T$ ($\|\mathbf{k}_+\| = 1.0$)
- Kunci Negatif 1: $\mathbf{k}_1^- = [-0.6, 0.8]^T$ ($\|\mathbf{k}_1^-\| = 1.0$)
- Kunci Negatif 2: $\mathbf{k}_2^- = [-0.8, -0.6]^T$ ($\|\mathbf{k}_2^-\| = 1.0$)
- Parameter Temperatur: $\tau = 0.1$

### Langkah 1: Hitung Kesamaan Kosinus (*Dot Product*)
1. Kesamaan Positif:
   $$s_+ = \mathbf{q} \cdot \mathbf{k}_+ = (0.8 \times 0.7071068) + (0.6 \times 0.7071068) = 0.5656854 + 0.4242641 = 0.9899495$$
2. Kesamaan Negatif 1:
   $$s_1^- = \mathbf{q} \cdot \mathbf{k}_1^- = (0.8 \times -0.6) + (0.6 \times 0.8) = -0.48 + 0.48 = 0.0000000$$
3. Kesamaan Negatif 2:
   $$s_2^- = \mathbf{q} \cdot \mathbf{k}_2^- = (0.8 \times -0.8) + (0.6 \times -0.6) = -0.64 - 0.36 = -1.0000000$$

### Langkah 2: Skalasi Logit dengan Temperatur $\tau = 0.1$
$$z_+ = \frac{s_+}{\tau} = \frac{0.9899495}{0.1} = 9.899495$$
$$z_1 = \frac{s_1^-}{\tau} = \frac{0.0000000}{0.1} = 0.000000$$
$$z_2 = \frac{s_2^-}{\tau} = \frac{-1.0000000}{0.1} = -10.000000$$

### Langkah 3: Evaluasi Fungsi Eksponensial $\exp(z)$
$$e_+ = \exp(9.899495) \approx 19920.613$$
$$e_1 = \exp(0.000000) = 1.000000$$
$$e_2 = \exp(-10.000000) \approx 0.0000454$$

Jumlah penyebut (*denominator sum*):
$$\sum_{\text{all}} = e_+ + e_1 + e_2 = 19920.613 + 1.000 + 0.0000454 = 19921.613$$

### Langkah 4: Hitung Probabilitas Posterior Pasangan Positif $P(+)$
$$P(+) = \frac{e_+}{\sum_{\text{all}}} = \frac{19920.613}{19921.613} \approx 0.9999498$$

### Langkah 5: Hitung Nilai Kerugian InfoNCE
$$\mathcal{L}_{\text{InfoNCE}} = -\ln(P(+)) = -\ln(0.9999498) \approx 5.02 \times 10^{-5} = 0.0000502$$

### Analisis Komparatif: Bagaimana jika Kueri Tidak Selaras?
Sebagai perbandingan edukatif, andaikan representasi belum konvergen sehingga pasangan positif hanya menghasilkan kesamaan $s_+ = 0.20$:
$$z_+ = \frac{0.20}{0.1} = 2.0 \implies e_+ = \exp(2.0) \approx 7.389056$$
$$\sum_{\text{all}} = 7.389056 + 1.0 + 0.0000454 = 8.389101$$
$$P(+) = \frac{7.389056}{8.389101} \approx 0.880792$$
$$\mathcal{L}_{\text{InfoNCE}} = -\ln(0.880792) \approx 0.12693$$

Terlihat jelas bahwa rugi InfoNCE melonjak dari $0.00005$ menjadi $0.12693$ ketika sudut spasial antara kueri dan pasangan positif melebar.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Kolaps Representasi (*Representation Collapse*)**:
   - *Penyebab*: Jaringan saraf memetakan seluruh citra masukan ke dalam satu vektor konstan tunggal ($\mathbf{z}_i = \mathbf{c}, \forall i$). Hal ini secara trivial menghasilkan jarak nol antara pandangan berbeda namun menghilangkan seluruh informasi diskriminatif.
   - *Solusi Teknik*: Gunakan pasangan negatif yang melimpah (InfoNCE), arsitektur non-simetris dengan operator *stop-gradient* (BYOL, SimSiam), atau mekanisme *centering and sharpening* pada model distilasi guru-siswa (DINO).

2. **Pengambilan Sampel Negatif Palsu (*False Negative Sampling*)**:
   - *Penyebab*: Pada dataset tak berlabel yang sangat besar, dua citra berbeda yang ditarik secara acak dalam satu batch seringkali berasal dari kelas semantik yang sama (misal dua gambar anjing golden retriever berbeda). Fungsi kontrastif baku akan secara keliru memaksa representasi keduanya saling menjauh.
   - *Solusi Teknik*: Terapkan *Debiased Contrastive Learning* yang memperhitungkan distribusi frekuensi kelas apriori, atau gunakan *Supervised Contrastive Learning (SupCon)* jika anotasi parsial tersedia.

3. **Instabilitas Gradien Akibat Pemilihan Temperatur $\tau$**:
   - *Penyebab*: Menyetel $\tau$ terlalu kecil ($< 0.03$) menghasilkan matriks probabilitas menyerupai one-hot encoding ekstrem, di mana gradien terkonsentrasi hanya pada satu pasangan outlier, memicu osilasi bobot dan ledakan numerik.
   - *Solusi Teknik*: Batasi parameter temperatur $\tau \ge 0.07$ atau jadikan parameter temperatur sebagai variabel yang dapat dipelajari secara logaritmik ($\tau = \exp(-w)$) sebagaimana diterapkan pada CLIP.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `VisionEmbeddingExplorer.tsx` menyediakan visualisasi 2D ruang embedding bersama multimodal, proyeksi t-SNE/PCA titik data citra dan teks, serta simulasi klasifikasi zero-shot secara instan di peramban.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi komputasi kesamaan kosinus, matriks kesamaan $N \times N$, fungsi rugi InfoNCE, dan analisis variasi temperatur secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Model Fondasi)**: Berkas `notebooks/chapter-49-lab.ipynb` mengimplementasikan ekstraksi fitur visual dan teks, simulasi klasifikasi zero-shot berbobot kosinus, serta panduan memuat bobot OpenCLIP/DINOv2.

### 5.2 Panduan Eksekusi Notebook (`chapter-49-lab.ipynb`)
1. Buka Jupyter atau unggah berkas notebook ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 mendeteksi ketersediaan modul komputasi PyTorch / GPU.
3. Sel 3 mengonstruksi matriks embedding sintesis dan mengomputasi kesamaan kosinus serta loss InfoNCE secara analitis.
4. Sel 4 mengevaluasi sensitivitas kerugian InfoNCE terhadap variasi temperatur $\tau \in [0.05, 1.0]$.
5. Sel 5 menyediakan kode inferensi zero-shot berbasis model fondasi CLIP untuk klasifikasi tanpa training.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Pasangan vektor representasi $\mathbf{q}$, kunci positif $\mathbf{k}_+$, dan matriks kunci negatif $\mathbf{K}^- \in \mathbb{R}^{K \times D}$.
- **Transformasi**:
  1. Normalisasi $\ell_2$-norm: $\mathbf{v} \leftarrow \mathbf{v} / \|\mathbf{v}\|_2$.
  2. Komputasi dot product logit dan pembagian temperatur $z_i = (\mathbf{q} \cdot \mathbf{k}_i) / \tau$.
  3. Stabilisasi numerik softmax menggunakan pengurangan logit maksimum: $\exp(z_i - \max(z))$.
- **Output & Evaluasi**: Matriks probabilitas posterior, nilai kerugian skalar InfoNCE, dan akurasi top-1 klasifikasi zero-shot.

---

## 6. Diagram Arsitektur Sistem

![Pembelajaran Kontrastif & Arsitektur Model Fondasi CLIP](/media/diagrams/chapter-49-contrastive-learning-clip.svg)

![Ruang Vektor Embedding Bersama (Joint Embedding Space)](/media/diagrams/chapter-49-multimodal-embedding-space.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Self-Supervised Learning dan Foundation Models telah mendemokratisasi visi komputer dengan mengeliminasi ketergantungan mutlak pada jutaan anotasi manual berbayar. Melalui formulasi matematis kontras InfoNCE, pemodelan rekonstruksi patch MAE, dan distilasi mandiri DINOv2, representasi visual yang dihasilkan terbukti memiliki kekokohan semantik tinggi serta mampu mentransfer pemahaman spasial ke aneka tugas turunan secara efisien. Menguasai dinamika geometri ruang embedding bersama adalah kompetensi inti dalam merancang arsitektur AI multimodal masa depan.
