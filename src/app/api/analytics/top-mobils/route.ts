// src/app/api/analytics/top-mobils/route.ts
import {
  getMobilAnalytics,
  getTopMobilsByActivity,
} from "@/lib/customerService";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityType = searchParams.get("type") || "view_detail";
    const limit = parseInt(searchParams.get("limit") || "10");
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;

    const topMobils = await getTopMobilsByActivity(
      activityType,
      limit,
      year,
      month
    );

    return NextResponse.json({
      success: true,
      data: topMobils,
      activityType,
      period: { year, month },
    });
  } catch (error) {
    console.error("Error fetching top mobils:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch top mobils" },
      { status: 500 }
    );
  }
}
