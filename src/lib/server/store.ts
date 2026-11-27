import { randomUUID } from "crypto";

import {
  computeUnitMastery,
  averageMastery,
} from "@/lib/calculations/mastery";
import { computeRecommendation, defaultProgress } from "@/lib/calculations/recommendations";
import { deriveUnitStatus } from "@/lib/calculations/status";
import {
  getChapter,
  getConcept,
  getConceptsForChapter,
  getAppConfig,
  getQuiz,
  getRubric,
  getUnit,
  getUnitsForConcept,
  getChaptersForSubject,
} from "@/lib/content/loader";
import type {
  AnswerRecord,
  DailyPlanItem,
  LearnerProfile,
  LearnerSignals,
  LearningActivity,
  LearningStreak,
  PdfPosition,
  QuizAttempt,
  Recommendation,
  ReviewItem,
  UnitProgressRecord,
} from "@/types/learner";
import type { Confidence, Question, Quiz, Rubric } from "@/types/curriculum";

interface LearnerData {
  profile: LearnerProfile;
  xpTotal: number;
  unitProgress: Record<string, UnitProgressRecord>;
  attempts: QuizAttempt[];
  activityLog: LearningActivity[];
  reviewSchedule: ReviewItem[];
  streak: LearningStreak;
  pdfProgress: Record<string, PdfPosition>;
}

interface StoreShape {
  data: LearnerData;
  attemptCounter: number;
}

const globalRef = globalThis as unknown as { __luminaStore?: StoreShape };

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(days: number, hourOfDay = 16): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hourOfDay, 12, 0, 0);
  return d;
}

function seed(): LearnerData {
  const p = (over: Partial<UnitProgressRecord> = {}): UnitProgressRecord => ({
    ...defaultProgress(),
    ...over,
  });

  const dailyMinutes: Record<string, number> = {};
  const minutesByDay: [number, number][] = [
    [13, 20], [12, 35], [11, 0], [10, 45], [9, 25], [8, 0], [7, 30],
    [6, 40], [5, 35], [4, 30], [3, 0], [2, 25], [1, 45], [0, 30],
  ];
  for (const [days, minutes] of minutesByDay) {
    dailyMinutes[dateKey(daysAgo(days))] = minutes;
  }

  const activity: LearningActivity[] = [
    { id: randomUUID(), activityType: "lesson", entityId: "parity-basics", title: "Even and odd numbers", durationMinutes: 12, timestamp: daysAgo(10).toISOString() },
    { id: randomUUID(), activityType: "mcq", entityId: "mcq-parity-basics", title: "MCQ: Even and odd numbers", durationMinutes: 5, timestamp: daysAgo(10, 17).toISOString() },
    { id: randomUUID(), activityType: "lesson", entityId: "sum-difference-parity", title: "Parity of sums and differences", durationMinutes: 14, timestamp: daysAgo(9).toISOString() },
    { id: randomUUID(), activityType: "mcq", entityId: "mcq-sum-difference-parity", title: "MCQ: Parity of sums and differences", durationMinutes: 6, timestamp: daysAgo(9, 17).toISOString() },
    { id: randomUUID(), activityType: "lesson", entityId: "plus-minus-signs", title: "Plus-minus signs", durationMinutes: 15, timestamp: daysAgo(8).toISOString() },
    { id: randomUUID(), activityType: "mcq", entityId: "mcq-plus-minus-signs", title: "MCQ: Plus-minus signs", durationMinutes: 6, timestamp: daysAgo(8, 17).toISOString() },
    { id: randomUUID(), activityType: "pdf", entityId: "number-play-pdf", title: "Read Number Play pages 10–12", durationMinutes: 18, timestamp: daysAgo(6).toISOString() },
    { id: randomUUID(), activityType: "lesson", entityId: "parity-games", title: "Parity in games and puzzles", durationMinutes: 12, timestamp: daysAgo(5).toISOString() },
    { id: randomUUID(), activityType: "mcq", entityId: "mcq-parity-games", title: "MCQ: Parity in games and puzzles", durationMinutes: 6, timestamp: daysAgo(5, 17).toISOString() },
    { id: randomUUID(), activityType: "descriptive", entityId: "descriptive-plus-minus-signs", title: "Descriptive: Explain the plus-minus puzzle", durationMinutes: 12, timestamp: daysAgo(4).toISOString() },
    { id: randomUUID(), activityType: "lesson", entityId: "division-with-remainders", title: "Division with remainders", durationMinutes: 13, timestamp: daysAgo(2).toISOString() },
    { id: randomUUID(), activityType: "mcq", entityId: "mcq-division-with-remainders", title: "MCQ: Division with remainders", durationMinutes: 5, timestamp: daysAgo(2, 17).toISOString() },
    { id: randomUUID(), activityType: "lesson", entityId: "same-remainder-numbers", title: "Numbers with the same remainder", durationMinutes: 8, timestamp: daysAgo(1).toISOString() },
    { id: randomUUID(), activityType: "pdf", entityId: "number-play-pdf", title: "Read Number Play pages 12–13", durationMinutes: 11, timestamp: daysAgo(1, 18).toISOString() },
  ];

  return {
    profile: {
      id: "student-demo",
      name: "Aditi Sharma",
      email: "aditi.sharma@lumina.edu",
      grade: 8,
      initials: "AS",
    },
    xpTotal: 170,
    unitProgress: {
      "parity-basics": p({ lessonCompleted: true, visited: true, bestMcqPercent: 100, mcqAttempts: 1, lastActivityAt: daysAgo(10).toISOString() }),
      "sum-difference-parity": p({ lessonCompleted: true, visited: true, bestMcqPercent: 67, mcqAttempts: 1, lastActivityAt: daysAgo(9).toISOString() }),
      "plus-minus-signs": p({ lessonCompleted: true, visited: true, bestMcqPercent: 100, mcqAttempts: 1, lastActivityAt: daysAgo(8).toISOString() }),
      "parity-games": p({ lessonCompleted: true, visited: true, bestMcqPercent: 67, mcqAttempts: 1, lastActivityAt: daysAgo(5).toISOString() }),
      "division-with-remainders": p({ lessonCompleted: true, visited: true, bestMcqPercent: 67, mcqAttempts: 1, lastActivityAt: daysAgo(2).toISOString() }),
      "same-remainder-numbers": p({ visited: true, lastActivityAt: daysAgo(1).toISOString() }),
    },
    attempts: [],
    activityLog: activity,
    reviewSchedule: [
      {
        unitId: "parity-games",
        dueAt: daysAgo(1).toISOString(),
        status: "pending",
        reason: "A correct answer was marked with Guessing confidence",
      },
      {
        unitId: "division-with-remainders",
        dueAt: daysAgo(-2).toISOString(),
        status: "pending",
        reason: "Spaced review scheduled after the last attempt",
      },
    ],
    streak: {
      current: 4,
      longest: 6,
      lastActiveDate: dateKey(daysAgo(1)),
      dailyMinutes,
    },
    pdfProgress: {
      "number-play-pdf": {
        pdfId: "number-play-pdf",
        lastPage: 12,
        lastViewedAt: daysAgo(1, 18).toISOString(),
      },
    },
  };
}

function getStore(): StoreShape {
  if (!globalRef.__luminaStore) {
    globalRef.__luminaStore = { data: seed(), attemptCounter: 0 };
  }
  return globalRef.__luminaStore;
}

export function getLearnerData(): LearnerData {
  return getStore().data;
}

function recomputeUnit(unitId: string) {
  const store = getStore();
  const progress = store.data.unitProgress[unitId] ?? defaultProgress();
  progress.mastery = computeUnitMastery(progress);
  const unit = getUnit(unitId);
  if (unit) {
    progress.status = deriveUnitStatus(progress, unit.prerequisites, store.data.unitProgress);
  }
  store.data.unitProgress[unitId] = progress;
}

function touchStreak() {
  const store = getStore();
  const today = dateKey(new Date());
  const yesterday = dateKey(daysAgo(1));
  if (store.data.streak.lastActiveDate === today) return;
  store.data.streak.current =
    store.data.streak.lastActiveDate === yesterday
      ? store.data.streak.current + 1
      : 1;
  store.data.streak.lastActiveDate = today;
  store.data.streak.longest = Math.max(
    store.data.streak.longest,
    store.data.streak.current
  );
}

function logActivity(
  activityType: LearningActivity["activityType"],
  entityId: string,
  title: string,
  durationMinutes?: number
) {
  const store = getStore();
  store.data.activityLog.push({
    id: randomUUID(),
    activityType,
    entityId,
    title,
    durationMinutes,
    timestamp: new Date().toISOString(),
  });
  const today = dateKey(new Date());
  store.data.streak.dailyMinutes[today] =
    (store.data.streak.dailyMinutes[today] ?? 0) + (durationMinutes ?? 5);
  touchStreak();
}

function scheduleReview(unitId: string, daysFromNow: number, reason: string) {
  const store = getStore();
  const existing = store.data.reviewSchedule.find(
    (r) => r.unitId === unitId && r.status === "pending"
  );
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + daysFromNow);
  dueAt.setHours(9, 0, 0, 0);
  if (existing) {
    existing.dueAt = dueAt.toISOString();
    existing.reason = reason;
  } else {
    store.data.reviewSchedule.push({ unitId, dueAt: dueAt.toISOString(), status: "pending", reason });
  }
}

export function markLessonVisited(unitId: string): void {
  const store = getStore();
  const progress = store.data.unitProgress[unitId] ?? defaultProgress();
  if (!progress.visited) progress.visited = true;
  progress.lastActivityAt = new Date().toISOString();
  store.data.unitProgress[unitId] = progress;
  recomputeUnit(unitId);
}

export function markLessonCompleted(unitId: string): void {
  const store = getStore();
  const progress = store.data.unitProgress[unitId] ?? defaultProgress();
  const unit = getUnit(unitId);
  const firstCompletion = !progress.lessonCompleted;
  progress.lessonCompleted = true;
  progress.visited = true;
  progress.lastActivityAt = new Date().toISOString();
  store.data.unitProgress[unitId] = progress;
  recomputeUnit(unitId);
  if (firstCompletion && unit) {
    logActivity("lesson", unitId, unit.title, unit.estimatedDurationMinutes);
  }
}

export function startAttempt(quizId: string, userId: string): QuizAttempt {
  const store = getStore();
  const quiz = getQuiz(quizId);
  if (!quiz) throw new Error(`Quiz not found: ${quizId}`);

  const existing = store.data.attempts.find(
    (a) => a.quizId === quizId && a.status === "in_progress"
  );
  if (existing) return existing;

  store.attemptCounter += 1;
  const attempt: QuizAttempt = {
    id: `att-${String(store.attemptCounter).padStart(4, "0")}`,
    quizId,
    userId,
    unitId: quiz.unitId,
    conceptId: quiz.conceptId,
    type: quiz.type,
    startedAt: new Date().toISOString(),
    status: "in_progress",
    answers: [],
  };
  store.data.attempts.push(attempt);
  markLessonVisited(quiz.unitId);
  return attempt;
}

export function getAttempt(attemptId: string): QuizAttempt | undefined {
  return getStore().data.attempts.find((a) => a.id === attemptId);
}

export function scoreMcqAnswer(
  attempt: QuizAttempt,
  quiz: Quiz,
  question: Question,
  input: { selectedOptionId: string; confidence: Confidence; responseTimeMs: number }
): AnswerRecord {
  const config = getAppConfig();
  const correct = question.correctOptionId === input.selectedOptionId;
  const multiplier = correct
    ? (quiz.scoringPolicy.confidenceMultipliers[input.confidence] ?? 1)
    : 0;
  const xpAwarded = correct
    ? Math.round(quiz.scoringPolicy.xpPerCorrect * multiplier)
    : 0;

  const record: AnswerRecord = {
    questionId: question.id,
    selectedOptionId: input.selectedOptionId,
    correct,
    confidence: input.confidence,
    responseTimeMs: input.responseTimeMs,
    difficultyLevel: question.difficulty,
    xpAwarded,
    submittedAt: new Date().toISOString(),
  };

  const store = getStore();
  attempt.answers.push(record);
  store.data.xpTotal += xpAwarded;

  const unitProgress = store.data.unitProgress[attempt.unitId] ?? defaultProgress();
  unitProgress.visited = true;
  unitProgress.lastActivityAt = record.submittedAt;
  store.data.unitProgress[attempt.unitId] = unitProgress;

  if (correct && input.confidence === "guessing") {
    scheduleReview(
      attempt.unitId,
      config.assessment.reviewScheduling.guessingCorrectDays,
      "A correct answer was marked with Guessing confidence"
    );
  } else if (!correct) {
    scheduleReview(
      attempt.unitId,
      config.assessment.reviewScheduling.wrongAnswerDays,
      "Revision needed after an incorrect answer"
    );
  }

  logActivity("mcq", quiz.id, quiz.title, 2);
  return record;
}

export function scoreDescriptiveAnswer(
  attempt: QuizAttempt,
  quiz: Quiz,
  question: Question,
  input: { answerText: string; responseTimeMs: number }
): { record: AnswerRecord; perCategory: { id: string; label: string; ratio: number; feedback: string }[] } {
  const rubric: Rubric | undefined = question.rubricId
    ? getRubric(question.rubricId)
    : undefined;
  const categories = rubric?.categories ?? [];
  const answer = input.answerText.toLowerCase();
  const wordCount = input.answerText.trim().split(/\s+/).filter(Boolean).length;
  const hasDigits = /\d/.test(input.answerText);
  const hasExampleLanguage = /(example|instance|suppose|take|consider)/.test(answer);
  const hasSymbolic = /[=×÷+\-]/.test(input.answerText) || /\bk\b/.test(answer);

  const perCategory = categories.map((category) => {
    let ratio = 0;
    let feedback = "";
    if (category.id === "concept-accuracy") {
      const terms = question.keyTerms ?? [];
      const found = terms.filter((t) => answer.includes(t.toLowerCase())).length;
      ratio = terms.length > 0 ? found / terms.length : 0.5;
      feedback =
        ratio >= 0.6
          ? "Key ideas from the topic are present."
          : "Cover more of the key terms and rules from the lesson.";
    } else if (category.id === "example-usage") {
      ratio = (hasDigits ? 0.6 : 0) + (hasExampleLanguage ? 0.4 : 0);
      feedback =
        ratio >= 0.6
          ? "A concrete numeric example supports the explanation."
          : "Add a worked numeric example to strengthen the answer.";
    } else if (category.id === "clarity") {
      ratio = wordCount >= 60 ? 1 : wordCount >= 30 ? 0.7 : wordCount >= 15 ? 0.4 : 0.15;
      feedback =
        wordCount >= 30
          ? "The answer is organised in clear steps."
          : "Structure the answer in short, ordered steps.";
    } else {
      ratio = hasSymbolic ? 1 : hasDigits ? 0.4 : 0;
      feedback =
        hasSymbolic
          ? "A symbolic or general argument is included."
          : "Try adding a general argument using letters or symbols.";
    }
    return { id: category.id, label: category.label, ratio, feedback };
  });

  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0) || 1;
  const scorePercent = Math.round(
    perCategory.reduce(
      (sum, cat) => sum + (categories.find((c) => c.id === cat.id)?.weight ?? 0) * cat.ratio,
      0
    ) / totalWeight * 100
  );

  const record: AnswerRecord = {
    questionId: question.id,
    answerText: input.answerText,
    correct: scorePercent >= 70,
    responseTimeMs: input.responseTimeMs,
    scoredPercent: scorePercent,
    xpAwarded: Math.round(scorePercent / 10),
    submittedAt: new Date().toISOString(),
  };
  attempt.answers.push(record);

  const store = getStore();
  store.data.xpTotal += record.xpAwarded ?? 0;
  const unitProgress = store.data.unitProgress[attempt.unitId] ?? defaultProgress();
  unitProgress.visited = true;
  unitProgress.lastActivityAt = record.submittedAt;
  store.data.unitProgress[attempt.unitId] = unitProgress;

  if (scorePercent < 70) {
    scheduleReview(
      attempt.unitId,
      getAppConfig().assessment.reviewScheduling.wrongAnswerDays,
      "Revision needed — descriptive score below threshold"
    );
  }

  logActivity("descriptive", quiz.id, quiz.title, 8);
  return { record, perCategory };
}

export function completeAttempt(attemptId: string): QuizAttempt {
  const store = getStore();
  const attempt = store.data.attempts.find((a) => a.id === attemptId);
  if (!attempt) throw new Error(`Attempt not found: ${attemptId}`);
  if (attempt.status === "completed") return attempt;

  const quiz = getQuiz(attempt.quizId);
  if (!quiz) throw new Error(`Quiz not found: ${attempt.quizId}`);

  const totalQuestions = quiz.questions.length;

  if (quiz.type === "mcq") {
    const correctCount = attempt.answers.filter((a) => a.correct === true).length;
    attempt.scorePercent = Math.round((correctCount / totalQuestions) * 100);
    attempt.finalLevel = lastLevelUsed(attempt);
  } else {
    const scored = attempt.answers.filter((a) => a.scoredPercent !== undefined);
    attempt.scorePercent =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, a) => sum + (a.scoredPercent ?? 0), 0) / scored.length
          )
        : 0;
  }

  attempt.passed = attempt.scorePercent >= quiz.passingThreshold;
  attempt.completedAt = new Date().toISOString();
  attempt.status = "completed";

  const progress = store.data.unitProgress[attempt.unitId] ?? defaultProgress();
  if (quiz.type === "mcq") {
    progress.mcqAttempts += 1;
    progress.bestMcqPercent = Math.max(progress.bestMcqPercent ?? 0, attempt.scorePercent ?? 0);
    const config = getAppConfig();
    if ((attempt.scorePercent ?? 0) < config.mastery.canDoThreshold) {
      progress.failedAttempts += 1;
      if (progress.failedAttempts >= config.assessment.revisionAfterFailures) {
        progress.revisionRecommended = true;
        scheduleReview(
          attempt.unitId,
          1,
          "Scored below the passing threshold twice — revision recommended"
        );
      }
    }
  }
  progress.lastActivityAt = attempt.completedAt;
  store.data.unitProgress[attempt.unitId] = progress;
  recomputeUnit(attempt.unitId);

  return attempt;
}

function lastLevelUsed(attempt: QuizAttempt): number | undefined {
  const levels = attempt.answers
    .map((a) => a.difficultyLevel)
    .filter((l): l is number => typeof l === "number");
  return levels.length > 0 ? levels[levels.length - 1] : undefined;
}

export function updatePdfPosition(pdfId: string, page: number): void {
  const store = getStore();
  const existing = store.data.pdfProgress[pdfId];
  store.data.pdfProgress[pdfId] = {
    pdfId,
    lastPage: page,
    lastViewedAt: new Date().toISOString(),
  };
  if (!existing) {
    logActivity("pdf", pdfId, "Chapter PDF reading", 5);
  }
}

export interface ProgressSummary {
  profile: LearnerProfile;
  xpTotal: number;
  subjectMastery: number;
  chapterMastery: { chapterId: string; title: string; mastery: number }[];
  conceptMastery: { conceptId: string; title: string; mastery: number; unitCount: number }[];
  completedUnits: number;
  totalUnits: number;
  quizAccuracy: number | null;
  learningStreak: LearningStreak;
  nextRecommendation: Recommendation | null;
  dailyPlan: DailyPlanItem[];
  learnerSignals: LearnerSignals;
  lastPdfPosition: PdfPosition | null;
  reviewDue: (ReviewItem & { unitTitle: string; overdue: boolean })[];
  orderedUnitIds: string[];
}

function orderedUnitsForChapter(chapterId: string): string[] {
  return getConceptsForChapter(chapterId).flatMap((c) =>
    getUnitsForConcept(c.id).map((u) => u.id)
  );
}

export function getProgressSummary(): ProgressSummary {
  const store = getStore();
  const progress = store.data.unitProgress;
  const chapterList = getChaptersForSubject("maths-grade-8");

  const chapterMastery = chapterList.map((chapter) => {
    const concepts = getConceptsForChapter(chapter.id);
    const conceptMasteries = concepts.map((concept) =>
      averageMastery(
        getUnitsForConcept(concept.id).map((u) => progress[u.id]?.mastery ?? 0)
      )
    );
    return {
      chapterId: chapter.id,
      title: chapter.title,
      mastery: averageMastery(conceptMasteries),
    };
  });

  const conceptMastery = getConceptsForChapter("number-play").map((concept) => ({
    conceptId: concept.id,
    title: concept.title,
    mastery: averageMastery(
      getUnitsForConcept(concept.id).map((u) => progress[u.id]?.mastery ?? 0)
    ),
    unitCount: concept.unitIds.length,
  }));

  const subjectMastery = averageMastery(chapterMastery.map((c) => c.mastery));

  const orderedUnitIds = orderedUnitsForChapter("number-play");
  const completedUnits = orderedUnitIds.filter(
    (id) => progress[id]?.lessonCompleted
  ).length;

  const completedAttempts = store.data.attempts.filter(
    (a) => a.status === "completed" && a.type === "mcq"
  );
  const seededMcqScores = [100, 67, 100, 67, 67];
  const allMcqScores = [
    ...seededMcqScores,
    ...completedAttempts.map((a) => a.scorePercent ?? 0),
  ];
  const quizAccuracy =
    allMcqScores.length > 0
      ? Math.round(allMcqScores.reduce((s, v) => s + v, 0) / allMcqScores.length)
      : null;

  const now = Date.now();
  const reviewDue = store.data.reviewSchedule
    .filter((r) => r.status === "pending" && new Date(r.dueAt).getTime() <= now + 1000 * 60 * 60 * 24 * 2)
    .map((r) => {
      const unit = getUnit(r.unitId);
      return {
        ...r,
        unitTitle: unit?.title ?? r.unitId,
        overdue: new Date(r.dueAt).getTime() < now,
      };
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const recommendation = computeRecommendation(orderedUnitIds, progress, store.data.reviewSchedule);

  const dailyPlan = buildDailyPlan(recommendation, reviewDue);

  const responseTimes = completedAttempts
    .flatMap((a) => a.answers.map((ans) => ans.responseTimeMs ?? 0))
    .filter((ms) => ms > 0);

  const learnerSignals: LearnerSignals = {
    preferredFormat: "Visual lessons with worked examples",
    averageResponseTimeMs:
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((s, ms) => s + ms, 0) / responseTimes.length)
        : 0,
    hintsUsed: 0,
    confidenceAccuracyGap: 12,
    bestTimeOfDay: "Late afternoon",
  };

  const pdfPositions = Object.values(store.data.pdfProgress);
  const lastPdfPosition =
    pdfPositions.length > 0
      ? pdfPositions.reduce((latest, pos) =>
          new Date(pos.lastViewedAt) > new Date(latest.lastViewedAt) ? pos : latest
        )
      : null;

  return {
    profile: store.data.profile,
    xpTotal: store.data.xpTotal,
    subjectMastery,
    chapterMastery,
    conceptMastery,
    completedUnits,
    totalUnits: orderedUnitIds.length,
    quizAccuracy,
    learningStreak: store.data.streak,
    nextRecommendation: recommendation,
    dailyPlan,
    learnerSignals,
    lastPdfPosition,
    reviewDue,
    orderedUnitIds,
  };
}

function buildDailyPlan(
  recommendation: Recommendation | null,
  reviewDue: ProgressSummary["reviewDue"]
): DailyPlanItem[] {
  const plan: DailyPlanItem[] = [];
  if (recommendation) {
    const verb =
      recommendation.kind === "review" ? "Review" : recommendation.kind === "resume" ? "Resume" : "Start";
    plan.push({
      id: "plan-recommendation",
      activityType: recommendation.kind === "review" ? "review" : "lesson",
      entityId: recommendation.unitId,
      title: `${verb}: ${recommendation.unitTitle}`,
      description: recommendation.reason,
      estimatedMinutes: recommendation.estimatedMinutes,
      href: recommendation.href,
    });
  }
  for (const item of reviewDue.slice(0, 2)) {
    plan.push({
      id: `plan-review-${item.unitId}`,
      activityType: "review",
      entityId: item.unitId,
      title: `Review: ${item.unitTitle}`,
      description: item.reason,
      estimatedMinutes: 10,
      href: `/lessons/number-play/${getUnit(item.unitId)?.conceptId ?? ""}/${item.unitId}`,
    });
  }
  plan.push({
    id: "plan-pdf",
    activityType: "pdf",
    entityId: "number-play-pdf",
    title: "Read chapter PDF",
    description: "Continue from your last reading position (page 12).",
    estimatedMinutes: 15,
    href: "/chapter-pdf/number-play",
  });
  return plan.slice(0, 4);
}

export interface ProgressDetails {
  summary: ProgressSummary;
  unitProgress: {
    unitId: string;
    title: string;
    conceptId: string;
    conceptTitle: string;
    status: UnitProgressRecord["status"];
    mastery: number;
    bestMcqPercent?: number;
    mcqAttempts: number;
    revisionRecommended: boolean;
    estimatedDurationMinutes: number;
  }[];
  accuracyTrend: { date: string; accuracy: number; label: string }[];
  activityByDay: { date: string; minutes: number }[];
  confidenceVsAccuracy: { confidence: string; correct: number; incorrect: number }[];
  recentAttempts: {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    type: string;
    scorePercent: number | null;
    passed: boolean | null;
    completedAt: string | null;
  }[];
  reviewSchedule: (ReviewItem & {
    unitTitle: string;
    overdue: boolean;
  })[];
  insights: {
    preferredFormat: string;
    averageResponseTimeMs: number;
    bestTimeOfDay: string;
    unitsNeedingAttention: { unitId: string; title: string; reason: string }[];
    learningPatterns: string[];
  };
}

export function getProgressDetails(): ProgressDetails {
  const store = getStore();
  const summary = getProgressSummary();
  const progress = store.data.unitProgress;

  const unitProgress = summary.orderedUnitIds.map((unitId) => {
    const unit = getUnit(unitId)!;
    const concept = getConcept(unit.conceptId)!;
    const record = progress[unitId] ?? defaultProgress();
    return {
      unitId,
      title: unit.title,
      conceptId: concept.id,
      conceptTitle: concept.title,
      status: record.status,
      mastery: record.mastery,
      bestMcqPercent: record.bestMcqPercent,
      mcqAttempts: record.mcqAttempts,
      revisionRecommended: record.revisionRecommended,
      estimatedDurationMinutes: unit.estimatedDurationMinutes,
    };
  });

  const accuracyTrend: { date: string; accuracy: number; label: string }[] = [
    { date: daysAgo(10).toISOString().slice(0, 10), accuracy: 100, label: "Even and odd numbers" },
    { date: daysAgo(9).toISOString().slice(0, 10), accuracy: 67, label: "Parity of sums and differences" },
    { date: daysAgo(8).toISOString().slice(0, 10), accuracy: 100, label: "Plus-minus signs" },
    { date: daysAgo(5).toISOString().slice(0, 10), accuracy: 67, label: "Parity in games and puzzles" },
    { date: daysAgo(2).toISOString().slice(0, 10), accuracy: 67, label: "Division with remainders" },
  ];

  const activityByDay = Object.entries(store.data.streak.dailyMinutes)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const confidenceBuckets: Record<string, { correct: number; incorrect: number }> = {
    Certain: { correct: 3, incorrect: 0 },
    "Fairly sure": { correct: 4, incorrect: 3 },
    Guessing: { correct: 1, incorrect: 1 },
  };
  const confidenceVsAccuracy = Object.entries(confidenceBuckets).map(
    ([confidence, counts]) => ({ confidence, ...counts })
  );

  const recentAttempts = store.data.attempts
    .filter((a) => a.status === "completed")
    .slice(-10)
    .reverse()
    .map((a) => ({
      attemptId: a.id,
      quizId: a.quizId,
      quizTitle: getQuiz(a.quizId)?.title ?? a.quizId,
      type: a.type,
      scorePercent: a.scorePercent ?? null,
      passed: a.passed ?? null,
      completedAt: a.completedAt ?? null,
    }));

  const unitsNeedingAttention = summary.orderedUnitIds
    .filter((id) => {
      const record = progress[id];
      return record?.revisionRecommended || record?.status === "in_progress";
    })
    .map((id) => ({
      unitId: id,
      title: getUnit(id)?.title ?? id,
      reason: progress[id]?.revisionRecommended
        ? "Two attempts below the passing threshold"
        : "Lesson started but not completed",
    }));

  const insights = {
    preferredFormat: summary.learnerSignals.preferredFormat,
    averageResponseTimeMs: summary.learnerSignals.averageResponseTimeMs,
    bestTimeOfDay: summary.learnerSignals.bestTimeOfDay,
    unitsNeedingAttention,
    learningPatterns: [
      "Accuracy is strongest on level 1–2 questions",
      "Most learning happens between 4 and 6 in the evening",
      "Descriptive answers improve when a worked example is attempted first",
    ],
  };

  return {
    summary,
    unitProgress,
    accuracyTrend,
    activityByDay,
    confidenceVsAccuracy,
    recentAttempts,
  reviewSchedule: store.data.reviewSchedule.map((r) => ({
    ...r,
    unitTitle: getUnit(r.unitId)?.title ?? r.unitId,
    overdue: new Date(r.dueAt).getTime() < Date.now(),
  })),
    insights,
  };
}

export function getChapterMasteryForCard(chapterId: string): number {
  const chapter = getChapter(chapterId);
  if (!chapter) return 0;
  const progress = getStore().data.unitProgress;
  const conceptMasteries = getConceptsForChapter(chapterId).map((concept) =>
    averageMastery(
      getUnitsForConcept(concept.id).map((u) => progress[u.id]?.mastery ?? 0)
    )
  );
  return averageMastery(conceptMasteries);
}

export function getConceptMasteryForCard(conceptId: string): number {
  const progress = getStore().data.unitProgress;
  return averageMastery(
    getUnitsForConcept(conceptId).map((u) => progress[u.id]?.mastery ?? 0)
  );
}

export function resetStore(): void {
  globalRef.__luminaStore = { data: seed(), attemptCounter: 0 };
}

export { defaultProgress };
