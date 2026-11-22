import React, { useState, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { computeCOCOAveragePrecision, categorizeDetectionErrors } from '../../lib/researchMetrics';

interface BoundingBox {
  id: string;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  classId: number;
  className: string;
  area: number;
  scaleType: 'small' | 'medium' | 'large';
}

interface Prediction {
  id: string;
  bbox: [number, number, number, number];
  classId: number;
  className: string;
  score: number;
}

export const R01DetectionResearchLab: React.FC = () => {
  // Interactive control states
  const [confThreshold, setConfThreshold] = useState<number>(0.50);
  const [iouThreshold, setIouThreshold] = useState<number>(0.50);
  const [selectedScaleFilter, setSelectedScaleFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [scenario, setScenario] = useState<'uav' | 'highway' | 'crowd'>('uav');
  const [showUncertainty, setShowUncertainty] = useState<boolean>(true);

  // Scenarios with authentic labeled synthetic data
  const SCENARIOS: Record<string, { title: string; desc: string; gts: BoundingBox[]; preds: Prediction[] }> = {
    uav: {
      title: 'UAV Small Drone Aerial Surveillance (Objek Sangat Kecil)',
      desc: 'Citra sudut pandang udara drone di atas persimpangan Sumatera. Objek kendaraan dan pejalan kaki memiliki resolusi sangat kecil (< 32^2 px) dengan variasi kontras rendah.',
      gts: [
        { id: 'gt-1', bbox: [50, 45, 74, 69], classId: 0, className: 'car', area: 24 * 24, scaleType: 'small' },
        { id: 'gt-2', bbox: [120, 80, 142, 102], classId: 0, className: 'car', area: 22 * 22, scaleType: 'small' },
        { id: 'gt-3', bbox: [180, 50, 196, 74], classId: 1, className: 'pedestrian', area: 16 * 24, scaleType: 'small' },
        { id: 'gt-4', bbox: [210, 60, 224, 82], classId: 1, className: 'pedestrian', area: 14 * 22, scaleType: 'small' },
        { id: 'gt-5', bbox: [320, 140, 390, 210], classId: 2, className: 'truck', area: 70 * 70, scaleType: 'medium' },
        { id: 'gt-6', bbox: [460, 220, 580, 340], classId: 2, className: 'truck', area: 120 * 120, scaleType: 'large' },
        { id: 'gt-7', bbox: [260, 120, 280, 140], classId: 0, className: 'car', area: 20 * 20, scaleType: 'small' },
        { id: 'gt-8', bbox: [90, 190, 114, 214], classId: 0, className: 'car', area: 24 * 24, scaleType: 'small' },
      ],
      preds: [
        { id: 'pr-1', bbox: [52, 47, 76, 71], classId: 0, className: 'car', score: 0.92 }, // Good TP
        { id: 'pr-2', bbox: [118, 77, 145, 105], classId: 0, className: 'car', score: 0.84 }, // Good TP
        { id: 'pr-3', bbox: [181, 52, 197, 76], classId: 1, className: 'pedestrian', score: 0.74 }, // TP
        { id: 'pr-4', bbox: [205, 55, 230, 88], classId: 1, className: 'pedestrian', score: 0.42 }, // Borderline score
        { id: 'pr-5', bbox: [322, 142, 394, 212], classId: 2, className: 'truck', score: 0.95 }, // Large TP
        { id: 'pr-6', bbox: [458, 218, 582, 338], classId: 2, className: 'truck', score: 0.97 }, // Large TP
        { id: 'pr-7', bbox: [255, 115, 275, 135], classId: 1, className: 'pedestrian', score: 0.65 }, // Cls Error (was car)
        { id: 'pr-8', bbox: [380, 60, 420, 95], classId: 0, className: 'car', score: 0.48 }, // Background hallucination
        { id: 'pr-9', bbox: [85, 185, 125, 225], classId: 0, className: 'car', score: 0.78 }, // Loc error (loose box)
      ],
    },
    highway: {
      title: 'Highway Traffic Tollgate (Lalu Lintas Jalan Tol Sumatera)',
      desc: 'Pengawasan gerbang tol dengan dominasi kendaraan berukuran sedang dan besar dengan oklusi sebagian.',
      gts: [
        { id: 'gt-1', bbox: [80, 100, 200, 220], classId: 0, className: 'car', area: 120 * 120, scaleType: 'large' },
        { id: 'gt-2', bbox: [240, 110, 360, 230], classId: 0, className: 'car', area: 120 * 120, scaleType: 'large' },
        { id: 'gt-3', bbox: [400, 80, 560, 260], classId: 2, className: 'truck', area: 160 * 180, scaleType: 'large' },
        { id: 'gt-4', bbox: [150, 40, 200, 90], classId: 0, className: 'car', area: 50 * 50, scaleType: 'medium' },
        { id: 'gt-5', bbox: [280, 50, 320, 85], classId: 0, className: 'car', area: 40 * 35, scaleType: 'medium' },
      ],
      preds: [
        { id: 'pr-1', bbox: [82, 102, 198, 218], classId: 0, className: 'car', score: 0.96 },
        { id: 'pr-2', bbox: [238, 108, 362, 232], classId: 0, className: 'car', score: 0.91 },
        { id: 'pr-3', bbox: [398, 82, 558, 258], classId: 2, className: 'truck', score: 0.94 },
        { id: 'pr-4', bbox: [152, 42, 198, 88], classId: 0, className: 'car', score: 0.82 },
        { id: 'pr-5', bbox: [278, 48, 322, 87], classId: 0, className: 'car', score: 0.79 },
      ],
    },
    crowd: {
      title: 'Crowded Pedestrian Market (Pejalan Kaki Berdesakan)',
      desc: 'Kondisi kerumunan pasar tradisional dengan tumpang tindih tinggi (oklusi parah) yang menguji toleransi ambang IoU.',
      gts: [
        { id: 'gt-1', bbox: [100, 80, 150, 220], classId: 1, className: 'pedestrian', area: 50 * 140, scaleType: 'medium' },
        { id: 'gt-2', bbox: [130, 85, 175, 225], classId: 1, className: 'pedestrian', area: 45 * 140, scaleType: 'medium' },
        { id: 'gt-3', bbox: [160, 80, 210, 220], classId: 1, className: 'pedestrian', area: 50 * 140, scaleType: 'medium' },
        { id: 'gt-4', bbox: [280, 110, 320, 210], classId: 1, className: 'pedestrian', area: 40 * 100, scaleType: 'medium' },
        { id: 'gt-5', bbox: [310, 115, 345, 215], classId: 1, className: 'pedestrian', area: 35 * 100, scaleType: 'medium' },
      ],
      preds: [
        { id: 'pr-1', bbox: [98, 82, 148, 218], classId: 1, className: 'pedestrian', score: 0.88 },
        { id: 'pr-2', bbox: [125, 80, 178, 222], classId: 1, className: 'pedestrian', score: 0.81 },
        { id: 'pr-3', bbox: [162, 82, 208, 218], classId: 1, className: 'pedestrian', score: 0.72 },
        { id: 'pr-4', bbox: [275, 108, 340, 212], classId: 1, className: 'pedestrian', score: 0.61 }, // Merged double detection
      ],
    },
  };

  const currentScenario = SCENARIOS[scenario];

  // Filter ground truths based on scale filter
  const filteredGTs = useMemo(() => {
    return currentScenario.gts.filter((g) => {
      if (selectedScaleFilter === 'all') return true;
      return g.scaleType === selectedScaleFilter;
    });
  }, [currentScenario, selectedScaleFilter]);

  // Filter predictions by confidence threshold
  const activePreds = useMemo(() => {
    return currentScenario.preds.filter((p) => p.score >= confThreshold);
  }, [currentScenario, confThreshold]);

  // Compute matching and evaluation
  const evalResults = useMemo(() => {
    const rawGTs = filteredGTs.map((g) => ({ bbox: g.bbox, classId: g.classId }));
    const rawPreds = activePreds.map((p) => ({ bbox: p.bbox, classId: p.classId, score: p.score }));

    const tide = categorizeDetectionErrors(rawGTs, rawPreds, iouThreshold);

    // Compute PR curve and AP
    const sorted = [...activePreds].sort((a, b) => b.score - a.score);
    let matchedGT = new Set<number>();
    let tpCount = 0;
    let precisions: number[] = [];
    let recalls: number[] = [];

    sorted.forEach((p, idx) => {
      // Find matching GT
      let bestIoU = 0;
      let bestGTIdx = -1;
      filteredGTs.forEach((g, gIdx) => {
        // Compute IoU
        const xA = Math.max(p.bbox[0], g.bbox[0]);
        const yA = Math.max(p.bbox[1], g.bbox[1]);
        const xB = Math.min(p.bbox[2], g.bbox[2]);
        const yB = Math.min(p.bbox[3], g.bbox[3]);
        const inter = Math.max(0, xB - xA) * Math.max(0, yB - yA);
        const areaP = (p.bbox[2] - p.bbox[0]) * (p.bbox[3] - p.bbox[1]);
        const areaG = (g.bbox[2] - g.bbox[0]) * (g.bbox[3] - g.bbox[1]);
        const union = areaP + areaG - inter;
        const iou = union > 0 ? inter / union : 0;
        if (iou > bestIoU) {
          bestIoU = iou;
          bestGTIdx = gIdx;
        }
      });

      if (bestGTIdx >= 0 && bestIoU >= iouThreshold && filteredGTs[bestGTIdx].classId === p.classId && !matchedGT.has(bestGTIdx)) {
        matchedGT.add(bestGTIdx);
        tpCount++;
      }

      const prec = tpCount / (idx + 1);
      const rec = filteredGTs.length > 0 ? tpCount / filteredGTs.length : 0;
      precisions.push(prec);
      recalls.push(rec);
    });

    const ap = computeCOCOAveragePrecision(precisions, recalls);
    const precision = activePreds.length > 0 ? tpCount / activePreds.length : 0;
    const recall = filteredGTs.length > 0 ? tpCount / filteredGTs.length : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      tide,
      tpCount,
      fpCount: activePreds.length - tpCount,
      missCount: filteredGTs.length - tpCount,
      precision,
      recall,
      f1,
      ap,
      matchedGTIndices: Array.from(matchedGT),
    };
  }, [filteredGTs, activePreds, iouThreshold]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.75rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              TIER-A RESEARCH LAB · R01
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deteksi &amp; Pengenalan Visual Cerdas
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Eksplorasi Evaluasi Detektor: IoU Matching, Presisi-Recall &amp; Taksonomi Galat TIDE
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            {currentScenario.desc}
          </p>
        </div>

        {/* Scenario Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'uav', label: 'UAV Small Object' },
            { id: 'highway', label: 'Highway Traffic' },
            { id: 'crowd', label: 'Dense Crowd' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: scenario === sc.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: scenario === sc.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                color: scenario === sc.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Ambang Keyakinan (Score &ge; &tau;):</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{confThreshold.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={confThreshold}
            onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Menaikkan nilai memangkas FP tapi menaikkan Miss (False Negatives).
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Ambang Kecocokan IoU (&tau;<sub>IoU</sub>):</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{iouThreshold.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.90"
            step="0.05"
            value={iouThreshold}
            onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Standar COCO AP50 (&tau;=0.50) vs AP75 (&tau;=0.75 ketat).
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
            Filter Skala Objek (COCO Scale Stratification):
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'small', label: 'Small (<32²)' },
              { id: 'medium', label: 'Medium' },
              { id: 'large', label: 'Large' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedScaleFilter(st.id as any)}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  border: selectedScaleFilter === st.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedScaleFilter === st.id ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedScaleFilter === st.id ? 'var(--on-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showUncertainty}
              onChange={(e) => setShowUncertainty(e.target.checked)}
            />
            Tampilkan Garis Ketidakpastian Spasial (Uncertainty Halo)
          </label>
        </div>
      </div>

      {/* Main Canvas & Diagnostic Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Interactive SVG Canvas */}
        <div
          style={{
            background: '#090d16',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            padding: '0.75rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Visual Canvas: 640 &times; 400 px</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: '#38bdf8' }}>&mdash; Ground Truth</span>
              <span style={{ color: '#34d399' }}>&mdash; TP Pred</span>
              <span style={{ color: '#f87171' }}>&mdash; FP Pred</span>
              <span style={{ color: '#fbbf24' }}>-- Missed GT</span>
            </div>
          </div>

          <svg
            viewBox="0 0 640 400"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '6px',
              background: 'radial-gradient(ellipse at center, #111827 0%, #030712 100%)',
            }}
          >
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Render Ground Truths */}
            {filteredGTs.map((gt, idx) => {
              const isMatched = evalResults.matchedGTIndices.includes(idx);
              const [x1, y1, x2, y2] = gt.bbox;
              const w = x2 - x1;
              const h = y2 - y1;

              return (
                <g key={gt.id}>
                  <rect
                    x={x1}
                    y={y1}
                    width={w}
                    height={h}
                    fill={isMatched ? 'rgba(56, 189, 248, 0.08)' : 'rgba(251, 191, 36, 0.08)'}
                    stroke={isMatched ? '#38bdf8' : '#fbbf24'}
                    strokeWidth={isMatched ? '1.5' : '2'}
                    strokeDasharray={isMatched ? 'none' : '4 3'}
                  />
                  <text
                    x={x1 + 3}
                    y={y1 - 4}
                    fill={isMatched ? '#38bdf8' : '#fbbf24'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    GT:{gt.className} ({gt.scaleType})
                  </text>
                </g>
              );
            })}

            {/* Render Predictions */}
            {activePreds.map((pr) => {
              const [x1, y1, x2, y2] = pr.bbox;
              const w = x2 - x1;
              const h = y2 - y1;

              // Check if TP
              let isTP = false;
              filteredGTs.forEach((g) => {
                const xA = Math.max(x1, g.bbox[0]);
                const yA = Math.max(y1, g.bbox[1]);
                const xB = Math.min(x2, g.bbox[2]);
                const yB = Math.min(y2, g.bbox[3]);
                const inter = Math.max(0, xB - xA) * Math.max(0, yB - yA);
                const areaP = w * h;
                const areaG = (g.bbox[2] - g.bbox[0]) * (g.bbox[3] - g.bbox[1]);
                const union = areaP + areaG - inter;
                const iou = union > 0 ? inter / union : 0;
                if (iou >= iouThreshold && g.classId === pr.classId) {
                  isTP = true;
                }
              });

              const color = isTP ? '#34d399' : '#f87171';

              return (
                <g key={pr.id}>
                  {showUncertainty && (
                    <rect
                      x={x1 - 4}
                      y={y1 - 4}
                      width={w + 8}
                      height={h + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.4"
                    />
                  )}
                  <rect
                    x={x1}
                    y={y1}
                    width={w}
                    height={h}
                    fill={isTP ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)'}
                    stroke={color}
                    strokeWidth="2"
                  />
                  <rect
                    x={x1}
                    y={y2}
                    width={w}
                    height="14"
                    fill={color}
                    opacity="0.85"
                  />
                  <text
                    x={x1 + 3}
                    y={y2 + 11}
                    fill="#0f172a"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pr.className} {pr.score.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Diagnostic Metrics & TIDE Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Key Metric Scorecards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COCO AP@&tau;</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {(evalResults.ap * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precision</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {(evalResults.precision * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recall</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {(evalResults.recall * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Counts Overview */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span>Target GT: <strong>{filteredGTs.length}</strong></span>
            <span>Prediksi Aktif: <strong>{activePreds.length}</strong></span>
            <span style={{ color: '#34d399' }}>TP: <strong>{evalResults.tpCount}</strong></span>
            <span style={{ color: '#f87171' }}>FP: <strong>{evalResults.fpCount}</strong></span>
            <span style={{ color: '#fbbf24' }}>Miss: <strong>{evalResults.missCount}</strong></span>
          </div>

          {/* TIDE Error Taxonomy Analysis */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart2 size={15} color="var(--primary)" />
              Dekomposisi Galat TIDE (Bolya et al., ECCV 2020):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Galat Lokalisasi (0.1 &le; IoU &lt; &tau;):</span>
                  <strong>{evalResults.tide.localizationErrors} kasus</strong>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(evalResults.tide.localizationErrors / (activePreds.length || 1)) * 100}%`, height: '100%', background: '#38bdf8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Galat Klasifikasi (IoU &ge; &tau;, Label Salah):</span>
                  <strong>{evalResults.tide.classificationErrors} kasus</strong>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(evalResults.tide.classificationErrors / (activePreds.length || 1)) * 100}%`, height: '100%', background: '#a855f7' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Halusinasi Background (IoU &lt; 0.1):</span>
                  <strong>{evalResults.tide.backgroundHallucinations} kasus</strong>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(evalResults.tide.backgroundHallucinations / (activePreds.length || 1)) * 100}%`, height: '100%', background: '#f87171' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Research Insight Card */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
            }}
          >
            <strong style={{ color: 'var(--primary)' }}>Wawasan Riset L4:</strong> Pada skenario UAV, pergeseran bounding box sekecil 4 piksel dapat memangkas IoU dari 0.70 menjadi 0.25 pada objek berukuran $16 \times 16$ px. Inilah sebabnya deteksi objek kecil didominasi oleh <em>Localization Error</em> daripada galat semantik klasifikasi.
          </div>
        </div>
      </div>
    </div>
  );
};
