# Media Management Guide

## Panduan Pengelolaan & Optimasi Aset Multimedia

Aset multimedia (citra, diagram vektor SVG, rekaman audio, dan video pengujian) memegang peranan sentral dalam platform ini. Panduan ini menjelaskan cara mengorganisir, mengoptimasi, dan menyajikan aset media dengan handal.

---

## 1. Lokasi Penyimpanan Aset

Seluruh berkas biner dan visual media statis wajib ditempatkan pada subdirektori publik:

```text
public/
  media/
    diagrams/     # Diagram teknis berbasis SVG (Prioritas tertinggi)
    images/       # Citra foto standar (WebP / PNG)
    audio/        # Berkas audio WAV / MP3
    video/        # Cuplikan video pengujian MP4 / WebM
    thumbnails/   # Thumbnail pratinjau bab
```

---

## 2. Format Aset yang Direkomendasikan

1. **Diagram Arsitektur & Matematis**: Gunakan format **SVG** (Scalable Vector Graphics). Diagram SVG memiliki ukuran berkas yang sangat kecil (biasanya < 15 KB), tajam tanpa batas pada layar proyektor resolusi tinggi (Retina / 4K), dan mudah dimodifikasi teksnya.
2. **Citra Raster / Foto**: Gunakan format **WebP** atau **PNG** terkompresi. Batasi dimensi maksimum gambar pada lebar 1200 piksel dengan ukuran berkas tidak melebihi 250 KB per gambar.
3. **Audio**: Format **MP3** (128 kbps) atau **WAV** pendek untuk analisis spektrum. Hindari berkas audio tanpa kompresi yang berukuran puluhan megabyte.
4. **Video**: Format **MP4** (H.264 / AAC) atau **WebM** dengan resolusi maksimum 720p (1280×720) dan durasi ringkas (5–15 detik untuk demonstrasi tracking/motion).

---

## 3. Pendaftaran Aset pada `media.json`

Setiap gambar yang digunakan dalam sebuah bab wajib dicatat dalam berkas:
`content/chapters/chapter-XX/media.json`

Contoh entri aset:
```json
[
  {
    "id": "fig-10-01",
    "title": "Diagram Mekanisme Spatial Filtering & Konvolusi Diskrit 2D",
    "type": "svg",
    "path": "/media/diagrams/chapter-10-overview.svg",
    "creator": "Aji Pamungkas Tri Nurcahyo",
    "license": "CC-BY-4.0",
    "source": "Multimedia & Computer Vision Learning Hub, ITERA",
    "attribution": "Diagram vektor asli oleh Aji Pamungkas Tri Nurcahyo (ITERA), lisensi CC-BY-4.0"
  }
]
```

---

## 4. Validasi Keberadaan Aset Otomatis

Platform menyediakan script validasi untuk mendeteksi tautan gambar yang rusak (*broken links*):

```bash
npm run validate
```

Script `scripts/validate-media.mjs` akan memverifikasi bahwa seluruh path yang didaftarkan pada `media.json` benar-benar ada di dalam direktori `public/media/` dan memiliki informasi lisensi yang valid.

