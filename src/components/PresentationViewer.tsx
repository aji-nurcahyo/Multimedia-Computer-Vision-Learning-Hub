import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Sun,
  Moon,
  Download,
  Printer,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { SlideData } from '../lib/content';
import { getSlideBodyText, getSlideLeadText } from '../lib/content';
import { renderInlineText } from './MarkdownRenderer';
import { MathView } from './MathView';
import { exportPresentationPptx, exportPresentationPdf } from '../lib/exportService';

export type SlideTheme = 'dark' | 'light';

export function PresentationViewer({
  slides,
  chapterNumber,
  chapterTitle,
}: {
  slides: SlideData[];
  chapterNumber: string;
  chapterTitle: string;
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'pptx' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [slideTheme, setSlideTheme] = useState<SlideTheme>(() => {
    try {
      const saved = localStorage.getItem('slide_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // Inherit from global theme if not explicitly set
      const globalTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
      return globalTheme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides?.length || 0;
  const safeIndex = Math.min(currentSlideIndex, Math.max(0, totalSlides - 1));
  const currentSlide = slides?.[safeIndex] || slides?.[0];

  useEffect(() => {
    setCurrentSlideIndex(0);
    setShowNotes(false);
    setShowExportMenu(false);
    setExportError(null);
  }, [chapterNumber]);

  const handleExportPptx = useCallback(async () => {
    try {
      setExportingFormat('pptx');
      setExportError(null);
      await exportPresentationPptx({
        deckTitle: chapterTitle,
        categoryOrTrack: `Chapter ${chapterNumber}`,
        moduleCode: `Chapter ${chapterNumber}`,
        slides,
        fileName: `chapter-${chapterNumber}-slides.pptx`,
        outputType: 'download'
      });
      setShowExportMenu(false);
    } catch (err: any) {
      console.error('PPTX export error:', err);
      setExportError('Gagal mengekspor PowerPoint: ' + (err?.message || 'Error tidak diketahui'));
    } finally {
      setExportingFormat(null);
    }
  }, [chapterNumber, chapterTitle, slides]);

  const handleExportPdf = useCallback(() => {
    try {
      setExportingFormat('pdf');
      setExportError(null);
      exportPresentationPdf({
        categoryOrTrack: `Chapter ${chapterNumber}`,
        moduleCode: `Chapter ${chapterNumber}`,
        slides,
        fileName: `chapter-${chapterNumber}-slides.pdf`,
        outputType: 'download'
      });
      setShowExportMenu(false);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setExportError('Gagal mengekspor PDF: ' + (err?.message || 'Error tidak diketahui'));
    } finally {
      setExportingFormat(null);
    }
  }, [chapterNumber, slides]);

  const handlePrint = useCallback(() => {
    setShowExportMenu(false);
    window.print();
  }, []);

  const toggleSlideTheme = useCallback(() => {
    setSlideTheme((prev) => {
      const next: SlideTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('slide_theme', next);
      } catch {
        // Ignored if storage is blocked
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.error('Fullscreen toggle error:', e);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleSlideTheme();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, toggleFullscreen, toggleSlideTheme, totalSlides]);

  // Helper to render slide body with math, fenced code, and list parsing
  const renderSlideBody = (body: string) => {
    if (!body) return null;
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const nodes: React.ReactNode[] = [];
    let inCode = false;
    let codeBuf: string[] = [];
    let inMath = false;
    let mathBuf: string[] = [];

    const flushMath = (keyPrefix: string) => {
      if (mathBuf.length > 0) {
        nodes.push(
          <div key={`slide-math-${keyPrefix}`} className="slide-math-block">
            <MathView math={mathBuf.join('\n')} displayMode={true} />
          </div>
        );
        mathBuf = [];
      }
      inMath = false;
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const raw = lines[idx];
      const trimmed = raw.trim();

      if (trimmed.startsWith('```')) {
        if (inMath) flushMath(`${idx}-precode`);
        if (inCode) {
          nodes.push(
            <pre key={`code-${idx}`} className="slide-code-block">
              <code>{codeBuf.join('\n')}</code>
            </pre>
          );
          inCode = false;
          codeBuf = [];
        } else {
          inCode = true;
          codeBuf = [];
        }
        continue;
      }

      if (inCode) {
        codeBuf.push(raw);
        continue;
      }

      // Multi-line display math in slide body
      if (inMath) {
        if (trimmed === '$$') {
          flushMath(`${idx}`);
          continue;
        }
        if (trimmed.endsWith('$$')) {
          const content = trimmed.slice(0, -2).trimEnd();
          if (content) mathBuf.push(content);
          flushMath(`${idx}`);
          continue;
        }
        mathBuf.push(raw);
        continue;
      }

      // Single-line display math ($$...$$)
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
        nodes.push(
          <div key={`math-${idx}`} className="slide-math-block">
            <MathView math={trimmed.slice(2, -2)} displayMode={true} />
          </div>
        );
        continue;
      }

      // Multi-line display math opener ($$)
      if (trimmed === '$$') {
        inMath = true;
        mathBuf = [];
        continue;
      }

      if (trimmed.startsWith('$$')) {
        inMath = true;
        const startText = trimmed.slice(2).trimStart();
        mathBuf = startText ? [startText] : [];
        continue;
      }

      if (!trimmed) {
        nodes.push(<div key={idx} style={{ height: '0.4rem' }} />);
        continue;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const headingText = trimmed.replace(/^#{1,4}\s+/, '');
        nodes.push(
          <h3 key={idx} className="slide-section-heading">
            {renderInlineText(headingText)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        nodes.push(
          <div key={idx} className="slide-list-item">
            <span className="slide-bullet">•</span>
            <div>{renderInlineText(trimmed.slice(2))}</div>
          </div>
        );
        continue;
      }

      const olMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed);
      if (olMatch) {
        nodes.push(
          <div key={idx} className="slide-list-item">
            <span className="slide-bullet" style={{ minWidth: '1.4rem', fontWeight: 700 }}>
              {olMatch[1]}.
            </span>
            <div>{renderInlineText(olMatch[2])}</div>
          </div>
        );
        continue;
      }

      if (trimmed.startsWith('> ')) {
        nodes.push(
          <blockquote key={idx} className="slide-blockquote">
            {renderInlineText(trimmed.slice(2))}
          </blockquote>
        );
        continue;
      }

      nodes.push(
        <p key={idx} className="slide-paragraph">
          {renderInlineText(trimmed)}
        </p>
      );
    }

    if (inMath) flushMath('tail');

    return <div className="slide-body-text">{nodes}</div>;
  };

  if (!slides || slides.length === 0 || !currentSlide) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Slide presentasi untuk Chapter {chapterNumber} belum tersedia.
      </div>
    );
  }

  return (
    <div
      className="presentation-container"
      data-slide-theme={slideTheme}
      ref={containerRef}
      aria-label="Presentation Slide Viewer"
    >
      {/* Top Header with Custom Branding */}
      <div className="presentation-header">
        <div className="presentation-title">
          <span>Multimedia &amp; Computer Vision Learning Hub</span>
          <span className="presentation-title-sep">·</span>
          <span className="presentation-title-chapter">
            Chapter {chapterNumber}: {chapterTitle}
          </span>
        </div>
        <div className="presentation-actions">
          {/* Download & Export Menu Dropdown */}
          <div className="presentation-export-dropdown" style={{ position: 'relative' }}>
            <button
              className={`control-btn ${showExportMenu ? 'active' : ''}`}
              onClick={() => setShowExportMenu((prev) => !prev)}
              title="Unduh Bahan Presentasi (PowerPoint, PDF, Cetak)"
              aria-label="Unduh Bahan Presentasi"
            >
              {exportingFormat ? <Loader2 size={15} className="spin-animate" /> : <Download size={15} />}
              <span>{exportingFormat ? 'Mengekspor...' : 'Unduh'}</span>
            </button>

            {showExportMenu && (
              <div className="presentation-export-menu">
                <button
                  className="export-menu-item"
                  onClick={handleExportPptx}
                  disabled={exportingFormat !== null}
                >
                  <span className="export-menu-icon pptx">PPTX</span>
                  <div>
                    <div className="export-menu-title">Unduh PowerPoint (.pptx)</div>
                    <div className="export-menu-desc">Slide 16:9, teks &amp; bentuk native dapat diedit</div>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={handleExportPdf}
                  disabled={exportingFormat !== null}
                >
                  <span className="export-menu-icon pdf">PDF</span>
                  <div>
                    <div className="export-menu-title">Unduh Slide PDF</div>
                    <div className="export-menu-desc">Format 16:9 siap baca offline &amp; cetak resolusi tinggi</div>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={handlePrint}
                >
                  <span className="export-menu-icon print">
                    <Printer size={14} />
                  </span>
                  <div>
                    <div className="export-menu-title">Cetak Slide (Print / Save as PDF)</div>
                    <div className="export-menu-desc">Menggunakan dialog cetak peramban bawaan</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            className="control-btn"
            onClick={toggleSlideTheme}
            title={`Ubah Tema Slide (T) - Mode saat ini: ${slideTheme === 'dark' ? 'Dark' : 'Light'}`}
            aria-label={`Ubah Tema Slide ke ${slideTheme === 'dark' ? 'Light' : 'Dark'}`}
          >
            {slideTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{slideTheme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button
            className="control-btn"
            onClick={() => setShowHelp((prev) => !prev)}
            title="Bantuan Navigasi (?)"
            aria-label="Bantuan Navigasi"
          >
            <HelpCircle size={15} />
            <span>Bantuan</span>
          </button>
          <button
            className={`control-btn ${showNotes ? 'active' : ''}`}
            onClick={() => setShowNotes((prev) => !prev)}
            title="Catatan Presenter (N)"
            aria-label="Catatan Presenter"
          >
            <FileText size={15} />
            <span>Catatan</span>
          </button>
          <button
            className="control-btn"
            onClick={toggleFullscreen}
            title="Layar Penuh (F)"
            aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Keluar' : 'Layar Penuh'}</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="presentation-export-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{exportError}</span>
          <button onClick={() => setExportError(null)} className="error-dismiss-btn">✕</button>
        </div>
      )}

      {/* Main 16:9 Presentation Canvas */}
      <div className="presentation-screen">
        <div className="slide-content-area">
          <h2 className="slide-title">{currentSlide.title}</h2>
          {getSlideLeadText(currentSlide) && (
            <p className="slide-lead">{getSlideLeadText(currentSlide)}</p>
          )}
          {renderSlideBody(getSlideBodyText(currentSlide))}
          {currentSlide.diagram && (
            <div className="slide-diagram-wrapper" style={{ margin: '1rem 0', textAlign: 'center' }}>
              <img
                src={currentSlide.diagram}
                alt={currentSlide.title}
                style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Custom Academic Footer (Strictly ITERA & Course Author - NO Reveal.js branding) */}
        <div className="presentation-footer">
          <div className="presentation-branding">
            Institut Teknologi Sumatera (ITERA) · Aji Pamungkas Tri Nurcahyo
          </div>
          <div className="presentation-counter-footer">
            Slide {safeIndex + 1} / {totalSlides}
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="presentation-controls-bar">
        <button
          className="control-btn"
          onClick={handlePrev}
          disabled={safeIndex === 0}
          aria-label="Slide Sebelumnya"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <div className="slide-counter">
          {safeIndex + 1} dari {totalSlides}
        </div>

        <button
          className="control-btn"
          onClick={handleNext}
          disabled={safeIndex === totalSlides - 1}
          aria-label="Slide Berikutnya"
        >
          <span>Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Presenter Notes */}
      {showNotes && (
        <div className="notes-drawer">
          <strong>
            Catatan Presenter (Slide {safeIndex + 1}):
          </strong>
          <p>{currentSlide.notes || 'Tidak ada catatan tambahan untuk slide ini.'}</p>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {showHelp && (
        <div className="presentation-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="presentation-help-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Pintasan Keyboard Presentasi</h3>
            <ul>
              <li>
                <kbd>→</kbd> atau <kbd>Spasi</kbd> : Slide berikutnya
              </li>
              <li>
                <kbd>←</kbd> : Slide sebelumnya
              </li>
              <li>
                <kbd>T</kbd> : Ubah Tema (Light / Dark)
              </li>
              <li>
                <kbd>F</kbd> : Layar penuh (Fullscreen)
              </li>
              <li>
                <kbd>N</kbd> : Buka/Tutup Catatan presenter
              </li>
              <li>
                <kbd>?</kbd> / <kbd>H</kbd> : Panduan pintasan ini
              </li>
              <li>
                <kbd>Home</kbd> / <kbd>End</kbd> : Lompat ke Slide Awal / Akhir
              </li>
            </ul>
            <button
              className="control-btn modal-close-btn"
              onClick={() => setShowHelp(false)}
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
