import React, { useState, useMemo } from 'react';
import {
  earlyFusionConcat,
  lateFusionWeighted,
  intermediateCrossModalAttention,
  l2Normalize,
  softmaxWithTemperature
} from '../../lib/multimodalProcessing';

export const MultimodalPipelineExplorer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'surveillance' | 'robotics' | 'sports'>('surveillance');
  const [fusionType, setFusionType] = useState<'early' | 'intermediate' | 'late'>('intermediate');
  const [visionWeight, setVisionWeight] = useState<number>(0.5);
  const [audioWeight, setAudioWeight] = useState<number>(0.3);
  const [temperature, setTemperature] = useState<number>(0.2);

  const PRESETS = {
    surveillance: {
      name: 'Pemantauan Keamanan (Surveillance Event)',
      vision: [0.82, 0.45, -0.15, 0.65], // High motion & intruder presence
      audio: [0.75, 0.62, 0.35, -0.22],  // Broken glass / alarm acoustic signature
      text: [0.85, 0.50, 0.10, 0.40],   // "unauthorized intrusion detected"
      classes: ['Intrusion Alarm', 'Normal Ambience', 'Equipment Failure']
    },
    robotics: {
      name: 'Navigasi Robotik Otonom (Autonomous Navigation)',
      vision: [0.25, 0.78, 0.65, -0.30], // Obstacle distance & roadway segmentation
      audio: [0.15, 0.20, -0.45, 0.85],  // Approaching horn / engine sound
      text: [0.30, 0.70, 0.55, -0.10],   // "emergency collision avoidance stop"
      classes: ['Proceed Safely', 'Hazard Slowdown', 'Emergency Brake']
    },
    sports: {
      name: 'Analisis Siaran Olahraga (Sports Highlight Tagging)',
      vision: [0.65, -0.20, 0.88, 0.35], // Fast ball trajectory & player goal celebration
      audio: [0.92, 0.70, 0.45, 0.15],  // Crowd cheering roar & referee whistle
      text: [0.75, 0.10, 0.80, 0.50],   // "goal scored in penalty box"
      classes: ['Goal Celebration', 'Foul / Yellow Card', 'Routine Play']
    }
  };

  const preset = PRESETS[selectedPreset];

  // Modality weights normalized
  const textWeight = Math.max(0, 1 - visionWeight - audioWeight);

  // Fusion Computations
  const fusionResults = useMemo(() => {
    const vNorm = l2Normalize(preset.vision);
    const aNorm = l2Normalize(preset.audio);
    const tNorm = l2Normalize(preset.text);

    if (fusionType === 'early') {
      // Concatenation of normalized features
      const fusedFeatures = earlyFusionConcat([vNorm, aNorm, tNorm]);
      // Linear projection simulation to 3 classes
      const rawScores = [
        fusedFeatures.slice(0, 4).reduce((acc, v) => acc + v, 0),
        fusedFeatures.slice(4, 8).reduce((acc, v) => acc + v, 0),
        fusedFeatures.slice(8, 12).reduce((acc, v) => acc + v, 0)
      ];
      const probs = softmaxWithTemperature(rawScores, temperature);
      return {
        fusedDimension: fusedFeatures.length,
        features: fusedFeatures,
        probabilities: probs,
        latencyMs: 1.2,
        throughputFps: 830
      };
    } else if (fusionType === 'intermediate') {
      // Cross-modal attention between vision (query) and audio+text (keys/values)
      const context = [aNorm, tNorm];
      const { fusedOutput } = intermediateCrossModalAttention(vNorm, context, context);
      const combined = earlyFusionConcat([vNorm, fusedOutput]);
      const rawScores = [
        combined[0] * 1.5 + combined[1] * 0.8,
        combined[2] * 0.9 + combined[3] * 0.4,
        combined[4] * 0.6 + combined[5] * 0.7
      ];
      const probs = softmaxWithTemperature(rawScores, temperature);
      return {
        fusedDimension: combined.length,
        features: combined,
        probabilities: probs,
        latencyMs: 4.8,
        throughputFps: 210
      };
    } else {
      // Late fusion: decision-level weighted probabilities
      const vProbs = softmaxWithTemperature([vNorm[0] + vNorm[1], vNorm[2], vNorm[3]], temperature);
      const aProbs = softmaxWithTemperature([aNorm[0] + aNorm[1], aNorm[2], aNorm[3]], temperature);
      const tProbs = softmaxWithTemperature([tNorm[0] + tNorm[1], tNorm[2], tNorm[3]], temperature);

      const fusedProbs = lateFusionWeighted(
        [vProbs, aProbs, tProbs],
        [visionWeight, audioWeight, textWeight]
      );

      return {
        fusedDimension: preset.classes.length,
        features: fusedProbs,
        probabilities: fusedProbs,
        latencyMs: 2.1,
        throughputFps: 475
      };
    }
  }, [selectedPreset, fusionType, visionWeight, audioWeight, textWeight, temperature]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: '#38bdf8', color: '#0f172a', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
            BAB 51
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Multimodal Pipeline &amp; Fusion Explorer
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Simulasi perbandingan komparatif tiga paradigma fusi multimodal (Early, Intermediate Cross-Attention, dan Late Fusion) pada pemrosesan multi-sensorik terintegrasi.
        </p>
      </div>

      {/* Preset and Paradigm Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Pilih Kasus Uji Multimodal:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedPreset(key)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  background: selectedPreset === key ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedPreset === key ? '#ffffff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontWeight: selectedPreset === key ? 600 : 400
                }}
              >
                {PRESETS[key].name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Paradigma Fusi (Fusion Paradigm):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { id: 'early', label: '1. Early Fusion (Feature Concatenation)', desc: 'Penggabungan vektor fitur awal sebelum klasifikasi' },
              { id: 'intermediate', label: '2. Intermediate (Cross-Modal Attention)', desc: 'Interaksi silang representasi atensi multi-modal' },
              { id: 'late', label: '3. Late Fusion (Decision Weighted Ensemble)', desc: 'Penggabungan probabilitas keputusan akhir model unimodal' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFusionType(p.id as any)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  background: fusionType === p.id ? 'var(--accent, #6366f1)' : 'var(--bg-card)',
                  color: fusionType === p.id ? '#ffffff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hyperparameters Controls */}
      <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Bobot Visual (W_vision):</span>
              <strong>{(visionWeight * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={visionWeight}
              onChange={(e) => setVisionWeight(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Bobot Audio (W_audio):</span>
              <strong>{(audioWeight * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={audioWeight}
              onChange={(e) => setAudioWeight(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span>Softmax Temperature (τ):</span>
              <strong>{temperature.toFixed(2)}</strong>
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

      {/* Live Visualizations & Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Modality Vector Status */}
        <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.75rem' }}>
            Representasi Vektor Sensorik Input (L2 Normalized):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            <div>
              <span style={{ color: '#93c5fd' }}>Visual (4D):</span>
              <div style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>
                [{l2Normalize(preset.vision).map((v) => v.toFixed(3)).join(', ')}]
              </div>
            </div>
            <div>
              <span style={{ color: '#a7f3d0' }}>Audio (4D):</span>
              <div style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>
                [{l2Normalize(preset.audio).map((v) => v.toFixed(3)).join(', ')}]
              </div>
            </div>
            <div>
              <span style={{ color: '#fde047' }}>Teks / Konteks (4D):</span>
              <div style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>
                [{l2Normalize(preset.text).map((v) => v.toFixed(3)).join(', ')}]
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Probabilities */}
        <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', display: 'block', marginBottom: '0.75rem' }}>
            Distribusi Probabilitas Keputusan Akhir:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {preset.classes.map((clsName, idx) => {
              const prob = fusionResults.probabilities[idx] || 0;
              const isTop = idx === 0;
              return (
                <div key={clsName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: isTop ? '#34d399' : '#cbd5e1', fontWeight: isTop ? 700 : 400 }}>
                      {clsName} {isTop && '★ (Prediksi Model)'}
                    </span>
                    <strong style={{ fontFamily: 'monospace', color: isTop ? '#34d399' : '#94a3b8' }}>
                      {(prob * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, prob * 100))}%`,
                        height: '100%',
                        background: isTop ? '#34d399' : '#64748b',
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

      {/* Computational Diagnostics Footnote */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.78rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Dimensi Representasi Fusi:</span>{' '}
          <strong style={{ color: 'var(--text)' }}>{fusionResults.fusedDimension} dimensi</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Estimasi Latensi Inferensi:</span>{' '}
          <strong style={{ color: '#38bdf8' }}>{fusionResults.latencyMs.toFixed(1)} ms</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Throughput Sistem:</span>{' '}
          <strong style={{ color: '#34d399' }}>{fusionResults.throughputFps} FPS</strong>
        </div>
      </div>
    </div>
  );
};

