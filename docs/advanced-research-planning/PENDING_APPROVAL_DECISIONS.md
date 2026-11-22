# ARCHITECTURAL & CURRICULAR APPROVAL DECISIONS (APPROVED)
## Decision Log & Stakeholder Review for Advanced Curriculum & Research Learning Paths
**Document Version:** 1.1.0  
**Phase:** AD-05 Architecture Planning / AD-06 Execution  
**Status:** **APPROVED BY PROJECT OWNER (2026-11-19)** — See [`APPROVED_ARCHITECTURE.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/docs/advanced-research-planning/APPROVED_ARCHITECTURE.md)

---

## 1. Purpose & Governance

Before committing computational resources, modifying source code, or authoring lessons for the **Advanced Curriculum** and **Research Learning Paths**, the architectural choices outlined during Phase AD-05 require explicit review and authorization by the project lead / user.

This document compiles the **seven primary decision gates**. Each decision presents:
- The context and recommendation.
- Alternative options considered.
- The downstream impact on curriculum complexity, hosting requirements, and development effort.

---

## 2. Decision Log

### Decision Gate 1: Candidate Advanced Curriculum Modules (ADV-01 – ADV-08)
- **Proposed Architecture:** Author 8 specialized Advanced Modules (L3 Advanced Depth):
  1. `ADV-01`: Mathematical Foundations for Advanced Computer Vision
  2. `ADV-02`: Advanced DIP & Mathematical Inverse Problems
  3. `ADV-03`: Robust Visual Tracking & Multi-Object Tracking Systems
  4. `ADV-04`: Advanced Deep Visual Recognition & Attention Mechanisms
  5. `ADV-05`: Multi-View Geometry & 3D Computer Vision
  6. `ADV-06`: Robust Visual Perception in Adverse Conditions
  7. `ADV-07`: Vision Foundation Models & Parameter-Efficient Adaptation
  8. `ADV-08`: Efficient Computer Vision & Edge AI Architecture
- **Options for Approval:**
  - **Option A (Recommended):** Approve all 8 modules, developed across phased releases (Phases AD-07, AD-08, AD-09).
  - **Option B (Core Minimalist):** Approve only 4 high-priority foundational modules (`ADV-01`, `ADV-03`, `ADV-04`, `ADV-06`) to focus strictly on detection, tracking, and adverse sensing.
  - **Option C (Custom Selection):** User specifies custom inclusion/exclusion of candidate modules.

---

### Decision Gate 2: Candidate Research Tracks Structure (R01 – R06)
- **Proposed Architecture:** Establish 6 Research Tracks divided by strategic priority:
  - *Primary Academic Anchors (Pillars 1 & 2):* `R01` (Visual Detection), `R02` (Robust Tracking), `R03` (Adverse Environments Perception).
  - *Strategic Extensions (Pillars 3 & 4):* `R04` (Multimodal Perception), `R05` (Efficient Edge AI).
  - *Optional Specialization:* `R06` (Spatial Intelligence & 3D Vision).
- **Options for Approval:**
  - **Option A (Recommended):** Approve the full 6-track architecture with primary focus on R01–R03 and secondary focus on R04–R06.
  - **Option B (Sumatera Regional Focus Only):** Approve only R01, R02, and R03 to align 100% of research output with tropical sensing and surveillance priorities at ITERA.

---

### Decision Gate 3: Web UI Integration & Routing Model
- **Proposed Architecture:** Introduce two new top-level routes and navigation links in the header:
  - `/advanced` $\rightarrow$ Interactive DAG Explorer, module catalog, and theory playgrounds.
  - `/research` $\rightarrow$ Research track guidebooks, benchmark telemetry viewer, and ablation dashboards.
  - Leaves `/chapters` (01–60) and `/tracks` completely untouched.
- **Options for Approval:**
  - **Option A (Recommended):** Top-level navigation items `/advanced` and `/research`. Clean separation between undergraduate core and graduate research.
  - **Option B (Unified Track Explorer):** Merge Advanced Modules and Research Tracks into the existing `/tracks` page as specialized "L3/L4 Advanced Tracks" without adding new top-level header tabs.

---

### Decision Gate 4: Interactive Client-Side Lab Technology (Tier A)
- **Proposed Architecture:** Use lightweight HTML5 2D Canvas and SVG for 2D/state simulations (e.g. tracking arena, SVD ellipsoids, optimization contours) and lightweight WebGL/Shaders for 3D epipolar geometry.
- **Options for Approval:**
  - **Option A (Recommended):** Canvas 2D + SVG + Lightweight WebGL. 100% cross-browser compatibility, runs on any mobile/low-end device without WebGPU hardware dependencies.
  - **Option B (Advanced WebGPU):** Require WebGPU for client-side tensor inference (ONNX Runtime Web). Higher performance on modern laptops, but breaks on older browsers or machines without WebGPU support.

---

### Decision Gate 5: Benchmark Telemetry & Experiment Hosting Strategy (Tier B & C)
- **Proposed Architecture:**
  - Store pre-computed evaluation telemetry (JSON metrics, PR curve coordinates, confusion matrices) directly within the static repository (`src/data/telemetry/`).
  - Host heavy raw datasets (COCO, MOT17, ImageNet-C) externally via canonical public repositories (Academic official mirrors, HuggingFace Datasets, Google Drive). Computational notebooks (Tier C) download slices on-demand in Google Colab.
- **Options for Approval:**
  - **Option A (Recommended):** Pre-computed JSON telemetry in repo + external dataset streaming via Colab. Zero repository bloat, zero server costs.
  - **Option B (Self-Hosted S3/GCS Bucket):** Set up dedicated cloud object storage bucket for dataset mirrors. Requires cloud account credentials and operational egress costs.

---

### Decision Gate 6: Multi-Seed Statistical Validation Standard ($N \ge 3$)
- **Proposed Architecture:** Enforce that all published research notebook templates report mean $\pm$ standard deviation across $N \ge 3$ seeds for all primary metrics.
- **Options for Approval:**
  - **Option A (Recommended):** Strictly enforce $N \ge 3$ seeds for research track baseline publications to uphold top-tier conference standards (CVPR/ICCV).
  - **Option B (Relaxed Single-Seed):** Allow single-seed evaluation in notebooks to reduce compute time for undergraduate students with limited Colab free-tier quotas.

---

### Decision Gate 7: Implementation Sprint Cadence
- **Proposed Architecture:** Execute future implementation across 7 distinct phases (AD-06 through AD-12) to allow progressive testing and regression auditing.
- **Options for Approval:**
  - **Option A (Recommended):** Staged 7-phase implementation (AD-06 through AD-12).
  - **Option B (Consolidated Sprints):** Consolidate into 3 larger phases (Infrastructure + All Advanced Modules + All Research Tracks).

---

## 3. Next Steps Following User Approval

Upon user selection and approval of these decision gates:
1. Lock decisions into `docs/advanced-research-planning/APPROVED_ARCHITECTURE.md`.
2. Transition to **Phase AD-06: Web Infrastructure, Navigation & Metadata Integration**.
3. Implement schemas and routes with continuous regression testing against the 60 Core chapters.

