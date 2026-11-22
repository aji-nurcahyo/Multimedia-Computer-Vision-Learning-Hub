import { useState } from 'react';
import { Grid, Eye, Scissors } from 'lucide-react';

export function ArrayExplorer() {
  const [gridSize, setGridSize] = useState<number>(6); // 6x6 or 8x8
  const [selectedPixel, setSelectedPixel] = useState<{ y: number; x: number }>({ y: 2, x: 2 });
  const [sliceY, setSliceY] = useState<{ start: number; end: number }>({ start: 1, end: 4 });
  const [sliceX, setSliceX] = useState<{ start: number; end: number }>({ start: 1, end: 4 });
  const [showRgbValues, setShowRgbValues] = useState<boolean>(true);

  // Generate synthetic image data
  const grid = Array(gridSize)
    .fill(0)
    .map((_, y) =>
      Array(gridSize)
        .fill(0)
        .map((_, x) => {
          const r = Math.round((y / (gridSize - 1)) * 255);
          const g = Math.round((x / (gridSize - 1)) * 255);
          const b = Math.round(((x + y) / (2 * (gridSize - 1))) * 255);
          return { r, g, b };
        })
    );

  const activePix = grid[selectedPixel.y]?.[selectedPixel.x] || { r: 0, g: 0, b: 0 };

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Multimedia Array Explorer (Chapter 05)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspeksi koordinat spasial piksel, dekomposisi saluran warna tensor RGB 3D, dan pengirisan Region of Interest (ROI).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="control-btn"
            onClick={() => setGridSize((s) => (s === 6 ? 8 : 6))}
            style={{ fontSize: '0.8rem' }}
          >
            <Grid size={13} />
            <span>Ukuran: {gridSize}×{gridSize}</span>
          </button>
          <button
            className="control-btn"
            onClick={() => setShowRgbValues((v) => !v)}
            style={{ fontSize: '0.8rem', background: showRgbValues ? 'var(--primary-glow)' : 'var(--bg-subtle)' }}
          >
            <Eye size={13} />
            <span>{showRgbValues ? 'Sembunyikan Nilai' : 'Tampilkan Nilai'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Interactive Matrix Grid */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Matriks Citra Tensor (Klik piksel untuk inspeksi koordinat [Y, X])
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 52px)`,
              gap: '4px',
              margin: '0 auto',
              background: '#020617',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            {grid.map((row, y) =>
              row.map((pix, x) => {
                const isSelected = selectedPixel.y === y && selectedPixel.x === x;
                const isInRoi =
                  y >= sliceY.start &&
                  y <= sliceY.end &&
                  x >= sliceX.start &&
                  x <= sliceX.end;

                return (
                  <div
                    key={`${y}-${x}`}
                    onClick={() => setSelectedPixel({ y, x })}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '4px',
                      background: `rgb(${pix.r}, ${pix.g}, ${pix.b})`,
                      border: isSelected
                        ? '3px solid #f59e0b'
                        : isInRoi
                        ? '2px dashed #38bdf8'
                        : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      color: '#ffffff',
                      textShadow: '0 1px 2px #000',
                      fontFamily: 'var(--font-mono)',
                      transform: isSelected ? 'scale(1.08)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                    title={`img[${y}, ${x}] -> R:${pix.r} G:${pix.g} B:${pix.b}`}
                  >
                    <span style={{ fontWeight: 700 }}>{y},{x}</span>
                    {showRgbValues && (
                      <span style={{ fontSize: '0.55rem', opacity: 0.9 }}>
                        {pix.r},{pix.g}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tensor & ROI Inspector Panel */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected Pixel Card */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.35rem' }}>
              PIKSEL TERPILIH: img[{selectedPixel.y}, {selectedPixel.x}]
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  background: `rgb(${activePix.r}, ${activePix.g}, ${activePix.b})`,
                  border: '1px solid var(--border)',
                }}
              />
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                <div><span style={{ color: 'var(--danger)' }}>Red (img[y,x,0])</span>   : <strong>{activePix.r}</strong></div>
                <div><span style={{ color: 'var(--accent)' }}>Green (img[y,x,1])</span> : <strong>{activePix.g}</strong></div>
                <div><span style={{ color: 'var(--primary)' }}>Blue (img[y,x,2])</span>  : <strong>{activePix.b}</strong></div>
              </div>
            </div>
          </div>

          {/* Slicing Controls & ROI Box */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Scissors size={14} />
              <span>PENGIRISAN REGION OF INTEREST (ROI)</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              roi = img[{sliceY.start}:{sliceY.end + 1}, {sliceX.start}:{sliceX.end + 1}]
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Rentang Baris Y</label>
                <input
                  type="range"
                  min="0"
                  max={gridSize - 2}
                  value={sliceY.start}
                  onChange={(e) => {
                    const start = Number(e.target.value);
                    setSliceY({ start, end: Math.max(start, sliceY.end) });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Rentang Kolom X</label>
                <input
                  type="range"
                  min="0"
                  max={gridSize - 2}
                  value={sliceX.start}
                  onChange={(e) => {
                    const start = Number(e.target.value);
                    setSliceX({ start, end: Math.max(start, sliceX.end) });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Dimensi ROI yang diekstrak: <strong>({sliceY.end - sliceY.start + 1}, {sliceX.end - sliceX.start + 1}, 3)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
