import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, Activity } from 'lucide-react';

export function AudioProcessingLab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [frequency, setFrequency] = useState(440);
  const [filterCutoff, setFilterCutoff] = useState(1200);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const startAudio = () => {
    if (isPlaying) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscRef.current = osc;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);
    filterRef.current = filter;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyserRef.current = analyser;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    osc.start();
    setIsPlaying(true);
  };

  const stopAudio = useCallback(() => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.type = waveType;
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
    if (filterRef.current && audioCtxRef.current) {
      filterRef.current.frequency.setValueAtTime(filterCutoff, audioCtxRef.current.currentTime);
    }
  }, [waveType, frequency, filterCutoff]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopAudio]);

  // Oscilloscope drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();

        const sliceWidth = (w * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();
      } else {
        // Flat center line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Digital Audio &amp; Spectral Analysis Lab
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Eksperimen sintesis gelombang audio, pemfilteran sinyal analog/digital, dan visualisasi osiloskop real-time.
          </p>
        </div>
        <button
          className="control-btn"
          onClick={isPlaying ? stopAudio : startAudio}
          style={{ background: isPlaying ? '#ef4444' : '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem' }}
        >
          {isPlaying ? <Square size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Hentikan Audio' : 'Mulai Sintesis'}</span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Bentuk Gelombang (Oscillator)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={waveType}
            onChange={(e) => setWaveType(e.target.value as OscillatorType)}
          >
            <option value="sine">Sinusoidal (Sine)</option>
            <option value="square">Kotak (Square - Harmonic Rich)</option>
            <option value="sawtooth">Gigi Gergaji (Sawtooth)</option>
            <option value="triangle">Segitiga (Triangle)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Frekuensi Nada: {frequency} Hz
          </label>
          <input
            type="range"
            min="100"
            max="1200"
            step="10"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Lowpass Filter Cutoff: {filterCutoff} Hz
          </label>
          <input
            type="range"
            min="200"
            max="4000"
            step="50"
            value={filterCutoff}
            onChange={(e) => setFilterCutoff(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>
      </div>

      <div className="canvas-panel" style={{ margin: '0 auto', maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#38bdf8' }}>
          <Activity size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tampilan Gelombang Spasial (Time-Domain Oscilloscope)</span>
        </div>
        <canvas ref={canvasRef} width={640} height={180} />
      </div>
    </div>
  );
}

