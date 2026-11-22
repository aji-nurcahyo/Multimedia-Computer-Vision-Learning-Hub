# Panduan & Template Desain Studi Ablasi (Ablation Study Standards & Protocol)
## Berdasarkan Pedoman Evaluasi Dekonstruktif CVPR / ICCV / NeurIPS
### Institut Teknologi Sumatera (ITERA)

---

## 1. Filosofi Studi Ablasi
Studi ablasi (*ablation study*) bertujuan membuktikan bahwa keunggulan model yang diajukan bukan merupakan kebetulan empiris, melainkan berasal dari kontribusi mekanistik masing-masing komponen yang dirancang.

Aturan Utama:
1. **One-Factor-at-a-Time (OFAT):** Setiap baris pengujian hanya mengubah tepat satu modul, fungsi loss, atau mekanisme sampling dibandingkan baris acuan sebelumnya.
2. **Akuntansi Sumber Daya (Resource Accounting):** Setiap perbaikan metrik akurasi ($\Delta$) wajib mencantumkan biaya komputasi yang dikeluarkan (Parameter, FLOPs, Latensi per-frame).
3. **Penyajian Multi-Seed:** Angka pada tabel ablasi harus menyajikan nilai rata-rata dari minimal $N = 3$ random seeds ($\mu \pm \sigma$).

---

## 2. Format Baku Tabel Ablasi Arsitektural

Berikut adalah template tabel ablasi standar untuk naskah ilmiah:

| No | Konfigurasi Model | Modul A (e.g. Attention Head) | Modul B (e.g. Loss Function) | Modul C (e.g. Multi-Scale) | Metrik Primer (mAP / HOTA) | Metrik Sekunder (AP50 / MOTA) | Parameter (M) | FLOPs (G) | Latensi (ms) | Delta Primer ($\Delta$) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Baseline | Standar | Cross-Entropy | Single Scale | $38.2 \pm 0.2$ | $56.4 \pm 0.3$ | 25.5 | 12.4 | 14.2 | — |
| 2 | + Modul A | **Deformable** | Cross-Entropy | Single Scale | $40.8 \pm 0.3$ | $59.1 \pm 0.2$ | 26.8 | 14.1 | 16.5 | **+2.6** |
| 3 | + Modul B | **Deformable** | **Focal Loss** | Single Scale | $42.1 \pm 0.2$ | $60.8 \pm 0.3$ | 26.8 | 14.1 | 16.5 | **+1.3** |
| 4 | + Modul C (Full) | **Deformable** | **Focal Loss** | **Feature Pyramid** | $43.9 \pm 0.2$ | $62.7 \pm 0.2$ | 34.2 | 18.5 | 22.1 | **+1.8** |

---

## 3. Investigasi Hiperparameter Sensitivitas
Peneliti harus menguji sensitivitas terhadap hiperparameter kritis (misal: radius deformasi, parameter temperatur $\tau$, rank LoRA $r$, atau nilai weighting loss $\lambda$):

| Nilai Hiperparameter ($\tau$) | Metrik Primer (Top-1 Acc %) | Loss InfoNCE | Konvergensi Epoch | Catatan Pengamatan Empiris |
|:---:|:---:|:---:|:---:|:---|
| $\tau = 0.01$ | $68.4 \pm 0.4$ | Meledak / Instabil | 12 | Gradien mengalami saturasi ekstrem pada pasangan negatif terdekat. |
| $\tau = 0.07$ (Default SOTA) | **$78.2 \pm 0.2$** | Stabil | 30 | Penalti optimal antara hard negatives dan distribusi softmax. |
| $\tau = 0.20$ | $74.1 \pm 0.3$ | Konvergen Lambat | 30 | Distribusi probabilitas menjadi terlalu halus (under-confident). |
| $\tau = 0.50$ | $66.5 \pm 0.5$ | Gagal Mengelompok | 30 | Hilangnya sensitivitas terhadap perbedaan sudut embedding. |

---

## 4. Analisis Trade-Off Pareto Frontier
Gambarkan kurva atau plot trade-off antara peningkatan akurasi terhadap penambahan biaya komputasi:
- **Sumbu X:** Latensi Inferensi (ms) atau FLOPs (G).
- **Sumbu Y:** Akurasi Utama (mAP @[.50:.95] atau HOTA).
- **Titik Pareto:** Tunjukkan bahwa model yang diusulkan mendominasi kurva Pareto (efisiensi akurasi per millisecond lebih tinggi daripada alternatif).

---

## 5. Pertanyaan Evaluasi Kritis untuk Naskah
- Apakah kenaikan performa benar-benar berasal dari inovasi arsitektur, atau sekadar akibat penambahan kapasitas parameter jaringan?
- Apakah modul yang diusulkan tetap efektif bila ukuran backbone diperkecil atau diperbesar?
- Apakah ada komponen yang jika dibuang justru mempercepat model tanpa menurunkan performa secara signifikan?

