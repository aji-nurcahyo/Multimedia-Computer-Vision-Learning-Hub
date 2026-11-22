# Taksonomi Galat & Analisis Kasus Kegagalan (Error Taxonomy & Failure Mode Analysis)
## Kerangka Diagnostik Kegagalan Berdasarkan Framework TIDE & COCO Error Breakdown
### Institut Teknologi Sumatera (ITERA)

---

## 1. Urgensi Analisis Kasus Kegagalan
Dalam riset penglihatan komputer bereputasi, menyajikan angka metrik agregat yang tinggi tidaklah cukup. Peneliti diwajibkan melakukan dekonstruksi mekanistik terhadap sampel-sampel di mana model mengalami kegagalan prediksi.

Tujuan Analisis:
1. Menentukan apakah kegagalan didominasi oleh ketidakakuratan spasial (lokalisasi) atau ketidakakuratan semantik (klasifikasi).
2. Mengidentifikasi kelemahan mendasar arsitektur (misal: sensitivitas terhadap oklusi atau bias background).
3. Memberikan arah perbaikan yang jelas bagi penelitian lanjutan berikutnya.

---

## 2. Taksonomi Formal Galat Deteksi Objek (Framework TIDE)

Setiap prediksi false positive ($\text{FP}$) atau false negative ($\text{FN}$) diklasifikasikan ke dalam salah satu dari 5 kategori mutually exclusive:

```
Total Galat Prediksi
├── 1. Galat Lokalisasi (Localization Error / Loc)
│      └── Kelas benar, tetapi 0.1 <= IoU < Threshold (biasanya 0.50).
├── 2. Galat Klasifikasi (Classification Error / Cls)
│      └── IoU >= Threshold, tetapi kelas objek salah diprediksi.
├── 3. Galat Keduanya (Classification + Localization / Both)
│      └── Kelas salah DAN 0.1 <= IoU < Threshold.
├── 4. Halusinasi Latar Belakang (Background False Positive / Bkg)
│      └── Prediksi pada area background dengan IoU < 0.1 terhadap objek ground truth manapun.
└── 5. Objek Terlewat (Missed Ground-Truth / Miss / FN)
       └── Objek ground-truth yang tidak memiliki deteksi pasangan sama sekali.
```

---

## 3. Format Pelaporan Distribusi Galat (Error Breakdown Table)

| Kategori Galat | Jumlah Kasus (Count) | Persentase Total Galat (%) | Dampak Penurunan mAP ($\Delta \text{mAP}$) | Penyebab Mekanistik Hipotetis |
|---|:---:|:---:|:---:|---|
| **Localization Error** | 1.420 | 48.2% | -4.8% | Titik sampel deformabel belum cukup menyebar ke batas kontur luar objek. |
| **Classification Error** | 380 | 12.9% | -1.5% | Kebingungan semantik antar kelas berdekatan (misal: truk vs bus). |
| **Both (Loc + Cls)** | 190 | 6.5% | -0.8% | Objek berjejal di mana bounding box melingkupi dua objek sekaligus. |
| **Background Hallucination** | 410 | 13.9% | -1.9% | Tekstur dedaunan/aspal berpola periodik yang mengaktifkan feature map. |
| **Missed Object (FN)** | 545 | 18.5% | -2.6% | Objek berukuran $< 12 \times 12$ piksel atau terhalang oklusi $> 80\%$. |

---

## 4. Taksonomi Kasus Kegagalan Pelacakan Objek (MOT Diagnostics)

Untuk sistem tracking (R02), analisis galat difokuskan pada pemutusan lintasan:
1. **Identity Switch (IDSW):**
   - *Cross-Over IDSW:* Terjadi saat dua target berpapasan dengan lintasan silang.
   - *Post-Occlusion IDSW:* Terjadi setelah target keluar dari balik rintangan statis.
2. **Trajectory Fragmentation (Frag):**
   - Lintasan objek terputus menjadi potongan-potongan pendek karena deteksi hilang sesaat (1–5 frame).
3. **Ghost Trajectory (False Trajectory):**
   - Lintasan yang dibuat oleh pelacak di atas false positive latar belakang.

---

## 5. Galeri Visualisasi Kasus Terburuk (Worst 5% Test Sample Inspection)
Sajikan visualisasi side-by-side dari kasus-kasus pengujian di mana model menghasilkan IoU / skor terendah:

| Nomor Kasus | Citra Input Asli | Ground Truth (Hijau) | Prediksi Model (Merah) | Diagnosis Kegagalan |
|:---:|:---:|:---:|:---:|---|
| Kasus 1 | `sample_bad_01.jpg` | Box pejalan kaki $14\times 18$ px | Tidak ada deteksi (FN) | Resolusi terlalu rendah, fitur tereduksi di stride 32x. |
| Kasus 2 | `sample_bad_02.jpg` | Pejalan kaki tertutup payung | Terdeteksi sebagai payung | Oklusi parah merusak geometri fitur tubuh pejalan kaki. |
| Kasus 3 | `sample_bad_03.jpg` | Pantulan lampu jalan di aspal | Terdeteksi sebagai mobil | Glare pantulan air aspal memicu false positive. |

