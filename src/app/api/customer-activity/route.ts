// src/app/api/customer-activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveCustomerActivity } from "@/lib/customerService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, noHp, mobilId, activityType, additionalData } = body;

    // Validasi input
    if (!nama || !noHp || !mobilId || !activityType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validasi activity type
    const validActivityTypes = [
      "view_detail",
      "beli_cash",
      "simulasi_kredit",
      "booking_test_drive",
    ];
    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { success: false, error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Save customer activity
    const result = await saveCustomerActivity({
      nama,
      noHp,
      mobilId,
      activityType,
      additionalData,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Customer activity saved successfully",
        pelangganId: result.pelangganId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error saving customer activity:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
