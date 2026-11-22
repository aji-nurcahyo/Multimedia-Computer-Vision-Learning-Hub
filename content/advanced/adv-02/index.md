# MODUL ADV-02: PENGOLAHAN CITRA DIGITAL LANJUT & MASALAH INVERSI MATEMATIS
## Variational Image Restoration, Total Variation Regularization, and ADMM Solvers

**Kode Modul:** `ADV-02`  
**Level Akademik:** L3 — Advanced Curriculum  
**Pilar Riset:** Pillar 2 — Intelligent Visual Perception & Sensing (Roadmap ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 14 Jam (Teori, Penurunan Analitis, dan Eksperimen Komputasi)  
**Prasyarat Kurikulum Inti:** Bab 06 (Representasi Citra), Bab 08-09 (Distribusi Intensitas), Bab 10 (Konvolusi Spasial), Bab 11 (Transformasi Frekuensi 2D), Bab 12 (Restorasi Citra Dasar), Bab 13 (Deteksi Tepi), dan Modul ADV-01 (Fondasi Matematika & SVD)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Pengolahan citra digital tingkat sarjana konvensional umumnya mendekati restorasi citra (seperti denoising dan deblurring) melalui pemfilteran spasial intuitif heuristik—seperti filter median, filter Wiener, atau filter bilateral. Namun, dalam sistem penginderaan visual canggih (seperti mikroskopi resolusi super, pencitraan astronomi, tomografi komputasi medis, dan persepsi robot otonom di bawah kabut/hujan lebat), restorasi citra harus diformulasikan secara ketat sebagai **masalah inversi matematis ill-posed** (*ill-posed inverse problem*).

Modul ini memfasilitasi pendalaman akademis dari pemfilteran intuitif menuju:
1. **Model Degradasi Forward Teratur:** Memodelkan fenomena fisis distorsi optik, aberasi lensa, dan derau sensor sebagai operator linier $y = A x + n$.
2. **Analisis Kestabilan Hadamard:** Mengidentifikasi pelanggaran kriteria ketiga Hadamard (ketiadaan kestabilan) akibat peluruhan nilai singular operator degradasi $\sigma_i(A) \to 0$.
3. **Regularisasi Tikhonov vs Total Variation:** Menganalisis dilema kehalusan kuadratik Sobolev ($L_2$ norm) yang memudarkan tepi batas, dibandingkan regularisasi non-smooth *Total Variation* ($L_1$ norm) yang melestarikan ketajaman tepi diskontinuitas (*edge-preserving*).
4. **Optimasi Pemisahan Variabel ADMM:** Menurunkan algoritma *Alternating Direction Method of Multipliers* (ADMM) untuk menyelesaikan masalah variasi Rudin-Osher-Fatemi (ROF) melalui dekomposisi subproblem $x$ domain frekuensi dan operator proksimal penyusutan (*soft-thresholding*).
5. **Kriteria Konvergensi Numerik:** Memantau residu primer (*primal residual*) dan residu ganda (*dual residual*) untuk menjamin kelayakan solusi komputasi tanpa asumsi heuristik.

---

## 2. Penurunan Matematis & Struktur Materi

### 2.1 Model Degradasi Forward & Masalah Buruk (Ill-Posedness)

Dalam sistem pencitraan optik digital, pembentukan citra terdegradasi kontinu dimodelkan oleh integral konvolusi Fredholm jenis pertama:
$$y(u, v) = \iint_{\mathbb{R}^2} h(u - \xi, v - \eta) x(\xi, \eta) \, d\xi \, d\eta + n(u, v)$$
di mana $x(\xi, \eta)$ adalah radiansi adegan asli, $h(u, v)$ adalah *Point Spread Function* (PSF) sistem optik, dan $n(u, v)$ adalah derau aditif.

Setelah diskretisasi spasial berdimensi $N \times N$, citra direpresentasikan sebagai vektor leksikografis $\mathbf{x}, \mathbf{y} \in \mathbb{R}^{M}$ (dengan $M = N^2$), menghasilkan sistem persamaan linier:
$$\mathbf{y} = A \mathbf{x} + \mathbf{n}$$
di mana $A \in \mathbb{R}^{M \times M}$ adalah matriks Toeplitz blok sirkulan (*Block Circulant with Circulant Blocks* / BCCB) yang merepresentasikan konvolusi 2D dengan kondisi batas periodik, dan $\mathbf{n} \sim \mathcal{N}(0, \sigma^2 I)$ adalah derau Gauss putih.

#### Kriteria Kebaikan Masalah Jacques Hadamard (1902)
Suatu masalah matematis dikatakan *well-posed* menurut Hadamard jika memenuhi tiga syarat mutlak:
1. **Keberadaan Solusi (*Existence*):** Untuk setiap pengamatan $\mathbf{y}$, terdapat setidaknya satu solusi $\mathbf{x}$.
2. **Ketunggalan Solusi (*Uniqueness*):** Solusi $\mathbf{x}$ bersifat unik.
3. **Kestabilan Solusi (*Stability*):** Solusi $\mathbf{x}$ bergantung secara kontinu pada data $\mathbf{y}$. Artinya, perturbasi kecil $\|\delta \mathbf{y}\|$ hanya menghasilkan perturbasi terkontrol $\|\delta \mathbf{x}\|$.

#### Pelanggaran Kestabilan pada Inversi Naive
Jika matriks degradasi $A$ dapat dibalik, estimasi kuadrat terkecil biasa (*Ordinary Least Squares* / OLS) adalah:
$$\hat{\mathbf{x}}_{\text{naive}} = A^{-1} \mathbf{y} = A^{-1} (A \mathbf{x} + \mathbf{n}) = \mathbf{x} + A^{-1} \mathbf{n}$$
Melalui Dekomposisi Nilai Singular (SVD) $A = U \Sigma V^T = \sum_{i=1}^M \sigma_i u_i v_i^T$:
$$\hat{\mathbf{x}}_{\text{naive}} = \mathbf{x} + \sum_{i=1}^M \frac{u_i^T \mathbf{n}}{\sigma_i} v_i$$
Karena operator konvolusi blur bekerja sebagai filter lolos-rendah (*low-pass filter*), spektrum nilai singular meluruh secara eksponensial menuju nol ($\lim_{i \to M} \sigma_i = 0$). Akibatnya, komponen proyeksi derau frekuensi tinggi $u_i^T \mathbf{n}$ dikalikan oleh faktor $\frac{1}{\sigma_i} \to \infty$. Inversi naive ini meledak secara katastropik dan merusak seluruh struktur citra.

---

### 2.2 Regularisasi Kuadratik Tikhonov ($L_2$ Sobolev)

Untuk menstabilkan inversi, Andrey Tikhonov (1963) memperkenalkan istilah penalti regularisasi kuadratik:
$$\min_{\mathbf{x}} \mathcal{J}_{\text{Tik}}(\mathbf{x}) = \frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2 + \frac{\lambda}{2} \|L \mathbf{x}\|_2^2$$
di mana:
- $\frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2$ adalah suku kesetiaan data (*data fidelity term*).
- $\|L \mathbf{x}\|_2^2$ adalah suku regularisasi apriori, di mana $L$ biasanya adalah matriks identitas $I$ (Tikhonov standar) atau operator turunan diferensial Laplace $\nabla^2$ (penalti kelicinan Sobolev).
- $\lambda > 0$ adalah parameter regularisasi yang menyeimbangkan kecocokan data versus kehalusan solusi.

#### Solusi Bentuk Tertutup Tikhonov
Dengan menyamakan gradien $\nabla_{\mathbf{x}} \mathcal{J}_{\text{Tik}} = 0$:
$$A^T (A \mathbf{x} - \mathbf{y}) + \lambda L^T L \mathbf{x} = 0 \implies (A^T A + \lambda L^T L) \mathbf{x} = A^T \mathbf{y}$$
$$\hat{\mathbf{x}}_{\text{Tik}} = (A^T A + \lambda L^T L)^{-1} A^T \mathbf{y}$$

Melalui representasi SVD dengan $L = I$:
$$\hat{\mathbf{x}}_{\text{Tik}} = \sum_{i=1}^M \left( \frac{\sigma_i^2}{\sigma_i^2 + \lambda} \right) \frac{u_i^T \mathbf{y}}{\sigma_i} v_i$$
Faktor filter Tikhonov $f_i = \frac{\sigma_i^2}{\sigma_i^2 + \lambda}$ mendekati 1 ketika $\sigma_i^2 \gg \lambda$ (frekuensi rendah terpreservasi), dan mendekati 0 ketika $\sigma_i^2 \ll \lambda$ (frekuensi tinggi teredam).

#### Kelemahan Mendasar Tikhonov: Pelebaran Diskontinuitas Tepi
Norma kuadratik $\|L \mathbf{x}\|_2^2 = \sum_j (\nabla x_j)^2$ menghukum perbedaan intensitas besar secara kuadratik. Pada tepian objek alami (*step edges*), nilai gradien $|\nabla x|$ sangat besar. Regularisasi Tikhonov memaksakan penalti penalti kuadratik yang sangat masif pada tepian ini, sehingga solusi optimal terdistorsi menjadi landai dan buram (*over-smoothed edges*).

---

### 2.3 Formulasi Variasional: Model Rudin-Osher-Fatemi (ROF) & Total Variation

Untuk mengatasi kelemahan Tikhonov, Leonid Rudin, Stanley Osher, dan Emad Fatemi (1992) merumuskan model variasi berbasis **Total Variation (TV)**:
$$\min_{\mathbf{x}} \mathcal{J}_{\text{ROF}}(\mathbf{x}) = \frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2 + \lambda \|\mathbf{x}\|_{\text{TV}}$$

#### Definisi Total Variation Diskrit 2D
Pada kisi citra diskret berukuran $H \times W$, operator gradien horizontal dan vertikal didefinisikan sebagai:
$$(\nabla_x \mathbf{x})_{i, j} = \mathbf{x}_{i, j+1} - \mathbf{x}_{i, j}, \quad (\nabla_y \mathbf{x})_{i, j} = \mathbf{x}_{i+1, j} - \mathbf{x}_{i, j}$$

1. **Total Variation Isotropik ($\ell_2$-norm gradien spasial):**
   $$\|\mathbf{x}\|_{\text{TV, iso}} = \sum_{i=1}^H \sum_{j=1}^W \sqrt{(\nabla_x \mathbf{x})_{i, j}^2 + (\nabla_y \mathbf{x})_{i, j}^2}$$
   Bersifat invarian terhadap rotasi orientasi tepi koordinat.

2. **Total Variation Anisotropik ($\ell_1$-norm terpisah):**
   $$\|\mathbf{x}\|_{\text{TV, aniso}} = \sum_{i=1}^H \sum_{j=1}^W \left( |(\nabla_x \mathbf{x})_{i, j}| + |(\nabla_y \mathbf{x})_{i, j}| \right)$$

#### Mengapa Total Variation Melestarikan Tepi?
Norma $L_1$ pada gradien menghukum turunan secara linier, bukan kuadratik:
$$\frac{d}{d(\nabla x)} |\nabla x| = \text{sign}(\nabla x) = \pm 1 \quad (\text{konstan})$$
Penalti linier ini tidak meledak saat melintasi tepi tajam (*step discontinuity*). Akibatnya, model ROF mengizinkan gradien bernilai nol hampir di seluruh area homogen (*flat regions*) dan nilai gradien besar pada batas objek, membentuk solusi yang piecewise-constant (*cartoon-like images*) tanpa efek blur.

---

### 2.4 Optimasi Pemisahan Variabel: ADMM (Alternating Direction Method of Multipliers)

Fungsi tujuan ROF bersifat non-smooth (tidak dapat diturunkan pada $\nabla \mathbf{x} = 0$). Penyelesaian efisien modern dilakukan melalui algoritma **ADMM** (*Boyd et al., 2011*) menggunakan pemisahan variabel (*variable splitting*).

#### Formulasi Pemisahan Kendala
Perkenalkan variabel bantu $\mathbf{z} = [\mathbf{z}_x, \mathbf{z}_y]^T$:
$$\min_{\mathbf{x}, \mathbf{z}} \frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2 + \lambda \|\mathbf{z}\|_1 \quad \text{s.t.} \quad \mathbf{z} = \nabla \mathbf{x}$$

#### Fungsi Augmented Lagrangian
$$\mathcal{L}_\rho(\mathbf{x}, \mathbf{z}, \mathbf{u}) = \frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2 + \lambda \|\mathbf{z}\|_1 + \frac{\rho}{2} \|\nabla \mathbf{x} - \mathbf{z} + \mathbf{u}\|_2^2 - \frac{\rho}{2} \|\mathbf{u}\|_2^2$$
di mana $\mathbf{u} = \frac{1}{\rho} \boldsymbol{\mu}$ adalah variabel ganda (*dual variable*) terskala, dan $\rho > 0$ adalah parameter penalti Augmented Lagrangian.

Algoritma ADMM memecah optimasi menjadi tiga langkah iteratif yang dapat diselesaikan secara tertutup:

#### Langkah 1: Subproblem-$\mathbf{x}$ (Minimisasi Kuadratik)
$$\mathbf{x}^{k+1} = \arg\min_{\mathbf{x}} \left\{ \frac{1}{2} \|A \mathbf{x} - \mathbf{y}\|_2^2 + \frac{\rho}{2} \|\nabla \mathbf{x} - \mathbf{z}^k + \mathbf{u}^k\|_2^2 \right\}$$
Turunan sama dengan nol:
$$(A^T A + \rho \nabla^T \nabla) \mathbf{x}^{k+1} = A^T \mathbf{y} + \rho \nabla^T (\mathbf{z}^k - \mathbf{u}^k)$$
Karena $A$ dan operator diferensial $\nabla = [D_x, D_y]^T$ bersifat sirkulan (BCCB) di bawah kondisi batas periodik, sistem linier ini diselesaikan secara instan dalam domain frekuensi 2D menggunakan Transformasi Fourier Cepat (2D FFT):
$$\mathbf{x}^{k+1} = \mathcal{F}^{-1} \left( \frac{\overline{\mathcal{F}(A)} \odot \mathcal{F}(\mathbf{y}) + \rho \left( \overline{\mathcal{F}(D_x)} \odot \mathcal{F}(\mathbf{z}_x^k - \mathbf{u}_x^k) + \overline{\mathcal{F}(D_y)} \odot \mathcal{F}(\mathbf{z}_y^k - \mathbf{u}_y^k) \right)}{|\mathcal{F}(A)|^2 + \rho \left( |\mathcal{F}(D_x)|^2 + |\mathcal{F}(D_y)|^2 \right) + \epsilon} \right)$$
Kompleksitas komputasi: $\mathcal{O}(M \log M)$, sangat cepat dan stabil.

#### Langkah 2: Subproblem-$\mathbf{z}$ (Operator Proksimal Penyusutan / Soft-Thresholding)
$$\mathbf{z}^{k+1} = \arg\min_{\mathbf{z}} \left\{ \lambda \|\mathbf{z}\|_1 + \frac{\rho}{2} \|\mathbf{z} - (\nabla \mathbf{x}^{k+1} + \mathbf{u}^k)\|_2^2 \right\}$$
Solusi analitis eksak diberikan oleh operator proksimal norma $\ell_1$ (*soft-thresholding operator*):
$$\mathbf{z}^{k+1} = \mathcal{S}_{\lambda / \rho} \left( \nabla \mathbf{x}^{k+1} + \mathbf{u}^k \right)$$
di mana:
$$\mathcal{S}_{\tau}(v) = \text{sign}(v) \max(|v| - \tau, 0)$$

#### Langkah 3: Pembaruan Variabel Ganda $\mathbf{u}$ (Dual Ascent)
$$\mathbf{u}^{k+1} = \mathbf{u}^k + \nabla \mathbf{x}^{k+1} - \mathbf{z}^{k+1}$$

---

### 2.5 Pemantauan Konvergensi & Kriteria Penghentian Numerik

Konvergensi ADMM dijamin oleh teori optimasi konveks. Untuk memvalidasi stabilitas komputasi, dua metrik residu dipantau pada setiap iterasi $k$:

1. **Norma Residu Primer (*Primal Residual*):**
   $$\|r^{k+1}\|_F = \|\nabla \mathbf{x}^{k+1} - \mathbf{z}^{k+1}\|_F$$
   Mengukur derajat pemenuhan kendala kelayakan primer $\mathbf{z} = \nabla \mathbf{x}$.

2. **Norma Residu Ganda (*Dual Residual*):**
   $$\|s^{k+1}\|_F = \rho \|\mathbf{z}^{k+1} - \mathbf{z}^k\|_F$$
   Mengukur derajat pemenuhan kondisi stasioneritas optimalitas KKT.

Kriteria penghentian (*stopping criteria*) terpenuhi saat:
$$\|r^k\|_F \le \epsilon_{\text{pri}} \quad \text{dan} \quad \|s^k\|_F \le \epsilon_{\text{dual}}$$
di mana toleransi dihitung berdasarkan norma Frobenius relatif dari variabel yang bersangkutan.

---

## 3. Contoh Perhitungan Numerik Langkah-demi-Langkah

Mari kita tinjau contoh numerik 1D sederhana untuk memahami mekanisme pemisahan variabel ADMM.

Misalkan kita memiliki sinyal pengamatan diskret berderau berukuran $N = 3$:
$$\mathbf{y} = [1.0, 1.9, 2.0]^T, \quad A = I_3 \quad (\text{Denoising Saja})$$
Operator beda maju:
$$\nabla = \begin{bmatrix} -1 & 1 & 0 \\ 0 & -1 & 1 \end{bmatrix}$$
Sehingga $\nabla \mathbf{x} = [x_2 - x_1, x_3 - x_2]^T$.

Tetapkan parameter: $\lambda = 0.5, \rho = 1.0 \implies \tau = \frac{\lambda}{\rho} = 0.5$.  
Inisialisasi awal ($k=0$): $\mathbf{x}^0 = \mathbf{y} = [1.0, 1.9, 2.0]^T, \mathbf{z}^0 = [0, 0]^T, \mathbf{u}^0 = [0, 0]^T$.

### Iterasi 1 ($k=1$):
1. **Gradien awal:**
   $$\nabla \mathbf{x}^0 = [1.9 - 1.0, 2.0 - 1.9]^T = [0.9, 0.1]^T$$
2. **Subproblem-$\mathbf{z}$:**
   $$v = \nabla \mathbf{x}^0 + \mathbf{u}^0 = [0.9 + 0, 0.1 + 0]^T = [0.9, 0.1]^T$$
   Aplikasikan soft-thresholding $\mathcal{S}_{0.5}(v)$:
   $$z_1^1 = \text{sign}(0.9) \max(|0.9| - 0.5, 0) = 0.4$$
   $$z_2^1 = \text{sign}(0.1) \max(|0.1| - 0.5, 0) = 0.0 \quad (\text{Derau kecil tereliminasi persis ke 0!})$$
   $$\mathbf{z}^1 = [0.4, 0.0]^T$$
3. **Subproblem-$\mathbf{x}$:**
   Menyelesaikan $(I + \rho \nabla^T \nabla) \mathbf{x}^1 = \mathbf{y} + \rho \nabla^T (\mathbf{z}^1 - \mathbf{u}^0)$.
   Perhatikan bahwa:
   $$\nabla^T \nabla = \begin{bmatrix} 1 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$
   $$I + \nabla^T \nabla = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 3 & -1 \\ 0 & -1 & 2 \end{bmatrix}$$
   $$\nabla^T (\mathbf{z}^1 - \mathbf{u}^0) = \begin{bmatrix} -1 & 0 \\ 1 & -1 \\ 0 & 1 \end{bmatrix} \begin{bmatrix} 0.4 \\ 0.0 \end{bmatrix} = \begin{bmatrix} -0.4 \\ 0.4 \\ 0.0 \end{bmatrix}$$
   Sisi kanan:
   $$\mathbf{b} = [1.0 - 0.4, 1.9 + 0.4, 2.0 + 0.0]^T = [0.6, 2.3, 2.0]^T$$
   Menyelesaikan sistem linier:
   $$\mathbf{x}^1 = [0.975, 1.350, 1.675]^T$$
4. **Pembaruan Dual $\mathbf{u}$:**
   $$\nabla \mathbf{x}^1 = [1.350 - 0.975, 1.675 - 1.350]^T = [0.375, 0.325]^T$$
   $$\mathbf{u}^1 = \mathbf{u}^0 + \nabla \mathbf{x}^1 - \mathbf{z}^1 = [0 + 0.375 - 0.4, 0 + 0.325 - 0.0]^T = [-0.025, 0.325]^T$$

Perhatikan bagaimana $z_2^1$ disusutkan tepat menjadi $0.0$, secara efektif meredam fluktuasi derau acak antara elemen ke-2 dan ke-3 seraya mempertahankan transisi step $z_1^1 = 0.4$.

---

## 4. Protokol Eksperimen Terpandu 12-Langkah

Untuk memverifikasi sifat-sifat matematis inversi variasi dan pelestarian tepi secara empiris:

1. **Inisialisasi Citra Sintetis Bersih ($x$):** Bangkitkan citra bimodal $64 \times 64$ piksel dengan intensitas $0.85$ (latar depan) dan $0.45$ (objek kotak), serta hitung Total Variation awal $\|\mathbf{x}\|_{\text{TV}}$.
2. **Karakterisasi Operator Degradasi Blur ($A$):** Buat PSF Gaussian $3 \times 3$ terskala sum-to-one, lalu pad dan roll ke titik asal $(0, 0)$ untuk menghasilkan Optical Transfer Function (OTF) fase nol.
3. **Simulasi Derau Gauss Putih:** Tambahkan derau $\mathbf{n} \sim \mathcal{N}(0, \sigma^2)$ dengan variansi $\sigma = 0.05$ hingga $0.15$ pada citra terdegradasi $\mathbf{y}$.
4. **Evaluasi Kerusakan Naive:** Hitung metrik awal PSNR dan SSIM dari pengamatan $\mathbf{y}$. Catat ledakan nilai Total Variation $\|\mathbf{y}\|_{\text{TV}}$ akibat derau frekuensi tinggi.
5. **Implementasi Operator Diferensial Frekuensi:** Bangkitkan matriks filter beda berhingga $D_x$ dan $D_y$ dengan pemosisian periodik yang tepat pada $(0, 0)$ dan $(-1, 0)$ dalam kisi $64 \times 64$.
6. **Eksekusi Baseline Regularisasi Tikhonov:** Jalankan rekonstruksi Tikhonov $(A^T A + \lambda \nabla^T \nabla)^{-1} A^T \mathbf{y}$ dengan menyapu $\lambda \in [0.01, 1.0]$. Amati keburaman tepi transisi.
7. **Eksekusi ADMM Rudin-Osher-Fatemi:** Jalankan pemecah ADMM TV dengan $\lambda = 0.015, \rho = 0.15$ selama 35 iterasi.
8. **Logging Residu Numerik:** Rekam nilai residu primer $\|r^k\|_F$ dan residu ganda $\|s^k\|_F$ pada setiap langkah pembaruan iterasi.
9. **Verifikasi Monotonisitas Residu:** Pastikan bahwa residu primer $\|r^k\|_F$ meluruh secara signifikan dari iterasi pertama ke iterasi akhir ($\|r^{35}\|_F < 0.1 \cdot \|r^0\|_F$).
10. **Komputasi Penguatan Metrik Kualitas:** Hitung $\Delta\text{PSNR} = \text{PSNR}(\hat{\mathbf{x}}) - \text{PSNR}(\mathbf{y})$ dan $\Delta\text{SSIM} = \text{SSIM}(\hat{\mathbf{x}}) - \text{SSIM}(\mathbf{y})$. Pastikan $\Delta\text{PSNR} > +5.0\text{ dB}$.
11. **Analisis Profil Penampang Melintang (Cross-Section Profile):** Plot profil intensitas horizontal pada baris $y = 32$. Buktikan bahwa ADMM TV mempertahankan kecuraman step discontinuity sedangkan Tikhonov menghasilkan transisi landai berbentuk kurva sigmoid.
12. **Uji Ketahanan Terhadap Variasi Parameter:** Variasikan $\rho \in [0.05, 1.0]$. Buktikan bahwa nilai $\rho$ mempengaruhi laju konvergensi per iterasi namun tidak mengubah titik minimum global teoritis fungsi tujuan.

---

## 5. Hubungan dengan Roadmap Riset ISVWS 2026–2040

Topik dalam Modul ADV-02 menjadi pilar konseptual langsung untuk jalur riset pascasarjana berikut:

- **Track R03 (Computational Imaging & Inverse Problems):** Mengembangkan rekonstruksi fasa kuantitatif (*Quantitative Phase Imaging*), tomografi difraksi optik, dan pencitraan non-line-of-sight (NLOS) berbasis sensor SPAD.
- **Track R01 (Robust Sensing):** Algoritma pemisahan derau dan restorasi citra inframerah termal serta polarimetri di lingkungan industri ekstrem.
- **Track R02 (Adverse Conditions):** Formulasi de-hazing fisik Koschmieder dan restorasi citra bawah air (*underwater imaging*) sebagai masalah inversi transmisi optik teratur.

