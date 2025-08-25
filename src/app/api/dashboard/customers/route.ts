// src/app/api/dashboard/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

// GET all customers with enhanced stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");
    const search = searchParams.get("search");

    // Get all customers with enhanced data
    let customers = await EnhancedCustomerService.getAllCustomersWithStats();

    // Apply filters
    if (statusFilter && statusFilter !== "all") {
      customers = customers.filter(
        (customer) => customer.status === statusFilter
      );
    }

    if (priorityFilter && priorityFilter !== "all") {
      customers = customers.filter(
        (customer) => customer.priority === priorityFilter
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      customers = customers.filter(
        (customer) =>
          customer.nama.toLowerCase().includes(searchTerm) ||
          customer.noHp.includes(searchTerm)
      );
    }

    // Calculate summary stats
    const stats = {
      total: customers.length,
      byStatus: {
        "Belum Di Follow Up": customers.filter(
          (c) => c.status === "Belum Di Follow Up"
        ).length,
        "Sudah Di Follow Up": customers.filter(
          (c) => c.status === "Sudah Di Follow Up"
        ).length,
        Interested: customers.filter((c) => c.status === "Interested").length,
        "Hot Lead": customers.filter((c) => c.status === "Hot Lead").length,
        Purchased: customers.filter((c) => c.status === "Purchased").length,
      },
      byPriority: {
        low: customers.filter((c) => c.priority === "low").length,
        medium: customers.filter((c) => c.priority === "medium").length,
        high: customers.filter((c) => c.priority === "high").length,
        urgent: customers.filter((c) => c.priority === "urgent").length,
      },
      readyForFollowUp: customers.filter((c) => c.readyForFollowUp).length,
      averageEngagement:
        customers.length > 0
          ? Math.round(
              customers.reduce((sum, c) => sum + c.engagementScore, 0) /
                customers.length
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: customers,
      stats,
      meta: {
        filters: {
          status: statusFilter,
          priority: priorityFilter,
          search,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
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

// PATCH to update customer status manually
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, status, notes } = body;

    // Validate required fields
    if (!customerId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: customerId, status",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "Belum Di Follow Up",
      "Sudah Di Follow Up",
      "Interested",
      "Hot Lead",
      "Purchased",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update customer status
    const connectMongo = (await import("@/lib/conn")).default;
    const Pelanggan = (await import("@/models/Pelanggan")).default;

    await connectMongo();

    const customer = await Pelanggan.findByIdAndUpdate(
      customerId,
      {
        status,
        lastActivity: new Date(),
        $push: {
          interactionHistory: {
            mobilId: null, // Manual status update tidak terkait mobil tertentu
            mobilInfo: {
              merek: "Manual Update",
              tipe: "Status Change",
              tahun: new Date().getFullYear(),
              noPol: "-",
              harga: 0,
            },
            activityType: "view_detail", // Default type untuk manual update
            details: {
              statusChange: {
                from: status, // Will be updated with actual previous status
                to: status,
                notes: notes || "",
                updatedBy: "admin", // Could be enhanced with actual user
              },
            },
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer status updated successfully",
      data: {
        customerId,
        newStatus: status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating customer status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update customer status",
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
