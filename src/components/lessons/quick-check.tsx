"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickCheckProps {
  questionId: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export function QuickCheck({
  questionId,
  question,
  options,
  correctOptionId,
  explanation,
}: QuickCheckProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === correctOptionId;

  return (
    <div
      className="rounded-xl border border-primary/40 bg-accent/40 p-4"
      aria-label="Quick check"
    >
      <p className="flex items-start gap-2 text-sm font-medium">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Quick check: {question}
      </p>
      <RadioGroup
        value={selected ?? ""}
        onValueChange={(value) => {
          if (!checked) setSelected(value);
        }}
        className="mt-3"
        aria-label={question}
      >
        {options.map((option) => {
          const isSelected = selected === option.id;
          const showAsCorrect = checked && option.id === correctOptionId;
          const showAsWrong = checked && isSelected && !isCorrect;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors",
                showAsCorrect && "border-success bg-success/10",
                showAsWrong && "border-destructive bg-destructive/10",
                !checked && "hover:border-primary/60",
                checked && !showAsCorrect && !showAsWrong && "opacity-70"
              )}
            >
              <RadioGroupItem value={option.id} className="mt-0.5" />
              <span className="flex-1">{option.text}</span>
              {showAsCorrect ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              ) : null}
              {showAsWrong ? (
                <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              ) : null}
            </label>
          );
        })}
      </RadioGroup>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {!checked ? (
          <Button
            size="sm"
            disabled={!selected}
            onClick={() => setChecked(true)}
          >
            Check answer
          </Button>
        ) : (
          <>
            <span
              className={cn(
                "text-sm font-medium",
                isCorrect ? "text-success" : "text-destructive"
              )}
              role="status"
            >
              {isCorrect ? "Correct!" : "Not quite."}
            </span>
            <span className="text-sm text-muted-foreground">{explanation}</span>
            <Button
              size="sm"
              variant="ghost"
              className="sm:ml-auto"
              onClick={() => {
                setChecked(false);
                setSelected(null);
              }}
            >
              Try again
            </Button>
          </>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {checked ? (isCorrect ? "Correct answer" : "Incorrect answer") : ""}
      </span>
      <span id={`qc-${questionId}`} className="sr-only" />
    </div>
  );
}
