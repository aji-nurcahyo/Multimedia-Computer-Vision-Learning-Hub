import fs from 'node:fs';
import path from 'node:path';

const sections = [
  {
    id: "01",
    title: "Multimedia & Signal Foundations",
    chapters: [
      { 
        id: "01", 
        title: "Introduction to Multimedia & Computer Vision", 
        difficulty: "beginner", 
        duration: 90, 
        tracks: ["digital-image-processing", "audio-speech-processing", "video-processing-tracking"],
        description: "Memahami taksonomi multimedia digital (citra, audio, video), rantai alur pemrosesan end-to-end, komparasi Image Processing vs Computer Vision, metode klasik vs Deep Learning, serta pemetaan 6 jalur belajar.",
        learningObjectives: [
          "Mendefinisikan ruang lingkup multimedia digital dan karakteristik fisik sinyal citra, audio, dan video.",
          "Menguraikan tahapan dalam end-to-end multimedia processing pipeline.",
          "Menganalisis perbedaan taksonomi antara Digital Image Processing dan Computer Vision.",
          "Membandingkan keunggulan dan batasan antara algoritma klasik vs Deep Learning.",
          "Memanfaatkan pustaka Python untuk menginspeksi dimensi data matriks citra, audio, dan video."
        ]
      },
      { 
        id: "02", 
        title: "Digital Signals, Sampling & Quantization", 
        difficulty: "beginner", 
        duration: 120, 
        tracks: ["digital-image-processing", "audio-speech-processing"],
        description: "Mengkaji proses konversi Analog-to-Digital (ADC), Teorema Sampling Nyquist-Shannon, distorsi lipat frekuensi Aliasing, formulasi derau kuantisasi seragam, dan aturan SQNR 6.02b + 1.76 dB.",
        learningObjectives: [
          "Membedakan karakteristik analitis sinyal waktu kontinu x(t) dengan sinyal waktu diskrit x[n].",
          "Membuktikan kondisi batas Teorema Sampling Nyquist-Shannon (fs >= 2 fmax).",
          "Menganalisis terjadinya distorsi aliasing dan menghitung frekuensi semu.",
          "Menghitung ukuran langkah kuantisasi seragam, variansi derau kuantisasi, dan rasio SQNR.",
          "Mengimplementasikan simulasi sampling, aliasing, dan kuantisasi linier menggunakan NumPy."
        ]
      },
      { 
        id: "03", 
        title: "Multimedia Data Representation & File Formats", 
        difficulty: "beginner", 
        duration: 90, 
        tracks: ["digital-image-processing", "audio-speech-processing", "video-processing-tracking"],
        description: "Membedakan peran Container (MP4, MKV) vs Codec (H.264, AV1, AAC), menganalisis kompresi Lossless (PNG, FLAC) vs Lossy (JPEG, MP3), menghitung ukuran data teoritis, dan membaca metadata berkas.",
        learningObjectives: [
          "Memahami representasi biner data multimedia (piksel, sampel, frame, susunan byte, dan endianness).",
          "Membedakan secara analitis antara format wadah (container) dengan format kompresi (codec).",
          "Menganalisis prinsip kerja kompresi Lossless vs kompresi Lossy berbasis psikovisual.",
          "Mengevaluasi karakteristik format citra (PNG, JPEG, WebP, AVIF) dan audio (WAV, MP3, FLAC).",
          "Menghitung secara matematis ukuran data teoritis tak terkompresi dan rasio kompresi."
        ]
      },
      { 
        id: "04", 
        title: "Python Multimedia Development Environment", 
        difficulty: "beginner", 
        duration: 90, 
        tracks: ["digital-image-processing", "audio-speech-processing"],
        description: "Panduan konfigurasi lingkungan pengembangan Python terisolasi menggunakan Virtual Environment (venv), manajemen dependensi pip & requirements.txt, pemilihan IDE, dan strategi troubleshooting.",
        learningObjectives: [
          "Memverifikasi integritas instalasi Python 64-bit versi 3.10 atau lebih baru.",
          "Membuat dan mengaktifkan virtual environment menggunakan modul bawaan venv lintas platform.",
          "Mengonfigurasi manajer paket pip untuk menginstal pustaka inti komputasi multimedia.",
          "Menyusun struktur tata kelola folder proyek perangkat lunak multimedia yang modular.",
          "Mendiagnosis dan memecahkan kendala umum sistem (PowerShell policy, DLL error)."
        ]
      },
      { 
        id: "05", 
        title: "NumPy, Visualization & Multimedia I/O", 
        difficulty: "beginner", 
        duration: 120, 
        tracks: ["digital-image-processing"],
        description: "Penguasaan manipulasi array tensor ndarray (Audio 1D, Citra 2D/3D, Video 4D), bahaya laten integer overflow uint8, pemotongan ROI, konversi warna OpenCV BGR vs RGB, dan vektorisasi SIMD.",
        learningObjectives: [
          "Memahami anatomi objek ndarray dalam merepresentasikan audio 1D, citra 2D/3D, dan video 4D.",
          "Menguasai teknik pengindeksan tingkat lanjut dan pemotongan wilayah minat (ROI slicing).",
          "Menganalisis perbedaan kritis antara tampilan memori (views) dengan salinan memori (copies).",
          "Menerapkan operasi tervektorisasi (vectorized operations) berkecepatan tinggi.",
          "Membangun pipeline I/O media yang benar untuk membaca, memanipulasi, dan menyimpan citra."
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Digital Image Processing Fundamentals",
    chapters: [
      {
        id: "06",
        title: "Digital Image Fundamentals",
        difficulty: "beginner",
        duration: 90,
        tracks: ["digital-image-processing", "computer-vision"],
        description: "Memahami representasi matriks citra diskrit 2D f(x,y), sistem koordinat Kartesius vs pengindeksan baris-kolom NumPy, resolusi spasial, kuantisasi kedalaman bit (bit depth), konversi grayscale BT.601, dan perhitungan memori RAM mentah.",
        learningObjectives: [
          "Menjelaskan pemodelan matematis citra digital 2D sebagai matriks diskrit f(x, y).",
          "Membedakan sistem koordinat (x, y) pada geometri citra dengan urutan indeks NumPy [row, col].",
          "Menganalisis pengaruh penurunan resolusi spasial dan kedalaman bit (pixelation & false contouring).",
          "Menghitung ukuran memori mentah RAM untuk citra biner, grayscale, RGB 24-bit, dan RGBA 32-bit."
        ]
      },
      {
        id: "07",
        title: "Color Models & Color Space Transformation",
        difficulty: "beginner",
        duration: 120,
        tracks: ["digital-image-processing"],
        description: "Mengupas ruang warna perangkat keras RGB, luminansi Grayscale, model perseptual HSV/HSL, ruang video luma-kroma YCbCr, keseragaman perseptual CIELAB (D65), dan segmentasi warna tangguh bayangan.",
        learningObjectives: [
          "Membedakan model warna aditif RGB dengan model perseptual HSV, HSL, dan CIELAB.",
          "Menghitung konversi matematis RGB ke HSV, YCbCr (BT.601), dan CIELAB.",
          "Menganalisis ketahanan rona warna (Hue) terhadap perubahan kondisi pencahayaan dan bayangan.",
          "Mengimplementasikan segmentasi berbasis rentang warna dengan cv2.inRange pada skala HSV OpenCV."
        ]
      },
      {
        id: "08",
        title: "Image Enhancement & Intensity Transformation",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["digital-image-processing"],
        description: "Mengkaji transformasi intensitas titik (Point Processing): penyesuaian Brightness dan Contrast linier, Image Negative, Log Transform, Gamma Correction (Power-Law), Contrast Stretching bertahap, serta optimasi O(1) Look-Up Table (LUT).",
        learningObjectives: [
          "Merumuskan fungsi transformasi titik s = T(r) dan menganalisis efek clipping saturasi.",
          "Menjelaskan aplikasi Image Negative, Log Transform, dan koreksi Gamma (gamma < 1 vs > 1).",
          "Mengimplementasikan Min-Max Normalization dan Look-Up Table cepat dengan cv2.LUT.",
          "Mengevaluasi peningkatan kontras citra menggunakan metrik statistik dan kurva transfer T(r)."
        ]
      },
      {
        id: "09",
        title: "Histogram Processing & Contrast Enhancement",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["digital-image-processing"],
        description: "Menganalisis interpretasi profil histogram eksposur citra, derivasi Global Histogram Equalization berbasis Cumulative Distribution Function (CDF), Histogram Specification, serta algoritma lokal adaptif CLAHE.",
        learningObjectives: [
          "Menginterpretasikan kondisi eksposur (under-exposed, over-exposed, low-contrast) dari histogram.",
          "Menurunkan dan mengimplementasikan Global Histogram Equalization menggunakan CDF diskrit.",
          "Memahami mekanisme lokal CLAHE (tiles, Clip Limit anti-noise, dan interpolasi bilinear).",
          "Menerapkan peningkatan kontras secara aman pada citra berwarna melalui saluran luminansi Y/L*."
        ]
      },
      { 
        id: "10", 
        title: "Spatial Filtering & Convolution", 
        difficulty: "intermediate", 
        duration: 150, 
        tracks: ["digital-image-processing", "computer-vision"],
        description: "Memahami konsep konvolusi spasial 2D, representasi kernel filter (smoothing, median non-linier, sharpening, edge detection), sifat separabilitas kernel Gaussian, mekanisme padding batas, dan implementasi efisien menggunakan NumPy serta OpenCV.",
        learningObjectives: [
          "Memahami prinsip matematis konvolusi diskrit 2D dan perbedaannya dengan korelasi spasial.",
          "Menganalisis karakteristik kernel Gaussian, filter Median non-linier, dan sifat separabilitas matriks.",
          "Mengimplementasikan spatial filtering secara mandiri dengan NumPy dan fungsi teroptimasi OpenCV.",
          "Mengevaluasi strategi penanganan batas citra (zero-padding, replicate, reflect).",
          "Menerapkan teknik filtering spasial untuk reduksi derau (noise reduction) dan penajaman fitur (sharpening)."
        ]
      }
    ]
  },
  {
    id: "03",
    title: "Advanced Digital Image Processing",
    chapters: [
      {
        id: "11",
        title: "Frequency Domain Image Processing",
        difficulty: "advanced",
        duration: 150,
        tracks: ["digital-image-processing"],
        description: "Mengkaji transformasi 2D Discrete Fourier Transform (DFT) dan FFT, pemusatan spektrum (fftshift), visualisasi logaritmik, Teorema Konvolusi, filter Ideal/Butterworth/Gaussian LPF & HPF, serta analisis artifak Gibbs ringing.",
        learningObjectives: [
          "Menjelaskan makna fisis komponen DC, frekuensi rendah, dan frekuensi tinggi pada citra 2D.",
          "Menerapkan 2D FFT, fftshift, dan transformasi logaritmik untuk memvisualisasikan spektrum magnitudo.",
          "Membuktikan Teorema Konvolusi dan merancang filter Ideal, Butterworth, dan Gaussian di domain frekuensi.",
          "Menganalisis penyebab terjadinya artifak Gibbs ringing dan cara menghindarinya dengan penapis halus."
        ]
      },
      {
        id: "12",
        title: "Image Restoration & Noise Reduction",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["digital-image-processing"],
        description: "Memformulasikan model degradasi citra fisik, karakteristik derau Gaussian, Salt-and-Pepper, dan Speckle, penapis pelestari tepi (Bilateral, Non-Local Means, Wiener), serta metrik kualitas kuantitatif PSNR dan SSIM.",
        learningObjectives: [
          "Membedakan model degradasi dan perilaku statistik Gaussian, Salt-and-Pepper, serta Speckle noise.",
          "Menjelaskan mekanisme pelestarian tepi pada Bilateral Filter dan Non-Local Means (NLM).",
          "Mengimplementasikan restorasi Median, Bilateral, NLM, dan Wiener menggunakan OpenCV.",
          "Mengevaluasi kualitas hasil restorasi secara objektif dengan MSE, PSNR (dB), dan SSIM."
        ]
      },
      {
        id: "13",
        title: "Edge Detection & Classical Feature Extraction",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["digital-image-processing", "computer-vision"],
        description: "Mengupas turunan gradien citra (Prewitt, Sobel, Laplacian), pipeline optimal 4-tahap Canny Edge Detector (NMS + Hysteresis), serta analisis structure tensor pada Harris Corner Detector.",
        learningObjectives: [
          "Menghitung gradien spasial orde-1 (Sobel, Prewitt) dan orde-2 (Laplacian) menggunakan tipe presisi CV_64F.",
          "Menguraikan algoritma Canny Edge Detector termasuk Non-Maximum Suppression dan Hysteresis Thresholding.",
          "Menganalisis nilai eigen tensor struktur pada Harris Corner Detector untuk membedakan flat, edge, dan corner.",
          "Mengimplementasikan deteksi tepi Canny dan sudut Harris secara tervalidasi dengan OpenCV."
        ]
      },
      {
        id: "14",
        title: "Morphological Image Processing",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["digital-image-processing"],
        description: "Menguasai pengolahan geometri bentuk berbasis teori himpunan: Structuring Elements, Erosion, Dilation, Opening, Closing, Morphological Gradient, White Top-Hat, Black-Hat, dan Morphological Reconstruction.",
        learningObjectives: [
          "Merumuskan operator himpunan biner Erosion dan Dilation serta perancangan Structuring Element.",
          "Membedakan efek pembersihan Opening (hapus noise luar) vs Closing (tutup lubang dalam).",
          "Menerapkan Morphological Gradient, Top-Hat, dan Black-Hat untuk koreksi pencahayaan tidak merata.",
          "Membangun pipeline pembersihan masker segmentasi menggunakan cv2.morphologyEx."
        ]
      },
      {
        id: "15",
        title: "Image Segmentation & Object Analysis",
        difficulty: "advanced",
        duration: 150,
        tracks: ["digital-image-processing", "computer-vision"],
        description: "Mengintegrasikan metode segmentasi Global, Adaptive, dan Otsu Optimal Thresholding, Watershed untuk objek bersentuhan, pelabelan Connected Components, ekstraksi kontur morfometri, serta metrik evaluasi IoU dan Dice.",
        learningObjectives: [
          "Menurunkan dan mengimplementasikan Otsu Optimal Thresholding berbasis maksimasi variansi antar-kelas.",
          "Memilih strategi Adaptive Thresholding dan Distance Transform + Watershed sesuai kondisi citra.",
          "Mengekstrak statistik objek (Area, Centroid, Bounding Box, Circularity) lewat Connected Components & Contours.",
          "Mengevaluasi akurasi segmentasi secara kuantitatif menggunakan Intersection over Union (IoU) dan Dice Score."
        ]
      }
    ]
  },
  {
    id: "04",
    title: "Digital Audio Fundamentals",
    chapters: [
      { 
        id: "16", 
        title: "Digital Audio Fundamentals", 
        difficulty: "beginner", 
        duration: 90, 
        tracks: ["audio-speech-processing"],
        description: "Mengkaji fisika gelombang suara, tekanan akustik, decibel Full Scale (dBFS), persepsi kenyaringan logaritmik, sinyal analog vs digital, dan representasi Pulse Code Modulation (PCM).",
        learningObjectives: [
          "Menjelaskan karakteristik fisis gelombang akustik (frekuensi, amplitudo, panjang gelombang, fase).",
          "Membedakan secara analitis antara amplitudo linier fisik dengan persepsi kenyaringan (loudness).",
          "Menganalisis prinsip konversi analog-ke-digital dan struktur kuantisasi Pulse Code Modulation (PCM).",
          "Mengimplementasikan sintesis sinyal audio sinusoidal dan visualisasi waveform menggunakan NumPy."
        ]
      },
      { 
        id: "17", 
        title: "Audio Sampling, Waveforms & Channels", 
        difficulty: "beginner", 
        duration: 90, 
        tracks: ["audio-speech-processing"],
        description: "Mendalami Teorema Nyquist-Shannon, distorsi lipat frekuensi Aliasing, kuantisasi seragam, rasio SQNR teoretis (6.02b + 1.76 dB), konfigurasi mono/stereo interleaving, dan kalkulasi laju data bitrate audio.",
        learningObjectives: [
          "Membuktikan batas frekuensi Nyquist dan mencegah distorsi aliasing pada akuisisi audio.",
          "Menghitung rasio Signal-to-Quantization-Noise Ratio (SQNR) pada berbagai bit depth (8-bit hingga 16-bit).",
          "Menganalisis pengemasan kanal audio mono, stereo, dan multichannel interleaved dalam format RIFF WAV.",
          "Mengevaluasi bandwidth transmisi dan komputasi bitrate streaming audio digital."
        ]
      },
      { 
        id: "18", 
        title: "Fourier Transform & Spectral Analysis", 
        difficulty: "intermediate", 
        duration: 120, 
        tracks: ["audio-speech-processing"],
        description: "Mempelajari Discrete Fourier Transform (DFT), algoritma cepat Radix-2 Cooley-Tukey FFT 1D, pemilihan fungsi jendela (Hann, Hamming, Blackman, Rectangular), mitigasi spectral leakage, dan identifikasi nada harmonik.",
        learningObjectives: [
          "Menurunkan formulasi matematis DFT 1D dan memahami reduksi kompleksitas Cooley-Tukey FFT.",
          "Menganalisis mekanisme kebocoran spektral (spectral leakage) akibat diskontinuitas batas frame.",
          "Membandingkan trade-off lebar main-lobe vs peredaman side-lobe pada berbagai fungsi windowing.",
          "Mengimplementasikan analisis spektrum daya (magnitude spectrum) dan deteksi frekuensi dominan."
        ]
      },
      { 
        id: "19", 
        title: "Digital Audio Filtering & Noise Reduction", 
        difficulty: "intermediate", 
        duration: 120, 
        tracks: ["audio-speech-processing"],
        description: "Mengeksplorasi topologi penapis digital LPF, HPF, BPF, dan Notch/Band-stop, membandingkan arsitektur FIR (linear phase, konvolusi jendela) vs IIR Biquad (efisiensi rekursif, stabilitas kutub), serta evaluasi metrik SNR.",
        learningObjectives: [
          "Merancang filter FIR berbasis sinc windowing dan filter IIR Biquad orde-2 standar Audio EQ Cookbook.",
          "Menganalisis stabilitas sistem filter digital pada diagram bidang-Z (unit circle pole-zero placement).",
          "Membandingkan karakteristik distorsi fasa linear FIR terhadap efisiensi komputasi IIR.",
          "Menerapkan filtering audio untuk eliminasi derau aditif dan mengevaluasi peningkatan rasio SNR (dB)."
        ]
      },
      { 
        id: "20", 
        title: "Time-Frequency Analysis & Spectrograms", 
        difficulty: "intermediate", 
        duration: 120, 
        tracks: ["audio-speech-processing"],
        description: "Mengkaji Short-Time Fourier Transform (STFT), kompromi batas ketidakpastian Heisenberg-Gabor (resolusi waktu vs frekuensi), matriks spektrogram, skala perseptual Mel, dan analisis sinyal audio non-stasioner.",
        learningObjectives: [
          "Memahami keterbatasan analisis Fourier stasioner pada sinyal musik dan wicara yang dinamis.",
          "Memformulasikan Short-Time Fourier Transform (STFT) dengan pemilihan frame length dan hop size optimal.",
          "Membuktikan batas ketidakpastian Heisenberg-Gabor (delta_t * delta_f >= 1 / 4pi).",
          "Membangun visualisasi spektrogram interaktif dan pemetaan ke skala non-linier Mel filterbank."
        ]
      }
    ]
  },
  {
    id: "05",
    title: "Audio & Speech Intelligence",
    chapters: [
      { 
        id: "21", 
        title: "Audio Feature Extraction", 
        difficulty: "intermediate", 
        duration: 120, 
        tracks: ["audio-speech-processing", "multimodal-ai"],
        description: "Mengekstrak deskriptor audio domain waktu (RMS Energy, Zero-Crossing Rate) dan domain frekuensi (Spectral Centroid, Spread, Flatness, Rolloff), serta arsitektur komputasi Mel-Frequency Cepstral Coefficients (MFCC).",
        learningObjectives: [
          "Mengekstrak fitur temporal dasar (RMS, Zero-Crossing Rate) untuk deteksi energi dan tekstur suara.",
          "Menghitung deskriptor spektral MPEG-7 (Spectral Centroid, Spread, Flatness, dan 85% Rolloff).",
          "Menguasai alur komputasi MFCC (Pre-emphasis -> Framing -> FFT -> Mel Filterbank -> Log -> DCT-II).",
          "Menyiapkan matriks fitur akustik sebagai representasi data latih machine learning."
        ]
      },
      { 
        id: "22", 
        title: "Speech Signal Processing", 
        difficulty: "intermediate", 
        duration: 120, 
        tracks: ["audio-speech-processing"],
        description: "Memodelkan sistem vokal manusia (sumber-filter), membedakan suara bersuara (voiced) vs tak bersuara (unvoiced), segmentasi Voice Activity Detection (VAD), formant vokal (F1-F3), dan estimasi frekuensi dasar nada F0 pitch autokorelasi.",
        learningObjectives: [
          "Memahami model saluran suara manusia (glottal source + vocal tract acoustic tube filter).",
          "Mengklasifikasikan segmen wicara voiced vs unvoiced berbasis autokorelasi dan Zero-Crossing Rate.",
          "Membangun algoritma Voice Activity Detection (VAD) hemat komputasi untuk segmentasi ujaran aktif.",
          "Mengestimasi kontur pitch (F0) secara presisi menggunakan metode autokorelasi ternormalisasi."
        ]
      },
      { 
        id: "23", 
        title: "Speech Recognition & Speech Synthesis", 
        difficulty: "advanced", 
        duration: 150, 
        tracks: ["audio-speech-processing"],
        description: "Mengurai arsitektur Automatic Speech Recognition (Acoustic Model, Language Model, Beam Search), Text-to-Speech (Grapheme-to-Phoneme, Mel Spectrogram Gen, Neural Vocoder), serta evaluasi akurasi Word Error Rate (WER) dan Levenshtein Distance.",
        learningObjectives: [
          "Menguraikan tahapan sistem ASR modern dari sinyal audio akustik menuju transkripsi teks.",
          "Memahami komponen Text-to-Speech (TTS) modern meliputi Text Normalizer, FastSpeech, dan HiFi-GAN Vocoder.",
          "Mengevaluasi akurasi sistem ASR menggunakan metrik Word Error Rate (WER) dan Character Error Rate (CER).",
          "Mengeksplorasi integrasi Web Speech API (SpeechRecognition & SpeechSynthesis) pada aplikasi web."
        ]
      },
      { 
        id: "24", 
        title: "Sound Event Detection & Audio Classification", 
        difficulty: "advanced", 
        duration: 150, 
        tracks: ["audio-speech-processing"],
        description: "Mempelajari Sound Event Detection (SED) polifonik, representasi Log-Mel Spectrogram sebagai citra 2D, transfer learning arsitektur CNN/Transformer (PANNs), fungsi Softmax probabilitas, dan analisis Confusion Matrix (Precision, Recall, F1-Score).",
        learningObjectives: [
          "Memformulasikan deteksi kejadian suara polifonik (Sound Event Detection) pada domain waktu-frekuensi.",
          "Memperlakukan Log-Mel Spectrogram sebagai representasi citra 2D untuk klasifikasi jaringan konvolusi (CNN).",
          "Menghitung fungsi aktivasi Softmax multi-kelas dan menginterpretasikan skor keyakinan inferensi.",
          "Mengevaluasi model klasifikasi audio menggunakan Confusion Matrix, Precision, Recall, dan F1-Score."
        ]
      },
      { 
        id: "25", 
        title: "Intelligent Audio Processing Applications", 
        difficulty: "advanced", 
        duration: 150, 
        tracks: ["audio-speech-processing"],
        description: "Membangun aplikasi cerdas audio terintegrasi end-to-end: Akuisisi Sinyal -> Denoising Filter -> VAD Segmentasi -> Ekstraksi Fitur Akustik -> Deteksi Anomali Akustik Real-Time, serta optimasi inferensi TinyML pada Edge Devices.",
        learningObjectives: [
          "Mengintegrasikan seluruh subsistem pemrosesan audio ke dalam satu arsitektur pipeline terpadu.",
          "Merancang sistem deteksi anomali akustik (Acoustic Anomaly Detection) untuk pemeliharaan prediktif mesin.",
          "Mengoptimalkan latensi komputasi agar memenuhi persyaratan pemrosesan real-time perangkat edge.",
          "Menguji performa sistem secara holistik pada skenario pengujian audio dunia nyata."
        ]
      }
    ]
  },
  {
    id: "06",
    title: "Digital Video Fundamentals",
    chapters: [
      {
        id: "26",
        title: "Digital Video Fundamentals",
        difficulty: "beginner",
        duration: 90,
        tracks: ["video-processing-tracking"],
        description: "Mempelajari representasi video digital sebagai deret citra temporal, resolusi spasial dan temporal, frame rate (fps), pemindaian progresif vs interlaced, ruang warna dan subsampling kroma (4:4:4, 4:2:2, 4:2:0), sinkronisasi timecode, bitrate konstan/variabel (CBR/VBR), serta kalkulasi bandwidth transmisi.",
        learningObjectives: [
          "Memahami representasi matematis video digital sebagai tensor 3D/4D (H x W x C x T).",
          "Menganalisis skema subsampling kroma YCbCr 4:4:4, 4:2:2, dan 4:2:0 serta efisiensi penghematan bandwidth.",
          "Menghitung bitrate mentah video tak terkompresi dan bandwidth transmisi berdasarkan resolusi dan frame rate.",
          "Membedakan mekanisme pemindaian progressive scanning dengan interlaced scanning dan mitigasi artifak combing."
        ]
      },
      {
        id: "27",
        title: "Video Acquisition & Frame Processing",
        difficulty: "beginner",
        duration: 90,
        tracks: ["video-processing-tracking"],
        description: "Mengeksplorasi arsitektur akuisisi video real-time dari kamera dan berkas, manajemen pipeline decoding frame, arsitektur buffer ring/queue, mitigasi latency dan frame drops, serta transformasi batch per frame pada GPU/CPU.",
        learningObjectives: [
          "Menguasai alur akuisisi video menggunakan OpenCV cv2.VideoCapture dan WebRTC / MediaDevices browser.",
          "Merancang arsitektur thread terpisah (producer-consumer buffer) untuk mencegah bottleneck decoding I/O.",
          "Menerapkan teknik penanganan frame drops, penandaan timestamp presisi, dan sinkronisasi audio-video.",
          "Mengukur latensi pemrosesan per frame (FPS rendering throughput) dalam pipeline vision real-time."
        ]
      },
      {
        id: "28",
        title: "Video Encoding, Codecs & Compression",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["video-processing-tracking"],
        description: "Mengupas prinsip kompresi video digital: redundansi spasial, temporal, dan psikovisual, struktur Group of Pictures (GOP) dengan frame I, P, dan B, estimasi vektor gerak makroblok, evolusi standar codec (H.264/AVC, H.265/HEVC, VP9, AV1), serta metrik kualitas PSNR dan SSIM.",
        learningObjectives: [
          "Memahami prinsip kompresi intra-frame (spasial) dan inter-frame (temporal kompensasi gerak).",
          "Menganalisis peranan dan ketergantungan urutan frame I (Keyframe), frame P (Prediktif), dan frame B (Bidireksional) dalam GOP.",
          "Menghitung metrik kualitas objektif rekonstruksi video: Peak Signal-to-Noise Ratio (PSNR) dan Structural Similarity Index (SSIM).",
          "Membandingkan karakteristik efisiensi kompresi dan kompleksitas komputasi standar codec modern (AVC vs HEVC vs AV1)."
        ]
      },
      {
        id: "29",
        title: "Video Enhancement & Temporal Filtering",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["video-processing-tracking"],
        description: "Mengkaji teknik peningkatan kualitas video memanfaatkan korelasi temporal antar frame: temporal frame averaging, running average, median filtering temporal untuk reduksi derau salt-and-pepper, de-interlacing (bob, weave, motion-adaptive), serta stabilisasi video digital.",
        learningObjectives: [
          "Merumuskan penapis temporal rata-rata berbobot (moving average) untuk reduksi Gaussian noise pada video statis.",
          "Menerapkan penapis median temporal untuk membersihkan noise impulsif tanpa mengaburkan tepi spasial.",
          "Mengidentifikasi artifak ghosting (motion blur) pada objek bergerak akibat filtering temporal dan strategi adaptifnya.",
          "Memahami prinsip de-interlacing adaptif gerak dan estimasi affine transform untuk stabilisasi video digital."
        ]
      },
      {
        id: "30",
        title: "Motion Estimation & Optical Flow",
        difficulty: "advanced",
        duration: 150,
        tracks: ["video-processing-tracking"],
        description: "Memformulasikan persamaan batasan Optical Flow (Brightness Constancy Assumption), membedakan metode lokal diferensial Lucas-Kanade (sparse) dengan metode global variasional Horn-Schunck (dense), piramida skala multi-resolusi untuk gerak besar, serta visualisasi medan vektor gerak.",
        learningObjectives: [
          "Menurunkan persamaan batasan kecerahan optis: I_x * u + I_y * v + I_t = 0.",
          "Mengimplementasikan Lucas-Kanade Optical Flow sparse berbasis solusi Least Squares matriks gradien 2x2.",
          "Menganalisis masalah bukaan (aperture problem) dan mitigasi perpindahan besar menggunakan piramida citra Gaussian.",
          "Membangun visualisasi medan vektor kecepatan gerak 2D dan peta warna rona sudut arah (HSV flow map)."
        ]
      }
    ]
  },
  {
    id: "07",
    title: "Video Analysis & Tracking",
    chapters: [
      {
        id: "31",
        title: "Background Subtraction & Motion Detection",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["video-processing-tracking"],
        description: "Mengembangkan algoritma segmentasi latar belakang (Background Subtraction): Frame Differencing sederhana, running average background model, Gaussian Mixture Models (MOG2) untuk latar dinamis, supresi bayangan kroma, serta pembersihan mask morfologis.",
        learningObjectives: [
          "Memformulasikan model estimasi background statis dan adaptif: B_t = (1 - alpha) * B_{t-1} + alpha * I_t.",
          "Memahami arsitektur Gaussian Mixture Models (cv2.createBackgroundSubtractorMOG2) untuk menangani variasi pencahayaan dan daun bergoyang.",
          "Menerapkan diskriminasi bayangan berbasis ruang warna kroma/luminansi untuk mencegah penggabungan objek palsu.",
          "Mengoperasikan operasi morfologi opening dan closing serta Connected Components Analysis untuk ekstraksi bounding box objek bergerak."
        ]
      },
      {
        id: "32",
        title: "Object Tracking Fundamentals",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["video-processing-tracking"],
        description: "Memahami paradigma penjejakan objek tunggal: Tracking-by-Detection, pelacak korelasi visual (Kernelized Correlation Filters - KCF, CSRT), estimasi keadaan stokastik dengan 2D Kalman Filter (kecepatan linier konstan), dan penanganan oklusi sementara.",
        learningObjectives: [
          "Membedakan pelacak generatif, diskriminatif berbasis korelasi (KCF/CSRT), dan estimasi probabilistik (Kalman Filter).",
          "Menurunkan persamaan siklus Kalman Filter 2D: tahap Prediksi (state transition, kovarians P) dan Pembaruan (Kalman Gain K, inovasi residu).",
          "Mengintegrasikan detektor bounding box dengan Kalman Filter untuk pelacakan objek mulus tahan gangguan sensor.",
          "Mengevaluasi strategi penanganan oklusi (occlusion recovery) saat pengukuran visual hilang sementara."
        ]
      },
      {
        id: "33",
        title: "Multi-Object Tracking",
        difficulty: "advanced",
        duration: 150,
        tracks: ["video-processing-tracking"],
        description: "Menguasai arsitektur penjejakan multi-objek (MOT): paradigma Tracking-by-Detection, matriks biaya asosiasi data IoU (Intersection-over-Union), algoritma Hungarian (Munkres) untuk bipartite matching optimal, arsitektur SORT (Simple Online and Realtime Tracking), serta DeepSORT dengan visual feature embedding.",
        learningObjectives: [
          "Memformulasikan permasalahan asosiasi data multi-target sebagai bipartite matching berbasis matriks biaya 1 - IoU.",
          "Menerapkan Algoritma Hungarian untuk penugasan optimal antara prediksi deteksi baru dan track yang aktif.",
          "Membangun siklus hidup track (track lifecycle state machine: Tentative -> Confirmed -> Deleted) untuk mencegah ID switch.",
          "Memahami integrasi embedding fitur visual Deep Re-ID (DeepSORT) untuk menjaga kontinuitas identitas saat oklusi berkepanjangan."
        ]
      },
      {
        id: "34",
        title: "Video Event & Activity Analysis",
        difficulty: "advanced",
        duration: 150,
        tracks: ["video-processing-tracking"],
        description: "Menganalisis kejadian spasio-temporal dan aktivitas pada video: garis virtual tripwire crossing dengan uji orientasi titik-vektor 2D, zona polygon ROI intrusi (Ray Casting), perhitungan arah gerak dan kecepatan, serta agregasi metrik analitik dan ekspor log CSV.",
        learningObjectives: [
          "Merumuskan uji orientasi geometri perkalian silang 2D (cross product) untuk mendeteksi perpotongan garis virtual (tripwire).",
          "Menerapkan algoritma Ray Casting (Point-in-Polygon) untuk memverifikasi pelanggaran batas zona ROI terlarang.",
          "Menghitung metrik aktivitas: estimasi kecepatan rata-rata (piksel/detik ke meter/detik) dan arah vektor lintasan.",
          "Mengotomatisasi pencatatan event log (timestamp, track ID, event type, koordinat) dengan kemampuan ekspor CSV."
        ]
      },
      {
        id: "35",
        title: "Video Processing Application Project",
        difficulty: "advanced",
        duration: 180,
        tracks: ["video-processing-tracking"],
        description: "Merancang dan membangun sistem Video Analytics cerdas terpadu end-to-end: Pipeline Video Feed -> Background Subtraction -> Multi-Object Tracking -> Analisis Garis Tripwire & ROI Event -> Penghitungan Metrik & Visualisasi Dashboard -> Ekspor Data Analitik, serta teknik optimasi throughput pada perangkat edge.",
        learningObjectives: [
          "Merancang arsitektur sistem analitik video modular berkinerja tinggi (High-Throughput Video Pipeline).",
          "Mengintegrasikan deteksi objek bergerak, filter pelacak multi-target Kalman, dan aturan spasial ROI ke dalam satu alur eksekusi.",
          "Menyediakan antarmuka dashboard analitik dengan visualisasi live feedback, grafik metrik, dan ekspor dataset log.",
          "Menganalisis profiling performa sistem (latensi per frame, penggunaan memori) dan strategi akselerasi komputasi edge."
        ]
      }
    ]
  },
  {
    id: "08",
    title: "Classical Computer Vision",
    chapters: [
      {
        id: "36",
        title: "Computer Vision Foundations & Image Geometry",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Mempelajari geometri citra 2D, koordinat kartesian vs matriks citra, koordinat homogen proyektif, matriks transformasi afinitas (translasi, rotasi, skala, shear), warping perspektif (homografi), serta interpolasi bilinear.",
        learningObjectives: [
          "Memahami perbedaan sistem koordinat piksel array 2D dengan koordinat spasial Kartesian kontinu.",
          "Menurunkan matriks transformasi afinitas 2D (6 DoF) dan homografi perspektif (8 DoF).",
          "Mengimplementasikan image warping mandiri dengan interpolasi bilinear dan inversi matriks 3x3.",
          "Menganalisis galat transformasi geometris dan strategi pemetaan batas citra."
        ]
      },
      {
        id: "37",
        title: "Feature Detection, Description & Matching",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Mengeksplorasi deteksi titik minat (interest points) Harris Corner, kriteria Shi-Tomasi, deskriptor invariant SIFT/ORB, pencocokan fitur Brute-Force/KNN, Lowe's Ratio Test, serta eliminasi outlier menggunakan RANSAC.",
        learningObjectives: [
          "Menurunkan matriks struktur autokorelasi lokal spasial M dan fungsi respon sudut Harris R.",
          "Membedakan sifat invariansi skala dan rotasi pada deskriptor SIFT, SURF, dan ORB.",
          "Mengimplementasikan pencocokan fitur kueri-target menggunakan uji rasio jarak tetangga Lowe (Lowe's Ratio Test).",
          "Menerapkan algoritma RANSAC untuk estimasi matriks homografi yang tangguh terhadap korespondensi palsu (outliers)."
        ]
      },
      {
        id: "38",
        title: "Camera Calibration & Perspective Transformation",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision"],
        description: "Mengkaji model kamera pinhole, matriks intrinsik K, parameter ekstrinsik rotasi-translasi [R|t], distorsi lensa radial/tangensial model Brown-Conrady, estimasi kalibrasi Zhang, dan evaluasi reprojection error.",
        learningObjectives: [
          "Memformulasikan proyeksi perspektif titik 3D dunia ke bidang sensor piksel 2D: p = K[R|t]P_w.",
          "Memahami pemodelan distorsi lensa radial (barrel, pincushion) dan distorsi tangensial.",
          "Menguasai alur kalibrasi kamera menggunakan pola papan catur (cv2.calibrateCamera).",
          "Menghitung dan mengevaluasi Root Mean Square Error (RMSE) reprojeksi sebagai metrik akurasi kalibrasi."
        ]
      },
      {
        id: "39",
        title: "Stereo Vision & Depth Estimation",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision"],
        description: "Menganalisis geometri epipolar kamera stereo, matriks fundamental F dan esensial E, rektifikasi bidang citra, pencocokan blok korespondensi (SAD/SSD), peta disparitas, serta triangulasi kedalaman fisik Z = (f * B) / d.",
        learningObjectives: [
          "Memahami prinsip geometri epipolar stereo dan batasan garis epipolar: x_R^T * F * x_L = 0.",
          "Melakukan rektifikasi citra stereo untuk menyelaraskan garis epipolar secara horisontal.",
          "Membangun algoritma Block Matching untuk menghasilkan peta disparitas spasial (Disparity Map).",
          "Menghitung jarak kedalaman fisik 3D objek berdasarkan baseline B, focal length f, dan disparitas d."
        ]
      },
      {
        id: "40",
        title: "Classical Object Recognition & Scene Analysis",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Mempelajari pengenalan objek klasik: Template Matching Normalized Cross-Correlation (NCC), deskriptor HOG (Histogram of Oriented Gradients), normalisasi blok L2, klasifikasi Linear SVM, dan representasi spasial piramida citra.",
        learningObjectives: [
          "Mengimplementasikan Template Matching berbasis Normalized Cross-Correlation (NCC) tahan variasi intensitas.",
          "Menurunkan alur ekstraksi fitur HOG: gradien spasial, voting 9 bin orientasi, dan normalisasi blok 2x2.",
          "Melatih pengklasifikasi objek klasik (Support Vector Machines - SVM) pada vektor fitur HOG.",
          "Mengevaluasi trade-off pengenal fitur buatan tangan (handcrafted features) vs representasi Deep Learning."
        ]
      }
    ]
  },
  {
    id: "09",
    title: "Deep Learning for Computer Vision",
    chapters: [
      {
        id: "41",
        title: "Deep Learning Foundations for Vision",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Memahami fondasi Deep Learning visi komputer: representasi tensor citra 4D (N, C, H, W), konvolusi 2D, fungsi aktivasi non-linier (ReLU/LeakyReLU), subsampling Max Pooling, propagasi maju/mundur, dan optimasi gradien.",
        learningObjectives: [
          "Memahami representasi tensor citra batch multi-kanal (NCHW vs NHWC).",
          "Menurunkan operasi konvolusi 2D multi-kanal, penghitungan receptive field, stride, dan padding.",
          "Membandingkan karakteristik fungsi aktivasi (ReLU, Sigmoid, GELU) dalam mitigasi vanishing gradient.",
          "Menganalisis peranan lapisan pooling dan konvolusi ber-stride dalam reduksi dimensi spasial."
        ]
      },
      {
        id: "42",
        title: "Image Classification with CNN",
        difficulty: "intermediate",
        duration: 150,
        tracks: ["computer-vision", "multimodal-ai"],
        description: "Mengkaji arsitektur klasifikasi citra konvolusional: lapisan konvolusi hierarkis, Global Average Pooling, fungsi Softmax multi-kelas, Categorical Cross-Entropy Loss, metrik Top-1/Top-5, dan evaluasi matriks konfusi.",
        learningObjectives: [
          "Merancang arsitektur CNN terstruktur (Backbone ekstraksi fitur + Classification Head).",
          "Memformulasikan fungsi aktivasi Softmax terstabilkan numerik dan Cross-Entropy Loss.",
          "Menerapkan pipeline pelatihan end-to-end: augmentasi data, regularisasi Dropout, dan validasi silang.",
          "Mengevaluasi akurasi inferensi model menggunakan metrik Accuracy, Precision, Recall, dan F1-Score."
        ]
      },
      {
        id: "43",
        title: "Transfer Learning & Fine-Tuning",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Menguasai transfer learning untuk efisiensi pelatihan model visi: pemanfaatan pretrained backbone (ImageNet), pembekuan bobot (frozen feature extraction), fine-tuning selektif, dan penjadwalan learning rate bertingkat.",
        learningObjectives: [
          "Memahami prinsip domain transfer representasi visual dari dataset besar (ImageNet) ke tugas spesifik.",
          "Membedakan strategi Fixed Feature Extractor (bobot beku) vs Fine-Tuning diferensial.",
          "Merancang penjadwalan laju pembelajaran (discriminative learning rates) untuk menjaga kestabilan bobot awal.",
          "Mengevaluasi kompromi antara waktu komputasi pelatihan, jumlah data latih, dan risiko overfitting."
        ]
      },
      {
        id: "44",
        title: "Object Detection with YOLO",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision", "realtime-edge-vision"],
        description: "Mempelajari deteksi objek real-time paradigma YOLO: pembagian grid sel, decoding koordinat bounding box, skor objectness, penyaringan duplikasi Non-Maximum Suppression (NMS), dan evaluasi mAP50-95.",
        learningObjectives: [
          "Memahami evolusi deteksi satu tahap (single-stage) YOLO dibandingkan detektor dua tahap (Faster R-CNN).",
          "Menurunkan representasi tensor output detektor: koordinat [x, y, w, h], skor objectness, dan probabilitas kelas.",
          "Mengimplementasikan algoritma Non-Maximum Suppression (NMS) berbasis Intersection-over-Union (IoU).",
          "Menghitung metrik evaluasi deteksi objek standar industri: mean Average Precision (mAP@0.50 dan mAP@0.50:0.95)."
        ]
      },
      {
        id: "45",
        title: "Semantic & Instance Segmentation",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision"],
        description: "Mendalami segmentasi citra: segmentasi semantik (U-Net, DeepLab), segmentasi instansi (Mask R-CNN), koneksi skip enkoder-dekoder, atrous/dilated convolution, serta metrik evaluasi mIoU dan Dice Coefficient.",
        learningObjectives: [
          "Membedakan taksonomi segmentasi citra: Semantik, Instansi, dan Panoptik.",
          "Memahami arsitektur U-Net dan peranan skip connections dalam mempertahankan detail spasial resolusi tinggi.",
          "Mengevaluasi segmentasi biner dan multi-kelas menggunakan metrik Mean IoU (Jaccard Index) dan Dice Score.",
          "Mengimplementasikan visualisasi mask overlay warna transparan pada citra asli secara efisien."
        ]
      }
    ]
  },
  {
    id: "10",
    title: "Advanced Computer Vision",
    chapters: [
      {
        id: "46",
        title: "Vision Transformers",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision", "multimodal-ai"],
        description: "Mengkaji arsitektur Vision Transformer (ViT): tokenisasi citra menjadi deret patch PxP, proyeksi linear patch embedding, positional encoding, multi-head self-attention, dan perbandingan dengan representasi lokal CNN.",
        learningObjectives: [
          "Memahami pergeseran paradigma dari konvolusi spasial lokal menuju mekanisme atensi global Vision Transformer.",
          "Menguraikan proses tokenisasi citra (Image Patching) dan penambahan [CLS] token serta Positional Embedding.",
          "Menurunkan komputasi Scaled Dot-Product Self-Attention: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V.",
          "Menganalisis matriks peta atensi (Attention Rollout) untuk interpretabilitas fokus spasial model."
        ]
      },
      {
        id: "47",
        title: "Human Pose Estimation & Landmark Detection",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision"],
        description: "Mempelajari estimasi pose manusia 2D: topologi 17 keypoint skeletal COCO, regresi heatmap Gaussian vs regresi koordinat langsung, metrik Object Keypoint Similarity (OKS), dan filter penghalusan temporal.",
        learningObjectives: [
          "Memahami representasi graf skeletal persendian tubuh manusia standar COCO 17 keypoints.",
          "Membandingkan metode prediksi berbasis Heatmap Gaussian 2D terhadap regresi koordinat numerik langsung.",
          "Menghitung metrik evaluasi akurasi pose Object Keypoint Similarity (OKS) dan PCKh.",
          "Menerapkan penapis temporal penghalus koordinat (exponential smoothing) untuk eliminasi jitter visual."
        ]
      },
      {
        id: "48",
        title: "3D Vision & Scene Reconstruction",
        difficulty: "advanced",
        duration: 180,
        tracks: ["computer-vision"],
        description: "Mengurai rekonstruksi 3D dari citra 2D: Structure from Motion (SfM), triangulasi sinar optis terkalibrasi, estimasi awan titik (point cloud), rotasi kamera 3D, dan optimasi bundle adjustment non-linier.",
        learningObjectives: [
          "Memahami representasi data 3D: Depth Maps, Point Clouds, Voxel Grids, dan Polygonal Meshes.",
          "Menguasai alur Structure from Motion (SfM) dari korespondensi fitur multi-sudut pandang.",
          "Menurunkan formulasi triangulasi sinar optis linier untuk memproyeksikan titik 3D dunia.",
          "Mengimplementasikan visualisasi proyeksi awan titik 3D dengan rotasi perspektif kamera."
        ]
      },
      {
        id: "49",
        title: "Self-Supervised & Foundation Vision Models",
        difficulty: "advanced",
        duration: 150,
        tracks: ["computer-vision"],
        description: "Mempelajari pembelajaran representasi visual mandiri (Self-Supervised Learning): loss kontrastif InfoNCE (SimCLR, MoCo), model fondasi visual CLIP, ruang embedding bersama, dan zero-shot classification.",
        learningObjectives: [
          "Memahami prinsip Self-Supervised Learning tanpa anotasi manual melalui tugas preteks.",
          "Menurunkan fungsi kerugian kontrastif InfoNCE untuk memaksimalkan kesamaan representasi positif.",
          "Memahami arsitektur multimodal CLIP yang menyelaraskan embedding citra dan teks ke ruang bersama.",
          "Menerapkan klasifikasi visual Zero-Shot berbasis Cosine Similarity teks kueri bahasa alami."
        ]
      },
      {
        id: "50",
        title: "Advanced Vision Model Evaluation",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["computer-vision"],
        description: "Menyusun kerangka evaluasi komprehensif sistem visi komputer: Matriks Konfusi multi-kelas, kurva Precision-Recall, mAP50-95, kalibrasi probabilitas ECE, serta profil latensi dan throughput inferensi edge.",
        learningObjectives: [
          "Merancang matriks konfusi multi-kelas dan menghitung metrik diagnostik (Accuracy, Macro Precision, Recall, F1).",
          "Membangun kurva Precision-Recall dan menginterpolasi 11-titik untuk estimasi Average Precision (AP).",
          "Menganalisis kalibrasi keyakinan model visi menggunakan diagram reliabilitas dan Expected Calibration Error (ECE).",
          "Mengukur profil kinerja inferensi: latensi per frame (ms), throughput (FPS), dan efisiensi memori model."
        ]
      }
    ]
  },
  {
    id: "11",
    title: "Multimodal AI",
    chapters: [
      {
        id: "51",
        title: "Introduction to Multimodal AI",
        difficulty: "intermediate",
        duration: 120,
        tracks: ["multimodal-ai"],
        description: "Memahami taksonomi modalitas sensorik (visual, akustik, tekstual), tiga paradigma fusi (Early Concatenation, Intermediate Cross-Attention, Late Ensemble), serta teknik kalibrasi probabilitas keputusan.",
        learningObjectives: [
          "Mendefinisikan ruang lingkup dan motivasi arsitektural kecerdasan buatan multimodal.",
          "Menganalisis perbedaan komparatif antara Early Fusion, Intermediate Fusion, dan Late Fusion.",
          "Menerapkan mekanisme Cross-Modal Attention untuk pemetaan representasi visual dan audio.",
          "Mengkalibrasi fungsi distribusi probabilitas menggunakan Softmax terbobot temperatur.",
          "Mengimplementasikan pipeline fusi multimodal komputasional menggunakan pustaka Python."
        ]
      },
      {
        id: "52",
        title: "Vision-Language Models",
        difficulty: "advanced",
        duration: 150,
        tracks: ["multimodal-ai"],
        description: "Mengkaji arsitektur Vision-Language terkini (CLIP, ALIGN, BLIP), pra-latihan kontrastif citra-teks (InfoNCE), teknik prompt engineering kontekstual, dan inferensi klasifikasi zero-shot.",
        learningObjectives: [
          "Memahami arsitektur dual-encoder pada model Vision-Language seperti CLIP.",
          "Menghitung fungsi rugi kontrastif multi-modalitas simetris (Symmetric Contrastive Loss).",
          "Merumuskan prompt teks hipotesis terstruktur untuk pengenalan visual berbasis bahasa alami.",
          "Mengevaluasi keputusan klasifikasi zero-shot menggunakan metrik Cosine Similarity.",
          "Mengimplementasikan verifikasi numerik inferensi zero-shot CLIP dengan Python."
        ]
      },
      {
        id: "53",
        title: "Audio-Visual Learning & Fusion",
        difficulty: "advanced",
        duration: 150,
        tracks: ["multimodal-ai"],
        description: "Mendalami sinergi modalitas audio dan visual: sinkronisasi temporal (Cross-Correlation & Lip-Sync), pelokalisasian spasial sumber suara, peningkatan wicara bimodal tahan derau, dan pengenalan aksi terkoordinasi.",
        learningObjectives: [
          "Menganalisis korespondensi temporal dan spasial antara sinyal audio akustik dan bingkai visual.",
          "Menghitung korelasi silang (cross-correlation) untuk mendeteksi pergeseran lag temporal (Δt).",
          "Mengevaluasi ketahanan akurasi model bimodal terhadap degradasi derau akustik dan oklusi visual.",
          "Menerapkan arsitektur atensi silang audio-visual untuk pemisahan sumber suara.",
          "Mengimplementasikan deteksi sinkronisasi audio-visual deterministik menggunakan Python."
        ]
      },
      {
        id: "54",
        title: "Multimodal Embeddings & Retrieval",
        difficulty: "advanced",
        duration: 150,
        tracks: ["multimodal-ai"],
        description: "Mengeksplorasi penelusuran semantik lintas-modalitas (Cross-Modal Search): pencarian teks-ke-citra, citra-ke-audio, topologi ruang metrik bersama, perancangan indeks vektor, serta metrik Recall@K dan MRR.",
        learningObjectives: [
          "Merancang ruang metrik bersama (Joint Metric Embedding Space) dengan representasi ternormalisasi L2.",
          "Membuktikan hubungan matematis antara jarak Euclidean dan kesamaan kosinus dalam ruang berdimensi tinggi.",
          "Menghitung metrik evaluasi pencarian terstandarisasi: Precision@K, Recall@K, dan Mean Reciprocal Rank (MRR).",
          "Menganalisis struktur pengindeksan vektor untuk penelusuran multimedia berskala besar.",
          "Mengimplementasikan mesin pencarian lintas-modalitas teks-ke-media menggunakan Python."
        ]
      },
      {
        id: "55",
        title: "Multimodal Application Development",
        difficulty: "advanced",
        duration: 180,
        tracks: ["multimodal-ai"],
        description: "Merancang dan membangun arsitektur sistem kecerdasan buatan multimodal skala industri: pipeline multi-sensor terdistribusi, kuantisasi model (FP16/INT8), penanganan sensor dropout, dan telemetri edge real-time.",
        learningObjectives: [
          "Merancang arsitektur sistem multimodal modular untuk pemantauan klinis, SAR otonom, dan transportasi.",
          "Menerapkan mekanisme toleransi kesalahan terhadap kehilangan sinyal sensor (modality dropout).",
          "Mengoptimalkan throughput inferensi dan latensi melalui kuantisasi numerik (FP16/INT8).",
          "Mengekspor laporan telemetri kuantitatif status sistem secara terstandarisasi.",
          "Mengimplementasikan pipeline inferensi terintegrasi end-to-end yang tangguh pada edge computing."
        ]
      }
    ]
  },
  {
    id: "12",
    title: "Multimedia Systems & Capstone",
    chapters: [
      { id: "56", title: "Real-Time Multimedia Processing", difficulty: "advanced", duration: 150, tracks: ["realtime-edge-vision"] },
      { id: "57", title: "Edge AI & Embedded Computer Vision", difficulty: "advanced", duration: 150, tracks: ["realtime-edge-vision"] },
      { id: "58", title: "Multimedia Web Applications & APIs", difficulty: "advanced", duration: 150, tracks: ["realtime-edge-vision"] },
      { id: "59", title: "Performance Optimization & Deployment", difficulty: "advanced", duration: 150, tracks: ["realtime-edge-vision"] },
      { id: "60", title: "Integrated Multimedia & Computer Vision Capstone", difficulty: "advanced", duration: 240, tracks: ["realtime-edge-vision"] }
    ]
  }
];

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const publishedIds = new Set([
  "01", "02", "03", "04", "05",
  "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15",
  "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25",
  "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35",
  "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45",
  "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55"
]);
const allChapters = [];

sections.forEach((sec) => {
  sec.chapters.forEach((ch) => {
    const prevChapterId = allChapters.length > 0 ? allChapters[allChapters.length - 1].id : null;
    const prerequisites = [];
    if (prevChapterId && !["01", "06", "11", "16", "21", "26", "31", "36", "41", "46", "51", "56"].includes(ch.id)) {
      prerequisites.push(prevChapterId);
    }
    if (ch.id === "02") prerequisites.push("01");
    if (ch.id === "03") prerequisites.push("01", "02");
    if (ch.id === "04") prerequisites.push("01");
    if (ch.id === "05") prerequisites.push("01", "04");
    if (ch.id === "06") prerequisites.push("02", "05");
    if (ch.id === "08") {
      prerequisites.length = 0;
      prerequisites.push("06", "07");
    }
    if (ch.id === "10") {
      prerequisites.length = 0;
      prerequisites.push("06", "08");
    }
    if (ch.id === "11") prerequisites.push("02", "10");
    if (ch.id === "12") {
      prerequisites.length = 0;
      prerequisites.push("10", "11");
    }
    if (ch.id === "13") {
      prerequisites.length = 0;
      prerequisites.push("10");
    }
    if (ch.id === "14") {
      prerequisites.length = 0;
      prerequisites.push("06", "10");
    }
    if (ch.id === "15") {
      prerequisites.length = 0;
      prerequisites.push("09", "14");
    }
    if (ch.id === "26") {
      prerequisites.push("01", "06");
    }
    if (ch.id === "27") {
      prerequisites.length = 0;
      prerequisites.push("26");
    }
    if (ch.id === "28") {
      prerequisites.length = 0;
      prerequisites.push("26", "27");
    }
    if (ch.id === "29") {
      prerequisites.length = 0;
      prerequisites.push("10", "27");
    }
    if (ch.id === "30") {
      prerequisites.length = 0;
      prerequisites.push("10", "29");
    }
    if (ch.id === "31") {
      prerequisites.push("10", "27");
    }
    if (ch.id === "32") {
      prerequisites.length = 0;
      prerequisites.push("30", "31");
    }
    if (ch.id === "33") {
      prerequisites.length = 0;
      prerequisites.push("32");
    }
    if (ch.id === "34") {
      prerequisites.length = 0;
      prerequisites.push("33");
    }
    if (ch.id === "35") {
      prerequisites.length = 0;
      prerequisites.push("31", "33", "34");
    }
    if (ch.id === "36") {
      prerequisites.push("06", "10");
    }
    if (ch.id === "37") {
      prerequisites.length = 0;
      prerequisites.push("10", "36");
    }
    if (ch.id === "38") {
      prerequisites.length = 0;
      prerequisites.push("36", "37");
    }
    if (ch.id === "39") {
      prerequisites.length = 0;
      prerequisites.push("38");
    }
    if (ch.id === "40") {
      prerequisites.length = 0;
      prerequisites.push("10", "37");
    }
    if (ch.id === "41") {
      prerequisites.push("10", "40");
    }
    if (ch.id === "42") {
      prerequisites.length = 0;
      prerequisites.push("41");
    }
    if (ch.id === "43") {
      prerequisites.length = 0;
      prerequisites.push("42");
    }
    if (ch.id === "44") {
      prerequisites.length = 0;
      prerequisites.push("42", "43");
    }
    if (ch.id === "45") {
      prerequisites.length = 0;
      prerequisites.push("42", "44");
    }
    if (ch.id === "46") {
      prerequisites.push("41", "42");
    }
    if (ch.id === "47") {
      prerequisites.length = 0;
      prerequisites.push("44", "45");
    }
    if (ch.id === "48") {
      prerequisites.length = 0;
      prerequisites.push("38", "39");
    }
    if (ch.id === "49") {
      prerequisites.length = 0;
      prerequisites.push("43", "46");
    }
    if (ch.id === "50") {
      prerequisites.length = 0;
      prerequisites.push("42", "44", "45");
    }
    if (ch.id === "51") {
      prerequisites.push("25", "43", "49");
    }
    if (ch.id === "52") {
      prerequisites.length = 0;
      prerequisites.push("49", "51");
    }
    if (ch.id === "53") {
      prerequisites.length = 0;
      prerequisites.push("24", "35", "51");
    }
    if (ch.id === "54") {
      prerequisites.length = 0;
      prerequisites.push("51", "52");
    }
    if (ch.id === "55") {
      prerequisites.length = 0;
      prerequisites.push("51", "52", "53", "54");
    }

    const isPublished = publishedIds.has(ch.id);
    allChapters.push({
      id: ch.id,
      slug: slugify(ch.title),
      title: ch.title,
      sectionId: sec.id,
      sectionTitle: sec.title,
      difficulty: ch.difficulty,
      durationMinutes: ch.duration,
      prerequisites,
      tracks: ch.tracks,
      keywords: [ch.title.toLowerCase(), sec.title.toLowerCase()],
      status: isPublished ? "published" : "draft",
      version: "1.1.0",
      lastUpdated: "2026-11-11",
      directory: `chapters/chapter-${ch.id}`,
      description: ch.description || `Materi komprehensif mengenai ${ch.title} dalam kurikulum ${sec.title}.`,
      learningObjectives: ch.learningObjectives || [
        `Memahami konsep fundamental ${ch.title}.`,
        `Menguasai formulasi matematis dan algoritma terkait.`,
        `Mampu mengimplementasikan algoritma menggunakan Python.`,
        `Menganalisis hasil eksperimen dan kasus praktis di dunia nyata.`
      ],
      resources: {
        reading: { status: isPublished ? "available" : "unavailable", path: "index.md" },
        slides: { status: isPublished ? "available" : "unavailable", path: "slides.json" },
        practice: { status: isPublished ? "available" : "unavailable", path: "examples/example-01.py" },
        exercises: { status: isPublished ? "available" : "unavailable", path: "exercises.json" },
        quiz: { status: isPublished ? "available" : "unavailable", path: "quiz.json" },
        references: { status: isPublished ? "available" : "unavailable", path: "references.json" },
        media: { status: isPublished ? "available" : "unavailable", path: "media.json" }
      }
    });
  });
});

const output = {
  institution: "Institut Teknologi Sumatera (ITERA)",
  author: "Aji Pamungkas Tri Nurcahyo",
  tagline: "From Digital Media to Intelligent Visual & Audio Systems",
  sections,
  chapters: allChapters
};

const targetDir = path.resolve('content/curriculum');
fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, 'master-curriculum.json'), JSON.stringify(output, null, 2), 'utf-8');
console.log(`Successfully generated master-curriculum.json with ${allChapters.length} chapters (${publishedIds.size} published).`);
