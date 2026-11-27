import { NextResponse } from "next/server";

import { getQuiz } from "@/lib/content/loader";
import { findQuestion } from "@/lib/content/registry";
import { nextLevel, selectNextQuestionId } from "@/lib/calculations/adaptive";
import {
  getAttempt,
  scoreDescriptiveAnswer,
  scoreMcqAnswer,
} from "@/lib/server/store";
import type { Confidence } from "@/types/curriculum";

const VALID_CONFIDENCE: Confidence[] = ["guessing", "fairly_sure", "certain"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = getAttempt(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.status !== "in_progress") {
    return NextResponse.json(
      { error: "This assessment session has already been completed." },
      { status: 409 }
    );
  }
  const quiz = getQuiz(attempt.quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const question = findQuestion(quiz, body?.questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 400 });
  }
  if (attempt.answers.some((a) => a.questionId === question.id)) {
    return NextResponse.json(
      { error: "This question has already been answered." },
      { status: 409 }
    );
  }

  const responseTimeMs = typeof body?.responseTimeMs === "number" ? body.responseTimeMs : 0;

  if (quiz.type === "mcq") {
    const selectedOptionId = body?.selectedOptionId;
    const confidence: Confidence = VALID_CONFIDENCE.includes(body?.confidence)
      ? body.confidence
      : "fairly_sure";
    if (typeof selectedOptionId !== "string") {
      return NextResponse.json({ error: "selectedOptionId is required" }, { status: 400 });
    }
    const record = scoreMcqAnswer(attempt, quiz, question, {
      selectedOptionId,
      confidence,
      responseTimeMs,
    });

    const answeredIds = attempt.answers.map((a) => a.questionId);
    const level = nextLevel(
      typeof question.difficulty === "number" ? question.difficulty : 2,
      record.correct === true,
      quiz
    );
    const nextQuestionId = selectNextQuestionId(quiz, answeredIds, level);

    return NextResponse.json({
      correct: record.correct === true,
      correctOptionId: question.correctOptionId ?? null,
      explanation: question.explanation ?? null,
      xpAwarded: record.xpAwarded ?? 0,
      currentLevel: level,
      nextQuestionId: nextQuestionId ?? null,
      answeredCount: attempt.answers.length,
      totalQuestions: quiz.questions.length,
    });
  }

  const answerText = typeof body?.answerText === "string" ? body.answerText : "";
  if (answerText.trim().length < 10) {
    return NextResponse.json(
      { error: "Write at least a sentence before submitting." },
      { status: 400 }
    );
  }
  const { record, perCategory } = scoreDescriptiveAnswer(attempt, quiz, question, {
    answerText,
    responseTimeMs,
  });

  return NextResponse.json({
    scorePercent: record.scoredPercent ?? 0,
    passed: (record.scoredPercent ?? 0) >= quiz.passingThreshold,
    xpAwarded: record.xpAwarded ?? 0,
    perCategory,
    keyTerms: question.keyTerms ?? [],
    modelAnswerPresent: Boolean(question.modelAnswer),
    answeredCount: attempt.answers.length,
    totalQuestions: quiz.questions.length,
  });
}
