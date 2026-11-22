# Chapter 25 — Intelligent Audio Processing Applications

> **Multimedia & Computer Vision Learning Hub**  
> *From Digital Media to Intelligent Visual & Audio Systems*  
> **Institusi:** Institut Teknologi Sumatera (ITERA)  
> **Penulis & Pengembang:** Aji Pamungkas Tri Nurcahyo  
> **Lisensi Materi:** Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Pendahuluan & Latar Belakang

Bab ini membahas topik **Intelligent Audio Processing Applications** secara komprehensif sebagai bagian esensial dari kurikulum Multimedia & Computer Vision. Gelombang suara adalah getaran mekanis longitudinal yang merambat melalui medium elastis (seperti udara) yang menyebabkan fluktuasi tekanan akustik periodik. Ketika tekanan suara analog ditangkap oleh transduser mikrofon, fluktuasi mekanis tersebut diubah menjadi tegangan listrik analog kontinu, yang kemudian didiskritisasi ke dalam representasi digital.

Fokus utama materi ini meliputi:
- Pipeline Audio Cerdas End-to-End: Akuisisi Sinyal, Denoising Biquad, VAD, Ekstraksi Fitur Akustik, Deteksi Anomali, dan Penerapan Edge AI TinyML.
- Formulasi matematis representasi gelombang waktu dan domain spektral frekuensi.
- Implementasi algoritma pemrosesan audio murni menggunakan Python dan pustaka ilmiah NumPy.
- Eksplorasi langsung pada visualisator interaktif berbasis browser yang responsif.

---

## 2. Tujuan Pembelajaran (Learning Objectives)

Setelah menuntaskan bab ini, pembaca diharapkan memiliki kompetensi akademik berikut:
1. **Memahami Konsep Teoretis:** Menguasai prinsip fisika akustik dan matematika dasar dari Intelligent Audio Processing Applications.
2. **Menganalisis Sinyal Akustik:** Mampu membedakan karakteristik sinyal audio domain waktu dan frekuensi secara analitis.
3. **Mengimplementasikan Pemrosesan Digital:** Mampu merekayasa algoritma audio digital murni dengan Python dan NumPy tanpa ketergantungan *black-box*.
4. **Mengevaluasi Metrik Objektif:** Menguasai teknik evaluasi performa seperti Signal-to-Noise Ratio (SNR), Word Error Rate (WER), dan keakuratan spektral.

---

## 3. Landasan Teori & Formulasi Matematis

Representasi gelombang suara kontinu $x(t)$ yang merambat dalam ruang memenuhi persamaan gelombang Helmholtz akustik:

$$\nabla^2 p - \frac{1}{c^2} \frac{\partial^2 p}{\partial t^2} = 0$$

Di mana $p$ adalah tekanan akustik ($Pa$) dan $c \approx 343\text{ m/s}$ adalah kecepatan rambat suara di udara pada suhu $20^\circ\text{C}$.

### Persamaan Gelombang Sinusoidal Dasar

Sinyal harmonik murni dinyatakan dengan:

$$x(t) = A \sin(2\pi f_0 t + \phi)$$

- $A$: Amplitudo puncak sinyal.
- $f_0$: Frekuensi dasar nada (dalam satuan Hertz, $\text{Hz}$).
- $T = \frac{1}{f_0}$: Periode gelombang dalam detik.
- $\lambda = \frac{c}{f_0}$: Panjang gelombang akustik dalam meter.
- $\phi$: Sudut pergeseran fasa dalam radian.

### Hubungan Amplitudo dan Desibel (dBFS)

Sistem pendengaran manusia merespons tekanan suara secara logaritmik (Hukum Weber-Fechner). Dalam sistem digital audio, tingkat kenyaringan (*loudness*) dinormalisasi terhadap skala penuh (*Decibels relative to Full Scale* / dBFS):

$$L_{\text{dBFS}} = 20 \log_{10}\left(\frac{|x_{\text{peak}}|}{x_{\text{max}}}\right)$$

Setiap penurunan $6\text{ dBFS}$ mencerminkan pengurangan amplitudo sebesar separuh ($50\%$).

---

## 4. Diagram Arsitektur & Ilustrasi Konsep

Berikut adalah diagram teknis yang mengilustrasikan mekanisme kerja dan arsitektur pemrosesan:

![Arsitektur Sistem Pemrosesan Audio Cerdas Menyeluruh (End-to-End)](/media/diagrams/chapter-25-intelligent-audio-system.svg)
*Gambar 25.1: Arsitektur Sistem Pemrosesan Audio Cerdas Menyeluruh (End-to-End).*

Diagram di atas mendemonstrasikan hubungan antara parameter waktu kontinu terhadap proses diskritisasi spasial dan kuantisasi tingkat amplitudo biner.

![Pipeline Komputasi Audio Cerdas pada Perangkat Tepi (Edge AI)](/media/diagrams/chapter-25-edge-audio-pipeline.svg)
*Gambar 25.2: Pipeline Komputasi Audio Cerdas pada Perangkat Tepi (Edge AI).*
*Gambar 25.2: Pipeline Komputasi Audio Cerdas pada Perangkat Tepi (Edge AI).*

Diagram kedua memperlihatkan bagaimana struktur representasi data dan alur transmisi sinyal dikelola dalam memori perangkat pemroses.

---

## 5. Algoritma & Pseudocode

Berikut adalah pseudocode pemrosesan inti yang diterapkan dalam sistem pengolahan sinyal audio:

```text
ALGORITHM AudioProcessingEngine
INPUT: 
    audio_buffer  : Larik sampel sinyal kontinu/diskrit
    sample_rate   : Frekuensi sampling fs (Hz)
    n_fft         : Ukuran frame transformasi spektral
OUTPUT:
    processed_signal : Sinyal audio hasil transformasi/filter
    features         : Vektor parameter kuantitatif

BEGIN
    1. Normalisasi amplitudo sinyal ke rentang [-1.0, 1.0]
    2. Deteksi DC Offset dan eliminasi bias rata-rata sinyal
    3. Segmentasi sinyal menjadi frame-frame bertetangga dengan overlap 50%
    4. Terapkan fungsi jendela pembobotan Hann w[n] = 0.5 * (1 - cos(2*pi*n / (N-1)))
    5. Hitung Fast Fourier Transform (FFT) 1D pada setiap frame
    6. Ekstraksi magnitudo spektrum dan parameter akustik domain waktu/frekuensi
    7. Kembalikan sinyal terekonstruksi beserta matriks fitur
END
```

---

## 6. Contoh Soal Numerik & Penyelesaian

### Soal Latihan Terbimbing:
Sebuah sinyal audio digital monokromatik disampel dengan frekuensi $f_s = 44{,}100\text{ Hz}$ dan kuantisasi $16\text{-bit}$. Sinyal sinusoidal memiliki frekuensi $f = 440\text{ Hz}$ dengan amplitudo $A = 0.707$.

**Pertanyaan:**
1. Hitung periode gelombang dalam milidetik ($ms$).
2. Hitung panjang gelombang di udara (asumsikan kecepatan suara $c = 343\text{ m/s}$).
3. Hitung rasio Signal-to-Quantization-Noise Ratio (SQNR) teoretis maksimum sistem $16\text{-bit}$.
4. Tentukan level amplitudo sinyal dalam skala desibel Full Scale (dBFS).

### Pembahasan Langkah-demi-Langkah:
1. **Periode Gelombang ($T$):**
   $$T = \frac{1}{f} = \frac{1}{440} \approx 0.002273\text{ detik} = 2.27\text{ ms}$$

2. **Panjang Gelombang ($\lambda$):**
   $$\lambda = \frac{c}{f} = \frac{343\text{ m/s}}{440\text{ Hz}} \approx 0.7795\text{ meter} = 77.95\text{ cm}$$

3. **SQNR Teoretis 16-Bit:**
   $$\text{SQNR} = 6.02 \cdot N + 1.76 = 6.02 \cdot 16 + 1.76 = 96.32 + 1.76 = 98.08\text{ dB}$$

4. **Level dBFS Amplitudo:**
   $$L_{\text{dBFS}} = 20 \log_{10}(0.707) \approx 20 \cdot (-0.1506) \approx -3.01\text{ dBFS}$$

---

## 7. Implementasi Python & Penjelasan Kode

Implementasi kode Python mandiri disajikan pada berkas terpisah `examples/example-01.py`. Skrip tersebut menguji algoritma secara deterministik tanpa ketergantungan library eksternal yang rumit:

```python
import numpy as np

def generate_tone(freq=440.0, duration=0.5, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    return (0.8 * np.sin(2.0 * np.pi * freq * t)).astype(np.float32)

def compute_rms(signal):
    return float(np.sqrt(np.mean(signal ** 2)))

tone = generate_tone()
print(f"RMS Energy Sinyal: {compute_rms(tone):.4f}")
```

---

## 8. Panduan Laboratorium Interaktif

Laboratorium interaktif untuk bab ini dirancang khusus agar pembaca dapat memanipulasi parameter secara langsung di browser:
- Gunakan slider parameter untuk mengubah nilai variabel kontrol secara real-time.
- Perhatikan perubahan bentuk gelombang (*waveform*) pada canvas visualizer.
- Dengarkan perbedaan timbre dan kenyaringan melalui tombol **Play Audio**.
- Anda dapat mengunggah file `.wav` mandiri untuk menguji algoritma pada audio nyata.

---

## 9. Ide Proyek Mandiri & Eksplorasi Lanjutan

1. **Detektor Kebisingan Akustik Lingkungan (dB Meter):** Buat aplikasi web yang memanfaatkan mikrofon pengguna untuk menghitung tingkat tekanan suara lingkungan dalam satuan desibel Leq.
2. **Pembersih Derau Musik Klasik:** Rancang filter digital FIR/IIR untuk membersihkan desis pita kaset lama (*tape hiss*) pada rekaman audio bersejarah.
3. **Analisis Fonetik Wicara Daerah:** Rekam beberapa pelafalan vokal bahasa daerah di Indonesia dan petakan frekuensi formant F1 vs F2 ke dalam diagram akustik.

---

## 10. Jebakan Umum & Praktik Terbaik (Common Pitfalls)

> [!WARNING]
> Jangan pernah mengizinkan nilai sampel audio melampaui batas $[-1.0, 1.0]$. Amplitudo di atas $1.0$ akan mengalami **hard clipping**, yang memicu distorsi harmonik ganjil ekstrem dan suara letupan (*pop/click*) tajam.

> [!TIP]
> Selalu terapkan fungsi pembobotan (*windowing*) seperti Hann atau Hamming sebelum menghitung FFT pada sinyal berdurasi pendek untuk meminimalkan **spectral leakage**.

---

## 11. Glosarium Istilah Teknis

- **PCM (Pulse Code Modulation):** Metode pengkodean sinyal audio analog menjadi biner digital tanpa kompresi.
- **Sampling Rate ($f_s$):** Frekuensi pengambilan sampel sinyal analog per detik, dinyatakan dalam Hertz (Hz).
- **Bit Depth:** Jumlah bit biner yang dialokasikan untuk menyimpan amplitudo setiap sampel audio.
- **Nyquist Rate:** Batas frekuensi sampling minimum ($2 \times f_{\max}$) untuk menghindari distorsi aliasing.
- **dBFS:** Desibel skala penuh, di mana $0\text{ dBFS}$ adalah amplitudo maksimum sistem digital tanpa distorsi.
- **Formant:** Frekuensi resonansi akustik alami pada saluran suara (*vocal tract*) manusia.
- **MFCC:** Koefisien spektral berbasis persepsi pendengaran manusia pada skala Mel.

---

## 12. Rangkuman Intisari Bab

- Suara digital adalah representasi diskrit dari gelombang tekanan mekanis elastis.
- Hubungan antara frekuensi sampling, kuantisasi bit depth, dan resolusi spektral menentukan batas fidelitas audio yang dihasilkan.
- Analisis gabungan domain waktu dan domain frekuensi memberikan pemahaman yang komprehensif bagi sistem kecerdasan buatan visual dan audio.

---

## 13. Kuis Konseptual Mandiri

Uji pemahaman Anda melalui kuis interaktif 5 butir soal yang tersedia pada tab kuis di halaman platform pembelajaran ini.

---

## 14. Referensi Akademik

Daftar pustaka akademik lengkap tercantum pada berkas `references.json` bab ini.
