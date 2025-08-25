// src/app/api/analytics/customer-journey/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import ActivityLog from "@/models/ActivityLog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;

    await connectMongo();

    // Build date filter
    let dateFilter = {};
    if (year || month) {
      const startDate = new Date(
        year || new Date().getFullYear(),
        month ? month - 1 : 0,
        1
      );
      const endDate = new Date(
        year || new Date().getFullYear(),
        month ? month : 12,
        1
      );
      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    // Get customer journey data
    const journeyData = await buildCustomerJourney(dateFilter);

    // Get conversion rates
    const conversionRates = await calculateConversionRates(dateFilter);

    // Get customer segments
    const segments = await getCustomerSegments(dateFilter);

    return NextResponse.json({
      success: true,
      data: {
        journey: journeyData,
        conversions: conversionRates,
        segments,
        insights: generateJourneyInsights(journeyData, conversionRates),
      },
      meta: {
        period: { year, month },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in customer journey analytics:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer journey data",
      },
      { status: 500 }
    );
  }
}

async function buildCustomerJourney(dateFilter: any) {
  // Customer journey funnel stages
  const stages = [
    { stage: "Visitor", count: 0, description: "Viewed car details" },
    { stage: "Interested", count: 0, description: "Simulated credit" },
    { stage: "Engaged", count: 0, description: "Booked test drive" },
    { stage: "Hot Lead", count: 0, description: "Made cash offer" },
    { stage: "Customer", count: 0, description: "Purchased car" },
  ];

  // Get data from both sources (hybrid approach)
  const [embeddedData, legacyData] = await Promise.all([
    getEmbeddedJourneyData(dateFilter),
    getLegacyJourneyData(dateFilter),
  ]);

  // Merge and calculate funnel
  const mergedStats = mergeJourneyStats(embeddedData, legacyData);

  stages[0].count = mergedStats.totalVisitors;
  stages[1].count = mergedStats.interestedCustomers;
  stages[2].count = mergedStats.engagedCustomers;
  stages[3].count = mergedStats.hotLeads;
  stages[4].count = mergedStats.customers;

  return stages;
}

async function getEmbeddedJourneyData(dateFilter: any) {
  const customers = await Pelanggan.find(dateFilter);

  let totalVisitors = 0;
  let interestedCustomers = 0;
  let engagedCustomers = 0;
  let hotLeads = 0;
  let purchasedCustomers = 0;

  customers.forEach((customer) => {
    const hasViews = customer.summaryStats?.totalViews > 0;
    const hasSimulations = customer.summaryStats?.totalSimulasiKredit > 0;
    const hasTestDrives = customer.summaryStats?.totalTestDrives > 0;
    const hasOffers = customer.summaryStats?.totalTawaranCash > 0;
    const isPurchased = customer.status === "Purchased";

    if (hasViews) totalVisitors++;
    if (hasSimulations) interestedCustomers++;
    if (hasTestDrives) engagedCustomers++;
    if (hasOffers) hotLeads++;
    if (isPurchased) purchasedCustomers++;
  });

  return {
    totalVisitors,
    interestedCustomers,
    engagedCustomers,
    hotLeads,
    customers: purchasedCustomers,
  };
}

async function getLegacyJourneyData(dateFilter: any) {
  const pipeline = [
    { $match: dateFilter },
    {
      $group: {
        _id: "$pelangganId",
        activities: { $push: "$activityType" },
      },
    },
    {
      $project: {
        hasViews: { $in: ["view_detail", "$activities"] },
        hasSimulations: { $in: ["simulasi_kredit", "$activities"] },
        hasTestDrives: { $in: ["booking_test_drive", "$activities"] },
        hasOffers: { $in: ["beli_cash", "$activities"] },
      },
    },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: { $cond: ["$hasViews", 1, 0] } },
        interestedCustomers: { $sum: { $cond: ["$hasSimulations", 1, 0] } },
        engagedCustomers: { $sum: { $cond: ["$hasTestDrives", 1, 0] } },
        hotLeads: { $sum: { $cond: ["$hasOffers", 1, 0] } },
      },
    },
  ];

  const result = await ActivityLog.aggregate(pipeline);

  if (result.length === 0) {
    return {
      totalVisitors: 0,
      interestedCustomers: 0,
      engagedCustomers: 0,
      hotLeads: 0,
      customers: 0,
    };
  }

  // Get purchased customers from Pelanggan collection
  const purchasedCount = await Pelanggan.countDocuments({
    ...dateFilter,
    status: "Purchased",
  });

  return {
    ...result[0],
    customers: purchasedCount,
  };
}

function mergeJourneyStats(embedded: any, legacy: any) {
  return {
    totalVisitors: Math.max(embedded.totalVisitors, legacy.totalVisitors),
    interestedCustomers:
      embedded.interestedCustomers + legacy.interestedCustomers,
    engagedCustomers: embedded.engagedCustomers + legacy.engagedCustomers,
    hotLeads: embedded.hotLeads + legacy.hotLeads,
    customers: embedded.customers + legacy.customers,
  };
}

async function calculateConversionRates(dateFilter: any) {
  // Get total counts for conversion calculation
  const totalCustomers = await Pelanggan.countDocuments(dateFilter);
  const interestedCustomers = await Pelanggan.countDocuments({
    ...dateFilter,
    $or: [
      { status: "Interested" },
      { "summaryStats.totalSimulasiKredit": { $gt: 0 } },
    ],
  });

  const hotLeads = await Pelanggan.countDocuments({
    ...dateFilter,
    $or: [
      { status: "Hot Lead" },
      { "summaryStats.totalTestDrives": { $gt: 0 } },
      { "summaryStats.totalTawaranCash": { $gt: 0 } },
    ],
  });

  const purchasedCustomers = await Pelanggan.countDocuments({
    ...dateFilter,
    status: "Purchased",
  });

  return [
    {
      name: "Visitor to Interested",
      value:
        totalCustomers > 0
          ? Math.round((interestedCustomers / totalCustomers) * 100)
          : 0,
    },
    {
      name: "Interested to Hot Lead",
      value:
        interestedCustomers > 0
          ? Math.round((hotLeads / interestedCustomers) * 100)
          : 0,
    },
    {
      name: "Hot Lead to Purchase",
      value:
        hotLeads > 0 ? Math.round((purchasedCustomers / hotLeads) * 100) : 0,
    },
    {
      name: "Overall Conversion",
      value:
        totalCustomers > 0
          ? Math.round((purchasedCustomers / totalCustomers) * 100)
          : 0,
    },
  ];
}

async function getCustomerSegments(dateFilter: any) {
  const segments = await Pelanggan.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgInteractions: { $avg: "$totalInteractions" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        avgInteractions: { $round: ["$avgInteractions", 1] },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return segments;
}

function generateJourneyInsights(journey: any[], conversions: any[]) {
  const insights = [];

  // Journey drop-off analysis
  const maxDropOff = journey.reduce(
    (max, current, index) => {
      if (index === 0) return max;
      const previous = journey[index - 1];
      const dropOffRate =
        ((previous.count - current.count) / previous.count) * 100;
      return dropOffRate > max.rate
        ? { stage: current.stage, rate: dropOffRate }
        : max;
    },
    { stage: "", rate: 0 }
  );

  if (maxDropOff.rate > 50) {
    insights.push({
      type: "warning",
      title: "High Drop-off Detected",
      message: `${maxDropOff.rate.toFixed(1)}% drop-off at ${
        maxDropOff.stage
      } stage`,
      actionable: `Focus on improving ${maxDropOff.stage.toLowerCase()} experience`,
    });
  }

  // Conversion rate analysis
  const overallConversion = conversions.find(
    (c) => c.name === "Overall Conversion"
  );
  if (overallConversion) {
    if (overallConversion.value < 5) {
      insights.push({
        type: "alert",
        title: "Low Conversion Rate",
        message: `Overall conversion is ${overallConversion.value}%`,
        actionable: "Review pricing strategy and follow-up processes",
      });
    } else if (overallConversion.value > 15) {
      insights.push({
        type: "success",
        title: "Excellent Conversion Rate",
        message: `Overall conversion is ${overallConversion.value}%`,
        actionable: "Consider increasing marketing spend to scale success",
      });
    }
  }

  // Hot lead conversion
  const hotLeadConversion = conversions.find(
    (c) => c.name === "Hot Lead to Purchase"
  );
  if (hotLeadConversion && hotLeadConversion.value > 70) {
    insights.push({
      type: "success",
      title: "Strong Closing Rate",
      message: `${hotLeadConversion.value}% of hot leads convert to sales`,
      actionable: "Focus on generating more hot leads",
    });
  }

  return insights;
}
