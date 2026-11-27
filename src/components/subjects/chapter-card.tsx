import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleSlash,
  FileText,
  Play,
  Lock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getChapter, getCurriculumStats } from "@/lib/content/loader";

export interface ChapterCardData {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  mastery: number;
  conceptCount: number;
  unitCount: number;
  pdfId?: string;
  prerequisites: string[];
  prerequisiteTitles: string[];
}

function chapterStatus(data: ChapterCardData): {
  label: string;
  variant: "default" | "can-do" | "charcoal" | "recommended" | "locked";
  action: { label: string; href: string; icon: React.ReactNode } | null;
} {
  const hasProgress = data.mastery > 0;
  const fullyDone = data.mastery >= 100;
  if (fullyDone) {
    return {
      label: "Explained",
      variant: "charcoal",
      action: { label: "Review chapter", href: `/lessons/${data.id}`, icon: <BookOpen className="size-4" /> },
    };
  }
  if (data.prerequisiteTitles.length > 0 && !hasProgress) {
    return {
      label: "Locked",
      variant: "locked",
      action: null,
    };
  }
  if (data.mastery >= 70) {
    return {
      label: "Can do",
      variant: "can-do",
      action: { label: "Open chapter", href: `/lessons/${data.id}`, icon: <Play className="size-4" /> },
    };
  }
  if (hasProgress) {
    return {
      label: "Current",
      variant: "default",
      action: { label: "Continue", href: `/lessons/${data.id}`, icon: <Play className="size-4" /> },
    };
  }
  return {
    label: "Recommended",
    variant: "recommended",
    action: { label: "Start chapter", href: `/lessons/${data.id}`, icon: <Play className="size-4" /> },
  };
}

export function ChapterCard({ data }: { data: ChapterCardData }) {
  const status = chapterStatus(data);
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex-row items-start justify-between gap-3 px-4">
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
            {data.chapterNumber}
          </span>
          <div>
            <CardTitle className="text-sm leading-snug">{data.title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              {data.conceptCount} concepts · {data.unitCount} units
            </CardDescription>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Mastery</span>
            <span className="font-medium tabular-nums">{data.mastery}%</span>
          </div>
          <Progress value={data.mastery} className="mt-1" aria-label={`${data.title} mastery ${data.mastery} percent`} />
        </div>
        {status.action ? (
          <Button asChild size="sm" className="justify-start">
            <Link href={status.action.href}>
              {status.action.icon}
              {status.action.label}
            </Link>
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-md bg-disabled/60 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 shrink-0" aria-hidden="true" />
            Requires: {data.prerequisiteTitles.join(", ")}
          </div>
        )}
        {data.pdfId ? (
          <Button asChild size="sm" variant="ghost" className="justify-start text-muted-foreground">
            <Link href={`/chapter-pdf/${data.id}`}>
              <FileText className="size-4" />
              Chapter PDF
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ChapterStatusLegend() {
  const items = [
    { label: "Explained", variant: "charcoal", hint: "Learning completed" },
    { label: "Can do", variant: "can-do", hint: "Demonstrated understanding" },
    { label: "Current", variant: "default", hint: "In progress" },
    { label: "Recommended", variant: "recommended", hint: "Suggested next" },
    { label: "Locked", variant: "locked", hint: "Prerequisite not satisfied" },
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Status
      </span>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <Badge variant={item.variant}>{item.label}</Badge>
          <span className="text-xs text-muted-foreground">{item.hint}</span>
        </span>
      ))}
    </div>
  );
}

export function EmptyChaptersState({ subjectName }: { subjectName: string }) {
  return (
    <Card className="items-center justify-center py-10">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <span className="bg-secondary text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <CircleSlash className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium">{subjectName} content is on the way</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Chapters for this subject will appear here once the curriculum is published.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/subjects/maths-grade-8">
            Switch to Mathematics
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function buildChapterCardData(chapterId: string, mastery: number): ChapterCardData {
  const chapter = getChapter(chapterId);
  const stats = getCurriculumStats(chapterId);
  return {
    id: chapterId,
    chapterNumber: chapter?.chapterNumber ?? 0,
    title: chapter?.title ?? chapterId,
    description: chapter?.description ?? "",
    mastery,
    conceptCount: stats.conceptCount,
    unitCount: stats.unitCount,
    pdfId: chapter?.pdfId,
    prerequisites: chapter?.prerequisites ?? [],
    prerequisiteTitles: (chapter?.prerequisites ?? []).map(
      (id) => getChapter(id)?.title ?? id
    ),
  };
}
