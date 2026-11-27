import { NextResponse } from "next/server";

import { getConcept, getQuiz, getUnit } from "@/lib/content/loader";
import { getLearnerData } from "@/lib/server/store";
import type { Question } from "@/types/curriculum";

function toClientQuestion(question: Question): Question {
  if (question.type === "mcq") {
    return {
      ...question,
      correctOptionId: undefined,
      explanation: undefined,
    };
  }
  return {
    ...question,
    modelAnswer: undefined,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quiz = getQuiz(id);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  const unit = getUnit(quiz.unitId);
  const concept = getConcept(quiz.conceptId);
  const inProgress = getLearnerData().attempts.find(
    (a) => a.quizId === id && a.status === "in_progress"
  );

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      type: quiz.type,
      title: quiz.title,
      instructions: quiz.instructions,
      questions: quiz.questions.map(toClientQuestion),
      timeLimitSeconds: quiz.timeLimitSeconds ?? null,
      difficulty: quiz.difficulty ?? null,
      passingThreshold: quiz.passingThreshold,
      scoringPolicy: quiz.scoringPolicy,
      rubricId: quiz.rubricId ?? null,
    },
    unitTitle: unit?.title ?? "",
    conceptTitle: concept?.title ?? "",
    inProgressAttempt: inProgress
      ? {
          id: inProgress.id,
          startedAt: inProgress.startedAt,
          answeredQuestionIds: inProgress.answers.map((a) => a.questionId),
        }
      : null,
  });
}
