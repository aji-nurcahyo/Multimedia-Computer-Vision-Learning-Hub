# Chapter 39 — Stereo Vision & Depth Estimation

> **Bagian Kurikulum**: Section 08 — Classical Computer Vision  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 36 (Image Geometry), Chapter 37 (Feature Matching), Chapter 38 (Camera Calibration)  
> **Learning Tracks**: Computer Vision, Real-Time & Edge Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)  
> **Lisensi Materi**: Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Chapter Overview

Mata manusia dan makhluk hidup predator memanfaatkan persepsi visual binokular (*binocular vision*) untuk mempersepsikan kedalaman dan struktur tiga dimensi lingkungan secara langsung. Ketika dua mata memandang objek yang sama dari dua posisi spasial yang sedikit berbeda, perbedaan perspektif menghasilkan pergeseran posisi horizontal pada retina. Otak memproses pergeseran ini menjadi sensasi kedalaman metrik (stereopsis). Prinsip biologis ini direkayasa dalam visi komputer melalui **Sistem Penglihatan Stereo (Stereo Vision)**.

Sistem stereo vision menggunakan dua kamera (atau lebih) yang telah dikalibrasi secara intrinsik dan ekstrinsik dengan jarak pemisah tertentu yang disebut **Baseline ($B$)**. Tantangan matematis utama dalam stereo vision adalah menyelesaikan **masalah korespondensi stereo (*stereo correspondence problem*)**: menemukan pasangan piksel pada citra kiri dan citra kanan yang berasal dari titik fisik 3D yang sama di dunia nyata.

Dalam bab ini, kita akan membedah secara mendalam:
- **Geometri Epipolar (*Epipolar Geometry*)**: Titik epipol, bidang epipolar, dan garis epipolar yang membatasi ruang pencarian korespondensi dari bidang 2D menjadi pencarian garis 1D.
- **Matriks Esensial ($\mathbf{E}$)** pada koordinat kamera ternormalisasi dan **Matriks Fundamental ($\mathbf{F}$)** pada koordinat piksel sensor.
- **Rektifikasi Stereo (*Stereo Rectification*)**: Transformasi proyektif yang menyejajarkan garis epipolar secara horizontal dan kolinear dengan baris piksel sensor.
- **Peta Disparitas (*Disparity Map*)** dan formulasi triangulasi kedalaman metrik: $Z = \frac{f \cdot B}{d}$.
- **Analisis Sensitivitas & Ketidakpastian Kedalaman**: Mengapa galat estimasi kedalaman bertambah secara kuadratik terhadap jarak objek ($\Delta Z \propto Z^2$).
- **Algoritma Pencocokan Stereo**: Block Matching (SAD/SSD/NCC) dan Semi-Global Matching (SGM - Hirschmüller 2008).

---

## 2. Learning Objectives

Setelah menuntaskan bab ini, mahasiswa dan peneliti diharapkan memiliki kompetensi akademik berikut:

1. **Memahami** geometri epipolar dua pandangan (*two-view epipolar geometry*) dan menurunkan persamaan kendala epipolar $\mathbf{x}_R^T \mathbf{F} \mathbf{x}_L = 0$.
2. **Membedakan** Matriks Esensial $\mathbf{E} \in \mathbb{R}^{3 \times 3}$ (5 DoF, koordinat ternormalisasi metrik) dengan Matriks Fundamental $\mathbf{F} \in \mathbb{R}^{3 \times 3}$ (7 DoF, koordinat piksel tak terkalibrasi).
3. **Menganalisis** tahapan rektifikasi stereo Bouguet dan pembuktian matematis bahwa setelah rektifikasi, pencarian korespondensi tereduksi menjadi pemindaian garis horizontal baris yang sama ($v_L = v_R$).
4. **Menurunkan** rumus triangulasi disparitas stereo $Z = \frac{f \cdot B}{d}$ serta persamaan sensitivitas galat kedalaman $\left| \frac{\partial Z}{\partial d} \right| = \frac{Z^2}{f \cdot B}$.
5. **Mengevaluasi** komparasi kinerja antara metode lokal (*Block Matching*) dengan metode optimasi global/semi-global (*Semi-Global Matching / SGM*) dalam menangani oklusi dan permukaan tanpa tekstur.
6. **Mengimplementasikan** pipeline estimasi disparitas dan rekonstruksi awan titik (*point cloud*) kedalaman metrik menggunakan Python dan OpenCV (`cv2.StereoBM`, `cv2.StereoSGBM`, `cv2.reprojectImageTo3D`).

---

## 3. Mathematical Foundations & Formulations

### 3.1 Geometri Epipolar & Kendala Epipolar

Diberikan dua kamera pinhole dengan pusat optik kiri $C_L$ dan pusat optik kanan $C_R$. Garis lurus yang menghubungkan $C_L$ dan $C_R$ disebut **garis basis (*baseline*)**. Titik potong garis basis dengan bidang citra masing-masing kamera disebut **Epipol ($e_L$ dan $e_R$)**.

![Geometri Epipolar pada Stereo Vision](/media/diagrams/chapter-39-epipolar-geometry.svg)
*Gambar 39.1 — Geometri epipolar: Titik 3D P, pusat proyeksi C_L dan C_R membentuk bidang epipolar. Garis perpotongan dengan bidang citra menghasilkan garis epipolar l_L dan l_R. Sumber: ITERA, Lisensi CC-BY-4.0.*

Untuk setiap titik piksel $\mathbf{x}_L$ pada citra kiri, titik pasangannya pada citra kanan $\mathbf{x}_R$ **pasti terletak pada garis epipolar $\mathbf{l}_R$**. Sifat ini disebut **Kendala Epipolar (*Epipolar Constraint*)**, yang mereduksi kompleksitas pencarian pasangan dari $\mathcal{O}(W \times H)$ menjadi $\mathcal{O}(W)$.

---

### 3.2 Matriks Esensial ($\mathbf{E}$) dan Matriks Fundamental ($\mathbf{F}$)

Misalkan orientasi relatif kamera kanan terhadap kamera kiri didefinisikan oleh rotasi $\mathbf{R}$ dan translasi $\mathbf{t}$. Dalam koordinat kamera ternormalisasi $\hat{\mathbf{x}} = \mathbf{K}^{-1} \mathbf{x}$:

$$
\hat{\mathbf{x}}_R^T \mathbf{E} \hat{\mathbf{x}}_L = 0, \quad \text{di mana } \mathbf{E} = [\mathbf{t}]_\times \mathbf{R}
$$

Di mana $[\mathbf{t}]_\times$ adalah matriks perkalian silang miring (*skew-symmetric cross-product matrix*):
$$
[\mathbf{t}]_\times = \begin{bmatrix} 0 & -t_z & t_y \\ t_z & 0 & -t_x \\ -t_y & t_x & 0 \end{bmatrix}
$$

Matriks Esensial $\mathbf{E}$ memiliki dua nilai singular yang bernilai sama dan satu nilai singular nol $(\sigma, \sigma, 0)$.

Pada koordinat piksel citra tak terkalibrasi $\mathbf{x} = \mathbf{K} \hat{\mathbf{x}}$, kendala epipolar dinyatakan melalui **Matriks Fundamental ($\mathbf{F}$)**:

$$
\mathbf{x}_R^T \mathbf{F} \mathbf{x}_L = 0, \quad \text{di mana } \mathbf{F} = \mathbf{K}_R^{-T} \mathbf{E} \mathbf{K}_L^{-1} = \mathbf{K}_R^{-T} [\mathbf{t}]_\times \mathbf{R} \mathbf{K}_L^{-1}
$$

Sifat Matriks Fundamental $\mathbf{F}$:
- $\mathbf{F}$ berukuran $3 \times 3$ dengan rank 2 ($\det(\mathbf{F}) = 0$).
- Memiliki 7 derajat kebebasan (9 elemen dikurangi 1 skala dan 1 kendala rank $\det(\mathbf{F})=0$).
- Garis epipolar pada citra kanan untuk titik $\mathbf{x}_L$ dihitung sebagai $\mathbf{l}_R = \mathbf{F} \mathbf{x}_L$.
- Epipol memenuhi $\mathbf{F} \mathbf{e}_L = \mathbf{0}$ dan $\mathbf{e}_R^T \mathbf{F} = \mathbf{0}^T$.

---

### 3.3 Rektifikasi Stereo (*Stereo Rectification*)

Dalam konfigurasi kamera umum, garis epipolar memiliki kemiringan sembarang. **Rektifikasi Stereo** menerapkan transformasi homografi pada citra kiri ($\mathbf{H}_L$) dan citra kanan ($\mathbf{H}_R$) sedemikian rupa sehingga:
1. Kedua bidang citra berada pada bidang datar proyektif yang persis sama.
2. Titik epipol terdorong ke tak terhingga sepanjang sumbu horizontal ($e_x \to \infty, e_y = 0$).
3. Seluruh garis epipolar menjadi **sejajar horizontal dan memiliki baris koordinat vertikal yang identik ($v_L = v_R$)**.

Setelah rektifikasi, pencarian korespondensi untuk titik $(u_L, v)$ hanya perlu menelusuri baris horizontal yang sama $(u_R, v)$ pada citra kanan dengan $u_R \le u_L$.

---

### 3.4 Triangulasi Disparitas & Estimasi Kedalaman Metrik

Pada sistem stereo terektifikasi dengan panjang fokus $f$ (dalam piksel) dan jarak baseline $B$ (dalam meter):

![Triangulasi Disparitas & Estimasi Kedalaman Stereo](/media/diagrams/chapter-39-stereo-disparity-depth-triangulation.svg)
*Gambar 39.2 — Triangulasi stereo terektifikasi: kemiripan segitiga antara bidang fokus f, baseline B, dan disparitas d menghasilkan estimasi kedalaman Z. Sumber: ITERA, Lisensi CC-BY-4.0.*

Perbedaan posisi horizontal titik pasangan pada citra kiri dan citra kanan disebut **Disparitas ($d$)**:
$$
d = u_L - u_R \quad (\text{satuan piksel, } d > 0)
$$

Berdasarkan kesebangunan segitiga (*similar triangles*) antara segitiga optik $C_L P C_R$ dan segitiga sensor:
$$
\frac{B}{Z} = \frac{(u_L - c_x) - (u_R - c_x)}{f} = \frac{u_L - u_R}{f} = \frac{d}{f}
$$

Maka diperoleh **Persamaan Kedalaman Stereo Fundamental**:

$$
Z = \frac{f \cdot B}{d}
$$

Koordinat metrik 3D penuh $(X, Y, Z)$ dari titik tersebut direkonstruksi sebagai:
$$
X = \frac{(u_L - c_x) \cdot Z}{f} = \frac{(u_L - c_x) \cdot B}{d}, \quad Y = \frac{(v_L - c_y) \cdot Z}{f} = \frac{(v_L - c_y) \cdot B}{d}
$$

---

### 3.5 Analisis Sensitivitas & Ketidakpastian Kedalaman

Berapa besar dampak galat estimasi disparitas $\Delta d$ (misal $\Delta d = 0.5$ piksel) terhadap ketidakpastian jarak kedalaman $\Delta Z$? Mengambil turunan parsial pertama dari $Z$ terhadap $d$:

$$
\frac{\partial Z}{\partial d} = -\frac{f \cdot B}{d^2} = -\frac{Z^2}{f \cdot B}
$$

Dalam bentuk magnitudo galat diskrit:

$$
|\Delta Z| \approx \frac{Z^2}{f \cdot B} |\Delta d|
$$

**Implikasi Fisis Kritis:**
- **Galat kedalaman bertambah secara kuadratik terhadap jarak ($Z^2$)**: Objek yang berada dua kali lebih jauh akan memiliki ketidakpastian jarak empat kali lebih besar!
- Untuk mempertahankan presisi pengukuran jarak jauh, sistem harus memperbesar jarak baseline $B$ atau menggunakan lensa dengan panjang fokus $f$ yang lebih panjang.
- Di dekat kamera ($Z$ kecil), resolusi kedalaman stereo sangat tinggi; di kejauhan ($Z$ besar), disparitas mendekati 0 sehingga kedalaman menjadi tidak dapat dibedakan.

---

## 4. Step-by-Step Worked Numerical Example

### Kasus: Estimasi Kedalaman Wahana Otonom dari Kamera Stereo
Sebuah robot otonom dilengkapi kamera stereo terektifikasi dengan spesifikasi:
- Jarak antar kamera (Baseline): $B = 0.20\text{ m}$ ($20\text{ cm}$).
- Panjang fokus horizontal: $f = 800\text{ piksel}$.
- Titik pusat optik: $c_x = 320, c_y = 240$.
- Resolusi sensor: $640 \times 480$ piksel.

Sensor mendeteksi fitur pejalan kaki pada citra kiri di koordinat $(u_L, v_L) = (380.0, 240.0)$. Algoritma stereo matching menemukan korespondensinya pada citra kanan di $(u_R, v_R) = (348.0, 240.0)$.

**Langkah 1: Hitung Nilai Disparitas ($d$)**
$$
d = u_L - u_R = 380.0 - 348.0 = 32.0\text{ piksel}
$$

**Langkah 2: Hitung Jarak Kedalaman Metrik ($Z$)**
$$
Z = \frac{f \cdot B}{d} = \frac{800\text{ px} \times 0.20\text{ m}}{32.0\text{ px}} = \frac{160.0}{32.0} = 5.0\text{ meter}
$$
Pejalan kaki terdeteksi berada pada jarak tepat $5.0$ meter di depan kamera robot.

**Langkah 3: Hitung Posisi Spasial 3D Horizontal ($X$) dan Vertikal ($Y$)**
$$
X = \frac{(u_L - c_x) \cdot Z}{f} = \frac{(380 - 320) \times 5.0}{800} = \frac{60 \times 5.0}{800} = \frac{300}{800} = +0.375\text{ meter (ke arah kanan)}
$$
$$
Y = \frac{(v_L - c_y) \cdot Z}{f} = \frac{(240 - 240) \times 5.0}{800} = 0.0\text{ meter (sejajar sumbu optik)}
$$
Posisi 3D pejalan kaki di dunia nyata relatif terhadap kamera kiri: $\mathbf{P} = [0.375, 0.0, 5.0]^T$ meter.

**Langkah 4: Hitung Sensitivitas Galat Jika Terjadi Kesalahan Estimasi Disparitas $\Delta d = 1.0\text{ px}$**
$$
|\Delta Z| \approx \frac{Z^2}{f \cdot B} |\Delta d| = \frac{(5.0)^2}{800 \times 0.20} \times 1.0 = \frac{25.0}{160.0} \approx 0.156\text{ meter } (15.6\text{ cm})
$$
Pada jarak 5 meter, kesalahan estimasi 1 piksel disparitas hanya menimbulkan galat $15.6\text{ cm}$. Namun pada objek di jarak $Z = 20\text{ meter}$, galatnya melonjak menjadi:
$$
|\Delta Z| = \frac{(20.0)^2}{160.0} \times 1.0 = \frac{400.0}{160.0} = 2.50\text{ meter (16 kali lebih besar!)}
$$

---

## 5. Failure Mode & Edge Case Analysis

1. **Daerah Tanpa Tekstur (Textureless Surfaces)**: Dinding polos atau jalan aspal seragam tidak memiliki gradien intensitas lokal, menyebabkan fungsi biaya pencocokan (SAD/SSD) datar dan ambigu.
   - *Mitigasi*: Algoritma Semi-Global Matching (SGM) menerapkan regularisasi kekasaran permukaan spasial 2D (*smoothness penalty* $P_1, P_2$).
2. **Oklusi Separasi (*Occlusions*)**: Objek di latar depan menghalangi pandangan kamera kanan terhadap area tertentu di latar belakang. Area oklusi ini tidak memiliki pasangan korespondensi fisik.
   - *Mitigasi*: Pemeriksaan konsistensi kiri-kanan (*Left-Right Consistency Check / LRC*): $|d_L(x, y) - d_R(x - d_L(x,y), y)| \le 1$.
3. **Penyimpangan Rektifikasi Vertikal**: Jika kalibrasi ekstrinsik stereo tidak presisi, pergeseran vertikal $v_L \neq v_R$ terjadi, mematahkan asumsi pencarian 1D scanline.

---

## 6. Summary & Key Takeaways

1. **Geometri Epipolar** mereduksi kompleksitas pencarian pasangan stereo dari ruang 2D citra penuh menjadi pemindaian garis 1D.
2. **Rektifikasi Stereo** mensejajarkan garis epipolar secara horizontal dan sejajar dengan baris piksel.
3. **Disparitas berbanding terbalik dengan kedalaman ($Z = fB / d$)**, dan ketidakpastian galat kedalaman meningkat kuadratik terhadap jarak objek ($Z^2$).
4. **Semi-Global Matching (SGBM)** adalah algoritma standar industri yang mengombinasikan akurasi optimasi energi global dengan efisiensi eksekusi real-time.

---

## 7. Academic References

1. **Scharstein, D., & Szeliski, R. (2002).** *A Taxonomy and Evaluation of Two-Frame Stereo Correspondence Algorithms*. International Journal of Computer Vision (IJCV), 47(1-3), 7-42. [DOI: 10.1023/A:1014573219977](https://doi.org/10.1023/A:1014573219977).
2. **Hirschmüller, H. (2008).** *Stereo Processing by Semiglobal Matching and Mutual Information*. IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI), 30(2), 328-341. [DOI: 10.1109/TPAMI.2007.1166](https://doi.org/10.1109/TPAMI.2007.1166).
3. **Hartley, R., & Zisserman, A. (2004).** *Multiple View Geometry in Computer Vision (2nd ed.)*. Cambridge University Press. Bab 9: *Epipolar Geometry and the Fundamental Matrix*.
