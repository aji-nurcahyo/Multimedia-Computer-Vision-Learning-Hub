# SILABUS KURIKULUM PENELITIAN JALUR R05 (L4 RESEARCH-READY)
## Efficient Computer Vision & Edge AI Systems
### Quantization Arithmetic, Roofline Operational Bounds, Neural Architecture Search, and Edge Latency Profiling

**Kode Jalur:** R05  
**Kategori:** Strategic Extension  
**Pilar:** Pilar 1: Intelligent Computer Vision  
**Target Akademik:** L4 — Research-Ready (Persiapan Publikasi IEEE CVPR / MLSys / TinyML / IEEE TCAS)  
**Institusi Penyelenggara:** Institut Teknologi Sumatera (ITERA)  
**Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Penyelarasan Strategis:** Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  

---

### 1. Taksonomi Masalah Penelitian (Research Problem Taxonomy)
Riset efisiensi komputasi visi komputer berfokus pada optimasi inferensi model deep learning agar dapat dieksekusi secara real-time pada perangkat edge berdaya rendah (microcontroller, smartphone NPU, edge AI accelerator):
1. **Model Compression & Precision Reduction:** Mengurangi presisi representasi numerik bobot dan aktivasi dari FP32 ke FP16, INT8, INT4, atau biner (1-bit), serta kompresi bobot menggunakan pruning terstruktur/tak terstruktur.
2. **Hardware-Aware Neural Architecture Search (HW-NAS):** Merancang topologi jaringan saraf (misalnya Inverted Residual, Depthwise Separable, MobileOne) yang secara spesifik dioptimasi untuk arsitektur memori cache, DMA transfer, dan tensor core perangkat keras target.
3. **Execution Runtime & Memory Bandwidth Optimization:** Memetakan komputasi graf inferensi ke dalam kernel terakselerasi (TensorRT, ONNX Runtime, TFLite Micro) dengan fusi operator (Operator Fusion) untuk meminimalkan transfer data antara on-chip SRAM dan off-chip DRAM.

Fokus penelitian R05 adalah: **Kuantisasi affin asimetris, analisis batas operasional Roofline model, dan pemodelan latensi statistik P95/P99 untuk deployment deteksi objek pada platform edge berdaya komputasi terbatas di Indonesia.**

---

### 2. Latar Belakang Ilmiah & SOTA Gap (Scientific Background)
Pengembangan model visi modern sering kali memprioritaskan akurasi mAP absolut di server GPU berperforma tinggi tanpa memperhitungkan batasan termal (< 5W) dan keterbatasan bandwidth memori perangkat edge. Paradoks umum dalam edge computing adalah: mengecilkan FLOPs model via konvolusi depthwise tidak selalu mempercepat inferensi karena rendahnya *Arithmetic Intensity* ($\text{FLOPs/Byte}$), yang justru menjebak eksekusi ke dalam rezim *Memory-Bandwidth Bound*. Selain itu, banyak publikasi hanya melaporkan latensi rata-rata ($\mu$) pada kondisi ideal, padahal sistem real-time membutuhkan jaminan *tail latency* (P95/P99) yang tahan terhadap *thermal throttling*. Kesenjangan ilmiah yang diatasi pada jalur R05 adalah: merumuskan analisis komprehensif trade-off akurasi-latensi-energi (Pareto Frontier) menggunakan kuantisasi affin terkalibrasi dan model Roofline yang dapat diverifikasi secara empiris.

---

### 3. Kajian Literatur & Paper Kunci (Key Literature & Citations)
- **Fondasi Kuantisasi & Kompresi:**
  - Jacob, B., et al. "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference." *CVPR 2018*. (Fondasi formal kuantisasi integer affin).
  - Nagel, M., et al. "A White Paper on Neural Network Quantization." *arXiv:2106.08295, 2021*. (Survei komprehensif PTQ dan QAT).
  - Han, S., Mao, H., and Dally, W. J. "Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding." *ICLR 2016*. (Perintisan kompresi bobot).
- **Arsitektur Efisien & Batas Perangkat Keras:**
  - Howard, A., et al. "Searching for MobileNetV3." *ICCV 2019*. (Optimalisasi arsitektur edge terpadu).
  - Williams, S., Waterman, A., and Patterson, D. "Roofline: An Insightful Visual Performance Model for Multicore Architectures." *CACM 2009*. (Model batas teoritis komputasi vs memori).
  - Reddi, V. J., et al. "MLPerf Mobile Inference Benchmark: An Industry-Standard Mobile Machine Learning Performance Benchmark." *IEEE Micro 2021*. (Standarisasi benchmark latensi edge).

---

### 4. Pertanyaan Penelitian & Hipotesis Teruji (Research Questions & Hypotheses)
- **Research Question 1 (RQ1):** Apakah kuantisasi affin asimetris INT8 dengan dynamic range scaling mampu mempertahankan akurasi mAP $\ge 99\%$ dari baseline FP32 sekaligus memberikan percepatan latensi P95 $\ge 1.6\times$ pada layer memory-bound?
- **Hipotesis ($H_1$):** Penerapan kuantisasi affin asimetris INT8 pada model deteksi objek edge mempertahankan retensi akurasi $\ge 99\%$ mAP dan menghasilkan percepatan latensi P95 minimal $1.6\times$ pada subsistem komputasi dengan rasio arithmetic intensity di bawah ridge point Roofline ($N \ge 3$ seeds, paired t-test $p < 0.01$).
- **Hipotesis Nol ($H_0$):** Kuantisasi INT8 menyebabkan degradasi akurasi signifikan (> 1% drop) atau tidak menghasilkan percepatan latensi yang signifikan secara statistik.

---

### 5. Pemilihan & Audit Provenansi Dataset (Dataset Provenance & Audit)
1. **COCO 2017 Edge Benchmark Subset (val500):**
   - URL Resmi: `https://cocodataset.org/`
   - Lisensi: CC-BY 4.0.
   - Karakteristik: 500 citra terpilih yang merepresentasikan distribusi objek deteksi standar pada resolusi $640 \times 640$.
   - Audit Kalibrasi: Skema normalisasi warna RGB channel-wise $[0, 1]$ dan padding citra bebas artifak.

---

### 6. Standar Evaluasi Ground-Truth (Ground-Truth Standards)
- Ground-truth bounding box format MS COCO: $[x_{\text{min}}, y_{\text{min}}, \text{width}, \text{height}]$.
- Evaluasi IoU threshold dari $0.50$ hingga $0.95$ dengan step $0.05$ (mAP@[.50:.95]).
- Baseline akurasi FP32 acuan: $42.50\%\text{ mAP}$.

---

### 7. Spesifikasi Metode Baseline (Baseline Method Specifications)
- **Model Arsitektur:** EdgeYOLO-Tiny / MobileNetV4-Small backbone.
- **Ukuran Model FP32:** 5.8 Juta parameter ($23.2\text{ MB}$).
- **Target Komputasi:** 4.2 GFLOPs pada resolusi $640 \times 640$.
- **Runtime:** Simulated Edge NPU dengan bandwidth DRAM $25.6\text{ GB/s}$ dan peak compute $100\text{ GFLOPS}$.

---

### 8. Fondasi Matematis (Mathematical Foundations)
1. **Pemetaan Kuantisasi Affin Asimetris:**
   $$q = \text{clip}\left(\left\lfloor \frac{r}{S} \right\rceil + Z, q_{\text{min}}, q_{\text{max}}\right)$$
   $$S = \frac{r_{\text{max}} - r_{\text{min}}}{q_{\text{max}} - q_{\text{min}}}, \quad Z = \text{round}\left(-\frac{r_{\text{min}}}{S}\right)$$
   di mana $r$ adalah nilai real FP32, $q$ adalah representasi quantized integer, $S$ adalah quantization scale, dan $Z$ adalah zero-point offset integer.
2. **Rekonstruksi Dekuantisasi:**
   $$\hat{r} = S \cdot (q - Z)$$
3. **Model Batas Roofline (Roofline Performance Bound):**
   $$P_{\text{achievable}} = \min\left(P_{\text{peak}}, I \cdot B_{\text{mem}}\right)$$
   di mana $P_{\text{peak}}$ adalah puncak throughput komputasi (GFLOPS), $I$ adalah Arithmetic Intensity ($\text{FLOPs/Byte}$), dan $B_{\text{mem}}$ adalah bandwidth memori (GB/s).
   Ridge point ditentukan oleh: $I_{\text{ridge}} = \frac{P_{\text{peak}}}{B_{\text{mem}}}$.

---

### 9. Instruksi Reproduksi Baseline Komputasi (Baseline Reproduction Protocol)
1. Jalankan skrip komputasi terverifikasi untuk mengukur kuantisasi, roofline, dan profil latensi:
   ```bash
   python content/research/r05/examples/example-01.py
   ```
2. Pastikan hasil perhitungan menunjukkan:
   - Kuantisasi INT8 valid dengan scale dan zero-point terkalibrasi.
   - Retensi akurasi INT8 $\ge 99\%$ mAP.
   - P95 latency speedup $\approx 1.77\times$ acceleration.
3. Jalankan notebook penelitian pada `content/research/r05/notebooks/r05-research-baseline.ipynb`.

---

### 10. Variabel Eksperimen & Desain Kontrol (Variables & Experimental Controls)
| Kategori Variabel | Nama Variabel | Konfigurasi Uji |
|---|---|---|
| **Variabel Independen** | Format Presisi Model | FP32, FP16, INT8 Affine, INT4 Affine |
| **Variabel Independen** | Tingkat Pruning Bobot | $0\%, 25\%, 50\%$ structured channel pruning |
| **Variabel Dependen** | Performa Inferensi | mAP (%), P50 Latency (ms), P95 Latency (ms), P99 Latency (ms) |
| **Variabel Kontrol** | Lingkungan Komputasi | Clock CPU/NPU terkunci, batch size $= 1$, suhu awal pengujian |

---

### 11. Protokol Validasi Statistik (Gate 6 Multi-Seed Protocol)
- **Random Seeds Minimum ($N \ge 3$):** `[42, 1337, 2026]`.
- Pengukuran latensi dilakukan sebanyak 500 iterasi inferensi per seed setelah fase *warm-up* 50 iterasi.
- Pelaporan metrik disajikan dalam bentuk rata-rata $\mu$, deviasi standar $\sigma$, dan 95% Confidence Interval.

---

### 12. Desain Matriks Studi Ablasi (Factorial Ablation Study)
1. **Ablasi 1: Skema Kalibrasi Rentang Dinamis (MinMax vs Histogram KL-Divergence vs Percentile):**
   - Menilai pengaruh pemotongan outlier nilai aktivasi terhadap MSE kuantisasi.
2. **Ablasi 2: Pengaruh Layer-wise Precision (Mixed-Precision INT8 + FP16 Head):**
   - Menguji isolasi lapisan deteksi sensitif untuk mencegah penurunan skor recall.
3. **Ablasi 3: Efek Thermal Throttling terhadap Tail Latency P99:**
   - Membandingkan kestabilan latensi pada kondisi pendinginan pasif vs aktif.

---

### 13. Taksonomi Analisis Galat (Edge Profiling Error Taxonomy)
1. **Quantization Clipping Error:** Pemotongan nilai ekstrem (outliers) menyebabkan hilangnya sinyal fitur penting.
2. **Zero-Point Rounding Jitter:** Pembulatan integer menggeser distribusi mean aktivasi jaringan.
3. **Memory Bottleneck Stall:** Core akselerator menganggur (*pipeline stall*) menunggu pembacaan bobot dari DRAM.
4. **Thermal Throttling Jitter:** Penurunan frekuensi clock prosesor secara mendadak akibat panas yang melipatgandakan latensi P99.

---

### 14. Pengujian Kekokohan & Generalisasi Domain (Robustness Testing)
- Pengujian toleransi terhadap degradasi resolusi masukan ($320 \times 320$ vs $640 \times 640$).
- Pengujian deployment pada edge board dengan variasi pasokan daya (voltase rendah pada sistem IoT tenaga surya).

---

### 15. Kebutuhan Komputasi & Lingkungan Reproducible (Compute Environment)
- **Hardware Target:** CPU x86-64 / Arm64 (Raspberry Pi 5 / Jetson Orin Nano / simulated environment).
- **Perangkat Lunak:** Python 3.10+, NumPy, ONNX Runtime 1.16+, Matplotlib.
- **Konsumsi Daya Target:** $\le 3.5 \text{ Watt}$ per proses inferensi berkelanjutan.

---

### 16. Standar Pelaporan Ilmiah & Format Tabel (Scientific Reporting)
Format tabel wajib berstandar MLSys / TinyML / CVPR:
```markdown
| Model Variant | Precision | Parameter (M) | Footprint (MB) ↓ | mAP@[.5:.95] (%) ↑ | P95 Latency (ms) ↓ | Energy (mJ) ↓ |
|---|---|---|---|---|---|---|
| EdgeYOLO Baseline | FP32 | 5.8 | 23.2 | 42.50 ± 0.00 | 42.1 ± 0.8 | 63.2 |
| EdgeYOLO FP16 | FP16 | 5.8 | 11.6 | 42.49 ± 0.01 | 31.4 ± 0.6 | 47.1 |
| **EdgeYOLO INT8 (Ours)** | **INT8** | **5.8** | **5.8 (4.0×)** | **42.50 ± 0.00** | **23.8 ± 0.5 (1.77×)** | **35.7** |
| EdgeYOLO INT4 | INT4 | 5.8 | 2.9 (8.0×) | 42.39 ± 0.02 | 20.1 ± 0.4 (2.09×) | 30.1 |
```
*Catatan: Seluruh data metrik divalidasi dari $N=3$ random seeds terdaftar. Angka latensi P95 dan speedup merupakan estimasi pemodelan analitis Roofline dan simulasi profiling termal terkontrol (`educational_simulation`), bukan pengukuran instrumen fisik langsung pada silikon edge NPU riil.*

---

### 17. Etika Penelitian & Implikasi Keselamatan (Research Ethics)
- **Keamanan Sistem Edge Kritis:** Menghindari kegagalan deteksi objek pedestrian pada sistem ADAS yang disebabkan oleh kompresi model yang terlalu agresif.
- **Transparansi Benchmark:** Menghindari pelaporan metrik latensi teoritis (FLOPs semata) yang menyesatkan tanpa memverifikasi waktu eksekusi riil dan disipasi termal.

---

### 18. Daftar Periksa Kesiapan Publikasi (Publication-Readiness Checklist)
- [x] Skema kuantisasi affin asimetris dirumuskan dengan notasi matematis formal.
- [x] Analisis batas memori model Roofline diverifikasi dengan titik ridge eksplisit.
- [x] Protokol multi-seed $N \ge 3$ dipatuhi dan dicatat dalam manifest JSON.
- [x] Profil latensi mencakup persentil P50, P95, dan P99 untuk mendeteksi thermal throttling.
- [x] Skrip eksekusi mandiri bebas galat dan siap direproduksi.

