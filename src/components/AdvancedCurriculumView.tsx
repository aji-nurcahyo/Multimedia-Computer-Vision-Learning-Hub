import React, { useState } from 'react';
import {
  Layers,
  GraduationCap,
  Clock,
  ArrowRight,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Code2,
  CheckCircle2,
  FileText,
  Terminal,
  Sparkles,
} from 'lucide-react';
import {
  advancedModules,
  type AdvancedModule,
  getAdvancedText,
} from '../lib/advancedContent';
import { SvdOptimizationExplorerLab } from './playgrounds/SvdOptimizationExplorerLab';
import { SyntheticMotArenaLab } from './playgrounds/SyntheticMotArenaLab';
import { AdverseConditionsExplorerLab } from './playgrounds/AdverseConditionsExplorerLab';
import { VariationalInverseProblemLab } from './playgrounds/VariationalInverseProblemLab';
import { MultiViewGeometryExplorerLab } from './playgrounds/MultiViewGeometryExplorerLab';
import { DeformableAttentionExplorerLab } from './playgrounds/DeformableAttentionExplorerLab';
import { VisionFoundationAdapterLab } from './playgrounds/VisionFoundationAdapterLab';
import { EdgeVisionRooflineLab } from './playgrounds/EdgeVisionRooflineLab';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AdvancedCurriculumViewProps {
  onSelectCoreChapter: (chapterId: string) => void;
  onNavigateToResearch: () => void;
}

type ModuleTab = 'lab' | 'theory' | 'code' | 'syllabus';

export const AdvancedCurriculumView: React.FC<AdvancedCurriculumViewProps> = ({
  onSelectCoreChapter,
  onNavigateToResearch,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('adv-01');
  const [activeTabByModule, setActiveTabByModule] = useState<Record<string, ModuleTab>>({
    'adv-01': 'lab',
    'adv-02': 'lab',
    'adv-03': 'lab',
    'adv-04': 'lab',
    'adv-05': 'lab',
    'adv-06': 'lab',
    'adv-07': 'lab',
    'adv-08': 'lab',
  });

  const filteredModules = advancedModules.filter((mod) => {
    const matchesPillar = selectedPillar === 'all' || mod.pillar === selectedPillar;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      mod.code.toLowerCase().includes(query) ||
      mod.title.toLowerCase().includes(query) ||
      mod.subtitle.toLowerCase().includes(query) ||
      mod.description.toLowerCase().includes(query) ||
      mod.topics.some((t) => t.title.toLowerCase().includes(query));
    return matchesPillar && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedModuleId((prev) => (prev === id ? null : id));
  };

  const setModuleTab = (moduleId: string, tab: ModuleTab) => {
    setActiveTabByModule((prev) => ({ ...prev, [moduleId]: tab }));
  };

  const renderInteractiveLab = (moduleId: string) => {
    switch (moduleId) {
      case 'adv-01':
        return <SvdOptimizationExplorerLab />;
      case 'adv-02':
        return <VariationalInverseProblemLab />;
      case 'adv-03':
        return <SyntheticMotArenaLab />;
      case 'adv-04':
        return <DeformableAttentionExplorerLab />;
      case 'adv-05':
        return <MultiViewGeometryExplorerLab />;
      case 'adv-06':
        return <AdverseConditionsExplorerLab />;
      case 'adv-07':
        return <VisionFoundationAdapterLab />;
      case 'adv-08':
        return <EdgeVisionRooflineLab />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Laboratorium interaktif untuk modul ini sedang direncanakan (Planned).
          </div>
        );
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <header className="hero" style={{ marginBottom: '2rem' }}>
        <div className="hero-tag">
          <GraduationCap size={15} />
          <span>L3 Advanced Depth · Intelligent Computer Vision</span>
        </div>
        <h1 className="hero-title">
          Kurikulum Lanjut <span>(Advanced Curriculum)</span>
        </h1>
        <p className="hero-subtitle">
          Arsitektur materi pascasarjana dan pendalaman matematis untuk riset Intelligent Computer Vision,
          dibangun sebagai lapisan pembelajaran lanjut di atas Kurikulum Inti 60 Bab.
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
            <strong>Status Fase AD-09: Seluruh 8 Modul Lanjut (ADV-01 s.d. ADV-08) Telah Diterbitkan (Published).</strong> Delapan modul
            fondasi dan spesialisasi telah lengkap 100% dengan laboratorium simulasi interaktif Tier-A in-browser (Canvas 2D / SVG),
            teori eksperimen terpandu Tier-B, serta script komputasi dan notebook interaktif Tier-C.
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hero-meta" style={{ marginTop: '1.5rem' }}>
          <div className="hero-meta-item">
            <span className="hero-meta-val">8</span>
            <span className="hero-meta-label">Total Modul Lanjut</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val" style={{ color: 'var(--accent)' }}>8</span>
            <span className="hero-meta-label">Modul Aktif (AD-09)</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val" style={{ color: 'var(--primary)' }}>8</span>
            <span className="hero-meta-label">Lab Tier-A In-Browser</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val">4</span>
            <span className="hero-meta-label">Pilar Riset ISVWS</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-val">40</span>
            <span className="hero-meta-label">Topik Analitis Khusus</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedPillar('all')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedPillar === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedPillar === 'all' ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: selectedPillar === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Semua Pilar (8)
          </button>
          <button
            onClick={() => setSelectedPillar(1)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedPillar === 1 ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedPillar === 1 ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: selectedPillar === 1 ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pilar 1: Intelligent CV (4)
          </button>
          <button
            onClick={() => setSelectedPillar(2)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedPillar === 2 ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedPillar === 2 ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: selectedPillar === 2 ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pilar 2: Perception &amp; Sensing (2)
          </button>
          <button
            onClick={() => setSelectedPillar(3)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedPillar === 3 ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedPillar === 3 ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: selectedPillar === 3 ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pilar 3: Multimodal (1)
          </button>
          <button
            onClick={() => setSelectedPillar(4)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedPillar === 4 ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedPillar === 4 ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: selectedPillar === 4 ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pilar 4: Efficient Edge (1)
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Cari modul atau topik..."
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

      {/* Modules List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {filteredModules.map((mod: AdvancedModule) => {
          const isExpanded = expandedModuleId === mod.id;
          const isPublished = mod.status === 'published';
          const activeTab = activeTabByModule[mod.id] || (isPublished ? 'lab' : 'syllabus');

          return (
            <article
              key={mod.id}
              className="card"
              style={{
                padding: '1.75rem',
                borderLeft: `4px solid ${
                  mod.pillar === 1
                    ? 'var(--primary)'
                    : mod.pillar === 2
                    ? 'var(--accent)'
                    : mod.pillar === 3
                    ? '#a855f7'
                    : 'var(--warning)'
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
                    {mod.code}
                  </span>
                  {isPublished ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '12px',
                        background: 'rgba(52, 211, 153, 0.12)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Diterbitkan (Phase AD-07)
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: 'var(--warning)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      Planned (Fase AD-08/09)
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {mod.pillarName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Clock size={14} />
                  <span>{mod.estimatedHours} Jam Belajar</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.75rem 0 0.25rem 0', color: 'var(--text)' }}>
                {mod.title}
              </h3>
              <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                {mod.subtitle}
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {mod.description}
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
                  Prasyarat Kurikulum Inti (Klik untuk membuka Bab):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {mod.prerequisites.coreChapters.map((cid) => (
                    <button
                      key={cid}
                      onClick={() => onSelectCoreChapter(cid)}
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title={`Buka Bab ${cid}`}
                    >
                      <BookOpen size={12} color="var(--primary)" />
                      Bab {cid}
                    </button>
                  ))}
                  {mod.prerequisites.advancedModules.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                      Prasyarat Lanjut: {mod.prerequisites.advancedModules.map((m) => m.toUpperCase()).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleExpand(mod.id)}
                    style={{
                      background: isExpanded ? 'var(--primary)' : 'transparent',
                      border: '1px solid var(--primary)',
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      color: isExpanded ? 'var(--on-primary)' : 'var(--primary)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {isExpanded ? (
                      <>
                        Tutup Tampilan Modul <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        {isPublished ? (
                          <>
                            <Sparkles size={16} /> Buka Lab &amp; Materi Modul
                          </>
                        ) : (
                          <>
                            Lihat Rincian Silabus ({mod.topics.length} Topik)
                          </>
                        )}
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Level: <strong style={{ color: 'var(--text)' }}>{mod.level}</strong>
                </div>
              </div>

              {/* Expanded Module Content & Labs */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px dashed var(--border)',
                  }}
                >
                  {/* Module Sub-tabs */}
                  {isPublished && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <button
                        onClick={() => setModuleTab(mod.id, 'lab')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeTab === 'lab' ? 'var(--primary)' : 'var(--bg-subtle)',
                          color: activeTab === 'lab' ? 'var(--on-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <FlaskConical size={16} />
                        Lab Interaktif (Tier-A)
                      </button>
                      <button
                        onClick={() => setModuleTab(mod.id, 'theory')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeTab === 'theory' ? 'var(--primary)' : 'var(--bg-subtle)',
                          color: activeTab === 'theory' ? 'var(--on-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <FileText size={16} />
                        Teori &amp; Eksperimen Terpandu (Tier-B)
                      </button>
                      <button
                        onClick={() => setModuleTab(mod.id, 'code')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeTab === 'code' ? 'var(--primary)' : 'var(--bg-subtle)',
                          color: activeTab === 'code' ? 'var(--on-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Code2 size={16} />
                        Python Script &amp; Notebook (Tier-C)
                      </button>
                      <button
                        onClick={() => setModuleTab(mod.id, 'syllabus')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeTab === 'syllabus' ? 'var(--primary)' : 'var(--bg-subtle)',
                          color: activeTab === 'syllabus' ? 'var(--on-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Layers size={16} />
                        Silabus Topik &amp; Prasyarat
                      </button>
                    </div>
                  )}

                  {/* TAB 1: INTERACTIVE LAB (TIER A) */}
                  {isPublished && activeTab === 'lab' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div
                        style={{
                          padding: '0.85rem 1.25rem',
                          borderRadius: '8px',
                          background: 'var(--bg-subtle)',
                          marginBottom: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                            {mod.interactiveLab.title}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Laboratorium simulasi matematis berbasis HTML5 Canvas 2D / SVG berorientasi client-side tanpa dependensi backend.
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '10px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          Tier-A Interactive Lab
                        </span>
                      </div>

                      {renderInteractiveLab(mod.id)}
                    </div>
                  )}

                  {/* TAB 2: THEORY & GUIDED EXPERIMENT (TIER B) */}
                  {isPublished && activeTab === 'theory' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div
                        style={{
                          padding: '1.5rem',
                          borderRadius: '8px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <MarkdownRenderer content={getAdvancedText(mod.id, 'index.md')} />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CODE & NOTEBOOK (TIER C) */}
                  {isPublished && activeTab === 'code' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div
                        style={{
                          padding: '1.25rem',
                          borderRadius: '8px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                          Cara Menjalankan Eksperimen Komputasi (Tier C):
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                          Eksperimen Python dirancang mandiri menggunakan NumPy dan OpenCV (dengan opsi PyTorch jika tersedia) tanpa dependensi GPU lokal.
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--primary)' }}>
                              <Terminal size={14} /> Standalone Python CLI
                            </div>
                            <pre style={{ margin: 0, padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-subtle)', fontSize: '0.8rem', overflowX: 'auto' }}>
                              <code>python content/advanced/{mod.id}/examples/example-01.py</code>
                            </pre>
                          </div>

                          <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--accent)' }}>
                              <BookOpen size={14} /> Jupyter Notebook
                            </div>
                            <pre style={{ margin: 0, padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-subtle)', fontSize: '0.8rem', overflowX: 'auto' }}>
                              <code>jupyter notebook content/advanced/{mod.id}/notebooks/{mod.id}-lab.ipynb</code>
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                            Source Code Standalone: <code>example-01.py</code>
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Verifikasi CPU NumPy/OpenCV
                          </span>
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: '1rem',
                            borderRadius: '8px',
                            background: '#0d1117',
                            color: '#c9d1d9',
                            fontSize: '0.825rem',
                            maxHeight: '480px',
                            overflowY: 'auto',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: '1.5',
                          }}
                        >
                          <code>{getAdvancedText(mod.id, 'examples/example-01.py')}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SYLLABUS, LEARNING OBJECTIVES & TOPICS (Always accessible or active for planned modules) */}
                  {(activeTab === 'syllabus' || !isPublished) && (
                    <div>
                      {/* Learning Objectives */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                          Capaian Pembelajaran (Learning Objectives):
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                          {mod.learningObjectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 5 Structured Topics */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                          Daftar Topik &amp; Fokus Matematis:
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                          {mod.topics.map((t) => (
                            <div
                              key={t.topicNumber}
                              style={{
                                padding: '0.6rem 0.8rem',
                                background: 'var(--bg-subtle)',
                                borderRadius: '6px',
                                borderLeft: '3px solid var(--primary)',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                Topik {t.topicNumber}: {t.title}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                {t.mathematicalFocus}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mathematical & Programming Competencies */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                            Kompetensi Matematika Diperlukan:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            {mod.prerequisites.mathCompetencies.map((mc, idx) => (
                              <li key={idx}>{mc}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                            Kompetensi Pemrograman Diperlukan:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            {mod.prerequisites.programmingCompetencies.map((pc, idx) => (
                              <li key={idx}>{pc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Benchmarks & Artifacts */}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>
                          🔬 Lab Interaktif:{' '}
                          <strong style={{ color: 'var(--text)' }}>
                            {mod.interactiveLab.title} ({mod.interactiveLab.tier})
                          </strong>
                        </div>
                        <div>
                          📓 Notebook:{' '}
                          <strong style={{ color: 'var(--text)' }}>{mod.notebooks[0]?.title}</strong>
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

      {/* Footer Callout to Research */}
      <div
        style={{
          marginTop: '3rem',
          padding: '1.75rem',
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
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
            Lanjut ke Jalur Penelitian Ilmiah (Research Tracks)?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Eksplorasi 6 Research Tracks (R01–R06) dengan evaluasi benchmark resmi (COCO, MOT17), protokol multi-seed (N ≥ 3), dan target publikasi.
          </p>
        </div>
        <button
          onClick={onNavigateToResearch}
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
          Buka Research Tracks <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
