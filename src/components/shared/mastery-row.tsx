import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MasteryRowProps {
  label: string;
  value: number;
  sublabel?: string;
  href?: string;
  className?: string;
}

export function MasteryRow({ label, value, sublabel, href, className }: MasteryRowProps) {
  const content = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <Progress
        value={value}
        className="mt-1.5"
        aria-label={`${label} mastery: ${value} percent`}
      />
      {sublabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block rounded-lg p-2 -m-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
