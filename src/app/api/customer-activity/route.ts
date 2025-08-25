// src/app/api/customer-activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { nama, noHp, mobilId, activityType, additionalData } = body;

    // Validate required fields
    if (!nama || !noHp || !mobilId || !activityType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: nama, noHp, mobilId, activityType",
        },
        { status: 400 }
      );
    }

    // Validate activity type
    const validActivityTypes = [
      "view_detail",
      "beli_cash",
      "simulasi_kredit",
      "booking_test_drive",
    ];
    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid activity type. Must be one of: ${validActivityTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Save customer activity using enhanced service
    const result = await EnhancedCustomerService.saveCustomerActivity({
      nama: nama.trim(),
      noHp: noHp.trim(),
      mobilId,
      activityType,
      additionalData: additionalData || {},
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          validation: result.validation,
        },
        { status: 400 }
      );
    }

    // Success response with enhanced data
    return NextResponse.json({
      success: true,
      message: "Customer activity saved successfully",
      data: {
        pelangganId: result.pelangganId,
        newStatus: result.newStatus,
        activityType,
        timestamp: new Date().toISOString(),
      },
      validation: result.validation,
    });
  } catch (error) {
    console.error("Error in customer-activity API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// GET endpoint untuk retrieve customer activity history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pelangganId = searchParams.get("pelangganId");
    const mobilId = searchParams.get("mobilId");

    if (pelangganId) {
      // Get specific customer with interaction history
      const customer = await EnhancedCustomerService.getCustomerWithHistory(
        pelangganId
      );

      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: customer,
      });
    }

    if (mobilId) {
      // Get all interactions for specific mobil
      // This could be implemented if needed
      return NextResponse.json(
        { success: false, error: "Mobil activity history not implemented yet" },
        { status: 501 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Please provide pelangganId or mobilId parameter",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error retrieving customer activity:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
