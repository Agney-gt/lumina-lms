import { NextResponse } from "next/server";

import { getProgressSummary } from "@/lib/server/store";

export async function GET() {
  const summary = getProgressSummary();
  return NextResponse.json({
    recommendation: summary.nextRecommendation,
    dailyPlan: summary.dailyPlan,
  });
}
