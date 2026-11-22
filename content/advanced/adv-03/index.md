# MODUL ADV-03: SISTEM PELACAKAN VISUAL & MULTI-OBJECT TRACKING (MOT) KOKOH
## State-Space Estimation, Bipartite Association, and Occlusion Recovery

**Kode Modul:** `ADV-03`  
**Level Akademik:** L3 — Advanced Curriculum  
**Pilar Riset:** Pillar 1 — Intelligent Computer Vision & Pillar 2 — Robust Visual Perception  
**Estimasi Beban Belajar:** 16 Jam (Teori, Filter Kalman, Asosiasi Data, dan Evaluasi HOTA)  
**Prasyarat Kurikulum Inti:** Bab 30 (Optical Flow & Estimasi Gerak), Bab 31 (Background Subtraction), Bab 32 (Dasar Pelacakan Objek), Bab 33 (Multi-Object Tracking), Bab 37 (Deteksi & Pencocokan Fitur), Bab 44 (Deteksi Objek YOLO), Bab 50 (Evaluasi Model Visi), Modul ADV-01 (Kalkulus Matriks & Kovarians)

---

## 1. Konteks Akademik & Tujuan Pembelajaran

Pelacakan objek jamak (*Multi-Object Tracking* / MOT) dalam ranah Computer Vision modern telah berevolusi dari pencocokan titik berbasis template sederhana menjadi sistem inferensi temporal yang canggih (*tracking-by-detection*). Dalam skenario dunia nyata—seperti pemantauan lalu lintas jalan raya Sumatera di bawah cuaca tropis atau pengawasan maritim pelabuhan—tantangan utama mencakup:
1. **Oklusi Spasial Ekstrem:** Objek saling menutupi satu sama lain secara dinamis.
2. **Ketidakpastian Sensor:** Deteksi neural yang terlewat (*missed detections* / $\text{FN}$) dan alarm palsu (*false positives* / $\text{FP}$).
3. **Pergantian Identitas (Identity Switches / IDSW):** Kesalahan asosiasi data saat dua target berpapasan.
4. **Gerak Kamera (Ego-Motion):** Jitter kamera statis atau pergerakan drone yang mengacaukan model kecepatan konstan.

Modul ini mengembangkan pemahaman matematis dan praktis mengenai:
- Formulasi Bayes minimum mean square error (*MMSE*) pada Filter Kalman (*KF*), *Extended Kalman Filter* (*EKF*), dan *Unscented Kalman Filter* (*UKF*).
- Teori optimasi kombinatorial untuk asosiasi data bipartit (Algoritma Hungarian dan *Greedy Mahalanobis Gating*).
- Arsitektur modern SOTA: *SORT*, *DeepSORT*, *ByteTrack* (asosiasi bertingkat deteksi berkeyakinan rendah), dan *BoT-SORT* (*Camera Motion Compensation*).
- Metrik evaluasi terstandarisasi: *HOTA* (*Higher Order Tracking Accuracy*), *IDF1*, dan *MOTA*.

---

## 2. Penurunan Matematis & Teori Estimasi State-Space

### 2.1 Model Kinematika Ruang Keadaan Linier (State-Space Model)

Kita merepresentasikan keadaan dinamik sebuah target pembatas 2D pada waktu $t$ sebagai vektor keadaan (*state vector*):
$$\mathbf{x}_t = [x, y, a, h, \dot{x}, \dot{y}, \dot{a}, \dot{h}]^T \in \mathbb{R}^8$$
di mana $(x, y)$ adalah koordinat pusat bounding box, $a = w/h$ adalah rasio aspek (*aspect ratio*), $h$ adalah tinggi bounding box, dan entri bertitik menyatakan turunan temporal (kecepatan).

#### Model Transisi Keadaan (State Transition Equation)
Dengan asumsi kecepatan konstan dalam interval waktu $\Delta t$:
$$\mathbf{x}_t = F \mathbf{x}_{t-1} + \mathbf{w}_t, \quad \mathbf{w}_t \sim \mathcal{N}(\mathbf{0}, Q)$$
di mana matriks transisi keadaan $F \in \mathbb{R}^{8 \times 8}$ berbentuk:
$$F = \begin{bmatrix} I_4 & \Delta t \cdot I_4 \\ \mathbf{0}_4 & I_4 \end{bmatrix}$$
dan $Q \in \mathbb{R}^{8 \times 8}$ adalah matriks kovarians derau proses (*process noise covariance*).

#### Model Pengukuran (Measurement Equation)
Detektor objek menghasilkan kotak pembatas teramati $\mathbf{z}_t = [z_x, z_y, z_a, z_h]^T \in \mathbb{R}^4$:
$$\mathbf{z}_t = H \mathbf{x}_t + \mathbf{v}_t, \quad \mathbf{v}_t \sim \mathcal{N}(\mathbf{0}, R)$$
di mana matriks observasi adalah $H = [I_4 \quad \mathbf{0}_4] \in \mathbb{R}^{4 \times 8}$, dan $R \in \mathbb{R}^{4 \times 4}$ adalah matriks kovarians derau sensor.

---

### 2.2 Penurunan Analitis Persamaan Filter Kalman 2D

Filter Kalman menghasilkan estimasi keadaan optimal tak-bias dengan varians minimal (*BLUE - Best Linear Unbiased Estimator*).

#### 1. Tahap Prediksi (Time Update)
Memproyeksikan keadaan dan ketidakpastian ke waktu berikutnya:
$$\hat{\mathbf{x}}_{t|t-1} = F \hat{\mathbf{x}}_{t-1|t-1}$$
$$P_{t|t-1} = F P_{t-1|t-1} F^T + Q$$
*Catatan:* Pada tahap prediksi murni (misalnya saat terjadi oklusi tanpa adanya pengukuran), kovarians ketidakpastian $P_{t|t-1}$ secara monoton membesar akibat penambahan $Q$.

#### 2. Tahap Pembaruan (Measurement Update)
Ketika detektor neural menghasilkan pengukuran $\mathbf{z}_t$:
- **Inovasi Pengukuran (Residual):**
  $$\mathbf{y}_t = \mathbf{z}_t - H \hat{\mathbf{x}}_{t|t-1}$$
- **Kovarians Inovasi:**
  $$S_t = H P_{t|t-1} H^T + R$$
- **Penguatan Kalman Optimal (Kalman Gain):**
  $$K_t = P_{t|t-1} H^T S_t^{-1}$$
- **Pembaruan Keadaan Terkoreksi:**
  $$\hat{\mathbf{x}}_{t|t} = \hat{\mathbf{x}}_{t|t-1} + K_t \mathbf{y}_t$$
- **Pembaruan Kovarians Keadaan:**
  $$P_{t|t} = (I - K_t H) P_{t|t-1}$$

---

### 2.3 Asosiasi Data Bipartit & Mahalanobis Gating

Dalam skenario multi-target dengan $N$ track aktif dan $M$ deteksi baru, kita harus menentukan pasangan optimal $(i, j)$ antara track $i$ dan deteksi $j$.

#### Matriks Biaya Jarak Mahalanobis
Jarak statistik berbobot kovarians inovasi $S_i$:
$$d_M^2(i, j) = (\mathbf{z}_j - H \hat{\mathbf{x}}_i)^T S_i^{-1} (\mathbf{z}_j - H \hat{\mathbf{x}}_i)$$

#### Ambang Batas Gating
Karena $d_M^2 \sim \chi^2_4$ (untuk pengukuran 4D), kita menetapkan ambang batas gating $\gamma$ (misalnya $\gamma = 9.488$ untuk interval kepercayaan 95%):
$$C_{ij} = \begin{cases} d_M^2(i, j) & \text{jika } d_M^2(i, j) \le \gamma \\ \infty & \text{jika } d_M^2(i, j) > \gamma \end{cases}$$

#### Optimasi Penugasan Bipartit: Hungarian vs. Greedy Heuristic
Masalah penugasan global (Linear Sum Assignment Problem / LSAP) dirumuskan untuk meminimalkan jumlah total biaya kecocokan:
$$\min_{X} \sum_{i=1}^N \sum_{j=1}^M C_{ij} X_{ij} \quad \text{s.t.} \quad \sum_{j=1}^M X_{ij} \le 1, \; \sum_{i=1}^N X_{ij} \le 1, \; X_{ij} \in \{0, 1\}$$

Secara fundamental, terdapat dua pendekatan yang sering digunakan dengan karakteristik komputasi dan penjaminan matematis yang berbeda:

1. **Greedy Association Heuristic ($\mathcal{O}(N \cdot M \cdot \min(N, M))$):**
   - Bekerja secara miopik dengan memilih pasangan $(i, j)$ yang memiliki elemen biaya terkecil secara berulang, lalu menghapus baris $i$ dan kolom $j$ dari pencarian berikutnya.
   - **Kelemahan Matematis:** Tidak menjamin tercapainya minimum global. Pada matriks counterexample:
     $$C = \begin{bmatrix} 1 & 2 \\ 2 & 100 \end{bmatrix}$$
     Pendekatan greedy memilih pasangan pertama $(0, 0)$ berbiaya $1$, yang kemudian memaksa pasangan kedua $(1, 1)$ berbiaya $100$, menghasilkan total biaya $1 + 100 = \mathbf{101}$.

2. **Hungarian / Kuhn-Munkres Algorithm ($\mathcal{O}(\max(N, M)^3)$):**
   - Menyelesaikan LSAP secara eksak dan menjamin diperolehnya penugasan dengan jumlah biaya minimum global melalui primal-dual alternating augmenting paths dengan variabel potensial $u_i + v_j \le C_{ij}$.
   - Pada matriks counterexample di atas, Hungarian memilih pasangan $(0, 1)$ berbiaya $2$ dan $(1, 0)$ berbiaya $2$, menghasilkan total biaya $2 + 2 = \mathbf{4}$ (jauh lebih optimal dibanding greedy).

3. **Batasan Riset Nyata (Why Hungarian Doesn't Guarantee Perfect Tracking):**
   - Meskipun Hungarian menjamin minimisasi objektif biaya $\sum C_{ij} X_{ij}$, algoritma ini *tidak menjamin akurasi pelacakan end-to-end (HOTA/MOTA) 100%*.
   - Jika matriks biaya $C_{ij}$ memiliki galat pemodelan (misalnya deteksi palsu / false alarm, oklusi sebagian yang menggeser titik tengah bounding box, atau manuver tajam target), Hungarian akan tetap memaksakan minimisasi biaya matematis yang bisa saja memasangkan track ke deteksi yang keliru (memicu Identity Switch).
   - Oleh karena itu, arsitektur pelacak modern seperti **ByteTrack** dan **BoT-SORT** menerapkan penugasan dua tahap (first-stage high-confidence detections, second-stage low-confidence recovery), kompensasi gerak kamera (GMC), dan fitur representasi penampilan visual (Re-ID embeddings) untuk menjaga integritas lintasan.

---

### 2.4 Metodologi Evaluasi Terstandarisasi: HOTA, MOTA, dan IDF1

Penilaian performa MOT tidak boleh hanya menghitung persentase frame yang terdeteksi, melainkan harus mengevaluasi kontinuitas temporal identitas.

#### HOTA (Higher Order Tracking Accuracy)
Dirumuskan oleh Luiten et al. (IJCV 2021) untuk menyeimbangkan performa deteksi dan akurasi asosiasi secara matematis:
$$\text{HOTA}_\alpha = \sqrt{\text{DetA}_\alpha \cdot \text{AssA}_\alpha}$$
$$\text{HOTA} = \int_0^1 \text{HOTA}_\alpha \, d\alpha$$
di mana:
- **Detection Accuracy (DetA):** $\text{DetA} = \frac{|\text{TP}|}{|\text{TP}| + |\text{FN}| + |\text{FP}|}$
- **Association Accuracy (AssA):** Mengukur seberapa konsisten ID yang sama dipelihara sepanjang rentang waktu lintasan.

---

## 3. Contoh Numerik Terhitung (Worked Example)

Diberikan sebuah track 1D dengan posisi $x = 100$, kecepatan $v = 10$, dan ketidakpastian posisi $P = 4.0$. Interval waktu $\Delta t = 1.0$, derau proses $Q = 1.0$, dan derau sensor $R = 2.0$.

1. **Prediksi Keadaan:**
   $$\hat{x}_{t|t-1} = x + v \cdot \Delta t = 100 + 10 \cdot 1.0 = 110.0$$
   $$P_{t|t-1} = P + Q = 4.0 + 1.0 = 5.0$$
2. **Sensor Mengamati Pengukuran:** $z = 114.0$.
3. **Inovasi & Kovarians Inovasi:**
   $$y = z - \hat{x}_{t|t-1} = 114.0 - 110.0 = 4.0$$
   $$S = P_{t|t-1} + R = 5.0 + 2.0 = 7.0$$
4. **Kalman Gain:**
   $$K = \frac{P_{t|t-1}}{S} = \frac{5.0}{7.0} \approx 0.7143$$
5. **Pembaruan Keadaan & Kovarians:**
   $$\hat{x}_{t|t} = \hat{x}_{t|t-1} + K \cdot y = 110.0 + 0.7143 \cdot 4.0 = 112.857$$
   $$P_{t|t} = (1 - K) P_{t|t-1} = (1 - 0.7143) \cdot 5.0 = 0.2857 \cdot 5.0 = 1.4286$$
   *Hasil:* Ketidakpastian berkurang dari $5.0$ menjadi $1.43$, dan posisi terkoreksi secara optimal di antara prediksi ($110$) dan pengukuran sensor ($114$).

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

### 4.1 Tujuan Eksperimen
Membangun pipeline pelacakan multi-objek sintetis deterministik untuk mengukur tingkat pergantian identitas (*ID Switches*) dan galat RMS lokalisasi di bawah variasi probabilitas deteksi $P_D \in [0.5, 1.0]$ dan oklusi dinamis.

### 4.2 Formulasi Algoritma
1. Bangkitkan $N=4$ lintasan target dengan dinamika kinematic acak.
2. Simulasikan deteksi sensor dengan derau Gauss $\sigma_z = 5.0$ piksel dan probabilitas deteksi $P_D = 0.85$.
3. Terapkan filter Kalman 2D untuk memprediksi posisi tiap track.
4. Lakukan asosiasi data bipartit optimal Hungarian (Kuhn-Munkres) dengan perbandingan terverifikasi terhadap pendekatan greedy pada ambang batas gating 40 piksel.
5. Hitung metrik: Total ID Switches, Mean Localization Error, dan Fragmentasi Lintasan.

---

## 5. Hubungan dengan Jalur Penelitian (Research Connections)

- **Track R02 (Robust Multi-Object Tracking):** Merupakan materi prasyarat utama untuk mereproduksi *ByteTrack*, *BoT-SORT*, dan *OC-SORT* pada benchmark MOT17/MOT20.
- **Track R01 (Intelligent Visual Detection):** Output deteksi bounding box dan estimasi ketidakpastian langsung menjadi input pengukuran $z$ pada filter pelacak.
- **Track R03 (Robust Perception):** Ketika cuaca buruk (hujan/kabut) menyebabkan $P_D$ anjlok drastis, model penanganan oklusi jangka panjang modul ini menjadi penentu kontinuitas pelacakan.

