import { NextResponse } from "next/server";

import { getQuiz } from "@/lib/content/loader";
import { findQuestion } from "@/lib/content/registry";
import { getAttempt } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = getAttempt(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  const quiz = getQuiz(attempt.quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const questionResults = attempt.answers.map((answer) => {
    const question = findQuestion(quiz, answer.questionId);
    return {
      questionId: answer.questionId,
      prompt: question?.prompt ?? "",
      selectedOptionId: answer.selectedOptionId ?? null,
      correctOptionId: question?.correctOptionId ?? null,
      answerText: answer.answerText ?? null,
      correct: answer.correct ?? false,
      explanation: question?.explanation ?? null,
      confidence: answer.confidence ?? null,
      difficultyLevel: answer.difficultyLevel ?? null,
      xpAwarded: answer.xpAwarded ?? 0,
      scoredPercent: answer.scoredPercent ?? null,
    };
  });

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      quizId: attempt.quizId,
      type: attempt.type,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      scorePercent: attempt.scorePercent ?? null,
      passed: attempt.passed ?? null,
      xpEarned: attempt.answers.reduce((sum, a) => sum + (a.xpAwarded ?? 0), 0),
      finalLevel: attempt.finalLevel ?? null,
    },
    quiz: {
      id: quiz.id,
      title: quiz.title,
      type: quiz.type,
      passingThreshold: quiz.passingThreshold,
      unitId: quiz.unitId,
      conceptId: quiz.conceptId,
      questionCount: quiz.questions.length,
    },
    questionResults,
  });
}
