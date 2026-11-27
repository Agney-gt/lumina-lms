export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarClock, Flame, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  AccuracyTrendChart,
  ActivityChart,
  ConfidenceVsAccuracyChart,
  HorizontalMasteryBars,
} from "@/components/progress/charts";
import { ReviewBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnitStatusBadge } from "@/components/shared/status-badge";
import { getProgressDetails } from "@/lib/server/store";
import { getUnit } from "@/lib/content/loader";
import { formatMinutes } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

export const metadata = { title: "Progress" };

const CRUMBS: Crumb[] = [{ label: "Grade 8" }, { label: "Maths" }, { label: "Progress" }];

export default function ProgressPage() {
  const details = getProgressDetails();
  const { summary } = details;

  const chapterData = summary.chapterMastery.map((c) => ({
    name: c.title,
    value: c.mastery,
  }));
  const conceptData = summary.conceptMastery.map((c) => ({
    name: c.title,
    value: c.mastery,
  }));
  const totalStudyMinutes = details.activityByDay.reduce(
    (sum, d) => sum + d.minutes,
    0
  );
  const completedActivities = summary.completedUnits + details.recentAttempts.length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader crumbs={CRUMBS} title="Progress" description="Your learning analytics for Grade 8 Mathematics." />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <SummaryCard label="Subject mastery" value={`${summary.subjectMastery}%`} progress={summary.subjectMastery} />
        <SummaryCard label="Chapter mastery" value={`${summary.chapterMastery[0]?.mastery ?? 0}%`} progress={summary.chapterMastery[0]?.mastery ?? 0} />
        <SummaryCard label="Completed units" value={`${summary.completedUnits}/${summary.totalUnits}`} progress={(summary.completedUnits / Math.max(summary.totalUnits, 1)) * 100} />
        <SummaryCard
          label="Quiz accuracy"
          value={summary.quizAccuracy !== null ? `${summary.quizAccuracy}%` : "—"}
          progress={summary.quizAccuracy ?? 0}
        />
        <SummaryCard
          label="Learning streak"
          value={`${summary.learningStreak.current} days`}
          icon={<Flame className="size-4 text-primary" aria-hidden="true" />}
        />
      </section>

      <section aria-label="Mastery overview" className="grid gap-4 lg:grid-cols-2">
        <HorizontalMasteryBars
          title="Chapter mastery"
          description="Average of concept mastery"
          data={chapterData}
        />
        <HorizontalMasteryBars
          title="Concept mastery"
          description="Average of unit mastery within each concept"
          data={conceptData}
        />
      </section>

      <section aria-label="Assessment performance" className="grid gap-4 lg:grid-cols-2">
        <AccuracyTrendChart data={details.accuracyTrend} />
        <ConfidenceVsAccuracyChart data={details.confidenceVsAccuracy} />
      </section>

      <section aria-label="Learning activity" className="grid gap-4 lg:grid-cols-2">
        <ActivityChart data={details.activityByDay} />
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Engagement</CardTitle>
            <CardDescription className="text-xs">Last 14 days</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 px-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatMinutes(totalStudyMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">Total study time</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{completedActivities}</p>
              <p className="text-xs text-muted-foreground">Completed activities</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.learnerSignals.averageResponseTimeMs > 0
                  ? `${(summary.learnerSignals.averageResponseTimeMs / 1000).toFixed(1)}s`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg response time</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{summary.xpTotal}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Review schedule" className="grid gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="flex-row items-center gap-2 px-4">
            <CalendarClock className="size-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-sm">Review schedule</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            {details.reviewSchedule.filter((r) => r.status === "pending").length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nothing due for review. Keep learning!
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {details.reviewSchedule
                  .filter((r) => r.status === "pending")
                  .map((item) => {
                    const overdue = item.overdue;
                    return (
                      <li
                        key={`${item.unitId}-${item.dueAt}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/lessons/number-play/${getUnit(item.unitId)?.conceptId ?? ""}/${item.unitId}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {item.unitTitle}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {new Date(item.dueAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <ReviewBadge overdue={overdue} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Learning insights</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preferred format
              </p>
              <p>{details.insights.preferredFormat}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Patterns
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-foreground/90">
                {details.insights.learningPatterns.map((pattern, i) => (
                  <li key={i}>{pattern}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Units needing attention
              </p>
              {details.insights.unitsNeedingAttention.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Nothing needs attention right now.
                </p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1.5">
                  {details.insights.unitsNeedingAttention.map((unit) => (
                    <li
                      key={unit.unitId}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-medium">{unit.title}</span>
                      <span className="text-muted-foreground">{unit.reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Unit performance">
        <Card className="py-4">
          <CardHeader className="flex-row items-center gap-2 px-4">
            <Target className="size-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-sm">Unit performance</CardTitle>
            <CardDescription className="ml-auto text-xs">
              All {details.unitProgress.length} units in Number Play
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Unit</TableHead>
                  <TableHead className="hidden md:table-cell">Concept</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Best MCQ</TableHead>
                  <TableHead>Mastery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.unitProgress.map((unit) => (
                  <TableRow key={unit.unitId}>
                    <TableCell className="pl-4">
                      <Link
                        href={`/lessons/number-play/${unit.conceptId}/${unit.unitId}`}
                        className="font-medium hover:text-primary"
                      >
                        {unit.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {unit.conceptTitle}
                    </TableCell>
                    <TableCell>
                      <UnitStatusBadge status={unit.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell tabular-nums">
                      {unit.bestMcqPercent !== undefined ? `${unit.bestMcqPercent}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={unit.mastery} className="w-20" aria-label={`${unit.title} mastery ${unit.mastery} percent`} />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {unit.mastery}%
                        </span>
                      </div>
                      {unit.revisionRecommended ? (
                        <Badge variant="warning" className="mt-1">
                          Revision recommended
                        </Badge>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {details.recentAttempts.length > 0 ? (
        <section aria-label="Recent attempts">
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Recent assessment attempts</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <ul className="flex flex-col gap-2">
                {details.recentAttempts.map((attempt) => (
                  <li
                    key={attempt.attemptId}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/quizzes/${attempt.quizId}/results?attempt=${attempt.attemptId}`}
                        className="font-medium hover:text-primary"
                      >
                        {attempt.quizTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    <Badge variant={attempt.passed ? "success" : "warning"}>
                      {attempt.scorePercent}%
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  progress,
  icon,
}: {
  label: string;
  value: string;
  progress?: number;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="gap-2 py-3.5">
      <CardContent className="px-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold tabular-nums md:text-2xl">{value}</p>
        {progress !== undefined ? (
          <Progress value={progress} className="mt-2 h-1.5" aria-label={`${label}: ${value}`} />
        ) : null}
      </CardContent>
    </Card>
  );
}
