// src/app/api/analytics/pdf-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getMobilAnalytics,
  getTopMobilsByActivity,
} from "@/lib/customerService";

// Simple HTML to PDF using browser APIs (fallback method)
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

    // Generate professional HTML with embedded CSS
    const html = generateProfessionalReportHTML(
      mobilAnalytics,
      topMobils,
      year,
      month
    );

    // Return HTML with proper headers for PDF generation
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="analytics-report-${
          year || "all"
        }${month ? `-${month}` : ""}.html"`,
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

function generateProfessionalReportHTML(
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
    { key: "view_detail", label: "Detail Views", color: "#3B82F6", icon: "👁️" },
    { key: "beli_cash", label: "Cash Purchase", color: "#10B981", icon: "💰" },
    {
      key: "simulasi_kredit",
      label: "Credit Simulation",
      color: "#F59E0B",
      icon: "💳",
    },
    {
      key: "booking_test_drive",
      label: "Test Drive Booking",
      color: "#EF4444",
      icon: "🚗",
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

  const totalAllActivities = Object.values(totals).reduce(
    (sum: number, count: number) => sum + count,
    0
  );

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Laporan Analytics - Radja Auto Car</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #ffffff;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        /* Header Section */
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding: 40px 0;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .logo-section {
          position: relative;
          z-index: 2;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          background: #000000;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 24px;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .company-name {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          opacity: 0.9;
        }
        
        .period {
          font-size: 18px;
          font-weight: 500;
          color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          padding: 8px 20px;
          border-radius: 25px;
          display: inline-block;
          border: 1px solid rgba(96, 165, 250, 0.2);
        }
        
        .generation-time {
          font-size: 14px;
          opacity: 0.7;
          margin-top: 20px;
        }
        
        /* Summary Cards */
        .summary-section {
          margin-bottom: 50px;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 30px;
          color: #1f2937;
          text-align: center;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }
        
        .card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-color, #3b82f6);
        }
        
        .card-icon {
          font-size: 32px;
          margin-bottom: 15px;
          display: block;
        }
        
        .card-title {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-value {
          font-size: 36px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .card-percentage {
          font-size: 12px;
          font-weight: 500;
          color: #10b981;
          background: #d1fae5;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
        }
        
        /* Top Performers Table */
        .top-performers {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          margin-bottom: 50px;
        }
        
        .table-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .table-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .table-subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table th {
          background: #f9fafb;
          padding: 20px 30px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .table td {
          padding: 20px 30px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        
        .table tr:hover {
          background: #f9fafb;
        }
        
        .rank {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
        }
        
        .rank-1 { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
        .rank-2 { background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); }
        .rank-3 { background: linear-gradient(135deg, #cd7f32 0%, #92400e 100%); }
        .rank-other { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }
        
        .car-info {
          display: flex;
          flex-direction: column;
        }
        
        .car-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .car-details {
          font-size: 12px;
          color: #6b7280;
        }
        
        .metric-value {
          font-weight: 700;
          font-size: 16px;
          color: #1f2937;
        }
        
        .price {
          font-size: 12px;
          color: #059669;
          font-weight: 500;
        }
        
        /* Activity Breakdown */
        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .activity-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .activity-header {
          padding: 25px 30px;
          background: var(--activity-color, #3b82f6);
          color: white;
          position: relative;
        }
        
        .activity-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .activity-title {
          font-size: 18px;
          font-weight: 700;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .activity-content {
          padding: 30px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--activity-color, #3b82f6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          margin-right: 15px;
        }
        
        .activity-car-info {
          flex: 1;
        }
        
        .activity-car-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }
        
        .activity-car-details {
          font-size: 12px;
          color: #6b7280;
        }
        
        .activity-count {
          font-weight: 700;
          font-size: 16px;
          color: #1f2937;
        }
        
        /* Footer */
        .footer {
          margin-top: 60px;
          padding: 40px 0;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          background: #f8fafc;
          border-radius: 16px;
        }
        
        .footer-content {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .footer-logo {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
            font-size: 12px;
          }
          
          .container {
            max-width: 100%;
            padding: 20px;
          }
          
          .header {
            background: #1f2937 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .card::before,
          .activity-header {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .table {
            font-size: 11px;
          }
          
          .table th,
          .table td {
            padding: 12px 15px;
          }
          
          .activity-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 20px 15px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .company-name {
            font-size: 24px;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .table th,
          .table td {
            padding: 15px 20px;
            font-size: 13px;
          }
          
          .activity-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <script>
        // Auto-print functionality for PDF generation
        window.onload = function() {
          // Add timestamp
          document.getElementById('generation-timestamp').textContent = 
            new Date().toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Jakarta'
            });
        };
      </script>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            <div class="logo">RAC</div>
            <div class="company-name">Radja Auto Car</div>
            <div class="report-title">Laporan Analytics Mobil</div>
            <div class="period">Periode: ${periodText}</div>
            <div class="generation-time">
              Dibuat pada: <span id="generation-timestamp"></span>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-section">
          <div class="section-title">📊 Ringkasan Aktivitas</div>
          <div class="summary-cards">
            ${activityTypes
              .map(
                (activity, index) => `
              <div class="card" style="--card-color: ${activity.color}">
                <span class="card-icon">${activity.icon}</span>
                <div class="card-title">${activity.label}</div>
                <div class="card-value">${totals[activity.key].toLocaleString(
                  "id-ID"
                )}</div>
                <div class="card-percentage">
                  ${
                    totalAllActivities > 0
                      ? (
                          (totals[activity.key] / totalAllActivities) *
                          100
                        ).toFixed(1)
                      : 0
                  }% dari total
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Top Performing Cars -->
        <div class="top-performers">
          <div class="table-header">
            <div class="table-title">🏆 Top 10 Mobil Berdasarkan Total Interaksi</div>
            <div class="table-subtitle">Ranking mobil dengan aktivitas tertinggi periode ${periodText}</div>
          </div>
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

                  const rankClass =
                    index === 0
                      ? "rank-1"
                      : index === 1
                      ? "rank-2"
                      : index === 2
                      ? "rank-3"
                      : "rank-other";

                  return `
                  <tr>
                    <td>
                      <span class="rank ${rankClass}">
                        ${index + 1}
                      </span>
                    </td>
                    <td>
                      <div class="car-info">
                        <div class="car-name">${mobil.merek} ${mobil.tipe}</div>
                        <div class="car-details">${mobil.noPol} • ${
                    mobil.tahun
                  }</div>
                      </div>
                    </td>
                    <td><span class="metric-value">${
                      activities.view_detail || 0
                    }</span></td>
                    <td><span class="metric-value">${
                      activities.beli_cash || 0
                    }</span></td>
                    <td><span class="metric-value">${
                      activities.simulasi_kredit || 0
                    }</span></td>
                    <td><span class="metric-value">${
                      activities.booking_test_drive || 0
                    }</span></td>
                    <td><span class="metric-value">${
                      mobil.totalInteractions
                    }</span></td>
                  </tr>
                `;
                })
                .join("")}
              ${
                mobilAnalytics.length === 0
                  ? '<tr><td colspan="7" style="text-align: center; color: #6b7280; padding: 40px;">Tidak ada data untuk periode ini</td></tr>'
                  : ""
              }
            </tbody>
          </table>
        </div>

        <!-- Activity Details -->
        <div class="section-title">📈 Detail Aktivitas per Kategori</div>
        <div class="activity-grid">
          ${activityTypes
            .map(
              (activityType) => `
            <div class="activity-card">
              <div class="activity-header" style="--activity-color: ${
                activityType.color
              }">
                <div class="activity-title">
                  <span>${activityType.icon}</span>
                  Top ${activityType.label}
                </div>
              </div>
              <div class="activity-content">
                ${topMobils[activityType.key]
                  .slice(0, 5)
                  .map(
                    (mobil: any, index: number) => `
                  <div class="activity-item">
                    <div style="display: flex; align-items: center;">
                      <span class="activity-rank" style="--activity-color: ${
                        activityType.color
                      }">
                        ${index + 1}
                      </span>
                      <div class="activity-car-info">
                        <div class="activity-car-name">${mobil.merek} ${
                      mobil.tipe
                    } (${mobil.tahun})</div>
                        <div class="activity-car-details">
                          ${mobil.noPol} • Rp ${mobil.harga.toLocaleString(
                      "id-ID"
                    )}
                        </div>
                      </div>
                    </div>
                    <div class="activity-count">${mobil.count}x</div>
                  </div>
                `
                  )
                  .join("")}
                ${
                  topMobils[activityType.key].length === 0
                    ? '<div style="text-align: center; color: #6b7280; padding: 40px 20px;">Tidak ada data</div>'
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div class="footer-logo">Radja Auto Car</div>
            <div>Laporan ini dibuat secara otomatis oleh sistem analytics</div>
            <div>© ${new Date().getFullYear()} Radja Auto Car - All Rights Reserved</div>
            <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              Data akurat per tanggal pembuatan laporan • Sistem Analytics v2.0
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
