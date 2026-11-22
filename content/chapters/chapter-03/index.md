# Chapter 03 — Multimedia Data Representation & File Formats

> **Bagian Kurikulum**: Section 01 — Multimedia & Signal Foundations  
> **Estimasi Durasi**: 90 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Chapter 01 (Introduction to Multimedia & CV), Chapter 02 (Digital Signals, Sampling & Quantization)  
> **Learning Tracks**: Digital Image Processing, Audio & Speech Processing, Video Processing & Tracking  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Ketika sinyal fisik diubah menjadi bit-bit biner melalui proses sampling dan kuantisasi, data tersebut tidak dapat dibiarkan sebagai deretan bit tanpa struktur. Sistem operasi dan peramban membutuhkan protokol standar untuk membaca dimensi, saluran warna, laju sampel, dan metode kompresi yang digunakan. Inilah peran **Representasi Data Multimedia dan Format Berkas (*File Formats*)**.

Sering kali pengembang pemula menyamakan antara ekstensi berkas (seperti `.mp4`), algoritma kompresi (seperti `H.264`), dan wadah pembungkus (*container*). Kerancuan ini berakibat fatal pada kesalahan pemilihan format dalam pipeline komputasi visi dan multimedia.

Bab ini membedah arsitektur biner data multimedia, membedakan secara tegas antara **Container**, **Codec**, dan **Stream**, menganalisis karakteristik format gambar (PNG, JPEG, WebP, AVIF), format audio (WAV, MP3, FLAC), serta standar video modern. Selain itu, kita akan menurunkan rumus matematis estimasi ukuran berkas tanpa kompresi (*uncompressed data footprint*), memahami trade-off *Rate-Distortion*, dan menginspeksi metadata berkas menggunakan Python.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Memahami** representasi biner data multimedia (piksel, sampel, frame, susunan byte, dan endianness).
2. **Membedakan** secara analitis antara format wadah (*container format* seperti MP4, MKV) dengan format kompresi (*codec* seperti H.264, AV1, AAC).
3. **Menganalisis** prinsip kerja kompresi *Lossless* (RLE, Huffman, DEFLATE) vs kompresi *Lossy* (DCT, kuantisasi psikovisual, kompensasi gerak temporal).
4. **Mengevaluasi** karakteristik format citra (PNG, JPEG, WebP, AVIF) dan audio (WAV, MP3, FLAC) untuk berbagai kebutuhan aplikasi rekayasa.
5. **Menghitung** secara matematis ukuran data teoritis tak terkompresi dan rasio kompresi (*compression ratio*).
6. **Mengekstrak** dan menginspeksi metadata multimedia (EXIF, header sinyal) menggunakan pustaka Python.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan Anda telah memahami:
- Konsep dasar biner, bit, dan byte ($1 \text{ Byte} = 8 \text{ bit}$).
- Teorema sampling dan kedalaman bit kuantisasi [Chapter 02].

---

## 4. Fundamental Concepts

### 4.1 Elemen Dasar Representasi Data Multimedia

Setiap jenis media memiliki unit representasi atomik:

1. **Piksel (*Picture Element*)**: Elemen terkecil dari citra digital 2D. Pada citra grayscale 8-bit, satu piksel diwakili oleh 1 byte integer ($0..255$). Pada citra warna 24-bit TrueColor, satu piksel tersusun atas 3 byte (saluran Red, Green, dan Blue).
2. **Sampel (*Audio Sample*)**: Nilai amplitudo tekanan akustik pada satu titik waktu diskrit. Pada standar CD audio, setiap sampel memiliki kedalaman 16-bit (2 byte integer bertanda: $-32.768$ hingga $+32.767$).
3. **Frame (*Video Frame*)**: Satu citra utuh yang merepresentasikan kondisi visual pada satu interval waktu temporal $t$. Video adalah rangkaian frame berurutan pada kecepatan tertentu (*Frame Rate*, FPS).
4. **Metadata**: Informasi struktural pelengkap yang menjelaskan isi data (seperti dimensi $W \times H$, color space, tanggal pembuatan, data lokasi GPS kamera EXIF, atau tag artis ID3).

---

## 5. Container vs Codec vs Stream

Salah satu konsep paling krusial dalam rekayasa multimedia adalah membedakan antara **Wadah (*Container*)** dan **Codec (*Compressor-Decompressor*)**.

![Arsitektur Container, Codecs, dan Streams](/media/diagrams/chapter-03-format-containers-codecs.svg)
*Gambar 3.1 — Arsitektur pemisahan antara Wadah Pembungkus (Container) dan Aliran Data Terkompresi (Video/Audio Codec Streams).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 5.1 Definisi Komponen

1. **Stream (Aliran Data)**: Rangkaian data berurutan dari satu modalitas media tunggal (misalnya: hanya aliran video, atau hanya aliran audio suara narator).
2. **Codec (Coder-Decoder)**: Algoritma perangkat lunak/keras yang bertugas memadatkan data mentah menjadi bitstream terkompresi saat penyimpanan (*encoding*) dan mengembalikannya ke bentuk decoded saat penayangan (*decoding*).  
   *Contoh*: **H.264 (AVC)**, **H.265 (HEVC)**, **AV1**, **AAC**, **Opus**, **MP3**.
3. **Container (Wadah Pembungkus)**: Format file yang bertindak sebagai amplop untuk menggabungkan (*multiplexing*) berbagai aliran data berbeda (video stream + multi-track audio stream + subtitle teks + metadata waktu) ke dalam satu berkas terpadu yang sinkron (*A/V Sync*).  
   *Contoh*: **.mp4**, **.mkv**, **.webm**, **.avi**, **.mov**.

> **Analogi Sederhana**:  
> Sebuah koper travel adalah **Container** (`.mp4`). Di dalam koper, Anda menyimpan pakaian yang dilipat rapi menggunakan teknik vacuum roll (**Video Codec: H.264**) dan perlengkapan mandi dalam pouch khusus (**Audio Codec: AAC**). Mengganti koper tidak mengubah cara baju dilipat!

---

## 6. Format Berkas Citra, Audio, dan Video

### A. Format Citra Digital

1. **PNG (*Portable Network Graphics*)**:
   - **Jenis Kompresi**: *Lossless* (menggunakan algoritma 2D filter prediktif + DEFLATE / zlib).
   - **Fitur Kunci**: Mendukung saluran transparansi Alpha 8-bit (RGBA), teks dan grafik tepi tajam tanpa artifak blur.
   - **Kasus Penggunaan**: Diagram teknis, antarmuka grafis UI/UX, tangkapan layar, logo.
2. **JPEG (*Joint Photographic Experts Group*)**:
   - **Jenis Kompresi**: *Lossy* (menggunakan Discrete Cosine Transform / DCT + kuantisasi psikovisual + Huffman coding).
   - **Fitur Kunci**: Rasio kompresi sangat tinggi ($10:1$ hingga $20:1$) dengan mutu persepsi yang dapat disetel ($Q = 1..100$). Tidak mendukung transparansi.
   - **Kasus Penggunaan**: Fotografi alam, potret manusia, citra web real-world.
3. **WebP & AVIF**:
   - **Jenis Kompresi**: Mendukung *Lossless* maupun *Lossy* modern.
   - **Fitur Kunci**: WebP berbasis intra-frame VP8, menghasilkan ukuran 30% lebih hemat dibanding JPEG. AVIF berbasis intra-frame video codec AV1, menghemat hingga 50% ukuran berkas dibanding JPEG pada mutu visual setara.

### B. Format Audio Digital

1. **WAV (*Waveform Audio File Format*)**:
   - **Jenis Kompresi**: Tak terkompresi (*Uncompressed Linear PCM*).
   - **Karakteristik**: Kualitas audio murni 100% tanpa kompromi, ukuran berkas sangat besar ($\approx 10 \text{ MB}$ per menit).
   - **Kasus Penggunaan**: Perekaman studio, analisis sinyal akustik ilmiah, dataset pengenalan wicara AI.
2. **FLAC (*Free Lossless Audio Codec*)**:
   - **Jenis Kompresi**: *Lossless* (Linear Predictive Coding).
   - **Karakteristik**: Mengurangi ukuran WAV sekitar 40–50% tanpa kehilangan satu bit pun data audio.
3. **MP3 & AAC**:
   - **Jenis Kompresi**: *Lossy* berbasis model psikoakustik pendengaran manusia (*auditory masking*).
   - **Karakteristik**: Menghilangkan frekuensi suara yang tertutupi oleh nada dominan lain. Rasio kompresi $\approx 10:1$ (laju bit standar 128–320 kbps).

---

## 7. Prinsip Kompresi: Lossless vs Lossy

Kompresi data multimedia memanfaatkan eliminasi empat jenis redundansi:
1. **Spatial Redundancy**: Piksel bertetangga sering kali memiliki nilai warna yang serupa.
2. **Temporal Redundancy**: Frame video pada waktu $t$ dan $t+1$ sebagian besar identik, kecuali objek yang bergerak.
3. **Spectral Redundancy**: Korelasi kuat antara saluran warna (misalnya informasi warna hijau mendominasi luminansi).
4. **Psychovisual Redundancy**: Sistem penglihatan dan pendengaran manusia memiliki kelemahan biologis—mata manusia jauh lebih sensitif terhadap perubahan terang-gelap (*luminance*) dibanding perbedaan corak warna (*chrominance*).

![Kompresi Lossless vs Lossy](/media/diagrams/chapter-03-compression-tradeoffs.svg)
*Gambar 3.2 — Perbandingan paradigma kompresi Lossless vs Lossy dan kurva Rate-Distortion (Bitrate vs Kualitas PSNR/SSIM).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

---

## 8. Formulasi Matematis Estimasi Ukuran Data Tak Terkompresi

Mengetahui ukuran teoritis data tak terkompresi sangat penting untuk merancang kapasitas bandwidth jaringan, memori RAM, dan media penyimpanan sistem.

### 8.1 Citra Digital Tak Terkompresi
Ukuran data citra mentah dalam satuan Byte:

$$S_{\text{image}} = W \times H \times C \times \left(\frac{b}{8}\right) \text{ Bytes}$$

Di mana:
- $W$ = Lebar citra dalam piksel (*Width*)
- $H$ = Tinggi citra dalam piksel (*Height*)
- $C$ = Jumlah saluran warna (1 untuk Grayscale, 3 untuk RGB, 4 untuk RGBA)
- $b$ = Kedalaman bit per saluran (*bits per sample*, default 8 bit = 1 Byte)

### 8.2 Audio Digital PCM Tak Terkompresi
Ukuran berkas audio PCM mentah:

$$S_{\text{audio}} = f_s \times N_{\text{channels}} \times \left(\frac{b}{8}\right) \times t \text{ Bytes}$$

Di mana:
- $f_s$ = Frekuensi sampling (Hz)
- $N_{\text{channels}}$ = Jumlah kanal (1 untuk Mono, 2 untuk Stereo)
- $b$ = Resolusi bit (misal 16-bit)
- $t$ = Durasi audio dalam detik

### 8.3 Sekuens Video Tak Terkompresi
Ukuran data video mentah (format warna RGB 24-bit):

$$S_{\text{video}} = W \times H \times 3 \times \text{FPS} \times t \text{ Bytes}$$

Untuk format subsampling warna industri **YUV420** (12 bit = 1.5 Byte per piksel):
$$S_{\text{video, YUV420}} = W \times H \times 1.5 \times \text{FPS} \times t \text{ Bytes}$$

---

## 9. Worked Mathematical Examples

### Contoh 1: Perhitungan Bandwidth Streaming Video Mentah 1080p
Hitung ukuran data mentah tak terkompresi untuk video beresolusi Full HD ($1920 \times 1080$), 60 FPS, format RGB 24-bit, dengan durasi 1 menit ($t = 60 \text{ detik}$).

**Penyelesaian**:
Ukuran per frame:
$$S_{\text{frame}} = 1920 \times 1080 \times 3 \text{ Bytes} = 6.220.800 \text{ Bytes} \approx 6.22 \text{ MB}$$

Laju transfer data per detik (Bitrate tak terkompresi):
$$\text{Bitrate} = 6.220.800 \times 60 \text{ frame/detik} = 373.248.000 \text{ Bytes/detik} \approx 373.25 \text{ MB/s} = 2.98 \text{ Gbps}!$$

Total ukuran untuk 1 menit (60 detik):
$$S_{\text{total}} = 373.248.000 \times 60 = 22.394.880.000 \text{ Bytes} \approx \mathbf{22.39 \text{ GB}!}$$

**Kesimpulan Akademik**: Menyimpan 1 menit video Full HD mentah membutuhkan memori sebesar $\approx 22.4 \text{ GB}$. Tanpa codec kompresi video seperti H.264 yang memadatkan data hingga rasio $100:1$ (menjadi hanya $\approx 150 \text{ MB}$), streaming video modern seperti YouTube atau Zoom akan mustahil beroperasi melalui jaringan internet publik.

---

## 10. Python Implementation: Membaca Metadata & Menghitung Rasio Kompresi

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 03: Multimedia Data Representation & File Formats
Kalkulasi Ukuran Teoretis vs Kompresi Nyata dan Ekstraksi Metadata

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

def calculate_uncompressed_image_size(width: int, height: int, channels: int = 3, bit_depth: int = 8) -> float:
    """Menghitung ukuran data citra mentah dalam Kilobytes (KB)."""
    bytes_per_channel = bit_depth / 8.0
    total_bytes = width * height * channels * bytes_per_channel
    return total_bytes / 1024.0

def calculate_uncompressed_audio_size(sample_rate: int, channels: int, duration_sec: float, bit_depth: int = 16) -> float:
    """Menghitung ukuran berkas audio PCM mentah dalam Megabytes (MB)."""
    bytes_per_sample = bit_depth / 8.0
    total_bytes = sample_rate * channels * bytes_per_sample * duration_sec
    return total_bytes / (1024.0 * 1024.0)

def calculate_compression_ratio(uncompressed_bytes: float, compressed_bytes: float) -> float:
    """Menghitung rasio kompresi data."""
    if compressed_bytes <= 0:
        return 0.0
    return uncompressed_bytes / compressed_bytes

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 03 Verification")
    print("=" * 65)

    # 1. Kasus Citra 4K UHD (3840 x 2160)
    w_4k, h_4k = 3840, 2160
    raw_img_kb = calculate_uncompressed_image_size(w_4k, h_4k, channels=3, bit_depth=8)
    raw_img_mb = raw_img_kb / 1024.0
    print(f"Citra 4K UHD Mentah ({w_4k}x{h_4k} RGB): {raw_img_mb:.2f} MB")
    assert round(raw_img_mb, 1) == 23.7, "Citra 4K 24-bit harus berukuran ~23.7 MB"

    # Perbandingan jika dikompresi ke JPEG (misal 1.2 MB)
    jpeg_size_mb = 1.2
    cr_img = calculate_compression_ratio(raw_img_mb, jpeg_size_mb)
    print(f"Rasio Kompresi JPEG (1.2 MB): {cr_img:.1f}:1 (Penghematan {(1 - 1/cr_img)*100:.1f}%)")

    # 2. Kasus Audio CD Stereo (44.1 kHz, 16-bit, 2 Saluran, 180 detik = 3 menit)
    audio_mb = calculate_uncompressed_audio_size(44100, 2, duration_sec=180.0, bit_depth=16)
    print(f"\nAudio CD 3 Menit Mentah (44.1 kHz, 16-bit Stereo): {audio_mb:.2f} MB")
    assert round(audio_mb, 1) == 30.3, "Audio CD 3 menit harus berukuran ~30.3 MB"

    # Perbandingan jika dikompresi ke MP3 128 kbps (~2.8 MB)
    mp3_size_mb = 2.81
    cr_audio = calculate_compression_ratio(audio_mb, mp3_size_mb)
    print(f"Rasio Kompresi MP3 128kbps (2.81 MB): {cr_audio:.1f}:1 (Penghematan {(1 - 1/cr_audio)*100:.1f}%)")

    print("\nVerifikasi Berhasil: Seluruh formulasi matematis ukuran file tervalidasi!")

if __name__ == "__main__":
    main()
```

---

## 11. Summary

1. Data multimedia terbagi atas unit atomik: **Piksel** (citra 2D), **Sampel** (audio 1D), dan **Frame** (sekuens temporal video 4D).
2. **Container** (seperti MP4, MKV, WebM) adalah format wadah pembungkus yang menyatukan aliran data video, audio, teks subtitle, dan metadata sinkronisasi.
3. **Codec** (seperti H.264, AV1, AAC, MP3) adalah algoritma kompresi-dekompresi yang mengeliminasi redundansi data spasial, temporal, dan psikovisual.
4. Kompresi **Lossless** menjamin pemulihan data 100% eksak (PNG, FLAC), sedangkan kompresi **Lossy** membuang frekuensi yang tidak terlihat atau terdengar demi rasio pemadatan ekstrem (JPEG, MP3, H.264).
5. Ukuran data tak terkompresi dapat dihitung secara deterministik menggunakan rumus perkalian dimensi spasial, frekuensi sampling, laju frame, dan kedalaman bit.

---

## 12. References & Academic Citations

1. **Nelson, M., & Gailly, J. L.** (1996). *The Data Compression Book* (2nd ed.). M&T Books.
2. **Richardson, I. E.** (2002). *Video Codec Design: Developing Image and Video Compression Systems*. John Wiley & Sons.
3. **Li, Z. N., Drew, M. S., & Liu, J.** (2021). *Fundamentals of Multimedia* (3rd ed.). Springer. Chapter 7: Lossless Compression & Chapter 8: Lossy Compression.
4. **Pennebaker, W. B., & Mitchell, J. L.** (1992). *JPEG: Still Image Data Compression Standard*. Springer Science & Business Media.
