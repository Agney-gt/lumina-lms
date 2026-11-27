"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdaptiveLadder({
  currentLevel,
  minLevel,
  maxLevel,
}: {
  currentLevel: number;
  minLevel: number;
  maxLevel: number;
}) {
  const levels = Array.from(
    { length: maxLevel - minLevel + 1 },
    (_, i) => maxLevel - i
  );
  return (
    <Card className="py-4" aria-label="Adaptive difficulty ladder">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Difficulty ladder
        </p>
        <ol className="mt-2 flex flex-col-reverse gap-1.5">
          {levels.map((lvl) => {
            const active = lvl === currentLevel;
            const below = lvl < currentLevel;
            return (
              <li
                key={lvl}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : below
                      ? "border-success/30 bg-success/5 text-muted-foreground"
                      : "border-border text-muted-foreground"
                )}
              >
                <span>Level {lvl}</span>
                {active ? <span className="text-[10px] uppercase">Now</span> : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Correct answers raise the level; wrong answers lower it.
        </p>
      </CardContent>
    </Card>
  );
}
