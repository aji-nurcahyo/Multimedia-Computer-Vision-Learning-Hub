# Bab 59 — Performance Optimization & Deployment

**Seksi Kurikulum:** Seksi 12 — Multimedia Systems & Capstone  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Dalam rekayasa sistem multimedia dan visi komputer profesional, pepatah terkenal Donald Knuth berbunyi: *"Premature optimization is the root of all evil"* (Optimasi dini adalah akar dari segala keburukan). Melakukan optimasi kode secara serampangan tanpa pengukuran empiris sering kali memperumit arsitektur perangkat lunak tanpa menghasilkan peningkatan performa yang berarti. Pendekatan rekayasa yang disiplin menuntut siklus yang terstruktur: **Ukur (Profile) $\to$ Identifikasi Titik Hambat (Bottleneck) $\to$ Optimasi Berbasis Bukti (Targeted Optimization) $\to$ Verifikasi Kinerja (Benchmark Validation)**.

Pada **Seksi 12 (Multimedia Systems & Capstone)** dalam kurikulum **Intelligent Computer Vision (ITERA / ISVWS 2026–2040)**, bab ini membekali mahasiswa dengan metodologi ilmiah untuk mengoptimalkan efisiensi komputasi, dekomposisi anggaran latensi per frame, serta teknik distribusi aplikasi statis berkinerja tinggi (*high-performance static deployment*).

```
+-----------------------------------------------------------------------------------------+
|                  PIPELINE DEKOMPOSISI ANGGARAN LATENSI & PROFILING                      |
+-----------------------------------------------------------------------------------------+
 [ Capture 2.5ms ] -> [ Prep 1.5ms ] -> [ DNN Inference 8.0ms ] -> [ Post 1.0ms ] -> [ Headroom +3.67ms ]
  Total = 13.0 ms  |  Target Budget = 16.67 ms (60 FPS)  |  Achievable Throughput = 76.9 FPS (Lolos Budget)
```

Topik-topik utama yang dipelajari pada bab ini meliputi:
1. **Dekomposisi Latensi & Anggaran Frame (Frame-Time Budget)**: Menyelaraskan seluruh tahapan komputasi ke dalam batas tenggat waktu 60 FPS ($16.67$ ms) atau 30 FPS ($33.33$ ms).
2. **Hukum Amdahl (*Amdahl's Law*)**: Pemodelan batas teoritis percepatan sistem ($S_{\text{overall}}$) berdasarkan proporsi waktu tahapan yang dapat dioptimasi ($p$) dan faktor percepatan tahapan tersebut ($s$).
3. **Teknik Profiling CPU, GPU, dan Memori**: Pemanfaatan Chrome DevTools Performance Profiler, pengukuran waktu presisi tinggi `performance.now()`, dan deteksi kebocoran memori (*memory leak detection*).
4. **Optimasi Bundel Web & Distribusi Statis Edge**: *Tree shaking*, minifikasi kode, pemisahan bundel (*code splitting / chunking*), kompresi Gzip/Brotli, dan distribusi konten melalui Content Delivery Network (CDN).
5. **Kesiapan Menuju Capstone Terintegrasi**: Menyusun fondasi telemetri kinerja yang wajib disertakan dalam Proyek Akhir Capstone Bab 60.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Dekomposisi Anggaran Waktu Frame (Latency Budgeting)

Agar sistem interaktif dapat mempertahankan laju tampilan stabil pada target laju frame $F_{\text{target}}$ (misalnya 60 FPS), total waktu pemrosesan seluruh tahapan tidak boleh melampaui batas anggaran $T_{\text{budget}}$:
$$T_{\text{budget}} = \frac{1000}{F_{\text{target}}} \quad \text{(ms)}$$

Jika sistem terdiri dari $K$ tahapan sekuensial (misalnya: Akuisisi $T_{\text{cap}}$, Prapemrosesan $T_{\text{prep}}$, Inferensi Jaringan Syaraf $T_{\text{inf}}$, Pascabuang/Tracking $T_{\text{post}}$):
$$T_{\text{total}} = \sum_{k=1}^K T_k$$

Sisa waktu cadangan (*Headroom*) didefinisikan sebagai:
$$T_{\text{headroom}} = T_{\text{budget}} - T_{\text{total}}$$

- Jika $T_{\text{headroom}} \ge 0$: Sistem stabil memenuhi target frame rate. Throughput maksimum yang dapat dicapai (*achievable FPS*) adalah $F_{\text{max}} = \frac{1000}{T_{\text{total}}}$.
- Jika $T_{\text{headroom}} < 0$: Terjadi pelanggaran tenggat waktu (*deadline overrun*) yang memicu penurunan frame rate dan tampilan patah-patah (*stutter*). Tahapan dengan $T_k$ terbesar ditetapkan sebagai **Bottleneck Primer**.

### 2.2 Formulasi Hukum Amdahl (Amdahl's Law)

Hukum Amdahl menyatakan bahwa percepatan maksimum yang dapat dicapai oleh suatu sistem secara keseluruhan dibatasi oleh bagian program yang tidak dapat dipercepat.

Jika suatu tahapan memiliki proporsi runtime $p \in [0, 1]$ terhadap total durasi program awal, dan tahapan tersebut berhasil dipercepat sebesar faktor $s > 1$ (misalnya melalui kuantisasi INT8 atau akselerasi WebGPU), maka faktor percepatan sistem secara keseluruhan ($S_{\text{overall}}$) dirumuskan oleh:
$$S_{\text{overall}} = \frac{1}{(1 - p) + \frac{p}{s}}$$

**Karakteristik Kritis:**
- Jika $s \to \infty$ (tahapan tersebut dipercepat menjadi instan / 0 detik):
  $$S_{\text{max}} = \frac{1}{1 - p}$$
  Sebagai contoh, jika inferensi neural network mencakup $p = 0.80$ (80%) dari total waktu aplikasi, percepatan teoretis maksimum sistem jika inferensi dibuat secepat kilat sekalipun adalah $S_{\text{max}} = \frac{1}{1 - 0.80} = 5.0\times$.
- Mengoptimalkan tahapan yang hanya memakan $p = 0.05$ (5%) dari total waktu adalah pemborosan sumber daya rekayasa, karena percepatan maksimumnya tidak akan pernah melebihi $\frac{1}{1 - 0.05} = 1.052\times$.

### 2.3 Analisis Jejak Bundel Statis & Waktu Pemuatan Jaringan

Pada arsitektur web modern, aset aplikasi statis didistribusikan melalui jaringan internet. Waktu pemuatan awal (*Initial Load Time / Time-to-Interactive*) di bawah bandwidth jaringan $B$ (Bytes/detik) dimodelkan sebagai:
$$T_{\text{load}} = \frac{\sum M_{\text{raw}} \times R_{\text{comp}}}{B}$$
Di mana $\sum M_{\text{raw}}$ adalah total ukuran modul JavaScript/WASM mentah, dan $R_{\text{comp}}$ adalah rasio kompresi kompresor (tipikal: $R_{\text{gzip}} \approx 0.35$, $R_{\text{brotli}} \approx 0.28$).

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis dan deterministik evaluasi performa dua skenario optimasi pipeline computer vision:

### Skenario A: Dekomposisi Anggaran Waktu 60 FPS
Sebuah sistem deteksi objek wajah dan pelacakan mata diukur durasi per tahapannya:
- $T_{\text{capture}} = 2.5$ ms (Eksposur dan transfer memori)
- $T_{\text{preprocess}} = 1.5$ ms (Resize $640 \times 480$ ke $224 \times 224$ dan normalisasi)
- $T_{\text{inference}} = 8.0$ ms (Inferensi model MobileNet INT8)
- $T_{\text{postprocess}} = 1.0$ ms (Non-Maximum Suppression dan penggambaran bounding box)

**Perhitungan:**
1. Total waktu pipa:
   $$T_{\text{total}} = 2.5 + 1.5 + 8.0 + 1.0 = 13.0 \text{ ms}$$
2. Anggaran frame untuk 60 FPS:
   $$T_{\text{budget}} = \frac{1000}{60} \approx 16.67 \text{ ms}$$
3. Headroom waktu:
   $$T_{\text{headroom}} = 16.67 - 13.0 = +3.67 \text{ ms} \quad (\text{Memenuhi Budget!})$$
4. Throughput maksimum yang dapat dicapai:
   $$F_{\text{max}} = \frac{1000}{13.0} \approx 76.92 \text{ FPS}$$
5. Identifikasi Bottleneck: Inferensi model menyumbang durasi terbesar ($8.0$ ms dari $13.0$ ms), yaitu:
   $$p_{\text{inference}} = \frac{8.0}{13.0} \approx 0.6154 \quad (61.54\%)$$

### Skenario B: Penerapan Hukum Amdahl pada Optimasi Inferensi
Pengembang memutuskan untuk menerapkan akselerasi WebGPU pada tahapan inferensi, sehingga durasi inferensi dipercepat sebesar faktor $s = 4.0\times$ (dari $8.0$ ms menjadi $\frac{8.0}{4.0} = 2.0$ ms).

**Perhitungan:**
1. Menggunakan rumus Hukum Amdahl dengan $p = \frac{8.0}{13.0} \approx 0.61538$ dan $s = 4.0$:
   $$S_{\text{overall}} = \frac{1}{(1 - 0.61538) + \frac{0.61538}{4.0}} = \frac{1}{0.38462 + 0.15385} = \frac{1}{0.53847} \approx 1.857 \times$$
2. Verifikasi langsung dari durasi baru:
   $$T_{\text{total, baru}} = 2.5 + 1.5 + 2.0 + 1.0 = 7.0 \text{ ms}$$
   $$S_{\text{direct}} = \frac{T_{\text{total, lama}}}{T_{\text{total, baru}}} = \frac{13.0}{7.0} \approx 1.8571 \times$$
3. Throughput baru:
   $$F_{\text{max, baru}} = \frac{1000}{7.0} \approx 142.86 \text{ FPS}$$

*Pelajaran Kritis*: Meskipun modul inferensi dipercepat $400\%$ ($4.0\times$), percepatan aplikasi keseluruhan adalah $1.86\times$ karena tahapan I/O dan prapemrosesan ($5.0$ ms) tidak terpengaruh oleh akselerator GPU.

---

## 4. Panduan Tiga Tingkat (Three-Tier Walkthrough)

### Tingkat 1: Konsep & Intuisi Sistem
Hukum Amdahl seperti memasak nasi uduk di dapur. Jika menanak nasi memakan waktu 40 menit dan memotong bawang memakan waktu 10 menit (total 50 menit), membeli pisau pemotong super cepat yang mampu memotong bawang dalam 1 detik sekalipun hanya menghemat 10 menit (total waktu memasak masih 40 menit). Jika Anda ingin memasak lebih cepat secara signifikan, fokuskan perhatian Anda pada proses yang memakan waktu paling lama (menanak nasi).

### Tingkat 2: Bedah Implementasi Kode Python
Skrip referensi `examples/example-01.py` memodelkan formula Hukum Amdahl secara analitis, menganalisis profil anggaran latensi pipa, mendeteksi bottleneck tahapan, serta menghitung estimasi ukuran kompresi bundel statis dan waktu pemuatan jaringan.

### Tingkat 3: Wawasan Praktis & Jebakan Produksi
> [!IMPORTANT]
> **Hindari Mikro-Optimasi yang Tidak Berdampak**: Jangan menghabiskan waktu berhari-hari mengoptimasi loop pembulatan piksel ($p < 0.02$) jika inferensi model CNN memakan $70\%$ waktu eksekusi. Gunakan selalu profiler untuk memvalidasi alokasi waktu nyata sebelum memulai optimasi.

> [!TIP]
> **Pemisahan Bundel Vendor vs Kode Aplikasi**: Dalam Vite / Rollup bundler, pisahkan dependensi pihak ketiga (`react`, `katex`, `lucide-react`) ke dalam vendor chunk tersendiri. Ini memungkinkan peramban menyimpan cache dependensi secara permanen (*immutable caching*), sehingga pembaruan materi bab tidak memaksa pengguna mengunduh ulang pustaka inti.

---

## 5. Ringkasan & Kaitan Riset ISVWS 2026–2040

Efisiensi komputasi dan optimasi performa merupakan keahlian inti yang membedakan purwarupa riset laboratorium dengan produk sistem teruji industri. Dalam roadmap **ISVWS 2026–2040**, setiap milliwatt daya pada sensor nirkabel dan setiap millidetik latensi pada sistem pemantauan otonom sangat bergantung pada penguasaan dekomposisi waktu dan hukum penskalaan komputasi yang dipelajari pada bab ini.

