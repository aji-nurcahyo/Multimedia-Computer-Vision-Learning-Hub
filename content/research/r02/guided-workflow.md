# Alur Riset Terpandu Jalur R02: Pelacakan Multi-Objek & Dinamika Gerak (MOT)
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Dataset &rarr; Baseline &rarr; Experiment &rarr; Evaluation &rarr; Analysis &rarr; Conclusion
### Target Standar: MOT17 / MOT20 Challenge & DanceTrack Benchmarks

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Sistem pelacakan pejalan kaki dan kendaraan sering mengalami *identity switches* (IDSW) parah saat objek mengalami oklusi panjang ($> 30$ frame) atau bergerak silang di dekat target lain.
- **Research Question (RQ):** Bagaimana mempertahankan kontinuitas lintasan objek tanpa mengorbankan kecepatan inferensi waktu-nyata ($\ge 25$ FPS)?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Penggabungan kompensasi gerak kamera (CMC) afina dengan asosiasi deteksi dua-tahap (ByteTrack) akan menurunkan frekuensi pergantian identitas (ID switches) minimal sebesar $25\%$ pada benchmark MOT17, sambil mempertahankan skor HOTA $\ge 64.0\%$.

---

## 3. Dataset Selection & Provenance (Audit Dataset)
- **Dataset Acuan:** MOT17 Challenge (`MOT17-train` dan `MOT17-test` blind server) serta DanceTrack.
- **Lisensi:** CC-BY-NC 4.0 (Non-Commercial Academic Research).
- **Pemisahan Data:** MOT17 sequence train dibagi menjadi 50% training dan 50% internal validation tanpa pemisahan frame acak (zero frame-level leakage).

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline Model:** ByteTrack (Backbone YOLOX-X, deteksi publik, Kalman filter linier).
- **Verifikasi Sanity Check:** Memastikan baseline lokal mencapai $\text{HOTA} = 63.1 \pm 0.1\%$ dan $\text{MOTA} = 80.3 \pm 0.1\%$ pada split validasi MOT17.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Skema asosiasi (High-score matching only vs Two-stage ByteTrack vs Proposed Adaptive Gating) dan Kompensasi Gerak Kamera (GMC Enabled vs Disabled).
- **Variabel Dependen:** HOTA, DetA, AssA, IDF1, MOTA, IDSW, dan FPS.
- **Variabel Kontrol:** Deteksi input yang identik (YOLOX-X predictions), hardware GPU RTX 3090 / A100.
- **Protokol Multi-Seed:** Dijalankan pada 3 random seeds independen: `seeds = [42, 1337, 2026]`.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Resmi:** `TrackEval` (Official CVPR/IJCV benchmark package).
- **Metrik Utama:** $\text{HOTA} = \sqrt{\text{DetA} \cdot \text{AssA}}$, $\text{IDF1}$, $\text{MOTA}$, $\text{IDSW}$.
- **Format Pelaporan:** $\mu \pm \sigma$ dan 95% Bootstrap Confidence Interval.

---

## 7. Analysis & Diagnostics (Analisis Kegagalan Lintasan)
- **Taksonomi Galat Tracking:**
  - *Cross-Over IDSW:* Target berpapasan jarak dekat ($< 10$ px).
  - *Post-Occlusion Discontinuity:* Target hilang di balik rintangan statis.
  - *Ghost Trajectory:* Lintasan palsu yang terinisialisasi pada deteksi clutter.

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- **Sintesis Bukti:** Uji signifikansi paired t-test untuk membuktikan penurunan ID switches bermakna secara statistik.
- **Artefak Terbuka:** Skrip eksekusi TrackEval mandiri dan file lintasan teks berformat MOTChallenge.

