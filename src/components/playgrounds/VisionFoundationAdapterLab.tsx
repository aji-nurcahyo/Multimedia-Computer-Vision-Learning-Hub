import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  cosineSimilarity,
  l2Normalize,
  computeInfoNceLoss,
  computeLoraParamCount,
  temperatureScaledSoftmax
} from '../../lib/advancedCvProcessing';
import { Cpu, Activity, RefreshCw, BarChart2, Share2 } from 'lucide-react';

interface MultimodalPair {
  id: number;
  label: string;
  category: string;
  imageVector: number[]; // 8-dim synthetic embedding
  textPrompt: string;
  textVector: number[];  // 8-dim synthetic embedding
}

export const VisionFoundationAdapterLab: React.FC = () => {
  // Temperature for InfoNCE and Zero-shot Softmax
  const [temperature, setTemperature] = useState<number>(0.1);
  const [loraRank, setLoraRank] = useState<number>(4);
  const [loraAlpha, setLoraAlpha] = useState<number>(16);
  const [selectedPairId, setSelectedPairId] = useState<number>(1);
  const dModel = 768;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synthetic multimodal database with normalized 8-dim embeddings
  const multimodalDatabase: MultimodalPair[] = useMemo(() => [
    {
      id: 1,
      label: 'Citra Harimau Sumatera',
      category: 'Fauna',
      imageVector: l2Normalize([0.82, 0.45, -0.12, 0.05, 0.22, -0.15, 0.08, 0.19]),
      textPrompt: 'a photo of a wild Sumatran tiger in dense rainforest',
      textVector: l2Normalize([0.80, 0.48, -0.09, 0.02, 0.25, -0.11, 0.05, 0.21])
    },
    {
      id: 2,
      label: 'Citra Perkebunan Kelapa Sawit',
      category: 'Lanskap',
      imageVector: l2Normalize([-0.15, 0.78, 0.45, -0.21, 0.10, 0.32, -0.05, 0.08]),
      textPrompt: 'aerial view of an oil palm plantation in Lampung',
      textVector: l2Normalize([-0.18, 0.75, 0.49, -0.18, 0.12, 0.30, -0.02, 0.11])
    },
    {
      id: 3,
      label: 'Citra Drone Maritim Selat Sunda',
      category: 'Maritim',
      imageVector: l2Normalize([-0.35, -0.12, 0.82, 0.41, -0.08, 0.05, 0.12, -0.04]),
      textPrompt: 'maritime vessel navigating through Sunda Strait waters',
      textVector: l2Normalize([-0.31, -0.15, 0.85, 0.38, -0.05, 0.02, 0.15, -0.01])
    },
    {
      id: 4,
      label: 'Citra Kamera Malam Adverse Fog',
      category: 'Adverse',
      imageVector: l2Normalize([0.10, -0.22, 0.35, -0.75, 0.48, 0.11, -0.12, 0.09]),
      textPrompt: 'nighttime roadway surveillance camera obscured by dense fog',
      textVector: l2Normalize([0.14, -0.19, 0.38, -0.71, 0.51, 0.08, -0.09, 0.12])
    }
  ], []);

  const activePair = multimodalDatabase.find((p) => p.id === selectedPairId) || multimodalDatabase[0];

  // Calculate Cross-Modal Cosine Similarity Matrix (Image vs All Text Prompts)
  const crossModalSims = useMemo(() => {
    return multimodalDatabase.map((target) => {
      const sim = cosineSimilarity(activePair.imageVector, target.textVector);
      return {
        id: target.id,
        label: target.label,
        prompt: target.textPrompt,
        similarity: sim
      };
    });
  }, [activePair, multimodalDatabase]);

  // Zero-Shot Classification Probabilities via Temperature-Scaled Softmax
  const zeroShotProbabilities = useMemo(() => {
    const rawLogits = crossModalSims.map((s) => s.similarity);
    return temperatureScaledSoftmax(rawLogits, temperature);
  }, [crossModalSims, temperature]);

  // InfoNCE Contrastive Loss computation
  const infoNceMetrics = useMemo(() => {
    const query = activePair.imageVector;
    const posKey = activePair.textVector;
    const negKeys = multimodalDatabase
      .filter((p) => p.id !== activePair.id)
      .map((p) => p.textVector);

    return computeInfoNceLoss(query, posKey, negKeys, temperature);
  }, [activePair, multimodalDatabase, temperature]);

  // LoRA Parameter Savings computation
  const loraStats = useMemo(() => {
    return computeLoraParamCount(dModel, dModel, loraRank);
  }, [dModel, loraRank]);

  // Render 2D Embedding Projection on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.38;

    ctx.clearRect(0, 0, width, height);

    // Background radial coordinate rings
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach((r) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * scale, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - scale, centerY);
    ctx.lineTo(centerX + scale, centerY);
    ctx.moveTo(centerX, centerY - scale);
    ctx.lineTo(centerX, centerY + scale);
    ctx.stroke();

    // Project 8D embeddings to 2D plane using first two principal coordinates [v0, v1]
    multimodalDatabase.forEach((pair) => {
      const isSelected = pair.id === activePair.id;

      // Image embedding point (Cyan square)
      const ix = centerX + pair.imageVector[0] * scale;
      const iy = centerY + pair.imageVector[1] * scale;

      // Text prompt embedding point (Pink triangle)
      const tx = centerX + pair.textVector[0] * scale;
      const ty = centerY + pair.textVector[1] * scale;

      // Draw alignment vector between paired image and text
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.85)' : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.setLineDash(isSelected ? [4, 3] : [2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Image Token Marker
      ctx.fillStyle = isSelected ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(ix, iy, isSelected ? 7 : 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Text Token Marker
      ctx.fillStyle = isSelected ? '#ec4899' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(tx, ty, isSelected ? 6 : 3.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Labels
      ctx.font = isSelected ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillStyle = isSelected ? '#f1f5f9' : '#64748b';
      ctx.fillText(`${pair.label}`, ix + 9, iy - 4);
    });
  }, [multimodalDatabase, activePair]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Vision Foundation Models & Parameter-Efficient Adapter Explorer
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-pink-950/80 text-pink-300 border border-pink-800/60">
              Tier-A Interactive Lab (ADV-07)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Eksplorasi representasi multimodal (CLIP Image-Text Alignment), fungsi loss InfoNCE, dan adaptasi parameter efisien Low-Rank Adaptation (LoRA).
          </p>
        </div>

        <button
          onClick={() => {
            setTemperature(0.1);
            setLoraRank(4);
            setLoraAlpha(16);
            setSelectedPairId(1);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Reset Defaults
        </button>
      </div>

      {/* Main Grid: Embedding Visualizer & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Visualizer (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              Multimodal Embedding Space (Proyeksi 2D Cosine Manifold)
            </span>
            <span className="text-[11px] text-pink-400 font-mono">
              Temp ($\tau$): {temperature.toFixed(2)}
            </span>
          </div>

          <div className="relative border border-slate-700/80 rounded-lg overflow-hidden bg-slate-950 flex justify-center items-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="w-full max-w-[420px] aspect-square"
            />
          </div>

          {/* Canvas Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block border border-white" />
              Token Visual (q_img)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500 inline-block border border-white" />
              Token Teks (k_text)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              Garis Putus-Putus: Jarak Cosine Penyelarasan
            </span>
          </div>
        </div>

        {/* Right Controls & Telemetry HUD (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Query Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Pilih Sampel Multimodal Uji:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {multimodalDatabase.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPairId(p.id)}
                  className={`text-left p-2 rounded-lg border text-xs transition ${
                    selectedPairId === p.id
                      ? 'bg-pink-950/50 border-pink-500 text-pink-200'
                      : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{p.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Zero-Shot Classification Breakdown */}
          <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Shot Retrieval Probability ($p_i \propto \exp(s_i / \tau)$)
              </span>
            </div>

            <div className="space-y-1.5">
              {crossModalSims.map((sim, idx) => {
                const prob = zeroShotProbabilities[idx] || 0;
                const isCorrect = sim.id === activePair.id;
                return (
                  <div key={sim.id} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className={isCorrect ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                        {sim.label} (Sim: {sim.similarity.toFixed(3)})
                      </span>
                      <span className="font-mono text-slate-200">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCorrect ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, prob * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LoRA Parameter Tuning */}
          <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Adaptasi Efisien Parameter (LoRA: &Delta;W = (&alpha;/r) BA)
              </span>
              <span className="text-[11px] text-purple-300 font-mono">
                Hemat: {loraStats.savedPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Rank LoRA ($r$):</span>
                  <span className="font-mono text-slate-200">{loraRank}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={1}
                  value={loraRank}
                  onChange={(e) => setLoraRank(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Skala Alpha ($\alpha$):</span>
                  <span className="font-mono text-slate-200">{loraAlpha}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={32}
                  step={1}
                  value={loraAlpha}
                  onChange={(e) => setLoraAlpha(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Suhu Softmax ($\tau$):</span>
                <span className="font-mono text-slate-200">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={1.0}
                step={0.02}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Metrics HUD */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Parameter Dasar</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {loraStats.fullParams.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Parameter LoRA</span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {loraStats.loraParams.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">InfoNCE Loss</span>
                <span className="text-xs font-mono font-bold text-pink-300">
                  {infoNceMetrics.loss.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
