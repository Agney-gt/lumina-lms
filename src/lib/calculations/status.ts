import { getAppConfig, getUnit, getUnitsForConcept } from "@/lib/content/loader";
import type { UnitProgressRecord, UnitStatus } from "@/types/learner";

function unitIsExplained(
  unitId: string,
  all: Record<string, UnitProgressRecord>
): boolean {
  return all[unitId]?.lessonCompleted === true;
}

export function deriveUnitStatus(
  progress: UnitProgressRecord,
  prerequisiteIds: string[],
  allProgress: Record<string, UnitProgressRecord>
): UnitStatus {
  const config = getAppConfig();

  const prereqsBlocked =
    config.unlocking.requirePreviousUnit &&
    prerequisiteIds.some((id) => !unitIsExplained(id, allProgress));
  if (prereqsBlocked) return "not_started";

  if (
    progress.bestMcqPercent !== undefined &&
    progress.bestMcqPercent >= config.mastery.canDoThreshold
  ) {
    return "can_do";
  }
  if (progress.lessonCompleted) return "explained";
  if (progress.visited) return "in_progress";
  return "not_started";
}

export function isUnitUnlocked(
  unitId: string,
  allProgress: Record<string, UnitProgressRecord>
): boolean {
  const unit = getUnit(unitId);
  if (!unit) return false;
  const config = getAppConfig();
  if (!config.unlocking.requirePreviousUnit) return true;
  if (unit.prerequisites.length === 0) return true;
  return unit.prerequisites.every((id) => unitIsExplained(id, allProgress));
}

export function isConceptUnlocked(
  prerequisiteIds: string[],
  allProgress: Record<string, UnitProgressRecord>
): boolean {
  const config = getAppConfig();
  if (!config.unlocking.requirePreviousConceptExplained) return true;
  if (prerequisiteIds.length === 0) return true;
  return prerequisiteIds.every((conceptId) =>
    getUnitsForConcept(conceptId).every((u) =>
      unitIsExplained(u.id, allProgress)
    )
  );
}
