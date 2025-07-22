// src/components/AnalyticsDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Eye,
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

interface MobilAnalytics {
  _id: string;
  merek: string;
  tipe: string;
  tahun: number;
  noPol: string;
  activities: Array<{
    type: string;
    count: number;
    lastActivity: string;
  }>;
  totalInteractions: number;
}

interface TopMobil {
  _id: string;
  merek: string;
  tipe: string;
  tahun: number;
  noPol: string;
  harga: number;
  count: number;
  lastActivity: string;
}

const AnalyticsDashboard = () => {
  const [mobilAnalytics, setMobilAnalytics] = useState<MobilAnalytics[]>([]);
  const [topMobils, setTopMobils] = useState<{
    view_detail: TopMobil[];
    beli_cash: TopMobil[];
    simulasi_kredit: TopMobil[];
    booking_test_drive: TopMobil[];
  }>({
    view_detail: [],
    beli_cash: [],
    simulasi_kredit: [],
    booking_test_drive: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");

  const activityTypes = [
    { key: "view_detail", label: "Detail Views", icon: Eye, color: "#3B82F6" },
    {
      key: "beli_cash",
      label: "Cash Purchase",
      icon: DollarSign,
      color: "#10B981",
    },
    {
      key: "simulasi_kredit",
      label: "Credit Simulation",
      icon: CreditCard,
      color: "#F59E0B",
    },
    {
      key: "booking_test_drive",
      label: "Test Drive Booking",
      icon: Calendar,
      color: "#EF4444",
    },
  ];

  const months = [
    { value: "", label: "Semua Bulan" },
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth.toString() }),
      });

      // Fetch general analytics
      const analyticsResponse = await fetch(`/api/analytics/mobil?${params}`);
      const analyticsResult = await analyticsResponse.json();

      if (analyticsResult.success) {
        setMobilAnalytics(analyticsResult.data);
      }

      // Fetch top mobils for each activity type
      const topMobilsData: any = {};
      for (const activityType of activityTypes) {
        const topResponse = await fetch(
          `/api/analytics/top-mobils?type=${activityType.key}&limit=10&${params}`
        );
        const topResult = await topResponse.json();

        if (topResult.success) {
          topMobilsData[activityType.key] = topResult.data;
        }
      }

      setTopMobils(topMobilsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth.toString() }),
      });

      // Open the HTML report in a new window for PDF printing
      const reportUrl = `/api/analytics/pdf-report?${params}`;
      const newWindow = window.open(reportUrl, "_blank");

      if (newWindow) {
        // Wait for the page to load, then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 1000);
        };
      } else {
        // Fallback: direct download
        const response = await fetch(reportUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `analytics-report-${selectedYear}${
            selectedMonth ? `-${selectedMonth}` : ""
          }.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          alert("Gagal generate PDF report");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat generate PDF");
    }
  };

  const prepareChartData = () => {
    const chartData = mobilAnalytics.slice(0, 10).map((mobil) => {
      const data: any = {
        name: `${mobil.merek} ${mobil.tipe}`,
        total: mobil.totalInteractions,
      };

      mobil.activities.forEach((activity) => {
        data[activity.type] = activity.count;
      });

      return data;
    });

    return chartData;
  };

  const prepareActivitySummary = () => {
    const summary: any = {};

    activityTypes.forEach((type) => {
      summary[type.key] = {
        ...type,
        total: topMobils[type.key].reduce((sum, mobil) => sum + mobil.count, 0),
      };
    });

    return summary;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const activitySummary = prepareActivitySummary();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Laporan aktivitas dan performa mobil</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value ? parseInt(e.target.value) : "")
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generatePDFReport}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(activitySummary).map((activity: any) => (
          <div key={activity.key} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg`}
                style={{ backgroundColor: `${activity.color}20` }}
              >
                <activity.icon
                  className="w-6 h-6"
                  style={{ color: activity.color }}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {activity.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activity.total}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Top 10 Mobil Interactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Mobil - Total Interaksi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="view_detail" name="Views" fill="#3B82F6" />
              <Bar dataKey="beli_cash" name="Cash" fill="#10B981" />
              <Bar dataKey="simulasi_kredit" name="Credit" fill="#F59E0B" />
              <Bar
                dataKey="booking_test_drive"
                name="Test Drive"
                fill="#EF4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Activity Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Aktivitas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.values(activitySummary)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) =>
                  `${label}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {Object.values(activitySummary).map((entry: any, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Mobils Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activityTypes.map((activityType) => (
          <div key={activityType.key} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <activityType.icon
                  className="w-5 h-5 mr-2"
                  style={{ color: activityType.color }}
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  Top {activityType.label}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {topMobils[activityType.key].slice(0, 5).map((mobil, index) => (
                  <div
                    key={mobil._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                        style={{ backgroundColor: activityType.color }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {mobil.merek} {mobil.tipe} ({mobil.tahun})
                        </p>
                        <p className="text-sm text-gray-500">{mobil.noPol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{mobil.count}x</p>
                      <p className="text-sm text-gray-500">
                        Rp {mobil.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
                {topMobils[activityType.key].length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Tidak ada data
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
