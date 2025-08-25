// src/app/api/dashboard/test-drives/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

// GET all test drive bookings (hybrid approach)
export async function GET(request: NextRequest) {
  try {
    const bookings = await EnhancedCustomerService.getAllTestDriveBookings();

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: {
        total: bookings.length,
        active: bookings.filter((b) => b.status === "active").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        expired: bookings.filter((b) => b.status === "expired").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
      },
    });
  } catch (error) {
    console.error("Error fetching test drive bookings:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch test drive bookings",
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

// PATCH to update test drive status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobilId, bookingId, status, notes } = body;

    // Validate required fields
    if (!mobilId || !bookingId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: mobilId, bookingId, status",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["completed", "cancelled", "expired"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update test drive status
    const result = await EnhancedCustomerService.updateTestDriveStatus(
      mobilId,
      bookingId,
      status,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        mobilId,
        bookingId,
        newStatus: status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating test drive status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update test drive status",
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

// DELETE to cancel test drive
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobilId = searchParams.get("mobilId");
    const bookingId = searchParams.get("bookingId");

    if (!mobilId || !bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: mobilId, bookingId",
        },
        { status: 400 }
      );
    }

    // Cancel test drive (set status to cancelled)
    const result = await EnhancedCustomerService.updateTestDriveStatus(
      mobilId,
      bookingId,
      "cancelled",
      "Cancelled by admin"
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test drive booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling test drive:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel test drive",
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
