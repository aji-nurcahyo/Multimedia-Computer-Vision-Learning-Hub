# Format Pelaporan Rigor Statistik & Analisis Signifikansi (Statistical Reporting Standards)
## Berdasarkan Keputusan Tata Kelola Gate 6 & Standar Reproducibility NeurIPS/CVPR
### Institut Teknologi Sumatera (ITERA)

---

## 1. Mandat Rigor Statistik (Keputusan Gate 6 Approved)
Untuk seluruh eksperimen berbasis pembelajaran mesin stokastik:
1. **Jumlah Seed Minimum ($N \ge 3$):** Setiap angka performa model harus merupakan hasil agregasi dari minimal 3 eksekusi independen dengan seed acak yang berbeda (Rekomendasi: `seeds = [42, 1337, 2026]`).
2. **Pelaporan Sebaran Data:** Melaporkan nilai tendensi sentral (mean $\mu$) dan dispersi (standar deviasi sampel $\sigma$) dalam bentuk $\mu \pm \sigma$.
3. **Interval Kepercayaan (95% CI):** Menyertakan 95% Bootstrap Confidence Interval untuk metrik utama.
4. **Pengujian Hipotesis Kontekstual:** Uji signifikansi statistik disesuaikan dengan distribusi data. Nilai $p < 0.05$ tidak diperlakukan sebagai sertifikasi kebenaran mutlak; ia harus dianalisis bersama ukuran efek (effect size / Cohen's $d$).
5. **Pengecualian Deterministik:** Algoritma deterministik murni (misal: SVD analitik, filter konvolusi konvensional tanpa inisialisasi acak) tidak memerlukan pengulangan multi-seed; validasi dilakukan via pembuktian ekivalensi matematis.

---

## 2. Definisi Notasi Matematis

- **Nilai Rata-rata Sampel (Sample Mean):**
  $$\mu = \frac{1}{N} \sum_{i=1}^N x_i$$
- **Standar Deviasi Sampel (Sample Standard Deviation dengan Koreksi Bessel $N-1$):**
  $$\sigma = \sqrt{\frac{1}{N-1} \sum_{i=1}^N (x_i - \mu)^2}$$
- **Ukuran Efek (Cohen's $d$ Effect Size):**
  $$d = \frac{\mu_{\text{prop}} - \mu_{\text{base}}}{\sigma_{\text{pooled}}}, \quad \text{di mana } \sigma_{\text{pooled}} = \sqrt{\frac{\sigma_{\text{base}}^2 + \sigma_{\text{prop}}^2}{2}}$$
  - $|d| < 0.2$: Efek dapat diabaikan (negligible).
  - $0.2 \le |d| < 0.5$: Efek kecil (small).
  - $0.5 \le |d| < 0.8$: Efek sedang (medium).
  - $|d| \ge 0.8$: Efek besar dan bermakna praktis (large).

---

## 3. Template Tabel Pelaporan Statistik Multi-Seed

Berikut adalah format tabel baku pelaporan multi-seed:

| Model / Konfigurasi | Seed 42 | Seed 1337 | Seed 2026 | Rata-rata & Deviasi ($\mu \pm \sigma$) | 95% Bootstrap CI | Delta terhadap Baseline ($\Delta$) | Nilai $p$ (Paired $t$-test) | Cohen's $d$ (Effect Size) | Kesimpulan Signifikansi ($\alpha = 0.05$) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| Baseline ResNet-50 | 43.72 | 43.85 | 43.68 | $43.75 \pm 0.09$ | [43.69, 43.83] | — | — | — | Baseline Acuan |
| + Variasi A (Minor) | 43.91 | 43.80 | 43.95 | $43.89 \pm 0.08$ | [43.81, 43.94] | +0.14 | $p = 0.182$ | $d = 1.64$ | **Tidak Signifikan ($p \ge 0.05$)** |
| **+ Variasi B (Usulan)** | **45.12** | **45.30** | **45.24** | **$45.22 \pm 0.09$** | **[45.14, 45.29]** | **+1.47** | **$p = 0.003$** | **$d = 16.3$** | **Signifikan Nyata ($p < 0.05$)** |

---

## 4. Panduan Interpretasi Ilmiah
1. **Kenaikan metrik kecil namun $p < 0.05$:** Jika deviasi standar sangat kecil, perbedaan $\Delta = 0.1\%$ bisa memiliki $p < 0.05$, namun secara praktis tidak berdampak (effect size kecil). Peneliti harus bersikap jujur dan menyebutkan bahwa kenaikan ini marginal.
2. **Kenaikan metrik besar namun $p \ge 0.05$:** Ini biasanya terjadi jika variansi antar seed sangat tinggi (model tidak stabil). Peneliti harus memperbaiki stabilitas optimasi model sebelum mengklaim keunggulan.
3. **Penyajian Grafik:** Seluruh grafik batang perbandingan model wajib menyertakan error bar yang merepresentasikan $\pm 1\sigma$ atau 95% CI.

