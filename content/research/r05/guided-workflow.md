# Alur Riset Terpandu Jalur R05: Efficient Computer Vision & Edge AI Systems
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Hardware Profiling &rarr; Baseline &rarr; Quantization &rarr; Evaluation &rarr; Analysis &rarr; Deployment
### Target Standar: MLPerf Mobile / Tiny & Edge NPU Architecture

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Model visi komputer mutakhir memiliki kebutuhan komputasi miliaran FLOPs dan ukuran memori puluhan megabyte, melebihi kapasitas memori on-chip (SRAM) dan batas disipasi daya termal (thermal envelope < 5W) pada perangkat edge / embedded NPU.
- **Research Question (RQ):** Bagaimana merancang skema kompresi model (kuantisasi affin asimetris INT8/INT4 dan pruning terstruktur) yang mampu mengatasi bottleneck memory bandwidth menurut model Roofline tanpa menurunkan akurasi mAP deteksi objek secara signifikan?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Penerapan kuantisasi affin asimetris INT8 dengan kalibrasi skala rentang dinamis mempertahankan $\ge 99\%$ mAP relatif terhadap model FP32 baseline, sekaligus memberikan akselerasi latensi inferensi P95 minimal $1.6\times$ pada subsistem memori bandwidth-terbatas, terverifikasi pada $N \ge 3$ random seeds.

---

## 3. Dataset Selection & Hardware Provenance (Audit Dataset & Perangkat Keras)
- **Dataset Acuan:** COCO 2017 Edge Validation Benchmark (subset 500 citra) dan MLPerf Mobile.
- **Lisensi:** CC-BY 4.0.
- **Audit Karakteristik Hardware:** Peak compute $100.0\text{ GFLOPS}$, DRAM bandwidth $25.6\text{ GB/s}$, operational ridge point $3.91\text{ FLOPs/Byte}$, batas termal throttling $T_{\text{max}} = 85^\circ\text{C}$.

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline 1:** Full Precision FP32 EdgeYOLO/MobileNet Model (Akurasi acuan: $42.5\%\text{ mAP}$).
- **Baseline 2:** Naive Dynamic Range Quantization (FP32 weights, INT8 runtime activation).
- **Sanity Check:** Memastikan inferensi FP32 menghasilkan metrik mAP stabil dengan latensi rata-rata $\le 45\text{ ms}$ sebelum optimasi kuantisasi.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Format presisi model (FP32, FP16, INT8 Affine, INT4 Affine), skema kalibrasi tensor (MinMax vs KL-Divergence).
- **Variabel Dependen:** mAP deteksi objek, latensi inferensi P50/P95/P99 (ms), penggunaan memori footprint (MB), efisiensi energi (mJ/frame).
- **Variabel Kontrol:** Resolusi input citra tetap ($640 \times 640$), batch size $= 1$, suhu awal pengujian $25^\circ\text{C}$.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Acuan:** ONNX Runtime / TensorRT / NumPy.
- **Metrik Utama:** mAP retention ratio (%), P95 Latency Speedup factor, Memory Compression Ratio, Thermal Stability Index.
- **Format Pelaporan:** $\mu \pm \sigma$ dengan interval kepercayaan 95% multi-seed ($N=3$).

---

## 7. Analysis & Diagnostics (Analisis Kegagalan Kompresi)
- Analisis *quantization noise* pada layer berbobot rentang lebar (outlier activations).
- Audit regresi akurasi pada representasi sub-8-bit (INT4) yang memerlukan Quantization-Aware Training (QAT).

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- Verifikasi batas kecepatan Roofline: layer depthwise bersifat *memory-bound* sehingga kuantisasi memotong byte transfer secara linier.
- Rilis artefak terstandarisasi: script mandiri `content/research/r05/examples/example-01.py`, manifest JSON, dan interactive lab.

