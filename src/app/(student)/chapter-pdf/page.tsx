export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChaptersForSubject } from "@/lib/content/loader";
import { getLearnerData } from "@/lib/server/store";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Chapter PDF" };

const CRUMBS: Crumb[] = [
  { label: "Maths", href: "/lessons" },
  { label: "Chapter PDF" },
];

export default function ChapterPdfIndexPage() {
  const chapters = getChaptersForSubject("maths-grade-8");
  const pdfProgress = getLearnerData().pdfProgress;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        crumbs={CRUMBS}
        title="Chapter PDF"
        description="Open the integrated textbook reader for any chapter."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {chapters.map((chapter) => {
          const saved = chapter.pdfId ? pdfProgress[chapter.pdfId] : undefined;
          return (
            <Card key={chapter.id} className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-sm">
                  Chapter {chapter.chapterNumber} · {chapter.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {chapter.pageRange
                    ? `Textbook pages ${chapter.pageRange.start}–${chapter.pageRange.end}`
                    : "Textbook edition"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  {saved
                    ? `Last read: page ${saved.lastPage}`
                    : "Not started yet"}
                </p>
                <Button asChild size="sm" className="justify-start">
                  <Link href={`/chapter-pdf/${chapter.id}`}>
                    <FileText className="size-4" aria-hidden="true" />
                    {saved ? `Resume at page ${saved.lastPage}` : "Open reader"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="border-dashed py-4">
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <BookOpen className="size-4 shrink-0" aria-hidden="true" />
          Lessons and quizzes link directly to the relevant textbook pages — see the
          mapping inside each reader.
        </CardContent>
      </Card>
    </div>
  );
}
