import React, { useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Layers,
  FileText,
  Target,
  Compass,
  RotateCcw,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import {
  researchTracks,
  getResearchText,
  getResearchTrackById,
  type ResearchTrack,
} from '../lib/advancedContent';
import { MarkdownRenderer } from './MarkdownRenderer';
import { R01DetectionResearchLab } from './playgrounds/R01DetectionResearchLab';
import { R02TrackingResearchLab } from './playgrounds/R02TrackingResearchLab';
import { R03AdversePerceptionLab } from './playgrounds/R03AdversePerceptionLab';
import { R04MultimodalFusionLab } from './playgrounds/R04MultimodalFusionLab';
import { R05EdgeBenchmarkLab } from './playgrounds/R05EdgeBenchmarkLab';
import { R06SpatialVisionLab } from './playgrounds/R06SpatialVisionLab';
import { RESEARCH_METHODOLOGY_STAGES } from '../data/researchMethodology';
import { RESEARCH_BENCHMARK_PROTOCOLS, type BenchmarkProtocol } from '../data/researchBenchmarkProtocols';

interface ResearchTracksViewProps {
  activeTrackId?: string | null;
  onSelectTrack?: (trackId: string | null) => void;
  onSelectCoreChapter: (chapterId: string) => void;
  onNavigateToAdvanced: (moduleId?: string) => void;
}

type TrackWorkspaceTab = 'curriculum' | 'lab' | 'workflow' | 'protocols' | 'templates';

export const ResearchTracksView: React.FC<ResearchTracksViewProps> = ({
  activeTrackId: propActiveTrackId,
  onSelectTrack: propOnSelectTrack,
  onSelectCoreChapter,
  onNavigateToAdvanced,
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const currentTrackId = propActiveTrackId !== undefined ? propActiveTrackId : internalActiveId;

  const handleSelectTrack = (id: string | null) => {
    if (propOnSelectTrack) {
      propOnSelectTrack(id);
    } else {
      setInternalActiveId(id);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainSection, setActiveMainSection] = useState<'tracks' | 'methodology' | 'protocols' | 'templates'>('tracks');
  const [activeTab, setActiveTab] = useState<TrackWorkspaceTab>('curriculum');

  // Methodology state
  const [selectedMethodologyCat, setSelectedMethodologyCat] = useState<string>('all');

  const RESEARCH_TEMPLATES = [
    { id: '01', title: '01. Proposal Riset Ilmiah', file: '01-research-proposal-template.md', desc: 'Format pengajuan proposal penelitian formal memuat latar belakang, SOTA gap, dan hipotesis falsifiable.' },
    { id: '02', title: '02. Audit Provenansi Dataset', file: '02-dataset-documentation-template.md', desc: 'Lembar audit lisensi, sensor akuisisi, pemisahan kanonikal bebas data leakage, dan persetujuan privasi.' },
    { id: '03', title: '03. Manifest Eksperimen Terstruktur', file: '03-experiment-manifest-template.json', desc: 'Skema JSON mesin-terbaca mencatat hyperparameter, random seeds, dependensi, dan metrik multi-seed.' },
    { id: '04', title: '04. Protokol Reproduksi Baseline', file: '04-baseline-reproduction-protocol.md', desc: 'Pedoman replikasi komputasi deterministik baseline SOTA dengan toleransi galat relatif <= 0.5%.' },
    { id: '05', title: '05. Standar Desain Studi Ablasi', file: '05-ablation-study-template.md', desc: 'Matriks ablasi One-Factor-at-a-Time (OFAT) dengan akuntansi biaya komputasi (parameter, FLOPs, latensi).' },
    { id: '06', title: '06. Pelaporan Hasil Kuantitatif', file: '06-quantitative-results-template.md', desc: 'Format tabel komparasi utama berstandar CVPR/ICCV dengan tanda tebal (best) dan miring (second-best).' },
    { id: '07', title: '07. Taksonomi Diagnostik Galat', file: '07-error-analysis-taxonomy.md', desc: 'Klasifikasi kegagalan model berbasis framework TIDE: lokalisasi, klasifikasi, background FP, dan miss.' },
    { id: '08', title: '08. Pelaporan Rigor Statistik', file: '08-statistical-reporting-template.md', desc: 'Format pelaporan multi-seed N >= 3, mean +/- std, bootstrap 95% CI, dan paired Student t-test.' },
    { id: '09', title: '09. Daftar Periksa Keterulangan', file: '09-reproducibility-checklist.md', desc: 'Checklist 24-poin keterulangan naskah ilmiah memenuhi standar NeurIPS/CVPR reproducibility guidelines.' },
    { id: '10', title: '10. Draf Naskah Artikel Ilmiah', file: '10-scientific-report-paper-template.md', desc: 'Struktur naskah konferensi IEEE/CVF lengkap dari Abstrak, Metodologi, hingga Analisis Diskusi Batasan.' },
  ];

  const filteredTracks = researchTracks.filter((track) => {
    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      track.code.toLowerCase().includes(query) ||
      track.title.toLowerCase().includes(query) ||
      track.subtitle.toLowerCase().includes(query) ||
      track.description.toLowerCase().includes(query) ||
      track.primaryBenchmark.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredMethodology = RESEARCH_METHODOLOGY_STAGES.filter((st) => {
    return selectedMethodologyCat === 'all' || st.category === selectedMethodologyCat;
  });

  const getProtocolForTrack = (trackCode: string): BenchmarkProtocol | undefined => {
    return RESEARCH_BENCHMARK_PROTOCOLS.find((p) => p.trackCode === trackCode);
  };

  const renderResearchLab = (trackId: string) => {
    switch (trackId) {
      case 'r01':
        return <R01DetectionResearchLab />;
      case 'r02':
        return <R02TrackingResearchLab />;
      case 'r03':
        return <R03AdversePerceptionLab />;
      case 'r04':
        return <R04MultimodalFusionLab />;
      case 'r05':
        return <R05EdgeBenchmarkLab />;
      case 'r06':
        return <R06SpatialVisionLab />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Laboratorium riset interaktif untuk track ini sedang direncanakan (Planned).
          </div>
        );
    }
  };

  // =========================================================================
  // VIEW MODE A: FOCUSED ACADEMIC WORKSPACE
  // =========================================================================
  const currentTrack = currentTrackId ? getResearchTrackById(currentTrackId) : null;

  if (currentTrack) {
    const curriculumContent = getResearchText(currentTrack.id, 'index.md');
    const trackProtocol = getProtocolForTrack(currentTrack.code);

    return (
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {/* Workspace Topbar */}
        <div className="academic-workspace-topbar">
          <div className="academic-workspace-topbar-left">
            <button
              onClick={() => handleSelectTrack(null)}
              className="academic-workspace-back-btn"
              title="Kembali ke Katalog Track Riset"
            >
              <ArrowLeft size={16} />
              <span>Katalog Riset</span>
            </button>
            <div className="academic-workspace-divider" />
            <div className="academic-workspace-info">
              <span className="academic-workspace-badge">{currentTrack.code}</span>
              <h2 className="academic-workspace-title">{currentTrack.title}</h2>
            </div>
          </div>

          <div className="academic-workspace-topbar-right">
            {/* Prerequisite Advanced Modules links */}
            {currentTrack.prerequisites.advancedModules.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Prasyarat L3:</span>
                {currentTrack.prerequisites.advancedModules.map((mid) => (
                  <button
                    key={mid}
                    onClick={() => onNavigateToAdvanced(mid)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '5px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                    title={`Buka Modul Tingkat Lanjut ${mid.toUpperCase()}`}
                  >
                    {mid.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Prerequisite Core chapters links */}
            {currentTrack.prerequisites.coreChapters.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Core:</span>
                {currentTrack.prerequisites.coreChapters.slice(0, 3).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => onSelectCoreChapter(cid)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '5px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                    title={`Buka Bab ${cid}`}
                  >
                    Bab {cid}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Track Switcher */}
            <div className="academic-workspace-switcher">
              <select
                aria-label="Pilih Track Riset L4"
                value={currentTrack.id}
                onChange={(e) => handleSelectTrack(e.target.value)}
                className="academic-workspace-select"
              >
                {researchTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code}: {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Track Description Banner */}
        <div className="academic-workspace-desc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentTrack.category}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Tolok Ukur: <strong style={{ color: 'var(--text)' }}>{currentTrack.primaryBenchmark}</strong>
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                  Target Publikasi: {currentTrack.targetVenues.join(', ')}
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text)' }}>
                {currentTrack.subtitle}
              </h1>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '980px' }}>
                {currentTrack.description}
              </p>
            </div>

            <button
              onClick={() => onNavigateToAdvanced()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: 'var(--bg-subtle)',
                color: 'var(--primary)',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Tinjau Modul Lanjut L3"
            >
              <Layers size={14} />
              <span>Modul Lanjut L3</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Workspace Learning Section Tabs */}
        <div className="academic-workspace-tabs">
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => setActiveTab('curriculum')}
          >
            <BookOpen size={16} />
            <span>Silabus 18 Bagian &amp; Teori Riset</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab')}
          >
            <FlaskConical size={16} />
            <span>Laboratorium Riset Interaktif</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            <Activity size={16} />
            <span>Alur Riset Terpandu &amp; Baseline</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'protocols' ? 'active' : ''}`}
            onClick={() => setActiveTab('protocols')}
          >
            <Target size={16} />
            <span>Protokol Tolok Ukur &amp; Metrik</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <FileText size={16} />
            <span>Template Naskah &amp; Keterulangan</span>
          </button>
        </div>

        {/* Workspace Body Content */}
        <div className="academic-workspace-content">
          {activeTab === 'curriculum' && (
            <div className="card" style={{ padding: '2.5rem' }}>
              {curriculumContent ? (
                <div className="prose">
                  <MarkdownRenderer content={curriculumContent} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Silabus kurikulum riset sedang dimuat atau dalam penyiapan.
                </div>
              )}
            </div>
          )}

          {activeTab === 'lab' && (
            <div style={{ minHeight: '520px' }}>
              {renderResearchLab(currentTrack.id)}
            </div>
          )}

          {activeTab === 'workflow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Statistical protocol callout */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
                  Protokol Keabsahan Statistik Multi-Seed (N &ge; {currentTrack.statisticalProtocol.minSeeds})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Setiap klaim peningkatan kinerja pada track {currentTrack.code} wajib dievaluasi dengan protokol statistik baku:
                </p>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem 1.25rem', borderRadius: '8px', lineHeight: 1.8, fontSize: '0.88rem' }}>
                  <div><strong>Jumlah Seed Minimum:</strong> {currentTrack.statisticalProtocol.minSeeds} random seeds independen</div>
                  <div><strong>Format Pelaporan:</strong> {currentTrack.statisticalProtocol.reporting}</div>
                  <div><strong>Uji Signifikansi:</strong> {currentTrack.statisticalProtocol.significanceMethod}</div>
                </div>
              </div>

              {/* Research Milestones */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
                  Milestone &amp; Luaran Penelitian ({currentTrack.code})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentTrack.milestones.map((ms, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1.15rem 1.35rem',
                        borderRadius: '8px',
                        background: 'var(--bg-subtle)',
                        borderLeft: '4px solid var(--primary)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {ms.phase}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text)' }}>
                        {ms.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                        <strong>Deliverable Luaran:</strong> {ms.deliverable}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'protocols' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {trackProtocol ? (
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {trackProtocol.canonicalBenchmark}
                      </span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text)' }}>
                        {trackProtocol.trackTitle}
                      </h3>
                    </div>
                    <span className="card-badge badge-published">Protokol Baku Terstandar</span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {trackProtocol.domain} · {trackProtocol.officialEvaluationLibrary}
                  </p>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
                    Metrik Evaluasi Utama
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {trackProtocol.primaryMetrics.map((pm, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{pm.name}</strong>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                            {pm.symbol}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.35rem', lineHeight: 1.4 }}>
                          {pm.description}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Rentang Nilai: <strong>{pm.range}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                    Taksonomi Diagnostik Galat Empiris
                  </h4>
                  <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.7, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {trackProtocol.diagnosticTaxonomy.map((dt, idx) => (
                      <li key={idx}>{dt}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Protokol tolok ukur spesifik untuk track ini mengacu pada standar umum.
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text)' }}>
                  10 Template Riset Ilmiah &amp; Checklist Keterulangan
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  Dokumen kanonikal terstandardisasi di direktori <code>content/research/templates/</code> untuk menyusun naskah ilmiah bermutu tinggi.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {RESEARCH_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <FileText size={16} color="var(--primary)" />
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{tmpl.title}</strong>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        {tmpl.desc}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        {tmpl.file}
                      </span>
                      <span className="card-badge badge-published" style={{ fontSize: '0.7rem' }}>
                        Tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: STRUCTURED ACADEMIC CATALOG
  // =========================================================================
  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Catalog Header */}
      <div className="academic-catalog-header">
        <div className="academic-catalog-badge">
          <FlaskConical size={14} />
          <span>L4 Research Ready · Standar Publikasi Internasional</span>
        </div>
        <h1 className="academic-catalog-title">
          Jalur Riset (Research Learning Tracks L4)
        </h1>
        <p className="academic-catalog-subtitle">
          6 Jalur Riset Pascasarjana berorientasi publikasi ilmiah (CVPR, ICCV, ECCV, IEEE TPAMI),
          dilengkapi 20 tahapan metodologi riset, protokol benchmark terverifikasi, dan 10 template keterulangan.
        </p>

        {/* Summary Metric Pills */}
        <div className="academic-catalog-stats">
          <div className="academic-stat-pill">
            <strong>6 Tracks</strong>
            <span>Jalur Riset Terakreditasi (R01..06)</span>
          </div>
          <div className="academic-stat-pill">
            <strong>20 Tahap</strong>
            <span>Metodologi Riset Ilmiah Baku</span>
          </div>
          <div className="academic-stat-pill">
            <strong>10 Template</strong>
            <span>Standar Keterulangan (Reproducibility)</span>
          </div>
          <div className="academic-stat-pill">
            <strong>N &ge; 3 Seeds</strong>
            <span>Protokol Keabsahan Statistik</span>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => setActiveMainSection('tracks')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: 'none',
            background: activeMainSection === 'tracks' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeMainSection === 'tracks' ? 'var(--on-primary)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeMainSection === 'tracks' ? '0 2px 8px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          <Target size={16} />
          <span>6 Jalur Riset (Tracks Explorer)</span>
        </button>

        <button
          onClick={() => setActiveMainSection('methodology')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: 'none',
            background: activeMainSection === 'methodology' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeMainSection === 'methodology' ? 'var(--on-primary)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeMainSection === 'methodology' ? '0 2px 8px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          <Compass size={16} />
          <span>20-Tahap Metodologi Riset</span>
        </button>

        <button
          onClick={() => setActiveMainSection('protocols')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: 'none',
            background: activeMainSection === 'protocols' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeMainSection === 'protocols' ? 'var(--on-primary)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeMainSection === 'protocols' ? '0 2px 8px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          <ShieldCheck size={16} />
          <span>Protokol Benchmark &amp; Metrik</span>
        </button>

        <button
          onClick={() => setActiveMainSection('templates')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: 'none',
            background: activeMainSection === 'templates' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeMainSection === 'templates' ? 'var(--on-primary)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeMainSection === 'templates' ? '0 2px 8px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          <FileText size={16} />
          <span>10 Template Naskah &amp; Keterulangan</span>
        </button>
      </div>

      {/* SECTION 1: RESEARCH TRACKS EXPLORER */}
      {activeMainSection === 'tracks' && (
        <>
          {/* Search & Category Toolbar */}
          <div className="academic-catalog-toolbar">
            <div className="academic-search-wrapper">
              <Search size={18} className="academic-search-icon" />
              <input
                type="text"
                className="academic-search-input"
                placeholder="Cari track riset L4 (contoh: R01, Detection, MOT, Tracking, Fog, Multimodal, Edge)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="academic-search-clear-btn"
                  title="Bersihkan pencarian"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Menampilkan <strong>{filteredTracks.length}</strong> dari {researchTracks.length} Track
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="academic-filter-nav">
            <button
              className={`academic-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span>Semua Track</span>
              <span className="academic-filter-count">{researchTracks.length}</span>
            </button>
            <button
              className={`academic-filter-btn ${selectedCategory === 'Primary Academic Anchor' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Primary Academic Anchor')}
            >
              <span>Riset Primer (Primary Research)</span>
              <span className="academic-filter-count">
                {researchTracks.filter((t) => t.category === 'Primary Academic Anchor').length}
              </span>
            </button>
            <button
              className={`academic-filter-btn ${selectedCategory === 'Strategic Extension' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Strategic Extension')}
            >
              <span>Ekstensi Strategis (Strategic Extensions)</span>
              <span className="academic-filter-count">
                {researchTracks.filter((t) => t.category === 'Strategic Extension').length}
              </span>
            </button>
          </div>

          {/* Research Tracks Grid */}
          {filteredTracks.length > 0 ? (
            <div className="academic-grid">
              {filteredTracks.map((track: ResearchTrack) => (
                <div
                  key={track.id}
                  className="academic-card"
                  onClick={() => handleSelectTrack(track.id)}
                >
                  <div>
                    <div className="academic-card-header">
                      <div className="academic-card-badge-row">
                        <span className="academic-card-code-badge">{track.code}</span>
                        <span className="academic-card-pillar-badge">{track.category}</span>
                      </div>
                      <span className="card-badge badge-published" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                        L4 Research Ready
                      </span>
                    </div>

                    <h3 className="academic-card-title">{track.title}</h3>
                    <div className="academic-card-subtitle">{track.subtitle}</div>

                    <p className="academic-card-desc">{track.description}</p>

                    <div className="academic-card-meta">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Primary Benchmark:</span>
                        <strong style={{ color: 'var(--text)' }}>{track.primaryBenchmark}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Prasyarat L3:</span>
                        <strong style={{ color: 'var(--primary)' }}>
                          {track.prerequisites.advancedModules.map((m) => m.toUpperCase()).join(', ')}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Target Venue:</span>
                        <span style={{ color: 'var(--text-muted)' }}>{track.targetVenues.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="academic-card-actions">
                    <button
                      className="academic-card-primary-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTrack(track.id);
                      }}
                    >
                      <span>Buka Track Riset L4</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="academic-empty-state">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-dim)' }}>
                <Target size={48} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                Track Riset Tidak Ditemukan
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Tidak ada track riset L4 yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="control-btn"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600 }}
              >
                <RotateCcw size={14} />
                <span>Reset Pencarian &amp; Filter</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: 20-STAGE RESEARCH METHODOLOGY */}
      {activeMainSection === 'methodology' && (
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)' }}>
              20-Tahap Metodologi Penelitian Reproducible Computer Vision
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Alur kerja komprehensif dari perumusan masalah, audit lisensi dataset, replikasi baseline deterministik,
              studi ablasi faktorial, hingga penyusunan naskah publikasi.
            </p>
          </div>

          {/* Category Filter for Methodology */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
            {['all', 'Problem Formulation & SOTA Gap', 'Dataset Provenance & Curation', 'Baseline Reproduction & Determinism', 'Scientific Methodology & Architecture', 'Quantitative Analysis & Rigor', 'Publication Artifacts & Open Science'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedMethodologyCat(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: selectedMethodologyCat === cat ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: selectedMethodologyCat === cat ? 'var(--on-primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat === 'all' ? 'Semua Tahap (20)' : cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredMethodology.map((st) => (
              <div
                key={st.step}
                style={{
                  padding: '1.15rem 1.35rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Tahap {st.step} · {st.category}
                  </span>
                  <span className="card-badge badge-published" style={{ fontSize: '0.7rem' }}>
                    Standar Baku
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text)' }}>
                  {st.title}
                </h4>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {st.description}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <strong>Luaran Verifikasi:</strong> {st.deliverable}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: BENCHMARK PROTOCOLS */}
      {activeMainSection === 'protocols' && (
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)' }}>
              Protokol Tolok Ukur Ilmiah &amp; Metrik Evaluasi Standar
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Spesifikasi protokol resmi untuk evaluasi deteksi objek, multi-object tracking, persepsi kabut/malam,
              sensor fusion multimodal, edge AI deployment, dan rekonstruksi 3D spasial.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {RESEARCH_BENCHMARK_PROTOCOLS.map((proto) => (
              <div
                key={proto.trackCode}
                style={{
                  padding: '1.35rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Track {proto.trackCode} · {proto.canonicalBenchmark}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text)' }}>
                    {proto.trackTitle}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {proto.domain} · {proto.officialEvaluationLibrary}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>
                    Metrik Primer:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {proto.primaryMetrics.map((pm, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          fontWeight: 600,
                        }}
                      >
                        {pm.symbol} ({pm.name})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: 10 REPRODUCIBLE RESEARCH TEMPLATES */}
      {activeMainSection === 'templates' && (
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)' }}>
              10 Template Riset Baku &amp; Checklist Keterulangan
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Dokumen kanonikal siap pakai untuk mendukung perumusan proposal, audit dataset, pelaporan multi-seed,
              hingga draf naskah konferensi IEEE/CVF.
            </p>
          </div>

          <div className="academic-grid">
            {RESEARCH_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{tmpl.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {tmpl.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    {tmpl.file}
                  </span>
                  <span className="card-badge badge-published" style={{ fontSize: '0.7rem' }}>
                    Tersedia
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
