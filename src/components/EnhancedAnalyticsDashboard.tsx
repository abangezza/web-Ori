// src/components/EnhancedAnalyticsDashboard.tsx
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Eye,
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Users,
  Car,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface AnalyticsData {
  mobilAnalytics: any[];
  customerJourney: any[];
  conversionRates: any;
  topPerformers: any;
  revenueProjections: any[];
}

const EnhancedAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [dateRange, setDateRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  const activityTypes = [
    { key: "viewDetails", label: "Detail Views", icon: Eye, color: "#3B82F6" },
    {
      key: "beliCash",
      label: "Cash Offers",
      icon: DollarSign,
      color: "#10B981",
    },
    {
      key: "simulasiKredit",
      label: "Credit Simulations",
      icon: CreditCard,
      color: "#F59E0B",
    },
    {
      key: "testDrives",
      label: "Test Drives",
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
  }, [selectedYear, selectedMonth, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth.toString() }),
        range: dateRange,
      });

      // Fetch enhanced analytics data
      const [mobilResponse, customerResponse, revenueResponse] =
        await Promise.all([
          fetch(`/api/analytics/mobil-enhanced?${params}`),
          fetch(`/api/analytics/customer-journey?${params}`),
          fetch(`/api/analytics/revenue-projections?${params}`),
        ]);

      const [mobilData, customerData, revenueData] = await Promise.all([
        mobilResponse.json(),
        customerResponse.json(),
        revenueResponse.json(),
      ]);

      if (mobilData.success && customerData.success && revenueData.success) {
        setAnalyticsData({
          mobilAnalytics: mobilData.data,
          customerJourney: customerData.data.journey,
          conversionRates: customerData.data.conversions,
          topPerformers: mobilData.topPerformers,
          revenueProjections: revenueData.data,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth.toString() }),
        format: "pdf",
      });

      const response = await fetch(`/api/analytics/pdf-report?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${selectedYear}${
        selectedMonth ? `-${selectedMonth}` : ""
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Gagal generate report");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Data Analytics Tidak Tersedia
        </h3>
        <p className="text-gray-500">Tidak dapat memuat data analytics</p>
      </div>
    );
  }

  const {
    mobilAnalytics,
    customerJourney,
    conversionRates,
    topPerformers,
    revenueProjections,
  } = analyticsData;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Insight mendalam tentang performa penjualan dan customer behavior
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value ? parseInt(e.target.value) : "")
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {months.map((month) => (
                <option key={month.label} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(
                  e.target.value as "week" | "month" | "quarter" | "year"
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobilAnalytics
                    .reduce((sum, item) => sum + (item.viewCount || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12% vs last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash Offers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobilAnalytics.reduce(
                    (sum, item) => sum + (item.cashOfferCount || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-green-600">+8% vs last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Credit Simulations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobilAnalytics.reduce(
                    (sum, item) => sum + (item.creditSimulationCount || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-red-600">-3% vs last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Test Drives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobilAnalytics.reduce(
                    (sum, item) => sum + (item.testDriveCount || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-green-600">+15% vs last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Customer Journey Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Journey Funnel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerJourney} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={100} />
              <Tooltip formatter={(value) => [value, "Customers"]} />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conversion Rates
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conversionRates}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {conversionRates.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Projections & Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueProjections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Actual Revenue"
            />
            <Area
              type="monotone"
              dataKey="projected"
              stackId="2"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              name="Projected Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Cars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Viewed Cars
          </h3>
          <div className="space-y-4">
            {topPerformers.mostViewed
              ?.slice(0, 5)
              .map((car: any, index: number) => (
                <div
                  key={car._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {car.merek} {car.tipe} ({car.tahun})
                      </p>
                      <p className="text-sm text-gray-500">
                        {car.noPol} • {formatCurrency(car.harga)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {car.viewCount}
                    </p>
                    <p className="text-sm text-gray-500">views</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Inquired Cars
          </h3>
          <div className="space-y-4">
            {topPerformers.mostInquired
              ?.slice(0, 5)
              .map((car: any, index: number) => (
                <div
                  key={car._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {car.merek} {car.tipe} ({car.tahun})
                      </p>
                      <p className="text-sm text-gray-500">
                        {car.noPol} • {formatCurrency(car.harga)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {car.totalInquiries}
                    </p>
                    <p className="text-sm text-gray-500">inquiries</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activity Heatmap - Top 10 Cars
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Car</th>
                <th className="text-center py-2 px-4">
                  <Eye className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center py-2 px-4">
                  <CreditCard className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center py-2 px-4">
                  <Calendar className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center py-2 px-4">
                  <DollarSign className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center py-2 px-4">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {mobilAnalytics.slice(0, 10).map((car: any, index: number) => {
                const score =
                  (car.viewCount || 0) +
                  (car.creditSimulationCount || 0) * 3 +
                  (car.testDriveCount || 0) * 5 +
                  (car.cashOfferCount || 0) * 7;
                return (
                  <tr key={car._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {car.merek} {car.tipe}
                        </p>
                        <p className="text-sm text-gray-500">
                          {car.tahun} • {car.noPol}
                        </p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div
                        className={`inline-block w-8 h-8 rounded text-white text-xs flex items-center justify-center ${
                          (car.viewCount || 0) > 10
                            ? "bg-blue-600"
                            : (car.viewCount || 0) > 5
                            ? "bg-blue-400"
                            : "bg-gray-300"
                        }`}
                      >
                        {car.viewCount || 0}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div
                        className={`inline-block w-8 h-8 rounded text-white text-xs flex items-center justify-center ${
                          (car.creditSimulationCount || 0) > 3
                            ? "bg-yellow-600"
                            : (car.creditSimulationCount || 0) > 1
                            ? "bg-yellow-400"
                            : "bg-gray-300"
                        }`}
                      >
                        {car.creditSimulationCount || 0}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div
                        className={`inline-block w-8 h-8 rounded text-white text-xs flex items-center justify-center ${
                          (car.testDriveCount || 0) > 2
                            ? "bg-red-600"
                            : (car.testDriveCount || 0) > 0
                            ? "bg-red-400"
                            : "bg-gray-300"
                        }`}
                      >
                        {car.testDriveCount || 0}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div
                        className={`inline-block w-8 h-8 rounded text-white text-xs flex items-center justify-center ${
                          (car.cashOfferCount || 0) > 1
                            ? "bg-green-600"
                            : (car.cashOfferCount || 0) > 0
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      >
                        {car.cashOfferCount || 0}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((score / 50) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{score}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Key Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  High Conversion Rate
                </p>
                <p className="text-sm text-gray-600">
                  Test drive to purchase conversion is 73% this month
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Popular Price Range</p>
                <p className="text-sm text-gray-600">
                  Cars priced 100-150M IDR get 40% more inquiries
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Cash Offer Trend</p>
                <p className="text-sm text-gray-600">
                  Average discount requested increased to 6.8%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Action Items
          </h3>
          <div className="space-y-4">
            <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-900">Follow up Hot Leads</p>
              <p className="text-sm text-blue-800">
                12 customers with test drives need immediate follow-up
              </p>
            </div>
            <div className="border border-yellow-200 bg-yellow-50 p-3 rounded-lg">
              <p className="font-medium text-yellow-900">Optimize Pricing</p>
              <p className="text-sm text-yellow-800">
                3 cars have high views but low inquiries - consider price
                adjustment
              </p>
            </div>
            <div className="border border-green-200 bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-900">Marketing Focus</p>
              <p className="text-sm text-green-800">
                SUV category showing 25% higher engagement - increase inventory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
