# SILABUS KURIKULUM PENELITIAN JALUR R03 (L4 RESEARCH-READY)
## Robust Visual Perception in Adverse Environments
### Atmospheric Scattering, Monsoon Restoration, and Safety-Critical Calibration

**Kode Jalur:** R03  
**Kategori:** Primary Academic Anchor  
**Pilar:** Pilar 2: Intelligent Visual Perception & Sensing  
**Target Akademik:** L4 — Research-Ready (Persiapan Publikasi IEEE TIP / WACV / IEEE Sensors / CVPR Workshops)  
**Institusi Penyelenggara:** Institut Teknologi Sumatera (ITERA)  
**Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Penyelarasan Strategis:** Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  

---

### 1. Taksonomi Masalah Penelitian (Research Problem Taxonomy)
Persepsi visual pada lingkungan terdegradasi dikelompokkan ke dalam empat domain fisika-optik:
1. **Hamburan Partikel Atmosfer (Atmospheric Aerosol Scattering):** Partikel aerosol, kabut asap pembakaran lahan gambut, dan uap air maritim menyerap dan menghamburkan foton cahaya, menyebabkan pelemahan eksponensial kontras pemandangan (*direct attenuation*) dan penambahan cahaya hamburan udara (*airlight*).
2. **Degradasi Hujan Tropis Ekstrem (Monsoon Rain & Water Streaks):** Jejak tetesan air hujan (*rain streaks*) menghasilkan oklusi spasial acak dan distorsi refraksi cahaya, diperparah oleh akumulasi kabut uap hujan (*rain accumulation / veiling effect*).
3. **Pencahayaan Rendah & Rentang Dinamis Ekstrem (Low-Light & High Dynamic Range):** Foton terbatas memicu rasio sinyal terhadap derau (*Signal-to-Noise Ratio - SNR*) yang sangat rendah, memicu derau sensor Poisson-Gaussian berat dan hilangnya gradien tekstur pada area gelap gulita.
4. **Pergeseran Distribusi & Ketidakpastian Kalibrasi (Distribution Shift & Miscalibration):** Model deep learning standar yang dilatih pada citra cerah mengalami penurunan kepercayaan (*overconfident mispredictions*) ketika diuji pada cuaca buruk, menghasilkan nilai Expected Calibration Error (ECE) yang membahayakan sistem otonom kritis keselamatan.

Fokus penelitian R03 ditujukan pada: **Pemodelan transfer radiatif terpandu fisika (*physics-guided restoration*) dan kalibrasi ketidakpastian keselamatan pada kondisi cuaca maritim tropis Sumatera.**

---

### 2. Latar Belakang Ilmiah & SOTA Gap (Scientific Background)
Secara historis, komunitas pengolahan citra mengevaluasi algoritma restorasi (dehazing, deraining, low-light enhancement) berdasarkan metrik fidelitas rekonstruksi sinyal piksel murni seperti Peak Signal-to-Noise Ratio (PSNR) dan Structural Similarity (SSIM). Namun, penelitian mutakhir membuktikan adanya **paradoks restorasi-deteksi (*restoration-detection paradox*)**: model restorasi yang menghasilkan skor PSNR tertinggi sering kali menerapkan *over-smoothing* spasial yang menghapus detail tepi frekuensi tinggi (*high-frequency edge gradients*). Akibatnya, ketika citra yang telah "diperbaiki" tersebut dimasukkan ke dalam detektor objek hilir (misalnya YOLO atau Faster R-CNN), akurasi deteksi justru mengalami penurunan drastis atau menghasilkan deteksi halusinasi. Celah riset fundamental adalah: bagaimana merancang kerangka pembelajaran terpadu yang memulihkan keterlihatan optik sekaligus memaksimalkan akurasi dan kalibrasi probabilitas deteksi hilir.

---

### 3. Kajian Literatur & Paper Kunci (Key Literature & Citations)
- **Fondasional Pemodelan Fisika:**
  - Koschmieder, H. "Theorie der horizontalen Sichtweite." *Beiträge zur Physik der freien Atmosphäre 1924*. (Hukum fisik atenuasi atmosfer).
  - He, K., Sun, J., and Tang, X. "Single Image Haze Removal Using Dark Channel Prior." *IEEE TPAMI 2011*. (Prior statistik kanal gelap).
  - Land, E. H. "The Retinex Theory of Color Vision." *Scientific American 1977*. (Dekomposisi reflektansi dan iluminasi).
- **Restorasi Terkini & Deep Learning:**
  - Li, B., et al. "Benchmarking Single-Image Dehazing and Beyond." *IEEE TIP 2018*. (Benchmark RESIDE SOTS).
  - Guo, C., et al. "Zero-Reference Deep Curve Estimation for Low-Light Image Enhancement (Zero-DCE)." *CVPR 2020*. (Peningkatan kontras tanpa pasangan data ground-truth).
  - Sakaridis, C., et al. "Condition-Invariant Semantic Segmentation: From Daytime to Night." *IEEE TPAMI 2021*. (Benchmark Dark Zurich dan ACDC).
- **Kalibrasi Keandalan & Ketahanan:**
  - Hendrycks, D., and Dietterich, T. "Benchmarking Neural Network Robustness to Common Corruptions and Perturbations." *ICLR 2019*. (Metrik Mean Corruption Error - mCE).
  - Guo, C., et al. "On Calibration of Modern Neural Networks." *ICML 2017*. (Fondasi formal Expected Calibration Error - ECE).

---

### 4. Pertanyaan Penelitian & Hipotesis Teruji (Research Questions & Hypotheses)
- **Research Question 1 (RQ1):** Apakah restorasi berbasis hukum radiatif Koschmieder yang digabungkan secara diferensial dengan fungsi kerugian deteksi mampu melampaui restorasi terpisah dalam hal mean Average Precision (mAP) dan Expected Calibration Error (ECE)?
- **Hipotesis ($H_1$):** Kerangka pembelajaran terpadu (*Joint Restoration and Detection*) yang membatasi atenuasi transmisi optik meningkatkan mAP deteksi hilir minimal sebesar $+5.0\%$ pada data kabut tebal level 4–5 dan menurunkan ECE di bawah $0.06$, dibandingkan strategi sekuensial (restorasi terpisah diikuti detektor beku) pada taraf signifikansi $\alpha = 0.05$ ($N \ge 3$ seeds).
- **Hipotesis Nol ($H_0$):** Restorasi terpandu fisika tidak memberikan perbaikan signifikan terhadap deteksi hilir dibandingkan detektor langsung yang dilatih dengan augmentasi data derau.

---

### 5. Pemilihan & Audit Provenansi Dataset (Dataset Provenance & Audit)
1. **RESIDE Benchmark (Synthetic & Real Haze):**
   - URL Resmi: `https://sites.google.com/view/reside-dehaze-datasets`
   - Lisensi: Academic Research Non-Commercial Use.
   - Subset SOTS (Synthetic Objective Testing Set): 500 citra uji outdoor dengan ground-truth citra cerah dan peta kedalaman (*depth maps*).
2. **Dark Zurich & ACDC (Adverse Conditions Dataset with Correspondences):**
   - Karakteristik: Pasangan citra malam, kabut, dan hujan dengan korespondensi GPS lokasi yang sama pada siang hari cerah.
   - Lisensi: CC-BY-NC-SA 4.0.

---

### 6. Standar Evaluasi Ground-Truth (Ground-Truth Evaluation Standards)
- **Evaluasi Piksel Restorasi:** Memerlukan registrasi spasial piksel-ke-piksel yang sempurna antara citra bersih $J(x)$ dan citra terdegradasi $I(x)$.
- **Kondisi Tanpa Ground-Truth (Zero-Reference):** Menggunakan metrik tanpa referensi seperti NIQE (*Natural Image Quality Evaluator*) dan BRISQUE saat menguji citra kabut nyata di Sumatera di mana citra cerah murni tidak tersedia.

---

### 7. Spesifikasi Metode Baseline (Baseline Method Specifications)
- **Model Restorasi:** Zero-DCE (DCE-Net dengan kurva kuadratik bertingkat 8 iterasi tanpa pengawasan pasangan citra).
- **Model Baseline Klasik:** Dark Channel Prior (DCP) dengan atmospheric light $A$ diestimasi dari $0.1\%$ piksel tergelap pada kanal warna gelap.
- **Detektor Hilir Pembanding:** YOLOv8-X dan Faster R-CNN (ResNet-50) yang dievaluasi dalam dua mode: (a) Input citra terdegradasi mentah, (b) Input citra yang telah direstorasi oleh model baseline.

---

### 8. Fondasi Matematis (Mathematical Foundations)
1. **Model Fisika Hamburan Koschmieder:**
   $$I(x) = J(x) t(x) + A (1 - t(x))$$
   $$t(x) = e^{-\beta d(x)}$$
   di mana $I(x)$ adalah intensitas citra berkabut, $J(x)$ adalah radiances pemandangan asli (bebas kabut), $t(x) \in [0, 1]$ adalah peta transmisi medium, $A$ adalah konstanta cahaya atmosfer global (*global atmospheric airlight*), $\beta$ adalah koefisien pemusnahan atmosfer (*extinction coefficient*), dan $d(x)$ adalah jarak kedalaman objek dari sensor kamera.
2. **Expected Calibration Error (ECE):**
   $$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$$
   di mana interval kepercayaan $[0, 1]$ dibagi ke dalam $M = 15$ bin seragam $B_m$, $\text{acc}(B_m)$ adalah akurasi empiris pada bin $m$, dan $\text{conf}(B_m)$ adalah rata-rata keyakinan prediksi model pada bin tersebut.
3. **Peak Signal-to-Noise Ratio (PSNR) & SSIM:**
   $$\text{PSNR} = 10 \log_{10} \left( \frac{\text{MAX}_I^2}{\text{MSE}} \right), \quad \text{MSE} = \frac{1}{HW} \sum_{i=1}^H \sum_{j=1}^W (J(i, j) - \hat{J}(i, j))^2$$
   $$\text{SSIM}(x, y) = \frac{(2 \mu_x \mu_y + c_1)(2 \sigma_{xy} + c_2)}{(\mu_x^2 + \mu_y^2 + c_1)(\sigma_x^2 + \sigma_y^2 + c_2)}$$

---

### 9. Instruksi Reproduksi Baseline Komputasi (Baseline Reproduction Protocol)
1. Pasang dependensi pengolahan citra saintifik: `pip install scikit-image opencv-python`.
2. Jalankan skrip reproduksi baseline terkontrol:
   ```bash
   python content/research/r03/examples/example-01.py
   ```
3. Verifikasi validasi transfer Koschmieder deterministik: pastikan bahwa nilai piksel sintetik terhitung tepat $0.8161$ pada parameter transmisi standar.
4. Amati perbandingan penurunan PSNR dari Level 1 ($13.73 \text{ dB}$) ke Level 5 ($3.40 \text{ dB}$) dan verifikasi lonjakan nilai ECE akibat pergeseran domain.

---

### 10. Variabel Eksperimen & Desain Kontrol (Variables & Experimental Controls)
| Kategori Variabel | Nama Variabel | Konfigurasi Uji |
|---|---|---|
| **Variabel Independen** | Tingkat Keparahan Degradasi ($\beta$) | Level 1 ($\beta=0.5$), Level 3 ($\beta=2.0$), Level 5 ($\beta=5.0$) |
| **Variabel Independen** | Paradigma Restorasi | Raw Degraded, DCP Klasik, Zero-DCE, Joint Physics Net |
| **Variabel Dependen** | Kualitas Restorasi & Keandalan | $\text{PSNR (dB)}, \text{SSIM}, \text{ECE}, \text{mAP}@[.50:.95]$ |
| **Variabel Kontrol** | Parameter Sensor & Resolusi | Matriks kamera konstan, resolusi spasial standar $512 \times 512$ |
| **Variabel Kontrol** | Nilai Atmospheric Light $A$ | $A = 0.95$ (ternormalisasi pada skala $[0, 1]$) |

---

### 11. Protokol Validasi Statistik (Gate 6 Multi-Seed Protocol)
- **Random Seeds Minimum ($N \ge 3$):** `[42, 1337, 2026]`.
- Parameter stokastik meliputi penambahan derau sensor Gauss-Poisson aditif dan sampling subset evaluasi uji.
- **Pelaporan Wajib:** $\mu \pm \sigma$ dengan interval kepercayaan 95% bootstrap untuk metrik PSNR, SSIM, mAP, dan ECE.
- **Uji Signifikansi:** Permutation test dengan $10.000$ iterasi acak untuk membuktikan bahwa penurunan ECE bukan merupakan artefak sampling acak.

---

### 12. Desain Matriks Studi Ablasi (Factorial Ablation Study)
1. **Ablasi 1: Pengaruh Batasan Fisika Transmisi ($t(x) \ge t_0$):**
   - Menilai pencegahan pembagian dengan nilai nol dan penghilangan artefak noise pada horizon langit.
2. **Ablasi 2: Fungsi Kerugian Keteraturan Spasial (Total Variation vs Retinex Smoothness):**
   - Mengukur pelestarian ketajaman tepi objek yang krusial untuk ekstraksi fitur detektor hilir.
3. **Ablasi 3: Modul Kalibrasi Suhu (Temperature Scaling Pasca-Restorasi):**
   - Menguji apakah penskalaan suhu sederhana dapat mengembalikan kalibrasi model tanpa pelatihan ulang seluruh jaringan.

---

### 13. Taksonomi Analisis Galat (Adverse Perception Error Taxonomy)
Klasifikasi galat persepsi lingkungan buruk ke dalam 4 mode:
1. **Halo & Ringing Artifacts:** Cincin kontras palsu di sekitar batas antara objek gelap dan langit terang akibat estimasi transmisi kasar.
2. **Noise Amplification in Dark Regions:** Peningkatan kecerahan yang mengeksaserbasi derau sensor kamera pada area bayangan pekat.
3. **Color Cast Distortion:** Pergeseran spektral warna akibat asumsi atmospheric light $A$ yang seragam di seluruh citra.
4. **Overconfident False Positives:** Detektor memprediksi objek halusinasi di dalam kabut dengan skor keyakinan $> 0.90$.

---

### 14. Pengujian Kekokohan & Generalisasi Domain (Robustness Testing)
- **Benchmarking Corruption Severity (Hendrycks Framework):** Menguji model pada 5 tingkat keparahan bertingkat untuk derau kabut, hujan, derau Gaussian, derau shot, dan defokus blur.
- **Cross-Condition Validation:** Model yang dioptimalkan untuk kondisi kabut diuji pada skenario malam hari gelap gulita (*Dark Zurich*) untuk mengukur kemampuan adaptasi representasi tanpa fine-tuning.

---

### 15. Kebutuhan Komputasi & Lingkungan Reproducible (Compute Environment)
- **Komputasi:** CPU / GPU mandiri dengan PyTorch 2.4+.
- **Pustaka Terkait:** `torchvision`, `scikit-image`, `opencv-python`, `scipy`.
- **Target Runtime:** $\le 20 \text{ ms}$ per citra $512 \times 512$ pada GPU kelas menengah untuk memungkinkan pemrosesan video berkecepatan 50 FPS pada unit persepsi sensor terpasang.

---

### 16. Standar Pelaporan Ilmiah & Format Tabel (Scientific Reporting)
Format tabel wajib berstandar IEEE TIP / CVPR:
```markdown
| Metode | Modus Restorasi | PSNR (dB) ↑ | SSIM ↑ | mAP@[.50:.95] ↑ | ECE (%) ↓ | Latensi (ms) ↓ |
|---|---|---|---|---|---|---|
| Raw Degraded (Tanpa Restorasi) | None | 13.73 ± 0.02 | 0.521 | 24.3 ± 0.2 | 27.5 ± 0.9 | **0.0** |
| Dark Channel Prior (DCP) | Fisika Heuristik | 18.42 ± 0.05 | 0.742 | 27.8 ± 0.2 | 18.2 ± 0.4 | 45.2 |
| Zero-DCE (Deep Curve) | Neural Zero-Ref | 21.65 ± 0.08 | 0.865 | 30.4 ± 0.2 | 12.4 ± 0.3 | 4.8 |
| **Proposed Joint-Physics Net** | Terpandu Fisika | **25.85 ± 0.12** | **0.934** | **33.8 ± 0.2** | **5.4 ± 0.2** | 12.1 |
```
*Catatan: Nilai dilaporkan dalam format $\mu \pm \sigma$ dihitung dari $N=3$ random seeds.*

---

### 17. Etika Penelitian & Keselamatan Operasional (Research Ethics)
- **Keselamatan Kritis Kendaraan Otonom:** Kegagalan persepsi dalam kondisi cuaca buruk dapat menyebabkan kecelakaan fatal. Makalah wajib mencantumkan analisis batas kegagalan sistem (*failure bound analysis*) dan rekomendasi mekanisme *fail-safe handover* ke kendali manual manusia saat ECE melampaui ambang batas aman.
- **Inklusivitas Lingkungan Berkembang:** Mengakui bahwa mayoritas dataset otonom diambil di negara beriklim subtropis dengan marka jalan terawat rapi; riset ini secara eksplisit memprioritaskan pemodelan kondisi lokal pulau Sumatera dengan curah hujan tinggi dan vegetasi tropis lebat.

---

### 18. Daftar Periksa Kesiapan Publikasi (Publication-Readiness Checklist)
- [x] Model transfer radiatif diverifikasi secara matematis dan analitis.
- [x] Laporan penelitian menyertakan metrik kualitas citra (PSNR/SSIM) sekaligus metrik tugas hilir (mAP/ECE).
- [x] Fenomena paradoks restorasi-deteksi dieksplorasi dan dijelaskan secara empiris.
- [x] Protokol multi-seed $N \ge 3$ dengan interval kepercayaan bootstrap diterapkan penuh.
- [x] Diagram keandalan (*Reliability Diagrams*) dan kurva kalibrasi ECE disertakan.
- [x] Kode pipeline evaluasi, bobot model, dan skrip sintesis kabut dapat direproduksi secara mandiri.

