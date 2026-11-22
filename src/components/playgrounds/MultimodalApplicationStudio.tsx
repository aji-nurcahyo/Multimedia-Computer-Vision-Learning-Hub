import React, { useState, useMemo } from 'react';
import { runMultimodalPipeline, MultimodalSystemSample } from '../../lib/multimodalProcessing';

interface AppScenario {
  id: string;
  name: string;
  domain: string;
  visionModality: { name: string; vector: number[] };
  audioModality: { name: string; vector: number[] };
  contextModality: { name: string; vector: number[] };
  classes: string[];
  classEmbeddings: Record<string, number[]>;
}

export const MultimodalApplicationStudio: React.FC = () => {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('hospital');
  const [visionEnabled, setVisionEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [contextEnabled, setContextEnabled] = useState<boolean>(true);
  const [quantization, setQuantization] = useState<'fp32' | 'fp16' | 'int8'>('fp16');

  const SCENARIOS: Record<string, AppScenario> = {
    hospital: {
      id: 'hospital',
      name: 'Pemantauan Pasien Kritis ICU (Smart Hospital Telemedicine)',
      domain: 'Healthcare & Clinical Diagnostics',
      visionModality: {
        name: 'Kamera Optik Postur Tubuh Pasien',
        vector: [0.85, 0.40, -0.30, 0.60] // Fall detection motion pattern
      },
      audioModality: {
        name: 'Mikrofon Akustik Rintihan / Batuk Pasien',
        vector: [0.78, 0.65, 0.20, -0.15] // Distress acoustic energy
      },
      contextModality: {
        name: 'Telemetri Sensor Vital (SpO2 & EKG)',
        vector: [0.80, 0.50, 0.10, 0.35] // Critical vital drop
      },
      classes: ['Tindakan Darurat Medis Segera', 'Kondisi Waspada Observasi', 'Kondisi Stabil Normal'],
      classEmbeddings: {
        'Tindakan Darurat Medis Segera': [0.82, 0.52, -0.05, 0.35],
        'Kondisi Waspada Observasi': [0.35, 0.25, 0.65, -0.20],
        'Kondisi Stabil Normal': [-0.60, -0.45, -0.30, 0.55]
      }
    },
    drone: {
      id: 'drone',
      name: 'Pencarian & Penyelamatan Otonom (Autonomous Drone SAR)',
      domain: 'Disaster Relief & Search and Rescue',
      visionModality: {
        name: 'Sensor Citra Thermal Inframerah',
        vector: [0.72, 0.68, -0.10, 0.25] // Heat signature detected
      },
      audioModality: {
        name: 'Array Mikrofon Akustik Suara Teriakan',
        vector: [0.65, 0.55, 0.35, -0.20] // Human vocal frequencies
      },
      contextModality: {
        name: 'Telemetri GPS & Ketinggian Topografi',
        vector: [0.70, 0.60, 0.15, 0.10] // Disaster perimeter coordinates
      },
      classes: ['Korban Teridentifikasi Positif', 'Anomali Panas Non-Manusia', 'Area Kosong Terverifikasi'],
      classEmbeddings: {
        'Korban Teridentifikasi Positif': [0.70, 0.62, 0.18, 0.12],
        'Anomali Panas Non-Manusia': [0.45, -0.30, 0.55, 0.40],
        'Area Kosong Terverifikasi': [-0.55, -0.50, -0.25, -0.30]
      }
    },
    traffic: {
      id: 'traffic',
      name: 'Insiden Lalu Lintas & Panggilan Darurat (Traffic Incident Management)',
      domain: 'Intelligent Transportation Systems',
      visionModality: {
        name: 'CCTV Deteksi Tabrakan & Asap Kendaraan',
        vector: [0.88, 0.35, -0.25, 0.55] // High impact deformation
      },
      audioModality: {
        name: 'Sensor Akustik Suara Decitan Rem & Benturan',
        vector: [0.90, 0.75, 0.15, -0.10] // Impact acoustic blast
      },
      contextModality: {
        name: 'Laporan V2X Telematika Kecepatan Jalur',
        vector: [0.82, 0.45, 0.10, 0.40] // Sudden velocity drop
      },
      classes: ['Tabrakan Fatal / Kebakaran', 'Kemacetan Lalu Lintas Biasa', 'Lalu Lintas Lancar'],
      classEmbeddings: {
        'Tabrakan Fatal / Kebakaran': [0.87, 0.55, -0.05, 0.35],
        'Kemacetan Lalu Lintas Biasa': [0.25, 0.10, 0.75, -0.25],
        'Lalu Lintas Lancar': [-0.70, -0.40, -0.20, 0.45]
      }
    }
  };

  const scenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.hospital;

  // Compute live pipeline execution
  const pipelineResult = useMemo(() => {
    // Build active inputs
    const vFeat = visionEnabled ? scenario.visionModality.vector : [0.01, 0.01, 0.01, 0.01];
    const aFeat = audioEnabled ? scenario.audioModality.vector : [0.01, 0.01, 0.01, 0.01];

    const sample: MultimodalSystemSample = {
      id: scenario.id,
      title: scenario.name,
      visualFeatures: vFeat,
      audioFeatures: aFeat,
      textDescription: scenario.domain,
      groundTruthCategory: scenario.classes[0]
    };

    const weights = {
      visual: visionEnabled ? 0.5 : 0.05,
      audio: audioEnabled ? 0.35 : 0.05,
      text: contextEnabled ? 0.2 : 0.05
    };

    const result = runMultimodalPipeline(sample, scenario.classEmbeddings, weights);

    // Quantization hardware effect simulation
    const activeCount = (visionEnabled ? 1 : 0) + (audioEnabled ? 1 : 0) + (contextEnabled ? 1 : 0);
    const quantMultiplier = quantization === 'int8' ? 0.35 : quantization === 'fp16' ? 0.6 : 1.0;
    const baseLatency = 14.5 * (Math.max(1, activeCount) / 3);
    const latency = baseLatency * quantMultiplier;
    const fps = Math.round(1000 / Math.max(1, latency));

    return {
      ...result,
      latencyMs: latency,
      fps: fps,
      activeSensorCount: activeCount
    };
  }, [scenario, visionEnabled, audioEnabled, contextEnabled, quantization]);

  const handleExportCsv = () => {
    const rows = [
      ['Timestamp', new Date().toISOString()],
      ['Scenario', scenario.name],
      ['Domain', scenario.domain],
      ['Quantization', quantization.toUpperCase()],
      ['Vision Sensor', visionEnabled ? 'ACTIVE' : 'OFFLINE'],
      ['Audio Sensor', audioEnabled ? 'ACTIVE' : 'OFFLINE'],
      ['Context Telemetry', contextEnabled ? 'ACTIVE' : 'OFFLINE'],
      ['Latency (ms)', pipelineResult.latencyMs.toFixed(2)],
      ['Throughput (FPS)', pipelineResult.fps.toString()],
      ['Predicted Class', pipelineResult.predictedCategory],
      ['Confidence Score', (pipelineResult.confidence * 100).toFixed(2) + '%'],
      ['Class Probabilities', JSON.stringify(pipelineResult.lateFusionProbs)]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(val => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `multimodal_system_report_${scenario.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: '#f59e0b', color: '#000000', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
            BAB 55
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Multimodal Application Studio &amp; Production Deployment
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Studio arsitektur sistem multimodal produksi: simulasi integrasi multi-sensor, ketahanan terhadap kegagalan modalitas (sensor dropouts), kuantisasi inferensi (INT8/FP16), dan ekspor laporan telemetri.
        </p>
      </div>

      {/* Scenario Selection */}
      <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Pilih Domain Aplikasi Sistem Produksi:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
          {Object.values(SCENARIOS).map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioKey(sc.id)}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textAlign: 'left',
                background: selectedScenarioKey === sc.id ? '#f59e0b' : 'var(--bg-card)',
                color: selectedScenarioKey === sc.id ? '#000000' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: selectedScenarioKey === sc.id ? 700 : 400
              }}
            >
              <div style={{ fontWeight: 600 }}>{sc.name}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{sc.domain}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modality Health & Hardware Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Modality Health Simulator */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>
            Simulator Kesehatan Sensor &amp; Dropout Modalitas:
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Uji ketahanan sistem terhadap kehilangan sinyal sensor visual atau akustik secara real-time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={visionEnabled}
                onChange={(e) => setVisionEnabled(e.target.checked)}
              />
              <span style={{ color: visionEnabled ? '#34d399' : '#ef4444', fontWeight: 600 }}>
                {scenario.visionModality.name} ({visionEnabled ? 'TERHUBUNG' : 'TERPUTUS/GELAP'})
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
              />
              <span style={{ color: audioEnabled ? '#34d399' : '#ef4444', fontWeight: 600 }}>
                {scenario.audioModality.name} ({audioEnabled ? 'TERHUBUNG' : 'TERPUTUS/RUSAK'})
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={contextEnabled}
                onChange={(e) => setContextEnabled(e.target.checked)}
              />
              <span style={{ color: contextEnabled ? '#34d399' : '#ef4444', fontWeight: 600 }}>
                {scenario.contextModality.name} ({contextEnabled ? 'TERHUBUNG' : 'OFFLINE'})
              </span>
            </label>
          </div>
        </div>

        {/* Quantization & Hardware Optimization */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>
            Optimasi Model &amp; Presisi Inferensi:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { id: 'fp32', label: 'FP32 (Standar Full Precision)', desc: 'Akurasi maksimal, latensi tinggi' },
              { id: 'fp16', label: 'FP16 (Half Precision Tensor Cores)', desc: 'Kecepatan 2x, efisiensi memori' },
              { id: 'int8', label: 'INT8 (Integer Quantization Edge)', desc: 'Throughput tertinggi pada edge NPU' }
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setQuantization(q.id as any)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  background: quantization === q.id ? '#f59e0b' : 'var(--bg-card)',
                  color: quantization === q.id ? '#000000' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600 }}>{q.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{q.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>📥 Ekspor Laporan Telemetri Sistem (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Dashboard & Probabilities */}
      <div style={{ background: '#090d16', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Keputusan Sistem:</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
              {pipelineResult.predictedCategory}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Keyakinan Model (Confidence):</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
              {(pipelineResult.confidence * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Latensi Inferensi:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
              {pipelineResult.latencyMs.toFixed(1)} ms
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Throughput Edge:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace' }}>
              {pipelineResult.fps} FPS
            </div>
          </div>
        </div>

        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
          Distribusi Probabilitas Kelas Keputusan:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {Object.entries(pipelineResult.lateFusionProbs).map(([clsName, probVal]) => {
            const prob = probVal as number;
            const isWinner = clsName === pipelineResult.predictedCategory;
            return (
              <div key={clsName}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: isWinner ? '#34d399' : '#94a3b8', fontWeight: isWinner ? 700 : 400 }}>
                    {clsName} {isWinner && '★'}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: isWinner ? '#34d399' : '#64748b' }}>
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, prob * 100))}%`,
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

