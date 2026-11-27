"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
