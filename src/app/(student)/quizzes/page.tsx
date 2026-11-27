"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CircleCheck,
  CircleX,
  Filter,
  Play,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuizTypeBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface QuizCardData {
  id: string;
  title: string;
  type: "mcq" | "descriptive";
  unitId: string;
  unitTitle: string;
  conceptId: string;
  conceptTitle: string;
  questionCount: number;
  estimatedDurationMinutes: number;
  unlocked: boolean;
  bestScore: number | null;
  attemptCount: number;
  inProgress: boolean;
  passingThreshold: number;
}

const CONCEPTS = [
  { id: "parity", title: "Parity" },
  { id: "remainders", title: "Remainders" },
  { id: "divisibility-rules", title: "Divisibility rules" },
  { id: "shortcuts", title: "Shortcuts" },
  { id: "digital-roots", title: "Digital roots" },
  { id: "cryptarithms", title: "Cryptarithms" },
];

export default function QuizzesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [conceptFilter, setConceptFilter] = useState<string>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => api.get<{ quizzes: QuizCardData[] }>("/api/quizzes"),
  });

  const queryClient = useQueryClient();
  void queryClient;

  const quizzes = (data?.quizzes ?? []).filter(
    (q) =>
      (typeFilter === "all" || q.type === typeFilter) &&
      (conceptFilter === "all" || q.conceptId === conceptFilter)
  );

  const available = quizzes.filter((q) => !q.inProgress);
  const inProgress = quizzes.filter((q) => q.inProgress);
  const completed = quizzes.filter((q) => q.attemptCount > 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Quizzes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Maths · Ganita Prakash · Number Play
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Quiz filters">
        <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger aria-label="Filter by assessment type" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="descriptive">Descriptive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={conceptFilter} onValueChange={setConceptFilter}>
          <SelectTrigger aria-label="Filter by concept" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All concepts</SelectItem>
            {CONCEPTS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="py-4">
              <CardContent className="flex flex-col gap-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
                <div className="h-9 w-full animate-pulse rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Quizzes could not be loaded. Check your connection and try again.
          </CardContent>
        </Card>
      ) : (
        <>
          {inProgress.length > 0 ? (
            <section aria-label="In progress">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                In progress
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {inProgress.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} highlight />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-label="Available quizzes">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Available ({available.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {available.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </section>

          {completed.length > 0 ? (
            <section aria-label="Completed quizzes">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Attempted ({completed.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {completed.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function QuizCard({
  quiz,
  highlight,
}: {
  quiz: QuizCardData;
  highlight?: boolean;
}) {
  const passed = quiz.bestScore !== null && quiz.bestScore >= quiz.passingThreshold;
  return (
    <Card
      className={cn(
        "gap-3 py-4",
        highlight && "border-primary/50",
        !quiz.unlocked && "opacity-80"
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{quiz.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {quiz.conceptTitle} · {quiz.unitTitle}
            </p>
          </div>
          <QuizTypeBadge type={quiz.type} />
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary">{quiz.questionCount} questions</Badge>
          <Badge variant="secondary">~{quiz.estimatedDurationMinutes} min</Badge>
          {quiz.bestScore !== null ? (
            <Badge variant={passed ? "success" : "warning"}>
              Best {quiz.bestScore}%
            </Badge>
          ) : null}
          {quiz.inProgress ? <Badge variant="default">Resume</Badge> : null}
        </div>
        {quiz.bestScore !== null ? (
          <Progress
            value={quiz.bestScore}
            className="h-1.5"
            aria-label={`Best score ${quiz.bestScore} percent`}
          />
        ) : null}
        {quiz.unlocked ? (
          <Button asChild size="sm" className="justify-center">
            <Link href={`/quizzes/${quiz.id}`}>
              {quiz.inProgress ? (
                <RotateCcw className="size-4" aria-hidden="true" />
              ) : quiz.attemptCount > 0 ? (
                <CircleCheck className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {quiz.inProgress ? "Resume quiz" : quiz.attemptCount > 0 ? "Retake" : "Start"}
            </Link>
          </Button>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-md bg-disabled/60 px-3 py-2 text-xs text-muted-foreground">
            <CircleX className="size-3.5" aria-hidden="true" />
            Unlock by completing the lesson unit
          </span>
        )}
        {quiz.attemptCount > 0 ? (
          <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
            <Link href={`/quizzes/${quiz.id}/results`}>
              <BookOpen className="size-3.5" aria-hidden="true" />
              View last result
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
