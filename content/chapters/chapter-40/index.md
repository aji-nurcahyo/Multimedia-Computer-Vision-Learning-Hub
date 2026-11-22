# Chapter 40 — Classical Object Recognition & Scene Analysis

> **Bagian Kurikulum**: Section 08 — Classical Computer Vision  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 10 (Spatial Filtering & Convolution), Chapter 13 (Edge Detection), Chapter 37 (Feature Matching)  
> **Learning Tracks**: Computer Vision, Real-Time & Edge Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)  
> **Lisensi Materi**: Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Chapter Overview

Sebelum era dominasi Deep Learning modern (yang akan kita pelajari mulai Bab 41), visi komputer telah mengembangkan metodologi pengenalan objek dan analisis pemandangan (*scene analysis*) berbasis rekayasa fitur manual (*handcrafted features*) yang sangat elegan, efisien, dan memiliki interpretasi matematis transparan. Metodologi klasik ini tetap relevan hingga hari ini, terutama untuk sistem pemantauan edge bertenaga ultra-rendah (*ultra-low-power microcontrollers / MCU*), inspeksi cacat manufaktur presisi, deteksi pola geometris terstandarisasi (seperti barcode, QR code, atau logo), serta sebagai lapisan penolak awal (*fast cascade rejector*) pada sistem komputasi visual hibrida.

Dua paradigma klasik utama dalam pengenalan objek adalah:
1. **Pencocokan Templat (*Template Matching*)**: Membandingkan kemiripan jendela citra masukan dengan citra referensi target (templat) menggunakan metrik korelasi statistik seperti **Normalized Cross-Correlation (NCC)**.
2. **Ekstraksi Deskriptor Statistik & Klasifikasi Pembelajaran Mesin**: Mengabstraksikan struktur kontur dan gradien bentuk objek menggunakan **Histogram of Oriented Gradients (HOG)**, diikuti oleh pemisahan bidang hiper (*hyperplane*) optimal menggunakan **Support Vector Machines (SVM)**.

Dalam bab ini, kita akan mempelajari formulasi matematis NCC, arsitektur pembentukan blok dan sel deskriptor HOG (Dalal & Triggs, 2005), formulasi optimasi margin maksimum Support Vector Machines (Cortes & Vapnik, 1995), teknik deteksi jendela geser (*sliding window*) dengan piramida citra multi-skala, Non-Maximum Suppression (NMS), serta model representasi citra global *Bag of Visual Words* (BoVW).

---

## 2. Learning Objectives

Setelah menuntaskan bab ini, mahasiswa dan peneliti diharapkan mampu:

1. **Memahami** prinsip dasar pencocokan templat dan membandingkan metrik Sum of Squared Differences (SSD) dengan Normalized Cross-Correlation (NCC).
2. **Membuktikan** keunggulan NCC yang invarian terhadap perubahan kecerahan linier dan kontras ($I' = \alpha I + \beta$).
3. **Menganalisis** alur kerja komputasi deskriptor HOG: komputasi gradien 1D, kuantisasi sudut histogram 9-bin, pembagian sel $8 \times 8$, normalisasi blok $2 \times 2$, dan penghitungan dimensi total vektor fitur.
4. **Menurunkan** formulasi optimasi margin maksimum pada Support Vector Machine (SVM) dengan penalti batas lunak (*soft-margin C-SVM*).
5. **Menerapkan** algoritma jendela geser (*sliding window*) berjenjang (*image pyramid*) dan Non-Maximum Suppression (NMS) berbasis ambang batas Intersection-over-Union (IoU) untuk eliminasi deteksi ganda.
6. **Mengevaluasi** kinerja sistem klasifikasi menggunakan matriks kebingungan (*confusion matrix*), Precision, Recall, F1-Score, dan kurva Precision-Recall.
7. **Mengimplementasikan** pipeline deteksi pejalan kaki HOG+SVM dan pencocokan templat NCC menggunakan Python dan OpenCV (`cv2.matchTemplate`, `cv2.HOGDescriptor`).

---

## 3. Mathematical Foundations & Formulations

### 3.1 Pencocokan Templat Berbasis Normalized Cross-Correlation (NCC)

Diberikan citra sumber $I(x, y)$ berukuran $W \times H$ dan matriks templat $T(u, v)$ berukuran $w \times h$. Nilai rata-rata templat adalah $\bar{T}$, dan nilai rata-rata lokal citra pada jendela yang berpusat di $(x, y)$ adalah $\bar{I}_{x,y}$.

![Pengenalan Objek Klasik: Template Matching NCC](/media/diagrams/chapter-40-template-matching-ncc.svg)
*Gambar 40.1 — Mekanisme pencocokan templat NCC: sliding window pada citra sumber menghasilkan peta korelasi dengan puncak responsif pada lokasi target. Sumber: ITERA, Lisensi CC-BY-4.0.*

Koefisien korelasi silang ternormalisasi (NCC / `cv2.TM_CCOEFF_NORMED`) didefinisikan sebagai:

$$
\gamma(x, y) = \frac{\sum_{u=0}^{w-1} \sum_{v=0}^{h-1} \left[ T(u, v) - \bar{T} \right] \left[ I(x+u, y+v) - \bar{I}_{x,y} \right]}{\sqrt{\sum_{u,v} \left[ T(u, v) - \bar{T} \right]^2 \cdot \sum_{u,v} \left[ I(x+u, y+v) - \bar{I}_{x,y} \right]^2}}
$$

Sifat Matematis NCC:
- Rentang nilai: $\gamma(x, y) \in [-1.0, +1.0]$.
- Nilai $\gamma = +1.0$ menunjukkan kecocokan sempurna.
- Nilai $\gamma = 0.0$ menunjukkan tidak ada korelasi linear.
- **Invarian terhadap Transformasi Afinitas Intensitas**: Jika citra mengalami perubahan iluminasi $I'(x, y) = \alpha \cdot I(x, y) + \beta$ dengan $\alpha > 0$, maka $\gamma_{I', T}(x, y) = \gamma_{I, T}(x, y)$ (tidak terpengaruh oleh pencahayaan).

---

### 3.2 Deskriptor Histogram of Oriented Gradients (HOG)

Diperkenalkan oleh Navneet Dalal dan Bill Triggs pada CVPR 2005 untuk deteksi pejalan kaki (*pedestrian detection*). Struktur visual tubuh manusia dicirikan oleh distribusi lokal arah gradien intensitas tepi tanpa mempedulikan warna pakaian.

![Pipeline Deskriptor Histogram of Oriented Gradients (HOG)](/media/diagrams/chapter-40-hog-feature-pipeline.svg)
*Gambar 40.2 — Pipeline ekstraksi HOG: komputasi gradien 1D, voting magnitudo ke 9-bin sel 8x8, normalisasi blok tumpang tindih 2x2, dan klasifikasi linear SVM. Sumber: ITERA, Lisensi CC-BY-4.0.*

**Tahapan Komputasi HOG (Dalal & Triggs, 2005):**
1. **Komputasi Gradien**:
   Dihitung menggunakan mask turunan 1D sederhana tanpa smoothing: $D_x = [-1, 0, 1]$ dan $D_y = [-1, 0, 1]^T$.
   $$
   I_x(x, y) = I(x+1, y) - I(x-1, y), \quad I_y(x, y) = I(x, y+1) - I(x, y-1)
   $$
   Magnitudo gradien $M(x, y)$ dan orientasi $\theta(x, y)$:
   $$
   M(x, y) = \sqrt{I_x^2 + I_y^2}, \quad \theta(x, y) = \text{atan2}(I_y, I_x) \pmod{180^\circ}
   $$
   Orientasi diambil dalam rentang unsigned $0^\circ - 180^\circ$ (9 bin selebar $20^\circ$ per bin: $[0^\circ, 20^\circ), [20^\circ, 40^\circ), \dots, [160^\circ, 180^\circ)$).
2. **Spatial Binning ke dalam Sel (*Cells*)**:
   Citra dibagi menjadi sel-sel kecil berukuran $8 \times 8$ piksel. Setiap piksel di dalam sel memberikan suara (*vote*) berupa nilai magnitudonya $M(x, y)$ ke bin orientasi yang bersesuaian dengan interpolasi trilinear. Setiap sel menghasilkan vektor histogram berukuran 9 elemen.
3. **Normalisasi Blok Tumpang Tindih (*Block Normalization*)**:
   Untuk mengatasi variasi bayangan dan kontras lokal, sel-sel dikelompokkan ke dalam blok berukuran $2 \times 2$ sel ($16 \times 16$ piksel) dengan pergeseran tumpang tindih (*stride*) sebesar 1 sel ($8$ piksel). Setiap blok memiliki $2 \times 2 \times 9 = 36$ nilai, yang dinormalisasi menggunakan norma $L_2\text{-Hys}$ (L2-norm dengan batas pemangkasan clipping $0.2$):
   $$
   \mathbf{v}_{\text{norm}} = \frac{\mathbf{v}}{\sqrt{\|\mathbf{v}\|_2^2 + \epsilon^2}}
   $$

**Perhitungan Dimensi Total Vektor Fitur HOG (Jendela $64 \times 128$ piksel):**
- Jumlah sel horizontal: $64 / 8 = 8$ sel; Jumlah sel vertikal: $128 / 8 = 16$ sel.
- Jumlah blok horizontal: $8 - 1 = 7$ blok; Jumlah blok vertikal: $16 - 1 = 15$ blok.
- Total blok $= 7 \times 15 = 105$ blok.
- Setiap blok berisi $2 \times 2 \times 9 = 36$ fitur.
- **Dimensi Total Vektor HOG** $= 105 \times 36 = \mathbf{3.780} \text{ dimensi}$.

---

### 3.3 Klasifikasi Support Vector Machine (Linear SVM)

Diberikan dataset pelatihan pasangan fitur dan label $\{(\mathbf{x}_i, y_i)\}_{i=1}^N$ dengan $\mathbf{x}_i \in \mathbb{R}^{3780}$ dan $y_i \in \{-1, +1\}$ (misal: $-1$: latar belakang, $+1$: pejalan kaki).

Tujuan SVM adalah menemukan bidang hiper pemisah (*hyperplane*) $\mathbf{w}^T \mathbf{x} + b = 0$ yang memaksimalkan margin pemisah geometris $\frac{2}{\|\mathbf{w}\|}$ sekaligus meminimalkan kesalahan klasifikasi dengan penalti variabel kendur $\xi_i \ge 0$ (*Soft-Margin SVM*):

$$
\min_{\mathbf{w}, b, \xi} \frac{1}{2} \|\mathbf{w}\|_2^2 + C \sum_{i=1}^N \xi_i \quad \text{dengan kendala } y_i (\mathbf{w}^T \mathbf{x}_i + b) \ge 1 - \xi_i, \quad \xi_i \ge 0
$$

Di mana parameter regulasi $C > 0$ mengontrol trade-off antara pelebaran margin dan toleransi galat pelatihan. Fungsi keputusan untuk vektor uji baru $\mathbf{x}$:

$$
f(\mathbf{x}) = \text{sign}\left( \mathbf{w}^T \mathbf{x} + b \right)
$$

---

### 3.4 Non-Maximum Suppression (NMS)

Detektor jendela geser menghasilkan banyak kotak deteksi yang saling bertumpukan di sekitar objek yang sama. NMS menyaring deteksi redundan melalui langkah-langkah:
1. Urutkan seluruh kotak kandidat $B = \{b_1, \dots, b_m\}$ berdasarkan skor keyakinan SVM secara menurun.
2. Pilih kotak dengan skor tertinggi $b_{\text{best}}$ dan masukkan ke daftar deteksi final.
3. Hapus seluruh kotak lain $b_j$ yang memiliki nilai tumpang tindih **Intersection over Union (IoU)** melebihi ambang batas $\theta_{\text{IoU}}$ (biasanya $0.3 - 0.5$):
   $$
   \text{IoU}(b_{\text{best}}, b_j) = \frac{\text{Area}(b_{\text{best}} \cap b_j)}{\text{Area}(b_{\text{best}} \cup b_j)} > \theta_{\text{IoU}}
   $$
4. Ulangi proses hingga seluruh kandidat kotak selesai diproses.

---

## 4. Step-by-Step Worked Numerical Example

### Contoh: Perhitungan Nilai IoU (Intersection over Union) Antara Dua Kotak Deteksi

Diberikan dua kotak pembatas deteksi:
- Kotak $A$ (Ground Truth): $[x_1 = 50, y_1 = 50, x_2 = 150, y_2 = 200]$
- Kotak $B$ (Prediksi SVM): $[x_1 = 70, y_1 = 60, x_2 = 160, y_2 = 210]$

**Langkah 1: Hitung Luas Masing-Masing Kotak**
$$
\text{Lebar}_A = 150 - 50 = 100, \quad \text{Tinggi}_A = 200 - 50 = 150 \implies \text{Area}_A = 100 \times 150 = 15.000\text{ piksel}^2
$$
$$
\text{Lebar}_B = 160 - 70 = 90, \quad \text{Tinggi}_B = 210 - 60 = 150 \implies \text{Area}_B = 90 \times 150 = 13.500\text{ piksel}^2
$$

**Langkah 2: Hitung Koordinat Daerah Irisan (Intersection)**
$$
x_{\text{inter, 1}} = \max(x_{A1}, x_{B1}) = \max(50, 70) = 70
$$
$$
y_{\text{inter, 1}} = \max(y_{A1}, y_{B1}) = \max(50, 60) = 60
$$
$$
x_{\text{inter, 2}} = \min(x_{A2}, x_{B2}) = \min(150, 160) = 150
$$
$$
y_{\text{inter, 2}} = \min(y_{A2}, y_{B2}) = \min(200, 210) = 200
$$

**Langkah 3: Hitung Luas Irisan ($\text{Area}_{\text{inter}}$)**
$$
\text{Lebar}_{\text{inter}} = \max(0, 150 - 70) = 80
$$
$$
\text{Tinggi}_{\text{inter}} = \max(0, 200 - 60) = 140
$$
$$
\text{Area}_{\text{inter}} = 80 \times 140 = 11.200\text{ piksel}^2
$$

**Langkah 4: Hitung Luas Gabungan (Union) dan Nilai IoU**
$$
\text{Area}_{\text{union}} = \text{Area}_A + \text{Area}_B - \text{Area}_{\text{inter}} = 15.000 + 13.500 - 11.200 = 17.300\text{ piksel}^2
$$
$$
\text{IoU} = \frac{\text{Area}_{\text{inter}}}{\text{Area}_{\text{union}}} = \frac{11.200}{17.300} \approx 0.6474\text{ (atau } 64.74\% \text{)}
$$
Karena $\text{IoU} = 0.6474 \ge 0.50$, prediksi ini diklasifikasikan sebagai **True Positive (TP)** pada standar tolak ukur evaluasi Pascal VOC.

---

## 5. Failure Mode & Edge Case Analysis

1. **Variasi Rotasi & Deformasi Non-Rigid**: HOG dirancang invarian terhadap skala dan translasi, namun **sangat sensitif terhadap rotasi bidang citra** (misalnya orang yang tidur terlentang atau kamera miring $45^\circ$).
2. **Latar Belakang Sangat Bertekstur (Cluttered Background)**: Semak belukar atau pepohonan lebat menghasilkan banyak gradien acak yang dapat memicu alarm palsu (*False Positives*) pada skor SVM linear.
3. **Kompleksitas Komputasi Sliding Window**: Memindai citra $1920 \times 1080$ pada 10 skala piramida dengan pergeseran 8 piksel membutuhkan evaluasi lebih dari $100.000$ jendela per frame, memicu latensi tinggi pada CPU.

---

## 6. Summary & Key Takeaways

1. **Template Matching NCC** memberikan solusi cepat dan presisi untuk objek rigid yang orientasinya telah diketahui secara pasti.
2. **HOG** menangkap profil bentuk dan kontur tepi objek secara terstruktur melalui histogram orientasi gradien lokal.
3. **Linear SVM** memisahkan vektor fitur berdimensi tinggi (3.780D) dengan margin maksimum untuk generalisasi klasifikasi yang stabil.
4. **Non-Maximum Suppression (NMS)** dan metrik **IoU** adalah pilar evaluasi deteksi objek yang menghubungkan era visi komputer klasik dengan Deep Learning modern.

---

## 7. Academic References

1. **Dalal, N., & Triggs, B. (2005).** *Histograms of Oriented Gradients for Human Detection*. IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR), 1, 886-893. [DOI: 10.1109/CVPR.2005.177](https://doi.org/10.1109/CVPR.2005.177).
2. **Cortes, C., & Vapnik, V. (1995).** *Support-Vector Networks*. Machine Learning, 20(3), 273-297. [DOI: 10.1007/BF00994018](https://doi.org/10.1007/BF00994018).
3. **Csurka, G., Dance, C., Fan, L., Willamowski, J., & Bray, C. (2004).** *Visual Categorization with Bags of Keypoints*. ECCV Workshop on Statistical Learning in Computer Vision, 1-22.
