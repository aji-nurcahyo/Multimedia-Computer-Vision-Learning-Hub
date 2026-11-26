import masterCurriculumData from '../../content/curriculum/master-curriculum.json' with { type: 'json' };
import advancedModulesData from '../../content/curriculum/advanced-modules.json' with { type: 'json' };
import researchTracksData from '../../content/curriculum/research-tracks.json' with { type: 'json' };

export type RoadmapNodeType = 'core' | 'advanced' | 'research';
export type RoadmapLevel = 'L1 Dasar' | 'L2 Menengah' | 'L3 Lanjutan' | 'L4 Riset';

export interface RoadmapNode {
  id: string; // e.g., 'ch-01', 'adv-01', 'r01'
  rawId: string; // '01', 'adv-01', 'r01'
  type: RoadmapNodeType;
  code: string; // 'Bab 01', 'ADV-01', 'R01'
  title: string;
  subtitle: string;
  description: string;
  level: RoadmapLevel;
  sectionOrPillarId: string;
  sectionOrPillarTitle: string;
  category?: string;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[]; // Node IDs
  unlocks: string[]; // Node IDs
  route: string;
  labId?: string;
  telecomRelevance: string;
  tier: 'Tier-1 Core' | 'Tier-2 Advanced' | 'Tier-3 Research';
}

export type EdgeType = 'required-prerequisite' | 'recommended-prerequisite' | 'research-pathway';

export interface RoadmapEdge {
  id: string;
  source: string; // Prerequisite node ID
  target: string; // Dependent node ID
  type: EdgeType;
  label?: string;
  sourceCode: string;
  sourceTitle: string;
  targetCode: string;
  targetTitle: string;
  academicJustification: string;
}

export type PathDirection = 'prerequisites' | 'dependents' | 'both';

export interface TraversalResult {
  targetNodeId: string;
  direction: PathDirection;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  upstreamNodeIds: string[];
  downstreamNodeIds: string[];
}

export interface ResearchPathway {
  trackId: string;
  trackCode: string;
  trackTitle: string;
  category: string;
  description: string;
  primaryAdvancedModules: string[];
  keyCoreChapters: string[];
  allNodeIds: string[];
  allEdgeIds: string[];
}

const SECTION_TELECOM_CONTEXT: Record<string, string> = {
  '01': 'Fondasi kuantisasi ADC, modulasi pulsa, teorema sampling Nyquist-Shannon (fs >= 2 fmax), dan perhitungan SQNR (6.02b + 1.76 dB) untuk transmisi sinyal multimedia.',
  '02': 'Representasi matriks piksel dan subsampling warna (YUV 4:2:0/4:2:2) untuk penghematan bandwidth transmisi siaran digital dan video nirkabel.',
  '03': 'Transformasi Fourier 2D (DFT/FFT), kompresi spektral berbasis frekuensi (DCT), dan restorasi citra dari derau kanal telekomunikasi.',
  '04': 'Pengolahan sinyal wicara digital, psikoakustika kompresi audio (MP3/AAC), dan transmisi suara berkecepatan bit rendah (AMR/EVS).',
  '05': 'Sistem cerdas audio, pengenalan ucapan (ASR), pembatalan gema akustik (AEC), dan beamforming array mikrofon untuk telekonferensi.',
  '06': 'Standar kompresi video digital (H.264/HEVC/AV1), struktur GOP (I/P/B frames), dan transmisi paket video melintasi jaringan telekomunikasi IP.',
  '07': 'Analisis video cerdas, estimasi pergerakan objek, dan pelacakan target multi-kamera pada jaringan sensor lalu lintas cerdas perkotaan.',
  '08': 'Geometri proyeksi kamera, kalibrasi sensor visual, dan deskriptor fitur invarian untuk navigasi tele-robotika dan drone nirkabel.',
  '09': 'Jaringan saraf tiruan konvolusional (CNN) dan detektor objek real-time (YOLO) yang dioperasikan pada gateway telekomunikasi edge.',
  '10': 'Vision Transformers (ViT), pemangkasan token visual (Token Pruning), dan komunikasi semantik (Semantic Communications) via kanal berderau.',
  '11': 'Model fondasi visual-bahasa (CLIP/LLaVA) dan transmisi embedding multimodal berdimensi rendah via kanal uplink nirkabel seluler (4G/5G).',
  '12': 'Protokol streaming multimedia real-time (WebRTC/RTP), adaptasi bandwidth dinamis, jitter buffer, dan optimasi edge AI berdaya sub-5 Watt.'
};

// Compile all 74 Canonical Nodes
function buildRoadmapNodes(): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const nodesMap = new Map<string, RoadmapNode>();
  const edgesList: RoadmapEdge[] = [];

  // 1. Core Chapters (60 nodes: ch-01 .. ch-60)
  masterCurriculumData.chapters.forEach((ch: any) => {
    const rawId = ch.id;
    const nodeId = `ch-${rawId}`;
    const sectionId = ch.sectionId || '01';
    const sectionTitle = ch.sectionTitle || 'Core Section';
    const telecom = SECTION_TELECOM_CONTEXT[sectionId] || 'Relevansi transmisi dan pemrosesan sinyal pada sistem telekomunikasi digital.';

    // Clean unique prerequisites
    const prereqRaw = Array.from(new Set<string>(ch.prerequisites || []))
      .filter((pid) => pid !== rawId && parseInt(pid, 10) < parseInt(rawId, 10))
      .map((pid) => `ch-${pid}`);

    const node: RoadmapNode = {
      id: nodeId,
      rawId,
      type: 'core',
      code: `Bab ${rawId}`,
      title: ch.title,
      subtitle: ch.sectionTitle,
      description: ch.description,
      level: parseInt(rawId, 10) <= 25 ? 'L1 Dasar' : 'L2 Menengah',
      sectionOrPillarId: `sec-${sectionId}`,
      sectionOrPillarTitle: sectionTitle,
      estimatedHours: Math.round((ch.durationMinutes || 90) / 60 * 10) / 10,
      difficulty: ch.difficulty || 'beginner',
      prerequisites: prereqRaw,
      unlocks: [],
      route: `#/chapter/${rawId}`,
      labId: `ch${rawId}`,
      telecomRelevance: telecom,
      tier: 'Tier-1 Core'
    };

    nodesMap.set(nodeId, node);
  });

  // 2. Advanced Modules (8 nodes: adv-01 .. adv-08)
  advancedModulesData.forEach((adv: any) => {
    const rawId = adv.id; // 'adv-01'
    const nodeId = rawId;
    const prereqCore = (adv.prerequisites?.coreChapters || []).map((cid: string) => `ch-${cid}`);
    const prereqAdv = adv.prerequisites?.advancedModules || [];
    const allPrereqs = [...prereqCore, ...prereqAdv];

    const node: RoadmapNode = {
      id: nodeId,
      rawId,
      type: 'advanced',
      code: adv.code,
      title: adv.title,
      subtitle: adv.subtitle,
      description: adv.description,
      level: 'L3 Lanjutan',
      sectionOrPillarId: `pillar-${adv.pillar}`,
      sectionOrPillarTitle: adv.pillarName,
      estimatedHours: adv.estimatedHours || 14,
      difficulty: 'advanced',
      prerequisites: allPrereqs,
      unlocks: [],
      route: `#/advanced/${rawId}`,
      labId: adv.interactiveLab?.id || `lab-${rawId}`,
      telecomRelevance: `Mendukung pilar riset telekomunikasi cerdas dan pengolahan sinyal tingkat lanjut: ${adv.subtitle}.`,
      tier: 'Tier-2 Advanced'
    };

    nodesMap.set(nodeId, node);
  });

  // 3. Research Tracks (6 nodes: r01 .. r06)
  researchTracksData.forEach((res: any) => {
    const rawId = res.id; // 'r01'
    const nodeId = rawId;
    const prereqCore = (res.prerequisites?.coreChapters || []).map((cid: string) => `ch-${cid}`);
    const prereqAdv = res.prerequisites?.advancedModules || [];
    const allPrereqs = [...prereqCore, ...prereqAdv];

    const node: RoadmapNode = {
      id: nodeId,
      rawId,
      type: 'research',
      code: res.code,
      title: res.title,
      subtitle: res.subtitle,
      description: res.description,
      level: 'L4 Riset',
      sectionOrPillarId: `pillar-${res.pillar}`,
      sectionOrPillarTitle: res.pillarName,
      category: res.category,
      estimatedHours: 24, // Typical intensive research track
      difficulty: 'advanced',
      prerequisites: allPrereqs,
      unlocks: [],
      route: `#/research/${rawId}`,
      labId: undefined,
      telecomRelevance: `Fokus riset terapan strategis roadmap ITERA ISVWS 2026–2040: ${res.primaryBenchmark}.`,
      tier: 'Tier-3 Research'
    };

    nodesMap.set(nodeId, node);
  });

  // Build edges and populate unlocks
  nodesMap.forEach((targetNode) => {
    targetNode.prerequisites.forEach((sourceId) => {
      const sourceNode = nodesMap.get(sourceId);
      if (sourceNode) {
        if (!sourceNode.unlocks.includes(targetNode.id)) {
          sourceNode.unlocks.push(targetNode.id);
        }

        const edgeType: EdgeType = targetNode.type === 'research'
          ? 'research-pathway'
          : 'required-prerequisite';

        let justification = '';
        if (sourceNode.type === 'core' && targetNode.type === 'core') {
          justification = `${sourceNode.code} (${sourceNode.title}) merupakan prasyarat esensial yang membangun konsep dasar sebelum mempelajari ${targetNode.code} (${targetNode.title}).`;
        } else if (sourceNode.type === 'core' && targetNode.type === 'advanced') {
          justification = `${sourceNode.code} (${sourceNode.title}) menyediakan fondasi pemrosesan sinyal/citra digital yang diwajibkan untuk formalisme matematika tingkat lanjut pada ${targetNode.code} (${targetNode.title}).`;
        } else if (sourceNode.type === 'advanced' && targetNode.type === 'advanced') {
          justification = `Modul ${sourceNode.code} (${sourceNode.title}) menyediakan kerangka matematika dan formulasi optimasi yang diperlukan oleh ${targetNode.code} (${targetNode.title}).`;
        } else if (sourceNode.type === 'advanced' && targetNode.type === 'research') {
          justification = `Modul ${sourceNode.code} (${sourceNode.title}) menyediakan landasan teoritis, algoritma deterministik, dan protokol evaluasi yang mendasari benchmark riset ${targetNode.code} (${targetNode.title}).`;
        } else {
          justification = `${sourceNode.code} (${sourceNode.title}) menyediakan pemahaman fondasional untuk eksperimen dan evaluasi jalur riset ${targetNode.code} (${targetNode.title}).`;
        }

        edgesList.push({
          id: `${sourceId}->${targetNode.id}`,
          source: sourceId,
          target: targetNode.id,
          type: edgeType,
          sourceCode: sourceNode.code,
          sourceTitle: sourceNode.title,
          targetCode: targetNode.code,
          targetTitle: targetNode.title,
          academicJustification: justification
        });
      }
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: edgesList
  };
}

const { nodes: ALL_NODES, edges: ALL_EDGES } = buildRoadmapNodes();
const NODES_BY_ID = new Map<string, RoadmapNode>(ALL_NODES.map((n) => [n.id, n]));
const EDGES_BY_ID = new Map<string, RoadmapEdge>(ALL_EDGES.map((e) => [e.id, e]));

// Adjacency Maps for Fast O(1) Traversal
const FORWARD_ADJ = new Map<string, { targetId: string; edgeId: string; type: EdgeType }[]>();
const REVERSE_ADJ = new Map<string, { sourceId: string; edgeId: string; type: EdgeType }[]>();

ALL_NODES.forEach((node) => {
  FORWARD_ADJ.set(node.id, []);
  REVERSE_ADJ.set(node.id, []);
});

ALL_EDGES.forEach((edge) => {
  FORWARD_ADJ.get(edge.source)?.push({ targetId: edge.target, edgeId: edge.id, type: edge.type });
  REVERSE_ADJ.get(edge.target)?.push({ sourceId: edge.source, edgeId: edge.id, type: edge.type });
});

export function getAllRoadmapNodes(): RoadmapNode[] {
  return ALL_NODES;
}

export function getAllRoadmapEdges(): RoadmapEdge[] {
  return ALL_EDGES;
}

export function getRoadmapNodeById(id: string): RoadmapNode | undefined {
  return NODES_BY_ID.get(id);
}

export function getRoadmapEdgeById(id: string): RoadmapEdge | undefined {
  return EDGES_BY_ID.get(id);
}

// Interactive Path Traversal Engine (Phase AC-02)
export function traverseLearningPath(
  startNodeId: string,
  direction: PathDirection = 'both',
  options?: { maxDepth?: number; requiredOnly?: boolean }
): TraversalResult {
  const normId = startNodeId;
  const startNode = NODES_BY_ID.get(normId);

  if (!startNode) {
    return {
      targetNodeId: startNodeId,
      direction,
      activeNodeIds: [],
      activeEdgeIds: [],
      upstreamNodeIds: [],
      downstreamNodeIds: []
    };
  }

  const upstreamNodeSet = new Set<string>();
  const downstreamNodeSet = new Set<string>();
  const activeEdgeSet = new Set<string>();

  // 1. Upstream BFS (Prerequisites)
  if (direction === 'prerequisites' || direction === 'both') {
    const queue: { id: string; depth: number }[] = [{ id: normId, depth: 0 }];
    const visited = new Set<string>([normId]);

    while (queue.length > 0) {
      const { id: currId, depth } = queue.shift()!;
      if (options?.maxDepth !== undefined && depth >= options.maxDepth) continue;

      const incoming = REVERSE_ADJ.get(currId) || [];
      for (const edge of incoming) {
        if (options?.requiredOnly && edge.type !== 'required-prerequisite' && edge.type !== 'research-pathway') {
          continue;
        }

        activeEdgeSet.add(edge.edgeId);
        if (!visited.has(edge.sourceId)) {
          visited.add(edge.sourceId);
          upstreamNodeSet.add(edge.sourceId);
          queue.push({ id: edge.sourceId, depth: depth + 1 });
        }
      }
    }
  }

  // 2. Downstream BFS (Dependents / Unlocks)
  if (direction === 'dependents' || direction === 'both') {
    const queue: { id: string; depth: number }[] = [{ id: normId, depth: 0 }];
    const visited = new Set<string>([normId]);

    while (queue.length > 0) {
      const { id: currId, depth } = queue.shift()!;
      if (options?.maxDepth !== undefined && depth >= options.maxDepth) continue;

      const outgoing = FORWARD_ADJ.get(currId) || [];
      for (const edge of outgoing) {
        if (options?.requiredOnly && edge.type !== 'required-prerequisite' && edge.type !== 'research-pathway') {
          continue;
        }

        activeEdgeSet.add(edge.edgeId);
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          downstreamNodeSet.add(edge.targetId);
          queue.push({ id: edge.targetId, depth: depth + 1 });
        }
      }
    }
  }

  const activeNodeIds = [normId, ...Array.from(upstreamNodeSet), ...Array.from(downstreamNodeSet)];

  return {
    targetNodeId: normId,
    direction,
    activeNodeIds,
    activeEdgeIds: Array.from(activeEdgeSet),
    upstreamNodeIds: Array.from(upstreamNodeSet),
    downstreamNodeIds: Array.from(downstreamNodeSet)
  };
}

// Focus Scope: "Jalur Utama" (Main route) vs "Semua Ketergantungan" (All Dependencies) (Phase AC-02B)
export type FocusScope = 'main-path' | 'all-dependencies';

/**
 * Derives the "Jalur Utama" (Main Learning Path):
 * A compact, academically justified route prioritizing direct required prerequisites
 * and primary progression without excessive transitive branching.
 */
export function getMainLearningPath(
  startNodeId: string,
  direction: PathDirection = 'both'
): TraversalResult {
  const normId = startNodeId;
  const startNode = NODES_BY_ID.get(normId);

  if (!startNode) {
    return {
      targetNodeId: startNodeId,
      direction,
      activeNodeIds: [],
      activeEdgeIds: [],
      upstreamNodeIds: [],
      downstreamNodeIds: []
    };
  }

  const upstreamSet = new Set<string>();
  const downstreamSet = new Set<string>();

  // 1. Upstream Main Route (Prioritizes primary required prerequisites without excessive branching)
  if (direction === 'prerequisites' || direction === 'both') {
    if (startNode.type === 'research') {
      // For a Research Track:
      // Direct advanced modules + top primary core chapters
      const advPrereqs = startNode.prerequisites.filter((id) => id.startsWith('adv-'));
      const corePrereqs = startNode.prerequisites.filter((id) => id.startsWith('ch-')).slice(0, 3);

      advPrereqs.forEach((aid) => upstreamSet.add(aid));
      corePrereqs.forEach((cid) => upstreamSet.add(cid));

      // For primary advanced module, add its primary foundational core chapter (e.g. ADV-01 -> ch-02)
      advPrereqs.forEach((aid) => {
        const aNode = NODES_BY_ID.get(aid);
        if (aNode) {
          aNode.prerequisites.slice(0, 2).forEach((pid) => upstreamSet.add(pid));
        }
      });
    } else if (startNode.type === 'advanced') {
      // For an Advanced Module:
      // Direct advanced prerequisites + key foundational core chapters (prioritizing critical theoretical anchors)
      const advPrereqs = startNode.prerequisites.filter((id) => id.startsWith('adv-'));
      const corePrereqs = startNode.prerequisites.filter((id) => id.startsWith('ch-'));
      const selectedCore = corePrereqs.length > 3
        ? Array.from(new Set([corePrereqs[0], ...corePrereqs.filter((id) => id === 'ch-46' || id === 'ch-41' || id === 'ch-13')]))
        : corePrereqs;

      advPrereqs.forEach((aid) => upstreamSet.add(aid));
      selectedCore.forEach((cid) => upstreamSet.add(cid));

      // For direct advanced prerequisite, include its primary foundational chapter (e.g. adv-01 -> ch-02)
      advPrereqs.forEach((aid) => {
        const aNode = NODES_BY_ID.get(aid);
        if (aNode) {
          aNode.prerequisites.slice(0, 2).forEach((pid) => upstreamSet.add(pid));
        }
      });
    } else {
      // For a Core Chapter:
      startNode.prerequisites.slice(0, 2).forEach((pid) => upstreamSet.add(pid));
    }
  }

  // 2. Downstream Main Route
  if (direction === 'dependents' || direction === 'both') {
    if (startNode.type === 'core') {
      // Direct unlocked core or advanced (up to 2-3)
      startNode.unlocks.slice(0, 3).forEach((uid) => downstreamSet.add(uid));
    } else if (startNode.type === 'advanced') {
      // Direct research tracks it anchors (up to 2) or immediate advanced module
      const resUnlocks = startNode.unlocks.filter((id) => id.startsWith('r0')).slice(0, 2);
      const advUnlocks = startNode.unlocks.filter((id) => id.startsWith('adv-')).slice(0, 1);
      resUnlocks.forEach((rid) => downstreamSet.add(rid));
      advUnlocks.forEach((aid) => downstreamSet.add(aid));
    }
  }

  const allActiveNodeIds = [normId, ...Array.from(upstreamSet), ...Array.from(downstreamSet)];
  const nodeSet = new Set(allActiveNodeIds);

  // Active edges connecting strictly within the main path nodes
  const activeEdgeIds: string[] = [];
  ALL_EDGES.forEach((edge) => {
    if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
      activeEdgeIds.push(edge.id);
    }
  });

  return {
    targetNodeId: normId,
    direction,
    activeNodeIds: allActiveNodeIds,
    activeEdgeIds,
    upstreamNodeIds: Array.from(upstreamSet),
    downstreamNodeIds: Array.from(downstreamSet)
  };
}

/**
 * Returns either "Jalur Utama" (Main Path) or "Semua Ketergantungan" (All Dependencies)
 */
export function getFocusedLearningPath(
  startNodeId: string,
  direction: PathDirection = 'both',
  scope: FocusScope = 'main-path'
): TraversalResult {
  if (scope === 'all-dependencies') {
    return traverseLearningPath(startNodeId, direction);
  }
  return getMainLearningPath(startNodeId, direction);
}

// Compact Layered Layout Structures for Focus Mode (Phase AC-02B)
export interface CompactNodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layerIndex: number;
  isTarget: boolean;
  tier: string;
}

export interface CompactLayoutResult {
  positions: Map<string, CompactNodePosition>;
  width: number;
  height: number;
  layers: { layerIndex: number; label: string; nodeIds: string[] }[];
}

/**
 * Computes a clean, compact Left-to-Right layered DAG layout for Focus Mode.
 * Eliminates massive empty wastelands and long crossing curves.
 */
export function computeCompactLayout(
  nodeIds: string[],
  activeEdges: RoadmapEdge[],
  targetNodeId: string
): CompactLayoutResult {
  const nodeSet = new Set(nodeIds);
  const relevantEdges = activeEdges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target));

  // 1. Compute topological layer rank using longest path from source nodes
  const layerMap = new Map<string, number>();
  nodeIds.forEach((id) => layerMap.set(id, 0));

  // Relaxation for DAG topological leveling (bounded by node count)
  for (let iter = 0; iter < nodeIds.length; iter++) {
    let changed = false;
    for (const edge of relevantEdges) {
      const srcLayer = layerMap.get(edge.source) ?? 0;
      const tgtLayer = layerMap.get(edge.target) ?? 0;
      if (srcLayer + 1 > tgtLayer) {
        layerMap.set(edge.target, srcLayer + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // 2. Group nodes by layer
  const maxLayer = Math.max(0, ...Array.from(layerMap.values()));
  const layerGroups: string[][] = Array.from({ length: maxLayer + 1 }, () => []);

  nodeIds.forEach((id) => {
    const l = layerMap.get(id) ?? 0;
    layerGroups[l].push(id);
  });

  // Sort nodes within each layer by semantic tier (core before adv, adv before research) and code
  layerGroups.forEach((group) => {
    group.sort((aId, bId) => {
      const nodeA = NODES_BY_ID.get(aId);
      const nodeB = NODES_BY_ID.get(bId);
      if (!nodeA || !nodeB) return 0;
      const typeRank = { core: 1, advanced: 2, research: 3 };
      const diff = (typeRank[nodeA.type] || 0) - (typeRank[nodeB.type] || 0);
      if (diff !== 0) return diff;
      return nodeA.code.localeCompare(nodeB.code);
    });
  });

  // Filter out empty layers if any
  const nonEmptyLayers = layerGroups
    .map((nodes, idx) => ({ layerIndex: idx, nodes }))
    .filter((g) => g.nodes.length > 0);

  const numLayers = Math.max(1, nonEmptyLayers.length);
  const nodeW = 200;
  const nodeH = 72;
  const gapY = 24;

  // Find max nodes in any single layer to dimension height
  const maxNodesInLayer = Math.max(1, ...nonEmptyLayers.map((l) => l.nodes.length));

  // Sizing: Canvas dimensions fit within viewport bounds while guaranteeing safe margins for all columns
  const canvasW = Math.max(980, Math.min(1400, (numLayers - 1) * 280 + nodeW + 160));
  const canvasH = Math.max(540, maxNodesInLayer * (nodeH + gapY) + 140);

  // Exact column spacing with safe margins:
  // Left margin = 60px, Right margin = 60px.
  // Last column right edge: colX + nodeW = canvasW - 60 (zero clipping at canvas boundary)
  const leftMargin = 60;
  const rightMargin = 60;
  const availableSpan = canvasW - leftMargin - rightMargin - nodeW;
  const colSpacing = numLayers > 1 ? availableSpan / (numLayers - 1) : 0;
  const positions = new Map<string, CompactNodePosition>();

  const layersWithLabels = nonEmptyLayers.map((layerObj, visualIdx) => {
    const colX = numLayers === 1 ? (canvasW - nodeW) / 2 : leftMargin + visualIdx * colSpacing;
    const m = layerObj.nodes.length;
    const totalColH = m * nodeH + (m - 1) * gapY;
    const startY = Math.max(60, (canvasH - totalColH) / 2);

    layerObj.nodes.forEach((nodeId, nodeIdx) => {
      const node = NODES_BY_ID.get(nodeId);
      const y = startY + nodeIdx * (nodeH + gapY);
      positions.set(nodeId, {
        id: nodeId,
        x: colX,
        y,
        width: nodeW,
        height: nodeH,
        layerIndex: visualIdx,
        isTarget: nodeId === targetNodeId,
        tier: node?.tier || 'Tier'
      });
    });

    // Semantic label for column header
    let label = `Tahap ${visualIdx + 1}`;
    const containsTarget = layerObj.nodes.includes(targetNodeId);
    if (containsTarget) {
      label = '🎯 Modul Terpilih';
    } else if (visualIdx === 0) {
      label = '📚 Fondasi & Prasyarat';
    } else if (visualIdx === numLayers - 1) {
      label = '🚀 Pengayaan / Riset Hilir';
    } else {
      label = '🔗 Modul Penghubung';
    }

    return {
      layerIndex: visualIdx,
      label,
      nodeIds: layerObj.nodes
    };
  });

  return {
    positions,
    width: canvasW,
    height: canvasH,
    layers: layersWithLabels
  };
}

export interface FocusEdgeRoutingResult {
  d: string;
  hasCollision: boolean;
  routingMode: 'direct' | 'bypass-upper' | 'bypass-lower';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Computes an obstacle-aware, anti-overlapping SVG path for Focus Mode DAG edges.
 * - Anchors strictly to source card right border and target card left border.
 * - Detects collisions with intermediate node cards.
 * - Routes multi-stage hops around obstacles via upper or lower clear bypass lanes.
 */
export function computeFocusEdgePath(
  srcPos: CompactNodePosition,
  tgtPos: CompactNodePosition,
  allPositions: Map<string, CompactNodePosition>,
  _canvasW: number,
  canvasH: number,
  edgeIndex: number = 0
): FocusEdgeRoutingResult {
  const x1 = srcPos.x + srcPos.width;
  const y1 = srcPos.y + srcPos.height / 2;
  // Position arrowhead endpoint at target left boundary with 2px clearance for marker
  const x2 = tgtPos.x - 2;
  const y2 = tgtPos.y + tgtPos.height / 2;
  const dx = x2 - x1;

  // 1. Adjacent layers: no intermediate columns between layer i and layer i+1
  const isAdjacent = tgtPos.layerIndex === srcPos.layerIndex + 1;

  // 2. Multi-hop: identify any intermediate nodes situated between src and tgt
  const intermediateNodes: CompactNodePosition[] = [];
  allPositions.forEach((pos) => {
    if (pos.id !== srcPos.id && pos.id !== tgtPos.id) {
      if (pos.layerIndex > srcPos.layerIndex && pos.layerIndex < tgtPos.layerIndex) {
        intermediateNodes.push(pos);
      }
    }
  });

  // Check collision: does direct line/curve intersect any intermediate obstacle?
  let hasCollision = false;
  if (!isAdjacent && intermediateNodes.length > 0) {
    for (const obs of intermediateNodes) {
      const midObsX = obs.x + obs.width / 2;
      const t = (midObsX - x1) / Math.max(1, dx);
      const approxY = y1 + t * (y2 - y1);
      // Bounding box with safety margin (including card body)
      if (approxY >= obs.y - 12 && approxY <= obs.y + obs.height + 12) {
        hasCollision = true;
        break;
      }
    }
  }

  // If adjacent and no obstacles, use smooth S-curve through the clear vertical channel
  if (isAdjacent || (!hasCollision && intermediateNodes.length === 0)) {
    const d =
      dx > 0
        ? `M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1}, ${x2 - dx * 0.45} ${y2}, ${x2} ${y2}`
        : `M ${x1} ${y1} L ${x2} ${y2}`;
    return { d, hasCollision: false, routingMode: 'direct', x1, y1, x2, y2 };
  }

  // Collision detected or multi-stage hop!
  // Route around obstacles via dedicated upper or lower bypass lane
  const midY = (y1 + y2) / 2;
  const preferUpper = midY <= canvasH / 2;

  let yBypass: number;
  let routingMode: 'bypass-upper' | 'bypass-lower';
  const laneOffset = (edgeIndex % 4) * 10;

  if (preferUpper) {
    const minObstacleY = Math.min(...intermediateNodes.map((n) => n.y), srcPos.y, tgtPos.y);
    yBypass = Math.max(42, minObstacleY - 26 - laneOffset);
    routingMode = 'bypass-upper';
  } else {
    const maxObstacleBottom = Math.max(...intermediateNodes.map((n) => n.y + n.height), srcPos.y + srcPos.height, tgtPos.y + tgtPos.height);
    yBypass = Math.min(canvasH - 42, maxObstacleBottom + 26 + laneOffset);
    routingMode = 'bypass-lower';
  }

  // Construct smoothly filleted bypass path:
  // Exits horizontally from source card, curves toward bypass lane, runs horizontally past obstacles, curves into target
  const exitX = Math.min(x1 + 32, x1 + dx * 0.25);
  const entryX = Math.max(x2 - 32, x2 - dx * 0.25);

  const d = `M ${x1} ${y1} C ${exitX} ${y1}, ${exitX} ${yBypass}, ${exitX + 16} ${yBypass} L ${entryX - 16} ${yBypass} C ${entryX} ${yBypass}, ${entryX} ${y2}, ${x2} ${y2}`;

  return { d, hasCollision: true, routingMode, x1, y1, x2, y2 };
}

// "Jalur Menuju Riset" Resolution
export function getResearchPath(trackId: string): ResearchPathway | null {
  const normId = trackId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const trackNode = ALL_NODES.find(
    (n) => n.type === 'research' && (n.id === normId || n.rawId === normId || n.code.toLowerCase() === normId)
  );

  if (!trackNode) return null;

  const visitedNodeIds = new Set<string>();
  const activeEdgeIds = new Set<string>();
  const queue: string[] = [trackNode.id];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    if (visitedNodeIds.has(currId)) continue;
    visitedNodeIds.add(currId);

    const currNode = NODES_BY_ID.get(currId);
    if (!currNode) continue;

    currNode.prerequisites.forEach((prereqId) => {
      activeEdgeIds.add(`${prereqId}->${currId}`);
      if (!visitedNodeIds.has(prereqId)) {
        queue.push(prereqId);
      }
    });
  }

  const allVisited = Array.from(visitedNodeIds);
  const primaryAdv = allVisited.filter((id) => id.startsWith('adv-'));
  const keyCore = allVisited.filter((id) => id.startsWith('ch-'));

  return {
    trackId: trackNode.id,
    trackCode: trackNode.code,
    trackTitle: trackNode.title,
    category: trackNode.category || 'Research Track',
    description: trackNode.description,
    primaryAdvancedModules: primaryAdv,
    keyCoreChapters: keyCore,
    allNodeIds: allVisited,
    allEdgeIds: Array.from(activeEdgeIds)
  };
}

export const RESEARCH_TRACK_OPTIONS = [
  { id: 'r01', code: 'R01', title: 'Intelligent Visual Detection & Recognition', category: 'Primary Academic Anchor' },
  { id: 'r02', code: 'R02', title: 'Robust Multi-Object Tracking & Motion Perception', category: 'Primary Academic Anchor' },
  { id: 'r03', code: 'R03', title: 'Robust Visual Perception in Adverse Environments', category: 'Primary Academic Anchor' },
  { id: 'r04', code: 'R04', title: 'Vision-Centric Multimodal Perception', category: 'Strategic Extension' },
  { id: 'r05', code: 'R05', title: 'Efficient Computer Vision & Edge AI Systems', category: 'Strategic Extension' },
  { id: 'r06', code: 'R06', title: 'Spatial Intelligence & 3D Vision', category: 'Optional Specialization' }
];

export const ROADMAP_SUMMARY = {
  totalNodes: ALL_NODES.length, // 74
  coreCount: ALL_NODES.filter((n) => n.type === 'core').length, // 60
  advancedCount: ALL_NODES.filter((n) => n.type === 'advanced').length, // 8
  researchCount: ALL_NODES.filter((n) => n.type === 'research').length, // 6
  totalEdges: ALL_EDGES.length
};
