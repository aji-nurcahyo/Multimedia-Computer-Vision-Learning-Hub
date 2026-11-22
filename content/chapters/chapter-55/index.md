# Bab 55 — Multimodal Application Development

**Seksi Kurikulum:** Seksi 11 — Multimodal AI  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Pengembangan aplikasi multimodal di dunia industri menuntut integrasi harmonis antara teori pemodelan matematika dengan rekayasa perangkat lunak waktu-nyata (*real-time software engineering*). Menghubungkan algoritma visi komputer canggih, pemrosesan sinyal akustik, dan telemetri sensorik ke dalam sebuah produk fungsional tidak hanya berkutat pada akurasi metrik mAP atau Recall@K di atas kertas, melainkan harus menjawab tantangan latensi per frame, konsumsi daya komputasi perangkat keras tepi (*Edge AI power consumption*), manajemen buffer data asinkron, serta penanganan kegagalan sensor (*sensor failure & fallback handling*).

Sebagai bab penutup pada **Seksi 11 (Multimodal AI)** dalam kurikulum **Intelligent Computer Vision (ITERA / ISVWS 2026–2040)**, bab ini mensintesis seluruh konsep dari Bab 51 hingga 54 ke dalam sebuah **alur kerja aplikasi pemantauan cerdas berpusat pada visi (*Vision-Centric Intelligent Monitoring System*)**.

Arsitektur aplikasi ini menempatkan kamera visual sebagai sensor primer untuk pemantauan spasial kontinu, yang didukung oleh sensor akustik dan sensor termal/radar:
$$\text{Visual Input} \longrightarrow \text{Feature Extraction} \longrightarrow \text{Sensor Alignment} \longrightarrow \text{Adaptive Fusion} \longrightarrow \text{Decision Engine} \longrightarrow \text{Edge Deployment}$$

Topik-topik rekayasa utama mencakup:
1. **Pipeline Akuisisi & Streaming Asinkron**: Pengambilan aliran video (RTSP/V4L2) dan aliran audio/telemetri menggunakan thread terpisah yang tidak saling memblokir (*non-blocking multithreaded I/O*).
2. **Kompensasi Latensi & Buffer Sinkronisasi**: Sinkronisasi temporal antar-frame menggunakan stempel waktu perangkat keras (*hardware timestamps*) dan antrean melingkar (*circular ring buffers*).
3. **Optimasi Inferensi Tepi (*Edge AI Optimization*)**: Kompresi model melalui kuantisasi INT8 / FP16 pasca-pelatihan (*Post-Training Quantization*), pemangkasan bobot (*pruning*), dan eksekusi menggunakan akselerator perangkat keras (seperti TensorRT atau ONNX Runtime).
4. **Mekanisme Fail-Safe Sensor Dropout**: Memastikan aplikasi tidak mengalami *crash* saat kamera terhalang kabut tebal atau mikrofon terputus, melainkan secara mulus beralih ke modalitas sensorik pendukung (*graceful degradation*).
5. **Ekstensi Masa Depan**: Pengenalan konsep agen bertubuh (*Embodied AI & Robotics Perception*) sebagai wawasan riset lanjutan tanpa mengubah identitas kanonikal kurikulum aplikasi multimodal.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Arsitektur Pipeline Sistem Multimodal Terintegrasi

Aliran data sistem pemantauan cerdas end-to-end dimodelkan sebagai rangkaian tahapan komputasi sekuensial dan paralel:

```
+-------------------------------------------------------------------------+
|        ARSITEKTUR SISTEM PEMANTAUAN MULTIMODAL TERINTEGRASI             |
+-------------------------------------------------------------------------+

 [ Kamera Visual ]   --> Capture (T_cap) --> Vision Encoder  (T_enc,v) --+
 [ Mikrofon Audio ]  --> Capture (T_cap) --> Audio Encoder   (T_enc,a) --+--> [ Buffer & Sync ] (T_sync)
 [ Sensor Termal ]   --> Capture (T_cap) --> Thermal Encoder (T_enc,t) --+          |
                                                                                    v
                                                                          [ Adaptive Fusion Engine ] (T_fuse)
                                                                                    |
                                                                                    v
                                                                          [ Decision & Post-Process ] (T_post)
                                                                                    |
                                                                                    v
                                                                           Output Alarm / Telemetri
```

### 2.2 Formulasi Keputusan Fusi Sadar-Keandalan

Sistem memprediksi kelas peristiwa $\hat{c} \in \{0, 1, \dots, C-1\}$ dari pengamatan tiga modalitas (Visual $\mathbf{I}$, Audio $\mathbf{A}$, Termal $\mathbf{T}$) menggunakan pembobotan terkalibrasi keandalan sensor:
$$\hat{c} = \arg\max_{c} \left( \alpha_v P_v(c \mid \mathbf{I}) + \alpha_a P_a(c \mid \mathbf{A}) + \alpha_t P_t(c \mid \mathbf{T}) \right)$$
Di mana koefisien bobot $\alpha_m$ dihitung dinamis dari faktor kualitas sensor $\gamma_m \ge 0$:
$$\alpha_m = \frac{\gamma_m}{\sum_{k \in \{v, a, t\}} \gamma_k}$$
Jika salah satu sensor terputus ($\gamma_m = 0$), bobotnya otomatis menjadi nol, dan sistem mendistribusikan otoritas keputusan kepada sensor yang masih aktif secara proporsional.

### 2.3 Profiling Latensi End-to-End & Throughput Sistem

Pada sistem pemantauan waktu-nyata, waktu siklus pemrosesan per frame ($T_{\text{total}}$) dibatasi oleh ambang batas kontrol (misalnya $T_{\text{total}} \le 33.3$ ms untuk menjamin throughput $\ge 30$ FPS). Karena ekstraksi fitur pada perangkat keras multi-core dieksekusi secara paralel pada GPU atau akselerator NPU, waktu inferensi encoder ditentukan oleh modalitas yang paling lambat:
$$T_{\text{enc}} = \max(T_{\text{enc, } v}, T_{\text{enc, } a}, T_{\text{enc, } t})$$
Total latensi pipa (*pipeline latency*):
$$T_{\text{total}} = T_{\text{capture}} + T_{\text{enc}} + T_{\text{sync}} + T_{\text{fuse}} + T_{\text{post}}$$
Throughput aplikasi dalam frame per detik (FPS):
$$\text{FPS} = \frac{1000}{T_{\text{total}} \text{ (ms)}}$$

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita simulasikan secara analitis dan deterministik sebuah **Sistem Pemantauan Fasilitas Kritis** yang memantau area terlarang terhadap 3 kelas peristiwa:
- **Kelas 0**: *Kondisi Normal / Lingkungan Aman*
- **Kelas 1**: *Penyusupan / Gerakan Mencurigakan*
- **Kelas 2**: *Bahaya Kebakaran / Asap*

---

### Skenario A: Operasi Normal dengan Seluruh Sensor Aktif

Data pengamatan model pada suatu frame:
1. **Kamera Visual (Primary)**:
   - Distribusi Prediksi: $\mathbf{P}_v = [0.15, 0.75, 0.10]^T$
   - Kualitas Sensor (Optik HD, siang hari): $\gamma_v = 0.85$
2. **Mikrofon Akustik (Secondary)**:
   - Distribusi Prediksi: $\mathbf{P}_a = [0.20, 0.70, 0.10]^T$
   - Kualitas Sensor (Mendeteksi derap langkah & gesekan): $\gamma_a = 0.60$
3. **Sensor Termal Inframerah (Secondary)**:
   - Distribusi Prediksi: $\mathbf{P}_t = [0.10, 0.80, 0.10]^T$
   - Kualitas Sensor (Mendeteksi radiasi panas tubuh manusia): $\gamma_t = 0.75$

#### Langkah 1: Hitung Bobot Normalisasi Reliabilitas
$$\sum \gamma = \gamma_v + \gamma_a + \gamma_t = 0.85 + 0.60 + 0.75 = 2.20$$
$$\alpha_v = \frac{0.85}{2.20} \approx 0.386364$$
$$\alpha_a = \frac{0.60}{2.20} \approx 0.272727$$
$$\alpha_t = \frac{0.75}{2.20} \approx 0.340909$$
Perhatikan: $\sum \alpha = 0.386364 + 0.272727 + 0.340909 = 1.000000$.

#### Langkah 2: Hitung Probabilitas Fusi Akhir
$$\mathbf{P}_{\text{fused}} = \alpha_v \mathbf{P}_v + \alpha_a \mathbf{P}_a + \alpha_t \mathbf{P}_t$$

- **Untuk Kelas 1 (Penyusupan)**:
  $$P_{\text{fused}}(1) = (0.386364 \times 0.75) + (0.272727 \times 0.70) + (0.340909 \times 0.80)$$
  $$= 0.289773 + 0.190909 + 0.272727 = 0.753409 \quad (75.34\%)$$

- **Untuk Kelas 0 (Normal)**:
  $$P_{\text{fused}}(0) = (0.386364 \times 0.15) + (0.272727 \times 0.20) + (0.340909 \times 0.10)$$
  $$= 0.057955 + 0.054545 + 0.034091 = 0.146591 \quad (14.66\%)$$

- **Untuk Kelas 2 (Bahaya/Kebakaran)**:
  $$P_{\text{fused}}(2) = (0.386364 \times 0.10) + (0.272727 \times 0.10) + (0.340909 \times 0.10)$$
  $$= 0.038636 + 0.027273 + 0.034091 = 0.100000 \quad (10.00\%)$$

Jumlah probabilitas: $0.146591 + 0.753409 + 0.100000 = 1.000000$.  
**Keputusan Aplikasi**: Alarm Kelas 1 (*Penyusupan*) diaktifkan dengan keyakinan kuat $75.34\%$.

---

### Skenario B: Uji Ketahanan Sensor Dropout (Kamera Tertutup Asap Pekat)

Misalkan penyusup menyemprotkan asap tebal sehingga kamera optik buta total ($\gamma_v = 0.0$):
$$\sum \gamma_{\text{new}} = 0.0 + 0.60 + 0.75 = 1.35$$
$$\alpha_a = \frac{0.60}{1.35} = \frac{4}{9} \approx 0.444444, \quad \alpha_t = \frac{0.75}{1.35} = \frac{5}{9} \approx 0.555556$$

Probabilitas fallback untuk Kelas 1:
$$P_{\text{fallback}}(1) = \left(\frac{4}{9} \times 0.70\right) + \left(\frac{5}{9} \times 0.80\right) = 0.311111 + 0.444444 = 0.755556 \quad (75.56\%)$$

*Hasil Analisis*: Tanpa interupsi sistem (*zero downtime*), sistem mempertahankan keyakinan deteksi penyusupan sebesar $75.56\%$ mengandalkan sinyal suara langkah kaki dan citra radiasi panas termal.

---

### Skenario C: Profiling Latensi Inferensi Edge Per-Frame

Diketahui pengukuran waktu komputasi komponen perangkat keras:
- Waktu akuisisi sensor buffer: $T_{\text{capture}} = 2.50$ ms
- Waktu encoder paralel GPU:
  - Visual Backbone (MobileNetV3 / ResNet-18 INT8): $T_{\text{enc, } v} = 14.00$ ms
  - Audio Backbone (1D CNN pada Mel-spectrogram): $T_{\text{enc, } a} = 4.00$ ms
  - Thermal Backbone (Lightweight CNN): $T_{\text{enc, } t} = 2.00$ ms
  $$\implies T_{\text{enc}} = \max(14.00, 4.00, 2.00) = 14.00 \text{ ms}$$
- Waktu sinkronisasi buffer antrean: $T_{\text{sync}} = 0.50$ ms
- Waktu fusi terbobot keandalan: $T_{\text{fuse}} = 0.80$ ms
- Waktu pasca-pemrosesan & logika alarm: $T_{\text{post}} = 1.20$ ms

Total Latensi Siklus Frame:
$$T_{\text{total}} = 2.50 + 14.00 + 0.50 + 0.80 + 1.20 = 19.00 \text{ ms}$$

Throughput Sistem:
$$\text{Throughput} = \frac{1000 \text{ ms}}{19.00 \text{ ms}} \approx 52.63 \text{ FPS}$$

Karena throughput $52.63 \text{ FPS} > 30 \text{ FPS}$ (dan latensi $19.0 \text{ ms} < 33.3 \text{ ms}$), sistem terverifikasi memenuhi syarat operasional *real-time edge computing*.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Guncangan Latensi & Luapan Antrean (*Latency Spikes & Buffer Overflow*)**:
   - *Penyebab*: Lonjakan beban CPU saat tugas sistem operasi berjalan di latar belakang menyebabkan antrean frame video menumpuk, memicu peningkatan latensi kumulatif (*lag buildup*).
   - *Solusi Teknik*: Gunakan antrean berbatas (*bounded ring buffer*) dengan kebijakan pelepasan frame terlama (*drop-oldest policy*) saat waktu tunda melebihi 50 ms.

2. **Degradasi Termal Perangkat Tepi (*Edge Thermal Throttling*)**:
   - *Penyebab*: Menjalankan model konvolusi visual dan audio secara simultan pada platform mini (seperti NVIDIA Jetson atau Raspberry Pi) dalam selungkup tertutup dapat menaikkan suhu di atas $80^\circ\text{C}$, memicu penurunan frekuensi clock otomatis (*throttling*) dan anjloknya FPS hingga separuhnya.
   - *Solusi Teknik*: Terapkan kuantisasi INT8 dengan TensorRT, batasi frame rate inferensi pada 15–20 FPS jika tidak terdeteksi gerakan, dan aktifkan profil daya efisien (*power mode management*).

3. **Hilangnya Sinkronisasi Akibat Jaringan (*Network Jitter in Distributed Streaming*)**:
   - *Penyebab*: Kamera IP mengirim stream RTSP melalui Wi-Fi yang mengalami interferensi frekuensi, menyebabkan jeda kedatangan paket video tidak menentu.
   - *Solusi Teknik*: Gunakan protokol streaming latensi rendah berbasis WebRTC atau gRPC dengan penyematan stempel waktu presisi tinggi (*PTP timestamps*).

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `MultimodalApplicationStudio.tsx` menyediakan simulator studio pemantauan multimodal interaktif, pengalihan skenario operasional (Normal vs Dropout), dan meteran FPS serta distribusi probabilitas real-time di peramban.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi komputasi fusi multi-sensor, pengujian dropout kamera, dan profil latensi frame rate secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Pipeline Terpadu)**: Berkas `notebooks/chapter-55-lab.ipynb` memuat panduan implementasi aplikasi pemantauan cerdas end-to-end, simulasi aliran data asinkron, serta eksekusi pipeline modular.

### 5.2 Panduan Eksekusi Notebook (`chapter-55-lab.ipynb`)
1. Buka antarmuka Jupyter Notebook lokal atau unggah ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 mendeteksi pustaka komputasi numerik.
3. Sel 3 mengonstruksi pipeline deteksi multimodal 3 sensor dan memvalidasi kalkulasi analitik Skenario A, B, dan C Seksi 3.
4. Sel 4 mengevaluasi simulasi streaming asinkron dan stabilitas frame buffer.
5. Sel 5 menyediakan rancangan arsitektur penyebaran produksi (*production deployment pattern*) menggunakan ONNX Runtime dan container Docker.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Aliran tensor visual $\mathbf{I} \in \mathbb{R}^{B \times C \times H \times W}$, spektrogram audio $\mathbf{A} \in \mathbb{R}^{B \times F \times T}$, dan telemetri termal $\mathbf{T}$, beserta vektor reliabilitas sensor $\mathbf{\gamma}$.
- **Transformasi**:
  1. Ekstraksi fitur paralel melalui backbone teroptimasi INT8.
  2. Penataan buffer dan interpolasi waktu.
  3. Fusi keputusan adaptif sadar-keandalan.
  4. Penyaringan ambang batas alarm dan pemicuan notifikasi.
- **Output & Evaluasi**: Status kelas deteksi, skor keyakinan terverifikasi, latensi total per frame ($T_{\text{total}}$), dan metrik throughput FPS.

---

## 6. Diagram Arsitektur Sistem

![Arsitektur Sistem Multimodal Terintegrasi Berstandar Industri](/media/diagrams/chapter-55-integrated-multimodal-system-architecture.svg)

![Strategi Optimasi Inferensi Edge, Kuantisasi & Penanganan Sensor Dropout](/media/diagrams/chapter-55-multimodal-deployment-optimization.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Pengembangan aplikasi multimodal yang sukses merupakan perpaduan antara kecerdasan persepsi visual dan keandalan rekayasa sistem. Menempatkan visi komputer sebagai pilar pengamatan utama sembari memanfaatkan modalitas audio dan sensorik sebagai validator fail-safe menghasilkan sistem pemantauan yang tangguh terhadap gangguan lingkungan nyata. Dengan penguasaan atas optimasi latensi per-frame, kuantisasi model perangkat tepi, dan strategi penanganan kegagalan sensor, para lulusan dan peneliti siap menerapkan teknologi ini pada kendaraan otonom, sistem robotika cerdas, dan infrastruktur pemantauan keselamatan industri masa depan.
