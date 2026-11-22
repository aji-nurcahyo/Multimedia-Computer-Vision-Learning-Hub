import React, { useState, useMemo } from 'react';
import { computeAudioVisualCorrelation } from '../../lib/multimodalProcessing';

export const AudioVisualFusionLab: React.FC = () => {
  const [temporalLag, setTemporalLag] = useState<number>(0); // in frames (-10 to +10)
  const [noiseSnr, setNoiseSnr] = useState<number>(20); // SNR in dB (0 to 30)
  const [videoQuality, setVideoQuality] = useState<number>(90); // 20% to 100%
  const [selectedTask, setSelectedTask] = useState<'speech' | 'action' | 'music'>('speech');

  const TASKS = {
    speech: {
      title: 'Pengenalan Wicara Bimodal (Audio-Visual Lip Reading)',
      desc: 'Korelasi gerak bibir (artikulator optik) dengan formant gelombang suara vokal.',
      baseSyncCorr: 0.88
    },
    action: {
      title: 'Deteksi Kejadian Olahraga (Sports Impact Event)',
      desc: 'Benturan pukulan raket tenis/raket bulutangkis dengan gelombang impuls suara benturan.',
      baseSyncCorr: 0.94
    },
    music: {
      title: 'Pelokalisasian Sumber Suara Instrumen Musik (Violin/Piano)',
      desc: 'Gerak gesekan busur senar biola dengan getaran harmonik frekuensi audio akustik.',
      baseSyncCorr: 0.82
    }
  };

  // Generate synthetic signal envelopes (30 time steps)
  const { videoSignal, audioSignal, correlationMetric } = useMemo(() => {
    const N = 32;
    const vSig: number[] = [];
    const aSig: number[] = [];

    // Underlying rhythmic envelope
    for (let t = 0; t < N; t++) {
      const baseEnvelope = Math.sin((t / N) * Math.PI * 4) * 0.5 + 0.5;
      // Optical motion envelope (influenced by video quality)
      const vVal = baseEnvelope * (videoQuality / 100) + (Math.random() - 0.5) * 0.05;
      vSig.push(Math.max(0, vVal));

      // Audio envelope shifted by temporalLag and contaminated by SNR noise
      const shiftedIdx = t - temporalLag;
      const audioBase = shiftedIdx >= 0 && shiftedIdx < N
        ? Math.sin((shiftedIdx / N) * Math.PI * 4) * 0.5 + 0.5
        : 0.1;

      const noiseAmplitude = Math.pow(10, -noiseSnr / 20) * 0.8;
      const aVal = audioBase + (Math.random() - 0.5) * noiseAmplitude;
      aSig.push(Math.max(0, aVal));
    }

    const corr = computeAudioVisualCorrelation(aSig, vSig);
    return { videoSignal: vSig, audioSignal: aSig, correlationMetric: corr };
  }, [temporalLag, noiseSnr, videoQuality]);

  // Theoretical bimodal vs unimodal accuracy estimation
  const accuracyMetrics = useMemo(() => {
    // Unimodal Audio drops sharply under low SNR
    const audioAcc = Math.min(96, Math.max(25, 25 + (noiseSnr / 30) * 70));
    // Unimodal Vision drops under low video quality
    const videoAcc = Math.min(92, Math.max(30, 30 + (videoQuality / 100) * 60));
    // Bimodal Fused benefits from complementary information, degraded if lag is large
    const lagPenalty = Math.abs(temporalLag) * 2.2;
    const fusedAcc = Math.min(
      99,
      Math.max(45, Math.max(audioAcc, videoAcc) + 12 - lagPenalty)
    );

    return {
      audioOnly: audioAcc,
      videoOnly: videoAcc,
      bimodalFused: fusedAcc
    };
  }, [noiseSnr, videoQuality, temporalLag]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: '#ec4899', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
            BAB 53
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Audio-Visual Learning &amp; Temporal Synchronization Lab
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Eksplorasi sinkronisasi temporal bimodal (Lip-Sync &amp; Sound Event Localization) serta keunggulan ketahanan akurasi fusi audio-visual terhadap degradasi derau akustik dan oklusi visual.
        </p>
      </div>

      {/* Task Selector */}
      <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Skenario Pemrosesan Audio-Visual:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {(Object.keys(TASKS) as Array<keyof typeof TASKS>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTask(key)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textAlign: 'left',
                background: selectedTask === key ? '#ec4899' : 'var(--bg-card)',
                color: selectedTask === key ? '#ffffff' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 600 }}>{TASKS[key].title}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{TASKS[key].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Signal Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span>Pergeseran Temporal Lag (Δt):</span>
            <strong style={{ fontFamily: 'monospace', color: temporalLag === 0 ? '#34d399' : '#f59e0b' }}>
              {temporalLag > 0 ? `+${temporalLag * 33}` : `${temporalLag * 33}`} ms ({temporalLag} frames)
            </strong>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="1"
            value={temporalLag}
            onChange={(e) => setTemporalLag(parseInt(e.target.value, 10))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span>Kualitas SNR Audio Akustik:</span>
            <strong style={{ fontFamily: 'monospace', color: noiseSnr > 15 ? '#34d399' : '#ef4444' }}>
              {noiseSnr} dB ({noiseSnr >= 20 ? 'Jernih' : noiseSnr >= 10 ? 'Moderat' : 'Derau Tinggi'})
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={noiseSnr}
            onChange={(e) => setNoiseSnr(parseInt(e.target.value, 10))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span>Kualitas / Visibilitas Video:</span>
            <strong style={{ fontFamily: 'monospace', color: videoQuality > 60 ? '#34d399' : '#f59e0b' }}>
              {videoQuality}% ({videoQuality > 75 ? 'Pencahayaan Baik' : 'Oklusi/Buram'})
            </strong>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={videoQuality}
            onChange={(e) => setVideoQuality(parseInt(e.target.value, 10))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Waveform Visualization */}
      <div style={{ background: '#090d16', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
            Visualisasi Envelope Sinyal Multimodal Temporal:
          </span>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#38bdf8' }}>■ Envelope Gerak Optik (Video)</span>
            <span style={{ color: '#ec4899' }}>■ Envelope Energi Akustik (Audio)</span>
          </div>
        </div>

        {/* Mini SVG Waveform */}
        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 320 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="50" x2="320" y2="50" stroke="#1e293b" strokeDasharray="3,3" />

            {/* Video Signal Path */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              points={videoSignal.map((v, i) => `${(i / (videoSignal.length - 1)) * 320},${90 - v * 75}`).join(' ')}
            />

            {/* Audio Signal Path */}
            <polyline
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeDasharray="4,2"
              points={audioSignal.map((v, i) => `${(i / (audioSignal.length - 1)) * 320},${90 - v * 75}`).join(' ')}
            />
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>Korelasi Pearson Sinkronisasi r(Δt=0): <strong style={{ color: '#38bdf8' }}>{correlationMetric.correlation.toFixed(3)}</strong></span>
          <span>Lag Terestimasi: <strong style={{ color: Math.abs(correlationMetric.lagOffsetMs) < 35 ? '#34d399' : '#f59e0b' }}>{correlationMetric.lagOffsetMs.toFixed(0)} ms</strong></span>
          <span>Status: <strong style={{ color: correlationMetric.isSynchronized ? '#34d399' : '#ef4444' }}>{correlationMetric.isSynchronized ? 'Sinkron (In-Sync)' : 'Asinkron (Out-of-Sync)'}</strong></span>
        </div>
      </div>

      {/* Accuracy Comparison Matrix */}
      <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.75rem' }}>
          Perbandingan Ketahanan Akurasi Klasifikasi Bimodal vs Unimodal:
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span>1. Audio-Visual Bimodal Fused Model:</span>
              <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{accuracyMetrics.bimodalFused.toFixed(1)}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${accuracyMetrics.bimodalFused}%`, height: '100%', background: '#34d399' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span>2. Vision-Only Unimodal (Gerak Optik Bibir):</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{accuracyMetrics.videoOnly.toFixed(1)}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${accuracyMetrics.videoOnly}%`, height: '100%', background: '#38bdf8' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span>3. Audio-Only Unimodal (Spektrogram Akustik):</span>
              <strong style={{ color: '#ec4899', fontFamily: 'monospace' }}>{accuracyMetrics.audioOnly.toFixed(1)}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${accuracyMetrics.audioOnly}%`, height: '100%', background: '#ec4899' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

