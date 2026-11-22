import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Compass, Scan, Eye, Activity, CheckCircle2 } from 'lucide-react';

export const R06SpatialVisionLab: React.FC = () => {
  // Configurable Stereo Parameters
  const [baselineM, setBaselineM] = useState<number>(0.54); // meters (KITTI baseline)
  const [focalLengthPx, setFocalLengthPx] = useState<number>(718.8); // pixels
  const [targetDistanceZ, setTargetDistanceZ] = useState<number>(8.0); // meters
  const [disparityNoisePx, setDisparityNoisePx] = useState<number>(0.4); // pixels

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Geometric Calculations
  const metrics = useMemo(() => {
    // Disparity formula: d = (f * B) / Z
    const disparityPx = (focalLengthPx * baselineM) / Math.max(0.5, targetDistanceZ);

    // Quadratic depth uncertainty formula: sigma_Z = (Z^2 / (f * B)) * sigma_d
    const depthUncertaintyM = ((targetDistanceZ ** 2) / (focalLengthPx * baselineM)) * disparityNoisePx;
    const depthUncertaintyCm = depthUncertaintyM * 100.0;

    // Lateral uncertainty: sigma_X = (Z / f) * sigma_d
    const lateralUncertaintyM = (targetDistanceZ / focalLengthPx) * disparityNoisePx;
    const lateralUncertaintyCm = lateralUncertaintyM * 100.0;

    // Simulated Reprojection RMSE & Absolute Trajectory Error (ATE)
    const baseReproj = 0.364 * (disparityNoisePx / 0.4);
    const simulatedReprojRMSE = Number(baseReproj.toFixed(3));

    const simulatedATE = Number((0.144 * (depthUncertaintyM / 0.178)).toFixed(3));

    return {
      disparityPx: Number(disparityPx.toFixed(1)),
      depthUncertaintyCm: Number(depthUncertaintyCm.toFixed(1)),
      lateralUncertaintyCm: Number(lateralUncertaintyCm.toFixed(1)),
      reprojRMSE: simulatedReprojRMSE,
      ateRMSE: Math.max(0.05, Math.min(1.5, simulatedATE)),
    };
  }, [baselineM, focalLengthPx, targetDistanceZ, disparityNoisePx]);

  // Canvas Stereo Geometry Renderer
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
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const centerX = width / 2;
    const camBaseY = height - 40;
    const scalePxPerMeter = 14;

    // Camera Rig Center
    const baselinePx = baselineM * scalePxPerMeter * 5; // scaled for visibility
    const camLeftX = centerX - baselinePx / 2;
    const camRightX = centerX + baselinePx / 2;

    // Draw baseline bar connecting cameras
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(camLeftX, camBaseY);
    ctx.lineTo(camRightX, camBaseY);
    ctx.stroke();

    // Camera icons/markers
    const drawCamera = (x: number, y: number, label: string) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x - 10, y - 8, 20, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y - 8, 5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(label, x - 18, y + 22);
    };

    drawCamera(camLeftX, camBaseY, 'Cam L');
    drawCamera(camRightX, camBaseY, 'Cam R');

    // Target 3D Point Coordinates
    const targetPxY = camBaseY - targetDistanceZ * scalePxPerMeter;
    const targetPxX = centerX;

    // Optical Rays from Left and Right cameras to Target
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(camLeftX, camBaseY - 8);
    ctx.lineTo(targetPxX, targetPxY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.beginPath();
    ctx.moveTo(camRightX, camBaseY - 8);
    ctx.lineTo(targetPxX, targetPxY);
    ctx.stroke();

    // Uncertainty Ellipse at 3D Target Point
    // Semi-major axis = depth uncertainty; Semi-minor axis = lateral uncertainty
    const depthUncertaintyPx = (metrics.depthUncertaintyCm / 100) * scalePxPerMeter * 2;
    const lateralUncertaintyPx = Math.max(3, (metrics.lateralUncertaintyCm / 100) * scalePxPerMeter * 2);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.beginPath();
    ctx.ellipse(targetPxX, targetPxY, lateralUncertaintyPx, depthUncertaintyPx, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // Target Point Dot
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(targetPxX, targetPxY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Distance Annotation
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Target (Z = ${targetDistanceZ.toFixed(1)} m)`, targetPxX + 12, targetPxY - 8);
    ctx.fillText(`Baseline B = ${baselineM.toFixed(2)} m`, centerX - 45, camBaseY + 32);

    // Legend
    ctx.fillStyle = '#22c55e';
    ctx.fillText('● 3D Point Ground-Truth', 16, 24);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`O Quadratic Depth Uncertainty (±${metrics.depthUncertaintyCm} cm)`, 16, 42);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('— Epipolar Triangulation Rays', 16, 60);
  }, [metrics, baselineM, targetDistanceZ]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              R06 Interactive Lab
            </span>
            <span className="text-xs text-slate-400">Tier-A 3D Spatial Geometry</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            Calibrated Stereo Geometry & DLT Triangulation Lab
          </h3>
          <p className="text-xs text-slate-400">
            Investigasi rekonstruksi 3D pinhole stereo, galat reproyeksi sub-piksel, dan ketidakpastian kuadratik kedalaman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>KITTI Odometry Rig Standard</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Visualizer */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
          <canvas ref={canvasRef} width={540} height={360} className="rounded w-full max-w-full" />
          <div className="text-[11px] text-slate-500 mt-2 text-center">
            Top-Down Epipolar Triangulation Plane | Elips Merah Menunjukkan Ketidakpastian Kedalaman ($\sigma_Z \propto Z^2$)
          </div>
        </div>

        {/* Sliders and Metrics */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Scan className="w-4 h-4 text-cyan-400" /> Kalibrasi Stereo Rig
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Stereo Baseline ($B$)</span>
                <span className="font-mono text-cyan-400">{baselineM.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="1.20"
                step="0.02"
                value={baselineM}
                onChange={(e) => setBaselineM(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Jarak Objek ($Z$)</span>
                <span className="font-mono text-purple-400">{targetDistanceZ.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="20.0"
                step="0.5"
                value={targetDistanceZ}
                onChange={(e) => setTargetDistanceZ(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> Focal Length ($f$)
                </span>
                <span className="font-mono text-slate-300">{focalLengthPx.toFixed(0)} px</span>
              </div>
              <input
                type="range"
                min="400"
                max="1000"
                step="10"
                value={focalLengthPx}
                onChange={(e) => setFocalLengthPx(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> Derau Disparitas ($\sigma_d$)
                </span>
                <span className="font-mono text-amber-400">{disparityNoisePx.toFixed(2)} px</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.05"
                value={disparityNoisePx}
                onChange={(e) => setDisparityNoisePx(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Disparitas Stereo</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {metrics.disparityPx} px
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">$d = (f \cdot B) / Z$</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Ketidakpastian $\sigma_Z$</span>
              <span className={`text-xl font-bold font-mono ${metrics.depthUncertaintyCm < 25 ? 'text-green-400' : 'text-amber-400'}`}>
                ±{metrics.depthUncertaintyCm} cm
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">$\propto Z^2 / (f \cdot B)$</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Reprojection RMSE</span>
              <span className="text-xl font-bold font-mono text-green-400">
                {metrics.reprojRMSE} px
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Batas sub-piksel &le; 0.5px</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Trajectory Drift (ATE)</span>
              <span className={`text-xl font-bold font-mono ${metrics.ateRMSE < 0.20 ? 'text-cyan-400' : 'text-amber-400'}`}>
                {metrics.ateRMSE} m
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Odometry deviation</span>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/30 text-xs flex gap-2 text-cyan-200">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Hukum Kuadratik Stereo:</strong> Ketidakpastian kedalaman bertambah secara kuadratik terhadap jarak $Z$. Menggandakan jarak target dari 8m ke 16m melipatgandakan galat posisi sebesar $4\times$!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

