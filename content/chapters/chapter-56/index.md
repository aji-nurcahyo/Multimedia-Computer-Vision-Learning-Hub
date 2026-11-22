# Bab 56 — Real-Time Multimedia Processing

**Seksi Kurikulum:** Seksi 12 — Multimedia Systems & Capstone  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Pemrosesan multimedia waktu-nyata (*real-time multimedia processing*) merupakan jembatan kritis yang menghubungkan algoritma visi komputer dan pemrosesan sinyal digital dengan implementasi perangkat keras di dunia nyata. Dalam sistem visi interaktif, pemantauan otonom, telekonferensi, dan kendali robotik, sebuah algoritma yang menghasilkan akurasi sempurna tidak memiliki nilai praktis jika membutuhkan waktu 500 milidetik per frame saat dinamika lingkungan berubah dalam interval 33 milidetik (30 frame per detik).

Pada **Seksi 12 (Multimedia Systems & Capstone)** dalam kurikulum **Intelligent Computer Vision (ITERA / ISVWS 2026–2040)**, bab ini membuka fondasi rekayasa sistem multimedia berlatensi rendah dengan menempatkan visi komputer cerdas sebagai fokus utama.

```
+-----------------------------------------------------------------------------------+
|               PIPELINE PEMROSESAN MULTIMEDIA REAL-TIME ASINKRON                   |
+-----------------------------------------------------------------------------------+
 [ Sensor / Kamera ] ---> [ Capture Thread ] ---> [ FIFO Ring Buffer ] ---> [ Worker Thread ] ---> [ Display / Stream ]
     λ (FPS)                  (DMA I/O)             T_queue = Q / μ             μ (FPS)              VSync (60 Hz)
```

Topik-topik inti yang dibahas pada bab ini meliputi:
1. **Definisi Waktu-Nyata (*Hard vs Soft Real-Time*)**: Batas tenggat waktu (*deadline*), degradasi kualitas layanan (*Quality of Service / QoS*), dan karakteristik sistem visi berbasis frame.
2. **Arsitektur Multi-Threading Asinkron**: Pemisahan tegas antara thread akuisisi I/O (*capture thread*), antrean buffer terikat (*bounded ring buffer*), thread komputasi visi (*worker thread*), dan thread visualisasi/render.
3. **Analisis Latensi End-to-End & Jitter**: Dekomposisi latensi akumulatif $T_{\text{total}} = T_{\text{capture}} + T_{\text{queue}} + T_{\text{processing}} + T_{\text{render}}$ serta perumusan matematis variansi waktu antar-frame (*jitter*).
4. **Strategi Manajemen Buffer & Kebijakan Drop**: Penanganan kondisi kelebihan muatan (*backpressure*) saat laju kedatangan $\lambda$ melampaui laju pemrosesan $\mu$ melalui kebijakan *Drop-Oldest* vs *Drop-Newest*.
5. **Sinkronisasi Audio-Visual**: Penyelarasan cap waktu (*presentation timestamp / PTS*) untuk mencegah fenomena desinkronisasi bibir (*lip-sync skew*).

---

## 2. Landasan Matematis & Algoritma

### 2.1 Dekomposisi Latensi Pipeline End-to-End

Total latensi pipa dari saat foton cahaya menyentuh sensor sensor hingga bounding box ditampilkan pada layar dihitung secara aditif:
$$T_{\text{total}} = T_{\text{capture}} + T_{\text{queue}} + T_{\text{proc}} + T_{\text{render}}$$

Di mana:
- $T_{\text{capture}}$: Waktu eksposur sensor dan transfer memori DMA (Direct Memory Access) ke host (tipikal: $2.0 - 5.0$ ms).
- $T_{\text{queue}}$: Waktu tinggal frame di dalam buffer antrean antarthread.
- $T_{\text{proc}}$: Waktu komputasi algoritma (filter spasial, deteksi objek, inferensi CNN) per frame.
- $T_{\text{render}}$: Waktu transfer ke frame buffer GPU dan sinkronisasi VSync layar (tipikal: $1.0 - 4.0$ ms).

Agar sistem tidak mengalami penumpukan frame (*buffer bloat*), sistem harus memenuhi batasan throughput:
$$\mu \ge \lambda$$
Di mana $\lambda$ adalah laju kedatangan frame (*arrival rate*) dan $\mu = \frac{1000}{T_{\text{proc}}}$ adalah laju layanan sistem (*service rate*).

### 2.2 Dinamika Antrean & Formulasi Waktu Tunggu

Jika buffer antrean memiliki okupansi $Q$ frame saat frame baru tiba, waktu tunggu antrean (*queue delay*) diberikan oleh:
$$T_{\text{queue}} = \frac{Q}{\mu} \times 1000 \quad \text{(ms)}$$

Jika kapasitas maksimum buffer adalah $N_{\max}$, maka latensi antrean terburuk (*worst-case queuing latency*) adalah:
$$T_{\text{queue, max}} = \frac{N_{\max}}{\mu} \times 1000 \quad \text{(ms)}$$

### 2.3 Formulasi Frame Drop Rate

Ketika laju kedatangan frame kamera $\lambda$ lebih tinggi daripada kemampuan pemrosesan worker $\mu$ ($\lambda > \mu$), antrean akan penuh. Rasio frame yang terpaksa dibuang (*frame drop rate*) secara teoritis adalah:
$$\text{Drop Rate} = \max\left(0, \frac{\lambda - \mu}{\lambda}\right) = 1 - \frac{\mu}{\lambda}$$

Sebagai contoh, jika kamera mengirim $\lambda = 30$ FPS namun modul visi hanya mampu memproses $\mu = 20$ FPS:
$$\text{Drop Rate} = \frac{30 - 20}{30} = \frac{10}{30} = 33.33\%$$

### 2.4 Formulasi Statistik Jitter Inter-Frame

Jitter mendeskripsikan fluktuasi ketidakteraturan interval waktu antar-kedatangan frame $\Delta t_i = t_i - t_{i-1}$. Deviasi standar jitter dari $N$ pengamatan didefinisikan sebagai:
$$\bar{\Delta t} = \frac{1}{N-1} \sum_{i=1}^{N-1} \Delta t_i$$
$$\text{Jitter} (\sigma_{\Delta t}) = \sqrt{\frac{1}{N-2} \sum_{i=1}^{N-1} (\Delta t_i - \bar{\Delta t})^2}$$

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita hitung secara analitis performa dua skenario pipeline sistem pemantauan visi waktu-nyata:

### Skenario A: Sistem Seimbang (Balanced Real-Time at 30 FPS)
- Kamera: $\lambda = 30$ FPS $\implies$ Interval kedatangan $\Delta t_{\text{ideal}} = 33.33$ ms.
- Latensi tahapan:
  - $T_{\text{capture}} = 3.5$ ms
  - $T_{\text{proc}} = 18.0$ ms (Laju layanan $\mu = \frac{1000}{18.0} = 55.56$ FPS)
  - Ukuran antrean rata-rata: $Q = 0.5$ frame
  - $T_{\text{render}} = 2.0$ ms

**Perhitungan:**
1. Waktu tunggu antrean:
   $$T_{\text{queue}} = \frac{0.5}{55.56} \times 1000 = 9.0 \text{ ms}$$
2. Total Latensi End-to-End:
   $$T_{\text{total}} = 3.5 + 9.0 + 18.0 + 2.0 = 32.5 \text{ ms}$$
3. Evaluasi Deadline ($33.33$ ms):
   $$T_{\text{total}} = 32.5 \text{ ms} < 33.33 \text{ ms} \implies \text{Memenuhi Deadline!}$$
4. Drop Rate: Karena $\mu = 55.56 > \lambda = 30$, $\text{Drop Rate} = 0.0\%$.

### Skenario B: Sistem Overload dengan Buffer Terbatas ($N_{\max} = 2$)
- Kamera: $\lambda = 30$ FPS
- Pemrosesan CNN Kompleks: $T_{\text{proc}} = 50.0$ ms ($\mu = 20.0$ FPS)
- Kebijakan Buffer: Drop-Oldest saat antrean terisi $N_{\max} = 2$ frame.

**Perhitungan:**
1. Laju buang frame (*Drop Rate*):
   $$\text{Drop Rate} = \frac{30 - 20}{30} = 33.33\%$$
2. Maksimum waktu tunggu antrean saat penuh:
   $$T_{\text{queue, max}} = \frac{2}{20.0} \times 1000 = 100.0 \text{ ms}$$
3. Total Latensi saat buffer terisi:
   $$T_{\text{total}} = 3.5 + 100.0 + 50.0 + 2.0 = 155.5 \text{ ms}$$
   *Insight Rekayasa*: Meskipun throughput efektif sistem adalah 20 FPS, latensi visual membengkak menjadi 155.5 ms. Jika aplikasi mengutamakan interaktivitas segera (misal kendali drone), kapasitas buffer harus diperkecil menjadi $N_{\max} = 1$ atau $0$ (lewatkan langsung frame terbaru).

---

## 4. Panduan Tiga Tingkat (Three-Tier Walkthrough)

### Tingkat 1: Konsep & Intuisi Sistem
Bayangkan antrean di kasir supermarket. Jika pembeli datang 30 orang per menit sementara kasir hanya mampu melayani 20 orang per menit, antrean akan memanjang tanpa batas hingga toko runtuh (*out-of-memory crash*). Untuk sistem multimedia waktu-nyata, solusi satu-satunya adalah membatasi kapasitas antrean dan secara sengaja membuang frame lama agar frame yang diproses selalu merupakan gambaran dunia terkini.

### Tingkat 2: Bedah Implementasi Kode Python
Skrip referensi `examples/example-01.py` mengimplementasikan simulator multi-thread produsen-konsumen (*producer-consumer queue*) menggunakan antrean aman-thread `queue.Queue` atau buffer terikat dengan kunci atomik. Skrip mengukur waktu kedatangan, waktu inferensi visual terprofil, menghitung deviasi standar jitter, dan memverifikasi rasio drop secara presisi numerik.

### Tingkat 3: Wawasan Praktis & Jebakan Produksi
> [!WARNING]
> **Jebakan Buffer Bloat**: Menggunakan antrean tanpa batas (`queue.Queue(maxsize=0)`) pada kamera streaming RTSP akan mengakibatkan penumpukan memori RAM dan latensi video yang terus meningkat seiring berjalannya waktu (delay bisa mencapai beberapa detik). Gunakan selalu `maxsize=1` atau `maxsize=2` dengan logika pembuangan frame tertua.

> [!TIP]
> **Akselerasi Zero-Copy**: Hindari konversi format warna BGR ke RGB berulang kali di dalam loop utama. Manfaatkan buffer memori bersama (*shared memory*) atau pointer DMA untuk meminimalkan beban memori bus CPU-GPU.

---

## 5. Ringkasan & Kaitan Riset ISVWS 2026–2040

Pemrosesan multimedia waktu-nyata merupakan pilar operasional utama dari agenda riset **Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS 2026–2040)**. Sistem pemantauan cerdas generasi berikutnya menuntut transmisi video minim latensi yang dipadukan dengan kompresi semantik berbasis AI di perangkat tepi, di mana setiap milidetik penghematan komputasi berkontribusi langsung pada keselamatan operasional dan keandalan sistem otonom.

