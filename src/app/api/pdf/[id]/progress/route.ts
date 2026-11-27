import { NextResponse } from "next/server";

import { getPdfMapping, getPdfMappingForChapter } from "@/lib/content/loader";
import { updatePdfPosition } from "@/lib/server/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mapping = getPdfMapping(id) ?? getPdfMappingForChapter(id);
  if (!mapping) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const page = Number(body?.page);
  if (!Number.isInteger(page) || page < 1 || page > mapping.totalPages) {
    return NextResponse.json(
      { error: `page must be an integer between 1 and ${mapping.totalPages}` },
      { status: 400 }
    );
  }
  updatePdfPosition(mapping.pdfId, page);
  return NextResponse.json({ pdfId: mapping.pdfId, lastPage: page, saved: true });
}
