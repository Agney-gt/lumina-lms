import { NextResponse } from "next/server";

import { getQuiz } from "@/lib/content/loader";
import { findQuestion } from "@/lib/content/registry";
import { completeAttempt, getAttempt } from "@/lib/server/store";

export async function POST(
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
  if (attempt.answers.length === 0) {
    return NextResponse.json(
      { error: "Answer at least one question before completing the assessment." },
      { status: 400 }
    );
  }

  const completed = completeAttempt(id);

  const questionResults = completed.answers.map((answer) => {
    const question = findQuestion(quiz, answer.questionId);
    return {
      questionId: answer.questionId,
      prompt: question?.prompt ?? "",
      selectedOptionId: answer.selectedOptionId ?? null,
      correctOptionId: question?.correctOptionId ?? null,
      correct: answer.correct ?? false,
      explanation: question?.explanation ?? null,
      confidence: answer.confidence ?? null,
      difficultyLevel: answer.difficultyLevel ?? null,
      xpAwarded: answer.xpAwarded ?? 0,
      scoredPercent: answer.scoredPercent ?? null,
    };
  });

  const recommendedReview: string[] = [];
  for (const answer of completed.answers) {
    if (answer.correct === false) {
      recommendedReview.push(attempt.unitId);
    }
  }

  return NextResponse.json({
    attemptId: completed.id,
    status: completed.status,
    type: completed.type,
    scorePercent: completed.scorePercent ?? 0,
    passed: completed.passed ?? false,
    passingThreshold: quiz.passingThreshold,
    xpEarned: completed.answers.reduce((sum, a) => sum + (a.xpAwarded ?? 0), 0),
    finalLevel: completed.finalLevel ?? null,
    questionResults,
    recommendedReviewUnitIds: [...new Set(recommendedReview)],
    unitHref: `/lessons/number-play/${completed.conceptId}/${completed.unitId}`,
    quizId: completed.quizId,
  });
}
