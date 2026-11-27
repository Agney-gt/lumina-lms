import type { Confidence, QuizType } from "./curriculum";

export type UnitStatus =
  | "not_started"
  | "in_progress"
  | "explained"
  | "can_do";

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  grade: number;
  initials: string;
}

export interface UnitProgressRecord {
  status: UnitStatus;
  lessonCompleted: boolean;
  visited: boolean;
  mastery: number;
  bestMcqPercent?: number;
  mcqAttempts: number;
  failedAttempts: number;
  revisionRecommended: boolean;
  lastActivityAt?: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  correct?: boolean;
  confidence?: Confidence;
  responseTimeMs?: number;
  difficultyLevel?: number;
  xpAwarded?: number;
  scoredPercent?: number;
  submittedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  unitId: string;
  conceptId: string;
  type: QuizType;
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "completed" | "expired";
  answers: AnswerRecord[];
  scorePercent?: number;
  passed?: boolean;
  xpEarned?: number;
  finalLevel?: number;
}

export interface LearningActivity {
  id: string;
  activityType: "lesson" | "mcq" | "descriptive" | "review" | "pdf";
  entityId: string;
  title: string;
  durationMinutes?: number;
  timestamp: string;
}

export interface ReviewItem {
  unitId: string;
  dueAt: string;
  status: "pending" | "completed";
  reason: string;
}

export interface DailyPlanItem {
  id: string;
  activityType: "lesson" | "mcq" | "descriptive" | "review" | "pdf";
  entityId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  href: string;
}

export interface LearnerSignals {
  preferredFormat: string;
  averageResponseTimeMs: number;
  hintsUsed: number;
  confidenceAccuracyGap: number;
  bestTimeOfDay: string;
}

export interface LearningStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
  dailyMinutes: Record<string, number>;
}

export interface PdfPosition {
  pdfId: string;
  lastPage: number;
  lastViewedAt: string;
}

export interface Recommendation {
  unitId: string;
  conceptId: string;
  unitTitle: string;
  conceptTitle: string;
  reason: string;
  kind: "review" | "resume" | "new";
  estimatedMinutes: number;
  href: string;
}
