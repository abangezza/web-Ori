// src/app/api/dashboard/cash-offers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

// GET all pending cash offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "pending";

    // Get all pending cash offers
    let offers = await EnhancedCustomerService.getPendingCashOffers();

    // Filter by status if specified
    if (statusFilter !== "all") {
      offers = offers.filter((offer) => offer.status === statusFilter);
    }

    // Calculate summary stats
    const stats = {
      total: offers.length,
      totalValue: offers.reduce((sum, offer) => sum + offer.hargaTawaran, 0),
      averageDiscount:
        offers.length > 0
          ? Math.round(
              (offers.reduce((sum, offer) => sum + offer.persentaseDiskon, 0) /
                offers.length) *
                100
            ) / 100
          : 0,
      potentialRevenue: offers.reduce(
        (sum, offer) => sum + offer.hargaTawaran,
        0
      ),
      potentialLoss: offers.reduce((sum, offer) => sum + offer.selisihHarga, 0),
      byDiscountRange: {
        "0-3%": offers.filter((o) => o.persentaseDiskon <= 3).length,
        "3-6%": offers.filter(
          (o) => o.persentaseDiskon > 3 && o.persentaseDiskon <= 6
        ).length,
        "6-9%": offers.filter(
          (o) => o.persentaseDiskon > 6 && o.persentaseDiskon <= 9
        ).length,
        ">9%": offers.filter((o) => o.persentaseDiskon > 9).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: offers,
      stats,
      meta: {
        filters: { status: statusFilter },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching cash offers:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cash offers",
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

// PATCH to update cash offer status (accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobilId, offerId, status, notes } = body;

    // Validate required fields
    if (!mobilId || !offerId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: mobilId, offerId, status",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update cash offer status
    const result = await EnhancedCustomerService.updateCashOfferStatus(
      mobilId,
      offerId,
      status,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // If offer is accepted, update mobil status to sold
    if (status === "accepted") {
      const connectMongo = (await import("@/lib/conn")).default;
      const Mobil = (await import("@/models/Mobil")).default;

      await connectMongo();
      await Mobil.findByIdAndUpdate(mobilId, {
        status: "terjual",
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        mobilId,
        offerId,
        newStatus: status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating cash offer status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cash offer status",
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
