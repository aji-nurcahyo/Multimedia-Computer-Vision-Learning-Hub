# Protokol Reproduksi Baseline Resmi (Official Baseline Reproduction Protocol)
## Pedoman Replikasi Komputasi Deterministik & Validasi Sanity Check
### Institut Teknologi Sumatera (ITERA)

---

## 1. Tujuan Protokol
Protokol ini memandu peneliti dalam memvalidasi model baseline pembanding sebelum merancang atau mengevaluasi inovasi baru. Model usulan tidak dapat diklaim lebih unggul jika baseline lokal tidak berhasil mereplikasi angka rujukan resmi dalam batas toleransi wajar ($\le 0.5\%$).

---

## 2. Inventarisasi Rujukan Resmi Baseline
- **Nama Model / Algoritma:** [Contoh: ByteTrack (YOLOX-X Backbone)]
- **Publikasi Sumber:** Zhang et al., *"ByteTrack: Multi-Object Tracking by Associating Every Detection Box"*, ECCV 2022.
- **Repositori Resmi:** `https://github.com/ifzhang/ByteTrack`
- **Hash Commit Terverifikasi:** `[commit hash git]`
- **Angka Resmi Publikasi (Target Ground-Truth):**
  - Metrik Utama: [Contoh: MOT17 val set $\text{HOTA} = 63.1\%$, $\text{MOTA} = 80.3\%$, $\text{IDF1} = 77.8\%$]

---

## 3. Penegakan Lingkungan Komputasi Deterministik
Eksekusi pengujian harus memanggil fungsi penguncian seed deterministik berikut:

```python
import os, random, numpy as np, torch

def lock_deterministic_environment(seed: int = 42) -> None:
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    os.environ['CUBLAS_WORKSPACE_CONFIG'] = ':4096:8'
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    torch.use_deterministic_algorithms(True, warn_only=True)
    print(f"[REPRODUCIBILITY] Random Seed locked to {seed} across Python, NumPy, and PyTorch.")
```

---

## 4. Langkah-Langkah Verifikasi Sanity Check
1. **Verifikasi Lingkungan Bersih (Clean Virtual Environment):**
   - Buat virtual environment baru: `python -m venv venv_repro && source venv_repro/bin/activate`
   - Pasang dependensi terkunci: `pip install -r requirements-lock.txt`
2. **Audit Checksum Dataset:**
   - Jalankan script audit: `python tools/verify_dataset_checksums.py`
3. **Eksekusi Evaluasi Multi-Seed Baseline:**
   - Jalankan loop evaluasi untuk 3 seed:
     ```bash
     for seed in 42 1337 2026; do
       python tools/eval.py --config configs/baseline.yaml --seed $seed --output-dir results/seed_$seed
     done
     ```
4. **Perhitungan Metrik Rata-rata:**
   - Hitung nilai mean dan standar deviasi:
     $$\mu = \frac{1}{N} \sum_{i=1}^N M_i, \quad \sigma = \sqrt{\frac{1}{N-1} \sum_{i=1}^N (M_i - \mu)^2}$$

---

## 5. Lembar Rekapitulasi Verifikasi Baseline
| Metrik Evaluasi | Angka Resmi Makalah | Hasil Eksekusi Lokal (Seed 42) | Hasil Eksekusi Lokal (Seed 1337) | Hasil Eksekusi Lokal (Seed 2026) | Rata-rata Lokal ($\mu \pm \sigma$) | Deviasi Relatif ($\Delta$) | Status Kelayakan |
|---|---|---|---|---|---|---|---|
| HOTA (%) | 63.1 | 63.05 | 63.18 | 63.12 | 63.12 ± 0.07 | +0.02% | **VALID (Pass)** |
| MOTA (%) | 80.3 | 80.21 | 80.35 | 80.28 | 80.28 ± 0.07 | -0.02% | **VALID (Pass)** |
| IDF1 (%) | 77.8 | 77.72 | 77.89 | 77.81 | 77.81 ± 0.09 | +0.01% | **VALID (Pass)** |

---

## 6. Kriteria Kelulusan (Gate Approval Criteria)
- Jika deviasi relatif $|\Delta| \le 0.5\%$, baseline dinyatakan **TERVERIFIKASI (VERIFIED)** dan penelitian dapat dilanjutkan ke tahap modifikasi arsitektur.
- Jika $|\Delta| > 0.5\%$, peneliti dilarang melanjutkan modifikasi; identifikasi perbedaan versi dependensi, format rescaling bounding box, atau perbedaan hardware.

