// src/app/api/analytics/pdf-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getMobilAnalytics,
  getTopMobilsByActivity,
} from "@/lib/customerService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;

    // Fetch analytics data
    const mobilAnalytics = await getMobilAnalytics(year, month);

    const topMobils = {
      view_detail: await getTopMobilsByActivity("view_detail", 10, year, month),
      beli_cash: await getTopMobilsByActivity("beli_cash", 10, year, month),
      simulasi_kredit: await getTopMobilsByActivity(
        "simulasi_kredit",
        10,
        year,
        month
      ),
      booking_test_drive: await getTopMobilsByActivity(
        "booking_test_drive",
        10,
        year,
        month
      ),
    };

    // Generate HTML for PDF
    const html = generateReportHTML(mobilAnalytics, topMobils, year, month);

    // In a real implementation, you would use a library like puppeteer or @react-pdf/renderer
    // For now, we'll return a JSON response with the data
    // You can integrate with libraries like:
    // - puppeteer for HTML to PDF conversion
    // - @react-pdf/renderer for React-based PDF generation
    // - jsPDF for client-side PDF generation

    return NextResponse.json({
      success: true,
      message: "PDF data prepared",
      data: {
        mobilAnalytics,
        topMobils,
        period: { year, month },
        html, // HTML content that can be converted to PDF
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}

function generateReportHTML(
  mobilAnalytics: any[],
  topMobils: any,
  year?: number,
  month?: number
): string {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const periodText = year
    ? month
      ? `${monthNames[month - 1]} ${year}`
      : `Tahun ${year}`
    : "Semua Periode";

  const activityTypes = [
    { key: "view_detail", label: "Detail Views", color: "#3B82F6" },
    { key: "beli_cash", label: "Cash Purchase", color: "#10B981" },
    { key: "simulasi_kredit", label: "Credit Simulation", color: "#F59E0B" },
    {
      key: "booking_test_drive",
      label: "Test Drive Booking",
      color: "#EF4444",
    },
  ];

  // Calculate totals
  const totals = activityTypes.reduce((acc, type) => {
    acc[type.key] = topMobils[type.key].reduce(
      (sum: number, mobil: any) => sum + mobil.count,
      0
    );
    return acc;
  }, {} as any);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Laporan Analytics - Radja Auto Car</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: #000;
          border-radius: 50%;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .report-title {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .period {
          font-size: 16px;
          color: #3B82F6;
          font-weight: 600;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        .card-title {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f3f4f6;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .table th {
          background-color: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .table tr:hover {
          background-color: #f9fafb;
        }
        .rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .activity-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">RAC</div>
          <div class="company-name">Radja Auto Car</div>
          <div class="report-title">Laporan Analytics Mobil</div>
          <div class="period">Periode: ${periodText}</div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card">
            <div class="card-title">Total Views</div>
            <div class="card-value" style="color: #3B82F6;">${
              totals.view_detail
            }</div>
          </div>
          <div class="card">
            <div class="card-title">Cash Purchase</div>
            <div class="card-value" style="color: #10B981;">${
              totals.beli_cash
            }</div>
          </div>
          <div class="card">
            <div class="card-title">Credit Simulation</div>
            <div class="card-value" style="color: #F59E0B;">${
              totals.simulasi_kredit
            }</div>
          </div>
          <div class="card">
            <div class="card-title">Test Drive Booking</div>
            <div class="card-value" style="color: #EF4444;">${
              totals.booking_test_drive
            }</div>
          </div>
        </div>

        <!-- Top Performing Cars -->
        <div class="section">
          <div class="section-title">Top 10 Mobil Berdasarkan Total Interaksi</div>
          <table class="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Mobil</th>
                <th>Views</th>
                <th>Cash</th>
                <th>Credit</th>
                <th>Test Drive</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${mobilAnalytics
                .slice(0, 10)
                .map((mobil, index) => {
                  const activities = mobil.activities.reduce(
                    (acc: any, act: any) => {
                      acc[act.type] = act.count;
                      return acc;
                    },
                    {}
                  );

                  return `
                  <tr>
                    <td>
                      <span class="rank" style="background-color: ${
                        index < 3
                          ? ["#FFD700", "#C0C0C0", "#CD7F32"][index]
                          : "#6b7280"
                      };">
                        ${index + 1}
                      </span>
                    </td>
                    <td>
                      <strong>${mobil.merek} ${mobil.tipe}</strong><br>
                      <small style="color: #6b7280;">${mobil.noPol} (${
                    mobil.tahun
                  })</small>
                    </td>
                    <td>${activities.view_detail || 0}</td>
                    <td>${activities.beli_cash || 0}</td>
                    <td>${activities.simulasi_kredit || 0}</td>
                    <td>${activities.booking_test_drive || 0}</td>
                    <td><strong>${mobil.totalInteractions}</strong></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Activity Details -->
        <div class="activity-grid">
          ${activityTypes
            .map(
              (activityType) => `
            <div class="section">
              <div class="section-title" style="color: ${activityType.color};">
                Top ${activityType.label}
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Mobil</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${topMobils[activityType.key]
                    .slice(0, 5)
                    .map(
                      (mobil: any, index: number) => `
                    <tr>
                      <td>
                        <span class="rank" style="background-color: ${
                          activityType.color
                        };">
                          ${index + 1}
                        </span>
                      </td>
                      <td>
                        <strong>${mobil.merek} ${mobil.tipe}</strong><br>
                        <small style="color: #6b7280;">
                          ${mobil.noPol} - Rp ${mobil.harga.toLocaleString(
                        "id-ID"
                      )}
                        </small>
                      </td>
                      <td><strong>${mobil.count}x</strong></td>
                    </tr>
                  `
                    )
                    .join("")}
                  ${
                    topMobils[activityType.key].length === 0
                      ? '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Tidak ada data</td></tr>'
                      : ""
                  }
                </tbody>
              </table>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Laporan dibuat pada: ${new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
          <p>© ${new Date().getFullYear()} Radja Auto Car - All Rights Reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
