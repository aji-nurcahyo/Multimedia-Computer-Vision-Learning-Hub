# System Architecture & Design Philosophy

## Multimedia & Computer Vision Learning Hub
**Institut Teknologi Sumatera (ITERA)** · **Aji Pamungkas Tri Nurcahyo**

---

## 1. Arsitektur Content-Driven

Salah satu pilar utama dari platform ini adalah **pemisahan mutlak antara konten pembelajaran dan logika aplikasi web**.

```text
[ Content Author / Lecturer ]
            │
            ▼ (Edits Markdown / JSON / Python)
   ┌──────────────────────────────────────────────────┐
   │ content/                                         │
   │  ├── curriculum/master-curriculum.json           │
   │  └── chapters/chapter-XX/                        │
   │       ├── index.md        (Text & Math)          │
   │       ├── slides.json     (Deck Slides)          │
   │       ├── quiz.json       (Assessment)           │
   │       ├── exercises.json  (Python Lab)           │
   │       ├── references.json (Citations)            │
   │       └── media.json      (Attributions)         │
   └──────────────────────────────────────────────────┘
            │
            ▼ Vite import.meta.glob (Static Bundler)
   ┌──────────────────────────────────────────────────┐
   │ src/lib/content.ts (Content Access Layer)         │
   └──────────────────────────────────────────────────┘
            │
            ▼ Strong TypeScript Typed Interfaces
   ┌──────────────────────────────────────────────────┐
   │ Presentation, Markdown, Lab & Canvas Viewers     │
   └──────────────────────────────────────────────────┘
```

### Keuntungan Pola Arsitektur Ini:
1. **Perawatan Tanpa Kompilasi Ulang Kode**: Dosen tidak perlu memahami arsitektur React, JSX, atau CSS untuk memperbarui silabus, merevisi persamaan matematika, atau menambahkan soal kuis.
2. **Keamanan Data**: Tidak ada database dinamis atau backend yang rentan terhadap SQL Injection atau serangan XSS.
3. **Kinerja Statis Tinggi**: Vite mengkompilasi seluruh konten ke dalam file HTML/JS/CSS murni berukuran kecil yang dapat di-hosting pada static CDN dengan waktu muat di bawah 1 detik.
4. **Kesiapan Headless CMS**: Jika di masa mendatang platform ingin dihubungkan dengan Strapi, Sanity, atau Supabase, skema data pada `src/lib/content.ts` telah terstandardisasi dan siap menerima data API tanpa merombak komponen UI.

---

## 2. Presentation System Architecture (No Reveal.js Branding)

Persyaratan kritis sistem adalah penyajian slide perkuliahan 16:9 yang profesional, bersih, dan bebas dari logo/watermark pihak ketiga.

- **Engine Komponen**: `src/components/PresentationViewer.tsx`
- **Aspek Rasio**: Dinamis 16:9 (`aspect-ratio: 16 / 9`) dengan skala teks responsif.
- **Identitas Kampus**: Header dan footer permanen menampilkan nama **Multimedia & Computer Vision Learning Hub** dan identitas pengembang **Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)**.
- **Fitur Interaktif**:
  - Dukungan navigasi keyboard: Panah Kiri/Kanan, Spasi, Home, End.
  - Mode Layar Penuh (Fullscreen) berbasis Fullscreen API browser (`F`).
  - Drawer Catatan Presenter (*Presenter Notes*) (`N`).
  - Dukungan formula matematika KaTeX inline & display.

---

## 3. Client-Side Interactive Playgrounds

Untuk menjaga kemandirian platform tanpa ketergantungan server backend yang mahal atau kompleks, platform mengimplementasikan laboratorium berbasis teknologi web modern:

1. **HTML5 Canvas 2D API**:
   - Pemrosesan piksel mentah (*direct ImageData buffer manipulation*).
   - Manipulasi filter spasial (Gaussian, Sobel, Laplacian, Box Blur) secara real-time.
   - Penanganan batas citra reflektif (*symmetric reflect padding*) terakselerasi.
2. **Web Audio API**:
   - `AudioContext`, `OscillatorNode`, dan `BiquadFilterNode` untuk menghasilkan dan memfilter gelombang audio secara sintetis.
   - `AnalyserNode` untuk analisis osiloskop domain waktu dan spektrum frekuensi FFT.
3. **Motion Differencing**:
   - Analisis perbedaan matriks frame berurutan $|F(t) - F(t-1)| > \text{Threshold}$ untuk deteksi pergerakan objek video.

