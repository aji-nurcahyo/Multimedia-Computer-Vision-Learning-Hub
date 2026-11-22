# PEMETAAN KURIKULUM INTI KE KURIKULUM LANJUT & JALUR RISET
## Core-to-Advanced & Research Pathways Mapping (Chapters 01–60 $\to$ ADV-01..08 $\to$ R01..06)
### Multimedia & Computer Vision Learning Hub — ITERA

**Penyusun:** Tim Pengembang Kurikulum Akademik & Rekayasa Sistem Visi Komputer  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Status Dokumen:** *Proposal Akademik — Menunggu Persetujuan Pengguna (Pending Approval)*  

---

## 1. Prinsip Pemetaan Akademik

Pemetaan ini menetapkan alur transisi mulus (*seamless academic progression*) dari **Kurikulum Inti 60 Bab (Undergraduate Baseline L1–L2)** menuju **Kurikulum Lanjut (Advanced L3)** dan **Jalur Riset Mandiri (Research Tracks L4)**.

Prinsip panduan utama:
1. **Zero Content Rewriting**: Materi Kurikulum Inti (Bab 01–60) yang telah tuntas tidak akan ditulis ulang atau diduplikasi.
2. **Modular Reusability**: Modul Lanjut dan Jalur Riset bertindak sebagai lapisan atas (*upper layer*) yang merujuk, mengaitkan (*hyperlink*), dan memperdalam konsep yang telah dipelajari di tingkat sarjana.
3. **Penyelarasan Kompetensi**: Setiap modul lanjut memiliki prasyarat bab inti yang jelas dan terverifikasi.

---

## 2. Matriks Komprehensif: Pemetaan Bab Inti ke Modul Lanjut & Jalur Riset

| Seksi Kurikulum Inti | Bab Inti (01–60) | Topik Kompetensi Inti Sarjana (L1/L2) | Modul Lanjut Terkait (L3) | Jalur Riset Terkait (L4) |
| :--- | :---: | :--- | :--- | :--- |
| **Seksi 01: Multimedia Foundations** | **01–05** | Sinyal digital, sampling, format media, Python, NumPy | `ADV-01` (Math Foundations) | Metodologi Riset Bersama |
| **Seksi 02: Digital Image Processing**| **06–10** | Ruang warna, enhancement, histogram, filtering spasial | `ADV-02` (Advanced DIP) | `R01`, `R03` |
| **Seksi 03: Advanced DIP** | **11–15** | Frekuensi Fourier, restorasi, edge, morfologi, segmentasi | `ADV-02`, `ADV-04`, `ADV-06` | `R01`, `R03` |
| **Seksi 04: Digital Audio Fundamentals**| **16–20** | Spektrum audio, FFT, filter biquad, spektrogram STFT | `ADV-02` (Temporal) | `R04` (Multimodal) |
| **Seksi 05: Audio & Speech Intelligence**| **21–25** | Fitur MFCC, speech recognition, sound classification | — | `R04` (Multimodal) |
| **Seksi 06: Digital Video Fundamentals**| **26–30** | Kompresi video, temporal filter, optical flow gerak | `ADV-02`, `ADV-03` | `R02` (MOT) |
| **Seksi 07: Video Analysis & Tracking** | **31–35** | Background subtraction, Kalman filter, tracking SORT | `ADV-03` (Multi-Target) | `R02` (MOT) |
| **Seksi 08: Classical Computer Vision** | **36–40** | Geometri homografi, SIFT/ORB, kalibrasi, stereo, HOG | `ADV-01`, `ADV-05` (3D Vision) | `R06` (Spatial 3D) |
| **Seksi 09: Deep Learning for Vision** | **41–45** | CNN, klasifikasi, transfer learning, YOLO, segmentasi | `ADV-04` (Deep Recognition) | `R01`, `R03` |
| **Seksi 10: Advanced Computer Vision** | **46–50** | Vision Transformers, pose, 3D SfM, foundation, evaluasi | `ADV-04`, `ADV-06`, `ADV-07` | `R01`, `R03`, `R06` |
| **Seksi 11: Multimodal AI** | **51–55** | VLM (CLIP), audio-visual fusion, cross-modal retrieval | `ADV-07` (Representasi) | `R04` (Multimodal Sensing) |
| **Seksi 12: Systems & Capstone** | **56–60** | Real-time queue, Edge AI INT8, web APIs, Amdahl, capstone | `ADV-08` (Efficient Systems) | `R05` (Edge AI Systems) |

---

## 3. Rincian Titik Transisi Akademik per Modul Lanjut

### A. Titik Transisi ADV-01 (Mathematical Foundations)
- **Fondasi dari Kurikulum Inti**:
  - Bab 05 (*NumPy & Tensor Operations*): Operasi matriks, dot product, broadcast.
  - Bab 36 (*Image Geometry*): Transformasi afina, matriks rotasi 2D, koordinat homogen.
  - Bab 38 (*Camera Calibration*): Penurunan persamaan proyeksi pinhole linier.
- **Peningkatan pada Level L3**:
  - Generalisasi ke aljabar Lie group $SO(3)$ dan manifold non-Euclidean.
  - Formulasi optimasi non-linier terikat (Levenberg-Marquardt dengan robust Huber loss).
  - Inferensi Bayesian formal untuk estimasi status visual.

### B. Titik Transisi ADV-02 (Advanced Image & Video Processing)
- **Fondasi dari Kurikulum Inti**:
  - Bab 10 (*Spatial Filtering*): Konvolusi 2D dan operator kernel.
  - Bab 11 (*Frequency Domain*): Transformasi Fourier 2D dan filter lolos-rendah/tinggi.
  - Bab 12 (*Image Restoration*): Filter Wiener, inverse filtering dasar.
  - Bab 30 (*Motion Estimation*): Lucas-Kanade optical flow lokal.
- **Peningkatan pada Level L3**:
  - Formulasi persoalan inversi ill-posed teratur: $\arg\min_x \|Ax - y\|_2^2 + \lambda \text{TV}(x)$.
  - Variational Optical Flow global berdensitas tinggi (Horn-Schunck dan TV-L1).
  - Blind motion deblurring dan super-resolusi video teratur secara temporal.

### C. Titik Transisi ADV-03 (Multi-Object Tracking & State Estimation)
- **Fondasi dari Kurikulum Inti**:
  - Bab 32 (*Object Tracking Fundamentals*): Single object tracking, algoritma Meanshift/Camshift.
  - Bab 33 (*Multi-Object Tracking*): SORT klasik, matriks IoU matching.
  - Bab 44 (*Object Detection with YOLO*): Ekstraksi bounding box deteksi per-frame.
- **Peningkatan pada Level L3–L4**:
  - Estimasi status non-linier menggunakan EKF dan UKF untuk gerak akselerasi/sudut.
  - Algoritma asosiasi berjenjang (ByteTrack) yang memanfaatkan deteksi bernilai rendah.
  - Kompensasi gerak kamera dinamis (BoT-SORT) dan dekomposisi metrik HOTA internasional.

### D. Titik Transisi ADV-04 (Advanced Deep Visual Recognition)
- **Fondasi dari Kurikulum Inti**:
  - Bab 42 (*CNN Classification*): Arsitektur ResNet dan VGG dasar.
  - Bab 44 (*Object Detection with YOLO*): Anchors, grid prediction, Non-Maximum Suppression dasar.
  - Bab 45 (*Semantic & Instance Segmentation*): U-Net, Mask R-CNN dasar.
  - Bab 46 (*Vision Transformers*): Patch embedding, Self-Attention ViT dasar.
- **Peningkatan pada Level L3–L4**:
  - End-to-end Transformer Object Detectors (DETR, Deformable DETR, RT-DETR).
  - Formulasi fungsi loss canggih untuk ketidakseimbangan kelas ekstrem (Variational Focal Loss, Distribution Focal Loss).
  - Segmentasi Panoptik (Mask2Former) dan model segmentasi berbasis prompt zero-shot (SAM).

### E. Titik Transisi ADV-05 (Multi-View Geometry & 3D Vision)
- **Fondasi dari Kurikulum Inti**:
  - Bab 38 (*Camera Calibration*): Zhang's method kalibrasi papan catur.
  - Bab 39 (*Stereo Vision*): Pasangan kamera stereo terkalibrasi, disparitas dan kedalaman.
  - Bab 48 (*3D Vision & Scene Reconstruction*): Point cloud dasar, konsep SfM pengantar.
- **Peningkatan pada Level L3**:
  - Geometri epipolar uncalibrated: Matriks Fundamental 8-point terstandardisasi Hartley.
  - Estimasi pose relatif 5-point minimal solver dengan eliminasi polinomial.
  - Non-linear Bundle Adjustment skala besar untuk pendaftaran kamera inkremental.

### F. Titik Transisi ADV-06 (Robust & Generalizable Visual Perception)
- **Fondasi dari Kurikulum Inti**:
  - Bab 08 (*Image Enhancement*): Penyesuaian kontras dan histogram CLAHE.
  - Bab 12 (*Image Restoration*): Denoising sintetis Gaussian/salt-and-pepper.
  - Bab 50 (*Advanced Vision Evaluation*): Kalibrasi probabilitas ECE dasar, matriks konfusi.
- **Peningkatan pada Level L3–L4**:
  - Pembentukan citra degradasi fisik (hamburan kabut Koschmieder, atenuasi cahaya malam).
  - Domain Adversarial Neural Networks (DANN) untuk transfer domain tanpa anotasi.
  - Test-Time Adaptation (TTA) untuk adaptasi instan saat inference di tengah cuaca ekstrem.
  - Evidential Deep Learning untuk estimasi ketidakpastian prediktif (OOD detection).

### G. Titik Transisi ADV-07 (Vision Foundation Models & Representation Learning)
- **Fondasi dari Kurikulum Inti**:
  - Bab 46 (*Vision Transformers*): Arsitektur ViT murni, self-attention.
  - Bab 49 (*Self-Supervised & Foundation Models*): Pengantar SSL dan embeddings.
  - Bab 52 (*Vision-Language Models*): Arsitektur CLIP dual-encoder dasar.
- **Peningkatan pada Level L3–L4**:
  - Pembelajaran representasi mandiri tingkat lanjut: DINOv2 self-distillation tanpa supervisi.
  - Masked Autoencoder (MAE) dengan rasio masking 75% untuk pemahaman struktur semantik.
  - Parameter-Efficient Fine-Tuning (PEFT) visual: LoRA, Adapters, Visual Prompt Tuning (VPT).

### H. Titik Transisi ADV-08 (Efficient & Real-Time Vision Systems)
- **Fondasi dari Kurikulum Inti**:
  - Bab 56 (*Real-Time Multimedia Processing*): Latensi pipa, jitter, buffer ring.
  - Bab 57 (*Edge AI & Embedded CV*): Post-Training Quantization INT8 seragam affine.
  - Bab 59 (*Performance Optimization & Deployment*): Hukum Amdahl, profiling frame budget.
- **Peningkatan pada Level L3–L4**:
  - Quantization-Aware Training (QAT) dengan simulasi galat dan Straight-Through Estimator.
  - Structured pruning berbasis Taylor expansion dan regularisasi Group LASSO.
  - Optimasi fusi lapisan graf komputasi TensorRT dan evaluasi efisiensi energi empiris (Joule/frame).

---

## 4. Jalur Pembelajaran dari Sarjana Menuju Peneliti (Learning Trajectory)

```
+---------------------------------------------------------------------------------------------------+
|                        ALUR TRANSISI KURIKULUM: SARJANA -> RISET DOKTORAL                         |
+---------------------------------------------------------------------------------------------------+

 TINGKAT SARJANA (L1 - L2)       : Tuntas Bab 01 - 60 (Lulus S1 Teknik Telekomunikasi ITERA)
                                           |
                                           v
 TINGKAT LANJUT (L3)             : Modul Pondasi Matematika (ADV-01)
                                   + Modul Pilihan Spesialisasi (ADV-02 s.d. ADV-08)
                                           |
                                           v
 JALUR RISET PENELITI (L4)       : Memilih Salah Satu Jalur Riset Primer / Ekstensi:
                                   * R01: Visual Detection & Recognition
                                   * R02: Robust Multi-Object Tracking
                                   * R03: Robust Visual Perception in Adverse Environments
                                   * R04: Vision-Centric Multimodal Perception
                                   * R05: Efficient Edge AI Systems
                                           |
                                           v
 KELUARAN ILMIAH (Research Output): Publikasi Artikel Ilmiah Bereputasi + Repositori Kode Terbuka
```

---

## 5. Ringkasan Keterkaitan Kurikulum

Struktur pemetaan ini membuktikan bahwa:
1. Kurikulum Inti 60 Bab berperan sempurna sebagai **prasyarat kokoh dan tak tergantikan**.
2. Setiap modul lanjutan **tidak mengulang teori dasar**, melainkan langsung melompat ke formulasi matematika tingkat pascasarjana dan eksperimen bereputasi riset internasional.
3. Jalur riset terintegrasi penuh dengan payung kepakaran **Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS 2026–2040)** di ITERA.

