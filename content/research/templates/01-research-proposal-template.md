# Proposal Riset Ilmiah (Scientific Research Proposal Template)
## Program Studi / Kelompok Riset: Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS)
### Institut Teknologi Sumatera (ITERA)

---

## 1. Identitas Proposal Penelitian
- **Judul Riset:** [Judul spesifik, ringkas, dan memuat variabel utama serta domain aplikasi]
- **Jalur Riset (Research Track):** [Pilih: R01 / R02 / R03 / R04 / R05 / R06]
- **Kategori Jalur:** [Primary Academic Anchor / Strategic Extension / Optional Specialization]
- **Pilar ISVWS Terkait:** [Pilar 1 / Pilar 2 / Pilar 3 / Pilar 4]
- **Peneliti Utama (Author):** [Nama Peneliti & NIM / NIDN]
- **Institusi / Laboratorium:** [Laboratorium Visi Komputer & Sistem Cerdas, ITERA]
- **Tanggal Pengajuan:** [YYYY-MM-DD]
- **Target Publikasi Ilmiah:** [Contoh: IEEE/CVF CVPR, ICCV, ECCV, IEEE TPAMI, atau Jurnal Scopus Q1/Q2]

---

## 2. Latar Belakang & Perumusan Masalah Ilmiah
### 2.1 Konteks Masalah
[Jelaskan konteks dunia nyata dan kebutuhan operasional yang melatarbelakangi penelitian ini.]

### 2.2 Batasan State-of-the-Art (Research Gap)
[Tunjukkan secara kritis mengapa model/arsitektur terkini (SOTA) gagal atau mengalami degradasi performa pada kondisi tertentu. Sebutkan minimal 3 rujukan makalah tier-1 terbaru.]

### 2.3 Rumusan Masalah Spesifik
1. [Rumusan masalah 1]
2. [Rumusan masalah 2]

---

## 3. Pertanyaan Riset & Hipotesis Teruji (Falsifiable Hypotheses)
- **Pertanyaan Riset 1 (RQ-1):** [Pertanyaan spesifik]
  - **Hipotesis 1 ($H_1$):** [Pernyataan hipotesis teruji dengan variabel independen dan dependen terukur]
- **Pertanyaan Riset 2 (RQ-2):** [Pertanyaan spesifik]
  - **Hipotesis 2 ($H_2$):** [Pernyataan hipotesis teruji]

---

## 4. Tinjauan Pustaka Terpilih & Baseline Acuan
| Model / Makalah Acuan | Arsitektur | Dataset Evaluasi | Metrik Utama | Kelemahan / Gap Teridentifikasi |
|---|---|---|---|---|
| [Model A, Tahun] | [CNN / ViT] | [COCO / MOT17] | [mAP / HOTA] | [Kelemahan spesifik] |
| [Model B, Tahun] | [Transformer] | [Benchmark] | [Metrik] | [Kelemahan spesifik] |

---

## 5. Metodologi Penelitian & Desain Eksperimental
### 5.1 Dataset Benchmark & Provenansi
- **Dataset Utama:** [Nama dataset, versi, dan lisensi akademik resmi]
- **Pemisahan Data (Data Split):** [Kanonikal train / validation / test set tanpa kebocoran data]
- **Sensor & Kondisi Akuisisi:** [Resolusi, bit-depth, lux pencahayaan, frame rate]

### 5.2 Desain Arsitektur Metode Usulan
[Deskripsikan modul usulan, perumusan matematis inti, dan perubahan terhadap arsitektur dasar.]

### 5.3 Desain Eksperimen Faktorial & Studi Ablasi
[Rancang tabel eksperimen yang mengisolasi kontribusi masing-masing komponen usulan secara mandiri.]

---

## 6. Protokol Validasi Empiris & Rigor Statistik
- **Algoritma Baseline Pembanding:** [Baseline standar emas yang akan direproduksi]
- **Protokol Multi-Seed:** Evaluasi dilakukan pada minimal $N = 3$ random seeds independen (misal: seeds 42, 1337, 2026).
- **Format Pelaporan Metrik:** $\text{Metric} = \mu \pm \sigma$ disertai 95% Bootstrap Confidence Interval.
- **Uji Signifikansi Statistik:** [Pilih: Paired Student's t-test / Wilcoxon signed-rank test dengan signifikansi $\alpha = 0.05$].

---

## 7. Rencana Kerja, Milestone & Manajemen Risiko
| Fase Milestone | Target Waktu | Aktivitas Utama | Indikator Keberhasilan (Deliverables) |
|---|---|---|---|
| Fase I | Bulan 1–2 | Reproduksi baseline SOTA | Baseline tereplikasi dalam margin $\le 0.5\%$ |
| Fase II | Bulan 3–5 | Implementasi modul usulan & ablasi | Eksperimen multi-seed dan tabel ablasi lengkap |
| Fase III | Bulan 6 | Analisis galat & penulisan naskah | Draf artikel ilmiah siap submit & paket artefak terbuka |

---

## 8. Pernyataan Etika & Keterulangan (Reproducibility Statement)
Peneliti berkomitmen merilis seluruh kode sumber, bobot model terlatih, script telemetri, dan panduan eksekusi deterministik di bawah lisensi terbuka akademik tanpa cherry-picking hasil visual.

