// src/app/api/debug/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import ActivityLog from "@/models/ActivityLog";
import Pelanggan from "@/models/Pelanggan";
import Mobil from "@/models/Mobil";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    // Count documents in each collection
    const activityCount = await ActivityLog.countDocuments();
    const pelangganCount = await Pelanggan.countDocuments();
    const mobilCount = await Mobil.countDocuments();

    // Get sample data
    const sampleActivities = await ActivityLog.find()
      .populate("pelangganId")
      .populate("mobilId")
      .limit(5)
      .sort({ createdAt: -1 });

    const samplePelanggan = await Pelanggan.find()
      .limit(5)
      .sort({ createdAt: -1 });

    // Activity breakdown by type
    const activityBreakdown = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        activities: activityCount,
        customers: pelangganCount,
        cars: mobilCount,
      },
      breakdown: activityBreakdown,
      sampleData: {
        activities: sampleActivities,
        customers: samplePelanggan,
      },
    });
  } catch (error) {
    console.error("Debug analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
