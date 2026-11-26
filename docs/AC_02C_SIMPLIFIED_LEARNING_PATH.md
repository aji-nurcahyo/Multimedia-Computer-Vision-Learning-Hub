# ANTIGRAVITY ACADEMIC SPECIFICATION — PHASE AC-02C
## Simplified Learning Roadmap Focus Mode & Structured Staged Pathway

**Project:** Multimedia & Computer Vision Learning Hub (*From Digital Media to Intelligent Visual & Audio Systems*)  
**Institution:** Institut Teknologi Sumatera (ITERA)  
**Curriculum Architect:** Aji Pamungkas Tri Nurcahyo  
**Academic Context:** S1 Teknik Telekomunikasi & Strategic Roadmap ISVWS 2026–2040  
**Status:** IMPLEMENTED & VERIFIED  
**Git Policy:** STRICT LOCAL WORKING COPY · NO COMMIT · NO PUSH · NO DEPLOY  

---

## 1. BACKGROUND & PROBLEM STATEMENT

In Phase AC-02B, an isolated Focus Mode was introduced with an SVG-based compact directed acyclic graph (DAG). While mathematically robust and passing automated layout invariants, real-world user interaction identified significant cognitive fatigue and visual defects:

1. **Overlapping Connection Lines:** Many upstream prerequisites converging on deeper nodes (such as R04 or ADV-04) generated crisscrossing Bézier curves that crossed over adjacent cards.
2. **Right-Boundary Clipping:** On high-tier research tracks, long titles were truncated with ellipses (`…`) or cards approached the canvas boundary ($x > 1200\text{px}$), causing horizontal clipping.
3. **Unused Vertical Space:** Static SVG coordinate calculation created awkward voids between levels.
4. **Cognitive Overload:** Students found it difficult to parse the chronological sequence of courses required to master a chosen specialization.

---

## 2. THE NEW DESIGN: STRUCTURED STAGED PATHWAY (HTML/CSS)

Phase AC-02C replaces the tangled SVG Bézier graph inside Focus Mode with a clean, semantic HTML/CSS **Structured Learning Path View** (`.roadmap-focus-staged-view`).

### A. The 4-Stage Progressive Pipeline

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐     ┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│             TAHAP 1             │     │             TAHAP 2             │     │             TAHAP 3             │     │             TAHAP 4             │
│    Fondasi & Prasyarat Utama    │ ──➔ │    Persiapan Tingkat Lanjut     │ ──➔ │       Destinasi Terpilih        │ ──➔ │   Langkah Lanjutan & Prospek    │
│    (Core Chapters L1–L2)        │     │     (Advanced Modules L3)       │     │     (Target Hero Card)          │     │     (Research Tracks L4)        │
└─────────────────────────────────┘     └─────────────────────────────────┘     └─────────────────────────────────┘     └─────────────────────────────────┘
```

1. **Stage 1 — Fondasi & Prasyarat Utama (Core Foundations):**
   - Contains all Core chapters (`type === 'core'`) that form foundational prerequisites for the destination.
   - Grouped cleanly by academic sections (e.g. *Deep Learning for Computer Vision*, *Linear Algebra & Matrix Fundamentals*).
   - Each card features:
     - Canonical Code badge (`Bab 41`, `Bab 46`, etc.).
     - Requirement tag: `[WAJIB]` (direct prerequisite) vs `[FONDASI]` (transitive requirement).
     - Full chapter title, duration, difficulty, and direct link (`Buka Materi`).
     - Click-to-focus interactivity: clicking any card smoothly refocuses the roadmap on that chapter.

2. **Stage 2 — Persiapan Tingkat Lanjut (Advanced Preparation):**
   - Displays advanced modules (`type === 'advanced'`) needed before taking on the destination.
   - Includes full title, subtitle, learning hours, and pillar affiliation.
   - If no intermediate L3 module is required (e.g. for foundational topics), a clean semantic card informs: *"Jalur Langsung dari Fondasi (Tanpa modul L3 perantara)"*.

3. **Stage 3 — Destinasi Pembelajaran Terpilih (Target Hero Card — Zero Clipping):**
   - Prominently styled hero container with primary border and luminous glow.
   - **Zero Clipping:** Responsive auto-wrapping ensures full titles (such as *R04: Vision-Centric Multimodal Perception*) are 100% visible without truncation.
   - Rich academic attributes: Total Learning Hours, Difficulty Tier, Academic Category.
   - **ITERA Telecom Alignment Box:** Radio icon with explicit justification of how this topic fulfills the ITERA ISVWS 2026–2040 mandate.
   - Prominent action buttons: `Buka Materi Lengkap` and `Buka Laboratorium Interaktif` (when lab is registered).

4. **Stage 4 — Langkah Lanjutan & Prospek Riset (Possible Next Steps):**
   - Displays downstream courses and research tracks unlocked by the target.
   - When viewing terminal research tracks (e.g. R04), renders the **Capaian Puncak Kurikulum** milestone:
     - Guidance towards international publication (IEEE/Springer).
     - Capstone project directives.
     - Telecommunication industry innovation pathways.

### B. Clean Directional Flow Indicators
- Replaced dozens of arbitrary diagonal Bézier curves with single, elegant directional stage connectors (`──➔`).
- On desktop viewports, stages flow left-to-right across columns.
- On mobile and tablet viewports ($< 1024\text{px}$), stages reflow into a clean vertical sequence with downward arrows (`↓`), preventing horizontal overflow.

### C. Mode & Scope Switcher
In the Focus Mode banner, users retain full control:
- **Tampilan Tahapan Terstruktur:** Active by default, delivering the clean 4-stage view.
- **Diagram Graf (DAG):** Secondary toggle that renders the compact SVG DAG for users who wish to inspect topological graph coordinates.
- **Jalur Utama vs Semua Ketergantungan:** Switch between critical essential prerequisites and the complete transitive closure.
- **Prasyarat / Lanjutan / Keduanya:** Flexible direction filtering.
- **Kembali ke Semua Jalur:** Instant one-click escape to the full 74-node curriculum graph.

---

## 3. VERIFIED CASE STUDIES

### Case 1: Destination R04 (Vision-Centric Multimodal Perception)
- **Stage 1 (Core):** Bab 41, Bab 44, Bab 51, Bab 52, Bab 42, Bab 45.
- **Stage 2 (Advanced):** ADV-04 (Vision Transformers) & ADV-07 (Multi-Sensor Calibration).
- **Stage 3 (Destination):** Hero card with complete, unclipped title, 24 Jam Belajar, L4 Riset, and RefCOCO/ImageNet-1K zero-shot grounding relevance.
- **Stage 4 (Next Steps):** Terminal Track Capstone milestone.

### Case 2: Destination ADV-04 (Vision Transformers & Self-Attention)
- **Stage 1 (Core):** Bab 41 (CNN Foundations), Bab 46 (Attention), Bab 02 (Linear Algebra), Bab 05.
- **Stage 2 (Advanced):** ADV-01 (Mathematical Foundations).
- **Stage 3 (Destination):** ADV-04 Hero Card with Deformable Attention & Bipartite Matching details.
- **Stage 4 (Next Steps):** Unlocks Research Tracks R01 & R04.

---

## 4. BROWSER VERIFICATION & SCREENSHOT EVIDENCE

| Screenshot Artifact | Resolution | Subject | Result |
| :--- | :---: | :--- | :--- |
| `docs/screenshots/roadmap-overview.png` | 1440x900 | Full 74-node curriculum graph | PASS · Stable coordinates, tier background zones |
| `docs/screenshots/roadmap-focus-r04-desktop.png` | 1440x900 | Focus Mode for R04 (Desktop) | PASS · Zero clipping, clear 4-stage pipeline |
| `docs/screenshots/roadmap-focus-r04-mobile.png` | 768x1024 | Focus Mode for R04 (Tablet/Mobile) | PASS · Responsive vertical reflow, zero overflow |
| `docs/screenshots/roadmap-focus-adv04-desktop.png` | 1440x900 | Focus Mode for ADV-04 | PASS · Core -> ADV-01 -> ADV-04 -> R01/R04 |
| `docs/screenshots/roadmap-focus-r01-desktop.png` | 1440x900 | Focus Mode for R01 | PASS · Compact linear edge-vision pathway |
| `docs/screenshots/roadmap-focus-ch41-desktop.png` | 1440x900 | Focus Mode for Bab 41 | PASS · Foundational hub unlocking advanced tiers |
