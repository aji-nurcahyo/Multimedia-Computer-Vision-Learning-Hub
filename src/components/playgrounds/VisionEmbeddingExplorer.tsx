import React, { useState } from 'react';
import { cosineSimilarity } from '../../lib/cvProcessing';

export const VisionEmbeddingExplorer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<'cat' | 'car' | 'mountain'>('cat');

  // Precomputed verified normalized 8-dimensional visual embeddings
  const IMAGE_EMBEDDINGS: Record<string, number[]> = {
    cat: [0.65, 0.45, -0.15, 0.35, 0.12, -0.22, 0.38, 0.11],
    car: [-0.22, -0.15, 0.72, 0.48, -0.31, 0.25, -0.12, 0.15],
    mountain: [0.12, -0.45, -0.18, 0.15, 0.68, 0.42, 0.22, -0.21]
  };

  // Text embeddings in joint multimodal space
  const TEXT_PROMPTS = [
    { label: 'a cute cat sitting on a rug', vec: [0.62, 0.42, -0.11, 0.38, 0.15, -0.20, 0.35, 0.14] },
    { label: 'a modern electric sports car', vec: [-0.20, -0.12, 0.70, 0.50, -0.28, 0.22, -0.15, 0.18] },
    { label: 'a scenic snowy mountain landscape', vec: [0.15, -0.42, -0.15, 0.18, 0.65, 0.45, 0.20, -0.18] },
    { label: 'a delicious pepperoni pizza', vec: [0.10, 0.20, 0.15, -0.55, -0.25, -0.45, 0.12, 0.58] }
  ];

  const currentImgVec = IMAGE_EMBEDDINGS[selectedImage];

  const similarityResults = TEXT_PROMPTS.map((t) => ({
    prompt: t.label,
    similarity: cosineSimilarity(currentImgVec, t.vec)
  }));
  similarityResults.sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Eksplorasi Vektor Embedding Multimodal &amp; Zero-Shot CLIP (Bab 49)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pengukuran keselarasan semantik antara representasi embedding citra visual dan teks bahasa alami melalui metrik Cosine Similarity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Image Selection */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
            Pilih Citra Uji Visual:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { type: 'cat', label: '1. Citra Kucing (Hewan Peliharaan)', icon: '🐱' },
              { type: 'car', label: '2. Citra Mobil Sport (Kendaraan)', icon: '🚗' },
              { type: 'mountain', label: '3. Citra Pegunungan (Lanskap Alam)', icon: '🏔️' }
            ].map((img) => (
              <button
                key={img.type}
                onClick={() => setSelectedImage(img.type as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  background: selectedImage === img.type ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedImage === img.type ? 'var(--on-primary)' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <span>{img.icon}</span>
                <span>{img.label}</span>
              </button>
            ))}
          </div>

          <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              Vektor Embedding Citra ({currentImgVec.length} Dimensi Terpilih):
            </span>
            <div style={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>
              [{currentImgVec.map((v) => v.toFixed(2)).join(', ')}]
            </div>
          </div>
        </div>

        {/* Similarities Bar */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', display: 'block', marginBottom: '0.75rem' }}>
            Peringkat Zero-Shot Classification (Cosine Similarity):
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {similarityResults.map((res, idx) => (
              <div key={res.prompt}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: idx === 0 ? 700 : 400, color: idx === 0 ? '#34d399' : 'var(--text)' }}>
                    {idx + 1}. "{res.prompt}" {idx === 0 && '★ (Prediksi Terbaik)'}
                  </span>
                  <strong style={{ fontFamily: 'monospace', color: idx === 0 ? '#34d399' : '#94a3b8' }}>
                    {res.similarity.toFixed(3)}
                  </strong>
                </div>
                <div style={{ height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(0, res.similarity * 100)}%`,
                      background: idx === 0 ? '#10b981' : '#38bdf8',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#020617', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong style={{ color: '#fbbf24' }}>Catatan Metrik:</strong> Cosine Similarity bernilai antara -1.0 hingga +1.0. Skor &gt; 0.85 mengindikasikan kecocokan semantik visual-teks yang sangat kuat tanpa pelatihan terawasi spesifik.
          </div>
        </div>
      </div>
    </div>
  );
};

