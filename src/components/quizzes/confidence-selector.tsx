"use client";

import { CircleHelp, CircleQuestionMark, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Confidence } from "@/types/curriculum";

const OPTIONS: { value: Confidence; label: string; icon: React.ReactNode }[] = [
  { value: "guessing", label: "Guessing", icon: <CircleHelp className="size-3.5" aria-hidden="true" /> },
  { value: "fairly_sure", label: "Fairly sure", icon: <CircleQuestionMark className="size-3.5" aria-hidden="true" /> },
  { value: "certain", label: "Certain", icon: <Lightbulb className="size-3.5" aria-hidden="true" /> },
];

export function ConfidenceSelector({
  value,
  onChange,
  disabled,
}: {
  value: Confidence | null;
  onChange: (value: Confidence) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        How confident are you?
      </legend>
      <div className="mt-1.5 flex gap-2" role="radiogroup" aria-label="Confidence level">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              value === option.value
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
