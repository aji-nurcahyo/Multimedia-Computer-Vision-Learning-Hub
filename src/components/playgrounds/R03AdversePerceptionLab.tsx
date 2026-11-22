import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

export const R03AdversePerceptionLab: React.FC = () => {
  // Environmental degradation parameters
  const [degradationType, setDegradationType] = useState<'haze' | 'lowlight' | 'rain'>('haze');
  const [severityLevel, setSeverityLevel] = useState<number>(3); // 1 to 5
  const [restorationMethod, setRestorationMethod] = useState<'none' | 'dcp' | 'zerodce' | 'oversmooth'>('none');
  const [atmosphericA, setAtmosphericA] = useState<number>(0.92);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute live mathematical metrics
  const liveMetrics = useMemo(() => {
    // Baseline clean metrics
    const cleanAP = 45.0; // %
    const cleanECE = 3.2; // %

    // Degradation factor based on severity (1 to 5)
    const severityFactor = severityLevel / 5.0;

    let rawPSNR = 28.0 - (severityLevel * 4.8);
    let rawSSIM = 0.95 - (severityLevel * 0.12);
    let degradedAP = cleanAP * Math.max(0.2, 1.0 - (severityFactor * 0.72));
    let degradedECE = cleanECE + (severityFactor * 24.5);

    // Effect of Restoration Method
    let finalPSNR = rawPSNR;
    let finalSSIM = rawSSIM;
    let finalAP = degradedAP;
    let finalECE = degradedECE;
    let paradoxNote = '';

    if (restorationMethod === 'dcp') {
      // Dark Channel Prior heuristic
      finalPSNR = rawPSNR + 5.2;
      finalSSIM = Math.min(0.92, rawSSIM + 0.18);
      finalAP = degradedAP + 6.5;
      finalECE = Math.max(8.5, degradedECE - 8.0);
      paradoxNote = 'DCP mengembalikan kontras secara fisika, meningkatkan AP deteksi hilir sebesar +6.5%.';
    } else if (restorationMethod === 'zerodce') {
      // Physics-Guided Neural Curve Estimation
      finalPSNR = rawPSNR + 7.8;
      finalSSIM = Math.min(0.96, rawSSIM + 0.24);
      finalAP = degradedAP + 10.2;
      finalECE = Math.max(5.4, degradedECE - 14.5);
      paradoxNote = 'Zero-DCE terpandu fisika memulihkan gradien tepi, mencapai peningkatan AP +10.2% dan menurunkan ECE di bawah 6%.';
    } else if (restorationMethod === 'oversmooth') {
      // Heavy Gaussian / Bilateral Filter (The Restoration-Detection Paradox Example)
      finalPSNR = rawPSNR + 9.5; // High PSNR because variance is minimized!
      finalSSIM = Math.min(0.88, rawSSIM + 0.08);
      finalAP = degradedAP - 3.8; // Lower AP because edges are blurred!
      finalECE = degradedECE + 4.2; // Higher miscalibration!
      paradoxNote = 'PARADOKS RESTORASI-DETEKSI: Filter over-smoothing menghasilkan PSNR tertinggi (+9.5 dB) karena menekan variansi derau piksel, namun MENURUNKAN akurasi deteksi (-3.8%) karena memusnahkan gradien tepi frekuensi tinggi!';
    }

    return {
      psnr: Math.max(2.0, finalPSNR),
      ssim: Math.max(0.1, Math.min(0.99, finalSSIM)),
      ap: Math.max(5.0, finalAP),
      ece: Math.max(2.5, finalECE),
      isParadox: restorationMethod === 'oversmooth',
      paradoxNote,
    };
  }, [degradationType, severityLevel, restorationMethod]);

  // Live Canvas Rendering of degraded scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 1. Draw Clean Base Scene (Highway / Buildings with depth gradient)
    ctx.clearRect(0, 0, W, H);

    // Sky & Mountain background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    skyGrad.addColorStop(0, '#1e293b');
    skyGrad.addColorStop(1, '#475569');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.6);

    // Road & Ground
    const groundGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    groundGrad.addColorStop(0, '#334155');
    groundGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // Road markings
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.6);
    ctx.lineTo(W * 0.5, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vehicles (Objects to detect)
    // Far Car (small, depth ~ 0.8)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(W * 0.46, H * 0.62, 28, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(W * 0.48, H * 0.63, 10, 6);

    // Mid Car (medium, depth ~ 0.5)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(W * 0.25, H * 0.70, 64, 38);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(W * 0.28, H * 0.72, 22, 12);

    // Near Truck (large, depth ~ 0.2)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(W * 0.65, H * 0.68, 110, 75);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(W * 0.67, H * 0.72, 35, 25);

    // 2. Apply Physical Atmospheric Degradation
    if (degradationType === 'haze') {
      // Koschmieder Scattering: I(x) = J(x)*t(x) + A*(1-t(x))
      const hazeImg = ctx.getImageData(0, 0, W, H);
      const data = hazeImg.data;
      const beta = 0.4 * severityLevel;

      for (let y = 0; y < H; y++) {
        // Linear depth map from horizon (far) to bottom (near)
        const d = Math.max(0.1, 1.0 - (y / H));
        const t = Math.max(0.04, Math.exp(-beta * d));
        const airlight = atmosphericA * 255;

        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          // Apply Koschmieder
          data[idx] = Math.min(255, data[idx] * t + airlight * (1 - t));
          data[idx + 1] = Math.min(255, data[idx + 1] * t + airlight * (1 - t));
          data[idx + 2] = Math.min(255, data[idx + 2] * t + airlight * (1 - t));
        }
      }
      ctx.putImageData(hazeImg, 0, 0);
    } else if (degradationType === 'lowlight') {
      // Darkness attenuation + sensor noise
      const darkImg = ctx.getImageData(0, 0, W, H);
      const data = darkImg.data;
      const factor = Math.max(0.08, 1.0 - (severityLevel * 0.17));

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * factor + (Math.random() - 0.5) * severityLevel * 8);
        data[i + 1] = Math.min(255, data[i + 1] * factor + (Math.random() - 0.5) * severityLevel * 8);
        data[i + 2] = Math.min(255, data[i + 2] * factor + (Math.random() - 0.5) * severityLevel * 8);
      }
      ctx.putImageData(darkImg, 0, 0);
    } else if (degradationType === 'rain') {
      // Rain streaks & water veil
      ctx.fillStyle = `rgba(200, 220, 255, ${severityLevel * 0.08})`;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      const streakCount = severityLevel * 65;
      for (let s = 0; s < streakCount; s++) {
        const sx = Math.random() * W;
        const sy = Math.random() * H;
        const slen = 15 + Math.random() * 25;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 5, sy + slen);
        ctx.stroke();
      }
    }

    // 3. Apply Simulated Restoration
    if (restorationMethod !== 'none') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, W, H);
      // Overlay bounding box detection results on top
      ctx.strokeStyle = restorationMethod === 'oversmooth' ? '#f43f5e' : '#34d399';
      ctx.lineWidth = 2;
      // Detected Near Truck
      ctx.strokeRect(W * 0.64, H * 0.67, 112, 77);
      // Detected Mid Car
      if (severityLevel <= 4 || restorationMethod === 'zerodce') {
        ctx.strokeRect(W * 0.24, H * 0.69, 66, 40);
      }
    }
  }, [degradationType, severityLevel, restorationMethod, atmosphericA]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.75rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              TIER-A RESEARCH LAB · R03
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Persepsi Visual Lingkungan Buruk
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Eksplorasi Transfer Radiatif Koschmieder, Kalibrasi ECE &amp; Paradoks Restorasi-Deteksi
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            Eksperimen interaktif degradasi fisik (kabut aerosol, hujan monsun, cahaya rendah) dan pengujian bukti empiris bahwa metrik fidelitas piksel (PSNR) tidak selalu sejalan dengan keandalan deteksi hilir.
          </p>
        </div>

        {/* Degradation Type Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'haze', label: 'Hamburan Kabut (Koschmieder)' },
            { id: 'lowlight', label: 'Pencahayaan Rendah (Night)' },
            { id: 'rain', label: 'Hujan Monsun (Rain Streaks)' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDegradationType(d.id as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: degradationType === d.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: degradationType === d.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                color: degradationType === d.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Tingkat Keparahan (Severity Level 1..5):</span>
            <strong style={{ color: severityLevel >= 4 ? '#f43f5e' : 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              Level {severityLevel}
            </strong>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={severityLevel}
            onChange={(e) => setSeverityLevel(parseInt(e.target.value, 10))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Standar benchmarking korupsi neural network (Hendrycks et al., ICLR 2019).
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Cahaya Hamburan Atmosfer (Airlight A):</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{atmosphericA.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.70"
            max="1.00"
            step="0.02"
            value={atmosphericA}
            onChange={(e) => setAtmosphericA(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Parameter $A \in [0, 1]$ pada persamaan transfer radiatif $I = Jt + A(1-t)$.
          </div>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
            Pilihan Modus Restorasi / Pemulihan Citra:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'none', label: 'Tanpa Restorasi (Raw Degraded)', desc: 'Citra mentah terdegradasi' },
              { id: 'dcp', label: 'Dark Channel Prior (DCP)', desc: 'Fisika heuristik He et al.' },
              { id: 'zerodce', label: 'Zero-DCE (Physics Curve)', desc: 'Neural non-pasangan terpandu fisika' },
              { id: 'oversmooth', label: 'Heavy Over-Smoothing Filter (PARADOKS)', desc: 'Bilateral / Gaussian berat' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setRestorationMethod(m.id as any)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: restorationMethod === m.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: restorationMethod === m.id
                    ? (m.id === 'oversmooth' ? '#f43f5e' : 'var(--primary)')
                    : 'var(--bg-card)',
                  color: restorationMethod === m.id ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Canvas & Telemetry Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* HTML5 Canvas Visualizer */}
        <div
          style={{
            background: '#090d16',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            padding: '0.75rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Visual Render Kanvas: 480 &times; 280 px</span>
            <span>Status: {restorationMethod === 'none' ? 'Citra Terdegradasi' : 'Citra Direstorasi + BBox'}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={480}
            height={280}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '6px',
              display: 'block',
            }}
          />
        </div>

        {/* Dual-Metric Dashboard: Signal Quality vs Perception Accuracy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Dual Scorecards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Fidelitas Piksel (PSNR)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {liveMetrics.psnr.toFixed(1)} dB
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                SSIM: {liveMetrics.ssim.toFixed(3)}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Deteksi Hilir (mAP@[.50:.95])
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: liveMetrics.isParadox ? '#f43f5e' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                {liveMetrics.ap.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                ECE: {liveMetrics.ece.toFixed(1)}% (Target &lt; 6%)
              </div>
            </div>
          </div>

          {/* Expected Calibration Error (ECE) Card */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '6px',
              background: liveMetrics.ece > 15 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(52, 211, 153, 0.1)',
              border: liveMetrics.ece > 15 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                Expected Calibration Error (ECE):
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: liveMetrics.ece > 15 ? '#f43f5e' : '#34d399' }}>
                {liveMetrics.ece.toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.4' }}>
              {liveMetrics.ece > 15 ? (
                <span style={{ color: '#f43f5e' }}>
                  &bull; <strong>Overconfident Miscalibration:</strong> Model memprediksi objek halusinasi di dalam kabut dengan keyakinan palsu tinggi.
                </span>
              ) : (
                <span style={{ color: '#34d399' }}>
                  &bull; <strong>Calibrated Uncertainty:</strong> Probabilitas model sejalan dengan tingkat akurasi aktual (aman untuk kendaraan otonom).
                </span>
              )}
            </div>
          </div>

          {/* Research Paradox Callout */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              background: liveMetrics.isParadox ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.06)',
              border: liveMetrics.isParadox ? '1px solid #f43f5e' : '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.78rem',
              color: 'var(--text)',
              lineHeight: '1.5',
            }}
          >
            <div style={{ fontWeight: 700, color: liveMetrics.isParadox ? '#f43f5e' : 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={16} />
              {liveMetrics.isParadox ? 'PERINGATAN SAINTIFIK L4: PARADOKS TERBUKTI' : 'Penjelasan Mekanisme Fisika-Optik:'}
            </div>
            {liveMetrics.paradoxNote}
          </div>
        </div>
      </div>
    </div>
  );
};
