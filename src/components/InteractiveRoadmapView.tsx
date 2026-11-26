import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  ListTree,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FlaskConical,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Microscope,
  Compass,
  Radio,
  X,
  Sparkles,
  Pin,
  PinOff,
  Layers,
  Eye,
  Target
} from 'lucide-react';
import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  getResearchPath,
  traverseLearningPath,
  getFocusedLearningPath,
  computeCompactLayout,
  computeFocusEdgePath,
  RESEARCH_TRACK_OPTIONS,
  ROADMAP_SUMMARY,
  type RoadmapNode,
  type RoadmapEdge,
  type ResearchPathway,
  type PathDirection,
  type FocusScope
} from '../data/learningRoadmapData';

interface InteractiveRoadmapViewProps {
  onNavigateToRoute?: (route: string) => void;
  initialTrackId?: string;
}

export function InteractiveRoadmapView({ onNavigateToRoute, initialTrackId }: InteractiveRoadmapViewProps) {
  const allNodes = useMemo(() => getAllRoadmapNodes(), []);
  const allEdges = useMemo(() => getAllRoadmapEdges(), []);

  // UI States
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'core' | 'advanced' | 'research'>('all');
  const [selectedResearchTrack, setSelectedResearchTrack] = useState<string>(initialTrackId || 'all');

  // Interaction States (Phase AC-02B & AC-02C: Focus Mode & Structured Staged Path)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(
    initialTrackId && initialTrackId !== 'all' ? initialTrackId : null
  );
  const [focusScope, setFocusScope] = useState<FocusScope>('main-path');
  const [focusViewMode, setFocusViewMode] = useState<'staged' | 'graph'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('view=graph')) {
      return 'graph';
    }
    return 'staged';
  });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pathDirection, setPathDirection] = useState<PathDirection>('both');
  const [hoveredEdge, setHoveredEdge] = useState<RoadmapEdge | null>(null);
  const [edgeTooltipPos, setEdgeTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState<boolean>(false);

  // Backward-compatible aliases for existing tests
  const pinnedNodeId = focusedNodeId;
  const setPinnedNodeId = setFocusedNodeId;

  // Interaction Modes: Focus Mode vs Hover Preview vs Overview
  const isFocusMode = focusedNodeId !== null;
  const isHoverPreview = !isFocusMode && hoveredNodeId !== null;

  // SVG Pan/Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Active Research Pathway resolution
  const activePathway: ResearchPathway | null = useMemo(() => {
    if (selectedResearchTrack === 'all') return null;
    return getResearchPath(selectedResearchTrack);
  }, [selectedResearchTrack]);

  // Handle Research Track Selector change (defaults to 'prerequisites' as required)
  const handleResearchTrackChange = (trackId: string) => {
    setSelectedResearchTrack(trackId);
    if (trackId !== 'all') {
      setPathDirection('prerequisites');
      setFocusedNodeId(trackId);
    }
  };

  // Traversal for Focus Mode (Jalur Utama or Semua Ketergantungan)
  const focusedTraversal = useMemo(() => {
    if (!focusedNodeId) return null;
    return getFocusedLearningPath(focusedNodeId, pathDirection, focusScope);
  }, [focusedNodeId, pathDirection, focusScope]);

  const focusedNode = useMemo(() => {
    if (!focusedNodeId) return null;
    return getRoadmapNodeById(focusedNodeId);
  }, [focusedNodeId]);

  const focusedActiveEdges = useMemo(() => {
    if (!focusedTraversal) return [];
    const activeEdgeSet = new Set(focusedTraversal.activeEdgeIds);
    return allEdges.filter((e) => activeEdgeSet.has(e.id));
  }, [allEdges, focusedTraversal]);

  const focusedActiveNodes = useMemo(() => {
    if (!focusedTraversal) return [];
    const activeNodeSet = new Set(focusedTraversal.activeNodeIds);
    return allNodes.filter((n) => activeNodeSet.has(n.id));
  }, [allNodes, focusedTraversal]);

  // Dedicated Compact DAG Layout for Focus Mode (Phase AC-02B)
  const compactLayout = useMemo(() => {
    if (!focusedNodeId || !focusedTraversal) return null;
    return computeCompactLayout(focusedTraversal.activeNodeIds, focusedActiveEdges, focusedNodeId);
  }, [focusedNodeId, focusedTraversal, focusedActiveEdges]);

  // Structured Learning Path Data for Focus Mode (Phase AC-02C)
  const stagedPathData = useMemo(() => {
    if (!focusedNodeId || !focusedTraversal || !focusedNode) return null;

    const directPrereqSet = new Set(focusedNode.prerequisites || []);

    // Upstream nodes
    const upstreamNodes = focusedTraversal.upstreamNodeIds
      .map((id) => getRoadmapNodeById(id))
      .filter((n): n is RoadmapNode => n !== undefined && n.id !== focusedNodeId);

    // Stage 1: Core Prereqs
    const corePrereqs = upstreamNodes.filter((n) => n.type === 'core');
    const coreBySection = new Map<string, RoadmapNode[]>();
    for (const node of corePrereqs) {
      const section = node.sectionOrPillarTitle || 'Fondasi Umum Citra & Visi';
      if (!coreBySection.has(section)) {
        coreBySection.set(section, []);
      }
      coreBySection.get(section)!.push(node);
    }

    // Stage 2: Advanced Prereqs
    const advancedPrereqs = upstreamNodes.filter((n) => n.type === 'advanced');

    // Stage 4: Downstream Next Steps
    const downstreamNodes = focusedTraversal.downstreamNodeIds
      .map((id) => getRoadmapNodeById(id))
      .filter((n): n is RoadmapNode => n !== undefined && n.id !== focusedNodeId);

    return {
      destination: focusedNode,
      directPrereqSet,
      corePrereqs,
      coreBySection: Array.from(coreBySection.entries()),
      advancedPrereqs,
      downstreamNodes
    };
  }, [focusedNodeId, focusedTraversal, focusedNode]);

  // Traversal for Hover Preview in Overview Mode
  const hoverTraversal = useMemo(() => {
    if (!isHoverPreview || !hoveredNodeId) return null;
    return traverseLearningPath(hoveredNodeId, pathDirection);
  }, [isHoverPreview, hoveredNodeId, pathDirection]);

  // Deterministic Interaction Precedence Model
  const activeSelection = useMemo(() => {
    if (isFocusMode && focusedTraversal) {
      return {
        source: 'pinned' as const,
        targetNodeId: focusedNodeId,
        activeNodeIds: new Set(focusedTraversal.activeNodeIds),
        activeEdgeIds: new Set(focusedTraversal.activeEdgeIds),
        upstreamNodeIds: new Set(focusedTraversal.upstreamNodeIds),
        downstreamNodeIds: new Set(focusedTraversal.downstreamNodeIds)
      };
    }

    if (isHoverPreview && hoverTraversal) {
      return {
        source: 'hover' as const,
        targetNodeId: hoveredNodeId,
        activeNodeIds: new Set(hoverTraversal.activeNodeIds),
        activeEdgeIds: new Set(hoverTraversal.activeEdgeIds),
        upstreamNodeIds: new Set(hoverTraversal.upstreamNodeIds),
        downstreamNodeIds: new Set(hoverTraversal.downstreamNodeIds)
      };
    }

    if (activePathway) {
      return {
        source: 'research-path' as const,
        targetNodeId: activePathway.trackId,
        activeNodeIds: new Set(activePathway.allNodeIds),
        activeEdgeIds: new Set(activePathway.allEdgeIds),
        upstreamNodeIds: new Set(activePathway.allNodeIds.filter((id) => id !== activePathway.trackId)),
        downstreamNodeIds: new Set<string>()
      };
    }

    return {
      source: 'none' as const,
      targetNodeId: null,
      activeNodeIds: new Set<string>(),
      activeEdgeIds: new Set<string>(),
      upstreamNodeIds: new Set<string>(),
      downstreamNodeIds: new Set<string>()
    };
  }, [isFocusMode, focusedTraversal, focusedNodeId, isHoverPreview, hoverTraversal, hoveredNodeId, activePathway]);

  // Inspector node: displayed in Focus Mode (NEVER automatically opened on hover in overview)
  const inspectorNodeId = focusedNodeId || (activePathway ? activePathway.trackId : null);
  const inspectorNode: RoadmapNode | undefined = useMemo(() => {
    if (!inspectorNodeId) return undefined;
    return getRoadmapNodeById(inspectorNodeId);
  }, [inspectorNodeId]);

  // Filtering nodes by search and level
  const filteredNodes = useMemo(() => {
    return allNodes.filter((node) => {
      // Level filter
      if (levelFilter !== 'all' && node.type !== levelFilter) return false;

      // Research path filter (if in tree mode or strict filter)
      if (activePathway && !activePathway.allNodeIds.includes(node.id)) {
        if (viewMode === 'tree') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = node.title.toLowerCase().includes(q);
        const matchCode = node.code.toLowerCase().includes(q);
        const matchDesc = node.description.toLowerCase().includes(q);
        const matchSub = node.subtitle.toLowerCase().includes(q);
        const matchTelecom = node.telecomRelevance.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDesc && !matchSub && !matchTelecom) return false;
      }

      return true;
    });
  }, [allNodes, levelFilter, activePathway, searchQuery, viewMode]);

  // Node position map for SVG DAG layout (Stable Layout Invariant)
  const nodePositions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number; width: number; height: number }>();
    const svgWidth = 1400;

    // Layer 1: Research Tracks (L4, 6 nodes)
    const researchNodes = allNodes.filter((n) => n.type === 'research');
    const rSpacing = svgWidth / (researchNodes.length + 1);
    researchNodes.forEach((node, idx) => {
      pos.set(node.id, {
        x: rSpacing * (idx + 1) - 95,
        y: 60,
        width: 190,
        height: 80
      });
    });

    // Layer 2: Advanced Modules (L3, 8 nodes)
    const advNodes = allNodes.filter((n) => n.type === 'advanced');
    const advSpacing = svgWidth / (advNodes.length + 1);
    advNodes.forEach((node, idx) => {
      pos.set(node.id, {
        x: advSpacing * (idx + 1) - 80,
        y: 260,
        width: 160,
        height: 75
      });
    });

    // Layer 3: Core Chapters (L1-L2, 60 nodes arranged in 12 columns by section)
    const coreNodes = allNodes.filter((n) => n.type === 'core');
    const colSpacing = svgWidth / 13;
    coreNodes.forEach((node) => {
      const num = parseInt(node.rawId, 10);
      const colIdx = Math.floor((num - 1) / 5) + 1; // 1 to 12
      const rowIdx = (num - 1) % 5; // 0 to 4
      pos.set(node.id, {
        x: colSpacing * colIdx - 48,
        y: 440 + rowIdx * 82,
        width: 96,
        height: 64
      });
    });

    return pos;
  }, [allNodes]);

  // Handle Pan / Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'graph') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== 'graph') return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.0, Math.max(0.5, Math.round((prev + delta) * 10) / 10)));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setPinnedNodeId(null);
    setHoveredNodeId(null);
    setHoveredEdge(null);
    setSelectedResearchTrack('all');
    setSearchQuery('');
    setLevelFilter('all');
    setPathDirection('both');
  };

  const handleNodeClick = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPinnedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only clear pinned node when clicking on background canvas, not on nodes or inspector
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'svg' ||
      target.classList.contains('roadmap-canvas-wrapper') ||
      target.classList.contains('roadmap-zone-rect') ||
      target.classList.contains('roadmap-tier-zones')
    ) {
      setPinnedNodeId(null);
      setHoveredNodeId(null);
      setHoveredEdge(null);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredNodeId(null);
        setPinnedNodeId(null);
        setHoveredEdge(null);
      }
    },
    []
  );

  const navigateTo = (route: string) => {
    if (onNavigateToRoute) {
      onNavigateToRoute(route);
    } else {
      window.location.hash = route;
    }
  };

  // Edge hover tooltip handlers
  const handleEdgeMouseEnter = (edge: RoadmapEdge, e: React.MouseEvent) => {
    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    setHoveredEdge(edge);
    setEdgeTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  const handleEdgeMouseMove = (e: React.MouseEvent) => {
    if (!svgContainerRef.current || !hoveredEdge) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    setEdgeTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  const handleEdgeMouseLeave = () => {
    setHoveredEdge(null);
    setEdgeTooltipPos(null);
  };

  // Visible nodes in Overview Mode (all 74 nodes remain visible at stable coordinates)
  const isIsolationActive = activeSelection.source !== 'none';
  const visibleNodes = useMemo(() => {
    if (!isIsolationActive) return allNodes;
    return allNodes.filter((node) => activeSelection.activeNodeIds.has(node.id));
  }, [allNodes, isIsolationActive, activeSelection.activeNodeIds]);

  // Partition edges into inactive background vs active highlighted foreground
  // Under exclusive path isolation: when isolation is active, inactive edges are completely hidden (empty)
  const { inactiveEdges, activeEdges } = useMemo(() => {
    if (!isHoverPreview) {
      return { inactiveEdges: allEdges, activeEdges: [] };
    }

    const inactive: RoadmapEdge[] = [];
    const active: RoadmapEdge[] = [];

    allEdges.forEach((edge) => {
      if (activeSelection.activeEdgeIds.has(edge.id)) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });

    return { inactiveEdges: inactive, activeEdges: active };
    // In Focus Mode: inactiveEdges: [], activeEdges: active
  }, [allEdges, isHoverPreview, activeSelection.activeEdgeIds]);

  return (
    <div className={`roadmap-container ${isIsolationActive ? 'active-isolation' : ''}`} onKeyDown={handleKeyDown}>
      {/* 1. Header & Controls */}
      <div className="roadmap-header">
        <div className="roadmap-header-title">
          <div className="roadmap-badge-pill">
            <Network size={14} />
            <span>Interactive Learning Graph (DAG)</span>
          </div>
          <h1>Peta Pembelajaran Interaktif (Curriculum Roadmap)</h1>
          <p className="roadmap-subtitle">
            Eksplorasi ketergantungan akademik terpadu antara 60 Bab Inti (L1–L2), 8 Modul Lanjutan (L3), dan 6 Jalur
            Riset (L4) selaras dengan kurikulum S1 Teknik Telekomunikasi & Strategic Roadmap ISVWS 2026–2040.
          </p>
        </div>

        {/* View Mode & Reset Bar */}
        <div className="roadmap-controls-top">
          <div className="roadmap-view-toggle" role="group" aria-label="Roadmap View Mode">
            <button
              type="button"
              className={`roadmap-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
              aria-pressed={viewMode === 'graph'}
            >
              <Network size={16} />
              <span>Grafik Visual (DAG)</span>
            </button>
            <button
              type="button"
              className={`roadmap-toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
              aria-pressed={viewMode === 'tree'}
            >
              <ListTree size={16} />
              <span>Daftar Aksesibel (Tree)</span>
            </button>
          </div>

          <button
            type="button"
            className="roadmap-reset-btn"
            onClick={handleResetView}
            title="Reset seluruh filter, penyorotan, dan posisi kanvas (Esc)"
          >
            <RotateCcw size={15} />
            <span>Reset Tampilan</span>
          </button>
        </div>
      </div>

      {/* 2. Filter, Direction & Path Exploration Toolbar */}
      <div className="roadmap-toolbar">
        {/* Search Input */}
        <div className="roadmap-search-box">
          <Search size={16} className="roadmap-search-icon" />
          <input
            type="text"
            placeholder="Cari bab, modul, riset, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari topik pembelajaran"
          />
          {searchQuery && (
            <button
              type="button"
              className="roadmap-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Bersihkan pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Level Filters */}
        <div className="roadmap-level-filters">
          <button
            type="button"
            className={`roadmap-filter-chip ${levelFilter === 'all' ? 'active' : ''}`}
            onClick={() => setLevelFilter('all')}
          >
            Semua ({ROADMAP_SUMMARY.totalNodes})
          </button>
          <button
            type="button"
            className={`roadmap-filter-chip ${levelFilter === 'core' ? 'active' : ''}`}
            onClick={() => setLevelFilter('core')}
          >
            Core L1–L2 ({ROADMAP_SUMMARY.coreCount})
          </button>
          <button
            type="button"
            className={`roadmap-filter-chip ${levelFilter === 'advanced' ? 'active' : ''}`}
            onClick={() => setLevelFilter('advanced')}
          >
            Advanced L3 ({ROADMAP_SUMMARY.advancedCount})
          </button>
          <button
            type="button"
            className={`roadmap-filter-chip ${levelFilter === 'research' ? 'active' : ''}`}
            onClick={() => setLevelFilter('research')}
          >
            Research L4 ({ROADMAP_SUMMARY.researchCount})
          </button>
        </div>

        {/* Path Direction Selector (Phase AC-02) */}
        <div className="roadmap-direction-control" role="group" aria-label="Arah Penelusuran Jalur">
          <span className="roadmap-direction-label">
            <Layers size={14} />
            <span>Arah Jalur:</span>
          </span>
          <div className="roadmap-direction-buttons">
            <button
              type="button"
              className={`roadmap-direction-btn ${pathDirection === 'prerequisites' ? 'active' : ''}`}
              onClick={() => setPathDirection('prerequisites')}
              title="Hanya sorot prasyarat ke arah hulu (Upstream)"
              aria-pressed={pathDirection === 'prerequisites'}
            >
              Prasyarat
            </button>
            <button
              type="button"
              className={`roadmap-direction-btn ${pathDirection === 'dependents' ? 'active' : ''}`}
              onClick={() => setPathDirection('dependents')}
              title="Hanya sorot modul lanjutan ke arah hilir (Downstream)"
              aria-pressed={pathDirection === 'dependents'}
            >
              Lanjutan
            </button>
            <button
              type="button"
              className={`roadmap-direction-btn ${pathDirection === 'both' ? 'active' : ''}`}
              onClick={() => setPathDirection('both')}
              title="Sorot prasyarat hulu dan materi hilir sekaligus"
              aria-pressed={pathDirection === 'both'}
            >
              Keduanya
            </button>
          </div>
        </div>

        {/* "Jalur Menuju Riset" Selector */}
        <div className="roadmap-research-selector">
          <label htmlFor="research-path-select" className="roadmap-selector-label">
            <Compass size={15} />
            <span>Jalur Menuju Riset:</span>
          </label>
          <select
            id="research-path-select"
            value={selectedResearchTrack}
            onChange={(e) => handleResearchTrackChange(e.target.value)}
            className="roadmap-select"
          >
            <option value="all">Semua Jalur (Tampilan Utuh)</option>
            {RESEARCH_TRACK_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.code} — {opt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Active Research Pathway Highlight Banner */}
      {activePathway && (
        <div className="roadmap-path-banner">
          <div className="roadmap-path-banner-icon">
            <Sparkles size={20} />
          </div>
          <div className="roadmap-path-banner-content">
            <div className="roadmap-path-banner-header">
              <span className="roadmap-path-badge">{activePathway.trackCode}</span>
              <h3>{activePathway.trackTitle}</h3>
              <span className="roadmap-path-category">{activePathway.category}</span>
            </div>
            <p className="roadmap-path-desc">{activePathway.description}</p>
            <div className="roadmap-path-stats">
              <span>
                <strong>{activePathway.primaryAdvancedModules.length}</strong> Modul Lanjutan Terhubung
              </span>
              <span>·</span>
              <span>
                <strong>{activePathway.keyCoreChapters.length}</strong> Bab Inti Prasyarat Fondasional
              </span>
              <span>·</span>
              <span>
                <strong>{activePathway.allNodeIds.length}</strong> Total Node dalam Jalur
              </span>
            </div>
          </div>
          <div className="roadmap-path-banner-action">
            <button
              type="button"
              className="roadmap-btn-primary"
              onClick={() => navigateTo(`#/research/${activePathway.trackId}`)}
            >
              <span>Buka Modul Riset {activePathway.trackCode}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Body: Graph Canvas or Tree View */}
      <div className="roadmap-main-layout">
        {viewMode === 'graph' ? (
          <div
            className={`roadmap-canvas-wrapper ${isFocusMode && focusViewMode === 'staged' ? 'staged-mode' : ''}`}
            ref={svgContainerRef}
            onClick={handleCanvasClick}
            onMouseDown={isFocusMode && focusViewMode === 'staged' ? undefined : handleMouseDown}
            onMouseMove={isFocusMode && focusViewMode === 'staged' ? undefined : handleMouseMove}
            onMouseUp={isFocusMode && focusViewMode === 'staged' ? undefined : handleMouseUp}
            onMouseLeave={isFocusMode && focusViewMode === 'staged' ? undefined : handleMouseUp}
            style={{ cursor: isFocusMode && focusViewMode === 'staged' ? 'default' : isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Focus Mode Toolbar Banner (Phase AC-02B) */}
            {isFocusMode && (
              <div className="roadmap-focus-banner">
                <div className="roadmap-focus-banner-left">
                  <button
                    type="button"
                    className="roadmap-btn-back"
                    onClick={() => {
                      setFocusedNodeId(null);
                      setHoveredNodeId(null);
                    }}
                    title="Kembali ke tampilan seluruh peta kurikulum (Esc)"
                    aria-label="Kembali ke semua jalur"
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Semua Jalur</span>
                  </button>
                  <div className="roadmap-focus-node-badge">
                    <span className="badge-label">Mode Fokus:</span>
                    <span className="badge-code">{focusedNode?.code}</span>
                    <span className="badge-title">{focusedNode?.title}</span>
                  </div>
                </div>

                <div className="roadmap-focus-banner-controls">
                  {/* View Mode Switcher: Tahapan Terstruktur vs Diagram Graf (Phase AC-02C) */}
                  <div className="roadmap-scope-control" role="group" aria-label="Tampilan Mode Fokus">
                    <button
                      type="button"
                      className={`roadmap-scope-btn ${focusViewMode === 'staged' ? 'active' : ''}`}
                      onClick={() => setFocusViewMode('staged')}
                      title="Tampilan tahapan terstruktur berjenjang (Rekomendasi - Bebas Tumpang Tindih)"
                    >
                      <ListTree size={13} />
                      <span>Tahapan Terstruktur</span>
                    </button>
                    <button
                      type="button"
                      className={`roadmap-scope-btn ${focusViewMode === 'graph' ? 'active' : ''}`}
                      onClick={() => setFocusViewMode('graph')}
                      title="Diagram grafik jaringan (DAG)"
                    >
                      <Network size={13} />
                      <span>Diagram Graf</span>
                    </button>
                  </div>

                  {/* Scope Selector: Jalur Utama vs Semua Ketergantungan */}
                  <div className="roadmap-scope-control" role="group" aria-label="Cakupan Jalur">
                    <button
                      type="button"
                      className={`roadmap-scope-btn ${focusScope === 'main-path' ? 'active' : ''}`}
                      onClick={() => setFocusScope('main-path')}
                      title="Jalur terarah utama dengan prasyarat esensial (Ringkas & Efisien)"
                    >
                      <Sparkles size={13} />
                      <span>Jalur Utama</span>
                    </button>
                    <button
                      type="button"
                      className={`roadmap-scope-btn ${focusScope === 'all-dependencies' ? 'active' : ''}`}
                      onClick={() => setFocusScope('all-dependencies')}
                      title="Seluruh graf ketergantungan transitif lengkap"
                    >
                      <Layers size={13} />
                      <span>Semua Ketergantungan</span>
                    </button>
                  </div>

                  {/* Direction Selector */}
                  <div className="roadmap-direction-buttons">
                    <button
                      type="button"
                      className={`roadmap-direction-btn ${pathDirection === 'prerequisites' ? 'active' : ''}`}
                      onClick={() => setPathDirection('prerequisites')}
                      title="Hanya sorot prasyarat ke arah hulu (Upstream)"
                      aria-pressed={pathDirection === 'prerequisites'}
                    >
                      Prasyarat
                    </button>
                    <button
                      type="button"
                      className={`roadmap-direction-btn ${pathDirection === 'dependents' ? 'active' : ''}`}
                      onClick={() => setPathDirection('dependents')}
                      title="Hanya sorot modul lanjutan ke arah hilir (Downstream)"
                      aria-pressed={pathDirection === 'dependents'}
                    >
                      Lanjutan
                    </button>
                    <button
                      type="button"
                      className={`roadmap-direction-btn ${pathDirection === 'both' ? 'active' : ''}`}
                      onClick={() => setPathDirection('both')}
                      title="Sorot prasyarat hulu dan materi hilir sekaligus"
                      aria-pressed={pathDirection === 'both'}
                    >
                      Keduanya
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interaction Hint Bar in Overview Mode */}
            {!isFocusMode && (
              <div className={`roadmap-interaction-hint ${isHoverPreview ? 'active-isolation' : ''}`}>
                {isHoverPreview ? (
                  <span className="roadmap-isolation-status">
                    <strong>Pratinjau Kursor (Hover):</strong>{' '}
                    {getRoadmapNodeById(hoveredNodeId!)?.code} — {getRoadmapNodeById(hoveredNodeId!)?.title}{' '}
                    ({activeSelection.activeNodeIds.size} node terhubung) · <em>Klik untuk membuka Mode Fokus</em>
                  </span>
                ) : (
                  <span>
                    <strong>Arahkan kursor</strong> untuk pratinjau jalur · <strong>Klik node</strong> untuk membuka{' '}
                    <strong>Mode Fokus</strong> mandiri
                  </span>
                )}
                <button
                  type="button"
                  className="roadmap-unpin-btn roadmap-show-all-btn"
                  onClick={() => {
                    setFocusedNodeId(null);
                    setHoveredNodeId(null);
                    setSelectedResearchTrack('all');
                  }}
                  title="Tampilkan seluruh graf kurikulum (Reset)"
                  aria-label="Tampilkan semua node"
                >
                  <Eye size={13} />
                  <span>Tampilkan Semua</span>
                </button>
              </div>
            )}

            {/* Zoom / Viewport controls floating overlay */}
            {(!isFocusMode || focusViewMode === 'graph') && (
              <div className="roadmap-viewport-controls">
                <button
                  type="button"
                  className="roadmap-viewport-btn"
                  onClick={() => handleZoom(0.15)}
                  title="Perbesar kanvas"
                  aria-label="Perbesar"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="roadmap-zoom-label">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  className="roadmap-viewport-btn"
                  onClick={() => handleZoom(-0.15)}
                  title="Perkecil kanvas"
                  aria-label="Perkecil"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  className="roadmap-viewport-btn"
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  title="Pusatkan kanvas"
                  aria-label="Pusatkan"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            )}

            {/* 1. FOCUS MODE: STRUCTURED STAGED PATHWAY (Phase AC-02C Primary UI) */}
            {isFocusMode && focusViewMode === 'staged' && stagedPathData ? (
              <div className="roadmap-focus-staged-view">
                <div className="staged-view-intro">
                  <div className="staged-view-intro-title">
                    <Sparkles size={16} />
                    <span>Alur Pembelajaran Berjenjang (Structured Learning Pathway)</span>
                  </div>
                  <p className="staged-view-intro-desc">
                    {focusScope === 'main-path'
                      ? 'Menampilkan Jalur Utama (esensial & efisien) dengan dependensi kritis untuk penguasaan kompetensi terarah.'
                      : 'Menampilkan Seluruh Ketergantungan Transitif lengkap menuju dan melampaui topik terpilih.'}
                  </p>
                </div>

                <div className="staged-path-container">
                  {/* TAHAP 1: Fondasi & Prasyarat Utama */}
                  <div className="staged-column stage-1-core">
                    <div className="staged-column-header">
                      <div className="staged-header-badge">
                        <span className="step-number">1</span>
                        <BookOpen size={14} />
                      </div>
                      <div className="staged-header-text">
                        <h4>Fondasi & Prasyarat Utama</h4>
                        <span className="staged-header-sub">Kurikulum Inti L1–L2 ({stagedPathData.corePrereqs.length} Bab)</span>
                      </div>
                    </div>

                    <div className="staged-cards-scroll">
                      {stagedPathData.corePrereqs.length > 0 ? (
                        stagedPathData.coreBySection.map(([sectionTitle, nodes]) => (
                          <div key={sectionTitle} className="staged-section-group">
                            <div className="staged-section-heading">
                              <span className="section-dot"></span>
                              <span className="section-title">{sectionTitle}</span>
                            </div>
                            <div className="staged-cards-list">
                              {nodes.map((node) => {
                                const isDirect = stagedPathData.directPrereqSet.has(node.id);
                                return (
                                  <div
                                    key={node.id}
                                    className={`staged-node-card core-card ${isDirect ? 'direct-prereq' : 'transitive-prereq'}`}
                                    onClick={() => setFocusedNodeId(node.id)}
                                    role="button"
                                    tabIndex={0}
                                    title={`Klik untuk fokus ke ${node.code}: ${node.title}`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setFocusedNodeId(node.id);
                                      }
                                    }}
                                  >
                                    <div className="staged-card-top">
                                      <span className="roadmap-badge-core">{node.code}</span>
                                      <span className={`prereq-badge ${isDirect ? 'required' : 'recommended'}`}>
                                        {isDirect ? 'Wajib' : 'Fondasi'}
                                      </span>
                                    </div>
                                    <h5 className="staged-card-title">{node.title}</h5>
                                    <div className="staged-card-footer">
                                      <span className="staged-card-meta">{node.estimatedHours}j · {node.difficulty}</span>
                                      <button
                                        type="button"
                                        className="staged-card-action"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigateTo(node.route);
                                        }}
                                        title="Buka Materi Bab"
                                      >
                                        <span>Buka</span>
                                        <ArrowRight size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="staged-empty-card">
                          <span className="empty-icon">✓</span>
                          <h5>Fondasi Awal Terbuka</h5>
                          <p>Topik ini merupakan materi fondasional tanpa prasyarat mata kuliah hulu formal.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONNECTOR 1 -> 2 */}
                  <div className="staged-connector-wrapper" aria-hidden="true">
                    <div className="staged-connector-line"></div>
                    <div className="staged-connector-badge" title="Melanjutkan ke Penguatan Lanjutan">
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  {/* TAHAP 2: Persiapan Tingkat Lanjut */}
                  <div className="staged-column stage-2-advanced">
                    <div className="staged-column-header">
                      <div className="staged-header-badge">
                        <span className="step-number">2</span>
                        <GraduationCap size={14} />
                      </div>
                      <div className="staged-header-text">
                        <h4>Persiapan Tingkat Lanjut</h4>
                        <span className="staged-header-sub">Modul Spesialisasi L3 ({stagedPathData.advancedPrereqs.length} Modul)</span>
                      </div>
                    </div>

                    <div className="staged-cards-scroll">
                      {stagedPathData.advancedPrereqs.length > 0 ? (
                        <div className="staged-cards-list">
                          {stagedPathData.advancedPrereqs.map((node) => {
                            const isDirect = stagedPathData.directPrereqSet.has(node.id);
                            return (
                              <div
                                key={node.id}
                                className={`staged-node-card advanced-card ${isDirect ? 'direct-prereq' : 'transitive-prereq'}`}
                                onClick={() => setFocusedNodeId(node.id)}
                                role="button"
                                tabIndex={0}
                                title={`Klik untuk fokus ke ${node.code}: ${node.title}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setFocusedNodeId(node.id);
                                  }
                                }}
                              >
                                <div className="staged-card-top">
                                  <span className="roadmap-badge-advanced">{node.code}</span>
                                  <span className={`prereq-badge ${isDirect ? 'required' : 'recommended'}`}>
                                    {isDirect ? 'Wajib L3' : 'Pengayaan L3'}
                                  </span>
                                </div>
                                <h5 className="staged-card-title">{node.title}</h5>
                                {node.subtitle && <p className="staged-card-subtitle">{node.subtitle}</p>}
                                <div className="staged-card-footer">
                                  <span className="staged-card-meta">{node.estimatedHours}j · {node.sectionOrPillarTitle}</span>
                                  <button
                                    type="button"
                                    className="staged-card-action"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateTo(node.route);
                                    }}
                                    title="Buka Modul Lanjutan"
                                  >
                                    <span>Buka</span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="staged-empty-card info-neutral">
                          <span className="empty-icon">⚡</span>
                          <h5>Jalur Langsung dari Fondasi</h5>
                          <p>Topik ini terhubung langsung dari materi inti fondasi tanpa memerlukan modul perantara L3.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONNECTOR 2 -> 3 */}
                  <div className="staged-connector-wrapper" aria-hidden="true">
                    <div className="staged-connector-line"></div>
                    <div className="staged-connector-badge" title="Menuju Destinasi Terpilih">
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  {/* TAHAP 3: Destinasi Pembelajaran Terpilih (HERO CARD - NO CLIPPING) */}
                  <div className="staged-column stage-3-destination">
                    <div className="staged-column-header destination-header">
                      <div className="staged-header-badge hero-badge">
                        <span className="step-number">3</span>
                        <Target size={14} />
                      </div>
                      <div className="staged-header-text">
                        <h4>Destinasi Terpilih</h4>
                        <span className="staged-header-sub">Fokus Utama Pembelajaran</span>
                      </div>
                    </div>

                    <div className="staged-destination-hero-card">
                      <div className="destination-hero-top">
                        <div className="destination-pills">
                          <span className={`roadmap-level-pill ${stagedPathData.destination.type}`}>
                            {stagedPathData.destination.level}
                          </span>
                          <span className="roadmap-code-pill hero-code">{stagedPathData.destination.code}</span>
                          <span className="hero-target-tag">🎯 Target</span>
                        </div>
                        <div className="destination-category-badge">
                          {stagedPathData.destination.sectionOrPillarTitle}
                        </div>
                      </div>

                      <h3 className="destination-hero-title">{stagedPathData.destination.title}</h3>
                      {stagedPathData.destination.subtitle && (
                        <p className="destination-hero-subtitle">{stagedPathData.destination.subtitle}</p>
                      )}

                      <p className="destination-hero-desc">{stagedPathData.destination.description}</p>

                      <div className="destination-stats-grid">
                        <div className="dest-stat-item">
                          <span className="dest-stat-label">Beban Belajar</span>
                          <span className="dest-stat-val">{stagedPathData.destination.estimatedHours} Jam</span>
                        </div>
                        <div className="dest-stat-item">
                          <span className="dest-stat-label">Tingkat Kesulitan</span>
                          <span className="dest-stat-val">{stagedPathData.destination.difficulty}</span>
                        </div>
                        <div className="dest-stat-item">
                          <span className="dest-stat-label">Kategori / Bidang</span>
                          <span className="dest-stat-val">{stagedPathData.destination.category || 'Kurikulum Inti'}</span>
                        </div>
                      </div>

                      <div className="destination-telecom-box">
                        <div className="destination-telecom-header">
                          <Radio size={14} />
                          <span>Relevansi Telekomunikasi & ITERA ISVWS 2026–2040</span>
                        </div>
                        <p>{stagedPathData.destination.telecomRelevance}</p>
                      </div>

                      <div className="destination-actions">
                        <button
                          type="button"
                          className="roadmap-btn-primary destination-btn-primary"
                          onClick={() => navigateTo(stagedPathData.destination.route)}
                        >
                          <BookOpen size={15} />
                          <span>Buka Materi ({stagedPathData.destination.code})</span>
                        </button>
                        {stagedPathData.destination.labId && (
                          <button
                            type="button"
                            className="roadmap-btn-secondary destination-btn-secondary"
                            onClick={() => navigateTo(`#/playgrounds/${stagedPathData.destination.labId}`)}
                          >
                            <FlaskConical size={15} />
                            <span>Buka Laboratorium Interaktif</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CONNECTOR 3 -> 4 */}
                  <div className="staged-connector-wrapper" aria-hidden="true">
                    <div className="staged-connector-line"></div>
                    <div className="staged-connector-badge" title="Melangkah ke Riset Lanjutan">
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  {/* TAHAP 4: Langkah Lanjutan & Prospek Riset */}
                  <div className="staged-column stage-4-next">
                    <div className="staged-column-header">
                      <div className="staged-header-badge">
                        <span className="step-number">4</span>
                        <Microscope size={14} />
                      </div>
                      <div className="staged-header-text">
                        <h4>Langkah Lanjutan & Prospek</h4>
                        <span className="staged-header-sub">
                          {stagedPathData.downstreamNodes.length > 0
                            ? `Membuka ${stagedPathData.downstreamNodes.length} Topik Hilir`
                            : 'Capaian Riset Puncak'}
                        </span>
                      </div>
                    </div>

                    <div className="staged-cards-scroll">
                      {stagedPathData.downstreamNodes.length > 0 ? (
                        <div className="staged-cards-list">
                          {stagedPathData.downstreamNodes.map((node) => (
                            <div
                              key={node.id}
                              className={`staged-node-card next-card ${node.type}`}
                              onClick={() => setFocusedNodeId(node.id)}
                              role="button"
                              tabIndex={0}
                              title={`Klik untuk fokus ke ${node.code}: ${node.title}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setFocusedNodeId(node.id);
                                }
                              }}
                            >
                              <div className="staged-card-top">
                                <span className={`roadmap-badge-${node.type}`}>{node.code}</span>
                                <span className="next-badge">Materi Lanjutan</span>
                              </div>
                              <h5 className="staged-card-title">{node.title}</h5>
                              {node.subtitle && <p className="staged-card-subtitle">{node.subtitle}</p>}
                              <div className="staged-card-footer">
                                <span className="staged-card-meta">{node.estimatedHours}j · {node.sectionOrPillarTitle}</span>
                                <button
                                  type="button"
                                  className="staged-card-action"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateTo(node.route);
                                  }}
                                  title="Buka Materi Lanjutan"
                                >
                                  <span>Buka</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="staged-empty-card destination-capstone">
                          <span className="empty-icon">🎓</span>
                          <h5>Capaian Puncak Kurikulum</h5>
                          <p>
                            Modul ini berada pada tingkatan riset strategis tertinggi dalam kerangka kerja ITERA ISVWS 2026–2040.
                            Luaran kompetensi langsung diarahkan ke publikasi jurnal/konferensi internasional, penulisan tugas akhir,
                            serta implementasi capstone multi-sensor mandiri.
                          </p>
                          <div className="capstone-badges">
                            <span className="capstone-pill">Publikasi IEEE/Springer</span>
                            <span className="capstone-pill">Tugas Akhir Mandiri</span>
                            <span className="capstone-pill">Inovasi Industri</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : isFocusMode && compactLayout ? (
              /* 2. FOCUS MODE SVG DAG (Phase AC-02B: Compact Layout Mode) */
              <svg
                className="roadmap-svg roadmap-focus-svg"
                width="100%"
                height={Math.max(540, compactLayout.height)}
                viewBox={`0 0 ${compactLayout.width} ${compactLayout.height}`}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: '50% 50%',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
              >
                <defs>
                  <marker
                    id="arrow-focus"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--primary)" />
                  </marker>
                </defs>

                {/* Stage Columns Backgrounds and Headers */}
                <g className="roadmap-focus-stages">
                  {compactLayout.layers.map((layer) => {
                    const firstPos = compactLayout.positions.get(layer.nodeIds[0]);
                    if (!firstPos) return null;
                    return (
                      <g key={layer.layerIndex} className="roadmap-focus-stage-col">
                        <rect
                          x={firstPos.x - 16}
                          y={34}
                          width={firstPos.width + 32}
                          height={compactLayout.height - 48}
                          rx="12"
                          className="roadmap-focus-col-rect"
                        />
                        <text
                          x={firstPos.x + firstPos.width / 2}
                          y={24}
                          textAnchor="middle"
                          className="roadmap-focus-col-label"
                        >
                          {layer.label} ({layer.nodeIds.length})
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* 2 & 3. Focus Connecting Edges Layer (strictly rendered before nodes layer) */}
                <g className="roadmap-edges-layer roadmap-edges-active-layer roadmap-focus-edges-layer">
                  {focusedActiveEdges.map((edge, edgeIdx) => {
                    const srcPos = compactLayout.positions.get(edge.source);
                    const tgtPos = compactLayout.positions.get(edge.target);
                    if (!srcPos || !tgtPos) return null;

                    const routing = computeFocusEdgePath(
                      srcPos,
                      tgtPos,
                      compactLayout.positions,
                      compactLayout.width,
                      compactLayout.height,
                      edgeIdx
                    );

                    return (
                      <path
                        key={edge.id}
                        d={routing.d}
                        className={`roadmap-edge active roadmap-focus-edge ${routing.routingMode}`}
                        markerEnd="url(#arrow-focus)"
                        onMouseEnter={(e) => handleEdgeMouseEnter(edge, e)}
                        onMouseMove={handleEdgeMouseMove}
                        onMouseLeave={handleEdgeMouseLeave}
                      />
                    );
                  })}
                </g>

                {/* 4. Focus Nodes Layer (rendered AFTER edges layer so cards sit on top of all edges) */}
                <g className="roadmap-nodes-layer roadmap-focus-nodes-layer">
                  {focusedActiveNodes.map((node) => {
                    const p = compactLayout.positions.get(node.id);
                    if (!p) return null;

                    const isTarget = node.id === focusedNodeId;
                    const isUpstream = focusedTraversal?.upstreamNodeIds.includes(node.id);
                    const isDownstream = focusedTraversal?.downstreamNodeIds.includes(node.id);

                    let nodeClass = `roadmap-svg-node ${node.type}`;
                    if (isTarget) nodeClass += ' pinned target-node';
                    if (isUpstream) nodeClass += ' upstream';
                    if (isDownstream) nodeClass += ' downstream';

                    return (
                      <g
                        key={node.id}
                        className={nodeClass}
                        transform={`translate(${p.x}, ${p.y})`}
                        onClick={(e) => handleNodeClick(node.id, e)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${node.code}: ${node.title}. ${
                          isTarget ? 'Target fokus terpilih.' : isUpstream ? 'Prasyarat hulu.' : 'Materi lanjutan hilir.'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNodeClick(node.id);
                          }
                        }}
                      >
                        {/* Opaque base rectangle prevents any background line bleed-through */}
                        <rect width={p.width} height={p.height} rx="8" className="roadmap-node-bg-rect" fill="var(--bg-card)" />
                        <rect width={p.width} height={p.height} rx="8" className="roadmap-node-rect" />
                        <text x="12" y="22" className="roadmap-node-code">
                          {node.code}
                        </text>
                        {isTarget && (
                          <text x={p.width - 24} y="22" className="roadmap-node-pin-icon" fill="var(--primary)">
                            🎯
                          </text>
                        )}
                        <text x="12" y="42" className="roadmap-node-title">
                          {node.title.length > 22 ? `${node.title.slice(0, 20)}…` : node.title}
                        </text>
                        <text x="12" y="58" className="roadmap-node-meta">
                          {isTarget
                            ? '★ Target Terpilih'
                            : isUpstream
                            ? '↑ Prasyarat'
                            : isDownstream
                            ? '↓ Lanjutan'
                            : node.type === 'core'
                            ? `${node.estimatedHours}j · ${node.difficulty}`
                            : node.category?.slice(0, 16) || 'Modul'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            ) : (
              /* 2. OVERVIEW SVG DAG (Full 74-Node Graph with Stable Coordinates & Hover Highlight) */
              <svg
                className="roadmap-svg"
                width="100%"
                height="880"
                viewBox="0 0 1400 880"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: '50% 50%',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
              >
                <defs>
                  <marker
                    id="arrow-default"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--border)" opacity="0.6" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--primary)" />
                  </marker>
                </defs>

                {/* Tier Background Zones */}
                <g className="roadmap-tier-zones">
                  {/* Tier 3: Research Zone */}
                  <rect x="20" y="30" width="1360" height="150" rx="12" className="roadmap-zone-rect roadmap-zone-research" />
                  <text x="35" y="52" className="roadmap-zone-label">
                    TIER-3 · JALUR RISET STRATEGIS & UTAMA (L4 RESEARCH TRACKS)
                  </text>

                  {/* Tier 2: Advanced Zone */}
                  <rect x="20" y="210" width="1360" height="170" rx="12" className="roadmap-zone-rect roadmap-zone-advanced" />
                  <text x="35" y="232" className="roadmap-zone-label">
                    TIER-2 · MODUL LANJUTAN & MATEMATIKA MANDIRI (L3 ADVANCED MODULES)
                  </text>

                  {/* Tier 1: Core Zone */}
                  <rect x="20" y="410" width="1360" height="450" rx="12" className="roadmap-zone-rect roadmap-zone-core" />
                  <text x="35" y="432" className="roadmap-zone-label">
                    TIER-1 · FONDASI KURIKULUM INTI (L1–L2 CORE CHAPTERS 01–60)
                  </text>
                </g>

                {/* 2 & 3. All Edges Layer (strictly rendered before nodes layer) */}
                <g className="roadmap-edges-layer">
                  {/* Inactive Background Edges Layer */}
                  <g className="roadmap-edges-inactive-layer">
                    {inactiveEdges.map((edge) => {
                      const srcPos = nodePositions.get(edge.source);
                      const tgtPos = nodePositions.get(edge.target);
                      if (!srcPos || !tgtPos) return null;

                      const x1 = srcPos.x + srcPos.width / 2;
                      const y1 = srcPos.y;
                      const x2 = tgtPos.x + tgtPos.width / 2;
                      const y2 = tgtPos.y + tgtPos.height;
                      const midY = (y1 + y2) / 2;
                      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                      const isDimmed = isHoverPreview;

                      return (
                        <path
                          key={edge.id}
                          d={d}
                          className={`roadmap-edge ${isDimmed ? 'dimmed' : ''}`}
                          markerEnd="url(#arrow-default)"
                          onMouseEnter={(e) => handleEdgeMouseEnter(edge, e)}
                          onMouseMove={handleEdgeMouseMove}
                          onMouseLeave={handleEdgeMouseLeave}
                        />
                      );
                    })}
                  </g>

                  {/* Active Highlighted Edges Layer (Rendered above inactive edges, but strictly behind cards) */}
                  <g className="roadmap-edges-active-layer">
                    {activeEdges.map((edge) => {
                      const srcPos = nodePositions.get(edge.source);
                      const tgtPos = nodePositions.get(edge.target);
                      if (!srcPos || !tgtPos) return null;

                      const x1 = srcPos.x + srcPos.width / 2;
                      const y1 = srcPos.y;
                      const x2 = tgtPos.x + tgtPos.width / 2;
                      const y2 = tgtPos.y + tgtPos.height;
                      const midY = (y1 + y2) / 2;
                      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                      return (
                        <path
                          key={edge.id}
                          d={d}
                          className="roadmap-edge active"
                          markerEnd="url(#arrow-active)"
                          onMouseEnter={(e) => handleEdgeMouseEnter(edge, e)}
                          onMouseMove={handleEdgeMouseMove}
                          onMouseLeave={handleEdgeMouseLeave}
                        />
                      );
                    })}
                  </g>
                </g>

                {/* 4. Nodes Layer: Full 74 Nodes with Stable Coordinates (Rendered AFTER all edges) */}
                <g className="roadmap-nodes-layer">
                  {visibleNodes.map((node) => {
                    const p = nodePositions.get(node.id);
                    if (!p) return null;

                    const isHovered = hoveredNodeId === node.id;
                    const isSource = activeSelection.targetNodeId === node.id;
                    const isUpstream = activeSelection.upstreamNodeIds.has(node.id);
                    const isDownstream = activeSelection.downstreamNodeIds.has(node.id);
                    const isHighlighted = activeSelection.activeNodeIds.has(node.id);
                    const isDimmed = isHoverPreview && !isHighlighted;

                    let nodeClass = `roadmap-svg-node ${node.type}`;
                    if (isHovered) nodeClass += ' hovered';
                    if (isSource) nodeClass += ' source';
                    if (isUpstream) nodeClass += ' upstream';
                    if (isDownstream) nodeClass += ' downstream';
                    if (isHighlighted) nodeClass += ' highlighted';
                    if (isDimmed) nodeClass += ' dimmed';

                    return (
                      <g
                        key={node.id}
                        className={nodeClass}
                        transform={`translate(${p.x}, ${p.y})`}
                        onClick={(e) => handleNodeClick(node.id, e)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onFocus={() => setHoveredNodeId(node.id)}
                        onBlur={() => setHoveredNodeId(null)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${node.code}: ${node.title}. ${
                          isUpstream ? 'Prasyarat hulu.' : isDownstream ? 'Materi lanjutan hilir.' : ''
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNodeClick(node.id);
                          }
                        }}
                      >
                        {/* Opaque base rectangle ensures zero line bleed-through */}
                        <rect width={p.width} height={p.height} rx="8" className="roadmap-node-bg-rect" fill="var(--bg-card)" />
                        <rect width={p.width} height={p.height} rx="8" className="roadmap-node-rect" />

                        {/* Header badge / Code */}
                        <text x="10" y="20" className="roadmap-node-code">
                          {node.code}
                        </text>

                        {/* Title text */}
                        <text x="10" y="38" className="roadmap-node-title">
                          {node.title.length > (node.type === 'core' ? 12 : 22)
                            ? `${node.title.slice(0, node.type === 'core' ? 11 : 20)}…`
                            : node.title}
                        </text>

                        {/* Level / Subtitle / Role info */}
                        <text x="10" y="54" className="roadmap-node-meta">
                          {isUpstream
                            ? '↑ Prasyarat'
                            : isDownstream
                            ? '↓ Lanjutan'
                            : node.type === 'core'
                            ? `${node.estimatedHours}j · ${node.difficulty}`
                            : node.type === 'advanced'
                            ? `${node.estimatedHours}j · Pilar ${node.sectionOrPillarId.replace('pillar-', '')}`
                            : node.category?.slice(0, 18) || 'Riset'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* Compact Bottom Inspector Card in Focus Mode (Phase AC-02B, shown in graph mode) */}
            {isFocusMode && focusViewMode === 'graph' && focusedNode && (
              <div className={`roadmap-compact-inspector ${isInspectorExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="compact-inspector-header">
                  <div className="compact-inspector-title-row">
                    <span className={`roadmap-level-pill ${focusedNode.type}`}>{focusedNode.level}</span>
                    <span className="roadmap-code-pill">{focusedNode.code}</span>
                    <h3 className="compact-inspector-title">{focusedNode.title}</h3>
                    <span className="compact-inspector-hours">{focusedNode.estimatedHours} Jam Belajar</span>
                  </div>
                  <div className="compact-inspector-actions">
                    <button
                      type="button"
                      className="roadmap-btn-primary compact-link-btn"
                      onClick={() => navigateTo(focusedNode.route)}
                    >
                      <span>Buka Materi</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      className="roadmap-btn-secondary compact-toggle-btn"
                      onClick={() => setIsInspectorExpanded(!isInspectorExpanded)}
                      aria-expanded={isInspectorExpanded}
                      title={isInspectorExpanded ? 'Sembunyikan detail' : 'Tampilkan detail lengkap'}
                    >
                      <span>{isInspectorExpanded ? 'Tutup Detail' : 'Detail Akademik'}</span>
                      {isInspectorExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {isInspectorExpanded && (
                  <div className="compact-inspector-body">
                    {focusedNode.subtitle && <p className="compact-inspector-subtitle">{focusedNode.subtitle}</p>}
                    <p className="compact-inspector-desc">{focusedNode.description}</p>
                    <div className="compact-telecom-box">
                      <strong>Relevansi Telekomunikasi & ITERA:</strong> {focusedNode.telecomRelevance}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edge Hover Tooltip */}
            {hoveredEdge && edgeTooltipPos && (
              <div
                className="roadmap-edge-tooltip"
                style={{
                  top: edgeTooltipPos.y,
                  left: edgeTooltipPos.x
                }}
                role="tooltip"
              >
                <div className="roadmap-edge-tooltip-header">
                  <span className="tooltip-badge">
                    {hoveredEdge.type === 'research-pathway' ? 'Jalur Riset' : 'Prasyarat Wajib'}
                  </span>
                  <span className="tooltip-edge-id">
                    {hoveredEdge.sourceCode} → {hoveredEdge.targetCode}
                  </span>
                </div>
                <div className="roadmap-edge-tooltip-content">
                  <div className="tooltip-row">
                    <span className="tooltip-label">Dari:</span>
                    <span className="tooltip-value">
                      {hoveredEdge.sourceCode} · {hoveredEdge.sourceTitle}
                    </span>
                  </div>
                  <div className="tooltip-row">
                    <span className="tooltip-label">Ke:</span>
                    <span className="tooltip-value">
                      {hoveredEdge.targetCode} · {hoveredEdge.targetTitle}
                    </span>
                  </div>
                  <p className="tooltip-justification">{hoveredEdge.academicJustification}</p>
                </div>
              </div>
            )}

            {/* Edge Hover Tooltip (Section 5) */}
            {hoveredEdge && edgeTooltipPos && (
              <div
                className="roadmap-edge-tooltip"
                style={{
                  top: edgeTooltipPos.y,
                  left: edgeTooltipPos.x
                }}
                role="tooltip"
              >
                <div className="roadmap-edge-tooltip-header">
                  <span className="tooltip-badge">{hoveredEdge.type === 'research-pathway' ? 'Jalur Riset' : 'Prasyarat Wajib'}</span>
                  <span className="tooltip-edge-id">{hoveredEdge.sourceCode} → {hoveredEdge.targetCode}</span>
                </div>
                <div className="roadmap-edge-tooltip-content">
                  <div className="tooltip-row">
                    <span className="tooltip-label">Dari:</span>
                    <span className="tooltip-value">{hoveredEdge.sourceCode} · {hoveredEdge.sourceTitle}</span>
                  </div>
                  <div className="tooltip-row">
                    <span className="tooltip-label">Ke:</span>
                    <span className="tooltip-value">{hoveredEdge.targetCode} · {hoveredEdge.targetTitle}</span>
                  </div>
                  <p className="tooltip-justification">{hoveredEdge.academicJustification}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Accessible Tree / List View */
          <div className="roadmap-tree-wrapper">
            {/* Level 4: Research Tracks */}
            <div className="roadmap-tree-section">
              <div className="roadmap-tree-section-header">
                <Microscope size={18} />
                <h2>Jalur Riset Tingkat L4 (Research Learning Tracks)</h2>
                <span className="roadmap-tree-count">6 Jalur</span>
              </div>
              <div className="roadmap-tree-grid">
                {filteredNodes
                  .filter((n) => n.type === 'research')
                  .map((node) => (
                    <div
                      key={node.id}
                      className={`roadmap-tree-card ${pinnedNodeId === node.id || hoveredNodeId === node.id ? 'active' : ''}`}
                      onClick={() => handleNodeClick(node.id)}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="roadmap-tree-card-top">
                        <span className="roadmap-badge-research">{node.code}</span>
                        <span className="roadmap-tree-category">{node.category}</span>
                      </div>
                      <h3>{node.title}</h3>
                      <p className="roadmap-tree-desc">{node.subtitle}</p>
                      <div className="roadmap-tree-prereqs">
                        <strong>Prasyarat:</strong>{' '}
                        {node.prerequisites.length > 0
                          ? node.prerequisites
                              .map((pid) => getRoadmapNodeById(pid)?.code || pid)
                              .slice(0, 4)
                              .join(', ') + (node.prerequisites.length > 4 ? '...' : '')
                          : 'Tidak ada'}
                      </div>
                      <div className="roadmap-tree-footer">
                        <button
                          type="button"
                          className="roadmap-tree-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo(node.route);
                          }}
                        >
                          <span>Buka Riset</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Level 3: Advanced Modules */}
            <div className="roadmap-tree-section">
              <div className="roadmap-tree-section-header">
                <GraduationCap size={18} />
                <h2>Modul Lanjutan Tingkat L3 (Advanced Modules)</h2>
                <span className="roadmap-tree-count">8 Modul</span>
              </div>
              <div className="roadmap-tree-grid">
                {filteredNodes
                  .filter((n) => n.type === 'advanced')
                  .map((node) => (
                    <div
                      key={node.id}
                      className={`roadmap-tree-card ${pinnedNodeId === node.id || hoveredNodeId === node.id ? 'active' : ''}`}
                      onClick={() => handleNodeClick(node.id)}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="roadmap-tree-card-top">
                        <span className="roadmap-badge-advanced">{node.code}</span>
                        <span className="roadmap-tree-category">{node.sectionOrPillarTitle}</span>
                      </div>
                      <h3>{node.title}</h3>
                      <p className="roadmap-tree-desc">{node.subtitle}</p>
                      <div className="roadmap-tree-footer">
                        <button
                          type="button"
                          className="roadmap-tree-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo(node.route);
                          }}
                        >
                          <span>Buka Modul</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Level 1-2: Core Chapters */}
            <div className="roadmap-tree-section">
              <div className="roadmap-tree-section-header">
                <BookOpen size={18} />
                <h2>Kurikulum Inti Tingkat L1–L2 (Core Chapters)</h2>
                <span className="roadmap-tree-count">60 Bab</span>
              </div>
              <div className="roadmap-tree-grid-compact">
                {filteredNodes
                  .filter((n) => n.type === 'core')
                  .map((node) => (
                    <div
                      key={node.id}
                      className={`roadmap-tree-card-mini ${pinnedNodeId === node.id || hoveredNodeId === node.id ? 'active' : ''}`}
                      onClick={() => handleNodeClick(node.id)}
                      tabIndex={0}
                      role="button"
                    >
                      <span className="roadmap-badge-core">{node.code}</span>
                      <h4>{node.title}</h4>
                      <span className="roadmap-mini-section">{node.sectionOrPillarTitle}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Node Inspector Drawer (Accessible in Tree View mode) */}
        {viewMode === 'tree' && inspectorNode && (
          <div className="roadmap-inspector">
            <div className="roadmap-inspector-header">
              <div className="roadmap-inspector-badges">
                <span className={`roadmap-level-pill ${inspectorNode.type}`}>{inspectorNode.level}</span>
                <span className="roadmap-code-pill">{inspectorNode.code}</span>
                {pinnedNodeId === inspectorNode.id ? (
                  <span className="roadmap-status-badge pinned" title="Disematkan oleh pengguna">
                    <Pin size={11} />
                    <span>Pinned</span>
                  </span>
                ) : hoveredNodeId === inspectorNode.id ? (
                  <span className="roadmap-status-badge preview" title="Pratinjau sementara">
                    <span>Preview</span>
                  </span>
                ) : null}
              </div>
              <div className="roadmap-inspector-actions">
                <button
                  type="button"
                  className={`roadmap-inspector-pin-toggle ${pinnedNodeId === inspectorNode.id ? 'pinned' : ''}`}
                  onClick={() => setPinnedNodeId((curr) => (curr === inspectorNode.id ? null : inspectorNode.id))}
                  title={pinnedNodeId === inspectorNode.id ? 'Lepas Pin (Unpin)' : 'Sematkan Jalur (Pin)'}
                >
                  {pinnedNodeId === inspectorNode.id ? <PinOff size={15} /> : <Pin size={15} />}
                </button>
                <button
                  type="button"
                  className="roadmap-inspector-close"
                  onClick={() => {
                    setPinnedNodeId(null);
                    setHoveredNodeId(null);
                  }}
                  aria-label="Tutup panel inspeksi (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="roadmap-inspector-body">
              <h3 className="roadmap-inspector-title">{inspectorNode.title}</h3>
              {inspectorNode.subtitle && (
                <p className="roadmap-inspector-subtitle">{inspectorNode.subtitle}</p>
              )}
              <p className="roadmap-inspector-desc">{inspectorNode.description}</p>

              {/* Meta properties */}
              <div className="roadmap-meta-grid">
                <div className="roadmap-meta-item">
                  <span className="meta-label">Estimasi Waktu:</span>
                  <span className="meta-value">{inspectorNode.estimatedHours} Jam Belajar</span>
                </div>
                <div className="roadmap-meta-item">
                  <span className="meta-label">Seksi / Pilar:</span>
                  <span className="meta-value">{inspectorNode.sectionOrPillarTitle}</span>
                </div>
                <div className="roadmap-meta-item">
                  <span className="meta-label">Tingkat Kesulitan:</span>
                  <span className="meta-value">{inspectorNode.difficulty}</span>
                </div>
              </div>

              {/* Telecom Relevance & ITERA Alignment Note */}
              <div className="roadmap-telecom-box">
                <div className="roadmap-telecom-header">
                  <Radio size={16} />
                  <span>Relevansi Telekomunikasi & ITERA ISVWS 2026–2040</span>
                </div>
                <p>{inspectorNode.telecomRelevance}</p>
              </div>

              {/* Prerequisites Section (Upstream) */}
              <div className="roadmap-inspector-relations">
                <h4>Prasyarat yang Diperlukan ({inspectorNode.prerequisites.length}):</h4>
                {inspectorNode.prerequisites.length > 0 ? (
                  <div className="roadmap-relation-chips">
                    {inspectorNode.prerequisites.map((pid) => {
                      const pNode = getRoadmapNodeById(pid);
                      return (
                        <button
                          key={pid}
                          type="button"
                          className="roadmap-relation-chip prereq"
                          onClick={() => setPinnedNodeId(pid)}
                          onMouseEnter={() => setHoveredNodeId(pid)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          title={pNode?.title || pid}
                        >
                          <ChevronRight size={12} />
                          <span>{pNode ? `${pNode.code}: ${pNode.title}` : pid}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="roadmap-no-relations">Modul fondasi awal (tanpa prasyarat formal).</p>
                )}
              </div>

              {/* Unlocked Downstream Topics */}
              <div className="roadmap-inspector-relations">
                <h4>Membuka Topik Lanjutan ({inspectorNode.unlocks.length}):</h4>
                {inspectorNode.unlocks.length > 0 ? (
                  <div className="roadmap-relation-chips">
                    {inspectorNode.unlocks.map((uid) => {
                      const uNode = getRoadmapNodeById(uid);
                      return (
                        <button
                          key={uid}
                          type="button"
                          className="roadmap-relation-chip unlock"
                          onClick={() => setPinnedNodeId(uid)}
                          onMouseEnter={() => setHoveredNodeId(uid)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          title={uNode?.title || uid}
                        >
                          <ArrowRight size={12} />
                          <span>{uNode ? `${uNode.code}: ${uNode.title}` : uid}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="roadmap-no-relations">Target capaian puncak (terminal track).</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="roadmap-inspector-footer">
              <button
                type="button"
                className="roadmap-btn-primary full-width"
                onClick={() => navigateTo(inspectorNode.route)}
              >
                <BookOpen size={16} />
                <span>Buka Materi ({inspectorNode.code})</span>
              </button>

              {inspectorNode.labId && (
                <button
                  type="button"
                  className="roadmap-btn-secondary full-width"
                  onClick={() => navigateTo(`#/playgrounds/${inspectorNode.labId}`)}
                >
                  <FlaskConical size={16} />
                  <span>Buka Laboratorium Interaktif</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
