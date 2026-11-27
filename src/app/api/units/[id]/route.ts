import { NextResponse } from "next/server";

import { getConcept, getLessonForUnit, getUnit, getUnitsForConcept, getQuizzesForUnit } from "@/lib/content/loader";
import { deriveUnitStatus, isUnitUnlocked } from "@/lib/calculations/status";
import { defaultProgress, getLearnerData } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }
  const concept = getConcept(unit.conceptId);
  const lesson = getLessonForUnit(id);
  if (!concept || !lesson) {
    return NextResponse.json({ error: "Unit content missing" }, { status: 404 });
  }
  const allProgress = getLearnerData().unitProgress;
  const record = allProgress[id] ?? defaultProgress();
  const siblings = getUnitsForConcept(concept.id);

  return NextResponse.json({
    unit: {
      ...unit,
      status: deriveUnitStatus(record, unit.prerequisites, allProgress),
      mastery: record.mastery,
      unlocked: isUnitUnlocked(id, allProgress),
    },
    concept: { id: concept.id, title: concept.title },
    lesson,
    siblings: siblings.map((u) => {
      const siblingRecord = allProgress[u.id] ?? defaultProgress();
      return {
        id: u.id,
        title: u.title,
        order: u.order,
        status: deriveUnitStatus(siblingRecord, u.prerequisites, allProgress),
      };
    }),
    quizzes: getQuizzesForUnit(id).map((q) => ({
      id: q.id,
      title: q.title,
      type: q.type,
      questionCount: q.questions.length,
    })),
  });
}
