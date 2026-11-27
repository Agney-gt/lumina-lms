import { NextResponse } from "next/server";

import { getUnit } from "@/lib/content/loader";
import {
  defaultProgress,
  getLearnerData,
  markLessonCompleted,
  markLessonVisited,
} from "@/lib/server/store";
import { deriveUnitStatus } from "@/lib/calculations/status";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }
  const allProgress = getLearnerData().unitProgress;
  const record = allProgress[id] ?? defaultProgress();
  return NextResponse.json({
    unitId: id,
    status: deriveUnitStatus(record, unit.prerequisites, allProgress),
    mastery: record.mastery,
    lessonCompleted: record.lessonCompleted,
    bestMcqPercent: record.bestMcqPercent ?? null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const event = body?.event;
  if (event === "completed") {
    markLessonCompleted(id);
  } else if (event === "visited") {
    markLessonVisited(id);
  } else {
    return NextResponse.json(
      { error: "Unknown event — expected 'visited' or 'completed'" },
      { status: 400 }
    );
  }
  const allProgress = getLearnerData().unitProgress;
  const record = allProgress[id];
  return NextResponse.json({
    unitId: id,
    status: deriveUnitStatus(record, unit.prerequisites, allProgress),
    mastery: record.mastery,
  });
}
