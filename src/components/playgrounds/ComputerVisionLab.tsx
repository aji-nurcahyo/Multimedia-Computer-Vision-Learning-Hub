import { useState, useRef, useEffect, useCallback } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';

export function ComputerVisionLab() {
  const [matrix, setMatrix] = useState<number[][]>([
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ]);

  const canvasInRef = useRef<HTMLCanvasElement>(null);
  const canvasOutRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    {
      name: 'Laplacian (Edge)',
      mat: [
        [0, 1, 0],
        [1, -4, 1],
        [0, 1, 0],
      ],
    },
    {
      name: 'Sobel Horizontal (Gx)',
      mat: [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ],
    },
    {
      name: 'Sobel Vertikal (Gy)',
      mat: [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
      ],
    },
    {
      name: 'Sharpening Mask',
      mat: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ],
    },
    {
      name: 'Ridge / Outline',
      mat: [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
      ],
    },
  ];

  const updateCell = (r: number, c: number, val: number) => {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const drawPattern = useCallback(() => {
    const canvas = canvasInRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 240;
    canvas.height = 240;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 240, 240);

    // High-contrast geometry
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(120, 120, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(80, 80, 80, 80);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 180, 180);
  }, []);

  const runConvolution = useCallback(() => {
    const cin = canvasInRef.current;
    const cout = canvasOutRef.current;
    if (!cin || !cout) return;

    const ctxIn = cin.getContext('2d');
    const ctxOut = cout.getContext('2d');
    if (!ctxIn || !ctxOut) return;

    cout.width = cin.width;
    cout.height = cin.height;

    const w = cin.width;
    const h = cin.height;

    const src = ctxIn.getImageData(0, 0, w, h).data;
    const dstImg = ctxOut.createImageData(w, h);
    const dst = dstImg.data;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4;
            const gray = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;
            sum += gray * matrix[ky + 1][kx + 1];
          }
        }

        const outIdx = (y * w + x) * 4;
        const clamped = Math.min(255, Math.max(0, Math.abs(sum)));
        dst[outIdx] = clamped;
        dst[outIdx + 1] = clamped;
        dst[outIdx + 2] = clamped;
        dst[outIdx + 3] = 255;
      }
    }

    ctxOut.putImageData(dstImg, 0, 0);
  }, [matrix]);

  useEffect(() => {
    drawPattern();
  }, [drawPattern]);

  useEffect(() => {
    runConvolution();
  }, [matrix, runConvolution]);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
          Computer Vision Kernel Convolver Playground
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ubah koefisien matriks kernel 3×3 secara manual untuk mengamati deteksi fitur tepi, gradien terarah, dan respon spatial filter.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {presets.map((p) => (
          <button
            key={p.name}
            className="control-btn"
            onClick={() => setMatrix(p.mat)}
            style={{ fontSize: '0.8rem' }}
          >
            <CheckCircle2 size={12} color="var(--primary)" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
        {/* Interactive Matrix Input */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Sliders size={16} />
            <span>Matriks Kernel W (3×3)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gap: '6px', margin: '0 auto' }}>
            {matrix.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  step="0.5"
                  value={val}
                  onChange={(e) => updateCell(r, c, parseFloat(e.target.value) || 0)}
                  style={{
                    width: '52px',
                    height: '42px',
                    textAlign: 'center',
                    background: '#020617',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Input & Output Canvases */}
        <div className="canvas-wrap" style={{ margin: 0 }}>
          <div className="canvas-panel">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
              Pola Masukan f(x,y)
            </div>
            <canvas ref={canvasInRef} />
          </div>

          <div className="canvas-panel">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
              Feature Map (f * W)(x,y)
            </div>
            <canvas ref={canvasOutRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

