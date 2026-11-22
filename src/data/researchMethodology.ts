/**
 * L4 Research Methodology Framework (20 Canonical Stages)
 * Multimedia & Computer Vision Learning Hub - ITERA
 * 
 * Formal research lifecycle preparing researchers for peer-reviewed publication
 * (CVPR, ICCV, ECCV, IEEE TPAMI, Scopus Q1/Q2).
 */

export interface ResearchStage {
  step: number;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  keyQuestions: string[];
  detectionExample: string;   // R01: Visual Detection & Recognition
  trackingExample: string;    // R02: Multi-Object Tracking & Motion
  robustnessExample: string;  // R03: Robust Perception in Adverse Conditions
  deliverable: string;
}

export const RESEARCH_METHODOLOGY_STAGES: ResearchStage[] = [
  {
    step: 1,
    code: 'RM-01',
    category: 'Konseptualisasi & Perumusan Masalah',
    title: 'Perumusan Masalah Ilmiah (Scientific Problem Formulation)',
    subtitle: 'Mengisolasi gap teoritis dan empiris pada state-of-the-art',
    description: 'Mengidentifikasi batasan spesifik dari model penglihatan komputer terkini yang belum terpecahkan secara memuaskan oleh literatur, bukan sekadar menerapkan model yang ada pada dataset baru.',
    keyQuestions: [
      'Apa batasan mekanistik dari solusi SOTA saat ini?',
      'Mengapa model yang ada gagal pada kondisi operasional tertentu?',
      'Apakah masalah ini bersifat fundamental (representasi, optimasi, sampling)?'
    ],
    detectionExample: 'R01: Arsitektur transformer deteksi standar mengalami degradasi resolusi kuadratik saat mendeteksi objek < 16x16 piksel pada citra resolusi tinggi.',
    trackingExample: 'R02: Algoritma pelacak SORT kehilangan kontinuitas lintasan (identity switch) ketika objek mengalami oklusi total lebih dari 30 frame berurutan.',
    robustnessExample: 'R03: Model deteksi terbiasa dengan domain bersih mengalami penurunan akurasi drastis (>40% mAP) saat dihadapkan pada hamburan partikel hujan tropis dan kabut lebat.',
    deliverable: 'Problem Statement Matrix & Research Gap Taxonomy'
  },
  {
    step: 2,
    code: 'RM-02',
    category: 'Konseptualisasi & Perumusan Masalah',
    title: 'Pertanyaan Riset & Hipotesis Teruji (Research Questions & Hypotheses)',
    subtitle: 'Menyusun hipotesis ilmiah terukur dengan variabel independen/dependen',
    description: 'Merumuskan hipotesis kerja yang dapat dibuktikan secara salah (falsifiable) melalui pengujian empiris kuantitatif dengan kriteria keberhasilan yang didefinisikan secara apriori.',
    keyQuestions: [
      'Apakah hipotesis dapat diuji secara empiris dan difalsifikasi?',
      'Apa variabel independen yang dimanipulasi dan variabel dependen yang diukur?',
      'Apa kriteria keberhasilan kuantitatif minimum yang diharapkan?'
    ],
    detectionExample: 'R01: "Penggantian self-attention global dengan multi-scale deformable attention akan meningkatkan AP_small sebesar ≥ 2.5% tanpa meningkatkan latensi inferensi > 15%."',
    trackingExample: 'R02: "Penyatuan skor deteksi rendah (confidence 0.1–0.4) ke dalam asosiasi bipartite tahap kedua akan menurunkan ID switches hingga ≥ 30% pada MOT17."',
    robustnessExample: 'R03: "Penyisipan modul transmisi atmosferik berbasis Koschmieder pada backbone ekstraksi fitur akan mereduksi Expected Calibration Error (ECE) di bawah 0.08."',
    deliverable: 'Formal Hypothesis Specification Document'
  },
  {
    step: 3,
    code: 'RM-03',
    category: 'Konseptualisasi & Perumusan Masalah',
    title: 'Tinjauan Literatur & Analisis Kritis (Literature Review & Critical Analysis)',
    subtitle: 'Sintesis komparatif metodologi terdahulu dan dekonstruksi kelemahan',
    description: 'Melakukan telaah sistematis terhadap publikasi konferensi tier-1 (CVPR, ICCV, ECCV, NeurIPS) dan jurnal terindeks (TPAMI, IJCV) untuk memetakan evolusi arsitektur dan taksonomi solusi yang ada.',
    keyQuestions: [
      'Metode apa saja yang telah dicoba untuk menyelesaikan masalah ini dalam 5 tahun terakhir?',
      'Asumsi apa yang mendasari kegagalan pendekatan terdahulu?',
      'Di mana posisi kontribusi kebaruan penelitian ini dalam lanskap ilmiah?'
    ],
    detectionExample: 'R01: Menganalisis perbedaan mekanistik antara FPN, BiFPN, NAS-FPN, dan transformer feature pyramid dalam mempertahankan informasi spasial objek kecil.',
    trackingExample: 'R02: Menelaah evolusi paradigma Track-by-Detection (DeepSORT, ByteTrack, BoT-SORT) versus Track-by-Query (TrackFormer, MOTR).',
    robustnessExample: 'R03: Mengkomparasikan pendekatan domain generalisasi berbasis data augmentation (AutoAugment, Mixup) vs physical prior dehazing (Dark Channel Prior, Zero-DCE).',
    deliverable: 'Comprehensive Literature Taxonomy & Comparative SOTA Table'
  },
  {
    step: 4,
    code: 'RM-04',
    category: 'Data & Integritas Dataset',
    title: 'Pemilihan & Provenansi Dataset (Dataset Selection & Provenance Audit)',
    subtitle: 'Audit lisensi akademik, sensor capture, dan integritas pemisahan data',
    description: 'Menilai kesesuaian dataset benchmark terhadap pertanyaan penelitian, memastikan keabsahan lisensi akademik, serta mencatat karakteristik sensorik (resolusi, bit-depth, lux, FPS).',
    keyQuestions: [
      'Apakah lisensi dataset mengizinkan penggunaan riset akademik non-komersial?',
      'Apakah sensor dan kondisi akuisisi mewakili domain penerapan nyata?',
      'Apakah distribusi kelas memiliki bias atau ketidakseimbangan ekstrem?'
    ],
    detectionExample: 'R01: Memilih MS COCO 2017 (CC-BY 4.0) untuk general object detection dan VisDrone (Non-Commercial Research) untuk tiny aerial objects.',
    trackingExample: 'R02: Memilih benchmark resmi MOT17 (Pedestrians) dan DanceTrack (Articulated motion) untuk menguji asosiasi tanpa ketergantungan model penampilan ReID semata.',
    robustnessExample: 'R03: Menggunakan dataset RESIDE-v0 (Synthetic Haze) dan Dark Zurich (Nighttime Real Adverse) dengan audit pencahayaan lux lingkungan.',
    deliverable: 'Dataset Provenance Audit Sheet & License Compliance Record'
  },
  {
    step: 5,
    code: 'RM-05',
    category: 'Data & Integritas Dataset',
    title: 'Akuisisi Data & Protokol Anotasi (Data Acquisition & Annotation Protocols)',
    subtitle: 'Standarisasi pedoman anotasi dan pengukuran inter-annotator agreement',
    description: 'Menetapkan pedoman pelabelan (annotation guidelines) yang ketat untuk data baru, mencakup batas poligon/bounding box, aturan penanganan oklusi parsial, dan kriteria pemotongan (truncation).',
    keyQuestions: [
      'Bagaimana aturan penanganan objek yang terhalang > 80%?',
      'Berapa nilai inter-annotator agreement (Cohen’s Kappa atau IoU overlap)?',
      'Bagaimana prosedur anonymization untuk wajah dan pelat nomor kendaraan?'
    ],
    detectionExample: 'R01: Menetapkan threshold bounding box minimal 8x8 piksel dengan margin toleransi annotator IoU ≥ 0.85 untuk objek berjejal.',
    trackingExample: 'R02: Memastikan ID objek yang sama tidak pernah berubah saat objek bergerak di balik rintangan statis (tiang, pohon) selama rekaman video.',
    robustnessExample: 'R03: Pengambilan citra berpasangan (paired clear-rainy) menggunakan splitter optik beamsplitter untuk validasi ground truth pixel-to-pixel.',
    deliverable: 'Annotation Protocol Guidebook & Agreement Score Report'
  },
  {
    step: 6,
    code: 'RM-06',
    category: 'Data & Integritas Dataset',
    title: 'Validasi Ground-Truth & Audit Galat Label (Ground-Truth Validation & Noise Audit)',
    subtitle: 'Deteksi label noise, duplikasi bounding box, dan outlier spasial',
    description: 'Melakukan pembersihan terautomasi terhadap anotasi untuk menyingkirkan bounding box kosong (zero area), koordinat di luar dimensi citra, label tertukar, dan duplikasi deteksi.',
    keyQuestions: [
      'Berapa persentase label yang mengalami missing annotation atau false ground-truth?',
      'Apakah terdapat kebocoran data (data leakage) antar frame video berdekatan?',
      'Apakah koordinat poligon/bounding box dinormalisasi secara seragam?'
    ],
    detectionExample: 'R01: Mengaudit 500 sampel acak MS COCO val2017 untuk memverifikasi tidak ada objek terabaikan yang memicu false positive artifisial.',
    trackingExample: 'R02: Menginspeksi lintasan ground truth untuk menghilangkan trajectory jumping akibat kesalahan timestamp frame kamera.',
    robustnessExample: 'R03: Mengoreksi dynamic range overflow pada anotasi citra malam hari untuk mencegah saturasi artefak eksposur.',
    deliverable: 'Ground-Truth Quality Audit Report & Cleaned Annotation Manifest'
  },
  {
    step: 7,
    code: 'RM-07',
    category: 'Desain Eksperimen & Baseline',
    title: 'Pemilihan Algoritma Baseline Terakreditasi (Baseline Algorithm Selection)',
    subtitle: 'Menentukan standar pembanding representatif dari arsitektur dominan',
    description: 'Memilih algoritma pembanding resmi yang diakui komunitas ilmiah (bukan model buatan sendiri yang sengaja dilemahkan) agar klaim kebaruan memiliki validitas komparatif yang kokoh.',
    keyQuestions: [
      'Apakah baseline merepresentasikan standar emas saat ini di komunitas?',
      'Apakah kode sumber dan bobot pretrained baseline tersedia secara publik?',
      'Apakah baseline mencakup spektrum representasi yang seimbang (CNN vs Transformer)?'
    ],
    detectionExample: 'R01: Mengadopsi Faster R-CNN (ResNet-50-FPN) sebagai baseline klasik dan Deformable DETR sebagai baseline transformer modern.',
    trackingExample: 'R02: Mengadopsi ByteTrack dan BoT-SORT sebagai baseline primer karena mendominasi benchmark MOT17/MOT20.',
    robustnessExample: 'R03: Mengadopsi He et al. (Dark Channel Prior) untuk pendekatan berbasis fisika dan Zero-DCE untuk deep learning enhancement baseline.',
    deliverable: 'Baseline Specification & Verification Dossier'
  },
  {
    step: 8,
    code: 'RM-08',
    category: 'Desain Eksperimen & Baseline',
    title: 'Desain Eksperimen & Matriks Perlakuan (Experimental Design Matrix)',
    subtitle: 'Struktur eksperimen faktorial terkontrol dengan variabel terisolasi',
    description: 'Merancang matriks kombinasi eksperimental yang menguji hipotesis secara sistematis, memisahkan dampak masing-masing modul modifikasi terhadap baseline.',
    keyQuestions: [
      'Apakah desain eksperimen menggunakan pendekatan One-Factor-at-a-Time atau Full Factorial?',
      'Apakah ada potensi variabel perancu (confounding variables)?',
      'Bagaimana rencana pembagian sub-eksperimen untuk menjawab setiap pertanyaan riset?'
    ],
    detectionExample: 'R01: Matriks eksperimen 2x3: (Backbone: ResNet-50 vs Swin-Tiny) x (Attention Head: Standard vs Deformable vs Proposed Hybrid).',
    trackingExample: 'R02: Matriks eksperimen menguji asosiasi: (High-score matching only vs Two-stage ByteTrack vs Proposed Soft-Gating Kalman).',
    robustnessExample: 'R03: Matriks eksperimen menguji ketahanan model deteksi pada 5 level keparahan kabut sintetis (Fog Severity 1 s.d. 5).',
    deliverable: 'Factorial Experimental Design Matrix'
  },
  {
    step: 9,
    code: 'RM-09',
    category: 'Desain Eksperimen & Baseline',
    title: 'Pengendalian Variabel & Lingkungan Deterministik (Controlled Variables & Determinism)',
    subtitle: 'Penguncian hardware, software dependencies, dan random seed',
    description: 'Memastikan seluruh faktor non-metode dibuat identik: hardware GPU/CPU yang sama, versi pustaka yang dipin via requirements-lock, serta penonaktifan nondeterminisasi CUDA cuDNN.',
    keyQuestions: [
      'Apakah semua library (PyTorch, Torchvision, CUDA, cuDNN) telah dicatat versinya secara eksak?',
      'Apakah fungsi random seed mengunci random, numpy, dan torch di semua worker?',
      'Apakah flag torch.backends.cudnn.deterministic diatur ke True?'
    ],
    detectionExample: 'R01: Mengunci batch size (16), optimizer (AdamW lr=1e-4, weight_decay=1e-4), dan ukuran gambar (800x1333) di semua pengujian.',
    trackingExample: 'R02: Menjaga threshold deteksi (tau_high=0.6, tau_low=0.1) konstan saat membandingkan algoritma asosiasi gerak.',
    robustnessExample: 'R03: Mengontrol generator noise agar menghasilkan tingkat SNR yang persis sama pada setiap frame pengujian.',
    deliverable: 'Environment Lockfile (requirements-lock.txt) & Seed Setup Script'
  },
  {
    step: 10,
    code: 'RM-10',
    category: 'Desain Eksperimen & Baseline',
    title: 'Reproduksi Baseline Terverifikasi (Baseline Verification & Sanity Check)',
    subtitle: 'Memverifikasi bahwa baseline yang dijalankan mencapai metrik publikasi resmi',
    description: 'Sebelum menguji metode usulan, model baseline harus dilatih atau dievaluasi ulang untuk memastikan hasil replikasi berada dalam deviasi wajar (< 0.5% margin) dari makalah referensi.',
    keyQuestions: [
      'Apakah metrik evaluasi baseline lokal cocok dengan angka resmi makalah asli?',
      'Jika ada deviasi, apakah disebabkan oleh perbedaan hardware atau hyperparameter?',
      'Apakah model baseline bebas dari kebocoran dataset evaluasi?'
    ],
    detectionExample: 'R01: Memverifikasi Deformable DETR baseline mencapai mAP 43.8 ± 0.2 pada MS COCO val2017 sebelum menambahkan modul baru.',
    trackingExample: 'R02: Mengkonfirmasi ByteTrack mencapai HOTA 63.1 dan MOTA 80.3 pada MOT17 validation split dengan konfigurasi YOLOX-X.',
    robustnessExample: 'R03: Memastikan Dark Channel Prior mencapai SSIM ≥ 0.88 pada benchmark RESIDE Synthetic SOTS.',
    deliverable: 'Baseline Reproduction Verification Certificate'
  },
  {
    step: 11,
    code: 'RM-11',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Protokol Pelatihan & Inferensi Terstandarisasi (Training & Inference Protocols)',
    subtitle: 'Penegakan jadwal learning rate, gradient clipping, dan inferensi waktu-nyata',
    description: 'Menjalankan proses pelatihan dengan logging metrik komprehensif (loss curve, gradien norm, memory footprint) dan mengukur latensi inferensi dalam kondisi streaming murni.',
    keyQuestions: [
      'Apakah warmup learning rate dan cosine decay diterapkan secara konsisten?',
      'Apakah latensi diukur dengan GPU warmup (≥ 50 frame) dan sinkronisasi torch.cuda.synchronize()?',
      'Apakah FP16 mixed precision menghasilkan degradasi akurasi numerik?'
    ],
    detectionExample: 'R01: Pelatihan 50 epoch dengan gradient clipping norm 0.1; pencatatan latensi inferensi batch=1 tanpa visualisasi rendering.',
    trackingExample: 'R02: Pengukuran FPS pelacakan end-to-end yang mencakup waktu ekstraksi fitur CNN ditambah waktu eksekusi Hungarian matching.',
    robustnessExample: 'R03: Uji waktu inferensi per-frame pada model zero-reference enhancement di bawah batasan budget 30 FPS pada perangkat edge.',
    deliverable: 'Standardized Training Telemetry Logs & Latency Profiling Artifacts'
  },
  {
    step: 12,
    code: 'RM-12',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Seleksi Metrik Evaluasi Komprehensif (Evaluation Metric Standardization)',
    subtitle: 'Menetapkan metrik primer, sekunder, dan diagnostik yang tidak saling bias',
    description: 'Memilih kombinasi metrik yang saling melengkapi (akurasi vs latensi, precision vs recall, deteksi vs asosiasi) menggunakan pustaka evaluasi standar komunitas (pycocotools, TrackEval).',
    keyQuestions: [
      'Apakah metrik primer diakui oleh komunitas konferensi internasional?',
      'Apakah metrik sekunder mampu mendeteksi trade-off negatif dari metode usulan?',
      'Apakah pustaka evaluasi yang digunakan adalah rilis resmi yang terverifikasi?'
    ],
    detectionExample: 'R01: Primary: mAP@[.50:.95]; Secondary: AP50, AP75; Diagnostic: AP_Small, AP_Medium, AP_Large, AR@100.',
    trackingExample: 'R02: Primary: HOTA; Secondary: IDF1, MOTA; Diagnostic: DetA, AssA, ID Switches (IDSW), Fragmentations.',
    robustnessExample: 'R03: Primary: mCE (mean Corruption Error); Secondary: PSNR, SSIM, LPIPS; Calibration: ECE (Expected Calibration Error).',
    deliverable: 'Metric Suite Specification & Benchmark Script Integration'
  },
  {
    step: 13,
    code: 'RM-13',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Analisis Ketidakpastian & Rigor Statistik (Statistical Rigor & Multi-Seed Analysis)',
    subtitle: 'Evaluasi multi-seed (N >= 3), pelaporan mean ± std, dan uji signifikansi',
    description: 'Menjalankan baseline dan metode usulan pada minimal 3 seed acak independen (misal: seeds 42, 1337, 2026), menyajikan interval kepercayaan (95% CI), dan menguji signifikansi statistik.',
    keyQuestions: [
      'Berapa jumlah seed independen yang digunakan (N ≥ 3)?',
      'Apakah kenaikan metrik melebihi batas standar deviasi empiris (Δ > 2σ)?',
      'Apakah uji hipotesis (paired t-test / Wilcoxon) menghasilkan nilai p yang dapat dipertanggungjawabkan?'
    ],
    detectionExample: 'R01: Melaporkan mAP = 44.5 ± 0.2% (seed 42, 1337, 2026) dan menguji perbedaan terhadap baseline dengan paired t-test (p = 0.012).',
    trackingExample: 'R02: Menyajikan HOTA = 64.2 ± 0.3 dengan 95% bootstrap confidence interval [63.8, 64.6].',
    robustnessExample: 'R03: Membedakan eksperimen stokastik (multi-seed training) dari eksperimen deterministik fisik (DCP exact filtering).',
    deliverable: 'Statistical Significance Report & Confidence Interval Plots'
  },
  {
    step: 14,
    code: 'RM-14',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Studi Ablasi Komponen Mandiri (Component Ablation Isolation)',
    subtitle: 'Membongkar kontribusi spesifik setiap inovasi secara terisolasi',
    description: 'Menghapus atau menonaktifkan setiap komponen usulan secara satu per satu (One-Factor-at-a-Time) untuk membuktikan bahwa setiap elemen berkontribusi nyata terhadap performa akhir.',
    keyQuestions: [
      'Komponen mana yang memberikan kontribusi perbaikan terbesar?',
      'Berapa biaya komputasi (parameter, FLOPs, memori) yang dibayar untuk perbaikan tersebut?',
      'Apakah ada interaksi non-linear antar komponen yang digabungkan?'
    ],
    detectionExample: 'R01: Menguji (1) Baseline, (2) Baseline + Deformable Head, (3) + Focal Loss, (4) + Multi-Scale Feature Map secara terpisah.',
    trackingExample: 'R02: Mengisolasi dampak modul Camera Motion Compensation (CMC) secara terpisah dari modul Low-Score Association.',
    robustnessExample: 'R03: Menguji performa jaringan dehazing dengan dan tanpa loss regularisasi transmisi atmosferik.',
    deliverable: 'Standardized Ablation Study Table with FLOPs/Latency Accounting'
  },
  {
    step: 15,
    code: 'RM-15',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Analisis Taksonomi Galat & Kasus Kegagalan (Error Taxonomy & Failure Mode Analysis)',
    subtitle: 'Mengkategorikan galat prediksi dan menginspeksi 5% sampel terburuk',
    description: 'Mengklasifikasikan kesalahan prediksi ke dalam taksonomi formal (misal kerangka TIDE: localization, classification, background false positive, missing object) untuk mendiagnosis kelemahan model.',
    keyQuestions: [
      'Jenis galat apa yang mendominasi kegagalan model (salah posisi atau salah kelas)?',
      'Bagaimana karakteristik visual dari 5% sampel dengan skor evaluasi terburuk?',
      'Apakah kegagalan disebabkan oleh artefak dataset atau keterbatasan arsitektur?'
    ],
    detectionExample: 'R01: Mengidentifikasi bahwa 65% galat deteksi pada objek kecil disebabkan oleh localization error (IoU antara 0.2 dan 0.5).',
    trackingExample: 'R02: Menganalisis penyebab ID switches utama: 70% terjadi saat dua pejalan kaki berpapasan silang pada jarak < 10 piksel.',
    robustnessExample: 'R03: Menemukan fenomena halo artifacts di sekitar tepi objek kontras tinggi saat atmospheric light vector salah diestimasi.',
    deliverable: 'Failure Taxonomy Breakdown & Visual Error Gallery'
  },
  {
    step: 16,
    code: 'RM-16',
    category: 'Eksekusi & Evaluasi Empiris',
    title: 'Uji Robusitas & Generalisasi Lintas-Domain (Robustness & Cross-Domain Generalization)',
    subtitle: 'Menguji ketahanan model pada distribusi yang tidak terlihat (out-of-distribution)',
    description: 'Mengevaluasi performa model pada dataset eksternal tanpa pelatihan ulang (zero-shot transfer) dan menguji keandalan model di bawah degradasi sintetis terstandarisasi (ImageNet-C, COCO-C).',
    keyQuestions: [
      'Berapa penurunan performa model saat dievaluasi pada dataset dari sensor/lokasi berbeda?',
      'Bagaimana kurva degradasi performa seiring bertambahnya intensitas noise/blur/cuaca?',
      'Apakah kalibrasi model (probabilitas kepercayaan) tetap andal pada domain baru?'
    ],
    detectionExample: 'R01: Mengevaluasi model yang dilatih pada MS COCO langsung ke dataset VisDrone tanpa fine-tuning untuk mengukur generalisasi skala.',
    trackingExample: 'R02: Menguji pelacak pejalan kaki perkotaan (MOT17) pada video satwa liar hutan tropis (DanceTrack / Wildlife tracking).',
    robustnessExample: 'R03: Menguji model deteksi terhadap 15 jenis korupsi citra standar ImageNet-C (Gaussian noise, motion blur, fog, frost).',
    deliverable: 'Cross-Domain Degradation Curves & mCE Robustness Scorecard'
  },
  {
    step: 17,
    code: 'RM-17',
    category: 'Etika, Publikasi & Keterulangan',
    title: 'Etika Penelitian & Integritas Ilmiah (Research Ethics & Scientific Integrity)',
    subtitle: 'Menolak fabrikasi data, cherry-picking visual, dan klaim berlebih',
    description: 'Menjunjung etika akademik tertinggi: transparansi pelaporan kegagalan, tidak memanipulasi seed acak untuk mencari outlier tertinggi, serta mematuhi privasi data manusia (GDPR/UU PDP).',
    keyQuestions: [
      'Apakah visualisasi kualitatif mewakili performa rata-rata atau hasil cherry-picked yang bias?',
      'Apakah ada potensi bias diskriminatif terhadap kelompok demografi tertentu dalam dataset?',
      'Apakah privasi subjek manusia telah terlindungi melalui proses blur/anonymization?'
    ],
    detectionExample: 'R01: Menyajikan contoh visualisasi deteksi dari rentang median mAP, bukan hanya frame terbaik dengan akurasi 100%.',
    trackingExample: 'R02: Memastikan wajah pejalan kaki pada rekaman kampus/jalan raya diburamkan sebelum dataset dipublikasikan.',
    robustnessExample: 'R03: Mengakui secara jujur kondisi di mana metode usulan gagal memperbaiki citra (misal: saturasi cahaya lampu sorot ekstrem).',
    deliverable: 'Research Ethics & Privacy Compliance Statement'
  },
  {
    step: 18,
    code: 'RM-18',
    category: 'Etika, Publikasi & Keterulangan',
    title: 'Keterulangan Penuh & Rilis Artefak Terbuka (Full Reproducibility & Open Artifacts)',
    subtitle: 'Menyediakan repositori kode deterministik, bobot model, dan panduan run',
    description: 'Menyusun paket keterulangan yang memungkinkan peneliti independen mereplikasi seluruh angka dalam publikasi hanya dengan satu perintah eksekusi terpadu.',
    keyQuestions: [
      'Apakah repositori kode dapat dijalankan pada mesin bersih (clean environment) tanpa galat dependensi?',
      'Apakah bobot model pra-latih (weights) disediakan di repositori publik (HuggingFace / Zenodo)?',
      'Apakah setiap grafik dan tabel dalam artikel dapat direproduksi dari script logging yang disertakan?'
    ],
    detectionExample: 'R01: Menyediakan Jupyter Notebook Google Colab yang mereproduksi tabel evaluasi COCO val2017 secara otomatis.',
    trackingExample: 'R02: Menyertakan file output format MOTChallenge (.txt) dan script TrackEval untuk validasi independen instan.',
    robustnessExample: 'R03: Merilis dataset telemetri static JSON yang memuat seluruh nilai PSNR/SSIM dari 1000 citra uji.',
    deliverable: 'Reproducibility Checklist (Conforming to CVPR/NeurIPS Guidelines) & Artifact Repository'
  },
  {
    step: 19,
    code: 'RM-19',
    category: 'Etika, Publikasi & Keterulangan',
    title: 'Pelaporan Ilmiah & Visualisasi Data (Scientific Reporting & Data Visualization)',
    subtitle: 'Penyusunan naskah berstandar IEEE/CVF dengan visualisasi ilmiah presisi',
    description: 'Menulis artikel ilmiah dengan struktur formal: Pendahuluan terarah, Metodologi matematis yang presisi, Analisis eksperimental komparatif, dan Diskusi batasan yang jujur.',
    keyQuestions: [
      'Apakah setiap gambar dan diagram memiliki caption informatif yang dapat dipahami mandiri?',
      'Apakah skala grafik sumbu-Y jujur dan menyertakan error bar representatif?',
      'Apakah persamaan matematis ditulis dalam format LaTeX standar yang konsisten definisinya?'
    ],
    detectionExample: 'R01: Menyusun diagram arsitektur model menggunakan format SVG resolusi tinggi dengan penjelasan aliran tensor multi-skala.',
    trackingExample: 'R02: Menampilkan kurva HOTA versus DetA dan AssA untuk memperlihatkan trade-off deteksi versus asosiasi.',
    robustnessExample: 'R03: Menyajikan Reliability Diagram dan histogram kepercayaan model untuk memvisualisasikan kalibrasi probabilitas.',
    deliverable: 'Camera-Ready Scientific Manuscript Draft (IEEE / CVF Template)'
  },
  {
    step: 20,
    code: 'RM-20',
    category: 'Etika, Publikasi & Keterulangan',
    title: 'Persiapan Publikasi & Peer Review (Publication Preparation & Peer Review Defense)',
    subtitle: 'Navigasi proses submit konferensi/jurnal bereputasi dan tanggapan reviewer',
    description: 'Mempersiapkan materi submission lengkap (manuscript, supplementary material, rebuttal plan), memilih venue yang relevan (CVPR, ICCV, ECCV, TPAMI), dan merespons tinjauan sejawat secara ilmiah.',
    keyQuestions: [
      'Apakah target venue selaras dengan fokus kontribusi naskah (konferensi SOTA vs jurnal aplikasi)?',
      'Apakah supplementary material menyertakan pembuktian teorema dan detail implementasi mendalam?',
      'Bagaimana strategi pertahanan ilmiah dalam menanggapi kritik reviewer (rebuttal phase)?'
    ],
    detectionExample: 'R01: Menyiapkan materi suplemen berisi 20 visualisasi perbandingan deteksi objek kecil antara baseline vs metode usulan.',
    trackingExample: 'R02: Mengunggah video demo pelacakan 60 FPS pada DanceTrack ke tautan YouTube/Google Drive unlisted untuk supplementary.',
    robustnessExample: 'R03: Menyusun tabel perbandingan abalation tambahan untuk menjawab pertanyaan reviewer terkait variasi intensitas hujan.',
    deliverable: 'Complete Publication Submission Package & Peer Review Rebuttal Protocol'
  }
];

