import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Copilot" };

export default function CopilotPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md py-10">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <span className="bg-secondary text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <Sparkles className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-lg font-semibold">Copilot is coming soon</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            The standalone Lumina Copilot is reserved for a future release. Phase 1
            focuses on lessons, quizzes, progress and your chapter PDF.
          </p>
          <Link href="/home" className="text-sm font-medium text-primary hover:underline">
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
