import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Film } from 'lucide-react';

export function VideoProcessingLab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [threshold, setThreshold] = useState(30);

  const canvasRawRef = useRef<HTMLCanvasElement>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  // Animated bouncing ball on canvas simulating live video feed
  useEffect(() => {
    let x = 50, y = 60, dx = 3, dy = 2.5;
    let running = isPlaying;

    const canvasRaw = canvasRawRef.current;
    const canvasDiff = canvasDiffRef.current;
    if (!canvasRaw || !canvasDiff) return;

    const ctxRaw = canvasRaw.getContext('2d', { willReadFrequently: true });
    const ctxDiff = canvasDiff.getContext('2d');
    if (!ctxRaw || !ctxDiff) return;

    canvasRaw.width = 300;
    canvasRaw.height = 200;
    canvasDiff.width = 300;
    canvasDiff.height = 200;

    const loop = () => {
      if (!running) return;

      // Draw background
      ctxRaw.fillStyle = '#0f172a';
      ctxRaw.fillRect(0, 0, 300, 200);

      // Draw static scenery
      ctxRaw.fillStyle = '#1e293b';
      ctxRaw.fillRect(40, 120, 80, 80);
      ctxRaw.fillStyle = '#334155';
      ctxRaw.fillRect(180, 140, 90, 60);

      // Draw moving object
      ctxRaw.fillStyle = '#f59e0b';
      ctxRaw.beginPath();
      ctxRaw.arc(x, y, 16, 0, Math.PI * 2);
      ctxRaw.fill();

      // Bounce physics
      x += dx;
      y += dy;
      if (x + 16 > 300 || x - 16 < 0) dx = -dx;
      if (y + 16 > 200 || y - 16 < 0) dy = -dy;

      // Motion detection via Frame Differencing |F(t) - F(t-1)| > Thresh
      const currentFrame = ctxRaw.getImageData(0, 0, 300, 200);
      const curr = currentFrame.data;
      const diffImg = ctxDiff.createImageData(300, 200);
      const diff = diffImg.data;

      if (prevFrameRef.current) {
        const prev = prevFrameRef.current;
        for (let i = 0; i < curr.length; i += 4) {
          const delta = Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2]);
          const avgDelta = delta / 3;

          if (avgDelta > threshold) {
            diff[i] = 239;     // Red motion highlight
            diff[i + 1] = 68;
            diff[i + 2] = 68;
            diff[i + 3] = 255;
          } else {
            // Dim grayscale background
            const gray = (curr[i] + curr[i + 1] + curr[i + 2]) / 3 * 0.25;
            diff[i] = gray;
            diff[i + 1] = gray;
            diff[i + 2] = gray;
            diff[i + 3] = 255;
          }
        }
      }

      ctxDiff.putImageData(diffImg, 0, 0);
      prevFrameRef.current = new Uint8ClampedArray(curr);

      animRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      loop();
    } else {
      // Draw initial frame
      ctxRaw.fillStyle = '#0f172a';
      ctxRaw.fillRect(0, 0, 300, 200);
      ctxRaw.fillStyle = '#f59e0b';
      ctxRaw.beginPath();
      ctxRaw.arc(x, y, 16, 0, Math.PI * 2);
      ctxRaw.fill();
    }

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, threshold]);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Digital Video Analysis &amp; Temporal Motion Detection Lab
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Simulasi frame-by-frame background subtraction dan temporal frame differencing untuk mendeteksi pergerakan objek secara real-time.
          </p>
        </div>
        <button
          className="control-btn"
          onClick={() => setIsPlaying((p) => !p)}
          style={{ background: isPlaying ? '#f59e0b' : '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem 1.2rem' }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Jeda Video' : 'Jalankan Streaming'}</span>
        </button>
      </div>

      <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '380px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          Ambang Batas Gerak (Motion Delta Threshold): {threshold}
        </label>
        <input
          type="range"
          min="10"
          max="80"
          step="5"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Film size={14} />
            <span>Feed Video Asli F(t)</span>
          </div>
          <canvas ref={canvasRawRef} />
        </div>

        <div className="canvas-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <span>Deteksi Gerak |F(t) - F(t-1)| &gt; Thresh</span>
          </div>
          <canvas ref={canvasDiffRef} />
        </div>
      </div>
    </div>
  );
}

