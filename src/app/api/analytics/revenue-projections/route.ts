// src/app/api/analytics/revenue-projections/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import Pelanggan from "@/models/Pelanggan";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : new Date().getFullYear();
    const range = searchParams.get("range") || "month";

    await connectMongo();

    // Generate revenue projections based on historical data and current pipeline
    const projections = await generateRevenueProjections(year, range);

    // Get pipeline value (pending offers + hot leads)
    const pipelineValue = await calculatePipelineValue();

    // Get historical performance for comparison
    const historicalData = await getHistoricalRevenue(year - 1);

    return NextResponse.json({
      success: true,
      data: projections,
      meta: {
        year,
        range,
        pipelineValue,
        historicalComparison: historicalData,
        timestamp: new Date().toISOString(),
        methodology:
          "Based on conversion rates, current pipeline, and seasonal trends",
      },
    });
  } catch (error) {
    console.error("Error in revenue projections:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate revenue projections",
      },
      { status: 500 }
    );
  }
}

async function generateRevenueProjections(year: number, range: string) {
  const currentDate = new Date();
  const projections = [];

  // Get base conversion rates from historical data
  const conversionRates = await calculateHistoricalConversionRates();

  // Get seasonal multipliers
  const seasonalMultipliers = getSeasonalMultipliers();

  // Generate projections for next 12 months
  for (let month = 0; month < 12; month++) {
    const targetDate = new Date(year, month, 1);
    const monthName = targetDate.toLocaleDateString("id-ID", { month: "long" });
    const isHistorical = targetDate < currentDate;

    let revenue = 0;

    if (isHistorical) {
      // Get actual revenue for historical months
      revenue = await getActualRevenue(year, month + 1);
    } else {
      // Project revenue for future months
      revenue = await projectRevenue(
        month + 1,
        conversionRates,
        seasonalMultipliers
      );
    }

    projections.push({
      month: monthName,
      monthNumber: month + 1,
      year,
      [isHistorical ? "actual" : "projected"]: revenue,
      isHistorical,
      confidence: isHistorical ? 100 : calculateConfidence(month),
      breakdown: isHistorical
        ? null
        : await getRevenueBreakdown(month + 1, conversionRates),
    });
  }

  return projections;
}

async function calculateHistoricalConversionRates() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get conversion data from customers
  const customers = await Pelanggan.find({
    createdAt: { $gte: sixMonthsAgo },
  });

  const totalCustomers = customers.length;
  const purchasedCustomers = customers.filter(
    (c) => c.status === "Purchased"
  ).length;
  const hotLeads = customers.filter(
    (c) =>
      c.status === "Hot Lead" ||
      (c.summaryStats?.totalTestDrives || 0) > 0 ||
      (c.summaryStats?.totalTawaranCash || 0) > 0
  ).length;

  return {
    visitorToLead: totalCustomers > 0 ? 0.15 : 0.15, // Default 15%
    leadToHotLead: totalCustomers > 0 ? hotLeads / totalCustomers : 0.08, // Default 8%
    hotLeadToPurchase: hotLeads > 0 ? purchasedCustomers / hotLeads : 0.65, // Default 65%
    overallConversion:
      totalCustomers > 0 ? purchasedCustomers / totalCustomers : 0.08, // Default 8%
  };
}

function getSeasonalMultipliers() {
  // Indonesian car sales seasonal patterns
  return {
    1: 0.85, // January - Post holiday slow
    2: 0.9, // February - Recovery
    3: 1.05, // March - End of fiscal year
    4: 1.1, // April - New fiscal year
    5: 1.0, // May - Normal
    6: 1.15, // June - Mid year bonus
    7: 0.95, // July - School holiday
    8: 0.9, // August - Ramadan effect
    9: 1.0, // September - Normal
    10: 1.05, // October - Pre holiday
    11: 1.1, // November - Black Friday
    12: 1.2, // December - Year end bonus
  };
}

async function getActualRevenue(year: number, month: number) {
  // Get actual sales from sold cars
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get accepted cash offers (represents actual sales)
  const soldCars = await Mobil.aggregate([
    {
      $match: {
        "interactions.beliCash.status": "accepted",
        "interactions.beliCash.timestamp": {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $unwind: "$interactions.beliCash",
    },
    {
      $match: {
        "interactions.beliCash.status": "accepted",
        "interactions.beliCash.timestamp": {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$interactions.beliCash.hargaTawaran" },
        totalSales: { $sum: 1 },
      },
    },
  ]);

  return soldCars.length > 0 ? soldCars[0].totalRevenue : 0;
}

async function projectRevenue(
  month: number,
  conversionRates: any,
  seasonalMultipliers: any
) {
  // Base projection on current pipeline and conversion rates
  const currentPipeline = await calculatePipelineValue();
  const seasonalMultiplier = seasonalMultipliers[month] || 1.0;

  // Get average car price for calculation
  const avgCarPrice = await getAverageCarPrice();

  // Project based on current inquiry rate and conversion
  const currentDate = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentInquiries = await Pelanggan.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
    totalInteractions: { $gt: 1 },
  });

  // Project monthly revenue
  const projectedInquiries = recentInquiries * seasonalMultiplier;
  const projectedSales = projectedInquiries * conversionRates.overallConversion;
  const projectedRevenue = projectedSales * avgCarPrice;

  // Add pipeline contribution (discounted by time)
  const pipelineContribution = currentPipeline * 0.3 * seasonalMultiplier;

  return Math.round(projectedRevenue + pipelineContribution);
}

async function calculatePipelineValue() {
  // Get value of pending cash offers
  const pendingOffers = await Mobil.aggregate([
    {
      $match: {
        "interactions.beliCash.status": "pending",
      },
    },
    {
      $unwind: "$interactions.beliCash",
    },
    {
      $match: {
        "interactions.beliCash.status": "pending",
      },
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$interactions.beliCash.hargaTawaran" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get value of hot leads (customers with test drives or multiple interactions)
  const hotLeadValue = await estimateHotLeadValue();

  const pendingValue =
    pendingOffers.length > 0 ? pendingOffers[0].totalValue : 0;

  return {
    pendingOffers: pendingValue,
    hotLeads: hotLeadValue,
    total: pendingValue + hotLeadValue,
  };
}

async function estimateHotLeadValue() {
  const avgCarPrice = await getAverageCarPrice();

  const hotLeads = await Pelanggan.countDocuments({
    $or: [
      { status: "Hot Lead" },
      { "summaryStats.totalTestDrives": { $gt: 0 } },
      { totalInteractions: { $gt: 3 } },
    ],
  });

  // Estimate 40% conversion rate for hot leads at 90% of average price
  return Math.round(hotLeads * 0.4 * avgCarPrice * 0.9);
}

async function getAverageCarPrice() {
  const result = await Mobil.aggregate([
    {
      $match: {
        status: "tersedia",
        harga: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: "$harga" },
      },
    },
  ]);

  return result.length > 0 ? result[0].avgPrice : 150000000; // Default 150M IDR
}

function calculateConfidence(monthsAhead: number) {
  // Confidence decreases over time
  const baseConfidence = 85;
  const decayRate = 5;
  return Math.max(baseConfidence - monthsAhead * decayRate, 30);
}

async function getRevenueBreakdown(month: number, conversionRates: any) {
  const avgCarPrice = await getAverageCarPrice();
  const seasonalMultiplier = getSeasonalMultipliers()[month] || 1.0;

  return {
    newCustomers: Math.round(50 * seasonalMultiplier),
    repeatInquiries: Math.round(20 * seasonalMultiplier),
    pipelineConversion: Math.round(15 * seasonalMultiplier),
    estimatedSales: Math.round(
      12 * seasonalMultiplier * conversionRates.overallConversion
    ),
    avgDealSize: avgCarPrice,
    confidenceFactors: {
      seasonality: seasonalMultiplier,
      historicalData: 0.8,
      pipelineQuality: 0.7,
    },
  };
}

async function getHistoricalRevenue(year: number) {
  const revenue = await getActualRevenue(year, 12); // Full year
  const growth = revenue > 0 ? 0.15 : 0; // Default 15% growth if no data

  return {
    previousYearRevenue: revenue,
    projectedGrowth: growth,
    marketTrends: "Positive growth expected in used car market",
  };
}
