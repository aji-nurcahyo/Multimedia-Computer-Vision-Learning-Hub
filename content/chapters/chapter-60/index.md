# Bab 60 — Integrated Multimedia & Computer Vision Capstone

**Seksi Kurikulum:** Seksi 12 — Multimedia Systems & Capstone  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum Capstone

Selamat datang di puncak kurikulum **Multimedia & Computer Vision Learning Hub: From Digital Media to Intelligent Visual & Audio Systems**. Bab 60 merupakan proyek integrasi komprehensif (*Capstone Project*) yang menyatukan seluruh kompetensi akademik dan keterampilan rekayasa yang telah dipelajari dari Bab 01 hingga 59.

Sebagai mahasiswa Program Studi Teknik Telekomunikasi di Institut Teknologi Sumatera (ITERA) maupun pembelajar mandiri yang bersiap menuju riset pascasarjana dan peta jalan **Intelligent Sensing & Vision-Centric Wireless Systems (ISVWS 2026–2040)**, proyek akhir ini menuntut pembuktian kompetensi holistik:
- **Penguasaan Media Digital (Bab 01–20)**: Penanganan data piksel mentah, spektrogram audio, dan aliran video berstempel waktu.
- **Visi Komputer Klasik & Deep Learning (Bab 21–50)**: Ekstraksi fitur, konvolusi, segmentasi, deteksi objek (YOLO/MobileNet), dan estimasi pose.
- **Kecerdasan Multimodal (Bab 51–55)**: Penyelarasan temporal dan fusi keputusan sadar-keandalan antar-modalitas sensorik.
- **Rekayasa Sistem Multimedia (Bab 56–59)**: Manajemen buffer antrean asinkron, kuantisasi INT8 untuk perangkat keras tepi, isolasi thread Web Workers, serta dekomposisi anggaran latensi 60 FPS.

```
+---------------------------------------------------------------------------------------------------+
|               ARSITEKTUR PROYEK AKHIR CAPSTONE: SISTEM PEMANTAUAN VISUAL CERDAS                  |
+---------------------------------------------------------------------------------------------------+
 [ Ingestion Multi-Sensor ] ---> [ Inferensi Vision & Audio ] ---> [ Mesin Fusi Bayesian ] ---> [ Dashboard Web ]
   Kamera HD + Mic PCM            MobileNet INT8 + STFT CNN          F = 0.6·V + 0.25·A + 0.15·C     BBox, FPS, Alert Log
```

---

## 2. Proyek Referensi Resmi: "Sistem Pemantauan Visual Cerdas dengan Fusi Sensorik Multimodal Opsional"

Proyek referensi standar yang digunakan dalam penilaian capstone ini adalah:
**"Intelligent Visual Monitoring System with Optional Multimodal Sensing"**

### 2.1 Latar Belakang Masalah Industri & Kampus
Pemantauan keamanan fasilitas kritis (seperti gardu transmisi daya ITERA, gedung laboratorium terpadu, atau area observatorium astronomi) menghadapi tantangan false alarm tinggi jika hanya mengandalkan deteksi gerakan visual sederhana (misalnya akibat bayangan pohon, perubahan pencahayaan awan, atau serangga pada lensa kamera). Dengan mengintegrasikan modalitas visual sebagai pilar utama ($60\%$ bobot) yang didukung oleh deteksi anomali audio ($25\%$) dan konteks spasio-temporal ($15\%$), tingkat keandalan sistem meningkat drastis dengan penurunan false alarm lebih dari $65\%$.

### 2.2 Tiga Tingkat Kedalaman Proyek (Level A / B / C)

Mahasiswa dapat memilih tingkat kedalaman capstone sesuai dengan target kelulusan dan persiapan riset:

| Tingkat | Kategori Capstone | Deskripsi & Persyaratan Sistem | Target Akademik |
| :--- | :--- | :--- | :--- |
| **Level A** | **Undergraduate Core (L2)** | Pipeline deteksi visual murni (*standalone visual pipeline*): akuisisi kamera real-time, deteksi objek/penyusup menggunakan MobileNet/YOLO ringan, rendering bounding box, pengukuran FPS dan latensi end-to-end, serta antarmuka web responsif. | Standar Kelulusan S1 ITERA (Grade: B / BC) |
| **Level B** | **Undergraduate Complete (L2+)** | Sistem terintegrasi dengan fusi multimodal: pipeline visual Level A ditambah modul deteksi anomali audio (Mel-Spectrogram), kuantisasi model INT8, penanganan sensor dropout (fail-safe), dan manajemen buffer antrean asinkron. | Sangat Memuaskan (Grade: A / AB) |
| **Level C** | **Research Ready (L3/L4)** | Sistem berstandar publikasi riset: seluruh fitur Level B ditambah evaluasi kuantitatif presisi-recall (mAP/F1-score), benchmarking latensi multi-perangkat (CPU vs NPU/Edge GPU), studi ablasi fusi multimodal, dan keselarasan penuh dengan arah riset ISVWS 2026–2040. | Siap Tesis / Publikasi Ilmiah (Grade: A+) |

---

## 3. Landasan Matematis & Algoritma Capstone

### 3.1 Formulasi Fusi Keputusan Konsensus Multimodal

Sistem mengevaluasi probabilitas keberadaan insiden/penyusupan $F \in [0, 1]$ pada setiap frame waktu menggunakan operator konsensus terkalibrasi:
$$F = w_v \cdot S_v + w_a \cdot S_a + w_c \cdot S_c$$
Di mana:
- $S_v \in [0, 1]$: Skor kepercayaan detektor visual (misal: probabilitas objek manusia/kendaraan mencurigakan).
- $S_a \in [0, 1]$: Skor kepercayaan detektor akustik (misal: deteksi benturan, kaca pecah, atau teriakan).
- $S_c \in [0, 1]$: Skor bobot konteks (misal: zona terlarang = 1.0, zona aman = 0.2; waktu malam hari = 1.0, siang hari = 0.3).
- Bobot default standar industri: $w_v = 0.60$ (Visual primer), $w_a = 0.25$ (Audio), $w_c = 0.15$ (Konteks).
- Batas ambang keputusan (*decision threshold*): Sebuah insiden diverifikasi jika $F \ge 0.50$.

### 3.2 Histeresis Temporal untuk Menghilangkan False Alarm

Untuk mencegah kedipan alarm (*alarm flickering*), sistem menerapkan histeresis temporal sepanjang $H$ frame:
$$
\text{Trigger}(t) = \begin{cases} 
\text{TRUE}, & \text{jika } \sum_{i=0}^{H-1} \mathbb{I}(F_{t-i} \ge \tau) = H \\
\text{FALSE}, & \text{lainnya}
\end{cases}
$$
Standar rekomendasi industri: $H = 3$ frame berturut-turut pada $\tau = 0.50$.

### 3.3 Dekomposisi Latensi & Metrik Kinerja

Total waktu per siklus frame dibatasi oleh target 30 FPS ($33.33$ ms) atau 60 FPS ($16.67$ ms):
$$T_{\text{total}} = T_{\text{capture}} + T_{\text{queue}} + T_{\text{infer, vision}} + T_{\text{infer, audio}} + T_{\text{fuse}} + T_{\text{render}} \le T_{\text{budget}}$$

---

## 4. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita simulasikan secara analitis dan deterministik skenario verifikasi kejadian pada Proyek Capstone:

### Skenario Verifikasi Kejadian: Insiden Mencurigakan pada Malam Hari
Parameter Masukan:
- **Visual Detector**: Objek manusia terdeteksi di dekat pagar dengan skor kepercayaan $S_v = 0.85$.
- **Acoustic Detector**: Terdeteksi suara gesekan/langkah kaki dengan skor $S_a = 0.60$.
- **Konteks Lingkungan**: Waktu pukul 02:00 dini hari di Zona Terbatas A $\implies S_c = 0.90$.
- Bobot: $w_v = 0.60, w_a = 0.25, w_c = 0.15$. Ambang batas verifikasi $\tau = 0.50$.

**Langkah 1: Perhitungan Skor Fusi Multimodal $F$**
$$F = (0.60 \times 0.85) + (0.25 \times 0.60) + (0.15 \times 0.90)$$
$$F = 0.510 + 0.150 + 0.135 = 0.795 \quad (79.50\%)$$

**Langkah 2: Evaluasi Ambang Batas**
$$F = 0.795 \ge 0.50 \implies \text{Status: VERIFIED INCIDENT!}$$

Modalitas penyumbang terbesar (*dominant modality*) diidentifikasi dari nilai kontribusi absolut:
- Kontribusi Visual: $0.60 \times 0.85 = 0.510$ (Dominan: $64.15\%$)
- Kontribusi Audio: $0.25 \times 0.60 = 0.150$ ($18.87\%$)
- Kontribusi Konteks: $0.15 \times 0.90 = 0.135$ ($16.98\%$)

**Langkah 3: Simulasi Kasus Sensor Dropout (Kamera Tertutup Kabut)**
Jika pada frame berikutnya kamera dibutakan oleh kabut tebal sehingga $S_v$ turun ke $0.10$, sedangkan suara dan konteks tetap:
$$F_{\text{fog}} = (0.60 \times 0.10) + (0.25 \times 0.60) + (0.15 \times 0.90) = 0.060 + 0.150 + 0.135 = 0.345$$
Karena $0.345 < 0.50$, alarm palsu berhasil diredam secara otomatis tanpa membebani operator keamanan!

---

## 5. Rubrik Penilaian Akademik Capstone (Skala 100 Poin)

Evaluasi Proyek Akhir Capstone dilakukan secara kuantitatif berdasarkan 4 pilar utama:

| No | Komponen Evaluasi | Bobot | Kriteria Penilaian Sangat Baik (A: 80–100) |
| :---: | :--- | :---: | :--- |
| **1** | **Arsitektur Sistem & Rekayasa Perangkat Lunak** | **25 Poin** | Diagram alir sistem modular jelas, struktur direktori rapi, pemisahan thread asinkron (Web Workers / Queue), penanganan fail-safe sensor dropout. |
| **2** | **Implementasi Komputasi & Efisiensi Algoritma** | **35 Poin** | Pipeline visi dan audio berfungsi real-time, kuantisasi model INT8/FP16, kepatuhan batas frame budget ($>30$ FPS), ketiadaan memory leaks. |
| **3** | **Evaluasi Eksperimental & Verifikasi Kinerja** | **25 Poin** | Pengujian dataset terstandarisasi, visualisasi kurva presisi-recall / F1-score, tabel dekomposisi latensi terprofil, analisis studi ablasi. |
| **4** | **Dokumentasi Ilmiah & Keterulangan (Reproducibility)** | **15 Poin** | Laporan teknis format IEEE lengkap, panduan instalasi `README.md` terinci, notebook Jupyter dual-engine yang dapat direproduksi 100%. |

### Skala Konversi Nilai Huruf ITERA:
- **A** : Nilai Total $\ge 80.0$ (Istimewa / Memenuhi standar publikasi)
- **AB**: $75.0 \le \text{Nilai} < 80.0$ (Sangat Baik)
- **B** : $65.0 \le \text{Nilai} < 75.0$ (Baik)
- **BC**: $60.0 \le \text{Nilai} < 65.0$ (Cukup Baik)
- **C** : $50.0 \le \text{Nilai} < 60.0$ (Cukup / Batas Kelulusan Minimum)
- **D / E**: Nilai $< 50.0$ (Tidak Lulus / Wajib Remediasi)

---

## 6. Panduan Tiga Tingkat (Three-Tier Walkthrough)

### Tingkat 1: Konsep & Filosofi Rekayasa
Membangun proyek capstone seperti membangun sebuah mobil balap Formula 1. Memiliki mesin tercepat (model AI tercanggih) tidak akan memenangkan perlombaan jika sistem kemudi macet (UI thread membeku), bahan bakar bocor (memory leak), atau dashboard speedometer tidak berfungsi (ketiadaan metrik latensi). Capstone ini menuntut integrasi yang seimbang antara kecerdasan algoritma dan kehandalan mekanis sistem.

### Tingkat 2: Bedah Implementasi Kode Python
Skrip referensi `examples/example-01.py` menyediakan implementasi sistem monitoring multimodal end-to-end lengkap:
1. Generator aliran sensor visual, audio, dan konteks spatio-temporal sintetis yang deterministik.
2. Mesin fusi Bayesian dengan histeresis 3 frame.
3. Profiler latensi per tahapan dan evaluasi otomatis kepatuhan rubrik akademik.

### Tingkat 3: Wawasan Praktis & Panduan Pertahanan Ujian
> [!IMPORTANT]
> **Checklist Keterulangan Pengujian (Reproducibility)**:
> Pastikan repositori proyek Anda menyertakan:
> 1. `requirements.txt` dengan pin versi dependensi eksak.
> 2. Skrip pengujian otomatis satu-klik (`test_pipeline.py`) yang mengembalikan *exit code 0*.
> 3. Sampel data pengujian lokal agar dosen penguji tidak perlu mengunduh dataset berukuran puluhan gigabyte saat sesi demonstrasi langsung.

> [!TIP]
> **Strategi Presentasi Sidang Capstone**:
> Mulai presentasi Anda dengan demonstrasi langsung (*live demo*) selama 2 menit pertama. Tunjukkan layar video dengan overlay bounding box real-time dan panel log insiden. Visual yang hidup akan segera meyakinkan dewan penguji atas kelayakan teknis sistem Anda.

---

## 7. Rangkuman Kurikulum & Jalan Menuju Riset Masa Depan

Selamat! Dengan menyelesaikan Bab 60 ini, Anda telah menuntaskan seluruh 60 bab dalam kurikulum master **Multimedia & Computer Vision Learning Hub**. Anda kini memiliki fondasi teoretis matematika yang kuat, keterampilan praktis pengkodean ilmiah Python, serta keahlian rekayasa sistem web modern.

Portofolio Capstone ini menjadi tiket emas Anda untuk:
1. **Penyusunan Tugas Akhir / Skripsi S1** Teknik Telekomunikasi di ITERA dengan mutu riset unggul.
2. **Karier Profesional Tingkat Tinggi**: Sebagai Computer Vision Engineer, Edge AI Specialist, atau Multimedia Software Architect di industri global.
3. **Studi Lanjut Pascasarjana (Magister / Doktoral)**: Berkontribusi aktif dalam riset masa depan *Intelligent Visual Perception & Sensing* dan peta jalan **ISVWS 2026–2040**.

