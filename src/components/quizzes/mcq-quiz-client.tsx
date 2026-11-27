"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { McqRunner } from "@/components/quizzes/mcq-runner";
import { api } from "@/lib/api/client";
import type { RunnerQuiz } from "@/components/quizzes/mcq-runner";

interface StartResponse {
  attemptId: string;
  resumed: boolean;
  answeredQuestionIds: string[];
  currentLevel: number;
  nextQuestionId: string | null;
}

export function McqQuizClient({
  quiz,
  resumeAttemptId,
  resumeAnsweredIds,
}: {
  quiz: RunnerQuiz;
  resumeAttemptId: string | null;
  resumeAnsweredIds: string[];
}) {
  const [started, setStarted] = useState<StartResponse | null>(
    resumeAttemptId
      ? {
          attemptId: resumeAttemptId,
          resumed: true,
          answeredQuestionIds: resumeAnsweredIds,
          currentLevel: quiz.difficulty?.startLevel ?? 2,
          nextQuestionId:
            quiz.questions.find((q) => !resumeAnsweredIds.includes(q.id))?.id ?? null,
        }
      : null
  );
  const [error, setError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () =>
      api.post<StartResponse>("/api/attempts", { quizId: quiz.id }),
    onSuccess: setStarted,
    onError: (err: Error) => setError(err.message),
  });

  useEffect(() => {
    if (!started) {
      startMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Could not start the assessment: {error}
        </CardContent>
      </Card>
    );
  }

  if (!started || !started.nextQuestionId) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {started
            ? "All questions are answered — see your results."
            : "Preparing your assessment session…"}
        </CardContent>
      </Card>
    );
  }

  return (
    <McqRunner
      key={started.attemptId}
      quiz={quiz}
      attemptId={started.attemptId}
      firstQuestionId={started.nextQuestionId}
      currentLevel={started.currentLevel}
      answeredQuestionIds={started.answeredQuestionIds}
    />
  );
}
