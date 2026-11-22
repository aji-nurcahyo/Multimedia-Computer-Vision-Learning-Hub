import React, { useState, useMemo } from 'react';
import {
  fuseMultimodalEventScores,
  evaluateCapstoneRubric,
  CapstoneRubricScores,
} from '../../lib/systemsProcessing';
import { Award, Eye, Mic, Compass, ShieldAlert, CheckCircle2, RefreshCw, Sliders, AlertTriangle } from 'lucide-react';

export const IntegratedCapstoneStudio: React.FC = () => {
  // Sensor simulation states
  const [visualScore, setVisualScore] = useState<number>(0.85);
  const [audioScore, setAudioScore] = useState<number>(0.60);
  const [contextScore, setContextScore] = useState<number>(0.90);

  // Modality weights
  const [wVisual, setWVisual] = useState<number>(0.60);
  const [wAudio, setWAudio] = useState<number>(0.25);
  const [wContext, setWContext] = useState<number>(0.15);

  // Fault injection / dropout
  const [cameraFault, setCameraFault] = useState<boolean>(false);
  const [audioFault, setAudioFault] = useState<boolean>(false);

  // Rubric Scores
  const [rubricScores, setRubricScores] = useState<CapstoneRubricScores>({
    architecture: 24,
    implementation: 33,
    evaluation: 23,
    documentation: 14,
  });

  // Active sensory values considering fault injection
  const effectiveVisual = cameraFault ? 0.10 : visualScore;
  const effectiveAudio = audioFault ? 0.05 : audioScore;

  // Fusion result
  const fusionResult = useMemo(() => {
    return fuseMultimodalEventScores(
      effectiveVisual,
      effectiveAudio,
      contextScore,
      { visual: wVisual, audio: wAudio, context: wContext },
      0.50
    );
  }, [effectiveVisual, effectiveAudio, contextScore, wVisual, wAudio, wContext]);

  // Rubric result
  const rubricResult = useMemo(() => {
    return evaluateCapstoneRubric(rubricScores);
  }, [rubricScores]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-400" />
            Studio Proyek Akhir Capstone: Sistem Monitoring Visual Cerdas (Bab 60)
          </h2>
          <p className="text-sm text-slate-400">
            Sintesis menyeluruh: Mesin fusi konsensus Bayesian, histeresis temporal, simulasi sensor dropout, dan kalkulator rubrik akademik ITERA.
          </p>
        </div>
        <button
          onClick={() => {
            setVisualScore(0.85);
            setAudioScore(0.60);
            setContextScore(0.90);
            setWVisual(0.60);
            setWAudio(0.25);
            setWContext(0.15);
            setCameraFault(false);
            setAudioFault(false);
            setRubricScores({
              architecture: 24,
              implementation: 33,
              evaluation: 23,
              documentation: 14,
            });
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          title="Reset ke Default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Multi-Sensor Influx & Live Decision Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sensory Influx Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-400" /> Masukan Aliran Sensorik & Injeksi Gangguan
          </h3>

          {/* Visual Sensor Input */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" /> Skor Deteksi Visual (S_v)
              </span>
              <span className="text-sky-400 font-mono font-bold">
                {effectiveVisual.toFixed(2)} {cameraFault && '(Kabut / Dropout!)'}
              </span>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.05}
              disabled={cameraFault}
              value={visualScore}
              onChange={(e) => setVisualScore(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Bobot: {(wVisual * 100).toFixed(0)}%</span>
              <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cameraFault}
                  onChange={(e) => setCameraFault(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                Simulasi Lensa Tertutup Kabut
              </label>
            </div>
          </div>

          {/* Audio Sensor Input */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-amber-400" /> Skor Anomali Akustik (S_a)
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {effectiveAudio.toFixed(2)} {audioFault && '(Dropout!)'}
              </span>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.05}
              disabled={audioFault}
              value={audioScore}
              onChange={(e) => setAudioScore(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Bobot: {(wAudio * 100).toFixed(0)}%</span>
              <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioFault}
                  onChange={(e) => setAudioFault(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                Simulasi Mikrofon Terputus
              </label>
            </div>
          </div>

          {/* Context Weight */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Bobot Konteks Spasio-Temporal (S_c)
              </span>
              <span className="text-emerald-400 font-mono font-bold">{contextScore.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={1.0}
              step={0.05}
              value={contextScore}
              onChange={(e) => setContextScore(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Siang / Area Terbuka (0.2)</span>
              <span>Bobot: {(wContext * 100).toFixed(0)}%</span>
              <span>Dini Hari / Zona Kritis (0.9)</span>
            </div>
          </div>

          {/* Weight Adjustments */}
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 block font-medium">Kalibrasi Bobot Sensorik (Total = 1.0)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">w_visual</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.9"
                  value={wVisual}
                  onChange={(e) => setWVisual(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">w_audio</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.9"
                  value={wAudio}
                  onChange={(e) => setWAudio(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">w_konteks</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.5"
                  value={wContext}
                  onChange={(e) => setWContext(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Decision & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Decision Status Badge */}
          <div className={`p-4 rounded-lg border flex items-center justify-between ${
            fusionResult.isTriggered
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {fusionResult.isTriggered ? (
                <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              )}
              <div>
                <div className="text-base font-bold">
                  {fusionResult.isTriggered ? 'INSIDEN TERVERIFIKASI (ALERT TRIGGERED)' : 'KONDISI AMAN / NORMAL'}
                </div>
                <div className="text-xs text-slate-400">
                  {fusionResult.isTriggered
                    ? `Fusi Bayesian melampaui ambang batas 0.50. Modalitas dominan: ${fusionResult.dominantModality.toUpperCase()}`
                    : 'Seluruh modalitas berada di bawah ambang batas bahaya atau false alarm berhasil diredam.'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono">
                {(fusionResult.fusedConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">Skor Fusi F</div>
            </div>
          </div>

          {/* Modality Contribution Breakdown Bar */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Dekomposisi Kontribusi Modalitas Sensor</span>
              <span className="text-slate-400 font-mono">F = {fusionResult.fusedConfidence.toFixed(4)}</span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${(effectiveVisual * wVisual / (fusionResult.fusedConfidence || 1)) * 100}%` }}
                className="bg-sky-500"
                title={`Visual: ${(effectiveVisual * wVisual).toFixed(3)}`}
              ></div>
              <div
                style={{ width: `${(effectiveAudio * wAudio / (fusionResult.fusedConfidence || 1)) * 100}%` }}
                className="bg-amber-500"
                title={`Audio: ${(effectiveAudio * wAudio).toFixed(3)}`}
              ></div>
              <div
                style={{ width: `${(contextScore * wContext / (fusionResult.fusedConfidence || 1)) * 100}%` }}
                className="bg-emerald-500"
                title={`Konteks: ${(contextScore * wContext).toFixed(3)}`}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                <span>Visual: {(effectiveVisual * wVisual).toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Audio: {(effectiveAudio * wAudio).toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Konteks: {(contextScore * wContext).toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Academic Grading Rubric Interactive Panel */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Kalkulator Rubrik Penilaian Capstone Akademik ITERA
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Nilai Total:</span>
                <span className="text-lg font-bold font-mono text-sky-400">{rubricResult.totalScore.toFixed(1)}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  rubricResult.grade === 'A' || rubricResult.grade === 'AB'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  Grade: {rubricResult.grade}
                </span>
              </div>
            </div>

            {/* Rubric Component Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>1. Arsitektur Software (Maks 25)</span>
                  <span className="font-mono text-slate-200">{rubricScores.architecture}/25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.architecture}
                  onChange={(e) => setRubricScores({ ...rubricScores, architecture: Number(e.target.value) })}
                  className="w-full accent-sky-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>2. Implementasi & Efisiensi (Maks 35)</span>
                  <span className="font-mono text-slate-200">{rubricScores.implementation}/35</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  value={rubricScores.implementation}
                  onChange={(e) => setRubricScores({ ...rubricScores, implementation: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>3. Evaluasi Eksperimental (Maks 25)</span>
                  <span className="font-mono text-slate-200">{rubricScores.evaluation}/25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.evaluation}
                  onChange={(e) => setRubricScores({ ...rubricScores, evaluation: Number(e.target.value) })}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>4. Dokumentasi & Reproducibility (Maks 15)</span>
                  <span className="font-mono text-slate-200">{rubricScores.documentation}/15</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={rubricScores.documentation}
                  onChange={(e) => setRubricScores({ ...rubricScores, documentation: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Recommendations if any */}
            {rubricResult.recommendations.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded text-[11px] text-amber-200 space-y-1">
                <span className="font-semibold flex items-center gap-1 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rekomendasi Peningkatan Nilai:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {rubricResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

