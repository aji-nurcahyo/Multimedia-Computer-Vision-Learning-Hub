import masterCurriculumData from '../../content/curriculum/master-curriculum.json';
import learningTracksData from '../../content/curriculum/learning-tracks.json';

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
  id: number;
  title: string;
  lead?: string;
  body: string;
  notes?: string;
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
const textFiles = import.meta.glob('../../content/**/*.{md,py}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const jsonFiles = import.meta.glob('../../content/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

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
  return textFiles[path] || '';
}

export function getChapterJson<T>(chapterId: string, resourcePath: string): T | null {
  const path = `../../content/chapters/chapter-${chapterId}/${resourcePath}`;
  return (jsonFiles[path] as T) || null;
}

