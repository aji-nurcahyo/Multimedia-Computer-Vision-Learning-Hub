# Chapter 36 — Computer Vision Foundations & Image Geometry

> **Bagian Kurikulum**: Section 08 — Classical Computer Vision  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Intermediate  
> **Prasyarat**: Chapter 06 (Digital Image Fundamentals), Chapter 10 (Spatial Filtering & Convolution)  
> **Learning Tracks**: Computer Vision, Real-Time & Edge Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)  
> **Lisensi Materi**: Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Chapter Overview

Visi Komputer (*Computer Vision*) adalah disiplin rekayasa kecerdasan visual yang mentransformasikan data citra 2D mentah (*raw pixels*) menjadi pemahaman geometris, spasial, dan semantik dunia 3D. Berbeda dengan Pengolahan Citra Digital konvensional (*Digital Image Processing*) yang utamanya berfokus pada transformasi intensitas untuk konsumsi visual manusia (seperti perbaikan kontras atau penghilangan derau), Visi Komputer bertujuan memodelkan interaksi antara lingkungan fisik nyata, proyektif optik kamera, dan representasi matematis citra untuk memungkinkan mesin melakukan penalaran otonom.

Fondasi paling fundamental dalam visi komputer berpijak pada **Geometri Citra (Image Geometry)**. Setiap objek yang ditangkap kamera mengalami serangkaian transformasi proyektif ruang: dari koordinat dunia 3D (*world coordinates*), ke koordinat kamera 3D (*camera coordinates*), bidang fokal lensa, hingga diskritisasi matriks sensor piksel 2D. Dalam bab ini, kita akan mengupas tuntas sistem koordinat citra, aljabar linear koordinat homogen proyektif ($\mathbb{P}^2$), hierarki transformasi geometris 2D (translasi, rotasi, euclidean, afinitas, hingga homografi proyektif), pemetaan maju versus pemetaan mundur (*forward vs inverse mapping*), interpolasi sub-piksel bilinear, normalisasi koordinat Hartley, serta perumusan galat estimasi geometris (*reprojection error*).

---

## 2. Learning Objectives

Setelah menuntaskan bab ini, mahasiswa dan peneliti diharapkan memiliki kompetensi akademik berikut:

1. **Memahami** perbedaan mendasar antara sistem koordinat piksel diskrit $(u, v)$, sistem koordinat Cartesian berpusat optik $(x, y)$, dan sistem koordinat homogen 2D $[x, y, w]^T \in \mathbb{P}^2$.
2. **Menganalisis** hierarki transformasi geometri 2D berdasarkan derajat kebebasan (*degrees of freedom* / DoF) dan sifat invariansinya (panjang, sudut, paralelisme, rasio silang).
3. **Menurunkan** formulasi matriks transformasi afinitas $3 \times 3$ dan matriks homografi proyektif $\mathbf{H} \in \mathbb{R}^{3 \times 3}$.
4. **Membuktikan** kelemahan pemetaan maju (*forward mapping*) yang menyebabkan celah piksel kosong (*holes/gaps*), serta menurunkan formulasi pemetaan mundur (*inverse mapping*) berbasis inversi matriks dan interpolasi bilinear.
5. **Menghitung** secara manual contoh numerik transformasi titik dan interpolasi bilinear pada koordinat non-integer $(x', y')$.
6. **Menerapkan** algoritma warping geometri citra menggunakan Python, NumPy, dan OpenCV (`cv2.warpAffine`, `cv2.warpPerspective`).
7. **Mengevaluasi** galat estimasi geometris menggunakan metrik jarak Euclidean kuadrat terkecil (*Mean Reprojection Error*).

---

## 3. Prerequisites & Fundamental Foundations

Untuk menguasai materi ini dengan baik, pemahaman prasyarat berikut sangat penting:
- **Aljabar Linear**: Perkalian matriks, inversi matriks $2 \times 2$ dan $3 \times 3$, determinan, vektor eigen, dan dekomposisi nilai singular (SVD) [Chapter 05].
- **Geometri Analitis**: Vektor 2D/3D, trigonometri rotasi $(\cos\theta, \sin\theta)$, dan proyeksi garis lurus.
- **Representasi Citra Digital**: Matriks larik 2D, koordinat baris-kolom $(y, x)$, dan tipe data intensitas [Chapter 06].

---

## 4. Fundamental Theoretical Concepts

### 4.1 Sistem Koordinat Piksel vs Koordinat Cartesian Homogen

Secara konvensional, citra digital disimpan sebagai matriks larik di mana indeks baris merepresentasikan sumbu vertikal $y \in [0, H-1]$ dari atas ke bawah, dan indeks kolom merepresentasikan sumbu horizontal $x \in [0, W-1]$ dari kiri ke kanan. Titik origin $(0, 0)$ terletak pada pojok kiri-atas citra.

![Transformasi Geometri & Koordinat Citra 2D](/media/diagrams/chapter-36-coordinate-systems-and-geometry.svg)
*Gambar 36.1 — Perbandingan sistem koordinat piksel diskrit, bidang koordinat kontinu, dan hierarki proyeksi homogen. Sumber: ITERA, Lisensi CC-BY-4.0.*

Dalam geometri proyektif, representasi Cartesian standar $(x, y) \in \mathbb{R}^2$ memiliki keterbatasan analitis: operasi translasi tidak dapat direpresentasikan sebagai perkalian matriks linear biasa (harus dinyatakan sebagai penjumlahan vektor $\mathbf{x}' = \mathbf{A}\mathbf{x} + \mathbf{t}$). Untuk menyatukan seluruh operasi translasi, rotasi, skala, dan shear ke dalam representasi aljabar matriks tunggal yang elegan, kita mengadopsi **Koordinat Homogen (Homogeneous Coordinates)** pada ruang proyektif 2D ($\mathbb{P}^2$):

$$
\mathbf{p} = \begin{bmatrix} x \\ y \end{bmatrix} \in \mathbb{R}^2 \iff \mathbf{\tilde{p}} = \begin{bmatrix} X \\ Y \\ W \end{bmatrix} = \begin{bmatrix} w \cdot x \\ w \cdot y \\ w \end{bmatrix} \in \mathbb{P}^2 \quad (w \neq 0)
$$

Titik Cartesian diperoleh kembali dengan membagi dua komponen pertama terhadap skala proyektif $w$:
$$
x = \frac{X}{W}, \quad y = \frac{Y}{W}
$$

Jika $W = 0$, titik $\mathbf{\tilde{p}} = [X, Y, 0]^T$ merepresentasikan **titik di tak hingga (*point at infinity / ideal point*)**, yang mendefinisikan arah garis paralel yang berpotongan di garis horizon (*horizon line*).

---

### 4.2 Hierarki Transformasi Geometri 2D

Berdasarkan jumlah parameter bebas (*Degrees of Freedom* / DoF) dan sifat geometris yang dipertahankan (*invariants*), transformasi geometri 2D dikelompokkan ke dalam hierarki berikut:

```
┌─────────────────────────────────────────────────────────────┐
│                 HIERARKI TRANSFORMASI 2D                    │
├─────────────────┬─────┬─────────────────────┬───────────────┤
│ Transformasi    │ DoF │ Sifat Invarian      │ Contoh Matriks│
├─────────────────┼─────┼─────────────────────┼───────────────┤
│ Isometri/Rigid  │  3  │ Jarak, Sudut, Luas  │ [R | t]       │
│ Similaritas     │  4  │ Sudut, Rasio Jarak  │ [sR | t]      │
│ Afinitas        │  6  │ Paralelisme, Rasio  │ [A | t]       │
│ Proyektif/Homog │  8  │ Kelurusan, Cross-Rat│ H (3x3)       │
└─────────────────┴─────┴─────────────────────┴───────────────┘
```

1. **Translasi (2 DoF)**: Pergeseran koordinat sejauh $(t_x, t_y)$.
2. **Isometri / Rigid Body (3 DoF)**: Rotasi $\theta$ dan translasi $(t_x, t_y)$. Mempertahankan panjang Euclidean dan sudut antar garis.
3. **Similaritas (4 DoF)**: Rotasi, translasi, dan skala seragam $s$. Mempertahankan sudut dan rasio panjang.
4. **Afinitas (6 DoF)**: Memungkinkan skala non-seragam $(s_x, s_y)$ dan kemiringan (*shear* / skew). Mempertahankan garis lurus dan sifat garis paralel (garis yang sejajar tetap sejajar setelah transformasi).
5. **Proyektif / Homografi (8 DoF)**: Memetakan bidang datar ke bidang datar lain di bawah proyeksi perspektif sembarang. Garis lurus tetap menjadi garis lurus, namun garis paralel dapat berkonvergensi ke titik lenyap (*vanishing point*).

![Transformasi Afinitas vs Perspektif (Homografi)](/media/diagrams/chapter-36-affine-vs-perspective-warping.svg)
*Gambar 36.2 — Transformasi Afinitas (menjaga paralelisme) vs Homografi Perspektif (garis paralel bertemu pada vanishing point). Sumber: ITERA, Lisensi CC-BY-4.0.*

---

## 5. Mathematical Foundations & Formulations

### 5.1 Matriks Transformasi Afinitas 2D

Matriks transformasi afinitas menghubungkan koordinat sumber $\mathbf{p} = [x, y, 1]^T$ dengan koordinat target $\mathbf{p}' = [x', y', 1]^T$ melalui perkalian matriks $3 \times 3$:

$$
\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = \mathbf{M}_{\text{affine}} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \begin{bmatrix} a_{11} & a_{12} & t_x \\ a_{21} & a_{22} & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}
$$

Di mana sub-matriks $2 \times 2$ $\mathbf{A} = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}$ dapat didekomposisi menggunakan rotasi $\theta$, skala $(s_x, s_y)$, dan shear $sh_x$:

$$
\mathbf{A} = \mathbf{R}(\theta) \cdot \mathbf{S}(s_x, s_y) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix} \begin{bmatrix} s_x & 0 \\ 0 & s_y \end{bmatrix} = \begin{bmatrix} s_x \cos\theta & -s_y \sin\theta \\ s_x \sin\theta & s_y \cos\theta \end{bmatrix}
$$

Transformasi afinitas memiliki 6 derajat kebebasan, sehingga memerlukan minimal **3 pasang titik korespondensi non-kolinear** $(x_i, y_i) \leftrightarrow (x'_i, y'_i)$ untuk menyelesaikan sistem persamaan linear secara unik.

---

### 5.2 Matriks Homografi Proyektif 2D

Homografi adalah pemetaan projektif invertibel antar bidang pada ruang $\mathbb{P}^2$:

$$
\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} \sim \mathbf{H} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}
$$

Simbol $\sim$ menunjukkan kesetaraan hingga faktor skala proyektif sembarang $\lambda \neq 0$. Dalam koordinat Cartesian tak-homogen:

$$
x' = \frac{h_{11}x + h_{12}y + h_{13}}{h_{31}x + h_{32}y + h_{33}}, \quad y' = \frac{h_{21}x + h_{22}y + h_{23}}{h_{31}x + h_{32}y + h_{33}}
$$

Karena matriks $\mathbf{H}$ terdefinisi hingga faktor skala ($9$ entri dikurangi $1$ skala = **8 DoF**), estimasi homografi memerlukan minimal **4 pasang titik korespondensi** di mana tidak ada 3 titik yang berada pada satu garis lurus (algoritma Direct Linear Transformation / DLT).

---

### 5.3 Pemetaan Maju vs Pemetaan Mundur (*Forward vs Inverse Mapping*)

1. **Pemetaan Maju (*Forward Mapping*)**:
   Iterasi dilakukan melalui setiap piksel citra sumber $(x, y)$, menghitung $(x', y') = \mathbf{M} [x, y, 1]^T$, dan menyalin nilai intensitas ke citra target.
   - *Kelemahan Kritis*: Koordinat target $(x', y')$ hampir selalu berupa bilangan riil desimal (bukan integer). Pembulatan ke integer terdekat (*nearest grid point*) menyebabkan fenomena **lubang kosong (*holes/voids*)** pada citra target akibat pembesaran (*scaling up*), serta tumpang tindih piksel (*collisions*).
2. **Pemetaan Mundur (*Inverse Mapping*)**:
   Iterasi dilakukan melalui setiap koordinat piksel integer pada citra target $(x', y')$. Lokasi korespondensi pada citra sumber dihitung melalui inversi matriks transformasi:
   $$
   \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \mathbf{M}^{-1} \begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix}
   $$
   Nilai intensitas di koordinat riil $(x, y)$ pada citra sumber kemudian diinterpolasi dari piksel-piksel integer tetangganya. Pemetaan mundur menjamin bahwa **setiap piksel pada citra keluaran selalu terisi tepat satu nilai intensitas**.

---

### 5.4 Formulasi Interpolasi Bilinear

Diberikan koordinat riil $(x, y)$ hasil pemetaan mundur dengan nilai integer dasar $x_1 = \lfloor x \rfloor$, $x_2 = x_1 + 1$, $y_1 = \lfloor y \rfloor$, $y_2 = y_1 + 1$, serta jarak desimal fraksional:
$$
\alpha = x - x_1, \quad \beta = y - y_1 \quad (\alpha, \beta \in [0, 1))
$$

Nilai intensitas terinterpolasi $I(x, y)$ dihitung sebagai kombinasi linear dari 4 piksel tetangga terdekat:

$$
I(x, y) = (1 - \alpha)(1 - \beta) I(x_1, y_1) + \alpha (1 - \beta) I(x_2, y_1) + (1 - \alpha)\beta I(x_1, y_2) + \alpha \beta I(x_2, y_2)
$$

---

## 6. Step-by-Step Worked Numerical Example

### Kasus: Transformasi Afinitas Titik & Interpolasi Bilinear

Misalkan citra sumber memiliki matriks intensitas lokal $4 \times 4$ piksel:
$$
\mathbf{I} = \begin{bmatrix}
10 & 20 & 40 & 50 \\
30 & 60 & 80 & 90 \\
70 & 100 & 140 & 160 \\
120 & 150 & 180 & 210
\end{bmatrix}
$$

Kita memiliki matriks transformasi afinitas $\mathbf{M}$ dengan translasi $t_x = 1.0, t_y = 1.5$ dan rotasi $\theta = 0^\circ$ dengan skala $s_x = 0.5, s_y = 0.5$:
$$
\mathbf{M} = \begin{bmatrix} 0.5 & 0 & 1.0 \\ 0 & 0.5 & 1.5 \\ 0 & 0 & 1.0 \end{bmatrix}
$$

Invers dari matriks $\mathbf{M}$ adalah:
$$
\mathbf{M}^{-1} = \begin{bmatrix} 2.0 & 0 & -2.0 \\ 0 & 2.0 & -3.0 \\ 0 & 0 & 1.0 \end{bmatrix}
$$

**Pertanyaan:** Berapakah nilai intensitas piksel target pada koordinat integer $(x', y') = (2, 3)$?

**Langkah 1: Pemetaan Mundur ke Koordinat Sumber**
$$
\begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \mathbf{M}^{-1} \begin{bmatrix} 2 \\ 3 \\ 1 \end{bmatrix} = \begin{bmatrix} 2.0(2) + 0(3) - 2.0 \\ 0(2) + 2.0(3) - 3.0 \\ 1 \end{bmatrix} = \begin{bmatrix} 2.0 \\ 3.0 \\ 1.0 \end{bmatrix}
$$
Koordinat sumber $(x, y) = (2.0, 3.0)$ merupakan integer tepat. Maka $I(2, 3) = \mathbf{I}[y=3, x=2] = 180$.

**Pertanyaan Lanjutan:** Jika pemetaan mundur menghasilkan koordinat non-integer $(x, y) = (1.4, 2.7)$, berapakah nilai intensitas bilinear?
- $x_1 = 1, x_2 = 2 \implies \alpha = 1.4 - 1 = 0.4$
- $y_1 = 2, y_2 = 3 \implies \beta = 2.7 - 2 = 0.7$
- Nilai 4 piksel tetangga:
  - $I(1, 2) = \mathbf{I}[2, 1] = 100$
  - $I(2, 2) = \mathbf{I}[2, 2] = 140$
  - $I(1, 3) = \mathbf{I}[3, 1] = 150$
  - $I(2, 3) = \mathbf{I}[3, 2] = 180$

Perhitungan bobot:
- $w_{11} = (1 - 0.4)(1 - 0.7) = (0.6)(0.3) = 0.18$
- $w_{21} = (0.4)(1 - 0.7) = (0.4)(0.3) = 0.12$
- $w_{12} = (1 - 0.4)(0.7) = (0.6)(0.7) = 0.42$
- $w_{22} = (0.4)(0.7) = 0.28$
- Total bobot $= 0.18 + 0.12 + 0.42 + 0.28 = 1.00$ (terbukti valid).

Nilai intensitas terinterpolasi:
$$
I(1.4, 2.7) = 0.18(100) + 0.12(140) + 0.42(150) + 0.28(180) = 18.0 + 16.8 + 63.0 + 50.4 = 148.2
$$

---

## 7. Failure Mode & Boundary Case Analysis

Dalam aplikasi nyata pada robotika otonom dan navigasi wahana (seperti pada pilar penelitian ISVWS):
1. **Out-of-Bounds Mapping**: Ketika pemetaan mundur menghasilkan $(x, y)$ di luar batas kanvas citra sumber ($x < 0$, $x \ge W$, $y < 0$, atau $y \ge H$).
   - *Mitigasi*: Menentukan strategi padding: nilai konstan (*constant zero black border*), replikasi tepi (*border replicate*), atau refleksi (*border reflect*).
2. **Singularitas Matriks Inversi ($\det(\mathbf{M}) \approx 0$)**:
   - Jika faktor skala bernilai 0 atau titik korespondensi kolinear, inversi matriks menjadi tidak stabil secara numerik (*poorly conditioned*).
   - *Mitigasi*: Periksa *condition number* matriks dan gunakan Singular Value Decomposition (SVD) untuk pseudo-inversi yang stabil.
3. **Distorsi Ekstrem Homografi**: Sudut pandang proyektif tajam (*grazing angles*) dapat menghasilkan magnifikasi piksel ekstrem sehingga interpolasi bilinear tampak kabur (*aliased*).
   - *Mitigasi*: Terapkan supersampling atau Mipmapping berjenjang.

---

## 8. Summary & Key Takeaways

1. **Koordinat Homogen $\mathbb{P}^2$** menyatukan transformasi linear dan non-linear ke dalam perkalian aljabar matriks tunggal berukuran $3 \times 3$.
2. **Hierarki Geometri** mengurutkan transformasi dari Isometri (3 DoF), Similaritas (4 DoF), Afinitas (6 DoF), hingga Homografi Proyektif (8 DoF).
3. **Pemetaan Mundur (*Inverse Mapping*)** wajib digunakan dalam algoritma *image warping* untuk mencegah terjadinya celah kosong (*voids*), dipadukan dengan interpolasi bilinear untuk menghaluskan representasi sub-piksel.
4. **Metrik Reprojection Error** adalah ukuran ilmiah standar untuk memverifikasi akurasi estimasi matriks geometri pada sistem visi dunia nyata.

---

## 9. Academic References

1. **Szeliski, R. (2022).** *Computer Vision: Algorithms and Applications (2nd ed.)*. Springer. Bab 2: *Image Formation* dan Bab 3: *Image Processing & Geometric Transformations*. [DOI: 10.1007/978-3-030-34372-9](https://szeliski.org/Book/).
2. **Hartley, R., & Zisserman, A. (2004).** *Multiple View Geometry in Computer Vision (2nd ed.)*. Cambridge University Press. Bab 2: *Projective Geometry and Transformations of 2D*. [DOI: 10.1017/CBO9780511811685](https://www.cambridge.org/core/books/multiple-view-geometry-in-computer-vision/4582AA4E1199F9F8813B038B315DE219).
3. **Gonzalez, R. C., & Woods, R. E. (2018).** *Digital Image Processing (4th ed.)*. Pearson. Bab 2: *Geometric Spatial Transformations and Image Registration*.
