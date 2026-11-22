# PROJECT STATUS AND RESUME GUIDE
## Multimedia & Computer Vision Learning Hub: From Digital Media to Intelligent Visual & Audio Systems
### Permanent Handoff Document & Engineering State for Future Agents & Contributors

**Project Name:** Multimedia & Computer Vision Learning Hub  
**Repository Location:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Current Phase:** `Phase AD-13 — Final Release Readiness & Publication Preparation (COMPLETE)`  
**Release Gate Classification:** **`READY_FOR_PUBLICATION`**  
**Academic Target:** L1 Core to L4 Research-Ready (Persiapan Publikasi IEEE CVPR / ECCV / NeurIPS / MLSys / 3DV / IEEE RA-L / IROS / ACM MM)  
**Academic Institution:** Institut Teknologi Sumatera (ITERA)  
**Curriculum Architect & Lead Author:** Aji Pamungkas Tri Nurcahyo  
**Target Roadmaps:** S1 Teknik Telekomunikasi & Roadmap ISVWS 2026–2040 (*Intelligent Sensing, Vision and Wireless Systems*)  
**Policy Invariant:** NO COMMIT, NO PUSH, NO DEPLOY without explicit user authorization.

---

## 1. Executive Summary & Repository Identity

The **Multimedia & Computer Vision Learning Hub** is a production-grade, web-first educational and research platform designed to guide undergraduate students from foundational digital signal and image processing up to peer-reviewed computer vision and multimodal AI research.

The repository is self-contained, requiring zero external server backends or GPU hardware for end-user operation. It packages:
- **60 Published Core Chapters** (Chapters 01–60)
- **8 Published Advanced Modules** (ADV-01–ADV-08)
- **6 Published Research Learning Tracks** (R01–R06)
- **10 Standardized Research Templates**
- **14 Interactive In-Browser Laboratories** (Canvas 2D / WebGL)
- **96 Passing Automated Unit and Integration Tests**

---

## 2. Completed Curriculum & Research Structure

### 2.1 Core Curriculum (60 Chapters — 100% Frozen & Complete)
- **Track 1: Digital Image Processing & Enhancement** (Chapters 01–15)
- **Track 2: Audio Signal & Speech Processing** (Chapters 16–20)
- **Track 3: Video & Motion Analysis** (Chapters 21–30)
- **Track 4: Foundations of Computer Vision & Deep Learning** (Chapters 31–50)
- **Track 5: Multimodal & Cross-Modal Systems** (Chapters 51–55)
- **Track 6: Systems, Real-Time Optimization & Capstone** (Chapters 56–60)

### 2.2 Advanced Curriculum (8 Modules — 100% Published)
- **ADV-01:** Mathematical Foundations for Advanced Computer Vision (SVD, Lie Groups SO(3), Least Squares)
- **ADV-02:** Advanced Digital Image Processing & Mathematical Inverse Problems (ROF Variational TV, ADMM)
- **ADV-03:** Robust Visual Tracking & MOT Systems (Kalman 2D, Kuhn-Munkres LSAP, Gating)
- **ADV-04:** Advanced Deep Recognition & Attention (Deformable Attention, DETR Bipartite Matching)
- **ADV-05:** Multi-View Geometry & 3D Computer Vision (Pinhole, Epipolar Sampson, DLT Triangulation, Bundle Adjustment)
- **ADV-06:** Robust Perception in Adverse Conditions (Koschmieder Physics, Dark Channel Prior, ECE Calibration)
- **ADV-07:** Vision Foundation Models & Adapters (Contrastive InfoNCE, LoRA Parameter-Efficient Tuning)
- **ADV-08:** Efficient CV & Edge AI Architecture (Affine Quantization, Roofline Model, Pruning)

### 2.3 Research Learning Tracks (6 Tracks — 100% Published & Reproduced)
- **R01:** Intelligent Visual Detection & Recognition (Primary Academic Anchor — Deformable DETR / COCO)
- **R02:** Robust Multi-Object Tracking & Motion (Primary Academic Anchor — ByteTrack / MOT17 / HOTA)
- **R03:** Robust Perception in Adverse Environments (Primary Academic Anchor — ACDC / Foggy Cityscapes)
- **R04:** Vision-Centric Multimodal Perception (Strategic Extension — Camera-Radar Bayesian Fusion)
- **R05:** Efficient Computer Vision & Edge AI Systems (Strategic Extension — INT8 Affine & Roofline Profiling)
- **R06:** Spatial Intelligence & 3D Vision (Optional Specialization — KITTI Calibrated Stereo Triangulation)

---

## 3. Key Architectural Decisions

1. **Client-Side Zero-Backend Architecture:**
   - Framework: React 19 + TypeScript 5 + Vite.
   - Math rendering: KaTeX client-side math parsing.
   - Text/JSON loader: Vite `import.meta.glob` bundles all markdown lessons and JSON data eagerly at build time.
2. **Hash-Based Static Routing:**
   - Navigates via `window.location.hash` (`#/curriculum`, `#/advanced`, `#/research`, `#/chapter/:id`).
   - Ensures native deep-linking and browser refresh compatibility on GitHub Pages and static CDNs without server rewrites.
3. **Relative Base Path:**
   - `vite.config.ts` has `base: './'`, enabling seamless hosting at the root domain or within repository subpaths.
4. **Three-Tier Research Learning Architecture:**
   - **Tier A:** Interactive browser canvas laboratory for live visual intuition.
   - **Tier B:** Guided step-by-step workflow document (`guided-workflow.md`).
   - **Tier C:** Reproducible standalone Python script (`example-01.py`) and Jupyter notebook (`*.ipynb`).
5. **Gate 6 Multi-Seed Rigor ($N \ge 3$):**
   - All research baselines report metrics across seeds `[42, 1337, 2026]` with mean, sample standard deviation, and bootstrap 95% confidence intervals.
   - Scientific transparency: simulations are labeled `"evidenceCategory": "educational_simulation"`.

---

## 4. Relevant Source Directories

```
.
├── content/
│   ├── chapters/                # Chapters 01 to 60 (lessons, slides, quizzes, media)
│   ├── advanced/                # Advanced Modules ADV-01 to ADV-08
│   ├── research/                # Research Tracks R01 to R06 + templates/
│   └── curriculum/              # master-curriculum.json, advanced-modules.json, research-tracks.json
├── src/
│   ├── components/
│   │   ├── playgrounds/         # 40+ interactive laboratories and simulation widgets
│   │   ├── AdvancedCurriculumView.tsx
│   │   ├── ResearchTracksView.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── PresentationViewer.tsx
│   ├── lib/
│   │   ├── content.ts           # Core content loading & typings
│   │   ├── advancedContent.ts   # Advanced & Research Vite glob import loaders
│   │   ├── advancedCvProcessing.ts # Core algorithms (SVD, Hungarian, Kalman, Roofline)
│   │   └── researchMetrics.ts   # Statistical rigor engine (t-test, bootstrap CI, HOTA, ECE)
│   └── App.tsx                  # Root navigation & layout
├── tests/                       # 10 test suites (96 tests total)
├── scripts/                     # Validation scripts (validate-content, validate-media)
├── dist/                        # Production build output
└── docs/                        # Architectural completion reports and governance records
```

---

## 5. Verification Commands

Run all verification tools from the workspace root:

```powershell
# 1. Run all 96 unit & integration tests
npm test

# 2. Validate curriculum and media integrity
npm run validate

# 3. TypeScript strict typecheck (must produce 0 errors)
npm run typecheck

# 4. Production build
npm run build

# 5. One-liner full validation suite
npm test; npm run validate; npm run typecheck; npm run build
```

To run individual Python reference scripts:
```powershell
python content/research/r04/examples/example-01.py
python content/research/r05/examples/example-01.py
python content/research/r06/examples/example-01.py
```

---

## 6. Deployment Configuration

The repository is pre-configured for **GitHub Pages** deployment:
- **Build Output:** `dist/`
- **Vite Base Path:** `./` (in `vite.config.ts`)
- **Assets:** Fully bundled with content-hashed filenames in `dist/assets/`.
- **To Deploy (Manual):**
  Push `dist/` to the `gh-pages` branch, or configure GitHub Actions to deploy static pages from the `main` branch.

---

## 7. Known Limitations & Scope Boundaries

1. **Deterministic Educational Simulations:**
   - Empirical research baselines (R01–R06) use self-contained, CPU-friendly synthetic simulation pipelines (`educational_simulation`) rather than requiring 8x A100 multi-node GPU clusters.
   - For Track R05, edge inference latency and speedup are modeled via the Roofline operational bound, not physical oscilloscope probes on bare-metal silicon.
2. **Headless Chrome DevTools:**
   - Live browser subagent automated test driving requires an active Chrome instance started with `--remote-debugging-port=9222`.
3. **Application Bundle Size:**
   - The combined JavaScript bundle is $\approx 3.38\text{ MB}$ uncompressed ($\approx 841\text{ kB}$ gzip), which includes all 60 chapters, 8 advanced modules, and 6 research paths for instant offline navigation.

---

## 8. Current Release State

- **Phase Status:** Phase AD-13 is complete.
- **Release Decision:** **`READY_FOR_PUBLICATION`**.
- **Working Tree:** All code, content, tests, and documentation are committed/verified locally.
- **Git State:** Clean working state; no commit, push, or deployment has been made.

---

## 9. Instructions for Future AI Agents Resuming this Project

If you are a future AI agent assigned to work on this repository, **DO NOT RESTART FROM ZERO OR OVERWRITE EXISTING CONTENT**:

1. **Verify the Baseline:**
   Run `npm test; npm run validate; npm run typecheck` immediately to confirm that all 96 tests pass.
2. **Respect the Invariants:**
   - Chapters 01–60 are **100% frozen and immutable**. Do not alter them unless fixing a verified factual typo.
   - Advanced Modules ADV-01–ADV-08 and Research Tracks R01–R06 are **100% published**.
   - Do not rename track IDs (`r01`..`r06`) or module IDs (`adv-01`..`adv-08`).
   - Maintain the institutional acronym expansion: *Intelligent Sensing, Vision and Wireless Systems (ISVWS 2026–2040)*.
3. **Do Not Add Backend Services:**
   Keep the hub strictly client-side static web-first.
4. **Follow the Standard PR / Phase Workflow:**
   Always run the complete test suite before declaring any phase or fix complete.

