import { NextResponse } from "next/server";

import { getProgressDetails } from "@/lib/server/store";

export async function GET() {
  const details = getProgressDetails();
  return NextResponse.json({ details });
}
