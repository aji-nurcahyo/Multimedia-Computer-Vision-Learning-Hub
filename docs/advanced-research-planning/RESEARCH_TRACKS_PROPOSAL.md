# PROPOSAL RESEARCH LEARNING PATHS (JALUR RISET L4)
## Intelligent Computer Vision | ISVWS 2026–2040 Research Framework
### Multimedia & Computer Vision Learning Hub — ITERA

**Penyusun:** Tim Pengembang Kurikulum Akademik & Rekayasa Sistem Visi Komputer  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Status Dokumen:** *Proposal Akademik — Menunggu Persetujuan Pengguna (Pending Approval)*  
**Prasyarat Baseline:** 60/60 Core Curriculum Published & Modul Lanjut ADV-01 s.d. ADV-08  

---

## 1. Visi & Hierarki Kepakaran Riset

Jalur Riset (*Research Learning Paths*) dirancang untuk membimbing mahasiswa sarjana berprestasi tinggi, mahasiswa pascasarjana (magister/doktoral), dan peneliti mandiri dalam menghasilkan **kontribusi ilmiah yang terukur, dapat diuji ulang (reproducible), dan bermakna praktis**.

Seluruh jalur riset diposisikan secara konsisten di bawah payung kepakaran **Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS 2026–2040)**:

```
+---------------------------------------------------------------------------------------------------+
|                        HIERARKI KEPAKARAN RISET ISVWS 2026–2040                                   |
+---------------------------------------------------------------------------------------------------+
  PILAR UTAMA (Primary Discipline)     : INTELLIGENT COMPUTER VISION
  FOKUS RISET (Core Research Priority) : INTELLIGENT VISUAL PERCEPTION & SENSING
  EKSTENSI STRATEGIS 1 (Multi-Sensory) : VISION-CENTRIC MULTIMODAL PERCEPTION
  EKSTENSI STRATEGIS 2 (Efficiency)    : EDGE AI & HIGH-EFFICIENCY COMPUTING SYSTEMS
  SPESIALISASI TAMBAHAN (Spatial)      : 3D SPATIAL PERCEPTION (OPTIONAL EXTENSION)
```

### Klasifikasi Prioritas Jalur Riset:
1. **Arah Riset Primer (Primary Research Tracks)**: `R01`, `R02`, `R03` (Wajib dikuasai calon peneliti inti).
2. **Ekstensi Strategis (Strategic Extensions)**: `R04`, `R05` (Kombinasi sensorik dan kompresi perangkat keras).
3. **Spesialisasi Tambahan (Optional Specialization)**: `R06` (Geometri spasial multi-kamera).

---

## 2. Rincian Enam Jalur Riset (R01 s.d. R06)

---

### JALUR RISET R01: Intelligent Visual Detection & Recognition
- **Klasifikasi:** **Primary Scientific Track (Prioritas 1)**
- **Fokus Utama:** Inovasi arsitektur deteksi objek, pengenalan ekor panjang (*long-tail object recognition*), deteksi objek berskala sangat kecil (*tiny object detection*) pada citra terestrial/drone, dan audit kegagalan model deteksi (*failure mode analysis*).
- **Rasional Riset:** Deteksi objek merupakan instrumen persepsi visual paling fundamental. Keberhasilan pengawasan cerdas, otomasi perkebunan, dan pemantauan maritim di Sumatera bertumpu pada keandalan modul deteksi dalam mendeteksi objek target tanpa false positive yang mengganggu.
- **Persoalan Riset Inti:**
  1. *Small Object Resolution Degradation*: Bagaimana mendeteksi objek dengan ukuran $< 16 \times 16$ piksel tanpa melipatgandakan beban FLOPs?
  2. *Extreme Class Imbalance*: Bagaimana memitigasi dominasi kelas mayoritas pada dataset pengawasan dunia nyata menggunakan formulasi loss asimetris?
  3. *Open-Vocabulary Object Detection*: Bagaimana mendeteksi kategori objek baru tanpa memerlukan anotasi bounding box berbiaya tinggi?
- **Prasyarat Wajib:** Bab 41, 42, 44, ADV-01, ADV-04.
- **Kompetensi Metodologi:**
  - Protokol evaluasi COCO standar: mAP@[.50:.95], $\text{AP}_{\text{small}}$, $\text{AP}_{\text{medium}}$, $\text{AP}_{\text{large}}$.
  - Validasi silang k-fold terstratifikasi untuk distribusi ekor panjang.
  - Analisis kurva Precision-Recall dan taksonomi error (Localization Error vs Classification Error vs Background Confusion).
- **Dataset Acuan Benchmark:**
  - COCO 2017 (Common Objects in Context)
  - LVIS v1.0 (Large Vocabulary Instance Segmentation)
  - VisDrone / TinyPerson (Aerial small object detection)
- **Daftar Pustaka Primer (Wajib Ditelaah):**
  - Carion et al., *"End-to-End Object Detection with Transformers (DETR)"*, ECCV 2020.
  - Zhu et al., *"Deformable DETR: Deformable Transformers for End-to-End Object Detection"*, ICLR 2021.
  - Lin et al., *"Focal Loss for Dense Object Detection"*, ICCV 2017.
  - Kirillov et al., *"Segment Anything (SAM)"*, ICCV 2023.
- **Target Luaran Riset:**
  - Naskah artikel ilmiah berstandar konferensi/jurnal bereputasi (IEEE/CVF atau Scopus Q1/Q2).
  - Repositori kode mandiri bereproduksi penuh (*reproducible code & weights*).

---

### JALUR RISET R02: Robust Multi-Object Tracking (MOT)
- **Klasifikasi:** **Primary Scientific Track (Prioritas 1)**
- **Fokus Utama:** Pelacakan multi-target kontinu, resolusi oklusi parah (*severe occlusion*), mitigasi perpindahan identitas (*identity switches*), pemodelan gerak non-linier terkompensasi (*camera motion compensation*), dan pelacakan berbasis graf spasio-temporal.
- **Rasional Riset:** Sistem pemantauan cerdas yang beroperasi secara waktu-nyata membutuhkan konsistensi identitas lintasan objek (*trajectories*), bukan sekadar deteksi frame-demi-frame yang terputus-putus.
- **Persoalan Riset Inti:**
  1. *Long-Term Occlusion Recovery*: Bagaimana memulihkan lintasan objek setelah terhalang rintangan selama $> 30$ frame tanpa memicu ID switch?
  2. *Low-Confidence Detection Association*: Bagaimana memanfaatkan deteksi dengan skor rendah (yang biasanya dibuang) untuk mempertahankan kontinuitas lintasan objek yang buram atau terpotong?
  3. *Dynamic Camera Motion Compensation*: Bagaimana memisahkan gerak objek sebenarnya dari gerak kamera bergerak (drone/kendaraan patroli) secara instan?
- **Prasyarat Wajib:** Bab 32, 33, 44, ADV-01, ADV-03.
- **Kompetensi Metodologi:**
  - Evaluasi HOTA (Higher Order Tracking Accuracy) yang mengurai Detection Accuracy (DetA) dan Association Accuracy (AssA).
  - Metrik IDF1, MOTA, False Positives (FP), False Negatives (FN), dan ID Switches (IDSW).
  - Protokol benchmark MOTChallenge: evaluasi pada test-set tersembunyi (*blind submission server*).
- **Dataset Acuan Benchmark:**
  - MOT17 / MOT20 (Crowded Pedestrian Tracking)
  - DanceTrack (Complex articulated motion with uniform appearance)
  - BDD100K Tracking (Autonomous driving tracking)
- **Daftar Pustaka Primer:**
  - Luiten et al., *"HOTA: A Higher Order Metric for Evaluating Multi-Object Tracking"*, IJCV 2021.
  - Zhang et al., *"ByteTrack: Multi-Object Tracking by Associating Every Detection Box"*, ECCV 2022.
  - Aharon et al., *"BoT-SORT: Robust Associations Multi-Pedestrian Tracker"*, arXiv 2022.
  - Bewley et al., *"Simple Online and Realtime Tracking (SORT)"*, ICIP 2016.
- **Target Luaran Riset:**
  - Benchmark komparasi komprehensif pada dataset DanceTrack/MOT17.
  - Publikasi ilmiah mengenai modifikasi fungsi biaya asosiasi spatio-temporal.

---

### JALUR RISET R03: Robust Visual Perception in Adverse Environments
- **Klasifikasi:** **Primary Scientific Track (Prioritas 1 - Pilar Utama ISVWS)**
- **Fokus Utama:** Persepsi visual tangguh dalam kondisi degradasi atmosfer dan pencahayaan ekstrem (kabut tebal, hujan lebat, malam hari tanpa penerangan, silau matahari terik), adaptasi domain (*domain adaptation*), dan kalibrasi ketidakpastian (*uncertainty estimation*).
- **Rasional Riset:** Model yang dilatih pada dataset cerah kota-kota Eropa/Amerika sering kali gagal total saat diterapkan di kawasan perkebunan, pesisir, dan hutan tropis Sumatera yang sering diselimuti kabut dan hujan lebat.
- **Persoalan Riset Inti:**
  1. *Physics-Informed Restoration for Detection*: Bagaimana mengintegrasikan model pembentukan citra atmosfer Koschmieder ke dalam backbone deep learning agar ekstraksi fitur tidak bias?
  2. *Zero-Shot Adverse Weather Adaptation*: Bagaimana mengadaptasi model deteksi ke kondisi hujan lebat secara instan tanpa memerlukan anotasi berlabel baru pada saat pengujian (*Test-Time Adaptation*)?
  3. *Evidential Uncertainty Calibration*: Bagaimana membuat model visi menyadari ketidaktahuannya (*know what it doesn't know*) dan memberikan skor ketidakpastian tinggi saat citra terlalu rusak untuk diprediksi?
- **Prasyarat Wajib:** Bab 12, 42, 50, ADV-01, ADV-06.
- **Kompetensi Metodologi:**
  - Uji ketahanan terhadap 15 tipe korupsi citra standar ImageNet-C pada 5 tingkat keparahan (*severity levels*).
  - Metrik Relative Mean Corruption Error (mCE) dan Error Degradation Curves.
  - Pengukuran Expected Calibration Error (ECE) dan Negative Log-Likelihood (NLL).
- **Dataset Acuan Benchmark:**
  - ExDark (Exclusively Dark: 7,363 low-light images dengan 12 kelas objek)
  - ACDC (Adverse Conditions Dataset: Fog, Night, Rain, Snow)
  - Foggy Cityscapes / Dark Zurich
  - ImageNet-C & ImageNet-P (Benchmark stabilitas perturbasi visual)
- **Daftar Pustaka Primer:**
  - Hendrycks & Dietterich, *"Benchmarking Neural Network Robustness to Common Corruptions and Perturbations"*, ICLR 2019.
  - Sakaridis et al., *"ACDC: The Adverse Conditions Dataset with Correspondences"*, ICCV 2021.
  - Loh & Chan, *"Getting to Know Clear Night, Foggy Night, and On-Site: The ExDark Dataset"*, CVIU 2019.
  - Wang et al., *"Tent: Fully Test-Time Adaptation by Entropy Minimization"*, ICLR 2021.
- **Target Luaran Riset:**
  - Publikasi riset unggulan mengenai arsitektur persepsi visual tahan kabut/malam untuk kawasan tropis Sumatera.
  - Rilis dataset uji benchmark lokal teratribusi penuh.

---

### JALUR RISET R04: Vision-Centric Multimodal Perception
- **Klasifikasi:** **Strategic Research Extension (Prioritas 2)**
- **Fokus Utama:** Sistem persepsi di mana kamera visual bertindak sebagai sensor primer ($>60\%$ otoritas spasial), yang didukung secara adaptif oleh modalitas komplementer (Radar, IMU, atau Sinyal Akustik), penanganan desinkronisasi temporal, dan ketahanan terhadap sensor dropout.
- **Rasional Riset:** Kamera optik menyediakan resolusi spasial dan kekayaan semantik tertinggi, namun rentan buta saat kabut ekstrem atau tertutup asap. Sensor komplementer (radar atau akustik) bertindak sebagai penyelamat (*fail-safe*) tanpa menggantikan peran utama visi.
- **Persoalan Riset Inti:**
  1. *Asynchronous Multimodal Fusion*: Bagaimana menyelaraskan aliran data dari kamera (30 FPS, latensi 33 ms) dengan radar/akustik (100 Hz, latensi 10 ms) yang memiliki cap waktu asinkron?
  2. *Graceful Degradation on Sensor Dropout*: Bagaimana merancang mekanisme fusi adaptif yang secara matematis menjamin sistem tidak mengalami penurunan performa drastis saat salah satu sensor terputus?
  3. *Cross-Modal Feature Alignment*: Bagaimana memetakan representasi gelombang mikrofon/radar ke dalam ruang embedding visual bersama tanpa distorsi informasi?
- **Prasyarat Wajib:** Bab 21, 51, 53, 55, ADV-01, ADV-04.
- **Kompetensi Metodologi:**
  - Uji ablasi sensor bertingkat (Visual-only vs Audio-only vs Fused).
  - Evaluasi ketahanan terhadap *Missing-Modality* dengan rasio dropout acak 0% hingga 100%.
  - Pengukuran latensi end-to-end pipa fusi dan throughput FPS pada perangkat keras nyata.
- **Dataset Acuan Benchmark:**
  - nuScenes (Camera + Radar + LiDAR subset)
  - AudioSet-Vision (Sinkronisasi peristiwa audio-visual)
  - Epic-Kitchens / UCF101-AudioVisual
- **Daftar Pustaka Primer:**
  - Caesar et al., *"nuScenes: A Multimodal Dataset for Autonomous Driving"*, CVPR 2020.
  - Baltrušaitis et al., *"Multimodal Machine Learning: A Survey and Taxonomy"*, IEEE TPAMI 2019.
  - Radu et al., *"Multimodal Deep Learning for Activity Recognition: A Study of Sensor Fusion"*, IEEE Pervasive 2018.
- **Target Luaran Riset:**
  - Model fusi adaptif sadar-keandalan yang dipublikasikan pada forum ilmiah internasional.
  - Purwarupa pemantauan multi-sensor kampus ITERA yang teruji secara eksperimental.

---

### JALUR RISET R05: Efficient Computer Vision & Edge AI Systems
- **Klasifikasi:** **Strategic Implementation Extension (Prioritas 2)**
- **Fokus Utama:** Rekayasa efisiensi inferensi model visi untuk perangkat keras tepi (Edge NPU, Jetson, MCU), kuantisasi INT8/INT4 pasca-pelatihan dan sadar-latihan, pemangkasan parameter, serta optimalisasi kurva Pareto latensi-daya-akurasi.
- **Rasional Riset:** Model visi cerdas terbaik tidak dapat disebarkan pada node pemantauan mandiri bertenaga surya jika menuntut GPU datacenter 400 Watt. Efisiensi komputasi adalah jembatan menuju kemandirian teknologi nyata.
- **Persoalan Riset Inti:**
  1. *Ultra-Low-Bit Quantization (INT4/INT2)*: Bagaimana mempertahankan akurasi deteksi objek saat bobot jaringan syaraf dikompresi hingga 4-bit atau binary?
  2. *Hardware-Aware Neural Architecture Search*: Bagaimana merancang struktur jaringan yang secara otomatis mengoptimalkan eksekusi kernel pada akselerator NPU spesifik (misal Google Coral / Hailo / Jetson)?
  3. *Energy-Accuracy Tradeoff Optimization*: Bagaimana merumuskan kompromi optimal antara konsumsi energi per frame (Joule/frame) dengan nilai mAP?
- **Prasyarat Wajib:** Bab 56, 57, 59, ADV-08.
- **Kompetensi Metodologi:**
  - Pengukuran latensi empiris pada perangkat fisik (bukan estimasi simulator): P95 dan P99 latency.
  - Pengukuran konsumsi daya listrik menggunakan power meter hardware (Watt / Joule per frame).
  - Pemetaan kurva Pareto akurasi vs latensi vs ukuran memori model.
- **Dataset & Benchmark Acuan:**
  - MLPerf Tiny Inference Benchmark
  - EdgeBench / Jetson Inference Benchmarks
  - COCO-val / ImageNet-1k subsets
- **Daftar Pustaka Primer:**
  - Jacob et al., *"Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference"*, CVPR 2018.
  - Howard et al., *"Searching for MobileNetV3"*, ICCV 2019.
  - Han et al., *"Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding"*, ICLR 2016.
- **Target Luaran Riset:**
  - Naskah riset optimasi sistem edge vision pada perangkat berdaya rendah.
  - Engine inferensi teroptimasi yang dapat diunduh publik dan dieksekusi instan.

---

### JALUR RISET R06: Spatial Intelligence & 3D Vision
- **Klasifikasi:** **Optional Research Specialization (Prioritas 3)**
- **Fokus Utama:** Rekonstruksi 3D dari citra tunggal atau multi-pandang, estimasi kedalaman monokular (*monocular depth estimation*), lokalisasi visual dan pemetaan (*visual SLAM / odometry*).
- **Rasional Riset:** Ekstensi pemahaman spasial dunia 3D dari proyeksi 2D. Diposisikan sebagai spesialisasi elektif bagi mahasiswa/peneliti yang tertarik pada sistem pemetaan topografi dan augmentasi spasial.
- **Persoalan Riset Inti:**
  1. *Scale Ambiguity in Monocular Depth*: Bagaimana menyelesaikan ambiguitas skala metrik absolut pada estimasi kedalaman kamera tunggal?
  2. *Robust Featureless Tracking in 3D*: Bagaimana mempertahankan pelacakan pose kamera pada permukaan yang seragam tanpa tekstur (dinding polos, jalan aspal)?
- **Prasyarat Wajib:** Bab 38, 39, 48, ADV-01, ADV-05.
- **Dataset Acuan Benchmark:** KITTI Odometry, NYU Depth V2, ScanNet, 7-Scenes.
- **Daftar Pustaka Primer:**
  - Mur-Artal & Tardós, *"ORB-SLAM2: An Open-Source SLAM System for Monocular, Stereo, and RGB-D Cameras"*, IEEE T-RO 2017.
  - Ranftl et al., *"Vision Transformers for Dense Prediction (DPT)"*, ICCV 2021.
- **Target Luaran Riset:**
  - Modul visual odometry mandiri teruji pada dataset benchmark internasional.

---

## 3. Komponen Metodologi Riset Bersama (Common Research Methodology)

Seluruh peserta jalur riset (R01–R06) diwajibkan melewati modul metodologi riset terstandarisasi sebelum mempublikasikan hasil eksperimen:

```
+---------------------------------------------------------------------------------------------------+
|                     STANDAR PROTOKOL METODOLOGI RISET TERVALIDASI                                |
+---------------------------------------------------------------------------------------------------+
 1. Formulasi Masalah Ilmiah & Hipotesis Terukur (Bukan sekadar coba-coba model)
 2. Audit Provenance Dataset: Hak cipta, lisensi terbuka, integritas ground truth, audit bias
 3. Protokol Reproduksi Baseline: Replikasi hasil paper rujukan pada seed acak yang sama
 4. Eksperimen Komparasi Kontrol: Pengujian adil (fair comparison) pada kondisi hardware yang sama
 5. Studi Ablasi (Ablation Study): Isolasi kontribusi setiap komponen inovasi secara terpisah
 6. Taksonomi Kegagalan (Failure Mode Analysis): Dokumentasi skenario kegagalan model secara transparan
 7. Uji Signifikansi Statistik: Rata-rata & deviasi standar dari minimal 3–5 running eksperimen
 8. Kepatuhan Reproducibility: Kode terstruktur, requirements.txt ter-pin, model weights terarsip
```

---

## 4. Matriks Pemetaan Jalur Riset terhadap Pilar ISVWS 2026–2040

| Jalur Riset | Identitas Jalur | Prioritas | Keselarasan Pilar ISVWS |
| :---: | :--- | :---: | :--- |
| **R01** | *Visual Detection & Recognition* | **P1 (Primary)** | Pilar 1: Intelligent Computer Vision — Ekstraksi fitur visual presisi tinggi. |
| **R02** | *Robust Multi-Object Tracking* | **P1 (Primary)** | Pilar 1 & 2: Intelligent Visual Sensing — Konsistensi spasio-temporal objek. |
| **R03** | *Robust Perception in Adverse Env* | **P1 (Primary)** | Pilar 2: Robust Visual Perception — Ketahanan tropis dan OOD detection. |
| **R04** | *Vision-Centric Multimodal Perception* | **P2 (Strategic)** | Pilar 3: Multimodal Sensing — Fusi adaptif kamera-audio-radar. |
| **R05** | *Efficient Edge AI Systems* | **P2 (Strategic)** | Pilar 4: Efficient Vision Systems — Komputasi berdaya rendah mandiri energi. |
| **R06** | *Spatial Intelligence & 3D Vision* | **P3 (Specialization)**| Ekstensi Geometri — Rekonstruksi spasial dan lokalisasi visual. |

