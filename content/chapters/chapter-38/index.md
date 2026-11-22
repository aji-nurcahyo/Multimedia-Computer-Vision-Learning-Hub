# Chapter 38 — Camera Calibration & Perspective Transformation

> **Bagian Kurikulum**: Section 08 — Classical Computer Vision  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 36 (Computer Vision Foundations & Image Geometry), Chapter 37 (Feature Detection & Matching)  
> **Learning Tracks**: Computer Vision, Real-Time & Edge Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)  
> **Lisensi Materi**: Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Chapter Overview

Kamera optik adalah sensor utama dalam sistem kecerdasan visual yang mentransformasikan berkas cahaya 3D dari lingkungan fisik menjadi susunan piksel 2D pada sensor semikonduktor (CCD atau CMOS). Namun, proyeksi optik ini tidak terjadi secara ideal: lensa kamera nyata mengalami penyimpangan geometri optik (*lens distortion*), dan orientasi kamera terhadap koordinat dunia luar dapat berubah-ubah. Tanpa mengetahui parameter fisis kamera, mustahil bagi wahana otonom atau sistem robotika untuk memperkirakan ukuran fisik objek, menghitung jarak metrik nyata, atau merekonstruksi lingkungan 3D.

Proses penentuan parameter internal kamera dan koreksi distorsi optik disebut **Kalibrasi Kamera (Camera Calibration)**. Dalam bab ini, kita akan membedah secara matematis:
- **Model Kamera Lubang Jarum (*Pinhole Camera Model*)** dan persamaan proyeksi perspektif penuh.
- **Matriks Intrinsik Kamera ($\mathbf{K}$)** yang memodelkan panjang fokus dalam satuan piksel ($f_x, f_y$), titik utama (*principal point* $c_x, c_y$), dan faktor kemiringan (*skew* $s$).
- **Matriks Ekstrinsik ($[\mathbf{R} \mid \mathbf{t}]$)** yang memodelkan orientasi rotasi 3D dan posisi translasi kamera terhadap sistem koordinat dunia nyata.
- **Model Distorsi Lensa Brown-Conrady**: distorsi radial (*barrel* dan *pincushion*) serta distorsi tangensial akibat ketidaksejajaran elemen lensa.
- **Metode Kalibrasi Zhang (2000)** menggunakan pola papan catur (*planar chessboard pattern*), estimasi analitis, dan optimasi non-linear Levenberg-Marquardt.
- **Transformasi Perspektif & Inverse Perspective Mapping (IPM / Bird's Eye View)** untuk sistem bantuan pengemudi otonom (ADAS).

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan peneliti diharapkan mampu:

1. **Menurunkan** persamaan proyeksi proyektif $3\text{D} \to 2\text{D}$ dari koordinat dunia $\mathbf{X}_w$ ke koordinat citra homogen $\mathbf{x} \sim \mathbf{P} \mathbf{X}_w$.
2. **Membedakan** secara analitis peran matriks parameter intrinsik $\mathbf{K} \in \mathbb{R}^{3 \times 3}$ dengan matriks parameter ekstrinsik $[\mathbf{R} \mid \mathbf{t}] \in \mathbb{R}^{3 \times 4}$.
3. **Menganalisis** perumusan matematika distorsi lensa radial ($k_1, k_2, k_3$) dan tangensial ($p_1, p_2$), serta algoritma penghilangan distorsi (*undistortion*).
4. **Memahami** pembuktian matematis metode kalibrasi bidang datar Zhang (2000) berbasis kendala ortogonalitas absolut (*Absolute Conic constraints*).
5. **Menghitung** metrik evaluasi *Mean Reprojection Error* (MRE) untuk mengukur kualitas dan ketidakpastian kalibrasi kamera.
6. **Mengimplementasikan** pipeline kalibrasi kamera lengkap menggunakan Python dan pustaka industri OpenCV (`cv2.calibrateCamera`, `cv2.undistort`, `cv2.getPerspectiveTransform`).
7. **Merancang** transformasi perspektif mundur (*Inverse Perspective Mapping*) untuk menghasilkan proyeksi tampak atas (*Bird's Eye View*) pada citra jalan raya.

---

## 3. Mathematical Foundations & Formulations

### 3.1 Model Kamera Pinhole & Matriks Proyeksi

Dalam model kamera lubang jarum ideal tanpa distorsi, berkas sinar dari titik 3D di dunia nyata $\mathbf{X}_w = [X_w, Y_w, Z_w, 1]^T$ merambat lurus melewati pusat optik kamera $C$ menuju bidang fokal citra pada jarak fokal $f$:

![Model Kamera Pinhole & Matriks Intrinsik K](/media/diagrams/chapter-38-pinhole-camera-model.svg)
*Gambar 38.1 — Geometri proyeksi kamera pinhole: transformasi dari koordinat dunia 3D ke koordinat kamera 3D, koordinat ternormalisasi, dan bidang sensor piksel 2D. Sumber: ITERA, Lisensi CC-BY-4.0.*

Hubungan proyeksi proyektif penuh dinyatakan sebagai:

$$
\lambda \begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = \mathbf{P} \begin{bmatrix} X_w \\ Y_w \\ Z_w \\ 1 \end{bmatrix} = \mathbf{K} \begin{bmatrix} \mathbf{R} & \mathbf{t} \end{bmatrix} \begin{bmatrix} X_w \\ Y_w \\ Z_w \\ 1 \end{bmatrix}
$$

Di mana:
- $\lambda$ adalah faktor skala kedalaman proyektif ($Z_c$, jarak titik ke bidang fokal kamera).
- $\mathbf{P} = \mathbf{K} [\mathbf{R} \mid \mathbf{t}]$ adalah **Matriks Proyeksi Kamera ($3 \times 4$)** dengan 11 derajat kebebasan.

---

### 3.2 Matriks Parameter Intrinsik ($\mathbf{K}$)

Matriks intrinsik $\mathbf{K}$ memodelkan sifat optik dan geometri internal sensor:

$$
\mathbf{K} = \begin{bmatrix} f_x & s & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}
$$

Komponen intrinsik:
- $f_x = f \cdot m_x$: Panjang fokus dalam satuan piksel horizontal ($m_x$ adalah densitas piksel per milimeter sensor).
- $f_y = f \cdot m_y$: Panjang fokus dalam satuan piksel vertikal. Jika piksel berbentuk bujur sangkar sempurna (*square pixels*), $f_x \approx f_y$.
- $(c_x, c_y)$: Titik koordinat pusat optik (*principal point*) pada citra, idealnya berada di tengah sensor $(\frac{W}{2}, \frac{H}{2})$.
- $s$: Faktor kemiringan (*skew parameter*), merepresentasikan non-ortogonalitas sumbu sensor. Pada sensor modern, $s \approx 0$.

---

### 3.3 Matriks Parameter Ekstrinsik ($[\mathbf{R} \mid \mathbf{t}]$)

Matriks ekstrinsik memetakan titik dari sistem koordinat dunia $\mathbf{X}_w$ ke sistem koordinat kamera 3D $\mathbf{X}_c$:

$$
\mathbf{X}_c = \begin{bmatrix} X_c \\ Y_c \\ Z_c \end{bmatrix} = \mathbf{R} \mathbf{X}_w + \mathbf{t} = \begin{bmatrix} r_{11} & r_{12} & r_{13} & t_x \\ r_{21} & r_{22} & r_{23} & t_y \\ r_{31} & r_{32} & r_{33} & t_z \end{bmatrix} \begin{bmatrix} X_w \\ Y_w \\ Z_w \\ 1 \end{bmatrix}
$$

Di mana $\mathbf{R} \in SO(3)$ adalah matriks rotasi ortogonal ($\mathbf{R}^T \mathbf{R} = \mathbf{I}$, $\det(\mathbf{R}) = 1$, 3 DoF: sudut Euler yaw, pitch, roll), dan $\mathbf{t} \in \mathbb{R}^3$ adalah vektor translasi 3 dimensi (3 DoF).

---

### 3.4 Model Distorsi Lensa Optik (Brown-Conrady)

Lensa fisik nyata menimbulkan deviasi dari model pinhole ideal. Diberikan koordinat ternormalisasi ideal:
$$
x = \frac{X_c}{Z_c}, \quad y = \frac{Y_c}{Z_c}, \quad r^2 = x^2 + y^2
$$

![Distorsi Lensa Kamera: Radial & Tangensial](/media/diagrams/chapter-38-radial-tangential-distortion.svg)
*Gambar 38.2 — Karakteristik distorsi optik: distorsi radial (Barrel vs Pincushion) dan distorsi tangensial akibat kemiringan lensa. Sumber: ITERA, Lisensi CC-BY-4.0.*

Titik terdistorsi $(x_{\text{dist}}, y_{\text{dist}})$ dimodelkan oleh dua komponen:
1. **Distorsi Radial ($k_1, k_2, k_3$)**:
   Terjadi karena kelengkungan fisik lensa. Jika $k_1 < 0$, terjadi efek tong (*barrel distortion* / fisheye); jika $k_1 > 0$, terjadi efek bantalan (*pincushion distortion*):
   $$
   x_{\text{rad}} = x \left( 1 + k_1 r^2 + k_2 r^4 + k_3 r^6 \right), \quad y_{\text{rad}} = y \left( 1 + k_1 r^2 + k_2 r^4 + k_3 r^6 \right)
   $$
2. **Distorsi Tangensial ($p_1, p_2$)**:
   Terjadi karena lensa tidak terpasang sejajar sempurna terhadap bidang sensor:
   $$
   x_{\text{tan}} = 2 p_1 x y + p_2 (r^2 + 2x^2), \quad y_{\text{tan}} = p_1 (r^2 + 2y^2) + 2 p_2 x y
   $$

Koordinat terdistorsi gabungan sebelum diproyeksikan ke piksel:
$$
x_{\text{dist}} = x_{\text{rad}} + x_{\text{tan}}, \quad y_{\text{dist}} = y_{\text{rad}} + y_{\text{tan}}
$$
Posisi piksel akhir pada sensor:
$$
u = f_x \cdot x_{\text{dist}} + c_x, \quad v = f_y \cdot y_{\text{dist}} + c_y
$$

Vektor parameter distorsi penuh: $\mathbf{D} = [k_1, k_2, p_1, p_2, k_3]$.

---

### 3.5 Metode Kalibrasi Bidang Datar Zhang (2000)

Metode Zhengyou Zhang (IEEE TPAMI 2000) merevolusi kalibrasi kamera karena hanya membutuhkan kamera mengamati pola papan catur (*chessboard*) 2D dari beberapa orientasi berbeda ($\ge 3$ orientasi, umumnya disarankan 10–20 citra).

Tanpa kehilangan keumuman, kita definisikan bidang papan catur pada koordinat dunia $Z_w = 0$. Maka persamaan proyeksi tereduksi menjadi homografi 2D antara bidang papan catur dan citra:

$$
\begin{bmatrix} u \\ v \\ 1 \end{bmatrix} \sim \mathbf{K} \begin{bmatrix} \mathbf{r}_1 & \mathbf{r}_2 & \mathbf{r}_3 & \mathbf{t} \end{bmatrix} \begin{bmatrix} X_w \\ Y_w \\ 0 \\ 1 \end{bmatrix} = \mathbf{K} \begin{bmatrix} \mathbf{r}_1 & \mathbf{r}_2 & \mathbf{t} \end{bmatrix} \begin{bmatrix} X_w \\ Y_w \\ 1 \end{bmatrix} = \mathbf{H} \begin{bmatrix} X_w \\ Y_w \\ 1 \end{bmatrix}
$$

Dengan $\mathbf{H} = \begin{bmatrix} \mathbf{h}_1 & \mathbf{h}_2 & \mathbf{h}_3 \end{bmatrix} = \lambda \mathbf{K} \begin{bmatrix} \mathbf{r}_1 & \mathbf{r}_2 & \mathbf{t} \end{bmatrix}$. Mengingat bahwa vektor kolom rotasi bersifat ortonormal:
$$
\mathbf{r}_1^T \mathbf{r}_2 = 0 \quad \text{dan} \quad \|\mathbf{r}_1\| = \|\mathbf{r}_2\| = 1
$$
Kita peroleh dua kendala aljabar fundamental per citra:

$$
\mathbf{h}_1^T \mathbf{K}^{-T} \mathbf{K}^{-1} \mathbf{h}_2 = 0
$$
$$
\mathbf{h}_1^T \mathbf{K}^{-T} \mathbf{K}^{-1} \mathbf{h}_1 = \mathbf{h}_2^T \mathbf{K}^{-T} \mathbf{K}^{-1} \mathbf{h}_2
$$

Matriks simetris $\mathbf{B} = \mathbf{K}^{-T} \mathbf{K}^{-1}$ memiliki 6 elemen independen. Setiap citra papan catur memberikan 2 persamaan linear terhadap $\mathbf{B}$. Dengan minimal 3 citra ($\ge 6$ persamaan), $\mathbf{B}$ dapat diselesaikan secara analitis via SVD, dan parameter intrinsik $\mathbf{K}$ diekstrak via faktorisasi Cholesky. Seluruh parameter $(\mathbf{K}, \mathbf{D}, \mathbf{R}_i, \mathbf{t}_i)$ kemudian disempurnakan menggunakan optimasi non-linear Levenberg-Marquardt untuk meminimalkan *Mean Reprojection Error*.

---

## 4. Step-by-Step Worked Numerical Example

### Contoh: Proyeksi Titik 3D ke Koordinat Piksel Sensor

Misalkan kamera memiliki parameter intrinsik yang telah terkalibrasi:
$$
\mathbf{K} = \begin{bmatrix} 800.0 & 0.0 & 320.0 \\ 0.0 & 800.0 & 240.0 \\ 0.0 & 0.0 & 1.0 \end{bmatrix}
$$
Dimensi citra adalah $640 \times 480$ piksel, titik pusat optik $c_x = 320, c_y = 240$, panjang fokus $f_x = f_y = 800$ piksel. Asumsikan koefisien distorsi $\mathbf{D} = \mathbf{0}$ (lensa ideal).

Kamera diposisikan dengan translasi $\mathbf{t} = [0.2, -0.1, 1.0]^T$ meter dan rotasi murni terhadap sumbu $Y$ sebesar $\theta = 0^\circ$ ($\mathbf{R} = \mathbf{I}$).

Sebuah titik target pada koordinat dunia terletak di $\mathbf{X}_w = [0.5, 0.3, 4.0]^T$ meter.

**Langkah 1: Hitung Koordinat Titik dalam Sistem Kamera 3D ($\mathbf{X}_c$)**
$$
\mathbf{X}_c = \mathbf{R} \mathbf{X}_w + \mathbf{t} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} 0.5 \\ 0.3 \\ 4.0 \end{bmatrix} + \begin{bmatrix} 0.2 \\ -0.1 \\ 1.0 \end{bmatrix} = \begin{bmatrix} 0.7 \\ 0.2 \\ 5.0 \end{bmatrix} \text{ meter}
$$
Jarak kedalaman titik terhadap bidang kamera adalah $Z_c = 5.0$ meter.

**Langkah 2: Hitung Koordinat Ternormalisasi ($x, y$)**
$$
x = \frac{X_c}{Z_c} = \frac{0.7}{5.0} = 0.14, \quad y = \frac{Y_c}{Z_c} = \frac{0.2}{5.0} = 0.04
$$

**Langkah 3: Petakan ke Koordinat Piksel Sensor ($u, v$)**
$$
u = f_x \cdot x + c_x = (800.0 \times 0.14) + 320.0 = 112.0 + 320.0 = 432.0 \text{ piksel}
$$
$$
v = f_y \cdot y + c_y = (800.0 \times 0.04) + 240.0 = 32.0 + 240.0 = 272.0 \text{ piksel}
$$

Titik 3D diproyeksikan secara tepat ke koordinat piksel $(u, v) = (432, 272)$ pada citra kamera.

---

## 5. Failure Mode & Edge Case Analysis

1. **Pola Kalibrasi Kurang Variatif**: Mengambil citra papan catur hanya dari sudut tegak lurus (*perpendicular orientation*) menyebabkan matriks persamaan Zhang menjadi singular (*degenerate configuration*).
   - *Mitigasi*: Variasikan sudut kemiringan papan catur ($\pm 30^\circ$ yaw dan pitch) dan cakup seluruh area sensor hingga ke bagian sudut lensa.
2. **Distorsi Ekstrem Lensa Fisheye**: Lensa sudut sangat lebar (*Field of View* > $120^\circ$) tidak dapat dimodelkan secara akurat oleh polinomial Brown.
   - *Mitigasi*: Gunakan model fisheye khusus berbasis proyeksi ekuidistan Kannala-Brandt (`cv2.fisheye.calibrate`).
3. **Papan Catur Tidak Datar (*Non-Planar Board*)**: Papan catur yang melengkung merusak asumsi $Z_w = 0$, mengakibatkan galat estimasi panjang fokus yang signifikan.

---

## 6. Summary & Key Takeaways

1. **Matriks Intrinsik $\mathbf{K}$** adalah properti internal kamera yang konstan (kecuali zoom diubah).
2. **Matriks Ekstrinsik $[\mathbf{R} \mid \mathbf{t}]$** mendefinisikan posisi dan orientasi dinamis wahana/kamera di ruang dunia.
3. **Distorsi Lensa** wajib dihilangkan sebelum melakukan estimasi jarak metrik, stereo vision, atau rekonstruksi 3D.
4. **Metode Zhang (2000)** adalah metodologi standar industri untuk memperoleh parameter kamera yang presisi secara matematis.

---

## 7. Academic References

1. **Zhang, Z. (2000).** *A Flexible New Technique for Camera Calibration*. IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI), 22(11), 1330-1334. [DOI: 10.1109/34.888718](https://doi.org/10.1109/34.888718).
2. **Brown, D. C. (1971).** *Close-range camera calibration*. Photogrammetric Engineering, 37(8), 855-866.
3. **Hartley, R., & Zisserman, A. (2004).** *Multiple View Geometry in Computer Vision (2nd ed.)*. Cambridge University Press. Bab 6: *Camera Models* dan Bab 7: *Computation of the Camera Matrix P*.
