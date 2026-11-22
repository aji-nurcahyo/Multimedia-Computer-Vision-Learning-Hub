# MODUL ADV-06: PERSEPSI VISUAL KOKOH DALAM KONDISI BURUK
## Atmospheric Scattering, Physics-Informed Restoration, and Uncertainty Calibration

**Kode Modul:** `ADV-06`  
**Level Akademik:** L3 — Advanced Curriculum  
**Pilar Riset:** Pillar 2 — Intelligent Visual Perception & Sensing (ISVWS 2026–2040)  
**Estimasi Beban Belajar:** 16 Jam (Teori, Model Transfer Radiasi, Restorasi Citra, dan Kalibrasi ECE)  
**Prasyarat Kurikulum Inti:** Bab 08 (Peningkatan Citra & Kontras), Bab 10 (Filtering Spasial & Konvolusi), Bab 11 (Pemrosesan Domain Frekuensi), Bab 12 (Restorasi Citra & Reduksi Derau), Bab 41 (Dasar Deep Learning), Bab 44 (Deteksi Objek YOLO), Bab 50 (Evaluasi Model Visi Lanjut), Modul ADV-01 (Kalkulus & Kovarians)

---

## 1. Konteks Akademik & Prioritas Regional Sumatera

Sistem Computer Vision konvensional biasanya dilatih dan dievaluasi pada dataset ideal dalam ruangan atau di bawah pencahayaan cerah (*clear sunny days*). Namun, ketika diimplementasikan pada skenario operasional nyata di wilayah tropis Indonesia—seperti Sumatera—persepsi visual mengalami degradasi fisik parah:
1. **Hujan Badai Tropis (Torrential Monsoon Rain):** Guratan hujan (*rain streaks*) dan dispersi tetesan air pada lensa membiaskan cahaya serta menghapus gradien tepi objek.
2. **Kabut & Asap Lahan Gambut (Dense Peatland Haze):** Partikel aerosol di udara menyebarkan foton cahaya, menurunkan kontras visual secara eksponensial terhadap jarak kedalaman.
3. **Pencahayaan Redup & Silau Malam Hari (Low-Light & Glare):** Rentang dinamis sensor kamera kewalahan menghadapi bayangan pekat di perkebunan sawit berpadu dengan sorot lampu kendaraan berlebih (*specular flare*).
4. **Ketidakpastian Model Berbahaya (Overconfidence):** Detektor neural menghasilkan prediksi salah dengan tingkat keyakinan tinggi (*high-confidence misclassifications*) akibat pergeseran domain (*distribution shift*).

Modul ini mempelajari:
- Fisika pembentukan citra di bawah media penghambur menggunakan **Model Koschmieder**.
- Metode restorasi tak-berpasangan berbasis prior fisik: **Dark Channel Prior (DCP)** dan **Retinex Theory**.
- Pengukuran keandalan prediksi neural melalui **Expected Calibration Error (ECE)** dan **Temperature Scaling**.
- Analisis kegagalan empiris: Menjelaskan mengapa peningkatan metrik restorasi (PSNR/SSIM) **tidak serta-merta** meningkatkan akurasi deteksi hilir (*downstream object detection*).

---

## 2. Penurunan Matematis & Model Transfer Radiasi

### 2.1 Model Penghamburan Atmosfer Koschmieder (Atmospheric Scattering Law)

Untuk memodelkan degradasi visual akibat kabut, asap, atau partikel aerosol, hukum transfer radiasi Koschmieder (1924) memformulasikan intensitas teramati $I(\mathbf{x})$ pada piksel $\mathbf{x} = (u, v)$ sebagai:
$$I(\mathbf{x}) = J(\mathbf{x}) t(\mathbf{x}) + A (1 - t(\mathbf{x}))$$
di mana:
- $J(\mathbf{x}) \in [0, 1]^3$: Radiansi pemandangan asli yang bersih (*clean scene radiance* yang ingin direkonstruksi).
- $t(\mathbf{x}) \in [0, 1]$: Peta transmisi medium (*transmission map*), menyatakan proporsi cahaya yang mencapai lensa kamera tanpa terhambur.
- $A \in [0, 1]^3$: Vektor cahaya atmosfer global (*global atmospheric airlight*), mencerminkan warna dan intensitas kabut di horizon.

#### Peta Transmisi terhadap Kedalaman
Dalam medium atmosfer homogen, transmisi meluruh secara eksponensial terhadap kedalaman pemandangan $d(\mathbf{x})$:
$$t(\mathbf{x}) = \exp(-\beta \, d(\mathbf{x}))$$
di mana $\beta$ adalah koefisien penghamburan (*scattering coefficient*). Semakin jauh objek ($d \rightarrow \infty$), transmisi mendekati nol ($t \rightarrow 0$), sehingga citra teramati didominasi oleh cahaya kabut $A$.

#### Rekonstruksi Radiansi Asli
Jika peta transmisi $t(\mathbf{x})$ dan airlight $A$ diketahui, radiansi asli dapat dipulihkan secara inversi analitis:
$$J(\mathbf{x}) = \frac{I(\mathbf{x}) - A}{\max(t(\mathbf{x}), t_0)} + A$$
di mana $t_0 \approx 0.1$ adalah batas ambang bawah pengaman (*lower bound*) untuk mencegah amplifikasi derau tak berhingga pada daerah yang sangat jauh.

---

### 2.2 Dark Channel Prior (He et al., TPAMI 2011)

Pada citra luar ruangan yang bersih tanpa kabut, pada sebagian besar daerah non-langit, setidaknya ada satu kanal warna (R, G, atau B) yang memiliki intensitas piksel sangat rendah mendekati nol:
$$J^{\text{dark}}(\mathbf{x}) = \min_{c \in \{R, G, B\}} \left( \min_{\mathbf{y} \in \Omega(\mathbf{x})} J^c(\mathbf{y}) \right) \approx 0$$
di mana $\Omega(\mathbf{x})$ adalah jendela spasial lokal di sekitar piksel $\mathbf{x}$.

#### Estimasi Transmisi Menggunakan Dark Channel
Bagi model Koschmieder dengan airlight $A^c$:
$$\frac{I^c(\mathbf{y})}{A^c} = t(\mathbf{x}) \frac{J^c(\mathbf{y})}{A^c} + (1 - t(\mathbf{x}))$$
Dengan mengaplikasikan operator minimum spasial dan minimum kanal warna pada kedua sisi:
$$\min_{c} \left( \min_{\mathbf{y} \in \Omega(\mathbf{x})} \frac{I^c(\mathbf{y})}{A^c} \right) = t(\mathbf{x}) \underbrace{\min_c \left( \min_{\mathbf{y} \in \Omega(\mathbf{x})} \frac{J^c(\mathbf{y})}{A^c} \right)}_{\approx 0} + (1 - t(\mathbf{x}))$$
Maka estimasi transmisi diperoleh secara langsung:
$$\tilde{t}(\mathbf{x}) = 1 - \omega \min_{c \in \{R,G,B\}} \left( \min_{\mathbf{y} \in \Omega(\mathbf{x})} \frac{I^c(\mathbf{y})}{A^c} \right)$$
di mana $\omega \approx 0.95$ adalah faktor pengali untuk mempertahankan sedikit kedalaman atmosfer alami (*aerial perspective*).

---

### 2.3 Teori Retinex untuk Citra Redup Ekstrem (Low-Light)

Menurut teori Retinex (Land & McCann, 1971), citra teramati $S(\mathbf{x})$ dapat didekomposisi menjadi perkalian antara iluminasi lingkungan $L(\mathbf{x})$ dan reflektansi intrinsik objek $R(\mathbf{x})$:
$$S(\mathbf{x}) = L(\mathbf{x}) \cdot R(\mathbf{x})$$
- $R(\mathbf{x})$: Sifat fisik material permukaan (invarian terhadap pencahayaan).
- $L(\mathbf{x})$: Distribusi cahaya sekitar (bervariasi lambat secara spasial / *smooth*).

Tujuan restorasi citra malam hari adalah mengestimasi peta iluminasi $L(\mathbf{x})$ dan mengkompensasinya sehingga reflektansi $R(\mathbf{x})$ dapat teramati dengan kontras tinggi tanpa memperbesar derau sensor secara berlebihan.

---

### 2.4 Kalibrasi Ketidakpastian Neural & Expected Calibration Error (ECE)

Sebuah model klasifikasi atau deteksi dikatakan terkalibrasi (*calibrated*) jika probabilitas keyakinan (*confidence*) $\hat{p} \in [0, 1]$ mencerminkan probabilitas kebenaran empirisnya:
$$\mathbb{P}(\hat{Y} = Y \mid \hat{P} = p) = p, \quad \forall p \in [0, 1]$$

#### Perhitungan ECE (Expected Calibration Error)
Untuk mengukur derajat kesalahan kalibrasi, rentang keyakinan $[0, 1]$ dibagi menjadi $M$ bin berjarak seragam $B_1, B_2, \dots, B_M$.
$$\text{acc}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} \mathbf{1}(\hat{y}_i = y_i)$$
$$\text{conf}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} \hat{p}_i$$
Nilai **Expected Calibration Error (ECE)** didefinisikan sebagai rata-rata tertimbang selisih absolut antara akurasi empiris dan keyakinan:
$$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \big| \text{acc}(B_m) - \text{conf}(B_m) \big|$$

#### Temperature Scaling (Guo et al., ICML 2017)
Kalibrasi pasca-latih termudah dan paling efektif adalah memperkenalkan skalar temperatur $T > 0$ pada vektor logit $\mathbf{z}$:
$$\hat{p}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$
- Jika $T > 1$: Distribusi probabilitas menjadi lebih halus, menurunkan overconfidence pada sampel di luar distribusi (*out-of-distribution*).

---

## 3. Contoh Numerik Terhitung (Worked Example)

Diberikan sebuah piksel pada jarak $d = 2.0$ km dengan koefisien kabut $\beta = 0.5 \text{ km}^{-1}$. Radiansi asli bernilai $J = [50, 120, 200]$ (RGB) dan cahaya atmosfer $A = [220, 220, 220]$.

1. **Hitung Transmisi:**
   $$t = \exp(-\beta \cdot d) = \exp(-0.5 \cdot 2.0) = \exp(-1.0) \approx 0.3679$$
2. **Hitung Citra Teramati $I$ (Koschmieder Model):**
   - Kanal Merah: $I_R = 50 \cdot 0.3679 + 220 \cdot (1 - 0.3679) = 18.395 + 139.062 = 157.46 \approx 157$
   - Kanal Hijau: $I_G = 120 \cdot 0.3679 + 220 \cdot (1 - 0.3679) = 44.148 + 139.062 = 183.21 \approx 183$
   - Kanal Biru: $I_B = 200 \cdot 0.3679 + 220 \cdot (1 - 0.3679) = 73.580 + 139.062 = 212.64 \approx 213$
3. **Analisis Efek:**
   Piksel asli yang memiliki warna dominan biru $(50, 120, 200)$ terdegradasi menjadi abu-abu keputihan $(157, 183, 213)$, menghilangkan kontras warna sebesar $> 60\%$.
4. **Restorasi Inversi:**
   $$J_R = \frac{157.46 - 220}{0.3679} + 220 = \frac{-62.54}{0.3679} + 220 = -170.0 + 220 = 50.0 \quad \text{(Sempurna terpulihkan)}$$

---

## 4. Panduan Eksperimen Terpandu (Tier B Guided Experiment)

### 4.1 Tujuan Eksperimen
Mengevaluasi degradasi performa deteksi dan kalibrasi probabilitas pada citra sintetis yang dipengaruhi kabut Koschmieder dan derau sensor, serta membandingkan kualitas restorasi PSNR/SSIM terhadap Dark Channel Prior.

### 4.2 Formulasi Algoritma
1. Ambil citra uji referensi bersih $J \in [0, 255]^{H \times W \times 3}$.
2. Bangkitkan peta kedalaman sintetis linier $d(x, y)$ dan hitung transmisi $t(x, y) = \exp(-\beta \cdot d(x, y))$.
3. Sintesiskan citra terdegradasi $I = J \odot t + A \odot (1 - t) + \mathcal{N}(0, \sigma^2)$.
4. Terapkan algoritma Dark Channel Prior untuk mengestimasi transmisi $\tilde{t}$ dan pulihkan $\hat{J}$.
5. Hitung metrik PSNR, SSIM, dan Expected Calibration Error (ECE).

---

## 5. Hubungan dengan Jalur Penelitian (Research Connections)

- **Track R03 (Robust Perception in Adverse Environments):** Fondasi teoritis langsung untuk mengkurasi dan menguji *Sumatera Tropical Vision Benchmark (STVB)*.
- **Track R01 (Visual Detection):** Memberikan pemahaman domain-shift untuk merancang modul *Adverse-Aware Feature Pyramid Networks*.
- **Track R02 (Multi-Object Tracking):** Menyediakan mekanisme kompensasi penurunan kualitas deteksi pada cuaca buruk untuk mencegah fragmentasi track.

