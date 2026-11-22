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
  Microscope
} from 'lucide-react';
import { AdvancedCurriculumView } from './components/AdvancedCurriculumView';
import { ResearchTracksView } from './components/ResearchTracksView';
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
import { ImageProcessingLab } from './components/playgrounds/ImageProcessingLab';
import { AudioProcessingLab } from './components/playgrounds/AudioProcessingLab';
import { VideoProcessingLab } from './components/playgrounds/VideoProcessingLab';
import { ComputerVisionLab } from './components/playgrounds/ComputerVisionLab';
import { MultimediaDataExplorer } from './components/playgrounds/MultimediaDataExplorer';
import { SamplingQuantizationSimulator } from './components/playgrounds/SamplingQuantizationSimulator';
import { FormatSizeExplorer } from './components/playgrounds/FormatSizeExplorer';
import { EnvironmentChecklist } from './components/playgrounds/EnvironmentChecklist';
import { ArrayExplorer } from './components/playgrounds/ArrayExplorer';
import { PixelImageExplorer } from './components/playgrounds/PixelImageExplorer';
import { ColorSpaceConverterLab } from './components/playgrounds/ColorSpaceConverterLab';
import { ImageEnhancementLab } from './components/playgrounds/ImageEnhancementLab';
import { HistogramExplorerLab } from './components/playgrounds/HistogramExplorerLab';
import { FftExplorerLab } from './components/playgrounds/FftExplorerLab';
import { ImageRestorationLab } from './components/playgrounds/ImageRestorationLab';
import { EdgeFeatureExplorerLab } from './components/playgrounds/EdgeFeatureExplorerLab';
import { MorphologyLab } from './components/playgrounds/MorphologyLab';
import { SegmentationLab } from './components/playgrounds/SegmentationLab';
import { AudioSignalExplorer } from './components/playgrounds/AudioSignalExplorer';
import { SamplingChannelLab } from './components/playgrounds/SamplingChannelLab';
import { AudioFftAnalyzer } from './components/playgrounds/AudioFftAnalyzer';
import { AudioFilteringLab } from './components/playgrounds/AudioFilteringLab';
import { SpectrogramExplorer } from './components/playgrounds/SpectrogramExplorer';
import { AudioFeatureLab } from './components/playgrounds/AudioFeatureLab';
import { SpeechSignalAnalyzer } from './components/playgrounds/SpeechSignalAnalyzer';
import { SpeechProcessingLab } from './components/playgrounds/SpeechProcessingLab';
import { SoundClassificationLab } from './components/playgrounds/SoundClassificationLab';
import { IntelligentAudioProjectLab } from './components/playgrounds/IntelligentAudioProjectLab';
import { VideoFundamentalsExplorer } from './components/playgrounds/VideoFundamentalsExplorer';
import { VideoFrameLab } from './components/playgrounds/VideoFrameLab';
import { VideoCompressionLab } from './components/playgrounds/VideoCompressionLab';
import { VideoEnhancementLab } from './components/playgrounds/VideoEnhancementLab';
import { OpticalFlowExplorer } from './components/playgrounds/OpticalFlowExplorer';
import { MotionDetectionLab } from './components/playgrounds/MotionDetectionLab';
import { SingleObjectTrackingLab } from './components/playgrounds/SingleObjectTrackingLab';
import { MultiObjectTrackingLab } from './components/playgrounds/MultiObjectTrackingLab';
import { VideoEventAnalysisLab } from './components/playgrounds/VideoEventAnalysisLab';
import { IntelligentVideoAnalyticsLab } from './components/playgrounds/IntelligentVideoAnalyticsLab';
import { ImageGeometryExplorer } from './components/playgrounds/ImageGeometryExplorer';
import { FeatureMatchingLab } from './components/playgrounds/FeatureMatchingLab';
import { CameraCalibrationExplorer } from './components/playgrounds/CameraCalibrationExplorer';
import { StereoDepthExplorer } from './components/playgrounds/StereoDepthExplorer';
import { ClassicalObjectRecognitionLab } from './components/playgrounds/ClassicalObjectRecognitionLab';
import { CnnFundamentalsExplorer } from './components/playgrounds/CnnFundamentalsExplorer';
import { ImageClassificationLab } from './components/playgrounds/ImageClassificationLab';
import { TransferLearningExplorer } from './components/playgrounds/TransferLearningExplorer';
import { YoloObjectDetectionLab } from './components/playgrounds/YoloObjectDetectionLab';
import { DeepSegmentationLab } from './components/playgrounds/DeepSegmentationLab';
import { VisionTransformerExplorer } from './components/playgrounds/VisionTransformerExplorer';
import { HumanPoseExplorer } from './components/playgrounds/HumanPoseExplorer';
import { ThreeDReconstructionExplorer } from './components/playgrounds/ThreeDReconstructionExplorer';
import { VisionEmbeddingExplorer } from './components/playgrounds/VisionEmbeddingExplorer';
import { VisionEvaluationDashboard } from './components/playgrounds/VisionEvaluationDashboard';
import { MultimodalPipelineExplorer } from './components/playgrounds/MultimodalPipelineExplorer';
import { VisionLanguageLab } from './components/playgrounds/VisionLanguageLab';
import { AudioVisualFusionLab } from './components/playgrounds/AudioVisualFusionLab';
import { CrossModalSearchLab } from './components/playgrounds/CrossModalSearchLab';
import { MultimodalApplicationStudio } from './components/playgrounds/MultimodalApplicationStudio';
import { RealTimeProcessingLab } from './components/playgrounds/RealTimeProcessingLab';
import { EdgeAiOptimizationLab } from './components/playgrounds/EdgeAiOptimizationLab';
import { MultimediaWebAppsLab } from './components/playgrounds/MultimediaWebAppsLab';
import { PerformanceProfilerLab } from './components/playgrounds/PerformanceProfilerLab';
import { IntegratedCapstoneStudio } from './components/playgrounds/IntegratedCapstoneStudio';

type NavTab = 'home' | 'curriculum' | 'tracks' | 'advanced' | 'research' | 'chapter' | 'playgrounds' | 'about';
type ChapterSubTab = 'reading' | 'slides' | 'lab' | 'quiz' | 'references';
type PlaygroundLabKey =
  | 'ch01'
  | 'ch02'
  | 'ch03'
  | 'ch04'
  | 'ch05'
  | 'ch06'
  | 'ch07'
  | 'ch08'
  | 'ch09'
  | 'image'
  | 'ch11'
  | 'ch12'
  | 'ch13'
  | 'ch14'
  | 'ch15'
  | 'ch16'
  | 'ch17'
  | 'ch18'
  | 'ch19'
  | 'ch20'
  | 'ch21'
  | 'ch22'
  | 'ch23'
  | 'ch24'
  | 'ch25'
  | 'ch26'
  | 'ch27'
  | 'ch28'
  | 'ch29'
  | 'ch30'
  | 'ch31'
  | 'ch32'
  | 'ch33'
  | 'ch34'
  | 'ch35'
  | 'ch36'
  | 'ch37'
  | 'ch38'
  | 'ch39'
  | 'ch40'
  | 'ch41'
  | 'ch42'
  | 'ch43'
  | 'ch44'
  | 'ch45'
  | 'ch46'
  | 'ch47'
  | 'ch48'
  | 'ch49'
  | 'ch50'
  | 'ch51'
  | 'ch52'
  | 'ch53'
  | 'ch54'
  | 'ch55'
  | 'ch56'
  | 'ch57'
  | 'ch58'
  | 'ch59'
  | 'ch60'
  | 'audio'
  | 'video'
  | 'cv';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeChapterId, setActiveChapterId] = useState<string>('01');
  const [chapterSubTab, setChapterSubTab] = useState<ChapterSubTab>('reading');

  // Search & Filter state for Curriculum
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active track filter in Tracks tab
  const [selectedTrackId, setSelectedTrackId] = useState<string>('digital-image-processing');

  // Active lab in Playgrounds tab
  const [activeLabTab, setActiveLabTab] = useState<PlaygroundLabKey>('ch01');

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Hash-based routing for static hosting compatibility
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash) return;
      if (rawHash === 'advanced') {
        setCurrentTab('advanced');
      } else if (rawHash === 'research') {
        setCurrentTab('research');
      } else if (rawHash === 'curriculum') {
        setCurrentTab('curriculum');
      } else if (rawHash === 'tracks') {
        setCurrentTab('tracks');
      } else if (rawHash === 'playgrounds') {
        setCurrentTab('playgrounds');
      } else if (rawHash === 'about') {
        setCurrentTab('about');
      } else if (rawHash === 'home') {
        setCurrentTab('home');
      } else if (rawHash.startsWith('chapter/')) {
        const cid = rawHash.replace('chapter/', '');
        if (cid) {
          setActiveChapterId(cid);
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
    } else {
      window.location.hash = `#/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            Kurikulum (60 Bab)
          </button>
          <button
            className={`nav-btn ${currentTab === 'tracks' ? 'active' : ''}`}
            onClick={() => handleTabChange('tracks')}
          >
            <Compass size={16} />
            Learning Tracks
          </button>
          <button
            className={`nav-btn ${currentTab === 'advanced' ? 'active' : ''}`}
            onClick={() => handleTabChange('advanced')}
          >
            <Layers size={16} />
            Advanced (L3)
          </button>
          <button
            className={`nav-btn ${currentTab === 'research' ? 'active' : ''}`}
            onClick={() => handleTabChange('research')}
          >
            <Microscope size={16} />
            Research (L4)
          </button>
          <button
            className={`nav-btn ${currentTab === 'playgrounds' ? 'active' : ''}`}
            onClick={() => handleTabChange('playgrounds')}
          >
            <FlaskConical size={16} />
            Playground Lab
          </button>
          <button
            className={`nav-btn ${currentTab === 'chapter' ? 'active' : ''}`}
            onClick={() => handleTabChange('chapter')}
          >
            <Sparkles size={16} />
            Modul Bab {activeChapterId}
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
                Master Kurikulum (60 Bab)
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                Peta kurikulum lengkap 12 seksi yang mencakup pemrosesan sinyal multimedia hingga arsitektur visi komputer cerdas.
              </p>
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
                {currentChapter.id === '01' && <MultimediaDataExplorer />}
                {currentChapter.id === '02' && <SamplingQuantizationSimulator />}
                {currentChapter.id === '03' && <FormatSizeExplorer />}
                {currentChapter.id === '04' && <EnvironmentChecklist />}
                {currentChapter.id === '05' && <ArrayExplorer />}
                {currentChapter.id === '06' && <PixelImageExplorer />}
                {currentChapter.id === '07' && <ColorSpaceConverterLab />}
                {currentChapter.id === '08' && <ImageEnhancementLab />}
                {currentChapter.id === '09' && <HistogramExplorerLab />}
                {currentChapter.id === '10' && <ImageProcessingLab />}
                {currentChapter.id === '11' && <FftExplorerLab />}
                {currentChapter.id === '12' && <ImageRestorationLab />}
                {currentChapter.id === '13' && <EdgeFeatureExplorerLab />}
                {currentChapter.id === '14' && <MorphologyLab />}
                {currentChapter.id === '15' && <SegmentationLab />}
                {currentChapter.id === '16' && <AudioSignalExplorer />}
                {currentChapter.id === '17' && <SamplingChannelLab />}
                {currentChapter.id === '18' && <AudioFftAnalyzer />}
                {currentChapter.id === '19' && <AudioFilteringLab />}
                {currentChapter.id === '20' && <SpectrogramExplorer />}
                {currentChapter.id === '21' && <AudioFeatureLab />}
                {currentChapter.id === '22' && <SpeechSignalAnalyzer />}
                {currentChapter.id === '23' && <SpeechProcessingLab />}
                {currentChapter.id === '24' && <SoundClassificationLab />}
                {currentChapter.id === '25' && <IntelligentAudioProjectLab />}
                {currentChapter.id === '26' && <VideoFundamentalsExplorer />}
                {currentChapter.id === '27' && <VideoFrameLab />}
                {currentChapter.id === '28' && <VideoCompressionLab />}
                {currentChapter.id === '29' && <VideoEnhancementLab />}
                {currentChapter.id === '30' && <OpticalFlowExplorer />}
                {currentChapter.id === '31' && <MotionDetectionLab />}
                {currentChapter.id === '32' && <SingleObjectTrackingLab />}
                {currentChapter.id === '33' && <MultiObjectTrackingLab />}
                {currentChapter.id === '34' && <VideoEventAnalysisLab />}
                {currentChapter.id === '35' && <IntelligentVideoAnalyticsLab />}
                {currentChapter.id === '36' && <ImageGeometryExplorer />}
                {currentChapter.id === '37' && <FeatureMatchingLab />}
                {currentChapter.id === '38' && <CameraCalibrationExplorer />}
                {currentChapter.id === '39' && <StereoDepthExplorer />}
                {currentChapter.id === '40' && <ClassicalObjectRecognitionLab />}
                {currentChapter.id === '41' && <CnnFundamentalsExplorer />}
                {currentChapter.id === '42' && <ImageClassificationLab />}
                {currentChapter.id === '43' && <TransferLearningExplorer />}
                {currentChapter.id === '44' && <YoloObjectDetectionLab />}
                {currentChapter.id === '45' && <DeepSegmentationLab />}
                {currentChapter.id === '46' && <VisionTransformerExplorer />}
                {currentChapter.id === '47' && <HumanPoseExplorer />}
                {currentChapter.id === '48' && <ThreeDReconstructionExplorer />}
                {currentChapter.id === '49' && <VisionEmbeddingExplorer />}
                {currentChapter.id === '50' && <VisionEvaluationDashboard />}
                {currentChapter.id === '51' && <MultimodalPipelineExplorer />}
                {currentChapter.id === '52' && <VisionLanguageLab />}
                {currentChapter.id === '53' && <AudioVisualFusionLab />}
                {currentChapter.id === '54' && <CrossModalSearchLab />}
                {currentChapter.id === '55' && <MultimodalApplicationStudio />}
                {currentChapter.id === '56' && <RealTimeProcessingLab />}
                {currentChapter.id === '57' && <EdgeAiOptimizationLab />}
                {currentChapter.id === '58' && <MultimediaWebAppsLab />}
                {currentChapter.id === '59' && <PerformanceProfilerLab />}
                {currentChapter.id === '60' && <IntegratedCapstoneStudio />}

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
            TAB 5: PLAYGROUNDS HUB (ALL 4 LABS)
           ========================================================================= */}
        {currentTab === 'playgrounds' && (
          <div className="container">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Laboratorium Multimedia Interaktif
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                Laboratorium komputasi di sisi klien (client-side) tanpa ketergantungan server berat.
              </p>
            </div>

            {/* Lab Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[
                { key: 'ch01', label: '01. Data Explorer' },
                { key: 'ch02', label: '02. Sampling & Quantization' },
                { key: 'ch03', label: '03. Format & Storage' },
                { key: 'ch04', label: '04. Python Setup' },
                { key: 'ch05', label: '05. NumPy Arrays' },
                { key: 'ch06', label: '06. Pixel Explorer' },
                { key: 'ch07', label: '07. Color Converter' },
                { key: 'ch08', label: '08. Enhancement LUT' },
                { key: 'ch09', label: '09. Histogram & CLAHE' },
                { key: 'image', label: '10. Spatial Convolution' },
                { key: 'ch11', label: '11. 2D FFT Explorer' },
                { key: 'ch12', label: '12. Restoration & PSNR' },
                { key: 'ch13', label: '13. Canny & Harris' },
                { key: 'ch14', label: '14. Morphology Lab' },
                { key: 'ch15', label: '15. Segmentation Lab' },
                { key: 'ch16', label: '16. Audio Signal Explorer' },
                { key: 'ch17', label: '17. Sampling & Channels' },
                { key: 'ch18', label: '18. FFT Spectral Analyzer' },
                { key: 'ch19', label: '19. Audio Filtering & SNR' },
                { key: 'ch20', label: '20. STFT Spectrogram' },
                { key: 'ch21', label: '21. Feature Extraction' },
                { key: 'ch22', label: '22. Speech & VAD' },
                { key: 'ch23', label: '23. Speech (ASR & TTS)' },
                { key: 'ch24', label: '24. Audio Classification' },
                { key: 'ch25', label: '25. Intelligent Audio App' },
                { key: 'ch26', label: '26. Video Fundamentals' },
                { key: 'ch27', label: '27. Frame Capture' },
                { key: 'ch28', label: '28. Video Codecs & GOP' },
                { key: 'ch29', label: '29. Temporal Filtering' },
                { key: 'ch30', label: '30. Optical Flow (LK)' },
                { key: 'ch31', label: '31. Motion Detection' },
                { key: 'ch32', label: '32. Kalman Tracking' },
                { key: 'ch33', label: '33. Multi-Object SORT' },
                { key: 'ch34', label: '34. Event & Tripwire' },
                { key: 'ch35', label: '35. Video Analytics' },
                { key: 'ch36', label: '36. Image Geometry' },
                { key: 'ch37', label: '37. Feature Matching' },
                { key: 'ch38', label: '38. Camera Calibration' },
                { key: 'ch39', label: '39. Stereo Depth' },
                { key: 'ch40', label: '40. Template Matching' },
                { key: 'ch41', label: '41. CNN Fundamentals' },
                { key: 'ch42', label: '42. CNN Classification' },
                { key: 'ch43', label: '43. Transfer Learning' },
                { key: 'ch44', label: '44. YOLO Detection' },
                { key: 'ch45', label: '45. Deep Segmentation' },
                { key: 'ch46', label: '46. Vision Transformer' },
                { key: 'ch47', label: '47. Human Pose (COCO)' },
                { key: 'ch48', label: '48. 3D Reconstruction' },
                { key: 'ch49', label: '49. Vision Embeddings' },
                { key: 'ch50', label: '50. Vision Evaluation' },
                { key: 'ch51', label: '51. Multimodal Pipeline' },
                { key: 'ch52', label: '52. Vision-Language CLIP' },
                { key: 'ch53', label: '53. Audio-Visual Fusion' },
                { key: 'ch54', label: '54. Cross-Modal Search' },
                { key: 'ch55', label: '55. Multimodal Studio' },
                { key: 'ch56', label: '56. Real-Time Processing' },
                { key: 'ch57', label: '57. Edge AI Quantization' },
                { key: 'ch58', label: '58. Web Multimedia APIs' },
                { key: 'ch59', label: '59. Performance Profiler' },
                { key: 'ch60', label: '60. Capstone Studio' },
                { key: 'audio', label: 'Audio Synth Lab' },
                { key: 'video', label: 'Video Motion Lab' },
                { key: 'cv', label: 'Vision Kernel Lab' },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`tab-btn ${activeLabTab === item.key ? 'active' : ''}`}
                  onClick={() => setActiveLabTab(item.key as PlaygroundLabKey)}
                  style={{ fontSize: '0.84rem', padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {activeLabTab === 'ch01' && <MultimediaDataExplorer />}
            {activeLabTab === 'ch02' && <SamplingQuantizationSimulator />}
            {activeLabTab === 'ch03' && <FormatSizeExplorer />}
            {activeLabTab === 'ch04' && <EnvironmentChecklist />}
            {activeLabTab === 'ch05' && <ArrayExplorer />}
            {activeLabTab === 'ch06' && <PixelImageExplorer />}
            {activeLabTab === 'ch07' && <ColorSpaceConverterLab />}
            {activeLabTab === 'ch08' && <ImageEnhancementLab />}
            {activeLabTab === 'ch09' && <HistogramExplorerLab />}
            {activeLabTab === 'image' && <ImageProcessingLab />}
            {activeLabTab === 'ch11' && <FftExplorerLab />}
            {activeLabTab === 'ch12' && <ImageRestorationLab />}
            {activeLabTab === 'ch13' && <EdgeFeatureExplorerLab />}
            {activeLabTab === 'ch14' && <MorphologyLab />}
            {activeLabTab === 'ch15' && <SegmentationLab />}
            {activeLabTab === 'ch16' && <AudioSignalExplorer />}
            {activeLabTab === 'ch17' && <SamplingChannelLab />}
            {activeLabTab === 'ch18' && <AudioFftAnalyzer />}
            {activeLabTab === 'ch19' && <AudioFilteringLab />}
            {activeLabTab === 'ch20' && <SpectrogramExplorer />}
            {activeLabTab === 'ch21' && <AudioFeatureLab />}
            {activeLabTab === 'ch22' && <SpeechSignalAnalyzer />}
            {activeLabTab === 'ch23' && <SpeechProcessingLab />}
            {activeLabTab === 'ch24' && <SoundClassificationLab />}
            {activeLabTab === 'ch25' && <IntelligentAudioProjectLab />}
            {activeLabTab === 'ch26' && <VideoFundamentalsExplorer />}
            {activeLabTab === 'ch27' && <VideoFrameLab />}
            {activeLabTab === 'ch28' && <VideoCompressionLab />}
            {activeLabTab === 'ch29' && <VideoEnhancementLab />}
            {activeLabTab === 'ch30' && <OpticalFlowExplorer />}
            {activeLabTab === 'ch31' && <MotionDetectionLab />}
            {activeLabTab === 'ch32' && <SingleObjectTrackingLab />}
            {activeLabTab === 'ch33' && <MultiObjectTrackingLab />}
            {activeLabTab === 'ch34' && <VideoEventAnalysisLab />}
            {activeLabTab === 'ch35' && <IntelligentVideoAnalyticsLab />}
            {activeLabTab === 'ch36' && <ImageGeometryExplorer />}
            {activeLabTab === 'ch37' && <FeatureMatchingLab />}
            {activeLabTab === 'ch38' && <CameraCalibrationExplorer />}
            {activeLabTab === 'ch39' && <StereoDepthExplorer />}
            {activeLabTab === 'ch40' && <ClassicalObjectRecognitionLab />}
            {activeLabTab === 'ch41' && <CnnFundamentalsExplorer />}
            {activeLabTab === 'ch42' && <ImageClassificationLab />}
            {activeLabTab === 'ch43' && <TransferLearningExplorer />}
            {activeLabTab === 'ch44' && <YoloObjectDetectionLab />}
            {activeLabTab === 'ch45' && <DeepSegmentationLab />}
            {activeLabTab === 'ch46' && <VisionTransformerExplorer />}
            {activeLabTab === 'ch47' && <HumanPoseExplorer />}
            {activeLabTab === 'ch48' && <ThreeDReconstructionExplorer />}
            {activeLabTab === 'ch49' && <VisionEmbeddingExplorer />}
            {activeLabTab === 'ch50' && <VisionEvaluationDashboard />}
            {activeLabTab === 'ch51' && <MultimodalPipelineExplorer />}
            {activeLabTab === 'ch52' && <VisionLanguageLab />}
            {activeLabTab === 'ch53' && <AudioVisualFusionLab />}
            {activeLabTab === 'ch54' && <CrossModalSearchLab />}
            {activeLabTab === 'ch55' && <MultimodalApplicationStudio />}
            {activeLabTab === 'ch56' && <RealTimeProcessingLab />}
            {activeLabTab === 'ch57' && <EdgeAiOptimizationLab />}
            {activeLabTab === 'ch58' && <MultimediaWebAppsLab />}
            {activeLabTab === 'ch59' && <PerformanceProfilerLab />}
            {activeLabTab === 'ch60' && <IntegratedCapstoneStudio />}
            {activeLabTab === 'audio' && <AudioProcessingLab />}
            {activeLabTab === 'video' && <VideoProcessingLab />}
            {activeLabTab === 'cv' && <ComputerVisionLab />}
          </div>
        )}

        {/* =========================================================================
            TAB 6: ADVANCED CURRICULUM (L3)
           ========================================================================= */}
        {currentTab === 'advanced' && (
          <AdvancedCurriculumView
            onSelectCoreChapter={navigateToChapter}
            onNavigateToResearch={() => handleTabChange('research')}
          />
        )}

        {/* =========================================================================
            TAB 7: RESEARCH TRACKS (L4)
           ========================================================================= */}
        {currentTab === 'research' && (
          <ResearchTracksView
            onSelectCoreChapter={navigateToChapter}
            onNavigateToAdvanced={() => handleTabChange('advanced')}
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
