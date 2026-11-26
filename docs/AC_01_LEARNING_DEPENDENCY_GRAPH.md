# AC-01 Learning Dependency Graph Specification
## Multimedia & Computer Vision Learning Hub
### Directed Acyclic Graph (DAG) & "Jalur Menuju Riset" Architecture

**Institution:** Institut Teknologi Sumatera (ITERA)  
**Curriculum Architect:** Aji Pamungkas Tri Nurcahyo  
**Target Route:** `#/roadmap`  
**Registry Implementation:** `src/data/learningRoadmapData.ts`  
**Component Implementation:** `src/components/InteractiveRoadmapView.tsx`  

---

## 1. Graph Topology Overview

The Learning Dependency Graph models the complete academic progression of the platform as a strictly **Directed Acyclic Graph (DAG)**. It maps the dependencies and unlocking mechanics across three canonical learning tiers:

```
+-----------------------------------------------------------------------------------+
|                         TIER 3: RESEARCH TRACKS (L4)                              |
|   [R01 Detection] [R02 Tracking] [R03 Adverse] [R04 Multimodal] [R05 Edge] [R06 3D] |
+-----------------------------------------^-----------------------------------------+
                                          | (Research Pathways)
+-----------------------------------------+-----------------------------------------+
|                        TIER 2: ADVANCED MODULES (L3)                              |
|   [ADV-01 Math] [ADV-02 Inverse] [ADV-03 Tracking] [ADV-04 Transformers]          |
|   [ADV-05 Geometry] [ADV-06 Degraded] [ADV-07 Foundation] [ADV-08 Edge AI]        |
+-----------------------------------------^-----------------------------------------+
                                          | (Required Prerequisite Edges)
+-----------------------------------------+-----------------------------------------+
|                        TIER 1: CORE CURRICULUM (L1–L2)                            |
|   12 Thematic Sections (Bab 01 to Bab 60)                                         |
|   Signals -> Image -> Frequency -> Audio -> Video -> Vision -> Multimodal -> Edge |
+-----------------------------------------------------------------------------------+
```

### Graph Invariants & Quantitative Properties
- **Total Canonical Nodes:** 74 nodes
  - **Tier 1 (Core Chapters):** 60 nodes (`ch-01` to `ch-60`)
  - **Tier 2 (Advanced Modules):** 8 nodes (`adv-01` to `adv-08`)
  - **Tier 3 (Research Tracks):** 6 nodes (`r01` to `r06`)
- **Total Active Edges:** >85 directed edges
- **Graph Invariant 1 (Strict Acyclicity):** Topological sort verifies zero circular dependencies ($\mathcal{O}(V + E)$ cycle check passes in automated test suite).
- **Graph Invariant 2 (Connected Pathways):** Every L4 Research Track connects back to at least one L3 Advanced Module and at least three foundational L1–L2 Core Chapters.
- **Graph Invariant 3 (Referential Integrity):** All declared prerequisites in JSON registries exist as valid nodes.

---

## 2. Node Schema & Properties

Every node in the graph is typed according to the `RoadmapNode` interface in `src/data/learningRoadmapData.ts`:

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `ch-01`, `adv-01`, `r01`). |
| `rawId` | `string` | Raw identifier matching source directories (e.g. `01`, `adv-01`, `r01`). |
| `type` | `'core' \| 'advanced' \| 'research'` | Learning tier classification. |
| `code` | `string` | Human-readable canonical label (e.g. `Bab 01`, `ADV-01`, `R01`). |
| `title` | `string` | Formal academic title. |
| `subtitle` | `string` | Secondary descriptive title or mathematical focus. |
| `description` | `string` | Concise conceptual summary. |
| `level` | `RoadmapLevel` | Academic depth (`L1 Dasar`, `L2 Menengah`, `L3 Lanjutan`, `L4 Riset`). |
| `sectionOrPillarId` | `string` | Parent section ID (`sec-01`..`sec-12`) or pillar ID (`pillar-1`..`pillar-4`). |
| `sectionOrPillarTitle` | `string` | Human-readable section or pillar name. |
| `estimatedHours` | `number` | Estimated study and laboratory duration in hours. |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | Content complexity tier. |
| `prerequisites` | `string[]` | Array of direct prerequisite node IDs. |
| `unlocks` | `string[]` | Array of downstream node IDs unlocked by this node. |
| `route` | `string` | Deep-link hash URL (e.g. `#/chapter/01`, `#/advanced/adv-01`, `#/research/r01`). |
| `labId` | `string?` | Optional linked interactive laboratory ID (e.g. `ch01`, `lab-adv-01`). |
| `telecomRelevance` | `string` | Explicit telecommunications engineering and ISVWS 2026–2040 context. |
| `tier` | `string` | Display tier (`Tier-1 Core`, `Tier-2 Advanced`, `Tier-3 Research`). |

---

## 3. "Jalur Menuju Riset" (Research Path Explorer) Pathways

The **"Jalur Menuju Riset"** feature computes the transitive closure of prerequisite dependencies for each of the 6 Research Tracks. When a user selects a research track, the system computes the exact critical path back to foundational knowledge.

### Pathway R01: Intelligent Visual Detection & Recognition
- **Research Anchor:** MS COCO 2017 detection split, deformable attention, multi-scale feature pyramids.
- **Required Advanced Modules:**
  - `ADV-01`: Mathematical Foundations (Matrix calculus, SVD, Lie groups, non-convex optimization).
  - `ADV-04`: Deep Learning for Vision & Transformers (Multi-head attention, deformable attention, DETR Hungarian matcher).
- **Core Prerequisite Chapters:**
  - `Bab 41` (CNN Foundations & Tensor Convolutions)
  - `Bab 42` (Backpropagation, Optimization & Regularization)
  - `Bab 44` (Object Detection Foundations, IoU & Anchor Boxes)
  - `Bab 46` (Vision Transformers & Multi-Head Self-Attention)
  - `Bab 48` (Advanced Object Detection, Feature Pyramids & YOLO)
  - *Transitive Foundations:* `Bab 02` (Sampling/Quantization), `Bab 05` (NumPy Arrays), `Bab 06` (Pixel Coordinates), `Bab 36` (Camera Models), `Bab 38` (Feature Descriptors).

### Pathway R02: Robust Multi-Object Tracking & Motion Perception
- **Research Anchor:** MOT17/MOT20 benchmarks, HOTA metric evaluation, trajectory continuity.
- **Required Advanced Modules:**
  - `ADV-01`: Mathematical Foundations (Multivariate Gaussians, Mahalanobis distance).
  - `ADV-03`: Probabilistic Multi-Object Tracking & Motion Dynamics (Kalman filtering, Hungarian / Jonker-Volgenant LSAP bipartite matching).
- **Core Prerequisite Chapters:**
  - `Bab 36` (Pinhole Camera Geometry)
  - `Bab 37` (Geometric Perspective Transformations)
  - `Bab 40` (Classical Tracking & Optical Flow)
  - `Bab 46` (Vision Transformers)
  - `Bab 50` (Deep Multi-Object Tracking & DeepSORT)
  - *Transitive Foundations:* `Bab 30` (Motion Estimation), `Bab 31` (Background Subtraction), `Bab 32` (Kalman Filtering), `Bab 33` (Data Association), `Bab 44` (Detection).

### Pathway R03: Robust Visual Perception in Adverse Environments
- **Research Anchor:** RESIDE and Dark Zurich benchmarks, atmospheric scattering, tropical monsoon rain-streak removal, safety-critical Out-of-Distribution calibration.
- **Required Advanced Modules:**
  - `ADV-01`: Mathematical Foundations.
  - `ADV-02`: Variational Inverse Problems, Total Variation Regularization & ADMM.
  - `ADV-06`: Visual Restoration in Adverse Weather & Expected Calibration Error (ECE).
  - *Transitive Advanced:* `ADV-04` (Transformers & Feature Aggregation).
- **Core Prerequisite Chapters:**
  - `Bab 11` (2D Frequency Filtering & FFT)
  - `Bab 13` (Edge Detection & Gradient Operators)
  - `Bab 15` (Image Segmentation & Morphometry)
  - `Bab 17` (Acoustic & Wave Sensing Signals)
  - `Bab 43` (Deep Learning Regularization & Normalization)
  - `Bab 46` (Vision Transformers)
  - *Transitive Foundations:* `Bab 08` (Histogram & CLAHE), `Bab 10` (Spatial Convolution), `Bab 12` (Image Denoising & Bilateral/NLM), `Bab 14` (Morphological Operations), `Bab 41` (CNNs), `Bab 44` (Object Detection), `Bab 50` (Tracking).

### Pathway R04: Vision-Centric Multimodal Perception
- **Research Anchor:** ImageNet zero-shot transfer, RefCOCO visual grounding, audio-visual spatial localization.
- **Required Advanced Modules:**
  - `ADV-04`: Deep Learning & Transformers.
  - `ADV-07`: Multimodal Representation Learning & Vision-Language Models (CLIP, InfoNCE, LoRA parameter-efficient adaptation).
  - *Transitive Advanced:* `ADV-01` (Matrix calculus).
- **Core Prerequisite Chapters:**
  - `Bab 44` (Object Detection & Bounding Box Coordinates)
  - `Bab 51` (Multimodal AI Foundations & Taxonomy)
  - `Bab 52` (Vision-Language Models & Contrastive Learning)
  - `Bab 53` (Cross-Attention & Multimodal Fusion Architectures)
  - `Bab 54` (Multimodal Embeddings, Cosine Geometry & Cross-Modal Retrieval)
  - `Bab 55` (Embodied Vision-Centric Agents & Spatial Audio-Visual Reasoning).

### Pathway R05: Efficient Computer Vision & Edge AI Systems
- **Research Anchor:** MLPerf Tiny Vision, Edge Pareto Frontier (mAP vs FPS vs MB), sub-5W embedded inference.
- **Required Advanced Modules:**
  - `ADV-04`: Deep Learning & Attention Architectures.
  - `ADV-08`: Edge AI Optimization, Quantization Arithmetic & Embedded Deployment (Uniform affine scale/zero-point quantization, QAT, structured channel pruning, Roofline memory bandwidth model).
- **Core Prerequisite Chapters:**
  - `Bab 41` (CNN Layers & Parameter Counts)
  - `Bab 43` (Normalization & Regularization)
  - `Bab 45` (YOLO Architecture & Inference Latency)
  - `Bab 56` (Real-Time Vision Pipelines & Queue Latency)
  - `Bab 57` (Edge AI Deployment, ONNX Runtime & TensorRT)
  - `Bab 58` (Web Multimedia APIs & Client-Side Acceleration)
  - `Bab 59` (System Profiling, Amdahl's Law & Bottleneck Isolation)
  - `Bab 60` (Integrated Multi-Sensor Capstone System).

### Pathway R06: Spatial Intelligence & 3D Vision
- **Research Anchor:** KITTI Odometry, monocular depth estimation, bundle adjustment, neural radiance fields.
- **Required Advanced Modules:**
  - `ADV-01`: Mathematical Foundations (Lie groups $\mathrm{SO}(3)/\mathrm{SE}(3)$, Rodrigues formula).
  - `ADV-05`: Multiple View Geometry & Spatial 3D Vision (Pinhole projection, epipolar geometry, Sampson distance, DLT linear triangulation, Levenberg-Marquardt bundle adjustment).
- **Core Prerequisite Chapters:**
  - `Bab 21` (Spatial Audio & 3D Wave Propagation)
  - `Bab 22` (Spatial Coordinate Transformations)
  - `Bab 25` (Sensor Fusion & Calibration)
  - `Bab 36` (Pinhole Camera Geometry & Intrinsic Matrix $\mathbf{K}$)
  - `Bab 40` (Lucas-Kanade Optical Flow & Motion Tracking)
  - `Bab 50` (3D Trajectory Estimation & Multi-Camera Re-ID)
  - *Transitive Foundations:* `Bab 01` (Taxonomy), `Bab 11` (Frequency Analysis), `Bab 02` (Sampling), `Bab 05` (NumPy), `Bab 06` (Pixel Coordinates), `Bab 38` (Descriptors).

---

## 4. UI/UX Interaction Modes

The roadmap is rendered in `src/components/InteractiveRoadmapView.tsx` with two dedicated viewing modes:

1. **Grafik Visual (Interactive SVG DAG):**
   - Three horizontal visual zones: Research (Top), Advanced (Middle), Core (Bottom).
   - Smooth cubic Bézier connector paths with directional arrowheads.
   - Dynamic highlighting: selecting any node or research track instantly illuminates the complete prerequisite pathway with glowing accents (`--primary`, `--accent`) while gracefully dimming unrelated nodes to 20% opacity.
   - Interactive zoom in/out, panning via mouse drag, and view reset.
2. **Daftar Aksesibel (Structured Semantic Tree View):**
   - Hierarchical accordion structure designed for mobile devices, screen readers, and keyboard navigation.
   - Organized by:
     - Research Tracks (L4) -> details & prerequisites.
     - Advanced Modules (L3) -> details, prerequisites & unlocked tracks.
     - Core Curriculum (L1–L2) -> 12 sections with 60 chapter cards.
   - 100% WCAG 2.1 AA accessible with full keyboard support (`Tab`, `Enter`, `Space`).
3. **Node Inspector Drawer:**
   - Displays full node specifications: title, description, level badge, estimated hours, section/pillar, telecom relevance box, clickable prerequisite chips, clickable unlock chips, and direct navigation buttons (`#/chapter/:id`, `#/advanced/:moduleId`, `#/research/:trackId`, and `#/playgrounds/:labId`).

---

## 5. Automated Verification

The dependency graph is continuously verified by `tests/academic-roadmap-dependency.test.mjs` and `tests/roadmap-view-routing.test.mjs` ensuring:
- 74 canonical nodes strictly preserved.
- Graph is 100% acyclic.
- Zero dangling prerequisite references.
- All 6 research pathways resolve valid non-empty critical chains.
- Hash-based routes conform to client-side static hosting standards.
