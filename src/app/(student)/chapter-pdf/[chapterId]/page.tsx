export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { FileText, Link2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PdfPositionSaver } from "@/components/pdf/pdf-position-saver";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getChapter, getPdfMappingForChapter, getUnit } from "@/lib/content/loader";
import { getLearnerData } from "@/lib/server/store";
import { formatPages } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Chapter PDF" };

export default async function ChapterPdfPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { chapterId } = await params;
  const { page } = await searchParams;
  const chapter = getChapter(chapterId);
  if (!chapter) notFound();
  const mapping = getPdfMappingForChapter(chapterId);
  const saved = getLearnerData().pdfProgress[mapping?.pdfId ?? ""];
  const requestedPage = Number(page) || saved?.lastPage || 1;

  const crumbs: Crumb[] = [
    { label: "Maths", href: "/lessons" },
    { label: chapter.title, href: `/lessons/${chapterId}` },
    { label: "Chapter PDF" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={crumbs} title="Chapter PDF" description="Integrated textbook reader for this chapter." />

      <Alert variant="info">
        <FileText className="size-4" aria-hidden="true" />
        <AlertTitle>Reader arrives in the next phase</AlertTitle>
        <AlertDescription>
          The full PDF viewer with zoom, text search, highlights and notes is planned
          for Phase 6. Your reading position and the textbook-to-lesson mapping below
          are already tracked, so cross-module links work today.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>
                Chapter {chapter.chapterNumber} · {chapter.title}
              </CardTitle>
              {mapping ? (
                <div className="flex gap-1.5">
                  <Badge variant={mapping.sourceType === "local" ? "success" : "accent"}>
                    {mapping.sourceType === "local" ? "Local asset" : "Hosted"}
                  </Badge>
                  <Badge variant="secondary">v{mapping.version}</Badge>
                </div>
              ) : null}
            </div>
            <CardDescription>
              {chapter.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              className="flex h-72 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 text-center"
              role="img"
              aria-label="PDF canvas placeholder"
            >
              <div>
                <FileText className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium">
                  Document canvas — page {requestedPage} of {mapping?.totalPages ?? "?"}
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {mapping?.sourceType === "local"
                    ? `Local asset: ${mapping.assetPath}`
                    : "Hosted PDF URL"}
                </p>
              </div>
            </div>
            {mapping ? (
              <PdfPositionSaver
                pdfId={mapping.pdfId}
                totalPages={mapping.totalPages}
                initialPage={requestedPage}
              />
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Your position</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm">
              {saved ? (
                <>
                  <p className="text-2xl font-semibold tabular-nums">
                    Page {saved.lastPage}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last viewed{" "}
                    {new Date(saved.lastViewedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No reading position saved yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Link2 className="size-4 text-primary" aria-hidden="true" />
                Linked learning units
              </CardTitle>
              <CardDescription className="text-xs">
                Textbook pages mapped to lessons
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <ul className="flex flex-col gap-2">
                {(mapping?.pageMappings ?? []).map((entry) => (
                  <li key={entry.label} className="rounded-lg border border-border p-2.5">
                    <p className="text-xs font-medium">
                      {formatPages(entry.pages.start, entry.pages.end)} — {entry.label}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {entry.unitIds.map((unitId) => {
                        const unit = getUnit(unitId);
                        return (
                          <Button
                            key={unitId}
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-auto px-1.5 py-0.5 text-xs text-primary"
                          >
                            <a href={`/lessons/${chapterId}/${unit?.conceptId ?? ""}/${unitId}`}>
                              {unit?.title ?? unitId}
                            </a>
                          </Button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
