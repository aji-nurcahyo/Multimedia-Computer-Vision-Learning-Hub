# Alur Riset Terpandu Jalur R03: Persepsi Robus dalam Kondisi Ekstrem
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Dataset &rarr; Baseline &rarr; Experiment &rarr; Evaluation &rarr; Analysis &rarr; Conclusion
### Target Standar: RESIDE Haze, Dark Zurich & ImageNet-C Common Corruptions

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Sistem persepsi otonom dan pengawasan luar ruangan di iklim tropis mengalami degradasi kontras drastis akibat hamburan partikel hujan lebat dan kabut, serta penurunan dynamic range tajam pada malam hari yang menyebabkan deep neural networks mengalami overconfidence error.
- **Research Question (RQ):** Bagaimana mengintegrasikan model fisik hamburan atmosferik (Koschmieder) dengan deep learning untuk merestorasi fidelitas citra dan mengkalibrasi ketidakpastian deteksi secara bersamaan?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Model peningkatan citra zero-reference yang dipandu prior fisik transmisi atmosferik akan meningkatkan PSNR minimal $+2.5\text{ dB}$ pada RESIDE SOTS dan menurunkan Expected Calibration Error (ECE) di bawah $0.06$ tanpa memerlukan pasangan citra supervisi sintetis.

---

## 3. Dataset Selection & Provenance (Audit Dataset)
- **Dataset Acuan:** RESIDE SOTS (Synthetic & Real Outdoor Haze), Dark Zurich (Nighttime Real Adverse), dan ImageNet-C.
- **Lisensi:** Penggunaan riset akademik terverifikasi.
- **Pemisahan Data:** 500 citra uji outdoor kanonikal pada RESIDE SOTS dan 151 citra uji Dark Zurich.

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline Model:** Dark Channel Prior (He et al., TPAMI 2011) dan Zero-DCE (Guo et al., CVPR 2020).
- **Verifikasi Sanity Check:** Memastikan baseline DCP mencapai $\text{SSIM} = 0.817 \pm 0.005$ pada RESIDE SOTS.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Tipe restorasi fisik, penyertaan loss kurvatur kuadratik Zero-DCE, dan penskalaan temperatur kalibrasi (Platt Scaling).
- **Variabel Dependen:** PSNR (dB), SSIM, LPIPS, mCE (mean Corruption Error), dan ECE.
- **Variabel Kontrol:** Resolusi input seragam, pipeline augmentasi Albumentations yang dikunci seed-nya.
- **Protokol Multi-Seed:** Evaluasi pada 3 random seeds independen: `seeds = [42, 1337, 2026]`.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Resmi:** `torchmetrics.image` / `scikit-image`.
- **Metrik Utama:** PSNR, SSIM, mCE, dan ECE (10-bin Expected Calibration Error).
- **Format Pelaporan:** $\mu \pm \sigma$ dan 95% Bootstrap Confidence Interval.

---

## 7. Analysis & Diagnostics (Analisis Kegagalan Restorasi)
- **Taksonomi Galat Visual:**
  - *Halo Artifacts:* Lonjakan nilai di sekitar kontur tepi kontras tinggi.
  - *Color Cast Shift:* Pergeseran white balance akibat kesalahan estimasi cahaya atmosferik $A$.
  - *Overconfidence in Void:* Model sangat yakin ($>90\%$) pada objek palsu di area kabut tebal.

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- **Sintesis Bukti:** Uji signifikansi paired t-test untuk membuktikan perbaikan PSNR dan reduksi ECE bermakna secara statistik.
- **Artefak Terbuka:** Skrip evaluasi mandiri dan telemetri per-sampel format static JSON.

