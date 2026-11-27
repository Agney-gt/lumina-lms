import { NextResponse } from "next/server";

import { getChaptersForSubject, getSubjects } from "@/lib/content/loader";
import { getChapterMasteryForCard } from "@/lib/server/store";

export async function GET() {
  const subjects = getSubjects().map((subject) => {
    const chapters = getChaptersForSubject(subject.id);
    return {
      ...subject,
      chapterCount: chapters.length,
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        mastery: getChapterMasteryForCard(chapter.id),
      })),
    };
  });
  return NextResponse.json({ subjects });
}
