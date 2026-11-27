export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ConceptCatalogue } from "@/components/lessons/concept-catalogue";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { UnitStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChapter, getLesson, getLessonForUnit, getPdfMappingForChapter, getQuizzesForUnit } from "@/lib/content/loader";
import {
  buildChapterCatalogue,
  getConceptContext,
  getUnitContext,
} from "@/lib/server/catalogue";
import { markLessonVisited } from "@/lib/server/store";
import { cn, formatPages } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Lesson" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapterId: string; conceptId: string; unitId: string }>;
}) {
  const { chapterId, conceptId, unitId } = await params;
  const context = getUnitContext(unitId);
  if (!context || context.concept.id !== conceptId || context.chapterId !== chapterId) {
    notFound();
  }
  const chapter = getChapter(chapterId)!;
  const { unit, concept, siblings, unlocked, status, lessonCompleted } = context;
  const lesson = getLesson(unit.lessonId) ?? getLessonForUnit(unitId);
  if (!lesson) notFound();

  markLessonVisited(unitId);

  const quizzes = getQuizzesForUnit(unitId);
  const pdfMapping = getPdfMappingForChapter(chapterId);
  const firstPageRef = unit.pageReferences[0];
  const pdfHref = pdfMapping
    ? `/chapter-pdf/${chapterId}?page=${firstPageRef?.start ?? 1}`
    : null;

  const conceptContext = getConceptContext(conceptId);
  const catalogue = conceptContext
    ? buildChapterCatalogue(chapterId).filter((c) => c.id === conceptId)
    : [];

  const orderedSiblings = siblings;
  const index = orderedSiblings.findIndex((u) => u.id === unitId);
  const prev = index > 0 ? orderedSiblings[index - 1] : null;
  const next = index < orderedSiblings.length - 1 ? orderedSiblings[index + 1] : null;

  const crumbs: Crumb[] = [
    { label: "Maths", href: "/lessons" },
    { label: chapter.title, href: `/lessons/${chapterId}` },
    { label: concept.title, href: `/lessons/${chapterId}/${conceptId}` },
    { label: unit.title },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24">
          <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
            <Link href={`/lessons/${chapterId}/${conceptId}`}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              {concept.title}
            </Link>
          </Button>
          <Card className="py-3">
            <CardHeader className="px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Units in this concept
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <ScrollArea className="max-h-80">
                <ul className="flex flex-col gap-1 px-1">
                  {orderedSiblings.map((sibling) => {
                    const siblingRecord = conceptContext?.units.find(
                      (u) => u.unit.id === sibling.id
                    );
                    const active = sibling.id === unitId;
                    return (
                      <li key={sibling.id}>
                        <Link
                          href={`/lessons/${chapterId}/${conceptId}/${sibling.id}`}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-accent font-medium text-accent-foreground"
                              : "hover:bg-muted",
                            !siblingRecord?.unlocked && "opacity-60"
                          )}
                        >
                          {!siblingRecord?.unlocked ? (
                            <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                          ) : null}
                          <span className="flex-1 leading-snug">{sibling.title}</span>
                          {siblingRecord?.unlocked ? (
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {siblingRecord.mastery}%
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="py-3 lg:hidden">
            <CardContent>
              <ConceptCatalogue
                chapterId={chapterId}
                concepts={catalogue}
                activeUnitId={unitId}
                activeConceptId={conceptId}
              />
            </CardContent>
          </Card>
        </div>
      </aside>

      <div className="flex flex-col gap-5 lg:col-span-3">
        <PageHeader crumbs={crumbs} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Unit {unit.order}</Badge>
            <UnitStatusBadge status={status} unlocked={unlocked} />
            {unit.estimatedDurationMinutes ? (
              <span className="text-xs text-muted-foreground">
                ~{unit.estimatedDurationMinutes} min
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5" aria-label="Activity navigation">
            <span className="text-xs text-muted-foreground">Activities:</span>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/lessons/${chapterId}/${conceptId}/${unitId}`}>Lesson</Link>
            </Button>
            {quizzes.map((quiz) => (
              <Button key={quiz.id} asChild size="sm" variant="outline">
                <Link href={`/quizzes/${quiz.id}`}>
                  <Target className="size-3.5" aria-hidden="true" />
                  {quiz.type === "mcq" ? "MCQ" : "Descriptive"}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {unlocked ? (
          <article className="rounded-xl border border-border bg-card p-4 md:p-6">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {lesson.title}
            </h1>
            <div className="mt-5">
              <LessonRenderer
                lesson={lesson}
                unitId={unitId}
                pdfHref={pdfHref}
                pdfPagesLabel={
                  firstPageRef ? formatPages(firstPageRef.start, firstPageRef.end) : null
                }
                quizzes={quizzes.map((q) => ({
                  id: q.id,
                  title: q.title,
                  type: q.type,
                  questionCount: q.questions.length,
                }))}
                lessonCompleted={lessonCompleted}
                nextUnitHref={next ? `/lessons/${chapterId}/${conceptId}/${next.id}` : null}
                nextUnitTitle={next?.title ?? null}
              />
            </div>
          </article>
        ) : (
          <Card className="items-center py-12">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">This unit is locked</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Complete the earlier units in {concept.title} to unlock
                &ldquo;{unit.title}&rdquo;.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/lessons/${chapterId}/${conceptId}`}>
                  Back to concept
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <nav
          aria-label="Lesson navigation"
          className="flex items-center justify-between gap-3"
        >
          {prev ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/lessons/${chapterId}/${conceptId}/${prev.id}`}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                {prev.title}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/lessons/${chapterId}/${conceptId}/${next.id}`}>
                {next.title}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
