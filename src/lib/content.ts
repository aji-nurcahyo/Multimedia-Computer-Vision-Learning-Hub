import masterCurriculumData from '../../content/curriculum/master-curriculum.json' with { type: 'json' };
import learningTracksData from '../../content/curriculum/learning-tracks.json' with { type: 'json' };

export interface ResourceInfo {
  status: 'available' | 'unavailable';
  path: string;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  prerequisites: string[];
  tracks: string[];
  keywords: string[];
  status: 'draft' | 'in_review' | 'published' | 'archived';
  version: string;
  lastUpdated: string;
  directory: string;
  description: string;
  learningObjectives: string[];
  resources: {
    reading: ResourceInfo;
    slides: ResourceInfo;
    practice: ResourceInfo;
    exercises: ResourceInfo;
    quiz: ResourceInfo;
    references: ResourceInfo;
    media: ResourceInfo;
  };
}

export interface Section {
  id: string;
  title: string;
  chapters: {
    id: string;
    title: string;
    difficulty: string;
    duration: number;
    tracks: string[];
  }[];
}

export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  prerequisites: string[];
  chapterIds: string[];
}

export interface SlideData {
  id: number | string;
  title: string;
  lead?: string;
  subtitle?: string;
  body?: string;
  content?: string;
  bullets?: string[];
  diagram?: string | null;
  presenter?: string;
  institution?: string;
  notes?: string;
}

export function getSlideBodyText(slide: SlideData): string {
  if (slide.body && slide.body.trim()) return slide.body;
  if (slide.content && slide.content.trim()) return slide.content;
  if (slide.bullets && Array.isArray(slide.bullets) && slide.bullets.length > 0) {
    return slide.bullets.map((b) => `- ${b}`).join('\n');
  }
  return '';
}

export function getSlideLeadText(slide: SlideData): string {
  if (slide.lead && slide.lead.trim()) return slide.lead;
  if (slide.subtitle && slide.subtitle.trim()) return slide.subtitle;
  if (slide.institution && slide.presenter) {
    return `${slide.institution} · ${slide.presenter}`;
  }
  return '';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExerciseItem {
  id: string;
  title: string;
  difficulty: string;
  instruction: string;
  starterCode: string;
  solution: string;
}

export interface AcademicReference {
  id: string;
  title: string;
  authors: string;
  year: number;
  publisher: string;
  url: string;
  type: string;
  annotation?: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: string;
  path: string;
  creator: string;
  license: string;
  source: string;
  attribution: string;
}

// Global text and JSON imports via Vite
// In Vite, import.meta.glob is statically transformed at build-time into module maps.
// Wrapping in try/catch safely handles Node.js test execution where Vite is not running.
let textFiles: Record<string, string> = {};
let jsonFiles: Record<string, unknown> = {};

try {
  textFiles = import.meta.glob('../../content/**/*.{md,py,ipynb}', {
    eager: true,
    query: '?raw',
    import: 'default',
  });
  jsonFiles = import.meta.glob('../../content/**/*.json', {
    eager: true,
    import: 'default',
  });
} catch {
  textFiles = {};
  jsonFiles = {};
}

export const masterCurriculum = masterCurriculumData as {
  institution: string;
  author: string;
  tagline: string;
  sections: Section[];
  chapters: Chapter[];
};

export const learningTracks = learningTracksData as LearningTrack[];

export function getChapterById(id: string): Chapter | undefined {
  return masterCurriculum.chapters.find((c) => c.id === id);
}

export function getChapterText(chapterId: string, resourcePath: string): string {
  const path = `../../content/chapters/chapter-${chapterId}/${resourcePath}`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/chapters/chapter-${chapterId}/${resourcePath}`);
  }
  return '';
}

export function getChapterJson<T>(chapterId: string, resourcePath: string): T | null {
  const path = `../../content/chapters/chapter-${chapterId}/${resourcePath}`;
  if (jsonFiles[path]) return (jsonFiles[path] as T);
  if (typeof (globalThis as any).readContentJson === 'function') {
    return (globalThis as any).readContentJson(`content/chapters/chapter-${chapterId}/${resourcePath}`);
  }
  return null;
}

export function getChapterNotebook(chapterId: string): string {
  const path = `../../content/chapters/chapter-${chapterId}/notebooks/chapter-${chapterId}-lab.ipynb`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/chapters/chapter-${chapterId}/notebooks/chapter-${chapterId}-lab.ipynb`);
  }
  return '';
}

export function getAdvancedText(advId: string, resourcePath: string): string {
  const path = `../../content/advanced/${advId}/${resourcePath}`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/advanced/${advId}/${resourcePath}`);
  }
  return '';
}

export function getAdvancedJson<T>(advId: string, resourcePath: string): T | null {
  const path = `../../content/advanced/${advId}/${resourcePath}`;
  if (jsonFiles[path]) return (jsonFiles[path] as T);
  if (typeof (globalThis as any).readContentJson === 'function') {
    return (globalThis as any).readContentJson(`content/advanced/${advId}/${resourcePath}`);
  }
  return null;
}

export function getAdvancedNotebook(advId: string): string {
  const path = `../../content/advanced/${advId}/notebooks/${advId}-lab.ipynb`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/advanced/${advId}/notebooks/${advId}-lab.ipynb`);
  }
  return '';
}

export function getResearchText(trackId: string, resourcePath: string): string {
  const path = `../../content/research/${trackId}/${resourcePath}`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/research/${trackId}/${resourcePath}`);
  }
  return '';
}

export function getResearchJson<T>(trackId: string, resourcePath: string): T | null {
  const path = `../../content/research/${trackId}/${resourcePath}`;
  if (jsonFiles[path]) return (jsonFiles[path] as T);
  if (typeof (globalThis as any).readContentJson === 'function') {
    return (globalThis as any).readContentJson(`content/research/${trackId}/${resourcePath}`);
  }
  return null;
}

export function getResearchNotebook(trackId: string): string {
  const path = `../../content/research/${trackId}/notebooks/${trackId}-research-baseline.ipynb`;
  if (textFiles[path]) return textFiles[path];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(`content/research/${trackId}/notebooks/${trackId}-research-baseline.ipynb`);
  }
  return '';
}

