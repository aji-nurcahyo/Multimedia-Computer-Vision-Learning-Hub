# Chapter 41 — Deep Learning Foundations for Vision

## 1. Konsep & Motivasi Akademik
Deep Learning telah merevolusi bidang Computer Vision dari paradigma rekayasa fitur manual (*hand-crafted feature engineering* seperti SIFT, HOG, dan Haar cascades) menuju representasi fitur hierarkis yang dipelajari secara end-to-end langsung dari data piksel mentah. Landasan utama dari keberhasilan ini adalah Convolutional Neural Network (CNN), sebuah arsitektur jaringan syaraf tiruan yang secara khusus dirancang untuk memproses data berstruktur grid dua dimensi seperti citra digital.

Motivasi matematis dan biologis di balik CNN berakar pada dua prinsip utama:
1. **Local Receptive Fields & Spatial Hierarchy**: Area visual korteks mamalia (diteliti oleh Hubel & Wiesel, 1959) mendeteksi rangsangan secara terisolasi pada medan reseptif lokal. Lapisan-lapisan awal jaringan syaraf biologis mengekstraksi tepian (*edges*) dan orientasi spasial sederhana, yang kemudian diagregasikan oleh lapisan berikutnya menjadi motif tekstur, kontur bentuk, hingga bagian objek utuh.
2. **Translation Equivariance & Weight Sharing**: Fitur visual yang penting (misalnya sudut tajam atau lingkaran bola) memiliki arti representasional yang sama terlepas dari posisinya pada kanvas citra (pojok kiri atas atau tengah bawah). Dengan membagi bobot kernel yang identik di seluruh koordinat spasial (*parameter sharing*), CNN memangkas drastis jumlah parameter bebas dibandingkan Multi-Layer Perceptron (MLP) fully connected, sehingga mampu menghindari ledakan dimensi (*curse of dimensionality*) dan risiko overfitting parah.

```
+-----------------------------------------------------------------------+
|  Hierarki Representasi Spasial CNN                                    |
|                                                                       |
|  [Input Citra]  -->  [Layer Rendah]  -->  [Layer Tengah] --> [Klasifikasi]
|   Piksel 2D          Garis, Sudut        Tekstur, Pola,      Kucing: 0.94
|  (H x W x C)         Tepian Kontras      Bentuk Bagian       Anjing: 0.06
+-----------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Operasi Konvolusi Diskrit 2D (Cross-Correlation)
Dalam literatur machine learning dan implementasi deep learning (PyTorch/TensorFlow), operasi yang dinamakan "konvolusi" secara matematis merupakan korelasi silang 2D (*cross-correlation*). Diberikan citra input berdimensi tunggal $\mathbf{I} \in \mathbb{R}^{H \times W}$ dan kernel filter $\mathbf{K} \in \mathbb{R}^{K_h \times K_w}$, respons keluaran $\mathbf{S}(i, j)$ didefinisikan sebagai:

$$\mathbf{S}(i, j) = (\mathbf{I} * \mathbf{K})(i, j) = \sum_{m=0}^{K_h - 1} \sum_{n=0}^{K_w - 1} \mathbf{I}(i + m, j + n) \cdot \mathbf{K}(m, n)$$

Secara umum, data visual direpresentasikan sebagai tensor 4 dimensi dengan konvensi NCHW: $(B, C_{\text{in}}, H_{\text{in}}, W_{\text{in}})$, di mana $B$ adalah ukuran batch (*batch size*), $C$ jumlah kanal warna, $H$ tinggi piksel, dan $W$ lebar piksel. Untuk layer konvolusi dengan $C_{\text{out}}$ filter dan bias $\mathbf{b} \in \mathbb{R}^{C_{\text{out}}}$, nilai aktivasi kanal keluaran ke-$k$ pada koordinat $(i, j)$ adalah:

$$\mathbf{Y}_{k}(i, j) = b_k + \sum_{c=0}^{C_{\text{in}}-1} \sum_{m=0}^{K_h-1} \sum_{n=0}^{K_w-1} \mathbf{X}_{c}(i \cdot S_h + m - P_h, j \cdot S_w + n - P_w) \cdot \mathbf{W}_{k, c}(m, n)$$

di mana:
- $S_h, S_w$ adalah langkah pergeseran (*stride*) vertikal dan horizontal.
- $P_h, P_w$ adalah jumlah piksel nol tambahan di tepi (*zero-padding*).

### 2.2 Aritmatika Dimensi & Parameter Counting
Dimensi spasial keluaran $(H_{\text{out}}, W_{\text{out}})$ ditentukan secara deterministik oleh hubungan berikut:

$$H_{\text{out}} = \left\lfloor \frac{H_{\text{in}} - K_h + 2P_h}{S_h} \right\rfloor + 1, \quad W_{\text{out}} = \left\lfloor \frac{W_{\text{in}} - K_w + 2P_w}{S_w} \right\rfloor + 1$$

Jumlah total parameter yang dapat dipelajari (*learnable parameters*) untuk suatu convolutional layer dengan bobot $\mathbf{W} \in \mathbb{R}^{C_{\text{out}} \times C_{\text{in}} \times K_h \times K_w}$ dan bias $\mathbf{b} \in \mathbb{R}^{C_{\text{out}}}$ adalah:

$$\mathcal{P}_{\text{conv}} = (K_h \cdot K_w \cdot C_{\text{in}} + 1) \cdot C_{\text{out}}$$

### 2.3 Effective Receptive Field (ERF)
Medan reseptif (*receptive field*) $RF_l$ pada layer ke-$l$ mengukur rentang spasial pada citra input awal yang mempengaruhi nilai suatu aktivasi fitur tunggal. Dengan stride layer $s_l$ dan ukuran kernel $k_l$, medan reseptif terakumulasi secara rekursif:

$$RF_l = RF_{l-1} + (k_l - 1) \cdot \prod_{i=1}^{l-1} s_i, \quad \text{dengan } RF_0 = 1$$

### 2.4 Fungsi Aktivasi Non-Linier
Tanpa fungsi aktivasi non-linier, penumpukan (*stacking*) puluhan convolutional layer akan setara dengan sebuah transformasi linier tunggal tunggal ($\mathbf{W}_{\text{total}} = \mathbf{W}_n \dots \mathbf{W}_1$). Tiga fungsi aktivasi esensial meliputi:
- **Rectified Linear Unit (ReLU)**:
  $$f(x) = \max(0, x), \quad \frac{df}{dx} = \begin{cases} 1 & x > 0 \\ 0 & x \le 0 \end{cases}$$
  Keunggulan: gradien konstan $1.0$ untuk $x > 0$ memitigasi *vanishing gradient problem*, serta komputasi sangat cepat.
- **Leaky ReLU**:
  $$f(x) = \max(\alpha x, x), \quad 0 < \alpha \ll 1$$
  Mengatasi fenomena "Dying ReLU" di mana neuron mati permanen akibat gradien 0 yang berkepanjangan.
- **Gaussian Error Linear Unit (GELU)**:
  $$f(x) = x \cdot \Phi(x) = x \cdot P(X \le x), \quad X \sim \mathcal{N}(0, 1)$$
  Banyak digunakan pada arsitektur modern (ConvNeXt, Vision Transformers).

### 2.5 Spatial Pooling: Max Pooling & Average Pooling
Operasi pooling mereduksi dimensi spasial secara bertahap untuk mencapai invarian translasi lokal parsial dan memangkas biaya komputasi layer downstream.
- **Max Pooling**: Mengambil nilai aktivasi tertinggi dalam jendela geser $P_h \times P_w$:
  $$\mathbf{Y}(i, j) = \max_{m, n} \mathbf{X}(i \cdot S_h + m, j \cdot S_w + n)$$
- **Global Average Pooling (GAP)**: Merata-ratakan seluruh peta fitur spasial per kanal menjadi vektor skalar 1D berukuran $C_{\text{out}}$, menggantikan flattening raksasa sebelum klasifikasi dan memangkas jutaan parameter.

### 2.6 Fungsi Rugi (Loss Functions) & Optimasi Gradien
Untuk klasifikasi multi-kelas dengan $C$ kelas dan distribusi ground-truth one-hot $\mathbf{y} \in \{0, 1\}^C$, probabilitas model diperoleh melalui normalisasi Softmax:

$$p_k = \frac{e^{z_k}}{\sum_{j=1}^{C} e^{z_j}}$$

Fungsi rugi Categorical Cross-Entropy (Negative Log-Likelihood) dirumuskan:

$$\mathcal{L}_{\text{CE}} = - \sum_{k=1}^{C} y_k \ln(p_k)$$

Pembaruan bobot menggunakan algoritma optimasi Stochastic Gradient Descent (SGD) dengan Momentum Nesterov atau AdamW:

$$\mathbf{v}_{t} = \beta \mathbf{v}_{t-1} + (1 - \beta) \nabla_{\mathbf{W}} \mathcal{L}$$
$$\mathbf{W}_{t} = \mathbf{W}_{t-1} - \eta \mathbf{v}_{t} - \eta \lambda \mathbf{W}_{t-1}$$

di mana $\eta$ adalah learning rate dan $\lambda$ adalah koefisien weight decay.

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita hitung secara analitik forward-pass konvolusi 2D pada citra input berukuran $4 \times 4$ kanal tunggal dengan padding $P=0$ dan stride $S=1$ menggunakan kernel Sobel horizontal $3 \times 3$:

$$\mathbf{X} = \begin{bmatrix}
10 & 20 & 20 & 10 \\
30 & 50 & 40 & 20 \\
10 & 60 & 50 & 30 \\
20 & 10 & 30 & 20
\end{bmatrix}, \quad
\mathbf{K} = \begin{bmatrix}
-1 & -2 & -1 \\
0 & 0 & 0 \\
1 & 2 & 1
\end{bmatrix}, \quad b = 5.0$$

### Langkah 1: Tentukan Dimensi Output
$$H_{\text{out}} = \left\lfloor \frac{4 - 3 + 2(0)}{1} \right\rfloor + 1 = 2$$
$$W_{\text{out}} = \left\lfloor \frac{4 - 3 + 2(0)}{1} \right\rfloor + 1 = 2$$
Output berupa matriks $2 \times 2$.

### Langkah 2: Hitung Elemen $\mathbf{Y}(0, 0)$
Jendela input yang beririsan dengan kernel pada posisi $(0, 0)$:
$$\mathbf{X}_{\text{sub}}^{(0, 0)} = \begin{bmatrix}
10 & 20 & 20 \\
30 & 50 & 40 \\
10 & 60 & 50
\end{bmatrix}$$

Lakukan produk titik elemen-demi-elemen (*Hadamard product*) dan jumlahkan:
$$\sum (\mathbf{X}_{\text{sub}}^{(0, 0)} \odot \mathbf{K}) = (10 \cdot -1) + (20 \cdot -2) + (20 \cdot -1) + (30 \cdot 0) + (50 \cdot 0) + (40 \cdot 0) + (10 \cdot 1) + (60 \cdot 2) + (50 \cdot 1)$$
$$= -10 - 40 - 20 + 0 + 0 + 0 + 10 + 120 + 50 = 110$$

Tambahkan bias:
$$\mathbf{Y}(0, 0) = 110 + 5.0 = 115.0$$

Aktivasi ReLU:
$$\mathbf{A}(0, 0) = \max(0, 115.0) = 115.0$$

### Langkah 3: Hitung Elemen $\mathbf{Y}(0, 1)$
Jendela input pada posisi $(0, 1)$:
$$\mathbf{X}_{\text{sub}}^{(0, 1)} = \begin{bmatrix}
20 & 20 & 10 \\
50 & 40 & 20 \\
60 & 50 & 30
\end{bmatrix}$$

$$\sum (\mathbf{X}_{\text{sub}}^{(0, 1)} \odot \mathbf{K}) = (20 \cdot -1) + (20 \cdot -2) + (10 \cdot -1) + 0 + 0 + 0 + (60 \cdot 1) + (50 \cdot 2) + (30 \cdot 1)$$
$$= -20 - 40 - 10 + 60 + 100 + 30 = 120$$

Tambahkan bias dan ReLU:
$$\mathbf{Y}(0, 1) = 120 + 5.0 = 125.0 \implies \mathbf{A}(0, 1) = 125.0$$

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Vanishing Gradient & Exploding Gradient**:
   - *Penyebab*: Jaringan yang sangat dalam dengan fungsi aktivasi saturasi ($\text{sigmoid}$, $\tanh$) menghasilkan turunan $< 1.0$. Saat dikalikan berulang kali sepanjang puluhan layer melalui aturan rantai (*chain rule*), gradien pada layer-layer awal mendekati nol secara eksponensial. Sebaliknya, inisialisasi bobot yang terlalu besar menghasilkan gradien eksplosif.
   - *Solusi Teknik*: Gunakan inisialisasi bobot Kaiming/He Normal ($\sigma = \sqrt{2 / n_{\text{in}}}$) untuk aktivasi ReLU/GELU, aplikasikan Batch Normalization atau Layer Normalization, dan terapkan Gradient Clipping pada saat backpropagation.

2. **Dying ReLU Problem**:
   - *Penyebab*: Jika suatu neuron menghasilkan nilai negatif yang sangat besar karena pembaruan gradien yang agresif (learning rate terlalu tinggi), turunan ReLU menjadi identik dengan nol. Neuron tersebut tidak akan pernah teraktivasi lagi dan bobotnya terkunci secara permanen.
   - *Solusi Teknik*: Turunkan learning rate, terapkan warmup scheduler, atau beralih ke fungsi aktivasi LeakyReLU ($\alpha = 0.01$), PReLU, atau GELU.

3. **Spatial Information Destruction**:
   - *Penyebab*: Penggunaan pooling layer berulang tanpa padding konservatif mereduksi resolusi spasial terlalu dini, menghilangkan rincian geometri objek kecil.
   - *Solusi Teknik*: Gunakan dilated/atrous convolution untuk memperluas medan reseptif tanpa mereduksi resolusi spasial, atau terapkan arsitektur U-Net / Feature Pyramid Network (FPN) yang mempertahankan koneksi lewati (*skip connections*).

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
Platform Multimedia & Computer Vision Learning Hub mendukung 3 mode pembelajaran komplementer:
- **Mode A (Eksplorasi Web Interaktif)**: Gunakan komponen laboratorium `CnnFundamentalsExplorer.tsx` pada web untuk memvisualisasikan bagaimana kernel geser $3 \times 3$ dan max pooling memproses citra 2D secara real-time di browser tanpa instalasi Python.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Jalankan skrip CPU lokal `examples/example-01.py` menggunakan Python standar dan NumPy untuk menguji perhitungan konvolusi, parameter counting, dan Softmax dengan *zero third-party dependencies*.
- **Mode C (Notebook Komputasi & PyTorch)**: Buka berkas `notebooks/chapter-41-lab.ipynb` di Google Colab atau Jupyter lokal untuk mengeksekusi arsitektur PyTorch `MiniConvNet` dengan autograd training loop nyata.

### 5.2 Panduan Eksekusi Notebook (`chapter-41-lab.ipynb`)
1. Buka Jupyter Lab atau unggah berkas notebook ke [Google Colab](https://colab.research.google.com/).
2. Jika menggunakan Google Colab, jalankan instalasi paket di sel awal:
   ```bash
   !pip install -q torch torchvision matplotlib
   ```
3. Eksekusi sel berurutan. Sel 2 akan mendeteksi keberadaan engine PyTorch secara dinamis:
   - Jika PyTorch aktif: Notebook akan menginisialisasi `MiniConvNet` (Conv2D $\to$ BatchNorm $\to$ ReLU $\to$ MaxPool $\to$ Linear) dan menjalankan optimasi SGD 3 epoch dengan pencatatan loss riil.
   - Jika offline tanpa PyTorch: Notebook otomatis beralih ke engine deterministik NumPy yang menghitung konvolusi diskrit dan propagasi gradien analitis.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Tensor citra sintetis batch $B=8$, kanal $C=1$, resolusi $16 \times 16$ piksel.
- **Transformasi**:
  1. Conv2D ($1 \to 4$ kanal, kernel $3 \times 3$, padding 1) mempertahankan dimensi $(8, 4, 16, 16)$.
  2. MaxPool2d (stride 2) mereduksi dimensi spasial menjadi $(8, 4, 8, 8)$.
  3. Conv2D kedua ($4 \to 8$ kanal) menghasilkan $(8, 8, 8, 8)$.
  4. AdaptiveAvgPool2d mereduksi fitur menjadi vektor $(8, 8, 1, 1)$.
  5. Linear Classifier memetakan 8 fitur laten ke 2 logit kelas keluaran.
- **Output & Evaluasi**:
  - Penurunan nilai Cross-Entropy Loss tercatat dari Epoch 1 ke Epoch 3.
  - Gradien pada parameter terbukti terisi (*finite gradients*) tanpa `NaN` atau divergensi numerik.

### 5.4 Masalah Umum & Troubleshooting Mahasiswa
- **Error `RuntimeError: Given groups=1, weight of size [...] expected input to have X channels`**: Terjadi jika jumlah kanal tensor input ($C_{\text{in}}$) tidak cocok dengan dimensi kernel konvolusi. Pastikan konvensi tensor NCHW dipatuhi.
- **Loss Menghasilkan Nilai `NaN`**: Disebabkan oleh laju pembelajaran (*learning rate*) yang terlalu besar ($\eta > 1.0$) sehingga memicu ledakan gradien. Turunkan $\eta$ ke $0.01$ atau $0.001$.

---

## 6. Diagram Arsitektur Sistem

![Operasi Dasar CNN: Konvolusi Spasial & Max Pooling](/media/diagrams/chapter-41-cnn-convolution-and-pooling.svg)

![Fungsi Aktivasi Non-Linier: ReLU, Sigmoid & Tanh](/media/diagrams/chapter-41-activation-functions-comparison.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Convolutional Neural Network menghadirkan fondasi matematika yang elegan untuk memproses sinyal citra dua dimensi. Dengan memanfaatkan korelasi silang diskrit, pembagian bobot (*weight sharing*), dan medan reseptif lokal, CNN mampu memodelkan representasi visual hierarkis dengan efisiensi parameter yang luar biasa dibandingkan jaringan padat (*dense*). Memahami mekanisme internal konvolusi, propagasi gradien, dan aritmatika receptive field adalah syarat mutlak sebelum melangkah ke perancangan arsitektur modern seperti ResNet, YOLO, dan Vision Transformers.
