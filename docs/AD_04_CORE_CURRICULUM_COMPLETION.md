# DOKUMENTASI AKADEMIK & TEKNIS PHASE AD-04
## Core Curriculum Completion (Chapters 56–60 | Section 12: Multimedia Systems & Capstone)

**Platform:** Multimedia & Computer Vision Learning Hub: *From Digital Media to Intelligent Visual & Audio Systems*  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi:** CC-BY-4.0 International Open Education License  
**Tanggal Penyelesaian:** 19 November 2026  

---

## 1. Eksekutif Ringkasan

Fase **AD-04** menandai pencapaian puncak bersejarah bagi repositori ini: **Penyelesaian Penuh 100% Master Curriculum 60 Chapter**. Seluruh lima bab terakhir pada **Seksi 12 (Multimedia Systems & Capstone)** telah berhasil diimplementasikan secara komprehensif, menghubungkan fondasi matematika komputasi, skrip verifikasi mandiri Python, notebook Jupyter dual-engine, slide presentasi resmi berstandar ITERA, kuis berpenjelasan, latihan hands-on terarah, laboratorium web interaktif, dan Proyek Akhir Capstone terintegrasi.

Dengan selesainya fase AD-04:
- Seluruh 60 Bab berstatus **`published`** pada `content/curriculum/master-curriculum.json`.
- Seluruh 6 Jalur Belajar (*Learning Tracks*) tervalidasi 100%.
- Seluruh 120 Aset Media & Diagram Teknis SVG terdaftar dan teratribusi penuh.
- Seluruh 25 Notebook Praktikum Lanjut (Bab 36–60) lulus eksekusi otomatis tanpa error (100% pass rate).
- Rangkaian unit test (`npm test`) mencatatkan **53 passing tests (0 failures)**.
- Build produksi Vite (`npm run build`) berhasil dikompilasi dalam **3.35 detik**.

---

## 2. Cakupan & Identitas Kanonikal Bab 56–60

Identitas resmi, judul, dan nomor urut kurikulum dipertahankan secara utuh tanpa modifikasi slug:

| ID | Judul Bab | Slug Kanonikal | Fokus Rekayasa & Teori | Laboratorium Web Interaktif |
| :---: | :--- | :--- | :--- | :--- |
| **56** | *Real-Time Multimedia Processing* | `real-time-multimedia-processing` | Dekomposisi latensi end-to-end, dinamika antrean buffer cincin, kebijakan *drop-oldest*, statistik jitter, dan sinkronisasi A/V. | `RealTimeProcessingLab.tsx` |
| **57** | *Edge AI & Embedded Computer Vision* | `edge-ai-embedded-computer-vision` | Post-Training Quantization (PTQ) INT8/INT4, pemetaan skala $S$ dan titik nol $Z$, evaluasi SQNR, dan kompresi memori model. | `EdgeAiOptimizationLab.tsx` |
| **58** | *Multimedia Web Applications & APIs* | `multimedia-web-applications-apis` | Arsitektur web multimedia, manipulasi buffer `Uint8ClampedArray`, MediaDevices API, isolasi Web Worker, dan privasi client-side. | `MultimediaWebAppsLab.tsx` |
| **59** | *Performance Optimization & Deployment* | `performance-optimization-deployment` | Alokasi anggaran frame 60 FPS ($16.67$ ms), batas percepatan teoretis Hukum Amdahl, profiling CPU/GPU, dan distribusi Edge CDN. | `PerformanceProfilerLab.tsx` |
| **60** | *Integrated Multimedia & Computer Vision Capstone* | `integrated-multimedia-computer-vision-capstone` | Proyek referensi: *Intelligent Visual Monitoring System with Optional Multimodal Sensing*, histeresis temporal, dan rubrik akademik ITERA. | `IntegratedCapstoneStudio.tsx` |

---

## 3. Rincian Artefak & Implementasi Setiap Bab

Setiap bab 56–60 dilengkapi dengan 8 berkas terstandarisasi:

1. **`index.md`**: Teks akademik komprehensif (250–350+ baris) memuat formulasi matematika LaTeX, contoh perhitungan numerik langkah demi langkah, panduan tiga tingkat (*three-tier walkthrough*), tips/peringatan praktis industri, dan keterkaitan dengan peta jalan riset ISVWS 2026–2040.
2. **`examples/example-01.py`**: Skrip Python mandiri berbasis NumPy murni dengan asersi deterministik ketat, mengembalikan *exit code 0*.
3. **`notebooks/chapter-XX-lab.ipynb`**: Notebook Jupyter interaktif berstandar nbformat v4 berfitur *dual-engine* (PyTorch autodetect dengan fallback mandiri NumPy).
4. **`slides.json`**: 10 slide presentasi berformat 16:9 berlabel resmi Institut Teknologi Sumatera (ITERA) tanpa watermark reveal.js pihak ketiga.
5. **`references.json`**: 3+ sitasi akademik primer (DOI/URL) dari literatur bergengsi IEEE/CVF, ACM, Springer, dan W3C.
6. **`quiz.json`**: 5+ pertanyaan pilihan ganda dengan kunci jawaban dan penjelasan konseptual mendalam.
7. **`exercises.json`**: 2+ latihan praktis terarah (*intermediate* & *advanced*).
8. **`media.json`**: Registri atribusi lisensi CC-BY-4.0 untuk diagram SVG yang bersesuaian.

---

## 4. Laboratorium Web Interaktif Baru (`src/components/playgrounds/`)

Lima komponen visual React 19 telah diintegrasikan ke dalam navigasi bab dan Playground Hub di `src/App.tsx`:

1. **`RealTimeProcessingLab.tsx`**:
   - Kontrol dinamis laju kedatangan $\lambda$ (10–60 FPS), durasi worker $T_{\text{proc}}$ (5–70 ms), kapasitas antrean buffer $N_{\max}$, dan kebijakan pembuangan (*drop-oldest* vs *drop-newest*).
   - Visualisasi grafis status sel antrean cincin (*ring buffer slots*), pengukur deviasi standar jitter, dan indikator kepatuhan tenggat waktu (*deadline missed alert*).
2. **`EdgeAiOptimizationLab.tsx`**:
   - Pengaturan rentang dinamis float $[r_{\min}, r_{\max}]$, pemilihan presisi (INT8 vs INT4), dan slider probe nilai riil interaktif.
   - Perhitungan seketika skala $S$, titik nol $Z$, dekuantisasi $\hat{r}$, dan pengukur fidelitas SQNR (dB).
   - Grafik batang kompresi memori model dan perbandingan spektrum perangkat keras tepi (TinyML MCU vs Coral Edge NPU vs Jetson Orin vs Cloud Datacenter).
3. **`MultimediaWebAppsLab.tsx`**:
   - Preset resolusi video (4K UHD, 1080p, 720p, VGA, QVGA) dan laju frame (15–60 FPS).
   - Kanvas visual live dengan filter pemrosesan piksel (Grayscale, Edge Sobel, Threshold).
   - Komparator arsitektur thread: pembuktian pemblokiran UI pada Main Thread vs eksekusi bebas stutter pada Dedicated Web Worker.
4. **`PerformanceProfilerLab.tsx`**:
   - Penggeser durasi 4 tahapan pipa (*Capture, Preprocess, Inference, Postprocess*).
   - Grafik dekomposisi waktu stacked bar terhadap batas anggaran 60 FPS ($16.67$ ms).
   - Kalkulator Hukum Amdahl dengan visualisasi batas percepatan asimtotik $S_{\max} = 1 / (1 - p)$ dan estimasi waktu muat jaringan statis (3G vs 4G).
5. **`IntegratedCapstoneStudio.tsx`**:
   - Konsensus Bayesian fusi sensorik (Visual $60\%$, Audio $25\%$, Konteks $15\%$).
   - Fitur injeksi gangguan (*fault injection*): simulasi lensa berkabut dan mikrofon terputus untuk menguji ketahanan fail-safe.
   - Kalkulator interaktif Rubrik Penilaian Capstone Akademik ITERA (Arsitektur 25 poin, Implementasi 35 poin, Evaluasi 25 poin, Dokumentasi 15 poin) lengkap dengan rekomendasi perbaikan nilai.

---

## 5. Ringkasan Hasil Uji Kualitas & Verifikasi

| Tahapan Verifikasi | Metrik / Cakupan | Hasil Pengujian | Status |
| :--- | :--- | :--- | :---: |
| **Python Standalone Scripts** | 5 Skrip (Bab 56–60) | Seluruh asersi numerik lolos (Exit Code 0) | **100% PASS** |
| **Dual-Engine Notebooks** | 25 Notebook (Bab 36–60) | 25/25 Notebooks executed synchronously | **100% PASS** |
| **Unit Test Suite (`npm test`)** | 7 Modul Uji Otomatis | 53 Passing Tests, 0 Failed, 0 Cancelled (311 ms) | **100% PASS** |
| **Content & Track Registry** | 60 Chapters, 6 Tracks | Validasi 60 bab published, struktur lengkap | **100% PASS** |
| **Media Attribution Check** | 120 Asset Records | Seluruh path SVG terverifikasi di disk | **100% PASS** |
| **TypeScript Typecheck** | `tsc --noEmit` | Nol error kompilasi | **100% PASS** |
| **Production Build (`vite build`)** | Rollup Bundler & Minify | Kompilasi sukses dalam 3.35 detik | **100% PASS** |

---

## 6. Kaitan Strategis dengan Roadmap Riset ISVWS 2026–2040

Kurikulum yang telah rampung 100% ini menyajikan landasan ilmiah kokoh untuk memajukan agenda riset jangka panjang ITERA:
1. **Primary Expertise (Intelligent Computer Vision)**: Pemahaman mendalam representasi fitur visual dari level piksel analog hingga Vision Transformers dan NeRF.
2. **Research Focus (Intelligent Visual Perception & Sensing)**: Sistem deteksi dan estimasi spasio-temporal yang tangguh terhadap variasi pencahayaan dan degradasi lingkungan.
3. **Strategic Extension (Vision-Centric Multimodal Perception)**: Sinergi harmonis antara data visual dengan sinyal akustik dan konteks spasial untuk mereduksi alarm palsu pada pemantauan otonom.
4. **Supporting Competence (Edge AI & Multimedia Systems)**: Kemandirian komputasi tepi berdaya rendah yang memungkinkan penerapan kecerdasan buatan di daerah terpencil tanpa ketergantungan koneksi awan.

