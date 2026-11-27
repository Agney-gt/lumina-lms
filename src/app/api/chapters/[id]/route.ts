import { NextResponse } from "next/server";

import { getChapter, getConceptsForChapter, getUnitsForConcept } from "@/lib/content/loader";
import { deriveUnitStatus, isConceptUnlocked } from "@/lib/calculations/status";
import { defaultProgress, getChapterMasteryForCard, getConceptMasteryForCard, getLearnerData } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chapter = getChapter(id);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
  const allProgress = getLearnerData().unitProgress;
  const concepts = getConceptsForChapter(id).map((concept) => ({
    id: concept.id,
    title: concept.title,
    description: concept.description,
    order: concept.order,
    textbookPages: concept.textbookPages,
    unlocked: isConceptUnlocked(concept.prerequisites, allProgress),
    mastery: getConceptMasteryForCard(concept.id),
    units: getUnitsForConcept(concept.id).map((unit) => {
      const record = allProgress[unit.id] ?? defaultProgress();
      return {
        id: unit.id,
        title: unit.title,
        order: unit.order,
        estimatedDurationMinutes: unit.estimatedDurationMinutes,
        pageReferences: unit.pageReferences,
        status: deriveUnitStatus(record, unit.prerequisites, allProgress),
        mastery: record.mastery,
        activityIds: unit.activityIds,
      };
    }),
  }));
  return NextResponse.json({
    chapter: {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      description: chapter.description,
      pdfId: chapter.pdfId,
      pageRange: chapter.pageRange,
    },
    mastery: getChapterMasteryForCard(id),
    concepts,
  });
}
