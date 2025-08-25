// src/app/api/cron/expire-bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

// Auto-expire old test drive bookings
// This can be called by a cron job or run periodically
export async function POST(request: NextRequest) {
  try {
    // Check authorization (optional - for security)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 Starting auto-expire process...");

    // Expire old test drives
    const expireResult = await EnhancedCustomerService.expireOldTestDrives();

    console.log(
      `✅ Auto-expire completed: ${expireResult.expired} bookings expired`
    );

    return NextResponse.json({
      success: true,
      message: "Auto-expire process completed",
      data: {
        expiredBookings: expireResult.expired,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error in auto-expire process:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Auto-expire process failed",
        message:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check expired bookings without updating
export async function GET(request: NextRequest) {
  try {
    const { BusinessLogic } = await import("@/lib/businessLogic");
    const connectMongo = (await import("@/lib/conn")).default;
    const Mobil = (await import("@/models/Mobil")).default;

    await connectMongo();

    const expiredTime = BusinessLogic.checkExpiredBookings();

    // Count expired bookings without updating
    const expiredBookings = await Mobil.aggregate([
      {
        $match: {
          "interactions.testDrives": {
            $elemMatch: {
              status: "active",
              tanggalTest: { $lt: expiredTime },
            },
          },
        },
      },
      {
        $project: {
          expiredCount: {
            $size: {
              $filter: {
                input: "$interactions.testDrives",
                as: "booking",
                cond: {
                  $and: [
                    { $eq: ["$$booking.status", "active"] },
                    { $lt: ["$$booking.tanggalTest", expiredTime] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalExpired: { $sum: "$expiredCount" },
        },
      },
    ]);

    const totalExpired =
      expiredBookings.length > 0 ? expiredBookings[0].totalExpired : 0;

    return NextResponse.json({
      success: true,
      data: {
        expiredBookings: totalExpired,
        expiredTime: expiredTime.toISOString(),
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error checking expired bookings:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check expired bookings",
      },
      { status: 500 }
    );
  }
}
