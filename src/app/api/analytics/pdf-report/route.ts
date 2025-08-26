// src/app/api/analytics/pdf-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getMobilAnalytics,
  getTopMobilsByActivity,
} from "@/lib/customerService";

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

    // Ambil analytics utama (sudah terfilter periode & normalisasi mobilId)
    const mobilAnalytics = await getMobilAnalytics(year, month);

    // Ambil top per kategori untuk blok “Activity Details”
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

    const html = generateProfessionalReportHTML(
      mobilAnalytics,
      topMobils,
      year,
      month
    );

    // Kembalikan HTML. Frontend akan membuka di tab baru (bukan download paksa).
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
  topMobils: Record<string, any[]>,
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
  ] as const;

  // === TOTALS diambil dari mobilAnalytics (shape baru) ===
  const totals = mobilAnalytics.reduce(
    (acc, m: any) => {
      acc.view_detail += Number(m.viewCount || 0);
      acc.simulasi_kredit += Number(m.creditSimulationCount || 0);
      acc.booking_test_drive += Number(m.testDriveCount || 0);
      acc.beli_cash += Number(m.cashOfferCount || 0);
      return acc;
    },
    {
      view_detail: 0,
      simulasi_kredit: 0,
      booking_test_drive: 0,
      beli_cash: 0,
    }
  );

  const totalAllActivities =
    totals.view_detail +
    totals.simulasi_kredit +
    totals.booking_test_drive +
    totals.beli_cash;

  // === TOP 10: sort by totalInteractions (shape baru) ===
  const top10 = [...mobilAnalytics]
    .sort(
      (a: any, b: any) =>
        Number(b.totalInteractions || 0) - Number(a.totalInteractions || 0)
    )
    .slice(0, 10);

  // Helper format rupiah
  const idr = (n: number) => (Number(n) || 0).toLocaleString("id-ID");

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Laporan Analytics - Radja Auto Car</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif; color:#1f2937; background:#fff; line-height:1.6; }
    .container { max-width:1200px; margin:0 auto; padding:40px 20px; }

    .header { text-align:center; margin-bottom:50px; padding:40px 0; background:linear-gradient(135deg,#1f2937 0%,#374151 100%); color:#fff; border-radius:16px; position:relative; overflow:hidden; }
    .header::before { content:''; position:absolute; inset:0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); opacity:.3; }
    .logo { width:80px; height:80px; background:#000; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:24px; box-shadow:0 10px 25px rgba(0,0,0,.2); }
    .company-name { font-size:32px; font-weight:800; margin-bottom:8px; letter-spacing:-.5px; }
    .report-title { font-size:20px; font-weight:600; margin-bottom:12px; opacity:.9; }
    .period { font-size:18px; font-weight:600; color:#60a5fa; background:rgba(96,165,250,.1); padding:8px 20px; border-radius:25px; display:inline-block; border:1px solid rgba(96,165,250,.2);}
    .generation-time { font-size:14px; opacity:.8; margin-top:16px; }

    .section-title { font-size:24px; font-weight:800; margin:30px 0; text-align:center; }

    .summary-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; margin-bottom:40px; }
    .card { background:linear-gradient(135deg,#fff 0%,#f8fafc 100%); padding:24px; border-radius:14px; border:1px solid #e5e7eb; box-shadow:0 4px 20px rgba(0,0,0,.06); text-align:center; position:relative; overflow:hidden; }
    .card::before { content:''; position:absolute; left:0; top:0; right:0; height:4px; background:var(--card-color,#3b82f6); }
    .card-icon { font-size:28px; display:block; margin-bottom:8px; }
    .card-title { font-size:12px; letter-spacing:.6px; color:#6b7280; margin-bottom:6px; text-transform:uppercase; font-weight:600; }
    .card-value { font-size:32px; font-weight:800; }
    .card-percentage { font-size:12px; margin-top:6px; font-weight:600; color:#10b981; }

    .top-performers { background:#fff; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 4px 16px rgba(0,0,0,.06); overflow:hidden; margin-bottom:40px; }
    .table-header { background:#f8fafc; padding:20px 24px; border-bottom:1px solid #e5e7eb; }
    .table-title { font-size:18px; font-weight:800; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:14px 18px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:left; }
    th { background:#f9fafb; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; }
    .rank { width:34px; height:34px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; color:#fff; font-weight:800; }
    .rank-1{background:linear-gradient(135deg,#fbbf24,#f59e0b);} .rank-2{background:linear-gradient(135deg,#9ca3af,#6b7280);} .rank-3{background:linear-gradient(135deg,#cd7f32,#92400e);} .rank-other{background:linear-gradient(135deg,#6b7280,#4b5563);}
    .muted { color:#6b7280; font-size:12px; }

    .activity-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:24px; }
    .activity-card { background:#fff; border:1px solid #e5e7eb; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,.06); overflow:hidden; }
    .activity-header { padding:18px 20px; color:#fff; background:var(--activity-color,#3b82f6); font-weight:800; }
    .activity-content { padding:18px 20px; }
    .activity-item { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f3f4f6;}
    .activity-item:last-child{ border-bottom:none; }
    .activity-rank{ width:28px; height:28px; border-radius:999px; background:rgba(255,255,255,.25); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; margin-right:12px; }

    .footer { margin-top:48px; padding:28px; border-top:1px solid #e5e7eb; text-align:center; background:#f8fafc; border-radius:16px; }
    .footer .footer-logo{ font-weight:800; margin-bottom:6px; }

    @media print {
      .header{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .activity-header{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
  <script>
    window.onload = function(){
      var el = document.getElementById('generation-timestamp');
      if(el){
        el.textContent = new Date().toLocaleString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
        });
      }
    };
  </script>
</head>
<body>
  <div class="container">

    <div class="header">
      <div class="logo">RAC</div>
      <div class="company-name">Radja Auto Car</div>
      <div class="report-title">Laporan Analytics Mobil</div>
      <div class="period">Periode: ${periodText}</div>
      <div class="generation-time">Dibuat pada: <span id="generation-timestamp"></span></div>
    </div>

    <div class="section-title">📊 Ringkasan Aktivitas</div>
    <div class="summary-cards">
      ${(
        [
          {
            key: "view_detail",
            icon: "👁",
            label: "Detail Views",
            color: "#3B82F6",
          },
          {
            key: "beli_cash",
            icon: "💰",
            label: "Cash Purchase",
            color: "#10B981",
          },
          {
            key: "simulasi_kredit",
            icon: "💳",
            label: "Credit Simulation",
            color: "#F59E0B",
          },
          {
            key: "booking_test_drive",
            icon: "🚗",
            label: "Test Drive Booking",
            color: "#EF4444",
          },
        ] as const
      )
        .map((a) => {
          const val = Number((totals as any)[a.key] || 0);
          const pct =
            totalAllActivities > 0
              ? ((val / totalAllActivities) * 100).toFixed(1)
              : "0.0";
          return `
          <div class="card" style="--card-color:${a.color}">
            <span class="card-icon">${a.icon}</span>
            <div class="card-title">${a.label.toUpperCase()}</div>
            <div class="card-value">${val.toLocaleString("id-ID")}</div>
            <div class="card-percentage">${pct}% dari total</div>
          </div>`;
        })
        .join("")}
    </div>

    <div class="top-performers">
      <div class="table-header">
        <div class="table-title">🏆 Top 10 Mobil Berdasarkan Total Interaksi</div>
        <div class="muted">Ranking mobil dengan aktivitas tertinggi periode ${periodText}</div>
      </div>
      <table>
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
          ${
            top10.length
              ? top10
                  .map((m: any, idx: number) => {
                    const rankClass =
                      idx === 0
                        ? "rank-1"
                        : idx === 1
                        ? "rank-2"
                        : idx === 2
                        ? "rank-3"
                        : "rank-other";
                    const views = Number(m.viewCount || 0);
                    const cash = Number(m.cashOfferCount || 0);
                    const credit = Number(m.creditSimulationCount || 0);
                    const test = Number(m.testDriveCount || 0);
                    const total = Number(
                      m.totalInteractions || views + cash + credit + test
                    );
                    return `
                    <tr>
                      <td><span class="rank ${rankClass}">${idx + 1}</span></td>
                      <td>
                        <div><strong>${m.merek || "-"}</strong> ${
                      m.tipe ? m.tipe : ""
                    }</div>
                        <div class="muted">${m.noPol || "-"} • ${
                      m.tahun || "-"
                    }</div>
                      </td>
                      <td><strong>${views}</strong></td>
                      <td><strong>${cash}</strong></td>
                      <td><strong>${credit}</strong></td>
                      <td><strong>${test}</strong></td>
                      <td><strong>${total.toLocaleString("id-ID")}</strong></td>
                    </tr>`;
                  })
                  .join("")
              : `<tr><td colspan="7" style="text-align:center; color:#6b7280; padding:36px;">
                   Tidak ada data untuk periode ini
                 </td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="section-title">📈 Detail Aktivitas per Kategori</div>
    <div class="activity-grid">
      ${(
        activityTypes as ReadonlyArray<{
          key:
            | "view_detail"
            | "beli_cash"
            | "simulasi_kredit"
            | "booking_test_drive";
          label: string;
          color: string;
          icon: string;
        }>
      )
        .map((activity) => {
          const list = topMobils[activity.key] || [];
          return `
          <div class="activity-card">
            <div class="activity-header" style="--activity-color:${
              activity.color
            }">
              ${activity.icon} Top ${activity.label}
            </div>
            <div class="activity-content">
              ${
                list.length
                  ? list
                      .slice(0, 5)
                      .map(
                        (mobil: any, i: number) => `
                <div class="activity-item">
                  <div style="display:flex;align-items:center;">
                    <span class="activity-rank">${i + 1}</span>
                    <div>
                      <div style="font-weight:700">${mobil.merek || "-"} ${
                          mobil.tipe || ""
                        } (${mobil.tahun || "-"})</div>
                      <div class="muted">${mobil.noPol || "-"} • Rp ${idr(
                          mobil.harga
                        )}</div>
                    </div>
                  </div>
                  <div style="font-weight:800">${Number(
                    mobil.count || 0
                  )}x</div>
                </div>`
                      )
                      .join("")
                  : `<div style="text-align:center; color:#6b7280; padding:24px 12px;">Tidak ada data</div>`
              }
            </div>
          </div>`;
        })
        .join("")}
    </div>

    <div class="footer">
      <div class="footer-logo">Radja Auto Car</div>
      <div>Laporan ini dibuat secara otomatis oleh sistem analytics</div>
      <div>© ${new Date().getFullYear()} Radja Auto Car - All Rights Reserved</div>
      <div class="muted" style="margin-top:10px;">Data akurat per tanggal pembuatan laporan • Sistem Analytics v2.0</div>
    </div>

  </div>
</body>
</html>
`;
}
