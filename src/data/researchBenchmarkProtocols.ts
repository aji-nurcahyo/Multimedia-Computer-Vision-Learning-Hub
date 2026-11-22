/**
 * Standardized Benchmark Protocol Definitions (R01 through R06)
 * Formal evaluation rules conforming to international Computer Vision standards
 * 
 * NOTE: These are protocol definitions for reproducible research,
 * NOT claims of completed physical benchmark execution.
 */

export interface MetricDefinition {
  name: string;
  symbol: string;
  formula: string;
  range: string;
  higherIsBetter: boolean;
  description: string;
}

export interface BenchmarkProtocol {
  trackCode: string;
  trackId: string;
  trackTitle: string;
  domain: string;
  canonicalBenchmark: string;
  officialEvaluationLibrary: string;
  canonicalSplits: string[];
  primaryMetrics: MetricDefinition[];
  secondaryMetrics: MetricDefinition[];
  diagnosticTaxonomy: string[];
  protocolStatus: 'protocol_definition' | 'verified_numerical_example' | 'reproducible_template';
  reproducibilityNotes: string;
}

export const RESEARCH_BENCHMARK_PROTOCOLS: BenchmarkProtocol[] = [
  {
    trackCode: 'R01',
    trackId: 'r01',
    trackTitle: 'Intelligent Visual Detection & Recognition',
    domain: 'Object Detection & Instance Recognition',
    canonicalBenchmark: 'MS COCO 2017 Detection Benchmark',
    officialEvaluationLibrary: 'pycocotools.coco.COCOeval (Official CVPR/ICCV standard)',
    canonicalSplits: ['train2017 (118,287 images)', 'val2017 (5,000 images)', 'test-dev2017 (20,288 images - blind server)'],
    primaryMetrics: [
      {
        name: 'Mean Average Precision',
        symbol: 'mAP@[.50:.95]',
        formula: '\\frac{1}{10} \\sum_{T \\in \\{0.50, 0.55, \\dots, 0.95\\}} \\text{AP}_{T}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Primary COCO metric: average precision computed across 10 IoU thresholds from 0.50 to 0.95 with step 0.05, averaged across all 80 object categories.'
      },
      {
        name: 'Average Precision at IoU 50%',
        symbol: 'AP50',
        formula: '\\text{AP}_{T=0.50}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Pascal VOC-style metric evaluating precision-recall area under curve at standard IoU threshold of 0.50.'
      },
      {
        name: 'Average Precision at IoU 75%',
        symbol: 'AP75',
        formula: '\\text{AP}_{T=0.75}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Strict localization metric testing bounding box tight fit at IoU threshold of 0.75.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Small Objects AP',
        symbol: 'AP_S',
        formula: '\\text{AP} \\text{ for objects with area } < 32^2 \\text{ px}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures detection performance specifically on tiny objects (crucial for drone surveillance and remote sensing).'
      },
      {
        name: 'Medium Objects AP',
        symbol: 'AP_M',
        formula: '\\text{AP} \\text{ for objects with } 32^2 \\le \\text{area} \\le 96^2 \\text{ px}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures performance on medium-scale objects.'
      },
      {
        name: 'Large Objects AP',
        symbol: 'AP_L',
        formula: '\\text{AP} \\text{ for objects with area } > 96^2 \\text{ px}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures performance on large foreground objects.'
      },
      {
        name: 'Average Recall @ 100',
        symbol: 'AR_100',
        formula: '\\text{Maximum recall given at most 100 detections per image}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Upper bound on recall capacity across all object categories.'
      }
    ],
    diagnosticTaxonomy: [
      'Localization Error: 0.1 <= IoU < 0.5 with correct class',
      'Classification Error: IoU >= 0.5 with incorrect class label',
      'Both Loc & Cls: 0.1 <= IoU < 0.5 with incorrect class label',
      'Background False Alarm: IoU < 0.1 against any ground-truth',
      'Missed Object: Ground-truth unassigned by any detection box'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Standardized evaluation requires 101-point recall interpolation. Multi-seed evaluations (N >= 3) must report mean ± std on val2017.'
  },
  {
    trackCode: 'R02',
    trackId: 'r02',
    trackTitle: 'Robust Multi-Object Tracking & Motion',
    domain: 'Temporal Visual Object Association & Trajectory Analysis',
    canonicalBenchmark: 'MOT17 and MOT20 Challenge Benchmarks',
    officialEvaluationLibrary: 'TrackEval (Official IJCV 2021 Luiten et al. library)',
    canonicalSplits: ['MOT17 Training Set (7 sequences)', 'MOT17 Test Set (7 sequences - blind server)', 'DanceTrack Validation Set (25 sequences)'],
    primaryMetrics: [
      {
        name: 'Higher Order Tracking Accuracy',
        symbol: 'HOTA',
        formula: '\\sqrt{\\text{DetA} \\cdot \\text{AssA}} = \\sqrt{ \\frac{\\sum \\text{IoU}_{\\text{matches}}}{\\text{TP} + \\text{FP} + \\text{FN}} \\cdot \\text{AssA} }',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Unifies spatial detection accuracy (DetA) and temporal association accuracy (AssA) with balanced geometric weighting.'
      },
      {
        name: 'Identification F1 Score',
        symbol: 'IDF1',
        formula: '\\frac{2 \\text{IDTP}}{2 \\text{IDTP} + \\text{IDFP} + \\text{IDFN}}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures trajectory identity consistency across the entire video timeline without penalizing momentary spatial jitter.'
      },
      {
        name: 'Multiple Object Tracking Accuracy',
        symbol: 'MOTA',
        formula: '1 - \\frac{\\sum (\\text{FN}_t + \\text{FP}_t + \\text{IDSW}_t)}{\\sum \\text{GT}_t}',
        range: '(-\\infty, 100] %',
        higherIsBetter: true,
        description: 'Classic CLEAR MOT metric heavily emphasizing detection accuracy; penalizes False Positives, Misses, and ID Switches.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Detection Accuracy Score',
        symbol: 'DetA',
        formula: '\\frac{|\\text{TP}|}{|\\text{TP}| + |\\text{FP}| + |\\text{FN}|}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures spatial detection quality independent of identity association.'
      },
      {
        name: 'Association Accuracy Score',
        symbol: 'AssA',
        formula: '\\frac{1}{|\\text{TP}|} \\sum_{c \\in \\text{TP}} \\frac{|\\text{TPA}(c)|}{|\\text{TPA}(c)| + |\\text{FPA}(c)| + |\\text{FNA}(c)|}',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures ability to maintain continuous identity links across time for all detected objects.'
      },
      {
        name: 'Identity Switches',
        symbol: 'IDSW',
        formula: '\\sum_{t=1}^T \\mathbb{I}(\\text{ID}_{t} \\neq \\text{ID}_{t-1} \\mid \\text{Same Object})',
        range: '[0, \\infty) count',
        higherIsBetter: false,
        description: 'Total number of times a tracked trajectory mistakenly swaps identity with another object.'
      },
      {
        name: 'Trajectory Fragmentations',
        symbol: 'Frag',
        formula: '\\sum \\text{Interrupted track segments}',
        range: '[0, \\infty) count',
        higherIsBetter: false,
        description: 'Number of times tracking of a ground-truth trajectory is interrupted and resumed later.'
      }
    ],
    diagnosticTaxonomy: [
      'Cross-Over ID Switch: Targets crossing paths at close proximity (< 10 px)',
      'Post-Occlusion Discontinuity: Lost track after static occluder (> 30 frames)',
      'Camera Shake Drift: Ego-motion jitter confusing Kalman prediction',
      'Low-Confidence Ghost Track: False alarm trajectory initialized on clutter'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Requires public detection inputs (YOLOX-X) for fair comparison on public MOTChallenge track. Camera motion compensation (CMC) must be reported explicitly.'
  },
  {
    trackCode: 'R03',
    trackId: 'r03',
    trackTitle: 'Robust Perception in Adverse Environments',
    domain: 'Adverse Imaging, Optical Restoration & Uncertainty Calibration',
    canonicalBenchmark: 'RESIDE SOTS (Haze), Dark Zurich (Nighttime), ImageNet-C/COCO-C (Common Corruptions)',
    officialEvaluationLibrary: 'torchmetrics.image / clean-fidelity / scikit-image',
    canonicalSplits: ['RESIDE SOTS Outdoor (500 synthetic pairs)', 'Dark Zurich-test (151 night images)', 'COCO-C (5,000 images x 15 corruption types x 5 severity levels)'],
    primaryMetrics: [
      {
        name: 'Mean Corruption Error',
        symbol: 'mCE',
        formula: '\\frac{1}{15} \\sum_{c=1}^{15} \\frac{\\sum_{s=1}^5 E_{c, s}^{\\text{model}}}{\\sum_{s=1}^5 E_{c, s}^{\\text{baseline}}} \\times 100',
        range: '[0, \\infty) %',
        higherIsBetter: false,
        description: 'Evaluates robustness relative to standard baseline across 15 corruption categories (noise, blur, weather, digital).'
      },
      {
        name: 'Expected Calibration Error',
        symbol: 'ECE',
        formula: '\\sum_{b=1}^B \\frac{|B_b|}{N} |\\text{acc}(B_b) - \\text{conf}(B_b)|',
        range: '[0, 1] / [0, 100] %',
        higherIsBetter: false,
        description: 'Measures neural network overconfidence by comparing predicted confidence against true empirical accuracy across calibration bins.'
      },
      {
        name: 'Peak Signal-to-Noise Ratio',
        symbol: 'PSNR',
        formula: '10 \\log_{10} \\left( \\frac{\\text{MAX}_I^2}{\\text{MSE}} \\right)',
        range: '[0, \\infty) dB',
        higherIsBetter: true,
        description: 'Standard reconstruction fidelity metric for restored images relative to clear ground-truth.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Structural Similarity Index',
        symbol: 'SSIM',
        formula: '\\frac{(2\\mu_x\\mu_y + c_1)(2\\sigma_{xy} + c_2)}{(\\mu_x^2 + \\mu_y^2 + c_1)(\\sigma_x^2 + \\sigma_y^2 + c_2)}',
        range: '[-1, 1]',
        higherIsBetter: true,
        description: 'Evaluates human visual perceptual fidelity preserving structural luminance and contrast.'
      },
      {
        name: 'Learned Perceptual Image Patch Similarity',
        symbol: 'LPIPS',
        formula: '\\sum_l \\frac{1}{H_l W_l} \\sum_{h, w} \\| w_l \\odot (\\hat{y}_{hw}^l - y_{hw}^l) \\|_2^2',
        range: '[0, \\infty)',
        higherIsBetter: false,
        description: 'Deep feature perceptual distance assessing photorealistic restoration quality.'
      }
    ],
    diagnosticTaxonomy: [
      'Atmospheric Halo Artifact: Edge overshoot from transmission map misestimation',
      'Color Cast Distortion: White balance shift induced by scattered ambient light',
      'Under-Exposure Saturation: Non-linear clipping in extreme low-light regimes',
      'Overconfidence Drift: Highly confident wrong predictions on out-of-distribution fog'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Physical restoration and neural calibration must report both pixel fidelity (PSNR/SSIM) and downstream task performance (mAP retention under adverse weather).'
  },
  {
    trackCode: 'R04',
    trackId: 'r04',
    trackTitle: 'Vision-Centric Multimodal Perception',
    domain: 'Vision-Language Alignment, Cross-Modal Retrieval & Visual Grounding',
    canonicalBenchmark: 'ImageNet-1K Zero-Shot, Flickr30k Retrieval, RefCOCO Grounding',
    officialEvaluationLibrary: 'open_clip.evaluate / HuggingFace evaluate',
    canonicalSplits: ['ImageNet-1K Validation (50,000 images)', 'Flickr30k (1,000 test image-text pairs)', 'RefCOCO val/test (visual phrase grounding)'],
    primaryMetrics: [
      {
        name: 'Zero-Shot Top-1 Accuracy',
        symbol: 'Zero-Shot Top-1',
        formula: '\\frac{1}{N} \\sum_{i=1}^N \\mathbb{I}( \\arg\\max_c \\cos(f(I_i), g(T_c)) = y_i )',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures classification accuracy on unseen categories using prompt-engineered text embedding projections.'
      },
      {
        name: 'Cross-Modal Recall @ 1',
        symbol: 'Recall@1',
        formula: '\\frac{1}{N} \\sum_{i=1}^N \\mathbb{I}(\\text{rank}_{\\text{true}} = 1)',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Percentage of queries where the exact matched cross-modal partner ranks first.'
      },
      {
        name: 'Visual Grounding Recall @ 0.5 IoU',
        symbol: 'R@0.5',
        formula: '\\frac{1}{N} \\sum_{i=1}^N \\mathbb{I}(\\text{IoU}(\\hat{b}, b^*) \\ge 0.5)',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Measures ability to ground referring natural language expressions to exact bounding box coordinates.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Recall @ 5',
        symbol: 'Recall@5',
        formula: '\\frac{1}{N} \\sum_{i=1}^N \\mathbb{I}(\\text{rank}_{\\text{true}} \\le 5)',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Fraction of test queries retrieving correct match within top-5 candidates.'
      },
      {
        name: 'Mean Reciprocal Rank',
        symbol: 'MRR',
        formula: '\\frac{1}{N} \\sum_{i=1}^N \\frac{1}{\\text{rank}_i}',
        range: '[0, 1]',
        higherIsBetter: true,
        description: 'Harmonic mean of retrieval ranks reflecting holistic ranking quality.'
      }
    ],
    diagnosticTaxonomy: [
      'Polysemy Confusion: Words with multiple meanings aligned to wrong visual context',
      'Spatial Negation Failure: Models ignoring spatial prepositions (e.g. left vs right)',
      'Attribute Binding Error: Misattributing color/shape to adjacent incorrect object',
      'Modality Collapse: Dominant modality suppressing information from secondary sensor'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Prompt templates (e.g. "a photo of a {label}") must be explicitly documented; standard 80-prompt ensembling must be pinned for comparability.'
  },
  {
    trackCode: 'R05',
    trackId: 'r05',
    trackTitle: 'Efficient Computer Vision & Edge AI Systems',
    domain: 'Model Compression, Integer Quantization & Edge Hardware Acceleration',
    canonicalBenchmark: 'MLPerf Tiny Inference Vision Benchmark, MobileNet/YOLO Edge Benchmark',
    officialEvaluationLibrary: 'ONNX Runtime Profiler / PyTorch Benchmark Utility / TensorRT Profiler',
    canonicalSplits: ['ImageNet-1K (Validation)', 'COCO val2017 (Detection subset)', 'Embedded Edge Hardware Execution (Jetson, Raspberry Pi, Hailo)'],
    primaryMetrics: [
      {
        name: 'Latency Percentile 95',
        symbol: 'P95 Latency',
        formula: '\\text{Percentile}_{95}(\\{t_1, t_2, \\dots, t_N\\})',
        range: '[0, \\infty) ms',
        higherIsBetter: false,
        description: 'Tail latency under real-time streaming SLA: 95% of frames must execute faster than this threshold.'
      },
      {
        name: 'Arithmetic Intensity',
        symbol: 'I',
        formula: '\\frac{\\text{Total FLOPs}}{\\text{Total Memory Bytes Transferred}}',
        range: '[0, \\infty) \\text{ FLOPs/Byte}',
        higherIsBetter: true,
        description: 'Determines whether workload is memory-bandwidth bound or compute-bound on Roofline model.'
      },
      {
        name: 'Accuracy Retention Ratio',
        symbol: 'ARR',
        formula: '\\frac{\\text{Metric}_{\\text{quantized}}}{\\text{Metric}_{\\text{FP32}}} \\times 100',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Percentage of original floating-point accuracy preserved after INT8/INT4 quantization.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Model Storage Footprint',
        symbol: 'Size',
        formula: '\\text{Disk / Memory footprint in Megabytes}',
        range: '[0, \\infty) MB',
        higherIsBetter: false,
        description: 'Total weight binary size on disk.'
      },
      {
        name: 'Energy Per Inference',
        symbol: 'EPI',
        formula: '\\frac{\\text{Total Power (Watts)} \\times \\text{Time (s)}}{\\text{Frame Count}}',
        range: '[0, \\infty) mJ/frame',
        higherIsBetter: false,
        description: 'Energy efficiency metric for battery-powered IoT and drone systems.'
      }
    ],
    diagnosticTaxonomy: [
      'Quantization Overflow / Underflow: Range clipping destroying tail activations',
      'Memory Bandwidth Starvation: Low arithmetic intensity choking memory bus',
      'Kernel Launch Overhead: Small tensor layers dominated by CPU-GPU dispatch latency',
      'SRAM Cache Spill: Working memory exceeding local L1/L2 cache capacity'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Latency must be measured with warmup (>= 50 inferences) and synchronized timers. Thermal throttling status must be recorded during edge benchmarks.'
  },
  {
    trackCode: 'R06',
    trackId: 'r06',
    trackTitle: 'Spatial Intelligence & 3D Vision',
    domain: 'Multi-View Geometry, 3D Reconstruction & Spatial Odometry',
    canonicalBenchmark: 'KITTI Odometry Benchmark, Middlebury Multi-View Stereo, Tanks and Temples',
    officialEvaluationLibrary: 'evo trajectory evaluation / Open3D registration benchmarks',
    canonicalSplits: ['KITTI Sequences 00-10 (Training/Validation)', 'KITTI Sequences 11-21 (Test)', 'Tanks and Temples Advanced Sets'],
    primaryMetrics: [
      {
        name: 'Absolute Trajectory Error',
        symbol: 'ATE RMSE',
        formula: '\\sqrt{ \\frac{1}{N} \\sum_{i=1}^N \\| \\text{trans}(Q_i^{-1} S P_i) \\|^2 }',
        range: '[0, \\infty) \\text{ meters}',
        higherIsBetter: false,
        description: 'Evaluates global consistency of estimated 3D camera trajectory against ground-truth GPS/INS pose.'
      },
      {
        name: 'Relative Pose Error',
        symbol: 'RPE',
        formula: '\\sqrt{ \\frac{1}{N-\\Delta} \\sum_{i=1}^{N-\\Delta} \\| \\text{trans}((Q_i^{-1} Q_{i+\\Delta})^{-1} (P_i^{-1} P_{i+\\Delta})) \\|^2 }',
        range: '[0, \\infty) \\text{ meters/frame}',
        higherIsBetter: false,
        description: 'Measures local drift per frame or unit distance in visual odometry.'
      },
      {
        name: 'Mean Reprojection Error',
        symbol: 'MRE',
        formula: '\\frac{1}{N M} \\sum_{i=1}^N \\sum_{j=1}^M \\| x_{ij} - \\pi(K, R_i, t_i, X_j) \\|_2',
        range: '[0, \\infty) \\text{ px}',
        higherIsBetter: false,
        description: 'Geometric error measuring distance between observed 2D keypoints and projected 3D points after bundle adjustment.'
      }
    ],
    secondaryMetrics: [
      {
        name: 'Absolute Relative Error',
        symbol: 'AbsRel',
        formula: '\\frac{1}{|D|} \\sum_{p \\in D} \\frac{|d_p - \\hat{d}_p|}{d_p}',
        range: '[0, \\infty)',
        higherIsBetter: false,
        description: 'Standard monocular depth estimation relative error.'
      },
      {
        name: 'Threshold Accuracy Delta 1',
        symbol: '\\delta < 1.25',
        formula: '\\% \\text{ pixels where } \\max\\left( \\frac{d_p}{\\hat{d}_p}, \\frac{\\hat{d}_p}{d_p} \\right) < 1.25',
        range: '[0, 100] %',
        higherIsBetter: true,
        description: 'Percentage of depth predictions within 25% tolerance factor of ground-truth.'
      }
    ],
    diagnosticTaxonomy: [
      'Scale Drift: Scale factor distortion in uncalibrated monocular reconstruction',
      'Epipolar Ambiguity: Keypoint matches along degenerate epipolar lines',
      'Triangulation Collinearity: High uncertainty when optical baseline is near zero',
      'Textureless Surface Hole: Point cloud dropout on smooth reflective surfaces'
    ],
    protocolStatus: 'protocol_definition',
    reproducibilityNotes: 'Trajectory alignment requires Umeyama Sim(3) alignment for monocular pipelines, or SE(3) rigid alignment for stereo/RGB-D with scale.'
  }
];

