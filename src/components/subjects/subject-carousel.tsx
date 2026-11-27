"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface SubjectCarouselItem {
  id: string;
  name: string;
  grade: number;
  book?: string;
  publisher: string;
  mastery: number;
  chapterCount: number;
  selected: boolean;
  href: string;
}

export function SubjectCarousel({ items }: { items: SubjectCarouselItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden py-1" ref={emblaRef}>
        <div className="flex gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.selected ? "true" : undefined}
              className={cn(
                "flex min-w-0 flex-[0_0_85%] flex-col gap-2 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_26%]",
                item.selected
                  ? "border-primary bg-accent/60"
                  : "bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    item.selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Grade {item.grade} · {item.publisher}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  {item.book ?? "No textbook yet"}
                </span>
                {item.chapterCount > 0 ? (
                  <Badge variant={item.selected ? "default" : "secondary"}>
                    {item.mastery}%
                  </Badge>
                ) : (
                  <Badge variant="locked">Coming soon</Badge>
                )}
              </div>
              <Progress value={item.mastery} aria-label={`${item.name} mastery ${item.mastery} percent`} />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={scrollPrev}
          aria-label="Previous subjects"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={scrollNext}
          aria-label="Next subjects"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
