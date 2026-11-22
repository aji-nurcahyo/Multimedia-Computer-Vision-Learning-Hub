import React, { useState } from 'react';
import {
  Layers,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  X,
  FlaskConical,
  Code2,
  CheckCircle2,
  FileText,
  Compass,
  RotateCcw,
} from 'lucide-react';
import {
  advancedModules,
  type AdvancedModule,
  getAdvancedText,
  getAdvancedModuleById,
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
  activeModuleId?: string | null;
  onSelectModule?: (moduleId: string | null) => void;
  onSelectCoreChapter: (chapterId: string) => void;
  onNavigateToResearch: () => void;
}

type ModuleTab = 'theory' | 'lab' | 'code' | 'syllabus';

export const AdvancedCurriculumView: React.FC<AdvancedCurriculumViewProps> = ({
  activeModuleId: propActiveModuleId,
  onSelectModule: propOnSelectModule,
  onSelectCoreChapter,
  onNavigateToResearch,
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const currentModuleId = propActiveModuleId !== undefined ? propActiveModuleId : internalActiveId;

  const handleSelectModule = (id: string | null) => {
    if (propOnSelectModule) {
      propOnSelectModule(id);
    } else {
      setInternalActiveId(id);
    }
  };

  const [selectedPillar, setSelectedPillar] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ModuleTab>('theory');

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

  // =========================================================================
  // VIEW MODE A: FOCUSED ACADEMIC WORKSPACE
  // =========================================================================
  const currentModule = currentModuleId ? getAdvancedModuleById(currentModuleId) : null;

  if (currentModule) {
    const theoryContent = getAdvancedText(currentModule.id, 'index.md');
    const pythonCode = getAdvancedText(currentModule.id, 'examples/example-01.py');

    return (
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {/* Topbar Workspace */}
        <div className="academic-workspace-topbar">
          <div className="academic-workspace-topbar-left">
            <button
              onClick={() => handleSelectModule(null)}
              className="academic-workspace-back-btn"
              title="Kembali ke Katalog Modul L3"
            >
              <ArrowLeft size={16} />
              <span>Katalog L3</span>
            </button>
            <div className="academic-workspace-divider" />
            <div className="academic-workspace-info">
              <span className="academic-workspace-badge">{currentModule.code}</span>
              <h2 className="academic-workspace-title">{currentModule.title}</h2>
            </div>
          </div>

          <div className="academic-workspace-topbar-right">
            {/* Prerequisite Core chapters links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Prasyarat:</span>
              {currentModule.prerequisites.coreChapters.map((cid) => (
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
                  title={`Buka materi Kurikulum Inti Bab ${cid}`}
                >
                  Bab {cid}
                </button>
              ))}
            </div>

            {/* Quick module switcher */}
            <div className="academic-workspace-switcher">
              <select
                aria-label="Pilih Modul L3"
                value={currentModule.id}
                onChange={(e) => handleSelectModule(e.target.value)}
                className="academic-workspace-select"
              >
                {advancedModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Module Description & Meta Banner */}
        <div className="academic-workspace-desc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Pilar {currentModule.pillar}: {currentModule.pillarName}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Level L3 (Pascasarjana &amp; Riset Terapan)
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                  Estimasi: {currentModule.estimatedHours} Jam Belajar
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text)' }}>
                {currentModule.subtitle}
              </h1>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '960px' }}>
                {currentModule.description}
              </p>
            </div>

            <button
              onClick={onNavigateToResearch}
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
              title="Lihat Jalur Riset L4"
            >
              <Compass size={14} />
              <span>Jalur Riset L4</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Workspace Learning Section Tabs */}
        <div className="academic-workspace-tabs">
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={16} />
            <span>Teori &amp; Fondasi Matematis</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab')}
          >
            <FlaskConical size={16} />
            <span>Laboratorium Interaktif</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code2 size={16} />
            <span>Skrip Python &amp; Algoritma</span>
          </button>
          <button
            className={`academic-workspace-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
            onClick={() => setActiveTab('syllabus')}
          >
            <FileText size={16} />
            <span>Silabus &amp; Capaian Pembelajaran</span>
          </button>
        </div>

        {/* Workspace Body Content */}
        <div className="academic-workspace-content">
          {activeTab === 'theory' && (
            <div className="card" style={{ padding: '2.5rem' }}>
              {theoryContent ? (
                <div className="prose">
                  <MarkdownRenderer content={theoryContent} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Modul teori analitis sedang dimuat atau dalam penyiapan.
                </div>
              )}
            </div>
          )}

          {activeTab === 'lab' && (
            <div style={{ minHeight: '520px' }}>
              {renderInteractiveLab(currentModule.id)}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                    Implementasi Komputasi Mandiri (Python 3.10+ / NumPy / SciPy)
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Skrip deterministik tanpa ketergantungan framework berat untuk verifikasi formulasi analitis.
                  </p>
                </div>
                <span className="card-badge badge-published">Terverifikasi Standar AD-07</span>
              </div>

              {pythonCode ? (
                <pre style={{ borderRadius: '8px', overflowX: 'auto', maxHeight: '650px' }}>
                  <code>{pythonCode}</code>
                </pre>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Contoh kode komputasi untuk modul ini sedang dipersiapkan.
                </div>
              )}
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Learning Objectives */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
                  Capaian Pembelajaran Khusus (Learning Objectives)
                </h3>
                <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                  {currentModule.learningObjectives.map((obj, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--text)' }}>{obj}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Topics Breakdown */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
                  Daftar Topik Perkuliahan (Academic Topics Breakdown)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {currentModule.topics.map((top) => (
                    <div
                      key={top.topicNumber}
                      style={{
                        background: 'var(--bg-subtle)',
                        padding: '1rem 1.25rem',
                        borderRadius: '8px',
                        borderLeft: '4px solid var(--primary)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                          Topik {top.topicNumber}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem', color: 'var(--text)' }}>
                        {top.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>Fokus Matematis:</strong> {top.mathematicalFocus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmarks & Verification Protocols */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
                  Tolok Ukur Standar &amp; Protokol Verifikasi
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentModule.benchmarks.map((bm, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                      }}
                    >
                      {bm}
                    </span>
                  ))}
                </div>
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
          <GraduationCap size={14} />
          <span>L3 Advanced Depth · Pascasarjana &amp; Riset Terapan</span>
        </div>
        <h1 className="academic-catalog-title">
          Kurikulum Lanjut (Advanced Curriculum L3)
        </h1>
        <p className="academic-catalog-subtitle">
          8 Modul Tingkat Lanjut yang menjembatani kurikulum sarjana (Core L1–L2) menuju penelitian mandiri (Research L4)
          dengan formulasi matematis analitis, algoritma deterministik, dan laboratorium interaktif client-side.
        </p>

        {/* Summary Metric Pills */}
        <div className="academic-catalog-stats">
          <div className="academic-stat-pill">
            <strong>8 Modul</strong>
            <span>Kurikulum Tingkat Lanjut (L3)</span>
          </div>
          <div className="academic-stat-pill">
            <strong>4 Pilar</strong>
            <span>Riset Terapan Terintegrasi</span>
          </div>
          <div className="academic-stat-pill">
            <strong>8 Laboratorium</strong>
            <span>Eksperimen Interaktif Client-Side</span>
          </div>
          <div className="academic-stat-pill">
            <strong>100% Bebas</strong>
            <span>Sirkularitas Ketergantungan (DAG)</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="academic-catalog-toolbar">
        {/* Search Bar */}
        <div className="academic-search-wrapper">
          <Search size={18} className="academic-search-icon" />
          <input
            type="text"
            className="academic-search-input"
            placeholder="Cari modul L3 (contoh: SVD, ADV-01, Kalman, Attention, NeRF, LoRA, Roofline)..."
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
          Menampilkan <strong>{filteredModules.length}</strong> dari {advancedModules.length} Modul
        </div>
      </div>

      {/* Pillar Filter Pills */}
      <div className="academic-filter-nav">
        <button
          className={`academic-filter-btn ${selectedPillar === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedPillar('all')}
        >
          <span>Semua Pilar</span>
          <span className="academic-filter-count">{advancedModules.length}</span>
        </button>
        <button
          className={`academic-filter-btn ${selectedPillar === 1 ? 'active' : ''}`}
          onClick={() => setSelectedPillar(1)}
        >
          <span>Pilar 1: Intelligent CV &amp; Optimization</span>
          <span className="academic-filter-count">
            {advancedModules.filter((m) => m.pillar === 1).length}
          </span>
        </button>
        <button
          className={`academic-filter-btn ${selectedPillar === 2 ? 'active' : ''}`}
          onClick={() => setSelectedPillar(2)}
        >
          <span>Pilar 2: Perception, Sensing &amp; Tracking</span>
          <span className="academic-filter-count">
            {advancedModules.filter((m) => m.pillar === 2).length}
          </span>
        </button>
        <button
          className={`academic-filter-btn ${selectedPillar === 3 ? 'active' : ''}`}
          onClick={() => setSelectedPillar(3)}
        >
          <span>Pilar 3: Multimodal Perception &amp; Foundation Models</span>
          <span className="academic-filter-count">
            {advancedModules.filter((m) => m.pillar === 3).length}
          </span>
        </button>
        <button
          className={`academic-filter-btn ${selectedPillar === 4 ? 'active' : ''}`}
          onClick={() => setSelectedPillar(4)}
        >
          <span>Pilar 4: Efficient Edge AI Architecture</span>
          <span className="academic-filter-count">
            {advancedModules.filter((m) => m.pillar === 4).length}
          </span>
        </button>
      </div>

      {/* Advanced Modules Grid */}
      {filteredModules.length > 0 ? (
        <div className="academic-grid">
          {filteredModules.map((mod: AdvancedModule) => {
            return (
              <div
                key={mod.id}
                className="academic-card"
                onClick={() => handleSelectModule(mod.id)}
              >
                <div>
                  <div className="academic-card-header">
                    <div className="academic-card-badge-row">
                      <span className="academic-card-code-badge">{mod.code}</span>
                      <span className="academic-card-pillar-badge">
                        Pilar {mod.pillar}
                      </span>
                    </div>
                    <span className="card-badge badge-published" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                      L3 Terpublikasi
                    </span>
                  </div>

                  <h3 className="academic-card-title">{mod.title}</h3>
                  <div className="academic-card-subtitle">{mod.subtitle}</div>

                  <p className="academic-card-desc">{mod.description}</p>

                  <div className="academic-card-meta">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Estimasi Durasi:</span>
                      <strong style={{ color: 'var(--text)' }}>{mod.estimatedHours} Jam Belajar</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Prasyarat Core:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {mod.prerequisites.coreChapters.map((c) => `Bab ${c}`).join(', ')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="academic-card-actions">
                  <button
                    className="academic-card-primary-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModule(mod.id);
                    }}
                  >
                    <span>Buka Modul L3</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="academic-empty-state">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-dim)' }}>
            <Layers size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            Modul Tingkat Lanjut Tidak Ditemukan
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Tidak ada modul L3 yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada filter pilar saat ini.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPillar('all');
            }}
            className="control-btn"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600 }}
          >
            <RotateCcw size={14} />
            <span>Reset Pencarian &amp; Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
