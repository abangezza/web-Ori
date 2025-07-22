import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const customer = await Pelanggan.findByIdAndUpdate(
      params.id,
      {
        status: "Sudah Di Follow Up",
        lastActivity: new Date(),
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
      message: "Customer berhasil di follow up",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer follow up:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update follow up status" },
      { status: 500 }
    );
  }
}
