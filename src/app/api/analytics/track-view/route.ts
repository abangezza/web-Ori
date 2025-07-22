// src/app/api/analytics/track-view/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import ActivityLog from "@/models/ActivityLog";
import Pelanggan from "@/models/Pelanggan";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const { mobilId, timestamp } = await request.json();

    if (!mobilId) {
      return NextResponse.json(
        { success: false, error: "mobilId is required" },
        { status: 400 }
      );
    }

    // Create anonymous customer untuk tracking views tanpa form
    let anonymousCustomer = await Pelanggan.findOne({
      noHp: "anonymous_viewer",
      nama: "Anonymous Viewer",
    });

    if (!anonymousCustomer) {
      anonymousCustomer = new Pelanggan({
        nama: "Anonymous Viewer",
        noHp: "anonymous_viewer",
        status: "Belum Di Follow Up",
        totalInteractions: 1,
      });
      await anonymousCustomer.save();
    } else {
      anonymousCustomer.totalInteractions += 1;
      anonymousCustomer.lastActivity = new Date();
      await anonymousCustomer.save();
    }

    // Log the view activity
    const activityLog = new ActivityLog({
      pelangganId: anonymousCustomer._id,
      mobilId: mobilId,
      activityType: "view_detail",
      additionalData: {
        timestamp: timestamp || new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
    });

    await activityLog.save();

    return NextResponse.json({
      success: true,
      message: "View tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track view" },
      { status: 500 }
    );
  }
}
