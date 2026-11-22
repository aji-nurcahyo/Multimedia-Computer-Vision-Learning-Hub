import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { computeClassificationMetrics } from '../../lib/cvProcessing';

export const VisionEvaluationDashboard: React.FC = () => {
  const [modelType, setModelType] = useState<'resnet' | 'yolo_cls' | 'vit'>('vit');

  // Ground truth vs Predicted Confusion Matrices (3 classes: Pedestrian, Vehicle, Cyclist)
  const MATRIX_DATA: Record<string, number[][]> = {
    vit: [
      [92,  5,  3], // Pedestrian: 92 correct, 5 vehicle, 3 cyclist
      [ 3, 94,  3], // Vehicle: 3 pedestrian, 94 correct, 3 cyclist
      [ 4,  4, 92]  // Cyclist: 4 pedestrian, 4 vehicle, 92 correct
    ],
    resnet: [
      [84, 10,  6],
      [ 7, 88,  5],
      [ 8,  8, 84]
    ],
    yolo_cls: [
      [88,  8,  4],
      [ 5, 91,  4],
      [ 6,  7, 87]
    ]
  };

  const CLASSES = ['Pedestrian', 'Vehicle', 'Cyclist'];
  const cm = MATRIX_DATA[modelType];
  const metrics = computeClassificationMetrics(cm);

  const handleExportCSV = () => {
    let csv = 'actual_class,pred_pedestrian,pred_vehicle,pred_cyclist\n';
    CLASSES.forEach((c, r) => {
      csv += `${c},${cm[r][0]},${cm[r][1]},${cm[r][2]}\n`;
    });
    csv += `\nmetric,value\naccuracy,${metrics.accuracy.toFixed(4)}\nmacro_precision,${metrics.precision.toFixed(4)}\nmacro_recall,${metrics.recall.toFixed(4)}\nmacro_f1,${metrics.f1Score.toFixed(4)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model_evaluation_${modelType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Dashboard Evaluasi Model Vision &amp; Matriks Konfusi (Bab 50)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Analisis diagnostik performa inferensi visi komputer: Matriks Konfusi, Presisi, Recall, F1-Score, dan ekspor laporan metrik evaluasi.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'vit', label: 'Vision Transformer (ViT-Base)' },
            { id: 'yolo_cls', label: 'YOLOv8-Classifier' },
            { id: 'resnet', label: 'ResNet-50 (Baseline)' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModelType(m.id as any)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                background: modelType === m.id ? 'var(--primary)' : 'var(--bg-subtle)',
                color: modelType === m.id ? 'var(--on-primary)' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            background: '#10b981',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Download size={14} /> Ekspor Laporan Evaluasi (CSV)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Confusion Matrix Table */}
        <div style={{ background: '#020617', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.75rem' }}>
            Matriks Konfusi (Actual Row vs Predicted Column):
          </span>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.82rem', textAlign: 'center', borderCollapse: 'collapse', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8' }}>Aktual \ Pred</th>
                  {CLASSES.map((c) => (
                    <th key={c} style={{ padding: '0.5rem', color: '#38bdf8' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASSES.map((rowName, r) => (
                  <tr key={rowName} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#94a3b8' }}>{rowName}</td>
                    {cm[r].map((val, c) => (
                      <td
                        key={c}
                        style={{
                          padding: '0.5rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          background: r === c ? 'rgba(16, 185, 129, 0.2)' : val > 5 ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                          color: r === c ? '#34d399' : val > 5 ? '#f43f5e' : '#94a3b8'
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Akurasi Global (Accuracy)</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
              {(metrics.accuracy * 100).toFixed(1)}%
            </span>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Macro F1-Score</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
              {(metrics.f1Score * 100).toFixed(1)}%
            </span>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Macro Precision</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
              {(metrics.precision * 100).toFixed(1)}%
            </span>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Macro Recall (Sensitivitas)</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', fontFamily: 'monospace' }}>
              {(metrics.recall * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

