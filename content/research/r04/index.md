# SILABUS KURIKULUM PENELITIAN JALUR R04 (L4 RESEARCH-READY)
## Vision-Centric Multimodal Perception
### Camera-Radar Fusion, Spatio-Temporal Calibration, and Cross-Modal State Estimation

**Kode Jalur:** R04  
**Kategori:** Strategic Extension  
**Pilar:** Pilar 3: Vision-Centric Multimodal Perception  
**Target Akademik:** L4 — Research-Ready (Persiapan Publikasi NeurIPS / ACM MM / IEEE ICRA / IROS)  
**Institusi Penyelenggara:** Institut Teknologi Sumatera (ITERA)  
**Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Penyelarasan Strategis:** Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  

---

### 1. Taksonomi Masalah Penelitian (Research Problem Taxonomy)
Penelitian persepsi multimodal berbasis kamera dikelompokkan ke dalam tiga arsitektur integrasi utama:
1. **Fusi Awal (Early / Raw-Level Fusion):** Proyeksi data point cloud radar atau LiDAR langsung ke bidang piksel kamera sebagai kanal fitur tambahan ($RGB + Depth + Doppler$). Kelemahan: sensitivitas ekstrem terhadap galat kalibrasi spasial dan sparsity spasial sensor sekunder.
2. **Fusi Menengah (Intermediate / Feature-Level Cross-Attention):** Mengekstraksi representasi laten dari masing-masing modalitas menggunakan backbone independen, kemudian menyatukannya via mekanisme *Cross-Attention* atau *Transformer Decoder*. Keunggulan: representasi semantik kaya; kelemahan: beban komputasi tinggi dan interpretabilitas kovariansi ketidakpastian yang rendah.
3. **Fusi Akhir (Late / Decision & State-Space Fusion):** Setiap sensor menjalankan deteksi dan estimasi independen, kemudian menghasilkan estimasi state terlacak terpadu menggunakan *Bayesian Estimation / Extended Kalman Filter*. Keunggulan: modularitas tinggi, toleransi tinggi terhadap sensor dropout, dan interpretasi probabilitas fisik yang jelas.

Fokus penelitian R04 ditujukan pada: **Integrasi visual-sentris kamera dan radar gelombang milimeter (mmWave) asinkron untuk pelacakan objek kokoh pada sistem transportasi dan maritim Sumatera.**

---

### 2. Latar Belakang Ilmiah & SOTA Gap (Scientific Background)
Kamera optik menyediakan resolusi spasial dan kekayaan tekstur semantik superior, namun rentan mengalami kegagalan estimasi kedalaman (*depth ambiguity*) pada kondisi malam atau kabut. Sebaliknya, radar mmWave mampu menembus kabut dan mengukur jarak serta kecepatan radial Doppler secara instan, namun memiliki resolusi sudut azimut yang sangat kasar dan rentan terhadap derau pantulan palsu (*multipath ghost targets*). Banyak karya ilmiah menerapkan pendekatan fusi rata-rata berbobot heuristik sederhana ($0.5 \text{ Cam} + 0.5 \text{ Rad}$). Pendekatan ini secara teoritis cacat karena mengabaikan **anisotropi derau sensor**: derau lateral kamera jauh lebih kecil daripada radar, sedangkan derau radial radar jauh lebih kecil daripada kamera. Celah ilmiah fundamental adalah: bagaimana merumuskan fusi Bayesian Kalman dengan kovariansi derau heterogen yang menjamin konvergensi optimal dan tahan terhadap kegagalan mendadak (*sensor dropout*).

---

### 3. Kajian Literatur & Paper Kunci (Key Literature & Citations)
- **Fondasional Sensor Fusion & Kalibrasi:**
  - Bar-Shalom, Y., Li, X. R., and Kirubarajan, T. "Estimation with Applications to Tracking and Navigation." *John Wiley & Sons 2001*. (Fondasi formal Kalman Multimodal).
  - Caesar, H., et al. "nuScenes: A Multimodal Dataset for Autonomous Driving." *CVPR 2020*. (Benchmark standar 6-kamera + 5-radar).
  - Radke, R. J., et al. "Image Change Detection: A Survey." *IEEE TIP 2005*. (Prinsip perbandingan citra multimodal).
- **Fusi Kamera-Radar Modern:**
  - Kim, J., et al. "CRAFT: Camera-Radar Fusion for 3D Object Detection." *BMVC 2022*. (Fusi koordinat polar dan Cartesian).
  - Nabati, R., and Qi, H. "CenterFusion: Center-based Radar and Camera Fusion for 3D Object Detection." *WACV 2021*. (Asosiasi berbasis titik tengah deteksi).
  - Radford, A., et al. "Learning Transferable Visual Models From Natural Language Supervision (CLIP)." *ICML 2021*. (Multimodal vision-language foundation).

---

### 4. Pertanyaan Penelitian & Hipotesis Teruji (Research Questions & Hypotheses)
- **Research Question 1 (RQ1):** Apakah pembobotan Bayesian dinamis berbasis matriks kovariansi anisotropik mampu mereduksi galat estimasi posisi secara signifikan dibanding fusi heuristik pada kondisi sensor asinkron?
- **Hipotesis ($H_1$):** Penerapan estimasi state Bayesian Kalman Filter dengan matriks kovariansi derau terpisah ($\mathbf{R}_{\text{cam}}$ lateral rendah, $\mathbf{R}_{\text{rad}}$ radial rendah) akan menurunkan Root Mean Square Error (RMSE) lintasan minimal sebesar $35\%$ dibandingkan fusi berbobot heuristik pada split validasi nuScenes-mini ($N \ge 3$ seeds, paired t-test $p < 0.01$).
- **Hipotesis Nol ($H_0$):** Fusi Bayesian tidak memberikan perbaikan signifikan dibandingkan fusi heuristik pada toleransi galat empiris.

---

### 5. Pemilihan & Audit Provenansi Dataset (Dataset Provenance & Audit)
1. **nuScenes Multimodal Dataset (v1.0-mini):**
   - URL Resmi: `https://www.nuscenes.org/`
   - Lisensi: CC-BY-NC-SA 4.0.
   - Sensor Suite: 6 kamera monokular ($1600 \times 900$, 12 Hz) dan 5 radar mmWave (Continental ARS408-21, 13 Hz).
   - Audit Kalibrasi: Matriks ekstrinsik $\mathbf{T}_{\text{sensor} \to \text{ego}} \in \text{SE}(3)$ dan timestamp GPS mikrosekon terverifikasi.

---

### 6. Standar Evaluasi Ground-Truth (Ground-Truth Standards)
- Anotasi target dinyatakan sebagai bounding box 3D: $[x, y, z, w, l, h, \theta_{\text{yaw}}]$.
- Jarak toleransi pencocokan asosiasi pusat objek (*center distance threshold*): $d_{\text{match}} \le 2.0 \text{ m}$.

---

### 7. Spesifikasi Metode Baseline (Baseline Method Specifications)
- **Detektor Kamera:** YOLOX-X / CenterNet (pretrained nuScenes).
- **Ekstraktor Titik Radar:** Filter kecepatan Doppler statis untuk mengeliminasi clutter tanah.
- **Model Fusi:** Asynchronous Sequential Extended Kalman Filter.

---

### 8. Fondasi Matematis (Mathematical Foundations)
1. **Transformasi Koordinat Spasial SE(3):**
   $$\mathbf{x}_{\text{cam}} = \mathbf{R}_{\text{rad} \to \text{cam}} \mathbf{x}_{\text{rad}} + \mathbf{t}_{\text{rad} \to \text{cam}}$$
2. **Koreksi Bayesian Kalman Anisotropik:**
   $$\mathbf{K}_k = \mathbf{P}_{k|k-1} \mathbf{H}^T (\mathbf{H} \mathbf{P}_{k|k-1} \mathbf{H}^T + \mathbf{R}_k)^{-1}$$
   $$\mathbf{x}_{k|k} = \mathbf{x}_{k|k-1} + \mathbf{K}_k (\mathbf{z}_k - \mathbf{H} \mathbf{x}_{k|k-1})$$
   $$\mathbf{P}_{k|k} = (\mathbf{I} - \mathbf{K}_k \mathbf{H}) \mathbf{P}_{k|k-1}$$
   di mana $\mathbf{R}_{\text{cam}} = \text{diag}(\sigma_{\text{lat,cam}}^2, \sigma_{\text{depth,cam}}^2)$ dan $\mathbf{R}_{\text{rad}} = \text{diag}(\sigma_{\text{lat,rad}}^2, \sigma_{\text{range,rad}}^2)$.

---

### 9. Instruksi Reproduksi Baseline Komputasi (Baseline Reproduction Protocol)
1. Kloning repositori dan jalankan skrip komputasi terverifikasi:
   ```bash
   python content/research/r04/examples/example-01.py
   ```
2. Pastikan hasil perhitungan menghasilkan reduksi galat RMSE sebesar $\sim 45.8\%$ di atas baseline heuristik.
3. Verifikasi kestabilan kovariansi elips saat terjadi dropout kamera pada frame 10 s.d. 15.

---

### 10. Variabel Eksperimen & Desain Kontrol (Variables & Experimental Controls)
| Kategori Variabel | Nama Variabel | Konfigurasi Uji |
|---|---|---|
| **Variabel Independen** | Strategi Fusi Sensor | Camera-Only, Heuristic Weighted, Bayesian Multimodal Kalman |
| **Variabel Independen** | Probabilitas Sensor Dropout | $0\%, 10\%, 20\%, 30\%$ dropout rate |
| **Variabel Dependen** | Ketelitian Pelacakan | Trajectory RMSE (m), Maksimum Error (m), Latensi (ms) |
| **Variabel Kontrol** | Lintasan Ground Truth | Lintasan gerak melengkung konstan ($30$ time steps) |

---

### 11. Protokol Validasi Statistik (Gate 6 Multi-Seed Protocol)
- **Random Seeds Minimum ($N \ge 3$):** `[42, 1337, 2026]`.
- Pelaporan metrik dalam format $\mu \pm \sigma$ dengan interval kepercayaan 95% bootstrap.
- Uji signifikansi: Paired Student's t-test antar-metode pada seed yang bersesuaian.

---

### 12. Desain Matriks Studi Ablasi (Factorial Ablation Study)
1. **Ablasi 1: Pengaruh Kovariansi Anisotropik vs Isotropik:**
   - Membuktikan bahwa pemodelan derau lateral vs kedalaman yang realistis mengungguli asumsi derau bola (*spherical noise*).
2. **Ablasi 2: Sinkronisasi Asinkron (Interpolasi Linier vs Nearest Neighbor):**
   - Mengukur ketahanan terhadap jitter clock timestamp sensor.
3. **Ablasi 3: Ketahanan Dropout Modalitas Kamera vs Radar:**
   - Mengevaluasi degradasi performa saat kamera tertutup lumpur atau kabut tebal.

---

### 13. Taksonomi Analisis Galat (Multimodal Error Taxonomy)
1. **Calibration Misalignment Error:** Pergeseran translasi/rotasi matriks ekstrinsik memicu offset sistematis permanen.
2. **Radar Multipath Ghost Target:** Pantulan sinyal radar dari pagar logam atau pembatas jalan diidentifikasi sebagai objek baru.
3. **Temporal Desynchronization Jitter:** Perbedaan waktu akuisisi $> 50 \text{ ms}$ memicu estimasi kecepatan yang salah.
4. **Modality Occlusion Dropout:** Kegagalan total salah satu sensor memicu lonjakan kovariansi $\mathbf{P}$.

---

### 14. Pengujian Kekokohan & Generalisasi Domain (Robustness Testing)
- Pengujian pada kondisi hujan lebat dan cipratan air jalanan di mana lensa kamera mengalami oklusi dinamis.
- Evaluasi cross-domain pada skenario pelabuhan dan perairan selat Sumatera.

---

### 15. Kebutuhan Komputasi & Lingkungan Reproducible (Compute Environment)
- **Komputasi:** CPU mandiri (Intel Core i5+ / AMD Ryzen) atau GPU kelas pemula.
- **Pustaka:** Python 3.10+, NumPy 1.24+, SciPy.
- **Latensi Target:** $\le 5 \text{ ms}$ per step fusi untuk mendukung kontrol loop kendaraan otonom 100 Hz.

---

### 16. Standar Pelaporan Ilmiah & Format Tabel (Scientific Reporting)
Format tabel wajib berstandar IEEE ICRA / CVPR:
```markdown
| Metode | Sensor Aktif | Trajectory RMSE (m) ↓ | Max Error (m) ↓ | Latensi (ms) ↓ | Reduksi Galat (%) ↑ |
|---|---|---|---|---|---|
| Camera Baseline | Cam Only | 1.125 ± 0.136 | 2.450 | **0.8** | Baseline |
| Heuristic Fusion | Cam + Radar | 1.328 ± 0.166 | 2.890 | 1.2 | -18.0% (Degradasi) |
| **Bayesian Kalman** | Cam + Radar | **0.720 ± 0.123** | **1.420** | 1.5 | **+45.8% (Terbaik)** |
```
*Catatan: Nilai dilaporkan dalam format $\mu \pm \sigma$ dihitung dari $N=3$ random seeds.*

---

### 17. Etika Penelitian & Implikasi Keselamatan (Research Ethics)
- **Redundansi Kritis Keselamatan:** Fusi multi-sensor ditujukan untuk menjamin redundansi (*fail-operational redundancy*). Makalah wajib mengkaji batasan failure-mode di mana kedua sensor gagal secara simultan.
- **Netralitas Komputasi:** Menghindari bias vendor perangkat keras radar tertentu dengan menyediakan antarmuka data terbuka.

---

### 18. Daftar Periksa Kesiapan Publikasi (Publication-Readiness Checklist)
- [x] Model fusi Bayesian terbukti secara analitis dan matematis.
- [x] Anisotropi derau sensor dimodelkan dan diverifikasi secara numerik.
- [x] Protokol multi-seed $N \ge 3$ dipatuhi dan dicatat dalam manifest JSON terstruktur.
- [x] Kode reproduksi mandiri disediakan tanpa ketergantungan perangkat keras khusus.
- [x] Analisis kegagalan dropout sensor disertakan secara transparan.

