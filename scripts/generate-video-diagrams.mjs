import fs from 'node:fs';
import path from 'node:path';

const dir = 'public/media/diagrams';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function svgTemplate(title, subtitle, elements) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <rect width="800" height="450" fill="url(#bgGrad)" rx="12" />
  <rect x="30" y="25" width="740" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="50" y="52" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold">${title}</text>
  <text x="50" y="72" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12">${subtitle} | Multimedia &amp; Computer Vision Hub - ITERA</text>

  ${elements}

  <text x="400" y="432" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">Institut Teknologi Sumatera (ITERA) • Created by Aji Pamungkas Tri Nurcahyo • CC-BY-4.0</text>
</svg>`;
}

const diagrams = [
  {
    name: 'chapter-26-video-temporal-sequence.svg',
    title: 'Representasi Sekuens Temporal & Dimensi Spasial-Waktu Video',
    subtitle: 'Chapter 26: Struktur Frame Diskrit 3D V(x, y, t) dan Parameter Frame Rate (FPS)',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="200" height="260" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1" />
        <text x="100" y="30" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Frame t-1</text>
        <circle cx="70" cy="130" r="15" fill="#38bdf8" />
      </g>
      <g transform="translate(160, 130)">
        <rect width="200" height="260" rx="8" fill="#090d16" stroke="#34d399" stroke-width="1.5" />
        <text x="100" y="30" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Frame t (Current)</text>
        <circle cx="100" cy="130" r="15" fill="#34d399" />
      </g>
      <g transform="translate(260, 150)">
        <rect width="200" height="260" rx="8" fill="#090d16" stroke="#fbbf24" stroke-width="2" />
        <text x="100" y="30" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Frame t+1</text>
        <circle cx="130" cy="130" r="15" fill="#fbbf24" />
      </g>
      <g transform="translate(500, 150)">
        <rect width="240" height="200" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1" />
        <text x="120" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Karakteristik Video Digital</text>
        <text x="20" y="75" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Resolusi: Lebar (W) x Tinggi (H)</text>
        <text x="20" y="105" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Frame Rate: fps = 1 / Delta_t</text>
        <text x="20" y="135" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Scanning: Progressive vs Interlaced</text>
        <text x="20" y="165" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Bit Depth: 8-bit / 10-bit per channel</text>
      </g>
    `
  },
  {
    name: 'chapter-26-chroma-subsampling.svg',
    title: 'Skema Subsampling Kroma (Chroma Subsampling)',
    subtitle: 'Chapter 26: Efisiensi Bandwidth Format YCbCr 4:4:4, 4:2:2, dan 4:2:0',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="200" height="270" rx="6" fill="#090d16" stroke="#38bdf8" stroke-width="1" />
        <text x="100" y="30" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">YCbCr 4:4:4</text>
        <text x="100" y="50" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Tanpa Kompresi Kroma</text>
        <g transform="translate(40, 70)">
          <rect x="0" y="0" width="20" height="20" fill="#38bdf8" /><rect x="30" y="0" width="20" height="20" fill="#38bdf8" /><rect x="60" y="0" width="20" height="20" fill="#38bdf8" /><rect x="90" y="0" width="20" height="20" fill="#38bdf8" />
          <rect x="0" y="30" width="20" height="20" fill="#38bdf8" /><rect x="30" y="30" width="20" height="20" fill="#38bdf8" /><rect x="60" y="30" width="20" height="20" fill="#38bdf8" /><rect x="90" y="30" width="20" height="20" fill="#38bdf8" />
        </g>
        <text x="100" y="240" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">100% Data Bandwidth</text>
      </g>
      <g transform="translate(290, 110)">
        <rect width="200" height="270" rx="6" fill="#090d16" stroke="#34d399" stroke-width="1" />
        <text x="100" y="30" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">YCbCr 4:2:2</text>
        <text x="100" y="50" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Subsampling Horizontal</text>
        <g transform="translate(40, 70)">
          <rect x="0" y="0" width="50" height="20" fill="#34d399" /><rect x="60" y="0" width="50" height="20" fill="#34d399" />
          <rect x="0" y="30" width="50" height="20" fill="#34d399" /><rect x="60" y="30" width="50" height="20" fill="#34d399" />
        </g>
        <text x="100" y="240" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">66.7% Data Bandwidth</text>
      </g>
      <g transform="translate(520, 110)">
        <rect width="200" height="270" rx="6" fill="#090d16" stroke="#fbbf24" stroke-width="1" />
        <text x="100" y="30" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">YCbCr 4:2:0</text>
        <text x="100" y="50" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Subsampling H &amp; V</text>
        <g transform="translate(40, 70)">
          <rect x="0" y="0" width="50" height="50" fill="#fbbf24" /><rect x="60" y="0" width="50" height="50" fill="#fbbf24" />
        </g>
        <text x="100" y="240" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">50% Data Bandwidth (Standar)</text>
      </g>
    `
  },
  {
    name: 'chapter-27-video-capture-pipeline.svg',
    title: 'Arsitektur Pipeline Akuisisi & Buffering Frame Video',
    subtitle: 'Chapter 27: Alur Sensor Kamera -> Frame Grabbing -> Ring Buffer -> Pemrosesan OpenCV',
    elements: `
      <g transform="translate(60, 140)">
        <rect width="130" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="65" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Sensor / File</text>
        <text x="65" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Raw Stream</text>
      </g>
      <line x1="190" y1="185" x2="220" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(220, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="70" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Demux &amp; Decode</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Codec to RGB</text>
      </g>
      <line x1="360" y1="185" x2="390" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(390, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="70" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">Ring Buffer</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">FIFO Queuing</text>
      </g>
      <line x1="530" y1="185" x2="560" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(560, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#a855f7" />
        <text x="70" y="40" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="11" font-weight="bold">Vision Engine</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Real-Time DSP</text>
      </g>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Sinkronisasi Clock Waktu Nyata dan Pencegahan Frame Dropping</text>
    `
  },
  {
    name: 'chapter-27-frame-buffering-strategies.svg',
    title: 'Strategi Manajemen Buffer Frame & Pencegahan Latensi',
    subtitle: 'Chapter 27: Analisis Antrean Single-Buffer, Double-Buffer, dan Ring Buffer Multithread',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#ef4444" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">Single Buffer (Blocking IO)</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Kamera dan pemrosesan berbagi satu thread</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Terjadi frame lag jika komputasi > 33 ms</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Latensi akumulatif pada streaming panjang</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#991b1b" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Rawan Frame Dropping</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Asynchronous Threaded Ring Buffer</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Thread terpisah untuk video grabber (I/O)</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Thread pemroses selalu membaca frame terbaru</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Latensi tetap rendah (&lt; 15 ms) stabil</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#065f46" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Standar Sistem Computer Vision Real-Time</text>
      </g>
    `
  },
  {
    name: 'chapter-28-video-compression-gop.svg',
    title: 'Struktur Group of Pictures (GOP): I-Frame, P-Frame & B-Frame',
    subtitle: 'Chapter 28: Redundansi Temporal, Prediksi Spasial, dan Vektor Gerak Inter-Frame',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(100, 140)">
        <rect width="60" height="90" rx="4" fill="#991b1b" stroke="#ef4444" stroke-width="1.5" />
        <text x="30" y="45" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">I</text>
        <text x="30" y="70" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="9">Intra</text>
      </g>
      <line x1="160" y1="185" x2="220" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
      <g transform="translate(220, 140)">
        <rect width="60" height="90" rx="4" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
        <text x="30" y="45" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">B</text>
        <text x="30" y="70" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="9">Bi-dir</text>
      </g>
      <line x1="280" y1="185" x2="340" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
      <g transform="translate(340, 140)">
        <rect width="60" height="90" rx="4" fill="#075985" stroke="#38bdf8" stroke-width="1.5" />
        <text x="30" y="45" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">P</text>
        <text x="30" y="70" text-anchor="middle" fill="#bae6fd" font-family="sans-serif" font-size="9">Fwd</text>
      </g>
      <line x1="400" y1="185" x2="460" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
      <g transform="translate(460, 140)">
        <rect width="60" height="90" rx="4" fill="#065f46" stroke="#10b981" stroke-width="1.5" />
        <text x="30" y="45" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">B</text>
        <text x="30" y="70" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="9">Bi-dir</text>
      </g>
      <line x1="520" y1="185" x2="580" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
      <g transform="translate(580, 140)">
        <rect width="60" height="90" rx="4" fill="#075985" stroke="#38bdf8" stroke-width="1.5" />
        <text x="30" y="45" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">P</text>
        <text x="30" y="70" text-anchor="middle" fill="#bae6fd" font-family="sans-serif" font-size="9">Fwd</text>
      </g>
      <text x="400" y="290" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">I-Frame: Titik Referensi Independen | P/B-Frame: Mengkodekan Vektor Gerak &amp; Residual</text>
    `
  },
  {
    name: 'chapter-28-video-codecs-evolution.svg',
    title: 'Evolusi Standar Video Codec & Efisiensi Kompresi',
    subtitle: 'Chapter 28: Perbandingan Efisiensi H.264 (AVC), H.265 (HEVC), VP9, dan AV1',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="660" height="260" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
        <g transform="translate(50, 40)">
          <text x="0" y="20" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">H.264 / AVC (2003)</text>
          <rect x="0" y="30" width="450" height="20" rx="4" fill="#0284c7" />
          <text x="460" y="45" fill="#cbd5e1" font-family="monospace" font-size="11">100% Baseline</text>
        </g>
        <g transform="translate(50, 95)">
          <text x="0" y="20" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">H.265 / HEVC (2013)</text>
          <rect x="0" y="30" width="270" height="20" rx="4" fill="#059669" />
          <text x="280" y="45" fill="#cbd5e1" font-family="monospace" font-size="11">~50% Bitrate (-50%)</text>
        </g>
        <g transform="translate(50, 150)">
          <text x="0" y="20" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">AOMedia AV1 (2018)</text>
          <rect x="0" y="30" width="220" height="20" rx="4" fill="#d97706" />
          <text x="230" y="45" fill="#cbd5e1" font-family="monospace" font-size="11">~40% Bitrate (-60%)</text>
        </g>
      </g>
    `
  },
  {
    name: 'chapter-29-video-temporal-filtering.svg',
    title: 'Mekanisme Penapis Temporal Video (Temporal Filtering)',
    subtitle: 'Chapter 29: Peredaman Derau Menggunakan Recursive Running Average dan Temporal Median',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Running Temporal Average</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Rekursif berbobot eksponensial</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• B_t = (1-alpha)*B_{t-1} + alpha*I_t</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Reduksi derau Gauss pada region statis</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#0369a1" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Efisien (Hanya 1 Frame Memory)</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Temporal Median Filter</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Mengurutkan intensitas piksel sepanjang N-frame</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Menghilangkan derau impuls &amp; objek melintas</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Tahan terhadap outlier transien</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#047857" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Membutuhkan N Frame Buffer</text>
      </g>
    `
  },
  {
    name: 'chapter-29-temporal-ghosting-artifacts.svg',
    title: 'Analisis Artifak Bayangan (Ghosting) pada Filtering Temporal',
    subtitle: 'Chapter 29: Kompromi Antara Denoising Latar Belakang dan Blur Dinamis Objek Cepat',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(100, 160)">
        <circle cx="100" cy="80" r="30" fill="#38bdf8" opacity="0.25" />
        <circle cx="150" cy="80" r="30" fill="#38bdf8" opacity="0.5" />
        <circle cx="200" cy="80" r="30" fill="#38bdf8" opacity="0.75" />
        <circle cx="250" cy="80" r="30" fill="#38bdf8" opacity="1.0" />
        <line x1="70" y1="130" x2="280" y2="130" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)" />
        <text x="175" y="150" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="11" font-weight="bold">Arah Gerak Objek</text>
      </g>
      <text x="400" y="320" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Ghosting terjadi ketika laju adaptasi alpha terlalu kecil pada objek berkecepatan tinggi</text>
    `
  },
  {
    name: 'chapter-30-optical-flow-constraint.svg',
    title: 'Persamaan Batasan Aliran Optik (Optical Flow Constraint Equation)',
    subtitle: 'Chapter 30: Derivasi Persamaan Gradien I_x * u + I_y * v + I_t = 0 dan Solusi Lucas-Kanade',
    elements: `
      <g transform="translate(80, 120)">
        <rect width="640" height="120" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
        <text x="320" y="45" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">I_x * u + I_y * v + I_t = 0</text>
        <text x="320" y="85" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Satu persamaan dengan dua variabel tak diketahui (Under-determined: Aperture Problem)</text>
      </g>
      <g transform="translate(80, 260)">
        <rect width="640" height="120" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
        <text x="320" y="45" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="14" font-weight="bold">[sum(Ix^2), sum(IxIy); sum(IxIy), sum(Iy^2)] [u; v] = -[sum(IxIt); sum(IyIt)]</text>
        <text x="320" y="85" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Solusi Lucas-Kanade Least-Squares Estimation (LSE) pada Jendela Spasial Lokal</text>
      </g>
    `
  },
  {
    name: 'chapter-30-lucas-kanade-vs-horn-schunck.svg',
    title: 'Perbandingan Algoritma: Lucas-Kanade vs Horn-Schunck',
    subtitle: 'Chapter 30: Metode Sparse Local Least-Squares vs Dense Global Regularization',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Lucas-Kanade (Local Method)</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Asumsi: Gerak konstan di jendela kecil</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Komputasi mandiri per blok / feature point</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Sparse Optical Flow berkecepatan tinggi</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#0369a1" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Ideal untuk Real-Time Video Tracking</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Horn-Schunck (Global Method)</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Asumsi: Medan gerak global mulus (smoothness)</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Formulasi energi variasional Euler-Lagrange</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Dense Optical Flow (Setiap piksel dihitung)</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#047857" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Komputasi Berat (Iteratif Relaksasi)</text>
      </g>
    `
  },
  {
    name: 'chapter-31-background-subtraction-pipeline.svg',
    title: 'Arsitektur Pipeline Pengurangan Latar Belakang (Background Subtraction)',
    subtitle: 'Chapter 31: Model Referensi, Differencing, Thresholding, dan Morfologi',
    elements: `
      <g transform="translate(60, 140)">
        <rect width="130" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="65" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Input Frame I_t</text>
        <text x="65" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Current Image</text>
      </g>
      <line x1="190" y1="185" x2="220" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(220, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="70" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Background Model</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Running Average B_t</text>
      </g>
      <line x1="360" y1="185" x2="390" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(390, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="70" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">Absolute Diff</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">|I_t - B_t| >= T</text>
      </g>
      <line x1="530" y1="185" x2="560" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(560, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#f43f5e" />
        <text x="70" y="40" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="11" font-weight="bold">Clean Mask</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Morph Opening</text>
      </g>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Segmentasi Objek Bergerak Tanpa Bergantung Model Pembelajaran Mesin</text>
    `
  },
  {
    name: 'chapter-31-shadow-suppression-techniques.svg',
    title: 'Karakteristik & Penekanan Bayangan (Shadow Suppression)',
    subtitle: 'Chapter 31: Perbedaan Sifat Bayangan Kromatisitas HSV vs Objek Foreground Sejati',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Karakteristik Bayangan (Shadow)</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Hue (Warna): Tetap identik dengan background</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Saturation: Perubahan sangat minim</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Value (Kecerahan): Mengalami penurunan</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#78350f" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Dideteksi melalui Rasio Intensitas V</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Objek Foreground Sejati</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Hue: Berubah total dari background</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Saturation: Mengikuti warna material objek</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Tekstur spasial berbeda nyata</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#065f46" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Dipertahankan sebagai Masker Objek</text>
      </g>
    `
  },
  {
    name: 'chapter-32-kalman-filter-cycle.svg',
    title: 'Siklus Prediksi & Koreksi Filter Kalman (Kalman Filter Loop)',
    subtitle: 'Chapter 32: Rekursi Waktu Orde-2 Antara Model Dinamika dan Pengukuran Sensor',
    elements: `
      <g transform="translate(100, 140)">
        <rect width="260" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
        <text x="130" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold">Tahap Prediksi (Time Update)</text>
        <text x="20" y="75" fill="#cbd5e1" font-family="monospace" font-size="12">x_k^- = F * x_{k-1}</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="monospace" font-size="12">P_k^- = F * P_{k-1} * F^T + Q</text>
        <text x="130" y="155" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Proyeksi Status ke Depan</text>
      </g>
      <path d="M 370 200 L 430 200" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow)" />
      <g transform="translate(440, 140)">
        <rect width="260" height="180" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" />
        <text x="130" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="bold">Tahap Koreksi (Measurement)</text>
        <text x="20" y="70" fill="#cbd5e1" font-family="monospace" font-size="11">K_k = P_k^- * H^T * inv(H P_k^- H^T + R)</text>
        <text x="20" y="105" fill="#cbd5e1" font-family="monospace" font-size="11">x_k = x_k^- + K_k * (z_k - H x_k^-)</text>
        <text x="20" y="135" fill="#cbd5e1" font-family="monospace" font-size="11">P_k = (I - K_k * H) * P_k^-</text>
        <text x="130" y="165" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Koreksi Berbasis Pengukuran z_k</text>
      </g>
    `
  },
  {
    name: 'chapter-32-tracking-by-detection.svg',
    title: 'Paradigma Pelacakan Tracking-by-Detection',
    subtitle: 'Chapter 32: Integrasi Pendeteksi Objek Diskrit dan Estimasi Lintasan Kontinu',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(90, 150)">
        <rect width="160" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="80" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Frame Detector</text>
        <text x="80" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Bounding Boxes</text>
      </g>
      <line x1="250" y1="195" x2="310" y2="195" stroke="#64748b" stroke-width="2" />
      <g transform="translate(310, 150)">
        <rect width="180" height="90" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="90" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Data Association</text>
        <text x="90" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">IoU / Centroid Cost</text>
      </g>
      <line x1="490" y1="195" x2="550" y2="195" stroke="#64748b" stroke-width="2" />
      <g transform="translate(550, 150)">
        <rect width="160" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="80" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Track Manager</text>
        <text x="80" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Lifespan &amp; ID Tag</text>
      </g>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Pemisahan Masalah Deteksi (Spasial) dan Masalah Pelacakan (Temporal)</text>
    `
  },
  {
    name: 'chapter-33-hungarian-bipartite-matching.svg',
    title: 'Asosiasi Data Dua-Arah & Algoritma Hungarian',
    subtitle: 'Chapter 33: Penyelesaian Matriks Biaya (Cost Matrix) Asosiasi Jejak ke Deteksi',
    elements: `
      <g transform="translate(100, 130)">
        <text x="40" y="30" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Prediksi Jejak (Tracks)</text>
        <circle cx="80" cy="70" r="14" fill="#0284c7" /><text x="80" y="74" text-anchor="middle" fill="#fff" font-size="10">T1</text>
        <circle cx="80" cy="120" r="14" fill="#0284c7" /><text x="80" y="124" text-anchor="middle" fill="#fff" font-size="10">T2</text>
        <circle cx="80" cy="170" r="14" fill="#0284c7" /><text x="80" y="174" text-anchor="middle" fill="#fff" font-size="10">T3</text>
      </g>
      <g transform="translate(480, 130)">
        <text x="40" y="30" fill="#10b981" font-family="sans-serif" font-size="12" font-weight="bold">Deteksi Baru (Detections)</text>
        <circle cx="80" cy="70" r="14" fill="#059669" /><text x="80" y="74" text-anchor="middle" fill="#fff" font-size="10">D1</text>
        <circle cx="80" cy="120" r="14" fill="#059669" /><text x="80" y="124" text-anchor="middle" fill="#fff" font-size="10">D2</text>
        <circle cx="80" cy="170" r="14" fill="#059669" /><text x="80" y="174" text-anchor="middle" fill="#fff" font-size="10">D3</text>
      </g>
      <!-- Bipartite matching lines -->
      <line x1="195" y1="200" x2="545" y2="200" stroke="#10b981" stroke-width="2" />
      <line x1="195" y1="250" x2="545" y2="250" stroke="#10b981" stroke-width="2" />
      <line x1="195" y1="300" x2="545" y2="300" stroke="#10b981" stroke-width="2" />
      <text x="370" y="180" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">Minimum Cost Global Optimization</text>
    `
  },
  {
    name: 'chapter-33-sort-pipeline-architecture.svg',
    title: 'Arsitektur Pelacakan Cepat SORT (Simple Online and Realtime Tracking)',
    subtitle: 'Chapter 33: Integrasi Efisien Kalman Filter + Hungarian Algorithm berbasis Jarak IoU',
    elements: `
      <g transform="translate(80, 140)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="70" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Detections</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Bounding Boxes</text>
      </g>
      <line x1="220" y1="185" x2="260" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(260, 140)">
        <rect width="160" height="90" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="80" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Kalman Predict</text>
        <text x="80" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Prior Estimates</text>
      </g>
      <line x1="420" y1="185" x2="460" y2="185" stroke="#64748b" stroke-width="2" />
      <g transform="translate(460, 140)">
        <rect width="170" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="85" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">Hungarian IoU</text>
        <text x="85" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Optimal Matching</text>
      </g>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Throughput Ekstrem: Mencapai > 60 FPS pada CPU Tunggal</text>
    `
  },
  {
    name: 'chapter-34-virtual-tripwire-logic.svg',
    title: 'Logika Deteksi Garis Virtual (Virtual Tripwire & ROI)',
    subtitle: 'Chapter 34: Perhitungan Vektor Persilangan Garis dan Pemisahan Arah In vs Out',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <line x1="120" y1="250" x2="680" y2="250" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6 6" />
      <text x="130" y="240" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">Virtual Line (Y_tripwire)</text>
      <!-- Downward arrow (In) -->
      <g transform="translate(250, 170)">
        <circle cx="0" cy="0" r="10" fill="#38bdf8" />
        <line x1="0" y1="0" x2="0" y2="130" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)" />
        <text x="15" y="70" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Arah MASUK (y_t-1 &lt; Y &amp;&amp; y_t >= Y)</text>
      </g>
      <!-- Upward arrow (Out) -->
      <g transform="translate(500, 300)">
        <circle cx="0" cy="0" r="10" fill="#10b981" />
        <line x1="0" y1="0" x2="0" y2="-110" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)" />
        <text x="15" y="-50" fill="#10b981" font-family="sans-serif" font-size="11" font-weight="bold">Arah KELUAR (y_t-1 > Y &amp;&amp; y_t &lt;= Y)</text>
      </g>
    `
  },
  {
    name: 'chapter-34-video-event-metrics.svg',
    title: 'Metrik Evaluasi Deteksi Peristiwa Video (Event Evaluation)',
    subtitle: 'Chapter 34: Toleransi Temporal, False Alarms, Precision, Recall, dan F-Score',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="660" height="260" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
        <g transform="translate(30, 40)">
          <text x="0" y="20" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">• True Positive (TP):</text>
          <text x="160" y="20" fill="#cbd5e1" font-family="sans-serif" font-size="11">Peristiwa terdeteksi tepat dalam jendela toleransi waktu Delta_t</text>
        </g>
        <g transform="translate(30, 85)">
          <text x="0" y="20" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold">• False Positive (FP):</text>
          <text x="160" y="20" fill="#cbd5e1" font-family="sans-serif" font-size="11">Alarm palsu yang terpicu oleh bayangan atau noise kamera</text>
        </g>
        <g transform="translate(30, 130)">
          <text x="0" y="20" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">• False Negative (FN):</text>
          <text x="160" y="20" fill="#cbd5e1" font-family="sans-serif" font-size="11">Peristiwa nyata yang terlewat akibat oklusi objek</text>
        </g>
        <rect x="30" y="180" width="600" height="50" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1" />
        <text x="330" y="210" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="13" font-weight="bold">F1 = 2 * (Precision * Recall) / (Precision + Recall)</text>
      </g>
    `
  },
  {
    name: 'chapter-35-applied-video-analytics-system.svg',
    title: 'Arsitektur Sistem Analitik Video Cerdas Terpadu (End-to-End)',
    subtitle: 'Chapter 35: Pipeline Lengkap dari Video Input hingga Dashboard Analitik & CSV Export',
    elements: `
      <rect x="50" y="110" width="700" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(70, 150)">
        <rect width="110" height="85" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="55" y="38" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">1. Akuisisi</text>
        <text x="55" y="60" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">CCTV / File</text>
      </g>
      <line x1="180" y1="192" x2="205" y2="192" stroke="#64748b" stroke-width="2" />
      <g transform="translate(205, 150)">
        <rect width="115" height="85" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="57" y="38" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="10" font-weight="bold">2. Deteksi</text>
        <text x="57" y="60" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Diff &amp; Mask</text>
      </g>
      <line x1="320" y1="192" x2="345" y2="192" stroke="#64748b" stroke-width="2" />
      <g transform="translate(345, 150)">
        <rect width="115" height="85" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="57" y="38" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10" font-weight="bold">3. Tracking</text>
        <text x="57" y="60" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Kalman + MOT</text>
      </g>
      <line x1="460" y1="192" x2="485" y2="192" stroke="#64748b" stroke-width="2" />
      <g transform="translate(485, 150)">
        <rect width="115" height="85" rx="6" fill="#1e293b" stroke="#a855f7" />
        <text x="57" y="38" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="10" font-weight="bold">4. Event ROI</text>
        <text x="57" y="60" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Tripwire Count</text>
      </g>
      <line x1="600" y1="192" x2="625" y2="192" stroke="#64748b" stroke-width="2" />
      <g transform="translate(625, 150)">
        <rect width="105" height="85" rx="6" fill="#1e293b" stroke="#f43f5e" />
        <text x="52" y="38" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="10" font-weight="bold">5. Ekspor</text>
        <text x="52" y="60" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">CSV &amp; Metrik</text>
      </g>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Sistem Komputasi Cerdas Berorientasi Industri dan Smart City</text>
    `
  },
  {
    name: 'chapter-35-edge-video-optimization.svg',
    title: 'Optimasi Sistem Analitik Video pada Perangkat Tepi (Edge AI)',
    subtitle: 'Chapter 35: Kompromi Resolusi, Frame Skipping, Model INT8, dan Daya Perangkat',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#f43f5e" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold">Tanpa Optimasi (Heavyweight)</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Resolusi penuh 1080p / 4K mentah</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Pemrosesan setiap frame (60 FPS)</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Konsumsi daya tinggi, panas berlebih</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#991b1b" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">FPS Drop (&lt; 5 FPS pada Edge)</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="155" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Edge-Optimized Pipeline</text>
        <text x="25" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Downsampling spasial ke 360p / 480p</text>
        <text x="25" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Temporal frame skipping (Cukup 15 FPS)</text>
        <text x="25" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Operasi integer / fixed-point hemat energi</text>
        <rect x="25" y="180" width="260" height="40" rx="4" fill="#065f46" />
        <text x="155" y="205" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Stabil 30+ FPS Real-Time</text>
      </g>
    `
  }
];

diagrams.forEach(d => {
  const fullSvg = svgTemplate(d.title, d.subtitle, d.elements);
  fs.writeFileSync(path.join(dir, d.name), fullSvg, 'utf8');
  console.log('Generated Video SVG:', d.name);
});

