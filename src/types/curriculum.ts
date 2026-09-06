export interface Lesson {
  id: string;
  title: string;
  description: string;
  isInferred?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isCollapsed?: boolean;
  isInferred?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  isCollapsed?: boolean;
  isInferred?: boolean;
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  source?: 'manual' | 'ai-generated' | 'sample';
  fileName?: string;
  lastModified?: number;
}

export interface CurriculumStats {
  totalModules: number;
  totalTopics: number;
  totalLessons: number;
  inferredCount: number;
}

export interface ParseCurriculumResponse {
  success: boolean;
  curriculum?: Curriculum;
  error?: string;
  warning?: string;
  inferredCount?: number;
}
