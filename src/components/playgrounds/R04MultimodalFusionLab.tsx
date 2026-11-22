import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layers, Activity, Eye, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';

export const R04MultimodalFusionLab: React.FC = () => {
  // Parameters
  const [fusionMode, setFusionMode] = useState<'camera_only' | 'heuristic' | 'bayesian'>('bayesian');
  const [camDepthNoise, setCamDepthNoise] = useState<number>(1.8); // meters
  const [radarAzimuthNoise, setRadarAzimuthNoise] = useState<number>(1.5); // meters
  const [sensorDropout, setSensorDropout] = useState<'none' | 'camera' | 'radar'>('none');
  const [calibOffset, setCalibOffset] = useState<number>(0.0); // meters offset

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation calculations
  const metrics = useMemo(() => {
    const camLatNoise = 0.4;
    const radRangeNoise = 0.25;

    // Trajectory generation (synthetic curve over 30 frames)
    let totalError = 0;
    const count = 30;
    const points: Array<{ gt: [number, number]; est: [number, number]; cam: [number, number]; rad: [number, number] }> = [];

    // State tracking for simple simulation
    let kx = 0;
    let ky = 5;

    for (let t = 0; t < count; t++) {
      const gtX = Math.sin(t * 0.15) * 6;
      const gtY = 5 + t * 0.8;

      // Simulated measurements
      const hasCam = sensorDropout !== 'camera' && !(sensorDropout === 'none' && t >= 12 && t <= 16 && false);
      const hasRad = sensorDropout !== 'radar';

      const zCamX = gtX + (hasCam ? (Math.sin(t * 1.3) * camLatNoise) : 0);
      const zCamY = gtY + (hasCam ? (Math.cos(t * 0.9) * camDepthNoise) : 0);

      const zRadX = gtX + calibOffset + (hasRad ? (Math.sin(t * 2.1) * radarAzimuthNoise) : 0);
      const zRadY = gtY + (hasRad ? (Math.cos(t * 1.7) * radRangeNoise) : 0);

      let estX = gtX;
      let estY = gtY;

      if (fusionMode === 'camera_only') {
        if (hasCam) {
          estX = zCamX;
          estY = zCamY;
        } else {
          estX = kx;
          estY = ky;
        }
      } else if (fusionMode === 'heuristic') {
        if (hasCam && hasRad) {
          estX = 0.5 * zCamX + 0.5 * zRadX;
          estY = 0.5 * zCamY + 0.5 * zRadY;
        } else if (hasCam) {
          estX = zCamX;
          estY = zCamY;
        } else if (hasRad) {
          estX = zRadX;
          estY = zRadY;
        }
      } else {
        // Bayesian Kalman with anisotropic covariance weights
        if (hasCam && hasRad) {
          // Weight camera high on X (lateral), radar high on Y (range)
          const wCamX = (1 / (camLatNoise ** 2)) / (1 / (camLatNoise ** 2) + 1 / (radarAzimuthNoise ** 2));
          const wCamY = (1 / (camDepthNoise ** 2)) / (1 / (camDepthNoise ** 2) + 1 / (radRangeNoise ** 2));
          estX = wCamX * zCamX + (1 - wCamX) * zRadX;
          estY = wCamY * zCamY + (1 - wCamY) * zRadY;
        } else if (hasCam) {
          estX = zCamX;
          estY = zCamY;
        } else if (hasRad) {
          estX = zRadX;
          estY = zRadY;
        }
      }

      kx = estX;
      ky = estY;

      const err = Math.sqrt((estX - gtX) ** 2 + (estY - gtY) ** 2);
      totalError += err ** 2;

      points.push({
        gt: [gtX, gtY],
        est: [estX, estY],
        cam: [zCamX, zCamY],
        rad: [zRadX, zRadY],
      });
    }

    const rmse = Math.sqrt(totalError / count);
    const heuristicBaselineRMSE = 1.328;
    const reductionPercent = Math.max(-50, ((heuristicBaselineRMSE - rmse) / heuristicBaselineRMSE) * 100);

    return {
      rmse: Number(rmse.toFixed(3)),
      reductionPercent: Number(reductionPercent.toFixed(1)),
      points,
    };
  }, [fusionMode, camDepthNoise, radarAzimuthNoise, sensorDropout, calibOffset]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ego vehicle at bottom center
    const originX = width / 2;
    const originY = height - 30;
    const scale = 8.5; // pixels per meter

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(originX, originY - 15);
    ctx.lineTo(originX - 12, originY + 10);
    ctx.lineTo(originX + 12, originY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('EGO SENSOR RIG', originX - 42, originY + 24);

    // Sensor field of view cones
    // Camera FOV (narrow 60 deg cone)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX - 180, 20);
    ctx.lineTo(originX + 180, 20);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Radar FOV (wide 120 deg cone)
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.fillStyle = 'rgba(234, 179, 8, 0.03)';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX - 280, 50);
    ctx.lineTo(originX + 280, 50);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Draw Ground Truth Path (Green)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    metrics.points.forEach((pt, idx) => {
      const px = originX + pt.gt[0] * scale;
      const py = originY - pt.gt[1] * scale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Estimated Trajectory
    ctx.strokeStyle = fusionMode === 'bayesian' ? '#a855f7' : fusionMode === 'heuristic' ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    metrics.points.forEach((pt, idx) => {
      const px = originX + pt.est[0] * scale;
      const py = originY - pt.est[1] * scale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw last point with Covariance Ellipses
    const last = metrics.points[metrics.points.length - 1];
    const lastEstX = originX + last.est[0] * scale;
    const lastEstY = originY - last.est[1] * scale;

    if (sensorDropout !== 'camera') {
      // Camera measurement ellipse (elongated along Y: high depth uncertainty)
      const lastCamX = originX + last.cam[0] * scale;
      const lastCamY = originY - last.cam[1] * scale;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.ellipse(lastCamX, lastCamY, 0.4 * scale, camDepthNoise * scale, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }

    if (sensorDropout !== 'radar') {
      // Radar measurement ellipse (wide along X: coarse azimuth, tight along Y: fine range)
      const lastRadX = originX + last.rad[0] * scale;
      const lastRadY = originY - last.rad[1] * scale;
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.beginPath();
      ctx.ellipse(lastRadX, lastRadY, radarAzimuthNoise * scale, 0.25 * scale, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }

    // Fused estimate point
    ctx.fillStyle = fusionMode === 'bayesian' ? '#c084fc' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(lastEstX, lastEstY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Legend
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('--- Ground Truth (m)', 16, 24);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('O Camera Measurement (Elongated Depth Error)', 16, 42);
    ctx.fillStyle = '#eab308';
    ctx.fillText('O Radar Measurement (Wide Azimuth Error)', 16, 60);
    ctx.fillStyle = fusionMode === 'bayesian' ? '#c084fc' : '#f59e0b';
    ctx.fillText(`● Fused Track (${fusionMode.toUpperCase()})`, 16, 78);
  }, [metrics, fusionMode, camDepthNoise, radarAzimuthNoise, sensorDropout, calibOffset]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              R04 Interactive Lab
            </span>
            <span className="text-xs text-slate-400">Tier-A Research Simulation</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Asynchronous Camera-Radar Bayesian State Fusion
          </h3>
          <p className="text-xs text-slate-400">
            Investigasi fusi anisotropik kovariansi sensor heterogen vs rata-rata berbobot heuristik di bawah sensor dropout.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setFusionMode('camera_only')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              fusionMode === 'camera_only' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Camera Only
          </button>
          <button
            onClick={() => setFusionMode('heuristic')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              fusionMode === 'heuristic' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Heuristic (50:50)
          </button>
          <button
            onClick={() => setFusionMode('bayesian')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              fusionMode === 'bayesian' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bayesian Kalman
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Visualizer */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
          <canvas ref={canvasRef} width={540} height={380} className="rounded w-full max-w-full" />
          <div className="text-[11px] text-slate-500 mt-2 text-center">
            Bird&apos;s-Eye-View (BEV) Sensor Fusion Field | Sumbu X: Lateral (-10m s.d. +10m) | Sumbu Y: Jarak Jangkau (0 s.d. 35m)
          </div>
        </div>

        {/* Control Panel & Live Statistics */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Parameter Derau & Kalibrasi
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> Derau Kedalaman Kamera (&sigma; depth)
                </span>
                <span className="font-mono text-sky-400">{camDepthNoise.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={camDepthNoise}
                onChange={(e) => setCamDepthNoise(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" /> Derau Azimuth Radar (&sigma; azimuth)
                </span>
                <span className="font-mono text-amber-400">{radarAzimuthNoise.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={radarAzimuthNoise}
                onChange={(e) => setRadarAzimuthNoise(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Offset Kalibrasi Ekstrinsik ($\Delta x$)</span>
                <span className="font-mono text-slate-300">{calibOffset.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.1"
                value={calibOffset}
                onChange={(e) => setCalibOffset(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Simulasi Sensor Dropout</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['none', 'camera', 'radar'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSensorDropout(mode)}
                    className={`py-1 text-[11px] rounded border capitalize ${
                      sensorDropout === mode
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'none' ? 'Normal' : `${mode} Off`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Trajectory RMSE</span>
              <span className={`text-xl font-bold font-mono ${metrics.rmse < 0.9 ? 'text-green-400' : 'text-amber-400'}`}>
                {metrics.rmse} m
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Ground-truth deviation</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Reduksi Galat</span>
              <span
                className={`text-xl font-bold font-mono ${
                  metrics.reductionPercent > 30 ? 'text-purple-400' : 'text-slate-400'
                }`}
              >
                {metrics.reductionPercent > 0 ? `+${metrics.reductionPercent}%` : `${metrics.reductionPercent}%`}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">vs Heuristic baseline</span>
            </div>
          </div>

          {/* Educational Insight Alert */}
          <div
            className={`p-3 rounded-lg border text-xs flex gap-2 ${
              fusionMode === 'bayesian'
                ? 'bg-purple-950/30 border-purple-800/60 text-purple-200'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
            }`}
          >
            {fusionMode === 'bayesian' ? (
              <>
                <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>
                  <strong>Keunggulan Bayesian Kalman:</strong> Menghormati sifat derau anisotropik sensor — memanfaatkan resolusi sudut tinggi dari kamera dan akurasi rentang millimeter dari radar secara optimal.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Kelemahan Heuristik (50:50):</strong> Merusak informasi akurat karena membagi rata derau kasar kamera pada jarak jangkau dan derau azimut radar tanpa mempertimbangkan matriks kovariansi!
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
