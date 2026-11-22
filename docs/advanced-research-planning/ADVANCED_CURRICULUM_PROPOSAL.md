# PROPOSAL ARSITEKTUR ADVANCED CURRICULUM
## Intelligent Computer Vision | Academic Layer L3–L4
### Multimedia & Computer Vision Learning Hub — ITERA

**Penyusun:** Tim Pengembang Kurikulum Akademik & Rekayasa Sistem Visi Komputer  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Konteks Riset:** Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS 2026–2040)  
**Status Dokumen:** *Proposal Akademik — Menunggu Persetujuan Pengguna (Pending Approval)*  
**Prasyarat Baseline:** 60/60 Core Curriculum Published (Fase AD-04)  

---

## 1. Visi & Tujuan Kurikulum Tingkat Lanjut

Kurikulum Lanjut (*Advanced Curriculum*) ini dirancang sebagai **lapisan akademik tingkat atas (L3 Advanced hingga L4 Research-Ready)** yang dibangun di atas fondasi 60 bab Kurikulum Inti (*Core Curriculum*) yang telah selesai dan terkunci secara penuh.

Tujuan utama arsitektur ini adalah:
1. **Pendidikan Pascasarjana & Persiapan Doktoral (PhD Readiness)**: Memberikan jembatan teoretis dan komputasional dari tingkat sarjana (S1 Teknik Telekomunikasi ITERA) menuju tuntutan riset pascasarjana (S2/S3) dalam bidang Visi Komputer Cerdas.
2. **Kemandirian Riset Reproduktif**: Mengajarkan metodologi reproduksi benchmark internasional (CVPR, ICCV, ECCV, NeurIPS, IEEE TPAMI) secara teliti, deterministik, dan dapat dipertanggungjawabkan.
3. **Fokus Kepakaran yang Tegas**: Mempertahankan **Intelligent Computer Vision** sebagai bidang keilmuan primer (*primary discipline*), dengan fokus inti pada **Intelligent Visual Perception & Sensing**, serta ekstensi strategis pada **Vision-Centric Multimodal Perception** dan **Edge AI Systems**. Platform ini secara tegas **tidak** dialihkan menjadi riset robotika umum, general multimodal LLM, atau penginderaan nirkabel murni tanpa jangkar visi.

---

## 2. Struktur Modul Lanjut yang Diusulkan (ADV-01 s.d. ADV-08)

Delapan modul lanjutan (*candidate advanced modules*) diusulkan untuk melengkapi kompetensi L3–L4:

```
+---------------------------------------------------------------------------------------------------+
|                        ARSITEKTUR ADVANCED CURRICULUM (L3 - L4)                                   |
+---------------------------------------------------------------------------------------------------+
  [ ADV-01: Mathematical Foundations for Advanced Vision ]
       |
       +---> [ ADV-02: Advanced Image & Video Processing ] ---------> [ ADV-06: Robust Visual Perception ]
       |
       +---> [ ADV-04: Advanced Deep Visual Recognition ] ----------> [ ADV-07: Vision Foundation Models ]
       |        |
       |        +---------------------------------------------------> [ ADV-03: Multi-Object Tracking ]
       |
       +---> [ ADV-05: Multi-View Geometry & 3D Vision ]
       |
       +---> [ ADV-08: Efficient & Real-Time Vision Systems ]
```

---

### MODUL ADV-01: Mathematical Foundations for Advanced Computer Vision
- **ID Modul:** `ADV-01`
- **Tingkat Kedalaman:** L3 (Undergraduate Advanced / Early Graduate)
- **Tujuan Akademik:** Menutup kesenjangan matematis antara kalkulus dasar sarjana dengan formulasi optimasi non-linier dan inferensi probabilistik yang mendasari algoritma visi modern.
- **Audiens Sasaran:** Mahasiswa tingkat akhir persiapan skripsi/tesis, peneliti muda, dan kandidat program magister/doktoral.
- **Capaian Pembelajaran (Learning Outcomes):**
  1. Mampu merumuskan persoalan estimasi visi komputer sebagai persoalan optimasi non-linier terikat dan tak terikat.
  2. Menguasai dekomposisi matriks tingkat lanjut (Singular Value Decomposition / SVD, Eigendecomposition, Cholesky Factorization) untuk penyelesaian sistem persamaan homogen.
  3. Memahami konsep manifold geometris (Lie Group $SO(3)$, $SE(3)$ dan Lie Algebra $\mathfrak{so}(3)$, $\mathfrak{se}(3)$) untuk representasi rotasi dan pose kamera bebas singularitas.
  4. Menguasai teori probabilitas lanjutan dan inferensi Bayesian (Maximum Likelihood Estimation / MLE, Maximum A Posteriori / MAP, Expectation-Maximization / EM).
- **Prasyarat Wajib:** Bab 02, 05, 36.
- **Prasyarat Rekomendasi:** Kalkulus Peubah Banyak dan Aljabar Linier Elementer.
- **Pemetaan Bab Inti Terkait:** Bab 36 (*Image Geometry*), Bab 38 (*Camera Calibration*), Bab 41 (*Deep Learning Foundations*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 1.1: Aljabar Linier Matriks Lanjut*: SVD, Pseudo-Inverse Moore-Penrose, Proyeksi Subruang Orthogonal.
  - *Seksi 1.2: Optimasi Numerik Non-Linier*: Gradient Descent, Gauss-Newton, Levenberg-Marquardt, Karush-Kuhn-Tucker (KKT).
  - *Seksi 1.3: Geometri Diferensial & Representasi Pose*: Grup Lie $SO(3)$ & $SE(3)$, Kuaternion Satuan, Rodrigues Formula.
  - *Seksi 1.4: Inferensi Statistik & Teori Estimasi*: MLE vs MAP, Penaksir Bayes, Kalibrasi Ketidakpastian.
- **Kompetensi Komputasi:** Implementasi SVD dan Levenberg-Marquardt menggunakan NumPy dan SciPy Optimize.
- **Eksperimen yang Diusulkan:** Estimasi homografi melalui Direct Linear Transformation (DLT) teroptimasi non-linier Levenberg-Marquardt.
- **Prioritas Pengembangan:** **Prioritas 1 (Pondasi Kritis)**.

---

### MODUL ADV-02: Advanced Image & Video Processing
- **ID Modul:** `ADV-02`
- **Tingkat Kedalaman:** L3 (Graduate Depth)
- **Tujuan Akademik:** Menguasai formulasi persoalan terbalik (*inverse problems*) dalam pemrosesan visual, mencakup restorasi citra terdegradasi parah, rekonstruksi super-resolusi, dan estimasi aliran optik variasional.
- **Audiens Sasaran:** Mahasiswa pascasarjana, peneliti pengolahan citra biomedis/satelit, dan insinyur komputasi fotografi.
- **Capaian Pembelajaran:**
  1. Merumuskan dan menyelesaikan persoalan inversi citra teratur (*regularized inverse problems*) menggunakan Total Variation (TV) dan Tikhonov regularization.
  2. Menguasai algoritma dekonvolusi buta (*blind deconvolution*) untuk restorasi gerak kabur (*motion blur*).
  3. Mengimplementasikan formulasi aliran optik variasional Horn-Schunck dan variasional TV-L1 berdensitas tinggi.
  4. Menganalisis degradasi temporal pada aliran video dan stabilisasi video berbasis estimasi lintasan kamera.
- **Prasyarat Wajib:** Bab 10, 11, 12, 29, 30.
- **Prasyarat Rekomendasi:** ADV-01.
- **Pemetaan Bab Inti Terkait:** Bab 11 (*Frequency Domain*), Bab 12 (*Restoration*), Bab 30 (*Optical Flow*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 2.1: Inverse Problems & Regularization*: Formulasi $y = Hx + n$, Total Variation Regularization, Split Bregman.
  - *Seksi 2.2: Motion Deblurring & Super-Resolution*: Kernel PSF estimation, dekonvolusi Richardson-Lucy berbobot.
  - *Seksi 2.3: Variational Optical Flow*: Formulasi Horn-Schunck berlanjut, regularisasi TV-L1, coarse-to-fine warping.
  - *Seksi 2.4: Video Temporal Consistency*: Filter temporal non-lokal, eliminasi flicker, stabilisasi video homografi.
- **Dataset Kandidat:** REDS (Real-time Video Deblurring), Middlebury Optical Flow, GoPro Deblurring Dataset.
- **Prioritas Pengembangan:** **Prioritas 2**.

---

### MODUL ADV-03: Multi-Object Tracking & State Estimation
- **ID Modul:** `ADV-03`
- **Tingkat Kedalaman:** L3–L4 (Research-Ready)
- **Tujuan Akademik:** Menguasai teori estimasi status objek dinamis, penanganan oklusi ekstrem, pelacakan multi-target probabilistik, dan arsitektur tracking berbasis graf.
- **Audiens Sasaran:** Peneliti pengawasan otonom, sistem transportasi cerdas, dan kendaraan otonom.
- **Capaian Pembelajaran:**
  1. Menurunkan dan mengimplementasikan Extended Kalman Filter (EKF) dan Unscented Kalman Filter (UKF) untuk dinamika gerak non-linier.
  2. Menguasai algoritma asosiasi data probabilistik: Hungarian Algorithm, Joint Probabilistic Data Association (JPDA), dan Multiple Hypothesis Tracking (MHT).
  3. Memahami dan mengimplementasikan Tracking-by-Detection modern (SORT, DeepSORT, ByteTrack, BoT-SORT).
  4. Mengevaluasi performa pelacakan secara komprehensif menggunakan metrik internasional standar (HOTA, MOTA, IDF1).
- **Prasyarat Wajib:** Bab 32, 33, 44.
- **Prasyarat Rekomendasi:** ADV-01, ADV-04.
- **Pemetaan Bab Inti Terkait:** Bab 32 (*Tracking Fundamentals*), Bab 33 (*Multi-Object Tracking*), Bab 44 (*YOLO Detection*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 3.1: Teori Estimasi Status Stokastik*: EKF, UKF, Constant Velocity/Acceleration/Turn Models.
  - *Seksi 3.2: Asosiasi Data Probabilistik & Biaya Gabungan*: Mahalanobis distance, Appearance Re-ID cosine cost, Hungarian matching.
  - *Seksi 3.3: Arsitektur Modern MOT*: ByteTrack (asosiasi deteksi berkepercayaan rendah), BoT-SORT (kompensasi gerak kamera).
  - *Seksi 3.4: Metodologi Evaluasi MOT Standard*: Dekomposisi HOTA (Detection Accuracy DetA vs Association Accuracy AssA).
- **Dataset Kandidat:** MOT17, MOT20, DanceTrack, BDD100K Tracking.
- **Prioritas Pengembangan:** **Prioritas 1 (Arah Riset Utama)**.

---

### MODUL ADV-04: Advanced Deep Visual Recognition
- **ID Modul:** `ADV-04`
- **Tingkat Kedalaman:** L3–L4 (Research-Ready)
- **Tujuan Akademik:** Menjelajahi batas terdepan arsitektur deteksi objek dan segmentasi citra canggih, mencakup transformer-based detector, segmentasi panoptik, dan teknik penanganan ketidakseimbangan data ekstrem.
- **Audiens Sasaran:** Peneliti pengenalan visual cerdas dan arsitek model computer vision.
- **Capaian Pembelajaran:**
  1. Menguasai arsitektur deteksi objek berbasis transformer end-to-end (DETR, Deformable DETR, RT-DETR) dengan bipartite matching loss.
  2. Menganalisis fungsi loss canggih untuk ketidakseimbangan kelas dan regresi bounding box (Focal Loss, Varifocal Loss, GIoU, DIoU, CIoU).
  3. Memahami dan mengimplementasikan Panoptic Segmentation yang menggabungkan segmentasi semantik (stuff) dan instans (things).
  4. Melakukan audit kegagalan model (*failure mode analysis*) dan teknik penambangan sampel sulit (*Hard Negative Mining*).
- **Prasyarat Wajib:** Bab 41, 42, 44, 45, 46.
- **Prasyarat Rekomendasi:** ADV-01.
- **Pemetaan Bab Inti Terkait:** Bab 44 (*Object Detection YOLO*), Bab 45 (*Segmentation*), Bab 46 (*Vision Transformers*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 4.1: Detection Transformer Architectures*: DETR Hungarian loss, Deformable multi-scale attention, RT-DETR real-time execution.
  - *Seksi 4.2: Advanced Loss Formulations*: Variational Focal Loss, EIoU, Distribution Focal Loss (DFL).
  - *Seksi 4.3: Panoptic & Open-Vocabulary Segmentation*: Panoptic FPN, Mask2Former, SAM (Segment Anything Model) zero-shot prompts.
  - *Seksi 4.4: Long-Tail Recognition & Hard Example Mining*: Class-balanced loss, re-sampling strategies, false positive reduction.
- **Dataset Kandidat:** COCO (Detection & Panoptic), LVIS (Large Vocabulary Long-Tail), Pascal VOC 2012.
- **Prioritas Pengembangan:** **Prioritas 1 (Arah Riset Utama)**.

---

### MODUL ADV-05: Multi-View Geometry & 3D Vision
- **ID Modul:** `ADV-05`
- **Tingkat Kedalaman:** L3 (Graduate Complete)
- **Tujuan Akademik:** Mempelajari prinsip matematika geometri proyeksi multi-kamera, rekonstruksi 3D padat dan jarang, serta kalibrasi pose kamera dinamis.
- **Audiens Sasaran:** Mahasiswa pascasarjana, peneliti fotogrametri, dan pengembang sistem pemetaan spasial.
- **Capaian Pembelajaran:**
  1. Menurunkan geometri epipolar: Matriks Fundamental $F$, Matriks Esensial $E$, dan kendala epipolar bilinear $x'^T F x = 0$.
  2. Menguasai estimasi pose relatif kamera menggunakan 8-point algorithm ternormalisasi dan 5-point minimal solver.
  3. Mengimplementasikan rekonstruksi 3D Structure-from-Motion (SfM) berbasis Bundle Adjustment sparse.
  4. Menganalisis representasi titik 3D dan estimasi bidang dense (Point Cloud processing, Poisson surface reconstruction).
- **Prasyarat Wajib:** Bab 36, 37, 38, 39, 48.
- **Prasyarat Rekomendasi:** ADV-01.
- **Pemetaan Bab Inti Terkait:** Bab 38 (*Camera Calibration*), Bab 39 (*Stereo Vision*), Bab 48 (*3D Vision & Reconstruction*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 5.1: Geometri Epipolar & Matriks Fundamental*: Penurunan 8-Point Hartley, RANSAC epipolar outlier rejection.
  - *Seksi 5.2: Triangulasi & Rekonstruksi Struktur 3D*: Linear vs optimal polynomial triangulation, reprojection error optimization.
  - *Seksi 5.3: Structure from Motion (SfM) Pipeline*: Feature track matching, incremental camera registration, Bundle Adjustment (Ceres Solver spec).
  - *Seksi 5.4: Dense Multi-View Stereo (MVS)*: PatchMatch stereo, cost volume regularization, 3D point cloud filtering.
- **Dataset Kandidat:** KITTI Vision Benchmark, DTU Multi-View Dataset, Tanks and Temples.
- **Prioritas Pengembangan:** **Prioritas 3 (Spesialisasi Lanjutan)**.

---

### MODUL ADV-06: Robust & Generalizable Visual Perception
- **ID Modul:** `ADV-06`
- **Tingkat Kedalaman:** L4 (Research-Ready / PhD Level)
- **Tujuan Akademik:** Menghadapi persoalan degradasi lingkungan dunia nyata (cuaca ekstrem, malam hari, kabut, oklusi parah) dan pergeseran domain distribusi data (*domain shift*).
- **Audiens Sasaran:** Calon peneliti doktoral, pengembang sistem keselamatan persepsi kritis (ISVWS 2026–2040).
- **Capaian Pembelajaran:**
  1. Menganalisis kerentanan model visi terhadap pergeseran domain (*covariate shift*, *concept shift*) dan degradasi atmosfer.
  2. Mengimplementasikan algoritma restorasi terintegrasi end-to-end untuk kondisi rendah cahaya (*low-light enhancement*) dan penghilangan kabut (*dehazing*).
  3. Menguasai teknik adaptasi domain tanpa supervisi (*Unsupervised Domain Adaptation / UDA*) dan Test-Time Adaptation (TTA).
  4. Mengukur kalibrasi ketidakpastian (*uncertainty estimation*) dan deteksi sampel di luar distribusi (*Out-of-Distribution / OOD detection*).
- **Prasyarat Wajib:** Bab 12, 42, 44, 50.
- **Prasyarat Rekomendasi:** ADV-01, ADV-04.
- **Pemetaan Bab Inti Terkait:** Bab 12 (*Restoration*), Bab 50 (*Advanced Evaluation*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 6.1: Persepsi dalam Degradasi Lingkungan*: Pembentukan citra kabut Koschmieder, enhancement kurva iluminasi non-linier.
  - *Seksi 6.2: Adaptasi Domain & Generalisasi*: Domain Adversarial Neural Networks (DANN), Maximum Mean Discrepancy (MMD).
  - *Seksi 6.3: Test-Time Adaptation (TTA)*: Entropi minimisasi pada data pengujian tak berlabel (TENT), moving average batch norm.
  - *Seksi 6.4: Kuantifikasi Ketidakpastian & OOD*: Monte Carlo Dropout, Deep Ensembles, Expected Calibration Error (ECE) terprofil.
- **Dataset Kandidat:** ExDark (Exclusively Dark), Foggy Cityscapes, ACDC (Adverse Conditions Dataset with Correspondences), ImageNet-C.
- **Prioritas Pengembangan:** **Prioritas 1 (Pilar Riset Utama ISVWS)**.

---

### MODUL ADV-07: Vision Foundation Models & Representation Learning
- **ID Modul:** `ADV-07`
- **Tingkat Kedalaman:** L3–L4 (Research-Ready)
- **Tujuan Akademik:** Menjelajahi paradigma pembelajaran representasi mandiri (*self-supervised learning*) dan adaptasi model fondasi visi tanpa melatih ulang seluruh parameter jaringan.
- **Audiens Sasaran:** Peneliti representasi fitur visual dan pemodelan mandiri.
- **Capaian Pembelajaran:**
  1. Memahami prinsip pembelajaran representasi visual kontrasif dan non-kontrasif (SimCLR, MoCo, BYOL, DINO, DINOv2).
  2. Menganalisis arsitektur Masked Image Modeling (MAE - Masked Autoencoders) untuk pemahaman semantik visual.
  3. Menguasai metode Parameter-Efficient Fine-Tuning (PEFT) pada model visi: LoRA (Low-Rank Adaptation), Visual Prompt Tuning (VPT), dan Adapter layers.
  4. Mengevaluasi sifat linier probing dan representasi geometri ruang embedding model fondasi.
- **Prasyarat Wajib:** Bab 46, 49, 52, 54.
- **Prasyarat Rekomendasi:** ADV-04.
- **Pemetaan Bab Inti Terkait:** Bab 46 (*Vision Transformers*), Bab 49 (*Foundation Models*), Bab 52 (*Vision-Language*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 7.1: Self-Supervised Vision Representations*: Contrastive loss InfoNCE, representasi emergensi semantik DINOv2.
  - *Seksi 7.2: Masked Autoencoders (MAE)*: Rekonstruksi patch citra tersembunyi berasio tinggi (75% masking).
  - *Seksi 7.3: Parameter-Efficient Fine-Tuning (PEFT)*: Dekomposisi bobot adaptor $\Delta W = B \cdot A$, LoRA rank analysis.
  - *Seksi 7.4: Zero-Shot Transfer & Probing*: Linear probe evaluation protocol, k-NN visual evaluation pada ImageNet-1k.
- **Dataset Kandidat:** ImageNet-1k, Mini-ImageNet, Caltech-256.
- **Prioritas Pengembangan:** **Prioritas 2 (Ekstensi Strategis)**.

---

### MODUL ADV-08: Efficient & Real-Time Vision Systems
- **ID Modul:** `ADV-08`
- **Tingkat Kedalaman:** L3–L4 (Engineering & Systems Research)
- **Tujuan Akademik:** Menerapkan rekayasa kompresi model dan optimasi inferensi berlatensi ultra-rendah untuk penerapan pada perangkat keras terbenam (*embedded computing*).
- **Audiens Sasaran:** Insinyur sistem visi tertanam, perancang Edge AI, dan arsitek efisiensi komputasi.
- **Capaian Pembelajaran:**
  1. Menguasai Quantization-Aware Training (QAT) dengan simulasi galat kuantisasi dan Straight-Through Estimator (STE).
  2. Menerapkan pemangkasan terstruktur (*structured pruning*) pada filter konvolusi dan regularisasi $L_1$/Group LASSO.
  3. Menganalisis fusi lapisan (*layer fusion*) dan penyusunan ulang graf komputasi TensorRT / ONNX Runtime.
  4. Mengevaluasi trade-off Pareto antara akurasi model, latensi per frame, konsumsi daya baterai, dan ukuran memori.
- **Prasyarat Wajib:** Bab 56, 57, 59.
- **Prasyarat Rekomendasi:** ADV-01, ADV-04.
- **Pemetaan Bab Inti Terkait:** Bab 56 (*Real-Time Processing*), Bab 57 (*Edge AI Quantization*), Bab 59 (*Performance Profiling*).
- **Rencana Seksi & Pelajaran:**
  - *Seksi 8.1: Quantization-Aware Training (QAT)*: FakeQuantize nodes, per-channel weight scaling, STE gradient backprop.
  - *Seksi 8.2: Structured Pruning & Sparsity*: Taylor expansion filter pruning, reduksi FLOPs terukur.
  - *Seksi 8.3: Graph Rewriting & Hardware Compilers*: Konvolusi+BatchNorm+ReLU fusion, kompilasi NPU / TensorRT engine.
  - *Seksi 8.4: Pareto Frontier Optimization*: Benchmarking daya (Joule/frame) dan latensi pada perangkat tepi (NVIDIA Jetson / Coral).
- **Dataset Kandidat:** ImageNet-1k lightweight subsets, COCO-val, MLPerf Tiny Benchmarks.
- **Prioritas Pengembangan:** **Prioritas 2 (Ekstensi Strategis)**.

---

## 3. Matriks Rekomendasi Prioritas Pengembangan

Berdasarkan relevansi roadmap **ISVWS 2026–2040** dan kebutuhan persiapan riset sarjana menuju pascasarjana di ITERA, prioritas pengembangan modul diklasifikasikan sebagai berikut:

| Modul | Nama Modul | Bobot Prioritas | Alasan Akademik & Keterkaitan ISVWS |
| :---: | :--- | :---: | :--- |
| **ADV-01** | *Mathematical Foundations* | **Priority 1** | Landasan wajib untuk seluruh penurunan rumus optimasi non-linier dan estimasi status. |
| **ADV-04** | *Advanced Deep Recognition* | **Priority 1** | Deteksi objek merupakan instrumen persepsi visual paling esensial dalam intelligent vision. |
| **ADV-03** | *Multi-Object Tracking* | **Priority 1** | Pelacakan temporal kontinu adalah inti pemantauan fasilitas cerdas dan sistem otonom. |
| **ADV-06** | *Robust Visual Perception* | **Priority 1** | Pilar utama ISVWS 2026–2040: model harus tangguh di iklim tropis dan cuaca ekstrem Sumatera. |
| **ADV-02** | *Advanced Image & Video* | **Priority 2** | Menopang pemahaman restorasi citra terdegradasi sebelum masuk ke detektor visual. |
| **ADV-07** | *Vision Foundation Models* | **Priority 2** | Paradigma modern transfer learning dan adaptasi efisien parameter visual (PEFT). |
| **ADV-08** | *Efficient Vision Systems* | **Priority 2** | Menjamin hasil riset dapat diimplementasikan pada perangkat berdaya rendah (Edge AI). |
| **ADV-05** | *Multi-View Geometry & 3D* | **Priority 3** | Spesialisasi lanjutan, dipelajari secara bertahap setelah pemahaman 2D kokoh. |

