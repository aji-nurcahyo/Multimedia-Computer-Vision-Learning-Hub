import advancedModulesData from '../../content/curriculum/advanced-modules.json';
import researchTracksData from '../../content/curriculum/research-tracks.json';

export interface AdvancedTopic {
  topicNumber: number;
  title: string;
  mathematicalFocus: string;
}

export interface InteractiveLabMeta {
  id: string;
  title: string;
  tier: 'Tier-A' | 'Tier-B' | 'Tier-C';
  status: 'planned' | 'in_development' | 'published' | 'verified';
}

export interface NotebookMeta {
  title: string;
  path: string;
  colabUrl?: string;
  status: 'planned' | 'in_development' | 'published' | 'verified';
}

export interface ExperimentSpecsMeta {
  targetDomain: string;
  telemetryPath: string;
  status: 'planned' | 'in_development' | 'published' | 'verified';
}

export interface AdvancedPrerequisites {
  coreChapters: string[];
  advancedModules: string[];
  mathCompetencies: string[];
  programmingCompetencies: string[];
}

export interface AdvancedModule {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  level: string;
  pillar: 1 | 2 | 3 | 4;
  pillarName: string;
  status: 'planned' | 'in_development' | 'published' | 'verified';
  estimatedHours: number;
  description: string;
  prerequisites: AdvancedPrerequisites;
  learningObjectives: string[];
  topics: AdvancedTopic[];
  benchmarks: string[];
  interactiveLab: InteractiveLabMeta;
  notebooks: NotebookMeta[];
  experimentSpecs: ExperimentSpecsMeta;
}

export interface ResearchMilestone {
  phase: string;
  title: string;
  deliverable: string;
}

export interface StatisticalProtocol {
  minSeeds: number;
  reporting: string;
  significanceMethod: string;
}

export interface ResearchTrackPrerequisites {
  coreChapters: string[];
  advancedModules: string[];
}

export interface ResearchTrack {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  pillar: 1 | 2 | 3 | 4;
  pillarName: string;
  category: 'Primary Academic Anchor' | 'Strategic Extension' | 'Optional Specialization';
  status: 'planned' | 'in_development' | 'published' | 'verified';
  description: string;
  prerequisites: ResearchTrackPrerequisites;
  primaryBenchmark: string;
  candidateDatasets: string[];
  standardMetrics: string[];
  statisticalProtocol: StatisticalProtocol;
  milestones: ResearchMilestone[];
  targetVenues: string[];
  commonMethodologyStages: string[];
  experimentSpecs: ExperimentSpecsMeta;
}

export const advancedModules: AdvancedModule[] = advancedModulesData as AdvancedModule[];
export const researchTracks: ResearchTrack[] = researchTracksData as ResearchTrack[];

// Text and JSON imports via Vite
const textFiles = import.meta.glob('../../content/**/*.{md,py}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const jsonFiles = import.meta.glob('../../content/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export function getAdvancedText(moduleId: string, filename: string): string {
  const path = `../../content/advanced/${moduleId}/${filename}`;
  return textFiles[path] || '';
}

export function getAdvancedJson<T>(moduleId: string, filename: string): T | null {
  const path = `../../content/advanced/${moduleId}/${filename}`;
  return (jsonFiles[path] as T) || null;
}

export function getResearchText(trackId: string, filename: string): string {
  const path = `../../content/research/${trackId}/${filename}`;
  return textFiles[path] || '';
}

export function getResearchJson<T>(trackId: string, filename: string): T | null {
  const path = `../../content/research/${trackId}/${filename}`;
  return (jsonFiles[path] as T) || null;
}

export function getAdvancedModuleById(id: string): AdvancedModule | undefined {
  return advancedModules.find((m) => m.id === id);
}

export function getAdvancedModuleByCode(code: string): AdvancedModule | undefined {
  return advancedModules.find((m) => m.code.toLowerCase() === code.toLowerCase());
}

export function getResearchTrackById(id: string): ResearchTrack | undefined {
  return researchTracks.find((t) => t.id === id);
}

export function getResearchTrackByCode(code: string): ResearchTrack | undefined {
  return researchTracks.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

export function getModulesByPillar(pillar: number): AdvancedModule[] {
  return advancedModules.filter((m) => m.pillar === pillar);
}

export function getTracksByCategory(category: string): ResearchTrack[] {
  return researchTracks.filter((t) => t.category === category);
}

export function getTracksByPillar(pillar: number): ResearchTrack[] {
  return researchTracks.filter((t) => t.pillar === pillar);
}

export function getAdvancedModulesForCoreChapter(chapterId: string): AdvancedModule[] {
  return advancedModules.filter((m) => m.prerequisites.coreChapters.includes(chapterId));
}

export function getResearchTracksForCoreChapter(chapterId: string): ResearchTrack[] {
  return researchTracks.filter((t) => t.prerequisites.coreChapters.includes(chapterId));
}

export function getResearchTracksForAdvancedModule(moduleId: string): ResearchTrack[] {
  return researchTracks.filter((t) => t.prerequisites.advancedModules.includes(moduleId));
}

