import katex from "katex";

import { cn } from "@/lib/utils";

export function Math({
  value,
  display = false,
  className,
}: {
  value: string;
  display?: boolean;
  className?: string;
}) {
  const html = katex.renderToString(value, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });
  return (
    <span
      className={cn(display && "my-3 block overflow-x-auto text-center", className)}
      aria-label={value}
      role="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
