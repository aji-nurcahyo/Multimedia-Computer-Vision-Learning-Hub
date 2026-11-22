# MODUL ADV-01: FONDASI MATEMATIKA UNTUK COMPUTER VISION LANJUT
## Matrix Calculus, Spectral Geometry, Optimization Manifolds, and Lie Groups

**Kode Modul:** `ADV-01`  
**Level Akademik:** L3 — Advanced Curriculum  
**Pilar Riset:** Pillar 1 — Intelligent Computer Vision (ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 14 Jam (Teori, Penurunan Analitis, dan Eksperimen Komputasi)  
**Prasyarat Kurikulum Inti:** Bab 02 (Sinyal Digital & Kuantisasi), Bab 05 (NumPy & Visualisasi Komputasi), Bab 06 (Dasar Citra Digital), Bab 36 (Geometri Citra & Proyeksi), Bab 38 (Kalibrasi Kamera & Perspektif), Bab 41 (Dasar Deep Learning)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Perkembangan mutakhir dalam Computer Vision—mulai dari detektor transformator terdeformasi (*Deformable DETR*), pelacakan berbasis filter non-linear (*EKF/UKF/Particle Filter*), hingga rekonstruksi geometri multi-pandangan (*Bundle Adjustment* dan *Neural Radiance Fields*)—membutuhkan fondasi matematika yang jauh lebih ketat daripada aljabar linier dan kalkulus skalar tingkat sarjana dasar.

Modul ini memfasilitasi transisi intelektual dari representasi matriks elementer ke:
1. **Kalkulus Tensor & Turunan Matriks:** Menghitung turunan fungsi skalar terhadap matriks menggunakan kalkulus jejak (*trace calculus*).
2. **Dekomposisi Spektral & Teorema Eckart-Young-Mirsky:** Menganalisis sifat aproksimasi berperingkat rendah (*low-rank approximation*) melalui Dekomposisi Nilai Singular (SVD).
3. **Geometri Probabilistik & Teori Informasi:** Menghitung jarak Mahalanobis multivariat, divergensi Kullback-Leibler, dan batas bawah informasi timbal balik (*InfoNCE bound*).
4. **Optimasi Tak-Konveks & Kondisi KKT:** Memformulasikan metode kuadrat terkecil tak-linear (*Gauss-Newton* dan *Levenberg-Marquardt*) serta optimasi berkendala (*Karush-Kuhn-Tucker*).
5. **Grup Lie & Aljabar Lie Spasial:** Merepresentasikan orientasi dan transformasi kaku pada manifold $\text{SO}(3)$ dan $\text{SE}(3)$ tanpa kendala singularitas gimbal lock.

---

## 2. Penurunan Matematis & Struktur Materi

### 2.1 Kalkulus Matriks & Operator Jejak (Trace Calculus)

Dalam komputasi graf autograd neural network, kita sering berhadapan dengan fungsi objektif skalar $f(W) \in \mathbb{R}$ yang dievaluasi terhadap matriks parameter bobot $W \in \mathbb{R}^{m \times n}$.

#### Definisi Turunan Matriks
Turunan dari skalar $f$ terhadap matriks $W$ didefinisikan sebagai matriks berukuran sama dengan $W$:
$$\nabla_W f = \frac{\partial f}{\partial W} = \begin{bmatrix} \frac{\partial f}{\partial W_{11}} & \cdots & \frac{\partial f}{\partial W_{1n}} \\ \vdots & \ddots & \vdots \\ \frac{\partial f}{\partial W_{m1}} & \cdots & \frac{\partial f}{\partial W_{mn}} \end{bmatrix}$$

#### Teorema Differensial Jejak
Melalui hubungan diferensial $df = \text{Tr}\left( (\nabla_W f)^T dW \right)$, kita peroleh identitas penting:
1. $\nabla_W \text{Tr}(A W B) = A^T B^T$
2. $\nabla_W \text{Tr}(W^T A W) = (A + A^T) W$
3. $\nabla_W \log \det(W) = W^{-T} = (W^{-1})^T$ (untuk $W$ bujursangkar non-singular)

#### Aplikasi: Turunan Matriks Kovarians
Pada regresi linear multivariat dengan residual $r = Y - X W$, fungsi objektif kuadrat terkecil adalah:
$$\mathcal{L}(W) = \frac{1}{2} \|Y - X W\|_F^2 = \frac{1}{2} \text{Tr}\left( (Y - X W)^T (Y - X W) \right)$$
Diferensialnya:
$$d\mathcal{L} = -\text{Tr}\left( (Y - X W)^T X dW \right) = \text{Tr}\left( -X^T (Y - X W) dW \right)$$
Maka gradien analitisnya adalah:
$$\nabla_W \mathcal{L} = -X^T (Y - X W) = X^T X W - X^T Y$$
Menyamakan gradien dengan nol menghasilkan Persamaan Normal (*Normal Equations*):
$$X^T X W = X^T Y \implies W^* = (X^T X)^{-1} X^T Y$$

---

### 2.2 Dekomposisi Nilai Singular (SVD) & Teorema Eckart-Young-Mirsky

Setiap matriks nyata $A \in \mathbb{R}^{m \times n}$ dapat difaktorisasi secara tunggal menjadi:
$$A = U \Sigma V^T = \sum_{i=1}^r \sigma_i u_i v_i^T$$
di mana:
- $U \in \mathbb{R}^{m \times m}$ adalah matriks ortogonal kolom ($U^T U = I_m$), vektor kolom $u_i$ adalah vektor singular kiri (arah eigen dari $A A^T$).
- $\Sigma \in \mathbb{R}^{m \times n}$ adalah matriks diagonal dengan entri $\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_r > 0$, yang disebut nilai singular (*singular values*).
- $V \in \mathbb{R}^{n \times n}$ adalah matriks ortogonal ($V^T V = I_n$), kolom $v_i$ adalah vektor singular kanan (arah eigen dari $A^T A$).

#### Teorema Eckart-Young-Mirsky
Aproksimasi matriks berperingkat $k < r$ terbaik terhadap $A$ dalam norma Frobenius $\| \cdot \|_F$ dan norma spektral $\| \cdot \|_2$ diberikan oleh pemotongan SVD:
$$A_k = \sum_{i=1}^k \sigma_i u_i v_i^T = \arg\min_{\text{rank}(B) \le k} \|A - B\|_F$$
Galat aproksimasi minimal yang dicapai adalah:
$$\|A - A_k\|_F^2 = \sum_{i=k+1}^r \sigma_i^2, \quad \|A - A_k\|_2 = \sigma_{k+1}$$

#### Angka Kondisi Numerik (Condition Number)
Sensitivitas solusi sistem linier $A x = b$ terhadap perturbasi diukur oleh angka kondisi numerik:
$$\kappa(A) = \|A\|_2 \|A^{-1}\|_2 = \frac{\sigma_{\max}}{\sigma_{\min}} = \frac{\sigma_1}{\sigma_r}$$
Jika $\kappa(A) \gg 10^3$, matriks tergolong *ill-conditioned*, sehingga inversi langsung sangat rentan terhadap amplifikasi derau (*noise amplification*).

---

### 2.3 Probabilitas Multivariat & Jarak Mahalanobis

Dalam pelacakan target multi-objek (ADV-03), pengukuran sensor spasial $\mathbf{z} \in \mathbb{R}^d$ dimodelkan sebagai distribusi Gauss multivariat:
$$p(\mathbf{z}) = \frac{1}{(2\pi)^{d/2} |\Sigma|^{1/2}} \exp\left( -\frac{1}{2} (\mathbf{z} - \boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{z} - \boldsymbol{\mu}) \right)$$

#### Jarak Mahalanobis
Jarak statistik berbobot kovarians antara titik $\mathbf{z}$ dan pusat distribusi $\boldsymbol{\mu}$ didefinisikan sebagai:
$$d_M(\mathbf{z}, \boldsymbol{\mu}; \Sigma) = \sqrt{(\mathbf{z} - \boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{z} - \boldsymbol{\mu})}$$
Sifat-sifat matematis:
- Skala invarian terhadap transformasi linier: jika $\mathbf{y} = A \mathbf{z}$, maka $d_M$ tidak berubah.
- Kuadrat jarak $d_M^2$ berdistribusi chi-squared dengan $d$ derajat kebebasan: $d_M^2 \sim \chi^2_d$.
- Digunakan sebagai fungsi *ellipsoidal gating* untuk menyaring deteksi palsu (*clutter*) pada filter Kalman.

---

### 2.4 Optimasi Tak-Konveks: Metode Gauss-Newton & Levenberg-Marquardt

Pada estimasi pose kamera dan penyesuaian berkas (*Bundle Adjustment*), fungsi residual non-linear diminimalkan:
$$\min_{\mathbf{x}} f(\mathbf{x}) = \frac{1}{2} \sum_{i=1}^m r_i(\mathbf{x})^2 = \frac{1}{2} \|\mathbf{r}(\mathbf{x})\|_2^2$$
di mana $\mathbf{r}(\mathbf{x}) = [r_1(\mathbf{x}), \dots, r_m(\mathbf{x})]^T$ adalah vektor residual kesalahan reproyeksi.

#### Linearitas Orde-Pertama & Aproksimasi Hessian
Ekspansi Taylor orde-pertama di sekitar estimasi saat ini $\mathbf{x}_k$:
$$\mathbf{r}(\mathbf{x}_k + \Delta \mathbf{x}) \approx \mathbf{r}(\mathbf{x}_k) + J(\mathbf{x}_k) \Delta \mathbf{x}$$
di mana $J \in \mathbb{R}^{m \times n}$ adalah matriks Jacobian dari residual ($J_{ij} = \frac{\partial r_i}{\partial x_j}$).  
Fungsi biaya kuadratik teraproksimasi menjadi:
$$f(\mathbf{x}_k + \Delta \mathbf{x}) \approx \frac{1}{2} \|\mathbf{r}(\mathbf{x}_k)\|^2 + \mathbf{r}(\mathbf{x}_k)^T J \Delta \mathbf{x} + \frac{1}{2} \Delta \mathbf{x}^T (J^T J) \Delta \mathbf{x}$$

Menyamakan turunan terhadap $\Delta \mathbf{x}$ ke nol menghasilkan **Persamaan Normal Gauss-Newton**:
$$(J^T J) \Delta \mathbf{x}_{\text{GN}} = -J^T \mathbf{r}(\mathbf{x}_k)$$

#### Regularisasi Levenberg-Marquardt (LM)
Ketika $J^T J$ bersifat singular atau hampir singular (misalnya ketika baseline kamera terlalu sempit), langkah Gauss-Newton tidak stabil. Metode Levenberg-Marquardt menambahkan faktor redaman (*damping parameter*) $\lambda \ge 0$:
$$(J^T J + \lambda \operatorname{diag}(J^T J)) \Delta \mathbf{x}_{\text{LM}} = -J^T \mathbf{r}(\mathbf{x}_k)$$
- Jika $\lambda \rightarrow 0$, langkah mendekati Gauss-Newton murni (konvergensi kuadratik di dekat minimum).
- Jika $\lambda \gg 0$, langkah mendekati Gradient Descent terbobot (langkah aman saat jauh dari minimum).

---

### 2.5 Grup Lie $\text{SO}(3), \text{SE}(3)$ dan Aljabar Lie $\mathfrak{so}(3), \mathfrak{se}(3)$

Rotasi 3D tidak membentuk ruang vektor Euclidean $\mathbb{R}^3$, melainkan manifold *Special Orthogonal Group*:
$$\text{SO}(3) = \{ R \in \mathbb{R}^{3 \times 3} \mid R^T R = I, \; \det(R) = +1 \}$$

Menjumlahkan dua matriks rotasi $R_1 + R_2$ tidak menghasilkan matriks rotasi. Oleh karena itu, optimasi orientasi kamera dilakukan pada aljabar Lie ruang tangen (*tangent space*) di sekitar elemen identitas.

#### Pemetaan Eksponensial (Formula Rodrigues)
Aljabar Lie $\mathfrak{so}(3)$ berkorespondensi dengan matriks simetri-miring (*skew-symmetric*):
$$[\boldsymbol{\omega}]_\times = \begin{bmatrix} 0 & -\omega_3 & \omega_2 \\ \omega_3 & 0 & -\omega_1 \\ -\omega_2 & \omega_1 & 0 \end{bmatrix} \in \mathfrak{so}(3)$$
Pemetaan eksponensial $\exp : \mathfrak{so}(3) \rightarrow \text{SO}(3)$ dinyatakan secara eksak oleh **Formula Rotasi Rodrigues**:
$$R = \exp([\boldsymbol{\omega}]_\times) = I + \frac{\sin \theta}{\theta} [\boldsymbol{\omega}]_\times + \frac{1 - \cos \theta}{\theta^2} [\boldsymbol{\omega}]_\times^2$$
di mana sudut rotasi adalah $\theta = \|\boldsymbol{\omega}\|_2$, dan sumbu rotasi satuan adalah $\mathbf{u} = \boldsymbol{\omega} / \theta$.

---

## 3. Contoh Numerik Terhitung (Worked Numerical Examples)

### Contoh 1: SVD dan Galat Rekonstruksi Rank-1
Diberikan matriks citra lokal $A = \begin{bmatrix} 3 & 1 \\ 1 & 3 \end{bmatrix}$.

1. **Hitung $A A^T$:**
   $$A A^T = \begin{bmatrix} 3 & 1 \\ 1 & 3 \end{bmatrix} \begin{bmatrix} 3 & 1 \\ 1 & 3 \end{bmatrix} = \begin{bmatrix} 10 & 6 \\ 6 & 10 \end{bmatrix}$$
2. **Nilai Eigen dari $A A^T$:**
   $$\det(A A^T - \lambda I) = (10 - \lambda)^2 - 36 = \lambda^2 - 20\lambda + 64 = (\lambda - 16)(\lambda - 4) = 0$$
   $$\lambda_1 = 16 \implies \sigma_1 = \sqrt{16} = 4, \quad \lambda_2 = 4 \implies \sigma_2 = \sqrt{4} = 2$$
3. **Angka Kondisi:**
   $$\kappa(A) = \frac{\sigma_1}{\sigma_2} = \frac{4}{2} = 2.0$$
4. **Vektor Singular Kiri $U$:**
   - Untuk $\lambda_1 = 16$: $(A A^T - 16I) u_1 = \begin{bmatrix} -6 & 6 \\ 6 & -6 \end{bmatrix} u_1 = 0 \implies u_1 = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 \\ 1 \end{bmatrix}$.
   - Untuk $\lambda_2 = 4$: $u_2 = \frac{1}{\sqrt{2}} \begin{bmatrix} -1 \\ 1 \end{bmatrix}$.
5. **Aproksimasi Rank-1 Terbaik ($A_1$):**
   $$A_1 = \sigma_1 u_1 u_1^T = 4 \left( \frac{1}{2} \begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix} \right) = \begin{bmatrix} 2 & 2 \\ 2 & 2 \end{bmatrix}$$
6. **Galat Frobenius:**
   $$\|A - A_1\|_F^2 = (3-2)^2 + (1-2)^2 + (1-2)^2 + (3-2)^2 = 1 + 1 + 1 + 1 = 4 = \sigma_2^2 \quad \text{(Terbukti sesuai Teorema)}$$

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

### 4.1 Tujuan Eksperimen
Membuktikan secara komputasional sifat peluruhan nilai singular (*spectral decay*) pada citra alami, mengukur kompresi energi melalui pemotongan rank-$k$, dan mengamati efek angka kondisi $\kappa(A)$ pada kestabilan numerik inversi kuadrat terkecil.

### 4.2 Formulasi Algoritma
1. Bentuk matriks uji terdistorsi $A \in \mathbb{R}^{m \times n}$.
2. Hitung dekomposisi nilai singular $A = U \Sigma V^T$.
3. Rekonstruksi aproksimasi rank-$k$: $A_k = \sum_{i=1}^k \sigma_i u_i v_i^T$.
4. Ukur Galat Relatif Frobenius: $\epsilon_k = \frac{\|A - A_k\|_F}{\|A\|_F} = \sqrt{\frac{\sum_{i=k+1}^r \sigma_i^2}{\sum_{i=1}^r \sigma_i^2}}$.
5. Simulasikan perturbasi derau pada sistem linier $A x = b$ terhadap variasi angka kondisi $\kappa(A) \in [1, 10^4]$.

### 4.3 Analisis Kegagalan & Batasan Numerik
- **Degenerasi Rank:** Jika $\sigma_{\min} < 10^{-14}$, matriks praktis singular secara komputasi presisi ganda (IEEE 754 float64). Inversi biasa `np.linalg.inv` menghasilkan nilai `NaN` atau galat tak terhingga.
- **Solusi Rekayasa:** Penggunaan pseudo-inverse Moore-Penrose $A^+ = V \Sigma^+ U^T$ dengan pemotongan ambang nilai singular $\sigma_i < \epsilon \cdot \sigma_1$.

---

## 5. Hubungan dengan Jalur Penelitian (Research Connections)

- **Track R01 (Visual Detection):** Turunan tensor dan matriks kovarians digunakan dalam fungsi loss *Generalized Focal Loss* dan *Continuous Uncertainty Bounding Boxes*.
- **Track R02 (Multi-Object Tracking):** Jarak Mahalanobis dan pemodelan kovarians elipsoidal menjadi fondasi asosiasi data pada filter Kalman dan *ByteTrack*.
- **Track R06 (Spatial Intelligence & 3D Vision):** Formula Rodrigues dan aljabar Lie $\mathfrak{se}(3)$ digunakan secara langsung dalam minimasi galat reproyeksi pada *Visual Odometry* dan *Bundle Adjustment*.

