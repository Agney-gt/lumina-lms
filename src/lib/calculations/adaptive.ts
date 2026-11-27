import { getAppConfig } from "@/lib/content/loader";
import { clamp } from "@/lib/utils";
import type { Quiz } from "@/types/curriculum";

export function getStartingLevel(quiz: Quiz): number {
  const config = getAppConfig();
  const adaptive = quiz.difficulty ?? {
    enabled: config.assessment.adaptive.enabled,
    startLevel: config.assessment.adaptive.startLevel,
    minLevel: config.assessment.adaptive.minLevel,
    maxLevel: config.assessment.adaptive.maxLevel,
  };
  return adaptive.enabled ? adaptive.startLevel : 1;
}

export function nextLevel(
  currentLevel: number,
  correct: boolean,
  quiz: Quiz
): number {
  const adaptive = quiz.difficulty;
  if (!adaptive?.enabled) return currentLevel;
  const delta = correct ? 1 : -1;
  return clamp(currentLevel + delta, adaptive.minLevel, adaptive.maxLevel);
}

export function selectNextQuestionId(
  quiz: Quiz,
  answeredQuestionIds: string[],
  currentLevel: number
): string | undefined {
  const remaining = quiz.questions.filter(
    (q) => !answeredQuestionIds.includes(q.id)
  );
  if (remaining.length === 0) return undefined;
  const atLevel = remaining.filter((q) => q.difficulty === currentLevel);
  if (atLevel.length > 0) {
    return atLevel[0].id;
  }
  const sorted = [...remaining].sort(
    (a, b) => Math.abs((a.difficulty ?? 1) - currentLevel) - Math.abs((b.difficulty ?? 1) - currentLevel)
  );
  return sorted[0].id;
}
