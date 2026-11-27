import { getAppConfig, getConcept, getUnit } from "@/lib/content/loader";
import { deriveUnitStatus } from "@/lib/calculations/status";
import type { Recommendation, ReviewItem, UnitProgressRecord } from "@/types/learner";

export function lessonHref(unitId: string): string {
  const unit = getUnit(unitId);
  if (!unit) return "/lessons";
  return `/lessons/number-play/${unit.conceptId}/${unitId}`;
}

export function computeRecommendation(
  orderedUnitIds: string[],
  allProgress: Record<string, UnitProgressRecord>,
  reviewSchedule: ReviewItem[]
): Recommendation | null {
  const config = getAppConfig();
  const now = Date.now();

  if (config.recommendation.reviewFirst) {
    const due = reviewSchedule
      .filter((r) => r.status === "pending" && new Date(r.dueAt).getTime() <= now)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
    if (due) {
      const unit = getUnit(due.unitId);
      const concept = unit ? getConcept(unit.conceptId) : undefined;
      if (unit && concept) {
        return {
          unitId: unit.id,
          conceptId: concept.id,
          unitTitle: unit.title,
          conceptTitle: concept.title,
          reason: `Scheduled review — ${due.reason}`,
          kind: "review",
          estimatedMinutes: Math.min(unit.estimatedDurationMinutes, 10),
          href: lessonHref(unit.id),
        };
      }
    }
  }

  for (const unitId of orderedUnitIds) {
    const progress = allProgress[unitId];
    const status = progress
      ? deriveUnitStatus(progress, getUnit(unitId)?.prerequisites ?? [], allProgress)
      : "not_started";
    if (status === "in_progress") {
      const unit = getUnit(unitId)!;
      const concept = getConcept(unit.conceptId)!;
      return {
        unitId: unit.id,
        conceptId: concept.id,
        unitTitle: unit.title,
        conceptTitle: concept.title,
        reason: "You started this lesson — pick up where you left off.",
        kind: "resume",
        estimatedMinutes: unit.estimatedDurationMinutes,
        href: lessonHref(unit.id),
      };
    }
  }

  for (const unitId of orderedUnitIds) {
    const unit = getUnit(unitId);
    if (!unit) continue;
    const status = deriveUnitStatus(
      allProgress[unitId] ?? defaultProgress(),
      unit.prerequisites,
      allProgress
    );
    if (status === "not_started") {
      const concept = getConcept(unit.conceptId)!;
      return {
        unitId: unit.id,
        conceptId: concept.id,
        unitTitle: unit.title,
        conceptTitle: concept.title,
        reason: "Next in the chapter sequence — a fresh unit is ready for you.",
        kind: "new",
        estimatedMinutes: unit.estimatedDurationMinutes,
        href: lessonHref(unit.id),
      };
    }
  }

  return null;
}

export function defaultProgress(): UnitProgressRecord {
  return {
    status: "not_started",
    lessonCompleted: false,
    visited: false,
    mastery: 0,
    mcqAttempts: 0,
    failedAttempts: 0,
    revisionRecommended: false,
  };
}
