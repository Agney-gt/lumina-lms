import { Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  buildChapterCardData,
  ChapterCard,
  ChapterStatusLegend,
  EmptyChaptersState,
} from "@/components/subjects/chapter-card";
import { SubjectCarousel } from "@/components/subjects/subject-carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getChaptersForSubject, getSubject, getSubjects } from "@/lib/content/loader";
import { getChapterMasteryForCard } from "@/lib/server/store";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Subjects" };

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; q?: string }>;
}) {
  const params = await searchParams;
  const subjects = getSubjects();
  const selectedId = params.subject ?? subjects[0]?.id;
  const subject = selectedId ? getSubject(selectedId) : undefined;
  const query = (params.q ?? "").trim().toLowerCase();

  const carouselItems = subjects.map((s) => {
    const chapters = getChaptersForSubject(s.id);
    const avgMastery =
      chapters.length > 0
        ? Math.round(
            chapters.reduce((sum, c) => sum + getChapterMasteryForCard(c.id), 0) /
              chapters.length
          )
        : 0;
    return {
      id: s.id,
      name: s.name,
      grade: s.grade,
      book: s.book,
      publisher: s.publisher,
      mastery: avgMastery,
      chapterCount: chapters.length,
      selected: s.id === subject?.id,
      href: `/subjects?subject=${s.id}`,
    };
  });

  const chapters = subject
    ? getChaptersForSubject(subject.id)
        .filter((c) =>
          query
            ? c.title.toLowerCase().includes(query) ||
              c.description.toLowerCase().includes(query)
            : true
        )
        .map((c) => buildChapterCardData(c.id, getChapterMasteryForCard(c.id)))
    : [];

  const crumb: Crumb[] = [{ label: "Subjects" }];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={crumb} title="Subjects" description="Choose a subject to see its chapters and progress." />

      <SubjectCarousel items={carouselItems} />

      {subject ? (
        <>
          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  {subject.name} — Grade {subject.grade}
                </CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </div>
              <form action="/subjects" method="get" className="flex gap-2" role="search">
                <input type="hidden" name="subject" value={subject.id} />
                <label htmlFor="chapter-search" className="sr-only">
                  Search chapters
                </label>
                <div className="relative">
                  <Search
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    id="chapter-search"
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Search chapters…"
                    className="w-56 pl-8"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">
                  Search
                </Button>
              </form>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(subject.parts ?? []).map((part) => (
                <span
                  key={part}
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {part}
                </span>
              ))}
            </CardContent>
          </Card>

          {chapters.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {chapters.map((data) => (
                <ChapterCard key={data.id} data={data} />
              ))}
            </div>
          ) : (
            <EmptyChaptersState subjectName={subject.name} />
          )}

          <ChapterStatusLegend />
        </>
      ) : null}
    </div>
  );
}
