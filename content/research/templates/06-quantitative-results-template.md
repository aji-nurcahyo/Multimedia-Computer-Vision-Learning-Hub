# Template Pelaporan Hasil Kuantitatif Benchmark (Quantitative Benchmark Reporting Template)
## Format Tabel Komparasi Komprehensif Berstandar Konferensi Internasional
### Institut Teknologi Sumatera (ITERA)

---

## 1. Panduan Penyajian Tabel Komparasi Utama
Tabel komparasi utama harus memuat perbandingan langsung antara metode usulan dengan metode-metode state-of-the-art paling mutakhir pada dataset benchmark resmi yang sama.

Aturan Penting:
- **Bold:** Menandai performa terbaik pada kolom tersebut.
- *Italic / Underline:* Menandai performa terbaik kedua.
- Cantumkan sumber rujukan atau nomor publikasi untuk setiap metode pembanding.
- Laporkan angka lengkap dengan deviasi standar $(\mu \pm \sigma)$ jika tersedia.

---

## 2. Contoh Tabel Komparasi Deteksi Objek (R01 — MS COCO val2017)

| Metode / Model | Publikasi | Backbone | Epochs | mAP@[.50:.95] | $\text{AP}_{50}$ | $\text{AP}_{75}$ | $\text{AP}_S$ | $\text{AP}_M$ | $\text{AP}_L$ | Params (M) | FLOPs (G) | FPS |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Faster R-CNN | TPAMI'17 | ResNet-50 | 36 | 38.4 | 59.2 | 41.5 | 21.6 | 42.1 | 50.1 | 41.5 | 180 | 22 |
| DETR | ECCV'20 | ResNet-50 | 500 | 42.0 | 62.4 | 44.2 | 20.5 | 45.8 | 61.1 | 41.0 | 187 | 28 |
| Deformable DETR | ICLR'21 | ResNet-50 | 50 | 43.8 ± 0.1 | 62.6 ± 0.1 | 47.7 ± 0.2 | 26.4 ± 0.2 | 47.1 ± 0.1 | 58.0 ± 0.2 | 39.8 | 173 | 19 |
| DINO-DETR | ICLR'23 | ResNet-50 | 36 | *49.0* | *66.6* | *53.5* | *32.0* | *52.3* | *63.0* | 47.0 | 279 | 14 |
| **Metode Usulan** | **Ours** | **ResNet-50** | **36** | **49.8 ± 0.2** | **67.4 ± 0.2** | **54.2 ± 0.3** | **33.6 ± 0.3** | **53.1 ± 0.2** | **63.8 ± 0.2** | **45.2** | **240** | **17** |

---

## 3. Contoh Tabel Komparasi Pelacakan Multi-Objek (R02 — MOT17 Test Benchmark)

| Tracker | Detection Source | HOTA ↑ | DetA ↑ | AssA ↑ | IDF1 ↑ | MOTA ↑ | FP ↓ | FN ↓ | IDSW ↓ | Frag ↓ | Hz ↑ |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| DeepSORT | Private | 43.3 | 47.9 | 39.6 | 62.2 | 61.4 | 37,911 | 189,405 | 2,072 | 4,852 | 16.0 |
| FairMOT | Joint | 59.3 | 60.9 | 58.0 | 72.3 | 73.7 | 27,507 | 117,477 | 3,303 | 8,073 | 25.9 |
| ByteTrack | Public (YOLOX) | *63.1* | *64.5* | *62.0* | *77.4* | *80.3* | *25,491* | *83,721* | *2,196* | *2,277* | **29.6** |
| BoT-SORT | Public (YOLOX) | 65.0 | 65.5 | 64.9 | 79.5 | 80.5 | 22,521 | 86,037 | 1,212 | 1,488 | 18.2 |
| **Metode Usulan** | **Public (YOLOX)**| **65.8 ± 0.2** | **66.2 ± 0.2** | **65.7 ± 0.3** | **80.4 ± 0.2** | **81.2 ± 0.1** | **21,040** | **84,110** | **984** | **1,120** | *24.5* |

---

## 4. Contoh Tabel Komparasi Persepsi Robus Cuaca Ekstrem (R03 — RESIDE SOTS / Dark Zurich)

| Metode Dehazing / Enhancer | Tipe Pendekatan | PSNR (dB) ↑ | SSIM ↑ | LPIPS ↓ | ECE (%) ↓ | mCE (ImageNet-C) ↓ | Latensi (ms) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| DCP (He et al.) | Physical Prior | 16.62 | 0.817 | 0.285 | 14.2 | 88.5 | 180.0 |
| DehazeNet | CNN Supervised | 21.14 | 0.847 | 0.210 | 11.5 | 74.2 | 24.5 |
| Zero-DCE | Curve Estimation | 22.80 | 0.865 | 0.180 | 9.8 | 68.1 | **4.2** |
| GridDehazeNet | Multi-Scale Grid | *24.62* | *0.912* | *0.125* | *8.2* | *59.4* | 48.0 |
| **Metode Usulan** | **Physics-Guided Deep** | **25.85 ± 0.15** | **0.934 ± 0.005** | **0.098 ± 0.003** | **5.4 ± 0.3** | **52.1 ± 0.8** | *12.5* |

---

## 5. Ringkasan Kesimpulan Temuan Kuantitatif
- **Poin Keunggulan Utama:** [Sebutkan di metrik mana metode usulan memberikan lompatan terbesar.]
- **Kompromi yang Terjadi:** [Laporkan secara transparan jika ada metrik yang mengalami sedikit penurunan, misal FPS turun 15% demi akurasi small object naik 2.5%.]

