import { NextResponse } from "next/server";

import { getAppConfig, getQuiz } from "@/lib/content/loader";
import { getStartingLevel, selectNextQuestionId } from "@/lib/calculations/adaptive";
import { startAttempt } from "@/lib/server/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const quizId = body?.quizId;
  if (typeof quizId !== "string") {
    return NextResponse.json({ error: "quizId is required" }, { status: 400 });
  }
  const quiz = getQuiz(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const userId = getAppConfig().learner.defaultUserId;
  const attempt = startAttempt(quizId, userId);
  const config = getAppConfig();
  const level = getStartingLevel(quiz);
  const answeredIds = attempt.answers.map((a) => a.questionId);
  const nextQuestionId = selectNextQuestionId(quiz, answeredIds, level);

  return NextResponse.json({
    attemptId: attempt.id,
    resumed: attempt.answers.length > 0,
    answeredQuestionIds: answeredIds,
    currentLevel: level,
    adaptiveEnabled: quiz.difficulty?.enabled ?? config.assessment.adaptive.enabled,
    nextQuestionId: nextQuestionId ?? null,
  });
}
