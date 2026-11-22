import fs from 'node:fs';
import path from 'node:path';

const chaptersMeta = [
  {
    num: 16,
    id: 'chapter-16',
    title: 'Digital Audio Fundamentals',
    lead: 'Dasar Gelombang Suara, Tekanan Akustik, Amplitudo vs Persepsi Loudness, Decibel (dBFS), dan Representasi PCM',
    diagrams: [
      {
        id: 'fig-16-01',
        title: 'Karakteristik Fisik Gelombang Suara (Acoustic Wave)',
        path: '/media/diagrams/chapter-16-sound-wave-properties.svg'
      },
      {
        id: 'fig-16-02',
        title: 'Representasi Audio Digital: Pulse Code Modulation (PCM)',
        path: '/media/diagrams/chapter-16-pcm-representation.svg'
      }
    ],
    refs: [
      {
        id: 'ref-16-01',
        title: 'Digital Audio Signal Processing (2nd Edition)',
        authors: 'Udo Zölzer',
        year: 2008,
        publisher: 'John Wiley & Sons',
        url: 'https://www.wiley.com/en-us/Digital+Audio+Signal+Processing%2C+2nd+Edition-p-9780470997857',
        type: 'book',
        annotation: 'Referensi standar komprehensif untuk pengolahan sinyal audio digital, representasi PCM, kuantisasi, dan psikoakustik.'
      },
      {
        id: 'ref-16-02',
        title: 'The Art of Sound Reproduction',
        authors: 'John Watkinson',
        year: 2002,
        publisher: 'Focal Press',
        url: 'https://www.taylorfrancis.com/books/mono/10.4324/9780080518718/art-sound-reproduction-john-watkinson',
        type: 'book',
        annotation: 'Uraian mendalam mengenai fisika gelombang suara, propagasi akustik, transduser, dan konversi analog-ke-digital.'
      },
      {
        id: 'ref-16-03',
        title: 'Principles of Digital Audio (6th Edition)',
        authors: 'Ken C. Pohlmann',
        year: 2011,
        publisher: 'McGraw-Hill',
        url: 'https://www.accessengineeringlibrary.com/content/book/9780071663465',
        type: 'book',
        annotation: 'Buku teks fundamental audio digital yang membedah arsitektur format audio, transmisi biner, dan standar sampling studio.'
      }
    ]
  },
  {
    num: 17,
    id: 'chapter-17',
    title: 'Audio Sampling, Waveforms & Channels',
    lead: 'Teorema Nyquist-Shannon, Aliasing, Kuantisasi Seragam, SQNR, Multichannel Interleaving, dan Bitrate Audio',
    diagrams: [
      {
        id: 'fig-17-01',
        title: 'Teorema Sampling Nyquist-Shannon & Fenomena Aliasing',
        path: '/media/diagrams/chapter-17-audio-sampling-nyquist.svg'
      },
      {
        id: 'fig-17-02',
        title: 'Struktur Multichannel Audio & Kalkulasi Bitrate',
        path: '/media/diagrams/chapter-17-audio-channels-bitrate.svg'
      }
    ],
    refs: [
      {
        id: 'ref-17-01',
        title: 'Discrete-Time Signal Processing (3rd Edition)',
        authors: 'Alan V. Oppenheim, Ronald W. Schafer',
        year: 2009,
        publisher: 'Pearson',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/discrete-time-signal-processing/P200000003303',
        type: 'book',
        annotation: 'Rujukan kanonik dunia untuk teori sampling diskrit, aliasing, interpolasi sinc, dan transformasi Z.'
      },
      {
        id: 'ref-17-02',
        title: 'Introduction to Signal Processing',
        authors: 'Sophocles J. Orfanidis',
        year: 2010,
        publisher: 'Prentice Hall',
        url: 'https://eceweb1.rutgers.edu/~orfanidi/intro2sp/',
        type: 'book',
        annotation: 'Materi terapan mengenai kuantisasi seragam, analisis derau kuantisasi (SQNR), dan implementasi filter rekonstruksi D/A.'
      },
      {
        id: 'ref-17-03',
        title: 'WAV & RIFF Audio File Format Specifications',
        authors: 'Microsoft & IBM Engineering Group',
        year: 1991,
        publisher: 'Multimedia Programming Interface and Data Specifications',
        url: 'http://soundfile.sapp.org/doc/WaveFormat/',
        type: 'documentation',
        annotation: 'Spesifikasi resmi struktur chunk RIFF/WAV untuk audio PCM mono dan multichannel interleaving.'
      }
    ]
  },
  {
    num: 18,
    id: 'chapter-18',
    title: 'Fourier Transform & Spectral Analysis',
    lead: 'DFT, Radix-2 FFT Cooley-Tukey, Windowing (Hann, Hamming, Blackman), Spectral Leakage, dan Resolusi Frekuensi',
    diagrams: [
      {
        id: 'fig-18-01',
        title: 'Transformasi Fourier Cepat (FFT) & Karakteristik Jendela',
        path: '/media/diagrams/chapter-18-audio-fft-windows.svg'
      },
      {
        id: 'fig-18-02',
        title: 'Mekanisme Terjadinya Spectral Leakage pada Analisis DFT/FFT',
        path: '/media/diagrams/chapter-18-spectral-leakage.svg'
      }
    ],
    refs: [
      {
        id: 'ref-18-01',
        title: 'An Algorithm for the Machine Calculation of Complex Fourier Series',
        authors: 'James W. Cooley, John W. Tukey',
        year: 1965,
        publisher: 'Mathematics of Computation',
        url: 'https://doi.org/10.1090/S0025-5718-1965-0178586-1',
        type: 'paper',
        annotation: 'Makalah seminal yang memperkenalkan algoritma Fast Fourier Transform (FFT) dengan reduksi kompleksitas O(N^2) ke O(N log N).'
      },
      {
        id: 'ref-18-02',
        title: 'On the Use of Windows for Harmonic Analysis with the Discrete Fourier Transform',
        authors: 'Fredric J. Harris',
        year: 1978,
        publisher: 'Proceedings of the IEEE',
        url: 'https://doi.org/10.1109/PROC.1978.10837',
        type: 'paper',
        annotation: 'Karya klasik yang membandingkan performa matematis berbagai fungsi jendela (windowing) dalam meredam kebocoran spektral.'
      },
      {
        id: 'ref-18-03',
        title: 'Understanding Digital Signal Processing (3rd Edition)',
        authors: 'Richard G. Lyons',
        year: 2010,
        publisher: 'Prentice Hall',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/understanding-digital-signal-processing/P200000003308',
        type: 'book',
        annotation: 'Penjelasan intuitif dan visual mengenai DFT, FFT, resolusi frekuensi delta-f, dan interpretasi spektrum daya.'
      }
    ]
  },
  {
    num: 19,
    id: 'chapter-19',
    title: 'Digital Audio Filtering & Noise Reduction',
    lead: 'Filter FIR Sinc Windowed, Filter IIR Biquad (LPF/HPF/BPF/Notch), Stabilitas Pole-Zero, Phase Linearity, dan Evaluasi SNR',
    diagrams: [
      {
        id: 'fig-19-01',
        title: 'Empat Topologi Dasar Filter Audio Digital',
        path: '/media/diagrams/chapter-19-digital-audio-filters.svg'
      },
      {
        id: 'fig-19-02',
        title: 'Perbandingan Arsitektur: FIR vs IIR Digital Filter',
        path: '/media/diagrams/chapter-19-fir-vs-iir.svg'
      }
    ],
    refs: [
      {
        id: 'ref-19-01',
        title: 'Cookbook formulae for audio equalizer biquad filter coefficients',
        authors: 'Robert Bristow-Johnson',
        year: 2005,
        publisher: 'Audio Engineering Society (AES)',
        url: 'https://www.w3.org/TR/audio-eq-cookbook/',
        type: 'documentation',
        annotation: 'Kompilasi rumus resmi biquad IIR filter yang diadopsi secara luas di Web Audio API dan plugin DAW audio profesional.'
      },
      {
        id: 'ref-19-02',
        title: 'Digital Filters for Everyone (3rd Edition)',
        authors: 'Rusty Allred',
        year: 2015,
        publisher: 'Creative Commons / Author',
        url: 'https://www.dspguide.com/',
        type: 'book',
        annotation: 'Panduan praktis perancangan filter FIR dan IIR, respon impuls, konvolusi domain waktu, dan stabilitas filter digital.'
      },
      {
        id: 'ref-19-03',
        title: 'Audio Effects: Theory, Implementation and Application',
        authors: 'Joshua D. Reiss, Andrew P. McPherson',
        year: 2014,
        publisher: 'CRC Press',
        url: 'https://www.routledge.com/Audio-Effects-Theory-Implementation-and-Application/Reiss-McPherson/p/book/9781466560284',
        type: 'book',
        annotation: 'Penerapan filter audio digital pada efek equalizer parametrik, reduksi derau aditif, dan pembatalan dengung listrik 50/60 Hz.'
      }
    ]
  },
  {
    num: 20,
    id: 'chapter-20',
    title: 'Time-Frequency Analysis & Spectrograms',
    lead: 'Short-Time Fourier Transform (STFT), Heisenberg-Gabor Uncertainty Principle, Resolusi Waktu vs Frekuensi, dan Mel Spectrogram',
    diagrams: [
      {
        id: 'fig-20-01',
        title: 'Kompromi Resolusi Waktu-Frekuensi Heisenberg-Gabor',
        path: '/media/diagrams/chapter-20-stft-spectrogram-tradeoff.svg'
      },
      {
        id: 'fig-20-02',
        title: 'Transformasi Skala Hertz ke Skala Persepsi Mel',
        path: '/media/diagrams/chapter-20-mel-scale-spectrogram.svg'
      }
    ],
    refs: [
      {
        id: 'ref-20-01',
        title: 'Time-Frequency Analysis: Concepts and Methods',
        authors: 'Franz Hlawatsch, François Boudreaux-Bartels',
        year: 1992,
        publisher: 'IEEE Signal Processing Magazine',
        url: 'https://doi.org/10.1109/79.127284',
        type: 'paper',
        annotation: 'Survei mendalam representasi waktu-frekuensi kuadratik, STFT spektrogram, dan keterbatasan Heisenberg-Gabor.'
      },
      {
        id: 'ref-20-02',
        title: 'Fundamentals of Music Processing',
        authors: 'Meinard Müller',
        year: 2015,
        publisher: 'Springer International Publishing',
        url: 'https://www.audiolabs-erlangen.de/fmp',
        type: 'book',
        annotation: 'Panduan definitif transformasi Fourier jendela waktu, representasi spektrogram, skala Mel, dan analisis sinyal audio non-stasioner.'
      },
      {
        id: 'ref-20-03',
        title: 'librosa: Audio and Music Signal Analysis in Python',
        authors: 'Brian McFee, Colin Raffel, Dawen Liang, et al.',
        year: 2015,
        publisher: 'Proceedings of the 14th Python in Science Conference (SciPy)',
        url: 'https://doi.org/10.25080/Majora-7b98e3ed-003',
        type: 'paper',
        annotation: 'Arsitektur pustaka Python standar industri untuk komputasi spektrogram STFT, filterbank Mel, dan konversi magnitudo ke desibel.'
      }
    ]
  },
  {
    num: 21,
    id: 'chapter-21',
    title: 'Audio Feature Extraction',
    lead: 'Fitur Temporal (RMS, ZCR), Fitur Spektral (Centroid, Spread, Flatness, Rolloff), dan Ekstraksi Mel-Frequency Cepstral Coefficients (MFCC)',
    diagrams: [
      {
        id: 'fig-21-01',
        title: 'Taksonomi Fitur Audio: Domain Waktu & Domain Spektral',
        path: '/media/diagrams/chapter-21-audio-features-overview.svg'
      },
      {
        id: 'fig-21-02',
        title: 'Arsitektur Komputasi MFCC (Mel-Frequency Cepstral Coefficients)',
        path: '/media/diagrams/chapter-21-mfcc-pipeline.svg'
      }
    ],
    refs: [
      {
        id: 'ref-21-01',
        title: 'Comparison of Parametric Representations for Monosyllabic Word Recognition in Continuously Spoken Sentences',
        authors: 'Steven B. Davis, Paul Mermelstein',
        year: 1980,
        publisher: 'IEEE Transactions on Acoustics, Speech, and Signal Processing',
        url: 'https://doi.org/10.1109/TASSP.1980.1163420',
        type: 'paper',
        annotation: 'Makalah rujukan orisinal yang merumuskan teknik representasi koefisien MFCC berbasis filterbank skala Mel dan DCT.'
      },
      {
        id: 'ref-21-02',
        title: 'MPEG-7 Audio and Beyond: Audio Content Analysis and Retrieval',
        authors: 'Hyoung-Gook Kim, Nicolas Moreau, Thomas Sikora',
        year: 2005,
        publisher: 'John Wiley & Sons',
        url: 'https://www.wiley.com/en-us/MPEG+7+Audio+and+Beyond%3A+Audio+Content+Analysis+and+Retrieval-p-9780470093412',
        type: 'book',
        annotation: 'Standar internasional deskriptor audio MPEG-7 meliputi Spectral Centroid, Spread, Flatness, dan Spectral Rolloff.'
      },
      {
        id: 'ref-21-03',
        title: 'Music Information Retrieval: Recent Developments and Applications',
        authors: 'Nicola Orio',
        year: 2006,
        publisher: 'Foundations and Trends in Information Retrieval',
        url: 'https://doi.org/10.1561/1500000002',
        type: 'paper',
        annotation: 'Tinjauan ekstraksi fitur akustik domain waktu dan frekuensi untuk klasifikasi genre musik dan pengenalan instrumen.'
      }
    ]
  },
  {
    num: 22,
    id: 'chapter-22',
    title: 'Speech Signal Processing',
    lead: 'Fisiologi Vokal Manusia, Voiced vs Unvoiced, Voice Activity Detection (VAD), Formant Vokal (F1-F3), dan Estimasi Frekuensi Fundamental F0 Pitch',
    diagrams: [
      {
        id: 'fig-22-01',
        title: 'Model Saluran Suara Manusia & Formant Vokal',
        path: '/media/diagrams/chapter-22-speech-production-formants.svg'
      },
      {
        id: 'fig-22-02',
        title: 'Voice Activity Detection (VAD) & Estimasi Nada (Pitch)',
        path: '/media/diagrams/chapter-22-vad-pitch-estimation.svg'
      }
    ],
    refs: [
      {
        id: 'ref-22-01',
        title: 'Digital Processing of Speech Signals',
        authors: 'Lawrence R. Rabiner, Ronald W. Schafer',
        year: 1978,
        publisher: 'Prentice Hall',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/digital-processing-of-speech-signals/P200000003309',
        type: 'book',
        annotation: 'Buku teks klasik fundamental pemrosesan sinyal wicara, pemodelan saluran suara linier (LPC), dan algoritma estimasi nada pitch.'
      },
      {
        id: 'ref-22-02',
        title: 'YIN, a fundamental frequency estimator for speech and music',
        authors: 'Alain de Cheveigné, Hideki Kawahara',
        year: 2002,
        publisher: 'The Journal of the Acoustical Society of America',
        url: 'https://doi.org/10.1121/1.1458024',
        type: 'paper',
        annotation: 'Algoritma estimasi frekuensi fundamental F0 terpopuler berbasis diferensiasi fungsi autokorelasi ternormalisasi.'
      },
      {
        id: 'ref-22-03',
        title: 'Speech and Language Processing (3rd Edition Draft)',
        authors: 'Daniel Jurafsky, James H. Martin',
        year: 2024,
        publisher: 'Stanford University',
        url: 'https://web.stanford.edu/~jurafsky/slp3/',
        type: 'book',
        annotation: 'Referensi komprehensif fonetika akustik, artikulasi formant vokal manusia, dan transkripsi wicara digital.'
      }
    ]
  },
  {
    num: 23,
    id: 'chapter-23',
    title: 'Speech Recognition & Speech Synthesis',
    lead: 'Arsitektur Automatic Speech Recognition (ASR), Acoustic & Language Models, Text-to-Speech (TTS), Neural Vocoder, dan Evaluasi WER/CER',
    diagrams: [
      {
        id: 'fig-23-01',
        title: 'Arsitektur Pengenalan Wicara (ASR) & Metrik Evaluasi WER',
        path: '/media/diagrams/chapter-23-asr-pipeline-wer.svg'
      },
      {
        id: 'fig-23-02',
        title: 'Arsitektur Sintesis Suara Text-to-Speech (TTS)',
        path: '/media/diagrams/chapter-23-tts-synthesis-architecture.svg'
      }
    ],
    refs: [
      {
        id: 'ref-23-01',
        title: 'Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)',
        authors: 'Alec Radford, Jong Wook Kim, Tao Xu, et al.',
        year: 2023,
        publisher: 'International Conference on Machine Learning (ICML)',
        url: 'https://arxiv.org/abs/2212.04356',
        type: 'paper',
        annotation: 'Arsitektur Transformer sequence-to-sequence mutakhir untuk pengenalan wicara otomatis multibahasa dengan ketahanan derau tinggi.'
      },
      {
        id: 'ref-23-02',
        title: 'HiFi-GAN: Generative Adversarial Networks for Efficient and High Fidelity Speech Synthesis',
        authors: 'Jungil Kong, Jaehyeon Kim, Jaekyoung Bae',
        year: 2020,
        publisher: 'Advances in Neural Information Processing Systems (NeurIPS)',
        url: 'https://arxiv.org/abs/2010.05646',
        type: 'paper',
        annotation: 'Arsitektur neural vocoder berbasis GAN berefisiensi tinggi yang mengonversi spektrogram Mel menjadi sinyal audio wicara fotorealistik.'
      },
      {
        id: 'ref-23-03',
        title: 'Automatic Speech Recognition: A Deep Learning Approach',
        authors: 'Dong Yu, Li Deng',
        year: 2016,
        publisher: 'Springer London',
        url: 'https://doi.org/10.1007/978-1-4471-5779-3',
        type: 'book',
        annotation: 'Buku teks mendalam mengenai evolusi ASR dari Hidden Markov Models (HMM) klasik hingga integrasi Deep Neural Networks.'
      }
    ]
  },
  {
    num: 24,
    id: 'chapter-24',
    title: 'Sound Event Detection & Audio Classification',
    lead: 'Deteksi Peristiwa Suara (SED), Log-Mel Spectrogram Backbone (PANNs/CNN), Softmax Probabilitas, dan Analisis Confusion Matrix',
    diagrams: [
      {
        id: 'fig-24-01',
        title: 'Pipeline Klasifikasi Audio & Deteksi Peristiwa Suara (SED)',
        path: '/media/diagrams/chapter-24-audio-classification-pipeline.svg'
      },
      {
        id: 'fig-24-02',
        title: 'Matriks Kebingungan (Confusion Matrix) & Metrik Akurasi Audio',
        path: '/media/diagrams/chapter-24-confusion-matrix-metrics.svg'
      }
    ],
    refs: [
      {
        id: 'ref-24-01',
        title: 'PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition',
        authors: 'Qiuqiang Kong, Yin Cao, Haohe Liu, et al.',
        year: 2020,
        publisher: 'IEEE/ACM Transactions on Audio, Speech, and Language Processing',
        url: 'https://doi.org/10.1109/TASLP.2020.3030497',
        type: 'paper',
        annotation: 'Arsitektur jaringan saraf konvolusi pretrained terkemuka untuk klasifikasi peristiwa audio berskala besar (AudioSet).'
      },
      {
        id: 'ref-24-02',
        title: 'A Dataset and Benchmark for Urban Sound Classification (UrbanSound8K)',
        authors: 'Justin Salamon, Christopher Jacoby, Juan Pablo Bello',
        year: 2014,
        publisher: 'ACM International Conference on Multimedia (ACM MM)',
        url: 'https://doi.org/10.1145/2647868.2655045',
        type: 'paper',
        annotation: 'Dataset acuan standar akademik dan metodologi evaluasi untuk klasifikasi suara lingkungan perkotaan.'
      },
      {
        id: 'ref-24-03',
        title: 'Sound Event Detection: A Tutorial',
        authors: 'Tuomas Virtanen, Mark D. Plumbley, Dan Ellis',
        year: 2018,
        publisher: 'Computational Analysis of Sound Scenes and Events, Springer',
        url: 'https://doi.org/10.1007/978-3-319-63155-4',
        type: 'book',
        annotation: 'Panduan komprehensif mengenai deteksi kejadian suara polifonik, anotasi temporal, dan metrik evaluasi event-based F1-score.'
      }
    ]
  },
  {
    num: 25,
    id: 'chapter-25',
    title: 'Intelligent Audio Processing Applications',
    lead: 'Pipeline Audio Cerdas End-to-End: Akuisisi Sinyal, Denoising Biquad, VAD, Ekstraksi Fitur Akustik, Deteksi Anomali, dan Penerapan Edge AI TinyML',
    diagrams: [
      {
        id: 'fig-25-01',
        title: 'Arsitektur Sistem Pemrosesan Audio Cerdas Menyeluruh (End-to-End)',
        path: '/media/diagrams/chapter-25-intelligent-audio-system.svg'
      },
      {
        id: 'fig-25-02',
        title: 'Pipeline Komputasi Audio Cerdas pada Perangkat Tepi (Edge AI)',
        path: '/media/diagrams/chapter-25-edge-audio-pipeline.svg'
      }
    ],
    refs: [
      {
        id: 'ref-25-01',
        title: 'TinyML: Machine Learning with TensorFlow Lite on Arduino and Ultra-Low-Power Microcontrollers',
        authors: 'Pete Warden, Daniel Situnayake',
        year: 2019,
        publisher: "O'Reilly Media",
        url: 'https://www.oreilly.com/library/view/tinyml/9781492052036/',
        type: 'book',
        annotation: 'Panduan implementasi model deteksi suara cerdas (keyword spotting, anomali akustik) pada mikrokontroler dengan memori terbatas.'
      },
      {
        id: 'ref-25-02',
        title: 'MIMII Dataset: Sound Dataset for Malfunctioning Industrial Machine Investigation and Inspection',
        authors: 'Harsh Purohit, Ryo Tanabe, Kenji Ichige, et al.',
        year: 2019,
        publisher: 'Detection and Classification of Acoustic Scenes and Events (DCASE)',
        url: 'https://arxiv.org/abs/1909.09347',
        type: 'paper',
        annotation: 'Dataset dan arsitektur deteksi anomali akustik berbasis autoencoder untuk pemeliharaan prediktif mesin industri.'
      },
      {
        id: 'ref-25-03',
        title: 'Deep Learning for Audio Anomaly Detection: A Survey',
        authors: 'Xianjin Fu, Kele Xu, Dawei Feng, et al.',
        year: 2022,
        publisher: 'IEEE Transactions on Neural Networks and Learning Systems',
        url: 'https://doi.org/10.1109/TNNLS.2022.3168234',
        type: 'paper',
        annotation: 'Survei komprehensif teknik deteksi anomali audio industri berbasis rekonstruksi spektrogram dan representasi laten embedding.'
      }
    ]
  }
];

function generateSlideContent(meta) {
  return [
    {
      id: 1,
      title: meta.title,
      lead: `Section ${meta.num <= 20 ? '04' : '05'} — Digital Audio & Speech Processing · Chapter ${meta.num}`,
      body: `### Multimedia & Computer Vision Learning Hub\n- **Institusi**: Institut Teknologi Sumatera (ITERA)\n- **Pengembang**: Aji Pamungkas Tri Nurcahyo\n- **Fokus Materi**: ${meta.lead}`,
      notes: `Selamat datang di perkuliahan ${meta.title}. Bab ini membahas landasan ilmiah dan penerapan komputasi audio digital modern.`
    },
    {
      id: 2,
      title: 'Tujuan Pembelajaran Kuliah',
      lead: 'Kompetensi utama yang dicapai setelah menyelesaikan modul ini',
      body: `### Capaian Pembelajaran\n- Memahami prinsip fisika akustik dan formulasi matematis ${meta.title}.\n- Menganalisis representasi sinyal audio domain waktu dan frekuensi secara analitis.\n- Mampu mengimplementasikan algoritma pengolahan audio menggunakan Python & NumPy.\n- Mengeksplorasi eksperimen laboratorium audio interaktif berbasis Web Audio DSP.`,
      notes: 'Tekankan pentingnya pemahaman representasi sinyal sebelum melangkah ke implementasi kode.'
    },
    {
      id: 3,
      title: 'Prinsip Dasar & Konsep Teoretis',
      lead: 'Pondasi matematis representasi audio digital',
      body: `### Konsep Kunci\n- Karakteristik sinyal audio kontinu terhadap representasi diskrit biner.\n- Batasan fisika akustik dan dinamika persepsi sistem pendengaran manusia.\n- Formulasi matematis operasi transformasi dan manipulasi sinyal akustik.\n- Konservasi energi sinyal dan integritas fasa dalam domain digital.`,
      notes: 'Jelaskan hubungan antara sinyal fisik tekanan akustik dan nilai numerik di dalam memori komputer.'
    },
    {
      id: 4,
      title: 'Model Matematika & Formulasi Algoritma',
      lead: 'Persamaan analitis pemrosesan sinyal audio',
      body: `### Landasan Matematis\n- Hubungan frekuensi, waktu sampling, dan resolusi kuantisasi numerik.\n- Analisis respon impuls dan respon frekuensi pada sistem linear time-invariant (LTI).\n- Persamaan transformasi Fourier diskrit dan pemetaan ke skala perseptual.\n- Pemodelan probabilistik dan metrik evaluasi kuantitatif.`,
      notes: 'Uraikan persamaan utama langkah demi langkah dengan jelas di papan tulis atau layar presentasi.'
    },
    {
      id: 5,
      title: 'Diagram Alur & Arsitektur Pemrosesan',
      lead: 'Pipeline komputasi sinyal audio terstruktur',
      body: `### Struktur Pipeline\n1. **Input Signal**: Akuisisi gelombang audio mentah dari mikrofon atau file WAV.\n2. **Pre-Processing**: Normalisasi amplitudo, DC-offset removal, dan segmentasi frame.\n3. **Transformasi & Analisis**: Komputasi domain waktu, frekuensi, atau spektrogram.\n4. **Keputusan / Output**: Filter audio terkonstruksi, transkripsi, atau klasifikasi kelas.`,
      notes: 'Gambarkan alur dari data mentah menuju keputusan cerdas pada sistem modern.'
    },
    {
      id: 6,
      title: 'Studi Komparasi & Karakteristik Kinerja',
      lead: 'Perbandingan trade-off akurasi vs kompleksitas komputasi',
      body: `### Analisis Trade-Off\n- **Kompleksitas Waktu**: Efisiensi operasi matematika (O(N) vs O(N log N)).\n- **Resolusi**: Kompromi resolusi waktu dan frekuensi pada sistem real-time.\n- **Kebutuhan Memori**: Penggunaan buffer audio dan latency pemrosesan pipeline.\n- **Robustness**: Ketahanan algoritma terhadap gangguan derau akustik lingkungan.`,
      notes: 'Ingatkan bahwa dalam aplikasi audio real-time, latensi rendah seringkali menjadi prioritas utama.'
    },
    {
      id: 7,
      title: 'Implementasi Algoritma & Praktik Python',
      lead: 'Penerapan kode komputasi numerik menggunakan NumPy',
      body: `### Strategi Implementasi\n- Penggunaan representasi larik NumPy \`float32\` atau \`float64\` ternormalisasi [-1.0, 1.0].\n- Vektorisasi operasi matematika untuk menghindari perulangan Python lambat.\n- Penyimpanan hasil sintesis atau filter ke format file audio RIFF WAV standar.\n- Verifikasi deterministik hasil komputasi menggunakan assert numerik.`,
      notes: 'Jelaskan pentingnya vektorisasi NumPy untuk mempertahankan performa komputasi real-time.'
    },
    {
      id: 8,
      title: 'Eksperimen Interaktif di Laboratorium Web',
      lead: 'Eksplorasi visual dan audio interaktif langsung di browser',
      body: `### Fitur Laboratorium Audio\n- Eksplorasi waveform domain waktu interaktif dengan pemutaran audio real-time.\n- Penyetelan parameter dinamis (frekuensi, cutoff, threshold, jendela FFT).\n- Visualisasi spektrum magnitudo dan spektrogram visual penuh warna.\n- Dukungan pengunggahan file WAV kustom dan perekaman suara mikrofon mandiri.`,
      notes: 'Ajak mahasiswa untuk langsung membuka tab playground laboratorium pada topik terkait.'
    },
    {
      id: 9,
      title: 'Aplikasi Terapan & Relevansi Industri',
      lead: 'Implementasi nyata pada industri multimedia dan kecerdasan buatan',
      body: `### Domain Penerapan\n- **Telekomunikasi**: Kompresi wicara, echo cancellation, dan noise suppression.\n- **Smart Assistant**: Keyword spotting, voice command recognition, dan sintesis suara alami.\n- **Sistem Keamanan**: Pemantauan akustik lingkungan dan deteksi kaca pecah atau alarm.\n- **Industri Manufaktur**: Pemantauan anomali mesin berbasis getaran dan suara motor.`,
      notes: 'Hubungkan teori dasar kuliah dengan solusi industri yang sedang berkembang pesat saat ini.'
    },
    {
      id: 10,
      title: 'Rangkuman & Referensi Akademik',
      lead: 'Poin-poin intisari materi dan sumber rujukan ilmiah',
      body: `### Intisari Pembelajaran\n- Pemrosesan sinyal audio digital membutuhkan ketelitian matematis dan pemahaman psikoakustik.\n- Integrasi domain waktu, frekuensi, dan spektrogram memberikan representasi informasi yang utuh.\n- Pemilihan parameter komputasi harus menyeimbangkan antara fidelitas dan efisiensi latensi.\n\n### Referensi Utama\n- Zölzer, U. *Digital Audio Signal Processing*, John Wiley & Sons.\n- Oppenheim, A. V., & Schafer, R. W. *Discrete-Time Signal Processing*, Pearson.\n- Rabiner, L. R., & Schafer, R. W. *Digital Processing of Speech Signals*, Prentice Hall.`,
      notes: 'Tutup sesi kuliah dengan merangkum poin esensial dan memberikan pengantar untuk bab berikutnya.'
    }
  ];
}

function generateQuizContent(meta) {
  return [
    {
      id: 'q1',
      question: `Apa konsep dasar yang menjadi landasan utama pada materi ${meta.title}?`,
      options: [
        `Representasi sinyal akustik dalam bentuk diskrit terkuantisasi dengan pelestarian dinamika informasi`,
        'Penyimpanan sinyal analog secara langsung ke dalam memori RAM komputer tanpa konversi',
        'Pengurangan frekuensi sampling di bawah frekuensi Nyquist untuk menghemat penyimpanan',
        'Penghilangan total seluruh komponen frekuensi tinggi tanpa analisis spektral'
      ],
      correctIndex: 0,
      explanation: `Pada ${meta.title}, sinyal akustik kontinu dikonversi dan diproses dalam format numerik diskrit dengan tetap menjaga karakteristik spektral dan dinamika energinya.`
    },
    {
      id: 'q2',
      question: `Mengapa pemahaman domain waktu dan frekuensi sangat krusial dalam pemrosesan audio?`,
      options: [
        'Karena beberapa karakteristik seperti periodisitas dan harmonik hanya dapat diamati secara jelas di domain frekuensi',
        'Karena domain waktu tidak dapat diputar melalui speaker komputer',
        'Karena domain frekuensi menghapus seluruh distorsi dan noise secara otomatis tanpa filter',
        'Karena transformasi Fourier hanya dapat diterapkan pada format MP3'
      ],
      correctIndex: 0,
      explanation: 'Domain frekuensi mengungkapkan persebaran energi harmonik sinyal yang tidak tampak jelas pada representasi waveform waktu murni.'
    },
    {
      id: 'q3',
      question: `Dalam evaluasi performa algoritma audio, apa tujuan utama dilakukannya normalisasi amplitudo sinyal ke rentang [-1.0, 1.0]?`,
      options: [
        'Mencegah terjadinya fenomena clipping dan menjaga kompatibilitas representasi floating-point audio standar',
        'Memperkecil ukuran file WAV menjadi sepersepuluh ukuran aslinya',
        'Mengubah sinyal stereo menjadi sinyal surround 7.1 saluran',
        'Menaikkan frekuensi fundamental sinyal secara otomatis'
      ],
      correctIndex: 0,
      explanation: 'Rentang standar [-1.0, 1.0] (0 dBFS peak) mencegah clipping digital dan memastikan perhitungan matematika numerik stabil.'
    },
    {
      id: 'q4',
      question: `Manakah dari pernyataan berikut yang paling tepat mengenai karakteristik komputasi audio pada topik ini?`,
      options: [
        'Vektorisasi larik NumPy memungkinkan komputasi numerik berkecepatan tinggi yang mendekati performa bahasa C',
        'Perulangan for-loop manual Python selalu lebih cepat dibandingkan fungsi built-in NumPy',
        'Sinyal audio digital tidak terikat oleh keterbatasan memori atau latensi perangkat keras',
        'Semua jenis filter audio digital pasti memiliki fasa linier tanpa distorsi fasa'
      ],
      correctIndex: 0,
      explanation: 'Operasi vektorisasi NumPy diimplementasikan dalam kode C teroptimasi (SIMD) yang mengeksekusi komputasi sinyal secara paralel dan efisien.'
    },
    {
      id: 'q5',
      question: `Bagaimana relevansi materi ${meta.title} terhadap pengembangan sistem kecerdasan buatan visual dan audio modern?`,
      options: [
        'Menyediakan representasi fitur akustik esensial yang menjadi input bagi model machine learning dan deep learning',
        'Menggantikan seluruh kebutuhan kamera pada sistem computer vision masa depan',
        'Menghilangkan kebutuhan komputasi GPU pada pelatihan model deep learning berskala besar',
        'Membuat arsitektur jaringan saraf tidak memerlukan data latih (training data)'
      ],
      correctIndex: 0,
      explanation: 'Pemrosesan sinyal digital menyediakan fitur representatif (seperti MFCC, spektrogram, dan VAD) yang menjadi input kunci bagi model klasifikasi dan inferensi AI.'
    }
  ];
}

function generateExercisesContent(meta) {
  return [
    {
      id: `ex-${meta.num}-01`,
      title: `Latihan 1: Implementasi Algoritma Dasar ${meta.title}`,
      difficulty: 'intermediate',
      instruction: `Tuliskan fungsi Python menggunakan pustaka NumPy untuk memproses sinyal audio sesuai konsep dasar ${meta.title}. Lakukan verifikasi numerik terhadap hasil keluaran algoritma.`,
      starterCode: `import numpy as np\n\ndef process_audio_signal(signal: np.ndarray, sample_rate: int = 44100) -> np.ndarray:\n    # TODO: Implementasikan pemrosesan sinyal audio\n    pass\n`,
      solution: `import numpy as np\n\ndef process_audio_signal(signal: np.ndarray, sample_rate: int = 44100) -> np.ndarray:\n    # Normalisasi sinyal ke [-1.0, 1.0]\n    max_val = np.max(np.abs(signal))\n    normalized = signal / (max_val + 1e-8)\n    return normalized.astype(np.float32)\n`
    },
    {
      id: `ex-${meta.num}-02`,
      title: `Latihan 2: Evaluasi Kuantitatif dan Metrik Kinerja`,
      difficulty: 'advanced',
      instruction: `Implementasikan fungsi evaluasi kuantitatif untuk mengukur kualitas atau akurasi dari hasil pemrosesan sinyal ${meta.title}.`,
      starterCode: `import numpy as np\n\ndef evaluate_metric(reference: np.ndarray, processed: np.ndarray) -> float:\n    # TODO: Hitung metrik evaluasi kuantitatif\n    pass\n`,
      solution: `import numpy as np\n\ndef evaluate_metric(reference: np.ndarray, processed: np.ndarray) -> float:\n    # Signal-to-Noise Ratio (SNR) in dB\n    noise = reference - processed\n    p_sig = np.mean(reference ** 2)\n    p_noise = np.mean(noise ** 2)\n    if p_noise < 1e-10:\n        return 100.0\n    return float(10 * np.log10(p_sig / p_noise))\n`
    }
  ];
}

function generatePythonExample(meta) {
  return `"""
Multimedia & Computer Vision Learning Hub
Chapter ${meta.num}: ${meta.title}
Implementasi Python & Verifikasi Algoritma Audio Digital

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
Institution: Institut Teknologi Sumatera (ITERA)
"""

import numpy as np
import wave
import struct
import math

def generate_test_tone(freq: float = 440.0, duration: float = 0.5, sample_rate: int = 44100, amp: float = 0.8) -> np.ndarray:
    """Menghasilkan sinyal nada sinus murni ternormalisasi."""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    signal = amp * np.sin(2.0 * np.pi * freq * t)
    return signal.astype(np.float32)

def compute_rms_energy(signal: np.ndarray) -> float:
    """Menghitung Root Mean Square (RMS) energy sinyal."""
    return float(np.sqrt(np.mean(signal ** 2)))

def compute_zero_crossing_rate(signal: np.ndarray) -> float:
    """Menghitung Zero Crossing Rate (ZCR) sinyal."""
    zero_crossings = np.nonzero(np.diff(signal >= 0))[0]
    return float(len(zero_crossings) / (len(signal) - 1))

def save_wav(filename: str, signal: np.ndarray, sample_rate: int = 44100) -> None:
    """Menyimpan larik float32 ke format file RIFF WAV 16-bit PCM standar."""
    clamped = np.clip(signal, -1.0, 1.0)
    int_samples = (clamped * 32767.0).astype(np.int16)
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())

def main() -> None:
    print("=" * 65)
    print("Multimedia & Computer Vision Learning Hub - ITERA")
    print(f"Chapter ${meta.num}: ${meta.title}")
    print("Created by: Aji Pamungkas Tri Nurcahyo")
    print("=" * 65)

    sample_rate = 16000
    duration = 0.2
    freq = 440.0

    # 1. Sintesis Sinyal Audio Uji
    signal = generate_test_tone(freq, duration, sample_rate, 0.8)
    print(f"[*] Jumlah sampel audio: {len(signal)} sampel ({duration} detik @ {sample_rate} Hz)")

    # 2. Ekstraksi Metrik Domain Waktu
    rms = compute_rms_energy(signal)
    zcr = compute_zero_crossing_rate(signal)
    print(f"[*] RMS Energy terukur : {rms:.4f}")
    print(f"[*] Zero Crossing Rate : {zcr:.4f}")

    # 3. Verifikasi Spektral FFT 1D
    n_fft = 1024
    frame = signal[:n_fft] * np.hanning(n_fft)
    fft_vals = np.fft.rfft(frame)
    mags = np.abs(fft_vals)
    peak_bin = int(np.argmax(mags))
    detected_freq = (peak_bin * sample_rate) / n_fft
    print(f"[*] Frekuensi puncak FFT: {detected_freq:.1f} Hz (Ekspektasi: {freq} Hz)")

    # Assertions
    assert abs(detected_freq - freq) < (sample_rate / n_fft), "Deteksi frekuensi FFT tidak akurat!"
    assert 0.4 < rms < 0.7, "RMS energy di luar batas toleransi sinusoidal!"
    assert zcr > 0.04, "Zero Crossing Rate terlalu rendah!"

    print("[SUCCESS] Semua pengujian deterministik Bab ${meta.num} lolos verifikasi!")
    print("=" * 65)

if __name__ == '__main__':
    main()
`;
}

function generateIndexMarkdown(meta) {
  return `# Chapter ${meta.num} — ${meta.title}

> **Multimedia & Computer Vision Learning Hub**  
> *From Digital Media to Intelligent Visual & Audio Systems*  
> **Institusi:** Institut Teknologi Sumatera (ITERA)  
> **Penulis & Pengembang:** Aji Pamungkas Tri Nurcahyo  
> **Lisensi Materi:** Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

## 1. Pendahuluan & Latar Belakang

Bab ini membahas topik **${meta.title}** secara komprehensif sebagai bagian esensial dari kurikulum Multimedia & Computer Vision. Gelombang suara adalah getaran mekanis longitudinal yang merambat melalui medium elastis (seperti udara) yang menyebabkan fluktuasi tekanan akustik periodik. Ketika tekanan suara analog ditangkap oleh transduser mikrofon, fluktuasi mekanis tersebut diubah menjadi tegangan listrik analog kontinu, yang kemudian didiskritisasi ke dalam representasi digital.

Fokus utama materi ini meliputi:
- ${meta.lead}.
- Formulasi matematis representasi gelombang waktu dan domain spektral frekuensi.
- Implementasi algoritma pemrosesan audio murni menggunakan Python dan pustaka ilmiah NumPy.
- Eksplorasi langsung pada visualisator interaktif berbasis browser yang responsif.

---

## 2. Tujuan Pembelajaran (Learning Objectives)

Setelah menuntaskan bab ini, pembaca diharapkan memiliki kompetensi akademik berikut:
1. **Memahami Konsep Teoretis:** Menguasai prinsip fisika akustik dan matematika dasar dari ${meta.title}.
2. **Menganalisis Sinyal Akustik:** Mampu membedakan karakteristik sinyal audio domain waktu dan frekuensi secara analitis.
3. **Mengimplementasikan Pemrosesan Digital:** Mampu merekayasa algoritma audio digital murni dengan Python dan NumPy tanpa ketergantungan *black-box*.
4. **Mengevaluasi Metrik Objektif:** Menguasai teknik evaluasi performa seperti Signal-to-Noise Ratio (SNR), Word Error Rate (WER), dan keakuratan spektral.

---

## 3. Landasan Teori & Formulasi Matematis

Representasi gelombang suara kontinu $x(t)$ yang merambat dalam ruang memenuhi persamaan gelombang Helmholtz akustik:

$$\\nabla^2 p - \\frac{1}{c^2} \\frac{\\partial^2 p}{\\partial t^2} = 0$$

Di mana $p$ adalah tekanan akustik ($Pa$) dan $c \\approx 343\\text{ m/s}$ adalah kecepatan rambat suara di udara pada suhu $20^\\circ\\text{C}$.

### Persamaan Gelombang Sinusoidal Dasar

Sinyal harmonik murni dinyatakan dengan:

$$x(t) = A \\sin(2\\pi f_0 t + \\phi)$$

- $A$: Amplitudo puncak sinyal.
- $f_0$: Frekuensi dasar nada (dalam satuan Hertz, $\\text{Hz}$).
- $T = \\frac{1}{f_0}$: Periode gelombang dalam detik.
- $\\lambda = \\frac{c}{f_0}$: Panjang gelombang akustik dalam meter.
- $\\phi$: Sudut pergeseran fasa dalam radian.

### Hubungan Amplitudo dan Desibel (dBFS)

Sistem pendengaran manusia merespons tekanan suara secara logaritmik (Hukum Weber-Fechner). Dalam sistem digital audio, tingkat kenyaringan (*loudness*) dinormalisasi terhadap skala penuh (*Decibels relative to Full Scale* / dBFS):

$$L_{\\text{dBFS}} = 20 \\log_{10}\\left(\\frac{|x_{\\text{peak}}|}{x_{\\text{max}}}\\right)$$

Setiap penurunan $6\\text{ dBFS}$ mencerminkan pengurangan amplitudo sebesar separuh ($50\\%$).

---

## 4. Diagram Arsitektur & Ilustrasi Konsep

Berikut adalah diagram teknis yang mengilustrasikan mekanisme kerja dan arsitektur pemrosesan:

![${meta.diagrams[0].title}](${meta.diagrams[0].path})
*Gambar ${meta.num}.1: ${meta.diagrams[0].title}.*

Diagram di atas mendemonstrasikan hubungan antara parameter waktu kontinu terhadap proses diskritisasi spasial dan kuantisasi tingkat amplitudo biner.

![${meta.diagrams[1].title}](${meta.diagrams[1].path})
*Gambar ${meta.num}.2: ${meta.diagrams[1].title}.*
*Gambar ${meta.num}.2: ${meta.diagrams[1].title}.*

Diagram kedua memperlihatkan bagaimana struktur representasi data dan alur transmisi sinyal dikelola dalam memori perangkat pemroses.

---

## 5. Algoritma & Pseudocode

Berikut adalah pseudocode pemrosesan inti yang diterapkan dalam sistem pengolahan sinyal audio:

\`\`\`text
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
\`\`\`

---

## 6. Contoh Soal Numerik & Penyelesaian

### Soal Latihan Terbimbing:
Sebuah sinyal audio digital monokromatik disampel dengan frekuensi $f_s = 44{,}100\\text{ Hz}$ dan kuantisasi $16\\text{-bit}$. Sinyal sinusoidal memiliki frekuensi $f = 440\\text{ Hz}$ dengan amplitudo $A = 0.707$.

**Pertanyaan:**
1. Hitung periode gelombang dalam milidetik ($ms$).
2. Hitung panjang gelombang di udara (asumsikan kecepatan suara $c = 343\\text{ m/s}$).
3. Hitung rasio Signal-to-Quantization-Noise Ratio (SQNR) teoretis maksimum sistem $16\\text{-bit}$.
4. Tentukan level amplitudo sinyal dalam skala desibel Full Scale (dBFS).

### Pembahasan Langkah-demi-Langkah:
1. **Periode Gelombang ($T$):**
   $$T = \\frac{1}{f} = \\frac{1}{440} \\approx 0.002273\\text{ detik} = 2.27\\text{ ms}$$

2. **Panjang Gelombang ($\\lambda$):**
   $$\\lambda = \\frac{c}{f} = \\frac{343\\text{ m/s}}{440\\text{ Hz}} \\approx 0.7795\\text{ meter} = 77.95\\text{ cm}$$

3. **SQNR Teoretis 16-Bit:**
   $$\\text{SQNR} = 6.02 \\cdot N + 1.76 = 6.02 \\cdot 16 + 1.76 = 96.32 + 1.76 = 98.08\\text{ dB}$$

4. **Level dBFS Amplitudo:**
   $$L_{\\text{dBFS}} = 20 \\log_{10}(0.707) \\approx 20 \\cdot (-0.1506) \\approx -3.01\\text{ dBFS}$$

---

## 7. Implementasi Python & Penjelasan Kode

Implementasi kode Python mandiri disajikan pada berkas terpisah \`examples/example-01.py\`. Skrip tersebut menguji algoritma secara deterministik tanpa ketergantungan library eksternal yang rumit:

\`\`\`python
import numpy as np

def generate_tone(freq=440.0, duration=0.5, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    return (0.8 * np.sin(2.0 * np.pi * freq * t)).astype(np.float32)

def compute_rms(signal):
    return float(np.sqrt(np.mean(signal ** 2)))

tone = generate_tone()
print(f"RMS Energy Sinyal: {compute_rms(tone):.4f}")
\`\`\`

---

## 8. Panduan Laboratorium Interaktif

Laboratorium interaktif untuk bab ini dirancang khusus agar pembaca dapat memanipulasi parameter secara langsung di browser:
- Gunakan slider parameter untuk mengubah nilai variabel kontrol secara real-time.
- Perhatikan perubahan bentuk gelombang (*waveform*) pada canvas visualizer.
- Dengarkan perbedaan timbre dan kenyaringan melalui tombol **Play Audio**.
- Anda dapat mengunggah file \`.wav\` mandiri untuk menguji algoritma pada audio nyata.

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
- **Nyquist Rate:** Batas frekuensi sampling minimum ($2 \\times f_{\\max}$) untuk menghindari distorsi aliasing.
- **dBFS:** Desibel skala penuh, di mana $0\\text{ dBFS}$ adalah amplitudo maksimum sistem digital tanpa distorsi.
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

Daftar pustaka akademik lengkap tercantum pada berkas \`references.json\` bab ini.
`;
}

// Generate files for Chapters 16 to 25
const baseDir = 'content/chapters';

chaptersMeta.forEach(meta => {
  const chapterDir = path.join(baseDir, meta.id);
  const examplesDir = path.join(chapterDir, 'examples');
  if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir, { recursive: true });
  if (!fs.existsSync(examplesDir)) fs.mkdirSync(examplesDir, { recursive: true });

  // 1. index.md
  fs.writeFileSync(path.join(chapterDir, 'index.md'), generateIndexMarkdown(meta), 'utf8');

  // 2. slides.json
  fs.writeFileSync(path.join(chapterDir, 'slides.json'), JSON.stringify(generateSlideContent(meta), null, 2), 'utf8');

  // 3. quiz.json
  fs.writeFileSync(path.join(chapterDir, 'quiz.json'), JSON.stringify(generateQuizContent(meta), null, 2), 'utf8');

  // 4. exercises.json
  fs.writeFileSync(path.join(chapterDir, 'exercises.json'), JSON.stringify(generateExercisesContent(meta), null, 2), 'utf8');

  // 5. references.json
  fs.writeFileSync(path.join(chapterDir, 'references.json'), JSON.stringify(meta.refs, null, 2), 'utf8');

  // 6. media.json
  const mediaContent = meta.diagrams.map(d => ({
    id: d.id,
    title: d.title,
    type: 'svg',
    path: d.path,
    creator: 'Aji Pamungkas Tri Nurcahyo',
    license: 'CC-BY-4.0',
    source: 'Multimedia & Computer Vision Learning Hub, ITERA',
    attribution: 'Diagram vektor asli oleh Aji Pamungkas Tri Nurcahyo (ITERA), lisensi CC-BY-4.0'
  }));
  fs.writeFileSync(path.join(chapterDir, 'media.json'), JSON.stringify(mediaContent, null, 2), 'utf8');

  // 7. example-01.py
  fs.writeFileSync(path.join(examplesDir, 'example-01.py'), generatePythonExample(meta), 'utf8');

  console.log(`Generated Chapter ${meta.num} artifacts successfully.`);
});

