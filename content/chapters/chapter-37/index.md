# Chapter 37 — Feature Detection, Description & Matching

> **Bagian Kurikulum**: Section 08 — Classical Computer Vision  
> **Estimasi Durasi**: 150 Menit | **Tingkat Kesulitan**: Advanced  
> **Prasyarat**: Chapter 10 (Spatial Filtering & Convolution), Chapter 13 (Edge Detection), Chapter 36 (Image Geometry)  
> **Learning Tracks**: Computer Vision, Real-Time & Edge Vision  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)  
> **Lisensi Materi**: Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Chapter Overview

Dalam aplikasi visi komputer dunia nyata seperti navigasi robotika otonom, rekonstruksi 3D, pelacakan target dinamis, dan penjahitan panorama (*panoramic image stitching*), sistem harus mampu menemukan korespondensi spasial antar-citra yang diambil dari sudut pandang (*viewpoint*), jarak, orientasi, dan pencahayaan yang berbeda secara dramatis. Membandingkan seluruh piksel citra secara brute-force tidak praktis dan rapuh terhadap variasi iluminasi. Solusi fundamentalnya adalah mengekstrak **Fitur Lokal (Local Features)** yang unik, berulang (*repeatable*), dan kompak.

Pipeline ekstraksi fitur klasik terdiri dari tiga tahapan sekuensial yang ketat:
1. **Deteksi Titik Minat (*Feature Detection / Keypoint Extraction*)**: Menemukan lokasi piksel unik yang stabil (titik sudut / bercak).
2. **Deskripsi Fitur (*Feature Description*)**: Mengonstruksi vektor deskriptor kompak yang merepresentasikan pola tekstur di sekitar titik minat, dirancang invarian terhadap translasi, rotasi, skala, dan perubahan intensitas.
3. **Pencocokan Fitur & Penolakan Outlier (*Feature Matching & Outlier Rejection*)**: Memasangkan deskriptor antar-citra menggunakan metrik jarak (Euclidean atau Hamming), menerapkan *Lowe's Ratio Test*, dan mengeliminasi pasangan salah (*outliers*) menggunakan algoritma konsensus acak **RANSAC**.

Dalam bab ini, kita akan mempelajari prinsip matematika deteksi sudut Harris dan Shi-Tomasi, perancangan deskriptor floating-point invarian skala SIFT (*Scale-Invariant Feature Transform*), deskriptor biner teroptimasi edge computing ORB (*Oriented FAST and Rotated BRIEF*), algoritma pencocokan KNN, serta formulasi robust fitting RANSAC.

---

## 2. Learning Objectives

Setelah menuntaskan bab ini, mahasiswa dan peneliti diharapkan mampu:

1. **Memahami** konsep autokorelasi spasial dan matriks momen kedua (*second-moment matrix*) $\mathbf{M}$ dalam mendeteksi titik sudut.
2. **Menurunkan** formulasi fungsi respon Harris Corner $R = \det(\mathbf{M}) - k \cdot (\text{trace}(\mathbf{M}))^2$ dan membandingkannya dengan kriteria nilai eigen minimum Shi-Tomasi.
3. **Menganalisis** tahapan konstruksi ruang skala (*scale-space representation*) Difference of Gaussians (DoG) dan orientasi kanonikal pada algoritma SIFT.
4. **Membedakan** karakteristik komputasi antara deskriptor bernilai riil (SIFT 128D - jarak Euclidean $L_2$) dengan deskriptor biner terarah (ORB 256-bit - jarak Hamming via instruksi XOR/popcount).
5. **Menerapkan** *Lowe's Ratio Test* ($d_1 / d_2 < \tau$) untuk mengeliminasi ambiguitas korespondensi pada ruang pencocokan fitur.
6. **Menghitung** jumlah iterasi teoritis yang diperlukan oleh algoritma RANSAC untuk menjamin probabilitas keberhasilan estimasi homografi.
7. **Mengimplementasikan** pipeline pencocokan fitur lengkap dan estimasi homografi menggunakan Python dan OpenCV (`cv2.SIFT_create`, `cv2.ORB_create`, `cv2.BFMatcher`, `cv2.findHomography`).

---

## 3. Mathematical Foundations & Formulations

### 3.1 Detektor Sudut Harris (*Harris Corner Detector*)

Misalkan sebuah jendela kecil $W$ berpusat pada koordinat $(x, y)$ digeser sejauh $(\Delta u, \Delta v)$. Perubahan intensitas kuadrat rata-rata $E(\Delta u, \Delta v)$ didefinisikan sebagai:

$$
E(\Delta u, \Delta v) = \sum_{(x, y) \in W} w(x, y) \left[ I(x + \Delta u, y + \Delta v) - I(x, y) \right]^2
$$

Di mana $w(x, y)$ adalah bobot Gaussian atau jendela seragam persegi. Menggunakan ekspansi deret Taylor orde pertama:
$$
I(x + \Delta u, y + \Delta v) \approx I(x, y) + I_x \Delta u + I_y \Delta v
$$
Maka persamaan perubahan intensitas menjadi bentuk kuadratik:
$$
E(\Delta u, \Delta v) \approx \begin{bmatrix} \Delta u & \Delta v \end{bmatrix} \mathbf{M} \begin{bmatrix} \Delta u \\ \Delta v \end{bmatrix}
$$

Di mana $\mathbf{M}$ adalah **Matriks Momen Kedua (*Second-Moment Matrix / Autocorrelation Matrix*)**:

$$
\mathbf{M} = \sum_{(x, y) \in W} w(x, y) \begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix} = \begin{bmatrix} \langle I_x^2 \rangle & \langle I_x I_y \rangle \\ \langle I_x I_y \rangle & \langle I_y^2 \rangle \end{bmatrix}
$$

![Prinsip Deteksi Sudut Harris & Matriks Autokorelasi](/media/diagrams/chapter-37-harris-corner-detector.svg)
*Gambar 37.1 — Elips autokorelasi dan klasifikasi titik: daerah datar (kedua eigenvalue kecil), tepi (satu eigenvalue dominan), dan sudut (kedua eigenvalue besar). Sumber: ITERA, Lisensi CC-BY-4.0.*

Matriks simetris $\mathbf{M}$ memiliki dua nilai eigen riil non-negatif $\lambda_1, \lambda_2 \ge 0$:
- **Daerah Datar (*Flat Region*)**: $\lambda_1 \approx 0, \lambda_2 \approx 0$ (perubahan intensitas lambat di segala arah).
- **Tepi Garis (*Edge*)**: Satu eigenvalue jauh lebih besar dari yang lain ($\lambda_1 \gg \lambda_2$ atau sebaliknya; perubahan tajam hanya tegak lurus terhadap arah tepi).
- **Sudut (*Corner*)**: Kedua eigenvalue bernilai besar ($\lambda_1 \approx \lambda_2 \gg 0$; perubahan intensitas tajam di segala arah pergeseran).

Untuk menghindari komputasi dekomposisi nilai eigen yang mahal per piksel, Harris dan Stephens (1988) merumuskan fungsi respon sudut $R$:

$$
R = \det(\mathbf{M}) - k \cdot \left[ \text{trace}(\mathbf{M}) \right]^2 = (\lambda_1 \lambda_2) - k \cdot (\lambda_1 + \lambda_2)^2
$$

Di mana konstanta empiris $k \in [0.04, 0.06]$. Titik sudut dideklarasikan jika $R > T_{\text{threshold}}$ dan titik tersebut merupakan nilai maksimum lokal (*non-maximum suppression*).

---

### 3.2 Kriteria Nilai Eigen Minimum Shi-Tomasi (1994)

Shi dan Tomasi mengusulkan modifikasi kriteria seleksi titik sudut untuk pelacakan optik (*Good Features to Track*):
$$
R_{\text{Shi-Tomasi}} = \min(\lambda_1, \lambda_2) > \lambda_{\min}
$$
Secara geometris, elips autokorelasi dianggap sebagai sudut yang stabil jika sumbu minornya melebihi ambang batas toleransi derau.

---

### 3.3 SIFT: Scale-Invariant Feature Transform (Lowe, 2004)

SIFT menjamin invariansi terhadap perubahan skala dan rotasi melalui empat tahapan komputasi:
1. **Pencarian Ekstremum Ruang-Skala (*Scale-Space Extrema Detection*)**:
   Citra difilter secara konvolutif menggunakan kernel Gaussian dengan skala berjenjang $\sigma$. Selisih antar-skala berturutan menghasilkan **Difference of Gaussians (DoG)**:
   $$
   D(x, y, \sigma) = L(x, y, k\sigma) - L(x, y, \sigma) = \left[ G(x, y, k\sigma) - G(x, y, \sigma) \right] * I(x, y)
   $$
   Piksel target dibandingkan dengan 26 tetangga (8 di skala yang sama, 9 di skala atas, 9 di skala bawah) untuk menemukan kandidat titik ekstremum lokal.
2. **Lokalisasi Titik Kunci Sub-Piksel (*Keypoint Localization*)**:
   Ekstremum dihaluskan dengan aproksimasi Taylor kuadratik 3D untuk membuang titik dengan kontras rendah atau yang berada di sepanjang tepi yang tidak stabil.
3. **Penentuan Orientasi Kanonikal (*Orientation Assignment*)**:
   Menghitung magnitudo dan orientasi gradien lokal dalam jendela di sekitar titik kunci. Puncak histogram gradien 36-bin ($10^\circ$ per bin) ditetapkan sebagai sudut orientasi kanonikal $\theta_0$.
4. **Konstruksi Deskriptor 128D**:
   Area ketetanggaan $16 \times 16$ piksel dirotasikan sesuai $\theta_0$, dibagi menjadi $4 \times 4$ sub-wilayah (masing-masing berukuran $4 \times 4$ piksel). Setiap sub-wilayah menghasilkan histogram gradien 8 arah. Vektor total berukuran $4 \times 4 \times 8 = 128$ dimensi, dinormalisasi $L_2$ untuk mencapai invariansi terhadap variasi kontras dan kecerahan linear.

---

### 3.4 ORB: Oriented FAST and Rotated BRIEF (Rublee et al., 2011)

Sebagai alternatif bebas-paten dan berkecepatan tinggi untuk perangkat edge computing:
- **Detektor Oriented FAST**: Menguji 16 piksel pada lingkaran lingkaran beradius 3 di sekitar kandidat titik pusat. Arah rotasi dihitung menggunakan **momen intensitas sentroid (*intensity centroid*)**:
  $$
  m_{pq} = \sum_{x, y} x^p y^q I(x, y), \quad C = \left( \frac{m_{10}}{m_{00}}, \frac{m_{01}}{m_{00}} \right), \quad \theta = \text{atan2}(m_{01}, m_{10})
  $$
- **Deskriptor rBRIEF (256-bit)**: Membandingkan pasangan intensitas piksel biner $\tau(p; x, y) = 1$ jika $I(x) < I(y)$ dan $0$ sebaliknya. Pasangan titik dirotasikan sesuai sudut $\theta$ untuk menjamin invariansi rotasi.
- **Pencocokan**: Dilakukan menggunakan jarak Hamming (*Hamming Distance*), yang menghitung jumlah bit yang berbeda menggunakan instruksi prosesor native `__builtin_popcount` (hingga ratusan kali lebih cepat dibandingkan jarak Euclidean SIFT).

---

### 3.5 Lowe's Ratio Test untuk Penyaringan Korespondensi

Ketika mencocokkan fitur dari citra $A$ ke citra $B$, algoritma $k$-Nearest Neighbors ($k$-NN dengan $k=2$) menemukan pasangan terdekat pertama (jarak $d_1$) dan pasangan terdekat kedua (jarak $d_2$). **Lowe's Ratio Test** menyatakan bahwa kecocokan dianggap valid dan tidak ambigu jika dan hanya jika:

$$
\frac{d_1}{d_2} < \tau \quad (\text{umumnya } \tau = 0.70 - 0.75)
$$

Jika rasio mendekati 1.0, fitur tersebut memiliki representasi yang mirip di banyak lokasi (misalnya pola berulang seperti jendela gedung atau dedaunan pohon), sehingga berpotensi tinggi menjadi pasangan yang salah (*false match*).

---

### 3.6 Penolakan Outlier Menggunakan RANSAC

Pasangan korespondensi hasil pencocokan fitur selalu mengandung *outlier* akibat oklusi, perubahan sudut pandang ekstrem, atau derau sensorik. Algoritma **RANSAC (Random Sample Consensus)** mengestimasi model transformasi matematis yang konsisten melalui prosedur iteratif:

![Pencocokan Fitur & Penolakan Outlier via RANSAC](/media/diagrams/chapter-37-feature-matching-and-ransac.svg)
*Gambar 37.2 — Pipeline pencocokan fitur SIFT/ORB, Lowe's Ratio Test, dan penolakan outlier melalui fitting homografi RANSAC. Sumber: ITERA, Lisensi CC-BY-4.0.*

**Prosedur RANSAC:**
1. Pilih secara acak subset minimal titik korespondensi ($s = 4$ pasang titik untuk homografi $\mathbf{H}$, atau $s = 3$ pasang untuk afinitas).
2. Hitung kandidat matriks transformasi model $\mathbf{H}$ dari subset tersebut.
3. Evaluasi seluruh pasangan titik lainnya: hitung galat reproyeksi $\epsilon_i = \|\mathbf{x}'_i - \mathbf{H}\mathbf{x}_i\|_2$.
4. Hitung jumlah *inlier* (pasangan titik dengan $\epsilon_i < \theta_{\text{threshold}}$).
5. Ulangi proses sebanyak $N$ iterasi dan simpan model dengan jumlah inlier terbanyak.

**Jumlah Iterasi Teoritis RANSAC ($N$):**
Agar probabilitas mendapatkan setidaknya satu subset yang 100% bebas outlier bernilai $p$ (misalnya $p = 0.99$), jika rasio outlier dalam dataset adalah $\epsilon$:

$$
N = \frac{\ln(1 - p)}{\ln(1 - (1 - \epsilon)^s)}
$$

---

## 4. Step-by-Step Worked Numerical Example

### Contoh 1: Perhitungan Nilai Respon Harris Corner
Diberikan matriks autokorelasi lokal hasil estimasi gradien pada jendela piksel:
$$
\mathbf{M} = \begin{bmatrix} 42.0 & 8.0 \\ 8.0 & 35.0 \end{bmatrix}, \quad k = 0.04
$$

**Langkah 1: Hitung Determinan $\det(\mathbf{M})$**
$$
\det(\mathbf{M}) = (42.0 \times 35.0) - (8.0 \times 8.0) = 1470.0 - 64.0 = 1406.0
$$

**Langkah 2: Hitung Trace $\text{trace}(\mathbf{M})$**
$$
\text{trace}(\mathbf{M}) = 42.0 + 35.0 = 77.0
$$

**Langkah 3: Hitung Respon Harris $R$**
$$
R = \det(\mathbf{M}) - k \cdot [\text{trace}(\mathbf{M})]^2 = 1406.0 - 0.04 \times (77.0)^2 = 1406.0 - 0.04 \times 5929.0 = 1406.0 - 237.16 = 1168.84
$$
Karena $R = 1168.84 \gg 0$, titik tersebut diklasifikasikan sebagai **Sudut Valid (Corner)**.

---

### Contoh 2: Perhitungan Iterasi RANSAC untuk Estimasi Homografi
Misalkan sistem mencocokkan fitur pada pemandangan padat dengan perkiraan rasio outlier $\epsilon = 0.40$ (40% kecocokan salah). Model homografi memerlukan $s = 4$ pasang titik. Kita menginginkan tingkat keyakinan $p = 0.99$.

$$
1 - \epsilon = 0.60 \implies (1 - \epsilon)^4 = (0.60)^4 = 0.1296
$$
$$
1 - (1 - \epsilon)^4 = 1 - 0.1296 = 0.8704
$$
$$
\ln(1 - p) = \ln(1 - 0.99) = \ln(0.01) \approx -4.60517
$$
$$
\ln(0.8704) \approx -0.13881
$$
$$
N = \frac{-4.60517}{-0.13881} \approx 33.17 \implies N = 34 \text{ iterasi}
$$
Artinya, hanya diperlukan **34 iterasi acak** untuk menjamin 99% kepastian menemukan model homografi bebas outlier.

---

## 5. Failure Mode & Edge Case Analysis

1. **Skala Ekstrem (> 4x zoom)**: SIFT memiliki batas invariansi skala hingga $\approx 4\times$, sedangkan ORB lebih rentan pada variasi skala besar jika piramida skala kurang padat.
2. **Pola Tekstur Repetitif (Jendela Gedung, Kisi Pagar)**: Lowe's ratio test dapat menolak titik-titik ini karena $d_1 \approx d_2$, menyebabkan kegagalan pencocokan pada struktur arsitektural.
3. **Motion Blur & Perubahan Iluminasi Non-Linear**: Derau kabur akibat kecepatan kamera (*motion blur*) menghilangkan gradien frekuensi tinggi, menurunkan jumlah titik kunci yang terdeteksi.

---

## 6. Summary & Key Takeaways

1. **Harris Corner** mendeteksi sudut berbasis autokorelasi gradien lokal tanpa memerlukan pencarian ruang skala.
2. **SIFT** menyediakan deskriptor 128D invarian skala dan rotasi berkemampuan tinggi dengan trade-off komputasi lebih berat.
3. **ORB** mengombinasikan FAST dan rBRIEF menghasilkan deskriptor biner 256-bit berkecepatan tinggi yang ideal untuk sistem edge vision.
4. **Lowe's Ratio Test** dan **RANSAC** adalah kombinasi standar industri untuk menjamin keabsahan korespondensi geometris.

---

## 7. Academic References

1. **Lowe, D. G. (2004).** *Distinctive Image Features from Scale-Invariant Keypoints*. International Journal of Computer Vision (IJCV), 60(2), 91-110. [DOI: 10.1023/B:VISI.0000029664.99615.94](https://doi.org/10.1023/B:VISI.0000029664.99615.94).
2. **Rublee, E., Rabaud, V., Konolige, K., & Bradski, G. (2011).** *ORB: An efficient alternative to SIFT or SURF*. IEEE International Conference on Computer Vision (ICCV), 2564-2571. [DOI: 10.1109/ICCV.2011.6126544](https://doi.org/10.1109/ICCV.2011.6126544).
3. **Fischler, M. A., & Bolles, R. C. (1981).** *Random Sample Consensus: A Paradigm for Model Fitting with Applications to Image Analysis and Automated Cartography*. Communications of the ACM, 24(6), 381-395. [DOI: 10.1145/358669.358692](https://doi.org/10.1145/358669.358692).
4. **Harris, C., & Stephens, M. (1988).** *A Combined Corner and Edge Detector*. Alvey Vision Conference, 15(50), 147-151.
