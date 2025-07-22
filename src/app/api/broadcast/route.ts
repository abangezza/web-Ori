import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import { NextRequest, NextResponse } from "next/server";

// src/app/api/broadcast/route.ts
export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const { message, targetStatus } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const filter: any = {};
    if (targetStatus && targetStatus !== "all") {
      filter.status = targetStatus;
    }

    const customers = await Pelanggan.find(filter, { noHp: 1, nama: 1 });

    // Simulate broadcast (replace with actual WhatsApp API)
    const broadcastResults = customers.map((customer) => ({
      customerId: customer._id,
      nama: customer.nama,
      noHp: customer.noHp,
      status: "scheduled", // In real implementation, this would be the actual send status
      message: message,
    }));

    return NextResponse.json({
      success: true,
      message: `Broadcast scheduled to ${customers.length} customers`,
      data: {
        totalRecipients: customers.length,
        results: broadcastResults,
      },
    });
  } catch (error) {
    console.error("Error broadcasting message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send broadcast" },
      { status: 500 }
    );
  }
}
