import React, { useState } from 'react';

export const TransferLearningExplorer: React.FC = () => {
  const [strategy, setStrategy] = useState<'frozen' | 'finetune'>('frozen');
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [numNewClasses, setNumNewClasses] = useState<number>(5);

  const TOTAL_BACKBONE_PARAMS = 11_176_512; // ResNet-18 approx
  const CLASSIFIER_HEAD_PARAMS = 512 * numNewClasses + numNewClasses;

  const trainableParams =
    strategy === 'frozen'
      ? CLASSIFIER_HEAD_PARAMS
      : TOTAL_BACKBONE_PARAMS + CLASSIFIER_HEAD_PARAMS;

  const frozenParams =
    strategy === 'frozen' ? TOTAL_BACKBONE_PARAMS : 0;

  // Epoch data points (1 to 10)
  const epochs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const lossData = epochs.map((e) => {
    if (strategy === 'frozen') {
      return (1.8 * Math.exp(-0.35 * e) + 0.35).toFixed(3);
    } else {
      return (1.8 * Math.exp(-0.55 * e) + 0.12).toFixed(3);
    }
  });

  const valAccData = epochs.map((e) => {
    if (strategy === 'frozen') {
      return Math.min(88.5, 52 + 36 * (1 - Math.exp(-0.4 * e))).toFixed(1);
    } else {
      return Math.min(94.8, 55 + 40 * (1 - Math.exp(-0.55 * e))).toFixed(1);
    }
  });

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Simulator Transfer Learning &amp; Fine-Tuning (Bab 43)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Komparasi komputasi bobot terbekukan (Frozen Feature Extractor) vs Fine-Tuning selektif, estimasi parameter latih, dan dinamika kurva konvergensi.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Configuration Controls */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
            Strategi Transfer Learning:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setStrategy('frozen')}
              style={{
                padding: '0.55rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                background: strategy === 'frozen' ? 'var(--primary)' : 'var(--bg-card)',
                color: strategy === 'frozen' ? 'var(--on-primary)' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              1. Frozen Backbone
            </button>
            <button
              onClick={() => setStrategy('finetune')}
              style={{
                padding: '0.55rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                background: strategy === 'finetune' ? 'var(--primary)' : 'var(--bg-card)',
                color: strategy === 'finetune' ? 'var(--on-primary)' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              2. Full Fine-Tuning
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Jumlah Kelas Target Baru:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{numNewClasses} Kelas</strong>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={numNewClasses}
                onChange={(e) => setNumNewClasses(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Learning Rate (LR):</span>
                <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{learningRate}</strong>
              </div>
              <input
                type="range"
                min={0.0001}
                max={0.01}
                step={0.0005}
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#020617', borderRadius: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Statistik Parameter Model:
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Parameter Trainable:</span>
              <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{trainableParams.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Parameter Frozen:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{frozenParams.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>Beban Pelatihan GPU:</span>
              <strong style={{ color: strategy === 'frozen' ? '#10b981' : '#f59e0b' }}>
                {strategy === 'frozen' ? 'Sangat Ringan (< 1% Bobot)' : 'Tinggi (100% Bobot Aktif)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Convergence Curves */}
        <div style={{ background: '#020617', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.75rem' }}>
            Simulasi Metrik Konvergensi (10 Epoch):
          </span>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.78rem', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.4rem' }}>Epoch</th>
                  <th style={{ padding: '0.4rem' }}>Loss (Cross-Entropy)</th>
                  <th style={{ padding: '0.4rem' }}>Akurasi Validasi</th>
                </tr>
              </thead>
              <tbody>
                {epochs.map((e, idx) => (
                  <tr key={e} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.35rem 0.4rem', fontFamily: 'monospace' }}>Epoch {e}</td>
                    <td style={{ padding: '0.35rem 0.4rem', fontFamily: 'monospace', color: '#f43f5e' }}>{lossData[idx]}</td>
                    <td style={{ padding: '0.35rem 0.4rem', fontFamily: 'monospace', color: '#34d399' }}>{valAccData[idx]}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong style={{ color: '#34d399' }}>Rekomendasi Praktis:</strong>
            {strategy === 'frozen'
              ? ' Feature extractor beku ideal saat dataset target sedikit (< 1.000 citra) untuk mencegah overfitting.'
              : ' Fine-tuning penuh menghasilkan akurasi puncak lebih tinggi bila data target cukup banyak dan variatif.'}
          </div>
        </div>
      </div>
    </div>
  );
};

