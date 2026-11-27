"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Save, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export interface DescriptiveQuestion {
  id: string;
  prompt: string;
  marks: number;
  keyTerms?: string[];
}

interface DescriptiveRunnerProps {
  quizId: string;
  attemptId: string;
  question: DescriptiveQuestion;
  rubricCategories: { id: string; label: string; hint: string }[];
}

interface DescriptiveResponse {
  scorePercent: number;
  passed: boolean;
  xpAwarded: number;
  perCategory: { id: string; label: string; ratio: number; feedback: string }[];
  keyTerms: string[];
}

export function DescriptiveRunner({
  quizId,
  attemptId,
  question,
  rubricCategories,
}: DescriptiveRunnerProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [result, setResult] = useState<DescriptiveResponse | null>(null);

  const charCount = answer.length;
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post<DescriptiveResponse>(`/api/attempts/${attemptId}/answers`, {
        questionId: question.id,
        answerText: answer,
        responseTimeMs: 0,
      }),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Scored ${data.scorePercent}% · +${data.xpAwarded} XP`);
    },
    onError: (error: Error) => {
      toast.error("Could not submit answer", { description: error.message });
    },
  });

  function saveDraft() {
    try {
      sessionStorage.setItem(`draft-${quizId}-${question.id}`, answer);
      setDraftSaved(true);
      toast.success("Draft saved locally");
      setTimeout(() => setDraftSaved(false), 2000);
    } catch {
      toast.error("Could not save draft");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card className="py-5">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-medium leading-relaxed">{question.prompt}</p>
              <Badge variant="outline" className="shrink-0">
                {question.marks} marks
              </Badge>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here. Use full sentences and include an example."
              className="min-h-48 text-[15px]"
              aria-label="Your answer"
              maxLength={4000}
              disabled={Boolean(result)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span aria-live="polite">
                {charCount} characters · {wordCount} words
              </span>
              <span>Minimum 10 characters to submit</span>
            </div>
            {!result ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={answer.trim().length < 10 || submitMutation.isPending}
                >
                  <Send className="size-4" aria-hidden="true" />
                  {submitMutation.isPending ? "Submitting…" : "Submit answer"}
                </Button>
                <Button variant="outline" onClick={saveDraft} disabled={!answer}>
                  <Save className="size-4" aria-hidden="true" />
                  {draftSaved ? "Saved!" : "Save draft"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  className={cn(
                    "rounded-lg border p-4",
                    result.passed
                      ? "border-success/40 bg-success/5"
                      : "border-warning/40 bg-warning/5"
                  )}
                  role="status"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2
                      className={cn(
                        "size-4",
                        result.passed ? "text-success" : "text-warning"
                      )}
                      aria-hidden="true"
                    />
                    Score: {result.scorePercent}% · +{result.xpAwarded} XP
                  </p>
                  <Button
                    className="mt-3"
                    onClick={() =>
                      router.push(`/quizzes/${quizId}/results?attempt=${attemptId}`)
                    }
                  >
                    View full results
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {result.perCategory.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {Math.round(category.ratio * 100)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {category.feedback}
                      </p>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground">
                    Scores are calculated by rules from the configured rubric — no
                    AI-generated feedback.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4" aria-label="Assessment sidebar">
        <Card className="py-4">
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Key terms to include
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {(question.keyTerms ?? []).map((term) => {
                const used = answer.toLowerCase().includes(term.toLowerCase());
                return (
                  <li
                    key={term}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                      used
                        ? "border-success/50 bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {term}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rubric
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {rubricCategories.map((category) => (
                <li key={category.id} className="text-xs leading-snug">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-muted-foreground"> — {category.hint}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
