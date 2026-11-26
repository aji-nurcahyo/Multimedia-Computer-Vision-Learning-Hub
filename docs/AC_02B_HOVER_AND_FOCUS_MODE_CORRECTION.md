# PHASE AC-02B: DUAL-MODE LEARNING ROADMAP INTERACTION
## Hover Highlight Preview & Dedicated Compact Focus Mode
### Multimedia & Computer Vision Learning Hub
### Institut Teknologi Sumatera (ITERA) · S1 Teknik Telekomunikasi & ISVWS 2026–2040

---

## 1. Executive Summary & Problem Analysis

In Phase AC-02A, an initial attempt at path isolation hid unrelated nodes during hover while retaining their original global grid coordinates. While technically functional, user testing revealed two major UX defects:

1. **Empty Wastelands & Crossing Lines:** Hiding unrelated nodes on the fixed 2400×900px canvas left vast empty expanses between remaining nodes, connected by long, confusingly diagonal bezier curves that crossed empty space.
2. **Cognitive Overload from Full Transitive Closures:** The full mathematical transitive dependency closure for deep advanced modules (such as `ADV-04`) traversed 20+ ancestors across disparate foundational chapters, overwhelming the reader instead of presenting a digestible, linear learning route.
3. **Inspector Distraction on Hover:** Automatically triggering the full 360px node inspector drawer during casual cursor movement obstructed the viewport and degraded graph exploration.

**Phase AC-02B resolves these challenges by decoupling Hover and Click into two distinct, purposeful interaction paradigms:**

- **Hover (Visual Preview Only):** Keeps all 74 nodes and 86 edges in their canonical positions. Dims unrelated elements (opacity 0.22 for nodes, 0.08 for edges) while vividly illuminating the hovered node and its active pathways. Does **not** recalculate layout, does **not** remove nodes from the DOM, and does **not** open the inspector.
- **Click (Dedicated Compact Focus Mode):** Transitions into an exclusive, focused study canvas. Re-computes a dedicated, compact Left-to-Right layered DAG layout (`computeCompactLayout`) with zero empty space. Provides a prominent `"Kembali ke Semua Jalur"` button, an academic scope toggle (**Jalur Utama** vs **Semua Ketergantungan**), and a non-intrusive compact bottom inspector.

---

## 2. Interaction Design & Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CANVAS MODES                                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [OVERVIEW MODE]                                                                  |
|   ├── All 74 nodes & 86 edges rendered at canonical coordinates                   |
|   ├── Hover on Node:                                                              |
|   │     ├── Path nodes & edges: Opacity 1.0 + glow filter                         |
|   │     ├── Unrelated nodes: Opacity 0.22                                         |
|   │     ├── Unrelated edges: Opacity 0.08                                         |
|   │     └── NO layout recalculation, NO DOM removal, NO inspector popup           |
|   └── Mouse Leave: Instant restoration to full opacity                            |
|                                                                                   |
|  [FOCUS MODE] (Activated by Node Click / Enter)                                   |
|   ├── Dedicated Top Focus Banner:                                                 |
|   │     ├── [← Kembali ke Semua Jalur]                                            |
|   │     ├── Active Node Badge (e.g., ADV-04 · Vision Transformers)                |
|   │     ├── Scope Toggle: [Jalur Utama (Ringkas)] | [Semua Ketergantungan]        |
|   │     └── Direction Toggle: [Prasyarat] | [Lanjutan] | [Keduanya]               |
|   ├── Dedicated Compact SVG Layout:                                               |
|   │     ├── Topological Left-to-Right Stages:                                     |
|   │     │     Col 1: 📚 Fondasi & Prasyarat (Core Foundations)                    |
|   │     │     Col 2: 🎯 Modul Terpilih (Target Node)                              |
|   │     │     Col 3: 🚀 Pengayaan / Riset Hilir (Downstream Tracks)               |
|   │     ├── Zero empty wastelands (Canvas: 980–1400px × 540–720px)                |
|   │     └── Clean horizontal cubic Bézier curves                                  |
|   └── Compact Bottom Inspector:                                                   |
|         ├── Default Collapsed: Title, category, duration, "Buka Detail Akademik"  |
|         └── Expanded: Full syllabus, telecom relevance, lab links, prerequisites  |
|                                                                                   |
|  [RETURN TO OVERVIEW]                                                             |
|   ├── Click "Kembali ke Semua Jalur" button                                       |
|   ├── Press Escape key                                                            |
|   └── Click empty background canvas space                                         |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Algorithmic Implementation

### 3.1 Academic Main Path Selection (`getMainLearningPath`)

To prevent cognitive overload, `getMainLearningPath` selects the primary pedagogical backbone rather than a flood of tangential dependencies:

- **For Advanced Modules (Tier-2):**
  1. Direct advanced prerequisites (e.g., `ADV-01` for `ADV-04`).
  2. Foundational core chapter anchors (e.g., `Ch 41 CNN`, `Ch 46 Attention/ViT`, `Ch 02 Linear Algebra`).
  3. Immediate research unlocks (e.g., `R01 Visual Detection`, `R04 3D Vision`).
  4. Keeps total node count strictly $\le 10$ nodes for instant comprehension.

- **For Research Tracks (Tier-3):**
  1. Primary supporting advanced modules (up to 2).
  2. Foundational core chapter anchors.
  3. Total path size strictly bounded ($\le 12$ nodes).

### 3.2 Compact Layered Layout Engine (`computeCompactLayout`)

The compact layout computes topological ranks via longest-path relaxation:

1. **Topological Leveling:** Nodes are assigned layer indices $0, 1, \dots, L$ based on DAG precedence.
2. **Stage Semantic Labeling:**
   - Layer 0: `📚 Fondasi & Prasyarat`
   - Intermediate Layers: `⚡ Penguatan Konsep`
   - Target Layer: `🎯 Modul Terpilih`
   - Post-Target Layers: `🚀 Pengayaan / Riset Hilir`
3. **Viewport Optimization:** Canvas width is tightly bound ($W \in [980, 1400]\text{ px}$, $H \in [540, 720]\text{ px}$), ensuring the entire learning pathway fits comfortably without panning or scroll fatigue.
4. **Horizontal S-Curve Routing:** Smooth cubic Bézier curves $C(x_1 + dx, y_1, x_2 - dx, y_2, x_2, y_2)$ maintain visual hierarchy without crossing unnecessary nodes.

---

## 4. Verification & Testing

The AC-02B implementation is verified by the automated test suite `tests/academic-roadmap-focus-mode.test.mjs`:

| Test Case | Description | Result |
| :--- | :--- | :---: |
| `AC-02B Path Distinction (ADV-04)` | Validates that `getMainLearningPath` includes critical anchors (`Ch 41`, `Ch 46`, `ADV-01`, `Ch 02`) while remaining more compact than the full transitive closure ($\le 10$ nodes) | PASSED |
| `AC-02B Path Distinction (R01 & Ch 41)` | Confirms linear-to-shallow-branch compactness for Research Tracks and Core Chapters | PASSED |
| `AC-02B Compact Layout Engine` | Verifies topological ordering ($x_{\text{prereq}} < x_{\text{target}} < x_{\text{downstream}}$), canvas bounds, and node positioning | PASSED |
| `AC-02B Component Structure` | Confirms separation of `focusedNodeId` vs `hoveredNodeId`, focus banner controls, and compact inspector | PASSED |
| `AC-02B CSS Verification` | Asserts presence and styling of `.roadmap-focus-banner`, `.roadmap-btn-back`, `.roadmap-scope-control`, and `.roadmap-compact-inspector` | PASSED |

### Repository-Wide Status

- **Automated Test Suites:** 19 test files, 146 tests, **100% passing**.
- **TypeScript Typecheck:** 0 errors.
- **Production Build:** Success in 4.18s.
- **Academic KaTeX Linter:** 436 files audited, 4,983 formulas checked, **0 findings (0 errors, 0 warnings)**.
