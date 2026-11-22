# Chapter 01 — Introduction to Multimedia & Computer Vision

> **Bagian Kurikulum**: Section 01 — Multimedia & Signal Foundations  
> **Estimasi Durasi**: 90 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Dasar Matematika (Aljabar Linier Dasar) dan Pemrograman Python Dasar  
> **Learning Tracks**: Digital Image Processing, Audio & Speech Processing, Video Processing & Tracking  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Di era komputasi modern, media digital telah berevolusi dari sekadar representasi teks sederhana menjadi ekosistem data multimodal yang dinamis. Informasi visual (citra dan video) serta akustik (audio dan wicara) mendominasi lebih dari 80% lalu lintas data global di internet saat ini. 

Namun, bagaimana komputer yang pada hakikatnya hanya memahami bilangan biner (bit 0 dan 1) mampu menangkap, merepresentasikan, mengolah, hingga memahami makna semantik dari dunia visual dan audio di sekitar kita?

Bab ini meletakkan fondasi konseptual dari platform **Multimedia & Computer Vision Learning Hub**. Kita akan membedah definisi serta taksonomi multimedia digital, menelusuri alur pipa pemrosesan (*multimedia processing pipeline*), membedakan secara tegas batas antara **Digital Image Processing** dan **Computer Vision**, membandingkan pendekatan klasik berbasis rekayasa fitur (*hand-crafted features*) dengan pendekatan berbasis kecerdasan artifisial (*deep learning*), serta memetakan 6 jalur belajar (*learning tracks*) yang akan Anda tempuh di platform ini.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Mendefinisikan** ruang lingkup multimedia digital serta karakteristik fisik sinyal citra, audio, dan video.
2. **Menguraikan** setiap tahapan dalam *end-to-end multimedia processing pipeline* (Akuisisi, Representasi, Pre-processing, Ekstraksi Fitur, Inferensi, dan Aksi).
3. **Menganalisis** perbedaan taksonomi antara *Digital Image Processing* (pixel-in $\rightarrow$ pixel-out) dan *Computer Vision* (pixel-in $\rightarrow$ semantic meaning).
4. **Membandingkan** keunggulan dan batasan antara algoritma pemrosesan klasik (*classical algorithmic methods*) dengan model kecerdasan artifisial modern (*deep neural networks*).
5. **Mengidentifikasi** persyaratan sistem pemrosesan *real-time* (latensi rendah) vs *offline batch processing*.
6. **Memanfaatkan** pustaka Python dasar (NumPy, OpenCV, Matplotlib) untuk menginspeksi dimensi data matriks citra, bentuk gelombang audio, dan metadata video.

---

## 3. Prerequisites

Bab ini merupakan pintu gerbang utama kurikulum. Pengetahuan prasyarat yang disarankan mencakup:
- Konsep dasar variabel, fungsi, dan larik (*array*) dalam pemrograman.
- Konsep dasar matriks dan sistem koordinat Kartesius 2 dimensi.

---

## 4. Fundamental Concepts

### 4.1 Definisi & Ruang Lingkup Multimedia

Secara etimologi, kata **Multimedia** berasal dari bahasa Latin: *multus* (banyak/beragam) dan *medium* (perantara/alat penyampai). Dalam ilmu komputer, multimedia didefinisikan sebagai integrasi terpadu dari berbagai bentuk media informasi yang dikontrol, diproses, disimpan, dan ditransmisikan secara digital.

Lima modalitas utama multimedia:
1. **Teks & Tipografi**: Data diskrit berkarakter terstruktur (ASCII, Unicode UTF-8).
2. **Citra Digital (*Digital Image*)**: Representasi visual statis 2D yang tersusun atas kisi-kisi piksel (*picture elements*).
3. **Audio Digital (*Digital Audio*)**: Representasi gelombang akustik 1D kontinu yang disampling terhadap waktu.
4. **Video Digital (*Digital Video*)**: Sekuens sekuensial temporal dari citra statis (*frames*) yang diputar dengan laju tertentu (*Frame Rate*, FPS) sehingga memunculkan ilusi kontinuitas gerak bagi retina manusia.
5. **Grafika Komputer & Data 3D**: Pemodelan geometris, *point clouds*, dan mesh spasial.

### 4.2 End-to-End Multimedia Processing Pipeline

Pemrosesan multimedia bukanlah proses tunggal, melainkan sebuah rantai pemrosesan bertingkat (*pipeline*).

![End-to-End Multimedia Processing Pipeline](/media/diagrams/chapter-01-multimedia-pipeline.svg)
*Gambar 1.1 — Diagram alur tahapan konversi sinyal fisik dunia nyata menjadi representasi diskrit, komputasi cerdas, dan aksi keluaran.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

Tahapan kunci pipeline meliputi:
1. **Acquisition (Akuisisi Fisik)**: Sensor fisik seperti sensor foto CMOS/CCD pada kamera mengubah foton cahaya menjadi sinyal listrik, sedangkan mikrofon transduser mengubah tekanan gelombang akustik udara menjadi tegangan analog.
2. **Digitization & Representation (Digitalisasi)**: Sinyal analog kontinu diubah menjadi besaran diskrit melalui proses **Sampling** (diskretisasi waktu/ruang) dan **Quantization** (diskretisasi amplitudo). Hasilnya adalah struktur data tensor/larik (*arrays*).
3. **Pre-processing & Enhancement (Pra-pemrosesan)**: Menghilangkan derau (*noise reduction*), koreksi pencahayaan (*contrast stretching*), perataan histogram, dan penyaringan spasial.
4. **Feature Extraction (Ekstraksi Fitur)**: Mengekstraksi karakteristik matematis esensial dari data mentah, seperti tepi Sobel, deskriptor tekstur, spektrum frekuensi Fourier, atau koefisien cepstral audio (MFCC).
5. **Inference & Intelligence (Inferensi Cerdas)**: Menggunakan pemodelan matematika atau jaringan saraf tiruan (Deep Learning) untuk mengenali pola, mengklasifikasi objek, mendeteksi kata wicara, atau melacak lintasan gerakan.
6. **Action / Delivery (Penyajian & Aksi)**: Menampilkan visualisasi pada antarmuka pengguna (UI), menggerakkan aktuator robotik, mengirimkan notifikasi telemetri, atau mengompresi data untuk transmisi jaringan (streaming).

---

## 5. Image Processing vs Computer Vision: Sebuah Taksonomi

Sering kali terjadi kerancuan antara istilah *Digital Image Processing*, *Computer Vision*, dan *Pattern Recognition*. Mari kita bedakan secara sistematis melalui Gambar 1.2:

![Image Processing vs Computer Vision](/media/diagrams/chapter-01-ip-vs-cv.svg)
*Gambar 1.2 — Taksonomi perbandingan masukan, proses, keluaran, dan tingkat abstraksi antara Pengolahan Citra dan Visi Komputer.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### Tabel Perbandingan Paradigma

| Parameter | Digital Image Processing (Pengolahan Citra) | Computer Vision (Visi Komputer) |
| :--- | :--- | :--- |
| **Tingkat Abstraksi** | Tingkat Rendah (*Low-Level*) hingga Menengah (*Mid-Level*) | Tingkat Tinggi (*High-Level Semantic Intelligence*) |
| **Masukan (Input)** | Citra Digital $f(x,y)$ mentah | Citra Digital $f(x,y)$ atau Sekuens Video $F(x,y,t)$ |
| **Keluaran (Output)** | Citra baru $g(x,y)$ yang diperbaiki / peta tepi | Informasi semantik (Label objek, koordinat 3D, relasi scene) |
| **Fokus Utama** | Peningkatan kualitas visual (*enhancement*), restorasi, kompresi | Pemahaman makna (*understanding*), inferensi, otomasi kognitif |
| **Contoh Kasus** | Menghilangkan derau Gaussian, menajamkan foto kabur | Mobil otonom mengenali pejalan kaki, deteksi tumor pada CT-Scan |

---

## 6. Classical Processing vs AI-Based Deep Learning

Dalam evolusi teknologi visi dan audio, terdapat dua paradigma utama:

### A. Pendekatan Klasik (Classical Processing)
- Mengandalkan **fitur buatan pakar (*hand-crafted features*)** yang didasarkan pada perumusan analitis matematis, seperti filter Gabor, operator Canny, detektor sudut Harris, atau deskriptor SIFT/HOG.
- **Kelebihan**: Sangat efisien secara komputasi, tidak memerlukan jutaan data latih (*training datasets*), dan modelnya dapat dijelaskan secara analitis (*fully explainable*).
- **Keterbatasan**: Sangat rapuh (*brittle*) terhadap variasi pencahayaan ekstrem, rotasi tak terduga, oklusi, dan perubahan sudut pandang kamera yang liar.

### B. Pendekatan Berbasis AI & Deep Learning
- Menggunakan jaringan saraf bertingkat (*Convolutional Neural Networks*, *Vision Transformers*, *Recurrent/Conformer Networks*) yang **mempelajari representasi fitur secara otomatis (*end-to-end representation learning*)** langsung dari data masukan mentah.
- **Kelebihan**: Akurasi persepsi luar biasa tinggi dan sangat tangguh (*robust*) terhadap gangguan dunia nyata.
- **Keterbatasan**: Memerlukan komputasi matriks yang intensif (GPU/NPU), memerlukan data latih beranotasi masif, dan bersifat *black-box* yang sulit dibuktikan analitisnya secara deterministik.

> **Pendekatan Kurikulum Kami**:  
> Platform ini mengajarkan **keduanya secara berimbang**. Tanpa memahami prinsip konvolusi dan penyaringan sinyal klasik, Anda tidak akan pernah memahami bagaimana layer konvolusi pada CNN bekerja secara internal!

---

## 7. Pemrosesan Real-Time vs Offline Batch

Perbedaan batasan performa sistem membedakan arsitektur implementasi:

1. **Real-Time Processing**:
   - Sistem wajib memproses dan merespons data dalam batas waktu yang ditentukan (*deadline latency*), biasanya setara atau lebih cepat dari laju kedatangan frame (misalnya $\le 33.3 \text{ ms}$ per frame untuk video 30 FPS).
   - Mengharuskan optimasi algoritma yang efisien, komputasi bervektor, pemanfaatan akselerasi perangkat keras (SIMD, WebGL/WebGPU, ONNX Runtime), dan pemilihan resolusi yang rasional.
2. **Offline / Batch Processing**:
   - Sistem memprioritaskan akurasi maksimum dan fidelity tinggi tanpa batas latensi kaku.
   - Contoh: Rendering film animasi 3D, restorasi arsip video sejarah, atau rekonstruksi tomografi seismik/medis resolusi tinggi.

---

## 8. Panduan 6 Learning Tracks

Kurikulum master 60 bab dirancang agar dapat dinavigasi melalui 6 lintasan spesialisasi tanpa redundansi materi:

1. **Track 1 — Digital Image Processing**: Menguasai representasi citra, transformasi intensitas, histogram, filtering spasial, domain frekuensi Fourier, morfologi, dan segmentasi (Bab 01–15).
2. **Track 2 — Audio & Speech Processing**: Mempelajari sampling audio, analisis spektral, spektrogram STFT, ekstraksi fitur MFCC, speech recognition, hingga sintesis vokal cerdas (Bab 16–25).
3. **Track 3 — Video Processing & Tracking**: Mengkaji video temporal filtering, estimasi gerak optical flow, deteksi gerak background subtraction, dan algoritma tracking multi-objek (Bab 26–35).
4. **Track 4 — Computer Vision**: Menjelajahi geometri kamera, kalibrasi perspektif, stereo depth, deskriptor fitur, CNN, YOLO, hingga Vision Transformers (Bab 36–50).
5. **Track 5 — Multimodal AI**: Menggabungkan modalitas teks, audio, dan visual secara harmonis melalui model Vision-Language (CLIP), cross-modal embeddings, dan fusi multimodal (Bab 51–55).
6. **Track 6 — Real-Time & Edge Vision**: Menerapkan optimasi inferensi model pada perangkat embedded, komputasi edge AI, arsitektur Web API, dan proyek capstone terintegrasi (Bab 56–60).

---

## 9. Python Implementation: Memeriksa Karakteristik Multimedia

Mari kita jalankan kode Python untuk memeriksa sifat fisik dan dimensi dari tiga media digital (citra, audio, dan video).

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 01: Introduction to Multimedia & Computer Vision
Demonstrasi Pemeriksaan Sifat Fisik Sinyal Multimedia (Image, Audio, Video)

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def inspect_image_properties():
    print("--- 1. Inspeksi Data Citra Digital ---")
    # Membuat citra sintetis RGB berukuran 128x128 piksel
    H, W = 128, 128
    synthetic_image = np.zeros((H, W, 3), dtype=np.uint8)
    synthetic_image[:, :64, 0] = 255  # Kolom kiri berwarna Merah murni
    synthetic_image[:, 64:, 1] = 255  # Kolom kanan berwarna Hijau murni

    print(f"Dimensi Array (Shape): {synthetic_image.shape} -> (Tinggi={H}, Lebar={W}, Saluran={3})")
    print(f"Tipe Data (dtype): {synthetic_image.dtype} (Nilai integer [0 - 255])")
    print(f"Rentang Nilai Intensitas: Min={synthetic_image.min()}, Max={synthetic_image.max()}")
    print(f"Total Memori Tak Terkompresi: {synthetic_image.nbytes} Bytes (~{synthetic_image.nbytes/1024:.2f} KB)")

def inspect_audio_properties():
    print("\n--- 2. Inspeksi Data Gelombang Audio ---")
    sample_rate = 44100  # 44.1 kHz (Standar CD Audio)
    duration_sec = 2.0   # 2 detik durasi
    total_samples = int(sample_rate * duration_sec)
    
    # Menghasilkan sinyal nada sinusoidal 440 Hz (Nada A4 standar konser)
    t = np.linspace(0, duration_sec, total_samples, endpoint=False)
    audio_signal = np.sin(2 * np.pi * 440.0 * t).astype(np.float32)

    print(f"Dimensi Array Audio (Shape): {audio_signal.shape} (1D Series)")
    print(f"Frekuensi Sampling (Sample Rate): {sample_rate} Hz (sampel per detik)")
    print(f"Durasi Sinyal: {duration_sec} detik ({total_samples} sampel total)")
    print(f"Rentang Amplitudo: Min={audio_signal.min():.2f}, Max={audio_signal.max():.2f}")
    print(f"Ukuran Memori Mentah PCM: {audio_signal.nbytes} Bytes (~{audio_signal.nbytes/1024:.2f} KB)")

def inspect_video_properties():
    print("\n--- 3. Inspeksi Data Sekuens Video Temporal ---")
    fps = 30           # 30 frame per detik
    duration_sec = 1.0 # 1 detik durasi
    T = int(fps * duration_sec)
    H, W = 64, 64      # Resolusi contoh mini
    video_tensor = np.zeros((T, H, W, 3), dtype=np.uint8)

    print(f"Dimensi Tensor Video 4D: {video_tensor.shape} -> (Time={T}, Height={H}, Width={W}, Channels=3)")
    print(f"Kecepatan Putar (Frame Rate): {fps} FPS (Rentang waktu antar frame: {1000/fps:.1f} ms)")
    print(f"Total Piksel yang diproses per detik: {T * H * W * 3} elemen nilai warna")

if __name__ == "__main__":
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 01 Verification")
    print("=" * 65)
    inspect_image_properties()
    inspect_audio_properties()
    inspect_video_properties()
    print("\nVerifikasi Selesai: Seluruh struktur data multimedia berhasil diinspeksi!")
```

---

## 10. Summary

1. **Multimedia** mengintegrasikan teks, citra digital, sinyal audio, video, dan data 3D ke dalam representasi digital yang dapat diolah secara terpadu oleh komputer.
2. Alur pemrosesan multimedia bergerak dari **akuisisi fisik**, **digitalisasi sinyal**, **pra-pemrosesan filtering**, **ekstraksi fitur esensial**, hingga **inferensi cerdas semantik**.
3. **Pengolahan Citra** beroperasi pada tingkat rendah hingga menengah dengan orientasi perbaikan visual dan restorasi (*pixel-in, pixel-out*). Sebaliknya, **Visi Komputer** mengekstraksi pemahaman semantik makna dunia nyata dari citra (*pixel-in, semantic decision*).
4. Rekayasa fitur klasik menawarkan model matematis yang terbukti analitis dan hemat komputasi, sementara Deep Learning menawarkan ketahanan (*robustness*) luar biasa dengan kebutuhan data dan komputasi yang tinggi.
5. Pemrosesan *real-time* menuntut batasan latensi ketat ($\le 33 \text{ ms}$ untuk video 30 FPS) yang membutuhkan efisiensi algoritma dan pemilihan struktur data yang cermat.

---

## 11. References & Academic Citations

1. **Li, Z. N., Drew, M. S., & Liu, J.** (2021). *Fundamentals of Multimedia* (3rd ed.). Springer Texts in Computer Science. Chapter 1: Introduction to Multimedia.
2. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Chapter 1: Introduction.
3. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson. Chapter 1: Introduction & Chapter 2: Digital Image Fundamentals.
4. **Steinmetz, R., & Nahrstedt, K.** (2002). *Multimedia Fundamentals, Volume 1: Media Coding and Content Processing*. Prentice Hall.
