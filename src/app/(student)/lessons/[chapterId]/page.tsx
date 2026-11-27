export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ConceptCatalogue } from "@/components/lessons/concept-catalogue";
import { getChapter, getCurriculumStats } from "@/lib/content/loader";
import { buildChapterCatalogue } from "@/lib/server/catalogue";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Chapter" };

export default async function ChapterLessonsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getChapter(chapterId);
  if (!chapter) notFound();

  const stats = getCurriculumStats(chapterId);
  const concepts = buildChapterCatalogue(chapterId);

  const crumbs: Crumb[] = [
    { label: "Maths", href: "/subjects/maths-grade-8" },
    { label: chapter.title },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        crumbs={crumbs}
        title={chapter.title}
        description={chapter.description}
      />
      <ConceptCatalogue chapterId={chapterId} concepts={concepts} />
      <p className="text-xs text-muted-foreground">
        {stats.conceptCount} concepts · {stats.unitCount} learning units
      </p>
    </div>
  );
}
