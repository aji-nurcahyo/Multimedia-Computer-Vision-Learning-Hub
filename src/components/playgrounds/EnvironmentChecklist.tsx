import { useState } from 'react';
import { CheckCircle2, Circle, Terminal, Copy, Check } from 'lucide-react';

export function EnvironmentChecklist() {
  const [os, setOs] = useState<'windows' | 'posix'>('windows');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Verifikasi Instalasi Python 64-Bit',
      desc: 'Pastikan Python 3.10 atau lebih baru telah terinstal dan terdaftar pada PATH terminal.',
      cmd: os === 'windows' ? 'python --version' : 'python3 --version',
    },
    {
      id: 2,
      title: 'Pembuatan Virtual Environment Lokal',
      desc: 'Buat folder isolasi dependensi .venv di dalam direktori kerja proyek Anda.',
      cmd: os === 'windows' ? 'python -m venv .venv' : 'python3 -m venv .venv',
    },
    {
      id: 3,
      title: 'Aktivasi Virtual Environment',
      desc: 'Aktifkan lingkungan virtual terisolasi sebelum melakukan instalasi pustaka apapun.',
      cmd:
        os === 'windows'
          ? 'Set-ExecutionPolicy -Scope Process RemoteSigned\n.venv\\Scripts\\Activate.ps1'
          : 'source .venv/bin/activate',
    },
    {
      id: 4,
      title: 'Perbarui Pip & Instal Pustaka Multimedia Inti',
      desc: 'Instal paket NumPy, Matplotlib, OpenCV, SciPy, Pillow, dan SoundFile.',
      cmd: 'python -m pip install --upgrade pip\npip install numpy matplotlib opencv-python pillow scipy soundfile',
    },
    {
      id: 5,
      title: 'Kunci Dependensi ke requirements.txt',
      desc: 'Bekukan daftar versi paket terpasang agar lingkungan dapat direproduksi secara identik.',
      cmd: 'pip freeze > requirements.txt',
    },
  ];

  const totalDone = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((totalDone / steps.length) * 100);

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Environment Setup Checklist (Chapter 04)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Wizard interaktif langkah demi langkah penyiapan lingkungan pengembangan multimedia Python.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            onClick={() => setOs('windows')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: os === 'windows' ? 'var(--primary)' : 'transparent',
              color: os === 'windows' ? 'var(--on-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Windows (PowerShell)
          </button>
          <button
            onClick={() => setOs('posix')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: os === 'posix' ? 'var(--primary)' : 'transparent',
              color: os === 'posix' ? 'var(--on-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Linux / macOS (Bash)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Kemajuan Penyiapan: {totalDone} dari {steps.length} Langkah Selesai</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((st, i) => {
          const isDone = Boolean(completedSteps[st.id]);

          return (
            <div
              key={st.id}
              style={{
                border: `1px solid ${isDone ? 'var(--accent)' : 'var(--border)'}`,
                background: isDone ? 'rgba(52, 211, 153, 0.05)' : 'var(--bg-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => toggleStep(st.id)}>
                  {isDone ? <CheckCircle2 size={22} color="var(--accent)" /> : <Circle size={22} color="var(--text-dim)" />}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDone ? 'var(--accent)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      Langkah {st.id}: {st.title}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{st.desc}</p>
                  </div>
                </div>

                <button
                  className="control-btn"
                  onClick={() => copyToClipboard(st.cmd, i)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  title="Salin perintah terminal"
                >
                  {copiedIndex === i ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  <span>{copiedIndex === i ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              {/* Terminal Code Box */}
              <div
                style={{
                  background: '#020617',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: '#38bdf8',
                  overflowX: 'auto',
                }}
              >
                <Terminal size={14} color="#64748b" />
                <span style={{ whiteSpace: 'pre-wrap' }}>{st.cmd}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
