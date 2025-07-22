// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: "i" } },
        { noHp: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    // Get customers with pagination
    const customers = await Pelanggan.find(filter)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Pelanggan.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
