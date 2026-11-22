# PHASE AD-02 — ADVANCED COMPUTER VISION ACADEMIC DEEPENING
## Chapters 46–50 | Section 10: Advanced Computer Vision
### Multimedia & Computer Vision Learning Hub

**Repository:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Target Akademik:** Level 2 (Undergraduate Complete) dengan Kedalaman Riset Terpilih Level 3 (Advanced Research Readiness), selaras dengan roadmap ISVWS 2026–2040.  
**Tanggal Verifikasi:** 18 November 2026  

---

## 1. Eksekutif Ringkasan

Fase **AD-02** melanjutkan kesuksesan pendalaman materi pembelajaran Deep Learning (Fase AD-01 melalui AD-01E) untuk menuntaskan pemutakhiran akademik penuh pada **Seksi 10: Advanced Computer Vision (Bab 46–50)**.

Seksi 10 mencakup topik-topik garda depan visi komputer modern:
1. **Bab 46:** *Vision Transformers & Attention* (Lab: `VisionTransformerExplorer.tsx`)
2. **Bab 47:** *Human Pose Estimation & Landmark Detection* (Lab: `HumanPoseExplorer.tsx`)
3. **Bab 48:** *3D Vision & Scene Reconstruction* (Lab: `ThreeDReconstructionExplorer.tsx`)
4. **Bab 49:** *Self-Supervised & Foundation Vision Models* (Lab: `VisionEmbeddingExplorer.tsx`)
5. **Bab 50:** *Advanced Vision Model Evaluation* (Lab: `VisionEvaluationDashboard.tsx`)

Setiap bab dalam Seksi 10 kini memiliki:
- **Teks Akademik Komprehensif (`index.md`)**: Berbobot 250–350+ baris, memuat fondasi teoritis ketat, formulasi matematis formal, penurunan numerik langkah demi langkah, analisis mode kegagalan sistem & mitigasinya, integrasi diagram SVG kurikulum, serta arsitektur Tiga Moda Pembelajaran (Mode A Web Playground, Mode B Skrip Python Lokal, Mode C Notebook Komputasi).
- **Skrip Python Mandiri (`examples/example-01.py`)**: Berkas Python 3.12 mandiri berbasis pure NumPy / OpenCV yang mengeksekusi dan memvalidasi seluruh persamaan dan contoh numerik tanpa dependensi PyTorch di host lokal, lulus dengan status deterministik `exit code 0`.
- **Primary Research Citations (`references.json`)**: Sitasi otoritatif foundational (Vaswani 2017, Dosovitskiy 2020, Sun HRNet 2019, Cao OpenPose 2019, Hartley & Zisserman 2004, Szeliski 2022, Schönberger COLMAP 2016, Radford CLIP 2021, He MAE 2022, Oquab DINOv2 2023, Guo Calibration 2017).
- **Slide Presentasi Terstruktur (`slides.json`)**: 10 slide 16:9 per bab dengan catatan presenter mendalam, formulasi LaTeX, integrasi diagram, dan branding resmi ITERA (tanpa watermark Reveal.js).
- **Dual-Engine Jupyter Notebooks (`notebooks/chapter-XX-lab.ipynb`)**: Notebook interaktif berstandar nbformat v4 yang dapat dieksekusi secara instan dan deterministik di lingkungan offline tanpa GPU menggunakan NumPy murni, sekaligus menyediakan instruksi pipeline PyTorch lengkap untuk Google Colab / GPU.

---

## 2. Rincian Pemutakhiran Bab Demi Bab

### Bab 46: Vision Transformers & Attention
- **Teori & Matematika**:
  - Patchification citra: $N = (H \cdot W) / P^2$ token visual.
  - Proyeksi linier matriks bobot Query, Key, Value ($\mathbf{W}_Q, \mathbf{W}_K, \mathbf{W}_V$).
  - Scaled Dot-Product Attention: $\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$.
  - Multi-Head Self-Attention (MHSA) dan kompleksitas komputasi kuadratik $\mathcal{O}(N^2 D)$.
- **Contoh Numerik Langkah Demi Langkah**:
  - $N=3$ token, $d_k=4$: $Q, K, V$ matriks.
  - Dot-product scaling $\sqrt{4}=2.0$, logit Softmax: $S_0 = [0.5065, 0.1863, 0.3072]$.
  - Output vektor terbobot $O_0 = [6.601, 5.262]^T$.
- **Verifikasi**: `examples/example-01.py` lulus deterministik. Notebook 4 sel lulus verifikasi clean execution.

### Bab 47: Human Pose Estimation & Landmark Detection
- **Teori & Matematika**:
  - Paradigma Top-Down (Deteksi Orang $\to$ Single Pose) vs Bottom-Up (Part Affinity Fields / PAFs $\to$ Bipartite Matching).
  - Target representasi Heatmap Gaussian 2D kontinu: $\mathbf{H}_k(i, j) = \exp\left(-\frac{(i - x_k)^2 + (j - y_k)^2}{2\sigma^2}\right)$.
  - Dekode puncak argmax sub-piksel dengan estimasi turunan Taylor ordo kedua.
  - Metrik evaluasi standar industri MS COCO: Object Keypoint Similarity (OKS).
- **Contoh Numerik Langkah Demi Langkah**:
  - Subjek area $s = 200$ px, dua sendi aktif (hidung $\kappa=0.026$, bahu $\kappa=0.062$).
  - Jarak galat piksel $d_0 = 3.0$ px, $d_1 = 4.0$ px.
  - Skor eksponensial parsial: $S_0 = 0.8467$, $S_1 = 0.9495 \implies \text{OKS} = 0.8981$ (atau $0.9253$ pada variasi offset).
- **Verifikasi**: `examples/example-01.py` lulus deterministik. Notebook 4 sel lulus verifikasi clean execution.

### Bab 48: 3D Vision & Scene Reconstruction
- **Teori & Matematika**:
  - Model kamera pinhole proyektif $\mathbf{P} = \mathbf{K} [\mathbf{R} \mid \mathbf{t}]$.
  - Geometri Epipolar: Matriks Fundamental $\mathbf{F}$ dan Matriks Esensial $\mathbf{E} = [\mathbf{t}]_\times \mathbf{R}$.
  - Triangulasi Direct Linear Transformation (DLT) berbasis Singular Value Decomposition (SVD): $\mathbf{A} \mathbf{X} = \mathbf{0}$.
  - Bundle Adjustment non-linier kuadrat terkecil Levenberg-Marquardt.
  - Evolusi paradigma: NeRF dan 3D Gaussian Splatting (3DGS).
- **Contoh Numerik Langkah Demi Langkah**:
  - Kamera stereo ortogonal $f=1000$ px, baseline $b=2.0$ meter.
  - Pengamatan piksel: $\mathbf{x}_1 = (200.0, 100.0)$, $\mathbf{x}_2 = (-200.0, 100.0)$.
  - Triangulasi analitik & SVD: $Z = 5.0$ meter, $X = 1.0$ meter, $Y = 0.5$ meter ($\mathbf{X} = [1.0, 0.5, 5.0]^T$).
  - Eror reproyeksi identik 0.000000 px.
- **Verifikasi**: `examples/example-01.py` lulus deterministik. Notebook 4 sel lulus verifikasi clean execution.

### Bab 49: Self-Supervised & Foundation Vision Models
- **Teori & Matematika**:
  - Paradigma pretext tasks vs downstream transferability.
  - Contrastive Learning & InfoNCE Loss:
    $$\mathcal{L}_{\text{InfoNCE}} = -\log \frac{\exp(\mathbf{q} \cdot \mathbf{k}_+ / \tau)}{\exp(\mathbf{q} \cdot \mathbf{k}_+ / \tau) + \sum_j \exp(\mathbf{q} \cdot \mathbf{k}_j^- / \tau)}$$
  - Peran kritis parameter suhu $\tau$ terhadap margin gradien hard-negatives.
  - Masked Autoencoders (MAE): rasio masking 75%, ViT encoder asimetris, rekonstruksi MSE.
  - Self-Distillation DINOv2: Pembaruan bobot guru EMA, teknik centering dan sharpening pencegah representasi kolaps.
  - Model fondasi multimodal CLIP dan klasifikasi zero-shot berbasis cosine similarity.
- **Contoh Numerik Langkah Demi Langkah**:
  - Kueri $\mathbf{q} = [0.8, 0.6]^T$, kunci positif $\mathbf{k}_+ = [0.7071, 0.7071]^T$, 2 negatif $\mathbf{k}_1^- = [-0.6, 0.8]^T$, $\mathbf{k}_2^- = [-0.8, -0.6]^T$, $\tau = 0.1$.
  - Kesamaan: $s_+ = 0.9899495$, $s_1^- = 0.0$, $s_2^- = -1.0$.
  - Softmax posterior $P(+) = 0.9999498 \implies \mathcal{L}_{\text{InfoNCE}} = 5.02 \times 10^{-5}$.
- **Verifikasi**: `examples/example-01.py` lulus deterministik. Notebook 4 sel lulus verifikasi clean execution.

### Bab 50: Advanced Vision Model Evaluation
- **Teori & Matematika**:
  - Keterbatasan akurasi skalar pada data visual tak seimbang.
  - Kurva Precision-Recall dan All-Point Precision Interpolation:
    $$P_{\text{interp}}(r) = \max_{\tilde{r} \ge r} P(\tilde{r}), \quad \text{AP} = \sum (R_k - R_{k-1}) P_{\text{interp}}(R_k)$$
  - Protokol MS COCO mAP@[0.50:0.95].
  - Kalibrasi model modern & Expected Calibration Error (ECE) pada $M$ bin:
    $$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} |\text{acc}(B_m) - \text{conf}(B_m)|$$
  - Post-processing kalibrasi: Temperature Scaling $T > 1$ dan metrik Brier Score.
  - Profil latensi inferensi edge (P50, P95, P99) dan throughput FPS.
- **Contoh Numerik Langkah Demi Langkah**:
  - 10 deteksi uji (5 ground truth): AP terinterpolasi $= 0.79446$ (79.45%).
  - Evaluasi 3 bin keyakinan: $\text{ECE} = 0.1350$ (13.50% miscalibration).
  - Temperature scaling dengan $T=1.3$ mereduksi ECE menjadi $0.0961$ dan Brier Score dari $0.2322$ ke $0.2221$ dengan preservasi peringkat 100%.
- **Verifikasi**: `examples/example-01.py` lulus deterministik. Notebook 4 sel lulus verifikasi clean execution.

---

## 3. Matriks Hasil Pengujian & QA Rigor

| Aspek Uji | Perintah Eksekusi | Target | Status |
|---|---|---|---|
| **Python Unit Scripts (Ch 46–50)** | `python content/chapters/chapter-XX/examples/example-01.py` | 5/5 skrip exit code 0 | **PASSED (100%)** |
| **Clean Notebook Runner (Ch 36–50)** | Subprocess execution seluruh sel kode pada 15 notebook | 15/15 notebook exit code 0 | **PASSED (100%)** |
| **Unit & Integration Tests** | `npm test` | 44/44 automated tests pass | **PASSED (100%)** |
| **Curriculum & Content Registry** | `node scripts/validate-content.mjs` | 60 chapters, 6 tracks | **PASSED (100%)** |
| **Media Attribution Registry** | `node scripts/validate-media.mjs` | 110 assets verified | **PASSED (100%)** |
| **TypeScript Typecheck** | `npm run typecheck` | Zero compilation errors | **PASSED (100%)** |
| **Production Build** | `npm run build` | Vite build bundle clean | **PASSED (100%)** |

---

## 4. Kesimpulan & Kesiapan Seksi Berikutnya

Fase **AD-02** telah berhasil mentransformasikan materi kurikulum Seksi 10 (Bab 46–50) dari konten pengantar dasar menjadi materi akademik komprehensif berstandar sarjana teknik lengkap (Level 2) dengan wawasan riset mutakhir (Level 3). Seluruh kode deterministik, slide presentasi resmi ITERA, dan notebook dual-engine telah teruji tanpa anomali. Platform kini sepenuhnya siap untuk menyongsong fase pendalaman berikutnya: **Seksi 11 (Multimodal AI & Foundation Models, Bab 51–55)**.

