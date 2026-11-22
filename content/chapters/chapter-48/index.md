# Chapter 48 — 3D Vision & Scene Reconstruction

## 1. Konsep & Motivasi Akademik
Sebagian besar sistem Computer Vision beroperasi pada proyeksi citra 2D yang kehilangan informasi kedalaman (*depth*). **3D Vision & Scene Reconstruction** bertujuan membalikkan proses proyeksi perspektif tersebut untuk merekonstruksi struktur geometri tiga dimensi dunia nyata beserta pose posisi kamera pengamat (*camera poses*). Kemampuan ini merupakan pilar utama bagi robotika otonom, sistem navigasi pesawat tanpa awak (UAV/drone), kendaraan cerdas (*autonomous vehicles*), pemetaan kota (*urban mapping*), dan teknologi spasial realitas tertambah (*Augmented Reality - AR*).

Secara tradisional, alur kerja rekonstruksi multi-pandang berbasis pada paradigma **Structure from Motion (SfM)** dan **Multi-View Stereo (MVS)**:
1. **Structure from Motion (SfM)**: Menyelesaikan estimasi gerak kamera dan struktur titik 3D secara simultan dari kumpulan foto tak terkalibrasi yang diambil dari sudut pandang acak.
2. **Multi-View Stereo (MVS)**: Mengambil pose kamera terkalibrasi dari SfM dan melakukan pencocokan piksel padat (*dense matching*) di sepanjang garis epipolar untuk menghasilkan awan titik rapat (*dense point cloud*) dan jaring poligon (*textured 3D mesh*).
3. **Neural Scene Representations (NeRF & 3D Gaussian Splatting)**: Evolusi modern yang merepresentasikan pemandangan 3D secara kontinu sebagai bidang radiansi syaraf (*neural radiance fields*) atau kumpulan elipsoid Gaussian eksplisit, memungkinkan sintesis sudut pandang baru (*novel view synthesis*) beresolusi fotorealistik.

```
+-------------------------------------------------------------------------+
| Pipeline Rekonstruksi 3D: Structure from Motion (SfM) Menuju MVS        |
|                                                                         |
| [Koleksi Foto 2D] -> [Feature Matching SIFT/ORB] -> [Epipolar Geometry] |
|                                                                         |
| -> [Inisialisasi 2-View (Essential E / Triangulasi)]                    |
| -> [PnP Rekursif untuk Foto Tambahan] -> [Global Bundle Adjustment]     |
|                                                                         |
| -> [Sparse Point Cloud & Poses] -> [Multi-View Stereo (Dense Mesh)]     |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Matriks Proyeksi Kamera Pinhole Penuh
Titik dalam ruang 3D dunia nyata $\mathbf{X}_w = [X_w, Y_w, Z_w, 1]^T$ diproyeksikan ke bidang citra 2D $\mathbf{x} = [u, v, 1]^T$ melalui matriks proyeksi kamera $\mathbf{P} \in \mathbb{R}^{3 \times 4}$:

$$\lambda \begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = \mathbf{P} \mathbf{X}_w = \mathbf{K} [\mathbf{R} \mid \mathbf{t}] \begin{bmatrix} X_w \\ Y_w \\ Z_w \\ 1 \end{bmatrix}$$

di mana:
- $\mathbf{K} \in \mathbb{R}^{3 \times 3}$ adalah matriks parameter intrinsik kamera (panjang fokus $f_x, f_y$ dan titik utama $c_x, c_y$).
- $\mathbf{R} \in \text{SO}(3)$ adalah matriks rotasi ortogonal $3 \times 3$ dan $\mathbf{t} \in \mathbb{R}^3$ adalah vektor translasi ekstrinsik.
- $\lambda = Z_c$ adalah skala kedalaman kamera (*camera depth*).

### 2.2 Triangulasi Titik 3D (Linear Triangulation via DLT)
Diberikan korespondensi titik citra pada dua kamera berbeda $\mathbf{x}_1 = [u_1, v_1, 1]^T$ dengan matriks proyeksi $\mathbf{P}_1$, dan $\mathbf{x}_2 = [u_2, v_2, 1]^T$ dengan matriks proyeksi $\mathbf{P}_2$. Berdasarkan sifat cross product geometris, sinar proyeksi memenuhi $\mathbf{x} \times (\mathbf{P} \mathbf{X}) = \mathbf{0}$.

Untuk setiap kamera, relasi ini menghasilkan 2 persamaan linier independen terhadap koordinat titik 3D $\mathbf{X} = [X, Y, Z, 1]^T$:

$$\begin{bmatrix}
u_1 \mathbf{p}_1^{3T} - \mathbf{p}_1^{1T} \\
v_1 \mathbf{p}_1^{3T} - \mathbf{p}_1^{2T} \\
u_2 \mathbf{p}_2^{3T} - \mathbf{p}_2^{1T} \\
v_2 \mathbf{p}_2^{3T} - \mathbf{p}_2^{2T}
\end{bmatrix} \mathbf{X} = \mathbf{A} \mathbf{X} = \mathbf{0}$$

di mana $\mathbf{p}_i^{jT}$ adalah baris ke-$j$ dari matriks proyeksi $\mathbf{P}_i$. Sistem linier $\mathbf{A} \mathbf{X} = \mathbf{0}$ dipecahkan secara optimal menggunakan Singular Value Decomposition (SVD): $\mathbf{X}$ adalah kolom terakhir dari matriks $\mathbf{V}$ (vektor singular dengan nilai singular terkecil).

### 2.3 Optimalisasi Non-Linier: Bundle Adjustment (BA)
Akibat noise pengamatan piksel dan ketidaksempurnaan fitur, solusi triangulasi DLT linier selalu memuat eror geometri. **Bundle Adjustment** melakukan penyesuaian optimal bersama (*joint non-linear optimization*) terhadap seluruh posisi titik 3D $\mathbf{X}_j$ dan parameter kamera $\mathbf{C}_i = (\mathbf{R}_i, \mathbf{t}_i)$ dengan meminimalkan total eror reproyeksi kuadrat:

$$\min_{\{\mathbf{C}_i\}, \{\mathbf{X}_j\}} \sum_{i=1}^M \sum_{j=1}^N \gamma_{ij} \left\| \mathbf{x}_{ij} - \pi(\mathbf{C}_i, \mathbf{X}_j) \right\|^2$$

di mana:
- $\mathbf{x}_{ij}$ adalah koordinat piksel 2D aktual dari titik ke-$j$ yang teramati pada kamera ke-$i$.
- $\pi(\mathbf{C}_i, \mathbf{X}_j)$ adalah fungsi proyeksi non-linier titik 3D ke bidang citra kamera ke-$i$.
- $\gamma_{ij} \in \{0, 1\}$ adalah indikator visibilitas.
- Masalah ini dipecahkan menggunakan algoritma **Levenberg-Marquardt (LM)** dengan memanfaatkan struktur jarang (*sparse Schur complement*) dari matriks Hessian.

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita selesaikan secara analitik triangulasi posisi 3D dari dua kamera ortogonal sederhana:

### Data Kamera & Pengamatan:
- Panjang fokus sama: $f_x = f_y = 1000$ piksel, titik pusat: $c_x = c_y = 0$.
- **Kamera 1** berada di titik pusat asal dunia:
  $$\mathbf{P}_1 = \begin{bmatrix} 1000 & 0 & 0 & 0 \\ 0 & 1000 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$
- **Kamera 2** digeser secara horizontal sejauh $b = 2.0$ meter ke kanan:
  $$\mathbf{P}_2 = \begin{bmatrix} 1000 & 0 & 0 & -2000 \\ 0 & 1000 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$
- Titik 3D tak dikenal $\mathbf{X} = [X, Y, Z]^T$ diamati pada:
  - Kamera 1: $\mathbf{x}_1 = (u_1, v_1) = (200.0, 100.0)$
  - Kamera 2: $\mathbf{x}_2 = (u_2, v_2) = (-200.0, 100.0)$

### Langkah 1: Hubungkan Proyeksi Kamera 1
Berdasarkan kamera pinhole standar:
$$u_1 = f \frac{X}{Z} \implies 200.0 = 1000 \frac{X}{Z} \implies X = 0.20 \cdot Z$$
$$v_1 = f \frac{Y}{Z} \implies 100.0 = 1000 \frac{Y}{Z} \implies Y = 0.10 \cdot Z$$

### Langkah 2: Hubungkan Proyeksi Kamera 2
Untuk kamera 2 dengan pergeseran basis:
$$u_2 = f \frac{X - b}{Z} \implies -200.0 = 1000 \frac{X - 2.0}{Z}$$
$$-200.0 \cdot Z = 1000 \cdot X - 2000.0$$

### Langkah 3: Substitusikan $X = 0.20 \cdot Z$
$$-200.0 \cdot Z = 1000 (0.20 \cdot Z) - 2000.0$$
$$-200.0 \cdot Z = 200.0 \cdot Z - 2000.0$$
$$-400.0 \cdot Z = -2000.0$$
$$Z = \frac{-2000.0}{-400.0} = 5.0 \text{ meter}$$

### Langkah 4: Hitung Koordinat $X$ dan $Y$
$$X = 0.20 \times 5.0 = 1.0 \text{ meter}$$
$$Y = 0.10 \times 5.0 = 0.5 \text{ meter}$$

Koordinat 3D titik dalam ruang dunia adalah $\mathbf{X} = [1.0, 0.5, 5.0]^T$ meter.

### Langkah 5: Verifikasi Eror Reproyeksi
- Proyeksi ke Kamera 1:
  $$u_1^{\text{proj}} = 1000 \frac{1.0}{5.0} = 200.0, \quad v_1^{\text{proj}} = 1000 \frac{0.5}{5.0} = 100.0 \quad (\text{Eror } = 0.0)$$
- Proyeksi ke Kamera 2:
  $$u_2^{\text{proj}} = 1000 \frac{1.0 - 2.0}{5.0} = 1000 \frac{-1.0}{5.0} = -200.0, \quad v_2^{\text{proj}} = 100.0 \quad (\text{Eror } = 0.0)$$

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Ambiguitas Skala Monokular (*Scale Ambiguity*)**:
   - *Penyebab*: Rekonstruksi SfM dari kamera visual tunggal hanya dapat memulihkan geometri hingga faktor skala acak $\lambda$ (apakah ruangan berukuran 5 meter atau miniatur mainan 5 sentimeter menghasilkan proyeksi piksel identik).
   - *Solusi Teknik*: Gunakan sensor Inertial Measurement Unit (IMU/VIO), penanda fisik dengan ukuran terukur (*AprilTags/Aruco*), atau sensor LiDAR/Stereo calibrated.

2. **Titik Pengamatan Garis Lurus Sempit (*Baseline Degeneracy*)**:
   - *Penyebab*: Jika dua kamera berada terlalu dekat ($b \approx 0$) atau kamera hanya melakukan rotasi murni di tempat tanpa translasi, sinar proyeksi hampir sejajar sehingga triangulasi menghasilkan eror kedalaman tak terhingga ($\Delta Z \to \infty$).
   - *Solusi Teknik*: Pastikan baseline pergeseran kamera memadai, atau estimasi homografi planar saat translasi nol.

3. **Area Tekstur Polos & Permukaan Reflektif**:
   - *Penyebab*: Dinding putih polos, kaca cermin, atau permukaan logam berkilau tidak memiliki fitur gradien SIFT/ORB yang konsisten.
   - *Solusi Teknik*: Integrasikan struktur syaraf kontinu (NeRF / 3D Gaussian Splatting) atau proyeksi pola cahaya terstruktur (*structured light*).

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `ThreeDReconstructionExplorer.tsx` memvisualisasikan posisi kamera multi-pandang 3D, sinar proyeksi geometri, titik hasil triangulasi, dan analisis sensitivitas eror reproyeksi secara interaktif di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi sistem persamaan DLT linier, triangulasi SVD, dan evaluasi eror reproyeksi secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & OpenCV SfM)**: Berkas `notebooks/chapter-48-lab.ipynb` mengimplementasikan pipeline rekonstruksi multi-pandang lengkap mulai dari estimasi matriks esensial $\mathbf{E}$ hingga pembuatan sparse point cloud.

### 5.2 Panduan Eksekusi Notebook (`chapter-48-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 3 mengonstruksi matriks proyeksi kamera $\mathbf{P}_1, \mathbf{P}_2$ dan menyelesaikan triangulasi analitis DLT.
3. Sel 4 mengevaluasi sensitivitas eror reproyeksi terhadap pertambahan noise piksel gaussian pada bidang sensor.
4. Sel 5 mendokumentasikan prosedur bundle adjustment non-linier menggunakan fungsi optimasi kuadrat terkecil.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Pasangan titik korespondensi piksel 2D $(u, v)$ pada dua sudut pandang citra kamera terkalibrasi intrinsik $\mathbf{K}$.
- **Proses Transformasi**:
  1. Pembentukan Matriks Linier $\mathbf{A}_{4 \times 4}$ dari persamaan cross-product proyeksi DLT.
  2. Singular Value Decomposition: $\mathbf{A} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$.
  3. Ekstraksi Vektor Singular Terkecil $\mathbf{V}[:, 3]$ dan konversi ke koordinat kartesius non-homogen $[X/W, Y/W, Z/W]^T$.
- **Output & Evaluasi**: Koordinat titik 3D dalam satuan meter $(X, Y, Z)$ dan rata-rata Root Mean Square Error (RMSE) reproyeksi piksel.

---

## 6. Diagram Arsitektur Sistem

![Alur Rekonstruksi 3D: Structure from Motion (SfM)](/media/diagrams/chapter-48-structure-from-motion-pipeline.svg)

![Geometri Triangulasi Titik 3D Multi-Kamera](/media/diagrams/chapter-48-multiview-triangulation-geometry.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Rekonstruksi pemandangan 3D menjembatani pengamatan citra 2D menuju model spasial dunia nyata yang dapat diukur secara metrik. Melalui fondasi geometri multi-pandang (Epipolar Geometry, DLT, dan Bundle Adjustment), sistem mampu mengekstraksi struktur objek dan pose kamera secara simultan. Memahami batas ketidakpastian kedalaman dan degradasi geometri sudut pandang sempit adalah fondasi mutlak bagi perancangan sistem navigasi otonom dan pemetaan fotogrametri modern.
