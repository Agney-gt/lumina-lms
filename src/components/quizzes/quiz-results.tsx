"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircularProgress } from "@/components/shared/circular-progress";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface AttemptResult {
  attempt: {
    id: string;
    quizId: string;
    type: "mcq" | "descriptive";
    status: string;
    scorePercent: number | null;
    passed: boolean | null;
    xpEarned: number;
    finalLevel: number | null;
  };
  quiz: {
    id: string;
    title: string;
    type: "mcq" | "descriptive";
    passingThreshold: number;
    unitId: string;
    conceptId: string;
    questionCount: number;
  };
  questionResults: {
    questionId: string;
    prompt: string;
    selectedOptionId: string | null;
    correctOptionId: string | null;
    answerText: string | null;
    correct: boolean;
    explanation: string | null;
    confidence: string | null;
    difficultyLevel: number | null;
    xpAwarded: number;
    scoredPercent: number | null;
  }[];
}

export function QuizResults() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attempt-result", attemptId],
    queryFn: () => api.get<AttemptResult>(`/api/attempts/${attemptId}`),
    enabled: Boolean(attemptId),
  });

  if (!attemptId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No attempt to show yet. Start an assessment and complete it to see
            results here.
          </p>
          <Button asChild variant="outline">
            <Link href="/quizzes">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Browse quizzes
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="mx-auto size-32 animate-pulse rounded-full bg-secondary" />
        <div className="h-40 animate-pulse rounded-xl bg-secondary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Results could not be loaded. The attempt may not exist or has not been
          completed yet.
        </CardContent>
      </Card>
    );
  }

  const { attempt, quiz, questionResults } = data;
  const score = attempt.scorePercent ?? 0;
  const passed = attempt.passed ?? false;
  const correctCount = questionResults.filter((r) => r.correct).length;
  const confidentAndCorrect = questionResults.filter(
    (r) => r.correct && (r.confidence === "certain" || r.confidence === "fairly_sure")
  ).length;
  const guessedAndCorrect = questionResults.filter(
    (r) => r.correct && r.confidence === "guessing"
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <Card className="items-center py-8">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <CircularProgress value={score} size={132} label="score" />
          <div>
            <p className="flex items-center justify-center gap-2 text-lg font-semibold">
              {passed ? (
                <>
                  <Trophy className="size-5 text-warning" aria-hidden="true" />
                  {passed ? "Passed" : "Keep practising"}
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" aria-hidden="true" />
                  Not passed yet
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {quiz.title} · pass mark {quiz.passingThreshold}% · +{attempt.xpEarned} XP
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant={passed ? "success" : "warning"}>{score}% score</Badge>
            {attempt.finalLevel ? (
              <Badge variant="accent">Reached level {attempt.finalLevel}</Badge>
            ) : null}
            <Badge variant="secondary">
              {correctCount}/{questionResults.length} correct
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href={`/quizzes/${quiz.id}`}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Retake quiz
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/lessons/number-play/${quiz.conceptId}/${quiz.unitId}`}>
                <BookOpen className="size-4" aria-hidden="true" />
                Back to lesson
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/quizzes">All quizzes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {guessedAndCorrect > 0 ? (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle className="text-sm">Spaced review scheduled</CardTitle>
            <CardDescription>
              {guessedAndCorrect} correct answer{guessedAndCorrect > 1 ? "s were" : " was"}{" "}
              marked with Guessing confidence — a review has been scheduled to check
              they stick.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {quiz.type === "mcq" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Confidence vs accuracy</CardTitle>
            <CardDescription>
              {confidentAndCorrect} confident and correct · {guessedAndCorrect} guessed
              and correct
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <section aria-label="Question review" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Question review
        </h2>
        {questionResults.map((result, index) => (
          <Card key={result.questionId} className="py-4">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">
                  <span className="text-muted-foreground">Q{index + 1}. </span>
                  {result.prompt}
                </p>
                {quiz.type === "mcq" ? (
                  result.correct ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
                  )
                ) : (
                  <Badge
                    variant={
                      (result.scoredPercent ?? 0) >= quiz.passingThreshold
                        ? "success"
                        : "warning"
                    }
                  >
                    {result.scoredPercent ?? 0}%
                  </Badge>
                )}
              </div>
              {quiz.type === "mcq" ? (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {result.confidence ? (
                    <Badge variant="secondary">Confidence: {result.confidence.replace("_", " ")}</Badge>
                  ) : null}
                  {result.difficultyLevel ? (
                    <Badge variant="secondary">Level {result.difficultyLevel}</Badge>
                  ) : null}
                  <Badge variant="accent">+{result.xpAwarded} XP</Badge>
                </div>
              ) : result.answerText ? (
                <p className="rounded-md bg-muted p-3 text-sm leading-relaxed text-foreground/90">
                  {result.answerText}
                </p>
              ) : null}
              {result.explanation ? (
                <p
                  className={cn(
                    "text-sm",
                    result.correct ? "text-muted-foreground" : "text-foreground/90"
                  )}
                >
                  {result.explanation}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
