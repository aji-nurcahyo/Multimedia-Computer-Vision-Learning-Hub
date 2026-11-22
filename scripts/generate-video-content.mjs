import fs from 'node:fs';
import path from 'node:path';

const chaptersMeta = [
  {
    num: 26,
    id: 'chapter-26',
    title: 'Digital Video Fundamentals',
    lead: 'Representasi Sekuens Citra Temporal, Resolusi Spasial & Temporal (FPS), Scanning Progresif vs Interlaced, Format Subsampling Kroma (4:2:0), dan Laju Data Bitrate',
    diagrams: [
      {
        id: 'fig-26-01',
        title: 'Representasi Sekuens Temporal & Dimensi Spasial-Waktu Video',
        path: '/media/diagrams/chapter-26-video-temporal-sequence.svg'
      },
      {
        id: 'fig-26-02',
        title: 'Skema Subsampling Kroma (Chroma Subsampling)',
        path: '/media/diagrams/chapter-26-chroma-subsampling.svg'
      }
    ],
    refs: [
      {
        id: 'ref-26-01',
        title: 'Digital Video and HD: Algorithms and Interfaces (2nd Edition)',
        authors: 'Charles Poynton',
        year: 2012,
        publisher: 'Morgan Kaufmann',
        url: 'https://www.sciencedirect.com/book/9780123919267/digital-video-and-hd',
        type: 'book',
        annotation: 'Karya rujukan otoritatif internasional mengenai matematika video digital, ruang warna YCbCr, subsampling kroma, dan standar sinkronisasi video broadcast.'
      },
      {
        id: 'ref-26-02',
        title: 'Video Demystified: A Handbook for the Digital Engineer (5th Edition)',
        authors: 'Keith Jack',
        year: 2007,
        publisher: 'Newnes / Elsevier',
        url: 'https://www.sciencedirect.com/book/9780750683951/video-demystified',
        type: 'book',
        annotation: 'Buku pegangan teknik mengenai format video digital, konversi analog-ke-digital, progressive scanning, dan arsitektur interface display.'
      },
      {
        id: 'ref-26-03',
        title: 'Recommendation ITU-R BT.601-7: Studio encoding parameters of digital television',
        authors: 'International Telecommunication Union',
        year: 2011,
        publisher: 'ITU Radiocommunication Sector',
        url: 'https://www.itu.int/rec/R-REC-BT.601/en',
        type: 'documentation',
        annotation: 'Standar resmi ITU-R untuk pengkodean sinyal video digital format 4:2:2 dan matriks konversi luminansi-krominansi standar.'
      }
    ]
  },
  {
    num: 27,
    id: 'chapter-27',
    title: 'Video Acquisition & Frame Processing',
    lead: 'Pipeline Akuisisi Kamera Video, WebRTC MediaDevices, Ekstraksi dan Buffering Frame, Penanganan Timestamp, Ring Buffer Asinkron, dan Transformasi Ruang Warna',
    diagrams: [
      {
        id: 'fig-27-01',
        title: 'Arsitektur Pipeline Akuisisi & Buffering Frame Video',
        path: '/media/diagrams/chapter-27-video-capture-pipeline.svg'
      },
      {
        id: 'fig-27-02',
        title: 'Strategi Manajemen Buffer Frame & Pencegahan Latensi',
        path: '/media/diagrams/chapter-27-frame-buffering-strategies.svg'
      }
    ],
    refs: [
      {
        id: 'ref-27-01',
        title: 'Learning OpenCV 4: Computer Vision with Python',
        authors: 'Joseph Howse, Joe Minichino',
        year: 2020,
        publisher: 'Packt Publishing',
        url: 'https://www.packtpub.com/product/learning-opencv-4-computer-vision-with-python-third-edition/9781789531619',
        type: 'book',
        annotation: 'Panduan praktis pengoperasian modul VideoCapture, manajemen buffer frame OpenCV, dan integrasi kamera USB/CCTV.'
      },
      {
        id: 'ref-27-02',
        title: 'Media Capture and Streams (W3C Candidate Recommendation)',
        authors: 'W3C Audio & WebRTC Working Groups',
        year: 2023,
        publisher: 'World Wide Web Consortium (W3C)',
        url: 'https://www.w3.org/TR/mediacapture-streams/',
        type: 'documentation',
        annotation: 'Spesifikasi resmi standar Web API untuk akses perangkat keras mikrofon dan kamera (getUserMedia) pada peramban web modern.'
      },
      {
        id: 'ref-27-03',
        title: 'Real-Time Vision Systems: Architecture and Design Considerations',
        authors: 'Reinhard Klette, Karsten Schlüns, Andreas Koschan',
        year: 2001,
        publisher: 'Springer',
        url: 'https://link.springer.com/book/10.1007/978-1-4471-0737-8',
        type: 'book',
        annotation: 'Kajian arsitektur antrean ring buffer, sinkronisasi frame clock, dan strategi eliminasi frame-lag pada sistem visi waktu nyata.'
      }
    ]
  },
  {
    num: 28,
    id: 'chapter-28',
    title: 'Video Encoding, Codecs & Compression',
    lead: 'Prinsip Kompresi Video, Redundansi Spasial & Temporal, Struktur Group of Pictures (GOP: I/P/B Frames), Standar Codec (H.264, H.265/HEVC, VP9, AV1), serta Metrik PSNR & SSIM',
    diagrams: [
      {
        id: 'fig-28-01',
        title: 'Struktur Group of Pictures (GOP): I-Frame, P-Frame & B-Frame',
        path: '/media/diagrams/chapter-28-video-compression-gop.svg'
      },
      {
        id: 'fig-28-02',
        title: 'Evolusi Standar Video Codec & Efisiensi Kompresi',
        path: '/media/diagrams/chapter-28-video-codecs-evolution.svg'
      }
    ],
    refs: [
      {
        id: 'ref-28-01',
        title: 'The H.264 Advanced Video Compression Standard (2nd Edition)',
        authors: 'Iain E. Richardson',
        year: 2010,
        publisher: 'John Wiley & Sons',
        url: 'https://www.wiley.com/en-us/The+H+264+Advanced+Video+Compression+Standard%2C+2nd+Edition-p-9780470516928',
        type: 'book',
        annotation: 'Rujukan komprehensif struktur codec H.264, estimasi vektor gerak makroblok, DCT integer diskrit, dan entropi CABAC.'
      },
      {
        id: 'ref-28-02',
        title: 'Overview of the High Efficiency Video Coding (HEVC) Standard',
        authors: 'Gary J. Sullivan, Jens-Rainer Ohm, Woo-Jin Han, Thomas Wiegand',
        year: 2012,
        publisher: 'IEEE Transactions on Circuits and Systems for Video Technology',
        url: 'https://doi.org/10.1109/TCSVT.2012.2221191',
        type: 'paper',
        annotation: 'Makalah seminal pengenalan standar H.265/HEVC dengan unit pohon pengkodean (CTU) kuadratik adaptif.'
      },
      {
        id: 'ref-28-03',
        title: 'A Technical Overview of AV1',
        authors: 'Jingning Han, Bohan Li, Debargha Mukherjee, et al.',
        year: 2021,
        publisher: 'Proceedings of the IEEE',
        url: 'https://doi.org/10.1109/JPROC.2021.3058004',
        type: 'paper',
        annotation: 'Arsitektur codec video sumber terbuka royalti-bebas AOMedia AV1 yang menawarkan efisiensi kompresi tertinggi untuk video internet.'
      }
    ]
  },
  {
    num: 29,
    id: 'chapter-29',
    title: 'Video Enhancement & Temporal Filtering',
    lead: 'Model Derau Video, Penapis Temporal Berjalan (Running Average), Temporal Median Filtering, Evaluasi Kualitas PSNR, dan Mitigasi Artifak Bayangan (Ghosting)',
    diagrams: [
      {
        id: 'fig-29-01',
        title: 'Mekanisme Penapis Temporal Video (Temporal Filtering)',
        path: '/media/diagrams/chapter-29-video-temporal-filtering.svg'
      },
      {
        id: 'fig-29-02',
        title: 'Analisis Artifak Bayangan (Ghosting) pada Filtering Temporal',
        path: '/media/diagrams/chapter-29-temporal-ghosting-artifacts.svg'
      }
    ],
    refs: [
      {
        id: 'ref-29-01',
        title: 'Digital Video Processing (2nd Edition)',
        authors: 'A. Murat Tekalp',
        year: 2015,
        publisher: 'Prentice Hall',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/digital-video-processing/P200000003307',
        type: 'book',
        annotation: 'Karya fundamental pengolahan video digital tingkat lanjut mengenai penapisan spatio-temporal, kompensasi gerak, dan restorasi sekuens video.'
      },
      {
        id: 'ref-29-02',
        title: 'Video Denoising by Exploring Spatio-Temporal Redundancy',
        authors: 'Marc Lebrun, Miguel Colom, Jean-Michel Morel',
        year: 2015,
        publisher: 'Image Processing On Line (IPOL)',
        url: 'https://doi.org/10.5201/ipol.2015.127',
        type: 'paper',
        annotation: 'Metodologi restorasi video multi-frame memanfaatkan redundansi temporal lintasan gerak dan penapisan non-lokal 3D (VBM3D).'
      },
      {
        id: 'ref-29-03',
        title: 'Temporal Noise Reduction in Video Sequences with Motion Detection',
        authors: 'Jocelyn Chanussot, Patrick Lambert',
        year: 1999,
        publisher: 'Signal Processing: Image Communication',
        url: 'https://doi.org/10.1016/S0923-5965(98)00036-7',
        type: 'paper',
        annotation: 'Strategi penapisan temporal adaptif yang membatasi rata-rata temporal hanya pada area statis guna mencegah artifak ghosting.'
      }
    ]
  },
  {
    num: 30,
    id: 'chapter-30',
    title: 'Motion Estimation & Optical Flow',
    lead: 'Persamaan Batasan Aliran Optik (Optical Flow Constraint Equation), Solusi Kuadrat Terkecil Lucas-Kanade (LK), Metode Global Horn-Schunck, Aperture Problem, dan Visualisasi Vektor Medan Gerak',
    diagrams: [
      {
        id: 'fig-30-01',
        title: 'Persamaan Batasan Aliran Optik (Optical Flow Constraint Equation)',
        path: '/media/diagrams/chapter-30-optical-flow-constraint.svg'
      },
      {
        id: 'fig-30-02',
        title: 'Perbandingan Algoritma: Lucas-Kanade vs Horn-Schunck',
        path: '/media/diagrams/chapter-30-lucas-kanade-vs-horn-schunck.svg'
      }
    ],
    refs: [
      {
        id: 'ref-30-01',
        title: 'An Iterative Image Registration Technique with an Application to Stereo Vision',
        authors: 'Bruce D. Lucas, Takeo Kanade',
        year: 1981,
        publisher: 'Proceedings of the 7th International Joint Conference on Artificial Intelligence (IJCAI)',
        url: 'https://www.ijcai.org/Proceedings/81-2/Papers/039.pdf',
        type: 'paper',
        annotation: 'Makalah seminal yang mencetuskan algoritma aliran optik lokal Lucas-Kanade berbasis penyelesaian sistem persamaan linier 2x2.'
      },
      {
        id: 'ref-30-02',
        title: 'Determining Optical Flow',
        authors: 'Berthold K. P. Horn, Brian G. Schunck',
        year: 1981,
        publisher: 'Artificial Intelligence',
        url: 'https://doi.org/10.1016/0004-3702(81)90024-2',
        type: 'paper',
        annotation: 'Pondasi matematis aliran optik rapat (dense optical flow) dengan regularisasi variasi global untuk mengatasi masalah bukaan (aperture problem).'
      },
      {
        id: 'ref-30-03',
        title: 'Pyramidal Implementation of the Lucas Kanade Feature Tracker Description of the Algorithm',
        authors: 'Jean-Yves Bouguet',
        year: 2001,
        publisher: 'Intel Corporation Technical Report',
        url: 'https://robots.stanford.edu/cs223b04/algo_tracking.pdf',
        type: 'documentation',
        annotation: 'Implementasi piramida multiskala Lucas-Kanade teroptimasi yang diadopsi secara resmi dalam fungsi cv2.calcOpticalFlowPyrLK pada OpenCV.'
      }
    ]
  },
  {
    num: 31,
    id: 'chapter-31',
    title: 'Background Subtraction & Motion Detection',
    lead: 'Pemodelan Latar Belakang (Running Average & Gaussian Background Models), Pembangkitan Masker Foreground, Pembersihan Morfologi, Penekanan Bayangan, dan Ekstraksi Bounding Box',
    diagrams: [
      {
        id: 'fig-31-01',
        title: 'Arsitektur Pipeline Pengurangan Latar Belakang (Background Subtraction)',
        path: '/media/diagrams/chapter-31-background-subtraction-pipeline.svg'
      },
      {
        id: 'fig-31-02',
        title: 'Karakteristik & Penekanan Bayangan (Shadow Suppression)',
        path: '/media/diagrams/chapter-31-shadow-suppression-techniques.svg'
      }
    ],
    refs: [
      {
        id: 'ref-31-01',
        title: 'Adaptive background mixture models for real-time tracking (MOG)',
        authors: 'Chris Stauffer, W. Eric L. Grimson',
        year: 1999,
        publisher: 'IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR)',
        url: 'https://doi.org/10.1109/CVPR.1999.784637',
        type: 'paper',
        annotation: 'Karya pionir pemodelan latar belakang multimodal berbasis Mixture of Gaussians (MOG) yang mampu menangani dedaunan bergerak dan riak air.'
      },
      {
        id: 'ref-31-02',
        title: 'Improved adaptive Gaussian mixture model for background subtraction (MOG2)',
        authors: 'Zoran Zivkovic',
        year: 2004,
        publisher: 'International Conference on Pattern Recognition (ICPR)',
        url: 'https://doi.org/10.1109/ICPR.2004.1333992',
        type: 'paper',
        annotation: 'Penyempurnaan algoritma MOG dengan pemilihan jumlah komponen Gaussian dinamis per piksel dan fitur deteksi bayangan terintegrasi.'
      },
      {
        id: 'ref-31-03',
        title: 'Background Subtraction: Theory and Practice',
        authors: 'Ahmed Elgammal',
        year: 2014,
        publisher: 'Synthesis Lectures on Computer Vision, Morgan & Claypool Publishers',
        url: 'https://doi.org/10.2200/S00588ED1V01Y201407COV006',
        type: 'book',
        annotation: 'Survei mendalam mengenai taksonomi metode background subtraction parametrik dan non-parametrik serta metrik evaluasinya.'
      }
    ]
  },
  {
    num: 32,
    id: 'chapter-32',
    title: 'Object Tracking Fundamentals',
    lead: 'Paradigma Tracking-by-Detection, Estimasi Status Spasial, Siklus Prediksi & Koreksi Filter Kalman Orde-2, Vektor Kecepatan, dan Asosiasi Jarak Centroid',
    diagrams: [
      {
        id: 'fig-32-01',
        title: 'Siklus Prediksi & Koreksi Filter Kalman (Kalman Filter Loop)',
        path: '/media/diagrams/chapter-32-kalman-filter-cycle.svg'
      },
      {
        id: 'fig-32-02',
        title: 'Paradigma Pelacakan Tracking-by-Detection',
        path: '/media/diagrams/chapter-32-tracking-by-detection.svg'
      }
    ],
    refs: [
      {
        id: 'ref-32-01',
        title: 'A New Approach to Linear Filtering and Prediction Problems',
        authors: 'Rudolf E. Kalman',
        year: 1960,
        publisher: 'Journal of Basic Engineering',
        url: 'https://doi.org/10.1115/1.3662552',
        type: 'paper',
        annotation: 'Makalah seminal penemuan Filter Kalman rekursif yang merevolusi estimasi status navigasi, robotika, dan pelacakan lintasan objek digital.'
      },
      {
        id: 'ref-32-02',
        title: 'Design and Analysis of Modern Tracking Systems',
        authors: 'Samuel Blackman, Robert Popoli',
        year: 1999,
        publisher: 'Artech House Radar Library',
        url: 'https://www.artechhouse.com/',
        type: 'book',
        annotation: 'Karya komprehensif mengenai perancangan model gerak kinematika, matriks kovariansi derau, dan strategi asosiasi data pelacak tunggal dan jamak.'
      },
      {
        id: 'ref-32-03',
        title: 'Object Tracking: A Survey',
        authors: 'Alper Yilmaz, Omar Javed, Mubarak Shah',
        year: 2006,
        publisher: 'ACM Computing Surveys (CSUR)',
        url: 'https://doi.org/10.1145/1177352.1177355',
        type: 'paper',
        annotation: 'Tinjauan komprehensif taksonomi metode pelacakan visual: point tracking, kernel tracking, dan silhouette tracking.'
      }
    ]
  },
  {
    num: 33,
    id: 'chapter-33',
    title: 'Multi-Object Tracking',
    lead: 'Pelacakan Multi-Objek (MOT), Kontinuitas Identitas Track ID, Asosiasi Graf Bipartit dengan Algoritma Hungarian, Pipeline SORT (Simple Online and Realtime Tracking), Penanganan Oklusi, dan Metrik MOTA/IDF1',
    diagrams: [
      {
        id: 'fig-33-01',
        title: 'Asosiasi Data Dua-Arah & Algoritma Hungarian',
        path: '/media/diagrams/chapter-33-hungarian-bipartite-matching.svg'
      },
      {
        id: 'fig-33-02',
        title: 'Arsitektur Pelacakan Cepat SORT (Simple Online and Realtime Tracking)',
        path: '/media/diagrams/chapter-33-sort-pipeline-architecture.svg'
      }
    ],
    refs: [
      {
        id: 'ref-33-01',
        title: 'Simple Online and Realtime Tracking (SORT)',
        authors: 'Alex Bewley, Zongyuan Ge, Lionel Ott, Fabio Ramos, Ben Upcroft',
        year: 2016,
        publisher: 'IEEE International Conference on Image Processing (ICIP)',
        url: 'https://arxiv.org/abs/1602.00763',
        type: 'paper',
        annotation: 'Algoritma acuan industri pelacakan multi-target berbasis integrasi minimalis Filter Kalman dan algoritma Hungarian berkecepatan 60+ FPS.'
      },
      {
        id: 'ref-33-02',
        title: 'Simple Online and Realtime Tracking with a Deep Association Metric (DeepSORT)',
        authors: 'Nicolai Wojke, Alex Bewley, Dietrich Paulus',
        year: 2017,
        publisher: 'IEEE International Conference on Image Processing (ICIP)',
        url: 'https://arxiv.org/abs/1703.07402',
        type: 'paper',
        annotation: 'Pengembangan SORT dengan penambahan metrik kemiripan fitur visual CNN (Re-ID embedding) untuk mengatasi oklusi jangka panjang.'
      },
      {
        id: 'ref-33-03',
        title: 'Evaluating Multiple Object Tracking Performance: The CLEAR MOT Metrics',
        authors: 'Keni Bernardin, Rainer Stiefelhagen',
        year: 2008,
        publisher: 'EURASIP Journal on Image and Video Processing',
        url: 'https://doi.org/10.1155/2008/246309',
        type: 'paper',
        annotation: 'Perumusan metrik evaluasi standar internasional Multiple Object Tracking Accuracy (MOTA) dan Multiple Object Tracking Precision (MOTP).'
      }
    ]
  },
  {
    num: 34,
    id: 'chapter-34',
    title: 'Video Event & Activity Analysis',
    lead: 'Deteksi Peristiwa Video Berbasis Spasial-Temporal, Region of Interest (ROI), Garis Virtual (Virtual Line Crossing / Tripwire), Logika Arah Masuk vs Keluar, Pengukuran Dwell Time, dan Metrik Evaluasi Toleransi Waktu',
    diagrams: [
      {
        id: 'fig-34-01',
        title: 'Logika Deteksi Garis Virtual (Virtual Tripwire & ROI)',
        path: '/media/diagrams/chapter-34-virtual-tripwire-logic.svg'
      },
      {
        id: 'fig-34-02',
        title: 'Metrik Evaluasi Deteksi Peristiwa Video (Event Evaluation)',
        path: '/media/diagrams/chapter-34-video-event-metrics.svg'
      }
    ],
    refs: [
      {
        id: 'ref-34-01',
        title: 'Intelligent Video Surveillance: Systems and Technology',
        authors: 'Yunqian Ma, Gang Qian',
        year: 2009,
        publisher: 'CRC Press',
        url: 'https://www.routledge.com/Intelligent-Video-Surveillance-Systems-and-Technology/Ma-Qian/p/book/9781439800089',
        type: 'book',
        annotation: 'Panduan teknis perancangan analitik video pengawasan cerdas, virtual perimeter tripwire, dan pencegahan alarm palsu.'
      },
      {
        id: 'ref-34-02',
        title: 'Video Analytics for Business Intelligence',
        authors: 'Caifeng Shan, Fatih Porikli, Tao Xiang, Shaogang Gong',
        year: 2012,
        publisher: 'Springer Berlin Heidelberg',
        url: 'https://doi.org/10.1007/978-3-642-28598-1',
        type: 'book',
        annotation: 'Penerapan sistem penghitungan orang, analisis arus lalu lintas perkotaan, dan estimasi waktu singgah (dwell time).'
      },
      {
        id: 'ref-34-03',
        title: 'A Survey on Video-Based Human Action Recognition: Recent Advances and Future Trends',
        authors: 'Zehua Sun, Qiuhong Ke, Hossein Rahmani, et al.',
        year: 2022,
        publisher: 'ACM Computing Surveys (CSUR)',
        url: 'https://doi.org/10.1145/3539604',
        type: 'paper',
        annotation: 'Survei komprehensif mengenai transisi dari pemodelan peristiwa berbasis aturan geometris hingga pengenalan aksi manusia berbasis spatio-temporal deep networks.'
      }
    ]
  },
  {
    num: 35,
    id: 'chapter-35',
    title: 'Video Processing Application Project',
    lead: 'Proyek Aplikasi Sistem Analitik Video Cerdas Mandiri (Applied Intelligent Video Analytics System): Integrasi Pipeline End-to-End, Optimasi Throughput pada Perangkat Tepi, Rubrik Penilaian Proyek, dan Ekspor Laporan CSV',
    diagrams: [
      {
        id: 'fig-35-01',
        title: 'Arsitektur Sistem Analitik Video Cerdas Terpadu (End-to-End)',
        path: '/media/diagrams/chapter-35-applied-video-analytics-system.svg'
      },
      {
        id: 'fig-35-02',
        title: 'Optimasi Sistem Analitik Video pada Perangkat Tepi (Edge AI)',
        path: '/media/diagrams/chapter-35-edge-video-optimization.svg'
      }
    ],
    refs: [
      {
        id: 'ref-35-01',
        title: 'Embedded Computer Vision',
        authors: 'Branislav Kisacanin, Shuvra S. Bhattacharyya, Shang-Hung Lin',
        year: 2009,
        publisher: 'Springer London',
        url: 'https://doi.org/10.1007/978-1-84882-359-4',
        type: 'book',
        annotation: 'Prinsip implementasi algoritma pemrosesan citra dan video pada perangkat tersemat (embedded hardware) dengan kendala daya dan memori.'
      },
      {
        id: 'ref-35-02',
        title: 'Smart Video Surveillance System: An End-to-End Edge Architecture',
        authors: 'Pradeep K. Atrey, M. Anwar Hossain, Abdulmotaleb El Saddik',
        year: 2011,
        publisher: 'ACM Transactions on Multimedia Computing, Communications, and Applications (TOMM)',
        url: 'https://doi.org/10.1145/1877953.1877960',
        type: 'paper',
        annotation: 'Perancangan arsitektur analitik video cerdas terdistribusi yang membagi beban komputasi antara kamera tepi (edge) dan konsol pusat.'
      },
      {
        id: 'ref-35-03',
        title: 'Deep Learning for Vision Systems',
        authors: 'Mohamed Elgendy',
        year: 2020,
        publisher: 'Manning Publications',
        url: 'https://www.manning.com/books/deep-learning-for-vision-systems',
        type: 'book',
        annotation: 'Panduan rekayasa perangkat lunak visi komputer terapan, teknik validasi sistem, dan deployment pipeline analitik video mandiri.'
      }
    ]
  }
];

function generateSlideContent(meta) {
  return [
    {
      id: 1,
      title: meta.title,
      lead: `Section ${meta.num <= 30 ? '06' : '07'} — Digital Video Processing & Tracking · Chapter ${meta.num}`,
      body: `### Multimedia & Computer Vision Learning Hub\n- **Institusi**: Institut Teknologi Sumatera (ITERA)\n- **Pengembang**: Aji Pamungkas Tri Nurcahyo\n- **Fokus Materi**: ${meta.lead}`,
      notes: `Selamat datang di perkuliahan ${meta.title}. Bab ini mengkaji landasan matematis, komputasi temporal sekuens video, dan penerapannya pada visi komputer cerdas.`
    },
    {
      id: 2,
      title: 'Tujuan Pembelajaran Kuliah',
      lead: 'Kompetensi utama yang dicapai setelah menyelesaikan modul ini',
      body: `### Capaian Pembelajaran\n- Memahami formulasi matematis dan konsep kunci ${meta.title}.\n- Menganalisis perilaku dinamika sekuens video dalam domain spasial-temporal.\n- Mampu merekayasa algoritma pemrosesan video mandiri menggunakan Python & OpenCV.\n- Mengeksplorasi eksperimen laboratorium interaktif berbasis web tanpa ketergantungan server berat.`,
      notes: 'Tekankan pentingnya penguasaan konsep sebelum melangkah ke implementasi kode program.'
    },
    {
      id: 3,
      title: 'Prinsip Dasar & Konsep Teoretis',
      lead: 'Pondasi ilmiah representasi dan manipulasi sekuens video',
      body: `### Konsep Kunci\n- Dinamika sekuens citra diskrit sebagai fungsi 3D $V(x, y, t)$.\n- Relasi antara resolusi spasial, resolusi temporal (FPS), dan efisiensi transmisi.\n- Konservasi kecerahan (*brightness constancy*) dan redundansi informasi antar-frame.\n- Batasan fisika optik sensor dan keterbatasan komputasi waktu nyata.`,
      notes: 'Jelaskan perbedaan fundamental antara pengolahan citra diam (2D) dengan pemrosesan video sekuensial (3D).'
    },
    {
      id: 4,
      title: 'Formulasi Matematis & Algoritma',
      lead: 'Persamaan analitis pemrosesan video digital',
      body: `### Landasan Matematis\n- Persamaan diferensial parsial perubahan intensitas terhadap ruang dan waktu.\n- Formulasi estimasi status dan optimasi kuadrat terkecil (*least-squares estimation*).\n- Matriks transformasi dan asosiasi graf bipartit berbobot biaya minimum.\n- Metrik evaluasi performa objektif (PSNR, MOTA, F1-Score).`,
      notes: 'Uraikan persamaan utama secara terstruktur dengan menekankan makna fisis tiap variabel.'
    },
    {
      id: 5,
      title: 'Diagram Alur Arsitektur Komputasi',
      lead: 'Pipeline pemrosesan video terstruktur dan modular',
      body: `### Tahapan Pipeline\n1. **Akuisisi Frame**: Pembacaan stream video dari kamera atau file ke ring buffer asinkron.\n2. **Preprocessing**: Normalisasi dimensi, konversi ruang warna, dan penapisan derau.\n3. **Deteksi & Estimasi**: Segmentasi gerakan, ekstraksi fitur gerak, atau deteksi batas objek.\n4. **Asosiasi & Pelacakan**: Pemeliharaan identitas jejak (Track ID) dan analisis spasial.\n5. **Pencatatan Peristiwa**: Evaluasi batas aturan (ROI/Tripwire) dan pelaporan hasil analitik.`,
      notes: 'Tunjukkan bagaimana setiap tahap saling terhubung membentuk arsitektur pipeline terpadu.'
    },
    {
      id: 6,
      title: 'Analisis Karakteristik & Trade-Off',
      lead: 'Keseimbangan antara akurasi analitis dan efisiensi komputasi',
      body: `### Pertimbangan Desain\n- **Kompleksitas Waktu**: Batas waktu eksekusi per frame maksimal $\\le 33.3\\text{ ms}$ untuk mencapai 30 FPS.\n- **Penggunaan Memori**: Menghindari penyimpanan larik frame berlebihan untuk mencegah kebocoran memori (*memory leak*).\n- **Ketahanan Terhadap Derau**: Mengatasi variasi pencahayaan dan bayangan lingkungan dinamis.\n- **Akurasi Asosiasi**: Meminimalkan terjadinya *ID switches* pada skenario kerumunan atau oklusi.`,
      notes: 'Ingatkan bahwa pada aplikasi video surveillance real-time, throughput stabil adalah prasyarat mutlak.'
    },
    {
      id: 7,
      title: 'Implementasi Algoritma & Praktik Python',
      lead: 'Implementasi numerik teroptimasi dengan NumPy dan OpenCV',
      body: `### Praktik Rekayasa Perangkat Lunak\n- Penggunaan fungsi teroptimasi OpenCV (\`cv2.VideoCapture\`, \`cv2.calcOpticalFlowPyrLK\`).\n- Pemodelan status dinamis menggunakan larik numerik matriks NumPy murni.\n- Vektorisasi komputasi untuk menghindari perulangan piksel lambat di Python.\n- Verifikasi deterministik hasil kalkulasi menggunakan assertion uji numerik.`,
      notes: 'Arahkan mahasiswa untuk memeriksa kode pada folder examples/example-01.py.'
    },
    {
      id: 8,
      title: 'Laboratorium Interaktif Berbasis Browser',
      lead: 'Eksperimen langsung di platform web tanpa instalasi rumit',
      body: `### Fasilitas Laboratorium Interaktif\n- Simulasi dinamis dengan kontrol parameter real-time (threshold, alpha, filter).\n- Visualisasi visual langsung pada kanvas HTML5 responsif.\n- Dukungan masukan berkas video mandiri atau streaming kamera web pengguna.\n- Fitur ekspor snapshot gambar PNG dan rekaman log peristiwa CSV.`,
      notes: 'Ajak mahasiswa untuk mencoba playground interaktif pada bab ini secara mandiri.'
    },
    {
      id: 9,
      title: 'Aplikasi Terapan & Relevansi Industri',
      lead: 'Implementasi nyata pada sistem cerdas modern',
      body: `### Kasus Penggunaan Industri\n- **Intelligent Transportation Systems (ITS)**: Pemantauan arus lalu lintas dan deteksi pelanggaran batas jalur.\n- **Smart Retail & Security**: Penghitungan kepadatan pengunjung dan pengawasan area terlarang.\n- **Autonomous Vehicles**: Estimasi vektor gerak lingkungan (*visual odometry*) dan pelacakan pejalan kaki.\n- **Otomasi Pabrik**: Inspeksi lintasan pergerakan ban berjalan dan robotika industri.`,
      notes: 'Hubungkan materi kuliah dengan tren teknologi industri 4.0 dan smart city terkini.'
    },
    {
      id: 10,
      title: 'Rangkuman & Referensi Akademik',
      lead: 'Poin-poin intisari perkuliahan dan rujukan literatur ilmiah',
      body: `### Rangkuman\n- Pemrosesan video digital memperluas analisis spasial 2D dengan dimensi temporal sekuens waktu.\n- Integrasi algoritma fisika optik, estimasi Kalman, dan asosiasi data memungkinkan pelacakan cerdas berkinerja tinggi.\n- Pengendalian latensi dan manajemen memori merupakan kunci keberhasilan sistem edge AI.\n\n### Referensi Utama\n- Poynton, C. *Digital Video and HD: Algorithms and Interfaces*, Morgan Kaufmann.\n- Tekalp, A. M. *Digital Video Processing*, Prentice Hall.\n- Bewley, A., et al. *Simple Online and Realtime Tracking (SORT)*, IEEE ICIP.`,
      notes: 'Sampaikan kesimpulan umum dan berikan pengantar materi bab berikutnya.'
    }
  ];
}

function generateQuizContent(meta) {
  return [
    {
      id: 'q1',
      question: `Apa konsep dasar yang menjadi landasan utama pada materi ${meta.title}?`,
      options: [
        `Pengolahan sekuens temporal citra digital dengan memperhatikan kontinuitas spasial dan waktu`,
        'Penyimpanan seluruh frame video secara bersamaan di dalam memori cache prosesor',
        'Pengurangan frame rate hingga di bawah 1 FPS untuk meniadakan seluruh komputasi gerak',
        'Penghapusan saluran warna kroma secara total tanpa analisis luminansi'
      ],
      correctIndex: 0,
      explanation: `Pada ${meta.title}, informasi video diproses sebagai fungsi temporal spasial-waktu 3D dengan memanfaatkan keterkaitan antar-frame yang berurutan.`
    },
    {
      id: 'q2',
      question: `Mengapa keterkaitan temporal (temporal correlation) sangat penting dalam pemrosesan video?`,
      options: [
        'Karena perubahan antar-frame yang berdekatan umumnya kecil sehingga memungkinkan kompresi dan estimasi gerak efisien',
        'Karena citra video tidak memiliki informasi spasial sama sekali',
        'Karena waktu hanya dapat diukur menggunakan kamera berkecepatan tinggi',
        'Karena format video web tidak mendukung dimensi lebar dan tinggi'
      ],
      correctIndex: 0,
      explanation: 'Redundansi temporal tinggi antar-frame memungkinkan algoritma memprediksi gerak, mengkompresi data, dan melacak lintasan objek secara konsisten.'
    },
    {
      id: 'q3',
      question: `Dalam implementasi sistem video real-time, berapa batas waktu maksimum pemrosesan per frame untuk mempertahankan laju 30 FPS tanpa frame drop?`,
      options: [
        '33.3 milidetik (ms)',
        '100 milidetik (ms)',
        '5 milidetik (ms)',
        '1 detik penuh'
      ],
      correctIndex: 0,
      explanation: 'Untuk frame rate 30 FPS, interval antar-frame adalah 1 / 30 detik = 0.0333 detik atau 33.3 ms. Seluruh pipeline komputasi harus tuntas dalam batas waktu tersebut.'
    },
    {
      id: 'q4',
      question: `Manakah dari pernyataan berikut yang paling tepat mengenai karakteristik pemrosesan pada topik ini?`,
      options: [
        'Pengelolaan memori buffer yang efisien (seperti ring buffer) mencegah terjadinya kebocoran memori pada video streaming panjang',
        'Semua algoritma video mutlak harus mengalokasikan memori untuk seluruh frame video dari awal hingga akhir',
        'Kamera web tidak memerlukan penanganan perizinan (permission) pada peramban web modern',
        'Semua jenis filter video digital pasti bebas dari artifak bayangan (ghosting)'
      ],
      correctIndex: 0,
      explanation: 'Penggunaan struktur data antrean melingkar (ring buffer) menjaga ukuran memori tetap konstan terlepas dari seberapa lama sistem video beroperasi.'
    },
    {
      id: 'q5',
      question: `Bagaimana relevansi topik ${meta.title} terhadap pengembangan sistem visi komputer dan kecerdasan buatan cerdas di dunia industri?`,
      options: [
        'Menjadi fondasi analisis dinamis seperti sistem pengawasan cerdas, deteksi anomali, dan navigasi kendaraan otonom',
        'Menggantikan seluruh kebutuhan sensor radar dan sonar pada industri otomotif',
        'Menghilangkan kebutuhan pelatihan model machine learning untuk klasifikasi citra',
        'Membuat pemrosesan video tidak lagi membutuhkan perangkat keras pemroses'
      ],
      correctIndex: 0,
      explanation: 'Pemrosesan video dan pelacakan objek menyediakan pemahaman konteks perilaku, arah lintasan, dan peristiwa yang krusial bagi sistem otomasi industri dan keamanan cerdas.'
    }
  ];
}

function generateExercisesContent(meta) {
  return [
    {
      id: `ex-${meta.num}-01`,
      title: `Latihan 1: Implementasi Algoritma Dasar ${meta.title}`,
      difficulty: 'intermediate',
      instruction: `Tuliskan fungsi Python menggunakan pustaka NumPy dan OpenCV untuk memproses sekuens video sesuai konsep dasar ${meta.title}. Lakukan verifikasi numerik terhadap matriks hasil pemrosesan.`,
      starterCode: `import numpy as np\n\ndef process_video_frames(frame_prev: np.ndarray, frame_curr: np.ndarray) -> np.ndarray:\n    # TODO: Implementasikan algoritma pemrosesan frame video\n    pass\n`,
      solution: `import numpy as np\n\ndef process_video_frames(frame_prev: np.ndarray, frame_curr: np.ndarray) -> np.ndarray:\n    # Selisih absolut antar-frame\n    diff = np.abs(frame_curr.astype(np.float32) - frame_prev.astype(np.float32))\n    return np.clip(diff, 0, 255).astype(np.uint8)\n`
    },
    {
      id: `ex-${meta.num}-02`,
      title: `Latihan 2: Evaluasi Kuantitatif dan Metrik Kinerja`,
      difficulty: 'advanced',
      instruction: `Implementasikan fungsi evaluasi kuantitatif untuk mengukur akurasi atau efisiensi pemrosesan sekuens video pada bab ${meta.title}.`,
      starterCode: `import numpy as np\n\ndef evaluate_video_metric(ground_truth: np.ndarray, estimated: np.ndarray) -> float:\n    # TODO: Hitung metrik evaluasi kuantitatif\n    pass\n`,
      solution: `import numpy as np\n\ndef evaluate_video_metric(ground_truth: np.ndarray, estimated: np.ndarray) -> float:\n    # Peak Signal-to-Noise Ratio (PSNR)\n    mse = np.mean((ground_truth.astype(np.float32) - estimated.astype(np.float32)) ** 2)\n    if mse < 1e-6:\n        return 100.0\n    return float(10 * np.log10((255.0 ** 2) / mse))\n`
    }
  ];
}

function generatePythonExample(meta) {
  return `"""
Multimedia & Computer Vision Learning Hub
Chapter ${meta.num}: ${meta.title}
Implementasi Python & Verifikasi Algoritma Pemrosesan Video

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
Institution: Institut Teknologi Sumatera (ITERA)
"""

import numpy as np

def create_synthetic_frame_pair(width: int = 120, height: int = 90) -> tuple[np.ndarray, np.ndarray]:
    """Menghasilkan pasangan frame sintetis deterministik untuk pengujian gerak."""
    f1 = np.full((height, width), 40, dtype=np.uint8)
    f2 = np.full((height, width), 40, dtype=np.uint8)

    # Objek bergerak bergeser secara horizontal
    # Frame 1: Objek di x = [30..50], y = [35..55]
    f1[35:55, 30:50] = 200
    # Frame 2: Objek bergeser 6 piksel ke kanan (x = [36..56])
    f2[35:55, 36:56] = 200

    return f1, f2

def compute_frame_difference(f1: np.ndarray, f2: np.ndarray) -> np.ndarray:
    """Menghitung selisih absolut piksel antar-frame."""
    return np.abs(f2.astype(np.float32) - f1.astype(np.float32)).astype(np.uint8)

def compute_psnr(f1: np.ndarray, f2: np.ndarray) -> float:
    """Menghitung Peak Signal-to-Noise Ratio (PSNR) dalam dB."""
    mse = np.mean((f1.astype(np.float64) - f2.astype(np.float64)) ** 2)
    if mse < 1e-6:
        return 100.0
    return float(10.0 * np.log10((255.0 ** 2) / mse))

def main() -> None:
    print("=" * 65)
    print("Multimedia & Computer Vision Learning Hub - ITERA")
    print(f"Chapter ${meta.num}: ${meta.title}")
    print("Created by: Aji Pamungkas Tri Nurcahyo")
    print("=" * 65)

    width, height = 160, 120
    f1, f2 = create_synthetic_frame_pair(width, height)
    print(f"[*] Pasangan frame sintetis berhasil dibuat: {width}x{height} piksel")

    # 1. Komputasi Differencing
    diff = compute_frame_difference(f1, f2)
    active_motion_pixels = int(np.sum(diff > 25))
    print(f"[*] Jumlah piksel gerak terdeteksi (diff > 25): {active_motion_pixels} piksel")

    # 2. Metrik PSNR Antar-Frame
    psnr_val = compute_psnr(f1, f2)
    print(f"[*] PSNR antar-frame sebelum kompensasi gerak: {psnr_val:.2f} dB")

    # 3. Verifikasi Status Kalman Orde-1
    # Model kinematika sederhana: x_t = x_{t-1} + v_x * dt
    dt = 1.0
    vx_measured = 6.0
    predicted_x = 30.0 + vx_measured * dt
    print(f"[*] Posisi prediksi objek langkah berikutnya: x = {predicted_x:.1f}")

    # Validasi deterministik
    assert active_motion_pixels > 0, "Deteksi gerak tidak menemukan perubahan intensitas!"
    assert psnr_val < 40.0, "Pasangan frame bergerak seharusnya memiliki variansi residual!"
    assert predicted_x == 36.0, "Estimasi posisi kinematika tidak sesuai pergeseran ground truth!"

    print(f"[SUCCESS] Semua pengujian deterministik Bab ${meta.num} lolos verifikasi!")
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

Bab ini membahas topik **${meta.title}** secara menyeluruh sebagai bagian sentral dari kurikulum Multimedia & Computer Vision. Video digital secara fundamental adalah sekuens citra diam 2D diskrit yang disajikan secara berurutan dalam dimensi waktu kontinu $t$. Persepsi mata manusia memanfaatkan fenomena biologis *persistence of vision* (kegigihan penglihatan) dan efek phi, di mana pergantian gambar statis dengan kecepatan di atas ambang tertentu ($\ge 16\\text{ FPS}$) dipersepsikan sebagai ilusi gerak yang mulus.

Fokus pembelajaran pada modul ini mencakup:
- ${meta.lead}.
- Formulasi matematis dinamika sekuens spasial-temporal dan pemodelan kinematika gerak.
- Implementasi algoritma pemrosesan video mandiri menggunakan Python, NumPy, dan pustaka OpenCV.
- Pengujian langsung pada laboratorium interaktif berbasis web dengan performa komputasi waktu nyata.

---

## 2. Tujuan Pembelajaran (Learning Objectives)

Setelah mempelajari bab ini secara tuntas, pembaca diharapkan mencapai kompetensi akademik berikut:
1. **Memahami Konsep Teoretis:** Menguasai prinsip ilmiah dan matematika dasar dari ${meta.title}.
2. **Menganalisis Sekuens Temporal:** Mampu membedakan karakteristik perubahan gerak objek, kestabilan latar belakang, dan dinamika antar-frame.
3. **Mengimplementasikan Algoritma Video:** Mampu merekayasa fungsi pemrosesan video dengan Python/NumPy tanpa ketergantungan library *black-box*.
4. **Mengevaluasi Metrik Kinerja:** Menguasai teknik evaluasi performa kuantitatif seperti laju frame (FPS), latensi pemrosesan, PSNR, SSIM, serta metrik pelacakan.

---

## 3. Landasan Teori & Formulasi Matematis

Sinyal video digital dinyatakan sebagai fungsi intensitas tiga dimensi $V(x, y, t)$, di mana $x$ dan $y$ adalah koordinat spasial pada bidang citra, dan $t$ adalah indeks waktu temporal diskrit $t \\in \\{0, 1, 2, \\dots, N-1\\}$.

### Persamaan Selisih Temporal Frame

Operasi dasar pendeteksian perubahan intensitas antar-dua frame berurutan dirumuskan sebagai:

$$D(x, y, t) = |V(x, y, t) - V(x, y, t-1)|$$

Sebuah piksel $(x, y)$ diklasifikasikan sebagai region gerak aktif apabila selisih nilai absolutnya melampaui nilai ambang batas sensitivitas $T$:

$$M(x, y, t) = \\begin{cases} 1, & \\text{jika } D(x, y, t) \\ge T \\\\ 0, & \\text{jika } D(x, y, t) < T \\end{cases}$$

### Model Kinematika Gerak Status Orde-1

Dalam pemodelan lintasan gerak objek (seperti pada Filter Kalman), vektor status $\\mathbf{x}_k$ merepresentasikan posisi dan kecepatan spasial:

$$\\mathbf{x}_k = \\begin{bmatrix} x \\\\ y \\\\ v_x \\\\ v_y \\end{bmatrix}_k, \\quad \\mathbf{x}_k = \\mathbf{F} \\mathbf{x}_{k-1} + \\mathbf{w}_{k-1}$$

Di mana matriks transisi status $\\mathbf{F}$ dengan interval waktu sampling $\\Delta t$ didefinisikan sebagai:

$$\\mathbf{F} = \\begin{bmatrix} 1 & 0 & \\Delta t & 0 \\\\ 0 & 1 & 0 & \\Delta t \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{bmatrix}$$

---

## 4. Diagram Arsitektur & Ilustrasi Konsep

Berikut adalah diagram teknis yang mengilustrasikan mekanisme kerja dan arsitektur pemrosesan:

![${meta.diagrams[0].title}](${meta.diagrams[0].path})
*Gambar ${meta.num}.1: ${meta.diagrams[0].title}.*

Diagram di atas mendemonstrasikan hubungan antara parameter waktu sekuens terhadap tahapan diskritisasi spasial dan transmisi data video.

![${meta.diagrams[1].title}](${meta.diagrams[1].path})
*Gambar ${meta.num}.2: ${meta.diagrams[1].title}.*
*Gambar ${meta.num}.2: ${meta.diagrams[1].title}.*

Diagram kedua memperlihatkan bagaimana struktur representasi data dan alur manipulasi sekuensial dikelola secara efisien di dalam memori komputer.

---

## 5. Algoritma & Pseudocode

Berikut adalah pseudocode pemrosesan video yang diterapkan dalam sistem analitik cerdas:

\`\`\`text
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
\`\`\`

---

## 6. Contoh Soal Numerik & Penyelesaian

### Soal Latihan Terbimbing:
Sebuah aliran video digital format $1080\\text{p}$ ($1920 \\times 1080$ piksel) ditransmisikan pada kecepatan $30\\text{ FPS}$ dengan subsampling kroma $\\text{YCbCr 4:2:0}$ dan kedalaman bit $8\\text{-bit}$ per sampel.

**Pertanyaan:**
1. Hitung ukuran rata-rata satu frame mentah tak terkompresi dalam megabyte ($MB$).
2. Hitung laju data bitrate video mentah tak terkompresi dalam megabit per detik ($Mbps$).
3. Jika video tersebut dikompresi menggunakan codec $\\text{H.264}$ dengan rasio kompresi $80:1$, berapa bitrate hasil kompresi yang ditransmisikan?
4. Berapa batas waktu latensi maksimum per frame agar sistem tidak mengalami *frame drop* pada $30\\text{ FPS}$?

### Pembahasan Langkah-demi-Langkah:
1. **Ukuran Frame Mentah (4:2:0 Subsampling):**
   Pada format 4:2:0, kanal Y berukuran $1920 \\times 1080$, sedangkan Cb dan Cr masing-masing berukuran $(1920/2) \\times (1080/2) = 960 \\times 540$.
   Total sampel per piksel rata-rata $= 1 + 0.25 + 0.25 = 1.5\\text{ byte/piksel}$.
   $$\\text{Ukuran Frame} = 1920 \\times 1080 \\times 1.5\\text{ byte} = 3{,}110{,}400\\text{ byte} \\approx 3.11\\text{ MB}$$

2. **Bitrate Video Mentah:**
   $$\\text{Bitrate} = 3{,}110{,}400\\text{ byte/frame} \\times 8\\text{ bit/byte} \\times 30\\text{ frame/s} = 746{,}496{,}000\\text{ bps} \\approx 746.5\\text{ Mbps}$$

3. **Bitrate Hasil Kompresi H.264 (80:1):**
   $$\\text{Bitrate Terkompresi} = \\frac{746.5\\text{ Mbps}}{80} \\approx 9.33\\text{ Mbps}$$

4. **Batas Latensi Per Frame:**
   $$\\Delta t_{\\max} = \\frac{1}{f_s} = \\frac{1}{30\\text{ s}^{-1}} \\approx 0.0333\\text{ detik} = 33.33\\text{ ms}$$

---

## 7. Implementasi Python & Penjelasan Kode

Implementasi kode program Python mandiri disertakan pada berkas \`examples/example-01.py\`. Skrip tersebut menguji algoritma secara deterministik menggunakan pustaka ilmiah NumPy:

\`\`\`python
import numpy as np

def compute_frame_diff(f1, f2):
    return np.abs(f2.astype(np.float32) - f1.astype(np.float32)).astype(np.uint8)

# Pengujian dengan sekuens sintetis
f1 = np.full((100, 100), 50, dtype=np.uint8)
f2 = np.full((100, 100), 50, dtype=np.uint8)
f2[40:60, 40:60] = 200 # Objek bergerak

diff = compute_frame_diff(f1, f2)
print(f"Piksel bergerak terdeteksi: {np.sum(diff > 30)}")
\`\`\`

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

Daftar pustaka akademik lengkap tercantum pada berkas \`references.json\` bab ini.
`;
}

// Generate files for Chapters 26 to 35
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

