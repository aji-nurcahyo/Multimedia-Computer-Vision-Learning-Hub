# Alur Riset Terpandu Jalur R01: Deteksi & Pengenalan Visual Cerdas
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Dataset &rarr; Baseline &rarr; Experiment &rarr; Evaluation &rarr; Analysis &rarr; Conclusion
### Target Standar: MS COCO 2017 & VisDrone Tiny Object Detection

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Deteksi objek berskala kecil ($< 16 \times 16$ piksel) pada citra drone udara dan pemantauan infrastruktur sering mengalami degradasi akurasi drastis pada detektor standar berbasis Transformer karena pemusnahan fitur spasial pada stride downsampling $32\times$.
- **Research Question (RQ):** Bagaimana merancang mekanisme atensi multi-skala yang mempertahankan detail geometris objek kecil tanpa melipatgandakan kompleksitas komputasi kuadratik $\mathcal{O}(N^2)$?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Penggantian self-attention global dengan multi-scale deformable attention (4 sampling points per level) yang dikombinasikan dengan generalized focal loss akan meningkatkan $\text{AP}_S$ pada objek kecil minimal sebesar $+2.0\%$ di atas baseline ResNet-50 tanpa meningkatkan latensi inferensi streaming lebih dari $15\%$.

---

## 3. Dataset Selection & Provenance (Audit Dataset)
- **Dataset Acuan:** MS COCO 2017 Detection Split (`train2017` / `val2017`) dan VisDrone-DET.
- **Lisensi:** CC-BY 4.0 (COCO) dan Academic Non-Commercial Use (VisDrone).
- **Pemisahan Kanonikal:** `train2017` (118.287 citra) untuk pelatihan; `val2017` (5.000 citra) untuk evaluasi performa model.
- **Audit Anotasi:** Bebas dari zero-area bounding boxes; margin toleransi annotator $\text{IoU} \ge 0.85$.

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline Model:** Deformable DETR (ResNet-50 Backbone, 4 feature levels, 300 object queries).
- **Verifikasi Sanity Check:** Memastikan baseline lokal mencapai $\text{mAP} = 43.8 \pm 0.1\%$ pada MS COCO val2017 sebelum menguji penambahan modul baru.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Tipe attention head (standar vs deformable), fungsi loss (Cross-Entropy vs Generalized Focal Loss), hierarki piramida fitur (Single vs Multi-Scale FPN).
- **Variabel Dependen:** $\text{mAP}@[.50:.95]$, $\text{AP}_S$, Parameter (M), FLOPs (G), Latensi P50 (ms).
- **Variabel Kontrol:** Hardware GPU yang sama, batch size 16, optimizer AdamW dengan learning rate $2 \times 10^{-4}$ dan weight decay $1 \times 10^{-4}$.
- **Protokol Multi-Seed:** Dijalankan pada minimal 3 random seeds independen: `seeds = [42, 1337, 2026]`.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Resmi:** `pycocotools.coco.COCOeval`.
- **Metrik Utama:** $\text{mAP}@[.50:.95]$, $\text{AP}_{50}$, $\text{AP}_{75}$, $\text{AP}_S$.
- **Format Pelaporan:** Nilai rata-rata $\mu \pm \sigma$ dan 95% Bootstrap Confidence Interval.
- **Uji Signifikansi:** Paired Student's t-test ($\alpha = 0.05$).

---

## 7. Analysis & Diagnostics (Analisis Galat & Taksonomi TIDE)
- **Dekomposisi Galat TIDE:**
  - Audit proporsi galat lokalisasi ($0.1 \le \text{IoU} < 0.5$) vs galat klasifikasi semantik.
  - Pengamatan visual pada 5% sampel dengan skor prediksi terendah.

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- **Sintesis Bukti:** Memverifikasi apakah hipotesis $H_1$ diterima atau ditolak berdasarkan data statistik multi-seed.
- **Artefak Terbuka:** Menyediakan file konfigurasi YAML, manifest JSON terstandarisasi, dan notebook reproduksi mandiri.

