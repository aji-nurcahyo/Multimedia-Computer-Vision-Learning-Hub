# Bab 52 — Vision-Language Models

**Seksi Kurikulum:** Seksi 11 — Multimodal AI  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Salah satu pencapaian paling revolusioner dalam kecerdasan buatan modern adalah konvergensi antara penglihatan komputer (*Computer Vision*) dan pemrosesan bahasa alami (*Natural Language Processing*) melalui **Vision-Language Models (VLM)**. Sebelum era model fondasi vision-language, sistem visi komputer dilatih secara terisolasi pada daftar kelas diskrit yang kaku (misal 1000 kelas pada ImageNet atau 80 kelas pada MS COCO). Jika sebuah model dilatih untuk mengenali "kucing" dan "anjing", ia tidak memiliki kapasitas memahami konsep semantik "kucing oranye yang sedang tidur di atas kap mobil hitam" tanpa data pelatihan berlabel khusus yang sangat mahal.

Vision-Language Models meruntuhkan batasan klasifikasi tertutup (*closed-set classification*) dengan memproyeksikan citra visual dan teks deskripsi alami ke dalam ruang embedding bersama (*joint multimodal embedding space*). Dengan menghubungkan modalitas visual ke semantik bahasa yang kaya, model memperoleh kemampuan **Zero-Shot Transfer**—kemampuan mengenali kategori, objek, dan hubungan visual baru secara instan hanya melalui deskripsi teks berupa *prompt* tanpa memerlukan pelatihan ulang bobot jaringan.

Secara garis besar, ekosistem Vision-Language Models terbagi menjadi dua arsitektur dominan:
1. **Contrastive Dual-Encoder Models (e.g., CLIP, SigLIP, ALIGN)**: Menggunakan encoder citra (Vision Transformer atau ResNet) dan encoder teks (Transformer) terpisah untuk memetakan kedua modalitas ke ruang vektor bersama melalui optimasi fungsi rugi kesamaan kosinus simetris. Sangat efisien untuk *zero-shot classification*, *image-text retrieval*, dan pencarian semantik berkecepatan tinggi.
2. **Generative Autoregressive VLMs (e.g., LLaVA, Flamingo, BLIP-2, Qwen-VL)**: Menghubungkan visual encoder ke Large Language Model (LLM) melalui lapisan proyeksi cross-attention atau MLP connector. Mampu menghasilkan deskripsi naratif (*image captioning*), menjawab pertanyaan visual (*Visual Question Answering - VQA*), serta melakukan penalaran visual spasial (*visual reasoning*).

Dalam kurikulum **Intelligent Computer Vision (ITERA)**, bab ini berfokus pada fondasi matematis representasi kontrastif dual-encoder, formulasi penataan geometris logit, sensitivitas rekayasa prompt (*prompt engineering*), serta mitigasi halusinasi visual.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Arsitektur Dual-Encoder & Matriks Kesamaan Kosinus

Diberikan sebuah batch berisi $N$ pasangan data citra-teks berpasangan $\{(\mathbf{x}_i^{\text{img}}, \mathbf{x}_i^{\text{txt}})\}_{i=1}^N$.
1. **Ekstraksi Fitur**:
   - Encoder Citra memetakan citra ke representasi visual mentah: $\mathbf{h}_i^{\text{img}} = f_{\text{vision}}(\mathbf{x}_i^{\text{img}}) \in \mathbb{R}^{D_v}$
   - Encoder Teks memetakan token teks ke representasi bahasa mentah: $\mathbf{h}_j^{\text{txt}} = f_{\text{text}}(\mathbf{x}_j^{\text{txt}}) \in \mathbb{R}^{D_t}$
2. **Proyeksi Linier ke Ruang Bersama $D$**:
   $$\mathbf{e}_i^{\text{img}} = \mathbf{W}_v \mathbf{h}_i^{\text{img}} \in \mathbb{R}^D, \quad \mathbf{e}_j^{\text{txt}} = \mathbf{W}_t \mathbf{h}_j^{\text{txt}} \in \mathbb{R}^D$$
3. **Normalisasi Vektor $\ell_2$**:
   $$\mathbf{u}_i = \frac{\mathbf{e}_i^{\text{img}}}{\|\mathbf{e}_i^{\text{img}}\|_2}, \quad \mathbf{v}_j = \frac{\mathbf{e}_j^{\text{txt}}}{\|\mathbf{e}_j^{\text{txt}}\|_2}$$
   Normalisasi ini memastikan bahwa seluruh vektor berada pada permukaan *unit hypersphere* $\mathbb{S}^{D-1}$.

```
+-------------------------------------------------------------------------+
|                  ARSITEKTUR KONTRASTIF DUAL-ENCODER (CLIP)              |
+-------------------------------------------------------------------------+
 Citra x_1, ..., x_N              Teks x_1, ..., x_N
       |                                |
  [Vision Encoder]                 [Text Encoder]
       |                                |
 Proyeksi & L2 Norm              Proyeksi & L2 Norm
  u_1, ..., u_N                    v_1, ..., v_N
       \                              /
        +----------------------------+
        | Matriks Kesamaan N x N     |
        | L_ij = (u_i . v_j) / tau   |
        +----------------------------+
        Diagonal Utama (i = j): Pasangan Positif (Maksimalkan)
        Elemen Non-Diagonal (i != j): Pasangan Negatif (Minimalkan)
```

4. **Matriks Kesamaan & Skalasi Temperatur**:
   Elemen matriks kesamaan kosinus $S_{ij} = \mathbf{u}_i \cdot \mathbf{v}_j = \mathbf{u}_i^T \mathbf{v}_j \in [-1, 1]$.
   Logit yang diskalakan dengan parameter temperatur $\tau > 0$:
   $$L_{ij} = \frac{S_{ij}}{\tau} = \frac{\mathbf{u}_i \cdot \mathbf{v}_j}{\tau}$$

### 2.2 Fungsi Rugi Simetris Cross-Entropy Kontrastif (CLIP Loss)

Pelatihan dilakukan secara simetris dalam dua arah:
1. **Arah Citra-ke-Teks (Vision-to-Text)**:
   Untuk setiap citra $i$, probabilitas memprediksi teks pasangannya $i$ dari seluruh $N$ teks kandidat adalah:
   $$P_{v \to t}(i \mid i) = \frac{\exp(L_{ii})}{\sum_{j=1}^N \exp(L_{ij})}$$
   Kerugian cross-entropy rata-rata:
   $$\mathcal{L}_{v \to t} = -\frac{1}{N} \sum_{i=1}^N \log P_{v \to t}(i \mid i) = -\frac{1}{N} \sum_{i=1}^N \log \left( \frac{\exp(L_{ii})}{\sum_{j=1}^N \exp(L_{ij})} \right)$$

2. **Arah Teks-ke-Citra (Text-to-Vision)**:
   Untuk setiap teks $j$, probabilitas mencocokkan citra pasangannya $j$ dari seluruh $N$ citra kandidat:
   $$P_{t \to v}(j \mid j) = \frac{\exp(L_{jj})}{\sum_{i=1}^N \exp(L_{ij})}$$
   Kerugian cross-entropy rata-rata:
   $$\mathcal{L}_{t \to v} = -\frac{1}{N} \sum_{j=1}^N \log P_{t \to v}(j \mid j) = -\frac{1}{N} \sum_{j=1}^N \log \left( \frac{\exp(L_{jj})}{\sum_{i=1}^N \exp(L_{ij})} \right)$$

3. **Total Symmetric Loss**:
   $$\mathcal{L}_{\text{CLIP}} = \frac{1}{2} \left( \mathcal{L}_{v \to t} + \mathcal{L}_{t \to v} \right)$$

### 2.3 Mekanisme Klasifikasi Zero-Shot Berbasis Prompt

Untuk mengklasifikasikan citra tak berlabel $\mathbf{x}^{\text{img}}$ ke dalam himpunan $C$ kategori kelas target $\{\mathcal{C}_1, \dots, \mathcal{C}_C\}$:
1. Buat kalimat prompt deskriptif alami terstruktur, misalnya:
   $$\mathbf{t}_c = \text{"a photo of a } \{ \mathcal{C}_c \} \text{"}$$
2. Ekstraksi dan normalisasi seluruh $C$ embedding teks target: $\mathbf{v}_c = \frac{f_{\text{text}}(\mathbf{t}_c)}{\|f_{\text{text}}(\mathbf{t}_c)\|_2}$.
3. Ekstraksi dan normalisasi embedding citra kueri: $\mathbf{u} = \frac{f_{\text{vision}}(\mathbf{x}^{\text{img}})}{\|f_{\text{vision}}(\mathbf{x}^{\text{img}})\|_2}$.
4. Distribusi probabilitas posterior zero-shot untuk kelas $c$:
   $$P(y = c \mid \mathbf{x}^{\text{img}}) = \frac{\exp\left( \frac{\mathbf{u} \cdot \mathbf{v}_c}{\tau} \right)}{\sum_{k=1}^C \exp\left( \frac{\mathbf{u} \cdot \mathbf{v}_k}{\tau} \right)}$$
5. Prediksi kelas teratas: $\hat{c} = \arg\max_{c \in \{1, \dots, C\}} P(y = c \mid \mathbf{x}^{\text{img}})$.

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis dan manual komputasi matriks logit dan loss CLIP simetris pada batch kecil berukuran $N=2$ pasangan citra-teks dengan dimensi ruang laten $D=2$ dan temperatur $\tau = 0.20$.

### Data Embedding Ternormalisasi:
- **Citra 1**: $\mathbf{u}_1 = [1.0, 0.0]^T$ ($\|\mathbf{u}_1\|_2 = 1.0$)
- **Citra 2**: $\mathbf{u}_2 = [0.0, 1.0]^T$ ($\|\mathbf{u}_2\|_2 = 1.0$)
- **Teks 1** (Pasangan Positif Citra 1): $\mathbf{v}_1 = [0.8, 0.6]^T$ ($\sqrt{0.8^2 + 0.6^2} = 1.0$)
- **Teks 2** (Pasangan Positif Citra 2): $\mathbf{v}_2 = [-0.6, 0.8]^T$ ($\sqrt{(-0.6)^2 + 0.8^2} = 1.0$)
- Parameter Temperatur: $\tau = 0.20$ (Faktor skala $1/\tau = 5.0$)

---

### Langkah 1: Hitung Matriks Kesamaan Kosinus $\mathbf{S}_{2 \times 2}$
$$S_{ij} = \mathbf{u}_i \cdot \mathbf{v}_j$$
- $S_{11} = (1.0 \times 0.8) + (0.0 \times 0.6) = 0.80$ (Positif 1)
- $S_{12} = (1.0 \times -0.6) + (0.0 \times 0.8) = -0.60$ (Negatif 1-2)
- $S_{21} = (0.0 \times 0.8) + (1.0 \times 0.6) = 0.60$ (Negatif 2-1)
- $S_{22} = (0.0 \times -0.6) + (1.0 \times 0.8) = 0.80$ (Positif 2)

Matriks kesamaan kosinus:
$$\mathbf{S} = \begin{bmatrix} 0.80 & -0.60 \\ 0.60 & 0.80 \end{bmatrix}$$

---

### Langkah 2: Skalasi Logit dengan Temperatur $\tau = 0.20$
$$L_{ij} = \frac{S_{ij}}{0.20} = 5.0 \times S_{ij}$$
- $L_{11} = 5.0 \times 0.80 = 4.00$
- $L_{12} = 5.0 \times (-0.60) = -3.00$
- $L_{21} = 5.0 \times 0.60 = 3.00$
- $L_{22} = 5.0 \times 0.80 = 4.00$

Matriks logit:
$$\mathbf{L} = \begin{bmatrix} 4.00 & -3.00 \\ 3.00 & 4.00 \end{bmatrix}$$

---

### Langkah 3: Evaluasi Nilai Eksponensial $\exp(L_{ij})$
- $\exp(L_{11}) = \exp(4.0) \approx 54.59815$
- $\exp(L_{12}) = \exp(-3.0) \approx 0.04979$
- $\exp(L_{21}) = \exp(3.0) \approx 20.08554$
- $\exp(L_{22}) = \exp(4.0) \approx 54.59815$

---

### Langkah 4: Hitung Kerugian Citra-ke-Teks ($\mathcal{L}_{v \to t}$)
1. **Untuk Baris 1 (Citra 1)**:
   - Jumlah penyebut: $\sum_{j=1}^2 \exp(L_{1j}) = 54.59815 + 0.04979 = 54.64794$
   - Probabilitas pasangan benar: $P(1 \mid 1) = \frac{54.59815}{54.64794} \approx 0.9990888$
   - Kerugian: $\ell_1^{v \to t} = -\ln(0.9990888) \approx 0.0009116$
2. **Untuk Baris 2 (Citra 2)**:
   - Jumlah penyebut: $\sum_{j=1}^2 \exp(L_{2j}) = 20.08554 + 54.59815 = 74.68369$
   - Probabilitas pasangan benar: $P(2 \mid 2) = \frac{54.59815}{74.68369} \approx 0.7310586$
   - Kerugian: $\ell_2^{v \to t} = -\ln(0.7310586) \approx 0.3132616$

Rata-rata arah citra-ke-teks:
$$\mathcal{L}_{v \to t} = \frac{0.0009116 + 0.3132616}{2} = \frac{0.3141732}{2} = 0.1570866$$

---

### Langkah 5: Hitung Kerugian Teks-ke-Citra ($\mathcal{L}_{t \to v}$)
1. **Untuk Kolom 1 (Teks 1)**:
   - Jumlah penyebut: $\sum_{i=1}^2 \exp(L_{i1}) = 54.59815 + 20.08554 = 74.68369$
   - Probabilitas pasangan benar: $P(1 \mid 1) = \frac{54.59815}{74.68369} \approx 0.7310586$
   - Kerugian: $\ell_1^{t \to v} = -\ln(0.7310586) \approx 0.3132616$
2. **Untuk Kolom 2 (Teks 2)**:
   - Jumlah penyebut: $\sum_{i=1}^2 \exp(L_{i2}) = 0.04979 + 54.59815 = 54.64794$
   - Probabilitas pasangan benar: $P(2 \mid 2) = \frac{54.59815}{54.64794} \approx 0.9990888$
   - Kerugian: $\ell_2^{t \to v} = -\ln(0.9990888) \approx 0.0009116$

Rata-rata arah teks-ke-citra:
$$\mathcal{L}_{t \to v} = \frac{0.3132616 + 0.0009116}{2} = 0.1570866$$

---

### Langkah 6: Total Symmetric Loss CLIP
$$\mathcal{L}_{\text{CLIP}} = \frac{1}{2} (\mathcal{L}_{v \to t} + \mathcal{L}_{t \to v}) = \frac{1}{2} (0.1570866 + 0.1570866) = 0.1570866$$

*Analisis Zero-Shot*: Jika Citra 1 dievaluasi terhadap dua prompt teks $\mathbf{v}_1$ (kelas A) dan $\mathbf{v}_2$ (kelas B), probabilitas prediksi untuk kelas A adalah $P(A) = 99.91\%$ dan kelas B adalah $0.09\%$. Citra terklasifikasi secara akurat ke kelas A tanpa pelatihan ulang.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Sensitivitas Struktur Kalimat Prompt (*Prompt Syntax Fragility*)**:
   - *Penyebab*: Perubahan kecil pada redaksi prompt (misal `"a dog"` versus `"a photo of a big dog"`) dapat menggeser vektor embedding teks secara signifikan dan menurunkan akurasi hingga 5–15%.
   - *Solusi Teknik*: Gunakan *Prompt Ensembling* (merata-ratakan embedding dari 20–80 variasi template prompt seperti `"a photo of a {c}"`, `"a cropped photo of the {c}"`, `"a close-up of a {c}"`) atau *Prompt Learning* berbasis optimasi konteks (CoOp / CoCoOp).

2. **Halusinasi Visual Model Generatif (*Visual Hallucination in Generative VLMs*)**:
   - *Penyebab*: Pada model generatif (seperti LLaVA), prior bahasa dari Large Language Model seringkali mendominasi bukti visual aktual, membuat model mengarang objek yang sebenarnya tidak ada pada citra (*object hallucination*).
   - *Solusi Teknik*: Integrasikan deteksi berbasis visual grounding (kotak koordinat piksel), verifikasi kontras visual *Decoding Directed Alignment*, atau evaluasi metrik POPE (*Polling-based Object Probing Evaluation*).

3. **Bias Komposisional & Buta Relasi Spasial (*Spatial & Binding Blindness*)**:
   - *Penyebab*: Model dual-encoder berbasis bag-of-words seringkali tidak mampu membedakan relasi spasial kompleks (misal `"kucing di atas meja"` versus `"meja di atas kucing"` menghasilkan kemiripan representasi hampir identik).
   - *Solusi Teknik*: Terapkan pelatihan kontrastif bernaluri spasial (*relation-aware pretraining*) atau gunakan representasi grafik adegan visual (*scene graph visual conditioning*).

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `VisionLanguageLab.tsx` menyediakan antarmuka inferensi interaktif untuk menguji keselarasan prompt teks, visualisasi matriks kesamaan kosinus $N \times N$, serta simulasi klasifikasi zero-shot langsung di peramban web.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi komputasi matriks kesamaan kosinus, fungsi rugi simetris CLIP, dan zero-shot ranking secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Model Pretrained)**: Berkas `notebooks/chapter-52-lab.ipynb` memuat demonstrasi alur inferensi lengkap menggunakan checkpoint model OpenCLIP / Hugging Face Transformers untuk klasifikasi citra dunia nyata.

### 5.2 Panduan Eksekusi Notebook (`chapter-52-lab.ipynb`)
1. Buka antarmuka Jupyter Notebook lokal atau unggah ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 mendeteksi keberadaan pustaka `open_clip` atau `transformers`.
3. Sel 3 mengonstruksi pasangan embedding sintesis dan mengomputasi loss CLIP simetris persis sesuai derivasi manual Seksi 3.
4. Sel 4 mengevaluasi dampak variasi temperatur $\tau \in [0.05, 0.50]$ dan prompt ensembling terhadap kepastian klasifikasi.
5. Sel 5 menyediakan kode komputasi pipeline pretrained CLIP untuk mengklasifikasikan citra uji dari URL publik.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Matriks embedding citra $\mathbf{U} \in \mathbb{R}^{N \times D}$ dan matriks embedding teks $\mathbf{V} \in \mathbb{R}^{N \times D}$ yang telah dinormalisasi $\ell_2$.
- **Transformasi**:
  1. Komputasi dot product matriks: $\mathbf{S} = \mathbf{U} \mathbf{V}^T$.
  2. Penskalaan temperatur: $\mathbf{L} = \mathbf{S} / \tau$.
  3. Softmax dua arah: baris (citra-ke-teks) dan kolom (teks-ke-citra).
  4. Perhitungan loss simetris $-\frac{1}{2N} \left( \sum \ln P_{v \to t} + \sum \ln P_{t \to v} \right)$.
- **Output & Evaluasi**: Nilai skalar kerugian CLIP loss, matriks probabilitas softmax, akurasi top-1 zero-shot classification, dan ranking deskripsi teks.

---

## 6. Diagram Arsitektur Sistem

![Arsitektur Kontrastif Dual-Encoder Vision-Language (CLIP)](/media/diagrams/chapter-52-clip-vision-language-alignment.svg)

![Alur Pipeline Inferensi Klasifikasi Zero-Shot Berbasis Prompt](/media/diagrams/chapter-52-zero-shot-classification-pipeline.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Vision-Language Models menjembatani dunia piksel sensorik dengan dunia simbolik bahasa manusia. Melalui optimasi fungsi rugi kontrastif simetris CLIP dan proyeksi ke manifold unit hypersphere, representasi visual yang dihasilkan memiliki fleksibilitas transfer luar biasa tanpa terbatas pada kategori tertutup. Menyadari keterbatasan model terhadap sensitivitas prompt dan bias komposisional spasial adalah bekal fundamental dalam merancang aplikasi visi komputer cerdas generasi baru.
