import { useState } from 'react';
import { Image as ImageIcon, Volume2, Film, Layers } from 'lucide-react';

export function MultimediaDataExplorer() {
  const [activeMedia, setActiveMedia] = useState<'image' | 'audio' | 'video'>('image');
  const [activeChannel, setActiveChannel] = useState<'all' | 'red' | 'green' | 'blue'>('all');
  const [videoFrameIndex, setVideoFrameIndex] = useState(0);

  // Mini 4x4 matrix for demonstration
  const sampleMatrix = [
    [
      { r: 255, g: 50, b: 50 },
      { r: 230, g: 80, b: 40 },
      { r: 50, g: 220, b: 80 },
      { r: 40, g: 100, b: 240 },
    ],
    [
      { r: 240, g: 70, b: 60 },
      { r: 255, g: 255, b: 255 },
      { r: 30, g: 200, b: 70 },
      { r: 60, g: 80, b: 220 },
    ],
    [
      { r: 20, g: 180, b: 60 },
      { r: 40, g: 210, b: 90 },
      { r: 0, g: 0, b: 0 },
      { r: 250, g: 210, b: 30 },
    ],
    [
      { r: 50, g: 90, b: 230 },
      { r: 70, g: 110, b: 255 },
      { r: 240, g: 200, b: 40 },
      { r: 220, g: 60, b: 220 },
    ],
  ];

  const audioSamples = [0.0, 0.38, 0.71, 0.92, 1.0, 0.92, 0.71, 0.38, 0.0, -0.38, -0.71, -0.92, -1.0, -0.92, -0.71, -0.38];

  const videoFrames = [
    { id: 0, label: 'Frame t=0ms', ballPos: 20, action: 'Bola mulai bergerak di posisi kiri' },
    { id: 1, label: 'Frame t=33ms', ballPos: 45, action: 'Bola bergerak horizontal ke tengah' },
    { id: 2, label: 'Frame t=66ms', ballPos: 70, action: 'Bola memantul di dinding kanan' },
    { id: 3, label: 'Frame t=100ms', ballPos: 50, action: 'Bola bergerak kembali ke kiri' },
  ];

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Multimedia Data Explorer (Chapter 01)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Eksplorasi representasi memori atomik citra (piksel), audio (sampel temporal), dan video (rangkaian frame).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`control-btn ${activeMedia === 'image' ? 'active' : ''}`}
            onClick={() => setActiveMedia('image')}
            style={{ background: activeMedia === 'image' ? 'var(--primary)' : 'var(--bg-subtle)', color: activeMedia === 'image' ? '#090d16' : 'var(--text)' }}
          >
            <ImageIcon size={14} />
            <span>Citra 2D/3D</span>
          </button>
          <button
            className={`control-btn ${activeMedia === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveMedia('audio')}
            style={{ background: activeMedia === 'audio' ? 'var(--primary)' : 'var(--bg-subtle)', color: activeMedia === 'audio' ? '#090d16' : 'var(--text)' }}
          >
            <Volume2 size={14} />
            <span>Audio 1D</span>
          </button>
          <button
            className={`control-btn ${activeMedia === 'video' ? 'active' : ''}`}
            onClick={() => setActiveMedia('video')}
            style={{ background: activeMedia === 'video' ? 'var(--primary)' : 'var(--bg-subtle)', color: activeMedia === 'video' ? '#090d16' : 'var(--text)' }}
          >
            <Film size={14} />
            <span>Video 4D</span>
          </button>
        </div>
      </div>

      {/* MEDIA 1: CITRA */}
      {activeMedia === 'image' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Saluran:</span>
            {(['all', 'red', 'green', 'blue'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                  background: activeChannel === ch ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: activeChannel === ch ? '#090d16' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {ch === 'all' ? 'RGB Komposit' : `Saluran ${ch}`}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {/* 4x4 Color Grid */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                Visualisasi Matriks Piksel (4×4)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 50px)', gap: '4px', margin: '0 auto' }}>
                {sampleMatrix.map((row, r) =>
                  row.map((pix, c) => {
                    let bg = `rgb(${pix.r}, ${pix.g}, ${pix.b})`;
                    if (activeChannel === 'red') bg = `rgb(${pix.r}, 0, 0)`;
                    if (activeChannel === 'green') bg = `rgb(0, ${pix.g}, 0)`;
                    if (activeChannel === 'blue') bg = `rgb(0, 0, ${pix.b})`;

                    return (
                      <div
                        key={`${r}-${c}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '6px',
                          background: bg,
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          color: '#fff',
                          textShadow: '0 1px 2px #000',
                          fontFamily: 'var(--font-mono)',
                        }}
                        title={`Koordinat (Y=${r}, X=${c}) -> R:${pix.r} G:${pix.g} B:${pix.b}`}
                      >
                        {r},{c}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Matrix Data Inspector */}
            <div style={{ flex: 1, minWidth: '280px', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                <Layers size={16} />
                <span>Inspeksi Tensor Citra NumPy:</span>
              </div>
              <ul style={{ listStyle: 'none', lineHeight: 1.8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li><strong>Shape:</strong> (4, 4, 3) $\rightarrow$ Tinggi 4 piksel, Lebar 4 piksel, 3 saluran warna</li>
                <li><strong>Tipe Data:</strong> <code>np.uint8</code> (Rentang nilai $[0..255]$ per komponen)</li>
                <li><strong>Akses Koordinat (0, 0):</strong> R=255, G=50, B=50 $\rightarrow$ Merah terang</li>
                <li><strong>Akses Saluran:</strong> <code>img[y, x, 0]</code> (Merah), <code>img[y, x, 1]</code> (Hijau), <code>img[y, x, 2]</code> (Biru)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA 2: AUDIO */}
      {activeMedia === 'audio' && (
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sampel amplitudo diskrit gelombang sinusoidal 1D $x[n] = A \sin(2\pi f n / f_s)$:
          </div>

          <div style={{ background: '#020617', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '8px', justifyContent: 'center' }}>
              {audioSamples.map((val, idx) => {
                const heightPercent = Math.abs(val) * 50;
                const isPositive = val >= 0;

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22px' }}>
                    <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end' }}>
                      {isPositive && (
                        <div
                          style={{
                            width: '12px',
                            height: `${heightPercent}px`,
                            background: '#38bdf8',
                            borderRadius: '3px 3px 0 0',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ width: '100%', height: '2px', background: '#334155' }} />
                    <div style={{ height: '55px', display: 'flex', alignItems: 'flex-start' }}>
                      {!isPositive && (
                        <div
                          style={{
                            width: '12px',
                            height: `${heightPercent}px`,
                            background: '#ef4444',
                            borderRadius: '0 0 3px 3px',
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px' }}>{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Struktur Array Audio:</strong> Berdimensi 1D dengan bentuk <code>(16,)</code> bertipe <code>np.float32</code>. Setiap indeks merepresentasikan amplitudo akustik pada titik cuplik waktu $n \cdot T_s$.
          </div>
        </div>
      )}

      {/* MEDIA 3: VIDEO */}
      {activeMedia === 'video' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {videoFrames.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setVideoFrameIndex(i)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                  background: videoFrameIndex === i ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: videoFrameIndex === i ? 'var(--on-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#020617', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', width: '280px', height: '100px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', margin: '0 auto', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '35px',
                  left: `${videoFrames[videoFrameIndex].ballPos}%`,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 12px #f59e0b',
                  transition: 'left 0.25s ease',
                }}
              />
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              {videoFrames[videoFrameIndex].action}
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Struktur Tensor Video 4D:</strong> <code>shape = (4, 100, 280, 3)</code> $\rightarrow$ 4 Frame temporal sekuensial, masing-masing setinggi 100 piksel dan selebar 280 piksel dengan 3 saluran warna.
          </div>
        </div>
      )}
    </div>
  );
}
