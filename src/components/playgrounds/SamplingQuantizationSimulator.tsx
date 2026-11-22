import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function SamplingQuantizationSimulator() {
  const [signalFreq, setSignalFreq] = useState<number>(3); // Hz
  const [sampleFreq, setSampleFreq] = useState<number>(20); // Hz
  const [bitDepth, setBitDepth] = useState<number>(4); // 1 - 8 bits
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nyquistRate = 2 * signalFreq;
  const isAliased = sampleFreq < nyquistRate;
  const theoreticalSQNR = (6.02 * bitDepth + 1.76).toFixed(1);
  const quantizationLevels = 2 ** bitDepth;
  const stepSizeDelta = (2.0 / quantizationLevels).toFixed(4);

  // Apparent frequency calculation
  const apparentFreq = isAliased
    ? Math.abs(signalFreq - Math.round(signalFreq / sampleFreq) * sampleFreq)
    : signalFreq;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;
    const ampScale = h * 0.38;

    // Clear background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    const duration = 1.0; // 1 second displayed

    // 1. Draw continuous analog signal (Faint Gray / Blue)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * duration;
      const y = midY - Math.sin(2 * Math.PI * signalFreq * t) * ampScale;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Quantized Staircase & Discrete Samples
    const nSamples = Math.floor(sampleFreq * duration);
    const deltaVal = 2.0 / quantizationLevels;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    const samplePoints: { x: number; y: number; qY: number }[] = [];

    for (let i = 0; i < nSamples; i++) {
      const t = i / sampleFreq;
      const px = (t / duration) * w;
      const analogVal = Math.sin(2 * Math.PI * signalFreq * t);

      // Quantize to nearest level
      const idx = Math.round((analogVal - (-1.0)) / deltaVal);
      const clampedIdx = Math.max(0, Math.min(quantizationLevels - 1, idx));
      const qVal = -1.0 + clampedIdx * deltaVal + deltaVal / 2.0;

      const py = midY - analogVal * ampScale;
      const qPy = midY - qVal * ampScale;

      samplePoints.push({ x: px, y: py, qY: qPy });
    }

    // Draw staircase lines between quantized points
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < samplePoints.length; i++) {
      const pt = samplePoints[i];
      const nextX = i < samplePoints.length - 1 ? samplePoints[i + 1].x : w;

      if (i === 0) ctx.moveTo(pt.x, pt.qY);
      else ctx.lineTo(pt.x, pt.qY);

      ctx.lineTo(nextX, pt.qY);
    }
    ctx.stroke();

    // 3. Draw discrete sample stems and dots
    samplePoints.forEach((pt) => {
      // Stem line
      ctx.strokeStyle = isAliased ? '#ef4444' : '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pt.x, midY);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();

      // Sample dot (Analog capture)
      ctx.fillStyle = isAliased ? '#ef4444' : '#34d399';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Quantized dot
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pt.x, pt.qY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. If aliased, draw the false reconstructed wave in dashed red
    if (isAliased) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (x / w) * duration;
        const y = midY - Math.sin(2 * Math.PI * apparentFreq * t) * ampScale;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [signalFreq, sampleFreq, bitDepth, quantizationLevels, isAliased, apparentFreq]);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
          Sampling &amp; Quantization Simulator (Chapter 02)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Simulasikan pengaruh pemilihan frekuensi cuplik ($f_s$) terhadap aliasing dan kedalaman bit ($b$) terhadap derau kuantisasi secara real-time.
        </p>
      </div>

      {/* Control Sliders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Frekuensi Sinyal Kontinu (f): {signalFreq} Hz
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={signalFreq}
            onChange={(e) => setSignalFreq(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Frekuensi Sampling (fs): {sampleFreq} Hz (Laju Nyquist: {nyquistRate} Hz)
          </label>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={sampleFreq}
            onChange={(e) => setSampleFreq(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Kedalaman Bit (Bit Depth): {bitDepth} bit ({quantizationLevels} Level Diskrit)
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={bitDepth}
            onChange={(e) => setBitDepth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Realtime Feedback Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: isAliased ? 'rgba(239, 68, 68, 0.12)' : 'var(--accent-glow)',
          border: `1px solid ${isAliased ? 'var(--danger)' : 'var(--accent)'}`,
          marginBottom: '1.5rem',
        }}
      >
        {isAliased ? <AlertTriangle color="var(--danger)" size={20} /> : <CheckCircle color="var(--accent)" size={20} />}
        <div style={{ fontSize: '0.9rem' }}>
          {isAliased ? (
            <span style={{ color: 'var(--danger)' }}>
              <strong>TERJADI ALIASING:</strong> fs ({sampleFreq} Hz) &lt; 2f ({nyquistRate} Hz). Sinyal terlipat menjadi frekuensi semu{' '}
              <strong>{apparentFreq.toFixed(1)} Hz</strong>!
            </span>
          ) : (
            <span style={{ color: 'var(--accent)' }}>
              <strong>KONDISI NYQUIST TERPENUHI:</strong> fs ({sampleFreq} Hz) &ge; 2f ({nyquistRate} Hz). Rekonstruksi eksak Whittaker-Shannon dimungkinkan.
            </span>
          )}
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="canvas-panel" style={{ maxWidth: '820px', margin: '0 auto 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
          <span>Garis Putus-Putus: Sinyal Kontinu x(t)</span>
          <span style={{ color: '#34d399' }}>Titik Hijau: Sampel x[n]</span>
          <span style={{ color: '#f59e0b' }}>Tangga Oranye: Kuantisasi Q(x)</span>
        </div>
        <canvas ref={canvasRef} width={760} height={220} />
      </div>

      {/* Numerical Metrics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Ukuran Langkah Kuantisasi (Δ)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)' }}>{stepSizeDelta}</div>
        </div>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Jumlah Tingkatan Diskrit (2^b)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{quantizationLevels} Level</div>
        </div>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SQNR Teoritis (6.02b + 1.76)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>{theoreticalSQNR} dB</div>
        </div>
      </div>
    </div>
  );
}
