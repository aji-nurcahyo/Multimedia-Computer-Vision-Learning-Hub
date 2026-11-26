import React, { useState } from 'react';
import {
  FileText,
  Download,
  Code2,
  BookMarked,
  Printer,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  downloadChapterPptx,
  downloadChapterPresentationPdf,
  downloadChapterCompletePdf,
  downloadChapterPythonCode,
  downloadChapterLabNotebook,
  downloadAdvancedPptx,
  downloadAdvancedPresentationPdf,
  downloadAdvancedCompletePdf,
  downloadAdvancedPythonCode,
  downloadAdvancedLabNotebook,
  downloadResearchGuidePdf,
  downloadResearchPythonCode,
  downloadResearchBaselineNotebook
} from '../lib/exportService';

export interface AcademicExportToolbarProps {
  type: 'chapter' | 'advanced' | 'research';
  id: string; // '10', 'adv-01', 'r01'
  title: string;
  className?: string;
  compact?: boolean;
}

export const AcademicExportToolbar: React.FC<AcademicExportToolbarProps> = ({
  type,
  id,
  title,
  className = '',
  compact = false
}) => {
  const [exportingTarget, setExportingTarget] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handlers for Chapter
  const handleChapterPptx = async () => {
    try {
      setExportingTarget('pptx');
      setErrorMsg(null);
      await downloadChapterPptx(id);
      showToast('PowerPoint (.pptx) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh PowerPoint: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleChapterSlidePdf = () => {
    try {
      setExportingTarget('slide-pdf');
      setErrorMsg(null);
      downloadChapterPresentationPdf(id);
      showToast('Slide PDF (16:9) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Slide PDF: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleChapterCompletePdf = () => {
    try {
      setExportingTarget('doc-pdf');
      setErrorMsg(null);
      downloadChapterCompletePdf(id);
      showToast('Materi Lengkap PDF berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Materi PDF: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleChapterPython = () => {
    try {
      setExportingTarget('py');
      setErrorMsg(null);
      downloadChapterPythonCode(id);
      showToast('Python Script (.py) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Python script: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleChapterNotebook = () => {
    try {
      setExportingTarget('ipynb');
      setErrorMsg(null);
      downloadChapterLabNotebook(id);
      showToast('Jupyter Notebook (.ipynb) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Jupyter Notebook: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  // Handlers for Advanced Modules
  const handleAdvancedPptx = async () => {
    try {
      setExportingTarget('pptx');
      setErrorMsg(null);
      await downloadAdvancedPptx(id);
      showToast('PowerPoint (.pptx) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh PowerPoint: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleAdvancedSlidePdf = () => {
    try {
      setExportingTarget('slide-pdf');
      setErrorMsg(null);
      downloadAdvancedPresentationPdf(id);
      showToast('Slide PDF (16:9) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Slide PDF: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleAdvancedCompletePdf = () => {
    try {
      setExportingTarget('doc-pdf');
      setErrorMsg(null);
      downloadAdvancedCompletePdf(id);
      showToast('Materi Lengkap PDF berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Materi PDF: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleAdvancedPython = () => {
    try {
      setExportingTarget('py');
      setErrorMsg(null);
      downloadAdvancedPythonCode(id);
      showToast('Python Script (.py) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Python script: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleAdvancedNotebook = () => {
    try {
      setExportingTarget('ipynb');
      setErrorMsg(null);
      downloadAdvancedLabNotebook(id);
      showToast('Jupyter Notebook (.ipynb) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Jupyter Notebook: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  // Handlers for Research Tracks
  const handleResearchGuidePdf = () => {
    try {
      setExportingTarget('doc-pdf');
      setErrorMsg(null);
      downloadResearchGuidePdf(id);
      showToast('Panduan Riset PDF berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Panduan Riset: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleResearchPython = () => {
    try {
      setExportingTarget('py');
      setErrorMsg(null);
      downloadResearchPythonCode(id);
      showToast('Python Baseline (.py) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Python baseline: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handleResearchNotebook = () => {
    try {
      setExportingTarget('ipynb');
      setErrorMsg(null);
      downloadResearchBaselineNotebook(id);
      showToast('Research Notebook (.ipynb) berhasil diunduh');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Gagal mengunduh Research Notebook: ' + (e?.message || 'Error'));
    } finally {
      setExportingTarget(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`academic-export-toolbar ${compact ? 'compact' : ''} ${className}`}>
      <div className="academic-export-toolbar-header" title={`Bahan pembelajaran: ${title}`}>
        <span className="academic-export-label">
          <Download size={14} /> Unduh Bahan Pembelajaran
        </span>
        {toastMsg && (
          <span className="academic-export-toast">
            <CheckCircle2 size={13} /> {toastMsg}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="academic-export-error">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="error-dismiss-btn">✕</button>
        </div>
      )}

      <div className="academic-export-actions">
        {/* 1. Complete PDF Document */}
        {type === 'chapter' && (
          <button
            className="academic-export-btn primary"
            onClick={handleChapterCompletePdf}
            disabled={exportingTarget !== null}
            title={`Unduh materi lengkap teks bacaan Chapter ${id} (Format PDF)`}
          >
            {exportingTarget === 'doc-pdf' ? <Loader2 size={13} className="spin-animate" /> : <FileText size={13} />}
            <span>Unduh Materi (PDF)</span>
          </button>
        )}
        {type === 'advanced' && (
          <button
            className="academic-export-btn primary"
            onClick={handleAdvancedCompletePdf}
            disabled={exportingTarget !== null}
            title={`Unduh materi modul lengkap ${id.toUpperCase()} (Format PDF)`}
          >
            {exportingTarget === 'doc-pdf' ? <Loader2 size={13} className="spin-animate" /> : <FileText size={13} />}
            <span>Unduh Materi (PDF)</span>
          </button>
        )}
        {type === 'research' && (
          <button
            className="academic-export-btn primary"
            onClick={handleResearchGuidePdf}
            disabled={exportingTarget !== null}
            title={`Unduh panduan alur kerja riset ${id.toUpperCase()} (Format PDF)`}
          >
            {exportingTarget === 'doc-pdf' ? <Loader2 size={13} className="spin-animate" /> : <FileText size={13} />}
            <span>Unduh Panduan Riset (PDF)</span>
          </button>
        )}

        {/* 2. Slide PowerPoint (.pptx) - Only for Core & Advanced */}
        {type === 'chapter' && (
          <button
            className="academic-export-btn pptx"
            onClick={handleChapterPptx}
            disabled={exportingTarget !== null}
            title={`Unduh slide presentasi Chapter ${id} dalam format Microsoft PowerPoint (.pptx) yang dapat diedit`}
          >
            {exportingTarget === 'pptx' ? <Loader2 size={13} className="spin-animate" /> : <Download size={13} />}
            <span>Unduh Slide (.pptx)</span>
          </button>
        )}
        {type === 'advanced' && (
          <button
            className="academic-export-btn pptx"
            onClick={handleAdvancedPptx}
            disabled={exportingTarget !== null}
            title={`Unduh slide presentasi ${id.toUpperCase()} dalam format PowerPoint (.pptx) yang dapat diedit`}
          >
            {exportingTarget === 'pptx' ? <Loader2 size={13} className="spin-animate" /> : <Download size={13} />}
            <span>Unduh Slide (.pptx)</span>
          </button>
        )}

        {/* 3. Slide PDF (16:9 Widescreen) - Only for Core & Advanced */}
        {type === 'chapter' && (
          <button
            className="academic-export-btn"
            onClick={handleChapterSlidePdf}
            disabled={exportingTarget !== null}
            title={`Unduh deck slide presentasi Chapter ${id} (Format PDF 16:9)`}
          >
            {exportingTarget === 'slide-pdf' ? <Loader2 size={13} className="spin-animate" /> : <FileText size={13} />}
            <span>Slide PDF (16:9)</span>
          </button>
        )}
        {type === 'advanced' && (
          <button
            className="academic-export-btn"
            onClick={handleAdvancedSlidePdf}
            disabled={exportingTarget !== null}
            title={`Unduh deck slide presentasi ${id.toUpperCase()} (Format PDF 16:9)`}
          >
            {exportingTarget === 'slide-pdf' ? <Loader2 size={13} className="spin-animate" /> : <FileText size={13} />}
            <span>Slide PDF (16:9)</span>
          </button>
        )}

        {/* 4. Python Code (.py) */}
        {type === 'chapter' && (
          <button
            className="academic-export-btn code"
            onClick={handleChapterPython}
            disabled={exportingTarget !== null}
            title={`Unduh skrip Python praktik mandiri Chapter ${id} (.py)`}
          >
            {exportingTarget === 'py' ? <Loader2 size={13} className="spin-animate" /> : <Code2 size={13} />}
            <span>Python Script (.py)</span>
          </button>
        )}
        {type === 'advanced' && (
          <button
            className="academic-export-btn code"
            onClick={handleAdvancedPython}
            disabled={exportingTarget !== null}
            title={`Unduh implementasi algoritma Python ${id.toUpperCase()} (.py)`}
          >
            {exportingTarget === 'py' ? <Loader2 size={13} className="spin-animate" /> : <Code2 size={13} />}
            <span>Python Script (.py)</span>
          </button>
        )}
        {type === 'research' && (
          <button
            className="academic-export-btn code"
            onClick={handleResearchPython}
            disabled={exportingTarget !== null}
            title={`Unduh skrip Python baseline eksperimen ${id.toUpperCase()} (.py)`}
          >
            {exportingTarget === 'py' ? <Loader2 size={13} className="spin-animate" /> : <Code2 size={13} />}
            <span>Python Baseline (.py)</span>
          </button>
        )}

        {/* 5. Jupyter Notebook (.ipynb) - Expose only where actual notebook asset exists */}
        {type === 'chapter' && parseInt(id, 10) >= 36 && (
          <button
            className="academic-export-btn notebook"
            onClick={handleChapterNotebook}
            disabled={exportingTarget !== null}
            title={`Unduh laboratorium interaktif Jupyter Notebook Chapter ${id} (.ipynb)`}
          >
            {exportingTarget === 'ipynb' ? <Loader2 size={13} className="spin-animate" /> : <BookMarked size={13} />}
            <span>Notebook (.ipynb)</span>
          </button>
        )}
        {type === 'advanced' && (
          <button
            className="academic-export-btn notebook"
            onClick={handleAdvancedNotebook}
            disabled={exportingTarget !== null}
            title={`Unduh notebook laboratorium riset tingkat lanjut ${id.toUpperCase()} (.ipynb)`}
          >
            {exportingTarget === 'ipynb' ? <Loader2 size={13} className="spin-animate" /> : <BookMarked size={13} />}
            <span>Notebook (.ipynb)</span>
          </button>
        )}
        {type === 'research' && (
          <button
            className="academic-export-btn notebook"
            onClick={handleResearchNotebook}
            disabled={exportingTarget !== null}
            title={`Unduh notebook protokol riset terpandu ${id.toUpperCase()} (.ipynb)`}
          >
            {exportingTarget === 'ipynb' ? <Loader2 size={13} className="spin-animate" /> : <BookMarked size={13} />}
            <span>Notebook (.ipynb)</span>
          </button>
        )}

        {/* 6. Print / Browser PDF */}
        <button
          className="academic-export-btn print"
          onClick={handlePrint}
          title="Buka dialog cetak peramban untuk mencetak atau menyimpan sebagai PDF"
        >
          <Printer size={13} />
          <span>Cetak</span>
        </button>
      </div>
    </div>
  );
};
