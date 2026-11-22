# AD-01E: WEB-BASED DEEP LEARNING LEARNING EXPERIENCE & EXPERIMENT DOCUMENTATION
## Multimedia & Computer Vision Learning Hub — Chapters 41–45

**Platform:** Multimedia & Computer Vision Learning Hub  
**Repository:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Author & Developer:** Aji Pamungkas Tri Nurcahyo  
**Institution:** Institut Teknologi Sumatera (ITERA)  
**Completion Date:** November 18, 2026  
**Auditor:** Senior Full-Stack Engineer, Academic Curriculum Architect, & CV Systems Specialist  

---

## 1. Executive Summary

Phase AD-01E consolidates the platform's vision as an **Open Educational Learning Hub** for undergraduate telecommunication engineering students at ITERA and independent researchers. 

Rather than treating Deep Learning merely as code execution on local developer GPUs, Phase AD-01E standardizes a **Three-Tier Web-First Learning Architecture**:
1. **Tier A — Interactive Web Demonstration (Browser-First)**: Leverages existing React/Canvas interactive laboratories (`CnnFundamentalsExplorer`, `ImageClassificationLab`, `TransferLearningExplorer`, `YoloObjectDetectionLab`, `DeepSegmentationLab`) running client-side with explicit disclosure badges.
2. **Tier B — Guided Experiment Walkthrough (Lesson Text `index.md`)**: Fully updated academic text featuring a standard 10-point educational structure: Problem Formulation, Mathematical Derivations, Worked Numerical Examples, Dual-Engine Architecture, Input/Output Structure, Metric Interpretation, Common Student Errors, and Practical Research Guidance.
3. **Tier C — Executable Reproducible Notebooks (Jupyter / Google Colab)**: Dual-engine Jupyter Notebooks (`chapter-41-lab.ipynb` through `chapter-45-lab.ipynb`) that run offline with pure NumPy on local CPUs or automatically activate production PyTorch / Torchvision / Ultralytics pipelines when opened on Google Colab or CUDA workstations.

---

## 2. Standardized Educational Structure Across Chapters 41–45

Each chapter's lesson text (`index.md`) now delivers a complete educational walkthrough:

| Section | Educational Component | Content Delivered |
|---|---|---|
| **Section 1** | Konsep & Motivasi Akademik | Problem statement, biological/visual motivation, and hierarchical representation. |
| **Section 2** | Formulasi Matematika & Landasan Teori | Rigorous equations (Cross-correlation, Residual skip, Softmax $T$, CIoU, Soft Dice). |
| **Section 3** | Contoh Perhitungan Manual Terpandu | Step-by-step arithmetic verification matching standalone Python scripts. |
| **Section 4** | Analisis Mode Kegagalan & Penanganan | Technical diagnoses (Vanishing gradient, Overfitting, Negative transfer, Small objects, Fuzzy contours). |
| **Section 5** | Eksperimen Terpandu & Dokumentasi Praktikum | Three-tier learning mode breakdown, Colab setup instructions, I/O tensor structures, and student troubleshooting. |
| **Section 6** | Diagram Arsitektur Sistem | Clear, accessible SVG schematics integrated from the media registry. |
| **Section 7** | Rangkuman & Pembahasan Akademik | Core takeaways and bridges to next-stage vision research. |

---

## 3. Chapter-by-Chapter Learning Experience Enhancements

### 3.1 Chapter 41: CNN Foundations (`CnnFundamentalsExplorer.tsx`)
- **Web Demo**: Visualizes 2D sliding kernel cross-correlation and max pooling operations on a $6 \times 6$ grid directly in the browser.
- **Walkthrough**: Explains tensor layout NCHW, dimensional reduction formula $O = \lfloor\frac{W-K+2P}{S}\rfloor+1$, parameter counting, and receptive field arithmetic.
- **Notebook & Colab**: Details `MiniConvNet` (Conv2D $\to$ BatchNorm $\to$ ReLU $\to$ MaxPool $\to$ AdaptiveAvgPool $\to$ Linear) autograd training loop with synthetic $(8, 1, 16, 16)$ mini-batches.
- **Student Troubleshooting**: Resolves `RuntimeError: Given groups=1, expected X channels` and gradient divergence.

### 3.2 Chapter 42: Image Classification (`ImageClassificationLab.tsx`)
- **Web Demo**: Interactive canvas allowing students to test class predictions across diverse visual domains (landscape, document, portrait, texture) with Softmax temperature calibration.
- **Walkthrough**: Deepens ResNet residual learning $\mathcal{H}(\mathbf{x}) = \mathcal{F}(\mathbf{x}) + \mathbf{x}$, Top-1 vs Top-5 accuracy, class imbalance mitigation, and confusion matrix metrics (Precision, Recall, Macro F1).
- **Notebook & Colab**: Integrates CIFAR-10 data loader with zero-leakage transforms (`RandomCrop(32, 4)`, `RandomHorizontalFlip()`) and `torchvision.models.resnet18` (11.17M params).
- **Student Troubleshooting**: Warns against calculating normalization statistics across the combined test set (data leakage).

### 3.3 Chapter 43: Transfer Learning (`TransferLearningExplorer.tsx`)
- **Web Demo**: Interactive visual comparison of training curves: Train from Scratch vs Frozen Feature Extractor vs Partial Fine-Tuning.
- **Walkthrough**: Formulates domain/task adaptation $(\mathcal{D}_S, \mathcal{T}_S) \to (\mathcal{D}_T, \mathcal{T}_T)$, discriminative learning rates ($\eta_l = \eta_{\text{base}} \cdot \gamma^{L-l}$), and Cosine Annealing with linear warmup.
- **Notebook & Colab**: Guides adaptation of `torchvision.models.mobilenet_v3_small` with frozen backbone (<0.1% trainable parameter ratio).
- **Student Troubleshooting**: Highlights the critical pitfall of forgetting to freeze running statistics in Batch Normalization (`model.eval()`).

### 3.4 Chapter 44: YOLO Object Detection (`YoloObjectDetectionLab.tsx`)
- **Web Demo**: Real-time Non-Maximum Suppression (NMS) interactive filtering on overlapping proposal bounding boxes with slider controls for confidence and IoU thresholds.
- **Walkthrough**: Details anchor-free coordinate decoding, Complete IoU (CIoU) loss derivation ($\mathcal{L} = 1 - \text{IoU} + \frac{\rho^2}{c^2} + \alpha v$), and 11-point/101-point COCO mAP@[0.5:0.95].
- **Notebook & Colab**: Specifies Ultralytics YOLOv8n nano model loading (`yolov8n.pt`, 6.2MB, AGPL-3.0) with latency tracking and bounding box export.
- **Student Troubleshooting**: Guides tuning of NMS IoU threshold ($0.45 - 0.50$) and confidence threshold ($0.25 - 0.35$).

### 3.5 Chapter 45: Semantic Segmentation (`DeepSegmentationLab.tsx`)
- **Web Demo**: Visualizes multi-class urban street scene segmentations (sky, road, vehicle) with adjustable mask opacity and live IoU/Dice metrics.
- **Walkthrough**: Compares U-Net skip-connection channel concatenation against DeepLab atrous/dilated convolution and Atrous Spatial Pyramid Pooling (ASPP).
- **Notebook & Colab**: Demonstrates `torchvision.models.segmentation.deeplabv3_mobilenet_v3_large` predicting 21 PASCAL VOC classes.
- **Student Troubleshooting**: Explains boundary contour handling using `ignore_index = 255` in Cross-Entropy Loss.

---

## 4. Verification Evidence & Quality Assurance

All verification commands executed cleanly:

```bash
# 1. Content & Curriculum Validation
npm run validate
-> Content validation PASSED: 60 chapters registered, 6 learning tracks validated.
-> Media validation PASSED: 110 verified asset attribution records.

# 2. Automated Node.js Unit Tests
npm test
-> 44/44 tests passed (0 failures, 365ms duration)

# 3. TypeScript Typecheck
npm run typecheck
-> PASSED (0 errors)

# 4. Vite Production Build
npm run build
-> PASSED (Vite production bundle built in 4.25s)

# 5. Notebooks Clean-Kernel Execution
python verify_notebooks.py
-> ALL 10 NOTEBOOKS PASSED CLEAN KERNEL EXECUTION! (Chapters 36–45)
```

---

## 5. Summary of Modified Files

1. `content/chapters/chapter-41/index.md`: Added Section 5 (Three-Tier Learning Modes, PyTorch MiniConvNet walkthrough, I/O specifications, troubleshooting).
2. `content/chapters/chapter-42/index.md`: Added Section 5 (ResNet-18 CIFAR-10 data pipeline, evaluation metrics, data leakage prevention).
3. `content/chapters/chapter-43/index.md`: Added Section 5 (MobileNetV3 transfer learning walkthrough, two-stage protocol, BatchNorm freeze best practices).
4. `content/chapters/chapter-44/index.md`: Added Section 5 (YOLOv8 inference walkthrough, bounding box formats, NMS threshold tuning).
5. `content/chapters/chapter-45/index.md`: Added Section 5 (DeepLabV3 segmentation walkthrough, boundary `ignore_index = 255`, memory management).
6. `docs/AD_01E_WEB_LEARNING_EXPERIENCE.md`: Comprehensive completion report.

---

## 6. Recommendations for Chapters 46–50

With Section 08 (Classical Computer Vision, Ch 36–40) and Section 09 (Deep Learning for Vision, Ch 41–45) now complete at **L2 (Undergraduate Complete) / Selected L3 (Advanced Depth)**, subsequent phases for **Section 10 (Advanced Vision & Multimodal Topics, Ch 46–50)** should apply this identical Three-Tier structure:
- **Chapter 46 (Vision Transformers & Attention)**
- **Chapter 47 (3D Vision, Point Clouds & NeRF)**
- **Chapter 48 (Visual SLAM & Spatial Odometry)**
- **Chapter 49 (Video Action Recognition & Spatiotemporal Networks)**
- **Chapter 50 (Self-Supervised & Foundation Models in Vision)**

