import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  FlaskConical,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Activity,
  AlignJustify,
  Archive,
  Award,
  BarChart,
  BarChart2,
  Box,
  Camera,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Copy,
  Cpu,
  Crosshair,
  Database,
  Disc,
  Eye,
  EyeOff,
  Film,
  Filter,
  GitMerge,
  Globe,
  Grid,
  HardDrive,
  Headphones,
  Layers,
  Layout,
  Maximize,
  Maximize2,
  MessageSquare,
  Mic,
  Monitor,
  Move,
  Navigation,
  Palette,
  PieChart,
  Radio,
  Repeat,
  Shapes,
  Share2,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Tv,
  UserCheck,
  Users,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  LABORATORY_REGISTRY,
  LABORATORY_CATEGORIES,
  getLaboratoryById,
} from '../data/laboratoryRegistry';

// Import all 63 playground components
import { MultimediaDataExplorer } from './playgrounds/MultimediaDataExplorer';
import { SamplingQuantizationSimulator } from './playgrounds/SamplingQuantizationSimulator';
import { FormatSizeExplorer } from './playgrounds/FormatSizeExplorer';
import { EnvironmentChecklist } from './playgrounds/EnvironmentChecklist';
import { ArrayExplorer } from './playgrounds/ArrayExplorer';
import { PixelImageExplorer } from './playgrounds/PixelImageExplorer';
import { ColorSpaceConverterLab } from './playgrounds/ColorSpaceConverterLab';
import { ImageEnhancementLab } from './playgrounds/ImageEnhancementLab';
import { HistogramExplorerLab } from './playgrounds/HistogramExplorerLab';
import { ImageProcessingLab } from './playgrounds/ImageProcessingLab';
import { FftExplorerLab } from './playgrounds/FftExplorerLab';
import { ImageRestorationLab } from './playgrounds/ImageRestorationLab';
import { EdgeFeatureExplorerLab } from './playgrounds/EdgeFeatureExplorerLab';
import { MorphologyLab } from './playgrounds/MorphologyLab';
import { SegmentationLab } from './playgrounds/SegmentationLab';
import { AudioSignalExplorer } from './playgrounds/AudioSignalExplorer';
import { SamplingChannelLab } from './playgrounds/SamplingChannelLab';
import { AudioFftAnalyzer } from './playgrounds/AudioFftAnalyzer';
import { AudioFilteringLab } from './playgrounds/AudioFilteringLab';
import { SpectrogramExplorer } from './playgrounds/SpectrogramExplorer';
import { AudioFeatureLab } from './playgrounds/AudioFeatureLab';
import { SpeechSignalAnalyzer } from './playgrounds/SpeechSignalAnalyzer';
import { SpeechProcessingLab } from './playgrounds/SpeechProcessingLab';
import { SoundClassificationLab } from './playgrounds/SoundClassificationLab';
import { IntelligentAudioProjectLab } from './playgrounds/IntelligentAudioProjectLab';
import { VideoFundamentalsExplorer } from './playgrounds/VideoFundamentalsExplorer';
import { VideoFrameLab } from './playgrounds/VideoFrameLab';
import { VideoCompressionLab } from './playgrounds/VideoCompressionLab';
import { VideoEnhancementLab } from './playgrounds/VideoEnhancementLab';
import { OpticalFlowExplorer } from './playgrounds/OpticalFlowExplorer';
import { MotionDetectionLab } from './playgrounds/MotionDetectionLab';
import { SingleObjectTrackingLab } from './playgrounds/SingleObjectTrackingLab';
import { MultiObjectTrackingLab } from './playgrounds/MultiObjectTrackingLab';
import { VideoEventAnalysisLab } from './playgrounds/VideoEventAnalysisLab';
import { IntelligentVideoAnalyticsLab } from './playgrounds/IntelligentVideoAnalyticsLab';
import { ImageGeometryExplorer } from './playgrounds/ImageGeometryExplorer';
import { FeatureMatchingLab } from './playgrounds/FeatureMatchingLab';
import { CameraCalibrationExplorer } from './playgrounds/CameraCalibrationExplorer';
import { StereoDepthExplorer } from './playgrounds/StereoDepthExplorer';
import { ClassicalObjectRecognitionLab } from './playgrounds/ClassicalObjectRecognitionLab';
import { CnnFundamentalsExplorer } from './playgrounds/CnnFundamentalsExplorer';
import { ImageClassificationLab } from './playgrounds/ImageClassificationLab';
import { TransferLearningExplorer } from './playgrounds/TransferLearningExplorer';
import { YoloObjectDetectionLab } from './playgrounds/YoloObjectDetectionLab';
import { DeepSegmentationLab } from './playgrounds/DeepSegmentationLab';
import { VisionTransformerExplorer } from './playgrounds/VisionTransformerExplorer';
import { HumanPoseExplorer } from './playgrounds/HumanPoseExplorer';
import { ThreeDReconstructionExplorer } from './playgrounds/ThreeDReconstructionExplorer';
import { VisionEmbeddingExplorer } from './playgrounds/VisionEmbeddingExplorer';
import { VisionEvaluationDashboard } from './playgrounds/VisionEvaluationDashboard';
import { MultimodalPipelineExplorer } from './playgrounds/MultimodalPipelineExplorer';
import { VisionLanguageLab } from './playgrounds/VisionLanguageLab';
import { AudioVisualFusionLab } from './playgrounds/AudioVisualFusionLab';
import { CrossModalSearchLab } from './playgrounds/CrossModalSearchLab';
import { MultimodalApplicationStudio } from './playgrounds/MultimodalApplicationStudio';
import { RealTimeProcessingLab } from './playgrounds/RealTimeProcessingLab';
import { EdgeAiOptimizationLab } from './playgrounds/EdgeAiOptimizationLab';
import { MultimediaWebAppsLab } from './playgrounds/MultimediaWebAppsLab';
import { PerformanceProfilerLab } from './playgrounds/PerformanceProfilerLab';
import { IntegratedCapstoneStudio } from './playgrounds/IntegratedCapstoneStudio';
import { AudioProcessingLab } from './playgrounds/AudioProcessingLab';
import { VideoProcessingLab } from './playgrounds/VideoProcessingLab';
import { ComputerVisionLab } from './playgrounds/ComputerVisionLab';

// Icon mapping lookup
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Activity,
  AlignJustify,
  Archive,
  Award,
  BarChart,
  BarChart2,
  Box,
  Camera,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Copy,
  Cpu,
  Crosshair,
  Database,
  Disc,
  Eye,
  EyeOff,
  Film,
  Filter,
  FlaskConical,
  GitMerge,
  Globe,
  Grid,
  HardDrive,
  Headphones,
  Layers,
  Layout,
  Maximize,
  Maximize2,
  MessageSquare,
  Mic,
  Monitor,
  Move,
  Navigation,
  Palette,
  PieChart,
  Radio,
  Repeat,
  Search,
  Shapes,
  Share2,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Tv,
  UserCheck,
  Users,
  Video,
  Volume2,
  Zap,
};

function LabIcon({ name, size = 18, className = '', style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const IconComponent = ICON_MAP[name] || FlaskConical;
  return <IconComponent size={size} className={className} style={style} />;
}

// Lab component dispatcher
export function LabRenderer({ labId }: { labId: string }) {
  switch (labId) {
    case 'ch01': return <MultimediaDataExplorer />;
    case 'ch02': return <SamplingQuantizationSimulator />;
    case 'ch03': return <FormatSizeExplorer />;
    case 'ch04': return <EnvironmentChecklist />;
    case 'ch05': return <ArrayExplorer />;
    case 'ch06': return <PixelImageExplorer />;
    case 'ch07': return <ColorSpaceConverterLab />;
    case 'ch08': return <ImageEnhancementLab />;
    case 'ch09': return <HistogramExplorerLab />;
    case 'image':
    case 'ch10': return <ImageProcessingLab />;
    case 'ch11': return <FftExplorerLab />;
    case 'ch12': return <ImageRestorationLab />;
    case 'ch13': return <EdgeFeatureExplorerLab />;
    case 'ch14': return <MorphologyLab />;
    case 'ch15': return <SegmentationLab />;
    case 'ch16': return <AudioSignalExplorer />;
    case 'ch17': return <SamplingChannelLab />;
    case 'ch18': return <AudioFftAnalyzer />;
    case 'ch19': return <AudioFilteringLab />;
    case 'ch20': return <SpectrogramExplorer />;
    case 'ch21': return <AudioFeatureLab />;
    case 'ch22': return <SpeechSignalAnalyzer />;
    case 'ch23': return <SpeechProcessingLab />;
    case 'ch24': return <SoundClassificationLab />;
    case 'ch25': return <IntelligentAudioProjectLab />;
    case 'ch26': return <VideoFundamentalsExplorer />;
    case 'ch27': return <VideoFrameLab />;
    case 'ch28': return <VideoCompressionLab />;
    case 'ch29': return <VideoEnhancementLab />;
    case 'ch30': return <OpticalFlowExplorer />;
    case 'ch31': return <MotionDetectionLab />;
    case 'ch32': return <SingleObjectTrackingLab />;
    case 'ch33': return <MultiObjectTrackingLab />;
    case 'ch34': return <VideoEventAnalysisLab />;
    case 'ch35': return <IntelligentVideoAnalyticsLab />;
    case 'ch36': return <ImageGeometryExplorer />;
    case 'ch37': return <FeatureMatchingLab />;
    case 'ch38': return <CameraCalibrationExplorer />;
    case 'ch39': return <StereoDepthExplorer />;
    case 'ch40': return <ClassicalObjectRecognitionLab />;
    case 'ch41': return <CnnFundamentalsExplorer />;
    case 'ch42': return <ImageClassificationLab />;
    case 'ch43': return <TransferLearningExplorer />;
    case 'ch44': return <YoloObjectDetectionLab />;
    case 'ch45': return <DeepSegmentationLab />;
    case 'ch46': return <VisionTransformerExplorer />;
    case 'ch47': return <HumanPoseExplorer />;
    case 'ch48': return <ThreeDReconstructionExplorer />;
    case 'ch49': return <VisionEmbeddingExplorer />;
    case 'ch50': return <VisionEvaluationDashboard />;
    case 'ch51': return <MultimodalPipelineExplorer />;
    case 'ch52': return <VisionLanguageLab />;
    case 'ch53': return <AudioVisualFusionLab />;
    case 'ch54': return <CrossModalSearchLab />;
    case 'ch55': return <MultimodalApplicationStudio />;
    case 'ch56': return <RealTimeProcessingLab />;
    case 'ch57': return <EdgeAiOptimizationLab />;
    case 'ch58': return <MultimediaWebAppsLab />;
    case 'ch59': return <PerformanceProfilerLab />;
    case 'ch60': return <IntegratedCapstoneStudio />;
    case 'audio': return <AudioProcessingLab />;
    case 'video': return <VideoProcessingLab />;
    case 'cv': return <ComputerVisionLab />;
    default: return <MultimediaDataExplorer />;
  }
}

export interface LaboratoryCatalogViewProps {
  activeLabId: string | null;
  onSelectLab: (labId: string | null) => void;
  onNavigateToChapter: (chapterId: string, subTab?: 'reading' | 'slides' | 'lab' | 'quiz' | 'references') => void;
}

export function LaboratoryCatalogView({
  activeLabId,
  onSelectLab,
  onNavigateToChapter,
}: LaboratoryCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Scroll to top when active lab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLabId]);

  // Current active lab item
  const currentLab = useMemo(() => {
    if (!activeLabId) return null;
    return getLaboratoryById(activeLabId) || LABORATORY_REGISTRY[0];
  }, [activeLabId]);

  // Filtered laboratories based on category and query
  const filteredLabs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LABORATORY_REGISTRY.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!q) return true;
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.shortTitle.toLowerCase().includes(q)) return true;
      if (item.description.toLowerCase().includes(q)) return true;
      if (item.categoryName.toLowerCase().includes(q)) return true;
      if (item.chapterId && item.chapterId.includes(q)) return true;
      if (item.chapterId && `bab ${item.chapterId}`.includes(q)) return true;
      if (item.chapterId && `ch ${item.chapterId}`.includes(q)) return true;
      if (item.keywords.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LABORATORY_REGISTRY.length };
    LABORATORY_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = LABORATORY_REGISTRY.filter((item) => item.categoryId === cat.id).length;
      }
    });
    return counts;
  }, []);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // =========================================================================
  // VIEW MODE A: ACTIVE LABORATORY WORKSPACE
  // =========================================================================
  if (activeLabId && currentLab) {
    return (
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {/* Workspace Top Bar */}
        <div className="lab-workspace-topbar">
          <div className="lab-workspace-topbar-left">
            <button
              onClick={() => onSelectLab(null)}
              className="lab-workspace-back-btn"
              title="Kembali ke Katalog Laboratorium"
            >
              <ArrowLeft size={16} />
              <span>Katalog Lab</span>
            </button>
            <div className="lab-workspace-divider" />
            <div className="lab-workspace-info">
              <span className="lab-workspace-badge">
                {currentLab.chapterId ? `Bab ${currentLab.chapterId}` : 'Lab Mandiri'}
              </span>
              <h2 className="lab-workspace-title">{currentLab.title}</h2>
            </div>
          </div>

          <div className="lab-workspace-topbar-right">
            {/* Direct theory link if tied to chapter */}
            {currentLab.chapterId && (
              <button
                onClick={() => onNavigateToChapter(currentLab.chapterId!, 'reading')}
                className="lab-workspace-theory-btn"
                title={`Buka materi teori bab ${currentLab.chapterId}`}
              >
                <BookOpen size={15} />
                <span>Materi Bab {currentLab.chapterId}</span>
              </button>
            )}

            {/* Quick lab switcher dropdown */}
            <div className="lab-workspace-switcher">
              <select
                aria-label="Pilih Laboratorium"
                value={currentLab.id}
                onChange={(e) => onSelectLab(e.target.value)}
                className="lab-workspace-select"
              >
                {LABORATORY_REGISTRY.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.chapterId ? `${lab.chapterId}. ` : ''}{lab.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Laboratory Description Banner */}
        <div className="lab-workspace-desc-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div className="lab-workspace-desc-icon">
              <LabIcon name={currentLab.iconName} size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {currentLab.categoryName}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Client-side Interactive Execution
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {currentLab.description}
              </p>
            </div>
          </div>
        </div>

        {/* The Live Interactive Experiment Component */}
        <div className="lab-workspace-body">
          <LabRenderer labId={currentLab.id} />
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
      <div className="lab-catalog-header">
        <div className="lab-catalog-badge">
          <FlaskConical size={14} />
          <span>Eksperimen Komputasi Interaktif</span>
        </div>
        <h1 className="lab-catalog-title">
          Laboratorium Multimedia &amp; Computer Vision
        </h1>
        <p className="lab-catalog-subtitle">
          Koleksi 63 laboratorium komputasi interaktif berbasis peramban (client-side) tanpa ketergantungan server berat.
          Eksperimen langsung parameter pemrosesan citra, audio, video temporal, classical vision, deep learning, dan arsitektur multimodal.
        </p>

        {/* Summary Metric Pills */}
        <div className="lab-catalog-stats">
          <div className="lab-stat-pill">
            <strong>63</strong>
            <span>Laboratorium Komputasi</span>
          </div>
          <div className="lab-stat-pill">
            <strong>8 + 1</strong>
            <span>Kategori Bidang Keilmuan</span>
          </div>
          <div className="lab-stat-pill">
            <strong>Client-Side</strong>
            <span>Zero-Server Dependency</span>
          </div>
          <div className="lab-stat-pill">
            <strong>100%</strong>
            <span>Terintegrasi Kurikulum ITERA</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="lab-catalog-toolbar">
        {/* Search Bar */}
        <div className="lab-search-wrapper">
          <Search size={18} className="lab-search-icon" />
          <input
            type="text"
            className="lab-search-input"
            placeholder="Cari laboratorium (contoh: FFT, YOLO, Canny, Bab 10, Kalman, Audio, VAD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="lab-search-clear-btn"
              title="Bersihkan pencarian"
              aria-label="Bersihkan pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Result Counter */}
        <div className="lab-results-count">
          Menampilkan <strong>{filteredLabs.length}</strong> dari <strong>{LABORATORY_REGISTRY.length}</strong> laboratorium
          {searchQuery && (
            <span style={{ color: 'var(--text-dim)', marginLeft: '0.4rem' }}>
              untuk kata kunci &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="lab-category-nav" role="tablist" aria-label="Kategori Laboratorium">
        {LABORATORY_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              className={`lab-category-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.shortName}</span>
              <span className="lab-category-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Description Banner (if not 'all') */}
      {selectedCategory !== 'all' && (
        <div className="lab-category-banner">
          {(() => {
            const cat = LABORATORY_CATEGORIES.find((c) => c.id === selectedCategory);
            if (!cat) return null;
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {cat.name} ({cat.chapterRange})
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {cat.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="lab-reset-category-btn"
                >
                  Tampilkan Semua Kategori
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Laboratory Grid or Empty State */}
      {filteredLabs.length === 0 ? (
        <div className="lab-empty-state">
          <div className="lab-empty-icon">
            <FlaskConical size={42} />
          </div>
          <h3 className="lab-empty-title">Tidak Ada Laboratorium yang Sesuai</h3>
          <p className="lab-empty-desc">
            Tidak ditemukan laboratorium yang cocok dengan kueri <strong>&ldquo;{searchQuery}&rdquo;</strong> pada kategori terpilih.
            Coba gunakan istilah teknis umum seperti &ldquo;pixel&rdquo;, &ldquo;audio&rdquo;, &ldquo;filter&rdquo;, &ldquo;tracking&rdquo;, atau nomor bab.
          </p>
          <button
            onClick={handleResetFilters}
            className="lab-empty-reset-btn"
          >
            <RotateCcw size={15} />
            <span>Reset Pencarian &amp; Kategori</span>
          </button>
        </div>
      ) : (
        <div className="lab-grid">
          {filteredLabs.map((lab) => {
            return (
              <div
                key={lab.id}
                className="lab-card"
                onClick={() => onSelectLab(lab.id)}
              >
                {/* Card Top Metadata */}
                <div className="lab-card-header">
                  <div className="lab-card-badge-row">
                    <span className="lab-card-chapter-badge">
                      {lab.chapterId ? `Bab ${lab.chapterId}` : 'Standalone'}
                    </span>
                    <span className="lab-card-cat-badge">
                      {lab.categoryName.split('&')[0].trim()}
                    </span>
                  </div>
                  <div className="lab-card-icon-wrapper">
                    <LabIcon name={lab.iconName} size={18} />
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="lab-card-title">{lab.title}</h3>
                <p className="lab-card-desc">{lab.description}</p>

                {/* Keywords Chips */}
                <div className="lab-card-tags">
                  {lab.keywords.slice(0, 3).map((kw, idx) => (
                    <span key={idx} className="lab-card-tag">
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Card Action Buttons */}
                <div className="lab-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectLab(lab.id)}
                    className="lab-card-primary-btn"
                  >
                    <span>Buka Lab</span>
                    <ArrowRight size={14} />
                  </button>

                  {lab.chapterId && (
                    <button
                      onClick={() => onNavigateToChapter(lab.chapterId!, 'reading')}
                      className="lab-card-secondary-btn"
                      title={`Buka materi teori Bab ${lab.chapterId}`}
                    >
                      <BookOpen size={13} />
                      <span>Teori</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
