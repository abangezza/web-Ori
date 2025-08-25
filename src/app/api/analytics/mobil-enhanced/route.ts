// src/app/api/analytics/mobil-enhanced/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EnhancedCustomerService } from "@/lib/enhancedCustomerService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;
    const range = searchParams.get("range") || "month";

    // Get enhanced analytics with embedded data
    const analyticsData =
      await EnhancedCustomerService.getMobilAnalyticsEnhanced(year, month);

    // Calculate top performers
    const topPerformers = calculateTopPerformers(analyticsData);

    // Add performance scores
    const enhancedData = analyticsData.map((item) => ({
      ...item,
      performanceScore: calculatePerformanceScore(item),
      engagementRate: calculateEngagementRate(item),
    }));

    return NextResponse.json({
      success: true,
      data: enhancedData.sort(
        (a, b) => b.performanceScore - a.performanceScore
      ),
      topPerformers,
      meta: {
        period: { year, month, range },
        totalCars: enhancedData.length,
        avgPerformanceScore:
          enhancedData.reduce((sum, item) => sum + item.performanceScore, 0) /
          enhancedData.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in mobil-enhanced analytics:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch enhanced analytics",
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

function calculatePerformanceScore(item: any): number {
  // Weighted scoring system
  const weights = {
    views: 1,
    creditSimulations: 3,
    testDrives: 5,
    cashOffers: 7,
  };

  return (
    (item.viewCount || 0) * weights.views +
    (item.creditSimulationCount || 0) * weights.creditSimulations +
    (item.testDriveCount || 0) * weights.testDrives +
    (item.cashOfferCount || 0) * weights.cashOffers
  );
}

function calculateEngagementRate(item: any): number {
  const totalViews = item.viewCount || 0;
  const totalInteractions =
    (item.creditSimulationCount || 0) +
    (item.testDriveCount || 0) +
    (item.cashOfferCount || 0);

  return totalViews > 0
    ? Math.round((totalInteractions / totalViews) * 100)
    : 0;
}

function calculateTopPerformers(data: any[]) {
  // Most viewed cars
  const mostViewed = [...data]
    .filter((item) => (item.viewCount || 0) > 0)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10);

  // Most inquired cars (highest total interactions)
  const mostInquired = [...data]
    .map((item) => ({
      ...item,
      totalInquiries:
        (item.creditSimulationCount || 0) +
        (item.testDriveCount || 0) +
        (item.cashOfferCount || 0),
    }))
    .filter((item) => item.totalInquiries > 0)
    .sort((a, b) => b.totalInquiries - a.totalInquiries)
    .slice(0, 10);

  // Best conversion rate (inquiries/views)
  const bestConversion = [...data]
    .filter((item) => (item.viewCount || 0) > 5) // Minimum views threshold
    .map((item) => ({
      ...item,
      conversionRate: calculateEngagementRate(item),
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 10);

  // Hot prospects (recent high activity)
  const hotProspects = [...data]
    .filter(
      (item) => (item.testDriveCount || 0) > 0 || (item.cashOfferCount || 0) > 0
    )
    .sort((a, b) => calculatePerformanceScore(b) - calculatePerformanceScore(a))
    .slice(0, 5);

  return {
    mostViewed,
    mostInquired,
    bestConversion,
    hotProspects,
  };
}
