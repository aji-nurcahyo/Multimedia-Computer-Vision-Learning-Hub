# APPROVED ARCHITECTURE & GOVERNANCE DECISIONS
## Phase AD-06 Authorization: Advanced & Research Learning Platform Foundation
**Document Version:** 1.0.0  
**Authorization Date:** 2026-11-19  
**Authority:** Project Owner / Academic Lead  
**Scope:** Multimedia & Computer Vision Learning Hub — Advanced & Research Layers

---

## 1. Executive Authorization Record

Formal governance approval has been granted for the Advanced Curriculum and Research Learning Path Architecture designed during Phase AD-05. The seven decision gates have been authorized as follows:

| Gate | Approved Selection | Decision Summary & Scope |
| :--- | :--- | :--- |
| **Gate 1** | **APPROVED — Option A** | **All 8 Advanced Modules (ADV-01 – ADV-08)** approved for progressive authoring and implementation across Phases AD-07, AD-08, and AD-09. |
| **Gate 2** | **APPROVED — Option A** | **All 6 Research Tracks (R01 – R06)** approved, structured into 3 Primary Academic Anchors (R01, R02, R03), 2 Strategic Extensions (R04, R05), and 1 Optional Specialization (R06). |
| **Gate 3** | **APPROVED — Option A** | **Dedicated Navigation Routes (`/advanced` and `/research`)** approved as top-level application views, preserving the existing `/chapters` and `/tracks` routes. |
| **Gate 4** | **APPROVED — Option A** | **Tier A Interactive Labs:** HTML5 Canvas 2D, SVG, and lightweight WebGL where appropriate for real-time, zero-install, 100% client-side execution. |
| **Gate 5** | **APPROVED — Option A** | **Benchmark Telemetry Hosting:** Static pre-computed JSON experiment telemetry inside the repository (`src/data/telemetry/`) paired with optional external Google Colab / Jupyter notebooks for computational reproduction. |
| **Gate 6** | **APPROVED WITH REFINEMENT — Option A** | **Empirical Rigor & Multi-Seed Validation:** Minimum 3 independent random seeds ($N \ge 3$) for applicable stochastic research baselines; report mean ($\mu$), standard deviation ($\sigma$), and relevant uncertainty estimates. Statistical significance testing must follow the experimental design and must not universally assume $p < 0.05$ is sufficient or mandatory. |
| **Gate 7** | **APPROVED — Option A** | **Staged Roadmap (Phases AD-06 – AD-12):** Phased development lifecycle with mandatory approval gates and regression verification before each subsequent phase. |

---

## 2. Refined Specification for Decision Gate 6 (Empirical & Statistical Rigor)

In accordance with the project owner's refinement:
1. **Multi-Seed Stochastic Execution:**
   - All research baselines with stochastic components (random weight initialization, data augmentation shuffling, stochastic optimization) must execute across at least $N = 3$ independent runs with documented distinct random seeds.
   - All primary metrics must be reported with central tendency and dispersion metrics ($\mu \pm \sigma$, median, interquartile range, or confidence intervals as appropriate).
2. **Context-Appropriate Statistical Hypothesis Testing:**
   - Significance testing is not treated as a mechanical $p < 0.05$ check. The test selection (e.g., paired $t$-test, Wilcoxon signed-rank, permutation tests, or Bayesian estimation) must match the distribution, sample size, and nature of the experimental comparison.
   - For deterministic algorithms (e.g. classical Harris corner detection, exact linear inverse solvers), multi-seed runs are not required; validation is performed via exact numerical equivalence against gold standards.

---

## 3. Strict Boundary & Non-Modification Constraints

During Phase AD-06:
1. **Core Curriculum Immutability:** Core Chapters 01–60, their IDs, lessons, code, notebooks, playgrounds, slides, quizzes, and exercises remain strictly immutable.
2. **Existing Learning Tracks:** The existing 6 Learning Tracks (`core-dip`, `telecom-signals`, `computer-vision-ai`, `multimodal-systems`, `realtime-edge`, `complete-journey`) remain unchanged.
3. **No Unfinished Lesson Authoring:** Advanced Modules (ADV-01 – ADV-08) and Research Tracks (R01 – R06) must be registered with status `"planned"` and clearly presented as planned, preventing misleading active links to nonexistent content.
4. **Static Deployment Compatibility:** The platform remains 100% static-first and compatible with GitHub Pages base-path routing without requiring a backend server or GPU environment.

