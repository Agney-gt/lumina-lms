import { NextResponse } from "next/server";

import { getAllQuizzes, getConcept, getUnit } from "@/lib/content/loader";
import { isUnitUnlocked } from "@/lib/calculations/status";
import { defaultProgress, getLearnerData } from "@/lib/server/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conceptFilter = url.searchParams.get("conceptId");
  const typeFilter = url.searchParams.get("type");

  const allProgress = getLearnerData().unitProgress;
  const attempts = getLearnerData().attempts;

  const quizzes = getAllQuizzes()
    .filter((q) => (conceptFilter ? q.conceptId === conceptFilter : true))
    .filter((q) => (typeFilter ? q.type === typeFilter : true))
    .map((quiz) => {
      const unit = getUnit(quiz.unitId);
      const concept = getConcept(quiz.conceptId);
      const record = allProgress[quiz.unitId] ?? defaultProgress();
      const completedAttempts = attempts.filter(
        (a) => a.quizId === quiz.id && a.status === "completed"
      );
      const bestScore =
        quiz.type === "mcq"
          ? (record.bestMcqPercent ?? null)
          : completedAttempts.length > 0
            ? Math.max(...completedAttempts.map((a) => a.scorePercent ?? 0))
            : null;
      return {
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        unitId: quiz.unitId,
        unitTitle: unit?.title ?? "",
        conceptId: quiz.conceptId,
        conceptTitle: concept?.title ?? "",
        questionCount: quiz.questions.length,
        estimatedDurationMinutes:
          quiz.type === "mcq"
            ? Math.max(5, quiz.questions.length * 2)
            : 10,
        unlocked: unit ? isUnitUnlocked(quiz.unitId, allProgress) : false,
        bestScore,
        attemptCount: completedAttempts.length,
        inProgress: attempts.some((a) => a.quizId === quiz.id && a.status === "in_progress"),
        passingThreshold: quiz.passingThreshold,
      };
    });

  return NextResponse.json({ quizzes });
}
