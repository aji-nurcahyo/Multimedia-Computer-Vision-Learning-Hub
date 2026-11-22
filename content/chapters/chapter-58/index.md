# Bab 58 — Multimedia Web Applications & APIs

**Seksi Kurikulum:** Seksi 12 — Multimedia Systems & Capstone  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Peramban web modern (*modern web browser*) telah berevolusi dari sekadar penampil dokumen teks statis menjadi sistem operasi mini berkemampuan komputasi multimedia grafis dan kecerdasan visual yang tangguh. Melalui integrasi antarmuka pemrograman aplikasi standar terbuka (*W3C Open Web APIs*), pengembang dapat mengakses kamera video definisi tinggi, mikrofon multi-kanal, akselerator GPU lokal, dan multi-threading tanpa memerlukan instalasi plugin tambahan pihak ketiga (*zero-plugin architecture*).

Dalam konteks kurikulum **Intelligent Computer Vision (ITERA / ISVWS 2026–2040)**, penguasaan aplikasi web multimedia sangat vital karena platform pembelajaran ini sendiri (*Multimedia & Computer Vision Learning Hub*) didesain sebagai aplikasi web statis modern (*web-first interactive platform*). Arsitektur peramban memungkinkan mahasiswa mengeksekusi laboratorium interaktif visi dan audio secara instan, aman, dan privat langsung di perangkat masing-masing (*client-side edge execution*).

```
+-----------------------------------------------------------------------------------------+
|                  ARSITEKTUR PEMROSESAN MULTIMEDIA IN-BROWSER                            |
+-----------------------------------------------------------------------------------------+
 [ navigator.mediaDevices ] ---> [ <video> / <canvas> ] ---> [ Web Worker Thread ] ---> [ WebGL / WebGPU ]
   getUserMedia({video})          ctx.getImageData()          Zero-Copy ArrayBuffer       Near-Native Math
```

Topik-topik utama yang dipelajari pada bab ini meliputi:
1. **Arsitektur Web Multimedia Modern**: Pemisahan eksekusi antara *Main UI Thread* dan thread latar belakang (*Dedicated Web Workers*).
2. **Media Capture & Streams API**: Pemanfaatan `navigator.mediaDevices.getUserMedia` untuk akuisisi aliran video/audio dengan kendali resolusi (*constraints*) dan manajemen izin privasi (*permission lifecycle*).
3. **HTML5 Canvas & Manipulasi Buffer Piksel**: Ekstraksi dan manipulasi array byte piksel terstruktur `Uint8ClampedArray` melalui `CanvasRenderingContext2D` (`getImageData` dan `putImageData`).
4. **Analisis Bandwidth Memori Piksel**: Perhitungan jejak memori frame buffer dan *throughput* bus memori peramban pada berbagai resolusi (VGA, 720p, 1080p, 4K) dan laju frame (30 vs 60 FPS).
5. **Akselerasi Komputasi & Inferensi Browser**: Pengantar WebAssembly (WASM SIMD), WebGL Shader, dan WebGPU untuk inferensi neural network lokal berkecepatan tinggi tanpa biaya server cloud.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Jejak Memori Frame Buffer Piksel RGBA

Pada kanvas HTML5 2D, representasi citra di dalam memori peramban disusun secara sekuensial (*interleaved byte buffer*) dengan 4 saluran warna (Red, Green, Blue, Alpha) dalam format `Uint8ClampedArray`:
$$\text{Buffer Size (Bytes)} = W \times H \times C$$
Di mana $W$ adalah lebar citra, $H$ adalah tinggi citra, dan $C = 4$ saluran per piksel.

Dalam satuan Megabyte (MB biner, $1 \text{ MB} = 1024^2 \text{ Bytes} = 1,048,576 \text{ Bytes}$):
$$\text{Memory Footprint (MB)} = \frac{W \times H \times 4}{1024 \times 1024}$$

### 2.2 Throughput Bandwidth Memori Peramban

Jika aplikasi memproses aliran video pada laju frame $F$ (Frame Per Second / FPS), laju throughput piksel dan bandwidth memori mentah yang harus dialokasikan oleh peramban dihitung sebagai berikut:

1. **Pixel Throughput (Megapiksel per detik / MP/s)**:
   $$\text{Throughput}_{\text{pixel}} = \frac{W \times H \times F}{10^6}$$
2. **Memory Bandwidth (MB per detik / MB/s)**:
   $$\text{Bandwidth}_{\text{memory}} = \frac{W \times H \times 4 \times F}{1024 \times 1024}$$

### 2.3 Model Pemisahan Thread & Waktu Pemblokiran UI

Dalam model peramban berbasis event loop tunggal (*single-threaded UI event loop*), setiap operasi komputasi visi komputer intensif yang dieksekusi pada *Main Thread* akan membekukan antarmuka pengguna (*UI jank / freezing*).

Jika waktu komputasi pemrosesan citra adalah $T_{\text{proc}}$ ms:
- **Pada Main Thread**: Waktu pemblokiran antarmuka adalah $T_{\text{block}} = T_{\text{proc}}$. Jika $T_{\text{proc}} > 16.67$ ms, peramban akan membuang frame (*dropped frames*) dan animasi antarmuka tersendat (*stutter*).
- **Pada Dedicated Web Worker dengan Transferable Objects**: Waktu pemblokiran Main Thread tereduksi hanya menjadi waktu transfer pointer buffer memori $T_{\text{transfer}}$:
  $$T_{\text{block, worker}} = T_{\text{transfer}} \ll 1.0 \text{ ms}$$
  Di mana objek `ArrayBuffer` dialihkan kepemilikannya (*zero-copy buffer ownership transfer*) menggunakan:
  $$\text{worker.postMessage}(\{ \text{buffer} \}, [\text{buffer}])$$

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis dan deterministik karakteristik konsumsi memori dan bandwidth untuk dua skenario aplikasi web computer vision:

### Skenario A: Pemrosesan Full HD (1080p pada 60 FPS)
- Resolusi: $W = 1920$ piksel, $H = 1080$ piksel, $C = 4$ saluran (RGBA).
- Laju frame target: $F = 60$ FPS.

**Perhitungan:**
1. Jumlah byte per frame:
   $$\text{Bytes} = 1920 \times 1080 \times 4 = 8,294,400 \text{ Bytes}$$
2. Ukuran memori per frame (MB):
   $$\text{Ukuran} = \frac{8,294,400}{1,048,576} \approx 7.910 \text{ MB per frame}$$
3. Throughput piksel:
   $$\text{Throughput}_{\text{pixel}} = \frac{1920 \times 1080 \times 60}{10^6} = \frac{124,416,000}{10^6} = 124.42 \text{ Megapiksel/detik}$$
4. Kebutuhan bandwidth memori peramban:
   $$\text{Bandwidth} = 7.910156 \text{ MB} \times 60 \approx 474.61 \text{ MB/detik}$$

*Insight Rekayasa*: Mengekstrak `getImageData()` pada resolusi 1080p sebanyak 60 kali per detik menuntut bandwidth memori hampir $0.5$ Gigabyte per detik! Hal ini akan memicu *garbage collection pauses* yang berat jika buffer dialokasikan ulang di setiap frame.

### Skenario B: Desain Teroptimasi untuk Inferensi Vision (VGA 640x480 pada 30 FPS)
- Resolusi: $W = 640$ piksel, $H = 480$ piksel, $C = 4$ saluran (RGBA).
- Laju frame: $F = 30$ FPS.

**Perhitungan:**
1. Jumlah byte per frame:
   $$\text{Bytes} = 640 \times 480 \times 4 = 1,228,800 \text{ Bytes}$$
2. Ukuran memori per frame (MB):
   $$\text{Ukuran} = \frac{1,228,800}{1,048,576} \approx 1.172 \text{ MB per frame}$$
3. Kebutuhan bandwidth memori peramban:
   $$\text{Bandwidth} = 1.171875 \text{ MB} \times 30 \approx 35.16 \text{ MB/detik}$$

*Kesimpulan Arsitektur*: Dengan menurunkan resolusi stream pemrosesan ke VGA ($640 \times 480$) sambil mempertahankan tampilan video HD pada elemen `<video>`, bandwidth memori berkurang drastis dari **$474.61$ MB/s menjadi hanya $35.16$ MB/s** (penghematan bandwidth sebesar **$92.6\%$**), menjamin responsivitas 60 FPS pada peramban mobile.

---

## 4. Panduan Tiga Tingkat (Three-Tier Walkthrough)

### Tingkat 1: Konsep & Intuisi Sistem
Mengeksekusi algoritma pemrosesan citra pada peramban web seperti mengendarai mobil di jalan tol. Main UI Thread adalah lajur utama tempat lalu lintas umum berjalan; jika ada truk besar (komputasi visi intensif) mogok di tengah jalan, seluruh mobil di belakangnya akan berhenti total (*browser freeze*). Dengan memindahkan truk tersebut ke lajur khusus terpisah (*Dedicated Web Worker*), mobil di jalan tol tetap melaju mulus pada kecepatan 60 FPS tanpa hambatan.

### Tingkat 2: Bedah Implementasi Kode Python
Skrip referensi `examples/example-01.py` memodelkan kalkulator throughput buffer memori piksel, menganalisis perbedaan bandwidth antar-resolusi, dan menyimulasikan dampak pemindahan beban kerja (*worker offloading*) terhadap waktu pemblokiran thread antarmuka.

### Tingkat 3: Wawasan Praktis & Jebakan Produksi
> [!WARNING]
> **Jebakan Alokasi Memori Berulang**: Jangan pernah memanggil `ctx.createImageData()` atau mengalokasikan array baru di dalam loop `requestAnimationFrame()`. Alokasi berulang akan memicu siklus pembersihan memori (*Garbage Collector*) yang menyebabkan jeda mendadak (*micro-stutters*). Alokasikan buffer sekali di awal (*pre-allocation*) dan gunakan kembali secara in-place.

> [!TIP]
> **Pemanfaatan Transferable Objects**: Saat mengirim data citra ke Web Worker, sertakan buffer memori di parameter transfer `postMessage(data, [data.data.buffer])`. Ini mengalihkan pointer memori secara instan (0 ms) tanpa melakukan salinan byte berukuran besar.

---

## 5. Ringkasan & Kaitan Riset ISVWS 2026–2040

Arsitektur aplikasi web multimedia tanpa ketergantungan server (*serverless client-side vision*) selaras dengan visi demokratisasi akses teknologi dalam agenda **ISVWS 2026–2040**. Dengan menjalankan model visi langsung di peramban pengguna, platform pemantauan dan edukasi dapat diakses oleh jutaan siswa di seluruh pelosok Indonesia tanpa memerlukan infrastruktur server terpusat yang mahal dan rentan downtime.

