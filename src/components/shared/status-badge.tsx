import { Badge } from "@/components/ui/badge";
import type { UnitStatus } from "@/types/learner";
import type { QuizType } from "@/types/curriculum";

const UNIT_STATUS_CONFIG: Record<
  UnitStatus,
  { label: string; variant: "charcoal" | "can-do" | "default" | "recommended" | "locked" | "outline" }
> = {
  explained: { label: "Explained", variant: "charcoal" },
  can_do: { label: "Can do", variant: "can-do" },
  in_progress: { label: "In progress", variant: "default" },
  not_started: { label: "Not started", variant: "outline" },
};

const LOCKED_CONFIG = { label: "Locked", variant: "locked" } as const;

export function UnitStatusBadge({
  status,
  unlocked,
}: {
  status: UnitStatus;
  unlocked?: boolean;
}) {
  if (unlocked === false) {
    return (
      <Badge variant={LOCKED_CONFIG.variant}>
        <span aria-hidden="true">🔒</span> Locked
      </Badge>
    );
  }
  const config = UNIT_STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const QUIZ_TYPE_CONFIG: Record<QuizType, { label: string; variant: "default" | "accent" }> = {
  mcq: { label: "MCQ", variant: "default" },
  descriptive: { label: "Descriptive", variant: "accent" },
};

export function QuizTypeBadge({ type }: { type: QuizType }) {
  const config = QUIZ_TYPE_CONFIG[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ReviewBadge({ overdue }: { overdue?: boolean }) {
  return (
    <Badge variant={overdue ? "destructive" : "warning"}>
      {overdue ? "Overdue review" : "Review due"}
    </Badge>
  );
}
