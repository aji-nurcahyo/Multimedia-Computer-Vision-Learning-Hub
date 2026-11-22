# Chapter 31 — Background Subtraction & Motion Detection

> **Multimedia & Computer Vision Learning Hub**  
> *From Digital Media to Intelligent Visual & Audio Systems*  
> **Institusi:** Institut Teknologi Sumatera (ITERA)  
> **Penulis & Pengembang:** Aji Pamungkas Tri Nurcahyo  
> **Lisensi Materi:** Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Pendahuluan & Latar Belakang

Bab ini membahas topik **Background Subtraction & Motion Detection** secara menyeluruh sebagai bagian sentral dari kurikulum Multimedia & Computer Vision. Video digital secara fundamental adalah sekuens citra diam 2D diskrit yang disajikan secara berurutan dalam dimensi waktu kontinu $t$. Persepsi mata manusia memanfaatkan fenomena biologis *persistence of vision* (kegigihan penglihatan) dan efek phi, di mana pergantian gambar statis dengan kecepatan di atas ambang tertentu ($ge 16\text{ FPS}$) dipersepsikan sebagai ilusi gerak yang mulus.

Fokus pembelajaran pada modul ini mencakup:
- Pemodelan Latar Belakang (Running Average & Gaussian Background Models), Pembangkitan Masker Foreground, Pembersihan Morfologi, Penekanan Bayangan, dan Ekstraksi Bounding Box.
- Formulasi matematis dinamika sekuens spasial-temporal dan pemodelan kinematika gerak.
- Implementasi algoritma pemrosesan video mandiri menggunakan Python, NumPy, dan pustaka OpenCV.
- Pengujian langsung pada laboratorium interaktif berbasis web dengan performa komputasi waktu nyata.

---

## 2. Tujuan Pembelajaran (Learning Objectives)

Setelah mempelajari bab ini secara tuntas, pembaca diharapkan mencapai kompetensi akademik berikut:
1. **Memahami Konsep Teoretis:** Menguasai prinsip ilmiah dan matematika dasar dari Background Subtraction & Motion Detection.
2. **Menganalisis Sekuens Temporal:** Mampu membedakan karakteristik perubahan gerak objek, kestabilan latar belakang, dan dinamika antar-frame.
3. **Mengimplementasikan Algoritma Video:** Mampu merekayasa fungsi pemrosesan video dengan Python/NumPy tanpa ketergantungan library *black-box*.
4. **Mengevaluasi Metrik Kinerja:** Menguasai teknik evaluasi performa kuantitatif seperti laju frame (FPS), latensi pemrosesan, PSNR, SSIM, serta metrik pelacakan.

---

## 3. Landasan Teori & Formulasi Matematis

Sinyal video digital dinyatakan sebagai fungsi intensitas tiga dimensi $V(x, y, t)$, di mana $x$ dan $y$ adalah koordinat spasial pada bidang citra, dan $t$ adalah indeks waktu temporal diskrit $t \in \{0, 1, 2, \dots, N-1\}$.

### Persamaan Selisih Temporal Frame

Operasi dasar pendeteksian perubahan intensitas antar-dua frame berurutan dirumuskan sebagai:

$$D(x, y, t) = |V(x, y, t) - V(x, y, t-1)|$$

Sebuah piksel $(x, y)$ diklasifikasikan sebagai region gerak aktif apabila selisih nilai absolutnya melampaui nilai ambang batas sensitivitas $T$:

$$M(x, y, t) = \begin{cases} 1, & \text{jika } D(x, y, t) \ge T \\ 0, & \text{jika } D(x, y, t) < T \end{cases}$$

### Model Kinematika Gerak Status Orde-1

Dalam pemodelan lintasan gerak objek (seperti pada Filter Kalman), vektor status $\mathbf{x}_k$ merepresentasikan posisi dan kecepatan spasial:

$$\mathbf{x}_k = \begin{bmatrix} x \\ y \\ v_x \\ v_y \end{bmatrix}_k, \quad \mathbf{x}_k = \mathbf{F} \mathbf{x}_{k-1} + \mathbf{w}_{k-1}$$

Di mana matriks transisi status $\mathbf{F}$ dengan interval waktu sampling $\Delta t$ didefinisikan sebagai:

$$\mathbf{F} = \begin{bmatrix} 1 & 0 & \Delta t & 0 \\ 0 & 1 & 0 & \Delta t \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

---

## 4. Diagram Arsitektur & Ilustrasi Konsep

Berikut adalah diagram teknis yang mengilustrasikan mekanisme kerja dan arsitektur pemrosesan:

![Arsitektur Pipeline Pengurangan Latar Belakang (Background Subtraction)](/media/diagrams/chapter-31-background-subtraction-pipeline.svg)
*Gambar 31.1: Arsitektur Pipeline Pengurangan Latar Belakang (Background Subtraction).*

Diagram di atas mendemonstrasikan hubungan antara parameter waktu sekuens terhadap tahapan diskritisasi spasial dan transmisi data video.

![Karakteristik & Penekanan Bayangan (Shadow Suppression)](/media/diagrams/chapter-31-shadow-suppression-techniques.svg)
*Gambar 31.2: Karakteristik & Penekanan Bayangan (Shadow Suppression).*
*Gambar 31.2: Karakteristik & Penekanan Bayangan (Shadow Suppression).*

Diagram kedua memperlihatkan bagaimana struktur representasi data dan alur manipulasi sekuensial dikelola secara efisien di dalam memori komputer.

---

## 5. Algoritma & Pseudocode

Berikut adalah pseudocode pemrosesan video yang diterapkan dalam sistem analitik cerdas:

```text
ALGORITHM VideoProcessingEngine
INPUT: 
    video_stream : Aliran frame kontinu V(x, y, t)
    fps_target   : Kecepatan pemrosesan frame target (misal: 30 FPS)
    threshold_T  : Ambang batas sensitivitas deteksi
OUTPUT:
    processed_stream : Aliran frame hasil analisis dengan visualisasi grafis
    analytics_log    : Rekaman data peristiwa dan metrik performa

BEGIN
    1. Inisialisasi Ring Buffer dan Model Latar Belakang B_0 = V(x, y, 0)
    2. LOOP setiap frame V_t yang masuk:
        a. Konversi frame ke format Grayscale ternormalisasi
        b. Perbarui Model Latar Belakang: B_t = (1 - alpha) * B_{t-1} + alpha * V_t
        c. Hitung selisih mutlak: Diff = |V_t - B_t|
        d. Bentuk masker biner Foreground M_t = (Diff >= threshold_T)
        e. Terapkan operasi morfologi pembersihan (Opening 3x3)
        f. Ekstraksi koordinat Bounding Box dari komponen terhubung
        g. Perbarui jejak pelacakan objek (Track ID) menggunakan asosiasi jarak
        h. Evaluasi aturan garis virtual (Tripwire) untuk penghitungan kejadian
        i. Gambar anotasi visual pada kanvas tampilan keluaran
    3. END LOOP
    4. Kembalikan rekapitulasi data analitik
END
```

---

## 6. Contoh Soal Numerik & Penyelesaian

### Soal Latihan Terbimbing:
Sebuah aliran video digital format $1080\text{p}$ ($1920 \times 1080$ piksel) ditransmisikan pada kecepatan $30\text{ FPS}$ dengan subsampling kroma $\text{YCbCr 4:2:0}$ dan kedalaman bit $8\text{-bit}$ per sampel.

**Pertanyaan:**
1. Hitung ukuran rata-rata satu frame mentah tak terkompresi dalam megabyte ($MB$).
2. Hitung laju data bitrate video mentah tak terkompresi dalam megabit per detik ($Mbps$).
3. Jika video tersebut dikompresi menggunakan codec $\text{H.264}$ dengan rasio kompresi $80:1$, berapa bitrate hasil kompresi yang ditransmisikan?
4. Berapa batas waktu latensi maksimum per frame agar sistem tidak mengalami *frame drop* pada $30\text{ FPS}$?

### Pembahasan Langkah-demi-Langkah:
1. **Ukuran Frame Mentah (4:2:0 Subsampling):**
   Pada format 4:2:0, kanal Y berukuran $1920 \times 1080$, sedangkan Cb dan Cr masing-masing berukuran $(1920/2) \times (1080/2) = 960 \times 540$.
   Total sampel per piksel rata-rata $= 1 + 0.25 + 0.25 = 1.5\text{ byte/piksel}$.
   $$\text{Ukuran Frame} = 1920 \times 1080 \times 1.5\text{ byte} = 3{,}110{,}400\text{ byte} \approx 3.11\text{ MB}$$

2. **Bitrate Video Mentah:**
   $$\text{Bitrate} = 3{,}110{,}400\text{ byte/frame} \times 8\text{ bit/byte} \times 30\text{ frame/s} = 746{,}496{,}000\text{ bps} \approx 746.5\text{ Mbps}$$

3. **Bitrate Hasil Kompresi H.264 (80:1):**
   $$\text{Bitrate Terkompresi} = \frac{746.5\text{ Mbps}}{80} \approx 9.33\text{ Mbps}$$

4. **Batas Latensi Per Frame:**
   $$\Delta t_{\max} = \frac{1}{f_s} = \frac{1}{30\text{ s}^{-1}} \approx 0.0333\text{ detik} = 33.33\text{ ms}$$

---

## 7. Implementasi Python & Penjelasan Kode

Implementasi kode program Python mandiri disertakan pada berkas `examples/example-01.py`. Skrip tersebut menguji algoritma secara deterministik menggunakan pustaka ilmiah NumPy:

```python
import numpy as np

def compute_frame_diff(f1, f2):
    return np.abs(f2.astype(np.float32) - f1.astype(np.float32)).astype(np.uint8)

# Pengujian dengan sekuens sintetis
f1 = np.full((100, 100), 50, dtype=np.uint8)
f2 = np.full((100, 100), 50, dtype=np.uint8)
f2[40:60, 40:60] = 200 # Objek bergerak

diff = compute_frame_diff(f1, f2)
print(f"Piksel bergerak terdeteksi: {np.sum(diff > 30)}")
```

---

## 8. Panduan Laboratorium Interaktif

Laboratorium interaktif untuk bab ini dirancang khusus agar mahasiswa dapat bereksperimen langsung di browser:
- Gunakan kontrol slider untuk memanipulasi parameter seperti sensitivitas deteksi, laju adaptasi, atau threshold.
- Amati perubahan visualisasi secara real-time pada kanvas video.
- Anda dapat mengaktifkan **Webcam** atau mengunggah berkas video lokal untuk menguji performa pada video riil.
- Gunakan tombol ekspor untuk menyimpan snapshot frame citra atau mengunduh rekaman log analitik format CSV.

---

## 9. Ide Proyek Mandiri & Eksplorasi Lanjutan

1. **Sistem Penghitung Pengunjung Otomatis (Smart People Counter):** Bangun aplikasi web pendeteksi garis virtual untuk memantau kapasitas ruangan laboratorium secara real-time.
2. **Estimator Kecepatan Kendaraan:** Rancang algoritma kalibrasi kamera untuk mengestimasi kecepatan kendaraan ($km/jam$) dari jarak piksel lintasan tempuh.
3. **Pendeteksi Parkir Liar (Illegal Parking Detector):** Buat sistem pendeteksi kendaraan yang berhenti melebihi batas waktu toleransi (*dwell time*) pada zona terlarang.

---

## 10. Jebakan Umum & Praktik Terbaik (Common Pitfalls)

> [!WARNING]
> Jangan pernah menyimpan seluruh frame video mentah ke dalam sebuah larik JavaScript di memori peramban. Hal ini akan memicu *out-of-memory error* dan membuat peramban mengalami *crash*. Selalu gunakan struktur *sliding window* atau antrean *ring buffer* dengan kapasitas terbatas.

> [!TIP]
> Selalu lepaskan izin perangkat kamera (*camera tracks cleanup*) saat komponen ditutup atau dilepas (*unmounted*) guna menghemat daya perangkat pengguna dan menjaga privasi.

---

## 11. Glosarium Istilah Teknis

- **FPS (Frames Per Second):** Satuan frekuensi temporal pengambilan atau penayangan frame video per detik.
- **Progressive Scanning:** Metode pemindaian video di mana setiap baris citra digambar secara berurutan dalam satu frame utuh.
- **Interlaced Video:** Metode pemindaian di mana baris ganjil dan genap digambar secara bergantian pada dua *field* terpisah.
- **Chroma Subsampling:** Teknik reduksi resolusi warna kroma relatif terhadap luminansi untuk menghemat lebar pita data.
- **Optical Flow:** Pola pergerakan semu dari objek, permukaan, atau tepi dalam sekuens visual akibat gerak relatif antara pengamat dan pemandangan.
- **Kalman Filter:** Algoritma estimasi optimal rekursif yang memprediksi status sistem linier dari serangkaian pengukuran bersuara derau.
- **Tripwire:** Garis virtual geometris pada bidang citra yang memicu peristiwa saat dilintasi oleh objek yang dilacak.

---

## 12. Rangkuman Intisari Bab

- Video digital menggabungkan dimensi spasial citra diam dengan dimensi temporal kontinuitas gerak.
- Pemodelan matematika yang tepat memungkinkan deteksi perubahan, estimasi vektor gerak, dan pelacakan identitas objek secara konsisten.
- Desain arsitektur perangkat lunak yang efisien sangat esensial untuk memastikan algoritma analitik dapat berjalan secara *real-time* pada perangkat komputasi tepi (*edge devices*).

---

## 13. Kuis Konseptual Mandiri

Uji pemahaman konseptual dan kuantitatif Anda melalui kuis interaktif 5 butir soal yang tersedia pada tab kuis di halaman bab ini.

---

## 14. Referensi Akademik

Daftar pustaka akademik lengkap tercantum pada berkas `references.json` bab ini.
