export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  FileText,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CircularProgress } from "@/components/shared/circular-progress";
import { MasteryRow } from "@/components/shared/mastery-row";
import { ReviewBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPdfMapping } from "@/lib/content/loader";
import { formatMinutes } from "@/lib/utils";
import { getProgressSummary } from "@/lib/server/store";
import type { Crumb } from "@/lib/breadcrumbs";

const CRUMBS: Crumb[] = [
  { label: "Grade 8" },
  { label: "Maths" },
  { label: "Number Play" },
];

const ACTIVITY_ICONS = {
  lesson: BookOpen,
  mcq: Target,
  descriptive: Target,
  review: CalendarClock,
  pdf: FileText,
} as const;

export const metadata = { title: "Home" };

export default function HomePage() {
  const summary = getProgressSummary();
  const recommendation = summary.nextRecommendation;
  const pdfMapping = getPdfMapping("number-play-pdf");
  const lastPdfPage = summary.lastPdfPosition?.lastPage ?? 1;
  const greeting = getGreeting();
  const overdueCount = summary.reviewDue.filter((r) => r.overdue).length;

  return (
    <div>
      <PageHeader crumbs={CRUMBS} />
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {greeting}, {summary.profile.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chapter 5 · Number Play · Ganita Prakash Part 1
          </p>
        </div>
        <Badge variant="accent" className="gap-1.5 px-3 py-1.5">
          <Flame className="size-3.5" aria-hidden="true" />
          {summary.learningStreak.current}-day streak
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <NextBestStep recommendation={recommendation} />
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Concept mastery</CardTitle>
                <CardDescription>
                  Average of unit mastery within each concept
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {summary.conceptMastery.map((concept) => (
                <MasteryRow
                  key={concept.conceptId}
                  label={concept.title}
                  value={concept.mastery}
                  sublabel={`${concept.unitCount} units`}
                  href={`/lessons/number-play/${concept.conceptId}`}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapter mastery</CardTitle>
              <CardDescription>Number Play overall progress</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <CircularProgress
                value={summary.chapterMastery[0]?.mastery ?? 0}
                label="mastery"
              />
              <div className="flex flex-col gap-1.5">
                <p className="text-2xl font-semibold leading-none">
                  {getMasteryLevel(summary.chapterMastery[0]?.mastery ?? 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {summary.completedUnits} of {summary.totalUnits} units completed
                </p>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                >
                  <Link href="/progress">
                    View detailed progress
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s plan</CardTitle>
              <CardDescription>
                {summary.dailyPlan.length} activities · about{" "}
                {formatMinutes(
                  summary.dailyPlan.reduce(
                    (sum, item) => sum + item.estimatedMinutes,
                    0
                  )
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {summary.dailyPlan.map((item, index) => {
                const Icon = ACTIVITY_ICONS[item.activityType];
                return (
                  <div key={item.id}>
                    {index > 0 ? <Separator className="my-3" /> : null}
                    <Link
                      href={item.href}
                      className="group -m-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="bg-accent text-accent-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium group-hover:text-primary">
                          {item.title}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {item.description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ~{formatMinutes(item.estimatedMinutes)}
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learner signals</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-sm">
              <SignalRow label="Preferred format" value={summary.learnerSignals.preferredFormat} />
              <SignalRow
                label="Avg response time"
                value={`${(summary.learnerSignals.averageResponseTimeMs / 1000).toFixed(1)}s per question`}
              />
              <SignalRow label="Best time of day" value={summary.learnerSignals.bestTimeOfDay} />
              <SignalRow label="Total XP" value={`${summary.xpTotal} XP`} />
              {overdueCount > 0 ? (
                <div className="flex items-center gap-2 pt-1">
                  <ReviewBadge overdue />
                  <span className="text-xs text-muted-foreground">
                    {overdueCount} review{overdueCount > 1 ? "s" : ""} overdue
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapter PDF</CardTitle>
              <CardDescription>
                {pdfMapping?.sourceType === "local" ? "Offline copy available" : "Hosted edition"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/chapter-pdf/number-play">
                  <span className="flex items-center gap-2">
                    <FileText className="size-4" aria-hidden="true" />
                    Resume at page {lastPdfPage}
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NextBestStep({ recommendation }: { recommendation: ReturnType<typeof getProgressSummary>["nextRecommendation"] }) {
  if (!recommendation) {
    return (
      <Card className="border-success/40">
        <CardHeader>
          <CardTitle className="text-base">Next best step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All units are complete. Revisit the chapter PDF or try quizzes again to
            raise your mastery.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/quizzes">Practise with quizzes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const kindLabel =
    recommendation.kind === "review"
      ? "Recommended review"
      : recommendation.kind === "resume"
        ? "Pick up where you left off"
        : "Recommended next";

  return (
    <Card className="border-primary/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <CardDescription className="font-medium uppercase tracking-wide text-primary">
            {kindLabel}
          </CardDescription>
        </div>
        <CardTitle className="text-lg">{recommendation.unitTitle}</CardTitle>
        <CardDescription>
          {recommendation.conceptTitle} · ~{formatMinutes(recommendation.estimatedMinutes)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-md text-sm text-muted-foreground">{recommendation.reason}</p>
        <Button asChild size="lg" className="shrink-0">
          <Link href={recommendation.href}>
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getMasteryLevel(mastery: number): string {
  if (mastery >= 80) return "Can do";
  if (mastery >= 40) return "In progress";
  if (mastery > 0) return "Getting started";
  return "Not started";
}
