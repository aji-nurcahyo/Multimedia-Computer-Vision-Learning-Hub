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

  <!-- Background -->
  <rect width="800" height="450" fill="url(#bgGrad)" rx="12" />

  <!-- Header Banner -->
  <rect x="30" y="25" width="740" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="50" y="52" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold">${title}</text>
  <text x="50" y="72" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12">${subtitle} | Multimedia &amp; Computer Vision Hub - ITERA</text>

  <!-- Main Graphical Content -->
  ${elements}

  <!-- Footer Watermark -->
  <text x="400" y="432" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">Institut Teknologi Sumatera (ITERA) • Created by Aji Pamungkas Tri Nurcahyo • CC-BY-4.0</text>
</svg>`;
}

const diagrams = [
  {
    name: 'chapter-16-sound-wave-properties.svg',
    title: 'Karakteristik Fisik Gelombang Suara (Acoustic Wave)',
    subtitle: 'Chapter 16: Frekuensi (f), Panjang Gelombang, Amplitudo (A), dan Periode (T)',
    elements: `
      <rect x="50" y="110" width="700" height="280" rx="10" fill="#090d16" stroke="#334155" stroke-width="1" />
      <line x1="80" y1="250" x2="720" y2="250" stroke="#475569" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="120" y1="130" x2="120" y2="370" stroke="#475569" stroke-width="2" />
      <path d="M 120 250 Q 180 140 240 250 T 360 250 T 480 250 T 600 250 T 720 250" fill="none" stroke="#38bdf8" stroke-width="3.5" />
      <line x1="180" y1="250" x2="180" y2="140" stroke="#f59e0b" stroke-width="2" />
      <text x="190" y="195" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">Amplitudo (+A)</text>
      <line x1="180" y1="135" x2="420" y2="135" stroke="#10b981" stroke-width="2" />
      <text x="260" y="128" fill="#10b981" font-family="sans-serif" font-size="12" font-weight="bold">Panjang Gelombang (lambda = v / f)</text>
      <text x="125" y="145" fill="#cbd5e1" font-family="sans-serif" font-size="11">Tekanan Akustik (p)</text>
      <text x="680" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="11">Waktu (t)</text>
    `
  },
  {
    name: 'chapter-16-pcm-representation.svg',
    title: 'Representasi Audio Digital: Pulse Code Modulation (PCM)',
    subtitle: 'Chapter 16: Konversi Gelombang Kontinu ke Rangkaian Kode Biner PCM',
    elements: `
      <g transform="translate(50, 110)">
        <rect width="190" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="95" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">1. Sinyal Kontinu</text>
        <path d="M 20 140 Q 60 70 100 140 T 180 140" fill="none" stroke="#38bdf8" stroke-width="2.5" />
        <text x="95" y="240" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Tekanan Akustik Udara</text>
      </g>
      <g transform="translate(290, 110)">
        <rect width="190" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="95" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">2. Sampling &amp; Quantize</text>
        <line x1="30" y1="140" x2="30" y2="110" stroke="#34d399" stroke-width="2" />
        <line x1="60" y1="140" x2="60" y2="80" stroke="#34d399" stroke-width="2" />
        <line x1="90" y1="140" x2="90" y2="95" stroke="#34d399" stroke-width="2" />
        <line x1="120" y1="140" x2="120" y2="160" stroke="#34d399" stroke-width="2" />
        <line x1="150" y1="140" x2="150" y2="190" stroke="#34d399" stroke-width="2" />
        <text x="95" y="240" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Diskritisasi fs &amp; N-bit</text>
      </g>
      <g transform="translate(530, 110)">
        <rect width="220" height="280" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
        <text x="110" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">3. Biner PCM Streaming</text>
        <text x="110" y="110" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="13">01101011 00101101</text>
        <text x="110" y="140" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="13">11010010 11110001</text>
        <text x="110" y="170" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="13">00011100 10101010</text>
        <text x="110" y="240" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">WAV / PCM Data Stream</text>
      </g>
    `
  },
  {
    name: 'chapter-17-audio-sampling-nyquist.svg',
    title: 'Teorema Sampling Nyquist-Shannon & Fenomena Aliasing',
    subtitle: 'Chapter 17: Syarat Rekonstruksi Bebas Distorsi (fs >= 2 * fmax)',
    elements: `
      <rect x="50" y="110" width="340" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
      <text x="220" y="140" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">Sampling Ideal (fs = 8 * fmax)</text>
      <path d="M 70 240 Q 110 180 150 240 T 230 240 T 310 240 T 370 240" fill="none" stroke="#38bdf8" stroke-width="2" />
      <circle cx="110" cy="180" r="4" fill="#10b981" />
      <circle cx="150" cy="240" r="4" fill="#10b981" />
      <circle cx="190" cy="300" r="4" fill="#10b981" />
      <circle cx="230" cy="240" r="4" fill="#10b981" />
      <circle cx="270" cy="180" r="4" fill="#10b981" />
      <circle cx="310" cy="240" r="4" fill="#10b981" />
      <text x="220" y="350" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Rekonstruksi Sempurna (No Aliasing)</text>

      <rect x="410" y="110" width="340" height="280" rx="8" fill="#090d16" stroke="#ef4444" stroke-width="1.5" />
      <text x="580" y="140" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="13" font-weight="bold">Under-sampling (fs &lt; 2 * fmax)</text>
      <path d="M 430 240 Q 470 180 510 240 T 590 240 T 670 240 T 730 240" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3" />
      <circle cx="470" cy="180" r="5" fill="#ef4444" />
      <circle cx="630" cy="240" r="5" fill="#ef4444" />
      <path d="M 430 200 Q 550 280 670 200" fill="none" stroke="#f87171" stroke-width="2.5" />
      <text x="580" y="350" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="11">Aliasing: Muncul Frekuensi Palsu (Ghost Tone)</text>
    `
  },
  {
    name: 'chapter-17-audio-channels-bitrate.svg',
    title: 'Struktur Multichannel Audio & Kalkulasi Bitrate',
    subtitle: 'Chapter 17: Bitrate = Sample Rate * Bit Depth * Jumlah Channel',
    elements: `
      <g transform="translate(70, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1" />
        <text x="155" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">Interleaved Stereo Frame (L/R)</text>
        <g transform="translate(25, 60)">
          <rect x="0" y="0" width="120" height="40" rx="4" fill="#0284c7" />
          <text x="60" y="25" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">Ch 1: Left</text>
          <rect x="130" y="0" width="120" height="40" rx="4" fill="#10b981" />
          <text x="190" y="25" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">Ch 2: Right</text>
        </g>
        <g transform="translate(25, 120)">
          <rect x="0" y="0" width="120" height="40" rx="4" fill="#0284c7" />
          <text x="60" y="25" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">Ch 1: Left</text>
          <rect x="130" y="0" width="120" height="40" rx="4" fill="#10b981" />
          <text x="190" y="25" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">Ch 2: Right</text>
        </g>
        <text x="155" y="215" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Format Interleaved Standar RIFF WAV</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="310" height="260" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1" />
        <text x="155" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">Perhitungan Bandwidth CD Audio</text>
        <text x="30" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Sample Rate: 44,100 Hz</text>
        <text x="30" y="115" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Bit Depth: 16-bit (2 byte)</text>
        <text x="30" y="150" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Channels: 2 (Stereo)</text>
        <rect x="25" y="180" width="260" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1" />
        <text x="155" y="210" text-anchor="middle" fill="#fcd34d" font-family="monospace" font-size="14" font-weight="bold">1,411.2 kbps (176.4 kB/s)</text>
      </g>
    `
  },
  {
    name: 'chapter-18-audio-fft-windows.svg',
    title: 'Transformasi Fourier Cepat (FFT) & Karakteristik Jendela',
    subtitle: 'Chapter 18: Komparasi Respons Spektral Rectangular, Hann, Hamming, dan Blackman',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <path d="M 100 320 Q 200 130 300 320" fill="none" stroke="#ef4444" stroke-width="2" />
      <path d="M 200 320 Q 300 150 400 320" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 300 320 Q 400 170 500 320" fill="none" stroke="#10b981" stroke-width="2" />
      <path d="M 400 320 Q 500 190 600 320" fill="none" stroke="#f59e0b" stroke-width="2" />
      <g transform="translate(100, 130)">
        <rect width="12" height="12" fill="#ef4444" />
        <text x="20" y="11" fill="#cbd5e1" font-family="sans-serif" font-size="11">Rectangular (Narrow Main-lobe, High Side-lobes)</text>
      </g>
      <g transform="translate(100, 155)">
        <rect width="12" height="12" fill="#38bdf8" />
        <text x="20" y="11" fill="#cbd5e1" font-family="sans-serif" font-size="11">Hann (Balanced Trade-off -31.5 dB Side-lobe)</text>
      </g>
      <g transform="translate(100, 180)">
        <rect width="12" height="12" fill="#10b981" />
        <text x="20" y="11" fill="#cbd5e1" font-family="sans-serif" font-size="11">Hamming (First Side-lobe Suppression -42 dB)</text>
      </g>
      <g transform="translate(100, 205)">
        <rect width="12" height="12" fill="#f59e0b" />
        <text x="20" y="11" fill="#cbd5e1" font-family="sans-serif" font-size="11">Blackman (Ultra Low Leakage -58 dB Side-lobe)</text>
      </g>
    `
  },
  {
    name: 'chapter-18-spectral-leakage.svg',
    title: 'Mekanisme Terjadinya Spectral Leakage pada Analisis DFT/FFT',
    subtitle: 'Chapter 18: Efek Diskontinuitas Batas Frame Waktu Terhadap Persebaran Energi Spektrum',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="30" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Periode Integer Utuh (No Leakage)</text>
        <path d="M 20 120 Q 60 70 100 120 T 180 120 T 260 120 T 300 120" fill="none" stroke="#38bdf8" stroke-width="2" />
        <line x1="160" y1="250" x2="160" y2="170" stroke="#10b981" stroke-width="4" />
        <text x="160" y="270" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Energi Terisolasi di Satu Bin Tunggal</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#ef4444" stroke-width="1.5" />
        <text x="160" y="30" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">Periode Non-Integer (Spectral Leakage)</text>
        <path d="M 20 120 Q 60 70 100 120 T 180 120 T 260 120 T 290 80" fill="none" stroke="#f87171" stroke-width="2" />
        <line x1="100" y1="250" x2="100" y2="220" stroke="#f59e0b" stroke-width="3" />
        <line x1="130" y1="250" x2="130" y2="195" stroke="#f59e0b" stroke-width="3" />
        <line x1="160" y1="250" x2="160" y2="175" stroke="#ef4444" stroke-width="4" />
        <line x1="190" y1="250" x2="190" y2="200" stroke="#f59e0b" stroke-width="3" />
        <line x1="220" y1="250" x2="220" y2="225" stroke="#f59e0b" stroke-width="3" />
        <text x="160" y="270" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="10">Energi Bocor (Smear) ke Bin Tetangga</text>
      </g>
    `
  },
  {
    name: 'chapter-19-digital-audio-filters.svg',
    title: 'Empat Topologi Dasar Filter Audio Digital',
    subtitle: 'Chapter 19: Low-Pass, High-Pass, Band-Pass, dan Notch / Band-Stop Filter',
    elements: `
      <g transform="translate(50, 110)">
        <rect width="160" height="270" rx="6" fill="#090d16" stroke="#38bdf8" stroke-width="1" />
        <text x="80" y="30" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Low-Pass (LPF)</text>
        <path d="M 20 90 L 80 90 Q 110 90 140 180" fill="none" stroke="#38bdf8" stroke-width="2.5" />
        <text x="80" y="230" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Loloskan Frekuensi Rendah</text>
      </g>
      <g transform="translate(230, 110)">
        <rect width="160" height="270" rx="6" fill="#34d399" stroke="#34d399" stroke-width="1" fill-opacity="0.1" />
        <text x="80" y="30" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">High-Pass (HPF)</text>
        <path d="M 20 180 Q 50 90 80 90 L 140 90" fill="none" stroke="#34d399" stroke-width="2.5" />
        <text x="80" y="230" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Loloskan Frekuensi Tinggi</text>
      </g>
      <g transform="translate(410, 110)">
        <rect width="160" height="270" rx="6" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" fill-opacity="0.1" />
        <text x="80" y="30" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Band-Pass (BPF)</text>
        <path d="M 20 180 Q 60 180 80 90 Q 100 180 140 180" fill="none" stroke="#fbbf24" stroke-width="2.5" />
        <text x="80" y="230" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Loloskan Pita Frekuensi</text>
      </g>
      <g transform="translate(590, 110)">
        <rect width="160" height="270" rx="6" fill="#f87171" stroke="#f87171" stroke-width="1" fill-opacity="0.1" />
        <text x="80" y="30" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">Notch / Band-Stop</text>
        <path d="M 20 90 Q 60 90 80 180 Q 100 90 140 90" fill="none" stroke="#f87171" stroke-width="2.5" />
        <text x="80" y="230" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Redam Hum Listrik 50/60Hz</text>
      </g>
    `
  },
  {
    name: 'chapter-19-fir-vs-iir.svg',
    title: 'Perbandingan Arsitektur: FIR vs IIR Digital Filter',
    subtitle: 'Chapter 19: Linear Phase vs Computational Efficiency pada Pemrosesan Audio Digital',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">FIR (Finite Impulse Response)</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Respon impuls terbatas ke N-sampel</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Selalu Stabil (Semua pole di titik origin)</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Linear Phase murni (Zero phase distortion)</text>
        <text x="20" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Membutuhkan komputasi tinggi (Taps > 64)</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#0369a1" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="monospace" font-size="11">y[n] = sum(b_k * x[n-k])</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">IIR (Infinite Impulse Response)</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Memiliki umpan balik (Feedback recursion)</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Risiko instabilitas jika pole di luar unit circle</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Non-linear phase (Terjadi pergeseran grup)</text>
        <text x="20" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Sangat efisien (Cukup Biquad Order-2)</text>
        <rect x="20" y="210" width="280" height="40" rx="4" fill="#047857" />
        <text x="160" y="235" text-anchor="middle" fill="#fff" font-family="monospace" font-size="10">y[n] = sum(b_k*x[n-k]) - sum(a_k*y[n-k])</text>
      </g>
    `
  },
  {
    name: 'chapter-20-stft-spectrogram-tradeoff.svg',
    title: 'Kompromi Resolusi Waktu-Frekuensi Heisenberg-Gabor',
    subtitle: 'Chapter 20: Dilema Pemilihan Panjang Jendela (Window Size) pada Analisis STFT',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Jendela Sempit (Narrow Window)</text>
        <text x="160" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">N_FFT = 128 / 256 titik</text>
        <g transform="translate(30, 80)">
          <rect x="0" y="0" width="40" height="120" fill="#0284c7" opacity="0.8" stroke="#38bdf8" />
          <rect x="50" y="0" width="40" height="120" fill="#0284c7" opacity="0.8" stroke="#38bdf8" />
          <rect x="100" y="0" width="40" height="120" fill="#0284c7" opacity="0.8" stroke="#38bdf8" />
          <rect x="150" y="0" width="40" height="120" fill="#0284c7" opacity="0.8" stroke="#38bdf8" />
          <rect x="200" y="0" width="40" height="120" fill="#0284c7" opacity="0.8" stroke="#38bdf8" />
        </g>
        <text x="160" y="240" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Resolusi Waktu Tinggi, Frekuensi Rendah</text>
        <text x="160" y="260" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Ideal untuk analisis transien impuls &amp; onset perkusi</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1" />
        <text x="160" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Jendela Lebar (Wide Window)</text>
        <text x="160" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">N_FFT = 2048 / 4096 titik</text>
        <g transform="translate(30, 80)">
          <rect x="0" y="0" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
          <rect x="0" y="45" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
          <rect x="0" y="90" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
          <rect x="130" y="0" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
          <rect x="130" y="45" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
          <rect x="130" y="90" width="120" height="35" fill="#d97706" opacity="0.8" stroke="#fbbf24" />
        </g>
        <text x="160" y="240" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">Resolusi Frekuensi Tinggi, Waktu Rendah</text>
        <text x="160" y="260" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Ideal untuk pemisahan nada harmonik vokal</text>
      </g>
    `
  },
  {
    name: 'chapter-20-mel-scale-spectrogram.svg',
    title: 'Transformasi Skala Hertz ke Skala Persepsi Mel',
    subtitle: 'Chapter 20: Pemetaan Frekuensi Non-Linier Berdasarkan Persepsi Auditori Manusia',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <line x1="120" y1="340" x2="680" y2="340" stroke="#475569" stroke-width="2" />
      <line x1="120" y1="340" x2="120" y2="150" stroke="#475569" stroke-width="2" />
      <path d="M 120 340 Q 250 200 680 160" fill="none" stroke="#10b981" stroke-width="3.5" />
      <text x="680" y="365" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="11">Frekuensi Fisik Linier (Hz: 0 - 8000 Hz)</text>
      <text x="105" y="150" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="11">Tinggi Nada (Mel)</text>
      <g transform="translate(250, 180)">
        <rect width="360" height="60" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1" />
        <text x="180" y="28" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">m = 2595 * log10(1 + f / 700)</text>
        <text x="180" y="48" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Linier di bawah 1 kHz, Logaritmik di atas 1 kHz</text>
      </g>
    `
  },
  {
    name: 'chapter-21-audio-features-overview.svg',
    title: 'Taksonomi Fitur Audio: Domain Waktu & Domain Spektral',
    subtitle: 'Chapter 21: Ekstraksi Parameter Akustik untuk Machine Learning & Pattern Recognition',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">Fitur Domain Waktu (Temporal)</text>
        <g transform="translate(20, 60)">
          <text x="0" y="25" fill="#cbd5e1" font-family="sans-serif" font-size="11">• RMS Energy: Kekuatan magnitudo sinyal</text>
          <text x="0" y="55" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Zero-Crossing Rate (ZCR): Kerapatan zero pass</text>
          <text x="0" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Autocorrelation: Periodisitas &amp; Pitch</text>
          <text x="0" y="115" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Attack / Decay Time: Transien dinamika</text>
        </g>
        <rect x="20" y="210" width="280" height="45" rx="4" fill="#0369a1" />
        <text x="160" y="238" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Komputasi Ringan (O(N) Time Complexity)</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">Fitur Domain Spektral</text>
        <g transform="translate(20, 60)">
          <text x="0" y="25" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Spectral Centroid: Pusat massa spektrum</text>
          <text x="0" y="55" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Spectral Spread: Lebar pita spektral</text>
          <text x="0" y="85" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Spectral Flatness: Rasio nada vs derau</text>
          <text x="0" y="115" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Spectral Rolloff: Batas frekuensi atas</text>
        </g>
        <rect x="20" y="210" width="280" height="45" rx="4" fill="#b45309" />
        <text x="160" y="238" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="10">Membutuhkan Transformasi FFT (O(N log N))</text>
      </g>
    `
  },
  {
    name: 'chapter-21-mfcc-pipeline.svg',
    title: 'Arsitektur Komputasi MFCC (Mel-Frequency Cepstral Coefficients)',
    subtitle: 'Chapter 21: Alur Pemrosesan Ekstraksi Fitur Akustik Standar Speech Recognition',
    elements: `
      <g transform="translate(60, 130)">
        <g transform="translate(0, 0)">
          <rect width="120" height="55" rx="6" fill="#1e293b" stroke="#38bdf8" />
          <text x="60" y="32" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">1. Pre-emphasis</text>
        </g>
        <line x1="120" y1="27" x2="140" y2="27" stroke="#64748b" stroke-width="2" />
        <g transform="translate(140, 0)">
          <rect width="120" height="55" rx="6" fill="#1e293b" stroke="#38bdf8" />
          <text x="60" y="32" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">2. Framing &amp; Win</text>
        </g>
        <line x1="260" y1="27" x2="280" y2="27" stroke="#64748b" stroke-width="2" />
        <g transform="translate(280, 0)">
          <rect width="120" height="55" rx="6" fill="#1e293b" stroke="#38bdf8" />
          <text x="60" y="32" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">3. FFT Magnitude</text>
        </g>
        <line x1="400" y1="27" x2="420" y2="27" stroke="#64748b" stroke-width="2" />
        <g transform="translate(420, 0)">
          <rect width="120" height="55" rx="6" fill="#1e293b" stroke="#10b981" />
          <text x="60" y="32" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">4. Mel Filterbank</text>
        </g>
        <line x1="540" y1="27" x2="560" y2="27" stroke="#64748b" stroke-width="2" />
        <g transform="translate(560, 0)">
          <rect width="120" height="55" rx="6" fill="#1e293b" stroke="#f59e0b" />
          <text x="60" y="32" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">5. Log &amp; DCT-II</text>
        </g>
      </g>
      <rect x="180" y="240" width="440" height="90" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
      <text x="400" y="270" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">Output Vektor MFCC (13 / 39 Koefisien)</text>
      <text x="400" y="300" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Representasi Selubung Spektral Vokal (Vocal Tract Envelope)</text>
    `
  },
  {
    name: 'chapter-22-speech-production-formants.svg',
    title: 'Model Saluran Suara Manusia & Formant Vokal',
    subtitle: 'Chapter 22: Resonansi Akustik Pita Suara (Glottis) dan Frekuensi Formant F1, F2, F3',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <path d="M 100 320 Q 160 160 220 320" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 260 320 Q 340 190 420 320" fill="none" stroke="#34d399" stroke-width="2.5" />
      <path d="M 460 320 Q 540 230 620 320" fill="none" stroke="#fbbf24" stroke-width="2.5" />
      <text x="160" y="150" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Formant F1 (~700 Hz)</text>
      <text x="160" y="170" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Bukaan Rahang (Vokal /a/)</text>

      <text x="340" y="180" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Formant F2 (~1200 Hz)</text>
      <text x="340" y="200" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Posisi Lidah Depan/Belakang</text>

      <text x="540" y="220" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Formant F3 (~2500 Hz)</text>
      <text x="540" y="240" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Konstriksi Bibir &amp; Retrofleksi</text>
    `
  },
  {
    name: 'chapter-22-vad-pitch-estimation.svg',
    title: 'Voice Activity Detection (VAD) & Estimasi Nada (Pitch)',
    subtitle: 'Chapter 22: Pemisahan Suara Wicara vs Sunyi dan Penentuan Frekuensi Dasar F0 Autokorelasi',
    elements: `
      <g transform="translate(60, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">VAD Berbasis Energi &amp; ZCR</text>
        <rect x="25" y="70" width="60" height="120" fill="#1e293b" stroke="#475569" />
        <text x="55" y="135" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="10">Sunyi</text>
        <rect x="95" y="70" width="130" height="120" fill="#064e3b" stroke="#10b981" />
        <text x="160" y="135" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Segmen Wicara Aktif</text>
        <rect x="235" y="70" width="60" height="120" fill="#1e293b" stroke="#475569" />
        <text x="265" y="135" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="10">Sunyi</text>
        <text x="160" y="240" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Thresholding: Energy > Eth AND ZCR &lt; Zth</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="280" rx="8" fill="#090d16" stroke="#0284c7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">F0 Pitch via Autokorelasi (ACF)</text>
        <path d="M 30 160 Q 80 160 110 210 Q 160 80 210 210 Q 250 160 290 160" fill="none" stroke="#38bdf8" stroke-width="2" />
        <circle cx="160" cy="80" r="5" fill="#f59e0b" />
        <text x="160" y="65" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">Peak Lag (tau)</text>
        <text x="160" y="240" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Pitch F0 = fs / lag_peak (Hz)</text>
      </g>
    `
  },
  {
    name: 'chapter-23-asr-pipeline-wer.svg',
    title: 'Arsitektur Pengenalan Wicara (ASR) & Metrik Evaluasi WER',
    subtitle: 'Chapter 23: Acoustic Model, Language Model, dan Penghitungan Word Error Rate',
    elements: `
      <g transform="translate(60, 120)">
        <rect width="190" height="100" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="95" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Acoustic Model (AM)</text>
        <text x="95" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Audio -> Fonem Probabilitas</text>
      </g>
      <line x1="250" y1="170" x2="285" y2="170" stroke="#94a3b8" stroke-width="2" />
      <g transform="translate(285, 120)">
        <rect width="190" height="100" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="95" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Language Model (LM)</text>
        <text x="95" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Tata Bahasa &amp; N-Gram</text>
      </g>
      <line x1="475" y1="170" x2="510" y2="170" stroke="#94a3b8" stroke-width="2" />
      <g transform="translate(510, 120)">
        <rect width="230" height="100" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="115" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Beam Search Decoder</text>
        <text x="115" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Transkripsi Kata Optimal</text>
      </g>
      <rect x="150" y="260" width="500" height="90" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
      <text x="400" y="295" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="bold">WER = (Substitusi + Deletion + Insertion) / N</text>
      <text x="400" y="325" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Evaluasi berbasis Levenshtein Distance pada tingkat kata</text>
    `
  },
  {
    name: 'chapter-23-tts-synthesis-architecture.svg',
    title: 'Arsitektur Sintesis Suara Text-to-Speech (TTS)',
    subtitle: 'Chapter 23: Front-End Pemrosesan Teks, Acoustic Model, dan Neural Vocoder',
    elements: `
      <g transform="translate(60, 140)">
        <rect width="200" height="120" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1.5" />
        <text x="100" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">1. Text Normalizer</text>
        <text x="100" y="70" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Normalisasi Angka &amp; Akronim,</text>
        <text x="100" y="90" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Grapheme-to-Phoneme (G2P)</text>
      </g>
      <line x1="260" y1="200" x2="295" y2="200" stroke="#64748b" stroke-width="2" />
      <g transform="translate(295, 140)">
        <rect width="210" height="120" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="105" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">2. Spectrogram Gen</text>
        <text x="105" y="70" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">FastSpeech 2 / Tacotron</text>
        <text x="105" y="90" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Memprediksi Mel-Spectrogram</text>
      </g>
      <line x1="505" y1="200" x2="540" y2="200" stroke="#64748b" stroke-width="2" />
      <g transform="translate(540, 140)">
        <rect width="200" height="120" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1.5" />
        <text x="100" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">3. Neural Vocoder</text>
        <text x="100" y="70" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">HiFi-GAN / WaveGlow</text>
        <text x="100" y="90" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="10">Sintesis Waveform Audio PCM</text>
      </g>
    `
  },
  {
    name: 'chapter-24-audio-classification-pipeline.svg',
    title: 'Pipeline Klasifikasi Audio & Deteksi Peristiwa Suara (SED)',
    subtitle: 'Chapter 24: Dari Raw Audio Waveform -> Log-Mel Spectrogram -> CNN/Transformer Backbone',
    elements: `
      <rect x="60" y="110" width="680" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(80, 140)">
        <rect width="120" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="60" y="35" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Raw Audio</text>
        <text x="60" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">44.1 kHz / 16-bit</text>
      </g>
      <line x1="200" y1="180" x2="230" y2="180" stroke="#64748b" stroke-width="2" />
      <g transform="translate(230, 140)">
        <rect width="130" height="80" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="65" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Log-Mel Spec</text>
        <text x="65" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">128 Mel Bins</text>
      </g>
      <line x1="360" y1="180" x2="390" y2="180" stroke="#64748b" stroke-width="2" />
      <g transform="translate(390, 140)">
        <rect width="150" height="80" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="75" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">2D CNN / PANNs</text>
        <text x="75" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Deep Feature Map</text>
      </g>
      <line x1="540" y1="180" x2="570" y2="180" stroke="#64748b" stroke-width="2" />
      <g transform="translate(570, 140)">
        <rect width="140" height="80" rx="6" fill="#1e293b" stroke="#ef4444" />
        <text x="70" y="35" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="bold">Softmax Prob</text>
        <text x="70" y="55" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Kategori Suara</text>
      </g>
      <text x="400" y="290" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Multi-class / Multi-label Acoustic Event Detection Architecture</text>
    `
  },
  {
    name: 'chapter-24-confusion-matrix-metrics.svg',
    title: 'Matriks Kebingungan (Confusion Matrix) & Metrik Akurasi Audio',
    subtitle: 'Chapter 24: Evaluasi Presisi, Recall, dan F1-Score pada Klasifikasi Suara Multi-Kelas',
    elements: `
      <g transform="translate(100, 120)">
        <rect width="280" height="240" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
        <rect x="30" y="30" width="100" height="90" fill="#065f46" stroke="#10b981" stroke-width="1" />
        <text x="80" y="70" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">TP: 85</text>
        <rect x="140" y="30" width="100" height="90" fill="#991b1b" stroke="#ef4444" stroke-width="1" />
        <text x="190" y="70" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">FP: 15</text>
        <rect x="30" y="130" width="100" height="90" fill="#991b1b" stroke="#ef4444" stroke-width="1" />
        <text x="80" y="170" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">FN: 10</text>
        <rect x="140" y="130" width="100" height="90" fill="#065f46" stroke="#10b981" stroke-width="1" />
        <text x="190" y="170" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">TN: 90</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="280" height="240" rx="8" fill="#090d16" stroke="#f59e0b" stroke-width="1" />
        <text x="140" y="35" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">Hasil Evaluasi Model</text>
        <text x="30" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Precision: 85.0%</text>
        <text x="30" y="115" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Recall: 89.5%</text>
        <text x="30" y="150" fill="#cbd5e1" font-family="sans-serif" font-size="12">• F1-Score: 87.2%</text>
        <text x="30" y="185" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Accuracy: 87.5%</text>
      </g>
    `
  },
  {
    name: 'chapter-25-intelligent-audio-system.svg',
    title: 'Arsitektur Sistem Pemrosesan Audio Cerdas Menyeluruh (End-to-End)',
    subtitle: 'Chapter 25: Integrasi Akuisisi, Denoising, Ekstraksi Fitur, dan Inferensi Cerdas',
    elements: `
      <rect x="50" y="110" width="700" height="280" rx="8" fill="#090d16" stroke="#334155" stroke-width="1" />
      <g transform="translate(70, 150)">
        <rect width="120" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" />
        <text x="60" y="40" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">Mikrofon / Input</text>
        <text x="60" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Signal Stream</text>
      </g>
      <line x1="190" y1="195" x2="220" y2="195" stroke="#64748b" stroke-width="2" />
      <g transform="translate(220, 150)">
        <rect width="120" height="90" rx="6" fill="#1e293b" stroke="#10b981" />
        <text x="60" y="40" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">Filter &amp; VAD</text>
        <text x="60" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Noise Reduction</text>
      </g>
      <line x1="340" y1="195" x2="370" y2="195" stroke="#64748b" stroke-width="2" />
      <g transform="translate(370, 150)">
        <rect width="120" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" />
        <text x="60" y="40" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">MFCC / STFT</text>
        <text x="60" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Acoustic Feature</text>
      </g>
      <line x1="490" y1="195" x2="520" y2="195" stroke="#64748b" stroke-width="2" />
      <g transform="translate(520, 150)">
        <rect width="140" height="90" rx="6" fill="#1e293b" stroke="#ef4444" />
        <text x="70" y="40" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="bold">AI Engine</text>
        <text x="70" y="65" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Anomaly / Classifier</text>
      </g>
      <text x="400" y="310" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">Sistem Otomasi Deteksi Akustik Real-Time Berakurasi Tinggi</text>
    `
  },
  {
    name: 'chapter-25-edge-audio-pipeline.svg',
    title: 'Pipeline Komputasi Audio Cerdas pada Perangkat Tepi (Edge AI)',
    subtitle: 'Chapter 25: Optimasi Model TinyML, Kuantisasi INT8, dan Inferensi Hemat Daya',
    elements: `
      <g transform="translate(60, 120)">
        <rect width="320" height="260" rx="8" fill="#090d16" stroke="#a855f7" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="12" font-weight="bold">Cloud-Based Audio AI</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Latensi Jaringan Tinggi (100 - 500 ms)</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Bergantung koneksi internet aktif</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Risiko privasi rekaman suara pengguna</text>
        <text x="20" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Konsumsi daya transmisi radio kontinu</text>
      </g>
      <g transform="translate(420, 120)">
        <rect width="320" height="260" rx="8" fill="#090d16" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="35" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Edge / On-Device Audio AI</text>
        <text x="20" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Latensi Real-Time Ultra Rendah (&lt; 15 ms)</text>
        <text x="20" y="110" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Beroperasi 100% offline tanpa sinyal</text>
        <text x="20" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Privasi data terjamin (Zero Data Leaks)</text>
        <text x="20" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="11">• Kuantisasi INT8 &amp; Microcontroller Ready</text>
      </g>
    `
  }
];

diagrams.forEach(d => {
  const fullSvg = svgTemplate(d.title, d.subtitle, d.elements);
  fs.writeFileSync(path.join(dir, d.name), fullSvg, 'utf8');
  console.log('Generated:', d.name);
});

