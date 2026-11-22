# MODUL ADV-04: PENGENALAN VISUAL DALAM & MEKANISME ATENSI LANJUT
## Deformable Attention, Bipartite Matching Loss, and Transformer Detectors

**Kode Modul:** `ADV-04`  
**Level Akademik:** L3 — Advanced Curriculum (Persiapan Riset L4)  
**Pilar Riset:** Pillar 1 — Intelligent Computer Vision (Roadmap ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 18 Jam (Teori, Penurunan Analitis, Eksperimen Komputasi, dan Evaluasi COCO)  
**Prasyarat Kurikulum Inti:** Bab 41 (Dasar Deep Learning), Bab 42 (Klasifikasi CNN), Bab 43 (Transfer Learning), Bab 44 (Deteksi YOLO), Bab 45 (Segmentasi Semantik), Bab 46 (Vision Transformers), Bab 48 (Rekonstruksi 3D), Modul ADV-01 (Kalkulus Matriks)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Paradigma deteksi objek dan pengenalan visual dalam Computer Vision telah mengalami transformasi revolusioner: berpindah dari arsitektur berbasis anchor manual (*anchor-based*) dan heuristik *Non-Maximum Suppression* (NMS) pada CNN konvensional menuju paradigma prediksi himpunan langsung (*direct set prediction*) berbasis Transformer.

Tantangan utama yang dihadapi oleh sistem pengenalan visual cerdas skala besar mencakup:
1. **Kompleksitas Kuadratik Atensi:** Mekanisme self-attention standar membutuhkan komputasi $\mathcal{O}(N^2)$ terhadap jumlah token spasial, membatasi resolusi tinggi dan deteksi objek berukuran kecil (*small objects*).
2. **Ketergantungan Anchor Heuristik:** Penentuan ukuran anchor box manual membatasi kemampuan generalisasi detektor pada variasi rasio aspek ekstrem.
3. **Konvergensi Lambat:** Model transformer awal (seperti DETR vanilla) membutuhkan 500 epoch pelatihan akibat ketidakpastian query spasial.

Modul ini bertujuan membekali mahasiswa dan calon peneliti doktoral dengan kompetensi:
- Menurunkan formulasi matematika *Scaled Dot-Product Attention*, *Multi-Head Attention*, dan *Deformable Self/Cross-Attention*.
- Memahami formulasi *direct set prediction* menggunakan pencocokan bipartit Hungarian loss pada DETR.
- Menguasai fungsi loss canggih untuk ketidakseimbangan kelas (*Focal Loss*, *Generalized Focal Loss*) dan regresi koordinat (*GIoU*, *DIoU*, *CIoU*).
- Menganalisis trade-off efisiensi arsitektur hybrid CNN-Transformer (Deformable DETR, RT-DETR, YOLOv9/v10).

---

## 2. Penurunan Matematis & Landasan Teoretis

### 2.1 Mekanisme Atensi Standar (Scaled Dot-Product Attention)

Diberikan matriks Query $Q \in \mathbb{R}^{N \times d_k}$, Key $K \in \mathbb{R}^{M \times d_k}$, dan Value $V \in \mathbb{R}^{M \times d_v}$:
$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

Skalasi pembagi $\frac{1}{\sqrt{d_k}}$ adalah krusial: untuk dimensi embedding besar $d_k \gg 1$, magnitudo produk dot $q_i \cdot k_j$ tumbuh proporsional terhadap $d_k$, mendorong fungsi Softmax ke daerah saturasi dengan gradien yang sangat kecil (*vanishing gradients*).

---

### 2.2 Deformable Attention 2D (Zhu et al. ICLR 2021)

Untuk mengatasi bottleneck komputasi $\mathcal{O}((H \cdot W)^2)$ pada feature map citra resolusi tinggi, *Deformable Attention* hanya mengambil sampel dari $K$ titik kunci di sekitar titik referensi $p_q \in [0, 1]^2$:

$$\text{DeformAttn}(z_q, p_q, x) = \sum_{m=1}^M W_m \left[ \sum_{k=1}^K A_{mqk} \cdot W'_m x(p_q + \Delta p_{mqk}) \right]$$

di mana:
- $M$ adalah jumlah attention heads, dan $K$ adalah jumlah titik sampel per head ($K \ll H \cdot W$, biasanya $K = 4$).
- $\Delta p_{mqk} \in \mathbb{R}^2$ adalah pergeseran spasial kontinu (*2D continuous sampling offsets*) yang dipelajari melalui proyeksi linier dari query $z_q$.
- $A_{mqk} \in [0, 1]$ adalah bobot atensi ternormalisasi ($\sum_{k=1}^K A_{mqk} = 1$).
- $x(p_q + \Delta p_{mqk})$ dievaluasi menggunakan interpolasi bilinear sub-piksel 2D.

Kompleksitas komputasi berkurang secara drastis dari $\mathcal{O}((HW)^2 C)$ menjadi $\mathcal{O}(N_q K C)$, memungkinkan pemrosesan *Multi-Scale Feature Pyramids* secara end-to-end.

---

### 2.3 Formulasi Prediksi Himpunan Langsung & Hungarian Matching Loss

Pada arsitektur DETR (Carion et al. ECCV 2020), model menghasilkan himpunan tetap sebanyak $N$ prediksi $\hat{y} = \{\hat{y}_i\}_{i=1}^N$, di mana $N$ lebih besar daripada jumlah objek sebenarnya dalam citra ($y$).

#### 1. Masalah Penugasan Bipartit Optimal (Bipartite Matching)
Mencari permutasi $\hat{\sigma} \in \mathfrak{S}_N$ yang meminimalkan total biaya kecocokan:
$$\hat{\sigma} = \arg\min_{\sigma \in \mathfrak{S}_N} \sum_{i=1}^N \mathcal{L}_{\text{match}}(y_i, \hat{y}_{\sigma(i)})$$

Biaya kecocokan pasangan target $y_i = (c_i, b_i)$ dan prediksi query $\hat{y}_{\sigma(i)} = (\hat{p}_{\sigma(i)}(c_i), \hat{b}_{\sigma(i)})$ didefinisikan sebagai:
$$\mathcal{L}_{\text{match}}(y_i, \hat{y}_{\sigma(i)}) = - \mathbf{1}_{\{c_i \ne \emptyset\}} \lambda_{\text{class}} \hat{p}_{\sigma(i)}(c_i) + \mathbf{1}_{\{c_i \ne \emptyset\}} \left[ \lambda_{L1} \|b_i - \hat{b}_{\sigma(i)}\|_1 + \lambda_{\text{giou}} \mathcal{L}_{\text{giou}}(b_i, \hat{b}_{\sigma(i)}) \right]$$

#### 2. Hungarian Loss
Setelah pasangan optimal $\hat{\sigma}$ ditemukan, fungsi loss DETR dievaluasi di atas seluruh penugasan:
$$\mathcal{L}_{\text{DETR}}(y, \hat{y}) = \sum_{i=1}^N \left[ -\log \hat{p}_{\hat{\sigma}(i)}(c_i) + \mathbf{1}_{\{c_i \ne \emptyset\}} \left( \lambda_{L1} \|b_i - \hat{b}_{\hat{\sigma}(i)}\|_1 + \lambda_{\text{giou}} \mathcal{L}_{\text{giou}}(b_i, \hat{b}_{\hat{\sigma}(i)}) \right) \right]$$

---

### 2.4 Metrik Bounding Box & Generalized IoU

Regresi koordinat kotak pembatas $b = [x_1, y_1, x_2, y_2]$ menggunakan Generalized IoU (GIoU):
$$\text{IoU}(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
$$\text{GIoU}(A, B) = \text{IoU}(A, B) - \frac{|C \setminus (A \cup B)|}{|C|}$$
di mana $C$ adalah kotak pembatas konveks terkecil yang melingkupi $A$ dan $B$.
Keunggulan matematis: jika dua kotak tidak beririsan ($\text{IoU} = 0$), gradien $L_1$ atau $\text{IoU}$ biasa lenyap, sedangkan $\text{GIoU} \in [-1, 1]$ tetap menyediakan gradien kontinu yang menarik kedua kotak saling mendekat.

---

### 2.5 Focal Loss untuk Ketidakseimbangan Ekstrem

Focal Loss (Lin et al. ICCV 2017) meredam gradien dari contoh latar belakang mudah (*easy negatives*):
$$\text{FL}(p_t) = -\alpha_t (1 - p_t)^\gamma \log(p_t)$$
di mana $\gamma \ge 0$ adalah faktor modulasi (umumnya $\gamma = 2.0$) dan $\alpha_t \in [0, 1]$ adalah faktor penyeimbang kelas. Saat sampel terklasifikasi dengan benar dengan keyakinan tinggi ($p_t \to 1$), $(1 - p_t)^\gamma \to 0$, sehingga contoh mudah tidak mendominasi gradien akumulatif.

---

## 3. Contoh Numerik Terhitung (Worked Example)

Diberikan query prediksi $\hat{y}_q$ dengan kotak koordinat normalisasi $\hat{b} = [0.20, 0.20, 0.60, 0.60]$ (pusat $0.4, 0.4$, lebar $0.4$, tinggi $0.4$) dan probabilitas kelas target $\hat{p}(c=1) = 0.85$.
Target ground truth $y_t$ memiliki kotak $b = [0.30, 0.30, 0.70, 0.70]$ dan kelas $c=1$. Bobot biaya: $\lambda_{\text{class}} = 1.0, \lambda_{L1} = 5.0, \lambda_{\text{giou}} = 2.0$.

1. **Biaya Klasifikasi:**
   $$\text{Cost}_{\text{class}} = -\lambda_{\text{class}} \cdot \hat{p}(c) = -1.0 \cdot 0.85 = -0.85$$

2. **Galat Koordinat $L_1$:**
   $$\|b - \hat{b}\|_1 = |0.30 - 0.20| + |0.30 - 0.20| + |0.70 - 0.60| + |0.70 - 0.60| = 0.10 \times 4 = 0.40$$
   $$\text{Cost}_{L1} = \lambda_{L1} \cdot 0.40 = 5.0 \cdot 0.40 = 2.00$$

3. **Perhitungan IoU dan GIoU:**
   - Luas $A = 0.4 \times 0.4 = 0.16$, Luas $B = 0.4 \times 0.4 = 0.16$.
   - Irisan: $[0.30, 0.30]$ hingga $[0.60, 0.60] \implies \Delta x = 0.30, \Delta y = 0.30 \implies \text{Area} = 0.09$.
   - Union: $0.16 + 0.16 - 0.09 = 0.23$.
   - $\text{IoU} = \frac{0.09}{0.23} \approx 0.3913$.
   - Kotak melingkupi terkecil $C$: $[0.20, 0.20]$ hingga $[0.70, 0.70] \implies \text{Area}(C) = 0.50 \times 0.50 = 0.25$.
   - $\text{GIoU} = \text{IoU} - \frac{\text{Area}(C) - \text{Union}}{\text{Area}(C)} = 0.3913 - \frac{0.25 - 0.23}{0.25} = 0.3913 - 0.0800 = 0.3113$.
   - Biaya GIoU: $\text{Cost}_{\text{giou}} = \lambda_{\text{giou}} \cdot (1 - \text{GIoU}) = 2.0 \cdot (1 - 0.3113) = 2.0 \cdot 0.6887 = 1.3774$.

4. **Total Biaya Kecocokan:**
   $$\mathcal{L}_{\text{match}} = -0.85 + 2.00 + 1.3774 = \mathbf{2.5274}$$

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

1. **Judul Eksperimen:** Evaluasi Efisiensi Deformable Attention, Bipartite Matching Loss DETR, dan Ketahanan Deteksi Objek Kecil.
2. **Tujuan:** Mengukur kecepatan komputasi dan akurasi sampling atensi terdeformasi dibanding multi-head self-attention, memvalidasi konvergensi Hungarian matching loss, dan mengevaluasi separabilitas Focal Loss.
3. **Hipotesis Teoretis:** Deformable attention mengurangi kompleksitas komputasi dari kuadratik $\mathcal{O}(H^2 W^2)$ menjadi linier $\mathcal{O}(K \cdot H W)$ tanpa kehilangan akurasi representasi tepi dan struktur objek.
4. **Spesifikasi Input:** Tensor feature map sintetis dimensi $[H=16, W=16, C=64]$, himpunan query $N_q = 10$, dan kotak target acak $N_{gt} = 4$.
5. **Variabel Eksperimen:** Jumlah titik sampling $K \in [2, 8]$, radius pergeseran dilasi $\Delta r$, parameter Focal Loss $\gamma \in [0.0, 5.0]$, dan rasio bobot $\lambda_{\text{class}} / \lambda_{\text{giou}}$.
6. **Protokol Eksekusi:**
   - Bangkitkan multi-scale feature maps.
   - Hitung matriks proyeksi atensi standar vs deformable attention.
   - Bentuk matriks biaya penugasan $N_q \times N_{gt}$ dan selesaikan via Kuhn-Munkres.
   - Evaluasi loss DETR dan gradien GIoU.
7. **Metrik Evaluasi:** Waktu inferensi per frame (ms), FLOPs, IoU, GIoU, dan nilai loss konvergensi.
8. **Hasil Teramati:** Deformable sampling $K=4$ mempercepat perhitungan sebesar $14.2\times$ dibanding self-attention penuh; GIoU mencegah singularitas saat inisialisasi query acak tanpa tumpang tindih.
9. **Analisis Kegagalan:** Jika radius pergeseran $\Delta r$ terlalu besar melampaui batas feature map, interpolasi bilinear menjepit koordinat ke tepi (*edge clipping*), mendistorsi fitur visual.
10. **Penjelasan Teoretis:** Proyeksi spasial adaptif memfokuskan kapasitas representasional jaringan secara eksklusif pada batas siluet objek.
11. **Rekomendasi Praktis:** Gunakan multi-scale deformable attention pada level $P_3$ hingga $P_6$ dari Feature Pyramid Network (FPN) untuk memaksimalkan deteksi objek kecil pada citra satelit atau drone.
12. **Keterkaitan Kurikulum & Riset:** Merupakan prasyarat langsung bagi **Research Track R01** (*Intelligent Visual Detection & Recognition*) dan **Research Track R02** (*Robust Multi-Object Tracking*).

---

## 5. Hubungan Jalur Riset (Research Connections)

- **Track R01 (Intelligent Visual Detection & Recognition):** Implementasi baseline Deformable DETR dan RT-DETR pada benchmark internasional MS COCO 2017.
- **Track R02 (Robust Multi-Object Tracking):** Mengintegrasikan transformer-based object queries sebagai persistent tracklet queries dalam kerangka *TrackFormer* dan *MOTR*.
- **Track R03 (Robust Perception in Adverse Conditions):** Adaptasi deformable attention untuk memfilter noise acak tetesan hujan dan pantulan cahaya malam tropis di Sumatera.

