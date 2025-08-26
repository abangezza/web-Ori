// src/app/api/analytics/mobil-enhanced/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import ActivityLog from "@/models/ActivityLog";
import Mobil from "@/models/Mobil"; // SESUAIKAN jika nama model/paths berbeda

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Endpoint analytics per-mobil yang benar-benar terfilter periode.
 * - Menghitung view/simulasi/test-drive/cashOffer dari ActivityLog dalam rentang [start, end)
 * - Normalisasi mobilId (string → ObjectId) agar $lookup selalu kena
 * - Hanya kembalikan baris yang memiliki mobil valid (unwind tanpa preserve)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year") as string, 10)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month") as string, 10)
      : undefined;

    await connectMongo();

    const hasMonth = Boolean(year && month);
    const start = hasMonth
      ? new Date(Date.UTC(year!, month! - 1, 1, 0, 0, 0))
      : undefined;
    const end = hasMonth
      ? new Date(Date.UTC(year!, month!, 1, 0, 0, 0))
      : undefined;

    const pipeline: any[] = [
      {
        $project: {
          mobilIdRaw: "$mobilId",
          type: { $toString: { $ifNull: ["$activityType", "$action"] } },
          createdAt: { $ifNull: ["$createdAt", "$timestamp"] },
        },
      },
      ...(hasMonth
        ? [{ $match: { createdAt: { $gte: start, $lt: end } } }]
        : []),

      // Normalisasi mobilId agar bisa di-join walau tersimpan sebagai string
      {
        $addFields: {
          mobilKey: {
            $cond: [
              { $eq: [{ $type: "$mobilIdRaw" }, "string"] },
              { $toObjectId: "$mobilIdRaw" },
              "$mobilIdRaw",
            ],
          },
        },
      },
      { $match: { mobilKey: { $ne: null } } },

      // Agregasi per mobil
      {
        $group: {
          _id: "$mobilKey",
          viewCount: {
            $sum: { $cond: [{ $eq: ["$type", "view_detail"] }, 1, 0] },
          },
          creditSimulationCount: {
            $sum: { $cond: [{ $eq: ["$type", "simulasi_kredit"] }, 1, 0] },
          },
          testDriveCount: {
            $sum: { $cond: [{ $eq: ["$type", "booking_test_drive"] }, 1, 0] },
          },
          cashOfferCount: {
            $sum: { $cond: [{ $eq: ["$type", "beli_cash"] }, 1, 0] },
          },
          totalInteractions: { $sum: 1 },
        },
      },

      // Join metadata mobil
      {
        $lookup: {
          from: (Mobil as any).collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "mobil",
        },
      },
      // Drop baris tanpa mobil (mencegah tampil "-" kosong)
      { $unwind: "$mobil" },

      // Bentuk output
      {
        $project: {
          _id: 1,
          merek: "$mobil.merek",
          tipe: "$mobil.tipe",
          tahun: "$mobil.tahun",
          noPol: "$mobil.noPol",
          harga: "$mobil.harga",
          viewCount: 1,
          creditSimulationCount: 1,
          testDriveCount: 1,
          cashOfferCount: 1,
          totalInteractions: 1,
          totalInquiries: {
            $add: [
              "$creditSimulationCount",
              "$testDriveCount",
              "$cashOfferCount",
            ],
          },
        },
      },
    ];

    const rows = await ActivityLog.aggregate(pipeline);

    // Safety: pastikan semua numeric adalah number
    const data = rows.map((r: any) => ({
      _id: r._id,
      merek: r.merek ?? "-",
      tipe: r.tipe ?? "-",
      tahun: r.tahun ?? null,
      noPol: r.noPol ?? "-",
      harga: Number(r.harga ?? 0),
      viewCount: Number(r.viewCount ?? 0),
      creditSimulationCount: Number(r.creditSimulationCount ?? 0),
      testDriveCount: Number(r.testDriveCount ?? 0),
      cashOfferCount: Number(r.cashOfferCount ?? 0),
      totalInteractions: Number(r.totalInteractions ?? 0),
      totalInquiries: Number(r.totalInquiries ?? 0),
    }));

    // Top performers (dipakai kartu list di UI)
    const mostViewed = [...data].sort((a, b) => b.viewCount - a.viewCount);
    const mostInquired = [...data].sort(
      (a, b) => b.totalInquiries - a.totalInquiries
    );

    return NextResponse.json({
      success: true,
      data,
      topPerformers: { mostViewed, mostInquired },
      meta: {
        period: { year: year ?? null, month: month ?? null },
        totalMobils: data.length,
      },
    });
  } catch (err) {
    console.error("[mobil-enhanced] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mobil analytics" },
      { status: 500 }
    );
  }
}
