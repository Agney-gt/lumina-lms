"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AdaptiveLadder } from "@/components/quizzes/adaptive-ladder";
import { ConfidenceSelector } from "@/components/quizzes/confidence-selector";
import { api } from "@/lib/api/client";
import { useQuizStore } from "@/stores";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/types/curriculum";

export interface RunnerQuiz {
  id: string;
  type: "mcq" | "descriptive";
  title: string;
  instructions: string;
  questions: {
    id: string;
    prompt: string;
    options?: { id: string; text: string }[];
    difficulty?: number;
    marks: number;
    keyTerms?: string[];
    rubricId?: string;
  }[];
  difficulty: { enabled: boolean; startLevel: number; minLevel: number; maxLevel: number } | null;
  passingThreshold: number;
  scoringPolicy: { xpPerCorrect: number; confidenceMultipliers: Record<Confidence, number> };
}

interface McqRunnerProps {
  quiz: RunnerQuiz;
  attemptId: string;
  firstQuestionId: string;
  currentLevel: number;
  answeredQuestionIds: string[];
}

interface FeedbackResponse {
  correct: boolean;
  correctOptionId: string | null;
  explanation: string | null;
  xpAwarded: number;
  currentLevel: number;
  nextQuestionId: string | null;
  answeredCount: number;
  totalQuestions: number;
}

export function McqRunner({
  quiz,
  attemptId,
  firstQuestionId,
  currentLevel,
  answeredQuestionIds,
}: McqRunnerProps) {
  const router = useRouter();
  const [questionId, setQuestionId] = useState(firstQuestionId);
  const [level, setLevel] = useState(currentLevel);
  const [answered, setAnswered] = useState<string[]>(answeredQuestionIds);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { selectedOptionId, confidence, questionStartedAt, setSelection, setConfidence, resetQuestion, markQuestionShown } =
    useQuizStore();

  const questionIndex = useMemo(
    () => quiz.questions.findIndex((q) => q.id === questionId),
    [quiz.questions, questionId]
  );
  const question = quiz.questions[questionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Math.max(answered.length, feedback ? answered.length + 1 : answered.length);

  useEffect(() => {
    resetQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const submitMutation = useMutation({
    mutationFn: (payload: {
      questionId: string;
      selectedOptionId: string;
      confidence: Confidence;
      responseTimeMs: number;
    }) =>
      api.post<FeedbackResponse>(`/api/attempts/${attemptId}/answers`, payload),
    onSuccess: (data, variables) => {
      setFeedback(data);
      setLevel(data.currentLevel);
      setAnswered((prev) =>
        prev.includes(variables.questionId) ? prev : [...prev, variables.questionId]
      );
      if (data.correct) setCorrectCount((n) => n + 1);
      if (data.xpAwarded > 0) {
        toast.success(`+${data.xpAwarded} XP`, { description: "Answer recorded." });
      }
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
      toast.error("Could not submit answer", { description: error.message });
    },
  });

  function handleSubmit() {
    if (!selectedOptionId || !confidence) return;
    setSubmitError(null);
    const responseTimeMs = questionStartedAt ? Date.now() - questionStartedAt : 0;
    submitMutation.mutate({
      questionId,
      selectedOptionId,
      confidence,
      responseTimeMs,
    });
  }

  function handleNext() {
    if (feedback?.nextQuestionId) {
      setFeedback(null);
      setSelection(null);
      setConfidence(null);
      setQuestionId(feedback.nextQuestionId);
      markQuestionShown();
    } else {
      router.push(`/quizzes/${quiz.id}/results?attempt=${attemptId}`);
    }
  }

  function finishQuiz() {
    router.push(`/quizzes/${quiz.id}/results?attempt=${attemptId}`);
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Question not found.{" "}
          <Button variant="link" onClick={finishQuiz}>
            Go to results
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canSubmit = Boolean(selectedOptionId && confidence) && !submitMutation.isPending;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Question {Math.min(answeredCount + (feedback ? 0 : 1), totalQuestions)} of{" "}
              {totalQuestions}
            </Badge>
            {quiz.difficulty?.enabled ? (
              <Badge variant="accent" title="Adaptive difficulty level">
                Level {level} / {quiz.difficulty.maxLevel}
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {feedback?.answeredCount ?? answered.length} answered
          </span>
        </div>
        <Progress
          value={((feedback?.answeredCount ?? answered.length) / totalQuestions) * 100}
          aria-label="Quiz progress"
        />

        <Card className="py-5">
          <CardContent className="flex flex-col gap-4">
            <p className="text-[15px] font-medium leading-relaxed">{question.prompt}</p>
            <RadioGroup
              value={selectedOptionId ?? ""}
              onValueChange={(v) => {
                if (!feedback) setSelection(v);
              }}
              className="gap-2.5"
              aria-label={question.prompt}
            >
              {question.options?.map((option) => {
                const isCorrect =
                  feedback && option.id === feedback.correctOptionId;
                const isWrongPick =
                  feedback &&
                  feedback.correctOptionId !== null &&
                  option.id === selectedOptionId &&
                  !feedback.correct;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors",
                      feedback && isCorrect && "border-success bg-success/10",
                      feedback && isWrongPick && "border-destructive bg-destructive/10",
                      !feedback && "hover:border-primary/60",
                      feedback && !isCorrect && !isWrongPick && "opacity-70",
                      feedback && "cursor-default"
                    )}
                  >
                    <RadioGroupItem value={option.id} className="mt-0.5" />
                    <span className="flex-1">{option.text}</span>
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    ) : null}
                    {isWrongPick ? (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    ) : null}
                  </label>
                );
              })}
            </RadioGroup>

            {!feedback ? (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <ConfidenceSelector
                  value={confidence}
                  onChange={setConfidence}
                  disabled={submitMutation.isPending}
                />
                {submitError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={!canSubmit}>
                    {submitMutation.isPending ? "Submitting…" : "Submit answer"}
                  </Button>
                  {answered.length > 0 ? (
                    <Button variant="ghost" onClick={finishQuiz}>
                      Finish now
                    </Button>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Correct answers earn {quiz.scoringPolicy.xpPerCorrect} XP; confidence
                  adjusts the reward.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-4",
                  feedback.correct
                    ? "border-success/40 bg-success/5"
                    : "border-destructive/40 bg-destructive/5"
                )}
                role="status"
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {feedback.correct ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                      Correct! +{feedback.xpAwarded} XP
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-destructive" aria-hidden="true" />
                      Not quite — the correct answer is highlighted.
                    </>
                  )}
                </p>
                {feedback.explanation ? (
                  <p className="text-sm text-muted-foreground">{feedback.explanation}</p>
                ) : null}
                <Button onClick={handleNext} className="self-start">
                  {(feedback.answeredCount ?? 0) >= totalQuestions
                    ? "See results"
                    : "Next question"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4" aria-label="Assessment sidebar">
        {quiz.difficulty?.enabled ? (
          <AdaptiveLadder
            currentLevel={level}
            minLevel={quiz.difficulty.minLevel}
            maxLevel={quiz.difficulty.maxLevel}
          />
        ) : null}
        <Card className="py-4">
          <CardContent className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Accuracy this session
            </p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums">
              {answered.length > 0
                ? `${Math.round((correctCount / answered.length) * 100)}%`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {correctCount} correct so far in this session
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
