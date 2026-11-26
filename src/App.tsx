import { useState, useEffect } from 'react';
import {
  BookOpen,
  Compass,
  FlaskConical,
  Sun,
  Moon,
  Clock,
  ArrowRight,
  Search,
  Code2,
  Sparkles,
  Info,
  Tv,
  HelpCircle,
  FileBadge,
  Layers,
  GraduationCap,
  Microscope,
  Network
} from 'lucide-react';
import { AdvancedCurriculumView } from './components/AdvancedCurriculumView';
import { ResearchTracksView } from './components/ResearchTracksView';
import { InteractiveRoadmapView } from './components/InteractiveRoadmapView';
import { AcademicExportToolbar } from './components/AcademicExportToolbar';
import {
  masterCurriculum,
  learningTracks,
  getChapterById,
  getChapterText,
  getChapterJson,
  type SlideData,
  type QuizQuestion,
  type ExerciseItem,
  type AcademicReference,
  type MediaAsset,
} from './lib/content';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { PresentationViewer } from './components/PresentationViewer';
import { QuizView } from './components/QuizView';
import { LaboratoryCatalogView, LabRenderer } from './components/LaboratoryCatalogView';

type NavTab = 'home' | 'curriculum' | 'tracks' | 'roadmap' | 'advanced' | 'research' | 'chapter' | 'playgrounds' | 'about';
type ChapterSubTab = 'reading' | 'slides' | 'lab' | 'quiz' | 'references';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('app_theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeChapterId, setActiveChapterId] = useState<string>('01');
  const [chapterSubTab, setChapterSubTab] = useState<ChapterSubTab>('reading');

  // Search & Filter state for Curriculum
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active track filter in Tracks tab
  const [selectedTrackId, setSelectedTrackId] = useState<string>('digital-image-processing');

  // Active lab in Playgrounds tab (null = show catalog, string = active workspace)
  const [activeLabTab, setActiveLabTab] = useState<string | null>(null);

  // Active module in Advanced tab (null = show catalog, string = active workspace)
  const [activeAdvancedModuleId, setActiveAdvancedModuleId] = useState<string | null>(null);

  // Active track in Research tab (null = show catalog, string = active workspace)
  const [activeResearchTrackId, setActiveResearchTrackId] = useState<string | null>(null);

  // Active track/node in Roadmap tab (null = show overview, string = focus mode)
  const [activeRoadmapTrackId, setActiveRoadmapTrackId] = useState<string | null>(null);

  // Sync Theme attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('app_theme', theme);
    } catch {
      // Storage blocked or unavailable
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Hash-based routing for static hosting compatibility
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash) return;
      if (rawHash === 'advanced' || rawHash.startsWith('advanced/')) {
        setCurrentTab('advanced');
        const modKey = rawHash.replace(/^advanced\/?/, '').trim();
        setActiveAdvancedModuleId(modKey || null);
      } else if (rawHash === 'research' || rawHash.startsWith('research/')) {
        setCurrentTab('research');
        const trackKey = rawHash.replace(/^research\/?/, '').trim();
        setActiveResearchTrackId(trackKey || null);
      } else if (rawHash === 'curriculum') {
        setCurrentTab('curriculum');
      } else if (rawHash === 'tracks') {
        setCurrentTab('tracks');
      } else if (rawHash === 'roadmap' || rawHash.startsWith('roadmap/')) {
        setCurrentTab('roadmap');
        const rKey = rawHash.replace(/^roadmap\/?/, '').split('?')[0].trim();
        setActiveRoadmapTrackId(rKey || null);
      } else if (rawHash === 'playgrounds' || rawHash.startsWith('playgrounds/')) {
        setCurrentTab('playgrounds');
        const labKey = rawHash.replace(/^playgrounds\/?/, '').trim();
        setActiveLabTab(labKey || null);
      } else if (rawHash === 'about') {
        setCurrentTab('about');
      } else if (rawHash === 'home') {
        setCurrentTab('home');
      } else if (rawHash.startsWith('chapter/')) {
        const parts = rawHash.replace('chapter/', '').split('/');
        const cid = parts[0];
        const sub = parts[1];
        if (cid) {
          setActiveChapterId(cid);
          if (sub && ['reading', 'slides', 'lab', 'quiz', 'references'].includes(sub)) {
            setChapterSubTab(sub as ChapterSubTab);
          }
          setCurrentTab('chapter');
        }
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      window.location.hash = '';
    } else if (tab === 'chapter') {
      window.location.hash = `#/chapter/${activeChapterId}`;
    } else if (tab === 'playgrounds') {
      window.location.hash = activeLabTab ? `#/playgrounds/${activeLabTab}` : '#/playgrounds';
    } else if (tab === 'advanced') {
      window.location.hash = activeAdvancedModuleId ? `#/advanced/${activeAdvancedModuleId}` : '#/advanced';
    } else if (tab === 'research') {
      window.location.hash = activeResearchTrackId ? `#/research/${activeResearchTrackId}` : '#/research';
    } else {
      window.location.hash = `#/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLab = (labId: string | null) => {
    setActiveLabTab(labId);
    if (labId) {
      window.location.hash = `#/playgrounds/${labId}`;
    } else {
      window.location.hash = '#/playgrounds';
    }
  };

  const handleSelectAdvancedModule = (moduleId: string | null) => {
    setActiveAdvancedModuleId(moduleId);
    if (moduleId) {
      window.location.hash = `#/advanced/${moduleId}`;
    } else {
      window.location.hash = '#/advanced';
    }
  };

  const handleSelectResearchTrack = (trackId: string | null) => {
    setActiveResearchTrackId(trackId);
    if (trackId) {
      window.location.hash = `#/research/${trackId}`;
    } else {
      window.location.hash = '#/research';
    }
  };

  const navigateToChapter = (id: string, subTab: ChapterSubTab = 'reading') => {
    setActiveChapterId(id);
    setChapterSubTab(subTab);
    setCurrentTab('chapter');
    window.location.hash = `#/chapter/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered chapters for Curriculum view
  const filteredChapters = masterCurriculum.chapters.filter((ch) => {
    const matchQuery =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.id.includes(searchQuery) ||
      ch.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSection = selectedSection === 'all' || ch.sectionId === selectedSection;
    const matchDiff = selectedDifficulty === 'all' || ch.difficulty === selectedDifficulty;
    return matchQuery && matchSection && matchDiff;
  });

  // Current active chapter data
  const currentChapter = getChapterById(activeChapterId) || masterCurriculum.chapters[9]; // default ch 10
  const readingText = getChapterText(currentChapter.id, currentChapter.resources.reading.path);
  const slidesData = getChapterJson<SlideData[]>(currentChapter.id, currentChapter.resources.slides.path) || [];
  const quizData = getChapterJson<QuizQuestion[]>(currentChapter.id, currentChapter.resources.quiz.path) || [];
  const exercisesData = getChapterJson<ExerciseItem[]>(currentChapter.id, currentChapter.resources.exercises.path) || [];
  const referencesData = getChapterJson<AcademicReference[]>(currentChapter.id, currentChapter.resources.references.path) || [];
  const mediaData = getChapterJson<MediaAsset[]>(currentChapter.id, currentChapter.resources.media.path) || [];
  const pythonCode = getChapterText(currentChapter.id, currentChapter.resources.practice.path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav className="navbar">
        <div
          className="nav-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentTab('home')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #38bdf8, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#090d16',
                fontWeight: 900,
                fontSize: '1.1rem',
              }}
            >
              M
            </div>
            <span>Multimedia &amp; Computer Vision Hub</span>
          </div>
          <span className="brand-badge">ITERA</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
          >
            Beranda
          </button>
          <button
            className={`nav-btn ${currentTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => handleTabChange('curriculum')}
          >
            <BookOpen size={16} />
            Core L1–L2
          </button>
          <button
            className={`nav-btn ${currentTab === 'tracks' ? 'active' : ''}`}
            onClick={() => handleTabChange('tracks')}
          >
            <Compass size={16} />
            Learning Tracks
          </button>
          <button
            className={`nav-btn ${currentTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleTabChange('roadmap')}
          >
            <Network size={16} />
            Roadmap DAG
          </button>
          <button
            className={`nav-btn ${currentTab === 'advanced' ? 'active' : ''}`}
            onClick={() => handleTabChange('advanced')}
          >
            <Layers size={16} />
            Advanced L3
          </button>
          <button
            className={`nav-btn ${currentTab === 'research' ? 'active' : ''}`}
            onClick={() => handleTabChange('research')}
          >
            <Microscope size={16} />
            Research L4
          </button>
          <button
            className={`nav-btn ${currentTab === 'playgrounds' ? 'active' : ''}`}
            onClick={() => handleTabChange('playgrounds')}
          >
            <FlaskConical size={16} />
            Laboratorium
          </button>
          <button
            className={`nav-btn ${currentTab === 'about' ? 'active' : ''}`}
            onClick={() => handleTabChange('about')}
          >
            <Info size={16} />
            Tentang
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ flex: 1 }}>
        {/* =========================================================================
            TAB 1: BERANDA (HOME)
           ========================================================================= */}
        {currentTab === 'home' && (
          <div className="container">
            <header className="hero">
              <div className="hero-tag">
                <GraduationCap size={15} />
                <span>Open Educational Learning Platform · ITERA</span>
              </div>
              <h1 className="hero-title">
                Multimedia &amp; <span>Computer Vision</span> Learning Hub
              </h1>
              <p className="hero-subtitle">
                {masterCurriculum.tagline}
              </p>
              <div className="hero-meta">
                <div className="hero-meta-item">
                  <span style={{ color: 'var(--text-muted)' }}>Created &amp; Developed by:</span>
                  <strong style={{ color: 'var(--text)' }}>{masterCurriculum.author}</strong>
                </div>
                <div className="hero-meta-item">
                  <span style={{ color: 'var(--text-muted)' }}>Institusi:</span>
                  <strong style={{ color: 'var(--primary)' }}>{masterCurriculum.institution}</strong>
                </div>
              </div>

              {/* Primary Call-to-Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.75rem' }}>
                <button
                  className="control-btn"
                  onClick={() => navigateToChapter('01')}
                  style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, padding: '0.65rem 1.35rem', fontSize: '0.95rem' }}
                >
                  <Sparkles size={16} />
                  <span>Mulai Belajar (Bab 01)</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleTabChange('curriculum')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <BookOpen size={16} />
                  <span>Jelajahi Kurikulum Core</span>
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleTabChange('roadmap')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <Network size={16} />
                  <span>Jelajahi Peta Pembelajaran</span>
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleTabChange('advanced')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <Layers size={16} />
                  <span>Advanced L3</span>
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleTabChange('playgrounds')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <FlaskConical size={16} />
                  <span>Laboratorium (63 Lab)</span>
                </button>
              </div>
            </header>

            {/* Platform Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">60</div>
                <div className="stat-label">Bab Kurikulum Terstruktur</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Bagian Keilmuan (Sections)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">6</div>
                <div className="stat-label">Jalur Belajar (Tracks)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">18</div>
                <div className="stat-label">Laboratorium Interaktif</div>
              </div>
            </div>

            {/* Section 01, 02 & 03 Published Modules Showcase */}
            {[
              {
                title: 'Seksi 01 — Multimedia & Signal Foundations (Bab 01–05)',
                desc: 'Fondasi esensial komputasi multimedia digital: representasi sinyal, pensampelan Nyquist, kuantisasi, format berkas, lingkungan Python, dan manipulasi tensor NumPy.',
                sliceStart: 0,
                sliceEnd: 5,
              },
              {
                title: 'Seksi 02 — Digital Image Processing Fundamentals (Bab 06–10)',
                desc: 'Representasi piksel & koordinat, ruang warna HSV/YCbCr/CIELAB, transformasi intensitas titik, ekualisasi histogram & CLAHE, serta konvolusi spasial 2D.',
                sliceStart: 5,
                sliceEnd: 10,
              },
              {
                title: 'Seksi 03 — Advanced Digital Image Processing (Bab 11–15)',
                desc: 'Pemrosesan domain frekuensi 2D FFT, restorasi citra (Bilateral, NLM, Wiener), deteksi tepi Canny & sudut Harris, morfologi himpunan, hingga segmentasi Otsu & morfometri objek.',
                sliceStart: 10,
                sliceEnd: 15,
              },
            ].map((sec) => (
              <div key={sec.title} style={{ margin: '2.25rem 0 1.5rem' }}>
                <div className="section-title">
                  <Sparkles size={22} color="var(--primary)" />
                  <span>{sec.title}</span>
                </div>
                <p className="section-desc">{sec.desc}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.1rem' }}>
                  {masterCurriculum.chapters.slice(sec.sliceStart, sec.sliceEnd).map((ch) => (
                    <div
                      key={ch.id}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        borderColor: 'var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                      }}
                      onClick={() => navigateToChapter(ch.id)}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>BAB {ch.id}</span>
                          <span className="card-badge badge-published">Terpublikasi</span>
                        </div>
                        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text)' }}>
                          {ch.title}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '0.9rem' }}>
                          {ch.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                        <span>Buka Bab &amp; Lab</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Callout to Featured Representative Chapter */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(52, 211, 153, 0.1) 100%)',
                border: '1px solid var(--primary)',
                padding: '2rem',
                margin: '2rem 0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={16} />
                    <span>MODUL UNGGULAN TERPUBLIKASI LENGKAP</span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Chapter 10: Spatial Filtering &amp; Convolution
                  </h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '1rem', marginBottom: '1.25rem' }}>
                    Pelajari formulasi matematis konvolusi spasial 2D, pembuktian sifat separabilitas kernel Gaussian,
                    analisis boundary padding, dan eksperimen langsung pada interactive canvas playground.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      className="control-btn"
                      onClick={() => navigateToChapter('10', 'reading')}
                      style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, padding: '0.65rem 1.25rem' }}
                    >
                      Buka Modul Teori
                      <ArrowRight size={16} />
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => navigateToChapter('10', 'slides')}
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      <Tv size={16} />
                      Lihat Presentasi Slide
                    </button>
                    <button
                      className="control-btn"
                      onClick={() => navigateToChapter('10', 'lab')}
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      <FlaskConical size={16} />
                      Uji Laboratorium Gaussian
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Learning Tracks Preview */}
            <div style={{ margin: '3rem 0 1rem' }}>
              <div className="section-title">
                <Compass size={22} color="var(--primary)" />
                <span>6 Jalur Spesialisasi (Learning Tracks)</span>
              </div>
              <p className="section-desc">
                Pilih jalur pembelajaran terfokus yang memetakan bab-bab kanonikal secara terarah dan progresif.
              </p>

              <div className="curriculum-grid">
                {learningTracks.map((track) => (
                  <div
                    key={track.id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      setCurrentTab('tracks');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: `${track.color}20`,
                          border: `1px solid ${track.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: track.color,
                        }}
                      >
                        <Layers size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{track.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          {track.chapterIds.length} Modul Terkait
                        </span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {track.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: track.color, fontSize: '0.85rem', fontWeight: 600 }}>
                      <span>Jelajahi Jalur Ini</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: MASTER CURRICULUM (60 CHAPTERS)
           ========================================================================= */}
        {currentTab === 'curriculum' && (
          <div className="container">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Kurikulum Core (60 Bab)
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                Peta kurikulum lengkap 12 seksi yang mencakup pemrosesan sinyal multimedia hingga arsitektur visi komputer cerdas.
              </p>
            </div>

            {/* Quick Start Callout */}
            <div
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                background: 'var(--primary-glow)',
                borderColor: 'var(--primary)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Langkah Awal Pembelajaran Kurikulum Core
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text)' }}>
                  Mulai dari Bab 01: Sinyal &amp; Sistem Multimedia Digital
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Pelajari fondasi sinyal kontinu vs diskrit, model sampling Nyquist, representasi matriks, dan coba laboratorium interaktif.
                </p>
              </div>
              <button
                className="control-btn"
                onClick={() => navigateToChapter('01')}
                style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, padding: '0.65rem 1.25rem' }}
              >
                <span>Buka Bab 01</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="filter-bar">
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Cari judul bab, seksi, atau nomor..."
                  className="search-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  className="select-filter"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="all">Semua Seksi (01 - 12)</option>
                  {masterCurriculum.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Seksi {sec.id} — {sec.title}
                    </option>
                  ))}
                </select>

                <select
                  className="select-filter"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">Semua Kesulitan</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Curriculum Cards Grid */}
            <div className="curriculum-grid">
              {filteredChapters.map((ch) => {
                const isPublished = ch.status === 'published';

                return (
                  <div
                    key={ch.id}
                    className="card"
                    style={{
                      cursor: isPublished ? 'pointer' : 'default',
                      borderColor: isPublished ? 'var(--primary)' : 'var(--border)',
                    }}
                    onClick={() => {
                      if (isPublished) navigateToChapter(ch.id);
                    }}
                  >
                    <div className="card-header">
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                          SEKSI {ch.sectionId} · BAB {ch.id}
                        </span>
                        <h3 className="card-title" style={{ marginTop: '0.2rem' }}>
                          {ch.title}
                        </h3>
                      </div>
                      <span className={`card-badge ${isPublished ? 'badge-published' : 'badge-draft'}`}>
                        {isPublished ? 'Tersedia' : 'Dalam Rencana'}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {ch.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} />
                        <span>{ch.durationMinutes} Menit</span>
                      </div>
                      <span style={{ textTransform: 'capitalize' }}>{ch.difficulty}</span>
                      {isPublished && (
                        <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          Buka Materi <ArrowRight size={13} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LEARNING TRACKS
           ========================================================================= */}
        {currentTab === 'tracks' && (
          <div className="container">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                6 Learning Tracks Terakreditasi
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                Kurikulum terarah yang mengaitkan modul-modul kanonikal tanpa menduplikasi berkas materi.
              </p>
              <div style={{ marginTop: '0.85rem' }}>
                <button
                  type="button"
                  className="control-btn"
                  onClick={() => handleTabChange('roadmap')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  <Network size={16} />
                  <span>Buka Peta Pembelajaran Interaktif (DAG Roadmap)</span>
                </button>
              </div>
            </div>

            {/* Track Selector Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
              {learningTracks.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedTrackId(tr.id)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    background: selectedTrackId === tr.id ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: selectedTrackId === tr.id ? 'var(--on-primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Layers size={15} />
                  <span>{tr.title}</span>
                </button>
              ))}
            </div>

            {/* Active Track View */}
            {(() => {
              const activeTrack = learningTracks.find((t) => t.id === selectedTrackId) || learningTracks[0];
              const trackChapters = activeTrack.chapterIds
                .map((id) => getChapterById(id))
                .filter(Boolean) as typeof masterCurriculum.chapters;

              return (
                <div>
                  <div
                    className="card"
                    style={{
                      background: 'var(--bg-card)',
                      borderLeft: `5px solid ${activeTrack.color}`,
                      marginBottom: '2rem',
                    }}
                  >
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
                      {activeTrack.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {activeTrack.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      <div>Total Modul: <strong style={{ color: 'var(--text)' }}>{trackChapters.length} Bab</strong></div>
                      <div>Prasyarat Awal: <strong style={{ color: 'var(--primary)' }}>{activeTrack.prerequisites.map(p => `Bab ${p}`).join(', ')}</strong></div>
                    </div>
                  </div>

                  {/* Track Timeline / Milestone sequence */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trackChapters.map((ch, idx) => {
                      const isPublished = ch.status === 'published';

                      return (
                        <div
                          key={ch.id}
                          className="card"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            cursor: isPublished ? 'pointer' : 'default',
                            borderColor: isPublished ? 'var(--primary)' : 'var(--border)',
                          }}
                          onClick={() => {
                            if (isPublished) navigateToChapter(ch.id);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: isPublished ? 'var(--primary)' : 'var(--bg-subtle)',
                                color: isPublished ? 'var(--on-primary)' : 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                Bab {ch.id} · Seksi {ch.sectionId} ({ch.sectionTitle})
                              </div>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                                {ch.title}
                              </h3>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={`card-badge ${isPublished ? 'badge-published' : 'badge-draft'}`}>
                              {isPublished ? 'Tersedia' : 'Dalam Rencana'}
                            </span>
                            {isPublished && <ArrowRight size={18} color="var(--primary)" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            TAB 4: CHAPTER 10 DETAIL VIEW (FEATURED REPRESENTATIVE TEMPLATE)
           ========================================================================= */}
        {currentTab === 'chapter' && (
          <div className="container">
            {/* Chapter Hero */}
            <header className="chapter-hero">
              <div className="chapter-meta-tags">
                <span className="brand-badge">Seksi {currentChapter.sectionId} — {currentChapter.sectionTitle}</span>
                <span className="card-badge badge-published">Status: Terpublikasi</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> {currentChapter.durationMinutes} Menit
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Kesulitan: {currentChapter.difficulty}
                </span>
              </div>

              <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Chapter {currentChapter.id}: {currentChapter.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '820px' }}>
                {currentChapter.description}
              </p>

              {/* Academic Slide & Material Export Bar */}
              <div style={{ marginTop: '1.25rem' }}>
                <AcademicExportToolbar
                  type="chapter"
                  id={currentChapter.id}
                  title={currentChapter.title}
                />
              </div>
            </header>

            {/* Chapter Navigation Tabs */}
            <div className="chapter-tabs">
              <button
                className={`tab-btn ${chapterSubTab === 'reading' ? 'active' : ''}`}
                onClick={() => setChapterSubTab('reading')}
              >
                <BookOpen size={16} />
                <span>Modul Pembelajaran (Reading)</span>
              </button>
              <button
                className={`tab-btn ${chapterSubTab === 'slides' ? 'active' : ''}`}
                onClick={() => setChapterSubTab('slides')}
              >
                <Tv size={16} />
                <span>Presentasi Slide ({slidesData.length} Slide)</span>
              </button>
              <button
                className={`tab-btn ${chapterSubTab === 'lab' ? 'active' : ''}`}
                onClick={() => setChapterSubTab('lab')}
              >
                <FlaskConical size={16} />
                <span>Laboratorium &amp; Python</span>
              </button>
              <button
                className={`tab-btn ${chapterSubTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setChapterSubTab('quiz')}
              >
                <HelpCircle size={16} />
                <span>Kuis Evaluasi ({quizData.length} Soal)</span>
              </button>
              <button
                className={`tab-btn ${chapterSubTab === 'references' ? 'active' : ''}`}
                onClick={() => setChapterSubTab('references')}
              >
                <FileBadge size={16} />
                <span>Referensi &amp; Media ({referencesData.length})</span>
              </button>
            </div>

            {/* Sub-tab 1: Reading Content */}
            {chapterSubTab === 'reading' && (
              <div className="card" style={{ padding: '2.5rem' }}>
                <MarkdownRenderer content={readingText} />
              </div>
            )}

            {/* Sub-tab 2: Presentation Slides Viewer */}
            {chapterSubTab === 'slides' && (
              <div>
                <PresentationViewer
                  key={currentChapter.id}
                  slides={slidesData}
                  chapterNumber={currentChapter.id}
                  chapterTitle={currentChapter.title}
                />
              </div>
            )}

            {/* Sub-tab 3: Interactive Lab & Python Practice */}
            {chapterSubTab === 'lab' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <LabRenderer labId={currentChapter.id === '10' ? 'image' : `ch${currentChapter.id}`} />

                {/* Python Practice Section */}
                <div className="card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Code2 size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      Implementasi Python &amp; Verifikasi Numerik
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    Kode program Python di bawah ini menguji implementasi algoritma Bab {currentChapter.id} secara mandiri untuk eksperimen lokal dan verifikasi komputasi.
                  </p>
                  <pre style={{ background: '#020617', padding: '1.25rem', borderRadius: '8px', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#e2e8f0', border: '1px solid var(--border)' }}>
                    <code>{pythonCode}</code>
                  </pre>
                </div>

                {/* Exercises Section */}
                {exercisesData.length > 0 && (
                  <div className="card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                      Latihan Terbimbing (Guided Exercises)
                    </h3>
                    {exercisesData.map((ex) => (
                      <div key={ex.id} style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{ex.title}</strong>
                          <span className="card-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                            {ex.difficulty}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                          {ex.instruction}
                        </p>
                        <details style={{ marginTop: '0.5rem' }}>
                          <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                            Lihat Solusi Referensi Python
                          </summary>
                          <pre style={{ background: '#020617', padding: '1rem', borderRadius: '6px', marginTop: '0.5rem', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#e2e8f0' }}>
                            <code>{ex.solution}</code>
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 4: Quiz Assessment */}
            {chapterSubTab === 'quiz' && (
              <div>
                <QuizView questions={quizData} />
              </div>
            )}

            {/* Sub-tab 5: Academic References & Media Attribution */}
            {chapterSubTab === 'references' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Academic Citations */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Daftar Rujukan Akademik
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {referencesData.map((ref) => (
                      <div key={ref.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                          <a href={ref.url} target="_blank" rel="noopener noreferrer">
                            {ref.title}
                          </a>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          {ref.authors} ({ref.year}). <em>{ref.publisher}</em>.
                        </div>
                        {ref.annotation && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                            {ref.annotation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Registry & Attribution */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Registri Aset Multimedia &amp; Hak Cipta
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mediaData.map((m) => (
                      <div key={m.id} style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <strong style={{ color: 'var(--text)' }}>{m.title}</strong>
                          <span className="card-badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                            {m.license}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          <strong>Sumber:</strong> {m.source} · <strong>Pembuat:</strong> {m.creator}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          <strong>Atribusi:</strong> {m.attribution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: PLAYGROUNDS HUB (63 INTERACTIVE LABORATORIES)
           ========================================================================= */}
        {currentTab === 'playgrounds' && (
          <LaboratoryCatalogView
            activeLabId={activeLabTab}
            onSelectLab={handleSelectLab}
            onNavigateToChapter={navigateToChapter}
          />
        )}

        {/* =========================================================================
            TAB: INTERACTIVE LEARNING ROADMAP (PHASE AC-01)
           ========================================================================= */}
        {currentTab === 'roadmap' && (
          <InteractiveRoadmapView
            initialTrackId={activeRoadmapTrackId || undefined}
            onNavigateToRoute={(route) => {
              window.location.hash = route;
            }}
          />
        )}

        {/* =========================================================================
            TAB 6: ADVANCED CURRICULUM (L3)
           ========================================================================= */}
        {currentTab === 'advanced' && (
          <AdvancedCurriculumView
            activeModuleId={activeAdvancedModuleId}
            onSelectModule={handleSelectAdvancedModule}
            onSelectCoreChapter={navigateToChapter}
            onNavigateToResearch={() => handleTabChange('research')}
          />
        )}

        {/* =========================================================================
            TAB 7: RESEARCH TRACKS (L4)
           ========================================================================= */}
        {currentTab === 'research' && (
          <ResearchTracksView
            activeTrackId={activeResearchTrackId}
            onSelectTrack={handleSelectResearchTrack}
            onSelectCoreChapter={navigateToChapter}
            onNavigateToAdvanced={(mid) => {
              if (mid) {
                handleSelectAdvancedModule(mid);
                setCurrentTab('advanced');
              } else {
                handleTabChange('advanced');
              }
            }}
          />
        )}

        {/* =========================================================================
            TAB 8: ABOUT & INSTITUTIONAL PROFILE
           ========================================================================= */}
        {currentTab === 'about' && (
          <div className="container" style={{ maxWidth: '860px' }}>
            <div className="card" style={{ padding: '2.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                Tentang Multimedia &amp; Computer Vision Learning Hub
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Platform ini adalah perpustakaan pembelajaran terbuka (*open educational learning library*) yang dirancang secara terstruktur untuk mendukung pembelajaran komprehensif dari representasi sinyal digital dasar hingga sistem visi dan audio cerdas berbasis kecerdasan buatan.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--primary)' }}>
                Arsitektur &amp; Pengembang
              </h2>
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '8px', lineHeight: 1.8 }}>
                <div><strong>Pengembang &amp; Arsitek Konten:</strong> Aji Pamungkas Tri Nurcahyo</div>
                <div><strong>Afiliasi Akademik:</strong> Institut Teknologi Sumatera (ITERA)</div>
                <div><strong>Tagline Platform:</strong> From Digital Media to Intelligent Visual &amp; Audio Systems</div>
                <div><strong>Kurikulum Kanonikal:</strong> 60 Bab Terstruktur, 12 Seksi Kurikulum, 6 Jalur Belajar</div>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--primary)' }}>
                Prinsip Desain &amp; Integritas Akademik
              </h2>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                <li><strong>Content-Driven Architecture:</strong> Seluruh materi pembelajaran, kuis, latihan, dan presentasi terpisah dari logika komponen React sehingga mudah dirawat oleh dosen dan editor konten.</li>
                <li><strong>Academic Rigor:</strong> Menghindari klaim tanpa pembuktian matematis; setiap bab dilengkapi persamaan analitis, analisis kompleksitas, dan rujukan buku teks berbobot.</li>
                <li><strong>No Unwanted Branding:</strong> Sistem presentasi slide dirancang bersih dengan identitas resmi kampus tanpa watermark pihak ketiga.</li>
                <li><strong>Asset Verification:</strong> Seluruh diagram visual memiliki metadata lisensi terbuka (CC-BY-4.0) yang terdokumentasi rapi.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Global Site Footer */}
      <footer className="site-footer">
        <div className="footer-brand">Multimedia &amp; Computer Vision Learning Hub</div>
        <div style={{ marginBottom: '0.5rem' }}>
          Institut Teknologi Sumatera (ITERA) · Created &amp; Developed by <strong>Aji Pamungkas Tri Nurcahyo</strong>
        </div>
        <div>
          Open Educational Learning Platform · 60 Canonical Chapters · All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
