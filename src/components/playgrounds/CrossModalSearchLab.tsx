import React, { useState, useMemo } from 'react';
import {
  rankByCosineSimilarity,
  computeRetrievalMetrics,
  RetrievalItem
} from '../../lib/multimodalProcessing';

interface DatabaseItem extends RetrievalItem {
  modality: 'image' | 'audio' | 'video';
  tags: string[];
}

export const CrossModalSearchLab: React.FC = () => {
  const [selectedQueryKey, setSelectedQueryKey] = useState<string>('ambulance');
  const [topK, setTopK] = useState<number>(3);

  // Gallery of 8 indexed media items in joint multimodal metric space
  const MEDIA_DATABASE: DatabaseItem[] = [
    {
      id: 'item-1',
      title: 'Mobil Ambulans Sirene Darurat',
      modality: 'video',
      tags: ['vehicle', 'emergency', 'siren', 'speed'],
      category: 'vehicle',
      embedding: [0.78, 0.45, -0.20, 0.35, -0.15, 0.50, 0.22, 0.18]
    },
    {
      id: 'item-2',
      title: 'Mobil Pemadam Kebakaran',
      modality: 'image',
      tags: ['vehicle', 'emergency', 'truck', 'fire'],
      category: 'vehicle',
      embedding: [0.72, 0.40, -0.18, 0.38, -0.10, 0.48, 0.20, 0.15]
    },
    {
      id: 'item-3',
      title: 'Puncak Gunung Salju & Danau Alpen',
      modality: 'image',
      tags: ['nature', 'mountain', 'snow', 'lake'],
      category: 'nature',
      embedding: [-0.35, -0.65, 0.55, -0.22, 0.45, -0.18, -0.30, 0.12]
    },
    {
      id: 'item-4',
      title: 'Kicauan Burung Hutan Hujan Tropis',
      modality: 'audio',
      tags: ['nature', 'forest', 'birds', 'rain'],
      category: 'nature',
      embedding: [-0.30, -0.60, 0.52, -0.20, 0.48, -0.15, -0.25, 0.10]
    },
    {
      id: 'item-5',
      title: 'Konser Orkestra Simfoni Biola',
      modality: 'audio',
      tags: ['music', 'orchestra', 'violin', 'classical'],
      category: 'music',
      embedding: [0.12, 0.25, 0.70, 0.52, -0.38, -0.25, 0.35, -0.10]
    },
    {
      id: 'item-6',
      title: 'Gitaris Solo Panggung Rock',
      modality: 'video',
      tags: ['music', 'guitar', 'rock', 'performance'],
      category: 'music',
      embedding: [0.15, 0.28, 0.68, 0.48, -0.35, -0.20, 0.32, -0.08]
    },
    {
      id: 'item-7',
      title: 'Ruang Operasi Bedah Jantung',
      modality: 'image',
      tags: ['medical', 'hospital', 'surgery', 'doctor'],
      category: 'medical',
      embedding: [-0.45, 0.35, -0.25, 0.65, 0.35, 0.15, -0.18, 0.52]
    },
    {
      id: 'item-8',
      title: 'Rekaman EKG Jantung & Monitor Pasien',
      modality: 'audio',
      tags: ['medical', 'hospital', 'ecg', 'heartbeat'],
      category: 'medical',
      embedding: [-0.42, 0.32, -0.22, 0.62, 0.32, 0.18, -0.15, 0.55]
    }
  ];

  const QUERIES = [
    {
      id: 'ambulance',
      label: 'Teks: "emergency vehicle rushing with loud sirens"',
      category: 'vehicle',
      targetCategory: 'vehicle',
      embedding: [0.75, 0.42, -0.19, 0.36, -0.12, 0.49, 0.21, 0.16]
    },
    {
      id: 'nature',
      label: 'Teks: "peaceful pristine snowy mountain alpine landscape"',
      category: 'nature',
      targetCategory: 'nature',
      embedding: [-0.34, -0.63, 0.54, -0.21, 0.46, -0.16, -0.28, 0.11]
    },
    {
      id: 'music',
      label: 'Teks: "classical symphony musical instrument acoustics"',
      category: 'music',
      targetCategory: 'music',
      embedding: [0.13, 0.26, 0.69, 0.50, -0.36, -0.22, 0.34, -0.09]
    },
    {
      id: 'medical',
      label: 'Teks: "clinical hospital healthcare surgery monitoring"',
      category: 'medical',
      targetCategory: 'medical',
      embedding: [-0.43, 0.33, -0.23, 0.63, 0.33, 0.16, -0.16, 0.53]
    }
  ];

  const activeQuery = QUERIES.find((q) => q.id === selectedQueryKey) || QUERIES[0];

  // Retrieval calculation
  const { rankedResults, metrics } = useMemo(() => {
    const ranked = rankByCosineSimilarity(activeQuery.embedding, MEDIA_DATABASE);

    // Ground truth relevant item IDs match the target category
    const relevantIds = new Set(
      MEDIA_DATABASE
        .filter((item) => item.category === activeQuery.targetCategory)
        .map((item) => item.id)
    );

    const retrievalMetrics = computeRetrievalMetrics(ranked, relevantIds, topK);

    return { rankedResults: ranked, metrics: retrievalMetrics };
  }, [activeQuery, topK]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: '#10b981', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
            BAB 54
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Cross-Modal Semantic Retrieval Engine &amp; Embedding Space
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Eksplorasi penelusuran lintas-modalitas (Text-to-Media Search) pada ruang metrik bersama (Joint Embedding Space) dengan evaluasi kuantitatif Recall@K, Precision@K, dan MRR.
        </p>
      </div>

      {/* Query Selector & Top-K Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Pilih Kueri Pencarian Lintas-Modal (Natural Language Query):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {QUERIES.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQueryKey(q.id)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  background: selectedQueryKey === q.id ? '#10b981' : 'var(--bg-card)',
                  color: selectedQueryKey === q.id ? '#ffffff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontWeight: selectedQueryKey === q.id ? 600 : 400
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Parameter Ambang Retrieval:
          </label>
          <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Ambang Batas Top-K Dokumen:</span>
              <strong style={{ fontFamily: 'monospace', color: '#10b981' }}>K = {topK}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
              style={{ width: '100%', marginBottom: '0.75rem' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              Kueri dievaluasi terhadap 8 item galeri multimedia terindeks (Citra, Video, dan Audio).
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Precision@{topK}</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
            {(metrics.precisionAtK * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Rasio item relevan pada Top-{topK}</span>
        </div>

        <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Recall@{topK}</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
            {(metrics.recallAtK * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Cakupan total item relevan</span>
        </div>

        <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Mean Reciprocal Rank (MRR)</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
            {metrics.mrr.toFixed(3)}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Peringkat item pertama (1/Rank)</span>
        </div>
      </div>

      {/* Ranked Media Gallery */}
      <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.75rem' }}>
          Peringkat Hasil Retrieval Lintas-Modal (Diurutkan berdasarkan Kemiripan Kosinus Semantik):
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {rankedResults.map((result, idx) => {
            const item = result as DatabaseItem;
            const isTopK = idx < topK;
            const isRelevant = item.category === activeQuery.targetCategory;
            const sim = result.similarity ?? 0;

            return (
              <div
                key={result.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: isTopK ? 'var(--bg-card)' : 'transparent',
                  border: isTopK ? '1px solid #10b981' : '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  opacity: isTopK ? 1.0 : 0.65
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: isTopK ? '#10b981' : '#64748b',
                      color: '#ffffff',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {item.title}{' '}
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#1e293b', color: '#93c5fd' }}>
                        {item.modality.toUpperCase()}
                      </span>{' '}
                      {isRelevant && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ (Ground Truth Relevan)</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Tags: {item.tags ? item.tags.join(', ') : ''}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{ color: isTopK ? '#10b981' : '#94a3b8', fontWeight: 600 }}>
                    cos(θ) = {sim.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Euclidean: {Math.sqrt(Math.max(0, 2 * (1 - sim))).toFixed(3)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

