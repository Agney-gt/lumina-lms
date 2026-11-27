import {
  getConcept,
  getConceptsForChapter,
  getUnit,
  getUnitsForConcept,
} from "@/lib/content/loader";
import { deriveUnitStatus, isConceptUnlocked, isUnitUnlocked } from "@/lib/calculations/status";
import { getConceptMasteryForCard, getLearnerData } from "@/lib/server/store";
import { formatPages } from "@/lib/utils";
import type { CatalogueConcept } from "@/components/lessons/concept-catalogue";

export function buildChapterCatalogue(chapterId: string): CatalogueConcept[] {
  const allProgress = getLearnerData().unitProgress;
  return getConceptsForChapter(chapterId).map((concept) => {
    return {
      id: concept.id,
      title: concept.title,
      description: concept.description,
      pages: concept.textbookPages,
      mastery: getConceptMasteryForCard(concept.id),
      unlocked: isConceptUnlocked(concept.prerequisites, allProgress),
      units: getUnitsForConcept(concept.id).map((unit) => {
        const record = allProgress[unit.id];
        return {
          id: unit.id,
          title: unit.title,
          estimatedDurationMinutes: unit.estimatedDurationMinutes,
          pages: unit.pageReferences
            .map((r) => formatPages(r.start, r.end))
            .join(", "),
          status: deriveUnitStatus(
            record ?? defaultRecord(),
            unit.prerequisites,
            allProgress
          ),
          mastery: record?.mastery ?? 0,
          unlocked: isUnitUnlocked(unit.id, allProgress),
        };
      }),
    };
  });
}

function defaultRecord() {
  return {
    lessonCompleted: false,
    visited: false,
    mastery: 0,
    mcqAttempts: 0,
    failedAttempts: 0,
    revisionRecommended: false,
  };
}

export function getConceptContext(conceptId: string) {
  const concept = getConcept(conceptId);
  if (!concept) return null;
  const chapterId = concept.chapterId;
  const allProgress = getLearnerData().unitProgress;
  return {
    concept,
    chapterId,
    unlocked: isConceptUnlocked(concept.prerequisites, allProgress),
    mastery: getConceptMasteryForCard(conceptId),
    units: getUnitsForConcept(conceptId).map((unit) => {
      const record = allProgress[unit.id];
      return {
        unit,
        status: deriveUnitStatus(record ?? defaultRecord(), unit.prerequisites, allProgress),
        unlocked: isUnitUnlocked(unit.id, allProgress),
        mastery: record?.mastery ?? 0,
      };
    }),
  };
}

export function getUnitContext(unitId: string) {
  const unit = getUnit(unitId);
  if (!unit) return null;
  const concept = getConcept(unit.conceptId);
  if (!concept) return null;
  const allProgress = getLearnerData().unitProgress;
  const record = allProgress[unitId];
  return {
    unit,
    concept,
    chapterId: concept.chapterId,
    siblings: getUnitsForConcept(unit.conceptId),
    status: deriveUnitStatus(record ?? defaultRecord(), unit.prerequisites, allProgress),
    unlocked: isUnitUnlocked(unitId, allProgress),
    mastery: record?.mastery ?? 0,
    lessonCompleted: record?.lessonCompleted ?? false,
  };
}
