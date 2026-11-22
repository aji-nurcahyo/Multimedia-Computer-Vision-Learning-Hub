import React, { useState, useMemo } from 'react';
import { zeroShotClassify, l2Normalize } from '../../lib/multimodalProcessing';

interface SampleImage {
  id: string;
  title: string;
  category: string;
  featureVector: number[];
  description: string;
}

export const VisionLanguageLab: React.FC = () => {
  const SAMPLES: SampleImage[] = [
    {
      id: 'satellite',
      title: 'Citra Satelit Vegetasi Hutan Tropis',
      category: 'Remote Sensing',
      featureVector: [0.72, 0.55, -0.25, 0.18, 0.65, 0.38, -0.15, 0.22],
      description: 'Tutupan kanopi hutan lebat dengan pantulan spektral inframerah dekat tinggi.'
    },
    {
      id: 'medical',
      title: 'Radiografi Thorax (Rontgen Paru-Paru)',
      category: 'Medical Imaging',
      featureVector: [-0.35, 0.12, 0.78, 0.52, -0.15, -0.42, 0.68, 0.25],
      description: 'Opasitas lobus inferior kanan dengan gambaran infiltrat bronkopulmoner.'
    },
    {
      id: 'traffic',
      title: 'CCTV Jalan Tol Arus Lalu Lintas Padat',
      category: 'Intelligent Transportation',
      featureVector: [0.18, -0.45, -0.32, 0.75, -0.28, 0.68, 0.12, 0.55],
      description: 'Kepadatan kendaraan bermotor roda empat pada lajur bebas hambatan antar kota.'
    },
    {
      id: 'coastal',
      title: 'Surveillance Drone Garis Pantai & Muara',
      category: 'Maritime Monitoring',
      featureVector: [0.65, -0.52, 0.25, -0.38, 0.72, 0.15, -0.45, 0.60],
      description: 'Zona perairan pesisir pantai dengan perahu nelayan dan gelombang laut.'
    }
  ];

  const [selectedSampleId, setSelectedSampleId] = useState<string>('satellite');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [candidateLabels, setCandidateLabels] = useState<string[]>([
    'a satellite photo of tropical rainforest canopy',
    'a medical chest x-ray showing pneumonia infiltration',
    'an aerial highway surveillance of heavy traffic congestion',
    'a coastal maritime patrol drone footage over ocean waves'
  ]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const currentSample = SAMPLES.find((s) => s.id === selectedSampleId) || SAMPLES[0];

  // Precomputed synthetic language embeddings corresponding to canonical semantic categories
  // Deterministic semantic representations mapped onto the 8D shared multimodal embedding space
  const PROMPT_EMBEDDINGS: Record<string, number[]> = {
    'a satellite photo of tropical rainforest canopy': [0.70, 0.52, -0.22, 0.15, 0.62, 0.35, -0.12, 0.20],
    'a medical chest x-ray showing pneumonia infiltration': [-0.32, 0.10, 0.75, 0.50, -0.12, -0.40, 0.65, 0.22],
    'an aerial highway surveillance of heavy traffic congestion': [0.15, -0.42, -0.30, 0.72, -0.25, 0.65, 0.10, 0.52],
    'a coastal maritime patrol drone footage over ocean waves': [0.62, -0.50, 0.22, -0.35, 0.70, 0.12, -0.42, 0.58]
  };

  const getEmbeddingForText = (text: string): number[] => {
    if (PROMPT_EMBEDDINGS[text]) {
      return PROMPT_EMBEDDINGS[text];
    }
    // Deterministic pseudo-embedding from string hash for custom prompt exploration
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const pseudo = [
      Math.sin(hash + 1),
      Math.cos(hash + 2),
      Math.sin(hash * 0.5 + 3),
      Math.cos(hash * 0.7 + 4),
      Math.sin(hash * 0.3 + 5),
      Math.cos(hash * 1.2 + 6),
      Math.sin(hash * 0.9 + 7),
      Math.cos(hash * 0.4 + 8)
    ];
    return l2Normalize(pseudo);
  };

  const classificationResults = useMemo(() => {
    const classTextEmbeddings = candidateLabels.map((lbl) => ({
      className: lbl,
      embedding: getEmbeddingForText(lbl)
    }));
    return zeroShotClassify(currentSample.featureVector, classTextEmbeddings, temperature);
  }, [currentSample, candidateLabels, temperature]);

  const handleAddCustomPrompt = () => {
    if (customPrompt.trim().length > 0 && !candidateLabels.includes(customPrompt.trim())) {
      setCandidateLabels([...candidateLabels, customPrompt.trim()]);
      setCustomPrompt('');
    }
  };

  const handleRemovePrompt = (idx: number) => {
    if (candidateLabels.length > 2) {
      setCandidateLabels(candidateLabels.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: '#6366f1', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
            BAB 52
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Vision-Language Models (VLM) &amp; Zero-Shot CLIP Studio
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Eksplorasi perataan representasi visual-linguistik (Contrastive Language-Image Pre-training) untuk klasifikasi zero-shot berbasis kemiripan kosinus semantik.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start', marginBottom: '1.5rem' }}>
        {/* Sample Image Selection */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
            1. Pilih Sampel Citra Uji Visual:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSampleId(s.id)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  background: selectedSampleId === s.id ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedSampleId === s.id ? '#ffffff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{s.category}</div>
              </button>
            ))}
          </div>

          <div style={{ background: '#090d16', padding: '0.85rem', borderRadius: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Deskripsi Domain Citra:
            </span>
            <p style={{ color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>{currentSample.description}</p>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              Vektor Embedding Visual L2 ({currentSample.featureVector.length}D):
            </span>
            <div style={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all', fontSize: '0.72rem' }}>
              [{l2Normalize(currentSample.featureVector).map((v) => v.toFixed(2)).join(', ')}]
            </div>
          </div>
        </div>

        {/* Candidate Prompt Configuration */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.75rem' }}>
            2. Prompt Teks Hipotesis (Candidate Prompts):
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {candidateLabels.map((lbl, idx) => (
              <div
                key={lbl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}
              >
                <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
                  {idx + 1}. "{lbl}"
                </span>
                {candidateLabels.length > 2 && (
                  <button
                    onClick={() => handleRemovePrompt(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '0 4px'
                    }}
                    title="Hapus Prompt"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Tambah prompt baru (cth: a photo of a forest fire)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPrompt()}
              style={{
                flex: 1,
                padding: '0.45rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)'
              }}
            />
            <button
              onClick={handleAddCustomPrompt}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              + Tambah
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Softmax Temperature (τ):</span>
              <strong style={{ fontFamily: 'monospace', color: '#6366f1' }}>{temperature.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Results Ranking */}
      <div style={{ background: '#090d16', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
            Hasil Klasifikasi Zero-Shot (Cosine Similarity &amp; Softmax Probability):
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Formula: P(y|x) = exp(sim(I, T_y) / τ) / Σ exp(sim(I, T_k) / τ)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {classificationResults.map((res, idx) => {
            const isWinner = idx === 0;
            return (
              <div key={res.className}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: isWinner ? 700 : 400, color: isWinner ? '#34d399' : '#cbd5e1' }}>
                    {idx + 1}. "{res.className}" {isWinner && '★ (Prediksi Terkuat)'}
                  </span>
                  <div style={{ display: 'flex', gap: '1rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#94a3b8' }}>
                      cos(θ) = {res.similarity.toFixed(3)}
                    </span>
                    <strong style={{ color: isWinner ? '#34d399' : '#e2e8f0' }}>
                      {(res.score * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, res.score * 100))}%`,
                      height: '100%',
                      background: isWinner ? '#34d399' : '#475569',
                      transition: 'width 0.2s ease-in-out'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

