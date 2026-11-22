import React, { useState, useMemo } from 'react';
import {
  calculateAffineQuantizationParams,
  quantizeFloatToUint8,
  dequantizeUint8ToFloat,
  calculateQuantizationError,
  estimateModelCompression,
} from '../../lib/systemsProcessing';
import { Cpu, HardDrive, Zap, Sliders, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';

export const EdgeAiOptimizationLab: React.FC = () => {
  const [rMin, setRMin] = useState<number>(-2.0);
  const [rMax, setRMax] = useState<number>(6.0);
  const [numBits, setNumBits] = useState<number>(8);
  const [testFloatVal, setTestFloatVal] = useState<number>(2.0);
  const [paramCount, setParamCount] = useState<number>(1_000_000);
  const [selectedHw, setSelectedHw] = useState<'mcu' | 'coral' | 'jetson' | 'cloud'>('coral');

  // Quantization parameters
  const quantParams = useMemo(() => {
    return calculateAffineQuantizationParams(rMin, rMax, numBits);
  }, [rMin, rMax, numBits]);

  // Test float quant/dequant
  const quantizedVal = useMemo(() => {
    const qArr = quantizeFloatToUint8([testFloatVal], quantParams.scale, quantParams.zeroPoint);
    return qArr[0];
  }, [testFloatVal, quantParams]);

  const dequantizedVal = useMemo(() => {
    const rArr = dequantizeUint8ToFloat([quantizedVal], quantParams.scale, quantParams.zeroPoint);
    return rArr[0];
  }, [quantizedVal, quantParams]);

  const singleSampleError = Math.abs(testFloatVal - dequantizedVal);

  // Array error metrics across range
  const errorMetrics = useMemo(() => {
    const samples = [rMin, (rMin + rMax) / 4, 0.0, (rMin + rMax) / 2, rMax];
    const qArr = quantizeFloatToUint8(samples, quantParams.scale, quantParams.zeroPoint);
    const dArr = dequantizeUint8ToFloat(qArr, quantParams.scale, quantParams.zeroPoint);
    return calculateQuantizationError(samples, dArr);
  }, [rMin, rMax, quantParams]);

  // Model compression
  const compressionMetrics = useMemo(() => {
    return estimateModelCompression(paramCount, 32, numBits);
  }, [paramCount, numBits]);

  // Hardware Profiles
  const HW_PROFILES = {
    mcu: {
      name: 'ESP32-S3 TinyML',
      power: '< 1 Watt',
      throughput: '3–5 FPS',
      latency: '200–350 ms',
      cost: '$5 – $10',
      desc: 'Sangat hemat energi, cocok untuk deteksi kehadiran berbasis baterai.',
    },
    coral: {
      name: 'Google Coral Edge NPU',
      power: '2 Watt',
      throughput: '45–60 FPS',
      latency: '15–22 ms',
      cost: '$60 – $80',
      desc: 'Akselerator systolic array INT8 berkecepatan tinggi dengan efisiensi maksimal.',
    },
    jetson: {
      name: 'NVIDIA Jetson Orin Nano',
      power: '7–15 Watt',
      throughput: '60–120 FPS',
      latency: '8–14 ms',
      cost: '$199 – $499',
      desc: 'Edge GPU fleksibel untuk model vision multitask dan transformer ringan.',
    },
    cloud: {
      name: 'Server Datacenter (A100)',
      power: '400 Watt',
      throughput: '150+ FPS',
      latency: '60–150 ms (Network)',
      cost: 'Subscription',
      desc: 'Komputasi tak terbatas namun terbebani latensi transmisi jaringan internet.',
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Laboratorium Kuantisasi Model Edge AI & Akselerasi Embedded (Bab 57)
          </h2>
          <p className="text-sm text-slate-400">
            Simulasi interaktif Post-Training Quantization (PTQ) INT8, perhitungan parameter skala S dan titik nol Z, evaluasi SQNR, dan kompresi memori model.
          </p>
        </div>
        <button
          onClick={() => {
            setRMin(-2.0);
            setRMax(6.0);
            setNumBits(8);
            setTestFloatVal(2.0);
            setParamCount(1_000_000);
            setSelectedHw('coral');
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          title="Reset ke Default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quantization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" /> Parameter Kalibrasi Rentang Dinamis
          </h3>

          {/* Range Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">r_min (Float Minimum)</span>
              <input
                type="number"
                step="0.5"
                value={rMin}
                onChange={(e) => setRMin(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">r_max (Float Maksimum)</span>
              <input
                type="number"
                step="0.5"
                value={rMax}
                onChange={(e) => setRMax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          {/* Precision Selector */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5 font-medium">Resolusi Kuantisasi Integer</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNumBits(8)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                  numBits === 8
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">INT8 (8-bit)</div>
                <div className="text-[10px] text-slate-400">[0, 255] Standar Industri</div>
              </button>
              <button
                onClick={() => setNumBits(4)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                  numBits === 4
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">INT4 (4-bit)</div>
                <div className="text-[10px] text-slate-400">[0, 15] Ultra-Kompresi</div>
              </button>
            </div>
          </div>

          {/* Interactive Float Value Probe */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Probe Sampel Nilai Riil (r)</span>
              <span className="text-emerald-400 font-mono font-bold">{testFloatVal.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={rMin}
              max={rMax}
              step={(rMax - rMin) / 100 || 0.1}
              value={testFloatVal}
              onChange={(e) => setTestFloatVal(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Model Parameter Count */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Jumlah Parameter Model Vision</span>
              <span className="text-sky-400 font-mono font-bold">{(paramCount / 1e6).toFixed(2)} Juta</span>
            </div>
            <input
              type="range"
              min={200_000}
              max={5_000_000}
              step={100_000}
              value={paramCount}
              onChange={(e) => setParamCount(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>MobileNet-0.25 (0.5M)</span>
              <span>MobileNet-V2 (3.4M)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Transform & Hardware Profiling (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Key Parameters Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Skala (S)
              </span>
              <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
                {quantParams.scale.toFixed(6)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Resolusi per integer</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Titik Nol (Z)
              </span>
              <div className="text-lg font-bold font-mono text-sky-300 mt-1">
                {quantParams.zeroPoint}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Representasi 0.0 eksak</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> SQNR Fidelity
              </span>
              <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                {errorMetrics.snrDb.toFixed(1)} <span className="text-xs font-normal text-slate-400">dB</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fidelitas sangat tinggi</div>
            </div>
          </div>

          {/* Transformation Step Inspection */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2.5 text-xs font-mono">
            <span className="text-slate-300 font-sans font-semibold block text-xs">
              Simulasi Transformasi Sampel Nilai: r = {testFloatVal.toFixed(2)}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">1. Nilai Riil (FP32)</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{testFloatVal.toFixed(4)}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">2. Terkuantisasi (INT{numBits})</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{quantizedVal}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">3. Rekonstruksi (r_hat)</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{dequantizedVal.toFixed(4)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400">
              <span>Galat absolut: |r - r_hat| = <span className="text-slate-200 font-bold">{singleSampleError.toFixed(6)}</span></span>
              <span>Batas toleransi LSB/2: &le; <span className="text-emerald-400 font-bold">{(quantParams.scale / 2).toFixed(6)}</span></span>
            </div>
          </div>

          {/* Model Compression Savings Bar */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-400" /> Jejak Memori Model ({compressionMetrics.compressionRatio.toFixed(1)}x Kompresi)
              </span>
              <span className="text-emerald-400 font-bold">Hemat {compressionMetrics.memorySavingsPercent.toFixed(1)}%</span>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>FP32 Asli: {(compressionMetrics.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-slate-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>INT{numBits} Terkuantisasi: {(compressionMetrics.compressedSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="text-emerald-400 font-bold">{(100 - compressionMetrics.memorySavingsPercent).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${100 - compressionMetrics.memorySavingsPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Profile Comparison */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-300 block">Profil Perangkat Keras Target</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['mcu', 'coral', 'jetson', 'cloud'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedHw(key)}
                  className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition ${
                    selectedHw === key
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {HW_PROFILES[key].name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">{HW_PROFILES[selectedHw].name}</span>
                <span className="text-amber-400 font-mono">{HW_PROFILES[selectedHw].power}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Throughput: <span className="text-emerald-400 font-mono">{HW_PROFILES[selectedHw].throughput}</span></span>
                <span>Latensi: <span className="text-sky-400 font-mono">{HW_PROFILES[selectedHw].latency}</span></span>
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">{HW_PROFILES[selectedHw].desc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

