# MODUL ADV-05: GEOMETRI MULTI-PANDANG & REKONSTRUKSI 3D COMPUTER VISION
## Epipolar Geometry, Essential Matrix Decomposition, DLT Triangulation, and Bundle Adjustment

**Kode Modul:** `ADV-05`  
**Level Akademik:** L3 — Advanced Curriculum  
**Pilar Riset:** Pillar 1 — Intelligent Computer Vision (Roadmap ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 14 Jam (Teori, Penurunan Analitis, dan Eksperimen Komputasi)  
**Prasyarat Kurikulum Inti:** Bab 18 (Geometri Citra & Transformasi Proyektif), Bab 19 (Kalibrasi Kamera & Estimasi Distorsi), Bab 20 (Stereo Vision & Estimasi Kedalaman), Bab 21 (Deteksi Fitur & Titik Kunci), Bab 23 (Transformasi Perspektif & RANSAC), dan Modul ADV-01 (Fondasi Matematika & SVD)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Sebagian besar aplikasi praktis Computer Vision kontemporer—mulai dari mobil otonom (*autonomous vehicles*), navigasi wahana udara tanpa awak (*UAV visual odometry*), pemetaan spasial fotogrametri (*aerial surveying*), hingga robotika bedah mikro—bergantung mutlak pada kemampuan mengekstrak informasi geometri 3D metrik dari kumpulan citra 2D yang ditangkap dari berbagai sudut pandang (*Multi-View Geometry*).

Modul ADV-05 memfasilitasi pendalaman konseptual dan matematis dari sekadar pemrosesan piksel dua dimensi menuju:
1. **Representasi Proyektif $\mathbb{P}^3 \to \mathbb{P}^2$:** Memahami pembentukan citra perspektif melalui model kamera lubang jarum (*pinhole camera model*), dekomposisi matriks intrinsik $K$, dan pose kaku ekstrinsik $[R \mid \mathbf{t}] \in \text{SE}(3)$.
2. **Geometri Epipolar Dua Pandang:** Menurunkan relasi aljabar bilinear $\tilde{\mathbf{x}}_2^T F \tilde{\mathbf{x}}_1 = 0$, memahami peran fisik epipole dan garis epipolar, serta membuktikan bahwa matriks Fundamental $F$ harus berperingkat tepat $\text{rank}(F) = 2$ ($\det(F) = 0$).
3. **Dekomposisi Matriks Esensial & Uji Cheirality:** Mengekstraksi pose relatif kamera kedua $[R \mid \mathbf{t}]$ dari Essential Matrix $E = [\mathbf{t}]_\times R$ dan membuktikan keunikan fisik pose melalui uji kedalaman positif (*cheirality condition*).
4. **Algoritma 8-Titik Ternormalisasi (Hartley 1997):** Menjelaskan kegagalan numerik algoritma 8-titik standar dan bagaimana prakondisi normalisasi koordinat memulihkan kestabilan spektral SVD.
5. **Triangulasi Linear (DLT) & Bundle Adjustment:** Memformulasikan rekonstruksi koordinat 3D melalui *Direct Linear Transformation* (DLT) dan menyempurnakannya menggunakan optimasi kuadrat terkecil non-linear *Bundle Adjustment* (Levenberg-Marquardt) dengan penanganan ambiguitas pengukur (*gauge freedom*).

> [!IMPORTANT]
> **Batasan Kurikulum Khusus:** Modul ADV-05 secara eksklusif mendalami Geometri Multi-Pandang dan Rekonstruksi 3D berbasis geometri proyektif metrik (*Multiple View Geometry* / Hartley & Zisserman). Modul ini **bukan** modul model generatif (seperti VAE, GAN, atau Diffusion Models) yang berada pada domain terpisah.

---

## 2. Penurunan Matematis & Struktur Materi

### 2.1 Model Kamera Lubang Jarum (Pinhole) & Matriks Proyeksi

Dalam geometri proyektif, titik dunia 3D dinyatakan dalam koordinat homogen $\tilde{\mathbf{X}} = [X, Y, Z, 1]^T \in \mathbb{P}^3$. Proyeksi titik tersebut ke bidang sensor kamera 2D dalam koordinat piksel homogen $\tilde{\mathbf{x}} = [u, v, 1]^T \in \mathbb{P}^2$ dinyatakan oleh pemetaan linier proyektif:
$$s \tilde{\mathbf{x}} = P \tilde{\mathbf{X}} = K [R \mid \mathbf{t}] \tilde{\mathbf{X}}$$
di mana $s \in \mathbb{R}^+$ adalah faktor skala proyektif yang merepresentasikan kedalaman titik dalam koordinat kamera ($s = Z_c$).

#### 1. Matriks Kalibrasi Intrinsik ($K \in \mathbb{R}^{3 \times 3}$)
Matriks segitiga atas yang memetakan sinar koordinat kamera kanonik $\mathbf{x}_c = [x_c, y_c, z_c]^T$ ke bidang kisi piksel sensor:
$$K = \begin{bmatrix} f_x & s & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}$$
di mana $f_x = f \cdot m_x$ dan $f_y = f \cdot m_y$ adalah panjang fokal terukur dalam satuan piksel, $(c_x, c_y)$ adalah titik utama (*principal point*), dan $s$ adalah faktor distorsi miring (*skew coefficient*, bernilai 0 pada sensor modern orthogonal).

#### 2. Transformasi Ekstrinsik Pose ($[R \mid \mathbf{t}] \in \text{SE}(3)$)
Mentransformasikan titik dari kerangka koordinat dunia ke kerangka kamera:
$$\mathbf{X}_c = R (\mathbf{X}_w - \mathbf{C}) = R \mathbf{X}_w + \mathbf{t}$$
di mana $R \in \text{SO}(3)$ adalah matriks rotasi ($R^T R = I, \det(R) = +1$), $\mathbf{C} \in \mathbb{R}^3$ adalah posisi pusat optik kamera dalam koordinat dunia, dan $\mathbf{t} = -R \mathbf{C}$ adalah vektor translasi.

---

### 2.2 Geometri Epipolar Dua Pandang & Matriks Fundamental $F$

Tinjau dua kamera dengan pusat proyeksi $\mathbf{C}_1$ dan $\mathbf{C}_2$. Titik 3D $\mathbf{X}$ bersama kedua pusat kamera mendefinisikan sebuah bidang fisis di ruang 3D yang disebut **Bidang Epipolar** (*Epipolar Plane* $\pi$).

#### Elemen-Elemen Geometri Epipolar:
1. **Epipole ($\mathbf{e}_1, \mathbf{e}_2$):** Titik potong garis dasar (*baseline* $\mathbf{C}_1\mathbf{C}_2$) dengan bidang sensor masing-masing kamera. $\mathbf{e}_2$ adalah citra dari pusat kamera 1 yang dilihat oleh kamera 2.
2. **Garis Epipolar ($\mathbf{l}_1, \mathbf{l}_2$):** Garis perpotongan bidang epipolar $\pi$ dengan bidang sensor. Seluruh sinar proyeksi dari kamera 1 terproyeksikan menjadi garis lurus $\mathbf{l}_2$ pada kamera 2.
3. **Keuntungan Komputasi:** Mengetahui geometri epipolar mereduksi ruang pencarian korespondensi titik dari pencarian area 2D ($\mathcal{O}(W \times H)$) menjadi pencarian garis 1D ($\mathcal{O}(W)$).

#### Penurunan Kendala Epipolar Bilinear
Nyatakan koordinat titik pada kamera 1 dan kamera 2 dalam koordinat ternormalisasi:
$$\mathbf{x}_{c1} = K_1^{-1} \tilde{\mathbf{x}}_1, \quad \mathbf{x}_{c2} = K_2^{-1} \tilde{\mathbf{x}}_2$$
Hubungan posisi fisik antara kedua kamera:
$$Z_2 \mathbf{x}_{c2} = R (Z_1 \mathbf{x}_{c1}) + \mathbf{t}$$
Lakukan perkalian silang matriks simetri-miring $[\mathbf{t}]_\times$ terhadap kedua sisi:
$$Z_2 [\mathbf{t}]_\times \mathbf{x}_{c2} = Z_1 [\mathbf{t}]_\times R \mathbf{x}_{c1} + [\mathbf{t}]_\times \mathbf{t}$$
Karena perkalian silang suatu vektor dengan dirinya sendiri selalu menghasilkan vektor nol ($[\mathbf{t}]_\times \mathbf{t} = \mathbf{0}$):
$$Z_2 [\mathbf{t}]_\times \mathbf{x}_{c2} = Z_1 [\mathbf{t}]_\times R \mathbf{x}_{c1}$$
Kalikan skalar dari kiri dengan $\mathbf{x}_{c2}^T$:
$$Z_2 \mathbf{x}_{c2}^T [\mathbf{t}]_\times \mathbf{x}_{c2} = Z_1 \mathbf{x}_{c2}^T ([\mathbf{t}]_\times R) \mathbf{x}_{c1}$$
Karena $[\mathbf{t}]_\times$ adalah matriks simetri-miring ($A = -A^T$), maka $\mathbf{v}^T [\mathbf{t}]_\times \mathbf{v} = 0$ secara identik untuk setiap vektor $\mathbf{v}$. Akibatnya, ruas kiri menjadi nol:
$$\mathbf{x}_{c2}^T ([\mathbf{t}]_\times R) \mathbf{x}_{c1} = 0$$

Definisikan **Matriks Esensial (Essential Matrix)**:
$$E = [\mathbf{t}]_\times R \in \mathbb{R}^{3 \times 3} \implies \mathbf{x}_{c2}^T E \mathbf{x}_{c1} = 0$$

Substitusikan kembali koordinat piksel $\mathbf{x}_{c1} = K_1^{-1} \tilde{\mathbf{x}}_1$ dan $\mathbf{x}_{c2} = K_2^{-1} \tilde{\mathbf{x}}_2$:
$$(K_2^{-1} \tilde{\mathbf{x}}_2)^T E (K_1^{-1} \tilde{\mathbf{x}}_1) = 0 \implies \tilde{\mathbf{x}}_2^T (K_2^{-T} E K_1^{-1}) \tilde{\mathbf{x}}_1 = 0$$

Definisikan **Matriks Fundamental (Fundamental Matrix)**:
$$F = K_2^{-T} E K_1^{-1} = K_2^{-T} [\mathbf{t}]_\times R K_1^{-1} \in \mathbb{R}^{3 \times 3}$$
Sehingga diperoleh persamaan kendala epipolar bilinear fundamental:
$$\tilde{\mathbf{x}}_2^T F \tilde{\mathbf{x}}_1 = 0$$

#### Sifat-Sifat Aljabar Matriks Fundamental:
1. Garis epipolar kamera 2 yang bersesuaian dengan titik $\tilde{\mathbf{x}}_1$ adalah $\mathbf{l}_2 = F \tilde{\mathbf{x}}_1$. Titik $\tilde{\mathbf{x}}_2$ wajib terletak pada garis ini ($\tilde{\mathbf{x}}_2^T \mathbf{l}_2 = 0$).
2. Garis epipolar kamera 1 yang bersesuaian dengan titik $\tilde{\mathbf{x}}_2$ adalah $\mathbf{l}_1 = F^T \tilde{\mathbf{x}}_2$.
3. **Kendala Singularitas Peringkat:** Seluruh garis epipolar $\mathbf{l}_2$ berpotongan di epipole $\mathbf{e}_2$. Artinya $\mathbf{e}_2^T (F \tilde{\mathbf{x}}_1) = 0$ untuk setiap $\tilde{\mathbf{x}}_1$, yang berarti $\mathbf{e}_2^T F = \mathbf{0}^T$ dan $F \mathbf{e}_1 = \mathbf{0}$. Matriks $F$ memiliki ruang nol berdimensi 1, sehingga:
   $$\text{rank}(F) = 2 \quad \text{dan} \quad \det(F) = 0$$

---

### 2.3 Dekomposisi Matriks Esensial & Uji Cheirality

Untuk kamera terkalibrasi, matriks esensial $E$ memiliki dua nilai singular bernilai sama dan satu bernilai nol: $\Sigma_E = \text{diag}(\sigma, \sigma, 0)$.

Melalui SVD $E = U \text{diag}(1, 1, 0) V^T$ dengan $\det(U) > 0$ dan $\det(V) > 0$, rotasi ortogonal $W$ didefinisikan sebagai:
$$W = \begin{bmatrix} 0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{bmatrix}, \quad W^T = \begin{bmatrix} 0 & 1 & 0 \\ -1 & 0 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

Terdapat 4 pasangan kandidat pose relatif $[R \mid \mathbf{t}]$:
1. $R_1 = U W V^T, \quad \mathbf{t}_1 = +u_3$ (kolom ketiga matriks $U$)
2. $R_1 = U W V^T, \quad \mathbf{t}_2 = -u_3$
3. $R_2 = U W^T V^T, \quad \mathbf{t}_1 = +u_3$
4. $R_2 = U W^T V^T, \quad \mathbf{t}_2 = -u_3$

#### Uji Cheirality (Positive Depth Test)
Dari 4 kandidat pose di atas, kita melakukan triangulasi satu titik korespondensi uji $(\tilde{\mathbf{x}}_1, \tilde{\mathbf{x}}_2)$ untuk setiap konfigurasi kamera. Kedalaman titik 3D terhadap kedua kamera harus memenuhi:
$$Z_1 = \mathbf{X}_3 > 0 \quad \text{dan} \quad Z_2 = (R \mathbf{X} + \mathbf{t})_3 > 0$$
Tepat satu dari empat pasangan pose yang memenuhi kedua pertidaksamaan ini secara simultan. Pasangan inilah yang merepresentasikan pose fisik nyata kamera.

---

### 2.4 Algoritma 8-Titik Ternormalisasi (Hartley 1997) & Triangulasi DLT

Setiap pasangan titik korespondensi $(u_1, v_1) \leftrightarrow (u_2, v_2)$ memberikan satu persamaan linier skalar:
$$u_2 u_1 F_{11} + u_2 v_1 F_{12} + u_2 F_{13} + v_2 u_1 F_{21} + v_2 v_1 F_{22} + v_2 F_{23} + u_1 F_{31} + v_1 F_{32} + F_{33} = 0$$
Diberikan $N \ge 8$ pasangan titik, dibentuk sistem persamaan homogen $A \mathbf{f} = \mathbf{0}$, di mana $A \in \mathbb{R}^{N \times 9}$ dan $\mathbf{f} \in \mathbb{R}^9$ adalah vektor leksikografis dari entri $F$.

#### Mengapa Algoritma 8-Titik Standar Gagal Secara Numerik?
Pada citra resolusi tinggi, koordinat piksel bernilai ratusan atau ribuan ($u \approx 1000$). Baris dari matriks $A$ memiliki entri dengan rentang magnitudo ekstrem:
$$[u_2 u_1, \dots, 1] \approx [10^6, 10^6, 10^3, 10^6, 10^6, 10^3, 10^3, 10^3, 1]$$
Rasio antara entri terbesar ($10^6$) dan terkecil ($1$) adalah $10^6$. Ini menghasilkan matriks dengan angka kondisi numerik yang sangat buruk ($\kappa(A) \approx 10^{12}$), sehingga sedikit saja derau sensor pada deteksi titik kunci akan memicu galat estimasi $F$ yang sangat liar.

#### Prosedur Normalisasi Hartley
Richard Hartley (1997) merevolusi kestabilan algoritma 8-titik melalui langkah normalisasi sederhana namun sangat mendasar:
1. **Translasi Centroid ke Origin:** Titik-titik ditranslasikan sehingga titik pusat massa $(\bar{u}, \bar{v}) = (0, 0)$.
2. **Skalasi Isotropik:** Titik diskalakan sehingga jarak rata-rata ke origin adalah $\sqrt{2}$:
   $$T = \begin{bmatrix} s & 0 & -s \bar{u} \\ 0 & s & -s \bar{v} \\ 0 & 0 & 1 \end{bmatrix}, \quad s = \frac{\sqrt{2}}{\frac{1}{N} \sum_{i=1}^N \sqrt{(u_i - \bar{u})^2 + (v_i - \bar{v})^2}}$$
3. **Penyelesaian SVD:** Selesaikan $A_{\text{norm}} \mathbf{f} = \mathbf{0}$ via SVD. Vektor $\mathbf{f}$ adalah kolom terakhir matriks $V$. Bentuk matriks $\hat{F}$.
4. **Penegakan Kendala Peringkat 2:** Hitung SVD $\hat{F} = U_F \text{diag}(\sigma_1, \sigma_2, \sigma_3) V_F^T$. Nolkan nilai singular terkecil:
   $$F_{\text{rank2}} = U_F \begin{bmatrix} \sigma_1 & 0 & 0 \\ 0 & \sigma_2 & 0 \\ 0 & 0 & 0 \end{bmatrix} V_F^T$$
5. **Denormalisasi:** Matriks Fundamental dalam koordinat piksel asli dihitung melalui:
   $$F = T_2^T F_{\text{rank2}} T_1$$

#### Triangulasi Linear (DLT)
Diberikan matriks proyeksi $P_1, P_2$ dan pengukuran piksel $\tilde{\mathbf{x}}_1, \tilde{\mathbf{x}}_2$, hubungan proyeksi perspektif $\tilde{\mathbf{x}} \times (P \tilde{\mathbf{X}}) = \mathbf{0}$ menghasilkan matriks kendala linier $4 \times 4$:
$$A_{\text{tri}} = \begin{bmatrix} u_1 \mathbf{p}_1^{3T} - \mathbf{p}_1^{1T} \\ v_1 \mathbf{p}_1^{3T} - \mathbf{p}_1^{2T} \\ u_2 \mathbf{p}_2^{3T} - \mathbf{p}_2^{1T} \\ v_2 \mathbf{p}_2^{3T} - \mathbf{p}_2^{2T} \end{bmatrix} \in \mathbb{R}^{4 \times 4}$$
Koordinat homogen $\tilde{\mathbf{X}}$ diestimasi sebagai vektor singular kanan dari nilai singular terkecil SVD($A_{\text{tri}}$).

---

### 2.5 Penyesuaian Berkas Non-linear (Bundle Adjustment) & Gauge Freedom

Triangulasi DLT dan algoritma 8-titik meminimalkan galat aljabar yang tidak memiliki makna fisik. Standar emas dalam fotogrametri dan Computer Vision untuk akurasi tertinggi adalah **Bundle Adjustment (BA)**, yang meminimalkan galat reproyeksi geometris kuadratik secara non-linear:
$$\min_{\{C_i\}, \{\mathbf{X}_j\}} \sum_{i=1}^m \sum_{j=1}^n v_{ij} \cdot \rho\left( \left\| \mathbf{x}_{ij} - \pi(C_i, \mathbf{X}_j) \right\|_2^2 \right)$$
di mana:
- $C_i = \{R_i, \mathbf{t}_i\}$ adalah parameter pose kamera ke-$i$.
- $\mathbf{X}_j \in \mathbb{R}^3$ adalah koordinat titik 3D ke-$j$.
- $\mathbf{x}_{ij}$ adalah koordinat pengukuran piksel dari titik $j$ pada kamera $i$.
- $v_{ij} \in \{0, 1\}$ adalah variabel visibilitas (1 jika titik $j$ terlihat di kamera $i$).
- $\pi(C, \mathbf{X})$ adalah fungsi proyeksi non-linear kamera.
- $\rho(\cdot)$ adalah fungsi loss robust (seperti Huber atau Cauchy loss) untuk meredam pencilan (*outliers*).

#### Struktur Matriks Hessian Jarang & Trik Komplement Schur
Karena koordinat titik 3D tidak saling bergantung satu sama lain secara langsung (hanya berinteraksi melalui observasi pose kamera), matriks Hessian $H = J^T J$ memiliki struktur blok panah (*arrowhead block structure*):
$$H = \begin{bmatrix} B & E \\ E^T & C \end{bmatrix}$$
di mana $B$ adalah blok diagonal-blok dari parameter kamera, dan $C$ adalah blok diagonal-blok dari parameter titik 3D.
Melalui **Trik Komplement Schur** (*Schur Complement*), variabel titik 3D dapat dieliminasi secara analitis:
$$(B - E C^{-1} E^T) \Delta \mathbf{x}_{\text{cam}} = \mathbf{g}_{\text{cam}} - E C^{-1} \mathbf{g}_{\text{pts}}$$
Karena $C$ adalah matriks diagonal blok berukuran $3 \times 3$, inversi $C^{-1}$ bersifat trivial dan instan. Setelah $\Delta \mathbf{x}_{\text{cam}}$ diperoleh, $\Delta \mathbf{X}_j$ diperbarui secara terpisah melalui substitusi balik (*back-substitution*).

#### Gauge Freedom (Ambiguitas Pengukur 7-Derajat Kebebasan)
Rekonstruksi struktur dari gerak dari citra tanpa sensor inertial (IMU) atau GPS memiliki ambiguitas kesamaan 7-DoF:
1. 3 derajat kebebasan rotasi global (orientasi semesta bebas).
2. 3 derajat kebebasan translasi global (posisi asal semesta bebas).
3. 1 derajat kebebasan skala metrik absolut (skala baseline semesta bebas).

Jika 7 parameter ini tidak dipatok, matriks Hessian $H$ memiliki ruang nol berdimensi 7 dan tidak dapat dibalik. Mematok kamera pertama pada $P_1 = K [I \mid \mathbf{0}]$ dan menetapkan norma baseline $\|\mathbf{t}_2\| = b$ mengeliminasi ambiguitas pengukur ini.

---

## 3. Contoh Perhitungan Numerik Langkah-demi-Langkah

Mari kita tinjau contoh numerik sederhana dari proyeksi dan triangulasi satu titik 3D.

Misalkan kamera memiliki kalibrasi identitas $K = I_3$, sehingga koordinat piksel sama dengan koordinat kanonik.
- **Kamera 1:** Berada di titik asal: $R_1 = I_3, \quad \mathbf{t}_1 = [0, 0, 0]^T \implies P_1 = [I \mid \mathbf{0}]$.
- **Kamera 2:** Ditranslasikan sejauh 1 meter ke kanan pada sumbu X: $R_2 = I_3, \quad \mathbf{t}_2 = [-1, 0, 0]^T \implies P_2 = [I \mid [-1, 0, 0]^T]$.

Misalkan terdapat titik 3D di koordinat:
$$\mathbf{X} = [0.5, -0.2, 4.0]^T$$

### Langkah 1: Proyeksi Titik ke Bidang Citra
1. **Pada Kamera 1:**
   $$\mathbf{X}_{c1} = [0.5, -0.2, 4.0]^T \implies u_1 = \frac{0.5}{4.0} = 0.125, \quad v_1 = \frac{-0.2}{4.0} = -0.05$$
2. **Pada Kamera 2:**
   $$\mathbf{X}_{c2} = [0.5 - 1.0, -0.2, 4.0]^T = [-0.5, -0.2, 4.0]^T \implies u_2 = \frac{-0.5}{4.0} = -0.125, \quad v_2 = \frac{-0.2}{4.0} = -0.05$$

Perhatikan bahwa $v_1 = v_2 = -0.05$ (korespondensi epipolar murni horizontal) dan disparitas horizontal adalah:
$$d = u_1 - u_2 = 0.125 - (-0.125) = 0.25$$

### Langkah 2: Evaluasi Essential Matrix
Vektor translasi $\mathbf{t} = [-1, 0, 0]^T$, matriks simetri-miringnya:
$$[\mathbf{t}]_\times = \begin{bmatrix} 0 & 0 & 0 \\ 0 & 0 & 1 \\ 0 & -1 & 0 \end{bmatrix}$$
Karena $R = I$, maka:
$$E = [\mathbf{t}]_\times R = \begin{bmatrix} 0 & 0 & 0 \\ 0 & 0 & 1 \\ 0 & -1 & 0 \end{bmatrix}$$

Uji kendala epipolar $\tilde{\mathbf{x}}_2^T E \tilde{\mathbf{x}}_1$:
$$E \tilde{\mathbf{x}}_1 = \begin{bmatrix} 0 & 0 & 0 \\ 0 & 0 & 1 \\ 0 & -1 & 0 \end{bmatrix} \begin{bmatrix} 0.125 \\ -0.05 \\ 1 \end{bmatrix} = \begin{bmatrix} 0 \\ 1 \\ 0.05 \end{bmatrix} = \mathbf{l}_2$$
Garis epipolar pada kamera 2 adalah $0 \cdot u_2 + 1 \cdot v_2 + 0.05 = 0 \implies v_2 = -0.05$.  
Evaluasi titik 2 pada garis epipolar:
$$\tilde{\mathbf{x}}_2^T \mathbf{l}_2 = [-0.125, -0.05, 1] \begin{bmatrix} 0 \\ 1 \\ 0.05 \end{bmatrix} = (-0.05)(1) + (1)(0.05) = 0.0 \quad (\text{Eksak Nol!})$$

### Langkah 3: Triangulasi DLT
Dari formula disparitas stereo:
$$Z = \frac{f \cdot b}{d} = \frac{1 \cdot 1.0}{0.25} = 4.0\text{ meter}$$
$$X = \frac{u_1 \cdot Z}{f} = 0.125 \cdot 4.0 = 0.5\text{ meter}$$
$$Y = \frac{v_1 \cdot Z}{f} = -0.05 \cdot 4.0 = -0.2\text{ meter}$$
Koordinat 3D yang direkonstruksi persis $[0.5, -0.2, 4.0]^T$, membuktikan konsistensi matematis kerangka kerja geometri proyektif.

---

## 4. Protokol Eksperimen Terpandu 12-Langkah

Untuk memverifikasi sifat-sifat multi-view geometry secara empiris:

1. **Konfigurasi Rig Dua Kamera Kalibrasi:** Tetapkan matriks intrinsik $K$ dengan panjang fokal $f = 800\text{ px}$ dan pusat $(320, 240)$. Atur Kamera 1 pada origin dan Kamera 2 dengan baseline $b = 0.6\text{ m}$ serta rotasi yaw $\theta_y = 5^\circ$.
2. **Sintesis Konstelasi Titik 3D Uji:** Bangkitkan 12 titik 3D non-koplanar (seperti 8 titik kubus dan 4 titik interior) pada kedalaman $Z \in [3.0, 5.0]\text{ meter}$.
3. **Proyeksi Perspektif ke Sensor:** Proyeksikan seluruh titik 3D ke bidang citra kedua kamera menggunakan fungsi $\pi(K, R, \mathbf{t}, \mathbf{X})$.
4. **Injeksi Derau Pengukuran Sensor:** Tambahkan derau Gauss acak dengan standar deviasi $\sigma \in [0.1, 2.0]\text{ piksel}$ pada koordinat proyeksi kamera 2 untuk merepresentasikan ketidakpastian deteksi fitur.
5. **Estimasi Matriks Fundamental Tanpa Normalisasi:** Jalankan algoritma 8-titik mentah. Catat nilai determinan $\det(F)$ dan periksa apakah garis epipolar melenceng jauh dari titik pengamatan.
6. **Eksekusi Normalisasi Koordinat Hartley:** Terapkan translasi centroid dan penskalaan isotropik $\sqrt{2}$. Bandingkan angka kondisi matriks $\kappa(A_{\text{norm}})$ versus $\kappa(A_{\text{raw}})$.
7. **Penegakan Kendala Peringkat 2:** Lakukan SVD pada estimasi $\hat{F}$, nolkan singular value terkecil $\sigma_3 = 0$, dan denormalisasi $F = T_2^T F_{\text{rank2}} T_1$. Pastikan $\det(F) < 10^{-6}$.
8. **Dekomposisi Matriks Esensial & Uji Cheirality:** Hitung $E = K^T F K$, lakukan dekomposisi 4 pose kandidat, dan verifikasi bahwa hanya 1 kandidat yang menghasilkan $Z_1 > 0$ dan $Z_2 > 0$.
9. **Eksekusi Triangulasi Linear (DLT):** Selesaikan sistem linier $A_{\text{tri}} \mathbf{X} = \mathbf{0}$ via SVD untuk seluruh 12 titik. Hitung galat jarak Euclidean 3D rata-rata $\|\hat{\mathbf{X}} - \mathbf{X}\|_2$ dalam satuan milimeter.
10. **Evaluasi Jarak Sampson Epipolar:** Hitung galat geometris orde-pertama Sampson $d_{\text{Sampson}}^2 = \frac{(\tilde{\mathbf{x}}_2^T F \tilde{\mathbf{x}}_1)^2}{(F\tilde{\mathbf{x}}_1)_1^2 + (F\tilde{\mathbf{x}}_1)_2^2 + (F^T\tilde{\mathbf{x}}_2)_1^2 + (F^T\tilde{\mathbf{x}}_2)_2^2}$. Pastikan nilai rata-rata berada pada tingkat sub-piksel ($< 0.5\text{ px}^2$).
11. **Optimasi Bundle Adjustment Non-Linear:** Jalankan algoritma Levenberg-Marquardt dengan mematok Kamera 1 pada $[I \mid \mathbf{0}]$.
12. **Verifikasi Penurunan Reprojection RMSE:** Buktikan bahwa Bundle Adjustment mereduksi galat reproyeksi global secara monoton hingga mencapai konvergensi optimal.

---

## 5. Hubungan dengan Roadmap Riset ISVWS 2026–2040

Topik dalam Modul ADV-05 menjadi landasan mutlak bagi jalur riset lanjutan:

- **Track R06 (Neural Rendering & 3D Vision):** Menghubungkan estimasi pose multi-pandang berbasis struktur dari gerak (COLMAP) dengan representasi implicit *Neural Radiance Fields* (NeRF) dan *3D Gaussian Splatting* (3DGS).
- **Track R02 (Adverse Conditions):** Visual SLAM dan rekonstruksi 3D yang tangguh terhadap gangguan pencahayaan ekstrem, kabut tebal, dan distorsi optik non-standar.
- **Track R04 (Embedded Vision Systems):** Akselerasi perangkat keras FPGA/Edge-TPU untuk komputasi DLT instan dan Bundle Adjustment lokal pada robotik mikro otonom berdaya rendah.

