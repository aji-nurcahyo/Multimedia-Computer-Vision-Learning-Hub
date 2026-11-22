/**
 * Structured Research Experiment Manifest & Provenance Types (L4 Research-Ready)
 * Standards conforming to CVPR/ICCV reproducibility checklists and ISVWS 2026-2040
 */

export type EvidenceCategory =
  | 'verified_numerical_example'
  | 'educational_simulation'
  | 'executed_baseline'
  | 'authentic_benchmark_measurement'
  | 'expected_output_example'
  | 'unexecuted_optional_workflow';

export type ExperimentExecutionStatus =
  | 'planned'
  | 'in_progress'
  | 'reproduced'
  | 'verified'
  | 'deprecated';

export interface DatasetManifest {
  name: string;
  version: string;
  license: string;
  split: 'train' | 'val' | 'test' | 'trainval' | 'custom';
  sampleCount: number;
  annotationType: 'bounding_box' | 'trajectory_id' | 'semantic_mask' | 'depth_map' | 'text_caption';
  sensorProvenance: string;
  checksumSha256?: string;
  provenanceAuditPassed: boolean;
  citation: string;
}

export interface ModelManifest {
  name: string;
  architecture: string;
  version: string;
  backbone?: string;
  parameterCountM: number;
  flopsG: number;
  framework: string;
  checkpointUri?: string;
}

export interface HyperparameterConfig {
  optimizer: string;
  learningRate: number;
  weightDecay?: number;
  batchSize: number;
  epochs: number;
  inputResolution: [number, number];
  warmupEpochs?: number;
  lrScheduler?: string;
  customParams?: Record<string, string | number | boolean>;
}

export interface MetricResult {
  metricName: string;
  unit: string;
  singleRunValue?: number;
  multiSeedValues?: number[];
  mean?: number;
  std?: number;
  ci95?: [number, number];
  higherIsBetter: boolean;
}

export interface HardwareTelemetry {
  target: 'cpu' | 'gpu' | 'edge_tpu' | 'dsp' | 'browser_wasm';
  gpuModel?: string;
  vramCapacityGB?: number;
  driverVersion?: string;
  cudaVersion?: string;
  powerBudgetWatts?: number;
}

export interface ResearchExperimentManifest {
  experimentId: string;
  trackId: 'r01' | 'r02' | 'r03' | 'r04' | 'r05' | 'r06';
  trackCode: string;
  title: string;
  objective: string;
  hypothesis: string;
  evidenceCategory: EvidenceCategory;
  executionStatus: ExperimentExecutionStatus;
  randomSeeds: number[];
  isDeterministic: boolean;
  dataset: DatasetManifest;
  model: ModelManifest;
  hyperparameters: HyperparameterConfig;
  hardware: HardwareTelemetry;
  metrics: MetricResult[];
  knownLimitations: string[];
  reproducibilityChecklistPassed: boolean;
  artifactPaths: {
    configJson?: string;
    logFile?: string;
    notebookPath?: string;
    weightsPath?: string;
    telemetryJson?: string;
  };
  author: string;
  institution: string;
  createdAt: string;
  updatedAt: string;
}

