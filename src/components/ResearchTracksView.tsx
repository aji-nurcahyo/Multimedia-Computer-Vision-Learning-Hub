import React, { useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  Search,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart2,
  Calendar,
  FileText,
  ShieldCheck,
  Activity,
  Target,
  Code,
  Terminal,
  FileCode,
  Compass
} from 'lucide-react';
import {
  researchTracks,
  getResearchText,
  type ResearchTrack
} from '../lib/advancedContent';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResearchExperimentExplorerLab } from './playgrounds/ResearchExperimentExplorerLab';
import { R01DetectionResearchLab } from './playgrounds/R01DetectionResearchLab';
import { R02TrackingResearchLab } from './playgrounds/R02TrackingResearchLab';
import { R03AdversePerceptionLab } from './playgrounds/R03AdversePerceptionLab';
import { R04MultimodalFusionLab } from './playgrounds/R04MultimodalFusionLab';
import { R05EdgeBenchmarkLab } from './playgrounds/R05EdgeBenchmarkLab';
import { R06SpatialVisionLab } from './playgrounds/R06SpatialVisionLab';
import { RESEARCH_METHODOLOGY_STAGES, type ResearchStage } from '../data/researchMethodology';
import { RESEARCH_BENCHMARK_PROTOCOLS, type BenchmarkProtocol } from '../data/researchBenchmarkProtocols';

interface ResearchTracksViewProps {
  onSelectCoreChapter: (chapterId: string) => void;
  onNavigateToAdvanced: () => void;
}

export const ResearchTracksView: React.FC<ResearchTracksViewProps> = ({
  onSelectCoreChapter,
  onNavigateToAdvanced,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>('r01');
  const [activeMainSection, setActiveMainSection] = useState<'tracks' | 'methodology' | 'protocols' | 'templates'>('tracks');
  const [trackSubtabs, setTrackSubtabs] = useState<Record<string, 'lab' | 'curriculum' | 'workflow' | 'code' | 'protocols'>>({
    r01: 'lab',
    r02: 'lab',
    r03: 'lab',
    r04: 'lab',
    r05: 'lab',
    r06: 'lab',
  });

  // Methodology state
  const [selectedMethodologyCat, setSelectedMethodologyCat] = useState<string>('all');
  const [expandedStageStep, setExpandedStageStep] = useState<number | null>(1);

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

  const toggleExpand = (id: string) => {
    setExpandedTrackId((prev) => (prev === id ? null : id));
  };

  const toggleStage = (step: number) => {
    setExpandedStageStep((prev) => (prev === step ? null : step));
  };

  const getProtocolForTrack = (trackCode: string): BenchmarkProtocol | undefined => {
    return RESEARCH_BENCHMARK_PROTOCOLS.find((p) => p.trackCode === trackCode);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <header className="hero" style={{ marginBottom: '2rem' }}>
        <div className="hero-tag">
          <FlaskConical size={15} />
          <span>L4 Research Ready · ISVWS 2026–2040 Strategic Alignment</span>
        </div>
        <h1 className="hero-title">
          Jalur Penelitian <span>(Research Learning Paths)</span>
        </h1>
        <p className="hero-subtitle">
          Kerangka riset reproducible Computer Vision tingkat Master/PhD: Reproduksi benchmark resmi,
          isolasi ablasi faktorial, validasi multi-seed (N &ge; 3), dan taksonomi kegagalan empiris.
        </p>

        {/* Status Callout */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            maxWidth: '900px',
          }}
        >
          <CheckCircle2 size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text)' }}>
            <strong>Status Fase AD-11: Jalur Penelitian Utama (Primary Research Tracks R01, R02, R03) Terpublikasi Penuh.</strong>{' '}
            Silabus 18-bab standar CVPR/ICCV, laboratorium interaktif Tier-A in-browser (R01 Deteksi, R02 Tracking, R03 Adverse), alur kerja terpandu Tier-B, serta skrip &amp; notebook reproducible Tier-C telah terintegrasi dan tervalidasi independen (92/92 lolos).
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hero-meta" style={{ marginTop: '1.5rem' }}>
          <div className="hero-meta-item">
            <span className="hero-meta-val">6</span>
            <span className="hero-meta-label">Research Tracks (R01..06)</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val" style={{ color: 'var(--primary)' }}>20</span>
            <span className="hero-meta-label">Tahap Metodologi Ilmiah</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val" style={{ color: 'var(--accent)' }}>&ge; 3</span>
            <span className="hero-meta-label">Multi-Seed Protocol Standard</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val">10</span>
            <span className="hero-meta-label">Template Riset Baku</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val">2026&ndash;2040</span>
            <span className="hero-meta-label">Roadmap Milestone Phasing</span>
          </div>
        </div>
      </header>

      {/* Main Section Navigation Bar */}
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
          Jalur Penelitian &amp; Lab Interaktif (R01..R06)
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
          <Award size={16} />
          20 Tahap Metodologi Ilmiah (L4 Framework)
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
          <BarChart2 size={16} />
          Spesifikasi Protokol Benchmark (R01..R06)
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
          10 Template Riset Baku &amp; Checklist
        </button>
      </div>

      {/* SECTION 1: TRACKS & TIER-A INTERACTIVE LAB */}
      {activeMainSection === 'tracks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Tier-A Interactive Research Explorer Lab */}
          <ResearchExperimentExplorerLab />

          {/* Category Filter & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedCategory === 'all' ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: selectedCategory === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Semua Jalur (6)
              </button>
              <button
                onClick={() => setSelectedCategory('Primary Academic Anchor')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: selectedCategory === 'Primary Academic Anchor' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedCategory === 'Primary Academic Anchor' ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: selectedCategory === 'Primary Academic Anchor' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Primary Anchors (3)
              </button>
              <button
                onClick={() => setSelectedCategory('Strategic Extension')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: selectedCategory === 'Strategic Extension' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedCategory === 'Strategic Extension' ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: selectedCategory === 'Strategic Extension' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Strategic Extensions (2)
              </button>
              <button
                onClick={() => setSelectedCategory('Optional Specialization')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: selectedCategory === 'Optional Specialization' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedCategory === 'Optional Specialization' ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: selectedCategory === 'Optional Specialization' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Optional Specialization (1)
              </button>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input
                type="text"
                placeholder="Cari jalur atau benchmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Tracks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {filteredTracks.map((track: ResearchTrack) => {
              const isExpanded = expandedTrackId === track.id;
              const protocol = getProtocolForTrack(track.code);

              return (
                <article
                  key={track.id}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    borderLeft: `4px solid ${
                      track.category === 'Primary Academic Anchor'
                        ? 'var(--primary)'
                        : track.category === 'Strategic Extension'
                        ? '#a855f7'
                        : 'var(--text-muted)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: 'var(--bg-subtle)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--primary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {track.code}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background:
                            track.category === 'Primary Academic Anchor'
                              ? 'rgba(56, 189, 248, 0.12)'
                              : track.category === 'Strategic Extension'
                              ? 'rgba(168, 85, 247, 0.12)'
                              : 'rgba(148, 163, 184, 0.12)',
                          color:
                            track.category === 'Primary Academic Anchor'
                              ? 'var(--primary)'
                              : track.category === 'Strategic Extension'
                              ? '#a855f7'
                              : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {track.category}
                      </span>

                      {/* Explicit Evidence Status Badge */}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: track.status === 'published'
                            ? 'rgba(52, 211, 153, 0.12)'
                            : 'rgba(56, 189, 248, 0.1)',
                          color: track.status === 'published'
                            ? 'var(--accent)'
                            : 'var(--primary)',
                          border: track.status === 'published'
                            ? '1px solid rgba(52, 211, 153, 0.35)'
                            : '1px solid rgba(56, 189, 248, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <ShieldCheck size={12} />
                        {track.status === 'published'
                          ? 'Terpublikasi · Konten Riset & Lab Terpadu (L4 Ready)'
                          : 'Direncanakan · Spesifikasi Protokol'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {track.pillarName}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0 0.25rem 0', color: 'var(--text)' }}>
                    {track.title}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                    {track.subtitle}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {track.description}
                  </p>

                  {/* Prerequisites Section */}
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                      Prasyarat Modul Lanjut &amp; Bab Inti:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                        Modul Lanjut:
                      </span>
                      {track.prerequisites.advancedModules.map((mid) => (
                        <button
                          key={mid}
                          onClick={onNavigateToAdvanced}
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                          title="Lihat Modul Lanjut"
                        >
                          <Layers size={12} />
                          {mid.toUpperCase()}
                        </button>
                      ))}

                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        Bab Inti:
                      </span>
                      {track.prerequisites.coreChapters.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => onSelectCoreChapter(cid)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          title={`Buka Bab ${cid}`}
                        >
                          <BookOpen size={11} color="var(--primary)" />
                          {cid}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action & Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleExpand(track.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      {isExpanded ? (
                        <>
                          Tutup Protokol &amp; Spesifikasi <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Lihat Protokol Benchmark &amp; Milestone ({track.milestones.length} Fase) <ChevronDown size={16} />
                        </>
                      )}
                    </button>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Benchmark Utama: <strong style={{ color: 'var(--text)' }}>{track.primaryBenchmark}</strong>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '1.25rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px dashed var(--border)',
                      }}
                    >
                      {/* Subtab Navigation for Published Tracks (R01-R06) */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.4rem',
                          flexWrap: 'wrap',
                          marginBottom: '1.5rem',
                          borderBottom: '1px solid var(--border)',
                          paddingBottom: '0.75rem',
                        }}
                      >
                        <button
                          onClick={() => setTrackSubtabs((prev) => ({ ...prev, [track.id]: 'lab' }))}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: (trackSubtabs[track.id] || 'lab') === 'lab' ? 'var(--primary)' : 'var(--bg-subtle)',
                            color: (trackSubtabs[track.id] || 'lab') === 'lab' ? 'var(--on-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <FlaskConical size={14} />
                          Lab Interaktif (Tier A)
                        </button>

                        <button
                          onClick={() => setTrackSubtabs((prev) => ({ ...prev, [track.id]: 'curriculum' }))}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: trackSubtabs[track.id] === 'curriculum' ? 'var(--primary)' : 'var(--bg-subtle)',
                            color: trackSubtabs[track.id] === 'curriculum' ? 'var(--on-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <BookOpen size={14} />
                          Silabus Riset 18-Bab (L4 Curriculum)
                        </button>

                        <button
                          onClick={() => setTrackSubtabs((prev) => ({ ...prev, [track.id]: 'workflow' }))}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: trackSubtabs[track.id] === 'workflow' ? 'var(--primary)' : 'var(--bg-subtle)',
                            color: trackSubtabs[track.id] === 'workflow' ? 'var(--on-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Compass size={14} />
                          Alur Riset Terpandu (Tier B)
                        </button>

                        <button
                          onClick={() => setTrackSubtabs((prev) => ({ ...prev, [track.id]: 'code' }))}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: trackSubtabs[track.id] === 'code' ? 'var(--primary)' : 'var(--bg-subtle)',
                            color: trackSubtabs[track.id] === 'code' ? 'var(--on-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Code size={14} />
                          Skrip &amp; Notebook (Tier C)
                        </button>

                        <button
                          onClick={() => setTrackSubtabs((prev) => ({ ...prev, [track.id]: 'protocols' }))}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: trackSubtabs[track.id] === 'protocols' ? 'var(--primary)' : 'var(--bg-subtle)',
                            color: trackSubtabs[track.id] === 'protocols' ? 'var(--on-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <BarChart2 size={14} />
                          Benchmark &amp; Milestone ISVWS
                        </button>
                      </div>

                      {/* Content Section 1: Tier-A Interactive Lab */}
                      {(trackSubtabs[track.id] || 'lab') === 'lab' && (
                        <div>
                          {track.id === 'r01' && <R01DetectionResearchLab />}
                          {track.id === 'r02' && <R02TrackingResearchLab />}
                          {track.id === 'r03' && <R03AdversePerceptionLab />}
                          {track.id === 'r04' && <R04MultimodalFusionLab />}
                          {track.id === 'r05' && <R05EdgeBenchmarkLab />}
                          {track.id === 'r06' && <R06SpatialVisionLab />}
                        </div>
                      )}

                      {/* Content Section 2: 18-Chapter Research Curriculum */}
                      {trackSubtabs[track.id] === 'curriculum' && (
                        <div
                          style={{
                            maxHeight: '650px',
                            overflowY: 'auto',
                            padding: '1.5rem',
                            background: 'var(--bg-card)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <MarkdownRenderer content={getResearchText(track.id, 'index.md')} />
                        </div>
                      )}

                      {/* Content Section 3: Tier-B Guided Workflow */}
                      {trackSubtabs[track.id] === 'workflow' && (
                        <div
                          style={{
                            maxHeight: '650px',
                            overflowY: 'auto',
                            padding: '1.5rem',
                            background: 'var(--bg-card)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <MarkdownRenderer content={getResearchText(track.id, 'guided-workflow.md')} />
                        </div>
                      )}

                      {/* Content Section 4: Tier-C Reproducible Code & Notebook */}
                      {trackSubtabs[track.id] === 'code' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Terminal size={16} />
                              Skrip Komputasi Mandiri (Python 3): `content/research/{track.id}/examples/example-01.py`
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              Eksekusi deterministik mandiri dengan protokol multi-seed ($N \ge 3$), estimasi interval kepercayaan 95% bootstrap, dan verifikasi batas numerik.
                            </div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                              python content/research/{track.id}/examples/example-01.py
                            </div>
                            <pre
                              style={{
                                maxHeight: '350px',
                                overflowY: 'auto',
                                padding: '1rem',
                                background: '#090d16',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: '#e2e8f0',
                                fontFamily: 'var(--font-mono)',
                                lineHeight: '1.5',
                              }}
                            >
                              <code>{getResearchText(track.id, 'examples/example-01.py')}</code>
                            </pre>
                          </div>

                          <div
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <FileCode size={16} color="var(--primary)" />
                              Jupyter Research Notebook: `content/research/{track.id}/notebooks/{track.id}-research-baseline.ipynb`
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Notebook berstandar `nbformat` v4 menyediakan visualisasi komparatif, penguncian seed deterministik, serta pemisahan data kanonikal bebas kebocoran (*data leakage free*).
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content Section 5: Protocols & Milestones */}
                      {trackSubtabs[track.id] === 'protocols' && (
                        <div>
                          {/* Benchmarks & Metrics */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                                Dataset Evaluasi Standar:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                {track.candidateDatasets.map((ds, idx) => (
                                  <li key={idx}>{ds}</li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                                Metrik Kuantitatif Wajib:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                {track.standardMetrics.map((sm, idx) => (
                                  <li key={idx}>{sm}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Official Evaluation Protocol Card */}
                          {protocol && (
                            <div
                              style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                marginBottom: '1.25rem',
                              }}
                            >
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <BarChart2 size={16} />
                                Spesifikasi Protokol Benchmark Resmi: {protocol.canonicalBenchmark}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                Pustaka Evaluasi: <strong style={{ color: 'var(--text)' }}>{protocol.officialEvaluationLibrary}</strong>
                              </div>

                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' }}>
                                Metrik Primer &amp; Formula:
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
                                {protocol.primaryMetrics.map((pm, pidx) => (
                                  <div key={pidx} style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                                      {pm.name} ({pm.symbol})
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                      {pm.description}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Statistical Protocol Box */}
                          <div
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.05)',
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                              marginBottom: '1.25rem',
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Activity size={16} />
                              Protokol Rigor Statistik (Keputusan Gate 6 Approved):
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                              &bull; <strong>Jumlah Seed Minimum:</strong> {track.statisticalProtocol.minSeeds} random seeds independen.<br />
                              &bull; <strong>Pelaporan:</strong> {track.statisticalProtocol.reporting}.<br />
                              &bull; <strong>Uji Signifikansi:</strong> {track.statisticalProtocol.significanceMethod}.
                            </div>
                          </div>

                          {/* 3-Phase Milestones */}
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Calendar size={16} color="var(--primary)" />
                              Milestone Penelitian (ISVWS 2026&ndash;2040):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                              {track.milestones.map((ms, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '0.6rem 0.8rem',
                                    background: 'var(--bg-subtle)',
                                    borderRadius: '6px',
                                    borderLeft: '3px solid var(--accent)',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                    {ms.phase}: {ms.title}
                                  </div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                    {ms.deliverable}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Target Publication Venues */}
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                              Target Publikasi Ilmiah:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {track.targetVenues.map((venue, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.75rem',
                                    background: 'var(--bg-subtle)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                  }}
                                >
                                  {venue}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: 20 STAGES OF RESEARCH METHODOLOGY */}
      {activeMainSection === 'methodology' && (
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
              <Award size={20} color="var(--primary)" />
              20 Tahap Metodologi Ilmiah Riset Visi Komputer (L4 Research-Ready)
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Alur kerja komprehensif dari konseptualisasi masalah hingga publikasi internasional, dirancang untuk membimbing mahasiswa
              sarjana akhir, pascasarjana, dan peneliti mandiri menghasilkan kontribusi ilmiah berstandar CVPR/ICCV.
            </p>
          </div>

          {/* Category Filter for Methodology */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { id: 'all', label: 'Semua 20 Tahap' },
              { id: 'Konseptualisasi & Perumusan Masalah', label: '1. Konseptualisasi' },
              { id: 'Data & Integritas Dataset', label: '2. Data & Anotasi' },
              { id: 'Desain Eksperimen & Baseline', label: '3. Desain Eksperimen' },
              { id: 'Eksekusi & Evaluasi Empiris', label: '4. Eksekusi & Evaluasi' },
              { id: 'Etika, Publikasi & Keterulangan', label: '5. Etika & Publikasi' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedMethodologyCat(cat.id)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '16px',
                  border: selectedMethodologyCat === cat.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedMethodologyCat === cat.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                  color: selectedMethodologyCat === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stages Accordion List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
            {filteredMethodology.map((st: ResearchStage) => {
              const isExpanded = expandedStageStep === st.step;

              return (
                <div
                  key={st.step}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => toggleStage(st.step)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.15rem',
                      background: isExpanded ? 'var(--bg-card)' : 'transparent',
                      border: 'none',
                      borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: 'var(--primary-glow)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        Tahap {st.step < 10 ? `0${st.step}` : st.step}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                        {st.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({st.category})
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {st.description}
                      </p>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>
                          Pertanyaan Panduan Kritis (Critical Key Questions):
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                          {st.keyQuestions.map((kq, idx) => (
                            <li key={idx}>{kq}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Domain Examples Box */}
                      <div
                        style={{
                          padding: '0.85rem',
                          borderRadius: '8px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                          Contoh Implementasi Praktis Lintas Jalur Riset:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', fontSize: '0.8rem' }}>
                          <div style={{ color: 'var(--text)' }}>
                            <strong style={{ color: 'var(--primary)' }}>[R01 Deteksi Visual]:</strong> {st.detectionExample}
                          </div>
                          <div style={{ color: 'var(--text)' }}>
                            <strong style={{ color: '#a855f7' }}>[R02 Pelacakan MOT]:</strong> {st.trackingExample}
                          </div>
                          <div style={{ color: 'var(--text)' }}>
                            <strong style={{ color: 'var(--accent)' }}>[R03 Persepsi Robus]:</strong> {st.robustnessExample}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Deliverable / Luaran Wajib:{' '}
                        <strong style={{ color: 'var(--text)' }}>{st.deliverable}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: BENCHMARK PROTOCOL DEFINITIONS (R01..R06) */}
      {activeMainSection === 'protocols' && (
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
              <BarChart2 size={20} color="var(--primary)" />
              Spesifikasi Protokol Benchmark Resmi (R01 s.d. R06)
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Standar baku evaluasi matematis dan dekomposisi metrik untuk 6 jalur riset, merujuk pada paket resmi komunitas
              seperti pycocotools, TrackEval, dan torchmetrics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {RESEARCH_BENCHMARK_PROTOCOLS.map((proto) => (
              <div
                key={proto.trackCode}
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        background: 'var(--primary-glow)',
                        color: 'var(--primary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {proto.trackCode}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>
                      {proto.canonicalBenchmark}
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    Domain: {proto.domain}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Pustaka Evaluasi Resmi: <strong style={{ color: 'var(--text)' }}>{proto.officialEvaluationLibrary}</strong>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                    Pemisahan Kanonikal (Canonical Benchmark Splits):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {proto.canonicalSplits.map((sp, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--bg-card)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Metrics Table */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                    Metrik Primer &amp; Definisi Operasional:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
                    {proto.primaryMetrics.map((pm, pidx) => (
                      <div
                        key={pidx}
                        style={{
                          padding: '0.75rem',
                          background: 'var(--bg-card)',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.85rem' }}>
                            {pm.name}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>
                            {pm.symbol}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.4' }}>
                          {pm.description}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                          Rentang: {pm.range}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Failure Taxonomy */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>
                    Taksonomi Diagnostik Kegagalan:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {proto.diagnosticTaxonomy.map((dt, didx) => (
                      <li key={didx}>{dt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: 10 REUSABLE RESEARCH TEMPLATES & CHECKLIST */}
      {activeMainSection === 'templates' && (
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.75rem',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
              <FileText size={20} color="var(--primary)" />
              10 Template Riset Baku &amp; Checklist Keterulangan
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Paket dokumen siap pakai untuk mendukung perumusan proposal, dokumentasi dataset, pelaporan statistik multi-seed,
              hingga penulisan artikel ilmiah berstandar IEEE/CVF.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                      {tmpl.title}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    {tmpl.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    content/research/templates/{tmpl.file}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <CheckCircle2 size={13} color="var(--accent)" /> Tersedia
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Callout back to Advanced */}
      <div
        style={{
          marginTop: '3rem',
          padding: '1.75rem',
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text)' }}>
            Pelajari Fondasi Matematika &amp; Algoritma Lanjut Terlebih Dahulu?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Tinjau seluruh 8 Modul Lanjut (ADV-01..08) yang telah 100% diterbitkan untuk menguasai kalkulus tensor, inverse problems,
            dan deformable attention sebelum merancang penelitian.
          </p>
        </div>
        <button
          onClick={onNavigateToAdvanced}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Buka 8 Modul Lanjut (ADV) <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
