export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { McqQuizClient } from "@/components/quizzes/mcq-quiz-client";
import { DescriptiveQuizClient } from "@/components/quizzes/descriptive-quiz-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { getChapter, getConcept, getQuiz, getRubric, getUnit } from "@/lib/content/loader";
import { isUnitUnlocked } from "@/lib/calculations/status";
import { getLearnerData } from "@/lib/server/store";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Quiz" };

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = getQuiz(quizId);
  if (!quiz) notFound();

  const unit = getUnit(quiz.unitId);
  const concept = getConcept(quiz.conceptId);
  const chapter = getChapter(unit?.conceptId ? "number-play" : "number-play");
  const allProgress = getLearnerData().unitProgress;
  const unlocked = unit ? isUnitUnlocked(unit.id, allProgress) : false;
  const inProgress = getLearnerData().attempts.find(
    (a) => a.quizId === quizId && a.status === "in_progress"
  );

  const crumbs: Crumb[] = [
    { label: "Maths", href: "/lessons" },
    { label: chapter?.title ?? "Number Play", href: "/lessons" },
    { label: concept?.title ?? "", href: `/lessons/number-play/${quiz.conceptId}` },
    { label: unit?.title ?? "", href: `/lessons/number-play/${quiz.conceptId}/${quiz.unitId}` },
    { label: quiz.type === "mcq" ? "MCQ" : "Descriptive" },
  ];

  const clientQuiz = {
    id: quiz.id,
    type: quiz.type,
    title: quiz.title,
    instructions: quiz.instructions,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      difficulty: q.difficulty,
      marks: q.marks,
      keyTerms: q.keyTerms,
      rubricId: q.rubricId,
    })),
    difficulty: quiz.difficulty ?? null,
    passingThreshold: quiz.passingThreshold,
    scoringPolicy: quiz.scoringPolicy,
  };

  const rubric = quiz.rubricId ? getRubric(quiz.rubricId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={crumbs} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {quiz.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{quiz.instructions}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{quiz.questions.length} questions</Badge>
          <Badge variant="accent">Pass at {quiz.passingThreshold}%</Badge>
        </div>
      </div>

      {!unlocked ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">This assessment is locked</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Complete the lesson for &ldquo;{unit?.title}&rdquo; and its earlier units
              to unlock this quiz.
            </p>
            <Link
              href={`/lessons/number-play/${quiz.conceptId}/${quiz.unitId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to the lesson
            </Link>
          </CardContent>
        </Card>
      ) : quiz.type === "mcq" ? (
        <McqQuizClient
          quiz={clientQuiz}
          resumeAttemptId={inProgress?.id ?? null}
          resumeAnsweredIds={inProgress?.answers.map((a) => a.questionId) ?? []}
        />
      ) : (
        <DescriptiveQuizClient
          quiz={clientQuiz}
          rubricCategories={rubric?.categories ?? []}
          resumeAttemptId={inProgress?.id ?? null}
          resumeAnsweredIds={inProgress?.answers.map((a) => a.questionId) ?? []}
        />
      )}
    </div>
  );
}
