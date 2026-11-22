# PHASE AD-11 ARCHITECTURAL COMPLETION REPORT
## PRIMARY RESEARCH LEARNING TRACKS (L4 RESEARCH-READY)
### R01 Visual Detection | R02 Multi-Object Tracking | R03 Robust Visual Perception

**Project:** Multimedia & Computer Vision Learning Hub (*From Digital Media to Intelligent Visual & Audio Systems*)  
**Repository:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Phase:** `AD-11 — Primary Research Learning Tracks`  
**Status:** **COMPLETE & FULLY VERIFIED**  
**Academic Target:** L4 — Research-Ready (Persiapan Publikasi CVPR / ICCV / ECCV / TPAMI / IJCV / IEEE TIP)  
**Academic Institution:** Institut Teknologi Sumatera (ITERA)  
**Author & Curriculum Architect:** Aji Pamungkas Tri Nurcahyo  
**Target Roadmaps:** S1 Teknik Telekomunikasi ITERA & Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  
**Baseline Invariants:**
- Core Curriculum (Chapters 01–60): 100% Immutable, Frozen & Zero Regression
- Advanced Curriculum (ADV-01–ADV-08): 100% Immutable, Published & Zero Regression
- Six Core Learning Tracks: 100% Intact
- Six Approved Research Tracks: R01, R02, R03 (Published & Verified), R04, R05, R06 (Planned)

---

## 1. Approved Scope and Baseline Audit

Prior to beginning Phase AD-11 implementation, a rigorous audit of the current platform foundation was executed:
- `docs/advanced-research-planning/APPROVED_ARCHITECTURE.md`: Governs the 8 Advanced Modules and 6 Research Tracks (3 Primary, 2 Strategic, 1 Optional).
- `docs/advanced-research-planning/DEVELOPMENT_PHASE_PLAN.md`: Formally establishes Phase AD-11 as the delivery of the three primary research tracks (R01, R02, R03).
- `docs/AD_10_RESEARCH_LEARNING_FOUNDATION.md`: Established the 20-Stage Research Methodology, 10 standardized research templates in `content/research/templates/`, statistical rigor engine (`src/lib/researchMetrics.ts`), and baseline schemas.
- `content/curriculum/research-tracks.json`: Audited to confirm track IDs, prerequisites, and milestone structures.

**Audit Finding:** The foundation established in AD-10 provided all necessary manifest schemas and statistical algorithms. Phase AD-11 builds directly upon this foundation to author substantive L4 research curriculum content, dedicated Tier-A interactive laboratories, Tier-B guided workflows, and Tier-C reproducible Python scripts and Jupyter notebooks.

---

## 2. R01 Academic Implementation: Intelligent Visual Detection & Recognition

- **Track Code & ID:** `R01` (`r01`)
- **Academic Anchor:** Primary Academic Anchor (Pillar 1: Intelligent Computer Vision)
- **Status:** **Published (`published`)**
- **Syllabus Location:** [`content/research/r01/index.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r01/index.md)
- **18-Part Curriculum Coverage:**
  1. *Taksonomi Masalah:* Detektor anchor dua-tahap (Faster R-CNN), satu-tahap bebas-anchor (FCOS/YOLOX), set-prediction transformer (DETR), dan atensi deformabel multi-skala (Deformable DETR).
  2. *Latar Belakang Ilmiah:* Preservasi detail spasial objek kecil ($< 16 \times 16$ px) pada stride downsampling $32\times$.
  3. *Kajian Literatur:* Lin et al. (FPN, Focal Loss), Carion et al. (DETR), Zhu et al. (Deformable DETR), Bolya et al. (TIDE).
  4. *Pertanyaan & Hipotesis:* Pengaruh sampling atensi level $P_2$ terhadap peningkatan $\text{AP}_S \ge +2.0\%$ di atas variansi stokastik.
  5. *Provenansi Dataset:* MS COCO 2017 (`train2017`/`val2017`, CC-BY 4.0) dan VisDrone-DET.
  6. *Standar Ground-Truth:* Konvensi area COCO ($\text{Small} < 32^2, \text{Medium } 32^2\text{--}96^2, \text{Large} > 96^2$), audit bounding box non-zero.
  7. *Metode Baseline:* Deformable DETR (ResNet-50 backbone, 300 queries, Focal + L1 + GIoU loss).
  8. *Fondasi Matematis:* Multi-Scale Deformable Attention, interpolasi 101-titik COCO AP, dan GIoU loss.
  9. *Instruksi Reproduksi:* Setup deterministik, penguncian seed, dan replikasi numerik.
  10. *Variabel Eksperimen:* Desain kontrol independen, dependen, dan confounding.
  11. *Protokol Statistik:* Evaluasi multi-seed $N \ge 3$, Bessel correction $\sigma$, 95% bootstrap CI, dan paired Student's t-test.
  12. *Studi Ablasi:* Pengaruh level piramida $P_2$ vs $P_3$, jumlah sampling points $K \in \{2, 4, 8\}$, dan formulasi loss lokalisasi.
  13. *Taksonomi Galat:* Dekomposisi TIDE (Loc, Cls, Both, Dup, Bkg, Miss).
  14. *Uji Kekokohan:* Zero-shot cross-domain testing dari COCO ke VisDrone-DET.
  15. *Kebutuhan Komputasi:* GPU VRAM $\ge 12\text{ GB}$, CUDA 12.1, PyTorch 2.4+.
  16. *Pelaporan Ilmiah:* Format tabel komparasi kamera-ready berstandar CVPR/ICCV.
  17. *Etika Penelitian:* Privasi pengawasan udara, sensor blurring, dan mitigasi bias dataset Barat.
  18. *Daftar Periksa Kesiapan:* Checklist 7-poin kelayakan pengajuan naskah ilmiah.

---

## 3. R02 Academic Implementation: Robust Multi-Object Tracking & Motion Perception

- **Track Code & ID:** `R02` (`r02`)
- **Academic Anchor:** Primary Academic Anchor (Pillar 1: Intelligent Computer Vision)
- **Status:** **Published (`published`)**
- **Syllabus Location:** [`content/research/r02/index.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r02/index.md)
- **18-Part Curriculum Coverage:**
  1. *Taksonomi Masalah:* Tracking-by-Detection (TBD), Joint Detection and Embedding (JDE), dan Transformer-based MOT.
  2. *Latar Belakang Ilmiah:* Kerusakan estimasi Kalman Filter akibat pergerakan kamera dinamis (*camera ego-motion*) dan ambiguitas perlintasan jarak dekat (*cross-overs*).
  3. *Kajian Literatur:* Bewley et al. (SORT), Wojke et al. (DeepSORT), Zhang et al. (ByteTrack), Aharon et al. (BoT-SORT), Luiten et al. (HOTA).
  4. *Pertanyaan & Hipotesis:* Kompensasi gerak kamera affin dan asosiasi dua-tahap menurunkan IDSW minimal $25\%$ pada MOT17.
  5. *Provenansi Dataset:* MOT17 Challenge, MOT20 Extreme Density, DanceTrack Articulated Motion.
  6. *Standar Ground-Truth:* Lintasan $\mathcal{T}_k$, aturan evaluasi TrackEval resmi, threshold IoU $0.50$.
  7. *Metode Baseline:* YOLOX-X detector + Kalman state 8-dimensi + ByteTrack two-stage Hungarian association.
  8. *Fondasi Matematis:* Dekomposisi HOTA ($\text{HOTA}_\alpha = \sqrt{\text{DetA}_\alpha \cdot \text{AssA}_\alpha}$), kompensasi matriks afinitas $2\times 3$, dan Kuhn-Munkres LSAP solver dalam $\mathcal{O}(K^3)$.
  9. *Instruksi Reproduksi:* Replikasi per sequence MOT17 dengan batas denda biaya global.
  10. *Variabel Eksperimen:* Ambang batas skor deteksi $\tau_{\text{high}} = 0.60, \tau_{\text{low}} = 0.10$, buffer lintasan 30 frame.
  11. *Protokol Statistik:* Evaluasi multi-seed $N \ge 3$, uji Wilcoxon signed-rank pada skor asosiasi per sekuens.
  12. *Studi Ablasi:* Single-stage vs Two-stage association, RANSAC affine CMC vs no CMC, IoU vs Re-ID fusion.
  13. *Taksonomi Galat:* Identity Switch (IDSW), Track Fragmentation (Frag), False Positive Tracks, False Negative Termination.
  14. *Uji Kekokohan:* Kepadatan ekstrem MOT20 dan uji oklusi bertahap (5 s.d. 60 frame).
  15. *Kebutuhan Komputasi:* $\ge 30\text{ FPS}$ pada $1080\text{p}$, TrackEval library.
  16. *Pelaporan Ilmiah:* Format tabel resmi MOTChallenge (HOTA, DetA, AssA, IDF1, MOTA, IDSW, Frag, FPS).
  17. *Etika Penelitian:* Kepatuhan regulasi privasi pejalan kaki publik dan pencegahan identifikasi biometrik permanen.
  18. *Daftar Periksa Kesiapan:* Checklist integritas asosiasi dan non-conflation Greedy vs Hungarian.

---

## 4. R03 Academic Implementation: Robust Visual Perception in Adverse Environments

- **Track Code & ID:** `R03` (`r03`)
- **Academic Anchor:** Primary Academic Anchor (Pillar 2: Intelligent Visual Perception & Sensing)
- **Status:** **Published (`published`)**
- **Syllabus Location:** [`content/research/r03/index.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r03/index.md)
- **18-Part Curriculum Coverage:**
  1. *Taksonomi Masalah:* Hamburan partikel aerosol kabut, hujan monsun tropis, pencahayaan rendah, dan pergeseran distribusi kalibrasi (*miscalibration*).
  2. *Latar Belakang Ilmiah:* Penjelasan mendalam tentang **Paradoks Restorasi-Deteksi (*Restoration-Detection Paradox*)**, di mana pemfilteran restorasi berbasis penekanan variansi piksel (PSNR tinggi) memusnahkan gradien tepi frekuensi tinggi yang dibutuhkan detektor hilir.
  3. *Kajian Literatur:* Koschmieder (1924), He et al. (DCP), Li et al. (RESIDE), Guo et al. (Zero-DCE), Hendrycks & Dietterich (Corruption Bench), Guo et al. (Calibration & ECE).
  4. *Pertanyaan & Hipotesis:* Restorasi terpandu fisika diferensial meningkatkan mAP deteksi hilir $+5.0\%$ pada kabut tebal dan menurunkan ECE di bawah $0.06$.
  5. *Provenansi Dataset:* RESIDE SOTS, Dark Zurich, ACDC, dan Sumatera Tropical Vision Pilot.
  6. *Standar Ground-Truth:* Registrasi spasial piksel cerah-terdegradasi dan metrik tanpa referensi (NIQE/BRISQUE).
  7. *Metode Baseline:* Zero-DCE (neural curve estimator tanpa pengawasan pasangan) dan Dark Channel Prior.
  8. *Fondasi Matematis:* Model fisik Koschmieder $I(x) = J(x)t(x) + A(1-t(x))$, transmisi optik $t(x) = e^{-\beta d(x)}$, ECE binning $\sum_m \frac{|B_m|}{N} |\text{acc} - \text{conf}|$, PSNR (dB), dan SSIM.
  9. *Instruksi Reproduksi:* Verifikasi transfer radiatif deterministik (nilai piksel sintetik tepat $0.8161$).
  10. *Variabel Eksperimen:* Tingkat keparahan korupsi (Level 1 s.d. 5), konstanta atmospheric airlight $A = 0.95$.
  11. *Protokol Statistik:* Evaluasi multi-seed $N \ge 3$, uji permutasi 10.000 iterasi untuk signifikansi ECE.
  12. *Studi Ablasi:* Batasan fisik transmisi $t(x) \ge t_0$, loss keteraturan spasial Total Variation, dan penskalaan suhu (*temperature scaling*).
  13. *Taksonomi Galat:* Halo & ringing artifacts, noise amplification pada bayangan, color cast distortion, overconfident false positives.
  14. *Uji Kekokohan:* Benchmarking 5 tingkat keparahan Hendrycks dan evaluasi lintas-kondisi dari kabut ke malam hari.
  15. *Kebutuhan Komputasi:* $\le 20\text{ ms}$ per citra $512\times 512$ untuk pengolahan video 50 FPS pada unit persepsi sensor terpasang.
  16. *Pelaporan Ilmiah:* Format tabel metrik ganda (Fidelitas Sinyal PSNR/SSIM vs Persepsi Hilir mAP/ECE).
  17. *Etika Penelitian:* Keselamatan kritis kendaraan otonom, analisis batas kegagalan sistem (*failure bound*), dan inklusivitas iklim maritim tropis Sumatera.
  18. *Daftar Periksa Kesiapan:* Checklist pembuktian paradoks restorasi-deteksi dan reliabilitas kalibrasi.

---

## 5. Three-Tier L4 Architecture Implementation

### Tier A — Dedicated Interactive Research Laboratories
1. **R01 Detection Research Lab ([`R01DetectionResearchLab.tsx`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/components/playgrounds/R01DetectionResearchLab.tsx)):**
   - Real-time SVG visual canvas ($640 \times 400$) rendering ground-truth targets and model candidate predictions.
   - Dynamic threshold sweeps: Confidence Score $\tau \in [0.10, 0.95]$ and IoU Matcher $\tau_{\text{IoU}} \in [0.30, 0.90]$.
   - COCO Scale Stratification filter: All, Small ($< 32^2$), Medium, Large.
   - Spatial Uncertainty Halo visualization displaying bounding box positional variance.
   - Live calculations: Precision, Recall, F1 score, 101-point COCO interpolated AP, and TIDE error breakdown (Loc, Cls, Background False Alarms, Missed targets).
2. **R02 Tracking Research Lab ([`R02TrackingResearchLab.tsx`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/components/playgrounds/R02TrackingResearchLab.tsx)):**
   - Real-time SVG motion arena ($640 \times 320$) supporting trajectory playback across 25 frames.
   - Interactive comparison: **Kuhn-Munkres Hungarian (Globally Optimal LSAP)** vs **Greedy Matching**.
   - Two challenging research scenarios: (a) Cross-over occlusion with intersecting trajectories, (b) Close convoy parallel walking with Gaussian position jitter.
   - Live calculations: Kalman 2D state prediction, Hungarian bipartite matching, Identity Switch (IDSW) counter, DetA, AssA, and Higher Order Tracking Accuracy (HOTA).
   - Graphically demonstrates the fundamental theorem of MOT: Greedy matching traps into myopic local minima causing double ID switches, whereas Hungarian global cost minimization preserves true identities.
3. **R03 Adverse Perception Lab ([`R03AdversePerceptionLab.tsx`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/components/playgrounds/R03AdversePerceptionLab.tsx)):**
   - HTML5 Canvas 2D live renderer ($480 \times 280$) generating synthetic scenes with depth gradients and road obstacles.
   - Three physical degradation modes: (a) Koschmieder atmospheric haze, (b) Low-light night attenuation with sensor noise, (c) Monsoon rain streaks.
   - Interactive severity slider: Level 1 (Light) to Level 5 (Severe Hendrycks corruption).
   - Four restoration modes: Raw Degraded, Dark Channel Prior, Zero-DCE Physics Curve, and Heavy Over-Smoothing.
   - Dual-metric dashboard: Compares low-level signal metrics (PSNR, SSIM) directly against high-level perception metrics (mAP, ECE).
   - Live empirical proof of the **Restoration-Detection Paradox**: shows that over-smoothing yields $+9.5\text{ dB}$ PSNR but drops downstream detection by $-3.8\%$ and inflates ECE.

### Tier B — Guided Research Experiments
Authored comprehensive step-by-step methodologies guiding graduate students from problem formulation to reproducibility packages:
- [`content/research/r01/guided-workflow.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r01/guided-workflow.md)
- [`content/research/r02/guided-workflow.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r02/guided-workflow.md)
- [`content/research/r03/guided-workflow.md`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r03/guided-workflow.md)

### Tier C — Reproducible Computational Research
- **Standalone Deterministic Python Scripts:**
  - [`content/research/r01/examples/example-01.py`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r01/examples/example-01.py) (IoU, 101-point COCO AP, TIDE decomposition, multi-seed $N=3$ testing).
  - [`content/research/r02/examples/example-01.py`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r02/examples/example-01.py) (Kalman 2D, Kuhn-Munkres Hungarian vs Greedy, LSAP counterexample, HOTA/IDSW evaluation).
  - [`content/research/r03/examples/example-01.py`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r03/examples/example-01.py) (Koschmieder atmospheric transfer, PSNR/SSIM, ECE calibration, downstream mAP impact).
- **Executable Jupyter Notebooks (`nbformat` v4):**
  - [`content/research/r01/notebooks/r01-research-baseline.ipynb`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r01/notebooks/r01-research-baseline.ipynb)
  - [`content/research/r02/notebooks/r02-research-baseline.ipynb`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r02/notebooks/r02-research-baseline.ipynb)
  - [`content/research/r03/notebooks/r03-research-baseline.ipynb`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/content/research/r03/notebooks/r03-research-baseline.ipynb)

---

## 6. Website Integration & Portal Architecture

[`src/components/ResearchTracksView.tsx`](file:///d:/Workstation/Repo%20My%20Corses/Multimedia%20%26%20Computer%20Vision/src/components/ResearchTracksView.tsx) was updated to provide full-fledged research portal capabilities:
1. **Status Tagging:**
   - Tracks R01, R02, R03 display the verified badge: `Terpublikasi · Konten Riset & Lab Terpadu (L4 Ready)` with emerald styling.
   - Tracks R04, R05, R06 display the planned badge: `Direncanakan · Spesifikasi Protokol` with sky styling.
2. **Sub-Tab Navigation per Track:**
   When expanding R01, R02, or R03, students and researchers can toggle between 5 specialized views:
   - `🔬 Lab Interaktif (Tier A)`: Live interactive experiment explorer with real-time math.
   - `📚 Silabus Riset 18-Bab`: Full academic curriculum rendered via `MarkdownRenderer`.
   - `🧭 Alur Riset Terpandu (Tier B)`: Guided research workflow from hypothesis to paper.
   - `💻 Skrip & Notebook (Tier C)`: Reproducible Python code display, notebook paths, and execution instructions.
   - `📊 Benchmark & Milestone ISVWS`: Official benchmark specifications, candidate datasets, statistical protocols, and roadmap phasing.
3. **Global Navigation Preserved:**
   - Universal 5-tab research laboratory (`ResearchExperimentExplorerLab`) remains accessible.
   - 20-Stage Research Methodology Framework and 10 Standardized Research Templates remain completely integrated.

---

## 7. Verification and Quality Gates Matrix

| Verification Suite | Target | Status | Details |
|---|---|---|---|
| `npm test` | Core (01–60), Advanced (ADV-01–08), Research (R01–06) | **PASS** | **93/93 tests passing** (0 failures, 394 ms) |
| `npm run validate` | Chapters, Tracks, Advanced Modules, Research Tracks, Templates | **PASS** | 60 chapters, 6 core tracks, 8 advanced modules, 6 research tracks, 10 templates validated |
| `npm run typecheck` | TypeScript Compiler (`tsc --noEmit`) | **PASS** | **0 type errors** across all components |
| `npm run build` | Vite 6.4.5 Static Bundle Compilation | **PASS** | Static client bundle compiled in 4.46s |
| Python Scripts Execution | Standalone Python Tier-C baselines | **PASS** | All 3 scripts (`r01`, `r02`, `r03`) execute deterministically with exit code 0 |

---

## 8. Preserved Architectural Invariants & Non-Regression

- **Core Chapters 01–60:** 100% frozen, untouched, and fully operational (Zero Regression).
- **Advanced Modules ADV-01–ADV-08:** 100% immutable and published (Zero Regression).
- **Six Research Tracks:** Approved identities, codes (R01..R06), and ISVWS 2026–2040 roadmap alignments strictly preserved.
- **Hardware & Backend Safety:** No GPU required for website operation; zero permanent backend or external API database dependencies introduced.
- **Evidence Integrity:** Explicit evidence categories (`educational_simulation`, `verified_numerical_example`) enforced; zero false claims of physical benchmark reproduction.

---

## 9. Conclusion & Governance Recommendation

Phase AD-11 is **complete, independently verified, and closed**.

**Execution is HALTED.** Do not proceed to Phase AD-12 (Strategic Research Tracks: R04 Vision-Centric Multimodal & R05 Efficient Edge Vision) without explicit user authorization.
