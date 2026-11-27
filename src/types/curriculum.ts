export type ContentMode = "visual" | "text";

export type Confidence = "guessing" | "fairly_sure" | "certain";

export type QuizType = "mcq" | "descriptive";

export type ContentBlock =
  | { id: string; type: "heading"; level: 2 | 3 | 4; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "math"; value: string; display?: boolean }
  | { id: string; type: "image"; src: string; alt: string; caption?: string }
  | {
      id: string;
      type: "worked_example";
      title: string;
      content: ContentBlock[];
    }
  | { id: string; type: "key_idea"; text: string }
  | {
      id: string;
      type: "callout";
      variant: "info" | "tip";
      title?: string;
      text: string;
    }
  | {
      id: string;
      type: "quick_check";
      questionId: string;
      question: string;
      options: QuizOption[];
      correctOptionId: string;
      explanation: string;
    }
  | {
      id: string;
      type: "table";
      headers: string[];
      rows: string[][];
      caption?: string;
    }
  | { id: string; type: "diagram"; label: string; description: string };

export interface QuizOption {
  id: string;
  text: string;
}

export interface LessonSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  contentModes: ContentMode[];
  sections: LessonSection[];
}

export interface Subject {
  id: string;
  name: string;
  grade: number;
  description: string;
  publisher: string;
  bookId?: string;
  book?: string;
  parts: string[];
  order: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  chapterNumber: number;
  description: string;
  order: number;
  pdfId?: string;
  pageRange?: { start: number; end: number };
  prerequisites: string[];
  conceptIds: string[];
}

export interface Concept {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  order: number;
  unitIds: string[];
  prerequisites: string[];
  textbookPages: { start: number; end: number };
  learningObjectives: string[];
}

export interface Unit {
  id: string;
  conceptId: string;
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  lessonId: string;
  activityIds: string[];
  pageReferences: { start: number; end: number }[];
  prerequisites: string[];
}

export interface Question {
  id: string;
  type: QuizType;
  prompt: string;
  options?: QuizOption[];
  correctOptionId?: string;
  explanation?: string;
  difficulty?: number;
  marks: number;
  rubricId?: string;
  keyTerms?: string[];
  modelAnswer?: string;
}

export interface RubricCategory {
  id: string;
  label: string;
  weight: number;
  hint: string;
}

export interface Rubric {
  id: string;
  title: string;
  categories: RubricCategory[];
}

export interface Quiz {
  id: string;
  unitId: string;
  conceptId: string;
  type: QuizType;
  title: string;
  instructions: string;
  questions: Question[];
  timeLimitSeconds?: number;
  difficulty?: {
    enabled: boolean;
    startLevel: number;
    minLevel: number;
    maxLevel: number;
  };
  passingThreshold: number;
  scoringPolicy: {
    xpPerCorrect: number;
    confidenceMultipliers: Record<Confidence, number>;
  };
  rubricId?: string;
}

export interface PdfPageMapping {
  pages: { start: number; end: number };
  label: string;
  unitIds: string[];
}

export interface PdfMapping {
  pdfId: string;
  chapterId: string;
  sourceType: "local" | "hosted";
  assetPath?: string;
  sourceUrl?: string;
  totalPages: number;
  pageMappings: PdfPageMapping[];
  version: string;
}

export interface AppConfig {
  schemaVersion: string;
  learner: { defaultUserId: string };
  mastery: {
    lessonWeight: number;
    quizWeight: number;
    passingScore: number;
    canDoThreshold: number;
    conceptMethod: "average";
    chapterMethod: "average";
    subjectMethod: "average";
  };
  unlocking: {
    requirePreviousUnit: boolean;
    requirePreviousConceptExplained: boolean;
    quizRequiresLessonVisited: boolean;
  };
  assessment: {
    adaptive: {
      enabled: boolean;
      startLevel: number;
      minLevel: number;
      maxLevel: number;
    };
    scoring: {
      xpPerCorrect: number;
      confidenceMultipliers: Record<Confidence, number>;
    };
    reviewScheduling: { guessingCorrectDays: number; wrongAnswerDays: number };
    revisionAfterFailures: number;
    examMode: { allowPdf: boolean };
  };
  features: {
    copilot: boolean;
    audio: boolean;
    voice: boolean;
    mindmap: boolean;
    pdfReader: boolean;
  };
  recommendation: { reviewFirst: boolean; resumeFirst: boolean };
}
