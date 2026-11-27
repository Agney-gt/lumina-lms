import { getAppConfig } from "@/lib/content/loader";
import { clamp } from "@/lib/utils";
import type { UnitProgressRecord } from "@/types/learner";

export function computeUnitMastery(
  progress: Pick<UnitProgressRecord, "lessonCompleted" | "bestMcqPercent">
): number {
  const config = getAppConfig();
  const hasMcq = progress.bestMcqPercent !== undefined;
  if (!hasMcq) {
    return progress.lessonCompleted ? 100 : 0;
  }
  const lessonScore = progress.lessonCompleted ? 100 : 0;
  const mastery =
    lessonScore * config.mastery.lessonWeight +
    (progress.bestMcqPercent ?? 0) * config.mastery.quizWeight;
  return Math.round(clamp(mastery, 0, 100));
}

export function averageMastery(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, v) => sum + v, 0);
  return Math.round(total / values.length);
}
