import React, { useState, useEffect, useRef } from 'react';
import {
  simulateAtmosphericHaze,
  computeDarkChannel,
  computeImageMetrics,
  computeExpectedCalibrationError
} from '../../lib/advancedCvProcessing';
import { Activity, RotateCcw, ShieldAlert } from 'lucide-react';

export const AdverseConditionsExplorerLab: React.FC = () => {
  const [hazeIntensity, setHazeIntensity] = useState<number>(0.65);
  const [lightLevel, setLightLevel] = useState<number>(0.85); // 0.1 to 1.0
  const [noiseStd, setNoiseStd] = useState<number>(10);
  const [rainStreaks, setRainStreaks] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'degraded' | 'darkChannel' | 'restored'>('degraded');

  // Metrics
  const [psnr, setPsnr] = useState<number>(24.5);
  const [ssim, setSsim] = useState<number>(0.72);
  const [ece, setEce] = useState<number>(0.14);

  const cleanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Synthetic Road/Horizon Scene onto Clean Canvas once
  const drawCleanScene = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // 1. Sky Gradient (deep blue to light cyan at horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.45);

    // 2. Mountains in distance (horizon ~ y = 0.42 * h)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w * 0.25, h * 0.28);
    ctx.lineTo(w * 0.5, h * 0.42);
    ctx.lineTo(w * 0.75, h * 0.25);
    ctx.lineTo(w, h * 0.45);
    ctx.fill();

    // 3. Ground / Vegetation
    const groundGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    groundGrad.addColorStop(0, '#15803d');
    groundGrad.addColorStop(1, '#166534');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // 4. Highway Perspective Road
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(w * 0.47, h * 0.45);
    ctx.lineTo(w * 0.53, h * 0.45);
    ctx.lineTo(w * 0.85, h);
    ctx.lineTo(w * 0.15, h);
    ctx.fill();

    // Road Markings (yellow center line)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.45);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Vehicle in Mid-Distance
    const carX = w * 0.46;
    const carY = h * 0.62;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(carX, carY, 32, 20); // Car body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(carX + 4, carY - 8, 24, 10); // Cabin
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(carX + 6, carY - 6, 20, 6); // Windshield
  };

  useEffect(() => {
    const cleanCanvas = cleanCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!cleanCanvas || !displayCanvas) return;

    const w = 420;
    const h = 260;
    cleanCanvas.width = w;
    cleanCanvas.height = h;
    displayCanvas.width = w;
    displayCanvas.height = h;

    const cleanCtx = cleanCanvas.getContext('2d', { willReadFrequently: true });
    const dispCtx = displayCanvas.getContext('2d');
    if (!cleanCtx || !dispCtx) return;

    // Draw reference clean scene
    drawCleanScene(cleanCtx, w, h);
    const cleanImgData = cleanCtx.getImageData(0, 0, w, h);
    const cleanPixels = cleanImgData.data;

    // Apply Environmental Degradation
    // 1. Koschmieder Atmospheric Scattering Haze
    const hazyPixels = simulateAtmosphericHaze(cleanPixels, w, h, {
      hazeIntensity,
      airlight: [225, 230, 235]
    });

    // 2. Low-light exposure scaling and additive sensor noise
    const degradedPixels = new Uint8ClampedArray(hazyPixels.length);
    for (let i = 0; i < degradedPixels.length; i += 4) {
      // Light level scaling
      let r = hazyPixels[i] * lightLevel;
      let g = hazyPixels[i + 1] * lightLevel;
      let b = hazyPixels[i + 2] * lightLevel;

      // Additive Gaussian noise
      if (noiseStd > 0) {
        const u1 = Math.max(1e-6, Math.random());
        const u2 = Math.random();
        const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseStd;
        r += noise;
        g += noise;
        b += noise;
      }

      degradedPixels[i] = Math.min(255, Math.max(0, Math.round(r)));
      degradedPixels[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
      degradedPixels[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
      degradedPixels[i + 3] = 255;
    }

    // 3. Optional Directional Rain Streaks
    if (rainStreaks) {
      const numDrops = 180;
      for (let d = 0; d < numDrops; d++) {
        const rx = Math.floor(Math.random() * (w - 15));
        const ry = Math.floor(Math.random() * (h - 25));
        for (let l = 0; l < 18; l++) {
          const px = rx + Math.floor(l * 0.35);
          const py = ry + l;
          if (px < w && py < h) {
            const idx = (py * w + px) * 4;
            degradedPixels[idx] = Math.min(255, degradedPixels[idx] + 75);
            degradedPixels[idx + 1] = Math.min(255, degradedPixels[idx + 1] + 80);
            degradedPixels[idx + 2] = Math.min(255, degradedPixels[idx + 2] + 95);
          }
        }
      }
    }

    // Process output depending on viewMode
    let finalPixels = degradedPixels;

    if (viewMode === 'darkChannel') {
      const darkChan = computeDarkChannel(degradedPixels, w, h, 5);
      finalPixels = new Uint8ClampedArray(degradedPixels.length);
      for (let i = 0; i < darkChan.length; i++) {
        const v = Math.round(darkChan[i]);
        const idx = i * 4;
        finalPixels[idx] = v;
        finalPixels[idx + 1] = v;
        finalPixels[idx + 2] = v;
        finalPixels[idx + 3] = 255;
      }
    } else if (viewMode === 'restored') {
      // Basic Dark-Channel-guided restoration: J(x) = (I(x) - A) / max(t(x), t0) + A
      const darkChan = computeDarkChannel(degradedPixels, w, h, 5);
      finalPixels = new Uint8ClampedArray(degradedPixels.length);
      const airlight = 220;

      for (let i = 0; i < darkChan.length; i++) {
        const t = Math.max(0.18, 1.0 - 0.95 * (darkChan[i] / airlight));
        const idx = i * 4;

        finalPixels[idx] = Math.min(255, Math.max(0, Math.round((degradedPixels[idx] - airlight) / t + airlight)));
        finalPixels[idx + 1] = Math.min(255, Math.max(0, Math.round((degradedPixels[idx + 1] - airlight) / t + airlight)));
        finalPixels[idx + 2] = Math.min(255, Math.max(0, Math.round((degradedPixels[idx + 2] - airlight) / t + airlight)));
        finalPixels[idx + 3] = 255;
      }
    }

    // Render onto display canvas
    const dispImgData = dispCtx.createImageData(w, h);
    dispImgData.data.set(finalPixels);
    dispCtx.putImageData(dispImgData, 0, 0);

    // Compute Metrics against clean
    const metrics = computeImageMetrics(cleanPixels, degradedPixels, w, h);
    setPsnr(metrics.psnr);
    setSsim(metrics.ssim);

    // Synthetic calibration error estimation (grows with degradation severity)
    const severity = hazeIntensity * 0.5 + (1 - lightLevel) * 0.3 + (noiseStd / 40) * 0.2;
    const confidences = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6];
    const correctLabels = confidences.map((c) => Math.random() < c * (1 - severity * 0.45));
    const calib = computeExpectedCalibrationError(confidences, correctLabels, 5);
    setEce(calib.ece);
  }, [hazeIntensity, lightLevel, noiseStd, rainStreaks, viewMode]);

  const resetParams = () => {
    setHazeIntensity(0.65);
    setLightLevel(0.85);
    setNoiseStd(10);
    setRainStreaks(true);
    setViewMode('degraded');
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <Activity size={14} />
            <span>Laboratorium Tier A · Modul ADV-06</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
            Adverse Conditions &amp; Robustness Explorer
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Simulasi transfer radiasi atmosfer Koschmieder, hujan tropis, pencahayaan redup, estimasi Dark Channel Prior, dan kalibrasi ketidakpastian model (ECE).
          </p>
        </div>

        <button
          onClick={resetParams}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <RotateCcw size={13} /> Reset Parameter
        </button>
      </div>

      {/* Metrics HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PSNR (Kualitas Restorasi)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: psnr > 25 ? 'var(--accent)' : 'var(--warning)' }}>
            {psnr.toFixed(1)} dB
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SSIM (Kemiripan Struktur)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: ssim > 0.8 ? 'var(--accent)' : 'var(--warning)' }}>
            {ssim.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expected Calibration Error</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: ece < 0.1 ? 'var(--accent)' : 'var(--danger)' }}>
            {(ece * 100).toFixed(1)}% ECE
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status Robustness</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: ece > 0.15 ? 'var(--danger)' : 'var(--primary)' }}>
            {ece > 0.15 ? 'Overconfident (OOD)' : 'Terkalibrasi'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Canvas Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Hidden reference canvas */}
          <canvas ref={cleanCanvasRef} style={{ display: 'none' }} />

          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '260px',
              background: '#090d16',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <canvas ref={displayCanvasRef} width={420} height={260} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              onClick={() => setViewMode('degraded')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: viewMode === 'degraded' ? 'var(--primary)' : 'var(--bg-subtle)',
                color: viewMode === 'degraded' ? 'var(--on-primary)' : 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Citra Terdegradasi ($I$)
            </button>
            <button
              onClick={() => setViewMode('darkChannel')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: viewMode === 'darkChannel' ? 'var(--primary)' : 'var(--bg-subtle)',
                color: viewMode === 'darkChannel' ? 'var(--on-primary)' : 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dark Channel Prior ($J^{'{'}dark{'}'}$)
            </button>
            <button
              onClick={() => setViewMode('restored')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: viewMode === 'restored' ? 'var(--accent)' : 'var(--bg-subtle)',
                color: viewMode === 'restored' ? '#000' : 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Restorasi Transmisi ($J$)
            </button>
          </div>
        </div>

        {/* Degradation Controls */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.6rem' }}>
              Parameter Kerusakan Lingkungan (Koschmieder Model):
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Intensitas Kabut / Haze ($\beta$):</span>
                <span>{hazeIntensity.toFixed(2)}</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={hazeIntensity} onChange={(e) => setHazeIntensity(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Pencahayaan / Low-Light:</span>
                <span>{(lightLevel * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0.15" max="1.0" step="0.05" value={lightLevel} onChange={(e) => setLightLevel(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Gaussian Sensor Noise ($\sigma$):</span>
                <span>{noiseStd}</span>
              </div>
              <input type="range" min="0" max="35" step="1" value={noiseStd} onChange={(e) => setNoiseStd(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={rainStreaks} onChange={(e) => setRainStreaks(e.target.checked)} />
                Simulasikan Guratan Hujan Tropis (Rain Streaks)
              </label>
            </div>
          </div>

          {/* Educational Insights Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={14} color="var(--primary)" />
              Dampak Terhadap Downstream Computer Vision:
            </div>
            • <strong>PSNR vs Deteksi:</strong> Peningkatan metrik restorasi (PSNR/SSIM) tidak otomatis meningkatkan akurasi detektor neural; artefak deblurring/dehazing dapat mengacaukan fitur tepi pada layer awal CNN.<br />
            • <strong>Kalibrasi ECE:</strong> Di bawah kabut tebal atau glare malam hari, neural network standar sering menghasilkan probabilitas prediksi tinggi (overconfident) pada kelas yang salah. Kalibrasi temperatur (temperature scaling) diperlukan untuk keselamatan otonom.
          </div>
        </div>
      </div>
    </div>
  );
};
