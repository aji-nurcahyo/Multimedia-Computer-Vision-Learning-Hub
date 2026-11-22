import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  deformableAttention2D,
  boxIoU,
  boxGIoU,
  focalLoss,
  computeDetrMatchingCost,
  hungarianMatchingDetr
} from '../../lib/advancedCvProcessing';
import { Eye, Crosshair, Layers, Sliders, Activity, RefreshCw } from 'lucide-react';

interface SimulatedQuery {
  id: number;
  name: string;
  refPoint: [number, number]; // [x, y] in grid coords 0..15
  predBox: [number, number, number, number]; // [cx, cy, w, h] normalized
  classProb: number;
  classId: number;
}

export const DeformableAttentionExplorerLab: React.FC = () => {
  // Grid size for the synthetic feature map
  const GRID_SIZE = 16;

  // Selected Query preset
  const [selectedQueryId, setSelectedQueryId] = useState<number>(1);
  const [numSamplePoints, setNumSamplePoints] = useState<number>(4);
  const [dilationRadius, setDilationRadius] = useState<number>(2.5);
  const [focalGamma, setFocalGamma] = useState<number>(2.0);
  const focalAlpha = 0.25;
  const costClassWeight = 1.0;
  const costL1Weight = 5.0;
  const costGIoUWeight = 2.0;

  // Dragging state for reference point
  const [customRefPoint, setCustomRefPoint] = useState<[number, number]>([8.0, 8.0]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synthetic Ground Truth Object Targets
  const targetBoxes: Array<[number, number, number, number]> = useMemo(
    () => [
      [0.35, 0.40, 0.22, 0.25], // Target 0: Small Vehicle
      [0.70, 0.65, 0.30, 0.35]  // Target 1: Pedestrian Crowd
    ],
    []
  );
  const targetClasses = [0, 1];

  // Presets of Object Queries
  const queries: SimulatedQuery[] = useMemo(
    () => [
      {
        id: 1,
        name: 'Query 0: Small High-Contrast Target',
        refPoint: [5.5, 6.2],
        predBox: [0.36, 0.41, 0.20, 0.24],
        classProb: 0.92,
        classId: 0
      },
      {
        id: 2,
        name: 'Query 1: Dense Scene / Occluded Target',
        refPoint: [11.0, 10.5],
        predBox: [0.68, 0.63, 0.28, 0.32],
        classProb: 0.78,
        classId: 1
      },
      {
        id: 3,
        name: 'Query 2: Background Clutter (Non-Object)',
        refPoint: [2.5, 13.0],
        predBox: [0.15, 0.80, 0.15, 0.18],
        classProb: 0.12,
        classId: 0
      }
    ],
    []
  );

  const activeQuery = queries.find((q) => q.id === selectedQueryId) || queries[0];
  const refPoint = selectedQueryId === 0 ? customRefPoint : activeQuery.refPoint;

  // Generate synthetic multi-scale 2D feature activation map
  const featureMap: number[][] = useMemo(() => {
    const map: number[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: number[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        // Multi-frequency synthetic Gaussian peaks representing feature saliency
        const peak1 = Math.exp(-((x - 5.5) ** 2 + (y - 6.2) ** 2) / 4.5) * 80;
        const peak2 = Math.exp(-((x - 11.0) ** 2 + (y - 10.5) ** 2) / 6.0) * 95;
        const texture = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 15;
        row.push(Math.max(5, Math.min(100, Math.round(peak1 + peak2 + texture + 15))));
      }
      map.push(row);
    }
    return map;
  }, []);

  // Compute learned 2D sampling offsets and attention weights for deformable attention
  const { offsets, weights } = useMemo(() => {
    const offs: Array<[number, number]> = [];
    const wts: number[] = [];

    for (let k = 0; k < numSamplePoints; k++) {
      const angle = (k * 2 * Math.PI) / numSamplePoints + 0.35;
      const r = dilationRadius * (0.8 + 0.4 * Math.sin(k * 1.5));
      offs.push([Math.cos(angle) * r, Math.sin(angle) * r]);
      wts.push(Math.exp(-0.2 * k) + 0.3);
    }

    const sumW = wts.reduce((a, b) => a + b, 0);
    return { offsets: offs, weights: wts.map((w) => w / sumW) };
  }, [numSamplePoints, dilationRadius]);

  // Run Deformable Attention computation
  const deformableResult = useMemo(() => {
    return deformableAttention2D(featureMap, refPoint, offsets, weights);
  }, [featureMap, refPoint, offsets, weights]);

  // Compute Bipartite DETR matching cost and metrics
  const detrMatch = useMemo(() => {
    const matchCosts = targetBoxes.map((tgt, i) =>
      computeDetrMatchingCost(
        activeQuery.predBox,
        activeQuery.classProb,
        tgt,
        targetClasses[i],
        activeQuery.classId,
        costClassWeight,
        costL1Weight,
        costGIoUWeight
      )
    );

    const hungarian = hungarianMatchingDetr(
      queries.map((q) => q.predBox),
      queries.map((q) => (q.classId === 0 ? [q.classProb, 1 - q.classProb] : [1 - q.classProb, q.classProb])),
      targetBoxes,
      targetClasses,
      costClassWeight,
      costL1Weight,
      costGIoUWeight
    );

    const iou0 = boxIoU(activeQuery.predBox, targetBoxes[0]);
    const giou0 = boxGIoU(activeQuery.predBox, targetBoxes[0]);
    const fl = focalLoss(activeQuery.classProb, activeQuery.classProb > 0.5 ? 1 : 0, focalAlpha, focalGamma);

    return { matchCosts, hungarian, iou0, giou0, focalLoss: fl };
  }, [
    activeQuery,
    targetBoxes,
    targetClasses,
    queries,
    costClassWeight,
    costL1Weight,
    costGIoUWeight,
    focalAlpha,
    focalGamma
  ]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_SIZE;
    const cellH = height / GRID_SIZE;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw feature map activation heatmap
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const val = featureMap[y][x];
        const normVal = Math.min(1, Math.max(0, val / 100));
        // Deep blue to bright cyan heatmap
        const r = Math.round(15 + 40 * normVal);
        const g = Math.round(23 + 180 * normVal);
        const b = Math.round(42 + 213 * normVal);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
      }
    }

    // 2. Draw ground truth target bounding boxes (green dashed)
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#10b981';
    targetBoxes.forEach((tgt, idx) => {
      const cx = tgt[0] * width;
      const cy = tgt[1] * height;
      const bw = tgt[2] * width;
      const bh = tgt[3] * height;
      ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);

      ctx.fillStyle = '#10b981';
      ctx.font = '10px monospace';
      ctx.fillText(`GT ${idx} [Class ${targetClasses[idx]}]`, cx - bw / 2 + 4, cy - bh / 2 - 4);
    });
    ctx.setLineDash([]);

    // 3. Draw active query predicted bounding box (amber solid)
    const pq = activeQuery.predBox;
    const qx = pq[0] * width;
    const qy = pq[1] * height;
    const qw = pq[2] * width;
    const qh = pq[3] * height;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(qx - qw / 2, qy - qh / 2, qw, qh);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px monospace';
    ctx.fillText(`${activeQuery.name.split(':')[0]} (${Math.round(activeQuery.classProb * 100)}%)`, qx - qw / 2 + 4, qy - qh / 2 - 6);

    // 4. Draw reference point and deformable sampling offsets
    const rx = refPoint[0] * cellW;
    const ry = refPoint[1] * cellH;

    // Connect reference point to sampling locations with glowing rays
    deformableResult.samples.forEach((sample, idx) => {
      const sx = sample.sampleX * cellW;
      const sy = sample.sampleY * cellH;

      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.4 + sample.weight * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sample point disk
      ctx.beginPath();
      const radius = 3 + sample.weight * 9;
      ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sample weight text
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.fillText(`K${idx}`, sx + radius + 2, sy + 3);
    });

    // Reference Point Center Marker (Cyan Target)
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rx, ry, 12, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [featureMap, targetBoxes, targetClasses, activeQuery, refPoint, deformableResult]);

  // Handle Canvas Mouse Drag for custom reference point
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GRID_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * GRID_SIZE;
    setCustomRefPoint([x, y]);
    setSelectedQueryId(0); // 0 indicates custom drag query
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(GRID_SIZE - 1, ((e.clientX - rect.left) / rect.width) * GRID_SIZE));
    const y = Math.max(0, Math.min(GRID_SIZE - 1, ((e.clientY - rect.top) / rect.height) * GRID_SIZE));
    setCustomRefPoint([x, y]);
  };

  const handleCanvasMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Advanced Deep Recognition & Deformable Attention Explorer
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              Tier-A Interactive Lab (ADV-04)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulasi interaktif Deformable DETR multi-scale sampling, Bipartite Matching Loss (Hungarian), dan Bounding Box GIoU/Focal Loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedQueryId(1);
              setNumSamplePoints(4);
              setDilationRadius(2.5);
              setFocalGamma(2.0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Canvas Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Eye className="w-4 h-4 text-cyan-400" />
              Feature Saliency Map & Deformable Sampling Offsets
            </span>
            <span className="text-[11px] text-slate-400">
              Klik & Geser pada Kanvas untuk Memindahkan Titik Referensi (Reference Point)
            </span>
          </div>

          <div className="relative border border-slate-700/80 rounded-lg overflow-hidden bg-slate-950 flex justify-center items-center">
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="w-full max-w-[480px] aspect-square cursor-crosshair"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block border border-white" />
              Titik Referensi Query ($p_q$)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500 inline-block border border-white" />
              Sampling Offsets ($p_q + \Delta p_k$)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-dashed border-emerald-400 inline-block" />
              Ground Truth Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-amber-400 inline-block" />
              Prediksi Query Box
            </span>
          </div>
        </div>

        {/* Right Controls & Telemetry HUD (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Query Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Pilih Object Query Prediksi:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {queries.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQueryId(q.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition ${
                    selectedQueryId === q.id
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                      : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{q.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                    <span>Posisi Ref: ({q.refPoint[0].toFixed(1)}, {q.refPoint[1].toFixed(1)})</span>
                    <span>Keyakinan: {(q.classProb * 100).toFixed(0)}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deformable Attention Parameters */}
          <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-3.5 text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-pink-400" />
                Parameter Deformable Sampling
              </span>
              <span className="text-[11px] text-pink-300 font-mono">
                $K = {numSamplePoints}$ Sampel
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Jumlah Titik Sampling ($K$):</span>
                <span className="font-mono text-slate-200">{numSamplePoints} titik</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={numSamplePoints}
                onChange={(e) => setNumSamplePoints(parseInt(e.target.value, 10))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Radius Dilasi Sampling ($\Delta r$):</span>
                <span className="font-mono text-slate-200">{dilationRadius.toFixed(1)} grid</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={dilationRadius}
                onChange={(e) => setDilationRadius(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Focal Loss Gamma ($\gamma$):</span>
                <span className="font-mono text-slate-200">{focalGamma.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={5.0}
                step={0.5}
                value={focalGamma}
                onChange={(e) => setFocalGamma(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Mathematical Telemetry HUD */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Metrik Telemetri Bipartite Loss & Attention
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Agregasi Nilai Deformable</span>
                <span className="text-sm font-bold font-mono text-pink-400">
                  {deformableResult.aggregatedValue.toFixed(2)}
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Focal Loss (FL)</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {detrMatch.focalLoss.toFixed(4)}
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">IoU Thd GT 0</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {(detrMatch.iou0 * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">GIoU Thd GT 0</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {detrMatch.giou0.toFixed(3)}
                </span>
              </div>
            </div>

            {/* DETR Matching Cost Breakdown */}
            <div className="text-[11px] p-2.5 bg-slate-900/80 rounded border border-slate-800/80 space-y-1 font-mono">
              <div className="text-slate-400 font-sans font-medium text-xs mb-1">
                DETR Matching Cost L_match(Query, GT_0):
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Biaya Klasifikasi (-&lambda;_c &times; p):</span>
                <span className="text-pink-300">{detrMatch.matchCosts[0].classCost.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Biaya Koordinat L1 (&lambda;_L1 &times; |b - b_hat|):</span>
                <span className="text-amber-300">{detrMatch.matchCosts[0].l1Cost.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Biaya GIoU (&lambda;_giou &times; (1 - GIoU)):</span>
                <span className="text-emerald-300">{detrMatch.matchCosts[0].giouCost.toFixed(3)}</span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-cyan-300">
                <span>Total Biaya Kecocokan:</span>
                <span>{detrMatch.matchCosts[0].totalCost.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
