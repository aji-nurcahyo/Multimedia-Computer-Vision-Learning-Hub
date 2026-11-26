# PHASE AC-02A: EXCLUSIVE LEARNING PATH ISOLATION SPECIFICATION
## Multimedia & Computer Vision Learning Hub
### Institut Teknologi Sumatera (ITERA) · S1 Teknik Telekomunikasi & ISVWS 2026–2040

---

## 1. Executive Summary

Phase AC-02A resolves the visual density issue in the interactive curriculum roadmap (`InteractiveRoadmapView.tsx`) by replacing semi-transparent opacity dimming with **Exclusive Learning Path Isolation**:

- **Previous Behavior (AC-02):** Hovering over a node highlighted the active pathway, but unrelated nodes and 200+ edges remained visible at 28% opacity, resulting in visual clutter.
- **Enhanced Behavior (AC-02A):** Hovering over any node temporarily isolates and renders **ONLY** that node and its traversed learning pathway (upstream prerequisites, downstream dependents, or both). All unrelated nodes and edges are **completely removed from the SVG DOM**.
- **Restoration Invariant:** When mouse hover ends, the full curriculum graph (74 nodes and all canonical edges) is immediately and automatically restored.
- **Pinning Interaction:** Clicking any node (or pressing Enter/Space) pins that isolated pathway until explicitly dismissed.
- **Accessible & Frictionless Dismissal:**
  1. A prominent `"Tampilkan Semua"` button appears in the floating hint bar.
  2. Clicking the `"Lepas Pin"` button in the hint bar unpins the selection.
  3. Clicking any empty background canvas space unpins and restores the full graph.
  4. Pressing the `Escape` key immediately dismisses hover preview or pinned isolation.

---

## 2. Technical Architecture & Invariants

### 2.1 State-Driven Isolation Pipeline

The graph layout rendering pipeline evaluates isolation deterministically via `activeSelection`:

```typescript
// 1. Isolation Active Flag
const isIsolationActive = activeSelection.source !== 'none';

// 2. Visible Nodes Set (Strict DOM Filtering)
const visibleNodes = useMemo(() => {
  if (!isIsolationActive) return allNodes;
  return allNodes.filter((node) => activeSelection.activeNodeIds.has(node.id));
}, [allNodes, isIsolationActive, activeSelection.activeNodeIds]);

// 3. Edge Filtering (Zero Background Edges During Isolation)
const { inactiveEdges, activeEdges } = useMemo(() => {
  if (!isIsolationActive) {
    return { inactiveEdges: allEdges, activeEdges: [] };
  }

  const active: RoadmapEdge[] = [];
  allEdges.forEach((edge) => {
    if (activeSelection.activeEdgeIds.has(edge.id)) {
      active.push(edge);
    }
  });

  return { inactiveEdges: [], activeEdges: active };
}, [allEdges, isIsolationActive, activeSelection.activeEdgeIds]);
```

### 2.2 Stable Coordinate Invariant (Zero Node Jump)

In `InteractiveRoadmapView.tsx`, physical coordinates are precomputed once via `nodePositions`:
- Research tier (L4): fixed $y = 60\text{ px}$.
- Advanced tier (L3): fixed $y = 260\text{ px}$.
- Core tier (L1–L2): fixed grid $y \in [440, 768]\text{ px}$ across 12 section columns.

When `visibleNodes` is filtered, each node references its pre-existing entry in `nodePositions.get(node.id)`. Remaining nodes remain strictly locked to their exact $(x, y)$ coordinates without any shifting, re-centering, or jumping.

### 2.3 Keyboard & Screen Reader Accessibility Invariant

Because non-path nodes are filtered out of `visibleNodes`, their SVG `<g tabIndex={0}>` DOM elements are not rendered during active isolation. As a result:
- The `Tab` key strictly traverses only through the nodes of the isolated pathway.
- Screen readers encounter zero inactive or irrelevant curriculum nodes.
- When isolation is dismissed, all 74 nodes are re-introduced into the tab sequence.

---

## 3. Verification & Test Suite Summary

The dedicated test suite `tests/academic-roadmap-exclusive-isolation.test.mjs` verifies:

| Test Assertion | Requirement Verified | Status |
| :--- | :--- | :---: |
| `AC-02A Baseline` | Verifies 74 canonical nodes & enriched edge network | PASSED |
| `AC-02A Upstream Isolation` | Verifies `ADV-04` isolates only prerequisites (`Ch 41`, `Ch 46`, `ADV-01`, `Ch 02`, `Ch 05`) and strictly excludes audio/video/other tracks | PASSED |
| `AC-02A Downstream Isolation` | Verifies `Ch 41` isolates downstream unlocks and strictly excludes unrelated audio nodes | PASSED |
| `AC-02A Bidirectional Isolation` | Verifies `ADV-01` isolates exact upstream and downstream set, excluding non-path nodes | PASSED |
| `AC-02A Stable Coordinates` | Invariant proof that $(x,y)$ coordinates do not change between full and isolated modes | PASSED |
| `AC-02A Component Audit` | Confirms DOM omission, hint bar badge, and `"Tampilkan Semua"` button | PASSED |
| `AC-02A CSS Audit` | Validates `.active-isolation`, `.roadmap-isolation-status`, `.roadmap-show-all-btn` | PASSED |

Total project automated test suites: **18 suites**, **141 tests**, **100% passing**.
TypeScript typecheck: **0 errors**.
Production build: **Clean bundle generation (4.76s)**.
Academic notation linter: **0 errors, 0 warnings across 436 files and 4983 formulas**.
