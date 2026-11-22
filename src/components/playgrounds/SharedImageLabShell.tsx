import type { ReactNode, RefObject } from 'react';
import { Upload, RefreshCw, Download, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface SharedImageLabShellProps {
  title: string;
  subtitle: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetAll: () => void;
  onDownload?: () => void;
  errorMsg: string | null;
  isLoading: boolean;
  sourceLabel?: string;
  imageDims?: { w: number; h: number };
  implementationNote: string;
  children: ReactNode;
}

export function SharedImageLabShell({
  title,
  subtitle,
  fileInputRef,
  onFileUpload,
  onResetAll,
  onDownload,
  errorMsg,
  isLoading,
  sourceLabel,
  imageDims,
  implementationNote,
  children,
}: SharedImageLabShellProps) {
  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{subtitle}</p>
          {imageDims && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
              Sumber aktif: <strong>{sourceLabel || 'Sintetis'}</strong> · Dimensi: <strong>{imageDims.w} × {imageDims.h} px</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {isLoading && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--primary)' }}>
              <Loader2 size={14} className="spin" />
              Memproses...
            </span>
          )}
          <button
            type="button"
            className="control-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Unggah citra (PNG, JPG, WebP, BMP)"
          >
            <Upload size={14} />
            <span>Unggah Citra</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
            style={{ display: 'none' }}
          />
          <button type="button" className="control-btn" onClick={onResetAll} title="Kembalikan citra dan parameter awal">
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
          {onDownload && (
            <button
              type="button"
              className="control-btn"
              onClick={onDownload}
              style={{
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                borderColor: 'var(--primary)',
                fontWeight: 600,
              }}
              title="Unduh citra hasil pemrosesan (PNG)"
            >
              <Download size={14} />
              <span>Unduh PNG</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {children}

      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          borderLeft: '3px solid var(--primary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text)' }}>Catatan Komputasi Browser vs Python/OpenCV:</strong>{' '}
          {implementationNote}
        </div>
      </div>
    </div>
  );
}

