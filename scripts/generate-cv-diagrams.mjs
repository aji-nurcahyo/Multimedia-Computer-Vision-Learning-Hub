import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('public/media/diagrams');
fs.mkdirSync(outDir, { recursive: true });

function wrapSvg(title, subtitle, content, w = 800, h = 450) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bgGrad)" rx="12" />
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="#334155" stroke-width="1.5" rx="10" />

  <!-- Title & Subtitle -->
  <text x="30" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#f8fafc">${title}</text>
  <text x="30" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="400" fill="#94a3b8">${subtitle}</text>

  <!-- Header Divider -->
  <line x1="30" y1="78" x2="${w - 30}" y2="78" stroke="#334155" stroke-width="1" />

  <!-- Diagram Graphics Content -->
  ${content}

  <!-- Footer / Attribution -->
  <line x1="30" y1="${h - 32}" x2="${w - 30}" y2="${h - 32}" stroke="#334155" stroke-width="1" />
  <text x="30" y="${h - 14}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b">Multimedia &amp; Computer Vision Hub · Institut Teknologi Sumatera (ITERA) · Aji Pamungkas Tri Nurcahyo</text>
  <text x="${w - 30}" y="${h - 14}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#38bdf8" text-anchor="end">CC-BY-4.0 License</text>
</svg>`;
}

const diagrams = [
  // Ch 36
  {
    name: 'chapter-36-coordinate-systems-and-geometry.svg',
    title: 'Transformasi Geometri & Koordinat Citra 2D',
    subtitle: 'Perbedaan Sistem Koordinat Layar vs Kartesian dan Matriks Homogen Transformasi',
    content: `
      <!-- Cartesian vs Screen Coordinates -->
      <g transform="translate(60, 110)">
        <rect width="300" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold">Koordinat Citra (Array 2D)</text>
        <line x1="40" y1="60" x2="260" y2="60" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow)"/>
        <line x1="40" y1="60" x2="40" y2="220" stroke="#10b981" stroke-width="2"/>
        <text x="270" y="65" fill="#f43f5e" font-size="12" font-family="monospace">X (Kolom, W)</text>
        <text x="45" y="235" fill="#10b981" font-size="12" font-family="monospace">Y (Baris, H)</text>
        <circle cx="40" cy="60" r="4" fill="#fbbf24"/>
        <text x="50" y="55" fill="#fbbf24" font-size="11" font-family="monospace">(0, 0) Origin</text>
        <rect x="100" y="110" width="100" height="70" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-dasharray="4"/>
        <text x="110" y="150" fill="#e2e8f0" font-size="12">Pixel [y, x]</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#a855f7" font-family="sans-serif" font-size="14" font-weight="bold">Matriks Transformasi Afinitas Homogen</text>
        <text x="30" y="80" fill="#e2e8f0" font-family="monospace" font-size="14">
          [x']   [ s_x·cosθ  -sinθ   t_x ] [x]
        </text>
        <text x="30" y="110" fill="#e2e8f0" font-family="monospace" font-size="14">
          [y'] = [  sinθ    s_y·cosθ t_y ] [y]
        </text>
        <text x="30" y="140" fill="#e2e8f0" font-family="monospace" font-size="14">
          [ 1]   [    0        0      1  ] [1]
        </text>
        <rect x="25" y="170" width="270" height="60" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="35" y="195" fill="#38bdf8" font-size="11">Derajat Kebebasan (DoF) Afinitas = 6</text>
        <text x="35" y="215" fill="#94a3b8" font-size="11">Mempertahankan paralelisme garis lurus</text>
      </g>
    `
  },
  {
    name: 'chapter-36-affine-vs-perspective-warping.svg',
    title: 'Transformasi Afinitas vs Perspektif (Homografi)',
    subtitle: 'Perbandingan 6 DoF Afinitas vs 8 DoF Projective Warping',
    content: `
      <g transform="translate(60, 110)">
        <rect width="300" height="260" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Transformasi Afinitas (6 DoF)</text>
        <polygon points="60,190 180,160 240,210 120,240" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
        <text x="30" y="70" fill="#94a3b8" font-size="12">• Garis sejajar tetap sejajar</text>
        <text x="30" y="95" fill="#94a3b8" font-size="12">• Rasio panjang segmen terjaga</text>
        <text x="30" y="120" fill="#34d399" font-size="12">Kebutuhan titik korespondensi: 3 Titik</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
        <text x="20" y="30" fill="#ec4899" font-size="14" font-weight="bold">Transformasi Perspektif / Homografi (8 DoF)</text>
        <polygon points="70,150 250,170 210,245 90,230" fill="#be185d" fill-opacity="0.3" stroke="#ec4899" stroke-width="2"/>
        <text x="30" y="70" fill="#94a3b8" font-size="12">• Garis sejajar berkonvergensi ke titik lenyap</text>
        <text x="30" y="95" fill="#94a3b8" font-size="12">• Memodelkan rotasi kamera &amp; distorsi bidang</text>
        <text x="30" y="120" fill="#fbbf24" font-size="12">Kebutuhan titik korespondensi: 4 Titik</text>
      </g>
    `
  },

  // Ch 37
  {
    name: 'chapter-37-harris-corner-detector.svg',
    title: 'Prinsip Deteksi Sudut Harris & Matriks Autokorelasi',
    subtitle: 'Eigenvalue Matriks Struktur Spasial M untuk Klasifikasi Flat, Edge, dan Corner',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Diagram Eigenvalue (λ1 vs λ2)</text>
        <line x1="50" y1="210" x2="270" y2="210" stroke="#64748b" stroke-width="2"/>
        <line x1="50" y1="210" x2="50" y2="60" stroke="#64748b" stroke-width="2"/>
        <text x="275" y="215" fill="#94a3b8" font-size="11">λ1</text>
        <text x="45" y="55" fill="#94a3b8" font-size="11">λ2</text>
        <!-- Regions -->
        <rect x="60" y="180" width="50" height="25" fill="#475569" fill-opacity="0.4"/>
        <text x="65" y="197" fill="#94a3b8" font-size="10">FLAT</text>
        <rect x="180" y="170" width="70" height="35" fill="#f59e0b" fill-opacity="0.3"/>
        <text x="195" y="192" fill="#fbbf24" font-size="11">EDGE</text>
        <rect x="60" y="80" width="60" height="50" fill="#f59e0b" fill-opacity="0.3"/>
        <text x="75" y="110" fill="#fbbf24" font-size="11">EDGE</text>
        <rect x="160" y="80" width="90" height="70" fill="#10b981" fill-opacity="0.3"/>
        <text x="180" y="120" fill="#34d399" font-size="12" font-weight="bold">CORNER</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#a855f7" font-size="14" font-weight="bold">Fungsi Respon Harris R</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="13">R = det(M) - k · [trace(M)]²</text>
        <text x="20" y="100" fill="#94a3b8" font-size="11">dimana k konstan empiris (0.04 - 0.06)</text>
        <rect x="20" y="130" width="280" height="100" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="155" fill="#34d399" font-size="11">R &gt; Threshold: Sudut (Corner Keypoint)</text>
        <text x="30" y="180" fill="#f59e0b" font-size="11">R &lt; 0: Tepi Garis Lurus (Edge)</text>
        <text x="30" y="205" fill="#64748b" font-size="11">|R| ≈ 0: Area Datar Tanpa Tekstur (Flat)</text>
      </g>
    `
  },
  {
    name: 'chapter-37-feature-matching-and-ransac.svg',
    title: 'Pencocokan Fitur & Penolakan Outlier via RANSAC',
    subtitle: 'Lowe Ratio Test dan Konsensus Estimasi Homografi',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <rect x="40" y="40" width="180" height="180" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="80" y="30" fill="#38bdf8" font-size="12" font-weight="bold">Citra Kueri (Left)</text>
        <rect x="480" y="40" width="180" height="180" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="520" y="30" fill="#818cf8" font-size="12" font-weight="bold">Citra Target (Right)</text>
        <!-- Inliers (green lines) -->
        <circle cx="80" cy="80" r="4" fill="#10b981"/>
        <circle cx="520" cy="90" r="4" fill="#10b981"/>
        <line x1="80" y1="80" x2="520" y2="90" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="160" cy="140" r="4" fill="#10b981"/>
        <circle cx="600" cy="150" r="4" fill="#10b981"/>
        <line x1="160" y1="140" x2="600" y2="150" stroke="#10b981" stroke-width="1.5"/>
        <!-- Outlier (red line) -->
        <circle cx="120" cy="180" r="4" fill="#f43f5e"/>
        <circle cx="510" cy="60" r="4" fill="#f43f5e"/>
        <line x1="120" y1="180" x2="510" y2="60" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4"/>
        <text x="250" y="100" fill="#10b981" font-size="11">Inlier (Konsisten Homografi H)</text>
        <text x="250" y="170" fill="#f43f5e" font-size="11">Outlier (Dieliminasi RANSAC)</text>
      </g>
    `
  },

  // Ch 38
  {
    name: 'chapter-38-pinhole-camera-model.svg',
    title: 'Model Kamera Pinhole & Matriks Intrinsik K',
    subtitle: 'Proyeksi Titik 3D Dunia Menjadi Koordinat Piksel Sensor 2D',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- 3D Object -->
        <circle cx="100" cy="80" r="6" fill="#38bdf8"/>
        <text x="80" y="65" fill="#38bdf8" font-size="12">P(X, Y, Z)</text>
        <!-- Center of projection (pinhole) -->
        <circle cx="340" cy="170" r="4" fill="#fbbf24"/>
        <text x="310" y="195" fill="#fbbf24" font-size="12">Pinhole (C)</text>
        <!-- Rays -->
        <line x1="100" y1="80" x2="340" y2="170" stroke="#94a3b8" stroke-dasharray="3"/>
        <line x1="340" y1="170" x2="560" y2="250" stroke="#94a3b8" stroke-dasharray="3"/>
        <!-- Image Plane -->
        <line x1="480" y1="60" x2="480" y2="240" stroke="#f43f5e" stroke-width="2"/>
        <text x="460" y="50" fill="#f43f5e" font-size="12">Image Plane</text>
        <circle cx="480" cy="222" r="5" fill="#34d399"/>
        <text x="500" y="225" fill="#34d399" font-size="12">p(u, v)</text>
        <!-- Focal length arrow -->
        <line x1="340" y1="230" x2="480" y2="230" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#arrow)"/>
        <text x="390" y="220" fill="#fbbf24" font-size="11">Focal Length f</text>
      </g>
    `
  },
  {
    name: 'chapter-38-radial-tangential-distortion.svg',
    title: 'Distorsi Lensa Kamera: Radial & Tangensial',
    subtitle: 'Model Distorsi Brown-Conrady: Barrel, Pincushion, dan Rektifikasi',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#f59e0b" font-size="14" font-weight="bold">Distorsi Radial (Barrel vs Pincushion)</text>
        <!-- Barrel shape -->
        <path d="M 60,80 Q 140,65 220,80 Q 235,140 220,200 Q 140,215 60,200 Q 45,140 60,80" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <text x="100" y="145" fill="#fbbf24" font-size="11">Barrel (k1 &lt; 0)</text>
        <text x="20" y="240" fill="#94a3b8" font-size="11">r_dist = r(1 + k1·r² + k2·r⁴)</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Distorsi Tangensial (Sensor Tilt)</text>
        <rect x="50" y="80" width="160" height="120" rx="4" fill="none" stroke="#38bdf8" stroke-width="1.5" transform="rotate(-6, 130, 140)"/>
        <text x="60" y="140" fill="#38bdf8" font-size="11">Ketidaksejajaran Lensa-Sensor</text>
        <text x="20" y="240" fill="#94a3b8" font-size="11">Parameter p1, p2 dalam cv2.calibrateCamera</text>
      </g>
    `
  },

  // Ch 39
  {
    name: 'chapter-39-epipolar-geometry.svg',
    title: 'Geometri Epipolar pada Stereo Vision',
    subtitle: 'Garis Epipolar, Epipole, Bidang Epipolar, dan Matriks Fundamental F',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Left & Right Cameras -->
        <circle cx="140" cy="180" r="6" fill="#38bdf8"/>
        <text x="120" y="205" fill="#38bdf8" font-size="12">Kamera O_L</text>
        <circle cx="560" cy="180" r="6" fill="#818cf8"/>
        <text x="540" y="205" fill="#818cf8" font-size="12">Kamera O_R</text>
        <!-- Baseline -->
        <line x1="140" y1="180" x2="560" y2="180" stroke="#fbbf24" stroke-width="2"/>
        <text x="330" y="170" fill="#fbbf24" font-size="12">Baseline B</text>
        <!-- 3D point X -->
        <circle cx="350" cy="60" r="6" fill="#34d399"/>
        <text x="340" y="45" fill="#34d399" font-size="12">X (3D)</text>
        <line x1="140" y1="180" x2="350" y2="60" stroke="#38bdf8" stroke-dasharray="3"/>
        <line x1="560" y1="180" x2="350" y2="60" stroke="#818cf8" stroke-dasharray="3"/>
        <!-- Formula -->
        <text x="240" y="235" fill="#f8fafc" font-family="monospace" font-size="13">Batasan Epipolar: x_R^T · F · x_L = 0</text>
      </g>
    `
  },
  {
    name: 'chapter-39-stereo-disparity-depth-triangulation.svg',
    title: 'Triangulasi Disparitas & Estimasi Kedalaman Stereo',
    subtitle: 'Hubungan Terbalik Antara Disparitas d dan Kedalaman Z (Z = f·B / d)',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Formulasi Disparitas d</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="14">d = x_Left - x_Right</text>
        <text x="20" y="110" fill="#34d399" font-family="monospace" font-size="14">Z = (f · B) / d</text>
        <rect x="20" y="140" width="280" height="90" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="165" fill="#94a3b8" font-size="11">• d besar ➔ Objek dekat dengan kamera</text>
        <text x="30" y="190" fill="#94a3b8" font-size="11">• d kecil ➔ Objek jauh dari kamera</text>
        <text x="30" y="215" fill="#f43f5e" font-size="11">• d = 0 ➔ Objek di tak terhingga (Z = ∞)</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#a855f7" font-size="14" font-weight="bold">Peta Disparitas (Disparity Map)</text>
        <rect x="40" y="60" width="240" height="150" rx="6" fill="#0f172a" stroke="#64748b"/>
        <!-- Heatmap colors -->
        <circle cx="120" cy="130" r="30" fill="#f43f5e" fill-opacity="0.8"/>
        <text x="100" y="135" fill="#fff" font-size="10">Dekat (Tinggi)</text>
        <circle cx="210" cy="110" r="20" fill="#3b82f6" fill-opacity="0.6"/>
        <text x="195" y="115" fill="#fff" font-size="9">Jauh</text>
      </g>
    `
  },

  // Ch 40
  {
    name: 'chapter-40-hog-feature-pipeline.svg',
    title: 'Pipeline Deskriptor Histogram of Oriented Gradients (HOG)',
    subtitle: 'Ekstraksi Gradien, Kuantisasi 9-Bin Orientasi, dan Normalisasi Blok 2x2',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Step 1 -->
        <rect x="30" y="50" width="120" height="140" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="80" fill="#38bdf8" font-size="12" font-weight="bold">1. Gradien</text>
        <text x="45" y="110" fill="#94a3b8" font-size="10">Sobel Gx, Gy</text>
        <text x="45" y="130" fill="#94a3b8" font-size="10">Magnitude &amp;</text>
        <text x="45" y="150" fill="#94a3b8" font-size="10">Angle θ</text>
        <!-- Arrow -->
        <line x1="160" y1="120" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
        <!-- Step 2 -->
        <rect x="200" y="50" width="130" height="140" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="215" y="80" fill="#818cf8" font-size="12" font-weight="bold">2. Cell 8x8</text>
        <text x="215" y="110" fill="#94a3b8" font-size="10">Voting bobot</text>
        <text x="215" y="130" fill="#94a3b8" font-size="10">ke 9 bin sudut</text>
        <text x="215" y="150" fill="#94a3b8" font-size="10">(0° - 180°)</text>
        <!-- Arrow -->
        <line x1="340" y1="120" x2="370" y2="120" stroke="#64748b" stroke-width="2"/>
        <!-- Step 3 -->
        <rect x="380" y="50" width="140" height="140" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="395" y="80" fill="#34d399" font-size="12" font-weight="bold">3. Block 2x2</text>
        <text x="395" y="110" fill="#94a3b8" font-size="10">Normalisasi L2</text>
        <text x="395" y="130" fill="#94a3b8" font-size="10">4 sel x 9 bin</text>
        <text x="395" y="150" fill="#94a3b8" font-size="10">= 36 fitur/blok</text>
        <!-- Arrow -->
        <line x1="530" y1="120" x2="550" y2="120" stroke="#64748b" stroke-width="2"/>
        <!-- Step 4 -->
        <rect x="560" y="50" width="110" height="140" rx="6" fill="#0f172a" stroke="#f43f5e"/>
        <text x="575" y="80" fill="#f43f5e" font-size="12" font-weight="bold">4. SVM</text>
        <text x="575" y="110" fill="#94a3b8" font-size="10">Vektor 1D</text>
        <text x="575" y="130" fill="#94a3b8" font-size="10">Klasifikasi</text>
        <text x="575" y="150" fill="#94a3b8" font-size="10">Pedestrian</text>
      </g>
    `
  },
  {
    name: 'chapter-40-template-matching-ncc.svg',
    title: 'Pengenalan Objek Klasik: Template Matching NCC',
    subtitle: 'Koefisien Korelasi Silang Ternormalisasi (Normalized Cross-Correlation)',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Citra Input &amp; Sliding Window</text>
        <rect x="40" y="60" width="240" height="160" fill="#0f172a" stroke="#64748b"/>
        <rect x="130" y="100" width="60" height="60" fill="#38bdf8" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
        <text x="140" y="135" fill="#38bdf8" font-size="10">Target T</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#34d399" font-size="14" font-weight="bold">Korelasi NCC R(x, y)</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="11">
          γ(x,y) = Σ (f - μ_f)(t - μ_t) / (σ_f · σ_t)
        </text>
        <rect x="20" y="100" width="280" height="130" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="130" fill="#34d399" font-size="11">• Nilai γ = +1.0: Cocok sempurna</text>
        <text x="30" y="160" fill="#fbbf24" font-size="11">• Nilai γ = 0.0: Tidak berkorelasi</text>
        <text x="30" y="190" fill="#f43f5e" font-size="11">• Invarian terhadap perubahan kecerahan linier</text>
        <text x="30" y="215" fill="#94a3b8" font-size="11">• Sensitif terhadap rotasi dan skala</text>
      </g>
    `
  },

  // Ch 41
  {
    name: 'chapter-41-cnn-convolution-and-pooling.svg',
    title: 'Operasi Dasar CNN: Konvolusi Spasial & Max Pooling',
    subtitle: 'Ekstraksi Fitur Hierarkis, Stride, Padding, dan Downsampling',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Input Tensor -->
        <rect x="40" y="60" width="120" height="120" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="45" y="45" fill="#38bdf8" font-size="12">Input (H x W x C)</text>
        <rect x="50" y="70" width="40" height="40" fill="#38bdf8" fill-opacity="0.4" stroke="#60a5fa"/>
        <!-- Kernel -->
        <rect x="200" y="80" width="60" height="60" fill="#818cf8" fill-opacity="0.3" stroke="#818cf8" stroke-width="1.5"/>
        <text x="200" y="70" fill="#818cf8" font-size="11">Kernel (k x k)</text>
        <line x1="165" y1="110" x2="195" y2="110" stroke="#64748b" stroke-width="2"/>
        <!-- Feature Map -->
        <rect x="310" y="60" width="120" height="120" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
        <text x="310" y="45" fill="#34d399" font-size="12">Feature Map (Conv)</text>
        <line x1="265" y1="110" x2="305" y2="110" stroke="#64748b" stroke-width="2"/>
        <!-- Pooling -->
        <line x1="435" y1="110" x2="485" y2="110" stroke="#64748b" stroke-width="2"/>
        <rect x="490" y="90" width="60" height="60" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="480" y="75" fill="#f43f5e" font-size="12">Max Pool (2x2)</text>
        <text x="490" y="175" fill="#94a3b8" font-size="10">H/2 x W/2</text>
      </g>
    `
  },
  {
    name: 'chapter-41-activation-functions-comparison.svg',
    title: 'Fungsi Aktivasi Non-Linier: ReLU, Sigmoid & Tanh',
    subtitle: 'Mitigasi Masalah Vanishing Gradient pada Pelatihan Jaringan Saraf Dalam',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
        <text x="20" y="30" fill="#34d399" font-size="14" font-weight="bold">Rectified Linear Unit (ReLU)</text>
        <!-- ReLU plot -->
        <line x1="50" y1="180" x2="270" y2="180" stroke="#64748b" stroke-width="1.5"/>
        <line x1="160" y1="220" x2="160" y2="60" stroke="#64748b" stroke-width="1.5"/>
        <path d="M 50,180 L 160,180 L 250,90" fill="none" stroke="#34d399" stroke-width="3"/>
        <text x="20" y="240" fill="#e2e8f0" font-family="monospace" font-size="12">f(x) = max(0, x)</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Sigmoid vs Leaky ReLU</text>
        <line x1="50" y1="180" x2="270" y2="180" stroke="#64748b" stroke-width="1.5"/>
        <line x1="160" y1="220" x2="160" y2="60" stroke="#64748b" stroke-width="1.5"/>
        <!-- Sigmoid S-curve -->
        <path d="M 60,175 Q 140,175 160,140 Q 180,105 260,105" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="20" y="240" fill="#e2e8f0" font-family="monospace" font-size="12">σ(x) = 1 / (1 + e^-x)</text>
      </g>
    `
  },

  // Ch 42
  {
    name: 'chapter-42-image-classification-pipeline.svg',
    title: 'Arsitektur Pipeline Klasifikasi Citra Berbasis CNN',
    subtitle: 'Backbone Konvolusi, Global Average Pooling, dan Lapisan Fully Connected',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <rect x="30" y="60" width="100" height="120" rx="4" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="125" fill="#38bdf8" font-size="12">Citra Input</text>
        <line x1="135" y1="120" x2="165" y2="120" stroke="#64748b" stroke-width="2"/>
        <rect x="170" y="40" width="220" height="160" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="190" y="70" fill="#818cf8" font-size="13" font-weight="bold">Feature Extractor Backbone</text>
        <text x="200" y="105" fill="#94a3b8" font-size="11">Conv ➔ BatchNorm ➔ ReLU</text>
        <text x="200" y="130" fill="#94a3b8" font-size="11">Residual Block / Bottleneck</text>
        <text x="200" y="155" fill="#94a3b8" font-size="11">Max / Global Avg Pooling</text>
        <line x1="395" y1="120" x2="425" y2="120" stroke="#64748b" stroke-width="2"/>
        <rect x="430" y="50" width="240" height="140" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="450" y="80" fill="#34d399" font-size="13" font-weight="bold">Classification Head</text>
        <text x="450" y="110" fill="#e2e8f0" font-size="11">Linear Layer (Logits)</text>
        <text x="450" y="135" fill="#e2e8f0" font-size="11">Softmax Probabilitas: Σ p_i = 1</text>
        <text x="450" y="160" fill="#fbbf24" font-size="11">Output: [Cat: 0.92, Dog: 0.08]</text>
      </g>
    `
  },
  {
    name: 'chapter-42-softmax-cross-entropy-loss.svg',
    title: 'Fungsi Kerugian Cross-Entropy & Distribusi Softmax',
    subtitle: 'Gradien Penalti Perbedaan Distribusi Probabilitas Prediksi vs Ground Truth',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Kalkulasi Softmax</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="13">p_i = exp(z_i) / Σ exp(z_j)</text>
        <!-- Bar chart of probs -->
        <rect x="40" y="100" width="180" height="25" fill="#34d399" rx="3"/>
        <text x="230" y="118" fill="#34d399" font-size="12">90% Kelas 1</text>
        <rect x="40" y="135" width="20" height="25" fill="#64748b" rx="3"/>
        <text x="70" y="153" fill="#94a3b8" font-size="12">7% Kelas 2</text>
        <rect x="40" y="170" width="10" height="25" fill="#64748b" rx="3"/>
        <text x="60" y="188" fill="#94a3b8" font-size="12">3% Kelas 3</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="20" y="30" fill="#f43f5e" font-size="14" font-weight="bold">Categorical Cross-Entropy Loss</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="13">L = - Σ y_k · log(p_k)</text>
        <rect x="20" y="100" width="280" height="120" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="130" fill="#34d399" font-size="11">Jika target = 1 &amp; p = 0.99 ➔ L ≈ 0.01</text>
        <text x="30" y="160" fill="#fbbf24" font-size="11">Jika target = 1 &amp; p = 0.50 ➔ L ≈ 0.69</text>
        <text x="30" y="190" fill="#f43f5e" font-size="11">Jika target = 1 &amp; p = 0.01 ➔ L ≈ 4.60 (Penalti Berat)</text>
      </g>
    `
  },

  // Ch 43
  {
    name: 'chapter-43-transfer-learning-strategies.svg',
    title: 'Strategi Transfer Learning: Feature Extraction vs Fine-Tuning',
    subtitle: 'Pembekuan Bobot Layer Awal (Frozen Backbone) vs Fine-Tuning Selektif',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">1. Fixed Feature Extractor</text>
        <rect x="30" y="60" width="260" height="90" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-dasharray="4"/>
        <text x="50" y="95" fill="#38bdf8" font-size="12" font-weight="bold">Pretrained Backbone (FROZEN)</text>
        <text x="50" y="120" fill="#94a3b8" font-size="11">Gradien = False (Bobot tidak diubah)</text>
        <rect x="30" y="170" width="260" height="60" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="50" y="195" fill="#34d399" font-size="12" font-weight="bold">Kepala Klasifikasi Baru (TRAINABLE)</text>
        <text x="50" y="215" fill="#94a3b8" font-size="11">Linear Layer disesuaikan jumlah kelas baru</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="20" y="30" fill="#fbbf24" font-size="14" font-weight="bold">2. Fine-Tuning Penuh / Sebagian</text>
        <rect x="30" y="60" width="260" height="50" rx="6" fill="#0f172a" stroke="#64748b"/>
        <text x="50" y="90" fill="#94a3b8" font-size="11">Early Layers: Beku (Fitur Garis/Tekstur)</text>
        <rect x="30" y="120" width="260" height="50" rx="6" fill="#0f172a" stroke="#f59e0b"/>
        <text x="50" y="150" fill="#fbbf24" font-size="11">Deep Layers: Dilatih dengan LR Sangat Kecil (1e-5)</text>
        <rect x="30" y="180" width="260" height="50" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="50" y="210" fill="#34d399" font-size="11">Head Layer: Dilatih dengan LR Standar (1e-3)</text>
      </g>
    `
  },
  {
    name: 'chapter-43-learning-rate-fine-tuning.svg',
    title: 'Penjadwalan Learning Rate & Kurva Konvergensi Transfer Learning',
    subtitle: 'Pencegahan Catastrophic Forgetting pada Bobot Pretrained ImageNet',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Chart axes -->
        <line x1="60" y1="210" x2="640" y2="210" stroke="#64748b" stroke-width="2"/>
        <line x1="60" y1="210" x2="60" y2="40" stroke="#64748b" stroke-width="2"/>
        <text x="610" y="235" fill="#94a3b8" font-size="12">Epoch</text>
        <text x="20" y="50" fill="#94a3b8" font-size="12">Akurasi</text>
        <!-- Scratch training (slow, blue) -->
        <path d="M 60,205 Q 200,195 350,150 T 640,110" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5"/>
        <text x="480" y="130" fill="#60a5fa" font-size="11">Dari Awal (Scratch - Lambat)</text>
        <!-- Transfer Learning (fast, green) -->
        <path d="M 60,140 Q 150,75 300,65 T 640,55" fill="none" stroke="#10b981" stroke-width="3"/>
        <text x="350" y="55" fill="#34d399" font-size="12" font-weight="bold">Transfer Learning (Konvergensi Cepat)</text>
      </g>
    `
  },

  // Ch 44
  {
    name: 'chapter-44-yolo-grid-and-anchor-boxes.svg',
    title: 'Arsitektur Grid & Anchor Box Deteksi Objek YOLO',
    subtitle: 'Prediksi Simultan Koordinat Bounding Box, Skor Objectness, dan Kelas',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- S x S Grid -->
        <rect x="40" y="50" width="160" height="160" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="80" y1="50" x2="80" y2="210" stroke="#334155"/>
        <line x1="120" y1="50" x2="120" y2="210" stroke="#334155"/>
        <line x1="160" y1="50" x2="160" y2="210" stroke="#334155"/>
        <line x1="40" y1="90" x2="200" y2="90" stroke="#334155"/>
        <line x1="40" y1="130" x2="200" y2="130" stroke="#334155"/>
        <line x1="40" y1="170" x2="200" y2="170" stroke="#334155"/>
        <rect x="80" y="90" width="40" height="40" fill="#f43f5e" fill-opacity="0.4"/>
        <text x="50" y="235" fill="#38bdf8" font-size="11">Grid Sel S x S (Pusat Objek)</text>
        <!-- Vector Output -->
        <rect x="250" y="60" width="410" height="140" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="270" y="90" fill="#818cf8" font-size="13" font-weight="bold">Tensor Output Setiap Grid Sel B x (5 + C):</text>
        <text x="280" y="125" fill="#e2e8f0" font-family="monospace" font-size="12">
          [ t_x, t_y, t_w, t_h, Objectness_Conf, P(C_1) ... P(C_k) ]
        </text>
        <text x="280" y="165" fill="#94a3b8" font-size="11">
          Bounding Box aktual: b_x = σ(t_x) + c_x, b_w = p_w · exp(t_w)
        </text>
      </g>
    `
  },
  {
    name: 'chapter-44-iou-and-non-max-suppression.svg',
    title: 'Intersection-over-Union (IoU) & Non-Maximum Suppression (NMS)',
    subtitle: 'Eliminasi Deteksi Duplikat dan Evaluasi Ketepatan Spasial Prediksi',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Intersection over Union (IoU)</text>
        <!-- Two boxes overlapping -->
        <rect x="50" y="70" width="110" height="90" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="2"/>
        <rect x="100" y="100" width="110" height="90" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="2"/>
        <rect x="100" y="100" width="60" height="60" fill="#fbbf24" fill-opacity="0.5"/>
        <text x="20" y="225" fill="#e2e8f0" font-family="monospace" font-size="12">IoU = Area(Irisan) / Area(Gabungan)</text>
        <text x="20" y="245" fill="#94a3b8" font-size="11">Ambang batas standar mAP50: IoU ≥ 0.50</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#f43f5e" font-size="14" font-weight="bold">Prosedur NMS (Supresi Duplikasi)</text>
        <text x="20" y="70" fill="#94a3b8" font-size="11">1. Urutkan seluruh kotak prediksi berdasarkan skor keyakinan.</text>
        <text x="20" y="105" fill="#94a3b8" font-size="11">2. Pilih kotak dengan keyakinan tertinggi sebagai acuan.</text>
        <text x="20" y="140" fill="#f43f5e" font-size="11">3. Hitung IoU terhadap kotak lain dari kelas yang sama.</text>
        <text x="20" y="175" fill="#f43f5e" font-size="11">4. Hapus (suppress) kotak yang memiliki IoU &gt; NMS_Threshold.</text>
        <text x="20" y="210" fill="#34d399" font-size="11">5. Ulangi sampai semua kandidat selesai diproses.</text>
      </g>
    `
  },

  // Ch 45
  {
    name: 'chapter-45-semantic-vs-instance-segmentation.svg',
    title: 'Taksonomi Segmentasi: Semantik, Instansi, dan Panoptik',
    subtitle: 'Klasifikasi Piksel Per Kategori vs Pembedaan Individu Objek Terpisah',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Segmentasi Semantik (Semantic)</text>
        <circle cx="100" cy="110" r="30" fill="#3b82f6" fill-opacity="0.7"/>
        <circle cx="170" cy="110" r="30" fill="#3b82f6" fill-opacity="0.7"/>
        <text x="20" y="180" fill="#e2e8f0" font-size="12">Semua domba diberi satu label warna sama.</text>
        <text x="20" y="205" fill="#94a3b8" font-size="11">Hanya membedakan kelas piksel (Person, Car, Sky).</text>
        <text x="20" y="230" fill="#94a3b8" font-size="11">Tidak membedakan identitas antar instansi.</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
        <text x="20" y="30" fill="#ec4899" font-size="14" font-weight="bold">Segmentasi Instansi (Instance)</text>
        <circle cx="100" cy="110" r="30" fill="#10b981" fill-opacity="0.7"/>
        <circle cx="170" cy="110" r="30" fill="#f59e0b" fill-opacity="0.7"/>
        <text x="20" y="180" fill="#e2e8f0" font-size="12">Domba 1 (Hijau) dan Domba 2 (Kuning) terpisah.</text>
        <text x="20" y="205" fill="#94a3b8" font-size="11">Mendeteksi bounding box + mask per objek.</text>
        <text x="20" y="230" fill="#34d399" font-size="11">Mask R-CNN / YOLOv8-Seg</text>
      </g>
    `
  },
  {
    name: 'chapter-45-unet-encoder-decoder-architecture.svg',
    title: 'Arsitektur Jaringan U-Net & Skip Connections',
    subtitle: 'Enkoder Kontraksi Spasial, Dekoder Ekspansi, dan Penggabungan Fitur Resolusi Tinggi',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Left Encoder Steps -->
        <rect x="50" y="50" width="80" height="40" fill="#0f172a" stroke="#38bdf8"/>
        <text x="65" y="75" fill="#38bdf8" font-size="11">Conv 1</text>
        <rect x="90" y="110" width="80" height="40" fill="#0f172a" stroke="#38bdf8"/>
        <text x="105" y="135" fill="#38bdf8" font-size="11">Conv 2</text>
        <rect x="130" y="170" width="80" height="40" fill="#0f172a" stroke="#38bdf8"/>
        <text x="145" y="195" fill="#38bdf8" font-size="11">Bottleneck</text>
        <!-- Right Decoder Steps -->
        <rect x="530" y="110" width="80" height="40" fill="#0f172a" stroke="#34d399"/>
        <text x="545" y="135" fill="#34d399" font-size="11">UpConv 2</text>
        <rect x="570" y="50" width="80" height="40" fill="#0f172a" stroke="#34d399"/>
        <text x="585" y="75" fill="#34d399" font-size="11">UpConv 1</text>
        <!-- Skip connections (horizontal arrows) -->
        <line x1="130" y1="70" x2="570" y2="70" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4"/>
        <text x="320" y="65" fill="#fbbf24" font-size="11">Skip Connection 1</text>
        <line x1="170" y1="130" x2="530" y2="130" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4"/>
        <text x="320" y="125" fill="#fbbf24" font-size="11">Skip Connection 2</text>
      </g>
    `
  },

  // Ch 46
  {
    name: 'chapter-46-vit-patch-embedding-architecture.svg',
    title: 'Arsitektur Vision Transformer (ViT) & Patch Embedding',
    subtitle: 'Pembagian Citra Menjadi Patch PxP, Proyeksi Linear, dan Positional Encoding',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <rect x="30" y="60" width="120" height="120" fill="#0f172a" stroke="#38bdf8"/>
        <line x1="70" y1="60" x2="70" y2="180" stroke="#334155"/>
        <line x1="110" y1="60" x2="110" y2="180" stroke="#334155"/>
        <line x1="30" y1="100" x2="150" y2="100" stroke="#334155"/>
        <line x1="30" y1="140" x2="150" y2="140" stroke="#334155"/>
        <text x="35" y="45" fill="#38bdf8" font-size="12">Citra (H x W x C)</text>
        <line x1="155" y1="120" x2="195" y2="120" stroke="#64748b" stroke-width="2"/>
        <rect x="200" y="60" width="150" height="120" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="215" y="85" fill="#818cf8" font-size="12" font-weight="bold">Linear Projection</text>
        <text x="215" y="115" fill="#e2e8f0" font-size="10">N = (H·W)/P² Patch</text>
        <text x="215" y="135" fill="#e2e8f0" font-size="10">+ [CLS] Token Token</text>
        <text x="215" y="155" fill="#fbbf24" font-size="10">+ Positional Embedding</text>
        <line x1="355" y1="120" x2="395" y2="120" stroke="#64748b" stroke-width="2"/>
        <rect x="400" y="50" width="270" height="150" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="420" y="80" fill="#34d399" font-size="13" font-weight="bold">Transformer Encoder Block (L-layer)</text>
        <text x="420" y="110" fill="#94a3b8" font-size="11">• LayerNorm + Multi-Head Attention</text>
        <text x="420" y="135" fill="#94a3b8" font-size="11">• Residual Connection (Skip Add)</text>
        <text x="420" y="160" fill="#94a3b8" font-size="11">• MLP Feed-Forward Network</text>
        <text x="420" y="185" fill="#38bdf8" font-size="11">Output MLP Head: Klasifikasi [CLS]</text>
      </g>
    `
  },
  {
    name: 'chapter-46-multihead-self-attention-mechanism.svg',
    title: 'Mekanisme Scaled Dot-Product Multi-Head Attention',
    subtitle: 'Matriks Query (Q), Key (K), Value (V), dan Atensi Antar-Token Visual',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Formulasi Self-Attention</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="12">
          Attention(Q,K,V) = softmax(Q·K^T / √d_k) · V
        </text>
        <rect x="20" y="100" width="280" height="130" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="130" fill="#94a3b8" font-size="11">• Q (Query): Apa yang dicari oleh token</text>
        <text x="30" y="160" fill="#94a3b8" font-size="11">• K (Key): Indeks identitas token lain</text>
        <text x="30" y="190" fill="#94a3b8" font-size="11">• V (Value): Muatan informasi aktual</text>
        <text x="30" y="215" fill="#34d399" font-size="11">• √d_k: Penyekala penstabil gradien softmax</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#a855f7" font-size="14" font-weight="bold">Matriks Bobot Atensi (N x N)</text>
        <rect x="40" y="60" width="160" height="160" fill="#0f172a" stroke="#818cf8"/>
        <!-- Matrix cells with heatmap -->
        <rect x="40" y="60" width="40" height="40" fill="#a855f7" fill-opacity="0.8"/>
        <rect x="80" y="60" width="40" height="40" fill="#3b82f6" fill-opacity="0.3"/>
        <rect x="120" y="100" width="40" height="40" fill="#10b981" fill-opacity="0.7"/>
        <rect x="160" y="140" width="40" height="40" fill="#f43f5e" fill-opacity="0.8"/>
        <text x="210" y="140" fill="#94a3b8" font-size="11">Korelasi Spasial Global Tanpa Batasan Lokalitas Kernel Conv</text>
      </g>
    `
  },

  // Ch 47
  {
    name: 'chapter-47-human-pose-keypoints-topology.svg',
    title: 'Topologi 17 Landmark Human Pose Estimation (Format COCO)',
    subtitle: 'Struktur Graf Sambungan Skeletal Persendian Tubuh Manusia 2D',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Stick figure with labeled joints -->
        <!-- Head -->
        <circle cx="200" cy="50" r="14" fill="#38bdf8"/>
        <text x="220" y="55" fill="#38bdf8" font-size="11">0: Hidung (Nose)</text>
        <!-- Shoulders -->
        <circle cx="160" cy="90" r="6" fill="#10b981"/>
        <circle cx="240" cy="90" r="6" fill="#10b981"/>
        <line x1="160" y1="90" x2="240" y2="90" stroke="#10b981" stroke-width="3"/>
        <!-- Spine / Torso -->
        <line x1="200" y1="64" x2="200" y2="150" stroke="#94a3b8" stroke-width="2"/>
        <!-- Hips -->
        <circle cx="170" cy="150" r="6" fill="#f59e0b"/>
        <circle cx="230" cy="150" r="6" fill="#f59e0b"/>
        <line x1="170" y1="150" x2="230" y2="150" stroke="#f59e0b" stroke-width="3"/>
        <!-- Arms -->
        <circle cx="130" cy="120" r="5" fill="#10b981"/>
        <line x1="160" y1="90" x2="130" y2="120" stroke="#10b981" stroke-width="2"/>
        <circle cx="110" cy="150" r="5" fill="#10b981"/>
        <line x1="130" y1="120" x2="110" y2="150" stroke="#10b981" stroke-width="2"/>
        <!-- Legs -->
        <circle cx="160" cy="200" r="5" fill="#f43f5e"/>
        <line x1="170" y1="150" x2="160" y2="200" stroke="#f43f5e" stroke-width="2"/>
        <circle cx="155" cy="245" r="5" fill="#f43f5e"/>
        <line x1="160" y1="200" x2="155" y2="245" stroke="#f43f5e" stroke-width="2"/>
        <!-- Right side summary box -->
        <rect x="360" y="40" width="310" height="190" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="380" y="70" fill="#38bdf8" font-size="13" font-weight="bold">Topologi 17 Keypoint COCO:</text>
        <text x="380" y="100" fill="#94a3b8" font-size="11">• Wajah (0-4): Hidung, Mata Kiri/Kanan, Telinga</text>
        <text x="380" y="125" fill="#94a3b8" font-size="11">• Ekstremitas Atas (5-10): Bahu, Siku, Pergelangan</text>
        <text x="380" y="150" fill="#94a3b8" font-size="11">• Panggul &amp; Batang Tubuh (11-12): Pinggul Kiri/Kanan</text>
        <text x="380" y="175" fill="#94a3b8" font-size="11">• Ekstremitas Bawah (13-16): Lutut, Pergelangan Kaki</text>
        <text x="380" y="205" fill="#34d399" font-size="11">Format Output: [x, y, v] dimana v = visibilitas/skor</text>
      </g>
    `
  },
  {
    name: 'chapter-47-heatmap-regression-architecture.svg',
    title: 'Metode Regresi Heatmap vs Regresi Titik Langsung',
    subtitle: 'Probabilitas Gaussian 2D per Keypoint vs Estimasi Koordinat Numerik Langsung',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">1. Heatmap-based (OpenPose / HRNet)</text>
        <rect x="40" y="60" width="160" height="140" fill="#0f172a" stroke="#64748b"/>
        <circle cx="120" cy="130" r="25" fill="#f43f5e" fill-opacity="0.8"/>
        <text x="20" y="225" fill="#94a3b8" font-size="11">• Memprediksi peta Gaussian 2D K kanal</text>
        <text x="20" y="245" fill="#34d399" font-size="11">• Akurasi spasial tinggi dan stabil</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
        <text x="20" y="30" fill="#a855f7" font-size="14" font-weight="bold">2. Direct Regression (YOLOv8-Pose)</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="12">Output = [x1, y1, s1, ..., xK, yK, sK]</text>
        <rect x="20" y="100" width="280" height="120" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="130" fill="#34d399" font-size="11">• Inferensi real-time sangat cepat</text>
        <text x="30" y="160" fill="#94a3b8" font-size="11">• Menggunakan fungsi kerugian OKS (Object Keypoint Similarity)</text>
        <text x="30" y="195" fill="#fbbf24" font-size="11">• Cocok untuk perangkat edge / mobile</text>
      </g>
    `
  },

  // Ch 48
  {
    name: 'chapter-48-structure-from-motion-pipeline.svg',
    title: 'Alur Rekonstruksi 3D: Structure from Motion (SfM)',
    subtitle: 'Ekstraksi Fitur, Estimasi Pose Multi-Kamera, Triangulasi, dan Bundle Adjustment',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Step 1 -->
        <rect x="25" y="60" width="120" height="130" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="35" y="85" fill="#38bdf8" font-size="12" font-weight="bold">1. Citra Input</text>
        <text x="35" y="115" fill="#94a3b8" font-size="10">Foto multi-sudut</text>
        <text x="35" y="135" fill="#94a3b8" font-size="10">Ekstraksi SIFT</text>
        <text x="35" y="155" fill="#94a3b8" font-size="10">Matching Kp</text>
        <line x1="150" y1="125" x2="180" y2="125" stroke="#64748b" stroke-width="2"/>
        <!-- Step 2 -->
        <rect x="185" y="60" width="140" height="130" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="195" y="85" fill="#818cf8" font-size="12" font-weight="bold">2. Pose Estimasi</text>
        <text x="195" y="115" fill="#94a3b8" font-size="10">Matriks Esensial E</text>
        <text x="195" y="135" fill="#94a3b8" font-size="10">Dekomposisi SVD</text>
        <text x="195" y="155" fill="#94a3b8" font-size="10">Rotasi R &amp; Translasi t</text>
        <line x1="330" y1="125" x2="360" y2="125" stroke="#64748b" stroke-width="2"/>
        <!-- Step 3 -->
        <rect x="365" y="60" width="140" height="130" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="375" y="85" fill="#34d399" font-size="12" font-weight="bold">3. Triangulasi</text>
        <text x="375" y="115" fill="#94a3b8" font-size="10">Perpotongan sinar</text>
        <text x="375" y="135" fill="#94a3b8" font-size="10">Titik 3D (X, Y, Z)</text>
        <text x="375" y="155" fill="#94a3b8" font-size="10">Sparse Point Cloud</text>
        <line x1="510" y1="125" x2="540" y2="125" stroke="#64748b" stroke-width="2"/>
        <!-- Step 4 -->
        <rect x="545" y="60" width="130" height="130" rx="6" fill="#0f172a" stroke="#f43f5e"/>
        <text x="555" y="85" fill="#f43f5e" font-size="12" font-weight="bold">4. Bundle Adjust</text>
        <text x="555" y="115" fill="#94a3b8" font-size="10">Optimasi Gauss-</text>
        <text x="555" y="135" fill="#94a3b8" font-size="10">Newton / LM</text>
        <text x="555" y="155" fill="#94a3b8" font-size="10">Min Reprojection Err</text>
      </g>
    `
  },
  {
    name: 'chapter-48-multiview-triangulation-geometry.svg',
    title: 'Geometri Triangulasi Titik 3D Multi-Kamera',
    subtitle: 'Rekonstruksi Koordinat Dunia dari Perpotongan Sinar Optis Kamera Kalibrasi',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <circle cx="160" cy="200" r="8" fill="#38bdf8"/>
        <text x="140" y="230" fill="#38bdf8" font-size="12">Kamera C1 [R1|t1]</text>
        <circle cx="520" cy="200" r="8" fill="#818cf8"/>
        <text x="500" y="230" fill="#818cf8" font-size="12">Kamera C2 [R2|t2]</text>
        <circle cx="340" cy="50" r="8" fill="#34d399"/>
        <text x="330" y="35" fill="#34d399" font-size="13" font-weight="bold">X_3D</text>
        <!-- Rays -->
        <line x1="160" y1="200" x2="340" y2="50" stroke="#38bdf8" stroke-width="2"/>
        <line x1="520" y1="200" x2="340" y2="50" stroke="#818cf8" stroke-width="2"/>
        <text x="240" y="160" fill="#fbbf24" font-size="11">Sinar Proyeksi S1</text>
        <text x="400" y="160" fill="#fbbf24" font-size="11">Sinar Proyeksi S2</text>
      </g>
    `
  },

  // Ch 49
  {
    name: 'chapter-49-contrastive-learning-clip.svg',
    title: 'Pembelajaran Kontrastif & Arsitektur Model Fondasi CLIP',
    subtitle: 'Penyelarasan Ruang Semantik Multimodal: Citra dan Teks Melalui Matriks Cosine Similarity',
    content: `
      <g transform="translate(50, 110)">
        <rect width="700" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Image Encoder -->
        <rect x="40" y="50" width="140" height="80" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="55" y="80" fill="#38bdf8" font-size="12" font-weight="bold">Image Encoder</text>
        <text x="55" y="105" fill="#94a3b8" font-size="10">ViT / ResNet ➔ I_embed</text>
        <!-- Text Encoder -->
        <rect x="40" y="150" width="140" height="80" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="55" y="180" fill="#818cf8" font-size="12" font-weight="bold">Text Encoder</text>
        <text x="55" y="205" fill="#94a3b8" font-size="10">Transformer ➔ T_embed</text>
        <line x1="185" y1="90" x2="235" y2="120" stroke="#64748b" stroke-width="2"/>
        <line x1="185" y1="190" x2="235" y2="160" stroke="#64748b" stroke-width="2"/>
        <!-- Similarity Matrix N x N -->
        <rect x="240" y="50" width="180" height="180" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="260" y="75" fill="#34d399" font-size="12" font-weight="bold">Matriks Similaritas N x N</text>
        <!-- Diagonal matching -->
        <rect x="260" y="90" width="30" height="30" fill="#10b981" fill-opacity="0.8"/>
        <rect x="300" y="130" width="30" height="30" fill="#10b981" fill-opacity="0.8"/>
        <rect x="340" y="170" width="30" height="30" fill="#10b981" fill-opacity="0.8"/>
        <text x="440" y="90" fill="#34d399" font-size="12" font-weight="bold">Zero-Shot Prediction:</text>
        <text x="440" y="120" fill="#e2e8f0" font-size="11">Teks: "a photo of a [class]"</text>
        <text x="440" y="145" fill="#94a3b8" font-size="11">Skor = Cosine Similarity(I, T)</text>
        <text x="440" y="170" fill="#fbbf24" font-size="11">Tanpa perlu training ulang!</text>
      </g>
    `
  },
  {
    name: 'chapter-49-multimodal-embedding-space.svg',
    title: 'Ruang Vektor Embedding Bersama (Joint Embedding Space)',
    subtitle: 'Kedekatan Geometri Vektor Representasi Visual dan Teks Bahasa Alami',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Clustered vectors -->
        <circle cx="200" cy="120" r="50" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-dasharray="3"/>
        <circle cx="190" cy="110" r="6" fill="#38bdf8"/>
        <text x="140" y="95" fill="#38bdf8" font-size="11">Foto Kucing</text>
        <circle cx="215" cy="130" r="6" fill="#818cf8"/>
        <text x="225" y="145" fill="#818cf8" font-size="11">Teks: "Seekor kucing"</text>
        <circle cx="480" cy="150" r="50" fill="#34d399" fill-opacity="0.2" stroke="#34d399" stroke-dasharray="3"/>
        <circle cx="470" cy="140" r="6" fill="#34d399"/>
        <text x="430" y="125" fill="#34d399" font-size="11">Foto Mobil</text>
        <circle cx="495" cy="160" r="6" fill="#f59e0b"/>
        <text x="505" y="175" fill="#f59e0b" font-size="11">Teks: "Mobil sedan"</text>
        <text x="240" y="240" fill="#94a3b8" font-size="11">Jarak Kosinus Rendah Antara Konsep Semantik yang Sama</text>
      </g>
    `
  },

  // Ch 50
  {
    name: 'chapter-50-precision-recall-and-map.svg',
    title: 'Evaluasi Model Vision: Kurva Presisi-Recall & Metrik mAP',
    subtitle: 'Interpolasi 11-Titik Pascal VOC, Area di Bawah Kurva (AUC), dan mAP50-95',
    content: `
      <g transform="translate(60, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">Kurva Precision-Recall (P-R)</text>
        <line x1="50" y1="200" x2="270" y2="200" stroke="#64748b" stroke-width="1.5"/>
        <line x1="50" y1="200" x2="50" y2="60" stroke="#64748b" stroke-width="1.5"/>
        <text x="260" y="220" fill="#94a3b8" font-size="11">Recall</text>
        <text x="15" y="65" fill="#94a3b8" font-size="11">Prec</text>
        <!-- PR Curve -->
        <path d="M 50,70 L 150,80 L 200,120 L 250,195" fill="none" stroke="#38bdf8" stroke-width="3"/>
        <text x="80" y="140" fill="#38bdf8" font-size="12">AP = Luas di bawah kurva</text>
      </g>
      <g transform="translate(420, 110)">
        <rect width="320" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <text x="20" y="30" fill="#34d399" font-size="14" font-weight="bold">Perhitungan Mean AP (mAP)</text>
        <text x="20" y="70" fill="#e2e8f0" font-family="monospace" font-size="13">mAP = (1 / K) · Σ AP_k</text>
        <rect x="20" y="100" width="280" height="130" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="30" y="130" fill="#38bdf8" font-size="11">• mAP@0.50: IoU threshold 50%</text>
        <text x="30" y="160" fill="#fbbf24" font-size="11">• mAP@0.50:0.95: Rata-rata IoU 50% ke 95%</text>
        <text x="30" y="190" fill="#94a3b8" font-size="11">• Metrik standar kompetisi COCO</text>
        <text x="30" y="215" fill="#34d399" font-size="11">• Menghargai akurasi spasial batas kotak</text>
      </g>
    `
  },
  {
    name: 'chapter-50-confusion-matrix-and-roc-metrics.svg',
    title: 'Matriks Konfusi Multi-Kelas & Analisis Sensitivitas',
    subtitle: 'True Positive (TP), False Positive (FP), False Negative (FN), dan F1-Score',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Matrix 2x2 grid -->
        <rect x="100" y="60" width="110" height="80" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
        <text x="125" y="95" fill="#34d399" font-size="14" font-weight="bold">TP</text>
        <text x="120" y="120" fill="#94a3b8" font-size="10">Benar Positif</text>
        <rect x="220" y="60" width="110" height="80" fill="#f43f5e" fill-opacity="0.3" stroke="#f43f5e"/>
        <text x="245" y="95" fill="#f43f5e" font-size="14" font-weight="bold">FP</text>
        <text x="240" y="120" fill="#94a3b8" font-size="10">Salah Deteksi</text>
        <rect x="100" y="150" width="110" height="80" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b"/>
        <text x="125" y="185" fill="#fbbf24" font-size="14" font-weight="bold">FN</text>
        <text x="120" y="210" fill="#94a3b8" font-size="10">Terlewat</text>
        <rect x="220" y="150" width="110" height="80" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6"/>
        <text x="245" y="185" fill="#60a5fa" font-size="14" font-weight="bold">TN</text>
        <text x="240" y="210" fill="#94a3b8" font-size="10">Benar Negatif</text>
        <!-- Formula text right -->
        <text x="370" y="80" fill="#38bdf8" font-size="13" font-weight="bold">Formulasi Metrik Diagnostik:</text>
        <text x="370" y="115" fill="#e2e8f0" font-family="monospace" font-size="11">Accuracy  = (TP + TN) / Total</text>
        <text x="370" y="145" fill="#e2e8f0" font-family="monospace" font-size="11">Precision = TP / (TP + FP)</text>
        <text x="370" y="175" fill="#e2e8f0" font-family="monospace" font-size="11">Recall    = TP / (TP + FN)</text>
        <text x="370" y="205" fill="#34d399" font-family="monospace" font-size="11">F1-Score  = 2·(Prec·Rec)/(Prec + Rec)</text>
      </g>
    `
  }
];

for (const d of diagrams) {
  const svg = wrapSvg(d.title, d.subtitle, d.content);
  fs.writeFileSync(path.join(outDir, d.name), svg, 'utf-8');
  console.log(`Generated diagram: ${d.name}`);
}
console.log(`Successfully generated ${diagrams.length} technical SVG diagrams.`);

