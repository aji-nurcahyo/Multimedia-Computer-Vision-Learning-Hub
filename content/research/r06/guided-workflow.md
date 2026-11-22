# Alur Riset Terpandu Jalur R06: Spatial Intelligence & 3D Vision
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Stereo Calibration &rarr; Baseline &rarr; Triangulation &rarr; Trajectory Benchmark &rarr; Diagnostics &rarr; Conclusion
### Target Standar: KITTI Odometry Benchmark & TUM RGB-D SLAM

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Ekstraksi struktur geometris 3D dan estimasi pergerakan kamera (Visual Odometry / SLAM) dari pasangan citra stereo monokular terkalibrasi sering mengalami degradasi akurasi kedalaman secara kuadratik terhadap jarak jangkau objek ($\sigma_Z \propto Z^2$), serta sensitif terhadap galat pencocokan korespondensi pada area tanpa tekstur (*textureless surfaces*).
- **Research Question (RQ):** Bagaimana merancang pipeline rekonstruksi 3D stereo terkalibrasi berbasis Direct Linear Transformation (DLT) dan estimasi pose 6-DoF yang meminimalkan galat reproyeksi sub-piksel serta menekan drift trajektori (Absolute Trajectory Error - ATE) pada navigasi otonom?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Triangulasi stereo terkalibrasi menggunakan dekomposisi Singular Value Decomposition (SVD) pada sistem persamaan DLT menghasilkan galat reproyeksi sub-piksel ($\text{RMSE} \le 0.50\text{ px}$) dan Absolute Trajectory Error (ATE) $\le 0.20\text{ m}$ pada lintasan odometri KITTI sub-sequence 00 terverifikasi pada $N \ge 3$ random seeds.

---

## 3. Dataset Selection & Stereo Rig Calibration Provenance (Audit Dataset)
- **Dataset Acuan:** KITTI Vision Benchmark Suite (Odometry & Stereo 2012 / 2015).
- **Lisensi:** CC-BY-NC-SA 3.0.
- **Audit Kalibrasi Rig:** Kamera ganda Point Grey Flea 2 dengan baseline terukur $B = 0.54\text{ m}$, panjang fokus $f = 718.856\text{ px}$, titik utama $(c_x, c_y) = (607.19, 185.21)$, distorsi lensa telah direktifikasi secara penuh ($k_1, k_2, p_1, p_2 \approx 0$).

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline 1:** Naive Epipolar Disparity Search dengan Triangulasi Trigonometrik Sederhana ($Z = \frac{f \cdot B}{d}$).
- **Baseline 2:** Monocular VO (dengan ketidakpastian skala / scale ambiguity).
- **Sanity Check:** Memastikan triangulasi tanpa derau (*noiseless synthetic check*) menghasilkan galat rekonstruksi absolut $\le 10^{-6}\text{ m}$.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Baseline jarak kamera stereo ($B \in [0.20, 1.00]\text{ m}$), panjang fokus ($f \in [400, 1200]\text{ px}$), dan tingkat derau deteksi titik korespondensi ($\sigma \in [0.1, 1.0]\text{ px}$).
- **Variabel Dependen:** Galat Reproyeksi RMSE (piksel), Galat Rekonstruksi 3D (m), dan Absolute Trajectory Error (ATE) lintasan (m).
- **Variabel Kontrol:** Konfigurasi landmark 3D ground-truth, matriks rotasi ground-truth $\mathbf{R} = \mathbf{I}$, dan orientasi kamera.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Acuan:** NumPy / SciPy / evo (evaluation of odometry and SLAM).
- **Metrik Utama:** Reprojection Error RMSE (px), 3D Reconstruction Error RMSE (m), Absolute Trajectory Error (ATE RMSE in meters), Relative Pose Error (RPE in m/frame).
- **Format Pelaporan:** $\mu \pm \sigma$ dengan interval kepercayaan 95% multi-seed ($N=3$).

---

## 7. Analysis & Diagnostics (Analisis Kegagalan Geometris)
- Analisis singularitas matriks DLT ketika titik berada pada tak hingga ($Z \to \infty$) atau sejajar dengan basis garis epipolar (*parallel optical axes*).
- Audit efek degradasi kuadratik ketidakpastian kedalaman: $\sigma_Z = \frac{Z^2}{f \cdot B} \sigma_d$.

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- Verifikasi batas sub-piksel: DLT berbasis SVD menjamin optimasi algebraic error minimum.
- Rilis artefak riset: skrip Python mandiri `content/research/r06/examples/example-01.py`, notebook, dan interactive visual lab.

