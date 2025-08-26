// src/lib/customerService.ts
import connectMongo from "@/lib/conn";
import ActivityLog from "@/models/ActivityLog";
import Mobil from "@/models/Mobil"; // SESUAIKAN jika nama model/paths berbeda

/**
 * Ambil analytics per-mobil berbasis ActivityLog dalam periode yang dipilih.
 * Menghasilkan array data per mobil dengan view/simulasi/test-drive/cash offer.
 */
export async function getMobilAnalytics(year?: number, month?: number) {
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
    ...(hasMonth ? [{ $match: { createdAt: { $gte: start, $lt: end } } }] : []),

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
    {
      $lookup: {
        from: (Mobil as any).collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "mobil",
      },
    },
    { $unwind: "$mobil" }, // drop baris tanpa mobil valid

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

  const raw = await ActivityLog.aggregate(pipeline);

  return raw.map((r: any) => ({
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
}

/**
 * Top mobil berdasarkan tipe aktivitas tertentu (views/simulasi/test-drive/cash)
 * dalam periode yang dipilih.
 */
export async function getTopMobilsByActivity(
  activity:
    | "view_detail"
    | "simulasi_kredit"
    | "booking_test_drive"
    | "beli_cash",
  limit = 10,
  year?: number,
  month?: number
) {
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
    ...(hasMonth ? [{ $match: { createdAt: { $gte: start, $lt: end } } }] : []),

    { $match: { type: activity } },

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

    { $group: { _id: "$mobilKey", count: { $sum: 1 } } },

    {
      $lookup: {
        from: (Mobil as any).collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "mobil",
      },
    },
    { $unwind: "$mobil" },

    {
      $project: {
        _id: 1,
        merek: "$mobil.merek",
        tipe: "$mobil.tipe",
        tahun: "$mobil.tahun",
        noPol: "$mobil.noPol",
        harga: "$mobil.harga",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ];

  const rows = await ActivityLog.aggregate(pipeline);

  return rows.map((r: any) => ({
    _id: r._id,
    merek: r.merek ?? "-",
    tipe: r.tipe ?? "-",
    tahun: r.tahun ?? null,
    noPol: r.noPol ?? "-",
    harga: Number(r.harga ?? 0),
    count: Number(r.count ?? 0),
  }));
}
