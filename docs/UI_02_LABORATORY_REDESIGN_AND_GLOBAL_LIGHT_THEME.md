# DOKUMENTASI TEKNIS & LAPORAN VERIFIKASI — PHASE UI-02
## Multimedia & Computer Vision Learning Hub
### Redesain Laboratorium Multimedia Interaktif & Penerapan Tema Global Light Mode

---

**Repositori:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Institusi & Afiliasi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang & Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Target Rilis:** Phase UI-02 — Interactive Laboratory Redesign & Global Light Theme  
**Status Pengujian Otomatis:** 109 Tests Passing (100% Green)  
**Git & Deployment Policy:** STRICT NO COMMIT · NO PUSH · NO DEPLOY (Menunggu Otorisasi Pemilik Proyek)

---

## 1. RINGKASAN EKSEKUTIF

Phase UI-02 menyelesaikan transformasi antarmuka pengguna pada modul **Laboratorium Multimedia Interaktif (Playgrounds Hub)** dan standardisasi **Tema Terang (Light Mode)** sebagai tema bawaan (*default theme*) aplikasi secara menyeluruh, menggantikan konfigurasi lama yang sebelumnya memuat daftar 63 tombol tanpa hierarki dan tema gelap (*dark mode*) yang pekat.

### Pencapaian Inti Phase UI-02:
1. **Katalog Laboratorium Akademik Terstruktur (63 Lab):**
   - Menggantikan barisan tombol horizontal yang tidak terstruktur dengan katalog akademik berbasis kartu responsif yang elegan.
   - Mengelompokkan seluruh 63 laboratorium komputasi ke dalam **8 Kategori Kurikulum Inti** (sesuai seksi kanonikal Bab 01–60) serta **1 Kategori Laboratorium Tambahan (Standalone)**.
2. **Pencarian Real-Time & Filter Kategori Cepat:**
   - Pencarian cerdas multi-parameter yang dapat memfilter berdasarkan judul lab, nomor bab (contoh: `10`, `bab 15`, `ch 44`), istilah teknis (contoh: `YOLO`, `FFT`, `Kalman`, `Canny`, `VAD`, `Quantization`), serta deskripsi ilmiah.
   - Filter tab kategori horizontal dengan indikator kuantitas (*badge count*) dinamis.
   - Tampilan status kosong (*empty search state*) dengan pesan edukatif dan tombol instan *Reset Pencarian & Kategori*.
3. **Dedicated Laboratory Workspace Mode:**
   - Navigasi dua tingkat: Mode Katalog (*Catalog Mode*) dan Mode Ruang Kerja Eksperimen (*Workspace Mode*).
   - Dilengkapi *top bar* terintegrasi: Tombol "← Kembali ke Katalog Lab", metadata bab, tautan langsung ke buku ajar teori ("Materi Bab XX"), dan *Quick Lab Switcher dropdown* untuk berpindah laboratorium secara instan tanpa harus kembali ke katalog.
   - Sinkronisasi rute URL berbasis hash (`#/playgrounds` dan `#/playgrounds/:labKey`) yang mendukung riwayat peramban (*back/forward history*) dan *bookmarking*.
4. **Penerapan Default Global Light Theme & Zero-Flicker:**
   - Menetapkan Light Mode sebagai tema bawaan resmi aplikasi pada kunjungan pertama (*fresh visits*), dengan kontras tinggi standar WCAG AAA (`#0f172a` teks gelap di atas latar belakang `#f8fafc`).
   - Menyertakan skrip anti-kedip (*anti-flicker script*) inline pada `<head>` berkas `index.html` sebelum React dirender.
   - Mempertahankan persistensi preferensi pengguna (*localStorage*) saat beralih ke Dark Mode.
5. **Harmonisasi Slide Viewer Theme:**
   - Penyesuaian tema pembaca slide presentasi agar secara cerdas mewarisi tema aplikasi aktif (Light Mode secara default) dengan opsi manual override dan memori preferensi lokal.

---

## 2. ARSITEKTUR REGISTRI LABORATORIUM (`src/data/laboratoryRegistry.ts`)

Seluruh metadata 63 laboratorium komputasi diisolasi secara modular dalam berkas tipe kuat:

```typescript
export interface LaboratoryCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  chapterRange: string;
}

export interface LaboratoryItem {
  id: string; // 'ch01' - 'ch60', 'image', 'audio', 'video', 'cv'
  chapterId?: string; // '01' - '60'
  title: string;
  shortTitle: string;
  description: string;
  categoryId: string;
  categoryName: string;
  iconName: string;
  keywords: string[];
}
```

### Distribusi Kategori Kurikulum (Total 63 Laboratorium):

| No | Kategori | Cakupan Bab | Jumlah Lab | Fokus Komputasi |
|:--:|---|:---:|:---:|---|
| 1 | **Multimedia Foundations & Programming** | Bab 01–05 | 5 | Taksonomi multimodal, sampling sinyal, kontainer biner, dan manipulasi array NumPy |
| 2 | **Digital Image Processing** | Bab 06–15 | 10 | Representasi piksel, ruang warna, konvolusi 2D, FFT 2D, denoising, dan segmentasi |
| 3 | **Audio & Speech Processing** | Bab 16–25 | 10 | Sinyal akustik, spektrogram STFT, ekstraksi fitur audio, dan pemrosesan wicara ASR/TTS |
| 4 | **Video & Motion Analysis** | Bab 26–35 | 10 | Frame temporal, kompresi video, optical flow Lucas-Kanade, dan tracking multi-objek SORT |
| 5 | **Classical Computer Vision** | Bab 36–40 | 5 | Geometri citra, feature matching, kalibrasi kamera, stereo depth, dan template matching |
| 6 | **Deep Learning for Computer Vision** | Bab 41–50 | 10 | Arsitektur CNN, klasifikasi citra, deteksi YOLO, Vision Transformers, dan human pose |
| 7 | **Multimodal AI** | Bab 51–55 | 5 | Fusi teks-citra-audio, model Vision-Language CLIP, dan cross-modal retrieval |
| 8 | **Multimedia Systems & Deployment** | Bab 56–60 | 5 | Komputasi real-time, kuantisasi Edge AI, Web Multimedia APIs, dan Capstone Studio |
| 9 | **Laboratorium Tambahan (Standalone)** | Standalone | 3 | Sintesis audio mandiri, analisis gerak video, dan filter kernel matriks 3x3 |
| **Total** | **9 Kategori** | **Bab 01–60 + Standalone** | **63** | **100% Client-Side Execution** |

---

## 3. IMPLEMENTASI KOMPONEN & UX ACADEMIC DESIGN

### 3.1 Komponen `LaboratoryCatalogView.tsx`
Komponen ini mengelola dua mode antarmuka:
- **Mode Katalog (`Catalog Mode`):**
  - **Header Metrik:** Menampilkan 4 pilar metrik: `63 Laboratorium Komputasi`, `8 + 1 Kategori`, `Client-Side Zero-Server`, dan `100% Terintegrasi Kurikulum`.
  - **Toolbar Interaktif:** Input pencarian dengan ikon Lucide, tombol pembersih `X`, dan *counter* hasil dinamis (`Menampilkan X dari 63 laboratorium`).
  - **Kategori Tabs:** Navigasi horizontal dengan pil kategori dan jumlah item dinamis.
  - **Grid Kartu Responsif:** Menampilkan kartu laboratorium berdesain akademis yang memuat lencana bab, kategori, ikon khusus, judul resmi, ringkasan eksperimen, kata kunci, serta tombol ganda ("Buka Lab" dan "Teori Bab XX").
  - **Status Kosong (*Empty State*):** Ditampilkan otomatis saat pencarian tidak menemukan hasil, lengkap dengan tombol *Reset Pencarian & Kategori*.
- **Mode Ruang Kerja (`Workspace Mode`):**
  - Diaktifkan saat pengguna memilih kartu laboratorium atau membuka rute URL langsung (contoh: `#/playgrounds/ch44`).
  - **Top Bar Ruang Kerja:** Menampilkan tombol kembali ke katalog, indikator bab aktif, judul lab, tombol tautan materi teori, dan *Quick Lab Switcher* dropdown.
  - **Banner Deskripsi Lab:** Penjelasan analitis mengenai tujuan eksperimen dan parameter simulasi.
  - **Wadah Komponen Eksperimen:** Merender modul laboratorium interaktif menggunakan `LabRenderer`.

### 3.2 Refaktorisasi `src/App.tsx`
- Mengeliminasi duplikasi impor 63 modul laboratorium individual dari `App.tsx`, menggantikannya dengan impor tunggal `<LaboratoryCatalogView />` dan `<LabRenderer />`.
- Merapikan sub-tab laboratorium pada buku ajar bab (`chapterSubTab === 'lab'`) sehingga menggunakan `<LabRenderer labId={...} />`, mengurangi lebih dari 150 baris kode yang redundan.
- Memperluas penanganan URL hash untuk mendukung format `#/playgrounds` dan `#/playgrounds/:labKey`.

---

## 4. SISTEM TEMA GLOBAL LIGHT MODE & ANTI-FLICKER

### 4.1 Definisi Variabel Desain Sistem (`src/styles.css`)
Sistem CSS dikonfigurasi ulang sehingga variabel bawaan `:root` dan `:root[data-theme="light"]` memprioritaskan palet Light Mode akademik:

```css
:root,
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f8fafc;
  --bg-card: #ffffff;
  --bg-subtle: #f1f5f9;
  --border: #cbd5e1;
  --text: #0f172a;
  --text-muted: #475569;
  --text-dim: #475569;
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --on-primary: #ffffff;
  --primary-glow: rgba(2, 132, 199, 0.12);
  --accent: #047857;
  --accent-glow: rgba(4, 120, 87, 0.12);
  --warning: #b45309;
  --danger: #dc2626;
  --card-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
  --radius: 12px;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Menlo, Consolas, Monaco, monospace;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #090d16;
  --bg-card: #0f172a;
  --bg-subtle: #1e293b;
  --border: #334155;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --text-dim: #8899b0;
  --primary: #38bdf8;
  --primary-hover: #0284c7;
  --on-primary: #090d16;
  --primary-glow: rgba(56, 189, 248, 0.15);
  --accent: #34d399;
  --accent-glow: rgba(52, 211, 153, 0.15);
  --warning: #f59e0b;
  --danger: #ef4444;
  --card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}
```

### 4.2 Skrip Anti-Kedip (*Anti-Flicker Script*) di `index.html`
Untuk mencegah kilatan tema gelap saat memuat halaman, ditambahkan skrip sinkron pada bagian `<head>`:

```html
<script>
  (function() {
    try {
      var saved = localStorage.getItem('app_theme');
      var theme = (saved === 'dark' || saved === 'light') ? saved : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
</script>
```

### 4.3 Harmonisasi Tema Slide (`src/components/PresentationViewer.tsx`)
Inisialisasi tema slide (`slideTheme`) dikonfigurasi untuk memeriksa preferensi yang tersimpan atau mewarisi tema aplikasi yang aktif:

```typescript
const [slideTheme, setSlideTheme] = useState<SlideTheme>(() => {
  try {
    const saved = localStorage.getItem('slide_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const globalTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
    return globalTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
});
```

---

## 5. PENGUJIAN OTOMATIS & VERIFIKASI KUALITAS

### 5.1 Suite Pengujian Baru: `tests/laboratory-catalog.test.mjs`
Pengujian otomatis memverifikasi:
1. Integritas dan struktur berkas `laboratoryRegistry.ts`.
2. Total 63 laboratorium komputasi terdaftar (seluruh 60 bab kurikulum + 3 lab mandiri).
3. Integritas 9 kategori kanonikal dan cakupan rentang babnya.
4. Akurasi logika pencarian berdasarkan nomor bab, kata kunci teknis, dan perpotongan kategori.
5. Konfigurasi tema Light bawaan dan skrip anti-flicker.

### 5.2 Hasil Eksekusi `npm test` (109 Tests)
```
✔ Advanced Curriculum Registry: ADV-01 to ADV-08 completeness & schema validation
✔ Advanced Curriculum Dependency Graph: Strictly Acyclic (No Circular Dependencies)
✔ Research Tracks Registry: R01 to R06 completeness & schema validation
✔ Advanced Modules Content Integrity: Strictly enforces published vs planned asset requirements
✔ ADV-01 to ADV-08 Mathematical Verification & Algorithms (SVD, Kalman, Hungarian, etc.)
✔ Digital Signal, Audio, Video, Computer Vision, and Multimodal Automated Tests
✔ Laboratory Registry: File existence and structural integrity (2.1751ms)
✔ Laboratory Registry: Counts and Canonical Coverage (63 total labs) (1.2401ms)
✔ Laboratory Categories: 8 Canonical Sections + 1 Standalone Category (0.3232ms)
✔ Laboratory Search & Filter Logic: Keyword, Chapter, and Category precision (2.3939ms)
✔ Theme System: Light Mode Default & Anti-Flicker in index.html and styles.css (1.0824ms)
✔ UI-01 & UI-01A Typography, Math, and Ordered List Tests
ℹ tests 109
ℹ pass 109
ℹ fail 0
```

### 5.3 Verifikasi TypeScript & Build
- `npm run typecheck`: **0 Errors**
- `npm run validate`: **Content & Media Validation Passed**
- `npm run build`: **Vite Production Build Sukses (3,422 kB JS, 56 kB CSS)**

---

## 6. VERIFIKASI PERAMBAN & RESPONSIVITAS

| Resolusi | Target Perangkat | Hasil Pengamatan | Status |
|:---|:---|:---|:---:|
| **1440px** | Desktop Layar Lebar | Grid 3 kolom seimbang, jarak antar kartu rapi, top bar ruang kerja proporsional. | **PASS** |
| **1024px** | Laptop / iPad Pro | Grid 2 kolom, teks terbaca jelas, navigasi kategori tergulung mulus tanpa patah. | **PASS** |
| **768px** | Tablet Portabel | Grid 2 kolom kompak, navbar merespons tanpa tumpang tindih. | **PASS** |
| **390px** | Smartphone Mobile | Grid 1 kolom vertikal, top bar ruang kerja menyusun secara vertikal, dropdown dapat diakses mudah. | **PASS** |

---

## 7. KESIMPULAN & KEPATUHAN KEBIJAKAN GIT

Phase UI-02 telah diselesaikan secara penuh dan teruji. Seluruh target teknis telah terpenuhi tanpa mengorbankan integritas materi ajar 60 bab inti, 8 modul lanjutan, maupun 6 jalur riset.

> [!IMPORTANT]
> **Kebijakan Git:** Sesuai instruksi pemilik proyek, **TIDAK ADA COMMIT, TIDAK ADA PUSH, DAN TIDAK ADA DEPLOYMENT** yang dieksekusi selama phase ini. Seluruh perubahan tersimpan di lingkungan lokal dalam status siap rilis menunggu persetujuan eksplisit.

