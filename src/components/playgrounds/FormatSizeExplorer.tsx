import { useState } from 'react';

export function FormatSizeExplorer() {
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video'>('image');

  // Image parameters
  const [imgWidth, setImgWidth] = useState(1920);
  const [imgHeight, setImgHeight] = useState(1080);
  const [imgChannels, setImgChannels] = useState(3); // 1 = gray, 3 = rgb, 4 = rgba

  // Audio parameters
  const [audioSampleRate, setAudioSampleRate] = useState(44100);
  const [audioChannels, setAudioChannels] = useState(2); // 1 = mono, 2 = stereo
  const [audioDuration, setAudioDuration] = useState(180); // sec
  const [audioBitDepth, setAudioBitDepth] = useState(16); // bits

  // Video parameters
  const [videoWidth, setVideoWidth] = useState(1920);
  const [videoHeight, setVideoHeight] = useState(1080);
  const [videoFps, setVideoFps] = useState(30);
  const [videoDuration, setVideoDuration] = useState(60); // sec

  // Computations
  // Image
  const imgRawBytes = imgWidth * imgHeight * imgChannels * 1; // 8-bit per channel
  const imgRawMb = (imgRawBytes / (1024 * 1024)).toFixed(2);
  const imgPngMb = (imgRawBytes * 0.55 / (1024 * 1024)).toFixed(2); // ~45% reduction
  const imgJpegMb = (imgRawBytes * 0.08 / (1024 * 1024)).toFixed(2); // ~92% reduction (12:1)
  const imgWebpMb = (imgRawBytes * 0.05 / (1024 * 1024)).toFixed(2); // ~95% reduction (20:1)

  // Audio
  const audioRawBytes = audioSampleRate * audioChannels * (audioBitDepth / 8) * audioDuration;
  const audioRawMb = (audioRawBytes / (1024 * 1024)).toFixed(2);
  const audioFlacMb = (audioRawBytes * 0.55 / (1024 * 1024)).toFixed(2); // ~45% reduction
  const audioMp3Mb = ((128 * 1000 / 8 * audioDuration) / (1024 * 1024)).toFixed(2); // 128 kbps

  // Video
  const videoRawBytes = videoWidth * videoHeight * 3 * videoFps * videoDuration;
  const videoRawGb = (videoRawBytes / (1024 * 1024 * 1024)).toFixed(2);
  const videoRawBitrateGbps = ((videoWidth * videoHeight * 3 * videoFps * 8) / 1e9).toFixed(2);
  // Typical compressed streaming bitrates
  const videoH264Mb = ((8 * 1e6 / 8 * videoDuration) / (1024 * 1024)).toFixed(1); // 8 Mbps
  const videoAv1Mb = ((4.5 * 1e6 / 8 * videoDuration) / (1024 * 1024)).toFixed(1); // 4.5 Mbps

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            Multimedia Format &amp; File Size Explorer (Chapter 03)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Kalkulator estimasi footprint memori data mentah vs terkompresi untuk berbagai format media digital.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['image', 'audio', 'video'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMediaType(m)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid var(--border)',
                background: mediaType === m ? 'var(--primary)' : 'var(--bg-subtle)',
                color: mediaType === m ? '#090d16' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* PARAMETERS FORM */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        {mediaType === 'image' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Preset Resolusi Citra</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number);
                  setImgWidth(w);
                  setImgHeight(h);
                }}
              >
                <option value="1920x1080">Full HD (1920 × 1080)</option>
                <option value="3840x2160">4K UHD (3840 × 2160)</option>
                <option value="1280x720">HD Ready (1280 × 720)</option>
                <option value="512x512">Dataset Standar (512 × 512)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Saluran Warna (Channels)</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={imgChannels}
                onChange={(e) => setImgChannels(Number(e.target.value))}
              >
                <option value={1}>1 Saluran (Grayscale 8-bit)</option>
                <option value={3}>3 Saluran (RGB TrueColor 24-bit)</option>
                <option value={4}>4 Saluran (RGBA + Transparansi 32-bit)</option>
              </select>
            </div>
          </>
        )}

        {mediaType === 'audio' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Laju Sampel (Sample Rate)</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={audioSampleRate}
                onChange={(e) => setAudioSampleRate(Number(e.target.value))}
              >
                <option value={44100}>44.1 kHz (Standar CD Audio)</option>
                <option value={48000}>48.0 kHz (Standar Video Broadcast)</option>
                <option value={16000}>16.0 kHz (Pengenalan Wicara ASR)</option>
                <option value={8000}>8.0 kHz (Telepon Standar)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Durasi: {audioDuration} Detik ({Math.floor(audioDuration / 60)}m {audioDuration % 60}s)</label>
              <input
                type="range"
                min="10"
                max="600"
                step="10"
                value={audioDuration}
                onChange={(e) => setAudioDuration(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Jumlah Saluran</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={audioChannels}
                onChange={(e) => setAudioChannels(Number(e.target.value))}
              >
                <option value={1}>Mono (1 Kanal)</option>
                <option value={2}>Stereo (2 Kanal)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kedalaman Bit (Bit Depth)</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={audioBitDepth}
                onChange={(e) => setAudioBitDepth(Number(e.target.value))}
              >
                <option value={16}>16-bit PCM (CD Standard)</option>
                <option value={24}>24-bit Hi-Res Studio</option>
                <option value={32}>32-bit Float Audio</option>
              </select>
            </div>
          </>
        )}

        {mediaType === 'video' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Preset Resolusi Video</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number);
                  setVideoWidth(w);
                  setVideoHeight(h);
                }}
              >
                <option value="1920x1080">1080p Full HD (1920 × 1080)</option>
                <option value="3840x2160">4K Ultra HD (3840 × 2160)</option>
                <option value="1280x720">720p HD (1280 × 720)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kecepatan Frame (FPS)</label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={videoFps}
                onChange={(e) => setVideoFps(Number(e.target.value))}
              >
                <option value={24}>24 FPS (Sinematik Film)</option>
                <option value={30}>30 FPS (Standar Video)</option>
                <option value={60}>60 FPS (High Frame Rate)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Durasi: {videoDuration} Detik</label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={videoDuration}
                onChange={(e) => setVideoDuration(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </div>

      {/* COMPARISON CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {mediaType === 'image' && (
          <>
            <div className="card" style={{ borderLeft: '4px solid var(--text-dim)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>RAW / Tak Terkompresi</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: '0.2rem 0' }}>{imgRawMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matriks RAM W×H×C murni</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>PNG (Lossless DEFLATE)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', margin: '0.2rem 0' }}>~{imgPngMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fidelity 100% + Transparansi</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>JPEG (Lossy DCT)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>~{imgJpegMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rasio ~12:1 (Hemat 92%)</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>WebP / AVIF (Next-Gen)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', margin: '0.2rem 0' }}>~{imgWebpMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rasio ~20:1 (Hemat 95%)</div>
            </div>
          </>
        )}

        {mediaType === 'audio' && (
          <>
            <div className="card" style={{ borderLeft: '4px solid var(--text-dim)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>WAV (Uncompressed PCM)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: '0.2rem 0' }}>{audioRawMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bitstream rekaman studio murni</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>FLAC (Lossless)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', margin: '0.2rem 0' }}>~{audioFlacMb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hemat ~45% tanpa distorsi bit</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>MP3 / AAC (128 kbps)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>~{audioMp3Mb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model psikoakustik pendengaran</div>
            </div>
          </>
        )}

        {mediaType === 'video' && (
          <>
            <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>Video Mentah Tak Terkompresi</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', margin: '0.2rem 0' }}>{videoRawGb} GB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bandwidth: {videoRawBitrateGbps} Gbps!</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>H.264 / MP4 (8 Mbps)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>~{videoH264Mb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rasio ~300:1 (Standar YouTube/Web)</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #34d399' }}>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>AV1 / WebM (4.5 Mbps)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>~{videoAv1Mb} MB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hemat 40% bandwidth dibanding H.264</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
