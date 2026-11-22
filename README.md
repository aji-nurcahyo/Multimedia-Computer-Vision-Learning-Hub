# Multimedia & Computer Vision Learning Hub

> **From Digital Media to Intelligent Visual & Audio Systems**  
> Platform Pembelajaran Terbuka (Open Educational Learning Library)  
> **Created & Developed by**: Aji Pamungkas Tri Nurcahyo  
> **Institusi**: Institut Teknologi Sumatera (ITERA)

---

## 📌 Gambaran Umum Platform

**Multimedia & Computer Vision Learning Hub** adalah platform perpustakaan digital akademik terbuka yang dirancang khusus untuk mahasiswa teknik elektro, informatika, dan rekayasa kecerdasan artifisial di Institut Teknologi Sumatera (ITERA). 

Platform ini menjembatani transisi fundamental dari representasi sinyal multimedia digital (citra, audio, dan video) menuju arsitektur cerdas modern (Computer Vision klasik, Deep Learning, Vision Transformers, hingga Multimodal AI).

Platform ini dibangun dengan arsitektur **Content-Driven**, di mana seluruh konten pembelajaran (teks modul, slide presentasi, eksperimen Python, kuis interaktif, dan metadata aset) dipisahkan secara ketat dari logika aplikasi React/Vite. Hal ini memungkinkan dosen dan editor materi untuk menambah atau memperbarui bab kuliah tanpa harus menyentuh kode program aplikasi.

---

## 🗺️ Ringkasan Kurikulum & Jalur Belajar

- **60 Bab Lengkap**: Terbagi secara kanonikal ke dalam 12 Seksi Keilmuan (**Bab 01–15** berstatus `published` lengkap mencakup Section 01–03 beserta seluruh artefak pedagogis).
- **6 Learning Tracks**:
  1. `Digital Image Processing` (Bab 01–15 — **Lengkap & Terpublikasi**)
  2. `Audio & Speech Processing` (Bab 16–25)
  3. `Video Processing & Tracking` (Bab 26–35)
  4. `Computer Vision` (Bab 36–50)
  5. `Multimodal AI` (Bab 51–55)
  6. `Real-Time & Edge Vision` (Bab 56–60)
- **18 Laboratorium Interaktif (Client-Side)**:
  - `Section 01 (Bab 01–05)`: `MultimediaDataExplorer`, `SamplingQuantizationSimulator`, `FormatSizeExplorer`, `EnvironmentChecklist`, `ArrayExplorer`.
  - `Section 02 (Bab 06–10)`: `PixelImageExplorer` (Ch 06), `ColorSpaceConverterLab` (Ch 07), `ImageEnhancementLab` (Ch 08), `HistogramExplorerLab` (Ch 09), `ImageProcessingLab` (Ch 10: Spatial Convolution + Median + Padding).
  - `Section 03 (Bab 11–15)`: `FftExplorerLab` (Ch 11: 2D Radix-2 FFT), `ImageRestorationLab` (Ch 12: Denoising + PSNR/SSIM), `EdgeFeatureExplorerLab` (Ch 13: Canny & Harris), `MorphologyLab` (Ch 14: SE & Morfologi), `SegmentationLab` (Ch 15: Otsu, CCL & Morfometri).
  - `Audio / Video / Vision Core Labs`: `AudioProcessingLab`, `VideoProcessingLab`, `ComputerVisionLab`.

---

## 🚀 Memulai (Quick Start)

### Prasyarat Sistem
- **Node.js**: v18.0.0 atau lebih baru (Disarankan Node v20/v24)
- **Python**: 3.10 / 3.11 / 3.12 (untuk menjalankan script verifikasi komputasi)

### Instalasi & Menjalankan Platform

```bash
# 1. Masuk ke direktori repositori
cd "Multimedia & Computer Vision"

# 2. Instal dependensi Node.js
npm install

# 3. Jalankan pengujian konten dan validasi aset
npm test
npm run validate

# 4. Jalankan server pengembangan lokal (HMR)
npm run dev
```

Buka peramban pada alamat `http://127.0.0.1:5173`.

### Membangun Versi Produksi (Production Build)

```bash
npm run build
```

Perintah build secara otomatis akan:
1. Menjalankan validasi 60 bab kurikulum (`scripts/validate-content.mjs`).
2. Menjalankan validasi lisensi dan atribusi aset multimedia (`scripts/validate-media.mjs`).
3. Memeriksa konsistensi tipe TypeScript (`tsc --noEmit`).
4. Melakukan bundling statis melalui Vite ke folder `dist/`.

---

## 📑 Struktur Direktori

```text
├── content/                     # Seluruh konten pembelajaran (Content-Driven)
│   ├── curriculum/
│   │   ├── master-curriculum.json   # Registri kanonikal 60 bab kurikulum
│   │   └── learning-tracks.json     # Pemetaan 6 learning tracks
│   └── chapters/
│       └── chapter-10/          # Bab referensi lengkap
│           ├── index.md         # Naskah modul lengkap (Markdown + LaTeX)
│           ├── slides.json      # Slide kuliah akademis (Custom Branding)
│           ├── exercises.json   # Latihan terbimbing & solusi Python
│           ├── quiz.json        # Soal evaluasi kuis dengan penjelasan
│           ├── references.json  # Rujukan buku & sitasi akademik
│           ├── media.json       # Registri lisensi & atribusi visual
│           └── examples/
│               └── example-01.py # Kode Python mandiri & verifikasi
├── public/
│   └── media/                   # Aset multimedia statis
│       ├── diagrams/            # Diagram SVG teknis asli
│       ├── images/              # Citra uji standar
│       ├── audio/               # Berkas gelombang audio
│       └── video/               # Cuplikan video pengujian
├── scripts/
│   ├── chapter-new.mjs          # Generator scaffolding bab baru
│   ├── generate-curriculum.mjs  # Generator registri 60 bab
│   ├── validate-content.mjs     # Validator integritas kurikulum
│   └── validate-media.mjs       # Validator atribusi hak cipta media
├── src/                         # Logika antarmuka web (Aplikasi React + Vite)
│   ├── components/              # Komponen Markdown, Slide, Kuis, Math
│   │   └── playgrounds/         # Laboratorium Canvas & Web Audio
│   ├── lib/                     # Loader konten (import.meta.glob)
│   ├── styles.css               # Desain sistem responsif (Dark/Light mode)
│   ├── App.tsx                  # Router dan navigasi utama
│   └── main.tsx                 # Titik masuk React
├── tests/
│   └── content.test.mjs         # Node.js test runner pengujian kurikulum
└── docs/                        # Dokumentasi pemeliharaan lengkap
```

---

## 🛠️ Menambahkan Bab Baru (Scaffolding Otomatis)

Untuk membuat struktur bab baru tanpa menyentuh kode aplikasi:

```bash
npm run chapter:new -- --id 11
```

Perintah di atas akan membaca metadata Bab 11 dari `master-curriculum.json` dan membuat folder `content/chapters/chapter-11/` beserta seluruh templat berkas pendukungnya.

---

## 📜 Panduan Pemeliharaan Lebih Lanjut

Silakan pelajari dokumen pedoman pada direktori `docs/`:
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) : Arsitektur teknis dan pola modular.
- [`CONTENT_AUTHORING_GUIDE.md`](docs/CONTENT_AUTHORING_GUIDE.md) : Panduan menulis modul dan persamaan KaTeX.
- [`SLIDE_AUTHORING_GUIDE.md`](docs/SLIDE_AUTHORING_GUIDE.md) : Panduan penyusunan slide presentasi kuliah.
- [`MEDIA_MANAGEMENT_GUIDE.md`](docs/MEDIA_MANAGEMENT_GUIDE.md) : Panduan pengelolaan aset gambar, audio, dan video.
- [`ATTRIBUTION_GUIDE.md`](docs/ATTRIBUTION_GUIDE.md) : Pedoman hak cipta, sitasi, dan lisensi terbuka (CC-BY).
- [`PYTHON_PRACTICE_GUIDE.md`](docs/PYTHON_PRACTICE_GUIDE.md) : Standar kode latihan komputasi Python CPU-friendly.
- [`QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) : Daftar periksa sebelum merilis bab baru ke status `published`.

---

## ⚖️ Lisensi & Hak Cipta

- **Materi Instruksional**: Diterbitkan di bawah lisensi [Creative Commons Attribution 4.0 International (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Kode Program**: Diterbitkan di bawah lisensi open-source MIT License.
- **Institusi**: Institut Teknologi Sumatera (ITERA).

