import { NextResponse } from "next/server";

import { getChaptersForSubject, getSubject } from "@/lib/content/loader";
import { getChapterMasteryForCard } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subject = getSubject(id);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }
  const chapters = getChaptersForSubject(subject.id).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    chapterNumber: chapter.chapterNumber,
    description: chapter.description,
    mastery: getChapterMasteryForCard(chapter.id),
  }));
  return NextResponse.json({ subject: { ...subject, chapters } });
}
