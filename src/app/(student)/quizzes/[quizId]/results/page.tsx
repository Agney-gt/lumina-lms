import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { QuizResults } from "@/components/quizzes/quiz-results";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Results" };

const CRUMBS: Crumb[] = [
  { label: "Maths", href: "/lessons" },
  { label: "Number Play", href: "/lessons" },
  { label: "Results" },
];

export default function QuizResultsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={CRUMBS} title="Assessment results" />
      <Suspense
        fallback={
          <div className="mx-auto size-32 animate-pulse rounded-full bg-secondary" />
        }
      >
        <QuizResults />
      </Suspense>
    </div>
  );
}
