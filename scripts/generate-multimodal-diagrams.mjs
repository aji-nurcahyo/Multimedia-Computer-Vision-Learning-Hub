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
  // Ch 51
  {
    name: 'chapter-51-multimodal-fusion-paradigms.svg',
    title: 'Paradigma Fusi Multimodal: Early, Intermediate & Late Fusion',
    subtitle: 'Tingkat Integrasi Informasi: Penggabungan Fitur Awal, Cross-Attention, vs Keputusan Akhir',
    content: `
      <g transform="translate(40, 105)">
        <!-- Early Fusion -->
        <g transform="translate(0, 0)">
          <rect width="210" height="270" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">1. Early Fusion</text>
          <text x="20" y="50" fill="#94a3b8" font-size="10">(Feature-Level Concat)</text>
          <rect x="25" y="70" width="70" height="30" rx="4" fill="#0f172a" stroke="#38bdf8"/>
          <text x="40" y="90" fill="#38bdf8" font-size="10">Visual</text>
          <rect x="115" y="70" width="70" height="30" rx="4" fill="#0f172a" stroke="#a855f7"/>
          <text x="135" y="90" fill="#a855f7" font-size="10">Audio</text>
          <!-- Concat Box -->
          <rect x="25" y="125" width="160" height="35" rx="4" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8"/>
          <text x="45" y="147" fill="#f8fafc" font-size="11" font-weight="bold">Concat [x_v || x_a]</text>
          <!-- Model -->
          <rect x="35" y="185" width="140" height="40" rx="4" fill="#0f172a" stroke="#34d399"/>
          <text x="50" y="210" fill="#34d399" font-size="11">Model Multimodal</text>
          <text x="20" y="250" fill="#94a3b8" font-size="9">• Korelasi fitur interaktif awal</text>
        </g>

        <!-- Intermediate Fusion -->
        <g transform="translate(250, 0)">
          <rect width="220" height="270" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="20" y="30" fill="#fbbf24" font-size="14" font-weight="bold">2. Intermediate Fusion</text>
          <text x="20" y="50" fill="#94a3b8" font-size="10">(Cross-Attention Layer)</text>
          <rect x="25" y="70" width="75" height="30" rx="4" fill="#0f172a" stroke="#38bdf8"/>
          <text x="35" y="90" fill="#38bdf8" font-size="10">Query (V)</text>
          <rect x="120" y="70" width="75" height="30" rx="4" fill="#0f172a" stroke="#a855f7"/>
          <text x="130" y="90" fill="#a855f7" font-size="10">Key/Val (A)</text>
          <!-- Cross Attention Box -->
          <rect x="25" y="120" width="170" height="45" rx="4" fill="#d97706" fill-opacity="0.25" stroke="#fbbf24"/>
          <text x="35" y="140" fill="#fbbf24" font-size="11" font-weight="bold">Cross-Modal Attn</text>
          <text x="35" y="155" fill="#e2e8f0" font-size="9">Softmax(Q_v·K_a^T / √d)·V_a</text>
          <!-- Joint Representation -->
          <rect x="35" y="185" width="150" height="40" rx="4" fill="#0f172a" stroke="#34d399"/>
          <text x="45" y="210" fill="#34d399" font-size="11">Joint Representation</text>
          <text x="20" y="250" fill="#94a3b8" font-size="9">• Perhatian selektif dinamis</text>
        </g>

        <!-- Late Fusion -->
        <g transform="translate(510, 0)">
          <rect width="210" height="270" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
          <text x="20" y="30" fill="#34d399" font-size="14" font-weight="bold">3. Late Fusion</text>
          <text x="20" y="50" fill="#94a3b8" font-size="10">(Decision-Level Fusion)</text>
          <rect x="20" y="70" width="75" height="40" rx="4" fill="#0f172a" stroke="#38bdf8"/>
          <text x="28" y="90" fill="#38bdf8" font-size="9">Model Visual</text>
          <text x="35" y="103" fill="#e2e8f0" font-size="8">P_v(C)</text>
          <rect x="115" y="70" width="75" height="40" rx="4" fill="#0f172a" stroke="#a855f7"/>
          <text x="125" y="90" fill="#a855f7" font-size="9">Model Audio</text>
          <text x="135" y="103" fill="#e2e8f0" font-size="8">P_a(C)</text>
          <!-- Weighted Combination -->
          <rect x="20" y="135" width="170" height="40" rx="4" fill="#047857" fill-opacity="0.3" stroke="#10b981"/>
          <text x="30" y="155" fill="#34d399" font-size="11" font-weight="bold">Weighted Averaging</text>
          <text x="35" y="168" fill="#e2e8f0" font-size="8">P_fused = w1·P_v + w2·P_a</text>
          <!-- Final Class -->
          <rect x="35" y="195" width="140" height="35" rx="4" fill="#0f172a" stroke="#f43f5e"/>
          <text x="50" y="217" fill="#f43f5e" font-size="11">Keputusan Akhir</text>
          <text x="20" y="250" fill="#94a3b8" font-size="9">• Tangguh missing modalities</text>
        </g>
      </g>
    `
  },
  {
    name: 'chapter-51-modality-representation-alignment.svg',
    title: 'Penyelarasan Representasi Ragam Modalitas Data',
    subtitle: 'Pemetaan Citra Spasial, Audio Temporal, dan Teks Simbolik ke Ruang Vektor Terpadu',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Modality 1: Image -->
        <rect x="30" y="30" width="120" height="60" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="55" fill="#38bdf8" font-size="12" font-weight="bold">Citra (Visual)</text>
        <text x="45" y="75" fill="#94a3b8" font-size="10">Piksel 2D / 3D Tensor</text>
        <!-- Modality 2: Audio -->
        <rect x="30" y="100" width="120" height="60" rx="6" fill="#0f172a" stroke="#a855f7"/>
        <text x="45" y="125" fill="#a855f7" font-size="12" font-weight="bold">Audio (Akustik)</text>
        <text x="45" y="145" fill="#94a3b8" font-size="10">Gelombang / Mel-STFT</text>
        <!-- Modality 3: Text -->
        <rect x="30" y="170" width="120" height="60" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="45" y="195" fill="#34d399" font-size="12" font-weight="bold">Teks (Bahasa)</text>
        <text x="45" y="215" fill="#94a3b8" font-size="10">Token Subword Diskrit</text>
        <!-- Encoders & Projection -->
        <line x1="155" y1="60" x2="250" y2="120" stroke="#64748b" stroke-width="2"/>
        <line x1="155" y1="130" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
        <line x1="155" y1="200" x2="250" y2="140" stroke="#64748b" stroke-width="2"/>
        <!-- Joint Embedding Space Circle -->
        <circle cx="450" cy="130" r="90" fill="#0f172a" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4"/>
        <text x="400" y="70" fill="#fbbf24" font-size="13" font-weight="bold">Joint Embedding Space</text>
        <!-- Vector points -->
        <circle cx="420" cy="120" r="6" fill="#38bdf8"/>
        <text x="410" y="110" fill="#38bdf8" font-size="10">v_img</text>
        <circle cx="440" cy="140" r="6" fill="#a855f7"/>
        <text x="445" y="140" fill="#a855f7" font-size="10">v_audio</text>
        <circle cx="430" cy="130" r="6" fill="#34d399"/>
        <text x="435" y="125" fill="#34d399" font-size="10">v_text</text>
        <!-- Objective -->
        <text x="360" y="200" fill="#e2e8f0" font-size="11">Objektif: Jarak Kosinus Minimum</text>
        <text x="360" y="215" fill="#94a3b8" font-size="9">untuk entitas semantik yang sama</text>
      </g>
    `
  },

  // Ch 52
  {
    name: 'chapter-52-clip-vision-language-alignment.svg',
    title: 'Arsitektur Vision-Language Model: Kontrastif CLIP',
    subtitle: 'Dual-Encoder (ViT & Transformer), Matriks Kesamaan Cosine N x N, dan Symmetric Cross-Entropy',
    content: `
      <g transform="translate(50, 105)">
        <rect width="700" height="270" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Left: Image Encoder -->
        <rect x="30" y="40" width="150" height="85" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="65" fill="#38bdf8" font-size="13" font-weight="bold">Visual Encoder</text>
        <text x="45" y="85" fill="#94a3b8" font-size="10">ViT-B/16 / ResNet</text>
        <text x="45" y="105" fill="#e2e8f0" font-size="10">I_1 ... I_N (Batch)</text>
        <!-- Left: Text Encoder -->
        <rect x="30" y="150" width="150" height="85" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="45" y="175" fill="#818cf8" font-size="13" font-weight="bold">Text Encoder</text>
        <text x="45" y="195" fill="#94a3b8" font-size="10">CBOW / Transformer</text>
        <text x="45" y="215" fill="#e2e8f0" font-size="10">T_1 ... T_N (Batch)</text>
        <line x1="185" y1="80" x2="250" y2="110" stroke="#64748b" stroke-width="2"/>
        <line x1="185" y1="190" x2="250" y2="160" stroke="#64748b" stroke-width="2"/>
        <!-- Center: N x N Cosine Similarity Matrix -->
        <rect x="260" y="40" width="190" height="190" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="275" y="65" fill="#34d399" font-size="12" font-weight="bold">Matriks Similaritas N x N</text>
        <!-- Diagonal matching cells -->
        <rect x="280" y="80" width="30" height="30" fill="#10b981"/>
        <rect x="320" y="120" width="30" height="30" fill="#10b981"/>
        <rect x="360" y="160" width="30" height="30" fill="#10b981"/>
        <rect x="400" y="200" width="30" height="30" fill="#10b981"/>
        <text x="275" y="100" fill="#0f172a" font-size="9" font-weight="bold">I1·T1</text>
        <!-- Non diagonal cells -->
        <rect x="320" y="80" width="30" height="30" fill="#334155"/>
        <rect x="280" y="120" width="30" height="30" fill="#334155"/>
        <!-- Right side info -->
        <rect x="475" y="40" width="200" height="190" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="490" y="70" fill="#fbbf24" font-size="12" font-weight="bold">InfoNCE Loss Simetris:</text>
        <text x="490" y="95" fill="#e2e8f0" font-size="10">L = (L_img + L_text) / 2</text>
        <text x="490" y="125" fill="#94a3b8" font-size="9">• Maksimalkan nilai diagonal (pasangan positif)</text>
        <text x="490" y="155" fill="#94a3b8" font-size="9">• Minimalkan nilai off-diagonal (pasangan negatif)</text>
        <text x="490" y="185" fill="#34d399" font-size="9">• Zero-Shot: Tanpa fine-tuning dataset target!</text>
      </g>
    `
  },
  {
    name: 'chapter-52-zero-shot-classification-pipeline.svg',
    title: 'Pipeline Klasifikasi Zero-Shot dengan Prompt Engineering',
    subtitle: 'Template Prompt Alami, Pengkodean Kueri Teks, dan Komputasi Softmax Terkalibrasi',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Citra Input -->
        <rect x="30" y="40" width="130" height="100" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="70" fill="#38bdf8" font-size="12" font-weight="bold">Citra Uji</text>
        <circle cx="95" cy="100" r="20" fill="#f59e0b"/>
        <!-- Prompt Ensembling -->
        <rect x="30" y="160" width="130" height="70" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="40" y="185" fill="#818cf8" font-size="11" font-weight="bold">Prompt Template</text>
        <text x="35" y="205" fill="#94a3b8" font-size="9">"a photo of a [C]"</text>
        <line x1="165" y1="90" x2="220" y2="120" stroke="#64748b" stroke-width="2"/>
        <line x1="165" y1="195" x2="220" y2="150" stroke="#64748b" stroke-width="2"/>
        <!-- Cosine Dot Product -->
        <rect x="225" y="70" width="190" height="130" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="240" y="100" fill="#34d399" font-size="12" font-weight="bold">Kalkulasi Cosine Sim:</text>
        <text x="240" y="130" fill="#e2e8f0" font-size="11">s_c = (v_img · v_text_c)</text>
        <text x="240" y="155" fill="#94a3b8" font-size="10">P(c) = exp(s_c / τ) / Σ exp</text>
        <line x1="420" y1="135" x2="475" y2="135" stroke="#64748b" stroke-width="2"/>
        <!-- Predictions Output -->
        <rect x="480" y="60" width="170" height="150" rx="6" fill="#0f172a" stroke="#f43f5e"/>
        <text x="495" y="85" fill="#f43f5e" font-size="12" font-weight="bold">Prediksi Kelas:</text>
        <text x="495" y="115" fill="#34d399" font-size="11">1. Mobil: 88.5%</text>
        <text x="495" y="140" fill="#94a3b8" font-size="11">2. Truk: 8.2%</text>
        <text x="495" y="165" fill="#94a3b8" font-size="11">3. Kucing: 0.3%</text>
        <text x="495" y="190" fill="#38bdf8" font-size="9">Top-1 Akurat!</text>
      </g>
    `
  },

  // Ch 53
  {
    name: 'chapter-53-audiovisual-synchronization-pipeline.svg',
    title: 'Sinkronisasi Temporal & Penyelarasan Sinyal Audio-Visual',
    subtitle: 'Ekstraksi Envelope Energi Audio, Besaran Gerak Video, dan Korelasi Silang Lag Waktu',
    content: `
      <g transform="translate(50, 105)">
        <rect width="700" height="270" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Video Stream -->
        <rect x="30" y="35" width="180" height="85" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="45" y="60" fill="#38bdf8" font-size="12" font-weight="bold">Video Stream (30 FPS)</text>
        <text x="45" y="80" fill="#94a3b8" font-size="10">Frame Diferensiasi Spasial</text>
        <text x="45" y="100" fill="#e2e8f0" font-size="10">Motion Magnitude: m(t)</text>
        <!-- Audio Stream -->
        <rect x="30" y="145" width="180" height="85" rx="6" fill="#0f172a" stroke="#a855f7"/>
        <text x="45" y="170" fill="#a855f7" font-size="12" font-weight="bold">Audio Stream (44.1 kHz)</text>
        <text x="45" y="190" fill="#94a3b8" font-size="10">RMS Envelope Sinyal</text>
        <text x="45" y="210" fill="#e2e8f0" font-size="10">Acoustic Energy: e(t)</text>
        <line x1="215" y1="80" x2="280" y2="120" stroke="#64748b" stroke-width="2"/>
        <line x1="215" y1="190" x2="280" y2="155" stroke="#64748b" stroke-width="2"/>
        <!-- Cross-Correlation -->
        <rect x="290" y="55" width="220" height="155" rx="6" fill="#0f172a" stroke="#fbbf24"/>
        <text x="310" y="85" fill="#fbbf24" font-size="12" font-weight="bold">Cross-Correlation R_av(τ)</text>
        <text x="310" y="115" fill="#e2e8f0" font-family="monospace" font-size="10">R(τ) = Σ m(t) · e(t + τ)</text>
        <!-- Peak lag indicator -->
        <line x1="320" y1="165" x2="480" y2="165" stroke="#64748b" stroke-width="1.5"/>
        <path d="M 330,165 Q 390,120 400,120 Q 410,120 470,165" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
        <text x="375" y="185" fill="#34d399" font-size="10">Peak Lag Δt = 0 ms</text>
        <line x1="515" y1="135" x2="555" y2="135" stroke="#64748b" stroke-width="2"/>
        <!-- Sync Decision -->
        <rect x="560" y="65" width="120" height="135" rx="6" fill="#0f172a" stroke="#10b981"/>
        <text x="575" y="95" fill="#10b981" font-size="12" font-weight="bold">Sinkronisasi</text>
        <text x="575" y="125" fill="#34d399" font-size="11">✓ In-Sync</text>
        <text x="575" y="145" fill="#94a3b8" font-size="9">|Δt| ≤ 45 ms</text>
        <text x="575" y="170" fill="#94a3b8" font-size="9">Korelasi &gt; 0.6</text>
      </g>
    `
  },
  {
    name: 'chapter-53-audiovisual-fusion-architectures.svg',
    title: 'Arsitektur Fusi Audio-Visual: Perbandingan Unimodal vs Bimodal',
    subtitle: 'Keunggulan Informasi Gabungan Saat Salah Satu Modalitas Terdegradasi Derau (Noise)',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- 3 Performance Bars -->
        <g transform="translate(60, 40)">
          <text x="0" y="25" fill="#38bdf8" font-size="12" font-weight="bold">Visual-Only (Citra Gelap/Kabur):</text>
          <rect x="0" y="35" width="280" height="20" fill="#334155" rx="3"/>
          <rect x="0" y="35" width="180" height="20" fill="#0284c7" rx="3"/>
          <text x="190" y="50" fill="#e2e8f0" font-size="11" font-family="monospace">64.2% Akurasi</text>
        </g>
        <g transform="translate(60, 110)">
          <text x="0" y="25" fill="#a855f7" font-size="12" font-weight="bold">Audio-Only (Kondisi Akustik Bising):</text>
          <rect x="0" y="35" width="280" height="20" fill="#334155" rx="3"/>
          <rect x="0" y="35" width="195" height="20" fill="#7c3aed" rx="3"/>
          <text x="205" y="50" fill="#e2e8f0" font-size="11" font-family="monospace">69.5% Akurasi</text>
        </g>
        <g transform="translate(60, 180)">
          <text x="0" y="25" fill="#34d399" font-size="12" font-weight="bold">Audio-Visual Fused (Bimodal Multimodal):</text>
          <rect x="0" y="35" width="280" height="20" fill="#334155" rx="3"/>
          <rect x="0" y="35" width="260" height="20" fill="#10b981" rx="3"/>
          <text x="270" y="50" fill="#34d399" font-size="11" font-weight="bold" font-family="monospace">92.8% (+23% Peningkatan)</text>
        </g>
      </g>
    `
  },

  // Ch 54
  {
    name: 'chapter-54-crossmodal-embedding-space.svg',
    title: 'Ruang Metrik Embedding Lintas-Modalitas (Cross-Modal Metric Space)',
    subtitle: 'Pengelompokan Konsep Semantik Serupa Melalui Normalisasi L2 dan Jarak Cosine',
    content: `
      <g transform="translate(50, 105)">
        <rect width="700" height="270" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Unit Sphere / Circle representation -->
        <circle cx="240" cy="140" r="95" fill="#0f172a" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>
        <text x="180" y="30" fill="#38bdf8" font-size="12">Ruang Hipersfer Ternormalisasi ||v|| = 1</text>
        <!-- Cluster 1: Aviation (Airplane) -->
        <circle cx="210" cy="80" r="5" fill="#38bdf8"/>
        <text x="140" y="75" fill="#38bdf8" font-size="10">Foto Pesawat</text>
        <circle cx="230" cy="75" r="5" fill="#818cf8"/>
        <text x="240" y="70" fill="#818cf8" font-size="10">Teks "jet airliner"</text>
        <circle cx="220" cy="95" r="5" fill="#a855f7"/>
        <text x="230" y="100" fill="#a855f7" font-size="10">Audio Jet Turbin</text>
        <!-- Cluster 2: Maritime (Boat) -->
        <circle cx="280" cy="180" r="5" fill="#38bdf8"/>
        <text x="290" y="180" fill="#38bdf8" font-size="10">Foto Kapal</text>
        <circle cx="295" cy="195" r="5" fill="#818cf8"/>
        <text x="305" y="200" fill="#818cf8" font-size="10">Teks "sailboat"</text>
        <!-- Angle theta between clusters -->
        <line x1="240" y1="140" x2="220" y2="85" stroke="#fbbf24" stroke-width="1.5"/>
        <line x1="240" y1="140" x2="290" y2="185" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="250" y="135" fill="#fbbf24" font-size="10">Sudut θ</text>
        <!-- Right side formulas -->
        <rect x="420" y="45" width="250" height="180" rx="6" fill="#0f172a" stroke="#334155"/>
        <text x="440" y="75" fill="#34d399" font-size="13" font-weight="bold">Metrik Kedekatan Vektor:</text>
        <text x="440" y="105" fill="#e2e8f0" font-family="monospace" font-size="11">cos(θ) = (u · v) / (||u|| ||v||)</text>
        <text x="440" y="130" fill="#e2e8f0" font-family="monospace" font-size="11">d_euclid = √[ 2 · (1 - cos θ) ]</text>
        <text x="440" y="160" fill="#94a3b8" font-size="10">• Vektor dinormalisasi L2</text>
        <text x="440" y="180" fill="#94a3b8" font-size="10">• Kueri Teks ➔ Temukan Citra Terdekat</text>
        <text x="440" y="200" fill="#38bdf8" font-size="10">• Kueri Audio ➔ Temukan Video Terkait</text>
      </g>
    `
  },
  {
    name: 'chapter-54-semantic-retrieval-evaluation-metrics.svg',
    title: 'Evaluasi Information Retrieval Multimodal: Recall@K, Precision@K & MRR',
    subtitle: 'Kuantifikasi Presisi dan Peringkat Relevansi Dokumen pada Sistem Pencarian Lintas Modalitas',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Top-K Ranked List -->
        <g transform="translate(30, 30)">
          <text x="0" y="20" fill="#38bdf8" font-size="12" font-weight="bold">Daftar Peringkat Top-K Hasil Retrieval:</text>
          <rect x="0" y="35" width="260" height="25" rx="3" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
          <text x="10" y="52" fill="#34d399" font-size="10">Rank 1: Relevan (Match Pertama) ➔ 1/rank = 1.0</text>
          <rect x="0" y="65" width="260" height="25" rx="3" fill="#334155"/>
          <text x="10" y="82" fill="#94a3b8" font-size="10">Rank 2: Tidak Relevan</text>
          <rect x="0" y="95" width="260" height="25" rx="3" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
          <text x="10" y="112" fill="#34d399" font-size="10">Rank 3: Relevan</text>
          <rect x="0" y="125" width="260" height="25" rx="3" fill="#334155"/>
          <text x="10" y="142" fill="#94a3b8" font-size="10">Rank 4: Tidak Relevan</text>
          <rect x="0" y="155" width="260" height="25" rx="3" fill="#334155"/>
          <text x="10" y="172" fill="#94a3b8" font-size="10">Rank 5: Tidak Relevan</text>
        </g>
        <!-- Formula and Calculation Right -->
        <g transform="translate(330, 30)">
          <rect width="310" height="195" rx="6" fill="#0f172a" stroke="#334155"/>
          <text x="20" y="30" fill="#fbbf24" font-size="13" font-weight="bold">Perhitungan Metrik (K = 5):</text>
          <text x="20" y="65" fill="#e2e8f0" font-family="monospace" font-size="11">Recall@5 = 2 / 2 = 100%</text>
          <text x="20" y="85" fill="#94a3b8" font-size="9">(Semua item relevan berhasil ditemukan)</text>
          <text x="20" y="115" fill="#e2e8f0" font-family="monospace" font-size="11">Precision@5 = 2 / 5 = 40.0%</text>
          <text x="20" y="135" fill="#94a3b8" font-size="9">(2 dari 5 item teratas relevan)</text>
          <text x="20" y="165" fill="#34d399" font-family="monospace" font-size="11">MRR = 1 / 1 = 1.000</text>
          <text x="20" y="185" fill="#94a3b8" font-size="9">(Item relevan pertama berada di peringkat 1)</text>
        </g>
      </g>
    `
  },

  // Ch 55
  {
    name: 'chapter-55-integrated-multimodal-system-architecture.svg',
    title: 'Arsitektur Sistem Analisis Multimedia Cerdas Terintegrasi',
    subtitle: 'Akuisisi Multi-Sensor, Penyelarasan Temporal, Fusi Fitur, dan Dashboard Analitik',
    content: `
      <g transform="translate(50, 105)">
        <rect width="700" height="270" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <!-- Step 1: Ingestion -->
        <rect x="25" y="45" width="130" height="175" rx="6" fill="#0f172a" stroke="#38bdf8"/>
        <text x="35" y="70" fill="#38bdf8" font-size="12" font-weight="bold">1. Akuisisi Data</text>
        <text x="35" y="100" fill="#94a3b8" font-size="10">• Kamera Video (RTSP)</text>
        <text x="35" y="125" fill="#94a3b8" font-size="10">• Mikrofon Audio (PCM)</text>
        <text x="35" y="150" fill="#94a3b8" font-size="10">• Metadata Teks / Log</text>
        <text x="35" y="180" fill="#38bdf8" font-size="9">Validasi &amp; Buffer Queue</text>
        <line x1="155" y1="130" x2="190" y2="130" stroke="#64748b" stroke-width="2"/>
        <!-- Step 2: Processing & Sync -->
        <rect x="195" y="45" width="150" height="175" rx="6" fill="#0f172a" stroke="#818cf8"/>
        <text x="205" y="70" fill="#818cf8" font-size="12" font-weight="bold">2. Ekstraksi &amp; Sinkron</text>
        <text x="205" y="100" fill="#94a3b8" font-size="10">• ViT / ResNet Visual</text>
        <text x="205" y="125" fill="#94a3b8" font-size="10">• STFT Mel-Spectrogram</text>
        <text x="205" y="150" fill="#94a3b8" font-size="10">• Text Tokenizer Embed</text>
        <text x="205" y="180" fill="#818cf8" font-size="9">Sinkronisasi Timestamp Δt</text>
        <line x1="345" y1="130" x2="380" y2="130" stroke="#64748b" stroke-width="2"/>
        <!-- Step 3: Fusion & Model -->
        <rect x="385" y="45" width="140" height="175" rx="6" fill="#0f172a" stroke="#fbbf24"/>
        <text x="395" y="70" fill="#fbbf24" font-size="12" font-weight="bold">3. Mesin Fusi</text>
        <text x="395" y="100" fill="#94a3b8" font-size="10">• Cross-Attention</text>
        <text x="395" y="125" fill="#94a3b8" font-size="10">• Early / Late Fusion</text>
        <text x="395" y="150" fill="#94a3b8" font-size="10">• Zero-Shot Head</text>
        <text x="395" y="180" fill="#fbbf24" font-size="9">Inferensi Terkalibrasi</text>
        <line x1="525" y1="130" x2="560" y2="130" stroke="#64748b" stroke-width="2"/>
        <!-- Step 4: Output & Analytics -->
        <rect x="565" y="45" width="115" height="175" rx="6" fill="#0f172a" stroke="#34d399"/>
        <text x="575" y="70" fill="#34d399" font-size="12" font-weight="bold">4. Dashboard</text>
        <text x="575" y="100" fill="#94a3b8" font-size="10">• Live Timeline</text>
        <text x="575" y="125" fill="#94a3b8" font-size="10">• Alarm Kejadian</text>
        <text x="575" y="150" fill="#94a3b8" font-size="10">• Ekspor CSV Log</text>
        <text x="575" y="180" fill="#34d399" font-size="9">Evaluasi Presisi</text>
      </g>
    `
  },
  {
    name: 'chapter-55-multimodal-deployment-optimization.svg',
    title: 'Optimasi Penerapan Edge AI & Proteksi Privasi Multimodal',
    subtitle: 'Kuantisasi INT8, Pengecekan Integritas Sensor, dan Pemrosesan Lokal Tanpa Cloud',
    content: `
      <g transform="translate(60, 110)">
        <rect width="680" height="260" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <g transform="translate(40, 30)">
          <rect width="270" height="190" rx="6" fill="#0f172a" stroke="#38bdf8"/>
          <text x="20" y="30" fill="#38bdf8" font-size="13" font-weight="bold">Optimasi Inferensi Edge</text>
          <text x="20" y="65" fill="#e2e8f0" font-size="11">• Kuantisasi Model FP32 ➔ INT8</text>
          <text x="20" y="90" fill="#94a3b8" font-size="10">Menghemat 75% RAM &amp; akselerasi NPU</text>
          <text x="20" y="120" fill="#e2e8f0" font-size="11">• Dynamic Modality Gating</text>
          <text x="20" y="145" fill="#94a3b8" font-size="10">Matikan sensor kamera bila audio hening</text>
          <text x="20" y="170" fill="#34d399" font-size="10">Efisiensi daya baterai perangkat IoT</text>
        </g>
        <g transform="translate(350, 30)">
          <rect width="290" height="190" rx="6" fill="#0f172a" stroke="#10b981"/>
          <text x="20" y="30" fill="#34d399" font-size="13" font-weight="bold">Privasi &amp; Kepatuhan Regulasi</text>
          <text x="20" y="65" fill="#e2e8f0" font-size="11">• On-Device Processing (Zero-Cloud Upload)</text>
          <text x="20" y="90" fill="#94a3b8" font-size="10">Data biometrik tidak keluar dari perangkat</text>
          <text x="20" y="120" fill="#e2e8f0" font-size="11">• Anonimisasi Representasi Vektor</text>
          <text x="20" y="145" fill="#94a3b8" font-size="10">Hanya embedding fitur 1D yang diproses</text>
          <text x="20" y="170" fill="#fbbf24" font-size="10">Mematuhi etika AI dan regulasi privasi data</text>
        </g>
      </g>
    `
  }
];

for (const d of diagrams) {
  const svg = wrapSvg(d.title, d.subtitle, d.content);
  fs.writeFileSync(path.join(outDir, d.name), svg, 'utf-8');
  console.log(`Generated diagram: ${d.name}`);
}
console.log(`Successfully generated ${diagrams.length} multimodal technical SVG diagrams.`);

