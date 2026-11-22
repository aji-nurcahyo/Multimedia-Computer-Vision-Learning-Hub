# Chapter 02 — Digital Signals, Sampling & Quantization

> **Bagian Kurikulum**: Section 01 — Multimedia & Signal Foundations  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Chapter 01 (Introduction to Multimedia & Computer Vision), Fungsi Trigonometri Dasar  
> **Learning Tracks**: Digital Image Processing, Audio & Speech Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Seluruh fenomena fisik di alam semesta—cahaya yang menyinari mata kita, suara alat musik yang bergetar di udara, atau pergerakan objek di depan lensa kamera—bersifat **kontinu (*analog*)**, baik dalam dimensi domain (waktu atau ruang) maupun dalam nilai amplitudonya. Namun, perangkat komputasi digital bekerja secara eksklusif menggunakan representasi **diskrit biner**.

Untuk menjembatani jurang fundamental antara dunia fisik analog dan dunia komputasi digital, diperlukan proses konversi yang disebut **Analog-to-Digital Conversion (ADC)**. Proses ini ditopang oleh dua pilar matematis esensial: **Sampling** (diskretisasi sumbu waktu atau koordinat spasial) dan **Quantization** (diskretisasi sumbu amplitudo intensitas).

Bab ini mengkaji secara analitis **Teorema Sampling Nyquist-Shannon**, fenomena distorsi **Aliasing**, perumusan derau kuantisasi (*quantization error*), pembuktian aturan rasio *Signal-to-Quantization-Noise Ratio* ($\text{SQNR} \approx 6.02b + 1.76 \text{ dB}$), serta teknik rekonstruksi sinyal berbasis interpolasi fungsi *sinc*.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Membedakan** karakteristik analitis sinyal waktu kontinu $x(t)$ dengan sinyal waktu diskrit $x[n]$.
2. **Membuktikan** kondisi batas Teorema Sampling Nyquist-Shannon ($f_s \ge 2 f_{\max}$) dan menghitung frekuensi lipat (*folding / Nyquist frequency*).
3. **Menganalisis** terjadinya distorsi aliasing serta menghitung frekuensi semu (*aliased apparent frequency*) ketika syarat Nyquist dilanggar.
4. **Menghitung** ukuran langkah kuantisasi seragam ($\Delta$), variansi derau kuantisasi ($\sigma_e^2 = \Delta^2 / 12$), dan rasio SQNR berdasarkan kedalaman bit ($b$).
5. **Memahami** mekanisme rekonstruksi sinyal kontinu ideal menggunakan rumus interpolasi Whittaker-Shannon (*sinc interpolation*).
6. **Mengimplementasikan** simulasi sampling, demonstrasi aliasing, dan kuantisasi linier menggunakan NumPy dan Matplotlib.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan Anda telah memahami:
- Representasi fungsi sinusoidal kontinu: $x(t) = A \cos(2\pi f t + \phi)$.
- Konsep frekuensi ($f$ dalam Hertz) dan periode gelombang ($T = 1/f$).
- Indeks array diskrit dalam NumPy [Chapter 01].

---

## 4. Continuous-Time vs Discrete-Time Signals

Secara matematis, kita membedakan sinyal ke dalam dua kategori utama:

1. **Sinyal Kontinu $x(t)$**:
   Variabel bebas $t$ (waktu) terdefinisi pada bilangan riil kontinu ($t \in \mathbb{R}$). Amplitudo $x(t)$ juga kontinu. Contoh: Tegangan keluaran mikrofon analog.
2. **Sinyal Diskrit $x[n]$**:
   Variabel bebas $n$ hanya terdefinisi pada bilangan bulat diskrit ($n \in \mathbb{Z}$). Sinyal diskrit diperoleh dengan mencuplik nilai sinyal kontinu pada interval waktu periodik $T_s$:
   $$x[n] = x(n T_s) = x\left(\frac{n}{f_s}\right)$$
   Di mana:
   - $T_s$ adalah periode sampling (*sampling period*) dalam satuan detik.
   - $f_s = 1 / T_s$ adalah frekuensi sampling (*sampling rate*) dalam satuan Hertz (sampel per detik).

---

## 5. Teorema Sampling Nyquist-Shannon

Bagaimana kita memastikan bahwa proses pencuplikan diskrit tidak menghilangkan informasi gelombang asli?

> **Teorema Sampling Nyquist-Shannon**:  
> Sebuah sinyal pita-terbatas (*band-limited*) kontinu $x(t)$ yang tidak memiliki komponen frekuensi lebih tinggi dari $f_{\max}$ dapat direkonstruksi secara sempurna dan eksak dari deretan sampelnya $x[n]$, jika dan hanya jika frekuensi sampling $f_s$ memenuhi kondisi:
> $$f_s \ge 2 f_{\max}$$

- **Laju Nyquist (*Nyquist Rate*)**: Nilai minimum frekuensi sampling yang diizinkan, yaitu $2 f_{\max}$.
- **Frekuensi Nyquist (*Folding Frequency*)**: Batas frekuensi tertinggi yang dapat direpresentasikan tanpa distorsi pada laju cuplik $f_s$, yaitu $f_N = f_s / 2$.

![Teorema Sampling Nyquist dan Aliasing](/media/diagrams/chapter-02-sampling-nyquist.svg)
*Gambar 2.1 — Visualisasi pencuplikan sinyal kontinu $x(t)$ pada kondisi Nyquist ideal ($f_s \ge 2 f_{\max}$) dan terjadinya distorsi Aliasing saat undersampling ($f_s < 2 f_{\max}$).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 5.1 Fenomena Aliasing

Jika $f_s < 2 f_{\max}$ (*undersampling*), komponen frekuensi tinggi di atas $f_s/2$ akan "terlipat" (*fold back*) ke dalam spektrum frekuensi rendah. Fenomena ini menciptakan **frekuensi semu / palsu (*alias frequency*)**:

$$f_{\text{alias}} = |f - k \cdot f_s|$$

Di mana $k$ adalah bilangan bulat yang memetakan frekuensi ke dalam rentang dasar $[0, f_s/2]$.

**Contoh di Dunia Nyata**:
- **Audio**: Suara instrumen frekuensi tinggi terdengar menjadi dengung kasar bernada rendah yang tidak harmonis.
- **Citra & Video**: Pola bergaris rapat (seperti kemeja bergaris atau pagar kawat) menghasilkan pola gelombang distorsi berulang yang disebut **Pola Moiré** (*Moiré pattern*), atau roda mobil yang sedang melaju kencang terlihat berputar mundur pada rekaman video (*wagon-wheel effect*).

---

## 6. Quantization & Quantization Error

Setelah sinyal diskretisasi dalam domain waktu/ruang (Sampling), amplitudo setiap sampel masih bernilai riil kontinu. **Kuantisasi (*Quantization*)** adalah proses memetakan nilai amplitudo kontinu ke dalam sekumpulan terbatas level diskrit yang direpresentasikan oleh bilangan biner $b$ bit.

Jumlah level kuantisasi diskrit $L$ yang tersedia untuk resolusi $b$ bit adalah:
$$L = 2^b$$

![Kuantisasi Seragam dan Bit Depth](/media/diagrams/chapter-02-quantization-levels.svg)
*Gambar 2.2 — Karakteristik fungsi tangga kuantisasi seragam, ukuran langkah $\Delta$, dan perbandingan resolusi kedalaman bit (1-bit, 8-bit, 16-bit).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

### 6.1 Ukuran Langkah Kuantisasi ($\Delta$)

Untuk kuantisasi seragam (*uniform quantizer*) dengan rentang amplitudo dinamis dari $V_{\min}$ hingga $V_{\max}$, ukuran interval satu langkah kuantisasi (*quantization step size* $\Delta$) dirumuskan sebagai:

$$\Delta = \frac{V_{\max} - V_{\min}}{2^b}$$

### 6.2 Derau Kuantisasi (*Quantization Noise*)

Proses pembulatan ke level terdekat pasti memicu galat / error:
$$e[n] = Q(x[n]) - x[n]$$

Dengan pembulatan seragam simetris (*rounding*), error $e[n]$ terdistribusi secara seragam dalam rentang:
$$-\frac{\Delta}{2} \le e[n] \le +\frac{\Delta}{2}$$

Fungsi kerapatan probabilitas (*Probability Density Function*, PDF) dari error kuantisasi adalah:
$$p(e) = \begin{cases} \frac{1}{\Delta}, & -\frac{\Delta}{2} \le e \le +\frac{\Delta}{2} \\ 0, & \text{lainnya} \end{cases}$$

Rata-rata galat bernilai nol ($\mu_e = 0$), dan daya / variansi derau kuantisasi ($\sigma_e^2$) dihitung melalui integral:

$$\sigma_e^2 = \int_{-\Delta/2}^{+\Delta/2} e^2 \cdot \frac{1}{\Delta} \, de = \frac{1}{\Delta} \left[ \frac{e^3}{3} \right]_{-\Delta/2}^{+\Delta/2} = \frac{\Delta^2}{12}$$

### 6.3 Penurunan Rumus SQNR (Aturan 6 dB per Bit)

Rasio daya sinyal terhadap derau kuantisasi (*Signal-to-Quantization-Noise Ratio*, SQNR) didefinisikan sebagai:
$$\text{SQNR} = 10 \log_{10} \left( \frac{P_{\text{signal}}}{P_{\text{noise}}} \right) = 10 \log_{10} \left( \frac{\sigma_x^2}{\sigma_e^2} \right)$$

Untuk sinyal sinusoidal penuh dengan amplitudo puncak $A = (V_{\max} - V_{\min})/2$, daya sinyal rata-ratanya adalah:
$$P_{\text{signal}} = \frac{A^2}{2} = \frac{[(V_{\max} - V_{\min})/2]^2}{2} = \frac{(V_{\max} - V_{\min})^2}{8}$$

Substitusikan $\Delta = \frac{V_{\max} - V_{\min}}{2^b}$, sehingga $\sigma_e^2 = \frac{(V_{\max} - V_{\min})^2}{12 \cdot 2^{2b}}$:

$$\text{SQNR} = 10 \log_{10} \left( \frac{\frac{(V_{\max} - V_{\min})^2}{8}}{\frac{(V_{\max} - V_{\min})^2}{12 \cdot 2^{2b}}} \right) = 10 \log_{10} \left( \frac{12}{8} \cdot 2^{2b} \right) = 10 \log_{10}(1.5) + 10 \log_{10}(2^{2b})$$

$$\text{SQNR} = 1.7609 + 20 b \log_{10}(2) \approx 6.0206 \cdot b + 1.76 \text{ dB}$$

$$\mathbf{\text{SQNR} \approx 6.02 \, b + 1.76 \text{ dB}}$$

> **Hukum Praktis Rekayasa (The 6 dB Rule)**:  
> Setiap penambahan **1 bit** pada resolusi ADC akan meningkatkan rasio kualitas sinyal terhadap derau kuantisasi sebesar kurang lebih **$6 \text{ dB}$** (reduksi daya derau sebesar $4\times$).

---

## 7. Rekonstruksi Sinyal Ideal (Whittaker-Shannon)

Jika kondisi Nyquist terpenuhi, sinyal kontinu asli $x(t)$ dapat dipulihkan secara sempurna dari sampel diskrit $x[n]$ melalui interpolasi *sinc* (filter lolos-rendah ideal / *ideal brick-wall lowpass filter*):

$$x(t) = \sum_{n=-\infty}^{\infty} x[n] \cdot \text{sinc}\left( \frac{t - n T_s}{T_s} \right)$$

Di mana fungsi sinc ternormalisasi didefinisikan sebagai:
$$\text{sinc}(u) = \frac{\sin(\pi u)}{\pi u}$$

---

## 8. Worked Mathematical Examples

### Contoh 1: Perhitungan Aliasing Frekuensi
Diberikan sinyal nada sinusoidal dengan frekuensi $f_0 = 850 \text{ Hz}$. Sinyal ini disampling dengan laju cuplik $f_s = 1000 \text{ Hz}$.
1. Apakah kondisi Nyquist terpenuhi?
2. Berapakah frekuensi semu ($f_{\text{alias}}$) yang terdengar pada keluaran?

**Penyelesaian**:
1. Frekuensi Nyquist adalah $f_N = f_s / 2 = 1000 / 2 = 500 \text{ Hz}$.  
   Karena frekuensi sinyal $f_0 = 850 \text{ Hz} > 500 \text{ Hz}$, kondisi Nyquist **DILANGGAR** ($f_s < 2 f_0$). Terjadi aliasing!
2. Menggunakan rumus frekuensi lipat:
   $$f_{\text{alias}} = |f_0 - f_s| = |850 - 1000| = |-150| = 150 \text{ Hz}$$
   **Kesimpulan**: Nada tinggi $850 \text{ Hz}$ akan terdengar palsu sebagai nada rendah $150 \text{ Hz}$.

---

### Contoh 2: Perbandingan SQNR 8-Bit vs 16-Bit
Bandingkan rasio SQNR teoritis antara citra grayscale standar (8-bit) dan audio CD (16-bit):
- Untuk $b = 8 \text{ bit}$:
  $$\text{SQNR}_8 = 6.02 \times 8 + 1.76 = 48.16 + 1.76 = 49.92 \text{ dB}$$
- Untuk $b = 16 \text{ bit}$:
  $$\text{SQNR}_{16} = 6.02 \times 16 + 1.76 = 96.32 + 1.76 = 98.08 \text{ dB}$$

Audio 16-bit memiliki rentang dinamis $98 \text{ dB}$, menjamin desis derau kuantisasi berada jauh di bawah ambang batas pendengaran manusia.

---

## 9. Python Implementation: Simulasi Sampling & Kuantisasi

Berikut adalah implementasi Python mandiri untuk mereproduksi fenomena sampling, aliasing, dan kuantisasi linier:

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 02: Digital Signals, Sampling & Quantization
Simulasi Sampling Nyquist, Aliasing, dan Uniform Quantization

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def simulate_sampling(f_signal: float, f_sample: float, duration: float = 1.0):
    """
    Mensimulasikan pencuplikan sinyal kontinu.
    Menghitung sampel diskrit dan mendeteksi frekuensi semu aliasing.
    """
    # Sinyal kontinu diaproksimasi dengan laju sangat tinggi (100 kHz)
    t_continuous = np.linspace(0, duration, int(100000 * duration), endpoint=False)
    x_continuous = np.sin(2 * np.pi * f_signal * t_continuous)

    # Pencuplikan diskrit pada fs
    n_samples = int(f_sample * duration)
    t_discrete = np.linspace(0, duration, n_samples, endpoint=False)
    x_discrete = np.sin(2 * np.pi * f_signal * t_discrete)

    is_aliased = f_sample < 2 * f_signal
    f_nyquist = f_sample / 2.0
    f_apparent = abs(f_signal - round(f_signal / f_sample) * f_sample)

    return {
        "f_signal": f_signal,
        "f_sample": f_sample,
        "f_nyquist": f_nyquist,
        "is_aliased": is_aliased,
        "f_apparent": f_apparent,
        "n_samples": n_samples
    }

def uniform_quantize(signal: np.ndarray, bit_depth: int, v_min: float = -1.0, v_max: float = 1.0):
    """
    Melakukan kuantisasi seragam (mid-tread rounding).
    Mengembalikan sinyal terkuantisasi, error kuantisasi, dan nilai SQNR empiris.
    """
    levels = 2 ** bit_depth
    delta = (v_max - v_min) / levels

    # Normalisasi ke indeks level [0, levels - 1]
    clamped = np.clip(signal, v_min, v_max)
    indices = np.round((clamped - v_min) / delta)
    indices = np.clip(indices, 0, levels - 1)

    # Rekonstruksi nilai terkuantisasi
    quantized = v_min + indices * delta + (delta / 2.0)
    error = quantized - signal

    # Perhitungan SQNR empiris
    p_signal = np.mean(signal ** 2)
    p_noise = np.mean(error ** 2)
    sqnr_db = 10 * np.log10(p_signal / p_noise) if p_noise > 0 else 999.0

    return quantized, error, sqnr_db, delta

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 02 Verification")
    print("=" * 65)

    # 1. Uji Teorema Sampling & Aliasing
    res1 = simulate_sampling(f_signal=8.0, f_sample=40.0) # fs >= 2f (Normal)
    print(f"Eksperimen A (f=8 Hz, fs=40 Hz): Nyquist={res1['f_nyquist']} Hz | Aliasing={res1['is_aliased']}")
    assert not res1['is_aliased'], "fs=40 Hz harus memenuhi kriteria Nyquist untuk sinyal 8 Hz."

    res2 = simulate_sampling(f_signal=8.0, f_sample=10.0) # fs < 2f (Aliased)
    print(f"Eksperimen B (f=8 Hz, fs=10 Hz): Nyquist={res2['f_nyquist']} Hz | Aliasing={res2['is_aliased']} | Frekuensi Semu={res2['f_apparent']} Hz")
    assert res2['is_aliased'], "fs=10 Hz harus memicu aliasing untuk sinyal 8 Hz."

    # 2. Uji Kuantisasi & SQNR (Aturan 6 dB per bit)
    t = np.linspace(0, 1.0, 10000, endpoint=False)
    test_sine = np.sin(2 * np.pi * 5.0 * t) # Sinyal uji amplitudo 1.0

    _, _, sqnr_4bit, delta_4 = uniform_quantize(test_sine, bit_depth=4)
    _, _, sqnr_8bit, delta_8 = uniform_quantize(test_sine, bit_depth=8)

    print(f"\nKuantisasi 4-bit: Step Delta={delta_4:.4f} | Empiris SQNR={sqnr_4bit:.2f} dB (Teori ~25.8 dB)")
    print(f"Kuantisasi 8-bit: Step Delta={delta_8:.4f} | Empiris SQNR={sqnr_8bit:.2f} dB (Teori ~49.9 dB)")
    
    delta_sqnr = sqnr_8bit - sqnr_4bit
    print(f"Kenaikan SQNR dari 4 ke 8 bit: {delta_sqnr:.2f} dB (~24 dB / 6 dB per bit)")
    assert delta_sqnr > 20.0, "Kenaikan 4 bit harus meningkatkan SQNR setidaknya 20 dB."

    print("\nVerifikasi Numerik Berhasil: Teorema sampling dan hukum kuantisasi tervalidasi!")

if __name__ == "__main__":
    main()
```

---

## 10. Summary

1. Sinyal analog kontinu diubah menjadi besaran diskrit digital melalui proses **Sampling** (diskretisasi waktu/ruang) dan **Kuantisasi** (diskretisasi nilai amplitudo).
2. **Teorema Sampling Nyquist-Shannon** mensyaratkan laju cuplik $f_s \ge 2 f_{\max}$ untuk menghindari distorsi lipat frekuensi (**Aliasing**).
3. **Kuantisasi Seragam** membagi rentang sinyal menjadi $L = 2^b$ tingkatan dengan langkah interval $\Delta = (V_{\max} - V_{\min})/2^b$.
4. Variansi derau kuantisasi ideal berbanding lurus dengan kuadrat ukuran langkah: $\sigma_e^2 = \Delta^2 / 12$.
5. Setiap penambahan 1 bit kedalaman resolusi meningkatkan rasio sinyal terhadap derau kuantisasi sekitar **$6.02 \text{ dB}$** ($\text{SQNR} \approx 6.02b + 1.76 \text{ dB}$).
6. Rekonstruksi sinyal kontinu ideal dicapai melalui konvolusi sampel diskrit dengan fungsi interpolasi Whittaker-Shannon **$\text{sinc}$**.

---

## 11. References & Academic Citations

1. **Oppenheim, A. V., & Schafer, R. W.** (2010). *Discrete-Time Signal Processing* (3rd ed.). Prentice Hall. Chapter 4: Sampling of Continuous-Time Signals.
2. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson. Chapter 2: Digital Image Fundamentals & Image Sampling.
3. **Haykin, S., & Moher, M.** (2009). *Communication Systems* (5th ed.). John Wiley & Sons. Chapter 3: Pulse Modulation & Quantization Process.
4. **Shannon, C. E.** (1949). *Communication in the Presence of Noise*. Proceedings of the IRE, 37(1), 10-21.
