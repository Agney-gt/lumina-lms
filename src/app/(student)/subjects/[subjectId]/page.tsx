import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import {
  buildChapterCardData,
  ChapterCard,
  ChapterStatusLegend,
  EmptyChaptersState,
} from "@/components/subjects/chapter-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getChaptersForSubject, getSubject } from "@/lib/content/loader";
import { getChapterMasteryForCard } from "@/lib/server/store";
import { notFound } from "next/navigation";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Subject" };

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();

  const chapters = getChaptersForSubject(subject.id);
  const mastery =
    chapters.length > 0
      ? Math.round(
          chapters.reduce((sum, c) => sum + getChapterMasteryForCard(c.id), 0) /
            chapters.length
        )
      : 0;

  const crumbs: Crumb[] = [
    { label: "Subjects", href: "/subjects" },
    { label: `${subject.name} (Grade ${subject.grade})` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={crumbs} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {subject.name} — Grade {subject.grade}
          </CardTitle>
          <CardDescription>{subject.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="max-w-sm">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Subject mastery</span>
              <span className="font-semibold tabular-nums">{mastery}%</span>
            </div>
            <Progress value={mastery} className="mt-1.5" aria-label={`Subject mastery ${mastery} percent`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(subject.parts ?? []).map((part) => (
              <span
                key={part}
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium"
              >
                {part}
              </span>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="self-start">
            <Link href="/subjects">All subjects</Link>
          </Button>
        </CardContent>
      </Card>

      {chapters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c) => (
            <ChapterCard
              key={c.id}
              data={buildChapterCardData(c.id, getChapterMasteryForCard(c.id))}
            />
          ))}
        </div>
      ) : (
        <EmptyChaptersState subjectName={subject.name} />
      )}
      <ChapterStatusLegend />
    </div>
  );
}
