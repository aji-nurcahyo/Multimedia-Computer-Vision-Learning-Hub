# Alur Riset Terpandu Jalur R04: Vision-Centric Multimodal Perception
## Tier-B Guided Research Workflow: Problem &rarr; Hypothesis &rarr; Calibration &rarr; Baseline &rarr; Experiment &rarr; Evaluation &rarr; Analysis &rarr; Conclusion
### Target Standar: nuScenes Benchmark & Sensor Fusion Sumatera Maritime

---

## 1. Problem Formulation (Perumusan Masalah Ilmiah)
- **Konteks:** Sistem persepsi berbasis kamera tunggal sering kehilangan akurasi estimasi kedalaman (depth uncertainty tinggi) saat cuaca buruk atau pencahayaan malam, sementara radar memiliki keterbatasan resolusi sudut (*azimuth angle resolution*) meskipun akurat dalam jarak jangkau (*range*) dan kecepatan radial Doppler.
- **Research Question (RQ):** Bagaimana merumuskan model integrasi spasio-temporal visual-sentris dengan radar asinkron yang mampu memitigasi galat anisotropic tanpa memicu divergensi filter saat terjadi sensor dropout?

---

## 2. Hypothesis (Hipotesis Teruji)
- **Hipotesis ($H_1$):** Penerapan estimasi state Bayesian Kalman Filter dengan matriks kovariansi derau adaptif dan sinkronisasi timestamp asinkron akan mereduksi Root Mean Square Error (RMSE) lintasan minimal sebesar $35\%$ dibandingkan fusi rata-rata berbobot heuristik pada split validasi nuScenes-mini, terverifikasi pada $N \ge 3$ random seeds dengan paired Student's t-test ($\alpha = 0.05$).

---

## 3. Dataset Selection & Calibration Provenance (Audit Dataset)
- **Dataset Acuan:** nuScenes Multimodal Dataset (v1.0-mini split) dan FAIR-Play.
- **Lisensi:** CC-BY-NC-SA 4.0.
- **Audit Kalibrasi Ekstrinsik:** Matriks transformasi spasial $\mathbf{T}_{\text{cam} \to \text{rad}} \in \text{SE}(3)$ dan verifikasi keterlambatan temporal $\Delta t \le 20 \text{ ms}$.

---

## 4. Baseline Selection & Sanity Check (Baseline Pembanding)
- **Baseline 1:** Camera-Only Tracking Baseline (YOLOv8 + Extended Kalman Filter).
- **Baseline 2:** Heuristic Weighted Fusion ($50\%$ Camera $+ 50\%$ Radar).
- **Sanity Check:** Memastikan baseline lokal mencapai RMSE $\le 1.4 \text{ m}$ sebelum menguji algoritma fusi adaptif.

---

## 5. Experimental Design (Desain Eksperimen Terkontrol)
- **Variabel Independen:** Metode fusi (Heuristik vs Bayesian Kalman), tingkat derau sensor, dan tingkat dropout probabilitas ($0\%$ s.d. $30\%$).
- **Variabel Dependen:** Lintasan RMSE (m), Maksimum Error (m), Latensi fusi (ms), dan Konsistensi Kovariansi.
- **Variabel Kontrol:** Lintasan ground-truth, urutan frame temporal, dan sampling rate $10\text{ Hz}$.

---

## 6. Evaluation Protocol (Protokol Evaluasi Standar)
- **Library Acuan:** NumPy / SciPy / FilterPy.
- **Metrik Utama:** Trajectory RMSE (m), Max Position Error (m), Sensor Dropout Robustness Ratio.
- **Format Pelaporan:** $\mu \pm \sigma$ dengan 95% Bootstrap Confidence Interval.

---

## 7. Analysis & Diagnostics (Analisis Kegagalan Sensor)
- Audit mode kegagalan akibat *multipath radar ghost reflection* dan *visual camera blinding glare*.
- Evaluasi ketahanan elips ketidakpastian kovariansi $\mathbf{P}_{k|k}$.

---

## 8. Conclusion & Reproducibility (Kesimpulan & Paket Keterulangan)
- Verifikasi penerimaan hipotesis $H_1$ berdasarkan bukti statistik multi-seed.
- Rilis skrip komputasi mandiri `content/research/r04/examples/example-01.py` dan manifest JSON terstruktur.

