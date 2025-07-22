// src/app/api/analytics/mobil/route.ts
import {
  getMobilAnalytics,
  getTopMobilsByActivity,
} from "@/lib/customerService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;

    const analytics = await getMobilAnalytics(year, month);

    return NextResponse.json({
      success: true,
      data: analytics,
      period: { year, month },
    });
  } catch (error) {
    console.error("Error fetching mobil analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
