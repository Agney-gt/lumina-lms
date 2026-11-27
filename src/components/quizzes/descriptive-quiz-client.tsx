"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DescriptiveRunner } from "@/components/quizzes/descriptive-runner";
import { api } from "@/lib/api/client";
import type { RunnerQuiz } from "@/components/quizzes/mcq-runner";

interface StartResponse {
  attemptId: string;
  resumed: boolean;
  answeredQuestionIds: string[];
}

export function DescriptiveQuizClient({
  quiz,
  rubricCategories,
  resumeAttemptId,
  resumeAnsweredIds,
}: {
  quiz: RunnerQuiz;
  rubricCategories: { id: string; label: string; hint: string }[];
  resumeAttemptId: string | null;
  resumeAnsweredIds: string[];
}) {
  const [started, setStarted] = useState<StartResponse | null>(
    resumeAttemptId
      ? { attemptId: resumeAttemptId, resumed: true, answeredQuestionIds: resumeAnsweredIds }
      : null
  );
  const [error, setError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => api.post<StartResponse>("/api/attempts", { quizId: quiz.id }),
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

  if (!started) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Preparing your assessment session…
        </CardContent>
      </Card>
    );
  }

  const question = quiz.questions.find(
    (q) => !started.answeredQuestionIds.includes(q.id)
  );

  if (!question) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            You have answered every question in this attempt.
          </p>
          <Button asChild>
            <Link href={`/quizzes/${quiz.id}/results?attempt=${started.attemptId}`}>
              View results
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <DescriptiveRunner
      key={started.attemptId}
      quizId={quiz.id}
      attemptId={started.attemptId}
      question={{
        id: question.id,
        prompt: question.prompt,
        marks: question.marks,
        keyTerms: question.keyTerms,
      }}
      rubricCategories={rubricCategories}
    />
  );
}
