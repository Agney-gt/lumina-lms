export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { ConceptCatalogue } from "@/components/lessons/concept-catalogue";
import { Card, CardContent } from "@/components/ui/card";
import {
  getChapter,
  getCurriculumStats,
} from "@/lib/content/loader";
import { buildChapterCatalogue } from "@/lib/server/catalogue";
import { formatPages } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Lessons" };

export default function LessonsPage() {
  const chapterId = "number-play";
  const chapter = getChapter(chapterId)!;
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
      <Card className="py-4">
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-medium">
            Chapter {chapter.chapterNumber} · {chapter.title}
          </span>
          <span className="text-muted-foreground">
            {stats.conceptCount} concepts
          </span>
          <span className="text-muted-foreground">{stats.unitCount} units</span>
          <span className="text-muted-foreground">
            Textbook {formatPages(chapter.pageRange?.start ?? 0, chapter.pageRange?.end ?? 0)}
          </span>
        </CardContent>
      </Card>
      <ConceptCatalogue chapterId={chapterId} concepts={concepts} />
    </div>
  );
}
