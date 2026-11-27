export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, Lock, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ConceptCatalogue } from "@/components/lessons/concept-catalogue";
import { QuizTypeBadge, UnitStatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getChapter, getQuizzesForUnit } from "@/lib/content/loader";
import {
  buildChapterCatalogue,
  getConceptContext,
} from "@/lib/server/catalogue";
import { formatMinutes } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Concept" };

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ chapterId: string; conceptId: string }>;
}) {
  const { chapterId, conceptId } = await params;
  const context = getConceptContext(conceptId);
  if (!context || context.chapterId !== chapterId) notFound();
  const chapter = getChapter(chapterId)!;
  const { concept, units, unlocked, mastery } = context;

  const crumbs: Crumb[] = [
    { label: "Maths", href: "/lessons" },
    { label: chapter.title, href: `/lessons/${chapterId}` },
    { label: concept.title },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <PageHeader crumbs={crumbs} className="lg:hidden" />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{concept.title}</CardTitle>
              {!unlocked ? (
                <Badge variant="locked">
                  <Lock className="size-3" aria-hidden="true" />
                  Locked
                </Badge>
              ) : null}
            </div>
            <CardDescription>{concept.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Concept mastery</span>
                <span className="font-semibold tabular-nums">{mastery}%</span>
              </div>
              <Progress value={mastery} className="mt-1.5" aria-label={`Concept mastery ${mastery} percent`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Learning objectives
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-foreground/90">
                {concept.learningObjectives.map((objective, i) => (
                  <li key={i}>{objective}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Textbook reference: pages {concept.textbookPages.start}–
              {concept.textbookPages.end}
            </p>
          </CardContent>
        </Card>
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle className="text-sm">All concepts in this chapter</CardTitle>
          </CardHeader>
          <CardContent>
            <ConceptCatalogue
              chapterId={chapterId}
              concepts={buildChapterCatalogue(chapterId).filter(
                (c) => c.id === conceptId
              )}
              activeConceptId={conceptId}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-3">
        <PageHeader crumbs={crumbs} className="hidden lg:flex" />
        <div className="flex flex-col gap-3">
          {units.map(({ unit, status, unlocked, mastery: unitMastery }) => {
            const quizzes = getQuizzesForUnit(unit.id);
            return (
              <Card key={unit.id} className="gap-3 py-4">
                <CardHeader className="flex-row items-start justify-between gap-3 px-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm leading-snug">{unit.title}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      ~{formatMinutes(unit.estimatedDurationMinutes)} ·{" "}
                      {unit.pageReferences
                        .map((r) =>
                          r.start === r.end ? `p. ${r.start}` : `pp. ${r.start}–${r.end}`
                        )
                        .join(", ")}{" "}
                      in textbook
                    </CardDescription>
                  </div>
                  <UnitStatusBadge status={status} unlocked={unlocked} />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 px-4">
                  <div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">Unit mastery</span>
                      <span className="font-medium tabular-nums">{unitMastery}%</span>
                    </div>
                    <Progress
                      value={unitMastery}
                      className="mt-1 h-1.5"
                      aria-label={`${unit.title} mastery ${unitMastery} percent`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {unlocked ? (
                      <Button asChild size="sm">
                        <Link href={`/lessons/${chapterId}/${conceptId}/${unit.id}`}>
                          Open lesson
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-md bg-disabled/60 px-3 py-2 text-xs text-muted-foreground">
                        <Lock className="size-3.5" aria-hidden="true" />
                        Complete earlier units to unlock
                      </span>
                    )}
                    {unlocked
                      ? quizzes.map((quiz) => (
                          <Button
                            key={quiz.id}
                            asChild
                            size="sm"
                            variant="outline"
                          >
                            <Link href={`/quizzes/${quiz.id}`}>
                              <Target className="size-3.5" aria-hidden="true" />
                              <QuizTypeBadge type={quiz.type} />
                              {quiz.questions.length} questions
                            </Link>
                          </Button>
                        ))
                      : null}
                    <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
                      <Link href={`/chapter-pdf/${chapterId}?page=${concept.textbookPages.start}`}>
                        <FileText className="size-3.5" aria-hidden="true" />
                        PDF pp. {concept.textbookPages.start}–{concept.textbookPages.end}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
