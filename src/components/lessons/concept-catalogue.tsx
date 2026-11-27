"use client";

import Link from "next/link";
import { FileText, Lock } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { UnitStatusBadge } from "@/components/shared/status-badge";
import { cn, formatPages } from "@/lib/utils";

export interface CatalogueUnit {
  id: string;
  title: string;
  estimatedDurationMinutes: number;
  pages: string;
  status: "not_started" | "in_progress" | "explained" | "can_do";
  mastery: number;
  unlocked: boolean;
}

export interface CatalogueConcept {
  id: string;
  title: string;
  description: string;
  pages: { start: number; end: number };
  mastery: number;
  unlocked: boolean;
  units: CatalogueUnit[];
}

export function ConceptCatalogue({
  chapterId,
  concepts,
  activeUnitId,
  activeConceptId,
}: {
  chapterId: string;
  concepts: CatalogueConcept[];
  activeUnitId?: string;
  activeConceptId?: string;
}) {
  const defaultOpen = concepts
    .filter((c) => c.units.some((u) => u.id === activeUnitId))
    .map((c) => c.id);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="flex flex-col gap-3"
    >
      {concepts.map((concept) => {
        const base = `/lessons/${chapterId}/${concept.id}`;
        return (
          <div
            key={concept.id}
            className={cn(
              "rounded-xl border bg-card",
              concept.id === activeConceptId ? "border-primary" : "border-border"
            )}
          >
            <AccordionItem value={concept.id} className="border-0">
              <AccordionTrigger className="gap-3 px-4 py-3.5 text-left hover:no-underline">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {concept.title}
                    {!concept.unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-disabled px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <Lock className="size-3" aria-hidden="true" />
                        Locked
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {concept.units.length} units ·{" "}
                    {formatPages(concept.pages.start, concept.pages.end)} in
                    textbook
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="w-20" aria-hidden="true">
                    <Progress
                      value={concept.mastery}
                      className="h-1.5"
                      aria-label={`${concept.title} mastery ${concept.mastery} percent`}
                    />
                  </span>
                  <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">
                    {concept.mastery}%
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                <ul className="flex flex-col gap-1">
                  {concept.units.map((unit) => {
                    const href = `${base}/${unit.id}`;
                    return (
                      <li key={unit.id}>
                        <Link
                          href={href}
                          aria-current={unit.id === activeUnitId ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            unit.id === activeUnitId
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{unit.title}</span>
                          <UnitStatusBadge
                            status={unit.status}
                            unlocked={unit.unlocked}
                          />
                          <span className="hidden w-12 text-right text-xs tabular-nums text-muted-foreground sm:block">
                            {unit.mastery}%
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={base}
                  className="mt-2 flex items-center gap-1.5 px-3 text-xs font-medium text-primary hover:underline"
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  Concept overview
                </Link>
              </AccordionContent>
            </AccordionItem>
          </div>
        );
      })}
    </Accordion>
  );
}
