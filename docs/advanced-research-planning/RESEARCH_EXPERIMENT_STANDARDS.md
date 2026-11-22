# RESEARCH EXPERIMENT STANDARDS & REPRODUCIBILITY PROTOCOL
## Scientific Rigor, Benchmarking Standards, and Validation Framework for Computer Vision Research
**Document Version:** 1.0.0  
**Phase:** AD-05 Architecture Planning  
**Target Standard:** CVPR / ICCV / ECCV / NeurIPS / IEEE TPAMI Reproducibility Guidelines

---

## 1. Reproducibility Mandate & Philosophical Framework

Scientific credibility in Computer Vision requires that experimental results are not fortuitous anomalies or cherry-picked cherry runs. Every experiment conducted within the **Multimedia & Computer Vision Learning Hub's** Advanced Modules (ADV-01 – ADV-08) and Research Tracks (R01 – R06) must adhere to rigorous **reproducibility, provenance, statistical validation, and failure transparency protocols**.

```mermaid
flowchart LR
    A["1. Data Provenance & Split Audit"] --> B["2. Deterministic Environment Setup"]
    B --> C["3. Multi-Seed Training (N >= 3)"]
    C --> D["4. Standardized Metric Evaluation"]
    D --> E["5. Statistical Significance Testing"]
    E --> F["6. Component Ablation Isolation"]
    F --> G["7. Failure Mode Taxonomy & Report"]
```

---

## 2. Benchmark Dataset Provenance & Integrity Audit

Before training or evaluating any model, the dataset must pass a 6-point provenance audit:

1. **Licensing & Academic Permissibility:** The dataset license (e.g., CC-BY 4.0, MIT, Non-Commercial Research Use Only) must be verified and cited. Proprietary or scraped web data without explicit research terms of service is prohibited.
2. **Canonical Split Enforcement:** Researchers must use the official, standard benchmark splits (e.g., MS COCO 2017 `train2017` / `val2017`, MOT17 training half / validation half). Zero cross-contamination between train and test distributions is permitted.
3. **Data Provenance & Sensor Attribution:** Sensor type (CMOS, rolling/global shutter, focal length, color space, bit-depth) and environmental context (lighting in lux, weather conditions, capture platform) must be recorded.
4. **Annotation Quality & Error Auditing:** Annotations must be verified for bounding box clipping, label noise, and ambiguous edge cases. For tracking datasets, identity continuity must be audited for identity-swap artifacts.
5. **Class Imbalance & Long-Tail Distribution:** Class distributions must be plotted. If extreme imbalance exists ($>10:1$ ratio), evaluation must report per-class performance alongside macro and micro averages.
6. **Privacy & Ethical Safeguards:** Face anonymization / blurring or pedestrian consent compliance must be verified for outdoor visual datasets containing identifiable individuals.

---

## 3. Baseline Reproduction & Execution Protocol

To establish a valid research baseline, experiments must be executed under strictly controlled computational conditions:

### 3.1 Hardware & Environment Telemetry Logging
Every experiment artifact must log:
- **Compute Infrastructure:** Host OS, CPU model and thread count, GPU model (e.g. NVIDIA RTX 3090, A100), total VRAM, and RAM capacity.
- **Software Dependencies:** Exact versions of Python, PyTorch (`torch.__version__`), CUDA runtime (`torch.version.cuda`), cuDNN (`torch.backends.cudnn.version()`), Torchvision, and ONNX Runtime.
- **Dependency Pinning:** A frozen `requirements-lock.txt` or Dockerfile containing exact SHA/build hashes.

### 3.2 Deterministic Random Seed Enforcement
To control stochastic variation, random number generators must be seeded identically across libraries:
```python
import os, random, numpy as np, torch

def set_deterministic_seed(seed: int = 42) -> None:
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
```

---

## 4. Standardized Evaluation Metrics Suite

All candidate models and proposed novelties must be evaluated using standard academic metric packages (e.g., `pycocotools`, `TrackEval`, `scikit-learn`):

| Research Domain | Mandatory Primary Metrics | Secondary / Diagnostic Metrics | Standard Software Implementation |
| :--- | :--- | :--- | :--- |
| **Object Detection (R01)** | $\text{mAP}@[.50:.95]$ (COCO primary), $\text{AP}_{50}$, $\text{AP}_{75}$ | Scale-specific: $\text{AP}_S$ (area $< 32^2$), $\text{AP}_M$ ($32^2 \le \text{area} \le 96^2$), $\text{AP}_L$ ($\text{area} > 96^2$), $\text{AR}_{100}$ | `pycocotools.coco.COCOeval` |
| **Multi-Object Tracking (R02)** | $\text{HOTA}$ (Higher Order Tracking Accuracy), $\text{IDF1}$, $\text{MOTA}$ | $\text{DetA}$ (Detection Accuracy), $\text{AssA}$ (Association Accuracy), $\text{IDSW}$ (ID Switches), $\text{Frag}$ | Official `TrackEval` library (Luiten et al., IJCV 2021) |
| **Adverse Condition / Restoration (R03)** | $\text{PSNR}$ (dB), $\text{SSIM}$, $\text{LPIPS}$ (Perceptual loss) | $\text{mCE}$ (mean Corruption Error relative to baseline), $\text{ECE}$ (Expected Calibration Error) | `torchmetrics.image` / `lpips` / `scikit-image` |
| **Vision-Centric Multimodal (R04)** | Zero-Shot Top-1 / Top-5 Accuracy, Text-to-Image / Image-to-Text $\text{Recall}@K$ ($K=1, 5, 10$) | Grounding Recall@0.5 IoU, Pointing Game Accuracy | Official `open_clip` / HuggingFace `evaluate` |
| **Efficient Vision Systems (R05)** | $\text{mAP}$ Pareto Frontier vs. $\text{FPS}$ / Latency ($\text{P50}, \text{P90}, \text{P99}$ ms), Model Size (MB) | MACs / FLOPs (G), Peak VRAM / RAM consumption (MB), Energy per frame (mJ) | PyTorch Profiler, `thop` / `fvcore`, ONNX Runtime Profiler |
| **Spatial 3D Vision (R06)** | $\text{AbsRel}$, $\text{RMSE}$ (meters), Threshold Accuracy ($\delta < 1.25, 1.25^2, 1.25^3$) | $\text{ATE}$ (Absolute Trajectory Error), $\text{RPE}$ (Relative Pose Error) | `evo` trajectory evaluation / NYU Depth evaluation suite |

---

## 5. Statistical Significance Testing Protocol

Single-run metric comparisons are academically insufficient for research publications. The following statistical protocol is mandatory:

### 5.1 Multi-Seed Execution
- Any comparative claim between a baseline ($M_{\text{base}}$) and proposed improvement ($M_{\text{prop}}$) must be evaluated across **at least $N = 3$ independent runs** (recommended $N = 5$) with differing randomized seeds ($\text{seeds} = [42, 1337, 2026, 777, 999]$).
- Results must be presented as:
  $$\text{Metric} = \mu \pm \sigma \quad (\text{e.g., } \text{mAP} = 45.2 \pm 0.3\%)$$

### 5.2 Hypothesis Testing & Confidence Bounds
- For continuous evaluation metrics, compute a **two-sided paired Student's $t$-test** or **Wilcoxon signed-rank test** (for non-normal distributions).
- A proposed novelty is only recognized as a statistically significant contribution if:
  $$p < 0.05 \quad (\text{significance level } \alpha = 0.05)$$
- If $p \ge 0.05$, the paper or report must explicitly state that the measured performance gain is within stochastic variation.

---

## 6. Ablation Study Standards & Component Isolation

To prevent confounding variables, ablation studies must isolate individual architectural decisions:

1. **One-Factor-at-a-Time (OFAT) & Factorial Isolation:** Each row of an ablation table must alter exactly one parameter, component, or hyperparameter relative to the row above it.
2. **Standardized Ablation Reporting Template:**
   ```
   | Configuration | Backbone | Attention Head | Loss Function | mAP@[.50:.95] | Params (M) | Latency (ms) | Delta mAP |
   | Baseline      | ResNet-50| Standard Multi | Cross-Entropy | 38.2 +/- 0.2  | 25.5       | 12.4         | -         |
   | + Deformable  | ResNet-50| Deformable Attn| Cross-Entropy | 40.8 +/- 0.3  | 26.8       | 14.1         | +2.6      |
   | + Focal Loss  | ResNet-50| Deformable Attn| Generalized FL| 42.1 +/- 0.2  | 26.8       | 14.1         | +1.3      |
   | + Multi-Scale | ResNet-50| Deformable Attn| Generalized FL| 43.9 +/- 0.2  | 34.2       | 18.5         | +1.8      |
   ```
3. **Computational Trade-Off Disclosure:** Every ablation row reporting metric improvement ($\Delta$) must also report the corresponding cost in parameters, FLOPs, and runtime latency.

---

## 7. Failure Case Analysis & Error Taxonomy

Research papers and capstone dissertations must include a dedicated **Failure Analysis Section**:

1. **Categorized Error Taxonomy:**
   - *Localization Errors:* Correct class, but $\text{IoU} < 0.50$.
   - *Classification Confusion:* $\text{IoU} \ge 0.50$, but misclassified into a semantically adjacent class.
   - *Background Hallucination:* High-confidence detection on pure background/clutter ($\text{FP}$).
   - *Small-Object Misses:* False negatives on objects smaller than $16 \times 16$ pixels.
   - *Physical Corruption Breakdown:* Catastrophic failure when rain streaks or glare obscure key structural gradients.
2. **Visual Inspection Gallery:** High-resolution side-by-side visual examples illustrating the worst-performing 5% test samples, paired with a mechanistic hypothesis of why the model failed.

