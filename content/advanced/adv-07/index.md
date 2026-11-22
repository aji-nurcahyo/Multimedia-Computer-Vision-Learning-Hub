# MODUL ADV-07: MODEL FONDASI VISI & ADAPTASI EFISIEN PARAMETER
## Self-Supervised Pretraining, Contrastive Multimodal Alignment, and LoRA

**Kode Modul:** `ADV-07`  
**Level Akademik:** L3 — Advanced Curriculum (Persiapan Riset L4)  
**Pilar Riset:** Pillar 3 — Vision-Centric Multimodal Perception (Roadmap ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 18 Jam (Teori, Penurunan Analitis, Eksperimen Komputasi, dan Fine-Tuning Efisien)  
**Prasyarat Kurikulum Inti:** Bab 44 (Deteksi Objek), Bab 45 (Segmentasi Semantik), Bab 46 (Vision Transformers), Bab 49 (Model Fondasi Mandiri), Bab 51 (Multimodal AI), Bab 52 (Vision-Language Models), Bab 54 (Embedding & Retrieval), Modul ADV-04 (Mekanisme Atensi)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Perkembangan mutakhir dalam Computer Vision didominasi oleh pergeseran paradigma dari model tersupervisi tertutup (*closed-set supervised models*) yang dilatih dari nol (*from scratch*) menuju **Model Fondasi Visi** (*Vision Foundation Models*). Model berskala masif ini dilatih menggunakan data tanpa label skala besar melalui metode *Self-Supervised Learning* (seperti Masked Autoencoders dan DINOv2) atau penyejajaran multimodal citra-teks (*Contrastive Vision-Language Pretraining* seperti CLIP).

Namun, menerapkan model fondasi yang memiliki miliaran parameter ke perangkat komputasi terbatas menghadirkan tantangan besar:
1. **Beban Komputasi Finetuning Penuh (Full Fine-Tuning):** Memperbarui seluruh parameter bobot memerlukan memori GPU yang luar biasa besar dan rentan memicu *catastrophic forgetting*.
2. **Keterbatasan Data Tugas Spesifik:** Dataset hilir (*downstream tasks*) seringkali berukuran kecil (misalnya citra perkebunan atau drone maritim di Sumatera), di mana finetuning penuh rentan overfitting.
3. **Penyimpanan Multi-Tugas:** Menyimpan salinan bobot model lengkap untuk setiap tugas hilir tidak praktis dalam skenario operasional.

Modul ini membekali mahasiswa dan peneliti dengan penguasaan:
- Penurunan fungsi tujuan *Contrastive Learning* (InfoNCE loss) dan batas bawah informasi mutual (*Mutual Information bounds*).
- Analisis representasi semantik emergensi pada DINOv2 dan rekonstruksi patch pada Masked Autoencoders (MAE).
- Metode Parameter-Efficient Fine-Tuning (PEFT), khususnya dekomposisi matriks tingkat rendah *Low-Rank Adaptation* (LoRA).
- Metodologi transfer zero-shot, few-shot linear probing, dan evaluasi keterandalan model fondasi di bawah pergeseran domain (*domain shift*).

---

## 2. Penurunan Matematis & Landasan Teoretis

### 2.1 Pembelajaran Representasi Kontrasif & InfoNCE Loss

Dalam pembelajaran kontrasif (seperti CLIP, Radford et al. 2021 dan SimCLR, Chen et al. 2020), ruang embedding dipelajari sedemikian rupa sehingga pasangan positif $(q, k_+)$ diposisikan berdekatan, sementara pasangan negatif $(q, k_i^-)$ didorong saling menjauh.

Diberikan query visual ternormalisasi $q \in \mathbb{R}^d$ ($\|q\|_2 = 1$), key positif $k_+$, dan himpunan $K$ key negatif $\{k_i\}_{i=1}^K$:

$$\mathcal{L}_{\text{InfoNCE}} = - \log \frac{\exp\left(\frac{q \cdot k_+}{\tau}\right)}{\exp\left(\frac{q \cdot k_+}{\tau}\right) + \sum_{i=1}^K \exp\left(\frac{q \cdot k_i}{\tau}\right)}$$

di mana $\tau > 0$ adalah parameter temperatur skalar terpelajari yang mengontrol ketajaman distribusi probabilitas di atas ruang bola satuan $\mathbb{S}^{d-1}$.

#### Kaitan dengan Mutual Information
Oord et al. (2018) membuktikan bahwa meminimalkan $\mathcal{L}_{\text{InfoNCE}}$ ekuivalen dengan memaksimalkan batas bawah informasi mutual $I(X; Y)$ antara representasi visual dan teks:
$$I(X; Y) \ge \log(K + 1) - \mathcal{L}_{\text{InfoNCE}}$$

---

### 2.2 Geometri Ruang Embedding Multimodal CLIP

Pada arsitektur dual-encoder CLIP:
- Encoder visual $f_\theta$ memetakan citra $I$ ke embedding $v = \frac{f_\theta(I)}{\|f_\theta(I)\|_2}$.
- Encoder teks $g_\phi$ memetakan teks prompt $T$ ke embedding $u = \frac{g_\phi(T)}{\|g_\phi(T)\|_2}$.
- Kesamaan semantik diukur langsung melalui produk skalar (cosine similarity):
  $$s(I, T) = v \cdot u$$

Untuk klasifikasi zero-shot dengan $C$ kelas dan prompt teks $\{T_c\}_{c=1}^C$, distribusi probabilitas kelas diberikan oleh Softmax berskala temperatur:
$$p(c \mid I) = \frac{\exp(s(I, T_c) / \tau)}{\sum_{j=1}^C \exp(s(I, T_j) / \tau)}$$

---

### 2.3 Parameter-Efficient Fine-Tuning: Low-Rank Adaptation (LoRA)

LoRA (Hu et al. ICLR 2022) mengasumsikan bahwa perubahan bobot selama adaptasi tugas hilir $\Delta W$ memiliki *intrinsic rank* yang sangat rendah ($r \ll \min(d_{\text{in}}, d_{\text{out}})$).

Diberikan matriks bobot terbekukan (*frozen base weight matrix*) $W_0 \in \mathbb{R}^{d_{\text{out}} \times d_{\text{in}}}$, bobot teradaptasi dinyatakan sebagai:
$$W = W_0 + \Delta W = W_0 + \frac{\alpha}{r} (B \cdot A)$$

di mana:
- $B \in \mathbb{R}^{d_{\text{out}} \times r}$ diinisialisasi dengan nol ($B = 0$).
- $A \in \mathbb{R}^{r \times d_{\text{in}}}$ diinisialisasi dengan distribusi Gaussian acak $\mathcal{N}(0, \sigma^2)$.
- $\alpha$ adalah konstanta penskalaan hiperparameter konstan terhadap rank $r$.

#### Efisiensi Parameter
Jumlah parameter yang dilatih tereduksi dari $d_{\text{out}} \cdot d_{\text{in}}$ menjadi:
$$N_{\text{LoRA}} = r \cdot (d_{\text{in}} + d_{\text{out}})$$

Contoh: Pada lapisan proyeksi atensi ViT-Large ($d_{\text{in}} = d_{\text{out}} = 1024$), finetuning penuh membutuhkan $1.048.576$ parameter per matriks, sedangkan LoRA dengan rank $r = 8$ hanya memerlukan $8 \times 2048 = 16.384$ parameter (**pengurangan $>98.4\%$**).

---

## 3. Contoh Numerik Terhitung (Worked Example)

Diberikan lapisan proyeksi atensi dengan $d_{\text{in}} = 4, d_{\text{out}} = 4$, rank LoRA $r = 1$, dan faktor skala $\alpha = 2$.
Matriks dasar terbekukan $W_0$:
$$W_0 = \begin{bmatrix} 1.0 & 0.0 & 2.0 & 0.0 \\ 0.0 & 1.0 & 0.0 & 2.0 \\ 2.0 & 0.0 & 1.0 & 0.0 \\ 0.0 & 2.0 & 0.0 & 1.0 \end{bmatrix}$$

Matriks adaptor terpelajari:
$$B = \begin{bmatrix} 0.5 \\ 1.0 \\ -0.5 \\ 0.0 \end{bmatrix} \in \mathbb{R}^{4 \times 1}, \quad A = \begin{bmatrix} 2.0 & 1.0 & 0.0 & -1.0 \end{bmatrix} \in \mathbb{R}^{1 \times 4}$$

1. **Perkalian Matriks $B \cdot A$:**
   $$(B \cdot A)_{ij} = B_i \cdot A_j$$
   $$B \cdot A = \begin{bmatrix} 0.5 \cdot [2, 1, 0, -1] \\ 1.0 \cdot [2, 1, 0, -1] \\ -0.5 \cdot [2, 1, 0, -1] \\ 0.0 \cdot [2, 1, 0, -1] \end{bmatrix} = \begin{bmatrix} 1.0 & 0.5 & 0.0 & -0.5 \\ 2.0 & 1.0 & 0.0 & -1.0 \\ -1.0 & -0.5 & 0.0 & 0.5 \\ 0.0 & 0.0 & 0.0 & 0.0 \end{bmatrix}$$

2. **Penskalaan $\frac{\alpha}{r}$:**
   $$\frac{\alpha}{r} = \frac{2}{1} = 2.0 \implies \Delta W = 2.0 \cdot (B \cdot A) = \begin{bmatrix} 2.0 & 1.0 & 0.0 & -1.0 \\ 4.0 & 2.0 & 0.0 & -2.0 \\ -2.0 & -1.0 & 0.0 & 1.0 \\ 0.0 & 0.0 & 0.0 & 0.0 \end{bmatrix}$$

3. **Matriks Bobot Teradaptasi Akhir ($W = W_0 + \Delta W$):**
   $$W = \begin{bmatrix} 1.0+2.0 & 0.0+1.0 & 2.0+0.0 & 0.0-1.0 \\ 0.0+4.0 & 1.0+2.0 & 0.0+0.0 & 2.0-2.0 \\ 2.0-2.0 & 0.0-1.0 & 1.0+0.0 & 0.0+1.0 \\ 0.0+0.0 & 2.0+0.0 & 0.0+0.0 & 1.0+0.0 \end{bmatrix} = \begin{bmatrix} 3.0 & 1.0 & 2.0 & -1.0 \\ 4.0 & 3.0 & 0.0 & 0.0 \\ 0.0 & -1.0 & 1.0 & 1.0 \\ 0.0 & 2.0 & 0.0 & 1.0 \end{bmatrix}$$

Penghematan parameter: $4 \times 4 = 16$ parameter dikurangi menjadi $(4 + 4) \times 1 = 8$ parameter teradaptasi (**pengurangan $50\%$** pada matriks mini ini, dan $>95\%$ pada matriks skala besar).

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

1. **Judul Eksperimen:** Penyelarasan Embedding Multimodal, Sensitivitas Temperatur InfoNCE, dan Adaptasi Parameter Efisien LoRA.
2. **Tujuan:** Menganalisis kurva konvergensi InfoNCE loss, mengukur dinamika temperatur terhadap kalibrasi probabilitas zero-shot, dan memverifikasi kesetaraan komputasi bobot LoRA vs fine-tuning penuh.
3. **Hipotesis Teoretis:** Temperatur $\tau$ yang terlalu rendah ($\tau < 0.02$) menyebabkan saturasi gradien lokal, sedangkan $\tau > 0.5$ menghasilkan distribusi probabilitas yang terlalu seragam (*under-confident*); adaptasi LoRA rank $r=4$ mampu mendekati kapasitas representasi finetuning penuh dengan $< 3\%$ parameter.
4. **Spesifikasi Input:** Basis data embedding multimodal 8-dimensi sintetis (mencakup domain fauna, lanskap Sumatera, dan pengawasan maritim).
5. **Variabel Eksperimen:** Nilai temperatur $\tau \in [0.01, 1.0]$, rank LoRA $r \in \{1, 2, 4, 8, 16\}$, dan skala penskalaan $\alpha \in [1, 32]$.
6. **Protokol Eksekusi:**
   - Bangkitkan vektor fitur citra dan teks ternormalisasi $L_2$.
   - Hitung matriks kesamaan cosine antar seluruh pasangan.
   - Evaluasi loss InfoNCE pada variasi temperatur.
   - Aplikasikan dekomposisi $B \cdot A$ dan ukur residual $\|W - (W_0 + \Delta W)\|_F$.
7. **Metrik Evaluasi:** Nilai InfoNCE loss, akurasi retrieval Top-1 / Top-5, rasio reduksi parameter, dan konsumsi memori VRAM.
8. **Hasil Teramati:** Temperatur optimal ditemukan pada $\tau \approx 0.07$ (sesuai standar CLIP Radford et al.); LoRA rank $r=4$ menghemat $97.9\%$ parameter pada model berdimensi 768.
9. **Analisis Kegagalan:** Jika embedding masukan tidak ditransformasikan dengan normalisasi $L_2$, besaran norma vektor mendominasi kesamaan dot product, merusak estimasi sudut kemiripan semantik.
10. **Penjelasan Teoretis:** Normalisasi $L_2$ memproyeksikan fitur ke manifold hipersfer $\mathbb{S}^{d-1}$, di mana jarak Euclidean berbanding lurus dengan jarak sudut cosine.
11. **Rekomendasi Praktis:** Selalu terapkan inisialisasi nol pada matriks $B$ agar pada langkah iterasi pertama $t=0$, adaptasi $\Delta W = 0$ sehingga model mempertahankan 100% kapabilitas bobot dasar pretrained.
12. **Keterkaitan Kurikulum & Riset:** Prasyarat langsung bagi **Research Track R04** (*Vision-Centric Multimodal Perception*) dan **Research Track R05** (*Efficient CV & Edge AI*).

---

## 5. Hubungan Jalur Riset (Research Connections)

- **Track R04 (Vision-Centric Multimodal Perception):** Menggunakan representasi CLIP zero-shot untuk klasifikasi citra satelit dan deteksi berbasis prompt teks bebas di wilayah Sumatera.
- **Track R01 (Intelligent Visual Detection):** Pemanfaatan backbone DINOv2 teradaptasi LoRA sebagai feature extractor universal untuk detektor objek resolusi tinggi.
- **Track R03 (Robust Perception in Adverse Conditions):** Menganalisis pergeseran embedding visual model fondasi saat dihadapkan pada kabut asap (*haze*) dan hujan lebat.

