# AC-02D Technical Documentation: Roadmap SVG Edge Routing & Node Layering Hotfix

**Project:** Multimedia & Computer Vision Learning Hub (*From Digital Media to Intelligent Visual & Audio Systems*)  
**Institution:** Institut Teknologi Sumatera (ITERA)  
**Curriculum Architect:** Aji Pamungkas Tri Nurcahyo  
**Academic Alignment:** S1 Teknik Telekomunikasi & Strategic Roadmap ISVWS 2026–2040  
**Phase:** AC-02D — Roadmap SVG Edge Routing & Node Layering Hotfix  
**Status:** COMPLETE & VERIFIED  
**Git Policy:** STRICT LOCAL WORKING COPY · NO COMMIT · NO PUSH · NO DEPLOY  

---

## 1. Executive Summary & Problem Diagnosis

During testing of the Interactive Roadmap DAG (Phase AC-02B and AC-02C), inspection of the **Diagram Graf** view revealed visual degradation that impeded scientific readability:

1. **Connecting Lines Obscuring Node Card Text:** In previous builds, long-range dependency connectors cut directly across intermediate node cards. Due to semi-transparent CSS card fills (`rgba(2, 132, 199, 0.08)` on upstream nodes), background connectors bled directly through cards and sliced across titles and badges.
2. **Improper Edge Anchoring:** Connecting paths used single cubic Bézier curves anchored to arbitrary internal positions or bounding box centers rather than exact outer card perimeter borders.
3. **Right-Boundary Canvas Clipping:** In multi-stage paths (such as Research Track R01 and R04), terminal destination cards extended beyond the SVG `viewBox` right boundary by approximately 110 pixels due to layout width arithmetic omitting the node card width from available horizontal span calculations.
4. **DOM Stacking Flaws:** Edge and node groups were rendered without strict separation in some sub-views, causing lines to paint over card borders.

Phase AC-02D delivers a targeted, surgical hotfix to the SVG DAG renderer without altering curriculum data or disturbing the simplified "Tahapan Terstruktur" default view.

---

## 2. Architectural Root Causes & Solutions

| Issue | Root Cause | AC-02D Architectural Fix |
| :--- | :--- | :--- |
| **Line Bleed-Through** | `.roadmap-svg-node.upstream .roadmap-node-rect` had `fill: rgba(..., 0.08)` (92% transparent). | Replaced with opaque `fill: var(--bg-card)` on all card rectangles, supplemented by a dedicated `<rect className="roadmap-node-bg-rect" />` base layer. |
| **Text Slicing** | Single Bézier curves spanned from column $0$ to column $2/3$, passing directly across column $1$ cards. | Implemented collision-aware multi-segment edge routing (`computeFocusEdgePath`) that detects intermediate obstacles and routes lines via upper or lower bypass corridors. |
| **Card Boundary Anchors** | Inconsistent connection points caused arrows to pierce into card interiors. | Strict perimeter border anchors: Source right border $(x_{\text{src}} + W_{\text{node}}, y_{\text{src}} + H/2)$ to Target left border $(x_{\text{tgt}} - 2, y_{\text{tgt}} + H/2)$. |
| **Right-Boundary Clipping** | Column spacing formula `colSpacing = (canvasW - 160) / (numLayers - 1)` placed column $N-1$ at `canvasW - 90`. Adding card width (200px) pushed the right border to `canvasW + 110px`. | Revised margin arithmetic: `availableSpan = canvasW - leftMargin - rightMargin - nodeW`, ensuring terminal column $N-1$ right edge terminates exactly at `canvasW - 60px`. |
| **DOM Stacking Order** | SVG painter's algorithm renders later elements atop earlier ones. | Enforced DOM hierarchy: `<g className="roadmap-edges-layer">` strictly precedes `<g className="roadmap-nodes-layer">` in both Focus Mode SVG and Overview SVG. |

---

## 3. SVG DOM Layering Hierarchy

Under the SVG 1.1/2.0 specification, rendering order is strictly dictated by document tree order (the painter's algorithm). Phase AC-02D guarantees that edge elements are rendered prior to node elements:

```xml
<!-- SVG Rendering Hierarchy (InteractiveRoadmapView.tsx) -->
<svg className="roadmap-focus-svg" viewBox={`0 0 ${compactLayout.canvasW} ${compactLayout.canvasH}`}>
  <defs>
    <!-- Arrowhead markers with precise refX/refY geometry -->
    <marker id="arrow-focus" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--primary)" />
    </marker>
  </defs>

  <!-- 1. Background grid and stage columns -->
  <g className="roadmap-stage-zones"> ... </g>

  <!-- 2. Dedicated Edges Layer (Rendered strictly BELOW nodes) -->
  <g className="roadmap-focus-edges-layer" style={{ pointerEvents: 'stroke' }}>
    {focusEdges.map((edge) => (
      <path key={edge.id} d={edge.pathD} className="roadmap-svg-edge active" />
    ))}
  </g>

  <!-- 3. Dedicated Nodes Layer (Rendered strictly ABOVE edges) -->
  <g className="roadmap-focus-nodes-layer" style={{ pointerEvents: 'auto' }}>
    {focusNodes.map((node) => (
      <g key={node.id} className="roadmap-svg-node" transform={`translate(${node.x}, ${node.y})`}>
        <!-- Base opaque rectangle preventing background line bleed-through -->
        <rect width={node.width} height={node.height} rx="8" className="roadmap-node-bg-rect" fill="var(--bg-card)" />
        <!-- Interactive styled card rectangle -->
        <rect width={node.width} height={node.height} rx="8" className="roadmap-node-rect" />
        <!-- Node card content: badges, titles, descriptions -->
        ...
      </g>
    ))}
  </g>
</svg>
```

---

## 4. Edge Routing Engine & Collision Avoidance Algorithm

### 4.1 Boundary Anchor Equations

For horizontal DAG layout (Focus Mode), connections originate strictly on the source card's right boundary and terminate on the target card's left boundary:

$$\begin{aligned}
x_1 &= x_{\text{src}} + W_{\text{node}} \\
y_1 &= y_{\text{src}} + \frac{H_{\text{node}}}{2} \\
x_2 &= x_{\text{tgt}} - 2 \\
y_2 &= y_{\text{tgt}} + \frac{H_{\text{node}}}{2}
\end{aligned}$$

### 4.2 Intermediate Obstacle Detection

For any edge connecting source column $C_{\text{src}}$ and target column $C_{\text{tgt}}$, when $\Delta C = C_{\text{tgt}} - C_{\text{src}} > 1$, intermediate topological layers exist. The algorithm queries all nodes situated within the intermediate bounding corridor:

$$\mathcal{B}_{\text{obstacle}} = \left\{ n \in \mathcal{V} \mid x_1 + 10 \le x_n \le x_2 - 10 \;\land\; \min(y_1, y_2) - 40 \le y_n + \frac{H}{2} \le \max(y_1, y_2) + 40 \right\}$$

### 4.3 Bypass Corridor Routing

When $\mathcal{B}_{\text{obstacle}} \ne \emptyset$, direct Bézier interpolation would intersect cards. The path router instead constructs a 3-segment routing trajectory $(M \to C \to L \to C)$ using dedicated bypass lanes:

1. **Corridor Selection:** If $\min(y_1, y_2) \le \frac{\text{canvasH}}{2}$, the upper bypass corridor ($y_{\text{bypass}} = 40 + (\text{index} \bmod 3) \times 14$) is selected. Otherwise, the lower bypass corridor ($y_{\text{bypass}} = \text{canvasH} - 40 - (\text{index} \bmod 3) \times 14$) is selected.
2. **Launch Arc:** A cubic Bézier curve launches from $(x_1, y_1)$ to horizontal inflection point $(x_1 + 40, y_{\text{bypass}})$.
3. **Linear Transit:** A horizontal line segment bridges across the intermediate layers to $(x_2 - 40, y_{\text{bypass}})$.
4. **Approach Arc:** A terminal cubic Bézier curve descends or ascends into $(x_2, y_2)$, aligning the tangent with the target left boundary marker.

$$\text{SVG Path: } M \; x_1 \; y_1 \; C \; (x_1 + 25) \; y_1, \; (x_1 + 15) \; y_{\text{bypass}}, \; (x_1 + 40) \; y_{\text{bypass}} \; L \; (x_2 - 40) \; y_{\text{bypass}} \; C \; (x_2 - 15) \; y_{\text{bypass}}, \; (x_2 - 25) \; y_2, \; x_2 \; y_2$$

---

## 5. Right-Boundary Canvas Sizing Proof

Let $\text{canvasW}$ be the SVG layout width, $L_0$ be the first column coordinate, and $K$ be the number of topological layers.

To ensure the final layer $K-1$ right edge does not exceed $\text{canvasW} - \text{margin}_{\text{right}}$:

$$\begin{aligned}
\text{margin}_{\text{left}} &= 60\text{ px} \\
\text{margin}_{\text{right}} &= 60\text{ px} \\
W_{\text{node}} &= 200\text{ px} \\
\text{availableSpan} &= \text{canvasW} - \text{margin}_{\text{left}} - \text{margin}_{\text{right}} - W_{\text{node}} \\
\text{colSpacing} &= \frac{\text{availableSpan}}{K - 1} \\
x_{\text{col}}(k) &= \text{margin}_{\text{left}} + k \cdot \text{colSpacing}
\end{aligned}$$

At the final column $k = K - 1$:

$$x_{\text{col}}(K - 1) = \text{margin}_{\text{left}} + (K - 1) \cdot \frac{\text{availableSpan}}{K - 1} = \text{margin}_{\text{left}} + \text{availableSpan} = \text{canvasW} - \text{margin}_{\text{right}} - W_{\text{node}}$$

Adding the node card width $W_{\text{node}}$:

$$\text{Right Edge} = x_{\text{col}}(K - 1) + W_{\text{node}} = \text{canvasW} - \text{margin}_{\text{right}} = \text{canvasW} - 60\text{ px}$$

Because $\text{canvasW} - 60\text{ px} < \text{canvasW}$, clipping is mathematically impossible for any layer count $K \ge 1$.

---

## 6. Verification & Automated Test Suite

A dedicated automated test suite (`tests/academic-roadmap-edge-routing.test.mjs`) validates all architectural invariants across 6 distinct unit tests:

1. **`AC-02D Canonical Graph Invariant: Exactly 74 Nodes and 204 Edges`**: Asserts 100% preservation of curriculum dataset without omission or duplication.
2. **`AC-02D SVG Layering & Group Hierarchy: Nodes strictly above Edges`**: Confirms via AST inspection that `.roadmap-edges-layer` strictly precedes `.roadmap-nodes-layer` in both Focus Mode and Overview SVG trees, and verifies `<rect className="roadmap-node-bg-rect" />` base rects.
3. **`AC-02D Edge Anchors: Strict Right-to-Left Boundary Connections`**: Verifies across multiple research tracks that $x_1 = x_{\text{src}} + W_{\text{node}}$ and $x_2 = x_{\text{tgt}} - 2$.
4. **`AC-02D Collision Avoidance & Multi-Stage Bypass Routing`**: Asserts that multi-hop connectors spanning across intermediate layers route above or below intermediate card rectangles.
5. **`AC-02D Zero Card Clipping: All Nodes strictly within ViewBox Boundaries`**: Verifies that $\max(x_n + W_{\text{node}}) \le \text{canvasW} - 50\text{ px}$ across all canonical tracks.
6. **`AC-02D CSS Verification: Card Opacity & Layer Styling`**: Verifies that `.roadmap-node-bg-rect` has `fill: var(--bg-card)` and node rect styles eliminate transparent fills.

### Test Suite Execution Result:
```
✔ AC-02D Canonical Graph Invariant: Exactly 74 Nodes and 204 Edges (0.77ms)
✔ AC-02D SVG Layering & Group Hierarchy: Nodes strictly above Edges (1.31ms)
✔ AC-02D Edge Anchors: Strict Right-to-Left Boundary Connections (10.01ms)
✔ AC-02D Collision Avoidance & Multi-Stage Bypass Routing (0.46ms)
✔ AC-02D Zero Card Clipping: All Nodes strictly within ViewBox Boundaries (1.20ms)
✔ AC-02D CSS Verification: Card Opacity & Layer Styling (0.80ms)

Total Repository Unit Tests: 164 passing / 0 failing (100% PASS)
```

---

## 7. Visual Evidence & Screenshot Gallery

Headless browser verification was executed against the production build preview server at $1440 \times 900$ resolution. All visual evidence is persisted in `docs/screenshots/`:

| Artifact | Node / Track | Visual Verification Criteria | Result |
| :--- | :--- | :--- | :--- |
| `roadmap-diagram-graf-r01.png` | R01 (Intelligent Visual Detection) | Multi-hop edges from Bab 02/42 bypass Layer 1 cards via upper lane; cards opaque; zero text obscurity. | **PASS** |
| `roadmap-diagram-graf-r04.png` | R04 (Multimodal Perception) | Zero right-boundary clipping on terminal R04 card; 60px padding preserved; clean bypass routing. | **PASS** |
| `roadmap-diagram-graf-adv04.png` | ADV-04 (Deep Visual Recognition) | Bidirectional fan-out; Layer 0 to Layer 2 bypasses intermediate cards; clean right-to-left border anchors. | **PASS** |
| `roadmap-diagram-graf-ch41.png` | Chapter 41 (Deep Learning Foundations) | Core Chapter focus; prerequisite and dependent fan-out cleanly aligned. | **PASS** |

---

## 8. Compliance & Policy Confirmation

- **Git Policy:** Strictly observed. Working copy modified in place; NO git commit, NO git push, NO git deploy executed.
- **Anti-Slop Policy:** Observed throughout. Zero generic decorative wrappers; mathematical routing strictly grounded in SVG coordinate geometry.
- **Academic Rigor:** All 74 canonical curriculum nodes, 60 Core chapters, 8 Advanced modules, and 6 Research tracks remain fully aligned with ITERA S1 Teknik Telekomunikasi & ISVWS 2026–2040.
