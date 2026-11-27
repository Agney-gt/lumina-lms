"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  LibraryBig,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBlockRenderer } from "@/components/lessons/content-block-renderer";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Lesson, QuizType } from "@/types/curriculum";

interface LessonRendererProps {
  lesson: Lesson;
  unitId: string;
  pdfHref: string | null;
  pdfPagesLabel: string | null;
  quizzes: { id: string; title: string; type: QuizType; questionCount: number }[];
  lessonCompleted: boolean;
  nextUnitHref: string | null;
  nextUnitTitle: string | null;
}

export function LessonRenderer({
  lesson,
  unitId,
  pdfHref,
  pdfPagesLabel,
  quizzes,
  lessonCompleted,
  nextUnitHref,
  nextUnitTitle,
}: LessonRendererProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(lessonCompleted);
  const [saving, setSaving] = useState(false);

  async function markComplete() {
    setSaving(true);
    try {
      await api.post(`/api/units/${unitId}/progress`, { event: "completed" });
      setCompleted(true);
      toast.success("Lesson completed", {
        description: "Your progress has been saved.",
      });
      router.refresh();
    } catch {
      toast.error("Could not save progress", {
        description: "Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  const modes = lesson.contentModes.length > 0 ? lesson.contentModes : ["text" as const];

  return (
    <div className="flex flex-col gap-5">
      <Tabs defaultValue={modes[0]} className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Content mode">
            {modes.includes("visual") && (
              <TabsTrigger value="visual">
                <Eye className="size-4" aria-hidden="true" />
                Visual
              </TabsTrigger>
            )}
            {modes.includes("text") && (
              <TabsTrigger value="text">
                <FileText className="size-4" aria-hidden="true" />
                Text
              </TabsTrigger>
            )}
          </TabsList>
          {pdfHref ? (
            <Button asChild variant="outline" size="sm">
              <a href={pdfHref}>
                <FileText className="size-4" aria-hidden="true" />
                Open PDF {pdfPagesLabel ? `pp. ${pdfPagesLabel}` : ""}
              </a>
            </Button>
          ) : null}
        </div>
        {modes.map((mode) => (
          <TabsContent key={mode} value={mode} className="flex flex-col gap-5">
            {lesson.sections.map((section) => (
              <section key={section.id} aria-label={section.title}>
                <h2 className="mb-3 border-b border-border pb-2 text-base font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="flex flex-col gap-4">
                  {section.blocks.map((block) => (
                    <ContentBlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
          completed && "border-success/40 bg-success/5"
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          {completed ? (
            <>
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              <span className="font-medium">Lesson completed — great work!</span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Finished reading? Mark the lesson complete to update your mastery.
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!completed ? (
            <Button onClick={markComplete} disabled={saving}>
              {saving ? "Saving…" : "Mark as complete"}
            </Button>
          ) : null}
          {quizzes.map((quiz) => (
            <Button key={quiz.id} asChild variant="outline">
              <a href={`/quizzes/${quiz.id}`}>
                <LibraryBig className="size-4" aria-hidden="true" />
                {quiz.type === "mcq" ? "Take MCQ quiz" : "Descriptive assessment"}
              </a>
            </Button>
          ))}
          {nextUnitHref ? (
            <Button asChild variant="ghost">
              <a href={nextUnitHref}>
                Next: {nextUnitTitle}
                <ChevronRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
