// src/app/api/analytics/customer-journey/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import ActivityLog from "@/models/ActivityLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // === Build time range (UTC, aman untuk server) ===
    const hasMonth = Boolean(year && month);
    const start = hasMonth
      ? new Date(Date.UTC(year!, month! - 1, 1, 0, 0, 0))
      : undefined;
    const end = hasMonth
      ? new Date(Date.UTC(year!, month!, 1, 0, 0, 0))
      : undefined;

    // Helper date match untuk pipeline aggregate (normalisasi field tanggal)
    const matchByCreated = hasMonth
      ? { createdAt: { $gte: start, $lt: end } }
      : {};
    const matchByPurchase = hasMonth
      ? {
          $or: [
            { purchaseDate: { $gte: start, $lt: end } },
            { createdAt: { $gte: start, $lt: end } },
            { updatedAt: { $gte: start, $lt: end } },
          ],
        }
      : {};

    // =========================
    // 1) Ambil funnel dari ActivityLog (unik per pelanggan)
    // =========================
    const pipelineUnique = [
      {
        // Normalisasi field penting
        $project: {
          pelangganKey: {
            $ifNull: ["$pelangganId", { $ifNull: ["$customerId", "$leadId"] }],
          },
          type: { $toString: { $ifNull: ["$activityType", "$action"] } },
          createdAt: { $ifNull: ["$createdAt", "$timestamp"] },
        },
      },
      ...(hasMonth
        ? [{ $match: { createdAt: { $gte: start, $lt: end } } }]
        : []),
      {
        $group: {
          _id: "$pelangganKey",
          hasViews: {
            $max: { $cond: [{ $eq: ["$type", "view_detail"] }, 1, 0] },
          },
          hasSim: {
            $max: { $cond: [{ $eq: ["$type", "simulasi_kredit"] }, 1, 0] },
          },
          hasTest: {
            $max: { $cond: [{ $eq: ["$type", "booking_test_drive"] }, 1, 0] },
          },
          hasCash: { $max: { $cond: [{ $eq: ["$type", "beli_cash"] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: null,
          totalVisitors: { $sum: "$hasViews" },
          interestedCustomers: { $sum: "$hasSim" },
          engagedCustomers: { $sum: "$hasTest" },
          hotLeads: { $sum: "$hasCash" },
        },
      },
    ] as any[];

    const aggUnique = await ActivityLog.aggregate(pipelineUnique).catch(
      () => []
    );

    let baseCounts = {
      totalVisitors: 0,
      interestedCustomers: 0,
      engagedCustomers: 0,
      hotLeads: 0,
    };

    if (aggUnique && aggUnique.length > 0) {
      const r = aggUnique[0] as any;
      baseCounts = {
        totalVisitors: Number(r.totalVisitors || 0),
        interestedCustomers: Number(r.interestedCustomers || 0),
        engagedCustomers: Number(r.engagedCustomers || 0),
        hotLeads: Number(r.hotLeads || 0),
      };
    } else {
      // =========================
      // 2) Fallback: hitung per jenis aktivitas (event-based)
      // =========================
      const countsByType = await ActivityLog.aggregate([
        {
          $project: {
            type: { $toString: { $ifNull: ["$activityType", "$action"] } },
            createdAt: { $ifNull: ["$createdAt", "$timestamp"] },
          },
        },
        ...(hasMonth
          ? [{ $match: { createdAt: { $gte: start, $lt: end } } }]
          : []),
        { $group: { _id: "$type", cnt: { $sum: 1 } } },
      ]).catch(() => []);

      const map: Record<string, number> = {};
      countsByType.forEach((d: any) => (map[d._id] = Number(d.cnt || 0)));

      baseCounts = {
        totalVisitors: Number(map["view_detail"] || 0),
        interestedCustomers: Number(map["simulasi_kredit"] || 0),
        engagedCustomers: Number(map["booking_test_drive"] || 0),
        hotLeads: Number(map["beli_cash"] || 0),
      };
    }

    // =========================
    // 3) Customer dari Pelanggan Purchased (tanggal fleksibel)
    // =========================
    const purchasedCount = await Pelanggan.countDocuments({
      status: "Purchased",
      ...(hasMonth ? matchByPurchase : {}),
    }).catch(() => 0);

    const customers =
      Number(purchasedCount || 0) > 0
        ? Number(purchasedCount)
        : Number(baseCounts.hotLeads || 0); // fallback agar chart tidak kosong total

    // =========================
    // 4) Data untuk chart (Number semua)
    // =========================
    const journey = [
      { stage: "Visitor", count: Number(baseCounts.totalVisitors || 0) },
      {
        stage: "Interested",
        count: Number(baseCounts.interestedCustomers || 0),
      },
      { stage: "Engaged", count: Number(baseCounts.engagedCustomers || 0) },
      { stage: "Hot Lead", count: Number(baseCounts.hotLeads || 0) },
      { stage: "Customer", count: Number(customers || 0) },
    ];

    // =========================
    // 5) Conversion rates berdasar journey
    // =========================
    const v = journey[0].count;
    const i = journey[1].count;
    const h = journey[3].count;
    const c = journey[4].count;

    const conversions = [
      { name: "Visitor to Interested", value: pct(i, v) },
      { name: "Interested to Hot Lead", value: pct(h, i) },
      { name: "Overall Conversion", value: pct(c, v) },
    ];

    // =========================
    // 6) Segments (optional, aman nullables)
    // =========================
    const segments = await Pelanggan.aggregate([
      ...(hasMonth
        ? [
            {
              $match: {
                $or: [
                  { createdAt: { $gte: start, $lt: end } },
                  { updatedAt: { $gte: start, $lt: end } },
                  { purchaseDate: { $gte: start, $lt: end } },
                ],
              },
            },
          ]
        : []),
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgInteractions: { $avg: { $ifNull: ["$totalInteractions", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          avgInteractions: { $round: ["$avgInteractions", 1] },
        },
      },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    return NextResponse.json({
      success: true,
      data: {
        journey,
        conversions,
        segments,
        insights: generateJourneyInsights(journey, conversions),
      },
      meta: {
        period: { year: year ?? null, month: month ?? null },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[customer-journey] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer journey data" },
      { status: 500 }
    );
  }
}

/* ========== Helpers ========== */

function pct(num: number, den: number) {
  if (!den || den <= 0) return 0;
  return Number(((Number(num || 0) / Number(den)) * 100).toFixed(2));
}

function generateJourneyInsights(journey: any[], conversions: any[]) {
  const insights: any[] = [];
  let max = { stage: "", rate: 0 };
  for (let i = 1; i < journey.length; i++) {
    const prev = Number(journey[i - 1].count || 0);
    const cur = Number(journey[i].count || 0);
    if (prev <= 0) continue;
    const drop = ((prev - cur) / prev) * 100;
    if (drop > max.rate) max = { stage: journey[i].stage, rate: drop };
  }
  if (max.rate > 50) {
    insights.push({
      type: "warning",
      title: "High Drop-off Detected",
      message: `${max.rate.toFixed(1)}% drop-off at ${max.stage} stage`,
      actionable: `Improve ${max.stage.toLowerCase()} experience`,
    });
  }
  const overall = conversions.find((c: any) => c.name === "Overall Conversion");
  if (overall && overall.value < 5) {
    insights.push({
      type: "alert",
      title: "Low Conversion Rate",
      message: `Overall conversion is ${overall.value}%`,
      actionable: "Review pricing and follow-ups",
    });
  }
  return insights;
}
