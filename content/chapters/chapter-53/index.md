# Bab 53 — Audio-Visual Learning & Fusion

**Seksi Kurikulum:** Seksi 11 — Multimodal AI  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Dalam persepsi biologis maupun sistem otonom cerdas, mata dan telinga bekerja secara terkoordinasi erat. Saat melihat seseorang berbicara, gerakan bibir dan ekspresi wajah kita cocokkan secara simultan dengan getaran suara fonem (*lip-reading*). Ketika mengemudikan kendaraan, deru sirene ambulans memberi peringatan beberapa detik sebelum kendaraan fisik tampak di bidang pandang kamera (*visual field of view*). **Audio-Visual Learning & Fusion** adalah domain visi komputer multimodal yang menggabungkan aliran video temporal dengan sinyal akustik untuk mengenali peristiwa visual, mendeteksi sumber suara spasial (*sound source localization*), serta meningkatkan kekokohan deteksi dalam kondisi visual yang terdegradasi.

Dalam peta jalan kepakaran **Intelligent Computer Vision (ITERA / ISVWS 2026–2040)**, bab ini mempertahankan **pendekatan vision-centric**:
- Aliran visual (*video stream*) tetap bertindak sebagai modalitas primer untuk lokalisasi spasial, identifikasi objek, dan penentuan koordinat peristiwa.
- Sinyal akustik (*audio stream*) berfungsi sebagai validator kontekstual, detektor peristiwa cepat (*fast temporal event trigger*), dan instrumen verifikasi ketika modalitas visual mengalami oklusi atau gangguan pencahayaan.
- Bab ini berfokus pada mekanisme korespondensi audio-visual, estimasi ketidaksinkronan temporal (*audio-video synchronization offset*), dan arsitektur fusi terbobot keandalan, tanpa mengulang kembali silabus dasar pemrosesan audio yang telah dipelajari pada Bab 16–25.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Korespondensi & Sinkronisasi Temporal Audio-Visual

Tantangan utama dalam fusi audio-visual adalah diskrepansi tingkat pencuplikan (*sampling rate mismatch*). Aliran video umumnya direkam pada 30 frame per detik ($\Delta t_v \approx 33.3$ ms), sedangkan sinyal audio dicuplik pada 16 kHz atau 44.1 kHz ($\Delta t_a \approx 0.02$–$0.06$ ms).

```
+-------------------------------------------------------------------------+
|              PIPELINE SINKRONISASI & FUSI AUDIO-VISUAL                  |
+-------------------------------------------------------------------------+
 Video Frames I(t) ----> [ Optical Flow / Motion Energy E_v(t) ] ---+
                                                                     |--> [ Cross-Correlation ]
 Audio Waveform s(t) --> [ Envelope / Spectral Energy E_a(t) ]  ----+    Optimal Lag tau*
                                                                               |
               +---------------------------------------------------------------+
               v
 [ Resynchronized Stream ] --> [ Cross-Modal Attention Fusion ] --> [ Event Detection ]
```

Untuk menyelaraskan kedua aliran sinyal:
1. **Ekstraksi Energi Gerak Visual ($E_v$)**:
   Dari pasangan frame citra $\mathbf{I}_t$ dan $\mathbf{I}_{t+1}$, dihitung magnitudo rata-rata medan optical flow atau selisih frame absolut:
   $$E_v(t) = \frac{1}{H \cdot W} \sum_{x=1}^W \sum_{y=1}^H |\mathbf{I}_{t+1}(x, y) - \mathbf{I}_t(x, y)|$$
2. **Ekstraksi Energi Selubung Akustik ($E_a$)**:
   Sinyal audio dipotong ke dalam jendela waktu yang berkorespondensi dengan frame video, lalu dihitung energi RMS (*Root Mean Square*):
   $$E_a(t) = \sqrt{\frac{1}{K} \sum_{k=0}^{K-1} s(t \cdot K + k)^2}$$
3. **Korelasi Silang Ternormalisasi (*Normalized Cross-Correlation*)**:
   Tingkat keselarasan temporal pada pergeseran lag $\tau$ diformulasikan sebagai:
   $$\rho_{va}(\tau) = \frac{\sum_t (E_v(t) - \bar{E}_v)(E_a(t + \tau) - \bar{E}_a)}{\sqrt{\sum_t (E_v(t) - \bar{E}_v)^2 \sum_t (E_a(t + \tau) - \bar{E}_a)^2}}$$
   Keterlambatan waktu optimal (*optimal synchronization offset*):
   $$\tau^* = \arg\max_{\tau} \rho_{va}(\tau)$$

### 2.2 Fusi Antara Berbasis Cross-Attention Audio-Visual

Pada arsitektur berbasis Transformer (Nagrani et al., 2021), representasi token visual $\mathbf{X}_v \in \mathbb{R}^{T \times D}$ dan token audio $\mathbf{X}_a \in \mathbb{R}^{T \times D}$ difusikan melalui lapisan *Cross-Attention*:
$$\mathbf{Q}_v = \mathbf{X}_v \mathbf{W}_Q, \quad \mathbf{K}_a = \mathbf{X}_a \mathbf{W}_K, \quad \mathbf{V}_a = \mathbf{X}_a \mathbf{W}_V$$
$$\mathbf{Z}_{v \leftarrow a} = \text{Softmax}\left( \frac{\mathbf{Q}_v \mathbf{K}_a^T}{\sqrt{d}} \right) \mathbf{V}_a + \mathbf{X}_v$$
Mekanisme ini memperkaya representasi spasial visual dengan informasi temporal akustik, sehingga gerakan visual yang ambigu (misal instrumen musik yang digesek) terpetakan secara tepat dengan suara yang dihasilkan.

### 2.3 Verifikasi Keputusan Berbasis Keandalan (Decision Verification)

Dalam aplikasi pemantauan keselamatan (misal deteksi tabrakan kendaraan atau suara kaca pecah):
- Detektor visual menghasilkan probabilitas deteksi $P_v \in [0, 1]$ dengan keandalan $\gamma_v \in [0, 1]$ (berdasarkan kualitas pencahayaan dan kontras).
- Detektor akustik menghasilkan probabilitas akustik $P_a \in [0, 1]$ dengan keandalan $\gamma_a \in [0, 1]$ (berdasarkan Signal-to-Noise Ratio).
- **Fusi Linier Terbobot**:
  $$P_{\text{AV}} = \frac{\gamma_v P_v + \gamma_a P_a}{\gamma_v + \gamma_a}$$
- **Verifikasi Bayesian Independen**:
  Jika kedua modalitas dianggap mengamati peristiwa yang sama secara statistik independen:
  $$P_{\text{Bayes}} = \frac{P_v P_a}{P_v P_a + (1 - P_v)(1 - P_a)}$$

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita selesaikan secara analitis dan manual dua eksperimen inti: (1) estimasi lag sinkronisasi temporal audio-visual, dan (2) verifikasi peristiwa keselamatan lalu lintas menggunakan fusi audio-visual.

---

### Bagian A: Estimasi Keterlambatan Waktu Audio-Visual ($\tau^*$)

Diberikan deret energi diskrit sepanjang $T=5$ frame (pencuplikan video 10 FPS, interval $\Delta t = 100$ ms per frame):
- **Energi Gerakan Visual**: $\mathbf{E}_v = [0.10, 0.20, 0.90, 0.30, 0.10]$ (Puncak gerak visual berada di $t=2$)
- **Energi Selubung Audio**: $\mathbf{E}_a = [0.00, 0.10, 0.20, 0.90, 0.30]$ (Puncak audio tertunda di $t=3$)

Mari kita hitung korelasi silang $R(\tau) = \sum_t E_v(t) E_a(t + \tau)$ untuk pergeseran lag $\tau \in \{0, 1, -1\}$:

#### 1. Untuk Lag $\tau = 0$ (Asumsi Sinkron):
$$R(0) = (0.10 \times 0.00) + (0.20 \times 0.10) + (0.90 \times 0.20) + (0.30 \times 0.90) + (0.10 \times 0.30)$$
$$R(0) = 0.000 + 0.020 + 0.180 + 0.270 + 0.030 = 0.5000$$

#### 2. Untuk Lag $\tau = 1$ (Audio Digeser Maju 1 Frame, $E_a(t+1)$):
Vektor audio tergeser: $E_a(t+1) = [0.10, 0.20, 0.90, 0.30, 0.00]$
$$R(1) = (0.10 \times 0.10) + (0.20 \times 0.20) + (0.90 \times 0.90) + (0.30 \times 0.30) + (0.10 \times 0.00)$$
$$R(1) = 0.010 + 0.040 + 0.810 + 0.090 + 0.000 = 0.9500$$

#### 3. Untuk Lag $\tau = -1$ (Audio Digeser Mundur 1 Frame):
Vektor audio tergeser: $E_a(t-1) = [0.00, 0.00, 0.10, 0.20, 0.90]$
$$R(-1) = (0.10 \times 0.00) + (0.20 \times 0.00) + (0.90 \times 0.10) + (0.30 \times 0.20) + (0.10 \times 0.90)$$
$$R(-1) = 0.000 + 0.000 + 0.090 + 0.060 + 0.090 = 0.2400$$

**Hasil Analisis**:
Korelasi puncak terjadi secara tegas pada $\tau^* = 1$ dengan nilai $R(1) = 0.9500$.
Hal ini membuktikan secara analitis bahwa **audio mengalami kelambatan (*delay*) sebesar 1 frame ($100$ ms)** terhadap video. Untuk sinkronisasi presisi, buffer audio harus dimajukan sebesar 1 frame.

---

### Bagian B: Verifikasi Peristiwa Keselamatan (Tabrakan Kendaraan)

#### Kasus 1: Peristiwa Riil dengan Gangguan Pencahayaan Visual
- Kamera malam hari mendeteksi tabrakan kendaraan: $P_v = 0.75$, keandalan sensor $\gamma_v = 0.70$ (kondisi gelap dan silau lampu).
- Sensor akustik mendeteksi suara hantaman logam keras: $P_a = 0.90$, keandalan sensor $\gamma_a = 0.85$ (sinyal akustik jernih, SNR tinggi).

Bobot terkalibrasi:
$$\sum \gamma = 0.70 + 0.85 = 1.55$$
$$\alpha_v = \frac{0.70}{1.55} \approx 0.4516, \quad \alpha_a = \frac{0.85}{1.55} \approx 0.5484$$

Probabilitas fusi audio-visual:
$$P_{\text{AV}} = (0.4516 \times 0.75) + (0.5484 \times 0.90) = 0.3387 + 0.4936 = 0.8323 \quad (83.23\%)$$
*Kesimpulan*: Bukti akustik yang kuat berhasil mendongkrak kepastian deteksi visual dari $75.0\%$ menjadi $83.23\%$.

#### Kasus 2: Alarm Palsu Visual (*Visual False Alarm Suppression*)
Misalkan terjadi bayangan pohon yang melintas cepat sehingga detektor visual mencurigai tabrakan ($P_v = 0.75$), namun kondisi lingkungan akustik hening total ($P_a = 0.05$):
$$P_{\text{AV}} = (0.4516 \times 0.75) + (0.5484 \times 0.05) = 0.3387 + 0.0274 = 0.3661 \quad (36.61\%)$$
*Kesimpulan*: Karena $P_{\text{AV}} = 36.61\% < 50\%$, sistem berhasil menolak alarm palsu (*false positive rejected*). Inilah kekuatan hakiki integrasi multimodal.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Efek Gema & Dengung Akustik Ruang Tertutup (*Reverberation & Acoustic Echo*)**:
   - *Penyebab*: Pantulan gelombang suara pada dinding gedung atau terowongan menghasilkan salinan sinyal akustik tertunda, mengacaukan korelasi silang energi dan memicu deteksi offset palsu.
   - *Solusi Teknik*: Terapkan filter pra-pemrosesan dereverberasi (*WPE - Weighted Prediction Error*) atau gunakan fitur spektrogram berbasis atensi frekuensi tinggi yang invarian terhadap dengung.

2. **Sumber Suara di Luar Bidang Pandang (*Off-Screen Sound Interference*)**:
   - *Penyebab*: Suara bising (misal anjing menggonggong atau sirine) berasal dari luar sudut pandang kamera, namun model audio-visual secara keliru mengasosiasikannya dengan objek visual yang tampak di layar.
   - *Solusi Teknik*: Gunakan pemisahan sumber audio terpandu visual (*visually-guided audio separation*) dan estimasi sudut kedatangan gelombang suara (*DOA - Direction of Arrival*) menggunakan mikrofon larik (*microphone array*).

3. **Guncangan Frame (*Variable Frame Rate & Timestamp Jitter*)**:
   - *Penyebab*: Beban komputasi sistem operasi lokal membuat kamera menjatuhkan frame (*frame drop*), menyebabkan akumulasi pergeseran waktu (*temporal drift*) secara progresif.
   - *Solusi Teknik*: Terapkan sinkronisasi jam perangkat keras terpadu (*hardware PTP/NTP timestamping*) dan algoritma dynamic time warping (DTW) adaptif secara berkala.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `AudioVisualFusionLab.tsx` memungkinkan simulasi interaktif pergeseran waktu temporal ($\Delta t$), pengujian korespondensi suara-gerakan, dan penyesuaian slider derau sensor di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi korelasi silang diskrit, penentuan lag optimal $\tau^* = 1$, serta fusi verifikasi tabrakan secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Model Pretrained)**: Berkas `notebooks/chapter-53-lab.ipynb` memuat pipeline evaluasi audio-visual end-to-end dengan spektrogram log-mel dan frame sintetis.

### 5.2 Panduan Eksekusi Notebook (`chapter-53-lab.ipynb`)
1. Buka antarmuka Jupyter Notebook lokal atau unggah ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 menginisialisasi pustaka komputasi numerik.
3. Sel 3 menghasilkan deret waktu visual dan audio serta mengomputasi korelasi silang untuk mendeteksi jeda waktu sinkronisasi.
4. Sel 4 mengevaluasi fusi probabilitas keandalan pada skenario verifikasi tabrakan dan penolakan alarm palsu.
5. Sel 5 menyediakan panduan pemuatan model audio-visual (seperti AV-Hubert atau Audio-Visual Transformer) pada lingkungan cloud GPU.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Sinyal energi gerak video $E_v(t)$ dan energi akustik $E_a(t)$ sepanjang $T$ jendela waktu, beserta probabilitas modalitas $P_v, P_a$.
- **Transformasi**:
  1. Korelasi silang pergeseran waktu: $R(\tau) = \sum_t E_v(t) E_a(t+\tau)$.
  2. Penyelarasan temporal berbasis $\tau^* = \arg\max R(\tau)$.
  3. Fusi keputusan terbobot keandalan: $P_{\text{AV}} = \sum \alpha_m P_m$.
- **Output & Evaluasi**: Nilai jeda waktu sinkronisasi $\tau^*$, skor probabilitas terverifikasi, dan status supresi alarm palsu.

---

## 6. Diagram Arsitektur Sistem

![Pipeline Deteksi Sinkronisasi Temporal Audio-Visual](/media/diagrams/chapter-53-audiovisual-synchronization-pipeline.svg)

![Arsitektur Fusi Audio-Visual untuk Speech Recognition & Event Detection](/media/diagrams/chapter-53-audiovisual-fusion-architectures.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Integrasi audio-visual memadukan ketajaman lokalisasi spasial kamera dengan kecepatan deteksi dan ketahanan sinyal akustik. Melalui analisis korelasi silang energi temporal, keterlambatan transmisi sensorik dapat dikompensasi secara matematis. Terlebih lagi, fusi keputusan berbasis keandalan terbukti mampu mengeliminasi alarm palsu visual dan melindungi sistem otonom dari kegagalan persepsi dalam kondisi lingkungan yang menantang.
