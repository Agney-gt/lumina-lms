import { NextResponse } from "next/server";

import { getPdfMapping } from "@/lib/content/loader";
import { getLearnerData } from "@/lib/server/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mapping = getPdfMapping(id);
  if (!mapping) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
  const position = getLearnerData().pdfProgress[id] ?? null;
  return NextResponse.json({
    pdf: {
      pdfId: mapping.pdfId,
      chapterId: mapping.chapterId,
      sourceType: mapping.sourceType,
      assetPath: mapping.assetPath ?? null,
      sourceUrl: mapping.sourceUrl ?? null,
      totalPages: mapping.totalPages,
      pageMappings: mapping.pageMappings,
      version: mapping.version,
    },
    savedPosition: position,
    readerAvailable: false,
  });
}
