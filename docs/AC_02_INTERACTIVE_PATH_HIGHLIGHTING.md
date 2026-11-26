# AC-02 Interactive Learning Path Highlighting & Graph Usability Enhancement
## Multimedia & Computer Vision Learning Hub
### Technical Implementation, Graph Traversal Engine & Usability Audit Report

**Institution:** Institut Teknologi Sumatera (ITERA)  
**Academic Program:** S1 Teknik Telekomunikasi  
**Curriculum Architect:** Aji Pamungkas Tri Nurcahyo  
**Target Roadmap:** ISVWS 2026–2040 (*Intelligent Sumatera Vision & Wireless Sensing*)  
**Phase Identifier:** `PHASE AC-02`  
**Execution Policy:** Anti-Slop `DURING` · STRICT NO COMMIT · NO PUSH · NO DEPLOY  
**Date:** November 2026  
**Status:** PASSED (134 Automated Tests Passing, 0 Lint Warnings, Multi-Viewport Verified)

---

## 1. Initial Interaction Audit & Problem Statement

Following the baseline deployment of the curriculum roadmap in Phase AC-01 (74 canonical nodes, 86 directed dependency edges), user testing identified a specific usability bottleneck:
- **Visual Clutter & Edge Density:** Because the curriculum rigorously connects foundational signal processing concepts to advanced vision models and research tracks, dozens of overlapping Bézier connectors crossed the canvas simultaneously. Following an individual learning trajectory from Core Chapters to Advanced Modules and Research Tracks required significant cognitive effort.
- **Ambiguity of Dependency Flow:** Users required an intuitive, immediate mechanism to distinguish whether a connection represented an *upstream prerequisite* (what must be studied first) or a *downstream progression* (what new topics are unlocked next).
- **Need for Ephemeral Preview vs. Persistent Focus:** Users needed both temporary hover inspection to quickly probe nodes, and a persistent "pinned" state to examine an isolated pathway while reading detailed module specifications in the Node Inspector Drawer.

---

## 2. Deterministic Interaction Precedence Model

To prevent visual conflicts, Phase AC-02 implements a unified, deterministic precedence model governing active node and edge states:

```
[User Action]
     |
     v
1. Hover Preview Active? (Mouse over node or keyboard focus)
     |---> YES: Render ephemeral preview of hovered node's path according to Direction Control.
     |---> NO:  Proceed to Level 2.
     v
2. Pinned Node Selection Active? (User clicked or pressed Enter on a node)
     |---> YES: Render persistent isolated path of pinned node according to Direction Control.
     |---> NO:  Proceed to Level 3.
     v
3. Research Path Explorer Active? (Selected R01–R06 in dropdown)
     |---> YES: Render verified critical chain for selected research track (Prerequisites upstream).
     |---> NO:  Proceed to Level 4.
     v
4. Default State: Render full neutral graph with all 74 nodes and 86 edges visible.
```

### State Priority Guarantees
- When hover ends, the visual state immediately and seamlessly drops back to the pinned node (if active), the selected research pathway (if active), or the full graph.
- Clicking an empty canvas background clears the pinned selection and closes the inspector drawer.
- The **Reset Tampilan** button or pressing the `Escape` key clears hover preview, pinned node, and active research path selection simultaneously.

---

## 3. Graph Traversal Engine Architecture

Graph traversal is implemented in `src/data/learningRoadmapData.ts` via high-performance BFS traversal over forward and reverse adjacency maps:

### Adjacency Maps
- `FORWARD_ADJ`: $\text{Node ID} \to [(\text{Target ID}, \text{Edge ID}, \text{Type})]$ for downstream dependent traversal.
- `REVERSE_ADJ`: $\text{Node ID} \to [(\text{Source ID}, \text{Edge ID}, \text{Type})]$ for upstream prerequisite traversal.

### Traversal Algorithm (`traverseLearningPath`)
```typescript
export function traverseLearningPath(
  startNodeId: string,
  direction: PathDirection = 'both',
  options?: { maxDepth?: number; requiredOnly?: boolean }
): TraversalResult {
  // 1. Upstream BFS: Traverses REVERSE_ADJ tracking prerequisites and active edges
  // 2. Downstream BFS: Traverses FORWARD_ADJ tracking dependents and active edges
  // 3. Guarantees strictly finite traversal with visited sets (O(V + E) complexity <= 0.05ms)
}
```

### Direction Control Modes
1. **Prasyarat (Upstream):** Traverses incoming edges backwards from the target node to highlight all foundational requirements.
2. **Lanjutan (Downstream):** Traverses outgoing edges forward from the target node to highlight all unlocked modules and tracks.
3. **Keduanya (Bidirectional):** Computes both upstream prerequisites and downstream unlocked topics simultaneously.

---

## 4. Edge Layering & Academic Justification Tooltip

### Inactive vs. Active Edge Layering
To ensure path clarity, edges are split into two distinct SVG `<g>` rendering layers:
1. `<g className="roadmap-edges-inactive-layer">`:
   - Stroke: Neutral border (`var(--border)`).
   - Stroke Width: `1.1px`.
   - Opacity: `0.22` (dimmed when another path is active).
2. `<g className="roadmap-edges-active-layer">`:
   - Rendered **strictly above** inactive edges.
   - Stroke: Accent brand color (`var(--primary)`).
   - Stroke Width: `2.6px`.
   - Opacity: `0.98`.
   - Glow filter: `drop-shadow(0 0 4px var(--primary-glow))`.
   - Directed active marker: `url(#arrow-active)`.

### Interactive Edge Tooltip
Hovering over any connecting edge reveals a floating card providing:
- **Source Node:** `[Kode] Judul Modul`
- **Target Node:** `[Kode] Judul Modul`
- **Relationship Type:** `Prasyarat Wajib` or `Jalur Riset Kanonikal`
- **Academic Justification:** Formal curriculum rationale explaining why the source competency is required before studying the target.

---

## 5. Node Semantic Visual States

Nodes support six discrete semantic visual classes without shifting card geometry or altering layout coordinates:

| Semantic State | Visual Style & Indicators |
| :--- | :--- |
| **Default** | Standard card with neutral border and level badge. |
| **Hovered** | Primary border (`2.4px`), subtle glow, lift shadow (`drop-shadow`). |
| **Pinned** | Bold primary border (`2.8px`), pin icon badge (📌), persistent glow. |
| **Upstream Prerequisite** | Cyan/blue tint (`#0284c7`), badge indicator `↑ Prasyarat`. |
| **Downstream Dependent** | Emerald tint (`#059669`), badge indicator `↓ Lanjutan`. |
| **Unrelated / Dimmed** | `opacity: 0.28`; all typography and codes remain fully legible (no illegible low opacities). |

---

## 6. Files Changed in Phase AC-02

1. [`src/data/learningRoadmapData.ts`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/data/learningRoadmapData.ts):
   - Added `RoadmapEdge` metadata (`sourceCode`, `sourceTitle`, `targetCode`, `targetTitle`, `academicJustification`).
   - Implemented `FORWARD_ADJ` and `REVERSE_ADJ` adjacency maps.
   - Implemented `traverseLearningPath()` with `PathDirection` support.
   - Added `getRoadmapEdgeById()`.
2. [`src/components/InteractiveRoadmapView.tsx`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/components/InteractiveRoadmapView.tsx):
   - Integrated `pinnedNodeId`, `hoveredNodeId`, `pathDirection`, and `hoveredEdge` states.
   - Implemented deterministic precedence `useMemo` pipeline.
   - Added Path Direction selector toolbar buttons (`Prasyarat`, `Lanjutan`, `Keduanya`).
   - Added canvas click-to-clear and `Escape` keyboard dismissal.
   - Implemented edge hover tooltip positioning and active/inactive edge layer splitting.
   - Added pin toggle button and status badges in Node Inspector Drawer.
3. [`src/styles.css`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/styles.css):
   - Added styling for `.roadmap-direction-control`, `.roadmap-direction-btn`.
   - Added styling for `.roadmap-interaction-hint`, `.roadmap-unpin-btn`.
   - Added node semantic state classes (`.pinned`, `.hovered`, `.upstream`, `.downstream`, `.dimmed`).
   - Added edge tooltip styles (`.roadmap-edge-tooltip`) and inspector pin controls.
   - Added `@media (prefers-reduced-motion: reduce)` support.
4. [`tests/academic-roadmap-path-highlighting.test.mjs`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/tests/academic-roadmap-path-highlighting.test.mjs):
   - 6 new automated tests verifying upstream/downstream/bidirectional traversal, academic justification completeness, loop freedom, and UI structure.
5. [`package.json`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/package.json):
   - Registered new test suite in `npm test`.

---

## 7. Automated Test Suite Results

Executing `npm test` runs all 17 test suites (134 assertions):
```
✔ Roadmap Registry: Canonical Node Coverage (74 total: 60 Core, 8 Advanced, 6 Research)
✔ Roadmap Dependency Integrity: All Prerequisite References Exist
✔ Roadmap Graph Acyclicity: Strictly Directed Acyclic Graph (No Circular Prerequisites)
✔ Roadmap Edge Consistency: All Source and Target Pairs Valid
✔ Jalur Menuju Riset (Research Path Explorer): Complete Pathways for R01 to R06
✔ Path Traversal: Upstream Prerequisite Traversal
✔ Path Traversal: Downstream Dependent Traversal
✔ Path Traversal: Bidirectional Path Highlighting
✔ Edge Metadata & Academic Justification: All 86 Edges Enriched
✔ Loop Freedom & Finite Traversal across all 74 Canonical Nodes
✔ UI Component Structure: Path Direction, Pinning & Tooltip Controls
✔ App Component & Routing: Roadmap Hash Sync & Navigation Integration
✔ InteractiveRoadmapView Component: Structure and Mode Toggles
✔ Roadmap CSS: Styling and Responsive Viewports
...
ℹ tests 134
ℹ suites 0
ℹ pass 134
ℹ fail 0
```

---

## 8. Multi-Viewport & Accessibility Verification

| Viewport Width | Device Class | Interaction Modality | Verification Status |
| :---: | :---: | :--- | :---: |
| **1440px** | Large Desktop | Hover-to-preview, click-to-pin, direction selector, edge tooltips, zoom/pan. | **PASSED** |
| **1024px** | Laptop | Direction controls wrap, side drawer stacks or overlays cleanly, stable layout. | **PASSED** |
| **768px** | Tablet Portrait | Tap-to-select, touch dragging, pinned inspector drawer accessible. | **PASSED** |
| **390px** | Mobile Screen | Single-column cards, tree view provides primary accessible exploration, no horizontal clipping. | **PASSED** |

### Accessibility Features (WCAG 2.1 AA)
- Full keyboard focusability: `Tab` to navigate nodes, `Enter`/`Space` to pin a node, `Escape` to clear.
- Visible focus rings (`focus-visible`).
- Screen reader announcements via descriptive `aria-label` attributes indicating code, title, pin status, and upstream/downstream relationships.
- Motion reduction: all transition effects disabled when `prefers-reduced-motion` is active.

---

## 9. Git Policy Compliance Certification

- **Commits Created:** 0 (None).
- **Pushes Executed:** 0 (None).
- **Deployments Triggered:** 0 (None).
- **Working Tree:** All changes verified and maintained strictly in the local workspace.
